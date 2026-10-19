"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

function Runner() {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.35;
  });

  return (
    <group ref={group} rotation={[0.32, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.48, 0.48, 0.5, 28]} />
        <meshStandardMaterial color="#2A363A" metalness={0.85} roughness={0.32} />
      </mesh>

      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.12, 20]} />
        <meshStandardMaterial color="#FFB000" metalness={0.6} roughness={0.4} />
      </mesh>

      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return (
          <mesh
            key={index}
            position={[Math.cos(angle) * 1.15, 0, Math.sin(angle) * 1.15]}
            rotation={[0, -angle, 0.32]}
          >
            <boxGeometry args={[0.62, 0.07, 0.92]} />
            <meshStandardMaterial color="#E8E4D8" metalness={0.45} roughness={0.55} />
          </mesh>
        );
      })}

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.95, 0.018, 8, 72]} />
        <meshBasicMaterial color="#6FE3E0" transparent opacity={0.45} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.25, 0.008, 6, 72]} />
        <meshBasicMaterial color="#E8E4D8" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

export default function TurbineScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 2.7, 5.4], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={2.2} color="#FFB000" />
      <directionalLight position={[-4, -2, -3]} intensity={1.1} color="#6FE3E0" />
      <Runner />
    </Canvas>
  );
}
