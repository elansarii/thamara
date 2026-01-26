/**
 * Crop recommendation engine for Thamara MVP
 * Explainable "AI" scoring system based on:
 * - Water availability constraints
 * - Salinity tolerance requirements
 * - Heat tolerance
 * - Harvest timing fit
 * - ROI priorities (calories vs water efficiency)
 * 
 * All scoring is transparent and traceable - no black box ML
 */

import type { CropData } from '@/data/crops';
import { CROPS } from '@/data/crops';

export type WaterAccess = 'none' | 'limited' | 'reliable';
export type SalinityRisk = 'none' | 'some' | 'strong';
export type ShadeOption = 'none' | 'partial' | 'roof';
export type UserPriority = 'max_calories' | 'min_water' | 'balanced';

export interface RecommendationInput {
  plotAreaM2: number;
  waterAccess: WaterAccess;
  salinityRisk: SalinityRisk;
  targetHarvestWindowDays: number;
  shadeOption: ShadeOption;
  userPriority: UserPriority;
  currentMonth?: number; // 1-12, for heat tolerance assessment
}

export interface CropScore {
  crop: CropData;
  fitScore: number; // 0-100
  confidence: number; // 0-100
  flags: string[];
  explanationBullets: string[];
  reasoningTrace: ReasoningTrace;
  roi: {
    foodROI: number; // calories per m² per day
    resourceROI: number; // kg per liter proxy
  };
}

export interface ReasoningTrace {
  scoreBreakdown: {
    harvestFit: number;
    waterFit: number;
    salinityFit: number;
    heatFit: number;
    priorityBonus: number;
    total: number;
  };
  rulesApplied: string[];
  weights: Record<string, number>;
  constraintsSatisfied: number;
  totalConstraints: number;
}

export interface RecommendationResult {
  topCrops: CropScore[]; // top 3
  alternatives: CropScore[]; // next 3-5
  metadata: {
    totalEvaluated: number;
    timestamp: string;
    inputSummary: string;
  };
}

/**
 * Main recommendation engine
 */
export function recommendCrops(input: RecommendationInput): RecommendationResult {
  const currentMonth = input.currentMonth ?? new Date().getMonth() + 1;
  
  // Score all crops
  const scores = CROPS.map(crop => scoreCrop(crop, input, currentMonth));
  
  // Sort by fit score descending
  scores.sort((a, b) => b.fitScore - a.fitScore);
  
  // Split into top and alternatives
  const topCrops = scores.slice(0, 3);
  const alternatives = scores.slice(3, 8);
  
  return {
    topCrops,
    alternatives,
    metadata: {
      totalEvaluated: CROPS.length,
      timestamp: new Date().toISOString(),
      inputSummary: generateInputSummary(input),
    },
  };
}

/**
 * Score a single crop against constraints
 */
function scoreCrop(
  crop: CropData,
  input: RecommendationInput,
  currentMonth: number
): CropScore {
  const { waterAccess, salinityRisk, targetHarvestWindowDays, userPriority } = input;
  
  // Calculate ROI metrics
  const harvestDaysMid = (crop.harvestDaysMin + crop.harvestDaysMax) / 2;
  const caloriesPerKg = crop.caloriesPer100g * 10;
  const foodROI = (crop.typicalYieldKgPerM2 * caloriesPerKg) / harvestDaysMid;
  const resourceROI = crop.typicalYieldKgPerM2 / crop.waterProxyLitersPerM2PerCycle;
  
  // Score components (0-100 each)
  const harvestFit = scoreHarvestFit(crop, targetHarvestWindowDays);
  const waterFit = scoreWaterFit(crop, waterAccess);
  const salinityFit = scoreSalinityFit(crop, salinityRisk);
  const heatFit = scoreHeatFit(crop, currentMonth);
  
  // Priority bonus
  const priorityBonus = scorePriorityBonus(crop, userPriority, foodROI, resourceROI);
  
  // Weights for different components
  const weights = {
    harvest: 0.25,
    water: 0.25,
    salinity: 0.20,
    heat: 0.15,
    priority: 0.15,
  };
  
  // Calculate weighted total
  const total =
    harvestFit * weights.harvest +
    waterFit * weights.water +
    salinityFit * weights.salinity +
    heatFit * weights.heat +
    priorityBonus * weights.priority;
  
  // Count constraints satisfied
  const constraintsSatisfied = [
    harvestFit > 60,
    waterFit > 60,
    salinityFit > 60,
    heatFit > 60,
  ].filter(Boolean).length;
  
  // Confidence is derived from constraints satisfied
  const confidence = (constraintsSatisfied / 4) * 100;
  
  // Generate flags and explanations
  const flags = generateFlags(crop, harvestFit, waterFit, salinityFit, heatFit);
  const explanationBullets = generateExplanation(
    crop,
    input,
    { harvestFit, waterFit, salinityFit, heatFit },
    foodROI,
    resourceROI
  );
  
  // Rules applied
  const rulesApplied = generateRulesApplied(crop, input, {
    harvestFit,
    waterFit,
    salinityFit,
    heatFit,
  });
  
  return {
    crop,
    fitScore: Math.round(total),
    confidence: Math.round(confidence),
    flags,
    explanationBullets,
    reasoningTrace: {
      scoreBreakdown: {
        harvestFit: Math.round(harvestFit),
        waterFit: Math.round(waterFit),
        salinityFit: Math.round(salinityFit),
        heatFit: Math.round(heatFit),
        priorityBonus: Math.round(priorityBonus),
        total: Math.round(total),
      },
      rulesApplied,
      weights,
      constraintsSatisfied,
      totalConstraints: 4,
    },
    roi: {
      foodROI: Math.round(foodROI),
      resourceROI: Math.round(resourceROI * 100) / 100,
    },
  };
}

