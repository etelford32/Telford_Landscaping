// Growth model for dwarf and miniature conifers (Hinoki cypress cultivars and
// kin), where the UTD trunk-diameter allometry in treeAllometry.ts doesn't
// apply: a 6-inch bun of Chamaecyparis obtusa 'Nana' has no meaningful DBH, and
// nobody has fitted urban-forestry equations to it. What *is* measured,
// cultivar by cultivar, is how fast it grows and how big it is after ten years
// in the ground. The American Conifer Society classifies every conifer that way:
//
//   class          annual growth    size at 10 yr
//   miniature      < 1 in/yr        < 1 ft
//   dwarf          1 – 6 in/yr      1 – 5 ft
//   intermediate   6 – 12 in/yr     5 – 10 ft
//   large          ≥ 12 in/yr       ≥ 10 ft
//   (ACS, "Conifer Sizes & Growth Rates", conifersociety.org)
//
// Each dimension (height, width) follows a Chapman-Richards curve, the standard
// forestry growth function:
//
//   S(t) = S0 + (Smax − S0) · (1 − e^(−k·t))^p
//
// With p = 1 (the monomolecular / von Bertalanffy case, used here) the curve
// starts at the planted size S0, grows fastest in the first years at a rate of
// k·(Smax − S0) per year, and decelerates toward the ultimate size Smax. That
// matches how dwarf conifers behave: a steady, near-linear rate for the first
// couple of decades (the ACS notes they "continue to grow at their stated rate")
// that only bends over as the plant approaches its old-age size.
//
// Rather than hand-picking k, each cultivar is *anchored* to three published
// numbers — planted size, ACS 10-year size, and ultimate size — and k is solved
// so the curve passes exactly through the 10-year anchor. The derived early
// growth rate then has to land inside the cultivar's ACS class band, which the
// tests check. If a source number is off, the class test fails.

const IN_PER_FT = 12;

export type AcsSizeClass = "miniature" | "dwarf" | "intermediate" | "large";

/** ACS class from an annual growth rate in inches per year. */
export function acsClassFromRate(inPerYear: number): AcsSizeClass {
  if (inPerYear < 1) return "miniature";
  if (inPerYear < 6) return "dwarf";
  if (inPerYear < 12) return "intermediate";
  return "large";
}

/** One dimension's anchors, all in feet. */
export interface GrowthAnchors {
  planted: number; // size when set out (typical 1–3 gal nursery stock)
  at10: number; // size 10 years after planting (ACS 10-year figure)
  ultimate: number; // old-age size the curve approaches
}

export interface ConiferGrowthModel {
  commonName: string;
  acsClass: AcsSizeClass; // published class — checked against the derived rate
  source: string;
  height: GrowthAnchors;
  width: GrowthAnchors;
}

/**
 * Solve the monomolecular rate constant k so that S(10) equals the 10-year
 * anchor: S0 + (Smax − S0)(1 − e^(−10k)) = S10  ⇒  k = −ln((Smax − S10)/(Smax − S0)) / 10.
 */
export function solveRate(a: GrowthAnchors, years = 10): number {
  const span = a.ultimate - a.planted;
  const remaining = a.ultimate - a.at10;
  if (span <= 0 || remaining <= 0 || remaining >= span) {
    throw new Error(
      `Invalid growth anchors: need planted < at10 < ultimate (got ${a.planted}, ${a.at10}, ${a.ultimate})`
    );
  }
  return -Math.log(remaining / span) / years;
}

/** Size (ft) at `t` years after planting. */
export function sizeAt(a: GrowthAnchors, t: number): number {
  const k = solveRate(a);
  return a.ultimate - (a.ultimate - a.planted) * Math.exp(-k * Math.max(0, t));
}

/** Instantaneous growth rate (ft/yr) at `t`: dS/dt = k (Smax − S0) e^(−kt). */
export function rateAt(a: GrowthAnchors, t: number): number {
  const k = solveRate(a);
  return k * (a.ultimate - a.planted) * Math.exp(-k * Math.max(0, t));
}

/** Mean annual height growth over the first decade, in inches per year — the
 * figure the ACS class is based on. */
export function meanEarlyRateInches(m: ConiferGrowthModel): number {
  return ((m.height.at10 - m.height.planted) / 10) * IN_PER_FT;
}

export function coniferDimensions(
  m: ConiferGrowthModel,
  age: number,
  scale = 1
): { height: number; width: number } {
  return { height: sizeAt(m.height, age) * scale, width: sizeAt(m.width, age) * scale };
}

/** Year-indexed series (index = age in years, 0..years-1) in the shape the
 * design tool's growth arrays use (see calculatePlantSize in lib/plantData.ts). */
export function growthSeries(a: GrowthAnchors, years = 30): number[] {
  return Array.from({ length: years }, (_, t) => Math.round(sizeAt(a, t) * 100) / 100);
}

const ACS = "American Conifer Society Conifer Database (conifersociety.org)";

