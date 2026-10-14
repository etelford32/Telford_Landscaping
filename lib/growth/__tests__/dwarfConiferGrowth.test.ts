import { describe, it, expect } from "vitest";
import {
  CONIFER_GROWTH_MODELS,
  HINOKI_GOLDEN_SPRITE,
  HINOKI_NANA,
  HINOKI_NANA_GRACILIS,
  acsClassFromRate,
  coniferDimensions,
  growthSeries,
  meanEarlyRateInches,
  rateAt,
  sizeAt,
  solveRate,
} from "../dwarfConiferGrowth";
import { calculatePlantSize, getPlantSpecies } from "../../plantData";
import { PLANT_CATALOG, formatHeight, getHeightAtYear } from "../../plantCatalog";

const models = Object.entries(CONIFER_GROWTH_MODELS);

describe("ACS size classes", () => {
  it("bins annual growth at the ACS thresholds (1, 6, 12 in/yr)", () => {
    expect(acsClassFromRate(0.5)).toBe("miniature");
    expect(acsClassFromRate(1)).toBe("dwarf");
    expect(acsClassFromRate(5.9)).toBe("dwarf");
    expect(acsClassFromRate(6)).toBe("intermediate");
    expect(acsClassFromRate(12)).toBe("large");
  });
});

describe("anchored Chapman-Richards curves", () => {
  it.each(models)("%s passes through all three anchors", (_id, m) => {
    for (const dim of [m.height, m.width]) {
      expect(sizeAt(dim, 0)).toBeCloseTo(dim.planted, 6);
      expect(sizeAt(dim, 10)).toBeCloseTo(dim.at10, 6);
      expect(sizeAt(dim, 5000)).toBeCloseTo(dim.ultimate, 3); // asymptote (the slowest buns take centuries)
    }
  });

  it.each(models)("%s: derived early growth rate lands in its published ACS class", (_id, m) => {
    expect(acsClassFromRate(meanEarlyRateInches(m))).toBe(m.acsClass);
  });

  it.each(models)("%s grows monotonically and decelerates (never shrinks)", (_id, m) => {
    for (const dim of [m.height, m.width]) {
      let prev = -Infinity;
      for (let t = 0; t <= 100; t++) {
        const s = sizeAt(dim, t);
        expect(s).toBeGreaterThanOrEqual(prev);
        expect(s).toBeLessThanOrEqual(dim.ultimate);
        prev = s;
      }
      expect(rateAt(dim, 30)).toBeLessThan(rateAt(dim, 0));
    }
  });

  it("rejects anchors that can't define a growth curve", () => {
    expect(() => solveRate({ planted: 1, at10: 5, ultimate: 4 })).toThrow();
    expect(() => solveRate({ planted: 2, at10: 1, ultimate: 4 })).toThrow();
  });
});

describe("Hinoki cultivars reproduce the published sizes", () => {
  it("'Nana Gracilis': ACS 3–6 in/yr, ~4 ft at 10 yr, still a shrub (<10 ft) at 30", () => {
    const r = meanEarlyRateInches(HINOKI_NANA_GRACILIS);
    expect(r).toBeGreaterThanOrEqual(3);
    expect(r).toBeLessThanOrEqual(6);
    const d10 = coniferDimensions(HINOKI_NANA_GRACILIS, 10);
    expect(d10.height).toBeGreaterThanOrEqual(3);
    expect(d10.height).toBeLessThanOrEqual(5);
    expect(d10.width / d10.height).toBeGreaterThan(0.45);
    expect(d10.width / d10.height).toBeLessThan(0.75); // pyramidal: ~twice as tall as wide
    const d30 = coniferDimensions(HINOKI_NANA_GRACILIS, 30);
    expect(d30.height).toBeGreaterThan(6);
    expect(d30.height).toBeLessThan(10);
  });

  it("'Nana': ~½ in/yr, 6–8 in tall after 10 years, still under ~1.5 ft at 30", () => {
    expect(meanEarlyRateInches(HINOKI_NANA)).toBeLessThan(0.75);
    const h10 = sizeAt(HINOKI_NANA.height, 10) * 12;
    expect(h10).toBeGreaterThanOrEqual(6);
    expect(h10).toBeLessThanOrEqual(8);
    expect(sizeAt(HINOKI_NANA.height, 30)).toBeLessThan(1.5);
  });

  it("'Golden Sprite': 4–6 in tall and wide at 10 years", () => {
    const d = coniferDimensions(HINOKI_GOLDEN_SPRITE, 10);
    for (const v of [d.height, d.width]) {
      expect(v * 12).toBeGreaterThanOrEqual(4);
      expect(v * 12).toBeLessThanOrEqual(6);
    }
  });
});

describe("one model feeds the design tool and the catalogue", () => {
  it("design-tool growth arrays are the curve sampled per year", () => {
    for (const [id, m] of models) {
      expect(getPlantSpecies(id)).toBeDefined();
      expect(calculatePlantSize(id, 10).height).toBeCloseTo(sizeAt(m.height, 10), 2);
      expect(calculatePlantSize(id, 10).width).toBeCloseTo(sizeAt(m.width, 10), 2);
      expect(growthSeries(m.height)).toHaveLength(30);
    }
  });

  it("catalogue entries with a growth model report the curve's height", () => {
    const hinokis = PLANT_CATALOG.filter((p) => p.growthModel);
    expect(hinokis.length).toBeGreaterThanOrEqual(6);
    for (const p of hinokis) {
      expect(getHeightAtYear(p, 10)).toBeCloseTo(p.growthModel!.height.at10, 1);
    }
  });

  it("formats miniature sizes in inches", () => {
    expect(formatHeight(0.5)).toBe("6 in");
    expect(formatHeight(4)).toBe("4.0 ft");
    expect(formatHeight(25.4)).toBe("25 ft");
  });
});
