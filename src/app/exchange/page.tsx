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

type SortOption = 'ai_match' | 'newest' | 'closest' | 'quantity';

const MODE_CONFIGS = {
  inputs: {
    label: 'Inputs',
    icon: Package,
    categories: [
      { value: 'all', label: 'All Inputs', icon: Package },
      { value: 'seeds', label: 'Seeds', icon: Leaf },
      { value: 'tools', label: 'Tools', icon: Wrench },
      { value: 'fertilizer', label: 'Fertilizer', icon: Droplets },
      { value: 'irrigation', label: 'Irrigation', icon: Droplets },
    ],
  },
  labor: {
    label: 'Labor & Transport',
    icon: Users,
    categories: [
      { value: 'all', label: 'All Services', icon: Users },
      { value: 'day_labor', label: 'Day Labor', icon: Users },
      { value: 'harvest_help', label: 'Harvest Help', icon: Package },
      { value: 'transport', label: 'Transport', icon: Truck },
      { value: 'containers', label: 'Containers', icon: Box },
    ],
  },
  hubs: {
    label: 'Verified Hubs',
    icon: Building2,
    categories: [
      { value: 'all', label: 'All Hubs', icon: Building2 },
      { value: 'ngo_hub', label: 'NGO Hubs', icon: ShieldCheck },
      { value: 'coop_hub', label: 'Co-op Hubs', icon: Users },
      { value: 'supplier_hub', label: 'Suppliers', icon: Package },
    ],
  },
};

