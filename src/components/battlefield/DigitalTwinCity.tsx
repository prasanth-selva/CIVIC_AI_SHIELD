import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, Stars, MeshDistortMaterial, MeshWobbleMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function NeuralRadar() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 2) * 0.1);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(clock.getElapsedTime() * 4) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} rotation-x={-Math.PI / 2} position-y={0.1}>
      <circleGeometry args={[20, 64]} />
      <meshBasicMaterial color="#ff0000" transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Building({ position, height, color = "#222" }: { position: [number, number, number], height: number, color?: string }) {
  return (
    <mesh position={[position[0], height / 2, position[2]]}>
      <boxGeometry args={[1, height, 1]} />
      <meshStandardMaterial color={color} emissive="#ff0000" emissiveIntensity={0.1} metalness={0.8} roughness={0.2} />
      {/* HUD Lines on building */}
      <lineSegments>
         <edgesGeometry args={[new THREE.BoxGeometry(1.01, height + 0.01, 1.01)]} />
         <lineBasicMaterial color="#ff0000" transparent opacity={0.3} />
      </lineSegments>
    </mesh>
  );
}

function CityGrid() {
  const buildings = useMemo(() => {
    const b = [];
    for (let i = -10; i < 10; i += 2) {
      for (let j = -10; j < 10; j += 2) {
        if (Math.random() > 0.3) {
          b.push({
            position: [i, 0, j] as [number, number, number],
            height: Math.random() * 8 + 2,
            color: Math.random() > 0.8 ? "#444" : "#111"
          });
        }
      }
    }
    return b;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <Building key={i} {...b} />
      ))}
      <gridHelper args={[40, 40, "#ff0000", "#111"]} position-y={0} />
    </group>
  );
}

function TacticalOverlays() {
  const sweepRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (sweepRef.current) {
      sweepRef.current.rotation.z = -clock.getElapsedTime() * 1.5;
    }
  });

  return (
    <group rotation-x={-Math.PI / 2} position-y={0.2}>
      {/* Radar Sweep Line */}
      <mesh ref={sweepRef}>
        <planeGeometry args={[20, 0.5]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.4} />
      </mesh>
      
      {/* Danger Zones (Pulse) */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
         <mesh position={[5, 5, 0]}>
            <ringGeometry args={[2, 2.2, 32]} />
            <meshBasicMaterial color="#ff0000" transparent opacity={0.5} />
         </mesh>
      </Float>
    </group>
  );
}

export function DigitalTwinCity() {
  return (
    <div className="w-full h-full relative tactical-glass-panel overflow-hidden">
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
         <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Battlespace_Digital_Twin</h2>
         <p className="text-[10px] font-mono text-red-600 uppercase tracking-widest mt-1">Volumetric_Smart-City_Rendering_ACTIVE</p>
         <div className="flex gap-4 mt-4">
            <div className="px-3 py-1 bg-red-600/10 border border-red-600/30 text-[8px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
               Live_Crowd_Simulation
            </div>
            <div className="px-3 py-1 bg-emerald-600/10 border border-emerald-600/30 text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
               Neural_Radar_Sweep
            </div>
         </div>
      </div>

      <div className="absolute top-8 right-8 z-10 text-right pointer-events-none">
         <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Sector_Coordinates</p>
         <p className="text-xl font-black text-white italic">34.0522° N, 118.2437° W</p>
         <p className="text-[8px] font-mono text-red-900 uppercase tracking-widest mt-2">DANGER_EXPANSION: 1.4km/h</p>
      </div>

      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={50} />
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={5}
          maxDistance={40}
        />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ff0000" />
        <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={2} castShadow color="#fff" />

        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <CityGrid />
        <NeuralRadar />
        <TacticalOverlays />

        <fog attach="fog" args={["#050505", 10, 60]} />
      </Canvas>

      {/* Cinematic HUD Overlays */}
      <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20" />
      <div className="absolute bottom-8 left-8 right-8 z-10 flex justify-between items-end">
         <div className="space-y-2">
            <p className="text-[8px] font-black text-red-600 uppercase tracking-[0.4em]">Predictive_Movement_Tracking</p>
            <div className="flex gap-1 h-8 items-end">
               {Array.from({ length: 20 }).map((_, i) => (
                 <motion.div 
                   key={i}
                   animate={{ height: [4, Math.random() * 20 + 4, 4] }}
                   transition={{ repeat: Infinity, duration: 1, delay: i * 0.05 }}
                   className="w-1 bg-red-600/30"
                 />
               ))}
            </div>
         </div>
         <div className="flex flex-col items-end gap-2">
            <div className="flex gap-4">
               {['INFRA', 'TRAFFIC', 'CROWD', 'THREAT'].map(tag => (
                 <div key={tag} className="px-2 py-0.5 border border-white/10 text-[7px] font-black text-gray-500 uppercase tracking-widest">{tag}_DATA_STREAM</div>
               ))}
            </div>
            <p className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">Digital_Twin_Node_Latency: 14ms</p>
         </div>
      </div>
    </div>
  );
}
