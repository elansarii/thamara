/**
 * AI Logic for Drops + OrgBridge
 * Deterministic intelligence that feels advanced without real ML
 */

import type { HarvestDrop, BuyerMatch, SpoilageRisk, DropSortOption, DropFilters, QuantityBand } from './dropsTypes';
import type { BundleTemplate, FundingCase } from './orgBridgeTypes';
import { CROPS } from '@/data/crops';

/**
 * AI Spoilage Risk Calculator
 * Based on crop type, window length, and transport availability
 */
export function calculateSpoilageRisk(
  cropType: string,
  windowLengthHours: number,
  pickupPreference: string
): SpoilageRisk {
  // High-risk crops (leafy greens, berries)
  const highRiskCrops = ['lettuce', 'spinach', 'arugula', 'kale'];
  
  // Medium-risk crops (soft vegetables)
  const mediumRiskCrops = ['tomato', 'cucumber', 'zucchini'];
  
  const cropLower = cropType.toLowerCase();
  const isHighRisk = highRiskCrops.some(c => cropLower.includes(c));
  const isMediumRisk = mediumRiskCrops.some(c => cropLower.includes(c));
  
  // Base risk from crop type
  let riskScore = 0;
  if (isHighRisk) riskScore += 40;
  else if (isMediumRisk) riskScore += 25;
  else riskScore += 10;
  
  // Window length risk (longer = higher risk)
  if (windowLengthHours > 48) riskScore += 30;
  else if (windowLengthHours > 24) riskScore += 15;
  else if (windowLengthHours > 12) riskScore += 5;
  
  // Pickup preference (same-day reduces risk)
  if (pickupPreference === 'any') riskScore += 20;
  else if (pickupPreference === '24h') riskScore += 10;
  
  if (riskScore >= 60) return 'high';
  if (riskScore >= 30) return 'medium';
  return 'low';
}

/**
 * AI Drop Priority Score
 * Combines urgency, spoilage risk, and coordination factors
 */
export function calculateDropPriority(drop: HarvestDrop): number {
  const now = new Date();
  const windowStart = new Date(drop.windowStart);
  const windowEnd = new Date(drop.windowEnd);
  
  const hoursUntilStart = (windowStart.getTime() - now.getTime()) / (1000 * 60 * 60);
  const windowLengthHours = (windowEnd.getTime() - windowStart.getTime()) / (1000 * 60 * 60);
  
  let score = 50; // Base score
  
  // Urgency: approaching window = higher priority
  if (hoursUntilStart < 24) score += 40;
  else if (hoursUntilStart < 48) score += 30;
  else if (hoursUntilStart < 72) score += 20;
  else score += 5;
  
  // Spoilage risk
  if (drop.spoilageRisk === 'high') score += 30;
  else if (drop.spoilageRisk === 'medium') score += 15;
  else score += 5;
  
  // Same-day pickup preference
  if (drop.pickupPreference === 'same_day') score += 20;
  else if (drop.pickupPreference === '24h') score += 10;
  
  // Active status
  if (drop.status === 'active') score += 10;
  
  return Math.min(100, Math.max(0, score));
}

/**
 * AI Buyer Matching
 * Ranks potential buyers/aggregators by fit
 */
