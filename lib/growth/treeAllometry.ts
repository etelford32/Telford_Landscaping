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
  const c = e.c ?? 0;
  const d = e.d ?? 0;
  // A downward-opening quadratic (c < 0, no cubic term) models a dimension that
  // decelerates to a plateau — height/crown that level off as the plant matures.
  // Past the parabola's vertex the curve turns back *down*, which would make a
  // mature plant shrink. That's unphysical, so clamp x to the vertex: the
  // dimension holds at its maximum instead of declining. (Fitted shrubs rely on
  // this; the trees' vertices sit beyond their sampled age range, so it's a
  // no-op for them.)
  let xc = x;
  if (d === 0 && c < 0) {
    const vertex = -e.b / (2 * c);
    if (xc > vertex) xc = vertex;
  }
  return e.a + e.b * xc + c * xc * xc + d * xc * xc * xc;
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

// Manzanita (Arctostaphylos densiflora 'Howard McMinn') — NOT in the UTD (a
// shrub). Coefficients FITTED to horticultural sizes: moderate ~1-2 ft/yr to a
// dense mound ~6.5 ft tall x 8.5 ft wide (wider than tall), multi-stemmed and
// crooked. "DBH" here is the main-stem diameter that drives trunk thickness.
//   Sources: Calscape, Xera, OSU Landscape Plants, San Marcos Growers.
export const MANZANITA: TreeAllometry = {
  commonName: "Manzanita ('Howard McMinn')",
  region: "fitted (horticultural sizes — no UTD entry)",
  source: "Fitted to Calscape / Xera / OSU landscape sizes",
  dbhFromAge: { a: 1.5, b: 0.25 },
  heightFromDbh: { a: -0.52, b: 0.628, c: -0.0389 },
  crownDiaFromDbh: { a: -1.046, b: 0.97, c: -0.0628 },
  crownHtFromDbh: { a: -0.3, b: 0.5, c: -0.03 },
  clearRatio: 0.05, // multi-stem from a low base
};

// Western Redbud (Cercis occidentalis) — NOT in the UTD; the Eastern Redbud
// fallback equation extrapolates nonsensically past its range, so these are
// FITTED to the published field trajectory: moderate growth to a multi-stem
// small tree ~18 ft tall x ~16 ft wide (≈ as wide as tall) by year 30.
//   Sources: Calscape, OSU Landscape Plants, UC ANR.
export const WESTERN_REDBUD: TreeAllometry = {
  commonName: "Western Redbud",
  region: "fitted (field trajectory — no UTD entry)",
  source: "Fitted to Calscape / OSU / UC ANR field sizes",
  dbhFromAge: { a: 1.18, b: 0.467 },
  heightFromDbh: { a: -0.146, b: 0.781, c: -0.027 },
  crownDiaFromDbh: { a: -0.281, b: 0.6655, c: -0.0208 },
  crownHtFromDbh: { a: -0.2, b: 0.5, c: -0.02 },
  clearRatio: 0.06, // multi-stem from the base
};

// Monterey Pine (Pinus radiata) — NOT in the UTD (a coastal/park species, not a
// sampled street tree). Coefficients FITTED to field data: very fast (~3-6 ft/yr
// young) to ~65 ft tall x ~32 ft crown by year 30 (H:W ~2:1), excurrent. Lower
// branches self-prune, so the crown rides the upper ~2/3 over a bare trunk.
//   Sources: SelecTree, Calscape, USFS Silvics.
export const MONTEREY_PINE: TreeAllometry = {
  commonName: "Monterey Pine",
  region: "fitted (field trajectory — no UTD entry)",
  source: "Fitted to SelecTree / Calscape / USFS field sizes",
  dbhFromAge: { a: 0.8, b: 1.78 },
  heightFromDbh: { a: 0.507, b: 0.5206, c: -0.003036 },
  crownDiaFromDbh: { a: 0.317, b: 0.2326, c: -0.00108 },
  crownHtFromDbh: { a: 0.3, b: 0.35, c: -0.002 },
  clearRatio: 0.3, // self-prunes a bare lower trunk
};

