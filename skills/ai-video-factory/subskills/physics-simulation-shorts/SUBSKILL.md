---
name: physics-simulation-shorts
description: Make, schedule, debug or extend satisfying physics-simulation Shorts (9:16) and long-form compilations (16:9) - the Material Trials channel in material-trials/. Real Blender (Bullet rigid bodies, cloth, Voronoi fracture, Cycles) and Taichi MLS-MPM simulations, recorded CC0 foley placed on simulated events, one line of on-screen text, a weekly Windows Task Scheduler job (MaterialTrials-Weekly runs weekly.py run) filling Tuesday and Friday release slots. Use for any request about this channel, simulation/ASMR/satisfying Shorts, a hydraulic press / steamroller / drop-ladder / blade / funnel video, the novelty planner, QC failures, the release calendar or the long-form. Never use generative video, 3D or audio for this channel.
---

# Physics-simulation Shorts (Material Trials)

## What this video type is

A feed of short, silent-of-speech, slow-motion physics experiments: a few named materials meet one obstacle
(a hydraulic press, a steamroller, a ball ladder onto a glass pane, a blade, a funnel) in an escalation ladder; the
outcome of each material is **measured** from the simulation and shown as one line of text. One Short is 12-60 s
(typically 12-20 s), loops seamlessly, carries no narration and no music, and is uploaded Tuesday and Friday 17:00
(Africa/Casablanca) after a human approves it. A long-form compilation of the wide cuts is built every 8 weeks.

The channel is "a feed of satisfying animations, not a show". Its working name `material-trials` is internal;
viewers never see it.

## When to use / not use

Use this subskill for anything inside `material-trials/` (specs, bakes, renders, foley, QC, planner, ledger,
release calendar, long-form, weekly job) and for designing new simulation scenarios or families.
Do NOT use it for narrated explainers (`news-explainer`, `everyday-systems-explainer`), found-clip cards
(`clip-card-shorts`) or ambient streams (`ambient-long-form`). Stay inside `material-trials/` when editing; other
channels' folders are off limits to this work (repo ownership rule, still in force).

## Pipeline, in order, with the gate at each step

`weekly.py run` (or `make_episode.py <slug>` for one video) runs these. Each step skips if its output exists, so a
crashed run resumes.

| # | Step | What happens | Gate (fails = stop or replace) |
|---|---|---|---|
| 1 | Slots | `weekly.py` lists Tue/Fri 17:00 slots in the next 14 days (tomorrow onward) | slot already `scheduled` = skipped |
| 2 | Plan | `season/catalog.py plan()` draws candidates per family, `season/novelty.py` filters them against the whole production memory, picks the most novel | **Novelty gate**: scenario gap 6, <=1 shared material, new rig on return, never an exact repeat; nothing passes -> job stops, add scenarios (never relax) |
| 3 | Bake | Physics: Blender Bullet/cloth (`families/*/scene.py bake`) or GPU MPM (`families/blade/mpm.py`) | `family.sanity` (press soft body 0.02-1.6x rest height; story check below) |
| 4 | Score | CC0 foley placed on simulated events -> `work/mix.wav` (dry, crisp) | none automatic; check spectrogram by eye |
| 5 | Render + assemble | Cycles frames per aspect (`short` 1080x1920, `wide` 1920x1080) -> `finish_seq` adds ONE faded text line, loop dissolve, loudness chain -> `build/short.mp4`, `build/wide.mp4` | QC below |
| 6 | QC | `engine/qc.py` + `family.sanity` -> `build/qc.json` | duration, -16 LUFS +-1, true peak, freeze <=1 s, black frames, loop seam, text fraction <=0.65, story check |
| 7 | Metadata | `engine/meta.py` writes `metadata.json` (title <=100 chars, measured numbers, hashtags), thumbnail | title states the matchup; no branding or statements |
| 8 | File | `weekly.file_release` copies the upload set to `release-calendar/<YYYY-MM>/<DD>/<slug>/` with `upload-manifest.json` (sha256, schedule, QC, `privacy: private`) | QC passed |
| 9 | Retry | A failed build is replaced ONCE by a fresh candidate of the same family; the failed attempt stays in memory | second failure leaves the slot empty |
| 10 | Long-form | `maybe_longform`: when due (see operations), `longform/compile.py` joins the wide cuts | loudness chain; chapters >=10 s |
| 11 | Upload | **Human step.** No uploader exists; nothing auto-publishes (`channel.json upload.auto_upload=false`) | human review of contact sheet, loop seam, title |

