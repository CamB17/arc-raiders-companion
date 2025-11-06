import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Plus, X, Search } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  useExpedition,
  useExpeditionPhase,
  useExpeditionPhases,
  useCreateExpeditionPhase,
  useUpdateExpeditionPhase,
} from '@/hooks/useSupabase'
import { useItems } from '@/hooks/useArcRaidersApi'
import type { ExpeditionPhase } from '@/lib/supabase'

const ExpeditionPhaseForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = id !== 'new'

  const { data: expedition } = useExpedition()
  const { data: existingPhase, isLoading: phaseLoading } = useExpeditionPhase(isEditMode ? id : undefined)
  const { data: phases } = useExpeditionPhases(expedition?.id)
  const { data: itemsResponse } = useItems()
  const allItems = itemsResponse?.data || []
  
  const createPhase = useCreateExpeditionPhase()
  const updatePhase = useUpdateExpeditionPhase()

  const [formData, setFormData] = useState<Partial<ExpeditionPhase>>({
    expedition_id: expedition?.id || '',
    phase_number: 1,
    phase_name: '',
    requirements: [],
    display_order: 0,
  })

  const [requirementsSearch, setRequirementsSearch] = useState('')
  const [showRequirementsSearch, setShowRequirementsSearch] = useState(false)

  useEffect(() => {
    if (existingPhase) {
      setFormData(existingPhase)
    } else if (!isEditMode && expedition) {
      // Find the next phase number
      const maxPhase = phases?.reduce((max, p) => Math.max(max, p.phase_number), 0) || 0
      setFormData({
        expedition_id: expedition.id,
        phase_number: maxPhase + 1,
        phase_name: '',
        requirements: [],
        display_order: maxPhase,
      })
    }
  }, [existingPhase, isEditMode, expedition, phases])

  // Update expedition_id if it's not set
  useEffect(() => {
    if (expedition?.id && !formData.expedition_id) {
      setFormData(prev => ({ ...prev, expedition_id: expedition.id }))
    }
  }, [expedition?.id, formData.expedition_id])

  const isLoading = phaseLoading

  const filteredRequirementsItems = allItems.filter(item =>
    item.name?.toLowerCase().includes(requirementsSearch.toLowerCase()) ||
    item.id?.toLowerCase().includes(requirementsSearch.toLowerCase())
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.expedition_id || !formData.phase_number) {
      alert('Expedition ID and phase number are required')
      return
    }

    try {
      if (isEditMode && id) {
        await updatePhase.mutateAsync({
          id,
          updates: formData,
        })
      } else {
        // Check if a phase with this expedition_id and phase_number already exists
        const existingPhaseForNumber = phases?.find(
          p => p.expedition_id === formData.expedition_id && p.phase_number === formData.phase_number
        )
        
        if (existingPhaseForNumber) {
          // Warn user that a phase with this number already exists
          const confirmMessage = `A phase with number ${formData.phase_number} already exists. Do you want to update it instead of creating a new phase?`
          if (window.confirm(confirmMessage)) {
            await updatePhase.mutateAsync({
              id: existingPhaseForNumber.id,
              updates: formData,
            })
          } else {
            // User cancelled - don't save
            return
          }
        } else {
          // Create new phase
          await createPhase.mutateAsync(formData as ExpeditionPhase)
        }
      }
      
      navigate('/admin/expedition')
    } catch (error: any) {
      console.error('Failed to save phase:', error)
      alert(`Failed to save phase: ${error.message}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!expedition) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Expedition Not Found</h2>
              <p className="text-red-600 mb-4">Please create an expedition first.</p>
              <Link to="/admin/expedition">
                <Button variant="primary">Go to Expedition Admin</Button>
              </Link>
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
          <Link
            to="/admin/expedition"
            className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Expedition Admin
          </Link>
          
          <h1 className="text-4xl font-techno font-bold text-navy-800 mb-2">
            {isEditMode ? `Edit Phase ${formData.phase_number}` : 'New Phase'} - {expedition.name}
          </h1>
          <p className="text-lg text-navy-600">
            Configure requirements for this phase
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Phase Configuration</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Phase Number */}
              <div>
                <label htmlFor="phase_number" className="block text-sm font-medium text-navy-700 mb-2">
                  Phase Number *
                </label>
                <input
                  type="number"
                  id="phase_number"
                  min="1"
                  value={formData.phase_number || 1}
                  onChange={(e) => setFormData({ ...formData, phase_number: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  required
                />
                {phases && phases.some(p => p.phase_number === formData.phase_number && p.id !== id) && (
                  <p className="mt-1 text-sm text-amber-600">
                    ⚠️ A phase with number {formData.phase_number} already exists. You can change this number or update the existing phase.
                  </p>
                )}
              </div>

              {/* Phase Name */}
              <div>
                <label htmlFor="phase_name" className="block text-sm font-medium text-navy-700 mb-2">
                  Phase Name (Optional)
                </label>
                <input
                  type="text"
                  id="phase_name"
                  value={formData.phase_name || ''}
                  onChange={(e) => setFormData({ ...formData, phase_name: e.target.value })}
                  className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  placeholder="e.g., Initial Setup, Advanced Materials"
                />
              </div>

              {/* Display Order */}
              <div>
                <label htmlFor="display_order" className="block text-sm font-medium text-navy-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  id="display_order"
                  value={formData.display_order || 0}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
                <p className="mt-1 text-sm text-navy-500">
                  Lower numbers appear first
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

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" disabled={createPhase.isPending || updatePhase.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {createPhase.isPending || updatePhase.isPending ? 'Saving...' : 'Save Phase'}
                </Button>
                <Link to="/admin/expedition">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}

export default ExpeditionPhaseForm

