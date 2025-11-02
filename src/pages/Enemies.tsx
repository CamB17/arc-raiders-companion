import { useState, useMemo, useEffect } from 'react'
import { useEnemies } from '../hooks/useArcRaidersApi'
import { Search, Filter } from 'lucide-react'
import EnemyCard from '../components/EnemyCard'

const Enemies = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300) // 300ms delay
    
    return () => clearTimeout(timer)
  }, [searchQuery])
  
  // Fetch all enemies - we'll do client-side filtering to search all fields
  const { data: response, isLoading, error } = useEnemies()
  
  // Extract enemies from paginated response
  const enemies = response?.data || []
  
  // Extract unique types
  const types = useMemo(() => {
    return enemies.length > 0
      ? ['all', ...new Set(enemies.map(enemy => enemy.type).filter(Boolean))]
      : ['all']
  }, [enemies])
  
  // Extract unique difficulties
  const difficulties = useMemo(() => {
    return enemies.length > 0
      ? ['all', ...new Set(enemies.map(enemy => enemy.difficulty).filter(Boolean))]
      : ['all']
  }, [enemies])
  
  // Enhanced client-side filtering for additional fields that API might not search
  const filteredEnemies = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      // No search query, just apply type and difficulty filters
      return enemies.filter(enemy => {
        const matchesType = selectedType === 'all' || enemy.type === selectedType
        const matchesDifficulty = selectedDifficulty === 'all' || enemy.difficulty === selectedDifficulty
        return matchesType && matchesDifficulty
      })
    }
    
    // Enhanced search on multiple fields
    const query = debouncedSearchQuery.toLowerCase().trim()
    return enemies.filter(enemy => {
      // Search in name
      const matchesName = enemy.name?.toLowerCase().includes(query)
      
      // Search in description
      const matchesDescription = enemy.description?.toLowerCase().includes(query)
      
      // Search in type
      const matchesTypeField = enemy.type?.toLowerCase().includes(query)
      
      // Search in difficulty
      const matchesDifficultyField = enemy.difficulty?.toLowerCase().includes(query)
      
      // Search in location
      const matchesLocation = enemy.location?.toLowerCase().includes(query)
      
      // Search in weak points
      const matchesWeakPoints = enemy.weak_points?.some((point: string) => 
        point.toLowerCase().includes(query)
      )
      
      // Search in drop item names
      const drops = enemy.drops || enemy.loot || []
      const matchesDrops = drops.some((drop: any) => 
        drop.name?.toLowerCase().includes(query) ||
        drop.item?.toLowerCase().includes(query)
      )
      
      // Check filters
      const matchesType = selectedType === 'all' || enemy.type === selectedType
      const matchesDifficulty = selectedDifficulty === 'all' || enemy.difficulty === selectedDifficulty
      
      return (
        (matchesName || matchesDescription || matchesTypeField || matchesDifficultyField || 
         matchesLocation || matchesWeakPoints || matchesDrops) &&
        matchesType &&
        matchesDifficulty
      )
    })
  }, [enemies, debouncedSearchQuery, selectedType, selectedDifficulty])
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Enemies</h2>
          <p className="text-red-600">Unable to fetch enemies from the API. Please try again later.</p>
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
            ENEMIES DATABASE
          </h1>
          <p className="text-navy-600">
            Browse all enemies and bosses found in Arc Raiders
          </p>
        </div>
        
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-primary-200 p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search enemies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none"
              />
            </div>
            
            {/* Type Filter */}
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
            
            {/* Difficulty Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none appearance-none bg-white"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Difficulties' : difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Enemies Grid */}
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
        ) : filteredEnemies.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-navy-600">
              Showing {filteredEnemies.length} {filteredEnemies.length === 1 ? 'enemy' : 'enemies'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEnemies.map((enemy) => (
                <EnemyCard key={enemy.id} enemy={enemy} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-navy-500 text-lg">No enemies found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Enemies
