/**
 * ModeIndicator - Prominent mode indicator in canvas center bottom
 * Shows current mode with icon, name, description, and quick switch buttons
 */

"use client";

import { useState, useEffect } from 'react';
import {
  Pencil,
  Mountain,
  Building2,
  Camera,
  Eye,
  ChevronUp,
  Info,
} from 'lucide-react';
import { modeManager, AppMode, MODE_CONFIGS } from '@/lib/ui/ModeManager';

interface ModeIndicatorProps {
  compact?: boolean;
  showQuickSwitch?: boolean;
}

const MODE_ICONS: Record<AppMode, any> = {
  design: Pencil,
  terrain: Mountain,
  hardscape: Building2,
  camera: Camera,
  view: Eye,
};

export default function ModeIndicator({
  compact = false,
  showQuickSwitch = true,
}: ModeIndicatorProps) {
  const [currentMode, setCurrentMode] = useState<AppMode>(modeManager.getCurrentMode());
  const [previousMode, setPreviousMode] = useState<AppMode>(modeManager.getPreviousMode());
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const unsubscribe = modeManager.subscribe((mode, prev) => {
      setCurrentMode(mode);
      setPreviousMode(prev);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const config = MODE_CONFIGS[currentMode];
  const Icon = MODE_ICONS[currentMode];

  const handleModeSwitch = (mode: AppMode) => {
    modeManager.setMode(mode);
    setIsExpanded(false);
  };

  const handleCycleMode = () => {
    modeManager.cycleMode();
  };

  if (compact) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Current mode: ${config.name}. ${config.description}. Press ${config.shortcut} to switch or click to expand mode menu.`}
        aria-expanded={isExpanded}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-2xl transition-all cursor-pointer hover:scale-105"
        style={{ backgroundColor: config.color }}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        title={`${config.name} (Press ${config.shortcut} to switch)`}
      >
        <Icon className="w-5 h-5 text-white" aria-hidden="true" />
        <span className="text-sm font-bold text-white">{config.name}</span>
        {showQuickSwitch && (
          <ChevronUp
            className={`w-4 h-4 text-white transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      {/* Quick Switch Panel */}
      {isExpanded && showQuickSwitch && (
        <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-3 animate-in slide-in-from-bottom-2 duration-200">
          <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 text-center">
            Switch Mode
          </div>
          <div className="flex gap-2">
            {(Object.keys(MODE_CONFIGS) as AppMode[]).map((mode) => {
              const modeConfig = MODE_CONFIGS[mode];
              const ModeIcon = MODE_ICONS[mode];
              const isActive = mode === currentMode;

              return (
                <button
                  key={mode}
                  onClick={() => handleModeSwitch(mode)}
                  aria-label={`Switch to ${modeConfig.name}. ${modeConfig.description}. Press ${modeConfig.shortcut}.`}
                  aria-pressed={isActive}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gray-100 scale-105'
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    borderBottom: isActive ? `3px solid ${modeConfig.color}` : 'none',
                  }}
                  title={modeConfig.description}
                >
                  <ModeIcon
                    className="w-5 h-5"
                    style={{ color: isActive ? modeConfig.color : '#6B7280' }}
                  />
                  <span className="text-xs font-medium text-gray-700">
                    {modeConfig.name.replace(' Mode', '')}
                  </span>
                  {modeConfig.shortcut && (
                    <span className="text-xs text-gray-400 font-mono">
                      {modeConfig.shortcut}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Indicator */}
      <div className="relative">
        <div
          role="button"
          tabIndex={0}
          aria-label={`Current mode: ${config.name}. ${config.description}. Press ${config.shortcut} to switch modes or click to expand mode menu.`}
          aria-expanded={isExpanded}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl transition-all cursor-pointer hover:scale-105 border-2 border-white/50"
          style={{ backgroundColor: config.color }}
          onClick={() => setIsExpanded(!isExpanded)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }
          }}
        >
          {/* Mode Icon */}
          <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* Mode Info */}
          <div className="flex flex-col">
            <div className="text-lg font-bold text-white flex items-center gap-2">
              {config.name}
              {showQuickSwitch && (
                <ChevronUp
                  className={`w-4 h-4 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              )}
            </div>
            <div className="text-xs text-white/80">{config.description}</div>
          </div>

          {/* Shortcut Badge */}
          {config.shortcut && (
            <div className="ml-2 px-2 py-1 bg-white/20 rounded text-xs font-mono text-white font-bold">
              {config.shortcut}
            </div>
          )}

          {/* Info Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors ml-1"
            title="Mode details"
          >
            <Info className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Details Tooltip */}
        {showDetails && (
          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl max-w-xs animate-in fade-in duration-200">
            <div className="font-semibold mb-2">{config.name} Features:</div>
            <ul className="space-y-1 text-gray-300">
              <li>• Keyboard: Press <span className="font-mono font-bold">{config.shortcut}</span> to activate</li>
              <li>• Relevant panels: {config.relevantPanels.join(', ')}</li>
              <li>• Edit modes: {config.allowedEditModes.length > 0 ? config.allowedEditModes.join(', ') : 'View only'}</li>
              <li>• Other panels will dim automatically</li>
            </ul>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>

      {/* Cycle Mode Hint */}
      {!isExpanded && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap animate-pulse">
          Press <span className="font-mono font-bold">Tab</span> to cycle modes
        </div>
      )}
    </div>
  );
}
