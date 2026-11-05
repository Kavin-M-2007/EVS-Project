import logging
import bcrypt
import requests
import jwt
from jwt.exceptions import PyJWTError as JWTError
from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
import models
from config import settings

logger = logging.getLogger("ecosort.auth")

SECRET_KEY = settings.JWT_SECRET
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_ANON_KEY = settings.SUPABASE_ANON_KEY

security = HTTPBearer()

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_supabase_token(token: str) -> Optional[dict]:
    """
    Validates the bearer token directly against Supabase GoTrue Auth API.
    Returns user payload dictionary if valid, or None.
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        return None
    try:
        url = f"{SUPABASE_URL.rstrip('/')}/auth/v1/user"
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {token}"
        }
        resp = requests.get(url, headers=headers, timeout=4)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        logger.debug(f"Supabase token verification network call exception: {e}")
    return None

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> models.User:
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 1. First, attempt validation via Supabase GoTrue
    supabase_user = verify_supabase_token(token)
    if supabase_user:
        email = supabase_user.get("email")
        user_meta = supabase_user.get("user_metadata", {})
        # Lookup user in database by email
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            # Auto-sync user into database session
            role = user_meta.get("role", "GARBAGE_COLLECTOR")
            full_name = user_meta.get("full_name", email.split("@")[0] if email else "User")
            muni_id = user_meta.get("municipality_id")
            if role == "SUPER_ADMIN":
                muni_id = None
            elif muni_id is None:
                muni_id = 1

            resolved_muni_id = None
            if role != "SUPER_ADMIN":
                resolved_muni_id = int(muni_id) if (muni_id and str(muni_id).isdigit()) else 1

            user = models.User(
                email=email or "unknown@ecosort.ai",
                password_hash=hash_password("SupabaseAuth@Verified"),
                full_name=full_name,
                employee_id=user_meta.get("employee_id", f"EMP-{supabase_user['id'][:6]}"),
                role=role,
                municipality_id=resolved_muni_id,
                status="ACTIVE"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        if user.status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated. Contact an administrator."
            )
        return user

    # 2. Fallback: Local JWT verification
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact an administrator."
        )
    return user

def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: models.User = Depends(get_current_user)) -> models.User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(allowed_roles)}. Your role: {current_user.role}"
            )
        return current_user
    return role_checker

def verify_municipality_access(user: models.User, municipality_id: int):
    # Super Admin has global access to all municipalities
    if user.role == "SUPER_ADMIN":
        return True
    # Other roles are strictly isolated to their own municipality
    if user.municipality_id != municipality_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not have permission to access data from other municipalities."
        )
    return True
