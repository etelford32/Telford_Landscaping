/**
 * EnhancedRenderSystem - RenderSystem with AssetManager integration
 *
 * Extends the base RenderSystem to support:
 * - Loading 3D models from AssetManager
 * - Applying PBR textures from AssetManager
 * - LOD (Level of Detail) support
 * - Instanced rendering for performance
 * - Model caching and reuse
 */

import * as THREE from 'three';
import { RenderSystem, RenderSystemConfig } from './RenderSystem';
import { World } from '../core/World';
import { Entity } from '../core/Entity';
import { ComponentUpdate } from '../core/System';
import {
  TransformComponent,
  GeometryComponent,
  MaterialComponent,
  SelectionComponent,
  AssetComponent
} from '../components';
import {
  AssetManager,
  ModelAsset,
  TextureAsset
} from '../assets';

/**
 * Enhanced render system configuration
 */
export interface EnhancedRenderSystemConfig extends RenderSystemConfig {
  // Enable LOD system
  enableLOD: boolean;

  // LOD update frequency (milliseconds)
  lodUpdateInterval: number;

  // Camera for LOD distance calculations
  camera?: THREE.Camera;

  // Enable instanced rendering
  enableInstancing: boolean;
}

const DEFAULT_ENHANCED_CONFIG: EnhancedRenderSystemConfig = {
  autoAddToScene: true,
  enableShadows: true,
  defaultRenderOrder: 0,
  frustumCulled: true,
  enableLOD: true,
  lodUpdateInterval: 100,
  enableInstancing: false
};

/**
 * EnhancedRenderSystem - Asset-aware rendering
 */
export class EnhancedRenderSystem extends RenderSystem {
  private enhancedConfig: EnhancedRenderSystemConfig;
  private assetManager?: AssetManager;

  // LOD management
  private lodObjects: Map<string, THREE.LOD> = new Map();
  private lastLODUpdate: number = 0;

  // Model cache (shared models for instancing)
  private modelCache: Map<string, THREE.Group> = new Map();

  // Instance management
  private instancedMeshes: Map<string, THREE.InstancedMesh> = new Map();
  private instanceMatrices: Map<string, Map<string, THREE.Matrix4>> = new Map();

  constructor(
    scene?: THREE.Scene,
    assetManager?: AssetManager,
    config: Partial<EnhancedRenderSystemConfig> = {}
  ) {
    const mergedConfig = { ...DEFAULT_ENHANCED_CONFIG, ...config };
    super(scene, mergedConfig);

    this.enhancedConfig = mergedConfig;
    this.assetManager = assetManager;
  }

  /**
   * Update with asset-aware rendering
   */
  update(world: World, deltaTime: number): ComponentUpdate[] {
    // First, handle entities with Asset components
    this.updateAssetEntities(world);

    // Then run base render system update
    const updates = super.update(world, deltaTime);

    // Update LODs if enabled
    if (
      this.enhancedConfig.enableLOD &&
      this.enhancedConfig.camera &&
      Date.now() - this.lastLODUpdate > this.enhancedConfig.lodUpdateInterval
    ) {
      this.updateLODs(this.enhancedConfig.camera);
      this.lastLODUpdate = Date.now();
    }

    return updates;
  }

  /**
   * Update entities with Asset components
   */
  private updateAssetEntities(world: World): void {
    // Query entities with both Asset and Transform components
    const entities = world.queryEntities(['Asset', 'Transform']);

    for (const entity of entities) {
      const asset = world.getComponent<AssetComponent>(entity.id, 'Asset');
      const transform = world.getComponent<TransformComponent>(
        entity.id,
        'Transform'
      );

      if (!asset || !transform || !this.assetManager) continue;

      // Check if we need to load/create model
      if (asset.modelId && !this.getMesh(entity.id)) {
        this.createModelMesh(entity.id, asset, transform);
      }

      // Update texture if needed
      if (asset.textureId) {
        this.applyTexture(entity.id, asset.textureId);
      }
    }
  }

