/**
 * Exchange Hub SQLite Storage Utilities
 * Persistent storage for listings and bundles using SQLite
 */

import type { Listing, RequestBundle, RequestBundleItem } from './exchangeTypes';
import { query, execute, generateId } from './database';

// In-memory cache for synchronous access (populated on first load)
let listingsCache: Listing[] | null = null;
let bundlesCache: RequestBundle[] | null = null;
let isInitialized = false;

/**
 * Initialize the storage (call this early in app lifecycle)
 */
export async function initExchangeStorage(): Promise<void> {
  if (isInitialized) return;

  try {
    // Check if we have any listings
    const count = await query<{ count: number }>('SELECT COUNT(*) as count FROM listings');

    if (count[0]?.count === 0) {
      // Seed with default listings
      await seedDefaultListings();
    }

    // Load into cache
    await loadListingsAsync();
    await loadBundlesAsync();

    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize exchange storage:', error);
  }
}

/**
 * Load all listings from SQLite (async)
 */
export async function loadListingsAsync(): Promise<Listing[]> {
  try {
    const rows = await query<{
      id: string;
      type: string;
      mode: string;
      category: string;
      title: string;
      quantity: number;
      unit: string;
      locationLabel: string;
      distanceBand: string;
      urgency: string;
      trust: string;
      notes: string | null;
      createdAt: number;
      status: string;
      dateTime: string | null;
      capacity: string | null;
      skillTags: string | null;
      availableItems: string | null;
      hours: string | null;
      hubName: string | null;
    }>('SELECT * FROM listings ORDER BY createdAt DESC');

    const listings: Listing[] = rows.map(row => ({
      id: row.id,
      type: row.type as 'offer' | 'request',
      mode: row.mode as 'inputs' | 'labor' | 'hubs',
      category: row.category as Listing['category'],
      title: row.title,
      quantity: row.quantity,
      unit: row.unit,
      locationLabel: row.locationLabel,
      distanceBand: row.distanceBand as 'near' | 'medium' | 'far',
      urgency: row.urgency as 'today' | 'week' | 'any',
      trust: row.trust as 'peer' | 'ngo' | 'verified_hub',
      notes: row.notes || undefined,
      createdAt: row.createdAt,
      status: row.status as 'active' | 'reserved' | 'fulfilled',
      dateTime: row.dateTime || undefined,
      capacity: row.capacity || undefined,
      skillTags: row.skillTags ? JSON.parse(row.skillTags) : undefined,
      availableItems: row.availableItems ? JSON.parse(row.availableItems) : undefined,
      hours: row.hours || undefined,
      hubName: row.hubName || undefined,
    }));

    listingsCache = listings;
    return listings;
  } catch (error) {
    console.error('Failed to load listings:', error);
    return listingsCache || getDefaultListings();
  }
}

/**
 * Load all listings (sync - returns cached data)
 */
export function loadListings(): Listing[] {
  if (listingsCache !== null) {
    return listingsCache;
  }

  // If cache is empty, trigger async load and return defaults
  loadListingsAsync().catch(console.error);
  return getDefaultListings();
}

/**
 * Save listings (for backward compatibility - now a no-op since we save per operation)
 */
export function saveListings(listings: Listing[]): void {
  listingsCache = listings;
  // Note: Individual saves happen in addListing/updateListing/deleteListing
}

/**
 * Add a new listing
 */
