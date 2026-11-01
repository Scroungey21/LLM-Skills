# Material Trials - audio and finishing

Contents: principle · sample library and roles · per-family sound placement · mix bus · loudness chain · AAC trap ·
text line (geometry, colours, fader) · loop dissolve · encode · what is NOT used.

## Principle: the simulation is the score

Every audible transient comes from a physics event (frame/time from the simulation data), so sync is exact and every
video's soundtrack is unique. Times are viewer seconds (frame / fps), so slow motion needs no special casing. Library
samples add texture; they never decide timing. Research behind it: Blender exposes no collision events, so impacts are
extracted after the bake from velocity-change spikes (`mt.extract_events`: rising-edge |dv| > threshold, min gap 3
frames; locally 49 events from 20 spheres in 0.2 s). Audio may lag picture by ~188 ms but lead by only ~75 ms before
viewers notice, so round sub-frame contacts to the **later** frame; at 30 fps one frame is 33 ms, so frame-accurate
placement is enough. dv-only detection misses sliding/rolling (no spike): the press and blade families therefore also
track continuous quantities (ram speed, kinetic-energy loss, mass flux through the funnel neck).

## Sample library (`assets/sfx/`, all CC0; provenance in `LICENSES.csv`, re-download with `fetch_sfx.py`)

Packs (about 587 files): `kenney_impact` (130, Kenney), `oga_100_sfx`, `oga_100_sfx_2`, `oga_water_slime` (40),
`oga_breaking` (75), `oga_metal_wood` (100) (all rubberduck on OpenGameArt), `oga_snow_gravel` (42, Corsica_S / Iwan
Gabovitch). Only CC0 enters the pool; add a `LICENSES.csv` row for any new pack. Excluded by research: CC-BY-NC
anything, BBC RemArc (non-commercial), Sonniss GDC is usable (commercial, no attribution) but **never** for AI
training; Freesound only with the licence filter (CC0/CC-BY; CC-BY needs credit lines, which the not-a-show rule
makes impractical - stay CC0).

`engine/audio.py ROLES` (role -> glob patterns): `steel_click`, `steel_on_glass`, `metal_pour`, `glass_break`,
`glass_debris`, `glass_tink`, `heavy_clunk`, `machine_loop`, `air_hiss`, `slime`, `soft_thud`, `rubber_squeak`,
`splash`, `bubble`, `gravel`, `snow`, `floor_thud`, `bell`, `blade_ring`. `sample(role, pitch_semitones, max_len)`
returns a random variant (never the same file twice in a row), peak-normalised, leading silence trimmed, pitch-shifted by
resampling, tail cut with a fade at `max_len`. `loop_fill(role, dur)` tiles a loop with 0.08 s crossfades.
`jitter(semi)` adds small pitch randomisation. **Add a new role by adding glob patterns, never a generative model.**

Note: `audio.py` also contains procedural synth voices (`glass_tinkle`, `glass_crack`, `metal_thud`, `squish`, `bloop`,
`rubber_creak`, `hydraulic`, `room_tone`) and its docstring still says "no samples are used". That is stale: no family calls
the synth voices today (the early demos did); the live path is samples + `dry_room` only. Keep them as legacy; do not add
`room_tone` or beds.

## Per-family placement (what the code actually does)

- **press (`families/press/score.py`):** sound at frame 0 (a `heavy_clunk`, research: sound within 0.1 s of frame 0) plus a
  low `machine_loop` fade-in; per ram: `machine_loop` low-passed at 900 Hz keyed to ram speed at gain 0.07 (a quiet low hum
  that stops when the ram stops - never a broadband wall), `air_hiss` + `heavy_clunk` where motion starts, `heavy_clunk` + hiss
  when the ram homes. Roller scenario adds a 320 Hz low-passed rumble (gain 0.06) only while the drum rolls. Soft
  contestants: clunk at contact; jelly/gummy -> `slime` hits along the compression (about one per 0.22 s, gain scaled by
  squash rate), `slime` plus three descending `bubble` pops on recovery; rubber/foam/balloon -> `rubber_squeak` stick-slip
  (every ~0.35 s) and a `soft_thud` on release. Fracture contestants: layered `glass_break` x2 + `heavy_clunk` at the
  first simulated impact, then `glass_debris`/`glass_tink` on every simulated shard impact (min 0.12 s per object, gain from
  log(dv x mass), smaller shard = higher pitch, pan by screen x, per-material pitch offset porcelain -3, ice +1,
  obsidian -2).
