/**
 * ECS (Entity Component System) Library
 *
 * A lightweight, deterministic, and fully serializable ECS architecture
 * for the landscape design tool.
 *
 * @example
 * ```typescript
 * import { World, TransformSystem, RenderSystem, createPlant } from '@/lib/ecs';
 *
 * const world = new World();
 * world.registerSystem(new TransformSystem());
 * world.registerSystem(new RenderSystem(scene));
 *
 * const plantId = createPlant(world, 'japanese-maple', { x: 0, y: 0, z: 0 });
 * world.update(deltaTime);
 * ```
 */

// Core
export * from './core/Entity';
export * from './core/Component';
export * from './core/System';
export * from './core/World';

// Components
export * from './components';

// Systems
export * from './systems';

// Assets
export * from './assets';

// React Hooks
export * from './hooks';

// Integration Utilities
export * from './integration';

// Examples (for reference)
export * from './examples/BasicIntegration';
