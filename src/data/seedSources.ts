/**
 * Seed source locations for Thamara MVP
 * Represents realistic seed distribution points in Gaza-like scenarios:
 * - NGO distribution hubs
 * - Agricultural cooperatives
 * - Local markets
 * - Community warehouses
 */

export type SeedSourceType = 'ngo_hub' | 'cooperative' | 'market' | 'warehouse' | 'community_center';

export interface SeedSource {
  id: string;
  name: string;
  type: SeedSourceType;
  lat: number;
  lng: number;
  availableCrops: string[]; // crop IDs from crops.ts
  lastConfirmed: string; // ISO date string
  reliabilityScore: number; // 0-100
  notes?: string;
}

/**
 * Demo seed sources for Gaza region (approximate coordinates)
 * Note: In production, these would be crowd-sourced and updated regularly
 */
export const SEED_SOURCES: SeedSource[] = [
  {
    id: 'ss-1',
    name: 'Gaza Agricultural Relief Center',
    type: 'ngo_hub',
    lat: 31.5017,
    lng: 34.4668,
    availableCrops: ['radish', 'lettuce', 'spinach', 'arugula', 'turnip', 'carrot', 'kale'],
    lastConfirmed: '2026-01-20',
    reliabilityScore: 95,
    notes: 'Main distribution hub. Open Sat-Thu 8am-2pm.',
  },
  {
    id: 'ss-2',
    name: 'Al-Shati Farmers Cooperative',
    type: 'cooperative',
    lat: 31.5200,
    lng: 34.4450,
    availableCrops: ['tomato-cherry', 'cucumber', 'zucchini', 'green-bean', 'swiss-chard'],
    lastConfirmed: '2026-01-18',
    reliabilityScore: 88,
    notes: 'Focus on summer crops. Members get priority access.',
  },
  {
    id: 'ss-3',
    name: 'Jabalya Vegetable Market',
    type: 'market',
    lat: 31.5314,
    lng: 34.4830,
    availableCrops: ['radish', 'lettuce', 'arugula', 'turnip', 'spinach'],
    lastConfirmed: '2026-01-22',
    reliabilityScore: 72,
    notes: 'Variable stock. Best to visit early morning.',
  },
  {
    id: 'ss-4',
    name: 'Khan Younis Seed Bank',
    type: 'warehouse',
    lat: 31.3469,
    lng: 34.3038,
    availableCrops: ['radish', 'carrot', 'turnip', 'green-bean', 'zucchini', 'cucumber', 'swiss-chard'],
    lastConfirmed: '2026-01-15',
    reliabilityScore: 90,
    notes: 'Large inventory. Pre-order recommended.',
  },
  {
    id: 'ss-5',
    name: 'Rafah Community Seed Exchange',
    type: 'community_center',
    lat: 31.2982,
    lng: 34.2461,
    availableCrops: ['lettuce', 'arugula', 'kale', 'spinach', 'radish'],
    lastConfirmed: '2026-01-25',
    reliabilityScore: 78,
    notes: 'Community-run. Seed sharing and trades welcome.',
  },
  {
    id: 'ss-6',
    name: 'Deir al-Balah Agricultural Center',
    type: 'ngo_hub',
    lat: 31.4186,
    lng: 34.3510,
    availableCrops: ['tomato-cherry', 'zucchini', 'cucumber', 'swiss-chard', 'kale', 'green-bean'],
    lastConfirmed: '2026-01-19',
    reliabilityScore: 92,
    notes: 'Technical support available. Training sessions offered.',
  },
  {
    id: 'ss-7',
    name: 'Gaza City Central Market',
    type: 'market',
    lat: 31.5069,
    lng: 34.4447,
    availableCrops: ['radish', 'lettuce', 'tomato-cherry', 'cucumber', 'arugula', 'carrot'],
    lastConfirmed: '2026-01-24',
    reliabilityScore: 75,
    notes: 'Multiple vendors. Quality varies.',
  },
  {
    id: 'ss-8',
    name: 'Beit Hanoun Farmers Warehouse',
    type: 'warehouse',
    lat: 31.5389,
    lng: 34.5361,
    availableCrops: ['carrot', 'turnip', 'radish', 'green-bean', 'kale', 'spinach'],
    lastConfirmed: '2026-01-17',
    reliabilityScore: 85,
    notes: 'Bulk quantities available at better rates.',
  },
  {
    id: 'ss-9',
    name: 'Al-Zahra Cooperative',
    type: 'cooperative',
    lat: 31.4700,
    lng: 34.4300,
    availableCrops: ['lettuce', 'spinach', 'swiss-chard', 'kale', 'arugula'],
    lastConfirmed: '2026-01-21',
    reliabilityScore: 87,
    notes: 'Specializes in leafy greens. Organic options available.',
  },
  {
    id: 'ss-10',
    name: 'Maghazi Agricultural Support Hub',
    type: 'ngo_hub',
    lat: 31.4147,
    lng: 34.3850,
    availableCrops: ['radish', 'turnip', 'carrot', 'zucchini', 'tomato-cherry', 'green-bean'],
    lastConfirmed: '2026-01-16',
    reliabilityScore: 89,
    notes: 'Free seeds for verified small-scale farmers.',
  },
  {
    id: 'ss-11',
    name: 'Nuseirat Community Garden Center',
    type: 'community_center',
    lat: 31.4442,
    lng: 34.3919,
    availableCrops: ['arugula', 'radish', 'lettuce', 'spinach', 'kale'],
    lastConfirmed: '2026-01-23',
    reliabilityScore: 80,
    notes: 'Seed library system. Return seeds from harvest for others.',
  },
  {
    id: 'ss-12',
    name: 'Abasan Agricultural Cooperative',
    type: 'cooperative',
    lat: 31.3239,
    lng: 34.3419,
    availableCrops: ['tomato-cherry', 'cucumber', 'zucchini', 'swiss-chard', 'green-bean', 'carrot'],
    lastConfirmed: '2026-01-20',
    reliabilityScore: 86,
    notes: 'Focus on water-efficient crops. Drip irrigation supplies also available.',
  },
];

export function getSeedSourcesForCrop(cropId: string): SeedSource[] {
  return SEED_SOURCES.filter(source => source.availableCrops.includes(cropId));
}

export function getSeedSourceById(id: string): SeedSource | undefined {
  return SEED_SOURCES.find(source => source.id === id);
}

export function getAllSeedSources(): SeedSource[] {
  return SEED_SOURCES;
}

/**
 * Get display label for source type
 */
export function getSourceTypeLabel(type: SeedSourceType): string {
  const labels: Record<SeedSourceType, string> = {
    ngo_hub: 'NGO Hub',
    cooperative: 'Cooperative',
    market: 'Market',
    warehouse: 'Warehouse',
    community_center: 'Community Center',
  };
  return labels[type];
}

/**
 * Calculate days since last confirmation
 */
export function getDaysSinceConfirmation(lastConfirmed: string): number {
  const confirmed = new Date(lastConfirmed);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - confirmed.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
