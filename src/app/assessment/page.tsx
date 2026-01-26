"use client";

import { useRouter } from "next/navigation";
import { Home, Edit, CheckCircle2, AlertCircle, XCircle, Sparkles, Lightbulb } from "lucide-react";
import { usePlotStore } from "@/lib/plotStore";
import { assess } from "@/lib/assessment";
import { ROUTES } from "@/lib/routes";

export default function AssessmentPage() {
  const router = useRouter();
  const { lastPlot } = usePlotStore();

  if (!lastPlot) {
    return (
      <div className="p-5 pb-28 max-w-2xl mx-auto">
        <div
          className="rounded-2xl p-8 border text-center"
          style={{
            background: "var(--thamara-surface)",
            borderColor: "var(--thamara-border)",
          }}
        >
          <AlertCircle
            size={48}
            strokeWidth={2}
            style={{ color: "var(--thamara-text-muted)", margin: "0 auto 16px" }}
          />
          <h2
            className="text-xl font-bold mb-3"
            style={{ color: "var(--thamara-text-primary)" }}
          >
            No Plot Logged Yet
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--thamara-text-secondary)" }}
          >
            Log your first plot to see its assessment
          </p>
          <button
            onClick={() => router.push(ROUTES.LOG_PLOT)}
            className="px-6 py-3 rounded-xl text-center font-semibold transition-all hover:opacity-80"
            style={{
              background: "var(--thamara-accent-500)",
              color: "white",
            }}
          >
            Log Plot
          </button>
        </div>
      </div>
    );
  }

  const result = assess(lastPlot);

  const statusConfig = {
    Farmable: {
      icon: CheckCircle2,
      color: "#15803d",
      bg: "#dcfce7",
      border: "#86efac",
      gradient: "from-green-500 to-emerald-600",
      aiNote: "Excellent news! Your plot shows strong potential for immediate farming. The conditions are favorable, and with proper care, you can expect good yields this season.",
      recommendations: [
        "Begin soil preparation within the next week",
        "Consider planting drought-resistant crops initially",
        "Establish a regular irrigation schedule"
      ]
    },
    Restorable: {
      icon: AlertCircle,
      color: "#b45309",
      bg: "#fef3c7",
      border: "#fcd34d",
      gradient: "from-amber-500 to-orange-600",
      aiNote: "Your plot requires some restoration work but has good potential. With targeted interventions, this land can become productive within 2-3 months.",
      recommendations: [
        "Address contamination concerns before planting",
        "Clear debris and prepare soil thoroughly",
        "Consider phased restoration approach"
      ]
    },
    Damaged: {
      icon: XCircle,
      color: "#b91c1c",
      bg: "#fee2e2",
      border: "#fca5a5",
      gradient: "from-red-500 to-rose-600",
      aiNote: "Significant challenges detected. This plot needs substantial restoration work before farming. However, with proper rehabilitation, recovery is possible over time.",
      recommendations: [
        "Seek professional assessment for contamination",
        "Focus on soil remediation first",
        "Consider alternative land use temporarily"
      ]
    },
  };

  const config = statusConfig[result.status];
  const StatusIcon = config.icon;

  return (
    <div className="p-5 pb-28 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--thamara-text-primary)" }}
        >
          AI Assessment
        </h1>
        <Sparkles 
          size={28} 
          strokeWidth={2}
          style={{ color: "var(--thamara-accent-500)" }}
        />
      </div>

      {/* Status Hero Card */}
      <div
        className="rounded-3xl p-6 mb-6 text-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${config.bg} 0%, ${config.bg}f0 100%)`,
          border: `3px solid ${config.border}`,
          boxShadow: `0 8px 24px -4px ${config.color}40`
        }}
      >
        <div className="relative z-10">
          <StatusIcon
            size={56}
            strokeWidth={2}
            style={{ color: config.color, margin: "0 auto 12px" }}
          />
          <h2
            className="text-3xl font-bold mb-2"
            style={{ color: config.color }}
          >
            {result.status}
          </h2>
          <div className="flex items-center justify-center gap-3 mb-3">
            <div
              className="text-4xl font-bold"
              style={{ color: config.color }}
            >
              {result.score}
            </div>
            <div className="text-left">
              <div className="text-sm font-bold" style={{ color: config.color }}>out of</div>
              <div className="text-2xl font-bold" style={{ color: config.color }}>100</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div 
            className="w-full h-2.5 rounded-full mx-auto max-w-md"
            style={{ background: "rgba(255, 255, 255, 0.5)" }}
          >
            <div 
              className="h-full rounded-full transition-all duration-1000"
              style={{ 
                width: `${result.score}%`,
                background: config.color
              }}
            />
          </div>
        </div>
      </div>

      {/* AI Insight Card */}
      <div
        className="rounded-2xl p-6 border mb-6"
        style={{
          background: "linear-gradient(135deg, var(--thamara-primary-50) 0%, var(--thamara-surface) 100%)",
          borderColor: "var(--thamara-accent-400)",
          borderWidth: "2px"
        }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div 
            className="p-2 rounded-xl"
            style={{ background: "var(--thamara-accent-500)" }}
          >
            <Sparkles size={20} strokeWidth={2.5} style={{ color: "white" }} />
          </div>
          <div className="flex-1">
            <h3
              className="text-lg font-bold mb-2"
              style={{ color: "var(--thamara-text-primary)" }}
            >
              AI Insight
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--thamara-text-secondary)" }}
            >
              {config.aiNote}
            </p>
          </div>
        </div>
      </div>

      {/* Plot Details */}
      <div
        className="rounded-2xl p-5 border mb-4"
        style={{
          background: "var(--thamara-surface)",
          borderColor: "var(--thamara-border)",
        }}
      >
        <h3 className="text-sm font-bold mb-3 uppercase tracking-wide" style={{ color: "var(--thamara-text-muted)" }}>
          Plot Details
        </h3>
        <h2
          className="text-xl font-bold mb-2"
          style={{ color: "var(--thamara-text-primary)" }}
        >
          {lastPlot.name || "Unnamed Plot"}
        </h2>
        <div className="flex flex-wrap gap-4 text-sm">
          {lastPlot.areaM2 && (
            <div className="flex items-center gap-2">
              <span style={{ color: "var(--thamara-text-muted)" }}>Area:</span>
              <span className="font-semibold" style={{ color: "var(--thamara-text-primary)" }}>
                {(lastPlot.areaM2 / 10000).toFixed(2)} hectares
              </span>
            </div>
          )}
          {lastPlot.lat && lastPlot.lon && (
            <div className="flex items-center gap-2">
              <span style={{ color: "var(--thamara-text-muted)" }}>Location:</span>
              <span className="font-semibold" style={{ color: "var(--thamara-text-primary)" }}>
                {lastPlot.lat.toFixed(4)}, {lastPlot.lon.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div
        className="rounded-2xl p-6 border mb-6"
        style={{
          background: "var(--thamara-surface)",
          borderColor: "var(--thamara-border)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={20} strokeWidth={2.5} style={{ color: "var(--thamara-accent-500)" }} />
          <h3
            className="text-lg font-bold"
            style={{ color: "var(--thamara-text-primary)" }}
          >
            Next Steps
          </h3>
        </div>
        <ul className="space-y-3">
          {config.recommendations.map((rec, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl transition-all hover:translate-x-1"
              style={{ background: "var(--thamara-bg)" }}
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs"
                style={{ 
                  background: "var(--thamara-accent-500)",
                  color: "white"
                }}
              >
                {idx + 1}
              </div>
              <span className="text-sm" style={{ color: "var(--thamara-text-primary)" }}>
                {rec}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Factors Analyzed */}
      {result.reasons.length > 0 && (
        <div
          className="rounded-2xl p-6 border mb-6"
          style={{
            background: "var(--thamara-surface)",
            borderColor: "var(--thamara-border)",
          }}
        >
          <h3
            className="text-sm font-bold mb-4 uppercase tracking-wide"
            style={{ color: "var(--thamara-text-muted)" }}
          >
            Factors Analyzed
          </h3>
          <ul className="space-y-2">
            {result.reasons.map((reason, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm"
                style={{ color: "var(--thamara-text-secondary)" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                  style={{ background: "var(--thamara-accent-500)" }}
                />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => router.push(ROUTES.LOG_PLOT)}
          className="flex-1 py-3 rounded-xl text-center font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80 cursor-pointer"
          style={{
            background: "var(--thamara-surface)",
            color: "var(--thamara-text-primary)",
            border: "2px solid var(--thamara-border)",
          }}
        >
          <Edit size={18} strokeWidth={2.5} />
          Edit Plot
        </button>
        <button
          onClick={() => router.push(ROUTES.HOME)}
          className="flex-1 py-3 rounded-xl text-center font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80 cursor-pointer"
          style={{
            background: "var(--thamara-accent-500)",
            color: "white",
          }}
        >
          <Home size={18} strokeWidth={2.5} />
          Back to Home
        </button>
      </div>
    </div>
  );
}
