import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { MapPin, Eye, EyeOff, ChevronDown, ChevronUp, Filter, X, ZoomIn, ZoomOut } from 'lucide-react'
import { MapDataPoint } from '../hooks/useArcRaidersApi'

interface MapLocation {
  id: string
  name: string
  type: string
  category?: string
  x: number // Percentage from left (0-100)
  y: number // Percentage from top (0-100)
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

interface TileMapProps {
  locations: MapLocation[]
  mapTitle?: string
  tileBaseUrl?: string // For tile-based maps: e.g., "https://cdn.metaforge.app/arc-raiders/maps/dam/{z}/{x}/{y}.webp"
  mapImageUrl?: string // For single image maps: direct URL to the map image
  mapBounds?: {
    minX: number
    minY: number
    maxX: number
    maxY: number
  }
  minZoom?: number
  maxZoom?: number
  defaultZoom?: number
}

// Convert MapDataPoint to MapLocation
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

const TileMap = ({
  locations,
  mapTitle,
  tileBaseUrl,
  mapImageUrl, // Single image URL from API
  mapBounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 },
  minZoom = 0,
  maxZoom = 5,
  defaultZoom = 2,
}: TileMapProps) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<MapLocation | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['containers', 'arc', 'locations']))
  
  // Map state
  const [zoom, setZoom] = useState(defaultZoom)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const loadedTilesRef = useRef<Set<string>>(new Set())
  
  // Clamp zoom level
  const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom))
  
  // Calculate tile coordinates
  const tileSize = 256
  const numTiles = Math.pow(2, clampedZoom)
  const worldSize = numTiles * tileSize
  
  // Center map on initial load
  useEffect(() => {
    if (!mapContainerRef.current) return
    
    const container = mapContainerRef.current
    const rect = container.getBoundingClientRect()
    const containerWidth = rect.width
    const containerHeight = rect.height
    
    // Center the map (assuming map bounds are 0-100%)
    const centerX = (mapBounds.minX + mapBounds.maxX) / 2
    const centerY = (mapBounds.minY + mapBounds.maxY) / 2
    
    // Calculate world size for default zoom
    const defaultNumTiles = Math.pow(2, defaultZoom)
    const defaultWorldSize = defaultNumTiles * tileSize
    
    // Convert to world coordinates
    const worldX = (centerX / 100) * defaultWorldSize
    const worldY = (centerY / 100) * defaultWorldSize
    
    // Calculate initial pan to center the map
    const scale = Math.pow(2, defaultZoom)
    const initialPanX = containerWidth / 2 - worldX * scale
    const initialPanY = containerHeight / 2 - worldY * scale
    
    setPanX(initialPanX)
    setPanY(initialPanY)
  }, []) // Only run once on mount
  
  // Organize locations into categories
  const categoryGroups = useMemo(() => {
    const containerTypes: Record<string, string[]> = {
      'weapon-case': ['weapon case', 'weapon-case', 'weapon', 'case'],
      'med-crate': ['med crate', 'med-crate', 'medical', 'med'],
      'ammo-crate': ['ammo crate', 'ammo-crate', 'ammo'],
      'container': ['container', 'breachable-container', 'breachable'],
      'utility-crate': ['utility crate', 'utility-crate', 'utility'],
      'car': ['car', 'vehicle'],
      'basket': ['basket'],
      'bag': ['bag', 'backpack'],
      'baron-husk': ['baron husk', 'baron-husk'],
      'ark-husk': ['ark husk', 'ark-husk'],
      'ark-courier': ['ark courier', 'ark-courier', 'courier'],
      'ark-probe': ['ark probe', 'ark-probe', 'probe'],
    }
    
    const containers: CategoryItem[] = []
    Object.entries(containerTypes).forEach(([id, keywords]) => {
      const matching = locations.filter(loc => {
        const searchStr = `${loc.type} ${loc.name} ${loc.category}`.toLowerCase()
        return keywords.some(keyword => searchStr.includes(keyword))
      })
      if (matching.length > 0) {
        containers.push({
          id,
          name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          count: matching.length,
          enabled: true,
        })
      }
    })
    
    const enemyTypes: Record<string, string[]> = {
      'tick': ['tick'],
      'pop': ['pop'],
      'fireball': ['fireball'],
      'surveyor': ['surveyor', 'rollbot'],
      'turret': ['turret'],
      'sentinel': ['sentinel'],
      'rocketeer': ['rocketeer'],
      'bombardier': ['bombardier'],
      'bastion': ['bastion'],
      'leaper': ['leaper', 'bison'],
      'hornet': ['hornet'],
      'queen': ['queen'],
      'snitch': ['snitch'],
      'wasp': ['wasp'],
    }
    
    const enemies: CategoryItem[] = []
    Object.entries(enemyTypes).forEach(([id, keywords]) => {
      const matching = locations.filter(loc => {
        const searchStr = `${loc.type} ${loc.name} ${loc.category}`.toLowerCase()
        return keywords.some(keyword => searchStr.includes(keyword))
      })
      if (matching.length > 0) {
        enemies.push({
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          count: matching.length,
          enabled: true,
        })
      }
    })
    
    const locationTypes: Record<string, string[]> = {
      'extraction-point': ['extraction point', 'extraction-point', 'extraction'],
      'hatch-extraction': ['hatch extraction', 'hatch-extraction', 'hatch'],
      'player-spawn': ['player spawn', 'player-spawn', 'spawn'],
      'supply-call-station': ['supply call station', 'supply-call-station', 'supply station', 'call station'],
      'field-depot': ['field depot', 'field-depot', 'depot'],
      'field-crate': ['field crate', 'field-crate'],
      'locked-room': ['locked room', 'locked-room', 'room'],
      'raider-camp': ['raider camp', 'raider-camp', 'camp'],
    }
    
    const locationItems: CategoryItem[] = []
    Object.entries(locationTypes).forEach(([id, keywords]) => {
      const matching = locations.filter(loc => {
        const searchStr = `${loc.type} ${loc.name} ${loc.category}`.toLowerCase()
        return keywords.some(keyword => searchStr.includes(keyword))
      })
      if (matching.length > 0) {
        locationItems.push({
          id,
          name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          count: matching.length,
          enabled: true,
        })
      }
    })
    
    const groups: CategoryGroup[] = []
    if (containers.length > 0) groups.push({ name: 'Containers', items: containers })
    if (enemies.length > 0) groups.push({ name: 'Arc', items: enemies })
    if (locationItems.length > 0) groups.push({ name: 'Locations', items: locationItems })
    
    return groups
  }, [locations])
  
  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>(() => {
    const filters: Record<string, boolean> = {}
    categoryGroups.forEach(group => {
      group.items.forEach(item => {
        filters[item.id] = true
      })
    })
    return filters
  })
  
  // Filter locations
  const visibleLocations = useMemo(() => {
    return locations.filter(loc => {
      const searchStr = `${loc.type} ${loc.name} ${loc.category}`.toLowerCase()
      
      for (const [filterId, enabled] of Object.entries(categoryFilters)) {
        if (!enabled) {
          const filterKeywords = filterId.split('-')
          const matches = filterKeywords.some(keyword => searchStr.includes(keyword))
          if (matches) return false
        }
      }
      
      return true
    })
  }, [locations, categoryFilters])
  
  // Calculate visible tiles
  const visibleTiles = useMemo(() => {
    if (!mapContainerRef.current) return []
    
    const container = mapContainerRef.current
    const rect = container.getBoundingClientRect()
    const containerWidth = rect.width
    const containerHeight = rect.height
    
    // Calculate viewport bounds in world coordinates
    const scale = Math.pow(2, clampedZoom)
    const viewLeft = -panX / scale
    const viewTop = -panY / scale
    const viewRight = viewLeft + containerWidth / scale
    const viewBottom = viewTop + containerHeight / scale
    
    // Calculate tile range
    const minTileX = Math.max(0, Math.floor(viewLeft / tileSize))
    const maxTileX = Math.min(numTiles - 1, Math.ceil(viewRight / tileSize))
    const minTileY = Math.max(0, Math.floor(viewTop / tileSize))
    const maxTileY = Math.min(numTiles - 1, Math.ceil(viewBottom / tileSize))
    
    const tiles: Array<{ x: number; y: number; url: string }> = []
    
    for (let x = minTileX; x <= maxTileX; x++) {
      for (let y = minTileY; y <= maxTileY; y++) {
        const url = tileBaseUrl.replace('{z}', clampedZoom.toString()).replace('{x}', x.toString()).replace('{y}', y.toString())
        tiles.push({ x, y, url })
      }
    }
    
    return tiles
  }, [panX, panY, clampedZoom, tileBaseUrl, numTiles, tileSize])
  
  // Convert map coordinates (percentage) to screen coordinates
  const mapToScreen = useCallback((mapX: number, mapY: number) => {
    if (!mapContainerRef.current) return { x: 0, y: 0 }
    
    const container = mapContainerRef.current
    const rect = container.getBoundingClientRect()
    const containerWidth = rect.width
    const containerHeight = rect.height
    
    // Convert percentage to world coordinates (assuming map is 0-100 in both dimensions)
    const worldX = (mapX / 100) * worldSize
    const worldY = (mapY / 100) * worldSize
    
    // Apply zoom and pan
    const scale = Math.pow(2, clampedZoom)
    const screenX = worldX * scale + panX
    const screenY = worldY * scale + panY
    
    return { x: screenX, y: screenY }
  }, [panX, panY, clampedZoom, worldSize])
  
  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left mouse button
    setIsDragging(true)
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY })
  }, [panX, panY])
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setPanX(e.clientX - dragStart.x)
    setPanY(e.clientY - dragStart.y)
  }, [isDragging, dragStart])
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  // Zoom handlers
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    if (!mapContainerRef.current) return
    
    const container = mapContainerRef.current
    const rect = container.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(minZoom, Math.min(maxZoom, clampedZoom + (e.deltaY > 0 ? -0.1 : 0.1)))
    
    if (newZoom === clampedZoom) return
    
    // Zoom towards mouse position
    const scale = Math.pow(2, newZoom - clampedZoom)
    const newPanX = mouseX - (mouseX - panX) * scale
    const newPanY = mouseY - (mouseY - panY) * scale
    
    setZoom(newZoom)
    setPanX(newPanX)
    setPanY(newPanY)
  }, [panX, panY, clampedZoom, minZoom, maxZoom])
  
  const handleZoomIn = useCallback(() => {
    if (clampedZoom >= maxZoom) return
    setZoom(prev => Math.min(maxZoom, prev + 1))
  }, [clampedZoom, maxZoom])
  
  const handleZoomOut = useCallback(() => {
    if (clampedZoom <= minZoom) return
    setZoom(prev => Math.max(minZoom, prev - 1))
  }, [clampedZoom, minZoom])
  
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
    const type = location.category || location.type || ''
    
    if (type.includes('weapon') || type.includes('container')) return '#f59e0b'
    if (type.includes('med') || type.includes('health')) return '#ef4444'
    if (type.includes('ammo')) return '#2563eb'
    if (type.includes('extraction')) return '#16a34a'
    if (type.includes('spawn')) return '#9333ea'
    if (type.includes('enemy') || type.includes('arc')) return '#dc2626'
    if (type.includes('supply') || type.includes('depot')) return '#6366f1'
    
    return '#6b7280'
  }
  
  return (
    <div className="relative h-full w-full bg-black flex">
      {/* Sidebar */}
      <div className={`bg-gray-900 border-r border-gray-700 transition-all duration-300 ${
        sidebarOpen ? 'w-96' : 'w-0 overflow-hidden'
      }`}>
        {sidebarOpen && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold mb-2 text-center text-white">{mapTitle || 'Map Filters'}</h2>
              
              <div className="mb-4">
                <button className="w-full bg-gray-800 border border-gray-600 hover:bg-gray-700 flex items-center justify-between rounded px-3 py-2 text-sm transition-colors text-white">
                  <span>{mapTitle || 'Select Map'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              
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
      <div className="flex-1 relative bg-black overflow-hidden">
        <div
          ref={mapContainerRef}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Single Image Map (if mapImageUrl is provided) */}
          {mapImageUrl && !tileBaseUrl && (
            <div 
              className="absolute inset-0"
              style={{ 
                transform: `translate(${panX}px, ${panY}px) scale(${Math.pow(2, clampedZoom)})`,
                transformOrigin: 'top left',
              }}
            >
              <img
                src={mapImageUrl}
                alt={mapTitle || 'Map'}
                className="absolute top-0 left-0"
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: 'none',
                  maxHeight: 'none',
                }}
                onLoad={(e) => {
                  // Store natural dimensions for reference
                  const img = e.currentTarget
                  if (!img.style.width || img.style.width === 'auto') {
                    // Use natural dimensions scaled to worldSize for coordinate mapping
                    const naturalWidth = img.naturalWidth || worldSize
                    const naturalHeight = img.naturalHeight || worldSize
                    // Scale to fit worldSize for coordinate system
                    const scaleX = worldSize / naturalWidth
                    const scaleY = worldSize / naturalHeight
                    img.style.width = `${naturalWidth}px`
                    img.style.height = `${naturalHeight}px`
                  }
                }}
                onError={(e) => {
                  console.error('Failed to load map image:', mapImageUrl)
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}
          
          {/* Tile Layer (if tileBaseUrl is provided) */}
          {tileBaseUrl && !mapImageUrl && (
            <div className="absolute inset-0" style={{ transform: `translate(${panX}px, ${panY}px)` }}>
              {visibleTiles.map((tile) => {
                const tileKey = `${clampedZoom}-${tile.x}-${tile.y}`
                const tileX = tile.x * tileSize
                const tileY = tile.y * tileSize
                
                return (
                  <img
                    key={tileKey}
                    src={tile.url}
                    alt={`Tile ${tile.x},${tile.y}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${tileX}px`,
                      top: `${tileY}px`,
                      width: `${tileSize}px`,
                      height: `${tileSize}px`,
                    }}
                    onError={(e) => {
                      // Hide broken tile images
                      e.currentTarget.style.display = 'none'
                    }}
                    loading="lazy"
                  />
                )
              })}
            </div>
          )}
          
          {/* Markers Layer */}
          <svg
            width="100%"
            height="100%"
            className="absolute inset-0 pointer-events-none"
            style={{ transform: `translate(${panX}px, ${panY}px)` }}
          >
            {visibleLocations.map((location) => {
              // Convert map percentage coordinates to world coordinates
              const worldX = (location.x / 100) * worldSize
              const worldY = (location.y / 100) * worldSize
              
              // Apply zoom scale
              const scale = Math.pow(2, clampedZoom)
              
              const isSelected = selectedLocation?.id === location.id
              const isHovered = hoveredLocation?.id === location.id
              const color = getMarkerColor(location)
              
              // Marker size - scales slightly with zoom but stays reasonable
              const baseRadius = 6
              const markerRadius = Math.min(baseRadius * (1 + clampedZoom * 0.2), 12)
              const shadowRadius = markerRadius + 1
              
              return (
                <g
                  key={location.id}
                  className="cursor-pointer pointer-events-auto"
                  onClick={() => setSelectedLocation(location)}
                  onMouseEnter={() => setHoveredLocation(location)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  transform={`translate(${worldX * scale}, ${worldY * scale})`}
                >
                  {/* Marker shadow */}
                  <circle
                    cx={0}
                    cy={2 * scale}
                    r={isSelected ? shadowRadius + 2 : isHovered ? shadowRadius + 1 : shadowRadius}
                    fill="rgba(0,0,0,0.5)"
                    className="transition-all"
                  />
                  
                  {/* Marker pin */}
                  <circle
                    cx={0}
                    cy={0}
                    r={isSelected ? markerRadius + 2 : isHovered ? markerRadius + 1 : markerRadius}
                    fill={color}
                    stroke="white"
                    strokeWidth={isSelected ? 2 * scale : 1 * scale}
                    className="transition-all"
                  />
                  
                  {/* Pulse animation for selected/hovered */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={0}
                      cy={0}
                      r={isSelected ? (markerRadius + 4) : (markerRadius + 2)}
                      fill={color}
                      opacity={0.3}
                      className="animate-ping pointer-events-none"
                    />
                  )}
                </g>
              )
            })}
          </svg>
        </div>
        
        {/* Zoom Controls */}
        <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            disabled={clampedZoom >= maxZoom}
            className="bg-gray-900 border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex h-10 w-10 items-center justify-center rounded transition-colors text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={clampedZoom <= minZoom}
            className="bg-gray-900 border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex h-10 w-10 items-center justify-center rounded transition-colors text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>
        
        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-4 z-50 bg-gray-900 border border-gray-700 hover:bg-gray-800 flex h-12 w-12 items-center justify-center rounded-r transition-colors text-white"
          title={sidebarOpen ? 'Hide Filters' : 'Show Filters'}
        >
          <Filter className="w-5 h-5" />
        </button>
        
        {/* Tooltip */}
        {hoveredLocation && !selectedLocation && mapContainerRef.current && (
          <div
            className="absolute bg-gray-900 border border-gray-700 rounded shadow-lg p-2 z-50 pointer-events-none max-w-xs text-white"
            style={{
              left: `${mapToScreen(hoveredLocation.x, hoveredLocation.y).x}px`,
              top: `${mapToScreen(hoveredLocation.x, hoveredLocation.y).y + 15}px`,
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

export default TileMap

