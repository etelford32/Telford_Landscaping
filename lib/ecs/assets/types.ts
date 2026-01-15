/**
 * Asset System Types
 *
 * Type definitions for the asset management system
 */

import * as THREE from 'three';

/**
 * Asset types supported by the system
 */
export type AssetType = 'texture' | 'model' | 'material' | 'audio';

/**
 * Asset loading state
 */
export type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Base asset interface
 */
export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  path: string;
  state: LoadingState;
  loadedAt?: number;
  error?: string;
}

/**
 * Texture asset with PBR maps
 */
export interface TextureAsset extends Asset {
  type: 'texture';
  texture?: THREE.Texture;
  format?: 'jpg' | 'png' | 'webp' | 'ktx2';

  // PBR texture set
  maps?: {
    albedo?: THREE.Texture;
    normal?: THREE.Texture;
    roughness?: THREE.Texture;
    metalness?: THREE.Texture;
    ao?: THREE.Texture;
    emissive?: THREE.Texture;
    displacement?: THREE.Texture;
    alpha?: THREE.Texture;
  };

  // Texture settings
  wrapS?: THREE.Wrapping;
  wrapT?: THREE.Wrapping;
  repeat?: { x: number; y: number };
  offset?: { x: number; y: number };
  anisotropy?: number;
}

/**
 * 3D model asset
 */
export interface ModelAsset extends Asset {
  type: 'model';
  model?: THREE.Group;
  format?: 'gltf' | 'glb' | 'fbx' | 'obj';

  // Model metadata
  boundingBox?: THREE.Box3;
  vertexCount?: number;
  triangleCount?: number;

  // LOD levels
  lods?: {
    distance: number;
    model: THREE.Group;
  }[];
}

/**
 * Material preset asset
 */
export interface MaterialAsset extends Asset {
  type: 'material';
  material?: THREE.Material;
  properties?: {
    color?: string;
    roughness?: number;
    metalness?: number;
    emissive?: string;
    emissiveIntensity?: number;
  };
}

/**
 * Audio asset
 */
export interface AudioAsset extends Asset {
  type: 'audio';
  buffer?: AudioBuffer;
  duration?: number;
  format?: 'mp3' | 'wav' | 'ogg';
}

/**
 * Union type for all asset types
 */
export type AnyAsset = TextureAsset | ModelAsset | MaterialAsset | AudioAsset;

/**
 * Asset loading options
 */
export interface LoadOptions {
  // Cache the asset (default: true)
  cache?: boolean;

  // Force reload even if cached (default: false)
  forceReload?: boolean;

  // Callback when loading progresses
  onProgress?: (progress: number) => void;

  // Callback when loading completes
  onLoad?: (asset: AnyAsset) => void;

  // Callback on error
  onError?: (error: Error) => void;
}

/**
 * Asset manifest entry
 */
export interface AssetManifestEntry {
  id: string;
  type: AssetType;
  name: string;
  path: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;

  // Preload priority (higher = load earlier)
  priority?: number;

  // For texture sets
  maps?: {
    albedo?: string;
    normal?: string;
    roughness?: string;
    metalness?: string;
    ao?: string;
    emissive?: string;
    displacement?: string;
    alpha?: string;
  };

  // For models with LODs
  lods?: {
    distance: number;
    path: string;
  }[];
}

/**
 * Asset manifest
 */
export interface AssetManifest {
  version: string;
  assets: AssetManifestEntry[];
}

/**
 * Asset manager statistics
 */
export interface AssetStats {
  totalAssets: number;
  loadedAssets: number;
  failedAssets: number;
  cacheSize: number;
  memoryUsage: number;
  byType: Record<AssetType, number>;
}
