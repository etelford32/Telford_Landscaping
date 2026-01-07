/**
 * DragController - Object-Oriented Drag and Movement System
 * Manages object dragging, snapping, and 3D movement
 */

import { Vector2, Vector3, Plane, Raycaster, Camera, Object3D } from 'three';

export interface DraggableObject {
  id: string;
  object3D?: Object3D;
  position: Vector3;
  onDragStart?: (position: Vector3) => void;
  onDrag?: (position: Vector3, delta: Vector3) => void;
  onDragEnd?: (position: Vector3) => void;
}

export interface DragSettings {
  snapToGrid: boolean;
  gridSize: number;
  dragPlaneY: number;
  enabled: boolean;
}

export class DragController {
  private draggables: Map<string, DraggableObject> = new Map();
  private isDragging: boolean = false;
  private draggedId: string | null = null;
  private dragStartPosition: Vector3 = new Vector3();
  private dragOffset: Vector3 = new Vector3();
  private raycaster: Raycaster = new Raycaster();
  private dragPlane: Plane = new Plane(new Vector3(0, 1, 0), 0);
  private settings: DragSettings;

  constructor(settings?: Partial<DragSettings>) {
    this.settings = {
      snapToGrid: true,
      gridSize: 1,
      dragPlaneY: 0,
      enabled: true,
      ...settings,
    };

    this.dragPlane.constant = -this.settings.dragPlaneY;
  }

  /**
   * Register an object as draggable
   */
  public register(draggable: DraggableObject): void {
    this.draggables.set(draggable.id, draggable);
  }

  /**
   * Unregister an object
   */
  public unregister(id: string): void {
    if (this.draggedId === id) {
      this.endDrag();
    }
    this.draggables.delete(id);
  }

  /**
   * Start dragging an object
   */
  public startDrag(
    id: string,
    mousePosition: Vector2,
    camera: Camera
  ): boolean {
    if (!this.settings.enabled || this.isDragging) return false;

    const draggable = this.draggables.get(id);
    if (!draggable) return false;

    this.raycaster.setFromCamera(mousePosition, camera);

    const intersectionPoint = new Vector3();
    const hasIntersection = this.raycaster.ray.intersectPlane(
      this.dragPlane,
      intersectionPoint
    );

    if (!hasIntersection) return false;

    this.isDragging = true;
    this.draggedId = id;
    this.dragStartPosition.copy(draggable.position);

    // Calculate offset between click point and object center
    this.dragOffset.subVectors(draggable.position, intersectionPoint);

    draggable.onDragStart?.(draggable.position);

    return true;
  }

  /**
   * Update drag position
   */
  public updateDrag(mousePosition: Vector2, camera: Camera): Vector3 | null {
    if (!this.isDragging || !this.draggedId) return null;

    const draggable = this.draggables.get(this.draggedId);
    if (!draggable) return null;

    this.raycaster.setFromCamera(mousePosition, camera);

    const intersectionPoint = new Vector3();
    const hasIntersection = this.raycaster.ray.intersectPlane(
      this.dragPlane,
      intersectionPoint
    );

    if (!hasIntersection) return null;

    // Add offset to get actual object position
    const newPosition = intersectionPoint.add(this.dragOffset);

    // Apply grid snapping if enabled
    if (this.settings.snapToGrid) {
      newPosition.x = this.snapToGrid(newPosition.x);
      newPosition.z = this.snapToGrid(newPosition.z);
    }

    // Keep Y position constant
    newPosition.y = draggable.position.y;

    // Calculate delta from previous position
    const delta = new Vector3().subVectors(newPosition, draggable.position);

    // Update position
    draggable.position.copy(newPosition);

    // Notify callbacks
    draggable.onDrag?.(newPosition, delta);

    return newPosition.clone();
  }

  /**
   * End dragging
   */
  public endDrag(): void {
    if (!this.isDragging || !this.draggedId) return;

    const draggable = this.draggables.get(this.draggedId);
    if (draggable) {
      draggable.onDragEnd?.(draggable.position);
    }

    this.isDragging = false;
    this.draggedId = null;
    this.dragOffset.set(0, 0, 0);
  }

  /**
   * Cancel drag and return to start position
   */
  public cancelDrag(): void {
    if (!this.isDragging || !this.draggedId) return;

    const draggable = this.draggables.get(this.draggedId);
    if (draggable) {
      draggable.position.copy(this.dragStartPosition);
      draggable.onDragEnd?.(draggable.position);
    }

    this.isDragging = false;
    this.draggedId = null;
  }

  /**
   * Snap value to grid
   */
  private snapToGrid(value: number): number {
    return Math.round(value / this.settings.gridSize) * this.settings.gridSize;
  }

  /**
   * Check if currently dragging
   */
  public getIsDragging(): boolean {
    return this.isDragging;
  }

  /**
   * Get currently dragged object ID
   */
  public getDraggedId(): string | null {
    return this.draggedId;
  }

  /**
   * Set snap to grid enabled
   */
  public setSnapToGrid(enabled: boolean): void {
    this.settings.snapToGrid = enabled;
  }

  /**
   * Set grid size
   */
  public setGridSize(size: number): void {
    this.settings.gridSize = size;
  }

  /**
   * Set drag plane Y position
   */
  public setDragPlaneY(y: number): void {
    this.settings.dragPlaneY = y;
    this.dragPlane.constant = -y;
  }

  /**
   * Enable or disable dragging
   */
  public setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled;
    if (!enabled && this.isDragging) {
      this.endDrag();
    }
  }

  /**
   * Move object by delta
   */
  public moveObject(id: string, delta: Vector3): boolean {
    const draggable = this.draggables.get(id);
    if (!draggable) return false;

    const newPosition = draggable.position.clone().add(delta);

    if (this.settings.snapToGrid) {
      newPosition.x = this.snapToGrid(newPosition.x);
      newPosition.z = this.snapToGrid(newPosition.z);
    }

    draggable.position.copy(newPosition);
    draggable.onDrag?.(newPosition, delta);

    return true;
  }

  /**
   * Set object position directly
   */
  public setPosition(id: string, position: Vector3): boolean {
    const draggable = this.draggables.get(id);
    if (!draggable) return false;

    const newPosition = position.clone();

    if (this.settings.snapToGrid) {
      newPosition.x = this.snapToGrid(newPosition.x);
      newPosition.z = this.snapToGrid(newPosition.z);
    }

    const delta = new Vector3().subVectors(newPosition, draggable.position);
    draggable.position.copy(newPosition);
    draggable.onDrag?.(newPosition, delta);

    return true;
  }
}
