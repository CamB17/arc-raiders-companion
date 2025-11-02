# Enhanced Item Display - Metaforge Style

## Overview

The Items page and Item Detail pages have been enhanced to display comprehensive game data similar to the Metaforge site, with rich information cards and detailed stats.

## Changes Made

### 1. New Item Card Component (`src/components/ItemCard.tsx`)

Enhanced card design featuring:
- **Image Display**: Item image with gradient background
- **Badge System**: Item type (Quick Use, Weapon, etc.) and rarity badges with color coding
- **Stats Display**: Key stats like Stack Size, Healing, Use Time, Duration, Damage
- **Footer Info**: Weight (KG) and Recycle Value with icons

### 2. Enhanced Item Detail Page (`src/pages/ItemDetail.tsx`)

Comprehensive 2-column layout:

#### Left Column (Sticky Card):
- Large item image with themed background
- Type and Rarity badges
- Item name and description
- Detailed stats table
- Weight and recycle value footer

#### Right Column (Scrollable Panels):
- **Needed to Craft**: Table showing required materials with quantities and types
- **Recycle Value**: Breakdown showing raider coins received, loss calculation, and material breakdown
- **Sold By Traders**: Table showing which NPCs sell the item and at what price
- **Used In Recipes**: List of recipes that use this item

### 3. Updated API Hooks (`src/hooks/useArcRaidersApi.ts`)

- Multiple API endpoint fallbacks
- Comprehensive TypeScript interfaces
- Mock data for development when API is unavailable
- Better error handling and logging

### 4. Styling Improvements

#### Color-Coded Rarities:
- Common: Gray
- Uncommon: Green
- Rare: Blue
- Epic: Purple
- Legendary: Orange

#### Item Types:
- Quick Use: Green
- Consumable: Green
- Weapon: Red
- Armor: Blue
- Material: Gray
- Resource: Yellow

## API Data Structure

The enhanced components expect items with this structure:

```typescript
interface ArcRaidersItem {
  id: string
  name: string
  description?: string
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary'
  type?: 'Quick Use' | 'Weapon' | 'Armor' | 'Material' | etc.
  imageUrl?: string
  
  // Stats
  stackSize?: number
  weight?: number
  stats?: {
    healingPerSecond?: string
    useTime?: string
    duration?: string
    damage?: number
    fireRate?: number
    range?: number
  }
  
  // Economy
  recycleValue?: number
  raiderCoins?: number
  
  // Crafting
  crafting?: {
    requires?: Array<{
      item: string
      count: number
      type?: string
      imageUrl?: string
    }>
    recycleBreakdown?: Array<{
      name: string
      count: number
      value: number
    }>
    used_in?: string[]
  }
  
  // Traders
  traders?: Array<{
    name: string
    price: number
    avatar?: string
  }>
}
```

## Mock Data

When the API is unavailable, the system uses mock data including:
- Herbal Bandage (Uncommon, Quick Use)
- Energy Drink (Common, Consumable)
- AR-15 Assault Rifle (Rare, Weapon)

This allows development and testing without API access.

## Usage

### Viewing Items:
1. Navigate to `/items`
2. Use search and filters to find items
3. Click any item card to view details

### Item Detail:
1. Visit `/items/:id` (e.g., `/items/herbal-bandage`)
2. See all item information in organized panels
3. Use breadcrumb to navigate back

## Features

- ✅ **Rich Visual Cards**: Eye-catching item cards with images and badges
- ✅ **Comprehensive Stats**: All item statistics clearly displayed
- ✅ **Crafting Info**: See what materials are needed and what uses this item
- ✅ **Economy Data**: Recycle values and trader prices
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Loading States**: Skeleton loaders while data fetches
- ✅ **Error Handling**: Graceful fallbacks when data unavailable
- ✅ **Mock Data**: Development continues even without API

## Comparison with Metaforge

| Feature | Metaforge | Our Implementation |
|---------|-----------|-------------------|
| Item Images | ✓ | ✓ (with fallback) |
| Rarity Badges | ✓ | ✓ (color-coded) |
| Stats Display | ✓ | ✓ (organized table) |
| Crafting Materials | ✓ | ✓ (with table) |
| Recycle Breakdown | ✓ | ✓ (with calculation) |
| Trader Info | ✓ | ✓ (with table) |
| Search & Filter | ✓ | ✓ (enhanced) |
| Responsive Design | Limited | ✓ (fully responsive) |
| Loading States | Basic | ✓ (skeleton loaders) |

## Next Steps

1. **Verify API Endpoints**: Test with actual Metaforge API when available
2. **Add Images**: Integrate actual item images from API
3. **Enhanced Filters**: Add more filter options (type, category, etc.)
4. **Comparison Tool**: Allow comparing multiple items side-by-side
5. **Favorites**: Let users save favorite items
6. **Export**: Allow exporting item data

## Technical Notes

- Uses React Query for caching (data cached for 5 minutes)
- Fallback to multiple API URLs automatically
- TypeScript ensures type safety
- Tailwind CSS for consistent styling
- Lucide React for icons
- Mock data in production-ready format

## Testing

To test the enhanced items:

1. **With API**: The system will attempt to fetch from Metaforge API
2. **Without API**: Mock data automatically loads for testing
3. **Search**: Try searching for "bandage", "drink", or "rifle"
4. **Filters**: Filter by rarity (Common, Uncommon, Rare)
5. **Details**: Click any item to see full detail page

The system is designed to work seamlessly whether the API is available or not!

