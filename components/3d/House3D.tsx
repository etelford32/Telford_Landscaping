"use client";

import { useRef } from "react";
import { Mesh } from "three";

export default function House3D() {
  const houseRef = useRef<Mesh>(null);

  return (
    <group position={[0, 0, 0]}>
      {/* Main House Body */}
      <mesh ref={houseRef} position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 3, 4]} />
        <meshStandardMaterial color="#f5f0e6" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 3.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.5, 1.5, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.8, 2.01]} castShadow>
        <boxGeometry args={[0.6, 1.4, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Windows */}
      <mesh position={[-0.8, 1.5, 2.01]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
      <mesh position={[0.8, 1.5, 2.01]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>

      {/* Side Windows */}
      <mesh position={[1.51, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>
      <mesh position={[-1.51, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#87CEEB" />
      </mesh>

      {/* Chimney */}
      <mesh position={[1, 4, 0.5]} castShadow>
        <boxGeometry args={[0.4, 1, 0.4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>

      {/* Front Porch Steps */}
      <mesh position={[0, 0.1, 2.5]} receiveShadow>
        <boxGeometry args={[1.2, 0.2, 0.4]} />
        <meshStandardMaterial color="#a0826d" />
      </mesh>
      <mesh position={[0, 0.25, 2.8]} receiveShadow>
        <boxGeometry args={[1.4, 0.1, 0.3]} />
        <meshStandardMaterial color="#a0826d" />
      </mesh>

      {/* Garage */}
      <mesh position={[3.5, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 2.4, 3]} />
        <meshStandardMaterial color="#e8dcc4" />
      </mesh>

      {/* Garage Door */}
      <mesh position={[3.5, 1, 1.51]} castShadow>
        <boxGeometry args={[1.6, 1.8, 0.05]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>

      {/* Garage Roof */}
      <mesh position={[3.5, 2.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.8, 1, 4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  );
}
