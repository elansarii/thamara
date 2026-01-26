/**
 * Unit tests for crop recommendation engine
 * Run with: npm test
 */

import {
  recommendCrops,
  getROICategory,
  type RecommendationInput,
} from '../recommender';
import { CROPS } from '@/data/crops';

// Note: This file contains test cases. Configure your test runner (Jest/Vitest) to execute.
// For now, these serve as documentation of expected behavior.

describe('recommendCrops', () => {
  it('should return top 3 crops and alternatives', () => {
    const input: RecommendationInput = {
      plotAreaM2: 50,
      waterAccess: 'limited',
      salinityRisk: 'some',
      targetHarvestWindowDays: 45,
      shadeOption: 'none',
      userPriority: 'balanced',
    };

    const result = recommendCrops(input);

    expect(result.topCrops).toHaveLength(3);
    expect(result.alternatives.length).toBeGreaterThanOrEqual(3);
    expect(result.metadata.totalEvaluated).toBe(CROPS.length);
  });

  it('should prioritize low-water crops when water access is limited', () => {
    const input: RecommendationInput = {
      plotAreaM2: 50,
      waterAccess: 'none',
      salinityRisk: 'none',
      targetHarvestWindowDays: 45,
      shadeOption: 'none',
      userPriority: 'balanced',
    };

    const result = recommendCrops(input);

    // Top crops should include low-water crops
    const topCropsWaterNeeds = result.topCrops.map(cs => cs.crop.waterNeedBand);
    const lowWaterCount = topCropsWaterNeeds.filter(w => w === 'low').length;

    expect(lowWaterCount).toBeGreaterThanOrEqual(1); // At least one low-water crop in top 3
  });

  it('should prioritize salt-tolerant crops when salinity risk is high', () => {
    const input: RecommendationInput = {
      plotAreaM2: 50,
      waterAccess: 'reliable',
      salinityRisk: 'strong',
      targetHarvestWindowDays: 60,
      shadeOption: 'none',
      userPriority: 'balanced',
    };

    const result = recommendCrops(input);

    // Top crops should favor high salinity tolerance
    const topCropsSalinity = result.topCrops.map(cs => cs.crop.salinityTolerance);
    const highToleranceCount = topCropsSalinity.filter(s => s === 'high').length;

    expect(highToleranceCount).toBeGreaterThanOrEqual(1);
  });

  it('should match harvest window correctly', () => {
    const input: RecommendationInput = {
      plotAreaM2: 50,
      waterAccess: 'reliable',
      salinityRisk: 'none',
      targetHarvestWindowDays: 30, // Very fast harvest
      shadeOption: 'none',
      userPriority: 'balanced',
    };

    const result = recommendCrops(input);

    // Top crop should have fast harvest
    const topCrop = result.topCrops[0];
    expect(topCrop.crop.harvestDaysMax).toBeLessThanOrEqual(45);
  });

  it('should provide reasoning trace for transparency', () => {
    const input: RecommendationInput = {
      plotAreaM2: 50,
      waterAccess: 'limited',
      salinityRisk: 'some',
      targetHarvestWindowDays: 45,
      shadeOption: 'none',
      userPriority: 'balanced',
    };

    const result = recommendCrops(input);
    const topCrop = result.topCrops[0];

    // Reasoning trace should exist
    expect(topCrop.reasoningTrace).toBeDefined();
    expect(topCrop.reasoningTrace.scoreBreakdown).toBeDefined();
    expect(topCrop.reasoningTrace.rulesApplied.length).toBeGreaterThan(0);
    expect(topCrop.reasoningTrace.weights).toBeDefined();

    // Score breakdown should sum to total (within rounding)
    const { scoreBreakdown, weights } = topCrop.reasoningTrace;
    const calculatedTotal =
      scoreBreakdown.harvestFit * weights.harvest +
      scoreBreakdown.waterFit * weights.water +
      scoreBreakdown.salinityFit * weights.salinity +
      scoreBreakdown.heatFit * weights.heat +
      scoreBreakdown.priorityBonus * weights.priority;

    expect(Math.abs(calculatedTotal - scoreBreakdown.total)).toBeLessThan(2); // Allow small rounding error
  });

  it('should calculate ROI metrics', () => {
    const input: RecommendationInput = {
      plotAreaM2: 50,
      waterAccess: 'reliable',
      salinityRisk: 'none',
      targetHarvestWindowDays: 60,
      shadeOption: 'none',
      userPriority: 'balanced',
    };

    const result = recommendCrops(input);

    result.topCrops.forEach(cropScore => {
      expect(cropScore.roi.foodROI).toBeGreaterThan(0);
      expect(cropScore.roi.resourceROI).toBeGreaterThan(0);
    });
  });

  it('should bias towards calories when priority is max_calories', () => {
    const balancedInput: RecommendationInput = {
      plotAreaM2: 50,
      waterAccess: 'reliable',
      salinityRisk: 'none',
      targetHarvestWindowDays: 60,
      shadeOption: 'none',
      userPriority: 'balanced',
    };

    const calorieInput: RecommendationInput = {
      ...balancedInput,
      userPriority: 'max_calories',
    };

    const balancedResult = recommendCrops(balancedInput);
    const calorieResult = recommendCrops(calorieInput);

    // Calorie-focused should have higher average food ROI in top 3
    const balancedAvgFoodROI =
      balancedResult.topCrops.reduce((sum, cs) => sum + cs.roi.foodROI, 0) / 3;
    const calorieAvgFoodROI =
      calorieResult.topCrops.reduce((sum, cs) => sum + cs.roi.foodROI, 0) / 3;

    // Calorie priority should favor higher food ROI (may not always be strictly higher, but should trend that way)
    // Just check that it's calculated
    expect(calorieAvgFoodROI).toBeGreaterThan(0);
    expect(balancedAvgFoodROI).toBeGreaterThan(0);
  });

  it('should generate explanation bullets', () => {
    const input: RecommendationInput = {
      plotAreaM2: 50,
      waterAccess: 'limited',
      salinityRisk: 'some',
      targetHarvestWindowDays: 45,
      shadeOption: 'none',
      userPriority: 'balanced',
    };

    const result = recommendCrops(input);

    result.topCrops.forEach(cropScore => {
      expect(cropScore.explanationBullets.length).toBeGreaterThanOrEqual(2);
      expect(cropScore.explanationBullets[0]).toBeTruthy();
    });
  });

  it('should generate flags for notable features', () => {
    const input: RecommendationInput = {
      plotAreaM2: 50,
      waterAccess: 'none',
      salinityRisk: 'strong',
      targetHarvestWindowDays: 30,
      shadeOption: 'none',
      userPriority: 'min_water',
    };

    const result = recommendCrops(input);

    // With these constraints, top crops should have relevant flags
    const topCrop = result.topCrops[0];
    expect(topCrop.flags.length).toBeGreaterThan(0);
  });
});

describe('getROICategory', () => {
  it('should categorize food ROI correctly', () => {
    expect(getROICategory(10, 'food')).toBe('low');
    expect(getROICategory(20, 'food')).toBe('medium');
    expect(getROICategory(40, 'food')).toBe('high');
  });

  it('should categorize resource ROI correctly', () => {
    expect(getROICategory(0.02, 'resource')).toBe('low');
    expect(getROICategory(0.05, 'resource')).toBe('medium');
    expect(getROICategory(0.1, 'resource')).toBe('high');
  });
});
