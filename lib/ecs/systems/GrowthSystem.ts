/**
 * GrowthSystem - Plant aging and size calculations
 *
 * Handles:
 * - Plant aging over time
 * - Size calculations based on growth curves
 * - Health deterioration (if unhealthy)
 * - Care requirements tracking
 *
 * This system runs every frame to update plant ages and sizes
 */

import { BaseSystem, ComponentUpdate, SystemPriority } from '../core/System';
import { World } from '../core/World';
import { ComponentType } from '../core/Component';
import {
  PlantDataComponent,
  updatePlantAge,
  updateHealth,
  markNeedsCare
} from '../components/PlantDataComponent';
import {
  TransformComponent,
  updateTransform
} from '../components/TransformComponent';
import {
  GeometryComponent,
  createSphereGeometry
} from '../components/GeometryComponent';

/**
 * Growth curve definition
 */
export interface GrowthCurve {
  agePoints: number[];      // Age milestones (years)
  heightPoints: number[];   // Height at each milestone (feet)
  widthPoints: number[];    // Width at each milestone (feet)
}

/**
 * Growth system configuration
 */
export interface GrowthSystemConfig {
  // Time scale (1.0 = real time, higher = faster growth)
  timeScale: number;

  // Real-time mode vs stepped (false = manual slider control)
  realTimeGrowth: boolean;

  // Care requirements
  enableCareTracking: boolean;
  pruningIntervalDays: number;
  fertilizationIntervalDays: number;

  // Health degradation
  enableHealthDegradation: boolean;
  healthDegradationRate: number; // Per day
}

const DEFAULT_CONFIG: GrowthSystemConfig = {
  timeScale: 1.0,
  realTimeGrowth: false, // Default: manual slider control
  enableCareTracking: true,
  pruningIntervalDays: 90,
  fertilizationIntervalDays: 180,
  enableHealthDegradation: false,
  healthDegradationRate: 0.1
};

export class GrowthSystem extends BaseSystem {
  readonly name = 'GrowthSystem';
  readonly requiredComponents: ComponentType[] = ['PlantData', 'Transform'];
  readonly priority = SystemPriority.LOGIC;

  private config: GrowthSystemConfig;
  private growthCurves: Map<string, GrowthCurve> = new Map();
  private daysSinceStart: number = 0;

