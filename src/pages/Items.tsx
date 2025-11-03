import { useState, useMemo } from 'react'
import { useItems } from '../hooks/useArcRaidersApi'
import { Search, Filter, ChevronDown } from 'lucide-react'
import ItemCard from '../components/ItemCard'

// Rarity color styles matching the rarity tags
const getRarityStyles = (rarity?: string): { backgroundColor: string; color: string } => {
  const rarityLower = rarity?.toLowerCase() || ''
  
  const styles: Record<string, { backgroundColor: string; color: string }> = {
    legendary: { backgroundColor: '#6D4D2D', color: '#FFB366' },
    epic: { backgroundColor: '#5D2D6D', color: '#C97FFF' },
    rare: { backgroundColor: '#2D4D6D', color: '#6BA3FF' },
    common: { backgroundColor: '#3D3D3D', color: '#ffffff' },
    uncommon: { backgroundColor: '#2D5A2D', color: '#7FFF7F' },
  }
  
  return styles[rarityLower] || { backgroundColor: '#3D3D3D', color: '#ffffff' }
}

// Category mapping from item_type to display categories
// Maps API item_type values directly to display categories
const mapItemTypeToCategory = (itemType?: string): string => {
  if (!itemType) return 'Misc'
  
  // Normalize the item_type for comparison (case-insensitive, trim whitespace)
  const type = itemType.trim()
  
  // Direct mapping from API item_type values to display categories
  // The API should provide these exact values
  const categoryMap: Record<string, string> = {
    // Weapons
    'Weapon': 'Weapons',
    'Weapons': 'Weapons',
    
    // Augments (was Attunements)
    'Augment': 'Augments',
    'Augments': 'Augments',
    
    // Shields
    'Shield': 'Shield',
    'Shields': 'Shield',
    
    // Ammunition
    'Ammunition': 'Ammunition',
    'Ammo': 'Ammunition',
    
    // Modifications (was Add-on)
    'Modification': 'Modification',
    'Modifications': 'Modification',
    'Add-on': 'Modification',
    'Addon': 'Modification',
    'Attachment': 'Modification',
    
    // Quick Use (was Consumables)
    'Quick Use': 'Quick Use',
    'QuickUse': 'Quick Use',
    
    // Materials - Refined
    'Refined Material': 'Refined Material',
    'Refined Materials': 'Refined Material',
    
    // Materials - Advanced
    'Advanced Material': 'Advanced Material',
    'Advanced Materials': 'Advanced Material',
    
    // Materials - Topside
    'Topside Material': 'Topside Material',
    'Topside Materials': 'Topside Material',
    
    // Nature
    'Nature': 'Nature',
    
    // Blueprints
    'Blueprint': 'Blueprints',
    'Blueprints': 'Blueprints',
    
    // Trinket
    'Trinket': 'Trinket',
    'Trinkets': 'Trinket',
    
    // Recyclable
    'Recyclable': 'Recyclable',
    'Recyclables': 'Recyclable',
    
    // Deployable
    'Deployable': 'Deployable',
    'Deployables': 'Deployable',
    
    // Gadget
    'Gadget': 'Gadget',
    'Gadgets': 'Gadget',
    
    // Improvised
    'Improvised': 'Improvised',
    
    // Throwable
    'Throwable': 'Throwable',
    'Throwables': 'Throwable',
    
    // Keys
    'Key': 'Keys',
    'Keys': 'Keys',
    
    // Misc fallback
  }
  
  // Try exact match first (case-insensitive)
  const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
  if (categoryMap[normalizedType]) {
    return categoryMap[normalizedType]
  }
  
  // Try case-insensitive lookup
  for (const [key, value] of Object.entries(categoryMap)) {
    if (key.toLowerCase() === type.toLowerCase()) {
      return value
    }
  }
  
  // Partial matching for variations
  const typeLower = type.toLowerCase()
  if (typeLower.includes('weapon')) return 'Weapons'
  if (typeLower.includes('augment')) return 'Augments'
  if (typeLower.includes('shield')) return 'Shield'
  if (typeLower.includes('ammunition') || typeLower.includes('ammo')) return 'Ammunition'
  if (typeLower.includes('modification') || typeLower.includes('add-on') || typeLower.includes('attachment')) return 'Modification'
  if (typeLower.includes('quick use') || typeLower.includes('quickuse')) return 'Quick Use'
  if (typeLower.includes('refined material')) return 'Refined Material'
  if (typeLower.includes('advanced material')) return 'Advanced Material'
  if (typeLower.includes('topside material')) return 'Topside Material'
  if (typeLower.includes('nature')) return 'Nature'
  if (typeLower.includes('blueprint')) return 'Blueprints'
  if (typeLower.includes('trinket')) return 'Trinket'
  if (typeLower.includes('recyclable')) return 'Recyclable'
  if (typeLower.includes('deployable')) return 'Deployable'
  if (typeLower.includes('gadget')) return 'Gadget'
  if (typeLower.includes('improvised')) return 'Improvised'
  if (typeLower.includes('throwable')) return 'Throwable'
  if (typeLower.includes('key')) return 'Keys'
  
  return 'Misc'
}

