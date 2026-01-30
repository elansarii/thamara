"use client";

import Link from 'next/link';
import {
  MapPin, Sprout, Droplet, Users, TrendingUp, MapPinned, Plus, ClipboardCheck,
  CloudRain, Leaf, BarChart3, Sun, Wind, Calendar, ThermometerSun, AlertTriangle
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { usePlotStore } from '@/lib/plotStore';
import { assess } from '@/lib/assessment';

// Mock weather data for the next 10 days
const WEATHER_FORECAST = [
  { day: 'Today', date: 'Jan 30', rain: false, rainChance: 10, temp: 18 },
  { day: 'Fri', date: 'Jan 31', rain: false, rainChance: 15, temp: 19 },
  { day: 'Sat', date: 'Feb 1', rain: true, rainChance: 80, temp: 16 },
  { day: 'Sun', date: 'Feb 2', rain: true, rainChance: 90, temp: 14 },
  { day: 'Mon', date: 'Feb 3', rain: true, rainChance: 70, temp: 15 },
  { day: 'Tue', date: 'Feb 4', rain: false, rainChance: 30, temp: 17 },
  { day: 'Wed', date: 'Feb 5', rain: false, rainChance: 20, temp: 19 },
  { day: 'Thu', date: 'Feb 6', rain: false, rainChance: 15, temp: 20 },
  { day: 'Fri', date: 'Feb 7', rain: true, rainChance: 65, temp: 16 },
  { day: 'Sat', date: 'Feb 8', rain: false, rainChance: 25, temp: 18 },
];

// Seasonal crop recommendations
const SEASONAL_CROPS = [
  { name: 'Lettuce', daysToHarvest: 30, icon: '🥬', reason: 'Cool weather crop' },
  { name: 'Spinach', daysToHarvest: 40, icon: '🥗', reason: 'Thrives in winter' },
  { name: 'Radish', daysToHarvest: 25, icon: '🔴', reason: 'Fast harvest' },
  { name: 'Peas', daysToHarvest: 60, icon: '🫛', reason: 'Nitrogen fixer' },
];

export default function HomePage() {
  const { lastPlot, plots, waterPoints } = usePlotStore();

  // Calculate impact metrics
  const totalPlots = plots.length;
  const totalArea = plots.reduce((sum, plot) => sum + (plot.areaM2 || 0), 0);
  const totalAreaHa = (totalArea / 10000).toFixed(2);

  // Calculate rain days
  const rainDays = WEATHER_FORECAST.filter(d => d.rain);
  const nextRainDay = rainDays[0];
  const daysUntilRain = nextRainDay ? WEATHER_FORECAST.indexOf(nextRainDay) : -1;

  // Calculate farmland status
  const farmlandStats = {
    farmable: 62,
    restorable: 28,
    damaged: 10,
  };

  return (
    <div className="pb-6 space-y-6">
      {/* Insights Widget - Horizontal Scrollable */}
      <section className="pt-4">
        <div className="px-5 mb-3 flex items-center justify-between">
          <h2
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: 'var(--thamara-text-muted)' }}
          >
            Farm Insights
          </h2>
          <span
            className="text-xs"
            style={{ color: 'var(--thamara-text-muted)' }}
          >
            Updated today
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 px-5 pb-2" style={{ width: 'max-content' }}>
            {/* Rain Forecast Card */}
            <InsightCard
              icon={<CloudRain size={20} />}
              iconBg="var(--thamara-info)"
              title="Rain Coming"
              highlight={daysUntilRain === 0 ? 'Today!' : daysUntilRain === 1 ? 'Tomorrow' : `In ${daysUntilRain} days`}
              subtitle={`${rainDays.length} rainy days in next 10 days`}
              action="Perfect time to prepare soil"
              urgent={daysUntilRain <= 2}
            />

            {/* Best Crops Card */}
            <InsightCard
              icon={<Leaf size={20} />}
              iconBg="var(--thamara-accent-500)"
              title="Plant Now"
              highlight={SEASONAL_CROPS[0].name}
              subtitle={`${SEASONAL_CROPS[0].daysToHarvest} days to harvest`}
              action={SEASONAL_CROPS[0].reason}
              crops={SEASONAL_CROPS.slice(0, 3)}
            />

            {/* Farmland Status Card */}
            <InsightCard
              icon={<BarChart3 size={20} />}
              iconBg="var(--thamara-primary-500)"
              title="Land Status"
              highlight={`${farmlandStats.farmable}% Farmable`}
              subtitle="Regional average"
              stats={farmlandStats}
            />

            {/* Temperature Card */}
            <InsightCard
              icon={<ThermometerSun size={20} />}
              iconBg="var(--thamara-warning)"
              title="Temperature"
              highlight={`${WEATHER_FORECAST[0].temp}°C`}
              subtitle="Ideal for planting"
              action="Good growing conditions"
            />

            {/* Planting Window Card */}
            <InsightCard
              icon={<Calendar size={20} />}
              iconBg="var(--thamara-secondary-500)"
              title="Planting Window"
              highlight="3 Days"
              subtitle="Before next rain"
              action="Plant seeds now for rain benefit"
              urgent={daysUntilRain <= 3}
            />

            {/* Wind Alert Card */}
            <InsightCard
              icon={<Wind size={20} />}
              iconBg="var(--thamara-text-muted)"
              title="Wind"
              highlight="Light"
              subtitle="5-10 km/h"
              action="Safe for spraying"
            />
          </div>
        </div>

        {/* Mini Rain Timeline */}
        <div className="px-5 mt-3">
          <div
            className="p-3 rounded-xl border"
            style={{
              background: 'var(--thamara-surface)',
              borderColor: 'var(--thamara-border)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold" style={{ color: 'var(--thamara-text-secondary)' }}>
                10-Day Rain Outlook
              </span>
              <span className="text-xs" style={{ color: 'var(--thamara-info)' }}>
                {rainDays.length} rain days
              </span>
            </div>
            <div className="flex gap-1">
              {WEATHER_FORECAST.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full h-8 rounded flex items-center justify-center"
                    style={{
                      background: day.rain
                        ? `rgba(59, 130, 246, ${day.rainChance / 100})`
                        : 'var(--thamara-bg-secondary)',
                    }}
                  >
                    {day.rain ? (
                      <CloudRain size={12} style={{ color: 'white' }} />
                    ) : (
                      <Sun size={12} style={{ color: 'var(--thamara-warning)' }} />
                    )}
                  </div>
                  <span className="text-[9px]" style={{ color: 'var(--thamara-text-muted)' }}>
                    {day.day.slice(0, 2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Greeting Section */}
      <section className="px-5">
        <h1
          className="text-2xl font-bold leading-tight mb-1 tracking-tight"
          style={{ color: 'var(--thamara-text-primary)' }}
        >
          مرحبا Welcome
        </h1>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--thamara-text-secondary)' }}
        >
          Check your land and get planting guidance
        </p>
      </section>

      {/* Action Tiles Grid - Mobile optimized */}
      <section className="grid grid-cols-2 gap-3 px-5">
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
        className="rounded-2xl p-6 border transition-all hover:shadow-md mx-5"
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
        className="rounded-2xl p-6 border transition-all hover:shadow-md mx-5"
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
      <section className="px-5">
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

// Insight Card Component for the scrollable widget
function InsightCard({
  icon,
  iconBg,
  title,
  highlight,
  subtitle,
  action,
  urgent,
  crops,
  stats,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  highlight: string;
  subtitle: string;
  action?: string;
  urgent?: boolean;
  crops?: { name: string; daysToHarvest: number; icon: string; reason: string }[];
  stats?: { farmable: number; restorable: number; damaged: number };
}) {
  return (
    <div
      className="flex-shrink-0 w-44 p-3 rounded-xl border"
      style={{
        background: 'var(--thamara-surface)',
        borderColor: urgent ? 'var(--thamara-info)' : 'var(--thamara-border)',
        borderWidth: urgent ? '2px' : '1px',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: iconBg, color: 'white' }}
        >
          {icon}
        </div>
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--thamara-text-secondary)' }}
        >
          {title}
        </span>
      </div>

      {/* Highlight */}
      <div
        className="text-lg font-bold leading-tight mb-0.5"
        style={{ color: urgent ? 'var(--thamara-info)' : 'var(--thamara-text-primary)' }}
      >
        {highlight}
      </div>

      {/* Subtitle */}
      <div
        className="text-xs mb-2"
        style={{ color: 'var(--thamara-text-muted)' }}
      >
        {subtitle}
      </div>

      {/* Action or Crops or Stats */}
      {action && !crops && !stats && (
        <div
          className="text-[10px] font-medium px-2 py-1 rounded"
          style={{
            background: urgent ? 'rgba(59, 130, 246, 0.1)' : 'var(--thamara-bg-secondary)',
            color: urgent ? 'var(--thamara-info)' : 'var(--thamara-text-secondary)',
          }}
        >
          {action}
        </div>
      )}

      {crops && (
        <div className="flex gap-1">
          {crops.map((crop, i) => (
            <span
              key={i}
              className="text-sm"
              title={crop.name}
            >
              {crop.icon}
            </span>
          ))}
        </div>
      )}

      {stats && (
        <div className="flex gap-1">
          <div
            className="h-2 rounded-full"
            style={{
              width: `${stats.farmable}%`,
              background: 'var(--thamara-success)',
            }}
          />
          <div
            className="h-2 rounded-full"
            style={{
              width: `${stats.restorable}%`,
              background: 'var(--thamara-warning)',
            }}
          />
          <div
            className="h-2 rounded-full"
            style={{
              width: `${stats.damaged}%`,
              background: 'var(--thamara-error)',
            }}
          />
        </div>
      )}
    </div>
  );
}
