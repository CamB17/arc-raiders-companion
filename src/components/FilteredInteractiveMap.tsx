import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  MapPin, Target, Award, ArrowRight, Crosshair, Package, 
  Eye, EyeOff, ChevronDown, ChevronUp, Filter, X
} from 'lucide-react'
import { MapDataPoint } from '../hooks/useArcRaidersApi'

interface MapLocation {
  id: string
  name: string
  type: string
  category?: string
  x: number
  y: number
  difficulty?: string
  region?: string
  location?: string
  description?: string
  icon?: string
  image?: string
  metadata?: Record<string, any>
}

interface CategoryGroup {
  name: string
  items: CategoryItem[]
}

interface CategoryItem {
  id: string
  name: string
  count: number
  icon?: string
  enabled: boolean
}

interface FilteredInteractiveMapProps {
  locations: MapLocation[]
  width?: number
  height?: number
  mapTitle?: string
  mapImage?: string
}

// Convert MapDataPoint to MapLocation with category support
export const mapDataPointToLocation = (point: MapDataPoint): MapLocation => ({
  id: point.id,
  name: point.name,
  type: point.type,
  category: point.metadata?.category || point.type,
  x: point.x,
  y: point.y,
  difficulty: point.difficulty,
  region: point.region,
  location: point.location,
  description: point.description,
  icon: point.icon,
  image: point.image,
  metadata: point.metadata,
})

