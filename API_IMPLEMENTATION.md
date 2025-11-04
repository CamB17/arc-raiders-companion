# API Implementation Guide

## Step 1: Create Cache Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Cache table for Metaforge API responses
CREATE TABLE IF NOT EXISTS public.api_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT NOT NULL UNIQUE,
    endpoint TEXT NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_api_cache_key ON public.api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires ON public.api_cache(expires_at);

-- Cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM public.api_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- RLS policies
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on api_cache" 
    ON public.api_cache FOR SELECT USING (true);
```

## Step 2: Set Up Supabase Edge Functions

### Install Supabase CLI

```bash
npm install -g supabase
```

### Initialize Supabase Functions

```bash
# In your project root
mkdir -p supabase/functions/arc-raiders-api
cd supabase/functions/arc-raiders-api
```

### Create Function Structure

```
supabase/functions/arc-raiders-api/
├── index.ts          # Main entry point
├── lib/
│   ├── cache.ts      # Cache utilities
│   ├── metaforge.ts  # Metaforge API client
│   ├── merge.ts      # Data merging logic
│   └── types.ts      # TypeScript types
└── deno.json         # Deno config (Edge Functions use Deno)
```

## Step 3: Implementation Code

### deno.json

```json
{
  "imports": {
    "supabase": "https://esm.sh/@supabase/supabase-js@2"
  }
}
```

### lib/types.ts

```typescript
export interface CacheEntry {
  cache_key: string;
  endpoint: string;
  data: any;
  expires_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
}
```

### lib/cache.ts

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function getCachedData(cacheKey: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('api_cache')
    .select('*')
    .eq('cache_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data.data;
}

export async function setCachedData(
  cacheKey: string,
  endpoint: string,
  data: any,
  ttlHours: number = 24
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + ttlHours);

  await supabase
    .from('api_cache')
    .upsert({
      cache_key: cacheKey,
      endpoint,
      data,
      expires_at: expiresAt.toISOString(),
    });
}

export function generateCacheKey(
  endpoint: string,
  params?: Record<string, any>
): string {
  const paramsStr = params
    ? ':' + Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
    : '';
  return `${endpoint}${paramsStr}`;
}
```

### lib/metaforge.ts

```typescript
const METAFORGE_BASE_URL = 'https://metaforge.app/api/arc-raiders';

export async function fetchFromMetaforge(
  endpoint: string,
  params?: Record<string, any>
): Promise<any> {
  const url = new URL(`${METAFORGE_BASE_URL}/${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Metaforge API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}
```

### lib/merge.ts

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function mergeItemWithCustomData(item: any): Promise<any> {
  const { data: customData } = await supabase
    .from('custom_items')
    .select('*')
    .eq('item_id', item.id)
    .single();

  if (!customData) return item;

  return {
    ...item,
    // Override with custom fields
    name: customData.custom_name || item.name,
    description: customData.custom_description || item.description,
    image: customData.custom_image || item.image || item.icon,
    // Add custom fields
    tips: customData.tips,
    locationsFound: customData.locations_found,
    bestUseCases: customData.best_use_cases,
    metaRating: customData.meta_rating,
    metaNotes: customData.meta_notes,
    customTags: customData.tags,
    // Keep original data
    _original: item,
    _custom: customData,
  };
}

export async function mergeQuestWithCustomData(quest: any): Promise<any> {
  const { data: customData } = await supabase
    .from('custom_quests')
    .select('*')
    .eq('quest_id', quest.id)
    .single();

  if (!customData) return quest;

  return {
    ...quest,
    name: customData.custom_name || quest.name,
    description: customData.custom_description || quest.description,
    walkthrough: customData.walkthrough,
    tips: customData.tips,
    hiddenObjectives: customData.hidden_objectives,
    optimalRoute: customData.optimal_route,
    timeEstimate: customData.time_estimate,
    difficultyRating: customData.difficulty_rating,
    videoGuideUrl: customData.video_guide_url,
    mapMarkers: customData.map_markers,
    customTags: customData.tags,
    _original: quest,
    _custom: customData,
  };
}

export async function mergeItemsWithCustomData(items: any[]): Promise<any[]> {
  // Fetch all custom data for these items in one query
  const itemIds = items.map(item => item.id);
  
  const { data: customItems } = await supabase
    .from('custom_items')
    .select('*')
    .in('item_id', itemIds);

  const customMap = new Map(
    customItems?.map(custom => [custom.item_id, custom]) || []
  );

  return items.map(item => {
    const custom = customMap.get(item.id);
    if (!custom) return item;

    return {
      ...item,
      name: custom.custom_name || item.name,
      description: custom.custom_description || item.description,
      image: custom.custom_image || item.image || item.icon,
      tips: custom.tips,
      locationsFound: custom.locations_found,
      bestUseCases: custom.best_use_cases,
      metaRating: custom.meta_rating,
      metaNotes: custom.meta_notes,
      customTags: custom.tags,
    };
  });
}
```

