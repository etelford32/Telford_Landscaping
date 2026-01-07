/**
 * GrassyGround - Realistic Grassy Ground Component
 * Renders ground with grass texture and grid overlay
 */

import { useRef, useMemo } from 'react';
import { Mesh, Color, InstancedMesh, Object3D, MathUtils } from 'three';
import { Ground } from '@/lib/editor/SceneManager';

interface GrassyGroundProps {
  ground: Ground;
}

export function GrassyGround({ ground }: GrassyGroundProps) {
  const meshRef = useRef<Mesh>(null);
  const { size, grassColor, soilColor, grassDensity, showGrid } = ground;

  return (
    <>
      {/* Main Ground Plane */}
      <mesh
        ref={meshRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[size, size, 32, 32]} />
        <meshStandardMaterial
          color={grassColor}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Grass Blades (Instanced for performance) */}
      <GrassBlades
        count={Math.floor(500 * grassDensity)}
        size={size}
        color={grassColor}
      />

      {/* Soil Patches for variety */}
      <SoilPatches size={size} soilColor={soilColor} />

      {/* Grid Overlay */}
      {showGrid && (
        <gridHelper
          args={[size, size, new Color('#4a7c2f'), new Color('#6b8e4e')]}
          position={[0, 0.01, 0]}
        />
      )}
    </>
  );
}

// Grass Blades Component
function GrassBlades({ count, size, color }: { count: number; size: number; color: string }) {
  const meshRef = useRef<InstancedMesh>(null);

  const dummy = useMemo(() => new Object3D(), []);

  useMemo(() => {
    if (!meshRef.current) return;

    const halfSize = size / 2;

    for (let i = 0; i < count; i++) {
      // Random position within ground bounds
      const x = MathUtils.randFloatSpread(size - 2);
      const z = MathUtils.randFloatSpread(size - 2);
      const y = 0;

      // Random rotation
      const rotation = Math.random() * Math.PI * 2;

      // Random scale for variety
      const scaleVariation = 0.5 + Math.random() * 0.5;

      dummy.position.set(x, y, z);
      dummy.rotation.set(0, rotation, 0);
      dummy.scale.set(scaleVariation, scaleVariation, scaleVariation);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, size, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow>
      <coneGeometry args={[0.02, 0.3, 3]} />
      <meshStandardMaterial
        color={color}
        roughness={0.9}
        metalness={0}
        flatShading
      />
    </instancedMesh>
  );
}

// Soil Patches for Ground Variety
function SoilPatches({ size, soilColor }: { size: number; soilColor: string }) {
  const patchCount = 8;
  const halfSize = size / 2;

  const patches = useMemo(() => {
    return Array.from({ length: patchCount }, (_, i) => ({
      position: [
        MathUtils.randFloatSpread(size * 0.8),
        0.005,
        MathUtils.randFloatSpread(size * 0.8),
      ] as [number, number, number],
      rotation: Math.random() * Math.PI * 2,
      scale: 0.5 + Math.random() * 1.5,
    }));
  }, [size]);

  return (
    <>
      {patches.map((patch, i) => (
        <mesh
          key={i}
          position={patch.position}
          rotation={[-Math.PI / 2, 0, patch.rotation]}
          receiveShadow
        >
          <circleGeometry args={[patch.scale, 16]} />
          <meshStandardMaterial
            color={soilColor}
            roughness={1}
            metalness={0}
          />
        </mesh>
      ))}
    </>
  );
}

// Decorative Rocks
export function DecorativeRocks({ count = 15, size }: { count?: number; size: number }) {
  const rocks = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        MathUtils.randFloatSpread(size * 0.9),
        0.1,
        MathUtils.randFloatSpread(size * 0.9),
      ] as [number, number, number],
      rotation: [
        Math.random() * 0.3,
        Math.random() * Math.PI * 2,
        Math.random() * 0.3,
      ] as [number, number, number],
      scale: 0.1 + Math.random() * 0.2,
    }));
  }, [count, size]);

  return (
    <>
      {rocks.map((rock, i) => (
        <mesh
          key={i}
          position={rock.position}
          rotation={rock.rotation}
          scale={rock.scale}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#8b8680"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}
    </>
  );
}
