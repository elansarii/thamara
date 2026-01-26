"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Info, X, Navigation, AlertTriangle, MapPin, Droplets } from "lucide-react";
import {
  AgroPackManifest,
  PlantabilityGeoJSON,
  PlantabilityFeature,
} from "@/lib/plantabilityTypes";
import { explainPlantability } from "@/lib/plantabilityExplain";
import { usePlotStore } from "@/lib/plotStore";
import { ROUTES } from "@/lib/routes";
import { getAllSeedSources, getSeedSourcesForCrop, getSourceTypeLabel, getDaysSinceConfirmation, type SeedSource } from "@/data/seedSources";
import { getCropById } from "@/data/crops";
import {
  getAllWaterPoints,
  initializeWaterPoints,
  getWaterPointTypeLabel,
  getStatusLabel,
  type WaterPoint,
} from "@/lib/waterPointsDb";

// Helper function to get color based on reliability score
function getReliabilityColor(score: number): string {
  if (score > 70) return "#10b981"; // green
  if (score >= 40) return "#f59e0b"; // yellow/amber
  if (score > 0) return "#ef4444"; // red
  return "#6b7280"; // gray for unknown
}

export default function MapPlantability() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const seedMarkers = useRef<maplibregl.Marker[]>([]);
  const waterMarkers = useRef<maplibregl.Marker[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setDraftPlot } = usePlotStore();

  const [manifest, setManifest] = useState<AgroPackManifest | null>(null);
  const [showManifest, setShowManifest] = useState(false);
  const [selectedZone, setSelectedZone] = useState<{
    lat: number;
    lon: number;
    feature: PlantabilityFeature | null;
  } | null>(null);
  const [selectedSeedSource, setSelectedSeedSource] = useState<SeedSource | null>(null);
  const [selectedWaterPoint, setSelectedWaterPoint] = useState<WaterPoint | null>(null);
  const [mapError, setMapError] = useState(false);
  const [showSeedSources, setShowSeedSources] = useState(false);
  const [showWaterPoints, setShowWaterPoints] = useState(false);
  const [showPlantability, setShowPlantability] = useState(true);
  const [filterCropId, setFilterCropId] = useState<string | null>(null);
  const [waterPoints, setWaterPoints] = useState<WaterPoint[]>([]);

  // Load water points from database
  useEffect(() => {
    const loadWaterPoints = async () => {
      try {
        await initializeWaterPoints();
        const points = await getAllWaterPoints();
        setWaterPoints(points);
      } catch (error) {
        console.error("Failed to load water points:", error);
      }
    };
    loadWaterPoints();
  }, []);

  useEffect(() => {
    // Check for seed layer parameter
    const layer = searchParams?.get('layer');
    if (layer === 'seeds') {
      setShowSeedSources(true);
      setShowPlantability(false);

      // Check for specific crop filter
      const cropId = sessionStorage.getItem('thamara_seed_search_crop');
      if (cropId) {
        setFilterCropId(cropId);
        sessionStorage.removeItem('thamara_seed_search_crop');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [34.35, 31.42], // Gaza Strip center - more to the west
      zoom: 10,
    });

    map.current = mapInstance;

    mapInstance.on("error", (e) => {
      console.warn("Map tile error:", e);
      setMapError(true);
    });

    mapInstance.on("load", async () => {
      // Load manifest
      try {
        const manifestRes = await fetch("/agro-packs/demo-v1/manifest.json");
        const manifestData = await manifestRes.json();
        setManifest(manifestData);

        // Load plantability GeoJSON
        const geoJsonRes = await fetch(
          "/agro-packs/demo-v1/plantability.geojson"
        );
        const geoJsonData: PlantabilityGeoJSON = await geoJsonRes.json();

        // Add source
        mapInstance.addSource("plantability", {
          type: "geojson",
          data: geoJsonData as any,
        });

        // Add fill layer with choropleth styling
        mapInstance.addLayer({
          id: "plantability-fill",
          type: "fill",
          source: "plantability",
          paint: {
            "fill-color": [
              "match",
              ["get", "class"],
              "farmable",
              "#10b981",
              "restorable",
              "#f59e0b",
              "damaged",
              "#ef4444",
              "#9ca3af",
            ],
            "fill-opacity": [
              "*",
              ["number", ["get", "confidence"], 50],
              0.006,
            ], // Scale opacity by confidence
          },
        });

        // Add outline layer
        mapInstance.addLayer({
          id: "plantability-outline",
          type: "line",
          source: "plantability",
          paint: {
            "line-color": [
              "match",
              ["get", "class"],
              "farmable",
              "#059669",
              "restorable",
              "#d97706",
              "damaged",
              "#dc2626",
              "#6b7280",
            ],
            "line-width": [
              "case",
              ["<", ["get", "confidence"], 60],
              2.5,
              1.5,
            ],
            "line-dasharray": [
              "case",
              ["<", ["get", "confidence"], 60],
              ["literal", [3, 3]],
              ["literal", [1, 0]],
            ],
          },
        });

        // Click handler
        mapInstance.on("click", (e) => {
          const features = mapInstance.queryRenderedFeatures(e.point, {
            layers: ["plantability-fill"],
          });

          if (features.length > 0) {
            const feature = features[0];
            setSelectedZone({
              lat: e.lngLat.lat,
              lon: e.lngLat.lng,
              feature: feature as any,
            });
          } else {
            setSelectedZone({
              lat: e.lngLat.lat,
              lon: e.lngLat.lng,
              feature: null,
            });
          }

          // Remove old marker if exists
          if (marker.current) {
            marker.current.remove();
          }

          // Add new marker
          marker.current = new maplibregl.Marker({ color: "#3b82f6" })
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(mapInstance);
        });

        // Hover cursor
        mapInstance.on("mouseenter", "plantability-fill", () => {
          mapInstance.getCanvas().style.cursor = "pointer";
        });
        mapInstance.on("mouseleave", "plantability-fill", () => {
          mapInstance.getCanvas().style.cursor = "";
        });
      } catch (error) {
        console.error("Failed to load agro pack:", error);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Render seed source markers
  useEffect(() => {
    if (!map.current || !showSeedSources) {
      // Remove existing markers
      seedMarkers.current.forEach(m => m.remove());
      seedMarkers.current = [];
      return;
    }

    // Get sources to display
    const sources = filterCropId
      ? getSeedSourcesForCrop(filterCropId)
      : getAllSeedSources();

    // Clear existing markers
    seedMarkers.current.forEach(m => m.remove());
    seedMarkers.current = [];

    // Add markers for each source
    sources.forEach(source => {
      const el = document.createElement('div');
      el.className = 'seed-source-marker';
      el.style.cssText = `
        width: 32px;
        height: 32px;
        background-color: #16a34a;
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      `;

      const markerInstance = new maplibregl.Marker({ element: el })
        .setLngLat([source.lng, source.lat])
        .addTo(map.current!);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedSeedSource(source);
        setSelectedZone(null);
      });

      seedMarkers.current.push(markerInstance);
    });

    // Fit bounds to show all markers
    if (sources.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      sources.forEach(source => bounds.extend([source.lng, source.lat]));
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [showSeedSources, filterCropId]);

  // Render water point markers
  useEffect(() => {
    if (!map.current || !showWaterPoints) {
      // Remove existing markers
      waterMarkers.current.forEach(m => m.remove());
      waterMarkers.current = [];
      return;
    }

    // Clear existing markers
    waterMarkers.current.forEach(m => m.remove());
    waterMarkers.current = [];

    // Add markers for each water point
    waterPoints.forEach(point => {
      const el = document.createElement('div');
      el.className = 'water-point-marker';

      // Color based on reliabilityScore
      const color = getReliabilityColor(point.reliabilityScore);

      el.style.cssText = `
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      // Add droplet icon
      const icon = document.createElement('div');
      icon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      `;
      el.appendChild(icon);

      const markerInstance = new maplibregl.Marker({ element: el })
        .setLngLat([point.coordinates[0], point.coordinates[1]])
        .addTo(map.current!);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedWaterPoint(point);
        setSelectedZone(null);
        setSelectedSeedSource(null);
      });

      waterMarkers.current.push(markerInstance);
    });

    // Fit bounds to show all markers if we have them
    if (waterPoints.length > 0 && !showSeedSources) {
      const bounds = new maplibregl.LngLatBounds();
      waterPoints.forEach(point =>
        bounds.extend([point.coordinates[0], point.coordinates[1]])
      );
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [showWaterPoints, waterPoints, showSeedSources]);

  // Toggle plantability layer visibility
  useEffect(() => {
    if (!map.current || !map.current.getLayer('plantability-fill')) return;
    
    map.current.setLayoutProperty(
      'plantability-fill',
      'visibility',
      showPlantability ? 'visible' : 'none'
    );
    map.current.setLayoutProperty(
      'plantability-outline',
      'visibility',
      showPlantability ? 'visible' : 'none'
    );
  }, [showPlantability]);

  const handleLogPlot = () => {
    if (!selectedZone) return;

    const draftData: any = {
      locationMethod: "manual" as const,
      lat: selectedZone.lat,
      lon: selectedZone.lon,
    };

    if (selectedZone.feature) {
      const explained = explainPlantability(selectedZone.feature.properties);
      Object.assign(draftData, explained.suggestedConditions);
      // Add name and area from the feature
      draftData.name = selectedZone.feature.properties.name;
      draftData.areaM2 = selectedZone.feature.properties.areaM2;
    }

    setDraftPlot(draftData);
    router.push(ROUTES.LOG_PLOT);
  };

  const explained = selectedZone?.feature
    ? explainPlantability(selectedZone.feature.properties)
    : null;

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ minHeight: '100%' }} />

      {/* Map Error Banner */}
      {mapError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Map tiles offline; overlay data still available
        </div>
      )}

      {/* Layer Info Button */}
      <button
        onClick={() => setShowManifest(true)}
        className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition"
      >
        <Info className="w-5 h-5 text-gray-700" />
      </button>

      {/* Layer Toggles */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 space-y-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showPlantability}
            onChange={e => setShowPlantability(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-700">Plantability</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showSeedSources}
            onChange={e => {
              setShowSeedSources(e.target.checked);
              if (!e.target.checked) {
                setFilterCropId(null);
                setSelectedSeedSource(null);
              }
            }}
            className="rounded"
          />
          <span className="text-gray-700">Seed Sources</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showWaterPoints}
            onChange={e => {
              setShowWaterPoints(e.target.checked);
              if (!e.target.checked) {
                setSelectedWaterPoint(null);
              }
            }}
            className="rounded"
          />
          <span className="text-gray-700">Water Points</span>
        </label>
        {showSeedSources && filterCropId && (
          <div className="text-xs text-gray-600 border-t pt-2">
            Showing: {getCropById(filterCropId)?.commonName}
            <button
              onClick={() => setFilterCropId(null)}
              className="text-blue-600 ml-2 hover:text-blue-800"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      {showPlantability && (
        <div className="absolute bottom-24 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <h3 className="font-semibold text-sm mb-3 text-gray-900">
            Plantability
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-gray-700">Farmable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded" />
              <span className="text-gray-700">Restorable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-gray-700">Damaged</span>
            </div>
            <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
              Opacity = confidence
              <br />
              Dashed = needs check
            </div>
          </div>
        </div>
      )}

      {showSeedSources && !showWaterPoints && (
        <div className="absolute bottom-24 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <h3 className="font-semibold text-sm mb-3 text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-green-600" />
            Seed Sources
          </h3>
          <div className="text-sm text-gray-700">
            {filterCropId ? (
              <p>
                {getSeedSourcesForCrop(filterCropId).length} sources for{' '}
                {getCropById(filterCropId)?.commonName}
              </p>
            ) : (
              <p>{getAllSeedSources().length} total sources</p>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div
              className="w-4 h-4 bg-green-600 border-2 border-white rounded-full"
              style={{ borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)' }}
            />
            <span className="text-xs text-gray-600">Seed source pin</span>
          </div>
        </div>
      )}

      {showWaterPoints && (
        <div className="absolute bottom-24 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <h3 className="font-semibold text-sm mb-3 text-gray-900 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-600" />
            Water Points
          </h3>
          <div className="text-sm text-gray-700 mb-3">
            <p>{waterPoints.length} sources found</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full" />
              <span className="text-gray-700">&gt;70% - High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded-full" />
              <span className="text-gray-700">40-70% - Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full" />
              <span className="text-gray-700">&lt;40% - Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded-full" />
              <span className="text-gray-700">Unknown</span>
            </div>
          </div>
        </div>
      )}

      {/* Manifest Modal */}
      {showManifest && manifest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Layer Information
              </h2>
              <button
                onClick={() => setShowManifest(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Pack ID:</span>
                <p className="text-gray-600">{manifest.pack_id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Source:</span>
                <p className="text-gray-600">{manifest.source_name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Description:</span>
                <p className="text-gray-600">{manifest.source_desc}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Updated:</span>
                <p className="text-gray-600">{manifest.updated_at}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Version:</span>
                <p className="text-gray-600">{manifest.version}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Notes:</span>
                <p className="text-gray-600">{manifest.notes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selection Bottom Sheet */}
      {selectedZone && !selectedSeedSource && (
        <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl p-6 pb-8 z-40 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedZone.feature ? "Zone Analysis" : "Location Selected"}
            </h2>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {selectedZone.feature ? (
            <>
              {/* Status */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-2xl font-bold ${explained?.statusColor}`}
                  >
                    {explained?.statusLabel}
                  </span>
                  <span className="text-lg text-gray-600">
                    {selectedZone.feature.properties.confidence}% confidence
                  </span>
                </div>
                {explained?.needsCheck && (
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Needs on-site check
                  </div>
                )}
              </div>

              {/* Explainability */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                  Why?
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {explained?.whyText}
                </p>
              </div>

              {/* Provenance */}
              <div className="mb-6 pb-4 border-b">
                <p className="text-xs text-gray-500">
                  <strong>Source:</strong>{" "}
                  {selectedZone.feature.properties.baseline_source} • Updated:{" "}
                  {selectedZone.feature.properties.baseline_date}
                </p>
                {selectedZone.feature.properties.notes && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedZone.feature.properties.notes}
                  </p>
                )}
              </div>

              {/* Location */}
              <div className="mb-4 text-xs text-gray-500">
                <Navigation className="w-3 h-3 inline mr-1" />
                {selectedZone.lat.toFixed(6)}, {selectedZone.lon.toFixed(6)}
              </div>

              {/* CTA */}
              <button
                onClick={handleLogPlot}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Log plot here
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-4 text-sm">
                No overlay data here (demo pack coverage is limited).
              </p>
              <div className="mb-4 text-xs text-gray-500">
                <Navigation className="w-3 h-3 inline mr-1" />
                {selectedZone.lat.toFixed(6)}, {selectedZone.lon.toFixed(6)}
              </div>
              <button
                onClick={handleLogPlot}
                className="w-full bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition"
              >
                Log plot anyway
              </button>
            </>
          )}
        </div>
      )}

      {/* Seed Source Info Panel */}
      {selectedSeedSource && (
        <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl p-6 pb-8 z-40 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Seed Source
            </h2>
            <button
              onClick={() => setSelectedSeedSource(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Source Name and Type */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {selectedSeedSource.name}
            </h3>
            <span className="inline-block text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
              {getSourceTypeLabel(selectedSeedSource.type)}
            </span>
          </div>

          {/* Reliability */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Reliability</span>
              <span className="font-semibold text-gray-900">
                {selectedSeedSource.reliabilityScore}/100
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  selectedSeedSource.reliabilityScore >= 80
                    ? 'bg-green-500'
                    : selectedSeedSource.reliabilityScore >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${selectedSeedSource.reliabilityScore}%` }}
              />
            </div>
          </div>

          {/* Last Confirmed */}
          <div className="mb-4 text-sm">
            <span className="text-gray-600">Last confirmed:</span>
            <span className="ml-2 font-medium text-gray-900">
              {selectedSeedSource.lastConfirmed}
            </span>
            <span className="ml-2 text-gray-500">
              ({getDaysSinceConfirmation(selectedSeedSource.lastConfirmed)} days ago)
            </span>
          </div>

          {/* Available Crops */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Available Crops ({selectedSeedSource.availableCrops.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedSeedSource.availableCrops.map(cropId => {
                const crop = getCropById(cropId);
                return crop ? (
                  <span
                    key={cropId}
                    className={`text-xs px-2 py-1 rounded ${
                      filterCropId === cropId
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {crop.commonName}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Notes */}
          {selectedSeedSource.notes && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">{selectedSeedSource.notes}</p>
            </div>
          )}

          {/* Location */}
          <div className="mb-4 text-xs text-gray-500">
            <Navigation className="w-3 h-3 inline mr-1" />
            {selectedSeedSource.lat.toFixed(6)}, {selectedSeedSource.lng.toFixed(6)}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {filterCropId && selectedSeedSource.availableCrops.includes(filterCropId) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-900">
                ✓ This source has {getCropById(filterCropId)?.commonName} seeds
              </div>
            )}
            <button
              onClick={() => {
                // In a real app, this could open directions or copy coordinates
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(
                    `${selectedSeedSource.lat},${selectedSeedSource.lng}`
                  );
                  alert('Location copied to clipboard!');
                }
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Copy Location
            </button>
          </div>
        </div>
      )}

      {/* Water Point Info Panel */}
      {selectedWaterPoint && (
        <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl p-6 pb-8 z-40 max-h-[70vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              Water Point
            </h2>
            <button
              onClick={() => setSelectedWaterPoint(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Name and Type */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {selectedWaterPoint.name}
            </h3>
            <span className="inline-block text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {getWaterPointTypeLabel(selectedWaterPoint.type)}
            </span>
          </div>

          {/* Status */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span
                className={`text-sm font-semibold px-2 py-1 rounded ${
                  selectedWaterPoint.status === "available"
                    ? "bg-green-100 text-green-800"
                    : selectedWaterPoint.status === "limited"
                    ? "bg-amber-100 text-amber-800"
                    : selectedWaterPoint.status === "unavailable"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {getStatusLabel(selectedWaterPoint.status)}
              </span>
            </div>
          </div>

          {/* Reliability */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Reliability</span>
              <span className="font-semibold text-gray-900">
                {selectedWaterPoint.reliabilityScore}/100
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  selectedWaterPoint.reliabilityScore >= 70
                    ? "bg-green-500"
                    : selectedWaterPoint.reliabilityScore >= 40
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${selectedWaterPoint.reliabilityScore}%` }}
              />
            </div>
          </div>

          {/* Last Confirmed */}
          <div className="mb-4 text-sm">
            <span className="text-gray-600">Last confirmed:</span>
            <span className="ml-2 font-medium text-gray-900">
              {selectedWaterPoint.lastConfirmed.toLocaleDateString()}
            </span>
          </div>

          {/* Location */}
          <div className="mb-4 text-xs text-gray-500">
            <Navigation className="w-3 h-3 inline mr-1" />
            {selectedWaterPoint.coordinates[1].toFixed(6)},{" "}
            {selectedWaterPoint.coordinates[0].toFixed(6)}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(
                    `${selectedWaterPoint.coordinates[1]},${selectedWaterPoint.coordinates[0]}`
                  );
                  alert("Location copied to clipboard!");
                }
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Copy Location
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
