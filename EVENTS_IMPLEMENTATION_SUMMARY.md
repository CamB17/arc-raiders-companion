# Events System - Implementation Summary

## ✅ What Was Implemented

I've built a complete events management system for your Arc Raiders companion app with the following features:

### 🌍 **Automatic Timezone Conversion** (NEW!)
- All times stored in UTC in the database
- Automatically converts to visitor's local timezone
- No user configuration required
- Admins see both UTC and local time previews
- Handles Daylight Saving Time automatically

### 1. **Database Schema** (`EVENTS_SCHEMA.md`)
- Supabase table structure for storing events
- Support for daily and weekly recurring events
- Row-level security policies
- Optimized indexes for performance

### 2. **Admin Interface** (`src/pages/admin/EventsAdmin.tsx`)
- Create, edit, and delete events
- Pre-configured event types: Night Raid, Prospecting Probes, Uncovered Caches, Husk Graveyard, Lush Blooms, Harvester, Launch Tower Loot
- Pre-configured locations: Buried City, Spaceport, Blue Gate, Dam
- Time picker for UTC times
- Active/inactive toggle
- Optional description field
- Real-time event count display

### 3. **Event Timer Component** (`src/components/EventTimer.tsx`)
- Displays in the navbar
- Shows next upcoming or active event
- Real-time countdown (updates every second)
- Changes color when event is active (green) vs upcoming (orange)
- Click to expand and see all events
- Grouped by time slot and location
- Shows "Starts in" or "Ends in" based on event status
- **Automatic timezone conversion** - displays times in user's local timezone
- **Timezone indicator** - shows current timezone (e.g., "PST (UTC-8)")

### 4. **Data Hooks** (`src/hooks/useEvents.ts`)
- `useEvents()` - Fetches active events with countdown timers
- `useAllEvents()` - Fetches all events for admin
- `useCreateEvent()` - Creates new event
- `useUpdateEvent()` - Updates existing event
- `useDeleteEvent()` - Deletes event
- Smart countdown calculation
- Automatic next occurrence detection
- Handles events that cross midnight

### 5. **Navigation Integration**
- Event timer added to Header component
- Responsive design (hidden on mobile, visible on large screens)
- Smooth animations with Framer Motion
- Dropdown panel for viewing all events

### 6. **Admin Dashboard Integration**
- Events section added with pink theme
- Shows event count
- Quick access to events management

## 📋 Quick Start Guide

### Step 1: Set Up the Database

1. Open your Supabase project
2. Go to SQL Editor
3. Run the SQL from `EVENTS_SCHEMA.md`

### Step 2: Add Sample Events

1. Run the SQL from `sample_events.sql` in Supabase SQL Editor
2. This adds 21 sample events covering the schedule you provided

**OR**

Use the admin interface:
1. Go to http://localhost:5173/admin/events
2. Click "Create New Event"
3. Fill in the form
4. Click "Create Event"

### Step 3: View Events

1. The navbar will automatically show the next/active event
2. Click the event timer to see all upcoming events
3. Countdown updates in real-time

## 🎨 UI Features

### Navbar Event Timer
- **Compact Display**: Shows most relevant event
- **Event Name**: e.g., "Night Raid"
- **Location**: e.g., "Buried City"
- **Countdown**: e.g., "2h 50m 31s"
- **Status Indicator**: "Next Event" or "Active Now"

### Expanded Event View (Click to Open)
- **Grouped by Time Slot**: e.g., "06:00 - 07:00 UTC"
- **Grouped by Location**: Events at same location together
- **Event Count Badge**: Shows how many events at each location
- **Live Indicator**: Green "LIVE" badge for active events
- **Individual Countdowns**: Each event shows its own countdown

### Admin Interface
- **Card Grid Layout**: Easy to scan all events
- **Quick Actions**: Edit/Delete buttons on each card
- **Form Validation**: Required fields enforced
- **Inactive Events**: Visually dimmed with "Inactive" badge
- **Real-time Updates**: Changes reflect immediately

## 📊 Example Event Schedule

Based on your data, here's how events are structured:

```
06:00 - 07:00 UTC
├─ Buried City: Night Raid
├─ Spaceport: Prospecting Probes, Uncovered Caches
└─ Blue Gate: Husk Graveyard

07:00 - 08:00 UTC
└─ Spaceport: Night Raid

08:00 - 09:00 UTC
├─ Dam: Night Raid
└─ Buried City: Lush Blooms

... and so on
```

## 🔧 Customization Options

### Add New Event Types
Edit `EventsAdmin.tsx` line ~42:
```typescript
const eventTypes = [
  'Night Raid',
  'Prospecting Probes',
  // Add your new event type here
]
```

### Add New Locations
Edit `EventsAdmin.tsx` line ~51:
```typescript
const locations = [
  'Buried City',
  'Spaceport',
  // Add your new location here
]
```

