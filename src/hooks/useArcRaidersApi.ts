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
  
  // Quest giver/trader
  trader?: {
    name?: string
    avatar?: string
    image?: string
    icon?: string
    [key: string]: any
  }
  giver?: {
    name?: string
    avatar?: string
    image?: string
    icon?: string
    [key: string]: any
  }
  provider?: {
    name?: string
    avatar?: string
    image?: string
    icon?: string
    [key: string]: any
  }
  
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
        throw error
      }
    },
    ...options,
  })
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
        throw error
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
        throw error
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
        
        // If both fail, throw error
        throw new Error('Failed to fetch recipes from API')
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
        throw error
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
        throw error
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
      
      // If all endpoints fail, throw error
      console.error('✗ Failed to fetch arcs from all endpoints')
      throw new Error('Failed to fetch arcs/enemies from API')
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
      
      // If all endpoints fail, throw error
      console.error(`✗ Failed to fetch arc: ${id}`)
      throw new Error(`Failed to fetch arc/enemy: ${id}`)
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

