'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import ParkingMap from '@/components/map/ParkingMap';
import BookingModal from '@/components/booking/BookingModal';
import { ParkingListing, VehicleType, ListingCategory } from '@/lib/types';
import { getStoredListings } from '@/lib/storage';
import { 
  Search, Star, ShieldCheck, 
  MapPin, Car, Zap, CheckCircle2, Navigation, List, Map as MapIcon, RefreshCw
} from 'lucide-react';

export default function HomePage() {
  const [listings, setListings] = useState<ParkingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<'Bengaluru' | 'Pune' | 'Mumbai' | 'Delhi NCR'>('Bengaluru');
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<ParkingListing | null>(null);
  const [bookingSpot, setBookingSpot] = useState<ParkingListing | null>(null);
  const [mobileTab, setMobileTab] = useState<'LIST' | 'MAP'>('LIST');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch listings from real backend API with fallback
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
        params.set('radiusKm', '10');
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
      console.warn('API fetch failed, using local storage cache:', e);
    }

    // Fallback to local storage
    setListings(getStoredListings());
    setLoading(false);
  }, [selectedCity, selectedVehicleType, selectedCategory, searchQuery, userLocation]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleUseMyLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Default simulated location for Pune Koregaon Park
          setUserLocation({ lat: 18.5362, lng: 73.8940 });
        }
      );
    } else {
      setUserLocation({ lat: 18.5362, lng: 73.8940 });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header selectedCity={selectedCity} onCityChange={(city) => {
        setSelectedCity(city);
        setUserLocation(null);
      }} />

      {/* Sub-header Filter Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={`Search in ${selectedCity} (e.g. Koramangala, FC Rd)`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            {/* GPS Radius Filter Button */}
            <button
              onClick={handleUseMyLocation}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                userLocation
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Filter by distance from my location"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{userLocation ? 'Near Me (Active)' : 'Near Me'}</span>
            </button>

            {/* Vehicle Type Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setSelectedVehicleType('ALL')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  selectedVehicleType === 'ALL'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedVehicleType('TWO_WHEELER')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  selectedVehicleType === 'TWO_WHEELER'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🏍️</span>
                <span>2-Wheeler</span>
              </button>
              <button
                onClick={() => setSelectedVehicleType('HATCHBACK')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  selectedVehicleType === 'HATCHBACK'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🚗</span>
                <span>Car</span>
              </button>
              <button
                onClick={() => setSelectedVehicleType('SUV')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  selectedVehicleType === 'SUV'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🚙</span>
                <span>SUV</span>
              </button>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-slate-100 text-xs font-semibold text-slate-700 py-1.5 px-3 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 shrink-0"
            >
              <option value="ALL">All Categories</option>
              <option value="RESIDENTIAL_DRIVEWAY">🏡 Private Driveway</option>
              <option value="GATED_SOCIETY">🏢 Gated Society (Pass)</option>
              <option value="COMMERCIAL_BASEMENT">🏬 Commercial Basement</option>
            </select>

            {/* Mobile View Toggle */}
            <div className="flex md:hidden bg-slate-100 p-1 rounded-xl ml-auto shrink-0">
              <button
                onClick={() => setMobileTab('LIST')}
                className={`p-1.5 rounded-lg ${mobileTab === 'LIST' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileTab('MAP')}
                className={`p-1.5 rounded-lg ${mobileTab === 'MAP' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500'}`}
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
        {/* Left Column: Listing Cards */}
        <div
          className={`w-full md:w-1/2 lg:w-5/12 overflow-y-auto pr-1 space-y-4 ${
            mobileTab === 'MAP' ? 'hidden md:block' : 'block'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              {loading && <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />}
              {listings.length} verified parking {listings.length === 1 ? 'spot' : 'spots'} found
            </span>
            <span>Live DB Sync</span>
          </div>

          {listings.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3 mt-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No parking spots found</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Try expanding your search query or vehicle filter in {selectedCity}.
              </p>
              <button
                onClick={() => {
                  setSelectedVehicleType('ALL');
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                  setUserLocation(null);
                }}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            listings.map((spot: any) => {
              const isSelected = selectedSpot?.id === spot.id;
              return (
                <div
                  key={spot.id}
                  onClick={() => setSelectedSpot(spot)}
                  className={`p-4 rounded-3xl bg-white border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Image Thumbnail */}
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                      {spot.images && spot.images[0] ? (
                        <img
                          src={spot.images[0]}
                          alt={spot.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Car className="w-8 h-8" />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        ₹{spot.hourlyRate}/hr
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase tracking-wide">
                            {spot.category.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{spot.rating}</span>
                            <span className="text-[10px] text-slate-400">({spot.reviewCount})</span>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 truncate leading-snug">
                          {spot.title}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{spot.locality}, {spot.city}</span>
                          {spot.distanceKm !== undefined && spot.distanceKm !== null && (
                            <span className="ml-1 text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">
                              {spot.distanceKm} km away
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Amenities and Book Button */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          {spot.amenities?.includes('COVERED') && <span>🛡️ Covered</span>}
                          {spot.amenities?.includes('EV_CHARGING') && <span>⚡ EV</span>}
                          {spot.category === 'GATED_SOCIETY' && (
                            <span className="text-emerald-700 font-medium">🏢 Society Pass</span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBookingSpot(spot);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Interactive Leaflet Map */}
        <div
          className={`w-full md:w-1/2 lg:w-7/12 h-full min-h-[400px] ${
            mobileTab === 'LIST' ? 'hidden md:block' : 'block'
          }`}
        >
          <ParkingMap
            listings={listings}
            selectedSpot={selectedSpot}
            onSelectSpot={(spot) => {
              setSelectedSpot(spot);
              setMobileTab('LIST');
            }}
            selectedCity={selectedCity}
          />
        </div>
      </main>

      {/* Booking Checkout Modal */}
      {bookingSpot && (
        <BookingModal
          spot={bookingSpot}
          onClose={() => {
            setBookingSpot(null);
            fetchListings();
          }}
        />
      )}
    </div>
  );
}
