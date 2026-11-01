# Rendering (Remotion, ffmpeg, Blender, fonts, thumbnails)

Contents: 1 Where each channel renders · 2 The bundled Remotion renderer · 3 How the public dir is chosen (and the gaps) · 4 Render recipes ·
5 ffmpeg usage · 6 Blender / MPM for the simulation and 3D channels · 7 Fonts · 8 Thumbnails · 9 Visual QA · 10 Contradictions and open questions

## 1. Where each channel renders

| Channel | Engine | Canvas / fps | Entry |
|---|---|---|---|
| technews (news-explainer) | Remotion `MasterSequence` | 2560x1440 landscape, 1440x2560 vertical Short, 30 fps (reviewed test outputs) | `toolkit/renderer/render-cli.mjs` (needs an engine-produced `build.json`) |
| HES 2D (legacy, stopped 2026-10-10) | Remotion | 1920x1080 long, 1080x1920 Short, 1280x720 thumbnail, 30 fps | `hidden-everyday-systems/hidden_systems_production.py` -> `visual-system/render-frames.mjs` (causal v2/v3) or `toolkit/renderer/hidden-render-frames.mjs` (v1 `PilotRoot`) |
| HES 3D (current focus) | Blender 5.2 EEVEE + ffmpeg | long 16:9 + Short 9:16 | `hidden-everyday-systems/experiments/zdf-3d-long/pipeline/` and `production-3d/` (own docs: everyday-systems subskill) |
| Material Trials | Blender 5.2 Bullet/Cycles (OptiX) + Taichi MLS-MPM + ffmpeg | Short + a wide cut (long-form compiled from wide cuts) | `material-trials/make_episode.py`, `weekly.py` (subskill `physics-simulation-shorts`) |
| Etcherr871 | ffmpeg + OpenCV/Pillow + Frame Studio card | 1080x1920 Shorts | `etcherr871/clips.py` (subskill `clip-card-shorts`) |
| ambient | Blender + numpy/scipy/OpenCV + ffmpeg, files on `S:/ambient` | 1920x1080, 30 fps, AAC 48 kHz, 10 h (1,080,000 frames) | `ambient-channel/engine/full_render.py` (subskill `ambient-long-form`) |

Pick the engine by content, not habit: Remotion for code-drawn/React compositions with captions and diagrams; Blender for physical simulation or
3D mechanisms; ffmpeg alone when the footage already exists (found clips, ambient loops).

## 2. The bundled Remotion renderer (`ai-video-factory/toolkit/renderer/`)

- `package.json`: name `@ytpipeline/renderer`; Remotion **4.0.499** pinned for `@remotion/cli`, `@remotion/google-fonts`, `@remotion/gif`, `remotion`;
  React 18.3, zod 4.4.3, TypeScript 5.5; workspace dependency `@ytpipeline/design-tokens` (colors/typography/motion tokens, imported by nearly every
  component). Scripts: `build` (renders the Placeholder), `preview` (`remotion studio src/index.ts`). `@remotion/bundler` and `@remotion/renderer`
  are imported by the `.mjs` scripts but not declared; they resolve only from the hoisted `@remotion/cli` dependency tree.
- `remotion.config.ts`: `setVideoImageFormat("jpeg")`, codec h264, overwrite on. Known issue recorded in it: Remotion's bundled
  `@remotion/compositor-*/ffmpeg.exe` crashes on this Windows host (0xC0000005 / access denied, likely AV interference), and Remotion v4 cannot be
  pointed at another ffmpeg. **Therefore every pipeline renders a JPEG frame sequence with `renderFrames()` and muxes with the system ffmpeg; nobody
  uses `renderMedia()`.** Keep it that way.
- `src/` layout:
  - `index.ts` -> `Root.tsx`: compositions `Placeholder`, `MasterSequence` (technews, `calculateMetadata`), stills `ChannelAvatar` (800x800),
    `ChannelBanner` (2560x1440; props channelName/tagline).
  - `compositions.ts`: side-effect-free export surface (`MasterSequence`, `CisSequence`, `BuildJsonSchema`, types) so a Next.js Player can import it
    without `registerRoot`.
  - `types.ts`: zod `BuildJsonSchema` = the frozen contract of the engine's render input (`script_id`, `niche_key`, `component`, `scenes[]` with
    `narration`, `duration_ms`, `cues`, `start/end`, `audio {wav_path,duration_seconds}`, `words[]` word timestamps with score, plus a CIS screen variant).
  - `components/`: `MasterSequence`, `CisSequence`, `SceneRenderer`, `CisScreenRenderer`, `Captions`, `ChapterCard`, `CyberTerminal`, `AILogicNode`,
    `FailureSchematic`, `ClaimEvidenceCompare`, `VerdictCard`, `CitationBadge`/`SourceCitation`, `EvidenceMedia`, `MangaPanelComposition`,
    `LlmAuthoredAnimationRuntime`, `SponsorSegment`, `TimelineMarker`, `LoopGauge`, `AtmosphereNarration`, `AssetSting`, `BeatLayer`,
    `VisualFilterOverlay`, plus `transitions.ts`, `responsive.ts`, `mechanics.ts`; `assets/` (`AbstractedLogo`, `CveBadge`, `PaperCard`, `cache.ts`);
    `fonts.ts` (Inter Tight + JetBrains Mono, weights 400-700, latin only, via `@remotion/google-fonts`; narrowed on purpose to avoid the documented
    "loads every weight" timeout); `manifests.ts`; `structured-log.mjs`.
  - `hidden-systems/` (`index.ts` -> `PilotRoot.tsx`, `DoodleVideo.tsx`, `DoodleIcon.tsx`, `IconAtlas.tsx`, `types.ts`): the **legacy HES v1** composition
    (paper background, PNG icon atlas via `staticFile("hidden-systems/assets/<name>.png")`, per-topic compositions `<Topic>-Long/-Short/-Thumbnail`
    with `FPS` 30, 1920x1080 / 1080x1920 / 1280x720, optional `backgroundVideo` prop for brainrot Shorts). **Do not copy its captions**: it hard-codes
    `Arial` and colours the active word `#FFD85C`, which the owner banned on 2026-10-05 (see `audio-captions-music.md`).