export function rankBuyerMatches(drop: HarvestDrop): BuyerMatch[] {
  // Demo buyer database
  const demoBuyers: Omit<BuyerMatch, 'matchScore' | 'matchReasons'>[] = [
    {
      id: 'buyer_1',
      name: 'Fresh Gaza Cooperative',
      type: 'aggregator',
      distanceBand: 'near',
      capacityFit: 'can_handle',
      availableWindow: { start: drop.windowStart, end: drop.windowEnd },
      trustScore: 95,
      contactMethod: 'Local coordinator',
    },
    {
      id: 'buyer_2',
      name: 'Relief Network Hub #3',
      type: 'ngo',
      distanceBand: 'near',
      capacityFit: 'exact',
      availableWindow: { start: drop.windowStart, end: drop.windowEnd },
      trustScore: 98,
      contactMethod: 'Hub pickup service',
    },
    {
      id: 'buyer_3',
      name: 'Community Market Pool',
      type: 'verified_hub',
      distanceBand: 'medium',
      capacityFit: 'can_handle',
      availableWindow: { start: drop.windowStart, end: drop.windowEnd },
      trustScore: 92,
      contactMethod: 'Pooled transport',
    },
    {
      id: 'buyer_4',
      name: 'Northern District Buyer',
      type: 'buyer',
      distanceBand: 'far',
      capacityFit: 'limited',
      availableWindow: { start: drop.windowStart, end: drop.windowEnd },
      trustScore: 85,
      contactMethod: 'Direct contact',
    },
    {
      id: 'buyer_5',
      name: 'Agricultural Solidarity Coop',
      type: 'aggregator',
      distanceBand: 'medium',
      capacityFit: 'can_handle',
      availableWindow: { start: drop.windowStart, end: drop.windowEnd },
      trustScore: 90,
      contactMethod: 'Coop coordinator',
    },
  ];
  
  const matches = demoBuyers.map(buyer => {
    let score = 0;
    const reasons: string[] = [];
    
    // Trust score (highest weight)
    if (buyer.trustScore >= 95) {
      score += 35;
      reasons.push('Highly trusted partner');
    } else if (buyer.trustScore >= 90) {
      score += 25;
      reasons.push('Verified trusted hub');
    } else {
      score += 15;
    }
    
    // Distance (very important for no-fridge)
    if (buyer.distanceBand === 'near') {
      score += 30;
      reasons.push('Very close pickup');
    } else if (buyer.distanceBand === 'medium') {
      score += 20;
      reasons.push('Reasonable distance');
    } else {
      score += 5;
    }
    
    // Capacity fit
    if (buyer.capacityFit === 'exact') {
      score += 20;
      reasons.push('Perfect quantity match');
    } else if (buyer.capacityFit === 'can_handle') {
      score += 15;
      reasons.push('Can handle volume');
    } else {
      score += 5;
    }
    
    // Buyer type preference (NGO/verified > aggregator > buyer)
    if (buyer.type === 'ngo' || buyer.type === 'verified_hub') {
      score += 15;
      reasons.push('Verified organization');
    } else if (buyer.type === 'aggregator') {
      score += 10;
      reasons.push('Experienced aggregator');
    } else {
      score += 5;
    }
    
    return {
      ...buyer,
      matchScore: Math.min(100, score),
      matchReasons: reasons.slice(0, 3), // Top 3 reasons
    };
  });
  
  // Sort by match score
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * AI Bundle Fit Recommendation
 * Suggests bundle template based on plot size and crop plan
 */
export function recommendBundleTemplate(
  plotSizeM2?: number,
  targetCrop?: string
): BundleTemplate {
  // Determine plot size band
  let sizeBand: 'small' | 'medium' | 'large' = 'medium';
  if (plotSizeM2) {
    if (plotSizeM2 < 50) sizeBand = 'small';
    else if (plotSizeM2 > 100) sizeBand = 'large';
  }
  
  // Import templates from storage
  const { getDemoBundleTemplates } = require('./orgBridgeStorage');
  const templates = getDemoBundleTemplates();
  
  // Find matching template
  const match = templates.find((t: BundleTemplate) => t.targetPlotSize === sizeBand);
  return match || templates[1]; // Default to medium if not found
}

/**
 * Filter and sort drops
 */
export function filterAndSortDrops(
  drops: HarvestDrop[],
  filters: DropFilters,
  sortBy: DropSortOption
): HarvestDrop[] {
  let filtered = [...drops];
  
  // Apply status filter
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter(d => filters.status!.includes(d.status));
  }
  
  // Apply pickup preference filter
  if (filters.pickupPreference && filters.pickupPreference.length > 0) {
    filtered = filtered.filter(d => filters.pickupPreference!.includes(d.pickupPreference));
  }
  
  // Apply quantity band filter
  if (filters.quantityBand && filters.quantityBand.length > 0) {
    filtered = filtered.filter(d => {
      const avgQty = (d.quantityMin + d.quantityMax) / 2;
      let band: QuantityBand;
      if (avgQty < 10) band = 'small';
      else if (avgQty < 50) band = 'medium';
      else band = 'large';
      return filters.quantityBand!.includes(band);
    });
  }
  
  // Apply search filter
  if (filters.search && filters.search.trim()) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(d =>
      d.cropCommonName.toLowerCase().includes(query) ||
      d.locationLabel.toLowerCase().includes(query) ||
      d.notes?.toLowerCase().includes(query)
    );
  }
  
  // Sort
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'ai_priority':
        return calculateDropPriority(b) - calculateDropPriority(a);
      case 'soonest':
        return new Date(a.windowStart).getTime() - new Date(b.windowStart).getTime();
      case 'largest':
        return (b.quantityMax + b.quantityMin) - (a.quantityMax + a.quantityMin);
      default:
        return 0;
    }
  });
  
  return filtered;
}

/**
 * Get quantity band label
 */
export function getQuantityBand(min: number, max: number): QuantityBand {
  const avg = (min + max) / 2;
  if (avg < 10) return 'small';
  if (avg < 50) return 'medium';
  return 'large';
}

/**
 * Format time until window
 */
export function formatTimeUntilWindow(windowStart: string): string {
  const now = new Date();
  const start = new Date(windowStart);
  const hours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hours < 0) return 'In progress';
  if (hours < 6) return `${Math.round(hours)}h away`;
  if (hours < 24) return 'Today';
  if (hours < 48) return 'Tomorrow';
  const days = Math.round(hours / 24);
  return `${days} days`;
}