export function addListing(listing: Omit<Listing, 'id' | 'createdAt' | 'status'>): Listing {
  const newListing: Listing = {
    ...listing,
    id: `listing-${generateId()}`,
    createdAt: Date.now(),
    status: 'active',
  };

  // Update cache immediately for UI responsiveness
  if (listingsCache) {
    listingsCache = [newListing, ...listingsCache];
  }

  // Persist to SQLite asynchronously
  execute(
    `INSERT INTO listings
     (id, type, mode, category, title, quantity, unit, locationLabel, distanceBand, urgency, trust, notes, createdAt, status, dateTime, capacity, skillTags, availableItems, hours, hubName)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newListing.id,
      newListing.type,
      newListing.mode,
      newListing.category,
      newListing.title,
      newListing.quantity,
      newListing.unit,
      newListing.locationLabel,
      newListing.distanceBand,
      newListing.urgency,
      newListing.trust,
      newListing.notes || null,
      newListing.createdAt,
      newListing.status,
      newListing.dateTime || null,
      newListing.capacity || null,
      newListing.skillTags ? JSON.stringify(newListing.skillTags) : null,
      newListing.availableItems ? JSON.stringify(newListing.availableItems) : null,
      newListing.hours || null,
      newListing.hubName || null,
    ]
  ).catch(console.error);

  return newListing;
}

/**
 * Update a listing
 */
export function updateListing(id: string, updates: Partial<Listing>): void {
  // Update cache
  if (listingsCache) {
    const index = listingsCache.findIndex(l => l.id === id);
    if (index !== -1) {
      listingsCache[index] = { ...listingsCache[index], ...updates };
    }
  }

  // Build dynamic update query
  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.type !== undefined) { fields.push('type = ?'); values.push(updates.type); }
  if (updates.mode !== undefined) { fields.push('mode = ?'); values.push(updates.mode); }
  if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.quantity !== undefined) { fields.push('quantity = ?'); values.push(updates.quantity); }
  if (updates.unit !== undefined) { fields.push('unit = ?'); values.push(updates.unit); }
  if (updates.locationLabel !== undefined) { fields.push('locationLabel = ?'); values.push(updates.locationLabel); }
  if (updates.distanceBand !== undefined) { fields.push('distanceBand = ?'); values.push(updates.distanceBand); }
  if (updates.urgency !== undefined) { fields.push('urgency = ?'); values.push(updates.urgency); }
  if (updates.trust !== undefined) { fields.push('trust = ?'); values.push(updates.trust); }
  if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  if (updates.dateTime !== undefined) { fields.push('dateTime = ?'); values.push(updates.dateTime); }
  if (updates.capacity !== undefined) { fields.push('capacity = ?'); values.push(updates.capacity); }
  if (updates.skillTags !== undefined) { fields.push('skillTags = ?'); values.push(JSON.stringify(updates.skillTags)); }
  if (updates.availableItems !== undefined) { fields.push('availableItems = ?'); values.push(JSON.stringify(updates.availableItems)); }
  if (updates.hours !== undefined) { fields.push('hours = ?'); values.push(updates.hours); }
  if (updates.hubName !== undefined) { fields.push('hubName = ?'); values.push(updates.hubName); }

  if (fields.length > 0) {
    values.push(id);
    execute(`UPDATE listings SET ${fields.join(', ')} WHERE id = ?`, values).catch(console.error);
  }
}

/**
 * Delete a listing
 */
export function deleteListing(id: string): void {
  // Update cache
  if (listingsCache) {
    listingsCache = listingsCache.filter(l => l.id !== id);
  }

  execute('DELETE FROM listings WHERE id = ?', [id]).catch(console.error);
}

/**
 * Load request bundles (async)
 */
export async function loadBundlesAsync(): Promise<RequestBundle[]> {
  try {
    const rows = await query<{
      id: string;
      cropName: string;
      plotSize: string;
      items: string;
      createdAt: number;
    }>('SELECT * FROM request_bundles ORDER BY createdAt DESC');

    const bundles: RequestBundle[] = rows.map(row => ({
      id: row.id,
      cropName: row.cropName,
      plotSize: row.plotSize as 'small' | 'medium' | 'large',
      items: JSON.parse(row.items) as RequestBundleItem[],
      createdAt: row.createdAt,
    }));

    bundlesCache = bundles;
    return bundles;
  } catch (error) {
    console.error('Failed to load bundles:', error);
    return bundlesCache || [];
  }
}

/**
 * Load request bundles (sync - returns cached data)
 */
export function loadBundles(): RequestBundle[] {
  if (bundlesCache !== null) {
    return bundlesCache;
  }

  // Trigger async load
  loadBundlesAsync().catch(console.error);
  return [];
}

/**
 * Save a request bundle
 */
export function saveBundle(bundle: Omit<RequestBundle, 'id' | 'createdAt'>): RequestBundle {
  const newBundle: RequestBundle = {
    ...bundle,
    id: `bundle-${generateId()}`,
    createdAt: Date.now(),
  };

  // Update cache
  if (bundlesCache) {
    bundlesCache = [newBundle, ...bundlesCache];
  } else {
    bundlesCache = [newBundle];
  }

  // Persist to SQLite
  execute(
    'INSERT INTO request_bundles (id, cropName, plotSize, items, createdAt) VALUES (?, ?, ?, ?, ?)',
    [newBundle.id, newBundle.cropName, newBundle.plotSize, JSON.stringify(newBundle.items), newBundle.createdAt]
  ).catch(console.error);

  return newBundle;
}

/**
 * Seed default demo listings
 */
async function seedDefaultListings(): Promise<void> {
  const defaults = getDefaultListings();

  for (const listing of defaults) {
    await execute(
      `INSERT OR IGNORE INTO listings
       (id, type, mode, category, title, quantity, unit, locationLabel, distanceBand, urgency, trust, notes, createdAt, status, dateTime, capacity, skillTags, availableItems, hours, hubName)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        listing.id,
        listing.type,
        listing.mode,
        listing.category,
        listing.title,
        listing.quantity,
        listing.unit,
        listing.locationLabel,
        listing.distanceBand,
        listing.urgency,
        listing.trust,
        listing.notes || null,
        listing.createdAt,
        listing.status,
        listing.dateTime || null,
        listing.capacity || null,
        listing.skillTags ? JSON.stringify(listing.skillTags) : null,
        listing.availableItems ? JSON.stringify(listing.availableItems) : null,
        listing.hours || null,
        listing.hubName || null,
      ]
    );
  }

  console.log(`Seeded ${defaults.length} default listings`);
}

