/**
 * Storage utilities for OrgBridge feature
 * Manages local persistence of funding cases and related data
 */

import type { FundingCase, BundleTemplate, Supplier } from './orgBridgeTypes';

const CASES_KEY = 'thamara_funding_cases';
const TEMPLATES_KEY = 'thamara_bundle_templates';

export function loadFundingCases(): FundingCase[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(CASES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load funding cases:', error);
    return [];
  }
}

export function saveFundingCases(cases: FundingCase[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CASES_KEY, JSON.stringify(cases));
  } catch (error) {
    console.error('Failed to save funding cases:', error);
  }
}

export function addFundingCase(fundingCase: FundingCase): void {
  const cases = loadFundingCases();
  cases.unshift(fundingCase);
  saveFundingCases(cases);
}

export function updateFundingCase(id: string, updates: Partial<FundingCase>): void {
  const cases = loadFundingCases();
  const index = cases.findIndex(c => c.id === id);
  
  if (index !== -1) {
    cases[index] = { ...cases[index], ...updates };
    saveFundingCases(cases);
  }
}

export function getFundingCaseById(id: string): FundingCase | undefined {
  const cases = loadFundingCases();
  return cases.find(c => c.id === id);
}

export function generateCaseId(): string {
  return `case_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateReceiptToken(): string {
  return `RCT${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

// Demo suppliers data
export function getDemoSuppliers(): Supplier[] {
  return [
    {
      id: 'sup_1',
      name: 'Gaza Agricultural Relief Network',
      type: 'ngo_hub',
      trustScore: 98,
      categories: ['seeds', 'fertilizer', 'tools'],
      locationLabel: 'Central Gaza',
    },
    {
      id: 'sup_2',
      name: 'Palestinian Farmers Cooperative',
      type: 'coop',
      trustScore: 95,
      categories: ['seeds', 'irrigation'],
      locationLabel: 'Northern Region',
    },
    {
      id: 'sup_3',
      name: 'Green Hope Verified Supplier',
      type: 'verified_supplier',
      trustScore: 92,
      categories: ['seeds', 'soil_amendment', 'tools'],
      locationLabel: 'Khan Younis',
    },
    {
      id: 'sup_4',
      name: 'Unity Agricultural Hub',
      type: 'ngo_hub',
      trustScore: 97,
      categories: ['seeds', 'fertilizer', 'training'],
      locationLabel: 'Rafah',
    },
  ];
}

// Demo bundle templates
export function getDemoBundleTemplates(): BundleTemplate[] {
  return [
    {
      id: 'tpl_1',
      name: 'Small Plot Starter',
      description: 'Essential inputs for 25-50 m² plot',
      targetPlotSize: 'small',
      items: [
        { name: 'Lettuce Seeds (Fast Harvest)', quantity: 50, unit: 'g', whyIncluded: 'Quick harvest (30 days), low water needs' },
        { name: 'Radish Seeds (Fast Harvest)', quantity: 30, unit: 'g', whyIncluded: '25-day harvest cycle, salinity tolerant' },
        { name: 'Compost (Soil Amendment)', quantity: 10, unit: 'kg', whyIncluded: 'Improves damaged soil structure' },
        { name: 'Basic Hand Tools Kit', quantity: 1, unit: 'set', whyIncluded: 'Essential for plot preparation' },
        { name: 'Drip Irrigation Basic', quantity: 20, unit: 'm', whyIncluded: 'Maximizes water efficiency' },
      ],
      estimatedCost: 120,
    },
    {
      id: 'tpl_2',
      name: 'Medium Plot Package',
      description: 'Comprehensive bundle for 50-100 m²',
      targetPlotSize: 'medium',
      items: [
        { name: 'Mixed Salad Seeds', quantity: 100, unit: 'g', whyIncluded: 'Diverse harvest, 30-40 days' },
        { name: 'Cherry Tomato Seeds', quantity: 20, unit: 'g', whyIncluded: 'High value, 55-day harvest' },
        { name: 'Swiss Chard Seeds', quantity: 40, unit: 'g', whyIncluded: 'Heat tolerant, continuous harvest' },
        { name: 'Organic Compost', quantity: 25, unit: 'kg', whyIncluded: 'Restores soil health' },
        { name: 'Drip Tape System', quantity: 50, unit: 'm', whyIncluded: 'Water-efficient irrigation' },
        { name: 'Tool Set + Storage', quantity: 1, unit: 'kit', whyIncluded: 'Complete cultivation tools' },
      ],
      estimatedCost: 280,
    },
    {
      id: 'tpl_3',
      name: 'Large Plot Bundle',
      description: 'Full support for 100+ m² operations',
      targetPlotSize: 'large',
      items: [
        { name: 'Fast-Harvest Seed Mix', quantity: 200, unit: 'g', whyIncluded: 'Multiple quick cycles' },
        { name: 'Root Vegetable Mix', quantity: 150, unit: 'g', whyIncluded: 'Storage-friendly crops' },
        { name: 'Leafy Greens Variety', quantity: 120, unit: 'g', whyIncluded: 'Continuous production' },
        { name: 'Soil Amendment Package', quantity: 50, unit: 'kg', whyIncluded: 'Large area restoration' },
        { name: 'Complete Drip System', quantity: 100, unit: 'm', whyIncluded: 'Full plot coverage' },
        { name: 'Professional Tool Kit', quantity: 1, unit: 'set', whyIncluded: 'Heavy-duty equipment' },
        { name: 'Labor Support Credit', quantity: 5, unit: 'days', whyIncluded: 'Assists with setup & harvest' },
      ],
      estimatedCost: 550,
    },
  ];
}
