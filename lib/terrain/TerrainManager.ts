/**
 * TerrainManager - Heightmap-based terrain system
 * Manages terrain elevation data and editing operations
 */

export interface TerrainConfig {
  size: number;           // World-space size of terrain (e.g., 30 units)
  resolution: number;     // Heightmap resolution (e.g., 64x64)
  maxHeight: number;      // Maximum elevation (e.g., 10 units)
  minHeight: number;      // Minimum elevation (e.g., -5 units)
}

export interface BrushConfig {
  size: number;           // Brush radius in world units
  strength: number;       // Brush strength (0-1)
  falloff: number;        // Falloff curve (0-1, higher = softer edges)
}

export type TerrainTool = 'raise' | 'lower' | 'smooth' | 'flatten' | 'none';

export class TerrainManager {
  private config: TerrainConfig;
  private heightmap: Float32Array;
  private onTerrainChange?: () => void;
  // Bounding box (heightmap index space) of vertices changed since the last
  // consumeDirtyRegion(); lets the renderer update only the touched region.
  private dirtyRegion: { minX: number; maxX: number; minZ: number; maxZ: number } | null = null;

  constructor(config: Partial<TerrainConfig> = {}, onTerrainChange?: () => void) {
    this.config = {
      size: 30,
      resolution: 64,
      maxHeight: 10,
      minHeight: -2,
      ...config,
    };

    // Initialize flat heightmap
    const totalVertices = (this.config.resolution + 1) ** 2;
    this.heightmap = new Float32Array(totalVertices).fill(0);

    this.onTerrainChange = onTerrainChange;
    this.markAllDirty();
  }

  /**
   * Get terrain configuration
   */
  public getConfig(): TerrainConfig {
    return { ...this.config };
  }

  /**
   * Update terrain configuration
   */
  public updateConfig(config: Partial<TerrainConfig>): void {
    Object.assign(this.config, config);

    // If resolution changed, rebuild heightmap
    if (config.resolution) {
      const totalVertices = (this.config.resolution + 1) ** 2;
      const oldHeightmap = this.heightmap;
      this.heightmap = new Float32Array(totalVertices).fill(0);

      // Resample old heightmap if it exists
      // For now, just reset to flat
    }

    this.markAllDirty();
    this.notifyChange();
  }

  /**
   * Get heightmap data (readonly)
   */
  public getHeightmap(): Float32Array {
    return this.heightmap;
  }

  /**
   * Get height at world position (x, z)
   */
  public getHeightAt(worldX: number, worldZ: number): number {
    const { size, resolution } = this.config;
    const halfSize = size / 2;

    // Convert world position to heightmap coordinates
    const u = (worldX + halfSize) / size; // 0-1
    const v = (worldZ + halfSize) / size; // 0-1

    // Clamp to terrain bounds
    if (u < 0 || u > 1 || v < 0 || v > 1) return 0;

    // Bilinear interpolation
    const x = u * resolution;
    const z = v * resolution;
    const x0 = Math.floor(x);
    const z0 = Math.floor(z);
    const x1 = Math.min(x0 + 1, resolution);
    const z1 = Math.min(z0 + 1, resolution);

    const fx = x - x0;
    const fz = z - z0;

    const h00 = this.getHeightAtIndex(x0, z0);
    const h10 = this.getHeightAtIndex(x1, z0);
    const h01 = this.getHeightAtIndex(x0, z1);
    const h11 = this.getHeightAtIndex(x1, z1);

    // Bilinear interpolation
    const h0 = h00 * (1 - fx) + h10 * fx;
    const h1 = h01 * (1 - fx) + h11 * fx;
    return h0 * (1 - fz) + h1 * fz;
  }

