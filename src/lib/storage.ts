'use client';

import { ParkingListing, Booking, Vehicle, UserRole } from './types';
import { INITIAL_LISTINGS, INITIAL_VEHICLES } from './mock-data';

const LISTINGS_KEY = 'parkshare_listings_v1';
const BOOKINGS_KEY = 'parkshare_bookings_v1';
const VEHICLES_KEY = 'parkshare_vehicles_v1';
const ROLE_KEY = 'parkshare_active_role_v1';

export function getStoredRole(): UserRole {
  if (typeof window === 'undefined') return 'DRIVER';
  const role = localStorage.getItem(ROLE_KEY) as UserRole | null;
  return role || 'DRIVER';
}

export function setStoredRole(role: UserRole): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROLE_KEY, role);
  window.dispatchEvent(new Event('parkshare_role_change'));
}

export function getStoredListings(): ParkingListing[] {
  if (typeof window === 'undefined') return INITIAL_LISTINGS;
  const stored = localStorage.getItem(LISTINGS_KEY);
  if (!stored) {
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(INITIAL_LISTINGS));
    return INITIAL_LISTINGS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_LISTINGS;
  }
}

export function saveListing(listing: ParkingListing): void {
  if (typeof window === 'undefined') return;
  const current = getStoredListings();
  const index = current.findIndex(l => l.id === listing.id);
  if (index >= 0) {
    current[index] = listing;
  } else {
    current.unshift(listing);
  }
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event('parkshare_data_change'));
}

export function getStoredBookings(): Booking[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(BOOKINGS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}

export function saveBooking(booking: Booking): void {
  if (typeof window === 'undefined') return;
  const current = getStoredBookings();
  const index = current.findIndex(b => b.id === booking.id);
  if (index >= 0) {
    current[index] = booking;
  } else {
    current.unshift(booking);
  }
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event('parkshare_data_change'));
}

export function getStoredVehicles(): Vehicle[] {
  if (typeof window === 'undefined') return INITIAL_VEHICLES;
  const stored = localStorage.getItem(VEHICLES_KEY);
  if (!stored) {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify(INITIAL_VEHICLES));
    return INITIAL_VEHICLES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_VEHICLES;
  }
}

export function saveVehicle(vehicle: Vehicle): void {
  if (typeof window === 'undefined') return;
  const current = getStoredVehicles();
  current.push(vehicle);
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(current));
  window.dispatchEvent(new Event('parkshare_data_change'));
}
