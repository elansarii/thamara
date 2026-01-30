'use client';

import { useState } from 'react';
import { Package, Building2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/lib/i18n';

// Dynamically import tabs to avoid SSR issues
const DropsTab = dynamic(() => import('./DropsTab'), { ssr: false });
const OrgBridgeTab = dynamic(() => import('./OrgBridgeTab'), { ssr: false });

type TabMode = 'drops' | 'orgbridge';

export default function DropsPage() {
  const [activeTab, setActiveTab] = useState<TabMode>('drops');
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--thamara-bg)' }}>
      {/* Segmented Control for Tabs */}
      <div
        className="px-5 pt-5 pb-3 border-b"
        style={{
          background: 'var(--thamara-surface)',
          borderColor: 'var(--thamara-border)'
        }}
      >
        <div
          className="flex gap-2 p-1"
          style={{
            background: 'var(--thamara-bg-secondary)',
            borderRadius: 'var(--thamara-radius-lg)'
          }}
        >
          <button
            onClick={() => setActiveTab('drops')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200"
            style={{
              background: activeTab === 'drops' ? 'var(--thamara-surface)' : 'transparent',
              color: activeTab === 'drops' ? 'var(--thamara-primary-700)' : 'var(--thamara-text-secondary)',
              borderRadius: 'var(--thamara-radius-md)',
              boxShadow: activeTab === 'drops' ? 'var(--thamara-shadow-sm)' : 'none',
            }}
          >
            <Package size={18} strokeWidth={2.5} />
            <span>{t.drops.title}</span>
          </button>

          <button
            onClick={() => setActiveTab('orgbridge')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all duration-200"
            style={{
              background: activeTab === 'orgbridge' ? 'var(--thamara-surface)' : 'transparent',
              color: activeTab === 'orgbridge' ? 'var(--thamara-primary-700)' : 'var(--thamara-text-secondary)',
              borderRadius: 'var(--thamara-radius-md)',
              boxShadow: activeTab === 'orgbridge' ? 'var(--thamara-shadow-sm)' : 'none',
            }}
          >
            <Building2 size={18} strokeWidth={2.5} />
            <span>{t.drops.orgBridge}</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'drops' ? <DropsTab /> : <OrgBridgeTab />}
    </div>
  );
}
