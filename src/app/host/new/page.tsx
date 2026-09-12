'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { ParkingListing, ListingCategory, VehicleType } from '@/lib/types';
import { saveListing } from '@/lib/storage';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, MapPin, 
  Home, Building2, Car, IndianRupee, Info, Plus
} from 'lucide-react';

export default function NewListingPage() {
  const router = useRouter();

  // Wizard Step
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [city, setCity] = useState<'Bengaluru' | 'Pune' | 'Mumbai' | 'Delhi NCR'>('Bengaluru');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ListingCategory>('RESIDENTIAL_DRIVEWAY');
  const [societyName, setSocietyName] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [rwaAcknowledged, setRwaAcknowledged] = useState(false);
  const [supportedVehicles, setSupportedVehicles] = useState<VehicleType[]>(['HATCHBACK', 'SEDAN', 'TWO_WHEELER']);
  const [capacity, setCapacity] = useState<number>(1);
  const [hourlyRate, setHourlyRate] = useState<number>(50);
  const [dailyRate, setDailyRate] = useState<number>(350);
  const [gateInstructions, setGateInstructions] = useState('');
  const [amenities, setAmenities] = useState<string[]>(['CCTV', 'COVERED']);

  const toggleVehicle = (type: VehicleType) => {
    if (supportedVehicles.includes(type)) {
      if (supportedVehicles.length > 1) {
        setSupportedVehicles(supportedVehicles.filter((v) => v !== type));
      }
    } else {
      setSupportedVehicles([...supportedVehicles, type]);
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const lat = city === 'Bengaluru' ? 12.9380 : city === 'Pune' ? 18.5380 : city === 'Mumbai' ? 19.0580 : 28.4950;
    const lng = city === 'Bengaluru' ? 77.6250 : city === 'Pune' ? 73.8950 : city === 'Mumbai' ? 72.8350 : 77.0950;

    const listingPayload = {
      hostId: 'host-1',
      hostName: 'Soham Host',
      hostPhone: '+91 98765 43210',
      title: title || `${category.replace('_', ' ')} in ${locality || city}`,
      description: description || 'Safe, secure private parking with verified gate access.',
      category,
      address,
      city,
      locality: locality || city,
      landmark,
      lat,
      lng,
      hourlyRate: Number(hourlyRate),
      dailyRate: Number(dailyRate),
      capacity: Number(capacity),
      supportedVehicles,
      amenities,
      societyName: category === 'GATED_SOCIETY' ? societyName : undefined,
      flatNo: category === 'GATED_SOCIETY' ? flatNo : undefined,
      gateInstructions: gateInstructions || 'Enter gate and park in designated slot.',
      images: [
        'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
      ],
    };

    try {
      // 1. Post to backend API (Prisma / SQLite)
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingPayload),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          saveListing({
            ...json.data,
            supportedVehicles,
            amenities: amenities as any,
            images: [
              'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
            ],
            cancellationPolicy: 'FLEXIBLE',
            rating: 5.0,
            reviewCount: 0,
          });
          setIsSubmitting(false);
          router.push('/host');
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API unavailable, saving to local store:', err);
    }

    // Fallback local save
    const fallbackId = `ps-custom-${Date.now()}`;
    saveListing({
      id: fallbackId,
      ...listingPayload,
      amenities: amenities as any,
      cancellationPolicy: 'FLEXIBLE',
      isActive: true,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    });

    setIsSubmitting(false);
    router.push('/host');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/host"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Host Hub</span>
          </Link>
          <span className="text-xs font-bold text-slate-400">Step {step} of 4</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Basic & Location */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Where is your parking space located?</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter accurate location details so nearby drivers can easily find your driveway or building.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target City</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value as any)}
                      className="w-full p-3 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Pune">Pune</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Locality / Neighborhood</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Koramangala 4th Block, Koregaon Park, Bandra West"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Address</label>
                    <input
                      type="text"
                      required
                      placeholder="House / Building No., Street Name, Pincode"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Prominent Landmark</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Opposite Sony World Signal, Next to Metro Pillar 42"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!locality || !address) alert('Please fill locality and address');
                    else setStep(2);
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Continue to Space Type
                </button>
              </div>
            )}

            {/* STEP 2: Category & Society NOC */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">What type of parking space is this?</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clear categorization ensures smooth access through gates and security boom barriers.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'RESIDENTIAL_DRIVEWAY', label: 'Private Driveway', desc: 'Direct road-facing gate in independent house' },
                    { id: 'GATED_SOCIETY', label: 'Gated Society', desc: 'Apartment complex with security guard' },
                    { id: 'COMMERCIAL_BASEMENT', label: 'Commercial Lot', desc: 'Office building, shop front or basement' },
                    { id: 'VACANT_PLOT', label: 'Open Private Plot', desc: 'Vacant land or compound' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`p-4 rounded-2xl border text-left text-xs transition-all ${
                        category === cat.id
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-bold text-slate-900">{cat.label}</p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">{cat.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Society Specific Inputs & NOC Check */}
                {category === 'GATED_SOCIETY' && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-bold">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <span>Gated Society / RWA Compliance</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Society / Building Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Prestige Hermitage CHS"
                          value={societyName}
                          onChange={(e) => setSocietyName(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Flat / Unit Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Flat 504, Tower B"
                          value={flatNo}
                          onChange={(e) => setFlatNo(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                    </div>

                    <label className="flex items-start gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rwaAcknowledged}
                        onChange={(e) => setRwaAcknowledged(e.target.checked)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] text-amber-900 leading-snug">
                        I confirm that my society bylaws / RWA permit authorized guest vehicles to park in my designated slot.
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (category === 'GATED_SOCIETY' && !rwaAcknowledged) {
                        alert('Please confirm RWA / society compliance.');
                        return;
                      }
                      setStep(3);
                    }}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Continue to Capacity & Vehicles
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Vehicle Compatibility & Capacity */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Vehicle Compatibility & Amenities</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select which vehicle sizes can physically enter and park in this space.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Supported Vehicles</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'TWO_WHEELER', label: '2-Wheeler', icon: '🏍️' },
                      { id: 'HATCHBACK', label: 'Hatchback', icon: '🚗' },
                      { id: 'SEDAN', label: 'Sedan', icon: '🚘' },
                      { id: 'SUV', label: 'SUV', icon: '🚙' },
                    ].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => toggleVehicle(v.id as any)}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${
                          supportedVehicles.includes(v.id as any)
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xl block mb-1">{v.icon}</span>
                        <span>{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Simultaneous Parking Slots</label>
                  <select
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value={1}>1 Spot (Single Car or Driveway)</option>
                    <option value={2}>2 Spots</option>
                    <option value={3}>3 Spots</option>
                    <option value={5}>5 Spots (Basement / Commercial)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Amenities Available</label>
                  <div className="flex flex-wrap gap-2">
                    {['COVERED', 'CCTV', 'SECURITY_GUARD', 'EV_CHARGING', '24_7_ACCESS'].map((am) => (
                      <button
                        key={am}
                        type="button"
                        onClick={() => toggleAmenity(am)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          amenities.includes(am)
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {am.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Continue to Pricing & Gate Pass
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Pricing & Gate Instructions */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Set Pricing & Guard Instructions</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Configure your hourly pricing and exact instructions revealed to drivers upon payment.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hourly Rate (₹/hr)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min={15}
                        max={500}
                        required
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-full pl-8 p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Daily Cap (₹/day)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min={100}
                        max={5000}
                        required
                        value={dailyRate}
                        onChange={(e) => setDailyRate(Number(e.target.value))}
                        className="w-full pl-8 p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-bold text-slate-700 mb-1">
                    Instructions for Guard / Gate Access
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Quote Flat 504 to guard. Show digital pass QR. Park in slot S-12 on the left."
                    value={gateInstructions}
                    onChange={(e) => setGateInstructions(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    🔒 Stored securely in database; revealed to driver only after payment.
                  </p>
                </div>

                {/* Earnings Estimator */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-emerald-950">Estimated Monthly Earnings</p>
                    <p className="text-[11px] text-emerald-800">Based on 6 hrs/day utilization</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-emerald-900">
                      ₹{Math.round(hourlyRate * 6 * 25 * 0.9).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold">After 10% platform fee</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Publish to Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}
