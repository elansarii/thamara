/**
 * Water Point Finder Database
 * Offline-first IndexedDB storage for Gaza water access points
 *
 * Uses Dexie.js for reliable client-side persistence of water point data
 * including wells, tanks, truck distribution points, and desalination facilities.
 */

import Dexie, { type EntityTable } from 'dexie';

/**
 * Water point types representing different water access infrastructure
 */
export type WaterPointType = 'well' | 'tank' | 'truck_distribution' | 'desalination';

/**
 * Current operational status of the water point
 */
export type WaterPointStatus = 'available' | 'limited' | 'unavailable' | 'unknown';

/**
 * Water Point data structure
 */
export interface WaterPoint {
  id: string;
  type: WaterPointType;
  coordinates: [number, number]; // [lng, lat] - GeoJSON standard
  name: string;
  lastConfirmed: Date;
  reliabilityScore: number; // 0-100
  status: WaterPointStatus;
}

/**
 * Dexie database instance for water points
 */
class WaterPointDatabase extends Dexie {
  waterPoints!: EntityTable<WaterPoint, 'id'>;

  constructor() {
    super('ThamaraWaterPoints');

    this.version(1).stores({
      waterPoints: 'id, type, status, reliabilityScore, lastConfirmed',
    });
  }
}

// Create singleton database instance
export const db = new WaterPointDatabase();

/**
 * Initialize database with seed data if empty
 */
export async function initializeWaterPoints(): Promise<void> {
  const count = await db.waterPoints.count();

  if (count === 0) {
    await db.waterPoints.bulkAdd(SEED_WATER_POINTS);
    console.log('Water points database initialized with seed data');
  }
}

/**
 * Get all water points from database
 */
export async function getAllWaterPoints(): Promise<WaterPoint[]> {
  return await db.waterPoints.toArray();
}

/**
 * Get water point by ID
 */
export async function getWaterPointById(id: string): Promise<WaterPoint | undefined> {
  return await db.waterPoints.get(id);
}

/**
 * Get water points by type
 */
export async function getWaterPointsByType(type: WaterPointType): Promise<WaterPoint[]> {
  return await db.waterPoints.where('type').equals(type).toArray();
}

/**
 * Get water points by status
 */
export async function getWaterPointsByStatus(status: WaterPointStatus): Promise<WaterPoint[]> {
  return await db.waterPoints.where('status').equals(status).toArray();
}

/**
 * Add a new water point
 */
export async function addWaterPoint(waterPoint: WaterPoint): Promise<string> {
  return await db.waterPoints.add(waterPoint);
}

/**
 * Update a water point
 */
export async function updateWaterPoint(id: string, updates: Partial<WaterPoint>): Promise<number> {
  return await db.waterPoints.update(id, updates);
}

/**
 * Delete a water point
 */
export async function deleteWaterPoint(id: string): Promise<void> {
  await db.waterPoints.delete(id);
}

/**
 * Get display label for water point type
 */
export function getWaterPointTypeLabel(type: WaterPointType): string {
  const labels: Record<WaterPointType, string> = {
    well: 'Well',
    tank: 'Water Tank',
    truck_distribution: 'Truck Distribution',
    desalination: 'Desalination Plant',
  };
  return labels[type];
}

/**
 * Get display label for status
 */
export function getStatusLabel(status: WaterPointStatus): string {
  const labels: Record<WaterPointStatus, string> = {
    available: 'Available',
    limited: 'Limited Supply',
    unavailable: 'Not Available',
    unknown: 'Status Unknown',
  };
  return labels[status];
}

/**
 * Calculate days since last confirmation
 */
