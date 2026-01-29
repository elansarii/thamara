"use client";

import Link from 'next/link';
import { MapPin, Sprout, Droplet, Users, TrendingUp, MapPinned, Plus, ClipboardCheck } from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { usePlotStore } from '@/lib/plotStore';
import { assess } from '@/lib/assessment';

export default function HomePage() {
  const { lastPlot, plots, waterPoints } = usePlotStore();
  
  // Calculate impact metrics
  const totalPlots = plots.length;
  const totalArea = plots.reduce((sum, plot) => sum + (plot.areaM2 || 0), 0);
  const totalAreaHa = (totalArea / 10000).toFixed(2);
  
  return (
    <div className="p-5 pb-6 space-y-7">
      {/* Greeting Section with modern typography */}
      <section className="pt-3">
        <h1 
          className="text-3xl font-bold leading-tight mb-2 tracking-tight"
          style={{ color: 'var(--thamara-text-primary)' }}
        >
          مرحبا Welcome
        </h1>
        <p 
          className="text-base leading-relaxed"
          style={{ color: 'var(--thamara-text-secondary)' }}
        >
          Check your land and get planting guidance
        </p>
      </section>

      {/* Action Tiles Grid - Mobile optimized */}
      <section className="grid grid-cols-2 gap-3">
        <ActionCard
          title="Check Plantability"
          icon={<MapPin size={26} strokeWidth={2} />}
          href={ROUTES.MAP}
          gradient="from-blue-500 to-blue-600"
        />
        <ActionCard
          title="Get Crop Plan"
          icon={<Sprout size={26} strokeWidth={2} />}
          href={ROUTES.CROP_PLAN}
          gradient="from-green-500 to-green-600"
        />
        <ActionCard
          title="Find Water"
          icon={<Droplet size={26} strokeWidth={2} />}
          href={ROUTES.WATER}
          gradient="from-cyan-500 to-cyan-600"
        />
        <ActionCard
          title="Exchange & Work"
          icon={<Users size={26} strokeWidth={2} />}
          href={ROUTES.EXCHANGE}
          gradient="from-orange-500 to-orange-600"
        />
      </section>

      {/* Last Logged Plot Card */}
      <section 
        className="rounded-2xl p-6 border transition-all hover:shadow-md"
        style={{ 
          background: 'var(--thamara-surface)', 
          borderColor: 'var(--thamara-border)',
          boxShadow: 'var(--thamara-shadow-sm)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="text-xl font-bold"
            style={{ color: 'var(--thamara-text-primary)' }}
          >
            Last Logged Plot
          </h2>
          <ClipboardCheck 
            size={20} 
            strokeWidth={2.5}
            style={{ color: 'var(--thamara-accent-500)' }}
          />
        </div>
        {lastPlot ? (
          <div className="space-y-3">
            <div>
              <div 
                className="text-lg font-semibold mb-1"
                style={{ color: 'var(--thamara-text-primary)' }}
              >
                {lastPlot.name || "Unnamed Plot"}
              </div>
              {lastPlot.areaM2 && (
                <div 
                  className="text-sm"
                  style={{ color: 'var(--thamara-text-secondary)' }}
                >
                  {(lastPlot.areaM2 / 10000).toFixed(2)} ha
                </div>
              )}
            </div>
            <div>
              <StatusBadge status={assess(lastPlot).status} />
            </div>
            <Link
              href={ROUTES.ASSESSMENT}
              className="block w-full py-2.5 rounded-xl text-center text-sm font-semibold transition-all hover:opacity-80"
              style={{ 
                background: 'var(--thamara-accent-500)',
                color: 'white'
              }}
            >
              View Assessment
            </Link>
          </div>
        ) : (
          <div className="text-center py-4">
            <p 
              className="text-sm mb-3"
              style={{ color: 'var(--thamara-text-muted)' }}
            >
              No plots logged yet
            </p>
            <Link
              href={ROUTES.LOG_PLOT}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ 
                background: 'var(--thamara-accent-500)',
                color: 'white'
              }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Log Your First Plot
            </Link>
          </div>
        )}
      </section>

      {/* My Impact Card - Enhanced visual hierarchy */}
      <section 
        className="rounded-2xl p-6 border transition-all hover:shadow-md"
        style={{ 
          background: 'var(--thamara-surface)', 
          borderColor: 'var(--thamara-border)',
          boxShadow: 'var(--thamara-shadow-sm)'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="text-xl font-bold"
            style={{ color: 'var(--thamara-text-primary)' }}
          >
            My Impact
          </h2>
          <TrendingUp 
            size={20} 
            strokeWidth={2.5}
            style={{ color: 'var(--thamara-accent-500)' }}
          />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <ImpactStat label="Plots logged" value={totalPlots.toString()} />
          <ImpactStat label="Area" value={`${totalAreaHa} ha`} />
          <ImpactStat label="Water points" value={waterPoints.toString()} />
        </div>
      </section>

      {/* Primary CTA - Gradient button with proper touch target */}
      <section>
        <Link
          href={ROUTES.LOG_PLOT}
          className="flex w-full py-3.5 rounded-xl text-center text-base font-bold text-white transition-all duration-200 active:scale-[0.98] items-center justify-center gap-2 touch-target"
          style={{
            background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
            boxShadow: '0 4px 12px -2px rgba(124, 179, 66, 0.3)'
          }}
        >
          <MapPinned size={20} strokeWidth={2.5} />
          Log New Plot
        </Link>
      </section>

      {/* Offline Badge - Modern pill design */}
      <section className="flex justify-center">
        <div 
          className="inline-flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold"
          style={{ 
            background: 'var(--thamara-primary-50)', 
            color: 'var(--thamara-primary-700)',
            borderRadius: 'var(--thamara-radius-full)',
            border: '1.5px solid var(--thamara-primary-200)'
          }}
        >
          <span 
            className="w-2 h-2 rounded-full animate-pulse" 
            style={{ background: 'var(--thamara-accent-500)' }}
          />
          Offline-ready
        </div>
      </section>
    </div>
  );
}

// Action Card Component - Mobile optimized with better touch targets
function ActionCard({
  title,
  icon,
  href,
  gradient
}: {
  title: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl p-4 border flex flex-col items-center justify-center gap-3 transition-all duration-200 active:scale-[0.97] group touch-target"
      style={{
        background: 'var(--thamara-surface)',
        borderColor: 'var(--thamara-border)',
        boxShadow: 'var(--thamara-shadow-sm)',
        minHeight: '120px'
      }}
    >
      {/* Icon container with gradient */}
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} transition-transform duration-200 group-active:scale-95`}
        style={{
          boxShadow: '0 4px 10px -2px rgba(0, 0, 0, 0.2)'
        }}
      >
        <span style={{ color: 'white' }}>
          {icon}
        </span>
      </div>

      {/* Title - centered */}
      <span
        className="text-[13px] font-bold leading-tight text-center"
        style={{ color: 'var(--thamara-text-primary)' }}
      >
        {title}
      </span>
    </Link>
  );
}

// Impact Stat Component - Refined typography
function ImpactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div 
        className="text-2xl font-bold mb-1"
        style={{ color: 'var(--thamara-accent-600)' }}
      >
        {value}
      </div>
      <div 
        className="text-xs leading-tight"
        style={{ color: 'var(--thamara-text-muted)' }}
      >
        {label}
      </div>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: "Farmable" | "Restorable" | "Damaged" }) {
  const colors = {
    Farmable: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
    Restorable: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
    Damaged: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
  };
  
  return (
    <span 
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
      style={{ 
        background: colors[status].bg,
        color: colors[status].text,
        borderColor: colors[status].border
      }}
    >
      {status}
    </span>
  );
}
