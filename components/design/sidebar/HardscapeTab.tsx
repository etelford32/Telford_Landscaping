/**
 * HardscapeTab - Hardscape management and quick actions
 * Shows hardscape structures and provides quick preset application
 */

"use client";

import { Building2, Plus, Package, Info } from 'lucide-react';

interface HardscapeTabProps {
  hardscapeCount: number;
  onOpenHardscapeToolbox: () => void;
  onOpenPresets: () => void;
  selectedHouseId: string | null;
}

export default function HardscapeTab({
  hardscapeCount,
  onOpenHardscapeToolbox,
  onOpenPresets,
  selectedHouseId,
}: HardscapeTabProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Quick Stats */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Hardscape Overview</h3>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-900">{hardscapeCount}</div>
            <div className="text-sm text-orange-700">Hardscape Structures</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>

        <div className="space-y-2">
          {/* Add Hardscape Button */}
          <button
            onClick={onOpenHardscapeToolbox}
            className="w-full flex items-center gap-3 p-4 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold">Add Hardscape</div>
              <div className="text-xs text-orange-100">Patios, walls, fences, paths</div>
            </div>
          </button>

          {/* Apply Presets Button */}
          <button
            onClick={onOpenPresets}
            disabled={!selectedHouseId}
            className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all shadow-md ${
              selectedHouseId
                ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white hover:shadow-lg'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              selectedHouseId ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              <Package className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <div className="font-semibold">Quick Presets</div>
              <div className={`text-xs ${selectedHouseId ? 'text-yellow-100' : 'text-gray-400'}`}>
                {selectedHouseId ? 'Add complete layouts' : 'Select a house first'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Tips */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Hardscape Tips</h3>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="text-xs text-gray-600 space-y-2">
            <p>
              <strong>Patios:</strong> Great for entertaining areas at entrances or backyards
            </p>
            <p>
              <strong>Walls:</strong> Use retaining walls for slopes and elevation changes
            </p>
            <p>
              <strong>Fences:</strong> Define property boundaries and create privacy
            </p>
            <p>
              <strong>Paths:</strong> Connect different areas of your landscape
            </p>
          </div>
        </div>
      </div>

      {/* Popular Combinations */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Popular Combinations</h3>

        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
            <span className="text-gray-400">•</span>
            <span className="text-gray-700">
              <strong>Front Entry:</strong> Patio + Path + Low fence
            </span>
          </div>
          <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
            <span className="text-gray-400">•</span>
            <span className="text-gray-700">
              <strong>Backyard Oasis:</strong> Deck + Patio + Privacy fence
            </span>
          </div>
          <div className="flex items-start gap-2 p-2 bg-gray-50 rounded">
            <span className="text-gray-400">•</span>
            <span className="text-gray-700">
              <strong>Side Yard:</strong> DG path + Retaining wall
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
