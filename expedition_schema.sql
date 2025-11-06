-- Expedition Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- Expedition Table
-- Stores information about the expedition (single expedition concept)
CREATE TABLE IF NOT EXISTS public.expedition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL DEFAULT 'Expedition', -- e.g., 'Expedition Alpha'
    image_url TEXT, -- URL to expedition image
    description TEXT, -- Optional description
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Expedition Phases Table
-- Stores phase-specific data: requirements (items and quantities) for each phase
CREATE TABLE IF NOT EXISTS public.expedition_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expedition_id UUID NOT NULL REFERENCES public.expedition(id) ON DELETE CASCADE,
    phase_number INTEGER NOT NULL, -- Phase number (1, 2, 3, etc.)
    phase_name TEXT, -- Optional phase name
    requirements JSONB DEFAULT '[]'::jsonb, -- Array of {item_id: string, quantity: number}
    display_order INTEGER DEFAULT 0, -- Order for display
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(expedition_id, phase_number) -- Ensure one phase per expedition per phase number
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expedition_phases_expedition_id ON public.expedition_phases(expedition_id);
CREATE INDEX IF NOT EXISTS idx_expedition_phases_phase_number ON public.expedition_phases(phase_number);
CREATE INDEX IF NOT EXISTS idx_expedition_phases_display_order ON public.expedition_phases(display_order);

-- Create updated_at trigger for expedition tables
CREATE TRIGGER set_updated_at_expedition
    BEFORE UPDATE ON public.expedition
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_expedition_phases
    BEFORE UPDATE ON public.expedition_phases
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.expedition ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expedition_phases ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on expedition" 
    ON public.expedition 
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow public read access on expedition_phases" 
    ON public.expedition_phases 
    FOR SELECT 
    USING (true);

-- Allow public write access (for admin functionality)
CREATE POLICY "Allow public insert on expedition" 
    ON public.expedition 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public update on expedition" 
    ON public.expedition 
    FOR UPDATE 
    USING (true);

CREATE POLICY "Allow public delete on expedition" 
    ON public.expedition 
    FOR DELETE 
    USING (true);

CREATE POLICY "Allow public insert on expedition_phases" 
    ON public.expedition_phases 
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow public update on expedition_phases" 
    ON public.expedition_phases 
    FOR UPDATE 
    USING (true);

CREATE POLICY "Allow public delete on expedition_phases" 
    ON public.expedition_phases 
    FOR DELETE 
    USING (true);
