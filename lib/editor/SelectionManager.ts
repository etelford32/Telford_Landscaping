/**
 * SelectionManager - Object-Oriented Selection System
 * Manages object selection, multi-selection, and selection state
 */

import { Object3D, Raycaster, Camera, Vector2, Intersection } from 'three';

export interface Selectable {
  id: string;
  object3D?: Object3D;
  onSelect?: () => void;
  onDeselect?: () => void;
}

export interface SelectionEvent {
  selectedIds: string[];
  previousIds: string[];
  timestamp: number;
}

export class SelectionManager {
  private selectedIds: Set<string> = new Set();
  private selectables: Map<string, Selectable> = new Map();
  private raycaster: Raycaster = new Raycaster();
  private multiSelectEnabled: boolean = false;
  private onSelectionChange?: (event: SelectionEvent) => void;

  constructor(options?: {
    multiSelectEnabled?: boolean;
    onSelectionChange?: (event: SelectionEvent) => void;
  }) {
    this.multiSelectEnabled = options?.multiSelectEnabled || false;
    this.onSelectionChange = options?.onSelectionChange;
  }

  /**
   * Register an object as selectable
   */
  public register(selectable: Selectable): void {
    this.selectables.set(selectable.id, selectable);
  }

  /**
   * Unregister an object
   */
  public unregister(id: string): void {
    this.deselect(id);
    this.selectables.delete(id);
  }

  /**
   * Select an object by ID
   */
  public select(id: string, addToSelection: boolean = false): boolean {
    const selectable = this.selectables.get(id);
    if (!selectable) return false;

    const previousIds = Array.from(this.selectedIds);

    // Clear previous selection if not multi-selecting
    if (!addToSelection && !this.multiSelectEnabled) {
      this.clearSelection();
    }

    // Add to selection
    this.selectedIds.add(id);
    selectable.onSelect?.();

    // Emit selection change event
    this.emitSelectionChange(previousIds);

    return true;
  }

  /**
   * Deselect an object by ID
   */
  public deselect(id: string): boolean {
    const selectable = this.selectables.get(id);
    if (!selectable || !this.selectedIds.has(id)) return false;

    const previousIds = Array.from(this.selectedIds);

    this.selectedIds.delete(id);
    selectable.onDeselect?.();

    this.emitSelectionChange(previousIds);

    return true;
  }

  /**
   * Toggle selection for an object
   */
  public toggle(id: string): boolean {
    if (this.isSelected(id)) {
      return this.deselect(id);
    } else {
      return this.select(id, this.multiSelectEnabled);
    }
  }

  /**
   * Clear all selections
   */
  public clearSelection(): void {
    const previousIds = Array.from(this.selectedIds);

    this.selectedIds.forEach(id => {
      const selectable = this.selectables.get(id);
      selectable?.onDeselect?.();
    });

    this.selectedIds.clear();

    if (previousIds.length > 0) {
      this.emitSelectionChange(previousIds);
    }
  }

  /**
   * Check if an object is selected
   */
  public isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  /**
   * Get all selected IDs
   */
  public getSelectedIds(): string[] {
    return Array.from(this.selectedIds);
  }

  /**
   * Get first selected object
   */
  public getFirstSelected(): Selectable | null {
    const firstId = this.selectedIds.values().next().value;
    return firstId ? this.selectables.get(firstId) || null : null;
  }

  /**
   * Get all selected objects
   */
  public getSelected(): Selectable[] {
    return Array.from(this.selectedIds)
      .map(id => this.selectables.get(id))
      .filter((s): s is Selectable => s !== undefined);
  }

  /**
   * Perform raycast to select object under mouse
   */
  public selectFromRaycast(
    mousePosition: Vector2,
    camera: Camera,
    scene: Object3D,
    addToSelection: boolean = false
  ): string | null {
    this.raycaster.setFromCamera(mousePosition, camera);

    // Get all selectable 3D objects
    const objects = Array.from(this.selectables.values())
      .map(s => s.object3D)
      .filter((obj): obj is Object3D => obj !== undefined);

    const intersections = this.raycaster.intersectObjects(objects, true);

    if (intersections.length > 0) {
      // Find the closest selectable parent
      const intersection = intersections[0];
      const selectedId = this.findSelectableParent(intersection.object);

      if (selectedId) {
        this.select(selectedId, addToSelection);
        return selectedId;
      }
    }

    // Clear selection if clicking on empty space (unless multi-selecting)
    if (!addToSelection) {
      this.clearSelection();
    }

    return null;
  }

  /**
   * Find selectable parent from a 3D object
   */
  private findSelectableParent(object: Object3D): string | null {
    let current: Object3D | null = object;

    while (current) {
      // Check if this object belongs to a selectable
      for (const [id, selectable] of this.selectables) {
        if (selectable.object3D === current) {
          return id;
        }
      }
      current = current.parent;
    }

    return null;
  }

  /**
   * Enable or disable multi-selection
   */
  public setMultiSelectEnabled(enabled: boolean): void {
    this.multiSelectEnabled = enabled;
    if (!enabled && this.selectedIds.size > 1) {
      // Keep only the first selected item
      const firstId = this.selectedIds.values().next().value;
      this.clearSelection();
      if (firstId) {
        this.select(firstId);
      }
    }
  }

  /**
   * Emit selection change event
   */
  private emitSelectionChange(previousIds: string[]): void {
    if (this.onSelectionChange) {
      this.onSelectionChange({
        selectedIds: this.getSelectedIds(),
        previousIds,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get selection count
   */
  public getSelectionCount(): number {
    return this.selectedIds.size;
  }

  /**
   * Check if anything is selected
   */
  public hasSelection(): boolean {
    return this.selectedIds.size > 0;
  }
}