/**
 * Score how well crop's harvest window matches target
 */
function scoreHarvestFit(crop: CropData, targetDays: number): number {
  const { harvestDaysMin, harvestDaysMax } = crop;
  
  // Perfect score if target is within crop's harvest window
  if (targetDays >= harvestDaysMin && targetDays <= harvestDaysMax) {
    return 100;
  }
  
  // Partial score if close
  const midPoint = (harvestDaysMin + harvestDaysMax) / 2;
  const distance = Math.abs(targetDays - midPoint);
  
  // Decay score with distance
  const score = Math.max(0, 100 - distance * 2);
  return score;
}

/**
 * Score water fit based on crop needs vs availability
 */
function scoreWaterFit(crop: CropData, waterAccess: WaterAccess): number {
  const { waterNeedBand } = crop;
  
  const fitMatrix: Record<WaterAccess, Record<typeof waterNeedBand, number>> = {
    none: { low: 100, medium: 40, high: 10 },
    limited: { low: 90, medium: 70, high: 40 },
    reliable: { low: 80, medium: 100, high: 100 },
  };
  
  return fitMatrix[waterAccess][waterNeedBand];
}

/**
 * Score salinity tolerance fit
 */
function scoreSalinityFit(crop: CropData, salinityRisk: SalinityRisk): number {
  const { salinityTolerance } = crop;
  
  const fitMatrix: Record<SalinityRisk, Record<typeof salinityTolerance, number>> = {
    none: { low: 100, medium: 100, high: 100 },
    some: { low: 50, medium: 85, high: 100 },
    strong: { low: 20, medium: 60, high: 100 },
  };
  
  return fitMatrix[salinityRisk][salinityTolerance];
}

/**
 * Score heat tolerance based on current month
 */
function scoreHeatFit(crop: CropData, currentMonth: number): number {
  const { heatTolerance, preferredPlantingMonths } = crop;
  
  // Hot months in Mediterranean climate: 6, 7, 8, 9
  const isHotMonth = [6, 7, 8, 9].includes(currentMonth);
  
  // Check if current month is in preferred planting window
  const isPreferredMonth = preferredPlantingMonths.includes(currentMonth);
  
  if (isPreferredMonth) {
    return 100; // Always good if in preferred window
  }
  
  if (isHotMonth) {
    // Penalize low heat tolerance in hot months
    const heatScores = { low: 40, medium: 70, high: 100 };
    return heatScores[heatTolerance];
  }
  
  // Moderate score for non-preferred, non-hot months
  return 70;
}

/**
 * Bonus score based on user priority
 */
function scorePriorityBonus(
  crop: CropData,
  priority: UserPriority,
  foodROI: number,
  resourceROI: number
): number {
  // Normalize ROI values to 0-100 scale
  const normalizedFoodROI = Math.min(100, (foodROI / 50) * 100); // 50 cal/m²/day as reference
  const normalizedResourceROI = Math.min(100, (resourceROI / 0.05) * 100); // 0.05 kg/L as reference
  
  if (priority === 'max_calories') {
    return normalizedFoodROI;
  } else if (priority === 'min_water') {
    return normalizedResourceROI;
  } else {
    // balanced
    return (normalizedFoodROI + normalizedResourceROI) / 2;
  }
}

/**
 * Generate flag labels for crop
 */
