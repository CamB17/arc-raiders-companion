import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'
import SearchModal from './SearchModal'

const Header = () => {
  const location = useLocation()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Items', path: '/items' },
    { name: 'Enemies', path: '/enemies' },
    { name: 'Quests', path: '/quests' },
    { name: 'Traders', path: '/traders' },
    { name: 'Crafting', path: '/crafting' },
  ]
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }
  
  // Keyboard shortcut: Cmd/Ctrl + K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-techno font-bold text-navy-800 tracking-wider">
                ARC RAIDERS
              </span>
            </Link>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-navy-800'
                      : 'text-navy-600 hover:text-navy-800'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* Search Button */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-primary-100 rounded-lg transition-colors flex items-center gap-2 group"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-navy-800" />
              <span className="hidden lg:inline text-xs text-navy-600 font-medium">
                <kbd className="px-1.5 py-0.5 bg-white border border-primary-200 rounded text-xs mr-1">
                  {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'}
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-primary-200 rounded text-xs">K</kbd>
              </span>
            </button>
          </div>
        </div>
      </header>
      
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

export default Header

