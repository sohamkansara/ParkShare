from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

# --- Listing Schemas ---

class ListingBase(BaseModel):
    title: str
    description: Optional[str] = ""
    category: str
    address: str
    city: str
    locality: str
    landmark: Optional[str] = ""
    lat: float
    lng: float
    hourly_rate: float
    daily_rate: float
    capacity: int = 1
    supported_vehicles: List[str] = ["HATCHBACK"]
    amenities: List[str] = []
    society_name: Optional[str] = None
    flat_no: Optional[str] = None
    gate_instructions: Optional[str] = ""
    images: List[str] = []

class ListingCreate(ListingBase):
    host_id: Optional[str] = "host-1"
    host_name: Optional[str] = "Soham Host"
    host_phone: Optional[str] = "+91 98765 43210"

class ListingResponse(BaseModel):
    id: str
    host_id: str
    host_name: str
    host_phone: str
    title: str
    description: Optional[str]
    category: str
    address: str
    city: str
    locality: str
    landmark: Optional[str]
    lat: float
    lng: float
    hourly_rate: float
    daily_rate: float
    capacity: int
    supported_vehicles: List[str]
    amenities: List[str]
    cancellation_policy: str
    is_active: bool
    society_name: Optional[str]
    flat_no: Optional[str]
    gate_instructions: Optional[str]
    images: List[str]
    rating: float
    review_count: int
    created_at: datetime
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True

# --- Booking Schemas ---

class BookingCreate(BaseModel):
    listing_id: str
    driver_id: Optional[str] = "driver-1"
    driver_name: Optional[str] = "Soham User"
    driver_phone: Optional[str] = "+91 98765 43210"
    vehicle_plate: str
    vehicle_type: Optional[str] = "HATCHBACK"
    vehicle_model: Optional[str] = "Personal Vehicle"
    start_time: datetime
    duration_hours: int = 2
    payment_method: Optional[str] = "UPI"

class BookingUpdateStatus(BaseModel):
    status: str

class BookingResponse(BaseModel):
    id: str
    listing_id: str
    driver_id: str
    driver_name: str
    driver_phone: str
    vehicle_plate: str
    vehicle_type: str
    vehicle_model: str
    start_time: datetime
    end_time: datetime
    actual_checkin: Optional[datetime] = None
    actual_checkout: Optional[datetime] = None
    hours: int
    base_fare: float
    convenience_fee: float
    gst_on_fee: float
    total_amount: float
    host_payout: float
    status: str
    gate_pass_code: str
    payment_method: str
    created_at: datetime
    listing: Optional[ListingResponse] = None

    class Config:
        from_attributes = True
