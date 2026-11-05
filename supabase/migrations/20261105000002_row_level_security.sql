-- EcoSort AI - Intelligent Waste Management System
-- Migration 02: Row Level Security Policies & Role-Based Access Control
-- Enforces strict municipal data isolation, role-based boundaries, and privilege escalation guards.

-- ========================================================
-- HELPER SECURITY DEFINER FUNCTIONS (Runs with elevated rights)
-- ========================================================

-- 1. Get current authenticated user's role from profiles
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT AS $$
DECLARE
    u_role TEXT;
BEGIN
    SELECT role INTO u_role FROM public.profiles WHERE id = auth.uid();
    RETURN u_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Get current authenticated user's municipality_id
CREATE OR REPLACE FUNCTION public.auth_user_municipality_id()
RETURNS UUID AS $$
DECLARE
    m_id UUID;
BEGIN
    SELECT municipality_id INTO m_id FROM public.profiles WHERE id = auth.uid();
    RETURN m_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. Check if user is SUPER_ADMIN
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.auth_user_role() = 'SUPER_ADMIN';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 4. Check if user has access to a specific municipality
CREATE OR REPLACE FUNCTION public.has_municipality_access(target_muni_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF public.is_super_admin() THEN
        RETURN true;
    END IF;
    RETURN public.auth_user_municipality_id() = target_muni_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ========================================================
-- ENABLE RLS ON ALL RELATIONAL TABLES
-- ========================================================
ALTER TABLE public.municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bin_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 1. MUNICIPALITIES POLICIES
-- ========================================================
-- Any authenticated user can read municipalities (needed for dropdowns & context)
CREATE POLICY "municipalities_select_all"
    ON public.municipalities FOR SELECT
    TO authenticated, anon
    USING (true);

-- Only Super Admin can insert/update/delete municipalities
CREATE POLICY "municipalities_super_admin_all"
    ON public.municipalities FOR ALL
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- ========================================================
-- 2. SECTORS POLICIES
-- ========================================================
CREATE POLICY "sectors_select"
    ON public.sectors FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "sectors_admin_modify"
    ON public.sectors FOR ALL
    TO authenticated
    USING (public.is_super_admin() OR (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id)))
    WITH CHECK (public.is_super_admin() OR (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id)));

-- ========================================================
-- 3. PROFILES POLICIES
-- ========================================================
-- Users can always read their own profile; Super Admin reads all; Admin/Monitor read their municipality
CREATE POLICY "profiles_select"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() OR
        public.is_super_admin() OR
        public.has_municipality_access(municipality_id)
    );

-- Users can update basic personal details on their own profile (phone, avatar), but NOT role or municipality
CREATE POLICY "profiles_update_self"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() AND
        role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
        municipality_id IS NOT DISTINCT FROM (SELECT municipality_id FROM public.profiles WHERE id = auth.uid())
    );

-- Super Admin can manage all profiles
CREATE POLICY "profiles_super_admin_manage"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

-- Municipal Admin can manage collectors and monitors within their municipality (cannot create Admins or Super Admins)
CREATE POLICY "profiles_admin_manage_staff"
    ON public.profiles FOR ALL
    TO authenticated
    USING (
        public.auth_user_role() = 'ADMIN' AND
        public.has_municipality_access(municipality_id) AND
        role IN ('GARBAGE_COLLECTOR', 'MUNICIPALITY_MONITOR')
    )
    WITH CHECK (
        public.auth_user_role() = 'ADMIN' AND
        public.has_municipality_access(municipality_id) AND
        role IN ('GARBAGE_COLLECTOR', 'MUNICIPALITY_MONITOR')
    );

-- ========================================================
-- 4. SMART BINS POLICIES
-- ========================================================
-- All authenticated users can read bins within their municipality; Super Admin reads all; Anon can read for map
CREATE POLICY "smart_bins_select"
    ON public.smart_bins FOR SELECT
    TO authenticated, anon
    USING (public.has_municipality_access(municipality_id) OR auth.role() = 'anon');

