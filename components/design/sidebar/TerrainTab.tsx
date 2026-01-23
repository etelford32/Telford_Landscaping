/**
 * TerrainTab - Terrain configuration and statistics
 * Shows terrain info and configuration options
 */

"use client";

import { Mountain, Grid3x3, TrendingUp, Info } from 'lucide-react';
import { TerrainConfig } from '@/lib/terrain/TerrainManager';

interface TerrainTabProps {
  config: TerrainConfig;
  stats?: {
    minHeight: number;
    maxHeight: number;
    avgHeight: number;
  };
  onConfigChange?: (config: Partial<TerrainConfig>) => void;
}

export default function TerrainTab({ config, stats, onConfigChange }: TerrainTabProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Terrain Configuration */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Grid3x3 className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Terrain Configuration</h3>
        </div>

        <div className="space-y-4">
          {/* Resolution */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Resolution</label>
              <span className="text-sm font-mono font-semibold text-gray-800">
                {config.resolution}x{config.resolution}
              </span>
            </div>
            {onConfigChange && (
              <input
                type="range"
                min="32"
                max="128"
                step="16"
                value={config.resolution}
                onChange={(e) => onConfigChange({ resolution: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            )}
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>32 (Fast)</span>
              <span>128 (Detailed)</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {((config.resolution + 1) ** 2).toLocaleString()} vertices
            </div>
          </div>

          {/* Max Height */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Max Height</label>
              <span className="text-sm font-mono font-semibold text-gray-800">
                {config.maxHeight} units
              </span>
            </div>
            {onConfigChange && (
              <input
                type="range"
                min="5"
                max="20"
                step="1"
                value={config.maxHeight}
                onChange={(e) => onConfigChange({ maxHeight: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            )}
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>5</span>
              <span>20</span>
            </div>
          </div>

          {/* Min Height */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Min Height</label>
              <span className="text-sm font-mono font-semibold text-gray-800">
                {config.minHeight} units
              </span>
            </div>
            {onConfigChange && (
              <input
                type="range"
                min="-10"
                max="0"
                step="1"
                value={config.minHeight}
                onChange={(e) => onConfigChange({ minHeight: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            )}
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>-10</span>
              <span>0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terrain Statistics */}
      {stats && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-gray-800">Terrain Statistics</h3>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Lowest Point:</span>
              <span className="font-mono font-semibold text-blue-900">
                {stats.minHeight.toFixed(2)} units
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Highest Point:</span>
              <span className="font-mono font-semibold text-blue-900">
                {stats.maxHeight.toFixed(2)} units
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Average Height:</span>
              <span className="font-mono font-semibold text-blue-900">
                {stats.avgHeight.toFixed(2)} units
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-blue-300">
              <span className="text-blue-700">Elevation Range:</span>
              <span className="font-mono font-semibold text-blue-900">
                {(stats.maxHeight - stats.minHeight).toFixed(2)} units
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-gray-500 mt-0.5" />
          <div className="text-xs text-gray-600">
            <p className="mb-2">
              <strong>Terrain Tips:</strong>
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Use Raise/Lower to sculpt hills and valleys</li>
              <li>Use Smooth to blend rough transitions</li>
              <li>Use Flatten to create level areas</li>
              <li>Hold brush longer for stronger effect</li>
              <li>Increase falloff for softer edges</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
