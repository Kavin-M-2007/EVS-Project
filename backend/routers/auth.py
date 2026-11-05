from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.Token)
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(
        (models.User.email == request.email.lower().strip()) | 
        (models.User.employee_id == request.email.strip())
    ).first()

    if not user or not auth.verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your email/employee ID and password."
        )

    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact your system administrator."
        )

    # Record login timestamp
    user.last_login = datetime.now(timezone.utc)
    
    # Audit log
    audit = models.AuditLog(
        user_id=user.id,
        user_email=user.email,
        user_role=user.role,
        action="USER_LOGIN",
        entity_type="AUTH",
        entity_id=str(user.id),
        details=f"User {user.full_name} ({user.role}) logged in successfully."
    )
    db.add(audit)
    db.commit()

    token = auth.create_access_token(data={"sub": str(user.id), "role": user.role})

    # Prepare response user object
    user_resp = schemas.UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        employee_id=user.employee_id,
        role=user.role,
        municipality_id=user.municipality_id,
        assigned_area=user.assigned_area,
        phone_number=user.phone_number,
        status=user.status,
        created_at=user.created_at,
        last_login=user.last_login,
        municipality_name=user.municipality.name if user.municipality else "Global Platform"
    )

    return schemas.Token(
        access_token=token,
        token_type="bearer",
        user=user_resp
    )

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return schemas.UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        employee_id=current_user.employee_id,
        role=current_user.role,
        municipality_id=current_user.municipality_id,
        assigned_area=current_user.assigned_area,
        phone_number=current_user.phone_number,
        status=current_user.status,
        created_at=current_user.created_at,
        last_login=current_user.last_login,
        municipality_name=current_user.municipality.name if current_user.municipality else "Global Platform"
    )

@router.post("/reset-password")
def reset_password(
    req: schemas.PasswordResetRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Only Super Admin or Admin managing their municipality or the user himself can reset password
    if str(req.user_id).isdigit():
        target_user = db.query(models.User).filter(models.User.id == int(req.user_id)).first()
    else:
        target_user = db.query(models.User).filter(models.User.email == str(req.user_id).lower()).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    if current_user.role != "SUPER_ADMIN":
        if current_user.role == "ADMIN":
            if target_user.municipality_id != current_user.municipality_id or target_user.role in ("SUPER_ADMIN", "ADMIN"):
                raise HTTPException(status_code=403, detail="Unauthorized to reset this user's password.")
        elif current_user.id != target_user.id:
            raise HTTPException(status_code=403, detail="Unauthorized.")

    target_user.password_hash = auth.hash_password(req.new_password)
    
    # Audit log
    audit = models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        user_role=current_user.role,
        action="PASSWORD_RESET",
        entity_type="USER",
        entity_id=str(target_user.id),
        details=f"Password was reset for {target_user.email} by {current_user.email}."
    )
    db.add(audit)
    db.commit()

    return {"message": "Password successfully updated."}

