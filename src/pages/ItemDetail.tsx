import { useParams, Link } from 'react-router-dom'
import { useItem } from '../hooks/useArcRaidersApi'
import { ArrowLeft, Weight, Coins, Package, User, TrendingUp, Recycle } from 'lucide-react'

const getRarityColor = (rarity?: string) => {
  const colors: Record<string, string> = {
    common: 'bg-gray-500 text-white',
    uncommon: 'bg-green-600 text-white',
    rare: 'bg-blue-600 text-white',
    epic: 'bg-purple-600 text-white',
    legendary: 'bg-orange-600 text-white',
  }
  
  return colors[rarity?.toLowerCase() || ''] || 'bg-navy-600 text-white'
}

const getItemTypeColor = (type?: string) => {
  const colors: Record<string, string> = {
    'quick use': 'bg-green-600 text-white',
    consumable: 'bg-green-600 text-white',
    weapon: 'bg-red-600 text-white',
    armor: 'bg-blue-600 text-white',
    material: 'bg-gray-600 text-white',
    resource: 'bg-yellow-600 text-white',
  }
  
  return colors[type?.toLowerCase() || ''] || 'bg-navy-600 text-white'
}

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { data: item, isLoading, error } = useItem(id || '')
  
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
  
  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/items" className="inline-flex items-center text-accent-500 hover:text-accent-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Items
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Item Not Found</h2>
            <p className="text-red-600">The requested item could not be loaded.</p>
          </div>
        </div>
      </div>
    )
  }
  
  // Extract item properties - API uses stat_block
  const stats = item.stat_block || item.stats || {}
  const stackSize = stats.stackSize || item.stackSize
  const weight = stats.weight || item.weight
  const recycleValue = item.value || item.recycleValue
  const raiderCoins = item.raider_coins || item.raiderCoins
  const itemType = item.item_type
  
  // Get crafting materials - prioritize components from API
  const neededToCraft = item.components || item.crafting?.requires || item.requiredMaterials || []
  const crafting = item.crafting || {}
  const traders = item.traders || item.soldByTraders || []
  
  // Get the best available image - API uses 'icon'
  const itemImage = item.icon || item.image || item.imageUrl || item.thumbnail
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link 
          to="/items" 
          className="inline-flex items-center text-accent-500 hover:text-accent-600 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Items
        </Link>
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-navy-600 mb-6">
          <Link to="/" className="hover:text-accent-500">Arc Raiders</Link>
          <span>›</span>
          <Link to="/items" className="hover:text-accent-500">Database</Link>
          <span>›</span>
          <Link to="/items" className="hover:text-accent-500">Items</Link>
          <span>›</span>
          <span className="text-navy-800 font-medium">{item.name}</span>
        </div>
        
        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Item Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden sticky top-6">
              {/* Image */}
              <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 flex items-center justify-center h-64 relative">
                {itemImage ? (
                  <img 
                    src={itemImage} 
                    alt={item.name}
                    className="max-h-full max-w-full object-contain drop-shadow-2xl"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.parentElement!.querySelector('.fallback-icon')?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`fallback-icon w-32 h-32 bg-white/30 rounded-lg flex items-center justify-center ${itemImage ? 'hidden' : ''}`}>
                  <Package className="w-16 h-16 text-white" />
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-6 bg-primary-50">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {itemType && (
                    <span className={`px-3 py-1 text-xs font-bold rounded ${getItemTypeColor(itemType)}`}>
                      {itemType}
                    </span>
                  )}
                  {item.rarity && (
                    <span className={`px-3 py-1 text-xs font-bold rounded ${getRarityColor(item.rarity)}`}>
                      {item.rarity}
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <h1 className="text-2xl font-techno font-bold text-navy-800 mb-3 uppercase">
                  {item.name}
                </h1>
                
                {/* Description */}
                {item.description && (
                  <p className="text-sm text-navy-600 mb-6 leading-relaxed">
                    {item.description}
                  </p>
                )}
                
                {/* Stats */}
                <div className="space-y-3 mb-6">
                  {stackSize && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-600">Stack Size</span>
                      <span className="text-navy-800 font-bold">{stackSize}</span>
                    </div>
                  )}
                  
                  {stats.healingPerSecond && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-600">Healing/Second</span>
                      <span className="text-navy-800 font-bold">{stats.healingPerSecond}hp/s</span>
                    </div>
                  )}
                  
                  {stats.staminaPerSecond && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-600">Stamina/Second</span>
                      <span className="text-navy-800 font-bold">{stats.staminaPerSecond}</span>
                    </div>
                  )}
                  
                  {stats.useTime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-600">Use Time</span>
                      <span className="text-navy-800 font-bold">{stats.useTime}s</span>
                    </div>
                  )}
                  
                  {stats.duration && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-600">Duration</span>
                      <span className="text-navy-800 font-bold">{stats.duration}s</span>
                    </div>
                  )}
                  
                  {stats.damage && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-600">Damage</span>
                      <span className="text-navy-800 font-bold">{stats.damage}</span>
                    </div>
                  )}
                  
                  {stats.fireRate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-600">Fire Rate</span>
                      <span className="text-navy-800 font-bold">{stats.fireRate} RPM</span>
                    </div>
                  )}
                  
                  {stats.magazineSize && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-600">Magazine</span>
                      <span className="text-navy-800 font-bold">{stats.magazineSize}</span>
                    </div>
                  )}
                  
                  {stats.range && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-600">Range</span>
                      <span className="text-navy-800 font-bold">{stats.range}m</span>
                    </div>
                  )}
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-primary-200">
                  {weight && (
                    <div className="flex items-center gap-2">
                      <Weight className="w-5 h-5 text-navy-800" />
                      <span className="text-navy-800 font-bold">{weight} KG</span>
                    </div>
                  )}
                  
                  {recycleValue && (
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-navy-800" />
                      <span className="text-navy-800 font-bold">{recycleValue}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Needed to Craft */}
            {neededToCraft.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4">
                  Needed to Craft
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary-200">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-navy-600">Qty</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-navy-600">Name</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-navy-600">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {neededToCraft.map((material: any, index: number) => {
                        const materialImage = material.icon || material.image || material.imageUrl
                        const materialName = material.name || material.item
                        const materialQuantity = material.quantity || material.count || 1
                        const materialType = material.item_type || material.type || 'Material'
                        
                        return (
                          <tr key={index} className="border-b border-primary-100 hover:bg-primary-50">
                            <td className="py-3 px-2 text-navy-800 font-bold">{materialQuantity}</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-3">
                                {materialImage && (
                                  <img 
                                    src={materialImage} 
                                    alt={materialName} 
                                    className="w-10 h-10 object-contain"
                                    onError={(e) => e.currentTarget.style.display = 'none'}
                                  />
                                )}
                                <span className="text-navy-800 font-medium">{materialName}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-navy-600 text-sm">{materialType}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Recycle Value */}
            {(recycleValue || raiderCoins) && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <Recycle className="w-5 h-5" />
                  Recycle Value
                </h2>
                
                <div className="flex items-center gap-4 mb-4 text-lg">
                  {raiderCoins && (
                    <>
                      <div className="flex items-center gap-2">
                        <Coins className="w-6 h-6 text-navy-600" />
                        <span className="text-navy-800 font-bold">{raiderCoins}</span>
                      </div>
                      <span className="text-navy-400">→</span>
                    </>
                  )}
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-accent-600" />
                    <span className="text-accent-600 font-bold">{recycleValue}</span>
                  </div>
                </div>
                
                {raiderCoins && recycleValue && raiderCoins !== recycleValue && (
                  <p className="text-sm text-navy-600">
                    When recycling, you will receive <span className="text-red-600 font-semibold">-{raiderCoins - recycleValue}</span> less Raider Coins.
                  </p>
                )}
              </div>
            )}
            
            {/* Sold By Traders */}
            {traders.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Sold By Traders
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary-200">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-navy-600">Trader</th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-navy-600">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {traders.map((trader: any, index: number) => (
                        <tr key={index} className="border-b border-primary-100 hover:bg-primary-50">
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              {trader.avatar && (
                                <img src={trader.avatar} alt={trader.name} className="w-10 h-10 rounded-full" />
                              )}
                              <span className="text-navy-800 font-medium">{trader.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <span className="text-navy-800 font-bold text-lg">{trader.price}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Used In Recipes */}
            {crafting.used_in && crafting.used_in.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4">
                  Used In Recipes
                </h2>
                <div className="flex flex-wrap gap-2">
                  {crafting.used_in.map((recipe: string, index: number) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-primary-100 text-navy-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors"
                    >
                      {recipe}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetail
