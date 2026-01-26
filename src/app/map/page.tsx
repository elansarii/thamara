"use client";

import dynamic from 'next/dynamic';

const MapPlantability = dynamic(
  () => import('@/components/MapPlantability'),
  { ssr: false, loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <p className="text-gray-600 text-sm">Loading map...</p>
      </div>
    </div>
  )}
);

export default function MapPage() {
  return (
    <div className="absolute inset-0">
      <MapPlantability />
    </div>
  );
}
