# Storing Metaforge Data in Supabase

## Updated Architecture

Instead of caching Metaforge API responses, we'll **store all Metaforge data permanently in Supabase**. This means:

1. ✅ **One-time sync** - Import all Metaforge data into Supabase
2. ✅ **Periodic updates** - Scheduled jobs to refresh data
3. ✅ **Your API serves from Supabase** - No Metaforge calls in production
4. ✅ **Complete independence** - No dependency on Metaforge API

## Architecture

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Your API (Edge     │
│   Functions)        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Supabase Database │
│                     │
│  - items            │
│  - quests           │
│  - traders          │
│  - arcs             │
│  - recipes          │
│  + custom_items     │
│  + custom_quests    │
│  + maps             │
│  + events           │
└─────────────────────┘
       │
       │ (Periodic sync only)
       ▼
┌─────────────┐
│  Metaforge  │
│   API       │
│  (Sync Job) │
└─────────────┘
```

## Step 1: Create Database Schema

Run this SQL in Supabase to create tables for Metaforge data:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Items Table (from Metaforge)
CREATE TABLE IF NOT EXISTS public.items (
    id TEXT PRIMARY KEY, -- Metaforge item ID
    name TEXT NOT NULL,
    rarity TEXT,
    description TEXT,
    category TEXT,
    subcategory TEXT,
    item_type TEXT,
    loadout_slots TEXT[],
    
    -- Images
    icon TEXT,
    image TEXT,
    image_url TEXT,
    thumbnail TEXT,
    
    -- Stats (stored as JSONB for flexibility)
    stat_block JSONB DEFAULT '{}'::jsonb,
    weight NUMERIC,
    stack_size INTEGER,
    
    -- Economy
    value NUMERIC,
    recycle_value NUMERIC,
    raider_coins INTEGER,
    
    -- Recycle breakdown
    recycle_breakdown JSONB DEFAULT '[]'::jsonb,
    
    -- Crafting components
    components JSONB DEFAULT '[]'::jsonb,
    crafting JSONB DEFAULT '{}'::jsonb,
    workbench TEXT,
    
    -- Loot sources
    dropped_by JSONB DEFAULT '[]'::jsonb,
    
    -- Traders
    traders JSONB DEFAULT '[]'::jsonb,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb, -- Store any other fields
    
    -- Sync tracking
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Quests Table
CREATE TABLE IF NOT EXISTS public.quests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Quest metadata
    type TEXT,
    difficulty TEXT,
    region TEXT,
    location TEXT,
    category TEXT,
    
    -- Map coordinates
    map_x NUMERIC,
    map_y NUMERIC,
    map_x_percent NUMERIC,
    map_y_percent NUMERIC,
    
    -- Images
    icon TEXT,
    image TEXT,
    image_url TEXT,
    thumbnail TEXT,
    
    -- XP
    xp INTEGER,
    
    -- Objectives (JSONB for flexibility)
    objectives JSONB DEFAULT '[]'::jsonb,
    
    -- Rewards
    rewards JSONB DEFAULT '[]'::jsonb,
    
    -- Quest metadata
    duration INTEGER,
    recommended_level INTEGER,
    required_level INTEGER,
    max_players INTEGER,
    min_players INTEGER,
    
    -- Quest chain
    quest_chain TEXT,
    chain_position INTEGER,
    previous_quest TEXT,
    next_quest TEXT,
    prerequisites TEXT[],
    unlocks TEXT[],
    
    -- Trader/Giver
    trader JSONB,
    giver JSONB,
    provider JSONB,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Sync tracking
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Traders Table
CREATE TABLE IF NOT EXISTS public.traders (
    id TEXT PRIMARY KEY, -- Slugified name or trader ID
    name TEXT NOT NULL,
    description TEXT,
    
    -- Images
    avatar TEXT,
    image TEXT,
    image_url TEXT,
    icon TEXT,
    thumbnail TEXT,
    
    -- Location
    location TEXT,
    region TEXT,
    
    -- Type
    type TEXT,
    category TEXT,
    
    -- Items sold (JSONB array)
    items JSONB DEFAULT '[]'::jsonb,
    sells JSONB DEFAULT '[]'::jsonb,
    
    -- Quests provided
    quests JSONB DEFAULT '[]'::jsonb,
    provides_quests JSONB DEFAULT '[]'::jsonb,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Sync tracking
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Arcs/Enemies Table
CREATE TABLE IF NOT EXISTS public.arcs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT,
    difficulty TEXT,
    location TEXT,
    
    -- Images
    icon TEXT,
    image TEXT,
    image_url TEXT,
    thumbnail TEXT,
    
    -- Loot drops
    drops JSONB DEFAULT '[]'::jsonb,
    loot JSONB DEFAULT '[]'::jsonb,
    
    -- Stats
    health INTEGER,
    armor INTEGER,
    shield INTEGER,
    weak_points TEXT[],
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Sync tracking
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Recipes Table (if separate from items)
CREATE TABLE IF NOT EXISTS public.recipes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    output TEXT NOT NULL, -- Item ID
    output_item_id TEXT REFERENCES public.items(id),
    
    -- Requirements (JSONB array)
    requires JSONB DEFAULT '[]'::jsonb,
    
    -- Workbench
    workbench TEXT,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Sync tracking
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_item_type ON public.items(item_type);
CREATE INDEX IF NOT EXISTS idx_items_rarity ON public.items(rarity);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_name ON public.items(name);
CREATE INDEX IF NOT EXISTS idx_items_synced_at ON public.items(synced_at);

CREATE INDEX IF NOT EXISTS idx_quests_type ON public.quests(type);
CREATE INDEX IF NOT EXISTS idx_quests_difficulty ON public.quests(difficulty);
CREATE INDEX IF NOT EXISTS idx_quests_region ON public.quests(region);
CREATE INDEX IF NOT EXISTS idx_quests_name ON public.quests(name);
CREATE INDEX IF NOT EXISTS idx_quests_synced_at ON public.quests(synced_at);

CREATE INDEX IF NOT EXISTS idx_traders_location ON public.traders(location);
CREATE INDEX IF NOT EXISTS idx_traders_name ON public.traders(name);
CREATE INDEX IF NOT EXISTS idx_traders_synced_at ON public.traders(synced_at);

CREATE INDEX IF NOT EXISTS idx_arcs_type ON public.arcs(type);
CREATE INDEX IF NOT EXISTS idx_arcs_difficulty ON public.arcs(difficulty);
CREATE INDEX IF NOT EXISTS idx_arcs_location ON public.arcs(location);
CREATE INDEX IF NOT EXISTS idx_arcs_name ON public.arcs(name);
CREATE INDEX IF NOT EXISTS idx_arcs_synced_at ON public.arcs(synced_at);

CREATE INDEX IF NOT EXISTS idx_recipes_output ON public.recipes(output);
CREATE INDEX IF NOT EXISTS idx_recipes_workbench ON public.recipes(workbench);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_items
    BEFORE UPDATE ON public.items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_quests
    BEFORE UPDATE ON public.quests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_traders
    BEFORE UPDATE ON public.traders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_arcs
    BEFORE UPDATE ON public.arcs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_recipes
    BEFORE UPDATE ON public.recipes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access on items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Allow public read access on quests" ON public.quests FOR SELECT USING (true);
CREATE POLICY "Allow public read access on traders" ON public.traders FOR SELECT USING (true);
CREATE POLICY "Allow public read access on arcs" ON public.arcs FOR SELECT USING (true);
CREATE POLICY "Allow public read access on recipes" ON public.recipes FOR SELECT USING (true);
```

