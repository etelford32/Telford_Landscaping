// Scientific allometric growth models for trees, calibrated to published
// equations from the USDA Forest Service Urban Tree Database:
//
//   McPherson, E.G., van Doorn, N.S., Peper, P.J. 2016. Urban Tree Database
//   and Allometric Equations. Gen. Tech. Rep. PSW-GTR-253. (Dataset
//   RDS-2016-0005, table TS6_Growth_coefficients.) USDA Forest Service.
//   https://research.fs.usda.gov/treesearch/52933
//
// Each species chains four fitted equations:
//
//   age (yr)  -->  DBH (cm)            (trunk diameter at breast height)
//   DBH (cm)  -->  tree height (m)
//   DBH (cm)  -->  crown diameter (m)
//   DBH (cm)  -->  live-crown height (m)
//
// Deriving whole-tree dimensions from trunk diameter is exactly how
// urban-forestry growth is modeled. Equations take cm / years and return
// metres (DBH in cm); we convert to ft / in at the boundary. DBH typically
// grows near-linearly while the height/crown polynomials decelerate.

const FT_PER_M = 3.28084;
const IN_PER_CM = 0.393701;

interface Poly {
  a: number;
  b: number;
  c?: number;
  d?: number;
}

function poly(p: Poly, x: number): number {
  return p.a + p.b * x + (p.c ?? 0) * x * x + (p.d ?? 0) * x * x * x;
}

export interface TreeAllometry {
  commonName: string;
  region: string;
  source: string;
  dbhFromAge: Poly; // age (yr) -> DBH (cm)
  heightFromDbh: Poly; // DBH (cm) -> tree height (m)
  crownDiaFromDbh: Poly; // DBH (cm) -> crown diameter (m)
  crownHtFromDbh: Poly; // DBH (cm) -> live-crown height (m)
  /**
   * Clear-trunk (first major fork) height as a fraction of tree height — used
   * by decurrent (low-forking) species. Excurrent species derive their crown
   * base from crownHeight instead and ignore this.
   */
  clearRatio: number;
}

const UTD_SOURCE =
  "USDA Urban Tree Database — McPherson, van Doorn & Peper 2016, GTR-PSW-253 (RDS-2016-0005)";

// Coast Live Oak (Quercus agrifolia) — NoCalC fit. Broad, decurrent.
export const COAST_LIVE_OAK: TreeAllometry = {
  commonName: "Coast Live Oak",
  region: "NoCalC (Northern California Coast)",
  source: UTD_SOURCE,
  dbhFromAge: { a: 1.55732, b: 1.48691 },
  heightFromDbh: { a: 2.00172, b: 0.32851, c: -0.00331, d: 0.00001 },
  crownDiaFromDbh: { a: 0.35867, b: 0.27404, c: -0.00079 },
  crownHtFromDbh: { a: 0.10736, b: 0.28514, c: -0.00312, d: 0.00001 },
  clearRatio: 0.18,
};

// Coast Live Oak — Inland Empire fit (drier variant, cross-check / future use).
export const COAST_LIVE_OAK_INLAND: TreeAllometry = {
  commonName: "Coast Live Oak (inland)",
  region: "InlEmp (Inland Empire)",
  source: UTD_SOURCE,
  dbhFromAge: { a: 3.18134, b: 1.27341, c: -0.00314 },
  heightFromDbh: { a: 2.92172, b: 0.22352, c: -0.00096 },
  crownDiaFromDbh: { a: 2.15346, b: 0.2119, c: -0.00097 },
  crownHtFromDbh: { a: 0.10736, b: 0.28514, c: -0.00312, d: 0.00001 },
  clearRatio: 0.18,
};

// Coast Redwood (Sequoia sempervirens) — NoCalC fit. Tall, narrow, excurrent
// (single central leader). DBH grows ~2 cm/yr (near-linear); the tree races to
// ~80 ft in 30 years while the crown stays narrow (H:W trends toward ~3:1).
// NOTE: this is the COAST redwood, not the giant sequoia (Sequoiadendron
// giganteum), which is a different genus.
export const COAST_REDWOOD: TreeAllometry = {
  commonName: "Coast Redwood",
  region: "NoCalC (Northern California Coast)",
  source: UTD_SOURCE,
  dbhFromAge: { a: 2.79785, b: 1.99742 },
  heightFromDbh: { a: 1.8397, b: 0.44555, c: -0.00144 },
  crownDiaFromDbh: { a: 2.26065, b: 0.12545, c: -0.00033 },
  crownHtFromDbh: { a: 0.86414, b: 0.36728, c: -0.00106 },
  clearRatio: 0.1,
};

export interface TreeDimensions {
  dbh: number; // in
  height: number; // ft
  crownWidth: number; // ft
  crownHeight: number; // ft — vertical extent of the live crown
  clearTrunk: number; // ft — height to the first major fork (decurrent species)
}

// DBH (cm) at a given age (years since establishment). The homepage timeline
// treats year-since-install as age, matching the UTD age basis.
export function treeDbhCm(a: TreeAllometry, age: number): number {
  return Math.max(0, poly(a.dbhFromAge, Math.max(0, age)));
}

// Whole-tree dimensions at a given age. `scale` shrinks/grows the whole tree
// proportionally (smaller nursery stock or design variation).
export function treeDimensions(a: TreeAllometry, age: number, scale = 1): TreeDimensions {
  const dbhCm = treeDbhCm(a, age);
  const heightM = Math.max(0.3, poly(a.heightFromDbh, dbhCm));
  const crownDiaM = Math.max(0.2, poly(a.crownDiaFromDbh, dbhCm));
  const crownHtM = Math.max(0.2, Math.min(heightM, poly(a.crownHtFromDbh, dbhCm)));
  return {
    dbh: dbhCm * IN_PER_CM * scale,
    height: heightM * FT_PER_M * scale,
    crownWidth: crownDiaM * FT_PER_M * scale,
    crownHeight: crownHtM * FT_PER_M * scale,
    clearTrunk: heightM * FT_PER_M * a.clearRatio * scale,
  };
}
