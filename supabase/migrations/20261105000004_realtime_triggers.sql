-- EcoSort AI - Intelligent Waste Management System
-- Migration 04: Supabase Realtime Publication Setup
-- Enables realtime replication for tables required for live dashboards, IoT telemetry, and fleet tracking.

-- Enable replica identity FULL on critical tables so complete row records are broadcasted on update
ALTER TABLE public.smart_bins REPLICA IDENTITY FULL;
ALTER TABLE public.collection_assignments REPLICA IDENTITY FULL;
ALTER TABLE public.collection_records REPLICA IDENTITY FULL;
ALTER TABLE public.complaints REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.bin_telemetry REPLICA IDENTITY FULL;
ALTER TABLE public.vehicles REPLICA IDENTITY FULL;

-- Add operational tables to the supabase_realtime publication
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.smart_bins;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_assignments;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_records;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.bin_telemetry;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;

