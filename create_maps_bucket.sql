-- ============================================================
-- IMPORTANT: Storage policies in Supabase typically need to 
-- be set up through the Storage UI, not SQL.
-- 
-- This SQL file provides alternative policies if you have 
-- the necessary permissions. However, the RECOMMENDED way
-- is to use the Supabase Storage UI (see instructions below).
-- ============================================================

-- OPTION 1: Use Supabase Storage UI (RECOMMENDED)
-- 1. Go to Storage → Policies in Supabase Dashboard
-- 2. Select the "maps" bucket
-- 3. Click "New Policy"
-- 4. Choose "For full customization" → "New policy"
-- 5. Copy and paste the policy SQL below into the editor
-- 6. Repeat for each policy

-- OPTION 2: Run via SQL (requires owner/admin permissions)
-- If you have owner/admin permissions, you can try running
-- these policies. Uncomment them if needed.

/*
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to maps bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to maps bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to maps bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from maps bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to maps bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to maps bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from maps bucket" ON storage.objects;

-- Allow public read access to maps bucket
CREATE POLICY "Allow public read access to maps bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'maps');

-- Allow authenticated users to insert/upload
CREATE POLICY "Allow authenticated uploads to maps bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'maps');

-- Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated updates to maps bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'maps');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated deletes from maps bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'maps');
*/

-- If you want public uploads (less secure but simpler):
-- Uncomment these if you want anyone to upload without authentication

/*
CREATE POLICY "Allow public uploads to maps bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'maps');

CREATE POLICY "Allow public updates to maps bucket"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'maps');

CREATE POLICY "Allow public deletes from maps bucket"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'maps');
*/

