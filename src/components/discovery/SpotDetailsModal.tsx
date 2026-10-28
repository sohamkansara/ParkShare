'use client';

import React, { useState } from 'react';
import { ParkingListing } from '@/lib/types';
import { formatINR } from '@/lib/pricing';
import { 
  X, Star, MapPin, ShieldCheck, Zap, Car, Clock, 
  CheckCircle2, Info, ChevronLeft, ChevronRight, Navigation, 
  Calendar, ArrowRight, Phone, MessageSquare, AlertCircle, Share2, Heart
} from 'lucide-react';

interface SpotDetailsModalProps {
  spot: ParkingListing;
  onClose: () => void;
  onBookNow: (spot: ParkingListing) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export default function SpotDetailsModal({
  spot,
  onClose,
  onBookNow,
  userLocation,
}: SpotDetailsModalProps) {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const images = spot.images && spot.images.length > 0 ? spot.images : [
    'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
  ];

  const distanceKm = (spot as any).distanceKm;
  const walkingMinutes = distanceKm !== undefined && distanceKm !== null 
    ? Math.max(1, Math.round((distanceKm * 1000) / 80)) 
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Floating Top Navigation Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <button
            onClick={onClose}
            className="pointer-events-auto p-2.5 rounded-full bg-white/90 backdrop-blur text-slate-800 hover:bg-white shadow-md transition-all active:scale-95"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`p-2.5 rounded-full backdrop-blur shadow-md transition-all active:scale-95 ${
                isSaved ? 'bg-rose-50 text-rose-600' : 'bg-white/90 text-slate-700 hover:bg-white'
              }`}
              title="Save to favorites"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: spot.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="p-2.5 rounded-full bg-white/90 backdrop-blur text-slate-700 hover:bg-white shadow-md transition-all active:scale-95"
              title="Share spot"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 pb-24">
          {/* 1. Large Photo Gallery (Airbnb Style) */}
          <div className="relative w-full h-64 sm:h-80 bg-slate-900 overflow-hidden">
            <img
              src={images[activePhotoIdx]}
              alt={spot.title}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20" />

            {/* Gallery Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur transition-all"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActivePhotoIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur transition-all"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Photo Counter Pill */}
            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/20">
              {activePhotoIdx + 1} / {images.length}
            </div>

            {/* Category and Distance Banner */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white text-slate-900 text-xs font-bold uppercase tracking-wider shadow">
                {spot.category.replace('_', ' ')}
              </span>
              {walkingMinutes && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-black shadow flex items-center gap-1">
                  🚶 ~{walkingMinutes} min walk
                </span>
              )}
            </div>
          </div>

          {/* 2. Main Title, Location & Reviews Section */}
          <div className="p-5 sm:p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-sm">{spot.rating}</span>
                  <span className="text-slate-400 font-normal">({spot.reviewCount} verified ratings)</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Instant Confirmation
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {spot.title}
              </h1>

              <div className="flex items-start gap-1.5 text-xs text-slate-600 mt-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">{spot.address}</p>
                  <p className="text-slate-500">{spot.locality}, {spot.city} · Near {spot.landmark}</p>
                </div>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="text-center p-2 rounded-xl bg-white shadow-xs">
                <p className="text-[10px] uppercase font-bold text-slate-400">Hourly Rate</p>
                <p className="text-base font-black text-slate-900 mt-0.5">₹{spot.hourlyRate}</p>
                <p className="text-[10px] text-slate-500">per hour</p>
              </div>

              <div className="text-center p-2 rounded-xl bg-white shadow-xs">
                <p className="text-[10px] uppercase font-bold text-slate-400">Daily Cap</p>
                <p className="text-base font-black text-emerald-700 mt-0.5">₹{spot.dailyRate}</p>
                <p className="text-[10px] text-slate-500">&gt;6 hrs cap</p>
              </div>

              <div className="text-center p-2 rounded-xl bg-white shadow-xs">
                <p className="text-[10px] uppercase font-bold text-slate-400">Capacity</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{spot.capacity}</p>
                <p className="text-[10px] text-slate-500">{spot.capacity === 1 ? 'Slot Available' : 'Slots'}</p>
              </div>
            </div>

