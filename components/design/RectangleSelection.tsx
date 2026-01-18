/**
 * RectangleSelection - Visual rectangle for drag-to-select multiple objects
 * Renders a selection box when user drags on canvas
 */

"use client";

import { useEffect, useRef } from 'react';

interface RectangleSelectionProps {
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  isActive: boolean;
}

export default function RectangleSelection({
  startPoint,
  endPoint,
  isActive
}: RectangleSelectionProps) {
  if (!isActive) return null;

  // Calculate rectangle dimensions
  const left = Math.min(startPoint.x, endPoint.x);
  const top = Math.min(startPoint.y, endPoint.y);
  const width = Math.abs(endPoint.x - startPoint.x);
  const height = Math.abs(endPoint.y - startPoint.y);

  return (
    <div
      className="fixed pointer-events-none z-[9998]"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        border: '2px solid #3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '2px'
      }}
    />
  );
}

/**
 * Hook for managing rectangle selection state and logic
 */
export function useRectangleSelection(options: {
  enabled: boolean;
  onSelectionChange: (selectedIds: string[]) => void;
  objects: Array<{
    id: string;
    screenPosition: { x: number; y: number };
  }>;
}) {
  const { enabled, onSelectionChange, objects } = options;

  const isSelecting = useRef(false);
  const startPoint = useRef({ x: 0, y: 0 });
  const currentPoint = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Only start selection on left click without modifiers on canvas
      if (e.button !== 0) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;

      // Check if clicking on UI elements
      const target = e.target as HTMLElement;
      if (target.closest('button, input, select, textarea, [role="button"]')) return;

      isSelecting.current = true;
      startPoint.current = { x: e.clientX, y: e.clientY };
      currentPoint.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting.current) return;

      currentPoint.current = { x: e.clientX, y: e.clientY };

      // Calculate objects within selection rectangle
      const left = Math.min(startPoint.current.x, currentPoint.current.x);
      const right = Math.max(startPoint.current.x, currentPoint.current.x);
      const top = Math.min(startPoint.current.y, currentPoint.current.y);
      const bottom = Math.max(startPoint.current.y, currentPoint.current.y);

      const selectedIds = objects
        .filter(obj => {
          const { x, y } = obj.screenPosition;
          return x >= left && x <= right && y >= top && y <= bottom;
        })
        .map(obj => obj.id);

      onSelectionChange(selectedIds);
    };

    const handleMouseUp = () => {
      isSelecting.current = false;
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enabled, objects, onSelectionChange]);

  return {
    isActive: isSelecting.current,
    startPoint: startPoint.current,
    endPoint: currentPoint.current
  };
}

/**
 * Utility to check if a point is within a rectangle
 */
export function isPointInRectangle(
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Utility to convert 3D world position to 2D screen position
 */
export function worldToScreen(
  worldPosition: { x: number; y: number; z: number },
  camera: any,
  size: { width: number; height: number }
): { x: number; y: number } | null {
  if (!camera) return null;

  // This is a simplified version - in practice you'd use Three.js's Vector3.project()
  // For now, return approximate position
  const x = (worldPosition.x + 50) * (size.width / 100);
  const y = (worldPosition.z + 50) * (size.height / 100);

  return { x, y };
}
