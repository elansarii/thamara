export type PlotDraft = {
  name?: string;
  areaM2?: number;
  locationMethod: "gps" | "manual" | "none";
  lat?: number;
  lon?: number;
  salinity: "low" | "medium" | "high" | "unknown";
  contamination: "none" | "suspected" | "confirmed" | "unknown";
  debris: "none" | "light" | "heavy" | "unknown";
  waterAccess: "none" | "limited" | "reliable" | "unknown";
  notes?: string;
};

export type AssessmentResult = {
  status: "Farmable" | "Restorable" | "Damaged";
  score: number;
  reasons: string[];
};
