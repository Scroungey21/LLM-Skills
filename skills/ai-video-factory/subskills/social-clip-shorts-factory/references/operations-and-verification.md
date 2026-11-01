# Operations: install, daily/weekly runs, CLI surface, scheduling and the verification script

Source: README, `operations.md`, `tooling.md`, `cli.py`, `scripts/verify-project.ps1`, `pyproject.toml`. **None of this runs until the code is restored** (`restore-from-archive.md`); the commands
describe the archived tool. Run from the project root; inspect `--help` because options may have evolved.

Contents: 1 Safe startup - 2 Install - 3 CLI surface - 4 Daily production - 5 Weekly - 6 Scheduling - 7 Verification script - 8 Testing - 9 Engineering safety rules - 10 What a skill-driven session must not do

## 1. Safe startup (every session)

1. Run the verification script (section 7). 2. Read the active config and confirm `youtube_upload_enabled: false`. 3. Confirm the inbox path, but **do not scan it** until the owner starts the workflow
(the intake once held thousands of files, mostly memes; do not dump the tree). 4. Review the established look in `output/brand-previews/index.html` if previews exist. 5. `git status --short`; preserve unrelated work.

## 2. Install (Windows PowerShell)

Python >= 3.12, FFmpeg and FFprobe on `PATH`, `uv`.
```powershell
cd <ShortsFactory root>
uv sync --extra dev                 # base + tests;  add --extra tts for dots.tts, --extra vision for opencv/imagehash
uv run shortsfactory init           # copies config.example.yaml -> config.yaml, creates data/ output/ and the DB schema, makes the inbox folder
uv run shortsfactory doctor         # ffmpeg, ffprobe, channels, output dir, (tts deps+reference+sox), licensed music track
```
Runtime deps: fastapi, uvicorn, sqlalchemy, pydantic>=2.12.5, typer, rich, pyyaml, pillow, httpx, jinja2, python-multipart, google-api-python-client + google-auth-oauthlib (publisher only), tzdata.
`uv.lock` pins the set. `config.yaml`, `demo-config.yaml`, `client_secret.json`, `data/`, `output/`, `*.db` are gitignored; `demo-config.yaml` was never tracked (the README's demo uses it: create it
from `config.example.yaml` with `demo_mode: true`, `ai.provider: demo`, a temp inbox, eligible rights in the demo sidecars).

## 3. CLI surface (`shortsfactory`, global `-c/--config`, default `config.yaml`)

