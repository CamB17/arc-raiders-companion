import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Plus, Edit, Trash2, Search, ArrowLeft, Eye } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  useMaps,
  useDeleteMap,
} from '@/hooks/useSupabase'

const MapsAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: maps, isLoading, error } = useMaps()
  const deleteMap = useDeleteMap()

  const filteredMaps = maps?.filter((map) =>
    map.map_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    map.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this map? This will also delete all markers and zones associated with it.')) {
      try {
        await deleteMap.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete map:', error)
        alert('Failed to delete map')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Maps</h2>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-techno font-bold text-navy-800 mb-2 flex items-center gap-3">
                <MapPin className="w-10 h-10" />
                MAPS ADMIN
              </h1>
              <p className="text-lg text-navy-600">
                Manage game zone maps, markers, and zones
              </p>
            </div>
            
            <div className="flex gap-2">
              <Link to="/admin/maps/new">
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Map
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search by map ID or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Maps List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaps && filteredMaps.length > 0 ? (
            filteredMaps.map((map) => (
              <Card key={map.id} hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent-600" />
                    {map.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-navy-600">Map ID:</span>
                      <p className="text-sm font-mono bg-primary-100 px-2 py-1 rounded mt-1">
                        {map.map_id}
                      </p>
                    </div>

                    {map.description && (
                      <div>
                        <span className="text-sm text-navy-600">Description:</span>
                        <p className="text-sm text-navy-700 mt-1 line-clamp-2">
                          {map.description}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-navy-600">Status:</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        map.is_active !== false
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {map.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {map.possible_events && map.possible_events.length > 0 && (
                      <div>
                        <span className="text-sm text-navy-600">Events:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {map.possible_events.slice(0, 3).map((event, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded"
                            >
                              {event}
                            </span>
                          ))}
                          {map.possible_events.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                              +{map.possible_events.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-3 border-t border-primary-200">
                      <Link
                        to={`/maps/${map.map_id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Map
                        </Button>
                      </Link>
                      <Link
                        to={`/admin/maps/${map.id}/edit`}
                      >
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Link
                        to={`/admin/maps/${map.id}/markers`}
                        className="flex-1"
                      >
                        <Button variant="secondary" size="sm" className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          Markers
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleDelete(map.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label="Delete map"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-navy-400 mx-auto mb-4" />
                  <p className="text-navy-600 mb-4">
                    {searchTerm ? 'No maps found matching your search.' : 'No maps found.'}
                  </p>
                  <Link to="/admin/maps/new">
                    <Button variant="primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Map
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default MapsAdmin

