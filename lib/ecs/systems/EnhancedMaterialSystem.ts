/**
 * EnhancedMaterialSystem - Advanced material management with visual effects
 *
 * Extends MaterialSystem with:
 * - Outline rendering for selections
 * - Animated transitions between states
 * - Pulsing selection effects
 * - Color grading and mood lighting
 * - Smooth interpolation between material states
 */

import * as THREE from 'three';
import { MaterialSystem, MaterialSystemConfig } from './MaterialSystem';
import { World } from '../core/World';
import { ComponentUpdate } from '../core/System';
import { SelectionComponent } from '../components/SelectionComponent';
import { OutlineEffect, SimpleOutlineEffect } from './effects/OutlineEffect';

/**
 * Enhanced material system configuration
 */
export interface EnhancedMaterialSystemConfig extends MaterialSystemConfig {
  // Outline rendering
  enableOutlines: boolean;
  outlineColor: string;
  outlineThickness: number;
  outlinePulse: boolean;

  // Animation
  enableTransitions: boolean;
  transitionDuration: number; // seconds

  // Selection effects
  selectionPulseSpeed: number;
  selectionPulseIntensity: number;

  // Use simple outline (better performance)
  useSimpleOutline: boolean;
}

const DEFAULT_ENHANCED_CONFIG: EnhancedMaterialSystemConfig = {
  // Base config
  selectionEmissiveIntensity: 0.3,
  selectionBrightnessBoost: 40,
  hoverBrightnessBoost: 20,
  hoverOpacityChange: 0,
  lockedOpacity: 0.5,
  lockedDesaturate: true,
  hiddenOpacity: 0,

  // Enhanced features
  enableOutlines: true,
  outlineColor: '#4ade80', // Green
  outlineThickness: 3,
  outlinePulse: true,

  enableTransitions: true,
  transitionDuration: 0.3,

  selectionPulseSpeed: 2.0,
  selectionPulseIntensity: 0.2,

  useSimpleOutline: false
};

/**
 * Material animation state
 */
interface MaterialAnimation {
  entityId: string;
  startTime: number;
  duration: number;
  fromState: 'normal' | 'selected' | 'hovered' | 'locked' | 'hidden';
  toState: 'normal' | 'selected' | 'hovered' | 'locked' | 'hidden';
}

/**
 * EnhancedMaterialSystem - Advanced visual effects
 */
export class EnhancedMaterialSystem extends MaterialSystem {
  private enhancedConfig: EnhancedMaterialSystemConfig;
  private outlineEffect: OutlineEffect | SimpleOutlineEffect;
  private renderSystem?: any; // Reference to RenderSystem for mesh access
  private animations: Map<string, MaterialAnimation> = new Map();
  private currentTime: number = 0;

  constructor(
    renderSystem?: any,
    config: Partial<EnhancedMaterialSystemConfig> = {}
  ) {
    const mergedConfig = { ...DEFAULT_ENHANCED_CONFIG, ...config };
    super(mergedConfig);

    this.enhancedConfig = mergedConfig;
    this.renderSystem = renderSystem;

    // Create outline effect
    if (this.enhancedConfig.enableOutlines) {
      const OutlineClass = this.enhancedConfig.useSimpleOutline
        ? SimpleOutlineEffect
        : OutlineEffect;

      this.outlineEffect = new OutlineClass({
        color: new THREE.Color(this.enhancedConfig.outlineColor),
        thickness: this.enhancedConfig.outlineThickness,
        glowStrength: 1.0,
        enablePulse: this.enhancedConfig.outlinePulse,
        pulseSpeed: this.enhancedConfig.selectionPulseSpeed,
        pulseMin: 1.0 - this.enhancedConfig.selectionPulseIntensity,
        pulseMax: 1.0
      });
    } else {
      // Dummy outline effect
      this.outlineEffect = {
        addSelection: () => {},
        removeSelection: () => {},
        clearSelections: () => {},
        update: () => {},
        dispose: () => {}
      } as any;
    }
  }

