/**
 * TerrainBrushPreview - Visual preview of terrain brush
 * Shows brush size and influence area on terrain
 */

"use client";

import { useRef, useEffect } from 'react';
import { Mesh, RingGeometry, Vector3 } from 'three';
import { BrushConfig, TerrainManager } from '@/lib/terrain/TerrainManager';

interface TerrainBrushPreviewProps {
  position: Vector3 | null;
  brush: BrushConfig;
  terrainManager: TerrainManager;
  visible: boolean;
  color?: string;
}

export default function TerrainBrushPreview({
  position,
  brush,
  terrainManager,
  visible,
  color = '#4ade80',
}: TerrainBrushPreviewProps) {
  const meshRef = useRef<Mesh>(null);

  // Update position to conform to terrain height
  useEffect(() => {
    if (!meshRef.current || !position || !visible) return;

    const terrainHeight = terrainManager.getHeightAt(position.x, position.z);
    meshRef.current.position.set(position.x, terrainHeight + 0.05, position.z);
  }, [position, terrainManager, visible]);

  if (!visible || !position) return null;

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[brush.size * 0.9, brush.size, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </mesh>
  );
}
