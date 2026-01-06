import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Weight, Coins } from 'lucide-react'

interface VariantGroupCardProps {
  items: any[]
  baseName: string
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

// Convert Arabic numeral to Roman numeral for display
const arabicToRoman = (num: number): string => {
  if (num <= 0 || num > 10) return num.toString()
  const romanMap: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
    10: 'X'
  }
  return romanMap[num] || num.toString()
}

// Extract variant number from name (I, II, III, IV, or 1, 2, 3, 4)
const extractVariantInfo = (name: string): { baseName: string; variantNumber: string | null; displayVariant: string | null; sortOrder: number } => {
  if (!name) return { baseName: name, variantNumber: null, displayVariant: null, sortOrder: 0 }
  
  // Match Roman numerals (IV, IX, I, II, III, V, VI, VII, VIII, X) or Arabic numerals at the end
  // Match IV and IX before matching I, II, III to avoid partial matches
  // Handle both space and hyphen separators, use case-insensitive matching
  // Also handle cases where there's no separator (e.g., "HullcrackerIV")
  const romanMatch = name.match(/(?:[\s-]+|^)(IV|IX|VIII|VII|VI|V|III|II|I|X|1|2|3|4|5|6|7|8|9|10)$/i)
  
  if (romanMatch) {
    const variantNumber = romanMatch[1]
    // Remove the matched variant number from the name (case-insensitive)
    // Handle both with and without separators
    const baseName = name.replace(/(?:[\s-]+|^)(IV|IX|VIII|VII|VI|V|III|II|I|X|1|2|3|4|5|6|7|8|9|10)$/i, '').trim()
    
    // Convert to sort order (I=1, II=2, III=3, IV=4, etc.)
    // Normalize to uppercase for comparison
    const normalizedVariant = variantNumber.toUpperCase()
    let sortOrder = 0
    let displayVariant: string | null = null
    
    if (normalizedVariant === 'I') {
      sortOrder = 1
      displayVariant = 'I'
    } else if (normalizedVariant === 'II') {
      sortOrder = 2
      displayVariant = 'II'
    } else if (normalizedVariant === 'III') {
      sortOrder = 3
      displayVariant = 'III'
    } else if (normalizedVariant === 'IV') {
      sortOrder = 4
      displayVariant = 'IV'
    } else if (normalizedVariant === 'V') {
      sortOrder = 5
      displayVariant = 'V'
    } else if (normalizedVariant === 'VI') {
      sortOrder = 6
      displayVariant = 'VI'
    } else if (normalizedVariant === 'VII') {
      sortOrder = 7
      displayVariant = 'VII'
    } else if (normalizedVariant === 'VIII') {
      sortOrder = 8
      displayVariant = 'VIII'
    } else if (normalizedVariant === 'IX') {
      sortOrder = 9
      displayVariant = 'IX'
    } else if (normalizedVariant === 'X') {
      sortOrder = 10
      displayVariant = 'X'
    } else {
      // Arabic numeral - convert to Roman for display
      sortOrder = parseInt(variantNumber) || 0
      displayVariant = arabicToRoman(sortOrder)
    }
    
    return { baseName, variantNumber, displayVariant, sortOrder }
  }
  
  return { baseName: name, variantNumber: null, displayVariant: null, sortOrder: 0 }
}

