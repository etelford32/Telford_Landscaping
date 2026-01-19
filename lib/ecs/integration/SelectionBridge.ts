/**
 * Selection Bridge
 * Consolidates SelectionManager with ECS SelectionComponent
 *
 * Provides a unified selection API that:
 * - Uses ECS SelectionComponent as source of truth
 * - Maintains compatibility with existing SelectionManager API
 * - Syncs selection state bidirectionally
 */

import { World } from '../core/World';
import { SelectionComponent, createSelectionComponent } from '../components/SelectionComponent';
import { SelectionManager, Selectable, SelectionEvent } from '@/lib/editor/SelectionManager';
import { Object3D, Camera, Vector2, Raycaster } from 'three';

/**
 * ECS-aware Selection Manager
 * Extends the original SelectionManager to use ECS as backing store
 */
export class ECSSelectionManager extends SelectionManager {
  private world: World;
  private entityIdMap: Map<string, string> = new Map(); // selectableId -> entityId

  constructor(
    world: World,
    options?: {
      multiSelectEnabled?: boolean;
      onSelectionChange?: (event: SelectionEvent) => void;
    }
  ) {
    super(options);
    this.world = world;
  }

  /**
   * Register a selectable with its ECS entity
   */
  public registerEntity(selectable: Selectable, entityId: string): void {
    super.register(selectable);
    this.entityIdMap.set(selectable.id, entityId);

    // Ensure entity has SelectionComponent
    if (!this.world.hasComponent(entityId, 'Selection')) {
      const selection = createSelectionComponent({ selected: false, visible: true });
      this.world.setComponent(entityId, selection);
    }
  }

  /**
   * Unregister entity
   */
  public override unregister(id: string): void {
    const entityId = this.entityIdMap.get(id);
    if (entityId) {
      // Clear selection in ECS
      const selection = this.world.getComponent<SelectionComponent>(entityId, 'Selection');
      if (selection) {
        this.world.setComponent(entityId, { ...selection, selected: false });
      }
      this.entityIdMap.delete(id);
    }
    super.unregister(id);
  }

  /**
   * Select object and sync with ECS
   */
  public override select(id: string, addToSelection: boolean = false): boolean {
    const entityId = this.entityIdMap.get(id);

    // If not multi-selecting, deselect all others first
    if (!addToSelection) {
      this.clearSelectionInECS();
    }

    // Update ECS
    if (entityId) {
      const selection = this.world.getComponent<SelectionComponent>(entityId, 'Selection');
      if (selection) {
        this.world.setComponent(entityId, { ...selection, selected: true });
      }
    }

    // Update manager
    return super.select(id, addToSelection);
  }

  /**
   * Deselect object and sync with ECS
   */
  public override deselect(id: string): boolean {
    const entityId = this.entityIdMap.get(id);

    // Update ECS
    if (entityId) {
      const selection = this.world.getComponent<SelectionComponent>(entityId, 'Selection');
      if (selection) {
        this.world.setComponent(entityId, { ...selection, selected: false });
      }
    }

    // Update manager
    return super.deselect(id);
  }

  /**
   * Clear all selections and sync with ECS
   */
  public override clearSelection(): void {
    this.clearSelectionInECS();
    super.clearSelection();
  }

  /**
   * Clear selection in ECS for all entities
   */
  private clearSelectionInECS(): void {
    for (const entityId of this.entityIdMap.values()) {
      const selection = this.world.getComponent<SelectionComponent>(entityId, 'Selection');
      if (selection && selection.selected) {
        this.world.setComponent(entityId, { ...selection, selected: false });
      }
    }
  }

  /**
   * Sync selection from ECS to manager
   * Call this after ECS updates to keep manager in sync
   */
  public syncFromECS(): void {
    const selectedInECS = new Set<string>();

    // Find all selected entities in ECS
    for (const [selectableId, entityId] of this.entityIdMap.entries()) {
      const selection = this.world.getComponent<SelectionComponent>(entityId, 'Selection');
      if (selection?.selected) {
        selectedInECS.add(selectableId);
      }
    }

    // Update manager to match ECS
    const currentlySelected = new Set(this.getSelectedIds());

    // Deselect items that are not selected in ECS
    for (const id of currentlySelected) {
      if (!selectedInECS.has(id)) {
        super.deselect(id);
      }
    }

    // Select items that are selected in ECS
    for (const id of selectedInECS) {
      if (!currentlySelected.has(id)) {
        super.select(id, true);
      }
    }
  }

  /**
   * Get entity ID for a selectable
   */
  public getEntityId(selectableId: string): string | undefined {
    return this.entityIdMap.get(selectableId);
  }

  /**
   * Get selectable ID for an entity
   */
  public getSelectableId(entityId: string): string | undefined {
    for (const [selectableId, entId] of this.entityIdMap.entries()) {
      if (entId === entityId) return selectableId;
    }
    return undefined;
  }
}

/**
 * Selection utilities for ECS
 */
export class ECSSelectionUtils {
  /**
   * Get all selected entities from world
   */
  static getSelectedEntities(world: World): string[] {
    const selected: string[] = [];
    const entities = world.getAllEntities();

    for (const entity of entities) {
      const selection = world.getComponent<SelectionComponent>(entity.id, 'Selection');
      if (selection?.selected) {
        selected.push(entity.id);
      }
    }

    return selected;
  }

  /**
   * Select entity by ID
   */
  static selectEntity(world: World, entityId: string, clearOthers: boolean = true): boolean {
    // Clear other selections if needed
    if (clearOthers) {
      this.clearAllSelections(world);
    }

    // Select target entity
    const selection = world.getComponent<SelectionComponent>(entityId, 'Selection');
    if (selection) {
      world.setComponent(entityId, { ...selection, selected: true });
      return true;
    }

    return false;
  }

  /**
   * Deselect entity by ID
   */
  static deselectEntity(world: World, entityId: string): boolean {
    const selection = world.getComponent<SelectionComponent>(entityId, 'Selection');
    if (selection) {
      world.setComponent(entityId, { ...selection, selected: false });
      return true;
    }
    return false;
  }

  /**
   * Toggle entity selection
   */
  static toggleEntitySelection(world: World, entityId: string): boolean {
    const selection = world.getComponent<SelectionComponent>(entityId, 'Selection');
    if (selection) {
      world.setComponent(entityId, { ...selection, selected: !selection.selected });
      return !selection.selected;
    }
    return false;
  }

  /**
   * Clear all selections in world
   */
  static clearAllSelections(world: World): void {
    const entities = world.getAllEntities();

    for (const entity of entities) {
      const selection = world.getComponent<SelectionComponent>(entity.id, 'Selection');
      if (selection?.selected) {
        world.setComponent(entity.id, { ...selection, selected: false });
      }
    }
  }

  /**
   * Check if entity is selected
   */
  static isEntitySelected(world: World, entityId: string): boolean {
    const selection = world.getComponent<SelectionComponent>(entityId, 'Selection');
    return selection?.selected ?? false;
  }

  /**
   * Get selection count
   */
  static getSelectionCount(world: World): number {
    return this.getSelectedEntities(world).length;
  }

  /**
   * Raycast and select entity
   */
  static selectFromRaycast(
    world: World,
    raycaster: Raycaster,
    meshCache: Map<string, Object3D>,
    addToSelection: boolean = false
  ): string | null {
    const objects = Array.from(meshCache.values());
    const intersections = raycaster.intersectObjects(objects, true);

    if (intersections.length > 0) {
      // Find entity ID from mesh userData
      const hit = intersections[0];
      let entityId: string | null = null;

      // Traverse up to find entity
      let current = hit.object;
      while (current && !entityId) {
        if (current.userData.entityId) {
          entityId = current.userData.entityId;
          break;
        }
        current = current.parent as Object3D;
      }

      if (entityId) {
        this.selectEntity(world, entityId, !addToSelection);
        return entityId;
      }
    }

    // Clear selection if clicking empty space
    if (!addToSelection) {
      this.clearAllSelections(world);
    }

    return null;
  }
}

/**
 * Hook-friendly selection manager
 */
export function createSelectionManager(
  world: World,
  onSelectionChange?: (event: SelectionEvent) => void
): ECSSelectionManager {
  return new ECSSelectionManager(world, {
    multiSelectEnabled: false,
    onSelectionChange
  });
}
