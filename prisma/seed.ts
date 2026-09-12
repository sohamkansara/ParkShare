import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SEED_LISTINGS = [
  // BENGALURU
  {
    id: 'ps-blr-1',
    hostId: 'host-1',
    hostName: 'Karthik Raman',
    hostPhone: '+91 98450 12345',
    title: 'Covered Stilt Spot - Koramangala 4th Block',
    description: 'Secure, covered stilt parking in an independent bungalow. Dedicated gate access, completely shaded from sun and rain. 2 minutes walk from Sony World Junction.',
    category: 'RESIDENTIAL_DRIVEWAY',
    address: 'Plot 412, 80 Feet Road, 4th Block, Koramangala',
    city: 'Bengaluru',
    locality: 'Koramangala',
    landmark: 'Behind Sony World Signal',
    lat: 12.9352,
    lng: 77.6245,
    hourlyRate: 50,
    dailyRate: 350,
    capacity: 2,
    supportedVehicles: JSON.stringify(['HATCHBACK', 'SEDAN', 'SUV', 'TWO_WHEELER']),
    amenities: JSON.stringify(['CCTV', 'COVERED', '24_7_ACCESS', 'EV_CHARGING']),
    cancellationPolicy: 'FLEXIBLE',
    isActive: true,
    gateInstructions: 'Direct driveway entry. Push the black sliding gate; remote sensor is open during booked hours.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    ]),
    rating: 4.9,
    reviewCount: 38,
  },
  {
    id: 'ps-blr-2',
    hostId: 'host-2',
    hostName: 'Ananya Deshmukh',
    hostPhone: '+91 98860 67890',
    title: 'Gated Society Visitor Slot - Indiranagar 100ft Rd',
    description: 'Pre-authorized visitor parking inside a premier gated residential society. 24x7 security guard, CCTV monitored, boom barrier access pass generated on booking.',
    category: 'GATED_SOCIETY',
    address: 'Prestige Hermitage, 100 Feet Road, HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    locality: 'Indiranagar',
    landmark: 'Opposite Toit Brewpub',
    lat: 12.9719,
    lng: 77.6412,
    hourlyRate: 60,
    dailyRate: 400,
    capacity: 1,
    supportedVehicles: JSON.stringify(['HATCHBACK', 'SEDAN', 'TWO_WHEELER']),
    amenities: JSON.stringify(['CCTV', 'SECURITY_GUARD', 'COVERED']),
    cancellationPolicy: 'MODERATE',
    isActive: true,
    societyName: 'Prestige Hermitage CHS',
    flatNo: 'Tower B - Flat 504',
    gateInstructions: 'Show Digital Entry Pass to the main gate security guard. Quote Flat 504 guest pass. Park in visitor slot V-07.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80',
    ]),
    rating: 4.8,
    reviewCount: 52,
  },
  {
    id: 'ps-blr-3',
    hostId: 'host-3',
    hostName: 'Vikas Reddy',
    hostPhone: '+91 99001 22334',
    title: 'Dedicated Two-Wheeler Hub - HSR Sector 1',
    description: 'High-speed EV charging enabled 2-wheeler parking bay. Ideal for daily commuters to Agara / Silk Board tech corridors. Ultra-affordable hourly rates.',
    category: 'COMMERCIAL_BASEMENT',
    address: 'TechSpace Plaza, 27th Main, Sector 1, HSR Layout',
    city: 'Bengaluru',
    locality: 'HSR Layout',
    landmark: 'Near HSR Police Station',
    lat: 12.9121,
    lng: 77.6446,
    hourlyRate: 20,
    dailyRate: 120,
    capacity: 5,
    supportedVehicles: JSON.stringify(['TWO_WHEELER']),
    amenities: JSON.stringify(['CCTV', 'EV_CHARGING', '24_7_ACCESS', 'SECURITY_GUARD']),
    cancellationPolicy: 'FLEXIBLE',
    isActive: true,
    gateInstructions: 'Enter ramp labeled B1. Security will scan your pass QR code. Two-wheeler bays TW-01 to TW-05.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    ]),
    rating: 4.7,
    reviewCount: 84,
  },

  // PUNE
  {
    id: 'ps-pun-1',
    hostId: 'host-4',
    hostName: 'Prashant Kulkarni',
    hostPhone: '+91 94220 88990',
    title: 'Private Bungalow Driveway - Koregaon Park Lane 5',
    description: 'Quiet, leafy private driveway in Koregaon Park. Fits any car or large SUV (Fortuner/Endeavour). Zero hassles with public parking on weekend evenings.',
    category: 'RESIDENTIAL_DRIVEWAY',
    address: 'Bungalow 18, North Main Road, Lane 5, Koregaon Park',
    city: 'Pune',
    locality: 'Koregaon Park',
    landmark: 'Near German Bakery',
    lat: 18.5362,
    lng: 73.8940,
    hourlyRate: 50,
    dailyRate: 350,
    capacity: 2,
    supportedVehicles: JSON.stringify(['HATCHBACK', 'SEDAN', 'SUV', 'TWO_WHEELER']),
    amenities: JSON.stringify(['CCTV', 'COVERED', '24_7_ACCESS']),
    cancellationPolicy: 'FLEXIBLE',
    isActive: true,
    gateInstructions: 'Main white gate will be unlatched. Park on the left side of the cobblestone driveway.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?auto=format&fit=crop&w=800&q=80',
    ]),
    rating: 5.0,
    reviewCount: 29,
  },
  {
    id: 'ps-pun-2',
    hostId: 'host-5',
    hostName: 'Meera Gokhale',
    hostPhone: '+91 98230 45678',
    title: 'FC Road Commercial Basement - Shivaji Nagar',
    description: 'Underground CCTV monitored parking spot right in the heart of Fergusson College Road. Perfect for shoppers, college students, and office meetings.',
    category: 'COMMERCIAL_BASEMENT',
    address: 'Gokhale Chambers, FC Road, Shivajinagar',
    city: 'Pune',
    locality: 'FC Road',
    landmark: 'Next to Goodluck Cafe',
    lat: 18.5284,
    lng: 73.8415,
    hourlyRate: 40,
    dailyRate: 250,
    capacity: 3,
    supportedVehicles: JSON.stringify(['HATCHBACK', 'SEDAN', 'TWO_WHEELER']),
    amenities: JSON.stringify(['CCTV', 'SECURITY_GUARD', 'COVERED']),
    cancellationPolicy: 'FLEXIBLE',
    isActive: true,
    gateInstructions: 'Enter basement from the rear lane. Guard has the live reservation roster on tablet.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    ]),
    rating: 4.8,
    reviewCount: 63,
  },

  // MUMBAI
  {
    id: 'ps-bom-1',
    hostId: 'host-6',
    hostName: 'Zainab Merchant',
    hostPhone: '+91 98200 11223',
    title: 'Bandra West Gated Compound - Hill Road',
    description: 'Rare open-air secure courtyard parking in Bandra West. 2 minutes walk from Hill Road shopping and cafes. Safe with gate security.',
    category: 'RESIDENTIAL_DRIVEWAY',
    address: 'St. Peter Compound, Near Mehboob Studio, Bandra West',
    city: 'Mumbai',
    locality: 'Bandra West',
    landmark: 'Behind Mehboob Studio',
    lat: 19.0544,
    lng: 72.8267,
    hourlyRate: 80,
    dailyRate: 500,
    capacity: 2,
    supportedVehicles: JSON.stringify(['HATCHBACK', 'SEDAN', 'SUV', 'TWO_WHEELER']),
    amenities: JSON.stringify(['CCTV', 'SECURITY_GUARD', '24_7_ACCESS']),
    cancellationPolicy: 'MODERATE',
    isActive: true,
    gateInstructions: 'Inform guard at gate: "Merchant guest parking". Show ParkShare pass.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    ]),
    rating: 4.9,
    reviewCount: 91,
  },

  // DELHI NCR
  {
    id: 'ps-del-1',
    hostId: 'host-8',
    hostName: 'Sanjay Aggarwal',
    hostPhone: '+91 98110 55443',
    title: 'DLF Phase 2 Driveway - Cyber City Metro',
    description: 'Covered portico parking in a private kothi just 300 meters from Belvedere Towers Rapid Metro and DLF Cyber City. Avoid Cyber Hub parking jams.',
    category: 'RESIDENTIAL_DRIVEWAY',
    address: 'Kothi 24, Block M, DLF Phase 2, Sector 25, Gurugram',
    city: 'Delhi NCR',
    locality: 'Cyber City, Gurgaon',
    landmark: 'Opposite Belvedere Towers Metro',
    lat: 28.4908,
    lng: 77.0912,
    hourlyRate: 60,
    dailyRate: 350,
    capacity: 2,
    supportedVehicles: JSON.stringify(['HATCHBACK', 'SEDAN', 'SUV', 'TWO_WHEELER']),
    amenities: JSON.stringify(['CCTV', 'COVERED', '24_7_ACCESS', 'SECURITY_GUARD']),
    cancellationPolicy: 'FLEXIBLE',
    isActive: true,
    gateInstructions: 'Ring bell on Gate 2 or enter directly if gate is ajar. Guard Ramu is on duty 24/7.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?auto=format&fit=crop&w=800&q=80',
    ]),
    rating: 4.8,
    reviewCount: 47,
  }
];

