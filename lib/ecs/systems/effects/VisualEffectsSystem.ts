/**
 * VisualEffectsSystem - Smooth animations and transitions
 *
 * Provides:
 * - Smooth object movement/rotation/scaling
 * - Fade in/out effects
 * - Material property transitions
 * - Easing functions
 * - Animation sequencing
 */

import { BaseSystem, ComponentUpdate, SystemPriority } from '../../core/System';
import { World } from '../../core/World';
import {
  TransformComponent,
  updateTransform
} from '../../components/TransformComponent';
import {
  MaterialComponent,
  updateMaterialProperties,
  ColorData
} from '../../components/MaterialComponent';

/**
 * Easing function type
 */
export type EasingFunction =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInBounce'
  | 'easeOutBounce';

/**
 * Animation types
 */
export type AnimationType =
  | 'move'
  | 'rotate'
  | 'scale'
  | 'fade'
  | 'color'
  | 'custom';

/**
 * Animation definition
 */
export interface Animation {
  id: string;
  entityId: string;
  type: AnimationType;
  duration: number; // seconds
  easing: EasingFunction;
  startTime: number;
  delay?: number; // seconds

  // Transform animations
  from?: Partial<TransformComponent>;
  to?: Partial<TransformComponent>;

  // Material animations
  fromMaterial?: Partial<MaterialComponent>;
  toMaterial?: Partial<MaterialComponent>;

  // Callbacks
  onComplete?: () => void;
  onUpdate?: (progress: number) => void;

  // Custom update function
  customUpdate?: (progress: number, entity: any) => ComponentUpdate[];
}

/**
 * Animation sequence
 */
export interface AnimationSequence {
  id: string;
  animations: Animation[];
  loop: boolean;
  currentIndex: number;
}

/**
 * Visual effects system configuration
 */
export interface VisualEffectsConfig {
  // Enable animations
  enabled: boolean;

  // Default easing
  defaultEasing: EasingFunction;

  // Default duration
  defaultDuration: number;
}

const DEFAULT_CONFIG: VisualEffectsConfig = {
  enabled: true,
  defaultEasing: 'easeOutCubic',
  defaultDuration: 0.5
};

/**
 * VisualEffectsSystem - Smooth animations
 */
export class VisualEffectsSystem extends BaseSystem {
  readonly name = 'VisualEffectsSystem';
  readonly requiredComponents: string[] = []; // Works with any component
  readonly priority = SystemPriority.RENDER - 20; // Before material system

  private config: VisualEffectsConfig;
  private animations: Map<string, Animation> = new Map();
  private sequences: Map<string, AnimationSequence> = new Map();
  private currentTime: number = 0;

