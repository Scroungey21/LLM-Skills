# Ambient engine: architecture, scenes and the `full_render.py` stage model

Source of truth is the code in `ambient-channel/engine/` (gitignored, no version control; see `operations.md` for the
backup rule). This file explains how it fits together so you can change it without breaking the two invariants that
make a 10-hour render possible: **everything is a pure function of (seed, absolute time)** and **every output piece
is written to a `.part` name and renamed only when complete**.

## Contents
1. Design stance
2. Engine file map
3. The audio model (block renderer)
4. The visual model (frame function)
5. Scenes: `roommate_typing`, `marble_machine`, planned others
6. The `full_render.py` stage model
7. Caches and their keys
8. Invariants you must not break

## 1. Design stance
- One video = one seeded, deterministic scene. The scene module owns the timeline (events), the audio voices and the
  visual frame function. Nothing is looped: events come from a scheduler (Poisson arrivals with dead time, shuffle-bag
  variants, semi-Markov activity states), so the 10 hours never repeat.
- Why procedural: a 10 h video is ~1,080,000 frames. AI video is ~75-540x more expensive than a procedural renderer
  (R04), Remotion writes a JPEG per frame (wrong tool), per-frame Blender is too slow. So the engine pre-renders
  short Blender plates/passes once (cached on S:) and composes every frame in numpy/OpenCV, streaming raw RGB to NVENC.
- Audio is synthesised only (modal synthesis, filtered noise, DSP). No sampled audio, no generative music, no TTS.
- Textures/models are real CC0 Poly Haven scans, fetched ONLY via `engine/fetch_textures.py`, which writes the licence
  log `S:/ambient/tex/LICENSES.json` (provenance). No generative image/video model is in the current scenes
  (`keyframes.PROMPTS` is empty; `keyframes.py` + ComfyUI are legacy and ComfyUI must never run beside dots.tts).
- "Someone's Here" style scenes use a dim night grade: no static bright element (OLED burn-in), nothing startling.

## 2. Engine file map (`ambient-channel/engine/`)
| File | Purpose |
|---|---|
| `full_render.py` | Resumable, checkpointed full-length render (stages tiles/audio/video/final/qc). The only thing to run for a real video. |
| `pilot.py` | Renders ONE demo window of a scene: audio -> loudnorm -> video -> mux. `python pilot.py <scene> <seed> <seconds> <out_dir> [--lufs -24] [--start S]`. |
| `render_audio.py` | Block audio renderer (60 s blocks, 2 s bed crossfade, parallel workers) + `loudnorm()` (static gain + limiter). |
| `video.py` | `encode()` pipes raw RGB frames into `h264_nvenc`; `mux()` for demos. |
| `qc_demo.py` | Quick QC of an mp4 (loudness, startle margin, 8-frame luma, contact sheet, spectrogram). Also used as the full-render `qc` stage. |
| `scheduler.py` | `Event`, `ShuffleBag`, `poisson_times` (dead time), `activity_states` (semi-Markov), `enforce_spacing`. |
| `dsp.py` | Synthesis primitives: coloured noise, Butterworth, `env_ad`, `modal` bank, `impact_exciter`, `wall_filter`, `pan_stereo`, `decorrelate`, `small_room` IR. `SR = 48000`. |
| `marble_tiles.py` | Driver for the Marble Machine's Blender world tiles + sprites; owns `TILES_VERSION`, `tile_dir()`, `SPRITES`. |
| `fetch_textures.py` | Poly Haven CC0 fetcher + licence log. |
| `keyframes.py` | Legacy ComfyUI/FLUX keyframe driver; `PROMPTS` is empty, kept as a driver only. |
| `scenes/roommate_typing.py` + `_visual.py` | Scene #11. |
| `scenes/marble_machine.py` + `_sim.py` + `_visual.py` | Scene #3 (pymunk physics -> audio events + frames). |
| `blender/dorm_room.py`, `exr_to_npy.py`, `marble_tiles.py` | Blender 5.2 headless renderers (run with `blender -b --factory-startup -P ... -- args`). |
| `requirements.txt` | numpy 2.5.3, scipy, soundfile, pymunk 7.3.0, opencv-python, pillow. |
Outside the repo: `S:/ambient/run_demos.py` (demo driver), `S:/ambient/run_keyframes.py` (STALE: calls the removed `dorm_bunk` key; delete or rewrite).

External tools (hard-coded paths in the code): Python `S:/ambient/venv/Scripts/python.exe` (own venv); ffmpeg/ffprobe
`C:/bin/ffmpeg.exe`, `C:/bin/ffprobe.exe`; Blender `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe`.
GPU RTX 5060 Ti 16 GB shared with the owner's apps; 31 GB RAM.

