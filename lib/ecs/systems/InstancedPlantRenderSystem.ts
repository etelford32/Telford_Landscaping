/**
 * Instanced Plant Render System
 * Optimized rendering using THREE.InstancedMesh for plants of the same species
 *
 * Performance benefits:
 * - Single draw call per species instead of per plant
 * - Reduced memory usage for repeated geometries
 * - Better GPU utilization
 *
 * Trade-offs:
 * - All instances share same geometry and material
 * - Individual selection highlighting requires instance updates
 */

import * as THREE from 'three';
import { BaseSystem, ComponentUpdate, SystemPriority } from '../core/System';
import { ComponentType } from '../core/Component';
import { World } from '../core/World';
import { Entity } from '../core/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { PlantDataComponent } from '../components/PlantDataComponent';
import { SelectionComponent } from '../components/SelectionComponent';
import { getPlantSpecies, calculatePlantSize } from '@/lib/plantData';

/**
 * Instance data for a single plant
 */
interface PlantInstance {
  entityId: string;
  matrixIndex: number; // Index in the instance matrix
  transform: TransformComponent;
  selected: boolean;
}

/**
 * Instanced mesh group for a species
 */
interface InstancedGroup {
  canopyMesh: THREE.InstancedMesh;
  trunkMesh?: THREE.InstancedMesh;
  instances: Map<string, PlantInstance>; // entityId -> instance data
  capacity: number;
  nextIndex: number;
  needsUpdate: boolean;
}

export interface InstancedPlantRenderSystemConfig {
  autoAddToScene: boolean;
  enableShadows: boolean;
  initialInstanceCapacity: number; // Initial instances per species
  maxInstancesPerSpecies: number;
  detailLevel: 'low' | 'medium' | 'high';
  enableFrustumCulling: boolean;
}

const DEFAULT_CONFIG: InstancedPlantRenderSystemConfig = {
  autoAddToScene: true,
  enableShadows: true,
  initialInstanceCapacity: 50,
  maxInstancesPerSpecies: 1000,
  detailLevel: 'medium',
  enableFrustumCulling: true
};

/**
 * Instanced Plant Render System
 */
export class InstancedPlantRenderSystem extends BaseSystem {
  readonly name = 'InstancedPlantRenderSystem';
  readonly requiredComponents: ComponentType[] = ['Transform', 'PlantData'];
  readonly priority = SystemPriority.RENDER;

  private config: InstancedPlantRenderSystemConfig;
  private scene?: THREE.Scene;
  private instancedGroups: Map<string, InstancedGroup> = new Map(); // speciesId -> group
  private entityToSpecies: Map<string, string> = new Map(); // entityId -> speciesId

  constructor(scene?: THREE.Scene, config: Partial<InstancedPlantRenderSystemConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.scene = scene;
  }

  /**
   * Main update - sync all plants to instanced meshes
   */
  update(world: World, deltaTime: number): ComponentUpdate[] {
    const entities = this.queryEntities(world);

    // Group entities by species
    const speciesGroups = new Map<string, Entity[]>();
    for (const entity of entities) {
      const plantData = world.getComponent<PlantDataComponent>(entity.id, 'PlantData');
      if (!plantData) continue;

      if (!speciesGroups.has(plantData.speciesId)) {
        speciesGroups.set(plantData.speciesId, []);
      }
      speciesGroups.get(plantData.speciesId)!.push(entity);
    }

    // Update each species group
    for (const [speciesId, speciesEntities] of speciesGroups.entries()) {
      this.updateSpeciesGroup(world, speciesId, speciesEntities);
    }

    // Remove empty species groups
    this.cleanupEmptyGroups(speciesGroups);

    // Apply matrix updates
    this.applyMatrixUpdates();

    return [];
  }

