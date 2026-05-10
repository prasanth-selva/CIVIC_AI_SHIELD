import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial, Text, Box, Sphere, Cylinder, Fog } from "@react-three/drei";
import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { motion as m } from "framer-motion";

function Building({ position, height, status }: { position: [number, number, number], height: number, status?: string }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);

  return (
    <group position={position}>
      <mesh
        ref={mesh}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[1, height, 1]} />
        <meshStandardMaterial 
          color={status === 'alert' ? "#ff0000" : hovered ? "#ffffff" : "#111111"} 
          emissive={status === 'alert' ? "#ff0000" : "#000000"}
          emissiveIntensity={status === 'alert' ? 1.5 : 0}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Holographic Wireframe */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.05, height + 0.05, 1.05]} />
        <meshBasicMaterial color="#ff0000" wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

function Grid() {
  return (
    <gridHelper args={[50, 50, "#ff0000", "#050505"]} position={[0, -0.5, 0]} />
  );
}

function RadarSweep() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.rotation.y += 0.01;
  });
  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <cylinderGeometry args={[25, 25, 0.1, 64, 1, true, 0, Math.PI / 4]} />
      <meshBasicMaterial color="#ff0000" transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function CloudDensity({ position, radius, status }: { position: [number, number, number], radius: number, status: string }) {
  return (
    <group position={position}>
      <Sphere args={[radius, 32, 32]}>
        <meshStandardMaterial 
            color={status === 'alert' ? "#ff0000" : "#ffffff"} 
            transparent 
            opacity={0.05} 
            wireframe={status === 'alert'}
        />
      </Sphere>
      {status === 'alert' && (
        <Text
          position={[0, radius + 0.5, 0]}
          fontSize={0.4}
          color="#ff0000"
          font="/fonts/Inter-Black.woff"
        >
          DANGER_ZONE_EXPANDING
        </Text>
      )}
    </group>
  );
}

export function DigitalTwinCity() {
  const buildings = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      position: [Math.random() * 30 - 15, 0, Math.random() * 30 - 15] as [number, number, number],
      height: Math.random() * 8 + 2,
      status: Math.random() > 0.9 ? 'alert' : 'normal'
    }));
  }, []);

  return (
    <div className="w-full h-full bg-[#020202] relative cursor-crosshair">
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
          <p className="text-red-600 font-black text-[12px] uppercase tracking-[0.6em] mb-2 italic">Smart_City_Digital_Twin</p>
          <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">Operational_Urban_Grid</h3>
      </div>

      <Canvas>
        <PerspectiveCamera makeDefault position={[20, 20, 20]} fov={45} />
        <OrbitControls enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2.2} />
        
        <ambientLight intensity={0.1} />
        <pointLight position={[20, 20, 20]} intensity={2} color="#ff0000" />
        
        <group position={[0, 0, 0]}>
          {buildings.map((b) => (
            <Building key={b.id} position={b.position} height={b.height} status={b.status} />
          ))}
        </group>

        <CloudDensity position={[-5, 0, -5]} radius={6} status="alert" />
        <CloudDensity position={[8, 0, 8]} radius={4} status="normal" />

        <Grid />
        <RadarSweep />
        
        {/* Feature 4: Volumetric Fog (Cinematic) */}
        <fog attach="fog" args={["#020202", 10, 60]} />
      </Canvas>

      <div className="absolute bottom-8 right-8 z-10 text-right pointer-events-none">
          <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Grid_Engine: ASWIG_v4</p>
          <p className="text-[12px] font-mono text-red-600/80 uppercase">REAL_TIME_CROWD_SYNC: 98.4%</p>
      </div>

      {/* Feature 8: HUD Scanlines utility */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[size:100%_2px,3px_100%]" />
    </div>
  );
}
