# Quest API Fields Reference

Based on actual API response from: `https://metaforge.app/api/arc-raiders/quests`

## Quest Object Structure

```typescript
{
  // Core Fields
  id: string                    // e.g., "a-bad-feeling"
  name: string                  // e.g., "A Bad Feeling"
  
  // XP - Top Level Field (NOT in rewards!)
  xp: number                    // e.g., 0
  
  // Objectives
  objectives: string[]          // Array of objective descriptions
  
  // Rewards - Array of reward objects
  rewards: Array<{
    id: string                  // UUID for the reward
    item_id: string             // Item identifier (e.g., "metal-parts")
    quantity: string            // Quantity as string! (e.g., "10")
    item: {                     // Nested item object with full details
      id: string
      name: string
      icon: string              // CDN URL to icon image
      rarity: string            // "Common", "Uncommon", "Rare", etc.
      item_type: string         // "Basic Material", "Topside Material", etc.
      // May have more fields like value, description, etc.
    }
  }>
  
  // Items
  granted_items: any[]          // Items automatically granted
  required_items: any[]         // Items needed to start quest
  
  // Location/Map
  locations: string[]           // Location identifiers
  marker_category: string|null  // Map marker category
  
  // Timestamps
  created_at: string            // ISO timestamp
  updated_at: string            // ISO timestamp
}
```

## Example API Response

```json
{
  "data": [
    {
      "id": "a-bad-feeling",
      "name": "A Bad Feeling",
      "objectives": [
        "Find and search any ARC Probe or ARC Courier"
      ],
      "xp": 0,
      "granted_items": [],
      "created_at": "2025-10-07T14:15:00.671965+00:00",
      "updated_at": "2025-10-07T14:15:00.671965+00:00",
      "locations": [],
      "marker_category": null,
      "required_items": [],
      "rewards": [
        {
          "id": "7d943cff-1e03-46b1-9099-598000ea0185",
          "item": {
            "id": "metal-parts",
            "icon": "https://cdn.metaforge.app/arc-raiders/icons/metal-parts.webp",
            "name": "Metal Parts",
            "rarity": "Common",
            "item_type": "Basic Material"
          },
          "item_id": "metal-parts",
          "quantity": "10"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 1,
    "total": 75,
    "totalPages": 75,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Key Findings

### ✅ XP is a Top-Level Field
- **NOT** nested inside rewards array
- Access directly: `quest.xp`
- Most quests seem to have `xp: 0` (may be a work in progress)

### ✅ Rewards Have Nested Item Objects
- Each reward has a full `item` object with complete item details
- Quantity is a **string**, not a number!
- Must parse: `parseInt(reward.quantity, 10)`

### ✅ No Direct Coin/Value in Rewards
- Rewards are items, not currency
- Item objects may have a `value` field (not shown in sample)
- Can't reliably sort by "reward value" without item value data

### ❌ Missing Fields (Not Provided by API)
- `type` (tutorial, hunt, exploration, etc.) - NOT in API
- `difficulty` - NOT in API  
- `region` - NOT in API
- `location` - Has `locations` array but often empty
- `duration` - NOT in API
- `recommended_level` - NOT in API
- `required_level` - NOT in API
- `min_players`, `max_players` - NOT in API
- `quest_chain`, `chain_position` - NOT in API
- `previous_quest`, `next_quest` - NOT in API

## Implementation Notes

### Sorting
- ✅ **XP Sorting**: Works, but many quests have 0 XP
- ✅ **Reward Count**: Reliable - count rewards array length
- ❌ **Reward Value**: Unreliable - would need item value data

### Filtering
- ❌ **Type Filter**: Remove (field not provided)
- ❌ **Difficulty Filter**: Remove (field not provided)
- ❌ **Region Filter**: Remove (field not provided)
- ✅ **Search**: Works on name and objectives

### Display
- Show XP badge on every quest (even if 0)
- Show reward count badge
- Display reward items with icons from `item.icon`
- Parse quantity as string: `parseInt(quantity, 10)`

## API Endpoint

```bash
# Get all quests
curl -H "Accept: application/json" \
  "https://metaforge.app/api/arc-raiders/quests"

# Get with pagination
curl -H "Accept: application/json" \
  "https://metaforge.app/api/arc-raiders/quests?page=1&limit=10"

# Get specific quest (if supported)
curl -H "Accept: application/json" \
  "https://metaforge.app/api/arc-raiders/quests?id=a-bad-feeling"
```

## Total Quests
- **75 quests** total in the database (as of query)