  /**
   * Update all instances for a species
   */
  private updateSpeciesGroup(
    world: World,
    speciesId: string,
    entities: Entity[]
  ): void {
    // Ensure instanced group exists
    if (!this.instancedGroups.has(speciesId)) {
      this.createInstancedGroup(speciesId, entities.length);
    }

    const group = this.instancedGroups.get(speciesId)!;

    // Resize if needed
    if (entities.length > group.capacity) {
      this.resizeInstancedGroup(speciesId, entities.length);
    }

    // Track which instances are still active
    const activeInstances = new Set<string>();

    // Update each plant instance
    for (const entity of entities) {
      const transform = world.getComponent<TransformComponent>(entity.id, 'Transform');
      const selection = world.getComponent<SelectionComponent>(entity.id, 'Selection');

      if (!transform) continue;

      activeInstances.add(entity.id);
      this.updatePlantInstance(
        group,
        entity.id,
        speciesId,
        transform,
        selection?.selected ?? false,
        selection?.visible ?? true
      );
    }

    // Remove instances that no longer exist
    for (const [entityId] of group.instances.entries()) {
      if (!activeInstances.has(entityId)) {
        this.removePlantInstance(group, entityId);
      }
    }

    // Update instance count
    group.canopyMesh.count = group.instances.size;
    if (group.trunkMesh) {
      group.trunkMesh.count = group.instances.size;
    }
  }

  /**
   * Create instanced group for a species
   */
  private createInstancedGroup(speciesId: string, estimatedCount: number): void {
    const species = getPlantSpecies(speciesId);
    if (!species) return;

    const capacity = Math.max(
      this.config.initialInstanceCapacity,
      Math.min(estimatedCount * 2, this.config.maxInstancesPerSpecies)
    );

    // Create geometry based on shape type (simplified for instancing)
    const segments = this.getSegmentCount();
    const canopyGeometry = this.createCanopyGeometry(species.growthData.shapeType, segments);
    const canopyMaterial = new THREE.MeshStandardMaterial({
      color: species.color,
      roughness: 0.8
    });

    const canopyMesh = new THREE.InstancedMesh(
      canopyGeometry,
      canopyMaterial,
      capacity
    );
    canopyMesh.castShadow = this.config.enableShadows;
    canopyMesh.receiveShadow = this.config.enableShadows;
    canopyMesh.frustumCulled = this.config.enableFrustumCulling;
    canopyMesh.count = 0;
    canopyMesh.userData.speciesId = speciesId;

    // Create trunk for trees and shrubs
    let trunkMesh: THREE.InstancedMesh | undefined;
    if (species.category === 'tree' || species.category === 'shrub') {
      const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.2, 1, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x654321,
        roughness: 0.9
      });

