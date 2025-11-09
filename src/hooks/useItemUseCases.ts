import { useMemo } from 'react'
import { useQuests, useItems, useRecipes } from './useArcRaidersApi'
import { useHideoutWorkbenchesWithLevels, useExpeditionWithPhases } from './useSupabase'
import type { ArcRaidersQuest, ArcRaidersItem, ArcRaidersRecipe } from './useArcRaidersApi'
import type { HideoutWorkbench, HideoutWorkbenchLevel, ExpeditionPhase } from '@/lib/supabase'

export interface QuestUseCase {
  quest: ArcRaidersQuest
  quantity: number
  type: 'required' | 'rewarded'
}

export interface CraftingUseCase {
  item: ArcRaidersItem | ArcRaidersRecipe
  quantity: number
}

export interface HideoutUseCase {
  workbench: HideoutWorkbench
  level: HideoutWorkbenchLevel
  quantity: number
}

export interface ExpeditionUseCase {
  phase: ExpeditionPhase
  expeditionName: string
  quantity: number
}

export interface ItemUseCases {
  questsRequired: QuestUseCase[]
  questsRewarded: QuestUseCase[]
  craftingRecipes: CraftingUseCase[]
  hideoutUpgrades: HideoutUseCase[]
  expeditionPhases: ExpeditionUseCase[]
}

/**
 * Normalize item ID for comparison
 * Handles different ID formats (slug, API ID, etc.)
 */
const normalizeItemId = (id: string | number | undefined | null): string | null => {
  if (id === null || id === undefined) return null
  // Convert to string if it's a number
  const stringId = typeof id === 'string' ? id : String(id)
  return stringId.toLowerCase().trim()
}

/**
 * Check if an item ID matches (handles various formats)
 */
const itemIdMatches = (itemId: string | number | undefined | null, targetId: string | number | undefined | null): boolean => {
  const normalizedItemId = normalizeItemId(itemId)
  const normalizedTargetId = normalizeItemId(targetId)
  
  if (!normalizedItemId || !normalizedTargetId) return false
  
  // Exact match
  if (normalizedItemId === normalizedTargetId) return true
  
  // Also check if one is a slug version of the other
  const slugItemId = normalizedItemId.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const slugTargetId = normalizedTargetId.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  return slugItemId === slugTargetId || normalizedItemId === slugTargetId || slugItemId === normalizedTargetId
}

/**
 * Extract item ID from various data structures
 */
const extractItemId = (item: any): string | number | null => {
  if (!item) return null
  
  // Try various ID fields
  if (item.item_id !== undefined && item.item_id !== null) return item.item_id
  if (item.id !== undefined && item.id !== null) return item.id
  if (item.item && typeof item.item === 'string') return item.item
  if (item.item && typeof item.item === 'object' && item.item.id !== undefined && item.item.id !== null) return item.item.id
  if (item.item && typeof item.item === 'object' && item.item.item_id !== undefined && item.item.item_id !== null) return item.item.item_id
  
  // Try name as fallback (will need normalization)
  if (item.name) return item.name
  
  return null
}

/**
 * Hook to find all use cases for a specific item
 */
