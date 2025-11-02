import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

const AnimatedBackground = () => {
  // Generate particles - memoized to prevent re-renders
  const particles: Particle[] = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    })), []
  )

  // Generate scan lines - memoized
  const scanLines = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      delay: i * 2,
    })), []
  )

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated grid overlay */}
      <motion.div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(36, 59, 83, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(36, 59, 83, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '50px 50px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Scan lines effect */}
      {scanLines.map((line) => (
        <motion.div
          key={line.id}
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(240, 80, 36, 0.1) 50%, transparent 100%)',
            height: '2px',
          }}
          initial={{ y: '-100%' }}
          animate={{ y: '200%' }}
          transition={{
            duration: 3,
            delay: line.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((particle) => {
        // Pre-calculate animation values to avoid Math.random() in render
        const xOffset = particle.id % 20 - 10
        
        return (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-accent-500"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              boxShadow: `0 0 ${particle.size * 2}px rgba(240, 80, 36, 0.6)`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, xOffset, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}

      {/* Energy waves */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 30% 50%, rgba(240, 80, 36, 0.3) 0%, transparent 50%),
                       radial-gradient(circle at 70% 50%, rgba(36, 59, 83, 0.2) 0%, transparent 50%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}

export default AnimatedBackground

