/**
 * Transform Gizmo Component for 3D Object Manipulation
 * Provides visual handles for moving, scaling, and rotating objects in 3D space
 */

"use client";

import { useRef, useState } from 'react';
import { Mesh, Vector3 } from 'three';
import { ThreeEvent } from '@react-three/fiber';

interface TransformGizmoProps {
  position: [number, number, number];
  onTransform: (type: 'move' | 'scale' | 'rotate', axis: 'x' | 'y' | 'z', delta: number) => void;
  mode: 'translate' | 'scale' | 'rotate';
  size?: number;
}

export function TransformGizmo({ position, onTransform, mode, size = 1 }: TransformGizmoProps) {
  const [hoveredAxis, setHoveredAxis] = useState<'x' | 'y' | 'z' | null>(null);
  const dragStartPos = useRef<Vector3 | null>(null);

  const handlePointerDown = (axis: 'x' | 'y' | 'z', event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    dragStartPos.current = new Vector3(event.point.x, event.point.y, event.point.z);
  };

  const handlePointerMove = (axis: 'x' | 'y' | 'z', event: ThreeEvent<PointerEvent>) => {
    if (!dragStartPos.current) return;

    const delta = event.point.getComponent(axis === 'x' ? 0 : axis === 'y' ? 1 : 2) -
                  dragStartPos.current.getComponent(axis === 'x' ? 0 : axis === 'y' ? 1 : 2);

    if (mode === 'translate') {
      onTransform('move', axis, delta);
    } else if (mode === 'scale') {
      onTransform('scale', axis, delta);
    } else if (mode === 'rotate') {
      onTransform('rotate', axis, delta);
    }

    dragStartPos.current = new Vector3(event.point.x, event.point.y, event.point.z);
  };

  const handlePointerUp = () => {
    dragStartPos.current = null;
  };

  return (
    <group position={position}>
      {mode === 'translate' && (
        <>
          {/* X Axis - Red */}
          <group>
            <mesh
              position={[size, 0, 0]}
              rotation={[0, 0, -Math.PI / 2]}
              onPointerDown={(e) => handlePointerDown('x', e)}
              onPointerMove={(e) => handlePointerMove('x', e)}
              onPointerUp={handlePointerUp}
              onPointerEnter={() => setHoveredAxis('x')}
              onPointerLeave={() => setHoveredAxis(null)}
            >
              <cylinderGeometry args={[0.05, 0.05, size * 2, 8]} />
              <meshBasicMaterial color={hoveredAxis === 'x' ? '#ff6666' : '#ff0000'} />
            </mesh>
            <mesh position={[size * 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <coneGeometry args={[0.15, 0.3, 8]} />
              <meshBasicMaterial color={hoveredAxis === 'x' ? '#ff6666' : '#ff0000'} />
            </mesh>
          </group>

          {/* Y Axis - Green */}
          <group>
            <mesh
              position={[0, size, 0]}
              onPointerDown={(e) => handlePointerDown('y', e)}
              onPointerMove={(e) => handlePointerMove('y', e)}
              onPointerUp={handlePointerUp}
              onPointerEnter={() => setHoveredAxis('y')}
              onPointerLeave={() => setHoveredAxis(null)}
            >
              <cylinderGeometry args={[0.05, 0.05, size * 2, 8]} />
              <meshBasicMaterial color={hoveredAxis === 'y' ? '#66ff66' : '#00ff00'} />
            </mesh>
            <mesh position={[0, size * 2, 0]}>
              <coneGeometry args={[0.15, 0.3, 8]} />
              <meshBasicMaterial color={hoveredAxis === 'y' ? '#66ff66' : '#00ff00'} />
            </mesh>
          </group>

          {/* Z Axis - Blue */}
          <group>
            <mesh
              position={[0, 0, size]}
              rotation={[Math.PI / 2, 0, 0]}
              onPointerDown={(e) => handlePointerDown('z', e)}
              onPointerMove={(e) => handlePointerMove('z', e)}
              onPointerUp={handlePointerUp}
              onPointerEnter={() => setHoveredAxis('z')}
              onPointerLeave={() => setHoveredAxis(null)}
            >
              <cylinderGeometry args={[0.05, 0.05, size * 2, 8]} />
              <meshBasicMaterial color={hoveredAxis === 'z' ? '#6666ff' : '#0000ff'} />
            </mesh>
            <mesh position={[0, 0, size * 2]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.15, 0.3, 8]} />
              <meshBasicMaterial color={hoveredAxis === 'z' ? '#6666ff' : '#0000ff'} />
            </mesh>
          </group>

          {/* Center sphere */}
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#ffff00" />
          </mesh>
        </>
      )}

      {mode === 'scale' && (
        <>
          {/* Scale handles on each axis */}
          <mesh
            position={[size, 0, 0]}
            onPointerDown={(e) => handlePointerDown('x', e)}
            onPointerMove={(e) => handlePointerMove('x', e)}
            onPointerUp={handlePointerUp}
            onPointerEnter={() => setHoveredAxis('x')}
            onPointerLeave={() => setHoveredAxis(null)}
          >
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshBasicMaterial color={hoveredAxis === 'x' ? '#ff6666' : '#ff0000'} />
          </mesh>

          <mesh
            position={[0, size, 0]}
            onPointerDown={(e) => handlePointerDown('y', e)}
            onPointerMove={(e) => handlePointerMove('y', e)}
            onPointerUp={handlePointerUp}
            onPointerEnter={() => setHoveredAxis('y')}
            onPointerLeave={() => setHoveredAxis(null)}
          >
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshBasicMaterial color={hoveredAxis === 'y' ? '#66ff66' : '#00ff00'} />
          </mesh>

          <mesh
            position={[0, 0, size]}
            onPointerDown={(e) => handlePointerDown('z', e)}
            onPointerMove={(e) => handlePointerMove('z', e)}
            onPointerUp={handlePointerUp}
            onPointerEnter={() => setHoveredAxis('z')}
            onPointerLeave={() => setHoveredAxis(null)}
          >
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshBasicMaterial color={hoveredAxis === 'z' ? '#6666ff' : '#0000ff'} />
          </mesh>
        </>
      )}

      {mode === 'rotate' && (
        <>
          {/* Rotation rings */}
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[size, 0.05, 16, 32]} />
            <meshBasicMaterial color={hoveredAxis === 'x' ? '#ff6666' : '#ff0000'} />
          </mesh>

          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[size, 0.05, 16, 32]} />
            <meshBasicMaterial color={hoveredAxis === 'y' ? '#66ff66' : '#00ff00'} />
          </mesh>

          <mesh rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[size, 0.05, 16, 32]} />
            <meshBasicMaterial color={hoveredAxis === 'z' ? '#6666ff' : '#0000ff'} />
          </mesh>
        </>
      )}
    </group>
  );
}
