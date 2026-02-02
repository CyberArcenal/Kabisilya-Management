import { useState, useCallback } from 'react';
import type { BuholInputs } from '../utils/measurement';

export const useMeasurementValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateBuholInput = useCallback((
    value: number,
    fieldName: string,
    required = true
  ): string => {
    if (required && (!value || value <= 0)) {
      return `${fieldName} must be greater than 0 buhol`;
    }
    
    if (value < 0) {
      return `${fieldName} cannot be negative`;
    }
    
    if (!Number.isInteger(value)) {
      return `${fieldName} must be a whole number (buhol)`;
    }
    
    if (value > 1000) {
      return `${fieldName} cannot exceed 1000 buhol (100 tali)`;
    }
    
    return '';
  }, []);

  const validateShapeInputs = useCallback((
    layoutType: string,
    inputs: BuholInputs,
    triangleMode?: 'base_height' | 'three_sides'
  ): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    switch (layoutType) {
      case 'square':
        newErrors.side = validateBuholInput(inputs.side || 0, 'Side');
        break;

      case 'rectangle':
        newErrors.length = validateBuholInput(inputs.length || 0, 'Length');
        newErrors.width = validateBuholInput(inputs.width || 0, 'Width');
        break;

      case 'triangle':
        if (triangleMode === 'base_height') {
          newErrors.base = validateBuholInput(inputs.base || 0, 'Base');
          newErrors.height = validateBuholInput(inputs.height || 0, 'Height');
        } else {
          newErrors.sideA = validateBuholInput(inputs.sideA || 0, 'Side A');
          newErrors.sideB = validateBuholInput(inputs.sideB || 0, 'Side B');
          newErrors.sideC = validateBuholInput(inputs.sideC || 0, 'Side C');
        }
        break;

      case 'circle':
        newErrors.radius = validateBuholInput(inputs.radius || 0, 'Radius');
        break;
    }

    return newErrors;
  }, [validateBuholInput]);

  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    setErrors,
    validateBuholInput,
    validateShapeInputs,
    clearError,
    clearAllErrors,
  };
};