import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import ImageUpload from '@/components/ImageUpload'
import {
  useHideoutWorkbench,
  useCreateHideoutWorkbench,
  useUpdateHideoutWorkbench,
} from '@/hooks/useSupabase'
import type { HideoutWorkbench } from '@/lib/supabase'

const HideoutWorkbenchForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = id !== 'new'

  const { data: existingWorkbench, isLoading } = useHideoutWorkbench(isEditMode ? id : undefined)
  const createWorkbench = useCreateHideoutWorkbench()
  const updateWorkbench = useUpdateHideoutWorkbench()

  const [formData, setFormData] = useState<Partial<HideoutWorkbench>>({
    name: '',
    image_url: '',
    max_level: 3,
    display_order: 0,
    description: '',
  })

  useEffect(() => {
    if (existingWorkbench) {
      setFormData(existingWorkbench)
    }
  }, [existingWorkbench])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      alert('Workbench name is required')
      return
    }

    try {
      if (isEditMode && id) {
        await updateWorkbench.mutateAsync({
          id,
          updates: formData,
        })
      } else {
        await createWorkbench.mutateAsync(formData)
      }
      navigate('/admin/hideout-workbenches')
    } catch (error: any) {
      console.error('Failed to save workbench:', error)
      alert(`Failed to save workbench: ${error.message}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/hideout-workbenches"
            className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workbenches
          </Link>
          
          <h1 className="text-4xl font-techno font-bold text-navy-800 mb-2">
            {isEditMode ? 'Edit Workbench' : 'New Workbench'}
          </h1>
          <p className="text-lg text-navy-600">
            {isEditMode ? 'Update workbench information' : 'Create a new hideout workbench'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Workbench Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-navy-700 mb-2">
                  Workbench Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  required
                  placeholder="e.g., Scrappy, Gunsmith, Gear Bench"
                />
              </div>

              {/* Image */}
              <div>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  bucket="maps"
                  folder="workbenches"
                  label="Workbench Image"
                />
              </div>

              {/* Max Level */}
              <div>
                <label htmlFor="max_level" className="block text-sm font-medium text-navy-700 mb-2">
                  Maximum Level *
                </label>
                <input
                  type="number"
                  id="max_level"
                  min="1"
                  max="10"
                  value={formData.max_level || 3}
                  onChange={(e) => setFormData({ ...formData, max_level: parseInt(e.target.value) || 3 })}
                  className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  required
                />
                <p className="mt-1 text-sm text-navy-500">
                  The maximum upgrade level for this workbench
                </p>
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
                  Lower numbers appear first on the tracker page
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-navy-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  placeholder="Optional description of this workbench"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" disabled={createWorkbench.isPending || updateWorkbench.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {createWorkbench.isPending || updateWorkbench.isPending ? 'Saving...' : 'Save Workbench'}
                </Button>
                <Link to="/admin/hideout-workbenches">
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

export default HideoutWorkbenchForm

