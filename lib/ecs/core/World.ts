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
import { Component, ComponentType, ComponentMap } from './Component';
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

  // Change notification (React subscribes via hooks; bumped only on real change)
  private changeVersion = 0;
  private listeners = new Set<() => void>();

  // Query cache keyed by sorted component signature. Invalidated only on
  // STRUCTURAL changes (entity add/remove, component add/remove) — value
  // updates don't change query membership, so per-frame system queries hit it.
  private queryCache = new Map<string, Entity[]>();

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
    this.invalidateQueryCache();
    this.markChanged();
    return entity;
  }

  /**
   * Remove an entity and all its components
   */
  removeEntity(entityId: string): void {
    if (!this.state.entities.delete(entityId)) return;
    this.state.components.delete(entityId);
    this.invalidateQueryCache();
    this.markChanged();
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
    this.setComponentRaw(entityId, component);
    this.markChanged();
  }

  /**
   * Internal component write: no change notification (the update loop batches
   * many writes then notifies once). Components are treated as immutable by
   * convention — systems emit fresh component objects rather than mutating —
   * so we store the reference directly instead of deep-cloning every write.
   */
  private setComponentRaw<T extends Component>(entityId: string, component: T): void {
    const componentMap = this.state.components.get(entityId);
    if (!componentMap) {
      throw new Error(`Entity ${entityId} does not exist`);
    }

    // Adding a component TYPE that wasn't present changes query membership.
    if (!componentMap.has(component.type)) {
      this.invalidateQueryCache();
    }
    componentMap.set(component.type, component);
  }

  /**
   * Get a component from an entity. Returns the stored reference (no clone);
   * callers must treat it as read-only.
   */
  getComponent<T extends Component>(entityId: string, componentType: ComponentType): T | undefined {
    const componentMap = this.state.components.get(entityId);
    if (!componentMap) return undefined;

    return componentMap.get(componentType) as T | undefined;
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
    if (componentMap && componentMap.delete(componentType)) {
      this.invalidateQueryCache();
      this.markChanged();
    }
  }

  /**
   * Get all components for an entity
   */
  getComponents(entityId: string): Component[] {
    const componentMap = this.state.components.get(entityId);
    if (!componentMap) return [];

    return Array.from(componentMap.values());
  }

  // ==========================================
  // Query System
  // ==========================================

  /**
   * Query entities that have ALL of the specified components
   * This is the primary way systems find relevant entities
   */
  queryEntities(requiredComponents: ComponentType[]): Entity[] {
    const key = this.queryKey(requiredComponents);
    const cached = this.queryCache.get(key);
    if (cached) return cached;

    const entities: Entity[] = [];
    for (const [entityId, entity] of this.state.entities) {
      if (this.hasAllComponents(entityId, requiredComponents)) {
        entities.push(entity);
      }
    }

    this.queryCache.set(key, entities);
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
  // Change Notification (React subscription)
  // ==========================================

  /**
   * Subscribe to world changes. Returns an unsubscribe function. Used by the
   * React hooks (useSyncExternalStore) so consumers re-render only when
   * something actually changes — not every frame.
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Monotonic change counter; the snapshot value for useSyncExternalStore.
   */
  getChangeVersion(): number {
    return this.changeVersion;
  }

  /**
   * Bump the change version and notify subscribers.
   */
  markChanged(): void {
    this.changeVersion++;
    this.listeners.forEach(listener => listener());
  }

  private queryKey(requiredComponents: ComponentType[]): string {
    return requiredComponents.slice().sort().join(',');
  }

  private invalidateQueryCache(): void {
    if (this.queryCache.size > 0) {
      this.queryCache.clear();
    }
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
      if (updates.length > 0) {
        allUpdates.push(...updates);
      }
    }

    // Apply all updates (notifies once, only if anything changed)
    this.applyUpdates(allUpdates);
  }

  /**
   * Apply component updates. Writes silently, then notifies once — so a frame
   * with no updates triggers zero React re-renders.
   */
  private applyUpdates(updates: ComponentUpdate[]): void {
    if (updates.length === 0) return;

    for (const update of updates) {
      // Skip updates for entities removed earlier this frame.
      if (this.state.components.has(update.entityId)) {
        this.setComponentRaw(update.entityId, update.componentData);
      }
    }

    this.markChanged();
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
    this.invalidateQueryCache();
    this.markChanged();
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
    this.invalidateQueryCache();
    this.markChanged();
  }
}
