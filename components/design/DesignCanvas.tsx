"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Sky } from "@react-three/drei";
import { Suspense, useState, useRef, useEffect } from "react";
import { PlacedPlant, PlantSpecies } from "@/lib/plantData";
import { snapToGrid } from "./DesignGrid";
import DesignGrid from "./DesignGrid";
import { PlantModel } from "./PlantModels";
import { Vector3, Raycaster, Vector2 } from "three";
import PlantToolbox from "./PlantToolbox";
import { Trash2, RotateCw, Copy, Clock } from "lucide-react";

function Scene({ plants, onPlantClick, age }: { plants: PlacedPlant[], onPlantClick: (id: string) => void, age: number }) {
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
      />
      <ambientLight intensity={0.6} />
      <hemisphereLight args={["#87CEEB", "#4a7c2f", 0.5]} />

      {/* Grid */}
      <DesignGrid size={30} divisions={30} visible={true} />

      {/* Plants with age applied */}
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

export default function DesignCanvas() {
  const [plants, setPlants] = useState<PlacedPlant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [age, setAge] = useState<number>(5); // Default 5 years
  const canvasRef = useRef<HTMLDivElement>(null);
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());

  // Handle drop from toolbox
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const plantId = e.dataTransfer.getData('plantId');
    if (!plantId) return;

    // Get drop position relative to canvas
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate approximate grid position (simplified - would use raycasting in production)
    const x = ((e.clientX - rect.left) / rect.width) * 30 - 15;
    const z = ((e.clientY - rect.top) / rect.height) * 30 - 15;

    // Snap to grid
    const snappedX = snapToGrid(x, 1);
    const snappedZ = snapToGrid(z, 1);

    // Create new plant
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
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handlePlantClick = (plantId: string) => {
    setSelectedPlantId(plantId);
    setPlants(plants.map(p => ({
      ...p,
      selected: p.id === plantId
    })));
  };

  const selectedPlant = plants.find(p => p.id === selectedPlantId);

  const deletePlant = () => {
    if (!selectedPlantId) return;
    setPlants(plants.filter(p => p.id !== selectedPlantId));
    setSelectedPlantId(null);
  };

  const duplicatePlant = () => {
    if (!selectedPlantId) return;
    const plant = plants.find(p => p.id === selectedPlantId);
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
    setPlants(plants.map(p =>
      p.id === selectedPlantId
        ? { ...p, rotation: (p.rotation + Math.PI / 4) % (Math.PI * 2) }
        : p
    ));
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-sky-200 to-sky-100">
      {/* Plant Toolbox */}
      <PlantToolbox
        onPlantSelect={(species) => {
          // Handle plant selection if needed
        }}
        selectedPlantId={selectedPlantId || undefined}
      />

      {/* 3D Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
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
            <Scene plants={plants} onPlantClick={handlePlantClick} age={age} />
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
            className="flex-1 h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-xs text-gray-600 w-12">30 yrs</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Slide to see how your landscape will look over time
        </p>
      </div>

      {/* Selected Plant Controls - Bottom Right */}
      {selectedPlant && (
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 w-64 z-20">
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

      {/* Instructions Overlay - Top Right */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 max-w-xs z-20">
        <h3 className="font-bold text-gray-900 mb-2 text-sm">Quick Guide</h3>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>• Drag plants from toolbox to canvas</li>
          <li>• Click plants to select them</li>
          <li>• Use timeline slider to see growth</li>
          <li>• Rotate, copy, or delete selected plants</li>
          <li>• Drag to orbit, scroll to zoom</li>
        </ul>
      </div>
    </div>
  );
}
