/**
 * Basic Integration Example
 *
 * This example demonstrates how to use the ECS system for a landscape design tool:
 * - Create a world and register systems
 * - Add plants and structures as entities
 * - Update the simulation
 * - Handle user interactions (selection, movement)
 * - Sync with Three.js rendering
 */

import * as THREE from 'three';
import { World } from '../core/World';
import {
  TransformSystem,
  MaterialSystem,
  GrowthSystem,
  RenderSystem
} from '../systems';
import {
  createTransformComponent,
  createSphereGeometry,
  createStandardMaterial,
  createSelectionComponent,
  createPlantDataComponent
} from '../components';
import { SelectionComponent } from '../components/SelectionComponent';

/**
 * Initialize the ECS world with all systems
 */
export function initializeWorld(scene: THREE.Scene): World {
  const world = new World();

  // Register systems in priority order
  // 1. Transform system - handles movement/rotation
  const transformSystem = new TransformSystem();
  world.registerSystem(transformSystem);

  // 2. Growth system - updates plant ages and sizes
  const growthSystem = new GrowthSystem({
    realTimeGrowth: false, // Manual control via slider
    enableCareTracking: true,
    pruningIntervalDays: 90,
    fertilizationIntervalDays: 180
  });
  world.registerSystem(growthSystem);

  // Register some growth curves for common plants
  growthSystem.registerGrowthCurve('japanese-maple', {
    agePoints: [0, 1, 3, 5, 10, 20],
    heightPoints: [1, 3, 5, 8, 15, 20],
    widthPoints: [0.5, 2, 4, 6, 12, 18]
  });

  growthSystem.registerGrowthCurve('blue-spruce', {
    agePoints: [0, 1, 3, 5, 10, 20, 40],
    heightPoints: [1, 3, 6, 10, 20, 40, 60],
    widthPoints: [0.5, 2, 3, 5, 10, 15, 20]
  });

  // 3. Material system - updates visual appearance based on selection
  const materialSystem = new MaterialSystem({
    selectionEmissiveIntensity: 0.5,
    selectionBrightnessBoost: 1.2,
    hoverBrightnessBoost: 1.2
  });
  world.registerSystem(materialSystem);

  // 4. Render system - syncs ECS to Three.js
  const renderSystem = new RenderSystem(scene, {
    autoAddToScene: true,
    enableShadows: true,
    frustumCulled: true
  });
  world.registerSystem(renderSystem);

  return world;
}

/**
 * Create a plant entity
 */
export function createPlant(
  world: World,
  speciesId: string,
  commonName: string,
  position: { x: number; y: number; z: number },
  age: number = 1
): string {
  // Create entity
  const entity = world.createEntity('plant');

  // Add Transform component
  world.setComponent(entity.id, createTransformComponent(
    position,
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 1, z: 1 }
  ));

  // Add Geometry component (sphere for now, will be replaced with plant models)
  world.setComponent(entity.id, createSphereGeometry(1, 16));

  // Add Material component
  world.setComponent(entity.id, createStandardMaterial(
    '#22c55e', // Green color
    0.8,       // Roughness
    0          // Metalness
  ));

  // Add Selection component
  world.setComponent(entity.id, createSelectionComponent({
    selected: false,
    visible: true,
    layer: 'plants'
  }));

  // Add PlantData component
  world.setComponent(entity.id, createPlantDataComponent(
    speciesId,
    age,
    {
      commonName,
      maturityHeight: 20,
      maturityWidth: 18,
      waterRequirement: 'medium',
      sunRequirement: 'full',
      shapeType: 'rounded',
      colorPrimary: '#22c55e'
    }
  ));

  return entity.id;
}

/**
 * Create a structure entity (fence, patio, etc.)
 */
export function createStructure(
  world: World,
  structureType: string,
  position: { x: number; y: number; z: number },
  dimensions: { width: number; height: number; depth: number },
  color: string = '#8b7355'
): string {
  const entity = world.createEntity('structure');

  // Transform
  world.setComponent(entity.id, createTransformComponent(
    position,
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 1, z: 1 }
  ));

  // Geometry (box)
  world.setComponent(entity.id, {
    type: 'Geometry',
    geometryType: 'box',
    parameters: {
      width: dimensions.width,
      height: dimensions.height,
      depth: dimensions.depth
    }
  });

  // Material
  world.setComponent(entity.id, createStandardMaterial(
    color,
    0.9, // Rough
    0    // Not metallic
  ));

  // Selection
  world.setComponent(entity.id, createSelectionComponent({
    visible: true,
    layer: 'structures'
  }));

  return entity.id;
}

/**
 * Update loop - call this every frame
 */
export function updateWorld(world: World, deltaTime: number): void {
  world.update(deltaTime);
}

/**
 * Handle entity selection
 */
