# Building Your Own Arc Raiders API

## Overview

This document outlines how to build your own API that combines Metaforge API data with your Supabase custom data, providing a better, faster, and free alternative to Metaforge's API.

## Architecture Options (All Free Tier)

### Option 1: Supabase Edge Functions (Recommended)
- **Free Tier**: 500K invocations/month, 2GB bandwidth
- **Pros**: 
  - Already using Supabase, easy integration
  - Serverless, auto-scaling
  - Built-in database access
  - TypeScript support
- **Cons**: 
  - Cold starts (100-300ms)
  - Execution time limits (60s on free tier)

### Option 2: Cloudflare Workers
- **Free Tier**: 100K requests/day, unlimited bandwidth
- **Pros**: 
  - Fastest edge computing (runs globally)
  - No cold starts
  - Generous free tier
  - Can use Cloudflare KV for caching
- **Cons**: 
  - Need to use Fetch API (not Node.js)
  - KV storage limits (128MB free)

### Option 3: Vercel Serverless Functions
- **Free Tier**: 100GB-hours compute, 100GB bandwidth
- **Pros**: 
  - Easy deployment
  - Good performance
  - Built-in analytics
- **Cons**: 
  - Cold starts
  - Execution time limits (10s on hobby)

### Option 4: Self-Hosted (Your Computer/Home Server)
- **Free Tier**: Your own hardware
- **Pros**: 
  - Complete control
  - No limits
  - Can use your own database
- **Cons**: 
  - Requires always-on hardware
  - Need to handle deployment yourself
  - Requires domain/DNS setup

## Recommended Solution: Supabase Edge Functions + Caching

### Why This Approach?

1. **Already have Supabase** - No new infrastructure needed
2. **Free tier is generous** - 500K requests/month is plenty for personal use
3. **Direct database access** - Can merge data efficiently
4. **Can cache in Supabase** - Use a `cached_data` table for Metaforge responses

### Architecture

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│   Supabase Edge Functions (API)     │
│   /api/items                         │
│   /api/items/:id                     │
│   /api/quests                        │
│   /api/traders                       │
│   /api/arcs                          │
└──────┬──────────────────────────────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌─────────────┐  ┌──────────┐  ┌──────────┐
│   Supabase  │  │ Metaforge│  │  Cache   │
│   Database  │  │   API    │  │  Table   │
│             │  │          │  │          │
│ -custom_    │  │          │  │ -items   │
│  items      │  │          │  │ -quests  │
│ -custom_    │  │          │  │ -etc     │
│  quests     │  │          │  │          │
│ -maps       │  │          │  │          │
│ -events     │  │          │  │          │
└─────────────┘  └──────────┘  └──────────┘
```

### Data Flow

1. **Request comes in** → Edge Function
2. **Check cache** → Look in `cached_data` table for Metaforge response
3. **If cache miss** → Fetch from Metaforge API
4. **Store in cache** → Save to `cached_data` table (TTL: 1-24 hours)
5. **Merge with Supabase data** → Combine Metaforge data with custom data
6. **Return enhanced response** → Single unified response

## Implementation Steps

### Step 1: Create Cache Table in Supabase

```sql
-- Cache table for Metaforge API responses
CREATE TABLE IF NOT EXISTS public.api_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT NOT NULL UNIQUE, -- e.g., 'items:all', 'items:herbal-bandage'
    endpoint TEXT NOT NULL, -- e.g., 'items', 'quests'
    data JSONB NOT NULL, -- Cached API response
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_api_cache_key ON public.api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON public.api_cache(expires_at);

-- Cleanup expired cache entries function
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM public.api_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read (API will read this)
CREATE POLICY "Allow public read access on api_cache" 
    ON public.api_cache FOR SELECT USING (true);
```

### Step 2: Set Up Supabase Edge Functions

Create a new directory structure:

```
supabase/
  functions/
    arc-raiders-api/
      index.ts
      lib/
        cache.ts
        metaforge.ts
        merge.ts
        types.ts
```

### Step 3: Create Edge Function Code

See `API_IMPLEMENTATION.md` for detailed code.

### Step 4: Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy arc-raiders-api
```

### Step 5: Update Frontend to Use New API

Change `useArcRaidersApi.ts` to point to your Supabase Edge Function:

```typescript
const BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:54321/functions/v1/arc-raiders-api'  // Local dev
  : 'https://your-project.supabase.co/functions/v1/arc-raiders-api'  // Production
```

## Improvements Over Metaforge API

### 1. **Single Endpoint for Merged Data**
   - No need to fetch from multiple sources
   - All data pre-merged server-side

### 2. **Better Caching**
   - Aggressive caching reduces Metaforge API calls
   - Faster responses for users
   - Lower risk of rate limiting

### 3. **Enhanced Data**
   - Automatically includes custom Supabase data
   - Items include tips, locations, meta ratings
   - Quests include walkthroughs, guides
   - Maps include markers and zones

### 4. **Better Structure**
   - Consistent response format
   - Better error handling
   - More predictable pagination

### 5. **Additional Endpoints**
   - `/api/maps` - Your custom maps with markers
   - `/api/events` - Active events with timers
   - `/api/search` - Unified search across all data

### 6. **Performance**
   - Edge functions run globally
   - Cached responses are instant
   - No CORS issues

## Cost Analysis

### Supabase Free Tier
- **Functions**: 500K invocations/month = ~16K/day
- **Database**: 500MB storage
- **Bandwidth**: 2GB/month
- **Cost**: $0/month

### If You Exceed Free Tier
- **Functions**: $0.00000025 per invocation after free tier
- **Database**: $0.125/GB/month after free tier
- **Bandwidth**: $0.09/GB after free tier

**Example**: 1M requests/month = $0.125/month (very cheap!)

## Alternative: Self-Hosted Option

If you want complete control and don't want any limits:

### Using Node.js + Express

```bash
# Create API server
mkdir arc-raiders-api-server
cd arc-raiders-api-server
npm init -y
npm install express cors dotenv @supabase/supabase-js axios node-cache
```

### Benefits
- No invocation limits
- Can run 24/7 on your computer
- Can use Redis for caching
- Complete control

### Setup
- Use `pm2` or `forever` to keep it running
- Use `ngrok` or `cloudflare tunnel` for public access
- Or deploy to free VPS (Oracle Cloud, AWS Free Tier, etc.)

## Next Steps

1. ✅ Review this architecture
2. 📝 Create cache table schema
3. 📝 Set up Supabase Edge Functions
4. 📝 Implement API endpoints
5. 📝 Deploy and test
6. 📝 Update frontend to use new API

See `API_IMPLEMENTATION.md` for detailed code examples.

