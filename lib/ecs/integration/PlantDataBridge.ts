/**
 * Plant Data Bridge
 * Connects existing plant library data with ECS GrowthSystem
 *
 * This module:
 * - Registers growth curves from plantData.ts into GrowthSystem
 * - Provides unified growth calculation that uses ECS
 * - Converts PlacedPlant to ECS entities
 */

import * as THREE from 'three';
import { World } from '../core/World';
import { GrowthSystem, GrowthCurve } from '../systems/GrowthSystem';
import { PlantRenderSystem } from '../systems/PlantRenderSystem';
import { TransformComponent, createTransformComponent } from '../components/TransformComponent';
import { PlantDataComponent, createPlantDataComponent } from '../components/PlantDataComponent';
import { SelectionComponent, createSelectionComponent } from '../components/SelectionComponent';
import { PLANT_LIBRARY, PlantSpecies, PlacedPlant } from '@/lib/plantData';

/**
 * Initialize GrowthSystem with all plant species from the library
 */
export function registerAllPlantGrowthCurves(growthSystem: GrowthSystem): void {
  for (const species of PLANT_LIBRARY) {
    const curve = createGrowthCurveFromSpecies(species);
    growthSystem.registerGrowthCurve(species.id, curve);
  }

  console.log(`Registered ${PLANT_LIBRARY.length} plant growth curves with ECS GrowthSystem`);
}

/**
 * Convert plant species growth data to ECS GrowthCurve format
 */
function createGrowthCurveFromSpecies(species: PlantSpecies): GrowthCurve {
  // Extract growth data points
  const agePoints: number[] = [];
  const heightPoints: number[] = [];
  const widthPoints: number[] = [];

  // Sample every 5 years for performance
  const interval = 5;
  for (let i = 0; i < species.growthData.baseHeightGrowth.length; i += interval) {
    agePoints.push(i);
    heightPoints.push(species.growthData.baseHeightGrowth[i]);
    widthPoints.push(species.growthData.baseWidthGrowth[i]);
  }

  // Always include the final year
  if (agePoints[agePoints.length - 1] !== species.growthData.baseHeightGrowth.length - 1) {
    const lastIndex = species.growthData.baseHeightGrowth.length - 1;
    agePoints.push(lastIndex);
    heightPoints.push(species.growthData.baseHeightGrowth[lastIndex]);
    widthPoints.push(species.growthData.baseWidthGrowth[lastIndex]);
  }

  return {
    agePoints,
    heightPoints,
    widthPoints
  };
}

/**
 * Convert PlacedPlant to ECS entity
 */
export function createPlantEntity(
  world: World,
  plant: PlacedPlant
): string {
  // Create entity
  const entity = world.createEntity('plant', plant.id);

  // Add Transform component
  const transform = createTransformComponent(
    plant.position,
    { x: 0, y: plant.rotation, z: 0 },
    { x: plant.scale, y: plant.scale, z: plant.scale }
  );
  world.setComponent(entity.id, transform);

  // Add PlantData component
  const plantData = createPlantDataComponent(
    plant.speciesId,
    plant.age
  );
  world.setComponent(entity.id, plantData);

  // Add Selection component
  const selection = createSelectionComponent({
    selected: plant.selected ?? false
  });
  world.setComponent(entity.id, selection);

  return entity.id;
}

/**
 * Convert ECS entity back to PlacedPlant
 */
export function entityToPlacedPlant(
  world: World,
  entityId: string
): PlacedPlant | null {
  const entity = world.getEntity(entityId);
  const transform = world.getComponent<TransformComponent>(entityId, 'Transform');
  const plantData = world.getComponent<PlantDataComponent>(entityId, 'PlantData');
  const selection = world.getComponent<SelectionComponent>(entityId, 'Selection');

  if (!entity || !transform || !plantData) return null;

  return {
    id: entityId,
    speciesId: plantData.speciesId,
    position: { ...transform.position },
    rotation: transform.rotation.y,
    scale: transform.scale.x,
    age: plantData.age,
    variant: 0, // Default variant
    selected: selection?.selected ?? false
  };
}

/**
 * Sync PlacedPlant array to ECS World
 * Returns map of plant ID to entity ID
 */
