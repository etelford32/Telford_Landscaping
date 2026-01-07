/**
 * CameraController - Object-Oriented Camera Control System
 * Manages camera position, zoom, rotation, and orbital movement
 */

import { Vector3, PerspectiveCamera } from 'three';

export interface CameraSettings {
  position: Vector3;
  target: Vector3;
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  enablePan: boolean;
  enableZoom: boolean;
  enableRotate: boolean;
}

export class CameraController {
  private camera: PerspectiveCamera | null = null;
  private settings: CameraSettings;
  private target: Vector3;

  constructor(settings?: Partial<CameraSettings>) {
    this.settings = {
      position: new Vector3(15, 12, 15),
      target: new Vector3(0, 0, 0),
      minDistance: 5,
      maxDistance: 50,
      minPolarAngle: Math.PI / 6,
      maxPolarAngle: Math.PI / 2.2,
      enablePan: true,
      enableZoom: true,
      enableRotate: true,
      ...settings,
    };

    this.target = this.settings.target.clone();
  }

  /**
   * Initialize camera with the given Three.js camera instance
   */
  public setCamera(camera: PerspectiveCamera): void {
    this.camera = camera;
    this.camera.position.copy(this.settings.position);
    this.camera.lookAt(this.target);
  }

  /**
   * Get current camera position
   */
  public getPosition(): Vector3 {
    return this.camera?.position.clone() || this.settings.position.clone();
  }

  /**
   * Get current target position
   */
  public getTarget(): Vector3 {
    return this.target.clone();
  }

  /**
   * Set camera position
   */
  public setPosition(position: Vector3): void {
    if (this.camera) {
      this.camera.position.copy(position);
      this.camera.lookAt(this.target);
    }
    this.settings.position = position.clone();
  }

  /**
   * Set camera target (look-at point)
   */
  public setTarget(target: Vector3): void {
    this.target = target.clone();
    if (this.camera) {
      this.camera.lookAt(this.target);
    }
  }

  /**
   * Focus camera on a specific point
   */
  public focusOnPoint(point: Vector3, distance: number = 15): void {
    const direction = new Vector3()
      .subVectors(this.getPosition(), point)
      .normalize();

    const newPosition = new Vector3()
      .copy(point)
      .add(direction.multiplyScalar(distance));

    this.setPosition(newPosition);
    this.setTarget(point);
  }

  /**
   * Reset camera to default position
   */
  public reset(): void {
    this.setPosition(this.settings.position.clone());
    this.setTarget(this.settings.target.clone());
  }

  /**
   * Get camera settings for OrbitControls
   */
  public getControlSettings() {
    return {
      enablePan: this.settings.enablePan,
      enableZoom: this.settings.enableZoom,
      enableRotate: this.settings.enableRotate,
      minDistance: this.settings.minDistance,
      maxDistance: this.settings.maxDistance,
      minPolarAngle: this.settings.minPolarAngle,
      maxPolarAngle: this.settings.maxPolarAngle,
      target: this.target.toArray() as [number, number, number],
    };
  }

  /**
   * Animate camera to a new position smoothly
   */
  public animateTo(
    newPosition: Vector3,
    newTarget: Vector3,
    duration: number = 1000,
    onComplete?: () => void
  ): void {
    const startPosition = this.getPosition();
    const startTarget = this.getTarget();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-in-out function
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentPosition = new Vector3().lerpVectors(
        startPosition,
        newPosition,
        eased
      );

      const currentTarget = new Vector3().lerpVectors(
        startTarget,
        newTarget,
        eased
      );

      this.setPosition(currentPosition);
      this.setTarget(currentTarget);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else if (onComplete) {
        onComplete();
      }
    };

    animate();
  }
}
