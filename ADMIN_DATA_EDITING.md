# Admin Data Editing - Database Schema Updates

## Add Manual Update Tracking

Run this SQL to add tracking for manually updated data:

```sql
-- Add manual update tracking columns to all tables

-- Items table
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS manually_updated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS manually_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS manually_updated_by TEXT;

-- Quests table
ALTER TABLE public.quests 
ADD COLUMN IF NOT EXISTS manually_updated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS manually_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS manually_updated_by TEXT;

-- Traders table
ALTER TABLE public.traders 
ADD COLUMN IF NOT EXISTS manually_updated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS manually_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS manually_updated_by TEXT;

-- Arcs table
ALTER TABLE public.arcs 
ADD COLUMN IF NOT EXISTS manually_updated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS manually_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS manually_updated_by TEXT;

-- Recipes table
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS manually_updated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS manually_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS manually_updated_by TEXT;

-- Add indexes for manual update tracking
CREATE INDEX IF NOT EXISTS idx_items_manually_updated ON public.items(manually_updated);
CREATE INDEX IF NOT EXISTS idx_quests_manually_updated ON public.quests(manually_updated);
CREATE INDEX IF NOT EXISTS idx_traders_manually_updated ON public.traders(manually_updated);
CREATE INDEX IF NOT EXISTS idx_arcs_manually_updated ON public.arcs(manually_updated);

-- Create function to update manual update timestamp
CREATE OR REPLACE FUNCTION public.set_manually_updated()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.manually_updated = true THEN
        NEW.manually_updated_at = TIMEZONE('utc'::text, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER set_manually_updated_items
    BEFORE UPDATE ON public.items
    FOR EACH ROW
    EXECUTE FUNCTION public.set_manually_updated();

CREATE TRIGGER set_manually_updated_quests
    BEFORE UPDATE ON public.quests
    FOR EACH ROW
    EXECUTE FUNCTION public.set_manually_updated();

CREATE TRIGGER set_manually_updated_traders
    BEFORE UPDATE ON public.traders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_manually_updated();

CREATE TRIGGER set_manually_updated_arcs
    BEFORE UPDATE ON public.arcs
    FOR EACH ROW
    EXECUTE FUNCTION public.set_manually_updated();

-- Update RLS policies to allow updates (if you want admin-only, add auth check)
-- For now, keeping public write access for admin tools
CREATE POLICY "Allow public update on items" ON public.items FOR UPDATE USING (true);
CREATE POLICY "Allow public update on quests" ON public.quests FOR UPDATE USING (true);
CREATE POLICY "Allow public update on traders" ON public.traders FOR UPDATE USING (true);
CREATE POLICY "Allow public update on arcs" ON public.arcs FOR UPDATE USING (true);
CREATE POLICY "Allow public update on recipes" ON public.recipes FOR UPDATE USING (true);
```

## Query for Manually Updated Items

```sql
-- Find all manually updated items
SELECT id, name, manually_updated_at, manually_updated_by 
FROM items 
WHERE manually_updated = true 
ORDER BY manually_updated_at DESC;

-- Count manually updated vs synced
SELECT 
  manually_updated,
  COUNT(*) as count
FROM items
GROUP BY manually_updated;
```

## Sync Script Updates

The sync script should skip manually updated records. See updated sync script that checks `manually_updated` flag before overwriting.

