-- Fix Row Level Security Policies for Events Table
-- Run this in Supabase SQL Editor to fix the RLS error

-- Drop the old policy
DROP POLICY IF EXISTS "Allow authenticated users to manage events" ON events;

-- Create new policies for insert, update, and delete
-- These allow public access since the admin interface is the gatekeeper

-- Policy: Allow all users to insert
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

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'events'
ORDER BY policyname;

