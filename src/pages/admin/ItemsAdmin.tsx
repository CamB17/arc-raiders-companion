import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Edit, ArrowLeft, Filter, Star, Scroll, Home, Rocket, Hammer, RefreshCw, CheckCircle } from 'lucide-react'
import { useItems } from '@/hooks/useArcRaidersApi'
import { useCustomItems, useUpdateCustomItem, useCreateCustomItem } from '@/hooks/useSupabase'
import { useAutoFlagsForAllItems } from '@/hooks/useAutoFlags'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import LoadingSpinner from '@/components/LoadingSpinner'
import Button from '@/components/Button'

const ItemsAdmin = () => {
  const { data: itemsResponse, isLoading } = useItems({ fetchAll: true })
  const { data: customItems = [] } = useCustomItems()
  const autoFlagsMap = useAutoFlagsForAllItems()
  const updateCustomItem = useUpdateCustomItem()
  const createCustomItem = useCreateCustomItem()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFlags, setSelectedFlags] = useState<string[]>([])
  const [showOnlyFlagged, setShowOnlyFlagged] = useState(false)
  const [isAutoFlagging, setIsAutoFlagging] = useState(false)
  
  const items = itemsResponse?.data || []
  
  // Create a map of item_id -> custom item for quick lookup
  const customItemsMap = useMemo(() => {
    const map = new Map()
    customItems.forEach(customItem => {
      if (customItem.item_id) {
        map.set(customItem.item_id, customItem)
      }
    })
    return map
  }, [customItems])
  
  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>()
    items.forEach(item => {
      if (item.item_type) {
        cats.add(item.item_type)
      }
    })
    return ['all', ...Array.from(cats).sort()]
  }, [items])
  
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
  
  const handleAutoFlagAll = async () => {
    if (!confirm('This will automatically set flags for all items based on their usage in quests, crafting, hideouts, and projects. Continue?')) {
      return
    }
    
    setIsAutoFlagging(true)
    
    try {
      let processed = 0
      let created = 0
      let updated = 0
      
      for (const [itemId, flags] of Object.entries(autoFlagsMap)) {
        if (flags.length === 0) continue
        
        // Check if custom item already exists
        const existingCustomItem = customItemsMap.get(itemId)
        
        if (existingCustomItem) {
          // Merge flags
          const currentFlags = existingCustomItem.item_flags || []
          const mergedFlags = Array.from(new Set([...currentFlags, ...flags]))
          
          // Only update if there are new flags
          if (mergedFlags.length > currentFlags.length) {
            await updateCustomItem.mutateAsync({
              id: existingCustomItem.id,
              updates: {
                item_flags: mergedFlags,
              },
            })
            updated++
          }
        } else {
          // Create new custom item entry with flags
          await createCustomItem.mutateAsync({
            item_id: itemId,
            item_flags: flags,
          })
          created++
        }
        
        processed++
        
        // Small delay to avoid rate limiting
        if (processed % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      alert(`Auto-flagging complete!\n\nCreated: ${created} new entries\nUpdated: ${updated} existing entries\nTotal processed: ${processed}`)
    } catch (error) {
      console.error('Auto-flagging failed:', error)
      alert('Auto-flagging failed. Check console for details.')
    } finally {
      setIsAutoFlagging(false)
    }
  }
  
  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || item.item_type === selectedCategory
      
      // Flag filtering
      let matchesFlags = true
      if (selectedFlags.length > 0) {
        const customItem = customItemsMap.get(item.id)
        const itemFlags = customItem?.item_flags || []
        // Item must have at least one of the selected flags
        matchesFlags = selectedFlags.some(flag => itemFlags.includes(flag))
      }
      
      // Show only items with any flags
      let matchesFlaggedOnly = true
      if (showOnlyFlagged) {
        const customItem = customItemsMap.get(item.id)
        matchesFlaggedOnly = (customItem?.item_flags?.length || 0) > 0
      }
      
      return matchesSearch && matchesCategory && matchesFlags && matchesFlaggedOnly
    })
  }, [items, searchQuery, selectedCategory, selectedFlags, showOnlyFlagged, customItemsMap])
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/admin"
          className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin Dashboard
        </Link>
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-techno font-bold text-navy-800 mb-3">
                EDIT ITEMS
              </h1>
              <p className="text-navy-600">
                Click any item to edit its custom data, flags, and metadata
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleAutoFlagAll}
              disabled={isAutoFlagging}
            >
              {isAutoFlagging ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Auto-Flag All Items
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <Card className="mb-6">
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
                
                {/* Category Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5 z-10" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Flag Filters */}
              <div>
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
            </div>
          </CardContent>
        </Card>
        
        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Items ({filteredItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Image</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Rarity</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-navy-700">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-navy-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const customItem = customItemsMap.get(item.id)
                    const hasCustomData = !!customItem
                    const itemImage = item.icon || item.image || item.imageUrl || item.thumbnail
                    
                    return (
                      <tr key={item.id} className="border-b border-primary-100 hover:bg-primary-50">
                        <td className="py-3 px-4">
                          {itemImage ? (
                            <img 
                              src={itemImage} 
                              alt={item.name}
                              className="w-12 h-12 object-contain"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-primary-100 rounded flex items-center justify-center">
                              <span className="text-xl font-techno text-navy-600">
                                {item.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-navy-800">{item.name}</div>
                            <div className="text-xs text-navy-500 font-mono">{item.id}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-navy-600">
                          {item.item_type || '-'}
                        </td>
                        <td className="py-3 px-4">
                          {item.rarity && (
                            <span className="px-2 py-1 text-xs font-bold rounded bg-primary-100 text-navy-700">
                              {item.rarity}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {hasCustomData ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Edited
                              </span>
                              {customItem?.item_flags && customItem.item_flags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {customItem.item_flags.map(flag => {
                                    const flagInfo = flagFilters.find(f => f.flag === flag)
                                    if (!flagInfo) return null
                                    const FlagIcon = flagInfo.Icon
                                    return (
                                      <span
                                        key={flag}
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent-50"
                                        title={flagInfo.label}
                                      >
                                        <FlagIcon className={`w-3 h-3 ${flagInfo.color}`} />
                                      </span>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                              <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                              Default
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/admin/items/${item.id}/edit`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              
              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-navy-500">No items found matching your criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ItemsAdmin

