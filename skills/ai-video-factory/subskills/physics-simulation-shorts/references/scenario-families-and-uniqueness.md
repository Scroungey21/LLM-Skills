# Material Trials - scenario families, materials and the uniqueness rules

Contents: vocabulary · novelty gate (rules, fingerprint, planner) · press · drop · blade (MPM) · adding a scenario or
family · what makes a good premise · ideas backlog · known generator weaknesses.

## Vocabulary

A **family** is a code path (`families/<name>/`). A **scenario** is a genuinely different rig inside a family
(`spec["scenario"]`). **Rig knobs** (`spec["rig"]`) vary a scenario. The novelty rules treat "same scenario, same rig" as a
repeat. All catalog data lives in `season/catalog.py`; all physics inputs are in the spec.

| Family | Scenarios | Engine | Outcome verdicts (measured) |
|---|---|---|---|
| press | `press` (three hydraulic presses over three objects), `roller` (steel drum over low cushions and a tile) | Blender cloth-pressure soft bodies + Voronoi fracture, Bullet | BOUNCED BACK / SPRANG BACK / STAYED DENTED / STAYED FLAT; SHATTERED / CRACKED / SURVIVED |
| drop | `hopper` (count ladder poured onto a rated pane; load in N), `height` (one ball, rising drop heights; impact energy in J) | Blender Bullet rigid bodies (CPU) + kinematic plate released at measured load | HOLDS / BROKE AT N (hopper); HOLDS / BROKE (height) |
| blade | `wedge` (cube dropped on a steel blade: split or survive), `funnel` (hourglass: flow through or jam) | GPU Taichi MLS-MPM (`families/blade/mpm.py`) -> PLY -> Blender | SPLIT IN TWO / SURVIVED; FLOWED THROUGH / HALF STUCK / JAMMED |

Family rotation `press -> drop -> blade` picks the first family tried per slot; within a family the planner picks scenario,
rig and materials.

## Novelty gate (`season/novelty.py`, checked at planning time, before anything is simulated)

User rule (2026-09-26): every video unique. Rules (`RULES`, stored in every ledger entry):

| Rule | Limit |
|---|---|
| A scenario returns | not within the last **6** videos (`scenario_gap`) |
| When a scenario returns | new rig settings AND at most **1** material shared with each earlier use of it (`same_scenario_max_shared`) |
| Any scenario | at most **1** material shared with each of the last **4** videos (`recent_window`, `recent_max_shared`) |
| Exact repeats | never (same rig and same materials) |

- **Fingerprint** = `{family, scenario "family/scenario", rig, materials(sorted keys)}`. press: contestant keys; drop: [projectile
  key, target key]; blade: material keys. Wedge rig always includes `half_w` and `drop_z`; the drop fingerprint includes the
  `ladder`. History = every video that exists or is committed (planned, building, scheduled) in release order **plus
  rejected videos that were actually rendered** (`episodes/<slug>/build/short.mp4` exists): they were seen, so their scenario
  and materials count as used. Only builds that never produced a video are forgotten.
- **Planner** (`catalog.plan(family, history, seed, tries=400)`): `random.Random(f"{family}:{n}-{salt}")`, 400 candidates drawn
  round-robin across the family's scenarios, filtered by `novelty.check`, best `novelty_score` wins. Score = sum over past videos
  of `w x ((scenario differs) x 3 + (family differs) + 2 - shared materials)`, `w = 1/(1 + age x 0.25)` (recent videos weigh more).
  The reasoning is stored per ledger entry under `novelty` (nearest earlier video, shared materials, `new_scenario`,
  `rig_differs`, candidates rejected per scenario).
- **When nothing passes** the job stops and says new scenarios/materials are needed; **the rules are never relaxed to fill a
  slot.** The fix is a new scenario (below).
- **Precedent:** the first S1E04-S1E06 were the S1E01-S1E03 rigs with new colours and materials. The user rejected them as
  repetition ("unacceptable in the long run"); the rules reproduce that verdict (each re-used its scenario 3 videos later; two
  had identical rig settings). Research agrees: YouTube's July-2026 "inauthentic content" wording names templated,
  low-variation, same-outcome videos as unmonetizable, which is exactly what a naive parameter sweep produces.
- `season/HISTORY.md` is the readable memory (every video, every rejection, why). Read it before proposing any video.

## press family

Spec: `contestants` = two soft bodies (softer first = escalation) + one fracture solid (always last: the finale).
Catalog (`SOFT`, `FRACTURE`):

