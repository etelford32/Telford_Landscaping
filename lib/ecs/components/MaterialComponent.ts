/**
 * Material Component - Visual appearance properties
 *
 * Supports PBR (Physically Based Rendering) workflow
 * All texture references are asset IDs, not actual textures
 */

import { Component } from '../core/Component';

/**
 * Material types
 */
export type MaterialType =
  | 'standard'    // MeshStandardMaterial (PBR)
  | 'physical'    // MeshPhysicalMaterial (advanced PBR)
  | 'basic'       // MeshBasicMaterial (no lighting)
  | 'lambert'     // MeshLambertMaterial (simple lighting)
  | 'custom';     // Custom shader material

/**
 * Color representation (hex string or RGB)
 */
export type ColorData = string | { r: number; g: number; b: number };

/**
 * Material Component
 */
export interface MaterialComponent extends Component {
  readonly type: 'Material';
  materialType: MaterialType;
  properties: MaterialProperties;
}

/**
 * Material properties (supports PBR workflow)
 */
export interface MaterialProperties {
  // Base color
  color?: ColorData;

  // PBR properties
  roughness?: number;       // 0 = smooth mirror, 1 = rough/matte
  metalness?: number;       // 0 = dielectric, 1 = metal

  // Emission (glowing)
  emissive?: ColorData;
  emissiveIntensity?: number;

  // Opacity
  opacity?: number;         // 0 = transparent, 1 = opaque
  transparent?: boolean;

  // Texture map references (asset IDs)
  map?: string;             // Albedo/Diffuse map
  normalMap?: string;       // Normal map (surface detail)
  roughnessMap?: string;    // Roughness map
  metalnessMap?: string;    // Metalness map
  aoMap?: string;           // Ambient occlusion map
  emissiveMap?: string;     // Emissive map
  alphaMap?: string;        // Alpha/transparency map
  displacementMap?: string; // Displacement map

  // Texture settings
  mapRepeat?: { x: number; y: number };
  normalMapIntensity?: number;
  aoMapIntensity?: number;
  displacementScale?: number;

  // Rendering options
  side?: 'front' | 'back' | 'double';
  wireframe?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;

  // Custom properties (for custom materials)
  custom?: Record<string, any>;
}

/**
 * Factory: Create standard PBR material
 */
export function createStandardMaterial(
  color: ColorData,
  roughness: number = 0.8,
  metalness: number = 0
): MaterialComponent {
  return {
    type: 'Material',
    materialType: 'standard',
    properties: {
      color,
      roughness,
      metalness,
      castShadow: true,
      receiveShadow: true
    }
  };
}

/**
 * Factory: Create physical material (advanced PBR)
 */
export function createPhysicalMaterial(
  color: ColorData,
  roughness: number = 0.5,
  metalness: number = 0
): MaterialComponent {
  return {
    type: 'Material',
    materialType: 'physical',
    properties: {
      color,
      roughness,
      metalness,
      castShadow: true,
      receiveShadow: true
    }
  };
}

/**
 * Factory: Create basic material (no lighting)
 */
export function createBasicMaterial(
  color: ColorData
): MaterialComponent {
  return {
    type: 'Material',
    materialType: 'basic',
    properties: {
      color
    }
  };
}

/**
 * Factory: Create material with texture maps
 */
export function createTexturedMaterial(
  albedoMapId: string,
  options: {
    normalMapId?: string;
    roughnessMapId?: string;
    aoMapId?: string;
    roughness?: number;
    metalness?: number;
  } = {}
): MaterialComponent {
  return {
    type: 'Material',
    materialType: 'standard',
    properties: {
      map: albedoMapId,
      normalMap: options.normalMapId,
      roughnessMap: options.roughnessMapId,
      aoMap: options.aoMapId,
      roughness: options.roughness ?? 0.8,
      metalness: options.metalness ?? 0,
      castShadow: true,
      receiveShadow: true
    }
  };
}

/**
 * Factory: Create transparent material
 */
export function createTransparentMaterial(
  color: ColorData,
  opacity: number
): MaterialComponent {
  return {
    type: 'Material',
    materialType: 'standard',
    properties: {
      color,
      opacity,
      transparent: true,
      side: 'double'
    }
  };
}

/**
 * Factory: Create emissive (glowing) material
 */
export function createEmissiveMaterial(
  color: ColorData,
  emissiveColor: ColorData,
  intensity: number = 0.5
): MaterialComponent {
  return {
    type: 'Material',
    materialType: 'standard',
    properties: {
      color,
      emissive: emissiveColor,
      emissiveIntensity: intensity
    }
  };
}

/**
 * Update material properties (immutable)
 */
export function updateMaterialProperties(
  material: MaterialComponent,
  updates: Partial<MaterialProperties>
): MaterialComponent {
  return {
    ...material,
    properties: {
      ...material.properties,
      ...updates
    }
  };
}

/**
 * Helper: Convert color to Three.js compatible format
 */
export function colorToHex(color: ColorData): string {
  if (typeof color === 'string') return color;
  const r = Math.floor(color.r * 255);
  const g = Math.floor(color.g * 255);
  const b = Math.floor(color.b * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
