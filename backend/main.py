import os
import logging
from fastapi import FastAPI, Request, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import settings
from database import engine, Base
from seed_data import seed_database
from routers import (
    auth,
    municipalities,
    users,
    bins,
    collections,
    routes,
    classification,
    analytics,
    predictions,
    complaints,
    reports,
    notifications,
    audit_logs
)

# Configure structured logging
logging.basicConfig(
    level=logging.INFO if settings.ENVIRONMENT == "production" else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ecosort.api")

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Auto seed database if needed
seed_database()

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["300 per minute"])

# FastAPI instance with conditional docs
app = FastAPI(
    title="EcoSort AI – Intelligent Waste Management API",
    description="Enterprise-grade AI-powered waste management, collection routing, and IoT smart bin analytics platform.",
    version="2.0.0",
    docs_url="/docs" if settings.DOCS_ENABLED else None,
    redoc_url="/redoc" if settings.DOCS_ENABLED else None,
    openapi_url="/openapi.json" if settings.DOCS_ENABLED else None
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration restricted to authorized origins
logger.info(f"EcoSort AI initializing with allowed origins: {settings.cors_origins}")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Standardized Error Handling
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "status_code": exc.status_code,
            "detail": exc.detail,
            "error": exc.detail,
            "path": request.url.path,
        },
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "status_code": 422,
            "error": "Validation Error",
            "detail": exc.errors(),
            "path": request.url.path,
        },
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "status_code": 500,
            "error": "Internal Server Error",
            "detail": "An unexpected server error occurred. Please try again later.",
            "path": request.url.path,
        },
    )

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Static files for image uploads
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(municipalities.router)
app.include_router(users.router)
app.include_router(bins.router)
app.include_router(collections.router)
app.include_router(routes.router)
app.include_router(classification.router)
app.include_router(analytics.router)
app.include_router(predictions.router)
app.include_router(complaints.router)
app.include_router(reports.router)
app.include_router(notifications.router)
app.include_router(audit_logs.router)

@app.get("/")
def root():
    return {
        "system": "EcoSort AI – Intelligent Waste Management System",
        "status": "ONLINE",
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT,
        "demo_accounts": [
            {"role": "Super Admin", "email": "superadmin@ecosort.ai", "password": "Admin@123"},
            {"role": "Admin", "email": "admin.metro@ecosort.ai", "password": "Admin@123"},
            {"role": "Garbage Collector", "email": "collector.metro@ecosort.ai", "password": "Admin@123"},
            {"role": "Municipality Monitor", "email": "monitor.metro@ecosort.ai", "password": "Admin@123"}
        ]
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "EcoSort AI Core",
        "environment": settings.ENVIRONMENT
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=settings.ENVIRONMENT != "production")
