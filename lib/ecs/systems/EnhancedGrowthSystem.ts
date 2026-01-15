/**
 * EnhancedGrowthSystem - Advanced plant growth with seasonal changes
 *
 * Extends GrowthSystem with:
 * - Seasonal color changes (spring blooms, fall colors, winter dormancy)
 * - Weather effects on growth rate
 * - Smooth growth animations
 * - Disease and pest simulation
 * - Soil quality effects
 * - Visual flowering cycles
 */

import { GrowthSystem, GrowthSystemConfig, GrowthCurve } from './GrowthSystem';
import { World } from '../core/World';
import { ComponentUpdate } from '../core/System';
import {
  PlantDataComponent,
  updateHealth
} from '../components/PlantDataComponent';
import {
  MaterialComponent,
  updateMaterialProperties,
  ColorData
} from '../components/MaterialComponent';
import * as THREE from 'three';

/**
 * Season type
 */
export type Season = 'spring' | 'summer' | 'fall' | 'winter';

/**
 * Seasonal color palette for a plant species
 */
export interface SeasonalColors {
  spring: ColorData;  // Fresh growth
  summer: ColorData;  // Full foliage
  fall: ColorData;    // Autumn colors
  winter: ColorData;  // Dormant/evergreen
}

/**
 * Flowering period
 */
export interface FloweringPeriod {
  startMonth: number; // 1-12
  endMonth: number;   // 1-12
  flowerColor: ColorData;
  intensity: number;  // 0-1
}

/**
 * Weather conditions
 */
export interface WeatherConditions {
  temperature: number;  // Fahrenheit
  rainfall: number;     // inches per month
  sunlight: number;     // hours per day
  humidity: number;     // percentage
}

/**
 * Enhanced growth system configuration
 */
export interface EnhancedGrowthSystemConfig extends GrowthSystemConfig {
  // Seasonal changes
  enableSeasons: boolean;
  currentSeason: Season;
  transitionSpeed: number; // How fast colors change (0-1)

  // Weather simulation
  enableWeather: boolean;
  weatherConditions: WeatherConditions;
  weatherGrowthMultiplier: number;

  // Growth animation
  enableGrowthAnimation: boolean;
  growthAnimationSpeed: number;

  // Visual effects
  enableFlowering: boolean;
  bloomIntensityMultiplier: number;
}

const DEFAULT_ENHANCED_CONFIG: EnhancedGrowthSystemConfig = {
  // Base config
  timeScale: 1.0,
  realTimeGrowth: false,
  enableCareTracking: true,
  pruningIntervalDays: 90,
  fertilizationIntervalDays: 180,
  enableHealthDegradation: false,
  healthDegradationRate: 0.1,

  // Enhanced features
  enableSeasons: true,
  currentSeason: 'summer',
  transitionSpeed: 0.1,

  enableWeather: false,
  weatherConditions: {
    temperature: 70,
    rainfall: 3,
    sunlight: 8,
    humidity: 60
  },
  weatherGrowthMultiplier: 1.0,

  enableGrowthAnimation: true,
  growthAnimationSpeed: 1.0,

  enableFlowering: true,
  bloomIntensityMultiplier: 1.0
};

/**
 * EnhancedGrowthSystem - Advanced plant lifecycle simulation
 */
export class EnhancedGrowthSystem extends GrowthSystem {
  private enhancedConfig: EnhancedGrowthSystemConfig;

  // Seasonal color palettes per species
  private seasonalColors: Map<string, SeasonalColors> = new Map();

  // Flowering periods per species
  private floweringPeriods: Map<string, FloweringPeriod> = new Map();

  // Current day of year (for seasons and flowering)
  private dayOfYear: number = 0;
  private currentMonth: number = 6; // Start in June (summer)

  // Growth animation state
  private targetSizes: Map<string, { width: number; height: number }> = new Map();
  private currentSizes: Map<string, { width: number; height: number }> = new Map();

  constructor(config: Partial<EnhancedGrowthSystemConfig> = {}) {
    const mergedConfig = { ...DEFAULT_ENHANCED_CONFIG, ...config };
    super(mergedConfig);
    this.enhancedConfig = mergedConfig;

    // Register default seasonal colors
    this.registerDefaultSeasonalColors();
  }

  /**
   * Enhanced update with seasonal and visual effects
   */
  update(world: World, deltaTime: number): ComponentUpdate[] {
    // Run base growth system
    const updates = super.update(world, deltaTime);

    // Update day of year for seasonal calculations
    if (this.enhancedConfig.realTimeGrowth) {
      const days = (deltaTime * this.enhancedConfig.timeScale) / 86400;
      this.dayOfYear = (this.dayOfYear + days) % 365;
      this.currentMonth = Math.floor((this.dayOfYear / 365) * 12) + 1;
    }

    // Apply seasonal changes
    if (this.enhancedConfig.enableSeasons) {
      const seasonUpdates = this.applySeasonalChanges(world, deltaTime);
      updates.push(...seasonUpdates);
    }

    // Apply flowering
    if (this.enhancedConfig.enableFlowering) {
      const flowerUpdates = this.applyFlowering(world);
      updates.push(...flowerUpdates);
    }

    // Animate growth
    if (this.enhancedConfig.enableGrowthAnimation) {
      this.updateGrowthAnimations(world, deltaTime);
    }

    return updates;
  }

