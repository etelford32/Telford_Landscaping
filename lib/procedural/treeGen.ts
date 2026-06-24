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
  dir: Vec; // axis the blade extends along (stem -> tip)
  roll: number; // rotation about dir
  scale: number; // relative size multiplier (renderer applies absolute leaf size)
  order?: number; // branch order the leaf sits on
}

export interface PlantSkeleton {
  segments: BranchSegment[];
  leaves: LeafPlacement[];
  height: number; // normalized height of the generated skeleton
  spread: number; // normalized horizontal radius
  maxOrder?: number; // deepest branch order present (for growth reveal)
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
}

export interface ShellParams {
  height: number; // normalized
  width: number; // normalized
  trunkRadius: number;
  leafCount: number; // leaves at full maturity
  clip: number; // 0..1 fraction of lower sphere removed (flat bottom)
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

// A leaf splaying outward/up from a twig at `at`, facing `branchDir` with jitter.
// `up` biases the blade upward (>0) or lets it lie flat / droop (<=0); `spread`
// controls the lateral fan.
function makeLeaf(
  at: Vec,
  branchDir: Vec,
  rng: () => number,
  up = 0.35,
  spread = 1.4
): LeafPlacement {
  const out: Vec = norm([
    branchDir[0] + (rng() - 0.5) * spread,
    branchDir[1] + up + (rng() - 0.5) * 0.6,
    branchDir[2] + (rng() - 0.5) * spread,
  ]);
  return { pos: at, dir: out, roll: rng() * Math.PI * 2, scale: 0.7 + rng() * 0.6 };
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

      // Leaves scattered along higher-order branches.
      if (depth >= p.leafStartDepth && leaves.length < MAX_LEAVES) {
        const n = Math.round(leafDensity * (depth - p.leafStartDepth + 1));
        for (let k = 0; k < n && leaves.length < MAX_LEAVES; k++) {
          leaves.push(makeLeaf(pos, d, rng));
        }
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
      // Terminal twig — a cluster of leaves.
      for (let k = 0; k < p.leavesPerTwig && leaves.length < MAX_LEAVES; k++) {
        leaves.push(makeLeaf(pos, d, rng));
      }
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
    leaves.push({ pos: [px, py, pz], dir, roll: rng() * Math.PI * 2, scale: 0.7 + rng() * 0.6 });
  }

  return { segments, leaves, height: Math.max(p.height, 1e-3), spread: Math.max(rx, 1e-3) };
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

    // Foliage clusters ride the branch tips (every order), tagged by order so
    // the renderer can keep leaves on the current growth front.
    if (depth >= p.leafStartDepth && leaves.length < MAX_LEAVES) {
      for (let k = 0; k < p.leavesPerTwig && leaves.length < MAX_LEAVES; k++) {
        leaves.push({ ...makeLeaf(pos, d, rng), order: depth });
      }
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
    // flat foliage sprays along the lateral
    for (let k = 0; k < p.leavesPerTwig && leaves.length < MAX_LEAVES; k++) {
      leaves.push({ ...makeLeaf(pos, d, rng, -0.05, 0.6), order: depth });
    }
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
    const lenFactor = Math.pow(1 - crownPos * 0.85, 1.1);
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
