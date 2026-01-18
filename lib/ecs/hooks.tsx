/**
 * ECS-React Bridge Hooks
 *
 * Provides React hooks for integrating ECS World with React components.
 * Enables reactive updates when ECS state changes.
 */

'use client';

import { useRef, useEffect, useState, useCallback, useMemo, createContext, useContext } from 'react';
import { World, WorldState } from './core/World';
import { Entity, EntityType } from './core/Entity';
import { Component, ComponentType } from './core/Component';
import { System } from './core/System';

/**
 * ECS World Context
 */
interface ECSContextValue {
  world: World;
  version: number; // Incremented on each update to trigger re-renders
  forceUpdate: () => void;
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
  const [version, setVersion] = useState(0);

  // Initialize systems
  useEffect(() => {
    systems.forEach(system => {
      worldRef.current.registerSystem(system);
    });

    return () => {
      systems.forEach(system => {
        worldRef.current.unregisterSystem(system.name);
      });
    };
  }, [systems]);

  const forceUpdate = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  const contextValue = useMemo(() => ({
    world: worldRef.current,
    version,
    forceUpdate
  }), [version, forceUpdate]);

  return (
    <ECSContext.Provider value={contextValue}>
      {children}
    </ECSContext.Provider>
  );
}

/**
 * Hook to get the ECS World instance
 * Returns the world and a function to trigger updates
 */
export function useECSWorld() {
  const context = useContext(ECSContext);

  if (!context) {
    throw new Error('useECSWorld must be used within an ECSProvider');
  }

  return {
    world: context.world,
    forceUpdate: context.forceUpdate
  };
}

/**
 * Hook to query entities with specific components
 * Automatically re-renders when the query results change
 */
export function useECSQuery(requiredComponents: ComponentType[]) {
  const { world, version } = useContext(ECSContext) || {};

  if (!world) {
    throw new Error('useECSQuery must be used within an ECSProvider');
  }

  // Query entities - will update when version changes
  const entities = useMemo(() => {
    return world.queryEntities(requiredComponents);
  }, [world, requiredComponents, version]);

  return entities;
}

/**
 * Hook to query entities with their component data
 * More efficient when you need both entity and component data
 */
export function useECSQueryWithComponents<T extends Component>(
  requiredComponents: ComponentType[]
) {
  const { world, version } = useContext(ECSContext) || {};

  if (!world) {
    throw new Error('useECSQueryWithComponents must be used within an ECSProvider');
  }

  const results = useMemo(() => {
    return world.queryWithComponents<T>(requiredComponents);
  }, [world, requiredComponents, version]);

  return results;
}

/**
 * Hook to get a specific entity by ID
 * Re-renders when the entity changes
 */
export function useEntity(entityId: string | null) {
  const { world, version } = useContext(ECSContext) || {};

  if (!world) {
    throw new Error('useEntity must be used within an ECSProvider');
  }

  const entity = useMemo(() => {
    return entityId ? world.getEntity(entityId) : null;
  }, [world, entityId, version]);

  return entity;
}

/**
 * Hook to get a specific component from an entity
 * Re-renders when the component changes
 */
export function useComponent<T extends Component>(
  entityId: string | null,
  componentType: ComponentType
): T | undefined {
  const { world, version } = useContext(ECSContext) || {};

  if (!world) {
    throw new Error('useComponent must be used within an ECSProvider');
  }

  const component = useMemo(() => {
    return entityId ? world.getComponent<T>(entityId, componentType) : undefined;
  }, [world, entityId, componentType, version]);

  return component;
}

/**
 * Hook to get all entities of a specific type
 */
export function useEntitiesByType(type: EntityType) {
  const { world, version } = useContext(ECSContext) || {};

  if (!world) {
    throw new Error('useEntitiesByType must be used within an ECSProvider');
  }

  const entities = useMemo(() => {
    return world.getEntitiesByType(type);
  }, [world, type, version]);

  return entities;
}

/**
 * Hook to run ECS update loop
 * Automatically updates at specified FPS (default 60)
 */
export function useECSUpdateLoop(fps: number = 60, enabled: boolean = true) {
  const { world, forceUpdate } = useECSWorld();
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) return;

    const interval = 1000 / fps;
    let animationFrameId: number;

    const update = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000; // Convert to seconds
      lastTimeRef.current = now;

      // Update ECS world
      world.update(deltaTime);

      // Trigger React re-render
      forceUpdate();

      // Schedule next update
      animationFrameId = requestAnimationFrame(update);
    };

    // Start the loop
    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [world, forceUpdate, fps, enabled]);
}

/**
 * Hook for ECS operations with automatic re-rendering
 * Returns helper functions that automatically trigger updates
 */
export function useECSOperations() {
  const { world, forceUpdate } = useECSWorld();

  const operations = useMemo(() => ({
    createEntity: (type: EntityType, id?: string) => {
      const entity = world.createEntity(type, id);
      forceUpdate();
      return entity;
    },

    removeEntity: (entityId: string) => {
      world.removeEntity(entityId);
      forceUpdate();
    },

    setComponent: <T extends Component>(entityId: string, component: T) => {
      world.setComponent(entityId, component);
      forceUpdate();
    },

    removeComponent: (entityId: string, componentType: ComponentType) => {
      world.removeComponent(entityId, componentType);
      forceUpdate();
    },

    getComponent: <T extends Component>(entityId: string, componentType: ComponentType) => {
      return world.getComponent<T>(entityId, componentType);
    },

    hasComponent: (entityId: string, componentType: ComponentType) => {
      return world.hasComponent(entityId, componentType);
    },

    // Batch operations (only triggers one re-render)
    batch: (operations: () => void) => {
      operations();
      forceUpdate();
    }
  }), [world, forceUpdate]);

  return operations;
}

/**
 * Hook to snapshot ECS state for undo/redo
 */
export function useECSSnapshot() {
  const { world, forceUpdate } = useECSWorld();
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
      world.restore(snapshot);
      setCurrentIndex(prev => prev - 1);
      forceUpdate();
    }
  }, [world, snapshots, currentIndex, forceUpdate]);

  const redo = useCallback(() => {
    if (currentIndex < snapshots.length - 1) {
      const snapshot = snapshots[currentIndex + 1];
      world.restore(snapshot);
      setCurrentIndex(prev => prev + 1);
      forceUpdate();
    }
  }, [world, snapshots, currentIndex, forceUpdate]);

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
 * Hook to get ECS statistics
 */
export function useECSStats() {
  const { world } = useECSWorld();

  const stats = useMemo(() => {
    return world.getStats();
  }, [world]);

  return stats;
}
