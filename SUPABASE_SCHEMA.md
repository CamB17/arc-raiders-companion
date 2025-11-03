# Supabase Database Schema

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL schema below
4. Execute the query to create all tables

## Database Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Items Table
-- Stores additional custom data for items from the API
CREATE TABLE IF NOT EXISTS public.custom_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id TEXT NOT NULL UNIQUE, -- Reference to API item ID
    custom_name TEXT,
    custom_description TEXT,
    custom_image TEXT,
    tips TEXT,
    locations_found TEXT[],
    best_use_cases TEXT[],
    meta_rating NUMERIC(2,1) CHECK (meta_rating >= 1 AND meta_rating <= 5),
    meta_notes TEXT,
    extra_stats JSONB DEFAULT '{}'::jsonb,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Custom Quests Table
-- Stores walkthroughs, tips, and additional quest data
CREATE TABLE IF NOT EXISTS public.custom_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quest_id TEXT NOT NULL UNIQUE, -- Reference to API quest ID
    custom_name TEXT,
    custom_description TEXT,
    walkthrough TEXT,
    tips TEXT,
    hidden_objectives TEXT[],
    optimal_route TEXT,
    time_estimate TEXT,
    difficulty_rating NUMERIC(2,1) CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
    video_guide_url TEXT,
    map_markers JSONB DEFAULT '[]'::jsonb,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Custom Traders Table
-- Stores additional trader information
CREATE TABLE IF NOT EXISTS public.custom_traders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trader_id TEXT NOT NULL UNIQUE, -- Reference to API trader ID
    custom_name TEXT,
    custom_bio TEXT,
    custom_image TEXT,
    location_details TEXT,
    trading_tips TEXT,
    unlock_requirements TEXT,
    best_items TEXT[],
    schedule TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Custom Locations Table
