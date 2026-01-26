"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Save, Navigation, Upload, Sparkles, Loader2 } from "lucide-react";
import { usePlotStore } from "@/lib/plotStore";
import { PlotDraft } from "@/lib/plotTypes";
import { ROUTES } from "@/lib/routes";

export default function LogPlotPage() {
  const router = useRouter();
  const { lastPlot, setLastPlot } = usePlotStore();
  const [step, setStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [plot, setPlot] = useState<PlotDraft>(
    lastPlot || {
      locationMethod: "none",
      salinity: "unknown",
      contamination: "unknown",
      debris: "unknown",
      waterAccess: "unknown",
    }
  );

  const updatePlot = (updates: Partial<PlotDraft>) => {
    setPlot((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    setIsSubmitting(true);
    // Simulate AI processing assessment
    setTimeout(() => {
      setLastPlot(plot);
      setIsSubmitting(false);
      router.push(ROUTES.ASSESSMENT);
    }, 2500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextFromPhoto = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      // Auto-populate conditions based on "AI analysis" (static for MVP)
      updatePlot({
        contamination: "none",
        debris: "light",
        waterAccess: "reliable",
        // salinity stays "unknown"
      });
      setIsAnalyzing(false);
      setStep(4);
    }, 3000);
  };

  const requestGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updatePlot({
            locationMethod: "gps",
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          alert("GPS not available. Use manual entry.");
        }
      );
    }
  };

  return (
    <div className="p-5 pb-28 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1
          className="text-3xl font-bold"
          style={{ color: "var(--thamara-text-primary)" }}
        >
          AI Plot Analysis
        </h1>
        <Sparkles 
          size={28} 
          strokeWidth={2}
          style={{ color: "var(--thamara-accent-500)" }}
        />
      </div>

      {/* Loading Overlays */}
      {isAnalyzing && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(4px)" }}
        >
          <div 
            className="rounded-2xl p-8 text-center max-w-sm mx-4"
            style={{ background: "var(--thamara-surface)" }}
          >
            <Loader2 
              size={48} 
              strokeWidth={2.5}
              className="animate-spin mx-auto mb-4"
              style={{ color: "var(--thamara-accent-500)" }}
            />
            <h2 
              className="text-xl font-bold mb-2"
              style={{ color: "var(--thamara-text-primary)" }}
            >
              Analyzing Plot...
            </h2>
            <p 
              className="text-sm"
              style={{ color: "var(--thamara-text-secondary)" }}
            >
              Our AI is examining your photo to assess conditions
            </p>
          </div>
        </div>
      )}

      {isSubmitting && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(4px)" }}
        >
          <div 
            className="rounded-2xl p-8 text-center max-w-sm mx-4"
            style={{ background: "var(--thamara-surface)" }}
          >
            <Loader2 
              size={48} 
              strokeWidth={2.5}
              className="animate-spin mx-auto mb-4"
              style={{ color: "var(--thamara-accent-500)" }}
            />
            <h2 
              className="text-xl font-bold mb-2"
              style={{ color: "var(--thamara-text-primary)" }}
            >
              Generating Assessment...
            </h2>
            <p 
              className="text-sm"
              style={{ color: "var(--thamara-text-secondary)" }}
            >
              AI is calculating farmability score and recommendations
            </p>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((s, idx) => (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 relative z-10"
                style={{
                  background:
                    s === step
                      ? "linear-gradient(135deg, var(--thamara-accent-500) 0%, var(--thamara-accent-600) 100%)"
                      : s < step
                      ? "var(--thamara-accent-500)"
                      : "var(--thamara-surface)",
                  color: s <= step ? "white" : "var(--thamara-text-muted)",
                  border:
                    s > step ? "2px solid var(--thamara-border)" : "none",
                  boxShadow:
                    s === step
                      ? "0 4px 12px -2px rgba(124, 179, 66, 0.4)"
                      : s < step
                      ? "0 2px 8px -2px rgba(124, 179, 66, 0.3)"
                      : "none",
                }}
              >
                {s < step ? "✓" : s}
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{
                  color:
                    s === step
                      ? "var(--thamara-accent-600)"
                      : s < step
                      ? "var(--thamara-primary-600)"
                      : "var(--thamara-text-muted)",
                }}
              >
                {s === 1 ? "Basics" : s === 2 ? "Location" : s === 3 ? "Photo" : "Conditions"}
              </span>
            </div>
            {idx < 3 && (
              <div
                className="w-8 h-0.5 mx-1 mb-4 transition-all duration-300"
                style={{
                  background:
                    s < step
                      ? "var(--thamara-accent-500)"
                      : "var(--thamara-border)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div
        className="rounded-2xl p-6 border mb-6"
        style={{
          background: "var(--thamara-surface)",
          borderColor: "var(--thamara-border)",
        }}
      >
        {step === 1 && (
          <div className="space-y-4">
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: "var(--thamara-text-primary)" }}
            >
              Step 1: Basics
            </h2>
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "var(--thamara-text-primary)" }}
              >
                Plot Name (optional)
              </label>
              <input
                type="text"
                value={plot.name || ""}
                onChange={(e) => updatePlot({ name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border"
                style={{
                  background: "var(--thamara-bg)",
                  borderColor: "var(--thamara-border)",
                  color: "var(--thamara-text-primary)",
                }}
                placeholder="e.g., North Field"
              />
            </div>
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "var(--thamara-text-primary)" }}
              >
                Area (m²) (optional)
              </label>
              <input
                type="number"
                value={plot.areaM2 || ""}
                onChange={(e) =>
                  updatePlot({ areaM2: parseFloat(e.target.value) || undefined })
                }
                className="w-full px-4 py-2.5 rounded-xl border"
                style={{
                  background: "var(--thamara-bg)",
                  borderColor: "var(--thamara-border)",
                  color: "var(--thamara-text-primary)",
                }}
                placeholder="e.g., 5000"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: "var(--thamara-text-primary)" }}
            >
              Step 2: Location
            </h2>
            
            {/* Gaza Strip Map */}
            <div className="rounded-xl overflow-hidden border mb-4 mx-auto w-fit" style={{ borderColor: "var(--thamara-border)" }}>
              <Image
                src="/Gaza-Strip.png"
                alt="Gaza Strip Map"
                width={200}
                height={100}
                className="object-cover"
                priority
              />
            </div>
            
            <button
              onClick={requestGPS}
              className="w-full py-3 rounded-xl text-center font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80 cursor-pointer"
              style={{
                background: "var(--thamara-accent-500)",
                color: "white",
              }}
            >
              <Navigation size={18} strokeWidth={2.5} />
              Use GPS
            </button>
            <div className="text-center text-sm" style={{ color: "var(--thamara-text-muted)" }}>
              or enter manually:
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--thamara-text-primary)" }}
                >
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={plot.lat || ""}
                  onChange={(e) => {
                    updatePlot({
                      lat: parseFloat(e.target.value) || undefined,
                      locationMethod: "manual",
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border"
                  style={{
                    background: "var(--thamara-bg)",
                    borderColor: "var(--thamara-border)",
                    color: "var(--thamara-text-primary)",
                  }}
                  placeholder="31.5"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--thamara-text-primary)" }}
                >
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={plot.lon || ""}
                  onChange={(e) => {
                    updatePlot({
                      lon: parseFloat(e.target.value) || undefined,
                      locationMethod: "manual",
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border"
                  style={{
                    background: "var(--thamara-bg)",
                    borderColor: "var(--thamara-border)",
                    color: "var(--thamara-text-primary)",
                  }}
                  placeholder="34.5"
                />
              </div>
            </div>
            {plot.lat && plot.lon && (
              <div
                className="text-sm p-3 rounded-lg"
                style={{
                  background: "var(--thamara-primary-50)",
                  color: "var(--thamara-text-secondary)",
                }}
              >
                Location: {plot.lat.toFixed(4)}, {plot.lon.toFixed(4)}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: "var(--thamara-text-primary)" }}
            >
              Step 3: Upload Photo
            </h2>
            
            <div 
              className="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer"
              style={{ 
                borderColor: isDragging ? "var(--thamara-accent-600)" : "var(--thamara-accent-500)",
                background: isDragging ? "var(--thamara-primary-50)" : "transparent"
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadedPhoto ? (
                <div className="space-y-4">
                  <div className="rounded-xl overflow-hidden border mx-auto w-fit" style={{ borderColor: "var(--thamara-border)" }}>
                    <Image
                      src={uploadedPhoto}
                      alt="Uploaded plot"
                      width={300}
                      height={200}
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm" style={{ color: "var(--thamara-text-secondary)" }}>
                    Photo uploaded successfully
                  </p>
                  <label
                    htmlFor="photo-upload"
                    className="inline-block px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-80"
                    style={{
                      background: "var(--thamara-surface)",
                      color: "var(--thamara-text-primary)",
                      border: "2px solid var(--thamara-border)",
                    }}
                  >
                    Change Photo
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload 
                    size={48} 
                    strokeWidth={2}
                    className="mx-auto"
                    style={{ color: "var(--thamara-accent-500)" }}
                  />
                  <div>
                    <p 
                      className="text-lg font-semibold mb-2"
                      style={{ color: "var(--thamara-text-primary)" }}
                    >
                      Upload a photo of your plot
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: "var(--thamara-text-secondary)" }}
                    >
                      Our AI will analyze the conditions automatically
                    </p>
                  </div>
                  <label
                    htmlFor="photo-upload"
                    className="inline-block px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all hover:opacity-80"
                    style={{
                      background: "var(--thamara-accent-500)",
                      color: "white",
                    }}
                  >
                    Choose Photo
                  </label>
                </div>
              )}
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-xl font-bold"
                style={{ color: "var(--thamara-text-primary)" }}
              >
                Step 4: Conditions
              </h2>
              {uploadedPhoto && (
                <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--thamara-border)" }}>
                  <Image
                    src={uploadedPhoto}
                    alt="Plot"
                    width={60}
                    height={40}
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            
            <div 
              className="p-3 rounded-lg flex items-center gap-2 mb-4"
              style={{ background: "var(--thamara-primary-50)", color: "var(--thamara-primary-700)" }}
            >
              <Sparkles size={16} strokeWidth={2.5} />
              <span className="text-sm font-semibold">AI has pre-filled conditions based on your photo</span>
            </div>

            <SelectField
              label="Salinity"
              value={plot.salinity}
              onChange={(v) => updatePlot({ salinity: v as PlotDraft["salinity"] })}
              options={["low", "medium", "high", "unknown"]}
            />
            <SelectField
              label="Contamination"
              value={plot.contamination}
              onChange={(v) =>
                updatePlot({ contamination: v as PlotDraft["contamination"] })
              }
              options={["none", "suspected", "confirmed", "unknown"]}
            />
            <SelectField
              label="Debris"
              value={plot.debris}
              onChange={(v) => updatePlot({ debris: v as PlotDraft["debris"] })}
              options={["none", "light", "heavy", "unknown"]}
            />
            <SelectField
              label="Water Access"
              value={plot.waterAccess}
              onChange={(v) =>
                updatePlot({ waterAccess: v as PlotDraft["waterAccess"] })
              }
              options={["none", "limited", "reliable", "unknown"]}
            />
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "var(--thamara-text-primary)" }}
              >
                Notes (optional)
              </label>
              <textarea
                value={plot.notes || ""}
                onChange={(e) => updatePlot({ notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border"
                style={{
                  background: "var(--thamara-bg)",
                  borderColor: "var(--thamara-border)",
                  color: "var(--thamara-text-primary)",
                }}
                rows={4}
                placeholder="Additional observations..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 rounded-xl text-center font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80 cursor-pointer"
            style={{
              background: "var(--thamara-surface)",
              color: "var(--thamara-text-primary)",
              border: "2px solid var(--thamara-border)",
            }}
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
            Back
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={() => {
              if (step === 3) {
                if (!uploadedPhoto) {
                  alert("Please upload a photo first");
                  return;
                }
                handleNextFromPhoto();
              } else {
                setStep(step + 1);
              }
            }}
            className="flex-1 py-3 rounded-xl text-center font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80 cursor-pointer"
            style={{
              background: "var(--thamara-accent-500)",
              color: "white",
            }}
          >
            Next
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl text-center font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-80 cursor-pointer"
            style={{
              background: "var(--thamara-accent-500)",
              color: "white",
            }}
          >
            <Save size={18} strokeWidth={2.5} />
            Save Plot
          </button>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label
        className="block text-sm font-semibold mb-2"
        style={{ color: "var(--thamara-text-primary)" }}
      >
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border"
        style={{
          background: "var(--thamara-bg)",
          borderColor: "var(--thamara-border)",
          color: "var(--thamara-text-primary)",
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
