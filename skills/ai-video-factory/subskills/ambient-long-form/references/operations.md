# Ambient channel operations: environment, exact commands, resume, backup rule, honesty rules

All commands run from `ambient-channel/engine/` (imports and the `tiles` subprocess depend on that working directory)
with the channel's OWN venv `S:/ambient/venv/Scripts/python.exe` (use `-u -B`: unbuffered output, no `.pyc`).
Never pip-install into the shared repo venv `<repo>/.venv/` (it belongs to HES/Etcherr871; it was `engine/.venv` before the
repo reduction). Venv packages: see `engine/requirements.txt` (numpy 2.5.3, scipy, soundfile, pymunk 7.3.0, opencv-python, pillow).

## Contents
1. Environment and hard rules
2. Pilot / demo windows
3. Full render commands (incl. the concurrent marble pair)
4. Monitoring, resume after a crash, redoing a piece
5. Backup-before-edit rule
6. Re-verifying research numbers
7. Honesty rules for timings
8. Cleanup after a render is accepted
9. Task-runner notes

## 1. Environment and hard rules
- Tool paths (hard-coded in code): ffmpeg `C:/bin/ffmpeg` (`.exe`), ffprobe `C:/bin/ffprobe.exe`, Blender
  `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe`.
- **Disk.** H: (repo) is a nearly full 7,200 rpm HDD. ALL caches, demos, renders, textures and scratch live in `S:/ambient/`
  (NVMe; ~235 GB free on 2026-10-12). Delete scratch after use. Keep one video in flight (segments + audio ~ 2x the master).
  Layout: `venv/`, `cache/` (sim, tiles, sprites, passes), `tex/` (+`LICENSES.json`), `demos_v5/`, `renders/`, `backup_<date>/`,
  `keyframes/`, `tiletest/`, `run_demos.py`, `run_keyframes.py` (stale).
- **Ownership.** `ambient-channel/` is gitignored (`.gitignore:134`): NO version control, so work is easy to lose. Never write
  under `technews/`, `hidden-everyday-systems/`, `material-trials/`, `etcherr871/`. Its release calendar is a staging mirror at
  `ambient-channel/release-calendar/` for exactly this reason (see `packaging-and-release.md`).
- **GPU** (RTX 5060 Ti 16 GB) is shared with the owner's apps (~9 GB already used). ComfyUI (`comfyui-ambient`) is stopped; never
  run it with dots.tts. One GPU service at a time (Blender / NVENC / compositor).
- **Content rules** (engine-level): audio synthesised only; dim night grade with no static bright element and nothing startling for
  sleep scenes; textures/models real CC0 Poly Haven only, via `fetch_textures.py`; a demo window must match the same span of the
  full render sample for sample (use `--start`).
- Machine: 31 GB RAM (about 9 GB free with the owner's apps open at test time) - this is why the 10 h marble sim is memoised and
  memory-mapped (`architecture-and-stages.md` section 5.2).

## 2. Pilot / demo windows
One window (audio, loudnorm, video, mux; writes `<scene>_s<seed>_<start>+<secs>s.{mp4,wav,json}`):
```
S:/ambient/venv/Scripts/python.exe -u -B pilot.py <scene> <seed> <seconds> <out_dir> [--lufs -24] [--start S]
```
`--start` must be a multiple of 60. Demo + QC in one go (several windows in parallel; prints `DEMOS_DONE`):
```
S:/ambient/venv/Scripts/python.exe S:/ambient/run_demos.py "scene|seed|secs|outdir|--start|N" ["..."]
# e.g. "marble_machine|3|120|S:\ambient\demos_v5|--start|60"   (its ENG path is the absolute repo path of engine/)
```
QC of any mp4 (writes `<stem>.qc.json`, `.sheet.png`, `.spec.png`): `python qc_demo.py <file.mp4>`.
Approved demos (2026-10-12, "great, proceed"): `S:/ambient/demos_v5/roommate_typing_s11_17880+180s.mp4` (busy window) and
`marble_machine_s3_60+120s.mp4`; `roommate_typing_s11_16140+120s.mp4` is the sleep/wake window.
Grade-only changes need only a demo re-run (~4 min); re-render the Blender light passes (~26 min) only if camera or scene changes;
marble sprites re-render ~8 min. Measure per-third luma on a REAL composited, decoded frame, not on Blender's AgX preview.

## 3. Full render (the real thing)
Roommate, all stages, 10 h:
```
python -u -B full_render.py roommate_typing 11 10 S:/ambient/renders
```
Marble needs the Blender plates first. Two processes (different lock files, so they may overlap):
```
python -u -B full_render.py marble_machine 3 10 S:/ambient/renders --stages tiles
python -u -B full_render.py marble_machine 3 10 S:/ambient/renders --stages audio,video,final,qc   # start once the 10 h sim cache exists
```
(2026-10-12 a small PowerShell wait script `launch_marble_after_sim.ps1` started the second command when the sim cache
`S:/ambient/cache/marble_dfdecd8872f2196c.pkl` appeared; it was deleted afterwards. The video stage trails the tiles, which render
faster than the video consumes them. HANDOFF: the `tiles` stage "must finish ahead of the video stage"; do not start `video` unless the tiles it will reach exist or are produced faster than consumed.)
Options: `--seg-min 30` (segment length), `--lufs -24`, `--workers 6` (audio worker processes; `render_audio.render` default is 8).
Output: `S:/ambient/renders/<scene>_s<seed>_36000s/` with `audio.wav`, `seg_000..019.mp4`, `final.mp4`,
`final.qc.json/.sheet.png/.spec.png`, `state.json`, `run.log`, `segments.txt`, `audio.raw.json`.
Stage order for planning: sim + tiles (marble only; hours of GPU time) -> audio -> video (the long pole, about real time, section 7) -> final mux
(an I/O-bound stream copy of ~4-18 GB) -> qc (a full-file loudness decode plus 8 frame grabs). No clean timings exist for audio/final/qc (section 7).

## 4. Monitoring, resume after a crash, redoing a piece
- Check on a run: `Get-Content S:/ambient/renders/<job>/run.log -Tail 5` (PowerShell). Look at mtimes of the newest `seg_*.part.mp4`.
- **If a run dies** (crash, reboot, closed session): rerun the SAME command. It resumes at the first unfinished piece: audio is skipped if
  `audio.wav` + state exist; existing `seg_NNN.mp4` are skipped; `final.mp4` is skipped if done. `*.part*` files are leftovers and are overwritten.
  A lock left by a dead PID is ignored; a live PID refuses with "another full_render (pid N) is already running stages ...".
- Redo a piece: delete it (`seg_007.mp4` + `final.mp4` redoes that segment and the final mux only; delete `audio.wav` and
  the `audio` key in `state.json` to redo audio; delete tiles to re-render them). Truncated tiles (<2 MB) are removed automatically by `tiles`.
- Cache invalidation after a look change: bump the version (see architecture section 7). Existing cache files are skipped even if stale.
- A failed final-stage check (duration > 0.5 s off, or packet count != hours x 3600 x 30) raises: do not hand-edit state to get past it; find the bad segment.
- Long jobs run as scripts (detached), never inside the harness's Python eval kernel (died twice, exit 130). The old harness used `hub start <fresh name>`
  (a reused name can return a stale completion; verify output files and their mtimes); the bash tool times out at 300 s. Any detached runner (background
  task, Windows Task Scheduler with `-StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit 12h`) works because the job resumes itself.

## 5. Backup-before-edit rule (non-negotiable)
Before editing ANY engine file or report file, copy it to a dated folder `S:/ambient/backup_<YYYY-MM-DD>/` (same relative layout, `engine/...`,
plus a `NOTE.txt` saying what the original state was, e.g. the 2026-10-12 note: `roommate_typing_visual.py` in that backup already has the new grade;
original EXPOSURE=32.0, TOE=0.05). Why: there is no git history. Existing backup: `S:/ambient/backup_2026-10-12/` (engine, `r12_outputs/`, `r13_outputs/`, three reports).
After edits, re-run the relevant check (demo vs full prefix, or the report script) and record what changed in `HANDOFF.md`.

## 6. Re-verifying research numbers
Do not trust report prose; re-run the offline scripts in `ambient-channel/research-output/data/` (they run from cache, no network):
`report12-third-discovery/pool12.py` + `score12.py` reproduce `pools12.json`, `tables12.json`, `ideas-pass3.csv`; `report13-quiz/score13.py`
reproduces `ideas-quiz.csv` + `tables13.json` (both reproduced byte for byte on 2026-10-12). If you change a pool/filter, re-run and update the report tables.

## 7. Honesty rules for timings (apply to every number you write down)
- Never quote timings measured while other GPU/CPU jobs ran as speed figures (the 2026-10-12 renders overlapped; `state.json` `wall_s` is wall-clock only).
- Frame-generation fps is not end-to-end speed. Check filename-to-number pairing before reporting.
- The only corrected speed figures (HANDOFF, measured clean on demos): roommate video stage 0.9-1.1x real time (108.4 s for the 120 s demo, 203.3 s for 180 s; `frame_fn` alone 31.9 fps), so ~9-11 h of video stage for 10 h;
  marble ~0.96x real time plus ~4 h GPU time for the Blender tiles (re-measure; the 2026-10-12 tiles stage ran far longer while sharing the machine).
- R04's compositor fps (191-236 / 120-152) came from a prototype, not this engine. Output sizes at 10 h were MEASURED on 2026-10-13 (roommate 4.36 GiB, marble 17.0 GiB), not extrapolated.

## 8. Cleanup after a render is accepted
`seg_*.mp4` and `audio.wav` (~9.9 GB each per job) are redundant once `final.mp4` is accepted: delete them then; delete the marble tiles/sim cache
only if space is needed (they key a re-render). Keep each master ONCE at `S:/ambient/masters/<slug>/video.long.mp4` (move/hardlink, never copy; NTFS
hardlinks work only within one volume; do not edit a linked master in place; keep the file name identical because the manifest `sha256` map is keyed by name).

## 9. Task-runner notes (legacy `Suggested skills` from HANDOFF, mapped)
Scope-boundary check before touching files; no `/tmp` paths or process substitution in Git Bash; if writing source through a Python eval kernel, beware `!` corruption;
use systematic debugging for render/QC anomalies; verify with measured frames and `final.qc.json` before reporting. Those named skills were harness skills of the earlier setup.
