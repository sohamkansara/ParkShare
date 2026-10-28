'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ParkingListing } from '@/lib/types';
import { Navigation, Compass, Layers } from 'lucide-react';

interface ParkingMapProps {
  listings: ParkingListing[];
  selectedSpot: ParkingListing | null;
  nearestSpotId?: string | null;
  onSelectSpot: (spot: ParkingListing) => void;
  selectedCity: string;
  userLocation?: { lat: number; lng: number } | null;
  onLocateMe?: () => void;
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
  nearestSpotId,
  onSelectSpot,
  selectedCity,
  userLocation,
  onLocateMe,
}: ParkingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const userMarkerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const initialCoords = userLocation 
          ? [userLocation.lat, userLocation.lng]
          : CITY_COORDINATES[selectedCity] || [12.9352, 77.6245];

        const map = L.map(mapContainerRef.current, {
          center: initialCoords as [number, number],
          zoom: userLocation ? 15 : 14,
          zoomControl: false,
        });

        // OpenStreetMap vector tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://openstreetmap.org">OSM</a>',
        }).addTo(map);

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

  // Update map center when selectedCity changes (if no user location)
  useEffect(() => {
    if (mapInstanceRef.current && !userLocation && CITY_COORDINATES[selectedCity]) {
      mapInstanceRef.current.setView(CITY_COORDINATES[selectedCity], 14, {
        animate: true,
      });
    }
  }, [selectedCity, userLocation]);

  // Center on userLocation when detected
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;

      if (userLocation) {
        // Remove existing user marker if present
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        // Custom pulsing blue dot HTML icon (Ola/Uber style)
        const userIcon = L.divIcon({
          className: 'user-location-wrapper',
          html: `
            <div class="user-location-pin">
              <div class="user-location-pulse"></div>
              <div class="user-location-center"></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([userLocation.lat, userLocation.lng], {
          icon: userIcon,
          zIndexOffset: 2000,
        }).addTo(map);

        userMarkerRef.current = marker;

        // If no spot is selected, pan to user location
        if (!selectedSpot) {
          map.setView([userLocation.lat, userLocation.lng], 15, { animate: true });
        }
      } else {
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
          userMarkerRef.current = null;
        }
      }
    });
  }, [userLocation, mapLoaded, selectedSpot]);

  // Center on selected spot
  useEffect(() => {
    if (mapInstanceRef.current && selectedSpot) {
      mapInstanceRef.current.setView([selectedSpot.lat, selectedSpot.lng], 16, {
        animate: true,
      });
    }
  }, [selectedSpot]);

  // Render & update parking spot price markers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;

      // Clear existing markers
      Object.values(markersRef.current).forEach((marker: any) => marker.remove());
      markersRef.current = {};

      listings.forEach((spot) => {
        const isSelected = selectedSpot?.id === spot.id;
        const isNearest = nearestSpotId === spot.id;
        const isTwoWheelerOnly =
          spot.supportedVehicles?.length === 1 && spot.supportedVehicles[0] === 'TWO_WHEELER';

        // Custom HTML marker
        const markerHtml = `
          <div class="custom-price-pin ${isSelected ? 'selected' : ''} ${isNearest ? 'nearest' : ''} ${isTwoWheelerOnly ? 'two-wheeler' : ''}">
            ${isNearest ? '<span class="nearest-tag">Nearest</span>' : ''}
            <span>₹${spot.hourlyRate}/h</span>
            ${spot.category === 'GATED_SOCIETY' ? '<span title="Society Pass">🛡️</span>' : ''}
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'price-marker-wrapper',
          html: markerHtml,
          iconSize: isNearest ? [95, 28] : [65, 26],
          iconAnchor: isNearest ? [47, 14] : [32, 13],
        });

        const marker = L.marker([spot.lat, spot.lng], {
          icon: customIcon,
          zIndexOffset: isSelected ? 1500 : isNearest ? 1200 : 500,
        }).addTo(map);

        marker.on('click', () => {
          onSelectSpot(spot);
        });

        markersRef.current[spot.id] = marker;
      });
    });
  }, [listings, selectedSpot, nearestSpotId, mapLoaded, onSelectSpot]);

  return (
    <div className="relative w-full h-full bg-slate-100 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating GPS Recenter Button (Ola/Uber style) */}
      <div className="absolute bottom-28 sm:bottom-8 right-4 z-[400] flex flex-col gap-2">
        <button
          onClick={() => {
            if (onLocateMe) {
              onLocateMe();
            } else if (mapInstanceRef.current) {
              if (userLocation) {
                mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
              } else if (CITY_COORDINATES[selectedCity]) {
                mapInstanceRef.current.setView(CITY_COORDINATES[selectedCity], 14, { animate: true });
              }
            }
          }}
          className="bg-white/95 backdrop-blur text-slate-800 p-3 rounded-full shadow-xl hover:bg-white border border-slate-200 transition-all active:scale-95 group"
          title="Locate my position"
        >
          <Navigation className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Map Legend (Subtle top-right) */}
      <div className="absolute top-28 sm:top-24 right-4 z-[300] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[11px] flex items-center gap-3 hidden sm:flex">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block" />
          <span className="text-slate-600 font-medium">Car</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
          <span className="text-slate-600 font-medium">Bike</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-600 font-bold">Nearest</span>
        </div>
      </div>
    </div>
  );
}
