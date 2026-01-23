/**
 * CameraControlPanel - Comprehensive camera control interface
 * Includes presets, manual controls, FOV, speed, position, custom views, and render settings
 */

"use client";

import { useState, useEffect } from 'react';
import {
  Camera,
  Eye,
  Box,
  Maximize2,
  Save,
  Trash2,
  Settings,
  Sliders,
  Image,
  Lock,
  Unlock,
  RotateCcw,
} from 'lucide-react';
import BasePanel from '../ui/BasePanel';
import { CameraPreset, CAMERA_PRESETS } from '../CameraPresets';

interface CameraPosition {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

interface CustomView {
  id: string;
  name: string;
  position: CameraPosition;
  thumbnail?: string;
}

interface CameraSettings {
  panSpeed: number;
  zoomSpeed: number;
  rotationSpeed: number;
  fov: number;
  lockX: boolean;
  lockY: boolean;
  lockZ: boolean;
  minDistance: number;
  maxDistance: number;
}

interface CameraControlPanelProps {
  currentPreset?: CameraPreset;
  onPresetChange: (preset: CameraPreset) => void;
  cameraSettings?: CameraSettings;
  onCameraSettingsChange?: (settings: Partial<CameraSettings>) => void;
  currentPosition?: { x: number; y: number; z: number };
  currentTarget?: { x: number; y: number; z: number };
  onManualMove?: (direction: 'up' | 'down' | 'left' | 'right' | 'forward' | 'backward') => void;
  onResetCamera?: () => void;
  onTakeScreenshot?: (quality: number) => void;
}

export default function CameraControlPanel({
  currentPreset = 'perspective',
  onPresetChange,
  cameraSettings = {
    panSpeed: 1.0,
    zoomSpeed: 1.0,
    rotationSpeed: 1.0,
    fov: 50,
    lockX: false,
    lockY: false,
    lockZ: false,
    minDistance: 5,
    maxDistance: 40,
  },
  onCameraSettingsChange,
  currentPosition = { x: 15, y: 12, z: 15 },
  currentTarget = { x: 0, y: 0, z: 0 },
  onManualMove,
  onResetCamera,
  onTakeScreenshot,
}: CameraControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'manual' | 'custom' | 'render'>('presets');
  const [customViews, setCustomViews] = useState<CustomView[]>([]);
  const [newViewName, setNewViewName] = useState('');
  const [renderQuality, setRenderQuality] = useState(90);

  // Load custom views from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('camera-custom-views');
    if (stored) {
      try {
        setCustomViews(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load custom views:', error);
      }
    }
  }, []);

  // Save custom views to localStorage
  const saveCustomViews = (views: CustomView[]) => {
    setCustomViews(views);
    localStorage.setItem('camera-custom-views', JSON.stringify(views));
  };

  // Save current view
  const handleSaveCurrentView = () => {
    if (!newViewName.trim()) return;

    const newView: CustomView = {
      id: `custom-${Date.now()}`,
      name: newViewName,
      position: {
        position: [currentPosition.x, currentPosition.y, currentPosition.z],
        target: [currentTarget.x, currentTarget.y, currentTarget.z],
        fov: cameraSettings.fov,
      },
    };

    saveCustomViews([...customViews, newView]);
    setNewViewName('');
  };

  // Delete custom view
  const handleDeleteCustomView = (id: string) => {
    saveCustomViews(customViews.filter((v) => v.id !== id));
  };

  // Apply custom view
  const handleApplyCustomView = (view: CustomView) => {
    // This would need to be implemented in the parent component
    console.log('Apply custom view:', view);
    // onPresetChange could be extended to support custom positions
  };

  const presets: Array<{ id: CameraPreset; icon: any; label: string; description: string }> = [
    { id: 'perspective', icon: Camera, label: 'Perspective', description: 'Default 3D view' },
    { id: 'top', icon: Eye, label: 'Top', description: "Bird's eye view" },
    { id: 'front', icon: Box, label: 'Front', description: 'Front elevation' },
    { id: 'side', icon: Box, label: 'Side', description: 'Side elevation' },
    { id: 'isometric', icon: Maximize2, label: 'Isometric', description: '45° angle view' },
  ];

