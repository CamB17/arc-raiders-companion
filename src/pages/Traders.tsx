import { useState, useMemo } from 'react'
import { useTraders } from '../hooks/useArcRaidersApi'
import { Search, Filter, MapPin } from 'lucide-react'
import TraderCard from '../components/TraderCard'

const Traders = () => {
  const { data: response, isLoading, error } = useTraders({ includeItems: true, includeQuests: true })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  
  // Extract traders from paginated response
  const traders = response?.data || []
  
  // Extract unique types
  const types = useMemo(() => {
    if (traders.length === 0) return ['all']
    return ['all', ...new Set(traders.map(trader => trader.type).filter(Boolean))]
  }, [traders])
  
  // Extract unique locations
  const locations = useMemo(() => {
    if (traders.length === 0) return ['all']
    const allLocations = traders
      .map(trader => trader.location || trader.region)
      .filter(Boolean)
    return ['all', ...new Set(allLocations)]
  }, [traders])
  
  // Check if we have meaningful filter data
  const hasTypeData = types.length > 1 // More than just 'all'
  const hasLocationData = locations.length > 1 // More than just 'all'
  
  // Filter traders based on search, type, and location
  const filteredTraders = useMemo(() => {
    return traders.filter(trader => {
      const matchesSearch = trader.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           trader.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           trader.location?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || trader.type === selectedType
      const matchesLocation = selectedLocation === 'all' || 
                             trader.location === selectedLocation || 
                             trader.region === selectedLocation
      return matchesSearch && matchesType && matchesLocation
    })
  }, [traders, searchQuery, selectedType, selectedLocation])
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Traders</h2>
          <p className="text-red-600">Unable to fetch traders from the API. Please try again later.</p>
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
            TRADERS
          </h1>
          <p className="text-navy-600">
            Browse all NPC traders, merchants, and vendors in Arc Raiders
          </p>
          {response?.pagination && (
            <p className="text-sm text-navy-500 mt-2">
              Showing {filteredTraders.length} of {response.pagination.total} traders
            </p>
          )}
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6 mb-6">
          <div className={`grid gap-4 ${hasTypeData || hasLocationData ? 'md:grid-cols-3' : 'md:grid-cols-1'}`}>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search traders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none"
              />
            </div>
            
            {/* Type Filter - Only show if data exists */}
            {hasTypeData && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none appearance-none bg-white"
                >
                  {types.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Location Filter - Only show if data exists */}
            {hasLocationData && (
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none appearance-none bg-white"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location === 'all' ? 'All Locations' : location}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          {/* Clear Filters */}
          {(searchQuery || (hasTypeData && selectedType !== 'all') || (hasLocationData && selectedLocation !== 'all')) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedType('all')
                setSelectedLocation('all')
              }}
              className="mt-4 px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
        
        {/* Traders Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-primary-200 p-6 animate-pulse">
                <div className="h-6 bg-primary-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-primary-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-primary-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredTraders.length > 0 ? (
          <>
            <div className="text-sm text-navy-600 mb-6">
              Showing <span className="font-semibold text-navy-800">{filteredTraders.length}</span> {filteredTraders.length === 1 ? 'trader' : 'traders'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTraders.map((trader) => (
                <TraderCard key={trader.id} trader={trader} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-navy-500 text-lg">No traders found matching your criteria.</p>
            {(searchQuery || (hasTypeData && selectedType !== 'all') || (hasLocationData && selectedLocation !== 'all')) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedType('all')
                  setSelectedLocation('all')
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

export default Traders