function generateFlags(
  crop: CropData,
  harvestFit: number,
  waterFit: number,
  salinityFit: number,
  heatFit: number
): string[] {
  const flags: string[] = [];
  
  if (crop.harvestDaysMax <= 40) flags.push('Fast harvest');
  if (crop.waterNeedBand === 'low') flags.push('Low water');
  if (crop.salinityTolerance === 'high') flags.push('Salinity tolerant');
  if (crop.heatTolerance === 'high') flags.push('Heat tolerant');
  if (harvestFit >= 90) flags.push('Perfect timing');
  if (waterFit >= 90) flags.push('Water-efficient');
  if (crop.typicalYieldKgPerM2 >= 4) flags.push('High yield');
  
  return flags;
}

/**
 * Generate explanation bullets
 */
function generateExplanation(
  crop: CropData,
  input: RecommendationInput,
  scores: { harvestFit: number; waterFit: number; salinityFit: number; heatFit: number },
  foodROI: number,
  resourceROI: number
): string[] {
  const bullets: string[] = [];
  
  // Harvest timing
  if (scores.harvestFit >= 80) {
    bullets.push(
      `Harvest in ${crop.harvestDaysMin}-${crop.harvestDaysMax} days matches your ${input.targetHarvestWindowDays}-day target`
    );
  } else {
    bullets.push(
      `Harvest in ${crop.harvestDaysMin}-${crop.harvestDaysMax} days (your target: ${input.targetHarvestWindowDays} days)`
    );
  }
  
  // Water fit
  if (input.waterAccess === 'none' || input.waterAccess === 'limited') {
    if (crop.waterNeedBand === 'low') {
      bullets.push(`Low water requirements ideal for ${input.waterAccess} water access`);
    } else if (crop.waterNeedBand === 'high') {
      bullets.push(`High water needs may be challenging with ${input.waterAccess} water access`);
    }
  }
  
  // Salinity
  if (input.salinityRisk !== 'none') {
    if (crop.salinityTolerance === 'high') {
      bullets.push(`Excellent salinity tolerance for ${input.salinityRisk} salinity risk`);
    } else if (crop.salinityTolerance === 'low') {
      bullets.push(`Limited salinity tolerance - may struggle with ${input.salinityRisk} salinity`);
    }
  }
  
  // ROI
  if (input.userPriority === 'max_calories' || input.userPriority === 'balanced') {
    bullets.push(`Produces ~${Math.round(foodROI)} calories per m² per day`);
  }
  
  if (input.userPriority === 'min_water' || input.userPriority === 'balanced') {
    bullets.push(`Water efficiency: ~${resourceROI.toFixed(2)} kg per liter`);
  }
  
  return bullets;
}

/**
 * Generate list of rules that were applied
 */
function generateRulesApplied(
  crop: CropData,
  input: RecommendationInput,
  scores: { harvestFit: number; waterFit: number; salinityFit: number; heatFit: number }
): string[] {
  const rules: string[] = [];
  
  rules.push(`HARVEST_FIT: Target ${input.targetHarvestWindowDays}d vs crop ${crop.harvestDaysMin}-${crop.harvestDaysMax}d → ${Math.round(scores.harvestFit)}/100`);
  rules.push(`WATER_FIT: ${input.waterAccess} water × ${crop.waterNeedBand} need → ${Math.round(scores.waterFit)}/100`);
  rules.push(`SALINITY_FIT: ${input.salinityRisk} risk × ${crop.salinityTolerance} tolerance → ${Math.round(scores.salinityFit)}/100`);
  rules.push(`HEAT_FIT: ${crop.heatTolerance} heat tolerance → ${Math.round(scores.heatFit)}/100`);
  rules.push(`PRIORITY_WEIGHT: ${input.userPriority}`);
  
  return rules;
}

/**
 * Generate input summary for metadata
 */
function generateInputSummary(input: RecommendationInput): string {
  return `${input.plotAreaM2}m² plot, ${input.waterAccess} water, ${input.salinityRisk} salinity, ${input.targetHarvestWindowDays}d harvest, priority: ${input.userPriority}`;
}

/**
 * Get ROI category for UI display
 */
export function getROICategory(value: number, type: 'food' | 'resource'): 'low' | 'medium' | 'high' {
  if (type === 'food') {
    // Food ROI (calories per m² per day)
    if (value < 15) return 'low';
    if (value < 30) return 'medium';
    return 'high';
  } else {
    // Resource ROI (kg per liter)
    if (value < 0.03) return 'low';
    if (value < 0.06) return 'medium';
    return 'high';
  }
}
