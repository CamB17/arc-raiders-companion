import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

// Use proxy in development to avoid CORS issues
// In production, this will use the full URL
const BASE_URL = import.meta.env.DEV 
  ? '/api/arc-raiders'  // Proxy in development
  : 'https://metaforge.app/api/arc-raiders'  // Direct in production

export interface ArcRaidersItem {
  id: string
  name: string
  rarity?: string
  description?: string
  category?: string
  subcategory?: string
  item_type?: string
  loadout_slots?: string[]
  
  // Images - API uses 'icon' field
  icon?: string
  image?: string
  imageUrl?: string
  thumbnail?: string
  
  // Stats - API uses stat_block
  stat_block?: {
    weight?: number
    stackSize?: number
    damage?: number
    fireRate?: number
    range?: number
    magazineSize?: number
    healingPerSecond?: number
    staminaPerSecond?: number
    useTime?: number
    duration?: number
    [key: string]: any
  }
  // Legacy support
  stats?: any
  stackSize?: number
  weight?: number
  
  // Economy - API uses 'value'
  value?: number
  recycleValue?: number
  raider_coins?: number
  
  // Recycle breakdown - what items/components are obtained when recycling
  recycle_breakdown?: Array<{
    item_id?: string
    item?: string
    name: string
    quantity: number
    value?: number
    [key: string]: any
  }>
  recycleBreakdown?: Array<{
    item_id?: string
    item?: string
    name: string
    quantity: number
    value?: number
    [key: string]: any
  }>
  recycle_components?: Array<{
    item_id?: string
    item?: string
    name?: string
    item_name?: string
    quantity?: number
    count?: number
    value?: number
    [key: string]: any
  }>
  
  // Crafting components
  components?: Array<{
    id: string
    name: string
    quantity: number
    image?: string
    item_type?: string
  }>
  crafting?: {
    requires?: Array<{ 
      item: string
      name?: string
      count: number
      quantity?: number
      image?: string
      imageUrl?: string
      item_type?: string
    }>
    used_in?: string[]
  }
  
  // Traders
  traders?: Array<{
    name: string
    price: number
    avatar?: string
    image?: string
  }>
  
  // Workbench
  workbench?: string
  
  // Loot sources - arcs/enemies that drop this item
  dropped_by?: Array<{
    arc_id?: string
    arc?: string
    name?: string
    drop_rate?: number
    chance?: number
    [key: string]: any
  }>
  loot_source?: Array<{
    arc_id?: string
    arc?: string
    name?: string
    drop_rate?: number
    chance?: number
    [key: string]: any
  }>
  
  [key: string]: any
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface ItemsQueryParams {
  page?: number
  limit?: number
  id?: string
  item_type?: string
  rarity?: string
  search?: string
  loadout_slot?: string
  workbench?: string
  subcategory?: string
  includeComponents?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  minimal?: boolean
}

export interface ArcRaidersMission {
  id: string
  name: string
  description?: string
  
  // Mission metadata
  type?: string
  difficulty?: string
  region?: string
  location?: string
  category?: string
  
  // Map coordinates (if provided by API)
  map_x?: number
  map_y?: number
  map_x_percent?: number
  map_y_percent?: number
  x?: number
  y?: number
  
  // Images
  icon?: string
  image?: string
  imageUrl?: string
  thumbnail?: string
  
  // Objectives - can be strings or detailed objects
  objectives?: Array<string | {
    id?: string
    name?: string
    description?: string
    type?: string
    target?: string | number
    current?: number
    completed?: boolean
    [key: string]: any
  }>
  
  // Rewards - can be strings or detailed objects
  rewards?: Array<string | {
    id?: string
    name?: string
    type?: string
    item_id?: string
    item?: string
    quantity?: number
    value?: number
    rarity?: string
    icon?: string
    image?: string
    [key: string]: any
  }>
  
  // Mission stats
  duration?: number
  recommended_level?: number
  required_level?: number
  max_players?: number
  min_players?: number
  
  // Progress/tracking
  completed?: boolean
  progress?: number
  unlocks?: string[] // Mission IDs that unlock after completion
  
  // Mission requirements
  prerequisites?: string[] // Mission IDs that must be completed first
  requires_items?: Array<{
    item_id?: string
    item?: string
    name?: string
    quantity?: number
    [key: string]: any
  }>
  
  // Additional metadata
  tags?: string[]
  notes?: string
  guide?: string
  
  [key: string]: any
}

export interface ArcRaidersQuest {
  id: string
  name: string
  description?: string
  
  // Quest metadata
  type?: string
  difficulty?: string
  region?: string
  location?: string
  category?: string
  
  // Map coordinates (if provided by API)
  map_x?: number
  map_y?: number
  map_x_percent?: number
  map_y_percent?: number
  x?: number
  y?: number
  
  // Images
  icon?: string
  image?: string
  imageUrl?: string
  thumbnail?: string
  
  // Objectives - can be strings or detailed objects
  objectives?: Array<string | {
    id?: string
    name?: string
    description?: string
    type?: string
    target?: string | number
    current?: number
    completed?: boolean
    [key: string]: any
  }>
  
  // Rewards - can be strings or detailed objects
  rewards?: Array<string | {
    id?: string
    name?: string
    type?: string
    item_id?: string
    item?: string
    quantity?: number
    value?: number
    rarity?: string
    icon?: string
    image?: string
    [key: string]: any
  }>
  
  // Quest stats
  duration?: number
  recommended_level?: number
  required_level?: number
  max_players?: number
  min_players?: number
  
  // Progress/tracking
  completed?: boolean
  progress?: number
  unlocks?: string[] // Quest IDs that unlock after completion
  
  // Quest requirements
  prerequisites?: string[] // Quest IDs that must be completed first
  requires_items?: Array<{
    item_id?: string
    item?: string
    name?: string
    quantity?: number
    [key: string]: any
  }>
  
  // Quest chain information
  quest_chain?: string
  chain_position?: number
  previous_quest?: string
  next_quest?: string
  
  // Additional metadata
  tags?: string[]
  notes?: string
  guide?: string
  
  [key: string]: any
}

export interface ArcRaidersRecipe {
  id: string
  name: string
  output: string
  requires: Array<{ item: string; count: number }>
  [key: string]: any
}

export interface ArcRaidersArc {
  id: string
  name: string
  description?: string
  type?: string
  difficulty?: string
  location?: string
  
  // Images
  icon?: string
  image?: string
  imageUrl?: string
  thumbnail?: string
  
  // Loot drops - items this arc can drop
  drops?: Array<{
    item_id: string
    item?: string
    name?: string
    drop_rate?: number
    chance?: number
    quantity?: number
    rarity?: string
    [key: string]: any
  }>
  loot?: Array<{
    item_id: string
    item?: string
    name?: string
    drop_rate?: number
    chance?: number
    quantity?: number
    rarity?: string
    [key: string]: any
  }>
  
  // Stats
  health?: number
  armor?: number
  shield?: number
  weak_points?: string[]
  
