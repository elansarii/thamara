'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Droplets, Sprout, Calendar, TrendingUp, ChevronDown, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { getCropById, type CropData } from '@/data/crops';
import { calculateSeedRequirements } from '@/lib/seedCalc';
import { enrichCropData } from '@/lib/cropEnrichment';
import { getSeedSourcesForCrop } from '@/data/seedSources';
import { getROICategory } from '@/lib/recommender';
import type { CropScore, RecommendationInput } from '@/lib/recommender';
import type { EnrichedCropData } from '@/lib/cropEnrichment';

function CropResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [recommendations, setRecommendations] = useState<CropScore[]>([]);
  const [alternatives, setAlternatives] = useState<CropScore[]>([]);
  const [enrichedData, setEnrichedData] = useState<Map<string, EnrichedCropData>>(new Map());
  const [plotAreaM2, setPlotAreaM2] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [expandedWhyId, setExpandedWhyId] = useState<string | null>(null);
  const [expandedPracticeId, setExpandedPracticeId] = useState<string | null>(null);
  const [expandedReasoningId, setExpandedReasoningId] = useState<string | null>(null);
  
  useEffect(() => {
    setOfflineMode(!navigator.onLine);
    
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useEffect(() => {
    const loadResults = async () => {
      try {
        const data = sessionStorage.getItem('thamara_crop_recommendations');
        if (!data) {
          router.push('/crop-plan');
          return;
        }
        
        const { topCrops, alternatives: alts, plotAreaM2: area } = JSON.parse(data);
        setRecommendations(topCrops);
        setAlternatives(alts);
        setPlotAreaM2(area);
        
        // Enrich top crops
        const cropsToEnrich: CropData[] = topCrops.map((cs: CropScore) => cs.crop);
        const enrichmentPromises = cropsToEnrich.map((crop: CropData) => enrichCropData(crop));
        
        try {
          const enriched = await Promise.all(enrichmentPromises);
          const enrichedMap = new Map<string, EnrichedCropData>();
          enriched.forEach(e => enrichedMap.set(e.crop.id, e));
          setEnrichedData(enrichedMap);
        } catch (error) {
          console.warn('Failed to enrich some crops:', error);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load results:', error);
        router.push('/crop-plan');
      }
    };
    
    loadResults();
  }, [router]);
  
  const handleFindSeeds = (cropId: string) => {
    sessionStorage.setItem('thamara_seed_search_crop', cropId);
    router.push('/map?layer=seeds');
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center" style={{ background: 'var(--thamara-bg)' }}>
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--thamara-accent-500)' }} />
        <p className="mt-4" style={{ color: 'var(--thamara-text-secondary)' }}>Loading results...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--thamara-bg)' }}>
      {/* Header */}
      <div 
        className="sticky top-0 z-10 px-5 py-4 border-b"
        style={{ 
          background: 'var(--thamara-surface)',
          borderColor: 'var(--thamara-border)',
          boxShadow: 'var(--thamara-shadow-sm)'
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--thamara-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--thamara-surface-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--thamara-text-primary)' }}>
            Recommendations
          </h1>
        </div>
        {offlineMode && (
          <div 
            className="text-xs px-3 py-2 rounded-lg"
            style={{ 
              background: 'var(--thamara-warning)',
              color: 'white',
              opacity: 0.9
            }}
          >
            Offline mode - using cached data
          </div>
        )}
      </div>
      
      {/* Results */}
      <div className="p-4 space-y-4 pb-32">
        <h2 className="font-semibold" style={{ color: 'var(--thamara-text-primary)' }}>
          Top Recommendations
        </h2>
        
        {recommendations.map((cropScore, index) => (
          <CropCard
            key={cropScore.crop.id}
            cropScore={cropScore}
            enriched={enrichedData.get(cropScore.crop.id)}
            rank={index + 1}
            plotAreaM2={plotAreaM2}
            expandedWhyId={expandedWhyId}
            expandedPracticeId={expandedPracticeId}
            expandedReasoningId={expandedReasoningId}
            onToggleWhy={setExpandedWhyId}
            onTogglePractice={setExpandedPracticeId}
            onToggleReasoning={setExpandedReasoningId}
            onFindSeeds={handleFindSeeds}
          />
        ))}
        
        {alternatives && alternatives.length > 0 && (
          <>
            <h2 className="font-semibold mt-6" style={{ color: 'var(--thamara-text-primary)' }}>
              Alternatives
            </h2>
            <div className="space-y-2">
              {alternatives.map(cropScore => (
                <div
                  key={cropScore.crop.id}
                  className="border rounded-lg p-4"
                  style={{
                    background: 'var(--thamara-surface)',
                    borderColor: 'var(--thamara-border)',
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium" style={{ color: 'var(--thamara-text-primary)' }}>
                        {cropScore.crop.commonName}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--thamara-text-secondary)' }}>
                        Fit: {cropScore.fitScore}/100
                      </p>
                    </div>
                    <button
                      onClick={() => handleFindSeeds(cropScore.crop.id)}
                      className="text-sm transition-colors"
                      style={{ color: 'var(--thamara-accent-500)' }}
                    >
                      Find seeds →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Attribution */}
      <div 
        className="px-4 py-3 border-t text-xs mt-auto"
        style={{ 
          background: 'var(--thamara-surface)',
          color: 'var(--thamara-text-muted)',
          borderColor: 'var(--thamara-border)'
        }}
      >
        <p>Crop images and summaries: Wikipedia/Wikimedia (cached when available)</p>
        <p className="mt-1">Dataset values are approximate for MVP demonstration</p>
      </div>
    </div>
  );
}

export default function CropResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-full items-center justify-center" style={{ background: 'var(--thamara-bg)' }}>
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--thamara-accent-500)' }} />
        <p className="mt-4" style={{ color: 'var(--thamara-text-secondary)' }}>Loading results...</p>
      </div>
    }>
      <CropResultsContent />
    </Suspense>
  );
}

function CropCard({
  cropScore,
  enriched,
  rank,
  plotAreaM2,
  expandedWhyId,
  expandedPracticeId,
  expandedReasoningId,
  onToggleWhy,
  onTogglePractice,
  onToggleReasoning,
  onFindSeeds,
}: {
  cropScore: CropScore;
  enriched?: EnrichedCropData;
  rank: number;
  plotAreaM2: number;
  expandedWhyId: string | null;
  expandedPracticeId: string | null;
  expandedReasoningId: string | null;
  onToggleWhy: (id: string | null) => void;
  onTogglePractice: (id: string | null) => void;
  onToggleReasoning: (id: string | null) => void;
  onFindSeeds: (cropId: string) => void;
}) {
  const { crop, fitScore, confidence, flags, explanationBullets, reasoningTrace, roi } = cropScore;
  const isWhyExpanded = expandedWhyId === crop.id;
  const isPracticeExpanded = expandedPracticeId === crop.id;
  const isReasoningExpanded = expandedReasoningId === crop.id;
  
  const seedCalc = calculateSeedRequirements({ plotAreaM2, crop });
  const seedSources = getSeedSourcesForCrop(crop.id);
  const foodROICategory = getROICategory(roi.foodROI, 'food');
  const resourceROICategory = getROICategory(roi.resourceROI, 'resource');
  
  return (
    <div 
      className="border-2 rounded-xl overflow-hidden"
      style={{
        background: 'var(--thamara-surface)',
        borderColor: 'var(--thamara-border)',
        boxShadow: 'var(--thamara-shadow-md)'
      }}
    >
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header with title */}
        <div className="flex gap-3">
          {/* Image - Hidden as images aren't loading */}
          {/* {enriched?.imageUrl && (
            <div 
              className="relative flex-shrink-0 rounded-lg overflow-hidden"
              style={{ 
                width: '80px', 
                height: '80px',
                background: 'var(--thamara-bg-secondary)'
              }}
            >
              <img
                src={enriched.imageUrl}
                alt={crop.commonName}
                className="w-full h-full object-cover"
              />
            </div>
          )} */}
          
          {/* Title and badges */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{ 
                      background: 'var(--thamara-accent-500)',
                      color: 'var(--thamara-text-on-accent)'
                    }}
                  >
                    #{rank}
                  </span>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--thamara-text-primary)' }}>
                    {crop.commonName}
                  </h3>
                </div>
                <p className="text-xs italic" style={{ color: 'var(--thamara-text-muted)' }}>
                  {crop.scientificName}
                </p>
              </div>
              <div 
                className="text-sm font-semibold px-2 py-1 rounded flex-shrink-0"
                style={{ 
                  background: 'var(--thamara-accent-100)',
                  color: 'var(--thamara-accent-700)'
                }}
              >
                {fitScore}/100
              </div>
            </div>
          </div>
        </div>
        
        {/* Flags */}
        {flags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {flags.map(flag => (
              <span
                key={flag}
                className="text-xs px-2 py-1 rounded"
                style={{ 
                  background: 'var(--thamara-primary-100)',
                  color: 'var(--thamara-primary-700)'
                }}
              >
                {flag}
              </span>
            ))}
          </div>
        )}
        
        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div 
            className="p-2 rounded"
            style={{ background: 'var(--thamara-bg-secondary)' }}
          >
            <div style={{ color: 'var(--thamara-text-secondary)' }}>
              <Calendar size={14} className="inline mr-1" />
              Harvest
            </div>
            <div className="font-semibold" style={{ color: 'var(--thamara-text-primary)' }}>
              {crop.harvestDaysMin}-{crop.harvestDaysMax}d
            </div>
          </div>
          <div 
            className="p-2 rounded"
            style={{ background: 'var(--thamara-bg-secondary)' }}
          >
            <div style={{ color: 'var(--thamara-text-secondary)' }}>
              <Droplets size={14} className="inline mr-1" />
              Water
            </div>
            <div className="font-semibold capitalize" style={{ color: 'var(--thamara-text-primary)' }}>
              {crop.waterNeedBand}
            </div>
          </div>
          <div 
            className="p-2 rounded"
            style={{ background: 'var(--thamara-bg-secondary)' }}
          >
            <div style={{ color: 'var(--thamara-text-secondary)' }}>
              <Sprout size={14} className="inline mr-1" />
              Salinity
            </div>
            <div className="font-semibold capitalize" style={{ color: 'var(--thamara-text-primary)' }}>
              {crop.salinityTolerance}
            </div>
          </div>
        </div>
        
        {/* ROI Indicators */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--thamara-text-secondary)' }}>
                <TrendingUp size={14} className="inline mr-1" />
                Food ROI (cal/m²/day)
              </span>
              <span className="font-semibold" style={{ color: 'var(--thamara-text-primary)' }}>
                {roi.foodROI}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--thamara-border)' }}>
              <div
                className="h-full"
                style={{
                  width: `${Math.min(100, (roi.foodROI / 50) * 100)}%`,
                  background: foodROICategory === 'high'
                    ? 'var(--thamara-success)'
                    : foodROICategory === 'medium'
                    ? 'var(--thamara-warning)'
                    : 'var(--thamara-text-disabled)',
                }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: 'var(--thamara-text-secondary)' }}>
                <Droplets size={14} className="inline mr-1" />
                Resource ROI (kg/L)
              </span>
              <span className="font-semibold" style={{ color: 'var(--thamara-text-primary)' }}>
                {roi.resourceROI.toFixed(2)}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--thamara-border)' }}>
              <div
                className="h-full"
                style={{
                  width: `${Math.min(100, (roi.resourceROI / 0.1) * 100)}%`,
                  background: resourceROICategory === 'high'
                    ? 'var(--thamara-info)'
                    : resourceROICategory === 'medium'
                    ? 'var(--thamara-warning)'
                    : 'var(--thamara-text-disabled)',
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Description */}
        {enriched?.description && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--thamara-text-secondary)' }}>
            {enriched.description.slice(0, 150)}
            {enriched.description.length > 150 && '...'}
          </p>
        )}
        
        {/* Why This Crop (Expandable) */}
        <div>
          <button
            onClick={() => onToggleWhy(isWhyExpanded ? null : crop.id)}
            className="flex items-center justify-between w-full text-sm font-semibold py-2"
            style={{ color: 'var(--thamara-text-primary)' }}
          >
            <span>Why this crop?</span>
            {isWhyExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {isWhyExpanded && (
            <ul className="space-y-1 mt-2">
              {explanationBullets.map((bullet, i) => (
                <li key={i} className="text-sm flex items-start" style={{ color: 'var(--thamara-text-secondary)' }}>
                  <span className="mr-2" style={{ color: 'var(--thamara-accent-500)' }}>•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Practice Plan (Expandable) */}
        <div>
          <button
            onClick={() => onTogglePractice(isPracticeExpanded ? null : crop.id)}
            className="flex items-center justify-between w-full text-sm font-semibold py-2"
            style={{ color: 'var(--thamara-text-primary)' }}
          >
            <span>Practice Plan</span>
            {isPracticeExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {isPracticeExpanded && (
            <ol className="space-y-1 mt-2">
              {crop.practices.slice(0, 5).map((practice, i) => (
                <li key={i} className="text-sm flex items-start" style={{ color: 'var(--thamara-text-secondary)' }}>
                  <span className="mr-2 font-medium" style={{ color: 'var(--thamara-info)' }}>
                    {i + 1}.
                  </span>
                  <span>{practice}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        
        {/* Seed Calculation */}
        <div 
          className="border rounded-lg p-3 space-y-2"
          style={{
            background: 'var(--thamara-primary-50)',
            borderColor: 'var(--thamara-primary-200)'
          }}
        >
          <h4 className="text-sm font-semibold" style={{ color: 'var(--thamara-primary-700)' }}>
            Seed Needed for {plotAreaM2}m²
          </h4>
          <div className="text-lg font-bold" style={{ color: 'var(--thamara-primary-700)' }}>
            {seedCalc.seedAmountMin}–{seedCalc.seedAmountMax} {seedCalc.unit}
          </div>
          <div className="text-xs" style={{ color: 'var(--thamara-primary-600)' }}>
            <p>
              Spacing: {seedCalc.spacingGuide.rowCm}cm rows × {seedCalc.spacingGuide.plantCm}cm plants
            </p>
            <p className="mt-1">
              ≈ {seedCalc.spacingGuide.plantsPerM2} plants/m² = {Math.round(seedCalc.spacingGuide.plantsPerM2 * plotAreaM2)} total
            </p>
            <p className="mt-1" style={{ color: 'var(--thamara-text-muted)' }}>
              Assumes {Math.round(seedCalc.assumptions.germinationRate * 100)}% germination + {Math.round(seedCalc.assumptions.bufferPercent * 100)}% buffer
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onFindSeeds(crop.id)}
            className="flex-1 font-medium py-3 px-4 rounded-lg text-sm transition-all"
            style={{ 
              background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
              color: 'var(--thamara-text-on-accent)',
              boxShadow: '0 4px 8px -2px rgba(124, 179, 66, 0.3)'
            }}
          >
            <MapPin size={16} className="inline mr-2" />
            Find Seeds ({seedSources.length})
          </button>
          <button
            onClick={() => onToggleReasoning(isReasoningExpanded ? null : crop.id)}
            className="font-medium py-3 px-4 rounded-lg text-sm transition-colors"
            style={{ 
              background: 'var(--thamara-bg-secondary)',
              color: 'var(--thamara-text-primary)'
            }}
          >
            {isReasoningExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
        
        {/* AI Reasoning (Expandable) */}
        {isReasoningExpanded && (
          <div 
            className="border rounded-lg p-3 space-y-2"
            style={{
              background: 'var(--thamara-bg-secondary)',
              borderColor: 'var(--thamara-border)'
            }}
          >
            <h4 className="text-sm font-semibold" style={{ color: 'var(--thamara-text-primary)' }}>
              AI Reasoning
            </h4>
            
            <div className="text-xs space-y-1">
              <p className="font-medium" style={{ color: 'var(--thamara-text-secondary)' }}>
                Score Breakdown:
              </p>
              <ul className="space-y-1 ml-2" style={{ color: 'var(--thamara-text-muted)' }}>
                <li>Harvest Fit: {reasoningTrace.scoreBreakdown.harvestFit}/100</li>
                <li>Water Fit: {reasoningTrace.scoreBreakdown.waterFit}/100</li>
                <li>Salinity Fit: {reasoningTrace.scoreBreakdown.salinityFit}/100</li>
                <li>Heat Fit: {reasoningTrace.scoreBreakdown.heatFit}/100</li>
                <li>Priority Bonus: {reasoningTrace.scoreBreakdown.priorityBonus}/100</li>
              </ul>
            </div>
            
            <div className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>
              Confidence: {confidence}/100 ({reasoningTrace.constraintsSatisfied}/{reasoningTrace.totalConstraints} constraints satisfied)
            </div>
          </div>
        )}
        
        {/* Cache Status */}
        {enriched?.cacheAge !== undefined && enriched.cacheAge > 0 && (
          <div className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>
            Using cached data ({enriched.cacheAge} days old)
          </div>
        )}
      </div>
    </div>
  );
}
