# Procedural Plant Modeling

How the homepage hero (and the `/app` design tool) grow trees and shrubs that
get *more* detailed over a 30-year simulation, with growth driven by published
science rather than hand-tuned curves.

The system has three layers, each in its own file:

| Layer | File | Responsibility |
|---|---|---|
| **Growth science** | `lib/growth/treeAllometry.ts` | age → real dimensions (height, crown, DBH) |
| **Skeleton generators** | `lib/procedural/treeGen.ts` | seeded L-systems → branches + leaf placements |
| **Renderer** | `components/3d/plants/ProceduralPlant.tsx` | reveal growth, instance the geometry, scale to the science |
| Textures | `lib/procedural/leafTexture.ts` | canvas-drawn leaf/needle cards + bark bump |

A species opts in through `PROCEDURAL_SPECIES` in the renderer; everything else
falls back to the older clustered models in `components/design/PlantModels.tsx`.
This is a deliberate phased rollout — we prove each species before widening.

---

## 1. Growth science — `treeAllometry.ts`

Real arborists don't model "height over time" directly. They model **trunk
diameter (DBH) over age**, then derive everything else from DBH with
**allometric equations**. We use the published coefficients from the **USDA
Forest Service Urban Tree Database**:

> McPherson, van Doorn & Peper 2016, *Urban Tree Database and Allometric
> Equations*, GTR-PSW-253 (dataset RDS-2016-0005, table TS6).

Each species is four fitted polynomials:

```
age (yr)  →  DBH (cm)            (usually near-linear)
DBH (cm)  →  tree height (m)     (decelerating)
DBH (cm)  →  crown diameter (m)
DBH (cm)  →  live-crown height (m)
```

`treeDimensions(species, age, scale)` runs the chain and returns feet/inches.
Because DBH grows ~linearly while the height/crown polynomials have negative
higher-order terms, mature trees keep thickening while height plateaus — the
real habit falls out of the math.

Each species is validated by a test that **reproduces the published 30-year
trajectory** (`lib/growth/__tests__/treeAllometry.test.ts`). If a coefficient is
wrong, that test fails.

