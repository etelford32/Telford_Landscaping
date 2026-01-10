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
import { Trash2, RotateCw, Copy, Clock, Home, Move, MousePointer2, Maximize2 } from "lucide-react";

// Import OOP Systems
import { CameraController } from "@/lib/editor/CameraController";
import { SelectionManager } from "@/lib/editor/SelectionManager";
import { DragController } from "@/lib/editor/DragController";
import { SceneManager } from "@/lib/editor/SceneManager";
import { snapToGrid } from "./DesignGrid";

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

  // State
  const [plants, setPlants] = useState<PlacedPlant[]>([]);
  const [structures, setStructures] = useState<PlacedStructure[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [age, setAge] = useState<number>(5);
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'move'>('select');

  const canvasRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef(new Vector2());
  const cameraRef = useRef<any>(null);

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

      {/* Mode Toggle - Top Left */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-3 z-20 flex gap-2">
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

      {/* Selected Plant Controls */}
      {selectedPlant && !selectedStructure && (
        <div className="absolute bottom-24 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 w-64 z-20">
          <h3 className="font-bold text-gray-900 mb-3">Selected Plant</h3>
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

      {/* Selected Structure Controls */}
      {selectedStructure && !selectedPlant && (
        <div className="absolute bottom-24 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 w-64 z-20">
          <h3 className="font-bold text-gray-900 mb-3">Selected Structure</h3>
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
          Click to select • Orbit/pan/zoom with mouse
        </p>
      </div>
    </div>
  );
}
