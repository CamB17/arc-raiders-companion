import { useArcRaidersData, ArcRaidersItem, ArcRaidersQuest, ArcRaidersArc, ArcRaidersTrader, PaginatedResponse } from './useArcRaidersApi'

export interface SearchResult {
  type: 'item' | 'quest' | 'enemy' | 'trader'
  id: string
  name: string
  description?: string
  image?: string
  icon?: string
  data: ArcRaidersItem | ArcRaidersQuest | ArcRaidersArc | ArcRaidersTrader
}

export interface SearchResults {
  items: SearchResult[]
  quests: SearchResult[]
  enemies: SearchResult[]
  traders: SearchResult[]
  total: number
}

/**
 * Hook to search across all content types
 */
export const useSearch = (query: string, enabled: boolean = true) => {
  const searchQuery = query.trim()
  const isEnabled = enabled && searchQuery.length >= 2
  
  // Fetch from all endpoints in parallel using useArcRaidersData directly
  // to support conditional querying (enabled option)
  const itemsQuery = useArcRaidersData<PaginatedResponse<ArcRaidersItem>>(
    'items',
    isEnabled ? {
      search: searchQuery,
      limit: 20,
      page: 1,
      includeComponents: true,
    } : undefined,
    { enabled: isEnabled }
  )
  
  const questsQuery = useArcRaidersData<PaginatedResponse<ArcRaidersQuest>>(
    'quests',
    isEnabled ? {
      search: searchQuery,
      limit: 20,
      page: 1,
      includeDetails: true,
    } : undefined,
    { enabled: isEnabled }
  )
  
  const enemiesQuery = useArcRaidersData<PaginatedResponse<ArcRaidersArc>>(
    'arcs',
    isEnabled ? {
      search: searchQuery,
      limit: 20,
      page: 1,
    } : undefined,
    { enabled: isEnabled }
  )
  
  const tradersQuery = useArcRaidersData<PaginatedResponse<ArcRaidersTrader>>(
    'traders',
    isEnabled ? {
      search: searchQuery,
      limit: 20,
      page: 1,
      includeItems: true,
      includeQuests: true,
    } : undefined,
    { enabled: isEnabled }
  )
  
  // Helper function to normalize API response to array
  const normalizeResponse = <T>(responseData: any, endpoint?: string): T[] => {
    if (!responseData) {
      return []
    }
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development' && responseData) {
      console.log(`[Search] Normalizing ${endpoint} response:`, {
        hasData: !!responseData.data,
        isArray: Array.isArray(responseData),
        isDataArray: Array.isArray(responseData.data),
        isObject: typeof responseData.data === 'object' && !Array.isArray(responseData.data),
        keys: Object.keys(responseData),
      })
    }
    
    // Handle traders endpoint special case - API returns object mapping trader names to items
    if (endpoint === 'traders' && responseData.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data)) {
      // Convert object to array of traders
      const tradersArray = Object.entries(responseData.data).map(([traderName, items]: [string, any]) => {
        const traderId = traderName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const traderImageUrl = `https://cdn.metaforge.app/arc-raiders/traders/${traderId}.webp`
        return {
          id: traderId,
          name: traderName,
          items: Array.isArray(items) ? items : [],
          sells: Array.isArray(items) ? items : [],
          avatar: traderImageUrl,
          image: traderImageUrl,
          imageUrl: traderImageUrl,
          icon: traderImageUrl,
        } as T
      })
      return tradersArray
    }
    
    // If response is already paginated
    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data
    }
    
    // If response is directly an array
    if (Array.isArray(responseData)) {
      return responseData
    }
    
    // If response is a single object
    if (responseData.id) {
      return [responseData]
    }
    
    return []
  }
  
  // Combine results
  const results: SearchResults = {
    items: [],
    quests: [],
    enemies: [],
    traders: [],
    total: 0,
  }
  
  const items = normalizeResponse<ArcRaidersItem>(itemsQuery.data, 'items')
  results.items = items.map((item: ArcRaidersItem): SearchResult => ({
    type: 'item',
    id: item.id,
    name: item.name,
    description: item.description,
    image: item.icon || item.image || item.imageUrl || item.thumbnail,
    icon: item.icon,
    data: item,
  }))
  
  const quests = normalizeResponse<ArcRaidersQuest>(questsQuery.data, 'quests')
  results.quests = quests.map((quest: ArcRaidersQuest): SearchResult => ({
    type: 'quest',
    id: quest.id,
    name: quest.name,
    description: quest.description,
    image: quest.icon || quest.image || quest.imageUrl || quest.thumbnail,
    icon: quest.icon,
    data: quest,
  }))
  
  const enemies = normalizeResponse<ArcRaidersArc>(enemiesQuery.data, 'arcs')
  results.enemies = enemies.map((enemy: ArcRaidersArc): SearchResult => ({
    type: 'enemy',
    id: enemy.id,
    name: enemy.name,
    description: enemy.description,
    image: enemy.icon || enemy.image || enemy.imageUrl || enemy.thumbnail,
    icon: enemy.icon,
    data: enemy,
  }))
  
  const traders = normalizeResponse<ArcRaidersTrader>(tradersQuery.data, 'traders')
  results.traders = traders.map((trader: ArcRaidersTrader): SearchResult => ({
    type: 'trader',
    id: trader.id,
    name: trader.name,
    description: trader.description,
    image: trader.avatar || trader.image || trader.imageUrl || trader.icon || trader.thumbnail,
    icon: trader.icon || trader.avatar,
    data: trader,
  }))
  
  results.total = results.items.length + results.quests.length + results.enemies.length + results.traders.length
  
  const isLoading = itemsQuery.isLoading || questsQuery.isLoading || enemiesQuery.isLoading || tradersQuery.isLoading
  const isError = itemsQuery.isError || questsQuery.isError || enemiesQuery.isError || tradersQuery.isError
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development' && searchQuery.length >= 2) {
    console.log('[Search] Results summary:', {
      query: searchQuery,
      isLoading,
      isError,
      total: results.total,
      items: results.items.length,
      quests: results.quests.length,
      enemies: results.enemies.length,
      traders: results.traders.length,
      itemsData: itemsQuery.data ? 'has data' : 'no data',
      questsData: questsQuery.data ? 'has data' : 'no data',
      enemiesData: enemiesQuery.data ? 'has data' : 'no data',
      tradersData: tradersQuery.data ? 'has data' : 'no data',
    })
  }
  
  return {
    results,
    isLoading,
    isError,
    isEmpty: !isLoading && !isError && results.total === 0 && searchQuery.length >= 2,
  }
}

