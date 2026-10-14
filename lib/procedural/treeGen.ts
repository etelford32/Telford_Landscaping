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
  exposure?: number; // 0 = deep shaded interior .. 1 = fully sunlit outer growth
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

// ── dwarf conifer (Hinoki cypress cultivars and kin) ───────────────────────────
// Chamaecyparis obtusa dwarfs don't branch like a tree you can see into: short
// ascending leaders carry horizontal branchlets that end in flattened, cupped,
// shell-shaped fans of scale leaves, stacked in layers so the plant reads as
// tiers of overlapping shelves ('Nana Gracilis'), a flat-topped bun ('Nana'), or
// a tight cone ('Nana Pyramidalis'). This generator builds that:
//
//   • an envelope (dome ↔ cone via `taper`, flattened crown via `flatTop`,
//     tucked in at the soil line) whose width:height comes from the growth model
//     each year, so form tracks the measured dimensions;
//   • horizontal tiers of fans on nested rings — an outer shell and inner layers
//     so gaps show depth, not ground — each fan held near-horizontal with its rim
//     tipped up (`cup`) and a per-fan twist, which gives the whorled,
//     shell-like texture;
//   • a few hidden leaders and tier branchlets, plus a solid dark core.
//
// Young plants carry fewer tiers of relatively larger fans; with maturity the
// layers multiply and each fan is a smaller fraction of the plant — the way a
// real dwarf conifer fills in. Normalized to height 1.
export interface DwarfConiferParams {
  aspect: number; // envelope width:height (from the growth model)
  taper: number; // 0 = globe/bun .. 1 = pointed cone
  flatTop: number; // 0..1 flattening of the crown top and squaring of the sides
  tiers: number; // layers of fans at full maturity
  fansPerTier: number; // fans on the outer ring of the widest tier at full maturity
  irregularity: number; // 0..1 lobing of the outline (Nana Gracilis is irregular)
  leaders: number; // ascending main shoots from the base
  trunkRadius: number;
  cup: number; // 0..1 how much each fan's tip lifts above horizontal (shell-like cupping)
  /** Stacked foliage shelves ('Nana Gracilis'): number of layers at full size… */
  layers?: number;
  /** …and how strongly each juts out at its base and tucks in above (0..1). */
  layering?: number;
}

export function dwarfConiferProfile(p: Pick<DwarfConiferParams, "taper" | "flatTop">, h: number): number {
  const x = Math.max(0, Math.min(1, h));
  // Dome: a superellipse — higher exponent → flatter top and straighter sides.
  const q = 2 + 6 * p.flatTop;
  const dome = Math.pow(Math.max(0, 1 - Math.pow(x, q)), 1 / 2);
  const cone = Math.pow(1 - x, 1.1);
  // Tuck in at the soil line so the lowest fans skirt the ground, not bury in
  // it — briefly, so a pyramid stays broadest near its base.
  const base = 0.7 + 0.3 * smoothstep(x / 0.1);
  return (dome * (1 - p.taper) + cone * p.taper) * base;
}

export function generateDwarfConifer(seed: number, maturity: number, p: DwarfConiferParams): PlantSkeleton {
  const rng = mulberry32(seed);
  const segments: BranchSegment[] = [];
  const leaves: LeafPlacement[] = [];
  const m = Math.max(0, Math.min(1, maturity));
  const sm = smoothstep(m);

  const rMax = Math.max(0.05, p.aspect * 0.5);

  // Shelves: the envelope widens at the bottom of each layer and tucks in
  // toward the next, so the plant reads as stacked tiers with shaded undersides.
  // Layer boundaries are jittered per plant so the stacking is irregular.
  const nLayers = Math.max(1, Math.round((p.layers ?? 1) * (0.55 + 0.45 * smoothstep(maturity))));
  const layerEdges: number[] = [];
  for (let i = 0; i <= nLayers; i++) {
    const t = i / nLayers;
    layerEdges.push(i === 0 || i === nLayers ? t : t + (rng() - 0.5) * (0.5 / nLayers));
  }
  // 0 at a layer's jutting base → 1 tucked in just below the next layer.
  const layerPos = (h: number): number => {
    for (let i = 0; i < nLayers; i++) {
      if (h < layerEdges[i + 1]) return (h - layerEdges[i]) / Math.max(1e-3, layerEdges[i + 1] - layerEdges[i]);
    }
    return 1;
  };
  const shelf = (h: number): number => 1 - (p.layering ?? 0) * 0.32 * Math.pow(layerPos(h), 1.4);
  const phA = rng() * Math.PI * 2;
  const phB = rng() * Math.PI * 2;
  const lobe = (theta: number, h: number) =>
    1 +
    p.irregularity * (0.16 * Math.sin(3 * theta + phA) + 0.1 * Math.sin(5 * theta + 4 * h + phB)) +
    p.irregularity * 0.08 * Math.sin(7 * Math.PI * h + phA);

  // Leaders: a central stem plus ascending shoots splayed out to the tiers.
  segments.push({ p0: [0, 0, 0], p1: [0, 0.4, 0], r0: p.trunkRadius, r1: p.trunkRadius * 0.55, order: 0 });
  const leaderTips: Vec[] = [[0, 0.4, 0]];
  for (let i = 0; i < p.leaders; i++) {
    const a = (i / p.leaders) * Math.PI * 2 + rng() * 0.7;
    const h = 0.2 + rng() * 0.2; // kept low and inside the foliage
    const reach = rMax * dwarfConiferProfile(p, h) * (0.2 + rng() * 0.15);
    const tip: Vec = [Math.cos(a) * reach, h, Math.sin(a) * reach];
    segments.push({
      p0: [0, 0.03 + rng() * 0.05, 0],
      p1: tip,
      r0: p.trunkRadius * 0.7,
      r1: p.trunkRadius * 0.3,
      order: 1,
    });
    leaderTips.push(tip);
  }

  // Fan size relative to the plant: big on a young plant, finer as it fills in.
  const fanScale = 1.3 - 0.5 * sm;
  const tiers = Math.max(3, Math.round(p.tiers * (0.45 + 0.55 * sm)));
  const fill = 0.35 + 0.65 * sm;
  // Rings per tier: outer shell plus inner layers (show depth through the gaps).
  const rings = [
    { frac: 0.97, share: 1.0 },
    { frac: 0.72, share: 0.55 },
    { frac: 0.45, share: 0.3 },
  ];

  for (let j = 0; j < tiers && leaves.length < MAX_LEAVES; j++) {
    const h = 0.05 + 0.9 * ((j + 0.5) / tiers) + (rng() - 0.5) * (0.5 / tiers);
    const prof = dwarfConiferProfile(p, h);
    const sh = shelf(h);
    const R = rMax * prof * sh;
    if (R < 0.01) continue;
    const tierPhase = rng() * Math.PI * 2;

    // Branchlets from the axis out toward this tier's ring (mostly hidden).
    // (none in the upper crown, where the envelope is too thin to hide wood)
    const nb = h > 0.7 ? 0 : Math.max(2, Math.round(3 + 3 * prof));
    for (let b = 0; b < nb && segments.length < MAX_SEGMENTS; b++) {
      const a = tierPhase + (b / nb) * Math.PI * 2;
      const from = leaderTips[Math.floor(rng() * leaderTips.length)];
      const y0 = Math.min(from[1], h);
      segments.push({
        p0: [from[0] * (y0 / Math.max(1e-3, from[1])), y0 - 0.04, from[2] * (y0 / Math.max(1e-3, from[1]))],
        p1: [Math.cos(a) * R * 0.45, h, Math.sin(a) * R * 0.45],
        r0: p.trunkRadius * 0.28,
        r1: p.trunkRadius * 0.1,
        order: 2,
      });
    }

    for (const ring of rings) {
      const count = Math.max(
        ring.frac > 0.9 ? 3 : 1,
        Math.round(p.fansPerTier * ring.share * fill * (R / rMax) * (0.9 + rng() * 0.2))
      );
      const outer = ring.frac > 0.9;
      // The outer shell grows as sprays: each branchlet ends in a rosette of
      // 3–5 fans splayed like a hand of cards. Clumping is what makes a real
      // Hinoki read as tufts with dark pockets between them, rather than an
      // evenly-shingled surface. Inner layers are single shaded fans.
      const sprays = outer ? Math.max(3, Math.round(count / 4)) : count;
      for (let f = 0; f < sprays && leaves.length < MAX_LEAVES; f++) {
        const theta = tierPhase + (f / sprays) * Math.PI * 2 + (rng() - 0.5) * (Math.PI / sprays);
        // Sprays stand proud of the envelope by varying amounts: a bumpy,
        // tufted outline. The proudest catch the most light.
        const bump = outer ? 0.88 + rng() * 0.24 : 1;
        const r = R * ring.frac * lobe(theta, h) * bump * (outer ? 1 : 0.92 + rng() * 0.12);
        const y = h + (rng() - 0.5) * (0.35 / tiers);
        const radial: Vec = [Math.cos(theta), 0, Math.sin(theta)];
        const tangent: Vec = [-radial[2], 0, radial[0]];
        // Rosette: fans splay through the surface tangent plane around a spray
        // axis that is itself tilted (sprayRoll) so neighbouring tufts differ.
        const k = outer ? 3 + Math.floor(rng() * 3) : 1;
        const sprayRoll = (rng() - 0.5) * 1.1;
        const splay = 0.35 + 0.45 * p.cup + (rng() - 0.5) * 0.25; // outward vs upward
        // Exposure: outer, proud, and high sprays are sunlit new growth; the
        // inner layers sit in shade.
        // A shelf's jutting rim is sunlit; the tucked-in band beneath the next
        // layer sits in its shadow.
        const shelfLight = (p.layering ?? 0) * 0.35 * (1 - layerPos(h));
        const exposureBase = outer
          ? 0.3 + 1.1 * (bump - 0.88) + 0.25 * h + shelfLight
          : 0.08 + 0.3 * ring.frac + 0.1 * h;
        const seat = 0.78;
        const sc0 = fanScale * (0.75 + rng() * 0.4) * (0.7 + 0.3 * ring.frac);
        for (let j = 0; j < k && leaves.length < MAX_LEAVES; j++) {
          const a = k === 1 ? (rng() - 0.5) * 0.9 : sprayRoll + (j / (k - 1) - 0.5) * 1.25 + (rng() - 0.5) * 0.2;
          const ca = Math.cos(a);
          const sa = Math.sin(a);
          const dir = norm([
            radial[0] * splay + tangent[0] * sa,
            ca,
            radial[2] * splay + tangent[2] * sa,
          ]);
          const face = norm([radial[0], 0.35 + (rng() - 0.5) * 0.3, radial[2]]);
          // Center of the rosette carries the biggest, brightest fan.
          const central = k === 1 ? 1 : 1 - Math.abs(j / (k - 1) - 0.5);
          const off = k === 1 ? 0 : (j / (k - 1) - 0.5) * 0.02;
          leaves.push({
            pos: [
              radial[0] * r * seat + tangent[0] * off,
              Math.max(0.02, y - 0.5 / tiers),
              radial[2] * r * seat + tangent[2] * off,
            ],
            dir,
            face,
            roll: rng() * Math.PI * 2,
            scale: sc0 * (0.82 + 0.3 * central),
            order: 3,
            exposure: Math.max(0, Math.min(1, exposureBase + 0.12 * central)),
          });
        }
      }
    }
  }

  // Crown: fans standing up across the top so it isn't a hole. A cone needs a
  // few at the tip; a dome or flat-topped bun needs its whole crown covered.
  const apexH = 0.97;
  const apexR = rMax * Math.max(dwarfConiferProfile(p, 0.9), 0.15);
  const apexFans = Math.round((3 + 3 * sm) + p.fansPerTier * 0.5 * (1 - p.taper) * fill);
  for (let i = 0; i < apexFans && leaves.length < MAX_LEAVES; i++) {
    // Fibonacci disc: even coverage of the crown.
    const a = i * GOLDEN_ANGLE + rng() * 0.3;
    const rr = apexR * 0.85 * Math.sqrt((i + 0.5) / apexFans);
    const radial: Vec = [Math.cos(a), 0, Math.sin(a)];
    leaves.push({
      pos: [radial[0] * rr, apexH - 0.08 - 0.1 * (rr / Math.max(1e-3, apexR)) * p.taper, radial[2] * rr],
      dir: norm([radial[0] * 0.5, 1, radial[2] * 0.5]),
      face: norm([radial[0], 0.6, radial[2]]),
      roll: rng() * Math.PI * 2,
      scale: fanScale * 0.8,
      order: 3,
      exposure: 0.85 + rng() * 0.15, // crown: full sun
    });
  }

  // Solid dark core well inside the fans: dense Hinoki foliage never shows sky
  // (or soil) through the middle.
  const cy = 0.4;
  const core: CanopyCore = {
    rx: rMax * dwarfConiferProfile(p, cy) * 0.5,
    ry: 0.33,
    cy,
    taper: p.taper,
  };

  return { segments, leaves, height: 1, spread: rMax, maxOrder: 3, core };
}
