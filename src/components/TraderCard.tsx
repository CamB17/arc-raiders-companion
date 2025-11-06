import { Link } from 'react-router-dom'
import { MapPin, Package, Target } from 'lucide-react'
import { useMergedTrader } from '@/hooks/useMergedData'
import type { ArcRaidersTrader } from '@/hooks/useArcRaidersApi'

interface TraderCardProps {
  trader: ArcRaidersTrader
}

const TraderCard = ({ trader }: TraderCardProps) => {
  // Merge with custom data (including custom images)
  const mergedTrader = useMergedTrader(trader) || trader
  
  // Get the best available image (custom image takes priority)
  const traderImage = mergedTrader.avatar || mergedTrader.image || mergedTrader.imageUrl || mergedTrader.icon || mergedTrader.thumbnail
  
  // Get items count
  const itemsCount = (mergedTrader.items?.length || 0) + (mergedTrader.sells?.length || 0)
  const questsCount = (mergedTrader.quests?.length || 0) + (mergedTrader.provides_quests?.length || 0)
  
  return (
    <Link
      to={`/traders/${mergedTrader.id}`}
      className="group bg-white rounded-xl border border-primary-200 hover:border-accent-400 transition-all hover:shadow-xl overflow-hidden"
    >
      {/* Image Section */}
      <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-6 flex items-center justify-center h-48 relative">
        {traderImage ? (
          <img 
            src={traderImage} 
            alt={mergedTrader.name}
            className="max-h-full max-w-full object-contain drop-shadow-lg rounded-full"
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
        ) : null}
        <div className={`fallback-icon w-24 h-24 bg-white/30 rounded-full flex items-center justify-center ${traderImage ? 'hidden' : ''}`}>
          <span className="text-4xl font-techno text-navy-600">
            {mergedTrader.name?.charAt(0) || '?'}
          </span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5 bg-primary-50">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {mergedTrader.type && (
            <span className="px-2 py-1 text-xs font-bold rounded bg-navy-600 text-white">
              {mergedTrader.type}
            </span>
          )}
          {mergedTrader.category && (
            <span className="px-2 py-1 text-xs font-bold rounded bg-primary-600 text-white">
              {mergedTrader.category}
            </span>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-techno font-bold text-navy-800 mb-2 uppercase group-hover:text-accent-500 transition-colors">
          {mergedTrader.name}
        </h3>
        
        {/* Description */}
        {mergedTrader.description && (
          <p className="text-sm text-navy-600 mb-4 line-clamp-2 leading-relaxed">
            {mergedTrader.description}
          </p>
        )}
        
        {/* Location */}
        {mergedTrader.location && (
          <div className="flex items-center gap-1 text-sm text-navy-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{mergedTrader.location}</span>
            {mergedTrader.region && mergedTrader.region !== mergedTrader.location && (
              <span className="text-navy-400">• {mergedTrader.region}</span>
            )}
          </div>
        )}
        
        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-primary-200">
          {itemsCount > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Package className="w-4 h-4 text-navy-600" />
              <span className="text-navy-800 font-semibold">
                {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          )}
          {questsCount > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Target className="w-4 h-4 text-navy-600" />
              <span className="text-navy-800 font-semibold">
                {questsCount} {questsCount === 1 ? 'quest' : 'quests'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default TraderCard
