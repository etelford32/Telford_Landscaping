# Design App Integration Guide

This guide explains how to use the newly integrated and optimized systems for the design app.

## Overview

The design app now has a **unified ECS (Entity Component System) architecture** that integrates:

1. **ECS-React Bridges** - Seamless React hooks for ECS
2. **Unified Grid System** - Consistent grid snapping across the app
3. **Integrated Rendering** - PlantRenderSystem and InstancedPlantRenderSystem
4. **Growth Management** - GrowthSystem with plant data integration
5. **Selection Management** - ECS-aware selection with SelectionManager
6. **Placement System** - Unified grid placement with DragController

## Quick Start

### 1. Setting Up the ECS World

```tsx
import { createDesignWorld, registerAllPlantGrowthCurves } from '@/lib/ecs';

function DesignApp() {
  // Create ECS World with all systems
  const { world, growthSystem, plantRenderSystem } = createDesignWorld(scene);

  return (
    <ECSProvider world={world} systems={[growthSystem, plantRenderSystem]}>
      {/* Your app components */}
    </ECSProvider>
  );
}
```

### 2. Using Grid System

```tsx
import { useGridSnap, UnifiedGrid } from '@/lib/grid';

function DesignCanvas() {
  const { snap, snap2D, isWithinBounds } = useGridSnap({
    size: 30,
    cellSize: 1,
    snapEnabled: true
  });

  return (
    <Canvas>
      <UnifiedGrid
        mode="advanced"
        showLabels={true}
        showMeasurements={true}
      />
    </Canvas>
  );
}
```

### 3. Using ECS Hooks

```tsx
import { useECSWorld, useECSQuery, useECSUpdateLoop } from '@/lib/ecs';

function PlantList() {
  const { world, forceUpdate } = useECSWorld();

  // Query all plant entities
  const plantEntities = useECSQuery(['Transform', 'PlantData']);

  // Run ECS update loop at 60fps
  useECSUpdateLoop(60, true);

  return (
    <div>
      {plantEntities.map(entity => (
        <PlantItem key={entity.id} entityId={entity.id} />
      ))}
    </div>
  );
}
```

### 4. Plant Placement

```tsx
import {
  createPlantEntity,
  createPlacementController,
  ECSPlacementUtils
} from '@/lib/ecs';

function PlantToolbox() {
  const { world } = useECSWorld();
  const gridSnap = useGridSnap();

  const handlePlantDrop = (speciesId: string, screenX: number, screenY: number) => {
    // Calculate grid position from screen coordinates
    const position = ECSPlacementUtils.calculatePlacementPosition(
      gridSnap,
      screenX,
      screenY,
      canvasWidth,
      canvasHeight
    );

    // Create plant entity
    const plant: PlacedPlant = {
      id: `plant-${Date.now()}`,
      speciesId,
      position: { x: position.x, y: 0, z: position.z },
      rotation: 0,
      scale: 1,
      age: 5,
      variant: 0
    };

    const entityId = createPlantEntity(world, plant);
    forceUpdate();
  };

  return (
    <div>
      {/* Plant palette */}
    </div>
  );
}
```

### 5. Selection Management

```tsx
import { ECSSelectionManager, ECSSelectionUtils } from '@/lib/ecs';

function SelectionTool() {
  const { world } = useECSWorld();
  const [selectionManager] = useState(() =>
    new ECSSelectionManager(world, {
      multiSelectEnabled: false,
      onSelectionChange: (event) => {
        console.log('Selection changed:', event.selectedIds);
      }
    })
  );

  const handleClick = (entityId: string, addToSelection: boolean) => {
    ECSSelectionUtils.selectEntity(world, entityId, !addToSelection);
    selectionManager.syncFromECS();
    forceUpdate();
  };

  return (
    <div>
      Selected: {ECSSelectionUtils.getSelectionCount(world)}
    </div>
  );
}
```

## Component Architecture

### Grid System

**Files:**
- `lib/grid/GridSystem.ts` - Core grid logic and snapping
- `lib/grid/useGrid.ts` - React hooks for grid
- `components/design/UnifiedGrid.tsx` - Grid visualization component

**Usage:**
```tsx
// Simple grid mode (drei Grid)
<UnifiedGrid mode="simple" />

// Advanced grid with measurements
<UnifiedGrid
  mode="advanced"
  showLabels={true}
  showMeasurements={true}
  showOrigin={true}
/>

// Custom grid configuration
<UnifiedGrid
  mode="measurement"
  config={{
    size: 50,
    cellSize: 2,
    divisions: 25,
    subDivisions: 4
  }}
/>
```

### ECS React Hooks

**Available Hooks:**

1. **useECSWorld** - Access world and force updates
2. **useECSQuery** - Query entities by components
3. **useECSQueryWithComponents** - Query with component data
4. **useEntity** - Get specific entity
5. **useComponent** - Get specific component
6. **useEntitiesByType** - Get entities by type
7. **useECSUpdateLoop** - Run update loop
8. **useECSOperations** - Helper operations
9. **useECSSnapshot** - Undo/redo support
10. **useECSStats** - Performance statistics

**Example:**
```tsx
function PlantDetails({ entityId }: { entityId: string }) {
  const transform = useComponent<TransformComponent>(entityId, 'Transform');
  const plantData = useComponent<PlantDataComponent>(entityId, 'PlantData');
  const selection = useComponent<SelectionComponent>(entityId, 'Selection');

  if (!transform || !plantData) return null;

  return (
    <div>
      <p>Species: {plantData.speciesId}</p>
      <p>Age: {plantData.age} years</p>
      <p>Position: ({transform.position.x}, {transform.position.z})</p>
      <p>Selected: {selection?.selected ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Rendering Systems

**Three Rendering Options:**

1. **PlantRenderSystem** - Full-featured plant rendering with shape types
   - Best for: Medium complexity scenes (< 100 plants)
   - Features: All shape types, detailed geometry

2. **InstancedPlantRenderSystem** - Optimized instanced rendering
   - Best for: Large scenes (100+ plants of same species)
   - Features: Single draw call per species, memory efficient

3. **RenderSystem** - Generic mesh rendering
   - Best for: Non-plant objects, custom geometries

**Example:**
```tsx
// Use instanced rendering for performance
const { world, growthSystem } = createDesignWorld();

const plantRenderSystem = new InstancedPlantRenderSystem(scene, {
  detailLevel: 'medium',
  enableShadows: true,
  initialInstanceCapacity: 50
});

world.registerSystem(plantRenderSystem);
```

### Growth System

**Features:**
- Plant aging with growth curves
- Real-time or manual control (slider)
- Care tracking (pruning, fertilization)
- Health degradation

**Example:**
```tsx
import { setGlobalPlantAge } from '@/lib/ecs';

function TimelineSlider() {
  const { world, forceUpdate } = useECSWorld();
  const [growthSystem] = useState(() =>
    world.getSystems().find(s => s.name === 'GrowthSystem') as GrowthSystem
  );
  const [age, setAge] = useState(5);

  const handleAgeChange = (newAge: number) => {
    setAge(newAge);
    setGlobalPlantAge(world, growthSystem, newAge);
    forceUpdate();
  };

  return (
    <input
      type="range"
      min={0}
      max={30}
      value={age}
      onChange={(e) => handleAgeChange(Number(e.target.value))}
    />
  );
}
```

## Data Flow

### Plant Creation Flow

```
User drops plant from toolbox
  ↓
Calculate grid position (PlacementBridge)
  ↓
Create PlacedPlant object
  ↓
createPlantEntity(world, plant)
  ↓
World creates Entity with:
  - TransformComponent (position, rotation, scale)
  - PlantDataComponent (species, age, etc.)
  - SelectionComponent (selected, visible)
  ↓
PlantRenderSystem.update()
  ↓
Three.js meshes created and added to scene
  ↓
Render on screen
```

### Selection Flow

```
User clicks on plant mesh
  ↓
Raycast to find mesh
  ↓
Get entityId from mesh.userData
  ↓
ECSSelectionUtils.selectEntity(world, entityId)
  ↓
Update SelectionComponent.selected = true
  ↓
ECSSelectionManager.syncFromECS()
  ↓
Trigger onSelectionChange callback
  ↓
PlantRenderSystem highlights selected plant
```

### Drag Flow

```
User clicks and drags plant
  ↓
ECSPlacementController.startDrag(id, mousePos, camera)
  ↓
ECSPlacementController.updateDrag(mousePos, camera)
  ↓
Calculate new position with raycasting
  ↓
Apply grid snapping (GridSnap.snap2D)
  ↓
Clamp to bounds (GridSnap.clampToBounds)
  ↓
Update TransformComponent in ECS
  ↓
ECSPlacementController.endDrag()
  ↓
Final position synced to ECS
```

## Performance Optimization

### When to Use Each Render System

| Scenario | System | Reason |
|----------|--------|--------|
| < 50 plants, varied species | PlantRenderSystem | Full detail, no overhead |
| 50-200 plants, some duplicates | PlantRenderSystem | Good balance |
| 200+ plants with species groups | InstancedPlantRenderSystem | Significant performance gain |
| 1000+ plants | InstancedPlantRenderSystem | Essential for performance |

### Optimization Checklist

- [ ] Use InstancedPlantRenderSystem for large scenes
- [ ] Set appropriate detailLevel ('low', 'medium', 'high')
- [ ] Enable frustum culling
- [ ] Batch ECS updates using `operations.batch()`
- [ ] Use `useECSQuery` instead of manual filtering
- [ ] Limit update loop frequency for non-interactive scenes

## Migration from Legacy Code

### Before (Legacy)
```tsx
const [plants, setPlants] = useState<PlacedPlant[]>([]);

const handleAddPlant = (plant: PlacedPlant) => {
  setPlants([...plants, plant]);
};
```

### After (ECS)
```tsx
const { world, forceUpdate } = useECSWorld();

const handleAddPlant = (plant: PlacedPlant) => {
  createPlantEntity(world, plant);
  forceUpdate();
};
```

### Syncing Existing State
```tsx
import { syncPlantsToECS, syncECSToPlants } from '@/lib/ecs';

// Convert legacy plants to ECS
const plantIdMap = syncPlantsToECS(world, legacyPlants);

// Convert ECS back to legacy format
const plants = syncECSToPlants(world);
```

## Troubleshooting

### Plants not rendering
1. Check if PlantRenderSystem is registered: `world.getSystems()`
2. Verify scene is set: `plantRenderSystem.setScene(scene)`
3. Check entity has required components: Transform + PlantData

### Grid snapping not working
1. Verify snapEnabled in grid config
2. Check cellSize matches expected value
3. Use unified GridSnap instead of manual calculations

### Selection not updating
1. Call `forceUpdate()` after ECS changes
2. Sync SelectionManager: `selectionManager.syncFromECS()`
3. Check SelectionComponent exists on entity

### Performance issues
1. Switch to InstancedPlantRenderSystem for large scenes
2. Lower detailLevel to 'low' or 'medium'
3. Check update loop frequency (don't update faster than needed)
4. Use React.memo() for frequently re-rendering components

## API Reference

### ECS Core
- `World` - Main ECS container
- `Entity` - Entity identifier
- `Component` - Data containers
- `System` - Logic processors

### Components
- `TransformComponent` - Position, rotation, scale
- `PlantDataComponent` - Plant-specific data
- `SelectionComponent` - Selection state
- `GeometryComponent` - Shape definitions
- `MaterialComponent` - Visual properties

### Systems
- `GrowthSystem` - Plant aging and growth
- `PlantRenderSystem` - Plant rendering
- `InstancedPlantRenderSystem` - Optimized rendering
- `RenderSystem` - Generic mesh rendering
- `TransformSystem` - Transform operations
- `MaterialSystem` - Material updates

### Integration Utilities
- `createDesignWorld()` - Create world with all systems
- `createPlantEntity()` - Convert PlacedPlant to entity
- `syncPlantsToECS()` - Sync array to ECS
- `syncECSToPlants()` - Sync ECS to array
- `ECSSelectionManager` - Selection management
- `ECSPlacementController` - Placement and dragging
- `ECSPlacementUtils` - Placement utilities

## Next Steps

1. Update DesignCanvas.tsx to use ECS
2. Replace PlantModels.tsx calls with PlantRenderSystem
3. Migrate selection logic to ECSSelectionManager
4. Replace grid snapping with unified GridSnap
5. Update drag handlers to use ECSPlacementController

## Examples

See `/lib/ecs/examples/` for complete integration examples:
- `BasicIntegration.ts` - Simple plant creation
- `AssetIntegration.ts` - Asset loading
- More examples coming soon!