-- Stores map locations and points of interest not in API
CREATE TABLE IF NOT EXISTS public.custom_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    location_type TEXT NOT NULL CHECK (location_type IN ('loot', 'trader', 'quest', 'landmark', 'danger', 'resource', 'other')),
    map_x NUMERIC NOT NULL,
    map_y NUMERIC NOT NULL,
    region TEXT,
    image_url TEXT,
    tips TEXT,
    loot_quality TEXT CHECK (loot_quality IN ('low', 'medium', 'high', 'legendary')),
    danger_level INTEGER CHECK (danger_level >= 1 AND danger_level <= 5),
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Custom Guides Table
-- Stores player-created guides and tutorials
CREATE TABLE IF NOT EXISTS public.custom_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('beginner', 'intermediate', 'advanced', 'builds', 'farming', 'pvp', 'other')),
    content TEXT NOT NULL, -- Markdown content
    author TEXT,
    excerpt TEXT,
    image_url TEXT,
    related_items TEXT[],
    related_quests TEXT[],
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Custom Builds Table
-- Stores loadout builds created by players
CREATE TABLE IF NOT EXISTS public.custom_builds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    playstyle TEXT NOT NULL CHECK (playstyle IN ('aggressive', 'defensive', 'stealth', 'support', 'balanced', 'other')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    primary_weapon_id TEXT,
    secondary_weapon_id TEXT,
    armor_ids TEXT[],
    gadget_ids TEXT[],
    consumable_ids TEXT[],
    pros TEXT[],
    cons TEXT[],
    gameplay_tips TEXT,
    author TEXT,
    rating NUMERIC(2,1) CHECK (rating >= 1 AND rating <= 5),
    votes INTEGER DEFAULT 0,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_custom_items_item_id ON public.custom_items(item_id);
CREATE INDEX IF NOT EXISTS idx_custom_items_tags ON public.custom_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_custom_quests_quest_id ON public.custom_quests(quest_id);
CREATE INDEX IF NOT EXISTS idx_custom_quests_tags ON public.custom_quests USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_custom_traders_trader_id ON public.custom_traders(trader_id);
CREATE INDEX IF NOT EXISTS idx_custom_locations_type ON public.custom_locations(location_type);
CREATE INDEX IF NOT EXISTS idx_custom_locations_region ON public.custom_locations(region);
CREATE INDEX IF NOT EXISTS idx_custom_guides_category ON public.custom_guides(category);
CREATE INDEX IF NOT EXISTS idx_custom_builds_playstyle ON public.custom_builds(playstyle);
CREATE INDEX IF NOT EXISTS idx_custom_builds_difficulty ON public.custom_builds(difficulty);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_custom_items
    BEFORE UPDATE ON public.custom_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_custom_quests
    BEFORE UPDATE ON public.custom_quests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_custom_traders
    BEFORE UPDATE ON public.custom_traders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_custom_locations
    BEFORE UPDATE ON public.custom_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_custom_guides
    BEFORE UPDATE ON public.custom_guides
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_custom_builds
    BEFORE UPDATE ON public.custom_builds
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.custom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_traders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_builds ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
-- Note: Adjust these policies based on your security requirements

-- Allow public read access
CREATE POLICY "Allow public read access on custom_items" ON public.custom_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access on custom_quests" ON public.custom_quests FOR SELECT USING (true);
CREATE POLICY "Allow public read access on custom_traders" ON public.custom_traders FOR SELECT USING (true);
CREATE POLICY "Allow public read access on custom_locations" ON public.custom_locations FOR SELECT USING (true);
CREATE POLICY "Allow public read access on custom_guides" ON public.custom_guides FOR SELECT USING (true);
CREATE POLICY "Allow public read access on custom_builds" ON public.custom_builds FOR SELECT USING (true);

-- Allow public write access (you may want to restrict this based on authentication)
CREATE POLICY "Allow public insert on custom_items" ON public.custom_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on custom_items" ON public.custom_items FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on custom_items" ON public.custom_items FOR DELETE USING (true);

CREATE POLICY "Allow public insert on custom_quests" ON public.custom_quests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on custom_quests" ON public.custom_quests FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on custom_quests" ON public.custom_quests FOR DELETE USING (true);

CREATE POLICY "Allow public insert on custom_traders" ON public.custom_traders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on custom_traders" ON public.custom_traders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on custom_traders" ON public.custom_traders FOR DELETE USING (true);

CREATE POLICY "Allow public insert on custom_locations" ON public.custom_locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on custom_locations" ON public.custom_locations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on custom_locations" ON public.custom_locations FOR DELETE USING (true);

CREATE POLICY "Allow public insert on custom_guides" ON public.custom_guides FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on custom_guides" ON public.custom_guides FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on custom_guides" ON public.custom_guides FOR DELETE USING (true);

CREATE POLICY "Allow public insert on custom_builds" ON public.custom_builds FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on custom_builds" ON public.custom_builds FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on custom_builds" ON public.custom_builds FOR DELETE USING (true);
```

## Security Considerations

### Current Setup: Public Access

The schema above allows public read and write access to all tables. This is suitable for:
- Development and testing
- Community-driven content where all users can contribute
- Internal tools without public exposure

### Recommended for Production: Authentication-Based Access

For production, consider implementing authentication-based policies:

```sql
-- Example: Only authenticated users can write
CREATE POLICY "Authenticated users can insert" 
    ON public.custom_items 
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Example: Users can only update their own records
CREATE POLICY "Users can update own records" 
    ON public.custom_guides 
    FOR UPDATE 
    USING (auth.uid() = author_id);
```

## Table Descriptions

### custom_items
Enhances API item data with community tips, locations, and meta information.

### custom_quests
Adds walkthroughs, hidden objectives, and video guides to quests.

### custom_traders
Provides trader backstories, tips, and schedule information.

### custom_locations
Maps important locations like loot spots, danger zones, and resources.

### custom_guides
Player-created guides and tutorials for various game aspects.

### custom_builds
Community loadout builds with ratings and gameplay tips.

## Usage Examples

### Create a Custom Item
```typescript
const { data, error } = await supabase
  .from('custom_items')
  .insert({
    item_id: 'herbal-bandage',
    tips: 'Best used before combat to maximize healing',
    locations_found: ['Forest', 'Medical Facility'],
    meta_rating: 4.5,
    tags: ['healing', 'consumable']
  })
```

### Query Custom Data
```typescript
const { data, error } = await supabase
  .from('custom_items')
  .select('*')
  .eq('item_id', 'herbal-bandage')
  .single()
```

### Update Custom Data
```typescript
const { data, error } = await supabase
  .from('custom_items')
  .update({ 
    meta_rating: 5.0,
    tips: 'Updated tips here'
  })
  .eq('id', customItemId)
```

## Migration and Backup

### Export Data
```bash
# Export all custom_items data
supabase db dump --table custom_items > custom_items_backup.sql
```

### Import Data
```bash
# Import from backup
psql -h your-db-host -U postgres -d your-database < custom_items_backup.sql
```

## Next Steps

1. ✅ Execute the schema in your Supabase SQL editor
2. ✅ Set up environment variables in `.env`
3. ✅ Test the admin dashboard at `/admin`
4. 🔧 Customize RLS policies for your security requirements
5. 🔧 Add authentication if needed
6. 🔧 Set up backup strategies

