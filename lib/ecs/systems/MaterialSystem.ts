/**
 * MaterialSystem - Updates materials based on entity state
 *
 * Handles:
 * - Selection highlights (emissive glow)
 * - Hover effects (brightness changes)
 * - State-based material modifications
 *
 * This system runs every frame to sync material properties with entity state
 */

import { BaseSystem, ComponentUpdate, SystemPriority } from '../core/System';
import { World } from '../core/World';
import {
  MaterialComponent,
  ColorData,
  updateMaterialProperties,
  colorToHex
} from '../components/MaterialComponent';
import { SelectionComponent } from '../components/SelectionComponent';

/**
 * Material system configuration
 */
export interface MaterialSystemConfig {
  // Selection highlight
  selectionEmissiveIntensity: number;
  selectionBrightnessBoost: number;

  // Hover highlight
  hoverBrightnessBoost: number;
  hoverOpacityChange: number;

  // Locked visual
  lockedOpacity: number;
  lockedDesaturate: boolean;

  // Hidden visual
  hiddenOpacity: number;
}

const DEFAULT_CONFIG: MaterialSystemConfig = {
  selectionEmissiveIntensity: 0.2,
  selectionBrightnessBoost: 40,
  hoverBrightnessBoost: 20,
  hoverOpacityChange: 0,
  lockedOpacity: 0.5,
  lockedDesaturate: true,
  hiddenOpacity: 0
};

export class MaterialSystem extends BaseSystem {
  readonly name = 'MaterialSystem';
  readonly requiredComponents = ['Material', 'Selection'];
  readonly priority = SystemPriority.RENDER - 10; // Run just before render

  private config: MaterialSystemConfig;
  private originalMaterials: Map<string, MaterialComponent> = new Map();

  constructor(config: Partial<MaterialSystemConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update materials based on selection state
   */
  update(world: World, deltaTime: number): ComponentUpdate[] {
    const updates: ComponentUpdate[] = [];
    const entities = this.queryEntities(world);

    for (const entity of entities) {
      const material = world.getComponent<MaterialComponent>(entity.id, 'Material');
      const selection = world.getComponent<SelectionComponent>(entity.id, 'Selection');

      if (!material || !selection) continue;

      // Store original material if we haven't seen this entity before
      if (!this.originalMaterials.has(entity.id)) {
        this.originalMaterials.set(entity.id, material);
      }

      const originalMaterial = this.originalMaterials.get(entity.id)!;
      let modifiedMaterial = { ...originalMaterial };

      // Apply visibility
      if (!selection.visible) {
        modifiedMaterial = this.applyHidden(modifiedMaterial);
        updates.push(this.createUpdate(entity.id, 'Material', modifiedMaterial));
        continue;
      }

      // Apply locked state
      if (selection.locked) {
        modifiedMaterial = this.applyLocked(modifiedMaterial);
      }

      // Apply hover effect
      if (selection.hovered) {
        modifiedMaterial = this.applyHover(modifiedMaterial);
      }

      // Apply selection highlight
      if (selection.selected) {
        modifiedMaterial = this.applySelection(modifiedMaterial);
      }

      // Only update if material changed
      if (JSON.stringify(modifiedMaterial) !== JSON.stringify(material)) {
        updates.push(this.createUpdate(entity.id, 'Material', modifiedMaterial));
      }
    }

    return updates;
  }

  /**
   * Apply selection highlight
   */
  private applySelection(material: MaterialComponent): MaterialComponent {
    const baseColor = material.properties.color || '#ffffff';
    const brighterColor = this.adjustColorBrightness(
      baseColor,
      this.config.selectionBrightnessBoost
    );

    return updateMaterialProperties(material, {
      color: brighterColor,
      emissive: baseColor,
      emissiveIntensity: this.config.selectionEmissiveIntensity
    });
  }

  /**
   * Apply hover effect
   */
  private applyHover(material: MaterialComponent): MaterialComponent {
    const baseColor = material.properties.color || '#ffffff';
    const brighterColor = this.adjustColorBrightness(
      baseColor,
      this.config.hoverBrightnessBoost
    );

    return updateMaterialProperties(material, {
      color: brighterColor,
      opacity:
        (material.properties.opacity ?? 1) + this.config.hoverOpacityChange
    });
  }

  /**
   * Apply locked visual state
   */
  private applyLocked(material: MaterialComponent): MaterialComponent {
    let color = material.properties.color || '#ffffff';

    if (this.config.lockedDesaturate) {
      color = this.desaturateColor(color);
    }

    return updateMaterialProperties(material, {
      color,
      opacity: this.config.lockedOpacity,
      transparent: true
    });
  }

  /**
   * Apply hidden visual state
   */
  private applyHidden(material: MaterialComponent): MaterialComponent {
    return updateMaterialProperties(material, {
      opacity: this.config.hiddenOpacity,
      transparent: true
    });
  }

  /**
   * Adjust color brightness
   */
  private adjustColorBrightness(color: ColorData, amount: number): string {
    const hex = colorToHex(color);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const newR = Math.min(255, Math.max(0, r + amount));
    const newG = Math.min(255, Math.max(0, g + amount));
    const newB = Math.min(255, Math.max(0, b + amount));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Desaturate color (convert to grayscale-ish)
   */
  private desaturateColor(color: ColorData): string {
    const hex = colorToHex(color);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Convert to grayscale using luminance formula
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    // Mix 50% original color with 50% grayscale
    const newR = Math.round((r + gray) / 2);
    const newG = Math.round((g + gray) / 2);
    const newB = Math.round((b + gray) / 2);

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Manually set material for an entity (bypasses original material storage)
   */
  setMaterial(
    world: World,
    entityId: string,
    material: MaterialComponent
  ): ComponentUpdate {
    // Update original material cache
    this.originalMaterials.set(entityId, material);
    return this.createUpdate(entityId, 'Material', material);
  }

  /**
   * Reset material to original (remove all effects)
   */
  resetMaterial(world: World, entityId: string): ComponentUpdate | null {
    const original = this.originalMaterials.get(entityId);
    if (!original) return null;

    return this.createUpdate(entityId, 'Material', original);
  }

  /**
   * Clear cached original materials (useful when reloading scene)
   */
  clearCache(): void {
    this.originalMaterials.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MaterialSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
