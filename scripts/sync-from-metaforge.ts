#!/usr/bin/env node
/**
 * Sync script to import all Metaforge data into Supabase
 * 
 * Usage:
 *   npm run sync
 * 
 * Or:
 *   node scripts/sync-from-metaforge.js
 */

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const METAFORGE_BASE_URL = 'https://metaforge.app/api/arc-raiders';

async function syncItems() {
  console.log('🔄 Syncing items...');
  
  let page = 1;
  let totalSynced = 0;
  
  while (true) {
    try {
      const response = await axios.get(`${METAFORGE_BASE_URL}/items`, {
        params: {
          page,
          limit: 1000,
          includeComponents: true,
        },
        timeout: 30000,
      });
      
      const items = response.data.data || [];
      if (items.length === 0) break;
      
      // Prepare items for upsert
      // First, check which items are manually updated
      const manuallyUpdatedIds = new Set<string>()
      if (items.length > 0) {
        const { data: existingItems } = await supabase
          .from('items')
          .select('id, manually_updated')
          .in('id', items.map(i => i.id))
          .eq('manually_updated', true)
        
        existingItems?.forEach(item => manuallyUpdatedIds.add(item.id))
      }
      
      const itemsToUpsert = items
        .filter(item => !manuallyUpdatedIds.has(item.id)) // Skip manually updated items
        .map(item => ({
        id: item.id,
        name: item.name,
        rarity: item.rarity,
        description: item.description,
        category: item.category,
        subcategory: item.subcategory,
        item_type: item.item_type,
        loadout_slots: item.loadout_slots,
        icon: item.icon,
        image: item.image,
        image_url: item.imageUrl || item.image_url,
        thumbnail: item.thumbnail,
        stat_block: item.stat_block || item.stats || {},
        weight: item.weight || item.stat_block?.weight,
        stack_size: item.stackSize || item.stack_size || item.stat_block?.stackSize,
        value: item.value,
        recycle_value: item.recycleValue || item.recycle_value,
        raider_coins: item.raider_coins,
        recycle_breakdown: item.recycle_breakdown || item.recycleBreakdown || [],
        components: item.components || [],
        crafting: item.crafting || {},
        workbench: item.workbench,
        dropped_by: item.dropped_by || item.loot_source || [],
        traders: item.traders || [],
        metadata: item,
        synced_at: new Date().toISOString(),
      }));
      
      // Batch upsert (Supabase supports up to 1000 rows per request)
      const batchSize = 100;
      for (let i = 0; i < itemsToUpsert.length; i += batchSize) {
        const batch = itemsToUpsert.slice(i, i + batchSize);
        const { error } = await supabase
          .from('items')
          .upsert(batch, {
            onConflict: 'id',
          });
        
        if (error) {
          console.error(`Error syncing items batch ${i / batchSize + 1}:`, error);
        }
      }
      
      const syncedCount = itemsToUpsert.length;
      const skippedCount = items.length - syncedCount;
      totalSynced += syncedCount;
      
      if (skippedCount > 0) {
        console.log(`✅ Synced ${syncedCount} items, skipped ${skippedCount} manually updated (page ${page})`);
      } else {
        console.log(`✅ Synced ${syncedCount} items (page ${page})`);
      }
      
      if (!response.data.pagination?.hasNextPage) break;
      page++;
      
      // Rate limiting - wait 1 second between pages
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`Error fetching items page ${page}:`, error.message);
      if (error.response?.status === 404) break;
      throw error;
    }
  }
  
  console.log(`✅ Items sync complete: ${totalSynced} items`);
  return totalSynced;
}

