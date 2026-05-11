import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Float, Text, Sphere } from "@react-three/drei";
import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { motion as m } from "framer-motion";

function TacticalNode({ position, status, label }: { position: [number, number, number], status: string, label: string }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (status === 'alert') {
      mesh.current.scale.x = mesh.current.scale.y = mesh.current.scale.z = 1 + Math.sin(state.clock.getElapsedTime() * 10) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={mesh}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial 
          color={status === 'alert' ? "#ff0000" : hovered ? "#ffffff" : "#440000"} 
          emissive={status === 'alert' ? "#ff0000" : "#000000"}
          emissiveIntensity={status === 'alert' ? 2 : 0}
        />
      </mesh>
      
      {/* Feature 6: Tactical holographic text */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.2}
        color={status === 'alert' ? "#ff0000" : "#888"}
        font="/fonts/Inter-Black.woff"
      >
        {label}
      </Text>
      
      {/* Volumetric Danger Zone (Feature 6) */}
      {status === 'alert' && (
        <Sphere args={[1.5, 32, 32]}>
          <meshStandardMaterial 
            color="#ff0000" 
            transparent 
            opacity={0.1} 
            wireframe
          />
        </Sphere>
      )}
    </group>
  );
}

function Grid() {
  return (
    <gridHelper args={[20, 20, "#ff0000", "#110000"]} position={[0, -1, 0]} />
  );
}

function Scanner() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.position.z = Math.sin(state.clock.getElapsedTime()) * 10;
  });
  return (
    <mesh ref={ref} position={[0, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 0.1]} />
      <meshBasicMaterial color="#ff0000" transparent opacity={0.2} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function Strategic3DMap() {
  return (
    <div className="w-full h-full bg-[#020202] relative cursor-crosshair">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <p className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-1">Volumetric_Tactical_Space</p>
          <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Operational_Topology_v4</h3>
      </div>

      <Canvas>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={40} />
        <OrbitControls enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2.1} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ff0000" />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <group>
             <TacticalNode position={[-4, 0, -2]} status="alert" label="NODE_01 // SEC_ALPHA" />
             <TacticalNode position={[2, 0, 4]} status="active" label="NODE_02 // TRANSIT" />
             <TacticalNode position={[5, 0, -3]} status="idle" label="NODE_03 // PARKING" />
             <TacticalNode position={[-2, 0, 5]} status="active" label="NODE_04 // PLAZA" />
          </group>
        </Float>

        <Grid />
        <Scanner />
        
        {/* Cinematic background depth */}
        <fog attach="fog" args={["#020202", 5, 25]} />
      </Canvas>

      <div className="absolute bottom-6 right-6 z-10 text-right pointer-events-none">
          <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-1">Projection_Engine</p>
          <p className="text-[10px] font-mono text-red-600/60 uppercase">R3F // THREE_JS // SHADER_CORE_v1</p>
      </div>
    </div>
  );
}