async function main() {
  console.log('Seeding ParkShare database...');

  // Create default host user
  const hostUser = await prisma.user.upsert({
    where: { phoneNumber: '+919876543210' },
    update: {},
    create: {
      id: 'host-1',
      phoneNumber: '+919876543210',
      fullName: 'Soham Host',
      email: 'host@parkshare.in',
      role: 'HOST',
    },
  });

  // Create other host accounts if needed
  for (let i = 2; i <= 8; i++) {
    await prisma.user.upsert({
      where: { phoneNumber: `+91980000000${i}` },
      update: {},
      create: {
        id: `host-${i}`,
        phoneNumber: `+91980000000${i}`,
        fullName: `Host User ${i}`,
        role: 'HOST',
      },
    });
  }

  // Create driver user & vehicles
  const driverUser = await prisma.user.upsert({
    where: { phoneNumber: '+919999988888' },
    update: {},
    create: {
      id: 'driver-1',
      phoneNumber: '+919999988888',
      fullName: 'Rahul Sharma (Driver)',
      email: 'rahul@example.com',
      role: 'DRIVER',
    },
  });

  await prisma.vehicle.deleteMany({ where: { userId: driverUser.id } });
  await prisma.vehicle.createMany({
    data: [
      {
        id: 'veh-1',
        userId: driverUser.id,
        licensePlate: 'MH 12 QX 4421',
        type: 'HATCHBACK',
        makeModel: 'Hyundai i20 (White)',
      },
      {
        id: 'veh-2',
        userId: driverUser.id,
        licensePlate: 'KA 05 MN 9012',
        type: 'TWO_WHEELER',
        makeModel: 'Ather 450X (Electric)',
      },
      {
        id: 'veh-3',
        userId: driverUser.id,
        licensePlate: 'DL 01 CZ 7890',
        type: 'SUV',
        makeModel: 'Tata Harrier (Dark)',
      },
    ],
  });

  // Seed listings
  for (const listing of SEED_LISTINGS) {
    await prisma.listing.upsert({
      where: { id: listing.id },
      update: listing,
      create: listing,
    });
  }

  console.log(`Seeded ${SEED_LISTINGS.length} parking listings successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
