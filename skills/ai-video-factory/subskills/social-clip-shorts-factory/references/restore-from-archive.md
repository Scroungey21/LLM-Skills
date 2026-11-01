# Restoring ShortsFactory from the `pre-skill-reduction` tag

The code is NOT in the working tree any more. The tag holds exactly **80 tracked files** under `ShortsFactory/`. This procedure was run and verified on 2026-11-01 (Windows, PowerShell, `uv` 0.12.3, Python 3.13.3,
FFmpeg on PATH): extract -> `uv sync --extra dev` -> verification script -> **14 tests passed**, active channels `good_moments, how_things_work, memes`, `youtube_upload_enabled` False, `--help` lists the CLI.
See also [../../../references/legacy-and-removed.md](../../../references/legacy-and-removed.md) sections 0-2 (general tag rules).

Contents: 1 Preconditions - 2 Extract - 3 Install and verify - 4 What is in the 80 files - 5 What is gone and cannot be restored - 6 After restoring: first changes - 7 Ownership and placement

## 1. Preconditions

- Anchor: tag `pre-skill-reduction` = commit `46312c56cb94898048afa6adaa313851f5ab1dc6` (checked 2026-11-01). Confirm: `git rev-parse pre-skill-reduction`. The tag contains tracked files only (no venv, no `data/`, no `output/`).
- Do not extract over a live tree. `H:\Projects\YTtechnews\ShortsFactory\` still exists but holds only leftover untracked `.pytest-tmp-*` folders, `.pytest_cache` and `.tmp`; extract into an EMPTY folder, then move.
- Tools: `git`, `uv`, Python >= 3.12 (uv fetches one if missing), FFmpeg + FFprobe on PATH. Optional: GPU + `--extra tts` for narration (heavy; do not install unless needed).

## 2. Extract (scratch location first)

```powershell
$dest = "H:\Projects\_restore-shortsfactory"            # any EMPTY folder outside the repo
git -C H:\Projects\YTtechnews archive pre-skill-reduction ShortsFactory -o "$env:TEMP\shortsfactory.zip"
Expand-Archive "$env:TEMP\shortsfactory.zip" -DestinationPath $dest
(Get-ChildItem $dest -Recurse -File | Measure-Object).Count      # expect 80
cd "$dest\ShortsFactory"                                          # project root (pyproject.toml, src\shortsfactory)
```
Single files without extracting: `git show pre-skill-reduction:ShortsFactory/README.md`; listing: `git ls-tree -r --name-only pre-skill-reduction ShortsFactory`. Whole old tree as a second checkout:
`git worktree add ..\YTtechnews-legacy pre-skill-reduction`.

## 3. Install and verify

```powershell
uv sync --extra dev                                   # creates .venv from uv.lock (no TTS stack)
powershell -NoProfile -ExecutionPolicy Bypass -File skills\shortsfactory-continuation\scripts\verify-project.ps1
# -> JSON; expect tests_passed true; intake_scanned false; media_deleted false
uv run shortsfactory --help
```
Optional: `uv sync --extra dev --extra tts` (dots.tts 0.3.1 + torch 2.9.0 cu128 on Windows) and `--extra vision` (opencv-python-headless, imagehash - listed but not imported by the archived code).
Then `uv run shortsfactory init` (copies `config.example.yaml` -> `config.yaml`, makes the inbox folder named in it, `G:\Videos\Instagram` - **edit the path first** if that drive does not exist) and `doctor`.
Do NOT run `demo`, `prepare-next-day`, `examples` or point a source at a real inbox as part of restoring; do not set up OAuth.
Set `UV_CACHE_DIR` inside the folder if the default cache location is locked down. `config.yaml`, `demo-config.yaml`, `data/`, `output/` are gitignored by the tracked `.gitignore`.

## 4. What is in the 80 files

| Group | Files | Contents |
|---|---|---|
| root | 5 | `README.md`, `config.example.yaml`, `pyproject.toml`, `uv.lock`, `.gitignore` |
| `src/shortsfactory/` | 42 | `__init__`, `__main__`, `cli`, `config`, `examples`, `orchestrator`, `scheduling`; packages `ai`, `analysis`, `analytics`, `approval`, `audio`, `compilation`, `database`, `filtering`, `media`, `rendering`, `reports`, `rights`, `routing`, `sources`, `youtube` (each with `__init__`) |
| `tests/` | 2 | `conftest.py`, `test_core.py` (14 tests) |
| `examples/` | 2 | `preview-slate.yaml` (template, placeholders), `local-instagram-preview-slate.yaml` (nine local audition items; paths point at the OWNER's old `G:\` files that are not recoverable) |
| `assets/` | 15 | `branding/` README + 5 channel avatars + 5 uncropped sources; `music/` README + `calm-loop-cc0.mp3` + sidecar; `voices/README.md` (no WAV) |
| `research-output/dots-tts/` | 3 | master report, numbers ledger, environment note |
| `skills/shortsfactory-continuation/` | 11 | the original continuation skill: `SKILL.md`, `agents/openai.yaml`, eight references, `scripts/verify-project.ps1` - the distilled content now lives in this subskill; keep the originals only as primary sources |

Module map (what to open for what): `config.py` settings and rights set; `sources/adapters.py` intake; `analysis/dedupe.py` fingerprints; `ai/provider.py` contracts + demo/OpenAI providers (**G1**); `orchestrator.py` the whole per-clip flow;
`filtering/quality.py`; `routing/router.py`; `rights/policy.py`; `rendering/{short,qa}.py`; `audio/{music,dots}.py`; `compilation/builder.py`; `approval/{service,dashboard}.py`; `youtube/publisher.py`; `analytics/*`; `reports/weekly.py`;
`database/{core,models}.py`; `scheduling.py`; `examples.py`; `cli.py`. Behaviour of each is described in this subskill's other references; the code outranks prose (rule 3).

## 5. What is gone and cannot be restored from the tag

- `.venv`, `.uv-cache`, `data/` (SQLite DB, analysis caches, TTS WAVs, model cache, deleted-content log), `output/` (daily packages, nine brand previews with `index.html`), `config.yaml`, `demo-config.yaml`
  (not tracked; the README's demo needs it recreated), `client_secret.json`/OAuth profiles (never existed), all `.pytest-tmp-*`.
- The owner's inbox media (`G:\Videos\Instagram`), the voice reference `warm-informational-reference.wav` (record again, `tts-narration.md` section 3), and the small-state DB: a demo-only copy is in
  `H:\Projects\YTtechnews-archive-2026-11-01\small-state\` (see `current-state.md` section 5).

## 6. After restoring: first changes (order matters; each is a separate, tested change)

1. Keep the restore untouched until the verification script passes. 2. Make the LLM layer the file hand-off provider and drop API-key checks (`llm-layer-method.md`, gap G1). 3. Fix approval/rights transitions (G2, G3) with tests.
4. Add segment selection and the E871 reject rules. 5. Rebuild `config.yaml` from the example for the owner's real inbox and channel names, with `youtube_upload_enabled: false` and `physically_delete_blocked: false` for the first
dry runs. 6. Update `current-state.md` / `decision-log.md` in this subskill with dated notes. Never copy `.env`, tokens, DB or media into the skill.

## 7. Ownership and placement

`ShortsFactory/` is not one of the four channel directories in the root `CLAUDE.md` ownership table, and no channel agent owns it ([../../../references/agent-principles.md](../../../references/agent-principles.md) section 9).
Before restoring INTO the repo, get the owner's decision on where it lives and who owns it; the safe default is to keep the restore outside the repo (as above) and, if it is adopted, to give it a dated ownership
entry and a gitignore line for `data/`, `output/`, `.venv/`. Do not touch another channel's directory to wire it in.
