import { useState, useMemo } from 'react'
import { useItems } from '../hooks/useArcRaidersApi'
import { useCustomItems } from '../hooks/useSupabase'
import { Search, Filter, ChevronDown, ChevronUp, Star, Scroll, Home, Rocket, Hammer, Info } from 'lucide-react'
import ItemCard from '../components/ItemCard'
import VariantGroupCard from '../components/VariantGroupCard'

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

// Rarity order for sorting: common, uncommon, rare, epic, legendary
const getRarityOrder = (rarity?: string): number => {
  const rarityLower = rarity?.toLowerCase() || ''
  const order: Record<string, number> = {
    'common': 1,
    'uncommon': 2,
    'rare': 3,
    'epic': 4,
    'legendary': 5,
  }
  return order[rarityLower] || 0 // Items without rarity go first (0)
}

// Extract base name from variant names (e.g., "Ferro I" -> "Ferro", "Hullcracker IV" -> "Hullcracker")
const extractBaseName = (name: string): string => {
  // Match Roman numerals (IV, IX, VIII, VII, VI, V, III, II, I, X) or Arabic numerals at the end
  // Match IV and IX before matching I, II, III to avoid partial matches
  // Handle both space and hyphen separators, case-insensitive matching
  const match = name.match(/[\s-]+(IV|IX|VIII|VII|VI|V|III|II|I|X|1|2|3|4|5|6|7|8|9|10)$/i)
  if (match) {
    return name.replace(/[\s-]+(IV|IX|VIII|VII|VI|V|III|II|I|X|1|2|3|4|5|6|7|8|9|10)$/i, '').trim()
  }
  return name
}

// Valid Roman numeral variants
const VALID_VARIANTS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']

// Check if a variant number is valid (excludes invalid ones like "IIII")
const isValidVariant = (variant: string): boolean => {
  return VALID_VARIANTS.includes(variant)
}

// Check for invalid variant patterns (like "IIII", "IIIII", etc.)
const hasInvalidVariant = (name: string): boolean => {
  // Check for invalid patterns: IIII (4 I's), IIIII (5 I's), etc., or any 4+ consecutive I's
  // This catches invalid Roman numeral patterns that aren't valid variants
  // Handle both space and hyphen separators, case-insensitive matching
  const invalidMatch = name.match(/[\s-]+I{4,}$/i) // 4 or more consecutive I's
  return !!invalidMatch
}

// Check if an item name has a valid variant number
const hasVariantNumber = (name: string): boolean => {
  // First check for invalid variants (like "IIII")
  if (hasInvalidVariant(name)) return false
  
  // Match Roman numerals (IV, IX, VIII, VII, VI, V, III, II, I, X) or Arabic numerals
  // Match IV and IX before matching I, II, III to avoid partial matches
  // Handle both space and hyphen separators, case-insensitive matching to handle "iii", "II", etc.
  const match = name.match(/[\s-]+(IV|IX|VIII|VII|VI|V|III|II|I|X|1|2|3|4|5|6|7|8|9|10)$/i)
  if (!match) return false
  
  // Normalize the matched variant to uppercase for validation
  const normalizedVariant = match[1].toUpperCase()
  
  // Validate that the matched variant is actually valid (not "IIII" or other invalid patterns)
  return isValidVariant(normalizedVariant)
}

// Check if an item is the first variant (I or 1) - these should be shown
const isFirstVariant = (name: string): boolean => {
  const match = name.match(/[\s-]+(I|1)$/i) // Handle both space and hyphen, case-insensitive
  if (!match) return false
  const normalizedVariant = match[1].toUpperCase()
  return isValidVariant(normalizedVariant)
}

// Check if an item is a higher variant (II, III, IV, etc.) - these should be hidden
const isHigherVariant = (name: string): boolean => {
  // Match IV and IX before matching II, III to avoid partial matches
  // Handle both space and hyphen separators, case-insensitive matching
  const match = name.match(/[\s-]+(IV|IX|VIII|VII|VI|V|III|II|X|2|3|4|5|6|7|8|9|10)$/i)
  if (!match) return false
  const normalizedVariant = match[1].toUpperCase()
  return isValidVariant(normalizedVariant)
}

