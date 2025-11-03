/**
 * Custom hooks to merge Supabase custom data with Forge API data
 * 
 * These hooks combine data from the API with custom enhancements from Supabase
 */

import { useMemo } from 'react'
import { useCustomItemByItemId, useCustomQuestByQuestId } from './useSupabase'
import type { ArcRaidersItem, ArcRaidersQuest } from './useArcRaidersApi'
import type { CustomItem, CustomQuest } from '@/lib/supabase'

/**
 * Merges API item data with custom Supabase data
 * Custom data takes priority for fields that overlap
 */
export interface EnhancedItem extends ArcRaidersItem {
  // Custom fields from Supabase
  customData?: CustomItem
  customName?: string
  customDescription?: string
  customImage?: string
  tips?: string
  locationsFound?: string[]
  bestUseCases?: string[]
  metaRating?: number
  metaNotes?: string
  customTags?: string[]
}

/**
 * Hook to get an item with merged custom data
 * @param item - Item from the API
 * @returns Item with custom data merged in
 */
export const useMergedItem = (item?: ArcRaidersItem): EnhancedItem | undefined => {
  const { data: customData } = useCustomItemByItemId(item?.id)

  return useMemo(() => {
    if (!item) return undefined

    const enhanced: EnhancedItem = {
      ...item,
      customData,
      // Override with custom fields if available
      name: customData?.custom_name || item.name,
      description: customData?.custom_description || item.description,
      customName: customData?.custom_name,
      customDescription: customData?.custom_description,
      customImage: customData?.custom_image,
      tips: customData?.tips,
      locationsFound: customData?.locations_found,
      bestUseCases: customData?.best_use_cases,
      metaRating: customData?.meta_rating,
      metaNotes: customData?.meta_notes,
      customTags: customData?.tags,
    }

    // If there's a custom image, use it as primary
    if (customData?.custom_image) {
      enhanced.image = customData.custom_image
      enhanced.imageUrl = customData.custom_image
    }

    return enhanced
  }, [item, customData])
}

/**
 * Hook to merge multiple items with their custom data
 * @param items - Array of items from the API
 * @returns Array of enhanced items with custom data
 */
export const useMergedItems = (items?: ArcRaidersItem[]): EnhancedItem[] => {
  // Note: This doesn't fetch all custom data at once for performance
  // Each item's custom data is fetched on-demand
  // For a list view, you might want to fetch all custom data first
  return useMemo(() => {
    if (!items) return []
    return items.map((item) => ({ ...item } as EnhancedItem))
  }, [items])
}

/**
 * Merges API quest data with custom Supabase data
 */
export interface EnhancedQuest extends ArcRaidersQuest {
  // Custom fields from Supabase
  customData?: CustomQuest
  customName?: string
  customDescription?: string
  walkthrough?: string
  tips?: string
  hiddenObjectives?: string[]
  optimalRoute?: string
  timeEstimate?: string
  difficultyRating?: number
  videoGuideUrl?: string
  mapMarkers?: Array<{
    x: number
    y: number
    label: string
    icon?: string
  }>
  customTags?: string[]
}

/**
 * Hook to get a quest with merged custom data
 * @param quest - Quest from the API
 * @returns Quest with custom data merged in
 */
export const useMergedQuest = (quest?: ArcRaidersQuest): EnhancedQuest | undefined => {
  const { data: customData } = useCustomQuestByQuestId(quest?.id)

  return useMemo(() => {
    if (!quest) return undefined

    const enhanced: EnhancedQuest = {
      ...quest,
      customData,
      // Override with custom fields if available
      name: customData?.custom_name || quest.name,
      description: customData?.custom_description || quest.description,
      customName: customData?.custom_name,
      customDescription: customData?.custom_description,
      walkthrough: customData?.walkthrough,
      tips: customData?.tips,
      hiddenObjectives: customData?.hidden_objectives,
      optimalRoute: customData?.optimal_route,
      timeEstimate: customData?.time_estimate,
      difficultyRating: customData?.difficulty_rating,
      videoGuideUrl: customData?.video_guide_url,
      mapMarkers: customData?.map_markers as any,
      customTags: customData?.tags,
    }

    return enhanced
  }, [quest, customData])
}

/**
 * Hook to check if custom data exists for an item
 * Useful for showing indicators or badges on items with community enhancements
 */
export const useHasCustomData = (
  type: 'item' | 'quest' | 'trader',
  id?: string
): boolean => {
  const { data: itemData } = useCustomItemByItemId(type === 'item' ? id : undefined)
  const { data: questData } = useCustomQuestByQuestId(type === 'quest' ? id : undefined)

  return useMemo(() => {
    if (type === 'item') return !!itemData
    if (type === 'quest') return !!questData
    return false
  }, [type, itemData, questData])
}

/**
 * Helper function to check if an item has community enhancements
 * Can be used to show badges like "Community Enhanced" or "Has Tips"
 */
export const getEnhancementBadges = (customData?: CustomItem | CustomQuest): string[] => {
  const badges: string[] = []

  if (!customData) return badges

  if ('tips' in customData && customData.tips) {
    badges.push('Has Tips')
  }

  if ('walkthrough' in customData && customData.walkthrough) {
    badges.push('Has Guide')
  }

  if ('meta_rating' in customData && customData.meta_rating && customData.meta_rating >= 4) {
    badges.push('Highly Rated')
  }

  if ('video_guide_url' in customData && customData.video_guide_url) {
    badges.push('Video Guide')
  }

  if ('locations_found' in customData && customData.locations_found && customData.locations_found.length > 0) {
    badges.push('Locations Known')
  }

  return badges
}

