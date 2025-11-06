import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Rocket, Plus, Edit, Trash2, ArrowLeft, Layers } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  useExpedition,
  useExpeditionPhases,
  useUpdateExpedition,
  useCreateExpedition,
  useDeleteExpeditionPhase,
} from '@/hooks/useSupabase'
import ImageUpload from '@/components/ImageUpload'

const ExpeditionAdmin = () => {
  const { data: expedition, isLoading, error } = useExpedition()
  const { data: phases } = useExpeditionPhases(expedition?.id)
  const updateExpedition = useUpdateExpedition()
  const createExpedition = useCreateExpedition()
  const deletePhase = useDeleteExpeditionPhase()

  const [formData, setFormData] = useState({
    name: expedition?.name || 'Expedition',
    image_url: expedition?.image_url || '',
    description: expedition?.description || '',
  })

  const handleSave = async () => {
    try {
      if (expedition) {
        await updateExpedition.mutateAsync({
          id: expedition.id,
          updates: formData,
        })
      } else {
        await createExpedition.mutateAsync(formData)
      }
      alert('Expedition saved successfully!')
    } catch (error: any) {
      console.error('Failed to save expedition:', error)
      alert(`Failed to save expedition: ${error.message}`)
    }
  }

  const handleDeletePhase = async (phaseId: string) => {
    if (window.confirm('Are you sure you want to delete this phase?')) {
      try {
        await deletePhase.mutateAsync(phaseId)
      } catch (error) {
        console.error('Failed to delete phase:', error)
        alert('Failed to delete phase')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Expedition</h2>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-techno font-bold text-navy-800 mb-2 flex items-center gap-3">
                <Rocket className="w-10 h-10" />
                EXPEDITION ADMIN
              </h1>
              <p className="text-lg text-navy-600">
                Manage the expedition and its phases
              </p>
            </div>
          </div>
        </div>

        {/* Expedition Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Expedition Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-navy-700 mb-2">
                Expedition Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                required
              />
            </div>

            <div>
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                bucket="maps"
                folder="expeditions"
                label="Expedition Image"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-navy-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                placeholder="Optional description of the expedition"
              />
            </div>

            <Button onClick={handleSave} variant="primary" disabled={updateExpedition.isPending || createExpedition.isPending}>
              {updateExpedition.isPending || createExpedition.isPending ? 'Saving...' : 'Save Expedition'}
            </Button>
          </CardContent>
        </Card>

        {/* Phases List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Expedition Phases</CardTitle>
              {expedition && (
                <Link to={`/admin/expedition/phases/new`}>
                  <Button variant="primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Phase
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!expedition ? (
              <div className="text-center py-8 text-navy-500">
                <p className="mb-4">Create an expedition first to add phases.</p>
              </div>
            ) : phases && phases.length > 0 ? (
              <div className="space-y-4">
                {phases.map((phase) => {
                  const requirementsCount = phase.requirements?.length || 0
                  
                  return (
                    <div key={phase.id} className="flex items-start justify-between p-4 bg-primary-50 rounded-lg border border-primary-200">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-navy-800">
                            Phase {phase.phase_number}
                            {phase.phase_name && (
                              <span className="text-sm font-normal text-navy-600 ml-2">
                                - {phase.phase_name}
                              </span>
                            )}
                          </h3>
                        </div>
                        <p className="text-sm text-navy-600">
                          {requirementsCount} requirement{requirementsCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Link to={`/admin/expedition/phases/${phase.id}`}>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePhase(phase.id)}
                          disabled={deletePhase.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-navy-500">
                <Layers className="w-16 h-16 text-navy-300 mx-auto mb-4" />
                <p className="mb-4">No phases yet. Add your first phase to get started.</p>
                <Link to={`/admin/expedition/phases/new`}>
                  <Button variant="primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Phase
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ExpeditionAdmin

