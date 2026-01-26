'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Package,
  FileText,
  Eye,
  Plus,
  X,
  Check,
  Sparkles,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  Box,
  Leaf,
  Wrench,
  Droplets,
  Users,
} from 'lucide-react';
import type { FundingCase, BundleType, CaseStatus, BundleItem, Supplier, BundleTemplate } from '@/lib/orgBridgeTypes';
import {
  loadFundingCases,
  addFundingCase,
  updateFundingCase,
  generateCaseId,
  generateItemId,
  generateReceiptToken,
  getDemoSuppliers,
  getDemoBundleTemplates,
} from '@/lib/orgBridgeStorage';
import { recommendBundleTemplate } from '@/lib/dropsAI';
import { usePlotStore } from '@/lib/plotStore';

export default function OrgBridgeTab() {
  const [cases, setCases] = useState<FundingCase[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState<FundingCase | null>(null);
  
  useEffect(() => {
    setCases(loadFundingCases());
  }, []);
  
  const refreshCases = () => {
    setCases(loadFundingCases());
  };
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div 
        className="px-5 py-4 border-b"
        style={{ 
          background: 'var(--thamara-surface)',
          borderColor: 'var(--thamara-border)'
        }}
      >
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--thamara-text-primary)' }}>
            OrgBridge
          </h1>
          <span
            className="px-2 py-1 text-xs font-semibold"
            style={{
              background: 'var(--thamara-info)',
              color: 'white',
              borderRadius: 'var(--thamara-radius-md)',
            }}
          >
            Demo Mode
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--thamara-text-secondary)' }}>
          Fund and fulfill farm bundles with traceable status
        </p>
      </div>
      
      {/* Action Cards */}
      <div className="px-5 py-4 space-y-3">
        <ActionCard
          icon={Plus}
          title="Create Funding Case"
          description="Fund a farmer with inputs or vouchers"
          color="var(--thamara-accent-600)"
          onClick={() => setShowCreateModal(true)}
        />
        
        <ActionCard
          icon={FileText}
          title="Browse Requests"
          description={`View ${cases.length} active funding case${cases.length !== 1 ? 's' : ''}`}
          color="var(--thamara-primary-600)"
          onClick={() => {}}
        />
        
        <ActionCard
          icon={Eye}
          title="Track Bundles"
          description="Monitor fulfillment and receipts"
          color="var(--thamara-secondary-700)"
          onClick={() => {}}
        />
      </div>
      
      {/* Cases List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--thamara-text-secondary)' }}>
          Recent Cases
        </h2>
        
        {cases.length === 0 ? (
          <div className="text-center py-12">
            <Building2 size={48} className="mx-auto mb-4" style={{ color: 'var(--thamara-text-muted)' }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--thamara-text-secondary)' }}>
              No funding cases yet
            </p>
            <p className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>
              Create a case to fund farmer inputs
            </p>
          </div>
        ) : (
          cases.map(c => (
            <CaseCard
              key={c.id}
              fundingCase={c}
              onClick={() => setSelectedCase(c)}
            />
          ))
        )}
      </div>
      
      {/* Modals */}
      {showCreateModal && (
        <CreateCaseModal
          onClose={() => setShowCreateModal(false)}
          onSave={(c) => {
            addFundingCase(c);
            refreshCases();
            setShowCreateModal(false);
            setSelectedCase(c);
          }}
        />
      )}
      
      {selectedCase && (
        <CaseDetailModal
          fundingCase={selectedCase}
          onClose={() => setSelectedCase(null)}
          onUpdate={(updates) => {
            updateFundingCase(selectedCase.id, updates);
            refreshCases();
            setSelectedCase({ ...selectedCase, ...updates });
          }}
        />
      )}
    </div>
  );
}

