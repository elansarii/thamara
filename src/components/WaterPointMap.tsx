"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Droplets, X, Navigation, AlertTriangle, MapIcon, List, Locate } from "lucide-react";
import {
  getAllWaterPoints,
  initializeWaterPoints,
  getWaterPointTypeLabel,
  getStatusLabel,
  getDaysSinceConfirmation,
  type WaterPoint,
} from "@/lib/waterPointsDb";

type ViewMode = 'map' | 'list';

// Helper function to get color based on reliability score
function getReliabilityColor(score: number): string {
  if (score > 70) return "#10b981"; // green
  if (score >= 40) return "#f59e0b"; // yellow/amber
  if (score > 0) return "#ef4444"; // red
  return "#6b7280"; // gray for unknown
}

export default function WaterPointMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const waterMarkers = useRef<maplibregl.Marker[]>([]);
  const userMarker = useRef<maplibregl.Marker | null>(null);

  const [waterPoints, setWaterPoints] = useState<WaterPoint[]>([]);
  const [selectedWaterPoint, setSelectedWaterPoint] = useState<WaterPoint | null>(null);
  const [mapError, setMapError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Load water points from database
  useEffect(() => {
    const loadWaterPoints = async () => {
      try {
        await initializeWaterPoints();
        const points = await getAllWaterPoints();
        setWaterPoints(points);
        setLastUpdated(new Date());
        setLoading(false);
      } catch (error) {
        console.error("Failed to load water points:", error);
        setLoading(false);
      }
    };

    loadWaterPoints();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

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
      center: [34.45, 31.5], // Gaza center
      zoom: 10,
    });

    map.current = mapInstance;

    mapInstance.on("error", (e) => {
      console.warn("Map tile error:", e);
      setMapError(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle locate me
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.longitude,
          position.coords.latitude,
        ];
        setUserLocation(coords);

        if (map.current) {
          // Remove old user marker if exists
          if (userMarker.current) {
            userMarker.current.remove();
          }

          // Add user location marker
          const el = document.createElement("div");
          el.style.cssText = `
            width: 20px;
            height: 20px;
            background-color: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          `;

          userMarker.current = new maplibregl.Marker({ element: el })
            .setLngLat(coords)
            .addTo(map.current);

          // Fly to user location
          map.current.flyTo({ center: coords, zoom: 12 });
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location");
      }
    );
  };

  // Render water point markers
  useEffect(() => {
    if (!map.current || waterPoints.length === 0) return;

    // Clear existing markers
    waterMarkers.current.forEach((m) => m.remove());
    waterMarkers.current = [];

    // Add markers for each water point
    waterPoints.forEach((point) => {
      const el = document.createElement("div");
      el.className = "water-point-marker";

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
      const icon = document.createElement("div");
      icon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      `;
      el.appendChild(icon);

      const markerInstance = new maplibregl.Marker({ element: el })
        .setLngLat([point.coordinates[0], point.coordinates[1]])
        .addTo(map.current!);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedWaterPoint(point);
      });

      waterMarkers.current.push(markerInstance);
    });

    // Fit bounds to show all markers if we have them
    if (waterPoints.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      waterPoints.forEach((point) =>
        bounds.extend([point.coordinates[0], point.coordinates[1]])
      );
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [waterPoints]);

  return (
    <div className="relative w-full h-full" style={{ background: 'var(--thamara-bg)' }}>
      {/* Offline Indicator + View Toggle */}
      <div
        className="absolute top-0 inset-x-0 z-20 px-4 py-3 border-b shadow-sm"
        style={{
          background: 'var(--thamara-surface)',
          borderColor: 'var(--thamara-border)'
        }}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Offline Badge with Last Updated */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold whitespace-nowrap"
              style={{
                background: 'var(--thamara-primary-50)',
                color: 'var(--thamara-primary-700)',
                borderRadius: 'var(--thamara-radius-full)',
                border: '1px solid var(--thamara-primary-200)',
              }}
            >
              <Droplets size={11} strokeWidth={2.5} />
              <span>Offline</span>
            </div>
            {lastUpdated && (
              <span className="text-xs" style={{ color: 'var(--thamara-text-muted)' }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* View Toggle */}
          <div
            className="flex gap-1 p-0.5"
            style={{
              background: 'var(--thamara-bg-secondary)',
              borderRadius: 'var(--thamara-radius-md)'
            }}
          >
            <button
              onClick={() => setViewMode('map')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-all duration-200"
              style={{
                background: viewMode === 'map' ? 'var(--thamara-surface)' : 'transparent',
                color: viewMode === 'map' ? 'var(--thamara-primary-700)' : 'var(--thamara-text-secondary)',
                borderRadius: 'var(--thamara-radius-sm)',
                boxShadow: viewMode === 'map' ? 'var(--thamara-shadow-sm)' : 'none',
              }}
            >
              <MapIcon size={14} strokeWidth={2.5} />
              <span>Map</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-all duration-200"
              style={{
                background: viewMode === 'list' ? 'var(--thamara-surface)' : 'transparent',
                color: viewMode === 'list' ? 'var(--thamara-primary-700)' : 'var(--thamara-text-secondary)',
                borderRadius: 'var(--thamara-radius-sm)',
                boxShadow: viewMode === 'list' ? 'var(--thamara-shadow-sm)' : 'none',
              }}
            >
              <List size={14} strokeWidth={2.5} />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <>
          {/* Map Container */}
          <div
            ref={mapContainer}
            className="absolute inset-0 w-full h-full"
            style={{ minHeight: "100%", paddingTop: '60px' }}
          />

          {/* Map Error Banner */}
          {mapError && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 z-10">
              <AlertTriangle className="w-4 h-4" />
              Map tiles offline; water point data still available
            </div>
          )}

          {/* Locate Me Button */}
          <button
            onClick={handleLocateMe}
            className="absolute top-20 right-4 bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition z-10"
            title="Find my location"
          >
            <Locate className="w-5 h-5 text-blue-600" />
          </button>

          {/* Legend */}
          <div className="absolute bottom-24 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
            <h3 className="font-semibold text-sm mb-3 text-gray-900">Reliability</h3>
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
        </>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="absolute inset-0 overflow-y-auto" style={{ paddingTop: '60px', paddingBottom: '24px' }}>
          <div className="px-4 py-4 space-y-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-sm text-gray-600">Loading water points...</p>
              </div>
            ) : waterPoints.length === 0 ? (
              <div className="text-center py-12">
                <Droplets size={40} className="mx-auto mb-3 text-gray-400" />
                <p className="text-sm font-semibold text-gray-900">No water points found</p>
              </div>
            ) : (
              waterPoints.map((point) => (
                <div
                  key={point.id}
                  onClick={() => {
                    setSelectedWaterPoint(point);
                    setViewMode('map');
                    if (map.current) {
                      map.current.flyTo({
                        center: [point.coordinates[0], point.coordinates[1]],
                        zoom: 14,
                      });
                    }
                  }}
                  className="p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all"
                  style={{
                    background: 'var(--thamara-surface)',
                    borderColor: 'var(--thamara-border)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Color indicator */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: getReliabilityColor(point.reliabilityScore) }}
                    >
                      <Droplets className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold mb-1" style={{ color: 'var(--thamara-text-primary)' }}>
                        {point.name}
                      </h3>

                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: 'var(--thamara-primary-100)',
                            color: 'var(--thamara-primary-700)'
                          }}
                        >
                          {getWaterPointTypeLabel(point.type)}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${
                            point.status === "available"
                              ? "bg-green-100 text-green-800"
                              : point.status === "limited"
                              ? "bg-amber-100 text-amber-800"
                              : point.status === "unavailable"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {getStatusLabel(point.status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--thamara-text-secondary)' }}>
                        <span className="font-semibold">
                          Reliability: {point.reliabilityScore}%
                        </span>
                        <span>•</span>
                        <span>
                          {getDaysSinceConfirmation(point.lastConfirmed)}d ago
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
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
                  selectedWaterPoint.reliabilityScore >= 80
                    ? "bg-green-500"
                    : selectedWaterPoint.reliabilityScore >= 60
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
            <span className="ml-2 text-gray-500">
              ({getDaysSinceConfirmation(selectedWaterPoint.lastConfirmed)} days
              ago)
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
