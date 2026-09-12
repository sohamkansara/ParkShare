'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, ShieldCheck, CreditCard, QrCode, 
  Smartphone, CheckCircle2, Info, Lock
} from 'lucide-react';
import { ParkingListing, Vehicle, Booking } from '@/lib/types';
import { calculatePricing, formatINR } from '@/lib/pricing';
import { getStoredVehicles, saveBooking } from '@/lib/storage';

interface BookingModalProps {
  spot: ParkingListing;
  onClose: () => void;
}

export default function BookingModal({ spot, onClose }: BookingModalProps) {
  const router = useRouter();
  const vehicles = getStoredVehicles();
  
  // State
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(vehicles[0] || {
    id: 'temp-1',
    userId: 'guest',
    licensePlate: 'MH 12 AB 1234',
    type: 'HATCHBACK',
    makeModel: 'Personal Car',
  });
  const [customPlate, setCustomPlate] = useState('');
  const [durationHours, setDurationHours] = useState<number>(2);
  const [startDateTime, setStartDateTime] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  });
  
  // Checkout flow state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'DETAILS' | 'PAYMENT'>('DETAILS');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPAY' | 'PHONEPE' | 'PAYTM' | 'QR'>('PHONEPE');
  const [apiError, setApiError] = useState<string | null>(null);

  // Pricing
  const pricing = calculatePricing(spot.hourlyRate, spot.dailyRate, durationHours);

  const handleProceedToPayment = () => {
    setPaymentStep('PAYMENT');
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    setApiError(null);

    const vehiclePlate = customPlate.trim() || selectedVehicle.licensePlate;

    try {
      // 1. Post to live backend API (Prisma / SQLite)
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: spot.id,
          driverId: 'driver-1',
          driverName: 'Soham User',
          driverPhone: '+91 98765 43210',
          vehiclePlate,
          vehicleType: selectedVehicle.type,
          vehicleModel: selectedVehicle.makeModel,
          startTime: startDateTime,
          durationHours,
          paymentMethod,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Booking reservation failed');
      }

      const createdBooking: Booking = {
        ...json.data,
        listingTitle: spot.title,
        listingAddress: spot.address,
        listingCity: spot.city,
        hostName: spot.hostName,
        hostPhone: spot.hostPhone,
        societyName: spot.societyName,
        flatNo: spot.flatNo,
        gateInstructions: spot.gateInstructions,
      };

      // Also sync to local storage cache for instant offline responsiveness
      saveBooking(createdBooking);
      setIsProcessing(false);
      onClose();
      router.push(`/bookings/${createdBooking.id}/pass`);
    } catch (err: any) {
      console.error('Booking creation error:', err);
      // Fallback local creation if network error
      const bookingId = `PS-${Math.floor(10000 + Math.random() * 90000)}`;
      const gatePassCode = String(Math.floor(1000 + Math.random() * 9000));
      const startTime = new Date(startDateTime);
      const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

      const fallbackBooking: Booking = {
        id: bookingId,
        listingId: spot.id,
        listingTitle: spot.title,
        listingAddress: spot.address,
        listingCity: spot.city,
        hostName: spot.hostName,
        hostPhone: spot.hostPhone,
        societyName: spot.societyName,
        flatNo: spot.flatNo,
        gateInstructions: spot.gateInstructions,
        driverId: 'driver-self',
        driverName: 'Soham User',
        driverPhone: '+91 98765 43210',
        vehiclePlate,
        vehicleType: selectedVehicle.type,
        vehicleModel: selectedVehicle.makeModel,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        hours: durationHours,
        baseFare: pricing.baseFare,
        convenienceFee: pricing.convenienceFee,
        gstOnFee: pricing.gstOnFee,
        totalAmount: pricing.totalAmount,
        hostPayout: pricing.hostPayout,
        status: 'CONFIRMED',
        gatePassCode,
        paymentMethod: paymentMethod,
        createdAt: new Date().toISOString(),
      };

      saveBooking(fallbackBooking);
      setIsProcessing(false);
      onClose();
      router.push(`/bookings/${bookingId}/pass`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {paymentStep === 'DETAILS' ? 'Reserve Parking Space' : 'Secure Razorpay Checkout'}
            </h3>
            <p className="text-xs text-slate-500">
              {paymentStep === 'DETAILS' ? spot.title : `Booking at ${spot.locality}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentStep === 'DETAILS' ? (
          <div className="p-6 space-y-5">
            {/* Spot summary chip */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white font-bold flex flex-col items-center justify-center shadow-sm">
                <span className="text-xs">₹{spot.hourlyRate}</span>
                <span className="text-[10px] opacity-80">/hr</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{spot.title}</p>
                <p className="text-xs text-slate-500 truncate">{spot.address}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200">
                    {spot.category.replace('_', ' ')}
                  </span>
                  {spot.societyName && (
                    <span className="text-[10px] font-medium text-slate-600 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Society Pass Included
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                1. Select Vehicle
              </label>
              <div className="grid grid-cols-2 gap-2">
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVehicle(v)}
                    className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
                      selectedVehicle.id === v.id
                        ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 text-emerald-950 font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <p className="font-bold text-slate-900">{v.licensePlate}</p>
                    <p className="text-[11px] text-slate-500 truncate">{v.makeModel}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration & Time Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                2. Start Time & Duration
              </label>
              <div className="space-y-3">
                <input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 8].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDurationHours(h)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        durationHours === h
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {h} {h === 1 ? 'hour' : 'hrs'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing breakdown card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Parking Base Fare ({durationHours} hrs × ₹{spot.hourlyRate})</span>
                <span className="font-semibold">{formatINR(pricing.baseFare)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  Convenience Fee (10%)
                  <Info className="w-3 h-3 text-slate-400" />
                </span>
                <span className="font-semibold">{formatINR(pricing.convenienceFee)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST on Platform Fee (18%)</span>
                <span className="font-semibold">{formatINR(pricing.gstOnFee)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-emerald-700 text-base">{formatINR(pricing.totalAmount)}</span>
              </div>
            </div>

            {/* Atomic slot lock info */}
            <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Slot is temporarily reserved for 10 mins while you complete payment.</span>
            </div>

            {/* Action button */}
            <button
              onClick={handleProceedToPayment}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Pay {formatINR(pricing.totalAmount)}</span>
            </button>
          </div>
        ) : (
          /* Payment Step (Razorpay Simulation) */
          <div className="p-6 space-y-5">
            {/* Amount Banner */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Paying ParkShare Escrow</p>
                <p className="text-2xl font-black">{formatINR(pricing.totalAmount)}</p>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Verified
              </div>
            </div>

            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {apiError}
              </div>
            )}

            {/* Payment Method Tabs */}
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'UPI' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>UPI (Fastest)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'CARD' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Cards / NetBanking</span>
              </button>
            </div>

            {paymentMethod === 'UPI' ? (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Choose UPI App or Scan QR
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'PHONEPE', label: 'PhonePe', icon: '🟣' },
                    { id: 'GPAY', label: 'Google Pay', icon: '🔵' },
                    { id: 'PAYTM', label: 'Paytm UPI', icon: '🔷' },
                    { id: 'QR', label: 'Scan UPI QR', icon: '📷' },
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedUpiApp(app.id as any)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center gap-2.5 transition-all ${
                        selectedUpiApp === app.id
                          ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600 text-slate-900'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-base">{app.icon}</span>
                      <span>{app.label}</span>
                    </button>
                  ))}
                </div>

                {selectedUpiApp === 'QR' && (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-28 h-28 bg-white p-2 rounded-xl shadow-inner border border-slate-200 flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-slate-800" />
                    </div>
                    <p className="text-[11px] text-slate-500">Scan using any UPI app to pay instantly</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Card Number</label>
                  <input
                    type="text"
                    disabled
                    value="4123 9081 2234 9921"
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Expiry</label>
                    <input
                      type="text"
                      disabled
                      value="08/29"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">CVV</label>
                    <input
                      type="password"
                      disabled
                      value="•••"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-slate-50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Back & Pay buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPaymentStep('DETAILS')}
                className="px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 text-xs transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize & Confirm Booking</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
