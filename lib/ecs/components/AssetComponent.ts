/**
 * AssetComponent - References to assets in the AssetManager
 *
 * This component stores asset IDs that the RenderSystem will use to
 * load models and textures from the AssetManager.
 */

import { Component } from '../core/Component';

/**
 * Asset component - links entity to asset manager assets
 */
export interface AssetComponent extends Component {
  readonly type: 'Asset';

  // Model asset ID (if entity uses a 3D model)
  modelId?: string;

  // Texture asset ID (for materials)
  textureId?: string;

  // Material preset asset ID
  materialId?: string;

  // LOD settings
  useLOD?: boolean;
  lodDistances?: number[];

  // Instance settings (for performance)
  instanceable?: boolean;
  instanceId?: string;
}

/**
 * Create an asset component
 */
export function createAssetComponent(options: {
  modelId?: string;
  textureId?: string;
  materialId?: string;
  useLOD?: boolean;
  lodDistances?: number[];
  instanceable?: boolean;
  instanceId?: string;
}): AssetComponent {
  return {
    type: 'Asset',
    modelId: options.modelId,
    textureId: options.textureId,
    materialId: options.materialId,
    useLOD: options.useLOD ?? false,
    lodDistances: options.lodDistances,
    instanceable: options.instanceable ?? false,
    instanceId: options.instanceId
  };
}

/**
 * Set model asset
 */
export function setModelAsset(
  asset: AssetComponent,
  modelId: string
): AssetComponent {
  return {
    ...asset,
    modelId
  };
}

/**
 * Set texture asset
 */
export function setTextureAsset(
  asset: AssetComponent,
  textureId: string
): AssetComponent {
  return {
    ...asset,
    textureId
  };
}

/**
 * Enable LOD
 */
export function enableLOD(
  asset: AssetComponent,
  distances?: number[]
): AssetComponent {
  return {
    ...asset,
    useLOD: true,
    lodDistances: distances
  };
}

/**
 * Make entity instanceable (for performance with many identical objects)
 */
export function makeInstanceable(
  asset: AssetComponent,
  instanceId?: string
): AssetComponent {
  return {
    ...asset,
    instanceable: true,
    instanceId: instanceId || asset.modelId
  };
}
