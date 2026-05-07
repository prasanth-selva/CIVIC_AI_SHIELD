import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ShieldCore() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.2;
    meshRef.current.rotation.z = time * 0.1;
  });

  return (
    <group>
      {/* Outer Glow Sphere */}
      <Sphere args={[1.5, 64, 64]} scale={1.2}>
        <MeshDistortMaterial
          color="#0ea5e9"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0}
          transparent
          opacity={0.1}
        />
      </Sphere>

      {/* Main Shield Geometry */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[1, 0]} />
        <MeshWobbleMaterial 
          color="#22d3ee" 
          factor={0.4} 
          speed={1.5} 
          roughness={0.1}
          metalness={0.8}
          emissive="#22d3ee"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Inner Energy Core */}
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={2}
        />
      </Sphere>

      {/* Orbital Rings */}
      <group rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[1.8, 0.02, 16, 100]} />
          <meshBasicMaterial color="#0ea5e9" transparent opacity={0.3} />
        </mesh>
      </group>
      <group rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <mesh>
          <torusGeometry args={[2, 0.02, 16, 100]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} />
        </mesh>
      </group>
    </group>
  );
}

export default function Shield3D() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <ShieldCore />
        </Float>
      </Canvas>
    </div>
  );
}
