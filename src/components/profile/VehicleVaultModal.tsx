'use client';

import React, { useState } from 'react';
import { X, Plus, Car, Trash2, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { Vehicle, VehicleType, UserRole } from '@/lib/types';
import { getStoredVehicles, saveVehicle, getStoredRole, setStoredRole } from '@/lib/storage';

interface VehicleVaultModalProps {
  onClose: () => void;
  onVehicleSelected?: (vehicle: Vehicle) => void;
}

const INDIAN_RTO_REGEX = /^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$/;

const PRESET_MODELS: Record<VehicleType, string[]> = {
  TWO_WHEELER: ['Ather 450X Electric', 'Ola S1 Pro', 'Honda Activa 6G', 'TVS Jupiter', 'Royal Enfield Classic 350'],
  HATCHBACK: ['Maruti Suzuki Swift', 'Hyundai i20', 'Tata Tiago', 'Maruti Baleno'],
  SEDAN: ['Honda City', 'Hyundai Verna', 'Skoda Slavia', 'Volkswagen Virtus'],
  SUV: ['Hyundai Creta', 'Tata Nexon', 'Kia Seltos', 'Toyota Fortuner', 'Mahindra XUV700'],
};

export default function VehicleVaultModal({ onClose, onVehicleSelected }: VehicleVaultModalProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getStoredVehicles());
  const [activeRole, setActiveRole] = useState<UserRole>(() => getStoredRole());
  
  // New vehicle form state
  const [isAdding, setIsAdding] = useState(false);
  const [vehicleType, setVehicleType] = useState<VehicleType>('HATCHBACK');
  const [licensePlate, setLicensePlate] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [plateError, setPlateError] = useState('');

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlate = licensePlate.toUpperCase().replace(/\s+/g, '');

    if (!cleanPlate) {
      setPlateError('Please enter license plate number');
      return;
    }

    if (!INDIAN_RTO_REGEX.test(cleanPlate)) {
      setPlateError('Invalid format. Example: MH12AB1234 or DL01CZ7890');
      return;
    }

    // Format with spaces for readability: MH 12 AB 1234
    const formattedPlate = `${cleanPlate.slice(0, 2)} ${cleanPlate.slice(2, 4)} ${cleanPlate.slice(4, -4)} ${cleanPlate.slice(-4)}`;

    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      userId: 'driver-self',
      licensePlate: formattedPlate,
      type: vehicleType,
      makeModel: makeModel || PRESET_MODELS[vehicleType][0],
    };

    saveVehicle(newVehicle);
    const updated = getStoredVehicles();
    setVehicles(updated);
    setIsAdding(false);
    setLicensePlate('');
    setMakeModel('');
    setPlateError('');
  };

  const handleRoleToggle = (newRole: UserRole) => {
    setActiveRole(newRole);
    setStoredRole(newRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-900">Vehicle Vault & Profile</h3>
            <p className="text-xs text-slate-500">Manage registered vehicles for instant parking access</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Role Mode Card */}
          <div className="p-3.5 rounded-2xl bg-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900">Current Role Mode</p>
              <p className="text-[11px] text-slate-500">Switch between booking and hosting</p>
            </div>
            <div className="flex gap-1 bg-white p-1 rounded-xl shadow-xs border border-slate-200">
              <button
                onClick={() => handleRoleToggle('DRIVER')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeRole === 'DRIVER' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Driver
              </button>
              <button
                onClick={() => handleRoleToggle('HOST')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeRole === 'HOST' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Host
              </button>
            </div>
          </div>

          {/* Registered Vehicles List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Registered Vehicles ({vehicles.length})
              </h4>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Vehicle</span>
                </button>
              )}
            </div>

            {vehicles.map((v, i) => (
              <div
                key={v.id}
                onClick={() => {
                  if (onVehicleSelected) {
                    onVehicleSelected(v);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  i === 0
                    ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {v.type === 'TWO_WHEELER' ? '🏍️' : v.type === 'SUV' ? '🚙' : '🚗'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-bold text-slate-900">{v.licensePlate}</p>
                      {i === 0 && (
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{v.makeModel}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                    {v.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Vehicle Form */}
          {isAdding && (
            <form onSubmit={handleAddVehicle} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Add New Vehicle</h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>

              {/* Type Selection */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { type: 'TWO_WHEELER', label: '2-Wheeler', icon: '🏍️' },
                  { type: 'HATCHBACK', label: 'Hatch', icon: '🚗' },
                  { type: 'SEDAN', label: 'Sedan', icon: '🚘' },
                  { type: 'SUV', label: 'SUV', icon: '🚙' },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setVehicleType(item.type as any);
                      setMakeModel(PRESET_MODELS[item.type as VehicleType][0]);
                    }}
                    className={`py-2 px-1 text-center rounded-xl border text-[11px] font-bold transition-all ${
                      vehicleType === item.type
                        ? 'border-emerald-600 bg-white text-emerald-950 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span className="text-sm block">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* License Plate Input with Indian RTO Validation */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Indian RTO Number Plate
                </label>
                <input
                  type="text"
                  placeholder="e.g. MH12AB1234 or KA05MN9012"
                  value={licensePlate}
                  onChange={(e) => {
                    setLicensePlate(e.target.value.toUpperCase());
                    setPlateError('');
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold uppercase bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                {plateError && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{plateError}</span>
                  </p>
                )}
              </div>

              {/* Make & Model with Quick Preset Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Make & Model
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ather 450X, Hyundai Creta"
                  value={makeModel}
                  onChange={(e) => setMakeModel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none mb-2"
                />
                <div className="flex flex-wrap gap-1">
                  {PRESET_MODELS[vehicleType].slice(0, 3).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMakeModel(preset)}
                      className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-[10px] text-slate-700 font-medium transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all"
              >
                Save Vehicle to Vault
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
