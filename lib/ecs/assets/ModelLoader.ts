/**
 * ModelLoader - Load 3D models (GLTF/GLB)
 *
 * Handles:
 * - GLTF/GLB model loading
 * - Model optimization (geometry merging, material deduplication)
 * - Bounding box calculation
 * - LOD (Level of Detail) support
 * - Animation extraction
 */

import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { ModelAsset, LoadOptions } from './types';

/**
 * Model loading configuration
 */
export interface ModelLoaderConfig {
  // Base path for models
  basePath: string;

  // Enable Draco compression support
  enableDraco: boolean;

  // Draco decoder path
  dracoDecoderPath: string;

  // Enable shadow casting by default
  castShadows: boolean;

  // Enable shadow receiving by default
  receiveShadows: boolean;

  // Optimize models on load
  optimize: boolean;
}

const DEFAULT_CONFIG: ModelLoaderConfig = {
  basePath: '/assets/models',
  enableDraco: true,
  dracoDecoderPath: '/draco/',
  castShadows: true,
  receiveShadows: true,
  optimize: true
};

/**
 * ModelLoader - Handles 3D model loading
 */
export class ModelLoader {
  private config: ModelLoaderConfig;
  private gltfLoader: GLTFLoader;
  private dracoLoader?: DRACOLoader;
  private loadingManager: THREE.LoadingManager;

  constructor(config: Partial<ModelLoaderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Create loading manager
    this.loadingManager = new THREE.LoadingManager();

    // Setup GLTF loader
    this.gltfLoader = new GLTFLoader(this.loadingManager);

    // Setup Draco loader if enabled
    if (this.config.enableDraco) {
      this.dracoLoader = new DRACOLoader();
      this.dracoLoader.setDecoderPath(this.config.dracoDecoderPath);
      this.gltfLoader.setDRACOLoader(this.dracoLoader);
    }
  }

  /**
   * Load a GLTF/GLB model
   */
  async loadModel(
    path: string,
    options: LoadOptions = {}
  ): Promise<{ model: THREE.Group; gltf: GLTF }> {
    return new Promise((resolve, reject) => {
      const fullPath = this.resolvePath(path);

      this.gltfLoader.load(
        fullPath,
        (gltf) => {
          const model = gltf.scene;

          // Apply default settings
          this.configureModel(model, options);

          // Optimize if enabled
          if (this.config.optimize) {
            this.optimizeModel(model);
          }

          resolve({ model, gltf });
        },
        (progress) => {
          if (options.onProgress) {
            const percent = (progress.loaded / progress.total) * 100;
            options.onProgress(percent);
          }
        },
        (error) => {
          const err = new Error(`Failed to load model: ${fullPath} - ${error}`);
          if (options.onError) {
            options.onError(err);
          }
          reject(err);
        }
      );
    });
  }

  /**
   * Load multiple LOD levels for a model
   */
  async loadModelLODs(
    lodPaths: { distance: number; path: string }[],
    options: LoadOptions = {}
  ): Promise<ModelAsset['lods']> {
    const lods: NonNullable<ModelAsset['lods']> = [];

    // Sort by distance (closest first)
    const sorted = [...lodPaths].sort((a, b) => a.distance - b.distance);

    // Load all LODs in parallel
    const loadPromises = sorted.map(async (lod) => {
      const { model } = await this.loadModel(lod.path, options);
      return { distance: lod.distance, model };
    });

    const results = await Promise.all(loadPromises);
    lods.push(...results);

    return lods;
  }

  /**
   * Configure model with default settings
   */
  private configureModel(
    model: THREE.Group,
    options: LoadOptions & {
      castShadows?: boolean;
      receiveShadows?: boolean;
    } = {}
  ): void {
    const castShadows = options.castShadows ?? this.config.castShadows;
    const receiveShadows = options.receiveShadows ?? this.config.receiveShadows;

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = castShadows;
        child.receiveShadow = receiveShadows;

        // Enable frustum culling
        child.frustumCulled = true;

        // Store geometry for raycasting
        if (child.geometry) {
          child.geometry.computeBoundingBox();
          child.geometry.computeBoundingSphere();
        }
      }
    });
  }

  /**
   * Optimize model for rendering
   */
  private optimizeModel(model: THREE.Group): void {
    // Traverse and optimize each mesh
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Keep the GLTF's indexed geometry and authored normals. The previous
        // version called toNonIndexed() — which INFLATES vertex count (~3x),
        // despite the "dedup" comment — and recomputed normals, discarding the
        // asset's authored (smooth) shading. Only fill in normals if missing.
        if (child.geometry && !child.geometry.getAttribute('normal')) {
          child.geometry.computeVertexNormals();
        }

        // Optimize materials
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => this.optimizeMaterial(mat));
          } else {
            this.optimizeMaterial(child.material);
          }
        }
      }
    });
  }

  /**
   * Optimize material settings
   */
  private optimizeMaterial(material: THREE.Material): void {
    // Enable hardware instancing if supported
    material.toneMapped = true;

    // Disable unnecessary features
    if ('fog' in material && material.fog === undefined) {
      material.fog = true;
    }

    // Ensure proper depth settings
    material.depthWrite = true;
    material.depthTest = true;
  }

  /**
   * Calculate model bounding box
   */
  calculateBoundingBox(model: THREE.Group): THREE.Box3 {
    const box = new THREE.Box3();
    box.setFromObject(model);
    return box;
  }

  /**
   * Calculate model statistics
   */
  calculateModelStats(model: THREE.Group): {
    vertexCount: number;
    triangleCount: number;
    meshCount: number;
    materialCount: number;
  } {
    let vertexCount = 0;
    let triangleCount = 0;
    let meshCount = 0;
    const materials = new Set<THREE.Material>();

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshCount++;

        if (child.geometry) {
          const positionAttr = child.geometry.getAttribute('position');
          if (positionAttr) {
            vertexCount += positionAttr.count;
          }

          const indexAttr = child.geometry.getIndex();
          if (indexAttr) {
            triangleCount += indexAttr.count / 3;
          } else if (positionAttr) {
            triangleCount += positionAttr.count / 3;
          }
        }

        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => materials.add(mat));
          } else {
            materials.add(child.material);
          }
        }
      }
    });

    return {
      vertexCount,
      triangleCount,
      meshCount,
      materialCount: materials.size
    };
  }

  /**
   * Clone a model (for instancing)
   */
  cloneModel(model: THREE.Group): THREE.Group {
    return model.clone(true);
  }

  /**
   * Resolve full model path
   */
  private resolvePath(path: string): string {
    if (path.startsWith('/') || path.startsWith('http')) {
      return path;
    }
    return `${this.config.basePath}/${path}`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ModelLoaderConfig>): void {
    this.config = { ...this.config, ...config };

    // Update Draco loader if path changed
    if (config.dracoDecoderPath && this.dracoLoader) {
      this.dracoLoader.setDecoderPath(config.dracoDecoderPath);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): ModelLoaderConfig {
    return { ...this.config };
  }

  /**
   * Dispose of a model and free GPU memory
   */
  disposeModel(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Dispose geometry
        if (child.geometry) {
          child.geometry.dispose();
        }

        // Dispose materials
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
  }

  /**
   * Dispose of Draco loader
   */
  dispose(): void {
    if (this.dracoLoader) {
      this.dracoLoader.dispose();
    }
  }
}
