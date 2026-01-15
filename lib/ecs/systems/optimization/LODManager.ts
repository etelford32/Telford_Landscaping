/**
 * LODManager - Optimized Level of Detail management
 *
 * Dynamically switches between high/medium/low detail models
 * based on camera distance to maintain smooth framerate
 */

import * as THREE from 'three';

/**
 * LOD level definition
 */
export interface LODLevel {
  distance: number;
  object: THREE.Object3D;
  label?: string; // For debugging
}

/**
 * LOD object wrapper
 */
export class LODObject {
  private entityId: string;
  private lod: THREE.LOD;
  private levels: LODLevel[] = [];
  private currentLevel: number = 0;

  constructor(entityId: string) {
    this.entityId = entityId;
    this.lod = new THREE.LOD();
    this.lod.userData.entityId = entityId;
  }

  /**
   * Add LOD level
   */
  addLevel(level: LODLevel): void {
    this.levels.push(level);
    this.lod.addLevel(level.object, level.distance);

    // Sort by distance (closest first)
    this.levels.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Remove LOD level
   */
  removeLevel(index: number): void {
    if (index < 0 || index >= this.levels.length) return;

    const level = this.levels[index];
    // Note: THREE.LOD doesn't have a removeLevel method
    // We'll need to rebuild the LOD object

    this.levels.splice(index, 1);
    this.rebuild();
  }

  /**
   * Rebuild LOD object (after removing levels)
   */
  private rebuild(): void {
    // Clear existing levels
    while (this.lod.children.length > 0) {
      this.lod.remove(this.lod.children[0]);
    }

    // Re-add levels
    for (const level of this.levels) {
      this.lod.addLevel(level.object, level.distance);
    }
  }

  /**
   * Get THREE.LOD object
   */
  getLOD(): THREE.LOD {
    return this.lod;
  }

  /**
   * Get entity ID
   */
  getEntityId(): string {
    return this.entityId;
  }

  /**
   * Get current LOD level
   */
  getCurrentLevel(): number {
    return this.currentLevel;
  }

  /**
   * Get level count
   */
  getLevelCount(): number {
    return this.levels.length;
  }

  /**
   * Get levels
   */
  getLevels(): LODLevel[] {
    return [...this.levels];
  }

  /**
   * Update (called by THREE.LOD.update)
   */
  update(camera: THREE.Camera): void {
    this.lod.update(camera);

    // Track current level for statistics
    const distance = camera.position.distanceTo(this.lod.position);
    for (let i = this.levels.length - 1; i >= 0; i--) {
      if (distance >= this.levels[i].distance) {
        this.currentLevel = i;
        break;
      }
    }
  }

  /**
   * Set position
   */
  setPosition(x: number, y: number, z: number): void {
    this.lod.position.set(x, y, z);
  }

  /**
   * Set rotation
   */
  setRotation(x: number, y: number, z: number): void {
    this.lod.rotation.set(x, y, z);
  }

  /**
   * Set scale
   */
  setScale(x: number, y: number, z: number): void {
    this.lod.scale.set(x, y, z);
  }

  /**
   * Dispose
   */
  dispose(): void {
    for (const level of this.levels) {
      if (level.object instanceof THREE.Mesh) {
        level.object.geometry?.dispose();
        if (Array.isArray(level.object.material)) {
          level.object.material.forEach((m) => m.dispose());
        } else {
          level.object.material?.dispose();
        }
      }
    }
    this.levels = [];
  }
}

/**
 * LOD update strategy
 */
export type LODUpdateStrategy = 'every-frame' | 'throttled' | 'distance-based';

/**
 * LOD manager configuration
 */
export interface LODManagerConfig {
  // Update strategy
  strategy: LODUpdateStrategy;

  // Throttled update interval (ms)
  updateInterval: number;

  // Distance-based update threshold (units changed before update)
  distanceThreshold: number;

  // Enable debug visualization
  debug: boolean;

  // LOD bias (multiplier for all LOD distances)
  lodBias: number;
}

const DEFAULT_CONFIG: LODManagerConfig = {
  strategy: 'throttled',
  updateInterval: 100, // Update every 100ms
  distanceThreshold: 5, // Update when camera moves 5 units
  debug: false,
  lodBias: 1.0
};

/**
 * LODManager - Manages all LOD objects in the scene
 */
export class LODManager {
  private config: LODManagerConfig;
  private lodObjects: Map<string, LODObject> = new Map();
  private scene?: THREE.Scene;
  private camera?: THREE.Camera;

  // Update tracking
  private lastUpdateTime: number = 0;
  private lastCameraPosition: THREE.Vector3 = new THREE.Vector3();

  // Statistics
  private stats = {
    totalObjects: 0,
    byLevel: [0, 0, 0, 0, 0], // Count at each LOD level
    updatesPerSecond: 0
  };

