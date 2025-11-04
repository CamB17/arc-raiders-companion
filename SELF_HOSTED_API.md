# Self-Hosted Node.js API Server

If you prefer to host your own API server instead of using Supabase Edge Functions, this guide shows you how to set up a Node.js/Express server that you can run on your computer or a free VPS.

## Why Self-Hosted?

- ✅ **No limits** - Run as many requests as you want
- ✅ **Complete control** - Full Node.js ecosystem
- ✅ **Better caching** - Can use Redis, in-memory, or database
- ✅ **Easier debugging** - Full stack traces and logging
- ⚠️ **Requires always-on computer** - Or use a free VPS
- ⚠️ **Need to handle deployment** - But it's straightforward

## Architecture

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Express API Server │
│  http://localhost:3001│
│  or your-domain.com │
└──────┬──────────────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌─────────────┐  ┌──────────┐  ┌──────────┐
│   Supabase  │  │ Metaforge│  │  Cache    │
│   Database  │  │   API    │  │  (Redis/  │
│             │  │          │  │  Memory)  │
└─────────────┘  └──────────┘  └──────────┘
```

## Setup Steps

### 1. Create API Server Directory

```bash
mkdir arc-raiders-api-server
cd arc-raiders-api-server
npm init -y
```

### 2. Install Dependencies

```bash
npm install express cors dotenv axios @supabase/supabase-js
npm install --save-dev @types/express @types/cors @types/node typescript ts-node nodemon
```

### 3. Create Project Structure

```
arc-raiders-api-server/
├── src/
│   ├── index.ts          # Main server file
│   ├── routes/
│   │   ├── items.ts
│   │   ├── quests.ts
│   │   ├── traders.ts
│   │   ├── arcs.ts
│   │   ├── maps.ts
│   │   └── events.ts
│   ├── lib/
│   │   ├── cache.ts      # Caching logic
│   │   ├── metaforge.ts  # Metaforge API client
│   │   └── merge.ts       # Data merging
│   └── types.ts
├── .env
├── tsconfig.json
├── package.json
└── README.md
```

### 4. TypeScript Config

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 5. Environment Variables

**.env**:
```env
PORT=3001
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
METAFORGE_BASE_URL=https://metaforge.app/api/arc-raiders
CACHE_TTL_HOURS=24
NODE_ENV=development
```

### 6. Main Server File

**src/index.ts**:
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import itemsRouter from './routes/items';
import questsRouter from './routes/quests';
import tradersRouter from './routes/traders';
import arcsRouter from './routes/arcs';
import mapsRouter from './routes/maps';
import eventsRouter from './routes/events';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/items', itemsRouter);
app.use('/quests', questsRouter);
app.use('/traders', tradersRouter);
app.use('/arcs', arcsRouter);
app.use('/maps', mapsRouter);
app.use('/events', eventsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
```

### 7. Cache Implementation

**src/lib/cache.ts**:
```typescript
// Simple in-memory cache (can be upgraded to Redis)
interface CacheEntry {
  data: any;
  expiresAt: number;
}

class Cache {
  private cache = new Map<string, CacheEntry>();
  private ttlHours: number;

  constructor(ttlHours: number = 24) {
    this.ttlHours = ttlHours;
    // Clean up expired entries every hour
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any): void {
    const expiresAt = Date.now() + this.ttlHours * 60 * 60 * 1000;
    this.cache.set(key, { data, expiresAt });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cache = new Cache(
  parseInt(process.env.CACHE_TTL_HOURS || '24')
);

export function generateCacheKey(endpoint: string, params?: Record<string, any>): string {
  if (!params) return endpoint;
  
  const sorted = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  
  return `${endpoint}:${sorted}`;
}
```

### 8. Metaforge Client

**src/lib/metaforge.ts**:
```typescript
import axios from 'axios';

const BASE_URL = process.env.METAFORGE_BASE_URL || 'https://metaforge.app/api/arc-raiders';

export async function fetchFromMetaforge(
  endpoint: string,
  params?: Record<string, any>
): Promise<any> {
  try {
    const response = await axios.get(`${BASE_URL}/${endpoint}`, {
      params,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(`Metaforge API error: ${error.message}`);
  }
}
```

