"use client";

import { Grid as DreiGrid } from "@react-three/drei";

interface DesignGridProps {
  size?: number;
  divisions?: number;
  visible?: boolean;
}

export default function DesignGrid({
  size = 30,
  divisions = 30,
  visible = true
}: DesignGridProps) {
  if (!visible) return null;

  return (
    <>
      {/* Main grid */}
      <DreiGrid
        args={[size, size]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#6fa070"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#4a7c2f"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
        position={[0, 0.01, 0]}
      />

      {/* Ground plane for raycasting */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        visible={false}
        name="ground-plane"
      >
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

// Helper function for snapping to grid
export function snapToGrid(value: number, gridSize: number = 1): number {
  return Math.round(value / gridSize) * gridSize;
}
