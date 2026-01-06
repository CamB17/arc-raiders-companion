import { Link } from 'react-router-dom'
import { Shield, Heart, Target } from 'lucide-react'

interface EnemyCardProps {
  enemy: any
}

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

const EnemyCard = ({ enemy }: EnemyCardProps) => {
  // Extract enemy data
  const enemyType = enemy.type
  const difficulty = enemy.difficulty
  const drops = enemy.drops || enemy.loot || []
  
  // Get the best available image - API priority: image, imageUrl, icon, thumbnail
  const enemyImage = enemy.image || enemy.imageUrl || enemy.icon || enemy.thumbnail
  
  return (
    <Link
      to={`/enemies/${enemy.id}`}
      className="group bg-white rounded-xl border border-primary-200 hover:border-accent-400 transition-all hover:shadow-xl overflow-hidden"
    >
      {/* Image Section */}
      <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-6 flex items-center justify-center h-48 relative">
        {enemyImage ? (
          <img 
            src={enemyImage} 
            alt={enemy.name}
            className="max-h-full max-w-full object-contain drop-shadow-lg"
            onError={(e) => {
              // Fallback if image fails to load
              console.warn(`Failed to load enemy image for ${enemy.name}:`, enemyImage)
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.querySelector('.fallback-icon')?.classList.remove('hidden')
            }}
          />
        ) : null}
        <div className={`fallback-icon w-24 h-24 bg-white/30 rounded-lg flex items-center justify-center ${enemyImage ? 'hidden' : ''}`}>
          <span className="text-4xl font-techno text-navy-600">
            {enemy.name?.charAt(0) || '?'}
          </span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5 bg-primary-50">
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {enemyType && (
            <span className={`px-2 py-1 text-xs font-bold rounded ${getTypeColor(enemyType)}`}>
              {enemyType}
            </span>
          )}
          {difficulty && (
            <span className={`px-2 py-1 text-xs font-bold rounded ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-techno font-bold text-navy-800 mb-2 uppercase group-hover:text-accent-500 transition-colors">
          {enemy.name}
        </h3>
        
        {/* Description */}
        {enemy.description && (
          <p className="text-sm text-navy-600 mb-4 line-clamp-2 leading-relaxed">
            {enemy.description}
          </p>
        )}
        
        {/* Stats Grid */}
        <div className="space-y-2 mb-4">
          {enemy.health && (
            <div className="flex justify-between text-sm items-center">
              <span className="text-navy-600 flex items-center gap-1">
                <Heart className="w-4 h-4" />
                Health
              </span>
              <span className="text-navy-800 font-semibold">{enemy.health.toLocaleString()}</span>
            </div>
          )}
          
          {enemy.armor && (
            <div className="flex justify-between text-sm items-center">
              <span className="text-navy-600 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Armor
              </span>
              <span className="text-navy-800 font-semibold">{enemy.armor.toLocaleString()}</span>
            </div>
          )}
          
          {enemy.shield && (
            <div className="flex justify-between text-sm items-center">
              <span className="text-navy-600 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Shield
              </span>
              <span className="text-navy-800 font-semibold">{enemy.shield.toLocaleString()}</span>
            </div>
          )}
          
          {enemy.location && (
            <div className="flex justify-between text-sm">
              <span className="text-navy-600">Location</span>
              <span className="text-navy-800 font-semibold">{enemy.location}</span>
            </div>
          )}
        </div>
        
        {/* Weak Points */}
        {enemy.weak_points && enemy.weak_points.length > 0 && (
          <div className="mb-4 pt-3 border-t border-primary-200">
            <div className="flex items-center gap-1 mb-2">
              <Target className="w-4 h-4 text-navy-600" />
              <span className="text-xs font-semibold text-navy-700 uppercase">Weak Points</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {enemy.weak_points.map((point: string, idx: number) => (
                <span key={idx} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                  {point}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Footer - Drop Count and Info */}
        <div className="flex items-center justify-between pt-4 border-t border-primary-200">
          <div className="flex items-center gap-1 text-sm">
            <span className="text-navy-600">Drops</span>
            <span className="text-navy-800 font-semibold">{drops.length}</span>
            {drops.length > 0 && (
              <span className="text-navy-500 text-xs ml-1">
                ({drops.filter((d: any) => d.drop_rate || d.chance).length} with rates)
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default EnemyCard
