# Supabase Storage Setup for Maps

## ⚠️ IMPORTANT: Create the Bucket First

You **must** create the storage bucket before uploading images. Follow these steps:

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar (it's in the left navigation menu)
3. Click **"New bucket"** button (top right)
4. **Bucket name**: Enter `maps` (must be exactly this name)
5. **Public bucket**: Toggle this **ON** (important - allows public access to images)
6. **File size limit**: Leave default or set to 20MB (for map images)
7. Click **"Create bucket"**

### Visual Guide:
- Storage button is usually near the bottom of the left sidebar
- After clicking "New bucket", you'll see a form with:
  - Name field → type `maps`
  - Public bucket toggle → turn it ON
  - Create button → click it

**Once created, you should see "maps" listed in your buckets.**

## Step 2: Set Up Bucket Policies (Optional but Recommended)

If you want to restrict who can upload:

1. Go to **Storage** > **Policies**
2. Click on the `maps` bucket
3. Add a policy for uploading:

**Policy Name**: Allow authenticated uploads
**Policy Definition**:
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'maps');

CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE 
TO authenticated
USING (bucket_id = 'maps');

CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'maps');
```

If you want public uploads (less secure):

```sql
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT 
TO public
WITH CHECK (bucket_id = 'maps');

CREATE POLICY "Allow public updates" ON storage.objects
FOR UPDATE 
TO public
USING (bucket_id = 'maps');

CREATE POLICY "Allow public deletes" ON storage.objects
FOR DELETE 
TO public
USING (bucket_id = 'maps');
```

**For public read access** (default for public buckets):
```sql
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'maps');
```

## Step 3: Verify Setup

After creating the bucket, you should be able to:

1. Upload images via the admin map form
2. Images will be stored in `maps/images/` folder
3. Thumbnails will be stored in `maps/thumbnails/` folder
4. Images will be accessible via public URLs automatically

## Folder Structure

The storage bucket will have this structure:
```
maps/
  ├── images/
  │   ├── 1234567890-abc123.png
  │   ├── 1234567891-def456.jpg
  │   └── ...
  └── thumbnails/
      ├── 1234567890-abc123-thumb.png
      └── ...
```

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket is named exactly `maps`
- Check that the bucket exists in Storage

### Error: "New row violates row-level security policy"
- Set up the RLS policies as shown above
- Or make the bucket public with public upload policies

### Images not showing after upload
- Verify the bucket is public
- Check that the public URL is being generated correctly
- Check browser console for CORS errors

### Upload fails silently
- Check browser console for errors
- Verify Supabase credentials in `.env`
- Make sure the file size is under the limit (default 10MB for maps, 5MB for thumbnails)

