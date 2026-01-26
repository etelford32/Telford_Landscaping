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
// SelectionManager removed - using React state for selection
// DragController removed - dragging now handled by DraggableObject component
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
import CameraControlPanel from "./camera/CameraControlPanel";
import WorkspaceLayoutManager from "./ui/WorkspaceLayoutManager";
import ModeIndicator from "./ui/ModeIndicator";
import ModeAwareElement from "./ui/ModeAwareElement";
import KeyboardShortcutOverlay from "./ui/KeyboardShortcutOverlay";
import { modeManager, AppMode } from "@/lib/ui/ModeManager";
import { useArrowKeyCamera } from "@/lib/hooks/useArrowKeyCamera";

// Terrain System
import { TerrainManager, BrushConfig, TerrainTool, TerrainConfig } from "@/lib/terrain/TerrainManager";
import EditableTerrain from "./terrain/EditableTerrain";
import TerrainBrushPreview from "./terrain/TerrainBrushPreview";
import TerrainToolbar from "./terrain/TerrainToolbar";
import BrushSettings from "./terrain/BrushSettings";

// Hardscape System
import HardscapeToolbox from "./HardscapeToolbox";
import HardscapePresets from "./HardscapePresets";
import { applyPresetToHouse, HardscapePreset } from "@/lib/hardscape/presets";

// Unified Interaction
import DraggableObject from "./DraggableObject";
import CanvasInteractionHandler from "./CanvasInteractionHandler";

// Scene Component
function Scene({
  plants,
  structures,
  sceneManager,
  age,
  onPlantClick,
  onStructureClick,
  onHouseClick,
  onPlantDrag,
  onStructureDrag,
  onDragEnd,
  onDeselect,
  onCursorPositionChange,
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
  snapToGrid,
}: {
  plants: PlacedPlant[];
  structures: PlacedStructure[];
  sceneManager: SceneManager;
  age: number;
  onPlantClick: (id: string) => void;
  onStructureClick: (id: string) => void;
  onHouseClick: (id: string) => void;
  onPlantDrag: (id: string, newPosition: { x: number; y: number; z: number }) => void;
  onStructureDrag: (id: string, newPosition: { x: number; y: number; z: number }) => void;
  onDragEnd: () => void;
  onDeselect: () => void;
  onCursorPositionChange: (pos: { x: number; y: number; z: number }) => void;
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
  snapToGrid: boolean;
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

      {/* Canvas Interaction Handler */}
      <CanvasInteractionHandler
        onDeselect={onDeselect}
        onCursorPositionChange={onCursorPositionChange}
        enabled={!gridClickEnabled}
      />

      {/* Structures with dragging support */}
      {structures.map((structure) => (
        <DraggableObject
          key={structure.id}
          id={structure.id}
          type="structure"
          position={structure.position}
          draggable={editMode === 'move'}
          selected={structure.id === selectedStructureId}
          onSelect={(id) => onStructureClick(id)}
          onDrag={onStructureDrag}
          onDragEnd={() => onDragEnd()}
          snapToGrid={snapToGrid}
          gridSize={gridSize}
        >
          <StructureModel
            structure={{ ...structure, position: { x: 0, y: 0, z: 0 } }}
            onClick={() => {}}
          />
        </DraggableObject>
      ))}

      {/* Plants with dragging support */}
      {plants.map((plant) => (
        <DraggableObject
          key={plant.id}
          id={plant.id}
          type="plant"
          position={plant.position}
          draggable={editMode === 'move'}
          selected={plant.id === selectedPlantId}
          onSelect={(id) => onPlantClick(id)}
          onDrag={onPlantDrag}
          onDragEnd={() => onDragEnd()}
          snapToGrid={snapToGrid}
          gridSize={gridSize}
        >
          <PlantModel
            plant={{ ...plant, age, position: { x: 0, y: 0, z: 0 } }}
            onClick={() => {}}
          />
          {plant.id === selectedPlantId && (
            <ObjectHighlight
              position={[0, 0, 0]}
              size={1.5}
              color="#4ade80"
              isActive={true}
            />
          )}
        </DraggableObject>
      ))}

      {/* Transform Gizmo - Only for scale and rotate modes (move is handled by DraggableObject) */}
      {selectedPosition && (editMode === 'scale' || editMode === 'rotate') && (
        <TransformGizmo
          position={selectedPosition}
          onTransform={onTransform}
          mode={editMode === 'scale' ? 'scale' : 'rotate'}
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
  // Note: SelectionManager and DragController removed - now using React state for selection
  // and DraggableObject component for dragging
  const cameraController = useMemo(() => new CameraController(), []);
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
  const [showHardscapeToolbox, setShowHardscapeToolbox] = useState(false);
  const [showHardscapePresets, setShowHardscapePresets] = useState(false);
  const [showPrecisionPanel, setShowPrecisionPanel] = useState(false);
  const [showPropertyPanel, setShowPropertyPanel] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Ground state (synced with SceneManager)
  const [ground, setGround] = useState(sceneManager.getGround());

  // Camera preset state
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('perspective');
  const [enableCameraTransition, setEnableCameraTransition] = useState(false);

  // Camera settings state
  const [cameraSettings, setCameraSettings] = useState({
    panSpeed: 1.0,
    zoomSpeed: 1.0,
    rotationSpeed: 1.0,
    fov: 50,
    lockX: false,
    lockY: false,
    lockZ: false,
    minDistance: 5,
    maxDistance: 40,
  });

  // UI panel visibility
  const [showCameraPanel, setShowCameraPanel] = useState(true);
  const [showWorkspaceManager, setShowWorkspaceManager] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Mode system state
  const [currentMode, setCurrentMode] = useState<AppMode>(modeManager.getCurrentMode());

  // Arrow key camera navigation state
  const [arrowKeyCameraEnabled, setArrowKeyCameraEnabled] = useState(true);

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
  }, [editMode, snapToGridEnabled, gridSize, editModeController]);

  // Subscribe to mode changes
  useEffect(() => {
    const unsubscribe = modeManager.subscribe((mode) => {
      setCurrentMode(mode);

      // Auto-enable/disable terrain when switching to/from terrain mode
      if (mode === 'terrain' && !terrainEnabled) {
        setTerrainEnabled(true);
        toast.success('Terrain mode activated');
      } else if (mode !== 'terrain' && terrainEnabled) {
        setTerrainEnabled(false);
        setTerrainTool('none');
      }
    });
    return () => {
      unsubscribe();
    };
  }, [terrainEnabled, toast]);

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

  // Handle plant click - unified selection via React state
  const handlePlantClick = (plantId: string) => {
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
    setGridClickEnabled(false);
    setPendingPlantSpecies(null);
  };

  // Handle house click
  const handleHouseClick = (houseId: string) => {
    setSelectedHouseId(houseId);
    setSelectedPlantId(null);
    setSelectedStructureId(null);
    setGridClickEnabled(false);
    setPendingPlantSpecies(null);
  };

  // Handle plant drag (direct movement)
  const handlePlantDrag = (id: string, newPosition: { x: number; y: number; z: number }) => {
    setPlants(plants.map(p =>
      p.id === id ? { ...p, position: newPosition } : p
    ));
  };

  // Handle structure drag (direct movement)
  const handleStructureDrag = (id: string, newPosition: { x: number; y: number; z: number }) => {
    setStructures(structures.map(s =>
      s.id === id ? { ...s, position: newPosition } : s
    ));
  };

  // Handle drag end (for undo history)
  const handleDragEnd = () => {
    // The drag is complete - state has already been updated
    // This is where we could trigger a state snapshot for undo
  };

  // Handle deselect (click on empty canvas)
  const handleDeselect = () => {
    setSelectedPlantId(null);
    setSelectedStructureId(null);
    setSelectedHouseId(null);
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
    setCameraPreset('perspective');
    setEnableCameraTransition(true);
    setTimeout(() => setEnableCameraTransition(false), 1000);
    toast.info('Camera reset to default view');
  };

  const handleFocusSelected = () => {
    if (!selectedPlantId && !selectedStructureId && !selectedHouseId) {
      toast.warning('No object selected');
      return;
    }
    toast.info('Focus on selected object');
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

  // Camera settings handler
  const handleCameraSettingsChange = (updates: Partial<typeof cameraSettings>) => {
    setCameraSettings((prev) => ({ ...prev, ...updates }));
  };

  // Camera manual movement handler (for button clicks)
  const handleCameraManualMove = (direction: 'up' | 'down' | 'left' | 'right' | 'forward' | 'backward') => {
    // Camera movement is handled via OrbitControls pan/zoom
    // This is a placeholder for custom camera button controls
    toast.info(`Camera moving ${direction}`);
  };

  // Arrow key camera movement handler (receives vector coordinates)
  const handleArrowKeyMove = (_delta: { x: number; y: number; z: number }) => {
    // Camera panning via arrow keys is handled by OrbitControls
    // Delta values are available for custom camera implementations
  };

  // Arrow key camera hook
  useArrowKeyCamera({
    enabled: arrowKeyCameraEnabled && currentMode === 'camera',
    speed: cameraSettings.panSpeed * 0.1,
    smoothing: 0.15,
    onMove: handleArrowKeyMove,
  });

  // Screenshot handler
  const handleTakeScreenshot = (_quality: number) => {
    // Screenshot functionality - would use canvas.toDataURL()
    toast.success('Screenshot captured!');
  };

  // Hardscape preset handler
  const handlePresetApply = (preset: HardscapePreset) => {
    if (!selectedHouseId) {
      toast.error('Please select a house first');
      return;
    }

    const selectedHouse = sceneManager.getHouse(selectedHouseId);
    if (!selectedHouse) {
      toast.error('House not found');
      return;
    }

    const newStructures = applyPresetToHouse(preset, selectedHouse.position, selectedHouse.rotation);
    setStructures([...structures, ...newStructures]);
    toast.success(`Applied ${preset.name} preset!`);
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
    { key: 'a', ctrl: true, handler: (e) => { e.preventDefault(); toast.info('Select All - multi-select coming soon'); }, description: 'Select All' },
    { key: 'l', ctrl: true, handler: (e) => { e.preventDefault(); setShowWorkspaceManager(!showWorkspaceManager); }, description: 'Toggle Workspace Layouts' },
    { key: 'k', ctrl: true, handler: (e) => { e.preventDefault(); setShowCameraPanel(!showCameraPanel); }, description: 'Toggle Camera Panel' },
    // Mode switching shortcuts
    { key: '1', handler: () => { modeManager.setMode('design'); toast.info('Design Mode'); }, description: 'Switch to Design Mode' },
    { key: '2', handler: () => { modeManager.setMode('terrain'); toast.info('Terrain Mode'); }, description: 'Switch to Terrain Mode' },
    { key: '3', handler: () => { modeManager.setMode('hardscape'); toast.info('Hardscape Mode'); }, description: 'Switch to Hardscape Mode' },
    { key: '4', handler: () => { modeManager.setMode('camera'); toast.info('Camera Mode'); }, description: 'Switch to Camera Mode' },
    { key: '5', handler: () => { modeManager.setMode('view'); toast.info('View Mode'); }, description: 'Switch to View Mode' },
    { key: 'Tab', handler: (e) => { e.preventDefault(); modeManager.cycleMode(); }, description: 'Cycle Modes' },
    { key: '?', handler: () => { setShowKeyboardShortcuts(!showKeyboardShortcuts); }, description: 'Toggle Keyboard Shortcuts' },
    { key: 'F1', handler: (e) => { e.preventDefault(); setShowKeyboardShortcuts(!showKeyboardShortcuts); }, description: 'Toggle Keyboard Shortcuts' },
    { key: 'Escape', handler: () => {
      setSelectedPlantId(null);
      setSelectedStructureId(null);
      setSelectedHouseId(null);
      setContextMenu({ ...contextMenu, visible: false });
      setShowWorkspaceManager(false);
      setShowKeyboardShortcuts(false);
    }, description: 'Deselect / Close Dialogs' },
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
      {/* Skip Link for Screen Readers */}
      <a href="#main-canvas" className="skip-link">
        Skip to 3D Canvas
      </a>

      {/* Workspace Layout Button - Top Left */}
      <button
        onClick={() => setShowWorkspaceManager(true)}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all border border-gray-200"
        title="Workspace Layouts (Ctrl+L)"
      >
        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
        </svg>
        <span className="text-sm font-semibold text-gray-700">Workspace Layouts</span>
      </button>

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
        onOpenHardscapeToolbox={() => setShowHardscapeToolbox(true)}
        onOpenHardscapePresets={() => setShowHardscapePresets(true)}
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
              // Add structure to the scene at a default position
              const newStructure: PlacedStructure = {
                id: `structure-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                structureId: structure.id,
                position: { x: 0, y: 0, z: 5 },
                rotation: 0,
                scale: 1,
                selected: false,
              };
              setStructures([...structures, newStructure]);
              setSelectedStructureId(newStructure.id);
              toast.success(`Added ${structure.commonName}`);
            }}
            selectedStructureId={selectedStructureId || undefined}
          />
        </div>
      )}

      {/* Hardscape Toolbox */}
      {showHardscapeToolbox && (
        <div className="absolute right-4 top-24 z-30">
          <HardscapeToolbox
            onStructureSelect={(structure) => {
              // Add hardscape structure to the scene at a default position
              const newStructure: PlacedStructure = {
                id: `structure-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                structureId: structure.id,
                position: { x: 0, y: 0, z: 0 },
                rotation: 0,
                scale: 1,
                selected: false,
              };
              setStructures([...structures, newStructure]);
              setSelectedStructureId(newStructure.id);
              toast.success(`Added ${structure.commonName}`);
            }}
            selectedStructureId={selectedStructureId || undefined}
            visible={showHardscapeToolbox}
            onClose={() => setShowHardscapeToolbox(false)}
          />
        </div>
      )}

      {/* Hardscape Presets */}
      {showHardscapePresets && (
        <div className="absolute right-4 top-24 z-30">
          <HardscapePresets
            onPresetSelect={handlePresetApply}
            selectedHouseId={selectedHouseId}
            visible={showHardscapePresets}
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

      {/* Camera Control Panel */}
      {showCameraPanel && (
        <CameraControlPanel
          currentPreset={cameraPreset}
          onPresetChange={handleCameraPresetChange}
          cameraSettings={cameraSettings}
          onCameraSettingsChange={handleCameraSettingsChange}
          currentPosition={cursorPosition}
          currentTarget={{ x: 0, y: 0, z: 0 }}
          onManualMove={handleCameraManualMove}
          onResetCamera={handleResetCamera}
          onTakeScreenshot={handleTakeScreenshot}
        />
      )}

      {/* Terrain Mode Toggle Button - Top Right */}
      <div className="absolute top-4 right-4 z-30">
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
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all shadow-lg ${
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

      {/* Workspace Layout Manager */}
      {showWorkspaceManager && (
        <WorkspaceLayoutManager
          visible={showWorkspaceManager}
          onClose={() => setShowWorkspaceManager(false)}
        />
      )}

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
      <div
        id="main-canvas"
        ref={canvasRef}
        className="w-full h-full"
        role="application"
        aria-label="3D Landscape Design Canvas. Use arrow keys or WASD to navigate camera. Press ? for keyboard shortcuts."
      >
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
              age={age}
              onPlantClick={handlePlantClick}
              onStructureClick={handleStructureClick}
              onHouseClick={handleHouseClick}
              onPlantDrag={handlePlantDrag}
              onStructureDrag={handleStructureDrag}
              onDragEnd={handleDragEnd}
              onDeselect={handleDeselect}
              onCursorPositionChange={setCursorPosition}
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
              snapToGrid={snapToGridEnabled}
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

      {/* Mode Indicator - Bottom Center */}
      <ModeIndicator
        compact={false}
        showQuickSwitch={true}
      />

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcutOverlay
        visible={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
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
