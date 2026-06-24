"use client";

import { memo, useRef } from "react";
import { Mesh } from "three";
import { PlacedStructure } from "@/lib/structureData";
import { calculateStructureSize } from "@/lib/structureData";

interface StructureModelProps {
  structure: PlacedStructure;
  onClick?: () => void;
}

// Main component that routes to specific structure models
function StructureModelImpl({ structure, onClick }: StructureModelProps) {
  const size = calculateStructureSize(
    structure.structureId,
    structure.scale,
    structure.customDimensions
  );

  // Route to specific model based on structure ID
  switch (structure.structureId) {
    // Hardscape
    case 'flagstone-patio':
    case 'concrete-patio':
    case 'brick-patio':
      return <PatioModel structure={structure} size={size} onClick={onClick} />;
    case 'wood-deck':
    case 'composite-deck':
      return <DeckModel structure={structure} size={size} onClick={onClick} />;
    case 'gravel-courtyard':
      return <CourtyardModel structure={structure} size={size} onClick={onClick} />;

    // Vertical structures
    case 'wood-fence':
    case 'horizontal-fence':
    case 'picket-fence':
      return <FenceModel structure={structure} size={size} onClick={onClick} />;
    case 'stone-retaining-wall':
    case 'gabion-wall':
    case 'concrete-block-wall':
    case 'stucco-wall':
    case 'dry-stack-stone-wall':
    case 'brick-garden-wall':
    case 'boulder-wall':
    case 'wood-retaining-wall':
      return <WallModel structure={structure} size={size} onClick={onClick} />;

    // Overhead structures
    case 'wood-pergola':
    case 'modern-pergola':
    case 'louvered-pergola':
      return <PergolaModel structure={structure} size={size} onClick={onClick} />;
    case 'garden-arbor':
      return <ArborModel structure={structure} size={size} onClick={onClick} />;
    case 'shade-sail':
      return <ShadeSailModel structure={structure} size={size} onClick={onClick} />;

    // Water features
    case 'natural-pond':
      return <PondModel structure={structure} size={size} onClick={onClick} />;
    case 'fountain-feature':
      return <FountainModel structure={structure} size={size} onClick={onClick} />;
    case 'bubbling-rock':
      return <BubblingRockModel structure={structure} size={size} onClick={onClick} />;
    case 'water-wall':
      return <WaterWallModel structure={structure} size={size} onClick={onClick} />;

    // Outdoor living
    case 'outdoor-kitchen':
      return <OutdoorKitchenModel structure={structure} size={size} onClick={onClick} />;
    case 'fire-pit':
    case 'modern-fire-feature':
      return <FirePitModel structure={structure} size={size} onClick={onClick} />;
    case 'pizza-oven':
      return <PizzaOvenModel structure={structure} size={size} onClick={onClick} />;
    case 'outdoor-shower':
      return <OutdoorShowerModel structure={structure} size={size} onClick={onClick} />;
    case 'raised-planter':
      return <RaisedPlanterModel structure={structure} size={size} onClick={onClick} />;

    // Paths
    case 'concrete-paver-path':
    case 'stone-paver-path':
    case 'rubble-path':
    case 'decomposed-granite-path':
    case 'crushed-rock-path':
    case 'pea-gravel-path':
    case 'sand-path':
    case 'stepping-stone-path':
    case 'brick-path':
      return <PathModel structure={structure} size={size} onClick={onClick} />;

    default:
      return <DefaultStructureModel structure={structure} size={size} onClick={onClick} />;
  }
}

// ===== HARDSCAPE MODELS =====

