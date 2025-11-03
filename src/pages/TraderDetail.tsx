import { useParams, Link } from 'react-router-dom'
import { useTrader, useTraders, useItems, useQuests, linkQuestsToTraders } from '../hooks/useArcRaidersApi'
import { ArrowLeft, MapPin, Package, Target, Coins, User } from 'lucide-react'

const TraderDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { data: trader, isLoading, error } = useTrader(id || '')
  const { data: itemsResponse } = useItems()
  const { data: questsResponse } = useQuests()
  const { data: tradersResponse } = useTraders()
  
  const allItems = itemsResponse?.data || []
  const allTraders = tradersResponse?.data || []
  const allQuestsRaw = questsResponse?.data || []
  
  // Link quests to traders
  const allQuests = linkQuestsToTraders(allQuestsRaw, allTraders)
  
  // Get items sold by this trader
  const itemsSold = trader?.items || trader?.sells || []
  
  // Get quests provided by this trader - match by trader name
  const questsProvided = trader 
    ? allQuests.filter((quest: any) => 
        quest.trader?.name === trader.name ||
        quest.giver?.name === trader.name ||
        quest.provider?.name === trader.name
      )
    : []
  
  // Helper to resolve item details from item reference
  const getItemDetails = (itemRef: any) => {
    const itemId = itemRef.item_id || itemRef.item || itemRef.id || itemRef.name
    if (!itemId) return null
    
    // Try to find the full item details
    const fullItem = allItems.find((item: any) => 
      item.id === itemId || 
      item.name === itemId ||
      item.name === itemRef.name
    )
    
    if (fullItem) {
      return fullItem
    }
    
    // Return fallback with image from itemRef - check all possible image fields
    return {
      id: itemId,
      name: itemRef.name || itemId,
      icon: itemRef.icon || itemRef.image || itemRef.imageUrl || itemRef.thumbnail,
      image: itemRef.image || itemRef.icon || itemRef.imageUrl || itemRef.thumbnail,
      imageUrl: itemRef.imageUrl || itemRef.image || itemRef.icon,
      rarity: itemRef.rarity,
    }
  }
  
  // Helper to resolve quest details from quest reference
  const getQuestDetails = (questRef: any) => {
    const questId = questRef.quest_id || questRef.quest || questRef.id || questRef.name
    if (!questId) return null
    
    // Try to find the full quest details
    const fullQuest = allQuests.find((quest: any) => 
      quest.id === questId || 
      quest.name === questId ||
      quest.name === questRef.name
    )
    
    if (fullQuest) {
      return fullQuest
    }
    
    // Return fallback with image from questRef - check all possible image fields
    return {
      id: questId,
      name: questRef.name || questId,
      icon: questRef.icon || questRef.image || questRef.imageUrl || questRef.thumbnail,
      image: questRef.image || questRef.icon || questRef.imageUrl || questRef.thumbnail,
      imageUrl: questRef.imageUrl || questRef.image || questRef.icon,
    }
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
  
  if (error || !trader) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/traders" className="inline-flex items-center text-accent-500 hover:text-accent-600 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Traders
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Trader Not Found</h2>
            <p className="text-red-600">The requested trader could not be loaded.</p>
          </div>
        </div>
      </div>
    )
  }
  
  // Get the best available image
  const traderImage = trader.avatar || trader.image || trader.imageUrl || trader.icon || trader.thumbnail
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link 
          to="/traders" 
          className="inline-flex items-center text-accent-500 hover:text-accent-600 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Traders
        </Link>
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-navy-600 mb-6">
          <Link to="/" className="hover:text-accent-500">Arc Raiders</Link>
          <span>›</span>
          <Link to="/traders" className="hover:text-accent-500">Traders</Link>
          <span>›</span>
          <span className="text-navy-800 font-medium">{trader.name}</span>
        </div>
        
        {/* Main Grid Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Trader Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden sticky top-6">
              {/* Image */}
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-8 flex items-center justify-center h-64 relative">
                {traderImage ? (
                  <>
                    <img 
                      src={traderImage} 
                      alt={trader.name}
                      className="max-h-full max-w-full object-contain drop-shadow-2xl rounded-full"
                      onError={(e) => {
                        // Try fallback PNG if webp fails
                        const img = e.currentTarget as HTMLImageElement
                        if (img.src.includes('.webp')) {
                          img.src = img.src.replace('.webp', '.png')
                          return
                        }
                        // If PNG also fails or already tried, show fallback icon
                        img.style.display = 'none'
                        const fallback = img.parentElement!.querySelector('.fallback-icon')
                        if (fallback) {
                          fallback.classList.remove('hidden')
                        }
                      }}
                    />
                    <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-32 h-32 bg-white/30 rounded-full flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              
              {/* Card Content */}
              <div className="p-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {trader.type && (
                    <span className="px-3 py-1 text-xs font-bold rounded bg-navy-600 text-white">
                      {trader.type}
                    </span>
                  )}
                  {trader.category && (
                    <span className="px-3 py-1 text-xs font-bold rounded bg-primary-600 text-white">
                      {trader.category}
                    </span>
                  )}
                </div>
                
                {/* Name */}
                <h1 className="text-3xl font-techno font-bold text-navy-800 mb-4 uppercase">
                  {trader.name}
                </h1>
                
                {/* Description */}
                {trader.description && (
                  <p className="text-navy-600 mb-6 leading-relaxed">
                    {trader.description}
                  </p>
                )}
                
                {/* Location */}
                {(trader.location || trader.region) && (
                  <div className="mb-6 pb-6 border-b border-primary-200">
                    <div className="flex items-center gap-2 text-navy-600 mb-2">
                      <MapPin className="w-5 h-5" />
                      <span className="font-semibold">Location</span>
                    </div>
                    {trader.location && (
                      <p className="text-navy-800 ml-7">{trader.location}</p>
                    )}
                    {trader.region && trader.region !== trader.location && (
                      <p className="text-navy-600 ml-7 text-sm">{trader.region}</p>
                    )}
                  </div>
                )}
                
                {/* Stats */}
                <div className="space-y-3">
                  {itemsSold.length > 0 && (
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-navy-600" />
                      <div>
                        <div className="text-sm text-navy-600">Items Sold</div>
                        <div className="text-lg font-semibold text-navy-800">{itemsSold.length}</div>
                      </div>
                    </div>
                  )}
                  {questsProvided.length > 0 && (
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-navy-600" />
                      <div>
                        <div className="text-sm text-navy-600">Quests Provided</div>
                        <div className="text-lg font-semibold text-navy-800">{questsProvided.length}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Tags */}
                {trader.tags && trader.tags.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-primary-200">
                    <div className="flex flex-wrap gap-2">
                      {trader.tags.map((tag: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Sold and Quests Provided - Side by Side with Scrolling */}
            {(itemsSold.length > 0 || questsProvided.length > 0) && (
              <div className={`grid gap-6 items-start ${itemsSold.length > 0 && questsProvided.length > 0 ? 'md:grid-cols-2' : ''}`}>
                {/* Items Sold */}
                {itemsSold.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden flex flex-col">
                    {/* Sticky Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-primary-50 to-white border-b border-primary-200 p-6 z-10 backdrop-blur-sm">
                      <h2 className="text-2xl font-techno font-bold text-navy-800 flex items-center gap-3">
                        <Package className="w-6 h-6 text-accent-500" />
                        Items Sold
                        <span className="text-lg font-normal text-navy-500">({itemsSold.length})</span>
                      </h2>
                    </div>
                    {/* Scrollable Content */}
                    <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                      <div className="p-6 pt-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="sticky top-0 bg-white z-10">
                              <tr className="border-b-2 border-primary-300">
                                <th className="text-left py-3 px-2 text-sm font-semibold text-navy-600 bg-gradient-to-r from-white to-primary-50">Item</th>
                                <th className="text-left py-3 px-2 text-sm font-semibold text-navy-600 bg-gradient-to-r from-primary-50 to-white">Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {itemsSold.map((itemRef: any, index: number) => {
                                const itemDetails = getItemDetails(itemRef)
                                const itemPrice = itemRef.price || itemRef.value || 'N/A'
                                
                                return (
                                  <tr key={index} className="border-b border-primary-100 hover:bg-gradient-to-r hover:from-primary-50 hover:to-white transition-colors group">
                                    <td className="py-3 px-2">
                                      {itemDetails ? (
                                        <Link
                                          to={`/items/${itemDetails.id}`}
                                          className="flex items-center gap-3 hover:text-accent-500 transition-colors"
                                        >
                                          {(() => {
                                            // Get the best available image - API uses 'icon' as primary field
                                            const itemImage = itemDetails.icon || itemDetails.image || itemDetails.imageUrl || itemDetails.thumbnail
                                            return itemImage ? (
                                              <img 
                                                src={itemImage} 
                                                alt={itemDetails.name}
                                                className="w-10 h-10 object-contain flex-shrink-0 group-hover:scale-110 transition-transform"
                                                onError={(e) => {
                                                  // Try fallback if webp fails
                                                  const img = e.currentTarget as HTMLImageElement
                                                  if (img.src.includes('.webp')) {
                                                    img.src = img.src.replace('.webp', '.png')
                                                    return
                                                  }
                                                  // If PNG also fails or already tried, hide the image
                                                  img.style.display = 'none'
                                                }}
                                              />
                                            ) : null
                                          })()}
                                          <div className="min-w-0">
                                            <div className="font-medium text-navy-800 truncate">{itemDetails.name}</div>
                                            {itemDetails.rarity && (
                                              <div className="text-xs text-navy-500">{itemDetails.rarity}</div>
                                            )}
                                          </div>
                                        </Link>
                                      ) : (
                                        <div className="font-medium text-navy-800">{itemRef.name || itemRef.item || 'Unknown Item'}</div>
                                      )}
                                    </td>
                                    <td className="py-3 px-2">
                                      <div className="flex items-center gap-2">
                                        <Coins className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                                        <span className="text-navy-800 font-bold text-lg whitespace-nowrap">{itemPrice}</span>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Quests Provided */}
                {questsProvided.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg border border-primary-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-50 to-white border-b border-primary-200 p-6">
                      <h2 className="text-2xl font-techno font-bold text-navy-800 flex items-center gap-3">
                        <Target className="w-6 h-6 text-accent-500" />
                        Quests Provided
                        <span className="text-lg font-normal text-navy-500">({questsProvided.length})</span>
                      </h2>
                    </div>
                    {/* Content - Natural height with max for scrolling */}
                    <div className={`${questsProvided.length > 5 ? 'overflow-y-auto' : ''}`} style={questsProvided.length > 5 ? { maxHeight: 'calc(100vh - 300px)' } : {}}>
                      <div className="p-6 pt-4 space-y-4">
                        {questsProvided.map((questRef: any, index: number) => {
                          const questDetails = getQuestDetails(questRef)
                          
                          return (
                            <div key={index} className="border border-primary-200 rounded-lg p-4 hover:border-accent-400 hover:shadow-md transition-all bg-gradient-to-r from-white to-primary-50/30">
                              {questDetails ? (
                                <Link
                                  to={`/quests/${questDetails.id}`}
                                  className="flex items-center gap-4 hover:text-accent-500 transition-colors"
                                >
                                  {(() => {
                                    const questImage = questDetails.icon || questDetails.image || questDetails.imageUrl || questDetails.thumbnail
                                    return questImage ? (
                                      <img 
                                        src={questImage} 
                                        alt={questDetails.name}
                                        className="w-16 h-16 object-contain rounded-lg flex-shrink-0 shadow-sm"
                                        onError={(e) => {
                                          // Try fallback if webp fails
                                          const img = e.currentTarget as HTMLImageElement
                                          if (img.src.includes('.webp')) {
                                            img.src = img.src.replace('.webp', '.png')
                                            return
                                          }
                                          img.style.display = 'none'
                                        }}
                                      />
                                    ) : null
                                  })()}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-navy-800 text-lg truncate">{questDetails.name}</div>
                                    {questDetails.description && (
                                      <div className="text-sm text-navy-600 mt-1 line-clamp-2">{questDetails.description}</div>
                                    )}
                                  </div>
                                </Link>
                              ) : (
                                <div className="font-semibold text-navy-800 text-lg">{questRef.name || questRef.quest || 'Unknown Quest'}</div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Notes */}
            {trader.notes && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-6">
                <h2 className="text-2xl font-techno font-bold text-navy-800 mb-4">Notes</h2>
                <p className="text-navy-600 leading-relaxed whitespace-pre-line">
                  {trader.notes}
                </p>
              </div>
            )}
            
            {/* Empty State */}
            {itemsSold.length === 0 && questsProvided.length === 0 && !trader.notes && (
              <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-12 text-center">
                <User className="w-16 h-16 text-navy-400 mx-auto mb-4" />
                <p className="text-navy-600 text-lg">No additional information available for this trader.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TraderDetail

