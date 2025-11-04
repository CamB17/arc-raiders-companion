# Admin Data Editing - Complete Guide

## Overview

You can now edit Metaforge data directly through your admin backend! When you update data, it's marked as "manually updated" and the sync script will preserve your changes, so you don't have to wait for Metaforge to update outdated information.

## Features

✅ **Edit Items, Quests, Traders, and Arcs** - Update any Metaforge data field  
✅ **Manual Update Protection** - Your edits are preserved during sync  
✅ **Visual Indicators** - See which records have been manually updated  
✅ **Sync Respects Manual Edits** - Sync script skips manually updated records  

## Database Schema Updates

Run the SQL from `ADMIN_DATA_EDITING.md` to add:
- `manually_updated` (boolean) - Flag indicating manual edit
- `manually_updated_at` (timestamp) - When it was last edited
- `manually_updated_by` (text) - Optional: who edited it

## Hooks Added

New hooks in `src/hooks/useSupabase.ts`:

- `useSupabaseItems()` - Get all items with filters
- `useSupabaseItem(id)` - Get single item
- `useUpdateSupabaseItem()` - Update item (sets `manually_updated = true`)

- `useSupabaseQuests()` - Get all quests
- `useSupabaseQuest(id)` - Get single quest
- `useUpdateSupabaseQuest()` - Update quest

- `useSupabaseTraders()` - Get all traders
- `useSupabaseTrader(id)` - Get single trader
- `useUpdateSupabaseTrader()` - Update trader

- `useSupabaseArcs()` - Get all arcs/enemies
- `useSupabaseArc(id)` - Get single arc
- `useUpdateSupabaseArc()` - Update arc

## Admin Pages Created

### ItemsAdmin (`/admin/data/items`)
- Browse and search all items
- Filter by type and rarity
- See which items are manually updated
- Edit individual items

### ItemEditForm (`/admin/data/items/:id`)
- Comprehensive form to edit all item fields
- Updates name, description, stats, images, etc.
- Automatically sets `manually_updated = true`

## Sync Script Updates

The sync script (`scripts/sync-from-metaforge.ts`) now:

1. **Checks for manually updated records** before syncing
2. **Skips manually updated records** during sync
3. **Logs skipped records** so you know what was preserved

Example output:
```
✅ Synced 150 items, skipped 5 manually updated (page 1)
```

## Workflow

### Editing Data

1. Go to `/admin/data/items` (or quests/traders/arcs)
2. Search/filter for the item you want to update
3. Click "Edit"
4. Update any fields (name, description, stats, etc.)
5. Save - automatically marks as `manually_updated = true`

### Syncing Data

1. Run `npm run sync` to sync from Metaforge
2. Sync script checks for `manually_updated = true`
3. Skips those records, updates everything else
4. Your manual edits are preserved!

## Example: Fixing Outdated Item Data

**Scenario**: Metaforge has wrong stats for "Herbal Bandage"

1. **Edit**: Go to `/admin/data/items` → Search "Herbal Bandage" → Edit
2. **Update**: Change `healingPerSecond` from 5 to 10
3. **Save**: Item is now marked as `manually_updated = true`
4. **Sync**: Run `npm run sync` - Herbal Bandage stats are preserved!
5. **Result**: Your fix stays, other items get updated from Metaforge

## Querying Manually Updated Records

```sql
-- Find all manually updated items
SELECT id, name, manually_updated_at 
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

## Routes to Add

Add these routes to `src/App.tsx`:

```typescript
import ItemsAdmin from './pages/admin/ItemsAdmin'
import ItemEditForm from './pages/admin/ItemEditForm'

// In Routes:
<Route path="/admin/data/items" element={<ItemsAdmin />} />
<Route path="/admin/data/items/:id" element={<ItemEditForm />} />
```

## Next Steps

1. ✅ Run database schema SQL from `ADMIN_DATA_EDITING.md`
2. ✅ Create `ItemEditForm.tsx` component (similar to `CustomItemForm.tsx`)
3. ✅ Add routes to `App.tsx`
4. ✅ Update `AdminDashboard.tsx` to link to `/admin/data/items`
5. ✅ Test editing an item
6. ✅ Run sync to verify manual edits are preserved

## Benefits

- ✅ **Fix outdated data immediately** - Don't wait for Metaforge
- ✅ **Your edits are safe** - Sync won't overwrite them
- ✅ **Track changes** - See when items were manually updated
- ✅ **Better data quality** - Keep your database accurate

## Notes

- Manual edits are permanent until you manually clear the `manually_updated` flag
- To allow sync to overwrite a manual edit, set `manually_updated = false` in database
- Consider adding a "Reset to Metaforge" button in admin UI (future enhancement)

