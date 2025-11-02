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
  
  // Try to get image from quest, or fallback to trader/giver image
  const questImage = quest.image || quest.imageUrl || quest.icon || quest.thumbnail
  const traderImage = quest.trader?.avatar || quest.trader?.image || quest.trader?.icon || 
                      quest.giver?.avatar || quest.giver?.image || quest.giver?.icon ||
                      quest.provider?.avatar || quest.provider?.image || quest.provider?.icon
  // Use trader image if quest doesn't have its own image
  const displayImage = questImage || traderImage
  
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
        
        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Quest Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden sticky top-6">
              {/* Image - Shows trader/giver image if quest doesn't have one */}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-8 flex items-center justify-center h-64 relative">
                {displayImage ? (
                  <>
                    <img 
                      src={displayImage} 
                      alt={traderImage ? (quest.trader?.name || quest.giver?.name || quest.provider?.name || 'Quest Giver') : quest.name}
                      className="max-h-full max-w-full object-contain drop-shadow-2xl"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement!.querySelector('.fallback-icon')?.classList.remove('hidden')
                      }}
                    />
                    <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-white/30 rounded-lg flex items-center justify-center">
                        <Target className="w-16 h-16 text-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-32 h-32 bg-white/30 rounded-lg flex items-center justify-center">
                    <Target className="w-16 h-16 text-white" />
                  </div>
                )}
                {traderImage && !questImage && (
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {quest.trader?.name || quest.giver?.name || quest.provider?.name || 'Quest Giver'}
                  </div>
                )}
              </div>
              
              {/* Card Content */}
              <div className="p-6 bg-primary-50">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {quest.type && (
                    <span className={`px-3 py-1 text-xs font-bold rounded ${getTypeColor(quest.type)}`}>
                      {quest.type}
                    </span>
                  )}
                  {quest.difficulty && (
                    <span className={`px-3 py-1 text-xs font-bold rounded ${getDifficultyColor(quest.difficulty)}`}>
                      {quest.difficulty}
                    </span>
                  )}
                </div>
                
                {/* Quest Chain Info */}
                {quest.quest_chain && (
                  <div className="mb-4 pb-4 border-b border-primary-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Link2 className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-semibold text-indigo-700 uppercase">Quest Chain</span>
                    </div>
                    <div className="text-sm text-navy-700 font-medium">{quest.quest_chain}</div>
                    {quest.chain_position && (
                      <div className="text-xs text-navy-500 mt-1">Position #{quest.chain_position}</div>
                    )}
                  </div>
                )}
                
                {/* Title */}
                <h1 className="text-2xl font-techno font-bold text-navy-800 mb-3 uppercase">
                  {quest.name}
                </h1>
                
                {/* Description */}
                {quest.description && (
                  <p className="text-sm text-navy-600 mb-6 leading-relaxed">
                    {quest.description}
                  </p>
                )}
                
                {/* Stats */}
                <div className="space-y-3 mb-6">
                  {quest.region && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-navy-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Region
                      </span>
                      <span className="text-navy-800 font-bold">{quest.region}</span>
                    </div>
                  )}
                  
                  {quest.location && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-navy-600 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </span>
                      <span className="text-navy-800 font-bold text-right">{quest.location}</span>
                    </div>
                  )}
                  
                  {quest.duration && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-navy-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Duration
                      </span>
                      <span className="text-navy-800 font-bold">{formatDuration(quest.duration)}</span>
                    </div>
                  )}
                  
                  {(quest.min_players || quest.max_players) && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-navy-600 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Players
                      </span>
                      <span className="text-navy-800 font-bold">
                        {quest.min_players || 1}-{quest.max_players || 4}
                      </span>
                    </div>
                  )}
                  
                  {quest.recommended_level && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-navy-600 flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Recommended Level
                      </span>
                      <span className="text-navy-800 font-bold">{quest.recommended_level}</span>
                    </div>
                  )}
                  
                  {quest.required_level && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-navy-600 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Required Level
                      </span>
                      <span className="text-navy-800 font-bold">{quest.required_level}</span>
                    </div>
                  )}
                </div>
                
                {/* Tags */}
                {quest.tags && quest.tags.length > 0 && (
                  <div className="mb-6 pt-4 border-t border-primary-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-5 h-5 text-navy-600" />
                      <h3 className="text-sm font-semibold text-navy-700 uppercase">Tags</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quest.tags.map((tag, idx) => (
                        <span key={idx} className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Progress */}
                {quest.progress !== undefined && (
                  <div className="pt-4 border-t border-primary-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-navy-600">Progress</span>
                      <span className="text-sm text-navy-800 font-bold">{quest.progress}%</span>
                    </div>
                    <div className="w-full bg-primary-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${quest.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quest Chain Navigation */}
            {(quest.previous_quest || quest.next_quest) && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <Link2 className="w-5 h-5" />
                  Quest Chain Navigation
                </h2>
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
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Objectives
                </h2>
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
                        className={`p-4 rounded-lg border ${
                          objCompleted 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-primary-50 border-primary-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {objCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-accent-500 flex-shrink-0 mt-0.5"></div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-navy-800 font-medium ${objCompleted ? 'line-through opacity-60' : ''}`}>
                                {objName}
                              </span>
                              {objType && (
                                <span className="px-2 py-0.5 bg-primary-200 text-primary-700 rounded text-xs font-medium">
                                  {objType}
                                </span>
                              )}
                            </div>
                            {hasProgress && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between mb-1 text-xs text-navy-600">
                                  <span>Progress</span>
                                  <span className="font-semibold">
                                    {objCurrent} / {objTarget}
                                  </span>
                                </div>
                                <div className="w-full bg-primary-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-indigo-600 h-1.5 rounded-full transition-all"
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
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Rewards
                </h2>
                <div className="space-y-3">
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
                    const rewardQuantity = !isString ? (reward.quantity || reward.count || reward.amount || 1) : null
                    const rewardValue = !isString ? (reward.value || reward.price || reward.coins || reward.raider_coins) : null
                    const rewardRarity = !isString ? (reward.rarity || reward.item?.rarity) : null
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
                      || reward.item 
                      || reward.id
                      || reward.item?.id
                      || reward.item?.item_id
                    ) : null
                    
                    return (
                      <div 
                        key={index}
                        className="flex items-center gap-4 p-4 bg-accent-50 rounded-lg border border-accent-200 hover:bg-accent-100 transition-colors"
                      >
                        {rewardImage && (
                          <img 
                            src={rewardImage} 
                            alt={rewardName}
                            className="w-12 h-12 object-contain flex-shrink-0 bg-white rounded p-1"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {rewardId ? (
                              <Link 
                                to={`/items/${rewardId}`}
                                className="text-accent-700 font-semibold hover:text-accent-800 transition-colors"
                              >
                                {rewardName}
                              </Link>
                            ) : (
                              <span className="text-accent-700 font-semibold">{rewardName}</span>
                            )}
                            {rewardRarity && (
                              <span className={`px-2 py-0.5 text-xs font-bold rounded ${getDifficultyColor(rewardRarity)}`}>
                                {rewardRarity}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-navy-600">
                            {rewardQuantity && rewardQuantity > 1 && (
                              <span className="font-semibold">Quantity: ×{rewardQuantity}</span>
                            )}
                            {rewardValue && (
                              <>
                                <Package className="w-4 h-4" />
                                <span className="font-semibold">{rewardValue.toLocaleString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Prerequisites */}
            {quest.prerequisites && quest.prerequisites.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Prerequisites
                </h2>
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

