import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, Edit, Search, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/Card'
import Button from '@/components/Button'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useTraders } from '@/hooks/useArcRaidersApi'
import { useCustomTraders } from '@/hooks/useSupabase'

const CustomTradersAdmin = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: tradersResponse, isLoading: isLoadingTraders, error: tradersError } = useTraders({ includeItems: true, includeQuests: true })
  const { data: customTraders, isLoading: isLoadingCustom } = useCustomTraders()
  
  const isLoading = isLoadingTraders || isLoadingCustom
  
  // Extract traders from paginated response
  const traders = tradersResponse?.data || []
  
  // Create a map of trader_id to custom trader data for quick lookup
  const customTradersMap = useMemo(() => {
    if (!customTraders) return {}
    return customTraders.reduce((acc, ct) => {
      acc[ct.trader_id] = ct
      return acc
    }, {} as Record<string, typeof customTraders[0]>)
  }, [customTraders])

  const filteredTraders = useMemo(() => {
    return traders.filter((trader) =>
      trader.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trader.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trader.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [traders, searchTerm])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (tradersError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Traders</h2>
            <p className="text-red-600">{tradersError.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center text-accent-600 hover:text-accent-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-techno font-bold text-navy-800 mb-2 flex items-center gap-3">
                <Users className="w-10 h-10" />
                CUSTOM TRADERS
              </h1>
              <p className="text-lg text-navy-600">
                Manage images for traders from the API
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-navy-400" />
              <input
                type="text"
                placeholder="Search by trader name, ID, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Traders List */}
        {filteredTraders && filteredTraders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTraders.map((trader) => {
              const customTrader = customTradersMap[trader.id]
              const hasCustomImage = !!customTrader?.custom_image
              const traderImage = customTrader?.custom_image || trader.avatar || trader.image || trader.imageUrl || trader.icon || trader.thumbnail
              
              return (
                <Card key={trader.id} hover>
                  <CardContent className="pt-6">
                    <div className="flex flex-col">
                      {/* Trader Image */}
                      <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-6 flex items-center justify-center h-48 mb-4 rounded-lg relative">
                        {traderImage ? (
                          <img 
                            src={traderImage} 
                            alt={trader.name}
                            className="max-h-full max-w-full object-contain drop-shadow-lg rounded-full"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement
                              if (img.src.includes('.webp')) {
                                img.src = img.src.replace('.webp', '.png')
                                return
                              }
                              img.style.display = 'none'
                              const fallback = img.parentElement!.querySelector('.fallback-icon')
                              if (fallback) {
                                fallback.classList.remove('hidden')
                              }
                            }}
                          />
                        ) : null}
                        <div className={`fallback-icon w-24 h-24 bg-white/30 rounded-full flex items-center justify-center ${traderImage ? 'hidden' : ''}`}>
                          <span className="text-4xl font-techno text-navy-600">
                            {trader.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        {hasCustomImage && (
                          <div className="absolute top-2 right-2 bg-accent-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            Custom
                          </div>
                        )}
                      </div>
                      
                      {/* Trader Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-navy-800">
                            {trader.name}
                          </h3>
                        </div>
                        
                        <div className="mb-3">
                          <span className="text-sm text-navy-500 bg-navy-100 px-2 py-1 rounded">
                            ID: {trader.id}
                          </span>
                        </div>
                        
                        {trader.location && (
                          <div className="text-sm text-navy-600 mb-3">
                            <span className="font-semibold">Location:</span> {trader.location}
                            {trader.region && trader.region !== trader.location && (
                              <span className="text-navy-400"> • {trader.region}</span>
                            )}
                          </div>
                        )}
                        
                        {trader.description && (
                          <p className="text-sm text-navy-600 mb-4 line-clamp-2">
                            {trader.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Edit Button */}
                      <div className="mt-4">
                        <Link to={`/admin/traders/${trader.id}`}>
                          <Button variant="primary" className="w-full">
                            <Edit className="w-4 h-4 mr-2" />
                            {hasCustomImage ? 'Update Image' : 'Set Image'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Users className="w-16 h-16 text-navy-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-navy-800 mb-2">
                No Traders Found
              </h3>
              <p className="text-navy-600 mb-6">
                {searchTerm ? 'No traders match your search criteria.' : 'Unable to load traders from the API.'}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default CustomTradersAdmin


