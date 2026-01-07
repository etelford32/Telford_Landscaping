/**
 * HouseModel - 3D House Component
 * Renders different house styles with proper materials and details
 */

import { useRef } from 'react';
import { Mesh, Group } from 'three';
import { House } from '@/lib/editor/SceneManager';

interface HouseModelProps {
  house: House;
  onClick?: () => void;
  isSelected?: boolean;
}

export function HouseModel({ house, onClick, isSelected = false }: HouseModelProps) {
  const groupRef = useRef<Group>(null);

  const { position, rotation, scale, style, color } = house;

  // Selection highlight color
  const outlineColor = isSelected ? '#fbbf24' : undefined;
  const emissive = isSelected ? '#fbbf24' : '#000000';
  const emissiveIntensity = isSelected ? 0.2 : 0;

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      rotation={[0, rotation, 0]}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {style === 'modern' && <ModernHouse color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />}
      {style === 'traditional' && <TraditionalHouse color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />}
      {style === 'cottage' && <CottageHouse color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />}

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.5, 5, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

// Modern House Style
function ModernHouse({ color, emissive, emissiveIntensity }: { color: string; emissive: string; emissiveIntensity: number }) {
  return (
    <>
      {/* Main House Body */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 3, 4]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />
      </mesh>

      {/* Flat Modern Roof */}
      <mesh position={[0, 3.1, 0]} castShadow>
        <boxGeometry args={[3.2, 0.2, 4.2]} />
        <meshStandardMaterial color="#4a5568" emissive={emissive} emissiveIntensity={emissiveIntensity} />
      </mesh>

      {/* Glass Windows */}
      <mesh position={[1.51, 1.5, 0]} castShadow>
        <boxGeometry args={[0.02, 1.5, 1]} />
        <meshStandardMaterial color="#89CFF0" transparent opacity={0.6} metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[-1.51, 1.5, 0]} castShadow>
        <boxGeometry args={[0.02, 1.5, 1]} />
        <meshStandardMaterial color="#89CFF0" transparent opacity={0.6} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Modern Door */}
      <mesh position={[0, 0.8, 2.01]} castShadow>
        <boxGeometry args={[0.7, 1.6, 0.1]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>

      {/* Garage */}
      <mesh position={[2.5, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 2.4, 3]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />
      </mesh>

      <mesh position={[2.5, 0.8, 1.51]} castShadow>
        <boxGeometry args={[1.8, 1.6, 0.1]} />
        <meshStandardMaterial color="#718096" />
      </mesh>
    </>
  );
}

// Traditional House Style
function TraditionalHouse({ color, emissive, emissiveIntensity }: { color: string; emissive: string; emissiveIntensity: number }) {
  return (
    <>
      {/* Main Body */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.5, 3, 4]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />
      </mesh>

      {/* Pitched Roof */}
      <mesh position={[0, 3.5, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[3, 2, 4]} />
        <meshStandardMaterial color="#8b4513" emissive={emissive} emissiveIntensity={emissiveIntensity} />
      </mesh>

      {/* Windows */}
      <mesh position={[1, 1.8, 2.01]}>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#4a90e2" transparent opacity={0.7} />
      </mesh>

      <mesh position={[-1, 1.8, 2.01]}>
        <boxGeometry args={[0.6, 0.6, 0.05]} />
        <meshStandardMaterial color="#4a90e2" transparent opacity={0.7} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.9, 2.01]} castShadow>
        <boxGeometry args={[0.8, 1.8, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Door Handle */}
      <mesh position={[0.3, 0.9, 2.1]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Chimney */}
      <mesh position={[1.2, 4.2, 0.5]} castShadow>
        <boxGeometry args={[0.4, 1.4, 0.4]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </>
  );
}

// Cottage House Style
function CottageHouse({ color, emissive, emissiveIntensity }: { color: string; emissive: string; emissiveIntensity: number }) {
  return (
    <>
      {/* Main Body - Smaller */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 2.4, 3.2]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />
      </mesh>

      {/* Thatched Roof */}
      <mesh position={[0, 2.8, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[2.5, 1.8, 4]} />
        <meshStandardMaterial color="#d4a574" roughness={0.9} emissive={emissive} emissiveIntensity={emissiveIntensity} />
      </mesh>

      {/* Round Windows */}
      <mesh position={[0.8, 1.5, 1.61]}>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
        <meshStandardMaterial color="#5dade2" transparent opacity={0.7} />
      </mesh>

      <mesh position={[-0.8, 1.5, 1.61]}>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
        <meshStandardMaterial color="#5dade2" transparent opacity={0.7} />
      </mesh>

      {/* Arched Door */}
      <mesh position={[0, 0.7, 1.61]} castShadow>
        <boxGeometry args={[0.7, 1.4, 0.1]} />
        <meshStandardMaterial color="#7f5539" />
      </mesh>

      {/* Door Arch */}
      <mesh position={[0, 1.4, 1.61]}>
        <cylinderGeometry args={[0.35, 0.35, 0.1, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#7f5539" />
      </mesh>

      {/* Garden Stone Path */}
      <mesh position={[0, 0.05, 3.5]} receiveShadow>
        <boxGeometry args={[0.8, 0.05, 2]} />
        <meshStandardMaterial color="#9e9e9e" roughness={0.8} />
      </mesh>
    </>
  );
}
