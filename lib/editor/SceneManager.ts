/**
 * SceneManager - Object-Oriented Scene Management System
 * Manages houses, ground, and overall scene composition
 */

import { Vector3 } from 'three';

export interface House {
  id: string;
  position: Vector3;
  rotation: number;
  scale: number;
  style: 'modern' | 'traditional' | 'cottage';
  color: string;
}

export interface Ground {
  size: number;
  grassDensity: number;
  grassColor: string;
  soilColor: string;
  showGrid: boolean;
}

export class SceneManager {
  private houses: Map<string, House> = new Map();
  private ground: Ground;
  private onSceneChange?: () => void;

  constructor(options?: {
    ground?: Partial<Ground>;
    onSceneChange?: () => void;
  }) {
    this.ground = {
      size: 30,
      grassDensity: 1.0,
      grassColor: '#4a7c2f',
      soilColor: '#6b4423',
      showGrid: true,
      ...options?.ground,
    };

    this.onSceneChange = options?.onSceneChange;
  }

  /**
   * Add a house to the scene
   */
  public addHouse(house: House): void {
    this.houses.set(house.id, house);
    this.notifyChange();
  }

  /**
   * Remove a house from the scene
   */
  public removeHouse(id: string): boolean {
    const result = this.houses.delete(id);
    if (result) {
      this.notifyChange();
    }
    return result;
  }

  /**
   * Get a house by ID
   */
  public getHouse(id: string): House | undefined {
    return this.houses.get(id);
  }

  /**
   * Get all houses
   */
  public getHouses(): House[] {
    return Array.from(this.houses.values());
  }

  /**
   * Update house properties
   */
  public updateHouse(id: string, updates: Partial<House>): boolean {
    const house = this.houses.get(id);
    if (!house) return false;

    Object.assign(house, updates);
    this.notifyChange();
    return true;
  }

  /**
   * Get ground configuration
   */
  public getGround(): Ground {
    return { ...this.ground };
  }

  /**
   * Update ground configuration
   */
  public updateGround(updates: Partial<Ground>): void {
    Object.assign(this.ground, updates);
    this.notifyChange();
  }

  /**
   * Create default scene with 3 houses
   */
  public createDefaultScene(): void {
    // House 1: Modern style in the center-left
    this.addHouse({
      id: 'house-1',
      position: new Vector3(-8, 0, -5),
      rotation: 0,
      scale: 1,
      style: 'modern',
      color: '#f5f0e6',
    });

    // House 2: Traditional style in the center-right
    this.addHouse({
      id: 'house-2',
      position: new Vector3(8, 0, -3),
      rotation: Math.PI / 4,
      scale: 0.9,
      style: 'traditional',
      color: '#e8dcc8',
    });

    // House 3: Cottage style in the back
    this.addHouse({
      id: 'house-3',
      position: new Vector3(0, 0, 8),
      rotation: Math.PI,
      scale: 0.8,
      style: 'cottage',
      color: '#f0e6d6',
    });
  }

  /**
   * Clear all houses
   */
  public clearHouses(): void {
    this.houses.clear();
    this.notifyChange();
  }

  /**
   * Get scene bounds (useful for camera positioning)
   */
  public getSceneBounds(): {
    min: Vector3;
    max: Vector3;
    center: Vector3;
  } {
    if (this.houses.size === 0) {
      return {
        min: new Vector3(-this.ground.size / 2, 0, -this.ground.size / 2),
        max: new Vector3(this.ground.size / 2, 0, this.ground.size / 2),
        center: new Vector3(0, 0, 0),
      };
    }

    const positions = Array.from(this.houses.values()).map(h => h.position);

    const min = new Vector3(
      Math.min(...positions.map(p => p.x)),
      0,
      Math.min(...positions.map(p => p.z))
    );

    const max = new Vector3(
      Math.max(...positions.map(p => p.x)),
      0,
      Math.max(...positions.map(p => p.z))
    );

    const center = new Vector3().addVectors(min, max).multiplyScalar(0.5);

    return { min, max, center };
  }

  /**
   * Get house count
   */
  public getHouseCount(): number {
    return this.houses.size;
  }

  /**
   * Check if scene is empty
   */
  public isEmpty(): boolean {
    return this.houses.size === 0;
  }

  /**
   * Notify scene change
   */
  private notifyChange(): void {
    this.onSceneChange?.();
  }

  /**
   * Export scene data
   */
  public exportScene(): {
    houses: House[];
    ground: Ground;
  } {
    return {
      houses: this.getHouses(),
      ground: this.getGround(),
    };
  }

  /**
   * Import scene data
   */
  public importScene(data: { houses: House[]; ground: Ground }): void {
    this.clearHouses();
    data.houses.forEach(house => this.addHouse(house));
    this.updateGround(data.ground);
  }
}
