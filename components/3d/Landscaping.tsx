"use client";

import { useMemo, useRef } from "react";
import { Mesh } from "three";
import { hashString, mulberry32 } from "@/lib/utils/seededRandom";

interface TreeProps {
  position: [number, number, number];
  scale?: number;
  treeType?: "pine" | "oak" | "palm";
}

export function Tree({ position, scale = 1, treeType = "oak" }: TreeProps) {
  const trunkRef = useRef<Mesh>(null);

  if (treeType === "pine") {
    return (
      <group position={position} scale={scale}>
        {/* Trunk */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 1, 8]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        {/* Pine foliage - layered cones */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <coneGeometry args={[1, 1.5, 8]} />
          <meshStandardMaterial color="#2d5016" />
        </mesh>
        <mesh position={[0, 2.2, 0]} castShadow>
          <coneGeometry args={[0.8, 1.2, 8]} />
          <meshStandardMaterial color="#3a6b1f" />
        </mesh>
        <mesh position={[0, 2.8, 0]} castShadow>
          <coneGeometry args={[0.6, 1, 8]} />
          <meshStandardMaterial color="#4a7c2f" />
        </mesh>
      </group>
    );
  }

  if (treeType === "palm") {
    return (
      <group position={position} scale={scale}>
        {/* Tall trunk */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.18, 3, 8]} />
          <meshStandardMaterial color="#8b7355" />
        </mesh>
        {/* Palm fronds */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI) / 3) * 0.5,
              3,
              Math.sin((i * Math.PI) / 3) * 0.5,
            ]}
            rotation={[Math.PI / 4, (i * Math.PI) / 3, 0]}
            castShadow
          >
            <boxGeometry args={[0.1, 1.2, 0.6]} />
            <meshStandardMaterial color="#228b22" />
          </mesh>
        ))}
      </group>
    );
  }

  // Oak tree (default)
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh ref={trunkRef} position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 1.2, 8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <sphereGeometry args={[0.8, 8, 8]} />
        <meshStandardMaterial color="#4a7c2f" />
      </mesh>
      <mesh position={[-0.3, 2, 0.2]} castShadow>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color="#3a6b1f" />
      </mesh>
      <mesh position={[0.3, 1.9, -0.2]} castShadow>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color="#5a8c3f" />
      </mesh>
    </group>
  );
}

interface BushProps {
  position: [number, number, number];
  scale?: number;
  color?: string;
}

export function Bush({ position, scale = 1, color = "#3d8b40" }: BushProps) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.2, 0.25, 0.15]} castShadow>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.2, 0.28, -0.1]} castShadow>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

interface FlowerBedProps {
  position: [number, number, number];
  width?: number;
  depth?: number;
}

export function FlowerBed({ position, width = 2, depth = 1 }: FlowerBedProps) {
  // Seeded placement so flowers keep their spots across re-renders. The homepage
  // scene re-renders on every growth frame; Math.random() here made them boil.
  const flowers = useMemo(() => {
    const rand = mulberry32(hashString(`${position[0]},${position[1]},${position[2]}:${width}x${depth}`));
    return Array.from({ length: 8 }, () => ({
      x: (rand() - 0.5) * (width - 0.3),
      z: (rand() - 0.5) * (depth - 0.3),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1], position[2], width, depth]);

  return (
    <group position={position}>
      {/* Soil bed */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[width, 0.1, depth]} />
        <meshStandardMaterial color="#4a3c28" />
      </mesh>
      {/* Flowers - seeded placement */}
      {flowers.map((f, i) => (
        <mesh key={i} position={[f.x, 0.15, f.z]} castShadow>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial
            color={
              ["#ff69b4", "#ff1493", "#ffd700", "#ff6347", "#9370db"][i % 5]
            }
          />
        </mesh>
      ))}
    </group>
  );
}

interface RockProps {
  position: [number, number, number];
  scale?: number;
}

export function Rock({ position, scale = 1 }: RockProps) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color="#808080" roughness={0.9} />
    </mesh>
  );
}
