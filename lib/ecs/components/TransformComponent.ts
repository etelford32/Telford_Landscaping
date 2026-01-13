/**
 * Transform Component - Position, rotation, and scale
 *
 * Pure data - no methods. All transformations happen in Systems.
 */

import { Component } from '../core/Component';

export interface Vector3Data {
  x: number;
  y: number;
  z: number;
}

export interface TransformComponent extends Component {
  readonly type: 'Transform';
  position: Vector3Data;
  rotation: Vector3Data; // Euler angles in radians
  scale: Vector3Data;
}

/**
 * Create a new Transform component with default values
 */
export function createTransformComponent(
  position: Partial<Vector3Data> = {},
  rotation: Partial<Vector3Data> = {},
  scale: Partial<Vector3Data> = {}
): TransformComponent {
  return {
    type: 'Transform',
    position: {
      x: position.x ?? 0,
      y: position.y ?? 0,
      z: position.z ?? 0
    },
    rotation: {
      x: rotation.x ?? 0,
      y: rotation.y ?? 0,
      z: rotation.z ?? 0
    },
    scale: {
      x: scale.x ?? 1,
      y: scale.y ?? 1,
      z: scale.z ?? 1
    }
  };
}

/**
 * Update transform (immutable - returns new object)
 */
export function updateTransform(
  transform: TransformComponent,
  updates: {
    position?: Partial<Vector3Data>;
    rotation?: Partial<Vector3Data>;
    scale?: Partial<Vector3Data>;
  }
): TransformComponent {
  return {
    ...transform,
    position: updates.position
      ? { ...transform.position, ...updates.position }
      : transform.position,
    rotation: updates.rotation
      ? { ...transform.rotation, ...updates.rotation }
      : transform.rotation,
    scale: updates.scale
      ? { ...transform.scale, ...updates.scale }
      : transform.scale
  };
}

/**
 * Helper: Convert from legacy position format
 */
export function fromLegacyPosition(pos: { x: number; y: number; z: number }): TransformComponent {
  return createTransformComponent(pos);
}