export function syncPlantsToECS(
  world: World,
  plants: PlacedPlant[]
): Map<string, string> {
  const plantIdToEntityId = new Map<string, string>();

  // Get existing plant entities
  const existingEntities = world.getEntitiesByType('plant');
  const existingIds = new Set(existingEntities.map(e => e.id));

  // Track which entities should exist
  const shouldExist = new Set<string>();

  // Create or update entities for each plant
  for (const plant of plants) {
    let entityId: string;

    if (existingIds.has(plant.id)) {
      // Update existing entity
      entityId = plant.id;
      updatePlantEntity(world, entityId, plant);
    } else {
      // Create new entity
      entityId = createPlantEntity(world, plant);
    }

    shouldExist.add(entityId);
    plantIdToEntityId.set(plant.id, entityId);
  }

  // Remove entities that no longer exist in plants array
  for (const entity of existingEntities) {
    if (!shouldExist.has(entity.id)) {
      world.removeEntity(entity.id);
    }
  }

  return plantIdToEntityId;
}

/**
 * Update existing plant entity from PlacedPlant
 */
function updatePlantEntity(
  world: World,
  entityId: string,
  plant: PlacedPlant
): void {
  // Update Transform
  const transform = world.getComponent<TransformComponent>(entityId, 'Transform');
  if (transform) {
    const updated = {
      ...transform,
      position: plant.position,
      rotation: { x: 0, y: plant.rotation, z: 0 },
      scale: { x: plant.scale, y: plant.scale, z: plant.scale }
    };
    world.setComponent(entityId, updated);
  }

  // Update PlantData
  const plantData = world.getComponent<PlantDataComponent>(entityId, 'PlantData');
  if (plantData) {
    const updated = {
      ...plantData,
      age: plant.age,
      scale: plant.scale,
      variant: plant.variant
    };
    world.setComponent(entityId, updated);
  }

  // Update Selection
  const selection = world.getComponent<SelectionComponent>(entityId, 'Selection');
  if (selection) {
    const updated = {
      ...selection,
      selected: plant.selected ?? false
    };
    world.setComponent(entityId, updated);
  }
}

/**
 * Sync ECS World back to PlacedPlant array
 */
export function syncECSToPlants(world: World): PlacedPlant[] {
  const entities = world.getEntitiesByType('plant');
  const plants: PlacedPlant[] = [];

  for (const entity of entities) {
    const plant = entityToPlacedPlant(world, entity.id);
    if (plant) {
      plants.push(plant);
    }
  }

  return plants;
}

/**
 * Calculate plant size using GrowthSystem
 * This replaces the duplicate calculatePlantSize from plantData.ts
 */
export function calculatePlantSizeECS(
  growthSystem: GrowthSystem,
  speciesId: string,
  age: number,
  scale: number = 1
): { width: number; height: number } {
  const baseSize = growthSystem.calculatePlantSize(speciesId, age);

  return {
    width: baseSize.width * scale,
    height: baseSize.height * scale
  };
}

/**
 * Create a fully initialized ECS World for the design app
 */
export function createDesignWorld(scene?: THREE.Scene): {
  world: World;
  growthSystem: GrowthSystem;
  plantRenderSystem: PlantRenderSystem;
} {
  const world = new World();

  // Create systems
  const growthSystem = new GrowthSystem({
    realTimeGrowth: false, // Controlled by slider
    enableCareTracking: true
  });

  const plantRenderSystem = new PlantRenderSystem(scene, {
    detailLevel: 'medium',
    enableShadows: true
  });

  // Register growth curves
  registerAllPlantGrowthCurves(growthSystem);

  // Register systems with world
  world.registerSystem(growthSystem);
  world.registerSystem(plantRenderSystem);

  return {
    world,
    growthSystem,
    plantRenderSystem
  };
}

/**
 * Batch create plant entities from array
 */
export function createPlantEntities(
  world: World,
  plants: PlacedPlant[]
): string[] {
  return plants.map(plant => createPlantEntity(world, plant));
}

/**
 * Set age for all plants (timeline slider)
 */
export function setGlobalPlantAge(
  world: World,
  growthSystem: GrowthSystem,
  age: number
): void {
  const updates = growthSystem.setGlobalAge(world, age);

  // Apply updates
  for (const update of updates) {
    world.setComponent(update.entityId, update.componentData);
  }
}

/**
 * Get plant entity by original plant ID
 */
export function getPlantEntity(
  world: World,
  plantId: string
): { entity: any; transform: TransformComponent; plantData: PlantDataComponent } | null {
  const entity = world.getEntity(plantId);
  if (!entity) return null;

  const transform = world.getComponent<TransformComponent>(plantId, 'Transform');
  const plantData = world.getComponent<PlantDataComponent>(plantId, 'PlantData');

  if (!transform || !plantData) return null;

  return { entity, transform, plantData };
}