async function syncQuests() {
  console.log('🔄 Syncing quests...');
  
  let page = 1;
  let totalSynced = 0;
  
  while (true) {
    try {
      const response = await axios.get(`${METAFORGE_BASE_URL}/quests`, {
        params: {
          page,
          limit: 100,
          includeDetails: true,
        },
        timeout: 30000,
      });
      
      const quests = response.data.data || [];
      if (quests.length === 0) break;
      
      // Check which quests are manually updated
      const manuallyUpdatedQuestIds = new Set<string>()
      if (quests.length > 0) {
        const { data: existingQuests } = await supabase
          .from('quests')
          .select('id, manually_updated')
          .in('id', quests.map(q => q.id))
          .eq('manually_updated', true)
        
        existingQuests?.forEach(quest => manuallyUpdatedQuestIds.add(quest.id))
      }
      
      const questsToUpsert = quests
        .filter(quest => !manuallyUpdatedQuestIds.has(quest.id))
        .map(quest => ({
        id: quest.id,
        name: quest.name,
        description: quest.description,
        type: quest.type,
        difficulty: quest.difficulty,
        region: quest.region,
        location: quest.location,
        category: quest.category,
        map_x: quest.map_x || quest.x,
        map_y: quest.map_y || quest.y,
        map_x_percent: quest.map_x_percent,
        map_y_percent: quest.map_y_percent,
        icon: quest.icon,
        image: quest.image,
        image_url: quest.imageUrl || quest.image_url,
        thumbnail: quest.thumbnail,
        xp: quest.xp || quest.experience || quest.exp,
        objectives: quest.objectives || [],
        rewards: quest.rewards || quest.granted_items || [],
        duration: quest.duration,
        recommended_level: quest.recommended_level,
        required_level: quest.required_level,
        max_players: quest.max_players,
        min_players: quest.min_players,
        quest_chain: quest.quest_chain,
        chain_position: quest.chain_position,
        previous_quest: quest.previous_quest,
        next_quest: quest.next_quest,
        prerequisites: quest.prerequisites || [],
        unlocks: quest.unlocks || [],
        trader: quest.trader || quest.giver || quest.provider || null,
        giver: quest.giver || quest.trader || quest.provider || null,
        provider: quest.provider || quest.trader || quest.giver || null,
        metadata: quest,
        synced_at: new Date().toISOString(),
      }));
      
      const batchSize = 100;
      for (let i = 0; i < questsToUpsert.length; i += batchSize) {
        const batch = questsToUpsert.slice(i, i + batchSize);
        const { error } = await supabase
          .from('quests')
          .upsert(batch, {
            onConflict: 'id',
          });
        
        if (error) {
          console.error(`Error syncing quests batch ${i / batchSize + 1}:`, error);
        }
      }
      
      const syncedCount = questsToUpsert.length;
      const skippedCount = quests.length - syncedCount;
      totalSynced += syncedCount;
      
      if (skippedCount > 0) {
        console.log(`✅ Synced ${syncedCount} quests, skipped ${skippedCount} manually updated (page ${page})`);
      } else {
        console.log(`✅ Synced ${syncedCount} quests (page ${page})`);
      }
      
      if (!response.data.pagination?.hasNextPage) break;
      page++;
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      console.error(`Error fetching quests page ${page}:`, error.message);
      if (error.response?.status === 404) break;
      throw error;
    }
  }
  
  console.log(`✅ Quests sync complete: ${totalSynced} quests`);
  return totalSynced;
}

async function syncTraders() {
  console.log('🔄 Syncing traders...');
  
  try {
    const response = await axios.get(`${METAFORGE_BASE_URL}/traders`, {
      timeout: 30000,
    });
    
    const tradersData = response.data.data || {};
    
    // Check which traders are manually updated
    const { data: existingTraders } = await supabase
      .from('traders')
      .select('id, manually_updated')
      .eq('manually_updated', true)
    
    const manuallyUpdatedTraderIds = new Set(existingTraders?.map(t => t.id) || [])
    
    const tradersArray = Object.entries(tradersData)
      .filter(([traderName]) => {
        const traderId = traderName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return !manuallyUpdatedTraderIds.has(traderId);
      })
      .map(([traderName, items]) => {
        const traderId = traderName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        return {
          id: traderId,
          name: traderName,
          items: Array.isArray(items) ? items : [],
          sells: Array.isArray(items) ? items : [],
          metadata: { items },
          synced_at: new Date().toISOString(),
        };
      });
    
    const skippedCount = Object.keys(tradersData).length - tradersArray.length;
    
    if (tradersArray.length > 0) {
      const { error } = await supabase
        .from('traders')
        .upsert(tradersArray, {
          onConflict: 'id',
        });
      
      if (error) {
        console.error(`Error syncing traders:`, error);
        throw error;
      }
    }
    
    if (skippedCount > 0) {
      console.log(`✅ Traders sync complete: ${tradersArray.length} traders synced, ${skippedCount} manually updated skipped`);
    } else {
      console.log(`✅ Traders sync complete: ${tradersArray.length} traders`);
    }
    return tradersArray.length;
  } catch (error: any) {
    console.error(`Error syncing traders:`, error.message);
    throw error;
  }
}

