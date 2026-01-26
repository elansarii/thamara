'use client';

import { useMemo } from 'react';
import { X, TrendingUp, MapPin, Clock, Package, ShieldCheck, Sparkles } from 'lucide-react';
import type { HarvestDrop, BuyerMatch } from '@/lib/dropsTypes';
import { rankBuyerMatches } from '@/lib/dropsAI';

export default function MatchPickupDrawer({
  drop,
  onClose,
}: {
  drop: HarvestDrop;
  onClose: () => void;
}) {
  const matches = useMemo(() => rankBuyerMatches(drop), [drop]);
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col"
        style={{
          background: 'var(--thamara-surface)',
          borderRadius: 'var(--thamara-radius-xl)',
          boxShadow: 'var(--thamara-shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-start justify-between"
          style={{ borderColor: 'var(--thamara-border)' }}
        >
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
              Match Pickup
            </h2>
            <p className="text-sm" style={{ color: 'var(--thamara-text-secondary)' }}>
              {drop.cropCommonName} • {drop.quantityMin}-{drop.quantityMax} {drop.unit}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-opacity-80 transition-all"
            style={{ color: 'var(--thamara-text-secondary)' }}
          >
            <X size={24} />
          </button>
        </div>
        
        {/* AI Ranking Notice */}
        <div 
          className="px-6 py-3 border-b flex items-center gap-2"
          style={{
            background: 'var(--thamara-accent-50)',
            borderColor: 'var(--thamara-border)',
          }}
        >
          <Sparkles size={16} style={{ color: 'var(--thamara-accent-600)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--thamara-accent-700)' }}>
            AI-ranked matches based on trust, distance, capacity, and availability
          </span>
        </div>
        
        {/* Matches List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {matches.map((match, index) => (
            <MatchCard key={match.id} match={match} rank={index + 1} />
          ))}
        </div>
        
        {/* Footer */}
        <div 
          className="px-6 py-4 border-t"
          style={{ 
            background: 'var(--thamara-bg-secondary)',
            borderColor: 'var(--thamara-border)'
          }}
        >
          <p className="text-xs text-center" style={{ color: 'var(--thamara-text-muted)' }}>
            Contact methods are demonstrated values for MVP. Real coordination would use verified channels.
          </p>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match, rank }: { match: BuyerMatch; rank: number }) {
  const getTypeIcon = () => {
    switch (match.type) {
      case 'ngo':
      case 'verified_hub':
        return <ShieldCheck size={20} />;
      case 'aggregator':
        return <Package size={20} />;
      default:
        return <Package size={20} />;
    }
  };
  
  const getTypeColor = () => {
    switch (match.type) {
      case 'ngo':
      case 'verified_hub':
        return 'var(--thamara-success)';
      case 'aggregator':
        return 'var(--thamara-accent-600)';
      default:
        return 'var(--thamara-primary-600)';
    }
  };
  
  const getDistanceColor = () => {
    if (match.distanceBand === 'near') return 'var(--thamara-success)';
    if (match.distanceBand === 'medium') return 'var(--thamara-warning)';
    return 'var(--thamara-text-muted)';
  };
  
  return (
    <div
      className="p-4 border transition-all hover:shadow-md"
      style={{
        background: 'var(--thamara-surface)',
        borderColor: rank === 1 
          ? 'var(--thamara-accent-400)' 
          : 'var(--thamara-border)',
        borderWidth: rank === 1 ? '2px' : '1px',
        borderRadius: 'var(--thamara-radius-lg)',
      }}
    >
      {/* Header with Rank */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-12 h-12 flex items-center justify-center flex-shrink-0"
            style={{
              background: `${getTypeColor()}15`,
              borderRadius: 'var(--thamara-radius-md)',
              color: getTypeColor(),
            }}
          >
            {getTypeIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate" style={{ color: 'var(--thamara-text-primary)' }}>
                {match.name}
              </h3>
              {rank === 1 && (
                <span
                  className="px-2 py-0.5 text-xs font-bold flex-shrink-0"
                  style={{
                    background: 'var(--thamara-accent-500)',
                    color: 'white',
                    borderRadius: 'var(--thamara-radius-md)',
                  }}
                >
                  TOP MATCH
                </span>
              )}
            </div>
            <p className="text-xs capitalize" style={{ color: 'var(--thamara-text-secondary)' }}>
              {match.type.replace('_', ' ')}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
          <div
            className="flex items-center gap-1 px-2 py-1 text-xs font-bold"
            style={{
              background: match.matchScore >= 80
                ? 'var(--thamara-success)'
                : match.matchScore >= 60
                ? 'var(--thamara-accent-500)'
                : 'var(--thamara-primary-500)',
              color: 'white',
              borderRadius: 'var(--thamara-radius-md)',
            }}
          >
            <TrendingUp size={12} />
            <span>{match.matchScore}%</span>
          </div>
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--thamara-text-muted)' }}
          >
            Rank #{rank}
          </span>
        </div>
      </div>
      
      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={14} style={{ color: getDistanceColor() }} />
          <span style={{ color: 'var(--thamara-text-secondary)' }}>
            {match.distanceBand === 'near' ? 'Very close' : match.distanceBand === 'medium' ? 'Medium distance' : 'Far'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Package size={14} style={{ color: 'var(--thamara-text-muted)' }} />
          <span style={{ color: 'var(--thamara-text-secondary)' }}>
            {match.capacityFit === 'exact' ? 'Perfect fit' : match.capacityFit === 'can_handle' ? 'Can handle' : 'Limited capacity'}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm col-span-2">
          <ShieldCheck size={14} style={{ color: 'var(--thamara-text-muted)' }} />
          <span style={{ color: 'var(--thamara-text-secondary)' }}>
            Trust Score: {match.trustScore}/100
          </span>
        </div>
      </div>
      
      {/* Why This Match */}
      <div className="mb-3">
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--thamara-text-secondary)' }}>
          Why this match:
        </p>
        <div className="flex flex-wrap gap-2">
          {match.matchReasons.map((reason, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs font-medium"
              style={{
                background: 'var(--thamara-primary-50)',
                color: 'var(--thamara-primary-700)',
                borderRadius: 'var(--thamara-radius-full)',
                border: '1px solid var(--thamara-primary-200)',
              }}
            >
              {reason}
            </span>
          ))}
        </div>
      </div>
      
      {/* Contact Method */}
      {match.contactMethod && (
        <div
          className="p-2 text-xs"
          style={{
            background: 'var(--thamara-bg-secondary)',
            borderRadius: 'var(--thamara-radius-md)',
            color: 'var(--thamara-text-secondary)',
          }}
        >
          <span className="font-medium">Contact: </span>
          {match.contactMethod}
        </div>
      )}
    </div>
  );
}
