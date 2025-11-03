# Troubleshooting Guide

Common issues and their solutions for Arc Raiders Companion with Supabase.

## "Failed to save custom item"

### Quick Diagnostic Steps

1. **Open Browser Console** (F12 or Cmd+Option+I)
   - Look for red error messages
   - Check what error code/message appears

2. **Common Error Codes**

#### Error: "relation 'public.custom_items' does not exist" (Code 42P01)

**Problem**: Database tables haven't been created.

**Solution**:
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the sidebar
3. Open `SUPABASE_SCHEMA.md` from the project
4. Copy the entire SQL schema
5. Paste into SQL Editor and click **Run**
6. Refresh your app and try again

#### Error: "new row violates row-level security policy" (Code 42501)

**Problem**: RLS policies are blocking your insert.

**Solution**:
1. Go to Supabase → Table Editor → custom_items
2. Click the **RLS** button (shield icon)
3. Verify you have these policies:
   - "Allow public insert on custom_items" - FOR INSERT
   - "Allow public read access on custom_items" - FOR SELECT

Or run this SQL to fix it:
```sql
-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow public insert on custom_items" ON custom_items;
DROP POLICY IF EXISTS "Allow public read access on custom_items" ON custom_items;

-- Recreate policies
CREATE POLICY "Allow public insert on custom_items" 
ON custom_items FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read access on custom_items" 
ON custom_items FOR SELECT 
USING (true);

CREATE POLICY "Allow public update on custom_items" 
ON custom_items FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete on custom_items" 
ON custom_items FOR DELETE 
USING (true);
```

#### Error: "Invalid API key" or JWT errors

**Problem**: Supabase credentials are incorrect or missing.

**Solution**:
1. Check your `.env` file exists in project root
2. Verify it has:
   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
3. Get correct values from Supabase → Settings → API
4. Restart dev server: `npm run dev`

#### Error: "Failed to fetch" or Network Error

**Problem**: Can't connect to Supabase.

**Solution**:
1. Check your Supabase project is active (not paused)
2. Verify VITE_SUPABASE_URL is correct
3. Check your internet connection
4. Try accessing Supabase dashboard directly
5. Check if URL has any typos

#### Error: "duplicate key value violates unique constraint"

**Problem**: An item with that `item_id` already exists.

**Solution**:
1. Each `item_id` can only have one custom data entry
2. Go to `/admin/items` to see existing entries
3. Edit the existing entry instead of creating new
4. Or use a different `item_id`

### Detailed Debugging

#### Check if Supabase is Connected

1. Visit `/admin`
2. Look for "Supabase Connected" indicator
3. If you see setup instructions instead, Supabase isn't configured

#### Verify Tables Exist

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. You should see 6 tables:
   - custom_items
   - custom_quests
   - custom_traders
   - custom_locations
   - custom_guides
   - custom_builds

If tables are missing, run the schema from `SUPABASE_SCHEMA.md`.

#### Test Connection Manually

Open browser console and run:

```javascript
// Test if supabase client works
const { supabase } = await import('/src/lib/supabase.ts')

// Try to read from table
const { data, error } = await supabase.from('custom_items').select('*').limit(1)

if (error) {
  console.error('Connection test failed:', error)
} else {
  console.log('✓ Connection works!', data)
}
```

#### Check Form Data

Before submitting, check what's being sent:

1. Open browser console
2. Try to save an item
3. Look for log: "Attempting to save custom item with data:"
4. Verify all fields look correct

### Common Mistakes

#### ❌ Missing .env file
Create `.env` in project root (where package.json is)

#### ❌ Wrong env variable names
Must start with `VITE_` for Vite to read them:
- ✅ `VITE_SUPABASE_URL`
- ❌ `SUPABASE_URL`

#### ❌ Forgot to restart server
After creating/editing `.env`, always restart: `npm run dev`

#### ❌ Schema not run
Tables won't exist until you run the SQL schema

#### ❌ Quotes in .env
Don't use quotes around values:
- ✅ `VITE_SUPABASE_URL=https://...`
- ❌ `VITE_SUPABASE_URL="https://..."`

## Other Common Issues

### Admin Dashboard Shows Setup Instructions

**Problem**: Supabase appears not configured.

**Solution**:
1. Verify `.env` file exists
2. Check env variables are correct
3. Restart dev server
4. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

### "Cannot read property 'id' of undefined"

**Problem**: Trying to access data that doesn't exist.

**Solution**:
1. Add null checks: `item?.id`
2. Verify API is returning data
3. Check network tab for failed requests

### Data Not Showing on Frontend

**Problem**: Custom data saved but not displaying.

**Solution**:
1. Make sure you're using `useMergedItem` or `useMergedQuest` hooks
2. Check the `item_id` in custom data exactly matches API item ID
3. Clear React Query cache by refreshing page
4. Check browser console for errors

### Slow Performance

**Problem**: Admin pages loading slowly.

**Solution**:
1. Check Supabase dashboard → Usage for limits
2. Add pagination if you have many records
3. Use indexes (already in schema)
4. Consider caching strategies

### TypeScript Errors

**Problem**: Type errors in custom data.

**Solution**:
1. Check types in `src/lib/supabase.ts` match your schema
2. Run `npm run build` to check all types
3. Update types if you modified schema

## Still Having Issues?

### Get More Help

1. **Check Browser Console**
   - Press F12 (or Cmd+Option+I on Mac)
   - Look in Console tab for errors
   - Check Network tab for failed requests

2. **Check Supabase Logs**
   - Supabase Dashboard → API → Logs
   - Look for failed requests
   - Check error messages

3. **Verify Schema**
   - Compare your database with `SUPABASE_SCHEMA.md`
   - Make sure all tables and columns exist
   - Check RLS policies are enabled

4. **Test with cURL**
   ```bash
   curl 'https://YOUR_PROJECT.supabase.co/rest/v1/custom_items' \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json"
   ```

5. **Common Debug Commands**
   ```bash
   # Check if .env is loaded
   echo $VITE_SUPABASE_URL
   
   # Verify node_modules
   npm list @supabase/supabase-js
   
   # Clean install
   rm -rf node_modules
   npm install
   ```

## Reporting Issues

When reporting issues, include:

1. **Error message** from browser console
2. **Error code** if available
3. **What you were doing** when error occurred
4. **Browser** and version
5. **Environment**:
   - Is Supabase configured? (check /admin)
   - Did you run the schema?
   - Can you see tables in Supabase?

## Prevention Tips

✅ **Always check browser console** for detailed errors  
✅ **Test after each setup step** before moving on  
✅ **Keep backups** of your database (Supabase has auto-backups)  
✅ **Use version control** for schema changes  
✅ **Document custom setup** if you modify the schema  

---

Most issues are solved by:
1. Running the SQL schema
2. Checking RLS policies
3. Verifying environment variables
4. Restarting the dev server

Happy debugging! 🐛