| Soft material | label/look/sound | cloth (stiffness, bending, pressure, mass, damping) | crush_bottom |
|---|---|---|---|
| jelly | JELLY / jelly / jelly | 14, 2.0, 16, 0.3, 1.2 | 0.10 |
| rubber | RUBBER / rubber / rubber | 80, 45, 24, 0.4, 12 | 0.30 |
| gummy | GUMMY / jelly | 30, 6, 12, 0.35, 4 | 0.14 |
| foam | FOAM / rubber | 10, 1.0, 3, 0.15, 25 | 0.12 |
| balloon | BALLOON / rubber | 6, 0.5, 30, 0.1, 0.8 | 0.18 |

Fracture solids (cells, density kg/m3): glass 64/2500, ice 48/917, porcelain 40/2400, obsidian 56/2400, amber 56/1100 (look
"glass", orange tint). Hue per soft contestant never repeats (jelly hues red/green/orange/purple/blue; rubber blue/yellow/
black/red/green).
Rig knobs: `press` -> `plate` width (0.82 / 0.5), `crush_s` (1.5 / 2.2); `roller` -> `roller_radius` (0.5 / 0.42), `roller_speed`
(0.7 / 0.5 m/s), `gap` clearance (0.08 / 0.1).
Verdicts (`families/press/scene.py outcomes`): soft body - recovery `rec` = final / rest height: >= 0.9 and wobble >= 0.04
BOUNCED BACK; >= 0.9 else SPRANG BACK; 0.6-0.9 STAYED DENTED; < 0.6 STAYED FLAT; `ok = rec >= 0.9`. Fracture - displaced-cell
fraction > 0.3 SHATTERED, > 0.05 CRACKED, else SURVIVED; `ok = frac <= 0.05`. Story check: `ok` values must differ.

**Steamroller lessons:** a fixed-height drum **bulldozes tall objects instead of crushing them**, so contestants are low
slabs (22 cm cushions and 10 cm tiles) in 5 cm pockets; drum radius >= 0.42 m; clearance 8-10 cm. Contact time comes from
`contact_frame_drum` for each object's own height. Moving loads crush progressively (`reach=`, see quality-gate 3.3).
Timeline note: the press cut ends at the last result (+18 frames): drum rolling off into the dark after it was ~2 s of dead
picture.

## drop family

- **hopper:** `projectile` (PROJ: steel 7850 kg/m3 bounce 0.35, lead 11340 / 0.1, brass 8500 / 0.3, marble 2500 / 0.45,
  rubber_ball 1100 / 0.8; radius 0.025 m), `target` (TARGET: glass 90 cells, ice 80 cells density 917, porcelain 70 cells density
  2400), `ladder` ([1,10,100,1000,5000] or [1,5,50,500,2500]), `rig.outlet` (0.2 / 0.14 m hopper outlet; pour rate, Beverloo
  type). Target strength: `breaks_at` random in [1.3 x ladder[-2], min(0.36 x ladder[-1], 1800)] balls;
  `strength_n = round(breaks_at x ball mass x 9.81, -1)`. Two-pass bake: pass A unbreakable plate -> measured pane load per frame
  (`pane_load`) -> break frame = first frame load > `strength_n`; pass B re-bakes the same deterministic scene with the cells
  released from the load point at that frame (no break -> pass A is final). Why a kinematic plate: Bullet fixed constraints stayed
  soft under heavy piles. Break stage ends at break + ~1.2 sim-s + hold. Label: `N <BALLS>` then `HOLDS` / `BROKE AT <balls on
  target at break>`; load bar = load / strength. Stages above 1,000 balls extract events from every 3rd ball only.
- **height:** one ball per stage dropped from `ladder` heights ([0.25,0.5,1,1.5,2,3,4.5] or [0.3,0.6,1.2,1.8,2.4,3.0,4.5] m, **7
  rungs**: a heavy ball barely bounces so each round is ~1.7 s and a 5-rung ladder ran 10.5 s, under the 12 s minimum), `rig.ball_r`
  (0.06 / 0.08), projectile from steel/lead/brass/marble. **Impact energy is measured from the unbreakable first pass** and the
  target is rated in joules: `rating_j = uniform(m g x ladder[-2] x 1.1, m g x ladder[-1] x 0.85)`, so it breaks in the **last
  round only**; the second-to-last rung is a near miss (~85-90% of the rating). Breaks only if `impact_j > rating_j` at contact.
  Label `<height> DROP` then `HOLDS` / `BROKE`; the bar is the ball's live kinetic energy / rating. A heavy ball can stop dead on
  contact: hold only `HOLD_F` after it settles, never a fixed minimum (S1E05 froze 1.8 s per round once).
- **Story check:** target holds in every round, breaks in the last.
- **Cost:** the 2,500-5,000-ball stage needs a CPU bake of up to ~2 h (two passes at the slow-motion step); a 1,000-body Bullet bake is
  ~233 ms/frame; use `bpy.data`/`obj.copy()` for creation. Hopper chimney is clear glass: tint + steel frame (quality-gate 3.2).

