/**
 * DraggableObject - Wrapper component that makes 3D objects draggable
 * Integrates with the canvas interaction system for unified click/drag behavior
 */

"use client";

import { useRef, useState, useCallback, ReactNode } from 'react';
import { Group, Vector2, Vector3, Plane, Raycaster } from 'three';
import { ThreeEvent, useThree } from '@react-three/fiber';

interface DraggableObjectProps {
  id: string;
  type: 'plant' | 'structure' | 'house';
  position: { x: number; y: number; z: number };
  children: ReactNode;

  // Interaction settings
  draggable: boolean;
  selected: boolean;

  // Callbacks
  onSelect: (id: string, type: 'plant' | 'structure' | 'house') => void;
  onDrag?: (id: string, newPosition: { x: number; y: number; z: number }) => void;
  onDragEnd?: (id: string) => void;

  // Snapping
  snapToGrid?: boolean;
  gridSize?: number;
}

export function DraggableObject({
  id,
  type,
  position,
  children,
  draggable,
  selected,
  onSelect,
  onDrag,
  onDragEnd,
  snapToGrid = false,
  gridSize = 1,
}: DraggableObjectProps) {
  const groupRef = useRef<Group>(null);
  const { camera, gl } = useThree();

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const dragPlane = useRef(new Plane(new Vector3(0, 1, 0), 0));
  const raycaster = useRef(new Raycaster());
  const dragOffset = useRef(new Vector3());
  const startPosition = useRef(new Vector3());
  const hasMoved = useRef(false);

  // Snap value to grid
  const snap = useCallback((value: number): number => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  // Get mouse position in normalized device coordinates
  const getMouseNDC = useCallback((clientX: number, clientY: number): Vector2 => {
    const rect = gl.domElement.getBoundingClientRect();
    return new Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
  }, [gl.domElement]);

  // Get intersection with drag plane
  const getPlaneIntersection = useCallback((clientX: number, clientY: number): Vector3 | null => {
    const ndc = getMouseNDC(clientX, clientY);
    raycaster.current.setFromCamera(ndc, camera);

    const intersection = new Vector3();
    const hit = raycaster.current.ray.intersectPlane(dragPlane.current, intersection);
    return hit ? intersection : null;
  }, [camera, getMouseNDC]);

  // Handle pointer down
  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    // Always select on click
    onSelect(id, type);

    // If draggable, start drag preparation
    if (draggable && onDrag) {
      const intersection = getPlaneIntersection(event.clientX, event.clientY);

      if (intersection) {
        setIsDragging(true);
        hasMoved.current = false;
        startPosition.current.set(position.x, position.y, position.z);
        dragOffset.current.subVectors(startPosition.current, intersection);

        // Set cursor
        gl.domElement.style.cursor = 'grabbing';

        // Capture pointer for reliable dragging
        (event.target as HTMLElement)?.setPointerCapture?.(event.pointerId);
      }
    }
  }, [id, type, draggable, position, onSelect, onDrag, getPlaneIntersection, gl.domElement]);

  // Handle pointer move
  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !onDrag) return;

    event.stopPropagation();
    hasMoved.current = true;

    const intersection = getPlaneIntersection(event.clientX, event.clientY);
    if (!intersection) return;

    // Calculate new position with offset
    const newPos = intersection.add(dragOffset.current);

    // Apply snapping
    const snappedX = snap(newPos.x);
    const snappedZ = snap(newPos.z);

    // Keep Y position constant
    onDrag(id, { x: snappedX, y: position.y, z: snappedZ });
  }, [isDragging, id, position.y, onDrag, getPlaneIntersection, snap]);

  // Handle pointer up
  const handlePointerUp = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;

    event.stopPropagation();
    setIsDragging(false);

    // Release pointer capture
    (event.target as HTMLElement)?.releasePointerCapture?.(event.pointerId);

    // Reset cursor
    gl.domElement.style.cursor = isHovered && draggable ? 'grab' : 'pointer';

    // Call drag end callback
    if (hasMoved.current) {
      onDragEnd?.(id);
    }
  }, [isDragging, id, isHovered, draggable, onDragEnd, gl.domElement]);

  // Handle hover enter
  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
    if (!isDragging) {
      gl.domElement.style.cursor = draggable ? 'grab' : 'pointer';
    }
  }, [isDragging, draggable, gl.domElement]);

  // Handle hover leave
  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    if (!isDragging) {
      gl.domElement.style.cursor = 'default';
    }
  }, [isDragging, gl.domElement]);

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {children}

      {/* Drag indicator - show when dragging */}
      {isDragging && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 1.6, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Selection/hover indicator */}
      {(selected || isHovered) && !isDragging && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.3, 32]} />
          <meshBasicMaterial
            color={selected ? "#4ade80" : "#94a3b8"}
            transparent
            opacity={selected ? 0.8 : 0.4}
          />
        </mesh>
      )}
    </group>
  );
}

export default DraggableObject;
