# Timezone Conversion - Quick Reference

## 🎯 Key Points

1. ✅ **Enter times in UTC** (when creating events in admin)
2. ✅ **Users see local times** (automatically converted)
3. ✅ **No configuration needed** (works automatically)

## 📝 For Admins

### When Creating an Event:

```
Start Time (UTC): 14:00
                  ↓
Shows preview: Local: 6:00 AM (PST - UTC-8)
```

**What you see in admin:**
- Primary: 6:00 AM - 7:00 AM PST ← Local time
- Secondary: 14:00 - 15:00 UTC ← Database storage

## 👥 For Visitors

### What Users See:

**If user is in California (PST):**
```
Event: Night Raid • Buried City
Time: 6:00 AM - 7:00 AM PST
Status: Starts in 2h 50m 31s
```

**If user is in New York (EST):**
```
Event: Night Raid • Buried City
Time: 9:00 AM - 10:00 AM EST
Status: Starts in 2h 50m 31s
```

**If user is in London (GMT):**
```
Event: Night Raid • Buried City
Time: 2:00 PM - 3:00 PM GMT
Status: Starts in 2h 50m 31s
```

All from the same event stored as `14:00:00 - 15:00:00 UTC`!

## 🌍 Timezone Indicator

Users always see their timezone at the top of the expanded event view:

```
┌────────────────────────────┐
│ Event Schedule             │
│ 🌍 Times shown in PST      │
│     (UTC-8)                │
└────────────────────────────┘
```

## ⚙️ How to Use

### Step 1: Find UTC Time
Use a world clock to convert your local time to UTC:
- [WorldTimeBuddy.com](https://www.worldtimebuddy.com/)
- [TimeAndDate.com](https://www.timeanddate.com/worldclock/converter.html)

### Step 2: Enter in Admin
Go to `/admin/events` and enter the UTC time.

### Step 3: Verify Preview
Check the "Local" preview shows the correct time for your timezone.

### Step 4: Save
Users worldwide will see the event in their own timezone!

## 🔄 Common Conversions

### Event at 6 AM Pacific Time:

| Timezone | Local Time | UTC Time (Enter This) |
|----------|------------|----------------------|
| PST      | 6:00 AM    | 14:00                |
| EST      | 9:00 AM    | 14:00                |
| GMT      | 2:00 PM    | 14:00                |
| CET      | 3:00 PM    | 14:00                |
| JST      | 11:00 PM   | 14:00                |

**Always enter:** `14:00` (UTC)

### Event at 2 PM Eastern Time:

| Timezone | Local Time | UTC Time (Enter This) |
|----------|------------|----------------------|
| EST      | 2:00 PM    | 19:00                |
| PST      | 11:00 AM   | 19:00                |
| GMT      | 7:00 PM    | 19:00                |
| CET      | 8:00 PM    | 19:00                |

**Always enter:** `19:00` (UTC)

## 💡 Pro Tips

### Tip 1: Use UTC Tools
Set a world clock widget to show UTC time for easy conversion.

### Tip 2: Check the Preview
Always verify the "Local" preview in the admin form matches what you expect.

### Tip 3: Test in Different Timezones
Use browser DevTools to test how events look in different timezones.

### Tip 4: Document Event Times
Keep a reference document with UTC times for recurring events.

## ⏰ DST Considerations

### Daylight Saving Time Changes

**What happens:** Timezone abbreviations change (PST → PDT, EST → EDT, etc.)

**Do you need to update events?** **NO!** ✅

**Why?** Events are stored in UTC, which never changes. The conversion automatically adjusts.

**Example:**
```
Stored: 14:00 UTC

Winter (PST): Shows as 6:00 AM PST
Summer (PDT): Shows as 7:00 AM PDT

✅ Automatically adjusted!
```

## 🐛 Troubleshooting

### Problem: Times look wrong
**Check:** 
1. Did you enter UTC time, not local time?
2. Is your system clock correct?
3. Is your timezone set correctly?

### Problem: Preview shows wrong time
**Solution:** Your local timezone settings may be incorrect. Check system settings.

### Problem: Users report wrong times
**Ask:** What timezone are they in? The times should match their local timezone.

## 📱 Testing

### Quick Test Checklist:

1. ✅ Create event with UTC time
2. ✅ Check preview shows correct local time
3. ✅ Save event
4. ✅ View in navbar - should show local time
5. ✅ Expand view - should show timezone indicator
6. ✅ Event card in admin - should show both UTC and local

## 🎓 Understanding the System

```
┌─────────────┐
│  Database   │  Stores: "14:00:00 UTC"
└──────┬──────┘
       │
       ├─────────────────────┬─────────────────┐
       │                     │                 │
   ┌───▼────┐          ┌─────▼────┐     ┌─────▼────┐
   │ PST    │          │   EST    │     │   CET    │
   │ User   │          │   User   │     │   User   │
   │        │          │          │     │          │
   │ 6 AM   │          │  9 AM    │     │  3 PM    │
   └────────┘          └──────────┘     └──────────┘
```

**One UTC time → Many local displays**

## 📚 Additional Resources

- Full documentation: `TIMEZONE_CONVERSION.md`
- Setup guide: `EVENTS_SETUP.md`
- Implementation details: `EVENTS_IMPLEMENTATION_SUMMARY.md`

## ✨ Benefits Recap

**For You (Admin):**
- Enter time once
- Works for everyone
- No manual updates

**For Users:**
- See events in their time
- No confusion
- No missed events

**For System:**
- Single source of truth
- Consistent data
- Easy maintenance

---

**Remember:** Store in UTC, display in local! 🌍⏰