## blade family (GPU MPM)

`families/blade/mpm.py <params.json> <out_dir>` (Taichi CUDA): grid 112^3 over a 1 m domain (`dx = 1/112`), 8 particles per cell
(spacing dx/2), a 24 cm cube (`side 0.24`) dropped from `drop_z` (0.62 / 0.78; funnel 0.64) onto the rig. Output: one PLY per
output frame (x y z r g b), `fps_out = fps/speed = 60`, played at 30 fps = true 0.5x with no interpolation.

| Material model | Used for | Notes |
|---|---|---|
| 0 water | `water` | density 1000; E 2.6e6 (bulk ~1.5 MPa, speed of sound ~39 m/s ~ 10x the ~4 m/s impact; CFL c dt/dx ~ 0.35 at dt 8e-5). The old E 4e4 (c ~ 5 m/s) let the cube compress like a spring and rebound into a tank-filling droplet cloud that read as bubbles (S1E03 review 2026-10-03) |
| 1 jelly | `soft_jelly` E 15 kPa, `jelly` E 60 kPa, `firm_jelly` E 200 kPa | fixed-corotated elastic; density 1100; **Kelvin-Voigt viscosity eta 150 Pa s** (stability bound eta < rho dx^2/(6 dt) ~ 240 at dt 6e-5). Tested: eta 0 -> centroid rebounds to 0.53 m three times (rubber ball); 40 -> no visible change; 150 -> one small rebound (0.42 m), settled by ~1.6 s on screen |
| 2 snow | `snow` hardening 10, `powder` 5, `packed` 18, `clay` | Stomakhin plasticity; density 400; defaults theta_c 2.5e-2, theta_s 4.5e-3; E 1.4e5. **clay** = snow model with theta_c 0.008, theta_s 0.003, E 6e4, hardening 0 |
| 3 sand | `sand` friction 35 deg, `fine_sand` 25, `gravel` 45 | Drucker-Prager (Klar 2016); density 1600; E 3.5e5 |

dt = 6e-5 for jelly/snow, 8e-5 for water/sand. Poisson nu 0.3 / 0.35 / 0.2 / 0.3. Solver floor and walls sit 3/112 m inside the
domain (the render must match: quality-gate 3.2).
- **wedge:** steel wedge blade along x at apex height z 0.30, base width 0.12 (`half_w` 0.06 default; rig knob 0.06 / 0.025),
  `BLADE_Y 0.5`. Split = both sides hold > 20% of particles (`y < -0.07` and `y > 0.07`); for jelly additionally the cloud must
  be two separate 6-connected voxel components (2x particle spacing) with the second > 20% - an elastic solid draped over the
  blade is ONE piece and is SURVIVED. Catalog: 3-4 materials, last is always an elastic jelly (it can survive); others sampled from
  water, sand, fine_sand, gravel, snow, powder, packed, clay.
- **funnel:** hourglass, axis x = y = 0.5, steel cone neck z 0.30 -> rim z 0.60, rim radius 0.30, wall 3 cm, `neck_r` knob
  (0.035 / 0.05 m). Flow = fraction of particles below z 0.28 (just under the neck). FLOWED THROUGH >= 0.6, JAMMED <= 0.2, else HALF
  STUCK; `ok = through >= 0.6`. Catalog: 1-2 **flowers** (`FLOWERS`: water, fine_sand, sand, powder) then jammers (`JAMMERS`: gravel,
  firm_jelly, jelly, clay, packed) to 3-4 materials; flowing first, the jam as payoff.
  Measured at a 10 cm neck (`neck_r 0.05`): fine sand flows 100%, packed snow 77%, clay (theta_c 0.008, theta_s 0.003, E 6e4) about
  20% then plugs (no slow-ooze regime; the story check needs at least one flow and one jam). Observed at `neck_r 0.035`
  (S1E09 attempt): powder jammed, sand half stuck, gravel jammed - **no flow**, so the story check fails and the Short is only 4.5 s.
- **Stage lengths:** wedge stage ends at settle (kinetic energy > 4% of peak) + hold, capped at 1.8 sim-s after contact; funnel stage
  ends one hold after the last real motion (> 1% of peak), capped at 3.0 sim-s after contact. The last material's stage is extended by 30
  frames for the loop dissolve.
- **MPM rendering:** one PLY per frame via a Geometry Nodes `Import PLY` node whose path a `frame_change_pre` handler sets (the Format
  String node needs dynamic items); Cycles renders the points as spheres or meshes. Surface meshing (particles -> volume -> mesh): voxel =
  1x particle spacing, radius 2x, threshold 0.45; **water 1.3x, 3.2x, 0.6**. Smaller values look like crumpled foil. Sand grains
  from Duplicate Elements with jitter (3-4 grains/particle). Floor and walls at the solver's 3/112 m inset. No motion blur on points.

