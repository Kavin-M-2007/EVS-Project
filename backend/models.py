import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)

class Municipality(Base):
    __tablename__ = "municipalities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    code = Column(String(20), unique=True, index=True, nullable=False)
    state = Column(String(100), nullable=False)
    country = Column(String(100), default="India")
    total_area_sqkm = Column(Float, default=150.0)
    population = Column(Integer, default=500000)
    contact_email = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    users = relationship("User", back_populates="municipality")
    bins = relationship("SmartBin", back_populates="municipality")
    vehicles = relationship("CollectionVehicle", back_populates="municipality")
    tasks = relationship("CollectionTask", back_populates="municipality")
    routes = relationship("CollectionRoute", back_populates="municipality")
    complaints = relationship("Complaint", back_populates="municipality")


class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(50), unique=True, nullable=False)  # SUPER_ADMIN, ADMIN, GARBAGE_COLLECTOR, MUNICIPALITY_MONITOR
    description = Column(String(255), nullable=True)
    permissions_json = Column(Text, default="[]")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    role = Column(String(50), nullable=False)  # SUPER_ADMIN, ADMIN, GARBAGE_COLLECTOR, MUNICIPALITY_MONITOR
    municipality_id = Column(Integer, ForeignKey("municipalities.id"), nullable=True)
    assigned_area = Column(String(100), nullable=True)
    phone_number = Column(String(20), nullable=True)
    status = Column(String(20), default="ACTIVE")  # ACTIVE, INACTIVE, SUSPENDED
    created_at = Column(DateTime, default=utcnow)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    municipality = relationship("Municipality", back_populates="users")
    tasks = relationship("CollectionTask", back_populates="collector", foreign_keys="CollectionTask.collector_id")
    classifications = relationship("WasteClassification", back_populates="user")


class SmartBin(Base):
    __tablename__ = "smart_bins"

    id = Column(Integer, primary_key=True, index=True)
    bin_code = Column(String(50), unique=True, index=True, nullable=False)
    municipality_id = Column(Integer, ForeignKey("municipalities.id"), nullable=False)
    location_name = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    waste_category = Column(String(50), default="Mixed Waste")  # Organic, Plastic, Paper, Metal, Electronic, Glass, Mixed
    fill_level = Column(Float, default=0.0)  # 0 to 100 percentage
    max_capacity_liters = Column(Float, default=240.0)
    status = Column(String(20), default="NORMAL")  # NORMAL, NEAR_FULL, CRITICAL, OFFLINE
    battery_level = Column(Float, default=95.0)  # 0 to 100
    temperature_c = Column(Float, default=26.5)
    weight_kg = Column(Float, default=12.0)
    last_collection_time = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    municipality = relationship("Municipality", back_populates="bins")
    sensor_readings = relationship("SensorReading", back_populates="bin")
    collection_records = relationship("CollectionRecord", back_populates="bin")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(Integer, ForeignKey("smart_bins.id"), nullable=False)
    fill_percentage = Column(Float, nullable=False)
    temperature_c = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    battery_pct = Column(Float, default=95.0)
    recorded_at = Column(DateTime, default=utcnow)

    bin = relationship("SmartBin", back_populates="sensor_readings")


class WasteClassification(Base):
    __tablename__ = "waste_classifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    municipality_id = Column(Integer, ForeignKey("municipalities.id"), nullable=True)
    image_url = Column(String(500), nullable=True)
    binary_category = Column(String(50), nullable=False)  # Biodegradable, Non-Biodegradable
    broad_category = Column(String(50), nullable=False)   # Plastic, Organic, Paper, Metal, Glass, E-Waste, Textile, Hazardous, Medical
    fine_class = Column(String(100), nullable=False)     # e.g., PET Plastic Bottle, Banana Peel, Cardboard Box
    confidence_score = Column(Float, nullable=False)     # 0.0 to 1.0
    disposal_guide = Column(Text, nullable=False)
    recycling_guide = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="classifications")


class CollectionVehicle(Base):
    __tablename__ = "collection_vehicles"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_code = Column(String(50), unique=True, index=True, nullable=False)
    plate_number = Column(String(30), unique=True, nullable=False)
    municipality_id = Column(Integer, ForeignKey("municipalities.id"), nullable=False)
    model = Column(String(100), default="EcoCompactor EV 3000")
    capacity_kg = Column(Float, default=3500.0)
    status = Column(String(30), default="ACTIVE")  # ACTIVE, IN_MAINTENANCE, IDLE
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)

    municipality = relationship("Municipality", back_populates="vehicles")
    tasks = relationship("CollectionTask", back_populates="vehicle")


