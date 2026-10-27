import json
import random
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from .database import engine, Base, get_db
from . import models, schemas
from .services.pricing import calculate_pricing
from .services.geo import calculate_distance_km

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ParkShare India API",
    description="Python FastAPI backend for private parking space discovery, atomic reservations, and society passes.",
    version="2.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "status": "online",
        "service": "ParkShare Python API",
        "docs": "/docs",
        "version": "2.0.0",
    }


# --- LISTING ENDPOINTS ---

@app.get("/api/listings")
def get_listings(
    city: Optional[str] = None,
    vehicleType: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radiusKm: Optional[float] = 5.0,
    db: Session = Depends(get_db),
):
    query = db.query(models.Listing).filter(models.Listing.is_active == True)

    if city:
        query = query.filter(models.Listing.city == city)
    if category and category != "ALL":
        query = query.filter(models.Listing.category == category)

    raw_listings = query.order_by(models.Listing.created_at.desc()).all()
    results = []

    for item in raw_listings:
        try:
            supported = json.loads(item.supported_vehicles)
        except Exception:
            supported = []
        try:
            amenities = json.loads(item.amenities)
        except Exception:
            amenities = []
        try:
            images = json.loads(item.images)
        except Exception:
            images = []

        # Vehicle filter
        if vehicleType and vehicleType != "ALL" and vehicleType not in supported:
            continue

        # Text search
        if search and search.strip():
            q = search.lower()
            if not (
                q in item.title.lower()
                or q in item.locality.lower()
                or q in item.address.lower()
                or (item.landmark and q in item.landmark.lower())
            ):
                continue

        # Haversine Distance
        distance_km = None
        if lat is not None and lng is not None:
            distance_km = calculate_distance_km(lat, lng, item.lat, item.lng)
            if radiusKm and distance_km > radiusKm:
                continue

        data = {
            "id": item.id,
            "host_id": item.host_id,
            "host_name": item.host_name,
            "host_phone": item.host_phone,
            "title": item.title,
            "description": item.description,
            "category": item.category,
            "address": item.address,
            "city": item.city,
            "locality": item.locality,
            "landmark": item.landmark,
            "lat": item.lat,
            "lng": item.lng,
            "hourly_rate": item.hourly_rate,
            "daily_rate": item.daily_rate,
            "capacity": item.capacity,
            "supported_vehicles": supported,
            "amenities": amenities,
            "cancellation_policy": item.cancellation_policy,
            "is_active": item.is_active,
            "society_name": item.society_name,
            "flat_no": item.flat_no,
            "gate_instructions": item.gate_instructions,
            "images": images,
            "rating": item.rating,
            "review_count": item.review_count,
            "created_at": item.created_at,
            "distance_km": distance_km,
            # Frontend camelCase compatibility
            "hourlyRate": item.hourly_rate,
            "dailyRate": item.daily_rate,
            "hostId": item.host_id,
            "hostName": item.host_name,
            "hostPhone": item.host_phone,
            "supportedVehicles": supported,
            "societyName": item.society_name,
            "flatNo": item.flat_no,
            "gateInstructions": item.gate_instructions,
            "reviewCount": item.review_count,
            "isActive": item.is_active,
            "cancellationPolicy": item.cancellation_policy,
            "distanceKm": distance_km,
        }
        results.append(data)

    if lat is not None and lng is not None:
        results.sort(key=lambda x: x["distance_km"] or 9999)

    return {"success": True, "count": len(results), "data": results}


@app.post("/api/listings", status_code=status.HTTP_201_CREATED)
def create_listing(listing_in: schemas.ListingCreate, db: Session = Depends(get_db)):
    listing_id = f"ps-{int(datetime.utcnow().timestamp() * 1000)}"

    db_listing = models.Listing(
        id=listing_id,
        host_id=listing_in.host_id or "host-1",
        host_name=listing_in.host_name or "Soham Host",
        host_phone=listing_in.host_phone or "+91 98765 43210",
        title=listing_in.title,
        description=listing_in.description or "",
        category=listing_in.category,
        address=listing_in.address,
        city=listing_in.city,
        locality=listing_in.locality,
        landmark=listing_in.landmark or "",
        lat=listing_in.lat,
        lng=listing_in.lng,
        hourly_rate=listing_in.hourly_rate,
        daily_rate=listing_in.daily_rate,
        capacity=listing_in.capacity,
        supported_vehicles=json.dumps(listing_in.supported_vehicles),
        amenities=json.dumps(listing_in.amenities),
        cancellation_policy="FLEXIBLE",
        is_active=True,
        society_name=listing_in.society_name,
        flat_no=listing_in.flat_no,
        gate_instructions=listing_in.gate_instructions or "",
        images=json.dumps(listing_in.images or []),
        rating=5.0,
        review_count=0,
    )

    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)

    return {"success": True, "data": db_listing}


