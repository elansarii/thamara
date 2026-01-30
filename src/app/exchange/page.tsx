'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Clock,
  Package,
  Users,
  Truck,
  Building2,
  Droplets,
  Wrench,
  Leaf,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Box,
  Sparkles,
  X,
  Check,
  Copy,
  Info,
} from 'lucide-react';
import type {
  Listing,
  ListingMode,
  ListingType,
  InputCategory,
  LaborCategory,
  UserContext,
  MatchScore,
  RequestBundle,
  RequestBundleItem,
} from '@/lib/exchangeTypes';
import {
  loadListings,
  saveListings,
  addListing,
  updateListing,
  saveBundle,
  loadBundles,
} from '@/lib/exchangeStorage';
import {
  filterListings,
  sortListings,
  getRankedMatches,
  computeMatchScore,
} from '@/lib/exchangeMatching';
import { usePlotStore } from '@/lib/plotStore';
import { useLanguage } from '@/lib/i18n';

type SortOption = 'ai_match' | 'newest' | 'closest' | 'quantity';

export default function ExchangePage() {
  const { lastPlot } = usePlotStore();
  const { t, isRTL } = useLanguage();

  // Mode configs with translations
  const MODE_CONFIGS = useMemo(() => ({
    inputs: {
      label: t.exchange.inputs,
      icon: Package,
      categories: [
        { value: 'all', label: t.exchange.allInputs, icon: Package },
        { value: 'seeds', label: t.exchange.seeds, icon: Leaf },
        { value: 'tools', label: t.exchange.tools, icon: Wrench },
        { value: 'fertilizer', label: t.exchange.fertilizer, icon: Droplets },
        { value: 'irrigation', label: t.exchange.irrigation, icon: Droplets },
      ],
    },
    labor: {
      label: t.exchange.labor,
      icon: Users,
      categories: [
        { value: 'all', label: t.exchange.allServices, icon: Users },
        { value: 'day_labor', label: t.exchange.dayLabor, icon: Users },
        { value: 'harvest_help', label: t.exchange.harvestHelp, icon: Package },
        { value: 'transport', label: t.exchange.transport, icon: Truck },
        { value: 'containers', label: t.exchange.containers, icon: Box },
      ],
    },
    hubs: {
      label: t.exchange.verifiedHubs,
      icon: Building2,
      categories: [
        { value: 'all', label: t.exchange.allHubs, icon: Building2 },
        { value: 'ngo_hub', label: t.exchange.ngoHubs, icon: ShieldCheck },
        { value: 'coop_hub', label: t.exchange.coopHubs, icon: Users },
        { value: 'supplier_hub', label: t.exchange.supplierHubs, icon: Package },
      ],
    },
  }), [t]);

  // Mode & filters
  const [mode, setMode] = useState<ListingMode>('inputs');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ListingType | undefined>();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState<'near' | 'any'>('any');
  const [trustFilter, setTrustFilter] = useState(false);
  const [urgencyFilter, setUrgencyFilter] = useState('any');
  const [sortBy, setSortBy] = useState<SortOption>('ai_match');

  // Data
  const [listings, setListings] = useState<Listing[]>([]);
  const [bundles, setBundles] = useState<RequestBundle[]>([]);

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMatchesDrawer, setShowMatchesDrawer] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showBundleGenerator, setShowBundleGenerator] = useState(false);
  const [showSafetyGuidance, setShowSafetyGuidance] = useState(false);
  const [safetyCategory, setSafetyCategory] = useState<InputCategory>('fertilizer');

  // Load data
  useEffect(() => {
    setListings(loadListings());
    setBundles(loadBundles());
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen = showCreateModal || showMatchesDrawer || showBundleGenerator || showSafetyGuidance;
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showCreateModal, showMatchesDrawer, showBundleGenerator, showSafetyGuidance]);

  // User context for matching
  const userContext: UserContext = useMemo(() => {
    const sessionData = typeof window !== 'undefined'
      ? sessionStorage.getItem('thamara_crop_recommendations')
      : null;

    let selectedCrop = undefined;
    if (sessionData) {
      try {
        const data = JSON.parse(sessionData);
        selectedCrop = data.topCrops?.[0]?.crop?.commonName;
      } catch (e) {
        // Ignore
      }
    }

    return {
      selectedCrop,
      plotSize: lastPlot?.areaM2,
      waterAccess: lastPlot?.waterAccess,
      salinityRisk: lastPlot?.salinity,
      locationLabel: 'North Gaza – Sector A',
      distanceBand: 'near',
    };
  }, [lastPlot]);

  // Filtered and sorted listings
  const displayedListings = useMemo(() => {
    const filtered = filterListings(listings, {
      searchQuery,
      type: typeFilter,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      distanceBand: distanceFilter,
      trust: trustFilter,
      urgency: urgencyFilter === 'any' ? undefined : urgencyFilter,
      mode,
    });

    return sortListings(filtered, sortBy, userContext);
  }, [listings, mode, searchQuery, typeFilter, categoryFilter, distanceFilter, trustFilter, urgencyFilter, sortBy, userContext]);

  // Handle create listing
  const handleCreateListing = (formData: Omit<Listing, 'id' | 'createdAt' | 'status'>) => {
    const newListing = addListing(formData);
    setListings(loadListings());
    setShowCreateModal(false);
  };

  // Handle view matches
  const handleViewMatches = (listing: Listing) => {
    setSelectedListing(listing);
    setShowMatchesDrawer(true);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--thamara-bg)' }}>
      {/* Sticky Header - Compact for mobile */}
      <div className="sticky top-0 z-10 flex-shrink-0 px-4 py-2.5 border-b" style={{ borderColor: 'var(--thamara-border)', background: 'var(--thamara-surface)' }}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <h1 className="text-lg font-bold" style={{ color: 'var(--thamara-text-primary)' }}>
            {t.nav.exchange}
          </h1>
          <div className="flex items-center gap-1.5">
            <span
              className="px-2 py-1 text-[11px] font-semibold rounded-full"
              style={{
                background: 'var(--thamara-primary-50)',
                color: 'var(--thamara-primary-700)',
              }}
            >
              {displayedListings.length} {t.drops.items}
            </span>
          </div>
        </div>

        {/* Search bar - Better touch target */}
        <div className="relative">
          <Search
            size={18}
            className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2`}
            style={{ color: 'var(--thamara-text-muted)' }}
          />
          <input
            type="text"
            placeholder={t.exchange.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm rounded-lg border touch-target`}
            style={{
              background: 'var(--thamara-bg)',
              borderColor: 'var(--thamara-border)',
              color: 'var(--thamara-text-primary)',
            }}
          />
        </div>
      </div>

      {/* Mode tabs - Full width segmented control */}
      <div className="flex-shrink-0 px-4 py-2 border-b" style={{ borderColor: 'var(--thamara-border)', background: 'var(--thamara-surface)' }}>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--thamara-bg-secondary)' }}>
          {(Object.keys(MODE_CONFIGS) as ListingMode[]).map((m) => {
            const config = MODE_CONFIGS[m];
            const Icon = config.icon;
            const isActive = mode === m;

            return (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setCategoryFilter('all');
                  setTypeFilter(undefined);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-semibold rounded-md transition-all touch-target"
                style={{
                  background: isActive ? 'var(--thamara-surface)' : 'transparent',
                  color: isActive ? 'var(--thamara-primary-700)' : 'var(--thamara-text-muted)',
                  boxShadow: isActive ? 'var(--thamara-shadow-sm)' : 'none',
                }}
              >
                <Icon size={16} strokeWidth={2.5} />
                <span className="truncate">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters - Horizontal scrolling on mobile */}
      <div className="flex-shrink-0 border-b" style={{ borderColor: 'var(--thamara-border)', background: 'var(--thamara-bg)' }}>
        <div className="px-4 py-2">
          <div className="scroll-x-container">
            {/* Type filter (not for hubs) */}
            {mode !== 'hubs' && (
              <>
                <button
                  onClick={() => setTypeFilter(typeFilter === 'offer' ? undefined : 'offer')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap"
                  style={{
                    background: typeFilter === 'offer' ? 'var(--thamara-accent-500)' : 'var(--thamara-bg-secondary)',
                    color: typeFilter === 'offer' ? 'white' : 'var(--thamara-text-secondary)',
                  }}
                >
                  {t.exchange.offers}
                </button>
                <button
                  onClick={() => setTypeFilter(typeFilter === 'request' ? undefined : 'request')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap"
                  style={{
                    background: typeFilter === 'request' ? 'var(--thamara-warning)' : 'var(--thamara-bg-secondary)',
                    color: typeFilter === 'request' ? 'white' : 'var(--thamara-text-secondary)',
                  }}
                >
                  {t.exchange.requests}
                </button>
              </>
            )}

            {/* Category dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-full border-none appearance-none cursor-pointer"
              style={{
                background: categoryFilter !== 'all' ? 'var(--thamara-primary-500)' : 'var(--thamara-bg-secondary)',
                color: categoryFilter !== 'all' ? 'white' : 'var(--thamara-text-secondary)',
              }}
            >
              {MODE_CONFIGS[mode].categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setDistanceFilter(distanceFilter === 'near' ? 'any' : 'near')}
              className="px-3 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap"
              style={{
                background: distanceFilter === 'near' ? 'var(--thamara-info)' : 'var(--thamara-bg-secondary)',
                color: distanceFilter === 'near' ? 'white' : 'var(--thamara-text-secondary)',
              }}
            >
              {t.exchange.nearby}
            </button>

            <button
              onClick={() => setTrustFilter(!trustFilter)}
              className="px-3 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap"
              style={{
                background: trustFilter ? 'var(--thamara-success)' : 'var(--thamara-bg-secondary)',
                color: trustFilter ? 'white' : 'var(--thamara-text-secondary)',
              }}
            >
              Verified
            </button>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 text-xs font-semibold rounded-full border-none appearance-none cursor-pointer"
              style={{
                background: 'var(--thamara-bg-secondary)',
                color: 'var(--thamara-text-secondary)',
              }}
            >
              <option value="ai_match">Sort: AI Match</option>
              <option value="newest">Sort: Newest</option>
              <option value="closest">Sort: Closest</option>
              <option value="quantity">Sort: Quantity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings - Compact */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
        {displayedListings.length === 0 ? (
          <div className="text-center py-12">
            <Package size={40} style={{ color: 'var(--thamara-text-muted)', margin: '0 auto 12px' }} />
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
              No listings found
            </p>
            <p className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>
              Try adjusting your filters
            </p>
          </div>
        ) : (
          displayedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              userContext={userContext}
              onViewMatches={handleViewMatches}
              onShowSafety={(category) => {
                setSafetyCategory(category as InputCategory);
                setShowSafetyGuidance(true);
              }}
            />
          ))
        )}
      </div>

      {/* Bottom Action Bar - Safe area aware */}
      <div
        className="sticky bottom-0 flex-shrink-0 p-3 border-t safe-bottom"
        style={{
          borderColor: 'var(--thamara-border)',
          background: 'var(--thamara-surface)',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.08)'
        }}
      >
        {mode === 'hubs' ? (
          <button
            onClick={() => setShowBundleGenerator(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all active:scale-[0.98] touch-target"
            style={{
              background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
              color: 'var(--thamara-text-on-accent)',
            }}
          >
            <Sparkles size={18} strokeWidth={2.5} />
            Generate Bundle
          </button>
        ) : (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl transition-all active:scale-[0.98] touch-target"
            style={{
              background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
              color: 'var(--thamara-text-on-accent)',
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Post Listing
          </button>
        )}
      </div>

      {/* Create Listing Modal */}
      {showCreateModal && (
        <CreateListingModal
          mode={mode}
          defaultType={typeFilter}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateListing}
        />
      )}

      {/* Matches Drawer */}
      {showMatchesDrawer && selectedListing && (
        <MatchesDrawer
          listing={selectedListing}
          allListings={listings}
          userContext={userContext}
          onClose={() => {
            setShowMatchesDrawer(false);
            setSelectedListing(null);
          }}
        />
      )}

      {/* Bundle Generator */}
      {showBundleGenerator && (
        <BundleGeneratorModal
          userContext={userContext}
          onClose={() => setShowBundleGenerator(false)}
          onSave={(bundle) => {
            saveBundle(bundle);
            setBundles(loadBundles());
            setShowBundleGenerator(false);
          }}
        />
      )}

      {/* Safety Guidance */}
      {showSafetyGuidance && (
        <SafetyGuidanceModal
          category={safetyCategory}
          onClose={() => setShowSafetyGuidance(false)}
        />
      )}
    </div>
  );
}

// Listing Card Component
function ListingCard({
  listing,
  userContext,
  onViewMatches,
  onShowSafety,
}: {
  listing: Listing;
  userContext: UserContext;
  onViewMatches: (listing: Listing) => void;
  onShowSafety: (category: string) => void;
}) {
  const matchScore = computeMatchScore(listing, userContext);
  const isHub = listing.mode === 'hubs';

  const getCategoryIcon = () => {
    switch (listing.category) {
      case 'seeds': return Leaf;
      case 'tools': return Wrench;
      case 'fertilizer': return Droplets;
      case 'irrigation': return Droplets;
      case 'day_labor': return Users;
      case 'harvest_help': return Package;
      case 'transport': return Truck;
      case 'containers': return Box;
      default: return Building2;
    }
  };

  const CategoryIcon = getCategoryIcon();

  const getTrustBadge = () => {
    switch (listing.trust) {
      case 'verified_hub':
        return { label: 'Verified Hub', color: 'var(--thamara-success)', icon: ShieldCheck };
      case 'ngo':
        return { label: 'NGO', color: 'var(--thamara-info)', icon: ShieldCheck };
      default:
        return { label: 'Peer', color: 'var(--thamara-text-muted)', icon: Users };
    }
  };

  const trustBadge = getTrustBadge();
  const TrustIcon = trustBadge.icon;

  return (
    <div
      className="p-3 rounded-lg border"
      style={{
        background: 'var(--thamara-surface)',
        borderColor: 'var(--thamara-border)',
      }}
    >
      {/* Compact Header */}
      <div className="flex items-start gap-2 mb-2">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0"
          style={{
            background: 'var(--thamara-primary-100)',
            color: 'var(--thamara-primary-700)',
          }}
        >
          <CategoryIcon size={16} strokeWidth={2.5} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className="px-1.5 py-0.5 text-xs font-bold rounded uppercase leading-none"
              style={{
                background: listing.type === 'offer' ? 'var(--thamara-success)' : 'var(--thamara-warning)',
                color: 'white',
              }}
            >
              {listing.type}
            </span>
            {matchScore.score >= 70 && (
              <div className="flex items-center gap-0.5">
                <Sparkles size={11} style={{ color: 'var(--thamara-accent-600)' }} />
                <span className="text-xs font-bold" style={{ color: 'var(--thamara-accent-600)' }}>
                  {matchScore.score}%
                </span>
              </div>
            )}
            <div className="flex items-center gap-0.5 ml-auto">
              <TrustIcon size={11} strokeWidth={2.5} style={{ color: trustBadge.color }} />
            </div>
          </div>

          <h3 className="text-sm font-bold leading-tight mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
            {listing.title}
          </h3>

          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
            <span className="font-semibold">
              {listing.quantity} {listing.unit}
            </span>
            <span>•</span>
            <span className="truncate">{listing.locationLabel.split('–')[0].trim()}</span>
            <span
              className="px-1.5 py-0.5 rounded text-xs font-semibold"
              style={{
                background: 'var(--thamara-primary-50)',
                color: 'var(--thamara-primary-700)',
              }}
            >
              {listing.distanceBand}
            </span>
          </div>
        </div>
      </div>

      {/* Compact Details - Only show if important */}
      {(listing.notes || (isHub && listing.availableItems) || listing.dateTime) && (
        <div className="mb-2 space-y-1">
          {listing.dateTime && (
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
              <Clock size={12} strokeWidth={2.5} />
              <span>{listing.dateTime}</span>
            </div>
          )}

          {listing.notes && !isHub && (
            <p className="text-xs leading-snug line-clamp-2" style={{ color: 'var(--thamara-text-secondary)' }}>
              {listing.notes}
            </p>
          )}

          {isHub && listing.availableItems && (
            <div className="flex flex-wrap gap-1">
              {listing.availableItems.slice(0, 3).map((item, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 text-xs rounded"
                  style={{
                    background: 'var(--thamara-accent-100)',
                    color: 'var(--thamara-accent-700)',
                  }}
                >
                  {item}
                </span>
              ))}
              {listing.availableItems.length > 3 && (
                <span className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>
                  +{listing.availableItems.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Compact Actions */}
      <div className="flex gap-1.5">
        <button
          onClick={() => onViewMatches(listing)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all"
          style={{
            background: 'var(--thamara-primary-500)',
            color: 'var(--thamara-text-on-primary)',
          }}
        >
          <Sparkles size={13} strokeWidth={2.5} />
          Matches
        </button>

        {listing.category === 'fertilizer' && (
          <button
            onClick={() => onShowSafety(listing.category)}
            className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all"
            style={{
              background: 'var(--thamara-warning)',
              color: 'white',
            }}
          >
            <Info size={13} strokeWidth={2.5} />
            Safety
          </button>
        )}
      </div>
    </div>
  );
}

// Create Listing Modal Component
function CreateListingModal({
  mode,
  defaultType,
  onClose,
  onCreate,
}: {
  mode: ListingMode;
  defaultType?: ListingType;
  onClose: () => void;
  onCreate: (data: Omit<Listing, 'id' | 'createdAt' | 'status'>) => void;
}) {
  const [type, setType] = useState<ListingType>(defaultType || 'offer');
  const [category, setCategory] = useState<string>(MODE_CONFIGS[mode].categories[1].value);
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState('kg');
  const [urgency, setUrgency] = useState<'today' | 'week' | 'any'>('week');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onCreate({
      type,
      mode,
      category: category as any,
      title,
      quantity,
      unit,
      locationLabel: 'North Gaza – Sector A',
      distanceBand: 'near',
      urgency,
      trust: 'peer',
      notes,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl shadow-xl overflow-hidden flex flex-col safe-bottom"
        style={{
          background: 'var(--thamara-surface)',
          maxHeight: 'calc(100vh - var(--safe-area-inset-top) - 20px)'
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--thamara-border)', background: 'var(--thamara-surface)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--thamara-text-primary)' }}>
            Create Listing
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 touch-target">
            <X size={22} style={{ color: 'var(--thamara-text-secondary)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
          {/* Type */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
              Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('offer')}
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                style={{
                  background: type === 'offer' ? 'var(--thamara-success)' : 'var(--thamara-bg-secondary)',
                  color: type === 'offer' ? 'white' : 'var(--thamara-text-secondary)',
                }}
              >
                Offer
              </button>
              <button
                type="button"
                onClick={() => setType('request')}
                className="flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                style={{
                  background: type === 'request' ? 'var(--thamara-warning)' : 'var(--thamara-bg-secondary)',
                  color: type === 'request' ? 'white' : 'var(--thamara-text-secondary)',
                }}
              >
                Request
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-lg border"
              style={{
                background: 'var(--thamara-bg)',
                borderColor: 'var(--thamara-border)',
                color: 'var(--thamara-text-primary)',
              }}
            >
              {MODE_CONFIGS[mode].categories.slice(1).map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Tomato Seeds (Roma variety)"
              required
              className="w-full px-4 py-2 text-sm rounded-lg border"
              style={{
                background: 'var(--thamara-bg)',
                borderColor: 'var(--thamara-border)',
                color: 'var(--thamara-text-primary)',
              }}
            />
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                required
                className="w-full px-4 py-2 text-sm rounded-lg border"
                style={{
                  background: 'var(--thamara-bg)',
                  borderColor: 'var(--thamara-border)',
                  color: 'var(--thamara-text-primary)',
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg, grams, sets"
                required
                className="w-full px-4 py-2 text-sm rounded-lg border"
                style={{
                  background: 'var(--thamara-bg)',
                  borderColor: 'var(--thamara-border)',
                  color: 'var(--thamara-text-primary)',
                }}
              />
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
              Urgency
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as any)}
              className="w-full px-4 py-2 text-sm rounded-lg border"
              style={{
                background: 'var(--thamara-bg)',
                borderColor: 'var(--thamara-border)',
                color: 'var(--thamara-text-primary)',
              }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="any">Flexible</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details..."
              rows={3}
              className="w-full px-4 py-2 text-sm rounded-lg border"
              style={{
                background: 'var(--thamara-bg)',
                borderColor: 'var(--thamara-border)',
                color: 'var(--thamara-text-primary)',
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-xl shadow-lg transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
              color: 'var(--thamara-text-on-accent)',
            }}
          >
            <Check size={20} strokeWidth={2.5} />
            Create Listing
          </button>
        </form>
      </div>
    </div>
  );
}

// Matches Drawer Component
function MatchesDrawer({
  listing,
  allListings,
  userContext,
  onClose,
}: {
  listing: Listing;
  allListings: Listing[];
  userContext: UserContext;
  onClose: () => void;
}) {
  const matches = getRankedMatches(allListings, userContext, listing.id);
  const topMatches = matches.slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl shadow-xl flex flex-col safe-bottom"
        style={{
          background: 'var(--thamara-surface)',
          maxHeight: 'calc(100vh - var(--safe-area-inset-top) - 20px)'
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--thamara-border)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--thamara-text-primary)' }}>
            Recommended Matches
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 touch-target">
            <X size={22} style={{ color: 'var(--thamara-text-secondary)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
          {topMatches.length === 0 ? (
            <div className="text-center py-12">
              <Package size={48} style={{ color: 'var(--thamara-text-muted)', margin: '0 auto 16px' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--thamara-text-primary)' }}>
                No matches found
              </p>
            </div>
          ) : (
            topMatches.map((match) => {
              const matchedListing = allListings.find(l => l.id === match.listingId);
              if (!matchedListing) return null;

              return (
                <div
                  key={match.listingId}
                  className="p-4 rounded-xl border"
                  style={{
                    background: 'var(--thamara-bg)',
                    borderColor: 'var(--thamara-border)',
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold flex-1" style={{ color: 'var(--thamara-text-primary)' }}>
                      {matchedListing.title}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Sparkles size={14} style={{ color: 'var(--thamara-accent-600)' }} />
                      <span className="text-sm font-bold" style={{ color: 'var(--thamara-accent-600)' }}>
                        {match.score}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--thamara-text-secondary)' }}>
                    <span className="font-semibold">{matchedListing.quantity} {matchedListing.unit}</span>
                    <span>•</span>
                    <span>{matchedListing.locationLabel}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {match.topReasons.map((reason, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs rounded-md font-medium"
                        style={{
                          background: 'var(--thamara-accent-100)',
                          color: 'var(--thamara-accent-700)',
                        }}
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// Bundle Generator Modal Component
function BundleGeneratorModal({
  userContext,
  onClose,
  onSave,
}: {
  userContext: UserContext;
  onClose: () => void;
  onSave: (bundle: Omit<RequestBundle, 'id' | 'createdAt'>) => void;
}) {
  const [cropName, setCropName] = useState(userContext.selectedCrop || 'Tomato');
  const [plotSize, setPlotSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [generated, setGenerated] = useState(false);
  const [bundle, setBundle] = useState<RequestBundleItem[]>([]);

  const handleGenerate = () => {
    // Generate bundle based on crop and plot size
    const items: RequestBundleItem[] = [];

    // Seeds
    items.push({
      category: 'seeds',
      item: `${cropName} seeds`,
      quantityRange: plotSize === 'small' ? '50-100g' : plotSize === 'medium' ? '100-250g' : '250-500g',
      priority: 'essential',
    });

    // Soil amendment
    items.push({
      category: 'fertilizer',
      item: 'Organic compost',
      quantityRange: plotSize === 'small' ? '10-20kg' : plotSize === 'medium' ? '20-40kg' : '40-80kg',
      priority: 'essential',
    });

    // Irrigation
    items.push({
      category: 'irrigation',
      item: 'Drip irrigation kit',
      quantityRange: '1 kit',
      priority: 'recommended',
    });

    // Tools
    items.push({
      category: 'tools',
      item: 'Basic hand tools set',
      quantityRange: '1 set',
      priority: 'recommended',
    });

    setBundle(items);
    setGenerated(true);
  };

  const handleSave = () => {
    onSave({
      cropName,
      plotSize,
      items: bundle,
    });
  };

  const handleCopy = () => {
    const text = `Request Bundle - ${cropName} (${plotSize} plot)\n\n${bundle.map(item => `${item.item}: ${item.quantityRange} [${item.priority}]`).join('\n')}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl shadow-xl flex flex-col safe-bottom"
        style={{
          background: 'var(--thamara-surface)',
          maxHeight: 'calc(100vh - var(--safe-area-inset-top) - 20px)'
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--thamara-border)', background: 'var(--thamara-surface)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--thamara-text-primary)' }}>
            Generate Request Bundle
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 touch-target">
            <X size={22} style={{ color: 'var(--thamara-text-secondary)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
          {!generated ? (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
                  Crop
                </label>
                <input
                  type="text"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full px-4 py-2 text-sm rounded-lg border"
                  style={{
                    background: 'var(--thamara-bg)',
                    borderColor: 'var(--thamara-border)',
                    color: 'var(--thamara-text-primary)',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
                  Plot Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setPlotSize(size)}
                      className="px-4 py-2 text-sm font-semibold rounded-lg transition-all capitalize"
                      style={{
                        background: plotSize === size ? 'var(--thamara-primary-500)' : 'var(--thamara-bg-secondary)',
                        color: plotSize === size ? 'var(--thamara-text-on-primary)' : 'var(--thamara-text-secondary)',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-xl shadow-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
                  color: 'var(--thamara-text-on-accent)',
                }}
              >
                <Sparkles size={20} strokeWidth={2.5} />
                Generate Bundle
              </button>
            </>
          ) : (
            <>
              <div className="p-4 rounded-xl" style={{ background: 'var(--thamara-primary-50)' }}>
                <h3 className="text-base font-bold mb-1" style={{ color: 'var(--thamara-primary-700)' }}>
                  {cropName} - {plotSize.charAt(0).toUpperCase() + plotSize.slice(1)} Plot
                </h3>
                <p className="text-xs" style={{ color: 'var(--thamara-primary-600)' }}>
                  Generated request bundle
                </p>
              </div>

              <div className="space-y-2">
                {bundle.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border"
                    style={{
                      background: 'var(--thamara-bg)',
                      borderColor: 'var(--thamara-border)',
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-semibold" style={{ color: 'var(--thamara-text-primary)' }}>
                        {item.item}
                      </h4>
                      <span
                        className="px-2 py-0.5 text-xs font-bold rounded uppercase"
                        style={{
                          background: item.priority === 'essential' ? 'var(--thamara-warning)' : 'var(--thamara-info)',
                          color: 'white',
                        }}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
                      {item.quantityRange}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all"
                  style={{
                    background: 'var(--thamara-bg-secondary)',
                    color: 'var(--thamara-text-primary)',
                  }}
                >
                  <Copy size={16} strokeWidth={2.5} />
                  Copy
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all"
                  style={{
                    background: 'var(--thamara-primary-500)',
                    color: 'var(--thamara-text-on-primary)',
                  }}
                >
                  <Check size={16} strokeWidth={2.5} />
                  Save Locally
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Safety Guidance Modal Component
function SafetyGuidanceModal({
  category,
  onClose,
}: {
  category: InputCategory;
  onClose: () => void;
}) {
  const guidance = {
    fertilizer: {
      title: 'Fertilizer Safety Basics',
      content: [
        'Always wear gloves when handling fertilizers and soil amendments',
        'Store in cool, dry place away from food and water sources',
        'Avoid breathing dust - work in well-ventilated areas',
        'Wash hands thoroughly after handling',
        'Keep children and animals away during application',
      ],
      warnings: [
        'Never mix different fertilizer types without expert guidance',
        'Follow recommended application rates - more is not better',
        'In damaged soils, start with small test areas before full application',
      ],
    },
    seeds: {
      title: 'Seed Handling Tips',
      content: [
        'Store seeds in cool, dry, dark location',
        'Use airtight containers to prevent moisture damage',
        'Label containers with variety and date',
        'Check germination rates before large-scale planting',
      ],
      warnings: [
        'Avoid treated seeds near food prep areas',
        'Do not eat seeds treated with chemicals',
      ],
    },
    tools: {
      title: 'Tool Safety & Maintenance',
      content: [
        'Clean tools after each use to prevent disease spread',
        'Sharpen blades regularly for safer, more effective cutting',
        'Store in dry place to prevent rust',
        'Wear appropriate protective gear (gloves, closed-toe shoes)',
      ],
      warnings: [
        'Keep sharp tools away from children',
        'Inspect tools before use for damage or wear',
      ],
    },
    irrigation: {
      title: 'Water Storage & Irrigation Safety',
      content: [
        'Clean water containers regularly to prevent algae and contamination',
        'Cover containers to reduce evaporation and keep out debris',
        'Use food-grade containers for potable water storage',
        'Inspect drip lines for leaks to conserve water',
      ],
      warnings: [
        'Do not use contaminated water on edible crops',
        'Test salinity levels before irrigation in coastal areas',
      ],
    },
  };

  const data = guidance[category];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div
        className="w-full max-w-lg rounded-t-2xl shadow-xl flex flex-col safe-bottom"
        style={{
          background: 'var(--thamara-surface)',
          maxHeight: 'calc(100vh - var(--safe-area-inset-top) - 20px)'
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--thamara-border)', background: 'var(--thamara-surface)' }}>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{
                background: 'var(--thamara-warning)',
              }}
            >
              <Info size={18} strokeWidth={2.5} style={{ color: 'white' }} />
            </div>
            <h2 className="text-base font-bold" style={{ color: 'var(--thamara-text-primary)' }}>
              {data.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 touch-target">
            <X size={22} style={{ color: 'var(--thamara-text-secondary)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
          <div>
            <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--thamara-text-primary)' }}>
              Best Practices
            </h3>
            <ul className="space-y-2">
              {data.content.map((item, i) => (
                <li key={i} className="flex gap-2 text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
                  <Check size={16} strokeWidth={2.5} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--thamara-success)' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="p-3 rounded-lg"
            style={{
              background: 'var(--thamara-warning)',
              color: 'white',
            }}
          >
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
              <AlertTriangle size={16} strokeWidth={2.5} />
              Important Warnings
            </h3>
            <ul className="space-y-1.5">
              {data.warnings.map((warning, i) => (
                <li key={i} className="text-xs leading-relaxed">
                  • {warning}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
