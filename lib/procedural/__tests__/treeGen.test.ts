import { describe, it, expect } from "vitest";
import {
  generateTree,
  generateShrubShell,
  generateBoxwood,
  generateDecurrentTree,
  generateExcurrentTree,
  phyllotaxisLayout,
  laiFactor,
  leafCountForLAI,
  type PlantSkeleton,
  type TreeParams,
  type DecurrentParams,
  type ExcurrentParams,
  type BoxwoodParams,
} from "../treeGen";

const GOLDEN_ANGLE = 2.399963229728653; // ~137.5°

// Smallest absolute angular separation between two azimuths.
function angDiff(a: number, b: number): number {
  let d = Math.abs(a - b) % (2 * Math.PI);
  if (d > Math.PI) d = 2 * Math.PI - d;
  return d;
}

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

describe("generateBoxwood", () => {
  const MOUND: BoxwoodParams = {
    width: 1.2,
    clip: 0.44,
    leafCount: 1600,
    lobes: 6,
    lobeDepth: 0.11,
    taper: 0,
    trunkRadius: 0.05,
  };

  it("builds a dense, finite, grounded mound normalized to unit height", () => {
    const s = generateBoxwood(2024, 1, MOUND);
    expect(s.height).toBeCloseTo(1, 6);
    expect(s.leaves.length).toBeGreaterThan(600);
    expect(allFinite(s)).toBe(true);
    // interior woody stubs are present
    expect(s.segments.length).toBeGreaterThan(3);
    // flat, grounded base: no foliage below the ground plane
    expect(s.leaves.every((l) => l.pos[1] >= 0)).toBe(true);
  });

  it("fills in with maturity (slower fill when young)", () => {
    const young = generateBoxwood(7, 0.2, MOUND);
    const mature = generateBoxwood(7, 1, MOUND);
    expect(mature.leaves.length).toBeGreaterThan(young.leaves.length);
  });

  it("taper pinches the crown narrower at the top than the base", () => {
    const cone = generateBoxwood(9, 1, { ...MOUND, width: 0.8, taper: 0.5 });
    const horiz = (l: { pos: [number, number, number] }) => Math.hypot(l.pos[0], l.pos[2]);
    const heights = cone.leaves.map((l) => l.pos[1]);
    const top = Math.max(...heights);
    const bottom = Math.min(...heights);
    const band = (lo: number, hi: number) =>
      cone.leaves.filter((l) => l.pos[1] >= lo && l.pos[1] < hi);
    const lowBand = band(bottom, bottom + (top - bottom) * 0.25);
    const highBand = band(bottom + (top - bottom) * 0.75, top + 1e-6);
    const maxLow = Math.max(...lowBand.map(horiz));
    const maxHigh = Math.max(...highBand.map(horiz));
    expect(maxHigh).toBeLessThan(maxLow);
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

describe("phyllotaxisLayout (botanical leaf arrangement)", () => {
  it("spiral diverges by the golden angle and fills the shoot in order", () => {
    const n = 8;
    const nodes = phyllotaxisLayout({ pattern: "spiral" }, n);
    expect(nodes.length).toBe(n);
    for (let i = 1; i < nodes.length; i++) {
      expect(nodes[i].azimuth - nodes[i - 1].azimuth).toBeCloseTo(GOLDEN_ANGLE, 6);
      expect(nodes[i].along).toBeGreaterThan(nodes[i - 1].along);
    }
    expect(nodes[0].along).toBeGreaterThan(0);
    expect(nodes[n - 1].along).toBeLessThan(1);
  });

  it("opposite places decussate pairs 180° apart, successive pairs at 90°", () => {
    const nodes = phyllotaxisLayout({ pattern: "opposite" }, 4);
    expect(nodes.length).toBe(4);
    expect(angDiff(nodes[0].azimuth, nodes[1].azimuth)).toBeCloseTo(Math.PI, 6);
    expect(nodes[0].along).toBeCloseTo(nodes[1].along, 6); // a pair shares a node
    expect(angDiff(nodes[0].azimuth, nodes[2].azimuth)).toBeCloseTo(Math.PI / 2, 6);
    expect(nodes[2].along).toBeGreaterThan(nodes[0].along);
  });

  it("whorl puts k evenly-spaced leaves per node", () => {
    const nodes = phyllotaxisLayout({ pattern: "whorl", perNode: 3 }, 6);
    expect(nodes.length).toBe(6);
    expect(nodes[0].along).toBeCloseTo(nodes[2].along, 6); // first three share a node
    expect(angDiff(nodes[0].azimuth, nodes[1].azimuth)).toBeCloseTo((2 * Math.PI) / 3, 6);
  });

  it("distichous alternates two ranks 180° apart in one plane", () => {
    const nodes = phyllotaxisLayout({ pattern: "distichous" }, 5);
    expect(nodes.length).toBe(5);
    expect(angDiff(nodes[0].azimuth, nodes[1].azimuth)).toBeCloseTo(Math.PI, 6);
    expect(angDiff(nodes[0].azimuth, nodes[2].azimuth)).toBeCloseTo(0, 6);
  });

  it("fascicle bundles every leaf at essentially one node", () => {
    const nodes = phyllotaxisLayout({ pattern: "fascicle" }, 3);
    expect(nodes.length).toBe(3);
    expect(Math.max(...nodes.map((nd) => nd.along))).toBeLessThan(0.1);
  });

  it("returns nothing for non-positive counts", () => {
    expect(phyllotaxisLayout({ pattern: "spiral" }, 0).length).toBe(0);
  });
});

describe("LAI canopy density", () => {
  it("laiFactor is monotonic, centered on the reference, and bounded", () => {
    expect(laiFactor(1.5)).toBeLessThan(laiFactor(6.5));
    expect(laiFactor(3.5)).toBeCloseTo(1, 6);
    expect(laiFactor(100)).toBeLessThanOrEqual(1.9);
    expect(laiFactor(0)).toBeGreaterThanOrEqual(0.45);
  });

  it("denser canopies (higher LAI) yield more leaves, within clamps", () => {
    expect(leafCountForLAI(5, 6.5)).toBeGreaterThan(leafCountForLAI(5, 1.5));
    expect(leafCountForLAI(4, 1.5)).toBeGreaterThanOrEqual(2);
    expect(leafCountForLAI(12, 8)).toBeLessThanOrEqual(14);
  });
});

describe("leaf orientation data", () => {
  it("attaches a finite light-facing normal to every emitted leaf", () => {
    for (const s of [
      generateDecurrentTree(123, 1, OAK),
      generateExcurrentTree(5, 1, REDWOOD),
      generateTree(42, 1, MAPLE),
    ]) {
      expect(s.leaves.length).toBeGreaterThan(0);
      expect(
        s.leaves.every(
          (l) => l.face !== undefined && l.face.every((c) => Number.isFinite(c))
        )
      ).toBe(true);
    }
  });
});
