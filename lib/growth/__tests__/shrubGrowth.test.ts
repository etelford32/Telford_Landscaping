import { describe, it, expect } from "vitest";
import { growthCurve, shrubGrowthArrays } from "../shrubGrowth";

describe("growthCurve (monomolecular shrub growth)", () => {
  it("starts at the planted size and monotonically increases", () => {
    const c = growthCurve({ start: 0.6, mature: 3, ratePerYear: 0.2 });
    expect(c[0]).toBeCloseTo(0.6, 3);
    for (let i = 1; i < c.length; i++) {
      expect(c[i]).toBeGreaterThan(c[i - 1]);
    }
  });

  it("approaches but never exceeds the mature asymptote", () => {
    const mature = 4;
    const c = growthCurve({ start: 0.7, mature, ratePerYear: 0.25 }, 60);
    expect(Math.max(...c)).toBeLessThan(mature);
    expect(c[c.length - 1]).toBeGreaterThan(mature * 0.9); // well on its way
  });

  it("leaves the ground at roughly the specified annual rate", () => {
    const rate = 0.3;
    const c = growthCurve({ start: 0.5, mature: 5, ratePerYear: rate });
    const firstYearIncrement = c[1] - c[0];
    // ~rate for small k; within 10%
    expect(firstYearIncrement).toBeGreaterThan(rate * 0.9);
    expect(firstYearIncrement).toBeLessThanOrEqual(rate);
  });

  it("decelerates — later increments are smaller than earlier ones", () => {
    const c = growthCurve({ start: 0.5, mature: 5, ratePerYear: 0.3 });
    const early = c[2] - c[1];
    const late = c[25] - c[24];
    expect(late).toBeLessThan(early);
  });

  it("encodes distinct patterns: a true dwarf stays tiny where a vigorous cultivar surges", () => {
    const dwarf = growthCurve({ start: 0.3, mature: 1.3, ratePerYear: 0.06 }); // Morris Midget-like
    const vigorous = growthCurve({ start: 0.8, mature: 11, ratePerYear: 0.26 }); // American-like
    expect(dwarf[29]).toBeLessThan(1.5); // still ~14 in after 30 yrs
    expect(vigorous[29]).toBeGreaterThan(5); // several feet
  });

  it("shrubGrowthArrays returns 30-entry height and width arrays", () => {
    const { baseHeightGrowth, baseWidthGrowth } = shrubGrowthArrays({
      height: { start: 0.6, mature: 4, ratePerYear: 0.2 },
      width: { start: 0.65, mature: 4.5, ratePerYear: 0.22 },
    });
    expect(baseHeightGrowth).toHaveLength(30);
    expect(baseWidthGrowth).toHaveLength(30);
    expect(baseWidthGrowth[29]).toBeGreaterThan(baseHeightGrowth[29]); // wider than tall
  });
});
