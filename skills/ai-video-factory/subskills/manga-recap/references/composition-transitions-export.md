# Panel composition, transitions, NLE export and assembly

Compiled 2026-11-01 from V7-REQ-6/7/8, `design.md` §7-9, the shipped Remotion component, `transitions.ts`, `render-cli.mjs` (`--stills`), `nle_export.py`, `api/manga_export.py`, the
export tests and audit-remediation Req 6. Toolkit paths are relative to `ai-video-factory/toolkit/`. `spec` / `code` / *proposal* markers as in
[script-and-narration.md](script-and-narration.md). Rendering basics (Remotion, ffmpeg, JPEG-frame-sequence rule, public dir) are in [rendering.md](../../../references/rendering.md); not repeated.

## 1. The `manga-panel-composition` screen (spec V7-REQ-6.1-6.4, code)

One component, two named elements, **static** (`manifest.max_animation_duration_ms = 0`; `manifests/manga-panel-composition.json` also declares `min_scene_ms 1000`, `max_scene_ms 15000`, `elements_required true`):

| Layer | Content | Rule |
|---|---|---|
| `background_layer` | the same panel image, full-bleed, `object-fit: cover` (cropped, not stretched) | blur **85%** (`blur_pct`), implemented as CSS `blur(blur_pct/100 x 40 px)` = **34 px**; fills the frame behind the panel |
| `foreground_layer` | the panel image, unblurred, centred, `width: <scale_pct>%`, `height: auto`, `object-fit: contain` | `scale_pct` from `scene_energy`: **low 65 / medium 72 / high 80** (`_SCENE_ENERGY_TO_SCALE`, a deterministic map, never a per-call judgement; default medium) |

Frame background is design-token `bg[0]`; if a layer is missing the component draws a neutral placeholder rather than crashing (defensive, not the expected path). `BeatLayer` is imported but is now a **no-op** (`return null`; see section 4).
Code path: screens are built **deterministically with no LLM call** after `asset_curation` (`_generate_manga_recap_screens`): content = `{background_layer:{image_path, blur_pct:85, scale:"fill"}, foreground_layer:{image_path, blur_pct:0, scale_pct}}`; a scene without a resolvable `panel_id` raises `ScriptNotScreenGeneratableError`.
Optional creative refinements (styled frame, consistent grade, a subtle original overlay) are allowed by V7-REQ-6.4 and are **never a substitute for the rights gate**; the engine implemented none of them. Do not describe the blurred backdrop or any edit as transformation or as a way to evade matching.

Canvas and clock: composition `MasterSequence` / CIS path, **30 fps fixed** (hard-coded `FPS = 30`), 1920x1080 (16:9); 1080x1920 only when `aspect_ratio: "9:16"` (see [vertical-recap.md](vertical-recap.md)).

**Code-reading findings to verify on a real still before trusting them** (the archived tests stubbed Remotion; the full chain with real TTS, WhisperX and Remotion never ran, see [current-state-and-open-questions.md](current-state-and-open-questions.md)):
1. *Portrait panels overflow.* The foreground sizes by **width only** (`height: auto`). A 3:4 panel at 72% of 1920 px is 1382x1843 px, taller than the 1080 px frame, so top and bottom are cropped. Proposal: constrain by both axes, `displayed = min(scale_pct x W / panelW, 0.9 x H / panelH)`.
2. *Image path plumbing.* `image_path` is the bare cropped filename (`doc1_p1_1.png`, relative to `MANGA_PANELS_DIR`). `remotion_client._prepare_media_build` inlines only `content.media.local_path`; `render-cli.mjs` passes **no** `publicDir`. No archived code was found that makes a panel file loadable by the page. Fix when you use the toolkit: embed panels as data URIs in the build JSON, or copy them under the bundle's `public/` and reference `staticFile(...)`.

## 2. Transitions (spec V7-REQ-7.2/7.3; code)

- Spec: adjacent screens that **share a page or are the same continuous scene** get an **instant cut (0 ms)**; crossing to a different chapter or an entirely new scene gets a simple transition (short crossfade or wipe). Per-element transitions (background holds, foreground cuts) are allowed via the existing `from_element` / `to_element` mechanism, not required.
- Code (`_manga_transition_type`): `instant_cut` if both screens' panels have the same `page_number`, else `simple_transition`. The "same continuous scene" signal and a chapter-boundary marker **were never wired** (no such field reaches the screens table; `is_pattern_interrupt` means the opposite), so any page turn is a `simple_transition`.
- **Conflict (record, do not smooth over):** `transitions.ts` fades only the types `fade`, `crossfade`, `dissolve` (0.4 s window, clamped to half the screen's duration). `simple_transition` is **not** one of them, so in the archived renderer **every manga transition rendered as a hard cut** and the spec's scene-boundary crossfade never appeared. The renderer treats unknown types as cuts and never throws.
- *Proposal:* emit `crossfade` for scene/chapter boundaries and `cut` otherwise, and keep page-turns within one beat as cuts so a single scene reads continuously. Note for still export: stills are taken at a screen's **start frame**; with a fade-in the opacity at t=0 is 0, so export stills from a frame just after the fade window or export with cuts only.
- Prefer cuts for action sequences (matches the comics grammar of a page turn) and reserve fades for time/place jumps; never fade between two panels of the same scene.

## 3. NLE export (spec V7-REQ-8.3-8.6; code `_export_nle_package`)

Default for this niche is `production_mode = "manual"` (code seed): halt before final assembly, export a package, a human edits in a non-linear editor (the "last human checkpoint"). `automatic` mode instead enqueues a full Remotion render and reaches Gate 2 unchanged.

Steps (idempotent: a `render` step already `completed` is a no-op):
1. `generate_build_json(script, rendering_mode)` - the **same function** automatic rendering uses (RD-105), so v5's Tier F hard block also covers the export; a precondition error returns `advanced=False` with the message (blocks, does not crash the tick).
2. `frame = round(resolved_start_time x 30)` for each screen (`resolved_start_time` is in **seconds**), then **one** `render-cli.mjs <build_json> <frame_dir> --stills=f1,f2,... [--scale N]` call: one bundle, one headless browser, one `renderStill({frame, imageFormat:"png"})` per frame, browser closed in `finally`. Output `{"success":true,"stills":{"<frame>":"still_<n>.png"},"fps":30,"width":W,"height":H}` (string keys; the Python wrapper coerces them to int). **Lossless PNG** deliberately (the stills *are* the deliverable), unlike the JPEG frames of a full render. `renderFrames()` cannot be used because its `frameRange` is one contiguous range.
3. Copy to `screens/screen_001.png`... in order of `resolved_start_time`; scratch frame dir is removed in a `finally`.
4. Copy the processed narration to `audio.wav`; build `subtitles.srt` and `subtitles.vtt` from the alignment (`chunk_into_cues`); write `manifest.json`.
5. `render` step `completed` with `{"kind":"nle_export","export_path":..., "acknowledged": false}`; **no `render_jobs` row** (V7-INV-8). The project reports `awaiting_review` until `acknowledge_nle_export` (the "7th human gate", RD-106).

Package (code path `DATA_DIR/nle_export/project_<id>/`; the design said `nle_exports`):
```
screens/screen_001.png ...        composed stills, background+foreground already baked in (no separate compositing step)
audio.wav                         final processed narration (WAV)
subtitles.srt / subtitles.vtt
manifest.json   [ {"screen_number":1,"image_file":"screen_001.png","panel_id":123,
                   "resolved_start_time":0.0,"resolved_duration_ms":4200.0}, ... ]
```
Manifest gaps: no page/position (only `panel_id`), no fps, no narration text. Add `page`, `position`, `narration`, `scene_energy` in your own manifest (*proposal*) so an editor can work without the database. Requirement: the niche must have a voice profile or `_resolve_audio_and_alignment(resolve_voice_profile=True)` fails (known seed gap).

Console (code): `/manga-uploads` (upload cards + fair-use queue), `/nle-export` (list with acknowledged state), `/nle-export/[projectId]` (per-screen thumbnail grid, audio via the shared `Waveform`, subtitle preview, manifest download, one **Acknowledge export** action that only appears once). The design called for a per-screen grid + waveform + manifest + single acknowledge button; same content, different routes.

## 4. Pan, zoom and visual-change cadence

**Spec / code:** the composition is static. The audit-remediation spec (Req 6, written after v7) required every template-driven component *including* `MangaPanelComposition` to add a visual beat (icon pop, stat callout, or a subtle pan/zoom on the component's own content) every **1.5-2.0 s** once a hold exceeds **2.0 s**, without changing narration timing or total duration, via one shared `BeatLayer`. The shipped `BeatLayer` was subsequently "cleaned up" to render nothing (comment: random pulse overlays, flashes and shaders caused "unnatural visual distractions"). **Conflict:** Req 6 says beats; the code says none. Written as: **no motion in the archived render**, and a still panel held for 6-9 s is the real archived behaviour.

*Proposals for a new channel* (labelled as such; borrowed conventions, not manga specs):
- **Slow push-in/out** on the foreground or the whole composition over the dwell: 3-6% scale change, eased, never beyond the panel's own pixel resolution. This is the usual way an NLE adds life to a still ("Ken Burns"); do it in the editor from the exported stills so the exported PNG stays a clean master.
- **Direction follows the reading flow**: pan toward the next focus (right->left on RTL pages, top->bottom on strips); **never out-and-back** within one panel (HES camera-continuity rule, [qa-gates.md](../../../references/qa-gates.md) §7: hold framing while the focus is the same, move only toward the next part).
- **Sub-panel focus**: to zoom on a speaker or a detail, re-crop from the stored `image_region` at higher DPI ([panel-parsing.md](panel-parsing.md) §7) rather than scaling pixels up; do not change what the panel shows.
- **Tall panels / strips**: constant-velocity vertical scroll that starts and ends exactly at the panel's bounds across the narration.
- **Cut cadence over effects**: keep scene dwell 3-9 s ([script-and-narration.md](script-and-narration.md) §4) and let panel changes, not gimmicks, carry the 1.5-2 s attention rhythm; reaction shots and quick sequences cut faster.
- Captions (shared ZDF-style spec, [audio-captions-music.md](../../../references/audio-captions-music.md) §2) must not cover speech bubbles or the panel's own lettering; at the 16:9 bottom position (90% of height) check each still, since a tall foreground can sit under the caption line.

## 5. Assembly checklist (editor or Remotion)

1. Place each still at `resolved_start_time` for `resolved_duration_ms`; the last screen holds to the end of narration plus a short tail (archived `PRESENTATION_LEAD_IN_SECONDS = 0.0`, `PRESENTATION_TAIL_OUT_SECONDS = 0.5`; a code comment elsewhere says 2.5 s - **SPEC vs CODE, unresolved**, state the value you use).
2. Lay `audio.wav` on the timeline unmodified (no re-stretch; the timings were measured on it); import the SRT/VTT or render captions in the channel style.
3. Add motion per section 4, transitions per section 2, optional music under narration (licensed/owned bed only, ducked, [audio-captions-music.md](../../../references/audio-captions-music.md) §5).
4. Export H.264/AAC, 1920x1080 30 fps (long) and 1080x1920 (Short, [vertical-recap.md](vertical-recap.md)); measure loudness on the final mux; inspect frames ([qa-metadata-release.md](qa-metadata-release.md)).
5. Record in the chapter folder: the package used, editor project file, the final MP4 hash.
