from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"

class LoginRequest(BaseModel):
    email: str
    password: str

class PasswordResetRequest(BaseModel):
    user_id: int
    new_password: str

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    employee_id: str
    role: str
    municipality_id: Optional[int] = None
    assigned_area: Optional[str] = None
    phone_number: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    employee_id: Optional[str] = None
    role: Optional[str] = None
    municipality_id: Optional[int] = None
    assigned_area: Optional[str] = None
    phone_number: Optional[str] = None
    status: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    last_login: Optional[datetime] = None
    municipality_name: Optional[str] = None

    class Config:
        from_attributes = True

# Municipality Schemas
class MunicipalityBase(BaseModel):
    name: str
    code: str
    state: str
    country: str = "India"
    total_area_sqkm: float = 150.0
    population: int = 500000
    contact_email: Optional[str] = None

class MunicipalityCreate(MunicipalityBase):
    pass

class MunicipalityResponse(MunicipalityBase):
    id: int
    created_at: datetime
    total_bins: Optional[int] = 0
    active_collectors: Optional[int] = 0

    class Config:
        from_attributes = True

# Smart Bin Schemas
class SmartBinBase(BaseModel):
    bin_code: str
    municipality_id: int
    location_name: str
    latitude: float
    longitude: float
    waste_category: str = "Mixed Waste"
    fill_level: float = 0.0
    max_capacity_liters: float = 240.0
    status: str = "NORMAL"
    battery_level: float = 95.0
    temperature_c: float = 26.5
    weight_kg: float = 12.0

class SmartBinCreate(SmartBinBase):
    pass

class SmartBinUpdate(BaseModel):
    location_name: Optional[str] = None
    waste_category: Optional[str] = None
    fill_level: Optional[float] = None
    status: Optional[str] = None
    battery_level: Optional[float] = None
    temperature_c: Optional[float] = None
    weight_kg: Optional[float] = None

class SmartBinResponse(SmartBinBase):
    id: int
    last_collection_time: Optional[datetime] = None
    updated_at: datetime
    municipality_name: Optional[str] = None

    class Config:
        from_attributes = True

# Collection Task Schemas
class CollectionTaskBase(BaseModel):
    municipality_id: int
    collector_id: int
    vehicle_id: Optional[int] = None
    route_id: Optional[int] = None
    area_name: str = "Sector 1"
    priority: str = "MEDIUM"
    notes: Optional[str] = None

class CollectionTaskCreate(CollectionTaskBase):
    pass

class CollectionTaskStatusUpdate(BaseModel):
    status: str  # Assigned, Accepted, In Progress, Collected, Completed
    notes: Optional[str] = None
    proof_image_url: Optional[str] = None
    bins_collected: Optional[List[int]] = None

class CollectionTaskResponse(CollectionTaskBase):
    id: int
    task_code: str
    status: str
    assigned_at: datetime
    accepted_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    proof_image_url: Optional[str] = None
    collector_name: Optional[str] = None
    vehicle_plate: Optional[str] = None
    route_name: Optional[str] = None
    municipality_name: Optional[str] = None

    class Config:
        from_attributes = True

# Classification Schemas
class ClassificationResponse(BaseModel):
    id: Optional[int] = None
    binary_category: str  # Biodegradable, Non-Biodegradable
    broad_category: str   # Plastic, Organic, Paper, Metal, Glass, E-Waste, Textile, Hazardous, Medical
    fine_class: str       # e.g., PET Plastic Bottle
    confidence_score: float
    disposal_guide: str
    recycling_guide: str
    model_mode: str = "DEMO_INFERENCE_PIPELINE"  # Real/Demo indicator
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None

# Route Optimization Schemas
class RouteOptimizeRequest(BaseModel):
    municipality_id: int
    bin_ids: List[int]
    vehicle_id: Optional[int] = None
    collector_id: Optional[int] = None
    start_lat: Optional[float] = None
    start_lng: Optional[float] = None

class RouteWaypoint(BaseModel):
    order: int
    bin_id: int
    bin_code: str
    location_name: str
    latitude: float
    longitude: float
    fill_level: float
    waste_category: str

class RouteOptimizeResponse(BaseModel):
    route_code: str
    total_bins: int
    estimated_distance_km: float
    estimated_time_minutes: int
    waypoints: List[RouteWaypoint]
    standard_distance_km: float
    distance_saved_km: float
    time_saved_minutes: int
    algorithm_used: str = "2-Opt Nearest Neighbor TSP"

# Complaint Schemas
class ComplaintCreate(BaseModel):
    citizen_name: str
    citizen_phone: Optional[str] = None
    citizen_email: Optional[str] = None
    municipality_id: int
    complaint_type: str
    description: str
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_url: Optional[str] = None

class ComplaintResponse(ComplaintCreate):
    id: int
    ticket_number: str
    status: str
    created_at: datetime
    resolved_at: Optional[datetime] = None
    municipality_name: Optional[str] = None

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime
    role_target: Optional[str] = None

    class Config:
        from_attributes = True

# Audit Log Schema
class AuditLogResponse(BaseModel):
    id: int
    user_email: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