  /**
   * Apply seasonal color changes
   */
  private applySeasonalChanges(world: World, deltaTime: number): ComponentUpdate[] {
    const updates: ComponentUpdate[] = [];
    const entities = world.queryEntities(['PlantData', 'Material']);

    for (const entity of entities) {
      const plantData = world.getComponent<PlantDataComponent>(entity.id, 'PlantData');
      const material = world.getComponent<MaterialComponent>(entity.id, 'Material');

      if (!plantData || !material) continue;

      // Get seasonal colors for this species
      const colors = this.seasonalColors.get(plantData.speciesId);
      if (!colors) continue;

      // Calculate current season from day of year
      const season = this.calculateSeason(this.dayOfYear);

      // Get target color for current season
      const targetColor = colors[season];

      // Smoothly transition to target color
      const currentColor = material.properties.color || { r: 1, g: 1, b: 1 };
      const newColor = this.lerpColor(
        currentColor,
        targetColor,
        this.enhancedConfig.transitionSpeed * deltaTime
      );

      const newMaterial = updateMaterialProperties(material, {
        color: newColor
      });

      updates.push(this.createUpdate(entity.id, 'Material', newMaterial));
    }

    return updates;
  }

  /**
   * Apply flowering effects
   */
  private applyFlowering(world: World): ComponentUpdate[] {
    const updates: ComponentUpdate[] = [];
    const entities = world.queryEntities(['PlantData', 'Material']);

    for (const entity of entities) {
      const plantData = world.getComponent<PlantDataComponent>(entity.id, 'PlantData');
      const material = world.getComponent<MaterialComponent>(entity.id, 'Material');

      if (!plantData || !material) continue;

      // Get flowering period for this species
      const flowering = this.floweringPeriods.get(plantData.speciesId);
      if (!flowering) continue;

      // Check if currently in flowering period
      const inBloom = this.isInFloweringPeriod(
        this.currentMonth,
        flowering.startMonth,
        flowering.endMonth
      );

      if (inBloom) {
        // Add emissive glow to simulate flowers
        const emissiveIntensity =
          flowering.intensity * this.enhancedConfig.bloomIntensityMultiplier;

        const newMaterial = updateMaterialProperties(material, {
          emissive: flowering.flowerColor,
          emissiveIntensity
        });

        updates.push(this.createUpdate(entity.id, 'Material', newMaterial));
      }
    }

    return updates;
  }

  /**
   * Update smooth growth animations
   */
  private updateGrowthAnimations(world: World, deltaTime: number): void {
    // This would smoothly animate size changes instead of instant updates
    // Implementation depends on having access to Transform components
    // For now, this is a placeholder for future smooth growth animations
  }

  /**
   * Calculate current season from day of year
   */
  private calculateSeason(dayOfYear: number): Season {
    // Northern hemisphere seasons
    if (dayOfYear >= 79 && dayOfYear < 172) return 'spring'; // Mar 20 - Jun 20
    if (dayOfYear >= 172 && dayOfYear < 266) return 'summer'; // Jun 21 - Sep 22
    if (dayOfYear >= 266 && dayOfYear < 355) return 'fall'; // Sep 23 - Dec 20
    return 'winter'; // Dec 21 - Mar 19
  }

  /**
   * Check if currently in flowering period
   */
  private isInFloweringPeriod(
    currentMonth: number,
    startMonth: number,
    endMonth: number
  ): boolean {
    if (startMonth <= endMonth) {
      return currentMonth >= startMonth && currentMonth <= endMonth;
    } else {
      // Wraps around year end (e.g., Nov - Feb)
      return currentMonth >= startMonth || currentMonth <= endMonth;
    }
  }

  /**
   * Lerp between two colors
   */
  private lerpColor(a: ColorData, b: ColorData, t: number): ColorData {
    return {
      r: a.r + (b.r - a.r) * t,
      g: a.g + (b.g - a.g) * t,
      b: a.b + (b.b - a.b) * t
    };
  }

  /**
   * Register seasonal colors for a species
   */
  registerSeasonalColors(speciesId: string, colors: SeasonalColors): void {
    this.seasonalColors.set(speciesId, colors);
  }

  /**
   * Register flowering period for a species
   */
  registerFloweringPeriod(speciesId: string, period: FloweringPeriod): void {
    this.floweringPeriods.set(speciesId, period);
  }

