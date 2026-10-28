'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Calendar, Car, Home, Shield } from 'lucide-react';
import { getStoredBookings } from '@/lib/storage';

interface BottomNavProps {
  onOpenVehicles?: () => void;
}

export default function BottomNav({ onOpenVehicles }: BottomNavProps) {
  const pathname = usePathname();
  const [activeBookingCount, setActiveBookingCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const bookings = getStoredBookings();
      const active = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN');
      setActiveBookingCount(active.length);
    };

    updateCount();
    window.addEventListener('parkshare_data_change', updateCount);
    return () => window.removeEventListener('parkshare_data_change', updateCount);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-4 sm:hidden shadow-lg safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Explore */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            pathname === '/'
              ? 'text-emerald-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Compass className={`w-5 h-5 ${pathname === '/' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Explore</span>
        </Link>

        {/* Bookings / Passes */}
        <Link
          href="/bookings"
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            pathname.startsWith('/bookings')
              ? 'text-emerald-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <Calendar className={`w-5 h-5 ${pathname.startsWith('/bookings') ? 'stroke-[2.5]' : ''}`} />
            {activeBookingCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow">
                {activeBookingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">My Passes</span>
        </Link>

        {/* Vehicles */}
        <button
          onClick={onOpenVehicles}
          type="button"
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-500 hover:text-slate-900 transition-all"
        >
          <Car className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Vehicles</span>
        </button>

        {/* Host Hub */}
        <Link
          href="/host"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            pathname.startsWith('/host')
              ? 'text-emerald-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className={`w-5 h-5 ${pathname.startsWith('/host') ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">Host Hub</span>
        </Link>
      </div>
    </nav>
  );
}
