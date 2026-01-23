/**
 * useCameraTransition - Smooth camera transitions hook
 * Handles animated camera movement between positions
 */

import { useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { useThree, useFrame } from '@react-three/fiber';

interface CameraTransitionOptions {
  duration?: number; // in seconds
  easing?: (t: number) => number;
}

const defaultEasing = (t: number): number => {
  // Ease in-out cubic
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export function useCameraTransition(
  targetPosition: [number, number, number] | null,
  targetLookAt: [number, number, number] | null,
  options: CameraTransitionOptions = {}
) {
  const { camera } = useThree();
  const { duration = 1.0, easing = defaultEasing } = options;

  const transitionRef = useRef<{
    active: boolean;
    startTime: number;
    startPosition: Vector3;
    endPosition: Vector3;
    startLookAt: Vector3;
    endLookAt: Vector3;
    duration: number;
  } | null>(null);

  // Start transition when target changes
  useEffect(() => {
    if (targetPosition && targetLookAt) {
      const currentLookAt = new Vector3(0, 0, -1);
      currentLookAt.applyQuaternion(camera.quaternion);
      currentLookAt.add(camera.position);

      transitionRef.current = {
        active: true,
        startTime: Date.now(),
        startPosition: camera.position.clone(),
        endPosition: new Vector3(...targetPosition),
        startLookAt: currentLookAt,
        endLookAt: new Vector3(...targetLookAt),
        duration: duration * 1000, // convert to milliseconds
      };
    }
  }, [targetPosition, targetLookAt, camera, duration]);

  // Animate camera on each frame
  useFrame(() => {
    if (!transitionRef.current || !transitionRef.current.active) return;

    const transition = transitionRef.current;
    const elapsed = Date.now() - transition.startTime;
    const progress = Math.min(elapsed / transition.duration, 1);
    const easedProgress = easing(progress);

    // Interpolate position
    camera.position.lerpVectors(
      transition.startPosition,
      transition.endPosition,
      easedProgress
    );

    // Interpolate lookAt
    const currentLookAt = new Vector3().lerpVectors(
      transition.startLookAt,
      transition.endLookAt,
      easedProgress
    );
    camera.lookAt(currentLookAt);

    // End transition
    if (progress >= 1) {
      transitionRef.current.active = false;
      transitionRef.current = null;
    }
  });

  return {
    isTransitioning: transitionRef.current?.active ?? false,
  };
}