| Command | What it does |
|---|---|
| `init [--force]` | copy template config, create dirs + schema |
| `doctor` | pass/fail table; exit 1 on any failure |
| `discover` | adapters -> new `Clip` rows only |
| `process` / `render` | run the per-clip pipeline for tomorrow's quota (`render` is an alias) |
| `run` | `discover` + `process` |
| `prepare-next-day` | `run`, then write `output/next-day-<date>.json` (the owner's package index) |
| `review` | start the approval dashboard on `review_host:review_port` |
| `compilations build` / `weekly` | build up to `target_per_week_per_channel` compilations per channel |
| `compilations review` | same dashboard |
| `youtube auth <channel>` / `status` / `pause` / `resume` / `refill [--dry-run]` | publisher controls (disabled unless `youtube_upload_enabled`) |
| `analytics sync` | pull performance snapshots (demo mode fabricates numbers) |
| `optimize-frequency` | per-channel interval advice |
| `status` | clip counts by state, pending Shorts/compilations |
| `report` | weekly CSVs + HTML report |
| `demo` | create synthetic owned fixtures (user_owned sidecars) and run the pipeline |
| `examples [--slate path] [--force]` | render the 9-video brand-preview slate |
| `tts status` / `tts sample <channel> [--text ...]` | inspect / try dots.tts |

## 4. Daily production (SF-D7/SF-D8; target day = tomorrow in `Africa/Casablanca`)

1. The owner drops new files (+ rights sidecars) into the inbox. 2. `prepare-next-day`: discover only the bounded amount of unseen media needed to fill each active channel's quota; dedupe, safety,
rights, quality, route, copy, render, QA (`pipeline-and-data-model.md` section 2); number files per channel/day without overwrite; write `meta<n>.json`, per-channel `source-files.json`, the global
manifest; mark unknown/discovery outputs `permission_pending` and `publishable: false`. 3. `review` -> the owner (or Claude as first-pass reviewer, `approval-and-handoff.md` section 6) approves/rejects.
4. `report` -> `permission_request_queue.csv`: the single batched permission request after editing. 5. The owner uploads the cleared items. Nothing is uploaded by the factory.
The command never fills a quota by lowering a threshold: read `missing_by_channel`.
With Claude as the LLM layer the run is: code writes packets -> Claude writes `response.json` per job -> re-run -> render. Run packets in small batches and look at the first rendered cards before continuing.

## 5. Weekly / compilation days

`weekly` (Wednesday and Sunday by default) builds compilations from approved, unreused Shorts; review the long-form; upload only if every member clip is cleared (`compilation.md`). Then `analytics sync`,
`optimize-frequency`, `report`.

## 6. Scheduling

Use Windows Task Scheduler (or systemd timers on Linux) to run `shortsfactory prepare-next-day` once per day; configure `MultipleInstances = IgnoreNew` so two runs never overlap (the shared channels do the
same, e.g. Material Trials' `MaterialTrials-Weekly`). The app computes per-channel slots for metadata only. Creating a scheduled task is a persistent configuration change: ask the owner first.

## 7. Verification script (`skills/shortsfactory-continuation/scripts/verify-project.ps1 -ProjectRoot <root>`)

Archived as one of the 80 tracked files. Behaviour (read-only, safe to run; it never scans the inbox or deletes anything):
1. Resolve the root: `-ProjectRoot`, else `$env:SHORTSFACTORY_ROOT`, else three levels above the script (which is the project root when the script sits in `<root>/skills/shortsfactory-continuation/scripts/`).
2. Require these files, else throw: `pyproject.toml`, `config.example.yaml`, `src\shortsfactory\config.py`, `src\shortsfactory\ai\provider.py`, `src\shortsfactory\orchestrator.py`, `tests\test_core.py`.
3. Require the project venv: `.venv\Scripts\python.exe`.
4. Locate `ffmpeg` and `ffprobe` with `Get-Command` (reported, not required - but the crop-fill and foreshadow tests need them).
5. Import `load_config('config.example.yaml')` through the venv Python; print the active channel keys and `youtube_upload_enabled`; fail if the config does not validate.
6. Run `python -m pytest -q --basetemp=<root>\.pytest-tmp-skill` and capture the output.
7. Emit JSON `{project_root, active_channels, youtube_upload_enabled, ffmpeg, ffprobe, tests_passed, test_output, intake_scanned: false, media_deleted: false}`; exit with pytest's exit code.
Expected on a healthy restore: three active channels (`good_moments, how_things_work, memes`), `youtube_upload_enabled` False, `tests_passed` true (the last known result was 14 passed; re-run, do not
treat that count as current evidence). If `.pytest-tmp-skill` already holds user material, pass a different basetemp. Note the script is hard-wired to `.venv`; a `uv`-managed venv at that path
(`uv sync` creates `.venv`) satisfies it.

## 8. Testing

Focused: `.venv\Scripts\python.exe -m pytest tests/test_core.py -q --basetemp=.pytest-tmp-skill`. Full: `.venv\Scripts\python.exe -m pytest -q --basetemp=.pytest-tmp-skill`. Media tools: `ffmpeg -version`,
`ffprobe -version`. `pytest-asyncio` (dev extra) is required for the async tests. Tests monkeypatch ffmpeg probing/rendering in pipeline tests; two tests run real ffmpeg. See `current-state.md` for the behaviour
each test pins and what is untested. Validation must not process or delete intake media.

## 9. Engineering safety rules (tooling.md)

Small reversible patches; preserve unrelated changes in a dirty tree. Resolve exact filesystem targets before any deletion; **no recursive deletion against an env var, workspace root or glob**. Never scan intake, delete
media, publish, fetch or authenticate as a side effect of validation. No secrets in logs, metadata or hand-offs. Keep mechanical steps deterministic and cached; spend model context only where visual/semantic judgement
is needed. Use argument arrays for ffmpeg; never shell-compose untrusted media paths. Do not reset the SQLite DB to fix ordinary bugs (it is the permanent "never reuse a source" memory; there are no migrations, so back it up
before schema edits). Web research only for changeable or unfamiliar facts, from primary documentation, with URLs recorded.

## 10. What a skill-driven session must not do

Scan the intake merely because the skill was invoked; fetch social clips; upload; create OAuth credentials; delete media outside the harm gate; treat a ledger/DB row as proof something is live; install
large TTS/model dependencies unprompted; reset the DB; change a rights status on its own initiative.
