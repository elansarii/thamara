/**
 * Crop database for Thamara MVP
 * Optimized for Mediterranean/Gaza-like conditions with focus on:
 * - Short harvest cycles
 * - Low water requirements
 * - Salinity/heat tolerance
 * - High caloric/resource efficiency
 * 
 * Data sources: Agricultural research, FAO crop databases, regional farming practices
 */

export type WaterNeedBand = 'low' | 'medium' | 'high';
export type ToleranceLevel = 'low' | 'medium' | 'high';
export type SeedingRateType = 'g_per_m2' | 'seeds_per_m2';

export interface CropData {
  id: string;
  commonName: string;
  scientificName: string;
  preferredPlantingMonths: number[]; // 1-12
  harvestDaysMin: number;
  harvestDaysMax: number;
  waterNeedBand: WaterNeedBand;
  salinityTolerance: ToleranceLevel;
  heatTolerance: ToleranceLevel;
  caloriesPer100g: number;
  typicalYieldKgPerM2: number;
  waterProxyLitersPerM2PerCycle: number;
  seeding: {
    seedingRate: {
      type: SeedingRateType;
      min: number;
      max: number;
    };
    spacingCm: {
      row: number;
      plant: number;
    };
    germinationRateDefault: number;
    bufferPercentDefault: number;
  };
  practices: string[];
  sources: {
    wikipediaTitle: string;
    fallbackImagePath: string;
    localDescription: string;
  };
}

export const CROPS: CropData[] = [
  {
    id: 'radish',
    commonName: 'Radish',
    scientificName: 'Raphanus sativus',
    preferredPlantingMonths: [2, 3, 4, 9, 10, 11],
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
    practices: [
      'Plant in well-drained soil to prevent root rot',
      'Mulch to retain moisture and keep roots cool',
      'Use drip irrigation at soil level to minimize water loss',
      'Harvest promptly when mature to prevent splitting',
      'Thin seedlings to proper spacing for optimal root development',
    ],
    sources: {
      wikipediaTitle: 'Radish',
      fallbackImagePath: '/crops/radish.jpg',
      localDescription: 'Fast-growing root vegetable ideal for quick harvests in limited water conditions.',
    },
  },
  {
    id: 'lettuce',
    commonName: 'Lettuce',
    scientificName: 'Lactuca sativa',
    preferredPlantingMonths: [2, 3, 4, 9, 10, 11],
    harvestDaysMin: 45,
    harvestDaysMax: 60,
    waterNeedBand: 'medium',
    salinityTolerance: 'low',
    heatTolerance: 'low',
    caloriesPer100g: 15,
    typicalYieldKgPerM2: 3.0,
    waterProxyLitersPerM2PerCycle: 80,
    seeding: {
      seedingRate: { type: 'g_per_m2', min: 0.5, max: 1.5 },
      spacingCm: { row: 25, plant: 20 },
      germinationRateDefault: 0.80,
      bufferPercentDefault: 0.20,
    },
    practices: [
      'Plant in partial shade during hot months to prevent bolting',
      'Use shade cloth (30-50%) during peak summer heat',
      'Apply mulch to cool soil and retain moisture',
      'Harvest outer leaves first for continuous production',
      'Avoid overhead watering to prevent disease',
    ],
    sources: {
      wikipediaTitle: 'Lettuce',
      fallbackImagePath: '/crops/lettuce.jpg',
      localDescription: 'Leafy green best grown in cooler months with shade protection in Mediterranean climates.',
    },
  },
  {
    id: 'spinach',
    commonName: 'Spinach',
    scientificName: 'Spinacia oleracea',
    preferredPlantingMonths: [2, 3, 4, 9, 10, 11],
    harvestDaysMin: 40,
    harvestDaysMax: 50,
    waterNeedBand: 'medium',
    salinityTolerance: 'medium',
    heatTolerance: 'low',
    caloriesPer100g: 23,
    typicalYieldKgPerM2: 2.8,
    waterProxyLitersPerM2PerCycle: 70,
    seeding: {
      seedingRate: { type: 'g_per_m2', min: 10, max: 15 },
      spacingCm: { row: 20, plant: 8 },
      germinationRateDefault: 0.75,
      bufferPercentDefault: 0.20,
    },
    practices: [
      'Plant in cool season or provide afternoon shade',
      'Ensure consistent moisture to prevent early bolting',
      'Use drip irrigation to avoid leaf diseases',
      'Harvest outer leaves for extended production',
      'Add compost to improve soil water retention',
    ],
    sources: {
      wikipediaTitle: 'Spinach',
      fallbackImagePath: '/crops/spinach.jpg',
      localDescription: 'Nutrient-dense leafy green suitable for cool-season growing with moderate salinity tolerance.',
    },
  },
  {
    id: 'tomato-cherry',
    commonName: 'Cherry Tomato',
    scientificName: 'Solanum lycopersicum var. cerasiforme',
    preferredPlantingMonths: [3, 4, 5],
    harvestDaysMin: 60,
    harvestDaysMax: 75,
    waterNeedBand: 'medium',
    salinityTolerance: 'medium',
    heatTolerance: 'high',
    caloriesPer100g: 18,
    typicalYieldKgPerM2: 4.5,
    waterProxyLitersPerM2PerCycle: 120,
    seeding: {
      seedingRate: { type: 'seeds_per_m2', min: 3, max: 5 },
      spacingCm: { row: 60, plant: 50 },
      germinationRateDefault: 0.80,
      bufferPercentDefault: 0.15,
    },
    practices: [
      'Mulch heavily to conserve water and regulate soil temperature',
      'Use drip irrigation to deliver water directly to roots',
      'Prune suckers to focus energy on fruit production',
      'Stake or cage plants for support and air circulation',
      'Consider determinate varieties for more predictable harvest timing',
    ],
    sources: {
      wikipediaTitle: 'Cherry_tomato',
      fallbackImagePath: '/crops/cherry-tomato.jpg',
      localDescription: 'Heat-tolerant, high-yielding tomato variety well-suited for warm Mediterranean summers.',
    },
  },
  {
    id: 'swiss-chard',
    commonName: 'Swiss Chard',
    scientificName: 'Beta vulgaris subsp. vulgaris',
    preferredPlantingMonths: [3, 4, 5, 9, 10],
    harvestDaysMin: 50,
    harvestDaysMax: 60,
    waterNeedBand: 'medium',
    salinityTolerance: 'high',
    heatTolerance: 'high',
    caloriesPer100g: 19,
    typicalYieldKgPerM2: 3.5,
    waterProxyLitersPerM2PerCycle: 75,
    seeding: {
      seedingRate: { type: 'g_per_m2', min: 6, max: 10 },
      spacingCm: { row: 30, plant: 15 },
      germinationRateDefault: 0.80,
      bufferPercentDefault: 0.15,
    },
    practices: [
      'Excellent choice for saline soils - one of the most salt-tolerant vegetables',
      'Harvest outer leaves continuously for prolonged production',
      'Mulch to keep roots cool and conserve moisture',
      'Tolerates both heat and light frost',
      'If salinity is high, flush soil with fresh water occasionally',
    ],
    sources: {
      wikipediaTitle: 'Chard',
      fallbackImagePath: '/crops/swiss-chard.jpg',
      localDescription: 'Highly salt-tolerant leafy green ideal for challenging soil conditions.',
    },
  },
  {
    id: 'cucumber',
    commonName: 'Cucumber',
    scientificName: 'Cucumis sativus',
    preferredPlantingMonths: [4, 5, 6],
    harvestDaysMin: 50,
    harvestDaysMax: 65,
    waterNeedBand: 'high',
    salinityTolerance: 'low',
    heatTolerance: 'high',
    caloriesPer100g: 16,
    typicalYieldKgPerM2: 5.0,
    waterProxyLitersPerM2PerCycle: 150,
    seeding: {
      seedingRate: { type: 'seeds_per_m2', min: 4, max: 6 },
      spacingCm: { row: 60, plant: 40 },
      germinationRateDefault: 0.85,
      bufferPercentDefault: 0.10,
    },
    practices: [
      'Requires consistent moisture - ideal for plots with reliable water',
      'Mulch heavily to reduce evaporation and cool roots',
      'Use drip irrigation to maintain steady soil moisture',
      'Train vines vertically to save space and improve air flow',
      'Harvest regularly to encourage continued production',
    ],
    sources: {
      wikipediaTitle: 'Cucumber',
      fallbackImagePath: '/crops/cucumber.jpg',
      localDescription: 'High-yielding crop requiring reliable water access; best for plots with irrigation.',
    },
  },
  {
    id: 'arugula',
    commonName: 'Arugula (Rocket)',
    scientificName: 'Eruca vesicaria',
    preferredPlantingMonths: [2, 3, 4, 9, 10, 11],
    harvestDaysMin: 30,
    harvestDaysMax: 40,
    waterNeedBand: 'low',
    salinityTolerance: 'medium',
    heatTolerance: 'medium',
    caloriesPer100g: 25,
    typicalYieldKgPerM2: 2.0,
    waterProxyLitersPerM2PerCycle: 40,
    seeding: {
      seedingRate: { type: 'g_per_m2', min: 3, max: 5 },
      spacingCm: { row: 15, plant: 10 },
      germinationRateDefault: 0.85,
      bufferPercentDefault: 0.15,
    },
    practices: [
      'Very fast harvest cycle - ideal for quick food production',
      'Plant in succession every 2 weeks for continuous supply',
      'Grows well with minimal water once established',
      'Harvest leaves when young for best flavor',
      'Can tolerate partial shade in hot months',
    ],
    sources: {
      wikipediaTitle: 'Eruca_vesicaria',
      fallbackImagePath: '/crops/arugula.jpg',
      localDescription: 'Fast-growing, low-water salad green perfect for frequent succession planting.',
    },
  },
  {
    id: 'turnip',
    commonName: 'Turnip',
    scientificName: 'Brassica rapa',
    preferredPlantingMonths: [2, 3, 4, 9, 10, 11],
    harvestDaysMin: 45,
    harvestDaysMax: 60,
    waterNeedBand: 'low',
    salinityTolerance: 'medium',
    heatTolerance: 'medium',
    caloriesPer100g: 28,
    typicalYieldKgPerM2: 3.0,
    waterProxyLitersPerM2PerCycle: 50,
    seeding: {
      seedingRate: { type: 'g_per_m2', min: 5, max: 8 },
      spacingCm: { row: 20, plant: 10 },
      germinationRateDefault: 0.85,
      bufferPercentDefault: 0.15,
    },
    practices: [
      'Dual-purpose crop: harvest greens early, roots later',
      'Low water requirements compared to other root crops',
      'Mulch to prevent soil crusting and aid germination',
      'Thin seedlings for optimal root development',
      'Both roots and greens are edible and nutritious',
    ],
    sources: {
      wikipediaTitle: 'Turnip',
      fallbackImagePath: '/crops/turnip.jpg',
      localDescription: 'Versatile root crop with edible greens, suitable for low-water conditions.',
    },
  },
  {
    id: 'zucchini',
    commonName: 'Zucchini',
    scientificName: 'Cucurbita pepo',
    preferredPlantingMonths: [4, 5, 6],
    harvestDaysMin: 45,
    harvestDaysMax: 55,
    waterNeedBand: 'medium',
    salinityTolerance: 'medium',
    heatTolerance: 'high',
    caloriesPer100g: 17,
    typicalYieldKgPerM2: 6.0,
    waterProxyLitersPerM2PerCycle: 100,
    seeding: {
      seedingRate: { type: 'seeds_per_m2', min: 2, max: 3 },
      spacingCm: { row: 90, plant: 60 },
      germinationRateDefault: 0.90,
      bufferPercentDefault: 0.10,
    },
    practices: [
      'Exceptionally productive - one of highest yields per square meter',
      'Mulch around plants to conserve moisture and suppress weeds',
      'Use drip irrigation at base of plants',
      'Harvest young fruits frequently to encourage continued production',
      'Good heat tolerance makes it suitable for summer growing',
    ],
    sources: {
      wikipediaTitle: 'Zucchini',
      fallbackImagePath: '/crops/zucchini.jpg',
      localDescription: 'Highly productive summer squash with excellent heat tolerance and yield.',
    },
  },
  {
    id: 'green-bean',
    commonName: 'Green Bean (Bush)',
    scientificName: 'Phaseolus vulgaris',
    preferredPlantingMonths: [3, 4, 5, 9],
    harvestDaysMin: 50,
    harvestDaysMax: 60,
    waterNeedBand: 'medium',
    salinityTolerance: 'low',
    heatTolerance: 'medium',
    caloriesPer100g: 31,
    typicalYieldKgPerM2: 2.5,
    waterProxyLitersPerM2PerCycle: 70,
    seeding: {
      seedingRate: { type: 'seeds_per_m2', min: 15, max: 20 },
      spacingCm: { row: 45, plant: 10 },
      germinationRateDefault: 0.80,
      bufferPercentDefault: 0.15,
    },
    practices: [
      'Bush varieties require less space and no staking',
      'Nitrogen-fixing legume improves soil for future crops',
      'Mulch to maintain soil moisture and temperature',
      'Pick regularly to encourage continued pod production',
      'Avoid overhead watering to prevent fungal diseases',
    ],
    sources: {
      wikipediaTitle: 'Green_bean',
      fallbackImagePath: '/crops/green-bean.jpg',
      localDescription: 'Productive legume that enriches soil while providing nutritious pods.',
    },
  },
  {
    id: 'carrot',
    commonName: 'Carrot',
    scientificName: 'Daucus carota',
    preferredPlantingMonths: [2, 3, 4, 9, 10],
    harvestDaysMin: 60,
    harvestDaysMax: 80,
    waterNeedBand: 'medium',
    salinityTolerance: 'low',
    heatTolerance: 'medium',
    caloriesPer100g: 41,
    typicalYieldKgPerM2: 3.5,
    waterProxyLitersPerM2PerCycle: 80,
    seeding: {
      seedingRate: { type: 'g_per_m2', min: 2, max: 4 },
      spacingCm: { row: 20, plant: 5 },
      germinationRateDefault: 0.70,
      bufferPercentDefault: 0.25,
    },
    practices: [
      'Requires loose, well-drained soil for straight root development',
      'Keep soil consistently moist during germination (10-14 days)',
      'Mulch after germination to retain moisture',
      'Thin seedlings to proper spacing for optimal root size',
      'Avoid fresh manure which can cause forked roots',
    ],
    sources: {
      wikipediaTitle: 'Carrot',
      fallbackImagePath: '/crops/carrot.jpg',
      localDescription: 'Nutritious root crop requiring consistent moisture and loose soil.',
    },
  },
  {
    id: 'kale',
    commonName: 'Kale',
    scientificName: 'Brassica oleracea var. sabellica',
    preferredPlantingMonths: [2, 3, 4, 9, 10, 11],
    harvestDaysMin: 50,
    harvestDaysMax: 70,
    waterNeedBand: 'medium',
    salinityTolerance: 'medium',
    heatTolerance: 'medium',
    caloriesPer100g: 49,
    typicalYieldKgPerM2: 3.0,
    waterProxyLitersPerM2PerCycle: 75,
    seeding: {
      seedingRate: { type: 'g_per_m2', min: 1.5, max: 3 },
      spacingCm: { row: 40, plant: 30 },
      germinationRateDefault: 0.80,
      bufferPercentDefault: 0.15,
    },
    practices: [
      'Highly nutritious - one of the most nutrient-dense crops',
      'Harvest outer leaves continuously for extended production',
      'Tolerates light frost and cooler temperatures',
      'Mulch to conserve moisture and cool roots',
      'Can produce for several months with proper care',
    ],
    sources: {
      wikipediaTitle: 'Kale',
      fallbackImagePath: '/crops/kale.jpg',
      localDescription: 'Nutrient-dense leafy green suitable for cool-season growing with extended harvest period.',
    },
  },
];

export function getCropById(id: string): CropData | undefined {
  return CROPS.find(crop => crop.id === id);
}

export function getCropsByIds(ids: string[]): CropData[] {
  return ids.map(id => getCropById(id)).filter((crop): crop is CropData => crop !== undefined);
}
