import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import ImageUpload from '@/components/ImageUpload'
import {
  useMap,
  useCreateMap,
  useUpdateMap,
} from '@/hooks/useSupabase'
import type { Map } from '@/lib/supabase'

const MapForm = () => {
  const { mapId } = useParams<{ mapId?: string }>()
  const navigate = useNavigate()
  
  // Check if we're on /admin/maps/new or /admin/maps/:mapId/edit
  const isEditMode = mapId !== undefined && mapId !== 'new'
  const actualMapId = isEditMode ? mapId : undefined

  const { data: existingMap, isLoading } = useMap(actualMapId)
  const createMap = useCreateMap()
  const updateMap = useUpdateMap()

  const [formData, setFormData] = useState<Partial<Map>>({
    map_id: '',
    name: '',
    description: '',
    image_url: '',
    thumbnail_url: '',
    map_width: 2048,
    map_height: 2048,
    possible_events: [],
    is_active: true,
  })

  const [eventInput, setEventInput] = useState('')

  useEffect(() => {
    if (existingMap) {
      setFormData(existingMap)
    }
  }, [existingMap])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.map_id || !formData.name || !formData.image_url) {
      alert('Map ID, name, and image URL are required')
      return
    }

    try {
      if (isEditMode && actualMapId) {
        await updateMap.mutateAsync({
          id: actualMapId,
          updates: formData,
        })
      } else {
        await createMap.mutateAsync(formData as Map)
      }
      navigate('/admin/maps')
    } catch (error: any) {
      console.error('Failed to save map:', error)
      alert(`Failed to save map: ${error?.message || 'Unknown error'}`)
    }
  }

  const addEvent = () => {
    if (eventInput.trim()) {
      setFormData({
        ...formData,
        possible_events: [...(formData.possible_events || []), eventInput.trim()],
      })
      setEventInput('')
    }
  }

  const removeEvent = (index: number) => {
    const events = [...(formData.possible_events || [])]
    events.splice(index, 1)
    setFormData({ ...formData, possible_events: events })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/admin/maps"
          className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Maps
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditMode ? 'Edit Map' : 'Add New Map'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-navy-800">Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Map ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.map_id || ''}
                      onChange={(e) => setFormData({ ...formData, map_id: e.target.value })}
                      placeholder="e.g. dam, spaceport, buried-city"
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                      required
                      disabled={isEditMode}
                    />
                    <p className="text-xs text-navy-500 mt-1">Unique identifier (cannot be changed after creation)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Dam Battlegrounds"
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                      required
                    />
                  </div>
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
              </div>

              {/* Map Image */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-navy-800">Map Image</h3>
                
                <div>
                  <ImageUpload
                    label="Map Image (Required)"
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                    bucket="maps"
                    folder="images"
                    maxSizeMB={20}
                    accept="image/*"
                  />
                  <p className="text-xs text-navy-500 mt-2">
                    Drag and drop an image or click to upload. Files will be stored in Supabase Storage.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">
                    Or enter Image URL manually
                  </label>
                  <input
                    type="url"
                    value={formData.image_url || ''}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/map-image.png"
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    required
                  />
                </div>

                <div>
                  <ImageUpload
                    label="Thumbnail Image (Optional)"
                    value={formData.thumbnail_url || ''}
                    onChange={(url) => setFormData({ ...formData, thumbnail_url: url || undefined })}
                    bucket="maps"
                    folder="thumbnails"
                    maxSizeMB={5}
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Map Dimensions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-navy-800">Map Dimensions (in pixels)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Width
                    </label>
                    <input
                      type="number"
                      min="100"
                      value={formData.map_width || 2048}
                      onChange={(e) => setFormData({ ...formData, map_width: parseInt(e.target.value) || 2048 })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">
                      Height
                    </label>
                    <input
                      type="number"
                      min="100"
                      value={formData.map_height || 2048}
                      onChange={(e) => setFormData({ ...formData, map_height: parseInt(e.target.value) || 2048 })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Possible Events */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-navy-800">Possible Events</h3>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={eventInput}
                    onChange={(e) => setEventInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addEvent()
                      }
                    }}
                    placeholder="e.g. Night Raid, Prospecting Probes"
                    className="flex-1 px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEvent}
                  >
                    Add Event
                  </Button>
                </div>

                {formData.possible_events && formData.possible_events.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.possible_events.map((event, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded text-sm"
                      >
                        {event}
                        <button
                          type="button"
                          onClick={() => removeEvent(idx)}
                          className="hover:text-red-600"
                          aria-label="Remove event"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active !== false}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-navy-700">Map is active</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-primary-200">
                <Button type="submit" variant="primary">
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Update Map' : 'Create Map'}
                </Button>
                <Link to="/admin/maps">
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

export default MapForm

