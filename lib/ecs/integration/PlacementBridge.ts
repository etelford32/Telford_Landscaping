/**
 * Placement Bridge
 * Unified grid placement system that integrates:
 * - DragController for object dragging
 * - GridSnap for consistent snapping
 * - ECS TransformComponent for state management
 */

import { Vector2, Vector3, Camera } from 'three';
import { World } from '../core/World';
import { TransformComponent } from '../components/TransformComponent';
import { DragController, DraggableObject, DragSettings } from '@/lib/editor/DragController';
import { GridSnap, GridConfig } from '@/lib/grid/GridSystem';

/**
 * ECS-aware Drag Controller
 * Extends DragController to sync with ECS TransformComponent
 */
export class ECSPlacementController extends DragController {
  private world: World;
  private gridSnap: GridSnap;
  private entityIdMap: Map<string, string> = new Map(); // draggableId -> entityId

  constructor(
    world: World,
    gridConfig: GridConfig,
    dragSettings?: Partial<DragSettings>
  ) {
    super(dragSettings);
    this.world = world;
    this.gridSnap = new GridSnap(gridConfig);
  }

  /**
   * Register entity as draggable
   */
  public registerEntity(
    draggable: DraggableObject,
    entityId: string
  ): void {
    super.register(draggable);
    this.entityIdMap.set(draggable.id, entityId);
  }

  /**
   * Unregister entity
   */
  public override unregister(id: string): void {
    this.entityIdMap.delete(id);
    super.unregister(id);
  }

  /**
   * Update drag with grid snapping
   */
  public override updateDrag(mousePosition: Vector2, camera: Camera): Vector3 | null {
    const position = super.updateDrag(mousePosition, camera);
    if (!position) return null;

    // Get dragged entity ID
    const draggedId = this.getDraggedId();
    if (!draggedId) return null;

    const entityId = this.entityIdMap.get(draggedId);
    if (!entityId) return null;

    // Apply grid snapping using unified GridSnap
    const snapped = this.gridSnap.snap2D(position.x, position.z);

    // Check if within bounds
    if (!this.gridSnap.isWithinBounds(snapped.x, snapped.z)) {
      // Clamp to bounds
      const clamped = this.gridSnap.clampToBounds(snapped.x, snapped.z);
      position.x = clamped.x;
      position.z = clamped.z;
    } else {
      position.x = snapped.x;
      position.z = snapped.z;
    }

    // Update ECS Transform
    this.syncPositionToECS(entityId, position);

    return position;
  }

  /**
   * End drag and sync to ECS
   */
  public override endDrag(): void {
    const draggedId = this.getDraggedId();

    if (draggedId) {
      const entityId = this.entityIdMap.get(draggedId);
      if (entityId) {
        // Get final position from draggable
        const draggables = (this as any).draggables as Map<string, DraggableObject>;
        const draggable = draggables.get(draggedId);
        if (draggable) {
          this.syncPositionToECS(entityId, draggable.position);
        }
      }
    }

    super.endDrag();
  }

  /**
   * Sync position to ECS TransformComponent
   */
  private syncPositionToECS(entityId: string, position: Vector3): void {
    const transform = this.world.getComponent<TransformComponent>(entityId, 'Transform');
    if (transform) {
      const updated = {
        ...transform,
        position: {
          x: position.x,
          y: position.y,
          z: position.z
        }
      };
      this.world.setComponent(entityId, updated);
    }
  }

  /**
   * Place new entity at position
   */
  public placeEntity(
    entityId: string,
    position: Vector3,
    snapToGrid: boolean = true
  ): Vector3 {
    let finalPosition = position.clone();

    // Apply grid snapping if enabled
    if (snapToGrid) {
      const snapped = this.gridSnap.snap2D(finalPosition.x, finalPosition.z);
      const clamped = this.gridSnap.clampToBounds(snapped.x, snapped.z);
      finalPosition.x = clamped.x;
      finalPosition.z = clamped.z;
    }

    // Update ECS
    this.syncPositionToECS(entityId, finalPosition);

    return finalPosition;
  }

  /**
   * Get entity ID for draggable
   */
  public getEntityId(draggableId: string): string | undefined {
    return this.entityIdMap.get(draggableId);
  }

  /**
   * Update grid configuration
   */
  public updateGridConfig(config: Partial<GridConfig>): void {
    this.gridSnap.updateConfig(config);
  }

  /**
   * Get grid snap instance
   */
  public getGridSnap(): GridSnap {
    return this.gridSnap;
  }
}

/**
 * Placement utilities for ECS
 */
export class ECSPlacementUtils {
  /**
   * Calculate valid placement position from screen coordinates
   */
  static calculatePlacementPosition(
    gridSnap: GridSnap,
    screenX: number,
    screenY: number,
    canvasWidth: number,
    canvasHeight: number
  ): { x: number; z: number } {
    return gridSnap.screenToGrid(screenX, screenY, canvasWidth, canvasHeight);
  }

  /**
   * Check if position is valid for placement
   */
  static isValidPlacement(
    gridSnap: GridSnap,
    x: number,
    z: number
  ): boolean {
    return gridSnap.isWithinBounds(x, z);
  }

  /**
   * Get nearest grid position
   */
  static getNearestGridPosition(
    gridSnap: GridSnap,
    x: number,
    z: number
  ): { x: number; z: number } {
    return gridSnap.snap2D(x, z);
  }

  /**
   * Place entity at grid position
   */
  static placeEntityAtGridPosition(
    world: World,
    entityId: string,
    gridX: number,
    gridZ: number,
    y: number = 0
  ): boolean {
    const transform = world.getComponent<TransformComponent>(entityId, 'Transform');
    if (!transform) return false;

    const updated = {
      ...transform,
      position: { x: gridX, y, z: gridZ }
    };
    world.setComponent(entityId, updated);

    return true;
  }

  /**
   * Move entity by grid cells
   */
  static moveEntityByGridCells(
    world: World,
    gridSnap: GridSnap,
    entityId: string,
    cellsX: number,
    cellsZ: number
  ): boolean {
    const transform = world.getComponent<TransformComponent>(entityId, 'Transform');
    if (!transform) return false;

    const config = gridSnap.getConfig();
    const deltaX = cellsX * config.cellSize;
    const deltaZ = cellsZ * config.cellSize;

    const newX = transform.position.x + deltaX;
    const newZ = transform.position.z + deltaZ;

    // Check bounds
    if (!gridSnap.isWithinBounds(newX, newZ)) {
      return false;
    }

    const updated = {
      ...transform,
      position: {
        x: newX,
        y: transform.position.y,
        z: newZ
      }
    };
    world.setComponent(entityId, updated);

    return true;
  }

  /**
   * Get grid cell for entity
   */
  static getEntityGridCell(
    world: World,
    gridSnap: GridSnap,
    entityId: string
  ): { cellX: number; cellZ: number } | null {
    const transform = world.getComponent<TransformComponent>(entityId, 'Transform');
    if (!transform) return null;

    return gridSnap.getGridCell(transform.position.x, transform.position.z);
  }

  /**
   * Snap entity to nearest grid position
   */
  static snapEntityToGrid(
    world: World,
    gridSnap: GridSnap,
    entityId: string
  ): boolean {
    const transform = world.getComponent<TransformComponent>(entityId, 'Transform');
    if (!transform) return false;

    const snapped = gridSnap.snap2D(transform.position.x, transform.position.z);

    const updated = {
      ...transform,
      position: {
        x: snapped.x,
        y: transform.position.y,
        z: snapped.z
      }
    };
    world.setComponent(entityId, updated);

    return true;
  }

  /**
   * Batch snap all entities to grid
   */
  static snapAllEntitiesToGrid(
    world: World,
    gridSnap: GridSnap
  ): number {
    const entities = world.getAllEntities();
    let count = 0;

    for (const entity of entities) {
      if (this.snapEntityToGrid(world, gridSnap, entity.id)) {
        count++;
      }
    }

    return count;
  }
}

/**
 * Create placement controller for design app
 */
export function createPlacementController(
  world: World,
  gridConfig: GridConfig
): ECSPlacementController {
  return new ECSPlacementController(world, gridConfig, {
    snapToGrid: true,
    gridSize: gridConfig.cellSize,
    dragPlaneY: 0,
    enabled: true
  });
}
