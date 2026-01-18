/**
 * AlignmentTools - Professional object alignment and distribution
 * Provides tools for aligning and distributing multiple selected objects
 */

"use client";

import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignHorizontalDistributeStart,
  AlignVerticalDistributeStart,
  Grid3x3
} from 'lucide-react';

interface AlignmentToolsProps {
  selectedCount: number;
  onAlign: (type: AlignmentType) => void;
  onDistribute: (type: DistributionType) => void;
  disabled?: boolean;
}

export type AlignmentType =
  | 'left'
  | 'center-h'
  | 'right'
  | 'top'
  | 'center-v'
  | 'bottom'
  | 'grid';

export type DistributionType =
  | 'horizontal'
  | 'vertical';

export default function AlignmentTools({
  selectedCount,
  onAlign,
  onDistribute,
  disabled = false
}: AlignmentToolsProps) {
  const isDisabled = disabled || selectedCount < 2;
  const needsThreeForDistribute = selectedCount < 3;

  const buttonClass = (active: boolean = false) =>
    `p-2 rounded transition-colors ${
      isDisabled
        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
        : active
        ? 'bg-primary-600 text-white hover:bg-primary-700'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <div className="flex items-center gap-2 p-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200">
      {/* Horizontal Alignment */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
        <button
          onClick={() => onAlign('left')}
          disabled={isDisabled}
          className={buttonClass()}
          title="Align Left (selected objects)"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAlign('center-h')}
          disabled={isDisabled}
          className={buttonClass()}
          title="Align Center Horizontally"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAlign('right')}
          disabled={isDisabled}
          className={buttonClass()}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      {/* Vertical Alignment */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
        <button
          onClick={() => onAlign('top')}
          disabled={isDisabled}
          className={buttonClass()}
          title="Align Top"
        >
          <AlignVerticalJustifyStart className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAlign('center-v')}
          disabled={isDisabled}
          className={buttonClass()}
          title="Align Center Vertically"
        >
          <AlignVerticalJustifyCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => onAlign('bottom')}
          disabled={isDisabled}
          className={buttonClass()}
          title="Align Bottom"
        >
          <AlignVerticalJustifyEnd className="w-4 h-4" />
        </button>
      </div>

      {/* Distribution */}
      <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
        <button
          onClick={() => onDistribute('horizontal')}
          disabled={isDisabled || needsThreeForDistribute}
          className={buttonClass()}
          title="Distribute Horizontally (3+ objects)"
        >
          <AlignHorizontalDistributeStart className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDistribute('vertical')}
          disabled={isDisabled || needsThreeForDistribute}
          className={buttonClass()}
          title="Distribute Vertically (3+ objects)"
        >
          <AlignVerticalDistributeStart className="w-4 h-4" />
        </button>
      </div>

      {/* Align to Grid */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onAlign('grid')}
          disabled={isDisabled}
          className={buttonClass()}
          title="Snap to Grid"
        >
          <Grid3x3 className="w-4 h-4" />
        </button>
      </div>

      {/* Status Text */}
      {selectedCount < 2 && (
        <span className="text-xs text-gray-500 ml-2">
          Select 2+ objects
        </span>
      )}
    </div>
  );
}

// Utility functions for alignment calculations
export function calculateAlignedPosition(
  objects: Array<{ position: { x: number; y?: number; z: number }; bounds?: { width: number; depth: number } }>,
  type: AlignmentType
): Array<{ x: number; z: number }> {
  if (objects.length < 2) return objects.map(o => ({ x: o.position.x, z: o.position.z }));

  // Calculate bounds
  const minX = Math.min(...objects.map(o => o.position.x - (o.bounds?.width || 0) / 2));
  const maxX = Math.max(...objects.map(o => o.position.x + (o.bounds?.width || 0) / 2));
  const minZ = Math.min(...objects.map(o => o.position.z - (o.bounds?.depth || 0) / 2));
  const maxZ = Math.max(...objects.map(o => o.position.z + (o.bounds?.depth || 0) / 2));
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  return objects.map(obj => {
    const width = obj.bounds?.width || 0;
    const depth = obj.bounds?.depth || 0;

    switch (type) {
      case 'left':
        return { x: minX + width / 2, z: obj.position.z };
      case 'center-h':
        return { x: centerX, z: obj.position.z };
      case 'right':
        return { x: maxX - width / 2, z: obj.position.z };
      case 'top':
        return { x: obj.position.x, z: minZ + depth / 2 };
      case 'center-v':
        return { x: obj.position.x, z: centerZ };
      case 'bottom':
        return { x: obj.position.x, z: maxZ - depth / 2 };
      case 'grid':
        // Snap to nearest grid position (assuming 1ft grid)
        return { x: Math.round(obj.position.x), z: Math.round(obj.position.z) };
      default:
        return { x: obj.position.x, z: obj.position.z };
    }
  });
}

export function calculateDistributedPositions(
  objects: Array<{ position: { x: number; z: number }; bounds?: { width: number; depth: number } }>,
  type: DistributionType
): Array<{ x: number; z: number }> {
  if (objects.length < 3) return objects.map(o => ({ x: o.position.x, z: o.position.z }));

  // Sort objects by position
  const sorted = [...objects].sort((a, b) =>
    type === 'horizontal'
      ? a.position.x - b.position.x
      : a.position.z - b.position.z
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  if (type === 'horizontal') {
    const totalSpace = last.position.x - first.position.x;
    const spacing = totalSpace / (sorted.length - 1);

    return sorted.map((obj, index) => ({
      x: first.position.x + spacing * index,
      z: obj.position.z
    }));
  } else {
    const totalSpace = last.position.z - first.position.z;
    const spacing = totalSpace / (sorted.length - 1);

    return sorted.map((obj, index) => ({
      x: obj.position.x,
      z: first.position.z + spacing * index
    }));
  }
}
