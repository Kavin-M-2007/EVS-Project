-- EcoSort AI - Intelligent Waste Management System
-- Migration 03: Supabase Storage Buckets Configuration
-- Creates dedicated buckets for collection proofs, complaint images, classification uploads and avatars.

-- 1. Insert Storage Buckets if they don't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('collection-proof', 'collection-proof', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('complaint-photos', 'complaint-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('waste-classification-images', 'waste-classification-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/bmp']),
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Objects Access Policies

-- Collection Proof: Authenticated collectors & admins can upload; authenticated users can view
CREATE POLICY "collection_proof_upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'collection-proof');

CREATE POLICY "collection_proof_select"
    ON storage.objects FOR SELECT
    TO authenticated, anon
    USING (bucket_id = 'collection-proof');

-- Complaint Photos: Anyone (including anonymous citizens) can upload and view
CREATE POLICY "complaint_photos_upload"
    ON storage.objects FOR INSERT
    TO authenticated, anon
    WITH CHECK (bucket_id = 'complaint-photos');

CREATE POLICY "complaint_photos_select"
    ON storage.objects FOR SELECT
    TO authenticated, anon
    USING (bucket_id = 'complaint-photos');

-- Waste Classification Images: Anyone can upload images for AI analysis and view
CREATE POLICY "classification_images_upload"
    ON storage.objects FOR INSERT
    TO authenticated, anon
    WITH CHECK (bucket_id = 'waste-classification-images');

CREATE POLICY "classification_images_select"
    ON storage.objects FOR SELECT
    TO authenticated, anon
    USING (bucket_id = 'waste-classification-images');

-- Avatars: Authenticated users can upload and view
CREATE POLICY "avatars_upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "avatars_select"
    ON storage.objects FOR SELECT
    TO authenticated, anon
    USING (bucket_id = 'avatars');