  /**
   * Create mesh from model asset
   */
  private async createModelMesh(
    entityId: string,
    asset: AssetComponent,
    transform: TransformComponent
  ): Promise<void> {
    if (!this.assetManager || !asset.modelId) return;

    try {
      // Check if model is already cached
      let model = this.modelCache.get(asset.modelId);

      // If not cached, load it
      if (!model) {
        const modelAsset = await this.assetManager.load<ModelAsset>(
          asset.modelId
        );

        if (!modelAsset.model) {
          console.error(`Model ${asset.modelId} failed to load`);
          return;
        }

        // Cache the model
        model = modelAsset.model;
        this.modelCache.set(asset.modelId, model);
      }

      // Create appropriate mesh type
      if (asset.useLOD && this.enhancedConfig.enableLOD) {
        this.createLODMesh(entityId, asset, model, transform);
      } else if (
        asset.instanceable &&
        this.enhancedConfig.enableInstancing
      ) {
        this.addToInstancedMesh(entityId, asset, model, transform);
      } else {
        // Regular mesh (clone model)
        const clonedModel = model.clone(true);
        this.addModelToScene(entityId, clonedModel, transform);
      }
    } catch (error) {
      console.error(
        `Failed to create model mesh for ${entityId}:`,
        error
      );
    }
  }

  /**
   * Create LOD mesh
   */
  private async createLODMesh(
    entityId: string,
    asset: AssetComponent,
    baseModel: THREE.Group,
    transform: TransformComponent
  ): Promise<void> {
    if (!this.assetManager || !asset.modelId) return;

    const lod = new THREE.LOD();

    try {
      // Load model asset to get LOD levels
      const modelAsset = await this.assetManager.load<ModelAsset>(
        asset.modelId
      );

      if (modelAsset.lods && modelAsset.lods.length > 0) {
        // Add each LOD level
        for (const lodLevel of modelAsset.lods) {
          const lodModel = lodLevel.model.clone(true);
          lod.addLevel(lodModel, lodLevel.distance);
        }
      } else {
        // No LOD levels defined, just use base model
        lod.addLevel(baseModel.clone(true), 0);
      }

      // Set transform
      lod.position.set(
        transform.position.x,
        transform.position.y,
        transform.position.z
      );
      lod.rotation.set(
        transform.rotation.x,
        transform.rotation.y,
        transform.rotation.z
      );
      lod.scale.set(
        transform.scale.x,
        transform.scale.y,
        transform.scale.z
      );

      // Store entity ID for raycasting
      lod.userData.entityId = entityId;

      // Add to scene
      const scene = this.getScene();
      if (scene) {
        scene.add(lod);
      }

      // Cache LOD object
      this.lodObjects.set(entityId, lod);
    } catch (error) {
      console.error(`Failed to create LOD for ${entityId}:`, error);
    }
  }

