# Architecture: versions, revisions, data flow, modules

Contents: 1 Folder layout · 2 Version matrices (visual system, revision) · 3 Data flow · 4 The package (editorial source of truth) ·
5 Module map · 6 Delivery files · 7 Legacy and non-runnable tools · 8 Superseded-rules register · 9 Old doc to new reference map

## 1. Folder layout (repo root = `<repo>`)

`<repo>/hidden-everyday-systems/` is the channel's data and state (owned by the HES agent only). Do not recurse blindly: `output/`,
`release-calendar/`, `backup/`, `examples/` (80 dirs), `renderer-public/` are large.

| Path (under `hidden-everyday-systems/`) | What it is |
|---|---|
| `hidden_systems_production.py` | CLI: `audio validate preview render remix rethumb all`. Loads every `examples/*/package.json` |
| `pipeline_v3.py` | v3 constants, ALL editorial/visual/physics gates (`validate_package`), timing estimate, description builders |
| `authoring_v3.py` | Python authoring DSL: `Package`, `Diagram`, `State`, `fit`, `cam`, `step`, `callout`, `visual` |
| `kinematics_v3.py`, `diagram_geometry.py` | closed-loop motion maths; world-space boxes/stage framing shared by authoring and the framing gate |
| `motion_check.py`, `attachment.py`, `audio_bands.py`, `sfx_v3.py` | physics gates, attached-parts gate, music/sfx-under-voice gate, sound-effect synthesis |
| `metadata_format.py`, `visual_contract.py` | permanent description/tag rules; v2 mechanism/state contract |
| `ingest_gameplay_clips.py` | register gameplay-background clips |
| `examples/<slug>/package.json` | **editorial source of truth** per topic (plus generated `render.long.json`, `render.short.json`, captions, `animation-plan.md` on v2) |
| `examples/music-library.json`, `examples/gameplay-library.json` | music and gameplay libraries (schemas in `operations.md`, policy in `shorts-and-brainrot.md`) |
| `output/<slug>/` | deliverables and QA (see section 6); `output/catalog-order.json` = canonical topic order for tools |
| `production-batches/<batch>/topics/<topic>.py` | v3 topic authoring scripts (they write `examples/<slug>/package.json`); `references/<slug>/REFERENCE.md` = research per topic |
| `production-batches/2026-09-19_26/` | the escalator bar + REDO-BRIEF + scoring; `2026-10-06_22/` = remaster batch (`batch.json`, 34 subjects) |
| `visual-system/` | Remotion compositions: `index.tsx` (registers v2 `GhostSystem-*` and v3 `GhostSystem3-long/short/thumbnail`), `v3/` (Video3.tsx, diagram.tsx, materials.json, fonts), `components/` (v2 mechanisms) |
| `pipeline-versions/v2/` | frozen copy of the v2 pipeline (produced the Sep 13-18 releases); v2 packages still build unchanged |
| `assets/thumbnail-photos/` | licensed thumbnail photos + `provenance.json` (keyed by slug) |
| `release-calendar/` | `LEDGER.json`, `schedule_release.py`, `<YYYY-MM>/<DD>/<slug>/` day folders, `youtube-uploader/` (live uploader) |
| `uploader/` | older Firefox/Puppeteer uploader (pre-v3 flow) |
| `renderer-public/` | Remotion `--public-dir`: `hidden-systems/{fonts,gameplay,textures,assets,<slug>/...}` and `music/` (channel media; created by the repo reduction) |
| `production-3d/`, `3Dassets/`, `experiments/zdf-3d*` | the Blender 3D line: see `references/production-3d.md` |
| `experiments/`, `concepts/`, `chat-stories/`, `tests/`, `backup/` | research, prototypes, a separate chat-story tool, regression tests, old pipeline snapshots (`backup/old/2026-10-17_pre-whyside-upgrade/`) |

`visual-system/` files: `index.tsx` (Root), `Video.tsx`/`types.ts` (v2), `render-frames.mjs` (JSON-by-file frame renderer, avoids Windows command-length limits), `preview.mjs` (v2 scene stills), `qa_delivery.py`, `finalize_metadata.py`, `migrate_pilots.py` (one-time v2 migration, not a production dependency), `reference-baseline.json` (v2 source/video hashes at documentation handoff: a changed hash means review the change, not auto-reject); `components/` = `EverydayMechanisms.tsx`, `HeatScene.tsx`, `NaturalBird.tsx`, `TrapScene.tsx`; `v3/` = `Video3.tsx`, `diagram.tsx` (renderer, highlight, x-ray look), `types.ts`, `fonts.ts` + `fonts-data.ts` (embedded Montserrat bytes), `materials.json` + `make_textures.py`, `render-stills.mjs` (`node render-stills.mjs <composition-id> <props.json> <out-dir> <frames> [--scale=0.5]`). There is no README in `v3/`.

Shared tools live in `ai-video-factory/toolkit/` (renderer project, tts-dots, voicestudio, docker-compose). Python = `<repo>/.venv/Scripts/python.exe`.

## 2. Version matrices

Packages written under every era still load; gates branch on `visual_system` and, within v3, on `revision`. Always check which a package is.

### 2a. Visual system (`package.visual_system`)

| Value | Era | Layout / content | Captions | Short | Delivery |
|---|---|---|---|---|---|
| (absent) `legacy-editorial` | Sep 1-12 | Remotion `renderer/src/hidden-systems` icon-atlas (26 then 51 FLUX icons), 1920x1080 / 1080x1920, headline + icons + question list | 10-word (long) / 6-word (Short) pages, active word yellow | clean + brainrot (translucent card; later paper-keyed) | video.long/short/short.brainrot, thumbnail(+thumbnail2 real photo) |
| `causal-v2` | Sep 9-18 | `visual-system/Video.tsx` + `components/` (TrapScene, HeatScene, NaturalBird, EverydayMechanisms); 1000x940 SVG diagram; mechanism/state named in package | 5-word pages, active word highlighted | both Shorts required; brainrot = `causal-v2-gameplay-translucent-v2` (cream keyed to ~78% alpha) | + package.json, visual-system.json, captions.short.srt, description.short.txt, brainrot-provenance.json |
| `causal-v3` | from Sep 19 | data-driven diagrams (parts + states) rendered by `visual-system/v3/`; opening teardown; cue-word steps | **ZDF style since 2026-10-05**: Montserrat Bold, lowercase, white + dark outline, 1-3 word pop-in chunks, no coloured word | **only the gameplay Short publishes**: opaque 84% card over full-frame gameplay | see section 6 |

### 2b. v3 revision (`package.revision`, string compare)

`authoring_v3.Package` default is `"3.4"`; **every new or re-paced topic must pass `revision="3.5"`**. `CLARITY_REVISION="3.3"`, `FINISH_REVISION="3.4"`, `PACE_REVISION="3.5"`.

| Quantity | pre-3.3 (`LONG_WORDS` etc.) | 3.3 / 3.4 (`C_*`) | 3.5 (`C35`, current) |
|---|---|---|---|
| Long narration words | 1,180-1,650 (docs said 1,050) | 650-950 | **380-650** |
| Long content seconds | 345-490 (6-8 min) | 185-300 | **110-200** |
| Long scenes | >=18 | 10-26 | **14-40** |
| Long chapters | 6-10 (intro + 5-9) | 4-6 (intro + 3-5 ideas) | 4-6 |
| Short words / seconds | 55-150 / 20-58 | 110-185 / 35-60 | **60-115 / 24-45** |
| Short scenes | 4-9 | 5-9 | **5-12** |
| Words per scene | 6-60 | 8-45 | **5-28** (and `PACE` caps a Short scene at 25) |
| Hook | <=40 words | <=30 words | <=30 words, moves within 2.5 s |
| Glossary budget | n/a | 4 long / 2 Short (`P.term`) | same |
| Sentences | n/a | each <=20 words, mean <=13, Flesch-Kincaid grade <=6.5 per script | same |
| Short role order | ends payoff/recap, no tease | ends `payoff` then `cta` (says "full video ... linked below"); `summarizes` covers every idea chapter | same |
| Long role order | hook, promise within 4, >=2 loops, twist at 30-80%, recap, tease, endscreen | hook, promise within 3, >=1 loop, ends `tease` + `endscreen` | same |
| Extra gates | editorial_lint (hedging, titles) | + references, motion (no fade-loops), framing, mentions, arrow timing; from 3.4 also materials, sounds, attachment, continuity, thumbnail question | + `motion_check` physics, `validate_pace` |

Pacing limits at 3.5 (`PACE`): long shot <=3.5 s (core shot <=6.0 s), Short shot <=2.5 s (core <=4.5 s); core scenes take 25-60% of runtime; first shot must change within 2.5 s; the opening state must already be moving. Pacing defaults (`PACING_DEFAULTS`, ms): long lead-in 250, scene gap 380, tail 900, end-hold 18,000; Short lead-in 0, gap 180, tail 450, no hold. Overrides per variant `pacing: {...}` limited to lead_in/scene_gap/tail <=2000-3000 ms, end_hold <=20,000.

## 3. Data flow (v3)

```
production-batches/<batch>/topics/<topic>.py  (authoring_v3: sources, claims, diagrams, scenes, thumbnail)
        |  python <topic>.py  -> prints "valid" (all gates) and writes examples/<slug>/package.json
        v
preview  -> silent proof stills at every camera move (estimated timing 204 WPM), contact sheets, thumbnail still
audio    -> per-scene narration (OmniVoice via VoiceStudio by default) -> native WAV parts -> concatenated mp3,
            ASR word timing (proportional fallback), render.long.json / render.short.json, captions.*.srt
        |  re-run the topic file so follow-highlights/arrow timing resolve from REAL word timings, then validate
validate -> package + timing gates (cadence 165-240 WPM, durations, arrow timing, provenance)
render   -> Remotion frames (visual-system, composition GhostSystem3-long/short) -> ffmpeg mux with music bed + sfx stem
            -> long, clean Short, gameplay Short (ffmpeg composite), thumbnail + thumbnail2, delivery text files, QA-REPORT.json
schedule_release.py <slug> <date> <HH:MM> -> copies the delivery subset into release-calendar/<YYYY-MM>/<DD>/<slug>/ + LEDGER entry
(owner uploads; youtube-uploader is a tool the owner runs)
```
`remix` rebuilds the soundtrack on existing frames; `rethumb` rewrites delivery text and both thumbnails without re-rendering.

## 4. The package (editorial source of truth)

`examples/<slug>/package.json`, written by `Package.write()`. Top-level fields: `schema_version "3.0"`, `pipeline_version "v3"`, `revision`, `visual_system "causal-v3"`,
`channel "GhostSystem"`, `metadata_format "question-mechanism-v1"`, `slug`, `topic`, `title`, `short_title` (20-100 chars, no `" | "`), `alternate_titles` (exactly 3),
`hook_line` (<=150), `short_hook_line` (<=150), `search_line` (<=200), `accuracy_scope` (<=600), `next_tease` (<=50), `hashtags`, `tags` (unique, <=480 combined chars),
`voice` (provider label `"dots"`, `voice_id hidden-systems-informational`, seed), `sources[]`, `claims[]`, `glossary[]`, `diagrams{}`, `thumbnail`, `thumbnail_photo`, `music`, `sounds[]`,
`variants.long {chapters[], scenes[], pacing?}`, `variants.short {scenes[]}`.

- A **source**: `id, publisher, title, url (http/https), type, accessed, used_for`. A **claim**: `id, claim, source_ids (all must exist), confidence, qualification`.
- A **scene**: `id` (lowercase `[a-z0-9-]`), `role` in {hook, promise, explain, loop, twist, payoff, recap, tease, endscreen, cta}, `chapter`, `headline` (3-36 chars; used only for timestamps), `narration`, `claim_ids`, `visual`, optional `summarizes` (Short), `core` (3.5).
- A **visual**: `diagram`, `state`, `camera`, `highlight`, `focus`, `point`, `callouts`, `steps[]` (cue-word changes), authored `before/change/after` strings (required).
- **Diagram**: `view [x,y,w,h]` (default 0 0 1600 900), `title`, `references[]`, `scale`, `kind` ("exterior" for the opening), parts (rect, fluid, circle, ellipse, line, path, polygon, polyline, spring, gear, arrow, label, group), `states{}` of keyframed `tracks` on part props (`tx ty rot scale op sw fill stroke dashoffset flow` plus geometry props), `teardown`. Part ids lowercase `[a-z0-9_-]`; >=4 parts and >=1 animated state per diagram; labels 1-32 chars, size >=30 world units.
- `render.*.json` = generated timing/provenance, never an editorial source. Narration changes invalidate timing: regenerate (per-scene cache keys on voice_id, reference sha256, base seed and narration sha256).
- `lint_allow: [...]` can whitelist a specific hedge phrase; use rarely and say why.

## 5. Module map (what to open for what)

| Need | File |
|---|---|
| Change a gate / threshold | `pipeline_v3.py` (`C_*`, `C35`, `PACE`, `validate_*`, `JARGON`, `HEDGE_PATTERNS`, `SOUND_PRESETS`) |
| Author or debug a topic | `authoring_v3.py`; reference implementation `production-batches/2026-09-19_26/topics/inside_an_escalator.py` |
| Renderer camera/caption/thumbnail behaviour | `visual-system/v3/Video3.tsx` (`CAP`, `SHORT`/`LONG` stages, `cameraAt`, `GhostThumbnail3`) and `diagram.tsx` (`HIGHLIGHT`, `DIM_WASH`, `ACCENT`) |
| Stage boxes / label floors for the framing gate | `diagram_geometry.py` (`STAGE`, `MIN_LABEL_PX`, `SHORT_RIGHT_RAIL_PX`) - must match `Video3.tsx` |
| Narration providers | `hidden_systems_production.py` (`omnivoice_scene`, `dots_scene`, `generate_audio`) |
| Gameplay composite / QA | `render_causal_brainrot`, `qa_report_v3` |
| v2 mechanism contract | `visual_contract.py` (`STATES`) + `visual-system/components/` |

## 6. Delivery files (`output/<slug>/`, v3)

Published set (`pipeline_v3.DELIVERY_FILES`, copied by the scheduler): `video.long.mp4`, `video.short.brainrot.mp4`, `thumbnail.png`, `thumbnail2.png`, `captions.long.srt`,
`captions.short.srt`, `description.txt`, `description.short.txt`, `titles.txt` (line 1 chosen title, then 3 alternates), `tags.md`, `sources.md`, `claims.csv`, `package.json`,
`brainrot-provenance.json`, `script.long.txt`, `script.short.txt`, `visual-system.json`, `QA-REPORT.json` (+ `THUMBNAIL_LICENSE.txt` when a photo is used).
Kept in `output/` only: `video.short.mp4` (clean Short = audited source of the gameplay composite), `narration.*.mp3`, `render.*.json`, `music.json`, `stems/music.<variant>.wav`, `stems/sfx.<variant>.wav`, `preview/`.
Formats: long 1920x1080, Short 1080x1920, thumbnails 1280x720, 30 fps, H.264 CRF 18 yuv420p, AAC 192k/48 kHz; target program loudness -16 LUFS, LRA 7, true peak -1.5 dB (QA measures `loudnorm`).
(Verified in `hidden_systems_production.py`: video `libx264 -preset medium -crf 18 -pix_fmt yuv420p`; audio `aac 192k -ar 48000`; the narration mp3 is `loudnorm I=-16:LRA=7:TP=-1.5` then `libmp3lame 192k`.) Long videos carry an 18 s end-screen hold after the narration (room for YouTube end-screen elements).
`QA-REPORT.json` checks per variant: dimensions, fps, h264+aac, duration vs timing (+/-0.25 s), duration policy, native voice, cadence 165-240 WPM, true peak < 0, `music_credit` (exact attribution string present in the description), `music_under_voice`, `sfx_under_voice`. It records `human_listening_required: true`: the tool session cannot hear audio, and a human listening pass is never implied by a green report.

## 7. Legacy and non-runnable tools

- **ComfyUI / FLUX is gone.** `generate_comfy_editorial_assets.py`, `generate_comfy_geometric_assets.py`, `regenerate_accuracy_guided_assets.py`, `generate_ab_thumbnail_styles.py`, `test_comfy_*.py`, `generate_channel_avatar.py`, `generate_channel_banner.py`, `generate_avatar_bg_candidates.py` need a local ComfyUI (removed from the repo; the old install lived at `comfyui/`). They produced the v1 icon atlas (26 then 51 hand-inked FLUX.1-schnell icons, accuracy-guided for transformer/pole transformer/river/meter) and channel branding. Do not rely on them. The v1 icon names (`SUPPORTED_ICONS`) only matter for legacy-editorial packages. Icon generation lessons that survive: reject baked-in brand text, malformed topology, disconnected parts, alpha halos; inspect at full size, in a contact sheet and in the real composition.
- `compose_channel_avatar.py`, `compose_channel_banner*.py` (PIL only) can still re-compose branding from existing art: the approved avatar is the midnight-navy/coral badge (2026-09-04); YouTube banner safe area 1546x423 centred on a 2560x1440 upload.
- `generate_real_photo_thumbnails.py` is the v2 "Mark Rober" real-photo thumbnail2 generator (white Anton text). Superseded for v3 (see register).
- `generate_voice_candidates.py`: one-off dots.tts voice bootstrap; not part of production.
- v2 `causal-v2` mechanism components (twelve mechanisms) are documented in `visual-system.md`; v2 stays frozen in `pipeline-versions/v2/`.

## 8. Superseded-rules register (newest dated user decision wins; code breaks ties)

| Topic | Older statement (do NOT follow) | Current rule |
|---|---|---|
| Voice backend | "dots.tts is the only backend; reject Kokoro/Chatterbox/Qwen" | OmniVoice (VoiceStudio) default since 2026-10-05; dots only via `HIDDEN_SYSTEMS_TTS_PROVIDER=dots`; Kokoro/Chatterbox/Qwen3-TTS still banned. Packages must still carry `voice.preferred_provider: "dots"` (generate_audio refuses otherwise): it is a schema label, the env var picks the engine. See `operations.md` |
| "No denoising" | invariant "no reverb, enhancement, denoising" | `omnivoice_scene` posts `denoise:"true"` and `effect_preset:"raw"`: an unresolved contradiction with the old invariant. Flagged, not resolved; the owner approved the OmniVoice output after A/B |
| Thumbnail text | word-for-word title question (2026-09-27) / headline Anton (v2) | title's question shortened to 2-4 words ending `?`, <=28 chars, one yellow key word (2026-10-05); gate `validate_thumbnail_question` |
| Thumbnail look | PIPELINE-V3 table: thumbnail2 = "saturated cobalt"; THUMBNAIL_POLICY: yellow lit part; thumbnail.png = illustrated Remotion + thumbnail2 = Mark-Rober photo | cobalt and bright-photo restyles rejected 2026-10-05; composition = dark-graded licensed photo + round x-ray port; `thumbnail2.png` = same composition on the dark plate with no photo (code); lit part in the port is orange (2026-10-10), yellow only for text |
| Lit part colour | signal-yellow trial 2026-10-05 | back to orange: fill tinted 62% toward `#FF8A3D`, outline `#B8460E`, glow `#EB673D` (2026-10-10) |
| Dimming | "highlights dim everything else to 50%" | other parts dimmed by a 38% wash toward paper (`DIM_WASH`) |
| Captions | 10/6-word pages, active word yellow (v1); 5-word pages (v2); Arial 800, orange word (early v3) | ZDF style (above) for v3; orange/Arial captions explicitly rejected ("linked to Claude and AI slop") |
| Short scope | "one idea" Short (3.3 first cut) | 09-24: the Short is the whole video summarised, ends `payoff` then `cta` |
| Short stage/composite | 1080x1010 stage, clean card stacked above a 450 px gameplay band; later translucent keyed card | stage 1080x1160 (top 140 px), clean card cropped to 1080x1470 then scaled to 907x1235 with a 6 px ink border at (80,54) over full-frame gameplay; card never translucent |
| Headlines | headline + chapter chip on screen | removed 2026-09-24 ("AI-sloppy"); headlines only feed timestamps. Long stage 1920x900 (top 30), Short stage 1080x1160 (top 140) |
| Overlay cards | `overlay=` question/stat/compare/list | schema accepts them, renderer draws none (2026-09-20) |
| Music | 3 beds @0.065; "13 beds"; "22-25 dB under narration" | 12 active tracks + 1 rejected; `relative_volume 0.13` after per-track `gain_db` levelling to -18 LUFS; the gate is `audio_bands` margins (>=18 dB under per octave band, >=22 dB in 250 Hz-4 kHz, loudest 5% >=8 dB under) |
| Scene word cap (Short) | PACING.md "28" | code: 28 per scene at 3.5 generally, `PACE` max 25 for Shorts (the stricter applies) |
| Release slots | 02:00/11:00/17:00, then 02:00/17:00 (two subjects/day) | 2D scheduler allows 02:00/17:00 from 2026-09-13 and rejects a third subject per day; the 3D line uses 17:00 (Shorts) and 20:00 (longs) via its own scheduler (see `references/production-3d.md`) |
| Art policy | "generate art via ComfyUI FLUX; never SVG placeholder" (profile, Sep 1) | superseded 2026-09-09: v2/v3 use code-drawn diagrams; natural subjects via reviewed stills; diffusion video never |
| Which uploader | `uploader/README.md` (Firefox; brainrot Short first, normal Short +15 min; state in `output/release-calendar/.../day-plan.json`) | `release-calendar/youtube-uploader/` is the v3-aware one: v3 uploads long + ONE Short, state in `<day>/<slug>/upload-state.json`. The `uploader/` README describes the older v2 flow |
| Validation message | "190-260 WPM" in an old error string | the gate is 165-240 WPM |
| `examples/README.md` | mentions Qwen3-TTS and Rubber Band | stale; ignore |

Both older docs are recoverable: `git show pre-skill-reduction:hidden-everyday-systems/PIPELINE-V3.md` (same for the other deleted docs).

## 9. Old doc to new reference map

| Old file | Now |
|---|---|
| `skills/hidden-systems-video-pipeline/**` | this subskill |
| `hidden-everyday-systems/PIPELINE-V3.md` | `editorial-and-quality.md` (rules, verify-three-times), `architecture.md` (revisions), `shorts-and-brainrot.md`, `metadata-and-thumbnails.md`, `visual-system.md` |
| `GHOSTSYSTEM_QUALITY_PROFILE.md` | `editorial-and-quality.md` (hook/script/retention rules), `topic-selection.md` |
| `THUMBNAIL_POLICY.md` | `metadata-and-thumbnails.md` |
| `SESSION_REPORT_2026-09-06.md`, `COORDINATION-NOTE.md` | durable parts in `editorial-and-quality.md`, `operations.md` (GPU rule, cache keys), `current-state.md` |
| `visual-system/{README,ANIMATION-DESIGN-SPEC,EVERYDAY-MECHANISMS,mechanism-plan.template}.md` | `visual-system.md` |
| `research-output/*.md` | `topic-selection.md` |
| `examples/{README,shorts-brainrot-plan}.md`, `*-library.json` | `shorts-and-brainrot.md`, `operations.md` |
| `production-batches/*/{REDO-BRIEF,BRIEF,PACING,REPACE}.md`, `experiments/style-research/STYLE.md` | `editorial-and-quality.md`, `visual-system.md`, `metadata-and-thumbnails.md` |
