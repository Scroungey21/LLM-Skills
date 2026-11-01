# Material Trials - operations

Contents: environment · everyday commands · the weekly job · what each command really does (gotchas) · where to look
when something breaks · resume and rebuild rules · GPU etiquette · disk · long-form · cadence and render budget.

All commands run from `material-trials/`. `$PY` = `material-trials/.venv/Scripts/python.exe` (Python 3.13, Taichi
1.7.4, numpy, scipy, Pillow, soundfile). `engine/common.py` defaults to it; override with env `MT_PYTHON`.
Blender 5.2: `C:\Program Files\Blender Foundation\Blender 5.2\blender.exe` (override `MT_BLENDER`).
FFmpeg: `C:\bin\ffmpeg.exe` (hard-coded in `common.py`). Windows font: `C:/Windows/Fonts/bahnschrift.ttf`.

## Everyday commands

```
$PY weekly.py status                       # episode, slot (to the minute), status, title
$PY weekly.py history                      # rewrites + prints season/HISTORY.md
$PY weekly.py plan [--horizon-days N]      # specs + ledger entries for empty slots, nothing built
$PY weekly.py run  [--horizon-days N]      # the scheduled job
$PY weekly.py register --slug S --release ISO     # add a hand-built episode to ledger + calendar
$PY weekly.py reject   --slug S --reason "..."    # withdraw (slot freed; stays in memory as rejected)
$PY make_episode.py S                      # build or resume one episode (both aspects)
$PY make_episode.py S --from score|render|qc|meta
$PY make_episode.py S --aspects short      # Short only
$PY make_episode.py S --keep-frames        # keep PNG frames + particle caches
$PY make_episode.py S --remix              # re-score foley, swap into finished cuts, re-QC (no frames needed)
$PY longform/compile.py <id> S1 S2 ...     # compilation by hand
$PY tools/rebuild.py [--resim | --rerender] S...   # sequential rebuild; files each passing one
$PY tools/refinish.py S...                 # re-assemble both cuts (frames or clean master), QC, re-file, update ledger
blender -b episodes/S/work/<scene>.blend --python tools/freeze_breaking.py   # old blends only: live-boolean 'Broken' -> precomputed crack states, no re-sim (use the Blender 5.2 exe)
$PY tools/build_showcase.py                # rebuild web/index.html showcase from ledger + QC (small web copies, inline poster data: URIs; videos load via fetch -> blob: so they play in a sandboxed viewer)
$PY assets/sfx/fetch_sfx.py                # re-download the CC0 packs listed in assets/sfx/LICENSES.csv
```

After `--remix` or any change to a finished episode, re-file it:
`$PY weekly.py register --slug S --release <its ISO slot>` (copies the new files into `release-calendar/` and
refreshes the sha256 manifest). `tools/refinish.py` does this itself.

`rebuild.py` flags: no flag = resume (renders skip existing frames; an interrupted build continues - deleting
frames unconditionally once threw away 328 finished frames). `--rerender` = keep the simulation, delete frames +
clean masters + overlay json (needed after any look/scene change, because renders skip frames that exist).
`--resim` = also delete `analysis.json`, `*.blend`, `press.json`, `stage_*.json` and `sim_*` so the current solver
and rules re-simulate.

## The weekly job

- Windows Task Scheduler task **`MaterialTrials-Weekly`** (current user, no admin): trigger weekly on
  `cadence.build_weekday` / `build_time` (Sunday 01:30); `StartWhenAvailable` (catches up at next logon);
  runs on battery; `ExecutionTimeLimit` 12 h; `MultipleInstances IgnoreNew` (two builds never collide).
  Action: `<python> material-trials\weekly.py run`, working directory `material-trials/`.
- Install/update: `powershell -File tools/register_weekly_task.ps1 -Python "<repo>\material-trials\.venv\Scripts\python.exe"`.
  **The script's own default `-Python` is the archived research venv** (`physics-shorts-research\.venv`), which no
  longer exists after the repo reduction: always pass `-Python`. Remove: `Unregister-ScheduledTask MaterialTrials-Weekly`.
