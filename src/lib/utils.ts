// Utility functions for the app

/**
 * Get color class based on rarity
 */
export const getRarityColor = (rarity?: string): string => {
  if (!rarity) return 'bg-gray-100 text-gray-700'
  
  const colors: Record<string, string> = {
    common: 'bg-gray-100 text-gray-700',
    uncommon: 'bg-green-100 text-green-700',
    rare: 'bg-blue-100 text-blue-700',
    epic: 'bg-purple-100 text-purple-700',
    legendary: 'bg-orange-100 text-orange-700',
  }
  
  return colors[rarity.toLowerCase()] || 'bg-accent-100 text-accent-700'
}

/**
 * Format large numbers with commas
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Capitalize first letter of string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Format snake_case to Title Case
 */
export const formatKey = (key: string): string => {
  return key
    .split('_')
    .map(word => capitalize(word))
    .join(' ')
}

