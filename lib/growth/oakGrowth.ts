// Scientific allometric growth model for oaks (Quercus), starting with
// Coast Live Oak (Quercus agrifolia).
//
// The coefficients below are the PUBLISHED equations from the USDA Forest
// Service Urban Tree Database:
//
//   McPherson, E.G., van Doorn, N.S., Peper, P.J. 2016. Urban Tree Database
//   and Allometric Equations. Gen. Tech. Rep. PSW-GTR-253. (Dataset
//   RDS-2016-0005, table TS6_Growth_coefficients.) USDA Forest Service.
//   https://research.fs.usda.gov/treesearch/52933
//
// Q. agrifolia is fitted in three California regions; we use NoCalC (Northern
// California Coast) — the most coastal, open-grown fit (n=66, ages 0–103). The
// model chains four equations:
//
//   age (yr)  --lin-->  DBH (cm)            (trunk diameter at breast height)
//   DBH (cm)  --cub-->  tree height (m)
//   DBH (cm)  --quad--> crown diameter (m)
//   DBH (cm)  --cub-->  live-crown height (m)
//
// Heights/crowns derive from DBH, which is exactly how urban-forestry growth is
// modeled. Equations take cm / years and return metres; we convert to ft / in
// at the boundary. DBH grows ~linearly over the fitted range while the height
// and crown polynomials decelerate (negative higher-order terms), so a mature
// tree keeps thickening and spreading while height plateaus — the real oak
// habit.

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

export interface OakAllometry {
  region: string;
  source: string;
  dbhFromAge: Poly; // age (yr) -> DBH (cm)
  heightFromDbh: Poly; // DBH (cm) -> tree height (m)
  crownDiaFromDbh: Poly; // DBH (cm) -> crown diameter (m)
  crownHtFromDbh: Poly; // DBH (cm) -> live-crown height (m)
  /**
   * Clear-trunk (first major fork) height as a fraction of tree height.
   * Not published for Q. agrifolia; estimated from its low-forking decurrent
   * habit (open trees fork within ~0.1–0.25 of their height).
   */
  clearRatio: number;
}

// Coast Live Oak — Northern California Coast fit (primary, open-grown coastal).
export const COAST_LIVE_OAK: OakAllometry = {
  region: "NoCalC (Northern California Coast)",
  source: "USDA Urban Tree Database — McPherson, van Doorn & Peper 2016, GTR-PSW-253 (RDS-2016-0005)",
  dbhFromAge: { a: 1.55732, b: 1.48691 },
  heightFromDbh: { a: 2.00172, b: 0.32851, c: -0.00331, d: 0.00001 },
  crownDiaFromDbh: { a: 0.35867, b: 0.27404, c: -0.00079 },
  crownHtFromDbh: { a: 0.10736, b: 0.28514, c: -0.00312, d: 0.00001 },
  clearRatio: 0.18,
};

// Inland Empire fit — drier/inland variant, kept for future use / cross-check.
export const COAST_LIVE_OAK_INLAND: OakAllometry = {
  region: "InlEmp (Inland Empire)",
  source: "USDA Urban Tree Database — McPherson, van Doorn & Peper 2016, GTR-PSW-253 (RDS-2016-0005)",
  dbhFromAge: { a: 3.18134, b: 1.27341, c: -0.00314 },
  heightFromDbh: { a: 2.92172, b: 0.22352, c: -0.00096 },
  crownDiaFromDbh: { a: 2.15346, b: 0.2119, c: -0.00097 },
  crownHtFromDbh: { a: 0.10736, b: 0.28514, c: -0.00312, d: 0.00001 },
  clearRatio: 0.18,
};

export interface OakDimensions {
  dbh: number; // in
  height: number; // ft
  crownWidth: number; // ft
  crownHeight: number; // ft — vertical extent of the live crown
  clearTrunk: number; // ft — height to the first major fork
}

// DBH (cm) at a given age (years since establishment). The homepage timeline
// treats year-since-install as age, matching the UTD age basis.
export function oakDbhCm(a: OakAllometry, age: number): number {
  return Math.max(0, poly(a.dbhFromAge, Math.max(0, age)));
}

// Whole-tree dimensions at a given age. `scale` shrinks/grows the whole tree
// proportionally (smaller nursery stock or design variation).
export function oakDimensions(a: OakAllometry, age: number, scale = 1): OakDimensions {
  const dbhCm = oakDbhCm(a, age);
  const heightM = Math.max(0.3, poly(a.heightFromDbh, dbhCm));
  const crownDiaM = Math.max(0.2, poly(a.crownDiaFromDbh, dbhCm));
  const crownHtM = Math.max(0.2, poly(a.crownHtFromDbh, dbhCm));
  return {
    dbh: dbhCm * IN_PER_CM * scale,
    height: heightM * FT_PER_M * scale,
    crownWidth: crownDiaM * FT_PER_M * scale,
    crownHeight: crownHtM * FT_PER_M * scale,
    clearTrunk: heightM * FT_PER_M * a.clearRatio * scale,
  };
}
