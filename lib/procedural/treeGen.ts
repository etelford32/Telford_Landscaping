// Procedural plant skeleton generator.
//
// A seeded, growth-aware L-system. It produces a normalized skeleton (roughly
// unit height) of branch segments plus leaf placements; the renderer scales the
// whole thing to the size the growth model reports for a given age. `maturity`
// (0..1) drives how many branch orders develop, so a young plant is genuinely
// simpler than a mature one rather than just a scaled-down copy.
//
// Pure TypeScript with no three.js dependency, so it is unit-testable in node.

export type Vec = [number, number, number];

export interface BranchSegment {
  p0: Vec;
  p1: Vec;
  r0: number;
  r1: number;
  order?: number; // branch order (0 = trunk); used to reveal growth over time
}

export interface LeafPlacement {
  pos: Vec;
  dir: Vec; // axis the blade extends along (petiole/midrib, stem -> tip)
  roll: number; // rotation about dir (fallback when `face` is absent)
  scale: number; // relative size multiplier (renderer applies absolute leaf size)
  order?: number; // branch order the leaf sits on
  face?: Vec; // direction the blade's upper surface points (its normal); when
  // present the renderer orients the leaf to it instead of using `roll`, so
  // foliage presents its faces to the light rather than at random angles
}

// ── phyllotaxis (botanical leaf arrangement) ───────────────────────────────────
// How leaves attach to a shoot. Real species follow exact patterns; this is the
// scientific core that replaces random leaf scatter. Kept pure + unit-tested.
export type PhyllotaxisPattern =
  | "spiral" // alternate, golden-angle divergence (most broadleaves: oaks, etc.)
  | "opposite" // decussate pairs, 90° between successive pairs (maple, carpenteria)
  | "whorl" // k leaves per node
  | "distichous" // 2-ranked, flat spray (redwood foliage)
  | "fascicle"; // a tuft/bundle from one node (pine needles)

export interface PhyllotaxisSpec {
  pattern: PhyllotaxisPattern;
  divergence?: number; // radians between successive nodes (default golden angle)
  perNode?: number; // leaves per node for whorls (default 3)
  petioleAngle?: number; // radians the blade tilts off the shoot axis (default ~1.0)
  /** Leaf-angle distribution: 0 = erectophile (vertical), 1 = planophile (flat). */
  lad?: number;
  internode?: number; // normalized spacing between nodes up the shoot (default 0.02)
}

export interface LeafNode {
  along: number; // 0..1 fraction up the shoot
  azimuth: number; // radians around the shoot axis
}

// An opaque canopy blob under the leaf layer, so densely-packed shrubs read as
// a solid mass instead of a hollow shell of leaf cards with the ground showing
// through the gaps. Normalized to the skeleton's unit height.
export interface CanopyCore {
  rx: number; // horizontal radius
  ry: number; // vertical radius
  cy: number; // center height
  taper: number; // 0 mound .. →1 pinched top (cone)
}

export interface PlantSkeleton {
  segments: BranchSegment[];
  leaves: LeafPlacement[];
  height: number; // normalized height of the generated skeleton
  spread: number; // normalized horizontal radius
  maxOrder?: number; // deepest branch order present (for growth reveal)
  core?: CanopyCore; // optional solid canopy fill (shrub mounds)
}

export interface TreeParams {
  trunkLength: number; // normalized base trunk length
  trunkRadius: number;
  maxDepth: number; // branch orders at full maturity
  branchMin: number; // children per node (min)
  branchMax: number; // children per node (max)
  branchAngle: number; // radians, spread from parent axis
  lengthFalloff: number; // child length / parent length
  radiusFalloff: number; // child radius / parent radius
  segmentsPerBranch: number;
  curve: number; // random per-segment bend
  gravitropism: number; // +up / -down bias per segment
  leafStartDepth: number; // branch order at which leaves begin
  leavesPerTwig: number; // leaves clustered at a terminal twig
  phyllo?: PhyllotaxisSpec; // leaf arrangement (default: spiral)
}

export interface ShellParams {
  height: number; // normalized
  width: number; // normalized
  trunkRadius: number;
  leafCount: number; // leaves at full maturity
  clip: number; // 0..1 fraction of lower sphere removed (flat bottom)
}

