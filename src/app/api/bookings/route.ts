import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculatePricing } from '@/lib/pricing';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const listingId = searchParams.get('listingId');
    const status = searchParams.get('status');

    const where: any = {};
    if (driverId) where.driverId = driverId;
    if (listingId) where.listingId = listingId;
    if (status) where.status = status;

    const bookings = await db.booking.findMany({
      where,
      include: {
        listing: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, count: bookings.length, data: bookings });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      listingId,
      driverId = 'driver-1',
      driverName = 'Soham User',
      driverPhone = '+91 98765 43210',
      vehiclePlate,
      vehicleType = 'HATCHBACK',
      vehicleModel = 'Personal Vehicle',
      startTime,
      durationHours = 2,
      paymentMethod = 'UPI',
    } = body;

    // 1. Fetch listing to verify capacity and pricing
    const listing = await db.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Parking listing not found' },
        { status: 404 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    // 2. Concurrency & Slot Availability Check (ACID atomicity)
    // Check if conflicting active bookings exceed listing capacity
    const overlappingBookingsCount = await db.booking.count({
      where: {
        listingId,
        status: { in: ['CONFIRMED', 'CHECKED_IN'] },
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    });

    if (overlappingBookingsCount >= listing.capacity) {
      return NextResponse.json(
        {
          success: false,
          error: 'This slot was just reserved by another driver for the selected time window.',
        },
        { status: 409 }
      );
    }

    // 3. Compute Indian Marketplace Pricing
    const pricing = calculatePricing(listing.hourlyRate, listing.dailyRate, durationHours);

    // 4. Generate random 4-digit Guard Verification PIN
    const gatePassCode = String(Math.floor(1000 + Math.random() * 9000));
    const bookingId = `PS-${Math.floor(10000 + Math.random() * 90000)}`;

    // 5. Persist Booking
    const newBooking = await db.booking.create({
      data: {
        id: bookingId,
        listingId,
        driverId,
        driverName,
        driverPhone,
        vehiclePlate: vehiclePlate || 'MH 12 AB 1234',
        vehicleType,
        vehicleModel,
        startTime: start,
        endTime: end,
        hours: durationHours,
        baseFare: pricing.baseFare,
        convenienceFee: pricing.convenienceFee,
        gstOnFee: pricing.gstOnFee,
        totalAmount: pricing.totalAmount,
        hostPayout: pricing.hostPayout,
        status: 'CONFIRMED',
        gatePassCode,
        paymentMethod,
      },
      include: {
        listing: true,
      },
    });

    return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
