-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Maps Table
-- Stores information about each game zone/map
CREATE TABLE IF NOT EXISTS public.maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    map_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    map_width INTEGER NOT NULL DEFAULT 2048,
    map_height INTEGER NOT NULL DEFAULT 2048,
    possible_events TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Map Zones Table
-- Stores named regions/areas on the map (like "THE DAM", "SWAMP", etc.)
CREATE TABLE IF NOT EXISTS public.map_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    map_id UUID NOT NULL REFERENCES public.maps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    center_x NUMERIC NOT NULL,
    center_y NUMERIC NOT NULL,
    width NUMERIC,
    height NUMERIC,
    polygon_coords JSONB,
    color TEXT,
    font_size NUMERIC DEFAULT 24,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Map Markers Table
-- Stores all interactive markers on the map (containers, enemies, locations, etc.)
CREATE TABLE IF NOT EXISTS public.map_markers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    map_id UUID NOT NULL REFERENCES public.maps(id) ON DELETE CASCADE,
    marker_type TEXT NOT NULL CHECK (marker_type IN ('container', 'arc', 'location', 'resource', 'other')),
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    x NUMERIC NOT NULL,
    y NUMERIC NOT NULL,
    icon_type TEXT NOT NULL,
    icon_color TEXT NOT NULL,
    icon_shape TEXT DEFAULT 'circle',
    icon_symbol TEXT,
    tooltip TEXT,
    zone_id UUID REFERENCES public.map_zones(id) ON DELETE SET NULL,
    is_visible BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_maps_map_id ON public.maps(map_id);
CREATE INDEX IF NOT EXISTS idx_maps_is_active ON public.maps(is_active);
CREATE INDEX IF NOT EXISTS idx_map_zones_map_id ON public.map_zones(map_id);
CREATE INDEX IF NOT EXISTS idx_map_markers_map_id ON public.map_markers(map_id);
CREATE INDEX IF NOT EXISTS idx_map_markers_type ON public.map_markers(marker_type);
CREATE INDEX IF NOT EXISTS idx_map_markers_category ON public.map_markers(category);
CREATE INDEX IF NOT EXISTS idx_map_markers_zone_id ON public.map_markers(zone_id);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_maps
    BEFORE UPDATE ON public.maps
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_map_zones
    BEFORE UPDATE ON public.map_zones
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_map_markers
    BEFORE UPDATE ON public.map_markers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_markers ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on maps" ON public.maps FOR SELECT USING (true);
CREATE POLICY "Allow public read access on map_zones" ON public.map_zones FOR SELECT USING (true);
CREATE POLICY "Allow public read access on map_markers" ON public.map_markers FOR SELECT USING (true);

-- Allow public write access (you may want to restrict this based on authentication)
CREATE POLICY "Allow public insert on maps" ON public.maps FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on maps" ON public.maps FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on maps" ON public.maps FOR DELETE USING (true);

CREATE POLICY "Allow public insert on map_zones" ON public.map_zones FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on map_zones" ON public.map_zones FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on map_zones" ON public.map_zones FOR DELETE USING (true);

CREATE POLICY "Allow public insert on map_markers" ON public.map_markers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on map_markers" ON public.map_markers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on map_markers" ON public.map_markers FOR DELETE USING (true);

-- Insert default maps
INSERT INTO public.maps (map_id, name, description, image_url, map_width, map_height, possible_events) VALUES
('dam', 'Dam Battlegrounds', 'The Alcantara Power Plant, or "The Dam", once served as a crucial Raider stronghold during the bitter closing battles of the First Wave. Even now, these toxic, waterlogged lands remain a hotspot for ARC skirmishes.', '', 2048, 2048, ARRAY['Prospecting Probes', 'Harvester', 'Uncovered Caches', 'Husk Graveyard', 'Lush Blooms', 'Night Raid']),
('spaceport', 'The Spaceport', 'A majestic testament to humanity''s past ambitions, Acerra Spaceport is where the Exodus shuttles, vessels of hope and desperation, once roared into the heavens, leaving a beleaguered Earth behind.', '', 2048, 2048, ARRAY['Prospecting Probes', 'Harvester', 'Uncovered Caches', 'Husk Graveyard', 'Launch Tower Loot', 'Lush Blooms', 'Night Raid']),
('buried-city', 'Buried City', 'Amidst the sand dunes in this arid wasteland, Buried City is a remnant of the old world quite unlike the cold steel spires of the Exodus age. Walk these narrow streets and empty plazas, and know that people once lived here.', '', 2048, 2048, ARRAY['Prospecting Probes', 'Uncovered Caches', 'Husk Graveyard', 'Lush Blooms', 'Night Raid']),
('blue-gate', 'Blue Gate', 'Once a steadfast symbol of defiant connection, the Blue Gate now serves as a daunting entryway into the perilous mountain ranges. The surrounding valley bears scars both new and old.', '', 2048, 2048, ARRAY['Night Raid'])
ON CONFLICT (map_id) DO NOTHING;



