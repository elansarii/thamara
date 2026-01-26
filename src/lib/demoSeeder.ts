/**
 * Demo data seeder for Drops + OrgBridge
 * Creates sample data for demonstration purposes
 */

import type { HarvestDrop, PickupPreference } from './dropsTypes';
import type { FundingCase, CaseStatus, BundleItem } from './orgBridgeTypes';
import { saveDrops, generateDropId } from './dropsStorage';
import { saveFundingCases, generateCaseId, generateItemId, generateReceiptToken } from './orgBridgeStorage';
import { calculateSpoilageRisk } from './dropsAI';

export function seedDemoDrops() {
  const now = new Date();
  
  const demoDrops: HarvestDrop[] = [
    {
      id: generateDropId(),
      cropType: 'lettuce',
      cropCommonName: 'Lettuce',
      windowStart: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
      windowEnd: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
      quantityMin: 8,
      quantityMax: 12,
      unit: 'kg',
      locationLabel: 'North District Grid 5',
      pickupPreference: 'same_day' as PickupPreference,
      spoilageRisk: 'high',
      status: 'active',
      notes: 'Fresh leafy greens ready for harvest',
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateDropId(),
      cropType: 'tomato',
      cropCommonName: 'Cherry Tomato',
      windowStart: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      windowEnd: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      quantityMin: 15,
      quantityMax: 20,
      unit: 'kg',
      locationLabel: 'Central Gaza Block 3',
      pickupPreference: '24h' as PickupPreference,
      spoilageRisk: 'medium',
      status: 'active',
      notes: 'Organic cherry tomatoes, peak ripeness',
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateDropId(),
      cropType: 'radish',
      cropCommonName: 'Radish',
      windowStart: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      windowEnd: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      quantityMin: 25,
      quantityMax: 35,
      unit: 'bunches',
      locationLabel: 'Southern Region Grid 12',
      pickupPreference: 'any' as PickupPreference,
      spoilageRisk: 'low',
      status: 'scheduled',
      notes: 'Hardy root vegetables, flexible timing',
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: generateDropId(),
      cropType: 'spinach',
      cropCommonName: 'Spinach',
      windowStart: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (in progress)
      windowEnd: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
      quantityMin: 6,
      quantityMax: 10,
      unit: 'kg',
      locationLabel: 'East District Zone 7',
      pickupPreference: 'same_day' as PickupPreference,
      spoilageRisk: 'high',
      status: 'active',
      notes: 'Urgent pickup needed',
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ];
  
  saveDrops(demoDrops);
  console.log('✅ Seeded', demoDrops.length, 'demo harvest drops');
  return demoDrops;
}

export function seedDemoFundingCases() {
  const now = new Date();
  
  const demoCases: FundingCase[] = [
    {
      id: generateCaseId(),
      farmerAlias: 'Farmer #127',
      bundleType: 'in_kind',
      supplierName: 'Gaza Agricultural Relief Network',
      items: [
        {
          id: generateItemId(),
          name: 'Lettuce Seeds (Fast Harvest)',
          quantity: 50,
          unit: 'g',
          whyIncluded: 'Quick harvest (30 days), low water needs',
        },
        {
          id: generateItemId(),
          name: 'Radish Seeds (Fast Harvest)',
          quantity: 30,
          unit: 'g',
          whyIncluded: '25-day harvest cycle, salinity tolerant',
        },
        {
          id: generateItemId(),
          name: 'Compost (Soil Amendment)',
          quantity: 10,
          unit: 'kg',
          whyIncluded: 'Improves damaged soil structure',
        },
        {
          id: generateItemId(),
          name: 'Drip Irrigation Basic',
          quantity: 20,
          unit: 'm',
          whyIncluded: 'Maximizes water efficiency',
        },
      ],
      budgetEstimate: 120,
      currency: 'USD',
      statusTimeline: [
        {
          status: 'pending',
          timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
          notes: 'Case created',
        },
        {
          status: 'packed',
          timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
          notes: 'Bundle prepared by supplier',
        },
      ],
      receiptTokens: [generateReceiptToken(), generateReceiptToken()],
      proofFlags: {
        needsAssessment: true,
        idVerified: true,
        plotConfirmed: true,
      },
      createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      currentStatus: 'packed' as CaseStatus,
      notes: 'Small plot starter bundle for displaced family',
    },
    {
      id: generateCaseId(),
      farmerAlias: 'Farmer #084',
      bundleType: 'in_kind',
      supplierName: 'Palestinian Farmers Cooperative',
      items: [
        {
          id: generateItemId(),
          name: 'Mixed Salad Seeds',
          quantity: 100,
          unit: 'g',
          whyIncluded: 'Diverse harvest, 30-40 days',
        },
        {
          id: generateItemId(),
          name: 'Cherry Tomato Seeds',
          quantity: 20,
          unit: 'g',
          whyIncluded: 'High value, 55-day harvest',
        },
        {
          id: generateItemId(),
          name: 'Organic Compost',
          quantity: 25,
          unit: 'kg',
          whyIncluded: 'Restores soil health',
        },
        {
          id: generateItemId(),
          name: 'Drip Tape System',
          quantity: 50,
          unit: 'm',
          whyIncluded: 'Water-efficient irrigation',
        },
      ],
      budgetEstimate: 280,
      currency: 'USD',
      statusTimeline: [
        {
          status: 'pending',
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Case created',
        },
      ],
      receiptTokens: [generateReceiptToken()],
      proofFlags: {
        needsAssessment: true,
        idVerified: false,
        plotConfirmed: true,
      },
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      currentStatus: 'pending' as CaseStatus,
      notes: 'Medium plot package for returning farmer',
    },
    {
      id: generateCaseId(),
      farmerAlias: 'Farmer #203',
      bundleType: 'voucher',
      supplierName: 'Unity Agricultural Hub',
      items: [
        {
          id: generateItemId(),
          name: 'Agricultural Input Voucher',
          quantity: 1,
          unit: 'voucher',
          whyIncluded: 'Flexible purchasing at verified suppliers',
        },
      ],
      budgetEstimate: 200,
      currency: 'USD',
      statusTimeline: [
        {
          status: 'pending',
          timestamp: new Date(now.getTime() - 120 * 60 * 60 * 1000).toISOString(),
          notes: 'Case created',
        },
        {
          status: 'packed',
          timestamp: new Date(now.getTime() - 96 * 60 * 60 * 1000).toISOString(),
          notes: 'Voucher generated',
        },
        {
          status: 'handed_off',
          timestamp: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
          notes: 'Voucher distributed',
        },
        {
          status: 'received',
          timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
          notes: 'Farmer confirmed receipt and usage',
        },
      ],
      receiptTokens: [
        generateReceiptToken(),
        generateReceiptToken(),
        generateReceiptToken(),
        generateReceiptToken(),
      ],
      proofFlags: {
        needsAssessment: true,
        idVerified: true,
        plotConfirmed: true,
      },
      createdAt: new Date(now.getTime() - 120 * 60 * 60 * 1000).toISOString(),
      currentStatus: 'received' as CaseStatus,
      notes: 'Completed voucher case',
    },
  ];
  
  saveFundingCases(demoCases);
  console.log('✅ Seeded', demoCases.length, 'demo funding cases');
  return demoCases;
}

export function seedAllDemoData() {
  const drops = seedDemoDrops();
  const cases = seedDemoFundingCases();
  return { drops, cases };
}
