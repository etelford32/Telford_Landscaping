"use client";

import { useState } from "react";
import { STRUCTURE_LIBRARY, OutdoorStructure } from "@/lib/structureData";
import { Home, Search, Info } from "lucide-react";

interface StructureToolboxProps {
  onStructureSelect: (structure: OutdoorStructure) => void;
  selectedStructureId?: string;
}

export default function StructureToolbox({ onStructureSelect, selectedStructureId }: StructureToolboxProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInfo, setSelectedInfo] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredStructures = STRUCTURE_LIBRARY.filter(structure => {
    const matchesSearch = structure.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      structure.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || structure.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="absolute right-4 top-4 bottom-4 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden flex flex-col z-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4">
        <div className="flex items-center gap-2 mb-2">
          <Home className="w-6 h-6" />
          <h2 className="text-xl font-bold">Structure Library</h2>
        </div>
        <p className="text-sm text-amber-100">
          Add hardscape and features to your design
        </p>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search structures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:border-transparent"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {["all", "hardscape", "path", "vertical", "overhead", "water-feature", "outdoor-living"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                categoryFilter === cat
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat === "all" ? "All" : cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="text-xs text-gray-500">
          {filteredStructures.length} {filteredStructures.length === 1 ? 'structure' : 'structures'} found
        </div>
      </div>

      {/* Structure List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredStructures.map((structure) => (
          <div
            key={structure.id}
            className={`group relative bg-gradient-to-br from-gray-50 to-white border-2 rounded-xl p-4 cursor-move hover:shadow-lg transition-all ${
              selectedStructureId === structure.id
                ? 'border-amber-600 shadow-lg'
                : 'border-gray-200 hover:border-amber-300'
            }`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('structureId', structure.id);
              e.dataTransfer.effectAllowed = 'copy';
            }}
            onClick={() => onStructureSelect(structure)}
          >
            {/* Color indicator */}
            <div
              className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: structure.color }}
            />

            {/* Structure info */}
            <div className="pr-6">
              <h3 className="font-bold text-gray-900 mb-1">{structure.commonName}</h3>
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">
                  {structure.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </span>
                {structure.dimensions.customizable && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Customizable
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-700 line-clamp-2">{structure.description}</p>
            </div>

            {/* Info button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedInfo(selectedInfo === structure.id ? null : structure.id);
              }}
              className="absolute bottom-2 right-2 p-1 bg-amber-100 hover:bg-amber-200 rounded-full transition-colors"
            >
              <Info className="w-4 h-4 text-amber-700" />
            </button>

            {/* Expanded info */}
            {selectedInfo === structure.id && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold">Width:</span> {structure.dimensions.baseWidth} ft
                  </div>
                  <div>
                    <span className="font-semibold">Depth:</span> {structure.dimensions.baseDepth} ft
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold">Height:</span> {structure.dimensions.baseHeight} ft
                  </div>
                </div>
                <div>
                  <span className="font-semibold">Materials:</span> {structure.materials.join(', ')}
                </div>
                <div>
                  <span className="font-semibold">Styles:</span> {structure.styles.map(s =>
                    s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                  ).join(', ')}
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
      <div className="p-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-800">
        <p className="flex items-center gap-1">
          <span className="font-semibold">💡 Tip:</span>
          Add structures to create your perfect outdoor space!
        </p>
      </div>
    </div>
  );
}
