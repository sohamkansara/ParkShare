'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Car, Home, Compass, Calendar, PlusCircle, CheckCircle2 } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { getStoredRole, setStoredRole, getStoredBookings } from '@/lib/storage';

interface HeaderProps {
  selectedCity?: string;
  onCityChange?: (city: 'Bengaluru' | 'Pune' | 'Mumbai' | 'Delhi NCR') => void;
}

export default function Header({ selectedCity = 'Bengaluru', onCityChange }: HeaderProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole>('DRIVER');
  const [activeBookingCount, setActiveBookingCount] = useState(0);

  useEffect(() => {
    setRole(getStoredRole());
    
    const updateStats = () => {
      const bookings = getStoredBookings();
      const active = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN');
      setActiveBookingCount(active.length);
    };

    updateStats();
    window.addEventListener('parkshare_data_change', updateStats);
    window.addEventListener('parkshare_role_change', () => setRole(getStoredRole()));

    return () => {
      window.removeEventListener('parkshare_data_change', updateStats);
      window.removeEventListener('parkshare_role_change', () => setRole(getStoredRole()));
    };
  }, []);

  const handleRoleToggle = (newRole: UserRole) => {
    setRole(newRole);
    setStoredRole(newRole);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <span className="font-black text-xl tracking-tight">P</span>
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  ParkShare
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    India
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 hidden sm:block">Private Parking Marketplace</p>
              </div>
            </Link>

            {/* City Selector */}
            {onCityChange && (
              <div className="ml-4 pl-4 border-l border-slate-200 hidden md:block">
                <select
                  value={selectedCity}
                  onChange={(e) => onCityChange(e.target.value as any)}
                  aria-label="Select City"
                  className="bg-slate-100 text-xs font-semibold text-slate-800 rounded-lg px-3 py-1.5 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Bengaluru">📍 Bengaluru (Koramangala, Indiranagar)</option>
                  <option value="Pune">📍 Pune (Koregaon Park, FC Road)</option>
                  <option value="Mumbai">📍 Mumbai (Bandra, BKC)</option>
                  <option value="Delhi NCR">📍 Delhi NCR (Cyber City, Gurgaon)</option>
                </select>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Driver Links */}
            <Link
              href="/"
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                pathname === '/'
                  ? 'bg-slate-100 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="hidden sm:inline">Explore Map</span>
            </Link>

            <Link
              href="/bookings"
              className={`relative flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                pathname.startsWith('/bookings')
                  ? 'bg-slate-100 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">My Passes</span>
              {activeBookingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white animate-pulse">
                  {activeBookingCount}
                </span>
              )}
            </Link>

            {/* Host Dashboard Link */}
            <Link
              href="/host"
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                pathname.startsWith('/host')
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Host Hub</span>
            </Link>

            {/* Admin Console */}
            <Link
              href="/admin"
              className={`flex items-center space-x-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors ${
                pathname.startsWith('/admin') ? 'bg-slate-200 text-slate-900' : ''
              }`}
              title="Admin Moderation"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin</span>
            </Link>

            {/* Role Switcher Button */}
            <div className="pl-2 border-l border-slate-200 flex items-center">
              {role === 'DRIVER' ? (
                <Link
                  href="/host/new"
                  className="flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>List Your Space</span>
                </Link>
              ) : (
                <button
                  onClick={() => handleRoleToggle('DRIVER')}
                  className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-all"
                >
                  <Car className="w-4 h-4" />
                  <span>Switch to Driver</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
