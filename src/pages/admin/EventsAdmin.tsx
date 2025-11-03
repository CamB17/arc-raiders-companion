import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, Save, X, Clock, MapPin, Globe, Info } from 'lucide-react'
import { useAllEvents, useCreateEvent, useUpdateEvent, useDeleteEvent, GameEvent } from '../../hooks/useEvents'
import Button from '../../components/Button'
import Card from '../../components/Card'
import LoadingSpinner from '../../components/LoadingSpinner'
import { 
  convertTimeRangeToLocal, 
  getTimezoneDisplayString,
  convertUTCToLocal 
} from '../../lib/timezone'

const EventsAdmin = () => {
  const { data: events, isLoading } = useAllEvents()
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()
  
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<GameEvent, 'id' | 'created_at' | 'updated_at'>>({
    event_name: '',
    location: '',
    start_time: '06:00:00',
    end_time: '07:00:00',
    day_of_week: null,
    is_active: true,
    description: '',
  })
  
  const locations = ['Buried City', 'Spaceport', 'Blue Gate', 'Dam']
  const eventTypes = [
    'Night Raid',
    'Prospecting Probes',
    'Uncovered Caches',
    'Husk Graveyard',
    'Lush Blooms',
    'Harvester',
    'Launch Tower Loot',
  ]
  const daysOfWeek = [
    { value: null, label: 'Daily' },
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ]
  
  const resetForm = () => {
    setFormData({
      event_name: '',
      location: '',
      start_time: '06:00:00',
      end_time: '07:00:00',
      day_of_week: null,
      is_active: true,
      description: '',
    })
    setIsCreating(false)
    setEditingId(null)
  }
  
  const handleEdit = (event: GameEvent) => {
    setFormData({
      event_name: event.event_name,
      location: event.location,
      start_time: event.start_time,
      end_time: event.end_time,
      day_of_week: event.day_of_week,
      is_active: event.is_active,
      description: event.description || '',
    })
    setEditingId(event.id)
    setIsCreating(false)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        await updateEvent.mutateAsync({ id: editingId, ...formData })
      } else {
        await createEvent.mutateAsync(formData)
      }
      resetForm()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event. Please try again.')
    }
  }
  
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return
    }
    
    try {
      await deleteEvent.mutateAsync(id)
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event. Please try again.')
    }
  }
  
  const handleTimeChange = (field: 'start_time' | 'end_time', value: string) => {
    // Ensure format is HH:MM:SS
    const time = value.includes(':') ? value : `${value}:00`
    const parts = time.split(':')
    const formatted = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2] || '00'}`
    setFormData({ ...formData, [field]: formatted })
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-techno font-bold text-navy-800 mb-2">
            Events Management
          </h1>
          <p className="text-navy-600">
            Manage game events, schedules, and countdowns
          </p>
        </div>
        
        {/* Create New Event Button */}
        {!isCreating && !editingId && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Event
            </Button>
          </motion.div>
        )}
        
        {/* Event Form */}
        {(isCreating || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-techno font-bold text-navy-800">
                      {editingId ? 'Edit Event' : 'Create New Event'}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-navy-600 mt-1">
                      <Globe className="w-4 h-4" />
                      <span>Times are entered in UTC and automatically converted to visitor's timezone</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Name */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Event Name *
                    </label>
                    <select
                      value={formData.event_name}
                      onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                      required
                    >
                      <option value="">Select event type...</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Location *
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                      required
                    >
                      <option value="">Select location...</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Start Time (UTC) *
                    </label>
                    <input
                      type="time"
                      value={formData.start_time.slice(0, 5)}
                      onChange={(e) => handleTimeChange('start_time', e.target.value)}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                      required
                    />
                    {formData.start_time && (
                      <p className="text-xs text-navy-500 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Local: {convertUTCToLocal(formData.start_time)} ({getTimezoneDisplayString()})
                      </p>
                    )}
                  </div>
                  
                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      End Time (UTC) *
                    </label>
                    <input
                      type="time"
                      value={formData.end_time.slice(0, 5)}
                      onChange={(e) => handleTimeChange('end_time', e.target.value)}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                      required
                    />
                    {formData.end_time && (
                      <p className="text-xs text-navy-500 mt-1 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Local: {convertUTCToLocal(formData.end_time)} ({getTimezoneDisplayString()})
                      </p>
                    )}
                  </div>
                  
                  {/* Day of Week */}
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Day of Week
                    </label>
                    <select
                      value={formData.day_of_week === null ? '' : formData.day_of_week}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          day_of_week: e.target.value === '' ? null : parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                    >
                      {daysOfWeek.map((day) => (
                        <option key={day.label} value={day.value === null ? '' : day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Is Active */}
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5 text-accent-500 border-primary-300 rounded focus:ring-accent-500"
                      />
                      <span className="text-sm font-medium text-navy-700">Active</span>
                    </label>
                  </div>
                  
                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
                      rows={3}
                      placeholder="Optional description..."
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    type="submit"
                    disabled={createEvent.isPending || updateEvent.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? 'Update Event' : 'Create Event'}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
        
        {/* Events List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-techno font-bold text-navy-800">
            All Events ({events?.length || 0})
          </h2>
          
          {events && events.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-navy-600">
                No events created yet. Click "Create New Event" to get started.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events?.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <Card
                    className={`p-4 ${
                      !event.is_active ? 'opacity-60 bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-navy-800 text-lg">
                          {event.event_name}
                        </h3>
                        {!event.is_active && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded mt-1">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(event)}
                          className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-navy-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-navy-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent-500" />
                        <span>{event.location}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-accent-500" />
                          <span>
                            {convertTimeRangeToLocal(event.start_time, event.end_time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-navy-500 ml-6">
                          <Globe className="w-3 h-3" />
                          <span>
                            {event.start_time.slice(0, 5)} - {event.end_time.slice(0, 5)} UTC
                          </span>
                        </div>
                      </div>
                      {event.day_of_week !== null && (
                        <div className="text-xs text-navy-500">
                          {
                            ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
                              event.day_of_week
                            ]
                          }
                        </div>
                      )}
                      {event.description && (
                        <p className="text-xs text-navy-500 mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventsAdmin

