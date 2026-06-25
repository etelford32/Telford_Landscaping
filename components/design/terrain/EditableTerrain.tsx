/**
 * EditableTerrain - Heightmap-based editable terrain mesh
 * Renders terrain with vertex displacement from TerrainManager
 */

"use client";

import { useRef, useEffect, useMemo } from 'react';
import { Mesh, PlaneGeometry } from 'three';
import { TerrainManager } from '@/lib/terrain/TerrainManager';
import { useThree } from '@react-three/fiber';

// Write heightmap values + analytic heightfield normals into a geometry, limited
// to the given index-space region (normals cover the region plus a one-vertex
// border, since a vertex normal depends on its immediate neighbours' heights).
function syncHeightfieldRegion(
  geometry: PlaneGeometry,
  heightmap: Float32Array,
  resolution: number,
  cellSize: number,
  region: { minX: number; maxX: number; minZ: number; maxZ: number }
): void {
  const stride = resolution + 1;
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;

  for (let z = region.minZ; z <= region.maxZ; z++) {
    for (let x = region.minX; x <= region.maxX; x++) {
      const i = z * stride + x;
      position.setY(i, heightmap[i] || 0);
    }
  }
  position.needsUpdate = true;

  const nx0 = Math.max(0, region.minX - 1);
  const nx1 = Math.min(resolution, region.maxX + 1);
  const nz0 = Math.max(0, region.minZ - 1);
  const nz1 = Math.min(resolution, region.maxZ + 1);
  for (let z = nz0; z <= nz1; z++) {
    for (let x = nx0; x <= nx1; x++) {
      const i = z * stride + x;
      const hL = heightmap[z * stride + Math.max(0, x - 1)] || 0;
      const hR = heightmap[z * stride + Math.min(resolution, x + 1)] || 0;
      const hDown = heightmap[Math.max(0, z - 1) * stride + x] || 0;
      const hUp = heightmap[Math.min(resolution, z + 1) * stride + x] || 0;
      // Central-difference heightfield normal: normalize(-dh/dx, 1, -dh/dz).
      const gx = -(hR - hL) / (2 * cellSize);
      const gz = -(hUp - hDown) / (2 * cellSize);
      const len = Math.hypot(gx, 1, gz) || 1;
      normal.setXYZ(i, gx / len, 1 / len, gz / len);
    }
  }
  normal.needsUpdate = true;
}

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
  const syncedGeometry = useRef<PlaneGeometry | null>(null);
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

  // Dispose the geometry when it's replaced (size/resolution change) or on
  // unmount; it's created via useMemo, so R3F won't dispose it for us.
  useEffect(() => () => geometry.dispose(), [geometry]);

  // Push the heightmap into the geometry whenever the terrain changes. A freshly
  // built geometry is synced in full; afterwards only the region TerrainManager
  // reports dirty is rewritten, so a brush dab touches a few dozen vertices
  // instead of all ~4k. Driven by the `version` counter TerrainManager bumps on
  // every mutation (was a per-frame poll before Phase 1).
  useEffect(() => {
    const cellSize = size / resolution;

    let region: { minX: number; maxX: number; minZ: number; maxZ: number } | null;
    if (syncedGeometry.current !== geometry) {
      // New geometry (mount or resolution change): rewrite everything.
      terrainManager.consumeDirtyRegion();
      region = { minX: 0, maxX: resolution, minZ: 0, maxZ: resolution };
      syncedGeometry.current = geometry;
    } else {
      region = terrainManager.consumeDirtyRegion();
      if (!region) return;
    }

    syncHeightfieldRegion(geometry, terrainManager.getHeightmap(), resolution, cellSize, region);
    invalidate(); // Request a render (canvas runs in on-demand mode)
  }, [terrainManager, version, geometry, invalidate, size, resolution]);

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
