/**
 * useArrowKeyCamera - Hook for arrow key camera navigation
 * Provides smooth camera movement using arrow keys
 */

import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';

export interface ArrowKeyCameraConfig {
  enabled: boolean;
  speed: number;
  smoothing?: number;
  onMove?: (direction: { x: number; y: number; z: number }) => void;
}

export interface CameraMovement {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export function useArrowKeyCamera(config: ArrowKeyCameraConfig) {
  const movementRef = useRef<CameraMovement>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  const velocityRef = useRef(new Vector3(0, 0, 0));
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!config.enabled) {
      // Stop movement when disabled
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movementRef.current.forward = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movementRef.current.backward = true;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movementRef.current.left = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movementRef.current.right = true;
          break;
        case 'q':
        case 'Q':
          e.preventDefault();
          movementRef.current.up = true;
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          movementRef.current.down = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movementRef.current.forward = false;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movementRef.current.backward = false;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movementRef.current.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movementRef.current.right = false;
          break;
        case 'q':
        case 'Q':
          movementRef.current.up = false;
          break;
        case 'e':
        case 'E':
          movementRef.current.down = false;
          break;
      }
    };

    const updateMovement = () => {
      const movement = movementRef.current;
      const speed = config.speed;
      const smoothing = config.smoothing || 0.1;

      // Calculate target velocity
      const targetVelocity = new Vector3(
        (movement.right ? 1 : 0) - (movement.left ? 1 : 0),
        (movement.up ? 1 : 0) - (movement.down ? 1 : 0),
        (movement.backward ? 1 : 0) - (movement.forward ? 1 : 0)
      );

      // Normalize diagonal movement
      if (targetVelocity.length() > 0) {
        targetVelocity.normalize().multiplyScalar(speed);
      }

      // Smooth interpolation
      velocityRef.current.lerp(targetVelocity, smoothing);

      // Apply movement if velocity is significant
      if (velocityRef.current.length() > 0.001 && config.onMove) {
        config.onMove({
          x: velocityRef.current.x,
          y: velocityRef.current.y,
          z: velocityRef.current.z,
        });
      }

      animationFrameRef.current = requestAnimationFrame(updateMovement);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    animationFrameRef.current = requestAnimationFrame(updateMovement);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [config.enabled, config.speed, config.smoothing, config.onMove]);

  return {
    isMoving:
      movementRef.current.forward ||
      movementRef.current.backward ||
      movementRef.current.left ||
      movementRef.current.right ||
      movementRef.current.up ||
      movementRef.current.down,
  };
}
