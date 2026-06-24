import { describe, it, expect } from "vitest";
import {
  COAST_LIVE_OAK,
  COAST_REDWOOD,
  VALLEY_OAK,
  BLUE_OAK,
  MANZANITA,
  treeDbhCm,
  treeDimensions,
} from "../treeAllometry";

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
      const d = treeDimensions(COAST_LIVE_OAK, e.age);
      expect(Math.abs(d.dbh - e.dbh)).toBeLessThan(0.3);
      expect(Math.abs(d.height - e.height)).toBeLessThan(0.8);
      expect(Math.abs(d.crownWidth - e.crown)).toBeLessThan(0.8);
    }
  });

  it("DBH grows monotonically (near-linear with age)", () => {
    let prev = -1;
    for (let age = 0; age <= 60; age++) {
      const d = treeDbhCm(COAST_LIVE_OAK, age) * IN_PER_CM;
      expect(d).toBeGreaterThan(prev);
      prev = d;
    }
  });

  it("height decelerates while DBH keeps climbing", () => {
    const h1 = treeDimensions(COAST_LIVE_OAK, 1).height;
    const h10 = treeDimensions(COAST_LIVE_OAK, 10).height;
    const h20 = treeDimensions(COAST_LIVE_OAK, 20).height;
    expect(h20 - h10).toBeLessThan(h10 - h1);
  });

  it("develops a crown as wide as (or wider than) tall by year 30", () => {
    const d = treeDimensions(COAST_LIVE_OAK, 30);
    expect(d.crownWidth / d.height).toBeGreaterThan(0.95);
  });

  it("keeps a low clear-trunk fraction (decurrent habit)", () => {
    const d = treeDimensions(COAST_LIVE_OAK, 30);
    expect(d.clearTrunk / d.height).toBeCloseTo(COAST_LIVE_OAK.clearRatio, 5);
  });

  it("scales the whole tree proportionally", () => {
    const full = treeDimensions(COAST_LIVE_OAK, 30, 1);
    const half = treeDimensions(COAST_LIVE_OAK, 30, 0.5);
    expect(half.height).toBeCloseTo(full.height * 0.5, 5);
    expect(half.crownWidth).toBeCloseTo(full.crownWidth * 0.5, 5);
    expect(half.dbh).toBeCloseTo(full.dbh * 0.5, 5);
  });
});

describe("coast redwood growth (USDA Urban Tree Database, NoCalC)", () => {
  it("reproduces the published 30-year trajectory", () => {
    const expected = [
      { age: 1, dbh: 1.9, height: 13, crown: 9 },
      { age: 10, dbh: 9.0, height: 37, crown: 16 },
      { age: 30, dbh: 24.7, height: 79, crown: 29 },
    ];
    for (const e of expected) {
      const d = treeDimensions(COAST_REDWOOD, e.age);
      expect(Math.abs(d.dbh - e.dbh)).toBeLessThan(0.4);
      expect(Math.abs(d.height - e.height)).toBeLessThan(1.2);
      expect(Math.abs(d.crownWidth - e.crown)).toBeLessThan(1.0);
    }
  });

  it("is tall and narrow — H:W well above the oak's ~1:1", () => {
    const d = treeDimensions(COAST_REDWOOD, 30);
    expect(d.height / d.crownWidth).toBeGreaterThan(2.3);
  });

  it("grows fast — clears 70 ft within 30 years", () => {
    expect(treeDimensions(COAST_REDWOOD, 30).height).toBeGreaterThan(70);
    // DBH near-linear ~2 cm/yr
    expect(treeDbhCm(COAST_REDWOOD, 30) - treeDbhCm(COAST_REDWOOD, 0)).toBeGreaterThan(50);
  });
});

describe("valley oak growth (UTD SacVal; loglog height eqn)", () => {
  it("reproduces the published 30-year trajectory", () => {
    const expected = [
      { age: 1, dbh: 1.5, height: 9.6, crown: 7.4 },
      { age: 10, dbh: 7.1, height: 30, crown: 20 },
      { age: 30, dbh: 17.1, height: 48, crown: 40 },
    ];
    for (const e of expected) {
      const d = treeDimensions(VALLEY_OAK, e.age);
      expect(Math.abs(d.dbh - e.dbh)).toBeLessThan(0.6);
      expect(Math.abs(d.height - e.height)).toBeLessThan(2.0);
      expect(Math.abs(d.crownWidth - e.crown)).toBeLessThan(2.0);
    }
  });

  it("grows fast for an oak and ends broad", () => {
    expect(treeDimensions(VALLEY_OAK, 30).height).toBeGreaterThan(40);
    const d = treeDimensions(VALLEY_OAK, 30);
    expect(d.crownWidth / d.height).toBeGreaterThan(0.7); // broad crown
  });
});

describe("blue oak growth (fitted, slow)", () => {
  it("follows the slow field trajectory", () => {
    const d1 = treeDimensions(BLUE_OAK, 1);
    const d30 = treeDimensions(BLUE_OAK, 30);
    expect(d1.height).toBeGreaterThan(7);
    expect(d1.height).toBeLessThan(11);
    expect(d30.dbh).toBeGreaterThan(6.5);
    expect(d30.dbh).toBeLessThan(9.5);
    expect(d30.height).toBeGreaterThan(27);
    expect(d30.height).toBeLessThan(36);
  });

  it("is slower and smaller than valley oak at 30 years", () => {
    expect(treeDimensions(BLUE_OAK, 30).height).toBeLessThan(treeDimensions(VALLEY_OAK, 30).height);
    expect(treeDbhCm(BLUE_OAK, 30)).toBeLessThan(treeDbhCm(VALLEY_OAK, 30));
  });
});

describe("manzanita growth (fitted shrub)", () => {
  it("mounds to ~6 ft tall x ~8 ft wide, wider than tall", () => {
    const d30 = treeDimensions(MANZANITA, 30);
    expect(d30.height).toBeGreaterThan(5.5);
    expect(d30.height).toBeLessThan(8);
    expect(d30.crownWidth).toBeGreaterThan(d30.height); // wider than tall
    expect(d30.crownWidth).toBeGreaterThan(7);
  });

  it("starts small and fills in by year 10", () => {
    expect(treeDimensions(MANZANITA, 1).height).toBeLessThan(2.5);
    expect(treeDimensions(MANZANITA, 10).height).toBeGreaterThan(3.5);
  });
});
