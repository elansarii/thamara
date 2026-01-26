/**
 * Unit tests for seed calculation module
 * Run with: npm test
 */

import {
  calculateSeedRequirements,
  getSeedingRateCategory,
  estimatePlantCount,
  calculatePlantingLayout,
} from '../seedCalc';
import type { CropData } from '@/data/crops';

// Note: This file contains test cases. Configure your test runner (Jest/Vitest) to execute.
// For now, these serve as documentation of expected behavior.

// Mock crop for testing
const mockCrop: CropData = {
  id: 'test-radish',
  commonName: 'Test Radish',
  scientificName: 'Raphanus test',
  preferredPlantingMonths: [3, 4],
  harvestDaysMin: 25,
  harvestDaysMax: 35,
  waterNeedBand: 'low',
  salinityTolerance: 'medium',
  heatTolerance: 'medium',
  caloriesPer100g: 16,
  typicalYieldKgPerM2: 2.5,
  waterProxyLitersPerM2PerCycle: 35,
  seeding: {
    seedingRate: { type: 'g_per_m2', min: 8, max: 12 },
    spacingCm: { row: 15, plant: 5 },
    germinationRateDefault: 0.85,
    bufferPercentDefault: 0.15,
  },
  practices: ['Practice 1', 'Practice 2'],
  sources: {
    wikipediaTitle: 'Radish',
    fallbackImagePath: '/crops/radish.jpg',
    localDescription: 'Test crop',
  },
};

describe('calculateSeedRequirements', () => {
  it('should calculate correct seed amounts for basic input', () => {
    const result = calculateSeedRequirements({
      plotAreaM2: 10,
      crop: mockCrop,
    });

    // Base: 10m² × 8-12 g/m² = 80-120g
    // Adjusted for germination: 80/0.85 ≈ 94, 120/0.85 ≈ 141
    // With buffer: 94 × 1.15 ≈ 108, 141 × 1.15 ≈ 162
    expect(result.seedAmountMin).toBeGreaterThanOrEqual(105);
    expect(result.seedAmountMin).toBeLessThanOrEqual(110);
    expect(result.seedAmountMax).toBeGreaterThanOrEqual(160);
    expect(result.seedAmountMax).toBeLessThanOrEqual(165);
    expect(result.unit).toBe('g');
  });

  it('should respect custom germination rate', () => {
    const result = calculateSeedRequirements({
      plotAreaM2: 10,
      crop: mockCrop,
      overrideGerminationRate: 0.5, // Lower germination rate
    });

    // Should require more seeds with lower germination rate
    expect(result.seedAmountMin).toBeGreaterThan(150);
    expect(result.assumptions.germinationRate).toBe(0.5);
  });

  it('should respect custom buffer percentage', () => {
    const result = calculateSeedRequirements({
      plotAreaM2: 10,
      crop: mockCrop,
      overrideBufferPercent: 0.3, // Higher buffer
    });

    // Should require more seeds with higher buffer
    expect(result.assumptions.bufferPercent).toBe(0.3);
  });

  it('should calculate spacing guide correctly', () => {
    const result = calculateSeedRequirements({
      plotAreaM2: 10,
      crop: mockCrop,
    });

    expect(result.spacingGuide.rowCm).toBe(15);
    expect(result.spacingGuide.plantCm).toBe(5);
    // 100cm / 15cm rows = 6.67 → 6 rows per meter
    // 100cm / 5cm plants = 20 plants per meter
    // 6 × 20 = 120 plants per m²
    expect(result.spacingGuide.plantsPerM2).toBeGreaterThanOrEqual(100);
  });

  it('should include formula explanation', () => {
    const result = calculateSeedRequirements({
      plotAreaM2: 10,
      crop: mockCrop,
    });

    expect(result.formula).toContain('10');
    expect(result.formula).toContain('85%');
    expect(result.formula).toContain('15%');
  });
});

describe('getSeedingRateCategory', () => {
  it('should categorize weight-based seeding rates', () => {
    const lightCrop: CropData = {
      ...mockCrop,
      seeding: {
        ...mockCrop.seeding,
        seedingRate: { type: 'g_per_m2', min: 1, max: 2 },
      },
    };

    const heavyCrop: CropData = {
      ...mockCrop,
      seeding: {
        ...mockCrop.seeding,
        seedingRate: { type: 'g_per_m2', min: 15, max: 20 },
      },
    };

    expect(getSeedingRateCategory(lightCrop)).toBe('very-light');
    expect(getSeedingRateCategory(heavyCrop)).toBe('heavy');
    expect(getSeedingRateCategory(mockCrop)).toBe('moderate');
  });

  it('should categorize seed-based seeding rates', () => {
    const seedCrop: CropData = {
      ...mockCrop,
      seeding: {
        ...mockCrop.seeding,
        seedingRate: { type: 'seeds_per_m2', min: 3, max: 5 },
      },
    };

    expect(getSeedingRateCategory(seedCrop)).toBe('very-light');
  });
});

describe('calculatePlantingLayout', () => {
  it('should calculate planting layout for square plot', () => {
    const result = calculatePlantingLayout(100, mockCrop); // 10m × 10m plot

    // 1000cm / 15cm rows = 66 rows
    // 1000cm / 5cm plants = 200 plants per row
    expect(result.totalRows).toBeGreaterThanOrEqual(65);
    expect(result.plantsPerRow).toBeGreaterThanOrEqual(195);
    expect(result.rowLengthM).toBeCloseTo(10, 1);
  });

  it('should handle small plots', () => {
    const result = calculatePlantingLayout(1, mockCrop); // 1m × 1m plot

    // 100cm / 15cm rows = 6 rows
    // 100cm / 5cm plants = 20 plants per row
    expect(result.totalRows).toBeGreaterThanOrEqual(6);
    expect(result.plantsPerRow).toBeGreaterThanOrEqual(19);
  });
});

describe('estimatePlantCount', () => {
  it('should estimate plant count from seed amount', () => {
    // 100g of radish seeds with 85% germination
    const count = estimatePlantCount(100, mockCrop);

    // Assuming ~100 seeds per gram for radish
    // 100g × 100 seeds/g × 0.85 = 8500 plants
    expect(count).toBeGreaterThan(5000);
    expect(count).toBeLessThan(10000);
  });

  it('should respect custom germination rate', () => {
    const count = estimatePlantCount(100, mockCrop, 0.5);

    // Lower germination = fewer plants
    expect(count).toBeLessThan(estimatePlantCount(100, mockCrop, 0.85));
  });
});
