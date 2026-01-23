/**
 * PanelManager - Centralized state management for all UI panels
 * Handles panel positioning, sizing, visibility, and workspace layouts
 */

export interface PanelState {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isVisible: boolean;
  zIndex: number;
  isDocked: boolean;
  dockPosition?: 'left' | 'right' | 'top' | 'bottom';
}

export interface WorkspaceLayout {
  id: string;
  name: string;
  description: string;
  panels: Record<string, PanelState>;
}

export const DEFAULT_PANELS: Record<string, Partial<PanelState>> = {
  camera: {
    position: { x: window.innerWidth - 420, y: 80 },
    size: { width: 400, height: 520 },
    isMinimized: false,
    isVisible: true,
    zIndex: 100,
    isDocked: false,
  },
  sidebar: {
    position: { x: 0, y: 0 },
    size: { width: 320, height: window.innerHeight },
    isMinimized: false,
    isVisible: true,
    zIndex: 40,
    isDocked: true,
    dockPosition: 'left',
  },
  properties: {
    position: { x: window.innerWidth - 340, y: 80 },
    size: { width: 320, height: 600 },
    isMinimized: false,
    isVisible: false,
    zIndex: 50,
    isDocked: true,
    dockPosition: 'right',
  },
  terrain: {
    position: { x: 16, y: window.innerHeight - 520 },
    size: { width: 280, height: 400 },
    isMinimized: false,
    isVisible: false,
    zIndex: 30,
    isDocked: false,
  },
  designHub: {
    position: { x: 0, y: window.innerHeight - 140 },
    size: { width: window.innerWidth, height: 140 },
    isMinimized: false,
    isVisible: true,
    zIndex: 40,
    isDocked: true,
    dockPosition: 'bottom',
  },
};

export const PRESET_LAYOUTS: WorkspaceLayout[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Simple layout with essential controls only',
    panels: {
      camera: {
        id: 'camera',
        position: { x: window.innerWidth - 420, y: 80 },
        size: { width: 400, height: 420 },
        isMinimized: false,
        isVisible: true,
        zIndex: 100,
        isDocked: false,
      },
      sidebar: {
        id: 'sidebar',
        position: { x: 0, y: 0 },
        size: { width: 280, height: window.innerHeight },
        isMinimized: false,
        isVisible: true,
        zIndex: 40,
        isDocked: true,
        dockPosition: 'left',
      },
      designHub: {
        id: 'designHub',
        position: { x: 0, y: window.innerHeight - 100 },
        size: { width: window.innerWidth, height: 100 },
        isMinimized: false,
        isVisible: true,
        zIndex: 40,
        isDocked: true,
        dockPosition: 'bottom',
      },
    },
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Full layout with all panels visible',
    panels: {
      camera: {
        id: 'camera',
        position: { x: window.innerWidth - 420, y: 80 },
        size: { width: 400, height: 520 },
        isMinimized: false,
        isVisible: true,
        zIndex: 100,
        isDocked: false,
      },
      sidebar: {
        id: 'sidebar',
        position: { x: 0, y: 0 },
        size: { width: 320, height: window.innerHeight },
        isMinimized: false,
        isVisible: true,
        zIndex: 40,
        isDocked: true,
        dockPosition: 'left',
      },
      properties: {
        id: 'properties',
        position: { x: window.innerWidth - 340, y: 80 },
        size: { width: 320, height: 600 },
        isMinimized: false,
        isVisible: true,
        zIndex: 50,
        isDocked: true,
        dockPosition: 'right',
      },
      terrain: {
        id: 'terrain',
        position: { x: 16, y: window.innerHeight - 520 },
        size: { width: 280, height: 400 },
        isMinimized: false,
        isVisible: true,
        zIndex: 30,
        isDocked: false,
      },
      designHub: {
        id: 'designHub',
        position: { x: 0, y: window.innerHeight - 140 },
        size: { width: window.innerWidth, height: 140 },
        isMinimized: false,
        isVisible: true,
        zIndex: 40,
        isDocked: true,
        dockPosition: 'bottom',
      },
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Maximum canvas space, minimal UI',
    panels: {
      camera: {
        id: 'camera',
        position: { x: window.innerWidth - 380, y: 16 },
        size: { width: 360, height: 400 },
        isMinimized: true,
        isVisible: true,
        zIndex: 100,
        isDocked: false,
      },
      sidebar: {
        id: 'sidebar',
        position: { x: 0, y: 0 },
        size: { width: 60, height: window.innerHeight },
        isMinimized: true,
        isVisible: true,
        zIndex: 40,
        isDocked: true,
        dockPosition: 'left',
      },
      designHub: {
        id: 'designHub',
        position: { x: 0, y: window.innerHeight - 60 },
        size: { width: window.innerWidth, height: 60 },
        isMinimized: true,
        isVisible: true,
        zIndex: 40,
        isDocked: true,
        dockPosition: 'bottom',
      },
    },
  },
];

