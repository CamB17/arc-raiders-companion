import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type {
  CustomItem,
  CustomQuest,
  CustomTrader,
  CustomLocation,
  CustomGuide,
  CustomBuild,
  Map,
  MapZone,
  MapMarker,
} from '@/lib/supabase'

// Generic CRUD hooks for any table

// GET all records from a table
export const useSupabaseTable = <T = any>(tableName: string, enabled = true) => {
  return useQuery<T[]>({
    queryKey: ['supabase', tableName],
    queryFn: async () => {
      if (!isSupabaseConfigured()) {
        console.warn(`Supabase not configured. Skipping fetch for ${tableName}`)
        return []
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error(`Error fetching ${tableName}:`, error)
        throw error
      }

      return data || []
    },
    enabled: enabled && isSupabaseConfigured(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// GET single record by ID
export const useSupabaseRecord = <T = any>(tableName: string, id?: string) => {
  return useQuery<T | null>({
    queryKey: ['supabase', tableName, id],
    queryFn: async () => {
      if (!isSupabaseConfigured() || !id) {
        return null
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found
          return null
        }
        console.error(`Error fetching ${tableName} ${id}:`, error)
        throw error
      }

      return data
    },
    enabled: !!id && isSupabaseConfigured(),
  })
}

// CREATE record
export const useSupabaseCreate = <T = any>(tableName: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newRecord: Partial<T>) => {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from(tableName)
        .insert(newRecord)
        .select()
        .single()

      if (error) {
        console.error(`Error creating ${tableName}:`, error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['supabase', tableName] })
    },
  })
}

// UPDATE record
export const useSupabaseUpdate = <T = any>(tableName: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<T> }) => {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from(tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error(`Error updating ${tableName}:`, error)
        throw error
      }

      return data
    },
    onSuccess: (data, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['supabase', tableName] })
      queryClient.invalidateQueries({ queryKey: ['supabase', tableName, variables.id] })
    },
  })
}

// DELETE record
export const useSupabaseDelete = (tableName: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase not configured')
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) {
        console.error(`Error deleting ${tableName}:`, error)
        throw error
      }

      return id
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['supabase', tableName] })
      queryClient.invalidateQueries({ queryKey: ['supabase', tableName, id] })
    },
  })
}

// Specific hooks for each custom data type

// Custom Items
export const useCustomItems = () => useSupabaseTable<CustomItem>('custom_items')
export const useCustomItem = (id?: string) => useSupabaseRecord<CustomItem>('custom_items', id)
export const useCreateCustomItem = () => useSupabaseCreate<CustomItem>('custom_items')
export const useUpdateCustomItem = () => useSupabaseUpdate<CustomItem>('custom_items')
export const useDeleteCustomItem = () => useSupabaseDelete('custom_items')

// Helper to get custom item by item_id (API item reference)
export const useCustomItemByItemId = (itemId?: string) => {
  return useQuery<CustomItem | null>({
    queryKey: ['supabase', 'custom_items', 'by_item_id', itemId],
    queryFn: async () => {
      if (!isSupabaseConfigured() || !itemId) {
        return null
      }

      const { data, error } = await supabase
        .from('custom_items')
        .select('*')
        .eq('item_id', itemId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // Record not found
          return null
        }
        console.error(`Error fetching custom item for ${itemId}:`, error)
        return null
      }

      return data
    },
    enabled: !!itemId && isSupabaseConfigured(),
  })
}

// Custom Quests
export const useCustomQuests = () => useSupabaseTable<CustomQuest>('custom_quests')
export const useCustomQuest = (id?: string) => useSupabaseRecord<CustomQuest>('custom_quests', id)
export const useCreateCustomQuest = () => useSupabaseCreate<CustomQuest>('custom_quests')
export const useUpdateCustomQuest = () => useSupabaseUpdate<CustomQuest>('custom_quests')
export const useDeleteCustomQuest = () => useSupabaseDelete('custom_quests')

// Helper to get custom quest by quest_id
export const useCustomQuestByQuestId = (questId?: string) => {
  return useQuery<CustomQuest | null>({
    queryKey: ['supabase', 'custom_quests', 'by_quest_id', questId],
    queryFn: async () => {
      if (!isSupabaseConfigured() || !questId) {
        return null
      }

      const { data, error } = await supabase
        .from('custom_quests')
        .select('*')
        .eq('quest_id', questId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error(`Error fetching custom quest for ${questId}:`, error)
        return null
      }

      return data
    },
    enabled: !!questId && isSupabaseConfigured(),
  })
}

// Custom Traders
export const useCustomTraders = () => useSupabaseTable<CustomTrader>('custom_traders')
export const useCustomTrader = (id?: string) => useSupabaseRecord<CustomTrader>('custom_traders', id)
export const useCreateCustomTrader = () => useSupabaseCreate<CustomTrader>('custom_traders')
export const useUpdateCustomTrader = () => useSupabaseUpdate<CustomTrader>('custom_traders')
export const useDeleteCustomTrader = () => useSupabaseDelete('custom_traders')

