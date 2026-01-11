/**
 * Precision Edit Panel
 * Provides detailed controls for precise XYZ positioning, dimensions, and constraints
 */

"use client";

import { useState } from 'react';
import { Ruler, Lock, Unlock, Grid3x3, Maximize2, Move, RotateCw } from 'lucide-react';

export interface PrecisionEditData {
  // Position
  x: number;
  y: number;
  z: number;

  // Dimensions
  width: number;
  height: number;
  depth: number;

  // Rotation (in degrees)
  rotationX: number;
  rotationY: number;
  rotationZ: number;

  // Constraints
  lockX: boolean;
  lockY: boolean;
  lockZ: boolean;
  maintainAspectRatio: boolean;
}

interface PrecisionEditPanelProps {
  data: PrecisionEditData;
  onChange: (data: PrecisionEditData) => void;
  onClose?: () => void;
  snapToGrid?: boolean;
  onToggleSnap?: () => void;
  gridSize?: number;
  unit?: 'feet' | 'inches' | 'meters';
}

export default function PrecisionEditPanel({
  data,
  onChange,
  onClose,
  snapToGrid = false,
  onToggleSnap,
  gridSize = 1,
  unit = 'feet',
}: PrecisionEditPanelProps) {
  const [mode, setMode] = useState<'position' | 'dimensions' | 'rotation'>('position');

  const handleNumberChange = (field: keyof PrecisionEditData, value: number) => {
    const newData = { ...data, [field]: value };

    // Handle aspect ratio for dimensions
    if (data.maintainAspectRatio && (field === 'width' || field === 'depth' || field === 'height')) {
      const ratio = value / data[field];
      if (field === 'width') {
        newData.depth = data.depth * ratio;
      } else if (field === 'depth') {
        newData.width = data.width * ratio;
      }
    }

    onChange(newData);
  };

  const handleLockToggle = (axis: 'X' | 'Y' | 'Z') => {
    onChange({
      ...data,
      [`lock${axis}`]: !data[`lock${axis}` as keyof PrecisionEditData],
    });
  };

  const snapValue = (value: number): number => {
    if (!snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const formatValue = (value: number): string => {
    return value.toFixed(3);
  };

  return (
    <div className="fixed right-4 top-24 w-96 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden z-30">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            <h3 className="text-lg font-bold">Precision Edit</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-sm text-purple-100">
          Edit with sub-{unit} precision
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setMode('position')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            mode === 'position'
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Move className="w-4 h-4" />
          Position
        </button>
        <button
          onClick={() => setMode('dimensions')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            mode === 'dimensions'
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Maximize2 className="w-4 h-4" />
          Dimensions
        </button>
        <button
          onClick={() => setMode('rotation')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            mode === 'rotation'
              ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <RotateCw className="w-4 h-4" />
          Rotation
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        {mode === 'position' && (
          <>
            <div className="space-y-3">
              {/* X Position */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center text-xs font-bold">
                      X
                    </span>
                    X Position
                  </label>
                  <button
                    onClick={() => handleLockToggle('X')}
                    className={`p-1 rounded transition-colors ${
                      data.lockX ? 'text-red-600 bg-red-50' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {data.lockX ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formatValue(data.x)}
                    onChange={(e) => handleNumberChange('x', parseFloat(e.target.value) || 0)}
                    onBlur={(e) => handleNumberChange('x', snapValue(parseFloat(e.target.value) || 0))}
                    disabled={data.lockX}
                    step={gridSize}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 min-w-[50px] text-center">
                    {unit}
                  </span>
                </div>
              </div>

              {/* Y Position */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-500 text-white rounded flex items-center justify-center text-xs font-bold">
                      Y
                    </span>
                    Y Position (Height)
                  </label>
                  <button
                    onClick={() => handleLockToggle('Y')}
                    className={`p-1 rounded transition-colors ${
                      data.lockY ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {data.lockY ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formatValue(data.y)}
                    onChange={(e) => handleNumberChange('y', parseFloat(e.target.value) || 0)}
                    onBlur={(e) => handleNumberChange('y', snapValue(parseFloat(e.target.value) || 0))}
                    disabled={data.lockY}
                    step={gridSize}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 min-w-[50px] text-center">
                    {unit}
                  </span>
                </div>
              </div>

              {/* Z Position */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded flex items-center justify-center text-xs font-bold">
                      Z
                    </span>
                    Z Position
                  </label>
                  <button
                    onClick={() => handleLockToggle('Z')}
                    className={`p-1 rounded transition-colors ${
                      data.lockZ ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {data.lockZ ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formatValue(data.z)}
                    onChange={(e) => handleNumberChange('z', parseFloat(e.target.value) || 0)}
                    onBlur={(e) => handleNumberChange('z', snapValue(parseFloat(e.target.value) || 0))}
                    disabled={data.lockZ}
                    step={gridSize}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 min-w-[50px] text-center">
                    {unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-3 border-t border-gray-200">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">QUICK ACTIONS</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChange({ ...data, x: 0, y: 0, z: 0 })}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                  Reset to Origin
                </button>
                <button
                  onClick={() => onChange({ ...data, y: 0 })}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                >
                  Ground Level
                </button>
              </div>
            </div>
          </>
        )}

        {mode === 'dimensions' && (
          <>
            <div className="space-y-3">
              {/* Aspect Ratio Lock */}
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Maintain Aspect Ratio</span>
                <button
                  onClick={() => onChange({ ...data, maintainAspectRatio: !data.maintainAspectRatio })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    data.maintainAspectRatio ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      data.maintainAspectRatio ? 'transform translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Width */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Width (X-axis)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formatValue(data.width)}
                    onChange={(e) => handleNumberChange('width', parseFloat(e.target.value) || 0)}
                    onBlur={(e) => handleNumberChange('width', snapValue(parseFloat(e.target.value) || 0))}
                    step={gridSize}
                    min={0.1}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 min-w-[50px] text-center">
                    {unit}
                  </span>
                </div>
              </div>

              {/* Height */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Height (Y-axis)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formatValue(data.height)}
                    onChange={(e) => handleNumberChange('height', parseFloat(e.target.value) || 0)}
                    onBlur={(e) => handleNumberChange('height', snapValue(parseFloat(e.target.value) || 0))}
                    step={gridSize}
                    min={0.1}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 min-w-[50px] text-center">
                    {unit}
                  </span>
                </div>
              </div>

              {/* Depth */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Depth (Z-axis)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formatValue(data.depth)}
                    onChange={(e) => handleNumberChange('depth', parseFloat(e.target.value) || 0)}
                    onBlur={(e) => handleNumberChange('depth', snapValue(parseFloat(e.target.value) || 0))}
                    step={gridSize}
                    min={0.1}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  />
                  <span className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 min-w-[50px] text-center">
                    {unit}
                  </span>
                </div>
              </div>

              {/* Volume Display */}
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">Volume:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {(data.width * data.height * data.depth).toFixed(2)} ft³
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mt-2">
                  <span className="text-sm font-semibold text-gray-700">Area (W×D):</span>
                  <span className="text-sm font-mono text-gray-900">
                    {(data.width * data.depth).toFixed(2)} ft²
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {mode === 'rotation' && (
          <>
            <div className="space-y-3">
              {/* X Rotation (Pitch) */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center text-xs font-bold">
                    X
                  </span>
                  Pitch (X-axis rotation)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={data.rotationX}
                    onChange={(e) => handleNumberChange('rotationX', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={data.rotationX.toFixed(1)}
                    onChange={(e) => handleNumberChange('rotationX', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-sm text-gray-600">°</span>
                </div>
              </div>

              {/* Y Rotation (Yaw) */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-500 text-white rounded flex items-center justify-center text-xs font-bold">
                    Y
                  </span>
                  Yaw (Y-axis rotation)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={data.rotationY}
                    onChange={(e) => handleNumberChange('rotationY', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={data.rotationY.toFixed(1)}
                    onChange={(e) => handleNumberChange('rotationY', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-sm text-gray-600">°</span>
                </div>
              </div>

              {/* Z Rotation (Roll) */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded flex items-center justify-center text-xs font-bold">
                    Z
                  </span>
                  Roll (Z-axis rotation)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={data.rotationZ}
                    onChange={(e) => handleNumberChange('rotationZ', parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={data.rotationZ.toFixed(1)}
                    onChange={(e) => handleNumberChange('rotationZ', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-sm text-gray-600">°</span>
                </div>
              </div>

              {/* Quick Rotations */}
              <div className="pt-3 border-t border-gray-200">
                <label className="text-xs font-semibold text-gray-600 mb-2 block">QUICK ROTATIONS</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => onChange({ ...data, rotationY: 0 })}
                    className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors"
                  >
                    0°
                  </button>
                  <button
                    onClick={() => onChange({ ...data, rotationY: 90 })}
                    className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors"
                  >
                    90°
                  </button>
                  <button
                    onClick={() => onChange({ ...data, rotationY: 180 })}
                    className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors"
                  >
                    180°
                  </button>
                  <button
                    onClick={() => onChange({ ...data, rotationY: 270 })}
                    className="px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors"
                  >
                    270°
                  </button>
                  <button
                    onClick={() => onChange({ ...data, rotationX: 0, rotationY: 0, rotationZ: 0 })}
                    className="col-span-2 px-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer - Snap Controls */}
      {onToggleSnap && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Grid3x3 className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Snap to Grid</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">{gridSize} {unit}</span>
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
          </div>
        </div>
      )}
    </div>
  );
}
