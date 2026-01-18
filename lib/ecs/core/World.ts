/**
 * World - Entity Component System registry
 *
 * The World manages all entities and their components.
 * It provides query methods for systems to find relevant entities.
 *
 * Design principles:
 * - Immutable operations (returns new data, doesn't mutate)
 * - Deterministic behavior
 * - Serializable state
 */

import { Entity, EntityType, createEntity } from './Entity';
import { Component, ComponentType, ComponentMap, cloneComponent } from './Component';
import { System, ComponentUpdate } from './System';

/**
 * World state - complete ECS state
 */
export interface WorldState {
  entities: Map<string, Entity>;
  components: Map<string, ComponentMap>; // entityId -> ComponentMap
  systems: System[];
}

/**
 * World - the main ECS container
 */
export class World {
  private state: WorldState;

  constructor(initialState?: Partial<WorldState>) {
    this.state = {
      entities: initialState?.entities || new Map(),
      components: initialState?.components || new Map(),
      systems: initialState?.systems || []
    };
  }

  // ==========================================
  // Entity Management
  // ==========================================

  /**
   * Create a new entity
   */
  createEntity(type: EntityType, id?: string): Entity {
    const entity = createEntity(type, id);
    this.state.entities.set(entity.id, entity);
    this.state.components.set(entity.id, new Map());
    return entity;
  }

  /**
   * Remove an entity and all its components
   */
  removeEntity(entityId: string): void {
    this.state.entities.delete(entityId);
    this.state.components.delete(entityId);
  }

  /**
   * Get entity by ID
   */
  getEntity(entityId: string): Entity | undefined {
    return this.state.entities.get(entityId);
  }

  /**
   * Get all entities
   */
  getAllEntities(): Entity[] {
    return Array.from(this.state.entities.values());
  }

  /**
   * Get entities by type
   */
  getEntitiesByType(type: EntityType): Entity[] {
    return Array.from(this.state.entities.values()).filter(e => e.type === type);
  }

  // ==========================================
  // Component Management
  // ==========================================

  /**
   * Add or update a component on an entity
   */
  setComponent<T extends Component>(entityId: string, component: T): void {
    const componentMap = this.state.components.get(entityId);
    if (!componentMap) {
      throw new Error(`Entity ${entityId} does not exist`);
    }

    // Store a deep clone to ensure immutability
    componentMap.set(component.type, cloneComponent(component));
  }

  /**
   * Get a component from an entity
   */
  getComponent<T extends Component>(entityId: string, componentType: ComponentType): T | undefined {
    const componentMap = this.state.components.get(entityId);
    if (!componentMap) return undefined;

    const component = componentMap.get(componentType);
    // Return a clone to prevent external mutations
    return component ? cloneComponent(component) as T : undefined;
  }

  /**
   * Check if entity has a specific component
   */
  hasComponent(entityId: string, componentType: ComponentType): boolean {
    const componentMap = this.state.components.get(entityId);
    return componentMap ? componentMap.has(componentType) : false;
  }

  /**
   * Check if entity has all of the specified components
   */
  hasAllComponents(entityId: string, componentTypes: ComponentType[]): boolean {
    return componentTypes.every(type => this.hasComponent(entityId, type));
  }

  /**
   * Remove a component from an entity
   */
  removeComponent(entityId: string, componentType: ComponentType): void {
    const componentMap = this.state.components.get(entityId);
    if (componentMap) {
      componentMap.delete(componentType);
    }
  }

  /**
   * Get all components for an entity
   */
  getComponents(entityId: string): Component[] {
    const componentMap = this.state.components.get(entityId);
    if (!componentMap) return [];

    return Array.from(componentMap.values()).map(c => cloneComponent(c));
  }

  // ==========================================
  // Query System
  // ==========================================

  /**
   * Query entities that have ALL of the specified components
   * This is the primary way systems find relevant entities
   */
  queryEntities(requiredComponents: ComponentType[]): Entity[] {
    const entities: Entity[] = [];

    for (const [entityId, entity] of this.state.entities) {
      if (this.hasAllComponents(entityId, requiredComponents)) {
        entities.push(entity);
      }
    }

    return entities;
  }

