# 3D Design Sim — Performance Fix Plan

_Status: proposed · Scope: the `/design` 3D landscape simulator (`IntegratedDesignCanvas` + React Three Fiber components + `lib/ecs`)_

## Why it's slow (top-line diagnosis)

The sim is slow for one structural reason above all: **it never stops rendering, and every frame it re-runs far more work than it needs to.**

- The `<Canvas>` runs in React Three Fiber's default `frameloop="always"` mode (`components/design/IntegratedDesignCanvas.tsx:1344`), so a completely static scene still redraws 60×/second — including a full 2048×2048 shadow pass.
- Several components call React `setState` **inside** the per-frame `useFrame` loop, which drags the entire ~1,500-line React tree through reconciliation 60×/second.
- None of the plant/structure models are memoized, so that per-frame reconciliation re-executes every model's render body for every placed object.
- Each of those frames is unusually expensive because structures explode into hundreds of un-instanced, un-shared, never-disposed meshes.

Everything else (draw-call bloat, terrain rebuilds, undo serialization) is a multiplier on top of a loop that should be idle but isn't.

## How this plan was produced

Read-only review of the live render path: the canvas + render loop, the four ECS render systems, the geometry/model builders, and the terrain/asset layer. Findings are cited by `file:line`. No code was changed in producing this plan.

## Legend

- **Effort** — **S** ≈ 1–2h / localized · **M** ≈ half-day / one subsystem + testing · **L** ≈ 1–3 days / cross-cutting refactor
- **Impact** — ⚡ idle cost · 🎯 interaction smoothness · 🖼️ per-frame GPU cost

---

## Phase 1 — Stop the bleed (idle & re-render storm) ✅ Implemented

_Goal: make an untouched scene cost ~0. These four are interdependent; ship them together._

> **Status:** Implemented on branch `claude/eloquent-brahmagupta-dr6l3e`. All four items landed: `setState` removed from `useFrame` (grid hover is now event-driven; terrain updates are version-driven), `frameloop="demand"` with `invalidate()` wired into camera transitions and terrain edits, `React.memo` + field comparators on `PlantModel`/`StructureModel`/`HouseModel`, and the shadow map reduced 2048→1024. Typecheck clean.

| # | Fix | Files | Effort | Impact |
|---|-----|-------|--------|--------|
| 1 | Pull `setState` out of `useFrame` — mutate refs / object transforms directly for grid hover and terrain poll | `GridClickEditor.tsx:41-63`, `EditableTerrain.tsx:63-85` | **M** | ⚡🎯 HIGH |
| 2 | Switch `<Canvas>` to `frameloop="demand"`, call `invalidate()` on real changes | `IntegratedDesignCanvas.tsx:1344` | **S–M** | ⚡ HIGH |
| 3 | `React.memo` on `PlantModel` / `StructureModel` / `HouseModel`; stop the inline object spread per plant; `useCallback` the drag setters | `PlantModels.tsx:30`, `StructureModels.tsx:14`, `HouseModel.tsx:16`, `IntegratedDesignCanvas.tsx:309,483-495` | **S** | 🎯🖼️ HIGH |
| 4 | Drop shadow map 2048→1024 and/or set `shadow.autoUpdate=false` + flag on change | `IntegratedDesignCanvas.tsx:172-184` | **S** | 🖼️ MED-HIGH |

**Dependency:** #1 must land with or before #2 — in demand mode, `setState`-in-`useFrame` creates a render→setState→render feedback loop that never idles. #3 only fully pays off once props are stable (the `useCallback` + no-spread part).

**Expected result:** idle CPU/GPU drops from "pegged at 60fps" to near-zero; placement and hover stop re-rendering the whole tree. This phase alone removes most of the perceived slowness.

---

## Phase 2 — Interaction smoothness ✅ Implemented

_Targets the specific actions that stutter: dragging, terrain brushing, cursor tracking._

> **Status:** Implemented on branch `claude/eloquent-brahmagupta-dr6l3e`. (5) `useUndoRedo` no longer double-`JSON.stringify`s on every change; drags use a transient update that collapses a whole gesture into one undo step (committed on drag end). (6) `TerrainManager` now tracks a dirty region; `EditableTerrain` rewrites only the touched vertices and computes analytic heightfield normals over the dirty region + 1-ring instead of a full `computeVertexNormals()`. (7) `CanvasInteractionHandler` attaches its mousemove listener via `useEffect` with cleanup (fixing a leak/stale-closure), throttled to ~30Hz with reused vectors, and the dead `useFrame` is gone. Note: `terrainUpdateCounter` is kept — it now drives both the terrain `version` and the sidebar stats, so it isn't dead. Typecheck clean.

