/**
 * DesignHub - Comprehensive bottom toolbar as central design command center
 * Maximum utility, minimal footprint - Make Kant proud!
 */

"use client";

import { useState } from 'react';
import {
  MousePointer2,
  Move,
  RotateCw,
  Maximize2,
  Grid3x3,
  Eye,
  EyeOff,
  Undo2,
  Redo2,
  Save,
  Upload,
  Download,
  Copy,
  Trash2,
  Clock,
  Home,
  Ruler,
  Settings,
  Layers,
  ZoomIn,
  ZoomOut,
  Target,
  ChevronUp,
  ChevronDown,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface DesignHubProps {
  // Selection and editing
  selectedCount: number;
  editMode: 'select' | 'move' | 'rotate' | 'scale';
  onEditModeChange: (mode: 'select' | 'move' | 'rotate' | 'scale') => void;

  // Visibility toggles
  showGrid: boolean;
  onToggleGrid: () => void;
  showMeasurements: boolean;
  onToggleMeasurements: () => void;
  showGridPoints?: boolean;
  onToggleGridPoints?: () => void;

  // Grid settings
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;

  // Timeline
  age: number;
  onAgeChange: (age: number) => void;

  // Actions
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // File operations
  onSave: () => void;
  onLoad: () => void;
  onExport: () => void;

  // Object operations
  onCopy: () => void;
  onDelete: () => void;
  canCopy: boolean;
  canDelete: boolean;

  // View controls
  onResetCamera: () => void;
  onFocusSelected: () => void;

  // Panels
  onTogglePrecision: () => void;
  onToggleProperties: () => void;
  onToggleHelp: () => void;
}

export default function DesignHub({
  selectedCount,
  editMode,
  onEditModeChange,
  showGrid,
  onToggleGrid,
  showMeasurements,
  onToggleMeasurements,
  showGridPoints = false,
  onToggleGridPoints,
  gridSize,
  onGridSizeChange,
  snapToGrid,
  onToggleSnap,
  age,
  onAgeChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  onLoad,
  onExport,
  onCopy,
  onDelete,
  canCopy,
  canDelete,
  onResetCamera,
  onFocusSelected,
  onTogglePrecision,
  onToggleProperties,
  onToggleHelp,
}: DesignHubProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeSection, setActiveSection] = useState<'edit' | 'view' | 'timeline' | null>('edit');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t-2 border-gray-200 shadow-2xl">
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-1 rounded-t-lg shadow-lg hover:bg-gray-50 transition-colors border-t border-x border-gray-200"
      >
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>

      {isExpanded ? (
        <div className="px-4 py-3 space-y-3">
          {/* Top Row - Main Controls */}
          <div className="flex items-center justify-between gap-4">
            {/* Left - Edit Modes */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => onEditModeChange('select')}
                  className={`px-3 py-2 rounded transition-all flex items-center gap-2 ${
                    editMode === 'select'
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Select Mode"
                >
                  <MousePointer2 className="w-4 h-4" />
                  <span className="text-xs font-semibold">Select</span>
                </button>
                <button
                  onClick={() => onEditModeChange('move')}
                  className={`px-3 py-2 rounded transition-all flex items-center gap-2 ${
                    editMode === 'move'
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Move Mode"
                >
                  <Move className="w-4 h-4" />
                  <span className="text-xs font-semibold">Move</span>
                </button>
                <button
                  onClick={() => onEditModeChange('rotate')}
                  className={`px-3 py-2 rounded transition-all flex items-center gap-2 ${
                    editMode === 'rotate'
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Rotate Mode"
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="text-xs font-semibold">Rotate</span>
                </button>
                <button
                  onClick={() => onEditModeChange('scale')}
                  className={`px-3 py-2 rounded transition-all flex items-center gap-2 ${
                    editMode === 'scale'
                      ? 'bg-white shadow-sm text-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Scale Mode"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="text-xs font-semibold">Scale</span>
                </button>
              </div>

              {/* Selection Info */}
              {selectedCount > 0 && (
                <div className="px-3 py-2 bg-primary-50 rounded-lg text-xs font-semibold text-primary-700">
                  {selectedCount} selected
                </div>
              )}
            </div>

            {/* Center - Quick Actions */}
            <div className="flex items-center gap-1">
              {/* Undo/Redo */}
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className={`p-2 rounded transition-colors ${
                  canUndo ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className={`p-2 rounded transition-colors ${
                  canRedo ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1" />

              {/* Object Actions */}
              <button
                onClick={onCopy}
                disabled={!canCopy}
                className={`p-2 rounded transition-colors ${
                  canCopy ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Copy (Ctrl+C)"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                disabled={!canDelete}
                className={`p-2 rounded transition-colors ${
                  canDelete ? 'hover:bg-red-100 text-red-600' : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Delete (Del)"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1" />

              {/* View Controls */}
              <button
                onClick={onResetCamera}
                className="p-2 hover:bg-gray-100 text-gray-700 rounded transition-colors"
                title="Reset Camera"
              >
                <Home className="w-4 h-4" />
              </button>
              <button
                onClick={onFocusSelected}
                className="p-2 hover:bg-gray-100 text-gray-700 rounded transition-colors"
                title="Focus on Selected"
              >
                <Target className="w-4 h-4" />
              </button>
            </div>

            {/* Right - File & Panel Toggles */}
            <div className="flex items-center gap-1">
              {/* File Operations */}
              <button
                onClick={onSave}
                className="p-2 hover:bg-green-100 text-green-600 rounded transition-colors"
                title="Save (Ctrl+S)"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={onLoad}
                className="p-2 hover:bg-blue-100 text-blue-600 rounded transition-colors"
                title="Load Design"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={onExport}
                className="p-2 hover:bg-purple-100 text-purple-600 rounded transition-colors"
                title="Export"
              >
                <Download className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-1" />

              {/* Panel Toggles */}
              <button
                onClick={onTogglePrecision}
                className="p-2 hover:bg-gray-100 text-gray-700 rounded transition-colors"
                title="Precision Edit"
              >
                <Ruler className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleProperties}
                className="p-2 hover:bg-gray-100 text-gray-700 rounded transition-colors"
                title="Properties"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleHelp}
                className="p-2 hover:bg-gray-100 text-gray-700 rounded transition-colors"
                title="Help (F1)"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Row - Context-Sensitive Controls */}
          <div className="flex items-center gap-6 px-2">
            {/* Grid Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleGrid}
                  className={`p-1.5 rounded transition-colors ${
                    showGrid ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Toggle Grid"
                >
                  <Grid3x3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onToggleMeasurements}
                  className={`p-1.5 rounded transition-colors ${
                    showMeasurements ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title="Toggle Measurements"
                >
                  <Ruler className="w-3.5 h-3.5" />
                </button>
                {onToggleGridPoints && (
                  <button
                    onClick={onToggleGridPoints}
                    className={`p-1.5 rounded transition-colors ${
                      showGridPoints ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    title="Toggle Grid Points"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 font-medium">Grid:</span>
                <select
                  value={gridSize}
                  onChange={(e) => onGridSizeChange(parseFloat(e.target.value))}
                  className="text-xs px-2 py-1 border border-gray-300 rounded bg-white"
                >
                  <option value={0.25}>0.25 ft</option>
                  <option value={0.5}>0.5 ft</option>
                  <option value={1}>1 ft</option>
                  <option value={2}>2 ft</option>
                  <option value={5}>5 ft</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={onToggleSnap}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                />
                <span className="text-xs font-medium text-gray-700">Snap</span>
              </label>
            </div>

            <div className="w-px h-6 bg-gray-300" />

            {/* Timeline Control */}
            <div className="flex-1 flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Year {age}</span>
              <input
                type="range"
                min={0}
                max={30}
                value={age}
                onChange={(e) => onAgeChange(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <span className="text-xs text-gray-500">30 years</span>
            </div>
          </div>
        </div>
      ) : (
        /* Minimized State */
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-gray-700">Design Hub</span>
            {selectedCount > 0 && (
              <span className="text-xs text-primary-600 font-medium">{selectedCount} selected</span>
            )}
          </div>
          <div className="text-xs text-gray-500">Click to expand controls</div>
        </div>
      )}
    </div>
  );
}
