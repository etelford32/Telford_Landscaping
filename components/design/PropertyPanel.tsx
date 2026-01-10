"use client";

import { PlacedPlant, getPlantSpecies } from "@/lib/plantData";
import { PlacedStructure, getStructure } from "@/lib/structureData";
import { Sliders, X } from "lucide-react";

interface PropertyPanelProps {
  selectedPlant?: PlacedPlant | null;
  selectedStructure?: PlacedStructure | null;
  onPlantUpdate?: (plant: PlacedPlant) => void;
  onStructureUpdate?: (structure: PlacedStructure) => void;
  onClose?: () => void;
}

export default function PropertyPanel({
  selectedPlant,
  selectedStructure,
  onPlantUpdate,
  onStructureUpdate,
  onClose,
}: PropertyPanelProps) {
  if (!selectedPlant && !selectedStructure) return null;

  if (selectedPlant) {
    const species = getPlantSpecies(selectedPlant.speciesId);
    if (!species) return null;

    return (
      <div className="absolute right-4 top-1/4 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden z-30">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5" />
            <h3 className="font-bold">Plant Properties</h3>
          </div>
          {onClose && (
            <button onClick={onClose} className="hover:bg-white/20 rounded p-1 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
          {/* Plant Info */}
          <div className="bg-primary-50 rounded-lg p-3">
            <h4 className="font-bold text-sm text-primary-900 mb-1">{species.commonName}</h4>
            <p className="text-xs text-primary-700 italic">{species.scientificName}</p>
          </div>

          {/* Age Control */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Plant Age: {selectedPlant.age} years
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={selectedPlant.age}
              onChange={(e) => onPlantUpdate?.({ ...selectedPlant, age: parseInt(e.target.value) })}
              className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 yr</span>
              <span>30 yrs</span>
            </div>
          </div>

          {/* Scale Control */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Scale: {(selectedPlant.scale * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={selectedPlant.scale}
              onChange={(e) => onPlantUpdate?.({ ...selectedPlant, scale: parseFloat(e.target.value) })}
              className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50%</span>
              <span>200%</span>
            </div>
          </div>

          {/* Rotation Control */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rotation: {Math.round((selectedPlant.rotation * 180) / Math.PI)}°
            </label>
            <input
              type="range"
              min="0"
              max={Math.PI * 2}
              step="0.1"
              value={selectedPlant.rotation}
              onChange={(e) => onPlantUpdate?.({ ...selectedPlant, rotation: parseFloat(e.target.value) })}
              className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0°</span>
              <span>360°</span>
            </div>
          </div>

          {/* Position */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h5 className="font-semibold text-sm text-gray-900 mb-2">Position</h5>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">X</label>
                <input
                  type="number"
                  value={selectedPlant.position.x.toFixed(1)}
                  onChange={(e) =>
                    onPlantUpdate?.({
                      ...selectedPlant,
                      position: { ...selectedPlant.position, x: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Z</label>
                <input
                  type="number"
                  value={selectedPlant.position.z.toFixed(1)}
                  onChange={(e) =>
                    onPlantUpdate?.({
                      ...selectedPlant,
                      position: { ...selectedPlant.position, z: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Plant Care Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h5 className="font-semibold text-sm text-gray-900 mb-2">Care Requirements</h5>
            <div className="space-y-1 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Water:</span>
                <span className="font-medium">{species.care.waterNeeds}</span>
              </div>
              <div className="flex justify-between">
                <span>Sun:</span>
                <span className="font-medium">{species.care.sunExposure}</span>
              </div>
              <div className="flex justify-between">
                <span>Growth Rate:</span>
                <span className="font-medium">{species.growthData.growthRate}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Height:</span>
                <span className="font-medium">{species.growthData.maxHeight} ft</span>
              </div>
              <div className="flex justify-between">
                <span>Max Width:</span>
                <span className="font-medium">{species.growthData.maxWidth} ft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedStructure) {
    const structure = getStructure(selectedStructure.structureId);
    if (!structure) return null;

    return (
      <div className="absolute right-4 top-1/4 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden z-30">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5" />
            <h3 className="font-bold">Structure Properties</h3>
          </div>
          {onClose && (
            <button onClick={onClose} className="hover:bg-white/20 rounded p-1 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
          {/* Structure Info */}
          <div className="bg-amber-50 rounded-lg p-3">
            <h4 className="font-bold text-sm text-amber-900 mb-1">{structure.commonName}</h4>
            <p className="text-xs text-amber-700">{structure.description}</p>
          </div>

          {/* Scale Control */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Scale: {(selectedStructure.scale * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={selectedStructure.scale}
              onChange={(e) =>
                onStructureUpdate?.({ ...selectedStructure, scale: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50%</span>
              <span>200%</span>
            </div>
          </div>

          {/* Rotation Control */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rotation: {Math.round((selectedStructure.rotation * 180) / Math.PI)}°
            </label>
            <input
              type="range"
              min="0"
              max={Math.PI * 2}
              step="0.1"
              value={selectedStructure.rotation}
              onChange={(e) =>
                onStructureUpdate?.({ ...selectedStructure, rotation: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0°</span>
              <span>360°</span>
            </div>
          </div>

          {/* Position */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h5 className="font-semibold text-sm text-gray-900 mb-2">Position</h5>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">X</label>
                <input
                  type="number"
                  value={selectedStructure.position.x.toFixed(1)}
                  onChange={(e) =>
                    onStructureUpdate?.({
                      ...selectedStructure,
                      position: { ...selectedStructure.position, x: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Z</label>
                <input
                  type="number"
                  value={selectedStructure.position.z.toFixed(1)}
                  onChange={(e) =>
                    onStructureUpdate?.({
                      ...selectedStructure,
                      position: { ...selectedStructure.position, z: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h5 className="font-semibold text-sm text-gray-900 mb-2">Dimensions</h5>
            <div className="space-y-1 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Width:</span>
                <span className="font-medium">{structure.dimensions.baseWidth} ft</span>
              </div>
              <div className="flex justify-between">
                <span>Depth:</span>
                <span className="font-medium">{structure.dimensions.baseDepth} ft</span>
              </div>
              <div className="flex justify-between">
                <span>Height:</span>
                <span className="font-medium">{structure.dimensions.baseHeight} ft</span>
              </div>
              <div className="flex justify-between">
                <span>Materials:</span>
                <span className="font-medium text-right">{structure.materials.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