            {/* 3. Description & Entry Specs */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">About this Space</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {spot.description}
              </p>
            </div>

            {/* 4. Supported Vehicles & Clearance */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Vehicle Compatibility</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { type: 'TWO_WHEELER', label: '2-Wheeler', icon: '🏍️', desc: 'Bikes / Scooters' },
                  { type: 'HATCHBACK', label: 'Hatchback', icon: '🚗', desc: 'Swift, i20, Tiago' },
                  { type: 'SEDAN', label: 'Sedan', icon: '🚘', desc: 'City, Verna, Ciaz' },
                  { type: 'SUV', label: 'SUV', icon: '🚙', desc: 'Creta, Fortuner' },
                ].map((item) => {
                  const isSupported = spot.supportedVehicles?.includes(item.type as any);
                  return (
                    <div
                      key={item.type}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isSupported
                          ? 'bg-emerald-50/60 border-emerald-300 text-slate-900'
                          : 'bg-slate-50/50 border-slate-200 text-slate-400 opacity-60'
                      }`}
                    >
                      <span className="text-xl block mb-1">{item.icon}</span>
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {isSupported ? '✓ Allowed' : '✗ Too Large'}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Standard ground & height clearance suitable for standard passenger vehicles.</span>
              </p>
            </div>

            {/* 5. Amenities & Security Features */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Amenities & Security</h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {spot.amenities?.includes('COVERED') && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-base">☂️</span>
                    <div>
                      <p className="font-bold text-slate-900">Covered / Stilt Bay</p>
                      <p className="text-[10px] text-slate-500">Protection from sun & rain</p>
                    </div>
                  </div>
                )}
                {spot.amenities?.includes('CCTV') && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-base">📹</span>
                    <div>
                      <p className="font-bold text-slate-900">24x7 CCTV Monitored</p>
                      <p className="text-[10px] text-slate-500">Live camera surveillance</p>
                    </div>
                  </div>
                )}
                {spot.amenities?.includes('SECURITY_GUARD') && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-base">🛡️</span>
                    <div>
                      <p className="font-bold text-slate-900">Security Guard on Duty</p>
                      <p className="text-[10px] text-slate-500">Boom barrier check</p>
                    </div>
                  </div>
                )}
                {spot.amenities?.includes('EV_CHARGING') && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-950">EV Charging Plug</p>
                      <p className="text-[10px] text-emerald-800">Compatible with 2W & 4W</p>
                    </div>
                  </div>
                )}
                {spot.amenities?.includes('24_7_ACCESS') && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900">24x7 Access Available</p>
                      <p className="text-[10px] text-slate-500">No late-night gate lock</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 6. Host Profile Card (Airbnb Style) */}
            <div className="p-4 rounded-3xl bg-slate-900 text-white space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow">
                    {spot.hostName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm text-white">{spot.hostName}</p>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                        Verified Host
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Response time: &lt; 15 mins</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-amber-400 flex items-center justify-end gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {spot.rating}
                  </p>
                  <p className="text-[10px] text-slate-400">{spot.reviewCount} total bookings</p>
                </div>
              </div>

              {spot.societyName && (
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Authorized visitor spot inside <strong className="text-white">{spot.societyName}</strong>. Guard pass generated upon booking.
                  </span>
                </div>
              )}
            </div>

            {/* 7. Cancellation Policy */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <p className="font-bold text-slate-800 uppercase tracking-wide">
                Cancellation Policy: {spot.cancellationPolicy}
              </p>
              <p className="text-slate-500 leading-relaxed">
                {spot.cancellationPolicy === 'FLEXIBLE'
                  ? 'Free cancellation with full refund up to 1 hour before scheduled start time.'
                  : 'Free cancellation up to 12 hours before booking. 50% refund within 2 hours.'}
              </p>
            </div>
          </div>
        </div>

        {/* 8. Sticky Bottom Booking Panel */}
        <div className="sticky bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 px-5 py-3.5 flex items-center justify-between shadow-xl">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900">₹{spot.hourlyRate}</span>
              <span className="text-xs text-slate-500 font-semibold">/ hour</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium">Inclusive of all taxes & GST</p>
          </div>

          <button
            onClick={() => onBookNow(spot)}
            className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 flex items-center gap-2"
          >
            <span>Book Parking</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
