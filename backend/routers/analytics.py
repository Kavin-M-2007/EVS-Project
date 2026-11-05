from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from datetime import datetime, date, timedelta
from database import get_db
import models, auth

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/overview")
def get_analytics_overview(
    municipality_id: Optional[int] = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    # Determine municipality scope
    target_muni_id = municipality_id if (current_user.role == "SUPER_ADMIN" and municipality_id) else (
        None if current_user.role == "SUPER_ADMIN" else current_user.municipality_id
    )

    # Base query for bins
    bin_query = db.query(models.SmartBin)
    task_query = db.query(models.CollectionTask)
    collector_query = db.query(models.User).filter(models.User.role == "GARBAGE_COLLECTOR")
    vehicle_query = db.query(models.CollectionVehicle)

    if target_muni_id:
        bin_query = bin_query.filter(models.SmartBin.municipality_id == target_muni_id)
        task_query = task_query.filter(models.CollectionTask.municipality_id == target_muni_id)
        collector_query = collector_query.filter(models.User.municipality_id == target_muni_id)
        vehicle_query = vehicle_query.filter(models.CollectionVehicle.municipality_id == target_muni_id)

    total_bins = bin_query.count()
    critical_bins = bin_query.filter(models.SmartBin.status == "CRITICAL").count()
    near_full_bins = bin_query.filter(models.SmartBin.status == "NEAR_FULL").count()
    normal_bins = bin_query.filter(models.SmartBin.status == "NORMAL").count()

    total_tasks = task_query.count()
    completed_tasks = task_query.filter(models.CollectionTask.status == "Completed").count()
    completion_rate = round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 84.5

    active_collectors = collector_query.count()
    active_vehicles = vehicle_query.filter(models.CollectionVehicle.status == "ACTIVE").count()

    # Total waste collection records sum
    records = db.query(models.CollectionRecord).all()
    total_waste_kg = round(sum(r.weight_kg for r in records) + (12850.0 if not target_muni_id else 4250.0), 1)
    recycled_waste_kg = round(total_waste_kg * 0.655, 1)
    recycling_efficiency = round((recycled_waste_kg / total_waste_kg) * 100, 1)

    # Daily trend (last 7 days)
    daily_trends = []
    today = date.today()
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        is_wk = d.weekday() in (5, 6)
        factor = 1.2 if is_wk else 1.0
        base = (total_waste_kg / 7.0) * factor
        daily_trends.append({
            "day": d.strftime("%a"),
            "date": d.strftime("%d %b"),
            "collected_kg": round(base * 0.95, 1),
            "recycled_kg": round(base * 0.95 * 0.65, 1),
            "target_kg": round(base * 1.05, 1)
        })

    # Waste composition
    waste_composition = [
        {"name": "Organic", "value": 42.5, "color": "#166534"},
        {"name": "Plastic", "value": 26.0, "color": "#22C55E"},
        {"name": "Paper & Cardboard", "value": 14.5, "color": "#3B82F6"},
        {"name": "Metal", "value": 7.5, "color": "#F59E0B"},
        {"name": "Glass", "value": 5.5, "color": "#8B5CF6"},
        {"name": "E-Waste / Other", "value": 4.0, "color": "#EF4444"}
    ]

    # Biodegradable vs Non-Biodegradable
    segregation_split = [
        {"name": "Biodegradable", "percentage": 57.0, "color": "#22C55E"},
        {"name": "Non-Biodegradable", "percentage": 43.0, "color": "#64748B"}
    ]

    # Area-wise generation (Peelamedu, Coimbatore Zones)
    area_generation = [
        {"area": "Peelamedu - Avinashi Commercial Corridor", "volume_tonnes": 3.8, "collection_pct": 94},
        {"area": "Hope College - Fun Republic Sector", "volume_tonnes": 2.6, "collection_pct": 98},
        {"area": "TIDEL Park & ELCOT IT SEZ", "volume_tonnes": 4.1, "collection_pct": 89},
        {"area": "Civil Aerodrome & Airport Zone", "volume_tonnes": 1.9, "collection_pct": 92},
        {"area": "PSG Tech & Nava India Campus Zone", "volume_tonnes": 3.2, "collection_pct": 85}
    ]

    # Municipality-wise comparison (for Super Admin)
    muni_comparison = [
        {"municipality": "Coimbatore (Peelamedu)", "waste_tonnes": 12.8, "recycling_rate": 76.5, "bins": 248},
        {"municipality": "Green Valley", "waste_tonnes": 8.4, "recycling_rate": 82.1, "bins": 164},
        {"municipality": "Harbor Bay", "waste_tonnes": 10.2, "recycling_rate": 71.8, "bins": 192}
    ]

    return {
        "metrics": {
            "total_waste_collected_kg": total_waste_kg,
            "recycled_waste_kg": recycled_waste_kg,
            "recycling_efficiency_pct": recycling_efficiency,
            "total_smart_bins": total_bins,
            "critical_bins": critical_bins,
            "near_full_bins": near_full_bins,
            "normal_bins": normal_bins,
            "active_collectors": active_collectors,
            "active_vehicles": active_vehicles,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "collection_completion_rate": completion_rate
        },
        "daily_trends": daily_trends,
        "waste_composition": waste_composition,
        "segregation_split": segregation_split,
        "area_generation": area_generation,
        "muni_comparison": muni_comparison,
        "data_notice": "Demonstration Metrics & Operational Values"
    }

