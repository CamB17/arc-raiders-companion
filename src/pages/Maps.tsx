import { useSearchParams, Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import TileMap, { mapDataPointToLocation } from '../components/TileMap'
import { useMapData, useAvailableMaps } from '../hooks/useArcRaidersApi'
import LoadingSpinner from '../components/LoadingSpinner'
import Card from '../components/Card'

const Maps = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedZoneId = searchParams.get('zone')
  
  // Fetch available maps
  const { data: availableMaps, isLoading: mapsLoading } = useAvailableMaps('arc-raiders')
  
  // Fetch map data for the selected zone (if one is selected)
  const { data: mapData, isLoading: mapDataLoading, error } = useMapData(
    'arc-raiders', 
    selectedZoneId || ''
  )
  
  // Convert map data points to locations for the InteractiveMap component
  const locations = mapData?.data?.map(mapDataPointToLocation) || []
  
  const isLoading = mapsLoading || (selectedZoneId && mapDataLoading)
  
  // If no zone is selected, show the map overview page
  if (!selectedZoneId) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-techno font-bold text-navy-800 mb-2 flex items-center gap-3">
              <MapPin className="w-10 h-10 text-accent-600" />
              ARC Raiders Interactive Maps
            </h1>
            <p className="text-lg text-navy-600">
              Find the best loot spots, quest locations, POIs, ARC enemies and more on the MetaForge ARC Raiders Interactive Map.
            </p>
          </div>
          
          {/* Info Card */}
          <Card className="mb-8">
            <h2 className="text-2xl font-techno font-bold text-navy-800 mb-4">ARC Raiders Maps</h2>
            <p className="text-navy-600 mb-4">
              Find the best loot spots, quest locations, POIs, ARC enemies and more on the MetaForge ARC Raiders Interactive Map.
            </p>
            <p className="text-navy-600 mb-4">
              <Link to="/maps?zone=dam" className="text-accent-600 hover:text-accent-700 font-medium">
                The Dam Battlegrounds map
              </Link> has been updated with data from the Server Slam event.
            </p>
            <p className="text-navy-600 mb-4">
              <Link to="/maps?zone=spaceport" className="text-accent-600 hover:text-accent-700 font-medium">
                The Spaceport map
              </Link>, <Link to="/maps?zone=buried-city" className="text-accent-600 hover:text-accent-700 font-medium">
                Buried City map
              </Link> and <Link to="/maps?zone=blue-gate" className="text-accent-600 hover:text-accent-700 font-medium">
                Blue Gate map
              </Link> are being updated with live data.
            </p>
            <p className="text-navy-600">
              All maps are constantly updated by the MetaForge team and the community. If you want to help, please join our{' '}
              <a href="https://discord.gg/8UEK9TrQDs" target="_blank" rel="nofollow noopener noreferrer" className="text-accent-600 hover:text-accent-700 font-medium">
                Discord
              </a>.
            </p>
          </Card>
          
          {/* Maps Grid */}
          {mapsLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner />
              <p className="mt-4 text-navy-600">Loading maps...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {availableMaps?.map((map) => (
                <Link
                  key={map.id}
                  to={`/maps?zone=${map.id}`}
                  className="group cursor-pointer no-underline hover:brightness-110 transition-all"
                >
                  <Card className="h-full hover:shadow-xl transition-shadow">
                    <h3 className="text-xl font-techno font-bold text-navy-800 mb-4">
                      {map.displayName}
                    </h3>
                    
                    {map.thumbnail && (
                      <div className="mb-4 overflow-hidden rounded-lg border-2 border-primary-200">
                        <img
                          src={map.thumbnail}
                          alt={map.displayName}
                          className="w-full transition-transform duration-300 group-hover:scale-125"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    
                    {map.description && (
                      <p className="text-navy-600 text-sm mb-4">
                        {map.description}
                      </p>
                    )}
                    
                    {map.possibleEvents && map.possibleEvents.length > 0 && (
                      <div className="mt-4">
                        <p className="text-navy-600 text-sm font-medium mb-2">Possible Events:</p>
                        <ul className="text-navy-600 text-sm list-disc list-inside space-y-1">
                          {map.possibleEvents.map((event, index) => (
                            <li key={index}>{event}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // Show interactive map for selected zone
  const selectedMap = availableMaps?.find(m => m.id === selectedZoneId)
  
  return (
    <div className="relative h-[calc(100vh-4rem)] bg-black">
      {/* Back Button */}
      <Link
        to="/maps"
        className="absolute top-4 left-4 z-50 bg-gray-900/90 hover:bg-gray-900 border border-gray-700 rounded px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 text-white"
      >
        <MapPin className="w-4 h-4" />
        Back to Maps
      </Link>
      
      {/* Map Display */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full">
          <LoadingSpinner />
          <p className="mt-4 text-gray-400">Loading map data...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-red-400 mb-2">Failed to load map data</p>
          <p className="text-gray-400 text-sm">Please try again later</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <MapPin className="w-16 h-16 text-gray-600 mb-4" />
          <p className="text-gray-400">No map data available for this zone</p>
          <p className="text-gray-500 text-sm mt-2">The API will provide marker data automatically</p>
        </div>
      ) : (
        <TileMap
          locations={locations}
          mapTitle={selectedMap?.displayName || selectedZoneId}
          mapImageUrl={mapData?.imageUrl || mapData?.mapInfo?.imageUrl || mapData?.mapInfo?.image}
          tileBaseUrl={!mapData?.imageUrl && !mapData?.mapInfo?.imageUrl && !mapData?.mapInfo?.image 
            ? `https://cdn.metaforge.app/arc-raiders/maps/${selectedZoneId}/{z}/{x}/{y}.webp`
            : undefined}
          minZoom={0}
          maxZoom={5}
          defaultZoom={2}
        />
      )}
    </div>
  )
}

export default Maps

