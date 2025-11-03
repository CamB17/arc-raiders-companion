# Events System Setup Guide

## Overview

The events system allows you to manage in-game events with countdown timers that appear in the navigation bar. Events are stored in Supabase and can be managed through the admin interface.

## Features

- ✅ **Admin Interface**: Create, edit, and delete events
- ✅ **Countdown Timers**: Real-time countdown in the navbar
- ✅ **Active Event Display**: Shows when events are currently active
- ✅ **Multi-event Support**: Multiple events at the same location/time
- ✅ **Expanded View**: Click to see all upcoming events grouped by time slot
- ✅ **Automatic Timezone Conversion**: Times stored in UTC, displayed in user's local timezone
- ✅ **Timezone Indicator**: Shows current timezone (e.g., "PST (UTC-8)")
- ✅ **Responsive Design**: Works on desktop and mobile

## Setup Instructions

### Step 1: Create the Database Table

1. Go to your Supabase project at https://supabase.com
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the schema from `EVENTS_SCHEMA.md`
5. Click **Run** to execute the SQL

The schema creates:
- `events` table with all necessary fields
- Indexes for performance
- Row Level Security policies
- Public read access, authenticated write access

### Step 2: Add Sample Events

After creating the table, you can add sample events using the SQL below or through the admin interface.

```sql
-- Insert sample events (based on the schedule you provided)
INSERT INTO events (event_name, location, start_time, end_time, is_active) VALUES
-- 06:00 - 07:00 UTC
('Night Raid', 'Buried City', '06:00:00', '07:00:00', true),
('Prospecting Probes', 'Spaceport', '06:00:00', '07:00:00', true),
('Uncovered Caches', 'Spaceport', '06:00:00', '07:00:00', true),
('Husk Graveyard', 'Blue Gate', '06:00:00', '07:00:00', true),

-- 07:00 - 08:00 UTC
('Night Raid', 'Spaceport', '07:00:00', '08:00:00', true),

-- 08:00 - 09:00 UTC
('Night Raid', 'Dam', '08:00:00', '09:00:00', true),
('Lush Blooms', 'Buried City', '08:00:00', '09:00:00', true),

-- 09:00 - 10:00 UTC
('Harvester', 'Dam', '09:00:00', '10:00:00', true),
('Night Raid', 'Buried City', '09:00:00', '10:00:00', true),
('Launch Tower Loot', 'Spaceport', '09:00:00', '10:00:00', true),
('Prospecting Probes', 'Blue Gate', '09:00:00', '10:00:00', true),
('Uncovered Caches', 'Blue Gate', '09:00:00', '10:00:00', true),

-- 10:00 - 11:00 UTC
('Husk Graveyard', 'Dam', '10:00:00', '11:00:00', true),
('Lush Blooms', 'Dam', '10:00:00', '11:00:00', true),
('Night Raid', 'Spaceport', '10:00:00', '11:00:00', true),

-- 11:00 - 12:00 UTC
('Night Raid', 'Dam', '11:00:00', '12:00:00', true),
('Prospecting Probes', 'Buried City', '11:00:00', '12:00:00', true),
('Uncovered Caches', 'Spaceport', '11:00:00', '12:00:00', true),

-- 12:00 - 13:00 UTC
('Night Raid', 'Buried City', '12:00:00', '13:00:00', true),
('Prospecting Probes', 'Spaceport', '12:00:00', '13:00:00', true);
```

### Step 3: Verify Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to **Admin Dashboard** (`/admin`)

3. Click on **Events** section

4. You should see all your events listed

5. The navbar should now display the next/active event with a countdown timer

## Using the Admin Interface

### Create a New Event

1. Go to `/admin/events`
2. Click **Create New Event**
3. Fill in the form:
   - **Event Name**: Select from predefined event types
   - **Location**: Choose a location
   - **Start Time**: When the event starts (UTC)
   - **End Time**: When the event ends (UTC)
   - **Day of Week**: Optional - select "Daily" for events that repeat every day
   - **Active**: Toggle to enable/disable the event
   - **Description**: Optional notes about the event
4. Click **Create Event**

### Edit an Event

1. Find the event card
2. Click the **Edit** icon (pencil)
3. Modify the fields
4. Click **Update Event**

### Delete an Event

1. Find the event card
2. Click the **Delete** icon (trash)
3. Confirm deletion

## Navbar Display

### Compact View (Default)

