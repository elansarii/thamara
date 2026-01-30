'use client';

import { useState } from 'react';
import { Package, Building2, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { seedAllDemoData } from '@/lib/demoSeeder';
import { useLanguage } from '@/lib/i18n';

// Dynamically import tabs to avoid SSR issues
const DropsTab = dynamic(() => import('./DropsTab'), { ssr: false });
const OrgBridgeTab = dynamic(() => import('./OrgBridgeTab'), { ssr: false });

type TabMode = 'drops' | 'orgbridge';

export default function DropsPage() {
  const [activeTab, setActiveTab] = useState<TabMode>('drops');
  const [showSeedButton, setShowSeedButton] = useState(true);
  const { t } = useLanguage();

  const handleSeedDemo = () => {
    seedAllDemoData();
    setShowSeedButton(false);
    // Reload the page to show the new data
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--thamara-bg)' }}>
      {/* Demo Seed Button */}
      {showSeedButton && (
        <div
          className="px-5 pt-4 pb-2"
          style={{
            background: 'var(--thamara-accent-50)',
            borderBottom: '1px solid var(--thamara-accent-200)'
          }}
        >
          <button
            onClick={handleSeedDemo}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
              color: 'white',
              borderRadius: 'var(--thamara-radius-lg)',
              boxShadow: '0 2px 8px -2px rgba(124, 179, 66, 0.4)',
            }}
          >
            <Sparkles size={18} strokeWidth={2.5} />
            <span>{t.drops.loadDemo} (4 Drops + 3 Cases)</span>
          </button>
        </div>
      )}

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
