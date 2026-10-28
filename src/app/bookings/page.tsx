'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import VehicleVaultModal from '@/components/profile/VehicleVaultModal';
import { Booking } from '@/lib/types';
import { getStoredBookings } from '@/lib/storage';
import { formatINR } from '@/lib/pricing';
import { 
  Calendar, Clock, ShieldCheck, MapPin, 
  ArrowRight, CheckCircle2, AlertTriangle, Car
} from 'lucide-react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isVehiclesOpen, setIsVehiclesOpen] = useState(false);

  useEffect(() => {
    setBookings(getStoredBookings());
    const refresh = () => setBookings(getStoredBookings());
    window.addEventListener('parkshare_data_change', refresh);
    return () => window.removeEventListener('parkshare_data_change', refresh);
  }, []);

  const activeBookings = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN');
  const pastBookings = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'CANCELLED' || b.status === 'DISPUTED');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 sm:pb-8">
      <Header onOpenVehicles={() => setIsVehiclesOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">My Parking Passes & Bookings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your society entry codes, GPS check-ins, and past parking receipts.
          </p>
        </div>

        {/* Active Reservations Banner */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              Active & Upcoming Passes ({activeBookings.length})
            </h2>
          </div>

          {activeBookings.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No active parking reservations</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Discover guaranteed parking spaces near your destination across Bengaluru, Pune, Mumbai, or Delhi.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <span>Find Parking Nearby</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {b.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5 line-clamp-1">
                        {b.listingTitle}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">{b.listingAddress}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-900">{formatINR(b.totalAmount)}</p>
                      <p className="text-[10px] text-slate-400">Paid via {b.paymentMethod}</p>
                    </div>
                  </div>

                  {/* Society Gate PIN highlight */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/80 border border-amber-200">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="text-[10px] font-bold text-amber-900 uppercase">Guard Pass PIN</p>
                        <p className="font-mono text-base font-black text-slate-900">{b.gatePassCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-amber-800">Vehicle</p>
                      <p className="font-mono text-xs font-bold text-slate-900">{b.vehiclePlate}</p>
                    </div>
                  </div>

                  {/* Open Digital Pass Button */}
                  <Link
                    href={`/bookings/${b.id}/pass`}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Open Digital Entry Pass</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Past Parking History ({pastBookings.length})
            </h2>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {pastBookings.map((b) => (
                <div key={b.id} className="p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{b.listingTitle}</p>
                      <p className="text-slate-500 text-[11px]">{new Date(b.startTime).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatINR(b.totalAmount)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <Link
                      href={`/bookings/${b.id}/pass`}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                      title="View Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav onOpenVehicles={() => setIsVehiclesOpen(true)} />

      {/* Vehicle Vault Modal */}
      {isVehiclesOpen && (
        <VehicleVaultModal onClose={() => setIsVehiclesOpen(false)} />
      )}
    </div>
  );
}
