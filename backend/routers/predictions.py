from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
import models, auth
from services.forecasting import generate_waste_predictions

router = APIRouter(prefix="/api/predictions", tags=["AI Predictions"])

@router.get("")
def get_predictions(
    municipality_id: Optional[int] = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    target_id = municipality_id if (current_user.role == "SUPER_ADMIN" and municipality_id) else (
        current_user.municipality_id or 1
    )

    muni = db.query(models.Municipality).filter(models.Municipality.id == target_id).first()
    muni_name = muni.name if muni else "Metro Central"

    # Fetch bins at risk of overflow (fill_level >= 75%)
    risk_bins = db.query(models.SmartBin).filter(
        models.SmartBin.municipality_id == target_id,
        models.SmartBin.fill_level >= 70
    ).all()

    overflow_predictions = [
        {
            "bin_id": b.id,
            "bin_code": b.bin_code,
            "location_name": b.location_name,
            "current_fill_pct": b.fill_level,
            "predicted_overflow_hours": round(max(0.5, (100 - b.fill_level) / 4.2), 1),
            "risk_urgency": "IMMEDIATE" if b.fill_level >= 90 else "HIGH"
        } for b in risk_bins
    ]

    forecast = generate_waste_predictions(target_id, muni_name)
    forecast["overflow_risk_bins"] = overflow_predictions

    return forecast

