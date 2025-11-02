import { useMissions } from '../hooks/useArcRaidersApi'
import { Target, Award } from 'lucide-react'

const Missions = () => {
  const { data: missions, isLoading, error } = useMissions()
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Missions</h2>
          <p className="text-red-600">Unable to fetch missions from the API. Please try again later.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-techno font-bold text-navy-800 mb-3">
            MISSIONS
          </h1>
          <p className="text-navy-600">
            View all available missions, objectives, and rewards
          </p>
        </div>
        
        {/* Missions List */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-primary-200 p-6 animate-pulse">
                <div className="h-6 bg-primary-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-primary-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-primary-100 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : missions && missions.length > 0 ? (
          <div className="space-y-6">
            {missions.map((mission: any) => (
              <div 
                key={mission.id}
                className="bg-white rounded-xl border border-primary-200 hover:border-accent-400 p-8 transition-all hover:shadow-lg"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-accent-100 rounded-lg flex-shrink-0">
                    <Target className="w-6 h-6 text-accent-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-techno font-bold text-navy-800 mb-2">
                      {mission.name}
                    </h3>
                    {mission.description && (
                      <p className="text-navy-600 leading-relaxed">
                        {mission.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Objectives */}
                {mission.objectives && mission.objectives.length > 0 && (
                  <div className="mt-6 mb-4">
                    <h4 className="text-lg font-semibold text-navy-800 mb-3">Objectives</h4>
                    <ul className="space-y-2">
                      {mission.objectives.map((objective: string, index: number) => (
                        <li key={index} className="flex items-start text-navy-700">
                          <span className="w-2 h-2 bg-accent-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Rewards */}
                {mission.rewards && mission.rewards.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-accent-600" />
                      <h4 className="text-lg font-semibold text-navy-800">Rewards</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mission.rewards.map((reward: any, index: number) => (
                        <span 
                          key={index}
                          className="px-4 py-2 bg-accent-100 text-accent-700 rounded-lg text-sm font-medium"
                        >
                          {typeof reward === 'string' ? reward : reward.name || 'Unknown Reward'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-200 rounded-full mb-4">
              <Target className="w-8 h-8 text-navy-600" />
            </div>
            <p className="text-navy-500 text-lg">No missions available at this time.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Missions

