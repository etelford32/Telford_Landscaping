/**
 * TextureLoader - Load and configure Three.js textures
 *
 * Handles:
 * - Single texture loading
 * - PBR texture set loading (albedo, normal, roughness, etc.)
 * - Texture configuration (wrapping, repeat, anisotropy)
 * - Format detection and optimization
 */

import * as THREE from 'three';
import { TextureAsset, LoadOptions } from './types';

/**
 * Texture loading configuration
 */
export interface TextureLoaderConfig {
  // Base path for textures
  basePath: string;

  // Max anisotropy (from renderer capabilities)
  maxAnisotropy: number;

  // Default texture settings
  defaultWrapS: THREE.Wrapping;
  defaultWrapT: THREE.Wrapping;
  defaultAnisotropy: number;

  // Enable/disable sRGB encoding for albedo maps
  sRGBEncoding: boolean;
}

const DEFAULT_CONFIG: TextureLoaderConfig = {
  basePath: '/assets/textures',
  maxAnisotropy: 16,
  defaultWrapS: THREE.RepeatWrapping,
  defaultWrapT: THREE.RepeatWrapping,
  defaultAnisotropy: 4,
  sRGBEncoding: true
};

/**
 * TextureLoader - Handles texture loading and configuration
 */
export class TextureLoader {
  private config: TextureLoaderConfig;
  private loader: THREE.TextureLoader;
  private loadingManager: THREE.LoadingManager;

  // Path-keyed cache so identical texture files are fetched/decoded/uploaded
  // once and shared. Ref-counted so disposeTexture only frees the GPU resource
  // when the last user releases it.
  private cache: Map<string, { texture: THREE.Texture; refCount: number }> = new Map();
  private pending: Map<string, Promise<THREE.Texture>> = new Map();

  constructor(config: Partial<TextureLoaderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Create loading manager for progress tracking
    this.loadingManager = new THREE.LoadingManager();
    this.loader = new THREE.TextureLoader(this.loadingManager);
  }

  /**
   * Load a single texture
   */
  async loadTexture(
    path: string,
    options: LoadOptions = {}
  ): Promise<THREE.Texture> {
    const fullPath = this.resolvePath(path);

    // Cache hit — share the already-decoded/uploaded texture.
    const cached = this.cache.get(fullPath);
    if (cached) {
      cached.refCount++;
      return cached.texture;
    }

    // A load for this path is already in flight — join it.
    const inFlight = this.pending.get(fullPath);
    if (inFlight) {
      await inFlight; // throws if the in-flight load failed
      const entry = this.cache.get(fullPath);
      if (entry) {
        entry.refCount++;
        return entry.texture;
      }
    }

    const promise = new Promise<THREE.Texture>((resolve, reject) => {
      this.loader.load(
        fullPath,
        (texture) => resolve(texture),
        undefined,
        () => reject(new Error(`Failed to load texture: ${fullPath}`))
      );
    });
    this.pending.set(fullPath, promise);

    let texture: THREE.Texture;
    try {
      texture = await promise;
    } catch (err) {
      this.pending.delete(fullPath);
      if (options.onError) options.onError(err as Error);
      throw err;
    }

    this.pending.delete(fullPath);
    this.configureTexture(texture, options);
    texture.userData.__cachePath = fullPath;
    this.cache.set(fullPath, { texture, refCount: 1 });
    return texture;
  }

