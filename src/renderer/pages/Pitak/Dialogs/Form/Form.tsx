// PitakFormDialog.tsx
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
  Square,
  Triangle,
  Circle,
  Calculator,
  Maximize,
  Minimize,
  AreaChart,
  RectangleCircle,
  ChevronDown,
  RulerIcon,
  TriangleRightIcon,
  CircleIcon,
  SquareIcon,
} from "lucide-react";
import type { PitakData } from "../../../../apis/pitak";
import type { BukidData } from "../../../../apis/bukid";
import bukidAPI from "../../../../apis/bukid";
import pitakAPI from "../../../../apis/pitak";
import { showError, showSuccess } from "../../../../utils/notification";
import BukidSelect from "../../../../components/Selects/Bukid";

interface PitakFormDialogProps {
  id?: number;
  mode: "add" | "edit";
  onClose: () => void;
  onSuccess?: (pitak: PitakData) => void;
}

interface FormData {
  bukidId: number | null;
  location: string;
  totalLuwang: number;
  status: "active" | "inactive" | "completed";
  notes: string;
  layoutType: "square" | "rectangle" | "triangle" | "circle" | "";
  sideLengths: {
    [key: string]: number;
  };
  areaSqm: number;
  measurementMethod: string;
}

interface CalculationResults {
  areaSqm: number;
  totalLuwang: number;
  hectareEquivalent: number;
}

// ============ MODULAR COMPONENTS ============

interface GeometryConfigProps {
  formData: FormData;
  errors: Record<string, string>;
  onLayoutTypeChange: (type: FormData["layoutType"]) => void;
  onSideLengthChange: (field: string, value: number) => void;
  onMeasurementMethodChange: (method: string) => void;
}

const SquareLayoutConfig: React.FC<GeometryConfigProps> = ({
  formData,
  errors,
  onSideLengthChange,
  onMeasurementMethodChange,
}) => {
  const [mode, setMode] = useState<"simplified" | "accurate">(
    formData.measurementMethod === "square_average" ? "accurate" : "simplified",
  );

  const handleModeChange = (newMode: "simplified" | "accurate") => {
    setMode(newMode);
    onMeasurementMethodChange(
      newMode === "simplified" ? "square_simplified" : "square_average",
    );
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => handleModeChange("simplified")}
          className={`flex-1 py-2 text-sm font-medium ${mode === "simplified" ? "bg-green-600 text-white" : "bg-gray-50 text-gray-700"}`}
        >
          Simplified (1 side)
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("accurate")}
          className={`flex-1 py-2 text-sm font-medium ${mode === "accurate" ? "bg-green-600 text-white" : "bg-gray-50 text-gray-700"}`}
        >
          Accurate (4 sides)
        </button>
      </div>

      {/* Simplified Mode */}
      {mode === "simplified" && (
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-700">
            Side Length (m) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0.01"
            max="10000"
            step="0.01"
            value={formData.sideLengths.side || ""}
            onChange={(e) =>
              onSideLengthChange("side", parseFloat(e.target.value) || 0)
            }
            className={`w-full px-3 py-2 rounded text-sm border ${
              errors.sideLengths ? "border-red-500" : "border-gray-300"
            } focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
            placeholder="Enter side length"
          />
          <p className="mt-1 text-xs text-gray-500">Area = side × side</p>
        </div>
      )}

      {/* Accurate Mode */}
      {mode === "accurate" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {["side1", "side2", "side3", "side4"].map((side) => (
              <div key={side}>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">
                  Side {side.charAt(4)} (m){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="10000"
                  step="0.01"
                  value={formData.sideLengths[side] || ""}
                  onChange={(e) =>
                    onSideLengthChange(side, parseFloat(e.target.value) || 0)
                  }
                  className={`w-full px-3 py-2 rounded text-sm border ${
                    errors[`side_${side}`]
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
                  placeholder={`Side ${side.charAt(4)}`}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Average side = (sum of 4 sides ÷ 4) → Area = average × average
          </p>
        </div>
      )}
    </div>
  );
};