  [key: string]: any
}

/**
 * Hook to fetch data from the Arc Raiders API
 * @param endpoint - The API endpoint to fetch from (e.g., 'items', 'missions', 'recipes')
 * @param params - Query parameters
 * @param options - Optional react-query options
 */
export const useArcRaidersData = <T = any>(
  endpoint: string,
  params?: Record<string, any>,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) => {
  return useQuery<T>({
    queryKey: ['arc-raiders', endpoint, params],
    queryFn: async () => {
      try {
        const response = await axios.get(`${BASE_URL}/${endpoint}`, {
          params,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        })
        
        // If we get data, return it
        if (response.data) {
          console.log(`✓ Successfully fetched from: ${BASE_URL}/${endpoint}`)
          return response.data
        }
        
        throw new Error('No data received')
      } catch (error) {
        console.error(`✗ Failed to fetch from: ${BASE_URL}/${endpoint}`, error)
        
        // Return mock data for development
        console.warn('⚠ API failed, returning mock data for development')
        return getMockData(endpoint)
      }
    },
    ...options,
  })
}

/**
 * Mock data for development/testing when API is unavailable
 */
function getMockData(endpoint: string): any {
  const mockItems = [
    {
      id: 'herbal-bandage',
      name: 'Herbal Bandage',
      description: 'An improvised medical item that gradually restores health over time.',
      rarity: 'Uncommon',
      item_type: 'Quick Use',
      icon: 'https://via.placeholder.com/200x200/22c55e/ffffff?text=Bandage',
      value: 450,
      stat_block: {
        weight: 0.15,
        stackSize: 5,
        healingPerSecond: 3.5,
        useTime: 1.5,
        duration: 10,
      },
      components: [
        { id: 'durable-cloth', name: 'Durable Cloth', quantity: 1, item_type: 'Refined Material', icon: 'https://via.placeholder.com/100x100/94a3b8/ffffff?text=Cloth' },
        { id: 'great-mullein', name: 'Great Mullein', quantity: 1, item_type: 'Nature', icon: 'https://via.placeholder.com/100x100/84cc16/ffffff?text=Herb' },
      ],
      loot_source: [
        { arc_id: 'arc-titan', name: 'Arc Titan', drop_rate: 0.5 },
      ],
    },
    {
      id: 'adrenaline-shot',
      name: 'Adrenaline Shot',
      description: 'A serum that fully restores stamina and temporarily increases stamina regeneration.',
      rarity: 'Common',
      item_type: 'Quick Use',
      icon: 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=Adrenaline',
      value: 300,
      stat_block: {
        weight: 0.2,
        stackSize: 5,
        staminaPerSecond: 5,
        useTime: 1,
        duration: 10,
      },
      dropped_by: [
        { arc_id: 'arc-scout', name: 'Arc Scout', drop_rate: 0.15 },
      ],
    },
    {
      id: 'ak-47',
      name: 'AK-47',
      description: 'A reliable automatic rifle with excellent stopping power.',
      rarity: 'Rare',
      item_type: 'Weapon',
      icon: 'https://via.placeholder.com/200x200/ef4444/ffffff?text=AK-47',
      value: 2400,
      stat_block: {
        weight: 3.5,
        stackSize: 1,
        damage: 32,
        fireRate: 600,
        range: 300,
        magazineSize: 30,
      },
      dropped_by: [
        { arc_id: 'arc-titan', name: 'Arc Titan', drop_rate: 0.25 },
      ],
    },
    {
      id: 'scrap-metal',
      name: 'Scrap Metal',
      description: 'Salvaged metal that can be refined.',
      rarity: 'Common',
      item_type: 'Material',
      icon: 'https://via.placeholder.com/200x200/64748b/ffffff?text=Metal',
      value: 50,
      stat_block: {
        weight: 0.5,
        stackSize: 100,
      },
      dropped_by: [
        { arc_id: 'arc-scout', name: 'Arc Scout', drop_rate: 0.8 },
        { arc_id: 'arc-walker', name: 'Arc Walker', drop_rate: 0.9 },
        { arc_id: 'arc-titan', name: 'Arc Titan', drop_rate: 1.0 },
      ],
    },
    {
      id: 'red-dot-sight',
      name: 'Red Dot Sight',
      description: 'Improves weapon accuracy.',
      rarity: 'Uncommon',
      item_type: 'Add-on',
      icon: 'https://via.placeholder.com/200x200/f97316/ffffff?text=Sight',
      value: 380,
      stat_block: {
        weight: 0.3,
        stackSize: 1,
      },
      dropped_by: [
        { arc_id: 'arc-walker', name: 'Arc Walker', drop_rate: 0.1 },
      ],
    },
    {
      id: 'advanced-arc-powercell',
      name: 'Advanced ARC Powercell',
      description: 'Very valuable resource that drops from certain ARC enemies.',
      rarity: 'Rare',
      item_type: 'Misc',
      icon: 'https://via.placeholder.com/200x200/8b5cf6/ffffff?text=Powercell',
      raider_coins: 640,
      value: 1280,
      stat_block: {
        weight: 0.5,
        stackSize: 5,
      },
      recycle_components: [
        { name: 'ARC Powercell', quantity: 2, value: 640 },
      ],
      dropped_by: [
        { arc_id: 'arc-bombardier', name: 'Bombardier', drop_rate: 0.3 },
      ],
    },
  ]
  
  if (endpoint === 'items') {
    return {
      data: mockItems,
      pagination: {
        page: 1,
        limit: 50,
        total: mockItems.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    }
  }
  
  // Individual item lookup - return matching item
  const mockItemsMap: Record<string, any> = {}
  mockItems.forEach(item => {
    mockItemsMap[item.id] = item
  })
  
  return mockItemsMap
}

/**
 * Hook to fetch all items with pagination
 */
export const useItems = (params?: ItemsQueryParams) => {
  const defaultParams: ItemsQueryParams = {
    page: 1,
    limit: 100,
    includeComponents: true,
    ...params,
  }
  
  return useQuery<PaginatedResponse<ArcRaidersItem>>({
    queryKey: ['arc-raiders', 'items', defaultParams],
    queryFn: async () => {
      try {
        const response = await axios.get(`${BASE_URL}/items`, {
          params: defaultParams,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        })
        
        if (response.data) {
          console.log(`✓ Successfully fetched ${response.data.data?.length || 0} items`)
          return response.data
        }
        
        throw new Error('No data received')
      } catch (error) {
        console.error('✗ Failed to fetch items', error)
        console.warn('⚠ Using mock data')
        return getMockData('items') as PaginatedResponse<ArcRaidersItem>
      }
    },
  })
}

/**
 * Hook to fetch a specific item by ID
 */
export const useItem = (id: string) => {
  return useQuery<ArcRaidersItem>({
    queryKey: ['arc-raiders', 'items', id],
    queryFn: async () => {
      try {
        const response = await axios.get(`${BASE_URL}/items`, {
          params: { id, includeComponents: true },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        })
        
        if (response.data?.data?.[0]) {
          console.log(`✓ Successfully fetched item: ${id}`)
          return response.data.data[0]
        }
        
        throw new Error('Item not found')
      } catch (error) {
        console.error(`✗ Failed to fetch item: ${id}`, error)
        console.warn('⚠ Using mock data')
        const mockDataMap = getMockData('items-map')
        return mockDataMap[id] || mockDataMap['herbal-bandage'] as ArcRaidersItem
      }
    },
    enabled: !!id,
  })
}

/**
 * Hook to fetch all missions with pagination and filtering
 */
export const useMissions = (params?: {
  page?: number
  limit?: number
  id?: string
  type?: string
  difficulty?: string
  region?: string
  search?: string
  includeDetails?: boolean
}) => {
  const defaultParams = {
    page: 1,
    limit: 100,
    includeDetails: true,
    ...params,
  }
  
  return useQuery<PaginatedResponse<ArcRaidersMission>>({
    queryKey: ['arc-raiders', 'missions', defaultParams],
    queryFn: async () => {
      try {
        const response = await axios.get(`${BASE_URL}/missions`, {
          params: defaultParams,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        })
        
        // Handle different response structures
        if (response.data) {
          // If response is already paginated
          if (response.data.data && response.data.pagination) {
            console.log(`✓ Successfully fetched ${response.data.data.length} missions`)
            return response.data
          }
          // If response is an array
          if (Array.isArray(response.data)) {
            console.log(`✓ Successfully fetched ${response.data.length} missions`)
            return {
              data: response.data,
              pagination: {
                page: defaultParams.page || 1,
                limit: defaultParams.limit || 100,
                total: response.data.length,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
              },
            }
          }
          // If response is a single object (when id is specified)
          if (response.data.id) {
            return {
              data: [response.data],
              pagination: {
                page: 1,
                limit: 1,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
              },
            }
          }
        }
        
        throw new Error('No data received')
      } catch (error) {
        console.error('✗ Failed to fetch missions', error)
        console.warn('⚠ Using mock data')
        return getMockMissionsData(defaultParams)
      }
    },
  })
}

/**
 * Hook to fetch a specific mission by ID
 */
export const useMission = (id: string) => {
  return useQuery<ArcRaidersMission>({
    queryKey: ['arc-raiders', 'missions', id],
    queryFn: async () => {
      try {
        const response = await axios.get(`${BASE_URL}/missions`, {
          params: { 
            id,
            includeDetails: true,
          },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        })
        
        // Handle different response structures
        let missionData = null
        
        // Check if response.data is directly the mission object
        if (response.data && !response.data.data && response.data.id) {
          missionData = response.data
        }
        // Check if response.data.data is an array
        else if (response.data?.data?.[0]) {
          missionData = response.data.data[0]
        }
        // Check if response.data.data is the object itself
        else if (response.data?.data && response.data.data.id) {
          missionData = response.data.data
        }
        // Check if response.data is an array
        else if (Array.isArray(response.data) && response.data.length > 0) {
          missionData = response.data.find((m: any) => m.id === id) || response.data[0]
        }
        
        if (missionData) {
          console.log(`✓ Successfully fetched mission: ${id}`)
          return missionData
        }
        
        throw new Error('Mission not found')
      } catch (error) {
        console.error(`✗ Failed to fetch mission: ${id}`, error)
        console.warn('⚠ Using mock data')
        const mockData = getMockMissionsData()
        const mockMission = mockData.data.find(m => m.id === id) || mockData.data[0]
        return mockMission as ArcRaidersMission
      }
    },
    enabled: !!id,
  })
}

/**
 * Hook to fetch all crafting recipes
 * Handles both dedicated recipes endpoint and crafting data from items
 */
export const useRecipes = (params?: {
  page?: number
  limit?: number
  search?: string
  workbench?: string
}) => {
  return useQuery<PaginatedResponse<ArcRaidersRecipe> | ArcRaidersRecipe[]>({
    queryKey: ['arc-raiders', 'recipes', params],
    queryFn: async () => {
      try {
        // First try dedicated recipes endpoint
        const response = await axios.get(`${BASE_URL}/recipes`, {
          params,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        })
        
        if (response.data) {
          // Handle paginated response
          if (response.data.data && response.data.pagination) {
            console.log(`✓ Successfully fetched ${response.data.data.length} recipes from recipes endpoint`)
            // Ensure all recipes have components array populated from requires
            const normalizedRecipes = response.data.data.map((recipe: any) => {
              // If recipe has requires but no components, normalize components array
              if (recipe.requires && (!recipe.components || recipe.components.length === 0)) {
                recipe.components = recipe.requires.map((req: any) => ({
                  id: req.id || req.item_id || req.item,
                  item_id: req.item_id || req.id,
                  item: req.item || req.id || req.name,
                  name: req.name || req.item_name || req.item || req.id || 'Unknown Material',
                  quantity: req.count || req.quantity || 1,
                  count: req.count || req.quantity || 1,
                  image: req.image || req.imageUrl || req.icon || req.thumbnail,
                  imageUrl: req.imageUrl || req.image || req.icon,
                  icon: req.icon || req.image || req.imageUrl,
                  item_type: req.item_type || req.type,
                }))
              }
              return recipe
            })
            return {
              ...response.data,
              data: normalizedRecipes,
            }
          }
          // Handle array response
          if (Array.isArray(response.data)) {
            console.log(`✓ Successfully fetched ${response.data.length} recipes from recipes endpoint`)
            // Ensure all recipes have components array populated from requires
            const normalizedRecipes = response.data.map((recipe: any) => {
              // If recipe has requires but no components, normalize components array
              if (recipe.requires && (!recipe.components || recipe.components.length === 0)) {
                recipe.components = recipe.requires.map((req: any) => ({
                  id: req.id || req.item_id || req.item,
                  item_id: req.item_id || req.id,
                  item: req.item || req.id || req.name,
                  name: req.name || req.item_name || req.item || req.id || 'Unknown Material',
                  quantity: req.count || req.quantity || 1,
                  count: req.count || req.quantity || 1,
                  image: req.image || req.imageUrl || req.icon || req.thumbnail,
                  imageUrl: req.imageUrl || req.image || req.icon,
                  icon: req.icon || req.image || req.imageUrl,
                  item_type: req.item_type || req.type,
                }))
              }
              return recipe
            })
            return normalizedRecipes
          }
          // Handle single object wrapped
          if (response.data.id) {
            const recipe = response.data
            // If recipe has requires but no components, normalize components array
            if (recipe.requires && (!recipe.components || recipe.components.length === 0)) {
              recipe.components = recipe.requires.map((req: any) => ({
                id: req.id || req.item_id || req.item,
                item_id: req.item_id || req.id,
                item: req.item || req.id || req.name,
                name: req.name || req.item_name || req.item || req.id || 'Unknown Material',
                quantity: req.count || req.quantity || 1,
                count: req.count || req.quantity || 1,
                image: req.image || req.imageUrl || req.icon || req.thumbnail,
                imageUrl: req.imageUrl || req.image || req.icon,
                icon: req.icon || req.image || req.imageUrl,
                item_type: req.item_type || req.type,
              }))
            }
            return [recipe]
          }
        }
        
        throw new Error('No data received')
      } catch (recipesError) {
        // If recipes endpoint fails, try getting craftable items from items endpoint
        try {
          console.log('⚠ Recipes endpoint not available, fetching craftable items...')
          const itemsResponse = await axios.get(`${BASE_URL}/items`, {
            params: {
              page: params?.page || 1,
              limit: params?.limit || 100,
              search: params?.search,
              workbench: params?.workbench,
              includeComponents: true,
            },
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          })
          
          if (itemsResponse.data) {
            let items: any[] = []
            let pagination: any = null
            
            // Handle paginated response
            if (itemsResponse.data.data && itemsResponse.data.pagination) {
              items = itemsResponse.data.data
              pagination = itemsResponse.data.pagination
            }
            // Handle array response
            else if (Array.isArray(itemsResponse.data)) {
              items = itemsResponse.data
            }
            
            // Convert items with components to recipes
            const recipes = items
              .filter((item: ArcRaidersItem) => {
                // Item is craftable if it has components or crafting.requires
                return (item.components && item.components.length > 0) || 
                       (item.crafting?.requires && item.crafting.requires.length > 0)
              })
              .map((item: ArcRaidersItem): ArcRaidersRecipe => {
                // Debug logging for ONLY the first item to see structure
                const isFirstItem = items.indexOf(item) === 0
                if (process.env.NODE_ENV === 'development' && isFirstItem) {
                  console.log('🔍 FIRST CRAFTABLE ITEM:', item.name)
                  console.log('🔍 Item components array length:', item.components?.length || 0)
                  if (item.components && item.components.length > 0) {
                    console.log('🔍 First component RAW from API:', item.components[0])
                  }
                }
                
                // Create a lookup map of all items by ID for resolving component names
                const itemsById = new Map<string, ArcRaidersItem>()
                items.forEach(i => {
                  if (i.id) itemsById.set(i.id, i)
                })
                
                // Helper function to resolve component name from item_id
                const resolveComponentName = (comp: any): string => {
                  // First try direct name fields
                  if (comp.name && comp.name !== 'Unknown Material') return comp.name
                  if (comp.item_name && comp.item_name !== 'Unknown Material') return comp.item_name
                  
                  // Try to get item_id from ANY field and look it up
                  // Check all possible ID fields (including 'component' which the API uses!)
                  let itemId = comp.component || comp.item_id || comp.id || comp.item || comp.itemId || comp.component_id || comp.componentId
                  
                  // If item is an object, extract from it
                  if (!itemId && comp.item && typeof comp.item === 'object') {
                    itemId = comp.item.id || comp.item.item_id || comp.item.name
                  }
                  
                  // If item is a string, use it
                  if (!itemId && typeof comp.item === 'string' && comp.item !== 'Unknown Material') {
                    itemId = comp.item
                  }
                  
                  // Debug log to see what we're trying to resolve
                  if (process.env.NODE_ENV === 'development' && !itemId) {
                    console.warn('🔍 Could not find item_id in component.')
                    console.warn('🔍 All field names:', Object.keys(comp))
                    console.warn('🔍 All field values:', Object.entries(comp))
                  }
                  
                  if (itemId && typeof itemId === 'string') {
                    // Look up the item in our items list
                    const referencedItem = itemsById.get(itemId)
                    if (referencedItem?.name) {
                      return referencedItem.name
                    }
                    // If not found in map but ID looks valid, use the ID as display name (better than "Unknown Material")
                    if (itemId !== 'Unknown Material') {
                      return itemId
                    }
                  }
                  
                  // Try nested item object
                  if (comp.item && typeof comp.item === 'object') {
                    const name = comp.item.name || comp.item.item_name || comp.item.display_name || comp.item.id || comp.item.item_id
                    if (name && name !== 'Unknown Material') return name
                  }
                  
                  // Last resort - find any string value that might be an item reference
                  const allValues = Object.values(comp).filter(v => 
                    typeof v === 'string' && 
                    v && 
                    v !== 'Unknown Material' &&
                    v.length > 0
                  )
                  if (allValues.length > 0) {
                    return allValues[0]
                  }
                  
                  return 'Unknown Material'
                }
                
                // Helper function to resolve component ID
                const resolveComponentId = (comp: any): string | null => {
                  return comp.component ||
                         comp.id || 
                         comp.item_id || 
                         (typeof comp.item === 'string' ? comp.item : null) ||
                         (comp.item?.id || comp.item?.item_id) ||
                         null
                }
                
                // Get requirements from components or crafting.requires
                // Components array is preferred as it has more complete data
                let requires: any[] = []
                
                if (item.components && item.components.length > 0) {
                  requires = item.components.map(comp => {
                    const componentName = resolveComponentName(comp)
                    const componentId = resolveComponentId(comp)
                    
                    // Debug log ONLY for first component of first item
                    if (process.env.NODE_ENV === 'development' && isFirstItem && item.components?.indexOf(comp) === 0) {
                      console.log('🔍 Resolved first component:', {
                        originalComponent: comp,
                        resolvedName: componentName,
                        resolvedId: componentId,
                      })
                    }
                    
                    // Get image - check nested item object too
                    let componentImage = comp.image || comp.imageUrl || comp.image_url || comp.icon || comp.thumbnail
                    if (!componentImage && componentId) {
                      const referencedItem = itemsById.get(componentId)
                      if (referencedItem) {
                        componentImage = referencedItem.icon || referencedItem.image || referencedItem.imageUrl || referencedItem.thumbnail
                      }
                    }
                    if (!componentImage && comp.item && typeof comp.item === 'object') {
                      componentImage = comp.item.image || comp.item.imageUrl || comp.item.icon || comp.item.thumbnail
                    }
                    
                    return {
                      // ID fields - try multiple options
                      id: componentId || undefined,
                      item_id: componentId || comp.item_id || undefined,
                      // Item reference - can be ID string or object
                      item: componentId || componentName,
                      // Name fields - use resolved name
                      name: componentName,
                      item_name: componentName,
                      // Quantity fields
                      count: comp.quantity || comp.count || 1,
                      quantity: comp.quantity || comp.count || 1,
                      // Image fields
                      image: componentImage,
                      imageUrl: comp.imageUrl || comp.image || comp.icon,
                      icon: comp.icon || comp.image || comp.imageUrl,
                      // Type
                      item_type: comp.item_type || comp.type || (componentId ? itemsById.get(componentId)?.item_type : null),
                      // Preserve original item reference if it's an object
                      itemObject: typeof comp.item === 'object' ? comp.item : null,
                    }
                  })
                } else if (item.crafting?.requires && item.crafting.requires.length > 0) {
                  requires = item.crafting.requires.map((req: any) => {
                    const requirementName = resolveComponentName(req)
                    const requirementId = resolveComponentId(req)
                    
                    // Get image - check nested item object and lookup
                    let requirementImage = req.image || req.imageUrl || req.image_url || req.icon || req.thumbnail
                    if (!requirementImage && requirementId) {
                      const referencedItem = itemsById.get(requirementId)
                      if (referencedItem) {
                        requirementImage = referencedItem.icon || referencedItem.image || referencedItem.imageUrl || referencedItem.thumbnail
                      }
                    }
                    if (!requirementImage && req.item && typeof req.item === 'object') {
                      requirementImage = req.item.image || req.item.imageUrl || req.item.icon || req.item.thumbnail
                    }
                    
                    return {
                      // ID fields
                      id: requirementId || undefined,
                      item_id: requirementId || req.item_id || undefined,
                      // Item reference
                      item: requirementId || requirementName,
                      // Name fields - use resolved name
                      name: requirementName,
                      item_name: requirementName,
                      // Quantity fields
                      count: req.count || req.quantity || 1,
                      quantity: req.quantity || req.count || 1,
                      // Image fields
                      image: requirementImage,
                      imageUrl: req.imageUrl || req.image || req.icon,
                      icon: req.icon || req.image || req.imageUrl,
                      // Type
                      item_type: req.item_type || req.type || (requirementId ? itemsById.get(requirementId)?.item_type : null),
                      // Preserve original item reference if it's an object
                      itemObject: typeof req.item === 'object' ? req.item : null,
                    }
                  })
                }
                
                return {
                  id: item.id,
                  name: item.name,
                  description: item.description,
                  output: item.id,
                  // Keep requires in minimal format for backwards compatibility
                  requires: requires.map((r: any) => ({
                    item: r.item || r.id || r.name,
                    count: r.count || r.quantity,
                  })),
                  // Additional recipe data
                  workbench: item.workbench,
                  icon: item.icon || item.image || item.imageUrl || item.thumbnail,
                  rarity: item.rarity,
                  item_type: item.item_type,
                  // Full component details for display (this is what the UI should use)
                  components: requires,
                } as any
              })
            
            if (recipes.length > 0) {
              console.log(`✓ Successfully converted ${recipes.length} craftable items to recipes`)
              
              // If we had pagination, return paginated format
              if (pagination) {
                return {
                  data: recipes,
                  pagination,
                }
              }
              
              return recipes
            }
          }
        } catch (itemsError) {
          console.error('✗ Failed to fetch recipes from both recipes and items endpoints', itemsError)
        }
        
        // If both fail, use mock data
        console.warn('⚠ Using mock data for recipes')
        return getMockRecipesData(params)
      }
    },
  })
}

/**
 * Hook to fetch all quests with pagination and filtering
 */
export const useQuests = (params?: {
  page?: number
  limit?: number
  id?: string
  type?: string
  difficulty?: string
  region?: string
  search?: string
  includeDetails?: boolean
  quest_chain?: string
}) => {
  const defaultParams = {
    page: 1,
    limit: 100,
    includeDetails: true,
    ...params,
  }
  
  return useQuery<PaginatedResponse<ArcRaidersQuest>>({
    queryKey: ['arc-raiders', 'quests', defaultParams],
    queryFn: async () => {
      try {
        const response = await axios.get(`${BASE_URL}/quests`, {
          params: defaultParams,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        })
        
        // Handle different response structures
        if (response.data) {
          // If response is already paginated
          if (response.data.data && response.data.pagination) {
            console.log(`✓ Successfully fetched ${response.data.data.length} quests`)
            return response.data
          }
          // If response is an array
          if (Array.isArray(response.data)) {
            console.log(`✓ Successfully fetched ${response.data.length} quests`)
            return {
              data: response.data,
              pagination: {
                page: defaultParams.page || 1,
                limit: defaultParams.limit || 100,
                total: response.data.length,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
              },
            }
          }
          // If response is a single object (when id is specified)
          if (response.data.id) {
            return {
              data: [response.data],
              pagination: {
                page: 1,
                limit: 1,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
              },
            }
          }
        }
        
        throw new Error('No data received')
      } catch (error) {
        console.error('✗ Failed to fetch quests', error)
        console.warn('⚠ Using mock data')
        return getMockQuestsData(defaultParams)
      }
    },
  })
}

/**
 * Hook to fetch a specific quest by ID
 */
export const useQuest = (id: string) => {
  return useQuery<ArcRaidersQuest>({
    queryKey: ['arc-raiders', 'quests', id],
    queryFn: async () => {
      try {
        const response = await axios.get(`${BASE_URL}/quests`, {
          params: { 
            id,
            includeDetails: true,
          },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        })
        
        // Handle different response structures
        let questData = null
        
        // Check if response.data is directly the quest object
        if (response.data && !response.data.data && response.data.id) {
          questData = response.data
        }
        // Check if response.data.data is an array
        else if (response.data?.data?.[0]) {
          questData = response.data.data[0]
        }
        // Check if response.data.data is the object itself
        else if (response.data?.data && response.data.data.id) {
          questData = response.data.data
        }
        // Check if response.data is an array
        else if (Array.isArray(response.data) && response.data.length > 0) {
          questData = response.data.find((q: any) => q.id === id) || response.data[0]
        }
        
        if (questData) {
          console.log(`✓ Successfully fetched quest: ${id}`)
          return questData
        }
        
        throw new Error('Quest not found')
      } catch (error) {
        console.error(`✗ Failed to fetch quest: ${id}`, error)
        console.warn('⚠ Using mock data')
        const mockData = getMockQuestsData()
        const mockQuest = mockData.data.find(q => q.id === id) || mockData.data[0]
        return mockQuest as ArcRaidersQuest
      }
    },
    enabled: !!id,
  })
}

/**
 * Hook to fetch all arcs/enemies
 */
export const useArcs = (params?: {
  page?: number
  limit?: number
  id?: string
  type?: string
  difficulty?: string
  search?: string
}) => {
  const defaultParams = {
    page: 1,
    limit: 100,
    ...params,
  }
  
  return useQuery<PaginatedResponse<ArcRaidersArc>>({
    queryKey: ['arc-raiders', 'arcs', defaultParams],
    queryFn: async () => {
      // Try multiple possible endpoint names
      const endpoints = ['arcs', 'enemies', 'arc']
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${BASE_URL}/${endpoint}`, {
            params: defaultParams,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          })
          
          if (response.data) {
            const arcsData = response.data.data || []
            console.log(`✓ Successfully fetched ${arcsData.length} arcs from ${endpoint}`)
            
            // Log image availability for debugging
            if (arcsData.length > 0) {
              const firstArc = arcsData[0]
              const imageFields = ['image', 'imageUrl', 'icon', 'thumbnail'].filter(field => firstArc[field])
              if (imageFields.length > 0) {
                console.log(`  Image fields available: ${imageFields.join(', ')}`)
              }
            }
            
            return response.data
          }
        } catch (error) {
          // Try next endpoint
          continue
        }
      }
      
      // If all endpoints fail, use mock data
      console.error('✗ Failed to fetch arcs from all endpoints')
      console.warn('⚠ Using mock data')
      return getMockArcsData(defaultParams)
    },
  })
}

/**
 * Hook to fetch all arcs (alternative endpoint names)
 */
export const useEnemies = (params?: Record<string, any>) => {
  return useArcs(params)
}

/**
 * Hook to fetch a specific arc/enemy by ID
 */
export const useArc = (id: string) => {
  return useQuery<ArcRaidersArc>({
    queryKey: ['arc-raiders', 'arcs', id],
    queryFn: async () => {
      // Try multiple possible endpoint names
      const endpoints = ['arcs', 'enemies', 'arc']
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${BASE_URL}/${endpoint}`, {
            params: { 
              id,
              includeDrops: true,
              includeLoot: true,
            },
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          })
          
          // Handle different response structures
          let arcData = null
          
          // Check if response.data is directly the arc object
          if (response.data && !response.data.data && response.data.id) {
            arcData = response.data
          }
          // Check if response.data.data is an array
          else if (response.data?.data?.[0]) {
            arcData = response.data.data[0]
          }
          // Check if response.data.data is the object itself
          else if (response.data?.data && response.data.data.id) {
            arcData = response.data.data
          }
          // Check if response.data is an array
          else if (Array.isArray(response.data) && response.data.length > 0) {
            arcData = response.data.find((a: any) => a.id === id) || response.data[0]
          }
          
          if (arcData) {
            console.log(`✓ Successfully fetched arc: ${id}`)
            return arcData
          }
        } catch (error) {
          // Try next endpoint
          continue
        }
      }
      
      // If all endpoints fail, try to find in mock data
      console.error(`✗ Failed to fetch arc: ${id}`)
      console.warn('⚠ Using mock data')
      const mockData = getMockArcsData()
      const mockArc = mockData.data.find(arc => arc.id === id) || mockData.data[0]
      return mockArc as ArcRaidersArc
    },
    enabled: !!id,
  })
}