  /**
   * Load a complete PBR texture set
   */
  async loadPBRTextureSet(
    paths: {
      albedo?: string;
      normal?: string;
      roughness?: string;
      metalness?: string;
      ao?: string;
      emissive?: string;
      displacement?: string;
      alpha?: string;
    },
    options: LoadOptions = {}
  ): Promise<TextureAsset['maps']> {
    const maps: TextureAsset['maps'] = {};

    // Load all textures in parallel
    const loadPromises: Promise<void>[] = [];

    if (paths.albedo) {
      loadPromises.push(
        this.loadTexture(paths.albedo, options).then((texture) => {
          // Albedo uses sRGB color space
          texture.colorSpace = THREE.SRGBColorSpace;
          maps.albedo = texture;
        })
      );
    }

    if (paths.normal) {
      loadPromises.push(
        this.loadTexture(paths.normal, options).then((texture) => {
          // Normal maps use linear color space
          texture.colorSpace = THREE.LinearSRGBColorSpace;
          maps.normal = texture;
        })
      );
    }

    if (paths.roughness) {
      loadPromises.push(
        this.loadTexture(paths.roughness, options).then((texture) => {
          texture.colorSpace = THREE.LinearSRGBColorSpace;
          maps.roughness = texture;
        })
      );
    }

    if (paths.metalness) {
      loadPromises.push(
        this.loadTexture(paths.metalness, options).then((texture) => {
          texture.colorSpace = THREE.LinearSRGBColorSpace;
          maps.metalness = texture;
        })
      );
    }

    if (paths.ao) {
      loadPromises.push(
        this.loadTexture(paths.ao, options).then((texture) => {
          texture.colorSpace = THREE.LinearSRGBColorSpace;
          maps.ao = texture;
        })
      );
    }

    if (paths.emissive) {
      loadPromises.push(
        this.loadTexture(paths.emissive, options).then((texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          maps.emissive = texture;
        })
      );
    }

    if (paths.displacement) {
      loadPromises.push(
        this.loadTexture(paths.displacement, options).then((texture) => {
          texture.colorSpace = THREE.LinearSRGBColorSpace;
          maps.displacement = texture;
        })
      );
    }

    if (paths.alpha) {
      loadPromises.push(
        this.loadTexture(paths.alpha, options).then((texture) => {
          texture.colorSpace = THREE.LinearSRGBColorSpace;
          maps.alpha = texture;
        })
      );
    }

    // Wait for all textures to load
    await Promise.all(loadPromises);

    return maps;
  }

  /**
   * Configure texture with default settings
   */
  private configureTexture(
    texture: THREE.Texture,
    options: LoadOptions & {
      wrapS?: THREE.Wrapping;
      wrapT?: THREE.Wrapping;
      repeat?: { x: number; y: number };
      offset?: { x: number; y: number };
      anisotropy?: number;
    } = {}
  ): void {
    // Wrapping mode
    texture.wrapS = options.wrapS ?? this.config.defaultWrapS;
    texture.wrapT = options.wrapT ?? this.config.defaultWrapT;

    // Repeat
    if (options.repeat) {
      texture.repeat.set(options.repeat.x, options.repeat.y);
    }

    // Offset
    if (options.offset) {
      texture.offset.set(options.offset.x, options.offset.y);
    }

    // Anisotropic filtering (improves quality at oblique angles)
    texture.anisotropy = Math.min(
      options.anisotropy ?? this.config.defaultAnisotropy,
      this.config.maxAnisotropy
    );

    // Generate mipmaps for better quality
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
  }

  /**
   * Resolve full texture path
   */
  private resolvePath(path: string): string {
    // If path is absolute or starts with http/https, use as-is
    if (path.startsWith('/') || path.startsWith('http')) {
      return path;
    }

    // Otherwise, prepend base path
    return `${this.config.basePath}/${path}`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TextureLoaderConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): TextureLoaderConfig {
    return { ...this.config };
  }

  /**
   * Dispose of a texture and free GPU memory
   */
  disposeTexture(texture: THREE.Texture): void {
    const path = texture.userData?.__cachePath as string | undefined;
    if (path) {
      const entry = this.cache.get(path);
      if (entry) {
        entry.refCount--;
        if (entry.refCount > 0) return; // still in use elsewhere
        this.cache.delete(path);
      }
    }
    texture.dispose();
  }

  /**
   * Dispose every cached texture and reset the cache (scene teardown).
   */
  clearCache(): void {
    for (const { texture } of this.cache.values()) {
      texture.dispose();
    }
    this.cache.clear();
    this.pending.clear();
  }

  /**
   * Dispose of a texture set
   */
  disposeTextureSet(maps: TextureAsset['maps']): void {
    if (!maps) return;

    if (maps.albedo) this.disposeTexture(maps.albedo);
    if (maps.normal) this.disposeTexture(maps.normal);
    if (maps.roughness) this.disposeTexture(maps.roughness);
    if (maps.metalness) this.disposeTexture(maps.metalness);
    if (maps.ao) this.disposeTexture(maps.ao);
    if (maps.emissive) this.disposeTexture(maps.emissive);
    if (maps.displacement) this.disposeTexture(maps.displacement);
    if (maps.alpha) this.disposeTexture(maps.alpha);
  }
}
