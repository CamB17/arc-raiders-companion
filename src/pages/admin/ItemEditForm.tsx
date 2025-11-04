import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, RefreshCw } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useSupabaseItem, useUpdateSupabaseItem } from '@/hooks/useSupabase'

const ItemEditForm = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: item, isLoading } = useSupabaseItem(id)
  const updateItem = useUpdateSupabaseItem()

  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    rarity: '',
    category: '',
    subcategory: '',
    item_type: '',
    icon: '',
    image: '',
    image_url: '',
    thumbnail: '',
    weight: '',
    stack_size: '',
    value: '',
    recycle_value: '',
    raider_coins: '',
    workbench: '',
    stat_block: '{}',
    components: '[]',
    recycle_breakdown: '[]',
    dropped_by: '[]',
    traders: '[]',
    loadout_slots: [],
  })

  const [loadoutSlotInput, setLoadoutSlotInput] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        rarity: item.rarity || '',
        category: item.category || '',
        subcategory: item.subcategory || '',
        item_type: item.item_type || '',
        icon: item.icon || '',
        image: item.image || '',
        image_url: item.image_url || '',
        thumbnail: item.thumbnail || '',
        weight: item.weight?.toString() || '',
        stack_size: item.stack_size?.toString() || '',
        value: item.value?.toString() || '',
        recycle_value: item.recycle_value?.toString() || '',
        raider_coins: item.raider_coins?.toString() || '',
        workbench: item.workbench || '',
        stat_block: JSON.stringify(item.stat_block || {}, null, 2),
        components: JSON.stringify(item.components || [], null, 2),
        recycle_breakdown: JSON.stringify(item.recycle_breakdown || [], null, 2),
        dropped_by: JSON.stringify(item.dropped_by || [], null, 2),
        traders: JSON.stringify(item.traders || [], null, 2),
        loadout_slots: item.loadout_slots || [],
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!id) {
      alert('Item ID is required')
      return
    }

    try {
      // Parse JSONB fields
      let statBlock = {}
      let components = []
      let recycleBreakdown = []
      let droppedBy = []
      let traders = []

      try {
        statBlock = formData.stat_block ? JSON.parse(formData.stat_block) : {}
      } catch (e) {
        alert('Invalid JSON in Stat Block')
        return
      }

      try {
        components = formData.components ? JSON.parse(formData.components) : []
      } catch (e) {
        alert('Invalid JSON in Components')
        return
      }

      try {
        recycleBreakdown = formData.recycle_breakdown ? JSON.parse(formData.recycle_breakdown) : []
      } catch (e) {
        alert('Invalid JSON in Recycle Breakdown')
        return
      }

      try {
        droppedBy = formData.dropped_by ? JSON.parse(formData.dropped_by) : []
      } catch (e) {
        alert('Invalid JSON in Dropped By')
        return
      }

      try {
        traders = formData.traders ? JSON.parse(formData.traders) : []
      } catch (e) {
        alert('Invalid JSON in Traders')
        return
      }

      const updates: any = {
        name: formData.name,
        description: formData.description || null,
        rarity: formData.rarity || null,
        category: formData.category || null,
        subcategory: formData.subcategory || null,
        item_type: formData.item_type || null,
        icon: formData.icon || null,
        image: formData.image || null,
        image_url: formData.image_url || null,
        thumbnail: formData.thumbnail || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        stack_size: formData.stack_size ? parseInt(formData.stack_size) : null,
        value: formData.value ? parseFloat(formData.value) : null,
        recycle_value: formData.recycle_value ? parseFloat(formData.recycle_value) : null,
        raider_coins: formData.raider_coins ? parseInt(formData.raider_coins) : null,
        workbench: formData.workbench || null,
        stat_block: statBlock,
        components: components,
        recycle_breakdown: recycleBreakdown,
        dropped_by: droppedBy,
        traders: traders,
        loadout_slots: formData.loadout_slots,
      }

      await updateItem.mutateAsync({ id, updates })
      navigate('/admin/data/items')
    } catch (error: any) {
      console.error('Failed to update item:', error)
      alert(`Failed to update item: ${error.message}`)
    }
  }

  const addLoadoutSlot = () => {
    if (loadoutSlotInput.trim()) {
      setFormData({
        ...formData,
        loadout_slots: [...(formData.loadout_slots || []), loadoutSlotInput.trim()],
      })
      setLoadoutSlotInput('')
    }
  }

  const removeLoadoutSlot = (index: number) => {
    setFormData({
      ...formData,
      loadout_slots: formData.loadout_slots.filter((_: any, i: number) => i !== index),
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Item Not Found</h2>
            <p className="text-red-600">The item with ID "{id}" could not be found.</p>
            <Link to="/admin/data/items" className="mt-4 inline-block">
              <Button variant="outline">Back to Items</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/admin/data/items"
          className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Items
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-techno font-bold text-navy-800 mb-2">
              EDIT ITEM
            </h1>
            <p className="text-lg text-navy-600">
              ID: <span className="font-mono">{item.id}</span>
              {item.manually_updated && (
                <span className="ml-4 text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1 inline-flex">
                  <RefreshCw className="w-3 h-3" />
                  Manually Updated
                </span>
              )}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Item Type
                  </label>
                  <input
                    type="text"
                    value={formData.item_type}
                    onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    placeholder="e.g., weapon, armor, consumable"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Rarity
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  >
                    <option value="">Select rarity</option>
                    <option value="common">Common</option>
                    <option value="uncommon">Uncommon</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Workbench
                  </label>
                  <input
                    type="text"
                    value={formData.workbench}
                    onChange={(e) => setFormData({ ...formData, workbench: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    placeholder="e.g., Basic Workbench"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-navy-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Icon URL
                  </label>
                  <input
                    type="url"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Image URL (Alternative)
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats & Economy */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Stats & Economy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Weight
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Stack Size
                  </label>
                  <input
                    type="number"
                    value={formData.stack_size}
                    onChange={(e) => setFormData({ ...formData, stack_size: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Value
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Recycle Value
                  </label>
                  <input
                    type="number"
                    value={formData.recycle_value}
                    onChange={(e) => setFormData({ ...formData, recycle_value: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-700 mb-2">
                    Raider Coins
                  </label>
                  <input
                    type="number"
                    value={formData.raider_coins}
                    onChange={(e) => setFormData({ ...formData, raider_coins: e.target.value })}
                    className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loadout Slots */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Loadout Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={loadoutSlotInput}
                  onChange={(e) => setLoadoutSlotInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLoadoutSlot())}
                  className="flex-1 px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                  placeholder="Add a loadout slot..."
                />
                <Button type="button" onClick={addLoadoutSlot} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.loadout_slots?.map((slot: string, index: number) => (
                  <span
                    key={index}
                    className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    {slot}
                    <button
                      type="button"
                      onClick={() => removeLoadoutSlot(index)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Fields */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Advanced Fields (JSON)</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Hide' : 'Show'}
                </Button>
              </CardTitle>
            </CardHeader>
            {showAdvanced && (
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-2">
                      Stat Block (JSON)
                    </label>
                    <textarea
                      value={formData.stat_block}
                      onChange={(e) => setFormData({ ...formData, stat_block: e.target.value })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 font-mono text-sm"
                      rows={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-2">
                      Components (JSON Array)
                    </label>
                    <textarea
                      value={formData.components}
                      onChange={(e) => setFormData({ ...formData, components: e.target.value })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 font-mono text-sm"
                      rows={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-2">
                      Recycle Breakdown (JSON Array)
                    </label>
                    <textarea
                      value={formData.recycle_breakdown}
                      onChange={(e) => setFormData({ ...formData, recycle_breakdown: e.target.value })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 font-mono text-sm"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-2">
                      Dropped By (JSON Array)
                    </label>
                    <textarea
                      value={formData.dropped_by}
                      onChange={(e) => setFormData({ ...formData, dropped_by: e.target.value })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 font-mono text-sm"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-navy-700 mb-2">
                      Traders (JSON Array)
                    </label>
                    <textarea
                      value={formData.traders}
                      onChange={(e) => setFormData({ ...formData, traders: e.target.value })}
                      className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 font-mono text-sm"
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={updateItem.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateItem.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link to="/admin/data/items">
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

export default ItemEditForm

