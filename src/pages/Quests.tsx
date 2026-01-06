import { Link } from 'react-router-dom'
import { useQuests, useTraders, linkQuestsToTraders } from '../hooks/useArcRaidersApi'
import { Target, Award, MapPin, Clock, Users, Star, Package, ArrowRight, Link2, Search, X } from 'lucide-react'
import type { ArcRaidersQuest } from '../hooks/useArcRaidersApi'
import { useState, useMemo } from 'react'

const getDifficultyColor = (difficulty?: string) => {
  const colors: Record<string, string> = {
    common: 'bg-gray-500 text-white',
    uncommon: 'bg-green-600 text-white',
    rare: 'bg-blue-600 text-white',
    epic: 'bg-purple-600 text-white',
    legendary: 'bg-orange-600 text-white',
  }
  
  return colors[difficulty?.toLowerCase() || ''] || 'bg-navy-600 text-white'
}

const getTypeColor = (type?: string) => {
  const colors: Record<string, string> = {
    tutorial: 'bg-green-500 text-white',
    hunt: 'bg-red-500 text-white',
    exploration: 'bg-purple-500 text-white',
    story: 'bg-indigo-500 text-white',
    side: 'bg-yellow-500 text-white',
  }
  
  return colors[type?.toLowerCase() || ''] || 'bg-navy-500 text-white'
}