Equations are polynomial (`lin`/`quad`/`cub`) by default; some UTD fits use the
`loglogw1` form, supported via an `loglog` flag (the `c` field then holds the
fit's MSE).

Species currently modeled:

- `COAST_LIVE_OAK` — *Quercus agrifolia* (UTD NoCalC). Broad, decurrent;
  crown ≈ as wide as tall by yr 30.
- `VALLEY_OAK` — *Quercus lobata* (UTD SacVal; loglog height eqn). CA's largest
  oak — fast, broad, open, pendulous outer branches.
- `BLUE_OAK` — *Quercus douglasii*. **Not in the UTD** (wildland species);
  coefficients **fitted** to published dendrochronology rates (~10 yr/inch DBH).
  Small, slow, gnarled, blue-green.
- `COAST_REDWOOD` — *Sequoia sempervirens* (UTD NoCalC). Tall and narrow
  (H:W ≈ 2.7), excurrent, *fast* — ~13 ft at yr 1 to ~79 ft / 24.7 in DBH by yr 30.
- `MANZANITA` — *Arctostaphylos densiflora* 'Howard McMinn'. **Fitted** (shrub,
  not in the UTD). A wide multi-stem mound (~6.5 × 8.5 ft) with crooked
  sculptural branches and mahogany-red bark.
- `WESTERN_REDBUD` — *Cercis occidentalis*. **Fitted** to field data (not in the
  UTD; the Eastern Redbud fallback equation extrapolates nonsensically). A
  multi-stem small tree (~18 × 16 ft) rendered in its signature magenta bloom.
- `MONTEREY_PINE` — *Pinus radiata*. **Fitted** (not in the UTD — a park/coastal
  species, not a sampled street tree). Fast excurrent conifer to ~65 ft × 32 ft
  by yr 30; long needle tufts, dark furrowed bark, fuller-topped than the redwood.

> Note: `Sequoia sempervirens` is the **coast redwood**. The "giant sequoia" is
> a different genus, *Sequoiadendron giganteum*.

---

## 2. Skeleton generators — `treeGen.ts`

Pure, dependency-free TypeScript (so they're unit-testable in node). Each returns
a `PlantSkeleton`: `segments` (tapered branch cylinders), `leaves` (card
placements), `height`/`spread` (normalized), and `maxOrder`. Every segment and
leaf is tagged with its **branch order** (0 = trunk) — that tag is what lets the
renderer reveal growth over time.

Four forms, picked to match real architecture:

- **`generateTree`** — single-leader L-system with an upward bias. *(Japanese maple.)*
- **`generateDecurrentTree`** — short stout trunk forks **low** into several
  codominant scaffold limbs that spread and arch into a broad crown. *(Coast live oak.)*
- **`generateExcurrentTree`** — one straight **central leader** with tiers of
  lateral branches that shorten toward the apex → a narrow cone; lower laterals
  droop, the top lifts. *(Coast redwood, most conifers.)*
- **`generateShrubShell`** — dense Fibonacci-sphere leaf shell over a stub.
  *(Boxwood and other sheared evergreens.)*

Common conventions:

- **Radii are stored as fractions of the trunk** (base = 1.0). The renderer
  multiplies by the real, DBH-derived thickness — so trunk girth is allometric,
  not guessed.
- **Positions are normalized to height 1** at the end. The renderer scales to
  the allometric height.
- **Seeded** via `mulberry32` — a given plant always generates the same tree,
  which matters because the growth slider re-renders every frame.

---

## 3. Renderer — `ProceduralPlant.tsx`

### Growth = generate-once + reveal-by-order

For allometric species we generate the **full mature skeleton once** (memoized
on the seed), then per integer year:

1. Compute `rev`, the revealed branch order, from `maturity` (smoothstepped).
2. **Show segments with `order ≤ rev`** — trunk and primary limbs always
   present, finer branches appearing as the tree ages.
3. **Show leaves on the outer ~2 revealed orders** — foliage rides the current
   growth front.

So the *same* trunk thickens and the *same* limbs extend and ramify — real,
legible branch expansion instead of a tree that reshuffles every year. (Non
-allometric species like the maple still regenerate per year.)

### Scaling to the science

```
heightScale = allometric height / 5         // 1 world unit ≈ 5 ft
widthScale  = (allometric crownWidth/2) / skeleton.spread
group scale = [widthScale, heightScale, widthScale]
```

Height scales uniformly; **crown width is driven from the model** because a
generator's natural spread rarely equals the species' true width:height. We tune
each generator (see §5) so the width correction stays near 1.0 — gentle enough
to avoid distortion. Trunk radius is then corrected by `heightScale/widthScale`
so DBH thickness survives the non-uniform scale.

### Instancing

Branches and leaves are each one `InstancedMesh` — one draw call regardless of
count. Matrices/colors are written in a `useLayoutEffect`. Branch color lerps
from twig to trunk bark by radius; leaf color samples a per-species palette.

---

## 4. Textures — `leafTexture.ts`

Leaf cards are **canvas-drawn neutral masks** (no external image assets), so the
renderer can tint each leaf from a palette. `maple` (serrated palmate), `oak`
(holly-like spiny), `boxwood` (ovate), `redwood` (flat needle spray). Plus a
grayscale bark bump map. Cards are alpha-tested and double-sided.

---

## 5. Tuning workflow (probe-driven, not guesswork)

Because the result is WebGL, we don't eyeball parameters blind. Drop a temporary
probe test that generates the skeleton and logs geometry stats:

```ts
const s = generateExcurrentTree(seed, 1, params);
console.log(`spread/height=${s.spread} medianY=${median(ys)} H:W=${...}`);
```

Run it, read the numbers, adjust, repeat. This is how the oak's drooping-below-
ground crown and the redwood's over-broad cone were found and fixed. Targets:

- **Decurrent (oak):** `spread/height ≈ 0.6`, median branch Y ≈ 0.6 (crown sits
  up on the trunk, not sagging).
- **Excurrent (redwood):** `H:W ≈ 2.3–2.7`, leader reaches `y ≈ 1.0`.

Delete the probe before committing.

---

## 6. Adding a new species

1. **Growth model** — add a `TreeAllometry` constant in `treeAllometry.ts` with
   the species' UTD coefficients (or best published curves). Add a test that
   reproduces its known 30-year trajectory.
2. **Generator** — reuse one of the four forms, or add a new one if the
   architecture is genuinely different. Probe-tune its proportions (§5).
3. **Texture** — add a `LeafKind` + a canvas draw function if the foliage differs.
4. **Preset** — add an entry to `PRESETS` in `ProceduralPlant.tsx`
   (`leafKind`, `leafSize`, `leafPalette`, bark colors, `allometry`, `generate`).
5. **Register** — add the `speciesId` to `PROCEDURAL_SPECIES`.
6. Build + test + view in a preview deploy; tune from the real render.

---

## Worked examples

**Coast Live Oak** — decurrent. Low fork, 4 sinuous scaffold limbs, broad
rounded crown; small holly-leaf tufts on the branch tips; DBH-thick gray-brown
trunk. Crown trends to as-wide-as-tall, matching the UTD numbers.

**Coast Redwood** — excurrent. One central leader, 12 tiers of laterals
shortening to the apex, drooping low and lifting at the top; flat needle-spray
foliage; thick reddish-brown trunk. Races to ~80 ft in 30 years while staying
narrow (~3:1) — exactly what the allometry says, and what makes its growth rate
fun to watch on the slider.
