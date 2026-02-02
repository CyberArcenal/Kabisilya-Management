// components/Dialogs/AddPlotDialog.tsx
import React, { useState, useEffect } from 'react';
import { X, Layers, MapPin, Hash, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import pitakAPI from '../../../apis/pitak';
import { showSuccess, showError } from '../../../utils/notification';

interface AddPlotDialogProps {
  bukidId: number;
  bukidName: string;
  onClose: () => void;
  onSuccess?: () => void;
  existingPlots?: any[];
}

const AddPlotDialog: React.FC<AddPlotDialogProps> = ({
  bukidId,
  bukidName,
  onClose,
  onSuccess,
  existingPlots = []
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    location: '',
    totalLuwang: '',
    status: 'active'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Generate suggested location based on existing plots
  useEffect(() => {
    if (existingPlots.length > 0) {
      const existingNumbers = existingPlots
        .map(plot => {
          const match = plot.location?.match(/Plot\s*#?(\d+)/i);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(num => num > 0);
      
      const nextNumber = existingNumbers.length > 0 
        ? Math.max(...existingNumbers) + 1 
        : existingPlots.length + 1;
      
      setFormData(prev => ({ ...prev, location: `Plot #${nextNumber}` }));
    } else {
      setFormData(prev => ({ ...prev, location: 'Plot #1' }));
    }
  }, [existingPlots]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.length > 100) {
      newErrors.location = 'Location must be less than 100 characters';
    }

    // Check for duplicate location in the same bukid
    const isDuplicate = existingPlots.some(
      plot => plot.location?.toLowerCase() === formData.location.toLowerCase()
    );
    if (isDuplicate) {
      newErrors.location = 'A plot with this location already exists in this bukid';
    }

    // Total Luwang validation
    if (!formData.totalLuwang.trim()) {
      newErrors.totalLuwang = 'Total Luwang is required';
    } else {
      const luwang = parseFloat(formData.totalLuwang);
      if (isNaN(luwang) || luwang <= 0) {
        newErrors.totalLuwang = 'Must be a positive number';
      } else if (luwang > 999.99) {
        newErrors.totalLuwang = 'Cannot exceed 999.99 luwang';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const plotData = {
        bukidId,
        location: formData.location.trim(),
        totalLuwang: parseFloat(formData.totalLuwang),
        status: formData.status
      };

      const response = await pitakAPI.createPitak(plotData);

      if (response.status) {
        showSuccess('Plot added successfully!');
        onSuccess?.();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to add plot');
      }
    } catch (err: any) {
      console.error('Error adding plot:', err);
      showError(err.message || 'Failed to add plot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleReset = () => {
    // Reset to default values
    const defaultLocation = existingPlots.length > 0 
      ? `Plot #${existingPlots.length + 1}`
      : 'Plot #1';
    
    setFormData({
      location: defaultLocation,
      totalLuwang: '',
      status: 'active'
    });
    setErrors({});
  };

  const locationSuggestions = [
    'North Field', 'South Field', 'East Field', 'West Field',
    'Central Plot', 'Border Area', 'Hill Side', 'Valley'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl border border-gray-200 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add New Plot</h3>
              <div className="text-sm text-gray-600">
                Bukid: <span className="font-medium">{bukidName}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
            <div className="space-y-5">
              {/* Location Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Plot Location/Name *
                  </div>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                    errors.location ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-300'
                  }`}
                  placeholder="Enter plot location or name"
                  disabled={submitting}
                />
                {errors.location && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.location}
                  </div>
                )}
                
                {/* Quick Suggestions */}
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Quick suggestions:</div>
                  <div className="flex flex-wrap gap-1">
                    {locationSuggestions.map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion}
                        onClick={() => handleChange('location', suggestion)}
                        className="px-2 py-1 text-xs rounded border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                        disabled={submitting}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total Luwang Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Total Luwang Capacity *
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0.01"
                    max="999.99"
                    step="0.01"
                    value={formData.totalLuwang}
                    onChange={(e) => handleChange('totalLuwang', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                      errors.totalLuwang ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    disabled={submitting}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    luwang
                  </div>
                </div>
                {errors.totalLuwang && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.totalLuwang}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Enter the total number of luwang this plot can accommodate (max 999.99)
                </div>
              </div>

              {/* Status Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'active', label: 'Active', color: 'border-green-200 bg-green-50 text-green-700' },
                    { value: 'inactive', label: 'Inactive', color: 'border-gray-200 bg-gray-50 text-gray-700' },
                    { value: 'completed', label: 'Completed', color: 'border-blue-200 bg-blue-50 text-blue-700' }
                  ].map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => handleChange('status', option.value)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        formData.status === option.value 
                          ? `${option.color} ring-2 ring-green-500 ring-opacity-50` 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      disabled={submitting}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Preview */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Summary:</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bukid:</span>
                    <span className="font-medium text-gray-900">{bukidName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900 truncate max-w-[200px]">
                      {formData.location || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Luwang:</span>
                    <span className="font-medium text-green-700">
                      {formData.totalLuwang || '0.00'} luwang
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium capitalize">{formData.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                disabled={submitting}
                className="px-4 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-100 text-gray-700 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-100 text-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded text-sm font-medium bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Plot
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              * Required fields
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlotDialog;