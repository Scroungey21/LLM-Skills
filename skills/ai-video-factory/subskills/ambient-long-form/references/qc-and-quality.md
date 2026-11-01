# Ambient QC and quality: what is BUILT, what is only DESIGNED, and the 10-hour constraints

Two different things live under "quality gates" for this channel. Keep them separate:
- **Built checks** (section 2): measured by the code that exists today (`full_render.py`, `qc_demo.py`).
- **Designed gates** (section 3): the MASTER-REPORT section 24 quality profile (V/A/C/T/P). These are the rules and thresholds to
  build toward. **None of them is implemented as code.** Most numeric audio values are R04 design hypotheses to be calibrated, not
  measured optima. A video is publishable only if every gate passes or is waived with a written human note (>= 20 characters).

## Contents
1. The 10-hour constraints (files, loudness, loops)
2. Built checks and the measured results of the two masters
3. Designed gates (V, A, C, T, P tables)
4. Contradictions between the designed gates and what was built
5. Human gates

## 1. The 10-hour constraints
- **Duration/size.** YouTube cap: 256 GB or 12 h, whichever is less (>15 min needs a verified account). So "10 h+" means 10:00:00-11:59:xx;
  never >= 12 h (a 12 h+ single video is not uploadable; a live stream over 12 h may not be archived). Gate T3: `duration_s <= 43,200`, `bytes <= 256,000,000,000`.
  Current spec: 1080p30 only; 4K masters (159-204 GB) are out of scope until a 1080p canary proves benefit.
