import { Link } from 'react-router-dom'
import { MapPin, ArrowRight } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useMaps } from '@/hooks/useSupabase'

const Maps = () => {
  const { data: maps, isLoading, error } = useMaps()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">
                Error loading maps. Please check your Supabase configuration.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const activeMaps = (maps || []).filter(map => map.is_active !== false)

  if (activeMaps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-techno font-bold text-navy-800 mb-3">
            ARC Raiders Maps
          </h1>
          <p className="text-lg text-navy-600 mb-12">
            Interactive maps for all game zones
          </p>

          <Card>
            <CardContent className="pt-6">
              <p className="text-navy-600 text-center py-8">
                No maps available yet. Check back later or add maps through the admin panel.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-techno font-bold text-navy-800 mb-3">
            ARC Raiders Maps
          </h1>
          <p className="text-lg text-navy-600">
            Interactive maps for all game zones. Find the best loot spots, quest locations, POIs, ARC enemies and more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeMaps.map((map) => (
            <Link key={map.id} to={`/maps/${map.map_id}`}>
              <Card hover className="h-full transition-all hover:border-accent-400">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-accent-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{map.name}</CardTitle>
                        <p className="text-sm text-navy-600 mt-1">
                          {map.map_id}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-navy-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  {map.description && (
                    <p className="text-navy-600 mb-4 line-clamp-2">
                      {map.description}
                    </p>
                  )}
                  
                  {map.possible_events && map.possible_events.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-navy-800 mb-2">
                        Possible Events:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {map.possible_events.slice(0, 4).map((event, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
                          >
                            {event}
                          </span>
                        ))}
                        {map.possible_events.length > 4 && (
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                            +{map.possible_events.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-primary-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-navy-600">Interactive Map</span>
                      <span className="text-accent-600 font-semibold">
                        View Map →
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Maps