  return (
    <BasePanel
      id="camera"
      title="Camera Controls"
      icon={<Camera className="w-5 h-5" />}
      minWidth={380}
      minHeight={400}
      maxWidth={600}
      maxHeight={900}
    >
      <div className="p-4 space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'presets', label: 'Presets' },
            { id: 'manual', label: 'Manual' },
            { id: 'custom', label: 'Custom' },
            { id: 'render', label: 'Render' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-3 py-2 text-xs font-semibold rounded transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Presets Tab */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Camera Presets
            </div>
            {presets.map((preset) => {
              const Icon = preset.icon;
              const isActive = currentPreset === preset.id;

              return (
                <button
                  key={preset.id}
                  onClick={() => onPresetChange(preset.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary-600'}`} />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-semibold">{preset.label}</div>
                    <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {preset.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Manual Controls Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            {/* Current Position */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Camera Position
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-gray-500">X</div>
                  <div className="font-mono font-semibold">{currentPosition.x.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Y</div>
                  <div className="font-mono font-semibold">{currentPosition.y.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Z</div>
                  <div className="font-mono font-semibold">{currentPosition.z.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* Manual Movement Controls */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Manual Movement
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* Up/Down */}
                <div className="col-span-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onManualMove?.('up')}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium transition-colors"
                  >
                    ↑ Up
                  </button>
                  <button
                    onClick={() => onManualMove?.('down')}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium transition-colors"
                  >
                    ↓ Down
                  </button>
                </div>
                {/* Forward/Backward/Left/Right */}
                <button
                  onClick={() => onManualMove?.('forward')}
                  className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded text-sm font-medium transition-colors"
                >
                  ⬆ Fwd
                </button>
                <button
                  onClick={() => onManualMove?.('left')}
                  className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded text-sm font-medium transition-colors"
                >
                  ⬅ Left
                </button>
                <button
                  onClick={() => onManualMove?.('right')}
                  className="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded text-sm font-medium transition-colors"
                >
                  ➡ Right
                </button>
                <button
                  onClick={() => onManualMove?.('backward')}
                  className="col-start-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded text-sm font-medium transition-colors"
                >
                  ⬇ Back
                </button>
              </div>
            </div>

            {/* Camera Settings */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Camera Settings
              </div>

              {/* FOV Slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Field of View</span>
                  <span className="font-semibold text-primary-600">{cameraSettings.fov}°</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={90}
                  value={cameraSettings.fov}
                  onChange={(e) =>
                    onCameraSettingsChange?.({ fov: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              {/* Pan Speed */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Pan Speed</span>
                  <span className="font-semibold text-primary-600">{cameraSettings.panSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  value={cameraSettings.panSpeed}
                  onChange={(e) =>
                    onCameraSettingsChange?.({ panSpeed: parseFloat(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              {/* Zoom Speed */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Zoom Speed</span>
                  <span className="font-semibold text-primary-600">{cameraSettings.zoomSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  value={cameraSettings.zoomSpeed}
                  onChange={(e) =>
                    onCameraSettingsChange?.({ zoomSpeed: parseFloat(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              {/* Rotation Speed */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-600">Rotation Speed</span>
                  <span className="font-semibold text-primary-600">{cameraSettings.rotationSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={3.0}
                  step={0.1}
                  value={cameraSettings.rotationSpeed}
                  onChange={(e) =>
                    onCameraSettingsChange?.({ rotationSpeed: parseFloat(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
              </div>

              {/* Axis Locks */}
              <div>
                <div className="text-xs text-gray-600 mb-2">Lock Axes</div>
                <div className="flex gap-2">
                  {(['X', 'Y', 'Z'] as const).map((axis) => {
                    const key = `lock${axis}` as keyof CameraSettings;
                    const isLocked = cameraSettings[key];
                    return (
                      <button
                        key={axis}
                        onClick={() =>
                          onCameraSettingsChange?.({ [key]: !isLocked } as Partial<CameraSettings>)
                        }
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded transition-all ${
                          isLocked
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isLocked ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <Unlock className="w-3 h-3" />
                        )}
                        <span className="text-xs font-semibold">{axis}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={onResetCamera}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">Reset Camera</span>
              </button>
            </div>
          </div>
        )}

        {/* Custom Views Tab */}
        {activeTab === 'custom' && (
          <div className="space-y-4">
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Save Current View
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                placeholder="View name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveCurrentView();
                }}
              />
              <button
                onClick={handleSaveCurrentView}
                disabled={!newViewName.trim()}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>

            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Saved Views ({customViews.length})
            </div>

            {customViews.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No custom views saved yet
              </div>
            ) : (
              <div className="space-y-2">
                {customViews.map((view) => (
                  <div
                    key={view.id}
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <button
                      onClick={() => handleApplyCustomView(view)}
                      className="flex-1 text-left"
                    >
                      <div className="text-sm font-semibold text-gray-900">{view.name}</div>
                      <div className="text-xs text-gray-500 font-mono">
                        Pos: [{view.position.position.map((v) => v.toFixed(1)).join(', ')}]
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteCustomView(view.id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                      title="Delete view"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Render Tab */}
        {activeTab === 'render' && (
          <div className="space-y-4">
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Image className="w-4 h-4" />
              Render Settings
            </div>

            {/* Quality Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Screenshot Quality</span>
                <span className="font-semibold text-primary-600">{renderQuality}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                value={renderQuality}
                onChange={(e) => setRenderQuality(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            {/* Screenshot Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => onTakeScreenshot?.(renderQuality)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Image className="w-5 h-5" />
                <span className="text-sm font-semibold">Take Screenshot</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onTakeScreenshot?.(75)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                >
                  Quick (75%)
                </button>
                <button
                  onClick={() => onTakeScreenshot?.(100)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                >
                  High (100%)
                </button>
              </div>
            </div>

            {/* Render Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
              <div className="font-semibold mb-1">Tip:</div>
              <div>Screenshots are captured at current canvas resolution. For higher quality, maximize your browser window before capturing.</div>
            </div>
          </div>
        )}
      </div>
    </BasePanel>
  );
}