- `render-cli.mjs` (technews): `node --experimental-strip-types render-cli.mjs <build_json> <frame_dir> [--scale N]`, or `... --stills=n1,n2,n3 [--scale N]`.
  Needs Node >= 22.6 (it imports `BuildJsonSchema` straight from `./src/types.ts`). Full mode uses `renderFrames()` (never `renderMedia`), `imageFormat jpeg`,
  composition id `MasterSequence`, and prints **one JSON line** the engine parses: `{"success":true,"frameCount":N,"fps":N,"width":N,"height":N,"framePattern":"element-%0Nd.jpeg"}`
  (pad width = `String(frameCount-1).length`, never a hard-coded `%03d`). Stills mode: `renderStill()` per frame into `still_<n>.png` (lossless, one bundle,
  one browser, closed in `finally`). Failure: `{"success":false,"error":...}`, exit 1. No retry inside (queue retry was the engine's job).
- `hidden-render-frames.mjs`: `node hidden-render-frames.mjs <entry.ts> <composition-id> <output-dir> [input-props-json]`; bundles with
  `publicDir = <this script's dir>/public`, `selectComposition`, `renderFrames` JPEG quality 90, concurrency 4; prints progress lines and a final
  `{"frameCount","fps","width","height"}` JSON. The optional 4th arg merges JSON props into `defaultProps` (brainrot `backgroundVideo`/`backgroundStartSec`).
  The sibling `hidden-everyday-systems/visual-system/render-frames.mjs` is the same script for the current causal composition (also accepts `@file.json` props).

Install/run: `npm install` from the directory that holds the workspace root (the repo used npm workspaces `console, renderer, packages/*` with a hoisted
root `node_modules`; `pnpm` is **not** installed and `pnpm-lock.yaml` is a stub); Node >= 20 (22.x installed, v22.15.1). Studio preview:
`npx remotion studio src/index.ts` from `toolkit/renderer/`.

## 3. How the public dir (assets) is chosen

Remotion serves static files from the `publicDir` passed to `bundle()`; components read them with `staticFile("<path under public>")`. After the 2026-11 reduction every HES
mechanism points at **`hidden-everyday-systems/renderer-public/`** (laid out exactly as the old `renderer/public/` was: `hidden-systems/{assets,fonts,gameplay,textures,<slug>/}`, `music/`):
`toolkit/renderer/hidden-render-frames.mjs` defaults there (override with env `YT_PUBLIC_DIR`); `visual-system/render-frames.mjs`, `v3/render-stills.mjs`, `preview.mjs` and
`hidden_systems_production.py` (`PUBLIC`, `MUSIC_DIR`, `PUBLIC_DIR`) were repointed. `render-cli.mjs` (technews) passes **no** `publicDir`, so Remotion falls back to `<cwd>/public`.
Never copy gigabytes of media into the toolkit.
What is gitignored / how to re-provision it: heavy regenerable media (`assets/raw`, `assets/guides`, `assets-v2-candidates`, `*.parts/`, narration mp3/wav) is
rebuilt by the pipeline; `music/*.mp3` is re-downloaded from each track's `download_url` in `examples/music-library.json`; **`gameplay/*.mp4` is the owner's
own footage (265 MB), not re-acquirable: never delete it, ask the human if it is missing.**
## 4. Render recipes

- **HES (2D)**: `hidden_systems_production.py validate | audio [--force] | render | preview | remix | rethumb | all`, each with `--slugs <slug>`; steps write a JPEG
  frame dir, then ffmpeg mixes narration + music stem (+ SFX stem) and encodes. Long and Short share one music bed. Delivery set per topic is in `release-calendar.md`.
- **technews**: engine render queue -> `render-cli.mjs` -> frames -> ffmpeg mux with a short presentation lead-in/tail-out; deliveries archived under
  `technews/output/<niche>/<theme>/<title--render-job-id>/`. The engine is removed from the working tree; restore from git tag `pre-skill-reduction`
  (details in the news-explainer subskill).
- **Material Trials**: `python make_episode.py <slug> [--from score|render|meta] [--aspects short] [--keep-frames] [--remix]`; stages are skipped when their output
  exists (delete `episodes/<slug>/work/` to re-simulate); renders never overwrite frames so a crashed render resumes.
- **Resumable long jobs**: chunked renders with their own lock/log (HES 3D `BLENDER.lock`, ambient `full_render.py --stages ...`, MT per-stage skip). Start detached with
  logs for hour-long jobs; check for an existing producer first, never run two against one lock.

## 5. ffmpeg usage (house patterns; ffmpeg/ffprobe at `C:\bin\`, override via PATH)

- **Probe:** `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 <f>` (also `-show_streams -show_format`).
- **Concat narration scenes:** write a concat list (`file '<path>'` lines, silence-gap WAV between scenes) and run
  `ffmpeg -y -f concat -safe 0 -i concat.txt -af loudnorm=I=-16:LRA=7:TP=-1.5 -c:a libmp3lame -b:a 192k out.mp3` (HES). Measure WPM on *speech only*, then add
  lead-in/tail padding by baking silence into the file (so `-shortest`/frame-count math stays consistent).
- **Music stem then mix (HES):** build the bed as its own file: `-stream_loop -1 -i bed.mp3`, `atrim`, 2-stage 150 Hz high-pass, -6 dB dip at 1500 Hz (2.5 octaves),
  `volume`, `afade` in 1.5 s / out 2.0 s, `sidechaincompress` keyed by the narration (threshold 0.05, ratio 2.5, attack 60 ms, release 600 ms, knee 6), export PCM WAV; then
  `amix=inputs=N:duration=first:dropout_transition=0:normalize=0,loudnorm=I=-16:LRA=7:TP=-1.5`. See `audio-captions-music.md` for the gates.
- **Final encode:** video `-c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p` (or `-c:v copy` when frames are already encoded), audio `-c:a aac -b:a 192k -ar 48000`,
  `-shortest -movflags +faststart`. Material Trials uses a two-pass loudnorm plus a final ceiling limiter and 256 kbps AAC (so true peak stays below -1 dB after encoding).
- **Loudness check:** `ffmpeg -hide_banner -i f -af loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json -f null NUL`; `-af volumedetect`; `-af silencedetect=noise=-45dB:d=0.15`.
- **Contact sheet:** `fps=1/30,scale=480:-1,tile=4x4`; frame extraction at scene transitions and 0.25-0.6 s apart for motion review.
- **Gameplay-background Shorts (HES):** full 1080x1920 gameplay with `-ss start`/loop, H.264 CRF 18, **original AAC copied** (`-c:a copy`) so audio is bit-identical to the clean Short.
- Never use ffmpeg `atempo`, Rubber Band, resampling or pitch shifting on HES narration; see `voice-tts.md`.

## 6. Blender / MPM (simulation and 3D channels)

- **Blender 5.2** at `C:\Program Files\Blender Foundation\Blender 5.2\` (Material Trials overrides with env `MT_BLENDER`). Material Trials: Bullet rigid bodies, cloth,
  Voronoi fracture, Cycles on OptiX; Taichi `MLS-MPM` (`families/blade/mpm.py`) on CUDA; drop bakes are CPU. HES 3D: EEVEE (32 samples, half-res raytracing, fast GI,
  motion blur 0.5, view transform Standard -0.5 EV), **1 Blender unit = 1 mm**, computed kinematics, Poly Haven HDRI + ambientCG textures (CC0).
- **One Blender at a time:** HES 3D takes `experiments/zdf-3d-long/BLENDER.lock` via `blender_lock.run_blender(...)`; the owner's own jobs (`S:/ambient`) share the GPU: never touch
  them, never run alongside. MPM and Cycles can overlap but slow each other (a 5,000-ball bake plus a render roughly doubles render time).
- **Python for Blender work:** Material Trials uses the Python 3.13 venv with Taichi/numpy/scipy/Pillow (`environment-setup.md`); Blender's own Python supplies `bpy`/`bmesh`/`mathutils`.
- The detail (scenario novelty checks, material looks, colliders, fracture rules, pacing, QC thresholds) is in the `physics-simulation-shorts` and
  `everyday-systems-explainer` subskills; ambient Blender scenes in `ambient-long-form`. The Blender MCP tools (`execute_blender_code`, etc.) are an optional interactive aid;
  inspect the scene first, never assume.

## 7. Fonts

- **technews:** Inter Tight + JetBrains Mono through `@remotion/google-fonts` (weights 400-700, latin).
- **HES:** Montserrat (Bold captions; ExtraBold/Black thumbnails), TTFs in `<public>/hidden-systems/fonts/` (SIL OFL 1.1, licence file alongside, downloaded with owner approval),
  also embedded as `visual-system/v3/fonts-data.ts` (generated, do not edit). Never Arial/Arial Black for captions.
- Download fonts only with approval and keep the licence file next to them; prefer OFL fonts.

## 8. Thumbnails

- 1280x720 PNG (technews, HES; Material Trials ships `thumbnail.jpg`); inspect at full size and at 168x94 / ~10-15 % scale (the sidebar size where long text turns into grey lines).
- One dominant subject, strong contrast, minimal copy, readable on mobile, faithful to the video; no tiny labels, clutter, false UI, glow, generated gibberish, misleading alarm imagery.
- **HES rule (2026-10-05):** thumbnail text = the title's question shortened to **2-4 words, <= 28 characters, ends in `?`, capitals**, Montserrat Black, cream/white with one yellow `#FFD21F`
  key word, thin dark outline + soft shadow, left, vertically centred; gate `validate_thumbnail_question`. Picture: the real licensed photo graded dark, a big dark round port with a teal ring
  on the right holding the lit x-ray drawing of the payoff moment. A second `thumbnail2.png` (A/B) is mandatory for 2D v3 packages (see HES `THUMBNAIL_POLICY.md`, which the everyday-systems subskill carries).
- Shorts thumbnails (YouTube): a frame of the video; Etcherr871 builds `thumbnail.png` from the card.
- Render stills with `npx remotion still <entry> <composition-id> <out.png> --public-dir=<dir> --props=<file.json>` (HES does this) or `renderStill()`.

## 9. Visual QA (every channel)

Extract frames at the hook, every scene/state transition, one second after, mid-scene, near the CTA and the ending; inspect actual pixels (a viewer that displays images): correct subject
and data, readable captions/headlines, safe margins, no clipping/placeholder/gibberish, vertical layout separately checked (a 16:9 crop is never assumed safe in 9:16), motion continuity.
Verify three times for HES (gates before narration, proof stills, post-render frame sequences) as the everyday-systems subskill details. Objective checks (dimensions, fps, codecs, duration,
loudness, freeze, luma, loop seam) are listed per channel in `qa-gates.md`.

## 10. Contradictions and open questions

- Install the renderer with `npm install` in `ai-video-factory/toolkit/` (workspace root `package.json` covers `renderer` and the bundled `packages/design-tokens`). The legacy HES `visual-system/` scripts resolve `@remotion/*` from `hidden-everyday-systems/node_modules` (moved there from the old repo root; reinstall it with `npm install` of the Remotion 4.0.499 packages if it is ever deleted).
- The bundled `hidden-systems/` composition is the superseded v1; the live HES composition is `hidden-everyday-systems/visual-system/` (causal v2/v3) and, for new work, Blender.
- Remotion render sizes quoted from old docs: technews 2560x1440 (docs) vs. HES 1920x1080; Material Trials resolution is not recorded here (read `channel.json`).
