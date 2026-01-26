/**
 * Exchange Hub Local Storage Utilities
 * Offline-first persistence for listings and bundles
 */

import type { Listing, RequestBundle } from './exchangeTypes';

const LISTINGS_KEY = 'thamara_exchange_listings';
const BUNDLES_KEY = 'thamara_exchange_bundles';

/**
 * Load all listings from localStorage
 */
export function loadListings(): Listing[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(LISTINGS_KEY);
    if (!stored) return getDefaultListings();
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : getDefaultListings();
  } catch (error) {
    console.error('Failed to load listings:', error);
    return getDefaultListings();
  }
}

/**
 * Save listings to localStorage
 */
export function saveListings(listings: Listing[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
  } catch (error) {
    console.error('Failed to save listings:', error);
  }
}

/**
 * Add a new listing
 */
export function addListing(listing: Omit<Listing, 'id' | 'createdAt' | 'status'>): Listing {
  const newListing: Listing = {
    ...listing,
    id: `listing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    status: 'active',
  };
  
  const listings = loadListings();
  listings.unshift(newListing);
  saveListings(listings);
  
  return newListing;
}

/**
 * Update a listing
 */
export function updateListing(id: string, updates: Partial<Listing>): void {
  const listings = loadListings();
  const index = listings.findIndex(l => l.id === id);
  
  if (index !== -1) {
    listings[index] = { ...listings[index], ...updates };
    saveListings(listings);
  }
}

/**
 * Delete a listing
 */
export function deleteListing(id: string): void {
  const listings = loadListings();
  const filtered = listings.filter(l => l.id !== id);
  saveListings(filtered);
}

/**
 * Load request bundles
 */
export function loadBundles(): RequestBundle[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(BUNDLES_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load bundles:', error);
    return [];
  }
}

/**
 * Save a request bundle
 */
export function saveBundle(bundle: Omit<RequestBundle, 'id' | 'createdAt'>): RequestBundle {
  const newBundle: RequestBundle = {
    ...bundle,
    id: `bundle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
  };
  
  const bundles = loadBundles();
  bundles.unshift(newBundle);
  
  try {
    localStorage.setItem(BUNDLES_KEY, JSON.stringify(bundles));
  } catch (error) {
    console.error('Failed to save bundle:', error);
  }
  
  return newBundle;
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
    
    // LABOR & TRANSPORT - Day Labor
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
    
    // LABOR & TRANSPORT - Harvest Help
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
    
    // LABOR & TRANSPORT - Transport
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
    
    // LABOR & TRANSPORT - Containers
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
