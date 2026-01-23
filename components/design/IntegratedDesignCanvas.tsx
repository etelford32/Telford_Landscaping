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
import { ToastProvider, useToast } from "./ToastManager";
import StatusBar from "./StatusBar";
import ContextMenu, { getObjectMenuItems, getCanvasMenuItems, ContextMenuType } from "./ContextMenu";
import AlignmentTools, { calculateAlignedPosition, calculateDistributedPositions, AlignmentType, DistributionType } from "./AlignmentTools";
import { clipboardManager, ClipboardObject } from "@/lib/design/clipboard";
import RectangleSelection from "./RectangleSelection";
import UnifiedSidebar from "./UnifiedSidebar";
import CameraPresets, { CameraPreset } from "./CameraPresets";
import CameraPresetController from "./CameraController";

// Terrain System
import { TerrainManager, BrushConfig, TerrainTool, TerrainConfig } from "@/lib/terrain/TerrainManager";
import EditableTerrain from "./terrain/EditableTerrain";
import TerrainBrushPreview from "./terrain/TerrainBrushPreview";
import TerrainToolbar from "./terrain/TerrainToolbar";
import BrushSettings from "./terrain/BrushSettings";

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
  cameraPreset,
  enableCameraTransition,
  terrainManager,
  terrainEnabled,
  terrainTool,
  brush,
  brushPosition,
  onTerrainClick,
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
  cameraPreset: CameraPreset;
  enableCameraTransition: boolean;
  terrainManager: TerrainManager;
  terrainEnabled: boolean;
  terrainTool: TerrainTool;
  brush: BrushConfig;
  brushPosition: Vector3 | null;
  onTerrainClick: (position: { x: number; y: number; z: number }) => void;
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

      {/* Camera Controller */}
      <CameraPresetController preset={cameraPreset} enabled={enableCameraTransition} />

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
      {/* Terrain or Ground */}
      {terrainEnabled && terrainManager ? (
        <>
          <EditableTerrain
            terrainManager={terrainManager}
            grassColor={ground.grassColor}
            showWireframe={false}
            onTerrainClick={onTerrainClick}
          />
          {brushPosition && brush && (
            <TerrainBrushPreview
              position={brushPosition}
              brush={brush}
              terrainManager={terrainManager}
              visible={terrainTool !== 'none'}
            />
          )}
        </>
      ) : (
        <>
          {!showGrid && <GrassyGround ground={ground} />}
          {!showGrid && <DecorativeRocks size={ground.size} count={20} />}
        </>
      )}

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

