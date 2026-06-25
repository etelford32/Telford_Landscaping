/**
 * PlantRenderSystem - Specialized rendering for plants using ECS
 *
 * Extends RenderSystem to handle complex plant geometries based on
 * species data and growth curves.
 *
 * Responsibilities:
 * - Create multi-mesh plant models (trunk + canopy)
 * - Apply species-specific shapes (rounded, pyramidal, weeping, etc.)
 * - Handle plant growth visualization
 * - Sync with PlantDataComponent
 */

import * as THREE from 'three';
import { BaseSystem, ComponentUpdate, SystemPriority } from '../core/System';
import { ComponentType } from '../core/Component';
import { World } from '../core/World';
import { Entity } from '../core/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { MaterialComponent, colorToHex } from '../components/MaterialComponent';
import { SelectionComponent } from '../components/SelectionComponent';
import { PlantDataComponent } from '../components/PlantDataComponent';
import { getPlantSpecies, calculatePlantSize } from '@/lib/plantData';

/**
 * Plant shape type determines the rendering strategy
 */
type PlantShape = 'rounded' | 'pyramidal' | 'weeping' | 'vase' | 'columnar';

/**
 * Plant render system configuration
 */
export interface PlantRenderSystemConfig {
  autoAddToScene: boolean;
  enableShadows: boolean;
  detailLevel: 'low' | 'medium' | 'high';
  showTrunks: boolean;
  showCanopies: boolean;
}

const DEFAULT_CONFIG: PlantRenderSystemConfig = {
  autoAddToScene: true,
  enableShadows: true,
  detailLevel: 'medium',
  showTrunks: true,
  showCanopies: true
};

/**
 * PlantRenderSystem
 *
 * NOTE: This and InstancedPlantRenderSystem both match ['Transform','PlantData'].
 * Register only ONE plant renderer — registering both renders every plant twice.
 * InstancedPlantRenderSystem is the canonical, performant choice (one draw call
 * per species); this group-based renderer is the varied-species / low-count
 * alternative and is what PlantDataBridge wires up.
 */
export class PlantRenderSystem extends BaseSystem {
  readonly name = 'PlantRenderSystem';
  readonly requiredComponents: ComponentType[] = ['Transform', 'PlantData'];
  readonly priority = SystemPriority.RENDER;

  private config: PlantRenderSystemConfig;
  private scene?: THREE.Scene;
  private plantCache: Map<string, THREE.Group> = new Map();

  constructor(scene?: THREE.Scene, config: Partial<PlantRenderSystemConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.scene = scene;
  }

  /**
   * Main update - sync all plant entities to meshes
   */
  update(world: World, deltaTime: number): ComponentUpdate[] {
    const entities = this.queryEntities(world);

    for (const entity of entities) {
      const transform = world.getComponent<TransformComponent>(entity.id, 'Transform');
      const plantData = world.getComponent<PlantDataComponent>(entity.id, 'PlantData');
      const selection = world.getComponent<SelectionComponent>(entity.id, 'Selection');

      if (!transform || !plantData) continue;

      // Create plant if it doesn't exist
      if (!this.plantCache.has(entity.id)) {
        this.createPlant(entity.id, transform, plantData);
      }

      // Update plant from components
      this.updatePlant(entity.id, transform, plantData, selection);
    }

    // Clean up plants for removed entities
    this.cleanupPlants(entities);

    return [];
  }

  /**
   * Create a new plant group from ECS components
   */
  private createPlant(
    entityId: string,
    transform: TransformComponent,
    plantData: PlantDataComponent
  ): void {
    const species = getPlantSpecies(plantData.speciesId);
    if (!species) return;

    const size = calculatePlantSize(plantData.speciesId, plantData.age, transform.scale.x);
    const group = new THREE.Group();

    // Set transform
    group.position.set(transform.position.x, transform.position.y, transform.position.z);
    group.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
    group.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);

    // Store entity ID
    group.userData.entityId = entityId;

    // Create meshes based on shape type
    const meshes = this.createPlantMeshes(species.growthData.shapeType, size, species.color, species.category);
    meshes.forEach(mesh => group.add(mesh));

    // Cache plant
    this.plantCache.set(entityId, group);

