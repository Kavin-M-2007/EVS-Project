-- EcoSort AI - Intelligent Waste Management System
-- Migration 01: Initial Relational Database Schema
-- Defines all 16 operational tables with UUID primary keys, constraints, and relational integrity.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. MUNICIPALITIES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.municipalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    total_area_sqkm NUMERIC(10, 2) DEFAULT 150.0,
    population INTEGER DEFAULT 500000,
    contact_email TEXT,
    contact_phone TEXT,
    boundary_geojson JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_municipalities_code ON public.municipalities(code);

-- ==========================================
-- 2. SECTORS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID NOT NULL REFERENCES public.municipalities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    boundary_geojson JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_municipality_sector_code UNIQUE (municipality_id, code)
);

CREATE INDEX IF NOT EXISTS idx_sectors_municipality ON public.sectors(municipality_id);

-- ==========================================
-- 3. USER PROFILES
-- Linked 1:1 with Supabase auth.users
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    employee_id TEXT UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'GARBAGE_COLLECTOR', 'MUNICIPALITY_MONITOR')),
    municipality_id UUID REFERENCES public.municipalities(id) ON DELETE SET NULL,
    assigned_sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
    phone_number TEXT,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_municipality ON public.profiles(municipality_id);
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON public.profiles(employee_id);

-- ==========================================
-- 4. SMART BINS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.smart_bins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bin_code TEXT NOT NULL UNIQUE,
    municipality_id UUID NOT NULL REFERENCES public.municipalities(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    waste_category TEXT NOT NULL DEFAULT 'Mixed Waste' CHECK (waste_category IN (
        'Plastic', 'Organic', 'Paper & Cardboard', 'Metal & Cans', 'Glass', 'E-Waste Drop', 'Hazardous', 'Medical', 'Mixed Waste'
    )),
    fill_level NUMERIC(5, 2) NOT NULL DEFAULT 0.0 CHECK (fill_level >= 0.0 AND fill_level <= 100.0),
    max_capacity_liters NUMERIC(8, 2) NOT NULL DEFAULT 240.0,
    status TEXT NOT NULL DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'NEAR_FULL', 'CRITICAL', 'OFFLINE')),
    battery_level NUMERIC(5, 2) NOT NULL DEFAULT 100.0 CHECK (battery_level >= 0.0 AND battery_level <= 100.0),
    temperature_c NUMERIC(5, 2) NOT NULL DEFAULT 26.5,
    weight_kg NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    last_collection_time TIMESTAMPTZ,
    last_telemetry_update TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_smart_bins_muni ON public.smart_bins(municipality_id);
CREATE INDEX IF NOT EXISTS idx_smart_bins_sector ON public.smart_bins(sector_id);
CREATE INDEX IF NOT EXISTS idx_smart_bins_status ON public.smart_bins(status);
CREATE INDEX IF NOT EXISTS idx_smart_bins_fill ON public.smart_bins(fill_level);

-- ==========================================
-- 5. VEHICLES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_code TEXT NOT NULL UNIQUE,
    plate_number TEXT NOT NULL UNIQUE,
    municipality_id UUID NOT NULL REFERENCES public.municipalities(id) ON DELETE CASCADE,
    model TEXT NOT NULL DEFAULT 'EcoCompactor EV 3000',
    capacity_kg NUMERIC(10, 2) NOT NULL DEFAULT 3500.0,
    current_load_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'IN_MAINTENANCE', 'IDLE', 'DECOMMISSIONED')),
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    assigned_driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_muni ON public.vehicles(municipality_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);

-- ==========================================
-- 6. ROUTE ASSIGNMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.route_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    municipality_id UUID NOT NULL REFERENCES public.municipalities(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
    distance_km NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    estimated_time_minutes INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DRAFT')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routes_muni ON public.route_assignments(municipality_id);

-- ==========================================
-- 7. ROUTE STOPS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.route_assignments(id) ON DELETE CASCADE,
    bin_id UUID REFERENCES public.smart_bins(id) ON DELETE SET NULL,
    stop_order INTEGER NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    estimated_arrival_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_route_stop_order UNIQUE (route_id, stop_order)
);