### index.ts (Main Entry Point)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCachedData, setCachedData, generateCacheKey } from './lib/cache.ts';
import { fetchFromMetaforge } from './lib/metaforge.ts';
import { 
  mergeItemWithCustomData, 
  mergeQuestWithCustomData,
  mergeItemsWithCustomData 
} from './lib/merge.ts';

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/arc-raiders-api', '');
    const params = Object.fromEntries(url.searchParams.entries());

    // Route handling
    if (path.startsWith('/items')) {
      return await handleItems(req, params, corsHeaders);
    } else if (path.startsWith('/quests')) {
      return await handleQuests(req, params, corsHeaders);
    } else if (path.startsWith('/traders')) {
      return await handleTraders(req, params, corsHeaders);
    } else if (path.startsWith('/arcs')) {
      return await handleArcs(req, params, corsHeaders);
    } else if (path.startsWith('/maps')) {
      return await handleMaps(req, params, corsHeaders);
    } else if (path.startsWith('/events')) {
      return await handleEvents(req, params, corsHeaders);
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleItems(req: Request, params: any, corsHeaders: any) {
  const cacheKey = generateCacheKey('items', params);
  
  // Check cache
  let data = await getCachedData(cacheKey);
  let cached = true;

  if (!data) {
    // Fetch from Metaforge
    cached = false;
    data = await fetchFromMetaforge('items', params);
    
    // Cache for 24 hours
    await setCachedData(cacheKey, 'items', data, 24);
  }

  // Merge with custom data
  if (data.data && Array.isArray(data.data)) {
    // Multiple items
    data.data = await mergeItemsWithCustomData(data.data);
  } else if (data.data && data.data.id) {
    // Single item
    data.data = await mergeItemWithCustomData(data.data);
  } else if (data.id) {
    // Single item (no wrapper)
    data = await mergeItemWithCustomData(data);
  }

  return new Response(
    JSON.stringify({
      success: true,
      data,
      cached,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleQuests(req: Request, params: any, corsHeaders: any) {
  const cacheKey = generateCacheKey('quests', params);
  
  let data = await getCachedData(cacheKey);
  let cached = true;

  if (!data) {
    cached = false;
    data = await fetchFromMetaforge('quests', params);
    await setCachedData(cacheKey, 'quests', data, 24);
  }

  // Merge with custom data
  if (data.data && Array.isArray(data.data)) {
    data.data = await Promise.all(
      data.data.map(quest => mergeQuestWithCustomData(quest))
    );
  } else if (data.id) {
    data = await mergeQuestWithCustomData(data);
  }

  return new Response(
    JSON.stringify({
      success: true,
      data,
      cached,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleTraders(req: Request, params: any, corsHeaders: any) {
  const cacheKey = generateCacheKey('traders', params);
  
  let data = await getCachedData(cacheKey);
  let cached = true;

  if (!data) {
    cached = false;
    data = await fetchFromMetaforge('traders', params);
    await setCachedData(cacheKey, 'traders', data, 24);
  }

  return new Response(
    JSON.stringify({
      success: true,
      data,
      cached,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleArcs(req: Request, params: any, corsHeaders: any) {
  const cacheKey = generateCacheKey('arcs', params);
  
  let data = await getCachedData(cacheKey);
  let cached = true;

  if (!data) {
    cached = false;
    data = await fetchFromMetaforge('arcs', params);
    await setCachedData(cacheKey, 'arcs', data, 24);
  }

  return new Response(
    JSON.stringify({
      success: true,
      data,
      cached,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleMaps(req: Request, params: any, corsHeaders: any) {
  // Maps are only in Supabase, not Metaforge
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('maps')
    .select(`
      *,
      map_zones (*),
      map_markers (*)
    `)
    .eq('is_active', true);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      data,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleEvents(req: Request, params: any, corsHeaders: any) {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      data,
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

## Step 4: Deploy

```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy arc-raiders-api

# Set secrets (if needed)
supabase secrets set METAFORGE_API_KEY=your-key-if-needed
```

## Step 5: Update Frontend

Update `src/hooks/useArcRaidersApi.ts`:

```typescript
// Get Supabase URL from environment
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';

const BASE_URL = import.meta.env.DEV 
  ? `${SUPABASE_URL}/functions/v1/arc-raiders-api`  // Use your Supabase project URL
  : `${SUPABASE_URL}/functions/v1/arc-raiders-api`;

// Rest of the code stays the same!
```

## Step 6: Test

```bash
# Test locally (if using Supabase CLI)
supabase functions serve arc-raiders-api

# Or test deployed function
curl https://your-project.supabase.co/functions/v1/arc-raiders-api/items
```

## Benefits Achieved

✅ **No hosting fees** - Uses Supabase free tier  
✅ **Faster responses** - Cached data returns instantly  
✅ **Enhanced data** - Automatically merges custom data  
✅ **Better API** - Consistent structure, better errors  
✅ **Additional endpoints** - Maps and events included  
✅ **Lower costs** - Reduces Metaforge API calls  

## Monitoring & Maintenance

### Cache Cleanup

Set up a cron job (Supabase Cron) to clean expired cache:

```sql
-- Run this daily
SELECT cleanup_expired_cache();
```

### Monitoring

Check cache hit rate:
```sql
SELECT 
  endpoint,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE expires_at > NOW()) as cached_entries
FROM api_cache
GROUP BY endpoint;
```

