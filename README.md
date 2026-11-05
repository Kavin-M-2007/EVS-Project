# EcoSort AI – Intelligent Waste Management System
### Enterprise-Grade Municipal Waste SaaS with Supabase PostgreSQL, Realtime IoT & AI Vision

**EcoSort AI** is a production-quality, database-connected environmental waste management platform engineered for municipal corporations. It combines **Supabase PostgreSQL**, **Supabase Auth & Storage**, **Supabase Realtime**, **Gemini Multimodal Vision AI**, **2-Opt TSP Route Optimization**, and an interactive **Leaflet GIS Map (Peelamedu, Coimbatore)** into a high-performance SaaS suite.

---

## 🌟 Key Architecture & Capabilities

```
┌────────────────────────────────────────────────────────────────────────┐
│                   EcoSort AI Web Application (React 19)                │
│  Tailwind CSS v4 • Framer Motion SVG Animations • Bespoke Theme        │
├───────────────────────────────────┬────────────────────────────────────┤
│         Supabase Layer            │         FastAPI Backend            │
│  - PostgreSQL 16 (16 Tables)      │  - Python 3.12 / Pydantic v2       │
│  - GoTrue Authentication          │  - Gemini Multimodal Vision AI     │
│  - Row Level Security (RLS)       │  - 2-Opt TSP Route Optimizer       │
│  - Realtime Change Subscriptions  │  - Statistical Time-Series Models  │
│  - Storage Buckets (Proof/Photos) │  - SQLite Fallback Layer           │
└───────────────────────────────────┴────────────────────────────────────┘
```

### 1. Multi-Tenant Relational Schema (16 Tables)
1. **`municipalities`**: Municipal corporations and jurisdictions (Coimbatore CCMC, Green Valley, Harbor Bay).
2. **`sectors`**: Municipal sub-divisions, wards, and residential/commercial zones.
3. **`profiles`**: User profiles tied 1:1 to Supabase Auth UUIDs with strict role constraints.
4. **`smart_bins`**: Hardware bins with GPS coordinates, ultrasonic depth levels, battery, temperature, weight.
5. **`vehicles`**: Municipal EV and diesel waste collection trucks, plate numbers, payload capacities.
6. **`route_assignments`**: Prescheduled and 2-Opt optimized collection routes.
7. **`route_stops`**: Ordered sequence of stops connecting smart bins to routes.
8. **`collection_assignments`**: Real-time dispatch tasks with 5-stage workflow state tracking.
9. **`collection_records`**: Auditable logs of verified collections, collected weights, and photographic proof.
10. **`bin_telemetry`**: Time-series log of depth/fill percentage, battery, and internal temperature.
11. **`waste_classifications`**: Historical AI vision scans, fine-grained material categories, and disposal guides.
12. **`complaints`**: Citizen grievances with ticket references, street landmarks, and attached photos.
13. **`notifications`**: Targeted alerts for critical bin overflows, task dispatches, and grievance updates.
14. **`audit_logs`**: Immutable security ledger recording logins, role updates, and configuration events.
15. **`waste_predictions`**: ARIMA + XGBoost forward forecasts and weekend volumetric surge estimates.
16. **`system_settings`**: Per-municipality configurable parameters (overflow thresholds, collection frequencies).

### 2. Four Tailored User Role Dashboards
All test accounts are configured with the standard password: **`Admin@123`**

| Role | Test Email | Permissions & Functional Scope |
|---|---|---|
| **SUPER_ADMIN** | `superadmin@ecosort.ai` | Cross-jurisdictional platform control; create & configure municipalities; manage all municipal administrators; review global audit logs; toggle platform-wide system settings. |
| **ADMIN** | `admin.metro@ecosort.ai` | Single-municipality operational command (Peelamedu, Coimbatore); full Smart Bins CRUD; dispatch collection tasks; inspect live fleet telemetry; resolve citizen complaints; export compliance reports. |
| **GARBAGE_COLLECTOR** | `collector.metro@ecosort.ai` | Outdoor-ready mobile interface; 5-stage task workflow (`ASSIGNED` &rarr; `ACCEPTED` &rarr; `IN_PROGRESS` &rarr; `COLLECTED` &rarr; `COMPLETED`); camera/file photographic proof upload to Supabase Storage; automatic 0% fill-level reset. |
| **MUNICIPALITY_MONITOR** | `monitor.metro@ecosort.ai` | Strictly read-only supervisory observatory; monitor real-time bin conditions and collection rates; inspect segregation split (Biodegradable vs Non-Biodegradable); generate regulatory PDF/CSV audits. |

---

## 🚀 Supabase Database Setup & Migration

### One-Click Consolidated Migration
To provision the entire PostgreSQL schema, tables, Row Level Security policies, storage buckets, realtime replication, and demonstration seed data in a single step:

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard/project/rexviyobhkhywsairhhr).
2. Click on the **SQL Editor** tab on the left navigation bar (or press `New Query`).
3. Open and copy the contents of `supabase/complete_ecosort_migration.sql`.
4. Paste into the SQL Editor and click **Run**.

*This executes all 5 migration steps idempotently: 16 tables, foreign key constraints, Row Level Security policies, storage bucket configurations (`collection-proof`, `complaint-photos`, `waste-classification-images`, `avatars`), realtime publications, and Peelamedu demonstration data dynamically linked to your Supabase Auth user accounts.*

---

## ⚙️ Environment Configuration

