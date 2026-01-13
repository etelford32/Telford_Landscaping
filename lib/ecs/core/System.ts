/**
 * System - Pure logic that operates on components
 *
 * Systems are STATELESS. They read component data, perform logic,
 * and return new component data. No side effects.
 *
 * All systems must be deterministic: same inputs = same outputs
 */

import { Entity } from './Entity';
import { Component, ComponentType } from './Component';
import { World } from './World';

/**
 * Base System interface
 */
export interface System {
  /**
   * Name for debugging and registration
   */
  readonly name: string;

  /**
   * Component types this system requires
   */
  readonly requiredComponents: ComponentType[];

  /**
   * Optional component types (system works with or without these)
   */
  readonly optionalComponents?: ComponentType[];

  /**
   * Update function - called every frame
   * @param world - The ECS world
   * @param deltaTime - Time since last frame (in seconds)
   * @returns Array of component updates to apply
   */
  update(world: World, deltaTime: number): ComponentUpdate[];
}

/**
 * Component update instruction
 * Tells the World to update a specific component on an entity
 */
export interface ComponentUpdate {
  entityId: string;
  componentType: ComponentType;
  componentData: Component;
}

/**
 * Abstract base class for systems
 * Provides helper methods for querying entities
 */
export abstract class BaseSystem implements System {
  abstract readonly name: string;
  abstract readonly requiredComponents: ComponentType[];
  readonly optionalComponents?: ComponentType[];

  /**
   * Update implementation - must be deterministic
   */
  abstract update(world: World, deltaTime: number): ComponentUpdate[];

  /**
   * Helper: Get all entities that have the required components
   */
  protected queryEntities(world: World): Entity[] {
    return world.queryEntities(this.requiredComponents);
  }

  /**
   * Helper: Create a component update
   */
  protected createUpdate(
    entityId: string,
    componentType: ComponentType,
    componentData: Component
  ): ComponentUpdate {
    return { entityId, componentType, componentData };
  }
}

/**
 * System execution order priority
 * Lower numbers run first
 */
export enum SystemPriority {
  INPUT = 0,
  LOGIC = 100,
  PHYSICS = 200,
  ANIMATION = 300,
  RENDER = 400,
  UI = 500
}
