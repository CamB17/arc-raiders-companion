import { useState, useRef, useEffect } from 'react'
import { MapPin, X } from 'lucide-react'
import type { Map, MapMarker } from '@/lib/supabase'

interface MapMarkerPlacerProps {
  map: Map
  x: number
  y: number
  onPositionChange: (x: number, y: number) => void
  markerColor?: string
}

const MapMarkerPlacer = ({ map, x, y, onPositionChange, markerColor = 'orange' }: MapMarkerPlacerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [markerPosition, setMarkerPosition] = useState({ x, y })

  useEffect(() => {
    setMarkerPosition({ x, y })
  }, [x, y])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    
    // Convert pixel position to percentage
    const percentX = (clickX / rect.width) * 100
    const percentY = (clickY / rect.height) * 100
    
    // Clamp to 0-100
    const clampedX = Math.max(0, Math.min(100, percentX))
    const clampedY = Math.max(0, Math.min(100, percentY))
    
    setMarkerPosition({ x: clampedX, y: clampedY })
    onPositionChange(clampedX, clampedY)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const percentX = (mouseX / rect.width) * 100
    const percentY = (mouseY / rect.height) * 100
    
    const clampedX = Math.max(0, Math.min(100, percentX))
    const clampedY = Math.max(0, Math.min(100, percentY))
    
    setMarkerPosition({ x: clampedX, y: clampedY })
    onPositionChange(clampedX, clampedY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  if (!map.image_url) {
    return (
      <div className="border-2 border-dashed border-primary-300 rounded-lg p-8 text-center bg-gray-50">
        <p className="text-navy-600">Map image not available. Please set the map image URL first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-navy-700">
          Click on the map to place marker at that position
        </label>
        <div className="text-sm text-navy-600">
          Position: ({markerPosition.x.toFixed(1)}%, {markerPosition.y.toFixed(1)}%)
        </div>
      </div>
      
      <div
        ref={containerRef}
        onClick={handleClick}
        className="relative border-2 border-primary-300 rounded-lg overflow-hidden bg-gray-100 cursor-crosshair"
        style={{ maxHeight: '600px', overflow: 'auto' }}
      >
        <img
          src={map.image_url}
          alt={map.name}
          className="w-full h-auto select-none pointer-events-none"
          style={{ display: 'block' }}
          onError={(e) => {
            e.currentTarget.src = '/placeholder-map.png'
          }}
        />
        
        {/* Marker */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move transition-all hover:scale-110"
          style={{
            left: `${markerPosition.x}%`,
            top: `${markerPosition.y}%`,
            zIndex: 10,
          }}
          onMouseDown={handleMouseDown}
        >
          <div
            className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
            style={{ backgroundColor: markerColor }}
          >
            <MapPin className="w-4 h-4 text-white" fill="white" />
          </div>
          
          {/* Position indicator */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
            {markerPosition.x.toFixed(1)}%, {markerPosition.y.toFixed(1)}%
          </div>
        </div>
        
        {/* Instructions overlay */}
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-3 py-2 rounded pointer-events-none">
          <p>Click anywhere to place marker</p>
          <p className="text-gray-300">Drag the marker to adjust position</p>
        </div>
      </div>
    </div>
  )
}

export default MapMarkerPlacer

