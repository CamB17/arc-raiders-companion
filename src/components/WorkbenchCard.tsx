import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, ChevronRight, Zap, Package, Check, Plus, Minus } from 'lucide-react'
import { useItems } from '@/hooks/useArcRaidersApi'
import type { HideoutWorkbench, HideoutWorkbenchLevel } from '@/lib/supabase'
import ItemPreview from './ItemPreview'

interface WorkbenchCardProps {
  workbench: HideoutWorkbench & { levels: HideoutWorkbenchLevel[] }
  currentLevel: number
  onLevelChange: (workbenchId: string, level: number) => void
  getItemQuantity: (levelNumber: number, itemId: string) => number
  onItemQuantityChange: (levelNumber: number, itemId: string, quantity: number) => void
}

const WorkbenchCard = ({ 
  workbench, 
  currentLevel, 
  onLevelChange,
  getItemQuantity,
  onItemQuantityChange
}: WorkbenchCardProps) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(currentLevel)
  const [activeTab, setActiveTab] = useState<'requirements' | 'unlocks'>('requirements')
  const [isExpanded, setIsExpanded] = useState(false)
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

  const { data: itemsResponse } = useItems()
  const allItems = itemsResponse?.data || []

  const itemsMap = new Map(allItems.map(item => [item.id, item]))
  const levelData = workbench.levels.find(l => l.level_number === selectedLevel)

  const requirementItems = levelData?.requirements.map(req => {
    const item = itemsMap.get(req.item_id)
    return { ...req, item }
  }).filter(req => req.item) || []

  const unlockItems = levelData?.unlocks.map(unlock => {
    const item = itemsMap.get(unlock.item_id)
    return { ...unlock, item }
  }).filter(unlock => unlock.item) || []

  const handleMouseEnter = (itemId: string, e: React.MouseEvent) => {
    setHoveredItemId(itemId)
    setHoverPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredItemId) {
      setHoverPosition({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseLeave = () => {
    setHoveredItemId(null)
  }

  const handleUpgrade = () => {
    if (currentLevel < workbench.max_level) {
      onLevelChange(workbench.id, currentLevel + 1)
    }
  }

  const handleDowngrade = () => {
    if (currentLevel > 1) {
      onLevelChange(workbench.id, currentLevel - 1)
    }
  }

  useEffect(() => {
    // Always show the current level's details when level changes
    setSelectedLevel(currentLevel)
  }, [currentLevel])

  // Calculate progress percentage (level 1 is minimum = 0%, max level = 100%)
  // Handle edge case where max_level is 1 (already at max)
  const progressPercentage = workbench.max_level === 1 
    ? 100 
    : ((currentLevel - 1) / (workbench.max_level - 1)) * 100
  const nextLevelData = workbench.levels.find(l => l.level_number === currentLevel + 1)
  const hasNextLevel = currentLevel < workbench.max_level

  return (
    <>
      <div className="bg-white border-2 border-primary-200 rounded-xl overflow-hidden shadow-lg hover:border-accent-400 transition-all duration-300 group">
        {/* Header Section - Always Visible */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Image and Name */}
            <div className="flex items-center gap-4 flex-1">
              {workbench.image_url && (
                <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-primary-50 border-2 border-primary-200 p-2 group-hover:border-accent-400 transition-colors">
                  <img
                    src={workbench.image_url}
                    alt={workbench.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-techno font-bold text-navy-800 mb-1 group-hover:text-accent-600 transition-colors">
                  {workbench.name}
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-navy-600 font-mono font-semibold">
                    LVL {currentLevel}/{workbench.max_level}
                  </span>
                  {hasNextLevel && nextLevelData && (
                    <span className="text-navy-400 text-xs">
                      • {nextLevelData.requirements.length} req. for next
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Level Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDowngrade}
                disabled={currentLevel === 1}
                className="p-2 rounded-lg bg-primary-100 hover:bg-primary-200 border-2 border-primary-300 hover:border-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all disabled:hover:border-primary-300"
                title="Downgrade"
              >
                <ChevronDown className="w-5 h-5 text-navy-700" />
              </button>
              
              <div className="px-4 py-2 bg-accent-50 border-2 border-accent-500 rounded-lg font-mono text-accent-600 text-lg min-w-[60px] text-center font-bold shadow-[0_0_10px_rgba(240,80,36,0.2)]">
                {currentLevel}
              </div>
              
              <button
                onClick={handleUpgrade}
                disabled={currentLevel >= workbench.max_level}
                className="p-2 rounded-lg bg-primary-100 hover:bg-primary-200 border-2 border-primary-300 hover:border-accent-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all disabled:hover:border-primary-300"
                title="Upgrade"
              >
                <ChevronUp className="w-5 h-5 text-navy-700" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-navy-600 mb-1">
              <span className="font-semibold">PROGRESS</span>
              <span className="text-accent-600 font-mono font-bold">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-1.5 bg-primary-200 rounded-full overflow-hidden border border-primary-300">
              <div 
                className="h-full bg-gradient-to-r from-accent-500 via-accent-600 to-navy-700 transition-all duration-500 shadow-[0_0_8px_rgba(240,80,36,0.3)]"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Expandable Details Section */}
        <div className="border-t-2 border-primary-200">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-6 py-3 flex items-center justify-between text-left hover:bg-primary-50 transition-colors"
          >
            <div className="flex items-center gap-2 text-navy-700">
              <ChevronRight 
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              />
              <span className="text-sm font-semibold">VIEW DETAILS</span>
            </div>
            <div className="flex gap-4 text-xs text-navy-500">
              {levelData && (
                <>
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {requirementItems.length} req.
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {unlockItems.length} unlocks
                  </span>
                </>
              )}
            </div>
          </button>

          {isExpanded && (
            <div className="px-6 pb-6 pt-4 bg-primary-50 space-y-4 animate-in slide-in-from-top-2 duration-200">
              {/* Level Selector */}
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.from({ length: workbench.max_level }, (_, i) => i + 1).map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-3 py-1.5 text-xs font-mono rounded border-2 transition-all ${
                        selectedLevel === level
                          ? 'bg-accent-100 border-accent-500 text-accent-700 font-bold shadow-[0_0_8px_rgba(240,80,36,0.2)]'
                          : 'bg-white border-primary-300 text-navy-600 hover:border-primary-400 hover:text-navy-800'
                      }`}
                    >
                      LVL {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 border-b-2 border-primary-300">
                <button
                  onClick={() => setActiveTab('requirements')}
                  className={`px-4 py-2 text-sm font-semibold transition-all relative ${
                    activeTab === 'requirements'
                      ? 'text-accent-600'
                      : 'text-navy-600 hover:text-navy-800'
                  }`}
                >
                  REQUIREMENTS
                  {activeTab === 'requirements' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500 shadow-[0_0_8px_rgba(240,80,36,0.4)]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('unlocks')}
                  className={`px-4 py-2 text-sm font-semibold transition-all relative ${
                    activeTab === 'unlocks'
                      ? 'text-accent-600'
                      : 'text-navy-600 hover:text-navy-800'
                  }`}
                >
                  UNLOCKS
                  {activeTab === 'unlocks' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500 shadow-[0_0_8px_rgba(240,80,36,0.4)]" />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="pt-4">
                {activeTab === 'requirements' ? (
                  <div>
                    <h4 className="text-xs text-navy-500 uppercase tracking-wider mb-3 font-semibold">
                      Level {selectedLevel} Requirements
                    </h4>
                    {requirementItems.length > 0 ? (
                      <div className="space-y-2">
                        {requirementItems.map((req, index) => {
                          const item = req.item!
                          const itemImage = item.icon || item.image || item.imageUrl || item.thumbnail
                          const collectedQuantity = getItemQuantity(selectedLevel, req.item_id)
                          const isComplete = collectedQuantity >= req.quantity
                          const progressPercentage = Math.min(100, (collectedQuantity / req.quantity) * 100)
                          
                          return (
                            <div
                              key={index}
                              className={`flex items-center gap-3 p-3 rounded-lg bg-white border-2 transition-all group/item ${
                                isComplete
                                  ? 'border-green-400 bg-green-50 hover:border-green-500'
                                  : 'border-primary-200 hover:border-accent-400'
                              }`}
                              onMouseEnter={(e) => handleMouseEnter(req.item_id, e)}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeave}
                            >
                              {/* Checkbox/Check Icon */}
                              <div className="flex-shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    if (isComplete) {
                                      onItemQuantityChange(selectedLevel, req.item_id, 0)
                                    } else {
                                      onItemQuantityChange(selectedLevel, req.item_id, req.quantity)
                                    }
                                  }}
                                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                                    isComplete
                                      ? 'bg-green-500 border-green-600 text-white'
                                      : 'bg-white border-primary-300 hover:border-accent-500'
                                  }`}
                                  title={isComplete ? 'Mark as uncollected' : 'Mark as collected'}
                                >
                                  {isComplete && <Check className="w-4 h-4" />}
                                </button>
                              </div>

                              {itemImage && (
                                <div className={`w-12 h-12 flex-shrink-0 rounded bg-primary-50 border-2 p-1.5 ${
                                  isComplete ? 'border-green-300' : 'border-primary-200'
                                }`}>
                                  <img
                                    src={itemImage}
                                    alt={item.name}
                                    className={`w-full h-full object-contain ${isComplete ? 'opacity-75' : ''}`}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/items/${req.item_id}`}
                                  className={`text-sm font-medium transition-colors block truncate ${
                                    isComplete
                                      ? 'text-green-700 line-through hover:text-green-800'
                                      : 'text-navy-800 hover:text-accent-600'
                                  }`}
                                >
                                  {item.name}
                                </Link>
                                <div className="text-xs text-navy-500 mt-0.5">{item.id}</div>
                                {/* Progress indicator */}
                                <div className="mt-1.5">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-primary-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all duration-300 ${
                                          isComplete
                                            ? 'bg-green-500'
                                            : 'bg-accent-500'
                                        }`}
                                        style={{ width: `${progressPercentage}%` }}
                                      />
                                    </div>
                                    <span className={`text-xs font-mono ${
                                      isComplete ? 'text-green-700 font-bold' : 'text-navy-600'
                                    }`}>
                                      {collectedQuantity}/{req.quantity}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Quantity Controls */}
                              <div className="flex flex-col items-center gap-1">
                                <div className="px-3 py-1 bg-accent-100 border-2 border-accent-400 rounded font-mono text-accent-700 text-sm font-bold">
                                  ×{req.quantity}
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      onItemQuantityChange(selectedLevel, req.item_id, Math.max(0, collectedQuantity - 1))
                                    }}
                                    className="w-6 h-6 rounded border-2 border-primary-300 bg-white hover:bg-primary-100 hover:border-accent-500 flex items-center justify-center transition-all"
                                    title="Decrease quantity"
                                  >
                                    <Minus className="w-3 h-3 text-navy-700" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      onItemQuantityChange(selectedLevel, req.item_id, Math.min(req.quantity, collectedQuantity + 1))
                                    }}
                                    className="w-6 h-6 rounded border-2 border-primary-300 bg-white hover:bg-primary-100 hover:border-accent-500 flex items-center justify-center transition-all"
                                    title="Increase quantity"
                                    disabled={collectedQuantity >= req.quantity}
                                  >
                                    <Plus className={`w-3 h-3 ${collectedQuantity >= req.quantity ? 'text-navy-400' : 'text-navy-700'}`} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-navy-500 text-sm">
                        No requirements for this level
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 className="text-xs text-navy-500 uppercase tracking-wider mb-3 font-semibold">
                      Level {selectedLevel} Unlocks
                    </h4>
                    {unlockItems.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {unlockItems.map((unlock, index) => {
                          const item = unlock.item!
                          const itemImage = item.icon || item.image || item.imageUrl || item.thumbnail
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 rounded-lg bg-white border-2 border-primary-200 hover:border-navy-400 transition-all group/item"
                              onMouseEnter={(e) => handleMouseEnter(unlock.item_id, e)}
                              onMouseMove={handleMouseMove}
                              onMouseLeave={handleMouseLeave}
                            >
                              {itemImage && (
                                <div className="w-10 h-10 flex-shrink-0 rounded bg-primary-50 border-2 border-primary-200 p-1">
                                  <img
                                    src={itemImage}
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/items/${unlock.item_id}`}
                                  className="text-sm font-medium text-navy-800 hover:text-navy-900 transition-colors block truncate"
                                >
                                  {item.name}
                                </Link>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-navy-500 text-sm">
                        No unlocks for this level
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Item Preview Portal */}
      {hoveredItemId && typeof document !== 'undefined' && createPortal(
        <ItemPreview itemId={hoveredItemId} position={hoverPosition} />,
        document.body
      )}
    </>
  )
}

export default WorkbenchCard
