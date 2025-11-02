import { Link, useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'

const Header = () => {
  const location = useLocation()
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Items', path: '/items' },
    { name: 'Enemies', path: '/enemies' },
    { name: 'Quests', path: '/quests' },
    { name: 'Crafting', path: '/crafting' },
  ]
  
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }
  
  return (
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
          
          {/* Search Icon */}
          <button 
            className="p-2 hover:bg-primary-100 rounded-lg transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-navy-800" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

