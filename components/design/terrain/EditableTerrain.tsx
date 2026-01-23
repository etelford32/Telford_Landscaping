/**
 * EditableTerrain - Heightmap-based editable terrain mesh
 * Renders terrain with vertex displacement from TerrainManager
 */

"use client";

import { useRef, useEffect, useMemo } from 'react';
import { Mesh, PlaneGeometry, BufferAttribute } from 'three';
import { TerrainManager } from '@/lib/terrain/TerrainManager';
import { useFrame } from '@react-three/fiber';

interface EditableTerrainProps {
  terrainManager: TerrainManager;
  grassColor?: string;
  showWireframe?: boolean;
  onTerrainClick?: (position: { x: number; y: number; z: number }) => void;
}

export default function EditableTerrain({
  terrainManager,
  grassColor = '#4a7c2f',
  showWireframe = false,
  onTerrainClick,
}: EditableTerrainProps) {
  const meshRef = useRef<Mesh>(null);
  const geometryRef = useRef<PlaneGeometry | null>(null);

  const config = terrainManager.getConfig();
  const { size, resolution } = config;

  // Create geometry
  const geometry = useMemo(() => {
    const geom = new PlaneGeometry(
      size,
      size,
      resolution,
      resolution
    );
    geom.rotateX(-Math.PI / 2); // Make it horizontal
    geometryRef.current = geom;
    return geom;
  }, [size, resolution]);

  // Update vertex heights from heightmap
  useEffect(() => {
    if (!geometryRef.current) return;

    const heightmap = terrainManager.getHeightmap();
    const positions = geometryRef.current.attributes.position;

    // Update Y coordinates (height) for each vertex
    for (let i = 0; i < positions.count; i++) {
      const height = heightmap[i] || 0;
      positions.setY(i, height);
    }

    positions.needsUpdate = true;
    geometryRef.current.computeVertexNormals(); // Recalculate normals for proper lighting
  }, [terrainManager]);

  // Re-render when terrain changes (triggered by TerrainManager)
  useFrame(() => {
    if (!geometryRef.current) return;

    const heightmap = terrainManager.getHeightmap();
    const positions = geometryRef.current.attributes.position as BufferAttribute;

    // Check if heightmap was updated (simple check)
    let needsUpdate = false;
    for (let i = 0; i < Math.min(10, positions.count); i++) {
      if (Math.abs(positions.getY(i) - (heightmap[i] || 0)) > 0.001) {
        needsUpdate = true;
        break;
      }
    }

    if (needsUpdate) {
      for (let i = 0; i < positions.count; i++) {
        positions.setY(i, heightmap[i] || 0);
      }
      positions.needsUpdate = true;
      geometryRef.current.computeVertexNormals();
    }
  });

  // Handle click
  const handleClick = (event: any) => {
    event.stopPropagation();
    if (onTerrainClick && event.point) {
      onTerrainClick({
        x: event.point.x,
        y: event.point.y,
        z: event.point.z,
      });
    }
  };

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      receiveShadow
      castShadow
      onClick={handleClick}
      name="editable-terrain"
    >
      <meshStandardMaterial
        color={grassColor}
        roughness={0.9}
        metalness={0.1}
        wireframe={showWireframe}
      />
    </mesh>
  );
}
