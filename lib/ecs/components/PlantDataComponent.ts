/**
 * PlantData Component - Plant-specific properties
 *
 * Contains data specific to plants (species, age, growth, etc.)
 * Separated from general Transform/Geometry/Material components
 */

import { Component } from '../core/Component';

export interface PlantDataComponent extends Component {
  readonly type: 'PlantData';

  // Plant identification
  speciesId: string;
  commonName: string;
  scientificName?: string;

  // Growth properties
  age: number;              // Years old
  health: number;           // 0-100
  growthStage: GrowthStage;

  // Size information (calculated from age)
  currentHeight: number;    // Feet
  currentWidth: number;     // Feet
  maturityHeight: number;   // Feet at maturity
  maturityWidth: number;    // Feet at maturity

  // Environmental needs
  waterRequirement: 'low' | 'medium' | 'high';
  sunRequirement: 'full' | 'partial' | 'shade';
  soilType: 'clay' | 'sandy' | 'loamy' | 'any';

  // Visual properties
  shapeType: PlantShapeType;
  colorPrimary: string;     // Hex color
  colorSecondary?: string;  // For fall color, flowers, etc.
  seasonalVariation: boolean;

  // Care properties
  pruningNeeded: boolean;
  lastPruned?: number;      // Days since last pruning
  fertilizationNeeded: boolean;
  lastFertilized?: number;  // Days since last fertilization

  // Metadata
  plantedDate?: string;     // ISO date
  notes?: string;
  tags?: string[];
}

/**
 * Growth stages
 */
export type GrowthStage =
  | 'seedling'     // 0-1 years
  | 'juvenile'     // 1-3 years
  | 'young'        // 3-5 years
  | 'mature'       // 5-15 years
  | 'established'  // 15+ years
  | 'ancient';     // 30+ years

/**
 * Plant shape types (for rendering)
 */
export type PlantShapeType =
  | 'rounded'
  | 'pyramidal'
  | 'columnar'
  | 'weeping'
  | 'vase'
  | 'spreading'
  | 'irregular';

/**
 * Create a new PlantData component
 */
export function createPlantDataComponent(
  speciesId: string,
  age: number = 1,
  options: Partial<PlantDataComponent> = {}
): PlantDataComponent {
  return {
    type: 'PlantData',
    speciesId,
    age,
    commonName: options.commonName ?? 'Unknown Plant',
    scientificName: options.scientificName,
    health: options.health ?? 100,
    growthStage: calculateGrowthStage(age),
    currentHeight: options.currentHeight ?? 1,
    currentWidth: options.currentWidth ?? 1,
    maturityHeight: options.maturityHeight ?? 10,
    maturityWidth: options.maturityWidth ?? 10,
    waterRequirement: options.waterRequirement ?? 'medium',
    sunRequirement: options.sunRequirement ?? 'full',
    soilType: options.soilType ?? 'any',
    shapeType: options.shapeType ?? 'rounded',
    colorPrimary: options.colorPrimary ?? '#22c55e',
    colorSecondary: options.colorSecondary,
    seasonalVariation: options.seasonalVariation ?? false,
    pruningNeeded: options.pruningNeeded ?? false,
    fertilizationNeeded: options.fertilizationNeeded ?? false,
    plantedDate: options.plantedDate,
    notes: options.notes,
    tags: options.tags ?? []
  };
}

/**
 * Calculate growth stage from age
 */
export function calculateGrowthStage(age: number): GrowthStage {
  if (age < 1) return 'seedling';
  if (age < 3) return 'juvenile';
  if (age < 5) return 'young';
  if (age < 15) return 'mature';
  if (age < 30) return 'established';
  return 'ancient';
}

/**
 * Update plant age and recalculate dependent properties
 */
export function updatePlantAge(
  plantData: PlantDataComponent,
  newAge: number,
  calculateSize: (age: number, speciesId: string) => { height: number; width: number }
): PlantDataComponent {
  const newSize = calculateSize(newAge, plantData.speciesId);

  return {
    ...plantData,
    age: newAge,
    growthStage: calculateGrowthStage(newAge),
    currentHeight: newSize.height,
    currentWidth: newSize.width
  };
}

/**
 * Update plant health
 */
export function updateHealth(
  plantData: PlantDataComponent,
  healthChange: number
): PlantDataComponent {
  const newHealth = Math.max(0, Math.min(100, plantData.health + healthChange));
  return { ...plantData, health: newHealth };
}

/**
 * Mark plant as needing care
 */
export function markNeedsCare(
  plantData: PlantDataComponent,
  careType: 'pruning' | 'fertilization'
): PlantDataComponent {
  if (careType === 'pruning') {
    return { ...plantData, pruningNeeded: true };
  } else {
    return { ...plantData, fertilizationNeeded: true };
  }
}

/**
 * Mark plant care as completed
 */
export function completeCare(
  plantData: PlantDataComponent,
  careType: 'pruning' | 'fertilization'
): PlantDataComponent {
  if (careType === 'pruning') {
    return {
      ...plantData,
      pruningNeeded: false,
      lastPruned: 0
    };
  } else {
    return {
      ...plantData,
      fertilizationNeeded: false,
      lastFertilized: 0
    };
  }
}
