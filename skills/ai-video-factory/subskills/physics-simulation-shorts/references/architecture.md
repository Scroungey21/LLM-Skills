# Material Trials - architecture

Contents: channel decisions · stage flow · family interface · timing model · files per episode · spec & ledger ·
release folder · config (`channel.json`) · git hygiene · the Blender helper library.

## Channel decisions (from the new-channel playbook)

| Decision | Material Trials answer |
|---|---|
| Voice / TTS | **None.** No narration, so no TTS/Compose service and no port. The foley is the soundtrack. |
| Visual style | Procedural geometry + physics solvers rendered in Blender Cycles. No ComfyUI, no generative models (user rule). Studio cyclorama sets, one hero apparatus per family, locked or slow camera. |
| Captions / motion | One centred line per moment (`engine/finish.py one_line`). Optional text-free load bar (drop family). No word-level captions. |
| Music | **None.** Recorded CC0 foley placed on simulated events. Near-dry room, -16 LUFS, final ceiling limiter, no pre-compression. |
| Editorial contract | One flat JSON per episode: `episodes/<slug>/spec.json`. `family` selects the driver; every other field is a simulation input. |
| Release convention | `release-calendar/<YYYY-MM>/<DD>/<slug>/` with `video.short.mp4`, `thumbnail.jpg`, `metadata.json`, `title.txt`, `description.txt`, `upload-manifest.json`. Browse by pointing `release-catalog` (WPF app, repo root) at `material-trials/release-calendar`. |
| Orchestration | Standalone CLI, no DB. `season/LEDGER.json` is the only state. Windows Task Scheduler runs `weekly.py run`. |

## Stage flow (`make_episode.py`)

`STEPS = bake -> score -> render -> qc -> meta`; the `render` step renders **and** assembles each aspect:
`short` 1080x1920 and `wide` 1920x1080. `--from <step>` restarts from that step; `--aspects short` renders the
Short only; `--keep-frames` keeps PNG frames/particle caches (default `render.keep_frames=false`: after a passing
QC the `work/frames_*` and `work/sim_*` folders are deleted).

- **bake skip rule:** press needs `work/press.json`; drop needs `work/stage_<k>.json` for every ladder rung;
  blade needs `work/analysis.json`. Delete `work/` to re-simulate. (MPM additionally skips a material whose PLY
  count already equals the frame count.)
- **render never overwrites existing frames**, so a crashed render resumes.
- **qc** runs `engine/qc.py` per aspect, then `family.sanity` (physics + story check) -> `build/qc.json`
  (keys `short`, `wide`, `physics`). Pass = every entry passes.
- **meta** calls `family.describe(ep)` -> `meta.build` -> `build/metadata.json`, embeds title/description into
  both MP4s (stream copy), cuts thumbnails at `key_time_s + 0.5` (`thumb.jpg` 1080x1920 crop of the Short,
  `thumb_wide.jpg` 1280x720).
- **`--remix`** re-runs `family.score`, rebuilds the loop-matched audio, loudness-normalises, swaps it into the
  existing MP4s with the video stream copied, re-embeds metadata and re-runs QC. Needs no frames; use it for any
  sound change; afterwards re-file with `weekly.py register --slug <slug> --release <iso>`.

## Family interface

Every family module (`families/<name>/family.py`) exposes: `bake(ep)`, `score(ep)`, `render(ep, aspect)`,
`assemble(ep, aspect)`, `describe(ep) -> {title, lines, tags, key_time_s, results}` and optionally `sanity(ep)`.
`scene.py` is the headless Blender script (`blender -b --factory-startup --python scene.py -- <mode> ...`, spec
driven, solver `time_scale` = speed). Every family finishes through `finish_seq(..., loop=aspect == "short")`.

| Family | Bake | Notes |
|---|---|---|
| `press` | one Blender scene `work/press.blend` + `work/press.json` (schedule, outcomes, events) | scenarios `press`, `roller`; `score.py` is a script run by `family.score` |
| `drop` | one `work/stage_<k>.blend` + `.json` per ladder rung (independent reset sims) | scenarios `hopper`, `height`; CPU Bullet bakes; 5,000-ball stage up to ~2 h |
| `blade` | per material: `work/mpm_<key>.json`, `work/sim_<key>/p_*.ply` (GPU Taichi), then `analysis.json` | scenarios `wedge`, `funnel`; water also gets `b_*`/`s_*` PLY splits (body / spray) |

## Timing model

- **Physics** runs at `speed` x real time: `rigidbody_world.time_scale`, cloth `time_scale`, and an MPM output
  rate of `fps/speed` (60 PLY per sim-second at speed 0.5, played at 30 fps = true slow motion, no interpolation).
  `common.sim_frames(sim_seconds) = round(sim_seconds * fps / speed)`.
- **Camera moves and edit timing** are authored in viewer frames, so slowing the physics never slows the edit.
- **Stage ends are measured, not fixed.** A stage ends at its settle frame + `hold_s` (0.8 s = `HOLD_F` 24
  frames). Settle frame: `mt.activity`/`mt.settle_frame` for rigid bodies (last frame with mean speed above
  max(6% of peak, 0.02 m/s)); kinetic energy for MPM (last frame above 4% of peak for the wedge, 1% for the funnel
  "last real motion"). A breaking stage ends at the break frame + ~1.2 sim-seconds + `hold_s`. Elastic materials
  never settle: the wedge caps a stage at 1.8 sim-s after contact (3.6 s on screen). Funnel stages are capped at
  3.0 sim-s after contact. `verdict_min_s` (1.0 s) is the minimum time the verdict stays on before the stage ends.
- **Why measured ends:** a fixed "at least 1 s after contact" made a jammed clay sit motionless for 1.7 s - a freeze
  that QC rightly failed.
- **Drop height scenario:** the ball is released above the frame, so each stage starts 8 frames before the ball
  falls into view (`stage_start`, `SHOT_TOP_Z` 2.3 m) instead of showing an empty target.

## Files per episode (`episodes/<slug>/`)

```
spec.json                      the editorial contract (tracked)
run.log                        every stage's output, Blender "Fra:"/"| Saved:" lines filtered (tracked)
work/                          bakes + frames (git-ignored)
  press.blend/.json | stage_<k>.blend/.json | mpm_<key>.json + sim_<key>/p_*.ply + analysis.json
  frames_<aspect>/f_XXXX.png   rendered frames (deleted after QC pass unless keep_frames)
  clean_<aspect>.mp4           linear, text-free master (CRF 12) - re-finish without re-rendering
  mix.wav, audio_norm_<aspect>.wav, overlay_<aspect>.json (text_visible_fraction, loop frames)
build/                         short.mp4, wide.mp4 (git-ignored); metadata.json, qc.json (tracked)
```

`finish.frames_or_clean` decodes frames from `clean_<aspect>.mp4` when PNGs are gone, so text/loop/sound changes
never need a re-render (`tools/refinish.py`).

## Spec fields

The fields are defined by each family's `scene.py`/`family.py` and generated by `season/catalog.py`; do not
duplicate them here. Common: `family`, `scenario`, `slug`, `episode` (S1Exx, internal), `name`, `seed`,
`rig` (scenario knobs - the novelty rules treat "same scenario + same rig" as a repeat), `backdrop`. See
`scenario-families-and-uniqueness.md` for the per-family keys.

## Ledger and history

`season/LEDGER.json` = `{"episodes": [...], "longforms": [...]}`. Entry: `slug, episode, family, signature,
fingerprint {family, scenario, rig, materials}, novelty {rules, rejections, new_scenario, nearest, novelty_score,
candidates_rejected, candidates_tried}, release (ISO), status, planned_at, title, calendar, failure, in_longform`.
Statuses: `planned -> building -> scheduled` (filed, awaiting human upload) or `failed`; `built` for hand-built.
`weekly.update_entry` re-reads the ledger before every save (builds run for hours; saving a stale copy once
overwrote other builds' statuses). A replacement takes the id of the failed video in the same slot; failed
builds never consume an episode number. `season/HISTORY.md` is rewritten from the ledger after every change
(table: #, release, status, title, scenario - rig - materials, outcome, notes).

## Release folder and manifest

`file_release` copies `short.mp4 -> video.short.mp4`, `thumb.jpg -> thumbnail.jpg`, `metadata.json`, and writes
`title.txt`, `description.txt`, `upload-manifest.json`: `channel, slug, episode, format "short", scheduled,
timezone, privacy "private", auto_upload false, title, files{name: sha256, bytes}, qc (the short's QC), made_with
(internal provenance: Blender 5.2 + Taichi + CC0 foley, no generative models), status "ready-for-upload"`.
`metadata.json` is a YouTube Data API `videos.insert` body: `snippet{title<=100, description, tags,
categoryId "28"}`, `status{privacyStatus private, selfDeclaredMadeForKids false, containsSyntheticMedia false}`
(stylised CG simulation, not realistic AI media), plus `results`, `key_time_s`. The `made_with` line is manifest
only - never copy it into a viewer-facing field (invariant 8).

## `channel.json` keys

`timing{fps 30, speed 0.5, hold_s 0.8, verdict_min_s 1.0}`; `audio{loudness_lufs -16, true_peak_db -1.0,
room_wet 0.035, room_seconds 0.28}`; `render{short{size [1080,1920], samples 32}, wide{size [1920,1080], samples 24},
keep_frames false}`; `cadence{episodes_per_week 2, release_weekdays [TUE,FRI], release_time 17:00, timezone
Africa/Casablanca, build_weekday SUN, build_time 01:30, family_rotation [press,drop,blade], longform_every_weeks
8, longform_target_s [490,520]}`; `upload{privacy private, categoryId 28, auto_upload false}`; `policy.rule` and
`generative_models_allowed false`. Note: `longform_target_s` is not read by any code (see operations).
Render samples: Cycles OptiX. drop and blade use `render.*.samples` (32 / 24); press uses 48 (Short) / 32 (wide)
unless `spec["samples"]` overrides (jelly transmission needs more than 32; see quality-gate "fireflies"). Previews
render 16 samples with no motion blur; full renders use motion blur 0.35 (press), 0.4 (drop), none for MPM points
(no frame-to-frame correspondence); exposure press -0.4, drop -0.2, blade -0.35.

## Git hygiene (`material-trials/.gitignore`)

Heavy regenerable media is ignored: `episodes/*/work/`, `episodes/*/build/*.mp4|jpg`,
`release-calendar/**/*.mp4|jpg`, `longform/*/*.mp4|jpg|png|wav`, `__pycache__/`. Specs, run logs, JSON results,
the ledger and manifests stay tracked, so the production memory survives while videos are rebuilt on demand
(`make_episode.py`). The `.venv` (about 7 GB with the old research folder's data) must also stay out of git.

## Blender helper library (`engine/mt.py`, runs inside `blender -b --factory-startup`)

Scene/render: `reset`, `use_cycles(samples, denoise)`, `setup_render(size, samples, exposure, motion_blur)` =
Cycles/OptiX with **Khronos PBR Neutral** colour (AgX desaturated saturated materials; rubber read as pastel),
`lens_for(aspect, vertical_lens)` (36 mm vertical sensor fit: wide needs lens x1.35). Materials: `mat_basic`,
`mat_glass`, `mat_jelly` (transmission 1.0, roughness 0.025, coat 1.0, sheen 0.5, metallic 0.5, Fresnel-driven
translucent mix), `mat_steel`, `mat_rubber`, `mat_backdrop`. Objects: `cyclorama`, `box`, `uv_sphere`,
`ico_sphere`, `camera`, `area_light` (hidden from camera and transmission rays), `studio_lights`, `world_color`.
Rigid: `ensure_rbw(substeps 20, iterations 30, time_scale)`, `add_rigid`, `clone_rigid`, `bake_rigid`. Soft:
`rounded_cube_bm`, `add_collision`, `add_pressure_cloth` (cloth + internal pressure = the "satisfying" squish;
`time_scale`). Fracture: `voronoi_cells(bias_point)`, `crack_release`, `show_breaking`/`_cut_states`,
`contact_frame_drum`, `fracture_box`, `glue_cells`. Events: `extract_events` (rising-edge |dv| impacts; Blender
exposes no collision events), `activity`, `settle_frame`. Use `bpy.data` / `obj.copy()` not `bpy.ops` loops for
bulk creation (1,000 `bpy.ops` creations took longer than the bake).
