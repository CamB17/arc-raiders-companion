# Storage Policies for Supabase UI

Since storage policies require owner permissions in SQL, use the Supabase Storage UI instead.

## Setup Steps

1. **Create the bucket first** (if not done):
   - Go to Supabase Dashboard → Storage
   - Click "New bucket"
   - Name: `maps`
   - Toggle "Public bucket" ON
   - Click "Create bucket"

2. **Set up policies via UI**:
   - Go to Storage → Policies
   - Click on the "maps" bucket
   - Click "New Policy"
   - Choose "For full customization" → "New policy"

## Policy 1: Public Read Access (REQUIRED)

This allows anyone to view/download images from the bucket.

**Policy Name:** `Allow public read access to maps bucket`

**Policy Definition:**
```sql
FOR SELECT
TO public
USING (bucket_id = 'maps');
```

**How to add:**
1. Policy name: `Allow public read access to maps bucket`
2. Allowed operation: `SELECT` (for reading)
3. Target roles: `public`
4. USING expression: `bucket_id = 'maps'`

---

## Policy 2: Authenticated Uploads (RECOMMENDED)

This allows authenticated users to upload images.

**Policy Name:** `Allow authenticated uploads to maps bucket`

**Policy Definition:**
```sql
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'maps');
```

**How to add:**
1. Policy name: `Allow authenticated uploads to maps bucket`
2. Allowed operation: `INSERT` (for uploading)
3. Target roles: `authenticated`
4. WITH CHECK expression: `bucket_id = 'maps'`

---

## Policy 3: Authenticated Updates

Allows authenticated users to update their uploads.

**Policy Name:** `Allow authenticated updates to maps bucket`

**Policy Definition:**
```sql
FOR UPDATE
TO authenticated
USING (bucket_id = 'maps');
```

**How to add:**
1. Policy name: `Allow authenticated updates to maps bucket`
2. Allowed operation: `UPDATE`
3. Target roles: `authenticated`
4. USING expression: `bucket_id = 'maps'`

---

## Policy 4: Authenticated Deletes

Allows authenticated users to delete their uploads.

**Policy Name:** `Allow authenticated deletes from maps bucket`

**Policy Definition:**
```sql
FOR DELETE
TO authenticated
USING (bucket_id = 'maps');
```

**How to add:**
1. Policy name: `Allow authenticated deletes from maps bucket`
2. Allowed operation: `DELETE`
3. Target roles: `authenticated`
4. USING expression: `bucket_id = 'maps'`

---

## Alternative: Public Uploads (Less Secure)

If you want anyone to upload without authentication (for simpler setup but less secure):

**Policy Name:** `Allow public uploads to maps bucket`
```sql
FOR INSERT
TO public
WITH CHECK (bucket_id = 'maps');
```

**Policy Name:** `Allow public updates to maps bucket`
```sql
FOR UPDATE
TO public
USING (bucket_id = 'maps');
```

**Policy Name:** `Allow public deletes from maps bucket`
```sql
FOR DELETE
TO public
USING (bucket_id = 'maps');
```

---

## Quick Setup (Simplest)

**Minimum required for uploads to work:**

1. Make bucket public (toggle "Public bucket" ON when creating)
2. Add Policy 1 (Public Read) - REQUIRED for images to display
3. Add Policy 2 (Public Upload) - for uploading without auth

**For authenticated uploads only:**
1. Make bucket public
2. Add Policy 1 (Public Read)
3. Add Policy 2 (Authenticated Upload)
4. Add Policy 3 (Authenticated Update)
5. Add Policy 4 (Authenticated Delete)

---

## Testing

After setting up policies, try uploading an image in the admin map form. If you get permission errors, double-check:
- Bucket exists and is named `maps`
- Bucket is public (for read access)
- Policies are correctly configured
- You're using the correct bucket name in the upload component

