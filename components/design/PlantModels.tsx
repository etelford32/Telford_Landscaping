"use client";

import { useMemo } from "react";
import {
  PlacedPlant,
  PlantSpecies,
  getPlantSpecies,
  calculatePlantSize,
} from "@/lib/plantData";

interface PlantModelProps {
  plant: PlacedPlant;
  onClick?: () => void;
}

interface ShapeModelProps {
  plant: PlacedPlant;
  size: { height: number; width: number };
  species: PlantSpecies;
  onClick?: () => void;
}

const BARK = "#5B4636";

// ── PlantModel router ─────────────────────────────────────────────────────────
// Routes a placed plant to a shape-specific model. Overall dimensions come from
// the growth model (calculatePlantSize) so the design tool and the homepage
// growth simulation stay in sync.
export function PlantModel({ plant, onClick }: PlantModelProps) {
  const size = calculatePlantSize(plant.speciesId, plant.age, plant.scale);
  const species = getPlantSpecies(plant.speciesId);

  if (!species) {
    return <DefaultPlantModel plant={plant} size={size} onClick={onClick} color="#22c55e" />;
  }

  switch (species.growthData.shapeType) {
    case "rounded":
      return <RoundedPlantModel plant={plant} size={size} species={species} onClick={onClick} />;
    case "pyramidal":
      return <PyramidalPlantModel plant={plant} size={size} species={species} onClick={onClick} />;
    case "weeping":
      return <WeepingPlantModel plant={plant} size={size} species={species} onClick={onClick} />;
    case "vase":
      return <VasePlantModel plant={plant} size={size} species={species} onClick={onClick} />;
    case "columnar":
      return <ColumnarPlantModel plant={plant} size={size} species={species} onClick={onClick} />;
    default:
      return <DefaultPlantModel plant={plant} size={size} onClick={onClick} color={species.color} />;
  }
}

