export interface AgroPackManifest {
  pack_id: string;
  version: string;
  updated_at: string;
  source_name: string;
  source_desc: string;
  bbox: [number, number, number, number];
  notes: string;
}

export interface PlantabilityFeatureProperties {
  name: string;
  areaM2: number;
  class: "farmable" | "restorable" | "damaged";
  confidence: number;
  baseline_source: string;
  baseline_date: string;
  notes?: string;
}

export interface PlantabilityFeature {
  type: "Feature";
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  properties: PlantabilityFeatureProperties;
}

export interface PlantabilityGeoJSON {
  type: "FeatureCollection";
  features: PlantabilityFeature[];
}

export interface SelectedZone {
  lat: number;
  lon: number;
  feature: PlantabilityFeature | null;
}
