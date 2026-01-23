/**
 * ModeManager - Centralized mode state management
 * Handles mode switching, mode-aware UI filtering, and keyboard shortcuts
 */

export type AppMode = 'design' | 'terrain' | 'camera' | 'hardscape' | 'view';

export interface ModeConfig {
  id: AppMode;
  name: string;
  description: string;
  icon: string;
  color: string;
  shortcut?: string;
  relevantPanels: string[];
  allowedEditModes: Array<'select' | 'move' | 'rotate' | 'scale'>;
}

export const MODE_CONFIGS: Record<AppMode, ModeConfig> = {
  design: {
    id: 'design',
    name: 'Design Mode',
    description: 'Place and edit objects, plants, and structures',
    icon: '✏️',
    color: '#3B82F6', // blue-600
    shortcut: '1',
    relevantPanels: ['sidebar', 'properties', 'designHub'],
    allowedEditModes: ['select', 'move', 'rotate', 'scale'],
  },
  terrain: {
    id: 'terrain',
    name: 'Terrain Mode',
    description: 'Sculpt and edit terrain elevation',
    icon: '⛰️',
    color: '#10B981', // green-600
    shortcut: '2',
    relevantPanels: ['terrain', 'sidebar'],
    allowedEditModes: ['select'],
  },
  hardscape: {
    id: 'hardscape',
    name: 'Hardscape Mode',
    description: 'Add walls, patios, fences, and paths',
    icon: '🧱',
    color: '#8B5CF6', // purple-600
    shortcut: '3',
    relevantPanels: ['sidebar', 'properties', 'designHub'],
    allowedEditModes: ['select', 'move', 'rotate', 'scale'],
  },
  camera: {
    id: 'camera',
    name: 'Camera Mode',
    description: 'Adjust camera position, FOV, and settings',
    icon: '📷',
    color: '#F59E0B', // yellow-600
    shortcut: '4',
    relevantPanels: ['camera'],
    allowedEditModes: [],
  },
  view: {
    id: 'view',
    name: 'View Mode',
    description: 'Presentation mode with minimal UI',
    icon: '👁️',
    color: '#6B7280', // gray-600
    shortcut: '5',
    relevantPanels: ['camera'],
    allowedEditModes: [],
  },
};

export class ModeManager {
  private currentMode: AppMode = 'design';
  private previousMode: AppMode = 'design';
  private listeners: Set<(mode: AppMode, previousMode: AppMode) => void> = new Set();

  constructor() {
    this.loadFromLocalStorage();
  }

  subscribe(listener: (mode: AppMode, previousMode: AppMode) => void) {
    this.listeners.add(listener);
    // Immediately call with current mode
    listener(this.currentMode, this.previousMode);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.currentMode, this.previousMode));
    this.saveToLocalStorage();
  }

  getCurrentMode(): AppMode {
    return this.currentMode;
  }

  getPreviousMode(): AppMode {
    return this.previousMode;
  }

  getModeConfig(mode?: AppMode): ModeConfig {
    return MODE_CONFIGS[mode || this.currentMode];
  }

  setMode(mode: AppMode) {
    if (mode === this.currentMode) return;

    this.previousMode = this.currentMode;
    this.currentMode = mode;
    this.notify();
  }

  toggleMode(mode: AppMode) {
    if (this.currentMode === mode) {
      // Return to previous mode
      this.setMode(this.previousMode);
    } else {
      this.setMode(mode);
    }
  }

  cycleMode() {
    const modes: AppMode[] = ['design', 'terrain', 'hardscape', 'camera', 'view'];
    const currentIndex = modes.indexOf(this.currentMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.setMode(modes[nextIndex]);
  }

  isPanelRelevant(panelId: string): boolean {
    const config = this.getModeConfig();
    return config.relevantPanels.includes(panelId);
  }

  isEditModeAllowed(editMode: 'select' | 'move' | 'rotate' | 'scale'): boolean {
    const config = this.getModeConfig();
    return config.allowedEditModes.includes(editMode);
  }

  getRelevantPanels(): string[] {
    return this.getModeConfig().relevantPanels;
  }

  getIrrelevantPanels(): string[] {
    const allPanels = ['sidebar', 'properties', 'designHub', 'terrain', 'camera'];
    const relevant = this.getRelevantPanels();
    return allPanels.filter((p) => !relevant.includes(p));
  }

  private saveToLocalStorage() {
    localStorage.setItem('app-mode', this.currentMode);
    localStorage.setItem('app-previous-mode', this.previousMode);
  }

  private loadFromLocalStorage() {
    const stored = localStorage.getItem('app-mode');
    if (stored && stored in MODE_CONFIGS) {
      this.currentMode = stored as AppMode;
    }

    const storedPrevious = localStorage.getItem('app-previous-mode');
    if (storedPrevious && storedPrevious in MODE_CONFIGS) {
      this.previousMode = storedPrevious as AppMode;
    }
  }

  resetToDefault() {
    this.currentMode = 'design';
    this.previousMode = 'design';
    this.notify();
  }
}

// Singleton instance
export const modeManager = new ModeManager();