CREATE INDEX IF NOT EXISTS idx_route_stops_route ON public.route_stops(route_id);

-- ==========================================
-- 8. COLLECTION ASSIGNMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.collection_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_code TEXT NOT NULL UNIQUE,
    municipality_id UUID NOT NULL REFERENCES public.municipalities(id) ON DELETE CASCADE,
    collector_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    route_id UUID REFERENCES public.route_assignments(id) ON DELETE SET NULL,
    sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
    area_name TEXT NOT NULL DEFAULT 'Sector 1',
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW', 'URGENT')),
    status TEXT NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN (
        'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COLLECTED', 'COMPLETED', 'CANCELLED'
    )),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    proof_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_muni ON public.collection_assignments(municipality_id);
CREATE INDEX IF NOT EXISTS idx_assignments_collector ON public.collection_assignments(collector_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.collection_assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_priority ON public.collection_assignments(priority);

-- ==========================================
-- 9. COLLECTION RECORDS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.collection_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.collection_assignments(id) ON DELETE CASCADE,
    bin_id UUID NOT NULL REFERENCES public.smart_bins(id) ON DELETE CASCADE,
    collector_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    weight_kg NUMERIC(8, 2) NOT NULL DEFAULT 0.0,
    fill_level_before NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    proof_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'COLLECTED' CHECK (status IN ('COLLECTED', 'VERIFIED', 'FLAGGED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_records_assignment ON public.collection_records(assignment_id);
CREATE INDEX IF NOT EXISTS idx_records_bin ON public.collection_records(bin_id);
CREATE INDEX IF NOT EXISTS idx_records_collector ON public.collection_records(collector_id);
CREATE INDEX IF NOT EXISTS idx_records_date ON public.collection_records(collected_at);

-- ==========================================
-- 10. BIN TELEMETRY
-- ==========================================
CREATE TABLE IF NOT EXISTS public.bin_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bin_id UUID NOT NULL REFERENCES public.smart_bins(id) ON DELETE CASCADE,
    fill_percentage NUMERIC(5, 2) NOT NULL CHECK (fill_percentage >= 0.0 AND fill_percentage <= 100.0),
    temperature_c NUMERIC(5, 2) NOT NULL,
    weight_kg NUMERIC(8, 2) NOT NULL,
    battery_pct NUMERIC(5, 2) NOT NULL DEFAULT 100.0,
    is_simulated BOOLEAN NOT NULL DEFAULT false,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_bin ON public.bin_telemetry(bin_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_recorded_at ON public.bin_telemetry(recorded_at);

-- ==========================================
-- 11. WASTE CLASSIFICATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.waste_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    municipality_id UUID REFERENCES public.municipalities(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    binary_category TEXT NOT NULL CHECK (binary_category IN ('Biodegradable', 'Non-Biodegradable')),
    broad_category TEXT NOT NULL CHECK (broad_category IN (
        'Plastic', 'Organic', 'Paper', 'Metal', 'Glass', 'E-Waste', 'Textile', 'Hazardous', 'Medical'
    )),
    fine_class TEXT NOT NULL,
    confidence_score NUMERIC(5, 4) NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    disposal_guide TEXT NOT NULL,
    recycling_guide TEXT NOT NULL,
    model_mode TEXT NOT NULL DEFAULT 'AI_VISION_PIPELINE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classifications_user ON public.waste_classifications(user_id);
CREATE INDEX IF NOT EXISTS idx_classifications_muni ON public.waste_classifications(municipality_id);
CREATE INDEX IF NOT EXISTS idx_classifications_date ON public.waste_classifications(created_at);

-- ==========================================
-- 12. COMPLAINTS (Citizen Grievance Portal)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT NOT NULL UNIQUE,
    citizen_name TEXT NOT NULL,
    citizen_phone TEXT,
    citizen_email TEXT,
    municipality_id UUID NOT NULL REFERENCES public.municipalities(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
    smart_bin_id UUID REFERENCES public.smart_bins(id) ON DELETE SET NULL,
    complaint_type TEXT NOT NULL CHECK (complaint_type IN (
        'Overflowing Bin', 'Missed Collection', 'Damaged Bin', 'Illegal Dumping', 'Other'
    )),
    description TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN (
        'SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'RESOLVED', 'CLOSED'
    )),
    assigned_collector_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_complaints_ticket ON public.complaints(ticket_number);
CREATE INDEX IF NOT EXISTS idx_complaints_muni ON public.complaints(municipality_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);

-- ==========================================
-- 13. NOTIFICATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_target TEXT CHECK (role_target IN ('ALL', 'SUPER_ADMIN', 'ADMIN', 'GARBAGE_COLLECTOR', 'MUNICIPALITY_MONITOR')),
    municipality_id UUID REFERENCES public.municipalities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'INFO' CHECK (notification_type IN (
        'INFO', 'OVERFLOW_ALERT', 'TASK_ASSIGNED', 'TASK_COMPLETED', 'SYSTEM_ALERT', 'DAMAGE_REPORT'
    )),
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_muni ON public.notifications(municipality_id);
CREATE INDEX IF NOT EXISTS idx_notifications_role ON public.notifications(role_target);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);

-- ==========================================
-- 14. AUDIT LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT,
    ip_address TEXT DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_date ON public.audit_logs(created_at);

-- ==========================================
-- 15. WASTE PREDICTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.waste_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id UUID NOT NULL REFERENCES public.municipalities(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES public.sectors(id) ON DELETE SET NULL,
    prediction_date DATE NOT NULL,
    predicted_waste_kg NUMERIC(10, 2) NOT NULL,
    recycling_rate_pct NUMERIC(5, 2) NOT NULL DEFAULT 75.0,
    high_waste_zones JSONB NOT NULL DEFAULT '[]'::jsonb,
    overflow_risk_bins JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_model_forecast BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_muni_prediction_date UNIQUE (municipality_id, prediction_date)
);

CREATE INDEX IF NOT EXISTS idx_predictions_muni_date ON public.waste_predictions(municipality_id, prediction_date);

-- ==========================================
-- 16. SYSTEM SETTINGS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'GENERAL',
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- AUTOMATIC TIMESTAMPS TRIGGER FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers
DROP TRIGGER IF EXISTS tr_municipalities_updated_at ON public.municipalities;
CREATE TRIGGER tr_municipalities_updated_at BEFORE UPDATE ON public.municipalities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_sectors_updated_at ON public.sectors;
CREATE TRIGGER tr_sectors_updated_at BEFORE UPDATE ON public.sectors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_smart_bins_updated_at ON public.smart_bins;
CREATE TRIGGER tr_smart_bins_updated_at BEFORE UPDATE ON public.smart_bins FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER tr_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_route_assignments_updated_at ON public.route_assignments;
CREATE TRIGGER tr_route_assignments_updated_at BEFORE UPDATE ON public.route_assignments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_collection_assignments_updated_at ON public.collection_assignments;
CREATE TRIGGER tr_collection_assignments_updated_at BEFORE UPDATE ON public.collection_assignments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_complaints_updated_at ON public.complaints;
CREATE TRIGGER tr_complaints_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER tr_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================
-- AUTH SIGNUP PROFILE AUTO-CREATION TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT;
    assigned_muni UUID;
    user_full_name TEXT;
BEGIN
    assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'GARBAGE_COLLECTOR');
    user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    
    IF NEW.raw_user_meta_data->>'municipality_id' IS NOT NULL AND NEW.raw_user_meta_data->>'municipality_id' != '' THEN
        assigned_muni := (NEW.raw_user_meta_data->>'municipality_id')::UUID;
    ELSE
        assigned_muni := NULL;
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        employee_id,
        role,
        municipality_id,
        phone_number,
        status
    )
    VALUES (
        NEW.id,
        NEW.email,
        user_full_name,
        COALESCE(NEW.raw_user_meta_data->>'employee_id', 'EMP-' || substr(NEW.id::text, 1, 6)),
        assigned_role,
        assigned_muni,
        NEW.raw_user_meta_data->>'phone_number',
        'ACTIVE'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

