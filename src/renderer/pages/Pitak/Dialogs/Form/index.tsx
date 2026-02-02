// Complete Refactored PitakFormDialog.tsx with Traditional Measurement System (NO HECTARE)
import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  MapPin,
  TreePalm,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Calendar,
  Hash,
  FileText,
  LandPlot,
  Ruler,
  Grid3x3,
  SquareIcon,
  RectangleHorizontal,
  Triangle,
  CircleIcon,
  Calculator,
  AreaChart,
} from "lucide-react";

// Import Traditional Measurement Components and Utilities
import { TraditionalMeasurement, type TriangleMode } from "./utils/measurement";
import { useMeasurementValidation } from "./hooks/useMeasurementValidation";
import { useAuditLogger } from "./hooks/useAuditLogger";

// Modular Form Components
import SquareForm from "./components/forms/SquareForm";
import RectangleForm from "./components/forms/RectangleForm";
import TriangleForm from "./components/forms/TriangleForm";
import CircleForm from "./components/forms/CircleForm";
import type { PitakData } from "../../../../apis/pitak";
import type { BukidData } from "../../../../apis/bukid";
import bukidAPI from "../../../../apis/bukid";
import pitakAPI from "../../../../apis/pitak";
import { showError, showSuccess } from "../../../../utils/notification";
import BukidSelect from "../../../../components/Selects/Bukid";
import ResultsDisplay from "./components/ResultDisplay";

interface PitakFormDialogProps {
  id?: number;
  mode: "add" | "edit";
  onClose: () => void;
  onSuccess?: (pitak: PitakData) => void;
}

// Updated FormData interface WITHOUT hectare
interface FormData {
  bukidId: number | null;
  location: string;
  totalLuwang: number;
  status: "active" | "inactive" | "completed";
  notes: string;

  // Traditional Measurement Fields WITHOUT hectare
  layoutType: "square" | "rectangle" | "triangle" | "circle" | "";
  buholInputs: Record<string, number>;
  triangleMode?: "base_height" | "three_sides";
  measurementMethod: string;
  areaSqm: number;
}

// Calculation results WITHOUT hectare
interface CalculationResults {
  areaSqm: number;
  totalLuwang: number;
}

// Layout type options with icons
const layoutOptions = [
  {
    value: "square" as const,
    label: "Square",
    icon: SquareIcon,
    description: "Equal sides",
  },
  {
    value: "rectangle" as const,
    label: "Rectangle",
    icon: RectangleHorizontal,
    description: "Length × Width",
  },
  {
    value: "triangle" as const,
    label: "Triangle",
    icon: Triangle,
    description: "Base × Height / 2 or 3 Sides",
  },
  {
    value: "circle" as const,
    label: "Circle",
    icon: CircleIcon,
    description: "π × Radius²",
  },
];

