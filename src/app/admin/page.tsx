'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { ParkingListing, Booking } from '@/lib/types';
import { getStoredListings, getStoredBookings, saveListing, saveBooking } from '@/lib/storage';
import { formatINR } from '@/lib/pricing';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, 
  Eye, TrendingUp, Users, DollarSign, ArrowLeft, RefreshCw
} from 'lucide-react';

export default function AdminPage() {
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

  // Compute Platform KPIs
  const totalGmv = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) + 48200;
  const platformRevenue = Math.round(totalGmv * 0.15); // 15% combined take-rate
  const activeListingsCount = listings.filter(l => l.isActive).length;
  const disputedBookings = bookings.filter(b => b.status === 'DISPUTED');

  const handleResolveDispute = (booking: Booking, refundApproved: boolean) => {
    const updated: Booking = {
      ...booking,
      status: refundApproved ? 'CANCELLED' : 'COMPLETED',
    };
    saveBooking(updated);
  };

  const handleToggleListingStatus = (listing: ParkingListing) => {
    const updated: ParkingListing = {
      ...listing,
      isActive: !listing.isActive,
    };
    saveListing(updated);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Platform Admin & Ops
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Marketplace Moderation Console</h1>
            <p className="text-xs text-slate-500">
              Audit listings, handle SOS disputes, and monitor city-level liquidity.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to App</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Gross Marketplace GMV</p>
            <p className="text-2xl font-black text-slate-900">{formatINR(totalGmv)}</p>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18.4% month-over-month
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Net Platform Revenue</p>
            <p className="text-2xl font-black text-emerald-600">{formatINR(platformRevenue)}</p>
            <p className="text-[10px] text-slate-500">Convenience fees + commissions</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Active Inventory</p>
            <p className="text-2xl font-black text-slate-900">{activeListingsCount} Spots</p>
            <p className="text-[10px] text-slate-500">Across 4 metro clusters</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Active Disputes (SOS)</p>
            <p className={`text-2xl font-black ${disputedBookings.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {disputedBookings.length}
            </p>
            <p className="text-[10px] text-slate-500">Blocked spots & guard denials</p>
          </div>
        </div>

        {/* Active Disputes Section */}
        {disputedBookings.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Pending SOS Claims Requiring Immediate Action ({disputedBookings.length})</span>
            </div>

            <div className="bg-white rounded-3xl border border-rose-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
              {disputedBookings.map((b) => (
                <div key={b.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded">
                        {b.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{b.listingTitle}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Driver: <span className="font-semibold">{b.driverName}</span> ({b.driverPhone}) · Vehicle: <span className="font-mono font-semibold">{b.vehiclePlate}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Host: {b.hostName} ({b.hostPhone}) · Amount: {formatINR(b.totalAmount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveDispute(b, true)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve 100% Refund</span>
                    </button>
                    <button
                      onClick={() => handleResolveDispute(b, false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                    >
                      Dismiss Claim
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Listing Moderation Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Inventory Moderation & Approval Queue
            </h2>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Spot Title & Locality</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Host Details</th>
                    <th className="p-4">Pricing</th>
                    <th className="p-4">Compliance Check</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{l.title}</p>
                        <p className="text-[11px] text-slate-500">{l.locality}, {l.city}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {l.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{l.hostName}</p>
                        <p className="text-[11px] text-slate-400">{l.hostPhone}</p>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        ₹{l.hourlyRate}/hr
                      </td>
                      <td className="p-4">
                        {l.category === 'GATED_SOCIETY' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            🛡️ Society Verified
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            ✅ Direct Access
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleListingStatus(l)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            l.isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {l.isActive ? 'Suspend' : 'Approve & Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