// ── Chamaecyparis obtusa — Hinoki cypress ──────────────────────────────────────

// The species: a large, slow-to-medium forest tree, 50–75 ft × 10–25 ft in
// landscapes, ~1–2 ft/yr, ~25 ft at 20 years. Rarely planted at full size in
// gardens; here as the reference the dwarfs are measured against.
//   Sources: NC State Extension; Boone County Arboretum (25 ft at 20 yr).
export const HINOKI_CYPRESS: ConiferGrowthModel = {
  commonName: "Hinoki Cypress",
  acsClass: "large",
  source: "NC State Extension; Boone County Arboretum",
  height: { planted: 3, at10: 15, ultimate: 60 },
  width: { planted: 1.5, at10: 6.5, ultimate: 20 },
};

// 'Nana Gracilis' — THE dwarf Hinoki. Broadly pyramidal, irregular, with dark
// glossy green foliage in cupped, shell-shaped fans. ACS: 3–6 in/yr depending
// on understock vigor, 4–5 ft tall after 10 years (NC State: 3–4 ft); slowly
// reaches 10 ft or more over many decades, roughly half as wide as tall.
//   Sources: ACS; NC State Extension; Missouri Botanical Garden.
export const HINOKI_NANA_GRACILIS: ConiferGrowthModel = {
  commonName: "Dwarf Hinoki Cypress ('Nana Gracilis')",
  acsClass: "dwarf",
  source: `${ACS}; NC State Extension`,
  height: { planted: 1.25, at10: 4, ultimate: 11 },
  width: { planted: 0.9, at10: 2.4, ultimate: 6 },
};

// 'Nana Lutea' — golden 'Nana Gracilis' sport: same habit, bright yellow new
// growth on the sunlit fans. ACS: 4–6 in/yr, ~50 × 30 in at 10 years (OSU gives
// a slower 1–5 ft range); ultimately ~8 ft.
//   Sources: ACS; Oregon State University Landscape Plants.
export const HINOKI_NANA_LUTEA: ConiferGrowthModel = {
  commonName: "Golden Dwarf Hinoki ('Nana Lutea')",
  acsClass: "dwarf",
  source: `${ACS}; Oregon State University Landscape Plants`,
  height: { planted: 1, at10: 3.75, ultimate: 8 },
  width: { planted: 0.7, at10: 2.3, ultimate: 4.5 },
};

// 'Nana' — the true miniature Hinoki, a flat-topped bun of tightly stacked
// fans. ACS: ~½ in/yr, 6–8 in tall × 5–6 in wide after 10 years; NC State:
// ~8 in at 10 years, eventually ~3 ft tall × 4 ft wide over many decades.
// (ACS warns many plants sold as 'Nana' are faster clones.)
//   Sources: ACS; NC State Extension.
export const HINOKI_NANA: ConiferGrowthModel = {
  commonName: "Miniature Hinoki ('Nana')",
  acsClass: "miniature",
  source: `${ACS}; NC State Extension`,
  height: { planted: 0.25, at10: 0.6, ultimate: 3 },
  width: { planted: 0.22, at10: 0.48, ultimate: 4 },
};

// 'Nana Pyramidalis' — a miniature cone of stacked cupped fans. ACS: ~0.6–1
// in/yr, under 12 in after 10 years.
//   Source: ACS.
export const HINOKI_NANA_PYRAMIDALIS: ConiferGrowthModel = {
  commonName: "Pyramidal Miniature Hinoki ('Nana Pyramidalis')",
  acsClass: "miniature",
  source: ACS,
  height: { planted: 0.3, at10: 0.95, ultimate: 4 },
  width: { planted: 0.22, at10: 0.55, ultimate: 2.5 },
};

// 'Golden Sprite' — one of the smallest golden Hinokis: a tight gold bun, only
// 4–6 in tall and wide after 10 years, well under 1 in/yr.
//   Source: ACS.
export const HINOKI_GOLDEN_SPRITE: ConiferGrowthModel = {
  commonName: "Golden Sprite Hinoki",
  acsClass: "miniature",
  source: ACS,
  height: { planted: 0.2, at10: 0.42, ultimate: 1.5 },
  width: { planted: 0.2, at10: 0.42, ultimate: 2 },
};

export const CONIFER_GROWTH_MODELS: Record<string, ConiferGrowthModel> = {
  "chamaecyparis-obtusa": HINOKI_CYPRESS,
  "chamaecyparis-obtusa-nana-gracilis": HINOKI_NANA_GRACILIS,
  "chamaecyparis-obtusa-nana-lutea": HINOKI_NANA_LUTEA,
  "chamaecyparis-obtusa-nana": HINOKI_NANA,
  "chamaecyparis-obtusa-nana-pyramidalis": HINOKI_NANA_PYRAMIDALIS,
  "chamaecyparis-obtusa-golden-sprite": HINOKI_GOLDEN_SPRITE,
};
