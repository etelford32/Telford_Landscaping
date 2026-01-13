/**
 * TransformSystem - Handles position, rotation, and scale operations
 *
 * This system provides utilities for transforming entities in 3D space.
 * It doesn't run automatically - it's called by UI actions or other systems.
 *
 * Pure logic: No state, deterministic outputs
 */

import { BaseSystem, ComponentUpdate, SystemPriority } from '../core/System';
import { World } from '../core/World';
import {
  TransformComponent,
  Vector3Data,
  updateTransform
} from '../components/TransformComponent';

export class TransformSystem extends BaseSystem {
  readonly name = 'TransformSystem';
  readonly requiredComponents = ['Transform'];
  readonly priority = SystemPriority.LOGIC;

  /**
   * Update doesn't run automatically - transforms are updated on-demand
   * This is just here for interface compliance
   */
  update(world: World, deltaTime: number): ComponentUpdate[] {
    // TransformSystem is primarily used for utility functions
    // Actual transforms are applied via direct methods
    return [];
  }

  /**
   * Translate an entity (move in space)
   */
  translate(
    world: World,
    entityId: string,
    delta: Partial<Vector3Data>,
    relative: boolean = true
  ): ComponentUpdate | null {
    const transform = world.getComponent<TransformComponent>(entityId, 'Transform');
    if (!transform) return null;

    const newPosition = relative
      ? {
          x: transform.position.x + (delta.x ?? 0),
          y: transform.position.y + (delta.y ?? 0),
          z: transform.position.z + (delta.z ?? 0)
        }
      : {
          x: delta.x ?? transform.position.x,
          y: delta.y ?? transform.position.y,
          z: delta.z ?? transform.position.z
        };

    const newTransform = updateTransform(transform, { position: newPosition });
    return this.createUpdate(entityId, 'Transform', newTransform);
  }

  /**
   * Rotate an entity (Euler angles in radians)
   */
  rotate(
    world: World,
    entityId: string,
    delta: Partial<Vector3Data>,
    relative: boolean = true
  ): ComponentUpdate | null {
    const transform = world.getComponent<TransformComponent>(entityId, 'Transform');
    if (!transform) return null;

    const newRotation = relative
      ? {
          x: transform.rotation.x + (delta.x ?? 0),
          y: transform.rotation.y + (delta.y ?? 0),
          z: transform.rotation.z + (delta.z ?? 0)
        }
      : {
          x: delta.x ?? transform.rotation.x,
          y: delta.y ?? transform.rotation.y,
          z: delta.z ?? transform.rotation.z
        };

    const newTransform = updateTransform(transform, { rotation: newRotation });
    return this.createUpdate(entityId, 'Transform', newTransform);
  }

  /**
   * Scale an entity
   */
  scale(
    world: World,
    entityId: string,
    delta: Partial<Vector3Data>,
    relative: boolean = true
  ): ComponentUpdate | null {
    const transform = world.getComponent<TransformComponent>(entityId, 'Transform');
    if (!transform) return null;

    const newScale = relative
      ? {
          x: transform.scale.x * (delta.x ?? 1),
          y: transform.scale.y * (delta.y ?? 1),
          z: transform.scale.z * (delta.z ?? 1)
        }
      : {
          x: delta.x ?? transform.scale.x,
          y: delta.y ?? transform.scale.y,
          z: delta.z ?? transform.scale.z
        };

    const newTransform = updateTransform(transform, { scale: newScale });
    return this.createUpdate(entityId, 'Transform', newTransform);
  }

  /**
   * Set absolute position
   */
  setPosition(
    world: World,
    entityId: string,
    position: Vector3Data
  ): ComponentUpdate | null {
    return this.translate(world, entityId, position, false);
  }

  /**
   * Set absolute rotation
   */
  setRotation(
    world: World,
    entityId: string,
    rotation: Vector3Data
  ): ComponentUpdate | null {
    return this.rotate(world, entityId, rotation, false);
  }

  /**
   * Set absolute scale
   */
  setScale(
    world: World,
    entityId: string,
    scale: Vector3Data
  ): ComponentUpdate | null {
    return this.scale(world, entityId, scale, false);
  }

  /**
   * Set uniform scale (same on all axes)
   */
  setUniformScale(
    world: World,
    entityId: string,
    scale: number
  ): ComponentUpdate | null {
    return this.scale(world, entityId, { x: scale, y: scale, z: scale }, false);
  }

  /**
   * Snap position to grid
   */
  snapToGrid(
    world: World,
    entityId: string,
    gridSize: number
  ): ComponentUpdate | null {
    const transform = world.getComponent<TransformComponent>(entityId, 'Transform');
    if (!transform) return null;

    const snappedPosition = {
      x: Math.round(transform.position.x / gridSize) * gridSize,
      y: Math.round(transform.position.y / gridSize) * gridSize,
      z: Math.round(transform.position.z / gridSize) * gridSize
    };

    const newTransform = updateTransform(transform, { position: snappedPosition });
    return this.createUpdate(entityId, 'Transform', newTransform);
  }

  /**
   * Look at a target point (orient towards it)
   */
  lookAt(
    world: World,
    entityId: string,
    target: Vector3Data
  ): ComponentUpdate | null {
    const transform = world.getComponent<TransformComponent>(entityId, 'Transform');
    if (!transform) return null;

    // Calculate direction vector
    const dx = target.x - transform.position.x;
    const dz = target.z - transform.position.z;

    // Calculate Y rotation (heading)
    const angleY = Math.atan2(dx, dz);

    const newTransform = updateTransform(transform, {
      rotation: { ...transform.rotation, y: angleY }
    });

    return this.createUpdate(entityId, 'Transform', newTransform);
  }

  /**
   * Get distance between two entities
   */
  getDistance(world: World, entityId1: string, entityId2: string): number {
    const transform1 = world.getComponent<TransformComponent>(entityId1, 'Transform');
    const transform2 = world.getComponent<TransformComponent>(entityId2, 'Transform');

    if (!transform1 || !transform2) return Infinity;

    const dx = transform2.position.x - transform1.position.x;
    const dy = transform2.position.y - transform1.position.y;
    const dz = transform2.position.z - transform1.position.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Batch translate multiple entities
   */
  translateMultiple(
    world: World,
    entityIds: string[],
    delta: Partial<Vector3Data>
  ): ComponentUpdate[] {
    const updates: ComponentUpdate[] = [];

    for (const entityId of entityIds) {
      const update = this.translate(world, entityId, delta, true);
      if (update) updates.push(update);
    }

    return updates;
  }

  /**
   * Batch rotate multiple entities
   */
  rotateMultiple(
    world: World,
    entityIds: string[],
    delta: Partial<Vector3Data>
  ): ComponentUpdate[] {
    const updates: ComponentUpdate[] = [];

    for (const entityId of entityIds) {
      const update = this.rotate(world, entityId, delta, true);
      if (update) updates.push(update);
    }

    return updates;
  }

  /**
   * Batch scale multiple entities
   */
  scaleMultiple(
    world: World,
    entityIds: string[],
    delta: Partial<Vector3Data>
  ): ComponentUpdate[] {
    const updates: ComponentUpdate[] = [];

    for (const entityId of entityIds) {
      const update = this.scale(world, entityId, delta, true);
      if (update) updates.push(update);
    }

    return updates;
  }

  /**
   * Reset transform to defaults (origin, no rotation, scale = 1)
   */
  reset(world: World, entityId: string): ComponentUpdate | null {
    const transform = world.getComponent<TransformComponent>(entityId, 'Transform');
    if (!transform) return null;

    const resetTransform = updateTransform(transform, {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    });

    return this.createUpdate(entityId, 'Transform', resetTransform);
  }
}