/**
 * Default demo listings to populate the marketplace
 */
function getDefaultListings(): Listing[] {
  return [
    // INPUTS - Seeds
    {
      id: 'seed-001',
      type: 'offer',
      mode: 'inputs',
      category: 'seeds',
      title: 'Tomato Seeds (Roma variety)',
      quantity: 500,
      unit: 'grams',
      locationLabel: 'North Gaza – Sector A',
      distanceBand: 'near',
      urgency: 'week',
      trust: 'verified_hub',
      notes: 'High-quality seeds from verified supplier. Salt-tolerant variety.',
      createdAt: Date.now() - 86400000 * 2,
      status: 'active',
      hubName: 'Gaza Agricultural Co-op',
      availableItems: ['Tomato seeds', 'Cucumber seeds', 'Radish seeds'],
      hours: '8 AM - 4 PM daily',
    },
    {
      id: 'seed-002',
      type: 'request',
      mode: 'inputs',
      category: 'seeds',
      title: 'Need Radish Seeds',
      quantity: 100,
      unit: 'grams',
      locationLabel: 'Central Gaza – Block 3',
      distanceBand: 'near',
      urgency: 'today',
      trust: 'peer',
      notes: 'Starting small plot. Can trade for tools.',
      createdAt: Date.now() - 3600000,
      status: 'active',
    },
    {
      id: 'seed-003',
      type: 'offer',
      mode: 'inputs',
      category: 'seeds',
      title: 'Cucumber Seeds',
      quantity: 250,
      unit: 'grams',
      locationLabel: 'South Gaza – Zone B',
      distanceBand: 'medium',
      urgency: 'week',
      trust: 'ngo',
      notes: 'Distributed by Relief NGO. Heat-resistant variety.',
      createdAt: Date.now() - 86400000 * 5,
      status: 'active',
    },
    // INPUTS - Tools
    {
      id: 'tool-001',
      type: 'offer',
      mode: 'inputs',
      category: 'tools',
      title: 'Hand Cultivator & Hoe Set',
      quantity: 2,
      unit: 'sets',
      locationLabel: 'North Gaza – Sector C',
      distanceBand: 'medium',
      urgency: 'any',
      trust: 'peer',
      notes: 'Gently used. Good condition.',
      createdAt: Date.now() - 86400000 * 7,
      status: 'active',
    },
    {
      id: 'tool-002',
      type: 'request',
      mode: 'inputs',
      category: 'tools',
      title: 'Need Shovel & Rake',
      quantity: 1,
      unit: 'set',
      locationLabel: 'Central Gaza – Block 5',
      distanceBand: 'near',
      urgency: 'week',
      trust: 'peer',
      notes: 'Clearing small plot. Can return after use.',
      createdAt: Date.now() - 86400000,
      status: 'active',
    },
    // INPUTS - Fertilizer/Compost
    {
      id: 'fert-001',
      type: 'offer',
      mode: 'inputs',
      category: 'fertilizer',
      title: 'Organic Compost',
      quantity: 50,
      unit: 'kg',
      locationLabel: 'North Gaza – Sector A',
      distanceBand: 'near',
      urgency: 'today',
      trust: 'verified_hub',
      notes: 'Well-aged compost. Safe handling guidance available.',
      createdAt: Date.now() - 7200000,
      status: 'active',
      hubName: 'Gaza Agricultural Co-op',
    },
    {
      id: 'fert-002',
      type: 'request',
      mode: 'inputs',
      category: 'fertilizer',
      title: 'Need Soil Amendment',
      quantity: 20,
      unit: 'kg',
      locationLabel: 'South Gaza – Zone A',
      distanceBand: 'far',
      urgency: 'week',
      trust: 'peer',
      notes: 'High salinity plot. Need amendment.',
      createdAt: Date.now() - 86400000 * 3,
      status: 'active',
    },
    // INPUTS - Irrigation
    {
      id: 'irr-001',
      type: 'offer',
      mode: 'inputs',
      category: 'irrigation',
      title: 'Drip Irrigation Kit',
      quantity: 3,
      unit: 'kits',
      locationLabel: 'Central Gaza – Block 2',
      distanceBand: 'near',
      urgency: 'week',
      trust: 'ngo',
      notes: 'Basic drip system for 10m² plots. Includes tubing and emitters.',
      createdAt: Date.now() - 86400000 * 4,
      status: 'active',
    },
    {
      id: 'irr-002',
      type: 'request',
      mode: 'inputs',
      category: 'irrigation',
      title: 'Water Storage Containers',
      quantity: 5,
      unit: 'containers',
      locationLabel: 'North Gaza – Sector B',
      distanceBand: 'medium',
      urgency: 'today',
      trust: 'peer',
      notes: 'For rainwater collection setup.',
      createdAt: Date.now() - 14400000,
      status: 'active',
    },
    // LABOR & TRANSPORT
    {
      id: 'labor-001',
      type: 'offer',
      mode: 'labor',
      category: 'day_labor',
      title: 'Available for Plot Clearing',
      quantity: 2,
      unit: 'days',
      locationLabel: 'North Gaza – Sector A',
      distanceBand: 'near',
      urgency: 'week',
      trust: 'peer',
      notes: 'Experienced in land prep. Own tools.',
      createdAt: Date.now() - 86400000 * 6,
      status: 'active',
      dateTime: 'Next week, flexible',
      skillTags: ['Land clearing', 'Plot setup'],
    },
    {
      id: 'labor-002',
      type: 'request',
      mode: 'labor',
      category: 'day_labor',
      title: 'Need Help with Soil Prep',
      quantity: 1,
      unit: 'day',
      locationLabel: 'Central Gaza – Block 4',
      distanceBand: 'near',
      urgency: 'today',
      trust: 'peer',
      notes: '50m² plot. Mixing compost.',
      createdAt: Date.now() - 7200000,
      status: 'active',
      dateTime: 'Today, morning',
    },
    {
      id: 'harvest-001',
      type: 'request',
      mode: 'labor',
      category: 'harvest_help',
      title: 'Tomato Harvest Help Needed',
      quantity: 2,
      unit: 'people',
      locationLabel: 'South Gaza – Zone B',
      distanceBand: 'medium',
      urgency: 'week',
      trust: 'peer',
      notes: 'Early morning harvest. 2-3 hours.',
      createdAt: Date.now() - 86400000 * 2,
      status: 'active',
      dateTime: 'Next week, 6-9 AM',
      skillTags: ['Harvest'],
    },
    {
      id: 'trans-001',
      type: 'offer',
      mode: 'labor',
      category: 'transport',
      title: 'Small Truck Available',
      quantity: 100,
      unit: 'kg capacity',
      locationLabel: 'Central Gaza',
      distanceBand: 'near',
      urgency: 'week',
      trust: 'peer',
      notes: 'Local deliveries. Fuel shared.',
      createdAt: Date.now() - 86400000 * 8,
      status: 'active',
      dateTime: 'Flexible, weekdays',
      capacity: '100 kg',
    },
    {
      id: 'trans-002',
      type: 'request',
      mode: 'labor',
      category: 'transport',
      title: 'Need Transport for Compost',
      quantity: 50,
      unit: 'kg',
      locationLabel: 'North Gaza – Sector C',
      distanceBand: 'medium',
      urgency: 'today',
      trust: 'peer',
      notes: 'From co-op hub to plot.',
      createdAt: Date.now() - 10800000,
      status: 'active',
      dateTime: 'Today afternoon',
    },
    {
      id: 'cont-001',
      type: 'offer',
      mode: 'labor',
      category: 'containers',
      title: 'Plastic Crates for Harvest',
      quantity: 10,
      unit: 'crates',
      locationLabel: 'Central Gaza – Block 1',
      distanceBand: 'near',
      urgency: 'any',
      trust: 'peer',
      notes: 'Stackable crates. Can lend for season.',
      createdAt: Date.now() - 86400000 * 10,
      status: 'active',
    },
    // VERIFIED HUBS
    {
      id: 'hub-001',
      type: 'offer',
      mode: 'hubs',
      category: 'ngo_hub',
      title: 'Gaza Agricultural Co-op',
      quantity: 1,
      unit: 'hub',
      locationLabel: 'North Gaza – Main Hub',
      distanceBand: 'near',
      urgency: 'any',
      trust: 'verified_hub',
      notes: 'Full-service agricultural hub. Seeds, tools, training.',
      createdAt: Date.now() - 86400000 * 30,
      status: 'active',
      hubName: 'Gaza Agricultural Co-op',
      availableItems: ['Seeds', 'Tools', 'Fertilizer', 'Irrigation supplies'],
      hours: '8 AM - 4 PM, Sun-Thu',
    },
    {
      id: 'hub-002',
      type: 'offer',
      mode: 'hubs',
      category: 'coop_hub',
      title: 'Central Farmers Collective',
      quantity: 1,
      unit: 'hub',
      locationLabel: 'Central Gaza – Block 8',
      distanceBand: 'medium',
      urgency: 'any',
      trust: 'ngo',
      notes: 'Community-run distribution point.',
      createdAt: Date.now() - 86400000 * 45,
      status: 'active',
      hubName: 'Central Farmers Collective',
      availableItems: ['Seeds', 'Compost', 'Water containers'],
      hours: '9 AM - 3 PM, Mon-Sat',
    },
    {
      id: 'hub-003',
      type: 'offer',
      mode: 'hubs',
      category: 'supplier_hub',
      title: 'Relief Agriculture Station',
      quantity: 1,
      unit: 'hub',
      locationLabel: 'South Gaza – Distribution Center',
      distanceBand: 'far',
      urgency: 'any',
      trust: 'ngo',
      notes: 'NGO-operated supply center.',
      createdAt: Date.now() - 86400000 * 60,
      status: 'active',
      hubName: 'Relief Agriculture Station',
      availableItems: ['Seeds', 'Tools', 'Training materials'],
      hours: '8 AM - 2 PM, Sun-Thu',
    },
  ];
}