## Step 2: Create Sync Script

Create a sync script that fetches all data from Metaforge and stores it in Supabase:

**sync-from-metaforge.ts** (Edge Function or Node.js script):

```typescript
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const METAFORGE_BASE_URL = 'https://metaforge.app/api/arc-raiders';

async function syncItems() {
  console.log('🔄 Syncing items...');
  
  let page = 1;
  let totalSynced = 0;
  
  while (true) {
    try {
      const response = await axios.get(`${METAFORGE_BASE_URL}/items`, {
        params: {
          page,
          limit: 1000,
          includeComponents: true,
        },
      });
      
      const items = response.data.data || [];
      if (items.length === 0) break;
      
      // Upsert items
      for (const item of items) {
        const { error } = await supabase
          .from('items')
          .upsert({
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            description: item.description,
            category: item.category,
            subcategory: item.subcategory,
            item_type: item.item_type,
            loadout_slots: item.loadout_slots,
            icon: item.icon,
            image: item.image,
            image_url: item.imageUrl || item.image_url,
            thumbnail: item.thumbnail,
            stat_block: item.stat_block || item.stats || {},
            weight: item.weight || item.stat_block?.weight,
            stack_size: item.stackSize || item.stack_size || item.stat_block?.stackSize,
            value: item.value,
            recycle_value: item.recycleValue || item.recycle_value,
            raider_coins: item.raider_coins,
            recycle_breakdown: item.recycle_breakdown || item.recycleBreakdown || [],
            components: item.components || [],
            crafting: item.crafting || {},
            workbench: item.workbench,
            dropped_by: item.dropped_by || item.loot_source || [],
            traders: item.traders || [],
            metadata: item, // Store full item in metadata for any fields we missed
            synced_at: new Date().toISOString(),
          }, {
            onConflict: 'id',
          });
        
        if (error) {
          console.error(`Error syncing item ${item.id}:`, error);
        }
      }
      
      totalSynced += items.length;
      console.log(`✅ Synced ${totalSynced} items (page ${page})`);
      
      if (!response.data.pagination?.hasNextPage) break;
      page++;
      
      // Rate limiting - wait 1 second between pages
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`Error fetching items page ${page}:`, error.message);
      break;
    }
  }
  
  console.log(`✅ Items sync complete: ${totalSynced} items`);
}

async function syncQuests() {
  console.log('🔄 Syncing quests...');
  
  let page = 1;
  let totalSynced = 0;
  
  while (true) {
    try {
      const response = await axios.get(`${METAFORGE_BASE_URL}/quests`, {
        params: {
          page,
          limit: 100,
          includeDetails: true,
        },
      });
      
      const quests = response.data.data || [];
      if (quests.length === 0) break;
      
      for (const quest of quests) {
        const { error } = await supabase
          .from('quests')
          .upsert({
            id: quest.id,
            name: quest.name,
            description: quest.description,
            type: quest.type,
            difficulty: quest.difficulty,
            region: quest.region,
            location: quest.location,
            category: quest.category,
            map_x: quest.map_x || quest.x,
            map_y: quest.map_y || quest.y,
            map_x_percent: quest.map_x_percent,
            map_y_percent: quest.map_y_percent,
            icon: quest.icon,
            image: quest.image,
            image_url: quest.imageUrl || quest.image_url,
            thumbnail: quest.thumbnail,
            xp: quest.xp || quest.experience || quest.exp,
            objectives: quest.objectives || [],
            rewards: quest.rewards || quest.granted_items || [],
            duration: quest.duration,
            recommended_level: quest.recommended_level,
            required_level: quest.required_level,
            max_players: quest.max_players,
            min_players: quest.min_players,
            quest_chain: quest.quest_chain,
            chain_position: quest.chain_position,
            previous_quest: quest.previous_quest,
            next_quest: quest.next_quest,
            prerequisites: quest.prerequisites || [],
            unlocks: quest.unlocks || [],
            trader: quest.trader || quest.giver || quest.provider || null,
            giver: quest.giver || quest.trader || quest.provider || null,
            provider: quest.provider || quest.trader || quest.giver || null,
            metadata: quest,
            synced_at: new Date().toISOString(),
          }, {
            onConflict: 'id',
          });
        
        if (error) {
          console.error(`Error syncing quest ${quest.id}:`, error);
        }
      }
      
      totalSynced += quests.length;
      console.log(`✅ Synced ${totalSynced} quests (page ${page})`);
      
      if (!response.data.pagination?.hasNextPage) break;
      page++;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`Error fetching quests page ${page}:`, error.message);
      break;
    }
  }
  
  console.log(`✅ Quests sync complete: ${totalSynced} quests`);
}

async function syncTraders() {
  console.log('🔄 Syncing traders...');
  
  try {
    const response = await axios.get(`${METAFORGE_BASE_URL}/traders`);
    
    // Traders API returns object mapping trader names to items
    const tradersData = response.data.data || {};
    
    for (const [traderName, items] of Object.entries(tradersData)) {
      const traderId = traderName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { error } = await supabase
        .from('traders')
        .upsert({
          id: traderId,
          name: traderName,
          items: Array.isArray(items) ? items : [],
          sells: Array.isArray(items) ? items : [],
          metadata: { items },
          synced_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });
      
      if (error) {
        console.error(`Error syncing trader ${traderName}:`, error);
      }
    }
    
    console.log(`✅ Traders sync complete: ${Object.keys(tradersData).length} traders`);
  } catch (error: any) {
    console.error(`Error syncing traders:`, error.message);
  }
}

async function syncArcs() {
  console.log('🔄 Syncing arcs...');
  
  let page = 1;
  let totalSynced = 0;
  
  while (true) {
    try {
      const response = await axios.get(`${METAFORGE_BASE_URL}/arcs`, {
        params: {
          page,
          limit: 100,
        },
      });
      
      const arcs = response.data.data || [];
      if (arcs.length === 0) break;
      
      for (const arc of arcs) {
        const { error } = await supabase
          .from('arcs')
          .upsert({
            id: arc.id,
            name: arc.name,
            description: arc.description,
            type: arc.type,
            difficulty: arc.difficulty,
            location: arc.location,
            icon: arc.icon,
            image: arc.image,
            image_url: arc.imageUrl || arc.image_url,
            thumbnail: arc.thumbnail,
            drops: arc.drops || arc.loot || [],
            loot: arc.loot || arc.drops || [],
            health: arc.health,
            armor: arc.armor,
            shield: arc.shield,
            weak_points: arc.weak_points || [],
            metadata: arc,
            synced_at: new Date().toISOString(),
          }, {
            onConflict: 'id',
          });
        
        if (error) {
          console.error(`Error syncing arc ${arc.id}:`, error);
        }
      }
      
      totalSynced += arcs.length;
      console.log(`✅ Synced ${totalSynced} arcs (page ${page})`);
      
      if (!response.data.pagination?.hasNextPage) break;
      page++;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`Error fetching arcs page ${page}:`, error.message);
      break;
    }
  }
  
  console.log(`✅ Arcs sync complete: ${totalSynced} arcs`);
}

async function syncAll() {
  console.log('🚀 Starting full sync from Metaforge...');
  
  await syncItems();
  await syncQuests();
  await syncTraders();
  await syncArcs();
  
  console.log('✅ Full sync complete!');
}

// Run sync
syncAll().catch(console.error);
```

