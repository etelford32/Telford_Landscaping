/**
 * ObjectsTab - Scene hierarchy tree view
 * Shows all plants, structures, and houses in the scene
 */

"use client";

import { useState } from 'react';
import {
  Leaf,
  Building2,
  Home,
  ChevronDown,
  ChevronRight,
  Trash2,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ObjectsTabProps {
  plants: any[];
  structures: any[];
  houses: any[];
  selectedPlantId: string | null;
  selectedStructureId: string | null;
  selectedHouseId: string | null;
  onSelectPlant: (id: string | null) => void;
  onSelectStructure: (id: string | null) => void;
  onSelectHouse: (id: string | null) => void;
  onDeletePlant?: (id: string) => void;
  onDeleteStructure?: (id: string) => void;
  onDeleteHouse?: (id: string) => void;
  onDuplicatePlant?: (id: string) => void;
  onDuplicateStructure?: (id: string) => void;
}

export default function ObjectsTab({
  plants,
  structures,
  houses,
  selectedPlantId,
  selectedStructureId,
  selectedHouseId,
  onSelectPlant,
  onSelectStructure,
  onSelectHouse,
  onDeletePlant,
  onDeleteStructure,
  onDeleteHouse,
  onDuplicatePlant,
  onDuplicateStructure,
}: ObjectsTabProps) {
  const [expandedSections, setExpandedSections] = useState({
    plants: true,
    structures: true,
    houses: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const totalObjects = plants.length + structures.length + houses.length;

  return (
    <div className="p-4">
      {/* Summary */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">Total Objects</div>
        <div className="text-2xl font-bold text-gray-800">{totalObjects}</div>
        <div className="text-xs text-gray-500 mt-1">
          {plants.length} plants, {structures.length} structures, {houses.length} houses
        </div>
      </div>

      {/* Plants Section */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('plants')}
          className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-gray-800">Plants</span>
            <span className="text-xs text-gray-500">({plants.length})</span>
          </div>
          {expandedSections.plants ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.plants && (
          <div className="ml-6 mt-2 space-y-1">
            {plants.length === 0 ? (
              <div className="text-sm text-gray-400 italic p-2">No plants in scene</div>
            ) : (
              plants.map((plant) => (
                <ObjectItem
                  key={plant.id}
                  id={plant.id}
                  label={plant.species}
                  icon={<Leaf className="w-3 h-3" />}
                  isSelected={plant.id === selectedPlantId}
                  onSelect={() => onSelectPlant(plant.id)}
                  onDelete={onDeletePlant ? () => onDeletePlant(plant.id) : undefined}
                  onDuplicate={onDuplicatePlant ? () => onDuplicatePlant(plant.id) : undefined}
                  metadata={`${plant.position.x.toFixed(1)}, ${plant.position.z.toFixed(1)}`}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Structures Section */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('structures')}
          className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-gray-800">Structures</span>
            <span className="text-xs text-gray-500">({structures.length})</span>
          </div>
          {expandedSections.structures ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.structures && (
          <div className="ml-6 mt-2 space-y-1">
            {structures.length === 0 ? (
              <div className="text-sm text-gray-400 italic p-2">No structures in scene</div>
            ) : (
              structures.map((structure) => (
                <ObjectItem
                  key={structure.id}
                  id={structure.id}
                  label={structure.type}
                  icon={<Building2 className="w-3 h-3" />}
                  isSelected={structure.id === selectedStructureId}
                  onSelect={() => onSelectStructure(structure.id)}
                  onDelete={onDeleteStructure ? () => onDeleteStructure(structure.id) : undefined}
                  onDuplicate={onDuplicateStructure ? () => onDuplicateStructure(structure.id) : undefined}
                  metadata={`${structure.position.x.toFixed(1)}, ${structure.position.z.toFixed(1)}`}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Houses Section */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('houses')}
          className="w-full flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-gray-800">Houses</span>
            <span className="text-xs text-gray-500">({houses.length})</span>
          </div>
          {expandedSections.houses ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.houses && (
          <div className="ml-6 mt-2 space-y-1">
            {houses.length === 0 ? (
              <div className="text-sm text-gray-400 italic p-2">No houses in scene</div>
            ) : (
              houses.map((house) => (
                <ObjectItem
                  key={house.id}
                  id={house.id}
                  label={house.style}
                  icon={<Home className="w-3 h-3" />}
                  isSelected={house.id === selectedHouseId}
                  onSelect={() => onSelectHouse(house.id)}
                  onDelete={onDeleteHouse ? () => onDeleteHouse(house.id) : undefined}
                  metadata={`${house.position.x.toFixed(1)}, ${house.position.z.toFixed(1)}`}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Object Item Component
function ObjectItem({
  id,
  label,
  icon,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  metadata,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  metadata?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-primary-100 border border-primary-300'
          : 'hover:bg-gray-100 border border-transparent'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className={`${isSelected ? 'text-primary-600' : 'text-gray-600'}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium truncate ${
            isSelected ? 'text-primary-800' : 'text-gray-700'
          }`}>
            {label}
          </div>
          {metadata && (
            <div className="text-xs text-gray-400 truncate">
              {metadata}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {(isHovered || isSelected) && (
        <div className="flex items-center gap-1 ml-2">
          {onDuplicate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1 hover:bg-blue-100 rounded transition-colors"
              title="Duplicate"
            >
              <Copy className="w-3 h-3 text-blue-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-red-100 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3 h-3 text-red-600" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
