import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Float, 
  Text, 
  MeshWobbleMaterial, 
  ContactShadows,
  Image as Image3D
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { X, Info, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Project {
  id: string;
  title: string;
  imageUrl: string;
}

function ProjectCard({ project, index, total, onSelect }: { project: Project; index: number; total: number; onSelect: (p: Project) => void }) {
  const meshRef = useRef<THREE.Group>(null);
  const angle = (index / total) * Math.PI * 2;
  const radius = 8;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation/float
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime + index) * 0.1;
      meshRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={meshRef} position={[x, 0, z]} onClick={() => onSelect(project)}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Image3D 
          url={project.imageUrl} 
          scale={[4, 2.5]} 
          transparent 
          opacity={0.9} 
          side={THREE.DoubleSide}
        >
          <MeshWobbleMaterial factor={0.05} speed={1} />
        </Image3D>
      </Float>
      
      <Text
        position={[0, -1.8, 0]}
        fontSize={0.2}
        font="https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD7K4Lc7QLwjDRpQ37K04.woff"
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {project.title.toUpperCase()}
      </Text>
    </group>
  );
}

export function ThreeDGallery({ projects, onClose }: { projects: any[]; onClose: () => void }) {
  const [selectedProject, setSelectedProject] = useState<any>(null);

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950">
      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start pointer-events-auto">
          <div>
            <h2 className="text-white text-3xl font-serif font-bold tracking-tighter mb-2">IMMERSIVE ARCHIVE</h2>
            <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Move className="h-3 w-3" /> Drag to Rotate</span>
              <span className="flex items-center gap-1.5"><Info className="h-3 w-3" /> Scroll to Zoom</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="max-w-md pointer-events-auto">
          {selectedProject ? (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-2xl text-white"
            >
              <h3 className="text-2xl font-serif font-bold mb-4">{selectedProject.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">{selectedProject.description}</p>
              <Button className="w-full rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 font-bold uppercase text-xs tracking-widest h-12">
                View Deep Artifact
              </Button>
            </motion.div>
          ) : (
            <p className="text-zinc-500 text-sm italic">Select an artifact in the spatial environment to view details.</p>
          )}
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas shadowCatcher>
        <PerspectiveCamera makeDefault position={[0, 2, 15]} fov={50} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          rotateSpeed={0.5} 
          minDistance={5} 
          maxDistance={20}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
        
        <color attach="background" args={['#09090b']} />
        <fog attach="fog" args={['#09090b', 10, 25]} />

        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        
        <Environment preset="city" />

        <Suspense fallback={null}>
          <group position={[0, 1, 0]}>
            {projects.map((project, idx) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                index={idx} 
                total={projects.length} 
                onSelect={setSelectedProject}
              />
            ))}
          </group>

          {/* Floor & Shadows */}
          <ContactShadows 
            position={[0, -2, 0]} 
            opacity={0.4} 
            scale={20} 
            blur={2} 
            far={4.5} 
          />
          
          <gridHelper args={[50, 50, '#18181b', '#18181b']} position={[0, -2, 0]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
