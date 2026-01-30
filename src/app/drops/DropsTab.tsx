'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  MapPin,
  Clock,
  Package,
  AlertTriangle,
  Sparkles,
  X,
  TrendingUp,
  CheckCircle2,
  Timer,
  Leaf,
  ChevronRight,
  Filter,
  Zap,
  Users,
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

// Example drops data - preloaded for production
const EXAMPLE_DROPS: Omit<HarvestDrop, 'id' | 'createdAt'>[] = [
  {
    cropType: 'lettuce',
    cropCommonName: 'Butter Lettuce',
    windowStart: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    windowEnd: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    quantityMin: 12,
    quantityMax: 18,
    unit: 'kg',
    locationLabel: 'North District, Grid 5',
    pickupPreference: 'same_day',
    spoilageRisk: 'high',
    status: 'active',
    notes: 'Organic butter lettuce, ready for harvest. Best quality in morning pickup.',
  },
  {
    cropType: 'tomato',
    cropCommonName: 'Cherry Tomatoes',
    windowStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    windowEnd: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    quantityMin: 20,
    quantityMax: 30,
    unit: 'kg',
    locationLabel: 'Central Block 3',
    pickupPreference: '24h',
    spoilageRisk: 'medium',
    status: 'scheduled',
    notes: 'Peak ripeness cherry tomatoes. Can provide crates if needed.',
  },
  {
    cropType: 'cucumber',
    cropCommonName: 'Persian Cucumber',
    windowStart: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    windowEnd: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    quantityMin: 15,
    quantityMax: 20,
    unit: 'kg',
    locationLabel: 'East Zone 7',
    pickupPreference: 'same_day',
    spoilageRisk: 'high',
    status: 'active',
    notes: 'Fresh Persian cucumbers, urgent same-day pickup preferred.',
  },
  {
    cropType: 'radish',
    cropCommonName: 'Red Radish',
    windowStart: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    windowEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    quantityMin: 30,
    quantityMax: 45,
    unit: 'bunches',
    locationLabel: 'Southern Farm 12',
    pickupPreference: 'any',
    spoilageRisk: 'low',
    status: 'scheduled',
    notes: 'Hardy root vegetables, flexible timing available.',
  },
  {
    cropType: 'spinach',
    cropCommonName: 'Baby Spinach',
    windowStart: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    windowEnd: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    quantityMin: 8,
    quantityMax: 12,
    unit: 'kg',
    locationLabel: 'West Field 4',
    pickupPreference: 'same_day',
    spoilageRisk: 'high',
    status: 'active',
    notes: 'Window closing soon - urgent pickup needed!',
  },
];