- **drop (`families/drop/family.py`):** per stage: a pitched `bell` sting (CC0 bell sample, `STING = [0,2,4,7,9,12,14]`
  semitones rising with the stage, gain 0.28) at each stage start - a tonal marker, not music; projectile clicks from
  simulated ball impacts (`SOUNDS` per projectile material: steel/lead/brass/marble/rubber, pitch and high-pass
  per material), first landing per ball `steel_on_glass`, a quiet `metal_pour` texture when >= 100 balls and density > 3
  hits per 24 frames. **Thinning:** dense stages (>= 1,000 balls) keep only hits with strength >= 0.68 and at most 20
  voices per viewer second; sparse stages at most 60/s. (An older doc said "one voice per 25 ms" - the code is these
  buckets.) The height scenario adds a single `heavy_clunk` scaled by the measured impact-energy share of the rating.
  Break: two `glass_break` layers, `floor_thud` 0.6 s later, pour sample.
- **blade (`families/blade/family.py`):** per material a `bell` sting at stage start; foley from **kinetic energy lost per
  frame** (`splash`, `gravel`, `snow`, `slime`; clay = low `slime` -5; hits every 3-4 frames so ~8-10 per viewer second;
  gain ~ energy^0.7); `blade_ring` + `heavy_clunk` on first contact (lower, duller ring for the funnel); water extra
  `splash`; jelly `soft_thud` + `slime`, and a second thud when it lands in one piece. Funnel: a crisp trickle (~5 short,
  high-passed grain hits per second, jittered) following the measured **mass flux** through the neck, because a steady
  pour dissipates almost no kinetic energy and would otherwise be silent.

## Mix bus

`Track(seconds)` stereo 48 kHz float buffer; `Track.add(mono, t, gain, pan)` equal-power pan from screen x.
Every family ends with `A.peak_norm(A.dry_room(tr.buf, room_wet 0.035, room_seconds 0.28), 0.89)` then
`A.write(mix.wav)` (30 Hz high-pass, int16). `dry_room` = barely-there early reflections replacing the long reverb that
washed out the first demos (the long `add_reverb` 1.4 s / wet 0.12 is legacy). `peak_norm` is transparent (no saturation;
`soft_limit`/tanh is legacy and not used) so transients stay crisp. No pre-compression anywhere.

## Loudness chain (`engine/finish.py loudnorm`)

Target -16 LUFS integrated, true peak -1.0 dBTP, LRA 11 (`channel.json audio`; QC gate -16 +-1, TP <= -0.5).
1. `lowpass=f=16000:p=2` first (the AAC trap below).
2. Two-pass `loudnorm` (pass 1 measures with `print_format=json`; pass 2 feeds `measured_I/TP/LRA/thresh` and `offset`,
   `linear=true`) then `alimiter=limit=0.8:attack=0.5:release=40:level=false` as ceiling.
3. Iterated up to 6 rounds until the measured result is within 0.4 LU of target (correction `eff += (target - I) x 1.3`);
   if it never lands, the closest round is kept. Peaky mixes (one big shatter over quiet foley) lose loudness to the
   ceiling limiter, hence the overshooting correction.
4. Output `-ar 48000` (loudnorm resamples to 192 kHz otherwise).
- **Order matters:** cut/loop the soundtrack to the picture's timeline FIRST, normalise LAST. Normalising the full mix and
  then trimming the opening into the loop dissolve left S1E03 at -17.1 LUFS because its loud first impact was the part
  trimmed away.
- Research context: YouTube normalises to about -14 LUFS and turns loud content down only; the top 3D Shorts measured a
  median -21.5 LUFS (range -27.8 to -16.5), and loudness did not separate top from bottom clips. The channel uses -16 as a
  hygiene compromise (the early demos used -14 with a pre-limiter; production moved to -16 with the dry mix).

