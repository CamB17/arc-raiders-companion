import { useParams, Link } from 'react-router-dom'
import { useQuest, useTraders, linkQuestsToTraders } from '../hooks/useArcRaidersApi'
import { ArrowLeft, Target, Award, MapPin, Clock, Users, Star, Tag, Package, Lock, Unlock, FileText, CheckCircle, Link2, ArrowRight } from 'lucide-react'
import type { ArcRaidersQuest } from '../hooks/useArcRaidersApi'

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

const QuestDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { data: questRaw, isLoading, error } = useQuest(id || '')
  const { data: tradersResponse } = useTraders()
  const traders = tradersResponse?.data || []
  
  // Link quest to traders
  const quest = questRaw ? linkQuestsToTraders([questRaw], traders)[0] || questRaw : null
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-primary-200 rounded w-1/4 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="h-96 bg-primary-200 rounded-xl"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-48 bg-primary-200 rounded-xl mb-4"></div>
                <div className="h-48 bg-primary-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !quest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/quests" className="inline-flex items-center text-accent-500 hover:text-accent-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quests
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Quest Not Found</h2>
            <p className="text-red-600">The requested quest could not be loaded.</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link 
          to="/quests" 
          className="inline-flex items-center text-accent-500 hover:text-accent-600 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quests
        </Link>
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-navy-600 mb-6">
          <Link to="/" className="hover:text-accent-500">Arc Raiders</Link>
          <span>›</span>
          <Link to="/quests" className="hover:text-accent-500">Quests</Link>
          <span>›</span>
          <span className="text-navy-800 font-medium">{quest.name}</span>
        </div>
        
        {/* Modern Grid Mosaic Layout */}
        <div className="max-w-7xl mx-auto">
          {/* Hero Header - Arc Raiders Cyan Theme */}
          <div className="bg-gradient-to-br from-navy-800 via-navy-700 to-navy-800 rounded-2xl shadow-2xl p-8 mb-6 text-white border-2 border-[#40EDCD]/30">
            <h1 className="text-4xl md:text-5xl font-techno font-bold mb-4 drop-shadow-lg text-[#40EDCD]">
              {quest.name}
            </h1>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quest.type && (
                <span className="px-3 py-1.5 text-sm font-bold rounded-lg bg-[#40EDCD]/20 border border-[#40EDCD]/40 text-[#40EDCD]">
                  {quest.type}
                </span>
              )}
              {quest.difficulty && (
                <span className="px-3 py-1.5 text-sm font-bold rounded-lg bg-[#FAD10B]/20 border border-[#FAD10B]/40 text-[#FAD10B]">
                  {quest.difficulty}
                </span>
              )}
              {quest.quest_chain && (
                <span className="px-3 py-1.5 text-sm font-bold rounded-lg bg-[#FF003C]/20 border border-[#FF003C]/40 text-[#FF003C] flex items-center gap-1">
                  <Link2 className="w-4 h-4" />
                  {quest.quest_chain} {quest.chain_position && `#${quest.chain_position}`}
                </span>
              )}
            </div>
            
            {quest.description && (
              <p className="text-lg text-white/90 leading-relaxed max-w-3xl">
                {quest.description}
              </p>
            )}
          </div>
          
          {/* Stats Cards Grid - Arc Raiders Colors */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* XP Card - Cyan */}
            <div className="bg-transparent rounded-xl p-4 shadow-lg border-2 border-[#40EDCD]">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Star className="w-8 h-8 text-[#40EDCD]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-2xl font-bold text-[#40EDCD]">{(quest.xp || quest.experience || quest.exp || 0).toLocaleString()}</div>
                  <div className="text-xs font-bold text-navy-600 uppercase tracking-wide">XP Reward</div>
                </div>
              </div>
            </div>
            
            {/* Rewards Count Card - Accent Red */}
            {quest.rewards && quest.rewards.length > 0 && (
              <div className="bg-transparent rounded-xl p-4 shadow-lg border-2 border-[#FF003C]">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Package className="w-8 h-8 text-[#FF003C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl font-bold text-[#FF003C]">{quest.rewards.length}</div>
                    <div className="text-xs font-bold text-navy-600 uppercase tracking-wide">
                      {quest.rewards.length === 1 ? 'Reward' : 'Rewards'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Objectives Count Card - Yellow */}
            {quest.objectives && quest.objectives.length > 0 && (
              <div className="bg-transparent rounded-xl p-4 shadow-lg border-2 border-[#FAD10B]">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Target className="w-8 h-8 text-[#FAD10B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl font-bold text-[#FAD10B]">{quest.objectives.length}</div>
                    <div className="text-xs font-bold text-navy-600 uppercase tracking-wide">
                      {quest.objectives.length === 1 ? 'Objective' : 'Objectives'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Level Card - Navy with Cyan accent */}
            {(quest.recommended_level || quest.required_level) && (
              <div className="bg-transparent rounded-xl p-4 shadow-lg border-2 border-navy-600">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Star className="w-8 h-8 text-navy-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl font-bold text-navy-700">
                      {quest.required_level || quest.recommended_level}
                    </div>
                    <div className="text-xs font-bold text-navy-600 uppercase tracking-wide">
                      {quest.required_level ? 'Required Level' : 'Recommended'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Content Grid Mosaic */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Quest Chain Navigation - Arc Raiders Colors */}
            {(quest.previous_quest || quest.next_quest) && (
              <div className="md:col-span-2 bg-gradient-to-r from-navy-50 via-[#40EDCD]/5 to-navy-50 rounded-xl shadow-lg border-2 border-[#40EDCD]/30 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 bg-gradient-to-br from-[#40EDCD] to-[#2BC9B0] rounded-lg">
                    <Link2 className="w-6 h-6 text-navy-900" />
                  </div>
                  <h2 className="text-2xl font-techno font-bold text-navy-800">
                    Quest Chain Navigation
                  </h2>
                </div>
                <div className="flex items-center justify-between gap-4">
                  {quest.previous_quest ? (
                    <Link
                      to={`/quests/${quest.previous_quest}`}
                      className="flex items-center gap-2 px-4 py-3 bg-primary-50 rounded-lg border border-primary-200 hover:bg-primary-100 hover:border-accent-400 transition-colors flex-1"
                    >
                      <ArrowRight className="w-4 h-4 rotate-180 text-navy-600" />
                      <div className="flex-1">
                        <div className="text-xs text-navy-500 uppercase">Previous</div>
                        <div className="text-navy-800 font-medium">Quest #{quest.chain_position && quest.chain_position > 1 ? quest.chain_position - 1 : ''}</div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex-1"></div>
                  )}
                  
                  {quest.next_quest ? (
                    <Link
                      to={`/quests/${quest.next_quest}`}
                      className="flex items-center gap-2 px-4 py-3 bg-primary-50 rounded-lg border border-primary-200 hover:bg-primary-100 hover:border-accent-400 transition-colors flex-1"
                    >
                      <div className="flex-1 text-right">
                        <div className="text-xs text-navy-500 uppercase">Next</div>
                        <div className="text-navy-800 font-medium">Quest #{quest.chain_position ? quest.chain_position + 1 : ''}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-navy-600" />
                    </Link>
                  ) : (
                    <div className="flex-1"></div>
                  )}
                </div>
              </div>
            )}
            
            {/* Objectives */}
            {quest.objectives && quest.objectives.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border-2 border-navy-800 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 bg-gradient-to-br from-[#FAD10B] to-[#E0BC0A] rounded-lg">
                    <Target className="w-6 h-6 text-navy-900" />
                  </div>
                  <h2 className="text-2xl font-techno font-bold text-navy-800">
                    Objectives
                  </h2>
                </div>
                <div className="space-y-3">
                  {quest.objectives.map((objective: any, index: number) => {
                    const isString = typeof objective === 'string'
                    const objName = isString ? objective : (objective.name || objective.description || 'Objective')
                    const objType = !isString ? objective.type : undefined
                    const objTarget = !isString ? objective.target : undefined
                    const objCurrent = !isString ? objective.current : undefined
                    const objCompleted = !isString ? objective.completed : false
                    const hasProgress = objCurrent !== undefined && objTarget !== undefined
                    
                    return (
                      <div 
                        key={index}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          objCompleted 
                            ? 'bg-gradient-to-r from-[#40EDCD]/10 to-[#40EDCD]/20 border-[#40EDCD]/40' 
                            : 'bg-gradient-to-r from-[#FAD10B]/10 to-[#FAD10B]/20 border-[#FAD10B]/30 hover:border-[#FAD10B]/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {objCompleted ? (
                            <CheckCircle className="w-6 h-6 text-[#40EDCD] flex-shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-6 h-6 rounded-full border-3 border-[#FAD10B] flex-shrink-0 mt-0.5 bg-white"></div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-navy-800 font-semibold text-base ${objCompleted ? 'line-through opacity-60' : ''}`}>
                                {objName}
                              </span>
                              {objType && (
                                <span className="px-2 py-1 bg-[#FAD10B]/30 text-navy-800 rounded-md text-xs font-bold uppercase border border-[#FAD10B]/40">
                                  {objType}
                                </span>
                              )}
                            </div>
                            {hasProgress && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-2 text-sm text-navy-700">
                                  <span className="font-medium">Progress</span>
                                  <span className="font-bold">
                                    {objCurrent} / {objTarget}
                                  </span>
                                </div>
                                <div className="w-full bg-[#FAD10B]/20 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-[#FAD10B] to-[#E0BC0A] h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, (objCurrent / objTarget) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Rewards */}
            {quest.rewards && quest.rewards.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border-2 border-navy-800 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 bg-gradient-to-br from-[#40EDCD] to-[#2BC9B0] rounded-lg">
                    <Award className="w-6 h-6 text-navy-900" />
                  </div>
                  <h2 className="text-2xl font-techno font-bold text-navy-800">
                    Rewards
                  </h2>
                </div>
                <div className="grid gap-4">
                  {quest.rewards.map((reward: any, index: number) => {
                    const isString = typeof reward === 'string'
                    // Try multiple field names for reward name - ensure it's always a string
                    let rewardName: string = 'Reward'
                    
                    if (isString) {
                      rewardName = reward
                    } else if (reward && typeof reward === 'object') {
                      // Check all possible name fields
                      rewardName = (
                        reward.name 
                        || reward.item_name 
                        || reward.title
                        || reward.label
                        || reward.display_name
                        || (typeof reward.item === 'string' ? reward.item : null)
                        || (typeof reward.item === 'object' && reward.item?.name)
                        || (typeof reward.item === 'object' && reward.item?.item_name)
                        || reward.item_id
                        || reward.id
                        || 'Reward'
                      )
                      // Ensure it's a string (handle nested objects)
                      if (typeof rewardName !== 'string') {
                        rewardName = String(rewardName) || 'Reward'
                      }
                    }
                    // Parse quantity (API returns string)
                    const rewardQuantity = !isString ? (
                      typeof reward.quantity === 'string' 
                        ? parseInt(reward.quantity, 10) 
                        : (reward.quantity || reward.count || reward.amount || 1)
                    ) : 1
                    const rewardValue = !isString ? (reward.value || reward.price || reward.coins || reward.raider_coins) : null
                    const rewardRarity = !isString ? (reward.rarity || reward.item?.rarity) : null
                    const rewardType = !isString ? (reward.item?.item_type || reward.item_type) : null
                    const rewardImage = !isString ? (
                      reward.icon 
                      || reward.image 
                      || reward.imageUrl 
                      || reward.image_url
                      || reward.thumbnail
                      || reward.item?.icon
                      || reward.item?.image
                      || reward.item?.imageUrl
                    ) : null
                    const rewardId = !isString ? (
                      reward.item_id 
                      || (typeof reward.item === 'string' ? reward.item : null)
                      || reward.id
                      || reward.item?.id
                      || reward.item?.item_id
                    ) : null
                    
                    return (
                      <div 
                        key={index}
                        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-accent-500/10 to-accent-500/20 border-2 border-accent-500/30 hover:border-accent-500/50 transition-all group"
                      >
                        <div className="flex items-center gap-4 p-4">
                          {rewardImage && (
                            <div className="relative flex-shrink-0">
                              <div className="w-20 h-20 bg-white rounded-xl shadow-md p-2 group-hover:scale-110 transition-transform border-2 border-accent-500/20">
                                <img 
                                  src={rewardImage} 
                                  alt={rewardName}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                              {rewardQuantity > 1 && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-br from-accent-500 to-accent-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">
                                  ×{rewardQuantity}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {rewardId ? (
                                <Link 
                                  to={`/items/${rewardId}`}
                                  className="text-lg font-bold text-accent-500 hover:text-accent-600 transition-colors truncate"
                                >
                                  {rewardName}
                                </Link>
                              ) : (
                                <span className="text-lg font-bold text-accent-500 truncate">{rewardName}</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {rewardRarity && (
                                <span className={`px-3 py-1 text-xs font-bold rounded-lg ${getDifficultyColor(rewardRarity)}`}>
                                  {rewardRarity}
                                </span>
                              )}
                              {rewardType && (
                                <span className="px-3 py-1 bg-accent-500/20 text-navy-800 rounded-lg text-xs font-semibold border border-accent-500/30">
                                  {rewardType}
                                </span>
                              )}
                              {rewardValue && (
                                <span className="px-3 py-1 bg-[#FAD10B]/20 text-navy-800 rounded-lg text-xs font-bold flex items-center gap-1 border border-[#FAD10B]/30">
                                  <Package className="w-3 h-3" />
                                  {rewardValue.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Prerequisites - Accent Red Theme */}
            {quest.prerequisites && quest.prerequisites.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border-2 border-[#FF003C]/40 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 bg-gradient-to-br from-[#FF003C] to-[#CC0030] rounded-lg">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-techno font-bold text-navy-800">
                    Prerequisites
                  </h2>
                </div>
                <p className="text-navy-600 mb-3">
                  The following quests must be completed before this quest becomes available:
                </p>
                <div className="space-y-2">
                  {quest.prerequisites.map((prereqId: string, index: number) => (
                    <Link
                      key={index}
                      to={`/quests/${prereqId}`}
                      className="flex items-center gap-2 p-3 bg-primary-50 rounded-lg border border-primary-200 hover:bg-primary-100 hover:border-accent-400 transition-colors"
                    >
                      <Target className="w-4 h-4 text-navy-600" />
                      <span className="text-navy-800 font-medium hover:text-accent-600 transition-colors">
                        Quest: {prereqId}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Required Items */}
            {quest.requires_items && quest.requires_items.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Required Items
                </h2>
                <p className="text-navy-600 mb-3">
                  The following items are required to start this quest:
                </p>
                <div className="space-y-2">
                  {quest.requires_items.map((item: any, index: number) => {
                    const itemId = item.item_id || item.item || item.id
                    const itemName = item.name || item.item_name || itemId || 'Unknown Item'
                    const itemQuantity = item.quantity || 1
                    
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-200"
                      >
                        {itemId ? (
                          <Link 
                            to={`/items/${itemId}`}
                            className="flex-1 text-navy-800 font-medium hover:text-accent-600 transition-colors"
                          >
                            {itemName}
                          </Link>
                        ) : (
                          <span className="flex-1 text-navy-800 font-medium">{itemName}</span>
                        )}
                        <span className="px-3 py-1 bg-navy-100 text-navy-700 rounded text-sm font-semibold">
                          ×{itemQuantity}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Unlocks */}
            {quest.unlocks && quest.unlocks.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <Unlock className="w-5 h-5" />
                  Unlocks
                </h2>
                <p className="text-navy-600 mb-3">
                  Completing this quest unlocks the following quests:
                </p>
                <div className="space-y-2">
                  {quest.unlocks.map((unlockId: string, index: number) => (
                    <Link
                      key={index}
                      to={`/quests/${unlockId}`}
                      className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 hover:border-green-400 transition-colors"
                    >
                      <Unlock className="w-4 h-4 text-green-600" />
                      <span className="text-navy-800 font-medium hover:text-green-600 transition-colors">
                        Quest: {unlockId}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Notes */}
            {quest.notes && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notes
                </h2>
                <p className="text-navy-600 leading-relaxed whitespace-pre-line">
                  {quest.notes}
                </p>
              </div>
            )}
            
            {/* Guide */}
            {quest.guide && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Quest Guide
                </h2>
                <div className="text-navy-600 leading-relaxed whitespace-pre-line">
                  {quest.guide}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestDetail

