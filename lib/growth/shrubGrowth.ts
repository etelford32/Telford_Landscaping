// Shrub growth-curve model.
//
// Woody shrubs don't grow linearly — they put on their fastest growth when
// young and decelerate as they approach mature size, asymptotically. The
// standard description of this is the *monomolecular* (a.k.a. von Bertalanffy
// for size) growth curve:
//
//     size(t) = mature − (mature − start) · e^(−k·t)
//
// where `t` is years since planting, `start` is the size when planted, and
// `mature` is the asymptotic size. The decay constant `k` is fixed by the
// cultivar's known early growth rate: the first-year increment of the curve is
// (mature − start)·(1 − e^−k) ≈ (mature − start)·k, so setting
//
//     k = ratePerYear / (mature − start)
//
// makes the curve leave the ground at exactly the published annual rate, then
// slow naturally toward `mature`. This lets each cultivar be described by three
// real horticultural numbers per dimension — planted size, mature size, and
// early growth rate — instead of a hand-typed table, so the *growth pattern*
// (a fast plateauing Korean vs. a barely-moving true dwarf) falls out of the
// numbers.

export interface GrowthCurveSpec {
  start: number; // size at planting (feet)
  mature: number; // asymptotic mature size (feet)
  ratePerYear: number; // early annual growth increment (feet/year)
}

/**
 * Sample the monomolecular growth curve at whole-year steps.
 * Returns `years` values; index `t` is the size at year `t` (t = 0 ⇒ `start`).
 */
export function growthCurve(spec: GrowthCurveSpec, years = 30): number[] {
  const span = Math.max(1e-3, spec.mature - spec.start);
  const k = spec.ratePerYear / span;
  return Array.from({ length: years }, (_, t) =>
    Number((spec.mature - span * Math.exp(-k * t)).toFixed(3))
  );
}

export interface ShrubGrowthSpec {
  height: GrowthCurveSpec;
  width: GrowthCurveSpec;
}

/** Build the height/width arrays for a species' growthData from a spec pair. */
export function shrubGrowthArrays(
  spec: ShrubGrowthSpec,
  years = 30
): { baseHeightGrowth: number[]; baseWidthGrowth: number[] } {
  return {
    baseHeightGrowth: growthCurve(spec.height, years),
    baseWidthGrowth: growthCurve(spec.width, years),
  };
}
