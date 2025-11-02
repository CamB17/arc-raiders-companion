import { useRecipes } from '../hooks/useArcRaidersApi'
import { Wrench, Package, ArrowRight } from 'lucide-react'

const Crafting = () => {
  const { data: recipesResponse, isLoading, error } = useRecipes()
  
  // Handle both array and paginated responses
  const recipes = Array.isArray(recipesResponse) 
    ? recipesResponse 
    : recipesResponse?.data || []
  const pagination = !Array.isArray(recipesResponse) ? recipesResponse?.pagination : null
  
  // Debug logging to see what data we're getting - ONLY FIRST RECIPE
  if (recipes.length > 0 && process.env.NODE_ENV === 'development') {
    const firstRecipe = recipes[0]
    if (firstRecipe) {
      console.log('🔍 FIRST RECIPE:', firstRecipe.name)
      console.log('🔍 Has components?', !!firstRecipe.components, 'Count:', firstRecipe.components?.length || 0)
      console.log('🔍 Has requires?', !!firstRecipe.requires, 'Count:', firstRecipe.requires?.length || 0)
      
      const firstComponent = firstRecipe.components?.[0]
      if (firstComponent) {
        console.log('🔍 First component in recipe:', firstComponent)
      }
    }
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Recipes</h2>
          <p className="text-red-600">Unable to fetch crafting recipes from the API. Please try again later.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-techno font-bold text-navy-800 mb-3">
            CRAFTING RECIPES
          </h1>
          <p className="text-navy-600">
            Discover all crafting recipes and required materials
          </p>
          {pagination && (
            <p className="text-sm text-navy-500 mt-2">
              Showing {recipes.length} of {pagination.total} recipes
            </p>
          )}
        </div>
        
        {/* Recipes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-primary-200 p-6 animate-pulse">
                <div className="h-6 bg-primary-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-primary-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-primary-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recipes.map((recipe: any) => (
              <div 
                key={recipe.id}
                className="bg-white rounded-xl border border-primary-200 hover:border-accent-400 p-6 transition-all hover:shadow-lg"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-accent-100 rounded-lg flex-shrink-0">
                    <Wrench className="w-5 h-5 text-accent-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-techno font-bold text-navy-800">
                      {recipe.name}
                    </h3>
                    {recipe.description && (
                      <p className="text-sm text-navy-600 mt-1">
                        {recipe.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {recipe.workbench && (
                        <p className="text-xs text-navy-500">
                          Workbench: {recipe.workbench}
                        </p>
                      )}
                      {recipe.rarity && (
                        <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${
                          recipe.rarity.toLowerCase() === 'common' ? 'bg-gray-500 text-white' :
                          recipe.rarity.toLowerCase() === 'uncommon' ? 'bg-green-600 text-white' :
                          recipe.rarity.toLowerCase() === 'rare' ? 'bg-blue-600 text-white' :
                          recipe.rarity.toLowerCase() === 'epic' ? 'bg-purple-600 text-white' :
                          recipe.rarity.toLowerCase() === 'legendary' ? 'bg-orange-600 text-white' :
                          'bg-navy-600 text-white'
                        }`}>
                          {recipe.rarity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Recipe Flow */}
                <div className="bg-primary-50 rounded-lg p-4 mt-4">
                  {/* Ingredients */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-navy-700 mb-3 uppercase tracking-wide">
                      Materials Required
                    </h4>
                    <div className="space-y-2">
                      {/* Prefer components array (has full details) over requires array */}
                      {(recipe.components || recipe.requires || [])?.map((req: any, index: number) => {
                        // Extract item name with better priority order
                        // Check nested objects FIRST since they have the full data
                        let itemName = 
                          // Check if item/item_id/id are objects with a name property
                          (typeof req.item === 'object' && req.item?.name) ||
                          (typeof req.item_id === 'object' && req.item_id?.name) ||
                          (typeof req.id === 'object' && req.id?.name) ||
                          // Then check direct name fields (but skip if "Unknown Material")
                          (req.name && req.name !== 'Unknown Material' ? req.name : null) ||
                          (req.item_name && req.item_name !== 'Unknown Material' ? req.item_name : null) ||
                          // Check if item is a string
                          (typeof req.item === 'string' && req.item !== 'Unknown Material' ? req.item : null) ||
                          // More fallbacks
                          req.display_name ||
                          req.label ||
                          req.title ||
                          // Extract ID as last resort
                          (typeof req.item === 'object' ? req.item?.id : null) ||
                          (typeof req.item_id === 'object' ? req.item_id?.id : null) ||
                          (typeof req.id === 'object' ? req.id?.id : null) ||
                          'Unknown Material'
                        
                        // Debug log ONLY for first material of first recipe
                        if (itemName === 'Unknown Material' && process.env.NODE_ENV === 'development') {
                          if (recipe === recipes[0] && index === 0) {
                            console.warn('⚠ First material shows Unknown. Component object:', req)
                          }
                        }
                        
                        // Get count/quantity
                        const itemCount = req.count || req.quantity || 1
                        
                        // Get image from multiple possible fields, including nested objects
                        const itemImage = req.image ||
                                        req.imageUrl ||
                                        req.image_url ||
                                        req.icon ||
                                        req.thumbnail ||
                                        (typeof req.item === 'object' ? (req.item?.image || req.item?.imageUrl || req.item?.icon) : null) ||
                                        (typeof req.item_id === 'object' ? (req.item_id?.image || req.item_id?.imageUrl || req.item_id?.icon) : null) ||
                                        (typeof req.id === 'object' ? (req.id?.image || req.id?.imageUrl || req.id?.icon) : null)
                        
                        // Get item ID for linking, extract from objects if needed
                        const itemId = (typeof req.id === 'object' ? req.id?.id : req.id) ||
                                     (typeof req.item_id === 'object' ? req.item_id?.id : req.item_id) ||
                                     (typeof req.item === 'string' ? req.item : null) ||
                                     (typeof req.item === 'object' ? req.item?.id : null) ||
                                     null
                        
                        return (
                          <div 
                            key={index}
                            className="flex items-center justify-between bg-white rounded-lg px-4 py-2"
                          >
                            <div className="flex items-center gap-2">
                              {itemImage ? (
                                <img 
                                  src={itemImage} 
                                  alt={itemName}
                                  className="w-6 h-6 object-contain flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              ) : (
                                <Package className="w-4 h-4 text-navy-500 flex-shrink-0" />
                              )}
                              <span className="text-navy-700 font-medium">
                                {itemId ? (
                                  <a 
                                    href={`/items/${itemId}`}
                                    className="hover:text-accent-600 transition-colors"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      window.location.href = `/items/${itemId}`
                                    }}
                                  >
                                    {itemName}
                                  </a>
                                ) : (
                                  itemName
                                )}
                              </span>
                            </div>
                            <span className="text-accent-600 font-bold">× {itemCount}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex justify-center my-3">
                    <ArrowRight className="w-6 h-6 text-accent-500" />
                  </div>
                  
                  {/* Output */}
                  <div>
                    <h4 className="text-sm font-semibold text-navy-700 mb-2 uppercase tracking-wide">
                      Produces
                    </h4>
                    <div className="bg-accent-100 border-2 border-accent-400 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-accent-600" />
                        <span className="text-navy-800 font-bold text-lg">
                          {recipe.output || recipe.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-200 rounded-full mb-4">
              <Wrench className="w-8 h-8 text-navy-600" />
            </div>
            <p className="text-navy-500 text-lg">No crafting recipes available at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Crafting

