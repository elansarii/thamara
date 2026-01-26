/**
 * Exchange Hub Type Definitions
 * Offline-first marketplace for inputs, labor, and verified hubs
 */

export type ListingType = 'offer' | 'request';
export type ListingMode = 'inputs' | 'labor' | 'hubs';
export type ListingStatus = 'active' | 'reserved' | 'fulfilled';
export type TrustLevel = 'peer' | 'verified_hub' | 'ngo';
export type UrgencyLevel = 'today' | 'week' | 'any';
export type DistanceBand = 'near' | 'medium' | 'far';

// Category enums per mode
export type InputCategory = 'seeds' | 'tools' | 'fertilizer' | 'irrigation';
export type LaborCategory = 'day_labor' | 'harvest_help' | 'transport' | 'containers';
export type HubCategory = 'ngo_hub' | 'coop_hub' | 'supplier_hub';

export type ListingCategory = InputCategory | LaborCategory | HubCategory;

export interface Listing {
  id: string;
  type: ListingType;
  mode: ListingMode;
  category: ListingCategory;
  title: string;
  quantity: number;
  unit: string;
  locationLabel: string;
  distanceBand: DistanceBand;
  urgency: UrgencyLevel;
  trust: TrustLevel;
  notes?: string;
  createdAt: number;
  status: ListingStatus;
  // Optional fields for specific types
  dateTime?: string; // For labor/transport bookings
  capacity?: string; // For transport
  skillTags?: string[]; // For labor
  availableItems?: string[]; // For hubs
  hours?: string; // For hubs
  hubName?: string; // For verified hubs
}

export interface MatchScore {
  listingId: string;
  score: number;
  topReasons: string[];
}

export interface UserContext {
  // From plot store if available
  selectedCrop?: string;
  plotSize?: number;
  waterAccess?: string;
  salinityRisk?: string;
  // User location (simulated)
  locationLabel?: string;
  distanceBand?: DistanceBand;
}

export interface SafetyGuidance {
  id: string;
  title: string;
  category: InputCategory;
  content: string[];
  warnings: string[];
}

export interface RequestBundle {
  id: string;
  cropName: string;
  plotSize: 'small' | 'medium' | 'large';
  items: RequestBundleItem[];
  createdAt: number;
}

export interface RequestBundleItem {
  category: InputCategory;
  item: string;
  quantityRange: string;
  priority: 'essential' | 'recommended' | 'optional';
}
