import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base
import models
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

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Auto seed database if needed
seed_database()

app = FastAPI(
    title="EcoSort AI – Intelligent Waste Management API",
    description="Enterprise-grade AI-powered waste management, collection routing, and IoT smart bin analytics platform.",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        "demo_accounts": [
            {"role": "Super Admin", "email": "superadmin@ecosort.ai", "password": "Admin@123"},
            {"role": "Admin", "email": "admin.metro@ecosort.ai", "password": "Admin@123"},
            {"role": "Garbage Collector", "email": "collector.metro@ecosort.ai", "password": "Admin@123"},
            {"role": "Municipality Monitor", "email": "monitor.metro@ecosort.ai", "password": "Admin@123"}
        ]
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "EcoSort AI Core"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

