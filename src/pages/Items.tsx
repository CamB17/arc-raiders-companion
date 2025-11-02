import { useState } from 'react'
import { useItems } from '../hooks/useArcRaidersApi'
import { Search, Filter } from 'lucide-react'
import ItemCard from '../components/ItemCard'

const Items = () => {
  const { data: response, isLoading, error } = useItems()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<string>('all')
  
  // Extract items from paginated response
  const items = response?.data || []
  
  // Extract unique rarities
  const rarities = items.length > 0
    ? ['all', ...new Set(items.map(item => item.rarity).filter(Boolean))]
    : ['all']
  
  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRarity = selectedRarity === 'all' || item.rarity === selectedRarity
    return matchesSearch && matchesRarity
  })
  
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
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6 mb-8">
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
            
            {/* Rarity Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity === 'all' ? 'All Rarities' : rarity}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-primary-200 p-6 animate-pulse">
                <div className="h-6 bg-primary-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-primary-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-primary-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-navy-600">
              Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-navy-500 text-lg">No items found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Items

