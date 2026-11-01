# Visuals, audio and captions

Contents: 1 CIS in brief · 2 The `atmosphere-narration` contract · 3 What the screen shows (NEW) · 4 Original ambient plates instead of stock (NEW) · 5 Visual filter ·
6 Pass 2 is deterministic · 7 Captions and text on screen · 8 Atmosphere audio and sound design · 9 Render notes · 10 Archived-implementation caveats

Labels: **[A]** archived, **[N]** new guidance, **[R]** repo research. *Uncalibrated* = a starting value to audition.

## 1. CIS in brief [A]

Horror is a **CIS** (Creative Illustration Separation) niche: the script is written first with no visual decisions (`component=""`, no cues), then separate passes decide visuals: **Pass 2** `screen_generation`
(one `screens` row per narration beat), **Pass 3** `screen_timestamp_insertion` (real start/duration from audio alignment), then `screen_validation`, **Pass 4** `transition_authoring` and `transition_validation`,
then `render`. Step chain (`CIS_STEP_NAMES`): ingestion_match, scoring, scriptwriting, editor_critique, fact_check, fact_correction, asset_curation, tts, screen_generation, alignment, subtitle_export,
screen_timestamp_insertion, screen_validation, transition_authoring, transition_validation, render, metadata. `horror_stories` is `rendering_mode_locked` to CIS (V8-REQ-4.1). The CIS pass design is v5
(`V5-REQ-*`); its shared summary lives in the lead's CIS reference if present, and in `git show pre-skill-reduction:` for the source (see [data-model-and-archived-implementation.md](data-model-and-archived-implementation.md)).

## 2. The `atmosphere-narration` contract [A]

One screen type for the whole niche (`category="template_driven"`, `backing_component="atmosphere-narration"`, V8-REQ-6.1), two named elements. Manifest (`toolkit/manifests/atmosphere-narration.json`):
`max_typing_speed_cps=0`, `max_nodes=0`, **`min_scene_ms=2000`, `max_scene_ms=30000`**, `elements_required=true`.

| Element | Specified behaviour | Detail |
|---|---|---|
| `foreground_textbox` | Transparent textbox; text reveals progressively **at narration speed from the real WhisperX word timestamps** (`alignments.word_timestamps`), never a synthetic typing speed (V8-REQ-6.2) | The word list per screen is windowed **server-side at build.json time** by **absolute-time overlap**: a word is in if `w.start < screen_end and w.end > screen_start` (`_windowed_words`). `WordTimestamp.scene_index` must never be used - CIS builds have no `scenes` array (RD-131, V8-INV-9; test `test_windowed_words_overlap_semantics`). `duration_ms=None` -> unbounded forward. |
| `background_layer` | Blurred, license-clear Tier 0-2 footage, contextually matched to the segment, **rotating through a pool** rather than looping one clip; no clip holds longer than `background_variety` (V8-REQ-6.3) | Split across passes (RD-131): **Pass 2** selects only the matched **pool** (needs no timing); **build-json time** expands pool -> ordered schedule `{asset_library_id, hold_ms}` summing exactly to the screen's now-known `duration_ms`, each `hold_ms <= background_variety`, cycling the pool for long screens (`_expand_background_schedule`). A zero/negative/non-numeric `background_variety` falls back to **4000 ms** (an operator-editable field once caused an infinite loop; `test_expand_background_schedule_never_hangs_on_bad_variety`). |

