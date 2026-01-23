/**
 * LayersTab - Layer management system
 * Allows grouping and organizing objects (future implementation)
 */

"use client";

import { Layers, Plus, Eye, Lock } from 'lucide-react';

interface LayersTabProps {
  layers?: any[];
  onLayerChange?: (layers: any[]) => void;
}

export default function LayersTab({ layers = [], onLayerChange }: LayersTabProps) {
  return (
    <div className="p-4">
      {/* Coming Soon Message */}
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <Layers className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Layer System</h3>
        <p className="text-sm text-gray-600 max-w-xs mb-6">
          Organize your design into layers for better management. Group related objects,
          toggle visibility, and lock layers to prevent accidental edits.
        </p>

        {/* Preview of what layers will look like */}
        <div className="w-full max-w-sm space-y-2 opacity-50">
          <LayerPreview name="Ground & Terrain" visible={true} locked={false} />
          <LayerPreview name="Plants & Trees" visible={true} locked={false} />
          <LayerPreview name="Structures" visible={true} locked={false} />
          <LayerPreview name="Annotations" visible={false} locked={false} />
        </div>

        <div className="mt-6 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            This feature is coming soon. For now, use the Objects tab to manage your scene.
          </p>
        </div>
      </div>
    </div>
  );
}

// Layer Preview Component (for demonstration)
function LayerPreview({
  name,
  visible,
  locked,
}: {
  name: string;
  visible: boolean;
  locked: boolean;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
      <div className="w-4 h-4 bg-primary-400 rounded" />
      <span className="flex-1 text-sm text-gray-700">{name}</span>
      <button className="p-1 hover:bg-gray-200 rounded transition-colors">
        <Eye className={`w-3 h-3 ${visible ? 'text-gray-600' : 'text-gray-300'}`} />
      </button>
      <button className="p-1 hover:bg-gray-200 rounded transition-colors">
        <Lock className={`w-3 h-3 ${locked ? 'text-gray-600' : 'text-gray-300'}`} />
      </button>
    </div>
  );
}
