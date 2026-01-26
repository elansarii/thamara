import { PlotDraft, AssessmentResult } from "./plotTypes";

export function assess(plot: PlotDraft): AssessmentResult {
  let score = 100;
  const reasons: string[] = [];

  // Salinity impact
  if (plot.salinity === "high") {
    score -= 30;
    reasons.push("High salinity reduces farmability");
  } else if (plot.salinity === "medium") {
    score -= 15;
    reasons.push("Medium salinity may require mitigation");
  }

  // Contamination impact
  if (plot.contamination === "confirmed") {
    score -= 40;
    reasons.push("Confirmed contamination requires treatment");
  } else if (plot.contamination === "suspected") {
    score -= 20;
    reasons.push("Suspected contamination needs testing");
  }

  // Debris impact
  if (plot.debris === "heavy") {
    score -= 25;
    reasons.push("Heavy debris requires significant cleanup");
  } else if (plot.debris === "light") {
    score -= 10;
    reasons.push("Light debris cleanup needed");
  }

  // Water access impact
  if (plot.waterAccess === "none") {
    score -= 30;
    reasons.push("No water access limits farming potential");
  } else if (plot.waterAccess === "limited") {
    score -= 15;
    reasons.push("Limited water access may need improvement");
  } else if (plot.waterAccess === "reliable") {
    reasons.push("Reliable water access is positive");
  }

  // Determine status
  let status: "Farmable" | "Restorable" | "Damaged";
  if (score >= 70) {
    status = "Farmable";
  } else if (score >= 40) {
    status = "Restorable";
  } else {
    status = "Damaged";
  }

  return { status, score: Math.max(0, score), reasons };
}
