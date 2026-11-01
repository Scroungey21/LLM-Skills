# Performance: measure honestly, fix the slowest thing

Read this when the frame rate is in doubt, before choosing graphics presets, and before release.
The rule that matters most: a number only counts if it was taken on a named machine, at native resolution, with the cost of the feature included.

## Contents
1. Name the reference machine
2. How to measure
3. Budgets
4. Common wins
5. Presets and upscalers
6. Tours and regressions
7. Checks

## 1. Name the reference machine
Ask the user what hardware must run the game (the weakest target). Write it in `GAME_VISION.md` and `TOOLCHAIN.md`: CPU, GPU, memory, OS, resolution, target frame rate.
- A perf run **asserts the GPU adapter name** it ran on and fails if it is a different one. Laptops and multi-GPU desktops silently pick another adapter.
- Keep the reference run configuration in a script, not in someone's memory.

## 2. How to measure
- **Native resolution, upscaler off.** Never benchmark the base performance with DLSS, FSR or any upscaler or frame generation on. Test them separately and report only the *additional* gain. The user wants them to make the game playable on lower hardware, not to hide a slow baseline.
- Report frame-time **percentiles** (average, 1 percent low or 99th percentile, worst), not only frames per second. Spikes break feel.
- Use a **fixed tour**: a scripted camera or bot path through the heaviest areas, the same every run, with warm-up frames skipped. Include a worst case (full player count, most objects, all effects on).
- Measure one change at a time and record before/after. Optimise only what the profile shows.
- Run windowed or exported, not in the editor, for the headline number.
- Measure load time and memory too, and the cost of the first use of anything (first footstep, first effect), which can spike a frame.

## 3. Budgets
Write budgets as numbers per target: draw calls, triangles on screen, texture memory, physics bodies, lights and shadow casters, audio voices, packets per second, load time.
- Budgets come from the reference machine and the user's targets; they are not defaults of this skill.
- A budget breach is a PROBLEM in the perf run's output, with the number.

## 4. Common wins
- Instance or batch repeated meshes (multi-mesh), merge static geometry, limit materials.
- Occlusion culling and level-of-detail; hide what is behind walls. (Occluders can hide see-through overlays: check them.)
- Cap and sleep physics bodies; pool anything spawned often; keep expensive scenes frozen until needed.
- Fewer or cheaper lights; baked or cascaded shadows with a short distance; reflections only where they pay.
- Warm up shaders and sounds behind the loading screen.
- Move heavy work off the frame it is needed on; spread it across frames under a per-frame budget.
- Synchronise big sets (shelf stock, scenery) from a shared seed instead of sending them over the network.

## 5. Presets and upscalers
- Presets are chosen by compute class (low, medium, high, plus a custom page) and change cost, not identity. **A preset must keep every art-defining feature** the user named (`art-direction.md`). Ask which those are.
- Quality choices that cost noticeable money (reflections, volumetrics, high shadow resolution) are higher-preset features.
- Upscalers and frame generation are extra options on lower hardware. Verify them in a separate run and label the result "additional gain".
- The same game with each preset must pass the same content gates (no clipping appearing at a low preset because of a simplified collider).

## 6. Tours and regressions
- Keep a baseline per preset in `HANDOFF.md` (adapter, resolution, average, percentile, date).
- Re-run after any change to lighting, materials, particle counts, level density or physics.
- QA tools (detectors, preview scripts, perf drivers) live under `tools/`, are never autoloads, and are excluded from the exported build so the shipped game pays nothing.

## 7. Checks
| Check | How | PASS |
|---|---|---|
| Adapter asserted | perf script reads the adapter name | `PERF_DONE adapter=<name>` |
| Native baseline | upscaler off, fixed tour | `avg_ms`, `p99_ms` under budget |
| Presets | one run per preset | each under its budget |
| Upscaler gain | separate run, labelled additional | number recorded |
| Export excludes tools | export preset review | by hand |

Example (from one project): the reference was an integrated GPU selected by index, the perf script asserted its adapter name, and DLSS/FSR results were recorded only as extra gains over the native baseline.
