'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import ParkingMap from '@/components/map/ParkingMap';
import ParkingBottomCard from '@/components/discovery/ParkingBottomCard';
import SpotDetailsModal from '@/components/discovery/SpotDetailsModal';
import BookingModal from '@/components/booking/BookingModal';
import VehicleVaultModal from '@/components/profile/VehicleVaultModal';
import { ParkingListing, VehicleType, ListingCategory } from '@/lib/types';
import { getStoredListings } from '@/lib/storage';
import { calculateDistanceKm } from '@/lib/geo';
import { 
  Search, Star, ShieldCheck, 
  MapPin, Car, Zap, Navigation, List, Map as MapIcon, 
  RefreshCw, SlidersHorizontal, ChevronRight, X, AlertCircle, Footprints
} from 'lucide-react';

// Landmark presets for quick destination selection
const QUICK_LANDMARKS: Record<string, { label: string; lat: number; lng: number }[]> = {
  Bengaluru: [
    { label: 'Koramangala Sony World', lat: 12.9352, lng: 77.6245 },
    { label: 'Indiranagar 100ft Rd', lat: 12.9719, lng: 77.6412 },
    { label: 'HSR Layout Sector 1', lat: 12.9121, lng: 77.6446 },
  ],
  Pune: [
    { label: 'Koregaon Park German Bakery', lat: 18.5362, lng: 73.8940 },
    { label: 'FC Road Goodluck Cafe', lat: 18.5284, lng: 73.8415 },
  ],
  Mumbai: [
    { label: 'Bandra Hill Road', lat: 19.0544, lng: 72.8267 },
    { label: 'BKC G Block', lat: 19.0657, lng: 72.8683 },
  ],
  'Delhi NCR': [
    { label: 'DLF Cyber City Gurgaon', lat: 28.4908, lng: 77.0912 },
  ],
};

