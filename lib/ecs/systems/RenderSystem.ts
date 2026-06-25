/**
 * RenderSystem - Bridge between ECS and Three.js
 *
 * Responsibilities:
 * - Create Three.js meshes from ECS components
 * - Sync component data to mesh properties
 * - Manage mesh lifecycle (create/update/destroy)
 * - Handle visibility and rendering state
 *
 * This system is the ONLY place where ECS data becomes Three.js objects
 */

import * as THREE from 'three';
import { BaseSystem, ComponentUpdate, SystemPriority } from '../core/System';
import { World } from '../core/World';
import { Entity } from '../core/Entity';
import { ComponentType } from '../core/Component';
import {
  TransformComponent
} from '../components/TransformComponent';
import {
  GeometryComponent,
  GeometryType
} from '../components/GeometryComponent';
import {
  MaterialComponent,
  MaterialType,
  MaterialProperties,
  colorToHex
} from '../components/MaterialComponent';
import {
  SelectionComponent
} from '../components/SelectionComponent';

/**
 * Render system configuration
 */
export interface RenderSystemConfig {
  // Automatically add meshes to scene when created
  autoAddToScene: boolean;

  // Enable shadows globally
  enableShadows: boolean;

  // Default render order
  defaultRenderOrder: number;

  // Frustum culling
  frustumCulled: boolean;
}

const DEFAULT_CONFIG: RenderSystemConfig = {
  autoAddToScene: true,
  enableShadows: true,
  defaultRenderOrder: 0,
  frustumCulled: true
};

/**
 * RenderSystem - Syncs ECS components to Three.js meshes
 */
export class RenderSystem extends BaseSystem {
  readonly name: string = 'RenderSystem'; // widened so subclasses can override
  readonly requiredComponents: ComponentType[] = ['Transform', 'Geometry', 'Material'];
  readonly priority = SystemPriority.RENDER;

  private config: RenderSystemConfig;
  private scene?: THREE.Scene;
  private meshCache: Map<string, THREE.Mesh> = new Map();
  private textureCache: Map<string, THREE.Texture> = new Map();

  constructor(scene?: THREE.Scene, config: Partial<RenderSystemConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.scene = scene;
  }

  /**
   * Main update - sync all components to meshes
   */
  update(world: World, deltaTime: number): ComponentUpdate[] {
    const entities = this.queryEntities(world);

    for (const entity of entities) {
      const transform = world.getComponent<TransformComponent>(entity.id, 'Transform');
      const geometry = world.getComponent<GeometryComponent>(entity.id, 'Geometry');
      const material = world.getComponent<MaterialComponent>(entity.id, 'Material');
      const selection = world.getComponent<SelectionComponent>(entity.id, 'Selection');

      if (!transform || !geometry || !material) continue;

      // Create mesh if it doesn't exist
      if (!this.meshCache.has(entity.id)) {
        this.createMesh(entity.id, geometry, material, transform);
      }

      // Update mesh from components
      this.updateMesh(entity.id, transform, material, selection);
    }

    // Clean up meshes for removed entities
    this.cleanupMeshes(entities);

    return []; // Render system doesn't modify components
  }

  /**
   * Create a new Three.js mesh from ECS components
   */
  private createMesh(
    entityId: string,
    geometry: GeometryComponent,
    material: MaterialComponent,
    transform: TransformComponent
  ): void {
    const threeGeometry = this.createThreeGeometry(geometry);
    const threeMaterial = this.createThreeMaterial(material);
    const mesh = new THREE.Mesh(threeGeometry, threeMaterial);

    // Set initial transform
    mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
    mesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
    mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);

    // Configure mesh
    mesh.castShadow = this.config.enableShadows && (material.properties.castShadow ?? true);
    mesh.receiveShadow = this.config.enableShadows && (material.properties.receiveShadow ?? true);
    mesh.frustumCulled = this.config.frustumCulled;
    mesh.renderOrder = this.config.defaultRenderOrder;