async function syncArcs() {
  console.log('🔄 Syncing arcs...');
  
  let page = 1;
  let totalSynced = 0;
  
  // Try different endpoint names
  const endpoints = ['arcs', 'enemies', 'arc'];
  
  for (const endpoint of endpoints) {
    try {
      page = 1;
      totalSynced = 0;
      
      while (true) {
        const response = await axios.get(`${METAFORGE_BASE_URL}/${endpoint}`, {
          params: {
            page,
            limit: 100,
          },
          timeout: 30000,
        });
        
        const arcs = response.data.data || [];
        if (arcs.length === 0) break;
        
        // Check which arcs are manually updated
      const manuallyUpdatedArcIds = new Set<string>()
      if (arcs.length > 0) {
        const { data: existingArcs } = await supabase
          .from('arcs')
          .select('id, manually_updated')
          .in('id', arcs.map(a => a.id))
          .eq('manually_updated', true)
        
        existingArcs?.forEach(arc => manuallyUpdatedArcIds.add(arc.id))
      }
      
      const arcsToUpsert = arcs
        .filter(arc => !manuallyUpdatedArcIds.has(arc.id))
        .map(arc => ({
          id: arc.id,
          name: arc.name,
          description: arc.description,
          type: arc.type,
          difficulty: arc.difficulty,
          location: arc.location,
          icon: arc.icon,
          image: arc.image,
          image_url: arc.imageUrl || arc.image_url,
          thumbnail: arc.thumbnail,
          drops: arc.drops || arc.loot || [],
          loot: arc.loot || arc.drops || [],
          health: arc.health,
          armor: arc.armor,
          shield: arc.shield,
          weak_points: arc.weak_points || [],
          metadata: arc,
          synced_at: new Date().toISOString(),
        }));
        
        const batchSize = 100;
        for (let i = 0; i < arcsToUpsert.length; i += batchSize) {
          const batch = arcsToUpsert.slice(i, i + batchSize);
          const { error } = await supabase
            .from('arcs')
            .upsert(batch, {
              onConflict: 'id',
            });
          
          if (error) {
            console.error(`Error syncing arcs batch ${i / batchSize + 1}:`, error);
          }
        }
        
      const syncedCount = arcsToUpsert.length;
      const skippedCount = arcs.length - syncedCount;
      totalSynced += syncedCount;
      
      if (skippedCount > 0) {
        console.log(`✅ Synced ${syncedCount} arcs, skipped ${skippedCount} manually updated (page ${page}) from ${endpoint}`);
      } else {
        console.log(`✅ Synced ${syncedCount} arcs (page ${page}) from ${endpoint}`);
      }
        
        if (!response.data.pagination?.hasNextPage) break;
        page++;
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // If we got data from this endpoint, break
      if (totalSynced > 0) break;
      
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Try next endpoint
        continue;
      }
      console.error(`Error fetching arcs from ${endpoint}:`, error.message);
      // Continue to next endpoint
    }
  }
  
  console.log(`✅ Arcs sync complete: ${totalSynced} arcs`);
  return totalSynced;
}

async function syncRecipes() {
  console.log('🔄 Syncing recipes...');
  
  try {
    // Try recipes endpoint first
    const response = await axios.get(`${METAFORGE_BASE_URL}/recipes`, {
      timeout: 30000,
    });
    
    const recipes = response.data.data || response.data || [];
    if (!Array.isArray(recipes)) {
      console.log('⚠️  Recipes endpoint returned non-array data, skipping...');
      return 0;
    }
    
    const recipesToUpsert = recipes.map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      output: recipe.output,
      output_item_id: recipe.output,
      requires: recipe.requires || [],
      workbench: recipe.workbench,
      metadata: recipe,
      synced_at: new Date().toISOString(),
    }));
    
    if (recipesToUpsert.length > 0) {
      const { error } = await supabase
        .from('recipes')
        .upsert(recipesToUpsert, {
          onConflict: 'id',
        });
      
      if (error) {
        console.error(`Error syncing recipes:`, error);
        throw error;
      }
    }
    
    console.log(`✅ Recipes sync complete: ${recipesToUpsert.length} recipes`);
    return recipesToUpsert.length;
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log('⚠️  Recipes endpoint not found, skipping...');
      return 0;
    }
    console.error(`Error syncing recipes:`, error.message);
    return 0;
  }
}

async function syncAll() {
  const startTime = Date.now();
  console.log('🚀 Starting full sync from Metaforge...');
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log('');
  
  try {
    const itemCount = await syncItems();
    console.log('');
    
    const questCount = await syncQuests();
    console.log('');
    
    const traderCount = await syncTraders();
    console.log('');
    
    const arcCount = await syncArcs();
    console.log('');
    
    const recipeCount = await syncRecipes();
    console.log('');
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('═══════════════════════════════════════');
    console.log('✅ Full sync complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   Items:   ${itemCount}`);
    console.log(`   Quests:  ${questCount}`);
    console.log(`   Traders: ${traderCount}`);
    console.log(`   Arcs:    ${arcCount}`);
    console.log(`   Recipes: ${recipeCount}`);
    console.log(`   Total:   ${itemCount + questCount + traderCount + arcCount + recipeCount}`);
    console.log(`   Duration: ${duration}s`);
    console.log('═══════════════════════════════════════');
    
  } catch (error: any) {
    console.error('');
    console.error('❌ Sync failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run sync
syncAll();

export { syncAll, syncItems, syncQuests, syncTraders, syncArcs, syncRecipes };

