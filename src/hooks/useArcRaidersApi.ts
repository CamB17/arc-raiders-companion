import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

// Always use proxy path to avoid CORS issues
// Netlify will proxy /api/arc-raiders/* to metaforge.app
const BASE_URL = '/api/arc-raiders'

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
  
  // XP - TOP LEVEL FIELD from API
  xp?: number
  experience?: number
  exp?: number
  
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
  
  // Rewards - API returns array of objects with nested item
  rewards?: Array<string | {
    id?: string
    name?: string
    type?: string
    item_id?: string
    item?: string | {
      id?: string
      name?: string
      icon?: string
      image?: string
      rarity?: string
      item_type?: string
      value?: number
      [key: string]: any
    }
    quantity?: number | string
    value?: number
    rarity?: string
    icon?: string
    image?: string
    [key: string]: any
  }>
  
  // Additional API fields
  granted_items?: any[]
  locations?: string[]
  marker_category?: string
  required_items?: any[]
  created_at?: string
  updated_at?: string
  
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

export interface ArcRaidersTrader {
  id: string
  name: string
  description?: string
  
  // Images
  avatar?: string
  image?: string
  imageUrl?: string
  icon?: string
  thumbnail?: string
  
  // Location info
  location?: string
  region?: string
  
  // Trader type/category
  type?: string
  category?: string
  
  // Items sold by this trader
  items?: Array<{
    item_id?: string
    item?: string
    id?: string
    name?: string
    price?: number
    currency?: string
    [key: string]: any
  }>
  sells?: Array<{
    item_id?: string
    item?: string
    id?: string
    name?: string
    price?: number
    currency?: string
    [key: string]: any
  }>
  
  // Quests provided by this trader
  quests?: Array<{
    quest_id?: string
    quest?: string
    id?: string
    name?: string
    [key: string]: any
  }>
  provides_quests?: Array<{
    quest_id?: string
    quest?: string
    id?: string
    name?: string
    [key: string]: any
  }>
  
