import { useState, useEffect, useRef } from 'react'
import { useExpeditionWithPhases } from '@/hooks/useSupabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import ExpeditionPhaseCard from '@/components/ExpeditionPhaseCard'
import { Download, Upload, CheckCircle, AlertCircle, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

const STORAGE_KEY = 'expedition_tracker_items'

// Type for item tracking: { [phaseId]: { [itemId]: quantity } }
type ItemTracking = Record<string, Record<string, number>>

const ExpeditionTracker = () => {
  const { data: expeditionData, isLoading, error } = useExpeditionWithPhases()
  const [itemTracking, setItemTracking] = useState<ItemTracking>({})
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [completedPhases, setCompletedPhases] = useState<Set<string>>(new Set())
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showAllPhasesModal, setShowAllPhasesModal] = useState(false)
  const [previewPhaseIndex, setPreviewPhaseIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const prevCompletedPhasesRef = useRef<Set<string>>(new Set())

  // Load saved item tracking from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setItemTracking(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved item tracking:', e)
      }
    }
  }, [])

  // Save item tracking to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(itemTracking).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itemTracking))
    }
  }, [itemTracking])

  // Calculate completed phases and current phase index
  useEffect(() => {
    if (!expeditionData?.phases) return

    const newCompletedPhases = new Set<string>()
    let firstIncompleteIndex = expeditionData.phases.length

    // Find first incomplete phase
    for (let i = 0; i < expeditionData.phases.length; i++) {
      const phase = expeditionData.phases[i]
      
      // Skip phases with no requirements - they can't be completed
      if (!phase.requirements || phase.requirements.length === 0) {
        if (firstIncompleteIndex === expeditionData.phases.length) {
          firstIncompleteIndex = i
        }
        continue
      }
      
      // Check if all requirements are met
      const isComplete = phase.requirements.every(req => {
        const collected = itemTracking[phase.id]?.[req.item_id] ?? 0
        return collected >= req.quantity
      })
      
      if (isComplete) {
        newCompletedPhases.add(phase.id)
      } else if (firstIncompleteIndex === expeditionData.phases.length) {
        // This is the first incomplete phase
        firstIncompleteIndex = i
      }
    }
    
    // If all phases are complete, show the last one
    if (firstIncompleteIndex === expeditionData.phases.length) {
      firstIncompleteIndex = expeditionData.phases.length - 1
    }

    setCompletedPhases(newCompletedPhases)
    
    // If a new phase was just completed, animate to next phase
    const newlyCompleted = Array.from(newCompletedPhases).filter(
      id => !prevCompletedPhasesRef.current.has(id)
    )
    
    if (newlyCompleted.length > 0 && firstIncompleteIndex < expeditionData.phases.length) {
      // Animate completion, then transition to next phase
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentPhaseIndex(firstIncompleteIndex)
        setTimeout(() => {
          setIsTransitioning(false)
        }, 500) // Wait for transition animation
      }, 1500) // Delay to show completion animation
    } else {
      setCurrentPhaseIndex(firstIncompleteIndex)
    }

    prevCompletedPhasesRef.current = newCompletedPhases
  }, [itemTracking, expeditionData?.phases])

  const handleItemQuantityChange = (
    phaseId: string,
    itemId: string,
    quantity: number
  ) => {
    setItemTracking(prev => {
      const updated = { ...prev }
      if (!updated[phaseId]) {
        updated[phaseId] = {}
      }
      updated[phaseId] = {
        ...updated[phaseId],
        [itemId]: Math.max(0, quantity), // Ensure non-negative
      }
      // Clean up empty entries
      if (updated[phaseId][itemId] === 0) {
        delete updated[phaseId][itemId]
      }
      if (Object.keys(updated[phaseId]).length === 0) {
        delete updated[phaseId]
      }
      return updated
    })
  }

  const handleResetPhase = (phaseId: string) => {
    if (window.confirm('Are you sure you want to reset this phase? This will clear all collected items for this phase.')) {
      setItemTracking(prev => {
        const updated = { ...prev }
        delete updated[phaseId]
        return updated
      })
    }
  }

  const getItemQuantity = (
    phaseId: string,
    itemId: string
  ): number => {
    return itemTracking[phaseId]?.[itemId] ?? 0
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleExport = () => {
    try {
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        itemTracking,
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `expedition-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showNotification('success', 'Data exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      showNotification('error', 'Failed to export data. Please try again.')
    }
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const importData = JSON.parse(text)

      // Validate the imported data structure
      if (!importData.itemTracking) {
        throw new Error('Invalid backup file format')
      }

      // Restore the data
      setItemTracking(importData.itemTracking || {})

      // Save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(importData.itemTracking || {}))

      showNotification('success', `Data imported successfully! ${importData.exportedAt ? `Backup from ${new Date(importData.exportedAt).toLocaleDateString()}` : ''}`)
    } catch (error) {
      console.error('Import failed:', error)
      showNotification('error', 'Failed to import data. Please check that the file is a valid backup.')
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white border-2 border-red-300 rounded-lg p-6 shadow-xl">
            <h2 className="text-xl font-techno font-bold text-red-600 mb-2">SYSTEM ERROR</h2>
            <p className="text-navy-600 font-mono text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!expeditionData || !expeditionData.phases || expeditionData.phases.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(240, 80, 36, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(240, 80, 36, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-techno font-bold bg-gradient-to-r from-accent-500 via-accent-600 to-navy-800 bg-clip-text text-transparent mb-2">
              EXPEDITION TRACKER
            </h1>
            <p className="text-navy-600 text-lg max-w-3xl mx-auto mt-4">
              Monitor and manage expedition progress. Progress synchronized locally.
            </p>
          </div>
          <div className="bg-white border-2 border-primary-200 rounded-lg p-12 text-center shadow-xl">
            <div className="text-navy-500 mb-2 font-mono text-sm">NO EXPEDITION CONFIGURED</div>
            <p className="text-navy-600">
              Configure the expedition and phases in the admin panel to begin tracking.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const phases = expeditionData.phases
  const currentPhase = phases[currentPhaseIndex]
  const totalPhases = phases.length
  const completedCount = completedPhases.size

  // Calculate overall progress
  const totalProgress = totalPhases > 0 ? completedCount / totalPhases : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(240, 80, 36, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(240, 80, 36, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 transition-all duration-300 opacity-100">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 shadow-xl ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-400 text-green-800'
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-semibold text-sm">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-techno font-bold bg-gradient-to-r from-accent-500 via-accent-600 to-navy-800 bg-clip-text text-transparent">
                {expeditionData.name || 'EXPEDITION TRACKER'}
              </h1>
              {expeditionData.description && (
                <p className="text-navy-600 text-sm mt-1">
                  {expeditionData.description}
                </p>
              )}
            </div>
            
            {/* Import/Export Controls - Compact */}
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-white rounded-lg border border-accent-600 text-xs font-semibold transition-all flex items-center gap-1.5"
                title="Export data"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <button
                onClick={handleImport}
                className="px-3 py-1.5 bg-navy-600 hover:bg-navy-700 text-white rounded-lg border border-navy-700 text-xs font-semibold transition-all flex items-center gap-1.5"
                title="Import data"
              >
                <Upload className="w-3.5 h-3.5" />
                Import
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
          
          {/* Overall Progress Indicator - Compact */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-navy-600 mb-1">
                <span className="font-medium">Progress</span>
                <span className="text-accent-600 font-mono font-bold">
                  {completedCount}/{totalPhases} Phases
                </span>
              </div>
              <div className="h-1.5 bg-primary-200 rounded-full overflow-hidden border border-primary-300">
                <div 
                  className="h-full bg-gradient-to-r from-accent-500 via-accent-600 to-navy-700 transition-all duration-500"
                  style={{ width: `${totalProgress * 100}%` }}
                />
              </div>
            </div>
            
            {/* Subtle Completion Indicator */}
            {completedCount > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 border border-green-300 rounded text-xs">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-700 font-medium">
                  {completedCount} Complete
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Phase Navigation & View All Button */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentPhaseIndex > 0 && (
              <button
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true)
                    setCurrentPhaseIndex(currentPhaseIndex - 1)
                    setTimeout(() => setIsTransitioning(false), 500)
                  }
                }}
                disabled={isTransitioning}
                className="px-3 py-2 bg-white border-2 border-primary-300 rounded-lg hover:bg-accent-50 hover:border-accent-500 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous phase"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm font-semibold">Previous</span>
              </button>
            )}
            {currentPhaseIndex < totalPhases - 1 && (
              <button
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true)
                    setCurrentPhaseIndex(currentPhaseIndex + 1)
                    setTimeout(() => setIsTransitioning(false), 500)
                  }
                }}
                disabled={isTransitioning}
                className="px-3 py-2 bg-white border-2 border-primary-300 rounded-lg hover:bg-accent-50 hover:border-accent-500 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next phase"
              >
                <span className="text-sm font-semibold">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowAllPhasesModal(true)}
            className="px-4 py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-lg border-2 border-navy-700 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            title="View all phases"
          >
            <Eye className="w-4 h-4" />
            View All Phases
          </button>
        </div>

        {/* Current Phase - Single View with Transition */}
        {currentPhase && (
          <div 
            id={`phase-${currentPhase.id}`}
            key={`${currentPhase.id}-${currentPhaseIndex}`}
            className={`transition-all duration-500 ease-in-out ${
              isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <ExpeditionPhaseCard
              phase={currentPhase}
              phaseIndex={currentPhaseIndex}
              totalPhases={totalPhases}
              isComplete={completedPhases.has(currentPhase.id)}
              isCurrentPhase={true}
              isFuturePhase={false}
              getItemQuantity={(itemId) => getItemQuantity(currentPhase.id, itemId)}
              onItemQuantityChange={(itemId, quantity) =>
                handleItemQuantityChange(currentPhase.id, itemId, quantity)
              }
              onResetPhase={() => handleResetPhase(currentPhase.id)}
            />
          </div>
        )}

        {/* Phase Dots Navigation */}
        <div className="flex justify-center gap-2 mt-6">
          {phases.map((phase, index) => {
            const isComplete = completedPhases.has(phase.id)
            const isCurrent = index === currentPhaseIndex
            
            return (
              <button
                key={phase.id}
                onClick={() => {
                  if (index !== currentPhaseIndex && !isTransitioning) {
                    setIsTransitioning(true)
                    setCurrentPhaseIndex(index)
                    setTimeout(() => setIsTransitioning(false), 500)
                  }
                }}
                disabled={isTransitioning}
                className={`transition-all duration-300 rounded-full ${
                  isCurrent
                    ? 'w-3 h-3 bg-accent-500 scale-125'
                    : isComplete
                    ? 'w-2.5 h-2.5 bg-green-500 hover:scale-110'
                    : 'w-2.5 h-2.5 bg-primary-300 hover:bg-primary-400 hover:scale-110'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={`Phase ${phase.phase_number}${phase.phase_name ? ` - ${phase.phase_name}` : ''}${isComplete ? ' (Complete)' : ''}`}
              />
            )
          })}
        </div>

        {/* Phase Completion Animation - Subtle */}
        {completedCount > 0 && currentPhase && completedPhases.has(currentPhase.id) && currentPhaseIndex < totalPhases - 1 && isTransitioning && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-50 border border-accent-400 rounded text-xs">
              <CheckCircle className="w-3.5 h-3.5 text-accent-600" />
              <span className="text-accent-700 font-medium">Phase {currentPhase.phase_number} Complete</span>
            </div>
          </div>
        )}
      </div>

      {/* All Phases Modal */}
      {showAllPhasesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAllPhasesModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b-2 border-primary-200 flex items-center justify-between">
              <h2 className="text-2xl font-techno font-bold text-navy-800">All Expedition Phases</h2>
              <button
                onClick={() => setShowAllPhasesModal(false)}
                className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-navy-600" />
              </button>
            </div>

            {/* Phases List */}
            <div className="overflow-y-auto flex-1 p-6">
              <div className="space-y-4">
                {phases.map((phase, index) => {
                  const isComplete = completedPhases.has(phase.id)
                  const isCurrent = index === currentPhaseIndex
                  const isFuture = index > currentPhaseIndex
                  
                  return (
                    <div
                      key={phase.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-accent-400 bg-accent-50'
                          : isComplete
                          ? 'border-green-300 bg-green-50'
                          : isFuture
                          ? 'border-primary-200 bg-primary-50'
                          : 'border-primary-200 bg-white'
                      }`}
                      onClick={() => {
                        if (!isFuture) {
                          setCurrentPhaseIndex(index)
                          setShowAllPhasesModal(false)
                        } else {
                          setPreviewPhaseIndex(index)
                          setShowAllPhasesModal(false)
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isComplete && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          <div>
                            <h3 className={`font-semibold ${
                              isCurrent ? 'text-accent-700' : isComplete ? 'text-green-700' : 'text-navy-800'
                            }`}>
                              Phase {phase.phase_number}
                              {phase.phase_name && (
                                <span className="font-normal ml-2 text-navy-600">
                                  - {phase.phase_name}
                                </span>
                              )}
                              {isCurrent && (
                                <span className="ml-2 text-xs bg-accent-100 text-accent-700 px-2 py-1 rounded">
                                  CURRENT
                                </span>
                              )}
                              {isFuture && (
                                <span className="ml-2 text-xs bg-primary-100 text-navy-600 px-2 py-1 rounded">
                                  UPCOMING
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-navy-500">
                              {phase.requirements?.length || 0} requirement{phase.requirements?.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        {isFuture && (
                          <Eye className="w-5 h-5 text-navy-400" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Future Phase Preview Modal */}
      {previewPhaseIndex !== null && phases[previewPhaseIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setPreviewPhaseIndex(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b-2 border-primary-200 flex items-center justify-between">
              <h2 className="text-2xl font-techno font-bold text-navy-800">
                Preview: Phase {phases[previewPhaseIndex].phase_number}
                {phases[previewPhaseIndex].phase_name && (
                  <span className="text-lg font-normal ml-2 text-navy-600">
                    - {phases[previewPhaseIndex].phase_name}
                  </span>
                )}
              </h2>
              <button
                onClick={() => setPreviewPhaseIndex(null)}
                className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-navy-600" />
              </button>
            </div>

            {/* Preview Content */}
            <div className="overflow-y-auto flex-1 p-6">
              <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
                <p className="text-sm text-amber-800 font-semibold">
                  ⚠️ This is a future phase. Complete previous phases to unlock it.
                </p>
              </div>
              
              <ExpeditionPhaseCard
                phase={phases[previewPhaseIndex]}
                phaseIndex={previewPhaseIndex}
                totalPhases={totalPhases}
                isComplete={false}
                isCurrentPhase={false}
                isFuturePhase={true}
                getItemQuantity={() => 0} // Always return 0 for future phases
                onItemQuantityChange={() => {}} // No-op for future phases
                onResetPhase={() => {}} // No-op for future phases
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
        }
      `}</style>
    </div>
  )
}

export default ExpeditionTracker