export function selectEntity(world: World, entityId: string): void {
  const selection = world.getComponent(entityId, 'Selection');
  if (!selection) return;

  // Update selection state
  world.setComponent(entityId, {
    ...selection,
    selected: true
  });
}

/**
 * Deselect all entities
 */
export function deselectAll(world: World): void {
  const allEntities = world.getAllEntities();

  for (const entity of allEntities) {
    const selection = world.getComponent(entity.id, 'Selection') as SelectionComponent | undefined;
    if (selection?.selected) {
      world.setComponent(entity.id, {
        ...selection,
        selected: false
      });
    }
  }
}

/**
 * Move selected entities
 */
export function moveSelected(
  world: World,
  delta: { x: number; y: number; z: number }
): void {
  const transformSystem = world.getSystems().find(s => s.name === 'TransformSystem') as TransformSystem | undefined;
  if (!transformSystem) return;

  // Find all selected entities
  const selectedIds: string[] = [];
  for (const entity of world.getAllEntities()) {
    const selection = world.getComponent(entity.id, 'Selection') as SelectionComponent | undefined;
    if (selection?.selected) {
      selectedIds.push(entity.id);
    }
  }

  // Move them all at once
  const updates = transformSystem.translateMultiple(world, selectedIds, delta);
  for (const update of updates) {
    world.setComponent(update.entityId, update.componentData);
  }
}

/**
 * Set plant age globally (timeline slider)
 */
export function setGlobalPlantAge(world: World, age: number): void {
  const growthSystem = world.getSystems().find(s => s.name === 'GrowthSystem') as GrowthSystem | undefined;
  if (!growthSystem) return;

  const updates = growthSystem.setGlobalAge(world, age);
  for (const update of updates) {
    world.setComponent(update.entityId, update.componentData);
  }
}

/**
 * Raycast to find entity at mouse position
 */
export function raycastEntity(
  world: World,
  camera: THREE.Camera,
  mouse: { x: number; y: number }
): string | null {
  const renderSystem = world.getSystems().find(s => s.name === 'RenderSystem') as RenderSystem | undefined;
  if (!renderSystem) return null;

  // Create raycaster
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);

  // Raycast
  const hits = renderSystem.raycast(raycaster);

  return hits.length > 0 ? hits[0].entityId : null;
}

/**
 * Save world state to JSON
 */
export function saveWorld(world: World): string {
  return world.serialize();
}

/**
 * Load world state from JSON
 */
export function loadWorld(json: string, scene: THREE.Scene): World {
  const world = World.deserialize(json);

  // Re-register systems after deserialization
  // (Systems are not serialized, only entity/component data)
  const renderSystem = new RenderSystem(scene);
  world.registerSystem(new TransformSystem());
  world.registerSystem(new GrowthSystem());
  world.registerSystem(new MaterialSystem());
  world.registerSystem(renderSystem);

  return world;
}

/**
 * Example usage
 */
export function exampleUsage() {
  // 1. Create a Three.js scene
  const scene = new THREE.Scene();

  // 2. Initialize ECS world
  const world = initializeWorld(scene);

  // 3. Create some plants
  const maple1 = createPlant(
    world,
    'japanese-maple',
    'Japanese Maple',
    { x: -5, y: 0, z: 0 },
    5 // 5 years old
  );

  const spruce1 = createPlant(
    world,
    'blue-spruce',
    'Blue Spruce',
    { x: 5, y: 0, z: 0 },
    10 // 10 years old
  );

  // 4. Create a structure (patio)
  const patio = createStructure(
    world,
    'patio',
    { x: 0, y: -1, z: -5 },
    { width: 10, height: 0.2, depth: 10 },
    '#c4a57b' // Tan color
  );

  // 5. Run update loop (in your animation loop)
  const animate = () => {
    requestAnimationFrame(animate);

    const deltaTime = 0.016; // ~60 FPS
    updateWorld(world, deltaTime);

    // Render Three.js scene...
  };
  animate();

  // 6. Handle user interactions
  // When user clicks on canvas...
  const onMouseClick = (event: MouseEvent) => {
    const mouse = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1
    };

    const camera = new THREE.PerspectiveCamera(); // Your actual camera
    const entityId = raycastEntity(world, camera, mouse);

    if (entityId) {
      deselectAll(world);
      selectEntity(world, entityId);
    }
  };

  // 7. Timeline slider
  const onTimelineChange = (age: number) => {
    setGlobalPlantAge(world, age);
  };

  // 8. Save/Load
  const saveButton = document.getElementById('save');
  saveButton?.addEventListener('click', () => {
    const json = saveWorld(world);
    localStorage.setItem('landscape-design', json);
  });

  const loadButton = document.getElementById('load');
  loadButton?.addEventListener('click', () => {
    const json = localStorage.getItem('landscape-design');
    if (json) {
      const newWorld = loadWorld(json, scene);
      // Replace current world with loaded world
    }
  });

  return world;
}
