import pytest
from fastapi.testclient import TestClient
import sys
import os

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)

def test_health_endpoint():
    """Verify system health diagnostics check."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "healthy"
    assert "service" in data

def test_root_endpoint():
    """Verify system overview and demo credentials contract."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "ONLINE"
    assert "demo_accounts" in data
    assert len(data["demo_accounts"]) >= 4

def test_login_success_and_role_tokens():
    """Verify login authentication for demo personas."""
    test_accounts = [
        ("superadmin@ecosort.ai", "Admin@123", "SUPER_ADMIN"),
        ("admin.metro@ecosort.ai", "Admin@123", "ADMIN"),
        ("collector.metro@ecosort.ai", "Admin@123", "GARBAGE_COLLECTOR"),
        ("monitor.metro@ecosort.ai", "Admin@123", "MUNICIPALITY_MONITOR")
    ]
    for email, password, expected_role in test_accounts:
        response = client.post("/api/auth/login", json={"email": email, "password": password})
        assert response.status_code == 200, f"Login failed for {email}"
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == expected_role
        assert data["user"]["email"] == email

def test_login_invalid_password_returns_401():
    """Verify unauthorized rejection with 401 on bad credentials."""
    response = client.post("/api/auth/login", json={"email": "superadmin@ecosort.ai", "password": "WrongPassword!"})
    assert response.status_code == 401
    assert "Invalid credentials" in response.json().get("detail", "")

def test_unauthenticated_request_rejected():
    """Verify protected endpoints reject missing tokens."""
    response = client.get("/api/bins")
    assert response.status_code in (401, 403)

def test_smart_bins_telemetry_flow():
    """Verify smart bins telemetry querying with authorized token."""
    # Obtain token
    login_resp = client.post("/api/auth/login", json={"email": "superadmin@ecosort.ai", "password": "Admin@123"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/bins", headers=headers)
    assert response.status_code == 200
    bins = response.json()
    assert isinstance(bins, list)
    assert len(bins) > 0
    first_bin = bins[0]
    assert "bin_code" in first_bin
    assert "fill_level" in first_bin
    assert "latitude" in first_bin
    assert "longitude" in first_bin

def test_citizen_complaint_submission_and_tracking():
    """Verify public citizen grievance submission and ticket tracking."""
    payload = {
        "citizen_name": "Test Citizen Automation",
        "citizen_phone": "+91 94433 11223",
        "citizen_email": "test.citizen@example.com",
        "municipality_id": 1,
        "complaint_type": "OVERFLOW",
        "description": "Smart bin near PSG Tech main entrance is overflowing onto pavement.",
        "location_name": "Avinashi Road PSG Tech Entrance",
        "latitude": 11.0245,
        "longitude": 77.0028
    }
    submit_resp = client.post("/api/complaints", json=payload)
    assert submit_resp.status_code == 200
    created = submit_resp.json()
    assert "ticket_number" in created
    ticket = created["ticket_number"]

    # Track by ticket number
    track_resp = client.get(f"/api/complaints/track/{ticket}")
    assert track_resp.status_code == 200
    tracked = track_resp.json()
    assert tracked["ticket_number"] == ticket
    assert tracked["complaint_type"] == "OVERFLOW"

