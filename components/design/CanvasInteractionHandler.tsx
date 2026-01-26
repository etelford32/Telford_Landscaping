/**
 * CanvasInteractionHandler - Handles canvas-level pointer events
 * Works alongside object-level handlers to provide unified interaction
 */

"use client";

import { useCallback, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector2, Vector3, Raycaster, Plane } from 'three';

interface CanvasInteractionHandlerProps {
  onDeselect: () => void;
  onCursorPositionChange: (pos: { x: number; y: number; z: number }) => void;
  enabled?: boolean;
}

export function CanvasInteractionHandler({
  onDeselect,
  onCursorPositionChange,
  enabled = true,
}: CanvasInteractionHandlerProps) {
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new Raycaster());
  const groundPlane = useRef(new Plane(new Vector3(0, 1, 0), 0));
  const lastCursorPos = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });

  // Update cursor position on frame (throttled)
  const frameCount = useRef(0);
  useFrame(() => {
    frameCount.current++;
    // Only update every 3 frames to reduce overhead
    if (frameCount.current % 3 !== 0) return;

    // Get cursor position from last known mouse position
    // This is handled by the mousemove event below
  });

  // Handle mouse move for cursor tracking
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled) return;

    const rect = gl.domElement.getBoundingClientRect();
    const ndc = new Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    raycaster.current.setFromCamera(ndc, camera);

    const intersection = new Vector3();
    if (raycaster.current.ray.intersectPlane(groundPlane.current, intersection)) {
      const pos = {
        x: Math.round(intersection.x * 100) / 100,
        y: Math.round(intersection.y * 100) / 100,
        z: Math.round(intersection.z * 100) / 100,
      };

      // Only update if position changed significantly
      if (
        Math.abs(pos.x - lastCursorPos.current.x) > 0.01 ||
        Math.abs(pos.z - lastCursorPos.current.z) > 0.01
      ) {
        lastCursorPos.current = pos;
        onCursorPositionChange(pos);
      }
    }
  }, [enabled, camera, gl.domElement, onCursorPositionChange]);

  // Attach event listeners
  const attachedRef = useRef(false);
  if (!attachedRef.current && gl.domElement) {
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    attachedRef.current = true;
  }

  return null; // This is a logic-only component
}

export default CanvasInteractionHandler;