// ── Shared wrapper: positions/rotates the plant and draws the selection ring ───
function PlantGroup({
  plant,
  selectionRadius,
  onClick,
  children,
}: {
  plant: PlacedPlant;
  selectionRadius: number;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <group
      position={[plant.position.x, 0, plant.position.z]}
      rotation={[0, plant.rotation, 0]}
      onClick={onClick}
    >
      {children}

      {plant.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[selectionRadius, selectionRadius * 1.06, 40]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// ── Tapered trunk with a small root flare ─────────────────────────────────────
function Trunk({ top, radius, color = BARK }: { top: number; radius: number; color?: string }) {
  return (
    <group>
      <mesh position={[0, top * 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius * 0.62, radius, top, 8]} />
        <meshStandardMaterial color={color} roughness={0.92} />
      </mesh>
      {/* Root flare */}
      <mesh position={[0, top * 0.05, 0]} castShadow>
        <coneGeometry args={[radius * 1.7, top * 0.22, 8]} />
        <meshStandardMaterial color={adjustColorBrightness(color, -15)} roughness={0.95} />
      </mesh>
    </group>
  );
}

// ── Clustered foliage canopy ──────────────────────────────────────────────────
// Built in unit space and scaled by the parent group so geometry is created once
// and only the group transform changes as the plant grows (smooth + cheap).
function Canopy({
  seed,
  radiusX,
  radiusY,
  centerY,
  color,
  count,
  selected,
}: {
  seed: number;
  radiusX: number;
  radiusY: number;
  centerY: number;
  color: string;
  count: number;
  selected?: boolean;
}) {
  const clumps = useMemo(() => buildClumps(seed, count), [seed, count]);

  return (
    <group position={[0, centerY, 0]} scale={[radiusX, radiusY, radiusX]}>
      {clumps.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} castShadow receiveShadow>
          <icosahedronGeometry args={[c.r, c.detail]} />
          <meshStandardMaterial
            color={selected ? adjustColorBrightness(color, 45) : adjustColorBrightness(color, c.shift)}
            emissive={selected ? color : "#000000"}
            emissiveIntensity={selected ? 0.18 : 0}
            roughness={0.85}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

// Rounded (oaks, maples, most shrubs, ground covers)
function RoundedPlantModel({ plant, size, species, onClick }: ShapeModelProps) {
  const hS = size.height / 5;
  const wS = size.width / 5;
  const isTree = species.category === "tree";
  const isShrub = species.category === "shrub";

  const trunkTop = isTree ? hS * 0.5 : isShrub ? hS * 0.22 : 0;
  const radiusX = wS * 0.5;
  const aspect = isTree ? 1.05 : isShrub ? 0.78 : 0.55;
  const radiusY = radiusX * aspect;
  const centerY = trunkTop + radiusY * 0.72;
  const count = isTree ? 8 : isShrub ? 6 : 5;
  const trunkR = Math.max(0.05, wS * 0.13);

  return (
    <PlantGroup plant={plant} selectionRadius={radiusX * 1.15} onClick={onClick}>
      {trunkTop > 0 && <Trunk top={trunkTop} radius={trunkR} />}
      <Canopy
        seed={seedFor(plant)}
        radiusX={radiusX}
        radiusY={radiusY}
        centerY={centerY}
        color={species.color}
        count={count}
        selected={plant.selected}
      />
    </PlantGroup>
  );
}

// Pyramidal (conifers, cedars, cypress) — layered cones
function PyramidalPlantModel({ plant, size, species, onClick }: ShapeModelProps) {
  const hS = size.height / 10;
  const wS = size.width / 5;
  const color = species.color;

  const trunkTop = hS * 0.55;
  const trunkR = Math.max(0.05, wS * 0.14);
  const baseY = trunkTop * 0.7;
  const topY = hS * 2.25;
  const span = topY - baseY;

  const layers = 4;
  const cones = Array.from({ length: layers }).map((_, i) => {
    const t = i / (layers - 1); // 0 bottom → 1 top
    return {
      y: baseY + span * t * 0.78,
      radius: wS * (0.82 - t * 0.6),
      height: span * (0.42 - t * 0.1),
      shift: -8 + t * 22,
    };
  });

  return (
    <PlantGroup plant={plant} selectionRadius={wS * 0.85} onClick={onClick}>
      <Trunk top={trunkTop} radius={trunkR} />
      {cones.map((c, i) => (
        <mesh key={i} position={[0, c.y, 0]} castShadow receiveShadow>
          <coneGeometry args={[c.radius, c.height, 9]} />
          <meshStandardMaterial
            color={plant.selected ? adjustColorBrightness(color, 45) : adjustColorBrightness(color, c.shift)}
            emissive={plant.selected ? color : "#000000"}
            emissiveIntensity={plant.selected ? 0.18 : 0}
            roughness={0.85}
            flatShading
          />
        </mesh>
      ))}
    </PlantGroup>
  );
}

// Columnar (redwoods, tall narrow evergreens) — stacked clumps + spire
function ColumnarPlantModel({ plant, size, species, onClick }: ShapeModelProps) {
  const hS = size.height / 20;
  const wS = size.width / 5;
  const color = species.color;

  const trunkTop = hS * 1.2;
  const trunkR = Math.max(0.06, wS * 0.16);
  const foliageBase = hS * 0.9;
  const foliageTop = hS * 4.3;
  const span = foliageTop - foliageBase;

  const clumps = useMemo(() => {
    const rng = mulberry32(seedFor(plant));
    const steps = 7;
    return Array.from({ length: steps }).map((_, i) => {
      const t = i / (steps - 1);
      const taper = 0.7 - t * 0.5; // narrower toward the top
      return {
        y: foliageBase + span * t,
        radius: wS * Math.max(0.18, taper),
        x: (rng() - 0.5) * wS * 0.14,
        z: (rng() - 0.5) * wS * 0.14,
        shift: -16 + rng() * 26,
        detail: rng() > 0.5 ? 1 : 0,
      };
    });
    // span/foliageBase/wS feed the layout but recompute cheaply each frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plant.id, plant.variant, wS, foliageBase, span]);

  return (
    <PlantGroup plant={plant} selectionRadius={wS * 0.7} onClick={onClick}>
      <Trunk top={trunkTop} radius={trunkR} />
      {clumps.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} castShadow receiveShadow>
          <icosahedronGeometry args={[c.radius, c.detail]} />
          <meshStandardMaterial
            color={plant.selected ? adjustColorBrightness(color, 45) : adjustColorBrightness(color, c.shift)}
            emissive={plant.selected ? color : "#000000"}
            emissiveIntensity={plant.selected ? 0.18 : 0}
            roughness={0.85}
            flatShading
          />
        </mesh>
      ))}
      {/* Leader spire */}
      <mesh position={[0, foliageTop + wS * 0.1, 0]} castShadow>
        <coneGeometry args={[wS * 0.22, wS * 0.9, 9]} />
        <meshStandardMaterial color={adjustColorBrightness(color, 12)} roughness={0.85} flatShading />
      </mesh>
    </PlantGroup>
  );
}

// Weeping (weeping cedars/willows) — crown plus drooping skirt
function WeepingPlantModel({ plant, size, species, onClick }: ShapeModelProps) {
  const hS = size.height / 5;
  const wS = size.width / 5;
  const color = species.color;

  const trunkTop = hS * 0.6;
  const trunkR = Math.max(0.06, wS * 0.15);
  const crownY = trunkTop + wS * 0.18;

  const skirt = useMemo(() => {
    const rng = mulberry32(seedFor(plant));
    const strands = 6;
    return Array.from({ length: strands }).map((_, i) => {
      const a = (i / strands) * Math.PI * 2 + rng() * 0.4;
      const ring = wS * (0.4 + rng() * 0.1);
      return {
        x: Math.cos(a) * ring,
        z: Math.sin(a) * ring,
        y: crownY - wS * (0.18 + rng() * 0.18),
        r: wS * (0.16 + rng() * 0.08),
        shift: -14 + rng() * 22,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plant.id, plant.variant, wS, crownY]);

  return (
    <PlantGroup plant={plant} selectionRadius={wS * 0.65} onClick={onClick}>
      <Trunk top={trunkTop} radius={trunkR} />
      <Canopy
        seed={seedFor(plant)}
        radiusX={wS * 0.42}
        radiusY={wS * 0.34}
        centerY={crownY}
        color={color}
        count={5}
        selected={plant.selected}
      />
      {/* Cascading branches — stretched downward */}
      {skirt.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]} scale={[1, 2.3, 1]} castShadow receiveShadow>
          <icosahedronGeometry args={[s.r, 0]} />
          <meshStandardMaterial
            color={plant.selected ? adjustColorBrightness(color, 45) : adjustColorBrightness(color, s.shift)}
            emissive={plant.selected ? color : "#000000"}
            emissiveIntensity={plant.selected ? 0.18 : 0}
            roughness={0.85}
            flatShading
          />
        </mesh>
      ))}
    </PlantGroup>
  );
}

// Vase (redbuds, multi-trunk flowering trees) — splayed trunks, top-heavy canopy
function VasePlantModel({ plant, size, species, onClick }: ShapeModelProps) {
  const hS = size.height / 5;
  const wS = size.width / 5;
  const color = species.color;

  const trunkTop = hS * 0.5;
  const trunkR = Math.max(0.05, wS * 0.1);
  const radiusX = wS * 0.55;
  const radiusY = radiusX * 0.68;
  const centerY = trunkTop + radiusY * 0.6;

  return (
    <PlantGroup plant={plant} selectionRadius={radiusX * 1.15} onClick={onClick}>
      {/* Multiple trunks splaying out from the base */}
      {[-0.16, 0, 0.16].map((offset, i) => (
        <mesh
          key={i}
          position={[offset * wS, trunkTop * 0.5, 0]}
          rotation={[0, 0, offset * 1.1]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[trunkR * 0.7, trunkR, trunkTop, 6]} />
          <meshStandardMaterial color={BARK} roughness={0.92} />
        </mesh>
      ))}
      <Canopy
        seed={seedFor(plant)}
        radiusX={radiusX}
        radiusY={radiusY}
        centerY={centerY}
        color={color}
        count={7}
        selected={plant.selected}
      />
    </PlantGroup>
  );
}

// Default fallback — simple clustered mound
function DefaultPlantModel({
  plant,
  size,
  onClick,
  color,
}: {
  plant: PlacedPlant;
  size: { height: number; width: number };
  onClick?: () => void;
  color: string;
}) {
  const wS = size.width / 5;
  const radiusX = wS * 0.5;
  const radiusY = radiusX * 0.7;

  return (
    <PlantGroup plant={plant} selectionRadius={radiusX * 1.15} onClick={onClick}>
      <Canopy
        seed={seedFor(plant)}
        radiusX={radiusX}
        radiusY={radiusY}
        centerY={radiusY * 0.7}
        color={color}
        count={5}
        selected={plant.selected}
      />
    </PlantGroup>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface Clump {
  x: number;
  y: number;
  z: number;
  r: number;
  shift: number;
  detail: number;
}

// Deterministic clump layout for a unit canopy. Seeded so a given plant always
// renders the same arrangement — critical because the growth sim re-renders
// every frame and Math.random() would make the foliage boil.
function buildClumps(seed: number, count: number): Clump[] {
  const rng = mulberry32(seed);
  const clumps: Clump[] = [{ x: 0, y: 0.02, z: 0, r: 0.6, shift: -2, detail: 1 }];

  for (let i = 1; i < count; i++) {
    const theta = rng() * Math.PI * 2;
    const y = (rng() * 2 - 1) * 0.55;
    const horiz = Math.sqrt(Math.max(0, 1 - (y / 0.7) ** 2));
    const dist = (0.28 + rng() * 0.4) * horiz;
    clumps.push({
      x: Math.cos(theta) * dist,
      y,
      z: Math.sin(theta) * dist,
      r: 0.3 + rng() * 0.22,
      shift: -22 + rng() * 32,
      detail: rng() > 0.6 ? 1 : 0,
    });
  }

  return clumps;
}

function seedFor(plant: PlacedPlant): number {
  return hashString(`${plant.id ?? "x"}:${plant.variant ?? 0}`);
}

// FNV-1a string hash → stable 32-bit seed
function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Small deterministic PRNG (mulberry32)
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Adjust a hex color's brightness by a signed percentage
function adjustColorBrightness(hex: string, percent: number): string {
  hex = hex.replace("#", "");

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const adjust = (val: number) => Math.max(0, Math.min(255, val + (val * percent) / 100));

  const newR = Math.round(adjust(r));
  const newG = Math.round(adjust(g));
  const newB = Math.round(adjust(b));

  return "#" + [newR, newG, newB].map((x) => x.toString(16).padStart(2, "0")).join("");
}
