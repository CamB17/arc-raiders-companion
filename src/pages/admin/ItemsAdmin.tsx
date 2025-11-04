import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Edit, Search, ArrowLeft, RefreshCw } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useSupabaseItems, useUpdateSupabaseItem } from '@/hooks/useSupabase'

const ItemsAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [itemTypeFilter, setItemTypeFilter] = useState('')
  const [rarityFilter, setRarityFilter] = useState('')
  const { data: items, isLoading, error } = useSupabaseItems({
    search: searchTerm || undefined,
    item_type: itemTypeFilter || undefined,
    rarity: rarityFilter || undefined,
  })
  const updateItem = useUpdateSupabaseItem()

  const filteredItems = items?.filter((item) => {
    if (searchTerm && !item.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    return true
  })

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
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Items</h2>
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
                <Package className="w-10 h-10" />
                EDIT ITEMS
              </h1>
              <p className="text-lg text-navy-600">
                Update Metaforge item data stored in your database
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>
              
              <select
                value={itemTypeFilter}
                onChange={(e) => setItemTypeFilter(e.target.value)}
                className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
              >
                <option value="">All Item Types</option>
                <option value="weapon">Weapon</option>
                <option value="armor">Armor</option>
                <option value="consumable">Consumable</option>
                <option value="gadget">Gadget</option>
                <option value="material">Material</option>
                <option value="key">Key</option>
              </select>
              
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
              >
                <option value="">All Rarities</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        {filteredItems && filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} hover>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-navy-800">
                          {item.name}
                        </h3>
                        {item.manually_updated && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            Manually Updated
                          </span>
                        )}
                        {item.rarity && (
                          <span className={`text-xs px-2 py-1 rounded capitalize ${
                            item.rarity === 'legendary' ? 'bg-purple-100 text-purple-700' :
                            item.rarity === 'epic' ? 'bg-blue-100 text-blue-700' :
                            item.rarity === 'rare' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.rarity}
                          </span>
                        )}
                        {item.item_type && (
                          <span className="text-sm text-navy-500 bg-navy-100 px-2 py-1 rounded">
                            {item.item_type}
                          </span>
                        )}
                      </div>
                      
                      {item.description && (
                        <p className="text-navy-600 mb-3 line-clamp-2">{item.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-navy-600">
                        {item.value && (
                          <span><strong>Value:</strong> {item.value}</span>
                        )}
                        {item.weight && (
                          <span><strong>Weight:</strong> {item.weight}</span>
                        )}
                        {item.stack_size && (
                          <span><strong>Stack:</strong> {item.stack_size}</span>
                        )}
                      </div>
                      
                      {item.manually_updated_at && (
                        <p className="text-xs text-navy-400 mt-2">
                          Last manually updated: {new Date(item.manually_updated_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Link to={`/admin/data/items/${item.id}`}>
                        <Button size="sm" variant="primary">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Package className="w-16 h-16 text-navy-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-navy-800 mb-2">
                No Items Found
              </h3>
              <p className="text-navy-600">
                {searchTerm || itemTypeFilter || rarityFilter
                  ? 'Try adjusting your filters'
                  : 'Items will appear here after running the sync script'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default ItemsAdmin

