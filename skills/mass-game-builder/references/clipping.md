# Clipping: stop solids passing through each other

Read this for any game with 3D (or layered 2D) content, and again before calling any level, model, character or camera finished.
Clipping is the defect players notice first and forgive last. The fix is a mix of modelling rules, placement contracts and an automated detector.

## Contents
1. What counts as clipping
2. Modelling rules (fix at the source)
3. Placement contracts
4. Collision: who sees what
5. Moving and repeated parts
6. Characters and animation
7. Camera
8. The detector: design and proof
9. Visual tours
10. Checklist

Status labels used below: **proven** (gated a real project), **designed** (specified, partly built), **planned** (approach only, not yet built).
Every number is a starting value measured on one project or renderer. Measure yours and write it down.

## 1. What counts as clipping
| Kind | Meaning |
|---|---|
| CLIP | two solids interpenetrate where the player can see it (a board through an upright, a pane through a frame) |
| ZFIGHT | two coplanar or near-coplanar faces of different colour flicker, mostly at distance or at a grazing angle |
| LABEL | text or a decal is cut by a solid, flickers on a coplanar face, or hangs off its board |
| ITEM | a placed object is sunk into its holder, floats with nothing under it, or overlaps its neighbour |
| MOVING | a moving part passes through something at any phase of its motion |
| REACH | something the player must use is hidden behind, or blocked by, a neighbour |

Eyes cannot cover 30 slots x 3 seeds x every angle. Automate the search, fix what it finds at the source, then still look: the checker cannot see everything.

## 2. Modelling rules (fix at the source)
Fix the generator script or the placement table. Hiding a defect (a cover strip, a darker colour) only moves it.
- **No two differently coloured faces lie flush.** Offset an overlay (decal, trim, label, floor patch) by more than the z-fight threshold at the farthest view distance, or recess it into the surface.
- **Seat thin parts.** A pane in a frame, a board in an upright, a plate in a groove: let it enter the neighbour by one fixed depth and use that one convention everywhere (example: 1 cm). Then a checker can tell a legal joint from a poke-through.
- **Plan every trim and strip for every column, beam and corner it meets**, not only the straight runs. Round columns need the same care as square ones.
- **One source of numbers.** The generator and the runtime script read the same constants. If a mesh repeats every 0.4 m, the code that scrolls or places it uses 0.4 m measured along the same axis.
- **Offset repeating patterns** so no resting part is coplanar with a fixed surface (half a period out of phase).
- **Clean geometry before export.** Merge by distance, remove non-manifold edges, use an exact boolean (not a fast one) for cuts, check cutters for leftover coplanar faces. Blender: Select Non-Manifold, Merge by Distance, Boolean solver Exact.
- **Every visible solid gets a collider**, including decor (trees, planters, signs). A mesh with no collider is a hole the camera and player pass through.
- **Verify dimensions by ray measurement** in a script that runs after export and fails on any size limit (a generator-side `LIMITS` assertion plus a verifier).

## 3. Placement contracts
When content is placed into fixed slots (buildings into lots, rooms into a map, props onto holders, tiles into a grid), make the slot a contract.
- **Slot = size class, footprint, frontage zone, height range, tolerance.** Build every piece to fit its class. Test every piece x every slot size x every level automatically. Randomisation is safe only when containment is checked.
- **Adjacency in all three axes.** Neighbour constraints (no identical neighbours) must include above and below. Prove it with a search over hundreds of seeds and count violations (example: 739 vertical repeats over 500 seeds fell to 0 once the vertical neighbour counted).
- **Reachability is part of validity.** Every interactable face, door swing and stock position needs a clear standing capsule at the approach point, sized for the widest body the game allows. Dead corners get small decor, not a full-size interactable. Status: **planned** in the source project (approach below), so treat the numbers as yours to choose.
- **Traversal gaps** are sized for the widest body state (example: widest body 1.2 m, aisles 1.6 m, first 2 m inside a door clear, no pocket a player can get stuck in).
- **Spawn fairness as a level check.** Minimum distance from any spawn to a high-value pickup, clear sight lines, open floor. A failing check is a PROBLEM, not a warning.
- **Items on holders.** Markers belong to the holder's surface data. Check: sunk deeper than 5 mm, overlapping a neighbour by more than 1 cm, floating with no surface below, shelf clearance smaller than the tallest item. Size a new asset inside the existing marker box or revalidate every marker.
- **Signs and labels** are checked for occlusion from the places a player reads them: ray-test from each reading spot to the sign's centre and edges.

