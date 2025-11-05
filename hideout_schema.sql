-- Hideout Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- Hideout Workbenches Table
-- Stores information about each workbench in the hideout
CREATE TABLE IF NOT EXISTS public.hideout_workbenches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- e.g., 'Scrappy', 'Gunsmith', 'Gear Bench'
    image_url TEXT, -- URL to workbench image
    max_level INTEGER NOT NULL DEFAULT 3, -- Maximum level for this workbench
    display_order INTEGER DEFAULT 0, -- Order for display on the page
    description TEXT, -- Optional description
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Hideout Workbench Levels Table
-- Stores level-specific data: requirements and unlocks
CREATE TABLE IF NOT EXISTS public.hideout_workbench_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workbench_id UUID NOT NULL REFERENCES public.hideout_workbenches(id) ON DELETE CASCADE,
    level_number INTEGER NOT NULL, -- Level number (1, 2, 3, etc.)
    requirements JSONB DEFAULT '[]'::jsonb, -- Array of {item_id: string, quantity: number}
    unlocks JSONB DEFAULT '[]'::jsonb, -- Array of {item_id: string}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(workbench_id, level_number) -- Ensure one level per workbench per level number
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hideout_workbenches_display_order ON public.hideout_workbenches(display_order);
CREATE INDEX IF NOT EXISTS idx_hideout_workbench_levels_workbench_id ON public.hideout_workbench_levels(workbench_id);
CREATE INDEX IF NOT EXISTS idx_hideout_workbench_levels_level_number ON public.hideout_workbench_levels(level_number);

-- Create updated_at trigger for hideout tables
CREATE TRIGGER set_updated_at_hideout_workbenches
    BEFORE UPDATE ON public.hideout_workbenches
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_hideout_workbench_levels
    BEFORE UPDATE ON public.hideout_workbench_levels
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.hideout_workbenches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hideout_workbench_levels ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on hideout_workbenches" 
    ON public.hideout_workbenches 
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow public read access on hideout_workbench_levels" 
    ON public.hideout_workbench_levels 
    FOR SELECT 
    USING (true);

-- Allow public write access (for admin functionality)
CREATE POLICY "Allow public insert on hideout_workbenches" 
    ON public.hideout_workbenches 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public update on hideout_workbenches" 
    ON public.hideout_workbenches 
    FOR UPDATE 
    USING (true);

CREATE POLICY "Allow public delete on hideout_workbenches" 
    ON public.hideout_workbenches 
    FOR DELETE 
    USING (true);

CREATE POLICY "Allow public insert on hideout_workbench_levels" 
    ON public.hideout_workbench_levels 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public update on hideout_workbench_levels" 
    ON public.hideout_workbench_levels 
    FOR UPDATE 
    USING (true);

CREATE POLICY "Allow public delete on hideout_workbench_levels" 
    ON public.hideout_workbench_levels 
    FOR DELETE 
    USING (true);

