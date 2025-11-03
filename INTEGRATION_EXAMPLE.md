# Supabase Integration Examples

This guide shows how to use the Supabase backend in your Arc Raiders Companion app.

## Basic Usage

### 1. Using Custom Data in Item Details

Update your `ItemDetail.tsx` to show custom data:

```tsx
import { useMergedItem } from '@/hooks/useMergedData'
import { useItem } from '@/hooks/useArcRaidersApi'

const ItemDetail = () => {
  const { id } = useParams()
  const { data: apiItem, isLoading } = useItem(id!)
  
  // Merge API data with custom Supabase data
  const enhancedItem = useMergedItem(apiItem)
  
  if (isLoading) return <LoadingSpinner />
  if (!enhancedItem) return <div>Item not found</div>

  return (
    <div>
      <h1>{enhancedItem.name}</h1>
      <p>{enhancedItem.description}</p>
      
      {/* Show custom tips if available */}
      {enhancedItem.tips && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Tips</h3>
          <p className="text-blue-700">{enhancedItem.tips}</p>
        </div>
      )}
      
      {/* Show meta rating if available */}
      {enhancedItem.metaRating && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Community Rating:</span>
          <span className="text-accent-600 font-bold">
            ⭐ {enhancedItem.metaRating}/5
          </span>
        </div>
      )}
      
      {/* Show locations where item can be found */}
      {enhancedItem.locationsFound && enhancedItem.locationsFound.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">📍 Found At:</h3>
          <div className="flex flex-wrap gap-2">
            {enhancedItem.locationsFound.map((location) => (
              <span key={location} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                {location}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

### 2. Adding Custom Data Badges to Item Cards

Show indicators when items have custom enhancements:

```tsx
import { useHasCustomData, getEnhancementBadges } from '@/hooks/useMergedData'
import { useCustomItemByItemId } from '@/hooks/useSupabase'

