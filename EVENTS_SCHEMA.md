# Events Schema

## Database Table: `events`

```sql
-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  day_of_week INTEGER, -- 0 = Sunday, 1 = Monday, etc. (NULL for daily events)
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_events_location ON events(location);
CREATE INDEX IF NOT EXISTS idx_events_time ON events(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access
CREATE POLICY "Allow public read access" ON events
  FOR SELECT
  USING (true);

-- Policy: Allow all users to insert (since this is an admin tool)
CREATE POLICY "Allow public insert on events" ON events
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow all users to update
CREATE POLICY "Allow public update on events" ON events
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Allow all users to delete
CREATE POLICY "Allow public delete on events" ON events
  FOR DELETE
  USING (true);
```

## Run this in Supabase SQL Editor

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Create a new query
4. Paste the SQL above
5. Run the query

## Event Structure

- **id**: Unique identifier (UUID)
- **event_name**: Name of the event (Night Raid, Prospecting Probes, etc.)
- **location**: Location name (Buried City, Spaceport, Dam, Blue Gate)
- **start_time**: Start time in UTC (HH:MM:SS format)
- **end_time**: End time in UTC (HH:MM:SS format)
- **day_of_week**: Optional - which day of week (0-6, NULL for daily events)
- **is_active**: Whether the event is currently active/enabled
- **description**: Optional description of the event
- **created_at**: When the event was created
- **updated_at**: When the event was last updated