/**
 * Alias for useArc - fetch a specific enemy by ID
 */
export const useEnemy = (id: string) => {
  return useArc(id)
}

/**
 * Utility function to find which arcs drop a specific item
 * Checks both item.dropped_by and arcs.drops arrays
 */
export function findArcsThatDropItem(
  itemId: string,
  item?: ArcRaidersItem,
  arcs?: ArcRaidersArc[]
): Array<{
  arc: ArcRaidersArc
  dropInfo: {
    drop_rate?: number
    chance?: number
    quantity?: number
    rarity?: string
  }
}> {
  const results: Array<{
    arc: ArcRaidersArc
    dropInfo: {
      drop_rate?: number
      chance?: number
      quantity?: number
      rarity?: string
    }
  }> = []
  
  // First, check if item has dropped_by field
  if (item?.dropped_by || item?.loot_source) {
    const sources = item.dropped_by || item.loot_source || []
    if (arcs) {
      sources.forEach((source) => {
        const arcId = source.arc_id || source.arc
        const arc = arcs.find((a) => a.id === arcId || a.name === source.name)
        if (arc) {
          results.push({
            arc,
            dropInfo: {
              drop_rate: source.drop_rate || source.chance,
              chance: source.chance || source.drop_rate,
              quantity: source.quantity,
              rarity: source.rarity,
            },
          })
        }
      })
    }
  }
  
  // Then, check all arcs for items they drop
  if (arcs) {
    arcs.forEach((arc) => {
      const drops = arc.drops || arc.loot || []
      const drop = drops.find(
        (d) => d.item_id === itemId || d.item === itemId || d.name === item?.name
      )
      if (drop) {
        // Avoid duplicates
        if (!results.find((r) => r.arc.id === arc.id)) {
          results.push({
            arc,
            dropInfo: {
              drop_rate: drop.drop_rate || drop.chance,
              chance: drop.chance || drop.drop_rate,
              quantity: drop.quantity,
              rarity: drop.rarity,
            },
          })
        }
      }
    })
  }
  
  return results
}

