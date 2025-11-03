import { Link } from 'react-router-dom'
import { Target, Wrench, Package, User } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedBackground from '../components/AnimatedBackground'

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
      title: 'QUESTS',
      description: 'View objectives and rewards of available quests',
      link: '/quests',
    },
    {
      icon: User,
      title: 'TRADERS',
      description: 'Explore NPC traders and what they sell',
      link: '/traders',
    },
    {
      icon: Wrench,
      title: 'CRAFTING',
      description: 'Discover crafting recipes and required materials',
      link: '/crafting',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  }

  const featureCardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  }
  
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-100 via-primary-50 to-white overflow-hidden">
        <AnimatedBackground />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            className="grid lg:grid-cols-2 gap-12 items-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left Content */}
            <motion.div className="space-y-6" variants={containerVariants}>
              <motion.h1
                className="text-5xl lg:text-6xl font-techno font-bold text-navy-800 leading-tight tracking-tight"
                variants={titleVariants}
              >
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  ARC RAIDERS
                </motion.span>
                <br />
                <motion.span
                  className="text-4xl lg:text-5xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  COMPANION
                </motion.span>
              </motion.h1>
              
              <motion.p
                className="text-lg text-navy-700 max-w-xl"
                variants={itemVariants}
              >
                A comprehensive database for Arc Raiders players. Explore weapons, items, missions, and more.
              </motion.p>
              
              <motion.div variants={itemVariants}>
                <Link to="/items">
                  <motion.div
                    className="inline-block bg-accent-500 text-white font-semibold px-8 py-4 rounded-lg shadow-lg uppercase tracking-wide cursor-pointer"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: '0 10px 30px rgba(240, 80, 36, 0.4)',
                    }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      boxShadow: [
                        '0 4px 20px rgba(240, 80, 36, 0.3)',
                        '0 6px 25px rgba(240, 80, 36, 0.4)',
                        '0 4px 20px rgba(240, 80, 36, 0.3)',
                      ],
                    }}
                    transition={{
                      boxShadow: {
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                    }}
                  >
                    Explore
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Right Content - Weapon Illustration */}
            <motion.div
              className="flex items-center justify-center lg:justify-end"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative">
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 bg-accent-500 blur-3xl opacity-20"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.15, 0.25, 0.15],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                
                {/* Stylized weapon icon */}
                <motion.svg
                  viewBox="0 0 400 300"
                  className="w-full max-w-md h-auto relative z-10"
                  xmlns="http://www.w3.org/2000/svg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <g stroke="#243b53" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {/* Weapon body */}
                    <motion.path
                      d="M 50 150 L 200 130 L 350 120 L 370 130 L 370 160 L 350 170 L 200 160 L 50 180 Z"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, delay: 0.7 }}
                    />
                    <motion.path
                      d="M 200 130 L 220 110 L 330 100 L 350 110 L 350 120"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 1 }}
                    />
                    <motion.path
                      d="M 200 160 L 220 180 L 330 190 L 350 180 L 350 170"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: 1.1 }}
                    />
                    
                    {/* Barrel */}
                    <motion.path
                      d="M 350 120 L 370 125 L 370 155 L 350 170"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 1.2 }}
                    />
                    
                    {/* Handle */}
                    <motion.path
                      d="M 150 140 L 140 160 L 120 180 L 100 190 L 90 190 L 80 185 L 80 165 L 90 160 L 120 160 L 140 150"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, delay: 0.9 }}
                    />
                    
                    {/* Trigger */}
                    <motion.path
                      d="M 140 160 L 130 175 L 125 180 L 125 170 Z"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 1.3 }}
                    />
                    
                    {/* Details */}
                    <motion.circle
                      cx="280"
                      cy="145"
                      r="12"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 1.4 }}
                    />
                    <motion.line
                      x1="220"
                      y1="135"
                      x2="220"
                      y2="155"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3, delay: 1.5 }}
                    />
                    <motion.line
                      x1="250"
                      y1="132"
                      x2="250"
                      y2="158"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3, delay: 1.6 }}
                    />
                    <motion.line
                      x1="310"
                      y1="130"
                      x2="310"
                      y2="160"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.3, delay: 1.7 }}
                    />
                    
                    {/* Magazine */}
                    <motion.rect
                      x="160"
                      y="160"
                      width="30"
                      height="40"
                      rx="3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.8 }}
                    />
                    <motion.line
                      x1="165"
                      y1="170"
                      x2="185"
                      y2="170"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.2, delay: 2 }}
                    />
                    <motion.line
                      x1="165"
                      y1="180"
                      x2="185"
                      y2="180"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.2, delay: 2.1 }}
                    />
                    <motion.line
                      x1="165"
                      y1="190"
                      x2="185"
                      y2="190"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.2, delay: 2.2 }}
                    />
                  </g>
                </motion.svg>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={featureCardVariants}
                whileHover="hover"
              >
                <Link
                  to={feature.link}
                  className="group block bg-primary-50 border border-primary-200 rounded-2xl p-8 hover:shadow-lg transition-all relative overflow-hidden"
                >
                  {/* Background glow on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  
                  <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                    <motion.div
                      className="p-4 bg-white rounded-full border-2 border-navy-800 group-hover:border-accent-500 transition-colors"
                      whileHover={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.1,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <feature.icon className="w-10 h-10 text-navy-800" strokeWidth={2} />
                    </motion.div>
                    
                    <h3 className="text-2xl font-techno font-bold text-navy-800">
                      {feature.title}
                    </h3>
                    
                    <p className="text-navy-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home

