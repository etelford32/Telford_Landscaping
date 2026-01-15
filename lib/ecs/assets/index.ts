/**
 * Asset Management System
 *
 * Handles loading, caching, and management of all asset types:
 * - Textures (PBR texture sets)
 * - 3D Models (GLTF/GLB)
 * - Materials
 * - Audio
 *
 * @example
 * ```typescript
 * import { AssetManager } from '@/lib/ecs/assets';
 *
 * const assetManager = new AssetManager(renderer);
 * await assetManager.loadManifest('/assets/manifest.json');
 * await assetManager.preload((loaded, total) => {
 *   console.log(`Loading: ${loaded}/${total}`);
 * });
 *
 * const model = await assetManager.load<ModelAsset>('japanese-maple-model');
 * scene.add(model.model);
 * ```
 */

export * from './types';
export * from './TextureLoader';
export * from './ModelLoader';
export * from './AssetManager';
