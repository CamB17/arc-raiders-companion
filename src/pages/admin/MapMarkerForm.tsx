import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, MapPin } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import MapMarkerPlacer from '@/components/MapMarkerPlacer'
import {
  useMapMarker,
  useCreateMapMarker,
  useUpdateMapMarker,
  useMap,
} from '@/hooks/useSupabase'
import type { MapMarker } from '@/lib/supabase'

const MapMarkerForm = () => {
  const { mapId, markerId } = useParams<{ mapId: string; markerId: string }>()
  const navigate = useNavigate()
  const isEditMode = markerId !== 'new'

  const { data: map } = useMap(mapId) // mapId is UUID here
  const { data: existingMarker, isLoading } = useMapMarker(isEditMode ? markerId : undefined)
  const createMarker = useCreateMapMarker()
  const updateMarker = useUpdateMapMarker()

  const [formData, setFormData] = useState<Partial<MapMarker>>({
    map_id: mapId || '', // map_id should be UUID (same as mapId param)
    marker_type: 'container',
    category: '',
    name: '',
    description: '',
    x: 50,
    y: 50,
    icon_type: '',
    icon_color: 'orange',
    icon_shape: 'circle',
    icon_symbol: '',
    tooltip: '',
    is_visible: true,
    metadata: {},
  })

  useEffect(() => {
    if (existingMarker) {
      setFormData(existingMarker)
    }
  }, [existingMarker])

  useEffect(() => {
    if (mapId && !isEditMode) {
      setFormData(prev => ({ ...prev, map_id: mapId }))
    }
  }, [mapId, isEditMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.map_id || !formData.name || !formData.category) {
      alert('Map ID, name, and category are required')
      return
    }

    try {
      if (isEditMode && markerId) {
        await updateMarker.mutateAsync({
          id: markerId,
          updates: formData,
        })
      } else {
        await createMarker.mutateAsync(formData as MapMarker)
      }
      navigate(`/admin/maps/${mapId}/markers`)
    } catch (error: any) {
      console.error('Failed to save marker:', error)
      alert(`Failed to save marker: ${error?.message || 'Unknown error'}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const markerTypes = ['container', 'arc', 'location', 'resource', 'other']
  const iconColors = ['orange', 'green', 'white', 'red', 'blue', 'yellow', 'purple']
  const iconShapes = ['circle', 'square', 'triangle']
  const iconSymbols = ['', 'arrow', 'question', 'skull', 'leaf', 'box', 'building']

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to={`/admin/maps/${mapId}/markers`}
          className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Markers
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditMode ? 'Edit Marker' : 'Add New Marker'}
              {map && ` - ${map.name}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-navy-800">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Marker Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.marker_type || 'container'}
                      onChange={(e) => setFormData({ ...formData, marker_type: e.target.value as any })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                      required
                    >
                      {markerTypes.map(type => (
                        <option key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. weapon_case, tick, extraction_point"
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Position */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-navy-800">Position</h3>
                  <div className="text-sm text-navy-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Click on map to place marker
                  </div>
                </div>
                
                {map && (
                  <MapMarkerPlacer
                    map={map}
                    x={formData.x || 50}
                    y={formData.y || 50}
                    onPositionChange={(x, y) => setFormData({ ...formData, x, y })}
                    markerColor={formData.icon_color || 'orange'}
                  />
                )}
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-200">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      X Coordinate (Percentage) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.x || 50}
                      onChange={(e) => setFormData({ ...formData, x: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Y Coordinate (Percentage) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.y || 50}
                      onChange={(e) => setFormData({ ...formData, y: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Icon Styling */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-navy-800">Icon Styling</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Icon Color <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.icon_color || 'orange'}
                      onChange={(e) => setFormData({ ...formData, icon_color: e.target.value })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                      required
                    >
                      {iconColors.map(color => (
                        <option key={color} value={color}>
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Icon Shape
                    </label>
                    <select
                      value={formData.icon_shape || 'circle'}
                      onChange={(e) => setFormData({ ...formData, icon_shape: e.target.value })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    >
                      {iconShapes.map(shape => (
                        <option key={shape} value={shape}>
                          {shape.charAt(0).toUpperCase() + shape.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Icon Symbol
                    </label>
                    <select
                      value={formData.icon_symbol || ''}
                      onChange={(e) => setFormData({ ...formData, icon_symbol: e.target.value || undefined })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    >
                      {iconSymbols.map(symbol => (
                        <option key={symbol} value={symbol}>
                          {symbol || '(None)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Icon Type
                  </label>
                  <input
                    type="text"
                    value={formData.icon_type || ''}
                    onChange={(e) => setFormData({ ...formData, icon_type: e.target.value })}
                    placeholder="e.g. weapon_case, tick, extraction_point"
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Tooltip (shown on hover)
                  </label>
                  <input
                    type="text"
                    value={formData.tooltip || ''}
                    onChange={(e) => setFormData({ ...formData, tooltip: e.target.value || undefined })}
                    placeholder="e.g. Weapon Case, Raider Cache"
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_visible !== false}
                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-navy-700">Visible on map</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-primary-200">
                <Button type="submit" variant="primary">
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Update Marker' : 'Create Marker'}
                </Button>
                <Link to={`/admin/maps/${mapId}/markers`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MapMarkerForm

