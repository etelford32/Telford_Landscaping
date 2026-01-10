"use client";

import { useState } from "react";
import { PLANT_LIBRARY, PlantSpecies } from "@/lib/plantData";
import { TreePine, Search, Info } from "lucide-react";

interface PlantToolboxProps {
  onPlantSelect: (species: PlantSpecies) => void;
  selectedPlantId?: string;
}

export default function PlantToolbox({ onPlantSelect, selectedPlantId }: PlantToolboxProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInfo, setSelectedInfo] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [nativeOnly, setNativeOnly] = useState(false);

  const filteredPlants = PLANT_LIBRARY.filter(plant => {
    const matchesSearch = plant.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || plant.category === categoryFilter;
    const matchesNative = !nativeOnly || plant.nativeToCA;
    return matchesSearch && matchesCategory && matchesNative;
  });

  return (
    <div className="absolute left-4 top-4 bottom-4 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden flex flex-col z-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <TreePine className="w-6 h-6" />
          <h2 className="text-xl font-bold">Plant Library</h2>
        </div>
        <p className="text-sm text-primary-100">
          Drag plants onto the design canvas
        </p>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search plants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {["all", "tree", "shrub", "perennial", "ground-cover"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                categoryFilter === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === "all" ? "All" : cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Native filter */}
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={nativeOnly}
            onChange={(e) => setNativeOnly(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
          />
          <span>California Natives Only</span>
        </label>

        {/* Results count */}
        <div className="text-xs text-gray-500">
          {filteredPlants.length} {filteredPlants.length === 1 ? 'plant' : 'plants'} found
        </div>
      </div>

      {/* Plant List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredPlants.map((plant) => (
          <div
            key={plant.id}
            className={`group relative bg-gradient-to-br from-gray-50 to-white border-2 rounded-xl p-4 cursor-move hover:shadow-lg transition-all ${
              selectedPlantId === plant.id
                ? 'border-primary-600 shadow-lg'
                : 'border-gray-200 hover:border-primary-300'
            }`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('plantId', plant.id);
              e.dataTransfer.effectAllowed = 'copy';
            }}
            onClick={() => onPlantSelect(plant)}
          >
            {/* Color indicator */}
            <div
              className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: plant.color }}
            />

            {/* Plant info */}
            <div className="pr-6">
              <h3 className="font-bold text-gray-900 mb-1">{plant.commonName}</h3>
              <p className="text-xs text-gray-600 italic mb-2">{plant.scientificName}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {plant.droughtTolerant && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Drought Tolerant
                  </span>
                )}
                {plant.nativeToCA && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                    CA Native
                  </span>
                )}
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {plant.category}
                </span>
              </div>
              <p className="text-xs text-gray-700 line-clamp-2">{plant.description}</p>
            </div>

            {/* Info button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedInfo(selectedInfo === plant.id ? null : plant.id);
              }}
              className="absolute bottom-2 right-2 p-1 bg-primary-100 hover:bg-primary-200 rounded-full transition-colors"
            >
              <Info className="w-4 h-4 text-primary-700" />
            </button>

            {/* Expanded info */}
            {selectedInfo === plant.id && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-xs space-y-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold">Max Height:</span> {plant.growthData.maxHeight} ft
                  </div>
                  <div>
                    <span className="font-semibold">Max Width:</span> {plant.growthData.maxWidth} ft
                  </div>
                  <div>
                    <span className="font-semibold">Growth Rate:</span> {plant.growthData.growthRate}
                  </div>
                  <div>
                    <span className="font-semibold">Water:</span> {plant.care.waterNeeds}
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">Sun:</span> {plant.care.sunExposure}
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">Hardiness:</span> {plant.care.hardiness}
                  </div>
                </div>
              </div>
            )}

            {/* Drag hint */}
            <div className="mt-2 text-xs text-gray-500 text-center opacity-0 group-hover:opacity-100 transition-opacity">
              ✋ Drag to place on canvas
            </div>
          </div>
        ))}
      </div>

      {/* Footer tips */}
      <div className="p-3 bg-primary-50 border-t border-primary-100 text-xs text-primary-800">
        <p className="flex items-center gap-1">
          <span className="font-semibold">💡 Tip:</span>
          Drag plants onto the grid to start designing!
        </p>
      </div>
    </div>
  );
}