// ── California-native shrubs (the hero-scene understory) ───────────────────────
// None are in the UTD (all shrubs). Coefficients are FITTED to published
// horticultural sizes; "DBH" is the main-stem caliper that drives trunk
// thickness. The height/crown quadratics decelerate to a plateau (see the
// vertex clamp in evalEqn) so each shrub fills in and then holds its mature
// size rather than shrinking. All are multi-stemmed from a low base.

// Blueblossom Ceanothus (Ceanothus thyrsiflorus) — one of the largest, fastest
// California lilacs: an arching evergreen to ~20 ft tall x ~18 ft wide, smothered
// in blue bloom each spring.
//   Sources: Calscape, Las Pilitas, SF Botanical.
export const CEANOTHUS: TreeAllometry = {
  commonName: "Blueblossom Ceanothus",
  region: "fitted (horticultural sizes — no UTD entry)",
  source: "Fitted to Calscape / Las Pilitas sizes",
  dbhFromAge: { a: 1.138, b: 0.362 },
  heightFromDbh: { a: -1.4756, b: 1.7417, c: -0.09892 },
  crownDiaFromDbh: { a: -1.3221, b: 1.5177, c: -0.08555 },
  crownHtFromDbh: { a: -1.21, b: 1.428, c: -0.0811 },
  clearRatio: 0.06,
};

// Toyon (Heteromeles arbutifolia) — "California holly" / Christmas berry: a dense
// upright evergreen large shrub / small tree to ~16 ft tall x ~12 ft wide, glossy
// holly-like leaves with red winter berries.
//   Sources: Calscape, SelecTree, Las Pilitas.
export const TOYON: TreeAllometry = {
  commonName: "Toyon",
  region: "fitted (horticultural sizes — no UTD entry)",
  source: "Fitted to Calscape / SelecTree sizes",
  dbhFromAge: { a: 0.74, b: 0.4593 },
  heightFromDbh: { a: -0.5158, b: 0.8528, c: -0.0346 },
  crownDiaFromDbh: { a: -0.2999, b: 0.6655, c: -0.02851 },
  crownHtFromDbh: { a: -0.423, b: 0.699, c: -0.0284 },
  clearRatio: 0.06,
};

// Bush Anemone (Carpenteria californica) — a rounded evergreen shrub to ~8 ft,
// rare in the wild, prized for large white anemone-like flowers with gold stamens.
//   Sources: Calscape, UC ANR, San Marcos Growers.
export const BUSH_ANEMONE: TreeAllometry = {
  commonName: "Bush Anemone",
  region: "fitted (horticultural sizes — no UTD entry)",
  source: "Fitted to Calscape / San Marcos Growers sizes",
  dbhFromAge: { a: 0.79, b: 0.2069 },
  heightFromDbh: { a: -0.7557, b: 1.2433, c: -0.11867 },
  crownDiaFromDbh: { a: -0.6353, b: 1.1088, c: -0.10503 },
  crownHtFromDbh: { a: -0.62, b: 1.0195, c: -0.0973 },
  clearRatio: 0.06,
};

// Coffeeberry (Frangula / Rhamnus californica 'Eve Case') — a compact, very dense
// evergreen mound to ~8 ft x ~8 ft, glossy dark foliage and red-to-black berries.
//   Sources: Calscape, San Marcos Growers, OSU Landscape Plants.
export const COFFEEBERRY: TreeAllometry = {
  commonName: "Coffeeberry ('Eve Case')",
  region: "fitted (horticultural sizes — no UTD entry)",
  source: "Fitted to Calscape / San Marcos Growers sizes",
  dbhFromAge: { a: 0.79, b: 0.2069 },
  heightFromDbh: { a: -0.7269, b: 1.1389, c: -0.10435 },
  crownDiaFromDbh: { a: -0.7269, b: 1.1389, c: -0.10435 },
  crownHtFromDbh: { a: -0.596, b: 0.9339, c: -0.0856 },
  clearRatio: 0.06,
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