function initializeExampleDrops(): HarvestDrop[] {
  const now = new Date();
  return EXAMPLE_DROPS.map((drop, index) => ({
    ...drop,
    id: generateDropId(),
    createdAt: new Date(now.getTime() - (index + 1) * 60 * 60 * 1000).toISOString(),
  }));
}

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
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDropForMatch, setSelectedDropForMatch] = useState<HarvestDrop | null>(null);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t, isRTL } = useLanguage();

  // Simple scroll-based header collapse - hide when scrolled past 80px
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const scrollTop = scrollContainer.scrollTop;
      setHeaderCollapsed(scrollTop > 80);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Load drops on mount - auto-seed if empty
  useEffect(() => {
    let loadedDrops = loadDrops();
    if (loadedDrops.length === 0) {
      loadedDrops = initializeExampleDrops();
      saveDrops(loadedDrops);
    }
    setDrops(loadedDrops);
  }, []);

  // Apply filters and sorting
  const filteredDrops = useMemo(() => {
    return filterAndSortDrops(
      drops,
      { ...filters, search: searchQuery },
      sortBy
    );
  }, [drops, filters, searchQuery, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeDrops = drops.filter(d => d.status === 'active');
    const urgentDrops = activeDrops.filter(d => d.spoilageRisk === 'high');
    const totalQuantity = drops.reduce((sum, d) => sum + d.quantityMax, 0);
    return {
      total: drops.length,
      active: activeDrops.length,
      urgent: urgentDrops.length,
      totalKg: totalQuantity,
    };
  }, [drops]);

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

  const activeFiltersCount =
    (filters.status?.length || 0) +
    (filters.pickupPreference?.length || 0) +
    (filters.quantityBand?.length || 0);

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with Stats - Collapsible on scroll */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{
          gridTemplateRows: headerCollapsed ? '0fr' : '1fr',
        }}
      >
        <div className="overflow-hidden">
          <div
            className="px-5 py-4"
            style={{
              background: 'linear-gradient(135deg, var(--thamara-primary-600) 0%, var(--thamara-primary-700) 100%)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-white mb-1">
                  {t.drops.title}
                </h1>
                <p className="text-sm text-white/80">
                  {t.drops.subtitle}
                </p>
              </div>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 'var(--thamara-radius-full)',
                  color: 'white',
                }}
              >
                <Zap size={14} />
                <span>No-Fridge Mode</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-2">
              <StatCard icon={Package} label="Total" value={stats.total} />
              <StatCard icon={Timer} label={t.drops.active} value={stats.active} color="var(--thamara-accent-400)" />
              <StatCard icon={AlertTriangle} label="Urgent" value={stats.urgent} color="var(--thamara-warning)" />
              <StatCard icon={TrendingUp} label="kg Ready" value={stats.totalKg} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div
        className="px-5 py-3 border-b space-y-3"
        style={{
          background: 'var(--thamara-surface)',
          borderColor: 'var(--thamara-border)'
        }}
      >
        {/* Search Bar */}
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
              className={`w-full py-2.5 text-sm border outline-none focus:border-[var(--thamara-primary-400)] ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
              style={{
                background: 'var(--thamara-bg)',
                borderColor: 'var(--thamara-border)',
                borderRadius: 'var(--thamara-radius-lg)',
                color: 'var(--thamara-text-primary)',
              }}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative px-3 py-2 border transition-all"
            style={{
              background: showFilters ? 'var(--thamara-primary-50)' : 'var(--thamara-bg)',
              borderColor: showFilters ? 'var(--thamara-primary-300)' : 'var(--thamara-border)',
              borderRadius: 'var(--thamara-radius-lg)',
              color: showFilters ? 'var(--thamara-primary-600)' : 'var(--thamara-text-secondary)',
            }}
          >
            <Filter size={18} />
            {activeFiltersCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white"
                style={{
                  background: 'var(--thamara-accent-500)',
                  borderRadius: '50%',
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as DropSortOption)}
            className="px-3 py-2 text-sm font-medium border outline-none"
            style={{
              background: 'var(--thamara-bg)',
              borderColor: 'var(--thamara-border)',
              borderRadius: 'var(--thamara-radius-lg)',
              color: 'var(--thamara-text-primary)',
            }}
          >
            <option value="ai_priority">{t.drops.aiPriority}</option>
            <option value="soonest">{t.drops.soonest}</option>
            <option value="largest">{t.drops.largest}</option>
          </select>
        </div>

        {/* Expandable Filter Chips */}
        {showFilters && (
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--thamara-border)' }}>
            {/* Status filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium py-1" style={{ color: 'var(--thamara-text-muted)' }}>Status:</span>
              {(['active', 'scheduled', 'completed'] as DropStatus[]).map(status => (
                <FilterChip
                  key={status}
                  label={status === 'active' ? t.drops.active : status === 'scheduled' ? t.drops.scheduled : t.drops.completed}
                  isActive={filters.status?.includes(status)}
                  onClick={() => toggleFilter('status', status)}
                  color="primary"
                />
              ))}
            </div>

            {/* Timing filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium py-1" style={{ color: 'var(--thamara-text-muted)' }}>Timing:</span>
              {(['same_day', '24h', 'any'] as PickupPreference[]).map(pickup => (
                <FilterChip
                  key={pickup}
                  label={pickup === 'same_day' ? t.drops.sameDay : pickup === '24h' ? t.drops.timeFilter24h : t.drops.timeFilterAny}
                  isActive={filters.pickupPreference?.includes(pickup)}
                  onClick={() => toggleFilter('pickupPreference', pickup)}
                  color="accent"
                />
              ))}
            </div>

            {/* Size filters */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium py-1" style={{ color: 'var(--thamara-text-muted)' }}>Size:</span>
              {(['small', 'medium', 'large'] as QuantityBand[]).map(band => (
                <FilterChip
                  key={band}
                  label={band === 'small' ? t.drops.sizeSmall : band === 'medium' ? t.drops.sizeMedium : t.drops.sizeLarge}
                  isActive={filters.quantityBand?.includes(band)}
                  onClick={() => toggleFilter('quantityBand', band)}
                  color="secondary"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drops List */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {filteredDrops.length === 0 ? (
          <EmptyState onCreateDrop={() => setShowCreateModal(true)} t={t} />
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--thamara-text-secondary)' }}>
                {filteredDrops.length} {t.drops.items}
              </span>
              {sortBy === 'ai_priority' && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--thamara-accent-600)' }}>
                  <Sparkles size={12} />
                  AI-sorted by urgency
                </span>
              )}
            </div>

            {filteredDrops.map(drop => (
              <DropCard
                key={drop.id}
                drop={drop}
                t={t}
                isRTL={isRTL}
                onMatchPickup={() => setSelectedDropForMatch(drop)}
                onUpdateStatus={(status) => {
                  updateDrop(drop.id, { status });
                  setDrops(loadDrops());
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Create Button - Fixed at bottom of flex layout */}
      <div
        className="flex-shrink-0 px-5 py-4 border-t"
        style={{
          background: 'var(--thamara-surface)',
          borderColor: 'var(--thamara-border)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
            color: 'var(--thamara-text-on-accent)',
            borderRadius: 'var(--thamara-radius-lg)',
            boxShadow: '0 4px 12px -2px rgba(124, 179, 66, 0.4)',
          }}
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>{t.drops.createNewDrop}</span>
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

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div
      className="p-2.5 text-center"
      style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: 'var(--thamara-radius-md)',
      }}
    >
      <Icon size={16} className="mx-auto mb-1" style={{ color: color || 'white' }} />
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[10px] text-white/70 uppercase tracking-wide">{label}</div>
    </div>
  );
}

// Filter Chip Component
function FilterChip({
  label,
  isActive,
  onClick,
  color = 'primary'
}: {
  label: string;
  isActive?: boolean;
  onClick: () => void;
  color?: 'primary' | 'accent' | 'secondary';
}) {
  const colorMap = {
    primary: {
      active: { bg: 'var(--thamara-primary-100)', border: 'var(--thamara-primary-300)', text: 'var(--thamara-primary-700)' },
      inactive: { bg: 'var(--thamara-bg)', border: 'var(--thamara-border)', text: 'var(--thamara-text-secondary)' },
    },
    accent: {
      active: { bg: 'var(--thamara-accent-100)', border: 'var(--thamara-accent-300)', text: 'var(--thamara-accent-700)' },
      inactive: { bg: 'var(--thamara-bg)', border: 'var(--thamara-border)', text: 'var(--thamara-text-secondary)' },
    },
    secondary: {
      active: { bg: 'var(--thamara-secondary-100)', border: 'var(--thamara-secondary-300)', text: 'var(--thamara-secondary-700)' },
      inactive: { bg: 'var(--thamara-bg)', border: 'var(--thamara-border)', text: 'var(--thamara-text-secondary)' },
    },
  };

  const colors = colorMap[color][isActive ? 'active' : 'inactive'];

  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs font-semibold transition-all"
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: 'var(--thamara-radius-full)',
      }}
    >
      {label}
    </button>
  );
}

// Empty State Component
function EmptyState({ onCreateDrop, t }: { onCreateDrop: () => void; t: ReturnType<typeof useLanguage>['t'] }) {
  return (
    <div className="text-center py-12 px-6">
      <div
        className="w-20 h-20 mx-auto mb-5 flex items-center justify-center"
        style={{
          background: 'var(--thamara-primary-50)',
          borderRadius: 'var(--thamara-radius-xl)',
        }}
      >
        <Package size={40} style={{ color: 'var(--thamara-primary-400)' }} />
      </div>
      <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
        {t.drops.noDrops}
      </h3>
      <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--thamara-text-secondary)' }}>
        {t.drops.noDropsDesc}
      </p>
      <button
        onClick={onCreateDrop}
        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all"
        style={{
          background: 'var(--thamara-accent-500)',
          color: 'white',
          borderRadius: 'var(--thamara-radius-lg)',
        }}
      >
        <Plus size={18} />
        {t.drops.createDrop}
      </button>
    </div>
  );
}

// Drop Card Component
function DropCard({
  drop,
  t,
  isRTL,
  onMatchPickup,
  onUpdateStatus,
}: {
  drop: HarvestDrop;
  t: ReturnType<typeof useLanguage>['t'];
  isRTL: boolean;
  onMatchPickup: () => void;
  onUpdateStatus: (status: DropStatus) => void;
}) {
  const priorityScore = calculateDropPriority(drop);
  const timeLabel = formatTimeUntilWindow(drop.windowStart);
  const isUrgent = drop.spoilageRisk === 'high';
  const isActive = drop.status === 'active';

  // Determine urgency styling
  const urgencyColors = isUrgent
    ? { border: 'var(--thamara-warning)', bg: 'rgba(245, 158, 11, 0.05)' }
    : { border: 'var(--thamara-border)', bg: 'var(--thamara-surface)' };

  return (
    <div
      className="p-4 border-2 transition-all hover:shadow-lg"
      style={{
        background: urgencyColors.bg,
        borderColor: urgencyColors.border,
        borderRadius: 'var(--thamara-radius-xl)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 flex items-center justify-center"
            style={{
              background: isUrgent ? 'var(--thamara-warning)' : 'var(--thamara-primary-100)',
              borderRadius: 'var(--thamara-radius-lg)',
            }}
          >
            <Leaf size={24} style={{ color: isUrgent ? 'white' : 'var(--thamara-primary-600)' }} />
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--thamara-text-primary)' }}>
              {drop.cropCommonName}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium ${isActive ? 'animate-pulse' : ''}`}
                style={{ color: isUrgent ? 'var(--thamara-warning)' : 'var(--thamara-text-secondary)' }}
              >
                <Clock size={12} />
                {timeLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Priority Badge */}
        <div
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold"
          style={{
            background: priorityScore >= 70
              ? 'var(--thamara-error)'
              : priorityScore >= 50
                ? 'var(--thamara-warning)'
                : 'var(--thamara-accent-500)',
            color: 'white',
            borderRadius: 'var(--thamara-radius-md)',
          }}
        >
          <Sparkles size={12} />
          <span>{priorityScore}</span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <DetailItem icon={Package} label={t.drops.quantity} value={`${drop.quantityMin}-${drop.quantityMax} ${drop.unit}`} />
        <DetailItem icon={MapPin} label={t.drops.location} value={drop.locationLabel} />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <StatusBadge status={drop.status} t={t} />
        <RiskBadge risk={drop.spoilageRisk} t={t} />
        <TimingBadge preference={drop.pickupPreference} t={t} />
      </div>

      {/* Notes Preview */}
      {drop.notes && (
        <p className="text-xs mb-4 p-2" style={{
          color: 'var(--thamara-text-secondary)',
          background: 'var(--thamara-bg)',
          borderRadius: 'var(--thamara-radius-md)',
        }}>
          {drop.notes}
        </p>
      )}

      {/* Actions */}
      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button
          onClick={onMatchPickup}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 ${isRTL ? 'flex-row-reverse' : ''}`}
          style={{
            background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
            color: 'white',
            borderRadius: 'var(--thamara-radius-md)',
          }}
        >
          <Users size={16} />
          {t.drops.findPickupMatch}
          <ChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
        </button>

        {drop.status !== 'completed' && (
          <button
            onClick={() => onUpdateStatus('completed')}
            className="px-4 py-2.5 text-sm font-semibold border transition-all hover:bg-opacity-80"
            style={{
              background: 'var(--thamara-bg)',
              color: 'var(--thamara-success)',
              borderColor: 'var(--thamara-success)',
              borderRadius: 'var(--thamara-radius-md)',
            }}
          >
            <CheckCircle2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

// Detail Item Component
function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon size={14} style={{ color: 'var(--thamara-text-muted)' }} />
      <span className="truncate" style={{ color: 'var(--thamara-text-secondary)' }}>{value}</span>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status, t }: { status: DropStatus; t: ReturnType<typeof useLanguage>['t'] }) {
  const config = {
    active: { bg: 'var(--thamara-success)', label: t.drops.active },
    scheduled: { bg: 'var(--thamara-info)', label: t.drops.scheduled },
    completed: { bg: 'var(--thamara-text-muted)', label: t.drops.completed },
  };
  const { bg, label } = config[status];

  return (
    <span
      className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{ background: bg, color: 'white', borderRadius: 'var(--thamara-radius-md)' }}
    >
      {label}
    </span>
  );
}

// Risk Badge Component
function RiskBadge({ risk, t }: { risk: 'low' | 'medium' | 'high'; t: ReturnType<typeof useLanguage>['t'] }) {
  const config = {
    low: { bg: 'var(--thamara-success)', label: t.drops.lowRisk },
    medium: { bg: 'var(--thamara-warning)', label: t.drops.medRisk },
    high: { bg: 'var(--thamara-error)', label: t.drops.highRisk },
  };
  const { bg, label } = config[risk];

  return (
    <span
      className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{ background: bg, color: 'white', borderRadius: 'var(--thamara-radius-md)' }}
    >
      <AlertTriangle size={10} />
      {label}
    </span>
  );
}

// Timing Badge Component
function TimingBadge({ preference, t }: { preference: PickupPreference; t: ReturnType<typeof useLanguage>['t'] }) {
  const config = {
    same_day: { bg: 'var(--thamara-accent-100)', color: 'var(--thamara-accent-700)', label: t.drops.sameDay },
    '24h': { bg: 'var(--thamara-primary-100)', color: 'var(--thamara-primary-700)', label: t.drops.timeFilter24h },
    any: { bg: 'var(--thamara-bg-secondary)', color: 'var(--thamara-text-secondary)', label: t.drops.timeFilterAny },
  };
  const { bg, color, label } = config[preference];

  return (
    <span
      className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{ background: bg, color, borderRadius: 'var(--thamara-radius-md)' }}
    >
      {label}
    </span>
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
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

  const isStep1Valid = formData.cropType && formData.locationLabel;
  const isStep2Valid = formData.windowStart && formData.windowEnd && formData.quantityMin && formData.quantityMax;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--thamara-surface)',
          borderRadius: 'var(--thamara-radius-xl) var(--thamara-radius-xl) 0 0',
          boxShadow: 'var(--thamara-shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between p-5 border-b"
          style={{ background: 'var(--thamara-surface)', borderColor: 'var(--thamara-border)' }}
        >
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--thamara-text-primary)' }}>
              Create Drop
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--thamara-text-secondary)' }}>
              Step {step} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-opacity-80 transition-all"
            style={{
              color: 'var(--thamara-text-secondary)',
              background: 'var(--thamara-bg)',
              borderRadius: 'var(--thamara-radius-md)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-1 px-5 pt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex-1 h-1.5 transition-all"
              style={{
                background: s <= step ? 'var(--thamara-accent-500)' : 'var(--thamara-border)',
                borderRadius: 'var(--thamara-radius-full)',
              }}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
                  What are you harvesting?
                </label>
                <select
                  required
                  value={formData.cropType}
                  onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                  className="w-full px-4 py-3 border outline-none focus:border-[var(--thamara-primary-400)]"
                  style={{
                    background: 'var(--thamara-bg)',
                    borderColor: 'var(--thamara-border)',
                    borderRadius: 'var(--thamara-radius-lg)',
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

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
                  Pickup Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., North District Grid 5"
                  value={formData.locationLabel}
                  onChange={(e) => setFormData({ ...formData, locationLabel: e.target.value })}
                  className="w-full px-4 py-3 border outline-none focus:border-[var(--thamara-primary-400)]"
                  style={{
                    background: 'var(--thamara-bg)',
                    borderColor: 'var(--thamara-border)',
                    borderRadius: 'var(--thamara-radius-lg)',
                    color: 'var(--thamara-text-primary)',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="w-full py-3.5 text-base font-semibold transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
                  color: 'white',
                  borderRadius: 'var(--thamara-radius-lg)',
                }}
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
                    Window Start
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.windowStart}
                    onChange={(e) => setFormData({ ...formData, windowStart: e.target.value })}
                    className="w-full px-3 py-3 border outline-none text-sm"
                    style={{
                      background: 'var(--thamara-bg)',
                      borderColor: 'var(--thamara-border)',
                      borderRadius: 'var(--thamara-radius-lg)',
                      color: 'var(--thamara-text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
                    Window End
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.windowEnd}
                    onChange={(e) => setFormData({ ...formData, windowEnd: e.target.value })}
                    className="w-full px-3 py-3 border outline-none text-sm"
                    style={{
                      background: 'var(--thamara-bg)',
                      borderColor: 'var(--thamara-border)',
                      borderRadius: 'var(--thamara-radius-lg)',
                      color: 'var(--thamara-text-primary)',
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
                    Min Qty
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.quantityMin}
                    onChange={(e) => setFormData({ ...formData, quantityMin: e.target.value })}
                    className="w-full px-3 py-3 border outline-none"
                    style={{
                      background: 'var(--thamara-bg)',
                      borderColor: 'var(--thamara-border)',
                      borderRadius: 'var(--thamara-radius-lg)',
                      color: 'var(--thamara-text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
                    Max Qty
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.quantityMax}
                    onChange={(e) => setFormData({ ...formData, quantityMax: e.target.value })}
                    className="w-full px-3 py-3 border outline-none"
                    style={{
                      background: 'var(--thamara-bg)',
                      borderColor: 'var(--thamara-border)',
                      borderRadius: 'var(--thamara-radius-lg)',
                      color: 'var(--thamara-text-primary)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-3 border outline-none"
                    style={{
                      background: 'var(--thamara-bg)',
                      borderColor: 'var(--thamara-border)',
                      borderRadius: 'var(--thamara-radius-lg)',
                      color: 'var(--thamara-text-primary)',
                    }}
                  >
                    <option value="kg">kg</option>
                    <option value="bunches">bunches</option>
                    <option value="crates">crates</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
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
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!isStep2Valid}
                  className="flex-1 py-3 text-base font-semibold transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
                    color: 'white',
                    borderRadius: 'var(--thamara-radius-lg)',
                  }}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
                  Pickup Preference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'same_day', label: 'Same-Day', desc: 'Urgent' },
                    { value: '24h', label: '24 Hours', desc: 'Standard' },
                    { value: 'any', label: 'Flexible', desc: 'No rush' },
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, pickupPreference: option.value as PickupPreference })}
                      className="p-3 border-2 text-center transition-all"
                      style={{
                        background: formData.pickupPreference === option.value
                          ? 'var(--thamara-accent-50)'
                          : 'var(--thamara-bg)',
                        borderColor: formData.pickupPreference === option.value
                          ? 'var(--thamara-accent-500)'
                          : 'var(--thamara-border)',
                        borderRadius: 'var(--thamara-radius-lg)',
                      }}
                    >
                      <div className="font-semibold text-sm" style={{ color: 'var(--thamara-text-primary)' }}>
                        {option.label}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--thamara-text-muted)' }}>
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
                  Notes (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Any special instructions or details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border outline-none resize-none focus:border-[var(--thamara-primary-400)]"
                  style={{
                    background: 'var(--thamara-bg)',
                    borderColor: 'var(--thamara-border)',
                    borderRadius: 'var(--thamara-radius-lg)',
                    color: 'var(--thamara-text-primary)',
                  }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
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
                  type="submit"
                  className="flex-1 py-3 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
                    color: 'white',
                    borderRadius: 'var(--thamara-radius-lg)',
                  }}
                >
                  Create Drop
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