function PatioModel({ structure, size, onClick }: any) {
  const material = structure.structureId === 'flagstone-patio' ? '#D2B48C' :
                   structure.structureId === 'brick-patio' ? '#B22222' : '#A9A9A9';

  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Main patio surface */}
      <mesh position={[0, size.height / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshStandardMaterial
          color={structure.selected ? '#ffeb3b' : material}
          emissive={structure.selected ? '#ffeb3b' : '#000000'}
          emissiveIntensity={structure.selected ? 0.2 : 0}
          roughness={0.9}
        />
      </mesh>

      {/* Decorative grid pattern */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh
          key={`line-x-${i}`}
          position={[size.width * (i / 4 - 0.375), size.height + 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.05, size.depth]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.1} />
        </mesh>
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh
          key={`line-z-${i}`}
          position={[0, size.height + 0.02, size.depth * (i / 4 - 0.375)]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[size.width, 0.05]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.1} />
        </mesh>
      ))}

      {/* Selection indicator */}
      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(size.width, size.depth) * 0.6, Math.max(size.width, size.depth) * 0.62, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function DeckModel({ structure, size, onClick }: any) {
  const deckColor = structure.structureId === 'wood-deck' ? '#8B4513' : '#696969';
  const numPlanks = Math.floor(size.depth / 0.5);

  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Support posts */}
      {[
        [-size.width / 2.5, -size.depth / 2.5],
        [size.width / 2.5, -size.depth / 2.5],
        [-size.width / 2.5, size.depth / 2.5],
        [size.width / 2.5, size.depth / 2.5],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, size.height / 2, z]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, size.height, 8]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      ))}

      {/* Deck planks */}
      {Array.from({ length: numPlanks }).map((_, i) => (
        <mesh
          key={i}
          position={[0, size.height, (i - numPlanks / 2) * 0.5 + 0.25]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[size.width, 0.2, 0.4]} />
          <meshStandardMaterial
            color={structure.selected ? '#ffeb3b' : deckColor}
            emissive={structure.selected ? '#ffeb3b' : '#000000'}
            emissiveIntensity={structure.selected ? 0.2 : 0}
            roughness={0.8}
          />
        </mesh>
      ))}

      {/* Railing */}
      <group position={[0, size.height + 1.5, size.depth / 2]}>
        <mesh castShadow>
          <boxGeometry args={[size.width, 0.1, 0.1]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      </group>

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(size.width, size.depth) * 0.6, Math.max(size.width, size.depth) * 0.62, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function CourtyardModel({ structure, size, onClick }: any) {
  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      <mesh position={[0, size.height / 2, 0]} receiveShadow>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshStandardMaterial
          color={structure.selected ? '#ffeb3b' : '#D2B48C'}
          emissive={structure.selected ? '#ffeb3b' : '#000000'}
          emissiveIntensity={structure.selected ? 0.2 : 0}
          roughness={1}
        />
      </mesh>

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(size.width, size.depth) * 0.6, Math.max(size.width, size.depth) * 0.62, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// ===== VERTICAL STRUCTURE MODELS =====

function FenceModel({ structure, size, onClick }: any) {
  const isHorizontal = structure.structureId === 'horizontal-fence';
  const isPicket = structure.structureId === 'picket-fence';
  const fenceColor = isPicket ? '#FFFFFF' : isHorizontal ? '#3E2723' : '#DEB887';

  const numPosts = Math.floor(size.width / 4) + 1;
  const numSlats = isHorizontal ? 8 : Math.floor(size.width / 0.3);

  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Posts */}
      {Array.from({ length: numPosts }).map((_, i) => (
        <mesh
          key={`post-${i}`}
          position={[(i / (numPosts - 1) - 0.5) * size.width, size.height / 2, 0]}
          castShadow
        >
          <boxGeometry args={[0.2, size.height, 0.2]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      ))}

      {/* Fence boards/slats */}
      {isHorizontal ? (
        // Horizontal slats
        Array.from({ length: numSlats }).map((_, i) => (
          <mesh
            key={`slat-${i}`}
            position={[0, (i / numSlats) * size.height + 0.5, 0]}
            castShadow
          >
            <boxGeometry args={[size.width, 0.15, 0.05]} />
            <meshStandardMaterial
              color={structure.selected ? '#ffeb3b' : fenceColor}
              emissive={structure.selected ? '#ffeb3b' : '#000000'}
              emissiveIntensity={structure.selected ? 0.2 : 0}
            />
          </mesh>
        ))
      ) : (
        // Vertical boards
        Array.from({ length: numSlats }).map((_, i) => (
          <mesh
            key={`board-${i}`}
            position={[(i / numSlats - 0.5) * size.width, size.height / 2, 0]}
            castShadow
          >
            <boxGeometry args={[0.15, size.height - 0.5, 0.05]} />
            <meshStandardMaterial
              color={structure.selected ? '#ffeb3b' : fenceColor}
              emissive={structure.selected ? '#ffeb3b' : '#000000'}
              emissiveIntensity={structure.selected ? 0.2 : 0}
            />
          </mesh>
        ))
      )}

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size.width * 0.5, size.width * 0.52, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function WallModel({ structure, size, onClick }: any) {
  const getWallColor = () => {
    switch (structure.structureId) {
      case 'gabion-wall': return '#708090'; // Slate gray
      case 'concrete-block-wall': return '#9E9E9E'; // Gray concrete
      case 'stucco-wall': return '#F5E6D3'; // Cream stucco
      case 'dry-stack-stone-wall': return '#7A6E5D'; // Stone brown
      case 'brick-garden-wall': return '#9B5448'; // Red brick
      case 'boulder-wall': return '#696969'; // Dim gray
      case 'wood-retaining-wall': return '#6D5C47'; // Dark wood
      case 'stone-retaining-wall': return '#808080'; // Gray
      default: return '#808080';
    }
  };

  const isGabion = structure.structureId === 'gabion-wall';
  const isBrick = structure.structureId === 'brick-garden-wall';
  const isWood = structure.structureId === 'wood-retaining-wall';
  const isBoulder = structure.structureId === 'boulder-wall';
  const isStucco = structure.structureId === 'stucco-wall';
  const isDryStack = structure.structureId === 'dry-stack-stone-wall';

  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {isBoulder ? (
        // Boulder wall - large individual rocks
        <>
          {Array.from({ length: Math.floor(size.width / 2.5) * Math.floor(size.height / 1.5) }, (_, i) => {
            const col = i % Math.floor(size.width / 2.5);
            const row = Math.floor(i / Math.floor(size.width / 2.5));
            const x = -size.width / 2 + col * 2.5 + 1.25;
            const y = row * 1.5 + 0.75;
            const z = (Math.random() - 0.5) * size.depth * 0.8;
            const scale = 0.7 + Math.random() * 0.3;
            return (
              <mesh key={i} position={[x, y, z]} castShadow receiveShadow>
                <sphereGeometry args={[scale, 8, 6]} />
                <meshStandardMaterial
                  color={structure.selected ? '#ffeb3b' : getWallColor()}
                  emissive={structure.selected ? '#ffeb3b' : '#000000'}
                  emissiveIntensity={structure.selected ? 0.2 : 0}
                  roughness={0.95}
                />
              </mesh>
            );
          })}
        </>
      ) : isWood ? (
        // Wood wall - horizontal timbers
        <>
          {Array.from({ length: Math.floor(size.height / 0.67) }, (_, i) => (
            <mesh key={i} position={[0, i * 0.67 + 0.33, 0]} castShadow receiveShadow>
              <boxGeometry args={[size.width, 0.6, size.depth]} />
              <meshStandardMaterial
                color={structure.selected ? '#ffeb3b' : getWallColor()}
                emissive={structure.selected ? '#ffeb3b' : '#000000'}
                emissiveIntensity={structure.selected ? 0.2 : 0}
                roughness={0.8}
              />
            </mesh>
          ))}
          {/* Support posts */}
          {Array.from({ length: Math.floor(size.width / 4) + 1 }, (_, i) => (
            <mesh key={`post-${i}`} position={[-size.width / 2 + i * 4, size.height / 2, -size.depth / 2]} castShadow>
              <boxGeometry args={[0.3, size.height, 0.3]} />
              <meshStandardMaterial color="#4A3A2A" roughness={0.9} />
            </mesh>
          ))}
        </>
      ) : (
        <>
          {/* Main wall structure */}
          <mesh position={[0, size.height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[size.width, size.height, size.depth]} />
            <meshStandardMaterial
              color={structure.selected ? '#ffeb3b' : getWallColor()}
              emissive={structure.selected ? '#ffeb3b' : '#000000'}
              emissiveIntensity={structure.selected ? 0.2 : 0}
              roughness={isStucco ? 0.7 : 0.95}
            />
          </mesh>

          {/* Texture patterns */}
          {isBrick && Array.from({ length: Math.floor(size.height / 0.33) }).map((_, row) => (
            <group key={row}>
              {Array.from({ length: Math.floor(size.width / 0.67) }).map((_, col) => {
                const offset = row % 2 === 0 ? 0 : 0.33;
                return (
                  <mesh
                    key={`brick-${row}-${col}`}
                    position={[-size.width / 2 + col * 0.67 + offset, row * 0.33 + 0.16, size.depth / 2 + 0.01]}
                  >
                    <planeGeometry args={[0.65, 0.31]} />
                    <meshBasicMaterial color="#000000" transparent opacity={0.15} />
                  </mesh>
                );
              })}
            </group>
          ))}

          {/* Stone course lines for non-gabion, non-brick, non-stucco walls */}
          {!isGabion && !isBrick && !isStucco && !isDryStack && Array.from({ length: Math.floor(size.height / 0.5) }).map((_, i) => (
            <mesh
              key={i}
              position={[0, i * 0.5 + 0.25, size.depth / 2 + 0.01]}
            >
              <planeGeometry args={[size.width, 0.02]} />
              <meshBasicMaterial color="#000000" transparent opacity={0.2} />
            </mesh>
          ))}

          {/* Dry stack irregular stones */}
          {isDryStack && Array.from({ length: Math.floor(size.height / 0.4) }).map((_, row) => (
            <group key={row}>
              {Array.from({ length: Math.floor(size.width / 1.5) + 1 }).map((_, col) => {
                const offset = (row % 2) * 0.3;
                const width = 1.2 + Math.random() * 0.6;
                return (
                  <mesh
                    key={`stone-${row}-${col}`}
                    position={[-size.width / 2 + col * 1.5 + offset, row * 0.4 + 0.2, size.depth / 2 + 0.01]}
                  >
                    <planeGeometry args={[width, 0.38]} />
                    <meshBasicMaterial color="#000000" transparent opacity={0.25} />
                  </mesh>
                );
              })}
            </group>
          ))}
        </>
      )}

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size.width * 0.5, size.width * 0.52, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// ===== OVERHEAD STRUCTURE MODELS =====

function PergolaModel({ structure, size, onClick }: any) {
  const isModern = structure.structureId === 'modern-pergola';
  const isLouvered = structure.structureId === 'louvered-pergola';
  const beamColor = isLouvered ? '#F5F5F5' : isModern ? '#2F4F4F' : '#CD853F';
  const postColor = isModern ? '#2F4F4F' : '#654321';

  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Corner posts */}
      {[
        [-size.width / 2 + 0.5, -size.depth / 2 + 0.5],
        [size.width / 2 - 0.5, -size.depth / 2 + 0.5],
        [-size.width / 2 + 0.5, size.depth / 2 - 0.5],
        [size.width / 2 - 0.5, size.depth / 2 - 0.5],
      ].map(([x, z], i) => (
        <mesh key={`post-${i}`} position={[x, size.height / 2, z]} castShadow>
          {isModern ? (
            <boxGeometry args={[0.3, size.height, 0.3]} />
          ) : (
            <cylinderGeometry args={[0.25, 0.25, size.height, 8]} />
          )}
          <meshStandardMaterial color={postColor} />
        </mesh>
      ))}

      {/* Top beams (running width direction) */}
      {Array.from({ length: 2 }).map((_, i) => (
        <mesh
          key={`beam-w-${i}`}
          position={[0, size.height - 0.3, (i - 0.5) * size.depth * 0.7]}
          castShadow
        >
          <boxGeometry args={[size.width, 0.4, 0.4]} />
          <meshStandardMaterial
            color={structure.selected ? '#ffeb3b' : beamColor}
            emissive={structure.selected ? '#ffeb3b' : '#000000'}
            emissiveIntensity={structure.selected ? 0.2 : 0}
          />
        </mesh>
      ))}

      {/* Rafters (running depth direction) */}
      {Array.from({ length: Math.floor(size.width / 2) }).map((_, i) => (
        <mesh
          key={`rafter-${i}`}
          position={[(i / Math.floor(size.width / 2) - 0.5) * size.width * 0.8, size.height - 0.1, 0]}
          castShadow
        >
          <boxGeometry args={[0.3, 0.2, size.depth]} />
          <meshStandardMaterial
            color={structure.selected ? '#ffeb3b' : beamColor}
            emissive={structure.selected ? '#ffeb3b' : '#000000'}
            emissiveIntensity={structure.selected ? 0.15 : 0}
          />
        </mesh>
      ))}

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(size.width, size.depth) * 0.5, Math.max(size.width, size.depth) * 0.52, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function ArborModel({ structure, size, onClick }: any) {
  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Side posts */}
      {[-1, 1].map((side, i) => (
        <mesh key={`post-${i}`} position={[side * size.width / 2, size.height / 2.5, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, size.height / 1.5, 8]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      ))}

      {/* Arch */}
      <mesh position={[0, size.height - 1, 0]} castShadow>
        <torusGeometry args={[size.width / 2, 0.15, 8, 16, Math.PI]} />
        <meshStandardMaterial
          color={structure.selected ? '#ffeb3b' : '#DEB887'}
          emissive={structure.selected ? '#ffeb3b' : '#000000'}
          emissiveIntensity={structure.selected ? 0.2 : 0}
        />
      </mesh>

      {/* Lattice sides */}
      {[-1, 1].map((side, i) => (
        <mesh key={`lattice-${i}`} position={[side * size.width / 2, size.height / 2, 0]} castShadow>
          <boxGeometry args={[0.05, size.height / 1.5, size.depth]} />
          <meshStandardMaterial color="#DEB887" transparent opacity={0.7} />
        </mesh>
      ))}

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size.width * 0.6, size.width * 0.62, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function ShadeSailModel({ structure, size, onClick }: any) {
  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Support posts at corners */}
      {[
        [-size.width / 2, -size.depth / 2, size.height * 0.8],
        [size.width / 2, -size.depth / 2, size.height],
        [-size.width / 2, size.depth / 2, size.height * 0.9],
        [size.width / 2, size.depth / 2, size.height * 0.7],
      ].map(([x, z, h], i) => (
        <mesh key={`post-${i}`} position={[x, h / 2, z]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, h, 8]} />
          <meshStandardMaterial color="#808080" metalness={0.8} />
        </mesh>
      ))}

      {/* Fabric sail */}
      <mesh position={[0, size.height * 0.85, 0]} rotation={[-0.2, 0, 0.1]} castShadow receiveShadow>
        <planeGeometry args={[size.width, size.depth]} />
        <meshStandardMaterial
          color={structure.selected ? '#ffeb3b' : '#E0E0E0'}
          emissive={structure.selected ? '#ffeb3b' : '#000000'}
          emissiveIntensity={structure.selected ? 0.2 : 0}
          side={2}
          transparent
          opacity={0.9}
        />
      </mesh>

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(size.width, size.depth) * 0.5, Math.max(size.width, size.depth) * 0.52, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// ===== WATER FEATURE MODELS =====

function PondModel({ structure, size, onClick }: any) {
  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Water body */}
      <mesh position={[0, -size.height / 2, 0]} receiveShadow>
        <cylinderGeometry args={[size.width / 2, size.width / 2.5, size.height, 16]} />
        <meshStandardMaterial
          color={structure.selected ? '#87CEEB' : '#4682B4'}
          emissive={structure.selected ? '#87CEEB' : '#4682B4'}
          emissiveIntensity={structure.selected ? 0.3 : 0.1}
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* Stone edging */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = size.width / 2 + 0.3;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
            rotation={[0, angle, 0]}
            castShadow
          >
            <boxGeometry args={[0.8, 0.4, 0.5]} />
            <meshStandardMaterial color="#808080" roughness={0.9} />
          </mesh>
        );
      })}

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size.width * 0.6, size.width * 0.62, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function FountainModel({ structure, size, onClick }: any) {
  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Base basin */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[size.width / 2, size.width / 2.2, 0.6, 16]} />
        <meshStandardMaterial color="#696969" roughness={0.8} />
      </mesh>

      {/* Water in basin */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[size.width / 2.5, size.width / 2.5, 0.1, 16]} />
        <meshStandardMaterial
          color="#4682B4"
          emissive="#4682B4"
          emissiveIntensity={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Middle tier */}
      <mesh position={[0, size.height / 2, 0]} castShadow>
        <cylinderGeometry args={[size.width / 3.5, size.width / 3.2, size.height / 2.5, 12]} />
        <meshStandardMaterial
          color={structure.selected ? '#ffeb3b' : '#696969'}
          emissive={structure.selected ? '#ffeb3b' : '#000000'}
          emissiveIntensity={structure.selected ? 0.2 : 0}
          roughness={0.8}
        />
      </mesh>

      {/* Top tier */}
      <mesh position={[0, size.height * 0.8, 0]} castShadow>
        <cylinderGeometry args={[size.width / 6, size.width / 5.5, size.height / 4, 12]} />
        <meshStandardMaterial color="#696969" roughness={0.8} />
      </mesh>

      {/* Center spout */}
      <mesh position={[0, size.height, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, size.height / 5, 8]} />
        <meshStandardMaterial color="#696969" />
      </mesh>

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size.width * 0.6, size.width * 0.62, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function BubblingRockModel({ structure, size, onClick }: any) {
  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Main boulder */}
      <mesh position={[0, size.height / 2, 0]} castShadow>
        <dodecahedronGeometry args={[size.width / 2, 1]} />
        <meshStandardMaterial
          color={structure.selected ? '#B8967B' : '#8B7355'}
          emissive={structure.selected ? '#B8967B' : '#000000'}
          emissiveIntensity={structure.selected ? 0.2 : 0}
          roughness={0.95}
        />
      </mesh>

      {/* Basin with river rocks */}
      <mesh position={[0, -0.2, 0]} receiveShadow>
        <cylinderGeometry args={[size.width, size.width * 0.9, 0.3, 16]} />
        <meshStandardMaterial color="#505050" roughness={0.9} />
      </mesh>

      {/* Water effect */}
      <mesh position={[0, size.height, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          color="#4682B4"
          emissive="#4682B4"
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size.width * 1.2, size.width * 1.22, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function WaterWallModel({ structure, size, onClick }: any) {
  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Back wall */}
      <mesh position={[0, size.height / 2, -size.depth / 2]} castShadow receiveShadow>
        <boxGeometry args={[size.width, size.height, 0.3]} />
        <meshStandardMaterial
          color={structure.selected ? '#4A5A5A' : '#2F4F4F'}
          emissive={structure.selected ? '#4A5A5A' : '#000000'}
          emissiveIntensity={structure.selected ? 0.2 : 0}
          roughness={0.7}
        />
      </mesh>

      {/* Water sheet */}
      <mesh position={[0, size.height / 2, -size.depth / 2 + 0.2]} castShadow>
        <planeGeometry args={[size.width * 0.9, size.height * 0.9]} />
        <meshStandardMaterial
          color="#4682B4"
          emissive="#4682B4"
          emissiveIntensity={0.2}
          transparent
          opacity={0.4}
          side={2}
        />
      </mesh>

      {/* Basin */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[size.width, 0.6, size.depth]} />
        <meshStandardMaterial color="#2F4F4F" />
      </mesh>

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size.width * 0.5, size.width * 0.52, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// ===== OUTDOOR LIVING MODELS =====

function OutdoorKitchenModel({ structure, size, onClick }: any) {
  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Base cabinet structure */}
      <mesh position={[0, size.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshStandardMaterial
          color={structure.selected ? '#E8D4B8' : '#D2B48C'}
          emissive={structure.selected ? '#E8D4B8' : '#000000'}
          emissiveIntensity={structure.selected ? 0.2 : 0}
        />
      </mesh>

      {/* Counter top */}
      <mesh position={[0, size.height, 0]} castShadow>
        <boxGeometry args={[size.width, 0.15, size.depth + 0.3]} />
        <meshStandardMaterial color="#505050" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Grill */}
      <mesh position={[size.width / 3, size.height + 0.3, 0]} castShadow>
        <boxGeometry args={[2, 0.6, size.depth - 0.5]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Grill lid */}
      <mesh position={[size.width / 3, size.height + 0.9, 0]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[2, 0.1, size.depth - 0.3]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
      </mesh>

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size.width * 0.6, size.width * 0.62, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function FirePitModel({ structure, size, onClick }: any) {
  const isModern = structure.structureId === 'modern-fire-feature';

  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Fire pit structure */}
      <mesh position={[0, size.height / 2, 0]} castShadow receiveShadow>
        {isModern ? (
          <boxGeometry args={[size.width, size.height, size.depth]} />
        ) : (
          <cylinderGeometry args={[size.width / 2, size.width / 2.2, size.height, 16]} />
        )}
        <meshStandardMaterial
          color={structure.selected ? '#C8825D' : '#A0522D'}
          emissive={structure.selected ? '#C8825D' : '#000000'}
          emissiveIntensity={structure.selected ? 0.2 : 0}
          roughness={0.9}
        />
      </mesh>

      {/* Fire glow */}
      <mesh position={[0, size.height + 0.3, 0]}>
        {isModern ? (
          <boxGeometry args={[size.width * 0.7, 0.3, size.depth * 0.3]} />
        ) : (
          <cylinderGeometry args={[size.width / 3, size.width / 4, 0.3, 12]} />
        )}
        <meshStandardMaterial
          color="#ff6600"
          emissive="#ff6600"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Flames */}
      {Array.from({ length: isModern ? 8 : 6 }).map((_, i) => (
        <mesh
          key={i}
          position={isModern
            ? [(i / 8 - 0.5) * size.width * 0.6, size.height + 0.5 + Math.random() * 0.3, 0]
            : [
                Math.cos((i / 6) * Math.PI * 2) * size.width / 4,
                size.height + 0.5 + Math.random() * 0.3,
                Math.sin((i / 6) * Math.PI * 2) * size.width / 4,
              ]
          }
        >
          <coneGeometry args={[0.15, 0.6, 4]} />
          <meshStandardMaterial
            color="#ff9933"
            emissive="#ff6600"
            emissiveIntensity={1}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(size.width, size.depth) * 0.6, Math.max(size.width, size.depth) * 0.62, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function PizzaOvenModel({ structure, size, onClick }: any) {
  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Base */}
      <mesh position={[0, size.height * 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[size.width, size.height * 0.5, size.depth]} />
        <meshStandardMaterial color="#8B7355" roughness={0.9} />
      </mesh>

      {/* Oven dome */}
      <mesh position={[0, size.height * 0.65, 0]} castShadow>
        <sphereGeometry args={[size.width / 2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={structure.selected ? '#E8B88D' : '#CD853F'}
          emissive={structure.selected ? '#E8B88D' : '#000000'}
          emissiveIntensity={structure.selected ? 0.2 : 0}
          roughness={0.8}
        />
      </mesh>

      {/* Opening */}
      <mesh position={[0, size.height * 0.55, size.depth / 2]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.6, 0.6, 0.3, 12, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Chimney */}
      <mesh position={[0, size.height * 0.9, -size.depth / 4]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, size.height * 0.5, 8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size.width * 0.6, size.width * 0.62, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function OutdoorShowerModel({ structure, size, onClick }: any) {
  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Floor platform */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[size.width, 0.2, size.depth]} />
        <meshStandardMaterial color="#696969" roughness={0.8} />
      </mesh>

      {/* Back wall/privacy panel */}
      <mesh position={[0, size.height / 2, -size.depth / 2.5]} castShadow>
        <boxGeometry args={[size.width * 0.8, size.height, 0.1]} />
        <meshStandardMaterial
          color={structure.selected ? '#E8A87C' : '#D2691E'}
          emissive={structure.selected ? '#E8A87C' : '#000000'}
          emissiveIntensity={structure.selected ? 0.2 : 0}
        />
      </mesh>

      {/* Shower pipe */}
      <mesh position={[0, size.height / 2, -size.depth / 3]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, size.height, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Shower head */}
      <mesh position={[0, size.height - 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.1, 12]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size.width * 0.6, size.width * 0.62, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function RaisedPlanterModel({ structure, size, onClick }: any) {
  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {/* Planter walls */}
      {[
        [0, 0, size.depth / 2, size.width, size.height, 0.3],  // Front
        [0, 0, -size.depth / 2, size.width, size.height, 0.3], // Back
        [size.width / 2, 0, 0, 0.3, size.height, size.depth],   // Right
        [-size.width / 2, 0, 0, 0.3, size.height, size.depth],  // Left
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, h / 2, z]} castShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            color={structure.selected ? '#A39376' : '#8B7355'}
            emissive={structure.selected ? '#A39376' : '#000000'}
            emissiveIntensity={structure.selected ? 0.2 : 0}
            roughness={0.8}
          />
        </mesh>
      ))}

      {/* Soil */}
      <mesh position={[0, size.height - 0.3, 0]} receiveShadow>
        <boxGeometry args={[size.width - 0.6, 0.6, size.depth - 0.6]} />
        <meshStandardMaterial color="#654321" roughness={1} />
      </mesh>

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(size.width, size.depth) * 0.6, Math.max(size.width, size.depth) * 0.62, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// ===== PATH MODELS =====

function PathModel({ structure, size, onClick }: any) {
  const getPathColor = () => {
    switch (structure.structureId) {
      case 'concrete-paver-path': return '#B0B0B0'; // Light gray
      case 'stone-paver-path': return '#C9A87C'; // Tan stone
      case 'rubble-path': return '#8B7D6B'; // Dark tan
      case 'decomposed-granite-path': return '#D4A574'; // Golden tan
      case 'crushed-rock-path': return '#A0A0A0'; // Gray rock
      case 'pea-gravel-path': return '#C0B4A0'; // Beige gravel
      case 'sand-path': return '#F4E4C1'; // Sand color
      case 'stepping-stone-path': return '#A89968'; // Stone tan
      case 'brick-path': return '#B85450'; // Brick red
      default: return '#B0B0B0';
    }
  };

  const isSteppingStone = structure.structureId === 'stepping-stone-path';
  const isPaved = ['concrete-paver-path', 'stone-paver-path', 'brick-path'].includes(structure.structureId);
  const isLoose = ['rubble-path', 'decomposed-granite-path', 'crushed-rock-path', 'pea-gravel-path', 'sand-path'].includes(structure.structureId);

  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      {isSteppingStone ? (
        // Stepping stones - individual pavers with gaps
        <>
          {Array.from({ length: Math.floor(size.depth / 2.5) }, (_, i) => {
            const offset = (i % 2) * 0.5; // Alternate left/right
            return (
              <mesh key={i} position={[offset, size.height / 2, -size.depth / 2 + i * 2.5 + 1]} receiveShadow castShadow>
                <cylinderGeometry args={[0.8, 0.8, size.height, 6]} />
                <meshStandardMaterial
                  color={structure.selected ? '#ffeb3b' : getPathColor()}
                  emissive={structure.selected ? '#ffeb3b' : '#000000'}
                  emissiveIntensity={structure.selected ? 0.2 : 0}
                  roughness={0.9}
                />
              </mesh>
            );
          })}
        </>
      ) : isPaved ? (
        // Paved paths - show paver pattern
        <>
          {/* Main path surface */}
          <mesh position={[0, size.height / 2, 0]} receiveShadow castShadow>
            <boxGeometry args={[size.width, size.height, size.depth]} />
            <meshStandardMaterial
              color={structure.selected ? '#ffeb3b' : getPathColor()}
              emissive={structure.selected ? '#ffeb3b' : '#000000'}
              emissiveIntensity={structure.selected ? 0.2 : 0}
              roughness={0.8}
            />
          </mesh>

          {/* Paver joints - grid pattern */}
          {Array.from({ length: Math.floor(size.depth / 2) }, (_, i) => (
            <mesh key={`joint-${i}`} position={[0, size.height + 0.01, -size.depth / 2 + i * 2]} receiveShadow>
              <boxGeometry args={[size.width, 0.02, 0.1]} />
              <meshStandardMaterial color="#444444" roughness={1} />
            </mesh>
          ))}
        </>
      ) : (
        // Loose material paths - textured surface
        <>
          {/* Main path surface */}
          <mesh position={[0, size.height / 2, 0]} receiveShadow castShadow>
            <boxGeometry args={[size.width, size.height, size.depth]} />
            <meshStandardMaterial
              color={structure.selected ? '#ffeb3b' : getPathColor()}
              emissive={structure.selected ? '#ffeb3b' : '#000000'}
              emissiveIntensity={structure.selected ? 0.2 : 0}
              roughness={1}
            />
          </mesh>

          {/* Texture bumps for loose materials */}
          {Array.from({ length: 20 }, (_, i) => {
            const x = (Math.random() - 0.5) * size.width * 0.8;
            const z = (Math.random() - 0.5) * size.depth * 0.8;
            const radius = 0.1 + Math.random() * 0.15;
            return (
              <mesh key={`bump-${i}`} position={[x, size.height + 0.05, z]} receiveShadow>
                <sphereGeometry args={[radius, 8, 8]} />
                <meshStandardMaterial color={getPathColor()} roughness={1} />
              </mesh>
            );
          })}
        </>
      )}

      {/* Edge borders for all paths except stepping stones */}
      {!isSteppingStone && (
        <>
          <mesh position={[-size.width / 2, size.height / 2, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.15, size.height + 0.1, size.depth]} />
            <meshStandardMaterial color="#654321" roughness={0.9} />
          </mesh>
          <mesh position={[size.width / 2, size.height / 2, 0]} receiveShadow castShadow>
            <boxGeometry args={[0.15, size.height + 0.1, size.depth]} />
            <meshStandardMaterial color="#654321" roughness={0.9} />
          </mesh>
        </>
      )}

      {/* Selection indicator */}
      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(size.width, size.depth) * 0.5, Math.max(size.width, size.depth) * 0.52, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// Memoized router export. The design canvas re-renders the whole Scene on many
// interactions (selection, hover, age changes); comparing the meaningful
// structure fields lets unchanged structures skip their model subtree re-render.
function structurePropsEqual(a: StructureModelProps, b: StructureModelProps): boolean {
  const s = a.structure;
  const t = b.structure;
  return (
    a.onClick === b.onClick &&
    s.id === t.id &&
    s.structureId === t.structureId &&
    s.scale === t.scale &&
    s.rotation === t.rotation &&
    s.selected === t.selected &&
    s.style === t.style &&
    s.position.x === t.position.x &&
    s.position.y === t.position.y &&
    s.position.z === t.position.z &&
    JSON.stringify(s.customDimensions) === JSON.stringify(t.customDimensions)
  );
}

export const StructureModel = memo(StructureModelImpl, structurePropsEqual);

// ===== DEFAULT MODEL =====

function DefaultStructureModel({ structure, size, onClick }: any) {
  return (
    <group
      position={[structure.position.x, 0, structure.position.z]}
      rotation={[0, structure.rotation, 0]}
      onClick={onClick}
    >
      <mesh position={[0, size.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size.width, size.height, size.depth]} />
        <meshStandardMaterial
          color={structure.selected ? '#ffeb3b' : '#808080'}
          emissive={structure.selected ? '#ffeb3b' : '#000000'}
          emissiveIntensity={structure.selected ? 0.2 : 0}
        />
      </mesh>

      {structure.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(size.width, size.depth) * 0.5, Math.max(size.width, size.depth) * 0.52, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}
