/**
 * React hooks for unified grid system
 */

'use client';

import { useMemo, useCallback, useState } from 'react';
import { GridSnap, GridConfig, DEFAULT_GRID_CONFIG, getGlobalGridSnap } from './GridSystem';

/**
 * Hook to use grid snapping functionality
 */
export function useGridSnap(config?: Partial<GridConfig>) {
  const gridSnap = useMemo(() => {
    if (config) {
      return new GridSnap({ ...DEFAULT_GRID_CONFIG, ...config });
    }
    return getGlobalGridSnap();
  }, [config]);

  const snap = useCallback((value: number, gridSize?: number) => {
    return gridSnap.snap(value, gridSize);
  }, [gridSnap]);

  const snap2D = useCallback((x: number, z: number, gridSize?: number) => {
    return gridSnap.snap2D(x, z, gridSize);
  }, [gridSnap]);

  const snap3D = useCallback((x: number, y: number, z: number, gridSize?: number) => {
    return gridSnap.snap3D(x, y, z, gridSize);
  }, [gridSnap]);

  const snapToSubGrid = useCallback((value: number) => {
    return gridSnap.snapToSubGrid(value);
  }, [gridSnap]);

  const snapToSubGrid2D = useCallback((x: number, z: number) => {
    return gridSnap.snapToSubGrid2D(x, z);
  }, [gridSnap]);

  const isWithinBounds = useCallback((x: number, z: number) => {
    return gridSnap.isWithinBounds(x, z);
  }, [gridSnap]);

  const clampToBounds = useCallback((x: number, z: number) => {
    return gridSnap.clampToBounds(x, z);
  }, [gridSnap]);

  const screenToGrid = useCallback((
    screenX: number,
    screenY: number,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    return gridSnap.screenToGrid(screenX, screenY, canvasWidth, canvasHeight);
  }, [gridSnap]);

  const getGridCell = useCallback((x: number, z: number) => {
    return gridSnap.getGridCell(x, z);
  }, [gridSnap]);

  const getCellCenter = useCallback((cellX: number, cellZ: number) => {
    return gridSnap.getCellCenter(cellX, cellZ);
  }, [gridSnap]);

  const distance = useCallback((x1: number, z1: number, x2: number, z2: number) => {
    return gridSnap.distance(x1, z1, x2, z2);
  }, [gridSnap]);

  const calculateArea = useCallback((points: Array<{ x: number; z: number }>) => {
    return gridSnap.calculateArea(points);
  }, [gridSnap]);

  return {
    snap,
    snap2D,
    snap3D,
    snapToSubGrid,
    snapToSubGrid2D,
    isWithinBounds,
    clampToBounds,
    screenToGrid,
    getGridCell,
    getCellCenter,
    distance,
    calculateArea,
    config: gridSnap.getConfig()
  };
}

/**
 * Hook to manage grid configuration state
 */
export function useGridConfig(initialConfig?: Partial<GridConfig>) {
  const [config, setConfig] = useState<GridConfig>({
    ...DEFAULT_GRID_CONFIG,
    ...initialConfig
  });

  const updateConfig = useCallback((updates: Partial<GridConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const setSnapEnabled = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, snapEnabled: enabled }));
  }, []);

  const setCellSize = useCallback((size: number) => {
    setConfig(prev => ({ ...prev, cellSize: size }));
  }, []);

  const setGridSize = useCallback((size: number) => {
    setConfig(prev => ({ ...prev, size }));
  }, []);

  const setDivisions = useCallback((divisions: number) => {
    setConfig(prev => ({ ...prev, divisions }));
  }, []);

  const setSubDivisions = useCallback((subDivisions: number) => {
    setConfig(prev => ({ ...prev, subDivisions }));
  }, []);

  const reset = useCallback(() => {
    setConfig({ ...DEFAULT_GRID_CONFIG, ...initialConfig });
  }, [initialConfig]);

  return {
    config,
    updateConfig,
    setSnapEnabled,
    setCellSize,
    setGridSize,
    setDivisions,
    setSubDivisions,
    reset
  };
}

/**
 * Hook for drag-and-drop grid placement
 */
export function useGridPlacement(
  onPlace: (x: number, z: number) => void,
  config?: Partial<GridConfig>
) {
  const { snap2D, isWithinBounds, clampToBounds } = useGridSnap(config);
  const [isDragging, setIsDragging] = useState(false);
  const [previewPosition, setPreviewPosition] = useState<{ x: number; z: number } | null>(null);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragMove = useCallback((x: number, z: number) => {
    const snapped = snap2D(x, z);
    const clamped = clampToBounds(snapped.x, snapped.z);
    setPreviewPosition(clamped);
  }, [snap2D, clampToBounds]);

  const handleDragEnd = useCallback((x: number, z: number) => {
    const snapped = snap2D(x, z);
    if (isWithinBounds(snapped.x, snapped.z)) {
      onPlace(snapped.x, snapped.z);
    }
    setIsDragging(false);
    setPreviewPosition(null);
  }, [snap2D, isWithinBounds, onPlace]);

  const cancelDrag = useCallback(() => {
    setIsDragging(false);
    setPreviewPosition(null);
  }, []);

  return {
    isDragging,
    previewPosition,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    cancelDrag
  };
}

/**
 * Hook for measuring distances on the grid
 */
export function useGridMeasurement() {
  const { distance } = useGridSnap();
  const [measurementPoints, setMeasurementPoints] = useState<Array<{ x: number; z: number }>>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);

  const startMeasurement = useCallback((x: number, z: number) => {
    setIsMeasuring(true);
    setMeasurementPoints([{ x, z }]);
  }, []);

  const addPoint = useCallback((x: number, z: number) => {
    setMeasurementPoints(prev => [...prev, { x, z }]);
  }, []);

  const endMeasurement = useCallback(() => {
    setIsMeasuring(false);
  }, []);

  const clearMeasurement = useCallback(() => {
    setMeasurementPoints([]);
    setIsMeasuring(false);
  }, []);

  const totalDistance = useMemo(() => {
    if (measurementPoints.length < 2) return 0;

    let total = 0;
    for (let i = 0; i < measurementPoints.length - 1; i++) {
      const p1 = measurementPoints[i];
      const p2 = measurementPoints[i + 1];
      total += distance(p1.x, p1.z, p2.x, p2.z);
    }

    return total;
  }, [measurementPoints, distance]);

  return {
    isMeasuring,
    measurementPoints,
    totalDistance,
    startMeasurement,
    addPoint,
    endMeasurement,
    clearMeasurement
  };
}
