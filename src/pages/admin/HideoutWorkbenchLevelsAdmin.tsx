import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Edit, Trash2, Search } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import {
  useHideoutWorkbench,
  useHideoutWorkbenchLevels,
  useCreateHideoutWorkbenchLevel,
  useUpdateHideoutWorkbenchLevel,
  useDeleteHideoutWorkbenchLevel,
} from '@/hooks/useSupabase'
import { useItems } from '@/hooks/useArcRaidersApi'
import type { HideoutWorkbenchLevel } from '@/lib/supabase'
import HideoutWorkbenchLevelForm from './HideoutWorkbenchLevelForm'

const HideoutWorkbenchLevelsAdmin = () => {
  const { workbenchId } = useParams<{ workbenchId: string }>()
  const { data: workbench, isLoading: workbenchLoading } = useHideoutWorkbench(workbenchId)
  const { data: levels, isLoading: levelsLoading } = useHideoutWorkbenchLevels(workbenchId)
  const { data: itemsResponse } = useItems()
  const allItems = itemsResponse?.data || []
  
  const [editingLevel, setEditingLevel] = useState<HideoutWorkbenchLevel | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const deleteLevel = useDeleteHideoutWorkbenchLevel()

  const isLoading = workbenchLoading || levelsLoading

  const handleDelete = async (levelId: string) => {
    if (window.confirm('Are you sure you want to delete this level? This will remove all requirements and unlocks for this level.')) {
      try {
        await deleteLevel.mutateAsync(levelId)
      } catch (error) {
        console.error('Failed to delete level:', error)
        alert('Failed to delete level')
      }
    }
  }

  const handleEdit = (level: HideoutWorkbenchLevel) => {
    setEditingLevel(level)
  }

  const handleCancel = () => {
    setEditingLevel(null)
  }

  const handleSave = () => {
    setEditingLevel(null)
    // The form component will handle the save and refresh
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
              <p className="text-red-600">The workbench you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If editing, show the form
  if (editingLevel) {
    return (
      <HideoutWorkbenchLevelForm
        workbenchId={workbench.id}
        level={editingLevel}
        onCancel={handleCancel}
        onSave={handleSave}
      />
    )
  }

  // Filter items for search
  const filteredItems = allItems.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/hideout-workbenches"
            className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workbenches
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-techno font-bold text-navy-800 mb-2">
                Manage Levels: {workbench.name}
              </h1>
              <p className="text-lg text-navy-600">
                Add and configure levels for this workbench (Max Level: {workbench.max_level})
              </p>
            </div>
            
            <Link to={`/admin/hideout-workbenches/${workbench.id}/levels/new`}>
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Level
              </Button>
            </Link>
          </div>
        </div>

        {/* Levels List */}
        {levels && levels.length > 0 ? (
          <div className="space-y-4">
            {levels.map((level) => {
              const requirementsCount = level.requirements?.length || 0
              const unlocksCount = level.unlocks?.length || 0
              
              return (
                <Card key={level.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-navy-800">
                            Level {level.level_number}
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-navy-700 mb-1">Requirements</p>
                            <p className="text-sm text-navy-600">
                              {requirementsCount} item{requirementsCount !== 1 ? 's' : ''}
                            </p>
                            {requirementsCount > 0 && (
                              <div className="mt-2 space-y-1">
                                {level.requirements.slice(0, 3).map((req, idx) => {
                                  const item = allItems.find(i => i.id === req.item_id)
                                  return (
                                    <div key={idx} className="text-xs text-navy-500">
                                      {item?.name || req.item_id} × {req.quantity}
                                    </div>
                                  )
                                })}
                                {requirementsCount > 3 && (
                                  <div className="text-xs text-navy-400">
                                    +{requirementsCount - 3} more...
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-navy-700 mb-1">Unlocks</p>
                            <p className="text-sm text-navy-600">
                              {unlocksCount} item{unlocksCount !== 1 ? 's' : ''}
                            </p>
                            {unlocksCount > 0 && (
                              <div className="mt-2 space-y-1">
                                {level.unlocks.slice(0, 3).map((unlock, idx) => {
                                  const item = allItems.find(i => i.id === unlock.item_id)
                                  return (
                                    <div key={idx} className="text-xs text-navy-500">
                                      {item?.name || unlock.item_id}
                                    </div>
                                  )
                                })}
                                {unlocksCount > 3 && (
                                  <div className="text-xs text-navy-400">
                                    +{unlocksCount - 3} more...
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(level)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(level.id)}
                          disabled={deleteLevel.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-navy-600 mb-6">
                No levels configured yet. Add your first level to get started.
              </p>
              <Link to={`/admin/hideout-workbenches/${workbench.id}/levels/new`}>
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Level
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default HideoutWorkbenchLevelsAdmin

