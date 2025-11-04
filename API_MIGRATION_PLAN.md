# Complete API Migration Plan

## Overview

This document outlines the complete plan to migrate from Metaforge API to your own API that stores all Metaforge data in Supabase.

## Architecture Decision

**Approach**: Store all Metaforge data permanently in Supabase, not just cache it.

**Benefits**:
- ✅ No dependency on Metaforge API in production
- ✅ Faster queries (direct database access)
- ✅ Better search capabilities
- ✅ Full control over data
- ✅ Can enhance data with custom fields
- ✅ Cost effective (no API call costs)

## Migration Steps

### Step 1: Create Database Schema ⏱️ 5 minutes

Run the SQL from `STORING_METAFORGE_DATA.md` in your Supabase SQL Editor to create:
- `items` table
- `quests` table
- `traders` table
- `arcs` table
- `recipes` table

### Step 2: Install Dependencies ⏱️ 2 minutes

```bash
npm install
```

This will install:
- `tsx` - TypeScript execution
- `dotenv` - Environment variables
- `@types/node` - Node.js types

### Step 3: Set Up Environment Variables ⏱️ 1 minute

Create or update `.env`:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note**: Use Service Role Key (not anon key) for sync script to have full access.

### Step 4: Run Initial Sync ⏱️ 10-30 minutes

```bash
npm run sync
```

This will:
- Fetch all items from Metaforge
- Fetch all quests from Metaforge
- Fetch all traders from Metaforge
- Fetch all arcs/enemies from Metaforge
- Store everything in Supabase

**Note**: First sync may take 10-30 minutes depending on data volume.

### Step 5: Update API to Read from Supabase ⏱️ 2 hours

Follow `API_IMPLEMENTATION.md` but modify to read from Supabase tables instead of calling Metaforge.

Key changes:
- Remove Metaforge API calls
- Read directly from `items`, `quests`, `traders`, `arcs` tables
- Merge with `custom_items`, `custom_quests` tables
- Return merged data

### Step 6: Set Up Periodic Sync ⏱️ 15 minutes

Choose one:

**Option A: GitHub Actions** (Recommended for free)
- Create `.github/workflows/sync.yml`
- Runs daily at 2 AM UTC
- Free for public repos

**Option B: Supabase Cron**
- Set up pg_cron in Supabase
- Runs daily automatically

**Option C: Manual**
- Run `npm run sync` whenever you want to update

### Step 7: Update Frontend ⏱️ 5 minutes

Change `BASE_URL` in `src/hooks/useArcRaidersApi.ts`:

```typescript
const BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:54321/functions/v1/arc-raiders-api'  // Local dev
  : 'https://your-project.supabase.co/functions/v1/arc-raiders-api'  // Production
```

That's it! Your frontend code stays the same.

## File Structure

```
arc-raiders-companion/
├── scripts/
│   └── sync-from-metaforge.ts    # Sync script
├── supabase/
│   └── functions/
│       └── arc-raiders-api/
│           └── index.ts           # Your API (to be created)
├── STORING_METAFORGE_DATA.md     # Database schema & sync guide
├── API_IMPLEMENTATION.md          # API implementation (update for Supabase)
└── package.json                   # Updated with sync script
```

## Current Status

✅ Database schema created (SQL ready)  
✅ Sync script created (`scripts/sync-from-metaforge.ts`)  
✅ Package.json updated with sync command  
⏳ Database tables need to be created (run SQL)  
⏳ Initial sync needs to be run (`npm run sync`)  
⏳ API needs to be updated (read from Supabase)  
⏳ Periodic sync needs to be set up  

## Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
# Edit .env file

# 3. Run initial sync
npm run sync

# 4. Verify data in Supabase
# Check Supabase dashboard -> Table Editor

# 5. Build API (once implemented)
# supabase functions deploy arc-raiders-api

# 6. Update frontend
# Change BASE_URL in useArcRaidersApi.ts
```

## Testing

After sync, verify data:

```sql
-- Check items count
SELECT COUNT(*) FROM items;

-- Check quests count
SELECT COUNT(*) FROM quests;

-- Check latest sync time
SELECT MAX(synced_at) FROM items;
```

## Troubleshooting

### Sync fails with "relation does not exist"
- Run the SQL schema from `STORING_METAFORGE_DATA.md` first

### Sync fails with authentication error
- Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Make sure you're using Service Role Key, not anon key

### Sync is slow
- Normal for first sync (10-30 minutes)
- Script includes rate limiting (1 second between pages)
- Subsequent syncs are faster (only updates changed data)

### Missing data
- Check Metaforge API is accessible
- Check network connection
- Check Supabase logs for errors

## Next Steps

1. ✅ Review this plan
2. 📝 Run database schema SQL
3. 📝 Run initial sync (`npm run sync`)
4. 📝 Verify data in Supabase
5. 📝 Implement API Edge Function (read from Supabase)
6. 📝 Deploy API
7. 📝 Update frontend
8. 📝 Set up periodic sync

## Support

If you run into issues:
1. Check Supabase logs
2. Check sync script output
3. Verify environment variables
4. Test Metaforge API directly

## Benefits Achieved

✅ **No Metaforge dependency** - All data in your database  
✅ **Faster queries** - Direct database access  
✅ **Better search** - Full-text search capabilities  
✅ **Custom filtering** - Complex queries with Supabase  
✅ **Data ownership** - You control the data  
✅ **Cost effective** - No API call costs  
✅ **Enhanced data** - Merged with custom data automatically  

You're now independent from Metaforge API! 🎉