/**
 * Mock arcs data for development
 */
function getMockArcsData(params?: any): PaginatedResponse<ArcRaidersArc> {
  const mockArcs: ArcRaidersArc[] = [
    {
      id: 'arc-scout',
      name: 'Arc Scout',
      description: 'A fast-moving reconnaissance unit that patrols the surface.',
      type: 'Enemy',
      difficulty: 'Common',
      icon: 'https://via.placeholder.com/200x200/ef4444/ffffff?text=Scout',
      drops: [
        { item_id: 'scrap-metal', name: 'Scrap Metal', drop_rate: 0.8, quantity: 1 },
        { item_id: 'adrenaline-shot', name: 'Adrenaline Shot', drop_rate: 0.15 },
      ],
      health: 50,
    },
    {
      id: 'arc-walker',
      name: 'Arc Walker',
      description: 'A heavily armored combat unit with devastating melee attacks.',
      type: 'Enemy',
      difficulty: 'Uncommon',
      icon: 'https://via.placeholder.com/200x200/8b5cf6/ffffff?text=Walker',
      drops: [
        { item_id: 'scrap-metal', name: 'Scrap Metal', drop_rate: 0.9, quantity: 2 },
        { item_id: 'durable-cloth', name: 'Durable Cloth', drop_rate: 0.4 },
        { item_id: 'red-dot-sight', name: 'Red Dot Sight', drop_rate: 0.1 },
      ],
      health: 200,
      armor: 50,
    },
    {
      id: 'arc-titan',
      name: 'Arc Titan',
      description: 'A massive boss unit that requires coordinated team effort to defeat.',
      type: 'Boss',
      difficulty: 'Rare',
      icon: 'https://via.placeholder.com/200x200/f97316/ffffff?text=Titan',
      drops: [
        { item_id: 'scrap-metal', name: 'Scrap Metal', drop_rate: 1.0, quantity: 10 },
        { item_id: 'ak-47', name: 'AK-47', drop_rate: 0.25 },
        { item_id: 'herbal-bandage', name: 'Herbal Bandage', drop_rate: 0.5, quantity: 3 },
      ],
      health: 2000,
      armor: 200,
      shield: 100,
      weak_points: ['head', 'core'],
    },
    {
      id: 'arc-bombardier',
      name: 'Bombardier',
      description: 'A heavily armed ARC unit that launches explosive projectiles.',
      type: 'Enemy',
      difficulty: 'Uncommon',
      icon: 'https://via.placeholder.com/200x200/ef4444/ffffff?text=Bombardier',
      drops: [
        { item_id: 'advanced-arc-powercell', name: 'Advanced ARC Powercell', drop_rate: 0.3 },
        { item_id: 'scrap-metal', name: 'Scrap Metal', drop_rate: 0.7, quantity: 3 },
      ],
      health: 150,
      armor: 75,
    },
  ]
  
  return {
    data: mockArcs,
    pagination: {
      page: params?.page || 1,
      limit: params?.limit || 100,
      total: mockArcs.length,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  }
}

/**
 * Mock missions data for development
 */
function getMockMissionsData(params?: any): PaginatedResponse<ArcRaidersMission> {
  const mockMissions: ArcRaidersMission[] = [
    {
      id: 'mission-retrieve-data',
      name: 'Retrieve Data',
      description: 'Recover critical data packages from ARC facilities. Navigate through enemy territory and extract valuable intel.',
      type: 'Retrieval',
      difficulty: 'Common',
      region: 'Surface',
      location: 'ARC Research Facility Alpha',
      icon: 'https://via.placeholder.com/200x200/3b82f6/ffffff?text=Data',
      objectives: [
        'Collect 3 data packages',
        'Eliminate ARC security units',
        'Reach extraction point',
      ],
      rewards: [
        { name: 'Scrap Metal', quantity: 50, value: 2500 },
        { name: 'Data Chip', quantity: 1, rarity: 'Uncommon' },
      ],
      duration: 1800, // 30 minutes
      recommended_level: 5,
      required_level: 3,
      max_players: 4,
      min_players: 1,
    },
    {
      id: 'mission-eliminate-threat',
      name: 'Eliminate ARC Threat',
      description: 'Take down a high-value ARC target disrupting supply lines. Coordinate with your team to neutralize the threat.',
      type: 'Elimination',
      difficulty: 'Uncommon',
      region: 'Industrial Sector',
      location: 'Supply Depot Gamma',
      icon: 'https://via.placeholder.com/200x200/ef4444/ffffff?text=Target',
      objectives: [
        'Destroy 5 ARC Walkers',
        'Defeat ARC Commander',
        'Clear the area of hostiles',
      ],
      rewards: [
        { name: 'Advanced ARC Powercell', quantity: 2, rarity: 'Rare', value: 2560 },
        { name: 'Weapon Upgrade Kit', quantity: 1, rarity: 'Uncommon' },
        { name: 'Raider Coins', quantity: 1500, value: 1500 },
      ],
      duration: 2400, // 40 minutes
      recommended_level: 10,
      required_level: 7,
      max_players: 4,
      min_players: 2,
      prerequisites: ['mission-retrieve-data'],
    },
    {
      id: 'mission-escort-convoy',
      name: 'Escort Convoy',
      description: 'Protect a supply convoy traveling through hostile territory. Defend against waves of ARC attacks.',
      type: 'Escort',
      difficulty: 'Rare',
      region: 'Wastelands',
      location: 'Trade Route 7',
      icon: 'https://via.placeholder.com/200x200/f59e0b/ffffff?text=Escort',
      objectives: [
        'Keep convoy vehicles above 50% health',
        'Eliminate all attacking ARC units',
        'Reach destination safely',
      ],
      rewards: [
        { name: 'Herbal Bandage', quantity: 5, rarity: 'Uncommon', value: 2250 },
        { name: 'Durable Cloth', quantity: 10, rarity: 'Common' },
        { name: 'Raider Coins', quantity: 2000, value: 2000 },
      ],
      duration: 3000, // 50 minutes
      recommended_level: 15,
      required_level: 12,
      max_players: 4,
      min_players: 3,
      requires_items: [
        { item_id: 'herbal-bandage', name: 'Herbal Bandage', quantity: 2 },
      ],
    },
    {
      id: 'mission-recover-artifact',
      name: 'Recover Ancient Artifact',
      description: 'Venture deep into ARC territory to recover a mysterious artifact. Face powerful enemies and solve environmental puzzles.',
      type: 'Exploration',
      difficulty: 'Epic',
      region: 'Ancient Ruins',
      location: 'Lost Temple',
      icon: 'https://via.placeholder.com/200x200/8b5cf6/ffffff?text=Artifact',
      objectives: [
        { name: 'Navigate temple defenses', type: 'survival', completed: false },
        { name: 'Solve 3 puzzle mechanisms', type: 'puzzle', target: 3, current: 0 },
        { name: 'Defeat Temple Guardian', type: 'boss', completed: false },
        { name: 'Recover artifact', type: 'retrieval', completed: false },
      ],
      rewards: [
        { name: 'Ancient Fragment', quantity: 1, rarity: 'Legendary', value: 5000 },
        { name: 'Exotic Material', quantity: 3, rarity: 'Rare' },
        { name: 'Raider Coins', quantity: 3500, value: 3500 },
      ],
      duration: 3600, // 60 minutes
      recommended_level: 20,
      required_level: 18,
      max_players: 4,
      min_players: 2,
      prerequisites: ['mission-eliminate-threat'],
      unlocks: ['mission-raid-facility'],
      tags: ['boss', 'puzzle', 'exploration'],
    },
    {
      id: 'mission-raid-facility',
      name: 'Raid ARC Facility',
      description: 'Launch a coordinated assault on a major ARC facility. This is an endgame mission requiring maximum preparation.',
      type: 'Raid',
      difficulty: 'Legendary',
      region: 'ARC Stronghold',
      location: 'Primary Command Center',
      icon: 'https://via.placeholder.com/200x200/f97316/ffffff?text=Raid',
      objectives: [
        { name: 'Breach facility defenses', type: 'objective', target: 4, current: 0 },
        { name: 'Disable security systems', type: 'objective', target: 3, current: 0 },
        { name: 'Defeat ARC Titan', type: 'boss', completed: false },
        { name: 'Extract before facility collapse', type: 'escape', completed: false },
      ],
      rewards: [
        { name: 'ARC Titan Core', quantity: 1, rarity: 'Legendary', value: 10000 },
        { name: 'Elite Weapon Blueprint', quantity: 1, rarity: 'Epic' },
        { name: 'Rare Materials Bundle', quantity: 1, rarity: 'Rare' },
        { name: 'Raider Coins', quantity: 5000, value: 5000 },
      ],
      duration: 5400, // 90 minutes
      recommended_level: 25,
      required_level: 20,
      max_players: 4,
      min_players: 4,
      prerequisites: ['mission-recover-artifact'],
      requires_items: [
        { item_id: 'herbal-bandage', name: 'Herbal Bandage', quantity: 5 },
        { item_id: 'adrenaline-shot', name: 'Adrenaline Shot', quantity: 3 },
      ],
      tags: ['endgame', 'boss', 'raid'],
      notes: 'This is the most challenging mission. Ensure your team is fully prepared with max-level gear.',
    },
  ]
  
  // Apply filters if provided
  let filteredMissions = [...mockMissions]
  
  if (params?.id) {
    filteredMissions = filteredMissions.filter(m => m.id === params.id)
  }
  if (params?.type) {
    filteredMissions = filteredMissions.filter(m => m.type?.toLowerCase() === params.type.toLowerCase())
  }
  if (params?.difficulty) {
    filteredMissions = filteredMissions.filter(m => m.difficulty?.toLowerCase() === params.difficulty.toLowerCase())
  }
  if (params?.region) {
    filteredMissions = filteredMissions.filter(m => m.region?.toLowerCase() === params.region.toLowerCase())
  }
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    filteredMissions = filteredMissions.filter(m => 
      m.name.toLowerCase().includes(searchLower) ||
      m.description?.toLowerCase().includes(searchLower) ||
      m.location?.toLowerCase().includes(searchLower)
    )
  }
  
  const page = params?.page || 1
  const limit = params?.limit || 100
  const total = filteredMissions.length
  const totalPages = Math.ceil(total / limit)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedMissions = filteredMissions.slice(startIndex, endIndex)
  
  return {
    data: paginatedMissions,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}

/**
 * Mock quests data for development
 */
function getMockQuestsData(params?: any): PaginatedResponse<ArcRaidersQuest> {
  const mockQuests: ArcRaidersQuest[] = [
    {
      id: 'quest-survival-basics',
      name: 'Survival Basics',
      description: 'Learn the fundamentals of survival in the hostile ARC-infested world. Complete basic tasks to get started.',
      type: 'Tutorial',
      difficulty: 'Common',
      region: 'Starting Area',
      location: 'Outpost Alpha',
      icon: 'https://via.placeholder.com/200x200/84cc16/ffffff?text=Basics',
      objectives: [
        'Gather 10 Scrap Metal',
        'Craft your first item',
        'Complete first extraction',
      ],
      rewards: [
        { name: 'Starter Pack', quantity: 1, rarity: 'Common' },
        { name: 'Raider Coins', quantity: 100, value: 100 },
      ],
      duration: 900, // 15 minutes
      recommended_level: 1,
      required_level: 1,
      max_players: 1,
      min_players: 1,
      quest_chain: 'new-player',
      chain_position: 1,
    },
    {
      id: 'quest-hunter-initiate',
      name: 'Hunter Initiate',
      description: 'Prove your worth by hunting down specific ARC targets. Track and eliminate designated enemies.',
      type: 'Hunt',
      difficulty: 'Uncommon',
      region: 'Industrial Sector',
      location: 'Hunting Grounds',
      icon: 'https://via.placeholder.com/200x200/ef4444/ffffff?text=Hunt',
      objectives: [
        { name: 'Eliminate 5 ARC Scouts', type: 'kill', target: 5, current: 0 },
        { name: 'Collect Scout Parts', type: 'collect', target: 10, current: 0 },
        { name: 'Report to Hunter Master', type: 'turn-in', completed: false },
      ],
      rewards: [
        { name: 'Hunter Badge', quantity: 1, rarity: 'Uncommon', value: 500 },
        { name: 'Scout Components', quantity: 5, rarity: 'Common' },
        { name: 'Raider Coins', quantity: 500, value: 500 },
      ],
      duration: 1800, // 30 minutes
      recommended_level: 5,
      required_level: 3,
      max_players: 4,
      min_players: 1,
      prerequisites: ['quest-survival-basics'],
      quest_chain: 'hunter',
      chain_position: 1,
      previous_quest: 'quest-survival-basics',
      next_quest: 'quest-hunter-advanced',
      tags: ['hunting', 'combat'],
    },
    {
      id: 'quest-hunter-advanced',
      name: 'Hunter Advanced',
      description: 'Take on more challenging targets. Face elite ARC units and collect rare materials.',
      type: 'Hunt',
      difficulty: 'Rare',
      region: 'Wastelands',
      location: 'Elite Hunting Grounds',
      icon: 'https://via.placeholder.com/200x200/f59e0b/ffffff?text=Advanced',
      objectives: [
        { name: 'Eliminate 3 ARC Walkers', type: 'kill', target: 3, current: 0 },
        { name: 'Defeat Elite ARC Unit', type: 'boss', completed: false },
        { name: 'Collect Elite Materials', type: 'collect', target: 5, current: 0 },
      ],
      rewards: [
        { name: 'Elite Hunter Badge', quantity: 1, rarity: 'Rare', value: 1500 },
        { name: 'Advanced Components', quantity: 3, rarity: 'Uncommon' },
        { name: 'Raider Coins', quantity: 1200, value: 1200 },
      ],
      duration: 2400, // 40 minutes
      recommended_level: 10,
      required_level: 8,
      max_players: 4,
      min_players: 2,
      prerequisites: ['quest-hunter-initiate'],
      quest_chain: 'hunter',
      chain_position: 2,
      previous_quest: 'quest-hunter-initiate',
      tags: ['hunting', 'boss', 'elite'],
    },
    {
      id: 'quest-scavenger-rumor',
      name: 'Scavenger Rumor',
      description: 'Follow rumors of valuable loot in abandoned facilities. Explore dangerous areas for rare resources.',
      type: 'Exploration',
      difficulty: 'Uncommon',
      region: 'Abandoned Sector',
      location: 'Old Research Facility',
      icon: 'https://via.placeholder.com/200x200/8b5cf6/ffffff?text=Loot',
      objectives: [
        'Explore 3 facility rooms',
        'Find hidden cache',
        'Retrieve valuable item',
      ],
      rewards: [
        { name: 'Rare Loot Cache', quantity: 1, rarity: 'Rare', value: 2000 },
        { name: 'Research Data', quantity: 1, rarity: 'Uncommon' },
        { name: 'Raider Coins', quantity: 800, value: 800 },
      ],
      duration: 2100, // 35 minutes
      recommended_level: 7,
      required_level: 5,
      max_players: 4,
      min_players: 1,
      requires_items: [
        { item_id: 'lockpick', name: 'Lockpick', quantity: 2 },
      ],
      tags: ['exploration', 'loot'],
    },
    {
      id: 'quest-ancient-mystery',
      name: 'Ancient Mystery',
      description: 'Investigate mysterious ancient ruins. Uncover secrets of the past and face powerful guardians.',
      type: 'Story',
      difficulty: 'Epic',
      region: 'Ancient Ruins',
      location: 'Lost Temple',
      icon: 'https://via.placeholder.com/200x200/a855f7/ffffff?text=Mystery',
      objectives: [
        { name: 'Decipher ancient texts', type: 'puzzle', completed: false },
        { name: 'Activate temple mechanisms', type: 'puzzle', target: 3, current: 0 },
        { name: 'Defeat Temple Guardian', type: 'boss', completed: false },
        { name: 'Retrieve ancient artifact', type: 'retrieval', completed: false },
      ],
      rewards: [
        { name: 'Ancient Artifact', quantity: 1, rarity: 'Legendary', value: 5000 },
        { name: 'Temple Knowledge', quantity: 1, rarity: 'Epic' },
        { name: 'Raider Coins', quantity: 3000, value: 3000 },
      ],
      duration: 3600, // 60 minutes
      recommended_level: 18,
      required_level: 15,
      max_players: 4,
      min_players: 2,
      quest_chain: 'ancient',
      chain_position: 1,
      next_quest: 'quest-ancient-awakening',
      tags: ['story', 'boss', 'puzzle', 'exploration'],
      notes: 'This quest requires solving complex puzzles and defeating a powerful boss. Bring a well-equipped team.',
    },
    {
      id: 'quest-ancient-awakening',
      name: 'Ancient Awakening',
      description: 'The artifact has awakened ancient powers. Confront the source of the mystery and seal the ancient threat.',
      type: 'Story',
      difficulty: 'Legendary',
      region: 'Ancient Ruins',
      location: 'Heart of the Temple',
      icon: 'https://via.placeholder.com/200x200/f97316/ffffff?text=Awakening',
      objectives: [
        { name: 'Navigate awakened temple', type: 'survival', completed: false },
        { name: 'Defeat Ancient Guardian Boss', type: 'boss', completed: false },
        { name: 'Seal the ancient power', type: 'objective', completed: false },
      ],
      rewards: [
        { name: 'Sealed Artifact', quantity: 1, rarity: 'Legendary', value: 10000 },
        { name: 'Guardian Essence', quantity: 1, rarity: 'Epic' },
        { name: 'Ancient Weapon Blueprint', quantity: 1, rarity: 'Legendary' },
        { name: 'Raider Coins', quantity: 5000, value: 5000 },
      ],
      duration: 5400, // 90 minutes
      recommended_level: 22,
      required_level: 20,
      max_players: 4,
      min_players: 4,
      prerequisites: ['quest-ancient-mystery'],
      quest_chain: 'ancient',
      chain_position: 2,
      previous_quest: 'quest-ancient-mystery',
      requires_items: [
        { item_id: 'ancient-artifact', name: 'Ancient Artifact', quantity: 1 },
        { item_id: 'herbal-bandage', name: 'Herbal Bandage', quantity: 10 },
      ],
      tags: ['story', 'boss', 'endgame'],
      notes: 'The final quest in the Ancient chain. This is extremely challenging and requires maximum preparation.',
      guide: 'Form a full team of 4 players. Ensure everyone has max-level gear and plenty of healing items. The final boss has multiple phases and requires coordinated attacks.',
    },
  ]
  
  // Apply filters if provided
  let filteredQuests = [...mockQuests]
  
  if (params?.id) {
    filteredQuests = filteredQuests.filter(q => q.id === params.id)
  }
  if (params?.type) {
    filteredQuests = filteredQuests.filter(q => q.type?.toLowerCase() === params.type.toLowerCase())
  }
  if (params?.difficulty) {
    filteredQuests = filteredQuests.filter(q => q.difficulty?.toLowerCase() === params.difficulty.toLowerCase())
  }
  if (params?.region) {
    filteredQuests = filteredQuests.filter(q => q.region?.toLowerCase() === params.region.toLowerCase())
  }
  if (params?.quest_chain) {
    filteredQuests = filteredQuests.filter(q => q.quest_chain === params.quest_chain)
  }
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    filteredQuests = filteredQuests.filter(q => 
      q.name.toLowerCase().includes(searchLower) ||
      q.description?.toLowerCase().includes(searchLower) ||
      q.location?.toLowerCase().includes(searchLower)
    )
  }
  
  const page = params?.page || 1
  const limit = params?.limit || 100
  const total = filteredQuests.length
  const totalPages = Math.ceil(total / limit)
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedQuests = filteredQuests.slice(startIndex, endIndex)
  
  return {
    data: paginatedQuests,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}

/**
 * Mock recipes data for development
 */
function getMockRecipesData(params?: any): ArcRaidersRecipe[] | PaginatedResponse<ArcRaidersRecipe> {
  const mockRecipes: ArcRaidersRecipe[] = [
    {
      id: 'recipe-herbal-bandage',
      name: 'Herbal Bandage',
      output: 'herbal-bandage',
      requires: [
        { item: 'durable-cloth', count: 1 },
        { item: 'great-mullein', count: 1 },
      ],
      description: 'An improvised medical item that gradually restores health over time.',
      workbench: 'Basic Workbench',
      rarity: 'Uncommon',
      components: [
        { id: 'durable-cloth', name: 'Durable Cloth', quantity: 1, item_type: 'Refined Material' },
        { id: 'great-mullein', name: 'Great Mullein', quantity: 1, item_type: 'Nature' },
      ],
    } as any,
    {
      id: 'recipe-ak47',
      name: 'AK-47',
      output: 'ak-47',
      requires: [
        { item: 'scrap-metal', count: 50 },
        { item: 'advanced-components', count: 5 },
        { item: 'weapon-frame', count: 1 },
      ],
      description: 'A reliable automatic rifle with excellent stopping power.',
      workbench: 'Weapons Workbench',
      rarity: 'Rare',
      components: [
        { id: 'scrap-metal', name: 'Scrap Metal', quantity: 50, item_type: 'Material' },
        { id: 'advanced-components', name: 'Advanced Components', quantity: 5, item_type: 'Component' },
        { id: 'weapon-frame', name: 'Weapon Frame', quantity: 1, item_type: 'Component' },
      ],
    } as any,
    {
      id: 'recipe-red-dot-sight',
      name: 'Red Dot Sight',
      output: 'red-dot-sight',
      requires: [
        { item: 'scrap-metal', count: 10 },
        { item: 'optic-lens', count: 1 },
      ],
      description: 'Improves weapon accuracy.',
      workbench: 'Basic Workbench',
      rarity: 'Uncommon',
      components: [
        { id: 'scrap-metal', name: 'Scrap Metal', quantity: 10, item_type: 'Material' },
        { id: 'optic-lens', name: 'Optic Lens', quantity: 1, item_type: 'Component' },
      ],
    } as any,
    {
      id: 'recipe-adrenaline-shot',
      name: 'Adrenaline Shot',
      output: 'adrenaline-shot',
      requires: [
        { item: 'scrap-metal', count: 5 },
        { item: 'chemical-base', count: 1 },
      ],
      description: 'A serum that fully restores stamina and temporarily increases stamina regeneration.',
      workbench: 'Basic Workbench',
      rarity: 'Common',
      components: [
        { id: 'scrap-metal', name: 'Scrap Metal', quantity: 5, item_type: 'Material' },
        { id: 'chemical-base', name: 'Chemical Base', quantity: 1, item_type: 'Component' },
      ],
    } as any,
  ]
  
  // Apply filters if provided
  let filteredRecipes = [...mockRecipes]
  
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    filteredRecipes = filteredRecipes.filter(r => 
      r.name.toLowerCase().includes(searchLower) ||
      r.description?.toLowerCase().includes(searchLower)
    )
  }
  
  if (params?.workbench) {
    filteredRecipes = filteredRecipes.filter(r => 
      (r as any).workbench?.toLowerCase() === params.workbench.toLowerCase()
    )
  }
  
  // Return as array or paginated response
  if (params?.page) {
    const page = params.page || 1
    const limit = params.limit || 100
    const total = filteredRecipes.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex)
    
    return {
      data: paginatedRecipes,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }
  }
  
  return filteredRecipes
}
