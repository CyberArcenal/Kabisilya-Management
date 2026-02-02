import { useCallback } from "react";
import { TraditionalMeasurement, type BuholInputs } from "../utils/measurement";

export const useAuditLogger = () => {
  const logMeasurement = useCallback(
    (layoutType: string, inputs: BuholInputs, results: any, method: string) => {
      const timestamp = new Date().toISOString();
      const auditData = {
        timestamp,
        layoutType,
        measurementMethod: method,
        inputs: {
          buhol: inputs,
          meters: Object.keys(inputs).reduce(
            (acc, key) => ({
              ...acc,
              [key]: TraditionalMeasurement.buholToMeters(inputs[key]),
            }),
            {},
          ),
          tali: Object.keys(inputs).reduce(
            (acc, key) => ({
              ...acc,
              [key]: TraditionalMeasurement.buholToTali(inputs[key]),
            }),
            {},
          ),
        },
        results,
        systemUsed: "traditional_buhol_tali",
        conversions: TraditionalMeasurement.getConversionExplanation(
          layoutType as any,
          inputs,
        ),
      };

      console.log("📏 Measurement Audit:", auditData);

      return auditData;
    },
    [],
  );

  const logFormSubmission = useCallback(
    (formData: any, measurementData: any) => {
      const auditLog = {
        timestamp: new Date().toISOString(),
        action: formData.id ? "pitak_update" : "pitak_create",
        pitakId: formData.id,
        traditionalMeasurements: measurementData,
        modernEquivalents: {
          areaSqm: measurementData.results.areaSqm,
          totalLuwang: measurementData.results.totalLuwang,
        },
        userMetadata: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      };

      console.log("📋 Form Submission Audit:", auditLog);
      return auditLog;
    },
    [],
  );

  return {
    logMeasurement,
    logFormSubmission,
  };
};
