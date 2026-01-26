/**
 * Seed quantity calculator for Thamara MVP
 * Calculates seed requirements with transparent assumptions for:
 * - Area-based seeding rates
 * - Germination rate adjustments
 * - Buffer for failures/replanting
 * - Spacing recommendations
 */

import type { CropData } from '@/data/crops';

export interface SeedCalculationInput {
  plotAreaM2: number;
  crop: CropData;
  overrideGerminationRate?: number; // 0-1
  overrideBufferPercent?: number; // 0-1
}

export interface SeedCalculationResult {
  seedAmountMin: number;
  seedAmountMax: number;
  unit: string; // 'g' or 'seeds'
  spacingGuide: {
    rowCm: number;
    plantCm: number;
    plantsPerM2: number;
  };
  assumptions: {
    germinationRate: number;
    bufferPercent: number;
    baseRateMin: number;
    baseRateMax: number;
  };
  formula: string; // Human-readable formula explanation
}

/**
 * Calculate seed requirements for a given plot and crop
 */
export function calculateSeedRequirements(
  input: SeedCalculationInput
): SeedCalculationResult {
  const { plotAreaM2, crop, overrideGerminationRate, overrideBufferPercent } = input;
  
  const germinationRate = overrideGerminationRate ?? crop.seeding.germinationRateDefault;
  const bufferPercent = overrideBufferPercent ?? crop.seeding.bufferPercentDefault;
  
  const { seedingRate, spacingCm } = crop.seeding;
  
  // Calculate base amount needed
  const baseMin = seedingRate.min * plotAreaM2;
  const baseMax = seedingRate.max * plotAreaM2;
  
  // Adjust for germination rate
  const germinationAdjustedMin = baseMin / germinationRate;
  const germinationAdjustedMax = baseMax / germinationRate;
  
  // Add buffer for failures/replanting
  const finalMin = germinationAdjustedMin * (1 + bufferPercent);
  const finalMax = germinationAdjustedMax * (1 + bufferPercent);
  
  // Calculate plants per m2 based on spacing
  const plantsPerM2 = calculatePlantsPerM2(spacingCm.row, spacingCm.plant);
  
  // Determine unit
  const unit = seedingRate.type === 'g_per_m2' ? 'g' : 'seeds';
  
  // Build formula explanation
  const formula = buildFormulaExplanation(
    plotAreaM2,
    seedingRate,
    germinationRate,
    bufferPercent,
    unit
  );
  
  return {
    seedAmountMin: Math.ceil(finalMin),
    seedAmountMax: Math.ceil(finalMax),
    unit,
    spacingGuide: {
      rowCm: spacingCm.row,
      plantCm: spacingCm.plant,
      plantsPerM2,
    },
    assumptions: {
      germinationRate,
      bufferPercent,
      baseRateMin: seedingRate.min,
      baseRateMax: seedingRate.max,
    },
    formula,
  };
}

/**
 * Calculate how many plants fit per square meter given spacing
 */
function calculatePlantsPerM2(rowCm: number, plantCm: number): number {
  const rowsPerM = 100 / rowCm;
  const plantsPerRow = 100 / plantCm;
  return Math.floor(rowsPerM * plantsPerRow);
}

/**
 * Build human-readable formula explanation
 */
function buildFormulaExplanation(
  area: number,
  seedingRate: { min: number; max: number },
  germinationRate: number,
  bufferPercent: number,
  unit: string
): string {
  const germPercent = Math.round(germinationRate * 100);
  const bufferPercentDisplay = Math.round(bufferPercent * 100);
  
  return `(${area} m² × ${seedingRate.min}-${seedingRate.max} ${unit}/m²) ÷ ${germPercent}% germination + ${bufferPercentDisplay}% buffer`;
}

/**
 * Get seeding rate category for UI display
 */
export function getSeedingRateCategory(
  crop: CropData
): 'very-light' | 'light' | 'moderate' | 'heavy' {
  const { seedingRate } = crop.seeding;
  
  if (seedingRate.type === 'g_per_m2') {
    const avg = (seedingRate.min + seedingRate.max) / 2;
    if (avg < 3) return 'very-light';
    if (avg < 7) return 'light';
    if (avg < 12) return 'moderate';
    return 'heavy';
  } else {
    // seeds_per_m2
    const avg = (seedingRate.min + seedingRate.max) / 2;
    if (avg < 5) return 'very-light';
    if (avg < 10) return 'light';
    if (avg < 20) return 'moderate';
    return 'heavy';
  }
}

/**
 * Estimate total plants from seed amount
 */
export function estimatePlantCount(
  seedAmount: number,
  crop: CropData,
  germinationRate?: number
): number {
  const rate = germinationRate ?? crop.seeding.germinationRateDefault;
  
  if (crop.seeding.seedingRate.type === 'seeds_per_m2') {
    return Math.floor(seedAmount * rate);
  } else {
    // For weight-based, we need to know seeds per gram
    // This is crop-specific; use rough estimates
    const seedsPerGram = estimateSeedsPerGram(crop.id);
    return Math.floor(seedAmount * seedsPerGram * rate);
  }
}

/**
 * Rough estimates of seeds per gram for common crops
 */
function estimateSeedsPerGram(cropId: string): number {
  const estimates: Record<string, number> = {
    radish: 100,
    lettuce: 800,
    spinach: 100,
    arugula: 500,
    turnip: 250,
    carrot: 800,
    kale: 250,
    'green-bean': 3,
    'swiss-chard': 50,
  };
  return estimates[cropId] ?? 100; // default fallback
}

/**
 * Calculate spacing for a given area to determine row/plant layout
 */
export function calculatePlantingLayout(
  plotAreaM2: number,
  crop: CropData
): {
  totalRows: number;
  plantsPerRow: number;
  totalPlants: number;
  rowLengthM: number;
} {
  const { spacingCm } = crop.seeding;
  
  // Assume square plot for simplicity
  const sideLengthM = Math.sqrt(plotAreaM2);
  const sideLengthCm = sideLengthM * 100;
  
  const totalRows = Math.floor(sideLengthCm / spacingCm.row);
  const plantsPerRow = Math.floor(sideLengthCm / spacingCm.plant);
  const totalPlants = totalRows * plantsPerRow;
  
  return {
    totalRows,
    plantsPerRow,
    totalPlants,
    rowLengthM: sideLengthM,
  };
}
