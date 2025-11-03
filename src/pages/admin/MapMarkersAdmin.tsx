import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Plus, Edit, Trash2, Search, ArrowLeft, Filter } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  useMap,
  useMapMarkers,
  useDeleteMapMarker,
} from '@/hooks/useSupabase'

const MapMarkersAdmin = () => {
  const { mapId } = useParams<{ mapId: string }>()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  
  const { data: map, isLoading: mapLoading } = useMap(mapId)
  const { data: markers, isLoading: markersLoading } = useMapMarkers(mapId)
  const deleteMarker = useDeleteMapMarker()

  const isLoading = mapLoading || markersLoading

  const filteredMarkers = markers?.filter((marker) => {
    const matchesSearch = 
      marker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      marker.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || marker.marker_type === filterType
    return matchesSearch && matchesType
  })

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this marker?')) {
      try {
        await deleteMarker.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete marker:', error)
        alert('Failed to delete marker')
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

  if (!map) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">Map not found.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const markerTypes = Array.from(new Set(markers?.map(m => m.marker_type) || []))

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/maps"
            className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Maps
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-techno font-bold text-navy-800 mb-2 flex items-center gap-3">
                <MapPin className="w-10 h-10" />
                {map.name} - Markers
              </h1>
              <p className="text-lg text-navy-600">
                Manage markers for {map.name}
              </p>
            </div>
            
            <Link to={`/admin/maps/${map.id}/markers/new`}>
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Marker
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 appearance-none bg-white"
                >
                  <option value="">All Types</option>
                  {markerTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Markers List */}
        <div className="space-y-4">
          {filteredMarkers && filteredMarkers.length > 0 ? (
            filteredMarkers.map((marker) => (
              <Card key={marker.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow"
                          style={{ backgroundColor: marker.icon_color || 'orange' }}
                        />
                        <h3 className="text-lg font-semibold text-navy-800">
                          {marker.name}
                        </h3>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                          {marker.marker_type}
                        </span>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                          {marker.category}
                        </span>
                      </div>
                      
                      {marker.description && (
                        <p className="text-sm text-navy-600 mb-2">
                          {marker.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-navy-600">
                        <span>
                          Position: ({marker.x.toFixed(1)}%, {marker.y.toFixed(1)}%)
                        </span>
                        <span>
                          Icon: {marker.icon_color} {marker.icon_shape}
                        </span>
                        {marker.tooltip && (
                          <span>
                            Tooltip: {marker.tooltip}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link to={`/admin/maps/${map.id}/markers/${marker.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <button
                        onClick={() => handleDelete(marker.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label="Delete marker"
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
                    {searchTerm || filterType ? 'No markers found matching your filters.' : 'No markers found.'}
                  </p>
                  <Link to={`/admin/maps/${map.id}/markers/new`}>
                    <Button variant="primary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Marker
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

export default MapMarkersAdmin