  // Additional metadata
  notes?: string
  tags?: string[]
  
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
 * Automatically fetches all pages if fetchAll is true (default)
 */
export const useItems = (params?: ItemsQueryParams & { fetchAll?: boolean }) => {
  const { fetchAll = true, ...queryParams } = params || {}
  const defaultParams: ItemsQueryParams = {
    page: 1,
    limit: fetchAll ? 1000 : 100, // Try to fetch all items in one request if fetchAll is true
    includeComponents: true,
    ...queryParams,
  }
  
  return useQuery<PaginatedResponse<ArcRaidersItem>>({
    queryKey: ['arc-raiders', 'items', defaultParams, fetchAll],
    queryFn: async () => {
      try {
        // First, try to fetch with high limit to get all items in one request
        const response = await axios.get(`${BASE_URL}/items`, {
          params: defaultParams,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          timeout: 30000, // Increased timeout for larger requests
        })
        
        if (response.data) {
          const items = response.data.data || []
          const pagination = response.data.pagination
          
          // If fetchAll is true and there are more pages, fetch all pages
          if (fetchAll && pagination && pagination.hasNextPage && pagination.totalPages > 1) {
            // Fetch remaining pages in parallel
            const pagePromises: Promise<any>[] = []
            for (let page = 2; page <= pagination.totalPages; page++) {
              pagePromises.push(
                axios.get(`${BASE_URL}/items`, {
                  params: {
                    ...defaultParams,
                    page,
                    limit: defaultParams.limit || 1000,
                  },
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  },
                  timeout: 30000,
                })
              )
            }
            
            // Wait for all pages to load
            const pageResponses = await Promise.all(pagePromises)
            
            // Combine all items from all pages
            const allItems = [...items]
            pageResponses.forEach((pageResponse) => {
              if (pageResponse.data?.data) {
                allItems.push(...pageResponse.data.data)
              }
            })
            
            return {
              data: allItems,
              pagination: {
                ...pagination,
                page: 1,
                total: allItems.length,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
              },
            }
          }
          
          return response.data
        }
        
        throw new Error('No data received')
      } catch (error: any) {
        // If the request fails with a high limit, try with lower limit and pagination
        if (fetchAll && defaultParams.limit && defaultParams.limit > 100) {
          try {
            // Fetch first page with smaller limit
            const firstResponse = await axios.get(`${BASE_URL}/items`, {
              params: {
                ...defaultParams,
                limit: 100,
              },
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              timeout: 15000,
            })
            
            if (firstResponse.data) {
              const firstItems = firstResponse.data.data || []
              const firstPagination = firstResponse.data.pagination
              
              if (firstPagination && firstPagination.hasNextPage && firstPagination.totalPages > 1) {
                // Fetch remaining pages
                const pagePromises: Promise<any>[] = []
                for (let page = 2; page <= firstPagination.totalPages; page++) {
                  pagePromises.push(
                    axios.get(`${BASE_URL}/items`, {
                      params: {
                        ...defaultParams,
                        page,
                        limit: 100,
                      },
                      headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                      },
                      timeout: 15000,
                    })
                  )
                }
                
                const pageResponses = await Promise.all(pagePromises)
                
                // Combine all items
                const allItems = [...firstItems]
                pageResponses.forEach((pageResponse) => {
                  if (pageResponse.data?.data) {
                    allItems.push(...pageResponse.data.data)
                  }
                })
                
                return {
                  data: allItems,
                  pagination: {
                    ...firstPagination,
                    page: 1,
                    total: allItems.length,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false,
                  },
                }
              }
              
              return firstResponse.data
            }
          } catch (retryError) {
            console.error('✗ Failed to fetch items with pagination fallback', retryError)
          }
        }
        
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
 * Hook to fetch all traders with pagination and filtering
 */
export const useTraders = (params?: {
  page?: number
  limit?: number
  id?: string
  type?: string
  location?: string
  region?: string
  search?: string
  includeItems?: boolean
  includeQuests?: boolean
}) => {
  const defaultParams = {
    page: 1,
    limit: 100,
    includeItems: true,
    includeQuests: true,
    ...params,
  }
  
  return useQuery<PaginatedResponse<ArcRaidersTrader>>({
    queryKey: ['arc-raiders', 'traders', defaultParams],
    queryFn: async () => {
      // Try multiple possible endpoint names
      const endpoints = ['traders', 'trader', 'vendors', 'merchants', 'npc']
      
      for (const endpoint of endpoints) {
        try {
          // For traders endpoint, try with minimal params first
          // The API might not support all query parameters yet
          const params = endpoint === 'traders' 
            ? {} // Try without params first for traders endpoint
            : defaultParams
          
          console.log(`Attempting to fetch from ${BASE_URL}/${endpoint}`, params)
          
          const response = await axios.get(`${BASE_URL}/${endpoint}`, {
            params,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          })
          
          // Handle different response structures
          if (response.data) {
            // API returns: { success: boolean, data: Object mapping trader names to item inventories }
            // Check if response.data.data is an object (not array) - this is the traders mapping
            // Also check for success field (optional - API might include it)
            if ((response.data.success !== false) && response.data.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
              // Convert object mapping to array of traders
              const tradersArray: ArcRaidersTrader[] = Object.entries(response.data.data).map(([traderName, items]: [string, any]) => {
                // Items are already arrays from the API
                let itemsArray: any[] = []
                
                if (Array.isArray(items)) {
                  // Items are already in array format with full item details
                  itemsArray = items.map((item: any) => ({
                    item_id: item.id || item.item_id,
                    id: item.id || item.item_id,
                    item: item.id || item.item_id,
                    name: item.name,
                    price: item.trader_price !== null && item.trader_price !== undefined 
                      ? item.trader_price 
                      : (item.price || item.value),
                    currency: item.currency || 'raider_coins',
                    icon: item.icon,
                    image: item.icon || item.image || item.imageUrl,
                    rarity: item.rarity,
                    item_type: item.item_type,
                    description: item.description,
                    value: item.value,
                    ...item, // Spread all other properties
                  }))
                } else if (items && typeof items === 'object') {
                  // If items is an object, convert to array (fallback for different API formats)
                  itemsArray = Object.entries(items).map(([itemId, itemData]: [string, any]) => {
                    if (typeof itemData === 'object') {
                      return {
                        item_id: itemId,
                        id: itemId,
                        item: itemId,
                        name: itemData.name || itemId,
                        price: itemData.trader_price !== null && itemData.trader_price !== undefined
                          ? itemData.trader_price
                          : (itemData.price || itemData.value),
                        currency: itemData.currency || 'raider_coins',
                        icon: itemData.icon,
                        image: itemData.icon || itemData.image || itemData.imageUrl,
                        rarity: itemData.rarity,
                        item_type: itemData.item_type,
                        description: itemData.description,
                        value: itemData.value,
                        ...itemData,
                      }
                    }
                    return {
                      item_id: itemId,
                      id: itemId,
                      item: itemId,
                      name: itemId,
                      price: itemData,
                    }
                  })
                }
                
                // Create trader object from name
                // Use trader name as ID (slugify it for URL-friendly ID)
                const traderId = traderName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                
                // Construct trader image URL - API uses CDN pattern
                // Try: https://cdn.metaforge.app/arc-raiders/traders/{trader-id}.webp
                const traderImageUrl = `https://cdn.metaforge.app/arc-raiders/traders/${traderId}.webp`
                const traderImageUrlPng = `https://cdn.metaforge.app/arc-raiders/traders/${traderId}.png`
                
                return {
                  id: traderId,
                  name: traderName,
                  items: itemsArray,
                  sells: itemsArray, // Alias for items
                  // Add image URLs - will try webp first, fallback to png
                  avatar: traderImageUrl,
                  image: traderImageUrl,
                  imageUrl: traderImageUrl,
                  icon: traderImageUrl,
                  thumbnail: traderImageUrl,
                  // Store both formats for fallback
                  _imageUrls: [traderImageUrl, traderImageUrlPng],
                } as ArcRaidersTrader
              })
              
              console.log(`✓ Successfully fetched ${tradersArray.length} traders from ${endpoint}`)
              return {
                data: tradersArray,
                pagination: {
                  page: defaultParams.page || 1,
                  limit: defaultParams.limit || 100,
                  total: tradersArray.length,
                  totalPages: 1,
                  hasNextPage: false,
                  hasPrevPage: false,
                },
              }
            }
            // If response is already paginated
            if (response.data.data && response.data.pagination && Array.isArray(response.data.data)) {
              console.log(`✓ Successfully fetched ${response.data.data.length} traders from ${endpoint}`)
              return response.data
            }
            // If response.data is an array (check this first before checking response.data.data)
            if (Array.isArray(response.data)) {
              console.log(`✓ Successfully fetched ${response.data.length} traders from ${endpoint}`)
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
            if (response.data.id && !response.data.data) {
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
            // Handle empty object or empty array in data field
            if (response.data.data && Array.isArray(response.data.data)) {
              console.log(`✓ Successfully fetched ${response.data.data.length} traders from ${endpoint}`)
              return {
                data: response.data.data,
                pagination: response.data.pagination || {
                  page: defaultParams.page || 1,
                  limit: defaultParams.limit || 100,
                  total: response.data.data.length,
                  totalPages: 1,
                  hasNextPage: false,
                  hasPrevPage: false,
                },
              }
            }
          }
          
          // If we get here and have data but couldn't parse it, continue to next endpoint
          if (response.status === 200 && response.data !== undefined) {
            console.warn(`⚠ Unexpected response format from ${endpoint}:`, response.data)
            continue
          }
        } catch (error: any) {
          // Log the error for debugging
          if (endpoint === endpoints[0]) {
            console.log(`⚠ Failed to fetch from ${endpoint}:`, error.response?.status || error.code, error.message)
          }
          
          // If it's a 404 or endpoint doesn't exist, try next endpoint
          if (error.response?.status === 404 || error.code === 'ERR_BAD_REQUEST') {
            continue
          }
          // For network errors or other issues, try next endpoint
          continue
        }
      }
      
      // If all endpoints fail, return empty response instead of throwing
      console.warn('⚠ No traders endpoint found. Returning empty response.')
      return {
        data: [],
        pagination: {
          page: defaultParams.page || 1,
          limit: defaultParams.limit || 100,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      }
    },
  })
}

/**
 * Hook to fetch a specific trader by ID
 */
export const useTrader = (id: string) => {
  return useQuery<ArcRaidersTrader>({
    queryKey: ['arc-raiders', 'traders', id],
    queryFn: async () => {
      // Try multiple possible endpoint names
      const endpoints = ['traders', 'trader', 'vendors', 'merchants', 'npc']
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(`${BASE_URL}/${endpoint}`, {
            params: { 
              id,
              includeItems: true,
              includeQuests: true,
            },
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          })
          
          // Handle different response structures
          let traderData = null
          
          // API returns: { success: boolean, data: Object mapping trader names to item inventories }
          // Check if response.data.data is an object (not array) - this is the traders mapping
          if (response.data?.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
            // Convert trader name to ID (slugify) and find matching trader
            // The id parameter might be a slugified name or the actual name
            const tradersMap = response.data.data as Record<string, any>
            
            // Try to find trader by matching ID with slugified name or exact name
            for (const [traderName, items] of Object.entries(tradersMap)) {
              const traderId = traderName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
              
              if (traderId === id || traderName.toLowerCase() === id.toLowerCase() || traderName === id) {
                // Found matching trader, convert to trader object
                let itemsArray = []
                if (Array.isArray(items)) {
                  // Items are already in array format with full item details
                  itemsArray = items.map((item: any) => ({
                    item_id: item.id || item.item_id,
                    id: item.id || item.item_id,
                    item: item.id || item.item_id,
                    name: item.name,
                    price: item.trader_price !== null && item.trader_price !== undefined 
                      ? item.trader_price 
                      : (item.price || item.value),
                    currency: item.currency || 'raider_coins',
                    icon: item.icon,
                    image: item.icon || item.image || item.imageUrl,
                    rarity: item.rarity,
                    item_type: item.item_type,
                    description: item.description,
                    value: item.value,
                    ...item, // Spread all other properties
                  }))
                } else if (items && typeof items === 'object') {
                  // If items is an object, convert to array
                  itemsArray = Object.entries(items).map(([itemId, itemData]: [string, any]) => {
                    if (typeof itemData === 'object') {
                      return {
                        item_id: itemId,
                        id: itemId,
                        item: itemId,
                        name: itemData.name || itemId,
                        price: itemData.trader_price !== null && itemData.trader_price !== undefined
                          ? itemData.trader_price
                          : (itemData.price || itemData.value),
                        currency: itemData.currency || 'raider_coins',
                        icon: itemData.icon,
                        image: itemData.icon || itemData.image || itemData.imageUrl,
                        rarity: itemData.rarity,
                        item_type: itemData.item_type,
                        description: itemData.description,
                        value: itemData.value,
                        ...itemData,
                      }
                    }
                    return {
                      item_id: itemId,
                      id: itemId,
                      item: itemId,
                      name: itemId,
                      price: itemData,
                    }
                  })
                }
                
                // Construct trader image URL - API uses CDN pattern
                const traderImageUrl = `https://cdn.metaforge.app/arc-raiders/traders/${traderId}.webp`
                const traderImageUrlPng = `https://cdn.metaforge.app/arc-raiders/traders/${traderId}.png`
                
                traderData = {
                  id: traderId,
                  name: traderName,
                  items: itemsArray,
                  sells: itemsArray, // Alias for items
                  // Add image URLs
                  avatar: traderImageUrl,
                  image: traderImageUrl,
                  imageUrl: traderImageUrl,
                  icon: traderImageUrl,
                  thumbnail: traderImageUrl,
                  _imageUrls: [traderImageUrl, traderImageUrlPng],
                } as ArcRaidersTrader
                break
              }
            }
            
            if (traderData) {
              console.log(`✓ Successfully fetched trader: ${id} from ${endpoint}`)
              return traderData
            }
          }
          
          // Check if response.data is directly the trader object
          if (response.data && !response.data.data && response.data.id) {
            traderData = response.data
          }
          // Check if response.data.data is an array
          else if (response.data?.data?.[0]) {
            traderData = response.data.data[0]
          }
          // Check if response.data.data is the object itself
          else if (response.data?.data && response.data.data.id) {
            traderData = response.data.data
          }
          // Check if response.data is an array
          else if (Array.isArray(response.data) && response.data.length > 0) {
            traderData = response.data.find((t: any) => t.id === id) || response.data[0]
          }
          
          if (traderData) {
            console.log(`✓ Successfully fetched trader: ${id} from ${endpoint}`)
            return traderData
          }
        } catch (error: any) {
          // If it's a 404 or endpoint doesn't exist, try next endpoint
          if (error.response?.status === 404 || error.code === 'ERR_BAD_REQUEST') {
            continue
          }
          // For other errors, log and try next endpoint
          if (endpoint === endpoints[0]) {
            console.warn(`⚠ Failed to fetch trader from ${endpoint}, trying alternatives...`, error.message)
          }
          continue
        }
      }
      
      // If all endpoints fail, throw error
      console.error(`✗ Failed to fetch trader: ${id} from all endpoints`)
      throw new Error(`Trader not found: ${id}`)
    },
    enabled: !!id,
  })
}

/**
 * Utility function to link quests to traders
 * Matches traders based on trader names or quest names
 */
export function linkQuestsToTraders(
  quests: ArcRaidersQuest[],
  traders: ArcRaidersTrader[]
): ArcRaidersQuest[] {
  // Create a map of trader names (normalized) to trader objects
  const tradersByName = new Map<string, ArcRaidersTrader>()
  traders.forEach(trader => {
    // Multiple variations of trader name for matching
    const normalizedName = trader.name.toLowerCase().trim()
    tradersByName.set(normalizedName, trader)
    // Also store by ID
    if (trader.id) {
      tradersByName.set(trader.id.toLowerCase(), trader)
    }
  })
  
  // Known trader-quest relationships (can be expanded)
  const traderQuestMapping: Record<string, string[]> = {
    'apollo': [], // Apollo - likely gives tactical/utility quests
    'celeste': [], // Celeste - materials trader
    'lance': [], // Lance - medical/combat trader
    'shani': [], // Shani - keys/rare items trader
    'tianwen': [], // TianWen - weapons/modifications trader
  }
  
  return quests.map(quest => {
    // Check if quest already has trader info
    if (quest.trader || quest.giver || quest.provider) {
      return quest
    }
    
    // Try to match quest to trader based on quest name patterns
    const questNameLower = quest.name.toLowerCase()
    
    // Match by trader name in quest name or description
    let matchedTrader: ArcRaidersTrader | null = null
    
    // Check each trader name
    for (const [traderName, trader] of tradersByName) {
      // If quest name or description mentions trader name
      if (
        questNameLower.includes(traderName) ||
        quest.description?.toLowerCase().includes(traderName)
      ) {
        matchedTrader = trader
        break
      }
    }
    
    // If no match found, try pattern matching
    // Apollo - tactical, utility, gadgets
    if (!matchedTrader && (
      questNameLower.includes('tactical') ||
      questNameLower.includes('utility') ||
      questNameLower.includes('gadget') ||
      questNameLower.includes('zipline') ||
      questNameLower.includes('grenade')
    )) {
      matchedTrader = tradersByName.get('apollo') || null
    }
    
    // Celeste - materials, resources
    if (!matchedTrader && (
      questNameLower.includes('material') ||
      questNameLower.includes('resource') ||
      questNameLower.includes('harvest') ||
      questNameLower.includes('collect')
    )) {
      matchedTrader = tradersByName.get('celeste') || null
    }
    
    // Lance - medical, combat, shield
    if (!matchedTrader && (
      questNameLower.includes('medical') ||
      questNameLower.includes('bandage') ||
      questNameLower.includes('shield') ||
      questNameLower.includes('combat') ||
      questNameLower.includes('augment')
    )) {
      matchedTrader = tradersByName.get('lance') || null
    }
    
    // Shani - keys, rare items
    if (!matchedTrader && (
      questNameLower.includes('key') ||
      questNameLower.includes('hatch') ||
      questNameLower.includes('rare')
    )) {
      matchedTrader = tradersByName.get('shani') || null
    }
    
    // TianWen - weapons, modifications
    if (!matchedTrader && (
      questNameLower.includes('weapon') ||
      questNameLower.includes('modification') ||
      questNameLower.includes('ammo') ||
      questNameLower.includes('grip') ||
      questNameLower.includes('magazine')
    )) {
      matchedTrader = tradersByName.get('tianwen') || null
    }
    
    // If trader found, add it to quest
    if (matchedTrader) {
      return {
        ...quest,
        trader: {
          name: matchedTrader.name,
          avatar: matchedTrader.avatar || matchedTrader.image || matchedTrader.icon,
          image: matchedTrader.image || matchedTrader.avatar || matchedTrader.icon,
          icon: matchedTrader.icon || matchedTrader.image || matchedTrader.avatar,
        },
        giver: {
          name: matchedTrader.name,
          avatar: matchedTrader.avatar || matchedTrader.image || matchedTrader.icon,
          image: matchedTrader.image || matchedTrader.avatar || matchedTrader.icon,
          icon: matchedTrader.icon || matchedTrader.image || matchedTrader.avatar,
        },
      }
    }
    
    return quest
  })
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