const VariantGroupCard = ({ items, baseName }: VariantGroupCardProps) => {
  // Sort items by variant number (I, II, III, IV, etc.) FIRST
  const sortedItems = [...items].sort((a, b) => {
    const aInfo = extractVariantInfo(a.name || '')
    const bInfo = extractVariantInfo(b.name || '')
    
    // If both have variant numbers, sort by order
    if (aInfo.sortOrder > 0 && bInfo.sortOrder > 0) {
      return aInfo.sortOrder - bInfo.sortOrder
    }
    
    // If only one has a variant number, put it first
    if (aInfo.sortOrder > 0 && bInfo.sortOrder === 0) return -1
    if (aInfo.sortOrder === 0 && bInfo.sortOrder > 0) return 1
    
    // If neither has variant number, sort alphabetically
    return (a.name || '').localeCompare(b.name || '')
  })
  
  // Find the index of variant I (first variant), default to 0
  const firstVariantIndex = sortedItems.findIndex(item => {
    const info = extractVariantInfo(item.name || '')
    return info.sortOrder === 1 // Variant I
  })
  
  // Always start with variant I (index 0 if I exists, otherwise first item)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(
    firstVariantIndex >= 0 ? firstVariantIndex : 0
  )
  
  const selectedItem = sortedItems[selectedVariantIndex] || sortedItems[0]
  const stats = selectedItem.stat_block || selectedItem.stats || {}
  const weight = stats.weight || selectedItem.weight
  const recycleValue = selectedItem.value || selectedItem.recycleValue
  const itemType = selectedItem.item_type
  const itemImage = selectedItem.icon || selectedItem.image || selectedItem.imageUrl || selectedItem.thumbnail
  
  // Helper functions
  const hasValue = (val: any): boolean => {
    if (val === null || val === undefined) return false
    if (typeof val === 'string') {
      const trimmed = val.trim()
      if (trimmed === '' || /^0+$/.test(trimmed)) return false
      const num = parseFloat(trimmed)
      return !isNaN(num) && num !== 0
    }
    if (typeof val === 'number') {
      return !isNaN(val) && val !== 0
    }
    return false
  }
  
  const getNumericValue = (val: any): number => {
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const parsed = parseFloat(val)
      return isNaN(parsed) ? 0 : parsed
    }
    return 0
  }
  
  const isWeapon = itemType?.toLowerCase().includes('weapon') || selectedItem.category?.toLowerCase() === 'weapon'
  
  // Get weapon-specific stats
  const damage = stats.damage
  const fireRate = stats.fireRate
  const range = stats.range
  const magazineSize = stats.magazineSize || stats.magazine_size
  const stability = stats.stability
  const agility = stats.agility
  const stealth = stats.stealth
  
  const maxValues: Record<string, number> = {
    damage: 100,
    fireRate: 1000,
    range: 100,
    stability: 100,
    agility: 100,
    stealth: 100,
    magazineSize: 100,
  }
  
  const StatBar = ({ label, value, maxValue, suffix = '' }: {
    label: string
    value: number
    maxValue: number
    suffix?: string
  }) => {
    const percentage = Math.min((value / maxValue) * 100, 100)
    
    return (
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-navy-600">{label}</span>
          <span className="text-xs font-bold text-navy-800">
            {value}{suffix}
          </span>
        </div>
        <div className="w-full h-1.5 bg-primary-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-500 to-accent-600 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-xl border border-primary-200 hover:border-accent-400 transition-all hover:shadow-xl overflow-hidden flex flex-col h-full">
      {/* Variant Selector Bar */}
      <div className="bg-primary-100 px-4 py-2 border-b border-primary-200">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-semibold text-navy-700 uppercase tracking-wide">Upgraded Versions</span>
        </div>
        <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide">
          {sortedItems.map((item, index) => {
            const variantInfo = extractVariantInfo(item.name || '')
            const isSelected = index === selectedVariantIndex
            const variantRarity = item.rarity
            
            // Determine what to display
            let displayText = variantInfo.displayVariant || variantInfo.variantNumber
            if (!displayText && variantInfo.sortOrder > 0) {
              // If we have a sort order but no display variant, convert it
              displayText = arabicToRoman(variantInfo.sortOrder)
            }
            if (!displayText) {
              // Final fallback to index-based display
              displayText = `#${index + 1}`
            }
            
            return (
              <button
                key={item.id || index}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedVariantIndex(index)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  isSelected
                    ? 'bg-accent-500 text-white shadow-md scale-105'
                    : 'bg-white text-navy-700 hover:bg-primary-200'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>{displayText}</span>
                  {variantRarity && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getRarityStyles(variantRarity).backgroundColor }}
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Selected Item Display */}
      <Link
        to={`/items/${selectedItem.id}`}
        className="flex flex-col h-full"
      >
        {/* Image Section */}
        <div className="bg-transparent p-6 flex items-center justify-center h-48 relative">
          {itemImage ? (
            <img 
              src={itemImage} 
              alt={selectedItem.name}
              className="max-h-full max-w-full object-contain drop-shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.parentElement!.querySelector('.fallback-icon')?.classList.remove('hidden')
              }}
            />
          ) : null}
          <div className={`fallback-icon w-24 h-24 bg-white/30 rounded-lg flex items-center justify-center ${itemImage ? 'hidden' : ''}`}>
            <span className="text-4xl font-techno text-navy-600">
              {selectedItem.name?.charAt(0) || '?'}
            </span>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-5 bg-primary-50 flex-1 flex flex-col">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {itemType && (() => {
              const rarityStyles = selectedItem.rarity 
                ? getRarityStyles(selectedItem.rarity)
                : { backgroundColor: '#3D3D3D', color: '#ffffff' }
              return (
                <span 
                  className="px-2 py-1 text-xs font-bold rounded"
                  style={rarityStyles}
                >
                  {itemType}
                </span>
              )
            })()}
            {selectedItem.rarity && (() => {
              const rarityStyles = getRarityStyles(selectedItem.rarity)
              return (
                <span 
                  className="px-2 py-1 text-xs font-bold rounded"
                  style={rarityStyles}
                >
                  {selectedItem.rarity}
                </span>
              )
            })()}
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-techno font-bold text-navy-800 mb-2 uppercase group-hover:text-accent-500 transition-colors">
            {selectedItem.name}
          </h3>
          
          {/* Description */}
          {selectedItem.description && (
            <p className="text-sm text-navy-600 mb-4 line-clamp-2 leading-relaxed">
              {selectedItem.description}
            </p>
          )}
          
          {/* Stats Grid */}
          <div className="space-y-2 mb-4 flex-1">
            {isWeapon ? (
              <div className="space-y-1">
                {hasValue(damage) && (
                  <StatBar
                    label="Damage"
                    value={getNumericValue(damage)}
                    maxValue={maxValues.damage}
                  />
                )}
                {hasValue(fireRate) && (
                  <StatBar
                    label="Fire Rate"
                    value={getNumericValue(fireRate)}
                    maxValue={maxValues.fireRate}
                    suffix=" RPM"
                  />
                )}
                {hasValue(range) && (
                  <StatBar
                    label="Range"
                    value={getNumericValue(range)}
                    maxValue={maxValues.range}
                  />
                )}
                {hasValue(magazineSize) && (
                  <StatBar
                    label="Magazine"
                    value={getNumericValue(magazineSize)}
                    maxValue={maxValues.magazineSize}
                  />
                )}
                {hasValue(stability) && (
                  <StatBar
                    label="Stability"
                    value={getNumericValue(stability)}
                    maxValue={maxValues.stability}
                  />
                )}
                {hasValue(agility) && (
                  <StatBar
                    label="Agility"
                    value={getNumericValue(agility)}
                    maxValue={maxValues.agility}
                  />
                )}
                {hasValue(stealth) && (
                  <StatBar
                    label="Stealth"
                    value={getNumericValue(stealth)}
                    maxValue={maxValues.stealth}
                  />
                )}
              </div>
            ) : null}
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-primary-200 mt-auto">
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
          </div>
        </div>
      </Link>
    </div>
  )
}

export default VariantGroupCard