  constructor(
    scene?: THREE.Scene,
    camera?: THREE.Camera,
    config: Partial<LODManagerConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.scene = scene;
    this.camera = camera;
  }

  /**
   * Create LOD object
   */
  createLODObject(entityId: string, levels: LODLevel[]): LODObject {
    if (this.lodObjects.has(entityId)) {
      throw new Error(`LOD object for entity ${entityId} already exists`);
    }

    const lodObject = new LODObject(entityId);

    // Add all levels
    for (const level of levels) {
      // Apply LOD bias to distances
      lodObject.addLevel({
        ...level,
        distance: level.distance * this.config.lodBias
      });
    }

    this.lodObjects.set(entityId, lodObject);

    // Add to scene
    if (this.scene) {
      this.scene.add(lodObject.getLOD());
    }

    this.stats.totalObjects++;

    return lodObject;
  }

  /**
   * Get LOD object
   */
  getLODObject(entityId: string): LODObject | undefined {
    return this.lodObjects.get(entityId);
  }

  /**
   * Remove LOD object
   */
  removeLODObject(entityId: string): boolean {
    const lodObject = this.lodObjects.get(entityId);
    if (!lodObject) return false;

    // Remove from scene
    if (this.scene) {
      this.scene.remove(lodObject.getLOD());
    }

    // Dispose resources
    lodObject.dispose();

    this.lodObjects.delete(entityId);
    this.stats.totalObjects--;

    return true;
  }

  /**
   * Update all LOD objects
   */
  update(camera?: THREE.Camera): void {
    const currentCamera = camera || this.camera;
    if (!currentCamera) return;

    const currentTime = Date.now();

    // Check if we should update based on strategy
    if (!this.shouldUpdate(currentCamera, currentTime)) {
      return;
    }

    // Update all LOD objects
    for (const lodObject of this.lodObjects.values()) {
      lodObject.update(currentCamera);
    }

    // Update tracking
    this.lastUpdateTime = currentTime;
    this.lastCameraPosition.copy(currentCamera.position);

    // Update statistics
    this.updateStats();
  }

  /**
   * Check if should update based on strategy
   */
  private shouldUpdate(camera: THREE.Camera, currentTime: number): boolean {
    switch (this.config.strategy) {
      case 'every-frame':
        return true;

      case 'throttled':
        return currentTime - this.lastUpdateTime >= this.config.updateInterval;

      case 'distance-based':
        const distance = camera.position.distanceTo(this.lastCameraPosition);
        return distance >= this.config.distanceThreshold;

      default:
        return true;
    }
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    // Reset level counts
    this.stats.byLevel = [0, 0, 0, 0, 0];

    // Count objects at each level
    for (const lodObject of this.lodObjects.values()) {
      const level = lodObject.getCurrentLevel();
      if (level < this.stats.byLevel.length) {
        this.stats.byLevel[level]++;
      }
    }

    // Calculate updates per second
    const now = Date.now();
    if (now - this.lastUpdateTime > 0) {
      this.stats.updatesPerSecond =
        1000 / (now - this.lastUpdateTime);
    }
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalObjects: number;
    byLevel: number[];
    updatesPerSecond: number;
  } {
    return { ...this.stats };
  }

  /**
   * Set LOD bias (multiplier for all distances)
   */
  setLODBias(bias: number): void {
    this.config.lodBias = bias;

    // Update all existing LOD objects
    // Note: This requires rebuilding LOD levels
    // For simplicity, we'll just update the config
    // New LOD objects will use the new bias
  }

  /**
   * Set update strategy
   */
  setUpdateStrategy(strategy: LODUpdateStrategy): void {
    this.config.strategy = strategy;
  }

  /**
   * Set camera
   */
  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
    this.lastCameraPosition.copy(camera.position);
  }

  /**
   * Set scene
   */
  setScene(scene: THREE.Scene): void {
    // Remove from old scene
    if (this.scene) {
      for (const lodObject of this.lodObjects.values()) {
        this.scene.remove(lodObject.getLOD());
      }
    }

    // Add to new scene
    this.scene = scene;
    for (const lodObject of this.lodObjects.values()) {
      this.scene.add(lodObject.getLOD());
    }
  }

  /**
   * Get configuration
   */
  getConfig(): LODManagerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LODManagerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Dispose all LOD objects
   */
  dispose(): void {
    for (const lodObject of this.lodObjects.values()) {
      if (this.scene) {
        this.scene.remove(lodObject.getLOD());
      }
      lodObject.dispose();
    }
    this.lodObjects.clear();
    this.stats = {
      totalObjects: 0,
      byLevel: [0, 0, 0, 0, 0],
      updatesPerSecond: 0
    };
  }
}