### Change Timer Colors
Edit `EventTimer.tsx` line ~52:
```typescript
className={`... ${
  nextEvent.status === 'active'
    ? 'bg-green-500 hover:bg-green-600'  // Active event color
    : 'bg-accent-500 hover:bg-accent-600'  // Upcoming event color
}`}
```

## 🎯 How It Works

### Event Lifecycle

1. **Event Created**: Admin creates event with start/end times in UTC
2. **Timezone Conversion**: Times automatically converted to user's local timezone
3. **Countdown Calculation**: System calculates next occurrence based on current time
4. **Status Detection**: Determines if event is upcoming, active, or ended
5. **Display**: Shows most relevant event in navbar with countdown (in local time)
6. **Update Loop**: Countdown updates every second
7. **Status Change**: When event becomes active, display changes from "Starts in" to "Ends in"
8. **Completion**: When event ends, system shows the next occurrence

### Timezone Conversion

```typescript
// Storage (UTC)
Database: "14:00:00 - 15:00:00"

// Display (Auto-converted)
User in PST sees: "6:00 AM - 7:00 AM PST"
User in CET sees: "3:00 PM - 4:00 PM CET"
User in UTC sees: "2:00 PM - 3:00 PM UTC"
```

### Countdown Logic

```typescript
// Pseudo-code
if (currentTime >= eventStart && currentTime < eventEnd) {
  status = 'active'
  countdown = eventEnd - currentTime
  display = "Ends in: {countdown}"
} else {
  status = 'upcoming'
  countdown = nextEventStart - currentTime
  display = "Starts in: {countdown}"
}
```

## 📱 Responsive Design

- **Desktop (>1024px)**: Event timer visible in navbar
- **Tablet/Mobile (<1024px)**: Event timer hidden to save space
- **Expanded View**: Scrollable on mobile, max-height 80vh

## 🔒 Security

- **Row Level Security**: Enabled on events table
- **Public Read**: Anyone can view events
- **Authenticated Write**: Only logged-in users can create/edit/delete
- **Input Validation**: Required fields enforced in forms
- **SQL Injection Protection**: Using Supabase parameterized queries

## 🚀 Performance

- **Real-time Updates**: 1-second refresh interval for countdowns
- **Efficient Queries**: Indexed fields for fast lookups
- **React Query Caching**: Reduces unnecessary API calls
- **Optimistic Updates**: UI updates immediately on changes

## 📝 Database Fields Explained

| Field | Type | Purpose | Example |
|-------|------|---------|---------|
| `event_name` | String | Name of the event | "Night Raid" |
| `location` | String | Where it happens | "Buried City" |
| `start_time` | Time | When it starts (UTC) | "06:00:00" |
| `end_time` | Time | When it ends (UTC) | "07:00:00" |
| `day_of_week` | Int/Null | Specific day or daily | null (daily), 0-6 (weekly) |
| `is_active` | Boolean | Enable/disable event | true |
| `description` | String | Optional notes | "PvPvE combat event" |

## 🎬 Next Steps

1. **Run the Database Setup** - Execute `EVENTS_SCHEMA.md` SQL
2. **Add Sample Events** - Run `sample_events.sql` 
3. **Test the UI** - Visit `/admin/events` and navbar
4. **Customize** - Add your own event types/locations
5. **Go Live** - Events will automatically appear on your site

## 🆘 Troubleshooting

### Issue: Events not showing in navbar
**Solution**: Check that events are marked `is_active = true` and have valid UTC times

### Issue: Countdown not updating
**Solution**: Check browser console for errors, verify Supabase connection

### Issue: Can't create events in admin
**Solution**: Verify Supabase environment variables are set, check Row Level Security policies

### Issue: Wrong countdown times
**Solution**: Ensure all times are in UTC format (24-hour), not local time

## 📚 Files Created/Modified

### New Files
- `src/hooks/useEvents.ts` - Event data hooks
- `src/components/EventTimer.tsx` - Navbar timer component
- `src/pages/admin/EventsAdmin.tsx` - Admin interface
- `src/lib/timezone.ts` - Timezone conversion utilities
- `EVENTS_SCHEMA.md` - Database schema
- `EVENTS_SETUP.md` - Detailed setup guide
- `TIMEZONE_CONVERSION.md` - Timezone feature documentation
- `sample_events.sql` - Sample data
- `EVENTS_IMPLEMENTATION_SUMMARY.md` - This file

### Modified Files
- `src/components/Header.tsx` - Added EventTimer
- `src/pages/admin/AdminDashboard.tsx` - Added Events section
- `src/App.tsx` - Added /admin/events route

## 🎉 You're All Set!

The events system is now fully implemented and ready to use. Your users will see real-time countdown timers for all in-game events, and you can manage everything through the admin interface.

Questions? Check `EVENTS_SETUP.md` for detailed documentation.

