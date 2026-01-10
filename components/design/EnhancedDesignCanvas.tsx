/**
 * EnhancedDesignCanvas - OOP-based 3D Design Editor
 * Integrates all editor systems: Camera, Selection, Drag, Scene Management
 */

"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Sky } from "@react-three/drei";
import { Suspense, useState, useRef, useEffect, useMemo } from "react";
import { Vector2, Vector3 } from "three";
import { PlacedPlant } from "@/lib/plantData";
import { PlacedStructure } from "@/lib/structureData";
import { PlantModel } from "./PlantModels";
import { StructureModel } from "./StructureModels";
import PlantToolbox from "./PlantToolbox";
import StructureToolbox from "./StructureToolbox";
import { HouseModel } from "./HouseModel";
import { GrassyGround, DecorativeRocks } from "./GrassyGround";
import { Trash2, RotateCw, Copy, Clock, Home, Move, MousePointer2, Maximize2, Undo2, Redo2, Save, Upload, Download } from "lucide-react";

// Import OOP Systems
import { CameraController } from "@/lib/editor/CameraController";
import { SelectionManager } from "@/lib/editor/SelectionManager";
import { DragController } from "@/lib/editor/DragController";
import { SceneManager } from "@/lib/editor/SceneManager";
import { snapToGrid } from "./DesignGrid";

// Import new features
import { useUndoRedo } from "@/lib/hooks/useUndoRedo";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import PropertyPanel from "./PropertyPanel";
import DebugPanel from "./DebugPanel";
import { saveDesign, loadDesign, saveToLocalStorage, loadFromLocalStorage } from "@/lib/design/saveLoad";

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
}) {
  const houses = sceneManager.getHouses();
  const ground = sceneManager.getGround();

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

      {/* Grassy Ground */}
      <GrassyGround ground={ground} />
      <DecorativeRocks size={ground.size} count={20} />

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

      {/* Plants */}
      {plants.map((plant) => (
        <PlantModel
          key={plant.id}
          plant={{ ...plant, age }}
          onClick={() => onPlantClick(plant.id)}
        />
      ))}
    </>
  );
}

// Main Enhanced Design Canvas
export default function EnhancedDesignCanvas() {
  // OOP System Instances
  const cameraController = useMemo(() => new CameraController(), []);
  const selectionManager = useMemo(
    () =>
      new SelectionManager({
        onSelectionChange: (event) => {
          console.log("Selection changed:", event);
        },
      }),
    []
  );
  const dragController = useMemo(
    () =>
      new DragController({
        snapToGrid: true,
        gridSize: 1,
        dragPlaneY: 0,
      }),
    []
  );
  const sceneManager = useMemo(() => {
    const sm = new SceneManager();
    sm.createDefaultScene(); // Add 3 default houses
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
    historySize,
  } = useUndoRedo<DesignState>(
    { plants: [], structures: [] },
    50 // max history
  );

  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [age, setAge] = useState<number>(5);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'move'>('select');
  const [showPropertyPanel, setShowPropertyPanel] = useState(true);

  const canvasRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef(new Vector2());
  const cameraRef = useRef<any>(null);
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

  // Register plants with systems
  useEffect(() => {
    plants.forEach((plant) => {
      selectionManager.register({
        id: plant.id,
        onSelect: () => {
          setSelectedPlantId(plant.id);
          setSelectedHouseId(null);
        },
        onDeselect: () => {
          if (selectedPlantId === plant.id) {
            setSelectedPlantId(null);
          }
        },
      });

      dragController.register({
        id: plant.id,
        position: new Vector3(plant.position.x, plant.position.y, plant.position.z),
        onDrag: (newPosition) => {
          setPlants((prevPlants) =>
            prevPlants.map((p) =>
              p.id === plant.id
                ? { ...p, position: { x: newPosition.x, y: newPosition.y, z: newPosition.z } }
                : p
            )
          );
        },
      });
    });

    return () => {
      plants.forEach((plant) => {
        selectionManager.unregister(plant.id);
        dragController.unregister(plant.id);
      });
    };
  }, [plants, selectionManager, dragController]);

  // Handle drop from toolbox (plants or structures)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const plantId = e.dataTransfer.getData("plantId");
    const structureId = e.dataTransfer.getData("structureId");

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 30 - 15;
    const z = ((e.clientY - rect.top) / rect.height) * 30 - 15;

    const snappedX = snapToGrid(x, 1);
    const snappedZ = snapToGrid(z, 1);

    if (plantId) {
      const newPlant: PlacedPlant = {
        id: `plant-${Date.now()}-${Math.random()}`,
        speciesId: plantId,
        position: { x: snappedX, y: 0, z: snappedZ },
        rotation: 0,
        scale: 1,
        age: age,
        variant: 0,
        selected: false,
      };
      setPlants([...plants, newPlant]);
    } else if (structureId) {
      const newStructure: PlacedStructure = {
        id: `structure-${Date.now()}-${Math.random()}`,
        structureId: structureId,
        position: { x: snappedX, y: 0, z: snappedZ },
        rotation: 0,
        scale: 1,
        selected: false,
      };
      setStructures([...structures, newStructure]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  // Handle plant click
  const handlePlantClick = (plantId: string) => {
    selectionManager.select(plantId);
    setSelectedHouseId(null);
    setSelectedStructureId(null);
  };

  // Handle structure click
  const handleStructureClick = (structureId: string) => {
    setSelectedStructureId(structureId);
    setSelectedPlantId(null);
    setSelectedHouseId(null);
    selectionManager.clearSelection();

    // Mark structure as selected
    setStructures(structures.map(s => ({
      ...s,
      selected: s.id === structureId
    })));
  };

  // Handle house click
  const handleHouseClick = (houseId: string) => {
    setSelectedHouseId(houseId);
    setSelectedPlantId(null);
    setSelectedStructureId(null);
    selectionManager.clearSelection();
  };

  // Plant actions
  const selectedPlant = plants.find((p) => p.id === selectedPlantId);

  const deletePlant = () => {
    if (!selectedPlantId) return;
    setPlants(plants.filter((p) => p.id !== selectedPlantId));
    selectionManager.clearSelection();
    setSelectedPlantId(null);
  };

  const duplicatePlant = () => {
    if (!selectedPlantId) return;
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
  };

  const rotatePlant = () => {
    if (!selectedPlantId) return;
    setPlants(
      plants.map((p) =>
        p.id === selectedPlantId
          ? { ...p, rotation: (p.rotation + Math.PI / 4) % (Math.PI * 2) }
          : p
      )
    );
  };

  // Structure actions
  const selectedStructure = structures.find((s) => s.id === selectedStructureId);

  const deleteStructure = () => {
    if (!selectedStructureId) return;
    setStructures(structures.filter((s) => s.id !== selectedStructureId));
    setSelectedStructureId(null);
  };

  const duplicateStructure = () => {
    if (!selectedStructureId) return;
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
  };

  const rotateStructure = () => {
    if (!selectedStructureId) return;
    setStructures(
      structures.map((s) =>
        s.id === selectedStructureId
          ? { ...s, rotation: (s.rotation + Math.PI / 4) % (Math.PI * 2) }
          : s
      )
    );
  };

  // Focus camera on house
  const focusOnHouse = (houseId: string) => {
    const house = sceneManager.getHouse(houseId);
    if (house) {
      cameraController.focusOnPoint(house.position, 12);
    }
  };

  // Save/Load Functions
  const handleSave = () => {
    const name = prompt("Enter design name:", "My Landscape Design");
    if (name) {
      saveDesign(name, plants, structures, age);
    }
  };

  const handleLoad = async () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await loadDesign(file);
      setDesignState({ plants: data.plants, structures: data.structures });
      setAge(data.age);
    } catch (error) {
      alert("Failed to load design: " + (error as Error).message);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Auto-save to localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      saveToLocalStorage("landscape-autosave", plants, structures, age);
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [plants, structures, age]);

  // Load autosave on mount
  useEffect(() => {
    const autosave = loadFromLocalStorage("landscape-autosave");
    if (autosave && autosave.plants.length > 0) {
      const shouldLoad = confirm("Found auto-saved design. Load it?");
      if (shouldLoad) {
        setDesignState({ plants: autosave.plants, structures: autosave.structures });
        setAge(autosave.age);
      }
    }
  }, []);

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      key: 'z',
      ctrl: true,
      handler: () => undo(),
      description: 'Undo',
    },
    {
      key: 'y',
      ctrl: true,
      handler: () => redo(),
      description: 'Redo',
    },
    {
      key: 'z',
      ctrl: true,
      shift: true,
      handler: () => redo(),
      description: 'Redo (alternate)',
    },
    {
      key: 'd',
      handler: () => {
        if (selectedPlantId) deletePlant();
        else if (selectedStructureId) deleteStructure();
      },
      description: 'Delete selected',
    },
    {
      key: 'Delete',
      handler: () => {
        if (selectedPlantId) deletePlant();
        else if (selectedStructureId) deleteStructure();
      },
      description: 'Delete selected',
    },
    {
      key: 'c',
      handler: () => {
        if (selectedPlantId) duplicatePlant();
        else if (selectedStructureId) duplicateStructure();
      },
      description: 'Copy selected',
    },
    {
      key: 'r',
      handler: () => {
        if (selectedPlantId) rotatePlant();
        else if (selectedStructureId) rotateStructure();
      },
      description: 'Rotate selected',
    },
    {
      key: 's',
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        handleSave();
      },
      description: 'Save design',
    },
    {
      key: 'o',
      ctrl: true,
      handler: (e) => {
        e.preventDefault();
        handleLoad();
      },
      description: 'Open design',
    },
    {
      key: 'Escape',
      handler: () => {
        setSelectedPlantId(null);
        setSelectedStructureId(null);
        setSelectedHouseId(null);
        selectionManager.clearSelection();
      },
      description: 'Deselect all',
    },
  ]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-sky-200 to-sky-100">
      {/* Plant Toolbox - Left */}
      <PlantToolbox
        onPlantSelect={(species) => {
          // Handle plant selection if needed
        }}
        selectedPlantId={selectedPlantId || undefined}
      />

      {/* Structure Toolbox - Right */}
      <StructureToolbox
        onStructureSelect={(structure) => {
          // Handle structure selection if needed
        }}
        selectedStructureId={selectedStructureId || undefined}
      />

      {/* Main Toolbar - Top Left */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-3 z-20 space-y-3">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setDragMode('select')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              dragMode === 'select'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MousePointer2 className="w-4 h-4" />
            Select
          </button>
          <button
            onClick={() => setDragMode('move')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              dragMode === 'move'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Move className="w-4 h-4" />
            Move
          </button>
        </div>

        {/* Undo/Redo & Save/Load */}
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
              canUndo
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
              canRedo
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px bg-gray-300 mx-1"></div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all"
            title="Save Design (Ctrl+S)"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleLoad}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-all"
            title="Load Design (Ctrl+O)"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[15, 12, 15]} fov={50} ref={cameraRef} />
          <OrbitControls {...cameraController.getControlSettings()} />

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
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Age/Time Slider - Bottom Center */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 w-96 z-20">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-gray-900">Growth Timeline</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 w-16">Year {age}</span>
          <input
            type="range"
            min="1"
            max="30"
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value))}
            className="flex-1 h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-600 w-12">30 yrs</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Slide to see how your landscape will look over time
        </p>
      </div>

      {/* Property Panel for detailed editing */}
      {showPropertyPanel && (
        <PropertyPanel
          selectedPlant={selectedPlant}
          selectedStructure={selectedStructure}
          onPlantUpdate={(updatedPlant) => {
            setPlants(plants.map(p => p.id === updatedPlant.id ? updatedPlant : p));
          }}
          onStructureUpdate={(updatedStructure) => {
            setStructures(structures.map(s => s.id === updatedStructure.id ? updatedStructure : s));
          }}
          onClose={() => setShowPropertyPanel(false)}
        />
      )}

      {/* Quick Action Controls - Bottom Right */}
      {selectedPlant && !selectedStructure && (
        <div className="absolute bottom-24 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 w-64 z-20">
          <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={rotatePlant}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                <RotateCw className="w-4 h-4" />
                Rotate
              </button>
              <button
                onClick={duplicatePlant}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
            <button
              onClick={deletePlant}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {selectedStructure && !selectedPlant && (
        <div className="absolute bottom-24 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 w-64 z-20">
          <h3 className="font-bold text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={rotateStructure}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm"
              >
                <RotateCw className="w-4 h-4" />
                Rotate
              </button>
              <button
                onClick={duplicateStructure}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
            <button
              onClick={deleteStructure}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}

      {/* House Info Panel */}
      {selectedHouseId && (
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 w-64 z-20">
          <div className="flex items-center gap-2 mb-3">
            <Home className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-gray-900">Selected House</h3>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Style: <span className="font-semibold capitalize">{sceneManager.getHouse(selectedHouseId)?.style}</span>
          </p>
          <button
            onClick={() => focusOnHouse(selectedHouseId)}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            <MousePointer2 className="w-4 h-4" />
            Focus Camera
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 max-w-md z-20">
        <h3 className="font-bold text-gray-900 mb-2 text-sm">3D Design Tool</h3>
        <div className="grid grid-cols-2 gap-x-4 text-xs text-gray-700 space-y-1">
          <div>
            <p className="font-semibold text-primary-600 mb-1">Plants:</p>
            <ul className="space-y-0.5">
              <li>• Drag from left toolbox</li>
              <li>• 30 CA native species</li>
              <li>• Watch 30-year growth</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-amber-600 mb-1">Structures:</p>
            <ul className="space-y-0.5">
              <li>• Drag from right toolbox</li>
              <li>• Patios, pergolas, fences</li>
              <li>• Water features & more</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2 pt-2 border-t">
          Click to select • Orbit/pan/zoom with mouse • Ctrl+Z/Y to undo/redo
        </p>
      </div>

      {/* Debug Panel */}
      <DebugPanel
        plantsCount={plants.length}
        structuresCount={structures.length}
        housesCount={sceneManager.getHouses().length}
        historySize={historySize}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      {/* Hidden file input for loading designs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".landscape.json,.json"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
