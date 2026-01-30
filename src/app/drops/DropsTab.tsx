'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Clock,
  Package,
  AlertTriangle,
  Sparkles,
  X,
  Calendar,
  TrendingUp,
  Droplets,
  CheckCircle2,
} from 'lucide-react';
import type { HarvestDrop, DropStatus, PickupPreference, DropSortOption, DropFilters, QuantityBand } from '@/lib/dropsTypes';
import {
  loadDrops,
  saveDrops,
  addDrop,
  updateDrop,
  generateDropId,
} from '@/lib/dropsStorage';
import {
  calculateSpoilageRisk,
  calculateDropPriority,
  filterAndSortDrops,
  getQuantityBand,
  formatTimeUntilWindow,
} from '@/lib/dropsAI';
import { CROPS } from '@/data/crops';
import MatchPickupDrawer from './MatchPickupDrawer';
import { useLanguage } from '@/lib/i18n';

export default function DropsTab() {
  const [drops, setDrops] = useState<HarvestDrop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<DropSortOption>('ai_priority');
  const [filters, setFilters] = useState<DropFilters>({
    status: [],
    pickupPreference: [],
    quantityBand: [],
    search: '',
  });
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDropForMatch, setSelectedDropForMatch] = useState<HarvestDrop | null>(null);
  const { t, isRTL } = useLanguage();
  
  // Load drops on mount
  useEffect(() => {
    setDrops(loadDrops());
  }, []);
  
  // Apply filters and sorting
  const filteredDrops = useMemo(() => {
    return filterAndSortDrops(
      drops,
      { ...filters, search: searchQuery },
      sortBy
    );
  }, [drops, filters, searchQuery, sortBy]);
  
  // Toggle filter
  const toggleFilter = <K extends keyof DropFilters>(
    key: K,
    value: NonNullable<DropFilters[K]>[number]
  ) => {
    setFilters(prev => {
      const current = prev[key] as any[] || [];
      const isActive = current.includes(value);
      return {
        ...prev,
        [key]: isActive
          ? current.filter((v: any) => v !== value)
          : [...current, value],
      };
    });
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
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
          {t.drops.title}
        </h1>
        <p className="text-sm" style={{ color: 'var(--thamara-text-secondary)' }}>
          {t.drops.subtitle}
        </p>
      </div>
      
      {/* Controls */}
      <div 
        className="px-5 py-3 border-b space-y-3"
        style={{ 
          background: 'var(--thamara-surface)',
          borderColor: 'var(--thamara-border)'
        }}
      >
        {/* Search and Sort */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search 
              size={16} 
              className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`}
              style={{ color: 'var(--thamara-text-muted)' }}
            />
            <input
              type="text"
              placeholder={t.drops.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2 text-sm border outline-none ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
              style={{
                background: 'var(--thamara-bg)',
                borderColor: 'var(--thamara-border)',
                borderRadius: 'var(--thamara-radius-md)',
                color: 'var(--thamara-text-primary)',
              }}
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as DropSortOption)}
            className="px-3 py-2 text-sm font-medium border outline-none"
            style={{
              background: 'var(--thamara-bg)',
              borderColor: 'var(--thamara-border)',
              borderRadius: 'var(--thamara-radius-md)',
              color: 'var(--thamara-text-primary)',
            }}
          >
            <option value="ai_priority">{t.drops.aiPriority}</option>
            <option value="soonest">Soonest Window</option>
            <option value="largest">Largest Quantity</option>
          </select>
        </div>
        
        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {/* Status filters */}
          {(['active', 'scheduled', 'completed'] as DropStatus[]).map(status => {
            const statusLabels = {
              active: t.drops.active,
              scheduled: t.drops.scheduled,
              completed: t.drops.completed,
            };
            return (
              <button
                key={status}
                onClick={() => toggleFilter('status', status)}
                className="px-3 py-1.5 text-xs font-semibold transition-all capitalize"
                style={{
                  background: filters.status?.includes(status)
                    ? 'var(--thamara-primary-100)'
                    : 'var(--thamara-bg)',
                  color: filters.status?.includes(status)
                    ? 'var(--thamara-primary-700)'
                    : 'var(--thamara-text-secondary)',
                  border: `1px solid ${filters.status?.includes(status)
                    ? 'var(--thamara-primary-300)'
                    : 'var(--thamara-border)'}`,
                  borderRadius: 'var(--thamara-radius-full)',
                }}
              >
                {statusLabels[status]}
              </button>
            );
          })}
          
          {/* Pickup filters */}
          {(['same_day', '24h', 'any'] as PickupPreference[]).map(pickup => {
            const pickupLabels = {
              same_day: t.drops.sameDay,
              '24h': t.drops.timeFilter24h,
              any: t.drops.timeFilterAny,
            };
            return (
              <button
                key={pickup}
                onClick={() => toggleFilter('pickupPreference', pickup)}
                className="px-3 py-1.5 text-xs font-semibold transition-all capitalize"
                style={{
                  background: filters.pickupPreference?.includes(pickup)
                    ? 'var(--thamara-accent-100)'
                    : 'var(--thamara-bg)',
                  color: filters.pickupPreference?.includes(pickup)
                    ? 'var(--thamara-accent-700)'
                    : 'var(--thamara-text-secondary)',
                  border: `1px solid ${filters.pickupPreference?.includes(pickup)
                    ? 'var(--thamara-accent-300)'
                    : 'var(--thamara-border)'}`,
                  borderRadius: 'var(--thamara-radius-full)',
                }}
              >
                {pickupLabels[pickup]}
              </button>
            );
          })}
          
          {/* Quantity band filters */}
          {(['small', 'medium', 'large'] as QuantityBand[]).map(band => {
            const bandLabels = {
              small: t.drops.sizeSmall,
              medium: t.drops.sizeMedium,
              large: t.drops.sizeLarge,
            };
            return (
              <button
                key={band}
                onClick={() => toggleFilter('quantityBand', band)}
                className="px-3 py-1.5 text-xs font-semibold transition-all capitalize"
                style={{
                  background: filters.quantityBand?.includes(band)
                    ? 'var(--thamara-secondary-100)'
                    : 'var(--thamara-bg)',
                  color: filters.quantityBand?.includes(band)
                    ? 'var(--thamara-secondary-700)'
                    : 'var(--thamara-text-secondary)',
                  border: `1px solid ${filters.quantityBand?.includes(band)
                    ? 'var(--thamara-secondary-300)'
                    : 'var(--thamara-border)'}`,
                  borderRadius: 'var(--thamara-radius-full)',
                }}
              >
                {bandLabels[band]}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Drops List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {filteredDrops.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto mb-4" style={{ color: 'var(--thamara-text-muted)' }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--thamara-text-secondary)' }}>
              {t.drops.noDrops}
            </p>
            <p className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>
              {t.drops.noDropsDesc}
            </p>
          </div>
        ) : (
          filteredDrops.map(drop => (
            <DropCard
              key={drop.id}
              drop={drop}
              sortBy={sortBy}
              onMatchPickup={() => setSelectedDropForMatch(drop)}
              onUpdateStatus={(status) => {
                updateDrop(drop.id, { status });
                setDrops(loadDrops());
              }}
            />
          ))
        )}
      </div>
      
      {/* Sticky Create Button */}
      <div 
        className="px-5 py-4 border-t"
        style={{ 
          background: 'var(--thamara-surface)',
          borderColor: 'var(--thamara-border)',
          boxShadow: 'var(--thamara-shadow-lg)'
        }}
      >
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
            color: 'var(--thamara-text-on-accent)',
            borderRadius: 'var(--thamara-radius-lg)',
            boxShadow: '0 4px 12px -2px rgba(124, 179, 66, 0.4)',
          }}
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>{t.drops.createDrop}</span>
        </button>
      </div>
      
      {/* Modals */}
      {showCreateModal && (
        <CreateDropModal
          onClose={() => setShowCreateModal(false)}
          onSave={(drop) => {
            addDrop(drop);
            setDrops(loadDrops());
            setShowCreateModal(false);
          }}
        />
      )}
      
      {selectedDropForMatch && (
        <MatchPickupDrawer
          drop={selectedDropForMatch}
          onClose={() => setSelectedDropForMatch(null)}
        />
      )}
    </div>
  );
}

// Drop Card Component
function DropCard({
  drop,
  sortBy,
  onMatchPickup,
  onUpdateStatus,
}: {
  drop: HarvestDrop;
  sortBy: DropSortOption;
  onMatchPickup: () => void;
  onUpdateStatus: (status: DropStatus) => void;
}) {
  const priorityScore = calculateDropPriority(drop);
  const timeLabel = formatTimeUntilWindow(drop.windowStart);
  const quantityBand = getQuantityBand(drop.quantityMin, drop.quantityMax);
  
  return (
    <div
      className="p-4 border transition-all hover:shadow-md"
      style={{
        background: 'var(--thamara-surface)',
        borderColor: 'var(--thamara-border)',
        borderRadius: 'var(--thamara-radius-lg)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 flex items-center justify-center"
            style={{
              background: 'var(--thamara-primary-50)',
              borderRadius: 'var(--thamara-radius-md)',
            }}
          >
            <Package size={24} style={{ color: 'var(--thamara-primary-600)' }} />
          </div>
          <div>
            <h3 className="font-semibold text-base" style={{ color: 'var(--thamara-text-primary)' }}>
              {drop.cropCommonName}
            </h3>
            <p className="text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
              {timeLabel}
            </p>
          </div>
        </div>
        
        {sortBy === 'ai_priority' && (
          <div
            className="flex items-center gap-1 px-2 py-1 text-xs font-bold"
            style={{
              background: priorityScore >= 70
                ? 'var(--thamara-warning)'
                : priorityScore >= 50
                ? 'var(--thamara-accent-500)'
                : 'var(--thamara-primary-300)',
              color: 'white',
              borderRadius: 'var(--thamara-radius-md)',
            }}
          >
            <Sparkles size={12} />
            <span>{priorityScore}</span>
          </div>
        )}
      </div>
      
      {/* Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock size={14} style={{ color: 'var(--thamara-text-muted)' }} />
          <span style={{ color: 'var(--thamara-text-secondary)' }}>
            {new Date(drop.windowStart).toLocaleDateString()} - {new Date(drop.windowEnd).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Package size={14} style={{ color: 'var(--thamara-text-muted)' }} />
          <span style={{ color: 'var(--thamara-text-secondary)' }}>
            {drop.quantityMin}-{drop.quantityMax} {drop.unit}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={14} style={{ color: 'var(--thamara-text-muted)' }} />
          <span style={{ color: 'var(--thamara-text-secondary)' }}>
            {drop.locationLabel}
          </span>
        </div>
      </div>
      
      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span
          className="px-2 py-1 text-xs font-semibold"
          style={{
            background: 'var(--thamara-info)',
            color: 'white',
            borderRadius: 'var(--thamara-radius-md)',
          }}
        >
          No-Fridge Mode
        </span>
        
        <span
          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold"
          style={{
            background: drop.spoilageRisk === 'high'
              ? 'var(--thamara-error)'
              : drop.spoilageRisk === 'medium'
              ? 'var(--thamara-warning)'
              : 'var(--thamara-success)',
            color: 'white',
            borderRadius: 'var(--thamara-radius-md)',
          }}
        >
          <AlertTriangle size={12} />
          <span>AI Risk: {drop.spoilageRisk}</span>
        </span>
        
        <span
          className="px-2 py-1 text-xs font-semibold capitalize"
          style={{
            background: 'var(--thamara-accent-100)',
            color: 'var(--thamara-accent-700)',
            borderRadius: 'var(--thamara-radius-md)',
          }}
        >
          {drop.pickupPreference === 'same_day' ? 'Same-Day' : drop.pickupPreference === '24h' ? '24h Pickup' : 'Flexible'}
        </span>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onMatchPickup}
          className="flex-1 px-3 py-2 text-sm font-semibold transition-all hover:opacity-80"
          style={{
            background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
            color: 'white',
            borderRadius: 'var(--thamara-radius-md)',
          }}
        >
          Match Pickup
        </button>
        
        {drop.status !== 'completed' && (
          <button
            onClick={() => onUpdateStatus('completed')}
            className="px-3 py-2 text-sm font-semibold border transition-all hover:bg-opacity-80"
            style={{
              background: 'var(--thamara-bg)',
              color: 'var(--thamara-text-secondary)',
              borderColor: 'var(--thamara-border)',
              borderRadius: 'var(--thamara-radius-md)',
            }}
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
}

// Create Drop Modal
function CreateDropModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (drop: HarvestDrop) => void;
}) {
  const [formData, setFormData] = useState({
    cropType: '',
    windowStart: '',
    windowEnd: '',
    quantityMin: '',
    quantityMax: '',
    unit: 'kg',
    locationLabel: '',
    pickupPreference: 'same_day' as PickupPreference,
    notes: '',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const windowLengthHours = 
      (new Date(formData.windowEnd).getTime() - new Date(formData.windowStart).getTime()) / (1000 * 60 * 60);
    
    const selectedCrop = CROPS.find(c => c.id === formData.cropType);
    
    const drop: HarvestDrop = {
      id: generateDropId(),
      cropType: formData.cropType,
      cropCommonName: selectedCrop?.commonName || formData.cropType,
      windowStart: formData.windowStart,
      windowEnd: formData.windowEnd,
      quantityMin: Number(formData.quantityMin),
      quantityMax: Number(formData.quantityMax),
      unit: formData.unit,
      locationLabel: formData.locationLabel,
      pickupPreference: formData.pickupPreference,
      spoilageRisk: calculateSpoilageRisk(
        selectedCrop?.commonName || formData.cropType,
        windowLengthHours,
        formData.pickupPreference
      ),
      status: 'active',
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };
    
    onSave(drop);
  };
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto"
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
            Create Harvest Drop
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-opacity-80 transition-all"
            style={{ color: 'var(--thamara-text-secondary)' }}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
              Crop
            </label>
            <select
              required
              value={formData.cropType}
              onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
              className="w-full px-3 py-2 border outline-none"
              style={{
                background: 'var(--thamara-bg)',
                borderColor: 'var(--thamara-border)',
                borderRadius: 'var(--thamara-radius-md)',
                color: 'var(--thamara-text-primary)',
              }}
            >
              <option value="">Select crop...</option>
              {CROPS.map(crop => (
                <option key={crop.id} value={crop.id}>
                  {crop.commonName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
                Window Start
              </label>
              <input
                type="datetime-local"
                required
                value={formData.windowStart}
                onChange={(e) => setFormData({ ...formData, windowStart: e.target.value })}
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
                Window End
              </label>
              <input
                type="datetime-local"
                required
                value={formData.windowEnd}
                onChange={(e) => setFormData({ ...formData, windowEnd: e.target.value })}
                className="w-full px-3 py-2 border outline-none"
                style={{
                  background: 'var(--thamara-bg)',
                  borderColor: 'var(--thamara-border)',
                  borderRadius: 'var(--thamara-radius-md)',
                  color: 'var(--thamara-text-primary)',
                }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
                Min Quantity
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={formData.quantityMin}
                onChange={(e) => setFormData({ ...formData, quantityMin: e.target.value })}
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
                Max Quantity
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.1"
                value={formData.quantityMax}
                onChange={(e) => setFormData({ ...formData, quantityMax: e.target.value })}
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
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border outline-none"
                style={{
                  background: 'var(--thamara-bg)',
                  borderColor: 'var(--thamara-border)',
                  borderRadius: 'var(--thamara-radius-md)',
                  color: 'var(--thamara-text-primary)',
                }}
              >
                <option value="kg">kg</option>
                <option value="bunches">bunches</option>
                <option value="crates">crates</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
              Location Label
            </label>
            <input
              type="text"
              required
              placeholder="e.g., North District Grid 5"
              value={formData.locationLabel}
              onChange={(e) => setFormData({ ...formData, locationLabel: e.target.value })}
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
              Pickup Preference
            </label>
            <select
              value={formData.pickupPreference}
              onChange={(e) => setFormData({ ...formData, pickupPreference: e.target.value as PickupPreference })}
              className="w-full px-3 py-2 border outline-none"
              style={{
                background: 'var(--thamara-bg)',
                borderColor: 'var(--thamara-border)',
                borderRadius: 'var(--thamara-radius-md)',
                color: 'var(--thamara-text-primary)',
              }}
            >
              <option value="same_day">Same-day pickup</option>
              <option value="24h">Within 24 hours</option>
              <option value="any">Flexible timing</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
              Notes (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Additional details..."
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
          
          <button
            type="submit"
            className="w-full py-3 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
              color: 'white',
              borderRadius: 'var(--thamara-radius-lg)',
            }}
          >
            Create Drop
          </button>
        </form>
      </div>
    </div>
  );
}
