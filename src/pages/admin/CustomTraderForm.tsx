import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Users } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import ImageUpload from '@/components/ImageUpload'
import {
  useCustomTraderByTraderId,
  useCreateCustomTrader,
  useUpdateCustomTrader,
} from '@/hooks/useSupabase'
import { useTrader } from '@/hooks/useArcRaidersApi'
import type { CustomTrader } from '@/lib/supabase'

const CustomTraderForm = () => {
  const { id: traderId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Fetch trader from API
  const { data: apiTrader, isLoading: isLoadingApiTrader, error: apiTraderError } = useTrader(traderId || '')
  // Fetch existing custom trader data
  const { data: existingCustomTrader, isLoading: isLoadingCustom } = useCustomTraderByTraderId(traderId)
  
  const createCustomTrader = useCreateCustomTrader()
  const updateCustomTrader = useUpdateCustomTrader()

  const [formData, setFormData] = useState<Partial<CustomTrader>>({
    trader_id: traderId || '',
    custom_image: '',
  })

  const isLoading = isLoadingApiTrader || isLoadingCustom

  useEffect(() => {
    if (existingCustomTrader) {
      setFormData(existingCustomTrader)
    } else if (traderId) {
      // Initialize with trader_id if no existing custom data
      setFormData({
        trader_id: traderId,
        custom_image: '',
      })
    }
  }, [existingCustomTrader, traderId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.trader_id) {
      alert('Trader ID is required')
      return
    }

    try {
      if (existingCustomTrader?.id) {
        await updateCustomTrader.mutateAsync({
          id: existingCustomTrader.id,
          updates: {
            custom_image: formData.custom_image || undefined,
          },
        })
      } else {
        await createCustomTrader.mutateAsync({
          trader_id: formData.trader_id,
          custom_image: formData.custom_image || undefined,
        })
      }
      navigate('/admin/traders')
    } catch (error: any) {
      console.error('Failed to save custom trader:', error)
      alert(`Failed to save custom trader image: ${error.message || 'Unknown error'}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if ((!isLoading && !apiTrader) || apiTraderError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Trader Not Found</h2>
            <p className="text-red-600">
              {apiTraderError 
                ? `Error loading trader: ${apiTraderError.message}` 
                : `Unable to find trader with ID: ${traderId}`}
            </p>
            <Link to="/admin/traders" className="mt-4 inline-block text-accent-600 hover:text-accent-700">
              ← Back to Traders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!apiTrader) {
    return null // Still loading
  }

  const currentImage = formData.custom_image || apiTrader.avatar || apiTrader.image || apiTrader.imageUrl || apiTrader.icon || apiTrader.thumbnail

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/traders"
            className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Traders
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-navy-800" />
            <h1 className="text-4xl font-techno font-bold text-navy-800">
              EDIT TRADER IMAGE
            </h1>
          </div>
          <p className="text-lg text-navy-600">
            {apiTrader.name}
          </p>
          <p className="text-sm text-navy-500">
            ID: {apiTrader.id}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Trader Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Trader Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Trader Name
                  </label>
                  <input
                    type="text"
                    value={apiTrader.name || ''}
                    disabled
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg bg-primary-50 text-navy-600"
                  />
                </div>

                {apiTrader.location && (
                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={apiTrader.location}
                      disabled
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg bg-primary-50 text-navy-600"
                    />
                  </div>
                )}

                {apiTrader.description && (
                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={apiTrader.description}
                      disabled
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg bg-primary-50 text-navy-600"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Image Upload Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Trader Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Current Image Preview */}
                {currentImage && (
                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-2">
                      Current Image
                    </label>
                    <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-6 flex items-center justify-center h-48 rounded-lg">
                      <img 
                        src={currentImage} 
                        alt={apiTrader.name}
                        className="max-h-full max-w-full object-contain drop-shadow-lg rounded-full"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement
                          if (img.src.includes('.webp')) {
                            img.src = img.src.replace('.webp', '.png')
                            return
                          }
                          img.style.display = 'none'
                          const fallback = img.parentElement!.querySelector('.fallback-icon')
                          if (fallback) {
                            fallback.classList.remove('hidden')
                          }
                        }}
                      />
                      <div className="fallback-icon hidden w-24 h-24 bg-white/30 rounded-full flex items-center justify-center">
                        <span className="text-4xl font-techno text-navy-600">
                          {apiTrader.name?.charAt(0) || '?'}
                        </span>
                      </div>
                    </div>
                    {formData.custom_image && (
                      <p className="text-sm text-accent-600 mt-2">
                        ✓ Using custom image
                      </p>
                    )}
                    {!formData.custom_image && currentImage && (
                      <p className="text-sm text-navy-500 mt-2">
                        Using default API image
                      </p>
                    )}
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <ImageUpload
                    value={formData.custom_image || ''}
                    onChange={(url) => setFormData({ ...formData, custom_image: url })}
                    bucket="maps"
                    folder="traders"
                    label="Upload Custom Image (Optional)"
                    maxSizeMB={10}
                  />
                  <p className="text-sm text-navy-500 mt-2">
                    Upload a custom image to override the default trader image. Leave empty to use the default API image.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              disabled={createCustomTrader.isPending || updateCustomTrader.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {createCustomTrader.isPending || updateCustomTrader.isPending
                ? 'Saving...'
                : existingCustomTrader
                ? 'Update Image'
                : 'Save Image'}
            </Button>
            <Link to="/admin/traders">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CustomTraderForm

