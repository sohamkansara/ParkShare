import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { calculateDistanceKm } from '@/lib/geo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const vehicleType = searchParams.get('vehicleType');
    const category = searchParams.get('category');
    const query = searchParams.get('search');
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const radiusKm = searchParams.get('radiusKm') ? parseFloat(searchParams.get('radiusKm')!) : 5.0;

    const where: any = { isActive: true };
    if (city) where.city = city;
    if (category && category !== 'ALL') where.category = category;

    const rawListings = await db.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    let listings = rawListings.map((item) => {
      let supportedVehicles: string[] = [];
      let amenities: string[] = [];
      let images: string[] = [];

      try { supportedVehicles = JSON.parse(item.supportedVehicles); } catch {}
      try { amenities = JSON.parse(item.amenities); } catch {}
      try { images = JSON.parse(item.images); } catch {}

      const distanceKm = (lat !== null && lng !== null) 
        ? calculateDistanceKm(lat, lng, item.lat, item.lng) 
        : null;

      return {
        ...item,
        supportedVehicles,
        amenities,
        images,
        distanceKm,
      };
    });

    // Vehicle type filter
    if (vehicleType && vehicleType !== 'ALL') {
      listings = listings.filter((l) => l.supportedVehicles.includes(vehicleType));
    }

    // Text search
    if (query && query.trim()) {
      const q = query.toLowerCase();
      listings = listings.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        l.locality.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q) ||
        l.landmark.toLowerCase().includes(q)
      );
    }

    // Radius filter if coords provided
    if (lat !== null && lng !== null && radiusKm) {
      listings = listings.filter((l) => l.distanceKm !== null && l.distanceKm <= radiusKm);
      listings.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return NextResponse.json({ success: true, count: listings.length, data: listings });
  } catch (error: any) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newListing = await db.listing.create({
      data: {
        id: `ps-${Date.now()}`,
        hostId: body.hostId || 'host-1',
        hostName: body.hostName || 'Soham Host',
        hostPhone: body.hostPhone || '+91 98765 43210',
        title: body.title,
        description: body.description || '',
        category: body.category,
        address: body.address,
        city: body.city,
        locality: body.locality,
        landmark: body.landmark || '',
        lat: parseFloat(body.lat) || 12.9716,
        lng: parseFloat(body.lng) || 77.5946,
        hourlyRate: parseFloat(body.hourlyRate),
        dailyRate: parseFloat(body.dailyRate),
        capacity: parseInt(body.capacity) || 1,
        supportedVehicles: JSON.stringify(body.supportedVehicles || ['HATCHBACK']),
        amenities: JSON.stringify(body.amenities || []),
        societyName: body.societyName || null,
        flatNo: body.flatNo || null,
        gateInstructions: body.gateInstructions || '',
        images: JSON.stringify(body.images || []),
        rating: 5.0,
        reviewCount: 0,
      },
    });

    return NextResponse.json({ success: true, data: newListing }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create listing' },
      { status: 500 }
    );
  }
}
