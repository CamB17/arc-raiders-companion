import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, useGLTF, Environment } from '@react-three/drei'
import { Group } from 'three'

interface GLTFViewerProps {
  url: string
  className?: string
  autoRotate?: boolean
  autoRotateSpeed?: number
}

// Component to load and display the GLTF model
function Model({ url, autoRotate = false, autoRotateSpeed = 1, onLoad }: { url: string; autoRotate?: boolean; autoRotateSpeed?: number; onLoad?: () => void }) {
  const gltf = useGLTF(url)
  const groupRef = useRef<Group>(null)

  // Notify parent when model is loaded
  useEffect(() => {
    if (gltf.scene && onLoad) {
      onLoad()
    }
  }, [gltf.scene, onLoad])

  // Auto-rotate the model if enabled
  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * autoRotateSpeed * 0.5
    }
  })

  // Center the model and scale it appropriately
  // Calculate bounding box to center the model
  if (gltf.scene) {
    gltf.scene.traverse((child) => {
      if (child.type === 'Mesh') {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#3b82f6" />
    </mesh>
  )
}

const GLTFViewer = ({ url, className = '', autoRotate = true, autoRotateSpeed = 1 }: GLTFViewerProps) => {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setHasError(false)
    setIsLoading(true)
  }, [url])

  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 ${className}`}>
        <p className="text-navy-600 text-sm">No 3D model available</p>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 text-sm mb-2">Failed to load 3D model</p>
          <p className="text-navy-500 text-xs">{url}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        className="bg-transparent"
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.5} />
        
        {/* Environment for better reflections */}
        <Environment preset="city" />
        
        {/* Model */}
        <Suspense 
          fallback={<LoadingFallback />}
        >
          <Model 
            url={url} 
            autoRotate={autoRotate} 
            autoRotateSpeed={autoRotateSpeed}
            onLoad={() => setIsLoading(false)}
          />
        </Suspense>
        
        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          autoRotate={autoRotate}
          autoRotateSpeed={autoRotateSpeed}
        />
      </Canvas>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mx-auto mb-4"></div>
            <p className="text-navy-600 text-sm">Loading 3D model...</p>
          </div>
        </div>
      )}
      
      {/* Instructions overlay */}
      <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs p-2 rounded text-center pointer-events-none">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  )
}

export default GLTFViewer

