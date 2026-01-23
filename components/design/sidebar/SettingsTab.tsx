/**
 * SettingsTab - Ground and terrain settings
 * Exposes controls for ground size, colors, density, and grid
 */

"use client";

import { useState } from 'react';
import {
  Mountain,
  Palette,
  Sliders,
  Grid3x3,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SettingsTabProps {
  ground: {
    size: number;
    grassColor: string;
    soilColor: string;
    grassDensity: number;
    showGrid: boolean;
  };
  onGroundChange: (ground: {
    size?: number;
    grassColor?: string;
    soilColor?: string;
    grassDensity?: number;
    showGrid?: boolean;
  }) => void;
}

export default function SettingsTab({ ground, onGroundChange }: SettingsTabProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Ground Size */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Mountain className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Ground Size</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Size (ft)</span>
            <span className="text-sm font-mono font-semibold text-gray-800">
              {ground.size}
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={ground.size}
            onChange={(e) => onGroundChange({ size: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>10 ft</span>
            <span>100 ft</span>
          </div>
        </div>
      </div>

      {/* Grass Color */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Grass Color</h3>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={ground.grassColor}
            onChange={(e) => onGroundChange({ grassColor: e.target.value })}
            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
          />
          <div className="flex-1">
            <input
              type="text"
              value={ground.grassColor}
              onChange={(e) => onGroundChange({ grassColor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
              placeholder="#hex color"
            />
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <ColorPreset
            color="#7cb342"
            label="Green"
            onClick={() => onGroundChange({ grassColor: '#7cb342' })}
          />
          <ColorPreset
            color="#8bc34a"
            label="Light"
            onClick={() => onGroundChange({ grassColor: '#8bc34a' })}
          />
          <ColorPreset
            color="#558b2f"
            label="Dark"
            onClick={() => onGroundChange({ grassColor: '#558b2f' })}
          />
          <ColorPreset
            color="#9e9d24"
            label="Yellow"
            onClick={() => onGroundChange({ grassColor: '#9e9d24' })}
          />
        </div>
      </div>

      {/* Soil Color */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Soil Color</h3>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={ground.soilColor}
            onChange={(e) => onGroundChange({ soilColor: e.target.value })}
            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
          />
          <div className="flex-1">
            <input
              type="text"
              value={ground.soilColor}
              onChange={(e) => onGroundChange({ soilColor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono"
              placeholder="#hex color"
            />
          </div>
        </div>
        <div className="mt-2 flex gap-2">
          <ColorPreset
            color="#8b7355"
            label="Brown"
            onClick={() => onGroundChange({ soilColor: '#8b7355' })}
          />
          <ColorPreset
            color="#a0826d"
            label="Light"
            onClick={() => onGroundChange({ soilColor: '#a0826d' })}
          />
          <ColorPreset
            color="#6d5d4b"
            label="Dark"
            onClick={() => onGroundChange({ soilColor: '#6d5d4b' })}
          />
          <ColorPreset
            color="#c19a6b"
            label="Sand"
            onClick={() => onGroundChange({ soilColor: '#c19a6b' })}
          />
        </div>
      </div>

      {/* Grass Density */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Grass Density</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Density</span>
            <span className="text-sm font-mono font-semibold text-gray-800">
              {Math.round(ground.grassDensity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={ground.grassDensity}
            onChange={(e) => onGroundChange({ grassDensity: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Sparse</span>
            <span>Normal</span>
            <span>Dense</span>
          </div>
        </div>
      </div>

      {/* Grid Visibility */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Grid3x3 className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Grid Display</h3>
        </div>
        <button
          onClick={() => onGroundChange({ showGrid: !ground.showGrid })}
          className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
            ground.showGrid
              ? 'bg-primary-50 border-primary-300 text-primary-700'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-2">
            {ground.showGrid ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
            <span className="font-medium">
              {ground.showGrid ? 'Grid Visible' : 'Grid Hidden'}
            </span>
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors ${
            ground.showGrid ? 'bg-primary-600' : 'bg-gray-300'
          }`}>
            <div className={`w-5 h-5 mt-0.5 bg-white rounded-full shadow-md transition-transform ${
              ground.showGrid ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </div>
        </button>
      </div>

      {/* Info Panel */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Ground Settings</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div className="flex justify-between">
            <span>Area:</span>
            <span className="font-mono">{ground.size * ground.size} sq ft</span>
          </div>
          <div className="flex justify-between">
            <span>Grass Blades:</span>
            <span className="font-mono">~{Math.round(500 * ground.grassDensity)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Color Preset Button
function ColorPreset({
  color,
  label,
  onClick,
}: {
  color: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 p-2 hover:bg-gray-100 rounded-lg transition-colors"
      title={label}
    >
      <div
        className="w-8 h-8 rounded-md border-2 border-gray-200 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-gray-600">{label}</span>
    </button>
  );
}