| # | Fix | Files | Effort | Impact |
|---|-----|-------|--------|--------|
| 5 | Undo/redo: remove the double `JSON.stringify` equality check; snapshot history on drag **end**, not per frame | `useUndoRedo.ts:28`, drag handlers `IntegratedDesignCanvas.tsx:628-639` | **M** | 🎯 HIGH (scales with object count) |
| 6 | Terrain: update only the bounded dirty window `applyBrush` already computes; partial/deferred normal recompute; remove the unread `terrainUpdateCounter` re-render | `EditableTerrain.tsx:53-85`, `TerrainManager.ts:135-138,336` | **M** | 🎯 HIGH |
| 7 | Mousemove: throttle, reuse vectors, move listener into `useEffect` w/ cleanup, avoid top-level `setState` | `CanvasInteractionHandler.tsx:40-75` | **M** | 🎯 MED (also fixes a listener leak) |

**Expected result:** drags stay smooth as the design fills up; a brush stroke goes from O(all 4,225 vertices) + full normal recompute to O(touched vertices).

---

## Phase 3 — Draw-call / GPU diet ✅ Implemented

_Makes each frame cheap. Biggest raw GPU win, but the most work. With Phase 1 done, this is what keeps large designs at 60fps._

> **Status:** Implemented on branch `claude/eloquent-brahmagupta-dr6l3e` across three commits. (8) `StructureModels` renders all high-count repeated geometry (deck planks, fence slats, wall boulders/timbers/brick-faces/course-lines/dry-stack, pergola rafters, path stepping-stones/joints/gravel) through one `InstancedParts` helper — a single draw call + shared material per part instead of one per element. (9) Every render-body `Math.random()` (structures + `Landscaping` flower beds) is now a per-object seeded PRNG (`lib/utils/seededRandom`), so layouts are stable and `React.memo` holds. (10) Plant canopies are instanced over a shared module-level unit icosahedron geometry, and `LandscapeScene` quantizes autoplay age to integer years so memoized plants don't re-render ~60×/s. (11) `ProceduralPlant` and `EditableTerrain` dispose their `useMemo`-created geometry/materials on unmount/rebuild. Per-commit detail: 3a structures+random, 3b plants+age, 3c disposal. Typecheck clean. Not yet verified in a browser — structures/plants should be smoke-tested visually.

| # | Fix | Files | Effort | Impact |
|---|-----|-------|--------|--------|
| 8 | `StructureModels`: hoist shared materials to module scope; convert repeated `.map()` geometry (fence slats, brick faces, deck planks, boulders, pavers) to `InstancedMesh` / drei `<Instances>` | `StructureModels.tsx` (whole file) | **L** | 🖼️ HIGH (collapses hundreds of draw calls) |
| 9 | Replace render-body `Math.random()` with a seeded PRNG so reconciliation works | `StructureModels.tsx:345-363,430-446,906-927,1154-1164`; `Landscaping.tsx:124-155` | **M** | 🖼️ MED-HIGH (prereq for memo to help structures) |
| 10 | `PlantModels`: share geo/material per species; quantize `age` to stop autoplay thrash | `PlantModels.tsx`, `LandscapeScene.tsx:167-202` | **M** | 🖼️ MED |
| 11 | Dispose manually-created THREE objects on unmount (procedural plant geo/materials, terrain geometry) | `ProceduralPlant.tsx:215-242`, `EditableTerrain.tsx` | **M** | 🖼️ MED (prevents long-session degradation / context loss) |

**Dependency:** #9 should land with or before #8, and both are prerequisites for #3's memo to actually help structures (random layout defeats reconciliation).

**Expected result:** a brick wall drops from 300–600 draw calls to a handful; placing dozens of structures stops climbing into the thousands of draws.

---

## Phase 4 — ECS rework & adoption (decision: fix it properly)

_The `lib/ecs/` system (~5k lines, four render systems) is currently **dead code** — nothing outside `lib/ecs/**` imports it. The decision is to rework it into a genuinely performant system rather than delete it. This is the largest track in the plan and does **not** speed up the app until it is both fixed **and** adopted as the live render path (4d)._

> **Status:** 4a–4c implemented on branch `claude/eloquent-brahmagupta-dr6l3e`. The ECS is now performant in isolation but remains **dead code** — **4d (adoption) is the open go/no-go** and has not been started. Typecheck clean throughout; not exercised at runtime (no consumer yet).
>
> _As built, a few items landed slightly differently than the bullets below:_ the redundant `PlantRenderSystem` was **kept and documented as non-canonical** (not deleted) because `PlantDataBridge` constructs it; `EnhancedRenderSystem` got a distinct `name` to fix a registration collision. Care-tracking is **throttled to ~1Hz** rather than hard-skipped when paused. Asset disposal is implemented as **ref-counted `acquire`/`release`** on `AssetManager` (correct, callable plumbing); wiring it into entity removal is part of 4d.

### 4a — Core hot-path fixes (**M–L**) ✅ Implemented
- Replace `cloneComponent`'s `JSON.parse(JSON.stringify(...))` deep-clone on every get/set with a struct copy or no-clone access. `lib/ecs/core/Component.ts:44-46`, `lib/ecs/core/World.ts:90-110`
- Remove the per-frame `forceUpdate()` React loop; drive consumer re-renders from a dirty-flag/subscription model so components only re-render on actual change. `lib/ecs/hooks.tsx:187-219`
- Cache queries with invalidation-on-change instead of full-world scans every frame across ~5 systems. `lib/ecs/core/World.ts:155-165`