export const useItemUseCases = (itemId: string | undefined): ItemUseCases => {
  // Fetch all data sources
  const { data: questsResponse } = useQuests({ limit: 1000 })
  const { data: itemsResponse } = useItems({ fetchAll: true })
  const { data: recipesResponse } = useRecipes({ limit: 1000 })
  const { data: workbenchesWithLevels } = useHideoutWorkbenchesWithLevels()
  const { data: expeditionWithPhases } = useExpeditionWithPhases()
  
  const quests = questsResponse?.data || []
  const allItems = itemsResponse?.data || []
  const recipes = Array.isArray(recipesResponse) 
    ? recipesResponse 
    : (recipesResponse?.data || [])
  
  return useMemo(() => {
    if (!itemId) {
      return {
        questsRequired: [],
        questsRewarded: [],
        craftingRecipes: [],
        hideoutUpgrades: [],
        expeditionPhases: [],
      }
    }
    
    const normalizedItemId = normalizeItemId(itemId)
    if (!normalizedItemId) {
      return {
        questsRequired: [],
        questsRewarded: [],
        craftingRecipes: [],
        hideoutUpgrades: [],
        expeditionPhases: [],
      }
    }
    
    // 1. Find quests that require this item
    const questsRequired: QuestUseCase[] = []
    quests.forEach((quest) => {
      // Check required_items array
      if (quest.required_items && Array.isArray(quest.required_items)) {
        quest.required_items.forEach((reqItem: any) => {
          const reqItemId = extractItemId(reqItem)
          if (reqItemId && itemIdMatches(reqItemId, itemId)) {
            const quantity = reqItem.quantity || reqItem.count || 1
            questsRequired.push({
              quest,
              quantity: typeof quantity === 'string' ? parseInt(quantity, 10) || 1 : quantity,
              type: 'required',
            })
          }
        })
      }
      
      // Also check requires_items (alternative field name)
      if (quest.requires_items && Array.isArray(quest.requires_items)) {
        quest.requires_items.forEach((reqItem: any) => {
          const reqItemId = extractItemId(reqItem)
          if (reqItemId && itemIdMatches(reqItemId, itemId)) {
            const quantity = reqItem.quantity || reqItem.count || 1
            // Avoid duplicates
            if (!questsRequired.find(q => q.quest.id === quest.id)) {
              questsRequired.push({
                quest,
                quantity: typeof quantity === 'string' ? parseInt(quantity, 10) || 1 : quantity,
                type: 'required',
              })
            }
          }
        })
      }
    })
    
    // 2. Find quests that reward this item
    const questsRewarded: QuestUseCase[] = []
    quests.forEach((quest) => {
      if (quest.rewards && Array.isArray(quest.rewards)) {
        quest.rewards.forEach((reward: any) => {
          if (typeof reward === 'object') {
            const rewardItemId = extractItemId(reward)
            if (rewardItemId && itemIdMatches(rewardItemId, itemId)) {
              const quantity = reward.quantity || 1
              questsRewarded.push({
                quest,
                quantity: typeof quantity === 'string' ? parseInt(quantity, 10) || 1 : quantity,
                type: 'rewarded',
              })
            }
          }
        })
      }
    })
    
    // 3. Find crafting recipes that use this item
    const craftingRecipes: CraftingUseCase[] = []
    
    // Check all items for crafting components
    allItems.forEach((item) => {
      if (!item.id || item.id === itemId) return // Skip self
      
      // Check components array
      if (item.components && Array.isArray(item.components)) {
        item.components.forEach((comp: any) => {
          const compItemId = extractItemId(comp)
          if (compItemId && itemIdMatches(compItemId, itemId)) {
            const quantity = comp.quantity || comp.count || 1
            craftingRecipes.push({
              item,
              quantity: typeof quantity === 'string' ? parseInt(quantity, 10) || 1 : quantity,
            })
          }
        })
      }
      
      // Check crafting.requires array
      if (item.crafting?.requires && Array.isArray(item.crafting.requires)) {
        item.crafting.requires.forEach((req: any) => {
          const reqItemId = extractItemId(req)
          if (reqItemId && itemIdMatches(reqItemId, itemId)) {
            const quantity = req.count || req.quantity || 1
            // Avoid duplicates
            if (!craftingRecipes.find(c => c.item.id === item.id)) {
              craftingRecipes.push({
                item,
                quantity: typeof quantity === 'string' ? parseInt(quantity, 10) || 1 : quantity,
              })
            }
          }
        })
      }
    })
    
    // Check recipes array
    recipes.forEach((recipe: any) => {
      if (!recipe.id || recipe.id === itemId) return // Skip self
      
      // Check requires array
      if (recipe.requires && Array.isArray(recipe.requires)) {
        recipe.requires.forEach((req: any) => {
          const reqItemId = req.item || req.item_id || req.id
          if (reqItemId && itemIdMatches(reqItemId, itemId)) {
            const quantity = req.count || req.quantity || 1
            // Avoid duplicates
            if (!craftingRecipes.find(c => c.item.id === recipe.id)) {
              craftingRecipes.push({
                item: recipe,
                quantity: typeof quantity === 'string' ? parseInt(quantity, 10) || 1 : quantity,
              })
            }
          }
        })
      }
      
      // Check components array
      if (recipe.components && Array.isArray(recipe.components)) {
        recipe.components.forEach((comp: any) => {
          const compItemId = extractItemId(comp)
          if (compItemId && itemIdMatches(compItemId, itemId)) {
            const quantity = comp.quantity || comp.count || 1
            // Avoid duplicates
            if (!craftingRecipes.find(c => c.item.id === recipe.id)) {
              craftingRecipes.push({
                item: recipe,
                quantity: typeof quantity === 'string' ? parseInt(quantity, 10) || 1 : quantity,
              })
            }
          }
        })
      }
    })
    
    // 4. Find hideout upgrades that require this item
    const hideoutUpgrades: HideoutUseCase[] = []
    if (workbenchesWithLevels) {
      workbenchesWithLevels.forEach((workbench) => {
        if (workbench.levels && Array.isArray(workbench.levels)) {
          workbench.levels.forEach((level) => {
            if (level.requirements && Array.isArray(level.requirements)) {
              level.requirements.forEach((req: any) => {
                const reqItemId = req.item_id || req.item || req.id
                if (reqItemId && itemIdMatches(reqItemId, itemId)) {
                  const quantity = req.quantity || req.count || 1
                  hideoutUpgrades.push({
                    workbench,
                    level,
                    quantity: typeof quantity === 'number' ? quantity : parseInt(quantity, 10) || 1,
                  })
                }
              })
            }
          })
        }
      })
    }
    
    // 5. Find expedition phases that require this item
    const expeditionPhases: ExpeditionUseCase[] = []
    if (expeditionWithPhases && expeditionWithPhases.phases) {
      const expeditionName = expeditionWithPhases.name || 'Expedition'
      expeditionWithPhases.phases.forEach((phase) => {
        if (phase.requirements && Array.isArray(phase.requirements)) {
          phase.requirements.forEach((req: any) => {
            const reqItemId = req.item_id || req.item || req.id
            if (reqItemId && itemIdMatches(reqItemId, itemId)) {
              const quantity = req.quantity || req.count || 1
              expeditionPhases.push({
                phase,
                expeditionName,
                quantity: typeof quantity === 'number' ? quantity : parseInt(quantity, 10) || 1,
              })
            }
          })
        }
      })
    }
    
    return {
      questsRequired,
      questsRewarded,
      craftingRecipes,
      hideoutUpgrades,
      expeditionPhases,
    }
  }, [itemId, quests, allItems, recipes, workbenchesWithLevels, expeditionWithPhases])
}