Example (from one project): shops of three fixed size classes were dropped into every unit of every map; a slot-fit test ran every shop in every slot, and 1,412 clip findings fell to 0 after fixes at the generators. These counts are that project's measurements, not targets.

## 4. Collision: who sees what
One "world" layer is not enough. Write a table with one row per consumer and answer it for every solid.
| Consumer | Question |
|---|---|
| Player body | can it walk here, stand on it, be stopped by it |
| Items and thrown objects | do they rest on it, bounce off it, pass through it |
| Camera | does it block the lens (glass, doors, cabins, decor yes; players and loose items no, or the lens jitters) |
| Grab / interact ray | can the player reach through it |
| Line of sight and projectiles | does it block what is seen or hit |
- A barrier that looks solid must block every ray the game uses. Glass with no collider is a gameplay exploit (items taken through the pane).
- **The authoritative host repeats the line-of-sight check** from the avatar's eye. A distance check alone, or the client's own ray, is not enough (`security.md` section 2). Status: **planned** in the source project.
- Special volumes (water, domes, cabins, stairs, basins) often need different shapes per consumer. Decide each consumer's answer first, then build the shapes.
- "Collider matches visual" is a checked invariant, not an intention. Check it with ray probes, a walker bot, and a debug view that draws colliders. No floating colliders at head height, none missing.
- Do not use ray-parity "inside" tests on open meshes (a dome counts every point as inside). Query the real colliders with a small sphere, and add explicit limits where a visual has no collider.

## 5. Moving and repeated parts
- **Looping parts** (conveyor belt, treadmill track, revolving door, sliding doors): build one closed path whose length is a whole number of part pitches, and hide the wrap inside housing geometry so it never happens in view. Never scroll a texture where parts must be solid.
- **Fixed-phase renders**: render at least 8 phases of the cycle, both directions, every instance, and look for a frame where a part appears, vanishes or pierces.
- **Sweep, not only snapshots.** Sample step <= tolerance / max part speed, and test the volume swept between samples.
- **Stacked, nested and grouped objects** (vehicles in a bay, chairs under a table, crates in a pile) are tested in their worst packing and at spawn, not only alone.
- **Instanced or batched geometry** must be expanded into per-instance world transforms for the detector (a QA hook that exposes them). A headless run that sees different transforms than the renderer gives false findings (416 of 520 baseline findings were this).

Example (from one project): a moving walkway's steps ran on one closed path of whole-number step pitches; the wrap sat under the landing plates, and the model's step period matched the scroll constant exactly.

## 6. Characters and animation
- **Before a fall, ragdoll or lying pose**, test the end-pose volume against the world in N directions (example: 16), starting with the direction the hit pushes. If nothing fits (narrow aisle, cabin, stairs), play a compact in-place version. Make the choice on the authority and replicate it so every peer plays the same fall.
- **Shared animation library, many body shapes**: add a runtime clearance pass (swing the smallest angle that clears the body, lift a limb whose hand or prop is below the floor, rate-limit the correction) or author per shape. Body morphs, outfits and hair are part of the test matrix, not extras.
- **Props and stages**: the longest held prop (cane, sword, staff) needs clearance against the idle platform. Fix by changing the stage or the pose, then re-check.
- **Static pose sheets miss time.** Also play every clip at game frame rate on every skin and body shape, and report per-frame limb turn, root lift change and deepest point inside the body (example limit: 1.5 cm). Re-run after any clip or clearance change.
- **Transitions** begin and end on their neighbours' poses (no pop); the get-up ends the frame control returns; timing parameters that shorten a state must compress the animation, not overrun it.

