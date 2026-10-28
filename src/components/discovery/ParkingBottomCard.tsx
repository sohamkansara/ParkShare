'use client';

import React from 'react';
import { ParkingListing } from '@/lib/types';
import { Star, ShieldCheck, MapPin, Footprints, Zap, ArrowRight, Car, Compass } from 'lucide-react';

interface ParkingBottomCardProps {
  spot: ParkingListing;
  isNearest?: boolean;
  onViewDetails: (spot: ParkingListing) => void;
  onBookNow: (spot: ParkingListing) => void;
  onNextSpot?: () => void;
  onPrevSpot?: () => void;
  totalNearbyCount?: number;
  currentIndex?: number;
}

export default function ParkingBottomCard({
  spot,
  isNearest = false,
  onViewDetails,
  onBookNow,
  totalNearbyCount = 1,
  currentIndex = 1,
}: ParkingBottomCardProps) {
  // Approximate walking time: ~80 meters per minute
  const distanceKm = (spot as any).distanceKm;
  const walkingMinutes = distanceKm !== undefined && distanceKm !== null 
    ? Math.max(1, Math.round((distanceKm * 1000) / 80)) 
    : null;

  return (
    <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden backdrop-blur-sm transition-all duration-300">
      {/* Top micro banner */}
      <div className="px-4 py-2 bg-slate-900 text-white flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          {isNearest ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black tracking-wider uppercase text-[10px] flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              Nearest Spot
            </span>
          ) : (
            <span className="font-semibold text-slate-300">Selected Parking Space</span>
          )}
          {walkingMinutes && (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5" />
              ~{walkingMinutes} min walk ({distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm} km`})
            </span>
          )}
        </div>
        <span className="text-slate-400 font-medium">
          {currentIndex} of {totalNearbyCount}
        </span>
      </div>

      {/* Main Card Content */}
      <div className="p-4 sm:p-5">
        <div className="flex gap-4 items-start">
          {/* Thumbnail */}
          <div 
            onClick={() => onViewDetails(spot)}
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer group shadow-sm border border-slate-100"
          >
            {spot.images && spot.images[0] ? (
              <img
                src={spot.images[0]}
                alt={spot.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Car className="w-8 h-8" />
              </div>
            )}
            <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
              ₹{spot.hourlyRate}/h
            </div>
            {spot.images && spot.images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                +{spot.images.length - 1} photos
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase tracking-wide truncate max-w-[130px]">
                  {spot.category.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-900 shrink-0">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{spot.rating}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({spot.reviewCount})</span>
                </div>
              </div>

              <h3 
                onClick={() => onViewDetails(spot)}
                className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1 hover:text-emerald-700 cursor-pointer transition-colors"
              >
                {spot.title}
              </h3>

              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{spot.locality}, {spot.city}</span>
              </p>
            </div>

            {/* Amenity Pills */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px] text-slate-600">
              {spot.amenities?.includes('COVERED') && (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium">Covered</span>
              )}
              {spot.amenities?.includes('EV_CHARGING') && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold flex items-center gap-0.5">
                  <Zap className="w-3 h-3 text-emerald-600" /> EV Plug
                </span>
              )}
              {spot.category === 'GATED_SOCIETY' && (
                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3 text-blue-600" /> Guard Pass
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-slate-100">
          <button
            onClick={() => onViewDetails(spot)}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200"
          >
            <span>View Details</span>
          </button>

          <button
            onClick={() => onBookNow(spot)}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>Book for ₹{spot.hourlyRate}/h</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