### 4b — System consolidation (**M**) ✅ Implemented
- Register exactly **one** plant render system (the instanced one); remove/merge the overlap between `RenderSystem`, `EnhancedRenderSystem`, `PlantRenderSystem`, `InstancedPlantRenderSystem` (two systems currently claim the same entities and would render every plant twice). `lib/ecs/systems/*`
- Reuse scratch `Matrix4`/`Vector3`/`Quaternion`/`Color` objects instead of allocating ~6-8 per instance per frame; gate matrix writes behind a real dirty flag. `lib/ecs/systems/InstancedPlantRenderSystem.ts:268-321`
- Replace the per-frame `JSON.stringify` dirty check with field comparison. `lib/ecs/systems/MaterialSystem.ts:110`
- Throttle `GrowthSystem` care-tracking to ~1Hz and skip when growth is paused (the default). `lib/ecs/systems/GrowthSystem.ts:148-163`
- Fix the async-in-sync-`update` race and per-frame `applyTexture`. `lib/ecs/systems/EnhancedRenderSystem.ts:90-187`
- Switch entity IDs to deterministic generation (currently `Date.now()` + `Math.random()`). `lib/ecs/core/Entity.ts:26`

### 4c — Asset layer (**S–M**) ✅ Implemented
- Stop inflating models ~3× — `toNonIndexed()` is mislabeled "dedup" and does the opposite; keep indexed geometry, and don't recompute normals/bounds that GLTFs already ship. `lib/ecs/assets/ModelLoader.ts:181-184`
- Add a `Map<path, Texture>` cache so identical textures aren't re-decoded/re-uploaded. `lib/ecs/assets/TextureLoader.ts`
- Auto-dispose geometry/material/texture when an entity/placement is removed (plumbing exists; nothing calls it). `lib/ecs/assets/AssetManager.ts:267-299`

### 4d — Integration (**L**, go/no-go after 4a–4c)
- Wire the ECS into the canvas as the single source of truth for rendering, bridging React design state → ECS entities, and remove the plain R3F `plants.map()` path so the two systems don't both render.
- Update/realign `DESIGN_APP_INTEGRATION_GUIDE.md` and `INTEGRATION_SUMMARY.md` to the reworked design.

> **Caveat:** until 4d lands, 4a–4c improve dead code only. Treat 4d as an architectural decision to make **after** Phases 1–3 prove out the cheaper wins on the live path.

---

## Recommended sequencing

1. **PR 1 = Phase 1 (items 1–4).** ~1 day, S/M effort, the biggest perceived win. Ship and measure before going further.
2. **PR 2 = Phase 2 (5–7).** Interaction polish.
3. **PR 3 = Phase 3 (8–11).** Budget for the `StructureModels` refactor — the only **L** here.
4. **Phase 4 as its own track.** Largest effort; sequence 4a → 4b → 4c, then a go/no-go on 4d. Keep it decoupled from the Phase 1–3 quick wins.

**If you only do three things:** #1, #2, #3 — they address the root cause (a static scene rendering at 60fps and dragging the React tree with it) and are all S/M effort.

## How to measure

- Add `r3f-perf` or drei `<Stats>` in dev to watch **draw calls** and **FPS**.
- Use the Chrome Performance profiler to confirm idle frames drop to ~0 after Phase 1.
- Capture a baseline **before** any change: idle FPS, draw-call count with ~30 objects placed, and drag frame time. Re-measure after each phase against that baseline.

## Findings index (by file)

- `IntegratedDesignCanvas.tsx` — `frameloop="always"`, 2048² shadows + 3 lights, un-memoized model maps, inline plant prop spread, `terrainUpdateCounter` whole-tree re-render
- `GridClickEditor.tsx` — `setState` in `useFrame` (hover); optional grid-points visualizer builds thousands of spheres
- `EditableTerrain.tsx` — per-frame polling `useFrame`; full vertex rewrite + full `computeVertexNormals()` per change
- `CanvasInteractionHandler.tsx` — per-mousemove raycast + top-level `setState`; listener attached in render body without cleanup
- `useUndoRedo.ts` — double `JSON.stringify` of full design state on every `setState`
- `StructureModels.tsx` — inline per-mesh geometry+materials in `.map()` loops, no sharing/instancing/disposal; `Math.random()` in render bodies
- `PlantModels.tsx` — per-clump materials rebuilt each render; not shared across plants
- `ProceduralPlant.tsx` — the well-built exception (instanced + memoized) but per-instance materials never disposed; `frustumCulled={false}`
- `LandscapeScene.tsx` — autoplay `setAge` rAF loop re-renders all sample plants ~60fps for ~9s
- `lib/ecs/**` — dead code; JSON deep-clone per get/set, per-frame `forceUpdate`, uncached queries, duplicate render systems, model inflation, no texture cache
