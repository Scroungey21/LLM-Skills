# Quality gates: the ladder from "it parses" to "release"

Read this when deciding what must pass before saying anything works, when writing a gate script, and when several agents share one project folder.
"Done" means a gate printed its PASS line and a human-visible check was made by eye. A parse check is not a run.

## Contents
1. Tiers
2. The gate ladder G0-G12
3. How a gate behaves
4. Which gates when
5. Shared-tree etiquette
6. Windows and tooling notes
7. Other failure classes

## 1. Tiers
Ask the user which bar applies. Default to **Release** if they say public, paid, polished or "not an experiment".
- **Prototype tier:** G0, G2, G3, G9 (if networked), the edge-case checklist in `qa.md`, and a real round played by a person.
- **Release tier:** every gate in section 2 that applies to the game, the full by-eye checklist, and the user's sign-off. No placeholder, no clipped or misaligned thing, nothing half-finished (`release-and-legal.md`).

## 2. The gate ladder G0-G12
Each gate has a command, a PASS line and a non-zero exit when it fails. Projects name their own commands; keep the PASS lines. The skill ships no ready-made clip, balance, audio or security checker: the PASS lines for those gates are hooks that `scripts/gate.ps1` expects the project to supply, so build them (see `clipping.md`, `balance.md`, `audio.md`, `security.md`).
| Gate | What | PASS line / evidence |
|---|---|---|
| G0 Lint | `scripts/check_project.py`: headers, size caps, docs, credits, secrets | `All good.` or no ERROR lines |
| G1 Import | engine import through one script that takes the project lock | exit 0, no import errors |
| G2 Boot and walk | headless boot; a walker that loads every scene and resource and fails on any script error | `G2 PASS` |
| G3 Unit tests | rules with numbers or state (GUT / Unity Test Framework / Automation) | runner exit 0 |
| G4 Content checks | every level or content unit, for at least 3 seeds: slot fit, items, access, spawn fairness | `LEVEL_CHECK name items=n problems=0` |
| G5 Clipping | detector over every built level x seed and every generated model (`clipping.md`) | `CLIP_DONE problems=0` |
| G6 Animation | clearance table and temporal playback check on every clip x skin x body shape | `ANIM_DONE problems=0` |
| G7 Audio | every event resolves, no retired path, pitch budget, mastering script (`audio.md`) | `SFX_CHECK problems=0` |
| G8 Balance | strategy sweep, normal and greedy (`balance.md`) | `BALANCE_DONE ... problems=0` |
| G9 Network and security | multi-instance smoke plus the hostile-client suite (`security.md`) | `G9 PASS`, `SECURITY_DONE problems=0` |
| G10 UI and screenshots | UI fit matrix, windowed screenshots of every screen, read by eye (`ui-and-camera.md`) | `UI_FIT problems=0` + images saved |
| G11 Performance | reference machine, native resolution, adapter name asserted (`performance.md`) | `PERF_DONE adapter=... avg_ms=... p99_ms=...` |
| G12 Release | checklist in `release-and-legal.md`, export presets, credits, sign-off | checklist ticked, signed |

Edge cases (twice at once, worst moment, gone, second playthrough) are a checklist in `qa.md` for every tier, not a numbered gate.

## 3. How a gate behaves
- A gate is one command that exits non-zero on failure and prints a PASS line on success. It never "passes" because a step was skipped: a missing tool prints `SKIPPED (reason)` and the run is marked incomplete.
- Match PASS and failure lines with precise patterns (engine error lines at line start), not a bare word like `ERROR:` anywhere in the output, which false-fails on harmless text.
- Every external process runs under a timeout. Kill only processes you started.
- A new checker starts as warn-only, is proven (baseline, injected fault, seeded cases) and then promoted to failing (`clipping.md` section 8).
- Gates that need pixels run in a window, never `--headless` (headless has no renderer). Read the images; a screenshot nobody opened is not evidence.
- Pictures and numbers from a gate are saved under `_project/evidence/` (or the project's output folder) with the date.
- Record the last result of each gate in `HANDOFF.md`.

## 4. Which gates when
| Phase | Required |
|---|---|
| Skeleton | G0, G1, G2 (+ G9 smoke if networked) |
| Vertical slice | + G3, G4 on the one level, a screenshot read by eye |
| Content (each addition) | G0, G2, G4 for the new unit, lineup gate, credits row; G5/G7/G8 if the addition touches geometry, sounds or numbers |
| Hardening | all applicable gates, full matrices, by-eye tours |
| Release | G12 on top, from a fresh checkout and an exported build |

## 5. Shared-tree etiquette
Several agents or people may work in one folder.
- One gate command that runs the checks in order. Put "how to run the checks" in the project's agent notes.
- **One engine import at a time**, through a script that takes a lock file and times out. The editor does not use the lock: keep it closed while agents run.
- Each agent passes its own output directory to gate and run scripts, or logs overwrite each other.
- Do not fix files you do not own when another agent's half-finished edit breaks a run: wait and retry.
- Do not commit or push unless the user asks. Do not change system settings. Do not kill processes you did not start.

## 6. Windows and tooling notes
- Provide a PowerShell gate runner (`scripts/gate.ps1`); a bash script may fail to start on some Windows machines. Do not claim a single OS.
- PowerShell 5.1: no `&&`; `Set-Content -Encoding utf8` adds a BOM (write commit messages and generated files with a no-BOM writer); arrays passed through `-File` collapse to one value, so call scripts with `&` or pass a delimited string; a one-element array of arrays needs a leading comma.
- Shell commands can be blocked from writing inside tool configuration folders: use the editor's file tool there.
- A first import of a fresh tree may crash on a native extension unless its extension list is seeded; have the gate script do it.
- A physics engine may silently stop creating bodies past a configured maximum (one log line only): assert body counts in a test.
- Engine canvas stretch modes can impose a minimum canvas size; test the window sizes you claim to support.

## 7. Other failure classes
One line each. Each has a home in another file; this is the index.
- Visible clipping, z-fighting, hidden or unreachable fixtures: `clipping.md`.
- Procedural or borrowed sounds, unlicensed audio: `audio.md`.
- Crashable host, spoofed intents, seen-through-glass actions: `security.md`.
- One winning strategy, silent economy breaks: `balance.md`.
- UI off screen, text overflow, camera outside the level: `ui-and-camera.md`.
- Frame spikes, benchmark taken with upscalers on: `performance.md`.
- Parallel work, review loops, lost context: `agent-process.md`.
- Missing credits, wrong ownership statement, store rules: `release-and-legal.md`.
- Unfinished surfaces, off-style assets, features removed by presets: `art-direction.md`.
- A QA run overwrote the player's real save or settings: use a persistence-off flag (`security.md` section 6).
- Loading that looks like a freeze: show a loading screen with honest progress; do not animate what the main thread cannot update.
