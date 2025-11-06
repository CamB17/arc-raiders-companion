import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { Package, Check, Plus, Minus, Sparkles, RotateCcw } from 'lucide-react'
import { useItems } from '@/hooks/useArcRaidersApi'
import type { ExpeditionPhase } from '@/lib/supabase'
import ItemPreview from './ItemPreview'

interface ExpeditionPhaseCardProps {
  phase: ExpeditionPhase
  phaseIndex: number
  totalPhases: number
  isComplete: boolean
  isCurrentPhase?: boolean
  isFuturePhase?: boolean
  getItemQuantity: (itemId: string) => number
  onItemQuantityChange: (itemId: string, quantity: number) => void
  onResetPhase: () => void
}

const ExpeditionPhaseCard = ({ 
  phase, 
  phaseIndex,
  totalPhases,
  isComplete,
  isCurrentPhase = false,
  isFuturePhase = false,
  getItemQuantity,
  onItemQuantityChange,
  onResetPhase
}: ExpeditionPhaseCardProps) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

  const { data: itemsResponse } = useItems()
  const allItems = itemsResponse?.data || []

  const itemsMap = new Map(allItems.map(item => [item.id, item]))

  const requirementItems = phase.requirements.map(req => {
    const item = itemsMap.get(req.item_id)
    return { ...req, item }
  }).filter(req => req.item)

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

  // Calculate phase progress
  const totalRequirements = phase.requirements.length
  const completedRequirements = phase.requirements.filter(req => {
    const collected = getItemQuantity(req.item_id)
    return collected >= req.quantity
  }).length
  const progressPercentage = totalRequirements > 0 
    ? (completedRequirements / totalRequirements) * 100 
    : 0

  return (
    <>
      <div className={`bg-white border-2 rounded-xl overflow-hidden shadow-lg transition-all duration-500 ${
        isComplete 
          ? 'border-green-400 bg-green-50' 
          : isCurrentPhase
          ? 'border-accent-400 bg-accent-50 shadow-xl'
          : isFuturePhase
          ? 'border-primary-200 bg-primary-50'
          : 'border-primary-200 hover:border-accent-400'
      }`}>
        {/* Header Section */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {isComplete && (
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className={`text-2xl font-techno font-bold mb-1 ${
                    isComplete ? 'text-green-700' : isCurrentPhase ? 'text-accent-700' : 'text-navy-800'
                  }`}>
                    Phase {phase.phase_number}
                    {phase.phase_name && (
                      <span className="text-lg font-normal ml-2 text-navy-600">
                        - {phase.phase_name}
                      </span>
                    )}
                    {isCurrentPhase && !isComplete && (
                      <span className="ml-2 text-sm font-normal text-accent-600 bg-accent-100 px-2 py-1 rounded">
                        CURRENT
                      </span>
                    )}
                    {isFuturePhase && (
                      <span className="ml-2 text-sm font-normal text-navy-500 bg-primary-100 px-2 py-1 rounded">
                        UPCOMING
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-navy-500">
                    Phase {phaseIndex + 1} of {totalPhases}
                  </p>
                </div>
              </div>
            </div>
            {!isFuturePhase && (
              <button
                onClick={onResetPhase}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-300 hover:border-red-400 rounded-lg font-semibold text-sm transition-all flex items-center gap-2"
                title="Reset this phase - clear all collected items"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-navy-600 mb-2">
              <span className="font-semibold">PHASE PROGRESS</span>
              <span className={`font-mono font-bold ${
                isComplete ? 'text-green-700' : 'text-accent-600'
              }`}>
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="h-2 bg-primary-200 rounded-full overflow-hidden border border-primary-300">
              <div 
                className={`h-full transition-all duration-500 ${
                  isComplete
                    ? 'bg-green-500'
                    : 'bg-gradient-to-r from-accent-500 via-accent-600 to-navy-700'
                } shadow-[0_0_8px_rgba(240,80,36,0.3)]`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="px-6 pb-6">
          <h4 className="text-xs text-navy-500 uppercase tracking-wider mb-4 font-semibold flex items-center gap-2">
            <Package className="w-4 h-4" />
            Requirements ({completedRequirements}/{totalRequirements})
          </h4>
          
          {isFuturePhase ? (
            <div className="text-center py-8 text-navy-500 text-sm bg-primary-50 rounded-lg border-2 border-dashed border-primary-300">
              <p className="font-semibold mb-2">Future Phase</p>
              <p>Complete previous phases to unlock this phase.</p>
            </div>
          ) : requirementItems.length > 0 ? (
            <div className="space-y-3">
              {requirementItems.map((req, index) => {
                const item = req.item!
                const itemImage = item.icon || item.image || item.imageUrl || item.thumbnail
                const collectedQuantity = getItemQuantity(req.item_id)
                const isItemComplete = collectedQuantity >= req.quantity
                const itemProgressPercentage = Math.min(100, (collectedQuantity / req.quantity) * 100)
                
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all group/item ${
                      isItemComplete
                        ? 'border-green-400 bg-green-50 hover:border-green-500'
                        : 'border-primary-200 hover:border-accent-400 bg-white'
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
                          if (isItemComplete) {
                            onItemQuantityChange(req.item_id, 0)
                          } else {
                            onItemQuantityChange(req.item_id, req.quantity)
                          }
                        }}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                          isItemComplete
                            ? 'bg-green-500 border-green-600 text-white'
                            : 'bg-white border-primary-300 hover:border-accent-500'
                        }`}
                        title={isItemComplete ? 'Mark as uncollected' : 'Mark as collected'}
                      >
                        {isItemComplete && <Check className="w-4 h-4" />}
                      </button>
                    </div>

                    {itemImage && (
                      <div className={`w-12 h-12 flex-shrink-0 rounded bg-primary-50 border-2 p-1.5 ${
                        isItemComplete ? 'border-green-300' : 'border-primary-200'
                      }`}>
                        <img
                          src={itemImage}
                          alt={item.name}
                          className={`w-full h-full object-contain ${isItemComplete ? 'opacity-75' : ''}`}
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
                          isItemComplete
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
                                isItemComplete
                                  ? 'bg-green-500'
                                  : 'bg-accent-500'
                              }`}
                              style={{ width: `${itemProgressPercentage}%` }}
                            />
                          </div>
                          <span className={`text-xs font-mono ${
                            isItemComplete ? 'text-green-700 font-bold' : 'text-navy-600'
                          }`}>
                            {collectedQuantity}/{req.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex flex-col items-center gap-1">
                      <div className={`px-3 py-1 rounded font-mono text-sm font-bold ${
                        isItemComplete
                          ? 'bg-green-100 border-2 border-green-400 text-green-700'
                          : 'bg-accent-100 border-2 border-accent-400 text-accent-700'
                      }`}>
                        ×{req.quantity}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            onItemQuantityChange(req.item_id, Math.max(0, collectedQuantity - 1))
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
                            onItemQuantityChange(req.item_id, Math.min(req.quantity, collectedQuantity + 1))
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
              No requirements for this phase
            </div>
          )}
        </div>

        {/* Completion Badge */}
        {isComplete && (
          <div className="px-6 pb-6">
            <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">Phase Complete!</p>
                <p className="text-sm text-green-700">All requirements have been collected.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Item Preview Portal */}
      {hoveredItemId && typeof document !== 'undefined' && createPortal(
        <ItemPreview itemId={hoveredItemId} position={hoverPosition} />,
        document.body
      )}
    </>
  )
}

export default ExpeditionPhaseCard

