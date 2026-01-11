/**
 * Edit Mode Controller
 * Manages different editing modes and their behaviors
 */

export type EditMode = 'select' | 'move' | 'scale' | 'rotate' | 'vertex' | 'measure';

export type SnapMode = 'none' | 'grid' | 'vertex' | 'edge' | 'face';

export interface EditModeSettings {
  mode: EditMode;
  snapMode: SnapMode;
  snapDistance: number; // in feet
  gridSize: number; // in feet
  showGrid: boolean;
  showMeasurements: boolean;
  showGizmo: boolean;
  showVertices: boolean;
  precisionMode: boolean;
  unit: 'feet' | 'inches' | 'meters';
}

export class EditModeController {
  private settings: EditModeSettings;
  private listeners: ((settings: EditModeSettings) => void)[] = [];

  constructor(initialSettings?: Partial<EditModeSettings>) {
    this.settings = {
      mode: 'select',
      snapMode: 'grid',
      snapDistance: 0.5,
      gridSize: 1,
      showGrid: true,
      showMeasurements: false,
      showGizmo: false,
      showVertices: false,
      precisionMode: false,
      unit: 'feet',
      ...initialSettings,
    };
  }

  getSettings(): EditModeSettings {
    return { ...this.settings };
  }

  setMode(mode: EditMode): void {
    this.settings.mode = mode;

    // Auto-enable related features based on mode
    switch (mode) {
      case 'move':
      case 'scale':
      case 'rotate':
        this.settings.showGizmo = true;
        break;
      case 'vertex':
        this.settings.showVertices = true;
        this.settings.precisionMode = true;
        break;
      case 'measure':
        this.settings.showMeasurements = true;
        break;
      default:
        this.settings.showGizmo = false;
        this.settings.showVertices = false;
    }

    this.notifyListeners();
  }

  setSnapMode(snapMode: SnapMode): void {
    this.settings.snapMode = snapMode;
    this.notifyListeners();
  }

  toggleGrid(): void {
    this.settings.showGrid = !this.settings.showGrid;
    this.notifyListeners();
  }

  toggleMeasurements(): void {
    this.settings.showMeasurements = !this.settings.showMeasurements;
    this.notifyListeners();
  }

  togglePrecisionMode(): void {
    this.settings.precisionMode = !this.settings.precisionMode;
    this.notifyListeners();
  }

  setGridSize(size: number): void {
    this.settings.gridSize = Math.max(0.1, size);
    this.notifyListeners();
  }

  setSnapDistance(distance: number): void {
    this.settings.snapDistance = Math.max(0.01, distance);
    this.notifyListeners();
  }

  setUnit(unit: 'feet' | 'inches' | 'meters'): void {
    this.settings.unit = unit;
    this.notifyListeners();
  }

  /**
   * Snap a value to the nearest grid point
   */
  snapToGrid(value: number): number {
    if (this.settings.snapMode !== 'grid') return value;
    return Math.round(value / this.settings.gridSize) * this.settings.gridSize;
  }

  /**
   * Snap a 3D position to the grid
   */
  snapPositionToGrid(x: number, y: number, z: number): [number, number, number] {
    if (this.settings.snapMode !== 'grid') return [x, y, z];

    return [
      this.snapToGrid(x),
      this.snapToGrid(y),
      this.snapToGrid(z),
    ];
  }

  /**
   * Check if a position is close enough to snap to another position
   */
  shouldSnapTo(value: number, target: number): boolean {
    return Math.abs(value - target) < this.settings.snapDistance;
  }

  /**
   * Find the nearest snap point from a list of targets
   */
  findNearestSnapPoint(
    value: number,
    targets: number[]
  ): number | null {
    if (this.settings.snapMode === 'none') return null;

    let nearest: number | null = null;
    let minDistance = this.settings.snapDistance;

    for (const target of targets) {
      const distance = Math.abs(value - target);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = target;
      }
    }

    return nearest;
  }

  /**
   * Convert between units
   */
  convertValue(value: number, from: 'feet' | 'inches' | 'meters', to: 'feet' | 'inches' | 'meters'): number {
    // Convert to feet first
    let inFeet = value;
    if (from === 'inches') inFeet = value / 12;
    if (from === 'meters') inFeet = value * 3.28084;

    // Convert from feet to target
    if (to === 'inches') return inFeet * 12;
    if (to === 'meters') return inFeet / 3.28084;
    return inFeet;
  }

  /**
   * Format a value for display with current unit
   */
  formatValue(value: number, precision: number = 2): string {
    const converted = this.convertValue(value, 'feet', this.settings.unit);
    return `${converted.toFixed(precision)} ${this.getUnitAbbreviation()}`;
  }

  getUnitAbbreviation(): string {
    switch (this.settings.unit) {
      case 'feet': return 'ft';
      case 'inches': return 'in';
      case 'meters': return 'm';
    }
  }

  /**
   * Subscribe to settings changes
   */
  subscribe(listener: (settings: EditModeSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getSettings()));
  }
}

// Singleton instance
let instance: EditModeController | null = null;

export function getEditModeController(): EditModeController {
  if (!instance) {
    instance = new EditModeController();
  }
  return instance;
}

export function createEditModeController(settings?: Partial<EditModeSettings>): EditModeController {
  return new EditModeController(settings);
}
