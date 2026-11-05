# EcoSort AI – Intelligent Waste Management System

**EcoSort AI** is an enterprise-grade smart waste management and environmental IoT SaaS platform designed for municipalities to monitor smart bin fleets, automate AI-powered waste classification, optimize vehicle collection tours with 2-Opt TSP algorithms, predict waste generation trends, and audit statutory recycling quotas.

---

## 🌟 Key Highlights & Architectural Features

### 1. Visual Design & SaaS Experience
- **Environmental Theme**: Background (`#F5F6F4`), White cards (`#FFFFFF`), Primary green (`#166534`), Secondary green (`#22C55E`), Border (`#E7EBE7`), Inter typography.
- **Slim Vertical Sidebar (72px)**: Featuring circular SVG icon buttons with active dark styling.
- **Advanced SVG Hover Animations**: Independent inline Framer Motion SVG animations for each module (Overview, AI Scanner, Smart Bins, Live Map, Analytics, Predictions, Route Optimization, Collections, Reports, Users, Audit Logs, Settings).
- **Floating Contextual Hover Panels**: Slide-and-fade white cards displaying module name, one-line description, and animated miniature SVG illustrations.
- **Floating Top Pill Navbar**: Brand mark, quick pill navigation, omni-search, live IoT system status, unread notification counter & drawer, user avatar with role badge.

### 2. Four Tailored User Role Dashboards (Genuine RBAC)
1. **Super Admin Dashboard** (`superadmin@ecosort.ai`):
   - Global overview across all municipal jurisdictions.
   - Multi-municipality filter (Metro Central, Green Valley, Harbor Bay).
   - Platform metrics: Total municipalities, total bins, total waste collected, recycling efficiency, active vehicles.
   - Municipality-wise comparative charts, system health, and cross-jurisdictional administration.
2. **Municipal Admin Dashboard** (`admin.metro@ecosort.ai`):
   - Municipality-isolated command centre.
   - Real-time waste collection trends, active EV fleet dispatch, critical bin fill alerts.
   - Collector scheduling, task creation, and citizen complaint management.
3. **Garbage Collector Dashboard** (`collector.metro@ecosort.ai`):
   - Mobile-first, outdoor operator interface with large touch targets.
   - Daily task assignments and step-by-step workflow:
     `Assigned` &rarr; `Accepted` &rarr; `In Progress` &rarr; `Collected` &rarr; `Completed`.
   - 1-touch **"Empty Bin"** action updating sensor telemetry to 0% with celebration feedback.
   - Geotagged photographic proof upload modal.
   - Field issue reporting for broken lids, vandalism, or roadside overflow.
4. **Municipality Monitor Dashboard** (`monitor.metro@ecosort.ai`):
   - Supervisory and observational dashboard without destructive mutation access.
   - Real-time collection observation, collector status, and missed collection alerts.
   - Biodegradable vs Non-Biodegradable segregation audit curves.
   - Sector-wise generation breakdown and downloadable audit-ready compliance reports.

### 3. Core Functional Modules
- **AI Waste Classification Pipeline**:
  - Full taxonomy covering **2 Binary Categories** (Biodegradable vs Non-Biodegradable), **9 Broad Categories** (Plastic, Organic, Paper, Metal, Glass, E-Waste, Textile, Hazardous, Medical), and **36 Fine-Grained Classes**.
  - Animated visual laser sweep and corner bracket detection overlay.
  - Realistic confidence scoring, disposal recommendations, and circular valorization guides.
- **Smart Bin Management**:
  - Registered bin fleet with ultrasonic fill percentages and color states:
    - 🟢 **Normal**: $\le 70\%$
    - 🟡 **Near Full**: $71\% - 89\%$
    - 🔴 **Critical Overflow**: $\ge 90\%$
    - ⚪ **Offline**
  - Interactive bin telemetry drawer with hourly depth curves, load cells (kg), internal temperature (°C), and solar battery level.
  - Operator simulation triggers to test overflow surges.
- **Interactive City GIS Map (Peelamedu, Coimbatore, Tamil Nadu)**:
  - Real OpenStreetMap & Leaflet mapping centered at `11.0260° N, 77.0100° E` (Peelamedu, Coimbatore).
  - Accurate coverage of Avinashi Road (NH 544), PSG College of Technology, Hope College Junction, TIDEL Park & ELCOT IT SEZ, Fun Republic Mall, and Coimbatore International Airport.
  - Colored bin markers with dynamic fill levels, live TN-38 EV collection vehicles, and road-network collection routes.
  - Interactive marker popup detail cards, autocomplete search, and 1-click landmark quick-jump navigation.
- **Route Optimization Engine**:
  - Genuine 2-Opt Traveling Salesperson Problem (TSP) algorithm with Haversine geodesic distance matrix.
  - Smart bin selector with "Select All Critical" shortcut.
  - Calculates exact distance saved (km) and turnaround time saved (minutes) vs standard sequential tours.
  - Direct 1-click tour assignment to field collectors.
- **AI Prediction Centre**:
  - 7-day continuous historical intake vs forward forecast curves (ARIMA + XGBoost hybrid demo model).
  - High-waste zone surge forecasting with peak operational hours.
  - Imminent bin overflow countdowns (hours until overflow).
  - Pre-emptive operational recommendations with projected environmental impact.