type ItemCategory = 
  | 'All'
  | 'Weapons'
  | 'Augments'
  | 'Shield'
  | 'Ammunition'
  | 'Modification'
  | 'Quick Use'
  | 'Refined Material'
  | 'Advanced Material'
  | 'Topside Material'
  | 'Nature'
  | 'Blueprints'
  | 'Trinket'
  | 'Recyclable'
  | 'Deployable'
  | 'Gadget'
  | 'Improvised'
  | 'Throwable'
  | 'Keys'
  | 'Misc'

const CATEGORIES: ItemCategory[] = [
  'All',
  'Weapons',
  'Augments',
  'Shield',
  'Ammunition',
  'Modification',
  'Quick Use',
  'Refined Material',
  'Advanced Material',
  'Topside Material',
  'Nature',
  'Blueprints',
  'Trinket',
  'Recyclable',
  'Deployable',
  'Gadget',
  'Improvised',
  'Throwable',
  'Keys',
  'Misc',
]

const Items = () => {
  const { data: response, isLoading, error } = useItems()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('All')
  const [rarityDropdownOpen, setRarityDropdownOpen] = useState(false)
  
  // Extract items from paginated response
  const items = response?.data || []
  
  // Extract unique rarities
  const rarities = useMemo(() => {
    if (items.length === 0) return ['all']
    return ['all', ...new Set(items.map(item => item.rarity).filter(Boolean))]
  }, [items])
  
  // Group items by category
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, typeof items> = {}
    
    items.forEach(item => {
      const category = mapItemTypeToCategory(item.item_type)
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(item)
    })
    
    return grouped
  }, [items])
  
  // Get available categories (only show categories that have items)
  const availableCategories = useMemo(() => {
    const cats = CATEGORIES.filter(cat => {
      if (cat === 'All') return true
      return itemsByCategory[cat] && itemsByCategory[cat].length > 0
    })
    return cats
  }, [itemsByCategory])
  
  // Filter items based on search, rarity, and category
  const getFilteredItems = useMemo(() => {
    let filtered = items.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRarity = selectedRarity === 'all' || item.rarity === selectedRarity
      return matchesSearch && matchesRarity
    })
    
    // If a specific category is selected, filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => {
        const itemCategory = mapItemTypeToCategory(item.item_type)
        return itemCategory === selectedCategory
      })
    }
    
    return filtered
  }, [items, searchQuery, selectedRarity, selectedCategory])
  
  // Group filtered items by category for display
  const filteredItemsByCategory = useMemo(() => {
    const grouped: Record<string, typeof items> = {}
    
    getFilteredItems.forEach(item => {
      const category = mapItemTypeToCategory(item.item_type)
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(item)
    })
    
    return grouped
  }, [getFilteredItems])
  
  // Calculate total count across all filtered categories
  const totalFilteredCount = getFilteredItems.length
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Items</h2>
          <p className="text-red-600">Unable to fetch items from the API. Please try again later.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-techno font-bold text-navy-800 mb-3">
            ITEMS DATABASE
          </h1>
          <p className="text-navy-600">
            Browse all weapons, gear, and resources available in Arc Raiders
          </p>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none"
              />
            </div>
            
            {/* Rarity Filter - Custom Dropdown */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5 z-10" />
              <button
                type="button"
                onClick={() => setRarityDropdownOpen(!rarityDropdownOpen)}
                className="w-full pl-10 pr-10 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none bg-white text-left flex items-center justify-between"
              >
                <span>
                  {selectedRarity === 'all' ? 'All Rarities' : selectedRarity}
                </span>
                <ChevronDown className={`w-5 h-5 text-navy-400 transition-transform ${rarityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {rarityDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setRarityDropdownOpen(false)}
                  />
                  <div className="absolute z-50 mt-1 w-full bg-white border border-primary-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {rarities.map(rarity => {
                      const isSelected = rarity === selectedRarity
                      const rarityStyles = rarity === 'all' 
                        ? { backgroundColor: 'transparent', color: '#1e293b' }
                        : getRarityStyles(rarity)
                      
                      // For dropdown, use dark readable text with colored dot indicator
                      // The text colors from tags are too light on white background
                      return (
                        <button
                          key={rarity}
                          type="button"
                          onClick={() => {
                            setSelectedRarity(rarity)
                            setRarityDropdownOpen(false)
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors ${
                            isSelected ? 'bg-primary-100' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {rarity !== 'all' && (
                              <span 
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: rarityStyles.backgroundColor }}
                              />
                            )}
                            <span className="font-medium text-navy-800">
                              {rarity === 'all' ? 'All Rarities' : rarity}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-primary-200">
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedCategory === category
                    ? 'bg-accent-500 text-white shadow-md'
                    : 'bg-primary-100 text-navy-700 hover:bg-primary-200'
                }`}
              >
                {category}
                {category !== 'All' && itemsByCategory[category] && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    selectedCategory === category
                      ? 'bg-white/20 text-white'
                      : 'bg-primary-200 text-navy-600'
                  }`}>
                    {itemsByCategory[category].length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Items Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-primary-200 p-6 animate-pulse h-full">
                <div className="h-6 bg-primary-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-primary-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-primary-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : totalFilteredCount > 0 ? (
          <div className="space-y-8">
            {/* Show summary */}
            <div className="text-sm text-navy-600">
              Showing <span className="font-semibold text-navy-800">{totalFilteredCount}</span> {totalFilteredCount === 1 ? 'item' : 'items'}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </div>
            
            {/* If "All" is selected, show grouped by category */}
            {selectedCategory === 'All' ? (
              CATEGORIES.filter(cat => cat !== 'All' && filteredItemsByCategory[cat] && filteredItemsByCategory[cat].length > 0)
                .map((category) => {
                  const categoryItems = filteredItemsByCategory[category]
                  if (categoryItems.length === 0) return null
                  
                  return (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-techno font-bold text-navy-800">
                          {category}
                        </h2>
                        <span className="px-3 py-1 bg-primary-100 text-navy-600 rounded-full text-sm font-medium">
                          {categoryItems.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                        {categoryItems.map((item) => (
                          <ItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  )
                })
            ) : (
              // If specific category selected, show just that category
              filteredItemsByCategory[selectedCategory] && filteredItemsByCategory[selectedCategory].length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                  {filteredItemsByCategory[selectedCategory].map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-navy-500 text-lg">No items found in {selectedCategory} matching your criteria.</p>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-navy-500 text-lg">No items found matching your criteria.</p>
            {(searchQuery || selectedRarity !== 'all' || selectedCategory !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedRarity('all')
                  setSelectedCategory('All')
                }}
                className="mt-4 px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Items