- **Measured masters** (2026-10-13): roommate `final.mp4` 4.36 GiB (4.68 GB; ~1 Mb/s), marble 17.0 GiB (18.25 GB; ~4.1 Mb/s). The earlier R04/MASTER
  sizing of 26-52 GB per 10 h was for photo/parallax content at x264 GOP 15; ours is far smaller because the content is dark/simple. Grain is a
  bitrate bomb on CPU CRF (336 Mbps at x264 crf 18 in R00's test) and is silently discarded by NVENC (9.8 Mbps), so any look that depends on grain/dither needs a visual check of the encoded frames.
- **Segments.** 30-min closed-GOP segments (54,000 frames each at 30 fps) joined by stream copy; audio is one file muxed last. Gate T4: every segment has the exact frame count,
  ffprobe duration matches, concat uses `-c copy` with identical stream parameters.
- **Loudness.** One static gain over the whole file to -24 LUFS, 4x-oversampled limiter at TP -2.0 (limit = TP - 0.3 dB), 48 kHz. Measure on the DECODED AAC, not the pre-encode WAV
  (the AAC encode moved the roommate true peak from the -2.3 dBTP limiter ceiling to -1.9). After any `loudnorm`, always resample back to 48 kHz (a 192 kHz master is a known gotcha; T7).
  YouTube publishes no loudness normalisation target in Help; EBU R128 (-23 LUFS +-0.5 LU, -1 dBTP) is the only sourced anchor.
- **Loops.** Nothing may audibly repeat. Naive listeners can tell a periodic noise waveform from non-repeating noise up to a ~20 s cycle; short noise snippets (<= 4 s) become weeks-long
  memories even unsupervised; long textures (rain, wind) are perceived by time-averaged statistics. So synthesise textures statistically (never-repeating) and give discrete events a
  no-reuse scheduler (shuffle-bag, cooldown, dead time). The claim "never loops" is promised only for the soundscape (repeat probe) and for camera/light (aperiodic); the
  place itself is one authored world per video (a continuous, not looped, picture).
- **Perceptual limits for sleepers.** Awakening odds rise ~1.35x per +10 dBA of indoor Lmax (transportation-noise pooled data); arousal rises with event max level. So events are level-capped
  relative to the bed with slow attacks (>= 150-300 ms for the sleep profile). Noise-helps-sleep evidence is "very low" quality: NEVER make sleep-benefit/health claims; position as background/ambience.
- **YouTube's "Continue watching?" prompt** (Autoplay on: before 30 min mobile, 60 min web, 180 min TV) may fire inside a single 10 h video: untested; needs a 3-4 h unlisted test on TV and phone.
- **Disk/RAM.** Everything on S:; free space on the scratch drive >= the working set before start (gate T8); the 10 h marble sim is ~5 GB in RAM per process (memoised, roll array memory-mapped).
- **Decode time.** A full-file decode of a 10 h file is ~57 min on CPU (R00, 10.5x): budget it before upload.

## 2. Built checks (what the code actually measures)
`full_render.py` / `video.py` / `render_audio.py` / `qc_demo.py`:
| Check | Where | Rule |
|---|---|---|
| Segment duration | `video()` | probed duration within 0.1 s of expected, else RuntimeError |
| Final duration + frame count | `final()` | duration within 0.5 s of total AND video packet count == total_s x 30 exactly |
| Truncated tile guard | `tiles()` | any `tile_*.png` < 2,000,000 bytes is deleted and re-rendered |
| Integrated loudness, LRA, true peak | `qc_demo` (ffmpeg `ebur128=peak=true`) | reported, not gated (no pass/fail) |
| Startle margin | `qc_demo` | max short-term (3 s) LUFS minus integrated, over short-term values > -70 LUFS; reported only |
| Frame luma | `qc_demo` | peak and mean luma of 8 evenly spaced decoded frames; reported only |
| Contact sheet + spectrogram | `qc_demo` | `.sheet.png` (8 frames), `.spec.png` (first 60 s, magma, < 12 kHz) for the human to look at |
| Limiter work | `loudnorm()` | `peak_over_db` = input true peak + gain - TP; how hard the limiter has to work |
| Determinism | design | `zlib.crc32` seeds, pure-function timeline, demo window == full-render span (verified by hand, not by a test script) |
Nothing automatic checks black/freeze frames, repetition, banding, seams (beyond the PSNR spot check done once), burn-in, full decode, speech leakage, provenance, or metadata lint.

Measured results (`final.qc.json`, 10 h, 2026-10-13) and the raw-audio facts behind them:
| | roommate_typing_s11 | marble_machine_s3 |
|---|---|---|
| Integrated LUFS / LRA / true peak | -24.2 / 4.1 LU / -1.9 dBTP | -24.0 / 4.7 LU / -2.1 dBTP |
| Short-term max / startle margin | -19.7 LUFS / +4.5 LU | -19.3 LUFS / +4.7 LU |
| Frame mean luma (8 samples) | 0.9-42.4 (sleep phase ~1) | 22.3-23.5 (approved demo 22.5) |
| Frame peak luma | <= 93 (sleep sample 3) | 247-255 (white marble cores, as in demo) |
| Raw audio before norm | input -54.38 LUFS, TP -24.70, gain +30.38 dB, limiter overshoot 7.68 dB, raw peak 0.058 | input -25.08 LUFS, TP +1.61, gain +1.08 dB, overshoot 4.69 dB, raw peak 1.20 |
| Video/audio | 36000.000 s, 1,080,000 frames, AAC 48 kHz stereo, faststart | same |
Demo (v5) QC for reference: roommate busy window -24.2 LUFS, startle +1.7 LU (v4 figure; v5 audio identical); sleep/wake window -24.4 LUFS, +4.1 LU; marble -24.0 LUFS, TP -2.3, +3.7 LU.
v5 grade (8-frame means, per third): busy window 28.1/31.1/44.8 peak 92 (v4 was 14.0/15.8/24.4 peak 60); sleep/wake window 16.9/20.2/32.5 peak 87.

## 3. Designed gates (MASTER section 24; NOT implemented)
Profile selector per video: `profile in {sleep, focus_study, immersion_tv}`. Series mapping: Night Quarters and Someone's Here = `sleep` (dim/near-black); Slow Machines = `immersion_tv` (screen-on).

### G-V visual
| ID | Rule | Threshold / tool |
|---|---|---|
| V1 | No unintended black/freeze frames | none > 2 s unless declared in `world.json` (do NOT reuse Material Trials' `longest_freeze_s <= 1.0` / `min_mean_luma > 4`: they reject slow dark ambient); `blackdetect`, `freezedetect` streaming |
| V2 | Chunk-seam pop | frame diff at 30-min joins, mean dY < 1.5 % |
| V3 | Visual loop detection | 64-bit dHash of 1 frame / 10 s, all pairs; no Hamming distance <= 6 unless an intentional scene return |
| V4 | Banding | gradient-region luma histogram steps + human spot check on a dark gradient on a 1080p OLED/LCD; dither, not grain (8-bit limited-range SDR) |
| V5 | Persistent static pixels (OLED burn-in) | per-pixel temporal std over 10 min: no region with std ~0 and Y' > 120 for > 10 min; no baked logo/clock/watermark; branding only as <= 3 % APL element drifting >= 20 px every few minutes (HYPOTHESIS thresholds) |
| V6 | Night grade (sleep) | peak Y' <~ 100/255 over most of the frame, warm white point, no large bright areas, slow dim-down over the first 1-2 h; a black-screen variant available |
| V7 | 2.5D artefacts | parallax <= 3 % frame width; depth estimated once per keyframe; human review of worst frames (applies only to the unbuilt 2.5D path) |
| V8 | Keyframe provenance and IP | OCR for text/logos; similarity vs own prior frames and known competitor thumbnails; prompt blocklist (franchise/brand/artist/competitor names) |
| V9 | Distinct world per video | palette, geometry, event vocabulary, pacing differ from the last N uploads (embedding distance + human); thresholds uncalibrated |
| V10 | Sleepability of the first hour | the first 60 min is the best 60 min (quality front-loaded, later hours quieter/dimmer); human first-hour watch-through |

### G-A audio (measure on the DECODED AAC)
| ID | Rule | Sleep | Focus/study | Immersion (TV) |
|---|---|---|---|---|
| A1 | Integrated loudness | -30...-24 LUFS | -26...-20 | -24...-16 |
| A2 | LRA | <= 3 LU | <= 5 | <= 8 |
| A3 | Short-term (3 s) max - integrated | <= +3 LU | <= +5 | <= +8 |
| A4 | Momentary (400 ms) max - integrated | <= +6 LU | <= +9 | <= +12 |
| A5 | True peak after AAC decode | <= -3 dBTP | <= -2 | <= -1 |
| A6 | Event crest (peak - bed RMS) | <= 12 dB | <= 15 | <= 20 |
| A7 | HPF | 25 Hz 2nd order | same | same |
| A8 | Spectral tilt 150 Hz-6 kHz | -3...-4.5 dB/oct, roll-off > 8 kHz | -3...-4 | -2...-4 |
| A9 | Stereo | L/R correlation > 0.2 long-term; mono-sum loss < 3 dB; LF < 120 Hz mono | same | wider allowed |
| A10 | LF energy | unweighted RMS < 120 Hz <= -6 dB re total RMS (HYPOTHESIS; K-weighting under-reports LF) | same | same |
Further audio gates: **A11** no audible exact repetition >= 12 h: constellation-hash probe FAIL if top offset bin >= 400 hits AND >= 8x the median occupied bin; WARN (event reuse) if >= 60 hits and >= 8x; absolute floor 20 s period, engineering default >= 3 min (calibrated on 10 clean probe sets; at 10 h index in 1-h windows, probe each 10-min segment against earlier windows: NOT measured at 10 h).
**A12** event accounting: no variant reused within its cooldown; no two events within global spacing G (sleep: G >= 20 s, <= 3 events/min; HYPOTHESIS); event rate per rolling hour within +-30 % of target.
**A13** statistics drift: per-10-min band energies within +-1 dB for stationary textures. **A14** no transient above the cap, no abrupt spectral change, no silence gap, event attack >= 150-300 ms (sleep). **A15** determinism: re-render of any 60 s block gives an identical md5; stable hashing.
**A16** one gain for the whole render, AAC encoded once, no per-chunk normalisation. **A17** no voice leakage: no intelligible speech in sampled beds (faster-whisper small.en as QA-only detector); presence audio is unintelligible-by-construction "walla".
Calibration anchor: the UNTUNED R04 prototype measured -37.4 LUFS, LRA 4.7, true peak -16.6 dBFS, crest 24 dB, tilt -3.3/-1.6/+5.1 dB/oct (fails A2, A6, A8). EBU R128 is the only sourced loudness anchor.
Repeat probe prototype (R04): hard/cross-faded 30 s loop ~78,000 hits vs median bin ~82; three mixed prime loops (23/29/31 s) 10-16x median; the never-repeating engine peaks ~2.3x median on 3 min, ~20 hits on 1 h vs ~18,000 for a spliced 10-min repeat.

### G-C creative
| ID | Rule |
|---|---|
| C1 | One video = one authored concept; written brief (place, season, time of day, weather, sonic palette, intended use) stored with the render; differs from previous N briefs |
| C2 | Series bible respected; >= 3 of {place archetype, colour palette, sound palette, title noun, thumbnail composition} differ between series; each video stands alone for cold start |
| C3 | Title/description/first frame state place + soundscape in literal words. **Superseded by report-14:** the grammar is `[Place] \| [one sound phrase]`, held constant in E1 (not `[Place] \| [soundscape] \| [use-case] \| 10 Hours`) |
| C4 | Events in-world, rare, low-amplitude, categorically predictable but temporally unpredictable; nothing crossing a startle threshold; no thunder |
| C5 | Honest provenance: description states what is AI-generated, procedural, recorded; no "100 % real / hand-made / no-AI" claim the provenance file cannot back |
| C6 | No health/sleep-outcome claims; no baby/kids framing; no AI "doctor" narrator |
| C7 | No IP/franchise/artist/competitor names or mascots; no third-party melody similarity. Scope: AMBIENT line only (the quiz line is built on franchises; owner takes that copyright risk) |
| C8 | Human approval notes (>= 20 characters `human_contribution_note`) at pre-render and pre-publish |
| C9 | Theme licence check at G0, three tiers: Tier 0 generic nature/elemental/domestic (fireplace, rain, forest, ocean, snow, generic room/vehicle interior) passes automatically; Tier 1 recognisable-design risk (sci-fi/fantasy interiors, period/nostalgia settings, branded-looking objects, screensaver/geometry homages, real named places, music-bearing videos) needs Claude to review brief/prompts/keyframes against franchises, studios, products, logos, architecture, artists, melodies and resolve hits by changing the asset; Tier 2 high risk (explicit IP/style homage, real people/voices, recognisable melodies, trademarked vehicles/devices) needs human sign-off or a rework. `theme_check{tier, findings[], resolution, reviewer, at}` in `ASSET_PROVENANCE.json` (Tier 2 needs `reviewer:"human"`) |
| C10 | Audience/tone (owner rule 2026-10-07): strictly NOT made for kids; "for the most part" everyone-friendly; no sexual or "freaky" themes/memes/titles/thumbnails/quiz hooks, no gore/shock; child-directed framing excluded (preschool characters, "for kids" titles, nursery visuals) because it invites a made-for-kids designation. Applies to ambient AND quiz |

### G-T technical
| ID | Rule | Threshold |
|---|---|---|
| T1 | Container/stream spec | MP4 `-use_editlist 0 -movflags +faststart` (0 `elst` boxes; YouTube says "No Edit Lists"); H.264 High, progressive, 4:2:0, BT.709 limited, CABAC, 2 B-frames, closed GOP; 1920x1080 30 fps; AAC-LC 48 kHz stereo 384 kbps; 5-10 Mbps target (YouTube reference 8 Mbps) |
| T2 | GOP | first upload GOP 15 (half the frame rate, YouTube's recommendation); test GOP 60-150 only after a 30-60 min canary proves it clean. (GOP 15 inflates size 2-7x for slow content; whether YouTube penalises a 5 s GOP is untested) |
| T3 | Duration/size | 10:00:00-11:59:xx; `duration_s <= 43,200`; `bytes <= 256,000,000,000`; never >= 12 h |
| T4 | Chunk integrity | each 30-min chunk exact frame count (54,000); ffprobe duration match; concat `-c copy`, identical parameters; audio muxed last |
| T5 | A/V duration equality | within one AAC frame |
| T6 | Decode integrity | full-file decode (`-f null -`) with 0 errors; ~57 min per 10 h on CPU; extra spot decode at every chunk seam |
| T7 | No 192 kHz masters | after any `loudnorm`, `aresample=48000` |
| T8 | Disk/resources | free space on scratch >= working set; nothing on H: |
| T9 | Reproducibility | `world.json` seed + tool versions + model hashes recorded; re-render of a chunk reproduces identical pixels |

### G-P platform (policy, rights, monetisation)
| ID | Rule |
|---|---|
| P1 | `ASSET_PROVENANCE.json` complete/valid; G4-G14 pass; G1-G3 tool-licence hits are logged warnings only (owner 2026-10-07); C9 `theme_check` present and resolved. Block render/publish on schema, C9 or G4-G14 failure |
| P2 | Attribution block complete for every CC-BY asset used |
| P3 | AI-use flag COMPUTED, not remembered: Yes for any generative-model music; Yes for photoreal AI scenes or altered real places; keep C2PA; stylised non-photoreal visuals and DSP audio = No |
| P4 | Audience "not made for kids" (owner rule); no nursery/lullaby framing |
| P5 | Mid-roll automatic slots OFF for sleep variants; manual slots only at genuine scene transitions for focus/immersion variants (ads waking sleepers is the top viewer complaint) |
| P6 | Canary: upload each new audio family PRIVATELY and read Content ID / ad-suitability "Checks" before publishing |
| P7 | Cadence cap: start at 1-2 uploads/week (a guess); weekly fixed slot in E1 |
| P8 | No active/disputed Content ID claims on used assets at publish; record in `content_id.claims[]` |
| P9 | Monthly reviewer-view audit (most-viewed, newest, highest watch-time + titles/thumbnails/About): can an outsider tell who made this and how, and is it materially different from the previous three? |
| P10 | Tripwires: pause uploads on any policy warning, YPP rejection, or a threshold of Content ID claims; never delete videos before an appeal |
| P11 | Process-capture bundle retained (project files, seeds, node graphs, mixer sessions, raw dated recordings, a 2-4 min "how this was made" script) |
Policy backdrop (R05): YouTube's repetition test is cross-video and template-based; the Spam Policy now names "automated or synthetic mass-production" (added between 2026-04-02 and 2026-10-07); reviewers read the most-watched, newest and highest-watch-time videos plus titles/thumbnails/About; a 13-upload AI-assisted ambient channel was terminated 2026-09 (cause unknown). "Procedural variation a reviewer sampling 3 videos cannot see does not count as materially varied": each video needs a legible, human-authored concept.

## 4. Contradictions between the designed gates and what was built (do not smooth over)
1. **Roommate fails its own sleep profile.** "Someone's Here" is a `sleep` series, but the 10 h roommate master measures LRA 4.1 (gate <= 3), startle margin +4.5 LU (gate <= +3), true peak -1.9 dBTP (gate <= -3, and above the engine's own -2.0 TP target after AAC). Against the `focus_study` column it passes LRA (<= 5) and startle (<= +5) but misses TP (<= -2) by 0.1 dB. Decision needed: tune the audio (lower `EVENT_CEIL`, lower the limiter TP) or declare a different profile. (The limiter ceiling was -2.3 dBTP before the AAC encode, which raised the measured peak to -1.9: set the limiter lower so the DECODED AAC meets the gate.)
2. Marble (`immersion_tv`) passes A1-A5: -24.0 LUFS, LRA 4.7 (<= 8), startle +4.7 (<= +8), TP -2.1 (<= -1).
3. **The masters deviate from T1/T2:** `video.py` uses a 60-frame GOP (`-g fps*2`) where the first upload should use GOP 15; the final mux has no `-use_editlist 0`; a full-file decode (T6) was never run. These are pre-upload gaps (canary uploads exist to resolve them).
4. Also unbuilt: V1-V10, A6-A17 probes, provenance gates, `ASSET_PROVENANCE.json`, `LICENSE_REGISTRY.json`, `world.json`. The scene specs live in code constants, not a `world.json`.
5. Report-14's synthetic-media table and description template assume AI keyframes and a 2.5D engine. The built scenes are Blender renders of CC0 scans with no AI at all, so `contains_synthetic_media` for roommate is an open owner decision (rationale must be written into the manifest either way).
6. The MASTER C3 title grammar and the original E1 table are superseded (report-14, report-12); see `research-findings.md`.

## 5. Human gates
- **G0 (before any 10 h render):** human approves concept sheets + 10-min loop-free pilots + thumbnail archetype sets + frozen thresholds + pre-registration. Both current masters were rendered after the owner approved the v5 demos ("great, proceed").
- **G1 (before upload):** 540p proxy + 3 random 2-min full-res chunks + QC report + a first-hour watch-through (front-loaded quality), thumbnail pick, disclosure decision signed by a human. Human present for the first uploads; private first.
- Rendering and uploading both require human approval; an agent never publishes on its own.
