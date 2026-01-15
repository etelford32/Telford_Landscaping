# ECS (Entity Component System) Architecture

A lightweight, deterministic ECS implementation for the landscape design tool.

## 🎯 Design Principles

1. **Separation of Concerns**: UI, Logic, and Data are completely separate
2. **Determinism**: Same inputs always produce same outputs
3. **Immutability**: All operations return new data, never mutate
4. **Serializable**: Entire world state can be saved/loaded as JSON
5. **Testable**: Pure functions make testing trivial

## 📦 Architecture Overview

```
Entity (ID + Type)
    ↓
Components (Pure Data)
    ↓
Systems (Pure Logic)
    ↓
World (Registry)
```

- **Entities**: Just an ID and type (e.g., "plant-123", type: "plant")
- **Components**: Data buckets (Transform, Geometry, Material, etc.)
- **Systems**: Logic that operates on components (pure functions)
- **World**: Manages entities and components, runs systems

## 🚀 Quick Start

### Creating Entities and Components

```typescript
import { World } from './core/World';
import {
  createTransformComponent,
  createSphereGeometry,
  createStandardMaterial,
  createPlantDataComponent
} from './components';

// Create a new world
const world = new World();

// Create a plant entity
const plant = world.createEntity('plant');

// Add components
world.setComponent(plant.id, createTransformComponent(
  { x: 0, y: 0, z: 0 },  // position
  { x: 0, y: 0, z: 0 },  // rotation
  { x: 1, y: 1, z: 1 }   // scale
));

world.setComponent(plant.id, createSphereGeometry(2.5, 32));

world.setComponent(plant.id, createStandardMaterial('#22c55e', 0.8, 0));

world.setComponent(plant.id, createPlantDataComponent(
  'japanese-maple',
  5,  // age
  {
    commonName: 'Japanese Maple',
    shapeType: 'rounded',
    maturityHeight: 15,
    maturityWidth: 15
  }
));
```

### Querying Entities

```typescript
// Find all entities with Transform and Geometry components
const renderables = world.queryEntities(['Transform', 'Geometry', 'Material']);

// Query with component data
const results = world.queryWithComponents(['Transform', 'PlantData']);

for (const { entity, components } of results) {
  const transform = components.get('Transform');
  const plantData = components.get('PlantData');

  console.log(`Plant ${entity.id} at position ${transform.position.x}, ${transform.position.z}`);
}
```

### Creating Systems

```typescript
import { BaseSystem, ComponentUpdate } from './core/System';
import { World } from './core/World';
import { updatePlantAge } from './components/PlantDataComponent';

class GrowthSystem extends BaseSystem {
  readonly name = 'GrowthSystem';
  readonly requiredComponents = ['PlantData'];

  update(world: World, deltaTime: number): ComponentUpdate[] {
    const updates: ComponentUpdate[] = [];

    // Query all plants
    const plants = this.queryEntities(world);

    for (const plant of plants) {
      const plantData = world.getComponent(plant.id, 'PlantData');
      if (!plantData) continue;

      // Age plants over time (1 year = 365 days in simulation)
      const ageIncrease = deltaTime * (1 / 365);
      const newPlantData = updatePlantAge(
        plantData,
        plantData.age + ageIncrease,
        calculatePlantSize  // Your size calculation function
      );

      updates.push(this.createUpdate(plant.id, 'PlantData', newPlantData));
    }

    return updates;
  }
}

// Register system
world.registerSystem(new GrowthSystem());
```

### Running the Simulation

```typescript
// In your game loop / React useFrame hook
function gameLoop(deltaTime: number) {
  // Update all systems
  world.update(deltaTime);

  // Systems have now updated all components
  // Render system would then create Three.js meshes from components
}
```

## 🔧 Component Types

### Transform
Position, rotation, scale in 3D space.

```typescript
createTransformComponent(
  { x: 10, y: 0, z: 5 },     // position
  { x: 0, y: Math.PI/4, z: 0 }, // rotation (radians)
  { x: 1.5, y: 1.5, z: 1.5 }    // scale
)
```

### Geometry
Defines the 3D shape (sphere, box, cylinder, etc.)

```typescript
createSphereGeometry(radius, segments);
createBoxGeometry(width, height, depth);
createCylinderGeometry(radiusTop, radiusBottom, height, segments);
```

### Material
Visual appearance (PBR properties)

```typescript
// Standard material
createStandardMaterial(
  '#22c55e',  // color
  0.8,        // roughness (0=shiny, 1=matte)
  0           // metalness (0=plastic, 1=metal)
);

// Textured material
createTexturedMaterial(
  'grass-albedo-map-id',
  {
    normalMapId: 'grass-normal-map-id',
    roughness: 0.9
  }
);
```

### Selection
UI interaction state

```typescript
createSelectionComponent({
  selected: false,
  hovered: false,
  locked: false,
  visible: true,
  layer: 'plants'
});
```

### PlantData
Plant-specific properties

```typescript
createPlantDataComponent(
  'japanese-maple',  // speciesId
  5,                 // age
  {
    commonName: 'Japanese Maple',
    shapeType: 'rounded',
    colorPrimary: '#8b4513',
    waterRequirement: 'medium',
    sunRequirement: 'partial'
  }
);
```

## 💾 Serialization

Save and load entire world state:

```typescript
// Save
const json = world.serialize();
localStorage.setItem('landscape-design', json);

// Load
const json = localStorage.getItem('landscape-design');
const world = World.deserialize(json);
```

## 🔄 Undo/Redo

Create snapshots for undo/redo:

```typescript
// Before making changes
const snapshot = world.snapshot();
undoStack.push(snapshot);

// To undo
const previousState = undoStack.pop();
world.restore(previousState);
```

## 🧪 Testing

All systems are pure functions, making testing trivial:

```typescript
import { GrowthSystem } from './systems/GrowthSystem';

test('plants age over time', () => {
  const world = new World();
  const system = new GrowthSystem();

  // Create a test plant
  const plant = world.createEntity('plant');
  world.setComponent(plant.id, createPlantDataComponent('oak', 5));

  // Run system for 1 year
  const updates = system.update(world, 365);

  // Apply updates
  for (const update of updates) {
    world.setComponent(update.entityId, update.componentData);
  }

  // Check result
  const plantData = world.getComponent(plant.id, 'PlantData');
  expect(plantData.age).toBe(6);
});
```

## 🎨 Integration with Three.js

The ECS is completely separate from Three.js. A RenderSystem bridges the gap:

```typescript
class RenderSystem extends BaseSystem {
  readonly name = 'RenderSystem';
  readonly requiredComponents = ['Transform', 'Geometry', 'Material'];

  // Store Three.js meshes (mutable cache)
  private meshCache = new Map<string, THREE.Mesh>();

  update(world: World, deltaTime: number): ComponentUpdate[] {
    const entities = this.queryEntities(world);

    for (const entity of entities) {
      const transform = world.getComponent(entity.id, 'Transform');
      const geometry = world.getComponent(entity.id, 'Geometry');
      const material = world.getComponent(entity.id, 'Material');

      // Get or create Three.js mesh
      let mesh = this.meshCache.get(entity.id);
      if (!mesh) {
        mesh = this.createMesh(geometry, material);
        this.meshCache.set(entity.id, mesh);
      }

      // Update mesh from components
      mesh.position.set(transform.position.x, transform.position.y, transform.position.z);
      mesh.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
      mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z);
    }

    return []; // RenderSystem doesn't update components
  }

  private createMesh(geometry: GeometryComponent, material: MaterialComponent): THREE.Mesh {
    // Convert ECS geometry to Three.js geometry
    const threeGeometry = this.createThreeGeometry(geometry);
    const threeMaterial = this.createThreeMaterial(material);
    return new THREE.Mesh(threeGeometry, threeMaterial);
  }
}
```

## 📊 Performance

- **Query optimization**: Entities are indexed by component type
- **Immutability**: Uses structural sharing (shallow copies)
- **No unnecessary re-renders**: UI only updates when component data changes
- **Deterministic**: Easy to profile and optimize

## ✅ Completed Systems

### TransformSystem
Handles movement, rotation, and scaling operations:
- `translate()` - Move entities (relative or absolute)
- `rotate()` - Rotate entities
- `scale()` - Scale entities
- `snapToGrid()` - Snap to grid alignment
- `lookAt()` - Orient entity toward target
- `getDistance()` - Calculate distance between entities
- `translateMultiple()` - Batch move operations

### MaterialSystem
Updates materials based on selection/hover state:
- Selection highlights (emissive glow)
- Hover effects (brightness modulation)
- Locked entity visuals (desaturated + transparent)
- Hidden entity handling
- Caches original materials for reset

### GrowthSystem
Plant aging and size calculations:
- Real-time or manual growth control
- Growth curve interpolation (custom per species)
- Care tracking (pruning, fertilization intervals)
- Health degradation over time
- Global age control (timeline slider)

### RenderSystem
Bridges ECS components to Three.js:
- Lazy mesh creation (only when needed)
- Component-to-mesh synchronization
- Mesh lifecycle management (create/update/dispose)
- Raycasting support for entity selection
- Shadow and frustum culling configuration
- Geometry type support: sphere, box, cylinder, cone, plane, torus
- Material type support: standard (PBR), physical, basic, lambert

## 📖 Complete Example

See `examples/BasicIntegration.ts` for a full working example that demonstrates:
- World initialization with all systems
- Creating plant and structure entities
- Update loop integration
- User interaction handling (selection, movement)
- Timeline slider for plant growth
- Save/load functionality
- Raycasting for entity picking

## 🚀 Next Steps

1. ✅ ~~Create Systems (Transform, Material, Growth, Render)~~ **COMPLETED**
2. Create AssetManager for texture loading and caching
3. Integrate with existing PlantModels/StructureModels
4. Add LOD (Level of Detail) system for performance
5. Add physics system (optional - collision detection)
6. Create React hooks for ECS integration (`useWorld`, `useEntity`, `useComponent`)
7. Build UI components for timeline control and property editing

## 📚 Further Reading

- [ECS FAQ](https://github.com/SanderMertens/ecs-faq)
- [Data-Oriented Design](https://www.dataorienteddesign.com/dodbook/)
- [Three.js Optimization](https://discoverthreejs.com/tips-and-tricks/)
