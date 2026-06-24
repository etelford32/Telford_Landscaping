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
  MANZANITA,
  WESTERN_REDBUD,
  MONTEREY_PINE,
  CEANOTHUS,
  TOYON,
  BUSH_ANEMONE,
  COFFEEBERRY,
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
  "arctostaphylos-densiflora",
  "cercis-occidentalis",
  "pinus-radiata",
  "ceanothus-thyrsiflorus",
  "heteromeles-arbutifolia",
  "carpenteria-californica",
  "rhamnus-californica",
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
// Manzanita 'Howard McMinn': glossy deep greens.
const MANZANITA_PALETTE = ["#3E6B2E", "#4A7A36", "#557F3D", "#356226", "#48742F", "#5C8540"];
// Western redbud bloom: vivid magenta / reddish-purple.
const REDBUD_PALETTE = ["#C71585", "#B81E6F", "#D6308A", "#A8166B", "#C42178", "#CE4D96"];
// Monterey pine: dark conifer greens.
const PINE_PALETTE = ["#2C4A2A", "#345A32", "#3E6B38", "#28432A", "#3A6234", "#305730"];
// Blueblossom ceanothus in bloom: soft-to-deep blues (rendered as a flower mass).
const CEANOTHUS_PALETTE = ["#4A6FB0", "#3D63A8", "#5A7FC0", "#34589C", "#4668AC", "#6B8FCB"];
// Toyon: glossy dark evergreen greens, with a warm tone for new growth / berries.
const TOYON_PALETTE = ["#2E4A24", "#365A2A", "#3E6B30", "#2A4420", "#43702E", "#B23A24"];
// Bush anemone in bloom: white anemone flowers with gold stamens over a little green.
const BUSH_ANEMONE_PALETTE = ["#F2F2EC", "#EAEAE0", "#F6F4EE", "#E6E6DC", "#E8D77A", "#3E6B30"];
// Coffeeberry: dense glossy deep greens, one dark tone for ripening berries.
const COFFEEBERRY_PALETTE = ["#2C4A26", "#33572C", "#3C6633", "#284322", "#37602F", "#243A20"];

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
        phyllo: { pattern: "opposite", petioleAngle: 0.9, lad: 0.6 }, // Acer: decussate
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
        phyllo: { pattern: "distichous", petioleAngle: 1.45, lad: 0.85, internode: 0.015 }, // flat 2-ranked sprays
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
  "arctostaphylos-densiflora": {
    leafKind: "manzanita",
    formMaturityAge: 18, // fills in to near-full size by ~18 years
    leafSize: 0.045,
    leafPalette: MANZANITA_PALETTE,
    barkThin: "#A8583E", // fresh peel — lighter red/orange
    barkThick: "#6E382A", // deep polished mahogany — the signature
    allometry: MANZANITA,
    generate: (seed, _m, shape) =>
      generateDecurrentTree(seed, 1, {
        forkHeight: 0.1, // multi-stem from a low base
        scaffolds: 5,
        maxDepth: 5,
        branchMin: 2,
        branchMax: 3,
        spreadAngle: 0.7,
        childAngle: 0.6,
        lengthFalloff: 0.66,
        radiusFalloff: 0.7,
        segmentsPerBranch: 4,
        sinuosity: 0.45, // crooked, twisting, sculptural
        droop: 0.1,
        crownWidthRatio: shape?.crownWidthRatio ?? 1.3,
        leafStartDepth: 2, // bare crooked lower limbs show the red bark
        leavesPerTwig: 7,
        phyllo: { pattern: "spiral", lad: 0.2, petioleAngle: 0.8 }, // erectophile: leaves held near-vertical
      }),
  },
  "cercis-occidentalis": {
    leafKind: "redbud-flower",
    formMaturityAge: 18,
    leafSize: 0.04,
    leafPalette: REDBUD_PALETTE,
    barkThin: "#8B7860", // young reddish-brown twigs
    barkThick: "#9A958C", // smooth silver-gray
    allometry: WESTERN_REDBUD,
    generate: (seed, _m, shape) =>
      generateDecurrentTree(seed, 1, {
        forkHeight: 0.12, // multi-stem from the base
        scaffolds: 5,
        maxDepth: 5,
        branchMin: 2,
        branchMax: 3,
        spreadAngle: 0.5, // vase: erect-ascending then spreading
        childAngle: 0.55,
        lengthFalloff: 0.66,
        radiusFalloff: 0.7,
        segmentsPerBranch: 4,
        sinuosity: 0.25,
        droop: 0.12,
        crownWidthRatio: shape?.crownWidthRatio ?? 0.9,
        leafStartDepth: 1, // magenta bloom studs the branches (cauliflory)
        leavesPerTwig: 8, // dense bloom
      }),
  },
  "pinus-radiata": {
    leafKind: "pine",
    formMaturityAge: 25,
    leafSize: 0.06, // long needle tufts
    leafPalette: PINE_PALETTE,
    barkThin: "#6E5A48",
    barkThick: "#4A3A2E", // dark, deeply furrowed
    allometry: MONTEREY_PINE,
    generate: (seed, _m, shape) =>
      generateExcurrentTree(seed, 1, {
        trunkSegments: 12,
        crownBase: shape?.crownBase ?? 0.32, // self-pruned bare lower trunk
        tiers: 9,
        branchesPerTier: 4,
        maxBranchLen: 0.16,
        branchDroop: 0.18, // pine limbs more horizontal/upswept than the redwood
        apexFullness: 0.45, // rounder, fuller crown — not a sharp spire
        subDepth: 2,
        branchMin: 2,
        branchMax: 3,
        lengthFalloff: 0.62,
        radiusFalloff: 0.62,
        segmentsPerBranch: 3,
        leavesPerTwig: 5,
        phyllo: { pattern: "fascicle", petioleAngle: 1.2, lad: 0.5 }, // Pinus: needle tufts
      }),
  },
  "ceanothus-thyrsiflorus": {
    leafKind: "redbud-flower", // dense blossom clusters — rendered in full blue bloom
    formMaturityAge: 15, // fast grower
    leafSize: 0.04,
    leafPalette: CEANOTHUS_PALETTE,
    barkThin: "#6E5E4E",
    barkThick: "#4A3E32",
    allometry: CEANOTHUS,
    generate: (seed, _m, shape) =>
      generateDecurrentTree(seed, 1, {
        forkHeight: 0.12,
        scaffolds: 5,
        maxDepth: 5,
        branchMin: 2,
        branchMax: 3,
        spreadAngle: 0.44,
        childAngle: 0.5,
        lengthFalloff: 0.66,
        radiusFalloff: 0.72,
        segmentsPerBranch: 4,
        sinuosity: 0.22,
        droop: 0.16, // arching habit
        crownWidthRatio: shape?.crownWidthRatio ?? 0.9,
        leafStartDepth: 1, // bloom smothers the whole shrub
        leavesPerTwig: 8,
      }),
  },
  "heteromeles-arbutifolia": {
    leafKind: "oak", // glossy holly-like leaf
    formMaturityAge: 20,
    leafSize: 0.03,
    leafPalette: TOYON_PALETTE,
    barkThin: "#7A6E60",
    barkThick: "#4E443A",
    allometry: TOYON,
    generate: (seed, _m, shape) =>
      generateDecurrentTree(seed, 1, {
        forkHeight: 0.16, // upright, short clear stem
        scaffolds: 4,
        maxDepth: 5,
        branchMin: 2,
        branchMax: 3,
        spreadAngle: 0.38, // erect habit — taller than wide
        childAngle: 0.46,
        lengthFalloff: 0.64,
        radiusFalloff: 0.72,
        segmentsPerBranch: 4,
        sinuosity: 0.2,
        droop: 0.1,
        crownWidthRatio: shape?.crownWidthRatio ?? 0.76,
        leafStartDepth: 2,
        leavesPerTwig: 6,
      }),
  },
  "carpenteria-californica": {
    leafKind: "redbud-flower", // showy white anemone flowers, rendered in bloom
    formMaturityAge: 16,
    leafSize: 0.05, // large flowers
    leafPalette: BUSH_ANEMONE_PALETTE,
    barkThin: "#9A8E7E", // pale shreddy bark
    barkThick: "#6E6256",
    allometry: BUSH_ANEMONE,
    generate: (seed, _m, shape) =>
      generateDecurrentTree(seed, 1, {
        forkHeight: 0.1, // multi-stem mound
        scaffolds: 5,
        maxDepth: 5,
        branchMin: 2,
        branchMax: 3,
        spreadAngle: 0.46,
        childAngle: 0.5,
        lengthFalloff: 0.66,
        radiusFalloff: 0.7,
        segmentsPerBranch: 4,
        sinuosity: 0.24,
        droop: 0.14,
        crownWidthRatio: shape?.crownWidthRatio ?? 0.92,
        leafStartDepth: 1, // flowers out to the branch tips
        leavesPerTwig: 8,
        phyllo: { pattern: "opposite", lad: 0.6 }, // Carpenteria: opposite-leaved
      }),
  },
  "rhamnus-californica": {
    leafKind: "manzanita", // small glossy ovate leaf
    formMaturityAge: 16,
    leafSize: 0.035,
    leafPalette: COFFEEBERRY_PALETTE,
    barkThin: "#7A6A58",
    barkThick: "#4E3E30",
    allometry: COFFEEBERRY,
    generate: (seed, _m, shape) =>
      generateDecurrentTree(seed, 1, {
        forkHeight: 0.1, // dense multi-stem mound
        scaffolds: 5,
        maxDepth: 5,
        branchMin: 2,
        branchMax: 3,
        spreadAngle: 0.46, // broad, rounded
        childAngle: 0.5,
        lengthFalloff: 0.66,
        radiusFalloff: 0.7,
        segmentsPerBranch: 4,
        sinuosity: 0.2,
        droop: 0.12,
        crownWidthRatio: shape?.crownWidthRatio ?? 1.0,
        leafStartDepth: 1, // dense foliage to the interior
        leavesPerTwig: 9,
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
    // A leaf card folded along its midrib: the center column (x=0) rides a small
    // ridge in +Z while the two edges fall away, so the blade catches light and
    // self-shades like a real leaf instead of reading as a flat sheet.
    const g = new THREE.PlaneGeometry(1, 1.25, 2, 1);
    const posAttr = g.attributes.position as THREE.BufferAttribute;
    const fold = 0.16;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      posAttr.setZ(i, fold * (1 - Math.abs(x) / 0.5)); // ridge at the midrib
    }
    posAttr.needsUpdate = true;
    g.translate(0, 0.6, 0); // pivot at the stem base so leaves splay from the twig
    g.computeVertexNormals();
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
    const zAxis = new THREE.Vector3(0, 0, 1);
    const dir = new THREE.Vector3();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const col = new THREE.Color();
    const n0 = new THREE.Vector3();
    const face = new THREE.Vector3();
    const faceProj = new THREE.Vector3();
    const crs = new THREE.Vector3();

    for (let i = 0; i < leaves.length; i++) {
      const lf = leaves[i];
      pos.set(lf.pos[0], lf.pos[1], lf.pos[2]);
      dir.set(lf.dir[0], lf.dir[1], lf.dir[2]).normalize();
      q.setFromUnitVectors(yAxis, dir);
      if (lf.face) {
        // Roll the blade about its midrib so its surface normal points toward the
        // botanical `face` direction (light-facing), instead of a random angle.
        n0.copy(zAxis).applyQuaternion(q); // card normal after aligning +Y to dir
        face.set(lf.face[0], lf.face[1], lf.face[2]);
        faceProj.copy(face).addScaledVector(dir, -face.dot(dir)); // ⟂ to midrib
        if (faceProj.lengthSq() > 1e-6) {
          faceProj.normalize();
          crs.crossVectors(n0, faceProj);
          const roll = Math.atan2(crs.dot(dir), THREE.MathUtils.clamp(n0.dot(faceProj), -1, 1));
          qRoll.setFromAxisAngle(dir, roll);
          q.premultiply(qRoll);
        }
      } else {
        qRoll.setFromAxisAngle(dir, lf.roll);
        q.premultiply(qRoll);
      }
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