  /**
   * Add model to scene as regular mesh
   */
  private addModelToScene(
    entityId: string,
    model: THREE.Group,
    transform: TransformComponent
  ): void {
    // Set transform
    model.position.set(
      transform.position.x,
      transform.position.y,
      transform.position.z
    );
    model.rotation.set(
      transform.rotation.x,
      transform.rotation.y,
      transform.rotation.z
    );
    model.scale.set(
      transform.scale.x,
      transform.scale.y,
      transform.scale.z
    );

    // Store entity ID in all meshes for raycasting
    model.traverse((child) => {
      child.userData.entityId = entityId;
    });

    // Add to scene
    const scene = this.getScene();
    if (scene) {
      scene.add(model);
    }

    // Store reference (using first mesh in the group)
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && !this.getMesh(entityId)) {
        // Store in parent cache for compatibility
        (this as any).meshCache.set(entityId, child);
      }
    });
  }

  /**
   * Add entity to instanced mesh (for performance with many identical objects)
   */
  private addToInstancedMesh(
    entityId: string,
    asset: AssetComponent,
    model: THREE.Group,
    transform: TransformComponent
  ): void {
    // TODO: Implement instanced rendering
    // This is more complex and requires batching multiple entities
    // For now, fall back to regular mesh
    this.addModelToScene(entityId, model.clone(true), transform);
  }

  /**
   * Apply texture from asset manager
   */
  private async applyTexture(
    entityId: string,
    textureId: string
  ): Promise<void> {
    if (!this.assetManager) return;

    try {
      const textureAsset = await this.assetManager.load<TextureAsset>(
        textureId
      );

      const mesh = this.getMesh(entityId);
      if (!mesh || !textureAsset.maps) return;

      // Apply PBR maps to material
      const material = mesh.material;
      if (material instanceof THREE.MeshStandardMaterial) {
        if (textureAsset.maps.albedo) {
          material.map = textureAsset.maps.albedo;
        }
        if (textureAsset.maps.normal) {
          material.normalMap = textureAsset.maps.normal;
        }
        if (textureAsset.maps.roughness) {
          material.roughnessMap = textureAsset.maps.roughness;
        }
        if (textureAsset.maps.metalness) {
          material.metalnessMap = textureAsset.maps.metalness;
        }
        if (textureAsset.maps.ao) {
          material.aoMap = textureAsset.maps.ao;
        }
        if (textureAsset.maps.emissive) {
          material.emissiveMap = textureAsset.maps.emissive;
        }

        material.needsUpdate = true;
      }
    } catch (error) {
      console.error(
        `Failed to apply texture ${textureId} to ${entityId}:`,
        error
      );
    }
  }

  /**
   * Update LOD visibility based on camera distance
   */
  private updateLODs(camera: THREE.Camera): void {
    for (const lod of this.lodObjects.values()) {
      lod.update(camera);
    }
  }

  /**
   * Set camera for LOD calculations
   */
  setCamera(camera: THREE.Camera): void {
    this.enhancedConfig.camera = camera;
  }

  /**
   * Set asset manager
   */
  setAssetManager(assetManager: AssetManager): void {
    this.assetManager = assetManager;
  }

  /**
   * Get asset manager
   */
  getAssetManager(): AssetManager | undefined {
    return this.assetManager;
  }

  /**
   * Preload assets for entities
   */
  async preloadAssets(world: World): Promise<void> {
    if (!this.assetManager) return;

    const entities = world.queryEntities(['Asset']);
    const assetIds = new Set<string>();

    // Collect all asset IDs
    for (const entity of entities) {
      const asset = world.getComponent<AssetComponent>(entity.id, 'Asset');
      if (!asset) continue;

      if (asset.modelId) assetIds.add(asset.modelId);
      if (asset.textureId) assetIds.add(asset.textureId);
      if (asset.materialId) assetIds.add(asset.materialId);
    }

    // Load all assets
    const loadPromises = Array.from(assetIds).map((id) =>
      this.assetManager!.load(id).catch((error) => {
        console.error(`Failed to preload asset ${id}:`, error);
      })
    );

    await Promise.all(loadPromises);
  }

  /**
   * Get enhanced statistics
   */
  getEnhancedStats() {
    return {
      ...this.getStats(),
      lodObjects: this.lodObjects.size,
      cachedModels: this.modelCache.size,
      instancedMeshes: this.instancedMeshes.size
    };
  }

  /**
   * Dispose enhanced resources
   */
  dispose(): void {
    // Clear LOD objects
    for (const lod of this.lodObjects.values()) {
      const scene = this.getScene();
      if (scene) {
        scene.remove(lod);
      }
    }
    this.lodObjects.clear();

    // Clear model cache
    this.modelCache.clear();

    // Clear instanced meshes
    for (const mesh of this.instancedMeshes.values()) {
      mesh.dispose();
    }
    this.instancedMeshes.clear();

    // Call parent dispose
    super.dispose();
  }
}
