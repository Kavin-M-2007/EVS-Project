from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/bins", tags=["Smart Bins"])

@router.get("", response_model=List[schemas.SmartBinResponse])
def list_smart_bins(
    municipality_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    category: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.SmartBin)

    # Super admin can filter by municipality or see all; others locked to their own municipality
    if current_user.role == "SUPER_ADMIN":
        if municipality_id:
            query = query.filter(models.SmartBin.municipality_id == municipality_id)
    else:
        query = query.filter(models.SmartBin.municipality_id == current_user.municipality_id)

    if status_filter:
        query = query.filter(models.SmartBin.status == status_filter)
    if category:
        query = query.filter(models.SmartBin.waste_category == category)

    bins = query.order_by(models.SmartBin.fill_level.desc()).all()

    result = []
    for b in bins:
        result.append(schemas.SmartBinResponse(
            id=b.id,
            bin_code=b.bin_code,
            municipality_id=b.municipality_id,
            location_name=b.location_name,
            latitude=b.latitude,
            longitude=b.longitude,
            waste_category=b.waste_category,
            fill_level=b.fill_level,
            max_capacity_liters=b.max_capacity_liters,
            status=b.status,
            battery_level=b.battery_level,
            temperature_c=b.temperature_c,
            weight_kg=b.weight_kg,
            last_collection_time=b.last_collection_time,
            updated_at=b.updated_at,
            municipality_name=b.municipality.name if b.municipality else ""
        ))
    return result

@router.get("/{bin_id}")
def get_bin_details(
    bin_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    bin_obj = db.query(models.SmartBin).filter(models.SmartBin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Smart bin not found.")

    if current_user.role != "SUPER_ADMIN" and bin_obj.municipality_id != current_user.municipality_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this municipality's bin.")

    # Recent sensor readings (last 10)
    readings = db.query(models.SensorReading).filter(
        models.SensorReading.bin_id == bin_id
    ).order_by(models.SensorReading.recorded_at.desc()).limit(12).all()

    # Recent collection history
    records = db.query(models.CollectionRecord).filter(
        models.CollectionRecord.bin_id == bin_id
    ).order_by(models.CollectionRecord.collected_at.desc()).limit(5).all()

    return {
        "bin": schemas.SmartBinResponse(
            id=bin_obj.id,
            bin_code=bin_obj.bin_code,
            municipality_id=bin_obj.municipality_id,
            location_name=bin_obj.location_name,
            latitude=bin_obj.latitude,
            longitude=bin_obj.longitude,
            waste_category=bin_obj.waste_category,
            fill_level=bin_obj.fill_level,
            max_capacity_liters=bin_obj.max_capacity_liters,
            status=bin_obj.status,
            battery_level=bin_obj.battery_level,
            temperature_c=bin_obj.temperature_c,
            weight_kg=bin_obj.weight_kg,
            last_collection_time=bin_obj.last_collection_time,
            updated_at=bin_obj.updated_at,
            municipality_name=bin_obj.municipality.name if bin_obj.municipality else ""
        ),
        "sensor_telemetry_history": [
            {
                "fill_percentage": r.fill_percentage,
                "temperature_c": r.temperature_c,
                "weight_kg": r.weight_kg,
                "battery_pct": r.battery_pct,
                "recorded_at": r.recorded_at.strftime("%H:%M")
            } for r in reversed(readings)
        ],
        "recent_collections": [
            {
                "id": rec.id,
                "weight_kg": rec.weight_kg,
                "collected_at": rec.collected_at.strftime("%Y-%m-%d %H:%M"),
                "status": rec.status
            } for rec in records
        ]
    }

@router.post("", response_model=schemas.SmartBinResponse)
def create_smart_bin(
    bin_in: schemas.SmartBinCreate,
    current_user: models.User = Depends(auth.require_roles(["SUPER_ADMIN", "ADMIN"])),
    db: Session = Depends(get_db)
):
    if current_user.role == "ADMIN" and bin_in.municipality_id != current_user.municipality_id:
        raise HTTPException(status_code=403, detail="Cannot create bins in another municipality.")

    existing = db.query(models.SmartBin).filter(models.SmartBin.bin_code == bin_in.bin_code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="A smart bin with this code already exists.")

    new_bin = models.SmartBin(
        bin_code=bin_in.bin_code.upper(),
        municipality_id=bin_in.municipality_id,
        location_name=bin_in.location_name,
        latitude=bin_in.latitude,
        longitude=bin_in.longitude,
        waste_category=bin_in.waste_category,
        fill_level=bin_in.fill_level,
        max_capacity_liters=bin_in.max_capacity_liters,
        status="NORMAL" if bin_in.fill_level < 70 else ("NEAR_FULL" if bin_in.fill_level < 90 else "CRITICAL"),
        battery_level=bin_in.battery_level,
        temperature_c=bin_in.temperature_c,
        weight_kg=bin_in.weight_kg
    )
    db.add(new_bin)
    db.commit()
    db.refresh(new_bin)

    return schemas.SmartBinResponse(
        id=new_bin.id,
        bin_code=new_bin.bin_code,
        municipality_id=new_bin.municipality_id,
        location_name=new_bin.location_name,
        latitude=new_bin.latitude,
        longitude=new_bin.longitude,
        waste_category=new_bin.waste_category,
        fill_level=new_bin.fill_level,
        max_capacity_liters=new_bin.max_capacity_liters,
        status=new_bin.status,
        battery_level=new_bin.battery_level,
        temperature_c=new_bin.temperature_c,
        weight_kg=new_bin.weight_kg,
        last_collection_time=None,
        updated_at=new_bin.updated_at,
        municipality_name=new_bin.municipality.name if new_bin.municipality else ""
    )

@router.patch("/{bin_id}/telemetry")
def update_bin_telemetry(
    bin_id: int,
    update: schemas.SmartBinUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    bin_obj = db.query(models.SmartBin).filter(models.SmartBin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found.")

    if current_user.role != "SUPER_ADMIN" and bin_obj.municipality_id != current_user.municipality_id:
        raise HTTPException(status_code=403, detail="Unauthorized.")

    if update.fill_level is not None:
        bin_obj.fill_level = update.fill_level
        if update.fill_level >= 90:
            bin_obj.status = "CRITICAL"
            # Trigger overflow notification
            notif = models.Notification(
                role_target="ADMIN",
                municipality_id=bin_obj.municipality_id,
                title="Critical Bin Overflow Alert",
                message=f"Smart Bin {bin_obj.bin_code} at {bin_obj.location_name} has reached {int(update.fill_level)}% capacity!",
                notification_type="OVERFLOW_ALERT"
            )
            db.add(notif)
        elif update.fill_level >= 70:
            bin_obj.status = "NEAR_FULL"
        else:
            bin_obj.status = "NORMAL"

    if update.status is not None:
        bin_obj.status = update.status
    if update.battery_level is not None:
        bin_obj.battery_level = update.battery_level
    if update.temperature_c is not None:
        bin_obj.temperature_c = update.temperature_c
    if update.weight_kg is not None:
        bin_obj.weight_kg = update.weight_kg

    bin_obj.updated_at = datetime.utcnow()

    # Append to sensor readings history
    reading = models.SensorReading(
        bin_id=bin_obj.id,
        fill_percentage=bin_obj.fill_level,
        temperature_c=bin_obj.temperature_c,
        weight_kg=bin_obj.weight_kg,
        battery_pct=bin_obj.battery_level
    )
    db.add(reading)
    db.commit()

    return {"message": "Telemetry updated successfully", "status": bin_obj.status, "fill_level": bin_obj.fill_level}

