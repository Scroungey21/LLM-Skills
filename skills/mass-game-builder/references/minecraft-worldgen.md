# Procedural world generation for a Minecraft pack (countries, cities, districts)

**Only for packs that generate places procedurally (cities, dimensions, large structures); other pack types skip this file.** Read this when the world, a city, a district layer or the collapse is being designed or built. The plan is the product; blocks are its output.
Specific API names change between Minecraft and loader versions: where this file says "hook", the real method is found in spike S2, not assumed.

## Contents
1. Principles
2. The layers
3. Plan and adapter: pure-Java planners
4. Determinism and order independence
5. Streaming and budgets
6. Scale and proportions
7. Streets and connectivity
8. The building program and quotas
9. Collapse and the Repair Score
10. Contents: loot, mobs, vehicles
11. Living with vanilla worldgen
12. Using an existing generator versus custom
13. Test recipes

## 1. Principles
1. **Deterministic from the seed.** A chunk's content depends only on seed and position, never on what was loaded first, who found it, or when.
2. **Streamed.** Nothing is generated all at once. A cheap outline exists ahead of the player; detail is made chunk by chunk as the view reaches it; far detail is dropped.
3. **Designed, not random.** The plan encodes rules (zoning, adjacency, budgets); randomness only chooses among options the rules allow.
4. **Cheap to test.** Planning is plain code with no game dependency, so rules are tested in seconds.
5. **Measured.** Chunk cost and outline cost have budgets (`PERF_BUDGET.md`) and are measured in the first spike, not at the end.

## 2. The layers
| Layer | Question | Output | Cost class | Built by |
|---|---|---|---|---|
| Country plan | Where are cities, towns, villages, rivers or coast, roads? | Graph of nodes and links, terrain regions | Outline (background, once) | Custom planner (pure) |
| City plan | Size, shape, old core or not, edges, gates, crossings | Footprint, core, axes | Outline | Custom planner (pure) |
| District plan | Which zone where, obeying adjacency and access rules | Zone map: district, wealth, density per lot | Outline | Custom planner (pure) |
| Street network | How are zones linked? | Hierarchy (boulevards, streets, lanes) | Outline | Grid generator or an existing generator; custom for irregular fabric |
| Lot program | What goes on each lot, within the district budget | Building typology, variant, rotation per lot | Lot (microseconds, cached) | Custom planner (pure) |
| Building | What does it look like inside and out? | Structure NBT or generator assets | Chunk | Authored data |
| Collapse | How is it ruined? | Damage state, rubble, props | Chunk | Data-driven grammar + seeded pass |
| Contents | Loot, mob anchors, vehicles, props | Containers with loot tables, spawn data | Chunk | Data + seeded pass |
The spawn city's outline resolves first, before the player's first chunk. Other cities resolve lazily from the same plan.

## 3. Plan and adapter: pure-Java planners
- Put every layer down to the lot program in a `planner/` package of plain Java: records in, records out, no `net.minecraft` or `net.neoforged` imports (`check_modpack.py` enforces it). Coordinates are plain ints or longs.
- A thin **adapter** in the game layer asks the planner what a chunk should contain and places blocks. The adapter is small and dull; the rules live in the planner.
- Result: JUnit tests run in seconds without launching Minecraft; planners are thread-safe pure functions, so the outline can run off-thread; order independence is provable.
```java
// planner package: plain Java, no game imports
record Lot(int lotX, int lotZ, DistrictType district, int wealth, int density) {}
interface CityPlan { Lot lot(int lotX, int lotZ); }          // pure function of seed + position
```
Cache results by key; never let a cache change a result.

## 4. Determinism and order independence
- Derive randomness by hashing (world seed, layer salt, x, z) into a `long` and seeding a fresh random from it. One layer, one salt. No shared mutable RNG, no `Math.random`, no wall-clock time, no iteration over unordered collections that affects output (`check_modpack.py` flags the first three).
- A layer may read the **plan** of its neighbours (cheap), never their **blocks** (lookahead).
- Float math drifts with coordinates: use integers or `long` hashing for decisions; floats only for presentation.
- Tests (M-G3): (a) query the plan for the same lots in two random orders, results equal; (b) generate region A then B and B then A in a test world, hash the block data, equal; (c) three seeds give clearly different cities; (d) the planner has no game imports.

## 5. Streaming and budgets
| Layer | When it runs | Rule |
|---|---|---|
| Outline (country, city footprint, zone map, street skeleton) | Background thread, a region ahead of the player; spawn city first | Coarse data only, no blocks; provisionally around 1 s each on the reference CPU, off the main thread (re-measure on the real device) |
| Lot plan | When a district's chunks are within a few chunks of the player | One decision per lot, deterministic, cached |
| Chunk build | Per chunk, as the view reaches it | Main-thread share within the budget (provisionally about 2 ms; re-derived on the reference CPU in the performance spike); heavy work off-thread |
| Unload | When chunks leave the view | Keep only the outline; no retained geometry for far districts |
Hard limits: no gameplay system may require a full district, city or country to be loaded (the horde director, claims and markets use the outline plus loaded chunks only); never generate "the whole district" to decide one lot; infinite feel comes from combining a large authored set with seeded variation, not from heavier chunks. Persist the outline cheaply and version it (`Saved`).