## 3. The audio model (`render_audio.py`)
A scene module exposes:
- `build_timeline(seed, duration) -> list[Event]`: the WHOLE event timeline, computed once (cheap even for 10 h).
- `bed(seed, block_index, t0, n, duration) -> (n, 2)`: continuous layers (room tone, hum, rolling rumble) for one block.
- `voice(seed, event_index, event) -> (m, 2)`: one event's sound starting at `event.t`.
- `MAX_VOICE_S`: longest possible voice (block overlap). Optional: `EVENT_CEIL` (event-bus peak ceiling), `bus_ir(seed)` +
  `BUS_DRY_WET` (one reverb on the whole event bus).

Rendering: 60 s blocks (`BLOCK_S`), rendered in parallel (`ProcessPoolExecutor`, `--workers`). Beds get a 2 s equal-power
crossfade overlap (`XFADE_S`) so independent per-block noise joins seamlessly. Events are added OUTSIDE the crossfade,
each sample exactly once (never doubled at a seam). `_limit_events()` is a smooth lookahead limiter on the event bus with
50 ms padding each side so its gain is seamless across blocks; the bus reverb tail is overlap-added into later blocks.
A window with `start > 0` primes the previous block's crossfade carry and reverb tail, so it is **sample-exact** against the
same span of a longer render.

Loudness (`loudnorm()`): measure with ffmpeg `loudnorm` (print_format=json), then apply ONE static gain
(`target - input_i`) + `aresample=192000` + `alimiter(limit = TP-0.3 dB, attack 1, release 60, asc)` + `aresample=48000`,
output 24-bit PCM. Why not plain `loudnorm`: it silently switches from linear to dynamic (pumping) mode when the gain would
push true peak over TP, which sparse transient-heavy ambience always does. `peak_over_db` in the result says how hard the
limiter works. Default target -24 LUFS, TP -2.0.

Determinism rules: seeds via `zlib.crc32(str(part))` (never Python's salted `hash()`); every timeline stream (states,
bags, per-span events) has its own RNG so the timeline at time t never depends on the total length.

## 4. The visual model
`vis.make_frame_fn(timeline, seed, duration)` returns `frame_fn(i, t) -> uint8 RGB (1080, 1920, 3)`. It must be a pure
function of absolute time (no frame-to-frame state) so a demo window rendered with `--start` equals the same span of the
full video. `video.encode()` streams frames to ffmpeg:
`h264_nvenc -preset p5 -tune hq -rc vbr -cq 23 -b:v 0 -maxrate 12M -bufsize 24M -profile high -g 60 (fps*2) -bf 2 -yuv420p`,
BT.709 tags, 1920x1080 30 fps. Closed GOP so 30-min segments can be stream-copy concatenated.

