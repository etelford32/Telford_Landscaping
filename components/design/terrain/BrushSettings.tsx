/**
 * BrushSettings - Control panel for terrain brush properties
 * Adjusts brush size, strength, and falloff
 */

"use client";

import { Sliders, Circle, Zap, Wind } from 'lucide-react';
import { BrushConfig } from '@/lib/terrain/TerrainManager';

interface BrushSettingsProps {
  brush: BrushConfig;
  onBrushChange: (brush: BrushConfig) => void;
  compact?: boolean;
}

export default function BrushSettings({
  brush,
  onBrushChange,
  compact = false,
}: BrushSettingsProps) {
  const updateBrush = (updates: Partial<BrushConfig>) => {
    onBrushChange({ ...brush, ...updates });
  };

  if (compact) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Circle className="w-3 h-3 text-gray-600" />
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={brush.size}
            onChange={(e) => updateBrush({ size: Number(e.target.value) })}
            className="flex-1 h-1"
          />
          <span className="text-xs font-mono w-8">{brush.size.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-3 h-3 text-gray-600" />
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={brush.strength}
            onChange={(e) => updateBrush({ strength: Number(e.target.value) })}
            className="flex-1 h-1"
          />
          <span className="text-xs font-mono w-8">{Math.round(brush.strength * 100)}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-gray-800">Brush Settings</h3>
      </div>

      <div className="space-y-4">
        {/* Brush Size */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Size</label>
            </div>
            <span className="text-sm font-mono font-semibold text-gray-800">
              {brush.size.toFixed(1)} units
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="10"
            step="0.1"
            value={brush.size}
            onChange={(e) => updateBrush({ size: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0.5</span>
            <span>10</span>
          </div>
        </div>

        {/* Brush Strength */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Strength</label>
            </div>
            <span className="text-sm font-mono font-semibold text-gray-800">
              {Math.round(brush.strength * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={brush.strength}
            onChange={(e) => updateBrush({ strength: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Brush Falloff */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">Falloff</label>
            </div>
            <span className="text-sm font-mono font-semibold text-gray-800">
              {brush.falloff.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={brush.falloff}
            onChange={(e) => updateBrush({ falloff: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Hard</span>
            <span>Soft</span>
          </div>
        </div>
      </div>

      {/* Visual Preview */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 mb-2">Brush Preview</div>
        <div className="flex items-center justify-center h-20 relative">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <defs>
              <radialGradient id="brushGradient">
                <stop offset="0%" stopColor="#4ade80" stopOpacity={brush.strength} />
                <stop
                  offset={`${(1 - brush.falloff) * 100}%`}
                  stopColor="#4ade80"
                  stopOpacity={brush.strength * 0.5}
                />
                <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle
              cx="40"
              cy="40"
              r={brush.size * 6}
              fill="url(#brushGradient)"
              stroke="#4ade80"
              strokeWidth="1"
              strokeOpacity="0.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
