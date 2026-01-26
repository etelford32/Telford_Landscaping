/**
 * useCanvasInteraction - Unified interaction hook for 3D canvas
 * Handles click-to-select and drag-to-move in a cohesive way
 */

import { useCallback, useRef, useState } from 'react';
import { Vector2, Vector3, Raycaster, Camera, Plane, Object3D } from 'three';
import { ThreeEvent } from '@react-three/fiber';

export type InteractionMode = 'select' | 'move' | 'rotate' | 'scale';

export interface DraggableItem {
  id: string;
  type: 'plant' | 'structure' | 'house';
  position: { x: number; y: number; z: number };
}

interface UseCanvasInteractionProps {
  mode: InteractionMode;
  selectedId: string | null;
  snapToGrid: boolean;
  gridSize: number;
  onSelect: (id: string | null, type: 'plant' | 'structure' | 'house') => void;
  onMove: (id: string, newPosition: { x: number; y: number; z: number }) => void;
  onMoveEnd?: () => void;
}

interface InteractionState {
  isDragging: boolean;
  draggedId: string | null;
  draggedType: 'plant' | 'structure' | 'house' | null;
  startPosition: Vector3 | null;
  currentPosition: Vector3 | null;
  cursor: 'default' | 'pointer' | 'grab' | 'grabbing' | 'move';
}

export function useCanvasInteraction({
  mode,
  selectedId,
  snapToGrid,
  gridSize,
  onSelect,
  onMove,
  onMoveEnd,
}: UseCanvasInteractionProps) {
  const [state, setState] = useState<InteractionState>({
    isDragging: false,
    draggedId: null,
    draggedType: null,
    startPosition: null,
    currentPosition: null,
    cursor: 'default',
  });

  const raycasterRef = useRef(new Raycaster());
  const dragPlaneRef = useRef(new Plane(new Vector3(0, 1, 0), 0));
  const dragOffsetRef = useRef(new Vector3());
  const hasDraggedRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  // Snap value to grid
  const snap = useCallback((value: number) => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  // Get intersection point on drag plane
  const getPlaneIntersection = useCallback((
    event: ThreeEvent<PointerEvent>,
    camera: Camera
  ): Vector3 | null => {
    const pointer = new Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    raycasterRef.current.setFromCamera(pointer, camera);

    const intersection = new Vector3();
    const hit = raycasterRef.current.ray.intersectPlane(dragPlaneRef.current, intersection);
    return hit ? intersection : null;
  }, []);

  // Handle pointer down on an object
  const handleObjectPointerDown = useCallback((
    event: ThreeEvent<PointerEvent>,
    id: string,
    type: 'plant' | 'structure' | 'house',
    position: { x: number; y: number; z: number }
  ) => {
    event.stopPropagation();

    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    hasDraggedRef.current = false;

    // Always select on pointer down
    onSelect(id, type);

    // In move mode, prepare for drag
    if (mode === 'move') {
      const camera = (event as any).camera as Camera;
      const intersectionPoint = getPlaneIntersection(event, camera);

      if (intersectionPoint) {
        const objectPos = new Vector3(position.x, position.y, position.z);
        dragOffsetRef.current.subVectors(objectPos, intersectionPoint);

        setState(prev => ({
          ...prev,
          isDragging: true,
          draggedId: id,
          draggedType: type,
          startPosition: objectPos.clone(),
          currentPosition: objectPos.clone(),
          cursor: 'grabbing',
        }));
      }
    }
  }, [mode, onSelect, getPlaneIntersection]);

  // Handle pointer move (for dragging)
  const handlePointerMove = useCallback((
    event: ThreeEvent<PointerEvent>,
    camera: Camera
  ) => {
    // Check if we've moved enough to consider it a drag (5px threshold)
    if (pointerStartRef.current) {
      const dx = event.clientX - pointerStartRef.current.x;
      const dy = event.clientY - pointerStartRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 5) {
        hasDraggedRef.current = true;
      }
    }

    if (!state.isDragging || !state.draggedId) return;

    const intersectionPoint = getPlaneIntersection(event, camera);
    if (!intersectionPoint) return;

    // Apply offset and snapping
    const newPos = intersectionPoint.add(dragOffsetRef.current);
    newPos.x = snap(newPos.x);
    newPos.z = snap(newPos.z);
    // Keep Y constant (ground level)
    newPos.y = state.startPosition?.y ?? 0;

    setState(prev => ({
      ...prev,
      currentPosition: newPos.clone(),
    }));

    onMove(state.draggedId!, { x: newPos.x, y: newPos.y, z: newPos.z });
  }, [state.isDragging, state.draggedId, state.startPosition, getPlaneIntersection, snap, onMove]);

  // Handle pointer up
  const handlePointerUp = useCallback(() => {
    pointerStartRef.current = null;

    if (state.isDragging) {
      setState(prev => ({
        ...prev,
        isDragging: false,
        draggedId: null,
        draggedType: null,
        startPosition: null,
        currentPosition: null,
        cursor: mode === 'move' && selectedId ? 'grab' : 'default',
      }));

      onMoveEnd?.();
    }
  }, [state.isDragging, mode, selectedId, onMoveEnd]);

  // Handle pointer over object (hover)
  const handleObjectPointerOver = useCallback((id: string) => {
    if (state.isDragging) return;

    const newCursor = mode === 'move' ? 'grab' : 'pointer';
    setState(prev => ({ ...prev, cursor: newCursor }));
  }, [mode, state.isDragging]);

  // Handle pointer out of object
  const handleObjectPointerOut = useCallback(() => {
    if (state.isDragging) return;
    setState(prev => ({ ...prev, cursor: 'default' }));
  }, [state.isDragging]);

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback((event: ThreeEvent<PointerEvent>) => {
    // Only deselect if we didn't drag and clicked on the canvas (not an object)
    if (!hasDraggedRef.current && event.object.userData.isGround) {
      onSelect(null, 'plant');
    }
  }, [onSelect]);

  // Cancel drag (e.g., on Escape)
  const cancelDrag = useCallback(() => {
    if (state.isDragging && state.startPosition && state.draggedId) {
      onMove(state.draggedId, {
        x: state.startPosition.x,
        y: state.startPosition.y,
        z: state.startPosition.z,
      });
    }

    setState(prev => ({
      ...prev,
      isDragging: false,
      draggedId: null,
      draggedType: null,
      startPosition: null,
      currentPosition: null,
      cursor: 'default',
    }));
  }, [state.isDragging, state.startPosition, state.draggedId, onMove]);

  return {
    // State
    isDragging: state.isDragging,
    draggedId: state.draggedId,
    cursor: state.cursor,
    currentDragPosition: state.currentPosition,

    // Handlers for objects
    handleObjectPointerDown,
    handleObjectPointerOver,
    handleObjectPointerOut,

    // Handlers for canvas
    handlePointerMove,
    handlePointerUp,
    handleCanvasClick,

    // Actions
    cancelDrag,
  };
}
