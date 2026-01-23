/**
 * CameraPresets - Quick camera view switching
 * Provides preset camera positions: Top, Front, Side, Isometric
 */

"use client";

import { useState } from 'react';
import {
  Camera,
  Eye,
  Box,
  Maximize2,
} from 'lucide-react';

export type CameraPreset = 'top' | 'front' | 'side' | 'isometric' | 'perspective';

export interface CameraPosition {
  position: [number, number, number];
  target: [number, number, number];
  name: string;
  description: string;
}

export const CAMERA_PRESETS: Record<CameraPreset, CameraPosition> = {
  top: {
    position: [0, 30, 0],
    target: [0, 0, 0],
    name: 'Top View',
    description: 'Bird\'s eye view from above',
  },
  front: {
    position: [0, 10, 25],
    target: [0, 0, 0],
    name: 'Front View',
    description: 'View from the front',
  },
  side: {
    position: [25, 10, 0],
    target: [0, 0, 0],
    name: 'Side View',
    description: 'View from the side',
  },
  isometric: {
    position: [20, 20, 20],
    target: [0, 0, 0],
    name: 'Isometric',
    description: '45-degree angle view',
  },
  perspective: {
    position: [15, 12, 15],
    target: [0, 0, 0],
    name: 'Perspective',
    description: 'Default 3D perspective',
  },
};

interface CameraPresetsProps {
  currentPreset?: CameraPreset;
  onPresetChange: (preset: CameraPreset) => void;
  compact?: boolean;
  vertical?: boolean;
}

export default function CameraPresets({
  currentPreset = 'perspective',
  onPresetChange,
  compact = false,
  vertical = false,
}: CameraPresetsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const presets: Array<{ id: CameraPreset; icon: any; label: string }> = [
    { id: 'perspective', icon: Camera, label: 'Perspective' },
    { id: 'top', icon: Eye, label: 'Top' },
    { id: 'front', icon: Box, label: 'Front' },
    { id: 'side', icon: Box, label: 'Side' },
    { id: 'isometric', icon: Maximize2, label: 'Isometric' },
  ];

  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors"
        title="Camera Presets"
      >
        <Camera className="w-4 h-4 text-primary-600" />
        <span className="text-sm font-medium text-gray-700">
          {CAMERA_PRESETS[currentPreset].name}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`flex ${
        vertical ? 'flex-col' : 'flex-row'
      } gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg`}
    >
      {presets.map((preset) => {
        const Icon = preset.icon;
        const isActive = currentPreset === preset.id;

        return (
          <button
            key={preset.id}
            onClick={() => {
              onPresetChange(preset.id);
              if (compact) setIsExpanded(false);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              isActive
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
            title={CAMERA_PRESETS[preset.id].description}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
            {!compact && (
              <span className="text-sm font-medium">{preset.label}</span>
            )}
          </button>
        );
      })}

      {compact && isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors"
        >
          Close
        </button>
      )}
    </div>
  );
}
