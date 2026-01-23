/**
 * HardscapePresets - Quick preset layouts for common scenarios
 * Makes it easy to add complete hardscape configurations
 */

"use client";

import { useState } from 'react';
import {
  Sparkles,
  Home,
  Square,
  Fence,
  Package,
  ChevronRight,
  Check,
} from 'lucide-react';
import { HARDSCAPE_PRESETS, HardscapePreset, getPresetsByCategory } from '@/lib/hardscape/presets';

interface HardscapePresetsProps {
  onPresetSelect: (preset: HardscapePreset) => void;
  selectedHouseId: string | null;
  visible?: boolean;
}

export default function HardscapePresets({
  onPresetSelect,
  selectedHouseId,
  visible = true,
}: HardscapePresetsProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'entrance' | 'backyard' | 'perimeter' | 'custom'>('entrance');

  if (!visible) return null;

  const categories = [
    { id: 'entrance' as const, label: 'Entrance', icon: Home },
    { id: 'backyard' as const, label: 'Backyard', icon: Square },
    { id: 'perimeter' as const, label: 'Fencing', icon: Fence },
    { id: 'custom' as const, label: 'Complete', icon: Package },
  ];

  const presets = getPresetsByCategory(activeCategory);

  const handlePresetClick = (preset: HardscapePreset) => {
    setSelectedPresetId(preset.id);
    onPresetSelect(preset);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 w-80">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-yellow-600" />
        <h3 className="font-bold text-gray-800">Quick Presets</h3>
      </div>

      {selectedHouseId ? (
        <>
          <div className="text-sm text-gray-600 mb-4">
            Add complete hardscape layouts to your selected house
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-all ${
                    activeCategory === cat.id
                      ? 'bg-white text-yellow-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Preset List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedPresetId === preset.id
                    ? 'border-yellow-500 bg-yellow-50 shadow-md'
                    : 'border-gray-200 hover:border-yellow-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900 mb-1">
                      {preset.name}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {preset.description}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="px-2 py-0.5 bg-gray-100 rounded">
                        {preset.structures.length} {preset.structures.length === 1 ? 'piece' : 'pieces'}
                      </span>
                    </div>
                  </div>

                  {selectedPresetId === preset.id && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Apply Button */}
          {selectedPresetId && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  const preset = HARDSCAPE_PRESETS.find(p => p.id === selectedPresetId);
                  if (preset) onPresetSelect(preset);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                Apply Preset
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-2">
            Select a house first
          </p>
          <p className="text-xs text-gray-500">
            Click on a house in your design to add hardscape around it
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="text-xs text-yellow-800">
          <strong>💡 Tip:</strong> Presets automatically position hardscape relative to your house orientation
        </div>
      </div>
    </div>
  );
}
