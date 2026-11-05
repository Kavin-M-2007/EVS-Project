-- EcoSort AI - Intelligent Waste Management System
-- Seed Data: Demonstration Environment (Peelamedu, Coimbatore Region)
-- Creates test accounts for all 4 roles, smart bins, routes, vehicles, complaints, predictions, and audit logs.

-- ========================================================
-- 1. MUNICIPALITIES (Fixed UUIDs for deterministic referential integrity)
-- ========================================================
INSERT INTO public.municipalities (id, name, code, state, country, total_area_sqkm, population, contact_email, contact_phone)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Coimbatore Municipal Corporation (CCMC)', 'CCMC-01', 'Tamil Nadu', 'India', 257.0, 1600000, 'clean.coimbatore@ecosort.gov.in', '+91 422 2302323'),
    ('a0000000-0000-0000-0000-000000000002', 'Green Valley Municipality', 'GV-02', 'Karnataka', 'India', 88.2, 620000, 'ecozone@greenvalley.gov.in', '+91 80 22975500'),
    ('a0000000-0000-0000-0000-000000000003', 'Harbor Bay Municipality', 'HB-03', 'Kerala', 'India', 110.0, 480000, 'harbor.cleantown@ecosort.gov.in', '+91 484 2361234')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code;

-- ========================================================
-- 2. SECTORS (Peelamedu Zones)
-- ========================================================
INSERT INTO public.sectors (id, municipality_id, name, code, description)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Avinashi Road Commercial Corridor', 'SEC-CBE-01', 'High-density commercial highway stretch from Lakshmi Mills to Hope College'),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Hope College & Fun Republic Sector', 'SEC-CBE-02', 'Retail shopping, dining entertainment and transit junction zone'),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 'TIDEL Park & ELCOT IT SEZ', 'SEC-CBE-03', 'Major software parks, IT campuses and Vilankurichi arterial link'),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Civil Aerodrome & Airport Zone', 'SEC-CBE-04', 'International airport perimeter and cargo terminal area'),
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'PSG Tech & Academic Corridor', 'SEC-CBE-05', 'University campuses, research labs and student residential zones')
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- 3. AUTH USERS & PROFILES (Testing Accounts for all 4 roles)
-- Password for all seed accounts: Admin@123
-- ========================================================
-- Seed auth.users with encrypted bcrypt hashes
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
)
VALUES
    -- 1. Super Admin: Dr. Alexander Vance
    (
        'c0000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000000',
        'superadmin@ecosort.ai',
        crypt('Admin@123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Dr. Alexander Vance","role":"SUPER_ADMIN","employee_id":"SA-001"}',
        now(),
        now(),
        'authenticated',
        'authenticated'
    ),
    -- 2. Municipal Admin: Sarah Jenkins (Coimbatore CCMC)
    (
        'c0000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000000',
        'admin.metro@ecosort.ai',
        crypt('Admin@123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Sarah Jenkins","role":"ADMIN","employee_id":"ADM-101","municipality_id":"a0000000-0000-0000-0000-000000000001"}',
        now(),
        now(),
        'authenticated',
        'authenticated'
    ),
    -- 3. Garbage Collector: Rajesh Sharma
    (
        'c0000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000000',
        'collector.metro@ecosort.ai',
        crypt('Admin@123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Rajesh Sharma","role":"GARBAGE_COLLECTOR","employee_id":"GC-501","municipality_id":"a0000000-0000-0000-0000-000000000001"}',
        now(),
        now(),
        'authenticated',
        'authenticated'
    ),
    -- 4. Municipality Monitor: Elena Rostova
    (
        'c0000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000000',
        'monitor.metro@ecosort.ai',
        crypt('Admin@123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Elena Rostova","role":"MUNICIPALITY_MONITOR","employee_id":"MON-801","municipality_id":"a0000000-0000-0000-0000-000000000001"}',
        now(),
        now(),
        'authenticated',
        'authenticated'
    ),
    -- 5. Field Collector 2: Vikram Patel
    (
        'c0000000-0000-0000-0000-000000000005',
        '00000000-0000-0000-0000-000000000000',
        'collector2.metro@ecosort.ai',
        crypt('Admin@123', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Vikram Patel","role":"GARBAGE_COLLECTOR","employee_id":"GC-502","municipality_id":"a0000000-0000-0000-0000-000000000001"}',
        now(),
        now(),
        'authenticated',
        'authenticated'
    )
ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- Explicitly ensure public.profiles are updated for these accounts
INSERT INTO public.profiles (id, email, full_name, employee_id, role, municipality_id, assigned_sector_id, phone_number, status)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'superadmin@ecosort.ai', 'Dr. Alexander Vance', 'SA-001', 'SUPER_ADMIN', NULL, NULL, '+91 98422 11001', 'ACTIVE'),
    ('c0000000-0000-0000-0000-000000000002', 'admin.metro@ecosort.ai', 'Sarah Jenkins', 'ADM-101', 'ADMIN', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '+91 98422 22002', 'ACTIVE'),
    ('c0000000-0000-0000-0000-000000000003', 'collector.metro@ecosort.ai', 'Rajesh Sharma', 'GC-501', 'GARBAGE_COLLECTOR', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '+91 98422 33003', 'ACTIVE'),
    ('c0000000-0000-0000-0000-000000000004', 'monitor.metro@ecosort.ai', 'Elena Rostova', 'MON-801', 'MUNICIPALITY_MONITOR', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', '+91 98422 44004', 'ACTIVE'),
    ('c0000000-0000-0000-0000-000000000005', 'collector2.metro@ecosort.ai', 'Vikram Patel', 'GC-502', 'GARBAGE_COLLECTOR', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', '+91 98422 55005', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    municipality_id = EXCLUDED.municipality_id,
    assigned_sector_id = EXCLUDED.assigned_sector_id,
    phone_number = EXCLUDED.phone_number;

-- ========================================================
-- 4. COLLECTION VEHICLES (Peelamedu TN-38 EV Fleet)
-- ========================================================
INSERT INTO public.vehicles (id, vehicle_code, plate_number, municipality_id, model, capacity_kg, current_load_kg, status, current_lat, current_lng, assigned_driver_id)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'VEH-EV-01', 'TN-38-EV-4421', 'a0000000-0000-0000-0000-000000000001', 'EcoCompactor 4000 EV', 4000.0, 2150.0, 'ACTIVE', 11.0245, 77.0028, 'c0000000-0000-0000-0000-000000000003'),
    ('d0000000-0000-0000-0000-000000000002', 'VEH-EV-02', 'TN-38-EV-4422', 'a0000000-0000-0000-0000-000000000001', 'EcoCompactor 4000 EV', 4000.0, 1420.0, 'ACTIVE', 11.0315, 77.0280, 'c0000000-0000-0000-0000-000000000005'),
    ('d0000000-0000-0000-0000-000000000003', 'VEH-EV-03', 'TN-38-EV-4423', 'a0000000-0000-0000-0000-000000000001', 'MicroHauler Urban 1500', 1500.0, 480.0, 'ACTIVE', 11.0215, 76.9940, NULL),
    ('d0000000-0000-0000-0000-000000000004', 'VEH-GV-01', 'KA-05-EV-1088', 'a0000000-0000-0000-0000-000000000002', 'EcoCompactor 4000 EV', 4000.0, 0.0, 'ACTIVE', 12.9716, 77.5946, NULL)
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- 5. SMART BINS (Peelamedu, Coimbatore Landmarks)
-- ========================================================
INSERT INTO public.smart_bins (id, bin_code, municipality_id, sector_id, location_name, latitude, longitude, waste_category, fill_level, max_capacity_liters, status, battery_level, temperature_c, weight_kg, last_collection_time)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'BIN-MC-001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'PSG College of Technology Main Gate, Avinashi Road', 11.0245, 77.0028, 'Plastic', 94.0, 240.0, 'CRITICAL', 88.0, 29.5, 38.4, now() - INTERVAL '4 hours'),
    ('e0000000-0000-0000-0000-000000000002', 'BIN-MC-002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Peelamedu Central Bus Shelter, Avinashi Road', 11.0260, 77.0085, 'Organic', 86.5, 240.0, 'NEAR_FULL', 92.0, 30.2, 44.0, now() - INTERVAL '5 hours'),
    ('e0000000-0000-0000-0000-000000000003', 'BIN-MC-003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Hope College Junction South, Kamarajar Road', 11.0282, 77.0130, 'Paper & Cardboard', 45.0, 240.0, 'NORMAL', 96.0, 28.0, 18.5, now() - INTERVAL '7 hours'),
    ('e0000000-0000-0000-0000-000000000004', 'BIN-MC-004', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Fun Republic Mall Promenade, Avinashi Road', 11.0308, 77.0182, 'Mixed Waste', 92.0, 240.0, 'CRITICAL', 79.0, 29.8, 36.0, now() - INTERVAL '3 hours'),
    ('e0000000-0000-0000-0000-000000000005', 'BIN-MC-005', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 'TIDEL Park IT Expressway, Vilankurichi Road', 11.0315, 77.0280, 'Plastic', 78.0, 240.0, 'NEAR_FULL', 90.0, 29.1, 29.2, now() - INTERVAL '6 hours'),
    ('e0000000-0000-0000-0000-000000000006', 'BIN-MC-006', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Coimbatore Airport Terminal, Civil Aerodrome', 11.0305, 77.0430, 'Metal & Cans', 34.0, 240.0, 'NORMAL', 98.0, 27.4, 14.8, now() - INTERVAL '8 hours'),
    ('e0000000-0000-0000-0000-000000000007', 'BIN-MC-007', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'PSGR Krishnammal College Gate, Avinashi Road', 11.0268, 77.0062, 'Organic', 62.0, 240.0, 'NORMAL', 91.0, 28.5, 24.5, now() - INTERVAL '5 hours'),
    ('e0000000-0000-0000-0000-000000000008', 'BIN-MC-008', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Peelamedu Railway Feeder Road, Kamarajar Road', 11.0212, 77.0075, 'E-Waste Drop', 58.0, 240.0, 'NORMAL', 95.0, 28.2, 22.0, now() - INTERVAL '9 hours'),
    ('e0000000-0000-0000-0000-000000000009', 'BIN-MC-009', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000005', 'Nava India Signal Crossing, Avinashi Road', 11.0215, 76.9940, 'Plastic', 91.5, 240.0, 'CRITICAL', 84.0, 30.0, 37.0, now() - INTERVAL '2 hours'),
    ('e0000000-0000-0000-0000-000000000010', 'BIN-MC-010', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Lakshmi Mills Junction Square, Avinashi Road', 11.0182, 76.9855, 'Organic', 25.0, 240.0, 'NORMAL', 99.0, 27.1, 11.0, now() - INTERVAL '10 hours')
ON CONFLICT (id) DO NOTHING;

-- Telemetry readings for bins
INSERT INTO public.bin_telemetry (bin_id, fill_percentage, temperature_c, weight_kg, battery_pct, recorded_at)
SELECT 
    id,
    fill_level,
    temperature_c,
    weight_kg,
    battery_level,
    now()
FROM public.smart_bins;

-- ========================================================
-- 6. ROUTES & STOPS (Avinashi Road & TIDEL Park)
-- ========================================================
INSERT INTO public.route_assignments (id, route_code, name, municipality_id, sector_id, distance_km, estimated_time_minutes, status)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'RT-CBE-AVINASHI-01', 'Avinashi Road Commercial Corridor', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 11.6, 38, 'ACTIVE'),
    ('f0000000-0000-0000-0000-000000000002', 'RT-CBE-TIDEL-02', 'TIDEL Park & Aerodrome Circuit', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003', 14.2, 45, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.route_stops (route_id, bin_id, stop_order, location_name, latitude, longitude, estimated_arrival_minutes)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000010', 1, 'Lakshmi Mills Junction Square', 11.0182, 76.9855, 0),
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000009', 2, 'Nava India Signal Crossing', 11.0215, 76.9940, 6),
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 3, 'PSG College of Technology Main Gate', 11.0245, 77.0028, 14),
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000007', 4, 'PSGR Krishnammal College Gate', 11.0268, 77.0062, 19),
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 5, 'Peelamedu Central Bus Shelter', 11.0260, 77.0085, 23),
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 6, 'Hope College Junction South', 11.0282, 77.0130, 28),
    ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 7, 'Fun Republic Mall Promenade', 11.0308, 77.0182, 38)
ON CONFLICT DO NOTHING;

-- ========================================================
-- 7. COLLECTION ASSIGNMENTS & RECORDS
-- ========================================================
INSERT INTO public.collection_assignments (
    id, assignment_code, municipality_id, collector_id, vehicle_id, route_id, sector_id,
    area_name, priority, status, assigned_at, accepted_at, started_at, notes
)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'TASK-20261105-001',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000001',
        'f0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        'Peelamedu & Avinashi Road Commercial Corridor',
        'HIGH',
        'IN_PROGRESS',
        now() - INTERVAL '2 hours',
        now() - INTERVAL '1 hour 45 minutes',
        now() - INTERVAL '40 minutes',
        'Priority pickup for overflowing bins at PSG Tech Gate and Fun Republic Mall.'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'TASK-20261105-002',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000002',
        'f0000000-0000-0000-0000-000000000002',
        'b0000000-0000-0000-0000-000000000003',
        'Hope College & TIDEL Park Express',
        'MEDIUM',
        'ASSIGNED',
        now() - INTERVAL '30 minutes',
        NULL,
        NULL,
        'Scheduled afternoon collection round.'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'TASK-20261105-003',
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000005',
        'd0000000-0000-0000-0000-000000000003',
        NULL,
        'b0000000-0000-0000-0000-000000000005',
        'Nava India & Lakshmi Mills',
        'LOW',
        'COMPLETED',
        now() - INTERVAL '6 hours',
        now() - INTERVAL '5 hours 50 minutes',
        now() - INTERVAL '5 hours 30 minutes',
        'Routine morning clearance completed along Avinashi Road.'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.collection_records (assignment_id, bin_id, collector_id, weight_kg, fill_level_before, collected_at, status)
VALUES
    ('10000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000005', 28.5, 90.0, now() - INTERVAL '4 hours', 'COLLECTED'),
    ('10000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000005', 24.0, 85.0, now() - INTERVAL '4 hours 20 minutes', 'COLLECTED');

-- ========================================================
-- 8. CITIZEN COMPLAINTS
-- ========================================================
INSERT INTO public.complaints (ticket_number, citizen_name, citizen_phone, citizen_email, municipality_id, sector_id, smart_bin_id, complaint_type, description, location_name, latitude, longitude, status)
VALUES
    (
        'ECO-TKT-8841',
        'Pooja Kulkarni',
        '+91 98422 22334',
        'pooja.k@gmail.com',
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000002',
        'e0000000-0000-0000-0000-000000000003',
        'Overflowing Bin',
        'The blue plastic recycling bin near Hope College bus stop has overflowed onto the pavement.',
        'Hope College Junction, Avinashi Road, Peelamedu',
        11.0282,
        77.0130,
        'UNDER_REVIEW'
    ),
    (
        'ECO-TKT-9214',
        'Amitabh Mehra',
        '+91 98422 33445',
        'amehra@outlook.com',
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000002',
        'e0000000-0000-0000-0000-000000000004',
        'Damaged Bin',
        'Smart bin sensor solar lid damaged by falling branch during rain near Fun Republic.',
        'Fun Republic Mall Promenade, Avinashi Road, Peelamedu',
        11.0308,
        77.0182,
        'SUBMITTED'
    )
ON CONFLICT (ticket_number) DO NOTHING;

-- ========================================================
-- 9. NOTIFICATIONS
-- ========================================================
INSERT INTO public.notifications (user_id, role_target, municipality_id, title, message, notification_type, is_read)
VALUES
    (
        NULL,
        'ALL',
        NULL,
        'System Operational Synchronization',
        'EcoSort AI platform synchronized for Coimbatore Municipal Corporation (Peelamedu Zone).',
        'SYSTEM_ALERT',
        false
    ),
    (
        NULL,
        'ADMIN',
        'a0000000-0000-0000-0000-000000000001',
        'Urgent Bin Overflow Alert',
        'Smart Bin BIN-MC-001 at PSG College of Technology Main Gate reached 94% capacity.',
        'OVERFLOW_ALERT',
        false
    ),
    (
        'c0000000-0000-0000-0000-000000000003',
        NULL,
        'a0000000-0000-0000-0000-000000000001',
        'Task Assignment: Commercial Corridor',
        'You have been assigned priority task TASK-20261105-001 in Peelamedu Commercial Corridor.',
        'TASK_ASSIGNED',
        false
    )
ON CONFLICT DO NOTHING;

-- ========================================================
-- 10. AUDIT LOGS
-- ========================================================
INSERT INTO public.audit_logs (user_id, user_email, user_role, action, entity_type, entity_id, details, ip_address)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'superadmin@ecosort.ai', 'SUPER_ADMIN', 'SYSTEM_INITIALIZATION', 'SYSTEM', 'SYS-01', 'EcoSort AI Peelamedu, Coimbatore municipal region initialized with Supabase backend.', '127.0.0.1'),
    ('c0000000-0000-0000-0000-000000000002', 'admin.metro@ecosort.ai', 'ADMIN', 'DISPATCH_OPTIMIZATION', 'COLLECTION_TASK', 'TASK-20261105-001', 'Dispatched 2 EV collection teams to Peelamedu Avinashi Corridor.', '127.0.0.1')
ON CONFLICT DO NOTHING;

-- ========================================================
-- 11. PREDICTIONS
-- ========================================================
INSERT INTO public.waste_predictions (
    municipality_id, sector_id, prediction_date, predicted_waste_kg, recycling_rate_pct,
    high_waste_zones, overflow_risk_bins, recommendations, is_model_forecast
)
VALUES
    (
        'a0000000-0000-0000-0000-000000000001',
        'b0000000-0000-0000-0000-000000000001',
        CURRENT_DATE,
        14650.0,
        76.5,
        '[{"zone": "Avinashi Road Commercial Corridor", "risk_level": "CRITICAL", "predicted_volume_kg": 4620, "peak_window": "18:00 - 21:00"}, {"zone": "Fun Republic Mall & Food Hub", "risk_level": "HIGH", "predicted_volume_kg": 3840, "peak_window": "20:00 - 23:30"}]'::jsonb,
        '[{"bin_code": "BIN-MC-001", "location": "PSG Tech Main Gate", "estimated_overflow_time": "17:30"}, {"bin_code": "BIN-MC-004", "location": "Fun Republic Mall", "estimated_overflow_time": "19:15"}]'::jsonb,
        '[{"id": "REC-01", "priority": "HIGH", "action": "Deploy 2 additional compactor vehicles to Avinashi Road Commercial Corridor before 17:00."}]'::jsonb,
        true
    )
ON CONFLICT (municipality_id, prediction_date) DO NOTHING;

-- ========================================================
-- 12. SYSTEM SETTINGS
-- ========================================================
INSERT INTO public.system_settings (key, value, category, description)
VALUES
    ('PLATFORM_NAME', 'EcoSort AI - Intelligent Waste Management System', 'GENERAL', 'System display title across interfaces'),
    ('CRITICAL_OVERFLOW_THRESHOLD', '90', 'ALERTS', 'Percentage threshold at which smart bins enter critical alert status'),
    ('NEAR_FULL_THRESHOLD', '70', 'ALERTS', 'Percentage threshold at which smart bins enter near-full status'),
    ('DEFAULT_MAP_CENTER_LAT', '11.0260', 'GIS', 'Peelamedu, Coimbatore latitude'),
    ('DEFAULT_MAP_CENTER_LNG', '77.0100', 'GIS', 'Peelamedu, Coimbatore longitude'),
    ('DEFAULT_MAP_ZOOM', '15', 'GIS', 'Default Leaflet zoom level for Peelamedu operations')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value;