export interface BoxwoodParams {
  width: number; // full width at model height 1 (the width:height aspect)
  clip: number; // 0..1 lower fraction removed → flat, grounded base
  leafCount: number; // dense leaf target at full maturity
  lobes: number; // number of billows around the mound (surface undulation)
  lobeDepth: number; // 0..1 amplitude of the billows
  taper: number; // 0 = mound, →0.6 pinches the top into an egg/cone (upright cultivars)
  trunkRadius: number;
}

export interface DecurrentParams {
  forkHeight: number; // raw height of the clear trunk before the first fork
  scaffolds: number; // primary codominant scaffold limbs (oaks: 3–5)
  maxDepth: number; // branch orders past the scaffolds at full maturity
  branchMin: number;
  branchMax: number;
  spreadAngle: number; // radians — scaffold splay from vertical (wide for oaks)
  childAngle: number; // radians — sub-branch angle
  lengthFalloff: number;
  radiusFalloff: number;
  segmentsPerBranch: number;
  sinuosity: number; // lateral wander (gnarled limbs)
  droop: number; // outer/upper limbs arch over (broad crown)
  crownWidthRatio: number; // target spread:height — biases growth outward
  leafStartDepth: number;
  leavesPerTwig: number;
  phyllo?: PhyllotaxisSpec; // leaf arrangement (default: spiral)
}

export interface ExcurrentParams {
  trunkSegments: number; // segments up the central leader
  crownBase: number; // height fraction where the live crown starts (bare trunk below)
  tiers: number; // branch tiers up the crown
  branchesPerTier: number; // laterals per tier
  maxBranchLen: number; // longest lateral (at the crown base), normalized
  branchDroop: number; // downsweep of the lower laterals (radians)
  subDepth: number; // sub-branch orders on each lateral
  branchMin: number;
  branchMax: number;
  lengthFalloff: number;
  radiusFalloff: number;
  segmentsPerBranch: number;
  leavesPerTwig: number;
  phyllo?: PhyllotaxisSpec; // leaf/needle arrangement (default: spiral)
  /** 0 = branches taper to a sharp apex (cone); ~0.5 = fuller, rounder top. */
  apexFullness?: number;
}

const UP: Vec = [0, 1, 0];
const GOLDEN_ANGLE = 2.399963229728653; // radians (~137.5°)
const MAX_SEGMENTS = 2600;
const MAX_LEAVES = 3000;

// ── vector helpers ────────────────────────────────────────────────────────────
const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: Vec, s: number): Vec => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: Vec): number => Math.hypot(a[0], a[1], a[2]);
const norm = (a: Vec): Vec => {
  const l = len(a) || 1e-6;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

// Orthonormal basis (u, v) perpendicular to d
function perpBasis(d: Vec): [Vec, Vec] {
  const ref: Vec = Math.abs(d[1]) > 0.95 ? [1, 0, 0] : UP;
  const u = norm(cross(d, ref));
  const v = norm(cross(d, u));
  return [u, v];
}

function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

// ── deterministic RNG (mulberry32) ────────────────────────────────────────────
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SPIRAL: PhyllotaxisSpec = { pattern: "spiral" };

// Pure phyllotactic layout: where `count` leaves sit on a shoot, expressed as
// (fraction up the shoot, azimuth around it). This is the botanical heart of the
// foliage — deterministic and unit-tested, no rendering concerns.
export function phyllotaxisLayout(spec: PhyllotaxisSpec, count: number): LeafNode[] {
  const out: LeafNode[] = [];
  if (count <= 0) return out;
  const div = spec.divergence ?? GOLDEN_ANGLE;

  if (spec.pattern === "fascicle") {
    // A bundle from a single node — pine needles fan out together.
    for (let i = 0; i < count; i++) {
      const a = count === 1 ? 0 : (i / (count - 1) - 0.5) * 1.2;
      out.push({ along: 0.02 * i, azimuth: a });
    }
    return out;
  }
  if (spec.pattern === "opposite") {
    // Decussate: pairs 180° apart, successive pairs rotated 90°.
    const nodes = Math.ceil(count / 2);
    for (let j = 0; j < nodes && out.length < count; j++) {
      const baseAz = j * (Math.PI / 2);
      const along = (j + 0.5) / nodes;
      out.push({ along, azimuth: baseAz });
      if (out.length < count) out.push({ along, azimuth: baseAz + Math.PI });
    }
    return out;
  }
  if (spec.pattern === "whorl") {
    const k = Math.max(2, spec.perNode ?? 3);
    const nodes = Math.ceil(count / k);
    for (let j = 0; j < nodes && out.length < count; j++) {
      const along = (j + 0.5) / nodes;
      for (let w = 0; w < k && out.length < count; w++) {
        out.push({ along, azimuth: j * div + w * ((2 * Math.PI) / k) });
      }
    }
    return out;
  }
  if (spec.pattern === "distichous") {
    // 2-ranked: leaves alternate to opposite sides in one plane (flat sprays).
    for (let i = 0; i < count; i++) {
      out.push({ along: (i + 0.5) / count, azimuth: (i % 2) * Math.PI });
    }
    return out;
  }
  // spiral (alternate): the golden-angle default — optimal non-overlap.
  for (let i = 0; i < count; i++) {
    out.push({ along: (i + 0.5) / count, azimuth: i * div });
  }
  return out;
}

// Leaf Area Index → a bounded canopy-density multiplier. LAI (one-sided leaf
// area per unit ground area) is the standard measure of how dense a canopy is:
// ~1-2 = open woodland / chaparral, ~3-5 = typical broadleaf, ~6-8 = dense
// conifer. Referenced to ~3.5 so a median-density species is left unchanged;
// clamped so no species explodes or vanishes.
export function laiFactor(lai: number, ref = 3.5): number {
  return Math.max(0.45, Math.min(1.9, lai / ref));
}

// Per-twig (or per-shell) leaf count scaled for a species' LAI, clamped for
// sanity and instancing cost.
export function leafCountForLAI(base: number, lai: number): number {
  return Math.max(2, Math.min(14, Math.round(base * laiFactor(lai))));
}

// Emit `count` leaves as a phyllotactic shoot growing from `base` along `axis`.
// Each leaf gets a petiole-tilted midrib (`dir`) and a light-facing normal
// (`face`) derived from the species' leaf-angle distribution — so the canopy
// presents its surfaces to the light instead of scattering edge-on cards.
function emitShoot(
  out: LeafPlacement[],
  base: Vec,
  axis: Vec,
  count: number,
  scaleMul: number,
  spec: PhyllotaxisSpec,
  rng: () => number,
  order?: number
): void {
  if (count <= 0 || out.length >= MAX_LEAVES) return;
  const ax = norm(axis);
  const [u, v] = perpBasis(ax);
  const pa = spec.petioleAngle ?? 1.0;
  const lad = spec.lad ?? 0.5;
  const span = (spec.internode ?? 0.02) * Math.max(1, count);

  for (const nd of phyllotaxisLayout(spec, count)) {
    if (out.length >= MAX_LEAVES) return;
    const ca = Math.cos(nd.azimuth);
    const sa = Math.sin(nd.azimuth);
    // Outward (radial) direction at this azimuth around the shoot.
    const radial: Vec = norm([
      u[0] * ca + v[0] * sa,
      u[1] * ca + v[1] * sa,
      u[2] * ca + v[2] * sa,
    ]);
    // Midrib: tilt off the shoot axis toward the outward direction, with a touch
    // of lateral jitter so a shoot isn't mechanically perfect.
    const jit = (rng() - 0.5) * 0.25;
    const dir: Vec = norm([
      ax[0] * Math.cos(pa) + radial[0] * Math.sin(pa) + jit * v[0],
      ax[1] * Math.cos(pa) + radial[1] * Math.sin(pa),
      ax[2] * Math.cos(pa) + radial[2] * Math.sin(pa) + jit * v[2],
    ]);
    const nodePos = add(base, scale(ax, nd.along * span));
    const pos = add(nodePos, scale(dir, 0.012)); // short petiole gap off the twig
    // Blade normal from the leaf-angle distribution: planophile -> up to catch
    // overhead light; erectophile -> held outward/vertical.
    const face: Vec = norm([
      radial[0] * (1 - lad) + (rng() - 0.5) * 0.3,
      lad + 0.25 + (rng() - 0.5) * 0.2,
      radial[2] * (1 - lad) + (rng() - 0.5) * 0.3,
    ]);
    out.push({
      pos,
      dir,
      face,
      roll: rng() * Math.PI * 2,
      scale: (0.7 + rng() * 0.6) * scaleMul,
      order,
    });
  }
}

// ── branching tree (L-system) ─────────────────────────────────────────────────
export function generateTree(seed: number, maturity: number, p: TreeParams): PlantSkeleton {
  const rng = mulberry32(seed);
  const segments: BranchSegment[] = [];
  const leaves: LeafPlacement[] = [];

  const m = Math.max(0, Math.min(1, maturity));
  const effectiveDepth = Math.max(1, Math.round(1.2 + smoothstep(m) * (p.maxDepth - 1.2)));
  const leafDensity = 0.3 + 0.7 * m;

  let bounds = { maxY: 0, maxR: 0 };

  const grow = (start: Vec, dir: Vec, length: number, radius: number, depth: number) => {
    if (segments.length >= MAX_SEGMENTS) return;

    let pos = start;
    let d = norm(dir);
    let r = radius;
    const segLen = length / p.segmentsPerBranch;
    const taper = Math.pow(p.radiusFalloff, 1 / p.segmentsPerBranch);

    for (let i = 0; i < p.segmentsPerBranch; i++) {
      // Bend the growth direction: a little upward bias plus random wander.
      const jitter: Vec = [
        (rng() - 0.5) * p.curve,
        (rng() - 0.5) * p.curve + p.gravitropism * 0.08,
        (rng() - 0.5) * p.curve,
      ];
      d = norm(add(d, jitter));
      const next = add(pos, scale(d, segLen));
      const r1 = r * taper;
      segments.push({ p0: pos, p1: next, r0: r, r1: r1 });

      pos = next;
      r = r1;

      bounds.maxY = Math.max(bounds.maxY, pos[1]);
      bounds.maxR = Math.max(bounds.maxR, Math.hypot(pos[0], pos[2]));

      // Leaves arranged along higher-order branches by the species' phyllotaxis.
      if (depth >= p.leafStartDepth && leaves.length < MAX_LEAVES) {
        const n = Math.round(leafDensity * (depth - p.leafStartDepth + 1));
        emitShoot(leaves, pos, d, n, 1, p.phyllo ?? SPIRAL, rng);
      }
    }

    if (depth < effectiveDepth) {
      const count = p.branchMin + Math.floor(rng() * (p.branchMax - p.branchMin + 1));
      const [u, v] = perpBasis(d);
      for (let c = 0; c < count; c++) {
        const roll = c * GOLDEN_ANGLE + rng() * 0.5;
        const ang = p.branchAngle * (0.75 + rng() * 0.5);
        const offset = add(scale(u, Math.cos(roll)), scale(v, Math.sin(roll)));
        const childDir = norm(add(scale(d, Math.cos(ang)), scale(offset, Math.sin(ang))));
        const childLen = length * p.lengthFalloff * (0.82 + rng() * 0.36);
        grow(pos, childDir, childLen, r, depth + 1);
      }
    } else if (leaves.length < MAX_LEAVES) {
      // Terminal twig — a phyllotactic cluster of leaves.
      emitShoot(leaves, pos, d, p.leavesPerTwig, 1, p.phyllo ?? SPIRAL, rng);
    }
  };

  grow([0, 0, 0], UP, p.trunkLength, p.trunkRadius, 0);

  return {
    segments,
    leaves,
    height: Math.max(bounds.maxY, 1e-3),
    spread: Math.max(bounds.maxR, 1e-3),
  };
}

// ── dense shell shrub (boxwood and other sheared evergreens) ───────────────────
export function generateShrubShell(seed: number, maturity: number, p: ShellParams): PlantSkeleton {
  const rng = mulberry32(seed);
  const segments: BranchSegment[] = [];
  const leaves: LeafPlacement[] = [];

  const m = Math.max(0, Math.min(1, maturity));
  const ry = p.height * 0.5;
  const rx = p.width * 0.5;
  const centerY = ry;

  // A couple of short interior stems for a hint of structure under the foliage.
  segments.push({ p0: [0, 0, 0], p1: [0, ry * 0.7, 0], r0: p.trunkRadius, r1: p.trunkRadius * 0.8 });

  const count = Math.round((0.18 + 0.82 * smoothstep(m)) * p.leafCount);

  for (let i = 0; i < count && leaves.length < MAX_LEAVES; i++) {
    // Fibonacci-sphere distribution for even coverage.
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    const theta = i * GOLDEN_ANGLE;
    const nx = Math.sin(phi) * Math.cos(theta);
    const ny = Math.cos(phi);
    const nz = Math.sin(phi) * Math.sin(theta);

    // Clip the lower portion so the shrub has a flattened base.
    if (ny < -1 + 2 * p.clip) continue;

    const wob = 0.86 + rng() * 0.28;
    const px = nx * rx * wob;
    const py = centerY + ny * ry * wob;
    const pz = nz * rx * wob;
    if (py < p.height * 0.08) continue;

    const dir: Vec = norm([nx, Math.max(0.15, ny) + 0.25, nz]);
    // Blade faces outward from the shrub surface (the sphere normal), tipped up.
    const face: Vec = norm([nx, ny + 0.5, nz]);
    leaves.push({ pos: [px, py, pz], dir, face, roll: rng() * Math.PI * 2, scale: 0.7 + rng() * 0.6 });
  }

  return { segments, leaves, height: Math.max(p.height, 1e-3), spread: Math.max(rx, 1e-3) };
}

// ── boxwood (dense sheared/informal mound) ─────────────────────────────────────
// Buxus reads nothing like the generic leaf-sphere: it's a billowing, densely
// packed mound of tiny leaves over a hidden twiggy interior, broadening with age
// and (for upright cultivars) able to pinch into an egg/cone. This generator
// builds that: a lobed ellipsoid surface, a layered leaf shell so shear gaps
// reveal depth instead of a hollow skin, short interior stubs that read at the
// base, and a form that widens as the plant matures. Normalized to height 1.
export function generateBoxwood(seed: number, maturity: number, p: BoxwoodParams): PlantSkeleton {
  const rng = mulberry32(seed);
  const segments: BranchSegment[] = [];
  const leaves: LeafPlacement[] = [];

  const m = Math.max(0, Math.min(1, maturity));
  // Young plants sit rounder and narrower; the crown billows wider with age.
  const aspect = p.width * (0.82 + 0.18 * smoothstep(m));
  const rx = aspect * 0.5;
  const ry = 0.5;
  const centerY = ry;

  // Per-plant lobe phases so no two mounds share a silhouette.
  const phA = rng() * Math.PI * 2;
  const phB = rng() * Math.PI * 2;
  const phC = rng() * Math.PI * 2;

  // Interior woody structure: a short central stem plus a few low radiating
  // stubs, kept well inside the crown so they stay hidden under the foliage and
  // solid core (they only peek out on a very young, open plant).
  segments.push({ p0: [0, 0, 0], p1: [0, ry * 0.6, 0], r0: p.trunkRadius, r1: p.trunkRadius * 0.7 });
  const stubs = 3;
  for (let i = 0; i < stubs; i++) {
    const a = (i / stubs) * Math.PI * 2 + rng() * 0.6;
    const reach = rx * (0.15 + rng() * 0.18);
    const h = ry * (0.35 + rng() * 0.4);
    segments.push({
      p0: [0, ry * 0.1, 0],
      p1: [Math.cos(a) * reach, h, Math.sin(a) * reach],
      r0: p.trunkRadius * 0.6,
      r1: p.trunkRadius * 0.35,
    });
  }

  // Billowing surface: layered sinusoids in azimuth and height give the cloud
  // its gentle lobes rather than a smooth sphere.
  const lobe = (nx: number, ny: number, nz: number): number => {
    const theta = Math.atan2(nz, nx);
    return (
      1 +
      p.lobeDepth * Math.sin(p.lobes * theta + phA) +
      p.lobeDepth * 0.6 * Math.sin(p.lobes * 0.5 * theta - 2 * ny + phB) +
      p.lobeDepth * 0.5 * Math.sin(3 * ny * Math.PI + phC)
    );
  };

  const count = Math.round((0.3 + 0.7 * smoothstep(m)) * p.leafCount);

  for (let i = 0; i < count && leaves.length < MAX_LEAVES; i++) {
    // Fibonacci-sphere distribution for even coverage.
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    const theta = i * GOLDEN_ANGLE;
    const nx = Math.sin(phi) * Math.cos(theta);
    const ny = Math.cos(phi);
    const nz = Math.sin(phi) * Math.sin(theta);
    if (ny < -1 + 2 * p.clip) continue; // flatten the base

    const hf = (ny + 1) / 2; // 0 bottom .. 1 top
    const horiz = 1 - p.taper * smoothstep(hf); // pinch the top for cone cultivars
    const L = lobe(nx, ny, nz);
    // Leaves ride the outer surface (the solid core fills the interior), with a
    // little jitter so the skin looks ragged, not shrink-wrapped.
    const shell = 0.98 + rng() * 0.07;
    const wob = 0.96 + rng() * 0.08;

    const px = nx * rx * L * horiz * shell * wob;
    const pz = nz * rx * L * horiz * shell * wob;
    const py = centerY + ny * ry * L * shell * wob;
    if (py < 0.05) continue; // keep leaves off the ground

    // Small blades lie mostly upright and tangent to the surface, facing
    // outward — overlapping into a dense leafy skin rather than radial spikes.
    // Blades near the equator are tucked smaller so the dome edge stays clean.
    const edgeFade = 0.82 + 0.18 * Math.abs(ny); // smaller mid-height, fuller top
    const dir: Vec = norm([nx * 0.2, 0.94, nz * 0.2]);
    const face: Vec = norm([nx, ny * 0.5 + 0.35, nz]);
    leaves.push({ pos: [px, py, pz], dir, face, roll: rng() * Math.PI * 2, scale: (0.8 + rng() * 0.4) * edgeFade });
  }

  // Solid canopy fill sits just inside the leaf shell so the mound reads dense.
  const core: CanopyCore = {
    rx: rx * (1 - 0.32 * p.taper) * 0.9,
    ry: ry * 0.92,
    cy: centerY * (1 - 0.12 * p.taper),
    taper: p.taper,
  };

  return { segments, leaves, height: 1, spread: Math.max(rx, 1e-3), core };
}

// ── decurrent tree (oaks) ──────────────────────────────────────────────────────
// Coast live oak architecture: a short, stout trunk forks low into several
// codominant scaffold limbs that spread and arch into a broad crown (often
// wider than tall). The FULL mature skeleton is generated here with every
// segment and leaf tagged by branch order; the renderer reveals orders
// progressively with age so you watch the same trunk thicken and the same limbs
// extend and ramify. Radii are fractions of the trunk (renderer applies the
// allometric, DBH-derived thickness), and positions are normalized to height 1.
export function generateDecurrentTree(
  seed: number,
  _maturity: number,
  p: DecurrentParams
): PlantSkeleton {
  const rng = mulberry32(seed);
  const segments: BranchSegment[] = [];
  const leaves: LeafPlacement[] = [];
  const outwardBias = 0.012 * p.crownWidthRatio;
  let maxOrder = 1;

  const grow = (start: Vec, dir: Vec, length: number, radius: number, depth: number) => {
    if (segments.length >= MAX_SEGMENTS) return;
    maxOrder = Math.max(maxOrder, depth);

    let pos = start;
    let d = norm(dir);
    let r = radius;
    const segLen = length / p.segmentsPerBranch;
    const taper = Math.pow(p.radiusFalloff, 1 / p.segmentsPerBranch);

    for (let i = 0; i < p.segmentsPerBranch; i++) {
      // Sinuous wander, a gentle arch toward the tips, an outward pull that
      // widens the crown, and an upward lift on the inner limbs so the crown
      // gains height instead of sagging to the ground.
      const progress = i / p.segmentsPerBranch;
      const arch = -p.droop * (depth / p.maxDepth) * (0.3 + 0.7 * progress);
      const lift = 0.05 * (1 - depth / p.maxDepth);
      const radial = norm([pos[0], 0, pos[2]]);
      const wander: Vec = [
        (rng() - 0.5) * p.sinuosity,
        (rng() - 0.5) * p.sinuosity * 0.5 + arch + lift,
        (rng() - 0.5) * p.sinuosity,
      ];
      d = norm(add(add(d, wander), scale(radial, outwardBias)));
      const next = add(pos, scale(d, segLen));
      const r1 = r * taper;
      segments.push({ p0: pos, p1: next, r0: r, r1: r1, order: depth });
      pos = next;
      r = r1;
    }

    // Foliage rides the branch tips (every order) as a phyllotactic shoot,
    // tagged by order so the renderer can keep leaves on the current growth front.
    if (depth >= p.leafStartDepth && leaves.length < MAX_LEAVES) {
      emitShoot(leaves, pos, d, p.leavesPerTwig, 1, p.phyllo ?? SPIRAL, rng, depth);
    }

    if (depth < p.maxDepth) {
      const count = p.branchMin + Math.floor(rng() * (p.branchMax - p.branchMin + 1));
      const [u, v] = perpBasis(d);
      for (let c = 0; c < count; c++) {
        const roll = c * GOLDEN_ANGLE + rng() * 0.6;
        const ang = p.childAngle * (0.7 + rng() * 0.6);
        const offset = add(scale(u, Math.cos(roll)), scale(v, Math.sin(roll)));
        const childDir = norm(add(scale(d, Math.cos(ang)), scale(offset, Math.sin(ang))));
        const childLen = length * p.lengthFalloff * (0.8 + rng() * 0.4);
        grow(pos, childDir, childLen, r * p.radiusFalloff, depth + 1);
      }
    }
  };

  // Short, stout, slightly leaning trunk up to the fork (radius fraction 1.0).
  let pos: Vec = [0, 0, 0];
  let d: Vec = norm([(rng() - 0.5) * 0.12, 1, (rng() - 0.5) * 0.12]);
  let r = 1.0;
  const trunkSegs = Math.max(2, Math.round(p.segmentsPerBranch * 0.8));
  const trunkSegLen = p.forkHeight / trunkSegs;
  const trunkTaper = Math.pow(0.92, 1 / trunkSegs);
  for (let i = 0; i < trunkSegs; i++) {
    d = norm(add(d, [(rng() - 0.5) * 0.05, 0, (rng() - 0.5) * 0.05]));
    const next = add(pos, scale(d, trunkSegLen));
    const r1 = r * trunkTaper;
    segments.push({ p0: pos, p1: next, r0: r, r1: r1, order: 0 });
    pos = next;
    r = r1;
  }

  // Fork into codominant scaffold limbs (order 1).
  const [u, v] = perpBasis(d);
  const scaffolds = Math.max(2, p.scaffolds);
  for (let s = 0; s < scaffolds; s++) {
    const roll = (s / scaffolds) * Math.PI * 2 + rng() * 0.5;
    const ang = p.spreadAngle * (0.8 + rng() * 0.4);
    const offset = add(scale(u, Math.cos(roll)), scale(v, Math.sin(roll)));
    const limbDir = norm(add(scale(d, Math.cos(ang)), scale(offset, Math.sin(ang))));
    const limbLen = p.forkHeight * 2.0 * (0.85 + rng() * 0.3);
    grow(pos, limbDir, limbLen, r * 0.92, 1);
  }

  // Normalize positions to height 1 (radii stay as fractions of the trunk).
  let rawMaxY = 1e-3;
  for (const seg of segments) rawMaxY = Math.max(rawMaxY, seg.p0[1], seg.p1[1]);
  const inv = 1 / rawMaxY;
  let maxR = 1e-3;
  for (const seg of segments) {
    seg.p0 = scale(seg.p0, inv);
    seg.p1 = scale(seg.p1, inv);
    maxR = Math.max(maxR, Math.hypot(seg.p1[0], seg.p1[2]));
  }
  for (const lf of leaves) lf.pos = scale(lf.pos, inv);

  return { segments, leaves, height: 1, spread: maxR, maxOrder };
}

// ── excurrent tree (redwoods, most conifers) ──────────────────────────────────
// A single straight central leader with tiers of lateral branches that shorten
// toward the top — a narrow cone. Coast redwood: laterals droop in the lower
// crown and lift slightly near the apex; foliage hangs in flat sprays. Built
// full with orders tagged; the renderer reveals orders and applies allometric
// height / crown width / DBH-derived trunk thickness.
export function generateExcurrentTree(
  seed: number,
  _maturity: number,
  p: ExcurrentParams
): PlantSkeleton {
  const rng = mulberry32(seed);
  const segments: BranchSegment[] = [];
  const leaves: LeafPlacement[] = [];
  let maxOrder = 1;

  const grow = (start: Vec, dir: Vec, length: number, radius: number, depth: number) => {
    if (segments.length >= MAX_SEGMENTS) return;
    maxOrder = Math.max(maxOrder, depth);
    let pos = start;
    let d = norm(dir);
    let r = radius;
    const segLen = length / p.segmentsPerBranch;
    const taper = Math.pow(p.radiusFalloff, 1 / p.segmentsPerBranch);
    for (let i = 0; i < p.segmentsPerBranch; i++) {
      d = norm(add(d, [(rng() - 0.5) * 0.1, -0.05 + (rng() - 0.5) * 0.06, (rng() - 0.5) * 0.1]));
      const next = add(pos, scale(d, segLen));
      const r1 = r * taper;
      segments.push({ p0: pos, p1: next, r0: r, r1: r1, order: depth });
      pos = next;
      r = r1;
    }
    // Foliage sprays/tufts along the lateral, arranged by the species' pattern
    // (distichous sprays for the redwood, needle fascicles for the pine).
    emitShoot(leaves, pos, d, p.leavesPerTwig, 1, p.phyllo ?? SPIRAL, rng, depth);
    if (depth < p.subDepth + 1) {
      const count = p.branchMin + Math.floor(rng() * (p.branchMax - p.branchMin + 1));
      const [u, v] = perpBasis(d);
      for (let c = 0; c < count; c++) {
        const roll = c * GOLDEN_ANGLE + rng() * 0.6;
        const ang = 0.5 + rng() * 0.35;
        const offset = add(scale(u, Math.cos(roll)), scale(v, Math.sin(roll)));
        const childDir = norm(add(scale(d, Math.cos(ang)), scale(offset, Math.sin(ang))));
        const childLen = length * p.lengthFalloff * (0.7 + rng() * 0.5);
        grow(pos, childDir, childLen, r * p.radiusFalloff, depth + 1);
      }
    }
  };

  // Central leader (order 0): straight up, slight wander, strong taper.
  let pos: Vec = [0, 0, 0];
  let d: Vec = [0, 1, 0];
  let r = 1.0;
  const segLen = 1.0 / p.trunkSegments;
  const leaderTaper = Math.pow(0.14, 1 / p.trunkSegments);
  const leaderPath: { pos: Vec; r: number; h: number }[] = [{ pos: [0, 0, 0], r: 1, h: 0 }];
  for (let i = 0; i < p.trunkSegments; i++) {
    d = norm(add(d, [(rng() - 0.5) * 0.025, 0, (rng() - 0.5) * 0.025]));
    const next = add(pos, scale(d, segLen));
    const r1 = r * leaderTaper;
    segments.push({ p0: pos, p1: next, r0: r, r1: r1, order: 0 });
    pos = next;
    r = r1;
    leaderPath.push({ pos, r, h: (i + 1) / p.trunkSegments });
  }

  // Branch tiers up the crown, shortening toward the apex.
  for (let t = 0; t < p.tiers; t++) {
    const hFrac = p.crownBase + (1 - p.crownBase) * (p.tiers === 1 ? 0.4 : t / (p.tiers - 1));
    const lp = leaderPath.reduce((best, cur) =>
      Math.abs(cur.h - hFrac) < Math.abs(best.h - hFrac) ? cur : best
    );
    const crownPos = (hFrac - p.crownBase) / (1 - p.crownBase); // 0 base .. 1 apex
    const lenFactor = Math.pow(1 - crownPos * 0.85 * (1 - (p.apexFullness ?? 0)), 1.1);
    for (let b = 0; b < p.branchesPerTier; b++) {
      const roll = (b / p.branchesPerTier) * Math.PI * 2 + t * 1.3 + rng() * 0.5;
      const horiz: Vec = [Math.cos(roll), 0, Math.sin(roll)];
      const angFromHoriz = -p.branchDroop * (1 - crownPos) + 0.18 * crownPos;
      const dir = norm(add(scale(horiz, Math.cos(angFromHoriz)), [0, Math.sin(angFromHoriz), 0]));
      const length = p.maxBranchLen * lenFactor * (0.8 + rng() * 0.4);
      grow(lp.pos, dir, length, lp.r * 0.5, 1);
    }
  }

  // Normalize positions to height 1 (radii stay as fractions of the trunk).
  let rawMaxY = 1e-3;
  for (const seg of segments) rawMaxY = Math.max(rawMaxY, seg.p0[1], seg.p1[1]);
  const inv = 1 / rawMaxY;
  let maxR = 1e-3;
  for (const seg of segments) {
    seg.p0 = scale(seg.p0, inv);
    seg.p1 = scale(seg.p1, inv);
    maxR = Math.max(maxR, Math.hypot(seg.p1[0], seg.p1[2]));
  }
  for (const lf of leaves) lf.pos = scale(lf.pos, inv);

  return { segments, leaves, height: 1, spread: maxR, maxOrder };
}
