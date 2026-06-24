import { describe, it, expect } from "vitest";
import {
  generateTree,
  generateShrubShell,
  generateDecurrentTree,
  generateExcurrentTree,
  type PlantSkeleton,
  type TreeParams,
  type DecurrentParams,
  type ExcurrentParams,
} from "../treeGen";

const REDWOOD: ExcurrentParams = {
  trunkSegments: 14,
  crownBase: 0.18,
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
};

const OAK: DecurrentParams = {
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
  crownWidthRatio: 1.1,
  leafStartDepth: 1,
  leavesPerTwig: 5,
};

const MAPLE: TreeParams = {
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
};

function allFinite(s: PlantSkeleton): boolean {
  for (const seg of s.segments) {
    for (const v of [...seg.p0, ...seg.p1, seg.r0, seg.r1]) {
      if (!Number.isFinite(v)) return false;
    }
  }
  for (const lf of s.leaves) {
    for (const v of [...lf.pos, ...lf.dir, lf.roll, lf.scale]) {
      if (!Number.isFinite(v)) return false;
    }
  }
  return true;
}

describe("generateTree", () => {
  it("produces branches and leaves with finite coordinates", () => {
    const s = generateTree(12345, 1, MAPLE);
    expect(s.segments.length).toBeGreaterThan(10);
    expect(s.leaves.length).toBeGreaterThan(10);
    expect(s.height).toBeGreaterThan(0);
    expect(allFinite(s)).toBe(true);
  });

  it("is deterministic for a given seed + maturity", () => {
    const a = generateTree(777, 0.8, MAPLE);
    const b = generateTree(777, 0.8, MAPLE);
    expect(a.segments.length).toBe(b.segments.length);
    expect(a.leaves.length).toBe(b.leaves.length);
    expect(a.segments[a.segments.length - 1].p1).toEqual(b.segments[b.segments.length - 1].p1);
  });

  it("develops more structure as maturity increases", () => {
    const young = generateTree(42, 0.1, MAPLE);
    const mature = generateTree(42, 1, MAPLE);
    expect(mature.segments.length).toBeGreaterThan(young.segments.length);
    expect(mature.leaves.length).toBeGreaterThan(young.leaves.length);
  });

  it("stays within the safety caps", () => {
    const s = generateTree(9, 1, { ...MAPLE, maxDepth: 9, branchMin: 3, branchMax: 4 });
    expect(s.segments.length).toBeLessThanOrEqual(2600);
    expect(s.leaves.length).toBeLessThanOrEqual(3000);
  });
});

describe("generateShrubShell", () => {
  it("produces a dense, finite leaf shell above the ground", () => {
    const s = generateShrubShell(2024, 1, {
      height: 1,
      width: 1.05,
      trunkRadius: 0.06,
      leafCount: 1100,
      clip: 0.42,
    });
    expect(s.leaves.length).toBeGreaterThan(300);
    expect(allFinite(s)).toBe(true);
    // flat-bottomed: no leaves below the clip line
    expect(s.leaves.every((l) => l.pos[1] >= 0)).toBe(true);
  });

  it("scales leaf count with maturity", () => {
    const params = { height: 1, width: 1, trunkRadius: 0.06, leafCount: 1000, clip: 0.4 };
    const young = generateShrubShell(5, 0.15, params);
    const mature = generateShrubShell(5, 1, params);
    expect(mature.leaves.length).toBeGreaterThan(young.leaves.length);
  });
});

describe("generateDecurrentTree (oak)", () => {
  it("normalizes to unit height, tags branch orders, and keeps radii as fractions", () => {
    const s = generateDecurrentTree(123, 1, OAK);
    expect(s.height).toBeCloseTo(1, 6);
    expect(s.segments.length).toBeGreaterThan(20);
    expect(s.leaves.length).toBeGreaterThan(20);
    // base trunk radius is a fraction (~1.0); the renderer applies DBH thickness
    const baseRadius = Math.max(...s.segments.map((seg) => Math.max(seg.r0, seg.r1)));
    expect(baseRadius).toBeCloseTo(1, 2);
    // full mature structure with trunk and deepest order both present
    expect(s.maxOrder).toBe(OAK.maxDepth);
    expect(s.segments.some((seg) => (seg.order ?? -1) === 0)).toBe(true);
    expect(s.segments.some((seg) => (seg.order ?? -1) === OAK.maxDepth)).toBe(true);
    // foliage rides the branches (every leaf carries a branch-order tag >= 1)
    expect(s.leaves.every((l) => (l.order ?? 0) >= 1)).toBe(true);
  });

  it("forks into multiple scaffolds (spreads wider than a single leader)", () => {
    const narrow = generateDecurrentTree(7, 1, { ...OAK, crownWidthRatio: 0.6 });
    const broad = generateDecurrentTree(7, 1, { ...OAK, crownWidthRatio: 1.6 });
    expect(broad.spread).toBeGreaterThan(narrow.spread);
  });

  it("is deterministic and generates the full structure (reveal happens at render)", () => {
    const a = generateDecurrentTree(99, 0.2, OAK);
    const b = generateDecurrentTree(99, 0.2, OAK);
    expect(a.segments.length).toBe(b.segments.length);
    // the maturity arg is ignored at generation, so young/old calls match
    const young = generateDecurrentTree(99, 0.1, OAK);
    const full = generateDecurrentTree(99, 1, OAK);
    expect(young.segments.length).toBe(full.segments.length);
  });
});

describe("generateExcurrentTree (redwood)", () => {
  it("builds a single-leader narrow cone normalized to unit height", () => {
    const s = generateExcurrentTree(5, 1, REDWOOD);
    expect(s.height).toBeCloseTo(1, 6);
    expect(s.segments.length).toBeGreaterThan(50);
    expect(s.leaves.length).toBeGreaterThan(50);
    // tall and narrow — taller than ~1.5x its crown width
    expect(s.height / (2 * s.spread)).toBeGreaterThan(1.5);
    // the central leader (order 0) runs from the base to near the top
    const leaderTop = s.segments
      .filter((g) => (g.order ?? -1) === 0)
      .reduce((mx, g) => Math.max(mx, g.p1[1]), 0);
    expect(leaderTop).toBeGreaterThan(0.9);
    // trunk base radius is a fraction (~1.0); renderer applies DBH thickness
    const baseRadius = Math.max(...s.segments.map((g) => Math.max(g.r0, g.r1)));
    expect(baseRadius).toBeCloseTo(1, 2);
  });

  it("is deterministic", () => {
    const a = generateExcurrentTree(9, 1, REDWOOD);
    const b = generateExcurrentTree(9, 1, REDWOOD);
    expect(a.segments.length).toBe(b.segments.length);
    expect(a.leaves.length).toBe(b.leaves.length);
  });
});
