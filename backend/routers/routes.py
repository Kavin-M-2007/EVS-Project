import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas, auth
from services.route_optimizer import solve_tsp_2opt

router = APIRouter(prefix="/api/routes", tags=["Route Optimization"])

@router.get("", response_model=List[dict])
def list_routes(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.CollectionRoute)
    if current_user.role != "SUPER_ADMIN":
        query = query.filter(models.CollectionRoute.municipality_id == current_user.municipality_id)

    routes = query.all()
    res = []
    for r in routes:
        waypoints = []
        try:
            waypoints = json.loads(r.waypoints_json)
        except Exception:
            pass
        res.append({
            "id": r.id,
            "route_code": r.route_code,
            "name": r.name,
            "municipality_id": r.municipality_id,
            "distance_km": r.distance_km,
            "estimated_time_minutes": r.estimated_time_minutes,
            "status": r.status,
            "waypoints": waypoints,
            "municipality_name": r.municipality.name if r.municipality else ""
        })
    return res

@router.post("/optimize", response_model=schemas.RouteOptimizeResponse)
def optimize_route(
    req: schemas.RouteOptimizeRequest,
    current_user: models.User = Depends(auth.require_roles(["SUPER_ADMIN", "ADMIN", "MUNICIPALITY_MONITOR"])),
    db: Session = Depends(get_db)
):
    if current_user.role != "SUPER_ADMIN" and req.municipality_id != current_user.municipality_id:
        raise HTTPException(status_code=403, detail="Unauthorized municipality access.")

    # Fetch bins
    bins = db.query(models.SmartBin).filter(models.SmartBin.id.in_(req.bin_ids)).all()
    if not bins:
        raise HTTPException(status_code=400, detail="No valid smart bins provided for optimization.")

    bin_dicts = [
        {
            "bin_id": b.id,
            "bin_code": b.bin_code,
            "location_name": b.location_name,
            "latitude": b.latitude,
            "longitude": b.longitude,
            "fill_level": b.fill_level,
            "waste_category": b.waste_category
        } for b in bins
    ]

    # Default depot start location (e.g. municipality depot or first bin)
    start_lat = req.start_lat or bins[0].latitude - 0.015
    start_lng = req.start_lng or bins[0].longitude - 0.015

    opt_result = solve_tsp_2opt(bin_dicts, start_lat, start_lng)

    waypoints = [
        schemas.RouteWaypoint(
            order=idx + 1,
            bin_id=item["bin_id"],
            bin_code=item["bin_code"],
            location_name=item["location_name"],
            latitude=item["latitude"],
            longitude=item["longitude"],
            fill_level=item["fill_level"],
            waste_category=item["waste_category"]
        ) for idx, item in enumerate(opt_result["ordered_bins"])
    ]

    route_code = f"OPT-RT-{len(waypoints)}B"

    return schemas.RouteOptimizeResponse(
        route_code=route_code,
        total_bins=len(waypoints),
        estimated_distance_km=opt_result["total_distance_km"],
        estimated_time_minutes=opt_result["estimated_time_minutes"],
        waypoints=waypoints,
        standard_distance_km=opt_result["standard_distance_km"],
        distance_saved_km=opt_result["distance_saved_km"],
        time_saved_minutes=opt_result["time_saved_minutes"],
        algorithm_used=opt_result["algorithm"]
    )

