"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PlacedPlant, calculatePlantSize } from "@/lib/plantData";
import {
  generateShrubShell,
  generateTree,
  type BranchSegment,
  type LeafPlacement,
  type PlantSkeleton,
} from "@/lib/procedural/treeGen";
import { getBarkBumpTexture, getLeafTexture, type LeafKind } from "@/lib/procedural/leafTexture";

// Species that opt into the procedural branches-and-leaves renderer. Everything
// else stays on the clustered models in PlantModels.tsx — this is the phased
// rollout: prove it on a showcase pair first, widen later.
export const PROCEDURAL_SPECIES = new Set<string>([
  "acer-palmatum-sango-kaku",
  "buxus-sempervirens-suffruticosa",
]);

interface Preset {
  generate: (seed: number, maturity: number) => PlantSkeleton;
  leafKind: LeafKind;
  formMaturityAge: number; // age at which branch structure is fully developed
  leafSize: number; // leaf size in normalized skeleton space
  leafPalette: string[]; // per-leaf colors sampled across the canopy
  barkThin: string; // color of fine twigs
  barkThick: string; // color of the trunk
}

// Maple leans green with a scatter of amber/copper for the Sango-kaku turn;
// greens are repeated so they dominate.
const MAPLE_PALETTE = [
  "#4F7E2A", "#5E9636", "#6CA63E", "#7DB54A", "#5A8C32",
  "#4F7E2A", "#6CA63E", "#C8922E", "#D98E3A", "#B5642F",
];
const BOXWOOD_PALETTE = ["#2E5A2E", "#356731", "#274E28", "#3C6E36", "#2A572B"];

const PRESETS: Record<string, Preset> = {
  "acer-palmatum-sango-kaku": {
    leafKind: "maple",
    formMaturityAge: 24,
    leafSize: 0.05,
    leafPalette: MAPLE_PALETTE,
    barkThin: "#D2604A", // signature coral bark on young wood
    barkThick: "#6B4A33",
    generate: (seed, m) =>
      generateTree(seed, m, {
        trunkLength: 0.4,
        trunkRadius: 0.03,
        maxDepth: 5,
        branchMin: 2,
        branchMax: 3,
        branchAngle: 0.6,
        lengthFalloff: 0.78,
        radiusFalloff: 0.7,
        segmentsPerBranch: 4,
        curve: 0.16,
        gravitropism: 0.25,
        leafStartDepth: 3,
        leavesPerTwig: 6,
      }),
  },
  "buxus-sempervirens-suffruticosa": {
    leafKind: "boxwood",
    formMaturityAge: 14,
    leafSize: 0.045,
    leafPalette: BOXWOOD_PALETTE,
    barkThin: "#5A4636",
    barkThick: "#4A3826",
    generate: (seed, m) =>
      generateShrubShell(seed, m, {
        height: 1,
        width: 1.05,
        trunkRadius: 0.06,
        leafCount: 1100,
        clip: 0.42,
      }),
  },
};

const DEFAULT_PRESET: Preset = {
  leafKind: "maple",
  formMaturityAge: 20,
  leafSize: 0.06,
  leafPalette: MAPLE_PALETTE,
  barkThin: "#8A6A48",
  barkThick: "#5A3F2C",
  generate: (seed, m) =>
    generateTree(seed, m, {
      trunkLength: 0.4,
      trunkRadius: 0.035,
      maxDepth: 4,
      branchMin: 2,
      branchMax: 3,
      branchAngle: 0.6,
      lengthFalloff: 0.76,
      radiusFalloff: 0.7,
      segmentsPerBranch: 3,
      curve: 0.15,
      gravitropism: 0.2,
      leafStartDepth: 2,
      leavesPerTwig: 5,
    }),
};

