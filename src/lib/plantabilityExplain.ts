import { PlotDraft } from "./plotTypes";
import { PlantabilityFeatureProperties } from "./plantabilityTypes";

export interface ExplainabilityResult {
  statusLabel: string;
  statusColor: string;
  whyText: string;
  needsCheck: boolean;
  suggestedConditions: Partial<PlotDraft>;
}

export function explainPlantability(
  props: PlantabilityFeatureProperties
): ExplainabilityResult {
  const { class: plantClass, confidence } = props;
  const needsCheck = confidence < 60;

  let statusLabel: string;
  let statusColor: string;
  let whyText: string;
  let suggestedConditions: Partial<PlotDraft>;

  switch (plantClass) {
    case "farmable":
      statusLabel = "Farmable";
      statusColor = "text-green-600";
      whyText =
        confidence >= 80
          ? `Satellite baseline shows minimal disturbance; confidence ${confidence}%. This zone appears suitable for immediate planting with standard soil preparation.`
          : `Satellite baseline indicates low disturbance; confidence ${confidence}%. Recommended: soil test before planting to confirm nutrient levels.`;
      suggestedConditions = {
        debris: confidence >= 80 ? "none" : "light",
        contamination: "none",
        waterAccess: confidence >= 80 ? "reliable" : "limited",
        salinity: "unknown",
      };
      break;

    case "restorable":
      statusLabel = "Restorable";
      statusColor = "text-yellow-600";
      whyText =
        confidence >= 70
          ? `Satellite baseline indicates moderate cropland disturbance; confidence ${confidence}%. Recommended: soil remediation + salt-tolerant crops.`
          : `Mixed signals from satellite data; confidence ${confidence}%. Restoration potential exists but on-site assessment is critical. Consider soil testing and debris removal.`;
      suggestedConditions = {
        debris: "light",
        contamination: confidence >= 70 ? "suspected" : "unknown",
        waterAccess: "limited",
        salinity: "unknown",
      };
      break;

    case "damaged":
      statusLabel = "Damaged";
      statusColor = "text-red-600";
      whyText =
        confidence >= 85
          ? `Satellite baseline shows significant infrastructure damage and potential contamination; confidence ${confidence}%. High debris load and limited water access detected. Restoration requires professional remediation.`
          : `Satellite baseline indicates high disturbance; confidence ${confidence}%. Heavy debris and suspected contamination present. Extensive remediation needed before planting.`;
      suggestedConditions = {
        debris: "heavy",
        contamination: confidence >= 85 ? "suspected" : "confirmed",
        waterAccess: confidence >= 85 ? "limited" : "none",
        salinity: "unknown",
      };
      break;

    default:
      statusLabel = "Unknown";
      statusColor = "text-gray-600";
      whyText = "Unable to classify this zone.";
      suggestedConditions = {
        debris: "unknown",
        contamination: "unknown",
        waterAccess: "unknown",
        salinity: "unknown",
      };
  }

  return {
    statusLabel,
    statusColor,
    whyText,
    needsCheck,
    suggestedConditions,
  };
}
