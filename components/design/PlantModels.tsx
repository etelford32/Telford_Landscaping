"use client";

import { useRef } from "react";
import { Mesh } from "three";
import { PlacedPlant, getPlantSpecies } from "@/lib/plantData";
import { calculatePlantSize } from "@/lib/plantData";

interface PlantModelProps {
  plant: PlacedPlant;
  onClick?: () => void;
}

// Generic plant rendering using shape type data
export function PlantModel({ plant, onClick }: PlantModelProps) {
  const meshRef = useRef<Mesh>(null);
  const size = calculatePlantSize(plant.speciesId, plant.age, plant.scale);
  const species = getPlantSpecies(plant.speciesId);

  if (!species) {
    return <DefaultPlantModel plant={plant} size={size} onClick={onClick} color="#22c55e" />;
  }

  // Route to appropriate model based on shape type
  switch (species.growthData.shapeType) {
    case 'rounded':
      return <RoundedPlantModel plant={plant} size={size} species={species} onClick={onClick} />;
    case 'pyramidal':
      return <PyramidalPlantModel plant={plant} size={size} species={species} onClick={onClick} />;
    case 'weeping':
      return <WeepingPlantModel plant={plant} size={size} species={species} onClick={onClick} />;
    case 'vase':
      return <VasePlantModel plant={plant} size={size} species={species} onClick={onClick} />;
    case 'columnar':
      return <ColumnarPlantModel plant={plant} size={size} species={species} onClick={onClick} />;
    default:
      return <DefaultPlantModel plant={plant} size={size} onClick={onClick} color={species.color} />;
  }
}