export default function HomePage() {
  const [listings, setListings] = useState<ParkingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<'Bengaluru' | 'Pune' | 'Mumbai' | 'Delhi NCR'>('Bengaluru');
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection states
  const [selectedSpot, setSelectedSpot] = useState<ParkingListing | null>(null);
  const [selectedDetailsSpot, setSelectedDetailsSpot] = useState<ParkingListing | null>(null);
  const [bookingSpot, setBookingSpot] = useState<ParkingListing | null>(null);
  const [isVehiclesOpen, setIsVehiclesOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'MAP' | 'LIST'>('MAP');

  // Geolocation states (Ola/Uber style)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'IDLE' | 'LOCATING' | 'GRANTED' | 'DENIED'>('IDLE');
  const [locationError, setLocationError] = useState<string | null>(null);

  // 1. Fetch Listings from API with fallback
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCity) params.set('city', selectedCity);
      if (selectedVehicleType !== 'ALL') params.set('vehicleType', selectedVehicleType);
      if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (userLocation) {
        params.set('lat', String(userLocation.lat));
        params.set('lng', String(userLocation.lng));
        params.set('radiusKm', '15');
      }

      const res = await fetch(`/api/listings?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setListings(json.data);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('API fetch failed, falling back to local store:', e);
    }

    setListings(getStoredListings());
    setLoading(false);
  }, [selectedCity, selectedVehicleType, selectedCategory, searchQuery, userLocation]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // 2. Step 1: Detect Location on Load (Ola/Uber style)
  const requestUserLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationPermission('DENIED');
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLocationPermission('LOCATING');
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setLocationPermission('GRANTED');
      },
      (err) => {
        console.warn('Geolocation denied or timed out:', err);
        setLocationPermission('DENIED');
        // Gentle fallback: simulate current position in city center for testing
        setLocationError('Location access was denied. You can still search or tap quick landmarks.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  useEffect(() => {
    requestUserLocation();
  }, [requestUserLocation]);

  // 3. Calculate distance and sort by proximity
  const enrichedListings = useMemo(() => {
    return listings.map((spot) => {
      let distanceKm = (spot as any).distanceKm;
      if (distanceKm === undefined && userLocation) {
        distanceKm = calculateDistanceKm(userLocation.lat, userLocation.lng, spot.lat, spot.lng);
      }
      return {
        ...spot,
        distanceKm,
      };
    }).sort((a, b) => {
      if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return (a.distanceKm || 0) - (b.distanceKm || 0);
      }
      return 0;
    });
  }, [listings, userLocation]);

  // Nearest available spot
  const nearestSpot = enrichedListings.length > 0 ? enrichedListings[0] : null;

  // Auto-select nearest spot initially if nothing is selected
  useEffect(() => {
    if (!selectedSpot && nearestSpot) {
      setSelectedSpot(nearestSpot);
    }
  }, [nearestSpot, selectedSpot]);

  // Selected spot index in the sorted list
  const activeSpot = selectedSpot || nearestSpot;
  const activeIndex = activeSpot ? enrichedListings.findIndex((s) => s.id === activeSpot.id) + 1 : 1;

  // Cycle through nearby spots
  const handleNextSpot = () => {
    if (enrichedListings.length === 0) return;
    const currentIdx = enrichedListings.findIndex((s) => s.id === activeSpot?.id);
    const nextIdx = (currentIdx + 1) % enrichedListings.length;
    setSelectedSpot(enrichedListings[nextIdx]);
  };

  const handlePrevSpot = () => {
    if (enrichedListings.length === 0) return;
    const currentIdx = enrichedListings.findIndex((s) => s.id === activeSpot?.id);
    const prevIdx = (currentIdx - 1 + enrichedListings.length) % enrichedListings.length;
    setSelectedSpot(enrichedListings[prevIdx]);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col bg-slate-900 font-sans select-none">
      {/* Global Navigation Header (Desktop / Tablet) */}
      <Header
        selectedCity={selectedCity}
        onCityChange={(city) => {
          setSelectedCity(city);
          setSelectedSpot(null);
        }}
        onOpenVehicles={() => setIsVehiclesOpen(true)}
      />

      {/* Floating Top Search & Filter Bar (Ola/Uber style) */}
      <div className="absolute top-20 sm:top-20 left-4 right-4 z-[400] max-w-xl mx-auto flex flex-col gap-2 pointer-events-none">
        {/* Search Bar Container */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={`Where do you need parking in ${selectedCity}?`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* View Switcher: Map vs List */}
          <button
            onClick={() => setViewMode(viewMode === 'MAP' ? 'LIST' : 'MAP')}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
            title="Toggle between Map and List view"
          >
            {viewMode === 'MAP' ? <List className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Filter Pills Row */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {/* Vehicle Filters */}
          <button
            onClick={() => setSelectedVehicleType('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 backdrop-blur-md shadow-sm border ${
              selectedVehicleType === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white'
            }`}
          >
            All
          </button>

          <button
            onClick={() => setSelectedVehicleType('TWO_WHEELER')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 backdrop-blur-md shadow-sm border ${
              selectedVehicleType === 'TWO_WHEELER'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white'
            }`}
          >
            <span>🏍️</span>
            <span>2-Wheeler</span>
          </button>

          <button
            onClick={() => setSelectedVehicleType('HATCHBACK')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 backdrop-blur-md shadow-sm border ${
              selectedVehicleType === 'HATCHBACK'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white'
            }`}
          >
            <span>🚗</span>
            <span>Car</span>
          </button>

          <button
            onClick={() => setSelectedVehicleType('SUV')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1 backdrop-blur-md shadow-sm border ${
              selectedVehicleType === 'SUV'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-white'
            }`}
          >
            <span>🚙</span>
            <span>SUV</span>
          </button>

          {/* Category Dropdown Pill */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-white/95 backdrop-blur-md text-slate-700 text-xs font-bold py-1.5 px-3 rounded-full border border-slate-200 shadow-sm focus:outline-none shrink-0 cursor-pointer"
          >
            <option value="ALL">All Spaces</option>
            <option value="RESIDENTIAL_DRIVEWAY">🏡 Private Driveway</option>
            <option value="GATED_SOCIETY">🏢 Society Pass</option>
            <option value="COMMERCIAL_BASEMENT">🏬 Basement Bay</option>
          </select>
        </div>

        {/* Quick Landmark Chips (If no search query) */}
        {!searchQuery && QUICK_LANDMARKS[selectedCity] && (
          <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar hidden sm:flex">
            {QUICK_LANDMARKS[selectedCity].map((lm) => (
              <button
                key={lm.label}
                onClick={() => {
                  setUserLocation({ lat: lm.lat, lng: lm.lng });
                  setSelectedSpot(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur text-white text-[11px] font-semibold hover:bg-slate-900 transition-colors shadow shrink-0 flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 text-emerald-400" />
                <span>{lm.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Location Notice (Dismissible) */}
        {locationError && (
          <div className="pointer-events-auto p-2 bg-amber-500/95 backdrop-blur text-slate-950 text-xs font-semibold rounded-xl shadow-lg flex items-center justify-between gap-2 border border-amber-300">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{locationError}</span>
            </div>
            <button
              onClick={() => setLocationError(null)}
              className="text-slate-950 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Main Experience Body (Full-bleed Map or List Drawer) */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* The Primary Leaflet Map Screen */}
        <div className="w-full h-full">
          <ParkingMap
            listings={enrichedListings}
            selectedSpot={activeSpot}
            nearestSpotId={nearestSpot?.id}
            onSelectSpot={(spot) => setSelectedSpot(spot)}
            selectedCity={selectedCity}
            userLocation={userLocation}
            onLocateMe={requestUserLocation}
          />
        </div>

        {/* Floating Bottom Parking Preview Card (Ola/Uber style) */}
        {viewMode === 'MAP' && activeSpot && (
          <div className="absolute bottom-20 sm:bottom-6 left-4 right-4 z-[400] max-w-lg mx-auto pointer-events-auto">
            <ParkingBottomCard
              spot={activeSpot}
              isNearest={activeSpot.id === nearestSpot?.id}
              onViewDetails={(spot) => setSelectedDetailsSpot(spot)}
              onBookNow={(spot) => setBookingSpot(spot)}
              onNextSpot={handleNextSpot}
              onPrevSpot={handlePrevSpot}
              totalNearbyCount={enrichedListings.length}
              currentIndex={activeIndex}
            />
          </div>
        )}

        {/* Full List View Drawer (When toggled to List) */}
        {viewMode === 'LIST' && (
          <div className="absolute inset-0 z-[400] bg-slate-50 overflow-y-auto p-4 pt-44 pb-28 max-w-2xl mx-auto shadow-2xl">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Nearby Parking ({enrichedListings.length})
              </h2>
              <button
                onClick={() => setViewMode('MAP')}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200"
              >
                Back to Map
              </button>
            </div>

            <div className="space-y-3">
              {enrichedListings.map((spot, i) => (
                <div
                  key={spot.id}
                  onClick={() => {
                    setSelectedSpot(spot);
                    setViewMode('MAP');
                  }}
                  className={`p-4 rounded-3xl bg-white border cursor-pointer transition-all ${
                    spot.id === activeSpot?.id
                      ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex gap-3.5 items-center">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                      {spot.images && spot.images[0] ? (
                        <img src={spot.images[0]} alt={spot.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Car className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute top-1.5 left-1.5 bg-slate-900/90 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                        ₹{spot.hourlyRate}/h
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {spot.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {spot.rating}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 truncate">{spot.title}</h3>
                      <p className="text-xs text-slate-500 truncate">{spot.address}</p>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        {spot.distanceKm !== undefined && (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <Footprints className="w-3 h-3" />
                            {spot.distanceKm < 1 ? `${Math.round(spot.distanceKm * 1000)}m` : `${spot.distanceKm} km`}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetailsSpot(spot);
                          }}
                          className="text-xs font-bold text-slate-700 hover:text-emerald-700"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav onOpenVehicles={() => setIsVehiclesOpen(true)} />

      {/* Airbnb-Inspired Spot Details Page Modal */}
      {selectedDetailsSpot && (
        <SpotDetailsModal
          spot={selectedDetailsSpot}
          userLocation={userLocation}
          onClose={() => setSelectedDetailsSpot(null)}
          onBookNow={(spot) => {
            setSelectedDetailsSpot(null);
            setBookingSpot(spot);
          }}
        />
      )}

      {/* Booking Checkout Modal (With Atomic Backend Verification) */}
      {bookingSpot && (
        <BookingModal
          spot={bookingSpot}
          onClose={() => {
            setBookingSpot(null);
            fetchListings();
          }}
        />
      )}

      {/* Vehicle Vault Modal */}
      {isVehiclesOpen && (
        <VehicleVaultModal onClose={() => setIsVehiclesOpen(false)} />
      )}
    </div>
  );
}
