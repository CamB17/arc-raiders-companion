import { Link } from 'react-router-dom'
import { Weight, Coins } from 'lucide-react'

interface ItemCardProps {
  item: any
}

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

const ItemCard = ({ item }: ItemCardProps) => {
  // Extract stats from item - API uses stat_block
  const stats = item.stat_block || item.stats || {}
  const stackSize = stats.stackSize || item.stackSize
  const weight = stats.weight || item.weight
  const recycleValue = item.value || item.recycleValue
  const itemType = item.item_type
  
  // Get the best available image - API uses 'icon'
  const itemImage = item.icon || item.image || item.imageUrl || item.thumbnail
  
  return (
    <Link
      to={`/items/${item.id}`}
      className="group bg-white rounded-xl border border-primary-200 hover:border-accent-400 transition-all hover:shadow-xl overflow-hidden"
    >
      {/* Image Section */}
      <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-6 flex items-center justify-center h-48 relative">
        {itemImage ? (
          <img 
            src={itemImage} 
            alt={item.name}
            className="max-h-full max-w-full object-contain drop-shadow-lg"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.querySelector('.fallback-icon')?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={`fallback-icon w-24 h-24 bg-white/30 rounded-lg flex items-center justify-center ${itemImage ? 'hidden' : ''}`}>
          <span className="text-4xl font-techno text-navy-600">
            {item.name?.charAt(0) || '?'}
          </span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5 bg-primary-50">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {itemType && (
            <span className={`px-2 py-1 text-xs font-bold rounded ${getItemTypeColor(itemType)}`}>
              {itemType}
            </span>
          )}
          {item.rarity && (
            <span className={`px-2 py-1 text-xs font-bold rounded ${getRarityColor(item.rarity)}`}>
              {item.rarity}
            </span>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-techno font-bold text-navy-800 mb-2 uppercase group-hover:text-accent-500 transition-colors">
          {item.name}
        </h3>
        
        {/* Description */}
        {item.description && (
          <p className="text-sm text-navy-600 mb-4 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
        
        {/* Stats Grid */}
        <div className="space-y-2 mb-4">
          {/* Helper function to check if a value is meaningful (not 0, null, undefined, or empty) */}
          {(() => {
            const hasValue = (val: any): boolean => {
              if (val === null || val === undefined) return false
              if (typeof val === 'string') {
                const trimmed = val.trim()
                // Check for strings like "0", "000", "00000", etc.
                if (trimmed === '' || /^0+$/.test(trimmed)) return false
                const num = parseFloat(trimmed)
                return !isNaN(num) && num !== 0
              }
              if (typeof val === 'number') {
                return !isNaN(val) && val !== 0
              }
              return false
            }
            
            return (
              <>
                {hasValue(stackSize) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-600">Stack Size</span>
                    <span className="text-navy-800 font-semibold">{typeof stackSize === 'number' ? stackSize : parseFloat(stackSize) || stackSize}</span>
                  </div>
                )}
                
                {hasValue(stats.healingPerSecond) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-600">Healing/Second</span>
                    <span className="text-navy-800 font-semibold">
                      {typeof stats.healingPerSecond === 'number' 
                        ? stats.healingPerSecond 
                        : parseFloat(stats.healingPerSecond) || stats.healingPerSecond}
                      hp/s
                    </span>
                  </div>
                )}
                
                {hasValue(stats.staminaPerSecond) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-600">Stamina/Second</span>
                    <span className="text-navy-800 font-semibold">
                      {typeof stats.staminaPerSecond === 'number' 
                        ? stats.staminaPerSecond 
                        : parseFloat(stats.staminaPerSecond) || stats.staminaPerSecond}
                    </span>
                  </div>
                )}
                
                {hasValue(stats.useTime) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-600">Use Time</span>
                    <span className="text-navy-800 font-semibold">
                      {typeof stats.useTime === 'number' 
                        ? stats.useTime 
                        : parseFloat(stats.useTime) || stats.useTime}
                      s
                    </span>
                  </div>
                )}
                
                {hasValue(stats.duration) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-600">Duration</span>
                    <span className="text-navy-800 font-semibold">
                      {typeof stats.duration === 'number' 
                        ? stats.duration 
                        : parseFloat(stats.duration) || stats.duration}
                      s
                    </span>
                  </div>
                )}
                
                {hasValue(stats.damage) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-600">Damage</span>
                    <span className="text-navy-800 font-semibold">
                      {typeof stats.damage === 'number' 
                        ? stats.damage 
                        : parseFloat(stats.damage) || stats.damage}
                    </span>
                  </div>
                )}
                
                {hasValue(stats.fireRate) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-600">Fire Rate</span>
                    <span className="text-navy-800 font-semibold">
                      {typeof stats.fireRate === 'number' 
                        ? stats.fireRate 
                        : parseFloat(stats.fireRate) || stats.fireRate}
                      {' '}RPM
                    </span>
                  </div>
                )}
                
                {hasValue(stats.range) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-600">Range</span>
                    <span className="text-navy-800 font-semibold">
                      {typeof stats.range === 'number' 
                        ? stats.range 
                        : parseFloat(stats.range) || stats.range}
                      m
                    </span>
                  </div>
                )}
              </>
            )
          })()}
        </div>
        
        {/* Footer - Weight and Recycle Value */}
        <div className="flex items-center justify-between pt-4 border-t border-primary-200">
          {(() => {
            const hasValue = (val: any): boolean => {
              if (val === null || val === undefined) return false
              if (typeof val === 'string') {
                const trimmed = val.trim()
                // Check for strings like "0", "000", "00000", etc.
                if (trimmed === '' || /^0+$/.test(trimmed)) return false
                const num = parseFloat(trimmed)
                return !isNaN(num) && num !== 0
              }
              if (typeof val === 'number') {
                return !isNaN(val) && val !== 0
              }
              return false
            }
            
            return (
              <>
                {hasValue(weight) && (
                  <div className="flex items-center gap-1 text-sm">
                    <Weight className="w-4 h-4 text-navy-600" />
                    <span className="text-navy-800 font-semibold">
                      {typeof weight === 'number' ? weight : parseFloat(weight) || weight} KG
                    </span>
                  </div>
                )}
                
                {hasValue(recycleValue) && (
                  <div className="flex items-center gap-1 text-sm">
                    <Coins className="w-4 h-4 text-navy-600" />
                    <span className="text-navy-800 font-semibold">
                      {typeof recycleValue === 'number' 
                        ? recycleValue 
                        : parseFloat(recycleValue) || recycleValue}
                    </span>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>
    </Link>
  )
}

export default ItemCard