The agent is the review layer: look at a contact sheet and loop-seam frames of the finished video before
declaring it good (QC cannot see "material hangs in the air" or "fracture started early"). Never add a model-API
backend to this pipeline (user rule: the agent is the LLM layer; see `references/research-findings.md`).

## Non-negotiable invariants

Each one has a reason; apply it to cases not listed.

1. **No generative anything** (user, 2026-09-25). Geometry is procedural, motion is computed physics (Blender 5.2
   Bullet rigid bodies, cloth-pressure soft bodies, Voronoi fracture, Taichi MLS-MPM), frames are Blender Cycles,
   sound is recorded CC0 foley. No diffusion/video/3D/SFX/music models, no TRELLIS/Hunyuan/Stable Audio, no
   LLM scoring inside the pipeline. Why: the channel's identity and its "not AI-generated" claim depend on every
   frame being a real computed simulation. Drop any roadmap item that needs a generative model.
2. **Verdicts are measured, never scripted.** SHATTERED / HOLDS / BROKE AT N / SPLIT IN TWO / SURVIVED /
   FLOWED THROUGH / JAMMED / BOUNCED BACK are computed from simulation data; metadata numbers come from the same
   data. Why: a verdict that disagrees with the picture destroys trust.
3. **Slower action** (user, 2026-09-25). Physics plays at `timing.speed` 0.5x through the solver `time_scale`
   (each 30 fps frame advances 1/60 s). Never slow with frame interpolation or retiming. Camera moves and edit
   timing stay in real viewer seconds.
4. **Short result holds, never removed, never frozen.** `timing.hold_s` 0.8 s after a settled result; no freeze
   frames; QC rejects any >1.0 s run with nothing changing.
5. **Dry, crisp mix.** Recorded foley on simulated events, silence between events, near-dry room
   (`room_wet` 0.035, `room_seconds` 0.28), no reverb wash, no ambient bed, no music, -16 LUFS. Why: user found
   demos echoey and overwhelming; the hits are the focus.
6. **One line of on-screen text.** It fades in when its content changes, holds, fades out, stays hidden until
   the next change (QC `text_visible_fraction` <= 0.65). Series name, specs and credits go in upload metadata.
7. **Every video is unique** (user, 2026-09-26). A new scenario with new materials, or a returning scenario with
   a different rig AND different materials. New colours/textures on the same scenario = repetition. Plan only via
   `catalog.plan()`; rejected-but-rendered videos stay in memory (`season/HISTORY.md` + ledger fingerprints). When
   nothing passes, write a new scenario; never relax the rules.
8. **Not a show.** No series name, episode numbers, outro, end card, "made by me", or authenticity/"no AI"
   statements in anything viewers see (titles, descriptions, on-screen text, long-form). The long-form opens
   straight into action (frame 1 is a payoff shot). Episode ids (S1E04...) are internal.
9. **The five visual rules** (user, 2026-09-26/10-03; details in `references/quality-gate.md`):
   (a) a material looks like its name, and behaves like it; (b) no invisible colliders - every boundary the
   material touches is rendered where the solver has it; (c) fracture starts at the real contact point at the real
   contact moment; (d) text fades in on changes and out again; (e) Shorts play their whole story in order,
   show every result in full, and loop seamlessly (dissolve into the opening, never rotate the timeline).
   QC enforces (d) and (e); check (a)-(c) on the contact sheet.
10. **Uploads are a human step**, private by default; the pipeline ends at `release-calendar/`.
11. **Physics before pictures.** Sanity/story checks on the engine state run before anyone looks at renders.

## Route the task