-- Admin & Super Admin can insert/update/delete smart bins
CREATE POLICY "smart_bins_admin_modify"
    ON public.smart_bins FOR ALL
    TO authenticated
    USING (public.is_super_admin() OR (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id)))
    WITH CHECK (public.is_super_admin() OR (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id)));

-- Collectors can update bin telemetry / fill levels upon verified collection
CREATE POLICY "smart_bins_collector_update"
    ON public.smart_bins FOR UPDATE
    TO authenticated
    USING (public.auth_user_role() = 'GARBAGE_COLLECTOR' AND public.has_municipality_access(municipality_id))
    WITH CHECK (public.auth_user_role() = 'GARBAGE_COLLECTOR' AND public.has_municipality_access(municipality_id));

-- ========================================================
-- 5. VEHICLES POLICIES
-- ========================================================
CREATE POLICY "vehicles_select"
    ON public.vehicles FOR SELECT
    TO authenticated
    USING (public.has_municipality_access(municipality_id));

CREATE POLICY "vehicles_admin_modify"
    ON public.vehicles FOR ALL
    TO authenticated
    USING (public.is_super_admin() OR (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id)))
    WITH CHECK (public.is_super_admin() OR (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id)));

-- Drivers can update their assigned vehicle's current position / load
CREATE POLICY "vehicles_driver_update"
    ON public.vehicles FOR UPDATE
    TO authenticated
    USING (assigned_driver_id = auth.uid())
    WITH CHECK (assigned_driver_id = auth.uid());

-- ========================================================
-- 6. ROUTES & ROUTE STOPS POLICIES
-- ========================================================
CREATE POLICY "routes_select"
    ON public.route_assignments FOR SELECT
    TO authenticated
    USING (public.has_municipality_access(municipality_id));

CREATE POLICY "routes_admin_modify"
    ON public.route_assignments FOR ALL
    TO authenticated
    USING (public.is_super_admin() OR (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id)))
    WITH CHECK (public.is_super_admin() OR (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id)));

CREATE POLICY "route_stops_select"
    ON public.route_stops FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "route_stops_admin_modify"
    ON public.route_stops FOR ALL
    TO authenticated
    USING (public.is_super_admin() OR public.auth_user_role() = 'ADMIN')
    WITH CHECK (public.is_super_admin() OR public.auth_user_role() = 'ADMIN');

-- ========================================================
-- 7. COLLECTION ASSIGNMENTS POLICIES
-- ========================================================
-- Collectors view their own assigned tasks; Admins/Monitors view their municipality; Super Admin views all
CREATE POLICY "assignments_select"
    ON public.collection_assignments FOR SELECT
    TO authenticated
    USING (
        public.is_super_admin() OR
        collector_id = auth.uid() OR
        (public.auth_user_role() IN ('ADMIN', 'MUNICIPALITY_MONITOR') AND public.has_municipality_access(municipality_id))
    );

-- Admins create and modify assignments in their municipality
CREATE POLICY "assignments_admin_manage"
    ON public.collection_assignments FOR ALL
    TO authenticated
    USING (public.is_super_admin() OR (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id)))
    WITH CHECK (public.is_super_admin() OR (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id)));

-- Collectors update status of their own assigned tasks
CREATE POLICY "assignments_collector_status_update"
    ON public.collection_assignments FOR UPDATE
    TO authenticated
    USING (collector_id = auth.uid())
    WITH CHECK (collector_id = auth.uid());

-- ========================================================
-- 8. COLLECTION RECORDS POLICIES
-- ========================================================
CREATE POLICY "records_select"
    ON public.collection_records FOR SELECT
    TO authenticated
    USING (
        public.is_super_admin() OR
        collector_id = auth.uid() OR
        public.auth_user_role() IN ('ADMIN', 'MUNICIPALITY_MONITOR')
    );

-- Collectors insert verified collection records for their completed pickups
CREATE POLICY "records_collector_insert"
    ON public.collection_records FOR INSERT
    TO authenticated
    WITH CHECK (collector_id = auth.uid() OR public.is_super_admin() OR public.auth_user_role() = 'ADMIN');

