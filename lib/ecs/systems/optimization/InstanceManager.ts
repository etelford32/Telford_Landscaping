/**
 * InstanceManager - Efficient rendering of many identical objects
 *
 * Uses THREE.InstancedMesh to render many copies of the same geometry
 * with different transforms, dramatically improving performance.
 *
 * Example: Render 1000 lavender plants with a single draw call
 */

import * as THREE from 'three';

/**
 * Instance data for a single entity
 */
export interface InstanceData {
  entityId: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  visible: boolean;
  color?: THREE.Color;
}

/**
 * Instance group - manages instances of a specific model
 */
export class InstanceGroup {
  private geometry: THREE.BufferGeometry;
  private material: THREE.Material;
  private instancedMesh: THREE.InstancedMesh;
  private instances: Map<string, number> = new Map(); // entityId -> instanceIndex
  private freeIndices: number[] = [];
  private maxInstances: number;
  private currentCount: number = 0;

  // Temp objects for matrix calculations
  private tempMatrix = new THREE.Matrix4();
  private tempPosition = new THREE.Vector3();
  private tempRotation = new THREE.Quaternion();
  private tempScale = new THREE.Vector3();

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    maxInstances: number = 1000
  ) {
    this.geometry = geometry;
    this.material = material;
    this.maxInstances = maxInstances;

    // Create instanced mesh
    this.instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      maxInstances
    );

    // Enable frustum culling per instance (requires Three.js r132+)
    this.instancedMesh.frustumCulled = true;

    // Initialize with identity matrices
    for (let i = 0; i < maxInstances; i++) {
      this.instancedMesh.setMatrixAt(i, new THREE.Matrix4());
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    this.instancedMesh.count = 0; // Initially show no instances
  }

  /**
   * Add an instance
   */
  addInstance(entityId: string, data: InstanceData): boolean {
    // Check if already exists
    if (this.instances.has(entityId)) {
      return this.updateInstance(entityId, data);
    }

    // Get available index
    let index: number;
    if (this.freeIndices.length > 0) {
      index = this.freeIndices.pop()!;
    } else {
      if (this.currentCount >= this.maxInstances) {
        console.warn(`InstanceGroup: Maximum instances (${this.maxInstances}) reached`);
        return false;
      }
      index = this.currentCount++;
    }

    // Store mapping
    this.instances.set(entityId, index);

    // Set matrix
    this.setInstanceMatrix(index, data);

    // Update visible count
    this.instancedMesh.count = Math.max(this.instancedMesh.count, index + 1);

    return true;
  }

  /**
   * Update an instance
   */
  updateInstance(entityId: string, data: InstanceData): boolean {
    const index = this.instances.get(entityId);
    if (index === undefined) return false;

    this.setInstanceMatrix(index, data);
    return true;
  }

  /**
   * Remove an instance
   */
  removeInstance(entityId: string): boolean {
    const index = this.instances.get(entityId);
    if (index === undefined) return false;

    // Remove mapping
    this.instances.delete(entityId);

    // Hide this instance by setting scale to 0
    this.tempMatrix.makeScale(0, 0, 0);
    this.instancedMesh.setMatrixAt(index, this.tempMatrix);
    this.instancedMesh.instanceMatrix.needsUpdate = true;

    // Add to free list
    this.freeIndices.push(index);

    return true;
  }

  /**
   * Set instance matrix from data
   */
  private setInstanceMatrix(index: number, data: InstanceData): void {
    // Convert Euler to Quaternion
    this.tempRotation.setFromEuler(data.rotation);

    // Compose matrix
    this.tempMatrix.compose(data.position, this.tempRotation, data.scale);

    // Apply to instance
    this.instancedMesh.setMatrixAt(index, this.tempMatrix);
    this.instancedMesh.instanceMatrix.needsUpdate = true;

    // Update color if provided
    if (data.color && this.instancedMesh.instanceColor) {
      this.instancedMesh.setColorAt(index, data.color);
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  /**
   * Get instanced mesh for adding to scene
   */
  getMesh(): THREE.InstancedMesh {
    return this.instancedMesh;
  }

  /**
   * Get entity ID at instance index
   */
  getEntityIdAt(index: number): string | undefined {
    for (const [entityId, idx] of this.instances.entries()) {
      if (idx === index) return entityId;
    }
    return undefined;
  }

  /**
   * Get instance count
   */
  getInstanceCount(): number {
    return this.instances.size;
  }

  /**
   * Get max instances
   */
  getMaxInstances(): number {
    return this.maxInstances;
  }

  /**
   * Check if has capacity
   */
  hasCapacity(): boolean {
    return this.instances.size < this.maxInstances;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.geometry.dispose();
    if (Array.isArray(this.material)) {
      this.material.forEach((m) => m.dispose());
    } else {
      this.material.dispose();
    }
    this.instances.clear();
    this.freeIndices = [];
  }
}

/**
 * InstanceManager - Manages multiple instance groups
 */
export class InstanceManager {
  private instanceGroups: Map<string, InstanceGroup> = new Map();
  private scene?: THREE.Scene;

  constructor(scene?: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * Create an instance group
   */
  createGroup(
    groupId: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    maxInstances: number = 1000
  ): InstanceGroup {
    if (this.instanceGroups.has(groupId)) {
      throw new Error(`Instance group ${groupId} already exists`);
    }

    const group = new InstanceGroup(geometry, material, maxInstances);
    this.instanceGroups.set(groupId, group);

    // Add to scene
    if (this.scene) {
      this.scene.add(group.getMesh());
    }

    return group;
  }

  /**
   * Get instance group
   */
  getGroup(groupId: string): InstanceGroup | undefined {
    return this.instanceGroups.get(groupId);
  }

  /**
   * Add instance to group
   */
  addInstance(
    groupId: string,
    entityId: string,
    data: InstanceData
  ): boolean {
    const group = this.instanceGroups.get(groupId);
    if (!group) {
      console.warn(`Instance group ${groupId} not found`);
      return false;
    }

    return group.addInstance(entityId, data);
  }

  /**
   * Update instance
   */
  updateInstance(
    groupId: string,
    entityId: string,
    data: InstanceData
  ): boolean {
    const group = this.instanceGroups.get(groupId);
    if (!group) return false;

    return group.updateInstance(entityId, data);
  }

  /**
   * Remove instance
   */
  removeInstance(groupId: string, entityId: string): boolean {
    const group = this.instanceGroups.get(groupId);
    if (!group) return false;

    return group.removeInstance(entityId);
  }

  /**
   * Remove instance group
   */
  removeGroup(groupId: string): boolean {
    const group = this.instanceGroups.get(groupId);
    if (!group) return false;

    // Remove from scene
    if (this.scene) {
      this.scene.remove(group.getMesh());
    }

    // Dispose resources
    group.dispose();

    this.instanceGroups.delete(groupId);
    return true;
  }

  /**
   * Get all group IDs
   */
  getGroupIds(): string[] {
    return Array.from(this.instanceGroups.keys());
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalGroups: number;
    totalInstances: number;
    byGroup: Record<string, { count: number; max: number }>;
  } {
    const stats = {
      totalGroups: this.instanceGroups.size,
      totalInstances: 0,
      byGroup: {} as Record<string, { count: number; max: number }>
    };

    for (const [groupId, group] of this.instanceGroups.entries()) {
      const count = group.getInstanceCount();
      stats.totalInstances += count;
      stats.byGroup[groupId] = {
        count,
        max: group.getMaxInstances()
      };
    }

    return stats;
  }

  /**
   * Set scene
   */
  setScene(scene: THREE.Scene): void {
    // Remove from old scene
    if (this.scene) {
      for (const group of this.instanceGroups.values()) {
        this.scene.remove(group.getMesh());
      }
    }

    // Add to new scene
    this.scene = scene;
    for (const group of this.instanceGroups.values()) {
      this.scene.add(group.getMesh());
    }
  }

  /**
   * Dispose all groups
   */
  dispose(): void {
    for (const group of this.instanceGroups.values()) {
      if (this.scene) {
        this.scene.remove(group.getMesh());
      }
      group.dispose();
    }
    this.instanceGroups.clear();
  }
}
