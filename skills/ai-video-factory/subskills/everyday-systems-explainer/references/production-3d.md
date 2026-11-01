# Hidden Everyday Systems: the 3D / Blender production line (current, Oct 2026)

Entry point for the CURRENT line of the channel. Source: `hidden-everyday-systems/production-3d/` (plans, tools, characters,
writing, research, one folder per video) plus the shared engine `hidden-everyday-systems/experiments/zdf-3d-long/pipeline/`.
Everything is repo-relative to the repo root unless it says otherwise. The older 2D (v2/v3) pipeline is **stopped**
(user, 2026-10-10: "from now on we'll only focus on the 3D animations"): do not render, narrate or schedule 2D.

Detail files (read the one your task needs):
- [production-3d-tools-and-gates.md](production-3d-tools-and-gates.md): shared pipeline modules, every gate ID with its threshold, `voice_lock`, `BLENDER.lock`, render/GPU numbers, `release.json`, gotchas.
- [production-3d-writing-and-research.md](production-3d-writing-and-research.md): the writing bible (hooks, rhythm, formats T1-T10, gags, reframes, titles, thumbnails), the Why Side study rules W/P/H/A, fact verification.
- [production-3d-characters.md](production-3d-characters.md): the faceless "you" avatar (YOU-BIBLE), poses, gates, hidden storyline, CG-0..3 gates, `3Dassets`.

Contents: 1 What it is · 2 Quality bar · 3 Cadence and formats · 4 Folder layout · 5 Stages and gates · 6 Per-video file set ·
7 Commands · 8 Scheduling and release · 9 3D vs 2D · 10 Where things live and what breaks on the move · 11 State as of 2026-11-01 ·
12 Contradictions and stale constants

---

## 1. What the line is

Every video is a **Blender 5.2 EEVEE/Cycles render of computed mechanics** (real dimensions, 1 Blender unit = 1 mm, motion a
pure function of drive values), narrated by a synthetic voice, with captions, chips, SFX and a music bed composed in Python.
Two products, built as separate videos:

