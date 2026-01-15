/**
 * AssetManager - Central asset management system
 *
 * Responsibilities:
 * - Load and cache all asset types (textures, models, materials)
 * - Track loading state and progress
 * - Preload assets based on priority
 * - Manage asset lifecycle (load/unload)
 * - Provide unified API for asset access
 */

import * as THREE from 'three';
import { TextureLoader, TextureLoaderConfig } from './TextureLoader';
import { ModelLoader, ModelLoaderConfig } from './ModelLoader';
import {
  AnyAsset,
  TextureAsset,
  ModelAsset,
  LoadOptions,
  AssetStats,
  AssetManifest,
  AssetManifestEntry
} from './types';

/**
 * Asset manager configuration
 */
export interface AssetManagerConfig {
  texture: Partial<TextureLoaderConfig>;
  model: Partial<ModelLoaderConfig>;

  // Enable verbose logging
  debug: boolean;

  // Max cache size in MB (0 = unlimited)
  maxCacheSize: number;
}

const DEFAULT_CONFIG: AssetManagerConfig = {
  texture: {},
  model: {},
  debug: false,
  maxCacheSize: 0 // Unlimited by default
};

/**
 * AssetManager - Central asset registry and loader
 */
export class AssetManager {
  private config: AssetManagerConfig;
  private textureLoader: TextureLoader;
  private modelLoader: ModelLoader;

  // Asset caches
  private assets: Map<string, AnyAsset> = new Map();
  private manifest?: AssetManifest;

  // Loading state
  private loadingPromises: Map<string, Promise<AnyAsset>> = new Map();
  private preloadQueue: AssetManifestEntry[] = [];
  private isPreloading: boolean = false;

  constructor(
    renderer?: THREE.WebGLRenderer,
    config: Partial<AssetManagerConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Get max anisotropy from renderer if available
    const maxAnisotropy = renderer?.capabilities.getMaxAnisotropy() ?? 16;

    // Initialize loaders
    this.textureLoader = new TextureLoader({
      ...this.config.texture,
      maxAnisotropy
    });

    this.modelLoader = new ModelLoader(this.config.model);

    this.log('AssetManager initialized');
  }

  /**
   * Load an asset by ID
   */
  async load<T extends AnyAsset>(
    id: string,
    options: LoadOptions = {}
  ): Promise<T> {
    // Check cache first (unless forceReload is true)
    if (!options.forceReload && this.assets.has(id)) {
      const cached = this.assets.get(id) as T;

      if (cached.state === 'loaded') {
        this.log(`Asset ${id} loaded from cache`);
        return cached;
      } else if (cached.state === 'error') {
        throw new Error(cached.error || `Asset ${id} failed to load`);
      }
    }

    // Check if already loading
    if (this.loadingPromises.has(id)) {
      this.log(`Asset ${id} already loading, waiting...`);
      return this.loadingPromises.get(id) as Promise<T>;
    }

    // Find asset in manifest
    const entry = this.manifest?.assets.find((a) => a.id === id);
    if (!entry) {
      throw new Error(`Asset ${id} not found in manifest`);
    }

    // Start loading
    const promise = this.loadAsset(entry, options);
    this.loadingPromises.set(id, promise);

    try {
      const asset = await promise;
      this.loadingPromises.delete(id);
      return asset as T;
    } catch (error) {
      this.loadingPromises.delete(id);
      throw error;
    }
  }