class CollectionRoute(Base):
    __tablename__ = "collection_routes"

    id = Column(Integer, primary_key=True, index=True)
    route_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    municipality_id = Column(Integer, ForeignKey("municipalities.id"), nullable=False)
    distance_km = Column(Float, default=12.5)
    estimated_time_minutes = Column(Integer, default=45)
    waypoints_json = Column(Text, default="[]")  # List of bin coordinates and stop details
    status = Column(String(20), default="ACTIVE")

    municipality = relationship("Municipality", back_populates="routes")
    tasks = relationship("CollectionTask", back_populates="route")


class CollectionTask(Base):
    __tablename__ = "collection_tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_code = Column(String(50), unique=True, index=True, nullable=False)
    municipality_id = Column(Integer, ForeignKey("municipalities.id"), nullable=False)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("collection_vehicles.id"), nullable=True)
    route_id = Column(Integer, ForeignKey("collection_routes.id"), nullable=True)
    area_name = Column(String(100), default="Sector 1")
    priority = Column(String(20), default="MEDIUM")  # HIGH, MEDIUM, LOW
    status = Column(String(30), default="Assigned")  # Assigned -> Accepted -> In Progress -> Collected -> Completed
    assigned_at = Column(DateTime, default=utcnow)
    accepted_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    proof_image_url = Column(String(500), nullable=True)

    municipality = relationship("Municipality", back_populates="tasks")
    collector = relationship("User", back_populates="tasks", foreign_keys=[collector_id])
    vehicle = relationship("CollectionVehicle", back_populates="tasks")
    route = relationship("CollectionRoute", back_populates="tasks")
    records = relationship("CollectionRecord", back_populates="task")


class CollectionRecord(Base):
    __tablename__ = "collection_records"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("collection_tasks.id"), nullable=False)
    bin_id = Column(Integer, ForeignKey("smart_bins.id"), nullable=False)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    weight_kg = Column(Float, default=25.0)
    fill_level_before = Column(Float, default=85.0)
    collected_at = Column(DateTime, default=utcnow)
    status = Column(String(20), default="COLLECTED")

    task = relationship("CollectionTask", back_populates="records")
    bin = relationship("SmartBin", back_populates="collection_records")


class CollectorAssignment(Base):
    __tablename__ = "collector_assignments"

    id = Column(Integer, primary_key=True, index=True)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("collection_vehicles.id"), nullable=True)
    route_id = Column(Integer, ForeignKey("collection_routes.id"), nullable=True)
    shift_date = Column(DateTime, default=utcnow)
    status = Column(String(20), default="SCHEDULED")


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(50), unique=True, index=True, nullable=False)
    citizen_name = Column(String(100), nullable=False)
    citizen_phone = Column(String(25), nullable=True)
    citizen_email = Column(String(120), nullable=True)
    municipality_id = Column(Integer, ForeignKey("municipalities.id"), nullable=False)
    complaint_type = Column(String(50), nullable=False)  # Overflowing Bin, Damaged Bin, Missed Collection, Illegal Dumping
    description = Column(Text, nullable=False)
    location_name = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    photo_url = Column(String(500), nullable=True)
    status = Column(String(30), default="PENDING")  # PENDING, IN_PROGRESS, RESOLVED, REJECTED
    created_at = Column(DateTime, default=utcnow)
    resolved_at = Column(DateTime, nullable=True)

    municipality = relationship("Municipality", back_populates="complaints")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Specific user or null for role broadcast
    role_target = Column(String(50), nullable=True)  # ALL, SUPER_ADMIN, ADMIN, GARBAGE_COLLECTOR, MUNICIPALITY_MONITOR
    municipality_id = Column(Integer, ForeignKey("municipalities.id"), nullable=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="INFO")  # OVERFLOW_ALERT, TASK_ASSIGNED, TASK_COMPLETED, SYSTEM_ALERT, DAMAGE_REPORT
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    municipality_id = Column(Integer, ForeignKey("municipalities.id"), nullable=False)
    prediction_date = Column(DateTime, nullable=False)
    predicted_waste_kg = Column(Float, nullable=False)
    recycling_rate_pct = Column(Float, default=75.0)
    high_waste_zones_json = Column(Text, default="[]")
    overflow_risk_bins_json = Column(Text, default="[]")
    recommendations_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_email = Column(String(120), nullable=True)
    user_role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False)  # USER_LOGIN, TASK_CREATED, BIN_STATUS_UPDATE, etc.
    entity_type = Column(String(50), nullable=True)
    entity_id = Column(String(50), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    created_at = Column(DateTime, default=utcnow)

