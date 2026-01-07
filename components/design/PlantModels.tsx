"use client";

import { useRef } from "react";
import { Mesh } from "three";
import { PlacedPlant } from "@/lib/plantData";
import { calculatePlantSize } from "@/lib/plantData";

interface PlantModelProps {
  plant: PlacedPlant;
  onClick?: () => void;
}

// Simplified placeholder models - will be replaced with real 3D models later
export function PlantModel({ plant, onClick }: PlantModelProps) {
  const meshRef = useRef<Mesh>(null);
  const size = calculatePlantSize(plant.speciesId, plant.age, plant.scale);

  // Different shapes for different plant types
  switch (plant.speciesId) {
    case 'acer-palmatum':
      return <JapaneseMapleModel plant={plant} size={size} onClick={onClick} />;
    case 'chamaecyparis-pisifera':
      return <SawaraCypressModel plant={plant} size={size} onClick={onClick} />;
    case 'cedrus-atlantica-glauca-pendula':
      return <WeepingCedarModel plant={plant} size={size} onClick={onClick} />;
    default:
      return <DefaultPlantModel plant={plant} size={size} onClick={onClick} />;
  }
}

function JapaneseMapleModel({ plant, size, onClick }: any) {
  const heightScale = size.height / 5; // Normalize to model size
  const widthScale = size.width / 5;

  return (
    <group
      position={[plant.position.x, 0, plant.position.z]}
      rotation={[0, plant.rotation, 0]}
      onClick={onClick}
    >
      {/* Trunk */}
      <mesh position={[0, heightScale * 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.15 * widthScale, 0.2 * widthScale, heightScale * 0.6, 8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Canopy - rounded, multiple spheres for Japanese Maple character */}
      <mesh position={[0, heightScale * 0.8, 0]} castShadow>
        <sphereGeometry args={[widthScale * 0.5, 8, 8]} />
        <meshStandardMaterial
          color={plant.selected ? "#ff6b6b" : "#8B0000"}
          emissive={plant.selected ? "#ff6b6b" : "#000000"}
          emissiveIntensity={plant.selected ? 0.3 : 0}
        />
      </mesh>
      <mesh position={[-widthScale * 0.3, heightScale * 0.7, widthScale * 0.2]} castShadow>
        <sphereGeometry args={[widthScale * 0.35, 8, 8]} />
        <meshStandardMaterial
          color={plant.selected ? "#ff8787" : "#a52a2a"}
        />
      </mesh>
      <mesh position={[widthScale * 0.3, heightScale * 0.75, -widthScale * 0.2]} castShadow>
        <sphereGeometry args={[widthScale * 0.4, 8, 8]} />
        <meshStandardMaterial
          color={plant.selected ? "#ff9999" : "#cd5c5c"}
        />
      </mesh>

      {/* Selection indicator */}
      {plant.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[widthScale * 0.7, widthScale * 0.75, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

function SawaraCypressModel({ plant, size, onClick }: any) {
  const heightScale = size.height / 10; // Taller tree
  const widthScale = size.width / 5;

  return (
    <group
      position={[plant.position.x, 0, plant.position.z]}
      rotation={[0, plant.rotation, 0]}
      onClick={onClick}
    >
      {/* Trunk */}
      <mesh position={[0, heightScale * 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.2 * widthScale, 0.3 * widthScale, heightScale * 0.8, 8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Pyramidal canopy - stacked cones for cypress shape */}
      <mesh position={[0, heightScale * 1.2, 0]} castShadow>
        <coneGeometry args={[widthScale * 0.8, heightScale * 1.2, 8]} />
        <meshStandardMaterial
          color={plant.selected ? "#4ade80" : "#228B22"}
          emissive={plant.selected ? "#4ade80" : "#000000"}
          emissiveIntensity={plant.selected ? 0.3 : 0}
        />
      </mesh>
      <mesh position={[0, heightScale * 1.7, 0]} castShadow>
        <coneGeometry args={[widthScale * 0.6, heightScale * 0.8, 8]} />
        <meshStandardMaterial
          color={plant.selected ? "#5eea90" : "#2e8b57"}
        />
      </mesh>

      {/* Selection indicator */}
      {plant.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[widthScale * 0.9, widthScale * 0.95, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

function WeepingCedarModel({ plant, size, onClick }: any) {
  const heightScale = size.height / 5;
  const widthScale = size.width / 5;

  return (
    <group
      position={[plant.position.x, 0, plant.position.z]}
      rotation={[0, plant.rotation, 0]}
      onClick={onClick}
    >
      {/* Central trunk - shorter for weeping form */}
      <mesh position={[0, heightScale * 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.25 * widthScale, 0.3 * widthScale, heightScale * 0.7, 8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Weeping canopy - cascading form with offset spheres */}
      <mesh position={[0, heightScale * 0.7, 0]} castShadow>
        <sphereGeometry args={[widthScale * 0.4, 8, 8]} />
        <meshStandardMaterial
          color={plant.selected ? "#87CEEB" : "#4682B4"}
          emissive={plant.selected ? "#87CEEB" : "#000000"}
          emissiveIntensity={plant.selected ? 0.3 : 0}
        />
      </mesh>

      {/* Cascading/weeping branches */}
      <mesh position={[widthScale * 0.4, heightScale * 0.4, 0]} castShadow>
        <sphereGeometry args={[widthScale * 0.35, 8, 8]} />
        <meshStandardMaterial color={plant.selected ? "#9fd7f0" : "#5f9ea0"} />
      </mesh>
      <mesh position={[-widthScale * 0.4, heightScale * 0.35, 0]} castShadow>
        <sphereGeometry args={[widthScale * 0.38, 8, 8]} />
        <meshStandardMaterial color={plant.selected ? "#add8e6" : "#6ca6cd"} />
      </mesh>
      <mesh position={[0, heightScale * 0.25, widthScale * 0.5]} castShadow>
        <sphereGeometry args={[widthScale * 0.33, 8, 8]} />
        <meshStandardMaterial color={plant.selected ? "#b0e0e6" : "#4682b4"} />
      </mesh>
      <mesh position={[0, heightScale * 0.28, -widthScale * 0.5]} castShadow>
        <sphereGeometry args={[widthScale * 0.36, 8, 8]} />
        <meshStandardMaterial color={plant.selected ? "#afeeee" : "#5f9ea0"} />
      </mesh>

      {/* Selection indicator */}
      {plant.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[widthScale * 1.1, widthScale * 1.15, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

function DefaultPlantModel({ plant, size, onClick }: any) {
  return (
    <group
      position={[plant.position.x, 0, plant.position.z]}
      rotation={[0, plant.rotation, 0]}
      onClick={onClick}
    >
      <mesh position={[0, size.height / 2, 0]} castShadow>
        <sphereGeometry args={[size.width / 2, 8, 8]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}
