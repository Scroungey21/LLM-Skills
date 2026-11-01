# Shorts and the gameplay ("brainrot") background

Contents: 1 What the Short is · 2 Authoring the Short (rules and gates) · 3 The published composite (v3, v2) · 4 CTA · 5 Gameplay library (schema, policy, rotation) ·
6 Ingesting clips · 7 Lessons and known limits

Format history in one line: v1/v2 shipped two Shorts per subject (clean + gameplay); since the v3 era (2026-09-19) **only the gameplay Short is published**; the clean Short
`video.short.mp4` stays in `output/` as the audited source of the composite. (3D-line Shorts are a different product: see `references/production-3d.md`.)

## 1. What the Short is

The **whole video, summarised** (user review 2026-09-24; supersedes "one idea"): every idea chapter of the long video gets its explanation, compressed, with the same diagrams framed
for the vertical stage. It must stand alone: the first frame/second communicates the hook without the long's context. It ends with the `payoff`, then a `cta` scene saying the full video
is linked below. It is not a trailer or a clip.

## 2. Authoring the Short (v3)

- Size by revision (see `architecture.md`): 3.3/3.4 = 5-9 scenes, 110-185 words, 35-60 s; **3.5 = 5-12 scenes, 60-115 words, 24-45 s** (a ZDF mechanism Short is 24-36 s, ~82 words, speaking from 0.0 s, no title card/intro/outro). Scenes >=20 words where possible (cadence arithmetic), <=25 words per Short scene at 3.5.
- Roles: starts `hook`; no `promise`, `tease`, `endscreen`; ends `payoff` then `cta`; every scene lists `summarizes=[chapter ids]` and together they cover every idea chapter of the long (`validate_package` fails the missing ones).
- The `cta` narration must contain "full video" (e.g. "The full video is linked below."); keep it one quick line, ~2-3 s: the measured pre-fix CTA took ~14% of a ~29 s Short. Do not hold a static CTA for a disproportionate share of runtime.
- The opening still strips the object down: mechanism exposed within the first **2** scenes using `strip-all` (the long uses `strip-1..n` within 3).
- Frame with `fit(diagram, ids, "short", state)`; give a Short its own portrait diagram when the long's does not crop well; every Short shot declares `highlight=` or `focus=`. Labels never below 36 px; subject clear of the right-hand button rail (the published card is 84% so only its rightmost ~40 px, low down, meets the rail).
- Pace at 3.5: shot <=2.5 s (core <=4.5 s), hook moves within 2.5 s, opening state already moving.
- Short title: `short_title`, 20-100 chars, **no ` | `** (stands alone); description via `description_short` (Short hook line, search line, up to 4 sources, `#Shorts` + hashtags, photo credit, Alternative titles, per-scene Timestamps (navigation notes only: do not claim YouTube chapter eligibility), `Full Video: <>`).
- Narration is the same native voice; Short and long use the same music bed. Short pacing defaults: lead-in 0, scene gap 180 ms, tail 450 ms.

## 3. The published composite (`render_causal_brainrot`, ffmpeg, no frames re-rendered)

**v3 (`layout: causal-v3-card-over-gameplay-band`, user review 2026-09-24):**
```
gameplay: scale=1080:1920 (force_original_aspect_ratio=increase), crop 1080:1920, fps 30, eq brightness -0.04 saturation 0.9   (full frame, looped with -stream_loop -1, -ss start)
card:     clean Short cropped to 1080x1470 (its stage, captions and progress bar all sit in the top 1470 px), scaled to 907x1235 (84%),
          padded with a 6 px ink (#132D39) border to 919x1247, overlaid at (80, 54), shortest=1
encode:   libx264 CRF 18 preset medium yuv420p +faststart; audio = exact AAC stream copy from the clean Short (gameplay muted)
```
- The card is **fully opaque**. Until 2026-09-23 it was keyed translucent (paper to ~76% alpha); gameplay then showed through every diagram and light scenes (the escalator's comb plate) all but vanished. Gameplay never shares the diagram's pixels. Gameplay shows full-frame down both sides and across the bottom.
- `brainrot-provenance.json` records layout, clip, `background_start_sec`, clean-Short sha256, gameplay sha256, audio statement and the exact filter graph. Verify decoded-audio identity with the clean Short, full decode, duration, dimensions and frame samples.
- Start offset: `derive_background_start_sec(slug, clip_duration, render_duration)` = 5 s margin + sha256(slug)-derived fraction of the usable span (clip - render - 2x5 s); deterministic across re-renders; returns the margin if the clip is shorter than the render (looping then covers it).

**v2 (`causal-v2-gameplay-translucent-v2`, frozen, Sep 13):** gameplay filled the whole 1080x1920 canvas (no solid sidebars/top filler), brightness -0.08, saturation 0.8; the explanation crop (0,0,1080,1700) was scaled uniformly to 810x1275 and overlaid at (135,24); only the cream `#FCF7EB` was keyed (RGB similarity 0.055, blend 0.025) and alpha remapped `199 + 0.22*alpha` (~78% on paper, 100% on ink/colour); never a global opacity on the explanation; if cream-coloured subject details were hurt a separate background alpha layer was to be rendered instead of raising the tolerance. Superseded by the opaque card for v3.

## 4. CTA

The `cta` scene's captions are replaced by a **"FULL VIDEO LINKED BELOW" pill** (signal yellow `#FFC400`, ink text) with a bouncing arrow pointing at YouTube's related-video link under the card. Studio's Related video field must be set per Short: `youtube-uploader` attempts it best-effort and never blocks on it; check it in Studio. The Short's description carries `Full Video: <>` until a real URL exists; `fill_long_url` replaces it once the long's watch URL is known (and drops the line if no real URL). The long's own description never links to itself.

## 5. Gameplay library (`examples/gameplay-library.json`, schema 1.0)

Schema: `selection` text, `requirements {orientation, min_duration_seconds 90, trim, audio}`, `rights_policy` text, `clips[]` (`id, file, rights_basis, game, source, duration_seconds, orientation_native, policy_reference`), `test_clips[]` (synthetic gradient only; `rights_basis synthetic_test_only`; never production).

- **Rights policy (hard):** a clip's `rights_basis` must be `self_recorded_official_policy` (footage WE captured playing the game under the publisher's written creator-content policy: Minecraft - Mojang Usage Guidelines, monetised gameplay allowed but requires unique content; GTA V - Rockstar's posting policy, same expectation; our narration, diagrams and captions are the "unique content") or `open_source_engine` (genuinely open-source/CC0 engine such as Minetest). There is **no third value**. A TikTok/YouTube repost captioned "no copyright" is **never** acceptable: that label is not a licence grant, and the specific clip is still the reposter's own recording/edit (Content ID/strike risk at either layer). `render_causal_brainrot` hard-fails any other basis.
- Orientation: vertical 1080x1920 preferred; landscape accepted only if a representative cropped frame is inspected at full size first (the center-crop of the 1024x576 Minecraft clip kept the jump path visible). No letterboxing, no burned-in captions/watermarks/UI. Audio always muted.
- Current clips (all self-recorded): `mcparkour1` (Minecraft parkour, ice-tower map, 277.3 s, landscape 1024x576), `gta5-1` (126.1 s), `gta5-2` (355.5 s), `gta5-3` (54.5 s; below the 90 s guidance, registered with a warning, the render loops it so a loop seam is possible), GTA clips are native 576x1024 (a clean 1.875x upscale).
- **Selection:** `clips[PILOTS.index(slug) % len(clips)]` (collision-free while topics <= clips). `PILOTS` order = static dict then discovered packages in directory-sorted order, so the rotation is stable only if clips are appended and topics are not inserted ahead; it is not overridable per package. More clip variety (second/third self-recorded clip) is a known wish.
- Media lives at `hidden-everyday-systems/renderer-public/hidden-systems/gameplay/`; the standing drop folder is `H:\Videos\BR-BG` (a machine-specific location: the real path is the point).

## 6. Ingesting clips

`python hidden-everyday-systems/ingest_gameplay_clips.py [source-folder]` (default `H:\Videos\BR-BG`): copies each new video (.mp4 .mov .mkv .webm) into the gameplay media dir and registers it in the library, probing duration/resolution with ffprobe. Idempotent (skips ids already registered, matched by filename stem; `--force` re-probes/re-copies). Rights are matched by filename substring against `GAME_RIGHTS` (`mcparkour`/`minecraft` -> Minecraft; `gta5`/`gtav` -> GTA V); anything unmatched is skipped with a warning: add a `GAME_RIGHTS` entry only after reading that game's real creator policy, never guess. Clips under 90 s register with a warning. Only ever append to `clips` (never reorder: rotation depends on order). The script's `GAMEPLAY_DIR` points at the old `renderer/public/...` location until repointed (see `operations.md` constants table).

## 7. Lessons and known limits

- A real legibility bug: a fixed `maxHeight: 58%` card cap let tall diagrams spill onto busy footage unreadably; the lasting rule is that no foreground element ever sits on raw gameplay and the card is sized to its content (now a fixed opaque 84% card). Never fix poor visibility by reintroducing a translucent panel; the fix is compositing design (opaque card, outline/shadow, small local chips). Verified across bright sky, dark/busy tunnel and high-motion racing footage.
- Remotion `<OffthreadVideo>` hits a host-specific native compositor crash (0xC0000005) on this machine; v1 used `<Video>` (browser decode) and the v3 composite avoids Remotion video decode entirely by compositing in ffmpeg.
- Delivery metadata does not yet record gameplay rights per delivery beyond `brainrot-provenance.json`/the library; keep `clip` provenance intact.
- Full audio QA on the composite is not separate: the audio is a stream copy of the clean Short's AAC (identity verified), so QA applies to the clean Short. Human listening still required.
- A clean Short is never uploaded in the v3 flow; do not "also publish the normal Short" without the owner asking (v2 did, with a near-duplicate-content risk: the old uploader staggered it 4 hours and used a different title).
