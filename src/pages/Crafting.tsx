import { useRecipes } from '../hooks/useArcRaidersApi'
import { Wrench, Package, ArrowRight } from 'lucide-react'

const Crafting = () => {
  const { data: recipes, isLoading, error } = useRecipes()
  
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
                  <div>
                    <h3 className="text-xl font-techno font-bold text-navy-800">
                      {recipe.name}
                    </h3>
                    {recipe.description && (
                      <p className="text-sm text-navy-600 mt-1">
                        {recipe.description}
                      </p>
                    )}
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
                      {recipe.requires?.map((req: any, index: number) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between bg-white rounded-lg px-4 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-navy-500" />
                            <span className="text-navy-700 font-medium">{req.item}</span>
                          </div>
                          <span className="text-accent-600 font-bold">× {req.count}</span>
                        </div>
                      ))}
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