## 5. Scenes
### 5.1 `roommate_typing` (#11, seed 11, "Someone's Here" series) - BUILT
- Picture: you lie on the top bunk looking at the ceiling; the roommate types at a desk in the far right corner (~3 m,
  back to you). Only his laptop's cold light reaching the ceiling/right wall is visible. Blender plates
  (`blender/dorm_room.py`, Cycles, Poly Haven CC0, room 3.3x4.8x2.55 m, camera near-vertical) are rendered as linear EXR
  light passes `mon_<yaw>` for yaw -40..-24 (1-degree steps) into `S:/ambient/cache/dorm_v3_ceiling_up`, converted to
  float16 `.npy` by `blender/exr_to_npy.py` (the engine's OpenCV cannot read EXR). The roommate is a camera-invisible
  stand-in that still blocks screen light, so each chair creak swivels him to a new yaw and moves his shadow.
- Screen state machine driven by the audio timeline (all pure functions of time): steady while typing (each burst nudges
  ~1 %), browsing clicks step brightness/white point (0.25 s), dim to 0.35 after 60 s idle (`DIM_S`), sleep (black) after
  150 s (`SLEEP_S`), wake over 1.5 s on the next key/click (no light pop). Slow breathing camera drift (`ZOOM = 1.02`),
  film grain dithers the dark. Grade: `EXPOSURE = 56`, `TOE = 0.02` (was 32/0.05 until 2026-10-12; raised because the
  earlier frame was too faint for a TV). Screen-on peak luma ~90/255; sleeping phases ~1.
- Audio (`scenes/roommate_typing.py`): semi-Markov activity states typing (35-200 s) / thinking (6-50) / browsing
  (20-140) / away (90-600) with fixed transition probabilities; keystroke bursts word by word with lognormal inter-key gaps
  (typist speed drifts +-15 % over 90 min, 10 % slower by hour 10), corrections (7 %), enter, mouse clicks while browsing,
  chair creaks/caster rolls (posture shifts, with >=12 s dead time), mug set down. Voice pools: key 64, space 12, enter 8,
  backspace 10, creak 24, click 10, mug 10, roll 8 (shuffle-bag, never repeat across refills). Heard "same room": lowpass 3.2 kHz,
  -16 dB, pan 0.3 (desk front-right), small block-wall room reverb (RT60 0.4 s). Bed: -4.5 dB/oct coloured noise lowpass
  2.5 kHz at -40 dB + 100 Hz building-vent hum with harmonics (phase-continuous in absolute time, 37 s wobble) + faint 3 kHz buzz.
  `EVENT_CEIL = 0.03` (~p90 of keystroke peaks; evens out hard strikes, startle-safe). No speech, no music.
- 10 h timeline: 107,137 events (83,209 keys, 16,576 spaces, 5,576 backspaces, 302 creaks, 116 rolls, 410 enters, 47 mugs, 901 clicks).

### 5.2 `marble_machine` (#3, seed 3, "Slow Machines" series) - BUILT
- World: an endless, never-repeating marble run generated procedurally below the camera as it descends
  (`CAM_SPEED = 15 px/s` = exactly 0.5 px/frame; two half-pixel phases). `scenes/marble_machine_sim.py` is a pymunk 2D
  physics sim (gravity 900, 8 substeps/frame = 240 Hz, marble radius 17 px, 4 solid columns at x=14/640/1280/1906, 6-colour
  palette). Materials: wood, steel/guard, bell, marble, peg. It logs frames (marble positions + camera), `hits` (t, material,
  impulse, x, y, pitch) which become audio events, and a 100 Hz `roll` array of rolling energy per material + mean pan (the
  rolling-rumble bed).
- Visual: static world pre-rendered by Blender Cycles under cool moonlight into 1080-px world tiles (16-bit PNG; ~10 MB each;
  a file under 2 MB is a truncated write), plus Blender sprites for glowing glass marbles (48 rotations x 6 colours = 288 files).
  Per frame = crop of the tile + sprite compositing + multiplicative light pool on the board (`GLOW_GAIN = 5`, `GLOW_R = 70`)
  + additive bloom (`BLOOM_GAIN = 0.30`) + faint moon contact shadows. Colour: `GLOW_SAT = 1.6` (same value in
  `blender/marble_tiles.py` and `scenes/marble_machine_visual.py`; keep them equal), `VANE_EMISSION = 1.2`. `TILES_VERSION = "v2-night"`,
  sprites in `S:/ambient/cache/marble_sprites_v3_sat` (v2_glow = the earlier pastel set, kept for rollback). A Standard view
  transform was tried and rejected (saturates but blows the white marble out).
- Audio (`scenes/marble_machine.py`): every sound is driven by the sim's log. Modal foley per material (wood, steel, glass,
  peg, bell with irrational partials f x 2.76/5.40/8.93 and pitch from the piece, ratchet clicks from the feeder); rolling
  bed from the memory-mapped `marble_roll_<key>.npy`; room reverb RT60 0.45 s. No repeating tune.
- 10 h: 716,579 events (wood 403,944; steel 166,801; bell 56,450; peg 47,368; glass 31,920; ratchet 10,096); raw peak 1.20.
- Memory: a 1 h sim peaks ~0.51 GB per process, so 10 h is ~5 GB. `simulate()` is memoised per process, the cache is written
  atomically, and the audio workers memory-map only the 100 Hz roll array (~0.1 GB) via `sim.load_roll`. Never load the full
  sim in a worker (8 workers x 5 GB would exhaust the 31 GB machine).

### 5.3 Other scenes: PLANNED only (no code)
The research's E1 set (see `research-findings.md`): Night Quarters (starship crew quarters, gothic castle chamber, snowed-in
safehouse; later airplane cabin, sleeper train, ...), Someone's Here (roommate in the kitchen, radio in the next room), Slow Machines
(sand and lava-lamp simulation, screensaver marathon). To add one: write `scenes/<name>.py` (timeline/bed/voice/MAX_VOICE_S)
and `scenes/<name>_visual.py` (`make_frame_fn`), register a pre-render script in `full_render.PRERENDER` if it needs Blender
plates, then follow the pilot -> demo-approval -> full-render path in `operations.md`.

## 6. The `full_render.py` stage model
```
python full_render.py <scene> <seed> <hours> <out_dir> [--seg-min 30] [--lufs -24] [--workers 6] [--stages tiles,audio,video,final,qc]
```
Output folder: `<out_dir>/<scene>_s<seed>_<seconds>s/` (10 h = `_36000s`). Hours must make a whole number of minutes
(assert); segment length must be a whole number of minutes. 10 h = 20 segments of 54,000 frames.

