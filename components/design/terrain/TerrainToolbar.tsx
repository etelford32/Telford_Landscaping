/**
 * TerrainToolbar - Tool selection for terrain editing
 * Provides buttons for raise, lower, smooth, flatten tools
 */

"use client";

import {
  Mountain,
  ArrowUp,
  ArrowDown,
  Waves,
  MinusSquare,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { TerrainTool } from '@/lib/terrain/TerrainManager';

interface TerrainToolbarProps {
  activeTool: TerrainTool;
  onToolChange: (tool: TerrainTool) => void;
  onReset?: () => void;
  onGenerateRandom?: () => void;
}

export default function TerrainToolbar({
  activeTool,
  onToolChange,
  onReset,
  onGenerateRandom,
}: TerrainToolbarProps) {
  const tools = [
    { id: 'raise' as TerrainTool, label: 'Raise', icon: ArrowUp, color: 'text-green-600', bgColor: 'bg-green-50 hover:bg-green-100', activeBg: 'bg-green-600' },
    { id: 'lower' as TerrainTool, label: 'Lower', icon: ArrowDown, color: 'text-blue-600', bgColor: 'bg-blue-50 hover:bg-blue-100', activeBg: 'bg-blue-600' },
    { id: 'smooth' as TerrainTool, label: 'Smooth', icon: Waves, color: 'text-purple-600', bgColor: 'bg-purple-50 hover:bg-purple-100', activeBg: 'bg-purple-600' },
    { id: 'flatten' as TerrainTool, label: 'Flatten', icon: MinusSquare, color: 'text-orange-600', bgColor: 'bg-orange-50 hover:bg-orange-100', activeBg: 'bg-orange-600' },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <Mountain className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-gray-800">Terrain Tools</h3>
      </div>

      {/* Tool Buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? `${tool.activeBg} text-white shadow-md`
                  : `${tool.bgColor} ${tool.color}`
              }`}
              title={tool.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        {onGenerateRandom && (
          <button
            onClick={onGenerateRandom}
            className="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-sm transition-colors"
            title="Generate random terrain"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate</span>
          </button>
        )}
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
            title="Reset to flat"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
