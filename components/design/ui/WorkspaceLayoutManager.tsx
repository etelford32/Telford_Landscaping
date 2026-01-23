/**
 * WorkspaceLayoutManager - UI for switching between workspace layouts
 * Allows users to select preset layouts or save custom ones
 */

"use client";

import { useState } from 'react';
import {
  Layout,
  Save,
  Trash2,
  LayoutGrid,
  Minimize2,
  Maximize2,
  X,
  Check,
} from 'lucide-react';
import { panelManager, PRESET_LAYOUTS, WorkspaceLayout } from '@/lib/ui/PanelManager';

interface WorkspaceLayoutManagerProps {
  visible: boolean;
  onClose: () => void;
}

export default function WorkspaceLayoutManager({
  visible,
  onClose,
}: WorkspaceLayoutManagerProps) {
  const [activeLayoutId, setActiveLayoutId] = useState<string>('advanced');
  const [customLayouts, setCustomLayouts] = useState<WorkspaceLayout[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [newLayoutDescription, setNewLayoutDescription] = useState('');

  // Load custom layouts
  useState(() => {
    setCustomLayouts(panelManager.getCustomLayouts());
  });

  if (!visible) return null;

  const handleApplyLayout = (layoutId: string) => {
    panelManager.applyLayout(layoutId);
    setActiveLayoutId(layoutId);
  };

  const handleSaveLayout = () => {
    if (!newLayoutName.trim()) return;

    const id = panelManager.saveLayout(newLayoutName, newLayoutDescription);
    setCustomLayouts(panelManager.getCustomLayouts());
    setNewLayoutName('');
    setNewLayoutDescription('');
    setShowSaveDialog(false);
    setActiveLayoutId(id);
  };

  const handleDeleteLayout = (id: string) => {
    panelManager.deleteCustomLayout(id);
    setCustomLayouts(panelManager.getCustomLayouts());
    if (activeLayoutId === id) {
      setActiveLayoutId('advanced');
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all panels to default positions? This cannot be undone.')) {
      panelManager.resetToDefaults();
      setActiveLayoutId('advanced');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layout className="w-6 h-6" />
            <h2 className="text-xl font-bold">Workspace Layouts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {/* Preset Layouts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-primary-600" />
                Preset Layouts
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {PRESET_LAYOUTS.map((layout) => {
                const isActive = activeLayoutId === layout.id;
                return (
                  <button
                    key={layout.id}
                    onClick={() => handleApplyLayout(layout.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all text-left ${
                      isActive
                        ? 'border-primary-600 bg-primary-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Layout Preview */}
                    <div className="mb-3 aspect-video bg-gray-100 rounded-md overflow-hidden relative">
                      {/* Simulate layout appearance */}
                      {layout.id === 'beginner' && (
                        <>
                          <div className="absolute left-0 top-0 bottom-12 w-16 bg-primary-200" />
                          <div className="absolute right-0 top-0 w-24 h-20 bg-primary-300" />
                          <div className="absolute left-0 right-0 bottom-0 h-12 bg-primary-200" />
                        </>
                      )}
                      {layout.id === 'advanced' && (
                        <>
                          <div className="absolute left-0 top-0 bottom-12 w-20 bg-primary-200" />
                          <div className="absolute right-0 top-0 bottom-12 w-20 bg-primary-200" />
                          <div className="absolute right-0 top-0 w-24 h-24 bg-primary-400" />
                          <div className="absolute left-1 bottom-16 w-16 h-16 bg-primary-300" />
                          <div className="absolute left-0 right-0 bottom-0 h-12 bg-primary-200" />
                        </>
                      )}
                      {layout.id === 'minimal' && (
                        <>
                          <div className="absolute left-0 top-0 bottom-8 w-8 bg-primary-200" />
                          <div className="absolute left-0 right-0 bottom-0 h-8 bg-primary-200" />
                        </>
                      )}
                    </div>

                    <div className="font-bold text-gray-900 mb-1">{layout.name}</div>
                    <div className="text-xs text-gray-600">{layout.description}</div>

                    {/* Panel Count */}
                    <div className="mt-2 text-xs text-gray-500">
                      {Object.keys(layout.panels).length} panels
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Layouts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Custom Layouts</h3>
              <button
                onClick={() => setShowSaveDialog(!showSaveDialog)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Save Current Layout
              </button>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Layout Name
                  </label>
                  <input
                    type="text"
                    value={newLayoutName}
                    onChange={(e) => setNewLayoutName(e.target.value)}
                    placeholder="My Custom Layout"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newLayoutDescription}
                    onChange={(e) => setNewLayoutDescription(e.target.value)}
                    placeholder="Brief description of this layout"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveLayout}
                    disabled={!newLayoutName.trim()}
                    className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Save Layout
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveDialog(false);
                      setNewLayoutName('');
                      setNewLayoutDescription('');
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Custom Layout List */}
            {customLayouts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No custom layouts saved yet
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {customLayouts.map((layout) => {
                  const isActive = activeLayoutId === layout.id;
                  return (
                    <div
                      key={layout.id}
                      className={`relative p-4 rounded-lg border-2 transition-all ${
                        isActive
                          ? 'border-primary-600 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}

                      <button
                        onClick={() => handleApplyLayout(layout.id)}
                        className="w-full text-left mb-2"
                      >
                        <div className="font-bold text-gray-900 mb-1">{layout.name}</div>
                        {layout.description && (
                          <div className="text-xs text-gray-600 mb-2">{layout.description}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          {Object.keys(layout.panels).length} panels
                        </div>
                      </button>

                      <button
                        onClick={() => handleDeleteLayout(layout.id)}
                        className="absolute bottom-2 right-2 p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                        title="Delete layout"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 flex justify-between">
            <button
              onClick={handleResetToDefaults}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
            >
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
