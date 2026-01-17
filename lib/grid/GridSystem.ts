/**
 * Unified Grid System
 * Provides consistent grid configuration and snapping across the design app
 */

export interface GridConfig {
  size: number; // Total grid size in feet
  cellSize: number; // Size of each grid cell
  divisions: number; // Number of major divisions
  subDivisions: number; // Subdivisions within each cell
  snapEnabled: boolean; // Whether snapping is enabled
  snapTolerance: number; // Distance threshold for snapping
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  size: 30,
  cellSize: 1,
  divisions: 30,
  subDivisions: 5,
  snapEnabled: true,
  snapTolerance: 0.1
};

/**
 * Grid snapping utilities
 */
export class GridSnap {
  private config: GridConfig;

  constructor(config: GridConfig = DEFAULT_GRID_CONFIG) {
    this.config = config;
  }

  /**
   * Snap a single value to the grid
   */
  snap(value: number, gridSize?: number): number {
    const size = gridSize ?? this.config.cellSize;
    if (!this.config.snapEnabled) return value;
    return Math.round(value / size) * size;
  }

  /**
   * Snap a 2D point to the grid
   */
  snap2D(x: number, z: number, gridSize?: number): { x: number; z: number } {
    return {
      x: this.snap(x, gridSize),
      z: this.snap(z, gridSize)
    };
  }

  /**
   * Snap a 3D point to the grid
   */
  snap3D(
    x: number,
    y: number,
    z: number,
    gridSize?: number
  ): { x: number; y: number; z: number } {
    return {
      x: this.snap(x, gridSize),
      y: this.snap(y, gridSize),
      z: this.snap(z, gridSize)
    };
  }

  /**
   * Snap to subdivision grid
   */
  snapToSubGrid(value: number): number {
    const subGridSize = this.config.cellSize / this.config.subDivisions;
    return this.snap(value, subGridSize);
  }

  /**
   * Snap 2D point to subdivision grid
   */
  snapToSubGrid2D(x: number, z: number): { x: number; z: number } {
    const subGridSize = this.config.cellSize / this.config.subDivisions;
    return {
      x: this.snap(x, subGridSize),
      z: this.snap(z, subGridSize)
    };
  }

  /**
   * Check if a value is close enough to snap
   */
  shouldSnap(value: number, targetValue: number): boolean {
    return Math.abs(value - targetValue) <= this.config.snapTolerance;
  }

  /**
   * Get the nearest grid line position
   */
  getNearestGridLine(value: number, gridSize?: number): number {
    const size = gridSize ?? this.config.cellSize;
    return Math.round(value / size) * size;
  }

  /**
   * Get all grid line positions within bounds
   */
  getGridLines(min: number, max: number, gridSize?: number): number[] {
    const size = gridSize ?? this.config.cellSize;
    const lines: number[] = [];
    const start = Math.floor(min / size) * size;
    const end = Math.ceil(max / size) * size;

    for (let pos = start; pos <= end; pos += size) {
      lines.push(pos);
    }

    return lines;
  }

  /**
   * Get subdivision lines within a cell
   */
  getSubDivisionLines(cellStart: number, cellEnd: number): number[] {
    const subSize = this.config.cellSize / this.config.subDivisions;
    const lines: number[] = [];

    for (let i = 1; i < this.config.subDivisions; i++) {
      lines.push(cellStart + i * subSize);
    }

    return lines;
  }

  /**
   * Update grid configuration
   */
  updateConfig(config: Partial<GridConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): GridConfig {
    return { ...this.config };
  }

  /**
   * Enable/disable snapping
   */
  setSnapEnabled(enabled: boolean): void {
    this.config.snapEnabled = enabled;
  }

  /**
   * Check if point is within grid bounds
   */
  isWithinBounds(x: number, z: number): boolean {
    const halfSize = this.config.size / 2;
    return (
      x >= -halfSize &&
      x <= halfSize &&
      z >= -halfSize &&
      z <= halfSize
    );
  }

  /**
   * Clamp point to grid bounds
   */
  clampToBounds(x: number, z: number): { x: number; z: number } {
    const halfSize = this.config.size / 2;
    return {
      x: Math.max(-halfSize, Math.min(halfSize, x)),
      z: Math.max(-halfSize, Math.min(halfSize, z))
    };
  }

  /**
   * Convert screen coordinates to grid coordinates
   * Useful for drag-and-drop from 2D canvas
   */
  screenToGrid(
    screenX: number,
    screenY: number,
    canvasWidth: number,
    canvasHeight: number
  ): { x: number; z: number } {
    // Convert screen coordinates to normalized device coordinates (-1 to 1)
    const x = ((screenX / canvasWidth) * 2 - 1) * (this.config.size / 2);
    const z = ((screenY / canvasHeight) * 2 - 1) * (this.config.size / 2);

    return this.snap2D(x, z);
  }

  /**
   * Get grid cell at position
   */
  getGridCell(x: number, z: number): { cellX: number; cellZ: number } {
    return {
      cellX: Math.floor(x / this.config.cellSize),
      cellZ: Math.floor(z / this.config.cellSize)
    };
  }

  /**
   * Get cell center position
   */
  getCellCenter(cellX: number, cellZ: number): { x: number; z: number } {
    return {
      x: cellX * this.config.cellSize + this.config.cellSize / 2,
      z: cellZ * this.config.cellSize + this.config.cellSize / 2
    };
  }

  /**
   * Calculate distance between two grid points
   */
  distance(x1: number, z1: number, x2: number, z2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
  }

  /**
   * Calculate grid area (in square feet)
   */
  calculateArea(points: Array<{ x: number; z: number }>): number {
    if (points.length < 3) return 0;

    // Shoelace formula
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].x * points[j].z;
      area -= points[j].x * points[i].z;
    }

    return Math.abs(area / 2);
  }
}

/**
 * Singleton instance for global grid configuration
 */
let globalGridSnap: GridSnap | null = null;

export function getGlobalGridSnap(): GridSnap {
  if (!globalGridSnap) {
    globalGridSnap = new GridSnap();
  }
  return globalGridSnap;
}

export function setGlobalGridConfig(config: Partial<GridConfig>): void {
  getGlobalGridSnap().updateConfig(config);
}

/**
 * Helper functions for backward compatibility
 */
export function snapToGrid(value: number, gridSize: number = 1): number {
  return getGlobalGridSnap().snap(value, gridSize);
}

export function snapToGrid2D(x: number, z: number, gridSize: number = 1): { x: number; z: number } {
  return getGlobalGridSnap().snap2D(x, z, gridSize);
}

export function snapToGrid3D(
  x: number,
  y: number,
  z: number,
  gridSize: number = 1
): { x: number; y: number; z: number } {
  return getGlobalGridSnap().snap3D(x, y, z, gridSize);
}