  /**
   * Enhanced update with animations and outlines
   */
  update(world: World, deltaTime: number): ComponentUpdate[] {
    this.currentTime += deltaTime;

    // Update base material system
    const updates = super.update(world, deltaTime);

    // Update outline effect
    this.outlineEffect.update(deltaTime);

    // Update animations
    if (this.enhancedConfig.enableTransitions) {
      this.updateAnimations(world, deltaTime);
    }

    // Sync outlines with selection state
    if (this.enhancedConfig.enableOutlines && this.renderSystem) {
      this.updateOutlines(world);
    }

    return updates;
  }

  /**
   * Update material animations
   */
  private updateAnimations(world: World, deltaTime: number): void {
    const completedAnimations: string[] = [];

    for (const [entityId, animation] of this.animations.entries()) {
      const elapsed = this.currentTime - animation.startTime;

      if (elapsed >= animation.duration) {
        // Animation complete
        completedAnimations.push(entityId);
      } else {
        // Still animating - could interpolate material properties here
        // For now, we just track the animation state
      }
    }

    // Clean up completed animations
    completedAnimations.forEach((id) => this.animations.delete(id));
  }

  /**
   * Update outline rendering based on selection
   */
  private updateOutlines(world: World): void {
    const entities = world.queryEntities(['Selection']);

    for (const entity of entities) {
      const selection = world.getComponent<SelectionComponent>(
        entity.id,
        'Selection'
      );

      if (!selection) continue;

      // Get mesh from render system
      const mesh = this.renderSystem.getMesh?.(entity.id);
      if (!mesh) continue;

      // Add or remove outline based on selection state
      if (selection.selected && selection.visible) {
        this.outlineEffect.addSelection(mesh);
      } else {
        this.outlineEffect.removeSelection(mesh);
      }
    }
  }

  /**
   * Start transition animation
   */
  private startTransition(
    entityId: string,
    fromState: MaterialAnimation['fromState'],
    toState: MaterialAnimation['toState']
  ): void {
    if (!this.enhancedConfig.enableTransitions) return;

    this.animations.set(entityId, {
      entityId,
      startTime: this.currentTime,
      duration: this.enhancedConfig.transitionDuration,
      fromState,
      toState
    });
  }

  /**
   * Set render system reference
   */
  setRenderSystem(renderSystem: any): void {
    this.renderSystem = renderSystem;
  }

  /**
   * Update outline color
   */
  setOutlineColor(color: string): void {
    this.enhancedConfig.outlineColor = color;
    this.outlineEffect.updateConfig?.({
      color: new THREE.Color(color)
    });
  }

  /**
   * Set outline thickness
   */
  setOutlineThickness(thickness: number): void {
    this.enhancedConfig.outlineThickness = thickness;
    this.outlineEffect.updateConfig?.({
      thickness
    });
  }

  /**
   * Enable/disable outline pulse
   */
  setOutlinePulse(enabled: boolean): void {
    this.enhancedConfig.outlinePulse = enabled;
    this.outlineEffect.updateConfig?.({
      enablePulse: enabled
    });
  }

  /**
   * Get outline effect instance
   */
  getOutlineEffect(): OutlineEffect | SimpleOutlineEffect {
    return this.outlineEffect;
  }

  /**
   * Get enhanced configuration
   */
  getEnhancedConfig(): EnhancedMaterialSystemConfig {
    return { ...this.enhancedConfig };
  }

  /**
   * Update enhanced configuration
   */
  updateEnhancedConfig(config: Partial<EnhancedMaterialSystemConfig>): void {
    this.enhancedConfig = { ...this.enhancedConfig, ...config };

    // Update outline effect config
    if (
      config.outlineColor ||
      config.outlineThickness ||
      config.outlinePulse !== undefined
    ) {
      const outlineConfig: any = {};

      if (config.outlineColor) {
        outlineConfig.color = new THREE.Color(config.outlineColor);
      }
      if (config.outlineThickness !== undefined) {
        outlineConfig.thickness = config.outlineThickness;
      }
      if (config.outlinePulse !== undefined) {
        outlineConfig.enablePulse = config.outlinePulse;
      }
      if (config.selectionPulseSpeed !== undefined) {
        outlineConfig.pulseSpeed = config.selectionPulseSpeed;
      }

      this.outlineEffect.updateConfig?.(outlineConfig);
    }
  }

  /**
   * Dispose of enhanced resources
   */
  dispose(): void {
    this.outlineEffect.dispose();
    this.animations.clear();
  }
}
