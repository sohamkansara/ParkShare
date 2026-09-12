'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ParkingListing } from '@/lib/types';
import { MapPin, Navigation } from 'lucide-react';

interface ParkingMapProps {
  listings: ParkingListing[];
  selectedSpot: ParkingListing | null;
  onSelectSpot: (spot: ParkingListing) => void;
  selectedCity: string;
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  Bengaluru: [12.9352, 77.6245],
  Pune: [18.5362, 73.8940],
  Mumbai: [19.0600, 72.8400],
  'Delhi NCR': [28.4908, 77.0912],
};

export default function ParkingMap({
  listings,
  selectedSpot,
  onSelectSpot,
  selectedCity,
}: ParkingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Dynamically import Leaflet only in browser
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const initialCoords = CITY_COORDINATES[selectedCity] || [12.9352, 77.6245];
        
        // Initialize Leaflet map
        const map = L.map(mapContainerRef.current, {
          center: initialCoords,
          zoom: 14,
          zoomControl: false,
        });

        // Add standard OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org">OSM</a>',
        }).addTo(map);

        // Add custom zoom controls at top right
        L.control.zoom({ position: 'topright' }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoaded(true);
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center when selectedCity changes
  useEffect(() => {
    if (mapInstanceRef.current && CITY_COORDINATES[selectedCity]) {
      mapInstanceRef.current.setView(CITY_COORDINATES[selectedCity], 14, {
        animate: true,
      });
    }
  }, [selectedCity]);

  // Center on selected spot if clicked
  useEffect(() => {
    if (mapInstanceRef.current && selectedSpot) {
      mapInstanceRef.current.setView([selectedSpot.lat, selectedSpot.lng], 16, {
        animate: true,
      });
    }
  }, [selectedSpot]);

  // Render & update markers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;

      // Clear existing markers
      Object.values(markersRef.current).forEach((marker: any) => marker.remove());
      markersRef.current = {};

      listings.forEach((spot) => {
        const isSelected = selectedSpot?.id === spot.id;
        const isTwoWheelerOnly = spot.supportedVehicles.length === 1 && spot.supportedVehicles[0] === 'TWO_WHEELER';
        
        // Custom HTML marker
        const markerHtml = `
          <div class="custom-price-pin ${isSelected ? 'selected' : ''} ${isTwoWheelerOnly ? 'two-wheeler' : ''}">
            <span>₹${spot.hourlyRate}/h</span>
            ${spot.category === 'GATED_SOCIETY' ? '<span>🛡️</span>' : ''}
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'price-marker-wrapper',
          html: markerHtml,
          iconSize: [60, 26],
          iconAnchor: [30, 13],
        });

        const marker = L.marker([spot.lat, spot.lng], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          onSelectSpot(spot);
        });

        markersRef.current[spot.id] = marker;
      });
    });
  }, [listings, selectedSpot, mapLoaded, onSelectSpot]);

  return (
    <div className="relative w-full h-full min-h-[400px] bg-slate-100 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating GPS Recenter button */}
      <button
        onClick={() => {
          if (mapInstanceRef.current && CITY_COORDINATES[selectedCity]) {
            mapInstanceRef.current.setView(CITY_COORDINATES[selectedCity], 14, { animate: true });
          }
        }}
        className="absolute bottom-6 right-6 z-[400] bg-white text-slate-800 p-2.5 rounded-full shadow-lg hover:bg-slate-50 border border-slate-200 transition-all flex items-center justify-center group"
        title="Recenter Map"
      >
        <Navigation className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
      </button>

      {/* Map Legend */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block"></span>
          <span className="text-slate-600 font-medium">Car/SUV</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
          <span className="text-slate-600 font-medium">2-Wheeler</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>🛡️</span>
          <span className="text-slate-600 font-medium">Society Pass</span>
        </div>
      </div>
    </div>
  );
}
