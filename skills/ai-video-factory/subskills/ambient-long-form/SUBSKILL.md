---
name: ambient-long-form
description: Make, resume, QC and package 10-hour procedural ambient videos (and plan the quiz line) for the @etcherr871 long-form catalog - the ambient-channel/ stream. Use it for any request about the ambient channel, roommate_typing or marble_machine scenes, the full_render.py tiles/audio/video/final/qc stages, resuming a crashed render, 10-hour loudness/size/loop limits, ambient QC gates, S:/ambient files, backups before editing the engine, ambient/quiz upload packages and release calendar, or the open owner decisions (IP-titled content exclusion, quiz directory, slots, category). Use it even when the request only says "10 hour video", "ambient", "sleep sounds" or "quiz video".
---

# Ambient long-form (the 5th stream: `ambient-channel/`)

## What this video type is
10-hour (10:00:00-11:59, never >= 12 h) ambient videos made by a deterministic, procedural engine: a Blender-rendered
plate/pass set composed per frame in numpy/OpenCV, streamed to NVENC in 30-minute closed-GOP segments, with synthesised audio
(modal DSP + scheduled events, no samples, no music, no speech) rendered in 60-second blocks. Nothing loops: events come from
seeded schedulers. Brand promise (research): "places that never loop". Target channel: **@etcherr871** (long-form catalog next to its
clip-card Shorts); a second long-form line, **game/media quizzes**, is planned (research only; `references/quiz-line.md`).
Built scenes today: `roommate_typing` (seed 11, "Someone's Here" series, dim ceiling view) and `marble_machine` (seed 3,
"Slow Machines" series, screen-on night grade). Both 10 h masters exist on `S:/ambient/renders/`. All other scenes are PLANNED, not built.

Use this subskill when the task is about 10 h ambient renders, the ambient engine, its QC/packaging/release, or the quiz line.
Do NOT use it for narrated explainers (news-explainer / everyday-systems-explainer), 15-60 s Shorts (physics-simulation-shorts,
clip-card-shorts), or anything that needs TTS, found footage or generative video: the ambient channel forbids all three.

## Where things live (repo-relative; the heavy files are on S: and keep their real paths)
| What | Where |
|---|---|
| State document (authoritative) | `ambient-channel/HANDOFF.md` |
| Engine (scenes, renderers, QC) | `ambient-channel/engine/` (gitignored: NO version control) |
| Research (reports 00-14, MASTER-REPORT, `ideas*.csv`, offline data scripts) | `ambient-channel/research-output/` |
| Release staging mirror | `ambient-channel/release-calendar/` (`LEDGER.json`, `entries: []`) |
| Python venv (own; never use/modify `<repo>/.venv/`) | `S:/ambient/venv/Scripts/python.exe` |
| Caches (sim, tiles, sprites, Blender passes) | `S:/ambient/cache/` |
| CC0 textures/models + licence log | `S:/ambient/tex/` (`LICENSES.json`) |
| Demos | `S:/ambient/demos_v5/` |
| Full renders | `S:/ambient/renders/<scene>_s<seed>_36000s/` |
| Backups before edits | `S:/ambient/backup_<YYYY-MM-DD>/` (with `NOTE.txt`) |
| Masters (planned one-copy location; not created yet) | `S:/ambient/masters/<slug>/video.long.mp4` |
Tools (hard-coded in the code): ffmpeg/ffprobe `C:/bin/`, Blender 5.2 `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe`. Machine: RTX 5060 Ti 16 GB shared with the owner's apps, 31 GB RAM. H: (repo) is a nearly full HDD: nothing heavy goes there.

## The pipeline, in order, with the gate at each step
1. **Concept / G0 (human).** One authored concept per video (a written brief), series fit, theme licence tier (C9), audience rule (C10). Approve concept + a 10-min loop-free pilot + thumbnail archetypes + frozen thresholds before any 10 h render. Pick from the research start set (`references/research-findings.md` section 4), not at random.
2. **Scene code** in `engine/scenes/<scene>.py` (+ `_visual.py`, Blender scripts, optional pre-render script): timeline, bed, voices, frame function. Gate: pure function of (seed, absolute time); synthesised audio; CC0 assets fetched only via `fetch_textures.py`.
3. **Back up** the engine/report files you will touch to `S:/ambient/backup_<date>/` first (non-negotiable; there is no git).
4. **Demo windows** with `pilot.py` / `S:/ambient/run_demos.py` (+ `qc_demo.py`). Gate: owner approval of the demo; demo window == same span of the full render (`--start`, multiple of 60 s).
5. **Full render** with `full_render.py` (stages `tiles`, `audio`, `video`, `final`, `qc`; resumable). Gates built into it: segment duration within 0.1 s, final duration within 0.5 s, exact video packet count (hours x 3600 x 30), tiles >= 2 MB.
6. **QC and listening** (`references/qc-and-quality.md`): read `final.qc.json`; compare with the designed gate profile (sleep / focus / immersion); first-hour watch-through, sample frames, spectrogram. Most designed gates are NOT yet implemented: say so rather than claiming a pass.
7. **Package** (`references/packaging-and-release.md`): title grammar `[Place] | [one sound phrase]`, thumbnails, unique description with true provenance, `upload-manifest.json` with a `long_video` key, one master copy, `sha256`, staging mirror entry with `clip_id: "longform:<line>:<slug>"`.
8. **Upload / release (human present, private first).** 02:00 Morocco (UTC+0 since 2026-09-20), outside etcherr871's Shorts slots. Dual-track uploader plan, canaries and mid-roll rules are in the reference docs. An agent never publishes on its own; renders and uploads need human approval.
9. **Analytics and E1 decision gates** (G1-G3, thresholds frozen at G0): `references/research-findings.md` section 5.