| Stage | What it does | Piece written | Skip condition |
|---|---|---|---|
| `tiles` | Only for scenes in `PRERENDER` (marble: `marble_tiles.py`). Deletes tiles < 2,000,000 bytes, then runs the script, which computes (or loads) the 10 h sim, writes `pieces.json`, has Blender render only the missing tiles, then renders the 288 sprites only if `marble_5_47.png` is absent. | `tile_*.png` in `S:/ambient/cache/marble_tiles_<key>/` | per-tile existence |
| `audio` | `render_audio.render()` whole timeline in 60 s blocks -> `audio.raw.wav` (float) -> `loudnorm()` static gain over the WHOLE file -> `audio.wav` (24-bit PCM), deletes raw, writes `audio.raw.json` (event counts, raw peak). | `audio.wav`, `audio.raw.json` | `audio.wav` exists and `state.json` has `audio` |
| `video` | Builds timeline + frame function once, then per missing segment encodes `seg_NNN.mp4` via NVENC; checks the probed duration is within 0.1 s of expected. | `seg_000.mp4` ... | per-segment existence |
| `final` | Writes `segments.txt`, stream-copy concat of segments + AAC mux of `audio.wav` (`-c:v copy -c:a aac -b:a 384k -ar 48000 -shortest -movflags +faststart`). Verifies duration within 0.5 s and EXACT video packet count = hours x 3600 x 30. | `final.mp4` | `final.mp4` exists and state has `final` |
| `qc` | `qc_demo.main(final.mp4)`. | `final.qc.json`, `.sheet.png`, `.spec.png` | none (always re-runs) |

Bookkeeping: `state.json` (what finished and when; merged from disk on every write because two processes may update it),
`run.log` (timestamped). `wall_s` fields are wall-clock with other jobs running: do not quote them as speed.
The process lowers its own priority (BELOW_NORMAL, inherited by workers/ffmpeg/Blender) and calls
`SetThreadExecutionState` so Windows does not idle-sleep (released on exit, changes no power setting).
Locks: one lock file per stage SET (`.lock-<stages joined by _>`), holding the PID; a lock whose PID is dead is ignored.
That is why `--stages tiles` and `--stages audio,video,final,qc` can run concurrently for one job (the video stage trails the
tiles, which render faster than video consumes them) while two copies of the same stage set cannot.

Resume semantics: rerun the SAME command; it resumes at the first unfinished piece. Delete a piece (e.g. `seg_007.mp4`,
`final.mp4`) to redo it - deleting one segment plus `final.mp4` redoes only that segment and the final mux (tested).
A crash leaves only `*.part*` files, which are ignored/overwritten.

## 7. Caches and their keys (all under `S:/ambient/cache/`)
- Marble sim: `marble_<sha1("marble-v10-<seed>-<duration>")[:16]>.pkl` and `marble_roll_<same key>.npy`. The key includes the
  duration, so a different render length gets a different (large) cache; the 10 h one is `marble_dfdecd8872f2196c`.
- Marble tiles: `marble_tiles_<sha1("tiles-<TILES_VERSION>-<seed>-<duration>")[:12]>/`.
- Sprites: `marble_sprites_v3_sat/` (path set by `marble_tiles.SPRITES`).
- Roommate passes: `dorm_v3_ceiling_up/` (EXR + `.npy`).
- Cache directories are versioned BY NAME. Existing files are skipped, so bump the version/dir name whenever the look
  changes or a stale render is silently reused (`TILES_VERSION`, the sprites dir, the `dorm_v3_...` dir, the sim `marble-v10` string).
- Demo windows vs full render: a `--start` window is sample-exact (audio) and frame-exact (video) against the same span of the
  full render because timelines and the marble sim are strict prefix-extensions (verified 2026-10-12: identical events and
  5,400 sim frames compared; approved demo audio re-rendered bit-identically; 6-minute roommate render in three 2-minute
  segments matched at 42.8-44.5 dB PSNR at seams, both streams exactly 360.000 s). The one known difference: the audio gain,
  because loudness is measured over the whole file.

## 8. Invariants you must not break
1. Total length is a whole number of minutes; `--start` is a multiple of 60 s (audio blocks are 60 s).
2. Visual and audio timelines are pure functions of (seed, absolute time); never add per-frame state or use `hash()`.
3. Spans/events never truncated at `duration`; separate RNG streams per aspect.
4. One static gain over the WHOLE file (no per-chunk normalisation); AAC encoded once, in the final mux.
5. Write `.part`, rename on completion; never leave a half-written file under its final name.
6. Heavy files only on S:. H: is a nearly full 7,200 rpm HDD: a 10 h job on H: fails by construction.
7. Never run a second job of the same stage set; never run ComfyUI concurrently with dots.tts; one GPU service at a time.
8. After ANY change to the look or the events, bump the matching cache version and re-verify demo == full-render prefix.
