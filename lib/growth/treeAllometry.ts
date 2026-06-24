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

// A fitted UTD equation. Polynomial by default (lin/quad/cub via a,b,c,d).
// When `loglog` is set it is the UTD `loglogw1` form, where `c` holds the MSE:
//   y = exp(a + b * ln(ln(x + 1) + c/2))
interface Eqn {
  a: number;
  b: number;
  c?: number;
  d?: number;
  loglog?: boolean;
}

function evalEqn(e: Eqn, x: number): number {
  if (e.loglog) {
    return Math.exp(e.a + e.b * Math.log(Math.log(x + 1) + (e.c ?? 0) / 2));
  }
  return e.a + e.b * x + (e.c ?? 0) * x * x + (e.d ?? 0) * x * x * x;
}

export interface TreeAllometry {
  commonName: string;
  region: string;
  source: string;
  dbhFromAge: Eqn; // age (yr) -> DBH (cm)
  heightFromDbh: Eqn; // DBH (cm) -> tree height (m)
  crownDiaFromDbh: Eqn; // DBH (cm) -> crown diameter (m)
  crownHtFromDbh: Eqn; // DBH (cm) -> live-crown height (m)
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

// Valley Oak (Quercus lobata) — SacVal fit (the only CA region it's in). CA's
// largest oak: fast for an oak, broad and open with pendulous outer branches.
// Height and crown-height use the UTD loglogw1 form (c = MSE).
export const VALLEY_OAK: TreeAllometry = {
  commonName: "Valley Oak",
  region: "SacVal (Sacramento Valley)",
  source: UTD_SOURCE,
  dbhFromAge: { a: 2.28211, b: 1.66463, c: -0.01025, d: 0.00002 },
  heightFromDbh: { a: 0.18007, b: 1.86782, c: 0.04209, loglog: true },
  crownDiaFromDbh: { a: 1.09621, b: 0.30138, c: -0.00101 },
  crownHtFromDbh: { a: -0.05648, b: 1.88419, c: 0.05751, loglog: true },
  clearRatio: 0.19,
};

// Blue Oak (Quercus douglasii) — NOT in the Urban Tree Database (a wildland
// species, never sampled as a street tree). These coefficients are FITTED to
// published growth rates: slow, ~0.1 in DBH/yr (≈10 yr per inch), with height
// that ceases once DBH passes ~26 in; small, rounded, gnarled, blue-green.
//   Sources: USFS Silvics (blue oak); UC ANR "Blue Oaks Grow Slowly".
export const BLUE_OAK: TreeAllometry = {
  commonName: "Blue Oak",
  region: "fitted (dendrochronology rates — no UTD entry)",
  source: "Fitted to USFS Silvics & UC ANR published growth rates",
  dbhFromAge: { a: 3.9, b: 0.538 },
  heightFromDbh: { a: 0.239, b: 0.593, c: -0.00695 },
  crownDiaFromDbh: { a: -0.5, b: 0.5 },
  crownHtFromDbh: { a: 0.12, b: 0.423, c: -0.005176 },
  clearRatio: 0.22,
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
  return Math.max(0, evalEqn(a.dbhFromAge, Math.max(0, age)));
}

// Whole-tree dimensions at a given age. `scale` shrinks/grows the whole tree
// proportionally (smaller nursery stock or design variation).
export function treeDimensions(a: TreeAllometry, age: number, scale = 1): TreeDimensions {
  const dbhCm = treeDbhCm(a, age);
  const heightM = Math.max(0.3, evalEqn(a.heightFromDbh, dbhCm));
  const crownDiaM = Math.max(0.2, evalEqn(a.crownDiaFromDbh, dbhCm));
  const crownHtM = Math.max(0.2, Math.min(heightM, evalEqn(a.crownHtFromDbh, dbhCm)));
  return {
    dbh: dbhCm * IN_PER_CM * scale,
    height: heightM * FT_PER_M * scale,
    crownWidth: crownDiaM * FT_PER_M * scale,
    crownHeight: crownHtM * FT_PER_M * scale,
    clearTrunk: heightM * FT_PER_M * a.clearRatio * scale,
  };
}
