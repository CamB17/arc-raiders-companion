import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Star, Scroll, Home, Rocket, Hammer, Sparkles } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  useCustomItem,
  useCustomItemByItemId,
  useCreateCustomItem,
  useUpdateCustomItem,
} from '@/hooks/useSupabase'
import { useAutoFlags } from '@/hooks/useAutoFlags'
import type { CustomItem } from '@/lib/supabase'

const CustomItemForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = id !== 'new' && id !== undefined

  // If editing, first try to get by custom item ID, then by item_id
  const { data: existingItemById, isLoading: loadingById } = useCustomItem(isEditMode ? id : undefined)
  const { data: existingItemByItemId, isLoading: loadingByItemId } = useCustomItemByItemId(isEditMode ? id : undefined)
  
  const existingItem = existingItemById || existingItemByItemId
  const isLoading = loadingById || loadingByItemId
  
  const createCustomItem = useCreateCustomItem()
  const updateCustomItem = useUpdateCustomItem()
  
  // Get auto-detected flags for this item
  const { flags: autoFlags, reasons: autoFlagReasons } = useAutoFlags(isEditMode ? id : undefined)

  const [formData, setFormData] = useState<Partial<CustomItem>>({
    item_id: isEditMode ? id : '',
    custom_name: '',
    custom_description: '',
    custom_image: '',
    tips: '',
    locations_found: [],
    best_use_cases: [],
    meta_rating: undefined,
    meta_notes: '',
    tags: [],
    item_flags: [],
  })

  const [locationInput, setLocationInput] = useState('')
  const [useCaseInput, setUseCaseInput] = useState('')
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (existingItem) {
      setFormData(existingItem)
    }
  }, [existingItem])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.item_id) {
      alert('Item ID is required')
      return
    }

    try {
      if (existingItem?.id) {
        await updateCustomItem.mutateAsync({
          id: existingItem.id,
          updates: formData,
        })
      } else {
        await createCustomItem.mutateAsync(formData)
      }
      navigate('/admin/items-list')
    } catch (error: any) {
      console.error('Failed to save custom item:', error)
      
      // Show detailed error message
      let errorMessage = 'Failed to save custom item.\n\n'
      
      if (error?.message) {
        errorMessage += `Error: ${error.message}\n`
      }
      
      if (error?.code === 'PGRST116') {
        errorMessage += '\nThe custom_items table does not exist. Please run the database schema in Supabase.'
      } else if (error?.code === '42P01') {
        errorMessage += '\nDatabase table not found. Please run the SQL schema from SUPABASE_SCHEMA.md in your Supabase SQL editor.'
      } else if (error?.message?.includes('JWT')) {
        errorMessage += '\nAuthentication error. Check your VITE_SUPABASE_ANON_KEY in .env file.'
      } else if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
        errorMessage += '\nNetwork error. Check your VITE_SUPABASE_URL and internet connection.'
      } else if (error?.message?.includes('violates row-level security policy')) {
        errorMessage += '\nPermission denied. Check Row Level Security policies in Supabase.'
      }
      
      errorMessage += '\n\nCheck browser console for full error details.'
      
      alert(errorMessage)
    }
  }

  const addLocation = () => {
    if (locationInput.trim()) {
      setFormData({
        ...formData,
        locations_found: [...(formData.locations_found || []), locationInput.trim()],
      })
      setLocationInput('')
    }
  }

  const removeLocation = (index: number) => {
    setFormData({
      ...formData,
      locations_found: formData.locations_found?.filter((_, i) => i !== index),
    })
  }

  const addUseCase = () => {
    if (useCaseInput.trim()) {
      setFormData({
        ...formData,
        best_use_cases: [...(formData.best_use_cases || []), useCaseInput.trim()],
      })
      setUseCaseInput('')
    }
  }

  const removeUseCase = (index: number) => {
    setFormData({
      ...formData,
      best_use_cases: formData.best_use_cases?.filter((_, i) => i !== index),
    })
  }

  const addTag = () => {
    if (tagInput.trim()) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      })
      setTagInput('')
    }
  }

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((_, i) => i !== index),
    })
  }

  const toggleItemFlag = (flag: string) => {
    const currentFlags = formData.item_flags || []
    const newFlags = currentFlags.includes(flag)
      ? currentFlags.filter(f => f !== flag)
      : [...currentFlags, flag]
    setFormData({
      ...formData,
      item_flags: newFlags,
    })
  }
  
  const applyAutoFlags = () => {
    const currentFlags = formData.item_flags || []
    const mergedFlags = Array.from(new Set([...currentFlags, ...autoFlags]))
    setFormData({
      ...formData,
      item_flags: mergedFlags,
    })
  }

  if (isLoading && isEditMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/admin/items-list"
          className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Items
        </Link>

        <h1 className="text-4xl font-techno font-bold text-navy-800 mb-8">
          {existingItem ? 'EDIT ITEM DATA' : 'ADD ITEM DATA'}
        </h1>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Item ID (from API) *
                  </label>
                  <input
                    type="text"
                    value={formData.item_id}
                    onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    placeholder="e.g., herbal-bandage"
                    required
                    disabled={isEditMode}
                  />
                  <p className="text-sm text-navy-500 mt-1">
                    The ID of the item from the Arc Raiders API
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Custom Name (Override)
                  </label>
                  <input
                    type="text"
                    value={formData.custom_name || ''}
                    onChange={(e) => setFormData({ ...formData, custom_name: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    placeholder="Optional: Override the item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Custom Description
                  </label>
                  <textarea
                    value={formData.custom_description || ''}
                    onChange={(e) => setFormData({ ...formData, custom_description: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    rows={3}
                    placeholder="Additional description or notes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Custom Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.custom_image || ''}
                    onChange={(e) => setFormData({ ...formData, custom_image: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Gameplay Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Tips & Tricks
                  </label>
                  <textarea
                    value={formData.tips || ''}
                    onChange={(e) => setFormData({ ...formData, tips: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    rows={3}
                    placeholder="Helpful tips for using this item"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Meta Notes
                  </label>
                  <textarea
                    value={formData.meta_notes || ''}
                    onChange={(e) => setFormData({ ...formData, meta_notes: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    rows={2}
                    placeholder="Meta game analysis and notes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Meta Rating (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.meta_rating || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, meta_rating: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    placeholder="1-5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Locations Found
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                      className="flex-1 px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                      placeholder="Add a location..."
                    />
                    <Button type="button" onClick={addLocation} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.locations_found?.map((location, index) => (
                      <span
                        key={index}
                        className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {location}
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Best Use Cases
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={useCaseInput}
                      onChange={(e) => setUseCaseInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUseCase())}
                      className="flex-1 px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                      placeholder="Add a use case..."
                    />
                    <Button type="button" onClick={addUseCase} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.best_use_cases?.map((useCase, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {useCase}
                        <button
                          type="button"
                          onClick={() => removeUseCase(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                      placeholder="Add a tag..."
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="text-accent-600 hover:text-accent-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-navy-700">
                      Item Categories (Flags)
                    </label>
                    {autoFlags.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={applyAutoFlags}
                      >
                        <Sparkles className="w-4 h-4 mr-1" />
                        Apply {autoFlags.length} Auto-Detected
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-navy-500 mb-3">
                    Mark this item with categories to show icons on item cards
                  </p>
                  
                  {autoFlags.length > 0 && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800 mb-1">
                            Auto-Detected Usage:
                          </p>
                          <ul className="text-xs text-blue-700 space-y-0.5">
                            {Object.entries(autoFlagReasons).map(([flag, reasons]) => (
                              <li key={flag}>
                                <strong className="capitalize">{flag.replace(/_/g, ' ')}:</strong> {reasons.length} use{reasons.length !== 1 ? 's' : ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { flag: 'important_save', label: 'Important Save', Icon: Star },
                      { flag: 'quest_item', label: 'Quest Item', Icon: Scroll },
                      { flag: 'hideout_item', label: 'Hideout Item', Icon: Home },
                      { flag: 'project_item', label: 'Project Item', Icon: Rocket },
                      { flag: 'crafting_item', label: 'Crafting Item', Icon: Hammer },
                    ].map(({ flag, label, Icon }) => {
                      const isSelected = formData.item_flags?.includes(flag)
                      const isAutoDetected = autoFlags.includes(flag)
                      
                      return (
                        <button
                          key={flag}
                          type="button"
                          onClick={() => toggleItemFlag(flag)}
                          className={`p-3 rounded-lg border-2 transition-all text-left relative ${
                            isSelected
                              ? 'border-accent-500 bg-accent-50 text-accent-700'
                              : isAutoDetected
                              ? 'border-blue-300 bg-blue-50 text-blue-700'
                              : 'border-primary-200 bg-white text-navy-700 hover:border-primary-300'
                          }`}
                        >
                          {isAutoDetected && !isSelected && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" title="Auto-detected" />
                          )}
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{label}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={createCustomItem.isPending || updateCustomItem.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {existingItem ? 'Update' : 'Save'} Item Data
            </Button>
            <Link to="/admin/items-list">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CustomItemForm

