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
  value?: number
  
  // Economy - API uses 'value'
  value?: number
  recycleValue?: number
  raider_coins?: number
  
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
  rewards?: any[]
  objectives?: string[]
  [key: string]: any
}

export interface ArcRaidersRecipe {
  id: string
  name: string
  output: string
  requires: Array<{ item: string; count: number }>
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
 * Hook to fetch all missions
 */
export const useMissions = () => {
  return useArcRaidersData<ArcRaidersMission[]>('missions')
}

/**
 * Hook to fetch all crafting recipes
 */
export const useRecipes = () => {
  return useArcRaidersData<ArcRaidersRecipe[]>('recipes')
}
