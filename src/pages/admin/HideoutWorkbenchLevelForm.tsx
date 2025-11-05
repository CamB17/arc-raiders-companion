import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Plus, X, Search } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  useHideoutWorkbench,
  useHideoutWorkbenchLevel,
  useHideoutWorkbenchLevels,
  useCreateHideoutWorkbenchLevel,
  useUpdateHideoutWorkbenchLevel,
} from '@/hooks/useSupabase'
import { useItems } from '@/hooks/useArcRaidersApi'
import type { HideoutWorkbenchLevel } from '@/lib/supabase'

interface HideoutWorkbenchLevelFormProps {
  workbenchId?: string
  level?: HideoutWorkbenchLevel | null
  onCancel?: () => void
  onSave?: () => void
}

const HideoutWorkbenchLevelForm = ({ workbenchId: propWorkbenchId, level: propLevel, onCancel, onSave }: HideoutWorkbenchLevelFormProps) => {
  const { id, workbenchId: paramWorkbenchId } = useParams<{ id: string; workbenchId: string }>()
  const navigate = useNavigate()
  
  const actualWorkbenchId = propWorkbenchId || paramWorkbenchId
  // If propLevel is provided, we're in edit mode
  const isEditMode = propLevel !== null && propLevel !== undefined ? true : (id !== 'new' && id !== undefined)
  const isNewLevel = !isEditMode

  const { data: workbench, isLoading: workbenchLoading } = useHideoutWorkbench(actualWorkbenchId)
  const { data: existingLevel, isLoading: levelLoading } = useHideoutWorkbenchLevel(isEditMode ? id : undefined)
  const { data: levels } = useHideoutWorkbenchLevels(actualWorkbenchId)
  const { data: itemsResponse } = useItems()
  const allItems = itemsResponse?.data || []
  
  const createLevel = useCreateHideoutWorkbenchLevel()
  const updateLevel = useUpdateHideoutWorkbenchLevel()

  const [formData, setFormData] = useState<Partial<HideoutWorkbenchLevel>>({
    workbench_id: actualWorkbenchId || '',
    level_number: 1,
    requirements: [],
    unlocks: [],
  })

  const [requirementsSearch, setRequirementsSearch] = useState('')
  const [unlocksSearch, setUnlocksSearch] = useState('')
  const [showRequirementsSearch, setShowRequirementsSearch] = useState(false)
  const [showUnlocksSearch, setShowUnlocksSearch] = useState(false)

  useEffect(() => {
    if (propLevel) {
      setFormData(propLevel)
    } else if (existingLevel) {
      setFormData(existingLevel)
    } else if (isNewLevel && actualWorkbenchId) {
      // Find the next level number
      // This would ideally come from the levels list, but for now we'll default to 1
      setFormData({
        workbench_id: actualWorkbenchId,
        level_number: 1,
        requirements: [],
        unlocks: [],
      })
    }
  }, [propLevel, existingLevel, isNewLevel, actualWorkbenchId])

  // Update workbench_id if it's not set
  useEffect(() => {
    if (actualWorkbenchId && !formData.workbench_id) {
      setFormData(prev => ({ ...prev, workbench_id: actualWorkbenchId }))
    }
  }, [actualWorkbenchId, formData.workbench_id])

  const isLoading = workbenchLoading || levelLoading

  const filteredRequirementsItems = allItems.filter(item =>
    item.name?.toLowerCase().includes(requirementsSearch.toLowerCase()) ||
    item.id?.toLowerCase().includes(requirementsSearch.toLowerCase())
  )

  const filteredUnlocksItems = allItems.filter(item =>
    item.name?.toLowerCase().includes(unlocksSearch.toLowerCase()) ||
    item.id?.toLowerCase().includes(unlocksSearch.toLowerCase())
  )

  const handleAddRequirement = (itemId: string) => {
    const existing = formData.requirements?.find(r => r.item_id === itemId)
    if (existing) {
      // Update quantity
      setFormData({
        ...formData,
        requirements: formData.requirements!.map(r =>
          r.item_id === itemId ? { ...r, quantity: r.quantity + 1 } : r
        ),
      })
    } else {
      // Add new requirement
      setFormData({
        ...formData,
        requirements: [...(formData.requirements || []), { item_id: itemId, quantity: 1 }],
      })
    }
    setShowRequirementsSearch(false)
    setRequirementsSearch('')
  }

  const handleRemoveRequirement = (itemId: string) => {
    setFormData({
      ...formData,
      requirements: formData.requirements!.filter(r => r.item_id !== itemId),
    })
  }

  const handleUpdateRequirementQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveRequirement(itemId)
      return
    }
    setFormData({
      ...formData,
      requirements: formData.requirements!.map(r =>
        r.item_id === itemId ? { ...r, quantity } : r
      ),
    })
  }

  const handleAddUnlock = (itemId: string) => {
    const existing = formData.unlocks?.find(u => u.item_id === itemId)
    if (!existing) {
      setFormData({
        ...formData,
        unlocks: [...(formData.unlocks || []), { item_id: itemId }],
      })
    }
    setShowUnlocksSearch(false)
    setUnlocksSearch('')
  }

  const handleRemoveUnlock = (itemId: string) => {
    setFormData({
      ...formData,
      unlocks: formData.unlocks!.filter(u => u.item_id !== itemId),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.workbench_id || !formData.level_number) {
      alert('Workbench ID and level number are required')
      return
    }

    try {
      // Determine the level ID to use - from propLevel, URL param id, or existingLevel
      const levelId = propLevel?.id || id || existingLevel?.id
      
      if (isEditMode && levelId) {
        await updateLevel.mutateAsync({
          id: levelId,
          updates: formData,
        })
      } else {
        // Check if a level with this workbench_id and level_number already exists
        // If it does, update it instead of creating
        const existingLevelForNumber = levels?.find(
          l => l.workbench_id === formData.workbench_id && l.level_number === formData.level_number
        )
        
        if (existingLevelForNumber) {
          // Update existing level instead of creating
          await updateLevel.mutateAsync({
            id: existingLevelForNumber.id,
            updates: formData,
          })
        } else {
          await createLevel.mutateAsync(formData as HideoutWorkbenchLevel)
        }
      }
      
      if (onSave) {
        onSave()
      } else {
        navigate(`/admin/hideout-workbenches/${actualWorkbenchId}/levels`)
      }
    } catch (error: any) {
      console.error('Failed to save level:', error)
      alert(`Failed to save level: ${error.message}`)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigate(`/admin/hideout-workbenches/${actualWorkbenchId}/levels`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!workbench) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Workbench Not Found</h2>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Levels
          </button>
          
          <h1 className="text-4xl font-techno font-bold text-navy-800 mb-2">
            {isEditMode ? `Edit Level ${formData.level_number}` : 'New Level'} - {workbench.name}
          </h1>
          <p className="text-lg text-navy-600">
            Configure requirements and unlocks for this level
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Level Configuration</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Level Number */}
              <div>
                <label htmlFor="level_number" className="block text-sm font-medium text-navy-700 mb-2">
                  Level Number *
                </label>
                <input
                  type="number"
                  id="level_number"
                  min="1"
                  max={workbench.max_level}
                  value={formData.level_number || 1}
                  onChange={(e) => setFormData({ ...formData, level_number: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  required
                  disabled={isEditMode}
                />
                <p className="mt-1 text-sm text-navy-500">
                  Level number for this upgrade (1-{workbench.max_level})
                </p>
              </div>

              {/* Requirements Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-navy-700">
                    Requirements
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRequirementsSearch(!showRequirementsSearch)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {/* Search Dropdown */}
                {showRequirementsSearch && (
                  <div className="mb-4 border border-primary-200 rounded-lg p-4 bg-white">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
                      <input
                        type="text"
                        placeholder="Search items..."
                        value={requirementsSearch}
                        onChange={(e) => setRequirementsSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {filteredRequirementsItems.slice(0, 20).map((item) => {
                        const itemImage = item.icon || item.image || item.imageUrl || item.thumbnail
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleAddRequirement(item.id)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-primary-50 rounded-lg transition-colors text-left"
                          >
                            {itemImage && (
                              <img
                                src={itemImage}
                                alt={item.name}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="text-sm font-medium text-navy-800">{item.name}</div>
                              <div className="text-xs text-navy-500">{item.id}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Requirements List */}
                <div className="space-y-2">
                  {formData.requirements && formData.requirements.length > 0 ? (
                    formData.requirements.map((req) => {
                      const item = allItems.find(i => i.id === req.item_id)
                      const itemImage = item?.icon || item?.image || item?.imageUrl || item?.thumbnail
                      return (
                        <div
                          key={req.item_id}
                          className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg"
                        >
                          {itemImage && (
                            <img
                              src={itemImage}
                              alt={item?.name}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-navy-800">
                              {item?.name || req.item_id}
                            </div>
                            {item?.description && (
                              <div className="text-xs text-navy-500 line-clamp-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={req.quantity}
                              onChange={(e) =>
                                handleUpdateRequirementQuantity(req.item_id, parseInt(e.target.value) || 1)
                              }
                              className="w-20 px-2 py-1 border border-primary-200 rounded text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveRequirement(req.item_id)}
                              className="p-1 text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-navy-500 py-4 text-center">
                      No requirements added. Click "Add Item" to add requirements.
                    </p>
                  )}
                </div>
              </div>

              {/* Unlocks Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-navy-700">
                    Unlocks
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowUnlocksSearch(!showUnlocksSearch)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {/* Search Dropdown */}
                {showUnlocksSearch && (
                  <div className="mb-4 border border-primary-200 rounded-lg p-4 bg-white">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy-400" />
                      <input
                        type="text"
                        placeholder="Search items..."
                        value={unlocksSearch}
                        onChange={(e) => setUnlocksSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {filteredUnlocksItems.slice(0, 20).map((item) => {
                        const itemImage = item.icon || item.image || item.imageUrl || item.thumbnail
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleAddUnlock(item.id)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-primary-50 rounded-lg transition-colors text-left"
                          >
                            {itemImage && (
                              <img
                                src={itemImage}
                                alt={item.name}
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="text-sm font-medium text-navy-800">{item.name}</div>
                              <div className="text-xs text-navy-500">{item.id}</div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Unlocks List */}
                <div className="space-y-2">
                  {formData.unlocks && formData.unlocks.length > 0 ? (
                    formData.unlocks.map((unlock) => {
                      const item = allItems.find(i => i.id === unlock.item_id)
                      const itemImage = item?.icon || item?.image || item?.imageUrl || item?.thumbnail
                      return (
                        <div
                          key={unlock.item_id}
                          className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg"
                        >
                          {itemImage && (
                            <img
                              src={itemImage}
                              alt={item?.name}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <div className="text-sm font-medium text-navy-800">
                              {item?.name || unlock.item_id}
                            </div>
                            {item?.description && (
                              <div className="text-xs text-navy-500 line-clamp-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveUnlock(unlock.item_id)}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-navy-500 py-4 text-center">
                      No unlocks added. Click "Add Item" to add unlocks.
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" disabled={createLevel.isPending || updateLevel.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {createLevel.isPending || updateLevel.isPending ? 'Saving...' : 'Save Level'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}

export default HideoutWorkbenchLevelForm

