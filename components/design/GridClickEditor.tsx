/**
 * GridClickEditor - Interactive 3D grid for click-based placement
 * Provides a visible, clickable mesh layer for intuitive object placement
 */

"use client";

import { useRef, useState } from 'react';
import { Mesh, Vector3, Raycaster, Camera } from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';

interface GridClickEditorProps {
  gridSize: number;
  cellSize: number;
  onGridClick: (position: { x: number; y: number; z: number }) => void;
  enabled: boolean;
  showPreview?: boolean;
  previewColor?: string;
}

export default function GridClickEditor({
  gridSize = 30,
  cellSize = 1,
  onGridClick,
  enabled = true,
  showPreview = true,
  previewColor = '#4ade80',
}: GridClickEditorProps) {
  const meshRef = useRef<Mesh>(null);
  const [hoverPosition, setHoverPosition] = useState<Vector3 | null>(null);
  const [showHover, setShowHover] = useState(false);
  const { camera, raycaster, pointer } = useThree();

  // Snap to grid
  const snapToGrid = (value: number): number => {
    return Math.round(value / cellSize) * cellSize;
  };

  // Handle pointer move for hover effect
  useFrame(() => {
    if (!enabled || !meshRef.current) return;

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const snappedX = snapToGrid(point.x);
      const snappedZ = snapToGrid(point.z);

      // Check if within bounds
      const halfSize = gridSize / 2;
      if (Math.abs(snappedX) <= halfSize && Math.abs(snappedZ) <= halfSize) {
        setHoverPosition(new Vector3(snappedX, 0.05, snappedZ));
        setShowHover(true);
      } else {
        setShowHover(false);
      }
    } else {
      setShowHover(false);
    }
  });

  // Handle click
  const handleClick = (event: any) => {
    event.stopPropagation();
    if (!enabled || !hoverPosition) return;

    onGridClick({
      x: hoverPosition.x,
      y: hoverPosition.y,
      z: hoverPosition.z,
    });
  };

  return (
    <group>
      {/* Invisible clickable plane */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={handleClick}
        onPointerEnter={() => enabled && setShowHover(true)}
        onPointerLeave={() => setShowHover(false)}
      >
        <planeGeometry args={[gridSize, gridSize]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Hover preview indicator */}
      {showPreview && showHover && hoverPosition && (
        <group position={hoverPosition}>
          {/* Glowing circle */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <circleGeometry args={[cellSize * 0.4, 32]} />
            <meshBasicMaterial
              color={previewColor}
              transparent
              opacity={0.5}
            />
          </mesh>

          {/* Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[cellSize * 0.35, cellSize * 0.45, 32]} />
            <meshBasicMaterial
              color={previewColor}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Coordinate label */}
          <Html
            center
            distanceFactor={10}
            position={[0, 0.5, 0]}
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <div className="bg-black/75 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap">
              ({hoverPosition.x.toFixed(1)}, {hoverPosition.z.toFixed(1)})
            </div>
          </Html>

          {/* Vertical indicator line */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
            <meshBasicMaterial
              color={previewColor}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      )}

      {/* Grid cell indicators at hover position */}
      {showPreview && showHover && hoverPosition && (
        <>
          {/* X-axis guide */}
          <mesh position={[hoverPosition.x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.05, gridSize]} />
            <meshBasicMaterial
              color="#ef4444"
              transparent
              opacity={0.3}
            />
          </mesh>

          {/* Z-axis guide */}
          <mesh position={[0, 0.01, hoverPosition.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[gridSize, 0.05]} />
            <meshBasicMaterial
              color="#3b82f6"
              transparent
              opacity={0.3}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

/**
 * Grid intersection points visualizer
 * Shows clickable points at grid intersections
 */
export function GridPointsVisualizer({
  gridSize = 30,
  cellSize = 1,
  pointSize = 0.1,
  color = '#94a3b8',
  enabled = true,
}: {
  gridSize?: number;
  cellSize?: number;
  pointSize?: number;
  color?: string;
  enabled?: boolean;
}) {
  if (!enabled) return null;

  const points: Vector3[] = [];
  const halfSize = gridSize / 2;

  // Generate grid points
  for (let x = -halfSize; x <= halfSize; x += cellSize) {
    for (let z = -halfSize; z <= halfSize; z += cellSize) {
      points.push(new Vector3(x, 0.05, z));
    }
  }

  return (
    <group>
      {points.map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[pointSize, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
}
