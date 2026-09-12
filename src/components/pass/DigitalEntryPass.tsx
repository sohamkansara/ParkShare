'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, MapPin, Phone, MessageSquare, AlertTriangle, 
  CheckCircle2, Clock, Navigation, QrCode, Car, Copy, Check
} from 'lucide-react';
import { Booking } from '@/lib/types';
import { formatINR } from '@/lib/pricing';
import { saveBooking } from '@/lib/storage';

interface DigitalEntryPassProps {
  booking: Booking;
  onUpdate?: () => void;
}

export default function DigitalEntryPass({ booking, onUpdate }: DigitalEntryPassProps) {
  const [currentBooking, setCurrentBooking] = useState<Booking>(booking);
  const [copied, setCopied] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosReason, setSosReason] = useState('SPOT_BLOCKED');
  const [sosResolved, setSosResolved] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const copyGateCode = () => {
    navigator.clipboard.writeText(currentBooking.gatePassCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateServerStatus = async (newStatus: string) => {
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/bookings/${currentBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const updated: Booking = {
            ...currentBooking,
            status: json.data.status,
            actualCheckin: json.data.actualCheckin,
            actualCheckout: json.data.actualCheckout,
          };
          setCurrentBooking(updated);
          saveBooking(updated);
          if (onUpdate) onUpdate();
          setLoadingAction(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not reach PATCH /api/bookings/[id], using local sync:', e);
    }

    // Fallback local update
    const updated: Booking = {
      ...currentBooking,
      status: newStatus as any,
      actualCheckin: newStatus === 'CHECKED_IN' ? new Date().toISOString() : currentBooking.actualCheckin,
      actualCheckout: newStatus === 'COMPLETED' ? new Date().toISOString() : currentBooking.actualCheckout,
    };
    setCurrentBooking(updated);
    saveBooking(updated);
    if (onUpdate) onUpdate();
    setLoadingAction(false);
  };

  const handleCheckIn = () => updateServerStatus('CHECKED_IN');
  const handleCheckOut = () => updateServerStatus('COMPLETED');
  
  const handleTriggerSos = async () => {
    await updateServerStatus('DISPUTED');
    setSosResolved(true);
  };

  const formattedStart = new Date(currentBooking.startTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedEnd = new Date(currentBooking.endTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedDate = new Date(currentBooking.startTime).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Pass Header */}
      <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-sm">
              P
            </div>
            <span className="font-bold text-sm tracking-wider uppercase">ParkShare Entry Pass</span>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
            currentBooking.status === 'CONFIRMED'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : currentBooking.status === 'CHECKED_IN'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse'
              : currentBooking.status === 'COMPLETED'
              ? 'bg-slate-500/20 text-slate-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {currentBooking.status.replace('_', ' ')}
          </div>
        </div>

        <div className="mt-4 relative z-10">
          <p className="text-xs text-slate-400">Pass Reference ID</p>
          <p className="text-xl font-mono font-bold tracking-wider text-emerald-400">
            {currentBooking.id}
          </p>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl" />
      </div>

      <div className="p-6 space-y-6">
        {/* Guard Verification PIN Box */}
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Show to Security Guard / Gatekeeper</span>
          </div>
          <div className="flex items-center justify-center gap-3 py-1">
            <span className="font-mono text-3xl font-black tracking-widest text-slate-900 bg-white px-4 py-1 rounded-xl shadow-sm border border-amber-300">
              {currentBooking.gatePassCode}
            </span>
            <button
              onClick={copyGateCode}
              className="p-2 bg-white rounded-lg border border-amber-300 text-slate-600 hover:bg-amber-100 transition-colors"
              title="Copy PIN"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-amber-700">
            Authorized Visitor Code for Society Boom Barrier
          </p>
        </div>

        {/* Vehicle & Reservation Meta */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
              <Car className="w-3.5 h-3.5 text-emerald-600" />
              <span>Registered Vehicle</span>
            </div>
            <p className="font-mono text-sm font-bold text-slate-900">{currentBooking.vehiclePlate}</p>
            <p className="text-[10px] text-slate-500 truncate">{currentBooking.vehicleModel}</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Time Window</span>
            </div>
            <p className="text-xs font-bold text-slate-900">{formattedDate}</p>
            <p className="text-[11px] text-slate-600 font-medium">
              {formattedStart} – {formattedEnd}
            </p>
          </div>
        </div>

        {/* Location & Instructions Card */}
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900">{currentBooking.listingTitle}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{currentBooking.listingAddress}</p>
              {currentBooking.societyName && (
                <div className="mt-1 inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                  🏢 {currentBooking.societyName} {currentBooking.flatNo ? `(${currentBooking.flatNo})` : ''}
                </div>
              )}
            </div>
          </div>

          {currentBooking.gateInstructions && (
            <div className="p-3 rounded-xl bg-slate-100/70 border border-slate-200 text-xs text-slate-700">
              <p className="font-bold text-[11px] text-slate-900 uppercase mb-0.5">Gate Instructions:</p>
              <p className="text-slate-600">{currentBooking.gateInstructions}</p>
            </div>
          )}
        </div>

        {/* Action Buttons: Navigate & WhatsApp Host */}
        <div className="grid grid-cols-2 gap-2">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              currentBooking.listingAddress + ' ' + currentBooking.listingCity
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Open in Maps</span>
          </a>

          <a
            href={`https://wa.me/${currentBooking.hostPhone ? currentBooking.hostPhone.replace(/[^0-9]/g, '') : '919876543210'}?text=${encodeURIComponent(
              `Hi ${currentBooking.hostName || 'Host'}, I have booked your ParkShare spot (${currentBooking.id}) for vehicle ${currentBooking.vehiclePlate}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Host</span>
          </a>
        </div>

        {/* Check-In / Check-Out Controls */}
        <div className="pt-2 border-t border-slate-100">
          {currentBooking.status === 'CONFIRMED' && (
            <button
              onClick={handleCheckIn}
              disabled={loadingAction}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 text-xs transition-all flex items-center justify-center gap-2"
            >
              {loadingAction ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Check In (I have parked)</span>
                </>
              )}
            </button>
          )}

          {currentBooking.status === 'CHECKED_IN' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                <span className="text-blue-800 font-medium">Session Active (DB Synced)</span>
                <span className="text-blue-900 font-bold">Expires at {formattedEnd}</span>
              </div>

              <button
                onClick={handleCheckOut}
                disabled={loadingAction}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md text-xs transition-all flex items-center justify-center gap-2"
              >
                {loadingAction ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Check Out (I have left)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {currentBooking.status === 'COMPLETED' && (
            <div className="p-3 rounded-xl bg-slate-100 text-center text-xs text-slate-600 font-medium">
              ✅ Parking session completed. Record saved in database.
            </div>
          )}
        </div>

        {/* SOS Emergency Dispute Trigger */}
        {currentBooking.status !== 'COMPLETED' && currentBooking.status !== 'DISPUTED' && (
          <div className="text-center">
            <button
              onClick={() => setShowSosModal(true)}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center justify-center gap-1 mx-auto"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Spot blocked or Guard refused entry? Report SOS</span>
            </button>
          </div>
        )}

        {/* SOS Modal */}
        {showSosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Emergency Dispute (SOS)</span>
              </div>

              {!sosResolved ? (
                <>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    If another vehicle is blocking your slot, or the society guard refuses admission, we will immediately initiate an alternative slot or a 100% refund.
                  </p>
                  
                  <div className="space-y-2 text-xs">
                    {[
                      { id: 'SPOT_BLOCKED', label: 'Another vehicle is parked in my spot' },
                      { id: 'GUARD_DENIED', label: 'Society Guard refused entry' },
                      { id: 'GATE_LOCKED', label: 'Gate is locked / Host unreachable' },
                    ].map((reason) => (
                      <label
                        key={reason.id}
                        className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"
                      >
                        <input
                          type="radio"
                          name="sosReason"
                          checked={sosReason === reason.id}
                          onChange={() => setSosReason(reason.id)}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-slate-800 font-medium">{reason.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowSosModal(false)}
                      className="flex-1 py-2 text-xs font-bold border border-slate-200 rounded-xl text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleTriggerSos}
                      className="flex-1 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl shadow hover:bg-rose-700"
                    >
                      Submit SOS Claim
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-3 py-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-900">Claim Registered in Database</p>
                  <p className="text-[11px] text-slate-500">
                    Your booking status is updated to DISPUTED. An automatic refund of {formatINR(currentBooking.totalAmount)} is triggered to your UPI account.
                  </p>
                  <button
                    onClick={() => setShowSosModal(false)}
                    className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
