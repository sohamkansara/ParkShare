'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import DigitalEntryPass from '@/components/pass/DigitalEntryPass';
import { Booking } from '@/lib/types';
import { getStoredBookings } from '@/lib/storage';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

export default function BookingPassPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBooking = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const b = json.data;
          setBooking({
            ...b,
            listingTitle: b.listing?.title || 'Private Parking Spot',
            listingAddress: b.listing?.address || 'City Center',
            listingCity: b.listing?.city || 'Bengaluru',
            hostName: b.listing?.hostName || 'Host',
            hostPhone: b.listing?.hostPhone || '+91 98765 43210',
            societyName: b.listing?.societyName,
            flatNo: b.listing?.flatNo,
            gateInstructions: b.listing?.gateInstructions,
          });
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Live API pass lookup failed, checking local cache:', e);
    }

    // Fallback to local storage
    const all = getStoredBookings();
    const found = all.find((b) => b.id === bookingId);
    setBooking(found || null);
    setLoading(false);
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-6 space-y-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Passes</span>
          </Link>
          <span className="text-[11px] text-slate-400 font-mono">DB Ref: {bookingId}</span>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-700">Verifying Pass in Database...</p>
            <p className="text-[11px] text-slate-400">Loading society access permissions and guard code</p>
          </div>
        ) : !booking ? (
          <div className="p-8 bg-white rounded-3xl text-center space-y-3 border border-slate-200">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Pass Not Found</h3>
            <p className="text-xs text-slate-500">
              We couldn&apos;t find an active parking reservation with ID {bookingId} in the database.
            </p>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Explore Parking
            </Link>
          </div>
        ) : (
          <DigitalEntryPass booking={booking} onUpdate={loadBooking} />
        )}
      </main>
    </div>
  );
}
