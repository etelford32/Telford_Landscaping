/**
 * StatusBar - Real-time editor status and feedback
 * Shows cursor position, selection count, current tool, grid status
 */

"use client";

import { MousePointer2, Grid3x3Icon, Maximize2, RotateCw, Move } from 'lucide-react';

interface StatusBarProps {
  cursorPosition?: { x: number; y: number; z: number };
  selectedCount: number;
  editMode: 'select' | 'move' | 'rotate' | 'scale';
  snapToGrid: boolean;
  gridSize: number;
  unit: string;
  hasUnsavedChanges?: boolean;
}

export default function StatusBar({
  cursorPosition,
  selectedCount,
  editMode,
  snapToGrid,
  gridSize,
  unit = 'ft',
  hasUnsavedChanges = false
}: StatusBarProps) {
  const getModeIcon = () => {
    switch (editMode) {
      case 'move': return <Move className="w-3 h-3" />;
      case 'rotate': return <RotateCw className="w-3 h-3" />;
      case 'scale': return <Maximize2 className="w-3 h-3" />;
      default: return <MousePointer2 className="w-3 h-3" />;
    }
  };

  const getModeName = () => {
    switch (editMode) {
      case 'move': return 'Move';
      case 'rotate': return 'Rotate';
      case 'scale': return 'Scale';
      default: return 'Select';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-7 bg-gray-800 text-gray-100 text-xs flex items-center justify-between px-4 z-50 font-mono border-t border-gray-700">
      {/* Left: Cursor Position */}
      <div className="flex items-center gap-4">
        {cursorPosition && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">XYZ:</span>
            <span>
              {cursorPosition.x.toFixed(2)}, {cursorPosition.y.toFixed(2)}, {cursorPosition.z.toFixed(2)} {unit}
            </span>
          </div>
        )}

        {/* Selection Count */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Selected:</span>
          <span className={selectedCount > 0 ? 'text-blue-400 font-semibold' : ''}>
            {selectedCount}
          </span>
        </div>
      </div>

      {/* Center: Current Tool/Mode */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded">
          {getModeIcon()}
          <span className="font-semibold">{getModeName()}</span>
        </div>

        {/* Grid Status */}
        <div className="flex items-center gap-2">
          <Grid3x3Icon className={`w-3 h-3 ${snapToGrid ? 'text-green-400' : 'text-gray-500'}`} />
          <span className={snapToGrid ? 'text-green-400' : 'text-gray-500'}>
            {snapToGrid ? 'Snap' : 'Free'}: {gridSize}{unit}
          </span>
        </div>
      </div>

      {/* Right: Save Status */}
      <div className="flex items-center gap-4">
        {hasUnsavedChanges && (
          <div className="flex items-center gap-2 text-yellow-400">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span>Unsaved changes</span>
          </div>
        )}

        <div className="text-gray-400">
          Press <span className="text-white bg-gray-700 px-1.5 py-0.5 rounded mx-1">F1</span> for help
        </div>
      </div>
    </div>
  );
}