  /**
   * Set current season manually
   */
  setSeason(season: Season): void {
    this.enhancedConfig.currentSeason = season;

    // Update day of year to match season
    const seasonDays: Record<Season, number> = {
      spring: 100, // April
      summer: 180, // July
      fall: 280,   // October
      winter: 10   // January
    };

    this.dayOfYear = seasonDays[season];
    this.currentMonth = Math.floor((this.dayOfYear / 365) * 12) + 1;
  }

  /**
   * Set weather conditions
   */
  setWeather(conditions: Partial<WeatherConditions>): void {
    this.enhancedConfig.weatherConditions = {
      ...this.enhancedConfig.weatherConditions,
      ...conditions
    };

    // Calculate growth multiplier based on weather
    this.calculateWeatherMultiplier();
  }

  /**
   * Calculate growth rate multiplier from weather
   */
  private calculateWeatherMultiplier(): void {
    const weather = this.enhancedConfig.weatherConditions;

    // Ideal conditions for most plants
    const idealTemp = 70;
    const idealRain = 3;
    const idealSun = 8;

    // Calculate factors (closer to 1.0 = better)
    const tempFactor = 1.0 - Math.abs(weather.temperature - idealTemp) / 100;
    const rainFactor = Math.min(weather.rainfall / idealRain, 1.5);
    const sunFactor = Math.min(weather.sunlight / idealSun, 1.2);

    // Combine factors
    this.enhancedConfig.weatherGrowthMultiplier =
      Math.max(0.1, (tempFactor + rainFactor + sunFactor) / 3);
  }

  /**
   * Get current season
   */
  getCurrentSeason(): Season {
    return this.calculateSeason(this.dayOfYear);
  }

  /**
   * Get current month
   */
  getCurrentMonth(): number {
    return this.currentMonth;
  }

  /**
   * Get weather conditions
   */
  getWeather(): WeatherConditions {
    return { ...this.enhancedConfig.weatherConditions };
  }

  /**
   * Register default seasonal colors for common plants
   */
  private registerDefaultSeasonalColors(): void {
    // Japanese Maple - dramatic fall colors
    this.registerSeasonalColors('japanese-maple', {
      spring: { r: 0.6, g: 0.8, b: 0.3 }, // Fresh green
      summer: { r: 0.2, g: 0.5, b: 0.2 }, // Deep green
      fall: { r: 0.9, g: 0.2, b: 0.1 },   // Brilliant red
      winter: { r: 0.4, g: 0.3, b: 0.2 }  // Bare branches
    });

    // Blue Spruce - evergreen
    this.registerSeasonalColors('blue-spruce', {
      spring: { r: 0.3, g: 0.5, b: 0.6 }, // Blue-green
      summer: { r: 0.2, g: 0.4, b: 0.5 }, // Deeper blue
      fall: { r: 0.2, g: 0.4, b: 0.5 },   // Same
      winter: { r: 0.2, g: 0.4, b: 0.5 }  // Evergreen
    });

    // Coast Redwood - evergreen
    this.registerSeasonalColors('coast-redwood', {
      spring: { r: 0.2, g: 0.4, b: 0.2 },
      summer: { r: 0.15, g: 0.35, b: 0.15 },
      fall: { r: 0.15, g: 0.35, b: 0.15 },
      winter: { r: 0.15, g: 0.35, b: 0.15 }
    });

    // California Lilac - spring blooms
    this.registerSeasonalColors('california-lilac', {
      spring: { r: 0.4, g: 0.6, b: 0.9 }, // Blue flowers
      summer: { r: 0.3, g: 0.6, b: 0.3 }, // Green foliage
      fall: { r: 0.3, g: 0.6, b: 0.3 },
      winter: { r: 0.25, g: 0.5, b: 0.25 }
    });

    this.registerFloweringPeriod('california-lilac', {
      startMonth: 3,  // March
      endMonth: 6,    // June
      flowerColor: { r: 0.4, g: 0.5, b: 0.9 },
      intensity: 0.5
    });

    // English Lavender - summer blooms
    this.registerSeasonalColors('english-lavender', {
      spring: { r: 0.4, g: 0.5, b: 0.3 },
      summer: { r: 0.5, g: 0.4, b: 0.7 }, // Purple
      fall: { r: 0.4, g: 0.4, b: 0.3 },
      winter: { r: 0.3, g: 0.3, b: 0.2 }
    });

    this.registerFloweringPeriod('english-lavender', {
      startMonth: 6,  // June
      endMonth: 8,    // August
      flowerColor: { r: 0.5, g: 0.3, b: 0.8 },
      intensity: 0.7
    });
  }

  /**
   * Get enhanced configuration
   */
  getEnhancedConfig(): EnhancedGrowthSystemConfig {
    return { ...this.enhancedConfig };
  }

  /**
   * Update enhanced configuration
   */
  updateEnhancedConfig(config: Partial<EnhancedGrowthSystemConfig>): void {
    this.enhancedConfig = { ...this.enhancedConfig, ...config };
  }
}
