/**
 * IntegratedDesignCanvas - Complete 3D Design Tool with All UI Enhancements
 * Combines EnhancedDesignCanvas with new draggable panels, grid editor, and design hub
 * Maximum utility, minimal footprint - Make Kant proud!
 */

"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Sky } from "@react-three/drei";
import { Suspense, useState, useRef, useEffect, useMemo } from "react";
import { Vector2, Vector3 } from "three";
import { PlacedPlant, PlantSpecies } from "@/lib/plantData";
import { PlacedStructure } from "@/lib/structureData";
import { PlantModel } from "./PlantModels";
import { StructureModel } from "./StructureModels";
import { HouseModel } from "./HouseModel";
import { GrassyGround, DecorativeRocks } from "./GrassyGround";

// OOP Systems
import { CameraController } from "@/lib/editor/CameraController";
import { SelectionManager } from "@/lib/editor/SelectionManager";
import { DragController } from "@/lib/editor/DragController";
import { SceneManager } from "@/lib/editor/SceneManager";

// Hooks and utilities
import { useUndoRedo } from "@/lib/hooks/useUndoRedo";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { saveDesign, loadDesign, saveToLocalStorage, loadFromLocalStorage } from "@/lib/design/saveLoad";
import { MeasurementGrid } from "./MeasurementGrid";
import { TransformGizmo } from "./TransformGizmo";
import { PrecisionEditData } from "./PrecisionEditPanel";
import { EditMode, createEditModeController } from "@/lib/editor/EditModeController";
import { snapToGrid } from "./DesignGrid";

// NEW Enhanced UI Components
import TutorialPanel from "./TutorialPanel";
import GridClickEditor, { GridPointsVisualizer } from "./GridClickEditor";
import DesignHub from "./DesignHub";
import EnhancedPlantToolbox from "./EnhancedPlantToolbox";
import EnhancedPrecisionEdit from "./EnhancedPrecisionEdit";
import SelectionBox, { ObjectHighlight } from "./SelectionBox";
import StructureToolbox from "./StructureToolbox";
import PropertyPanel from "./PropertyPanel";

// Scene Component
function Scene({
  plants,
  structures,
  sceneManager,
  selectionManager,
  dragController,
  age,
  onPlantClick,
  onStructureClick,
  onHouseClick,
  selectedPlantId,
  selectedStructureId,
  selectedHouseId,
  showGrid,
  showMeasurements,
  showGridPoints,
  editMode,
  onTransform,
  gridSize,
  onGridClick,
  gridClickEnabled,
}: {
  plants: PlacedPlant[];
  structures: PlacedStructure[];
  sceneManager: SceneManager;
  selectionManager: SelectionManager;
  dragController: DragController;
  age: number;
  onPlantClick: (id: string) => void;
  onStructureClick: (id: string) => void;
  onHouseClick: (id: string) => void;
  selectedPlantId: string | null;
  selectedStructureId: string | null;
  selectedHouseId: string | null;
  showGrid: boolean;
  showMeasurements: boolean;
  showGridPoints: boolean;
  editMode: EditMode;
  onTransform: (type: 'move' | 'scale' | 'rotate', axis: 'x' | 'y' | 'z' | 'xy' | 'xz' | 'yz' | 'xyz', delta: number) => void;
  gridSize: number;
  onGridClick: (position: { x: number; y: number; z: number }) => void;
  gridClickEnabled: boolean;
}) {
  const houses = sceneManager.getHouses();
  const ground = sceneManager.getGround();

  // Get selected objects for visualization
  const selectedPlants = plants.filter(p => p.id === selectedPlantId);
  const selectedStructures = structures.filter(s => s.id === selectedStructureId);
  const selectedObjects = [...selectedPlants, ...selectedStructures];

  // Get selected object position for gizmo
  const selectedPlant = plants.find(p => p.id === selectedPlantId);
  const selectedStructure = structures.find(s => s.id === selectedStructureId);
  const selectedPosition: [number, number, number] | null = selectedPlant
    ? [selectedPlant.position.x, selectedPlant.position.y, selectedPlant.position.z]
    : selectedStructure
    ? [selectedStructure.position.x, selectedStructure.position.y, selectedStructure.position.z]
    : null;

  return (
    <>
      {/* Sky */}
      <Sky sunPosition={[10, 5, 10]} />

      {/* Lighting */}
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#87CEEB", "#4a7c2f", 0.5]} />

      {/* Grid Click Editor - Interactive placement layer */}
      {gridClickEnabled && (
        <GridClickEditor
          gridSize={50}
          cellSize={gridSize}
          onGridClick={onGridClick}
          enabled={true}
          showPreview={true}
          previewColor="#4ade80"
        />
      )}

      {/* Grid Points Visualizer */}
      {showGridPoints && (
        <GridPointsVisualizer
          gridSize={50}
          cellSize={gridSize}
          enabled={true}
        />
      )}

      {/* Measurement Grid */}
      {showGrid && (
        <MeasurementGrid
          size={50}
          divisions={50}
          subDivisions={Math.max(1, Math.round(1 / gridSize))}
          showLabels={showMeasurements}
        />
      )}

      {/* Grassy Ground */}
      {!showGrid && <GrassyGround ground={ground} />}
      {!showGrid && <DecorativeRocks size={ground.size} count={20} />}

      {/* Selection Box - Enhanced visualization */}
      {selectedObjects.length > 0 && (
        <SelectionBox
          selectedObjects={selectedObjects}
          showBounds={true}
          showCenter={true}
          showDimensions={true}
          color="#4ade80"
        />
      )}

      {/* Houses */}
      {houses.map((house) => (
        <HouseModel
          key={house.id}
          house={house}
          onClick={() => onHouseClick(house.id)}
          isSelected={house.id === selectedHouseId}
        />
      ))}

      {/* Structures */}
      {structures.map((structure) => (
        <StructureModel
          key={structure.id}
          structure={structure}
          onClick={() => onStructureClick(structure.id)}
        />
      ))}

      {/* Plants with individual highlights */}
      {plants.map((plant) => (
        <group key={plant.id}>
          <PlantModel
            plant={{ ...plant, age }}
            onClick={() => onPlantClick(plant.id)}
          />
          {plant.id === selectedPlantId && (
            <ObjectHighlight
              position={[plant.position.x, plant.position.y, plant.position.z]}
              size={1.5}
              color="#4ade80"
              isActive={true}
            />
          )}
        </group>
      ))}

      {/* Transform Gizmo */}
      {selectedPosition && (editMode === 'move' || editMode === 'scale' || editMode === 'rotate') && (
        <TransformGizmo
          position={selectedPosition}
          onTransform={onTransform}
          mode={editMode === 'move' ? 'translate' : editMode === 'scale' ? 'scale' : 'rotate'}
          size={2}
        />
      )}
    </>
  );
}

// Main Integrated Design Canvas
export default function IntegratedDesignCanvas() {
  // OOP System Instances
  const cameraController = useMemo(() => new CameraController(), []);
  const selectionManager = useMemo(
    () => new SelectionManager({
      onSelectionChange: (event) => {
        console.log("Selection changed:", event.selectedIds);
      },
    }),
    []
  );
  const dragController = useMemo(
    () => new DragController({
      snapToGrid: true,
      gridSize: 1,
      dragPlaneY: 0,
    }),
    []
  );
  const sceneManager = useMemo(() => {
    const sm = new SceneManager();
    sm.createDefaultScene();
    return sm;
  }, []);

  // State with undo/redo support
  interface DesignState {
    plants: PlacedPlant[];
    structures: PlacedStructure[];
  }

  const {
    state: designState,
    setState: setDesignState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<DesignState>(
    { plants: [], structures: [] },
    50 // max history
  );

  // UI State
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [age, setAge] = useState<number>(5);
  const [editMode, setEditMode] = useState<EditMode>('select');

  // Grid and visibility
  const [showGrid, setShowGrid] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showGridPoints, setShowGridPoints] = useState(false);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState(true);
  const [gridSize, setGridSize] = useState(1);

  // Panel visibility
  const [showTutorial, setShowTutorial] = useState(true);
  const [showPlantToolbox, setShowPlantToolbox] = useState(true);
  const [showStructureToolbox, setShowStructureToolbox] = useState(false);
  const [showPrecisionPanel, setShowPrecisionPanel] = useState(false);
  const [showPropertyPanel, setShowPropertyPanel] = useState(false);

  // Grid click placement
  const [gridClickEnabled, setGridClickEnabled] = useState(false);
  const [pendingPlantSpecies, setPendingPlantSpecies] = useState<PlantSpecies | null>(null);

  const editModeController = useMemo(() => createEditModeController(), []);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const plants = designState.plants;
  const structures = designState.structures;

  const setPlants = (newPlants: PlacedPlant[] | ((prev: PlacedPlant[]) => PlacedPlant[])) => {
    setDesignState((prev) => ({
      ...prev,
      plants: typeof newPlants === 'function' ? newPlants(prev.plants) : newPlants,
    }));
  };

  const setStructures = (newStructures: PlacedStructure[] | ((prev: PlacedStructure[]) => PlacedStructure[])) => {
    setDesignState((prev) => ({
      ...prev,
      structures: typeof newStructures === 'function' ? newStructures(prev.structures) : newStructures,
    }));
  };

  // Update edit mode controller when settings change
  useEffect(() => {
    editModeController.setMode(editMode);
    editModeController.setSnapMode(snapToGridEnabled ? 'grid' : 'none');
    editModeController.setGridSize(gridSize);
    dragController.setSnapToGrid(snapToGridEnabled);
    dragController.setGridSize(gridSize);
  }, [editMode, snapToGridEnabled, gridSize, editModeController, dragController]);

  // Handle grid click placement
  const handleGridClick = (position: { x: number; y: number; z: number }) => {
    if (pendingPlantSpecies) {
      const newPlant: PlacedPlant = {
        id: `plant-${Date.now()}-${Math.random()}`,
        speciesId: pendingPlantSpecies.id,
        position,
        rotation: 0,
        scale: 1,
        age: age,
        variant: 0,
        selected: false,
      };
      setPlants([...plants, newPlant]);
      // Don't clear pending species - allow multiple placements
    }
  };

  // Handle plant selection from toolbox
  const handlePlantSelect = (species: PlantSpecies) => {
    setPendingPlantSpecies(species);
    setGridClickEnabled(true);
    setEditMode('select');
  };

  // Handle transform operations from gizmo
  const handleTransform = (type: 'move' | 'scale' | 'rotate', axis: 'x' | 'y' | 'z' | 'xy' | 'xz' | 'yz' | 'xyz', delta: number) => {
    const snappedDelta = snapToGridEnabled ? editModeController.snapToGrid(delta) : delta;

    // Determine which axes to apply the delta to
    const applyToX = axis.includes('x');
    const applyToY = axis.includes('y');
    const applyToZ = axis.includes('z');

    if (selectedPlantId) {
      setPlants(plants.map(p => {
        if (p.id === selectedPlantId) {
          if (type === 'move') {
            return {
              ...p,
              position: {
                x: applyToX ? p.position.x + snappedDelta : p.position.x,
                y: applyToY ? p.position.y + snappedDelta : p.position.y,
                z: applyToZ ? p.position.z + snappedDelta : p.position.z,
              },
            };
          } else if (type === 'scale') {
            return { ...p, scale: Math.max(0.1, p.scale + snappedDelta * 0.1) };
          } else if (type === 'rotate') {
            return { ...p, rotation: p.rotation + snappedDelta };
          }
        }
        return p;
      }));
    } else if (selectedStructureId) {
      setStructures(structures.map(s => {
        if (s.id === selectedStructureId) {
          if (type === 'move') {
            return {
              ...s,
              position: {
                x: applyToX ? s.position.x + snappedDelta : s.position.x,
                y: applyToY ? s.position.y + snappedDelta : s.position.y,
                z: applyToZ ? s.position.z + snappedDelta : s.position.z,
              },
            };
          } else if (type === 'scale') {
            return { ...s, scale: Math.max(0.1, s.scale + snappedDelta * 0.1) };
          } else if (type === 'rotate') {
            return { ...s, rotation: s.rotation + snappedDelta };
          }
        }
        return s;
      }));
    }
  };

  // Handle plant click
  const handlePlantClick = (plantId: string) => {
    selectionManager.select(plantId);
    setSelectedPlantId(plantId);
    setSelectedStructureId(null);
    setSelectedHouseId(null);
    setGridClickEnabled(false);
    setPendingPlantSpecies(null);
  };

  // Handle structure click
  const handleStructureClick = (structureId: string) => {
    setSelectedStructureId(structureId);
    setSelectedPlantId(null);
    setSelectedHouseId(null);
    selectionManager.clearSelection();
    setGridClickEnabled(false);
    setPendingPlantSpecies(null);
  };

  // Handle house click
  const handleHouseClick = (houseId: string) => {
    setSelectedHouseId(houseId);
    setSelectedPlantId(null);
    setSelectedStructureId(null);
    selectionManager.clearSelection();
    setGridClickEnabled(false);
    setPendingPlantSpecies(null);
  };

  // Object actions
  const handleCopy = () => {
    if (selectedPlantId) {
      const plant = plants.find((p) => p.id === selectedPlantId);
      if (!plant) return;

      const newPlant: PlacedPlant = {
        ...plant,
        id: `plant-${Date.now()}-${Math.random()}`,
        position: {
          x: plant.position.x + 2,
          y: plant.position.y,
          z: plant.position.z + 2,
        },
        selected: false,
      };
      setPlants([...plants, newPlant]);
    } else if (selectedStructureId) {
      const structure = structures.find((s) => s.id === selectedStructureId);
      if (!structure) return;

      const newStructure: PlacedStructure = {
        ...structure,
        id: `structure-${Date.now()}-${Math.random()}`,
        position: {
          x: structure.position.x + 3,
          y: structure.position.y,
          z: structure.position.z + 3,
        },
        selected: false,
      };
      setStructures([...structures, newStructure]);
    }
  };

  const handleDelete = () => {
    if (selectedPlantId) {
      setPlants(plants.filter((p) => p.id !== selectedPlantId));
      selectionManager.clearSelection();
      setSelectedPlantId(null);
    } else if (selectedStructureId) {
      setStructures(structures.filter((s) => s.id !== selectedStructureId));
      setSelectedStructureId(null);
    }
  };

  // File operations
  const handleSave = () => {
    saveToLocalStorage('design-autosave', plants, structures, age);
    alert('Design saved!');
  };

  const handleLoad = () => {
    const data = loadFromLocalStorage('design-autosave');
    if (data) {
      setPlants(data.plants);
      setStructures(data.structures || []);
      setAge(data.age || 5);
      alert('Design loaded!');
    } else {
      alert('No saved design found');
    }
  };

  const handleExport = () => {
    const fileName = `design-${Date.now()}.landscape.json`;
    saveDesign(fileName, plants, structures, age);
  };

  // Camera controls
  const handleResetCamera = () => {
    // Camera reset logic would go here
    console.log('Reset camera');
  };

  const handleFocusSelected = () => {
    // Focus on selected object logic would go here
    console.log('Focus on selected');
  };

  // Precision edit data
  const precisionEditData: PrecisionEditData | null = useMemo(() => {
    const selected = selectedPlantId
      ? plants.find(p => p.id === selectedPlantId)
      : selectedStructureId
      ? structures.find(s => s.id === selectedStructureId)
      : null;

    if (!selected) return null;

    return {
      x: selected.position.x,
      y: selected.position.y,
      z: selected.position.z,
      width: selected.scale || 1,
      height: selected.scale || 1,
      depth: selected.scale || 1,
      rotationX: 0,
      rotationY: (selected.rotation * 180) / Math.PI,
      rotationZ: 0,
      lockX: false,
      lockY: false,
      lockZ: false,
      maintainAspectRatio: false,
    };
  }, [selectedPlantId, selectedStructureId, plants, structures]);

  const handlePrecisionChange = (data: PrecisionEditData) => {
    if (selectedPlantId) {
      setPlants(plants.map(p =>
        p.id === selectedPlantId
          ? {
              ...p,
              position: { x: data.x, y: data.y, z: data.z },
              scale: data.width,
              rotation: (data.rotationY * Math.PI) / 180,
            }
          : p
      ));
    } else if (selectedStructureId) {
      setStructures(structures.map(s =>
        s.id === selectedStructureId
          ? {
              ...s,
              position: { x: data.x, y: data.y, z: data.z },
              scale: data.width,
              rotation: (data.rotationY * Math.PI) / 180,
            }
          : s
      ));
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'z', ctrl: true, handler: () => undo(), description: 'Undo' },
    { key: 'y', ctrl: true, handler: () => redo(), description: 'Redo' },
    { key: 's', ctrl: true, handler: (e) => { e.preventDefault(); handleSave(); }, description: 'Save' },
    { key: 'Delete', handler: () => handleDelete(), description: 'Delete' },
    { key: 'Backspace', handler: () => handleDelete(), description: 'Delete' },
    { key: 'c', ctrl: true, handler: () => handleCopy(), description: 'Copy' },
    { key: 'a', ctrl: true, handler: (e) => { e.preventDefault(); console.log('Select all'); }, description: 'Select All' },
    { key: 'Escape', handler: () => {
      setSelectedPlantId(null);
      setSelectedStructureId(null);
      setSelectedHouseId(null);
      selectionManager.clearSelection();
    }, description: 'Deselect' },
  ]);

  // Selection count
  const selectedCount = (selectedPlantId ? 1 : 0) + (selectedStructureId ? 1 : 0) + (selectedHouseId ? 1 : 0);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-sky-200 to-sky-100">
      {/* Tutorial Panel */}
      {showTutorial && (
        <TutorialPanel onClose={() => setShowTutorial(false)} />
      )}

      {/* Enhanced Plant Toolbox */}
      {showPlantToolbox && (
        <EnhancedPlantToolbox
          onPlantSelect={handlePlantSelect}
          selectedPlantId={selectedPlantId || undefined}
          visible={showPlantToolbox}
          onClose={() => setShowPlantToolbox(false)}
        />
      )}

      {/* Structure Toolbox */}
      {showStructureToolbox && (
        <div className="absolute left-4 top-4 z-30">
          <StructureToolbox
            onStructureSelect={(structure) => {
              console.log('Structure selected:', structure);
            }}
            selectedStructureId={selectedStructureId || undefined}
          />
        </div>
      )}

      {/* Enhanced Precision Edit Panel */}
      {showPrecisionPanel && precisionEditData && (
        <EnhancedPrecisionEdit
          data={precisionEditData}
          onChange={handlePrecisionChange}
          onClose={() => setShowPrecisionPanel(false)}
          visible={showPrecisionPanel}
          snapToGrid={snapToGridEnabled}
          onToggleSnap={() => setSnapToGridEnabled(!snapToGridEnabled)}
          gridSize={gridSize}
        />
      )}

      {/* Property Panel */}
      {showPropertyPanel && (selectedPlantId || selectedStructureId) && (
        <PropertyPanel
          selectedPlant={selectedPlantId ? plants.find(p => p.id === selectedPlantId) : undefined}
          selectedStructure={selectedStructureId ? structures.find(s => s.id === selectedStructureId) : undefined}
          onPlantUpdate={(plant) => {
            setPlants(plants.map(p => p.id === plant.id ? plant : p));
          }}
          onStructureUpdate={(structure) => {
            setStructures(structures.map(s => s.id === structure.id ? structure : s));
          }}
          onClose={() => setShowPropertyPanel(false)}
        />
      )}

      {/* 3D Canvas */}
      <div ref={canvasRef} className="w-full h-full">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[15, 12, 15]} fov={50} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            minDistance={5}
            maxDistance={40}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 6}
            target={[0, 0, 0]}
          />

          <Suspense fallback={null}>
            <Scene
              plants={plants}
              structures={structures}
              sceneManager={sceneManager}
              selectionManager={selectionManager}
              dragController={dragController}
              age={age}
              onPlantClick={handlePlantClick}
              onStructureClick={handleStructureClick}
              onHouseClick={handleHouseClick}
              selectedPlantId={selectedPlantId}
              selectedStructureId={selectedStructureId}
              selectedHouseId={selectedHouseId}
              showGrid={showGrid}
              showMeasurements={showMeasurements}
              showGridPoints={showGridPoints}
              editMode={editMode}
              onTransform={handleTransform}
              gridSize={gridSize}
              onGridClick={handleGridClick}
              gridClickEnabled={gridClickEnabled}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Design Hub - Bottom Toolbar */}
      <DesignHub
        selectedCount={selectedCount}
        editMode={editMode === 'vertex' || editMode === 'measure' ? 'select' : editMode}
        onEditModeChange={(mode) => {
          setEditMode(mode);
          if (mode !== 'select') {
            setGridClickEnabled(false);
            setPendingPlantSpecies(null);
          }
        }}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showMeasurements={showMeasurements}
        onToggleMeasurements={() => setShowMeasurements(!showMeasurements)}
        showGridPoints={showGridPoints}
        onToggleGridPoints={() => setShowGridPoints(!showGridPoints)}
        gridSize={gridSize}
        onGridSizeChange={setGridSize}
        snapToGrid={snapToGridEnabled}
        onToggleSnap={() => setSnapToGridEnabled(!snapToGridEnabled)}
        age={age}
        onAgeChange={setAge}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onSave={handleSave}
        onLoad={handleLoad}
        onExport={handleExport}
        onCopy={handleCopy}
        onDelete={handleDelete}
        canCopy={selectedCount > 0}
        canDelete={selectedCount > 0}
        onResetCamera={handleResetCamera}
        onFocusSelected={handleFocusSelected}
        onTogglePrecision={() => setShowPrecisionPanel(!showPrecisionPanel)}
        onToggleProperties={() => setShowPropertyPanel(!showPropertyPanel)}
        onToggleHelp={() => setShowTutorial(!showTutorial)}
      />

      {/* Hidden file input for loading */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".landscape.json"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            try {
              const data = await loadDesign(file);
              setPlants(data.plants);
              setStructures(data.structures || []);
              setAge(data.age || 5);
              alert('Design loaded!');
            } catch (error) {
              console.error('Failed to load design:', error);
              alert('Failed to load design');
            }
          }
        }}
      />
    </div>
  );
}
