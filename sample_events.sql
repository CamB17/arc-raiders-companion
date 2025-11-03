-- Sample Events Data for Arc Raiders
-- Run this in Supabase SQL Editor after creating the events table

-- Clear existing events (optional - comment out if you want to keep existing data)
-- DELETE FROM events;

-- Insert sample events based on the provided schedule
INSERT INTO events (event_name, location, start_time, end_time, is_active, description) VALUES

-- 06:00 - 07:00 UTC
('Night Raid', 'Buried City', '06:00:00', '07:00:00', true, 'PvPvE night combat event'),
('Prospecting Probes', 'Spaceport', '06:00:00', '07:00:00', true, 'Resource gathering event'),
('Uncovered Caches', 'Spaceport', '06:00:00', '07:00:00', true, 'Loot discovery event'),
('Husk Graveyard', 'Blue Gate', '06:00:00', '07:00:00', true, 'Enemy horde event'),

-- 07:00 - 08:00 UTC
('Night Raid', 'Spaceport', '07:00:00', '08:00:00', true, 'PvPvE night combat event'),

-- 08:00 - 09:00 UTC
('Night Raid', 'Dam', '08:00:00', '09:00:00', true, 'PvPvE night combat event'),
('Lush Blooms', 'Buried City', '08:00:00', '09:00:00', true, 'Botanical resource event'),

-- 09:00 - 10:00 UTC
('Harvester', 'Dam', '09:00:00', '10:00:00', true, 'Boss encounter event'),
('Night Raid', 'Buried City', '09:00:00', '10:00:00', true, 'PvPvE night combat event'),
('Launch Tower Loot', 'Spaceport', '09:00:00', '10:00:00', true, 'High-tier loot event'),
('Prospecting Probes', 'Blue Gate', '09:00:00', '10:00:00', true, 'Resource gathering event'),
('Uncovered Caches', 'Blue Gate', '09:00:00', '10:00:00', true, 'Loot discovery event'),

-- 10:00 - 11:00 UTC
('Husk Graveyard', 'Dam', '10:00:00', '11:00:00', true, 'Enemy horde event'),
('Lush Blooms', 'Dam', '10:00:00', '11:00:00', true, 'Botanical resource event'),
('Night Raid', 'Spaceport', '10:00:00', '11:00:00', true, 'PvPvE night combat event'),

-- 11:00 - 12:00 UTC
('Night Raid', 'Dam', '11:00:00', '12:00:00', true, 'PvPvE night combat event'),
('Prospecting Probes', 'Buried City', '11:00:00', '12:00:00', true, 'Resource gathering event'),
('Uncovered Caches', 'Spaceport', '11:00:00', '12:00:00', true, 'Loot discovery event'),

-- 12:00 - 13:00 UTC
('Night Raid', 'Buried City', '12:00:00', '13:00:00', true, 'PvPvE night combat event'),
('Prospecting Probes', 'Spaceport', '12:00:00', '13:00:00', true, 'Resource gathering event');

-- Verify the data was inserted
SELECT 
  event_name,
  location,
  start_time,
  end_time,
  is_active
FROM events
ORDER BY start_time, location, event_name;