  constructor(config: Partial<GrowthSystemConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Update plant growth
   */
  update(world: World, deltaTime: number): ComponentUpdate[] {
    if (!this.config.realTimeGrowth) {
      // Growth controlled manually (by slider)
      return this.updateCareTracking(world, deltaTime);
    }

    const updates: ComponentUpdate[] = [];
    const entities = this.queryEntities(world);

    // Convert deltaTime (seconds) to days
    const days = (deltaTime * this.config.timeScale) / 86400;
    this.daysSinceStart += days;

    for (const entity of entities) {
      const plantData = world.getComponent<PlantDataComponent>(entity.id, 'PlantData');
      const transform = world.getComponent<TransformComponent>(entity.id, 'Transform');

      if (!plantData || !transform) continue;

      // Age the plant
      const yearsGrowth = days / 365;
      const newAge = plantData.age + yearsGrowth;
      const newSize = this.calculatePlantSize(plantData.speciesId, newAge);

      const newPlantData = updatePlantAge(
        plantData,
        newAge,
        (age, speciesId) => this.calculatePlantSize(speciesId, age)
      );

      // Update transform scale based on new size
      const newTransform = updateTransform(transform, {
        scale: {
          x: newSize.width / plantData.maturityWidth,
          y: newSize.height / plantData.maturityHeight,
          z: newSize.width / plantData.maturityWidth
        }
      });

      updates.push(this.createUpdate(entity.id, 'PlantData', newPlantData));
      updates.push(this.createUpdate(entity.id, 'Transform', newTransform));

      // Track care requirements
      if (this.config.enableCareTracking) {
        updates.push(...this.trackCare(entity.id, plantData, days));
      }

      // Health degradation
      if (this.config.enableHealthDegradation && plantData.health < 100) {
        const healthChange = -this.config.healthDegradationRate * days;
        const updatedPlantData = updateHealth(newPlantData, healthChange);
        updates.push(this.createUpdate(entity.id, 'PlantData', updatedPlantData));
      }
    }

    return updates;
  }

  /**
   * Update care tracking (runs even when growth is paused)
   */
  private updateCareTracking(world: World, deltaTime: number): ComponentUpdate[] {
    if (!this.config.enableCareTracking) return [];

    const updates: ComponentUpdate[] = [];
    const entities = this.queryEntities(world);
    const days = (deltaTime * this.config.timeScale) / 86400;

    for (const entity of entities) {
      const plantData = world.getComponent<PlantDataComponent>(entity.id, 'PlantData');
      if (!plantData) continue;

      updates.push(...this.trackCare(entity.id, plantData, days));
    }

    return updates;
  }

  /**
   * Track care requirements
   */
  private trackCare(
    entityId: string,
    plantData: PlantDataComponent,
    days: number
  ): ComponentUpdate[] {
    const updates: ComponentUpdate[] = [];
    let updated = plantData;

    // Track pruning
    if (updated.lastPruned !== undefined) {
      const daysSincePruning = (updated.lastPruned ?? 0) + days;
      if (daysSincePruning >= this.config.pruningIntervalDays) {
        updated = markNeedsCare(updated, 'pruning');
      }
      updated = { ...updated, lastPruned: daysSincePruning };
    }

    // Track fertilization
    if (updated.lastFertilized !== undefined) {
      const daysSinceFertilization = (updated.lastFertilized ?? 0) + days;
      if (daysSinceFertilization >= this.config.fertilizationIntervalDays) {
        updated = markNeedsCare(updated, 'fertilization');
      }
      updated = { ...updated, lastFertilized: daysSinceFertilization };
    }

    if (updated !== plantData) {
      updates.push(this.createUpdate(entityId, 'PlantData', updated));
    }

    return updates;
  }

  /**
   * Calculate plant size based on age using growth curves
   */
  calculatePlantSize(speciesId: string, age: number): { height: number; width: number } {
    const curve = this.growthCurves.get(speciesId);

    if (!curve) {
      // Default linear growth if no curve defined
      return this.defaultGrowthCurve(age);
    }

    // Interpolate between age points
    const height = this.interpolate(age, curve.agePoints, curve.heightPoints);
    const width = this.interpolate(age, curve.agePoints, curve.widthPoints);

    return { height, width };
  }

  /**
   * Default growth curve (linear with diminishing returns)
   */
  private defaultGrowthCurve(age: number): { height: number; width: number } {
    const maturityAge = 15;
    const maturityHeight = 10;
    const maturityWidth = 10;

    // S-curve growth (fast initially, slows near maturity)
    const growthFactor = 1 - Math.exp(-age / maturityAge);

    return {
      height: maturityHeight * growthFactor,
      width: maturityWidth * growthFactor
    };
  }

  /**
   * Linear interpolation between points
   */
  private interpolate(x: number, xPoints: number[], yPoints: number[]): number {
    if (xPoints.length === 0) return 0;
    if (x <= xPoints[0]) return yPoints[0];
    if (x >= xPoints[xPoints.length - 1]) return yPoints[yPoints.length - 1];

    // Find surrounding points
    for (let i = 0; i < xPoints.length - 1; i++) {
      if (x >= xPoints[i] && x <= xPoints[i + 1]) {
        const t = (x - xPoints[i]) / (xPoints[i + 1] - xPoints[i]);
        return yPoints[i] + t * (yPoints[i + 1] - yPoints[i]);
      }
    }

    return yPoints[yPoints.length - 1];
  }

  /**
   * Register a growth curve for a species
   */
  registerGrowthCurve(speciesId: string, curve: GrowthCurve): void {
    this.growthCurves.set(speciesId, curve);
  }

  /**
   * Set plant age directly (for manual slider control)
   */
  setPlantAge(
    world: World,
    entityId: string,
    age: number
  ): ComponentUpdate[] {
    const updates: ComponentUpdate[] = [];
    const plantData = world.getComponent<PlantDataComponent>(entityId, 'PlantData');
    const transform = world.getComponent<TransformComponent>(entityId, 'Transform');

    if (!plantData || !transform) return [];

    const newSize = this.calculatePlantSize(plantData.speciesId, age);
    const newPlantData = updatePlantAge(
      plantData,
      age,
      (age, speciesId) => this.calculatePlantSize(speciesId, age)
    );

    // Update transform scale
    const newTransform = updateTransform(transform, {
      scale: {
        x: newSize.width / plantData.maturityWidth,
        y: newSize.height / plantData.maturityHeight,
        z: newSize.width / plantData.maturityWidth
      }
    });

    updates.push(this.createUpdate(entityId, 'PlantData', newPlantData));
    updates.push(this.createUpdate(entityId, 'Transform', newTransform));

    return updates;
  }

  /**
   * Set all plants to a specific age (for global timeline slider)
   */
  setGlobalAge(world: World, age: number): ComponentUpdate[] {
    const updates: ComponentUpdate[] = [];
    const entities = this.queryEntities(world);

    for (const entity of entities) {
      updates.push(...this.setPlantAge(world, entity.id, age));
    }

    return updates;
  }

  /**
   * Reset growth system time
   */
  resetTime(): void {
    this.daysSinceStart = 0;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<GrowthSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get system statistics
   */
  getStats() {
    return {
      daysSinceStart: this.daysSinceStart,
      yearsSinceStart: this.daysSinceStart / 365,
      registeredSpecies: this.growthCurves.size,
      config: this.config
    };
  }
}