# --- BOOKING ENDPOINTS ---

@app.get("/api/bookings")
def get_bookings(
    driverId: Optional[str] = None,
    listingId: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(models.Booking)

    if driverId:
        query = query.filter(models.Booking.driver_id == driverId)
    if listingId:
        query = query.filter(models.Booking.listing_id == listingId)
    if status:
        query = query.filter(models.Booking.status == status)

    bookings = query.order_by(models.Booking.created_at.desc()).all()
    results = []

    for b in bookings:
        listing = b.listing
        results.append({
            "id": b.id,
            "listingId": b.listing_id,
            "listingTitle": listing.title if listing else "Parking Spot",
            "listingAddress": listing.address if listing else "",
            "listingCity": listing.city if listing else "Bengaluru",
            "hostName": listing.host_name if listing else "Host",
            "hostPhone": listing.host_phone if listing else "+91 98765 43210",
            "societyName": listing.society_name if listing else None,
            "flatNo": listing.flat_no if listing else None,
            "gateInstructions": listing.gate_instructions if listing else "",
            "driverId": b.driver_id,
            "driverName": b.driver_name,
            "driverPhone": b.driver_phone,
            "vehiclePlate": b.vehicle_plate,
            "vehicleType": b.vehicle_type,
            "vehicleModel": b.vehicle_model,
            "startTime": b.start_time.isoformat(),
            "endTime": b.end_time.isoformat(),
            "actualCheckin": b.actual_checkin.isoformat() if b.actual_checkin else None,
            "actualCheckout": b.actual_checkout.isoformat() if b.actual_checkout else None,
            "hours": b.hours,
            "baseFare": b.base_fare,
            "convenienceFee": b.convenience_fee,
            "gstOnFee": b.gst_on_fee,
            "totalAmount": b.total_amount,
            "hostPayout": b.host_payout,
            "status": b.status,
            "gatePassCode": b.gate_pass_code,
            "paymentMethod": b.payment_method,
            "createdAt": b.created_at.isoformat(),
        })

    return {"success": True, "count": len(results), "data": results}


@app.post("/api/bookings", status_code=status.HTTP_201_CREATED)
def create_booking(booking_in: schemas.BookingCreate, db: Session = Depends(get_db)):
    # 1. Fetch listing
    listing = db.query(models.Listing).filter(models.Listing.id == booking_in.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Parking listing not found")

    start = booking_in.start_time
    # If start_time is naive, assume UTC
    if start.tzinfo is not None:
        start = start.replace(tzinfo=None)

    end = start + timedelta(hours=booking_in.duration_hours)

    # 2. Concurrency Check (ACID atomicity)
    conflicting = (
        db.query(models.Booking)
        .filter(
            models.Booking.listing_id == booking_in.listing_id,
            models.Booking.status.in_(["CONFIRMED", "CHECKED_IN"]),
            models.Booking.start_time < end,
            models.Booking.end_time > start,
        )
        .count()
    )

    if conflicting >= listing.capacity:
        raise HTTPException(
            status_code=409,
            detail="This slot was just reserved by another driver for the selected time window.",
        )

    # 3. Calculate Indian Pricing
    pricing = calculate_pricing(listing.hourly_rate, listing.daily_rate, booking_in.duration_hours)

    # 4. Generate 4-digit Guard PIN
    gate_pass_code = str(random.randint(1000, 9999))
    booking_id = f"PS-{random.randint(10000, 99990)}"

    db_booking = models.Booking(
        id=booking_id,
        listing_id=listing.id,
        driver_id=booking_in.driver_id or "driver-1",
        driver_name=booking_in.driver_name or "Soham User",
        driver_phone=booking_in.driver_phone or "+91 98765 43210",
        vehicle_plate=booking_in.vehicle_plate,
        vehicle_type=booking_in.vehicle_type or "HATCHBACK",
        vehicle_model=booking_in.vehicle_model or "Personal Car",
        start_time=start,
        end_time=end,
        hours=booking_in.duration_hours,
        base_fare=pricing["base_fare"],
        convenience_fee=pricing["convenience_fee"],
        gst_on_fee=pricing["gst_on_fee"],
        total_amount=pricing["total_amount"],
        host_payout=pricing["host_payout"],
        status="CONFIRMED",
        gate_pass_code=gate_pass_code,
        payment_method=booking_in.payment_method or "UPI",
    )

    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    return {
        "success": True,
        "data": {
            "id": db_booking.id,
            "listingId": listing.id,
            "listingTitle": listing.title,
            "listingAddress": listing.address,
            "listingCity": listing.city,
            "hostName": listing.host_name,
            "hostPhone": listing.host_phone,
            "societyName": listing.society_name,
            "flatNo": listing.flat_no,
            "gateInstructions": listing.gate_instructions,
            "driverId": db_booking.driver_id,
            "driverName": db_booking.driver_name,
            "driverPhone": db_booking.driver_phone,
            "vehiclePlate": db_booking.vehicle_plate,
            "vehicleType": db_booking.vehicle_type,
            "vehicleModel": db_booking.vehicle_model,
            "startTime": db_booking.start_time.isoformat(),
            "endTime": db_booking.end_time.isoformat(),
            "hours": db_booking.hours,
            "baseFare": db_booking.base_fare,
            "convenienceFee": db_booking.convenience_fee,
            "gstOnFee": db_booking.gst_on_fee,
            "totalAmount": db_booking.total_amount,
            "hostPayout": db_booking.host_payout,
            "status": db_booking.status,
            "gatePassCode": db_booking.gate_pass_code,
            "paymentMethod": db_booking.payment_method,
            "createdAt": db_booking.created_at.isoformat(),
        },
    }


@app.get("/api/bookings/{booking_id}")
def get_booking(booking_id: str, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    listing = booking.listing
    return {
        "success": True,
        "data": {
            "id": booking.id,
            "listingId": booking.listing_id,
            "listingTitle": listing.title if listing else "Parking Spot",
            "listingAddress": listing.address if listing else "",
            "listingCity": listing.city if listing else "Bengaluru",
            "hostName": listing.host_name if listing else "Host",
            "hostPhone": listing.host_phone if listing else "+91 98765 43210",
            "societyName": listing.society_name if listing else None,
            "flatNo": listing.flat_no if listing else None,
            "gateInstructions": listing.gate_instructions if listing else "",
            "driverId": booking.driver_id,
            "driverName": booking.driver_name,
            "driverPhone": booking.driver_phone,
            "vehiclePlate": booking.vehicle_plate,
            "vehicleType": booking.vehicle_type,
            "vehicleModel": booking.vehicle_model,
            "startTime": booking.start_time.isoformat(),
            "endTime": booking.end_time.isoformat(),
            "actualCheckin": booking.actual_checkin.isoformat() if booking.actual_checkin else None,
            "actualCheckout": booking.actual_checkout.isoformat() if booking.actual_checkout else None,
            "hours": booking.hours,
            "baseFare": booking.base_fare,
            "convenienceFee": booking.convenience_fee,
            "gstOnFee": booking.gst_on_fee,
            "totalAmount": booking.total_amount,
            "hostPayout": booking.host_payout,
            "status": booking.status,
            "gatePassCode": booking.gate_pass_code,
            "paymentMethod": booking.payment_method,
            "createdAt": booking.created_at.isoformat(),
        },
    }


@app.patch("/api/bookings/{booking_id}")
def update_booking_status(
    booking_id: str,
    update_in: schemas.BookingUpdateStatus,
    db: Session = Depends(get_db),
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    new_status = update_in.status
    booking.status = new_status
    if new_status == "CHECKED_IN":
        booking.actual_checkin = datetime.utcnow()
    elif new_status == "COMPLETED":
        booking.actual_checkout = datetime.utcnow()

    db.commit()
    db.refresh(booking)

    return {
        "success": True,
        "data": {
            "id": booking.id,
            "status": booking.status,
            "actualCheckin": booking.actual_checkin.isoformat() if booking.actual_checkin else None,
            "actualCheckout": booking.actual_checkout.isoformat() if booking.actual_checkout else None,
        },
    }


# --- DATABASE SEED ENDPOINT ---

@app.post("/api/seed")
def seed_database(db: Session = Depends(get_db)):
    SEED_DATA = [
        {
            "id": "ps-blr-1",
            "host_id": "host-1",
            "host_name": "Karthik Raman",
            "host_phone": "+91 98450 12345",
            "title": "Covered Stilt Spot - Koramangala 4th Block",
            "description": "Secure, covered stilt parking in an independent bungalow. Dedicated gate access, completely shaded from sun and rain. 2 minutes walk from Sony World Junction.",
            "category": "RESIDENTIAL_DRIVEWAY",
            "address": "Plot 412, 80 Feet Road, 4th Block, Koramangala",
            "city": "Bengaluru",
            "locality": "Koramangala",
            "landmark": "Behind Sony World Signal",
            "lat": 12.9352,
            "lng": 77.6245,
            "hourly_rate": 50.0,
            "daily_rate": 350.0,
            "capacity": 2,
            "supported_vehicles": json.dumps(["HATCHBACK", "SEDAN", "SUV", "TWO_WHEELER"]),
            "amenities": json.dumps(["CCTV", "COVERED", "24_7_ACCESS", "EV_CHARGING"]),
            "cancellation_policy": "FLEXIBLE",
            "is_active": True,
            "gate_instructions": "Direct driveway entry. Push the black sliding gate; remote sensor is open during booked hours.",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
            ]),
            "rating": 4.9,
            "review_count": 38,
        },
        {
            "id": "ps-blr-2",
            "host_id": "host-2",
            "host_name": "Ananya Deshmukh",
            "host_phone": "+91 98860 67890",
            "title": "Gated Society Visitor Slot - Indiranagar 100ft Rd",
            "description": "Pre-authorized visitor parking inside a premier gated residential society. 24x7 security guard, CCTV monitored, boom barrier access pass generated on booking.",
            "category": "GATED_SOCIETY",
            "address": "Prestige Hermitage, 100 Feet Road, HAL 2nd Stage, Indiranagar",
            "city": "Bengaluru",
            "locality": "Indiranagar",
            "landmark": "Opposite Toit Brewpub",
            "lat": 12.9719,
            "lng": 77.6412,
            "hourly_rate": 60.0,
            "daily_rate": 400.0,
            "capacity": 1,
            "supported_vehicles": json.dumps(["HATCHBACK", "SEDAN", "TWO_WHEELER"]),
            "amenities": json.dumps(["CCTV", "SECURITY_GUARD", "COVERED"]),
            "cancellation_policy": "MODERATE",
            "is_active": True,
            "society_name": "Prestige Hermitage CHS",
            "flat_no": "Tower B - Flat 504",
            "gate_instructions": "Show Digital Entry Pass to the main gate security guard. Quote Flat 504 guest pass. Park in visitor slot V-07.",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80",
            ]),
            "rating": 4.8,
            "review_count": 52,
        },
        {
            "id": "ps-blr-3",
            "host_id": "host-3",
            "host_name": "Vikas Reddy",
            "host_phone": "+91 99001 22334",
            "title": "Dedicated Two-Wheeler Hub - HSR Sector 1",
            "description": "High-speed EV charging enabled 2-wheeler parking bay. Ideal for daily commuters to Agara / Silk Board tech corridors. Ultra-affordable hourly rates.",
            "category": "COMMERCIAL_BASEMENT",
            "address": "TechSpace Plaza, 27th Main, Sector 1, HSR Layout",
            "city": "Bengaluru",
            "locality": "HSR Layout",
            "landmark": "Near HSR Police Station",
            "lat": 12.9121,
            "lng": 77.6446,
            "hourly_rate": 20.0,
            "daily_rate": 120.0,
            "capacity": 5,
            "supported_vehicles": json.dumps(["TWO_WHEELER"]),
            "amenities": json.dumps(["CCTV", "EV_CHARGING", "24_7_ACCESS", "SECURITY_GUARD"]),
            "cancellation_policy": "FLEXIBLE",
            "is_active": True,
            "gate_instructions": "Enter ramp labeled B1. Security will scan your pass QR code. Two-wheeler bays TW-01 to TW-05.",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
            ]),
            "rating": 4.7,
            "review_count": 84,
        },
        {
            "id": "ps-pun-1",
            "host_id": "host-4",
            "host_name": "Prashant Kulkarni",
            "host_phone": "+91 94220 88990",
            "title": "Private Bungalow Driveway - Koregaon Park Lane 5",
            "description": "Quiet, leafy private driveway in Koregaon Park. Fits any car or large SUV (Fortuner/Endeavour). Zero hassles with public parking on weekend evenings.",
            "category": "RESIDENTIAL_DRIVEWAY",
            "address": "Bungalow 18, North Main Road, Lane 5, Koregaon Park",
            "city": "Pune",
            "locality": "Koregaon Park",
            "landmark": "Near German Bakery",
            "lat": 18.5362,
            "lng": 73.8940,
            "hourly_rate": 50.0,
            "daily_rate": 350.0,
            "capacity": 2,
            "supported_vehicles": json.dumps(["HATCHBACK", "SEDAN", "SUV", "TWO_WHEELER"]),
            "amenities": json.dumps(["CCTV", "COVERED", "24_7_ACCESS"]),
            "cancellation_policy": "FLEXIBLE",
            "is_active": True,
            "gate_instructions": "Main white gate will be unlatched. Park on the left side of the cobblestone driveway.",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?auto=format&fit=crop&w=800&q=80",
            ]),
            "rating": 5.0,
            "review_count": 29,
        },
        {
            "id": "ps-pun-2",
            "host_id": "host-5",
            "host_name": "Meera Gokhale",
            "host_phone": "+91 98230 45678",
            "title": "FC Road Commercial Basement - Shivaji Nagar",
            "description": "Underground CCTV monitored parking spot right in the heart of Fergusson College Road. Perfect for shoppers, college students, and office meetings.",
            "category": "COMMERCIAL_BASEMENT",
            "address": "Gokhale Chambers, FC Road, Shivajinagar",
            "city": "Pune",
            "locality": "FC Road",
            "landmark": "Next to Goodluck Cafe",
            "lat": 18.5284,
            "lng": 73.8415,
            "hourly_rate": 40.0,
            "daily_rate": 250.0,
            "capacity": 3,
            "supported_vehicles": json.dumps(["HATCHBACK", "SEDAN", "TWO_WHEELER"]),
            "amenities": json.dumps(["CCTV", "SECURITY_GUARD", "COVERED"]),
            "cancellation_policy": "FLEXIBLE",
            "is_active": True,
            "gate_instructions": "Enter basement from the rear lane. Guard has the live reservation roster on tablet.",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80",
            ]),
            "rating": 4.8,
            "review_count": 63,
        },
        {
            "id": "ps-bom-1",
            "host_id": "host-6",
            "host_name": "Zainab Merchant",
            "host_phone": "+91 98200 11223",
            "title": "Bandra West Gated Compound - Hill Road",
            "description": "Rare open-air secure courtyard parking in Bandra West. 2 minutes walk from Hill Road shopping and cafes. Safe with gate security.",
            "category": "RESIDENTIAL_DRIVEWAY",
            "address": "St. Peter Compound, Near Mehboob Studio, Bandra West",
            "city": "Mumbai",
            "locality": "Bandra West",
            "landmark": "Behind Mehboob Studio",
            "lat": 19.0544,
            "lng": 72.8267,
            "hourly_rate": 80.0,
            "daily_rate": 500.0,
            "capacity": 2,
            "supported_vehicles": json.dumps(["HATCHBACK", "SEDAN", "SUV", "TWO_WHEELER"]),
            "amenities": json.dumps(["CCTV", "SECURITY_GUARD", "24_7_ACCESS"]),
            "cancellation_policy": "MODERATE",
            "is_active": True,
            "gate_instructions": "Inform guard at gate: 'Merchant guest parking'. Show ParkShare pass.",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80",
            ]),
            "rating": 4.9,
            "review_count": 91,
        },
        {
            "id": "ps-del-1",
            "host_id": "host-8",
            "host_name": "Sanjay Aggarwal",
            "host_phone": "+91 98110 55443",
            "title": "DLF Phase 2 Driveway - Cyber City Metro",
            "description": "Covered portico parking in a private kothi just 300 meters from Belvedere Towers Rapid Metro and DLF Cyber City. Avoid Cyber Hub parking jams.",
            "category": "RESIDENTIAL_DRIVEWAY",
            "address": "Kothi 24, Block M, DLF Phase 2, Sector 25, Gurugram",
            "city": "Delhi NCR",
            "locality": "Cyber City, Gurgaon",
            "landmark": "Opposite Belvedere Towers Metro",
            "lat": 28.4908,
            "lng": 77.0912,
            "hourly_rate": 60.0,
            "daily_rate": 350.0,
            "capacity": 2,
            "supported_vehicles": json.dumps(["HATCHBACK", "SEDAN", "SUV", "TWO_WHEELER"]),
            "amenities": json.dumps(["CCTV", "COVERED", "24_7_ACCESS", "SECURITY_GUARD"]),
            "cancellation_policy": "FLEXIBLE",
            "is_active": True,
            "gate_instructions": "Ring bell on Gate 2 or enter directly if gate is ajar. Guard Ramu is on duty 24/7.",
            "images": json.dumps([
                "https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?auto=format&fit=crop&w=800&q=80",
            ]),
            "rating": 4.8,
            "review_count": 47,
        }
    ]

    for item in SEED_DATA:
        existing = db.query(models.Listing).filter(models.Listing.id == item["id"]).first()
        if not existing:
            listing = models.Listing(**item)
            db.add(listing)

    db.commit()
    return {"success": True, "message": f"Seeded {len(SEED_DATA)} listings successfully into Python database."}