  /**
   * Load asset based on manifest entry
   */
  private async loadAsset(
    entry: AssetManifestEntry,
    options: LoadOptions
  ): Promise<AnyAsset> {
    const startTime = Date.now();
    this.log(`Loading asset: ${entry.id} (${entry.type})`);

    // Create asset record
    const asset: AnyAsset = {
      id: entry.id,
      type: entry.type,
      name: entry.name,
      path: entry.path,
      state: 'loading'
    } as any;

    this.assets.set(entry.id, asset);

    try {
      switch (entry.type) {
        case 'texture':
          await this.loadTextureAsset(asset as TextureAsset, entry, options);
          break;
        case 'model':
          await this.loadModelAsset(asset as ModelAsset, entry, options);
          break;
        default:
          throw new Error(`Unsupported asset type: ${entry.type}`);
      }

      asset.state = 'loaded';
      asset.loadedAt = Date.now();

      const loadTime = Date.now() - startTime;
      this.log(`Asset ${entry.id} loaded in ${loadTime}ms`);

      if (options.onLoad) {
        options.onLoad(asset);
      }

      return asset;
    } catch (error) {
      asset.state = 'error';
      asset.error = (error as Error).message;

      this.log(`Asset ${entry.id} failed to load: ${asset.error}`);

      if (options.onError) {
        options.onError(error as Error);
      }

      throw error;
    }
  }

  /**
   * Load texture asset
   */
  private async loadTextureAsset(
    asset: TextureAsset,
    entry: AssetManifestEntry,
    options: LoadOptions
  ): Promise<void> {
    if (entry.maps) {
      // Load PBR texture set
      const maps = await this.textureLoader.loadPBRTextureSet(
        entry.maps,
        options
      );
      asset.maps = maps;
      asset.texture = maps.albedo; // Primary texture
    } else {
      // Load single texture
      const texture = await this.textureLoader.loadTexture(
        entry.path,
        options
      );
      asset.texture = texture;
    }
  }

  /**
   * Load model asset
   */
  private async loadModelAsset(
    asset: ModelAsset,
    entry: AssetManifestEntry,
    options: LoadOptions
  ): Promise<void> {
    // Load main model
    const { model, gltf } = await this.modelLoader.loadModel(
      entry.path,
      options
    );

    asset.model = model;

    // Calculate bounding box
    asset.boundingBox = this.modelLoader.calculateBoundingBox(model);

    // Calculate stats
    const stats = this.modelLoader.calculateModelStats(model);
    asset.vertexCount = stats.vertexCount;
    asset.triangleCount = stats.triangleCount;

    // Load LODs if specified
    if (entry.lods && entry.lods.length > 0) {
      asset.lods = await this.modelLoader.loadModelLODs(entry.lods, options);
    }
  }

  /**
   * Get asset from cache
   */
  get<T extends AnyAsset>(id: string): T | undefined {
    return this.assets.get(id) as T | undefined;
  }

  /**
   * Check if asset is loaded
   */
  isLoaded(id: string): boolean {
    const asset = this.assets.get(id);
    return asset?.state === 'loaded';
  }

  /**
   * Check if asset is loading
   */
  isLoading(id: string): boolean {
    return this.loadingPromises.has(id);
  }

  /**
   * Unload an asset and free memory
   */
  unload(id: string): void {
    const asset = this.assets.get(id);
    if (!asset) return;

    this.log(`Unloading asset: ${id}`);

    // Dispose based on type
    switch (asset.type) {
      case 'texture':
        const textureAsset = asset as TextureAsset;
        if (textureAsset.texture) {
          this.textureLoader.disposeTexture(textureAsset.texture);
        }
        if (textureAsset.maps) {
          this.textureLoader.disposeTextureSet(textureAsset.maps);
        }
        break;

      case 'model':
        const modelAsset = asset as ModelAsset;
        if (modelAsset.model) {
          this.modelLoader.disposeModel(modelAsset.model);
        }
        if (modelAsset.lods) {
          modelAsset.lods.forEach((lod) => {
            this.modelLoader.disposeModel(lod.model);
          });
        }
        break;
    }

    this.assets.delete(id);
  }

  /**
   * Load asset manifest
   */
  async loadManifest(path: string): Promise<void> {
    this.log(`Loading asset manifest from: ${path}`);

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.manifest = await response.json();
      this.log(
        `Manifest loaded: ${this.manifest.assets.length} assets registered`
      );

      // Build preload queue (sorted by priority)
      this.preloadQueue = [...this.manifest.assets]
        .filter((a) => a.priority !== undefined && a.priority > 0)
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

      this.log(`Preload queue: ${this.preloadQueue.length} assets`);
    } catch (error) {
      throw new Error(`Failed to load manifest: ${(error as Error).message}`);
    }
  }

  /**
   * Preload assets based on priority
   */
  async preload(
    onProgress?: (loaded: number, total: number) => void
  ): Promise<void> {
    if (this.isPreloading) {
      this.log('Preload already in progress');
      return;
    }

    if (this.preloadQueue.length === 0) {
      this.log('No assets to preload');
      return;
    }

    this.isPreloading = true;
    this.log(`Preloading ${this.preloadQueue.length} assets...`);

    const total = this.preloadQueue.length;
    let loaded = 0;

    // Load assets sequentially (could be parallel, but sequential is safer)
    for (const entry of this.preloadQueue) {
      try {
        await this.loadAsset(entry, {});
        loaded++;

        if (onProgress) {
          onProgress(loaded, total);
        }
      } catch (error) {
        this.log(`Preload failed for ${entry.id}: ${(error as Error).message}`);
        // Continue loading other assets
      }
    }

    this.isPreloading = false;
    this.log(`Preload complete: ${loaded}/${total} assets loaded`);
  }

  /**
   * Get all assets of a specific type
   */
  getAssetsByType<T extends AnyAsset>(type: T['type']): T[] {
    return Array.from(this.assets.values()).filter(
      (asset) => asset.type === type
    ) as T[];
  }

  /**
   * Get assets by category
   */
  getAssetsByCategory(category: string): AnyAsset[] {
    if (!this.manifest) return [];

    const ids = this.manifest.assets
      .filter((entry) => entry.category === category)
      .map((entry) => entry.id);

    return ids
      .map((id) => this.assets.get(id))
      .filter((asset): asset is AnyAsset => asset !== undefined);
  }

  /**
   * Search assets by tag
   */
  searchByTag(tag: string): AnyAsset[] {
    if (!this.manifest) return [];

    const ids = this.manifest.assets
      .filter((entry) => entry.tags?.includes(tag))
      .map((entry) => entry.id);

    return ids
      .map((id) => this.assets.get(id))
      .filter((asset): asset is AnyAsset => asset !== undefined);
  }

  /**
   * Get asset statistics
   */
  getStats(): AssetStats {
    const all = Array.from(this.assets.values());
    const loaded = all.filter((a) => a.state === 'loaded');
    const failed = all.filter((a) => a.state === 'error');

    const byType: Record<string, number> = {
      texture: 0,
      model: 0,
      material: 0,
      audio: 0
    };

    all.forEach((asset) => {
      byType[asset.type] = (byType[asset.type] || 0) + 1;
    });

    return {
      totalAssets: all.length,
      loadedAssets: loaded.length,
      failedAssets: failed.length,
      cacheSize: this.assets.size,
      memoryUsage: 0, // TODO: Calculate actual memory usage
      byType: byType as any
    };
  }

  /**
   * Clear all cached assets
   */
  clear(): void {
    this.log('Clearing all assets');

    const ids = Array.from(this.assets.keys());
    ids.forEach((id) => this.unload(id));

    this.assets.clear();
    this.loadingPromises.clear();
  }

  /**
   * Dispose of asset manager
   */
  dispose(): void {
    this.log('Disposing AssetManager');

    this.clear();
    this.modelLoader.dispose();
  }

  /**
   * Debug logging
   */
  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[AssetManager] ${message}`);
    }
  }

  /**
   * Get manifest
   */
  getManifest(): AssetManifest | undefined {
    return this.manifest;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AssetManagerConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.texture) {
      this.textureLoader.updateConfig(config.texture);
    }

    if (config.model) {
      this.modelLoader.updateConfig(config.model);
    }
  }
}
