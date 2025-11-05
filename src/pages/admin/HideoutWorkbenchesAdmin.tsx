import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wrench, Plus, Edit, Trash2, Search, ArrowLeft, Layers } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  useHideoutWorkbenches,
  useDeleteHideoutWorkbench,
} from '@/hooks/useSupabase'

const HideoutWorkbenchesAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: workbenches, isLoading, error } = useHideoutWorkbenches()
  const deleteWorkbench = useDeleteHideoutWorkbench()

  const filteredWorkbenches = workbenches?.filter((workbench) =>
    workbench.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workbench.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workbench? This will also delete all associated levels.')) {
      try {
        await deleteWorkbench.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete workbench:', error)
        alert('Failed to delete workbench')
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
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Workbenches</h2>
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
                <Wrench className="w-10 h-10" />
                HIDEOUT WORKBENCHES
              </h1>
              <p className="text-lg text-navy-600">
                Manage workbenches and their upgrade levels
              </p>
            </div>
            
            <Link to="/admin/hideout-workbenches/new">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Workbench
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
                placeholder="Search workbenches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Workbenches List */}
        {filteredWorkbenches && filteredWorkbenches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredWorkbenches.map((workbench) => (
              <Card key={workbench.id} hover>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {workbench.image_url && (
                          <img
                            src={workbench.image_url}
                            alt={workbench.name}
                            className="w-16 h-16 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                        <div>
                          <h3 className="text-xl font-semibold text-navy-800">
                            {workbench.name}
                          </h3>
                          <p className="text-sm text-navy-500">
                            Max Level: {workbench.max_level} | Display Order: {workbench.display_order}
                          </p>
                        </div>
                      </div>
                      
                      {workbench.description && (
                        <p className="text-navy-600 mb-3">{workbench.description}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Link to={`/admin/hideout-workbenches/${workbench.id}/levels`}>
                        <Button size="sm" variant="outline">
                          <Layers className="w-4 h-4 mr-2" />
                          Manage Levels
                        </Button>
                      </Link>
                      <Link to={`/admin/hideout-workbenches/${workbench.id}`}>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(workbench.id)}
                        disabled={deleteWorkbench.isPending}
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
              <Wrench className="w-16 h-16 text-navy-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-navy-800 mb-2">
                No Workbenches Yet
              </h3>
              <p className="text-navy-600 mb-6">
                Start by adding your first workbench
              </p>
              <Link to="/admin/hideout-workbenches/new">
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Workbench
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default HideoutWorkbenchesAdmin

