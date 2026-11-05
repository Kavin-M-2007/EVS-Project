from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/collections", tags=["Collection Management"])

@router.get("/tasks", response_model=List[schemas.CollectionTaskResponse])
def get_collection_tasks(
    status_filter: Optional[str] = None,
    priority: Optional[str] = None,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.CollectionTask)

    if current_user.role == "SUPER_ADMIN":
        pass
    elif current_user.role == "GARBAGE_COLLECTOR":
        # Collector only sees their own assigned tasks
        query = query.filter(models.CollectionTask.collector_id == current_user.id)
    else:
        # Admin & Monitor see municipality tasks
        query = query.filter(models.CollectionTask.municipality_id == current_user.municipality_id)

    if status_filter:
        query = query.filter(models.CollectionTask.status == status_filter)
    if priority:
        query = query.filter(models.CollectionTask.priority == priority)

    tasks = query.order_by(models.CollectionTask.assigned_at.desc()).all()

    result = []
    for t in tasks:
        result.append(schemas.CollectionTaskResponse(
            id=t.id,
            task_code=t.task_code,
            municipality_id=t.municipality_id,
            collector_id=t.collector_id,
            vehicle_id=t.vehicle_id,
            route_id=t.route_id,
            area_name=t.area_name,
            priority=t.priority,
            status=t.status,
            assigned_at=t.assigned_at,
            accepted_at=t.accepted_at,
            started_at=t.started_at,
            completed_at=t.completed_at,
            notes=t.notes,
            proof_image_url=t.proof_image_url,
            collector_name=t.collector.full_name if t.collector else "Unassigned",
            vehicle_plate=t.vehicle.plate_number if t.vehicle else "None",
            route_name=t.route.name if t.route else "Custom Route",
            municipality_name=t.municipality.name if t.municipality else ""
        ))
    return result

@router.post("/tasks", response_model=schemas.CollectionTaskResponse)
def create_collection_task(
    task_in: schemas.CollectionTaskCreate,
    current_user: models.User = Depends(auth.require_roles(["SUPER_ADMIN", "ADMIN"])),
    db: Session = Depends(get_db)
):
    if current_user.role == "ADMIN" and task_in.municipality_id != current_user.municipality_id:
        raise HTTPException(status_code=403, detail="Cannot assign tasks outside your municipality.")

    count = db.query(models.CollectionTask).count() + 1
    task_code = f"TASK-{date.today().strftime('%Y%m%d')}-{count:03d}"

    new_task = models.CollectionTask(
        task_code=task_code,
        municipality_id=task_in.municipality_id,
        collector_id=task_in.collector_id,
        vehicle_id=task_in.vehicle_id,
        route_id=task_in.route_id,
        area_name=task_in.area_name,
        priority=task_in.priority,
        status="Assigned",
        notes=task_in.notes
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    # Notify collector
    notif = models.Notification(
        user_id=task_in.collector_id,
        municipality_id=task_in.municipality_id,
        title="New Task Assignment",
        message=f"You have been assigned collection task {task_code} in {task_in.area_name}.",
        notification_type="TASK_ASSIGNED"
    )
    db.add(notif)
    db.commit()

    return schemas.CollectionTaskResponse(
        id=new_task.id,
        task_code=new_task.task_code,
        municipality_id=new_task.municipality_id,
        collector_id=new_task.collector_id,
        vehicle_id=new_task.vehicle_id,
        route_id=new_task.route_id,
        area_name=new_task.area_name,
        priority=new_task.priority,
        status=new_task.status,
        assigned_at=new_task.assigned_at,
        notes=new_task.notes,
        collector_name=new_task.collector.full_name if new_task.collector else "",
        vehicle_plate=new_task.vehicle.plate_number if new_task.vehicle else "",
        route_name=new_task.route.name if new_task.route else "",
        municipality_name=new_task.municipality.name if new_task.municipality else ""
    )

@router.patch("/tasks/{task_id}/status")
def update_task_status(
    task_id: int,
    status_update: schemas.CollectionTaskStatusUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(models.CollectionTask).filter(models.CollectionTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    if current_user.role == "GARBAGE_COLLECTOR" and task.collector_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot update another collector's task.")

    valid_statuses = ["Assigned", "Accepted", "In Progress", "Collected", "Completed"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    task.status = status_update.status
    now = datetime.utcnow()

    if status_update.status == "Accepted":
        task.accepted_at = now
    elif status_update.status == "In Progress":
        task.started_at = now
    elif status_update.status in ("Collected", "Completed"):
        task.completed_at = now
        if status_update.proof_image_url:
            task.proof_image_url = status_update.proof_image_url

        # If specific bins were emptied in this task, reset their fill levels and record collection
        if status_update.bins_collected:
            for b_id in status_update.bins_collected:
                bin_obj = db.query(models.SmartBin).filter(models.SmartBin.id == b_id).first()
                if bin_obj:
                    # Record collection
                    rec = models.CollectionRecord(
                        task_id=task.id,
                        bin_id=bin_obj.id,
                        collector_id=task.collector_id,
                        weight_kg=round(bin_obj.weight_kg, 1),
                        fill_level_before=bin_obj.fill_level,
                        collected_at=now,
                        status="COLLECTED"
                    )
                    db.add(rec)
                    # Reset bin fill level
                    bin_obj.fill_level = 0.0
                    bin_obj.status = "NORMAL"
                    bin_obj.last_collection_time = now
                    bin_obj.weight_kg = 0.0

    if status_update.notes:
        task.notes = f"{task.notes or ''} | {status_update.notes}"

    db.commit()

    return {"message": f"Task status updated to {task.status}", "status": task.status}

@router.get("/collector/summary")
def get_collector_daily_summary(
    current_user: models.User = Depends(auth.require_roles(["GARBAGE_COLLECTOR"])),
    db: Session = Depends(get_db)
):
    today_start = datetime.combine(date.today(), datetime.min.time())
    tasks_today = db.query(models.CollectionTask).filter(
        models.CollectionTask.collector_id == current_user.id,
        models.CollectionTask.assigned_at >= today_start
    ).all()

    completed = sum(1 for t in tasks_today if t.status == "Completed")
    in_progress = sum(1 for t in tasks_today if t.status in ("Accepted", "In Progress", "Collected"))
    pending = sum(1 for t in tasks_today if t.status == "Assigned")

    # Total bins collected today
    collections_today = db.query(models.CollectionRecord).filter(
        models.CollectionRecord.collector_id == current_user.id,
        models.CollectionRecord.collected_at >= today_start
    ).all()
    total_weight = sum(c.weight_kg for c in collections_today)

    return {
        "collector_name": current_user.full_name,
        "employee_id": current_user.employee_id,
        "assigned_area": current_user.assigned_area or "Sector 1",
        "tasks_assigned_today": len(tasks_today),
        "tasks_completed_today": completed,
        "tasks_in_progress": in_progress,
        "tasks_pending": pending,
        "bins_collected_today": len(collections_today),
        "total_weight_collected_kg": round(total_weight, 1)
    }

