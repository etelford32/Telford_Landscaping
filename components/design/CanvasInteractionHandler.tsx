/**
 * CanvasInteractionHandler - Handles canvas-level pointer events
 * Works alongside object-level handlers to provide unified interaction
 */

"use client";

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
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
  const { camera, gl } = useThree();

  // Reused across events so a fast-moving pointer doesn't allocate per move.
  const raycaster = useRef(new Raycaster());
  const groundPlane = useRef(new Plane(new Vector3(0, 1, 0), 0));
  const ndc = useRef(new Vector2());
  const hit = useRef(new Vector3());
  const lastCursorPos = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const lastEmit = useRef(0);

  // Track the ground-plane cursor position for the status bar. Attached via
  // useEffect (with cleanup) rather than in the render body, throttled to ~30Hz,
  // and only emitting when the position actually changed. The previous version
  // re-attached a stale-closure listener in render and never removed it.
  useEffect(() => {
    if (!enabled) return;
    const dom = gl.domElement;

    const handleMouseMove = (event: MouseEvent) => {
      const now = performance.now();
      if (now - lastEmit.current < 33) return; // ~30Hz cap on the React update

      const rect = dom.getBoundingClientRect();
      ndc.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.current.setFromCamera(ndc.current, camera);

      if (!raycaster.current.ray.intersectPlane(groundPlane.current, hit.current)) return;

      const x = Math.round(hit.current.x * 100) / 100;
      const y = Math.round(hit.current.y * 100) / 100;
      const z = Math.round(hit.current.z * 100) / 100;

      // Only update if position changed significantly
      if (
        Math.abs(x - lastCursorPos.current.x) > 0.01 ||
        Math.abs(z - lastCursorPos.current.z) > 0.01
      ) {
        lastCursorPos.current = { x, y, z };
        lastEmit.current = now;
        onCursorPositionChange({ x, y, z });
      }
    };

    dom.addEventListener('mousemove', handleMouseMove);
    return () => dom.removeEventListener('mousemove', handleMouseMove);
  }, [enabled, camera, gl, onCursorPositionChange]);

  return null; // This is a logic-only component
}

export default CanvasInteractionHandler;
