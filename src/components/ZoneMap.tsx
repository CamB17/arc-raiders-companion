import { useState, useMemo, useEffect } from 'react'
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from 'react-leaflet'
import L, { DivIcon, LatLngBounds } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Map, MapMarker, MapZone } from '@/lib/supabase'
import { CheckSquare, Square, ChevronDown, ChevronRight, Menu, X } from 'lucide-react'

interface ZoneMapProps {
  map: Map & { map_zones?: MapZone[]; map_markers?: MapMarker[] }
  height?: number | string
}

interface MarkerCategory {
  category: string
  name: string
  count: number
  visible: boolean
  markerType: string
}

// Custom marker icon component
const createCustomMarkerIcon = (
  color: string,
  shape: string = 'circle',
  symbol?: string
): DivIcon => {
  const shapeStyles: Record<string, string> = {
    circle: 'border-radius: 50%',
    square: 'border-radius: 2px',
    triangle: 'clip-path: polygon(50% 0%, 0% 100%, 100% 100%)',
  }

  const symbolContent: Record<string, string> = {
    arrow: '↑',
    question: '?',
    skull: '☠',
    leaf: '♣',
    box: '■',
    building: '▲',
  }

  const symbolHtml = symbol && symbolContent[symbol] ? `
    <div style="
      color: white;
      font-size: 10px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    ">${symbolContent[symbol]}</div>
  ` : ''

  return new DivIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 16px;
        height: 16px;
        background-color: ${color};
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        ${shapeStyles[shape] || shapeStyles.circle};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${symbolHtml}
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

// Component to handle map resize on window resize
const MapResizeHandler = () => {
  const mapInstance = useMap()
  
  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        mapInstance.invalidateSize()
      }, 100)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mapInstance])
  
  return null
}

