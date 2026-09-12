'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { ParkingListing, Booking } from '@/lib/types';
import { getStoredListings, getStoredBookings, saveListing } from '@/lib/storage';
import { formatINR } from '@/lib/pricing';
import { 
  PlusCircle, Home, DollarSign, Users, Calendar, 
  ShieldCheck, ArrowUpRight, TrendingUp, CheckCircle2, Car, Eye, EyeOff
} from 'lucide-react';

export default function HostHubPage() {
  const [listings, setListings] = useState<ParkingListing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setListings(getStoredListings());
    setBookings(getStoredBookings());

    const refresh = () => {
      setListings(getStoredListings());
      setBookings(getStoredBookings());
    };
    window.addEventListener('parkshare_data_change', refresh);
    return () => window.removeEventListener('parkshare_data_change', refresh);
  }, []);

  // Compute Host Metrics
  const grossEarnings = bookings.reduce((sum, b) => sum + (b.baseFare || 0), 0) + 12400; // seed realistic base
  const platformFee = Math.round(grossEarnings * 0.10);
  const tdsDeduction = Math.round(grossEarnings * 0.01); // 1% TDS under Sec 194-O
  const netPayout = grossEarnings - platformFee - tdsDeduction;
  const totalCompleted = bookings.filter(b => b.status === 'COMPLETED').length + 32;

  const toggleListingActive = (listing: ParkingListing) => {
    const updated: ParkingListing = {
      ...listing,
      isActive: !listing.isActive,
    };
    saveListing(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hub Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-1">
              <Home className="w-3.5 h-3.5" /> Host Control Center
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Host Earnings & Spaces</h1>
            <p className="text-xs text-slate-500">
              Manage your driveways, apartment society visitor slots, and track automated bank payouts.
            </p>
          </div>

          <Link
            href="/host/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List Another Space</span>
          </Link>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Net Payout */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Net Payouts (Bank/UPI)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                ₹
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{formatINR(netPayout)}</p>
            <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> T+24h Automated Escrow Release
            </p>
          </div>

          {/* Gross Bookings */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Gross Rental Revenue</span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-900">{formatINR(grossEarnings)}</p>
            <p className="text-[10px] text-slate-500">
              Platform Fee: {formatINR(platformFee)} (10%)
            </p>
          </div>

          {/* TDS Section 194-O */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Section 194-O TDS (1%)</span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{formatINR(tdsDeduction)}</p>
            <p className="text-[10px] text-slate-500">Form 16A generated quarterly</p>
          </div>

          {/* Completed Bookings */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Completed Rentals</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-900">{totalCompleted}</p>
            <p className="text-[10px] text-slate-500">Zero host cancellation rating</p>
          </div>
        </div>

        {/* Listings Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              My Listed Parking Inventory ({listings.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((l) => (
              <div
                key={l.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {l.category.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => toggleListingActive(l)}
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                        l.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {l.isActive ? (
                        <>
                          <Eye className="w-3 h-3 text-emerald-600" /> Active (Live)
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> Paused
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{l.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{l.address}</p>

                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold">Pricing</p>
                      <p className="font-bold text-slate-900">₹{l.hourlyRate}/hr · ₹{l.dailyRate}/day</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-semibold">Capacity</p>
                      <p className="font-bold text-slate-900">{l.capacity} {l.capacity === 1 ? 'Slot' : 'Slots'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Rating: ⭐ {l.rating} ({l.reviewCount})</span>
                  <Link
                    href={`/?city=${encodeURIComponent(l.city)}`}
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span>View on Map</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Guest Roster */}
        <section className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Live Guest Arrivals & Guard Roster ({bookings.length})
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No bookings recorded yet. New driver reservations will appear here in real-time.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Booking / Driver</th>
                      <th className="p-4">Vehicle Plate</th>
                      <th className="p-4">Guard PIN</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Host Payout</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{b.driverName}</p>
                          <p className="text-[11px] text-slate-400">{b.id}</p>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-800">
                          {b.vehiclePlate}
                        </td>
                        <td className="p-4">
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                            {b.gatePassCode}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">
                          {b.hours} hrs
                        </td>
                        <td className="p-4 font-bold text-emerald-700">
                          {formatINR(b.hostPayout)}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : b.status === 'CHECKED_IN'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