const FilteredInteractiveMap = ({
  locations,
  width = 1200,
  height = 800,
  mapTitle,
  mapImage,
}: FilteredInteractiveMapProps) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<MapLocation | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['containers', 'arc', 'locations']))
  
  // Organize locations into categories
  const categoryGroups = useMemo(() => {
    const groups: Record<string, Record<string, { count: number; enabled: boolean }>> = {}
    const categoryEnabled: Record<string, boolean> = {}
    
    locations.forEach(loc => {
      const category = loc.category || loc.type || 'other'
      const itemName = loc.name || loc.type || 'Unknown'
      
      if (!groups[category]) {
        groups[category] = {}
        categoryEnabled[category] = true
      }
      
      if (!groups[category][itemName]) {
        groups[category][itemName] = { count: 0, enabled: true }
      }
      
      groups[category][itemName].count++
    })
    
    // Convert to CategoryGroup format
    const categoryGroupsArray: CategoryGroup[] = []
    
    // Containers category
    const containerTypes = ['weapon-case', 'med-crate', 'ammo-crate', 'container', 'breachable-container', 
                           'utility-crate', 'car', 'basket', 'bag', 'baron-husk', 'ark-husk', 'ark-courier', 'ark-probe']
    const containers: CategoryItem[] = []
    containerTypes.forEach(type => {
      const matching = locations.filter(loc => 
        loc.category?.toLowerCase().includes(type) || 
        loc.type?.toLowerCase().includes(type) ||
        loc.name?.toLowerCase().includes(type.replace('-', ' '))
      )
      if (matching.length > 0) {
        containers.push({
          id: type,
          name: type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          count: matching.length,
          enabled: categoryEnabled[type] !== false,
        })
      }
    })
    
    // Arc/Enemy category
    const enemyTypes = ['tick', 'pop', 'fireball', 'surveyor', 'turret', 'sentinel', 'rocketeer', 
                       'bombardier', 'bastion', 'leaper', 'hornet', 'queen', 'snitch', 'wasp']
    const enemies: CategoryItem[] = []
    enemyTypes.forEach(type => {
      const matching = locations.filter(loc => 
        loc.category?.toLowerCase().includes(type) || 
        loc.type?.toLowerCase().includes(type) ||
        loc.name?.toLowerCase().includes(type)
      )
      if (matching.length > 0) {
        enemies.push({
          id: type,
          name: type.charAt(0).toUpperCase() + type.slice(1),
          count: matching.length,
          enabled: categoryEnabled[type] !== false,
        })
      }
    })
    
    // Locations category
    const locationTypes = ['extraction-point', 'hatch-extraction', 'player-spawn', 'supply-call-station',
                          'field-depot', 'field-crate', 'locked-room', 'raider-camp']
    const locationItems: CategoryItem[] = []
    locationTypes.forEach(type => {
      const matching = locations.filter(loc => 
        loc.category?.toLowerCase().includes(type) || 
        loc.type?.toLowerCase().includes(type) ||
        loc.name?.toLowerCase().includes(type.replace('-', ' '))
      )
      if (matching.length > 0) {
        locationItems.push({
          id: type,
          name: type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          count: matching.length,
          enabled: categoryEnabled[type] !== false,
        })
      }
    })
    
    if (containers.length > 0) {
      categoryGroupsArray.push({ name: 'Containers', items: containers })
    }
    if (enemies.length > 0) {
      categoryGroupsArray.push({ name: 'Arc', items: enemies })
    }
    if (locationItems.length > 0) {
      categoryGroupsArray.push({ name: 'Locations', items: locationItems })
    }
    
    return categoryGroupsArray
  }, [locations])
  
  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>(() => {
    const filters: Record<string, boolean> = {}
    categoryGroups.forEach(group => {
      group.items.forEach(item => {
        filters[item.id] = item.enabled
      })
    })
    return filters
  })
  
  // Filter locations based on category filters
  const visibleLocations = useMemo(() => {
    return locations.filter(loc => {
      const searchStr = `${loc.type} ${loc.name} ${loc.category}`.toLowerCase()
      
      // Check if any matching category filter is enabled
      for (const [filterId, enabled] of Object.entries(categoryFilters)) {
        if (!enabled) {
          // Check if this location matches the filter type
          const filterKeywords = filterId.split('-')
          const matches = filterKeywords.some(keyword => searchStr.includes(keyword))
          
          if (matches) {
            return false // Hide this marker
          }
        }
      }
      
      return true // Show this marker
    })
  }, [locations, categoryFilters])
  
  const toggleCategory = (categoryId: string) => {
    setCategoryFilters(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }
  
  const showAll = () => {
    const allEnabled: Record<string, boolean> = {}
    categoryGroups.forEach(group => {
      group.items.forEach(item => {
        allEnabled[item.id] = true
      })
    })
    setCategoryFilters(allEnabled)
  }
  
  const hideAll = () => {
    const allDisabled: Record<string, boolean> = {}
    categoryGroups.forEach(group => {
      group.items.forEach(item => {
        allDisabled[item.id] = false
      })
    })
    setCategoryFilters(allDisabled)
  }
  
  const toggleCategoryGroup = (groupName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupName)) {
        newSet.delete(groupName)
      } else {
        newSet.add(groupName)
      }
      return newSet
    })
  }
  
  const getMarkerColor = (location: MapLocation) => {
    // Color by category/type
    const type = location.category || location.type || ''
    
    if (type.includes('weapon') || type.includes('container')) return '#f59e0b' // Orange
    if (type.includes('med') || type.includes('health')) return '#ef4444' // Red
    if (type.includes('ammo')) return '#2563eb' // Blue
    if (type.includes('extraction')) return '#16a34a' // Green
    if (type.includes('spawn')) return '#9333ea' // Purple
    if (type.includes('enemy') || type.includes('arc')) return '#dc2626' // Dark red
    if (type.includes('supply') || type.includes('depot')) return '#6366f1' // Indigo
    
    return '#6b7280' // Gray default
  }
  
  return (
    <div className="relative h-full w-full bg-black flex">
      {/* Sidebar */}
      <div className={`bg-gray-900 border-r border-gray-700 transition-all duration-300 ${
        sidebarOpen ? 'w-96' : 'w-0 overflow-hidden'
      }`}>
        {sidebarOpen && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold mb-2 text-center text-white">{mapTitle || 'Map Filters'}</h2>
              
              {/* Map selector placeholder */}
              <div className="mb-4">
                <button className="w-full bg-gray-800 border border-gray-600 hover:bg-gray-700 flex items-center justify-between rounded px-3 py-2 text-sm transition-colors text-white">
                  <span>{mapTitle || 'Select Map'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              
              {/* Show All / Hide All */}
              <div className="flex gap-2">
                <button
                  onClick={showAll}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-600 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm transition-colors text-white"
                >
                  <Eye className="w-4 h-4" />
                  Show All
                </button>
                <button
                  onClick={hideAll}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-600 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm transition-colors text-white"
                >
                  <EyeOff className="w-4 h-4" />
                  Hide All
                </button>
              </div>
            </div>
            
            {/* Category List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {categoryGroups.map((group) => {
                const isExpanded = expandedCategories.has(group.name.toLowerCase())
                const enabledCount = group.items.filter(item => categoryFilters[item.id]).length
                
                return (
                  <div key={group.name} className="mb-4">
                    <button
                      onClick={() => toggleCategoryGroup(group.name.toLowerCase())}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-800 rounded transition-colors text-white"
                    >
                      <span className="font-medium text-sm">
                        {group.name} ({enabledCount}/{group.items.length})
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-2 space-y-1">
                        {group.items.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded cursor-pointer transition-colors text-white"
                          >
                            <input
                              type="checkbox"
                              checked={categoryFilters[item.id] ?? true}
                              onChange={() => toggleCategory(item.id)}
                              className="w-4 h-4 rounded border-gray-600"
                            />
                            <span className="text-sm flex-1">{item.name}</span>
                            <span className="text-xs text-gray-400">({item.count})</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Map Container */}
      <div className="flex-1 relative bg-black">
        {/* Background Map Image */}
        {mapImage && (
          <img
            src={mapImage}
            alt={mapTitle || 'Map'}
            className="absolute inset-0 w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
        
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-50 bg-gray-900 border border-gray-700 hover:bg-gray-800 flex h-12 w-12 items-center justify-center rounded-r transition-colors text-white"
          title={sidebarOpen ? 'Hide Filters' : 'Show Filters'}
        >
          <Filter className="w-5 h-5" />
        </button>
        
        {/* Map Markers */}
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0"
          preserveAspectRatio="xMidYMid meet"
        >
          {visibleLocations.map((location) => {
            const x = (location.x / 100) * width
            const y = (location.y / 100) * height
            const isSelected = selectedLocation?.id === location.id
            const isHovered = hoveredLocation?.id === location.id
            const color = getMarkerColor(location)
            
            return (
              <g
                key={location.id}
                className="cursor-pointer"
                onClick={() => setSelectedLocation(location)}
                onMouseEnter={() => setHoveredLocation(location)}
                onMouseLeave={() => setHoveredLocation(null)}
              >
                {/* Marker shadow */}
                <circle
                  cx={x}
                  cy={y + 2}
                  r={isSelected ? 10 : isHovered ? 8 : 6}
                  fill="rgba(0,0,0,0.5)"
                  className="transition-all"
                />
                
                {/* Marker pin */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 8 : isHovered ? 6 : 5}
                  fill={color}
                  stroke="white"
                  strokeWidth={isSelected ? 2 : 1}
                  className="transition-all"
                />
                
                {/* Pulse animation for selected/hovered */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 14 : 12}
                    fill={color}
                    opacity={0.3}
                    className="animate-ping pointer-events-none"
                  />
                )}
              </g>
            )
          })}
        </svg>
        
        {/* Tooltip */}
        {hoveredLocation && !selectedLocation && (
          <div
            className="absolute bg-gray-900 border border-gray-700 rounded shadow-lg p-2 z-50 pointer-events-none max-w-xs text-white"
            style={{
              left: `${(hoveredLocation.x / 100) * 100}%`,
              top: `${(hoveredLocation.y / 100) * 100 + 5}%`,
              transform: 'translate(-50%, 0)',
            }}
          >
            <div className="font-semibold text-sm">{hoveredLocation.name}</div>
            {hoveredLocation.category && (
              <div className="text-xs text-gray-400">{hoveredLocation.category}</div>
            )}
          </div>
        )}
        
        {/* Selected Location Panel */}
        {selectedLocation && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-4 max-w-md text-white">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{selectedLocation.name}</h3>
                {selectedLocation.description && (
                  <p className="text-sm text-gray-400 mt-1">{selectedLocation.description}</p>
                )}
                {selectedLocation.location && (
                  <p className="text-xs text-gray-400 mt-1">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {selectedLocation.location}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FilteredInteractiveMap

