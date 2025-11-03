import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Database types for custom data
export interface Database {
  public: {
    Tables: {
      custom_items: {
        Row: CustomItem
        Insert: Omit<CustomItem, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CustomItem, 'id' | 'created_at' | 'updated_at'>>
      }
      custom_quests: {
        Row: CustomQuest
        Insert: Omit<CustomQuest, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CustomQuest, 'id' | 'created_at' | 'updated_at'>>
      }
      custom_traders: {
        Row: CustomTrader
        Insert: Omit<CustomTrader, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CustomTrader, 'id' | 'created_at' | 'updated_at'>>
      }
      custom_locations: {
        Row: CustomLocation
        Insert: Omit<CustomLocation, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CustomLocation, 'id' | 'created_at' | 'updated_at'>>
      }
      custom_guides: {
        Row: CustomGuide
        Insert: Omit<CustomGuide, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CustomGuide, 'id' | 'created_at' | 'updated_at'>>
      }
      custom_builds: {
        Row: CustomBuild
        Insert: Omit<CustomBuild, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<CustomBuild, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}

// Custom Item - for additional item details not in API
export interface CustomItem {
  id: string
  item_id: string // Reference to API item ID
  custom_name?: string // Override name
  custom_description?: string // Additional description
  custom_image?: string // Custom image URL
  tips?: string // Usage tips
  locations_found?: string[] // Where to find this item
  best_use_cases?: string[] // Best scenarios to use
  meta_rating?: number // Community rating 1-5
  meta_notes?: string // Meta game notes
  extra_stats?: Record<string, any> // Additional stats
  tags?: string[] // Custom tags
  created_at?: string
  updated_at?: string
}

// Custom Quest - for additional quest details
export interface CustomQuest {
  id: string
  quest_id: string // Reference to API quest ID
  custom_name?: string
  custom_description?: string
  walkthrough?: string // Detailed walkthrough
  tips?: string // Quest tips
  hidden_objectives?: string[] // Objectives not shown in API
  optimal_route?: string // Best route to complete
  time_estimate?: string // How long it takes
  difficulty_rating?: number // Community difficulty 1-5
  video_guide_url?: string // YouTube guide link
  map_markers?: Array<{
    x: number
    y: number
    label: string
    icon?: string
  }>
  tags?: string[]
  created_at?: string
  updated_at?: string
}

// Custom Trader - for additional trader details
export interface CustomTrader {
  id: string
  trader_id: string // Reference to API trader ID
  custom_name?: string
  custom_bio?: string // Trader backstory
  custom_image?: string
  location_details?: string // Exact location in hideout
  trading_tips?: string // Tips for trading
  unlock_requirements?: string // How to unlock
  best_items?: string[] // Best items to buy
  schedule?: string // When they're available
  tags?: string[]
  created_at?: string
  updated_at?: string
}

// Custom Location - for map locations not in API
export interface CustomLocation {
  id: string
  name: string
  description?: string
  location_type: 'loot' | 'trader' | 'quest' | 'landmark' | 'danger' | 'resource' | 'other'
  map_x: number
  map_y: number
  region?: string
  image_url?: string
  tips?: string
  loot_quality?: 'low' | 'medium' | 'high' | 'legendary'
  danger_level?: number // 1-5
  notes?: string
  tags?: string[]
  created_at?: string
  updated_at?: string
}

// Custom Guide - for player-created guides
export interface CustomGuide {
  id: string
  title: string
  category: 'beginner' | 'intermediate' | 'advanced' | 'builds' | 'farming' | 'pvp' | 'other'
  content: string // Markdown content
  author?: string
  excerpt?: string
  image_url?: string
  related_items?: string[] // Item IDs
  related_quests?: string[] // Quest IDs
  views?: number
  likes?: number
  tags?: string[]
  created_at?: string
  updated_at?: string
}

// Custom Build - for loadout builds
export interface CustomBuild {
  id: string
  name: string
  description?: string
  playstyle: 'aggressive' | 'defensive' | 'stealth' | 'support' | 'balanced' | 'other'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  primary_weapon_id?: string
  secondary_weapon_id?: string
  armor_ids?: string[]
  gadget_ids?: string[]
  consumable_ids?: string[]
  pros?: string[]
  cons?: string[]
  gameplay_tips?: string
  author?: string
  rating?: number // 1-5
  votes?: number
  tags?: string[]
  created_at?: string
  updated_at?: string
}

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key')
}
