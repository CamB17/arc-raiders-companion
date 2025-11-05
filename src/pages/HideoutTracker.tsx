import { useState, useEffect, useRef } from 'react'
import { useHideoutWorkbenchesWithLevels } from '@/hooks/useSupabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import WorkbenchCard from '@/components/WorkbenchCard'
import { Download, Upload, CheckCircle, AlertCircle, X } from 'lucide-react'

const STORAGE_KEY = 'hideout_tracker_levels'
const ITEMS_STORAGE_KEY = 'hideout_tracker_items'

// Type for item tracking: { [workbenchId]: { [levelNumber]: { [itemId]: quantity } } }
type ItemTracking = Record<string, Record<number, Record<string, number>>>

const HideoutTracking = () => {
  const { data: workbenches, isLoading, error } = useHideoutWorkbenchesWithLevels()
  const [workbenchLevels, setWorkbenchLevels] = useState<Record<string, number>>({})
  const [itemTracking, setItemTracking] = useState<ItemTracking>({})
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load saved levels from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setWorkbenchLevels(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved hideout levels:', e)
      }
    }
  }, [])

  // Load saved item tracking from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(ITEMS_STORAGE_KEY)
    if (saved) {
      try {
        setItemTracking(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved item tracking:', e)
      }
    }
  }, [])

  // Save levels to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(workbenchLevels).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workbenchLevels))
    }
  }, [workbenchLevels])

  // Save item tracking to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(itemTracking).length > 0) {
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(itemTracking))
    }
  }, [itemTracking])

  const handleLevelChange = (workbenchId: string, level: number) => {
    setWorkbenchLevels(prev => ({
      ...prev,
      [workbenchId]: level,
    }))
  }

  const handleItemQuantityChange = (
    workbenchId: string,
    levelNumber: number,
    itemId: string,
    quantity: number
  ) => {
    setItemTracking(prev => {
      const updated = { ...prev }
      if (!updated[workbenchId]) {
        updated[workbenchId] = {}
      }
      if (!updated[workbenchId][levelNumber]) {
        updated[workbenchId][levelNumber] = {}
      }
      updated[workbenchId][levelNumber] = {
        ...updated[workbenchId][levelNumber],
        [itemId]: Math.max(0, quantity), // Ensure non-negative
      }
      // Clean up empty entries
      if (updated[workbenchId][levelNumber][itemId] === 0) {
        delete updated[workbenchId][levelNumber][itemId]
      }
      if (Object.keys(updated[workbenchId][levelNumber]).length === 0) {
        delete updated[workbenchId][levelNumber]
      }
      if (Object.keys(updated[workbenchId]).length === 0) {
        delete updated[workbenchId]
      }
      return updated
    })
  }

  const getCurrentLevel = (workbenchId: string): number => {
    return workbenchLevels[workbenchId] ?? 1
  }

  const getItemQuantity = (
    workbenchId: string,
    levelNumber: number,
    itemId: string
  ): number => {
    return itemTracking[workbenchId]?.[levelNumber]?.[itemId] ?? 0
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
        workbenchLevels,
        itemTracking,
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hideout-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
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
      if (!importData.workbenchLevels || !importData.itemTracking) {
        throw new Error('Invalid backup file format')
      }

      // Restore the data
      setWorkbenchLevels(importData.workbenchLevels || {})
      setItemTracking(importData.itemTracking || {})

      // Save to localStorage immediately
      localStorage.setItem(STORAGE_KEY, JSON.stringify(importData.workbenchLevels || {}))
      localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(importData.itemTracking || {}))

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

  if (!workbenches || workbenches.length === 0) {
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
              HIDEOUT CONTROL SYSTEM
            </h1>
            <p className="text-navy-600 text-lg max-w-3xl mx-auto mt-4">
              Monitor and manage workbench infrastructure. Progress synchronized locally.
            </p>
          </div>
          <div className="bg-white border-2 border-primary-200 rounded-lg p-12 text-center shadow-xl">
            <div className="text-navy-500 mb-2 font-mono text-sm">NO WORKBENCHES DETECTED</div>
            <p className="text-navy-600">
              Configure workbenches in the admin panel to begin tracking.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate overall progress (level 1 is minimum, so adjust calculation)
  const totalProgress = workbenches.reduce((acc, wb) => {
    const current = getCurrentLevel(wb.id)
    // Level 1 = 0% progress, level max = 100% progress
    // If max_level is 1, then level 1 is already 100%
    const progress = wb.max_level === 1 ? 1 : (current - 1) / (wb.max_level - 1)
    return acc + progress
  }, 0) / workbenches.length

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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header with futuristic styling */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-4">
            <h1 className="text-5xl font-techno font-bold bg-gradient-to-r from-accent-500 via-accent-600 to-navy-800 bg-clip-text text-transparent mb-2 drop-shadow-[0_0_20px_rgba(240,80,36,0.3)]">
              HIDEOUT CONTROL SYSTEM
            </h1>
            <div className="h-1 bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-50"></div>
          </div>
          <p className="text-navy-600 text-lg max-w-3xl mx-auto mt-4">
            Monitor and manage workbench infrastructure. Progress synchronized locally.
          </p>
          
          {/* Import/Export Controls */}
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg border-2 border-accent-600 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              title="Export your hideout tracker data as a backup file"
            >
              <Download className="w-4 h-4" />
              EXPORT DATA
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-lg border-2 border-navy-700 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              title="Import previously exported backup data"
            >
              <Upload className="w-4 h-4" />
              IMPORT DATA
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          
          {/* Overall Progress Indicator */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-navy-600 mb-2">
              <span className="font-semibold">FACILITY STATUS</span>
              <span className="text-accent-600 font-mono font-bold">{Math.round(totalProgress * 100)}%</span>
            </div>
            <div className="h-2 bg-primary-200 rounded-full overflow-hidden border border-primary-300">
              <div 
                className="h-full bg-gradient-to-r from-accent-500 via-accent-600 to-navy-700 transition-all duration-500 shadow-[0_0_10px_rgba(240,80,36,0.4)]"
                style={{ width: `${totalProgress * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Workbenches - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workbenches.map((workbench) => (
            <WorkbenchCard
              key={workbench.id}
              workbench={workbench}
              currentLevel={getCurrentLevel(workbench.id)}
              onLevelChange={handleLevelChange}
              getItemQuantity={(levelNumber, itemId) =>
                getItemQuantity(workbench.id, levelNumber, itemId)
              }
              onItemQuantityChange={(levelNumber, itemId, quantity) =>
                handleItemQuantityChange(workbench.id, levelNumber, itemId, quantity)
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HideoutTracking

