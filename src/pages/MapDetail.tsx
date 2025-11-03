import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import LoadingSpinner from '@/components/LoadingSpinner'
import ZoneMap from '@/components/ZoneMap'
import { useMapWithDetails } from '@/hooks/useSupabase'

const MapDetail = () => {
  const { mapId } = useParams<{ mapId: string }>()
  const { data: mapData, isLoading, error } = useMapWithDetails(mapId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !mapData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/maps"
            className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Maps
          </Link>

          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">
                Map not found or error loading map data. Please check your Supabase configuration.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const markers = mapData.map_markers || []
  const zones = mapData.map_zones || []

  // Count markers by type
  const markerCounts = markers.reduce((acc, marker) => {
    acc[marker.marker_type] = (acc[marker.marker_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/maps"
          className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Maps
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <h1 className="text-4xl font-techno font-bold text-navy-800">
                {mapData.name}
              </h1>
              <p className="text-navy-600 mt-1">
                Interactive map with {markers.length} markers
              </p>
            </div>
          </div>

          {mapData.description && (
            <p className="text-lg text-navy-600 mt-4 max-w-3xl">
              {mapData.description}
            </p>
          )}

          {mapData.possible_events && mapData.possible_events.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-navy-800 mb-3">
                Possible Events:
              </p>
              <div className="flex flex-wrap gap-2">
                {mapData.possible_events.map((event, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm"
                  >
                    {event}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-navy-800">
                  {markerCounts.container || 0}
                </p>
                <p className="text-sm text-navy-600 mt-1">Containers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-navy-800">
                  {markerCounts.arc || 0}
                </p>
                <p className="text-sm text-navy-600 mt-1">ARC Enemies</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-navy-800">
                  {markerCounts.location || 0}
                </p>
                <p className="text-sm text-navy-600 mt-1">Locations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-navy-800">
                  {zones.length}
                </p>
                <p className="text-sm text-navy-600 mt-1">Zones</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Map */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Map</CardTitle>
            <p className="text-sm text-navy-600 mt-1">
              Find the best loot spots, quest locations, POIs, ARC enemies and more
            </p>
          </CardHeader>
          <CardContent className="p-0" style={{ minHeight: '70vh' }}>
            <ZoneMap map={mapData} height="70vh" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MapDetail

