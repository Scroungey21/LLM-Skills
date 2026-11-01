# HES 3D line: tools, gates, voice, locks, render numbers

Companion to `production-3d.md` (read that first). Source of truth: `hidden-everyday-systems/production-3d/tools/`,
`.../experiments/zdf-3d-long/pipeline/`, and the per-video scripts (barcode-gum Short is the most complete template).
"Gate" = a pure function that exits non-zero; **every gate must have a bite test** (a deliberately broken copy it must fail), else a pass means nothing.

Contents: 1 Shared pipeline · 2 Pace/length profiles (which budget applies) · 3 `gates_long` IDs · 4 Per-video `gates.py` pattern ·
5 `post_gates.py` · 6 `script_gates.py` · 7 `table_read.py` · 8 Voice (o1 / vm5, `voice_lock`) · 9 Audio mix · 10 Captions + thumbnails ·
11 `BLENDER.lock` + tickets · 12 Render settings, chunks, GPU budget · 13 Gotchas

---

## 1. Shared pipeline `experiments/zdf-3d-long/pipeline/` (import, never edit; per-video wrappers override locally)

| Module | Runs in | What |
|---|---|---|
| `stages.py` | Python | Generic stage driver: `python make.py voice beats gates preview render final thumb [--variant long|short] [--samples N] [--agent NAME]`; `all` = voice beats gates preview render final. `CHUNK=450`, preview every 15 frames (2 fps), preview 640 px / final 1920 px long edge. Outputs to `<topic>/../output/<slug>/` (the 3D line's per-video `make.py` overrides this to `<video>/output/`) |
| `blender_lock.py` | Python | the mutex + FIFO queue (section 11) |
| `blendlib.py` | Blender | factory scene, EEVEE settings, Poly Haven HDRI + 3 suns, `look()` shared surface (highlight, dim, section colour, clip planes, brushed brass, ambientCG wear), `aid_material()`, mesh helpers (`prism`, `ellipsoid`, `boolean` with a loud-failing fallback, `bevel`, `smooth`, `sweep_along`), `key_series`, highlight + camera keying, `run()` render loop (`--thumb`, `--save`, `--first/--last`, `--skip-existing`, `--every`) |
| `camlib.py` | both | easing, `profile/integrate`, cue/word timing (`word_time`), `spans_from_cues`, `focus_at`, monotone PCHIP `CameraPath` + `waypoint()` (label each waypoint; `transit-*` for moves between subjects), `LEAD` = highlight ramp 0.12 s before the word |
| `materials.py` | Blender | PBR metal F0, micro-roughness, HDRI world |
| `voice.py` | Python | OmniVoice via VoiceStudio, one take per sentence (section 8) |
| `gates_long.py` | Python | pace, captions, highlight sync, camera C1-C3 (section 3) |
| `captions.py`, `compose_long.py` | Python | caption chunks/render (aspect auto), soft bloom on the highlight |
| `mix.py`, `audio_bands.py`, `sfxlib.py` | Python | music bed levelled + ducked until every octave band passes; SFX synthesis |
| `thumbnail_long.py`, `contact_sheet.py` | Python | thumbnail + 168x94 glance file; review sheets (`dir`/`video` modes: fps and columns args) |

**`beats.json` contract** (written by the video's `timeline.py`, read by build, gates, mix, sfx): `{fps:30, aspect:"16:9"|"9:16", duration, frames_total, drive_keys:[...], frames:[{f,t,cam,tgt,lens,<drive values>}], camera_waypoints:[...], spans, groups:{group:{kind: objects|attr|zone, names}}, marks, speed_points}`. The 3D Shorts extend it with `shots`, `chips`, `events`, `pauses`, `rims`, `physics`. Camera looks along +Y, subject front faces -Y; waypoint azimuth in degrees to the left, elevation up. Highlight is keyed as object props `focus`, `focus_b`, `focus_h` (+ scene `any`); a group lights from 0.12 s before its cue word.

**Per-video hooks** (shared-driver style): `script.json`, `spec.py` (real dimensions + pure kinematics, NO bpy/shapely), `mechcheck.py` (optional shapely proofs -> `work/geometry.json`), `beatlib.py` (`zone_fn`, optional `bind`), `timeline.py`, `topic_gates.py` (`run(beats, gate, topic, work)`), `build.py` (`build(beats)`, `animate(...)`, `BL.run(...)`), `sfx.py` (`build(beats_path, voice_wav, out_wav)`), `make.py`, `REFERENCE.md`, `REPORT.md`.

## 2. Which pace/length budget applies where (they DISAGREE; do not average them)

| Tool / profile | Words | Runtime | Notes |
|---|---|---|---|
| `tools/script_gates.py` LEN, Short | **90-130** | est. from register WPM (~35-50 s with pauses) | the writing gate; barcode Short = 130 words, 18 sentences |
| `tools/script_gates.py` LEN, long | **750-1,100** | | chained Short-sized segments |
| `gates_long.py` "short" profile (old 2.5-3.5-min era) | 60-115 | 24-50 s | `end_role: cta` (result then CTA): for a **long's summary Short** only |
| `gates_long.py` "long" profile (old) | 380-650 | 150-210 s | the zipper/seatbelt era; NOT for documentaries |
| `gates_local.py` documentary profile (jet engine, Panama) | 750-1,100 | **300-420 s** | + chapters gate L3, scale-free C3 |
| Short runtime target (3D standalone) | | 45-60 s (STUDY: 45-60; table-read: speech ~46 s) | P8 end hold 1-2.5 s |

`gates_long` per-scene limits: Short <= 25 words/scene, visual event <= 2.5 s, core shots <= 4.5 s; long <= 28 words/scene, event <= 3.5 s, core <= 6.0 s; core share 25-60 % of runtime (both).

## 3. `gates_long.py` gate IDs (hard fails unless noted)

Applies to the shared-pipeline single-take videos (zipper-era longs, the documentary wrappers `gates_local.py` for jet engine / Panama, and a long's 9:16 summary Short). The 3D multi-shot standalone Shorts do **not** run it as is (its G4 "setup sentence contains 'you'", the single-take C3 and the `cta` ending assume the old format); they use their own `gates.py` (section 4).

G1 first spoken word <= 0.3 s · G2 subject AND camera moving on frame 0 · G4 setup sentence <= 22 words, <= 8 s, contains "you" · G5 speaking rate 165-240 WPM · G6 speech covers >= 90 % of `speech_end`, no inter-sentence gap > 0.6 s · G7 words per scene <= limit (mean <= 20) · L1 word range · L2 runtime range · G9 visual event every <= 3.5 s (Short 2.5), core shots <= 6 s (4.5) except the last 2 s · G10 no static hold > 1.5 s · G14 core share 25-60 % · G16 ends on `result` (long) or `result` + `cta` (short), tail hold <= 2 s ·
K1 captions 1-3 words, <= 18 chars · K2 chunk appears on its first word +-0.05 s and stays >= 0.25 s · K3 no coloured word, white fill, no orange ·
G19 every named part lit >= 50 % on its word (ramp from 0.12 s before) ·
**C1** no A->B->A camera return and no return to a focus within 15 s (`RETURN_WINDOW_S`) · **C2** on one focus the camera never pulls back then pushes in (or reverse), tolerance 3 % · **C3** one continuous take: max frame-to-frame camera velocity change <= 0.6 mm (documentary profile: <= 0.012 of the camera-target distance) ·
documentary only: **L3** chapters >= 3, first at 0:00 (<= 0.5 s), each >= 10 s (YouTube chapter rule), ascending, last >= 10 s before the end ·
plus the topic's mechanism gates (`topic_gates.run`): zero interpenetration per frame, no jump/spin on any drive value, attached parts stay attached, streams connected to a source, speed-derived SFX bands.

## 4. Per-video `gates.py` pattern for multi-shot Shorts (barcode-gum = the template; `python gates.py` -> `work/short/gates.json`)

Each is a pure `g_*(beats, timing)` function and each has a bite in `bite_test.py` (positive controls for gates that still fail on real data, in `bite_controls.json`):

| ID | Rule |
|---|---|
| **P2** | every cut and highlight (rim) sits on its anchor word, |offset| <= 0.25 s (anchor table `ANCHORS`/`RIM_WORDS`) |
| **P1** | median shot 2.5-4.5 s; punch shots (fragments) 0.8-1.8 s; every shot > 4 s changes state at least every 2 s |
| **A11** | <= 2 chips on screen at once; name/date cards >= 1.5 s |
| **A11b** | chip text has no mojibake (`Â â Ã U+FFFD`, C1 controls) and every glyph exists in the Montserrat face compose.py draws it with; unreadable font = FAIL |
| **E1** | exactly one music-button, placed after the last line ends (+0.1 s) and >= 1.0 s before the end; end hold 1.0-2.5 s; last shot is the reframe shot; the closing beep/flash lands on its word |
| **F0** | frame-0 composition computed through the real camera: hero object 30-40 % of frame width, centre in the lower third (62-84 % from top), vanishing point in the upper half, lens 34-36 mm, camera 7-14 cm above the belt (item-specific numbers) |
| **F0h** | frame-0 readability, the HUMAN half: `work/frame0_look.md` must record `VERDICT: PASS`, `VIEWERS: 4/4` (each says what it is, unprompted, sound off), `ELEMENTS: 6/6` (required items in frame). Geometry alone is not a frame-0 pass (an object-in-a-void frame passed F0 and failed this) |
| **O4** | owner rule 4: inside a shot the camera never reverses its travel (direction dot-product < -0.2) and its distance to target changes one way only (designed whip pans excepted after the whip); A1: never static (<= 2 still frames) except the end-hold shot |
| **C1** | continuity: nothing undoes itself across a cut (state order belt->held->fall->glass only increases); exactly one "1974" beep and the modern beep after it; a held state resumes identically after a cut-away |
| **M1-M6** | mechanism proofs (item-specific): law of reflection at every bounce (720 sampled rotations, error < 1e-6), glow only where the traced spot crossed, every pose has lines spanning both code halves, no pack interpenetration (all 8 corners, every frame, >= -0.01 mm), free-fall follows z = z0 - g t^2/2 and the spin decelerates uniformly, brightness equals the real bar map under the spot + a valid UPC-A (check digit, 30 bars, 95 modules) |
| **S8** | `tools/script_gates.py` 8/8 on `script.short.json` |

Reuse the shape for a new item: replace M-gates with that mechanism's physics proofs (the hydrant/Panama folders' `topic_gates.py`: water level from computed flow, ODE levels, valve seat contact, connected streams).

## 5. `post_gates.py` (on the finished/animatic video)

- **P5** every marked pre-turn pause is filled: the mix's peak (23 ms RMS blocks) inside the pause (+-0.03 s inset) reaches **-3..+3 dB** of the speech mean (tightened from -6..+3 on 2026-10-18). Exempt: the deliberate near-silence after a casualty line (W12, room tone only, 1.0 s).
- **P7** visual energy: 4 fps, 64x36 grey, mean abs frame difference per 0.25 s step; **big = diff > 25/255, static = diff < 3**, last 1.6 s (end hold) excluded. Final: big >= 20 % (history/explainer; STUDY: what-if >= 30 %, tragedy >= 12 %), static <= 12 %. **Animatic** (pre-stage-B, `--animatic FILE [--window A B]`): big >= 25 % and static <= 12 % (margin for Cycles motion-blur loss); reports the longest low-energy stretch so the fix is targeted. Plan-time P7 counts events conservatively (events >= 8 frames covering >= 40 % of the frame + large bright/dark cuts; never strobe).
- **AB** music AND sfx stems pass `audio_bands` under the voice in every octave band (`work/short/stems/audio-report.json`).
- **Stills gates** (`--stills DIR`, run on every preview/animatic contact set before any Cycles final): **X1** pixels within +-15 deg hue of #FF8A3D (23.8 deg) at saturation > 0.5 and value > 0.45 <= **12 %** of the frame (the highlight is a rim, never a flood) · **X1r** x-ray frames: red (hue 340-15 deg, sat > 0.6) <= **20 %** (the laser is beams + spot only) · **X2** clipped white (luma >= 250/255) <= **5 %**.

## 6. `tools/script_gates.py` (writing gate; inputs: `script.short.json`/`script.json`, `.txt`, or the first ```` ```script ```` block of a `.md`)

`python script_gates.py FILE [FILE...] [--register R] [--kind short|long] [--json] [--summary] [--timeline]`; exit 0 = every file passes all 8, 1 = fail, 2 = unreadable. `--timeline` prints each sentence's estimated start (use for the shot list). Markup: `[pause 0.6 ...]`, `[silence 1.5]`, `[beat]` (= 0.5 s; bare pause = 0.6 s); other `[..]`/`{..}` ignored; `@register what-if|history|explainer|crime|tragedy`, `@kind`, `@wpm N`; JSON `pause_after` = pause before the next sentence.

Runtime estimate: words / register WPM (what-if 210, history/explainer/mech 185, crime/documentary 175, tragedy 165; numerals weighted longer: 3 digits x2, 4+ digits x3) + every pause + 0.16 s per sentence gap.

| Gate | Rule |
|---|---|
| **W2** hook | line 1 <= 14 words; no `?`; not a process opener (`when you`, `have you ever`, `ever wonder`, `did you know`, `let's`, `in this video`, `here's how`, `how does/do`, `what is`, `today we`); not expectation-first (`you'd think`, `you might think`, `most people think/imagine`) unless it contains "but"; must carry a contradiction/stake signal (but, yet, still, not, never, nobody, only, instead, empty, fail, wrong, lied, backwards, harder, faster, first, every, can't, on purpose, named after, `*n't` ...) unless <= 7 words |
| **W4** rhythm | mean sentence 7-13 words; >= 20 % of sentences <= 5 words; never 3 sentences > 15 words in a row; none > 28 |
| **W5** turns | pivot word (But, So, Then, Now, Because, Yet, Until, Instead, Except, Still, Unless, Turns out, And then, That's why/when, Problem, Trouble) at least every **25 s** of est. runtime; every hard turn (But, Yet, Instead, Except, Until, Turns out) preceded by a pause >= 0.3 s; >= 1 pause per 25 s; no pause > 2.2 s |
| **W7** callback | a content word (stemmed) of the hook returns in the last 25 % of the words |
| **W8** ending | last line <= 10 words, reuses a hook word, and **no CTA anywhere** (`full video`, `subscribe`, `link below`, `linked below`, `link in the description/bio`, `check out`, `watch the full`, `comment below`, `like and`, `hit the bell`, `see you next`, `part 2`) |
| **W10** numbers | <= 1 number per sentence (digits/number words/decades/ordinals; "one" only inside a compound; model names like C.4, VS-300 are not numbers) |
| **BAN** | none of: let's dive in / dive in, in this video, have you ever wondered / ever wondered, fascinating, incredible(ly), amazing, mind-blowing, you won't believe, believe it or not, let's take a look / look inside / find out / see / slow, to see how, without further ado, stay tuned, in conclusion, so there you have it, the answer is, simply put, basically, essentially, interestingly, surprisingly, it's important to note, crazy, insane, funny, hilarious, genius, ingenious, engineering marvel, marvel of, masterpiece, like magic, it's no secret, here's the thing, buckle up, smash that |
| **LEN** | Short 90-130 words, long 750-1,100 (kind inferred from > 400 words) |

Baseline (2026-10-12): the 16 older scripts averaged 4.1/8 (only the rewritten hydrant passed; W5 failed in 15 of 16); the new 20-script slate averages 8.0/8. `script_gates_bite.py` (14 bites + 11 parser checks) proves each gate fails on a broken copy of a known-good script and covers parser edge cases (initials "D. B. Cooper", ellipsis, "two hundred and fifty", "from 1949 to 1974" = 2 numbers). The gates measure FORM; the story half is judged by the table read (writing file section 8).

## 7. `table_read.py` (stage T, on the REAL voice take; refuses an estimated timing)

Score = passed/total, gate **>= 90 % with no hard fail**. Hard: hook <= 2.5 s; **ASR 100 % match** on every used take; **P6** speaking rate = words / VOICED time (sum of sentence spans; pauses and end hold excluded) within the register band (history 170-195 WPM; what-if 195-225; crime/tragedy 155-175); every marked pause 0.4-1.05 s (and >= 2 of them); `script_gates` 8/8. Soft: each sentence inside its own `min_wpm/max_wpm` (default 160-240); the reframe is the slowest line among lines >= 5 words (P6); a turn at least every 25 s. The whole-runtime WPM (pauses included) is reported, not graded (with 130 words and the planned pauses it cannot reach 170). Writes `work/table_read.md` + `work/short/table_read.json`. If P6 < 170: `python make.py voice --core-speed 0.95` (re-voices the core lines only; keep the W9 bridge at 0.88 and the reframe line slowest, ~0.8).

## 8. Voice

**Split (2026-10-18):** Shorts = **o1** (OmniVoice clone of `experiments/voice-v2/round2/candidates/o1-ym-mod-us-50703/`, CC-BY-NC weights, user's choice); longs = **vm5** (VoxCPM2, Apache-2.0). The user wanted a young, energetic but warm, not high-pitched voice like The Why Side / Zack D. narrators; round 1 (9 OmniVoice candidates) was rejected; the user preferred a commercial-licence engine for the long voice.

`tools/voice_lock.py` (every VoiceStudio call goes through it): `with voice_session("<agent>", engine="omnivoice"|"voxcpm2"): ...`; `python tools/voice_lock.py status` prints lock, active engine, VM free GB.
- One client at a time (simultaneous `/generate` corrupted takes). `VOICE.lock` next to `BLENDER.lock`, taken atomically (`O_EXCL`); stale only if its owner pid is dead or it is older than 3 h; waits up to 6 h.
- Allowed engines: **omnivoice, voxcpm2 only**. **IndexTTS 2.5 is never selected** (OOM-kills the container on this 15 GB host). **Never restart the VoiceStudio container yourself** (if it is down, record `blocked_voice` and wait).
- Inside a session the engine is checked with `GET /engines/tts` and switched via `POST /engines/select {family:"tts", backend_id}` (polls up to 5 min); on exit the server is **always** put back on omnivoice and verified, even after an error.
- A VoxCPM2 switch is refused when the VoiceStudio VM has < 7.0 GB free RAM (and, as a launch guard, before 2026-10-19 18:00 on the machine clock).
- Older rule (2026-10-12, `engine_check.py`): before any call, only proceed if omnivoice is active; otherwise wait 2 min and retry, never switch. `voice_lock` supersedes it for switching.
- Key: `VOICESTUDIO_API_KEY` from the repo-root `.env`, never printed or echoed.

`voice_o1.py` (per video; differs from `pipeline/voice.py`): reference = o1's `reference.wav` + `ref_text`; settings num_step 32, guidance_scale 2.0, effect_preset raw, denoise true, `speed` per script (0.91 default; o1 measured 183 WPM at 0.908), `gap_s` 0.16 between sentences; one take per sentence; seeds = base + (0, 97, 211, 509, 731, 1009, 1301, 1601); a take is accepted only if the ASR (faster-whisper `small.en`) transcript is **IDENTICAL** to the script after normalisation (lowercase, punctuation dropped, numbers spelled out: years as "nineteen seventy-four", spaces removed so "bar code" == "barcode", spelling variants folded) AND its WPM is inside the sentence's `[min_wpm, max_wpm]`; leading/trailing silence trimmed (speech starts at 0.0 s); refuses to run while the script's `voice.recheck_before_voice*` flag is PENDING (owner rule 8: changed voiced lines need a fresh-context re-check first); writes `narration.wav`, `timing.json` (word times), `voice_takes.json`. Then `pauses.py` inserts each `pause_after` silence and shifts every later word time (idempotent via `pauses_applied`). Spell acronyms/oddities so ASR can match (e.g. "checkout" instead of "till"; no spoken acronyms).
`pipeline/voice.py` (shared): ASR match ratio >= 0.95 (`MIN_MATCH`, the docstring's 0.85 is stale), pace 160-240 WPM (README) with per-sentence `speed` overrides, never changes the text to force a pass.

**vm5 / VoxCPM2 (longs):** `/v1/audio/speech`, model `voxcpm2`, profile `voice-v2-r2:vox-vm5`, instruct "friendly, lively and upbeat, smiling, keep the voice low and warm" (calm instruct "calm, respectful, gentle, measured, low and warm" for casualty lines), measured 171 WPM on the explainer passage. **No speed control** (do not copy o1's speed fields; steer by instruct + seed retry; the last line must be the slowest multi-word line, else regenerate or time-stretch pitch-preserved by a factor >= 0.90; list lines may only be tightened by trimming the inter-sentence gap, never by stretching). It **silently drops `[pause]` markup**: one call per sentence, insert pauses and chapter holds afterwards as silence/room tone. Round-2 voice gates: median pitch below the house baseline, pitch movement >= 0.9x baseline, ASR >= 95 %, identity drift (spread of per-passage median pitch) <= 4 semitones. Pace windows: what-if 195-225, explainer 170-195, documentary 155-175 WPM.

## 9. Audio mix (`mix.py`, `audio_bands.py`, per-video `sfx.py`)

- Music: bed from `examples/music-library.json` (`trim_seconds`, `gain_db` to the library's -18 LUFS reference, approved `relative_volume`), 2-stage high-pass 150 Hz, -6 dB dip around 1.5 kHz, faded, side-chain ducked under the narration (the ducks ~6 dB more on a designed register-change cut); then **lowered until every octave band passes**. Prefer sparse pads. Short beds loop (cherry-blossom 127 s would loop 2.6x in a long: use `new-direction` 678 s etc.). Final mix `loudnorm I=-16, LRA=7, TP=-1.5`.
- `audio_bands` bands 63-8000 Hz (octaves); speech bands 250-4000. Required margins (dB below the voice, per band, over speaking frames): **music** leq >= 18 (>= 22 in speech bands), p95 >= 8; **sfx** leq >= 18 (>= 22), p95 >= 6. (Origin: a bed that was 18 dB under overall but 10 dB OVER the voice at 63 Hz.)
- SFX come only from real visible events computed from the kinematics (`sfx.py` reads beats.json), band-gated, with an accent hit in each pre-turn pause (P5); deliberate silence only after casualty lines (W12) and in room tone for the end hold; the hook's SFX returns as the last hit (sound callback). Music button once, after the last line.

## 10. Captions and thumbnails

- Captions (STYLE.md decided): Montserrat Bold, lowercase as spoken (single capital letters like a letter name stay capital), white fill, #0E161C outline (6 px at 1920 wide; 9:16 uses 5 px), soft shadow (offset 0,5, blur 9, alpha 120); 16:9 72 px at 90 % height, max width 60 %; **9:16 84 px at 70 % height, max width 80 %**; chunk <= 3 words and <= 18 chars, break at punctuation/pauses (> 0.40 s clears), min 0.25 s on screen, never end a chunk on a lone function word; pop-in 0.86 -> 1.07 -> 1.00 over 160 ms + 50 ms fade-in then a hard cut.
- Chips (A11 kit, one font family, in/out <= 0.18-0.3 s, <= 2 at once): card, corner tag, status X/check, number (ExtraBold), timer, cream tag; red X is a drawn vector (Montserrat lacks some glyphs: check coverage of the arrows, approx signs etc., else draw them).
- Thumbnail (`thumbnail_long.py`, wrapped per video by `thumbnail.py`): the text is a **2-4 word question, ALL CAPS Montserrat Black, cream text with ONE yellow #FFD21F word**, on a render of the video's payoff state (the same model, colours and highlight as in the video). `thumbnail_long.py` specifics: text top-left, <= ~45 % of the width, 10-12 px black stroke + soft shadow, one hero cropped close (60-75 % of the frame; `thumbnail_crop = [x0, y0, width]` fractions of the beauty), on a saturated background that complements the hero (brass/orange hero -> cobalt blue); the README calls the render "dark, moody", and the 3D Shorts' `thumbnail.py` cuts a 16:9 window out of the 9:16 beauty render around the subject and darkens the edges (vignette) so the lit subject carries the frame. The "dark graded hero in a big round port with a teal ring, text left" composition the user loved is the **2D-era** (Oct 4-5) thumbnail: the 3D code draws no teal ring, so do not add one. Output `thumbnail.png` + `thumbnail-168x94.png`. A/B alternates are recorded in the script (`thumbnail_text_ab`); the owner picks. See the writing file (7.2) for the conflict between "shortened title question" and "the question the title raises".

## 11. `BLENDER.lock` and the ticket scheme (one Blender at a time; GPU + RAM shared)

- Files: `experiments/zdf-3d-long/BLENDER.lock` (JSON `{agent,pid,t,start,note}`, created atomically) and `BLENDER.queue/<ticket>.json` (`{agent,pid,t,priority,slot_in}`). `python pipeline/blender_lock.py status`.
- Take the lock only when your ticket is the oldest **live** ticket (dead pids are ignored), no `blender.exe` runs (ANY: the user's `S:/ambient` and `dorm_room/marble_tiles` jobs do not use the lock but always win), and the lock is free. A lock older than **180 s** with no `blender.exe` is stale and replaced. Poll every 10 s; after release sleep 20 s so waiters get a turn (a long chunked render cannot starve others).
- Per-video drivers add **priority by release date** (lead, 2026-10-11): tickets `0z<epoch>` (calendar items; `0zz<epoch>` for the Oct 19 hydrant so it sorts after `0z`); **`0x<epoch>` = slot-in for jobs <= 10 min** (previews, stills, blocking/animatic chunks, hand kit, thumbnail, scene-build checks) which may go between another agent's chunks; plain-epoch tickets for undated work (character tests, `characters/run_blender.py` stamps its ticket with a fixed `TICKET_DATE` so it sorts after every dated calendar ticket); an undated long used `8z`. A dated driver never holds a ticket while an EARLIER-dated calendar item waits, and yields if an earlier owner released < 60 s ago (it is between two chunks). `KNOWN` dicts in each `make.py` map agent names to dates.
- If the user starts a Blender job: finish the current chunk and stop. Chunks of 300-450 frames (~12-15 min) keep stopping cheap.
- Ad-hoc Blender runs must use `blender_lock.run_blender([...], agent=..., log=...)`.

## 12. Render settings, chunks, GPU budget (RTX 5060 Ti 16 GB, shared)

- Shared-pipeline look: EEVEE, 32 samples, raytracing at half resolution, fast GI, motion blur 0.5, DOF f/16 (mm scale), Standard view at -0.5 EV, Poly Haven HDRI + 3 suns. 3D Shorts: per-item finals at 48 samples (barcode `--samples 48`); dressed cabin/exterior plan = Cycles 48 spp + OIDN at 1080x1920 (no volumetrics; cloud deck = shaded plane), x-ray/diagram passes EEVEE; character test CG-1 = EEVEE 1080x1920, 48 TAA, motion blur 0.4, AgX Medium High Contrast. Previews 640-960 px, 8-12 samples, every 15th frame (2 fps) or `--frames a,b`; animatic 540p-960 px, 8 samples, 260-400-frame slot-in chunks.
- Chunks: shared driver 450 frames; per-video drivers 300 (`CHUNK`), resumable by skipping existing `f_NNNNN.png`; after a crash drop the possibly partial last frame. Render each long in pieces < 2 h; night windows 01:00-09:00 Morocco for long renders.
- Rates measured: zipper 1.5-1.9 s/frame (1080p, EEVEE 32); lighter 2.6 s/frame (48 spp); dressed Cycles Short ~4 s/frame planned. Budgets: Short 1.4-2.3 GPU-h (incl. previews + one re-render reserve), long 8-10 GPU-h (hold < 8 by aiming for 6 min, instancing, 32 samples, denoise instead of samples). A 3-day cycle is ~15 GPU-h of 72 h (~21 %).
- `compose.py` runs on CPU (PIL/numpy) after render; `ffmpeg` at `C:\bin\ffmpeg.exe`.

## 13. Gotchas (each cost a render round)

- **Never run `est_timing.py` after `make.py voice`**: it overwrites the real `timing.json` with the estimate. Table read refuses the estimate.
- EEVEE **shadow pool overflow** ("Shadow buffer full 2392/2048") makes lights leak and clipped pixels reach 49 %; the log records fixing it with `shadow_pool_size = 1024` (0-0.3 % clipped afterwards). Check the Blender log for the warning whenever frames clip. Per-shot exposure trims + an exposure-bracket preview mode (`--bracket`) exist in barcode's `build.py`.
- **Stale `matrix_world`**: new objects have a stale world matrix until the depsgraph updates; call `view_layer.update()` before reading it (a label decal was reset inside the pack and invisible in half the shots).
- `set_lights()` re-assigns light energy from base values every frame: multiply per-frame factors after that call or a "0 until the lamp clicks" value cannot latch.
- Blender 5.x **layered actions**: no `action.fcurves`; set `obj.animation_data.action_slot` after assigning an action (use `retarget.fcurves(action)`).
- A glove/hand that "was fixed" must be **verified by a render**; log entries marked done before a render are treated as unverified (barcode's third verification caught a 30 cm mannequin forearm and a frame 0 that was a void).
- Frame 0 geometry pass != readability pass (F0 vs F0h). Chip text read as UTF-8 only; mojibake like "MIAMI BEACH Â· 1949" reached a render once.
- `make.py` only runs `gates.py` in its `gates` step: previews/animatic/thumb do not call it, so a failing gate does not block a still: run gates explicitly before each stage.
- Opening Rain/Snow with `--factory-startup` skips their rig UI scripts; rigs still evaluate. Never open a library `.blend` and save over it.
- Voice server down (`docker ps` shows `Exited (137)`): do not restart; log it and work on stages that need no voice (frame-0 look, hands stills, EEVEE animatic on estimated timing).