## 7. Camera
Short version: sphere cast with radius above the near plane, an inside-the-level test, a fallback when there is no room, fast in and slow out, hide your own body near the lens. Details and the per-frame check are in `ui-and-camera.md`.

## 8. The detector: design and proof
**Proven design** (a weld-and-separating-axis detector that gated a real project):
1. Weld each mesh, split it into solid pieces.
2. Exact separating-axis tests for convex pairs. For other closed pieces: sampled points plus ray parity (closed pieces only).
3. Report categories CLIP, ZFIGHT, LABEL, ITEM, MOVING as failures. Report JOINT (a part entering exactly one face) and HIDDEN (wholly inside another solid) with a picture gallery, not as failures.
4. The same checks run on each generated model alone, then on every built level x seed.

**Designed, not finished** (a stricter whole-game audit, still with parse errors in the source project): exact triangle-triangle tests per pair, every triangle plane its own face. Copy the design, not a finished tool.

Rules for any detector:
- **No silent excuses.** Merging faces by a smoothing angle makes curved parts invisible to the check (a trim strip through a round column was excused as a "joint"). Every overlap lands in exactly one named category.
- **Excuses are metadata with a written reason**, and every excuse is printed in the run (example tag: `clip_ok` with a reason, listed as CLIP_WHITELIST). Fail on an excuse with no reason. Define a legal joint so modellers know the rule.
- **Measure the z-fight threshold** on the shipping renderer: render two quads of different colour at several separations, distances (example 5, 15, 30, 60 m) and sub-pixel offsets; keep the smallest separation that never showed through, times 1.5. Starting values from one renderer: about 0.5, 1.5, 3, 6 mm at those distances. Yours will differ with near/far planes and depth format.
- **Proof protocol** before the detector may fail a gate: (a) baseline count before any fix; (b) injected-fault test, a known pierce and a known z-fight must both be reported; (c) a seeded suite, aim 40+ positives and 15+ negatives, 100% recall, near-zero false positives on known-good fixtures; (d) reproduce each screenshot the user sent with a fixed camera preset and require a finding at every visible defect; (e) run warn-only (CLIP_WARN) until trusted, then promote to PROBLEM.
- Keep the tool under `tools/`, never an autoload, excluded from the export preset, so the shipped game pays nothing.
- If the user asks for the tool to be removed after the fixes, do it only when asked; otherwise keep it as a gate.
- When the user reports clipping by screenshot or description (e.g. "the railings, walls, doors", "the stripes on the ceiling"), treat the report as a regression case: find the cause at the source, fix the whole class, and add the view to the preset list.

## 9. Visual tours
- Named camera presets at eye height and low angles for every unit x seed; also the knocked-down, lobby and results cameras.
- Keep every screenshot the user sent as a permanent regression view (a preset that reproduces it).
- Before/after sheets for every fix. Pictures come from a windowed run, never headless.
- A "hunter" reviewer builds their own cameras to find what the detector missed.
- Use a light review: one full-coverage pass, fixes, one verify pass (`agent-process.md`).

## 10. Checklist
| Rule | Check | PASS line |
|---|---|---|
| No flush different-colour faces | detector ZFIGHT count | `CLIP_DONE problems=0` |
| Panes and boards seated by one convention | model-only detector run on every generated model | same |
| Slot contract holds | every piece x slot x level | `LEVEL_CHECK name items=n problems=0` |
| Colliders match visuals | ray probes + walker + debug draw | walker exits 0 |
| Host repeats line of sight | modified-client test | `SECURITY_DONE problems=0` |
| Loops hide their wrap | 8-phase renders both directions, rider tour | by eye, sheet saved |
| Falls fit the world | forced knockdown at each hard spot | by eye, sheet saved |
| Detector proven | injected fault + seeded suite + user screenshot presets | recall 100%, FP near 0 |