export function getDaysSinceConfirmation(lastConfirmed: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastConfirmed.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Seed data: 10 sample water points across Gaza
 * Coordinates are realistic locations in Gaza Strip
 */
const SEED_WATER_POINTS: WaterPoint[] = [
  {
    id: 'wp-001',
    type: 'well',
    coordinates: [34.4668, 31.5017], // Gaza City
    name: 'Al-Shifa Hospital Well',
    lastConfirmed: new Date('2026-01-25'),
    reliabilityScore: 85,
    status: 'available',
  },
  {
    id: 'wp-002',
    type: 'tank',
    coordinates: [34.4450, 31.5200], // Al-Shati Camp
    name: 'Beach Camp Water Tank',
    lastConfirmed: new Date('2026-01-24'),
    reliabilityScore: 78,
    status: 'limited',
  },
  {
    id: 'wp-003',
    type: 'truck_distribution',
    coordinates: [34.4830, 31.5314], // Jabalya
    name: 'Jabalya Distribution Point',
    lastConfirmed: new Date('2026-01-26'),
    reliabilityScore: 92,
    status: 'available',
  },
  {
    id: 'wp-004',
    type: 'desalination',
    coordinates: [34.3510, 31.4186], // Deir al-Balah
    name: 'Central Desalination Plant',
    lastConfirmed: new Date('2026-01-23'),
    reliabilityScore: 88,
    status: 'limited',
  },
  {
    id: 'wp-005',
    type: 'well',
    coordinates: [34.3038, 31.3469], // Khan Younis
    name: 'Khan Younis Community Well',
    lastConfirmed: new Date('2026-01-22'),
    reliabilityScore: 72,
    status: 'available',
  },
  {
    id: 'wp-006',
    type: 'tank',
    coordinates: [34.2461, 31.2982], // Rafah
    name: 'Rafah Emergency Tank',
    lastConfirmed: new Date('2026-01-20'),
    reliabilityScore: 65,
    status: 'limited',
  },
  {
    id: 'wp-007',
    type: 'truck_distribution',
    coordinates: [34.5361, 31.5389], // Beit Hanoun
    name: 'Beit Hanoun Water Trucks',
    lastConfirmed: new Date('2026-01-25'),
    reliabilityScore: 80,
    status: 'available',
  },
  {
    id: 'wp-008',
    type: 'well',
    coordinates: [34.3919, 31.4442], // Nuseirat
    name: 'Nuseirat Agricultural Well',
    lastConfirmed: new Date('2026-01-18'),
    reliabilityScore: 68,
    status: 'unknown',
  },
  {
    id: 'wp-009',
    type: 'tank',
    coordinates: [34.4300, 31.4700], // Al-Zahra
    name: 'Al-Zahra Community Tank',
    lastConfirmed: new Date('2026-01-26'),
    reliabilityScore: 90,
    status: 'available',
  },
  {
    id: 'wp-010',
    type: 'desalination',
    coordinates: [34.4447, 31.5069], // Gaza City Central
    name: 'Gaza City Desalination Facility',
    lastConfirmed: new Date('2026-01-21'),
    reliabilityScore: 75,
    status: 'limited',
  },
];

/**
 * Test function to verify database setup
 * Call this to confirm the database is working correctly
 */
export async function testWaterPointsDatabase(): Promise<void> {
  try {
    // Initialize if needed
    await initializeWaterPoints();

    // Fetch all water points
    const allPoints = await getAllWaterPoints();
    console.log(`✓ Found ${allPoints.length} water points in database`);

    // Test filtering by type
    const wells = await getWaterPointsByType('well');
    console.log(`✓ Found ${wells.length} wells`);

    // Test filtering by status
    const available = await getWaterPointsByStatus('available');
    console.log(`✓ Found ${available.length} available water points`);

    // Display sample data
    console.log('\nSample water points:');
    allPoints.slice(0, 3).forEach(point => {
      console.log(`  - ${point.name} (${getWaterPointTypeLabel(point.type)})`);
      console.log(`    Status: ${getStatusLabel(point.status)}, Reliability: ${point.reliabilityScore}%`);
      console.log(`    Location: [${point.coordinates[0]}, ${point.coordinates[1]}]`);
    });

    console.log('\n✓ Water points database is working correctly!');
  } catch (error) {
    console.error('✗ Database test failed:', error);
    throw error;
  }
}