// Inner component with toast access
function IntegratedDesignCanvasInner() {
  const toast = useToast();

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

  // Terrain system with ref for state updates
  const [terrainUpdateCounter, setTerrainUpdateCounter] = useState(0);
  const terrainManager = useMemo(() => {
    return new TerrainManager(
      {
        size: 30,
        resolution: 64,
        maxHeight: 10,
        minHeight: -2,
      },
      () => setTerrainUpdateCounter((c) => c + 1)
    );
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
  const [showSidebar, setShowSidebar] = useState(true);

  // Ground state (synced with SceneManager)
  const [ground, setGround] = useState(sceneManager.getGround());

  // Camera preset state
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective');
  const [enableCameraTransition, setEnableCameraTransition] = useState(false);

  // Terrain editing state
  const [terrainEnabled, setTerrainEnabled] = useState(false);
  const [terrainTool, setTerrainTool] = useState<TerrainTool>('none');
  const [brush, setBrush] = useState<BrushConfig>({
    size: 2,
    strength: 0.5,
    falloff: 0.5,
  });
  const [brushPosition, setBrushPosition] = useState<Vector3 | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    type: ContextMenuType;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    type: 'canvas',
  });

  // Cursor position for StatusBar
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0, z: 0 });

  // Multi-select support (array-based selection)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Rectangle selection state
  const [rectangleSelection, setRectangleSelection] = useState({
    isActive: false,
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 0, y: 0 },
  });

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
      toast.success('Plant deleted');
    } else if (selectedStructureId) {
      setStructures(structures.filter((s) => s.id !== selectedStructureId));
      setSelectedStructureId(null);
      toast.success('Structure deleted');
    }
  };

  // Delete handlers by ID (for sidebar)
  const handleDeletePlant = (id: string) => {
    setPlants(plants.filter((p) => p.id !== id));
    if (selectedPlantId === id) {
      setSelectedPlantId(null);
      selectionManager.clearSelection();
    }
    toast.success('Plant deleted');
  };

  const handleDeleteStructure = (id: string) => {
    setStructures(structures.filter((s) => s.id !== id));
    if (selectedStructureId === id) {
      setSelectedStructureId(null);
    }
    toast.success('Structure deleted');
  };

  const handleDeleteHouse = (id: string) => {
    sceneManager.removeHouse(id);
    if (selectedHouseId === id) {
      setSelectedHouseId(null);
    }
    toast.success('House deleted');
  };

  // Enhanced clipboard operations
  const handleCut = () => {
    const selectedObjects: ClipboardObject[] = [];

    if (selectedPlantId) {
      const plant = plants.find((p) => p.id === selectedPlantId);
      if (plant) selectedObjects.push(plant);
    }
    if (selectedStructureId) {
      const structure = structures.find((s) => s.id === selectedStructureId);
      if (structure) selectedObjects.push(structure);
    }

    if (selectedObjects.length > 0) {
      clipboardManager.cut(selectedObjects);
      handleDelete(); // Remove the cut objects
      toast.info(`Cut ${selectedObjects.length} object(s)`);
    }
  };

  const handleCopyToClipboard = () => {
    const selectedObjects: ClipboardObject[] = [];

    if (selectedPlantId) {
      const plant = plants.find((p) => p.id === selectedPlantId);
      if (plant) selectedObjects.push(plant);
    }
    if (selectedStructureId) {
      const structure = structures.find((s) => s.id === selectedStructureId);
      if (structure) selectedObjects.push(structure);
    }

    if (selectedObjects.length > 0) {
      clipboardManager.copy(selectedObjects);
      toast.success(`Copied ${selectedObjects.length} object(s)`);
    }
  };

  const handlePaste = () => {
    const result = clipboardManager.paste();
    if (!result) {
      toast.warning('Nothing to paste');
      return;
    }

    const { objects, wasCut } = result;

    objects.forEach((obj) => {
      if ('speciesId' in obj) {
        // It's a plant
        setPlants((prev) => [...prev, obj as PlacedPlant]);
      } else {
        // It's a structure
        setStructures((prev) => [...prev, obj as PlacedStructure]);
      }
    });

    toast.success(`Pasted ${objects.length} object(s)`);
  };

  const handleDuplicate = () => {
    const selectedObjects: ClipboardObject[] = [];

    if (selectedPlantId) {
      const plant = plants.find((p) => p.id === selectedPlantId);
      if (plant) selectedObjects.push(plant);
    }
    if (selectedStructureId) {
      const structure = structures.find((s) => s.id === selectedStructureId);
      if (structure) selectedObjects.push(structure);
    }

    if (selectedObjects.length > 0) {
      const duplicated = clipboardManager.duplicate(selectedObjects, { x: 2, z: 2 });

      duplicated.forEach((obj) => {
        if ('speciesId' in obj) {
          setPlants((prev) => [...prev, obj as PlacedPlant]);
        } else {
          setStructures((prev) => [...prev, obj as PlacedStructure]);
        }
      });

      toast.success(`Duplicated ${duplicated.length} object(s)`);
    }
  };

  // Duplicate handlers by ID (for sidebar)
  const handleDuplicatePlant = (id: string) => {
    const plant = plants.find((p) => p.id === id);
    if (plant) {
      const duplicated = clipboardManager.duplicate([plant], { x: 2, z: 2 });
      setPlants((prev) => [...prev, duplicated[0] as PlacedPlant]);
      toast.success('Plant duplicated');
    }
  };

  const handleDuplicateStructure = (id: string) => {
    const structure = structures.find((s) => s.id === id);
    if (structure) {
      const duplicated = clipboardManager.duplicate([structure], { x: 2, z: 2 });
      setStructures((prev) => [...prev, duplicated[0] as PlacedStructure]);
      toast.success('Structure duplicated');
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

  // Ground change handler
  const handleGroundChange = (updates: Partial<typeof ground>) => {
    sceneManager.updateGround(updates);
    setGround(sceneManager.getGround());
  };

  // Camera preset handler
  const handleCameraPresetChange = (preset: CameraPreset) => {
    setCameraPreset(preset);
    setEnableCameraTransition(true);
    // Reset after transition completes
    setTimeout(() => setEnableCameraTransition(false), 1000);
  };

  // Terrain handlers
  const handleTerrainClick = (position: { x: number; y: number; z: number }) => {
    if (terrainTool === 'none' || !terrainEnabled) return;

    // Apply brush at click position
    terrainManager.applyBrush(position.x, position.z, terrainTool, brush);
    toast.info(`Applied ${terrainTool} tool`);
  };

  const handleTerrainConfigChange = (updates: Partial<TerrainConfig>) => {
    if (updates) {
      terrainManager.updateConfig(updates);
      setTerrainUpdateCounter((c) => c + 1);
    }
  };

  const handleTerrainReset = () => {
    terrainManager.reset();
    toast.success('Terrain reset to flat');
  };

  const handleTerrainGenerate = () => {
    terrainManager.generateRandomTerrain(3);
    toast.success('Generated random terrain');
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    { key: 'z', ctrl: true, handler: () => undo(), description: 'Undo' },
    { key: 'y', ctrl: true, handler: () => redo(), description: 'Redo' },
    { key: 's', ctrl: true, handler: (e) => { e.preventDefault(); handleSave(); }, description: 'Save' },
    { key: 'Delete', handler: () => handleDelete(), description: 'Delete' },
    { key: 'Backspace', handler: () => handleDelete(), description: 'Delete' },
    { key: 'x', ctrl: true, handler: (e) => { e.preventDefault(); handleCut(); }, description: 'Cut' },
    { key: 'c', ctrl: true, handler: (e) => { e.preventDefault(); handleCopyToClipboard(); }, description: 'Copy' },
    { key: 'v', ctrl: true, handler: (e) => { e.preventDefault(); handlePaste(); }, description: 'Paste' },
    { key: 'd', ctrl: true, handler: (e) => { e.preventDefault(); handleDuplicate(); }, description: 'Duplicate' },
    { key: 'a', ctrl: true, handler: (e) => { e.preventDefault(); console.log('Select all'); }, description: 'Select All' },
    { key: 'Escape', handler: () => {
      setSelectedPlantId(null);
      setSelectedStructureId(null);
      setSelectedHouseId(null);
      selectionManager.clearSelection();
      setContextMenu({ ...contextMenu, visible: false });
    }, description: 'Deselect' },
  ]);

  // Selection count
  const selectedCount = (selectedPlantId ? 1 : 0) + (selectedStructureId ? 1 : 0) + (selectedHouseId ? 1 : 0);

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const type: ContextMenuType = selectedCount > 0 ? 'object' : 'canvas';
    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY },
      type,
    });
  };

  // Alignment handlers
  const handleAlign = (type: AlignmentType) => {
    const selectedObjects: Array<{ position: { x: number; y?: number; z: number }; bounds?: { width: number; depth: number } }> = [];

    if (selectedPlantId) {
      const plant = plants.find((p) => p.id === selectedPlantId);
      if (plant) selectedObjects.push({ position: plant.position, bounds: { width: 1, depth: 1 } });
    }
    if (selectedStructureId) {
      const structure = structures.find((s) => s.id === selectedStructureId);
      if (structure) selectedObjects.push({ position: structure.position, bounds: { width: 2, depth: 2 } });
    }

    if (selectedObjects.length < 2) {
      toast.warning('Select at least 2 objects to align');
      return;
    }

    const newPositions = calculateAlignedPosition(selectedObjects, type);

    // Update plant positions
    if (selectedPlantId) {
      const plantIndex = 0; // Simplified - would need proper index tracking
      setPlants((prev) =>
        prev.map((p) =>
          p.id === selectedPlantId
            ? { ...p, position: { ...p.position, x: newPositions[plantIndex].x, z: newPositions[plantIndex].z } }
            : p
        )
      );
    }

    toast.success(`Aligned objects: ${type}`);
  };

  const handleDistribute = (type: DistributionType) => {
    const selectedObjects: Array<{ position: { x: number; z: number }; bounds?: { width: number; depth: number } }> = [];

    if (selectedPlantId) {
      const plant = plants.find((p) => p.id === selectedPlantId);
      if (plant) selectedObjects.push({ position: { x: plant.position.x, z: plant.position.z }, bounds: { width: 1, depth: 1 } });
    }
    if (selectedStructureId) {
      const structure = structures.find((s) => s.id === selectedStructureId);
      if (structure) selectedObjects.push({ position: { x: structure.position.x, z: structure.position.z }, bounds: { width: 2, depth: 2 } });
    }

    if (selectedObjects.length < 3) {
      toast.warning('Select at least 3 objects to distribute');
      return;
    }

    const newPositions = calculateDistributedPositions(selectedObjects, type);
    toast.success(`Distributed objects: ${type}`);
  };

  return (
    <div
      className="relative w-full h-screen bg-gradient-to-br from-sky-200 to-sky-100"
      onContextMenu={handleContextMenu}
    >
      {/* Tutorial Panel */}
      {showTutorial && (
        <TutorialPanel onClose={() => setShowTutorial(false)} />
      )}

      {/* Unified Sidebar */}
      <UnifiedSidebar
        plants={plants}
        structures={structures}
        houses={sceneManager.getHouses()}
        selectedPlantId={selectedPlantId}
        selectedStructureId={selectedStructureId}
        selectedHouseId={selectedHouseId}
        onSelectPlant={setSelectedPlantId}
        onSelectStructure={setSelectedStructureId}
        onSelectHouse={setSelectedHouseId}
        onDeletePlant={handleDeletePlant}
        onDeleteStructure={handleDeleteStructure}
        onDeleteHouse={handleDeleteHouse}
        onDuplicatePlant={handleDuplicatePlant}
        onDuplicateStructure={handleDuplicateStructure}
        ground={ground}
        onGroundChange={handleGroundChange}
        terrainConfig={terrainManager.getConfig()}
        terrainStats={terrainManager.getStats()}
        onTerrainConfigChange={handleTerrainConfigChange}
        visible={showSidebar}
        onClose={() => setShowSidebar(false)}
      />

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

      {/* Camera Presets */}
      <div className="absolute top-4 right-4 z-30 space-y-2">
        <CameraPresets
          currentPreset={cameraPreset}
          onPresetChange={handleCameraPresetChange}
          compact={false}
          vertical={false}
        />
        {/* Terrain Mode Toggle */}
        <button
          onClick={() => {
            setTerrainEnabled(!terrainEnabled);
            if (!terrainEnabled) {
              toast.success('Terrain editing enabled');
            } else {
              toast.info('Terrain editing disabled');
              setTerrainTool('none');
            }
          }}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
            terrainEnabled
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-white/90 text-gray-700 hover:bg-white'
          }`}
          title={terrainEnabled ? 'Disable terrain editing' : 'Enable terrain editing'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span className="text-sm font-medium">
            {terrainEnabled ? 'Terrain ON' : 'Terrain OFF'}
          </span>
        </button>
      </div>

      {/* Terrain Tools */}
      {terrainEnabled && (
        <>
          <div className="absolute left-4 bottom-24 z-30">
            <TerrainToolbar
              activeTool={terrainTool}
              onToolChange={setTerrainTool}
              onReset={handleTerrainReset}
              onGenerateRandom={handleTerrainGenerate}
            />
          </div>
          <div className="absolute left-4 bottom-[420px] z-30">
            <BrushSettings brush={brush} onBrushChange={setBrush} />
          </div>
        </>
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
              cameraPreset={cameraPreset}
              enableCameraTransition={enableCameraTransition}
              terrainManager={terrainManager}
              terrainEnabled={terrainEnabled}
              terrainTool={terrainTool}
              brush={brush}
              brushPosition={brushPosition}
              onTerrainClick={handleTerrainClick}
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

      {/* Status Bar */}
      <StatusBar
        cursorPosition={cursorPosition}
        selectedCount={selectedCount}
        editMode={editMode === 'vertex' || editMode === 'measure' ? 'select' : editMode}
        snapToGrid={snapToGridEnabled}
        gridSize={gridSize}
        unit="ft"
        hasUnsavedChanges={canUndo}
      />

      {/* Context Menu */}
      {contextMenu.visible && (
        <ContextMenu
          type={contextMenu.type}
          position={contextMenu.position}
          onClose={() => setContextMenu({ ...contextMenu, visible: false })}
          items={
            contextMenu.type === 'object'
              ? getObjectMenuItems({
                  onCut: handleCut,
                  onCopy: handleCopyToClipboard,
                  onPaste: handlePaste,
                  onDuplicate: handleDuplicate,
                  onDelete: handleDelete,
                  canGroup: false,
                })
              : getCanvasMenuItems({
                  onPaste: handlePaste,
                  canPaste: clipboardManager.hasContent(),
                })
          }
        />
      )}

      {/* Rectangle Selection */}
      <RectangleSelection
        startPoint={rectangleSelection.startPoint}
        endPoint={rectangleSelection.endPoint}
        isActive={rectangleSelection.isActive}
      />

      {/* Alignment Tools - Show when multiple objects selected */}
      {selectedCount >= 2 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <AlignmentTools
            selectedCount={selectedCount}
            onAlign={handleAlign}
            onDistribute={handleDistribute}
          />
        </div>
      )}
    </div>
  );
}

// Main export with ToastProvider wrapper
export default function IntegratedDesignCanvas() {
  return (
    <ToastProvider>
      <IntegratedDesignCanvasInner />
    </ToastProvider>
  );
}
