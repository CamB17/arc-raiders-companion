# Quick Start: Building Your Own API

## TL;DR

**Goal**: Create your own API that combines Metaforge + Supabase data  
**Cost**: $0/month (free tier)  
**Time**: 2-3 hours setup  
**Result**: Faster, better API than Metaforge

## Three Options (Pick One)

### Option 1: Supabase Edge Functions ⭐ Recommended
- ✅ Already using Supabase
- ✅ Free tier: 500K requests/month
- ✅ Serverless (no server to manage)
- ✅ Direct database access
- ⚠️ 60s execution limit

**Setup Time**: 1-2 hours

### Option 2: Self-Hosted Node.js Server
- ✅ No limits
- ✅ Complete control
- ✅ Can use Redis for caching
- ⚠️ Needs always-on computer/server
- ⚠️ Need to handle deployment

**Setup Time**: 2-3 hours

### Option 3: Cloudflare Workers
- ✅ Fastest performance
- ✅ Free tier: 100K requests/day
- ✅ No cold starts
- ⚠️ Need to learn Workers API

**Setup Time**: 2-3 hours

## Recommended: Supabase Edge Functions

### Why?
1. You already have Supabase
2. Free tier is generous (500K/month)
3. Direct database access
4. Easy deployment

### Quick Setup (5 Steps)

#### 1. Create Cache Table
Run this SQL in Supabase:

```sql
CREATE TABLE IF NOT EXISTS public.api_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT NOT NULL UNIQUE,
    endpoint TEXT NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_cache_key ON public.api_cache(cache_key);
CREATE INDEX idx_api_cache_expires ON public.api_cache(expires_at);

ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.api_cache FOR SELECT USING (true);
```

#### 2. Install Supabase CLI
```bash
npm install -g supabase
supabase login
```

#### 3. Initialize Functions
```bash
mkdir -p supabase/functions/arc-raiders-api
cd supabase/functions/arc-raiders-api
```

#### 4. Copy Implementation Code
See `API_IMPLEMENTATION.md` for full code.

#### 5. Deploy
```bash
supabase link --project-ref your-project-ref
supabase functions deploy arc-raiders-api
```

#### 6. Update Frontend
Change `BASE_URL` in `useArcRaidersApi.ts`:

```typescript
const BASE_URL = 'https://your-project.supabase.co/functions/v1/arc-raiders-api';
```

Done! ✅

## What You Get

### Before (Metaforge API)
- ❌ Direct calls to Metaforge (slow)
- ❌ No custom data merged
- ❌ Rate limiting risk
- ❌ CORS issues

### After (Your API)
- ✅ Cached responses (fast)
- ✅ Auto-merged custom data
- ✅ No rate limits (cached)
- ✅ No CORS issues
- ✅ Additional endpoints (maps, events)

## Cost Breakdown

### Supabase Free Tier
- **Functions**: 500K invocations/month = **FREE**
- **Database**: 500MB = **FREE**
- **Bandwidth**: 2GB/month = **FREE**

**Total: $0/month**

### If You Need More
- Functions: $0.00000025 per invocation
- Database: $0.125/GB/month
- Bandwidth: $0.09/GB/month

**Example**: 1M requests/month = **$0.125/month** (still basically free!)

## Performance Improvements

### Cache Hit Rate
- **First request**: ~500ms (fetch from Metaforge)
- **Cached requests**: ~50ms (from Supabase cache)
- **Cache hit rate**: ~90% (after initial load)

### Benefits
- 10x faster for cached requests
- 90% fewer Metaforge API calls
- Better user experience
- No rate limiting issues

## Alternative: Self-Hosted Node.js Server

If you prefer complete control, see `SELF_HOSTED_API.md` for a Node.js/Express implementation.

## Next Steps

1. ✅ Read `API_ARCHITECTURE.md` for full details
2. ✅ Read `API_IMPLEMENTATION.md` for code
3. ✅ Choose your option (Supabase recommended)
4. ✅ Follow setup steps
5. ✅ Deploy and test
6. ✅ Update frontend

## Questions?

- **Q: What if I exceed free tier?**  
  A: Very unlikely, but costs are minimal ($0.125/month for 1M requests)

- **Q: Can I cache longer?**  
  A: Yes! Change TTL in `setCachedData()` function (default 24 hours)

- **Q: What about Metaforge API changes?**  
  A: Cache expires automatically, or manually clear cache when needed

- **Q: Can I add more endpoints?**  
  A: Yes! Just add new handlers in `index.ts`

- **Q: How do I monitor usage?**  
  A: Supabase dashboard shows function invocations and bandwidth

## Support

If you run into issues:
1. Check Supabase function logs
2. Verify cache table exists
3. Test Metaforge API directly
4. Check environment variables

Happy coding! 🚀

