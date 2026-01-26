'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, AlertTriangle, Calendar, Target, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { recommendCrops } from '@/lib/recommender';
import { usePlotStore } from '@/lib/plotStore';
import type {
  RecommendationInput,
  WaterAccess,
  SalinityRisk,
  UserPriority,
} from '@/lib/recommender';

export default function CropPlanPage() {
  const router = useRouter();
  const { lastPlot } = usePlotStore();
  
  // Input state
  const [plotAreaM2, setPlotAreaM2] = useState<number>(50);
  const [waterAccess, setWaterAccess] = useState<WaterAccess>('limited');
  const [salinityRisk, setSalinityRisk] = useState<SalinityRisk>('some');
  const [targetHarvestWindowDays, setTargetHarvestWindowDays] = useState<number>(45);
  const [userPriority, setUserPriority] = useState<UserPriority>('balanced');
  const [isCalculating, setIsCalculating] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [usingLoggedPlot, setUsingLoggedPlot] = useState(false);
  
  // Initialize with logged plot data if available
  useEffect(() => {
    if (lastPlot) {
      setUsingLoggedPlot(true);
      if (lastPlot.areaM2) setPlotAreaM2(lastPlot.areaM2);
      
      // Map plot waterAccess to recommendation waterAccess
      if (lastPlot.waterAccess === 'none') setWaterAccess('none');
      else if (lastPlot.waterAccess === 'limited') setWaterAccess('limited');
      else if (lastPlot.waterAccess === 'reliable') setWaterAccess('reliable');
      
      // Map plot salinity to recommendation salinityRisk
      if (lastPlot.salinity === 'low') setSalinityRisk('none');
      else if (lastPlot.salinity === 'medium') setSalinityRisk('some');
      else if (lastPlot.salinity === 'high') setSalinityRisk('strong');
    }
  }, [lastPlot]);
  
  // Check online status
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
  
  // Calculate recommendations
  const handleCalculate = async () => {
    setIsCalculating(true);
    
    // Simulate AI thinking for 2-3 seconds
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const input: RecommendationInput = {
      plotAreaM2,
      waterAccess,
      salinityRisk,
      targetHarvestWindowDays,
      shadeOption: 'none',
      userPriority,
    };
    
    const result = recommendCrops(input);
    
    // Store results in sessionStorage and navigate to results page
    sessionStorage.setItem('thamara_crop_recommendations', JSON.stringify({
      topCrops: result.topCrops,
      alternatives: result.alternatives,
      plotAreaM2,
    }));
    
    setIsCalculating(false);
    router.push('/crop-plan/results');
  };
  
  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--thamara-bg)' }}>
      {/* Loading Overlay */}
      {isCalculating && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: 'rgba(255, 255, 255, 0.95)' }}
        >
          <Sparkles 
            className="w-16 h-16 mb-4 animate-pulse" 
            style={{ color: 'var(--thamara-accent-500)' }}
          />
          <Loader2 
            className="w-12 h-12 animate-spin mb-4" 
            style={{ color: 'var(--thamara-accent-500)' }}
          />
          <p 
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--thamara-text-primary)' }}
          >
            AI is analyzing your conditions...
          </p>
          <p 
            className="text-sm"
            style={{ color: 'var(--thamara-text-secondary)' }}
          >
            Finding the best crops for your plot
          </p>
        </div>
      )}
      
      {/* Header */}
      <div 
        className="px-5 py-4 border-b"
        style={{ 
          background: 'var(--thamara-surface)',
          borderColor: 'var(--thamara-border)',
          boxShadow: 'var(--thamara-shadow-sm)'
        }}
      >
        <h1 className="text-xl font-semibold" style={{ color: 'var(--thamara-text-primary)' }}>
          Crop & Practice Plan
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--thamara-text-secondary)' }}>
          AI-powered crop recommendations based on your constraints
        </p>
        {usingLoggedPlot && (
          <div 
            className="mt-2 text-xs px-3 py-2 rounded-lg flex items-center"
            style={{ 
              background: 'var(--thamara-accent-100)',
              color: 'var(--thamara-accent-700)',
            }}
          >
            <CheckCircle2 size={14} className="inline mr-2 flex-shrink-0" />
            Using conditions from your logged plot{lastPlot?.name ? ` "${lastPlot.name}"` : ''}
          </div>
        )}
        {offlineMode && (
          <div 
            className="mt-2 text-xs px-3 py-2 rounded-lg"
            style={{ 
              background: 'var(--thamara-warning)',
              color: 'white',
              opacity: 0.9
            }}
          >
            <AlertTriangle size={14} className="inline mr-1" />
            Offline mode - using cached data
          </div>
        )}
      </div>
      
      {/* Input Panel */}
      <div 
        className="p-5 border-b space-y-4"
        style={{
          background: 'var(--thamara-surface)',
          borderColor: 'var(--thamara-border)'
        }}
      >
        <h2 className="font-semibold text-sm" style={{ color: 'var(--thamara-text-primary)' }}>
          Your Conditions
        </h2>
        
        {/* Plot Area */}
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: 'var(--thamara-text-secondary)' }}>
            <Target size={16} className="inline mr-2" />
            Plot Area (m²)
          </label>
          <input
            type="number"
            value={plotAreaM2}
            onChange={e => setPlotAreaM2(Math.max(1, Number(e.target.value)))}
            className="w-full px-4 py-3 border rounded-lg text-sm"
            style={{
              borderColor: 'var(--thamara-border)',
              background: 'var(--thamara-surface)',
              color: 'var(--thamara-text-primary)'
            }}
            min="1"
          />
        </div>
        
        {/* Water Access */}
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: 'var(--thamara-text-secondary)' }}>
            <Droplets size={16} className="inline mr-2" />
            Water Access
          </label>
          <select
            value={waterAccess}
            onChange={e => setWaterAccess(e.target.value as WaterAccess)}
            className="w-full px-4 py-3 border rounded-lg text-sm"
            style={{
              borderColor: 'var(--thamara-border)',
              background: 'var(--thamara-surface)',
              color: 'var(--thamara-text-primary)'
            }}
          >
            <option value="none">None (rainwater only)</option>
            <option value="limited">Limited (occasional irrigation)</option>
            <option value="reliable">Reliable (regular irrigation)</option>
          </select>
        </div>
        
        {/* Salinity Risk */}
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: 'var(--thamara-text-secondary)' }}>
            <AlertTriangle size={16} className="inline mr-2" />
            Salinity Risk
          </label>
          <select
            value={salinityRisk}
            onChange={e => setSalinityRisk(e.target.value as SalinityRisk)}
            className="w-full px-4 py-3 border rounded-lg text-sm"
            style={{
              borderColor: 'var(--thamara-border)',
              background: 'var(--thamara-surface)',
              color: 'var(--thamara-text-primary)'
            }}
          >
            <option value="none">None (fresh soil/water)</option>
            <option value="some">Some (moderate salinity)</option>
            <option value="strong">Strong (high salinity)</option>
          </select>
        </div>
        
        {/* Harvest Window */}
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: 'var(--thamara-text-secondary)' }}>
            <Calendar size={16} className="inline mr-2" />
            Target Harvest (days)
          </label>
          <select
            value={targetHarvestWindowDays}
            onChange={e => setTargetHarvestWindowDays(Number(e.target.value))}
            className="w-full px-4 py-3 border rounded-lg text-sm"
            style={{
              borderColor: 'var(--thamara-border)',
              background: 'var(--thamara-surface)',
              color: 'var(--thamara-text-primary)'
            }}
          >
            <option value="30">30 days (very fast)</option>
            <option value="45">45 days (fast)</option>
            <option value="60">60 days (medium)</option>
            <option value="90">90 days (patient)</option>
          </select>
        </div>
        
        {/* Priority */}
        <div className="space-y-2">
          <label className="block text-sm font-medium" style={{ color: 'var(--thamara-text-secondary)' }}>
            <Sparkles size={16} className="inline mr-2" />
            Priority
          </label>
          <select
            value={userPriority}
            onChange={e => setUserPriority(e.target.value as UserPriority)}
            className="w-full px-4 py-3 border rounded-lg text-sm"
            style={{
              borderColor: 'var(--thamara-border)',
              background: 'var(--thamara-surface)',
              color: 'var(--thamara-text-primary)'
            }}
          >
            <option value="max_calories">Maximum Calories</option>
            <option value="min_water">Minimum Water</option>
            <option value="balanced">Balanced</option>
          </select>
        </div>
        
        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="w-full font-semibold py-4 px-4 rounded-lg text-sm transition-all"
          style={{ 
            background: isCalculating 
              ? 'var(--thamara-text-disabled)'
              : 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
            color: 'var(--thamara-text-on-accent)',
            boxShadow: isCalculating ? 'none' : '0 4px 8px -2px rgba(124, 179, 66, 0.3)',
            cursor: isCalculating ? 'not-allowed' : 'pointer'
          }}
        >
          {isCalculating ? (
            <>
              <Loader2 size={16} className="inline mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={16} className="inline mr-2" />
              Get Recommendations
            </>
          )}
        </button>
      </div>
      
      {/* Attribution */}
      <div 
        className="px-5 py-4 text-xs mt-auto"
        style={{ color: 'var(--thamara-text-muted)' }}
      >
        <p>Crop images and summaries: Wikipedia/Wikimedia (cached when available)</p>
        <p className="mt-1">Dataset values are approximate for MVP demonstration</p>
      </div>
    </div>
  );
}
