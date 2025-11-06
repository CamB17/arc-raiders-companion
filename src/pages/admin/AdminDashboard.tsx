import { Link } from 'react-router-dom'
import { 
  Package, 
  Target, 
  Users, 
  MapPin, 
  BookOpen, 
  Wrench,
  Database,
  Plus,
  BarChart3,
  Calendar,
  Rocket
} from 'lucide-react'
import { useMaps } from '@/hooks/useSupabase'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import SupabaseDiagnostic from '@/components/admin/SupabaseDiagnostic'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  useCustomItems,
  useCustomQuests,
  useCustomTraders,
  useCustomLocations,
  useCustomGuides,
  useCustomBuilds,
  useHideoutWorkbenches,
  useExpedition,
} from '@/hooks/useSupabase'
import { useAllEvents } from '@/hooks/useEvents'

const AdminDashboard = () => {
  const isConfigured = isSupabaseConfigured()
  
  // Get counts for dashboard
  const { data: customItems } = useCustomItems()
  const { data: customQuests } = useCustomQuests()
  const { data: customTraders } = useCustomTraders()
  const { data: customLocations } = useCustomLocations()
  const { data: customGuides } = useCustomGuides()
  const { data: customBuilds } = useCustomBuilds()
  const { data: events } = useAllEvents()
  const { data: maps } = useMaps()
  const { data: hideoutWorkbenches } = useHideoutWorkbenches()
  const { data: expedition } = useExpedition()

  const adminSections = [
    {
      title: 'Custom Items',
      description: 'Add custom data to items from the API',
      icon: Package,
      path: '/admin/items',
      count: customItems?.length || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Custom Quests',
      description: 'Add walkthroughs, tips, and guides',
      icon: Target,
      path: '/admin/quests',
      count: customQuests?.length || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Custom Traders',
      description: 'Add trader bios and trading tips',
      icon: Users,
      path: '/admin/traders',
      count: customTraders?.length || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Custom Locations',
      description: 'Mark important map locations',
      icon: MapPin,
      path: '/admin/locations',
      count: customLocations?.length || 0,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Guides',
      description: 'Create player guides and tutorials',
      icon: BookOpen,
      path: '/admin/guides',
      count: customGuides?.length || 0,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Builds',
      description: 'Create and share loadout builds',
      icon: Wrench,
      path: '/admin/builds',
      count: customBuilds?.length || 0,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Events',
      description: 'Manage in-game event schedules',
      icon: Calendar,
      path: '/admin/events',
      count: events?.length || 0,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      title: 'Maps',
      description: 'Manage game zone maps and markers',
      icon: MapPin,
      path: '/admin/maps',
      count: maps?.length || 0,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      title: 'Hideout Workbenches',
      description: 'Manage hideout workbench levels and requirements',
      icon: Wrench,
      path: '/admin/hideout-workbenches',
      count: hideoutWorkbenches?.length || 0,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Expedition',
      description: 'Manage expedition phases and requirements',
      icon: Rocket,
      path: '/admin/expedition',
      count: expedition ? 1 : 0,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
    },
  ]

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-techno font-bold text-navy-800 mb-3">
            ADMIN DASHBOARD
          </h1>
          <p className="text-lg text-navy-600 mb-12">
            Manage custom data for Arc Raiders Companion
          </p>

          <Card className="border-yellow-300 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <Database className="w-6 h-6" />
                Supabase Not Configured
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-yellow-700">
                  To use the admin features, you need to configure Supabase. Follow these steps:
                </p>
                
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-navy-800">1. Create a Supabase Project</h3>
                  <p className="text-navy-600 text-sm">
                    Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-accent-600 hover:underline">supabase.com</a> and create a new project.
                  </p>
                  
                  <h3 className="font-semibold text-navy-800 mt-4">2. Get Your Credentials</h3>
                  <p className="text-navy-600 text-sm">
                    In your Supabase project settings, find your Project URL and anon public key.
                  </p>
                  
                  <h3 className="font-semibold text-navy-800 mt-4">3. Set Environment Variables</h3>
                  <p className="text-navy-600 text-sm mb-2">
                    Create a <code className="bg-navy-100 px-2 py-1 rounded">.env</code> file in the project root with:
                  </p>
                  <pre className="bg-navy-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
                  </pre>
                  
                  <h3 className="font-semibold text-navy-800 mt-4">4. Run Database Migrations</h3>
                  <p className="text-navy-600 text-sm">
                    Execute the SQL schema in your Supabase SQL editor. See <code className="bg-navy-100 px-2 py-1 rounded">SUPABASE_SCHEMA.md</code> for the schema.
                  </p>
                  
                  <h3 className="font-semibold text-navy-800 mt-4">5. Restart Development Server</h3>
                  <p className="text-navy-600 text-sm">
                    Run <code className="bg-navy-100 px-2 py-1 rounded">npm run dev</code> to restart with the new environment variables.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-techno font-bold text-navy-800 mb-3">
              ADMIN DASHBOARD
            </h1>
            <p className="text-lg text-navy-600">
              Manage custom data for Arc Raiders Companion
            </p>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <Database className="w-5 h-5" />
            <span className="text-sm font-semibold">Supabase Connected</span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-navy-600 mb-1">Total Custom Data</p>
                  <p className="text-3xl font-bold text-navy-800">
                    {(customItems?.length || 0) + 
                     (customQuests?.length || 0) + 
                     (customTraders?.length || 0) + 
                     (customLocations?.length || 0) + 
                     (customGuides?.length || 0) + 
                     (customBuilds?.length || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-accent-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-navy-600 mb-1">Guides Published</p>
                  <p className="text-3xl font-bold text-navy-800">
                    {customGuides?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-navy-600 mb-1">Community Builds</p>
                  <p className="text-3xl font-bold text-navy-800">
                    {customBuilds?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const Icon = section.icon
            return (
              <Link key={section.path} to={section.path}>
                <Card 
                  hover 
                  className="h-full transition-all hover:border-accent-400"
                >
                  <CardContent className="pt-6">
                    <div className={`w-14 h-14 ${section.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`w-7 h-7 ${section.color}`} />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-navy-800 mb-2">
                      {section.title}
                    </h3>
                    
                    <p className="text-navy-600 text-sm mb-4">
                      {section.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-navy-800">
                        {section.count}
                      </span>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

          {/* Diagnostics */}
        <div className="mt-12">
          <SupabaseDiagnostic />
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link to="/admin/items/new">
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Custom Item
                </Button>
              </Link>
              <Link to="/admin/guides/new">
                <Button variant="secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Guide
                </Button>
              </Link>
              <Link to="/admin/builds/new">
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Build
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard

