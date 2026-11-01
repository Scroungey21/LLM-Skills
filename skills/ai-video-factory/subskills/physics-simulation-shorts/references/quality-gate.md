# Material Trials - quality gate

Contents: 1 automated gate · 2 physics and story sanity · 3 the five visual rules (with precedents) · 4 render and
Blender traps · 5 visual accept/reject · 6 sound accept/reject · 7 metadata rules · 8 human review checklist.

An episode that fails any automated check is never filed. A failed build is replaced once by a fresh candidate and
the failure is logged in `season/weekly.log`; rejected builds do not use up an episode number but stay in the
production memory if they were rendered.

## 1. Automated gate (`engine/qc.py`, per aspect; results in `build/qc.json`)

| Check | Pass condition | Why |
|---|---|---|
| `duration_s` | Short 12-60 s; wide >= 10 s | research median 28 s, top 3D Shorts 14-27 s; below 12 s reads as a clip, not a test |
| `loudness_lufs` | -16 LUFS +-1 LU | channel target; see audio-and-finish for the chain |
| `true_peak_db` | <= -0.5 dBTP (config target -1.0, gate allows +0.5) | AAC can ring above the pre-encode peak |
| `longest_freeze_s` | <= 1.0 s | no run of frames where (almost) nothing changes: `|diff| > 6` per pixel on a 216x384 (384x216 wide) gray version, top 1/6 excluded (text band), a frame "changed" if >= 3 such pixels |
| `min_mean_luma` | > 4 (0-255) | no black frames |
| `loop_seam` (Short only) | block-mean distance first vs last frame <= max(2 x 95th-percentile ordinary frame step, 1.5) | seamless loop; 8x8 block means (composition, not fine detail). Cuts score 15-65, ordinary steps stay under ~7. The older changed-pixel count passed S1E03's cut seam because water spray made ordinary steps huge |
| `text_visible_fraction` | <= 0.65 | text must not stay up (from `overlay_<aspect>.json`) |

The wide cut is linear (no loop dissolve) and has no `loop_seam` check.

## 2. Physics and story sanity (`family.sanity`, runs in the qc step)

- **press:** every soft body must stay between **0.02x and 1.6x** its rest height (outside = unstable cloth solve) AND
  the finale must differ from an earlier contestant (`outcome_contrast`).
- **drop:** the target holds in every round and breaks in the **last** (`breaks[-1] and not any(breaks[:-1])`).
- **blade:** the materials must not all end the same way: wedge - at least one splits and one survives; funnel - at
  least one flows through and one jams.
- **Story check rule (research R8: every ladder needs a turning point).** Precedent: S1E06 v1 (three jellies on the
  blade) all survived and was rejected; its replacement took the same id.
- Sanity runs on engine state before any picture is judged (measurements before vision; image-only critique alone
  reached 0% full-scene success in a research study).

## 3. The five visual rules (user review 2026-09-26, extended 2026-10-03; apply to every video)

### 3.1 A material must look like its name (and behave like it)
- Enforced in `families/blade/scene.py`: **sand** = fine grains, each simulated particle split into 3-4 grains of
  1-1.5 mm (gravel stays coarse); **water, snow, clay, jelly** = continuous surfaces (particles -> volume -> mesh);
  **snow** bright white with soft scattering. User's words: sand is not "big grains of playdough", snow is not grey
  clumps, liquids and clay are continuous.
- Check the contact sheet: grey/clumpy snow, sand that looks like beads or playdough, clay like gravel = reject.
- Any new material needs its own look entry (`engine/mt.py` recipe and `scene.py` branch) before first use.
- **Behaviour must match the name too.** Wet clay in this MPM (snow model, no hardening) either plugs or pours; it cannot
  slowly ooze. So clay is used only where a jam is the story, described as jamming. A slow-ooze clay/dough/mud needs a
  viscoplastic (Herschel-Bulkley) model first (not built).
- **Water spray** must look like droplets, not bubbles (user review 2026-10-03): the surface mesher gives every particle
  a ~1.4 cm splat, so stray spray particles became bubble-sized blobs. Each water frame is split into `b_` body (>= 6
  neighbours within 2.5 particle spacings, meshed as a surface) and `s_` isolated spray (small droplets); `p_` files
  stay untouched because the analysis measures them. Water stiffness was also raised (see scenario-families).
- **Jelly** must not bounce like a rubber ball: Kelvin-Voigt viscosity eta 150 Pa s (see scenario-families).

### 3.2 No invisible colliders
Every boundary the material touches is rendered exactly where the solver has it:
- the MPM floor and walls sit **3/112 m** inside the domain and the rendered floor/walls are placed exactly there
  (before the fix, piles floated 2.7 cm);
- tank walls are as tall as the material actually climbs (measured);
- the funnel has a tinted glass cone, a steel rim and a steel neck collar;
- the drop hopper chimney (clear glass) rendered almost invisible, making 1,000- and 5,000-ball columns look stacked in
  mid-air: **any glass that holds material gets a tint plus a steel frame** (corner rails and rims), as the MPM tank
  and funnel do; clear glass is not a visible boundary on a plain backdrop.
Material hanging in the air, or stopping against nothing, is a rejection.

**Tall glass is a glare trap** (S1E03 water splashes to ~0.9 m; the first render showed a huge white slab at the top
of the Short - studio lights seen *through* the panes). Standing fixes:
- `mt.area_light` hides every light from camera rays **and** transmission rays (`visible_camera =
  visible_transmission = False`); lights still light the scene and show as glossy highlights.
- Tank panes are non-refracting clear glass (IOR 1.0) inside a dark steel frame (corner posts + top rails), so the
  boundary reads as an object rather than a sheet of reflections.
- The camera is never placed close to or level with a wall plane.
After any rig or lighting change, render a single-frame preview of the tallest material before a full build.

**Polished metal must not duplicate the material**: S1E03's mirror-polished blade reflected the jelly as a crisp second
red block, so an intact cube read as "split in two" under a SURVIVED label. Rigs that material rests against use brushed
metal (roughness >= 0.5). Check the final verdict frame for reflections that contradict the label.

### 3.3 Fracture starts at the real contact point at the real contact moment
- `mt.crack_release`: cells stay one solid piece until the exact first-contact frame - geometric for drums and plates
  (`mt.contact_frame_drum`), measured for impacts and loads. A crack front then runs outward from the contact point and
  releases cells. **Front speed 15 m/s** (default `front_speed=15.0`): a slow front (1-3 m/s), or an inner shader that
  reveals cracks, reads as "pre-broken".
- Voronoi seeds crowd around the contact point (`bias_point`, `bias_frac` 0.6): small fragments at contact, large far away.
  Fragments get damping so they do not explode apart.
- **Moving loads crush progressively.** A rolling drum passes `reach=` to `crack_release`: each cell breaks 2 frames
  before the drum's footprint arrives over it. A fixed crack speed is wrong because slow motion compresses even 15 m/s
  into ~2 frames across a 55 cm tile.
- **The unbroken part is one solid piece.** `mt.show_breaking` keeps the intact mesh visible for the whole shot and cuts
  out each cell (exact boolean) only at that cell's release frame. Translucent materials (amber, glass) otherwise show
  every internal Voronoi face the moment the object swaps to its cells.
- Precedents: S1E04 v1 amber switched to fragments 0.6 s early, from its centre, because its contact time was computed
  for the cushions' height (each object needs its own contact time); S1E04 v2 broke at the right frame but showed a crack
  network one frame after the drum touched its edge (fixed by show_breaking).
- User's words: amber that broke before the drum touched it looked "like pre-broken amber was teleported in".
- Glass that breaks under load (drop family): Bullet fixed constraints stayed soft under heavy piles (the pane yielded at
  any threshold even with 150 solver iterations). The working design holds the Voronoi cells as one kinematic plate,
  measures the real load on the pane from the simulation each frame, and releases the cells when load exceeds one fixed
  strength; the ball count that breaks it therefore still comes from the physics.

### 3.4 Text is never up the whole time
`engine/finish.py _Fader`: the line fades in when its content changes (a new element, or a result), holds up to 1.0 s,
fades out, and stays hidden until the next change; the load bar follows it. QC: `text_visible_fraction` <= 0.65. Dense
videos (S1E03: 8 events in 12 s; S1E05: 7 rungs of ~2 s) shorten each line so >= 0.5 s of clean picture precedes the
next change, never covering more than 60% of the time to it, minimum life 22 frames. A family may give an item a `key`
so a result does not cost a second fade-in (the drop height ladder uses one event per round; the last break gets its own
event so the payoff line always fades in). See audio-and-finish for the frame constants.

### 3.5 Every Short plays in order, shows everything in full, and loops seamlessly
(user 2026-09-26 and 2026-10-03)
- `finish_seq(loop=True)` plays the timeline in order; its last 0.6 s (`LOOP_FRAMES` 18) cross-dissolve, picture and sound
  (equal-power), into the first 0.6 s of the timeline; the video starts right after those frames, so its last frame flows into
  its first. All three families pass `loop=aspect == "short"`. The wide cut stays linear.
- **Never loop by rotating the timeline.** The first version started each Short just before the final payoff; the video then
  *ended* the moment the last element appeared (S1E03's jelly, S1E06's clay), which the user called hasty, annoying and
  unsatisfying. Their earlier verdict on non-looping endings: "terrible looping". (`rotate=`, the `loop_seam()` helpers in
  the family modules and the "rotated to loop" docstrings are legacy; `loop=True` is the live path.)
- The final element keeps playing past its result long enough for the dissolve: the blade family adds `LOOP_FRAMES + 0.4 s`
  (18 + 12 frames) to the last material's shot. The dissolve must never eat into a payoff.
- Multi-shot videos: the seam must sit inside the final shot (a cut in the loop seam fails `loop_seam`); S1E03's materials
  touch the blade 11 frames in, and "contact - 20" clamped to frame 1 once put the seam exactly on the snow-to-jelly cut.
- The finishing stage keeps a **clean master** (`work/clean_<aspect>.mp4`, linear, no text) so text, loop and sound changes
  re-finish without re-rendering.

## 4. Render and Blender traps (found 2026-09-27 onward)

- **Cycles persistent data stays OFF** (`mt.use_cycles`). With it on, objects that become visible partway through an
  animation render (fracture cells at their release frame) came out as solid black shards. Single-frame previews looked
  fine; only a full animation render shows it (found in S1E01's glass).
- **No live booleans in a rendered animation.** An exact boolean with animated cutters is re-evaluated every frame and every
  motion-blur subframe (up to 97 s per evaluation; an 8-hour rebuild stalled). Crack states are precomputed
  (`mt.show_breaking` -> `_cut_states`: one static mesh per distinct release frame, visibility keyed). An old blend can be
  patched with `tools/freeze_breaking.py`, no re-simulation.
- **A preview is not proof.** Previews are single frames without motion blur. After any change to fracture or visibility,
  extract frames from the finished clean master (`work/clean_<aspect>.mp4`) and look at them.
- **Python `keyframe_insert` ignores `keyframe_new_interpolation_type`**: keys come out BEZIER. Evenly spaced keys stay
  effectively linear (the drum is unaffected), but cutters keyed "far -> rest" slid up through the floor and nicked the tile
  before release. Use visibility keys (true on/off) or set interpolation on the keyframe points explicitly.
- **Fireflies / denoiser smear on transmissive materials** (jelly, glass, ice): raise samples (press uses 48 for Shorts).
- **MPM render:** surface meshing parameters are in scenario-families (too small = crumpled foil).
- **Colour:** Khronos PBR Neutral, not AgX (see architecture).
- Bullet is not deterministic across versions/machines: keep the baked `.blend`/cache, do not assume same seed = same result.
- Blender 5.2 API drift is the usual cause of agent-written `bpy` failures (`BLENDER_EEVEE` not `_NEXT`,
  `scene.compositing_node_group` not `scene.node_tree`, no `action.fcurves`, no `bgl`, `mod.properties.inputs.<id>.value`
  for geometry-nodes inputs in 5.2). Pin Blender 5.2 LTS (supported to July 2028).

## 5. Visual accept / reject

**Accept:** a single hero apparatus readable in the first frame; the outcome visible without the text; materials read as
their material (glass refracts, rubber is matte-coated, jelly translucent); motion blur on rigid and cloth bodies; the line
clear of the Shorts UI (bottom ~390 px and right ~140 px free); label near the top (research: centre ~10-15% from the top).

**Reject:** fireflies/denoiser smear; interpenetrating or exploding bodies; a verdict that disagrees with the visible
result; text over the payoff; more than one line of text; any frame not rendered from a simulation; material in mid-air;
early or teleported fracture; black frames or a hard cut at the loop seam; an ending that arrives the moment the last
element lands.

## 6. Sound accept / reject

**Accept:** a sound within 0.1 s of frame 0 (research: first onset 0.07-0.09 s in the top clips; audible within 0.15 s);
every hit lands on a simulated impact; silence between events (top 3D Shorts are ~32% silent frames, ~2 onsets/s);
separated transients in the spectrogram.
**Reject:** reverb tails/washes, ambient beds, music; continuous walls of sound in dense stages (the drop family thins
them - see audio-and-finish); isolated clicks that ring above the true-peak limit after AAC.

## 7. Metadata rules

- Title <= 100 characters, states the matchup/object and obstacle (generated by `family.describe`; e.g. "Gummy vs Rubber vs
  Obsidian Under a Hydraulic Press", "A Steel Ball Dropped From 30 cm to 4.5 m onto a Ice Sheet"). Hashtags in the
  description, not the title.
- Description = the measured numbers per element + hashtags (`#physics #simulation #satisfying #asmr #slowmotion #blender`
  + family tags). **No** series name, episode number, "made by me", authenticity or "no AI/diffusion" statements and no credit
  lines (the newer not-a-show rule of 2026-09-26 overrides the earlier note that asked for a "no AI" line and a CC0 credit;
  `engine/meta.py` and the filed descriptions follow the newer rule). CC0 provenance stays in `assets/sfx/LICENSES.csv`.
- `containsSyntheticMedia` false (stylised CG simulations, not realistic AI media; YouTube's disclosure rule targets realistic
  synthetic content), `selfDeclaredMadeForKids` false (set deliberately; satisfying clips may appeal to children),
  `privacyStatus` **private** until a human approves.
- No third-party IP, characters or brands in titles/visuals (research: game/cartoon IP lifts only 1.15x vs 1.57x for
  object-vs-obstacle, and carries trademark/made-for-kids risk).

## 8. Human review checklist before filing or uploading

1. Contact sheet from `work/clean_short.mp4`: five visual rules (look, colliders, fracture timing).
2. First/last frame pair: seamless loop, no cut, no text mismatch at the seam.
3. Verdict frames: label agrees with what is visible (no mirror duplicates, no hidden contact).
4. Spectrogram / listen: dry, hits on impacts, silence between.
5. `season/HISTORY.md`: the new video is unlike the last 6 (invariant 7).
6. `weekly.py status`: the slot's ledger entry is `scheduled`; the calendar folder is the right slug.
