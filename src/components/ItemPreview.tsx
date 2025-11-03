import { useItem } from '../hooks/useArcRaidersApi'
import { Weight, Coins } from 'lucide-react'

interface ItemPreviewProps {
  itemId: string
  position: { x: number; y: number }
}

const getRarityStyles = (rarity?: string): { backgroundColor: string; color: string } => {
  const rarityLower = rarity?.toLowerCase() || ''
  
  const styles: Record<string, { backgroundColor: string; color: string }> = {
    legendary: { backgroundColor: '#6D4D2D', color: '#FFB366' },
    epic: { backgroundColor: '#5D2D6D', color: '#C97FFF' },
    rare: { backgroundColor: '#2D4D6D', color: '#6BA3FF' },
    common: { backgroundColor: '#3D3D3D', color: '#ffffff' },
    uncommon: { backgroundColor: '#2D5A2D', color: '#7FFF7F' },
  }
  
  return styles[rarityLower] || { backgroundColor: '#3D3D3D', color: '#ffffff' }
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

const ItemPreview = ({ itemId, position }: ItemPreviewProps) => {
  const { data: item, isLoading } = useItem(itemId)
  
  if (isLoading || !item) {
    return (
      <div 
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-primary-200 p-4 w-64 pointer-events-none"
        style={{ left: `${position.x + 10}px`, top: `${position.y + 10}px` }}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-primary-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-primary-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }
  
  const stats = item.stat_block || item.stats || {}
  const stackSize = stats.stackSize || item.stackSize
  const weight = stats.weight || item.weight
  const recycleValue = item.value || item.recycleValue
  const itemType = item.item_type
  const itemImage = item.icon || item.image || item.imageUrl || item.thumbnail
  
  return (
    <div 
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-primary-200 overflow-hidden w-72 pointer-events-none"
      style={{ 
        left: `${Math.min(position.x + 10, window.innerWidth - 300)}px`, 
        top: `${Math.min(position.y + 10, window.innerHeight - 400)}px`,
        maxHeight: '400px',
        overflowY: 'auto'
      }}
    >
      {/* Image - Transparent Background */}
      <div className="bg-transparent p-4 flex items-center justify-center h-32">
        {itemImage ? (
          <img 
            src={itemImage} 
            alt={item.name}
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.querySelector('.fallback-icon')?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={`fallback-icon w-16 h-16 bg-white/30 rounded-lg flex items-center justify-center ${itemImage ? 'hidden' : ''}`}>
          <span className="text-2xl font-techno text-navy-600">
            {item.name?.charAt(0) || '?'}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-2">
          {itemType && (() => {
            // Use rarity colors for item type tags
            const rarityStyles = item.rarity 
              ? getRarityStyles(item.rarity)
              : { backgroundColor: '#3D3D3D', color: '#ffffff' } // Default to common if no rarity
            return (
              <span 
                className="px-2 py-1 text-xs font-bold rounded"
                style={rarityStyles}
              >
                {itemType}
              </span>
            )
          })()}
          {item.rarity && (() => {
            const rarityStyles = getRarityStyles(item.rarity)
            return (
              <span 
                className="px-2 py-1 text-xs font-bold rounded"
                style={rarityStyles}
              >
                {item.rarity}
              </span>
            )
          })()}
        </div>
        
        {/* Title */}
        <h3 className="text-base font-techno font-bold text-navy-800 mb-2 uppercase">
          {item.name}
        </h3>
        
        {/* Description */}
        {item.description && (
          <p className="text-xs text-navy-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}
        
        {/* Key Stats */}
        <div className="space-y-1 text-xs mb-3">
          {stackSize && (
            <div className="flex justify-between">
              <span className="text-navy-600">Stack Size</span>
              <span className="text-navy-800 font-semibold">{stackSize}</span>
            </div>
          )}
          {stats.damage && (
            <div className="flex justify-between">
              <span className="text-navy-600">Damage</span>
              <span className="text-navy-800 font-semibold">{stats.damage}</span>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-primary-200">
          {weight && (
            <div className="flex items-center gap-1 text-xs">
              <Weight className="w-3 h-3 text-navy-600" />
              <span className="text-navy-800 font-semibold">{weight} KG</span>
            </div>
          )}
          {recycleValue && (
            <div className="flex items-center gap-1 text-xs">
              <Coins className="w-3 h-3 text-navy-600" />
              <span className="text-navy-800 font-semibold">{recycleValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ItemPreview