    // Add to scene
    if (this.scene && this.config.autoAddToScene) {
      this.scene.add(group);
    }
  }

  /**
   * Update plant from ECS components
   */
  private updatePlant(
    entityId: string,
    transform: TransformComponent,
    plantData: PlantDataComponent,
    selection?: SelectionComponent
  ): void {
    const group = this.plantCache.get(entityId);
    if (!group) return;

    // Update transform
    group.position.set(transform.position.x, transform.position.y, transform.position.z);
    group.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
    group.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);

    // Update visibility
    if (selection) {
      group.visible = selection.visible;
    }

    // Update selection highlight
    if (selection?.selected) {
      this.highlightPlant(group, true);
    } else {
      this.highlightPlant(group, false);
    }

    // Check if plant needs recreation (age/scale changed significantly)
    const species = getPlantSpecies(plantData.speciesId);
    if (species) {
      const newSize = calculatePlantSize(plantData.speciesId, plantData.age, transform.scale.x);
      const currentSize = group.userData.plantSize;

      // Recreate if size changed significantly
      if (!currentSize ||
          Math.abs(newSize.height - currentSize.height) > 0.5 ||
          Math.abs(newSize.width - currentSize.width) > 0.5) {
        this.recreatePlant(entityId, transform, plantData);
      }
    }
  }

  /**
   * Create plant meshes based on shape type
   */
  private createPlantMeshes(
    shapeType: string,
    size: { width: number; height: number },
    color: string,
    category: string
  ): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    const heightScale = size.height / 5;
    const widthScale = size.width / 5;

    // Get shape-specific parameters
    const trunkHeight = category === 'tree' ? 0.6 : category === 'shrub' ? 0.3 : 0.1;
    const canopyStart = category === 'tree' ? 0.8 : category === 'shrub' ? 0.6 : 0.5;

    // Create trunk (for trees and shrubs)
    if (this.config.showTrunks && category !== 'ground-cover' && category !== 'perennial') {
      const trunk = this.createTrunk(widthScale, heightScale * trunkHeight);
      trunk.position.y = heightScale * (trunkHeight / 2);
      meshes.push(trunk);
    }

    // Create canopy based on shape type
    if (this.config.showCanopies) {
      const canopyMeshes = this.createCanopy(
        shapeType,
        widthScale,
        heightScale,
        canopyStart,
        color,
        size
      );
      meshes.push(...canopyMeshes);
    }

    return meshes;
  }

  /**
   * Create trunk mesh
   */
  private createTrunk(widthScale: number, height: number): THREE.Mesh {
    const geometry = new THREE.CylinderGeometry(
      0.15 * widthScale,
      0.2 * widthScale,
      height,
      8
    );
    const material = new THREE.MeshStandardMaterial({
      color: 0x654321,
      roughness: 0.9
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = this.config.enableShadows;
    mesh.userData.partType = 'trunk';

    return mesh;
  }

  /**
   * Create canopy meshes based on shape type
   */
  private createCanopy(
    shapeType: string,
    widthScale: number,
    heightScale: number,
    canopyStart: number,
    color: string,
    size: { width: number; height: number }
  ): THREE.Mesh[] {
    switch (shapeType) {
      case 'rounded':
        return this.createRoundedCanopy(widthScale, heightScale, canopyStart, color, size);
      case 'pyramidal':
        return this.createPyramidalCanopy(widthScale, heightScale, canopyStart, color);
      case 'weeping':
        return this.createWeepingCanopy(widthScale, heightScale, canopyStart, color);
      case 'vase':
        return this.createVaseCanopy(widthScale, heightScale, canopyStart, color);
      case 'columnar':
        return this.createColumnarCanopy(widthScale, heightScale, canopyStart, color);
      default:
        return this.createDefaultCanopy(widthScale, heightScale, canopyStart, color);
    }
  }

  /**
   * Create rounded canopy (spherical)
   */
  private createRoundedCanopy(
    widthScale: number,
    heightScale: number,
    canopyStart: number,
    color: string,
    size: { width: number; height: number }
  ): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    const segments = this.config.detailLevel === 'high' ? 16 : this.config.detailLevel === 'medium' ? 12 : 8;

    // Main canopy sphere
    const mainGeometry = new THREE.SphereGeometry(widthScale * 0.5, segments, segments);
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8
    });
    const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
    mainMesh.position.y = heightScale * canopyStart;
    mainMesh.castShadow = this.config.enableShadows;
    mainMesh.receiveShadow = this.config.enableShadows;
    mainMesh.userData.partType = 'canopy-main';
    meshes.push(mainMesh);

    // Additional spheres for volume (only for larger plants)
    if (size.width > 3 && this.config.detailLevel !== 'low') {
      const subSphere1 = this.createSubSphere(
        widthScale * 0.35,
        segments - 2,
        [-widthScale * 0.25, heightScale * (canopyStart - 0.1), widthScale * 0.2],
        this.adjustColorBrightness(color, -10)
      );
      meshes.push(subSphere1);

      const subSphere2 = this.createSubSphere(
        widthScale * 0.38,
        segments - 2,
        [widthScale * 0.25, heightScale * (canopyStart - 0.05), -widthScale * 0.2],
        this.adjustColorBrightness(color, 5)
      );
      meshes.push(subSphere2);
    }

    return meshes;
  }

  /**
   * Create pyramidal canopy (cone)
   */
  private createPyramidalCanopy(
    widthScale: number,
    heightScale: number,
    canopyStart: number,
    color: string
  ): THREE.Mesh[] {
    const segments = this.config.detailLevel === 'high' ? 16 : this.config.detailLevel === 'medium' ? 12 : 8;

    const geometry = new THREE.ConeGeometry(
      widthScale * 0.4,
      heightScale * 0.7,
      segments,
      1
    );
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = heightScale * (canopyStart + 0.35);
    mesh.castShadow = this.config.enableShadows;
    mesh.receiveShadow = this.config.enableShadows;
    mesh.userData.partType = 'canopy-main';

    return [mesh];
  }

  /**
   * Create weeping canopy (inverted cone + sphere)
   */
  private createWeepingCanopy(
    widthScale: number,
    heightScale: number,
    canopyStart: number,
    color: string
  ): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    const segments = this.config.detailLevel === 'high' ? 16 : this.config.detailLevel === 'medium' ? 12 : 8;

    // Top sphere
    const topGeometry = new THREE.SphereGeometry(widthScale * 0.3, segments, segments);
    const topMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const topMesh = new THREE.Mesh(topGeometry, topMaterial);
    topMesh.position.y = heightScale * canopyStart;
    topMesh.castShadow = this.config.enableShadows;
    topMesh.receiveShadow = this.config.enableShadows;
    topMesh.userData.partType = 'canopy-top';
    meshes.push(topMesh);

    // Weeping branches (inverted cone)
    const branchesGeometry = new THREE.ConeGeometry(
      widthScale * 0.5,
      heightScale * 0.4,
      segments,
      1
    );
    const branchesMaterial = new THREE.MeshStandardMaterial({
      color: this.adjustColorBrightness(color, -20),
      roughness: 0.85
    });
    const branchesMesh = new THREE.Mesh(branchesGeometry, branchesMaterial);
    branchesMesh.position.y = heightScale * (canopyStart - 0.3);
    branchesMesh.rotation.z = Math.PI;
    branchesMesh.castShadow = this.config.enableShadows;
    branchesMesh.receiveShadow = this.config.enableShadows;
    branchesMesh.userData.partType = 'canopy-branches';
    meshes.push(branchesMesh);

    return meshes;
  }

  /**
   * Create vase canopy (narrow bottom, wide top)
   */
  private createVaseCanopy(
    widthScale: number,
    heightScale: number,
    canopyStart: number,
    color: string
  ): THREE.Mesh[] {
    const segments = this.config.detailLevel === 'high' ? 16 : this.config.detailLevel === 'medium' ? 12 : 8;

    const geometry = new THREE.CylinderGeometry(
      widthScale * 0.5,
      widthScale * 0.2,
      heightScale * 0.6,
      segments,
      1
    );
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = heightScale * (canopyStart + 0.3);
    mesh.castShadow = this.config.enableShadows;
    mesh.receiveShadow = this.config.enableShadows;
    mesh.userData.partType = 'canopy-main';

    return [mesh];
  }

  /**
   * Create columnar canopy (tall cylinder)
   */
  private createColumnarCanopy(
    widthScale: number,
    heightScale: number,
    canopyStart: number,
    color: string
  ): THREE.Mesh[] {
    const segments = this.config.detailLevel === 'high' ? 16 : this.config.detailLevel === 'medium' ? 12 : 8;

    const geometry = new THREE.CylinderGeometry(
      widthScale * 0.25,
      widthScale * 0.3,
      heightScale * 0.8,
      segments,
      1
    );
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = heightScale * (canopyStart + 0.4);
    mesh.castShadow = this.config.enableShadows;
    mesh.receiveShadow = this.config.enableShadows;
    mesh.userData.partType = 'canopy-main';

    return [mesh];
  }

  /**
   * Create default canopy (simple sphere)
   */
  private createDefaultCanopy(
    widthScale: number,
    heightScale: number,
    canopyStart: number,
    color: string
  ): THREE.Mesh[] {
    const segments = this.config.detailLevel === 'high' ? 16 : this.config.detailLevel === 'medium' ? 12 : 8;

    const geometry = new THREE.SphereGeometry(widthScale * 0.4, segments, segments);
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = heightScale * canopyStart;
    mesh.castShadow = this.config.enableShadows;
    mesh.receiveShadow = this.config.enableShadows;
    mesh.userData.partType = 'canopy-main';

    return [mesh];
  }

  /**
   * Create a sub-sphere for canopy detail
   */
  private createSubSphere(
    radius: number,
    segments: number,
    position: number[],
    color: string
  ): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = this.config.enableShadows;
    mesh.receiveShadow = this.config.enableShadows;
    mesh.userData.partType = 'canopy-detail';

    return mesh;
  }

  /**
   * Highlight plant on selection
   */
  private highlightPlant(group: THREE.Group, selected: boolean): void {
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial;
        if (selected) {
          material.emissive.set(material.color);
          material.emissiveIntensity = 0.2;
        } else {
          material.emissive.set(0x000000);
          material.emissiveIntensity = 0;
        }
      }
    });
  }

  /**
   * Adjust color brightness
   */
  private adjustColorBrightness(color: string, amount: number): string {
    const col = new THREE.Color(color);
    const hsl = { h: 0, s: 0, l: 0 };
    col.getHSL(hsl);
    hsl.l = Math.max(0, Math.min(1, hsl.l + amount / 100));
    col.setHSL(hsl.h, hsl.s, hsl.l);
    return '#' + col.getHexString();
  }

  /**
   * Recreate plant (when size changes significantly)
   */
  private recreatePlant(
    entityId: string,
    transform: TransformComponent,
    plantData: PlantDataComponent
  ): void {
    this.removePlant(entityId);
    this.createPlant(entityId, transform, plantData);
  }

  /**
   * Clean up plants for removed entities
   */
  private cleanupPlants(activeEntities: Entity[]): void {
    const activeIds = new Set(activeEntities.map(e => e.id));

    for (const [entityId] of this.plantCache.entries()) {
      if (!activeIds.has(entityId)) {
        this.removePlant(entityId);
      }
    }
  }

  /**
   * Remove and dispose a plant
   */
  private removePlant(entityId: string): void {
    const group = this.plantCache.get(entityId);
    if (!group) return;

    // Remove from scene
    if (this.scene) {
      this.scene.remove(group);
    }

    // Dispose all meshes
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });

    // Remove from cache
    this.plantCache.delete(entityId);
  }

  /**
   * Get plant group for an entity
   */
  getPlant(entityId: string): THREE.Group | undefined {
    return this.plantCache.get(entityId);
  }

  /**
   * Set scene
   */
  setScene(scene: THREE.Scene): void {
    this.scene = scene;

    if (this.config.autoAddToScene) {
      for (const group of this.plantCache.values()) {
        scene.add(group);
      }
    }
  }

  /**
   * Dispose all plants
   */
  dispose(): void {
    const entityIds = Array.from(this.plantCache.keys());
    for (const entityId of entityIds) {
      this.removePlant(entityId);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PlantRenderSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      cachedPlants: this.plantCache.size,
      hasScene: !!this.scene,
      config: this.config
    };
  }
}
