/**
 * Transform Gizmo Component for 3D Object Manipulation
 * Provides visual handles for moving, scaling, and rotating objects in 3D space
 * Enhanced with corner/edge handles and real-time dimension feedback
 */

"use client";

import { useRef, useState } from 'react';
import { Mesh, Vector3, Box3 } from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';

interface TransformGizmoProps {
  position: [number, number, number];
  onTransform: (type: 'move' | 'scale' | 'rotate', axis: 'x' | 'y' | 'z' | 'xy' | 'xz' | 'yz' | 'xyz', delta: number) => void;
  mode: 'translate' | 'scale' | 'rotate';
  size?: number;
  boundingBox?: Box3;
  showDimensions?: boolean;
}

export function TransformGizmo({
  position,
  onTransform,
  mode,
  size = 1,
  boundingBox,
  showDimensions = true
}: TransformGizmoProps) {
  const [hoveredAxis, setHoveredAxis] = useState<'x' | 'y' | 'z' | 'xy' | 'xz' | 'yz' | 'xyz' | null>(null);
  const dragStartPos = useRef<Vector3 | null>(null);
  const [currentDimensions, setCurrentDimensions] = useState<{ width: number; height: number; depth: number } | null>(null);

  const handlePointerDown = (axis: 'x' | 'y' | 'z' | 'xy' | 'xz' | 'yz' | 'xyz', event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    dragStartPos.current = new Vector3(event.point.x, event.point.y, event.point.z);

    // Calculate initial dimensions if we have a bounding box
    if (boundingBox && mode === 'scale') {
      const size = new Vector3();
      boundingBox.getSize(size);
      setCurrentDimensions({
        width: size.x,
        height: size.y,
        depth: size.z
      });
    }
  };

  const handlePointerMove = (axis: 'x' | 'y' | 'z' | 'xy' | 'xz' | 'yz' | 'xyz', event: ThreeEvent<PointerEvent>) => {
    if (!dragStartPos.current) return;

    // For multi-axis operations, use the maximum delta
    let delta = 0;
    if (axis.length === 1) {
      delta = event.point.getComponent(axis === 'x' ? 0 : axis === 'y' ? 1 : 2) -
              dragStartPos.current.getComponent(axis === 'x' ? 0 : axis === 'y' ? 1 : 2);
    } else {
      // For combined axes, calculate average delta
      const deltaX = event.point.x - dragStartPos.current.x;
      const deltaY = event.point.y - dragStartPos.current.y;
      const deltaZ = event.point.z - dragStartPos.current.z;
      delta = Math.max(Math.abs(deltaX), Math.abs(deltaY), Math.abs(deltaZ));
    }

    if (mode === 'translate') {
      onTransform('move', axis, delta);
    } else if (mode === 'scale') {
      onTransform('scale', axis, delta);

      // Update dimensions display
      if (boundingBox && currentDimensions) {
        const scaleFactor = 1 + delta;
        setCurrentDimensions({
          width: currentDimensions.width * scaleFactor,
          height: currentDimensions.height * scaleFactor,
          depth: currentDimensions.depth * scaleFactor
        });
      }
    } else if (mode === 'rotate') {
      onTransform('rotate', axis, delta);
    }

    dragStartPos.current = new Vector3(event.point.x, event.point.y, event.point.z);
  };

  const handlePointerUp = () => {
    dragStartPos.current = null;
    setCurrentDimensions(null);
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
          {/* Axis-aligned scale handles */}
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
            position={[-size, 0, 0]}
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

          <mesh
            position={[0, 0, -size]}
            onPointerDown={(e) => handlePointerDown('z', e)}
            onPointerMove={(e) => handlePointerMove('z', e)}
            onPointerUp={handlePointerUp}
            onPointerEnter={() => setHoveredAxis('z')}
            onPointerLeave={() => setHoveredAxis(null)}
          >
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshBasicMaterial color={hoveredAxis === 'z' ? '#6666ff' : '#0000ff'} />
          </mesh>

          {/* Edge handles for 2-axis scaling */}
          {/* XY plane edges */}
          <mesh
            position={[size, 0, size]}
            onPointerDown={(e) => handlePointerDown('xz', e)}
            onPointerMove={(e) => handlePointerMove('xz', e)}
            onPointerUp={handlePointerUp}
            onPointerEnter={() => setHoveredAxis('xz')}
            onPointerLeave={() => setHoveredAxis(null)}
          >
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color={hoveredAxis === 'xz' ? '#ffff66' : '#ffff00'} />
          </mesh>

          <mesh
            position={[-size, 0, size]}
            onPointerDown={(e) => handlePointerDown('xz', e)}
            onPointerMove={(e) => handlePointerMove('xz', e)}
            onPointerUp={handlePointerUp}
            onPointerEnter={() => setHoveredAxis('xz')}
            onPointerLeave={() => setHoveredAxis(null)}
          >
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color={hoveredAxis === 'xz' ? '#ffff66' : '#ffff00'} />
          </mesh>

          <mesh
            position={[size, 0, -size]}
            onPointerDown={(e) => handlePointerDown('xz', e)}
            onPointerMove={(e) => handlePointerMove('xz', e)}
            onPointerUp={handlePointerUp}
            onPointerEnter={() => setHoveredAxis('xz')}
            onPointerLeave={() => setHoveredAxis(null)}
          >
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color={hoveredAxis === 'xz' ? '#ffff66' : '#ffff00'} />
          </mesh>

          <mesh
            position={[-size, 0, -size]}
            onPointerDown={(e) => handlePointerDown('xz', e)}
            onPointerMove={(e) => handlePointerMove('xz', e)}
            onPointerUp={handlePointerUp}
            onPointerEnter={() => setHoveredAxis('xz')}
            onPointerLeave={() => setHoveredAxis(null)}
          >
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color={hoveredAxis === 'xz' ? '#ffff66' : '#ffff00'} />
          </mesh>

          {/* Center uniform scale handle */}
          <mesh
            onPointerDown={(e) => handlePointerDown('xyz', e)}
            onPointerMove={(e) => handlePointerMove('xyz', e)}
            onPointerUp={handlePointerUp}
            onPointerEnter={() => setHoveredAxis('xyz')}
            onPointerLeave={() => setHoveredAxis(null)}
          >
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshBasicMaterial color={hoveredAxis === 'xyz' ? '#ffffff' : '#cccccc'} />
          </mesh>

          {/* Dimension display */}
          {showDimensions && currentDimensions && (
            <Html position={[0, size + 1, 0]} center>
              <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm font-mono whitespace-nowrap">
                W: {currentDimensions.width.toFixed(2)}ft
                <br />
                H: {currentDimensions.height.toFixed(2)}ft
                <br />
                D: {currentDimensions.depth.toFixed(2)}ft
              </div>
            </Html>
          )}
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
