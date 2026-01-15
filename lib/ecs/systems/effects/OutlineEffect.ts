/**
 * OutlineEffect - Render outlines around selected objects
 *
 * Uses post-processing to create clean, stylish outlines
 * for selected entities without modifying the original mesh
 */

import * as THREE from 'three';

/**
 * Outline effect configuration
 */
export interface OutlineEffectConfig {
  // Outline color
  color: THREE.Color;

  // Outline thickness (in pixels)
  thickness: number;

  // Outline glow strength
  glowStrength: number;

  // Pulse animation
  enablePulse: boolean;
  pulseSpeed: number;
  pulseMin: number;
  pulseMax: number;
}

const DEFAULT_CONFIG: OutlineEffectConfig = {
  color: new THREE.Color(0x4ade80), // Green
  thickness: 3,
  glowStrength: 1.0,
  enablePulse: true,
  pulseSpeed: 2.0,
  pulseMin: 0.7,
  pulseMax: 1.0
};

/**
 * OutlineEffect - Renders outlines around meshes
 */
export class OutlineEffect {
  private config: OutlineEffectConfig;
  private selectedMeshes: Set<THREE.Mesh> = new Set();
  private outlineMeshes: Map<THREE.Mesh, THREE.Mesh> = new Map();
  private time: number = 0;

  // Outline material
  private outlineMaterial: THREE.ShaderMaterial;

  constructor(config: Partial<OutlineEffectConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Create outline shader material
    this.outlineMaterial = this.createOutlineMaterial();
  }

