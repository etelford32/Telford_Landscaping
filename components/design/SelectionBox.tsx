/**
 * SelectionBox - Enhanced visual selection feedback and multi-select support
 * Provides intuitive selection visualization for objects and grid areas
 */

"use client";

import { useRef, useState, useEffect } from 'react';
import { Box3, Vector3, Group, BoxGeometry } from 'three';
import { Html } from '@react-three/drei';

interface SelectionBoxProps {
  selectedObjects: any[];
  showBounds?: boolean;
  showCenter?: boolean;
  showDimensions?: boolean;
  color?: string;
}

export default function SelectionBox({
  selectedObjects = [],
  showBounds = true,
  showCenter = true,
  showDimensions = true,
  color = '#4ade80',
}: SelectionBoxProps) {
  if (selectedObjects.length === 0) return null;

  // Calculate bounding box for all selected objects
  const calculateBounds = () => {
    const box = new Box3();

    selectedObjects.forEach(obj => {
      if (obj.position) {
        const pos = new Vector3(obj.position.x, obj.position.y, obj.position.z);
        box.expandByPoint(pos);
      }
    });

    return box;
  };

  const bounds = calculateBounds();
  const center = new Vector3();
  bounds.getCenter(center);

  const size = new Vector3();
  bounds.getSize(size);

  return (
    <group>
      {/* Bounding Box */}
      {showBounds && (
        <mesh position={center}>
          <boxGeometry args={[size.x + 0.2, size.y + 0.2, size.z + 0.2]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.1}
            wireframe={false}
          />
        </mesh>
      )}

      {/* Wireframe Edges */}
      {showBounds && (
        <lineSegments position={center}>
          <edgesGeometry args={[new BoxGeometry(size.x + 0.2, size.y + 0.2, size.z + 0.2)]} />
          <lineBasicMaterial color={color} linewidth={2} />
        </lineSegments>
      )}

      {/* Corner Markers */}
      {showBounds && (
        <>
          {[
            [-1, -1, -1], [1, -1, -1], [-1, 1, -1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1]
          ].map((corner, i) => (
            <mesh
              key={i}
              position={[
                center.x + (corner[0] * size.x / 2),
                center.y + (corner[1] * size.y / 2),
                center.z + (corner[2] * size.z / 2)
              ]}
            >
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color={color} />
            </mesh>
          ))}
        </>
      )}

      {/* Center Marker */}
      {showCenter && (
        <mesh position={center}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Dimension Labels */}
      {showDimensions && (
        <>
          {/* Width Label (X) */}
          <Html
            position={[center.x, center.y - size.y / 2 - 0.5, center.z]}
            center
            distanceFactor={10}
            style={{ pointerEvents: 'none' }}
          >
            <div className="bg-black/75 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap">
              W: {size.x.toFixed(2)} ft
            </div>
          </Html>

          {/* Height Label (Y) */}
          {size.y > 0.5 && (
            <Html
              position={[center.x - size.x / 2 - 0.5, center.y, center.z]}
              center
              distanceFactor={10}
              style={{ pointerEvents: 'none' }}
            >
              <div className="bg-black/75 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap">
                H: {size.y.toFixed(2)} ft
              </div>
            </Html>
          )}

          {/* Depth Label (Z) */}
          <Html
            position={[center.x, center.y - size.y / 2 - 0.5, center.z + size.z / 2 + 0.5]}
            center
            distanceFactor={10}
            style={{ pointerEvents: 'none' }}
          >
            <div className="bg-black/75 text-white px-2 py-1 rounded text-xs font-mono whitespace-nowrap">
              D: {size.z.toFixed(2)} ft
            </div>
          </Html>
        </>
      )}

      {/* Selection Count Badge */}
      {selectedObjects.length > 1 && (
        <Html
          position={[center.x, center.y + size.y / 2 + 1, center.z]}
          center
          distanceFactor={10}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            {selectedObjects.length} selected
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Individual Object Selection Highlight
 */
export function ObjectHighlight({
  position,
  size = 1,
  color = '#4ade80',
  isActive = true,
}: {
  position: [number, number, number];
  size?: number;
  color?: string;
  isActive?: boolean;
}) {
  if (!isActive) return null;

  return (
    <group position={position}>
      {/* Ground Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[size * 0.8, size * 0.9, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>

      {/* Pulsing Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[size * 0.7, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>

      {/* Vertical Beam */}
      <mesh position={[0, size, 0]}>
        <cylinderGeometry args={[0.02, 0.02, size * 2, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