  /**
   * Query entities with component data
   * Returns entities along with their requested components
   */
  queryWithComponents<T extends Component>(
    requiredComponents: ComponentType[]
  ): Array<{ entity: Entity; components: Map<ComponentType, T> }> {
    const results: Array<{ entity: Entity; components: Map<ComponentType, T> }> = [];

    for (const entity of this.queryEntities(requiredComponents)) {
      const components = new Map<ComponentType, T>();

      for (const componentType of requiredComponents) {
        const component = this.getComponent<T>(entity.id, componentType);
        if (component) {
          components.set(componentType, component);
        }
      }

      results.push({ entity, components });
    }

    return results;
  }

  // ==========================================
  // System Management
  // ==========================================

  /**
   * Register a system
   */
  registerSystem(system: System): void {
    // Don't register duplicates
    if (!this.state.systems.find(s => s.name === system.name)) {
      this.state.systems.push(system);
    }
  }

  /**
   * Unregister a system
   */
  unregisterSystem(systemName: string): void {
    this.state.systems = this.state.systems.filter(s => s.name !== systemName);
  }

  /**
   * Get all registered systems
   */
  getSystems(): System[] {
    return [...this.state.systems];
  }

  // ==========================================
  // Update Loop
  // ==========================================

  /**
   * Update all systems
   * This is called once per frame
   */
  update(deltaTime: number): void {
    // Collect all updates from all systems
    const allUpdates: ComponentUpdate[] = [];

    for (const system of this.state.systems) {
      const updates = system.update(this, deltaTime);
      allUpdates.push(...updates);
    }

    // Apply all updates
    this.applyUpdates(allUpdates);
  }

  /**
   * Apply component updates
   */
  private applyUpdates(updates: ComponentUpdate[]): void {
    for (const update of updates) {
      this.setComponent(update.entityId, update.componentData);
    }
  }

  // ==========================================
  // Serialization
  // ==========================================

  /**
   * Serialize entire world state to JSON
   * Used for save/load, undo/redo, and network sync
   */
  serialize(): string {
    const serializable = {
      entities: Array.from(this.state.entities.entries()),
      components: Array.from(this.state.components.entries()).map(([entityId, componentMap]) => [
        entityId,
        Array.from(componentMap.entries())
      ])
    };

    return JSON.stringify(serializable);
  }

  /**
   * Deserialize world state from JSON
   */
  static deserialize(json: string): World {
    const data = JSON.parse(json);

    const entities = new Map<string, Entity>(data.entities);
    const components = new Map<string, ComponentMap>(
      data.components.map(([entityId, components]: [string, any[]]) => [
        entityId,
        new Map(components)
      ])
    );

    return new World({ entities, components, systems: [] });
  }

  /**
   * Create a snapshot of current state (for undo/redo)
   */
  snapshot(): WorldState {
    return {
      entities: new Map(this.state.entities),
      components: new Map(
        Array.from(this.state.components.entries()).map(([id, map]) => [
          id,
          new Map(map)
        ])
      ),
      systems: [...this.state.systems]
    };
  }

  /**
   * Restore from a snapshot
   */
  restore(snapshot: WorldState): void {
    this.state = {
      entities: new Map(snapshot.entities),
      components: new Map(
        Array.from(snapshot.components.entries()).map(([id, map]) => [
          id,
          new Map(map)
        ])
      ),
      systems: [...snapshot.systems]
    };
  }

  // ==========================================
  // Debugging
  // ==========================================

  /**
   * Get statistics about the world
   */
  getStats() {
    return {
      entityCount: this.state.entities.size,
      componentCount: Array.from(this.state.components.values()).reduce(
        (sum, map) => sum + map.size,
        0
      ),
      systemCount: this.state.systems.length,
      entitiesByType: Array.from(this.state.entities.values()).reduce((acc, entity) => {
        acc[entity.type] = (acc[entity.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Clear all entities and components (keep systems)
   */
  clear(): void {
    this.state.entities.clear();
    this.state.components.clear();
  }
}
