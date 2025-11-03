import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface GameEvent {
  id: string
  event_name: string
  location: string
  start_time: string // HH:MM:SS format
  end_time: string // HH:MM:SS format
  day_of_week: number | null // 0 = Sunday, 1 = Monday, etc., null = daily
  is_active: boolean
  description?: string
  created_at?: string
  updated_at?: string
}

export interface EventWithCountdown extends GameEvent {
  status: 'upcoming' | 'active' | 'ended'
  countdown: {
    hours: number
    minutes: number
    seconds: number
    totalSeconds: number
  }
  nextOccurrence: Date
}

/**
 * Calculate the next occurrence of an event based on current time
 */
export function calculateNextOccurrence(event: GameEvent): Date {
  const now = new Date()
  const [hours, minutes, seconds] = event.start_time.split(':').map(Number)
  
  // Create a date for today with the event's start time
  const nextOccurrence = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    hours,
    minutes,
    seconds || 0
  ))
  
  // If the event has already passed today, move to tomorrow (or next matching day)
  if (nextOccurrence <= now) {
    nextOccurrence.setUTCDate(nextOccurrence.getUTCDate() + 1)
  }
  
  // If event is tied to specific day of week, find the next matching day
  if (event.day_of_week !== null) {
    while (nextOccurrence.getUTCDay() !== event.day_of_week) {
      nextOccurrence.setUTCDate(nextOccurrence.getUTCDate() + 1)
    }
  }
  
  return nextOccurrence
}

/**
 * Calculate the end time of the current/next event occurrence
 */
export function calculateEventEnd(event: GameEvent, startOccurrence: Date): Date {
  const [hours, minutes, seconds] = event.end_time.split(':').map(Number)
  
  const endOccurrence = new Date(startOccurrence)
  endOccurrence.setUTCHours(hours, minutes, seconds || 0)
  
  // If end time is before start time, it means the event ends the next day
  if (endOccurrence <= startOccurrence) {
    endOccurrence.setUTCDate(endOccurrence.getUTCDate() + 1)
  }
  
  return endOccurrence
}

/**
 * Calculate countdown and status for an event
 */
export function calculateEventStatus(event: GameEvent): EventWithCountdown {
  const now = new Date()
  const nextStart = calculateNextOccurrence(event)
  const nextEnd = calculateEventEnd(event, nextStart)
  
  let status: 'upcoming' | 'active' | 'ended'
  let targetTime: Date
  
  // Check if event is currently active
  const todayStart = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    ...event.start_time.split(':').map(Number)
  ))
  const todayEnd = calculateEventEnd(event, todayStart)
  
  if (now >= todayStart && now < todayEnd) {
    status = 'active'
    targetTime = todayEnd
  } else if (now >= todayEnd) {
    status = 'ended'
    targetTime = nextStart
  } else {
    status = 'upcoming'
    targetTime = nextStart
  }
  
  // Calculate time difference
  const diffMs = targetTime.getTime() - now.getTime()
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  return {
    ...event,
    status,
    countdown: {
      hours,
      minutes,
      seconds,
      totalSeconds,
    },
    nextOccurrence: nextStart,
  }
}

/**
 * Hook to fetch all active events
 */
export const useEvents = () => {
  return useQuery<EventWithCountdown[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('start_time', { ascending: true })
      
      if (error) {
        console.error('Error fetching events:', error)
        throw error
      }
      
      // Calculate status and countdown for each event
      return (data || []).map(calculateEventStatus)
    },
    refetchInterval: 1000, // Update every second for countdown
    staleTime: 0, // Always refetch when component mounts
  })
}

/**
 * Hook to fetch all events (including inactive) for admin
 */
export const useAllEvents = () => {
  return useQuery<GameEvent[]>({
    queryKey: ['events', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true })
      
      if (error) {
        console.error('Error fetching all events:', error)
        throw error
      }
      
      return data || []
    },
  })
}

/**
 * Hook to create a new event
 */
export const useCreateEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (event: Omit<GameEvent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('events')
        .insert([event])
        .select()
        .single()
      
      if (error) {
        console.error('Error creating event:', error)
        throw error
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

/**
 * Hook to update an event
 */
export const useUpdateEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<GameEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('events')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating event:', error)
        throw error
      }
      
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

/**
 * Hook to delete an event
 */
export const useDeleteEvent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting event:', error)
        throw error
      }
      
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

/**
 * Get events grouped by time slot and location
 */
export function groupEventsByTimeSlot(events: EventWithCountdown[]): Map<string, Map<string, EventWithCountdown[]>> {
  const grouped = new Map<string, Map<string, EventWithCountdown[]>>()
  
  events.forEach((event) => {
    const timeSlot = `${event.start_time.slice(0, 5)} - ${event.end_time.slice(0, 5)} UTC`
    
    if (!grouped.has(timeSlot)) {
      grouped.set(timeSlot, new Map())
    }
    
    const locationMap = grouped.get(timeSlot)!
    if (!locationMap.has(event.location)) {
      locationMap.set(event.location, [])
    }
    
    locationMap.get(event.location)!.push(event)
  })
  
  return grouped
}

