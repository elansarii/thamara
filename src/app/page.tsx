"use client";

import Link from 'next/link';
import {
  MapPin, Sprout, Droplet, Users, TrendingUp, MapPinned, Plus, ClipboardCheck,
  CloudRain, Leaf, BarChart3, Sun, Wind, Calendar, ThermometerSun, AlertTriangle
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { usePlotStore } from '@/lib/plotStore';
import { assess } from '@/lib/assessment';
import { useLanguage } from '@/lib/i18n';

// Day abbreviations for localization
const DAY_ABBR_EN = ['To', 'Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAY_ABBR_AR = ['اليوم', 'الجمعة', 'السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

// Mock weather data for the next 10 days
const WEATHER_FORECAST = [
  { dayKey: 0, rain: false, rainChance: 10, temp: 18 },
  { dayKey: 1, rain: false, rainChance: 15, temp: 19 },
  { dayKey: 2, rain: true, rainChance: 80, temp: 16 },
  { dayKey: 3, rain: true, rainChance: 90, temp: 14 },
  { dayKey: 4, rain: true, rainChance: 70, temp: 15 },
  { dayKey: 5, rain: false, rainChance: 30, temp: 17 },
  { dayKey: 6, rain: false, rainChance: 20, temp: 19 },
  { dayKey: 7, rain: false, rainChance: 15, temp: 20 },
  { dayKey: 8, rain: true, rainChance: 65, temp: 16 },
  { dayKey: 9, rain: false, rainChance: 25, temp: 18 },
];

// Seasonal crop recommendations with translation keys
const SEASONAL_CROPS = [
  { nameKey: 'lettuce', daysToHarvest: 30, icon: '🥬', reasonKey: 'coolWeather' },
  { nameKey: 'spinach', daysToHarvest: 40, icon: '🥗', reasonKey: 'winterCrop' },
  { nameKey: 'radish', daysToHarvest: 25, icon: '🔴', reasonKey: 'fastHarvest' },
  { nameKey: 'peas', daysToHarvest: 60, icon: '🫛', reasonKey: 'nitrogenFixer' },
];

// Crop names for localization
const CROP_NAMES: Record<string, { en: string; ar: string }> = {
  lettuce: { en: 'Lettuce', ar: 'خس' },
  spinach: { en: 'Spinach', ar: 'سبانخ' },
  radish: { en: 'Radish', ar: 'فجل' },
  peas: { en: 'Peas', ar: 'بازلاء' },
};

const CROP_REASONS: Record<string, { en: string; ar: string }> = {
  coolWeather: { en: 'Cool weather crop', ar: 'محصول الطقس البارد' },
  winterCrop: { en: 'Thrives in winter', ar: 'ينمو في الشتاء' },
  fastHarvest: { en: 'Fast harvest', ar: 'حصاد سريع' },
  nitrogenFixer: { en: 'Nitrogen fixer', ar: 'مثبت للنيتروجين' },
};

export default function HomePage() {
  const { lastPlot, plots, waterPoints } = usePlotStore();
  const { t, language, isRTL } = useLanguage();

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

  // Get day abbreviations based on language
  const dayAbbr = language === 'ar' ? DAY_ABBR_AR : DAY_ABBR_EN;

  // Get rain highlight text
  const getRainHighlight = () => {
    if (daysUntilRain === 0) return t.home.todayLabel;
    if (daysUntilRain === 1) return t.home.tomorrow;
    return t.home.inDays.replace('{days}', String(daysUntilRain));
  };

  // Get first crop name
  const firstCrop = SEASONAL_CROPS[0];
  const cropName = CROP_NAMES[firstCrop.nameKey]?.[language] || firstCrop.nameKey;
  const cropReason = CROP_REASONS[firstCrop.reasonKey]?.[language] || firstCrop.reasonKey;

  return (
    <div className="pb-6 space-y-6">
      {/* Insights Widget - Horizontal Scrollable */}
      <section className="pt-4">
        <div className="px-5 mb-3 flex items-center justify-between">
          <h2
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: 'var(--thamara-text-muted)' }}
          >
            {t.home.farmInsights}
          </h2>
          <span
            className="text-xs"
            style={{ color: 'var(--thamara-text-muted)' }}
          >
            {t.home.updatedToday}
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 px-5 pb-2" style={{ width: 'max-content' }}>
            {/* Rain Forecast Card */}
            <InsightCard
              icon={<CloudRain size={20} />}
              iconBg="var(--thamara-info)"
              title={t.home.rainComing}
              highlight={getRainHighlight()}
              subtitle={t.home.rainyDaysInNext.replace('{count}', String(rainDays.length))}
              action={t.home.perfectTimePrepare}
              urgent={daysUntilRain <= 2}
            />

            {/* Best Crops Card */}
            <InsightCard
              icon={<Leaf size={20} />}
              iconBg="var(--thamara-accent-500)"
              title={t.home.plantNow}
              highlight={cropName}
              subtitle={t.home.daysToHarvest.replace('{days}', String(firstCrop.daysToHarvest))}
              action={cropReason}
              crops={SEASONAL_CROPS.slice(0, 3)}
            />

            {/* Farmland Status Card */}
            <InsightCard
              icon={<BarChart3 size={20} />}
              iconBg="var(--thamara-primary-500)"
              title={t.home.landStatus}
              highlight={t.home.farmablePercent.replace('{percent}', String(farmlandStats.farmable))}
              subtitle={t.home.regionalAverage}
              stats={farmlandStats}
            />

            {/* Temperature Card */}
            <InsightCard
              icon={<ThermometerSun size={20} />}
              iconBg="var(--thamara-warning)"
              title={t.home.temperature}
              highlight={`${WEATHER_FORECAST[0].temp}°C`}
              subtitle={t.home.idealForPlanting}
              action={t.home.goodGrowingConditions}
            />

            {/* Planting Window Card */}
            <InsightCard
              icon={<Calendar size={20} />}
              iconBg="var(--thamara-secondary-500)"
              title={t.home.plantingWindow}
              highlight={t.home.daysLabel.replace('{days}', '3')}
              subtitle={t.home.beforeNextRain}
              action={t.home.plantSeedsNow}
              urgent={daysUntilRain <= 3}
            />

            {/* Wind Alert Card */}
            <InsightCard
              icon={<Wind size={20} />}
              iconBg="var(--thamara-text-muted)"
              title={t.home.wind}
              highlight={t.home.light}
              subtitle="5-10 km/h"
              action={t.home.safeForSpraying}
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
                {t.home.tenDayRainOutlook}
              </span>
              <span className="text-xs" style={{ color: 'var(--thamara-info)' }}>
                {t.home.rainDays.replace('{count}', String(rainDays.length))}
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
                    {dayAbbr[i]}
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
          {t.home.welcome}
        </h1>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--thamara-text-secondary)' }}
        >
          {t.home.checkLandGuidance}
        </p>
      </section>

      {/* Action Tiles Grid - Mobile optimized */}
      <section className="grid grid-cols-2 gap-3 px-5">
        <ActionCard
          title={t.home.checkPlantability}
          icon={<MapPin size={26} strokeWidth={2} />}
          href={ROUTES.MAP}
          gradient="from-blue-500 to-blue-600"
        />
        <ActionCard
          title={t.home.getCropPlan}
          icon={<Sprout size={26} strokeWidth={2} />}
          href={ROUTES.CROP_PLAN}
          gradient="from-green-500 to-green-600"
        />
        <ActionCard
          title={t.home.findWater}
          icon={<Droplet size={26} strokeWidth={2} />}
          href={ROUTES.WATER}
          gradient="from-cyan-500 to-cyan-600"
        />
        <ActionCard
          title={t.home.exchangeWork}
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
            {t.home.lastLoggedPlot}
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
                  {(lastPlot.areaM2 / 10000).toFixed(2)} {t.home.hectares}
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
              {t.home.viewOnMap}
            </Link>
          </div>
        ) : (
          <div className="text-center py-4">
            <p
              className="text-sm mb-3"
              style={{ color: 'var(--thamara-text-muted)' }}
            >
              {t.home.noPlotLogged}
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