const ItemCard = ({ item }: { item: ArcRaidersItem }) => {
  const hasCustomData = useHasCustomData('item', item.id)
  const { data: customData } = useCustomItemByItemId(item.id)
  const badges = getEnhancementBadges(customData)
  
  return (
    <Card>
      <CardContent>
        <h3>{item.name}</h3>
        
        {/* Show "Enhanced" badge */}
        {hasCustomData && (
          <span className="bg-accent-100 text-accent-700 text-xs px-2 py-1 rounded">
            ✨ Community Enhanced
          </span>
        )}
        
        {/* Show specific enhancement badges */}
        <div className="flex flex-wrap gap-1 mt-2">
          {badges.map((badge) => (
            <span key={badge} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {badge}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. Creating Custom Data via Admin Panel

Users with admin access can add custom data:

```tsx
// This is already implemented in CustomItemForm.tsx
// Users navigate to /admin/items/new to create custom data

// Example of programmatic creation:
import { useCreateCustomItem } from '@/hooks/useSupabase'

const MyComponent = () => {
  const createCustomItem = useCreateCustomItem()
  
  const handleCreateCustomData = async () => {
    try {
      await createCustomItem.mutateAsync({
        item_id: 'herbal-bandage',
        tips: 'Best used before combat. Heals over time.',
        locations_found: ['Medical Facility', 'Forest Camps'],
        meta_rating: 4.5,
        tags: ['healing', 'essential', 'consumable'],
      })
      alert('Custom data created!')
    } catch (error) {
      console.error('Failed to create custom data:', error)
    }
  }
  
  return (
    <button onClick={handleCreateCustomData}>
      Add Custom Data
    </button>
  )
}
```

### 4. Displaying Custom Guides

Show community guides on relevant pages:

```tsx
import { useCustomGuides } from '@/hooks/useSupabase'

const GuidesSection = ({ category }: { category: string }) => {
  const { data: guides, isLoading } = useCustomGuides()
  
  const filteredGuides = guides?.filter(g => g.category === category)
  
  if (isLoading) return <LoadingSpinner />
  if (!filteredGuides || filteredGuides.length === 0) return null
  
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Community Guides</h2>
      <div className="grid gap-4">
        {filteredGuides.map((guide) => (
          <Card key={guide.id}>
            <CardHeader>
              <CardTitle>{guide.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-navy-600 mb-2">{guide.excerpt}</p>
              <div className="flex items-center justify-between text-sm text-navy-500">
                <span>By {guide.author || 'Anonymous'}</span>
                <span>{guide.views || 0} views</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

### 5. Showing Custom Locations on Map

Display custom map markers:

```tsx
import { useCustomLocations } from '@/hooks/useSupabase'

const InteractiveMap = () => {
  const { data: locations } = useCustomLocations()
  
  return (
    <div className="relative">
      {/* Your map component */}
      <img src="/map.png" alt="Map" />
      
      {/* Overlay custom location markers */}
      {locations?.map((location) => (
        <div
          key={location.id}
          className="absolute"
          style={{
            left: `${location.map_x}%`,
            top: `${location.map_y}%`,
          }}
        >
          <button
            className="w-6 h-6 bg-accent-500 rounded-full border-2 border-white shadow-lg"
            title={location.name}
          >
            {location.location_type === 'loot' && '📦'}
            {location.location_type === 'danger' && '⚠️'}
            {location.location_type === 'quest' && '❗'}
          </button>
        </div>
      ))}
    </div>
  )
}
```

### 6. Filtering Items by Custom Tags

Add custom tag filtering:

```tsx
import { useCustomItems } from '@/hooks/useSupabase'
import { useItems } from '@/hooks/useArcRaidersApi'

const ItemsPage = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const { data: apiResponse } = useItems()
  const { data: customItems } = useCustomItems()
  
  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    customItems?.forEach(item => {
      item.tags?.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
  }, [customItems])
  
  // Filter items by selected tag
  const filteredItems = useMemo(() => {
    const items = apiResponse?.data || []
    if (!selectedTag) return items
    
    // Get item IDs that have this tag
    const itemIdsWithTag = customItems
      ?.filter(ci => ci.tags?.includes(selectedTag))
      .map(ci => ci.item_id) || []
    
    return items.filter(item => itemIdsWithTag.includes(item.id))
  }, [apiResponse, customItems, selectedTag])
  
  return (
    <div>
      {/* Tag filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded ${!selectedTag ? 'bg-accent-500 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded ${selectedTag === tag ? 'bg-accent-500 text-white' : 'bg-gray-200'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      
      {/* Items grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
```

## Advanced Usage

### Real-time Updates

Listen for changes to custom data:

```tsx
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const ItemDetail = ({ itemId }: { itemId: string }) => {
  useEffect(() => {
    // Subscribe to changes for this specific item
    const subscription = supabase
      .from('custom_items')
      .on('UPDATE', (payload) => {
        if (payload.new.item_id === itemId) {
          console.log('Custom data updated!', payload.new)
          // Refetch or update local state
        }
      })
      .on('INSERT', (payload) => {
        if (payload.new.item_id === itemId) {
          console.log('Custom data added!', payload.new)
        }
      })
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [itemId])
  
  // ... rest of component
}
```

### Bulk Operations

Perform bulk operations on custom data:

```tsx
import { supabase } from '@/lib/supabase'

// Bulk insert custom items
const bulkCreateCustomItems = async (items: Partial<CustomItem>[]) => {
  const { data, error } = await supabase
    .from('custom_items')
    .insert(items)
    .select()
  
  if (error) throw error
  return data
}

// Bulk update ratings
const updateAllRatings = async (multiplier: number) => {
  const { data, error } = await supabase.rpc('bulk_update_ratings', {
    multiplier
  })
  
  if (error) throw error
  return data
}
```

### Custom Queries

Execute custom queries for complex data needs:

```tsx
// Get top-rated items with custom data
const getTopRatedItems = async (limit: number = 10) => {
  const { data, error } = await supabase
    .from('custom_items')
    .select('*')
    .not('meta_rating', 'is', null)
    .order('meta_rating', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data
}

// Get items found in specific location
const getItemsByLocation = async (location: string) => {
  const { data, error } = await supabase
    .from('custom_items')
    .select('*')
    .contains('locations_found', [location])
  
  if (error) throw error
  return data
}
```

## Best Practices

### 1. Cache Custom Data

Use React Query's caching to avoid unnecessary fetches:

```tsx
// Already configured in useSupabase hooks with 5-minute stale time
const { data: customData } = useCustomItem(id) // Automatically cached
```

### 2. Optimistic Updates

Update UI immediately, then sync with server:

```tsx
const updateCustomItem = useUpdateCustomItem()

const handleUpdate = async (updates: Partial<CustomItem>) => {
  // Update local state immediately
  setLocalData(prev => ({ ...prev, ...updates }))
  
  try {
    await updateCustomItem.mutateAsync({ id, updates })
  } catch (error) {
    // Revert on error
    setLocalData(originalData)
  }
}
```

### 3. Handle Missing Data Gracefully

Always check if custom data exists:

```tsx
const enhancedItem = useMergedItem(apiItem)

// Use optional chaining and fallbacks
const tips = enhancedItem?.tips || 'No tips available yet'
const rating = enhancedItem?.metaRating ?? 0
```

### 4. Validate Input

Validate data before saving:

```tsx
const validateCustomItem = (data: Partial<CustomItem>) => {
  if (!data.item_id) {
    throw new Error('item_id is required')
  }
  if (data.meta_rating && (data.meta_rating < 1 || data.meta_rating > 5)) {
    throw new Error('Rating must be between 1 and 5')
  }
  return true
}
```

## Troubleshooting

### Custom data not showing

1. Check if Supabase is configured (`isSupabaseConfigured()`)
2. Verify custom data exists in database (check Table Editor)
3. Check browser console for errors
4. Ensure `item_id` matches exactly with API item ID

### Performance issues

1. Use pagination for large datasets
2. Implement virtual scrolling for long lists
3. Debounce search inputs
4. Use React Query's built-in caching

### Type errors

1. Ensure TypeScript types match database schema
2. Use the provided types from `@/lib/supabase`
3. Regenerate types if schema changes

---

Need more examples? Check the admin pages in `/src/pages/admin/` for complete implementations!

