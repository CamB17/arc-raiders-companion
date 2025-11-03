import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, MapPin, Calendar, ChevronDown, ChevronUp, Globe } from 'lucide-react'
import { useEvents, groupEventsByTimeSlot, EventWithCountdown } from '../hooks/useEvents'
import { 
  convertTimeRangeToLocal, 
  getTimezoneDisplayString,
  convertUTCToLocal 
} from '../lib/timezone'

const EventTimer = () => {
  const { data: events, isLoading } = useEvents()
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  if (isLoading || !events || events.length === 0) {
    return null
  }
  
  // Find the next upcoming or active event
  const nextEvent = events.find((e) => e.status === 'active') || events.find((e) => e.status === 'upcoming')
  
  if (!nextEvent) {
    return null
  }
  
  const formatCountdown = (countdown: EventWithCountdown['countdown']) => {
    const { hours, minutes, seconds } = countdown
    return `${hours}h ${minutes}m ${seconds}s`
  }
  
  const groupedEvents = groupEventsByTimeSlot(events)
  
  return (
    <div className="relative">
      {/* Main Timer Display */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          nextEvent.status === 'active'
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-accent-500 hover:bg-accent-600 text-white'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Clock className="w-4 h-4" />
        <div className="flex flex-col items-start text-left">
          <span className="text-xs font-medium opacity-90">
            {nextEvent.status === 'active' ? 'Active Now' : 'Next Event'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">
              {nextEvent.event_name}
            </span>
            <span className="text-xs opacity-75">·</span>
            <span className="text-xs font-medium">
              {nextEvent.location}
            </span>
          </div>
        </div>
        <div className="ml-2 flex flex-col items-end">
          <span className="text-xs font-medium opacity-90">
            {nextEvent.status === 'active' ? 'Ends in' : 'Starts in'}
          </span>
          <span className="text-sm font-mono font-bold tabular-nums">
            {formatCountdown(nextEvent.countdown)}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 ml-1" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-1" />
        )}
      </motion.button>
      
      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute top-full right-0 mt-2 w-96 max-h-[80vh] overflow-auto bg-white rounded-lg shadow-2xl border border-primary-200 z-50"
          >
            <div className="p-4">
              <div className="mb-4 pb-3 border-b border-primary-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-techno font-bold text-navy-800">
                    Event Schedule
                  </h3>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-1 hover:bg-primary-100 rounded transition-colors"
                    aria-label="Close"
                  >
                    <ChevronUp className="w-5 h-5 text-navy-600" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-navy-600">
                  <Globe className="w-3 h-3" />
                  <span>Times shown in {getTimezoneDisplayString()}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {Array.from(groupedEvents.entries()).map(([timeSlot, locationMap]) => {
                  // Convert the time slot from UTC to local
                  const firstEvent = Array.from(locationMap.values())[0][0]
                  const localTimeSlot = convertTimeRangeToLocal(firstEvent.start_time, firstEvent.end_time)
                  
                  return (
                    <div key={timeSlot} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-navy-800 bg-primary-50 px-2 py-1 rounded">
                        <Calendar className="w-4 h-4 text-accent-500" />
                        {localTimeSlot}
                      </div>
                      
                      {Array.from(locationMap.entries()).map(([location, locationEvents]) => (
                      <div
                        key={`${timeSlot}-${location}`}
                        className={`ml-4 p-3 rounded-lg border ${
                          locationEvents.some((e) => e.status === 'active')
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white border-primary-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-accent-500 flex-shrink-0" />
                            <span className="font-bold text-navy-800">{location}</span>
                          </div>
                          <span className="text-xs text-navy-600 bg-primary-100 px-2 py-1 rounded">
                            {locationEvents.length} event{locationEvents.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {locationEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`p-2 rounded ${
                                event.status === 'active'
                                  ? 'bg-green-100'
                                  : 'bg-primary-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-navy-800">
                                      {event.event_name}
                                    </span>
                                    {event.status === 'active' && (
                                      <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-bold">
                                        LIVE
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-navy-600 mt-1">
                                    {convertUTCToLocal(event.start_time)} - {convertUTCToLocal(event.end_time)}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-navy-600">
                                    {event.status === 'active' ? 'Ends in:' : 'Starts in:'}
                                  </div>
                                  <div className="text-sm font-mono font-bold text-navy-800 tabular-nums">
                                    {formatCountdown(event.countdown)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EventTimer

