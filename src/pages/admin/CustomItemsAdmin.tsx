import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Plus, Edit, Trash2, Search, ArrowLeft } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  useCustomItems,
  useDeleteCustomItem,
} from '@/hooks/useSupabase'

const CustomItemsAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: customItems, isLoading, error } = useCustomItems()
  const deleteCustomItem = useDeleteCustomItem()

  const filteredItems = customItems?.filter((item) =>
    item.item_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.custom_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this custom item data?')) {
      try {
        await deleteCustomItem.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete custom item:', error)
        alert('Failed to delete custom item')
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
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Custom Items</h2>
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
                CUSTOM ITEMS
              </h1>
              <p className="text-lg text-navy-600">
                Manage custom data for items from the API
              </p>
            </div>
            
            <Link to="/admin/items/new">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Item
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search by item ID, name, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
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
                          {item.custom_name || item.item_id}
                        </h3>
                        <span className="text-sm text-navy-500 bg-navy-100 px-2 py-1 rounded">
                          ID: {item.item_id}
                        </span>
                        {item.meta_rating && (
                          <span className="text-sm text-accent-600 font-semibold">
                            ⭐ {item.meta_rating}/5
                          </span>
                        )}
                      </div>
                      
                      {item.custom_description && (
                        <p className="text-navy-600 mb-3">{item.custom_description}</p>
                      )}
                      
                      {item.tips && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <p className="text-sm text-blue-800">
                            <strong>Tips:</strong> {item.tips}
                          </p>
                        </div>
                      )}
                      
                      {item.locations_found && item.locations_found.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm text-navy-600 font-semibold">Locations: </span>
                          <span className="text-sm text-navy-600">
                            {item.locations_found.join(', ')}
                          </span>
                        </div>
                      )}
                      
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Link to={`/admin/items/${item.id}`}>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteCustomItem.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
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
                No Custom Items Yet
              </h3>
              <p className="text-navy-600 mb-6">
                Start adding custom data to enhance items from the API
              </p>
              <Link to="/admin/items/new">
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Custom Item
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CustomItemsAdmin

