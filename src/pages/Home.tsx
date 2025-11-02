import { Link } from 'react-router-dom'
import { Target, Wrench, Package } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Package,
      title: 'ITEMS',
      description: 'Browse all weapons gear, and resources',
      link: '/items',
    },
    {
      icon: Target,
      title: 'MISSIONS',
      description: 'View objectives and rewards of available missions',
      link: '/missions',
    },
    {
      icon: Wrench,
      title: 'CRAFTING',
      description: 'Discover crafting recipes and required materials',
      link: '/crafting',
    },
  ]
  
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-100 via-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-techno font-bold text-navy-800 leading-tight tracking-tight">
                ARC RAIDERS
                <br />
                <span className="text-4xl lg:text-5xl">DATABASE</span>
              </h1>
              
              <p className="text-lg text-navy-700 max-w-xl">
                A comprehensive database for Arc Raiders players. Explore weapons, items, missions, and more.
              </p>
              
              <div>
                <Link
                  to="/items"
                  className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl uppercase tracking-wide"
                >
                  Explore
                </Link>
              </div>
            </div>
            
            {/* Right Content - Weapon Illustration */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative">
                {/* Stylized weapon icon */}
                <svg 
                  viewBox="0 0 400 300" 
                  className="w-full max-w-md h-auto"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g stroke="#243b53" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {/* Weapon body */}
                    <path d="M 50 150 L 200 130 L 350 120 L 370 130 L 370 160 L 350 170 L 200 160 L 50 180 Z" />
                    <path d="M 200 130 L 220 110 L 330 100 L 350 110 L 350 120" />
                    <path d="M 200 160 L 220 180 L 330 190 L 350 180 L 350 170" />
                    
                    {/* Barrel */}
                    <path d="M 350 120 L 370 125 L 370 155 L 350 170" />
                    
                    {/* Handle */}
                    <path d="M 150 140 L 140 160 L 120 180 L 100 190 L 90 190 L 80 185 L 80 165 L 90 160 L 120 160 L 140 150" />
                    
                    {/* Trigger */}
                    <path d="M 140 160 L 130 175 L 125 180 L 125 170 Z" />
                    
                    {/* Details */}
                    <circle cx="280" cy="145" r="12" />
                    <line x1="220" y1="135" x2="220" y2="155" />
                    <line x1="250" y1="132" x2="250" y2="158" />
                    <line x1="310" y1="130" x2="310" y2="160" />
                    
                    {/* Magazine */}
                    <rect x="160" y="160" width="30" height="40" rx="3" />
                    <line x1="165" y1="170" x2="185" y2="170" />
                    <line x1="165" y1="180" x2="185" y2="180" />
                    <line x1="165" y1="190" x2="185" y2="190" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => (
              <Link
                key={feature.title}
                to={feature.link}
                className="group bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-2xl p-8 transition-all hover:shadow-lg hover:scale-105"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-white rounded-full border-2 border-navy-800 group-hover:border-accent-500 transition-colors">
                    <feature.icon className="w-10 h-10 text-navy-800" strokeWidth={2} />
                  </div>
                  
                  <h3 className="text-2xl font-techno font-bold text-navy-800">
                    {feature.title}
                  </h3>
                  
                  <p className="text-navy-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