const formatDuration = (seconds?: number) => {
  if (!seconds) return null
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`
  }
  return `${minutes}m`
}

const Quests = () => {
  const { data: response, isLoading, error } = useQuests()
  const { data: tradersResponse } = useTraders()
  const traders = tradersResponse?.data || []
  
  // Link quests to traders
  const allQuests = response?.data ? linkQuestsToTraders(response.data, traders) : []
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('default')
  
  // Helper function to get quest XP (top-level field from API)
  const getQuestXP = (quest: ArcRaidersQuest): number => {
    // XP is a top-level field on the quest, not in rewards!
    const xp = quest.xp || quest.experience || quest.exp || 0
    return typeof xp === 'number' ? xp : 0
  }
  
  // Helper function to calculate total reward value from items
  const getQuestRewardValue = (quest: ArcRaidersQuest): number => {
    if (!quest.rewards) return 0
    let totalValue = 0
    
    quest.rewards.forEach((reward) => {
      if (typeof reward === 'object') {
        // Parse quantity (API returns it as string)
        const quantity = typeof reward.quantity === 'string' 
          ? parseInt(reward.quantity, 10) || 1
          : (reward.quantity || 1)
        
        // Check if reward has a nested item object with value
        if (typeof reward.item === 'object' && reward.item.value) {
          totalValue += reward.item.value * quantity
        }
        // Fallback to direct value field
        else if (reward.value) {
          totalValue += reward.value * quantity
        }
      }
    })
    
    return totalValue
  }
  
  // Helper function to count total reward items
  const getQuestRewardCount = (quest: ArcRaidersQuest): number => {
    if (!quest.rewards) return 0
    return quest.rewards.length
  }
  
  // Extract unique types and difficulties
  const types = useMemo(() => {
    const uniqueTypes = new Set<string>()
    allQuests.forEach(quest => {
      if (quest.type) uniqueTypes.add(quest.type)
    })
    return Array.from(uniqueTypes).sort()
  }, [allQuests])
  
  const difficulties = useMemo(() => {
    const uniqueDifficulties = new Set<string>()
    allQuests.forEach(quest => {
      if (quest.difficulty) uniqueDifficulties.add(quest.difficulty)
    })
    return Array.from(uniqueDifficulties).sort()
  }, [allQuests])
  
  // Filter and search quests
  const filteredQuests = useMemo(() => {
    return allQuests.filter(quest => {
      // Search filter
      const matchesSearch = !searchQuery || 
        quest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quest.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quest.objectives?.some(obj => {
          const objStr = typeof obj === 'string' ? obj : obj.name || obj.description || ''
          return objStr.toLowerCase().includes(searchQuery.toLowerCase())
        })
      
      // Type filter
      const matchesType = selectedType === 'all' || quest.type === selectedType
      
      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === 'all' || quest.difficulty === selectedDifficulty
      
      return matchesSearch && matchesType && matchesDifficulty
    })
  }, [allQuests, searchQuery, selectedType, selectedDifficulty])
  
  // Sort quests based on selected sort option
  const sortedQuests = useMemo(() => {
    const sorted = [...filteredQuests]
    
    switch (sortBy) {
      case 'xp-high':
        sorted.sort((a, b) => {
          const aXP = getQuestXP(a)
          const bXP = getQuestXP(b)
          return bXP - aXP
        })
        return sorted
      case 'xp-low':
        sorted.sort((a, b) => {
          const aXP = getQuestXP(a)
          const bXP = getQuestXP(b)
          return aXP - bXP
        })
        return sorted
      case 'reward-count-high':
        sorted.sort((a, b) => {
          const aCount = getQuestRewardCount(a)
          const bCount = getQuestRewardCount(b)
          return bCount - aCount
        })
        return sorted
      case 'reward-count-low':
        sorted.sort((a, b) => {
          const aCount = getQuestRewardCount(a)
          const bCount = getQuestRewardCount(b)
          return aCount - bCount
        })
        return sorted
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      default:
        return sorted
    }
  }, [filteredQuests, sortBy])
  
  const hasActiveFilters = selectedType !== 'all' || selectedDifficulty !== 'all' || searchQuery !== '' || sortBy !== 'default'
  
  const clearFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
    setSelectedDifficulty('all')
    setSortBy('default')
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Quests</h2>
          <p className="text-red-600">Unable to fetch quests from the API. Please try again later.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-techno font-bold text-navy-800 mb-3">
            QUESTS
          </h1>
          <p className="text-navy-600 mb-6">
            View all available quests with detailed objectives, rewards, and quest chain information
          </p>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
            <input
              type="text"
              placeholder="Search quests by name, description, or objectives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent text-navy-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-navy-400 hover:text-navy-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-navy-800 bg-white font-medium"
            >
              <option value="default">Default Order</option>
              <option value="xp-high">XP: High to Low</option>
              <option value="xp-low">XP: Low to High</option>
              <option value="reward-count-high">Reward Count: Most to Least</option>
              <option value="reward-count-low">Reward Count: Least to Most</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
            
            {/* Type Filter */}
            {types.length > 0 && (
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-navy-800 bg-white"
              >
                <option value="all">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}
            
            {/* Difficulty Filter */}
            {difficulties.length > 0 && (
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 text-navy-800 bg-white"
              >
                <option value="all">All Difficulties</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            )}
            
            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
          
          {/* Results Count */}
          <div className="flex items-center justify-between text-sm">
            <p className="text-navy-500">
              Showing {sortedQuests.length} of {allQuests.length} quests
              {hasActiveFilters && ' (filtered/sorted)'}
            </p>
          </div>
        </div>
        
        {/* Quests List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-primary-200 p-6 animate-pulse">
                <div className="h-6 bg-primary-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-primary-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-primary-100 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : sortedQuests.length > 0 ? (
          <div className="space-y-3">
            {sortedQuests.map((quest: ArcRaidersQuest) => {
              const questXP = getQuestXP(quest)
              const rewardCount = getQuestRewardCount(quest)
              
              return (
                <Link
                  key={quest.id}
                  to={`/quests/${quest.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg border border-primary-200 hover:border-accent-400 p-6 transition-all hover:shadow-md group">
                    {/* Header with badges */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-xl font-techno font-bold text-navy-800 group-hover:text-accent-600 transition-colors">
                            {quest.name}
                          </h3>
                          {quest.quest_chain && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              {quest.quest_chain}
                              {quest.chain_position && ` #${quest.chain_position}`}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {quest.type && (
                            <span className={`px-2 py-1 text-xs font-bold rounded ${getTypeColor(quest.type)}`}>
                              {quest.type}
                            </span>
                          )}
                          {quest.difficulty && (
                            <span className={`px-2 py-1 text-xs font-bold rounded ${getDifficultyColor(quest.difficulty)}`}>
                              {quest.difficulty}
                            </span>
                          )}
                          {/* XP Badge - Show even if 0 for transparency */}
                          <span className={`px-2 py-1 text-xs font-bold rounded flex items-center gap-1 ${
                            questXP > 0 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <Star className="w-3 h-3" />
                            {questXP.toLocaleString()} XP
                          </span>
                          {/* Reward Count Badge */}
                          {rewardCount > 0 && (
                            <span className="px-2 py-1 text-xs font-bold rounded bg-purple-100 text-purple-700 flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {rewardCount} {rewardCount === 1 ? 'Reward' : 'Rewards'}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-accent-600 transition-colors flex-shrink-0 mt-1" />
                    </div>
                    
                    {quest.description && (
                      <p className="text-navy-600 text-sm leading-relaxed mb-3">
                        {quest.description}
                      </p>
                    )}
                    
                    {/* Compact Metadata */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-navy-600 mb-3">
                      {quest.region && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{quest.region}</span>
                        </div>
                      )}
                      {quest.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{quest.location}</span>
                        </div>
                      )}
                      {quest.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDuration(quest.duration)}</span>
                        </div>
                      )}
                      {(quest.min_players || quest.max_players) && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            {quest.min_players || 1}-{quest.max_players || 4} players
                          </span>
                        </div>
                      )}
                      {quest.recommended_level && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5" />
                          <span>Lv {quest.recommended_level}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Compact Objectives & Rewards Summary */}
                    <div className="flex flex-wrap gap-6 text-xs">
                      {/* Objectives Summary */}
                      {quest.objectives && quest.objectives.length > 0 && (
                        <div className="flex items-center gap-1.5 text-navy-600">
                          <Target className="w-3.5 h-3.5 text-accent-600" />
                          <span className="font-medium">{quest.objectives.length} {quest.objectives.length === 1 ? 'Objective' : 'Objectives'}</span>
                        </div>
                      )}
                      
                      {/* Rewards Summary */}
                      {quest.rewards && quest.rewards.length > 0 && (
                        <div className="flex items-center gap-1.5 text-navy-600">
                          <Award className="w-3.5 h-3.5 text-accent-600" />
                          <span className="font-medium">{quest.rewards.length} {quest.rewards.length === 1 ? 'Reward' : 'Rewards'}</span>
                        </div>
                      )}
                      
                      {/* Quest Chain Navigation */}
                      {(quest.previous_quest || quest.next_quest) && (
                        <div className="flex items-center gap-2">
                          {quest.previous_quest && (
                            <Link 
                              to={`/quests/${quest.previous_quest}`}
                              className="flex items-center gap-1 text-navy-600 hover:text-accent-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                              <span className="font-medium">Prev</span>
                            </Link>
                          )}
                          {quest.previous_quest && quest.next_quest && (
                            <span className="text-navy-400">•</span>
                          )}
                          {quest.next_quest && (
                            <Link 
                              to={`/quests/${quest.next_quest}`}
                              className="flex items-center gap-1 text-navy-600 hover:text-accent-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="font-medium">Next</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      )}
                      
                      {/* Requirements Summary */}
                      {quest.required_level && (
                        <div className="flex items-center gap-1.5 text-navy-600">
                          <Star className="w-3.5 h-3.5 text-red-500" />
                          <span className="font-medium">Req. Lv {quest.required_level}</span>
                        </div>
                      )}
                      
                      {quest.prerequisites && quest.prerequisites.length > 0 && (
                        <div className="flex items-center gap-1.5 text-navy-600">
                          <Target className="w-3.5 h-3.5 text-orange-500" />
                          <span className="font-medium">{quest.prerequisites.length} Prerequisite{quest.prerequisites.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-200 rounded-full mb-4">
              <Target className="w-8 h-8 text-navy-600" />
            </div>
            <p className="text-navy-500 text-lg mb-2">No quests found.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-accent-600 hover:text-accent-700 font-medium"
              >
                Clear filters to see all quests
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Quests

