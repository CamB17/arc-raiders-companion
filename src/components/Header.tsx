import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SearchModal from './SearchModal'
import EventTimer from './EventTimer'

const Header = () => {
  const location = useLocation()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Grouped navigation items for better organization
  const navGroups = [
    {
      title: 'Game Info',
      items: [
        { name: 'Items', path: '/items' },
        { name: 'Enemies', path: '/enemies' },
        { name: 'Quests', path: '/quests' },
      ]
    },
    {
      title: 'Services',
      items: [
        { name: 'Traders', path: '/traders' },
        { name: 'Crafting', path: '/crafting' },
      ]
    },
    {
      title: 'World',
      items: [
        { name: 'Maps', path: '/maps' },
      ]
    },
    {
      title: 'Tracking',
      items: [
        { name: 'Hideout Tracker', path: '/tracking/hideout' },
        { name: 'Expedition Tracker', path: '/tracking/expedition' },
      ]
    }
  ]
  
  // Flat list for mobile menu
  const allNavItems = [
    { name: 'Home', path: '/' },
    ...navGroups.flatMap(group => group.items)
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
      // Close mobile menu on Escape
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen])
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])
  
  const NavLink = ({ item, mobile = false }: { item: { name: string; path: string }, mobile?: boolean }) => (
    <Link
      to={item.path}
      onClick={() => mobile && setIsMobileMenuOpen(false)}
      className={`${
        mobile ? 'block px-4 py-3 text-base rounded-lg' : 'relative px-3 py-2 text-sm rounded-lg'
      } font-medium transition-all ${
        isActive(item.path)
          ? mobile 
            ? 'text-navy-800 bg-primary-50 font-semibold' 
            : 'text-navy-800 bg-primary-50'
          : mobile 
            ? 'text-navy-600 hover:text-navy-800 hover:bg-primary-50' 
            : 'text-navy-600 hover:text-navy-800 hover:bg-primary-50'
      }`}
    >
      {item.name}
      {!mobile && isActive(item.path) && (
        <motion.div
          className="absolute -bottom-1 left-0 right-0 h-1 bg-accent-500 rounded-full"
          layoutId="activeTab"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  )
  
  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-primary-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <motion.span
                className="text-xl sm:text-2xl font-techno font-bold text-navy-800 tracking-wider"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                ARC RAIDERS
              </motion.span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink item={{ name: 'Home', path: '/' }} />
              
              {navGroups.map((group, groupIndex) => {
                const hasActiveSubItem = group.items.some(item => isActive(item.path))
                
                return (
                  <div key={group.title} className="relative group">
                    <motion.button
                      className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                        hasActiveSubItem
                          ? 'text-navy-800 bg-primary-50'
                          : 'text-navy-600 hover:text-navy-800 hover:bg-primary-50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      {group.title}
                      <motion.span
                        className="ml-1 inline-block text-xs"
                        animate={{ rotate: 0 }}
                      >
                        ▼
                      </motion.span>
                      {hasActiveSubItem && (
                        <motion.div
                          className="absolute -bottom-1 left-0 right-0 h-1 bg-accent-500 rounded-full"
                          layoutId={`activeGroup-${groupIndex}`}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </motion.button>
                    
                    {/* Bridge gap to prevent hover loss - extends hover area between button and dropdown */}
                    <div className="absolute left-0 right-0 top-full h-3" />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute left-0 top-full pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                      <div className="bg-white rounded-lg shadow-xl border border-primary-200 py-1.5 min-w-[180px] overflow-hidden">
                        {group.items.map((item) => (
                          <motion.div
                            key={item.path}
                            whileHover={{ x: 4 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          >
                            <Link
                              to={item.path}
                              className={`relative block px-4 py-2.5 text-sm font-medium transition-all ${
                                isActive(item.path)
                                  ? 'text-navy-800 bg-accent-50 border-l-[3px] border-accent-500'
                                  : 'text-navy-600 hover:text-navy-800 hover:bg-primary-50 border-l-[3px] border-transparent'
                              }`}
                            >
                              {item.name}
                              {isActive(item.path) && (
                                <motion.div
                                  className="absolute left-0 top-0 bottom-0 w-1 bg-accent-500 rounded-r-full"
                                  layoutId="activeSubItem"
                                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                              )}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </nav>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Event Timer */}
              <div className="hidden xl:block">
                <EventTimer />
              </div>
              
              {/* Search Button */}
              <motion.button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-primary-100 rounded-lg transition-colors flex items-center gap-2 group"
                aria-label="Search"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Search className="w-5 h-5 text-navy-800" />
                <span className="hidden xl:inline text-xs text-navy-600 font-medium">
                  <kbd className="px-1.5 py-0.5 bg-white border border-primary-200 rounded text-xs mr-1">
                    {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘' : 'Ctrl'}
                  </kbd>
                  <kbd className="px-1.5 py-0.5 bg-white border border-primary-200 rounded text-xs">K</kbd>
                </span>
              </motion.button>
              
              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-primary-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-navy-800" />
                ) : (
                  <Menu className="w-6 h-6 text-navy-800" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-16 bottom-0 w-80 max-w-[85vw] bg-white border-l border-primary-200 shadow-xl z-50 lg:hidden overflow-y-auto overflow-x-hidden"
            >
              <div className="p-4 overflow-x-hidden">
                {/* Mobile Event Timer */}
                <div className="mb-6 pb-6 border-b border-primary-200">
                  <EventTimer />
                </div>
                
                {/* Navigation Items */}
                <nav className="space-y-1">
                  {allNavItems.map((item) => (
                    <NavLink key={item.path} item={item} mobile />
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

export default Header