| Task | Read |
|---|---|
| Resume work / "what is the state?" | `references/current-state.md`, then `weekly.py status` |
| Run, schedule, debug, resume, clean up builds; commands; GPU and disk | `references/operations.md` |
| Stage flow, family interface, timing model, files per episode, release folder, ledger | `references/architecture.md` |
| Add/change a scenario, family, material, rig knob, novelty rule; solver parameters; verdict thresholds | `references/scenario-families-and-uniqueness.md` |
| Any change to looks, fracture, text, loops, lighting, or any QC failure | `references/quality-gate.md` |
| Sound, loudness, AAC, text geometry, encode, loop dissolve | `references/audio-and-finish.md` |
| Why the channel looks/sounds/runs this way; what was rejected and why; engine/tool/licence facts | `references/research-findings.md` |

## Where the live data lives (repo-root `material-trials/`, relative paths)

- `channel.json` - cadence, timing, render, loudness, upload policy (single source of truth for the numbers).
- `episodes/<slug>/spec.json` (tracked), `run.log` (tracked), `work/` (bakes, frames, `clean_<aspect>.mp4`,
  `mix.wav`; git-ignored), `build/` (`short.mp4`, `wide.mp4`, `metadata.json`, `qc.json`, thumbs).
- `season/LEDGER.json` (the only state), `season/HISTORY.md` (readable memory), `season/weekly.log`.
- `release-calendar/<YYYY-MM>/<DD>/<slug>/` - upload-ready sets; browse in `release-catalog` by adding this root.
- `longform/<id>/` - compilations; `assets/sfx/` - CC0 foley and `LICENSES.csv`; `web/` - showcase previews.
- `engine/` shared code; `families/{press,drop,blade}/` (`scene.py` = Blender, `family.py` = driver,
  `blade/mpm.py` = Taichi solver, `press/score.py`); `season/{catalog,novelty}.py`; `tools/` helper scripts.
- Research behind the design (archived outside the repo, summarised in `references/research-findings.md`).

## Environment and commands

Run everything from `material-trials/`. Interpreter: `material-trials/.venv/Scripts/python.exe`
(Python 3.13 with Taichi 1.7.4, numpy, scipy, Pillow, soundfile; below written `$PY`). `engine/common.py` defaults
to it; override with `MT_PYTHON`. Blender 5.2: `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe`
(override `MT_BLENDER`). FFmpeg `C:\bin\ffmpeg.exe`. Bahnschrift font `C:/Windows/Fonts/bahnschrift.ttf`.
GPU: RTX 5060 Ti 16 GB (OptiX; driver >= 575). Never run two GPU jobs at once (Taichi + Taichi, Taichi + Cycles).

```
$PY weekly.py status                                   # ledger: episode, slot, status, title
$PY weekly.py history                                  # regenerate + print season/HISTORY.md
$PY weekly.py plan [--horizon-days 14]                 # write specs/ledger entries for empty slots (no build)
$PY weekly.py run  [--horizon-days 14]                 # the scheduled job: plan, build, QC, file, long-form if due
$PY weekly.py register --slug <slug> --release 2026-11-10T17:00:00+00:00   # file a hand-built episode (match the ledger's offset; see operations)
$PY weekly.py reject   --slug <slug> --reason "..."    # withdraw: slot freed, stays in memory as rejected
$PY make_episode.py <slug> [--aspects short] [--from score|render|qc|meta] [--keep-frames]
$PY make_episode.py <slug> --remix                     # re-score foley into the finished cuts, no re-render, re-QC
$PY longform/compile.py <id> <slug> <slug> ...         # compilation by hand -> longform/<id>/
$PY tools/rebuild.py [--resim|--rerender] <slug>...    # rebuild sequentially, file passing ones
$PY tools/refinish.py <slug>...                        # re-assemble + QC + re-file after a text/loop/sound rule change
powershell -File tools/register_weekly_task.ps1 -Python "<repo>\material-trials\.venv\Scripts\python.exe"
```

The scheduled task `MaterialTrials-Weekly` (Task Scheduler, current user) runs `weekly.py run` Sundays 01:30,
catches up at next logon, `MultipleInstances IgnoreNew`, 12 h limit. Its action holds an absolute interpreter path:
its default now points at `material-trials/.venv` (the venv was moved there in 2026-11).
`Unregister-ScheduledTask MaterialTrials-Weekly` removes it.