export class PanelManager {
  private panels: Map<string, PanelState> = new Map();
  private listeners: Set<(panels: Map<string, PanelState>) => void> = new Set();
  private highestZIndex = 100;

  constructor() {
    this.initializeDefaults();
    this.loadFromLocalStorage();
  }

  private initializeDefaults() {
    Object.entries(DEFAULT_PANELS).forEach(([id, config]) => {
      this.panels.set(id, {
        id,
        position: config.position!,
        size: config.size!,
        isMinimized: config.isMinimized!,
        isVisible: config.isVisible!,
        zIndex: config.zIndex!,
        isDocked: config.isDocked!,
        dockPosition: config.dockPosition,
      });
    });
  }

  subscribe(listener: (panels: Map<string, PanelState>) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(new Map(this.panels)));
    this.saveToLocalStorage();
  }

  getPanel(id: string): PanelState | undefined {
    return this.panels.get(id);
  }

  getAllPanels(): Map<string, PanelState> {
    return new Map(this.panels);
  }

  updatePanel(id: string, updates: Partial<PanelState>) {
    const panel = this.panels.get(id);
    if (panel) {
      this.panels.set(id, { ...panel, ...updates });
      this.notify();
    }
  }

  toggleMinimize(id: string) {
    const panel = this.panels.get(id);
    if (panel) {
      this.updatePanel(id, { isMinimized: !panel.isMinimized });
    }
  }

  toggleVisibility(id: string) {
    const panel = this.panels.get(id);
    if (panel) {
      this.updatePanel(id, { isVisible: !panel.isVisible });
    }
  }

  bringToFront(id: string) {
    this.highestZIndex++;
    this.updatePanel(id, { zIndex: this.highestZIndex });
  }

  movePanel(id: string, position: { x: number; y: number }) {
    this.updatePanel(id, { position });
  }

  resizePanel(id: string, size: { width: number; height: number }) {
    this.updatePanel(id, { size });
  }

  dockPanel(id: string, position: 'left' | 'right' | 'top' | 'bottom') {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let newPosition: { x: number; y: number };
    let newSize: { width: number; height: number };

    switch (position) {
      case 'left':
        newPosition = { x: 0, y: 0 };
        newSize = { width: 320, height: windowHeight };
        break;
      case 'right':
        newPosition = { x: windowWidth - 320, y: 0 };
        newSize = { width: 320, height: windowHeight };
        break;
      case 'top':
        newPosition = { x: 0, y: 0 };
        newSize = { width: windowWidth, height: 80 };
        break;
      case 'bottom':
        newPosition = { x: 0, y: windowHeight - 140 };
        newSize = { width: windowWidth, height: 140 };
        break;
    }

    this.updatePanel(id, {
      position: newPosition,
      size: newSize,
      isDocked: true,
      dockPosition: position,
    });
  }

  undockPanel(id: string) {
    this.updatePanel(id, { isDocked: false, dockPosition: undefined });
  }

  applyLayout(layoutId: string) {
    const layout = PRESET_LAYOUTS.find((l) => l.id === layoutId);
    if (!layout) return;

    Object.entries(layout.panels).forEach(([id, state]) => {
      this.panels.set(id, state);
    });

    this.notify();
  }

  saveLayout(name: string, description: string): string {
    const id = `custom-${Date.now()}`;
    const layout: WorkspaceLayout = {
      id,
      name,
      description,
      panels: Object.fromEntries(this.panels),
    };

    const customLayouts = this.getCustomLayouts();
    customLayouts.push(layout);
    localStorage.setItem('workspace-custom-layouts', JSON.stringify(customLayouts));

    return id;
  }

  getCustomLayouts(): WorkspaceLayout[] {
    const stored = localStorage.getItem('workspace-custom-layouts');
    return stored ? JSON.parse(stored) : [];
  }

  deleteCustomLayout(id: string) {
    const customLayouts = this.getCustomLayouts().filter((l) => l.id !== id);
    localStorage.setItem('workspace-custom-layouts', JSON.stringify(customLayouts));
  }

  private saveToLocalStorage() {
    const state = Object.fromEntries(this.panels);
    localStorage.setItem('panel-state', JSON.stringify(state));
  }

  private loadFromLocalStorage() {
    const stored = localStorage.getItem('panel-state');
    if (stored) {
      try {
        const state = JSON.parse(stored);
        Object.entries(state).forEach(([id, panelState]) => {
          this.panels.set(id, panelState as PanelState);
        });
      } catch (error) {
        console.error('Failed to load panel state:', error);
      }
    }
  }

  resetToDefaults() {
    this.panels.clear();
    this.initializeDefaults();
    this.notify();
  }
}

// Singleton instance
export const panelManager = new PanelManager();