## Non-negotiable invariants
- **Determinism:** timelines and frames are pure functions of (seed, absolute time); seeds via `zlib.crc32` (never salted `hash()`); a demo window is sample-exact (audio) and frame-exact (video) against the same span of the full render. Why: it lets a 10 h job resume and be re-verified from a 2-minute demo.
- **Whole-minute lengths; `--start` multiple of 60** (audio blocks are 60 s).
- **One static loudness gain over the WHOLE file**, 4x-oversampled limiter, AAC encoded once, no per-chunk normalisation. Why: `loudnorm` switches to pumping dynamic mode on sparse transient-heavy ambience.
- **Write `.part`, rename on completion**; rerun the same command to resume; delete a piece to redo it. One lock per stage set; dead-PID locks are ignored.
- **Caches are versioned by name and keyed by duration**: existing files are skipped even if stale, so bump the version when the look or events change.
- **Disk:** everything heavy on S:; one video in flight; delete scratch after use. **Memory:** never load the 10 h marble sim in an audio worker (use the memory-mapped roll array).
- **Content:** audio synthesised only; textures/models real CC0 Poly Haven only; no TTS, no generative video/audio, no stock/found footage; no IP/franchise names (C7, ambient line); strictly not made for kids and everyone-friendly (C10); no sleep/health claims (C6); never "No AI" claims (C5); dim night grade, nothing static and bright, nothing startling (sleep scenes).
- **Back up before editing** engine or report files; record changes in `HANDOFF.md`.
- **Never** edit or write under `technews/`, `hidden-everyday-systems/`, `material-trials/`, `etcherr871/` (read-only reading is fine); never pip-install into the shared repo venv; ComfyUI never runs together with dots.tts.
- **Honesty:** never quote timings measured while other GPU/CPU jobs ran as speed; frame-generation fps is not end-to-end speed; verify filename-to-number pairing; verify report numbers by re-running the offline scripts in `research-output/data/`; do not claim a gate passed that no code measures.

## Route the task
| If the task is... | Read |
|---|---|
| How the engine, scenes and `full_render.py` stages work; caches; adding a scene | `references/architecture-and-stages.md` |
| Run a demo or full render, resume after a crash, monitor, back up, clean up, timing honesty | `references/operations.md` |
| Check/QC a render; loudness, size, loop, GOP limits; the gate tables (built vs designed); known contradictions | `references/qc-and-quality.md` |
| Why this channel/series/themes; scoring system; the E1 experiment and thresholds; policy; licences; feasibility numbers; uploader decisions | `references/research-findings.md` |
| Titles, thumbnails, descriptions, disclosure fields, package layout, ReleaseCatalog, release time, etcherr871 scheduler couplings | `references/packaging-and-release.md` |
| Game/media quiz videos (market, template, scoring, QG1-QG5, QZ-01 spec) | `references/quiz-line.md` |
| What is done, what is next, open decisions, stale-HANDOFF corrections | `references/current-state.md` |

## Commands (run from `ambient-channel/engine/`, always `S:/ambient/venv/Scripts/python.exe -u -B`)
```
# demo window (audio -> loudnorm -> video -> mux); --start must be a multiple of 60
python pilot.py <scene> <seed> <seconds> <out_dir> [--lufs -24] [--start S]
# demos + QC (prints DEMOS_DONE):   S:/ambient/run_demos.py "scene|seed|secs|outdir|--start|N" ...
# QC any mp4 (writes .qc.json/.sheet.png/.spec.png)
python qc_demo.py <file.mp4>
# full 10 h render, resumable (rerun the SAME command after any interruption)
python full_render.py roommate_typing 11 10 S:/ambient/renders
python full_render.py marble_machine 3 10 S:/ambient/renders --stages tiles                    # Blender plates; computes the 10 h sim first
python full_render.py marble_machine 3 10 S:/ambient/renders --stages audio,video,final,qc     # separate process/lock; start once the sim cache exists
# options: --seg-min 30  --lufs -24  --workers 6  --stages tiles,audio,video,final,qc
# check on a run
Get-Content S:/ambient/renders/<job>/run.log -Tail 5
```
Long jobs run as detached scripts (never inside the harness Python eval kernel); the old harness used `hub start <fresh name>` and verified output files and mtimes.

## Current state in one paragraph (details and contradictions: `references/current-state.md`)
Research complete; engine built; v5 demos approved 2026-10-12; both 10 h masters rendered and QC'd on 2026-10-13 (roommate 4.36 GiB, -24.2 LUFS / LRA 4.1 / TP -1.9; marble 17.0 GiB, -24.0 LUFS / LRA 4.7 / TP -2.1). Owner sign-off on the full renders is unknown; `seg_*` and `audio.wav` (~9.9 GB each per job) await cleanup; `S:/ambient/masters/` does not exist; no upload path has been exercised; roommate misses the sleep-profile audio gates; the masters use GOP 60 and no `-use_editlist 0`; synthetic-media disclosure is undecided; the ambient channel is not in CLAUDE.md's ownership table. Open owner decisions: quiz pipeline directory, long-form use of etcherr871 slots, the " (x)" day-marker fix, ambient category, staging mirror vs shared calendar, and whether the Star Wars titles in report-12's P3-02 pool count as IP-titled content to exclude (left in so far; they change no score).