export default function ExchangePage() {
  const { lastPlot } = usePlotStore();
  
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
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b" style={{ borderColor: 'var(--thamara-border)', background: 'var(--thamara-surface)' }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
              Exchange Hub
            </h1>
            <p className="text-sm" style={{ color: 'var(--thamara-text-secondary)' }}>
              Swap inputs. Find help. Coordinate locally.
            </p>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
            style={{
              background: 'var(--thamara-primary-50)',
              color: 'var(--thamara-primary-700)',
              borderRadius: 'var(--thamara-radius-full)',
              border: '1px solid var(--thamara-primary-200)',
            }}
          >
            <ShieldCheck size={12} strokeWidth={2.5} />
            <span>Offline-ready</span>
          </div>
        </div>
        
        <p className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>
          Last sync: Not available in MVP
        </p>
      </div>
      
      {/* Mode tabs */}
      <div className="flex-shrink-0 px-5 py-3 border-b" style={{ borderColor: 'var(--thamara-border)', background: 'var(--thamara-surface)' }}>
        <div className="flex gap-2">
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
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                style={{
                  background: isActive ? 'var(--thamara-primary-500)' : 'var(--thamara-bg-secondary)',
                  color: isActive ? 'var(--thamara-text-on-primary)' : 'var(--thamara-text-secondary)',
                }}
              >
                <Icon size={16} strokeWidth={2.5} />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Search & Filters */}
      <div className="flex-shrink-0 px-5 py-3 space-y-3 border-b" style={{ borderColor: 'var(--thamara-border)', background: 'var(--thamara-surface)' }}>
        {/* Search bar */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            style={{ color: 'var(--thamara-text-muted)' }}
          />
          <input
            type="text"
            placeholder={mode === 'inputs' ? 'Search seeds, tools...' : mode === 'labor' ? 'Search services...' : 'Search hubs...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border"
            style={{
              background: 'var(--thamara-bg)',
              borderColor: 'var(--thamara-border)',
              color: 'var(--thamara-text-primary)',
            }}
          />
        </div>
        
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* Type filter (not for hubs) */}
          {mode !== 'hubs' && (
            <>
              <button
                onClick={() => setTypeFilter(typeFilter === 'offer' ? undefined : 'offer')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: typeFilter === 'offer' ? 'var(--thamara-accent-500)' : 'var(--thamara-bg-secondary)',
                  color: typeFilter === 'offer' ? 'var(--thamara-text-on-accent)' : 'var(--thamara-text-secondary)',
                }}
              >
                <TrendingUp size={12} strokeWidth={2.5} />
                Offers
              </button>
              <button
                onClick={() => setTypeFilter(typeFilter === 'request' ? undefined : 'request')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: typeFilter === 'request' ? 'var(--thamara-accent-500)' : 'var(--thamara-bg-secondary)',
                  color: typeFilter === 'request' ? 'var(--thamara-text-on-accent)' : 'var(--thamara-text-secondary)',
                }}
              >
                <AlertTriangle size={12} strokeWidth={2.5} />
                Requests
              </button>
            </>
          )}
          
          {/* Category chips */}
          {MODE_CONFIGS[mode].categories.slice(1).map((cat) => {
            const Icon = cat.icon;
            const isActive = categoryFilter === cat.value;
            
            return (
              <button
                key={cat.value}
                onClick={() => setCategoryFilter(isActive ? 'all' : cat.value)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: isActive ? 'var(--thamara-primary-500)' : 'var(--thamara-bg-secondary)',
                  color: isActive ? 'var(--thamara-text-on-primary)' : 'var(--thamara-text-secondary)',
                }}
              >
                <Icon size={12} strokeWidth={2.5} />
                {cat.label}
              </button>
            );
          })}
          
          {/* Distance filter */}
          <button
            onClick={() => setDistanceFilter(distanceFilter === 'near' ? 'any' : 'near')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex-shrink-0"
            style={{
              background: distanceFilter === 'near' ? 'var(--thamara-info)' : 'var(--thamara-bg-secondary)',
              color: distanceFilter === 'near' ? 'white' : 'var(--thamara-text-secondary)',
            }}
          >
            <MapPin size={12} strokeWidth={2.5} />
            Near Only
          </button>
          
          {/* Trust filter */}
          <button
            onClick={() => setTrustFilter(!trustFilter)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all flex-shrink-0"
            style={{
              background: trustFilter ? 'var(--thamara-success)' : 'var(--thamara-bg-secondary)',
              color: trustFilter ? 'white' : 'var(--thamara-text-secondary)',
            }}
          >
            <ShieldCheck size={12} strokeWidth={2.5} />
            Verified Only
          </button>
          
          {/* Urgency filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-full border flex-shrink-0"
            style={{
              background: urgencyFilter !== 'any' ? 'var(--thamara-warning)' : 'var(--thamara-bg-secondary)',
              borderColor: 'var(--thamara-border)',
              color: urgencyFilter !== 'any' ? 'white' : 'var(--thamara-text-secondary)',
            }}
          >
            <option value="any">Any Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
        </div>
        
        {/* Sort */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--thamara-text-muted)' }}>
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1 text-xs font-semibold rounded-md border"
              style={{
                background: 'var(--thamara-bg)',
                borderColor: 'var(--thamara-border)',
                color: 'var(--thamara-text-primary)',
              }}
            >
              <option value="ai_match">AI Match</option>
              <option value="newest">Newest</option>
              <option value="closest">Closest</option>
              <option value="quantity">Quantity</option>
            </select>
          </div>
          
          <div className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>
            {displayedListings.length} listing{displayedListings.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      
      {/* Listings */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {displayedListings.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} style={{ color: 'var(--thamara-text-muted)', margin: '0 auto 16px' }} />
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
              No listings found
            </p>
            <p className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>
              Try adjusting your filters or create a new listing
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
      
      {/* Floating Action Button */}
      <div className="flex-shrink-0 p-5">
        {mode === 'hubs' ? (
          <button
            onClick={() => setShowBundleGenerator(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
              color: 'var(--thamara-text-on-accent)',
            }}
          >
            <Sparkles size={20} strokeWidth={2.5} />
            Generate Request Bundle
          </button>
        ) : (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
              color: 'var(--thamara-text-on-accent)',
            }}
          >
            <Plus size={20} strokeWidth={2.5} />
            Post {typeFilter === 'offer' ? 'Offer' : typeFilter === 'request' ? 'Request' : 'Offer/Request'}
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
      className="p-4 rounded-xl border shadow-sm"
      style={{
        background: 'var(--thamara-surface)',
        borderColor: 'var(--thamara-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0"
            style={{
              background: 'var(--thamara-primary-100)',
              color: 'var(--thamara-primary-700)',
            }}
          >
            <CategoryIcon size={20} strokeWidth={2.5} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2 py-0.5 text-xs font-bold rounded uppercase"
                style={{
                  background: listing.type === 'offer' ? 'var(--thamara-success)' : 'var(--thamara-warning)',
                  color: 'white',
                }}
              >
                {listing.type}
              </span>
              {matchScore.score >= 70 && (
                <div className="flex items-center gap-1">
                  <Sparkles size={12} style={{ color: 'var(--thamara-accent-600)' }} />
                  <span className="text-xs font-bold" style={{ color: 'var(--thamara-accent-600)' }}>
                    {matchScore.score}% Match
                  </span>
                </div>
              )}
            </div>
            
            <h3 className="text-base font-bold mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
              {listing.title}
            </h3>
            
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
              <span className="font-semibold">
                {listing.quantity} {listing.unit}
              </span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <TrustIcon size={12} strokeWidth={2.5} />
                <span style={{ color: trustBadge.color }}>{trustBadge.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
          <MapPin size={14} strokeWidth={2.5} />
          <span>{listing.locationLabel}</span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: 'var(--thamara-primary-50)',
              color: 'var(--thamara-primary-700)',
            }}
          >
            {listing.distanceBand}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
          <Clock size={14} strokeWidth={2.5} />
          <span>
            {listing.urgency === 'today' ? 'Available today' : listing.urgency === 'week' ? 'This week' : 'Flexible timing'}
          </span>
        </div>
        
        {listing.dateTime && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
            <Calendar size={14} strokeWidth={2.5} />
            <span>{listing.dateTime}</span>
          </div>
        )}
        
        {listing.notes && (
          <p className="text-xs leading-relaxed pt-1" style={{ color: 'var(--thamara-text-secondary)' }}>
            {listing.notes}
          </p>
        )}
        
        {isHub && listing.availableItems && (
          <div className="flex flex-wrap gap-1 pt-1">
            {listing.availableItems.map((item, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded-md"
                style={{
                  background: 'var(--thamara-accent-100)',
                  color: 'var(--thamara-accent-700)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        )}
        
        {isHub && listing.hours && (
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
            <Clock size={14} strokeWidth={2.5} />
            <span>{listing.hours}</span>
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--thamara-border)' }}>
        <button
          onClick={() => onViewMatches(listing)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all"
          style={{
            background: 'var(--thamara-primary-500)',
            color: 'var(--thamara-text-on-primary)',
          }}
        >
          <Sparkles size={16} strokeWidth={2.5} />
          View Matches
        </button>
        
        {listing.category === 'fertilizer' && (
          <button
            onClick={() => onShowSafety(listing.category)}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style={{
              background: 'var(--thamara-warning)',
              color: 'white',
            }}
          >
            <Info size={16} strokeWidth={2.5} />
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div
        className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--thamara-surface)' }}
      >
        <div className="sticky top-0 flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--thamara-border)', background: 'var(--thamara-surface)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--thamara-text-primary)' }}>
            Create Listing
          </h2>
          <button onClick={onClose} className="p-2">
            <X size={20} style={{ color: 'var(--thamara-text-secondary)' }} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div
        className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] flex flex-col"
        style={{ background: 'var(--thamara-surface)' }}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--thamara-border)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--thamara-text-primary)' }}>
            Recommended Matches
          </h2>
          <button onClick={onClose} className="p-2">
            <X size={20} style={{ color: 'var(--thamara-text-secondary)' }} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div
        className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--thamara-surface)' }}
      >
        <div className="sticky top-0 flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--thamara-border)', background: 'var(--thamara-surface)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--thamara-text-primary)' }}>
            Generate Request Bundle
          </h2>
          <button onClick={onClose} className="p-2">
            <X size={20} style={{ color: 'var(--thamara-text-secondary)' }} />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
      <div
        className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--thamara-surface)' }}
      >
        <div className="sticky top-0 flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--thamara-border)', background: 'var(--thamara-surface)' }}>
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{
                background: 'var(--thamara-warning)',
              }}
            >
              <Info size={18} strokeWidth={2.5} style={{ color: 'white' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--thamara-text-primary)' }}>
              {data.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-2">
            <X size={20} style={{ color: 'var(--thamara-text-secondary)' }} />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
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
