"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { PlacedPlant, calculatePlantSize } from "@/lib/plantData";
import {
  generateDecurrentTree,
  generateExcurrentTree,
  generateShrubShell,
  generateTree,
  type BranchSegment,
  type LeafPlacement,
  type PlantSkeleton,
} from "@/lib/procedural/treeGen";
import { getBarkBumpTexture, getLeafTexture, type LeafKind } from "@/lib/procedural/leafTexture";
import {
  COAST_LIVE_OAK,
  COAST_REDWOOD,
  VALLEY_OAK,
  BLUE_OAK,
  treeDimensions,
  type TreeAllometry,
} from "@/lib/growth/treeAllometry";

// Species that opt into the procedural branches-and-leaves renderer. Everything
// else stays on the clustered models in PlantModels.tsx — this is the phased
// rollout: prove it on a showcase pair first, widen later.
export const PROCEDURAL_SPECIES = new Set<string>([
  "acer-palmatum-sango-kaku",
  "buxus-sempervirens-suffruticosa",
  "quercus-agrifolia",
  "quercus-lobata",
  "quercus-douglasii",
  "sequoia-sempervirens",
]);

// Shape ratios handed to the decurrent/excurrent generators, derived per-age
// from the allometric growth model so form tracks real dimensions.
interface TreeShape {
  crownWidthRatio: number; // crown spread / height (decurrent: biases spread)
  crownBase: number; // height fraction where the live crown starts (excurrent)
}

interface Preset {
  generate: (seed: number, maturity: number, shape?: TreeShape) => PlantSkeleton;
  leafKind: LeafKind;
  formMaturityAge: number; // age at which branch structure is fully developed
  leafSize: number; // leaf size in normalized skeleton space
  leafPalette: string[]; // per-leaf colors sampled across the canopy
  barkThin: string; // color of fine twigs
  barkThick: string; // color of the trunk
  // When set, dimensions come from this scientific allometric model instead of
  // the hand-authored size arrays, and the decurrent generator is used.
  allometry?: TreeAllometry;
}

// Maple leans green with a scatter of amber/copper for the Sango-kaku turn;
// greens are repeated so they dominate.
const MAPLE_PALETTE = [
  "#4F7E2A", "#5E9636", "#6CA63E", "#7DB54A", "#5A8C32",
  "#4F7E2A", "#6CA63E", "#C8922E", "#D98E3A", "#B5642F",
];
const BOXWOOD_PALETTE = ["#2E5A2E", "#356731", "#274E28", "#3C6E36", "#2A572B"];
// Coast live oak: dark, glossy, evergreen greens.
const OAK_PALETTE = ["#2F4A22", "#365A28", "#3E6B2E", "#2A4420", "#436F30", "#314E24"];
// Coast redwood: deep blue-greens.
const REDWOOD_PALETTE = ["#2E4A38", "#35583F", "#2A4233", "#3C6147", "#314E3A", "#274033"];
// Valley oak: bright/deep deciduous greens.
const VALLEY_OAK_PALETTE = ["#4C7A2E", "#5A8C36", "#6B9C40", "#3E6B28", "#588832", "#4F8230"];
// Blue oak: glaucous blue-green / sage (the real foliage cast, not cartoon blue).
const BLUE_OAK_PALETTE = ["#7A9483", "#86A08C", "#6E8A78", "#90A894", "#7E9888", "#728E7C"];

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
  "quercus-agrifolia": {
    leafKind: "oak",
    formMaturityAge: 25,
    leafSize: 0.022, // small foliage tufts that ride the branch tips
    leafPalette: OAK_PALETTE,
    barkThin: "#6E6258", // gray-brown; darkens and furrows with age
    barkThick: "#463D36",
    allometry: COAST_LIVE_OAK,
    generate: (seed, _m, shape) =>
      generateDecurrentTree(seed, 1, {
        forkHeight: 0.3,
        scaffolds: 4,
        maxDepth: 5,
        branchMin: 2,
        branchMax: 3,
        spreadAngle: 0.52,
        childAngle: 0.5,
        lengthFalloff: 0.64,
        radiusFalloff: 0.72,
        segmentsPerBranch: 4,
        sinuosity: 0.22,
        droop: 0.15,
        crownWidthRatio: shape?.crownWidthRatio ?? 1.0,
        leafStartDepth: 1,
        leavesPerTwig: 5,
      }),
  },
  "sequoia-sempervirens": {
    leafKind: "redwood",
    formMaturityAge: 30,
    leafSize: 0.03, // flat needle sprays
    leafPalette: REDWOOD_PALETTE,
    barkThin: "#6E5A48", // gray-brown young twigs
    barkThick: "#7E4A33", // thick reddish-brown fibrous trunk
    allometry: COAST_REDWOOD,
    generate: (seed, _m, shape) =>
      generateExcurrentTree(seed, 1, {
        trunkSegments: 14,
        crownBase: shape?.crownBase ?? 0.18,
        tiers: 12,
        branchesPerTier: 5,
        maxBranchLen: 0.1,
        branchDroop: 0.35,
        subDepth: 2,
        branchMin: 2,
        branchMax: 3,
        lengthFalloff: 0.6,
        radiusFalloff: 0.6,
        segmentsPerBranch: 3,
        leavesPerTwig: 5,
      }),
  },
  "quercus-lobata": {
    leafKind: "oak-lobed",
    formMaturityAge: 30,
    leafSize: 0.03,
    leafPalette: VALLEY_OAK_PALETTE,
    barkThin: "#A39C90", // pale gray, checkered
    barkThick: "#827A6E",
    allometry: VALLEY_OAK,
    generate: (seed, _m, shape) =>
      generateDecurrentTree(seed, 1, {
        forkHeight: 0.32,
        scaffolds: 5,
        maxDepth: 5,
        branchMin: 2,
        branchMax: 3,
        spreadAngle: 0.4,
        childAngle: 0.5,
        lengthFalloff: 0.54,
        radiusFalloff: 0.72,
        segmentsPerBranch: 4,
        sinuosity: 0.24,
        droop: 0.28, // pendulous outer branchlets
        crownWidthRatio: shape?.crownWidthRatio ?? 0.85,
        leafStartDepth: 2, // open, airy crown
        leavesPerTwig: 4,
      }),
  },
  "quercus-douglasii": {
    leafKind: "oak-lobed",
    formMaturityAge: 30,
    leafSize: 0.028,
    leafPalette: BLUE_OAK_PALETTE,
    barkThin: "#ADA89C", // pale whitish-gray, thin
    barkThick: "#928C80",
    allometry: BLUE_OAK,
    generate: (seed, _m, shape) =>
      generateDecurrentTree(seed, 1, {
        forkHeight: 0.28,
        scaffolds: 4,
        maxDepth: 5,
        branchMin: 2,
        branchMax: 3,
        spreadAngle: 0.5,
        childAngle: 0.52,
        lengthFalloff: 0.62,
        radiusFalloff: 0.72,
        segmentsPerBranch: 4,
        sinuosity: 0.32, // gnarled
        droop: 0.14,
        crownWidthRatio: shape?.crownWidthRatio ?? 1.0,
        leafStartDepth: 2,
        leavesPerTwig: 4,
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

  // Oaks size from the scientific allometric model; everything else uses the
  // hand-authored growth arrays. `size` is in feet (height, crown width).
  const size = useMemo(() => {
    if (preset.allometry) {
      const d = treeDimensions(preset.allometry, plant.age, plant.scale);
      return { height: d.height, width: d.crownWidth };
    }
    return calculatePlantSize(plant.speciesId, plant.age, plant.scale);
  }, [preset, plant.speciesId, plant.age, plant.scale]);

  // Regenerate the skeleton once per integer year (memoized); the growth slider
  // animates continuously but size/maturity are quantized per year, so this is
  // at most ~30 builds over a full play-through.
  const year = Math.max(1, Math.round(plant.age));
  const seed = seedFor(plant);
  const maturity = Math.min(1, year / preset.formMaturityAge);

  // Oak: generate the full mature skeleton ONCE; the renderer reveals branch
  // orders with age so the same trunk and limbs persist and extend. Other
  // species regenerate per integer year.
  const oakFull = useMemo(() => {
    if (!preset.allometry) return null;
    const mature = treeDimensions(preset.allometry, preset.formMaturityAge, plant.scale);
    const shape: TreeShape = {
      crownWidthRatio: mature.crownWidth / Math.max(1, mature.height),
      crownBase: Math.max(0.05, 1 - mature.crownHeight / Math.max(1, mature.height)),
    };
    return preset.generate(seed, 1, shape);
  }, [preset, seed, plant.scale]);

  const otherSkeleton = useMemo(
    () => (preset.allometry ? null : preset.generate(seed, maturity)),
    // maturity is derived from year
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [preset, seed, year]
  );

  // Resolve what to draw this frame: revealed branches + their foliage, and the
  // trunk thickness (oak: from the current year's DBH).
  const draw = useMemo(() => {
    if (preset.allometry && oakFull) {
      const maxOrder = oakFull.maxOrder ?? 1;
      const rev = Math.max(1, Math.round(1 + smoothstep(maturity) * (maxOrder - 1)));
      const segments = oakFull.segments.filter((s) => (s.order ?? 0) <= rev);
      const leaves = oakFull.leaves.filter((l) => {
        const o = l.order ?? 0;
        return o <= rev && o >= rev - 1; // foliage rides the current growth front
      });
      const d = treeDimensions(preset.allometry, plant.age, plant.scale);
      const radiusScale = d.dbh / 24 / Math.max(1, d.height); // DBH -> normalized trunk radius
      return { segments, leaves, height: oakFull.height, radiusScale };
    }
    const sk = otherSkeleton!;
    return { segments: sk.segments, leaves: sk.leaves, height: sk.height, radiusScale: 1 };
  }, [preset, oakFull, otherSkeleton, maturity, plant.age, plant.scale]);

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

  // Height scales uniformly to the allometric height. For allometric species
  // (oak, redwood) we also drive crown width from the model, since the
  // generator's natural spread differs from the species' true width:height —
  // so both dimensions match the science.
  const heightScale = (size.height / 5) / draw.height;
  const widthScale =
    preset.allometry && oakFull
      ? (size.width / 5 / 2) / Math.max(0.05, oakFull.spread)
      : heightScale;
  const scaleVec: [number, number, number] = [widthScale, heightScale, widthScale];
  // The group scales trunk radius by widthScale (radii live in x/z); correct it
  // so the DBH-derived thickness is preserved under the non-uniform scale.
  const branchRadiusScale = (draw.radiusScale * heightScale) / widthScale;
  const selR = Math.max(0.4, (size.width / 5) * 0.6);

  return (
    <group
      position={[plant.position.x, 0, plant.position.z]}
      rotation={[0, plant.rotation, 0]}
      onClick={onClick}
    >
      <group scale={scaleVec}>
        <BranchInstances
          segments={draw.segments}
          geom={branchGeo}
          material={branchMat}
          barkThin={preset.barkThin}
          barkThick={preset.barkThick}
          radiusScale={branchRadiusScale}
        />
        <LeafInstances
          leaves={draw.leaves}
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
  radiusScale = 1,
}: {
  segments: BranchSegment[];
  geom: THREE.CylinderGeometry;
  material: THREE.Material;
  barkThin: string;
  barkThick: string;
  radiusScale?: number; // multiplies segment radii (oak: DBH-derived trunk thickness)
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
      const rw = r * radiusScale;
      scl.set(rw, L, rw);
      m.compose(mid, q, scl);
      mesh.setMatrixAt(i, m);
      // thin twigs -> lighter bark, thick trunk -> dark bark
      col.copy(thin).lerp(thick, Math.min(1, r / maxR));
      mesh.setColorAt(i, col);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [segments, maxR, barkThin, barkThick, radiusScale]);

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

function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
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
