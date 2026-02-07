// components/Session/Dialogs/DuplicateSessionDialog.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Calendar,
  AlertCircle,
  Loader,
  CheckCircle,
  Info,
  Save,
} from "lucide-react";
import sessionAPI from "../../../apis/session";
import { dialogs } from "../../../utils/dialogs";
import { showSuccess, showError } from "../../../utils/notification";

interface DuplicateSessionDialogProps {
  id: number;
  originalName: string;
  originalYear?: number;
  onClose: () => void;
  onSuccess?: (session: any) => void;
}

interface FormData {
  name: string;
  year: number;
  copyBukids: boolean;
  copyAssignments: boolean;
}

const DuplicateSessionDialog: React.FC<DuplicateSessionDialogProps> = ({
  id,
  originalName,
  originalYear,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState<FormData>({
    name: `${originalName} - Copy`,
    year: originalYear || new Date().getFullYear(),
    copyBukids: true,
    copyAssignments: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    isUnique: boolean;
    message: string;
  }>({
    isValid: false,
    isUnique: false,
    message: "",
  });

  // Initial validation on mount
  useEffect(() => {
    validateName(formData.name);
  }, []);

  // Handle form input changes with validation
  const handleChange = async (
    field: keyof FormData,
    value: string | number | boolean,
  ) => {
    const newFormData = {
      ...formData,
      [field]: value,
    };
    setFormData(newFormData);

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Validate name in real-time
    if (
      field === "name" &&
      typeof value === "string" &&
      value.trim().length > 0
    ) {
      await validateName(value);
    }
  };

  const validateName = async (name: string) => {
    try {
      setValidating(true);
      // Validate format
      const formatValidation = await sessionAPI.validateName(name);

      // Check uniqueness
      if (formatValidation.data) {
        const uniqueValidation = await sessionAPI.checkNameExists(
          name,
          formData.year,
        );

        setValidationState({
          isValid: formatValidation.data,
          isUnique: uniqueValidation.status ? uniqueValidation.data : true,
          message: formatValidation.data
            ? uniqueValidation.status
              ? uniqueValidation.data
                ? "Name is available"
                : "Name already exists for this year"
              : "Could not verify uniqueness"
            : formatValidation.message,
        });
      } else {
        setValidationState({
          isValid: formatValidation.data,
          isUnique: false,
          message: formatValidation.message,
        });
      }
    } catch (error) {
      console.error("Validation error:", error);
      setValidationState({
        isValid: false,
        isUnique: true,
        message: "Error validating name",
      });
    } finally {
      setValidating(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Session name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    if (!formData.year || formData.year < 2000 || formData.year > 2100) {
      newErrors.year = "Year must be between 2000 and 2100";
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

    // Final uniqueness check
    try {
      const uniqueValidation = await sessionAPI.checkNameExists(
        formData.name.trim(),
        formData.year,
      );

      if (uniqueValidation.status && !uniqueValidation.data) {
        showError("Session with this name and year already exists");
        return;
      }
    } catch (error) {
      console.error("Error checking name uniqueness:", error);
      // Continue anyway if check fails
    }

    if (
      !(await dialogs.confirm({
        title: "Duplicate Session",
        message: `Are you sure you want to duplicate "${originalName}"? This will create a new session${
          formData.copyBukids ? " with bukids" : ""
        }${formData.copyAssignments ? " and assignments" : ""}.`,
      }))
    )
      return;

    try {
      setSubmitting(true);

      const response = await sessionAPI.duplicate(
        id,
        formData.name.trim(),
        formData.year,
        formData.copyBukids,
        formData.copyAssignments,
      );

      if (response?.status && response.data) {
        showSuccess("Session duplicated successfully!");

        if (onSuccess) {
          onSuccess(response.data);
        }
        onClose();
      } else {
        throw new Error(response?.message || "Failed to duplicate session");
      }
    } catch (error: any) {
      console.error("Error duplicating session:", error);
      showError(error.message || "Failed to duplicate session");
    } finally {
      setSubmitting(false);
    }
  };

  // Generate year options (current year ± 10 years)
  const yearOptions = Array.from(
    { length: 21 },
    (_, i) => currentYear - 10 + i,
  );

  // Check if form is ready for submission
  const isFormValid = () => {
    if (!formData.name.trim()) return false;
    if (errors.name || errors.year) return false;
    if (!validationState.isValid || !validationState.isUnique) return false;
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <Copy className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Duplicate Session
              </h3>
              <div className="text-xs text-gray-600">
                Create a copy of "{originalName}"
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              if (
                !(await dialogs.confirm({
                  title: "Close Dialog",
                  message:
                    "Are you sure you want to close? Unsaved changes will be lost.",
                }))
              )
                return;
              onClose();
            }}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
            title="Close"
            disabled={submitting}
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5 text-gray-700"
                htmlFor="name"
              >
                New Session Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full px-3 py-2 rounded text-sm border ${
                    errors.name
                      ? "border-red-500"
                      : formData.name &&
                          validationState.isValid &&
                          validationState.isUnique
                        ? "border-green-500"
                        : "border-gray-300"
                  } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none pr-10`}
                  placeholder="Enter new session name"
                  required
                  disabled={submitting}
                  maxLength={100}
                />
                {validating && (
                  <div className="absolute right-3 top-2.5">
                    <Loader className="w-3.5 h-3.5 animate-spin text-gray-400" />
                  </div>
                )}
              </div>

              {/* Validation Feedback */}
              {formData.name && !validating && (
                <div className="mt-2 flex items-center gap-1.5">
                  {validationState.isValid && validationState.isUnique ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs text-green-600">
                        {validationState.message}
                      </span>
                    </>
                  ) : validationState.message ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs text-amber-600">
                        {validationState.message}
                      </span>
                    </>
                  ) : null}
                </div>
              )}

              {errors.name && (
                <p className="mt-1 text-xs flex items-center gap-1 text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Year Field */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5 text-gray-700"
                htmlFor="year"
              >
                Year <span className="text-red-500">*</span>
              </label>
              <select
                id="year"
                value={formData.year}
                onChange={(e) => handleChange("year", parseInt(e.target.value))}
                className={`w-full px-3 py-2 rounded text-sm border ${
                  errors.year ? "border-red-500" : "border-gray-300"
                } focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none`}
                disabled={submitting}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.year && (
                <p className="mt-1 text-xs flex items-center gap-1 text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {errors.year}
                </p>
              )}
            </div>

            {/* Copy Options */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-medium text-gray-700">
                Copy Options
              </label>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.copyBukids}
                    onChange={(e) =>
                      handleChange("copyBukids", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    disabled={submitting}
                  />
                  <span className="text-sm text-gray-700">
                    Copy Bukids (farm plots)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.copyAssignments}
                    onChange={(e) =>
                      handleChange("copyAssignments", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    disabled={submitting}
                  />
                  <span className="text-sm text-gray-700">
                    Copy Worker Assignments
                  </span>
                </label>
              </div>
            </div>

            {/* Information Section */}
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-600 mt-0.5" />
                <div className="text-xs text-purple-700">
                  <p className="font-medium mb-1">What will be duplicated?</p>
                  <ul className="list-disc list-inside mt-1 ml-1">
                    <li>Session information (name, dates, season type)</li>
                    {formData.copyBukids && (
                      <li>All bukids (farm plots) and pitaks</li>
                    )}
                    {formData.copyAssignments && (
                      <li>Worker assignments and schedules</li>
                    )}
                    <li>Session settings and configurations</li>
                  </ul>
                  <p className="mt-2 text-purple-600 font-medium">
                    Note: The new session will be created as "Active"
                  </p>
                </div>
              </div>
            </div>
          </form>
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
                onClick={async () => {
                  if (
                    !(await dialogs.confirm({
                      title: "Close Dialog",
                      message:
                        "Are you sure you want to close? Unsaved changes will be lost.",
                    }))
                  )
                    return;
                  onClose();
                }}
                className="px-3 py-1.5 rounded text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={submitting || !isFormValid()}
                className="px-3 py-1.5 rounded text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    Duplicating...
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Duplicate Session
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

export default DuplicateSessionDialog;