const RectangleLayoutConfig: React.FC<GeometryConfigProps> = ({
  formData,
  errors,
  onSideLengthChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-700">
            Length (m) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0.01"
            max="10000"
            step="0.01"
            value={formData.sideLengths.length || ""}
            onChange={(e) =>
              onSideLengthChange("length", parseFloat(e.target.value) || 0)
            }
            className={`w-full px-3 py-2 rounded text-sm border ${
              errors.sideLengths ? "border-red-500" : "border-gray-300"
            } focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
            placeholder="Enter length"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5 text-gray-700">
            Width (m) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0.01"
            max="10000"
            step="0.01"
            value={formData.sideLengths.width || ""}
            onChange={(e) =>
              onSideLengthChange("width", parseFloat(e.target.value) || 0)
            }
            className={`w-full px-3 py-2 rounded text-sm border ${
              errors.sideLengths ? "border-red-500" : "border-gray-300"
            } focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
            placeholder="Enter width"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">Area = length × width</p>
    </div>
  );
};

const TriangleLayoutConfig: React.FC<GeometryConfigProps> = ({
  formData,
  errors,
  onSideLengthChange,
  onMeasurementMethodChange,
}) => {
  const [mode, setMode] = useState<"simplified" | "accurate">(
    formData.measurementMethod === "triangle_heron" ? "accurate" : "simplified",
  );

  const handleModeChange = (newMode: "simplified" | "accurate") => {
    setMode(newMode);
    onMeasurementMethodChange(
      newMode === "simplified" ? "triangle_simplified" : "triangle_heron",
    );
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => handleModeChange("simplified")}
          className={`flex-1 py-2 text-sm font-medium ${mode === "simplified" ? "bg-green-600 text-white" : "bg-gray-50 text-gray-700"}`}
        >
          Base + Height
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("accurate")}
          className={`flex-1 py-2 text-sm font-medium ${mode === "accurate" ? "bg-green-600 text-white" : "bg-gray-50 text-gray-700"}`}
        >
          3 Sides (Heron's)
        </button>
      </div>

      {/* Simplified Mode */}
      {mode === "simplified" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-700">
              Base (m) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              max="10000"
              step="0.01"
              value={formData.sideLengths.base || ""}
              onChange={(e) =>
                onSideLengthChange("base", parseFloat(e.target.value) || 0)
              }
              className={`w-full px-3 py-2 rounded text-sm border ${
                errors.sideLengths ? "border-red-500" : "border-gray-300"
              } focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
              placeholder="Enter base"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-gray-700">
              Height (m) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0.01"
              max="10000"
              step="0.01"
              value={formData.sideLengths.height || ""}
              onChange={(e) =>
                onSideLengthChange("height", parseFloat(e.target.value) || 0)
              }
              className={`w-full px-3 py-2 rounded text-sm border ${
                errors.sideLengths ? "border-red-500" : "border-gray-300"
              } focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
              placeholder="Enter height"
            />
          </div>
        </div>
      )}

      {/* Accurate Mode */}
      {mode === "accurate" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {["sideA", "sideB", "sideC"].map((side) => (
              <div key={side}>
                <label className="block text-xs font-medium mb-1.5 text-gray-700">
                  Side {side.charAt(4)} (m){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="10000"
                  step="0.01"
                  value={formData.sideLengths[side] || ""}
                  onChange={(e) =>
                    onSideLengthChange(side, parseFloat(e.target.value) || 0)
                  }
                  className={`w-full px-3 py-2 rounded text-sm border ${
                    errors[`side_${side}`]
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
                  placeholder={`Side ${side.charAt(4)}`}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Heron's formula: s = (a+b+c)/2, Area = √[s(s-a)(s-b)(s-c)]
          </p>
        </div>
      )}
    </div>
  );
};

const CircleLayoutConfig: React.FC<GeometryConfigProps> = ({
  formData,
  errors,
  onSideLengthChange,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium mb-1.5 text-gray-700">
          Radius (m) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="0.01"
          max="10000"
          step="0.01"
          value={formData.sideLengths.radius || ""}
          onChange={(e) =>
            onSideLengthChange("radius", parseFloat(e.target.value) || 0)
          }
          className={`w-full px-3 py-2 rounded text-sm border ${
            errors.sideLengths ? "border-red-500" : "border-gray-300"
          } focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none`}
          placeholder="Enter radius"
        />
        <p className="mt-1 text-xs text-gray-500">
          Area = π × radius² (π ≈ 3.14159)
        </p>
      </div>
    </div>
  );
};

const GeometryCalculator: React.FC<GeometryConfigProps> = (props) => {
  const { formData } = props;

  switch (formData.layoutType) {
    case "square":
      return <SquareLayoutConfig {...props} />;
    case "rectangle":
      return <RectangleLayoutConfig {...props} />;
    case "triangle":
      return <TriangleLayoutConfig {...props} />;
    case "circle":
      return <CircleLayoutConfig {...props} />;
    default:
      return (
        <div className="text-center py-8 text-gray-500">
          <AreaChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select a shape to configure geometry</p>
        </div>
      );
  }
};

const CalculationResultsDisplay: React.FC<{
  results: CalculationResults;
  layoutType: string;
  measurementMethod: string;
}> = ({ results, layoutType, measurementMethod }) => {
  if (!layoutType || results.areaSqm <= 0) return null;

  const methodLabels: Record<string, string> = {
    square_simplified: "Simplified (1 side)",
    square_average: "Accurate (4 sides average)",
    rectangle: "Length × Width",
    triangle_simplified: "Base × Height ÷ 2",
    triangle_heron: "Heron's Formula",
    circle: "π × radius²",
  };

  return (
    <div className="space-y-4">
      {/* Formula Info */}
      <div className="p-3 bg-gray-50 rounded border border-gray-200">
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-1">Calculation Method:</div>
          <div className="flex items-center gap-2">
            <Calculator className="w-3 h-3" />
            {methodLabels[measurementMethod] || "Standard formula"}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 p-3 rounded border border-green-200">
          <div className="text-center">
            <div className="text-lg font-bold text-green-700">
              {results.areaSqm.toFixed(2)}
            </div>
            <div className="text-xs mt-0.5 text-gray-600">Square Meters</div>
          </div>
        </div>
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-700">
              {results.totalLuwang.toFixed(2)}
            </div>
            <div className="text-xs mt-0.5 text-gray-600">
              LuWang
              <br />
              (500 m² per LuWang)
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded border border-blue-200">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-700">
              {results.hectareEquivalent.toFixed(4)}
            </div>
            <div className="text-xs mt-0.5 text-gray-600">
              Hectares
              <br />
              (10,000 m² per hectare)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============

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
    layoutType: "",
    sideLengths: {},
    areaSqm: 0,
    measurementMethod: "",
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
      hectareEquivalent: 0,
    });

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
      icon: RectangleCircle,
      description: "Length × Width",
    },
    {
      value: "triangle" as const,
      label: "Triangle",
      icon: TriangleRightIcon,
      description: "Base × Height / 2",
    },
    {
      value: "circle" as const,
      label: "Circle",
      icon: CircleIcon,
      description: "π × Radius²",
    },
  ];

  // Calculate area based on layout type and measurement method
  const calculateArea = (): number => {
    const { layoutType, sideLengths, measurementMethod } = formData;

    switch (layoutType) {
      case "square":
        if (measurementMethod === "square_simplified") {
          const side = sideLengths.side || 0;
          return side * side;
        } else {
          // Accurate mode: average of 4 sides
          const sides = ["side1", "side2", "side3", "side4"].map(
            (key) => sideLengths[key] || 0,
          );
          const validSides = sides.filter((s) => s > 0);
          if (validSides.length === 0) return 0;
          const avg = validSides.reduce((a, b) => a + b, 0) / validSides.length;
          return avg * avg;
        }

      case "rectangle":
        const length = sideLengths.length || 0;
        const width = sideLengths.width || 0;
        return length * width;

      case "triangle":
        if (measurementMethod === "triangle_simplified") {
          const base = sideLengths.base || 0;
          const height = sideLengths.height || 0;
          return (base * height) / 2;
        } else {
          // Heron's formula
          const a = sideLengths.sideA || 0;
          const b = sideLengths.sideB || 0;
          const c = sideLengths.sideC || 0;
          const s = (a + b + c) / 2;
          return Math.sqrt(s * (s - a) * (s - b) * (s - c));
        }

      case "circle":
        const radius = sideLengths.radius || 0;
        return Math.PI * radius * radius;

      default:
        return 0;
    }
  };

  // Calculate all results
  const calculateResults = (areaSqm: number) => {
    const totalLuwang = areaSqm / 500; // 1 LuWang = 500 sqm
    const hectareEquivalent = areaSqm / 10000; // 1 hectare = 10,000 sqm

    setCalculationResults({
      areaSqm,
      totalLuwang,
      hectareEquivalent,
    });

    // Update form data with calculated values
    setFormData((prev) => ({
      ...prev,
      totalLuwang,
      areaSqm,
    }));
  };

  // Handle form input changes
  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // If layoutType changes, reset sideLengths and measurementMethod
    if (field === "layoutType") {
      setFormData((prev) => ({
        ...prev,
        sideLengths: {},
        areaSqm: 0,
        measurementMethod: "",
      }));
      setCalculationResults({
        areaSqm: 0,
        totalLuwang: 0,
        hectareEquivalent: 0,
      });
    }
  };

  // Handle side length changes
  const handleSideLengthChange = (field: string, value: number) => {
    const numValue = value >= 0 ? value : 0;

    setFormData((prev) => ({
      ...prev,
      sideLengths: {
        ...prev.sideLengths,
        [field]: numValue,
      },
    }));

    // Recalculate area after a brief delay
    setTimeout(() => {
      const area = calculateArea();
      if (area > 0) {
        calculateResults(area);
      }
    }, 100);
  };

  // Handle measurement method change
  const handleMeasurementMethodChange = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      measurementMethod: method,
    }));
  };

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

            // Parse sideLengths if it exists
            let sideLengths = {};
            if (pitakData.sideLengths) {
              try {
                sideLengths =
                  typeof pitakData.sideLengths === "string"
                    ? JSON.parse(pitakData.sideLengths)
                    : pitakData.sideLengths;
              } catch (e) {
                console.error("Error parsing sideLengths:", e);
              }
            }

            // Determine measurement method from layout type
            let measurementMethod = "";
            if (pitakData.layoutType === "square") {
              // Check if we have 4 sides or 1 side
              const hasFourSides = ["side1", "side2", "side3", "side4"].every(
                (key) => sideLengths[key] && sideLengths[key] > 0,
              );
              measurementMethod = hasFourSides
                ? "square_average"
                : "square_simplified";
            } else if (pitakData.layoutType === "triangle") {
              // Check if we have 3 sides or base+height
              const hasThreeSides = ["sideA", "sideB", "sideC"].every(
                (key) => sideLengths[key] && sideLengths[key] > 0,
              );
              measurementMethod = hasThreeSides
                ? "triangle_heron"
                : "triangle_simplified";
            } else if (pitakData.layoutType === "rectangle") {
              measurementMethod = "rectangle";
            } else if (pitakData.layoutType === "circle") {
              measurementMethod = "circle";
            }

            setFormData({
              bukidId: pitakData.bukidId,
              location: pitakData.location || "",
              totalLuwang: pitakData.totalLuwang,
              status: pitakData.status,
              notes: pitakData.notes || "",
              layoutType: (pitakData.layoutType as any) || "",
              sideLengths,
              areaSqm: pitakData.areaSqm || 0,
              measurementMethod,
            });

            // Calculate initial results
            calculateResults(pitakData.areaSqm || 0);

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

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bukidId) {
      newErrors.bukidId = "Please select a farm (bukid)";
    }

    if (formData.layoutType && formData.areaSqm <= 0) {
      newErrors.areaSqm = "Please enter valid dimensions to calculate area";
    }

    // Validate side lengths based on layout type and measurement method
    if (formData.layoutType) {
      const requiredFields: string[] = [];

      switch (formData.layoutType) {
        case "square":
          if (formData.measurementMethod === "square_simplified") {
            requiredFields.push("side");
          } else {
            requiredFields.push("side1", "side2", "side3", "side4");
          }
          break;
        case "rectangle":
          requiredFields.push("length", "width");
          break;
        case "triangle":
          if (formData.measurementMethod === "triangle_simplified") {
            requiredFields.push("base", "height");
          } else {
            requiredFields.push("sideA", "sideB", "sideC");
          }
          break;
        case "circle":
          requiredFields.push("radius");
          break;
      }

      requiredFields.forEach((field) => {
        const value = formData.sideLengths[field];
        if (!value || value <= 0) {
          newErrors[`side_${field}`] = `${field} must be greater than 0`;
        } else if (value > 10000) {
          newErrors[`side_${field}`] = `${field} cannot exceed 10,000 meters`;
        }
      });
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Please fix the errors in the form");
      return;
    }

    try {
      setSubmitting(true);

      // Prepare sideLengths as JSON with measurement method
      const sideLengthsJson = JSON.stringify({
        ...formData.sideLengths,
        _measurementMethod: formData.measurementMethod,
      });

      // Prepare data for API
      const pitakData: any = {
        bukidId: formData.bukidId!,
        location: formData.location.trim() || null,
        totalLuwang: parseFloat(formData.totalLuwang.toFixed(2)),
        status: formData.status,
      };

      // Add geometry fields if layoutType is selected
      if (formData.layoutType) {
        pitakData.layoutType = formData.layoutType;
        pitakData.sideLengths = sideLengthsJson;
        pitakData.areaSqm = parseFloat(formData.areaSqm.toFixed(2));
      }

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
              {/* Summary Stats */}
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

                    {/* Plot Geometry Configuration */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AreaChart className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-semibold text-gray-900">
                          Plot Geometry
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

                        {/* Geometry Calculator Component */}
                        <GeometryCalculator
                          formData={formData}
                          errors={errors}
                          onLayoutTypeChange={(type) =>
                            handleChange("layoutType", type)
                          }
                          onSideLengthChange={handleSideLengthChange}
                          onMeasurementMethodChange={
                            handleMeasurementMethodChange
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Calculation Results */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-semibold text-gray-900">
                          Calculation Results
                        </h4>
                      </div>

                      <CalculationResultsDisplay
                        results={calculationResults}
                        layoutType={formData.layoutType}
                        measurementMethod={formData.measurementMethod}
                      />

                      {/* Conversion Notes */}
                      <div className="mt-4 p-3 rounded bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
                        <h3 className="text-xs font-medium mb-2 text-gray-700">
                          Conversion Notes
                        </h3>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>1 LuWang =</span>
                            <span className="font-medium">500 m²</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>1 Hectare =</span>
                            <span className="font-medium">10,000 m²</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>LuWang per Hectare =</span>
                            <span className="font-medium">20 LuWang</span>
                          </div>
                        </div>
                      </div>
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
                            <p className="mt-1 text-xs text-gray-500">
                              Use descriptive location names to help workers
                              find the plot easily
                            </p>
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
