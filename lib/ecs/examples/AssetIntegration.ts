/**
 * Asset Integration Example
 *
 * Demonstrates how to use the AssetManager with the ECS system
 * for loading and rendering 3D models and PBR textures
 */

import * as THREE from 'three';
import { World } from '../core/World';
import {
  TransformSystem,
  MaterialSystem,
  GrowthSystem,
  EnhancedRenderSystem
} from '../systems';
import {
  createTransformComponent,
  createAssetComponent,
  createSelectionComponent,
  createPlantDataComponent
} from '../components';
import { AssetManager } from '../assets';

/**
 * Initialize world with AssetManager integration
 */
export async function initializeWorldWithAssets(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  camera: THREE.Camera
): Promise<{ world: World; assetManager: AssetManager }> {
  // Create asset manager
  const assetManager = new AssetManager(renderer, {
    debug: true,
    texture: {
      basePath: '/assets/textures',
      maxAnisotropy: renderer.capabilities.getMaxAnisotropy()
    },
    model: {
      basePath: '/assets/models',
      enableDraco: true,
      dracoDecoderPath: '/draco/',
      optimize: true
    }
  });

  // Load asset manifest
  await assetManager.loadManifest('/assets/manifest.json');

  // Preload high-priority assets
  await assetManager.preload((loaded, total) => {
    console.log(`Loading assets: ${loaded}/${total}`);
  });

  // Create world
  const world = new World();

  // Register systems
  world.registerSystem(new TransformSystem());
  world.registerSystem(new GrowthSystem({
    realTimeGrowth: false,
    enableCareTracking: true
  }));
  world.registerSystem(new MaterialSystem());

  // Register enhanced render system with asset manager
  const renderSystem = new EnhancedRenderSystem(scene, assetManager, {
    autoAddToScene: true,
    enableShadows: true,
    enableLOD: true,
    lodUpdateInterval: 100,
    camera
  });
  world.registerSystem(renderSystem);

  return { world, assetManager };
}

/**
 * Create plant entity using assets
 */
export function createPlantWithAsset(
  world: World,
  speciesId: string,
  modelId: string,
  position: { x: number; y: number; z: number },
  age: number = 5
): string {
  const entity = world.createEntity('plant');

  // Transform component
  world.setComponent(
    entity.id,
    createTransformComponent(
      position,
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1 }
    )
  );

  // Asset component (references the 3D model)
  world.setComponent(
    entity.id,
    createAssetComponent({
      modelId,
      useLOD: true,
      instanceable: false
    })
  );

  // Selection component
  world.setComponent(
    entity.id,
    createSelectionComponent({
      visible: true,
      layer: 'plants'
    })
  );

  // Plant data component
  world.setComponent(
    entity.id,
    createPlantDataComponent(speciesId, age, {
      commonName: speciesId,
      maturityHeight: 20,
      maturityWidth: 18,
      waterRequirement: 'medium',
      sunRequirement: 'full'
    })
  );

  return entity.id;
}

/**
 * Create structure entity using assets
 */
export function createStructureWithAsset(
  world: World,
  structureType: string,
  modelId: string,
  position: { x: number; y: number; z: number }
): string {
  const entity = world.createEntity('structure');

  // Transform component
  world.setComponent(
    entity.id,
    createTransformComponent(
      position,
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1 }
    )
  );

  // Asset component
  world.setComponent(
    entity.id,
    createAssetComponent({
      modelId,
      useLOD: false,
      instanceable: false
    })
  );

  // Selection component
  world.setComponent(
    entity.id,
    createSelectionComponent({
      visible: true,
      layer: 'structures'
    })
  );

  return entity.id;
}

/**
 * Create ground plane with texture
 */
export function createGroundWithTexture(
  world: World,
  textureId: string,
  size: number = 100
): string {
  const entity = world.createEntity('ground');

  // Transform component
  world.setComponent(
    entity.id,
    createTransformComponent(
      { x: 0, y: -0.5, z: 0 },
      { x: -Math.PI / 2, y: 0, z: 0 },
      { x: 1, y: 1, z: 1 }
    )
  );

  // Asset component with texture
  world.setComponent(
    entity.id,
    createAssetComponent({
      textureId
    })
  );

  // For ground, we still use geometry component
  world.setComponent(entity.id, {
    type: 'Geometry',
    geometryType: 'plane',
    parameters: {
      width: size,
      height: size,
      widthSegments: 10,
      heightSegments: 10
    }
  });

  // Material component
  world.setComponent(entity.id, {
    type: 'Material',
    materialType: 'standard',
    properties: {
      color: { r: 1, g: 1, b: 1 },
      roughness: 0.9,
      metalness: 0
    }
  });

  // Selection component
  world.setComponent(
    entity.id,
    createSelectionComponent({
      visible: true,
      locked: true,
      layer: 'ground'
    })
  );

  return entity.id;
}

/**
 * Complete example usage
 */
export async function exampleWithAssets() {
  // Setup Three.js
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 20, 30);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 20, 10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Initialize ECS world with assets
  const { world, assetManager } = await initializeWorldWithAssets(
    scene,
    renderer,
    camera
  );

  // Create ground with grass texture
  const ground = createGroundWithTexture(world, 'grass-texture', 100);

  // Create plants using 3D models from assets
  const maple1 = createPlantWithAsset(
    world,
    'japanese-maple',
    'japanese-maple-model',
    { x: -10, y: 0, z: 0 },
    5
  );

  const spruce1 = createPlantWithAsset(
    world,
    'blue-spruce',
    'blue-spruce-model',
    { x: 10, y: 0, z: 0 },
    10
  );

  const redwood1 = createPlantWithAsset(
    world,
    'coast-redwood',
    'coast-redwood-model',
    { x: 0, y: 0, z: -15 },
    15
  );

  // Create structures using 3D models
  const fence1 = createStructureWithAsset(
    world,
    'fence',
    'wooden-fence-model',
    { x: -20, y: 0, z: 10 }
  );

  const patio1 = createStructureWithAsset(
    world,
    'patio',
    'stone-patio-model',
    { x: 0, y: -1, z: 10 }
  );

  const bench1 = createStructureWithAsset(
    world,
    'furniture',
    'garden-bench-model',
    { x: 5, y: 0, z: 12 }
  );

  // Get asset statistics
  const stats = assetManager.getStats();
  console.log('Asset Statistics:', stats);

  // Animation loop
  let lastTime = performance.now();

  function animate() {
    requestAnimationFrame(animate);

    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    // Update ECS world
    world.update(deltaTime);

    // Render scene
    renderer.render(scene, camera);
  }

  animate();

  // Example: Browse available assets
  console.log('Available plant models:');
  const manifest = assetManager.getManifest();
  if (manifest) {
    const plantAssets = manifest.assets.filter(
      (a) => a.category === 'plants'
    );
    plantAssets.forEach((asset) => {
      console.log(`- ${asset.name} (${asset.id})`);
      console.log(`  Tags: ${asset.tags?.join(', ')}`);
      console.log(`  Priority: ${asset.priority}`);
    });
  }

  // Example: Search by tag
  console.log('\nNorthern California native plants:');
  const nativeAssets = assetManager.searchByTag('native');
  nativeAssets.forEach((asset) => {
    console.log(`- ${asset.name}`);
  });

  // Example: Cleanup (when leaving design tool)
  function cleanup() {
    assetManager.dispose();
    world.getSystems().forEach((system) => {
      if ('dispose' in system && typeof system.dispose === 'function') {
        (system as any).dispose();
      }
    });
  }

  // Call cleanup when user leaves
  window.addEventListener('beforeunload', cleanup);

  return { world, assetManager, scene, camera, renderer };
}

/**
 * Example: Dynamically add plants from asset catalog
 */
export async function addPlantFromCatalog(
  world: World,
  assetManager: AssetManager,
  category: string = 'plants'
): Promise<void> {
  // Get available plant assets
  const plantAssets = assetManager.getAssetsByCategory(category);

  console.log(`Available plants in ${category}:`);
  plantAssets.forEach((asset, index) => {
    console.log(`${index + 1}. ${asset.name}`);
  });

  // For this example, add the first one
  if (plantAssets.length > 0) {
    const asset = plantAssets[0];
    const randomX = (Math.random() - 0.5) * 30;
    const randomZ = (Math.random() - 0.5) * 30;

    createPlantWithAsset(
      world,
      asset.id,
      asset.id,
      { x: randomX, y: 0, z: randomZ },
      Math.floor(Math.random() * 10) + 1
    );

    console.log(`Added ${asset.name} at (${randomX.toFixed(1)}, 0, ${randomZ.toFixed(1)})`);
  }
}