const PitakFormDialog: React.FC<PitakFormDialogProps> = ({
  id,
  mode,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    bukidId: null,
    location: "",
    totalLuwang: 0,
    status: "active",
    notes: "",

    // Traditional Measurement Fields WITHOUT hectare
    layoutType: "",
    buholInputs: {},
    triangleMode: "base_height",
    measurementMethod: "",
    areaSqm: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bukids, setBukids] = useState<BukidData[]>([]);
  const [pitak, setPitak] = useState<PitakData | null>(null);
  const [capacityInfo, setCapacityInfo] = useState<{
    remaining: number;
    utilization: number;
  } | null>(null);
  const [calculationResults, setCalculationResults] =
    useState<CalculationResults>({
      areaSqm: 0,
      totalLuwang: 0,
    });

  // Initialize custom hooks
  const { validateShapeInputs, clearError, clearAllErrors } =
    useMeasurementValidation();
  const { logMeasurement, logFormSubmission } = useAuditLogger();

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch bukids for dropdown
        const bukidResponse = await bukidAPI.getAll({ limit: 1000 });
        if (bukidResponse.status && bukidResponse.data?.bukids) {
          setBukids(bukidResponse.data.bukids);
        }

        // Fetch pitak data if in edit mode
        if (mode === "edit" && id) {
          const pitakId = id;
          const response = await pitakAPI.getPitakById(pitakId);

          if (response.status) {
            const pitakData = response.data;
            setPitak(pitakData);

            // Parse existing sideLengths if it exists
            let buholInputs = {};
            let triangleMode: "base_height" | "three_sides" = "base_height";
            let measurementMethod = "";

            if (pitakData.sideLengths) {
              try {
                const sideLengthsData =
                  typeof pitakData.sideLengths === "string"
                    ? JSON.parse(pitakData.sideLengths)
                    : pitakData.sideLengths;

                // Extract traditional measurement data
                if (sideLengthsData.buholInputs) {
                  buholInputs = sideLengthsData.buholInputs;
                } else if (sideLengthsData.sideLengths) {
                  // Convert existing modern measurements to traditional
                  const layoutType = pitakData.layoutType || "square";
                  buholInputs = convertToBuholInputs(
                    layoutType,
                    sideLengthsData.sideLengths,
                  );
                }

                if (sideLengthsData.measurementMethod) {
                  measurementMethod = sideLengthsData.measurementMethod;
                }

                if (sideLengthsData.triangleMode) {
                  triangleMode = sideLengthsData.triangleMode;
                }
              } catch (e) {
                console.error("Error parsing sideLengths:", e);
              }
            }

            setFormData({
              bukidId: pitakData.bukidId,
              location: pitakData.location || "",
              totalLuwang: pitakData.totalLuwang,
              status: pitakData.status,
              notes: pitakData.notes || "",
              layoutType: (pitakData.layoutType as any) || "",
              buholInputs,
              triangleMode,
              measurementMethod,
              areaSqm: pitakData.areaSqm || 0,
            });

            // Calculate initial results if we have inputs
            if (Object.keys(buholInputs).length > 0 && pitakData.layoutType) {
              const results = TraditionalMeasurement.calculateArea(
                pitakData.layoutType as any,
                buholInputs,
                triangleMode,
              );
              setCalculationResults(results);
            }

            // Fetch capacity info
            if (pitakData.stats) {
              setCapacityInfo({
                remaining:
                  pitakData.totalLuwang -
                  (pitakData.stats.assignments.totalLuWangAssigned || 0),
                utilization: pitakData.stats.utilizationRate || 0,
              });
            }
          } else {
            showError("Pitak not found");
            onClose();
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        showError("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, mode, onClose]);

  // Helper function to convert existing modern measurements to traditional
  const convertToBuholInputs = (layoutType: string, sideLengths: any) => {
    const buholInputs: Record<string, number> = {};

    switch (layoutType) {
      case "square":
        if (sideLengths.side) {
          buholInputs.side = TraditionalMeasurement.metersToBuhol(
            sideLengths.side,
          );
        }
        break;
      case "rectangle":
        if (sideLengths.length && sideLengths.width) {
          buholInputs.length = TraditionalMeasurement.metersToBuhol(
            sideLengths.length,
          );
          buholInputs.width = TraditionalMeasurement.metersToBuhol(
            sideLengths.width,
          );
        }
        break;
      case "triangle":
        if (sideLengths.base && sideLengths.height) {
          buholInputs.base = TraditionalMeasurement.metersToBuhol(
            sideLengths.base,
          );
          buholInputs.height = TraditionalMeasurement.metersToBuhol(
            sideLengths.height,
          );
        } else if (
          sideLengths.sideA &&
          sideLengths.sideB &&
          sideLengths.sideC
        ) {
          buholInputs.sideA = TraditionalMeasurement.metersToBuhol(
            sideLengths.sideA,
          );
          buholInputs.sideB = TraditionalMeasurement.metersToBuhol(
            sideLengths.sideB,
          );
          buholInputs.sideC = TraditionalMeasurement.metersToBuhol(
            sideLengths.sideC,
          );
        }
        break;
      case "circle":
        if (sideLengths.radius) {
          buholInputs.radius = TraditionalMeasurement.metersToBuhol(
            sideLengths.radius,
          );
        }
        break;
    }

    return buholInputs;
  };

  // Handle form input changes
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      clearError(field);
    }

    // If layoutType changes, reset buholInputs and measurementMethod
    if (field === "layoutType") {
      setFormData((prev) => ({
        ...prev,
        buholInputs: {},
        measurementMethod: "",
        areaSqm: 0,
        totalLuwang: 0,
      }));
      setCalculationResults({
        areaSqm: 0,
        totalLuwang: 0,
      });
      clearAllErrors();
    }
  };

  // Handle buhol input changes

  const handleBuholInputChange = (field: string, value: number) => {
    // Ensure integer values
    const intValue = Math.max(0, Math.floor(value));

    const updatedInputs = {
      ...formData.buholInputs,
      [field]: intValue,
    };

    setFormData((prev) => ({
      ...prev,
      buholInputs: updatedInputs,
    }));

    // Clear error for this field
    if (errors[field]) {
      clearError(field);
    }

    // Validate inputs
    const validationErrors = validateShapeInputs(
      formData.layoutType,
      updatedInputs,
      formData.triangleMode,
    );

    // Update errors
    const newErrors = { ...errors };
    Object.keys(validationErrors).forEach((key) => {
      if (validationErrors[key]) {
        newErrors[key] = validationErrors[key];
      } else {
        delete newErrors[key];
      }
    });
    setErrors(newErrors);

    // Calculate if layout type is set and no validation errors
    if (formData.layoutType && Object.keys(validationErrors).length === 0) {
      try {
        const results = TraditionalMeasurement.calculateArea(
          formData.layoutType,
          updatedInputs,
          formData.triangleMode,
        );

        handleCalculation(results);
      } catch (error) {
        console.error("Calculation error:", error);
      }
    } else {
      // Reset calculation results if invalid
      setCalculationResults({
        areaSqm: 0,
        totalLuwang: 0,
      });
    }
  };

  // Update the handleCalculation function:
  const handleCalculation = (results: CalculationResults) => {
    setCalculationResults(results);

    // Update form data with calculated values
    setFormData((prev) => ({
      ...prev,
      areaSqm: results.areaSqm,
      totalLuwang: results.totalLuwang,
      measurementMethod: TraditionalMeasurement.getMeasurementMethod(
        prev.layoutType,
        prev.triangleMode,
      ),
    }));

    // Log the measurement
    logMeasurement(
      formData.layoutType,
      formData.buholInputs,
      results,
      TraditionalMeasurement.getMeasurementMethod(
        formData.layoutType,
        formData.triangleMode,
      ),
    );
  };

  // Handle triangle mode change
  const handleTriangleModeChange = (mode: "base_height" | "three_sides") => {
    setFormData((prev) => ({
      ...prev,
      triangleMode: mode,
      buholInputs: {},
    }));
    setCalculationResults({
      areaSqm: 0,
      totalLuwang: 0,
    });
    clearAllErrors();
  };

  // Render the appropriate geometry form component
  const renderGeometryForm = () => {
    switch (formData.layoutType) {
      case "square":
        return (
          <SquareForm
            inputs={formData.buholInputs}
            errors={errors}
            onChange={handleBuholInputChange}
            onCalculate={handleCalculation}
          />
        );
      case "rectangle":
        return (
          <RectangleForm
            inputs={formData.buholInputs}
            errors={errors}
            onChange={handleBuholInputChange}
            onCalculate={handleCalculation}
          />
        );
      case "triangle":
        return (
          <div className="space-y-4">
            {/* Triangle Mode Toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => handleTriangleModeChange("base_height")}
                className={`flex-1 py-2 text-sm font-medium ${
                  formData.triangleMode === "base_height"
                    ? "bg-green-600 text-white"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                Base + Height
              </button>
              <button
                type="button"
                onClick={() => handleTriangleModeChange("three_sides")}
                className={`flex-1 py-2 text-sm font-medium ${
                  formData.triangleMode === "three_sides"
                    ? "bg-green-600 text-white"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                3 Sides (Heron's)
              </button>
            </div>

            {/* We'll use the updated TriangleForm with proper props */}
            {/* Note: We need to update TriangleForm to accept triangleMode prop */}
            <TriangleForm
              inputs={formData.buholInputs}
              errors={errors}
              onChange={handleBuholInputChange}
              onCalculate={handleCalculation}
              triangleMode={formData.triangleMode as TriangleMode}
              onTriangleModeChange={handleTriangleModeChange}
            />
          </div>
        );
      case "circle":
        return (
          <CircleForm
            inputs={formData.buholInputs}
            errors={errors}
            onChange={handleBuholInputChange}
            onCalculate={handleCalculation}
          />
        );
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <AreaChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Select a plot shape to configure</p>
          </div>
        );
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bukidId) {
      newErrors.bukidId = "Please select a farm (bukid)";
    }

    if (formData.layoutType && !formData.measurementMethod) {
      newErrors.measurementMethod =
        "Please enter valid dimensions to calculate area";
    }

    // Validate traditional measurement inputs
    if (formData.layoutType) {
      const shapeErrors = validateShapeInputs(
        formData.layoutType,
        formData.buholInputs,
        formData.triangleMode,
      );
      Object.assign(newErrors, shapeErrors);
    }

    if (formData.location.length > 255) {
      newErrors.location = "Location must be less than 255 characters";
    }

    if (formData.notes.length > 1000) {
      newErrors.notes = "Notes must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update the submit handler WITHOUT hectare
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Please fix the errors in the form");
      return;
    }

    try {
      setSubmitting(true);

      // Prepare audit data WITHOUT hectare
      const auditData = logFormSubmission(formData, {
        layoutType: formData.layoutType,
        buholInputs: formData.buholInputs,
        results: calculationResults,
        method: formData.measurementMethod,
      });

      // Prepare sideLengths JSON including traditional measurements WITHOUT hectare
      const sideLengthsJson = JSON.stringify({
        buholInputs: formData.buholInputs,
        measurementMethod: formData.measurementMethod,
        triangleMode: formData.triangleMode,
        auditId: auditData.timestamp,
        conversionFactors: {
          buholToMeters: TraditionalMeasurement.BUHOL_TO_METERS,
          taliToBuhol: TraditionalMeasurement.TALI_TO_BUHOL,
          luwangToSqm: TraditionalMeasurement.LUWANG_TO_SQM,
        },
      });

      // Prepare data for API WITHOUT hectare
      const pitakData: any = {
        bukidId: formData.bukidId!,
        location: formData.location.trim() || null,
        totalLuwang: parseFloat(formData.totalLuwang.toFixed(2)),
        status: formData.status,
        layoutType: formData.layoutType,
        sideLengths: sideLengthsJson,
        areaSqm: parseFloat(formData.areaSqm.toFixed(2)),
        measurementMethod: formData.measurementMethod,
        traditionalSystemUsed: true,
      };

      // Add notes if available
      if (formData.notes.trim()) {
        pitakData.notes = formData.notes.trim();
      }

      let response;

      if (mode === "add") {
        // Create new pitak with validation
        response = await pitakAPI.validateAndCreate(pitakData);
      } else if (mode === "edit" && id) {
        // Update existing pitak with validation
        response = await pitakAPI.validateAndUpdate(id, pitakData);
      }

      if (response?.status) {
        showSuccess(
          mode === "add"
            ? "Pitak created successfully!"
            : "Pitak updated successfully!",
        );

        if (onSuccess && response.data) {
          onSuccess(response.data);
        }

        onClose();
      } else {
        throw new Error(response?.message || "Failed to save pitak");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      showError(error.message || "Failed to save pitak");
    } finally {
      setSubmitting(false);
    }
  };

  // Get selected bukid details
  const selectedBukid = bukids.find((b) => b.id === formData.bukidId);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl shadow-lg border border-gray-200 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <LandPlot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {mode === "add" ? "Add New Pitak" : "Edit Pitak"}
              </h3>
              <div className="text-xs text-gray-600 flex items-center gap-2">
                {mode === "edit" && pitak && (
                  <>
                    <span>ID: #{pitak.id}</span>
                    <span>•</span>
                    <span>Area: {pitak.areaSqm?.toFixed(2) || 0} m²</span>
                    <span>•</span>
                  </>
                )}
                <span>
                  {mode === "add" ? "Create new plot" : "Edit existing plot"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
            title="Close"
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-130px)] p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">
                {mode === "add" ? "Loading form..." : "Loading pitak data..."}
              </p>
            </div>
          ) : (
            <>
              {/* Summary Stats WITHOUT hectare */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <TreePalm className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Farm</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {selectedBukid?.name || "Not selected"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <Grid3x3 className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Plot Shape</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formData.layoutType
                          ? formData.layoutType.charAt(0).toUpperCase() +
                            formData.layoutType.slice(1)
                          : "Not set"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Ruler className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Area</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {calculationResults.areaSqm > 0
                          ? `${calculationResults.areaSqm.toFixed(2)} m²`
                          : "0 m²"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Hash className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">LuWang</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {calculationResults.totalLuwang.toFixed(2)} LuWang
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Farm Selection */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TreePalm className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-semibold text-gray-900">
                          Farm Selection
                        </h4>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium mb-1.5 text-gray-700">
                            Select Farm (Bukid){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <BukidSelect
                              value={formData.bukidId}
                              onChange={async (bukidId: number | null) => {
                                if (bukidId) {
                                  const response =
                                    await bukidAPI.getById(bukidId);
                                  if (response.data.bukid.id) {
                                    handleChange(
                                      "bukidId",
                                      response.data.bukid.id,
                                    );
                                  }
                                }
                              }}
                              placeholder="Search or select a farm..."
                            />
                            {errors.bukidId && (
                              <p className="mt-1 text-xs flex items-center gap-1 text-red-600">
                                <AlertCircle className="w-3 h-3" />
                                {errors.bukidId}
                              </p>
                            )}
                          </div>
                        </div>

                        {selectedBukid && (
                          <div className="bg-blue-50 p-3 rounded border border-blue-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <TreePalm className="w-3.5 h-3.5 text-blue-600" />
                                  <h3 className="text-xs font-semibold text-gray-900">
                                    {selectedBukid.name}
                                  </h3>
                                </div>
                                <div className="text-xs text-gray-600 space-y-1">
                                  {selectedBukid.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {selectedBukid.location}
                                    </div>
                                  )}
                                  <div className="mt-2">
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                        selectedBukid.status === "active"
                                          ? "bg-green-100 text-green-800 border border-green-200"
                                          : selectedBukid.status === "inactive"
                                            ? "bg-gray-100 text-gray-800 border border-gray-200"
                                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                      }`}
                                    >
                                      {selectedBukid
                                        ?.status!.charAt(0)
                                        .toUpperCase() +
                                        selectedBukid?.status!.slice(1)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleChange("bukidId", null)}
                                className="p-1 rounded hover:bg-white transition-colors text-gray-500"
                                title="Remove"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Traditional Plot Geometry Configuration WITHOUT hectare */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AreaChart className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-semibold text-gray-900">
                          Traditional Plot Measurement
                        </h4>
                      </div>
                      <div className="space-y-4">
                        {/* Layout Type Selection */}
                        <div>
                          <label className="block text-xs font-medium mb-2 text-gray-700">
                            Plot Shape <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {layoutOptions.map((option) => {
                              const Icon = option.icon;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() =>
                                    handleChange("layoutType", option.value)
                                  }
                                  className={`p-3 rounded border flex flex-col items-center justify-center gap-1 ${
                                    formData.layoutType === option.value
                                      ? "ring-2 ring-green-500 ring-offset-1 bg-green-50"
                                      : "border-gray-300 hover:border-green-500"
                                  } transition-all`}
                                >
                                  <Icon
                                    className={`w-4 h-4 ${formData.layoutType === option.value ? "text-green-600" : "text-gray-400"}`}
                                  />
                                  <span
                                    className={`text-xs font-medium ${
                                      formData.layoutType === option.value
                                        ? "text-green-700"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {option.label}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {option.description}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Traditional Measurement System Info WITHOUT hectare */}
                        <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                          <div className="text-xs">
                            <div className="font-medium text-yellow-800 mb-1">
                              Traditional Measurement System
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="p-1 bg-white rounded border">
                                <div className="text-gray-600">1 buhol =</div>
                                <div className="font-semibold">50 meters</div>
                              </div>
                              <div className="p-1 bg-white rounded border">
                                <div className="text-gray-600">1 tali =</div>
                                <div className="font-semibold">10 buhol</div>
                              </div>
                              <div className="p-1 bg-white rounded border">
                                <div className="text-gray-600">1 luwang =</div>
                                <div className="font-semibold">500 m²</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Geometry Form Component */}
                        {renderGeometryForm()}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Calculation Results WITHOUT hectare */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-semibold text-gray-900">
                          Calculation Results
                        </h4>
                      </div>

                      <ResultsDisplay
                        results={calculationResults}
                        layoutType={formData.layoutType}
                        measurementMethod={formData.measurementMethod}
                        buholInputs={formData.buholInputs}
                      />
                    </div>

                    {/* Location & Status */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-semibold text-gray-900">
                          Location & Status
                        </h4>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label
                            className="block text-xs font-medium mb-1.5 text-gray-700"
                            htmlFor="location"
                          >
                            Specific Location (Optional)
                          </label>
                          <div className="relative">
                            <input
                              id="location"
                              type="text"
                              value={formData.location}
                              onChange={(e) =>
                                handleChange("location", e.target.value)
                              }
                              className={`w-full px-3 py-2 rounded text-sm border ${
                                errors.location
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
                              placeholder="E.g., 'Northwest corner', 'Section A-3', 'Near the irrigation pump'"
                            />
                            {errors.location && (
                              <p className="mt-1 text-xs flex items-center gap-1 text-red-600">
                                <AlertCircle className="w-3 h-3" />
                                {errors.location}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Selection */}
                        <div>
                          <label className="block text-xs font-medium mb-2 text-gray-700">
                            Plot Status <span className="text-red-500">*</span>
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {(["active", "inactive", "completed"] as const).map(
                              (status) => (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => handleChange("status", status)}
                                  className={`p-3 rounded border flex flex-col items-center justify-center gap-1 ${
                                    formData.status === status
                                      ? "ring-2 ring-green-500 ring-offset-1"
                                      : "border-gray-300 hover:border-green-500"
                                  } transition-all`}
                                >
                                  {status === "active" && (
                                    <CheckCircle
                                      className={`w-4 h-4 ${formData.status === status ? "text-green-600" : "text-gray-400"}`}
                                    />
                                  )}
                                  {status === "inactive" && (
                                    <XCircle
                                      className={`w-4 h-4 ${formData.status === status ? "text-gray-600" : "text-gray-400"}`}
                                    />
                                  )}
                                  {status === "completed" && (
                                    <Calendar
                                      className={`w-4 h-4 ${formData.status === status ? "text-yellow-600" : "text-gray-400"}`}
                                    />
                                  )}
                                  <span
                                    className={`text-xs font-medium ${
                                      formData.status === status
                                        ? status === "active"
                                          ? "text-green-700"
                                          : status === "inactive"
                                            ? "text-gray-700"
                                            : "text-yellow-700"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {status.charAt(0).toUpperCase() +
                                      status.slice(1)}
                                  </span>
                                </button>
                              ),
                            )}
                          </div>
                          <div className="mt-3 text-xs text-gray-600 space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                              <div className="p-2 rounded bg-green-50">
                                <div className="font-medium text-green-700 mb-0.5">
                                  Active
                                </div>
                                <div>Available for new assignments</div>
                              </div>
                              <div className="p-2 rounded bg-gray-50">
                                <div className="font-medium text-gray-700 mb-0.5">
                                  Inactive
                                </div>
                                <div>Not available for assignments</div>
                              </div>
                              <div className="p-2 rounded bg-yellow-50">
                                <div className="font-medium text-yellow-700 mb-0.5">
                                  Completed
                                </div>
                                <div>Completed harvesting cycle</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-semibold text-gray-900">
                          Additional Notes
                        </h4>
                      </div>
                      <div>
                        <textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) =>
                            handleChange("notes", e.target.value)
                          }
                          className={`w-full px-3 py-2 rounded text-sm border ${
                            errors.notes ? "border-red-500" : "border-gray-300"
                          } focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
                          placeholder="Enter any additional notes about this pitak... 
• Soil type and quality
• Special conditions or requirements
• Landmarks for easy identification
• Previous crop history
• Any equipment requirements"
                          rows={4}
                        />
                        {errors.notes && (
                          <p className="mt-1 text-xs flex items-center gap-1 text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            {errors.notes}
                          </p>
                        )}
                        <div className="mt-2 flex justify-between items-center">
                          <p className="text-xs text-gray-500">
                            Add detailed information to help manage the plot
                            effectively
                          </p>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${
                              formData.notes.length > 1000
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {formData.notes.length}/1000
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>
                Fields marked with <span className="text-red-500">*</span> are
                required
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  (formData.layoutType !== "" && !calculationResults.areaSqm)
                }
                className="px-3 py-1.5 rounded text-sm font-medium bg-green-600 hover:bg-green-700 text-white flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    {mode === "add" ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    {mode === "add" ? "Create Pitak" : "Update Pitak"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PitakFormDialog;