### Frontend Configuration (`frontend/.env`)
Ensure `frontend/.env` is configured with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://rexviyobhkhywsairhhr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_79fI0NVZ52n4sphdHpaBsw_SjepDxXt

# Backend API Proxy Base
VITE_API_URL=/api
```

### Backend Configuration (`backend/.env`)
Ensure `backend/.env` is configured with:

```env
# Server Configuration
PORT=8000
HOST=0.0.0.0
DEBUG=True

# Supabase Credentials
SUPABASE_URL=https://rexviyobhkhywsairhhr.supabase.co
SUPABASE_ANON_KEY=sb_publishable_79fI0NVZ52n4sphdHpaBsw_SjepDxXt
SUPABASE_SERVICE_ROLE_KEY=

# Local SQLite Fallback Database
DATABASE_URL=sqlite:///./ecosort.db

# JWT Security
JWT_SECRET=ecosort-ai-super-secret-key-2025-production-grade
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Google Gemini Multimodal Vision AI Key (Optional for live inference)
# Leave empty to run in transparent setup mode
GEMINI_API_KEY=
```

---

## 💻 Running the Application

### 1. Start the Backend API (FastAPI)
In a terminal, run:
```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
- API Documentation (Swagger): **`http://127.0.0.1:8000/docs`**
- API Health Check: **`http://127.0.0.1:8000/api/health`**

### 2. Start the Frontend Application (Vite + React)
In another terminal, run:
```powershell
cd frontend
npm run dev
```
- Web Application: **`http://localhost:5173`**

---

## 📋 Comprehensive Feature Verification & Workflows

### 1. Smart Bins Management (Full CRUD & Realtime)
- Navigate to `/smart-bins`.
- **Add Bin**: Tap **"Register New Smart Bin"**, fill in location (e.g. *Peelamedu Bus Shelter*), select sector, stream category, and set coordinates. It immediately persists to Supabase.
- **Edit Bin**: Tap the ✏️ icon on any bin card to update waste stream, capacity, or location name.
- **Delete Bin**: Tap the 🗑️ icon and confirm deletion.
- **Sector & Status Filter**: Filter by *All Sectors*, *Avinashi Road*, *TIDEL Park*, or by *Normal*, *Near Full*, and *Critical*.
- **Telemetry Drawer**: Click any bin card to view real-time depth curves, battery health, and internal temperature readings.
- **Demo Simulation Mode**: Test high-waste overflow surges with clearly marked simulation pills.

### 2. Garbage Collector 5-Stage Stepper Workflow
- Log in as `collector.metro@ecosort.ai` with password `Admin@123`.
- The collector dashboard displays assigned tasks with status stepper:
  1. `ASSIGNED` &rarr; Collector clicks **"Accept Assignment"**
  2. `ACCEPTED` &rarr; Collector clicks **"Start Collection Tour"**
  3. `IN_PROGRESS` &rarr; Collector clicks **"Collect Bin"** and selects photographic proof
  4. `COLLECTED` &rarr; Photo uploads to Supabase Storage `collection-proof` bucket, bin fill level resets to 0% in database, and collection record is logged
  5. `COMPLETED` &rarr; Task transitions to completion with double-submission prevention

### 3. Leaflet GIS Map (Peelamedu, Coimbatore)
- Navigate to `/map`.
- Real OpenStreetMap tiles centered at **Peelamedu, Coimbatore** (`11.0260° N, 77.0100° E`).
- Displays registered bins across Avinashi Road (NH 544), PSG College of Technology, Hope College Junction, Fun Republic Mall, and TIDEL Park.
- Bin markers pulse red when fill level $\ge 90\%$.
- Includes 1-click landmark search and navigation.
- Vehicle movements along road networks are clearly badged as simulated dispatch trajectories until physical vehicle CAN/GPS hardware is connected.

### 4. 2-Opt TSP Collection Route Optimization
- Navigate to `/routes`.
- Select smart bins or tap **"Select All Critical > 75%"**.
- Tap **"Solve Optimal Route"**. The backend computes geodesic distances using the 2-Opt heuristic, returning:
  - Sequential waypoint stops
  - Distance saved (km)
  - Mission turnaround time saved (minutes)
- Tap **"Assign Tour as Collection Task"** to dispatch directly to an active collector.

### 5. AI Waste Classifier & Segregation
- Navigate to `/scanner`.
- Upload any image or choose one of the sample waste items (Plastic Bottle, Banana Peel, Cardboard Box, Soda Can, Battery).
- If `GEMINI_API_KEY` is configured in `backend/.env`, live multimodal vision inference identifies the item and provides disposal guidelines.
- If unconfigured, the scanner transparently displays the setup requirement without fabricating artificial random predictions.

### 6. Regulatory Reporting & Exports
- Navigate to `/reports`.
- Select *Daily Collection Summary*, *Weekly Recycling Compliance*, or *Monthly Municipal Audit*.
- Click **"Download PDF"** to generate audit-ready vector PDF documents via `jsPDF`.
- Click **"Export CSV"** to download raw operational datasets.

---

## 🛡️ Security & Privacy Assurance
- **No Hardcoded Secrets**: All API keys and secrets reside exclusively in untracked `.env` files.
- **Service Role Isolation**: Backend administrative operations keep service role keys on the server; public anon keys on the client are restricted by PostgreSQL Row Level Security.
- **Sparkle Free UI**: Completely clean, modern environmental SaaS interface with bespoke Framer Motion SVG animations.
- **Preserved Documentation**: All existing comments, mathematical equations, and operational procedures are preserved.