Strategy-bundle values [A, `seed.py`]: `component_set=["atmosphere-narration"]`, `visual_filter="crt_scanlines"`, **`background_variety=4000`** (ms; "long enough to read as a deliberate shot rather than a
flicker, short enough that a multi-minute screen visibly rotates"), `shorts_cta_style="link_to_full_video"`, `rendering_mode="cis"`, `rendering_mode_locked=true`.

Behaviour details worth keeping: pool rotation is offset by `beat_position % len(pool)` so consecutive short screens do not all start on the same clip (a real bug caught by `test_generate_horror_stories_screens_rotates_pool_across_beats`);
an empty pool still yields valid renderable content (`{"background_layer": []}`), never a crash; `background_layer` entries carry `asset_library_id`, not a path (section 10).

## 3. What the screen shows (NEW [N])

The archive reduces the visual to "text over a rotating blurred backdrop". For a channel that must look like authored work (R4), define the visual grammar explicitly:
- **Backdrop = place, not decoration.** Each scene's plate matches the narrated place/time/light (kitchen at 3 a.m., stairwell, tree line). Plates change on narrative shifts, not on a timer alone.
- **Dark, low-contrast, slightly out of focus** so captions read and the plate never competes with the voice (the archive's "background never becomes the visual focus").
- **Show the threat** (case digest [R]): the climactic beat gets a plate in which the wrong thing is *visible but not centred* (a figure at the end of a corridor, a door open that was shut). One per video; hold it longer than the
  rotation limit if the beat is the break (an explicit, recorded exception to `background_variety`).
- **Text on screen = captions only.** No chapter cards, title cards, lower thirds, channel bugs or emoji. The archived component itself stopped rendering its own textbox because it duplicated the global Captions layer (section 10).
- **Consistency:** one palette (desaturated, one accent), one grain/filter setting per channel, one caption style.

## 4. Original ambient plates instead of stock (NEW [N], with a conflict)

**Conflict.** V8-REQ-6.3 specified "blurred, license-clear **stock** footage (Tier 0-2)". The never-stock rule (`../../../references/agent-principles.md` §2) is scoped to Etcherr871, not to this niche. But two other
facts argue against stock here: (a) report-05 rates stock footage used by many channels as "reuse optics" (Pexels MEDIUM, [R] §4.2/§6.2) and the Spam-policy example names "repetitive ... imagery across many videos" ([YT-08]);
(b) the archived asset pipeline never actually served footage (section 10). **Recommendation written here:** make the backdrop **original per-video plates**, and treat stock/library clips as the exception.

How to build a plate library for a story:
1. Claude writes `plates.json` from the script: per scene `{scene_index, place, time_of_day, light, mood, motion, tags[]}`; group scenes into 6-14 distinct plates per 10 minutes (about one new plate per 45-90 s, plus
   re-use of a place's plate with a different crop).
2. Produce plates with a method whose licence and provenance you can record: self-made illustration/paint-over, a Blender render of a simple set (fits the repo's rendering tools), or local generation with a **commercially-licensed
   weight** (report-05 §6.3: FLUX.1 [schnell] Apache-2.0, Qwen-Image Apache-2.0 OK; FLUX [dev]/klein-9B, MusicGen etc. are non-commercial traps). Log tool, weight, version, prompt, seed per plate in the provenance file. Generated
   photoreal "places" are a disclosure grey zone (R6): disclose, or keep plates clearly illustrated.
3. Slow motion in code, not in the asset: drift/parallax/zoom (Remotion), blur and vignette, so one plate yields many seconds of non-static picture.
4. **Three-view inspection** of every plate (`../../../references/qa-gates.md` §7): full resolution, contact sheet, inside the real composition. Reject malformed anatomy, warped hands/faces, accidental text/logos,
   alpha halos, generic diffusion sheen, real-looking identifiable people.
5. If a library clip is used anyway: Tier 0-2 only, licence recorded (`asset_library` fields: `source`, `rights_tier`, `license_reference`, `attribution_text`, `verified_at`), attribution in the description, and never the same
   clips across many videos.

## 5. Visual filter [A]

`visual_filter` is a strategy-bundle preset: `crt_scanlines` | `vhs_distortion` | `film_grain` | `none`; default `crt_scanlines` for horror, `none` elsewhere, operator-overridable per project (V8-REQ-6.6).
**Invariant (V8-INV-3, RD-120):** the filter is a React/CSS overlay **inside the Remotion tree** (`VisualFilterOverlay` wrapping `MasterSequence`'s children), never an `ffmpeg -vf` flag - an ffmpeg-only filter
would make the live preview (`@remotion/player`) silently differ from the export. Reference parameters (`toolkit/renderer/src/components/VisualFilterOverlay.tsx`; all pure functions of the frame so frames render
independently):

| Preset | Implementation |
|---|---|
| `crt_scanlines` | repeating 1 px dark line every 4 px, `mix-blend-mode: multiply`, opacity 0.35, drifts one line-pair every 60 frames (about 2 s at 30 fps) |
| `vhs_distortion` | red `#ff2040` and cyan `#20e0ff` full-bleed layers, `screen` blend, opacity 0.18, opposing X offsets of 2 px plus a sine-sum jitter (breathing fringe), plus a scrolling noise band at opacity 0.1 |
| `film_grain` | inline SVG `feTurbulence` (baseFrequency 0.9, 2 octaves, `stitchTiles`), seed `frame % 64`, `soft-light` at 0.35, rasterised at 320x180 and CSS-scaled up (about 30x cheaper than full-res turbulence) |

Use the filter as a **style choice** for a coherent look. Do not describe or tune it as a way to avoid detection or matching: YouTube's Spam policy names "detection evasion ... heavy filters, cropping" (report-05
[YT-08]). Check that the filter does not reduce caption legibility on phones (frame inspection at the 9:16 size).

## 6. Pass 2 is deterministic [A]

`generate_screens_for_script` short-circuits for the horror niche (`_generate_horror_stories_screens`): every narration beat becomes one `atmosphere-narration` screen; **no LLM call** (nothing left to decide - one screen
type, deterministic content); if the `atmosphere-narration` screen type is not seeded it raises `ScriptNotScreenGeneratableError`; pool queried **once per script** from the project's kept `video_clip` shortlist.
This is why the omp parallel-dispatch machinery was irrelevant to horror in practice: there is no bulk LLM screen work to fan out. In a file-based channel the equivalent is Claude (or a script) writing
`screens.json` from `plates.json` - still no per-screen model call.

## 7. Captions and text on screen

- **Archived [A]:** the global `Captions` layer in `CisSequence` shows the same words with an absolute-time reveal; the niche's own `foreground_textbox` was disabled in the toolkit component to avoid duplicate text.
- **Default for a new channel [N]:** follow the decided house spec (`../../../references/audio-captions-music.md` §2): Montserrat Bold lowercase, white with dark outline and soft shadow, 1-3 word chunks (<= 18 characters),
  **no coloured active word**, no Arial/Arial Black; 16:9 position 90% of height and 72 px; 9:16 position 70%, 84 px; chunk minimum 250 ms, clear after a pause > 400 ms. This spec was decided for HES (owner, 2026-10-05); for horror it is a
  default, not an owner decision - confirm with the owner, because a typewriter/monospace look is common in the genre ([R] chat-story study notes typewriter captions on creepy micro-stories).
- Captions must never cover the plate's focal point or the on-screen threat; keep clear of the Shorts UI (top about 8%, bottom about 20%); deliver `captions.long.srt` / `captions.short.srt` from the alignment.
- Alignment: forced alignment on the final audio where available (WhisperX in the archived engine; faster-whisper matched to the script elsewhere); fallback timing is never presented as aligned (`voice-tts.md` §4).

## 8. Atmosphere audio and sound design

**Archive [A]:** no horror-specific audio rules exist. The niche would inherit the technews audio defaults (not verified for this niche's path): a project-owned generated ambient bed (`audio/bgm.py`, deterministic selection by
`niche_key:script_id` hash, ducked about -32 dB under narration, -27 dB in safe swells) and -14 LUFS / -1.0 dBTP. The V8 spec's "atmosphere" is purely visual. Everything below is **NEW [N]**; each value is *uncalibrated* until auditioned.

**Dry vs atmospheric - the decision.** Two valid poles: (a) *dry/crisp*: voice + near-silence + stings (the Material Trials mix: no beds, no reverb tails); (b) *atmospheric*: a continuous bed. Recommended default: **(b)-light** - a
very quiet, slowly changing room tone/drone that tracks story phase (baseline: domestic hum; escalation: thinner, one element removed or added; held breath: bed drops to near-silence; break: sting; aftermath: bed returns lower).
Reason: pure silence between sentences makes TTS seams audible, while a loud bed masks a deep, partially monotone voice and invites the "same background music across videos" pattern.

| Layer | Policy |
|---|---|
| Voice | dry (script §5); loudness anchor of the mix |
| Bed | **project-owned only**: DSP-synthesised drones/room tone or your own field recordings. No third-party "no-copyright horror music"; no compilation of library tracks (reuse policy, report-05 [YT-01]); no pitch/speed-shifted third-party audio (detection-evasion language). If a generative music model is used: licence-checked (ACE-Step Apache-2.0/MIT OK; MusicGen/AudioGen/Stable Audio traps, report-05 §6.3), and **disclose AI music**. Vary the bed per video (key, layers, seed) so videos are audibly distinct. |
| SFX | recorded **CC0** foley only (Freesound CC0 filter; CC-BY only with credit; NC/Sampling+ never), licence logged per file (`LICENSES.csv` pattern, `../../../references/agent-principles.md` §4). Each effect lands on a **visible or narrated event**; none during the held breath |
| Stings / jump | one major sting per jump; a short rise (1-3 s) is allowed; peaks go through a limiter so the **final-mix true peak stays <= -1.5 dBTP** |
| Music | none by default (melodic music is the Content ID and sameness risk). If used, same stem processing as HES: high-pass 150 Hz (2 stages), -6 dB dip at 1.5 kHz, ducking |

**Mix measurements (record the target, measure the final muxed file):**
- Integrated loudness: pick and record one target; recommended **-16 LUFS, true peak <= -1.5 dBTP** (HES values) or -14 LUFS / -1 dBTP (technews/YouTube reference). Never mix two targets in one catalogue by accident.
- Bed under voice: measure octave bands 63 Hz-8 kHz over frames where the narrator speaks (the `audio_bands.py` method, `audio-captions-music.md` §5). HES requires music >= 18 dB (22 dB in 250 Hz-4 kHz) under the voice; an
  atmospheric horror bed is meant to be more audible, so start with **>= 12 dB under in the 250 Hz-4 kHz speech bands** (*uncalibrated*) and tighten if listening shows masking. A deep male voice (fundamental about 85-180 Hz)
  overlaps drones: high-pass the bed (150 Hz) rather than raising the voice.
- Encode: AAC 256 kbps; re-measure after encoding (one Material Trials episode's true peak rang to +5 dBTP after encode, `audio-captions-music.md` §4).
- Listen to: the opening, the held breath, the jump, a mid escalation, the ending; check masking, loop seams, bed starting/ending abruptly, sting clipping.

Do not market or tag these as sleep content; if the video is ever used by sleepers, the ambient channel's startle-margin and -24 LUFS rules (AMB, `qa-gates.md` §11) are the relevant sibling, not these.

## 9. Render notes

- Renderer: `toolkit/renderer` Remotion; **JPEG frame sequence via `renderFrames()` then system ffmpeg mux, never `renderMedia()`** on this Windows host (`rendering.md` §2). Composition `MasterSequence`; CIS build via `CisSequence`.
- Dimensions: the CIS composition defaults to 1920x1080 and uses `calculateMetadata` to switch to 1080x1920 when `CisBuildJson.aspect_ratio == "9:16"` (V8-REQ-7.5); technews' delivered masters were 2560x1440 / 1440x2560.
  Decide and record the delivered size per channel.
- Fonts via `@remotion/google-fonts` (narrow weights/subsets to avoid the documented load timeout); thumbnails 1280x720 (`rendering.md` §8).
- Live preview ([A], V8-REQ-7.*): `@remotion/player` can embed the same composition (`toolkit/renderer/src/compositions.ts` is the side-effect-free export surface); the preview gets narration through an optional
  `previewAudioUrl` prop that the CLI render never sets. Only relevant if the console is restored.

## 10. Archived-implementation caveats (important)

1. **The background layer never showed real footage.** `asset_library` has no playable-media path field (`source` is a provenance description); resolving `asset_library_id` into a loadable clip was "separate,
   not-yet-built plumbing". The toolkit's `AtmosphereNarration.tsx` therefore renders a **procedural placeholder backdrop** per entry (seeded hue, drifting sheen bands, two slow rings, scanlines, vignette, a `FEED-<id>` corner tag).
   The spec said `clip_path`; the code carries `asset_library_id` (code wins). The seeded asset library had two `video_clip` rows total, so even the data side could not supply a varied pool.
2. **`foreground_textbox` is not rendered** (contradicts V8-REQ-6.2): the global Captions layer shows the same words. The windowing logic still exists in `build_json.py` and is reusable.
3. **`slow_atmospheric` was never audible** (script §5).
4. `visual_filter` and 9:16 aspect handling are real and were verified by real frame renders (VERIFICATION_REPORT).
Treat the archived component as a **wiring reference**, and build the real backdrop layer ([N] section 4) before shipping.