export default function ProceduralPlant({
  plant,
  onClick,
}: {
  plant: PlacedPlant;
  onClick?: () => void;
}) {
  const preset = PRESETS[plant.speciesId] ?? DEFAULT_PRESET;
  const size = calculatePlantSize(plant.speciesId, plant.age, plant.scale);

  // Regenerate the skeleton once per integer year (memoized); the growth slider
  // animates continuously but size/maturity are quantized per year, so this is
  // at most ~30 builds over a full play-through.
  const year = Math.max(1, Math.round(plant.age));
  const seed = seedFor(plant);
  const maturity = Math.min(1, year / preset.formMaturityAge);

  const skeleton = useMemo(
    () => preset.generate(seed, maturity),
    // maturity is derived from year, so year is the real key
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed, year, plant.speciesId]
  );

  const leafTex = useMemo(() => getLeafTexture(preset.leafKind), [preset.leafKind]);

  // Shared, stable geometry/material — only instance transforms change.
  const branchGeo = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 6, 1), []);
  const leafGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1.25);
    g.translate(0, 0.6, 0); // pivot at the stem base so leaves splay from the twig
    return g;
  }, []);
  const branchMat = useMemo(() => {
    const bump = getBarkBumpTexture();
    return new THREE.MeshStandardMaterial({
      roughness: 0.85,
      metalness: 0,
      bumpMap: bump,
      bumpScale: 0.015,
      envMapIntensity: 0.5,
    });
  }, []);
  const leafMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: leafTex,
        alphaTest: 0.45,
        side: THREE.DoubleSide,
        roughness: 0.72,
        metalness: 0,
        envMapIntensity: 0.7,
      }),
    [leafTex]
  );

  const worldScale = (size.height / 5) / skeleton.height;
  const selR = Math.max(0.4, (size.width / 5) * 0.6);

  return (
    <group
      position={[plant.position.x, 0, plant.position.z]}
      rotation={[0, plant.rotation, 0]}
      onClick={onClick}
    >
      <group scale={worldScale}>
        <BranchInstances
          segments={skeleton.segments}
          geom={branchGeo}
          material={branchMat}
          barkThin={preset.barkThin}
          barkThick={preset.barkThick}
        />
        <LeafInstances
          leaves={skeleton.leaves}
          geom={leafGeo}
          material={leafMat}
          leafSize={preset.leafSize}
          palette={preset.leafPalette}
        />
      </group>

      {plant.selected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[selR, selR * 1.06, 40]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// ── Branch instances ──────────────────────────────────────────────────────────
function BranchInstances({
  segments,
  geom,
  material,
  barkThin,
  barkThick,
}: {
  segments: BranchSegment[];
  geom: THREE.CylinderGeometry;
  material: THREE.Material;
  barkThin: string;
  barkThick: string;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const maxR = useMemo(
    () => segments.reduce((mx, s) => Math.max(mx, s.r0, s.r1), 1e-4),
    [segments]
  );

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const v0 = new THREE.Vector3();
    const v1 = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const mid = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const thin = new THREE.Color(barkThin);
    const thick = new THREE.Color(barkThick);
    const col = new THREE.Color();

    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      v0.set(s.p0[0], s.p0[1], s.p0[2]);
      v1.set(s.p1[0], s.p1[1], s.p1[2]);
      dir.subVectors(v1, v0);
      const L = dir.length() || 1e-4;
      dir.divideScalar(L);
      q.setFromUnitVectors(up, dir);
      mid.addVectors(v0, v1).multiplyScalar(0.5);
      const r = (s.r0 + s.r1) * 0.5;
      scl.set(r, L, r);
      m.compose(mid, q, scl);
      mesh.setMatrixAt(i, m);
      // thin twigs -> coral, thick trunk -> brown
      col.copy(thin).lerp(thick, Math.min(1, r / maxR));
      mesh.setColorAt(i, col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [segments, maxR, barkThin, barkThick]);

  if (segments.length === 0) return null;
  return (
    <instancedMesh
      ref={ref}
      args={[geom, material, segments.length]}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  );
}

// ── Leaf-card instances ───────────────────────────────────────────────────────
function LeafInstances({
  leaves,
  geom,
  material,
  leafSize,
  palette,
}: {
  leaves: LeafPlacement[];
  geom: THREE.PlaneGeometry;
  material: THREE.Material;
  leafSize: number;
  palette: string[];
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const colors = useMemo(() => palette.map((c) => new THREE.Color(c)), [palette]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const qRoll = new THREE.Quaternion();
    const yAxis = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const col = new THREE.Color();

    for (let i = 0; i < leaves.length; i++) {
      const lf = leaves[i];
      pos.set(lf.pos[0], lf.pos[1], lf.pos[2]);
      dir.set(lf.dir[0], lf.dir[1], lf.dir[2]).normalize();
      q.setFromUnitVectors(yAxis, dir);
      qRoll.setFromAxisAngle(dir, lf.roll);
      q.premultiply(qRoll);
      const s = leafSize * lf.scale;
      scl.set(s, s, s);
      m.compose(pos, q, scl);
      mesh.setMatrixAt(i, m);
      // pick a palette color, then vary lightness a touch per leaf
      const pick = colors[Math.floor(frac(Math.sin((i + 1) * 78.233) * 43758.5453) * colors.length) % colors.length];
      const v = 0.85 + 0.28 * frac(Math.sin((i + 1) * 12.9898) * 43758.5453);
      col.copy(pick).multiplyScalar(v);
      mesh.setColorAt(i, col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [leaves, leafSize, colors]);

  if (leaves.length === 0) return null;
  return (
    <instancedMesh
      ref={ref}
      args={[geom, material, leaves.length]}
      castShadow={false}
      frustumCulled={false}
    />
  );
}

function frac(x: number): number {
  return x - Math.floor(x);
}

function seedFor(plant: PlacedPlant): number {
  const str = `${plant.id ?? "x"}:${plant.variant ?? 0}`;
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
