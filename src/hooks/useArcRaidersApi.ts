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