const Items = () => {
  const { data: response, isLoading, error } = useItems()
  const { data: customItems = [] } = useCustomItems()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('All')
  const [selectedFlags, setSelectedFlags] = useState<string[]>([])
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false)
  const [rarityDropdownOpen, setRarityDropdownOpen] = useState(false)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  const [showLegend, setShowLegend] = useState(false)
  
  // Available flag filters
  const flagFilters = [
    { flag: 'quest_item', label: 'Quest Items', Icon: Scroll, color: 'text-purple-600' },
    { flag: 'hideout_item', label: 'Hideout Items', Icon: Home, color: 'text-amber-600' },
    { flag: 'project_item', label: 'Project Items', Icon: Rocket, color: 'text-cyan-600' },
    { flag: 'crafting_item', label: 'Crafting Items', Icon: Hammer, color: 'text-orange-600' },
    { flag: 'important_save', label: 'Important', Icon: Star, color: 'text-yellow-600' },
  ]
  
  const toggleFlag = (flag: string) => {
    setSelectedFlags(prev => 
      prev.includes(flag) 
        ? prev.filter(f => f !== flag)
        : [...prev, flag]
    )
  }
  
  // Extract items from paginated response
  const items = response?.data || []
  
  // Create a map of item_id -> item_flags for quick lookup
  const itemFlagsMap = useMemo(() => {
    const map = new Map<string, string[]>()
    customItems.forEach(customItem => {
      if (customItem.item_id && customItem.item_flags && customItem.item_flags.length > 0) {
        map.set(customItem.item_id, customItem.item_flags)
      }
    })
    return map
  }, [customItems])
  
  // Helper to get flags for an item
  const getItemFlags = (itemId: string) => {
    return itemFlagsMap.get(itemId) || []
  }
  
  // Extract unique rarities
  const rarities = useMemo(() => {
    if (items.length === 0) return ['all']
    return ['all', ...new Set(items.map(item => item.rarity).filter(Boolean))]
  }, [items])
  
  // Group items by category and sort by rarity
  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, typeof items> = {}
    
    items.forEach(item => {
      const category = mapItemTypeToCategory(item.item_type)
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(item)
    })
    
    // Sort items within each category by rarity
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        const rarityOrderA = getRarityOrder(a.rarity)
        const rarityOrderB = getRarityOrder(b.rarity)
        if (rarityOrderA !== rarityOrderB) {
          return rarityOrderA - rarityOrderB
        }
        // If same rarity, sort alphabetically by name
        return (a.name || '').localeCompare(b.name || '')
      })
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
  
  // Filter items based on search, rarity, category, and flags
  const getFilteredItems = useMemo(() => {
    let filtered = items.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRarity = selectedRarity === 'all' || item.rarity === selectedRarity
      
      // Flag filtering
      let matchesFlags = true
      if (selectedFlags.length > 0) {
        const itemFlags = getItemFlags(item.id)
        // Item must have at least one of the selected flags
        matchesFlags = selectedFlags.some(flag => itemFlags.includes(flag))
      }
      
      // Show only items with any flags
      let matchesFlaggedOnly = true
      if (showOnlyFlagged) {
        const itemFlags = getItemFlags(item.id)
        matchesFlaggedOnly = itemFlags.length > 0
      }
      
      return matchesSearch && matchesRarity && matchesFlags && matchesFlaggedOnly
    })
    
    // If a specific category is selected, filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => {
        const itemCategory = mapItemTypeToCategory(item.item_type)
        return itemCategory === selectedCategory
      })
    }
    
    return filtered
  }, [items, searchQuery, selectedRarity, selectedCategory, selectedFlags, showOnlyFlagged, itemFlagsMap])
  
  // Group filtered items by category for display and sort by rarity
  const filteredItemsByCategory = useMemo(() => {
    const grouped: Record<string, typeof items> = {}
    
    getFilteredItems.forEach(item => {
      const category = mapItemTypeToCategory(item.item_type)
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(item)
    })
    
    // Sort items within each category by rarity
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        const rarityOrderA = getRarityOrder(a.rarity)
        const rarityOrderB = getRarityOrder(b.rarity)
        if (rarityOrderA !== rarityOrderB) {
          return rarityOrderA - rarityOrderB
        }
        // If same rarity, sort alphabetically by name
        return (a.name || '').localeCompare(b.name || '')
      })
    })
    
    return grouped
  }, [getFilteredItems])
  
  // Calculate total count across all filtered categories
  const totalFilteredCount = getFilteredItems.length

  // Toggle category expansion/collapse
  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category) // Expand (remove from collapsed set)
      } else {
        newSet.add(category) // Collapse (add to collapsed set)
      }
      return newSet
    })
  }

  // Determine if a category section is expanded
  const getIsExpanded = (category: string): boolean => {
    // If viewing a specific category (not "All"), it should always be expanded
    if (selectedCategory !== 'All') {
      return category === selectedCategory
    }
    
    // When viewing "All", check if category is collapsed
    // Default is expanded (not in collapsedCategories)
    return !collapsedCategories.has(category)
  }

  // Reset collapsed state when switching to "All" category
  const handleCategoryChange = (category: ItemCategory) => {
    setSelectedCategory(category)
    // When switching to "All", reset collapsed state (all will be expanded by default)
    if (category === 'All') {
      setCollapsedCategories(new Set())
    }
  }
  
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
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-techno font-bold text-navy-800 mb-3">
                ITEMS DATABASE
              </h1>
              <p className="text-navy-600">
                Browse all weapons, gear, and resources available in Arc Raiders
              </p>
            </div>
            {/* Legend Toggle */}
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-100 hover:bg-primary-200 rounded-lg transition-colors text-sm font-medium text-navy-700 flex-shrink-0"
            >
              <Info className="w-4 h-4" />
              <span>Icon Guide</span>
            </button>
          </div>
          
          {/* Legend */}
          {showLegend && (
            <div className="mt-4 bg-white rounded-xl border border-primary-200 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-navy-700 mb-3 uppercase tracking-wide">
                Item Category Icons
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { flag: 'important_save', label: 'Important Save', icon: Star, color: 'text-yellow-500' },
                  { flag: 'quest_item', label: 'Quest Item', icon: Scroll, color: 'text-blue-500' },
                  { flag: 'hideout_item', label: 'Hideout Item', icon: Home, color: 'text-green-500' },
                  { flag: 'project_item', label: 'Project Item', icon: Rocket, color: 'text-purple-500' },
                  { flag: 'crafting_item', label: 'Crafting Item', icon: Hammer, color: 'text-orange-500' },
                ].map(({ flag, label, icon: Icon, color }) => (
                  <div key={flag} className="flex items-center gap-2 text-sm">
                    <div className={`${color} bg-white/90 rounded-full p-1.5 shadow-sm`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-navy-700">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-4 sm:p-6 mb-6 sticky top-4 z-30 md:static">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none text-sm sm:text-base"
              />
            </div>
            
            {/* Rarity Filter - Custom Dropdown */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5 z-10" />
              <button
                type="button"
                onClick={() => setRarityDropdownOpen(!rarityDropdownOpen)}
                className="w-full pl-10 pr-10 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none bg-white text-left flex items-center justify-between text-sm sm:text-base"
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
          
          {/* Flag Filters */}
          <div className="mt-4 pt-4 border-t border-primary-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-navy-700">
                Filter by Usage:
              </label>
              <button
                onClick={() => setShowOnlyFlagged(!showOnlyFlagged)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  showOnlyFlagged
                    ? 'bg-accent-100 text-accent-700 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {showOnlyFlagged ? 'Showing Flagged Only' : 'Show Flagged Only'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {flagFilters.map(({ flag, label, Icon, color }) => (
                <button
                  key={flag}
                  onClick={() => toggleFlag(flag)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    selectedFlags.includes(flag)
                      ? 'border-accent-500 bg-accent-50 text-accent-700'
                      : 'border-primary-200 bg-white text-navy-600 hover:border-primary-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${selectedFlags.includes(flag) ? 'text-accent-600' : color}`} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
              {selectedFlags.length > 0 && (
                <button
                  onClick={() => setSelectedFlags([])}
                  className="px-3 py-2 text-sm text-navy-500 hover:text-navy-700 underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
          
          {/* Category Tabs - Horizontal scroll on mobile, wrap on desktop */}
          <div className="mt-4 pt-4 border-t border-primary-200">
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 pb-2 sm:pb-0 scrollbar-hide">
              <div className="flex gap-2 min-w-max sm:flex-wrap sm:min-w-0">
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 ${
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
                  
                  const isExpanded = getIsExpanded(category)
                  
                  // Group items by base name for variants
                  // Only include first variant (I) in the main display, but group all variants together
                  const variantGroups: Record<string, typeof categoryItems> = {}
                  const standaloneItems: typeof categoryItems = []
                  
                  categoryItems.forEach(item => {
                    const itemName = (item.name || '').trim()
                    
                    // Skip invalid variants (like "IIII") - don't show them at all
                    if (hasInvalidVariant(itemName)) {
                      // Invalid variant pattern - skip it entirely
                      return
                    }
                    
                    // Check if it has a valid variant number
                    if (hasVariantNumber(itemName)) {
                      // Has a valid variant - group it (even if it's III, II, etc.)
                      const baseName = extractBaseName(itemName)
                      // Normalize base name to ensure consistent grouping (case-insensitive, trimmed)
                      const normalizedBaseName = baseName.toLowerCase().trim()
                      
                      if (!variantGroups[normalizedBaseName]) {
                        variantGroups[normalizedBaseName] = []
                      }
                      variantGroups[normalizedBaseName].push(item)
                    } else {
                      // No valid variant pattern - standalone item
                      standaloneItems.push(item)
                    }
                  })
                  
                  // Filter variant groups to only show those with first variant (I)
                  // Also ensure all variants are included and sorted correctly
                  const variantGroupsToShow: Record<string, typeof categoryItems> = {}
                  Object.keys(variantGroups).forEach(normalizedBaseName => {
                    const groupItems = variantGroups[normalizedBaseName]
                    const hasFirstVariant = groupItems.some(item => 
                      isFirstVariant(item.name || '')
                    )
                    if (hasFirstVariant) {
                      // Sort variants within the group to ensure correct order (I, II, III, IV)
                      groupItems.sort((a, b) => {
                        const aMatch = (a.name || '').match(/[\s-]+(IV|IX|VIII|VII|VI|V|III|II|I|X|1|2|3|4|5|6|7|8|9|10)$/i)
                        const bMatch = (b.name || '').match(/[\s-]+(IV|IX|VIII|VII|VI|V|III|II|I|X|1|2|3|4|5|6|7|8|9|10)$/i)
                        
                        if (!aMatch || !bMatch) return 0
                        
                        const getVariantOrder = (variant: string): number => {
                          // Normalize to uppercase for comparison
                          const normalized = variant.toUpperCase()
                          if (normalized === 'I') return 1
                          if (normalized === 'II') return 2
                          if (normalized === 'III') return 3
                          if (normalized === 'IV') return 4
                          if (normalized === 'V') return 5
                          if (normalized === 'VI') return 6
                          if (normalized === 'VII') return 7
                          if (normalized === 'VIII') return 8
                          if (normalized === 'IX') return 9
                          if (normalized === 'X') return 10
                          return parseInt(variant) || 0
                        }
                        
                        return getVariantOrder(aMatch[1]) - getVariantOrder(bMatch[1])
                      })
                      variantGroupsToShow[normalizedBaseName] = groupItems
                    } else {
                      // If no first variant (I), don't show this group on main page
                      // The variants will be hidden from main display
                    }
                  })
                  
                  return (
                    <div key={category} className="bg-white rounded-xl border border-primary-200 overflow-hidden shadow-sm">
                      <button
                        onClick={() => toggleCategory(category)}
                        className="w-full flex items-center justify-between p-4 hover:bg-primary-50 transition-colors"
                      >
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-techno font-bold text-navy-800">
                          {category}
                        </h2>
                        <span className="px-3 py-1 bg-primary-100 text-navy-600 rounded-full text-sm font-medium">
                          {categoryItems.length}
                        </span>
                      </div>
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-navy-600 transition-transform" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-navy-600 transition-transform" />
                          )}
                        </div>
                      </button>
                      <div 
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="p-6 pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                            {/* Render variant groups (only if 2+ variants) */}
                            {Object.entries(variantGroupsToShow)
                              .filter(([, variantItems]) => variantItems.length >= 2)
                              .map(([baseName, variantItems]) => (
                                <VariantGroupCard
                                  key={baseName}
                                  items={variantItems}
                                  baseName={baseName}
                                />
                              ))}
                            {/* Render standalone items */}
                            {standaloneItems.map((item) => (
                          <ItemCard key={item.id} item={item} itemFlags={getItemFlags(item.id)} />
                        ))}
                            {/* Render single-item variant groups as regular cards */}
                            {Object.entries(variantGroupsToShow)
                              .filter(([, variantItems]) => variantItems.length === 1)
                              .map(([, variantItems]) => (
                                <ItemCard key={variantItems[0].id} item={variantItems[0]} itemFlags={getItemFlags(variantItems[0].id)} />
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
            ) : (
              // If specific category selected, show just that category
              filteredItemsByCategory[selectedCategory] && filteredItemsByCategory[selectedCategory].length > 0 ? (
                (() => {
                  const categoryItems = filteredItemsByCategory[selectedCategory]
                  
                  // Group items by base name for variants
                  // Only include first variant (I) in the main display, but group all variants together
                  const variantGroups: Record<string, typeof categoryItems> = {}
                  const standaloneItems: typeof categoryItems = []
                  
                  categoryItems.forEach(item => {
                    const itemName = (item.name || '').trim()
                    
                    // Skip invalid variants (like "IIII") - don't show them at all
                    if (hasInvalidVariant(itemName)) {
                      // Invalid variant pattern - skip it entirely
                      return
                    }
                    
                    // Check if it has a valid variant number
                    if (hasVariantNumber(itemName)) {
                      // Has a valid variant - group it (even if it's III, II, etc.)
                      const baseName = extractBaseName(itemName)
                      // Normalize base name to ensure consistent grouping (case-insensitive, trimmed)
                      const normalizedBaseName = baseName.toLowerCase().trim()
                      
                      if (!variantGroups[normalizedBaseName]) {
                        variantGroups[normalizedBaseName] = []
                      }
                      variantGroups[normalizedBaseName].push(item)
                    } else {
                      // No valid variant pattern - standalone item
                      standaloneItems.push(item)
                    }
                  })
                  
                  // Filter variant groups to only show those with first variant (I)
                  // Also ensure all variants are included and sorted correctly
                  const variantGroupsToShow: Record<string, typeof categoryItems> = {}
                  Object.keys(variantGroups).forEach(normalizedBaseName => {
                    const groupItems = variantGroups[normalizedBaseName]
                    const hasFirstVariant = groupItems.some(item => 
                      isFirstVariant(item.name || '')
                    )
                    if (hasFirstVariant) {
                      // Sort variants within the group to ensure correct order (I, II, III, IV)
                      groupItems.sort((a, b) => {
                        const aMatch = (a.name || '').match(/[\s-]+(IV|IX|VIII|VII|VI|V|III|II|I|X|1|2|3|4|5|6|7|8|9|10)$/i)
                        const bMatch = (b.name || '').match(/[\s-]+(IV|IX|VIII|VII|VI|V|III|II|I|X|1|2|3|4|5|6|7|8|9|10)$/i)
                        
                        if (!aMatch || !bMatch) return 0
                        
                        const getVariantOrder = (variant: string): number => {
                          // Normalize to uppercase for comparison
                          const normalized = variant.toUpperCase()
                          if (normalized === 'I') return 1
                          if (normalized === 'II') return 2
                          if (normalized === 'III') return 3
                          if (normalized === 'IV') return 4
                          if (normalized === 'V') return 5
                          if (normalized === 'VI') return 6
                          if (normalized === 'VII') return 7
                          if (normalized === 'VIII') return 8
                          if (normalized === 'IX') return 9
                          if (normalized === 'X') return 10
                          return parseInt(variant) || 0
                        }
                        
                        return getVariantOrder(aMatch[1]) - getVariantOrder(bMatch[1])
                      })
                      variantGroupsToShow[normalizedBaseName] = groupItems
                    } else {
                      // If no first variant (I), don't show this group on main page
                      // The variants will be hidden from main display
                    }
                  })
                  
                  return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                      {/* Render variant groups (only if 2+ variants) */}
                      {Object.entries(variantGroupsToShow)
                        .filter(([, variantItems]) => variantItems.length >= 2)
                        .map(([baseName, variantItems]) => (
                          <VariantGroupCard
                            key={baseName}
                            items={variantItems}
                            baseName={baseName}
                          />
                        ))}
                      {/* Render standalone items */}
                      {standaloneItems.map((item) => (
                    <ItemCard key={item.id} item={item} itemFlags={getItemFlags(item.id)} />
                      ))}
                      {/* Render single-item variant groups as regular cards */}
                      {Object.entries(variantGroupsToShow)
                        .filter(([, variantItems]) => variantItems.length === 1)
                        .map(([, variantItems]) => (
                          <ItemCard key={variantItems[0].id} item={variantItems[0]} itemFlags={getItemFlags(variantItems[0].id)} />
                  ))}
                </div>
                  )
                })()
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
            {(searchQuery || selectedRarity !== 'all' || selectedCategory !== 'All' || selectedFlags.length > 0 || showOnlyFlagged) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedRarity('all')
                  setSelectedCategory('All')
                  setSelectedFlags([])
                  setShowOnlyFlagged(false)
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

