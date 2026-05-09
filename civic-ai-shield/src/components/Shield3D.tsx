import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ShieldCore() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.15;
    meshRef.current.rotation.z = time * 0.05;
  });

  return (
    <group>
      {/* Outer Atmospheric Glow */}
      <Sphere args={[2, 64, 64]} scale={1.1}>
        <MeshDistortMaterial
          color="#ff0000"
          attach="material"
          distort={0.3}
          speed={1.5}
          roughness={1}
          transparent
          opacity={0.05}
        />
      </Sphere>

      {/* Main Core Geometry - Military Grade Octahedron */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1.2, 0]} />
        <MeshWobbleMaterial 
          color="#1a1a1a" 
          factor={0.2} 
          speed={1} 
          roughness={0.2}
          metalness={1}
          emissive="#ff0000"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Inner Energy Pulse */}
      <Sphere args={[0.4, 32, 32]}>
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={4}
        />
      </Sphere>

      {/* Orbital Defense Rings */}
      <group rotation={[Math.PI / 3, 0, 0]}>
        <mesh>
          <torusGeometry args={[2.2, 0.015, 16, 100]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.2} />
        </mesh>
      </group>
      <group rotation={[-Math.PI / 4, Math.PI / 6, 0]}>
        <mesh>
          <torusGeometry args={[2.5, 0.015, 16, 100]} />
          <meshBasicMaterial color="#8b0000" transparent opacity={0.15} />
        </mesh>
      </group>
    </group>
  );
}

export default function Shield3D() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas camera={{ position: [0, 0, 6], fov: 40 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#ff0000" />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#ffffff" />
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
          <ShieldCore />
        </Float>
      </Canvas>
    </div>
  );
}

