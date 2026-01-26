/**
 * Types for Drops feature (No-Fridge Harvest-to-Market)
 * Enables farmers to publish harvest windows for same-day pickup coordination
 */

export type PickupPreference = 'same_day' | '24h' | 'any';
export type DropStatus = 'active' | 'scheduled' | 'completed';
export type SpoilageRisk = 'low' | 'medium' | 'high';
export type QuantityBand = 'small' | 'medium' | 'large';

export interface HarvestDrop {
  id: string;
  cropType: string;
  cropCommonName: string;
  windowStart: string; // ISO date-time
  windowEnd: string; // ISO date-time
  quantityMin: number;
  quantityMax: number;
  unit: string;
  locationLabel: string;
  pickupPreference: PickupPreference;
  spoilageRisk: SpoilageRisk;
  status: DropStatus;
  notes?: string;
  createdAt: string;
}

export interface BuyerMatch {
  id: string;
  name: string;
  type: 'verified_hub' | 'ngo' | 'buyer' | 'aggregator';
  distanceBand: 'near' | 'medium' | 'far';
  capacityFit: 'exact' | 'can_handle' | 'limited';
  availableWindow: {
    start: string;
    end: string;
  };
  trustScore: number; // 0-100
  matchScore: number; // 0-100 (computed)
  matchReasons: string[];
  contactMethod?: string;
}

export type DropSortOption = 'ai_priority' | 'soonest' | 'largest';

export interface DropFilters {
  status?: DropStatus[];
  pickupPreference?: PickupPreference[];
  quantityBand?: QuantityBand[];
  search?: string;
}