| | Daily Short | Long (documentary) |
|---|---|---|
| Format | 9:16, 1080x1920, 30 fps, ~45-55 s, one mechanism inside a story | 16:9, 1920x1080, 30 fps, 5-7 min in chapters |
| Slot (Morocco, UTC+1, `Africa/Casablanca`) | **17:00 every day** | **20:00 every 3 days** |
| Words | 90-130 (`script_gates`), ~130 max in practice | 750-1,100, chained Short-sized segments |
| Voice | **o1** (OmniVoice clone, CC-BY-NC weights, user's choice) | **vm5** (VoxCPM2, Apache-2.0) |
| Ending | standalone: reframe line + 1-2.5 s hold, **no CTA** | long ends on `result` + hold; its summary Short keeps the CTA |

Why this exists: the user wants quality over quantity ("extremely high quality, well crafted, well thought out, well researched,
absolute perfection"); the 2D object-in-a-void format scored worst on the benchmark channel (The Why Side's Microwave, 31 K views vs.
up to 11.2 M for history + everyday object stories), so every Short is a **story in a real place with the mechanism as the reveal**
(x-ray inside the same shot).

Not owned here: the user uploads (nothing auto-publishes); only the user sets `review.status` to `approved`.
A long may also cut a teaser/summary Short, but it **never replaces a daily Short slot**. **Time zone caveat:** Morocco is UTC+1 (`+01:00`) in October 2026 only; every `publish_at` and the per-video `release.py` hard-code `+01:00`. Re-check against `Africa/Casablanca` before Ramadan 2027 (Morocco drops to UTC+0 then) or timestamps will be wrong.

## 2. Quality bar (user rules, all permanent unless dated)

1. **Real references first**: patent figures, manufacturer drawings, dimensions; drawn to scale; motion computed from the mechanism; nothing fades in/out, no overlap/jump/spin (proof gates).
2. **Plain scripts**: one idea per sentence, plain words, an everyday comparison for every number (W10/R9).
3. **Highlight what the narration names**: ONE uniform **orange** (#FF8A3D fill, #B8460E edge, #EB673D bloom), rest dimmed ~62 %. The user reverted a yellow trial on 2026-10-10. It is a rim, never a flood (X1 gate). Yellow (#FFD21F) exists ONLY as the thumbnail key word. Arrows are rare (only for a part named while another is in focus, never on the focus, never on screen < 1.5 s).
4. **Captions** (ZDF-style, decided 2026-10-05): Montserrat Bold, lowercase as spoken, white with #0E161C outline + soft shadow, 1-3 words (<= 18 chars) pop-in chunks, NO coloured word, never Arial/orange ("linked to AI slop"). Red X / green check live on **chips**, not captions.
5. **Camera never goes out-and-back** (no A-B-A, no pull-back-then-push-in on one object, no whip away and back); it turns/moves directly to the part being explained. Cuts are allowed in the multi-shot Shorts but not a reversal inside a shot.
6. **Triple verification** on every video: (1) automated gates **and proof that each gate bites**, (2) every preview/animatic reviewed (agent, contact sheet at 1-4 fps), (3) post-render 1 fps frame-sequence check. Plus an independent fresh-context fact check (stage V) and a re-check of changed voiced lines before voicing (owner rule 8).
7. **Never move or add to the user's hand-placed days**: Oct 13-15 are uploaded; Oct 16-19 are placed (see section 11).
8. **GPU is shared**: the user's own Blender jobs (`S:/ambient`, `dorm_room/marble_tiles`) always win; one Blender at a time through `BLENDER.lock`.
9. **The agent is the LLM layer**: no model-API backends in pipelines; judgement steps are file hand-offs (contact sheet + notes `.md`) that Claude reads and writes decisions into; code gates the files.
10. Music: only licence-clean beds from `hidden-everyday-systems/examples/music-library.json` (Kevin MacLeod / Scott Buckley run Content ID: the exact credit text goes in the description); music and SFX must sit under the voice in EVERY octave band (gate AB). Never buy anything without asking.
11. Real people = stylised generic CG characters, no invented dialogue, description line "CG characters, not portraits". No gags near anyone's death or injury.

## 3. Cadence and formats

- Plan history: `PLAN.md` (2026-10-10, 1 Short/day + 1 long/3 days, object-only mechanism cards) -> `PLAN-v2.md` (2026-10-11, story formats, amended 2026-10-12 and 2026-10-18). The v2 amendments override v1 dates; **the "New date" table at the top of PLAN-v2 overrides its own slate table**.
- Short formats: **mech-in-place** (mechanism in a real set), **T1 what-if** ("you" scenario), **T2 crime uncovered**, **T3 history -> modern object (fix ladder)**, **T5 disaster to design**, plus the writing bible's **T6 Mechanism Mystery, T7 Sabotage Test, T8 Day in the Life, T9 Wrong Gear, T10 Last Line of Defence**. Beat tables in `production-3d-writing-and-research.md`.
- **Character levels** per item: C0 no characters (gloved-hand inserts at most) · C1 hands/backs/distant figures/silhouettes · C2 one hero per shot with body acting · C3 several interacting characters / period costume / crowds. Every character slot has a **no-character fallback built from the same set, script spine and mechanism** (`script.short.fallback.json`): a failed gate costs a format, not the day. Go/no-go is decided at the item's D-5 start from the **latest passed** character gate (never hopes), and can still drop to the fallback at the animatic (D-3).
- Mix rules: no two neighbouring days in the same subject group; long days carry light (C0/C1) Shorts so a long and a C3 Short never fight for the GPU; >= 80 % of slots are mechanical/physical objects or big hidden systems; protocols/companies only if the whole explanation is a physical mechanism; never reuse a covered subject or close variant (grep `examples/`, `production-batches/*/topics/`, `release-calendar/`, `production-3d/` first).
- The Short slate of 2026-10-17 -> 2026-11-03 and the five longs (helicopter Oct 25, Comet Oct 28, container Oct 31, molasses Nov 3, Crippen Nov 6 per the 2026-10-18 amendment) are in `PLAN-v2.md` and `writing/slate/*.md`. Long-day Shorts: C0/C1.

## 4. Folder layout

```
hidden-everyday-systems/
  production-3d/
    PLAN.md  PLAN-v2.md                 plans (PLAN.md section 4 workflow, release.json, GPU + lock rules still apply)
    schedule_3d.py  schedule_3d_tests.py  catalog_3d_tests.py   release-calendar feeders (section 8)
    script.short.json  shots_plan.py    0-BYTE PLACEHOLDERS at this level. The real ones are per video (below)
    tools/        script_gates.py  script_gates_bite.py  voice_lock.py
    writing/      WRITING.md  README.md  slate/*.md  rewrites/*.after.txt
    research/     VERIFIED-FACTS.md
    characters/   YOU-BIBLE.md  lib/  you/  cg1/  CG-STATUS.json  STORYLINE-LEDGER.json  run_blender.py
    YYYY-MM-DD-long|short-<slug>/       one folder per video
  experiments/zdf-3d-long/pipeline/     shared engine (stages, gates_long, blendlib, camlib, voice, mix, captions ...)
  experiments/whyside-research/         STUDY.md (benchmark study; its rule IDs are used everywhere), TOOLS.md
  experiments/voice-v2/round2/          o1 / vm5 voice candidates + RESULTS.md
  3Dassets/                             CC0/CC-BY asset library (characters, animations, sets, props, textures, HDRIs, MPFB2)
  examples/music-library.json           licensed music beds
  release-calendar/                     <YYYY-MM>/<DD>[ (x)]/<slug>/upload-manifest.json + LEDGER.json
  renderer-public/hidden-systems/fonts/ Montserrat (moved here from `renderer/public/`; see section 10)
```

**Video folder name** = `YYYY-MM-DD-long|short-<slug>`. The date is the **production slot date at planning time**, NOT necessarily the final
release date (soda-can-tab is `2026-10-14-...` but released Oct 16, hydrant `2026-10-17-...` released Oct 19). The authoritative date is the
`release` block of the script / `release.json`. **Outputs live in `<video>/output/`** (`short.mp4` | `video.mp4`, `thumbnail.png`,
`release.json`, contact sheets); `PLAN.md`'s `production-3d/output/<date>-<kind>-<slug>/` is stale, but `schedule_3d.py` still searches both.
Scratch/resume state lives in `<video>/work/` (and `work/short/` for the Short variant), `refs/` holds downloaded reference images.

## 5. Stages and the gate at each

D = release date. A Short starts at D-5, a long at D-9 (the first long was compressed to 8 days). Every stage writes to disk so a killed agent resumes from files (24 h without progress on disk pulls the fallback / next card).

| Stage | When (Short / long) | What | Exit gate |
|---|---|---|---|
| **R** Research | D-5 / D-9..D-7.5 | Open every source; `REFERENCE.md` gets a **claims table** (claim, source URL, date opened, <= 15-word quote, confidence H/M/L) + visual references (real dimensions, sets, costumes) | Every script fact H or M; L facts cut or voiced as "the story goes". "Gap" items from the card closed with a real drawing/spec + dimensions **before any build** (else swap the topic) |
| **V** Independent verification | D-5/D-4 | A **fresh-context** agent re-opens every URL and re-checks every number, name, date | 0 mismatches (verification #1 of 3). Re-run (owner rule 8) after any later wording change, before voicing |
| **S** Script + shot list | D-4 | `script.short.json` in the template, then `est_timing.py` -> `shots_plan.py` -> `shots.json` (15-25 shots with anchors, chips, SFX in pauses, gag slots, fallback, GPU plan) | `tools/script_gates.py` 8/8; shots.json checks (P1/P2/P3/W3/P7 plan/H1/A11/A2) |
| **T** Table read | D-4 | Real o1 voice take, measured WPM per register and pauses; a fresh agent scores it against STUDY 7 / WRITING 8 | `table_read.py`: score >= 90 % with no hard fail (hook <= 2.5 s, ASR 100 % match, P6 170-195 WPM on voiced time, pauses 0.4-1.0 s, script_gates 8/8); max 2 rewrite loops |
| **A** Animatic | D-3 | EEVEE 540p blocking playblast of all shots with final voice, chips, captions, characters in key poses. A grey **blockout** animatic comes BEFORE set dressing | `post_gates.py --animatic`: P7 >= 25 % big steps, <= 12 % static; agent review (A1, narration/visual contradiction check on the lead frames). **User review** for the first Short of each new format and every long |
| **B** Build + previews | D-3 -> D-2 | Sets, characters, sims, lighting; 4 fps contact sheets; frame-0 look; hands stills | `gates.py` + `bite_test.py` all pass (mechanism gates: zero overlap, connected streams; character gates); `post_gates.py --stills` X1/X1r/X2; F0h (4-person sound-off look of frame 0) |
| **F** Final render | D-2 | Chunked (<= 300 frames per item, 450 shared), via `BLENDER.lock`; compose, mix, contact sheets, thumbnail, `release.py` | all gates exit 0; `post_gates.py output/short.mp4` (P5, P7, AB); post-render 1 fps frame-sequence check (verification #3) |
| **U** User review | by D-2 20:00 (long D-3) | full video + thumbnail + `release.json` | only the user sets `approved`, by D-1 20:00. Not approved -> the **fallback variant** takes the slot (rendered first whenever a gate is borderline); a long slips <= 24 h, later longs keep their dates |

Buffers: aim to have the next day's Short approved when today's airs; the rendered void-style soda-can/sprinkler Shorts were the emergency bank (now used). Lead time ~4 days per Short, ~9 per long, so ~4-5 Shorts and ~3 longs are in flight at once (<= 4-5 worker agents).

## 6. Per-video file set (real examples: barcode-gum Short, hydrant Short, jet-engine long, helicopter long)

**Pre-build (always):** `REFERENCE.md` (sections: claims table, facts NOT claimed and why, visual reference with real dimensions, script changes per verification round, description material, sources + problems) · `script.short.json` / `script.long.json` (+ `script.short.fallback.json` for character slots) · `est_timing.py` (estimated word times, `script_gates` model) · `shots_plan.py` -> `shots.json` (stage-S shot table: id, anchor word, set, register world|xray|void, picture, camera, transition_in, highlight, chips, sfx incl. pause fills, gags, energy events, characters, thumbnail_source) · long: `build_script.py` writes `script.long.json`, `shotlib.py` = `Timeline` + shot-table checks.

**Script JSON shape:** `slug, variant, standalone, kind, register, format, character_level, release{date,time_morocco,timezone}, title, alt_titles, thumbnail_text, accent_word, music, voice{voice, engine, speed|instruct, seed, gap_s, ASR + P6 notes, recheck_before_voice flag}`, `sentences[]` = `{id, role: setup|part|core|result|cta, text, pause_after, min_wpm/target_wpm/max_wpm, speed?, cues:[[word, group]]}`. `pause_after` (0.4-1.0 s) is where the pre-turn SFX fill goes. Longs add `chapter`, `chapter_hold_before_s`, `end_hold_s`.

**Build (Blender + Python):** `make.py` (stage driver, see 7) · `voice_o1.py` / `voice_local.py` (+ `engine_check.py`) · `pauses.py` (inserts `pause_after` silence, shifts all word times; idempotent) · `timeline.py` (-> `work/short/beats.json`: per-frame camera/subject/shot/chip/event data) · `spec.py`/`geo.py`/`vmath.py`/mechanism modules (`scanner.py`, `upc.py`, `jetlib.py`...) = real dimensions + pure kinematics, no bpy · `mats.py`/`textures.py`/`*_look.py` · `build.py` (the Blender scene, animate, render loop) · `handlib.py`/`hands_kit.py`/`hand_calib.py` (gloved hands, MPFB2) · `sfx.py` (events from beats.json; `sfxlib.finish`) · `compose.py` (captions + orange bloom + chips + video-specific overlays) · `topic_gates.py` or `gates.py` · `bite_test.py` · `post_gates.py` · `table_read.py` · `thumbnail.py` / `thumb.py` · `release.py` (writes `output/release.json`).
Longs also carry: `plan_long.py`/`plan_short.py`, `compose_jet.py`/`compose_local.py`, `gates_local.py` (documentary profile), `make_release.py`, `render_night.py`, `timeline_short.py` (the long's 9:16 summary Short), `review_beats.py`.

**Resume state in `work/` (keep, it is the memory of the item):** `verify_responses.md` (every independent verification, per round, what changed), `recheck.md/json` (word-for-word re-check of voiced lines against freshly fetched sources), `table_read.md`, `frame0_look.md` (F0h record), `hands_look.md`, `stage_TABF_log.md` (dated log ending in a numbered **RESUME RECIPE**), `shots.pre-*.json` / `timing.pre-*.json` / `beats.pre-*.json` (snapshots before each rewrite), `stems/audio-report.json`, `gates.json`, `bite_test.json`, `post_gates.json`, `stills_gates.json`, `p7_animatic.json`.

## 7. Commands

Run from the video folder with the repo-root `.venv` Python (`<repo>/.venv/Scripts/python.exe`). Blender 5.2 at `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe`; ffmpeg at `C:\bin\ffmpeg.exe`; VoiceStudio on `127.0.0.1:3900`.

```
python ../tools/script_gates.py script.short.json --timeline         # stage S gate (8/8); also on writing/slate/*.md
python ../tools/script_gates_bite.py                                  # proves the writing gates can fail
python est_timing.py && python shots_plan.py                          # -> shots.json (re-run after voicing)
python make.py voice            # voice_o1.py inside voice_session("omnivoice") + pauses.py -> timing.json, narration.wav
python table_read.py            # stage T (needs the REAL timing; refuses the estimate)
python make.py beats            # textures.py + timeline.py -> work/short/beats.json (re-times cuts/chips/events to real words)
python make.py gates ; python make.py bite                            # gates.py ; bite_test.py (both must pass)
python make.py blocking | animatic [--res 960 --samples 8]            # EEVEE low-res passes (slot-in tickets) + post_gates --animatic
python make.py preview [--every 15 | --frames a,b] [--res 640] [--samples 8] [--tag x]
python make.py render [--samples 48]                                  # 1920 px, 300-frame chunks, resumable (rerun to continue)
python make.py final            # compose + mix + contact sheets (2 fps, 1 fps)
python post_gates.py output/short.mp4                                 # P5, P7, AB on the finished file
python make.py thumb --frame <F> ; python release.py                  # thumbnail.png (+168x94), output/release.json
python make.py status           # blender_lock status
```
Long-form variants through the shared driver: `python make.py voice beats gates preview render final --variant long|short` (see the tools file).
**Never run `est_timing.py` after voicing** (it overwrites the real `timing.json` with the estimate).

## 8. Scheduling and release (what each script does)

| Script | Purpose |
|---|---|
| `production-3d/schedule_3d.py <item_dir> [--force] [--share-slot]` | The 3D counterpart of `release-calendar/schedule_release.py`. Reads the item's `release.json` (in the item or its `output/`; accepts `date`/`time` or `release_date`/`release_time_morocco`; time must be `17:00` or `20:00`). Copies `short.mp4`->`video.short.mp4`, `video.mp4`->`video.long.mp4`, `thumbnail.png`; writes `titles.txt`, `description.txt`, `description.short.txt`, `tags.md`, `sources.md` (a copy of `REFERENCE.md`), `upload-manifest.json` (sha256s, `status` = `ready_to_upload` only if `review.status == approved` else `awaiting_user_review`, `pipeline_version: "3d"`); updates `LEDGER.json`; renames the day folder to `"<DD> (x)"` once it holds `day_target` ready items. Refuses a second item at an occupied time unless `--share-slot`. **Never uploads.** |
| `production-3d/schedule_3d_tests.py` | One-off (2026-10-11): released the four finished 3D TEST videos (key lock, zipper, lighter, seatbelt) into the free Oct 11-12 slots (the user later hand-moved them to Oct 13-15) and deleted `release-calendar/3d-tests/`. Not a unit test. |
| `production-3d/catalog_3d_tests.py` | One-off (2026-10-11): listed the finished 3D tests under `release-calendar/3d-tests/` (status `test_not_scheduled`) so the Release Catalog viewer showed them. Not a unit test. |
| `production-3d/shots_plan.py` (root) | **Empty file.** The real `shots_plan.py` is per video (stage S); it is a shot-list builder, not a scheduler. |
| `release-catalog/` (WPF viewer, kept as-is) | Displays `release-calendar/` contents. |

`release.json` schema (per item, `output/release.json`): `kind, slug, format, release_date, release_time_morocco, date, time, timezone, publish_at` (ISO with `+01:00`: valid for Oct 2026 only, re-check the Casablanca offset before Ramadan 2027), `title, alt_titles, description` (5-part: hook, 60-120-word facts, honesty line, sources with exact citations, licences + 3-5 hashtags), `tags, video, thumbnail, category: "Education", made_for_kids: false, music{id, license}, credits_required, cta: null`, `honesty`, `review{status: pending, reviewed_by, reviewed_at, notes}`. A long adds the nested `short{file,title,description}` (or `short_video/short_title/short_description`).

## 9. How 3D differs from the older 2D v2/v3 pipeline

| | 2D v2/v3 (stopped) | 3D (current) |
|---|---|---|
| Picture | drawn diagrams/animations (Remotion renderer), gameplay-clip side bars | Blender EEVEE/Cycles scenes, computed kinematics, located sets with x-ray in the same shot |
| Form | summary Short that is a card with the full video's story, CTA to the full video | standalone daily Short (no CTA) + long documentaries; a long's own summary Short keeps the CTA |
| Quality gates | `pipeline_v3.py` revisions (3.3 triple verification, 3.4 SFX, 3.5 ADHD pace, motion_check/attachment gates) | per-item `gates.py` (+ `bite_test.py`) on beats.json, `script_gates.py`, `post_gates.py`, `gates_long.py`; same philosophy, new IDs |
| Voice | OmniVoice house voice (cloned `hidden-systems-informational`) | **o1** (Shorts) / **vm5** (longs) through `voice_lock.py` |
| Writing | process voice | story-first (WRITING.md), gated by `script_gates.py` |
| Scheduling | `release-calendar/schedule_release.py` (reads 2D `package.json`) | `schedule_3d.py` (reads `release.json`) |
| Compute | CPU/Remotion, parallelisable | one GPU, one Blender at a time (`BLENDER.lock`), chunked resumable renders |

## 10. Where things live and what breaks on the move

- **Fonts**: scripts hard-code `H:\Projects\YTtechnews\hidden-everyday-systems\renderer-public\hidden-systems\fonts\Montserrat-Bold.ttf` / `-ExtraBold.ttf` (`Montserrat-Black` for thumbnails) in: `experiments/zdf-3d-long/pipeline/captions.py`, `.../thumbnail_long.py`, every per-video `compose.py`, `gates.py` (A11b glyph check), `thumb.py`, `production-3d/characters/cg1/compose.py`, `characters/you/sheets.py`. The fonts now live in **`hidden-everyday-systems/renderer-public/hidden-systems/fonts/`** (repointed 2026-11-01; if a font path errors, grep for `renderer\public\hidden-systems` leftovers) (a missing font fails the A11b gate; it never silently passes).
- **Music**: `pipeline/mix.py` reads `hidden-everyday-systems/renderer-public/music/<file>` (repointed 2026-11-01) and `examples/music-library.json`.
- **Old channel voice reference**: `pipeline/voice.py` still points at `tts-dots/voices/hidden-systems-informational.wav` (now `ai-video-factory/toolkit/tts-dots/voices/`); the o1 path (`voice_o1.py`) does not use it (it reads `experiments/voice-v2/round2/candidates/o1-ym-mod-us-50703/`).
- **VoiceStudio**: `127.0.0.1:3900`, container name hard-coded as `yttechnews-voicestudio-1` in `voice_lock.py` (`docker exec ... /proc/meminfo`). Compose now lives in `ai-video-factory/toolkit/docker-compose.yml` / `toolkit/voicestudio/`: **keep the compose project name `yttechnews` so the container stays `yttechnews-voicestudio-1`**. API key: `VOICESTUDIO_API_KEY` in the repo-root `.env` (never print it).
- **Python**: repo-root `.venv/` (was `engine/.venv`); needs numpy, scipy, shapely, soundfile, Pillow, faster-whisper (`small.en`), fontTools, PyMuPDF.
- `voice_lock.py`'s lock file is `experiments/zdf-3d-long/VOICE.lock` next to `BLENDER.lock` + `BLENDER.queue/`.
- `characters/run_blender.py` and `hands`/MPFB runs set `BLENDER_USER_RESOURCES=<3Dassets>/tools/blender-user` for that process only (never the user's own Blender config).

## 11. State as of 2026-11-01 (dated; merge into `current-state.md` if the subskill keeps one)

- **Finished and placed in `release-calendar/`** (all `"(x)"`-marked): days 01-12 are 2D items (their manifests say `pipeline_version: v3`); Oct 13 pencil + key-lock; Oct 14 lighter + seatbelt; Oct 15 zipper (3D tests hand-placed by the user); **Oct 16 jet-engine long + soda-can-tab**; Oct 17 fire-sprinkler-bulb; Oct 18 tire-valve; **Oct 19 frozen-city-hydrant + panama-canal-locks long**. Oct 20 onward is **empty**.
- **In progress, nothing finished:** `2026-10-20-short-first-barcode-gum` has only preview contact sheets (r1-r4, f0a-c, h1-h3, t16) and a log ending 2026-10-19 08:50: facts re-checked (3rd verification), script 130 words 8/8, gates pass except F0h (frame 0 still reads as "object in a void"), glove fix unverified, **voice never generated** because VoiceStudio was down (`Exited (137)` since ~17:30 Oct 18). Its numbered RESUME RECIPE in `work/stage_TABF_log.md` is the template for resuming any item.
- `plane-door-35000ft`, `truck-brakes-air-off`, `post-it-failed-glue`, `quicksand-wont-swallow-you` (Shorts) and `helicopter-couldnt-fly-forward` (long, Oct 25): plan stage only (`REFERENCE.md`, scripts, `shots_plan.py`/`shots.json`, `est_timing.py`); no build, no output. The helicopter long has `script.long.json` and a vm5 voice block (VoxCPM2, profile `voice-v2-r2:vox-vm5`, no speed control; the animatic waits for the user's review).
- **Character gates:** CG-1 `pass: true` per the agent on 2026-10-19 08:48 (v14 build; PLAN-v2 section 4 requires user approval of each gate and **no user sign-off is recorded in the files**). The plane-door `shots.json` still has `primary_variant: "fallback"`, rule: build the avatar variant only if `cg1.pass == true` by 2026-10-19 20:00. CG-2/CG-3 were not built. See the characters file for follow-ups.
- **Writing:** 21 slate files exist (Oct 19 -> Nov 3 + 5 longs), all 8/8 on `script_gates.py`; they are older than the per-video `script.short.json` and are **superseded by them** where they differ (barcode's REFERENCE section 3 says so explicitly).
- The calendar after Oct 19 and the open reserves (Gimli Glider, child-resistant cap, penny-on-the-rail, locking pliers, Otis "All safe" needing user approval, airport baggage, hydro dam, bascule bridge) are decisions for the user.

## 12. Contradictions and stale constants found (do not "fix" silently; ask)

- `schedule_3d.py` `day_target()` expects **2 items on every day where `(date - 2026-10-13) % 3 == 0`** (Oct 16, 19, 22, 25 ...). Oct 22 has no long since the 2026-10-18 amendment, so Oct 22 can never earn its `(x)` marker. Later longs (Oct 25, 28, 31, Nov 3, Nov 6) still land on the epoch's 3-day grid.
- `schedule_3d.py` writes `voice_id: "hidden-systems-informational (OmniVoice)"` into every manifest and ledger entry, although Shorts use o1 and longs vm5.
- `voice_lock.py` `NOT_BEFORE = 2026-10-19 18:00` (local clock, which runs UTC) gates VoxCPM2 switches; it is a launch-date guard that is now in the past.
- PLAN-v2 contains several date tables (slate table, 2026-10-12 table, two amendments). The long slate filenames in `writing/slate/` carry pre-amendment dates (helicopter `2026-10-22-long-...` but released Oct 25; Comet `10-25` vs Oct 28; container `10-28` vs Oct 31; molasses `10-31` vs Nov 3; Crippen `11-03` vs Nov 6). `writing/README.md` says `STORYLINE-LEDGER.json` has old dates, but the ledger already matches the re-dated Short table (that note is stale). The order of videos is unchanged everywhere.
- PLAN.md says `zdf-3d-long/README.md` section 1 "still says yellow": that is resolved, the README now says orange.
- PLAN.md pipeline-change notes ("documentary" and "standalone" profiles) were implemented locally per video (`gates_local.py`, `gates.py`), not merged into `pipeline/`. `pipeline/gates_long.py` still enforces the 2.5-3.5 min long and the `cta` short profile.
- `script.short.json` and `shots_plan.py` at `production-3d/` root are 0-byte files.
- Word budgets disagree by tool (90-130 vs 60-115 vs 380-650 vs 750-1,100): the applicable one is in the table in `production-3d-tools-and-gates.md`.