The navbar shows the most relevant event:
- **Next Event**: Shows the soonest upcoming event with countdown
- **Active Event**: If an event is currently active, it's shown with "Ends in" countdown

The display includes:
- Event name
- Location
- Countdown timer (hours, minutes, seconds)

### Expanded View

Click the event timer to see:
- All events grouped by time slot
- Events within each time slot grouped by location
- Active events highlighted in green
- Individual countdowns for each event

## Event Logic

### Event Status

Events have three statuses:
- **Upcoming**: Event hasn't started yet
- **Active**: Event is currently running
- **Ended**: Event has finished (shows next occurrence)

### Countdown Calculation

The system automatically:
- Calculates the next occurrence of each event
- Updates countdowns every second
- Switches between "Starts in" and "Ends in" based on status
- Handles events that cross midnight

### Daily vs. Specific Day Events

- **Daily Events** (`day_of_week = null`): Occur every day at the specified time
- **Specific Day Events**: Only occur on the selected day of the week (0 = Sunday, 6 = Saturday)

## Customization

### Event Types

Edit the `eventTypes` array in `EventsAdmin.tsx` to add/remove event types:

```typescript
const eventTypes = [
  'Night Raid',
  'Prospecting Probes',
  'Uncovered Caches',
  'Husk Graveyard',
  'Lush Blooms',
  'Harvester',
  'Launch Tower Loot',
  // Add your custom event types here
]
```

### Locations

Edit the `locations` array in `EventsAdmin.tsx`:

```typescript
const locations = [
  'Buried City',
  'Spaceport',
  'Blue Gate',
  'Dam',
  // Add your custom locations here
]
```

### Styling

The event timer in the navbar has different colors based on status:
- **Green**: Active event (currently running)
- **Accent/Orange**: Upcoming event

You can customize these in `EventTimer.tsx`.

## Troubleshooting

### Events Not Showing

1. Check Supabase connection in Admin Dashboard
2. Verify events are marked as `is_active = true`
3. Check browser console for errors
4. Ensure events table exists in Supabase

### Countdown Not Updating

1. Clear browser cache
2. Check that times are in UTC format (HH:MM:SS)
3. Verify `useEvents` hook is fetching with `refetchInterval: 1000`

### Wrong Times Displayed

- All times must be in UTC format
- Use 24-hour format (e.g., 13:00 not 1:00 PM)
- Ensure start_time is before end_time

## Database Schema

The `events` table structure:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_name | VARCHAR(255) | Name of the event |
| location | VARCHAR(255) | Where the event takes place |
| start_time | TIME | Start time in UTC |
| end_time | TIME | End time in UTC |
| day_of_week | INTEGER | 0-6 for specific days, NULL for daily |
| is_active | BOOLEAN | Whether event is enabled |
| description | TEXT | Optional description |
| created_at | TIMESTAMP | When event was created |
| updated_at | TIMESTAMP | Last update time |

## API Reference

### Hooks

#### `useEvents()`
Fetches all active events with calculated countdown timers. Updates every second.

```typescript
const { data: events, isLoading } = useEvents()
```

#### `useAllEvents()`
Fetches all events (including inactive) for admin interface.

```typescript
const { data: events } = useAllEvents()
```

#### `useCreateEvent()`
Creates a new event.

```typescript
const createEvent = useCreateEvent()
await createEvent.mutateAsync(eventData)
```

#### `useUpdateEvent()`
Updates an existing event.

```typescript
const updateEvent = useUpdateEvent()
await updateEvent.mutateAsync({ id, ...updates })
```

#### `useDeleteEvent()`
Deletes an event.

```typescript
const deleteEvent = useDeleteEvent()
await deleteEvent.mutateAsync(id)
```

### Helper Functions

#### `calculateNextOccurrence(event: GameEvent): Date`
Calculates when the event will next occur.

#### `calculateEventStatus(event: GameEvent): EventWithCountdown`
Determines if event is upcoming, active, or ended and calculates countdown.

#### `groupEventsByTimeSlot(events: EventWithCountdown[])`
Groups events by time slot and location for display.

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase connection
3. Ensure all environment variables are set
4. Review the SQL schema in EVENTS_SCHEMA.md

## Future Enhancements

Potential improvements:
- Event notifications
- Event history/logs
- Recurring weekly schedules
- Event categories/filters
- Mobile app push notifications
- Discord/webhook integrations

