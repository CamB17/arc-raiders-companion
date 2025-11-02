import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useItem, useArcs, findArcsThatDropItem } from '../hooks/useArcRaidersApi'
import { ArrowLeft, Weight, Coins, Package, User, TrendingUp, Recycle, Target } from 'lucide-react'
import ItemPreview from '../components/ItemPreview'
import GLTFViewer from '../components/GLTFViewer'

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
  const { data: arcsResponse } = useArcs()
  const arcs = arcsResponse?.data || []
  
  // State for hover preview
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  
  // Find which arcs drop this item
  const arcsThatDrop = item && id ? findArcsThatDropItem(id, item, arcs) : []
  
  // Helper function to get item ID from breakdown item
  const getItemIdFromBreakdown = (breakdownItem: any): string | null => {
    // Try various ID fields first
    if (breakdownItem.item_id) return breakdownItem.item_id
    if (breakdownItem.item) return breakdownItem.item
    if (breakdownItem.id) return breakdownItem.id
    
    // Try to extract ID from nested component
    if (breakdownItem.component?.id) return breakdownItem.component.id
    if (breakdownItem.component?.item_id) return breakdownItem.component.item_id
    
    // As a fallback, try to convert name to slug format
    const name = breakdownItem.name || breakdownItem.item_name
    if (name) {
      return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }
    
    return null
  }
  
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
  
  // Debug logging to see component structure
  if (neededToCraft.length > 0) {
    console.log('Crafting components:', neededToCraft)
    neededToCraft.forEach((comp: any, idx: number) => {
      console.log(`Component ${idx}:`, comp)
    })
  }
  
  const crafting = item.crafting || {}
  const traders = item.traders || item.soldByTraders || []
  
  // Get recycle breakdown - check multiple possible field names
  // API uses 'recycle_components' field
  const recycleBreakdown = item.recycle_components || item.recycle_breakdown || item.recycleBreakdown || item.recycle?.breakdown || item.recycle?.components || []
  
  // Debug log to see the structure
  if (recycleBreakdown.length > 0) {
    console.log('Recycle breakdown items:', recycleBreakdown)
    recycleBreakdown.forEach((item: any, idx: number) => {
      console.log(`Breakdown item ${idx}:`, item)
    })
  }
  
  const breakdownTotal = recycleBreakdown.reduce((sum: number, item: any) => {
    const itemValue = item.value || 0
    const quantity = item.quantity || 1
    return sum + (itemValue * quantity)
  }, 0)
  
  // If breakdown total is 0 but we have recycle value, use recycle value as total
  const displayTotal = breakdownTotal > 0 ? breakdownTotal : (recycleValue || 0)
  
  // Get the best available image - API uses 'icon'
  const itemImage = item.icon || item.image || item.imageUrl || item.thumbnail
  
  // Get GLTF model URL - check multiple possible field names
  const gltfUrl = item.gltf || item.model3d || item.model_3d || item.gltf_url || item.model_url
  
  // Check if this is a weapon type that should show 3D viewer
  const isWeapon = itemType?.toLowerCase() === 'weapon' || itemType?.toLowerCase() === 'weapons'
  
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
              {/* 3D Model Viewer for Weapons */}
              {isWeapon && gltfUrl ? (
                <div className="bg-gradient-to-br from-primary-100 to-primary-200 h-96 rounded-t-xl overflow-hidden">
                  <GLTFViewer url={gltfUrl} className="h-full w-full" autoRotate={true} />
                </div>
              ) : (
                /* Image Fallback */
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
              )}
              
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
                        // Check all possible field names for image
                        const materialImage = material.icon 
                          || material.image 
                          || material.imageUrl 
                          || material.image_url
                          || material.thumbnail
                          || material.thumbnail_url
                          || material.component?.icon
                          || material.component?.image
                          || material.item?.icon
                          || material.item?.image
                          
                        // Check all possible field names for name
                        const materialName = material.name 
                          || material.item_name
                          || material.component_name
                          || material.item?.name
                          || material.item?.item_name
                          || material.component?.name
                          || material.component?.item_name
                          || material.item
                          || material.item_id
                          || material.id
                          || 'Unknown Material'
                          
                        const materialQuantity = material.quantity || material.count || material.amount || 1
                        const materialType = material.item_type || material.type || material.component?.item_type || 'Material'
                        
                        // Debug logging if name or image is missing
                        if (!materialName || materialName === 'Unknown Material' || !materialImage) {
                          console.log('Crafting component structure:', material)
                        }
                        
                        // Get item ID for linking
                        const materialId = material.item_id 
                          || material.item 
                          || material.id
                          || material.component?.id
                          || material.component?.item_id
                          || (materialName && materialName !== 'Unknown Material' ? materialName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : null)
                        
                        const handleCraftMaterialMouseEnter = (e: React.MouseEvent) => {
                          if (materialId) {
                            setHoveredItemId(materialId)
                            setHoverPosition({ x: e.clientX, y: e.clientY })
                          }
                        }
                        
                        const handleCraftMaterialMouseLeave = () => {
                          setHoveredItemId(null)
                        }
                        
                        const handleCraftMaterialMouseMove = (e: React.MouseEvent) => {
                          if (hoveredItemId === materialId) {
                            setHoverPosition({ x: e.clientX, y: e.clientY })
                          }
                        }
                        
                        const cellContent = (
                          <div className="flex items-center gap-3">
                            {materialImage ? (
                              <img 
                                src={materialImage} 
                                alt={materialName} 
                                className="w-10 h-10 object-contain flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  // Show fallback icon
                                  const fallback = e.currentTarget.parentElement?.querySelector('.material-fallback')
                                  if (fallback) fallback.classList.remove('hidden')
                                }}
                              />
                            ) : null}
                            <div className={`material-fallback w-10 h-10 bg-primary-100 rounded flex items-center justify-center flex-shrink-0 ${materialImage ? 'hidden' : ''}`}>
                              <span className="text-lg font-techno text-navy-600">
                                {materialName?.charAt(0) || '?'}
                              </span>
                            </div>
                            <span className="text-navy-800 font-medium">{materialName}</span>
                          </div>
                        )
                        
                        return (
                          <tr 
                            key={index} 
                            className="border-b border-primary-100 hover:bg-primary-50"
                          >
                            <td className="py-3 px-2 text-navy-800 font-bold">{materialQuantity}</td>
                            <td className="py-3 px-2">
                              {materialId ? (
                                <Link 
                                  to={`/items/${materialId}`}
                                  className="block cursor-pointer group"
                                  onMouseEnter={handleCraftMaterialMouseEnter}
                                  onMouseLeave={handleCraftMaterialMouseLeave}
                                  onMouseMove={handleCraftMaterialMouseMove}
                                >
                                  <div className="flex items-center gap-3">
                                    {materialImage ? (
                                      <img 
                                        src={materialImage} 
                                        alt={materialName} 
                                        className="w-10 h-10 object-contain flex-shrink-0"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none'
                                          const fallback = e.currentTarget.parentElement?.querySelector('.material-fallback')
                                          if (fallback) fallback.classList.remove('hidden')
                                        }}
                                      />
                                    ) : null}
                                    <div className={`material-fallback w-10 h-10 bg-primary-100 rounded flex items-center justify-center flex-shrink-0 ${materialImage ? 'hidden' : ''}`}>
                                      <span className="text-lg font-techno text-navy-600">
                                        {materialName?.charAt(0) || '?'}
                                      </span>
                                    </div>
                                    <span className="text-navy-800 font-medium group-hover:text-accent-600 transition-colors">{materialName}</span>
                                  </div>
                                </Link>
                              ) : (
                                <div
                                  className="cursor-pointer group"
                                  onMouseEnter={handleCraftMaterialMouseEnter}
                                  onMouseLeave={handleCraftMaterialMouseLeave}
                                  onMouseMove={handleCraftMaterialMouseMove}
                                >
                                  <div className="flex items-center gap-3">
                                    {materialImage ? (
                                      <img 
                                        src={materialImage} 
                                        alt={materialName} 
                                        className="w-10 h-10 object-contain flex-shrink-0"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none'
                                          const fallback = e.currentTarget.parentElement?.querySelector('.material-fallback')
                                          if (fallback) fallback.classList.remove('hidden')
                                        }}
                                      />
                                    ) : null}
                                    <div className={`material-fallback w-10 h-10 bg-primary-100 rounded flex items-center justify-center flex-shrink-0 ${materialImage ? 'hidden' : ''}`}>
                                      <span className="text-lg font-techno text-navy-600">
                                        {materialName?.charAt(0) || '?'}
                                      </span>
                                    </div>
                                    <span className="text-navy-800 font-medium group-hover:text-accent-600 transition-colors">{materialName}</span>
                                  </div>
                                </div>
                              )}
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
                  <p className="text-sm text-navy-600 mb-4">
                    When recycling, you will receive{' '}
                    {recycleValue > raiderCoins ? (
                      <span className="text-green-600 font-semibold">+{recycleValue - raiderCoins}</span>
                    ) : (
                      <span className="text-red-600 font-semibold">-{raiderCoins - recycleValue}</span>
                    )}{' '}
                    {recycleValue > raiderCoins ? 'more' : 'less'} Raider Coins.
                  </p>
                )}
                
                {/* Recycle Breakdown */}
                {(recycleBreakdown.length > 0 || recycleValue) && (
                  <div className="mt-4 pt-4 border-t border-primary-200">
                    <h3 className="text-sm font-semibold text-navy-700 mb-3">Breakdown:</h3>
                    <div className="space-y-2">
                      {recycleBreakdown.length > 0 ? (
                        recycleBreakdown.map((breakdownItem: any, index: number) => {
                          // Handle different field name variations from API
                          // Check all possible field names for item name
                          const itemName = breakdownItem.name 
                            || breakdownItem.item_name 
                            || breakdownItem.item 
                            || breakdownItem.item_id
                            || breakdownItem.id
                            || breakdownItem.component_name
                            || breakdownItem.component?.name
                            || breakdownItem.component?.item_name
                            || 'Unknown Item'
                          
                          const quantity = breakdownItem.quantity || breakdownItem.count || breakdownItem.amount || 1
                          const itemValue = breakdownItem.value || breakdownItem.price || 0
                          const totalValue = itemValue * quantity
                          const itemId = getItemIdFromBreakdown(breakdownItem)
                          
                          // Debug log to see what we're working with
                          if (!itemName || itemName === 'Unknown Item') {
                            console.log('Breakdown item structure:', breakdownItem)
                          }
                          
                          const handleMouseEnter = (e: React.MouseEvent) => {
                            if (itemId) {
                              setHoveredItemId(itemId)
                              setHoverPosition({ x: e.clientX, y: e.clientY })
                            }
                          }
                          
                          const handleMouseLeave = () => {
                            setHoveredItemId(null)
                          }
                          
                          const handleMouseMove = (e: React.MouseEvent) => {
                            if (hoveredItemId === itemId) {
                              setHoverPosition({ x: e.clientX, y: e.clientY })
                            }
                          }
                          
                          const linkContent = (
                            <div 
                              className="flex items-center justify-between text-sm cursor-pointer hover:text-accent-600 transition-colors"
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                              onMouseMove={handleMouseMove}
                            >
                              <span className="text-navy-700 hover:text-accent-600">
                                {itemName} {quantity > 1 && <span className="text-navy-500">× {quantity}</span>}
                              </span>
                              {itemValue > 0 && (
                                <span className="text-navy-600 font-medium">
                                  {totalValue > itemValue ? `${itemValue} × ${quantity} = ${totalValue}` : itemValue}
                                </span>
                              )}
                            </div>
                          )
                          
                          // If we have an item ID, make it a link, otherwise just show the content
                          if (itemId) {
                            return (
                              <Link 
                                key={index} 
                                to={`/items/${itemId}`}
                                className="block"
                              >
                                {linkContent}
                              </Link>
                            )
                          }
                          
                          return (
                            <div key={index}>
                              {linkContent}
                            </div>
                          )
                        })
                      ) : (
                        <div className="text-sm text-navy-600 italic">No breakdown available</div>
                      )}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-primary-100">
                        <span className="text-navy-800 font-bold">Total</span>
                        <span className="text-navy-800 font-bold">{displayTotal}</span>
                      </div>
                    </div>
                  </div>
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
            
            {/* Dropped By Arcs */}
            {arcsThatDrop.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-xl font-techno font-bold text-navy-800 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Dropped By Arcs
                </h2>
                <div className="space-y-4">
                  {arcsThatDrop.map(({ arc, dropInfo }) => {
                    const arcImage = arc.icon || arc.image || arc.imageUrl || arc.thumbnail
                    const dropRate = dropInfo.drop_rate || dropInfo.chance || 0
                    const dropRatePercent = (dropRate * 100).toFixed(1)
                    const quantity = dropInfo.quantity || 1
                    
                    return (
                      <div 
                        key={arc.id}
                        className="border border-primary-200 rounded-lg p-4 hover:bg-primary-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {/* Arc Image */}
                          {arcImage && (
                            <div className="flex-shrink-0">
                              <img 
                                src={arcImage} 
                                alt={arc.name}
                                className="w-16 h-16 object-contain rounded-lg bg-primary-100 p-2"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                              />
                            </div>
                          )}
                          
                          {/* Arc Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-navy-800">{arc.name}</h3>
                              {arc.difficulty && (
                                <span className={`px-2 py-1 text-xs font-bold rounded ${getRarityColor(arc.difficulty)}`}>
                                  {arc.difficulty}
                                </span>
                              )}
                              {arc.type && (
                                <span className="px-2 py-1 text-xs font-medium rounded bg-navy-100 text-navy-700">
                                  {arc.type}
                                </span>
                              )}
                            </div>
                            
                            {arc.description && (
                              <p className="text-sm text-navy-600 mb-2">{arc.description}</p>
                            )}
                            
                            {/* Drop Info */}
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-navy-600">Drop Rate:</span>
                                <span className="text-navy-800 font-bold">{dropRatePercent}%</span>
                              </div>
                              {quantity > 1 && (
                                <>
                                  <span className="text-navy-400">•</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-navy-600">Quantity:</span>
                                    <span className="text-navy-800 font-bold">{quantity}</span>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {/* Arc Stats */}
                            {(arc.health || arc.armor || arc.shield) && (
                              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-primary-100">
                                {arc.health && (
                                  <div className="text-xs text-navy-600">
                                    <span className="font-semibold">HP:</span> {arc.health}
                                  </div>
                                )}
                                {arc.armor && (
                                  <div className="text-xs text-navy-600">
                                    <span className="font-semibold">Armor:</span> {arc.armor}
                                  </div>
                                )}
                                {arc.shield && (
                                  <div className="text-xs text-navy-600">
                                    <span className="font-semibold">Shield:</span> {arc.shield}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
      
      {/* Item Preview Portal - renders outside DOM hierarchy to prevent layout shifts */}
      {hoveredItemId && typeof document !== 'undefined' && createPortal(
        <ItemPreview itemId={hoveredItemId} position={hoverPosition} />,
        document.body
      )}
    </div>
  )
}

export default ItemDetail
