import { describe, it, expect } from "vitest";
import { COAST_LIVE_OAK, oakDbhCm, oakDimensions } from "../oakGrowth";

const IN_PER_CM = 0.393701;

describe("coast live oak growth (USDA Urban Tree Database, NoCalC)", () => {
  it("reproduces the published 30-year trajectory", () => {
    // Reference values computed from the GTR-PSW-253 equations (NoCalC).
    const expected = [
      { age: 1, dbh: 1.2, height: 9.7, crown: 3.9 },
      { age: 10, dbh: 6.5, height: 21.5, crown: 15.2 },
      { age: 20, dbh: 12.3, height: 30.7, crown: 26.8 },
      { age: 30, dbh: 18.2, height: 36.4, crown: 37.2 },
    ];
    for (const e of expected) {
      const d = oakDimensions(COAST_LIVE_OAK, e.age);
      expect(Math.abs(d.dbh - e.dbh)).toBeLessThan(0.3);
      expect(Math.abs(d.height - e.height)).toBeLessThan(0.8);
      expect(Math.abs(d.crownWidth - e.crown)).toBeLessThan(0.8);
    }
  });

  it("DBH grows monotonically (near-linear with age)", () => {
    let prev = -1;
    for (let age = 0; age <= 60; age++) {
      const d = oakDbhCm(COAST_LIVE_OAK, age) * IN_PER_CM;
      expect(d).toBeGreaterThan(prev);
      prev = d;
    }
  });

  it("height decelerates while DBH keeps climbing", () => {
    const h1 = oakDimensions(COAST_LIVE_OAK, 1).height;
    const h10 = oakDimensions(COAST_LIVE_OAK, 10).height;
    const h20 = oakDimensions(COAST_LIVE_OAK, 20).height;
    expect(h20 - h10).toBeLessThan(h10 - h1);
  });

  it("develops a crown as wide as (or wider than) tall by year 30", () => {
    const d = oakDimensions(COAST_LIVE_OAK, 30);
    expect(d.crownWidth / d.height).toBeGreaterThan(0.95);
  });

  it("keeps a low clear-trunk fraction (decurrent habit)", () => {
    const d = oakDimensions(COAST_LIVE_OAK, 30);
    expect(d.clearTrunk / d.height).toBeCloseTo(COAST_LIVE_OAK.clearRatio, 5);
  });

  it("scales the whole tree proportionally", () => {
    const full = oakDimensions(COAST_LIVE_OAK, 30, 1);
    const half = oakDimensions(COAST_LIVE_OAK, 30, 0.5);
    expect(half.height).toBeCloseTo(full.height * 0.5, 5);
    expect(half.crownWidth).toBeCloseTo(full.crownWidth * 0.5, 5);
    expect(half.dbh).toBeCloseTo(full.dbh * 0.5, 5);
  });
});
