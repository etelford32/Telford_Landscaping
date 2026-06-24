/**
 * EditableTerrain - Heightmap-based editable terrain mesh
 * Renders terrain with vertex displacement from TerrainManager
 */

"use client";

import { useRef, useEffect, useMemo } from 'react';
import { Mesh, PlaneGeometry } from 'three';
import { TerrainManager } from '@/lib/terrain/TerrainManager';
import { useThree } from '@react-three/fiber';

interface EditableTerrainProps {
  terrainManager: TerrainManager;
  grassColor?: string;
  showWireframe?: boolean;
  /** Bumped by TerrainManager's change counter; drives heightmap re-application. */
  version?: number;
  onTerrainClick?: (position: { x: number; y: number; z: number }) => void;
}

export default function EditableTerrain({
  terrainManager,
  grassColor = '#4a7c2f',
  showWireframe = false,
  version = 0,
  onTerrainClick,
}: EditableTerrainProps) {
  const meshRef = useRef<Mesh>(null);
  const { invalidate } = useThree();

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
    return geom;
  }, [size, resolution]);

  // Apply the heightmap to the geometry whenever the terrain changes.
  // Previously this polled every frame in useFrame; it's now driven by the
  // `version` counter that TerrainManager bumps on every mutation, and by the
  // `geometry` identity so a rebuilt mesh (size/resolution change) re-applies.
  useEffect(() => {
    const heightmap = terrainManager.getHeightmap();
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      positions.setY(i, heightmap[i] || 0);
    }

    positions.needsUpdate = true;
    geometry.computeVertexNormals(); // Recalculate normals for proper lighting
    invalidate(); // Request a render (canvas runs in on-demand mode)
  }, [terrainManager, version, geometry, invalidate]);

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