    // Store entity ID for raycasting
    mesh.userData.entityId = entityId;

    // Cache mesh
    this.meshCache.set(entityId, mesh);

    // Add to scene
    if (this.scene && this.config.autoAddToScene) {
      this.scene.add(mesh);
    }
  }

  /**
   * Update mesh from ECS components
   */
  private updateMesh(
    entityId: string,
    transform: TransformComponent,
    material: MaterialComponent,
    selection?: SelectionComponent
  ): void {
    const mesh = this.meshCache.get(entityId);
    if (!mesh) return;

    // Update transform
    mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
    mesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
    mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);

    // Update material properties
    this.updateThreeMaterial(mesh.material as THREE.Material, material);

    // Update visibility from selection component
    if (selection) {
      mesh.visible = selection.visible;
    }
  }

  /**
   * Create Three.js geometry from ECS geometry component
   */
  private createThreeGeometry(geometry: GeometryComponent): THREE.BufferGeometry {
    const params = geometry.parameters as any; // Type assertion for geometry parameters

    switch (geometry.geometryType) {
      case 'sphere':
        return new THREE.SphereGeometry(
          params.radius ?? 1,
          params.widthSegments ?? 32,
          params.heightSegments ?? 32
        );

      case 'box':
        return new THREE.BoxGeometry(
          params.width ?? 1,
          params.height ?? 1,
          params.depth ?? 1,
          params.widthSegments ?? 1,
          params.heightSegments ?? 1,
          params.depthSegments ?? 1
        );

      case 'cylinder':
        return new THREE.CylinderGeometry(
          params.radiusTop ?? 1,
          params.radiusBottom ?? 1,
          params.height ?? 1,
          params.radialSegments ?? 32,
          params.heightSegments ?? 1
        );

      case 'cone':
        return new THREE.ConeGeometry(
          params.radius ?? 1,
          params.height ?? 1,
          params.radialSegments ?? 32,
          params.heightSegments ?? 1
        );

      case 'plane':
        return new THREE.PlaneGeometry(
          params.width ?? 1,
          params.height ?? 1,
          params.widthSegments ?? 1,
          params.heightSegments ?? 1
        );

      case 'torus':
        return new THREE.TorusGeometry(
          params.radius ?? 1,
          params.tube ?? 0.4,
          params.radialSegments ?? 12,
          params.tubularSegments ?? 48
        );

      case 'custom':
        // Custom geometry should be provided via assetId
        console.warn(`Custom geometry not yet supported for entity`);
        return new THREE.BoxGeometry(1, 1, 1);

      default:
        console.warn(`Unknown geometry type: ${geometry.geometryType}`);
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }

  /**
   * Create Three.js material from ECS material component
   */
  private createThreeMaterial(material: MaterialComponent): THREE.Material {
    const props = material.properties;

    switch (material.materialType) {
      case 'standard':
        return this.createStandardMaterial(props);

      case 'physical':
        return this.createPhysicalMaterial(props);

      case 'basic':
        return this.createBasicMaterial(props);

      case 'lambert':
        return this.createLambertMaterial(props);

      case 'custom':
        console.warn('Custom materials not yet supported, falling back to standard');
        return this.createStandardMaterial(props);

      default:
        return this.createStandardMaterial(props);
    }
  }

  /**
   * Create Three.js MeshStandardMaterial (PBR)
   */
  private createStandardMaterial(props: MaterialProperties): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial();

    // Base color
    if (props.color) {
      material.color.set(colorToHex(props.color));
    }

    // PBR properties
    if (props.roughness !== undefined) material.roughness = props.roughness;
    if (props.metalness !== undefined) material.metalness = props.metalness;

    // Emission
    if (props.emissive) {
      material.emissive.set(colorToHex(props.emissive));
      material.emissiveIntensity = props.emissiveIntensity ?? 1;
    }

    // Opacity
    if (props.opacity !== undefined) {
      material.opacity = props.opacity;
      material.transparent = props.transparent ?? (props.opacity < 1);
    }

    // Texture maps (would load from assetId)
    // TODO: Implement texture loading via asset manager

    // Rendering
    if (props.side === 'back') material.side = THREE.BackSide;
    else if (props.side === 'double') material.side = THREE.DoubleSide;
    else material.side = THREE.FrontSide;

    if (props.wireframe) material.wireframe = true;

    return material;
  }

  /**
   * Create Three.js MeshPhysicalMaterial (advanced PBR)
   */
  private createPhysicalMaterial(props: MaterialProperties): THREE.MeshPhysicalMaterial {
    const material = new THREE.MeshPhysicalMaterial();

    // Same as standard material
    if (props.color) material.color.set(colorToHex(props.color));
    if (props.roughness !== undefined) material.roughness = props.roughness;
    if (props.metalness !== undefined) material.metalness = props.metalness;
    if (props.emissive) {
      material.emissive.set(colorToHex(props.emissive));
      material.emissiveIntensity = props.emissiveIntensity ?? 1;
    }
    if (props.opacity !== undefined) {
      material.opacity = props.opacity;
      material.transparent = props.transparent ?? (props.opacity < 1);
    }

    // Side and wireframe
    if (props.side === 'back') material.side = THREE.BackSide;
    else if (props.side === 'double') material.side = THREE.DoubleSide;
    if (props.wireframe) material.wireframe = true;

    return material;
  }

  /**
   * Create Three.js MeshBasicMaterial (no lighting)
   */
  private createBasicMaterial(props: MaterialProperties): THREE.MeshBasicMaterial {
    const material = new THREE.MeshBasicMaterial();

    if (props.color) material.color.set(colorToHex(props.color));
    if (props.opacity !== undefined) {
      material.opacity = props.opacity;
      material.transparent = props.transparent ?? (props.opacity < 1);
    }

    if (props.side === 'back') material.side = THREE.BackSide;
    else if (props.side === 'double') material.side = THREE.DoubleSide;
    if (props.wireframe) material.wireframe = true;

    return material;
  }

  /**
   * Create Three.js MeshLambertMaterial (simple lighting)
   */
  private createLambertMaterial(props: MaterialProperties): THREE.MeshLambertMaterial {
    const material = new THREE.MeshLambertMaterial();

    if (props.color) material.color.set(colorToHex(props.color));
    if (props.emissive) {
      material.emissive.set(colorToHex(props.emissive));
    }
    if (props.opacity !== undefined) {
      material.opacity = props.opacity;
      material.transparent = props.transparent ?? (props.opacity < 1);
    }

    if (props.side === 'back') material.side = THREE.BackSide;
    else if (props.side === 'double') material.side = THREE.DoubleSide;
    if (props.wireframe) material.wireframe = true;

    return material;
  }

  /**
   * Update Three.js material from ECS material component
   */
  private updateThreeMaterial(threeMaterial: THREE.Material, material: MaterialComponent): void {
    const props = material.properties;

    // Update common properties
    if ('color' in threeMaterial && props.color) {
      (threeMaterial as any).color.set(colorToHex(props.color));
    }

    if ('emissive' in threeMaterial && props.emissive) {
      (threeMaterial as any).emissive.set(colorToHex(props.emissive));
    }

    if ('emissiveIntensity' in threeMaterial && props.emissiveIntensity !== undefined) {
      (threeMaterial as any).emissiveIntensity = props.emissiveIntensity;
    }

    if ('roughness' in threeMaterial && props.roughness !== undefined) {
      (threeMaterial as any).roughness = props.roughness;
    }

    if ('metalness' in threeMaterial && props.metalness !== undefined) {
      (threeMaterial as any).metalness = props.metalness;
    }

    if (props.opacity !== undefined) {
      threeMaterial.opacity = props.opacity;
      threeMaterial.transparent = props.transparent ?? (props.opacity < 1);
    }

    if (props.wireframe !== undefined && 'wireframe' in threeMaterial) {
      (threeMaterial as any).wireframe = props.wireframe;
    }

    // Mark material for update
    threeMaterial.needsUpdate = true;
  }

  /**
   * Clean up meshes for removed entities
   */
  private cleanupMeshes(activeEntities: Entity[]): void {
    const activeIds = new Set(activeEntities.map(e => e.id));

    for (const [entityId, mesh] of this.meshCache.entries()) {
      if (!activeIds.has(entityId)) {
        this.removeMesh(entityId);
      }
    }
  }

  /**
   * Remove and dispose a mesh
   */
  private removeMesh(entityId: string): void {
    const mesh = this.meshCache.get(entityId);
    if (!mesh) return;

    // Remove from scene
    if (this.scene) {
      this.scene.remove(mesh);
    }

    // Dispose resources
    mesh.geometry.dispose();
    if (mesh.material instanceof THREE.Material) {
      mesh.material.dispose();
    } else if (Array.isArray(mesh.material)) {
      mesh.material.forEach(mat => mat.dispose());
    }

    // Remove from cache
    this.meshCache.delete(entityId);
  }

  /**
   * Get Three.js mesh for an entity
   */
  getMesh(entityId: string): THREE.Mesh | undefined {
    return this.meshCache.get(entityId);
  }

  /**
   * Get all cached meshes
   */
  getAllMeshes(): THREE.Mesh[] {
    return Array.from(this.meshCache.values());
  }

  /**
   * Set the Three.js scene
   */
  setScene(scene: THREE.Scene): void {
    this.scene = scene;

    // Add all cached meshes to scene
    if (this.config.autoAddToScene) {
      for (const mesh of this.meshCache.values()) {
        scene.add(mesh);
      }
    }
  }

  /**
   * Get current scene
   */
  getScene(): THREE.Scene | undefined {
    return this.scene;
  }

  /**
   * Raycast to find entity at screen position
   */
  raycast(
    raycaster: THREE.Raycaster,
    recursive: boolean = false
  ): { entityId: string; mesh: THREE.Mesh; distance: number }[] {
    const meshes = this.getAllMeshes();
    const intersects = raycaster.intersectObjects(meshes, recursive);

    return intersects.map(intersect => ({
      entityId: (intersect.object as THREE.Mesh).userData.entityId,
      mesh: intersect.object as THREE.Mesh,
      distance: intersect.distance
    }));
  }

  /**
   * Force refresh of a specific mesh
   */
  refreshMesh(world: World, entityId: string): void {
    const transform = world.getComponent<TransformComponent>(entityId, 'Transform');
    const material = world.getComponent<MaterialComponent>(entityId, 'Material');
    const selection = world.getComponent<SelectionComponent>(entityId, 'Selection');

    if (transform && material) {
      this.updateMesh(entityId, transform, material, selection);
    }
  }

  /**
   * Recreate a mesh (useful when geometry changes)
   */
  recreateMesh(world: World, entityId: string): void {
    // Remove old mesh
    this.removeMesh(entityId);

    // Create new mesh
    const transform = world.getComponent<TransformComponent>(entityId, 'Transform');
    const geometry = world.getComponent<GeometryComponent>(entityId, 'Geometry');
    const material = world.getComponent<MaterialComponent>(entityId, 'Material');

    if (transform && geometry && material) {
      this.createMesh(entityId, geometry, material, transform);
    }
  }

  /**
   * Dispose all meshes and clean up
   */
  dispose(): void {
    const entityIds = Array.from(this.meshCache.keys());
    for (const entityId of entityIds) {
      this.removeMesh(entityId);
    }

    // Clean up texture cache
    for (const texture of this.textureCache.values()) {
      texture.dispose();
    }
    this.textureCache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RenderSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get system statistics
   */
  getStats() {
    return {
      cachedMeshes: this.meshCache.size,
      cachedTextures: this.textureCache.size,
      hasScene: !!this.scene,
      config: this.config
    };
  }
}
