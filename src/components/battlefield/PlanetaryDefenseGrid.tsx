import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Float, Text, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <group>
      {/* Planetary Core */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial 
          color="#000" 
          emissive="#ff0000" 
          emissiveIntensity={0.2} 
          wireframe={true} 
          transparent={true} 
          opacity={0.3} 
        />
      </mesh>
      
      {/* Atmosphere Glow */}
      <Sphere args={[5.2, 64, 64]}>
        <meshBasicMaterial color="#ff0000" transparent opacity={0.05} side={THREE.BackSide} />
      </Sphere>
    </group>
  );
}

function OrbitalRing({ radius, speed, rotationAxis = [1, 0, 0] }: { radius: number, speed: number, rotationAxis?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * speed;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh rotation-x={Math.PI / 2}>
        <ringGeometry args={[radius, radius + 0.05, 128]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Orbital Node */}
      <mesh position={[radius, 0, 0]}>
         <boxGeometry args={[0.2, 0.2, 0.2]} />
         <meshBasicMaterial color="#ff0000" />
      </mesh>
    </group>
  );
}

function NeuralPathway({ count = 20 }) {
  const lines = useMemo(() => {
    const l = [];
    for (let i = 0; i < count; i++) {
      const points = [];
      const start = new THREE.Vector3().setFromSphericalCoords(5, Math.random() * Math.PI, Math.random() * Math.PI * 2);
      const end = new THREE.Vector3().setFromSphericalCoords(5, Math.random() * Math.PI, Math.random() * Math.PI * 2);
      
      for (let j = 0; j <= 20; j++) {
        const p = new THREE.Vector3().lerpVectors(start, end, j / 20);
        p.normalize().multiplyScalar(5 + Math.sin(j / 20 * Math.PI) * 0.5);
        points.push(p);
      }
      l.push(new THREE.CatmullRomCurve3(points));
    }
    return l;
  }, [count]);

  return (
    <group>
      {lines.map((curve, i) => (
        <line key={i}>
           <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints(curve.getPoints(50))} />
           <lineBasicMaterial attach="material" color="#ff0000" transparent opacity={0.1} />
        </line>
      ))}
    </group>
  );
}

export function PlanetaryDefenseGrid() {
  return (
    <div className="w-full h-full relative tactical-glass-panel overflow-hidden bg-black">
      <div className="absolute top-10 left-10 z-10 pointer-events-none">
         <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">Planetary_Defense_Grid</h2>
         <p className="text-[10px] font-mono text-red-600 uppercase tracking-widest mt-2">Orbital_Intelligence_Fabric_v12.4_ACTIVE</p>
         
         <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
               <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">SATELLITE_SYNC: 100%</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
               <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">ATMOSPHERIC_SCAN: STABLE</span>
            </div>
         </div>
      </div>

      <div className="absolute bottom-10 right-10 z-10 text-right pointer-events-none">
         <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mb-2">Global_Risk_Heatmap</p>
         <p className="text-2xl font-black text-white italic tracking-tighter uppercase">SECTOR_ALPHA_SECURED</p>
         <div className="flex gap-2 mt-4 justify-end">
            {['NODE-ORBIT-1', 'NODE-ORBIT-2', 'NODE-ORBIT-3'].map(node => (
              <div key={node} className="px-3 py-1 bg-red-600/10 border border-red-600/40 text-[8px] font-mono text-red-600 uppercase tracking-tighter">{node}</div>
            ))}
         </div>
      </div>

      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={50} />
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={8}
          maxDistance={30}
          autoRotate
          autoRotateSpeed={0.5}
        />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#ff0000" />
        <spotLight position={[-10, 20, 10]} angle={0.2} penumbra={1} intensity={2} color="#fff" />

        <Stars radius={100} depth={50} count={10000} factor={4} saturation={0} fade speed={1} />
        
        <Earth />
        <OrbitalRing radius={7} speed={0.5} />
        <OrbitalRing radius={8.5} speed={-0.3} />
        <OrbitalRing radius={10} speed={0.2} />
        <NeuralPathway count={30} />

        <fog attach="fog" args={["#000", 10, 50]} />
      </Canvas>

      {/* Cinematic HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="scanlines opacity-20" />
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#000_100%)] opacity-60" />
         
         {/* Coordinate Tracking */}
         <div className="absolute top-1/2 right-10 -translate-y-1/2 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-end opacity-40">
                 <p className="text-[7px] font-mono text-gray-500">LAT: {(Math.random() * 180 - 90).toFixed(4)}°</p>
                 <p className="text-[7px] font-mono text-gray-500">LON: {(Math.random() * 360 - 180).toFixed(4)}°</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
