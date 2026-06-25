/**
 * ECS-React Bridge Hooks
 *
 * Provides React hooks for integrating ECS World with React components.
 * Consumers re-render only when the world actually changes: the World exposes
 * a subscribe()/getChangeVersion() store, and these hooks read it via
 * useSyncExternalStore. A static scene triggers zero re-renders.
 */

'use client';

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useSyncExternalStore,
  createContext,
  useContext,
} from 'react';
import { World, WorldState } from './core/World';
import { Entity, EntityType } from './core/Entity';
import { Component, ComponentType } from './core/Component';
import { System } from './core/System';

/**
 * ECS World Context — just the world; change notification flows through the
 * world's subscription store rather than a context value that changes per frame.
 */
interface ECSContextValue {
  world: World;
}

const ECSContext = createContext<ECSContextValue | null>(null);

/**
 * Provider component for ECS World
 * Wrap your app/component tree with this to provide ECS access
 */
interface ECSProviderProps {
  children: React.ReactNode;
  world?: World;
  systems?: System[];
}

export function ECSProvider({ children, world: providedWorld, systems = [] }: ECSProviderProps) {
  const worldRef = useRef<World>(providedWorld || new World());

  // Register/unregister systems
  useEffect(() => {
    const world = worldRef.current;
    systems.forEach(system => world.registerSystem(system));

    return () => {
      systems.forEach(system => world.unregisterSystem(system.name));
    };
  }, [systems]);

  // Stable context value — the world reference never changes.
  const contextValue = useMemo<ECSContextValue>(() => ({ world: worldRef.current }), []);

  return (
    <ECSContext.Provider value={contextValue}>
      {children}
    </ECSContext.Provider>
  );
}

/**
 * Internal: read the world from context (throws if no provider).
 */
function useWorld(): World {
  const context = useContext(ECSContext);
  if (!context) {
    throw new Error('ECS hooks must be used within an ECSProvider');
  }
  return context.world;
}

/**
 * Internal: subscribe to the world's change store and return its version.
 * Components using this re-render only when the world notifies a change.
 */
function useWorldVersion(world: World): number {
  const subscribe = useCallback((onChange: () => void) => world.subscribe(onChange), [world]);
  const getSnapshot = useCallback(() => world.getChangeVersion(), [world]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Hook to get the ECS World instance plus a manual change trigger.
 */
export function useECSWorld() {
  const world = useWorld();
  const forceUpdate = useCallback(() => world.markChanged(), [world]);
  return { world, forceUpdate };
}

/**
 * Hook to query entities with specific components.
 * Re-renders only when the world changes; the world caches query results so
 * repeated calls with an unchanged scene are O(1).
 */
export function useECSQuery(requiredComponents: ComponentType[]) {
  const world = useWorld();
  const version = useWorldVersion(world);

  return useMemo(() => {
    return world.queryEntities(requiredComponents);
    // version participates so the query re-runs after a change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world, requiredComponents, version]);
}

/**
 * Hook to query entities with their component data
 * More efficient when you need both entity and component data
 */
export function useECSQueryWithComponents<T extends Component>(
  requiredComponents: ComponentType[]
) {
  const world = useWorld();
  const version = useWorldVersion(world);

  return useMemo(() => {
    return world.queryWithComponents<T>(requiredComponents);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world, requiredComponents, version]);
}

/**
 * Hook to get a specific entity by ID
 * Re-renders when the entity changes
 */
export function useEntity(entityId: string | null) {
  const world = useWorld();
  const version = useWorldVersion(world);

  return useMemo(() => {
    return entityId ? world.getEntity(entityId) : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world, entityId, version]);
}

/**
 * Hook to get a specific component from an entity
 * Re-renders when the component changes
 */
export function useComponent<T extends Component>(
  entityId: string | null,
  componentType: ComponentType
): T | undefined {
  const world = useWorld();
  const version = useWorldVersion(world);

  return useMemo(() => {
    return entityId ? world.getComponent<T>(entityId, componentType) : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world, entityId, componentType, version]);
}

/**
 * Hook to get all entities of a specific type
 */
export function useEntitiesByType(type: EntityType) {
  const world = useWorld();
  const version = useWorldVersion(world);

  return useMemo(() => {
    return world.getEntitiesByType(type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world, type, version]);
}

/**
 * Hook to run the ECS update loop.
 *
 * Ticks systems at (most) the requested FPS using the rAF timestamp. It does
 * NOT force a React re-render every frame — world.update() notifies subscribers
 * only when systems actually produce updates, so a still scene is free.
 */
export function useECSUpdateLoop(fps: number = 60, enabled: boolean = true) {
  const world = useWorld();

  useEffect(() => {
    if (!enabled) return;

    const interval = 1000 / fps;
    let animationFrameId = 0;
    let lastTime = performance.now();

    const update = (now: number) => {
      animationFrameId = requestAnimationFrame(update);

      const elapsed = now - lastTime;
      if (elapsed < interval) return; // throttle to the target FPS

      lastTime = now - (elapsed % interval);
      world.update(elapsed / 1000); // seconds; notifies only if something changed
    };

    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [world, fps, enabled]);
}

/**
 * Hook for ECS operations. The world's mutation methods notify subscribers on
 * their own, so these don't need to force updates individually.
 */
export function useECSOperations() {
  const world = useWorld();

  const operations = useMemo(() => ({
    createEntity: (type: EntityType, id?: string) => world.createEntity(type, id),

    removeEntity: (entityId: string) => world.removeEntity(entityId),

    setComponent: <T extends Component>(entityId: string, component: T) =>
      world.setComponent(entityId, component),

    removeComponent: (entityId: string, componentType: ComponentType) =>
      world.removeComponent(entityId, componentType),

    getComponent: <T extends Component>(entityId: string, componentType: ComponentType) =>
      world.getComponent<T>(entityId, componentType),

    hasComponent: (entityId: string, componentType: ComponentType) =>
      world.hasComponent(entityId, componentType),

    // Run several mutations, then make sure at least one notification fires.
    batch: (run: () => void) => {
      run();
      world.markChanged();
    },
  }), [world]);

  return operations;
}

/**
 * Hook to snapshot ECS state for undo/redo
 */
export function useECSSnapshot() {
  const world = useWorld();
  const [snapshots, setSnapshots] = useState<WorldState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const takeSnapshot = useCallback(() => {
    const snapshot = world.snapshot();
    setSnapshots(prev => [...prev.slice(0, currentIndex + 1), snapshot]);
    setCurrentIndex(prev => prev + 1);
  }, [world, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const snapshot = snapshots[currentIndex - 1];
      world.restore(snapshot); // notifies subscribers
      setCurrentIndex(prev => prev - 1);
    }
  }, [world, snapshots, currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < snapshots.length - 1) {
      const snapshot = snapshots[currentIndex + 1];
      world.restore(snapshot); // notifies subscribers
      setCurrentIndex(prev => prev + 1);
    }
  }, [world, snapshots, currentIndex]);

  return {
    takeSnapshot,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < snapshots.length - 1,
    snapshotCount: snapshots.length
  };
}

/**
 * Hook to get ECS statistics (refreshes on world changes)
 */
export function useECSStats() {
  const world = useWorld();
  const version = useWorldVersion(world);

  const stats = useMemo(() => {
    return world.getStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world, version]);

  return stats;
}
