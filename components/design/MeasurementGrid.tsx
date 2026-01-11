/**
 * Measurement Grid Component
 * Displays a precise grid with measurements for accurate 3D placement
 */

"use client";

import { useMemo } from 'react';
import { Text } from '@react-three/drei';

interface MeasurementGridProps {
  size?: number; // Total grid size in feet
  divisions?: number; // Number of divisions
  showLabels?: boolean;
  subDivisions?: number; // Finer grid lines
}

export function MeasurementGrid({
  size = 50,
  divisions = 10,
  showLabels = true,
  subDivisions = 5
}: MeasurementGridProps) {
  const gridStep = size / divisions;
  const subStep = gridStep / subDivisions;

  // Generate main grid lines
  const mainLines = useMemo(() => {
    const lines = [];
    for (let i = -divisions / 2; i <= divisions / 2; i++) {
      const pos = i * gridStep;
      lines.push({ pos, isCenter: i === 0 });
    }
    return lines;
  }, [divisions, gridStep]);

  // Generate sub grid lines
  const subLines = useMemo(() => {
    const lines = [];
    for (let i = -divisions * subDivisions / 2; i <= divisions * subDivisions / 2; i++) {
      if (i % subDivisions !== 0) { // Skip main grid positions
        lines.push(i * subStep);
      }
    }
    return lines;
  }, [divisions, subDivisions, subStep]);

  return (
    <group position={[0, 0.01, 0]}>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color="#f0f0f0" transparent opacity={0.3} />
      </mesh>

      {/* Sub grid lines - finer divisions */}
      {subLines.map((pos, i) => (
        <group key={`sub-${i}`}>
          {/* X-direction */}
          <mesh position={[pos, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.02, size]} />
            <meshBasicMaterial color="#d0d0d0" transparent opacity={0.3} />
          </mesh>
          {/* Z-direction */}
          <mesh position={[0, 0, pos]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[size, 0.02]} />
            <meshBasicMaterial color="#d0d0d0" transparent opacity={0.3} />
          </mesh>
        </group>
      ))}

      {/* Main grid lines */}
      {mainLines.map(({ pos, isCenter }, i) => (
        <group key={`main-${i}`}>
          {/* X-direction */}
          <mesh position={[pos, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[isCenter ? 0.08 : 0.04, size]} />
            <meshBasicMaterial
              color={isCenter ? '#0000ff' : '#888888'}
              transparent
              opacity={isCenter ? 0.8 : 0.5}
            />
          </mesh>
          {/* Z-direction */}
          <mesh position={[0, 0, pos]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[size, isCenter ? 0.08 : 0.04]} />
            <meshBasicMaterial
              color={isCenter ? '#ff0000' : '#888888'}
              transparent
              opacity={isCenter ? 0.8 : 0.5}
            />
          </mesh>

          {/* Labels */}
          {showLabels && !isCenter && (
            <>
              <Text
                position={[pos, 0.1, -size / 2 - 1]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.5}
                color="#333333"
                anchorX="center"
                anchorY="middle"
              >
                {Math.abs(pos).toFixed(1)}ft
              </Text>
              <Text
                position={[-size / 2 - 1, 0.1, pos]}
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
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>

      {/* Axis labels at origin */}
      {showLabels && (
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

// Dimension line component for showing measurements between two points
interface DimensionLineProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  offset?: number; // Offset from objects
}

export function DimensionLine({ start, end, color = '#000000', offset = 0.5 }: DimensionLineProps) {
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

  const direction = [end[0] - start[0], end[1] - start[1], end[2] - start[2]];
  const length = Math.sqrt(direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2);

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
    </group>
  );
}