      trunkMesh = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, capacity);
      trunkMesh.castShadow = this.config.enableShadows;
      trunkMesh.count = 0;
      trunkMesh.userData.speciesId = speciesId;
    }

    // Store group
    const group: InstancedGroup = {
      canopyMesh,
      trunkMesh,
      instances: new Map(),
      capacity,
      nextIndex: 0,
      needsUpdate: false
    };

    this.instancedGroups.set(speciesId, group);

    // Add to scene
    if (this.scene && this.config.autoAddToScene) {
      this.scene.add(canopyMesh);
      if (trunkMesh) {
        this.scene.add(trunkMesh);
      }
    }
  }

  /**
   * Update or create a plant instance
   */
  private updatePlantInstance(
    group: InstancedGroup,
    entityId: string,
    speciesId: string,
    transform: TransformComponent,
    selected: boolean,
    visible: boolean
  ): void {
    let instance = group.instances.get(entityId);

    // Create new instance if needed
    if (!instance) {
      instance = {
        entityId,
        matrixIndex: group.nextIndex++,
        transform,
        selected
      };
      group.instances.set(entityId, instance);
      this.entityToSpecies.set(entityId, speciesId);
    }

    // Update transform
    instance.transform = transform;
    instance.selected = selected;

    // Build transform matrix
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3(
      transform.position.x,
      transform.position.y,
      transform.position.z
    );
    const rotation = new THREE.Euler(
      transform.rotation.x,
      transform.rotation.y,
      transform.rotation.z
    );
    const scale = new THREE.Vector3(
      transform.scale.x,
      transform.scale.y,
      transform.scale.z
    );

    matrix.compose(position, new THREE.Quaternion().setFromEuler(rotation), scale);

    // Set instance matrix
    group.canopyMesh.setMatrixAt(instance.matrixIndex, matrix);

    // Update trunk if present
    if (group.trunkMesh) {
      // Trunk needs different scale
      const trunkMatrix = new THREE.Matrix4();
      const trunkPosition = new THREE.Vector3(
        transform.position.x,
        transform.position.y,
        transform.position.z
      );
      const trunkScale = new THREE.Vector3(
        transform.scale.x,
        transform.scale.y * 0.6, // Trunk height adjustment
        transform.scale.z
      );
      trunkMatrix.compose(
        trunkPosition,
        new THREE.Quaternion().setFromEuler(rotation),
        trunkScale
      );
      group.trunkMesh.setMatrixAt(instance.matrixIndex, trunkMatrix);
    }

    // Update selection color
    if (selected) {
      const color = new THREE.Color(0xffff00); // Yellow highlight
      group.canopyMesh.setColorAt(instance.matrixIndex, color);
    } else {
      group.canopyMesh.setColorAt(instance.matrixIndex, new THREE.Color(0xffffff));
    }

    // Mark for update
    group.needsUpdate = true;
  }

  /**
   * Remove plant instance
   */
  private removePlantInstance(group: InstancedGroup, entityId: string): void {
    const instance = group.instances.get(entityId);
    if (!instance) return;

    // Move the last instance to this slot to maintain compact array
    const lastIndex = group.nextIndex - 1;
    if (instance.matrixIndex !== lastIndex) {
      // Find the instance at lastIndex
      for (const [id, inst] of group.instances.entries()) {
        if (inst.matrixIndex === lastIndex) {
          // Move it to the freed slot
          inst.matrixIndex = instance.matrixIndex;

          // Copy matrices
          const matrix = new THREE.Matrix4();
          group.canopyMesh.getMatrixAt(lastIndex, matrix);
          group.canopyMesh.setMatrixAt(instance.matrixIndex, matrix);

          if (group.trunkMesh) {
            group.trunkMesh.getMatrixAt(lastIndex, matrix);
            group.trunkMesh.setMatrixAt(instance.matrixIndex, matrix);
          }

          break;
        }
      }
    }

    group.instances.delete(entityId);
    this.entityToSpecies.delete(entityId);
    group.nextIndex--;
    group.needsUpdate = true;
  }

  /**
   * Resize instanced group
   */
  private resizeInstancedGroup(speciesId: string, newSize: number): void {
    const group = this.instancedGroups.get(speciesId);
    if (!group) return;

    const newCapacity = Math.min(
      Math.max(newSize * 2, group.capacity * 2),
      this.config.maxInstancesPerSpecies
    );

    // Create new larger meshes
    const newCanopyMesh = new THREE.InstancedMesh(
      group.canopyMesh.geometry,
      group.canopyMesh.material,
      newCapacity
    );
    newCanopyMesh.castShadow = group.canopyMesh.castShadow;
    newCanopyMesh.receiveShadow = group.canopyMesh.receiveShadow;
    newCanopyMesh.frustumCulled = group.canopyMesh.frustumCulled;

    // Copy existing matrices
    for (let i = 0; i < group.canopyMesh.count; i++) {
      const matrix = new THREE.Matrix4();
      group.canopyMesh.getMatrixAt(i, matrix);
      newCanopyMesh.setMatrixAt(i, matrix);
    }

    // Replace in scene
    if (this.scene) {
      this.scene.remove(group.canopyMesh);
      this.scene.add(newCanopyMesh);
    }

    group.canopyMesh.dispose();
    group.canopyMesh = newCanopyMesh;
    group.capacity = newCapacity;

    // Handle trunk if present
    if (group.trunkMesh) {
      const newTrunkMesh = new THREE.InstancedMesh(
        group.trunkMesh.geometry,
        group.trunkMesh.material,
        newCapacity
      );
      newTrunkMesh.castShadow = group.trunkMesh.castShadow;

      for (let i = 0; i < group.trunkMesh.count; i++) {
        const matrix = new THREE.Matrix4();
        group.trunkMesh.getMatrixAt(i, matrix);
        newTrunkMesh.setMatrixAt(i, matrix);
      }

      if (this.scene) {
        this.scene.remove(group.trunkMesh);
        this.scene.add(newTrunkMesh);
      }

      group.trunkMesh.dispose();
      group.trunkMesh = newTrunkMesh;
    }
  }

  /**
   * Apply pending matrix updates
   */
  private applyMatrixUpdates(): void {
    for (const group of this.instancedGroups.values()) {
      if (group.needsUpdate) {
        group.canopyMesh.instanceMatrix.needsUpdate = true;
        if (group.canopyMesh.instanceColor) {
          group.canopyMesh.instanceColor.needsUpdate = true;
        }

        if (group.trunkMesh) {
          group.trunkMesh.instanceMatrix.needsUpdate = true;
        }

        group.needsUpdate = false;
      }
    }
  }

  /**
   * Create canopy geometry based on shape type
   */
  private createCanopyGeometry(shapeType: string, segments: number): THREE.BufferGeometry {
    switch (shapeType) {
      case 'rounded':
        return new THREE.SphereGeometry(1, segments, segments);
      case 'pyramidal':
        return new THREE.ConeGeometry(0.8, 1.5, segments);
      case 'columnar':
        return new THREE.CylinderGeometry(0.5, 0.6, 1.5, segments);
      case 'weeping':
        return new THREE.SphereGeometry(0.8, segments, segments);
      case 'vase':
        return new THREE.CylinderGeometry(1, 0.4, 1.2, segments);
      default:
        return new THREE.SphereGeometry(1, segments, segments);
    }
  }

  /**
   * Get segment count based on detail level
   */
  private getSegmentCount(): number {
    switch (this.config.detailLevel) {
      case 'low':
        return 8;
      case 'medium':
        return 12;
      case 'high':
        return 16;
      default:
        return 12;
    }
  }

  /**
   * Clean up empty groups
   */
  private cleanupEmptyGroups(activeSpecies: Map<string, Entity[]>): void {
    for (const [speciesId, group] of this.instancedGroups.entries()) {
      if (!activeSpecies.has(speciesId) || group.instances.size === 0) {
        this.removeInstancedGroup(speciesId);
      }
    }
  }

  /**
   * Remove instanced group
   */
  private removeInstancedGroup(speciesId: string): void {
    const group = this.instancedGroups.get(speciesId);
    if (!group) return;

    // Remove from scene
    if (this.scene) {
      this.scene.remove(group.canopyMesh);
      if (group.trunkMesh) {
        this.scene.remove(group.trunkMesh);
      }
    }

    // Dispose
    group.canopyMesh.dispose();
    if (group.trunkMesh) {
      group.trunkMesh.dispose();
    }

    this.instancedGroups.delete(speciesId);
  }

  /**
   * Set scene
   */
  setScene(scene: THREE.Scene): void {
    this.scene = scene;

    if (this.config.autoAddToScene) {
      for (const group of this.instancedGroups.values()) {
        scene.add(group.canopyMesh);
        if (group.trunkMesh) {
          scene.add(group.trunkMesh);
        }
      }
    }
  }

  /**
   * Dispose all instances
   */
  dispose(): void {
    const speciesIds = Array.from(this.instancedGroups.keys());
    for (const speciesId of speciesIds) {
      this.removeInstancedGroup(speciesId);
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    let totalInstances = 0;
    let totalCapacity = 0;

    for (const group of this.instancedGroups.values()) {
      totalInstances += group.instances.size;
      totalCapacity += group.capacity;
    }

    return {
      speciesCount: this.instancedGroups.size,
      totalInstances,
      totalCapacity,
      utilization: totalCapacity > 0 ? totalInstances / totalCapacity : 0,
      config: this.config
    };
  }
}