- The job fills every Tue/Fri 17:00 slot in the next `horizon` (14) days, starting **tomorrow**. Slots in the past
  are never refilled (Oct 27 and Oct 30 2026 stayed empty after every candidate failed).
- Order inside `run`: for each slot: skip if a `scheduled` entry exists; else reuse the planned entry or
  `new_spec`; build; on QC pass file into the calendar; on failure plan **one** replacement of the *same family*
  (`family=entry["family"], salt=1`) and build it; after all slots, `maybe_longform`.
- Family rotation (`press -> drop -> blade`) decides the first family tried; `new_spec` falls back to the other
  families when the first has no passing candidate. Only the retry is restricted to the failed family.

## Gotchas in the code (real behaviour, not intent)

- **`--dry-run` is not side-effect free**: `new_spec` writes `episodes/<slug>/spec.json` and a `planned` ledger entry
  before the dry/plan check. `plan` and `--dry-run` therefore behave identically: they only skip the build. Reject
  or delete unwanted planned specs by hand (`weekly.py reject` frees the slot).
- **The same-family retry can crash the job.** If no candidate of that family passes the novelty rules,
  `new_spec` raises `RuntimeError("no candidate passes ...")`, which `run` does not catch: the job aborts, later
  slots stay unfilled and long-form is skipped, and nothing is logged to `season/weekly.log` (the traceback goes
  to Task Scheduler's last result only). The 2026-11-01 log ends exactly like this (FAILED at 03:10, then silence; Task Scheduler reported
LastTaskResult 1 at 12:08, so the run died there - the cause is inferred, not confirmed). After a
  failure run `weekly.py status`, then `plan` by hand and look at the output.
- `register_existing` and `file_release` copy whatever is in `episodes/<slug>/build/`; they do not re-run QC.
- `reject` deletes the episode's calendar folder and marks it `failed` with the reason. A *failed rebuild* of an
  already-filed episode does NOT delete its old calendar folder: `release-calendar/2026-10/16/` holds both the
  roller episode (scheduled) and `mt-s1e06-funnel-clay-fine-sand-packed` (ledger status failed). Trust the
  ledger/`weekly.py status`, never the folder listing, before uploading.
- Release timestamps are stored with a `+00:00` offset in the ledger and manifests although the declared timezone is
  Africa/Casablanca (README examples used `+01:00`). Whoever uploads must schedule 17:00 **Casablanca local time**
  deliberately; do not copy the manifest offset blindly.
- `config.cadence.longform_target_s` is not read by any code (see Long-form).

## Where to look when something breaks

- `episodes/<slug>/run.log` - every stage's output (Blender per-frame lines filtered).
- `season/weekly.log` - the weekly job's own log: `planned`, `READY`, `FAILED`, `REJECTED`, `LONG-FORM`, `registered`
  lines (a failed line includes the truncated QC dict).
- `episodes/<slug>/build/qc.json` - which check failed (keys `short`, `wide`, `physics`).
- `season/HISTORY.md` - all attempts with failure notes.
- Task Scheduler "last run result" for crashes that never reached the log.

Recurring failure patterns seen so far (see `current-state.md` for the instances):
Short under 12 s (4.47, 8.7, 11.9 s); loudness 17.0-17.4 LUFS (after a loop trim - fixed by normalising last);
freeze > 1 s (jam/heavy-ball stages); story check with no turning point (all jellies survived); the drop/hopper
target that never broke; Blender build error with `press.json` missing (bake died - read `run.log`).

## Resume and rebuild rules

- A stage is skipped when its output exists. Delete `episodes/<slug>/work/` to re-simulate everything, or the
  specific `analysis.json` / `stage_*.json` / `press.json`.
- Renders never overwrite frames; after a look change delete `work/frames_*` (and `clean_*.mp4`, `overlay_*.json`).
- A change to text/loop/sound rules needs **no re-render**: `tools/refinish.py` (picture) or `--remix` (sound).
- A preview is not proof: single-frame previews have no motion blur and hide animation-only bugs; extract frames
  from `work/clean_<aspect>.mp4` after any fracture/visibility change (see quality-gate traps).

