import { Link } from 'react-router-dom'
import { useQuests } from '../hooks/useArcRaidersApi'
import { Target, Award, MapPin, Clock, Users, Star, Tag, Package, ArrowRight, Link2 } from 'lucide-react'
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

const Quests = () => {
  const { data: response, isLoading, error } = useQuests()
  const quests = response?.data || []
  
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
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-4xl font-techno font-bold text-navy-800 mb-3">
                QUESTS
              </h1>
              <p className="text-navy-600">
                View all available quests with detailed objectives, rewards, and quest chain information
              </p>
              {response?.pagination && (
                <p className="text-sm text-navy-500 mt-2">
                  Showing {quests.length} of {response.pagination.total} quests
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Quests List */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-primary-200 p-6 animate-pulse">
                <div className="h-6 bg-primary-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-primary-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-primary-100 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : quests && quests.length > 0 ? (
          <div className="space-y-6">
            {quests.map((quest: ArcRaidersQuest) => {
              const questImage = quest.image || quest.imageUrl || quest.icon || quest.thumbnail
              
              return (
                <Link
                  key={quest.id}
                  to={`/quests/${quest.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-xl border border-primary-200 hover:border-accent-400 p-8 transition-all hover:shadow-lg group">
                    <div className="flex items-start gap-6 mb-6">
                      {/* Quest Image/Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center overflow-hidden relative">
                          {questImage ? (
                            <>
                              <img 
                                src={questImage} 
                                alt={quest.name}
                                className="max-w-full max-h-full object-contain drop-shadow-lg"
                                onError={(e) => {
                                  // Fallback if image fails to load
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.parentElement!.querySelector('.fallback-icon')?.classList.remove('hidden')
                                }}
                              />
                              <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center">
                                <Target className="w-16 h-16 text-white" />
                              </div>
                            </>
                          ) : (
                            <Target className="w-16 h-16 text-white" />
                          )}
                        </div>
                      </div>
                      
                      {/* Quest Info */}
                      <div className="flex-1">
                        {/* Header with badges */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-2xl font-techno font-bold text-navy-800 group-hover:text-accent-600 transition-colors">
                                {quest.name}
                              </h3>
                              {quest.quest_chain && (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium flex items-center gap-1">
                                  <Link2 className="w-3 h-3" />
                                  Chain: {quest.quest_chain}
                                </span>
                              )}
                              {quest.chain_position && (
                                <span className="px-2 py-1 bg-navy-100 text-navy-700 rounded text-xs font-medium">
                                  #{quest.chain_position}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
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
                          </div>
                          <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-accent-600 transition-colors flex-shrink-0 mt-1" />
                        </div>
                        
                        {quest.description && (
                          <p className="text-navy-600 leading-relaxed mb-4">
                            {quest.description}
                          </p>
                        )}
                        
                        {/* Quest Metadata Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {quest.region && (
                            <div className="flex items-center gap-2 text-sm text-navy-600">
                              <MapPin className="w-4 h-4" />
                              <span>{quest.region}</span>
                            </div>
                          )}
                          {quest.duration && (
                            <div className="flex items-center gap-2 text-sm text-navy-600">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(quest.duration)}</span>
                            </div>
                          )}
                          {(quest.min_players || quest.max_players) && (
                            <div className="flex items-center gap-2 text-sm text-navy-600">
                              <Users className="w-4 h-4" />
                              <span>
                                {quest.min_players || 1}-{quest.max_players || 4} players
                              </span>
                            </div>
                          )}
                          {quest.recommended_level && (
                            <div className="flex items-center gap-2 text-sm text-navy-600">
                              <Star className="w-4 h-4" />
                              <span>Lv {quest.recommended_level}</span>
                            </div>
                          )}
                        </div>
                        
                        {quest.location && (
                          <div className="text-sm text-navy-500 mb-4">
                            <span className="font-medium">Location: </span>
                            {quest.location}
                          </div>
                        )}
                        
                        {/* Tags */}
                        {quest.tags && quest.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {quest.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium flex items-center gap-1"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Objectives */}
                      {quest.objectives && quest.objectives.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-navy-800 mb-3 flex items-center gap-2">
                            <Target className="w-5 h-5 text-accent-600" />
                            Objectives
                          </h4>
                          <ul className="space-y-2">
                            {quest.objectives.map((objective: any, index: number) => {
                              const isString = typeof objective === 'string'
                              const objName = isString ? objective : (objective.name || objective.description || 'Objective')
                              const objType = !isString ? objective.type : undefined
                              const objProgress = !isString && objective.current !== undefined && objective.target !== undefined
                                ? `${objective.current}/${objective.target}`
                                : null
                              const objCompleted = !isString ? objective.completed : false
                              
                              return (
                                <li key={index} className="flex items-start text-navy-700">
                                  <span className={`w-2 h-2 rounded-full mr-3 mt-2 flex-shrink-0 ${objCompleted ? 'bg-green-500' : 'bg-accent-500'}`}></span>
                                  <div className="flex-1">
                                    <span className={objCompleted ? 'line-through opacity-60' : ''}>{objName}</span>
                                    {objType && (
                                      <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                                        {objType}
                                      </span>
                                    )}
                                    {objProgress && (
                                      <span className="ml-2 text-navy-500 text-sm font-semibold">
                                        ({objProgress})
                                      </span>
                                    )}
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )}
                      
                      {/* Rewards */}
                      {quest.rewards && quest.rewards.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-navy-800 mb-3 flex items-center gap-2">
                            <Award className="w-5 h-5 text-accent-600" />
                            Rewards
                          </h4>
                          <div className="space-y-2">
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
                              
                              return (
                                <div 
                                  key={index}
                                  className="flex items-center gap-3 px-4 py-2 bg-accent-50 rounded-lg border border-accent-200 hover:bg-accent-100 transition-colors"
                                >
                                  {rewardImage && (
                                    <img 
                                      src={rewardImage} 
                                      alt={rewardName}
                                      className="w-8 h-8 object-contain flex-shrink-0"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                      }}
                                    />
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-accent-700 font-medium">{rewardName}</span>
                                      {rewardRarity && (
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${getDifficultyColor(rewardRarity)}`}>
                                          {rewardRarity}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-navy-600">
                                      {rewardQuantity && rewardQuantity > 1 && (
                                        <span className="font-semibold">×{rewardQuantity}</span>
                                      )}
                                      {rewardValue && (
                                        <>
                                          <Package className="w-3 h-3" />
                                          <span>{rewardValue.toLocaleString()}</span>
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
                    </div>
                    
                    {/* Quest Chain Info */}
                    {(quest.previous_quest || quest.next_quest || quest.quest_chain) && (
                      <div className="mt-6 pt-6 border-t border-primary-200">
                        <h4 className="text-sm font-semibold text-navy-700 mb-3 uppercase">Quest Chain</h4>
                        <div className="flex flex-wrap gap-4 text-sm">
                          {quest.previous_quest && (
                            <div className="flex items-center gap-2 text-navy-600">
                              <ArrowRight className="w-4 h-4 rotate-180" />
                              <Link 
                                to={`/quests/${quest.previous_quest}`}
                                className="hover:text-accent-600 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Previous Quest
                              </Link>
                            </div>
                          )}
                          {quest.next_quest && (
                            <div className="flex items-center gap-2 text-navy-600">
                              <Link 
                                to={`/quests/${quest.next_quest}`}
                                className="hover:text-accent-600 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Next Quest
                              </Link>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Requirements */}
                    {(quest.prerequisites && quest.prerequisites.length > 0) || 
                     (quest.requires_items && quest.requires_items.length > 0) || 
                     quest.required_level ? (
                      <div className="mt-6 pt-6 border-t border-primary-200">
                        <h4 className="text-sm font-semibold text-navy-700 mb-3 uppercase">Requirements</h4>
                        <div className="flex flex-wrap gap-4 text-sm">
                          {quest.required_level && (
                            <div className="flex items-center gap-2 text-navy-600">
                              <Star className="w-4 h-4" />
                              <span>Level {quest.required_level} required</span>
                            </div>
                          )}
                          {quest.prerequisites && quest.prerequisites.length > 0 && (
                            <div className="flex items-center gap-2 text-navy-600">
                              <Target className="w-4 h-4" />
                              <span>{quest.prerequisites.length} prerequisite quest{quest.prerequisites.length > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {quest.requires_items && quest.requires_items.length > 0 && (
                            <div className="flex items-center gap-2 text-navy-600">
                              <Package className="w-4 h-4" />
                              <span>{quest.requires_items.length} required item{quest.requires_items.length > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
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
            <p className="text-navy-500 text-lg">No quests available at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Quests

