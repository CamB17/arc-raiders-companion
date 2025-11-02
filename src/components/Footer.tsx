import { Github, Twitter } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-navy-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-techno font-bold mb-3">
              ARC RAIDERS DATABASE
            </h3>
            <p className="text-primary-200 text-sm max-w-md">
              The ultimate companion for Arc Raiders players. Explore weapons, items, quests, and crafting recipes.
            </p>
            <div className="flex space-x-4 mt-4">
              <a 
                href="#" 
                className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 hover:bg-navy-700 rounded-lg transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li><a href="/items" className="hover:text-white transition-colors">Items</a></li>
              <li><a href="/quests" className="hover:text-white transition-colors">Quests</a></li>
              <li><a href="/crafting" className="hover:text-white transition-colors">Crafting</a></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-primary-200">
              <li><a href="https://metaforge.app/arc-raiders" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Metaforge API</a></li>
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-navy-700 mt-8 pt-8 text-sm text-primary-200 text-center">
          <p>© {currentYear} Arc Raiders Database. All rights reserved. Not affiliated with Embark Studios.</p>
          <p className="mt-2">Data provided by Metaforge API</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

