/**
 * Geometry Component - Defines the 3D shape
 *
 * Describes what geometry to render, but doesn't contain the actual Three.js geometry.
 * The RenderSystem will create the actual geometry based on this data.
 */

import { Component } from '../core/Component';

/**
 * Geometry types we support
 */
export type GeometryType =
  | 'sphere'
  | 'box'
  | 'cylinder'
  | 'cone'
  | 'plane'
  | 'torus'
  | 'custom';

/**
 * Base geometry component
 */
export interface GeometryComponent extends Component {
  readonly type: 'Geometry';
  geometryType: GeometryType;
  parameters: GeometryParameters;
}

/**
 * Geometry parameters (union type based on geometryType)
 */
export type GeometryParameters =
  | SphereGeometryParameters
  | BoxGeometryParameters
  | CylinderGeometryParameters
  | ConeGeometryParameters
  | PlaneGeometryParameters
  | TorusGeometryParameters
  | CustomGeometryParameters;

/**
 * Sphere geometry parameters
 */
export interface SphereGeometryParameters {
  type: 'sphere';
  radius: number;
  widthSegments?: number;
  heightSegments?: number;
}

/**
 * Box geometry parameters
 */
export interface BoxGeometryParameters {
  type: 'box';
  width: number;
  height: number;
  depth: number;
  widthSegments?: number;
  heightSegments?: number;
  depthSegments?: number;
}

/**
 * Cylinder geometry parameters
 */
export interface CylinderGeometryParameters {
  type: 'cylinder';
  radiusTop: number;
  radiusBottom: number;
  height: number;
  radialSegments?: number;
  heightSegments?: number;
  openEnded?: boolean;
}

/**
 * Cone geometry parameters
 */
export interface ConeGeometryParameters {
  type: 'cone';
  radius: number;
  height: number;
  radialSegments?: number;
  heightSegments?: number;
  openEnded?: boolean;
}

/**
 * Plane geometry parameters
 */
export interface PlaneGeometryParameters {
  type: 'plane';
  width: number;
  height: number;
  widthSegments?: number;
  heightSegments?: number;
}

/**
 * Torus geometry parameters
 */
export interface TorusGeometryParameters {
  type: 'torus';
  radius: number;
  tube: number;
  radialSegments?: number;
  tubularSegments?: number;
}

/**
 * Custom geometry (for imported models, etc.)
 */
export interface CustomGeometryParameters {
  type: 'custom';
  assetId: string; // Reference to loaded model
  parameters?: Record<string, any>;
}

/**
 * Factory functions for common geometries
 */

export function createSphereGeometry(
  radius: number,
  segments: number = 32
): GeometryComponent {
  return {
    type: 'Geometry',
    geometryType: 'sphere',
    parameters: {
      type: 'sphere',
      radius,
      widthSegments: segments,
      heightSegments: segments
    }
  };
}

export function createBoxGeometry(
  width: number,
  height: number,
  depth: number
): GeometryComponent {
  return {
    type: 'Geometry',
    geometryType: 'box',
    parameters: {
      type: 'box',
      width,
      height,
      depth
    }
  };
}

export function createCylinderGeometry(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  segments: number = 32
): GeometryComponent {
  return {
    type: 'Geometry',
    geometryType: 'cylinder',
    parameters: {
      type: 'cylinder',
      radiusTop,
      radiusBottom,
      height,
      radialSegments: segments
    }
  };
}

export function createConeGeometry(
  radius: number,
  height: number,
  segments: number = 32
): GeometryComponent {
  return {
    type: 'Geometry',
    geometryType: 'cone',
    parameters: {
      type: 'cone',
      radius,
      height,
      radialSegments: segments
    }
  };
}

export function createPlaneGeometry(
  width: number,
  height: number
): GeometryComponent {
  return {
    type: 'Geometry',
    geometryType: 'plane',
    parameters: {
      type: 'plane',
      width,
      height
    }
  };
}
