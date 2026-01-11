/**
 * Editing Toolbar
 * Provides controls for switching editing modes and tools
 */

"use client";

import { useState } from 'react';
import {
  MousePointer2,
  Move,
  Maximize2,
  RotateCw,
  Box,
  Ruler,
  Grid3x3,
  Eye,
  EyeOff,
  Layers,
  Settings,
} from 'lucide-react';
import { EditMode } from '@/lib/editor/EditModeController';

interface EditingToolbarProps {
  mode: EditMode;
  onModeChange: (mode: EditMode) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showMeasurements: boolean;
  onToggleMeasurements: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
}

export default function EditingToolbar({
  mode,
  onModeChange,
  showGrid,
  onToggleGrid,
  showMeasurements,
  onToggleMeasurements,
  snapToGrid,
  onToggleSnap,
  gridSize,
  onGridSizeChange,
}: EditingToolbarProps) {
  const [showSettings, setShowSettings] = useState(false);

  const modes: { id: EditMode; icon: typeof MousePointer2; label: string; description: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Select', description: 'Select and click objects' },
    { id: 'move', icon: Move, label: 'Move', description: 'Translate in 3D space' },
    { id: 'scale', icon: Maximize2, label: 'Scale', description: 'Resize objects' },
    { id: 'rotate', icon: RotateCw, label: 'Rotate', description: 'Rotate around axes' },
    { id: 'vertex', icon: Box, label: 'Vertex', description: 'Edit corners and edges' },
    { id: 'measure', icon: Ruler, label: 'Measure', description: 'Measure distances' },
  ];

  return (
    <>
      {/* Main Toolbar */}
      <div className="fixed left-1/2 transform -translate-x-1/2 bottom-4 z-30">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-3 border-2 border-gray-200">
          <div className="flex items-center gap-2">
            {/* Mode Buttons */}
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => onModeChange(m.id)}
                  title={`${m.label}: ${m.description}`}
                  className={`relative group p-3 rounded-lg transition-all ${
                    mode === m.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                      {m.label}
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="w-px h-8 bg-gray-300 mx-1" />

            {/* Grid Toggle */}
            <button
              onClick={onToggleGrid}
              title="Toggle Grid"
              className={`p-3 rounded-lg transition-all ${
                showGrid
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>

            {/* Measurements Toggle */}
            <button
              onClick={onToggleMeasurements}
              title="Toggle Measurements"
              className={`p-3 rounded-lg transition-all ${
                showMeasurements
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Ruler className="w-5 h-5" />
            </button>

            <div className="w-px h-8 bg-gray-300 mx-1" />

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Editing Settings"
              className={`p-3 rounded-lg transition-all ${
                showSettings
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Current Mode Display */}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-center">
              <div className="text-xs font-semibold text-gray-900">
                {modes.find((m) => m.id === mode)?.label} Mode
              </div>
              <div className="text-xs text-gray-600">
                {modes.find((m) => m.id === mode)?.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed left-1/2 transform -translate-x-1/2 bottom-32 z-30">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-4 border-2 border-gray-200 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Editing Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Snap to Grid */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-700">Snap to Grid</div>
                  <div className="text-xs text-gray-500">Align objects to grid automatically</div>
                </div>
                <button
                  onClick={onToggleSnap}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    snapToGrid ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      snapToGrid ? 'transform translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Grid Size */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Grid Size: {gridSize} ft
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.1"
                    max="5"
                    step="0.1"
                    value={gridSize}
                    onChange={(e) => onGridSizeChange(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={gridSize.toFixed(1)}
                    onChange={(e) => onGridSizeChange(parseFloat(e.target.value) || 1)}
                    min="0.1"
                    max="10"
                    step="0.1"
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Fine (0.1')</span>
                  <span>Coarse (5')</span>
                </div>
              </div>

              {/* Quick Grid Sizes */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">QUICK SIZES</label>
                <div className="grid grid-cols-4 gap-2">
                  {[0.25, 0.5, 1, 2].map((size) => (
                    <button
                      key={size}
                      onClick={() => onGridSizeChange(size)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        Math.abs(gridSize - size) < 0.01
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {size}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
