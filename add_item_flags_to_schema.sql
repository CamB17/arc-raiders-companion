-- Add item_flags column to custom_items table
-- Run this in your Supabase SQL Editor

ALTER TABLE public.custom_items 
ADD COLUMN IF NOT EXISTS item_flags TEXT[] DEFAULT '{}'::text[];

-- Add comment explaining the flags
COMMENT ON COLUMN public.custom_items.item_flags IS 'Array of item category flags: important_save, quest_item, hideout_item, project_item, crafting_item';

