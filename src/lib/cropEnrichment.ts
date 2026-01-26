/**
 * Crop enrichment layer for Thamara MVP
 * Fetches real crop images and info from Wikipedia/Wikimedia
 * Caches results offline-first with fallback to local data
 */

import type { CropData } from '@/data/crops';

export interface EnrichedCropData {
  crop: CropData;
  imageUrl: string;
  imageSource: 'wikipedia' | 'local' | 'cached';
  description: string;
  descriptionSource: 'wikipedia' | 'local' | 'cached';
  lastUpdated?: string;
  cacheAge?: number; // days
}

export interface WikipediaSummary {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
    width: number;
    height: number;
  };
}

const CACHE_PREFIX = 'thamara_crop_cache_';
const CACHE_VERSION = 'v1';
const CACHE_EXPIRY_DAYS = 30;

/**
 * Enrich crop data with images and descriptions
 * Uses cached data if available and fresh, otherwise fetches from Wikipedia
 */
export async function enrichCropData(crop: CropData): Promise<EnrichedCropData> {
  // Check cache first
  const cached = getCachedEnrichment(crop.id);
  if (cached && !isCacheExpired(cached.lastUpdated)) {
    return {
      ...cached,
      cacheAge: getCacheAgeDays(cached.lastUpdated),
    };
  }
  
  // Try to fetch from Wikipedia
  try {
    const summary = await fetchWikipediaSummary(crop.sources.wikipediaTitle);
    
    const enriched: EnrichedCropData = {
      crop,
      imageUrl: summary.thumbnail?.source || summary.originalimage?.source || crop.sources.fallbackImagePath,
      imageSource: summary.thumbnail?.source ? 'wikipedia' : 'local',
      description: summary.extract || crop.sources.localDescription,
      descriptionSource: summary.extract ? 'wikipedia' : 'local',
      lastUpdated: new Date().toISOString(),
      cacheAge: 0,
    };
    
    // Cache the result
    cacheEnrichment(crop.id, enriched);
    
    return enriched;
  } catch (error) {
    console.warn(`Failed to enrich crop ${crop.id} from Wikipedia:`, error);
    
    // Return cached if available, even if expired
    if (cached) {
      return {
        ...cached,
        cacheAge: getCacheAgeDays(cached.lastUpdated),
      };
    }
    
    // Fall back to local data
    return {
      crop,
      imageUrl: crop.sources.fallbackImagePath,
      imageSource: 'local',
      description: crop.sources.localDescription,
      descriptionSource: 'local',
    };
  }
}

/**
 * Enrich multiple crops in parallel
 */
export async function enrichMultipleCrops(crops: CropData[]): Promise<EnrichedCropData[]> {
  const promises = crops.map(crop => enrichCropData(crop));
  return Promise.all(promises);
}

/**
 * Fetch Wikipedia summary for a crop
 */
async function fetchWikipediaSummary(title: string): Promise<WikipediaSummary> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'ThamaraApp/1.0 (https://thamara.app; support@thamara.app)',
      'Api-User-Agent': 'ThamaraApp/1.0 (https://thamara.app; support@thamara.app)',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Wikipedia API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  return {
    title: data.title,
    extract: data.extract,
    thumbnail: data.thumbnail,
    originalimage: data.originalimage,
  };
}

/**
 * Cache enriched data in localStorage
 */
function cacheEnrichment(cropId: string, enriched: EnrichedCropData): void {
  try {
    const cacheKey = `${CACHE_PREFIX}${CACHE_VERSION}_${cropId}`;
    const cacheData = {
      cropId,
      imageUrl: enriched.imageUrl,
      imageSource: enriched.imageSource,
      description: enriched.description,
      descriptionSource: enriched.descriptionSource,
      lastUpdated: enriched.lastUpdated,
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to cache enrichment:', error);
  }
}

/**
 * Get cached enrichment data
 */
function getCachedEnrichment(cropId: string): EnrichedCropData | null {
  try {
    const cacheKey = `${CACHE_PREFIX}${CACHE_VERSION}_${cropId}`;
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    
    // Need to reconstruct the full crop data
    // In a real app, we might cache the full crop or fetch it separately
    // For now, we'll rely on the enrichCropData function to handle this
    return data as EnrichedCropData;
  } catch (error) {
    console.warn('Failed to get cached enrichment:', error);
    return null;
  }
}

/**
 * Check if cache is expired
 */
function isCacheExpired(lastUpdated?: string): boolean {
  if (!lastUpdated) return true;
  
  const age = getCacheAgeDays(lastUpdated);
  return age > CACHE_EXPIRY_DAYS;
}

/**
 * Get cache age in days
 */
function getCacheAgeDays(lastUpdated?: string): number {
  if (!lastUpdated) return Infinity;
  
  const updated = new Date(lastUpdated);
  const now = new Date();
  const diffMs = now.getTime() - updated.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  return Math.floor(diffDays);
}

/**
 * Clear all cached enrichments
 */
export function clearEnrichmentCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

/**
 * Get cache status for all crops
 */
export function getCacheStatus(crops: CropData[]): {
  cached: number;
  fresh: number;
  expired: number;
  missing: number;
} {
  let cached = 0;
  let fresh = 0;
  let expired = 0;
  let missing = 0;
  
  crops.forEach(crop => {
    const cachedData = getCachedEnrichment(crop.id);
    if (cachedData) {
      cached++;
      if (isCacheExpired(cachedData.lastUpdated)) {
        expired++;
      } else {
        fresh++;
      }
    } else {
      missing++;
    }
  });
  
  return { cached, fresh, expired, missing };
}

/**
 * Preload and cache enrichments for all crops (background task)
 */
export async function preloadEnrichments(
  crops: CropData[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  for (let i = 0; i < crops.length; i++) {
    try {
      await enrichCropData(crops[i]);
      onProgress?.(i + 1, crops.length);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.warn(`Failed to preload crop ${crops[i].id}:`, error);
    }
  }
}