  constructor(config: Partial<VisualEffectsConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update animations
   */
  update(world: World, deltaTime: number): ComponentUpdate[] {
    if (!this.config.enabled) return [];

    this.currentTime += deltaTime;

    const updates: ComponentUpdate[] = [];
    const completedAnimations: string[] = [];

    // Update all active animations
    for (const [id, animation] of this.animations.entries()) {
      // Check delay
      if (animation.delay && this.currentTime < animation.startTime + animation.delay) {
        continue;
      }

      const elapsed =
        this.currentTime - animation.startTime - (animation.delay || 0);
      const progress = Math.min(elapsed / animation.duration, 1.0);

      // Apply easing
      const easedProgress = this.applyEasing(progress, animation.easing);

      // Update animation
      const animationUpdates = this.updateAnimation(
        world,
        animation,
        easedProgress
      );
      updates.push(...animationUpdates);

      // Callback
      if (animation.onUpdate) {
        animation.onUpdate(easedProgress);
      }

      // Check completion
      if (progress >= 1.0) {
        completedAnimations.push(id);

        if (animation.onComplete) {
          animation.onComplete();
        }
      }
    }

    // Remove completed animations
    completedAnimations.forEach((id) => {
      this.animations.delete(id);
      this.checkSequenceProgress(id);
    });

    return updates;
  }

  /**
   * Update a single animation
   */
  private updateAnimation(
    world: World,
    animation: Animation,
    progress: number
  ): ComponentUpdate[] {
    const updates: ComponentUpdate[] = [];

    switch (animation.type) {
      case 'move':
      case 'rotate':
      case 'scale':
        const transformUpdate = this.updateTransformAnimation(
          world,
          animation,
          progress
        );
        if (transformUpdate) updates.push(transformUpdate);
        break;

      case 'fade':
      case 'color':
        const materialUpdate = this.updateMaterialAnimation(
          world,
          animation,
          progress
        );
        if (materialUpdate) updates.push(materialUpdate);
        break;

      case 'custom':
        if (animation.customUpdate) {
          const customUpdates = animation.customUpdate(progress, {
            entityId: animation.entityId,
            world
          });
          updates.push(...customUpdates);
        }
        break;
    }

    return updates;
  }

  /**
   * Update transform animation
   */
  private updateTransformAnimation(
    world: World,
    animation: Animation,
    progress: number
  ): ComponentUpdate | null {
    if (!animation.from || !animation.to) return null;

    const transform = world.getComponent<TransformComponent>(
      animation.entityId,
      'Transform'
    );
    if (!transform) return null;

    // Interpolate values
    const newTransform = { ...transform };

    if (animation.from.position && animation.to.position) {
      newTransform.position = {
        x: this.lerp(
          animation.from.position.x || 0,
          animation.to.position.x || 0,
          progress
        ),
        y: this.lerp(
          animation.from.position.y || 0,
          animation.to.position.y || 0,
          progress
        ),
        z: this.lerp(
          animation.from.position.z || 0,
          animation.to.position.z || 0,
          progress
        )
      };
    }

    if (animation.from.rotation && animation.to.rotation) {
      newTransform.rotation = {
        x: this.lerp(
          animation.from.rotation.x || 0,
          animation.to.rotation.x || 0,
          progress
        ),
        y: this.lerp(
          animation.from.rotation.y || 0,
          animation.to.rotation.y || 0,
          progress
        ),
        z: this.lerp(
          animation.from.rotation.z || 0,
          animation.to.rotation.z || 0,
          progress
        )
      };
    }

    if (animation.from.scale && animation.to.scale) {
      newTransform.scale = {
        x: this.lerp(
          animation.from.scale.x || 1,
          animation.to.scale.x || 1,
          progress
        ),
        y: this.lerp(
          animation.from.scale.y || 1,
          animation.to.scale.y || 1,
          progress
        ),
        z: this.lerp(
          animation.from.scale.z || 1,
          animation.to.scale.z || 1,
          progress
        )
      };
    }

    return this.createUpdate(animation.entityId, 'Transform', newTransform);
  }

  /**
   * Update material animation
   */
  private updateMaterialAnimation(
    world: World,
    animation: Animation,
    progress: number
  ): ComponentUpdate | null {
    if (!animation.fromMaterial || !animation.toMaterial) return null;

    const material = world.getComponent<MaterialComponent>(
      animation.entityId,
      'Material'
    );
    if (!material) return null;

    const newMaterial = { ...material };

    // Fade opacity
    if (
      animation.fromMaterial.properties?.opacity !== undefined &&
      animation.toMaterial.properties?.opacity !== undefined
    ) {
      newMaterial.properties = {
        ...newMaterial.properties,
        opacity: this.lerp(
          animation.fromMaterial.properties.opacity,
          animation.toMaterial.properties.opacity,
          progress
        ),
        transparent: true
      };
    }

    // Color transition
    if (
      animation.fromMaterial.properties?.color &&
      animation.toMaterial.properties?.color
    ) {
      newMaterial.properties = {
        ...newMaterial.properties,
        color: this.lerpColor(
          animation.fromMaterial.properties.color,
          animation.toMaterial.properties.color,
          progress
        )
      };
    }

    return this.createUpdate(animation.entityId, 'Material', newMaterial);
  }

  /**
   * Add animation
   */
  addAnimation(animation: Omit<Animation, 'startTime'>): string {
    const id = animation.id || this.generateId();
    const fullAnimation: Animation = {
      ...animation,
      id,
      startTime: this.currentTime,
      easing: animation.easing || this.config.defaultEasing,
      duration: animation.duration || this.config.defaultDuration
    };

    this.animations.set(id, fullAnimation);
    return id;
  }

  /**
   * Remove animation
   */
  removeAnimation(id: string): boolean {
    return this.animations.delete(id);
  }

  /**
   * Create animation sequence
   */
  createSequence(
    id: string,
    animations: Omit<Animation, 'startTime'>[],
    loop: boolean = false
  ): void {
    this.sequences.set(id, {
      id,
      animations: animations.map((anim) => ({
        ...anim,
        id: anim.id || this.generateId(),
        startTime: 0,
        easing: anim.easing || this.config.defaultEasing,
        duration: anim.duration || this.config.defaultDuration
      })),
      loop,
      currentIndex: 0
    });

    // Start first animation
    if (animations.length > 0) {
      this.addAnimation(animations[0]);
    }
  }

  /**
   * Check sequence progress
   */
  private checkSequenceProgress(completedAnimationId: string): void {
    for (const sequence of this.sequences.values()) {
      const currentAnim = sequence.animations[sequence.currentIndex];

      if (currentAnim.id === completedAnimationId) {
        sequence.currentIndex++;

        // Check if sequence complete
        if (sequence.currentIndex >= sequence.animations.length) {
          if (sequence.loop) {
            sequence.currentIndex = 0;
            this.addAnimation(sequence.animations[0]);
          } else {
            this.sequences.delete(sequence.id);
          }
        } else {
          // Start next animation
          this.addAnimation(sequence.animations[sequence.currentIndex]);
        }
      }
    }
  }

  /**
   * Linear interpolation
   */
  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * Color interpolation
   */
  private lerpColor(start: ColorData, end: ColorData, t: number): ColorData {
    return {
      r: this.lerp(start.r, end.r, t),
      g: this.lerp(start.g, end.g, t),
      b: this.lerp(start.b, end.b, t)
    };
  }

  /**
   * Apply easing function
   */
  private applyEasing(t: number, easing: EasingFunction): number {
    switch (easing) {
      case 'linear':
        return t;

      case 'easeIn':
      case 'easeInQuad':
        return t * t;

      case 'easeOut':
      case 'easeOutQuad':
        return t * (2 - t);

      case 'easeInOut':
      case 'easeInOutQuad':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      case 'easeInCubic':
        return t * t * t;

      case 'easeOutCubic':
        return --t * t * t + 1;

      case 'easeInOutCubic':
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

      case 'easeInElastic':
        return t === 0 || t === 1
          ? t
          : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);

      case 'easeOutElastic':
        return t === 0 || t === 1
          ? t
          : Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;

      case 'easeInBounce':
        return 1 - this.applyEasing(1 - t, 'easeOutBounce');

      case 'easeOutBounce':
        if (t < 1 / 2.75) {
          return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }

      default:
        return t;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `anim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active animations count
   */
  getActiveCount(): number {
    return this.animations.size;
  }

  /**
   * Get active sequences count
   */
  getSequenceCount(): number {
    return this.sequences.size;
  }

  /**
   * Clear all animations
   */
  clearAll(): void {
    this.animations.clear();
    this.sequences.clear();
  }

  /**
   * Enable/disable animations
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }
}
