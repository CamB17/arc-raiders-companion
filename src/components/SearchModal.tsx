import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Package, Target, User, Skull, Loader2 } from 'lucide-react'
import { useSearch, SearchResult } from '../hooks/useSearch'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  
  const { results, isLoading, isEmpty } = useSearch(query, isOpen)
  
  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])
  
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      const allResults = [
        ...results.items,
        ...results.quests,
        ...results.enemies,
        ...results.traders,
      ]
      
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : prev))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
      } else if (e.key === 'Enter' && allResults[selectedIndex]) {
        e.preventDefault()
        handleResultClick(allResults[selectedIndex])
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])
  
  const handleResultClick = (result: SearchResult) => {
    let path = ''
    switch (result.type) {
      case 'item':
        path = `/items/${result.id}`
        break
      case 'quest':
        path = `/quests/${result.id}`
        break
      case 'enemy':
        path = `/enemies/${result.id}`
        break
      case 'trader':
        path = `/traders/${result.id}`
        break
    }
    
    navigate(path)
    onClose()
    setQuery('')
  }
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'item':
        return Package
      case 'quest':
        return Target
      case 'enemy':
        return Skull
      case 'trader':
        return User
      default:
        return Package
    }
  }
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'item':
        return 'Items'
      case 'quest':
        return 'Quests'
      case 'enemy':
        return 'Enemies'
      case 'trader':
        return 'Traders'
      default:
        return 'Results'
    }
  }
  
  const renderResultGroup = (
    type: 'item' | 'quest' | 'enemy' | 'trader',
    items: SearchResult[],
    startIndex: number
  ) => {
    if (items.length === 0) return null
    
    const Icon = getTypeIcon(type)
    
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 px-4">
          <Icon className="w-4 h-4 text-navy-600" />
          <h3 className="text-sm font-semibold text-navy-800 uppercase tracking-wide">
            {getTypeLabel(type)} ({items.length})
          </h3>
        </div>
        <div className="space-y-1">
          {items.map((result, idx) => {
            const globalIndex = startIndex + idx
            const isSelected = globalIndex === selectedIndex
            
            return (
              <button
                key={`${type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? 'bg-primary-100 border-l-2 border-accent-500'
                    : 'hover:bg-primary-50'
                }`}
              >
                {result.image || result.icon ? (
                  <img
                    src={result.image || result.icon}
                    alt={result.name}
                    className="w-10 h-10 object-contain rounded bg-white border border-primary-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-primary-100 border border-primary-200 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-navy-600" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-navy-800 truncate">
                    {result.name}
                  </div>
                  {result.description && (
                    <div className="text-sm text-navy-600 truncate mt-0.5">
                      {result.description}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }
  
  const allResults = [
    ...results.items,
    ...results.quests,
    ...results.enemies,
    ...results.traders,
  ]
  
  let currentIndex = 0
  
  if (!isOpen) return null
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl border border-primary-200 max-h-[70vh] flex flex-col">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-primary-200">
          <Search className="w-5 h-5 text-navy-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Search items, quests, enemies, traders..."
            className="flex-1 outline-none text-navy-800 placeholder:text-navy-400 bg-transparent"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-primary-100 rounded transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5 text-navy-600" />
          </button>
        </div>
        
        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {query.length < 2 ? (
            <div className="px-4 py-12 text-center text-navy-600">
              <Search className="w-12 h-12 mx-auto mb-4 text-navy-400" />
              <p className="text-lg font-medium mb-2">Start typing to search</p>
              <p className="text-sm">Search across items, quests, enemies, and traders</p>
            </div>
          ) : isLoading ? (
            <div className="px-4 py-12 text-center text-navy-600">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-navy-400" />
              <p>Searching...</p>
            </div>
          ) : isEmpty || allResults.length === 0 ? (
            <div className="px-4 py-12 text-center text-navy-600">
              <Search className="w-12 h-12 mx-auto mb-4 text-navy-400" />
              <p className="text-lg font-medium mb-2">No results found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              {renderResultGroup('item', results.items, currentIndex)}
              {results.items.length > 0 && (currentIndex += results.items.length)}
              
              {renderResultGroup('quest', results.quests, currentIndex)}
              {results.quests.length > 0 && (currentIndex += results.quests.length)}
              
              {renderResultGroup('enemy', results.enemies, currentIndex)}
              {results.enemies.length > 0 && (currentIndex += results.enemies.length)}
              
              {renderResultGroup('trader', results.traders, currentIndex)}
              
              {allResults.length > 0 && (
                <div className="px-4 py-2 mt-2 border-t border-primary-200 text-xs text-navy-500 text-center">
                  {allResults.length} result{allResults.length !== 1 ? 's' : ''} found
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-primary-200 bg-primary-50 text-xs text-navy-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-primary-200 rounded text-xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-primary-200 rounded text-xs">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-primary-200 rounded text-xs">Enter</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-primary-200 rounded text-xs">Esc</kbd>
              <span>Close</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchModal

