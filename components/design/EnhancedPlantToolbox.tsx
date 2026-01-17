/**
 * EnhancedPlantToolbox - Draggable, resizable, minimal plant selection panel
 * Maximum utility in minimal space
 */

"use client";

import { useState } from "react";
import { TreePine, Search } from "lucide-react";
import { PLANT_LIBRARY, PlantSpecies } from "@/lib/plantData";
import DraggablePanel from './DraggablePanel';

interface EnhancedPlantToolboxProps {
  onPlantSelect: (species: PlantSpecies) => void;
  selectedPlantId?: string;
  visible?: boolean;
  onClose?: () => void;
}

export default function EnhancedPlantToolbox({
  onPlantSelect,
  selectedPlantId,
  visible = true,
  onClose,
}: EnhancedPlantToolboxProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [nativeOnly, setNativeOnly] = useState(false);

  const filteredPlants = PLANT_LIBRARY.filter(plant => {
    const matchesSearch = plant.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || plant.category === categoryFilter;
    const matchesNative = !nativeOnly || plant.nativeToCA;
    return matchesSearch && matchesCategory && matchesNative;
  });

  if (!visible) return null;

  return (
    <DraggablePanel
      title="Plant Library"
      icon={<TreePine className="w-4 h-4" />}
      defaultPosition={{ x: 20, y: 80 }}
      defaultSize={{ width: 320, height: 600 }}
      minSize={{ width: 280, height: 400 }}
      maxSize={{ width: 450, height: 900 }}
      resizable={true}
      minimizable={true}
      maximizable={true}
      closable={true}
      onClose={onClose}
      headerColor="from-primary-600 to-primary-700"
      zIndex={30}
      id="plant-toolbox-panel"
    >
      <div className="flex flex-col h-full">
        {/* Search and Filters */}
        <div className="p-3 border-b border-gray-200 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          {/* Category filter */}
          <div className="flex gap-1 flex-wrap">
            {["all", "tree", "shrub", "perennial", "ground-cover"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
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
          <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={nativeOnly}
              onChange={(e) => setNativeOnly(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <span>CA Natives Only</span>
          </label>

          {/* Results count */}
          <div className="text-xs text-gray-500">
            {filteredPlants.length} {filteredPlants.length === 1 ? 'plant' : 'plants'}
          </div>
        </div>

        {/* Plant List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredPlants.map((plant) => (
            <div
              key={plant.id}
              className={`group relative bg-gradient-to-br from-gray-50 to-white border rounded-lg p-2.5 cursor-move hover:shadow-md transition-all ${
                selectedPlantId === plant.id
                  ? 'border-primary-600 shadow-md'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('plantId', plant.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => onPlantSelect(plant)}
            >
              {/* Plant Header */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">
                    {plant.commonName}
                  </h4>
                  <p className="text-xs italic text-gray-600 truncate">
                    {plant.scientificName}
                  </p>
                </div>
                {plant.nativeToCA && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
                    CA
                  </span>
                )}
              </div>

              {/* Plant Info */}
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="px-1.5 py-0.5 bg-gray-100 rounded capitalize">
                  {plant.category}
                </span>
                <span>
                  H: {plant.growthData.height[15].toFixed(1)}'
                </span>
                <span>
                  W: {plant.growthData.width[15].toFixed(1)}'
                </span>
              </div>

              {/* Color indicator */}
              <div className="mt-1.5 flex items-center gap-1">
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: plant.color }}
                />
                <span className="text-xs text-gray-500">Foliage</span>
              </div>
            </div>
          ))}

          {filteredPlants.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No plants found
            </div>
          )}
        </div>
      </div>
    </DraggablePanel>
  );
}
