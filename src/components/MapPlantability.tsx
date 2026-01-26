"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Info, X, Navigation, AlertTriangle } from "lucide-react";
import {
  AgroPackManifest,
  PlantabilityGeoJSON,
  PlantabilityFeature,
} from "@/lib/plantabilityTypes";
import { explainPlantability } from "@/lib/plantabilityExplain";
import { usePlotStore } from "@/lib/plotStore";
import { ROUTES } from "@/lib/routes";

export default function MapPlantability() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const router = useRouter();
  const { setDraftPlot } = usePlotStore();

  const [manifest, setManifest] = useState<AgroPackManifest | null>(null);
  const [showManifest, setShowManifest] = useState(false);
  const [selectedZone, setSelectedZone] = useState<{
    lat: number;
    lon: number;
    feature: PlantabilityFeature | null;
  } | null>(null);
  const [mapError, setMapError] = useState(false);

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
      center: [34.47, 31.42], // Gaza Strip center
      zoom: 11,
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

      {/* Legend */}
      <div className="absolute bottom-24 left-4 bg-white rounded-lg shadow-lg p-4">
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
      {selectedZone && (
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
    </div>
  );
}