### 9. Data Merging

**src/lib/merge.ts**:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function mergeItemWithCustomData(item: any): Promise<any> {
  const { data: customData } = await supabase
    .from('custom_items')
    .select('*')
    .eq('item_id', item.id)
    .single();

  if (!customData) return item;

  return {
    ...item,
    name: customData.custom_name || item.name,
    description: customData.custom_description || item.description,
    image: customData.custom_image || item.image || item.icon,
    tips: customData.tips,
    locationsFound: customData.locations_found,
    bestUseCases: customData.best_use_cases,
    metaRating: customData.meta_rating,
    metaNotes: customData.meta_notes,
    customTags: customData.tags,
  };
}

export async function mergeItemsWithCustomData(items: any[]): Promise<any[]> {
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
  };
}
```

### 10. Items Route

**src/routes/items.ts**:
```typescript
import express from 'express';
import { cache, generateCacheKey } from '../lib/cache';
import { fetchFromMetaforge } from '../lib/metaforge';
import { mergeItemWithCustomData, mergeItemsWithCustomData } from '../lib/merge';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const params = req.query;
    const cacheKey = generateCacheKey('items', params);
    
    // Check cache
    let data = cache.get(cacheKey);
    let cached = true;

    if (!data) {
      // Fetch from Metaforge
      cached = false;
      data = await fetchFromMetaforge('items', params);
      
      // Cache for configured TTL
      cache.set(cacheKey, data);
    }

    // Merge with custom data
    if (data.data && Array.isArray(data.data)) {
      data.data = await mergeItemsWithCustomData(data.data);
    } else if (data.data && data.data.id) {
      data.data = await mergeItemWithCustomData(data.data);
    } else if (data.id) {
      data = await mergeItemWithCustomData(data);
    }

    res.json({
      success: true,
      data,
      cached,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = generateCacheKey('items', { id });
    
    let data = cache.get(cacheKey);
    let cached = true;

    if (!data) {
      cached = false;
      const response = await fetchFromMetaforge('items', { id });
      data = response.data?.[0] || response;
      cache.set(cacheKey, data);
    }

    data = await mergeItemWithCustomData(data);

    res.json({
      success: true,
      data,
      cached,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
```

### 11. Package.json Scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "start:dev": "ts-node src/index.ts"
  }
}
```

### 12. Running the Server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 13. Keep It Running (PM2)

```bash
npm install -g pm2

# Start server
pm2 start dist/index.js --name arc-raiders-api

# Auto-start on boot
pm2 startup
pm2 save
```

### 14. Make It Public (Optional)

#### Option A: ngrok (Quick Testing)
```bash
npm install -g ngrok
ngrok http 3001
```

#### Option B: Cloudflare Tunnel (Free, Permanent)
```bash
# Install cloudflared
# Then create tunnel
cloudflared tunnel --url http://localhost:3001
```

#### Option C: Free VPS
- Oracle Cloud (Always Free)
- AWS Free Tier
- Google Cloud Free Tier
- Railway.app (Free tier)
- Render.com (Free tier)

### 15. Update Frontend

Change `BASE_URL` in `useArcRaidersApi.ts`:

```typescript
const BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001'  // Local dev
  : 'https://your-domain.com'  // Production
```

## Benefits of Self-Hosted

✅ **No limits** - Handle millions of requests  
✅ **Better caching** - Use Redis, PostgreSQL, or in-memory  
✅ **Full control** - Add any features you want  
✅ **Easier debugging** - Full Node.js debugging tools  
✅ **Can add features** - Webhooks, rate limiting, analytics  

## Upgrade to Redis (Optional)

For better caching across server restarts:

```bash
npm install ioredis
```

Then update `src/lib/cache.ts` to use Redis instead of in-memory cache.

## Monitoring

Add health check endpoint and monitoring:

```typescript
router.get('/stats', (req, res) => {
  res.json({
    cache: cache.stats(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

## That's It!

You now have a self-hosted API server that:
- ✅ Caches Metaforge responses
- ✅ Merges with Supabase data
- ✅ Runs on your computer/VPS
- ✅ Costs $0/month
- ✅ Has no limits

Perfect for personal projects! 🚀