## GPU etiquette

- Drop bakes are CPU (Bullet). MPM (Taichi/CUDA) and Cycles renders both use the GPU.
- **Never run two Taichi solves, or Taichi plus a Cycles render, at once**: a clay MPM run crashed that way. They
  slow each other down (a 5,000-ball bake plus a render roughly doubles render time). A CPU Bullet bake may overlap
  a render.
- Other agents/tools on the machine (TTS servers, ComfyUI) share the 16 GB card; render time varies from ~8 to
  ~20 s per frame. Never start TTS/ComfyUI while a build runs; the weekly task's `IgnoreNew` only protects against
  a second weekly instance, not against manual GPU work.
- Cycles 5.2 OptiX needs NVIDIA driver >= 575. Render the whole frame range in one Blender process: the first
  frame includes shader compile (~6.7 s vs ~1.6 s steady EEVEE; Cycles similarly).

## Disk

With `render.keep_frames` false, PNG frames and MPM point clouds are deleted after QC passes. What remains per
episode: `.blend` bakes, JSON data, `clean_<aspect>.mp4`, `build/short.mp4`, `build/wide.mp4` (the long-form is
compiled from the wide cuts). Mantaflow-style caches (~11.5 MB/frame at res 128) and FLIP (>300 MB/frame) are not
used; MPM PLY sequences and frames are the bulk during a build. `episodes/*/work/` is git-ignored.

## Long-form

- `maybe_longform` (end of every `weekly.py run`): due when there has never been a long-form and >= 2 x
  `longform_every_weeks` (16) `scheduled` episodes are not yet in a long-form, or when the last one is >= 7 x 8 = 56
  days old. It compiles **all** ready episodes' wide cuts, marks them `in_longform`, appends to
  `longforms`, logs `LONG-FORM`.
- `longform/compile.py <id> <slug>...`: cold open = up to 4 payoff clips (verdicts containing BROKE, SHATTERED, SPLIT,
  STAYED FLAT) of 3.2 s each, frame 1 already action (no fade in); then every wide cut in full with 0.3 s video+audio
  fades (first piece no fade-in); no outro, no end card, no branding. Chapters (>= 10 s each, so a cold open
  shorter than 10 s is folded into chapter 1) go in the description; the description has chapters + hashtags only.
  Title: "N Minutes of Satisfying Physics Simulations | Slow Motion, No Music". Thumbnail: 2x2 mosaic of payoff frames,
  no added text. Audio: concat -> loudness chain (-16 LUFS) -> AAC 256k. Encode CRF 17 slow, GOP 2 s.
- **Gap:** the research target was an 8:10-8:40 compilation (about 8 min is the mid-roll threshold; compilation
  titles lift 1.27x, relax/sleep titles 2.04x). `channel.json longform_target_s [490,520]` is not enforced.
  With 12-18 s wide cuts, 16 episodes give about 4-5 minutes, not 8. The demo `longform/lf-demo` (6 videos, 1:55)
  was built by hand and is not in the ledger. To hit the target, raise the episode count threshold or add more
  material per compilation; decide with the user.
- `longform/lf-demo/` still contains `endcard.png`/`endcard.wav` from before the no-outro rule; `compile.py` no
  longer produces them. The README layout line "cold open + every wide cut + end card" is stale.

## Cadence and render budget (RTX 5060 Ti 16 GB)

- 2 Shorts per week (Tue, Fri 17:00 Africa/Casablanca), build Sunday 01:30 with a 14-day horizon = always about
  one week of buffer. Research: successful Blender channels post 0.76-2.27 Shorts/week; none daily; do not
  add volume - add variety.
- Press ~25 min per aspect (48/32 samples). Drop 20-30 min per aspect render plus a CPU bake of up to ~2 h for
  the 2,500-5,000-ball stage (two Bullet passes at the slow-motion step). Blade 10-20 min MPM plus renders;
  water is the slowest material. A week of 2 episodes in both aspects is about 2-3 GPU-hours.
