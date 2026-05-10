import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function GlobeContent() {
  const globeRef = useRef<THREE.Mesh>(null!);
  const pointsRef = useRef<THREE.Points>(null!);

  // Generate random "city" points on the sphere
  const points = useMemo(() => {
    const p = new Float32Array(3000);
    for (let i = 0; i < 1000; i++) {
      const phi = Math.acos(-1 + (2 * i) / 1000);
      const theta = Math.sqrt(1000 * Math.PI) * phi;
      const x = Math.cos(theta) * Math.sin(phi) * 2;
      const y = Math.sin(theta) * Math.sin(phi) * 2;
      const z = Math.cos(phi) * 2;
      p.set([x, y, z], i * 3);
    }
    return p;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    globeRef.current.rotation.y = time * 0.1;
    pointsRef.current.rotation.y = time * 0.1;
  });

  return (
    <group>
      {/* The Main Wireframe Globe */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial 
          color="#0ea5e9" 
          wireframe 
          transparent 
          opacity={0.1} 
          emissive="#0ea5e9"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Atmospheric Glow */}
      <Sphere args={[2.1, 32, 32]}>
        <meshStandardMaterial
          color="#3b82f6"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* "City" Data Points */}
      <Points ref={pointsRef} positions={points} stride={3}>
        <PointMaterial
          transparent
          color="#22d3ee"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>

      {/* Pulsing Threat Indicators */}
      {[
        [1.5, 1, 1],
        [-1, 1.2, 1.5],
        [0.5, -1.8, 0.5]
      ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
           <Sphere args={[0.05, 16, 16]}>
             <meshBasicMaterial color="#ef4444" />
           </Sphere>
           <mesh>
             <ringGeometry args={[0.07, 0.1, 32]} />
             <meshBasicMaterial color="#ef4444" transparent opacity={0.5} side={THREE.DoubleSide} />
           </mesh>
        </group>
      ))}
    </group>
  );
}

export default function Globe3D() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          <GlobeContent />
        </Float>
      </Canvas>
    </div>
  );
}