// Action Card
function ActionCard({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}: {
  icon: any;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 border transition-all hover:shadow-md text-left"
      style={{
        background: 'var(--thamara-surface)',
        borderColor: 'var(--thamara-border)',
        borderRadius: 'var(--thamara-radius-lg)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 flex items-center justify-center flex-shrink-0"
          style={{
            background: `${color}15`,
            color: color,
            borderRadius: 'var(--thamara-radius-md)',
          }}
        >
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-base mb-0.5" style={{ color: 'var(--thamara-text-primary)' }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: 'var(--thamara-text-secondary)' }}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

// Case Card
function CaseCard({
  fundingCase,
  onClick,
}: {
  fundingCase: FundingCase;
  onClick: () => void;
}) {
  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'pending': return 'var(--thamara-warning)';
      case 'packed': return 'var(--thamara-info)';
      case 'handed_off': return 'var(--thamara-accent-600)';
      case 'received': return 'var(--thamara-success)';
    }
  };
  
  return (
    <button
      onClick={onClick}
      className="w-full p-4 border transition-all hover:shadow-md text-left"
      style={{
        background: 'var(--thamara-surface)',
        borderColor: 'var(--thamara-border)',
        borderRadius: 'var(--thamara-radius-lg)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
            {fundingCase.farmerAlias}
          </h3>
          <p className="text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
            {fundingCase.supplierName} • {fundingCase.items.length} items
          </p>
        </div>
        <span
          className="px-2 py-1 text-xs font-semibold capitalize"
          style={{
            background: getStatusColor(fundingCase.currentStatus),
            color: 'white',
            borderRadius: 'var(--thamara-radius-md)',
          }}
        >
          {fundingCase.currentStatus.replace('_', ' ')}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <span
          className="px-2 py-1 text-xs font-semibold capitalize"
          style={{
            background: 'var(--thamara-primary-50)',
            color: 'var(--thamara-primary-700)',
            borderRadius: 'var(--thamara-radius-md)',
          }}
        >
          {fundingCase.bundleType === 'in_kind' ? 'In-Kind Bundle' : 'Voucher'}
        </span>
        <span className="text-sm font-bold" style={{ color: 'var(--thamara-text-primary)' }}>
          ${fundingCase.budgetEstimate}
        </span>
      </div>
    </button>
  );
}

// Create Case Modal
function CreateCaseModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (fundingCase: FundingCase) => void;
}) {
  const { lastPlot } = usePlotStore();
  const [step, setStep] = useState<'basic' | 'items' | 'proof'>('basic');
  const [formData, setFormData] = useState({
    farmerAlias: '',
    bundleType: 'in_kind' as BundleType,
    supplierName: '',
    items: [] as BundleItem[],
    budgetEstimate: 0,
    proofFlags: {
      needsAssessment: false,
      idVerified: false,
      plotConfirmed: false,
    },
    notes: '',
  });
  
  const [showBundleGenerator, setShowBundleGenerator] = useState(false);
  const suppliers = getDemoSuppliers();
  
  const handleGenerateBundle = () => {
    const template = recommendBundleTemplate(lastPlot?.areaM2);
    const items = template.items.map(item => ({
      id: generateItemId(),
      ...item,
    }));
    setFormData(prev => ({
      ...prev,
      items,
      budgetEstimate: template.estimatedCost,
    }));
    setShowBundleGenerator(false);
  };
  
  const handleAddItem = () => {
    const newItem: BundleItem = {
      id: generateItemId(),
      name: '',
      quantity: 1,
      unit: 'unit',
      notes: '',
      whyIncluded: '',
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };
  
  const handleUpdateItem = (id: string, updates: Partial<BundleItem>) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };
  
  const handleRemoveItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  };
  
  const handleSubmit = () => {
    const fundingCase: FundingCase = {
      id: generateCaseId(),
      farmerAlias: formData.farmerAlias,
      bundleType: formData.bundleType,
      supplierName: formData.supplierName,
      items: formData.items,
      budgetEstimate: formData.budgetEstimate,
      currency: 'USD',
      statusTimeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          notes: 'Case created',
        },
      ],
      receiptTokens: [generateReceiptToken()],
      proofFlags: formData.proofFlags,
      createdAt: new Date().toISOString(),
      currentStatus: 'pending',
      notes: formData.notes,
    };
    
    onSave(fundingCase);
  };
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--thamara-surface)',
          borderRadius: 'var(--thamara-radius-xl)',
          boxShadow: 'var(--thamara-shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--thamara-text-primary)' }}>
            Create Funding Case
          </h2>
          <button onClick={onClose} className="p-1" style={{ color: 'var(--thamara-text-secondary)' }}>
            <X size={24} />
          </button>
        </div>
        
        {/* Step Indicators */}
        <div className="flex gap-2 mb-6">
          {['basic', 'items', 'proof'].map((s, idx) => (
            <div
              key={s}
              className="flex-1 h-2"
              style={{
                background: step === s || idx < ['basic', 'items', 'proof'].indexOf(step)
                  ? 'var(--thamara-accent-500)'
                  : 'var(--thamara-border)',
                borderRadius: 'var(--thamara-radius-full)',
              }}
            />
          ))}
        </div>
        
        {/* Step Content */}
        {step === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
                Farmer Alias
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Farmer #123"
                value={formData.farmerAlias}
                onChange={(e) => setFormData({ ...formData, farmerAlias: e.target.value })}
                className="w-full px-3 py-2 border outline-none"
                style={{
                  background: 'var(--thamara-bg)',
                  borderColor: 'var(--thamara-border)',
                  borderRadius: 'var(--thamara-radius-md)',
                  color: 'var(--thamara-text-primary)',
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
                Bundle Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bundleType: 'in_kind' })}
                  className="p-3 border text-left transition-all"
                  style={{
                    background: formData.bundleType === 'in_kind'
                      ? 'var(--thamara-primary-50)'
                      : 'var(--thamara-bg)',
                    borderColor: formData.bundleType === 'in_kind'
                      ? 'var(--thamara-primary-400)'
                      : 'var(--thamara-border)',
                    borderWidth: formData.bundleType === 'in_kind' ? '2px' : '1px',
                    borderRadius: 'var(--thamara-radius-md)',
                  }}
                >
                  <div className="font-semibold mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
                    In-Kind
                  </div>
                  <div className="text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
                    Physical goods via supplier
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, bundleType: 'voucher' })}
                  className="p-3 border text-left transition-all"
                  style={{
                    background: formData.bundleType === 'voucher'
                      ? 'var(--thamara-primary-50)'
                      : 'var(--thamara-bg)',
                    borderColor: formData.bundleType === 'voucher'
                      ? 'var(--thamara-primary-400)'
                      : 'var(--thamara-border)',
                    borderWidth: formData.bundleType === 'voucher' ? '2px' : '1px',
                    borderRadius: 'var(--thamara-radius-md)',
                  }}
                >
                  <div className="font-semibold mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
                    Voucher
                  </div>
                  <div className="text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
                    Restricted cash equivalent
                  </div>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
                Supplier
              </label>
              <select
                required
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                className="w-full px-3 py-2 border outline-none"
                style={{
                  background: 'var(--thamara-bg)',
                  borderColor: 'var(--thamara-border)',
                  borderRadius: 'var(--thamara-radius-md)',
                  color: 'var(--thamara-text-primary)',
                }}
              >
                <option value="">Select supplier...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.type.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => setStep('items')}
              disabled={!formData.farmerAlias || !formData.supplierName}
              className="w-full py-3 text-base font-semibold transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
                color: 'white',
                borderRadius: 'var(--thamara-radius-lg)',
              }}
            >
              Next: Items
            </button>
          </div>
        )}
        
        {step === 'items' && (
          <div className="space-y-4">
            {/* AI Bundle Generator */}
            <button
              onClick={handleGenerateBundle}
              className="w-full p-3 border transition-all hover:shadow-md flex items-center justify-center gap-2"
              style={{
                background: 'var(--thamara-accent-50)',
                borderColor: 'var(--thamara-accent-300)',
                borderRadius: 'var(--thamara-radius-lg)',
                color: 'var(--thamara-accent-700)',
              }}
            >
              <Sparkles size={18} />
              <span className="font-semibold">Generate Bundle from Plan</span>
            </button>
            
            {/* Items List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {formData.items.map(item => (
                <div
                  key={item.id}
                  className="p-3 border"
                  style={{
                    background: 'var(--thamara-bg)',
                    borderColor: 'var(--thamara-border)',
                    borderRadius: 'var(--thamara-radius-md)',
                  }}
                >
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                      className="flex-1 px-2 py-1 text-sm border outline-none"
                      style={{
                        background: 'var(--thamara-surface)',
                        borderColor: 'var(--thamara-border)',
                        borderRadius: 'var(--thamara-radius-sm)',
                      }}
                    />
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1"
                      style={{ color: 'var(--thamara-error)' }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, { quantity: Number(e.target.value) })}
                      className="px-2 py-1 text-sm border outline-none"
                      style={{
                        background: 'var(--thamara-surface)',
                        borderColor: 'var(--thamara-border)',
                        borderRadius: 'var(--thamara-radius-sm)',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                      className="px-2 py-1 text-sm border outline-none"
                      style={{
                        background: 'var(--thamara-surface)',
                        borderColor: 'var(--thamara-border)',
                        borderRadius: 'var(--thamara-radius-sm)',
                      }}
                    />
                  </div>
                  {item.whyIncluded && (
                    <p className="text-xs mt-2 px-2 py-1"
                      style={{
                        background: 'var(--thamara-primary-50)',
                        color: 'var(--thamara-primary-700)',
                        borderRadius: 'var(--thamara-radius-sm)',
                      }}
                    >
                      {item.whyIncluded}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={handleAddItem}
              className="w-full py-2 text-sm font-semibold border transition-all"
              style={{
                background: 'var(--thamara-bg)',
                borderColor: 'var(--thamara-border)',
                borderRadius: 'var(--thamara-radius-md)',
                color: 'var(--thamara-text-secondary)',
              }}
            >
              + Add Item
            </button>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
                Budget Estimate ($)
              </label>
              <input
                type="number"
                min="0"
                value={formData.budgetEstimate}
                onChange={(e) => setFormData({ ...formData, budgetEstimate: Number(e.target.value) })}
                className="w-full px-3 py-2 border outline-none"
                style={{
                  background: 'var(--thamara-bg)',
                  borderColor: 'var(--thamara-border)',
                  borderRadius: 'var(--thamara-radius-md)',
                  color: 'var(--thamara-text-primary)',
                }}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setStep('basic')}
                className="flex-1 py-3 text-base font-semibold border transition-all"
                style={{
                  background: 'var(--thamara-bg)',
                  borderColor: 'var(--thamara-border)',
                  borderRadius: 'var(--thamara-radius-lg)',
                  color: 'var(--thamara-text-secondary)',
                }}
              >
                Back
              </button>
              <button
                onClick={() => setStep('proof')}
                disabled={formData.items.length === 0}
                className="flex-1 py-3 text-base font-semibold transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
                  color: 'white',
                  borderRadius: 'var(--thamara-radius-lg)',
                }}
              >
                Next: Proof
              </button>
            </div>
          </div>
        )}
        
        {step === 'proof' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
                Verification Flags
              </label>
              <div className="space-y-2">
                {[
                  { key: 'needsAssessment', label: 'Needs assessment completed' },
                  { key: 'idVerified', label: 'Identity verified' },
                  { key: 'plotConfirmed', label: 'Plot location confirmed' },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-3 border transition-all cursor-pointer hover:bg-opacity-80"
                    style={{
                      background: 'var(--thamara-bg)',
                      borderColor: 'var(--thamara-border)',
                      borderRadius: 'var(--thamara-radius-md)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.proofFlags[key as keyof typeof formData.proofFlags]}
                      onChange={(e) => setFormData({
                        ...formData,
                        proofFlags: {
                          ...formData.proofFlags,
                          [key]: e.target.checked,
                        },
                      })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm" style={{ color: 'var(--thamara-text-primary)' }}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
                Notes (optional)
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border outline-none resize-none"
                style={{
                  background: 'var(--thamara-bg)',
                  borderColor: 'var(--thamara-border)',
                  borderRadius: 'var(--thamara-radius-md)',
                  color: 'var(--thamara-text-primary)',
                }}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setStep('items')}
                className="flex-1 py-3 text-base font-semibold border transition-all"
                style={{
                  background: 'var(--thamara-bg)',
                  borderColor: 'var(--thamara-border)',
                  borderRadius: 'var(--thamara-radius-lg)',
                  color: 'var(--thamara-text-secondary)',
                }}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 text-base font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
                  color: 'white',
                  borderRadius: 'var(--thamara-radius-lg)',
                }}
              >
                Create Case
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Case Detail Modal
function CaseDetailModal({
  fundingCase,
  onClose,
  onUpdate,
}: {
  fundingCase: FundingCase;
  onClose: () => void;
  onUpdate: (updates: Partial<FundingCase>) => void;
}) {
  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case 'pending': return 'var(--thamara-warning)';
      case 'packed': return 'var(--thamara-info)';
      case 'handed_off': return 'var(--thamara-accent-600)';
      case 'received': return 'var(--thamara-success)';
    }
  };
  
  const getStatusIcon = (status: CaseStatus) => {
    switch (status) {
      case 'pending': return Clock;
      case 'packed': return Box;
      case 'handed_off': return Package;
      case 'received': return CheckCircle2;
    }
  };
  
  const handleAdvanceStatus = () => {
    const statuses: CaseStatus[] = ['pending', 'packed', 'handed_off', 'received'];
    const currentIndex = statuses.indexOf(fundingCase.currentStatus);
    if (currentIndex < statuses.length - 1) {
      const newStatus = statuses[currentIndex + 1];
      const newEntry = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        notes: `Advanced to ${newStatus}`,
      };
      onUpdate({
        currentStatus: newStatus,
        statusTimeline: [...fundingCase.statusTimeline, newEntry],
        receiptTokens: [...fundingCase.receiptTokens, generateReceiptToken()],
      });
    }
  };
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto p-6"
        style={{
          background: 'var(--thamara-surface)',
          borderRadius: 'var(--thamara-radius-xl)',
          boxShadow: 'var(--thamara-shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
              {fundingCase.farmerAlias}
            </h2>
            <p className="text-sm" style={{ color: 'var(--thamara-text-secondary)' }}>
              {fundingCase.supplierName}
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--thamara-text-secondary)' }}>
            <X size={24} />
          </button>
        </div>
        
        {/* Status Timeline */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--thamara-text-secondary)' }}>
            Status Timeline
          </h3>
          <div className="space-y-3">
            {(['pending', 'packed', 'handed_off', 'received'] as CaseStatus[]).map((status, idx) => {
              const entry = fundingCase.statusTimeline.find(e => e.status === status);
              const Icon = getStatusIcon(status);
              const isActive = entry !== undefined;
              const isCurrent = status === fundingCase.currentStatus;
              
              return (
                <div key={status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isActive ? getStatusColor(status) : 'var(--thamara-bg-secondary)',
                        color: isActive ? 'white' : 'var(--thamara-text-muted)',
                        borderRadius: '50%',
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    {idx < 3 && (
                      <div
                        className="w-0.5 h-8 my-1"
                        style={{
                          background: isActive && !isCurrent
                            ? 'var(--thamara-primary-300)'
                            : 'var(--thamara-border)',
                        }}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="flex items-center justify-between">
                      <h4
                        className="font-semibold capitalize"
                        style={{ color: isActive ? 'var(--thamara-text-primary)' : 'var(--thamara-text-muted)' }}
                      >
                        {status.replace('_', ' ')}
                      </h4>
                      {isCurrent && (
                        <span
                          className="px-2 py-0.5 text-xs font-bold"
                          style={{
                            background: getStatusColor(status),
                            color: 'white',
                            borderRadius: 'var(--thamara-radius-md)',
                          }}
                        >
                          CURRENT
                        </span>
                      )}
                    </div>
                    {entry && (
                      <p className="text-xs mt-1" style={{ color: 'var(--thamara-text-secondary)' }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Receipt Chain */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--thamara-text-secondary)' }}>
            Receipt Chain
          </h3>
          <div className="flex flex-wrap gap-2">
            {fundingCase.receiptTokens.map((token, idx) => (
              <div
                key={idx}
                className="px-3 py-2 border"
                style={{
                  background: 'var(--thamara-bg)',
                  borderColor: 'var(--thamara-border)',
                  borderRadius: 'var(--thamara-radius-md)',
                }}
              >
                <Receipt size={14} className="inline mr-1" style={{ color: 'var(--thamara-text-muted)' }} />
                <span className="text-xs font-mono" style={{ color: 'var(--thamara-text-secondary)' }}>
                  {token}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bundle Items */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--thamara-text-secondary)' }}>
            Bundle Items ({fundingCase.items.length})
          </h3>
          <div className="space-y-2">
            {fundingCase.items.map(item => (
              <div
                key={item.id}
                className="p-3 border"
                style={{
                  background: 'var(--thamara-bg)',
                  borderColor: 'var(--thamara-border)',
                  borderRadius: 'var(--thamara-radius-md)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-sm" style={{ color: 'var(--thamara-text-primary)' }}>
                      {item.name}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  {item.whyIncluded && (
                    <span
                      className="text-xs px-2 py-1"
                      style={{
                        background: 'var(--thamara-primary-50)',
                        color: 'var(--thamara-primary-700)',
                        borderRadius: 'var(--thamara-radius-full)',
                      }}
                    >
                      ℹ️
                    </span>
                  )}
                </div>
                {item.whyIncluded && (
                  <p className="text-xs mt-2" style={{ color: 'var(--thamara-text-muted)' }}>
                    {item.whyIncluded}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Actions */}
        {fundingCase.currentStatus !== 'received' && (
          <button
            onClick={handleAdvanceStatus}
            className="w-full py-3 text-base font-semibold transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
              color: 'white',
              borderRadius: 'var(--thamara-radius-lg)',
            }}
          >
            Advance to Next Status
          </button>
        )}
      </div>
    </div>
  );
}
