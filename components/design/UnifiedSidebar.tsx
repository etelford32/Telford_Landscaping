/**
 * UnifiedSidebar - Left sidebar with tabbed interface
 * Combines Objects, Layers, and Settings into one organized panel
 */

"use client";

import { useState } from 'react';
import {
  List,
  Layers,
  Settings,
  Mountain,
  Building2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import ObjectsTab from './sidebar/ObjectsTab';
import LayersTab from './sidebar/LayersTab';
import SettingsTab from './sidebar/SettingsTab';
import TerrainTab from './sidebar/TerrainTab';
import HardscapeTab from './sidebar/HardscapeTab';
import { TerrainConfig } from '@/lib/terrain/TerrainManager';

export type SidebarTab = 'objects' | 'hardscape' | 'terrain' | 'layers' | 'settings';

interface UnifiedSidebarProps {
  // Objects tab props
  plants: any[];
  structures: any[];
  houses: any[];
  selectedPlantId: string | null;
  selectedStructureId: string | null;
  selectedHouseId: string | null;
  onSelectPlant: (id: string | null) => void;
  onSelectStructure: (id: string | null) => void;
  onSelectHouse: (id: string | null) => void;
  onDeletePlant?: (id: string) => void;
  onDeleteStructure?: (id: string) => void;
  onDeleteHouse?: (id: string) => void;
  onDuplicatePlant?: (id: string) => void;
  onDuplicateStructure?: (id: string) => void;

  // Settings tab props
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

  // Terrain tab props
  terrainConfig?: TerrainConfig;
  terrainStats?: {
    minHeight: number;
    maxHeight: number;
    avgHeight: number;
  };
  onTerrainConfigChange?: (config: Partial<TerrainConfig>) => void;

  // Hardscape tab props
  onOpenHardscapeToolbox?: () => void;
  onOpenHardscapePresets?: () => void;

  // Layers tab props (future implementation)
  layers?: any[];
  onLayerChange?: (layers: any[]) => void;

  // UI state
  visible?: boolean;
  defaultTab?: SidebarTab;
  onClose?: () => void;
}

export default function UnifiedSidebar({
  plants,
  structures,
  houses,
  selectedPlantId,
  selectedStructureId,
  selectedHouseId,
  onSelectPlant,
  onSelectStructure,
  onSelectHouse,
  onDeletePlant,
  onDeleteStructure,
  onDeleteHouse,
  onDuplicatePlant,
  onDuplicateStructure,
  ground,
  onGroundChange,
  terrainConfig,
  terrainStats,
  onTerrainConfigChange,
  onOpenHardscapeToolbox,
  onOpenHardscapePresets,
  layers = [],
  onLayerChange,
  visible = true,
  defaultTab = 'objects',
  onClose,
}: UnifiedSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>(defaultTab);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!visible) return null;

  const tabs = [
    { id: 'objects' as SidebarTab, label: 'Objects', icon: List },
    { id: 'hardscape' as SidebarTab, label: 'Hardscape', icon: Building2 },
    { id: 'terrain' as SidebarTab, label: 'Terrain', icon: Mountain },
    { id: 'layers' as SidebarTab, label: 'Layers', icon: Layers },
    { id: 'settings' as SidebarTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`fixed left-0 top-0 h-screen bg-white/95 backdrop-blur-sm shadow-2xl z-40 transition-all duration-300 ${
      isCollapsed ? 'w-12' : 'w-80'
    }`}>
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-white rounded-r-lg shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors z-50"
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {!isCollapsed && (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Design Tools</h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  title="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto h-[calc(100vh-120px)]">
            {activeTab === 'objects' && (
              <ObjectsTab
                plants={plants}
                structures={structures}
                houses={houses}
                selectedPlantId={selectedPlantId}
                selectedStructureId={selectedStructureId}
                selectedHouseId={selectedHouseId}
                onSelectPlant={onSelectPlant}
                onSelectStructure={onSelectStructure}
                onSelectHouse={onSelectHouse}
                onDeletePlant={onDeletePlant}
                onDeleteStructure={onDeleteStructure}
                onDeleteHouse={onDeleteHouse}
                onDuplicatePlant={onDuplicatePlant}
                onDuplicateStructure={onDuplicateStructure}
              />
            )}

            {activeTab === 'hardscape' && (
              <HardscapeTab
                hardscapeCount={structures.length}
                selectedHouseId={selectedHouseId}
                onOpenHardscapeToolbox={onOpenHardscapeToolbox || (() => {})}
                onOpenPresets={onOpenHardscapePresets || (() => {})}
              />
            )}

            {activeTab === 'terrain' && terrainConfig && (
              <TerrainTab
                config={terrainConfig}
                stats={terrainStats}
                onConfigChange={onTerrainConfigChange}
              />
            )}

            {activeTab === 'layers' && (
              <LayersTab
                layers={layers}
                onLayerChange={onLayerChange}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                ground={ground}
                onGroundChange={onGroundChange}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
