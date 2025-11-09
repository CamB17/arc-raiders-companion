import { useMemo } from 'react'
import { useQuests, useRecipes } from './useArcRaidersApi'
import { useHideoutWorkbenchesWithLevels, useExpeditionWithPhases } from './useSupabase'

/**
 * Determines which flags should be automatically set for an item
 * based on how it's used throughout the game
 */
export const useAutoFlags = (itemId: string | undefined) => {
  const { data: questsResponse } = useQuests()
  const { data: recipesResponse } = useRecipes()
  const { data: workbenchesWithLevels } = useHideoutWorkbenchesWithLevels()
  const { data: expeditionWithPhases } = useExpeditionWithPhases()
  
  const quests = questsResponse?.data || []
  const recipes = Array.isArray(recipesResponse) ? recipesResponse : (recipesResponse?.data || [])
  
  return useMemo(() => {
    if (!itemId) {
      return {
        flags: [] as string[],
        reasons: {} as Record<string, string[]>,
      }
    }
    
    const flags = new Set<string>()
    const reasons: Record<string, string[]> = {}
    
    const normalizedItemId = itemId.toLowerCase().trim()
    
    // Helper to check if an item ID matches
    const itemMatches = (id: any): boolean => {
      if (!id) return false
      const normalized = String(id).toLowerCase().trim()
      if (normalized === normalizedItemId) return true
      
      // Check slug versions
      const slugged = normalized.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const sluggedTarget = normalizedItemId.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      return slugged === sluggedTarget
    }
    
    // Check quests - required items or rewards
    for (const quest of quests) {
      // Check objectives for required items
      if (quest.objectives) {
        for (const objective of quest.objectives) {
          if (objective.type === 'find_item' || objective.type === 'collect') {
            const targetItem = objective.target_item || objective.item || objective.target
            if (targetItem) {
              const targetId = typeof targetItem === 'object' ? targetItem.id : targetItem
              if (itemMatches(targetId)) {
                flags.add('quest_item')
                if (!reasons.quest_item) reasons.quest_item = []
                reasons.quest_item.push(`Required for quest: ${quest.name}`)
              }
            }
          }
        }
      }
      
      // Check rewards
      if (quest.rewards) {
        const rewardItems = quest.rewards.items || []
        for (const rewardItem of rewardItems) {
          const rewardId = typeof rewardItem === 'object' ? (rewardItem.item_id || rewardItem.id || rewardItem.item) : rewardItem
          if (itemMatches(rewardId)) {
            flags.add('quest_item')
            if (!reasons.quest_item) reasons.quest_item = []
            reasons.quest_item.push(`Rewarded by quest: ${quest.name}`)
          }
        }
      }
    }
    
    // Check crafting recipes
    for (const recipe of recipes) {
      if (recipe.components) {
        for (const component of recipe.components) {
          const componentId = typeof component === 'object' ? (component.item_id || component.id || component.item) : component
          if (itemMatches(componentId)) {
            flags.add('crafting_item')
            if (!reasons.crafting_item) reasons.crafting_item = []
            const craftedItemName = typeof recipe.result === 'object' ? recipe.result.name : recipe.item?.name || 'Unknown'
            reasons.crafting_item.push(`Used to craft: ${craftedItemName}`)
          }
        }
      }
    }
    
    // Check hideout workbenches
    if (workbenchesWithLevels) {
      for (const workbench of workbenchesWithLevels) {
        if (workbench.levels) {
          for (const level of workbench.levels) {
            const requirements = level.requirements || []
            for (const req of requirements) {
              if (itemMatches(req.item_id)) {
                flags.add('hideout_item')
                if (!reasons.hideout_item) reasons.hideout_item = []
                reasons.hideout_item.push(`${workbench.name} - Level ${level.level_number}`)
              }
            }
          }
        }
      }
    }
    
    // Check expedition phases
    if (expeditionWithPhases?.phases) {
      for (const phase of expeditionWithPhases.phases) {
        const requirements = phase.requirements || []
        for (const req of requirements) {
          if (itemMatches(req.item_id)) {
            flags.add('project_item')
            if (!reasons.project_item) reasons.project_item = []
            const phaseName = phase.phase_name || `Phase ${phase.phase_number}`
            reasons.project_item.push(`${expeditionWithPhases.name || 'Expedition'} - ${phaseName}`)
          }
        }
      }
    }
    
    return {
      flags: Array.from(flags),
      reasons,
    }
  }, [itemId, quests, recipes, workbenchesWithLevels, expeditionWithPhases])
}

/**
 * Bulk auto-flag operation - analyzes all items and returns suggested flags
 */
export const useAutoFlagsForAllItems = () => {
  const { data: questsResponse } = useQuests()
  const { data: recipesResponse } = useRecipes()
  const { data: workbenchesWithLevels } = useHideoutWorkbenchesWithLevels()
  const { data: expeditionWithPhases } = useExpeditionWithPhases()
  
  const quests = questsResponse?.data || []
  const recipes = Array.isArray(recipesResponse) ? recipesResponse : (recipesResponse?.data || [])
  
  return useMemo(() => {
    const itemFlagsMap = new Map<string, Set<string>>()
    
    const normalizeId = (id: any): string | null => {
      if (!id) return null
      return String(id).toLowerCase().trim()
    }
    
    const addFlag = (itemId: any, flag: string) => {
      const normalized = normalizeId(itemId)
      if (!normalized) return
      
      if (!itemFlagsMap.has(normalized)) {
        itemFlagsMap.set(normalized, new Set())
      }
      itemFlagsMap.get(normalized)!.add(flag)
    }
    
    // Process quests
    for (const quest of quests) {
      if (quest.objectives) {
        for (const objective of quest.objectives) {
          if (objective.type === 'find_item' || objective.type === 'collect') {
            const targetItem = objective.target_item || objective.item || objective.target
            if (targetItem) {
              const targetId = typeof targetItem === 'object' ? targetItem.id : targetItem
              addFlag(targetId, 'quest_item')
            }
          }
        }
      }
      
      if (quest.rewards?.items) {
        for (const rewardItem of quest.rewards.items) {
          const rewardId = typeof rewardItem === 'object' ? (rewardItem.item_id || rewardItem.id || rewardItem.item) : rewardItem
          addFlag(rewardId, 'quest_item')
        }
      }
    }
    
    // Process crafting
    for (const recipe of recipes) {
      if (recipe.components) {
        for (const component of recipe.components) {
          const componentId = typeof component === 'object' ? (component.item_id || component.id || component.item) : component
          addFlag(componentId, 'crafting_item')
        }
      }
    }
    
    // Process hideout
    if (workbenchesWithLevels) {
      for (const workbench of workbenchesWithLevels) {
        if (workbench.levels) {
          for (const level of workbench.levels) {
            const requirements = level.requirements || []
            for (const req of requirements) {
              addFlag(req.item_id, 'hideout_item')
            }
          }
        }
      }
    }
    
    // Process expedition
    if (expeditionWithPhases?.phases) {
      for (const phase of expeditionWithPhases.phases) {
        const requirements = phase.requirements || []
        for (const req of requirements) {
          addFlag(req.item_id, 'project_item')
        }
      }
    }
    
    // Convert to plain object
    const result: Record<string, string[]> = {}
    itemFlagsMap.forEach((flags, itemId) => {
      result[itemId] = Array.from(flags)
    })
    
    return result
  }, [quests, recipes, workbenchesWithLevels, expeditionWithPhases])
}