## Adding a scenario (the preferred way to grow variety)

1. Add a branch to the family's `scene.py`, plus a verdict and `describe` branch in `family.py`; expose rig knobs in `spec["rig"]`.
2. Add a generator to `season/catalog.py SCENARIOS` returning a full spec (with `rig` and materials) and make sure `novelty.fingerprint`
   covers its rig.
3. Bake it **once by hand** (`make_episode.py <slug>`), preview both aspects, check story contrast (some element must end differently)
   and run the five visual rules on the contact sheet before the planner may use it. 3-material blade videos have failed the 12 s
   minimum (4.5 s funnel, 8.7 s wedge); budget >= 12 s of screen time per scenario before enabling it.
4. Add look entries for any new material (a material must look like its name) and check the solver can produce the behaviour its word
   promises.

## Adding a family

1. `families/<name>/scene.py`: headless, spec-driven, slow motion through the solver `time_scale`.
2. `families/<name>/family.py` with `bake, score, render, assemble, describe` (+ `sanity` if the solver can go unstable); finish with
   `finish_seq(..., loop=aspect == "short")`.
3. Add a generator to `season/catalog.py` and the name to `cadence.family_rotation`.
4. Build one episode by hand and review both cuts before letting the weekly job rotate it in. `make_episode.baked()` has a per-family
   dict: add the family's "baked" test there.

## What makes a good premise (distilled from the research)

- The hook is a **named object against a named obstacle at escalating scale**, not the technique (lift 1.57 for object-vs-obstacle;
  softbody 0.78, cloth 0.64). Big numbers 1.22, superlatives 1.86, "vs" 1.28, destruction 1.54, domino/chain 1.50, compilation titles
  1.76-1.27, relax/sleep 1.59-2.04.
- Every ladder needs an **explicit target/test** ("does it survive?", a pane that will break): 7 of 10 top 3D Shorts vs 0 of 3 bottom.
  Stage count 4-7, early stages ~2 s, the final stage longest (~4-6 s), starting ~60-85% of runtime, decisive moment at 85-100%
  (peak-end rule is the best-supported mechanism; the Zeigarnik "cliffhanger" rationale failed a 2025 meta-analysis).
- Vary **outcomes**, not just parameters (a variant family must not end identically): story check enforces it.
- No third-party IP/characters (27.5% of niche titles use IP, but 1.15x lift and legal risk). The research suggested an original recurring
  mascot; the user's not-a-show rule makes that unnecessary - the apparatus and materials are the subject.
- Sequels of proven winners decay but stay far above median; a sequel must be a varied scenario (new obstacle, bigger scale), never a
  re-skin (series numbering alone gives no lift, 0.99). Only possible after analytics exist (none yet).

## Ideas backlog (physics-only; none built)

Shredder, spiral glass tube, domino chain, FLIP liquids (CPU-only, $79 add-on, overnight bakes), wringer / rolling mill, magnet vs steel
balls (rigid), cloth drop/tear (5.2 XPBD cloth is experimental: no self-collision, 12 GB per 60 frames - avoid), Mantaflow liquids
(res 128 ~8 s/frame, ~11.5 MB/frame). A **viscoplastic (Herschel-Bulkley) MPM material** would allow slowly flowing clay, dough or mud.
Candidate engines already verified on the card: Taichi 1.7.4, Warp 1.17 (sm_120 kernels run). Do not add generated meshes (TRELLIS/Hunyuan/
Tripo) - forbidden by invariant 1; use procedural Geometry-Nodes/bmesh generators or CC0 libraries (Poly Haven, ambientCG) for objects.

## Known weaknesses of the generator (2026-11-01)

- `drop/hopper` has failed the physics gate twice in a row (S1E09 porcelain + rubber_ball, outlet 0.2: all rounds held through 5,000
  balls; S1E11 marble + porcelain, outlet 0.14: all held through 2,500). Both failing candidates used the **porcelain** target; the
  hopper successes (S1E02, S1E05 draft) used glass; porcelain works in the height scenario. `strength_n` is derived from ball count x
  mass x g, but the measured `pane_load` evidently stays below it; investigate (pane support/rim, balls spilling off, load measurement)
  before letting the planner pick porcelain for hopper.
- 3-material blade candidates (and any funnel at `neck_r 0.035`) have produced too-short or no-contrast videos; consider requiring 4
  materials and `neck_r` 0.05 or a verified flowing material.
- A same-family retry that has no novelty-passing candidate aborts the whole weekly job (see operations).
