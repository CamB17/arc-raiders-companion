import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Target, Award, ArrowRight } from 'lucide-react'

interface MapLocation {
  id: string
  name: string
  type: 'quest'
  x: number // Percentage from left (0-100)
  y: number // Percentage from top (0-100)
  difficulty?: string
  region?: string
  location?: string
}

interface InteractiveMapProps {
  locations: MapLocation[]
  width?: number
  height?: number
}

const getDifficultyColor = (difficulty?: string) => {
  const colors: Record<string, string> = {
    common: '#6b7280',
    uncommon: '#16a34a',
    rare: '#2563eb',
    epic: '#9333ea',
    legendary: '#ea580c',
  }
  
  return colors[difficulty?.toLowerCase() || ''] || '#1e293b'
}

const InteractiveMap = ({ locations, width = 800, height = 600 }: InteractiveMapProps) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [hoveredLocation, setHoveredLocation] = useState<MapLocation | null>(null)
  
  return (
    <div className="relative bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl border-2 border-primary-300 p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDEwIDAgTCAwIDAgMCAxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZGNjYmJlIiBzdHJva2Utd2lkdGg9IjAuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      
      {/* Map Title */}
      <div className="relative z-10 mb-4">
        <h3 className="text-xl font-techno font-bold text-navy-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent-600" />
          Quest Locations
        </h3>
        <p className="text-sm text-navy-600 mt-1">Click on markers to view details</p>
      </div>
      
      {/* Map Container */}
      <div className="relative z-10 bg-white/50 rounded-lg border border-primary-300" style={{ width: '100%', height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Draw region boundaries */}
          {Array.from(new Set(locations.map(l => l.region).filter(Boolean))).map((region, idx) => (
            <g key={region}>
              <text
                x={width * 0.1}
                y={20 + idx * 20}
                fill="#4a3f35"
                fontSize="12"
                fontWeight="bold"
                className="region-label"
              >
                {region}
              </text>
            </g>
          ))}
          
          {/* Draw location markers */}
          {locations.map((location) => {
            const x = (location.x / 100) * width
            const y = (location.y / 100) * height
            const isSelected = selectedLocation?.id === location.id
            const isHovered = hoveredLocation?.id === location.id
            const color = getDifficultyColor(location.difficulty)
            
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
                  r={isSelected ? 12 : isHovered ? 10 : 8}
                  fill="rgba(0,0,0,0.2)"
                  className="transition-all"
                />
                
                {/* Marker pin */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 10 : isHovered ? 8 : 6}
                  fill={color}
                  stroke="white"
                  strokeWidth={2}
                  className="transition-all"
                />
                
                {/* Icon inside marker */}
                <g transform={`translate(${x}, ${y})`} className="pointer-events-none">
                  <circle cx="0" cy="0" r="3" fill="white" />
                </g>
                
                {/* Pulse animation for selected/hovered */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 16 : 14}
                    fill={color}
                    opacity={0.3}
                    className="animate-ping pointer-events-none"
                  />
                )}
                
                {/* Connection lines to show relationships */}
                {location.region && locations.filter(l => l.region === location.region && l.id !== location.id).map(other => {
                  const otherX = (other.x / 100) * width
                  const otherY = (other.y / 100) * height
                  return (
                    <line
                      key={`${location.id}-${other.id}`}
                      x1={x}
                      y1={y}
                      x2={otherX}
                      y2={otherY}
                      stroke={color}
                      strokeWidth={1}
                      strokeDasharray="3,3"
                      opacity={0.2}
                      className="pointer-events-none"
                    />
                  )
                })}
              </g>
            )
          })}
        </svg>
        
        {/* Tooltip for hovered location */}
        {hoveredLocation && !selectedLocation && (
          <div
            className="absolute bg-white rounded-lg shadow-xl border-2 border-accent-400 p-3 z-50 pointer-events-none"
            style={{
              left: `${(hoveredLocation.x / 100) * 100}%`,
              top: `${(hoveredLocation.y / 100) * 100 + 5}%`,
              transform: 'translate(-50%, 0)',
              maxWidth: '200px',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-navy-800 text-sm">{hoveredLocation.name}</span>
            </div>
            {hoveredLocation.location && (
              <p className="text-xs text-navy-600">{hoveredLocation.location}</p>
            )}
            {hoveredLocation.difficulty && (
              <span className="text-xs text-navy-500 mt-1 block">{hoveredLocation.difficulty}</span>
            )}
          </div>
        )}
      </div>
      
      {/* Selected location details panel */}
      {selectedLocation && (
        <div className="relative z-10 mt-4 bg-white rounded-lg border-2 border-accent-400 shadow-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <h4 className="font-techno font-bold text-lg text-navy-800">{selectedLocation.name}</h4>
              </div>
              {selectedLocation.location && (
                <p className="text-sm text-navy-600 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {selectedLocation.location}
                </p>
              )}
              {selectedLocation.region && (
                <p className="text-xs text-navy-500 mb-2">Region: {selectedLocation.region}</p>
              )}
              {selectedLocation.difficulty && (
                <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                  {selectedLocation.difficulty}
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedLocation(null)}
              className="text-navy-400 hover:text-navy-600 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <Link
            to={`/quests/${selectedLocation.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
      
      {/* Legend */}
      <div className="relative z-10 mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-navy-600">Common</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600"></div>
          <span className="text-navy-600">Uncommon</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-navy-600">Rare</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          <span className="text-navy-600">Epic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-600"></div>
          <span className="text-navy-600">Legendary</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Award className="w-3 h-3 text-indigo-600" />
          <span className="text-navy-600">Quest</span>
        </div>
      </div>
    </div>
  )
}

export default InteractiveMap

