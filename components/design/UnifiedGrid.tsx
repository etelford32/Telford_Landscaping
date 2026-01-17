/**
 * Unified Grid Component
 * Combines DesignGrid and MeasurementGrid into a single configurable component
 */

"use client";

import { useMemo } from 'react';
import { Grid as DreiGrid } from "@react-three/drei";
import { Text } from '@react-three/drei';
import { GridConfig, DEFAULT_GRID_CONFIG } from '@/lib/grid/GridSystem';

export type GridMode = 'simple' | 'advanced' | 'measurement';

interface UnifiedGridProps {
  mode?: GridMode;
  config?: Partial<GridConfig>;
  visible?: boolean;
  showLabels?: boolean;
  showMeasurements?: boolean;
  showOrigin?: boolean;
  showAxisLabels?: boolean;
  cellColor?: string;
  sectionColor?: string;
  mainLineColor?: string;
  subLineColor?: string;
}

export default function UnifiedGrid({
  mode = 'simple',
  config: userConfig,
  visible = true,
  showLabels = true,
  showMeasurements = false,
  showOrigin = true,
  showAxisLabels = true,
  cellColor = '#6fa070',
  sectionColor = '#4a7c2f',
  mainLineColor = '#888888',
  subLineColor = '#d0d0d0'
}: UnifiedGridProps) {
  // Merge user config with defaults
  const config: GridConfig = useMemo(() => ({
    ...DEFAULT_GRID_CONFIG,
    ...userConfig
  }), [userConfig]);

  if (!visible) return null;

  // Simple mode - uses drei Grid component
  if (mode === 'simple') {
    return (
      <>
        <DreiGrid
          args={[config.size, config.size]}
          cellSize={config.cellSize}
          cellThickness={0.5}
          cellColor={cellColor}
          sectionSize={config.cellSize * 5}
          sectionThickness={1}
          sectionColor={sectionColor}
          fadeDistance={50}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
          position={[0, 0.01, 0]}
        />

        {/* Ground plane for raycasting */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          visible={false}
          name="ground-plane"
        >
          <planeGeometry args={[config.size, config.size]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </>
    );
  }

  // Advanced/Measurement mode - custom grid with labels and measurements
  const gridStep = config.size / config.divisions;
  const subStep = gridStep / config.subDivisions;

  // Generate main grid lines
  const mainLines = useMemo(() => {
    const lines = [];
    for (let i = -config.divisions / 2; i <= config.divisions / 2; i++) {
      const pos = i * gridStep;
      lines.push({ pos, isCenter: i === 0 });
    }
    return lines;
  }, [config.divisions, gridStep]);

  // Generate sub grid lines
  const subLines = useMemo(() => {
    const lines = [];
    for (let i = -config.divisions * config.subDivisions / 2; i <= config.divisions * config.subDivisions / 2; i++) {
      if (i % config.subDivisions !== 0) {
        lines.push(i * subStep);
      }
    }
    return lines;
  }, [config.divisions, config.subDivisions, subStep]);

  return (
    <group position={[0, 0.01, 0]}>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow name="ground-plane">
        <planeGeometry args={[config.size, config.size]} />
        <meshStandardMaterial
          color="#f0f0f0"
          transparent
          opacity={mode === 'measurement' ? 0.3 : 0.1}
        />
      </mesh>

      {/* Sub grid lines - finer divisions */}
      {config.subDivisions > 1 && subLines.map((pos, i) => (
        <group key={`sub-${i}`}>
          {/* X-direction */}
          <mesh position={[pos, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.02, config.size]} />
            <meshBasicMaterial color={subLineColor} transparent opacity={0.3} />
          </mesh>
          {/* Z-direction */}
          <mesh position={[0, 0, pos]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[config.size, 0.02]} />
            <meshBasicMaterial color={subLineColor} transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Main grid lines */}
      {mainLines.map(({ pos, isCenter }, i) => (
        <group key={`main-${i}`}>
          {/* X-direction */}
          <mesh position={[pos, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[isCenter ? 0.08 : 0.04, config.size]} />
            <meshBasicMaterial
              color={isCenter ? '#0000ff' : mainLineColor}
              transparent
              opacity={isCenter ? 0.8 : 0.5}
            />
          </mesh>
          {/* Z-direction */}
          <mesh position={[0, 0, pos]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[config.size, isCenter ? 0.08 : 0.04]} />
            <meshBasicMaterial
              color={isCenter ? '#ff0000' : mainLineColor}
              transparent
              opacity={isCenter ? 0.8 : 0.5}
            />
          </mesh>

          {/* Labels */}
          {showLabels && showMeasurements && !isCenter && (
            <>
              <Text
                position={[pos, 0.1, -config.size / 2 - 1]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.5}
                color="#333333"
                anchorX="center"
                anchorY="middle"
              >
                {Math.abs(pos).toFixed(1)}ft
              </Text>
              <Text
                position={[-config.size / 2 - 1, 0.1, pos]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.5}
                color="#333333"
                anchorX="center"
                anchorY="middle"
              >
                {Math.abs(pos).toFixed(1)}ft
              </Text>
            </>
          )}
        </group>
      ))}

      {/* Origin marker */}
      {showOrigin && (
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      )}

      {/* Axis labels at origin */}
      {showLabels && showAxisLabels && (
        <>
          <Text
            position={[1, 0.1, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.6}
            color="#ff0000"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            X
          </Text>
          <Text
            position={[0, 0.1, 1]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.6}
            color="#0000ff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            Z
          </Text>
          <Text
            position={[0, 1, 0]}
            fontSize={0.6}
            color="#00ff00"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            Y
          </Text>
        </>
      )}
    </group>
  );
}

/**
 * Dimension line component for showing measurements between two points
 */
interface DimensionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  offset?: number;
  showLabel?: boolean;
}

export function DimensionLine({
  start,
  end,
  color = '#000000',
  offset = 0.5,
  showLabel = true
}: DimensionLineProps) {
  const distance = Math.sqrt(
    Math.pow(end[0] - start[0], 2) +
    Math.pow(end[1] - start[1], 2) +
    Math.pow(end[2] - start[2], 2)
  );

  const midpoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 + offset,
    (start[2] + end[2]) / 2,
  ];

  return (
    <group>
      {/* Line */}
      <mesh position={midpoint}>
        <cylinderGeometry args={[0.02, 0.02, distance, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* End caps */}
      <mesh position={start}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Measurement label */}
      {showLabel && (
        <Text
          position={[midpoint[0], midpoint[1] + 0.3, midpoint[2]]}
          fontSize={0.4}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#ffffff"
        >
          {distance.toFixed(2)} ft
        </Text>
      )}
    </group>
  );
}
