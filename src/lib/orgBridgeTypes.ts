/**
 * Types for OrgBridge feature (Transparent Funding + Fulfillment)
 * Enables NGOs/donors to fund farm bundles with audit trail
 */

export type BundleType = 'in_kind' | 'voucher';
export type CaseStatus = 'pending' | 'packed' | 'handed_off' | 'received';

export interface BundleItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  whyIncluded?: string;
}

export interface StatusTimelineEntry {
  status: CaseStatus;
  timestamp: string;
  notes?: string;
}

export interface FundingCase {
  id: string;
  farmerAlias: string;
  bundleType: BundleType;
  supplierName: string;
  items: BundleItem[];
  budgetEstimate: number;
  currency: string;
  statusTimeline: StatusTimelineEntry[];
  receiptTokens: string[];
  proofFlags: {
    needsAssessment: boolean;
    idVerified: boolean;
    plotConfirmed: boolean;
  };
  createdAt: string;
  currentStatus: CaseStatus;
  notes?: string;
}

export interface BundleTemplate {
  id: string;
  name: string;
  description: string;
  targetPlotSize: 'small' | 'medium' | 'large';
  targetCrop?: string;
  items: Omit<BundleItem, 'id'>[];
  estimatedCost: number;
}

export interface Supplier {
  id: string;
  name: string;
  type: 'ngo_hub' | 'coop' | 'verified_supplier';
  trustScore: number;
  categories: string[];
  locationLabel: string;
}
