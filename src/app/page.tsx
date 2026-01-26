import Link from 'next/link';
import { MapPin, Sprout, Droplet, Users, TrendingUp, MapPinned, Plus } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export default function HomePage() {
  return (
    <div className="p-5 pb-28 space-y-7">
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

      {/* Action Tiles Grid - Modern card design */}
      <section className="grid grid-cols-2 gap-4">
        <ActionCard
          title="Check Plantability"
          icon={<MapPin size={28} strokeWidth={2} />}
          href={ROUTES.MAP}
          gradient="from-blue-500 to-blue-600"
        />
        <ActionCard
          title="Get Crop Plan"
          icon={<Sprout size={28} strokeWidth={2} />}
          href={ROUTES.CROP_PLAN}
          gradient="from-green-500 to-green-600"
        />
        <ActionCard
          title="Find Water"
          icon={<Droplet size={28} strokeWidth={2} />}
          href={ROUTES.WATER}
          gradient="from-cyan-500 to-cyan-600"
        />
        <ActionCard
          title="Exchange & Work"
          icon={<Users size={28} strokeWidth={2} />}
          href={ROUTES.EXCHANGE}
          gradient="from-orange-500 to-orange-600"
        />
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
          <ImpactStat label="Plots logged" value="0" />
          <ImpactStat label="Area" value="0 ha" />
          <ImpactStat label="Water points" value="0" />
        </div>
      </section>

      {/* Primary CTA - Gradient button */}
      <section>
        <Link
          href={ROUTES.LOG_PLOT}
          className="block w-full py-4 rounded-2xl text-center text-lg font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ 
            background: 'linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)',
            boxShadow: '0 4px 12px -2px rgba(124, 179, 66, 0.3)'
          }}
        >
          <MapPinned size={22} strokeWidth={2.5} />
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

// Action Card Component - Perfectly aligned with centered layout
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
      className="rounded-2xl p-6 border flex flex-col items-center justify-center gap-3.5 aspect-square transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-95 group"
      style={{ 
        background: 'var(--thamara-surface)', 
        borderColor: 'var(--thamara-border)',
        boxShadow: 'var(--thamara-shadow-sm)'
      }}
    >
      {/* Icon container with gradient - centered */}
      <div 
        className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} transition-transform duration-200 group-hover:scale-105 group-hover:rotate-3`}
        style={{
          boxShadow: '0 6px 12px -2px rgba(0, 0, 0, 0.2)'
        }}
      >
        <span style={{ color: 'white' }}>
          {icon}
        </span>
      </div>
      
      {/* Title - centered and properly sized */}
      <span 
        className="text-sm font-bold leading-tight text-center"
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
