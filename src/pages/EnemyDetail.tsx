import { useParams, Link } from 'react-router-dom'
import { useArc } from '../hooks/useArcRaidersApi'
import { ArrowLeft, Shield, Heart, Target, Package } from 'lucide-react'

const getDifficultyColor = (difficulty?: string) => {
  const colors: Record<string, string> = {
    common: 'bg-gray-500 text-white',
    uncommon: 'bg-green-600 text-white',
    rare: 'bg-blue-600 text-white',
    epic: 'bg-purple-600 text-white',
    legendary: 'bg-orange-600 text-white',
  }
  
  return colors[difficulty?.toLowerCase() || ''] || 'bg-navy-600 text-white'
}

const getTypeColor = (type?: string) => {
  const colors: Record<string, string> = {
    enemy: 'bg-red-600 text-white',
    boss: 'bg-orange-600 text-white',
    elite: 'bg-purple-600 text-white',
    scout: 'bg-yellow-600 text-white',
  }
  
  return colors[type?.toLowerCase() || ''] || 'bg-navy-600 text-white'
}

const EnemyDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { data: enemy, isLoading, error } = useArc(id || '')
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-primary-200 rounded w-1/4 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="h-96 bg-primary-200 rounded-xl"></div>
              </div>
              <div className="lg:col-span-2">
                <div className="h-48 bg-primary-200 rounded-xl mb-4"></div>
                <div className="h-48 bg-primary-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (error || !enemy) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/enemies" className="inline-flex items-center text-accent-500 hover:text-accent-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Enemies
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Enemy Not Found</h2>
            <p className="text-red-600">The requested enemy could not be loaded.</p>
          </div>
        </div>
      </div>
    )
  }
  
  // Get the best available image - API priority: image, imageUrl, icon, thumbnail
  const enemyImage = enemy.image || enemy.imageUrl || enemy.icon || enemy.thumbnail
  
  // Get drops - check multiple possible field names and structures
  // The API uses 'loot' field with nested item objects: loot[].item.name, loot[].item.icon, etc.
  let drops: any[] = []
  
  // Direct fields (API uses 'loot' field)
  if (Array.isArray(enemy.loot) && enemy.loot.length > 0) {
    drops = enemy.loot
  } else if (Array.isArray(enemy.drops) && enemy.drops.length > 0) {
    drops = enemy.drops
  }
  // Check nested structures
  else if (enemy.data && Array.isArray(enemy.data.loot) && enemy.data.loot.length > 0) {
    drops = enemy.data.loot
  } else if (enemy.data && Array.isArray(enemy.data.drops) && enemy.data.drops.length > 0) {
    drops = enemy.data.drops
  }
  // Check for alternative field names
  else if (Array.isArray((enemy as any).drops_list)) {
    drops = (enemy as any).drops_list
  } else if (Array.isArray((enemy as any).loot_drops)) {
    drops = (enemy as any).loot_drops
  } else if (Array.isArray((enemy as any).items)) {
    drops = (enemy as any).items
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link 
          to="/enemies" 
          className="inline-flex items-center text-accent-500 hover:text-accent-600 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Enemies
        </Link>
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-navy-600 mb-6">
          <Link to="/" className="hover:text-accent-500">Arc Raiders</Link>
          <span>›</span>
          <Link to="/enemies" className="hover:text-accent-500">Database</Link>
          <span>›</span>
          <Link to="/enemies" className="hover:text-accent-500">Enemies</Link>
          <span>›</span>
          <span className="text-navy-800 font-medium">{enemy.name}</span>
        </div>
        
        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Enemy Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden sticky top-6">
              {/* Image */}
              <div className="bg-gradient-to-br from-red-600 to-red-800 p-8 flex items-center justify-center h-64 relative">
                {enemyImage ? (
                  <img 
                    src={enemyImage} 
                    alt={enemy.name}
                    className="max-h-full max-w-full object-contain drop-shadow-2xl"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement!.querySelector('.fallback-icon')?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`fallback-icon w-32 h-32 bg-white/30 rounded-lg flex items-center justify-center ${enemyImage ? 'hidden' : ''}`}>
                  <Target className="w-16 h-16 text-white" />
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-6 bg-primary-50">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {enemy.type && (
                    <span className={`px-3 py-1 text-xs font-bold rounded ${getTypeColor(enemy.type)}`}>
                      {enemy.type}
                    </span>
                  )}
                  {enemy.difficulty && (
                    <span className={`px-3 py-1 text-xs font-bold rounded ${getDifficultyColor(enemy.difficulty)}`}>
                      {enemy.difficulty}
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <h1 className="text-2xl font-techno font-bold text-navy-800 mb-3 uppercase">
                  {enemy.name}
                </h1>
                
                {/* Description */}
                {enemy.description && (
                  <p className="text-sm text-navy-600 mb-6 leading-relaxed">
                    {enemy.description}
                  </p>
                )}
                
                {/* Stats */}
                <div className="space-y-3 mb-6">
                  {enemy.health && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-navy-600 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Health
                      </span>
                      <span className="text-navy-800 font-bold">{enemy.health.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {enemy.armor && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-navy-600 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Armor
                      </span>
                      <span className="text-navy-800 font-bold">{enemy.armor.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {enemy.shield && (
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-navy-600 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Shield
                      </span>
                      <span className="text-navy-800 font-bold">{enemy.shield.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {enemy.location && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-600">Location</span>
                      <span className="text-navy-800 font-bold">{enemy.location}</span>
                    </div>
                  )}
                </div>
                
                {/* Weak Points */}
                {enemy.weak_points && enemy.weak_points.length > 0 && (
                  <div className="mb-6 pt-4 border-t border-primary-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-navy-600" />
                      <h3 className="text-sm font-semibold text-navy-700 uppercase">Weak Points</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {enemy.weak_points.map((point: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded font-medium">
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Footer - Drop Count */}
                <div className="flex items-center justify-between pt-4 border-t border-primary-200">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-navy-600" />
                    <span className="text-navy-600">Drops</span>
                    <span className="text-navy-800 font-bold">{drops.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Loot Drops */}
          <div className="lg:col-span-2 space-y-6">
            {/* Loot Drops */}
            {drops.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Loot Drops
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary-200">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-navy-600">Item</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-navy-600">Quantity</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-navy-600">Drop Rate</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-navy-600">Rarity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drops.map((drop: any, index: number) => {
                        // Handle nested item structure - API has drop.item object with full item data
                        const itemData = drop.item || {}
                        
                        // Extract item name - ensure it's a string, not an object
                        const itemName = typeof itemData.name === 'string' 
                          ? itemData.name 
                          : (typeof drop.name === 'string' 
                            ? drop.name 
                            : (drop.item_id || 'Unknown Item'))
                        
                        const quantity = drop.quantity || 1
                        const dropRate = drop.drop_rate || drop.chance || 0
                        const dropRatePercent = dropRate > 0 ? (dropRate * 100).toFixed(1) : 'N/A'
                        
                        // Extract rarity - ensure it's a string
                        const rarity = typeof itemData.rarity === 'string'
                          ? itemData.rarity
                          : (typeof drop.rarity === 'string' ? drop.rarity : '')
                        
                        // Try to get item image if available - check nested item first
                        const itemImage = itemData.icon 
                          || itemData.image 
                          || itemData.imageUrl 
                          || itemData.thumbnail
                          || drop.icon 
                          || drop.image 
                          || drop.imageUrl 
                          || drop.thumbnail
                        
                        // Get item ID for potential linking
                        const itemId = itemData.id || drop.item_id || drop.item
                        
                        return (
                          <tr 
                            key={drop.id || index} 
                            className="border-b border-primary-100 hover:bg-primary-50"
                          >
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-3">
                                {itemImage ? (
                                  <img 
                                    src={itemImage} 
                                    alt={itemName} 
                                    className="w-10 h-10 object-contain flex-shrink-0 bg-primary-100 rounded p-1"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                      const fallback = e.currentTarget.parentElement?.querySelector('.drop-fallback')
                                      if (fallback) fallback.classList.remove('hidden')
                                    }}
                                  />
                                ) : null}
                                <div className={`drop-fallback w-10 h-10 bg-primary-100 rounded flex items-center justify-center flex-shrink-0 ${itemImage ? 'hidden' : ''}`}>
                                  <Package className="w-5 h-5 text-navy-400" />
                                </div>
                                {itemId ? (
                                  <Link 
                                    to={`/items/${itemId}`}
                                    className="text-navy-800 font-medium hover:text-accent-600 transition-colors"
                                  >
                                    {itemName}
                                  </Link>
                                ) : (
                                  <span className="text-navy-800 font-medium">{itemName}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-navy-800 font-semibold">
                              {quantity > 1 ? `× ${quantity}` : '1'}
                            </td>
                            <td className="py-3 px-2">
                              {dropRate > 0 ? (
                                <span className="text-navy-800 font-semibold">{dropRatePercent}%</span>
                              ) : (
                                <span className="text-navy-500 text-sm italic">N/A</span>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              {rarity && (
                                <span className={`px-2 py-1 text-xs font-bold rounded ${getDifficultyColor(rarity)}`}>
                                  {rarity}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Loot Drops
                </h2>
                <p className="text-navy-500 text-center py-8">
                  This enemy does not drop any loot.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnemyDetail
