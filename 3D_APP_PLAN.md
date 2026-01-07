# 3D Plant Design App - Technical Architecture

## Overview
Telford Landscapes PRO: A revolutionary 3D landscape design application featuring growth-over-time simulation - the first of its kind in the market.

---

## Core Innovation: Growth-Over-Time Simulation

### The Unique Value Proposition
**No other landscape design tool allows users to see how their plants will grow and fill space over 1, 5, 10, 20+ years.**

This solves the #1 problem in landscape design: homeowners don't understand how big plants will get, leading to:
- Overcrowding
- Expensive removal/relocation
- Poor long-term aesthetics
- Maintenance nightmares

### Technical Approach

#### Growth Modeling System
```
Plant Growth = f(age, species, climate, soil, water, sunlight, maintenance)
```

**Components:**
1. **Base Growth Curves**
   - Species-specific growth rates (height, width, canopy)
   - Juvenile vs. mature growth phases
   - Maximum size parameters

2. **Environmental Modifiers**
   - California climate zones
   - Soil quality index
   - Water availability factor
   - Sunlight exposure multiplier
   - Maintenance level impact

3. **Space-Filling Algorithm**
   - Volumetric canopy expansion
   - Branch distribution patterns
   - Natural vs. pruned shapes
   - Competition between nearby plants

4. **Physics Simulation**
   - Gravity effects on branches
   - Wind resistance shaping
   - Light-seeking behavior (phototropism)
   - Root zone expansion (underground visualization optional)

---

## Initial Plant Library (Launch Collection)

### 1. Acer Palmatum (Japanese Maple)
**Growth Characteristics:**
- Height: 6-25 feet (depending on variety)
- Width: 6-25 feet
- Growth Rate: Slow to moderate (1-2 ft/year)
- Lifespan: 100+ years
- Shape: Rounded to vase-shaped
- Seasonal changes: Spring green → Summer deep red/purple → Fall brilliant red/orange

**3D Model Variations:**
- Young specimen (1-5 years): Small, sparse branching
- Mature specimen (15-25 years): Full canopy, intricate branching
- Ancient specimen (50+ years): Gnarled, character branches

### 2. Chamaecyparis pisifera (Cedar/Sawara Cypress)
**Growth Characteristics:**
- Height: 50-70 feet (can be kept smaller with pruning)
- Width: 15-20 feet
- Growth Rate: Moderate (12-18 inches/year)
- Shape: Pyramidal/conical
- Evergreen: Year-round color

**3D Model Variations:**
- Young tree (1-5 years): Tight cone, dense foliage
- Established tree (10-20 years): Fuller mid-section
- Mature tree (30+ years): Tall pyramid, some lower branch loss

### 3. Cedrus atlantica 'Glauca Pendula' (Weeping Blue Atlas Cedar)
**Growth Characteristics:**
- Height: 10-15 feet (highly variable, trained growth)
- Width: 15-30 feet
- Growth Rate: Moderate (12 inches/year)
- Shape: Weeping/cascading, requires staking when young
- Unique blue-silver foliage

**3D Model Variations:**
- Young trained (3-8 years): Staked central leader, beginning cascade
- Mature spread (15-25 years): Full weeping form, ground coverage
- Specimen (30+ years): Dramatic sculptural form

---

## Technical Architecture

### Frontend Stack
- **React Three Fiber** - React integration for Three.js
- **@react-three/drei** - Helper components and controls
- **@react-three/postprocessing** - Advanced rendering effects
- **zustand** - Lightweight state management
- **immer** - Immutable state updates
- **react-dnd** - Drag and drop (optional, may use custom Three.js approach)

### 3D Rendering Engine
- **Three.js** - Core 3D library
- **WebGL** - Hardware-accelerated rendering
- **GLTF/GLB** - 3D model format
- **Physically-Based Rendering (PBR)** - Realistic materials

### Grid System
```typescript
interface GridConfig {
  size: number;        // Grid square size (feet)
  divisions: number;   // Number of grid lines
  snapEnabled: boolean;
  visible: boolean;
  color: string;
}

// Grid snapping function
function snapToGrid(position: Vector3, gridSize: number): Vector3 {
  return new Vector3(
    Math.round(position.x / gridSize) * gridSize,
    position.y, // Y stays at ground level
    Math.round(position.z / gridSize) * gridSize
  );
}
```

### Plant Data Structure
```typescript
interface Plant {
  id: string;
  speciesId: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  scale: number;
  age: number; // in years
  health: number; // 0-1
  variant: number; // which specimen model (0-2)
  customizations: {
    height?: number;
    width?: number;
    pruningStyle?: 'natural' | 'formal' | 'topiary';
  };
}

interface PlantSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  growthData: GrowthData;
  models: string[]; // paths to 3D models
  care: CareInformation;
}

interface GrowthData {
  baseHeightGrowth: number[]; // height by year [yr1, yr2, yr3...]
  baseWidthGrowth: number[];
  maxHeight: number;
  maxWidth: number;
  growthRate: 'slow' | 'moderate' | 'fast';
  lifespan: number;
  climateZones: string[];
  shapeType: 'rounded' | 'pyramidal' | 'weeping' | 'vase' | 'columnar';
}
```

### Growth Simulation Algorithm
```typescript
function calculatePlantSize(
  plant: Plant,
  age: number,
  environment: EnvironmentFactors
): { height: number; width: number; canopyDensity: number } {
  const species = getSpecies(plant.speciesId);
  const growthData = species.growthData;

  // Base growth from age
  let height = interpolateGrowth(growthData.baseHeightGrowth, age);
  let width = interpolateGrowth(growthData.baseWidthGrowth, age);

  // Apply environmental modifiers
  const climateModifier = getClimateModifier(environment.zone, species);
  const waterModifier = environment.waterLevel / 100;
  const sunlightModifier = environment.sunlightHours / 12;
  const maintenanceModifier = 1 - (environment.maintenanceLevel * 0.2);

  height *= climateModifier * waterModifier * sunlightModifier;
  width *= climateModifier * waterModifier * maintenanceModifier;

  // Cap at max size
  height = Math.min(height, growthData.maxHeight);
  width = Math.min(width, growthData.maxWidth);

  // Calculate canopy density (increases with age, peaks, then may decline)
  const canopyDensity = calculateCanopyDensity(age, species.growthData.lifespan);

  return { height, width, canopyDensity };
}
```

### Drag and Drop System
- **Raycasting** for ground plane detection
- **TransformControls** for manipulation
- **Pointer events** for selection
- **Gizmos** for visual feedback (move, rotate, scale)

### UI Layer Architecture
```
┌─────────────────────────────────────┐
│  Top Bar: Project name, Save, Share │
├─────────────────────────────────────┤
│  Left Sidebar: Plant Toolbox        │
│  - Plant categories                 │
│  - Search/filter                    │
│  - Drag to canvas                   │
├──────────────┬──────────────────────┤
│              │   3D Canvas          │
│   Grid       │   - Interactive      │
│   Controls   │   - Camera controls  │
│   Time       │   - Plant placement  │
│   Slider     │                      │
├──────────────┴──────────────────────┤
│  Bottom Bar: Selected plant info    │
│  - Age slider                       │
│  - Properties                       │
│  - Delete, Duplicate                │
└─────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 3A: Foundation (First Chunk)
✅ **IMPLEMENT THIS FIRST**
- [ ] Grid system with visual overlay
- [ ] Snap-to-grid functionality
- [ ] Basic plant placement (static models)
- [ ] Camera controls (orbit, pan, zoom)
- [ ] Plant selection system
- [ ] Plant toolbox/palette UI
- [ ] Drag from toolbox to canvas
- [ ] Basic plant deletion

**Deliverable:** Users can drag plants onto a grid and place them.

### Phase 3B: Plant Manipulation
- [ ] Move plants (drag on grid)
- [ ] Rotate plants
- [ ] Scale/resize plants
- [ ] Duplicate plants
- [ ] Undo/redo system
- [ ] Selection multi-select
- [ ] Keyboard shortcuts

**Deliverable:** Full plant manipulation tools.

### Phase 3C: Plant Models & Variations
- [ ] Create/import 3D models for 3 initial plants
- [ ] Multiple specimen variations per species
- [ ] LOD (Level of Detail) system for performance
- [ ] Material/texture optimization
- [ ] Plant switching between variants

**Deliverable:** Beautiful, realistic plant models.

### Phase 3D: Growth Simulation (KILLER FEATURE)
- [ ] Age slider UI
- [ ] Growth data for 3 initial plants
- [ ] Size interpolation algorithm
- [ ] Morphing between age stages
- [ ] Timeline animation
- [ ] Environmental factor inputs
- [ ] Growth preview visualization

**Deliverable:** Users can see plants grow over time!

### Phase 3E: Advanced Features
- [ ] Terrain editing
- [ ] Hardscape elements
- [ ] Lighting/shadow simulation
- [ ] Seasons visualization
- [ ] Water usage calculator
- [ ] Cost estimator
- [ ] Design analytics

### Phase 3F: Polish & Performance
- [ ] Performance optimization
- [ ] Mobile support
- [ ] Offline capability
- [ ] Export features
- [ ] Tutorial system
- [ ] Keyboard shortcuts guide

---

## Performance Targets

- **60 FPS** minimum on modern hardware
- **Support for 100+ plants** in a single design
- **<3 second** load time
- **Smooth interactions** - no lag on drag/drop
- **Real-time growth simulation** - instant slider updates

---

## 3D Model Requirements

### Technical Specs
- **Format:** GLB (binary GLTF)
- **Polycount:**
  - LOD 0 (close): 10k-50k triangles
  - LOD 1 (medium): 3k-10k triangles
  - LOD 2 (far): 500-3k triangles
- **Textures:**
  - Diffuse (color)
  - Normal map
  - Roughness map
  - Optional: AO (ambient occlusion)
- **Texture Size:** 2048x2048 or 1024x1024
- **Materials:** PBR (Physically-Based Rendering)

### Model Creation Workflow Options
1. **Blender** (free, open-source)
   - SpeedTree add-on for trees
   - Manual modeling
   - Export to GLB

2. **SpeedTree** (industry standard)
   - Procedural tree generation
   - Realistic growth patterns
   - Direct GLB export

3. **Marketplace Assets**
   - Sketchfab
   - TurboSquid
   - CGTrader
   - Need license for commercial use

4. **AI Generation** (emerging)
   - Generate base models with AI
   - Refine in Blender
   - Experimental but promising

---

## Data Storage

### User Designs
```typescript
interface Design {
  id: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnail: string; // screenshot
  plants: Plant[];
  environment: EnvironmentFactors;
  terrain?: TerrainData;
  hardscape?: HardscapeElement[];
  camera?: CameraPosition;
}
```

### Storage Strategy
- **Database:** PostgreSQL for design metadata
- **S3/CloudFlare:** 3D model assets (GLB files)
- **IndexedDB:** Client-side design caching
- **JSON format:** Design files (portable, shareable)

---

## Success Metrics

### User Engagement
- Time spent in 3D editor
- Number of plants placed per design
- Growth simulation slider usage
- Design save rate
- Design revision count

### Business Metrics
- Free to PRO conversion rate
- Design completion rate
- Quote request rate from designs
- User retention (monthly active users)
- Design sharing rate

---

## Competitive Advantage

### What Makes This Unique:
1. **Growth-over-time simulation** - NO ONE ELSE HAS THIS
2. **Multiple specimen variations** - More realistic than competitors
3. **California-focused** - Optimized for local climate
4. **Professional integration** - Direct link to installation services
5. **Easy and fun** - Not overwhelming like professional CAD tools

### Market Positioning:
- **Better than:** iScape, Home Outside, PRO Landscape (no growth sim)
- **Simpler than:** SketchUp, AutoCAD (professional, complex)
- **More accurate than:** Pinterest/mood boards (static images)

---

## Next Steps

1. ✅ **Phase 3A:** Build grid + basic placement (START HERE)
2. **Phase 3B:** Add manipulation tools
3. **Phase 3C:** Create/import plant models
4. **Phase 3D:** Implement growth simulation
5. **Phase 3E+:** Advanced features

Let's build something revolutionary! 🚀🌳
