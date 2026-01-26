/**
 * Exchange Hub Matching Algorithm
 * Deterministic "AI Match" scoring with explainability
 */

import type {
  Listing,
  MatchScore,
  UserContext,
  ListingType,
  InputCategory,
} from './exchangeTypes';

// Crop-to-input mapping for compatibility bonus
const CROP_INPUT_NEEDS: Record<string, InputCategory[]> = {
  tomato: ['seeds', 'fertilizer', 'irrigation'],
  cucumber: ['seeds', 'fertilizer', 'irrigation'],
  radish: ['seeds', 'tools'],
  lettuce: ['seeds', 'irrigation'],
  pepper: ['seeds', 'fertilizer', 'irrigation'],
  eggplant: ['seeds', 'fertilizer', 'irrigation'],
  zucchini: ['seeds', 'fertilizer', 'irrigation'],
  onion: ['seeds', 'tools'],
  carrot: ['seeds', 'tools'],
  spinach: ['seeds', 'irrigation'],
  mint: ['seeds', 'irrigation'],
  parsley: ['seeds'],
};

/**
 * Compute match score for a listing against user context
 */
export function computeMatchScore(
  listing: Listing,
  userContext: UserContext
): MatchScore {
  let score = 0;
  const reasons: string[] = [];

  // Only match active listings
  if (listing.status !== 'active') {
    return { listingId: listing.id, score: 0, topReasons: ['Listing not active'] };
  }

  // Category fit (30 points)
  if (userContext.selectedCrop && listing.mode === 'inputs') {
    const cropNeeds = CROP_INPUT_NEEDS[userContext.selectedCrop.toLowerCase()] || [];
    if (cropNeeds.includes(listing.category as InputCategory)) {
      score += 30;
      reasons.push(`Perfect for ${userContext.selectedCrop}`);
    } else {
      score += 10;
    }
  } else {
    score += 15; // Base category score
  }

  // Urgency alignment (20 points)
  if (listing.urgency === 'today') {
    score += 20;
    reasons.push('Available today');
  } else if (listing.urgency === 'week') {
    score += 15;
    reasons.push('Available this week');
  } else {
    score += 10;
  }

  // Trust level (15 points)
  if (listing.trust === 'verified_hub') {
    score += 15;
    reasons.push('Verified hub');
  } else if (listing.trust === 'ngo') {
    score += 12;
    reasons.push('NGO-backed');
  } else {
    score += 8;
    reasons.push('Community member');
  }

  // Distance band (15 points)
  if (listing.distanceBand === 'near') {
    score += 15;
    reasons.push('Nearby location');
  } else if (listing.distanceBand === 'medium') {
    score += 10;
  } else {
    score += 5;
  }

  // Type bonus for requests (20 points)
  if (listing.type === 'offer') {
    score += 20;
    reasons.push('Available offer');
  } else {
    score += 10;
  }

  // Compatibility bonus (20 points)
  if (userContext.selectedCrop && listing.mode === 'inputs') {
    const cropNeeds = CROP_INPUT_NEEDS[userContext.selectedCrop.toLowerCase()] || [];
    if (cropNeeds.includes(listing.category as InputCategory)) {
      score += 20;
      reasons.push(`Matches your ${userContext.selectedCrop} crop plan`);
    }
  }

  // Ensure score is capped at 100
  score = Math.min(score, 100);

  // Return top 3 reasons
  return {
    listingId: listing.id,
    score,
    topReasons: reasons.slice(0, 3),
  };
}

/**
 * Get ranked matches for a listing or current user context
 */
export function getRankedMatches(
  listings: Listing[],
  userContext: UserContext,
  currentListingId?: string
): MatchScore[] {
  // Filter out the current listing if provided
  const candidateListings = currentListingId
    ? listings.filter(l => l.id !== currentListingId)
    : listings;

  // Compute scores
  const matches = candidateListings.map(listing =>
    computeMatchScore(listing, userContext)
  );

  // Sort by score descending
  return matches
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Filter listings based on criteria
 */
export function filterListings(
  listings: Listing[],
  filters: {
    searchQuery?: string;
    type?: ListingType;
    category?: string;
    distanceBand?: 'near' | 'any';
    trust?: boolean; // verified only
    urgency?: string;
    mode?: string;
  }
): Listing[] {
  let filtered = [...listings];

  // Mode filter
  if (filters.mode) {
    filtered = filtered.filter(l => l.mode === filters.mode);
  }

  // Search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      l =>
        l.title.toLowerCase().includes(query) ||
        l.locationLabel.toLowerCase().includes(query) ||
        l.notes?.toLowerCase().includes(query)
    );
  }

  // Type filter
  if (filters.type) {
    filtered = filtered.filter(l => l.type === filters.type);
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(l => l.category === filters.category);
  }

  // Distance filter
  if (filters.distanceBand === 'near') {
    filtered = filtered.filter(l => l.distanceBand === 'near');
  }

  // Trust filter
  if (filters.trust) {
    filtered = filtered.filter(
      l => l.trust === 'verified_hub' || l.trust === 'ngo'
    );
  }

  // Urgency filter
  if (filters.urgency && filters.urgency !== 'any') {
    filtered = filtered.filter(l => l.urgency === filters.urgency);
  }

  return filtered;
}

/**
 * Sort listings
 */
export function sortListings(
  listings: Listing[],
  sortBy: 'ai_match' | 'newest' | 'closest' | 'quantity',
  userContext?: UserContext
): Listing[] {
  const sorted = [...listings];

  switch (sortBy) {
    case 'ai_match':
      if (userContext) {
        const matches = getRankedMatches(listings, userContext);
        const scoreMap = new Map(matches.map(m => [m.listingId, m.score]));
        sorted.sort((a, b) => (scoreMap.get(b.id) || 0) - (scoreMap.get(a.id) || 0));
      }
      break;
    case 'newest':
      sorted.sort((a, b) => b.createdAt - a.createdAt);
      break;
    case 'closest':
      const distanceOrder = { near: 0, medium: 1, far: 2 };
      sorted.sort(
        (a, b) => distanceOrder[a.distanceBand] - distanceOrder[b.distanceBand]
      );
      break;
    case 'quantity':
      sorted.sort((a, b) => b.quantity - a.quantity);
      break;
  }

  return sorted;
}