const ZoneMapContent = ({ map, markers, categoryVisibility }: { 
  map: Map
  markers: MapMarker[]
  categoryVisibility: Record<string, boolean>
}) => {
  const mapInstance = useMap()
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null)
  
  // Load image to detect actual dimensions
  useEffect(() => {
    if (!map.image_url) {
      // If no image URL but we have dimensions, use those
      if (map.map_width && map.map_height) {
        setImageDimensions({ width: map.map_width, height: map.map_height })
      }
      return
    }
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      // Fallback to database dimensions if image fails to load
      if (map.map_width && map.map_height) {
        setImageDimensions({ width: map.map_width, height: map.map_height })
      }
    }
    img.src = map.image_url
  }, [map.image_url, map.map_width, map.map_height])
  
  // Image overlay bounds (using CRS.Simple for image coordinates)
  // Use actual image dimensions if available, otherwise fallback to database values
  const bounds: LatLngBounds = useMemo(() => {
    const width = imageDimensions?.width || map.map_width || 1000
    const height = imageDimensions?.height || map.map_height || 1000
    return new LatLngBounds(
      [0, 0],
      [height, width]
    )
  }, [imageDimensions, map.map_height, map.map_width])

  useEffect(() => {
    if (bounds && imageDimensions && mapInstance) {
      // Wait for map to be ready, then fit bounds with substantial padding
      const fitMap = () => {
        const container = mapInstance.getContainer()
        if (!container || container.clientWidth === 0) {
          // Retry if container not ready
          setTimeout(fitMap, 100)
          return
        }
        
        // Use percentage-based padding (20% on all sides) to zoom out significantly
        const paddingPercent = 0.20
        const paddingX = container.clientWidth * paddingPercent
        const paddingY = container.clientHeight * paddingPercent
        
        // Use minimum padding for equal padding on all sides
        const padding = Math.min(paddingX, paddingY)
        
        mapInstance.fitBounds(bounds, { 
          padding: [padding, padding],
          maxZoom: 18,
          animate: false
        })
      }
      
      fitMap()
    }
  }, [mapInstance, bounds, imageDimensions])

  // Convert percentage to pixel coordinates, then to lat/lng
  const percentageToLatLng = (x: number, y: number): [number, number] => {
    const width = imageDimensions?.width || map.map_width || 1000
    const height = imageDimensions?.height || map.map_height || 1000
    const pixelX = (x / 100) * width
    const pixelY = (y / 100) * height
    // Invert Y axis
    const lat = height - pixelY
    const lng = pixelX
    return [lat, lng]
  }

  // Don't render until we have image dimensions
  if (!imageDimensions) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Loading map...</p>
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <MapResizeHandler />
      <ImageOverlay
        url={map.image_url || '/placeholder-map.png'}
        bounds={bounds}
      />
      {markers
        .filter(marker => categoryVisibility[`${marker.marker_type}-${marker.category}`] !== false)
        .map((marker) => {
          const position = percentageToLatLng(marker.x, marker.y)
          const icon = createCustomMarkerIcon(
            marker.icon_color || 'orange',
            marker.icon_shape || 'circle',
            marker.icon_symbol
          )

          return (
            <Marker
              key={marker.id}
              position={position}
              icon={icon}
            >
              <Popup>
                <div className="p-2">
                  <div className="font-semibold text-sm mb-1">{marker.name}</div>
                  {marker.description && (
                    <div className="text-xs text-gray-600 mb-1">{marker.description}</div>
                  )}
                  <div className="text-xs text-gray-500">
                    {marker.marker_type} • {marker.category}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
    </>
  )
}

const ZoneMap = ({ map, height = '70vh' }: ZoneMapProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    container: true,
    arc: true,
    location: true,
  })
  const [categoryVisibility, setCategoryVisibility] = useState<Record<string, boolean>>({})
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  
  // Convert height prop to CSS value
  const mapHeight = typeof height === 'number' ? `${height}px` : height

  // Track window size for responsive sidebar height
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkIsDesktop()
    window.addEventListener('resize', checkIsDesktop)
    return () => window.removeEventListener('resize', checkIsDesktop)
  }, [])

  const markers = map.map_markers || []

  // Group markers by type and category
  const markerCategories = useMemo(() => {
    const categories: Record<string, MarkerCategory> = {}

    markers.forEach((marker) => {
      const key = `${marker.marker_type}-${marker.category}`
      if (!categories[key]) {
        categories[key] = {
          category: marker.category,
          name: marker.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count: 0,
          visible: true,
          markerType: marker.marker_type,
        }
      }
      categories[key].count++
    })

    return Object.values(categories)
  }, [markers])

  // Initialize all categories as visible
  useEffect(() => {
    const initialVisibility: Record<string, boolean> = {}
    markerCategories.forEach(cat => {
      const key = `${cat.markerType}-${cat.category}`
      initialVisibility[key] = cat.visible
    })
    setCategoryVisibility(initialVisibility)
  }, [markerCategories])

  const toggleCategory = (markerType: string, category: string) => {
    const key = `${markerType}-${category}`
    setCategoryVisibility(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const toggleMarkerType = (markerType: string, visible: boolean) => {
    const updated: Record<string, boolean> = {}
    markerCategories
      .filter(cat => cat.markerType === markerType)
      .forEach(cat => {
        const key = `${markerType}-${cat.category}`
        updated[key] = visible
      })
    setCategoryVisibility(prev => ({ ...prev, ...updated }))
  }

  const showAll = () => {
    const updated: Record<string, boolean> = {}
    markerCategories.forEach(cat => {
      const key = `${cat.markerType}-${cat.category}`
      updated[key] = true
    })
    setCategoryVisibility(updated)
  }

  const hideAll = () => {
    const updated: Record<string, boolean> = {}
    markerCategories.forEach(cat => {
      const key = `${cat.markerType}-${cat.category}`
      updated[key] = false
    })
    setCategoryVisibility(updated)
  }

  // Group categories by marker type
  const categoriesByType = useMemo(() => {
    const grouped: Record<string, MarkerCategory[]> = {}
    markerCategories.forEach(cat => {
      if (!grouped[cat.markerType]) {
        grouped[cat.markerType] = []
      }
      grouped[cat.markerType].push(cat)
    })
    return grouped
  }, [markerCategories])

  const visibleCounts = useMemo(() => {
    const counts: Record<string, { visible: number; total: number }> = {}
    Object.keys(categoriesByType).forEach(type => {
      const cats = categoriesByType[type]
      const visible = cats.filter(cat => 
        categoryVisibility[`${cat.markerType}-${cat.category}`] !== false
      ).length
      const total = cats.length
      counts[type] = { visible, total }
    })
    return counts
  }, [categoriesByType, categoryVisibility])

  if (!map.image_url) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Map image not available</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4" style={{ height: mapHeight }}>
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden flex items-center justify-between w-full bg-gray-900 text-white rounded-lg p-3 hover:bg-gray-800 transition-colors"
      >
        <span className="font-semibold">{map.name}</span>
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar Filters */}
      <div 
        className={`
          ${sidebarOpen ? 'block' : 'hidden'} lg:block
          w-full lg:w-64 xl:w-72
          bg-gray-900 text-white rounded-lg p-4 overflow-y-auto flex-shrink-0
        `}
        style={{ height: isDesktop ? mapHeight : 'auto', maxHeight: isDesktop ? 'none' : '50vh' }}
      >
        <div className="mb-4">
          <h2 className="text-lg lg:text-xl font-bold mb-2">{map.name}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={showAll}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
            >
              Show All
            </button>
            <button
              onClick={hideAll}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
            >
              Hide All
            </button>
          </div>
        </div>

        {Object.keys(categoriesByType).map((markerType) => {
          const categories = categoriesByType[markerType]
          const isExpanded = expandedCategories[markerType] ?? true
          const count = visibleCounts[markerType] || { visible: 0, total: 0 }
          const allVisible = categories.every(cat => 
            categoryVisibility[`${cat.markerType}-${cat.category}`] !== false
          )

          return (
            <div key={markerType} className="mb-4">
              <button
                onClick={() => {
                  if (allVisible) {
                    toggleMarkerType(markerType, false)
                  } else {
                    toggleMarkerType(markerType, true)
                  }
                }}
                className="w-full flex items-center justify-between p-2 bg-gray-800 hover:bg-gray-700 rounded mb-2 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {allVisible ? (
                    <CheckSquare className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="font-semibold capitalize truncate">{markerType}</span>
                </div>
                <span className="text-sm text-gray-400 ml-2 flex-shrink-0">
                  {count.visible}/{count.total}
                </span>
              </button>

              <button
                onClick={() => setExpandedCategories(prev => ({
                  ...prev,
                  [markerType]: !isExpanded
                }))}
                className="w-full flex items-center gap-2 p-2 text-sm text-gray-400 hover:text-white mb-1 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )}
                <span>Categories</span>
              </button>

              {isExpanded && (
                <div className="ml-4 space-y-1">
                  {categories.map((cat) => {
                    const key = `${cat.markerType}-${cat.category}`
                    const isVisible = categoryVisibility[key] !== false

                    return (
                      <label
                        key={key}
                        className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => toggleCategory(cat.markerType, cat.category)}
                          className="rounded flex-shrink-0"
                        />
                        <span className="text-sm flex-1 truncate">{cat.name}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">({cat.count})</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Map Container */}
      <div 
        className="flex-1 rounded-lg overflow-hidden border-2 border-gray-800"
        style={{ height: mapHeight, minHeight: '400px' }}
      >
        {map.image_url ? (
          <MapContainer
            center={[map.map_height / 2, map.map_width / 2]}
            zoom={-2}
            minZoom={-5}
            crs={L.CRS.Simple as any}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
            touchZoom={true}
            doubleClickZoom={true}
          >
            <ZoneMapContent
              map={map}
              markers={markers}
              categoryVisibility={categoryVisibility}
            />
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500">Map image not available</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ZoneMap