- **Citizen Support Portal**:
  - Public grievance submission for overflowing bins, missed collections, or damaged infrastructure.
  - Live ticket tracking by reference code (e.g. `ECO-TKT-8841`).
- **Audit Reports & Compliance**:
  - Client-side formatted PDF download engine (`jsPDF`).
  - Raw operational CSV export for external spreadsheet analysis.
- **Immutable Audit Logs**:
  - Full security trail recording user logins, task creations, password resets, and host IP addresses.

---

## 🔑 Demonstration Accounts

All demo accounts use the standard password: **`Admin@123`**
1-click quick login pills are also provided directly on the login screen:

| Role | Email / Employee ID | Scope |
|---|---|---|
| **Super Admin** | `superadmin@ecosort.ai` (or `SA-001`) | Platform-wide (All Municipalities) |
| **Municipal Admin** | `admin.metro@ecosort.ai` (or `ADM-101`) | Metro Central Operations |
| **Garbage Collector** | `collector.metro@ecosort.ai` (or `GC-501`) | Mobile Field Operator Interface |
| **Municipality Monitor** | `monitor.metro@ecosort.ai` (or `MON-801`) | Supervisory & Audit Observatory |

---

## 🛠️ Project Structure

```
EVS project/
├── backend/
│   ├── database.py              # SQLAlchemy engine & SQLite session
│   ├── models.py                # 15 relational tables with RBAC & FKs
│   ├── schemas.py               # Pydantic request & response schemas
│   ├── auth.py                  # JWT tokens & bcrypt password hashing
│   ├── seed_data.py             # Realistic sample municipalities & accounts
│   ├── main.py                  # FastAPI application & router mounts
│   ├── requirements.txt         # Python dependencies
│   ├── services/
│   │   ├── ai_classifier.py     # 36-class AI vision pipeline
│   │   ├── route_optimizer.py   # 2-Opt TSP routing algorithm
│   │   └── forecasting.py       # Time-series waste forecasting
│   └── routers/
│       ├── auth.py
│       ├── municipalities.py
│       ├── users.py
│       ├── bins.py
│       ├── collections.py
│       ├── routes.py
│       ├── classification.py
│       ├── analytics.py
│       ├── predictions.py
│       ├── complaints.py
│       ├── reports.py
│       ├── notifications.py
│       └── audit_logs.py
│
└── frontend/
    ├── index.html               # Clean environmental styling & Inter font
    ├── vite.config.ts           # Vite + Tailwind v4 + API proxy
    ├── src/
    │   ├── App.tsx              # React router with ProtectedRoute RBAC
    │   ├── types/               # TypeScript interfaces
    │   ├── services/api.ts      # REST API client
    │   ├── context/
    │   │   ├── AuthContext.tsx  # JWT authentication state
    │   │   └── NotificationContext.tsx
    │   ├── components/common/
    │   │   ├── AnimatedSidebarIcons.tsx  # Custom Framer Motion SVG animations
    │   │   ├── MiniIllustrations.tsx    # Miniature hover panel illustrations
    │   │   ├── Sidebar.tsx              # Slim 72px vertical navigation
    │   │   ├── TopNavbar.tsx            # Floating pill navbar
    │   │   ├── StatCard.tsx             # SaaS metric cards
    │   │   ├── StatusBadge.tsx          # Status & priority badges
    │   │   └── DemoCredentialsBar.tsx   # 1-click demo login pills
    │   ├── layouts/
    │   │   └── DashboardLayout.tsx      # Main layout container
    │   └── pages/
    │       ├── LoginPage.tsx
    │       ├── SuperAdminDashboard.tsx
    │       ├── AdminDashboard.tsx
    │       ├── CollectorDashboard.tsx
    │       ├── MonitorDashboard.tsx
    │       ├── AIScannerPage.tsx
    │       ├── SmartBinsPage.tsx
    │       ├── LiveCityMapPage.tsx
    │       ├── AnalyticsPage.tsx
    │       ├── PredictionsPage.tsx
    │       ├── RouteOptimizationPage.tsx
    │       ├── CollectionsPage.tsx
    │       ├── CitizenPortalPage.tsx
    │       ├── ReportsPage.tsx
    │       ├── UserManagementPage.tsx
    │       ├── AuditLogsPage.tsx
    │       └── SettingsPage.tsx
```

---

## 🚀 Running the Application Locally

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### Backend Setup
1. Open a terminal in the `backend/` directory:
   ```powershell
   cd backend
   .\venv\Scripts\activate
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *The backend will automatically create `ecosort.db` and populate it with rich demonstration data on startup.*

### Frontend Setup
1. In another terminal, navigate to the `frontend/` directory:
   ```powershell
   cd frontend
   npm run dev
   ```
2. Open your web browser at: **`http://localhost:5173`**

---

## 🔒 Security & RBAC Enforcement
- Backend routes strictly enforce role permissions (`SUPER_ADMIN`, `ADMIN`, `GARBAGE_COLLECTOR`, `MUNICIPALITY_MONITOR`) using dependency injection (`require_roles`).
- Municipality data isolation ensures municipal staff can only read and mutate records belonging to their assigned municipality.
- Passwords are encrypted with 12-round `bcrypt` salt hashes; JWT tokens are signed using `HS256`.