## Step 3: Update API to Serve from Supabase Only

Your Edge Functions will now read from Supabase tables instead of calling Metaforge:

**index.ts** (Updated):

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/arc-raiders-api', '');
    const params = Object.fromEntries(url.searchParams.entries());

    if (path.startsWith('/items')) {
      return await handleItems(req, params, corsHeaders);
    } else if (path.startsWith('/quests')) {
      return await handleQuests(req, params, corsHeaders);
    }
    // ... other routes

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
  let query = supabase.from('items').select('*');
  
  // Apply filters
  if (params.id) {
    query = query.eq('id', params.id);
  }
  if (params.item_type) {
    query = query.eq('item_type', params.item_type);
  }
  if (params.rarity) {
    query = query.eq('rarity', params.rarity);
  }
  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }
  
  // Pagination
  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '100');
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  query = query.range(from, to);
  
  // Order by
  if (params.sortBy) {
    query = query.order(params.sortBy, { 
      ascending: params.sortOrder !== 'desc' 
    });
  }
  
  const { data: items, error, count } = await query;
  
  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Merge with custom_items
  const itemIds = items.map(item => item.id);
  const { data: customItems } = await supabase
    .from('custom_items')
    .select('*')
    .in('item_id', itemIds);
  
  const customMap = new Map(
    customItems?.map(custom => [custom.item_id, custom]) || []
  );
  
  const mergedItems = items.map(item => {
    const custom = customMap.get(item.id);
    if (!custom) return item;
    
    return {
      ...item,
      name: custom.custom_name || item.name,
      description: custom.custom_description || item.description,
      image: custom.custom_image || item.image,
      tips: custom.tips,
      locationsFound: custom.locations_found,
      bestUseCases: custom.best_use_cases,
      metaRating: custom.meta_rating,
      metaNotes: custom.meta_notes,
      customTags: custom.tags,
    };
  });
  
  const total = count || 0;
  const totalPages = Math.ceil(total / limit);
  
  return new Response(
    JSON.stringify({
      success: true,
      data: mergedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

## Step 4: Schedule Periodic Sync

Set up a cron job or scheduled function to sync data periodically:

### Option A: Supabase Cron (pg_cron)

```sql
-- Run sync daily at 2 AM UTC
SELECT cron.schedule(
  'sync-metaforge-data',
  '0 2 * * *', -- Daily at 2 AM
  $$
  SELECT sync_from_metaforge(); -- You'll need to create this function
  $$
);
```

### Option B: GitHub Actions (Free)

Create `.github/workflows/sync.yml`:

```yaml
name: Sync Metaforge Data

on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run sync
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## Benefits

✅ **No Metaforge dependency** - All data in your database  
✅ **Faster queries** - Direct database access  
✅ **Better search** - Full-text search capabilities  
✅ **Custom filtering** - Complex queries with Supabase  
✅ **Data ownership** - You control the data  
✅ **Cost effective** - No API call costs  

## Next Steps

1. ✅ Create database schema
2. ✅ Run initial sync script
3. ✅ Update API to read from Supabase
4. ✅ Set up periodic sync job
5. ✅ Update frontend (no changes needed!)

Your frontend code stays the same - just change the `BASE_URL` to point to your new API!