  /**
   * Create outline shader material
   */
  private createOutlineMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: this.config.color },
        thickness: { value: this.config.thickness },
        time: { value: 0 },
        pulseMin: { value: this.config.pulseMin },
        pulseMax: { value: this.config.pulseMax },
        pulseSpeed: { value: this.config.pulseSpeed }
      },
      vertexShader: `
        uniform float thickness;
        uniform float time;
        uniform float pulseMin;
        uniform float pulseMax;
        uniform float pulseSpeed;

        void main() {
          // Pulse effect
          float pulse = mix(pulseMin, pulseMax,
            (sin(time * pulseSpeed) + 1.0) * 0.5
          );

          // Expand along normal
          vec3 offset = normalize(normal) * (thickness * 0.01) * pulse;
          vec3 newPosition = position + offset;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;

        void main() {
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: true,
      transparent: false
    });
  }

  /**
   * Add mesh to selection (will render outline)
   */
  addSelection(mesh: THREE.Mesh): void {
    if (this.selectedMeshes.has(mesh)) return;

    this.selectedMeshes.add(mesh);

    // Create outline mesh
    const outlineMesh = this.createOutlineMesh(mesh);
    this.outlineMeshes.set(mesh, outlineMesh);

    // Add to scene
    if (mesh.parent) {
      mesh.parent.add(outlineMesh);
    }
  }

  /**
   * Remove mesh from selection
   */
  removeSelection(mesh: THREE.Mesh): void {
    if (!this.selectedMeshes.has(mesh)) return;

    this.selectedMeshes.delete(mesh);

    // Remove outline mesh
    const outlineMesh = this.outlineMeshes.get(mesh);
    if (outlineMesh) {
      if (outlineMesh.parent) {
        outlineMesh.parent.remove(outlineMesh);
      }
      outlineMesh.geometry.dispose();
      this.outlineMeshes.delete(mesh);
    }
  }

  /**
   * Clear all selections
   */
  clearSelections(): void {
    const meshes = Array.from(this.selectedMeshes);
    meshes.forEach((mesh) => this.removeSelection(mesh));
  }

  /**
   * Create outline mesh for a given mesh
   */
  private createOutlineMesh(mesh: THREE.Mesh): THREE.Mesh {
    const outlineMesh = new THREE.Mesh(
      mesh.geometry,
      this.outlineMaterial.clone()
    );

    // Match transform
    outlineMesh.position.copy(mesh.position);
    outlineMesh.rotation.copy(mesh.rotation);
    outlineMesh.scale.copy(mesh.scale);

    // Link transform (update when original updates)
    outlineMesh.userData.originalMesh = mesh;

    // Set render order to render after original
    outlineMesh.renderOrder = mesh.renderOrder - 1;

    return outlineMesh;
  }

  /**
   * Update outline effect (call every frame)
   */
  update(deltaTime: number): void {
    if (!this.config.enablePulse) return;

    this.time += deltaTime;

    // Update all outline materials
    for (const outlineMesh of this.outlineMeshes.values()) {
      const material = outlineMesh.material as THREE.ShaderMaterial;
      material.uniforms.time.value = this.time;
    }

    // Sync transforms
    for (const [originalMesh, outlineMesh] of this.outlineMeshes.entries()) {
      outlineMesh.position.copy(originalMesh.position);
      outlineMesh.rotation.copy(originalMesh.rotation);
      outlineMesh.scale.copy(originalMesh.scale);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OutlineEffectConfig>): void {
    this.config = { ...this.config, ...config };

    // Update material uniforms
    if (config.color !== undefined) {
      this.outlineMaterial.uniforms.color.value = config.color;
    }
    if (config.thickness !== undefined) {
      this.outlineMaterial.uniforms.thickness.value = config.thickness;
    }
    if (config.pulseSpeed !== undefined) {
      this.outlineMaterial.uniforms.pulseSpeed.value = config.pulseSpeed;
    }
    if (config.pulseMin !== undefined) {
      this.outlineMaterial.uniforms.pulseMin.value = config.pulseMin;
    }
    if (config.pulseMax !== undefined) {
      this.outlineMaterial.uniforms.pulseMax.value = config.pulseMax;
    }
  }

  /**
   * Check if mesh is selected
   */
  isSelected(mesh: THREE.Mesh): boolean {
    return this.selectedMeshes.has(mesh);
  }

  /**
   * Get all selected meshes
   */
  getSelectedMeshes(): THREE.Mesh[] {
    return Array.from(this.selectedMeshes);
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.clearSelections();
    this.outlineMaterial.dispose();
  }
}

/**
 * Simple outline effect using scale (alternative, less GPU intensive)
 */
export class SimpleOutlineEffect {
  private config: OutlineEffectConfig;
  private selectedMeshes: Set<THREE.Mesh> = new Set();
  private outlineMeshes: Map<THREE.Mesh, THREE.Mesh> = new Map();
  private time: number = 0;

  constructor(config: Partial<OutlineEffectConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Add mesh to selection
   */
  addSelection(mesh: THREE.Mesh): void {
    if (this.selectedMeshes.has(mesh)) return;

    this.selectedMeshes.add(mesh);

    // Create simple outline mesh
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: this.config.color,
      side: THREE.BackSide
    });

    const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMaterial);

    // Slightly larger scale for outline
    const scaleFactor = 1.05;
    outlineMesh.scale.multiplyScalar(scaleFactor);
    outlineMesh.renderOrder = mesh.renderOrder - 1;

    this.outlineMeshes.set(mesh, outlineMesh);

    if (mesh.parent) {
      mesh.parent.add(outlineMesh);
    }
  }

  /**
   * Remove mesh from selection
   */
  removeSelection(mesh: THREE.Mesh): void {
    if (!this.selectedMeshes.has(mesh)) return;

    this.selectedMeshes.delete(mesh);

    const outlineMesh = this.outlineMeshes.get(mesh);
    if (outlineMesh) {
      if (outlineMesh.parent) {
        outlineMesh.parent.remove(outlineMesh);
      }
      (outlineMesh.material as THREE.Material).dispose();
      this.outlineMeshes.delete(mesh);
    }
  }

  /**
   * Clear all selections
   */
  clearSelections(): void {
    const meshes = Array.from(this.selectedMeshes);
    meshes.forEach((mesh) => this.removeSelection(mesh));
  }

  /**
   * Update (sync transforms and animate)
   */
  update(deltaTime: number): void {
    this.time += deltaTime;

    for (const [originalMesh, outlineMesh] of this.outlineMeshes.entries()) {
      // Sync position and rotation
      outlineMesh.position.copy(originalMesh.position);
      outlineMesh.rotation.copy(originalMesh.rotation);

      // Animate pulse effect
      if (this.config.enablePulse) {
        const pulse =
          this.config.pulseMin +
          (this.config.pulseMax - this.config.pulseMin) *
            ((Math.sin(this.time * this.config.pulseSpeed) + 1) * 0.5);

        const scaleFactor = 1.05 * pulse;
        outlineMesh.scale.copy(originalMesh.scale);
        outlineMesh.scale.multiplyScalar(scaleFactor);
      }
    }
  }

  /**
   * Dispose
   */
  dispose(): void {
    this.clearSelections();
  }
}
