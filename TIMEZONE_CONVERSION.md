# Automatic Timezone Conversion

## Overview

The events system now automatically converts all times from UTC (stored in database) to the visitor's local timezone. This provides a seamless experience for users around the world.

## How It Works

### 1. **Storage (Backend)**
- All times are stored in **UTC** in the Supabase database
- Format: `HH:MM:SS` (24-hour format)
- Example: `06:00:00` for 6 AM UTC

### 2. **Display (Frontend)**
- Times are automatically converted to the visitor's local timezone
- Detected using `Intl.DateTimeFormat().resolvedOptions().timeZone`
- No user action required - it's automatic

### 3. **Admin Interface**
- Admins enter times in **UTC**
- Real-time preview shows local time conversion
- Both UTC and local times are displayed for clarity

## Examples

### If user is in PST (UTC-8):

**Database stores:** `14:00:00 - 15:00:00`

**User sees in navbar:** `6:00 AM - 7:00 AM PST`

**User sees in expanded view:**
```
6:00 AM - 7:00 AM PST
  Buried City
    Night Raid
    6:00 AM - 7:00 AM
    Starts in: 2h 50m 31s
```

### If user is in CET (UTC+1):

**Database stores:** `14:00:00 - 15:00:00`

**User sees in navbar:** `3:00 PM - 4:00 PM CET`

### If user is in UTC:

**Database stores:** `14:00:00 - 15:00:00`

**User sees in navbar:** `2:00 PM - 3:00 PM UTC`

## Timezone Detection

The system automatically detects:
- **Timezone name**: e.g., "America/Los_Angeles"
- **Timezone abbreviation**: e.g., "PST", "EST", "CET"
- **Timezone offset**: e.g., "UTC-8", "UTC+1"

## Admin Interface Features

### Creating/Editing Events

When you enter times in the admin interface:

**Time Input Fields:**
```
Start Time (UTC) *
[14:00] ← You enter this in UTC

ℹ️ Local: 6:00 AM (PST - UTC-8)
     ↑ Automatically shows local preview
```

**Benefits:**
- See exactly what users will see
- Verify times are correct for your timezone
- Avoid confusion about timezone differences

### Event Cards in Admin

Each event card shows:

**Primary Display (Local Time):**
```
🕐 6:00 AM - 7:00 AM PST
```

**Secondary Display (UTC Reference):**
```
🌍 14:00 - 15:00 UTC
```

This helps you verify the stored UTC time while seeing the local conversion.

## Navbar Event Timer

### Compact Display

```
[Active Now / Next Event]
Night Raid • Buried City
Ends in: 2h 50m 31s
```

Times are calculated and displayed in local timezone automatically.

### Expanded View

```
┌─────────────────────────────────┐
│ Event Schedule                  │
│ 🌍 Times shown in PST (UTC-8)   │
├─────────────────────────────────┤
│ 📅 6:00 AM - 7:00 AM PST        │
│   📍 Buried City (1 event)      │
│      • Night Raid               │
│        6:00 AM - 7:00 AM        │
│        Starts in: 2h 50m 31s    │
└─────────────────────────────────┘
```

The timezone indicator at the top shows the user's current timezone.

## Implementation Details

### Timezone Utility Functions

Located in `src/lib/timezone.ts`:

```typescript
// Get user's timezone abbreviation
getTimezoneAbbreviation() // Returns "PST", "EST", etc.

// Get UTC offset
getTimezoneOffsetString() // Returns "UTC-8", "UTC+1", etc.

// Convert single time
convertUTCToLocal("14:00:00") // Returns "6:00 AM"

// Convert time range
convertTimeRangeToLocal("14:00:00", "15:00:00") 
// Returns "6:00 AM - 7:00 AM PST"

// Get full timezone display
getTimezoneDisplayString() // Returns "PST (UTC-8)"
```

### Components Using Timezone Conversion

1. **EventTimer.tsx** - Navbar display
   - Time slot headers
   - Individual event times
   - Timezone indicator

2. **EventsAdmin.tsx** - Admin interface
   - Form time previews
   - Event card displays
   - Informational messages

## Daylight Saving Time (DST)

The system automatically handles DST transitions:
- Uses browser's native timezone database
- Automatically switches between standard and daylight time
- No manual configuration needed

**Example:**
- **PST** (Pacific Standard Time): UTC-8
- **PDT** (Pacific Daylight Time): UTC-7

The system will show "PST" in winter and "PDT" in summer automatically.

## Edge Cases Handled

### 1. Events Crossing Midnight
If a UTC event crosses midnight in local time, it's handled correctly:

**UTC:** `23:00:00 - 01:00:00` (crosses UTC midnight)  
**PST:** `3:00 PM - 5:00 PM` (same day)

### 2. Multi-day Events
For events that cross midnight in the user's timezone:

**UTC:** `06:00:00 - 08:00:00`  
**JST (UTC+9):** `3:00 PM - 5:00 PM` (next day)

The date will adjust automatically.

### 3. UTC Users
If a user is in UTC timezone (offset = 0):
- Times display exactly as stored
- Shows "UTC" instead of an abbreviation
- No offset indicator needed

## Benefits

### For Users
✅ See events in their own timezone  
✅ No mental math required  
✅ Reduces confusion and missed events  
✅ More accessible to global audience  

### For Admins
✅ Enter times once in UTC  
✅ Preview local conversion  
✅ See both UTC and local times  
✅ Verify times are correct  

### For Development
✅ Single source of truth (UTC in database)  
✅ Timezone-agnostic storage  
✅ Easy to add new features  
✅ Consistent data across all users  

## Testing Different Timezones

To test how events appear in different timezones:

### Chrome DevTools
1. Open DevTools (F12)
2. Press `Ctrl+Shift+P` / `Cmd+Shift+P`
3. Type "sensor"
4. Select "Show Sensors"
5. Change "Location" timezone

### Browser Extensions
- "Timezone Shifter" for Chrome
- "Change Timezone" for Firefox

### Manual Testing
Change your system timezone and refresh the app.

## Troubleshooting

### Times Look Wrong
**Check:**
1. Are times entered in UTC in admin?
2. Is your system timezone set correctly?
3. Does your browser have correct permissions?

### Timezone Not Detected
**Solution:**
The system will default to showing UTC if timezone detection fails. Check browser console for errors.

### DST Confusion
**Remember:**
- UTC never changes (no DST)
- Your local timezone may change with DST
- The system handles this automatically

## Future Enhancements

Possible improvements:
- User preference to override timezone
- Display multiple timezones simultaneously
- Timezone selector in UI
- Admin option to see all events in specific timezone
- Export events with timezone conversions

## API Reference

See `src/lib/timezone.ts` for full API documentation of all timezone utility functions.

## Summary

The timezone conversion system ensures that:
1. **Storage is simple**: Everything in UTC
2. **Display is local**: Automatic conversion
3. **Admin is clear**: Both UTC and local shown
4. **Users are happy**: No timezone confusion

All timezone conversions happen automatically in the browser - no server-side logic needed!