## 6. Scale and proportions
- One chunk is one lot is a good default (16x16 blocks); a district is tens of lots; a large city is a dozen or more districts. Real cities are far larger than playable space, so compress them: keep relationships and proportions (old core, new town, suburbs, rich versus popular housing, river edge), not real distances.
- **Real places inspire, they are not reproduced.** The world is fictional; copy urban structure and architectural logic, not maps, named landmarks or addresses. Label data sources and caveats in the district cards (for example open-map counts are lower bounds because most buildings carry no type tag).
- District budgets are design targets informed by data, calibrated by a spike, and written as lot counts per typology per district card.

## 7. Streets and connectivity
- Hierarchy: primary, secondary, tertiary. Grid districts come from a grid generator or an existing hierarchical road system; irregular old cores (dead-end lanes, courtyards, gates) need their own fabric. Start pragmatic: block-sized parts with internal lanes before a true irregular generator.
- **Connectivity test in plan space (M-G3):** every lot's entrance connects to a street; every district connects to the network; the spawn edge is reachable and survivable; no building blocks the only route.
- The street graph is also the **horde routing graph** and the vehicle drivable-route graph: build it once as plan data both read.

## 8. The building program and quotas
- Each lot gets a typology from the district budget, then a variant, palette, damage state and interior seed from allowed sets.
- **Quotas without lookahead:** to approximate "26 villas, 10 apartment blocks..." in a 64-lot district, rank the district's lots by a seeded hash once (plan data only, O(lots), cached) and hand out the budget in rank order. Counts then match the budget and stay order independent.
- **Variant spacing:** reject choices that repeat (variant, palette, damage) within the style bible's distance, deterministically (re-roll with the next salt).
- Rotation and mirroring follow the street the lot faces.

## 9. Collapse and the Repair Score
- Collapse is a **data-driven grammar** applied by a seeded pass: structural rules (unsupported spans first, upper floors before lower) plus function stories (burnt, looted, flooded). See `minecraft-art-direction.md` section 8 for the look.
- **Repair Score** (sound, sealed, lit, plus function needs) must be cheap: computed on request or for loaded claimed chunks only, incremental with dirty flags, sampled or bounded flood fill rather than full scans, and cached. It never builds anything for the player. Decide early whether a blueprint ghost (intact shape) is shown and what it costs to render.
- Score gaming (sealing with cheap blocks) is an edge case: the score also checks structure, light and function-specific needs.

## 10. Contents: loot, mobs, vehicles
- **Loot lives only in breakable loot blocks and containers with a loot table.** Generation never creates item entities. Pools belong to building functions and are tiered by district wealth. Details and tests: `minecraft-systems.md`.
- Mob anchors (nests in cellars, dense districts) are data on the lot or structure, with counts following the district density and respecting entity budgets.
- Vehicles are lot-level spawn data (parked, garage, car park, jam, dealership by tier) with a seeded condition roll; they become entities only near players.

## 11. Living with vanilla worldgen
- Decide per world type whether the city replaces terrain, adapts to it, or sits on a flattened plate; define behaviour at water, slopes and the country's edge.
- Disable or override vanilla villages, pillager outposts and other mods' structures inside city footprints (structure set overrides, biome tags). Check what other adopted mods add.
- Spawn point selection is part of the plan: a survivable edge, not the maze or a private compound.
- Test seed 0, negative seeds, very large coordinates and ocean-heavy seeds.

## 12. Using an existing generator versus custom
If a world generator already provides roads, damage, parts and buildings (for example The Lost Cities, whose repository is MIT licensed and which has a data-driven asset system), the options are: use its data hooks, extend it through its API, or fork it. Decide in spike S2:
- Read its source first (the Minecraft Dev MCP or plain GitHub reading). Check what it can express per chunk and whether custom city styles replace or merge with defaults.
- Prefer data hooks, then API, then a fork. A fork is a long-term cost: keep changes small and documented, track upstream, keep the determinism tests, and respect the licence.
- Whichever route, the district planner stays pure Java and the generator receives its decisions through one adapter.
- Check that its newest features (hierarchical streets, highway networks) exist on the pinned Minecraft version, not only on newer ones.

## 13. Test recipes
| Test | How | Gate |
|---|---|---|
| Determinism, order independence | JUnit on the planner; world hash A then B vs B then A | M-G3 |
| Zone budgets | Count typologies per district over many seeds, compare to the card within tolerance | M-G3 |
| Variant spacing | Sample a large area, assert the spacing rule | M-G3 |
| Street connectivity | Flood fill in plan space from the spawn edge | M-G3 |
| Zero loose items | Count item entities created during generation of a large area, assert 0; `check_structures.py` on structure files | M-G3 |
| Chunk cost | Fresh-world flight, spark main-thread share per chunk | M-P2 |
| Outline cost | Timer in the planner on the reference CPU | M-P2 |
| Update safety | Previous-release world, new pack, walk new chunks | M-C |