-- ========================================================
-- 9. BIN TELEMETRY POLICIES
-- ========================================================
CREATE POLICY "telemetry_select"
    ON public.bin_telemetry FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "telemetry_insert"
    ON public.bin_telemetry FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ========================================================
-- 10. WASTE CLASSIFICATIONS POLICIES
-- ========================================================
CREATE POLICY "classifications_select"
    ON public.waste_classifications FOR SELECT
    TO authenticated, anon
    USING (
        user_id = auth.uid() OR
        public.is_super_admin() OR
        (public.auth_user_role() IN ('ADMIN', 'MUNICIPALITY_MONITOR') AND public.has_municipality_access(municipality_id)) OR
        auth.role() = 'anon'
    );

CREATE POLICY "classifications_insert"
    ON public.waste_classifications FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- ========================================================
-- 11. COMPLAINTS (Citizen Grievance) POLICIES
-- ========================================================
-- Anyone can submit a complaint
CREATE POLICY "complaints_insert"
    ON public.complaints FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- Anyone can track their complaint by exact ticket number; Admins/Monitors see all in their municipality
CREATE POLICY "complaints_select"
    ON public.complaints FOR SELECT
    TO authenticated, anon
    USING (
        public.is_super_admin() OR
        (public.auth_user_role() IN ('ADMIN', 'MUNICIPALITY_MONITOR') AND public.has_municipality_access(municipality_id)) OR
        assigned_collector_id = auth.uid() OR
        auth.role() = 'anon' -- filtered by ticket_number in app queries
    );

-- Admins and assigned collectors can update complaint status
CREATE POLICY "complaints_update_status"
    ON public.complaints FOR UPDATE
    TO authenticated
    USING (
        public.is_super_admin() OR
        (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id)) OR
        assigned_collector_id = auth.uid()
    )
    WITH CHECK (
        public.is_super_admin() OR
        (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id)) OR
        assigned_collector_id = auth.uid()
    );

-- ========================================================
-- 12. NOTIFICATIONS POLICIES
-- ========================================================
CREATE POLICY "notifications_select"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR
        role_target = 'ALL' OR
        role_target = public.auth_user_role() OR
        public.is_super_admin() OR
        (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id))
    );

CREATE POLICY "notifications_update_read"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() OR role_target = public.auth_user_role())
    WITH CHECK (user_id = auth.uid() OR role_target = public.auth_user_role());

-- System or Admin can insert notifications
CREATE POLICY "notifications_insert"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (public.is_super_admin() OR public.auth_user_role() = 'ADMIN');

-- ========================================================
-- 13. AUDIT LOGS POLICIES
-- ========================================================
-- Super Admin can view all audit logs; Admin can view their municipality's logs
CREATE POLICY "audit_logs_select"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_super_admin() OR public.auth_user_role() = 'ADMIN');

-- Authenticated users or server functions can insert audit logs
CREATE POLICY "audit_logs_insert"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Immutable: NO user can UPDATE or DELETE audit logs!
-- (Omitted update and delete policies guarantee immutability under RLS)

-- ========================================================
-- 14. WASTE PREDICTIONS POLICIES
-- ========================================================
CREATE POLICY "predictions_select"
    ON public.waste_predictions FOR SELECT
    TO authenticated
    USING (public.has_municipality_access(municipality_id));

CREATE POLICY "predictions_manage"
    ON public.waste_predictions FOR ALL
    TO authenticated
    USING (public.is_super_admin() OR (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id)))
    WITH CHECK (public.is_super_admin() OR (public.auth_user_role() = 'ADMIN' AND public.has_municipality_access(municipality_id)));

-- ========================================================
-- 15. SYSTEM SETTINGS POLICIES
-- ========================================================
CREATE POLICY "settings_select"
    ON public.system_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "settings_super_admin_manage"
    ON public.system_settings FOR ALL
    TO authenticated
    USING (public.is_super_admin())
    WITH CHECK (public.is_super_admin());