// Custom Locations
export const useCustomLocations = () => useSupabaseTable<CustomLocation>('custom_locations')
export const useCustomLocation = (id?: string) => useSupabaseRecord<CustomLocation>('custom_locations', id)
export const useCreateCustomLocation = () => useSupabaseCreate<CustomLocation>('custom_locations')
export const useUpdateCustomLocation = () => useSupabaseUpdate<CustomLocation>('custom_locations')
export const useDeleteCustomLocation = () => useSupabaseDelete('custom_locations')

// Custom Guides
export const useCustomGuides = () => useSupabaseTable<CustomGuide>('custom_guides')
export const useCustomGuide = (id?: string) => useSupabaseRecord<CustomGuide>('custom_guides', id)
export const useCreateCustomGuide = () => useSupabaseCreate<CustomGuide>('custom_guides')
export const useUpdateCustomGuide = () => useSupabaseUpdate<CustomGuide>('custom_guides')
export const useDeleteCustomGuide = () => useSupabaseDelete('custom_guides')

// Custom Builds
export const useCustomBuilds = () => useSupabaseTable<CustomBuild>('custom_builds')
export const useCustomBuild = (id?: string) => useSupabaseRecord<CustomBuild>('custom_builds', id)
export const useCreateCustomBuild = () => useSupabaseCreate<CustomBuild>('custom_builds')
export const useUpdateCustomBuild = () => useSupabaseUpdate<CustomBuild>('custom_builds')
export const useDeleteCustomBuild = () => useSupabaseDelete('custom_builds')

// Maps
export const useMaps = () => useSupabaseTable<Map>('maps')
export const useMap = (id?: string) => useSupabaseRecord<Map>('maps', id)
export const useCreateMap = () => useSupabaseCreate<Map>('maps')
export const useUpdateMap = () => useSupabaseUpdate<Map>('maps')
export const useDeleteMap = () => useSupabaseDelete('maps')

// Helper to get map by map_id
export const useMapByMapId = (mapId?: string) => {
  return useQuery<Map | null>({
    queryKey: ['supabase', 'maps', 'by_map_id', mapId],
    queryFn: async () => {
      if (!isSupabaseConfigured() || !mapId) {
        return null
      }

      const { data, error } = await supabase
        .from('maps')
        .select('*')
        .eq('map_id', mapId)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error(`Error fetching map for ${mapId}:`, error)
        return null
      }

      return data
    },
    enabled: !!mapId && isSupabaseConfigured(),
  })
}

// Get map with all zones and markers
export const useMapWithDetails = (mapId?: string) => {
  return useQuery<Map & { map_zones: MapZone[]; map_markers: MapMarker[] } | null>({
    queryKey: ['supabase', 'maps', 'with_details', mapId],
    queryFn: async () => {
      if (!isSupabaseConfigured() || !mapId) {
        return null
      }

      const { data, error } = await supabase
        .from('maps')
        .select(`
          *,
          map_zones (*),
          map_markers (*)
        `)
        .eq('map_id', mapId)
        .eq('is_active', true)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error(`Error fetching map details for ${mapId}:`, error)
        return null
      }

      return data as Map & { map_zones: MapZone[]; map_markers: MapMarker[] }
    },
    enabled: !!mapId && isSupabaseConfigured(),
  })
}

// Map Zones
export const useMapZones = (mapId?: string) => {
  return useQuery<MapZone[]>({
    queryKey: ['supabase', 'map_zones', mapId],
    queryFn: async () => {
      if (!isSupabaseConfigured() || !mapId) {
        return []
      }

      const { data, error } = await supabase
        .from('map_zones')
        .select('*')
        .eq('map_id', mapId)
        .eq('is_visible', true)
        .order('name')

      if (error) {
        console.error(`Error fetching map zones for ${mapId}:`, error)
        return []
      }

      return data || []
    },
    enabled: !!mapId && isSupabaseConfigured(),
  })
}

export const useMapZone = (id?: string) => useSupabaseRecord<MapZone>('map_zones', id)
export const useCreateMapZone = () => useSupabaseCreate<MapZone>('map_zones')
export const useUpdateMapZone = () => useSupabaseUpdate<MapZone>('map_zones')
export const useDeleteMapZone = () => useSupabaseDelete('map_zones')

// Map Markers
export const useMapMarkers = (mapId?: string, markerType?: string, category?: string) => {
  return useQuery<MapMarker[]>({
    queryKey: ['supabase', 'map_markers', mapId, markerType, category],
    queryFn: async () => {
      if (!isSupabaseConfigured() || !mapId) {
        return []
      }

      let query = supabase
        .from('map_markers')
        .select('*')
        .eq('map_id', mapId)
        .eq('is_visible', true)

      if (markerType) {
        query = query.eq('marker_type', markerType)
      }

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query.order('category', { ascending: true })

      if (error) {
        console.error(`Error fetching map markers for ${mapId}:`, error)
        return []
      }

      return data || []
    },
    enabled: !!mapId && isSupabaseConfigured(),
  })
}

export const useMapMarker = (id?: string) => useSupabaseRecord<MapMarker>('map_markers', id)
export const useCreateMapMarker = () => useSupabaseCreate<MapMarker>('map_markers')
export const useUpdateMapMarker = () => useSupabaseUpdate<MapMarker>('map_markers')
export const useDeleteMapMarker = () => useSupabaseDelete('map_markers')