  /**
   * Apply brush at world position
   */
  public applyBrush(
    worldX: number,
    worldZ: number,
    tool: TerrainTool,
    brush: BrushConfig
  ): void {
    if (tool === 'none') return;

    const { size, resolution, maxHeight, minHeight } = this.config;
    const halfSize = size / 2;

    // Convert brush size to heightmap space
    const brushRadiusInCells = (brush.size / size) * resolution;

    // Get center in heightmap coordinates
    const centerU = (worldX + halfSize) / size;
    const centerV = (worldZ + halfSize) / size;
    const centerX = centerU * resolution;
    const centerZ = centerV * resolution;

    // Calculate affected area
    const minX = Math.max(0, Math.floor(centerX - brushRadiusInCells));
    const maxX = Math.min(resolution, Math.ceil(centerX + brushRadiusInCells));
    const minZ = Math.max(0, Math.floor(centerZ - brushRadiusInCells));
    const maxZ = Math.min(resolution, Math.ceil(centerZ + brushRadiusInCells));

    // Apply tool to each vertex in brush radius
    for (let z = minZ; z <= maxZ; z++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - centerX;
        const dz = z - centerZ;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance > brushRadiusInCells) continue;

        // Calculate brush influence with falloff
        const influence = this.calculateBrushInfluence(
          distance,
          brushRadiusInCells,
          brush.falloff
        );

        const strength = brush.strength * influence;
        const currentHeight = this.getHeightAtIndex(x, z);

        let newHeight = currentHeight;

        switch (tool) {
          case 'raise':
            newHeight = currentHeight + strength * 0.1;
            break;
          case 'lower':
            newHeight = currentHeight - strength * 0.1;
            break;
          case 'smooth':
            newHeight = this.smoothHeight(x, z, currentHeight, strength);
            break;
          case 'flatten':
            newHeight = currentHeight * (1 - strength) + 0 * strength;
            break;
        }

        // Clamp to min/max height
        newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

        this.setHeightAtIndex(x, z, newHeight);
      }
    }

    this.markDirty(minX, maxX, minZ, maxZ);
    this.notifyChange();
  }

  /**
   * Calculate brush influence with falloff
   */
  private calculateBrushInfluence(
    distance: number,
    radius: number,
    falloff: number
  ): number {
    if (distance >= radius) return 0;

    const normalized = distance / radius;

    // Smooth falloff curve
    const falloffCurve = Math.pow(1 - normalized, 2 + falloff * 4);

    return falloffCurve;
  }

  /**
   * Smooth height at position
   */
  private smoothHeight(x: number, z: number, currentHeight: number, strength: number): number {
    const { resolution } = this.config;
    let sum = currentHeight;
    let count = 1;

    // Average with neighbors
    const offsets = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];

    for (const [dx, dz] of offsets) {
      const nx = x + dx;
      const nz = z + dz;
      if (nx >= 0 && nx <= resolution && nz >= 0 && nz <= resolution) {
        sum += this.getHeightAtIndex(nx, nz);
        count++;
      }
    }

    const avgHeight = sum / count;
    return currentHeight * (1 - strength) + avgHeight * strength;
  }

  /**
   * Get height at heightmap index
   */
  private getHeightAtIndex(x: number, z: number): number {
    const resolution = this.config.resolution + 1;
    const index = z * resolution + x;
    return this.heightmap[index] || 0;
  }

  /**
   * Set height at heightmap index
   */
  private setHeightAtIndex(x: number, z: number, height: number): void {
    const resolution = this.config.resolution + 1;
    const index = z * resolution + x;
    this.heightmap[index] = height;
  }

  /**
   * Reset terrain to flat
   */
  public reset(): void {
    this.heightmap.fill(0);
    this.markAllDirty();
    this.notifyChange();
  }

  /**
   * Import heightmap data
   */
  public importHeightmap(data: Float32Array): boolean {
    const expectedLength = (this.config.resolution + 1) ** 2;
    if (data.length !== expectedLength) {
      console.error(`Heightmap size mismatch: expected ${expectedLength}, got ${data.length}`);
      return false;
    }

    this.heightmap.set(data);
    this.markAllDirty();
    this.notifyChange();
    return true;
  }

  /**
   * Export heightmap data
   */
  public exportHeightmap(): Float32Array {
    return new Float32Array(this.heightmap);
  }

  /**
   * Create random terrain for testing
   */
  public generateRandomTerrain(amplitude: number = 2): void {
    const { resolution } = this.config;

    for (let z = 0; z <= resolution; z++) {
      for (let x = 0; x <= resolution; x++) {
        // Simple noise
        const noise = (Math.random() - 0.5) * amplitude;
        this.setHeightAtIndex(x, z, noise);
      }
    }

    // Smooth it out
    for (let i = 0; i < 3; i++) {
      for (let z = 1; z < resolution; z++) {
        for (let x = 1; x < resolution; x++) {
          const smoothed = this.smoothHeight(x, z, this.getHeightAtIndex(x, z), 0.5);
          this.setHeightAtIndex(x, z, smoothed);
        }
      }
    }

    this.markAllDirty();
    this.notifyChange();
  }

  /**
   * Get terrain statistics
   */
  public getStats(): {
    minHeight: number;
    maxHeight: number;
    avgHeight: number;
  } {
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;

    for (let i = 0; i < this.heightmap.length; i++) {
      const h = this.heightmap[i];
      min = Math.min(min, h);
      max = Math.max(max, h);
      sum += h;
    }

    return {
      minHeight: min,
      maxHeight: max,
      avgHeight: sum / this.heightmap.length,
    };
  }

  /**
   * Notify terrain change
   */
  private notifyChange(): void {
    this.onTerrainChange?.();
  }

  /**
   * Expand the pending dirty region to include the given index-space box.
   */
  private markDirty(minX: number, maxX: number, minZ: number, maxZ: number): void {
    const { resolution } = this.config;
    minX = Math.max(0, Math.min(resolution, minX));
    maxX = Math.max(0, Math.min(resolution, maxX));
    minZ = Math.max(0, Math.min(resolution, minZ));
    maxZ = Math.max(0, Math.min(resolution, maxZ));

    if (!this.dirtyRegion) {
      this.dirtyRegion = { minX, maxX, minZ, maxZ };
    } else {
      this.dirtyRegion.minX = Math.min(this.dirtyRegion.minX, minX);
      this.dirtyRegion.maxX = Math.max(this.dirtyRegion.maxX, maxX);
      this.dirtyRegion.minZ = Math.min(this.dirtyRegion.minZ, minZ);
      this.dirtyRegion.maxZ = Math.max(this.dirtyRegion.maxZ, maxZ);
    }
  }

  /**
   * Mark the whole heightmap dirty (reset/generate/import/config change).
   */
  private markAllDirty(): void {
    const { resolution } = this.config;
    this.markDirty(0, resolution, 0, resolution);
  }

  /**
   * Return and clear the pending dirty region (null if nothing changed).
   */
  public consumeDirtyRegion(): { minX: number; maxX: number; minZ: number; maxZ: number } | null {
    const region = this.dirtyRegion;
    this.dirtyRegion = null;
    return region;
  }
}