## AAC true-peak trap

The native AAC encoder at 192 kbps rang to **+5 dBTP** on isolated sharp clicks (S1E02). Fix, both required: the 16 kHz
roll-off in the loudness chain and **256 kbps** AAC (`-c:a aac -b:a 256k -ar 48000`). With them true peak stays below
about -1.5 dBTP in filed videos (-1.5 to -2.4 measured in the logs). Do not remove either.

## Text line (`finish.one_line`, `draw_line`, `slim_bar`)

- Font Bahnschrift (variable, "Bold Condensed"), white with a soft shadow (blur 6, offset 4,5, alpha 170), accents amber
  (242,169,0); result colours green (80,220,140) good / red (255,84,64) bad. Text is centred, shrinks in 4 px steps (floor
  36) until it fits `SAFE_W`.
- Canvas: Short 1080x1920, line y 214, size 96, safe width 900; wide 1920x1080, y 64, size 70, safe width 1500. Keep
  clear of the Shorts UI: bottom ~390 px and right ~140 px. (Research top-clip labels sit 10-14% from the top; the safe-zone
  advice conflicts - 380 px unsafe at the top by one source, 120-180 px by others - so test on device.)
- Content pattern: the **current variable value**, never a sentence: "1,000 STEEL BALLS", "2 m DROP", "WATER  vs  THE BLADE" (or "THE FUNNEL"),
  result appended to the same line ("... . HOLDS" / "BROKE AT 1,240" / "SPLIT IN TWO" / "FLOWED THROUGH"). Press premise
  "A vs B vs C" is shown first at size 84.
- `slim_bar`: text-free progress/load bar (480 px Short, 560 px wide, 10 px high) under the line that appears and fades
  with it; colour green < 60%, amber 60-90%, red >= 90% or broken. Drop family: load / strength (hopper) or live kinetic
  energy / rating J (height).
- **`_Fader`** (frames at 30 fps): IN 6 (0.2 s), HOLD 30 (1.0 s), OUT 10 (0.33 s), GAP 15 (0.5 s clean picture before the
  next change), MIN_LIFE 22. A dry pass records every change first (`record=True`), then each line's life is
  `min(IN+HOLD+OUT, gap - GAP, 0.6 x gap)` but at least MIN_LIFE. A looping Short whose last line equals its first shows it as
  one event across the seam, so the text does not blink at the loop point.

## Loop dissolve (`finish_seq(loop=True)`)

`L = min(LOOP_FRAMES 18, n // 4)`. Output frames = n - L; output frame i shows linear frame i + L; the last L output frames blend
`Image.blend(base, first frames, a)` with a = (i - (m - L) + 1)/L; the soundtrack gets the same dissolve with an equal-power
crossfade (`_loop_wav`: cos/sin gains). The overlay json records `frames, linear_frames, loop_frames, text_visible_fraction`.
`--remix` rebuilds the loop-matched audio from these numbers.

## Encode

Frames are composited as JPEG q95 per frame, then
`libx264 -preset slow -crf 17 -profile:v high -pix_fmt yuv420p -bf 2 -g <2 x fps> -flags +cgop -maxrate 20M -bufsize 32M
-c:a aac -b:a 256k -ar 48000 -movflags +faststart` (one master that satisfies YouTube's Shorts guidance - MP4, moov
first, H.264 High, 2 B-frames, closed GOP, AAC-LC 48 kHz, 8 Mbps for 1080p at 24-30 fps - and keeps <= 25 Mbps so the
same file is valid for Instagram Reels). The clean master is x264 CRF 12. 30 fps: 8 of 10 top 3D Shorts were <= 30 fps and
it halves render cost. Long-form segments are CRF 14 intermediates (pcm audio), final CRF 17.

## Not used (on purpose)

Music of any kind (library music splits Shorts revenue: 1 track = half of the allocation to licensing, 2 = two thirds;
ambient beds inhibit ASMR for many listeners); generative audio; reverb tails; a continuous noise floor; a fixed shared
soundtrack across videos (reads as templated).
