export type UserRole = 'DRIVER' | 'HOST' | 'ADMIN';

export type VehicleType = 'TWO_WHEELER' | 'HATCHBACK' | 'SEDAN' | 'SUV';

export interface Vehicle {
  id: string;
  userId: string;
  licensePlate: string; // e.g. MH 12 AB 1234
  type: VehicleType;
  makeModel: string; // e.g. Ather 450X, Hyundai Creta
}

export type ListingCategory = 
  | 'RESIDENTIAL_DRIVEWAY' 
  | 'GATED_SOCIETY' 
  | 'COMMERCIAL_BASEMENT' 
  | 'VACANT_PLOT';

export interface ParkingListing {
  id: string;
  hostId: string;
  hostName: string;
  hostPhone: string;
  title: string;
  description: string;
  category: ListingCategory;
  address: string;
  city: 'Bengaluru' | 'Pune' | 'Mumbai' | 'Delhi NCR';
  locality: string;
  landmark: string;
  lat: number;
  lng: number;
  hourlyRate: number; // In INR (₹)
  dailyRate: number; // Cap for >6 hours
  capacity: number; // Number of available parking slots
  supportedVehicles: VehicleType[];
  amenities: ('CCTV' | 'SECURITY_GUARD' | 'EV_CHARGING' | 'COVERED' | '24_7_ACCESS')[];
  cancellationPolicy: 'FLEXIBLE' | 'MODERATE';
  isActive: boolean;
  societyName?: string;
  flatNo?: string;
  gateInstructions: string; // Shown only after booking
  images: string[];
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'OVERSTAY'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingAddress: string;
  listingCity: string;
  hostName: string;
  hostPhone: string;
  societyName?: string;
  flatNo?: string;
  gateInstructions?: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  actualCheckin?: string;
  actualCheckout?: string;
  hours: number;
  baseFare: number;
  convenienceFee: number;
  gstOnFee: number;
  totalAmount: number;
  hostPayout: number;
  status: BookingStatus;
  gatePassCode: string; // 4-digit verification PIN
  paymentMethod: 'UPI' | 'CARD' | 'WALLET';
  createdAt: string;
}

export interface PriceBreakdown {
  hours: number;
  baseFare: number;
  convenienceFee: number;
  gstOnFee: number;
  totalAmount: number;
  hostPayout: number;
  platformTakeRate: number;
}
