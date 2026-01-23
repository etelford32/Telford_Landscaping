/**
 * HardscapeToolbox - Specialized toolbox for adding hardscape around houses
 * Focus on walls, slabs, fences, patios, and paths
 */

"use client";

import { useState } from 'react';
import {
  Home,
  Box,
  Square,
  Fence,
  Grid2X2,
  Footprints,
  Building2,
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { STRUCTURE_LIBRARY, OutdoorStructure, getStructuresByCategory } from '@/lib/structureData';

interface HardscapeToolboxProps {
  onStructureSelect: (structure: OutdoorStructure) => void;
  selectedStructureId?: string;
  visible?: boolean;
  onClose?: () => void;
}

export default function HardscapeToolbox({
  onStructureSelect,
  selectedStructureId,
  visible = true,
  onClose,
}: HardscapeToolboxProps) {
  const [expandedCategories, setExpandedCategories] = useState({
    patios: true,
    walls: false,
    fences: false,
    paths: false,
  });

  if (!visible) return null;

  const toggleCategory = (category: keyof typeof expandedCategories) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category],
    });
  };

  // Organize structures by use case
  const patios = [
    'flagstone-patio',
    'concrete-patio',
    'brick-patio',
    'wood-deck',
    'composite-deck',
    'gravel-courtyard',
  ];

  const walls = [
    'stone-retaining-wall',
    'gabion-wall',
    'concrete-block-wall',
    'stucco-wall',
    'dry-stack-stone-wall',
    'brick-garden-wall',
    'boulder-wall',
    'wood-retaining-wall',
  ];

  const fences = [
    'wood-fence',
    'horizontal-fence',
    'picket-fence',
  ];

  const paths = [
    'concrete-paver-path',
    'stone-paver-path',
    'brick-path',
    'decomposed-granite-path',
    'stepping-stone-path',
  ];

  const getStructure = (id: string) => STRUCTURE_LIBRARY.find(s => s.id === id);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 w-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-orange-600" />
          <h3 className="font-bold text-gray-800">Hardscape</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Add patios, walls, fences, and paths around your house
      </div>

      {/* Scrollable content */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {/* Patios & Decks */}
        <CategorySection
          title="Patios & Decks"
          icon={<Square className="w-4 h-4" />}
          count={patios.length}
          expanded={expandedCategories.patios}
          onToggle={() => toggleCategory('patios')}
        >
          {patios.map((id) => {
            const structure = getStructure(id);
            if (!structure) return null;
            return (
              <StructureCard
                key={id}
                structure={structure}
                selected={selectedStructureId === id}
                onSelect={() => onStructureSelect(structure)}
              />
            );
          })}
        </CategorySection>

        {/* Walls */}
        <CategorySection
          title="Walls & Retaining"
          icon={<Box className="w-4 h-4" />}
          count={walls.length}
          expanded={expandedCategories.walls}
          onToggle={() => toggleCategory('walls')}
        >
          {walls.map((id) => {
            const structure = getStructure(id);
            if (!structure) return null;
            return (
              <StructureCard
                key={id}
                structure={structure}
                selected={selectedStructureId === id}
                onSelect={() => onStructureSelect(structure)}
              />
            );
          })}
        </CategorySection>

        {/* Fences */}
        <CategorySection
          title="Fences"
          icon={<Fence className="w-4 h-4" />}
          count={fences.length}
          expanded={expandedCategories.fences}
          onToggle={() => toggleCategory('fences')}
        >
          {fences.map((id) => {
            const structure = getStructure(id);
            if (!structure) return null;
            return (
              <StructureCard
                key={id}
                structure={structure}
                selected={selectedStructureId === id}
                onSelect={() => onStructureSelect(structure)}
              />
            );
          })}
        </CategorySection>

        {/* Paths */}
        <CategorySection
          title="Paths & Walkways"
          icon={<Footprints className="w-4 h-4" />}
          count={paths.length}
          expanded={expandedCategories.paths}
          onToggle={() => toggleCategory('paths')}
        >
          {paths.map((id) => {
            const structure = getStructure(id);
            if (!structure) return null;
            return (
              <StructureCard
                key={id}
                structure={structure}
                selected={selectedStructureId === id}
                onSelect={() => onStructureSelect(structure)}
              />
            );
          })}
        </CategorySection>
      </div>

      {/* Quick Tip */}
      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="text-xs text-orange-800">
          <strong>💡 Tip:</strong> Click to select, then click on canvas to place. Use Properties panel to adjust size.
        </div>
      </div>
    </div>
  );
}

// Category Section Component
function CategorySection({
  title,
  icon,
  count,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="text-gray-600">{icon}</div>
          <span className="font-semibold text-gray-800">{title}</span>
          <span className="text-xs text-gray-500">({count})</span>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {expanded && (
        <div className="p-2 space-y-2 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

// Structure Card Component
function StructureCard({
  structure,
  selected,
  onSelect,
}: {
  structure: OutdoorStructure;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
        selected
          ? 'border-orange-500 bg-orange-50 shadow-md'
          : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Color indicator */}
        <div
          className="w-6 h-6 rounded-md border-2 border-white shadow-sm flex-shrink-0 mt-0.5"
          style={{ backgroundColor: structure.color }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 mb-1">
            {structure.commonName}
          </div>
          <div className="text-xs text-gray-600 mb-2 line-clamp-2">
            {structure.description}
          </div>
          <div className="flex gap-2 text-xs text-gray-500">
            <span>{structure.dimensions.baseWidth}' × {structure.dimensions.baseDepth}'</span>
            {structure.dimensions.customizable && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                Adjustable
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
