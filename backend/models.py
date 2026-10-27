from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    phone_number = Column(String, unique=True, index=True)
    full_name = Column(String)
    email = Column(String, nullable=True)
    role = Column(String, default="DRIVER")  # DRIVER, HOST, ADMIN
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicles = relationship("Vehicle", back_populates="user", cascade="all, delete-orphan")
    listings = relationship("Listing", back_populates="host", cascade="all, delete-orphan")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    license_plate = Column(String, index=True)
    type = Column(String)  # TWO_WHEELER, HATCHBACK, SEDAN, SUV
    make_model = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="vehicles")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(String, primary_key=True, index=True)
    host_id = Column(String, ForeignKey("users.id"))
    host_name = Column(String)
    host_phone = Column(String)
    title = Column(String)
    description = Column(Text, default="")
    category = Column(String)  # RESIDENTIAL_DRIVEWAY, GATED_SOCIETY, COMMERCIAL_BASEMENT, VACANT_PLOT
    address = Column(String)
    city = Column(String, index=True)  # Bengaluru, Pune, Mumbai, Delhi NCR
    locality = Column(String)
    landmark = Column(String, default="")
    lat = Column(Float)
    lng = Column(Float)
    hourly_rate = Column(Float)
    daily_rate = Column(Float)
    capacity = Column(Integer, default=1)
    supported_vehicles = Column(Text)  # JSON string array
    amenities = Column(Text)  # JSON string array
    cancellation_policy = Column(String, default="FLEXIBLE")
    is_active = Column(Boolean, default=True)
    society_name = Column(String, nullable=True)
    flat_no = Column(String, nullable=True)
    gate_instructions = Column(Text, default="")
    images = Column(Text)  # JSON string array
    rating = Column(Float, default=5.0)
    review_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    host = relationship("User", back_populates="listings")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, index=True)
    listing_id = Column(String, ForeignKey("listings.id"))
    driver_id = Column(String, index=True)
    driver_name = Column(String)
    driver_phone = Column(String)
    vehicle_plate = Column(String)
    vehicle_type = Column(String)
    vehicle_model = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    actual_checkin = Column(DateTime, nullable=True)
    actual_checkout = Column(DateTime, nullable=True)
    hours = Column(Integer)
    base_fare = Column(Float)
    convenience_fee = Column(Float)
    gst_on_fee = Column(Float)
    total_amount = Column(Float)
    host_payout = Column(Float)
    status = Column(String, default="CONFIRMED")  # PENDING_PAYMENT, CONFIRMED, CHECKED_IN, OVERSTAY, COMPLETED, CANCELLED, DISPUTED
    gate_pass_code = Column(String)
    payment_method = Column(String, default="UPI")
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing", back_populates="bookings")