// Rounded shape (oaks, maples, most shrubs)
function RoundedPlantModel({ plant, size, species, onClick }: any) {
  const heightScale = size.height / 5;
  const widthScale = size.width / 5;
  const category = species.category;

  // Adjust proportions based on category
  const trunkHeight = category === 'tree' ? 0.6 : category === 'shrub' ? 0.3 : 0.1;
  const canopyStart = category === 'tree' ? 0.8 : category === 'shrub' ? 0.6 : 0.5;

  return (
    <group
      position={[plant.position.x, 0, plant.position.z]}
      rotation={[0, plant.rotation, 0]}
      onClick={onClick}
    >
      {/* Trunk - only for trees and shrubs */}
      {category !== 'ground-cover' && category !== 'perennial' && (
        <mesh position={[0, heightScale * (trunkHeight / 2), 0]} castShadow>
          <cylinderGeometry args={[
            0.15 * widthScale,
            0.2 * widthScale,
            heightScale * trunkHeight,
            8
          ]} />
          <meshStandardMaterial color="#654321" roughness={0.9} />
        </mesh>
      )}

      {/* Main canopy - multiple spheres for natural look */}
      <mesh position={[0, heightScale * canopyStart, 0]} castShadow receiveShadow>
        <sphereGeometry args={[widthScale * 0.5, 12, 12]} />
        <meshStandardMaterial
          color={plant.selected ? adjustColorBrightness(species.color, 40) : species.color}
          emissive={plant.selected ? species.color : "#000000"}
          emissiveIntensity={plant.selected ? 0.2 : 0}
          roughness={0.8}
        />
      </mesh>

      {/* Additional spheres for volume */}
      {size.width > 3 && (
        <>
          <mesh position={[-widthScale * 0.25, heightScale * (canopyStart - 0.1), widthScale * 0.2]} castShadow receiveShadow>
            <sphereGeometry args={[widthScale * 0.35, 10, 10]} />
            <meshStandardMaterial
              color={adjustColorBrightness(species.color, -10)}
              roughness={0.85}
            />
          </mesh>
          <mesh position={[widthScale * 0.25, heightScale * (canopyStart - 0.05), -widthScale * 0.2]} castShadow receiveShadow>
            <sphereGeometry args={[widthScale * 0.38, 10, 10]} />
            <meshStandardMaterial
              color={adjustColorBrightness(species.color, 5)}
              roughness={0.82}
            />
          </mesh>
        </>
      )}

      {/* Selection indicator */}
      {plant.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[widthScale * 0.6, widthScale * 0.65, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// Pyramidal shape (conifers, some evergreens)
function PyramidalPlantModel({ plant, size, species, onClick }: any) {
  const heightScale = size.height / 10;
  const widthScale = size.width / 5;

  return (
    <group
      position={[plant.position.x, 0, plant.position.z]}
      rotation={[0, plant.rotation, 0]}
      onClick={onClick}
    >
      {/* Trunk */}
      <mesh position={[0, heightScale * 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.15 * widthScale, 0.25 * widthScale, heightScale * 0.8, 8]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>

      {/* Pyramidal canopy - layered cones */}
      <mesh position={[0, heightScale * 1.3, 0]} castShadow receiveShadow>
        <coneGeometry args={[widthScale * 0.8, heightScale * 1.5, 10]} />
        <meshStandardMaterial
          color={plant.selected ? adjustColorBrightness(species.color, 40) : species.color}
          emissive={plant.selected ? species.color : "#000000"}
          emissiveIntensity={plant.selected ? 0.2 : 0}
          roughness={0.85}
        />
      </mesh>
      <mesh position={[0, heightScale * 1.8, 0]} castShadow receiveShadow>
        <coneGeometry args={[widthScale * 0.55, heightScale * 0.9, 10]} />
        <meshStandardMaterial
          color={adjustColorBrightness(species.color, 10)}
          roughness={0.82}
        />
      </mesh>

      {/* Selection indicator */}
      {plant.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[widthScale * 0.9, widthScale * 0.95, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// Weeping shape (weeping willows, weeping cedars)
function WeepingPlantModel({ plant, size, species, onClick }: any) {
  const heightScale = size.height / 5;
  const widthScale = size.width / 5;

  return (
    <group
      position={[plant.position.x, 0, plant.position.z]}
      rotation={[0, plant.rotation, 0]}
      onClick={onClick}
    >
      {/* Central trunk */}
      <mesh position={[0, heightScale * 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.2 * widthScale, 0.25 * widthScale, heightScale * 0.7, 8]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>

      {/* Top crown */}
      <mesh position={[0, heightScale * 0.75, 0]} castShadow receiveShadow>
        <sphereGeometry args={[widthScale * 0.35, 10, 10]} />
        <meshStandardMaterial
          color={plant.selected ? adjustColorBrightness(species.color, 40) : species.color}
          emissive={plant.selected ? species.color : "#000000"}
          emissiveIntensity={plant.selected ? 0.2 : 0}
          roughness={0.8}
        />
      </mesh>

      {/* Cascading/weeping branches - positioned lower */}
      <mesh position={[widthScale * 0.45, heightScale * 0.35, 0]} castShadow receiveShadow>
        <sphereGeometry args={[widthScale * 0.32, 10, 10]} />
        <meshStandardMaterial color={adjustColorBrightness(species.color, -5)} roughness={0.82} />
      </mesh>
      <mesh position={[-widthScale * 0.45, heightScale * 0.3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[widthScale * 0.35, 10, 10]} />
        <meshStandardMaterial color={adjustColorBrightness(species.color, -8)} roughness={0.83} />
      </mesh>
      <mesh position={[0, heightScale * 0.25, widthScale * 0.55]} castShadow receiveShadow>
        <sphereGeometry args={[widthScale * 0.3, 10, 10]} />
        <meshStandardMaterial color={adjustColorBrightness(species.color, -3)} roughness={0.81} />
      </mesh>
      <mesh position={[0, heightScale * 0.27, -widthScale * 0.55]} castShadow receiveShadow>
        <sphereGeometry args={[widthScale * 0.33, 10, 10]} />
        <meshStandardMaterial color={adjustColorBrightness(species.color, -6)} roughness={0.84} />
      </mesh>

      {/* Selection indicator */}
      {plant.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[widthScale * 1.1, widthScale * 1.15, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// Vase shape (redbuds, some flowering trees)
function VasePlantModel({ plant, size, species, onClick }: any) {
  const heightScale = size.height / 5;
  const widthScale = size.width / 5;

  return (
    <group
      position={[plant.position.x, 0, plant.position.z]}
      rotation={[0, plant.rotation, 0]}
      onClick={onClick}
    >
      {/* Multiple trunks spreading from base */}
      {[-0.15, 0, 0.15].map((offset, i) => (
        <mesh
          key={i}
          position={[offset * widthScale, heightScale * 0.35, 0]}
          rotation={[0, 0, offset * 0.2]}
          castShadow
        >
          <cylinderGeometry args={[0.12 * widthScale, 0.15 * widthScale, heightScale * 0.7, 6]} />
          <meshStandardMaterial color="#654321" roughness={0.9} />
        </mesh>
      ))}

      {/* Vase-shaped canopy - wider at top */}
      <mesh position={[0, heightScale * 0.85, 0]} castShadow receiveShadow>
        <sphereGeometry args={[widthScale * 0.55, 10, 10]} />
        <meshStandardMaterial
          color={plant.selected ? adjustColorBrightness(species.color, 40) : species.color}
          emissive={plant.selected ? species.color : "#000000"}
          emissiveIntensity={plant.selected ? 0.2 : 0}
          roughness={0.8}
        />
      </mesh>

      {/* Side masses for vase shape */}
      <mesh position={[-widthScale * 0.4, heightScale * 0.75, 0]} castShadow receiveShadow>
        <sphereGeometry args={[widthScale * 0.35, 10, 10]} />
        <meshStandardMaterial color={adjustColorBrightness(species.color, -5)} roughness={0.82} />
      </mesh>
      <mesh position={[widthScale * 0.4, heightScale * 0.75, 0]} castShadow receiveShadow>
        <sphereGeometry args={[widthScale * 0.35, 10, 10]} />
        <meshStandardMaterial color={adjustColorBrightness(species.color, -5)} roughness={0.82} />
      </mesh>

      {/* Selection indicator */}
      {plant.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[widthScale * 0.7, widthScale * 0.75, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// Columnar shape (redwoods, columnar evergreens)
function ColumnarPlantModel({ plant, size, species, onClick }: any) {
  const heightScale = size.height / 20; // Very tall
  const widthScale = size.width / 5;

  return (
    <group
      position={[plant.position.x, 0, plant.position.z]}
      rotation={[0, plant.rotation, 0]}
      onClick={onClick}
    >
      {/* Trunk - straight and tall */}
      <mesh position={[0, heightScale * 1, 0]} castShadow>
        <cylinderGeometry args={[0.2 * widthScale, 0.3 * widthScale, heightScale * 2, 10]} />
        <meshStandardMaterial color="#654321" roughness={0.9} />
      </mesh>

      {/* Columnar canopy - narrow cylinder */}
      <mesh position={[0, heightScale * 2.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[widthScale * 0.6, widthScale * 0.7, heightScale * 3, 12]} />
        <meshStandardMaterial
          color={plant.selected ? adjustColorBrightness(species.color, 40) : species.color}
          emissive={plant.selected ? species.color : "#000000"}
          emissiveIntensity={plant.selected ? 0.2 : 0}
          roughness={0.85}
        />
      </mesh>

      {/* Top cone */}
      <mesh position={[0, heightScale * 4.2, 0]} castShadow receiveShadow>
        <coneGeometry args={[widthScale * 0.5, heightScale * 0.8, 12]} />
        <meshStandardMaterial
          color={adjustColorBrightness(species.color, 10)}
          roughness={0.82}
        />
      </mesh>

      {/* Selection indicator */}
      {plant.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[widthScale * 0.8, widthScale * 0.85, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// Default fallback model
function DefaultPlantModel({ plant, size, onClick, color }: any) {
  const heightScale = size.height / 5;
  const widthScale = size.width / 5;

  return (
    <group
      position={[plant.position.x, 0, plant.position.z]}
      rotation={[0, plant.rotation, 0]}
      onClick={onClick}
    >
      <mesh position={[0, heightScale * 0.5, 0]} castShadow receiveShadow>
        <sphereGeometry args={[widthScale * 0.5, 10, 10]} />
        <meshStandardMaterial
          color={plant.selected ? adjustColorBrightness(color, 40) : color}
          emissive={plant.selected ? color : "#000000"}
          emissiveIntensity={plant.selected ? 0.2 : 0}
          roughness={0.8}
        />
      </mesh>

      {plant.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[widthScale * 0.6, widthScale * 0.65, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Adjust brightness
  const adjust = (val: number) => Math.max(0, Math.min(255, val + (val * percent) / 100));

  const newR = Math.round(adjust(r));
  const newG = Math.round(adjust(g));
  const newB = Math.round(adjust(b));

  // Convert back to hex
  return '#' + [newR, newG, newB]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
}
