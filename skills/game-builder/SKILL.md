---
name: game-builder
description: Build complete, playable, human-readable games of ANY genre, theme and art direction with an AI agent, using one fixed architecture, strict quality gates and a vetted toolchain. Use whenever the user wants to make, prototype, extend, review, polish, fix or release a game (platformer, shooter, racing, puzzle, strategy, survival, narrative, arcade, social co-op), solo or multiplayer, 2D or 3D, in Godot, Unity or Unreal. Also for asset pipelines and Blender, art direction, recorded audio and sound events, geometry clipping and collision, camera and UI fit, multiplayer security and room admission, game balance and rules, performance, QA gates, handoff and release. Trigger on loose requests like "make me a game", "turn this idea into something playable", "my levels clip", "the game sounds fake", "make it multiplayer", "audit my game". The user's art direction is asked, recorded and enforced; this skill never imposes a look.
---

# Game Builder

One standard for building games with an agent so the result is **fun, consistent, polished and readable by a human who does not know the engine**. It fixes structure, process and quality bars. It does **not** choose the game's theme, genre mood, palette or art style: those are the user's, and the agent's job is to ask, record and keep everything consistent with them.
Default engine: Godot 4 with GDScript. `references/engines.md` maps the standard onto Unity and Unreal. The runnable scripts and code templates are Godot-specific (the scaffold and lint also work for Unity and Unreal folders).

## Why these rules exist
Agent-built games fail in predictable ways, and every rule below answers one. The full table is in `references/standard.md` section 1: guessing the game or the look, over-building, declaring victory after a parse check, clipping and unreachable content, fake-sounding or unlicensed audio, an exploitable host, one winning strategy, UI off screen, lost context between sessions.

## Tier: ask which bar applies
- **Prototype:** something playable and honest. Gates G0, G2, G3, G9 if networked, a real round played.
- **Release:** public or paid. The whole gate ladder that applies, the by-eye checklist, legal checks and the user's sign-off (`references/quality-gates.md`).
Default to Release when the user says public, paid, polished, "not an experiment" or "no AI slop". Record the choice in `GAME_VISION.md`.

## Step 0: Intake (ask only what is missing; never more than three questions at once)
Use the ask-user tool if available. Record the answers in `_project/GAME_VISION.md`, `ART_DIRECTION.md` and the standing conditions in `HANDOFF.md`, using the user's words.
| # | Question | Decides | Read |
|---|---|---|---|
| 1 | **Game type** (platformer, shooter, racing, puzzle, strategy, survival, narrative, arcade, social co-op, hybrid) | folders, feel, edge cases, first scope | `references/genres.md` (that section) |
| 2 | **Players and trust**: single, local, LAN, online; who can join; anything ranked or permanent | networking mode, threat model | `references/networking.md`, `references/security.md` |
| 3 | **Look and feel, asked openly**: references they love, mood in their words, realism, finish policy, what must never appear. Do not suggest a style | art direction, asset pipeline | `references/art-direction.md`, `references/assets.md` |
| 4 | **Platform and reference machine** | renderer, input, budgets | `references/performance.md` |
| 5 | **Engine** (recommend by needs, not habit) | toolchain | `references/engines.md` |
Also settle early, with the user: audio policy (recorded only unless they say otherwise) and licence floor, budget, release tier, who owns and sells the game, streaming policy, how long a run lasts and how big the content should be. Questions 1-5 are **expensive to reverse**; everything else is cheap: decide it and log it in `DECISIONS.md`. Never ask what the user already answered.

## Workflow: phases with exit gates
Do not start a phase before the previous exit passes. Keep each phase small. After each phase give the user a short status (what works, what you decided, what you need).
| # | Phase | Do | Exit |
|---|---|---|---|
| 1 | Intake | questions above; fill the docs from `assets/templates/` | no `<<FILL>>` in `GAME_VISION.md`; 30- and 60-second tests written |
| 2 | Toolchain | read `references/toolchain.md` and the engine's `tools-*.md`; verify versions; name the reference machine | `TOOLCHAIN.md` pinned |
| 3 | Look | build one sample per class in the user's direction, show renders, take verdicts, record anchors and the lineup scene | user-approved anchors; lineup image in `_project/evidence/` |
| 4 | Skeleton | `scripts/scaffold.py`; menu, (room), an empty level, two connected instances if networked | G0, G1, G2 (+ G9 smoke) |
| 5 | Vertical slice | one level, one full loop, fully playable | G3, G4, screenshot read by eye, 30/60 tests |
| 6 | Content | one category at a time; lineup gate, credits row, architecture row | G0, G2, G4 per addition; G5/G7/G8 when it touches geometry, sound or numbers |
| 7 | Hardening | clipping tours, balance sweep, security audit, audio listening pass, UI matrix, perf | every gate that applies |
| 8 | Release and handover | README, `ARCHITECTURE.md`, `HANDOFF.md`, credits, checklist | G12 and the user's sign-off |

<!-- BEGIN CORE -->
## Non-negotiables (details in `references/`)
1. **One architecture, readable code.** Folder by category, self-contained; one compact script per category; few justified seams (default `Net`, `State`, `Events`); the simplest code that works; header comment on every script; tunables exposed; `ARCHITECTURE.md` always matches the tree (`standard.md`, `architecture.md`). *Why: a reviewer who does not know the engine must find and change anything.*
2. **The user's art direction is the law.** Ask, never suggest or default to a style, palette, mood or shader; record it in `ART_DIRECTION.md`; check every new asset against approved anchors (lineup gate); no quality preset removes an art-defining feature (`art-direction.md`). *Why: guessed looks are rework, and mixed looks read as unfinished.*
3. **Recorded audio, not synthesised.** Every sound effect is a recording unless the user explicitly asks otherwise; one event table; licence floor chosen with the user; downloads approved per list; a deterministic processing script and a check (`audio.md`). *Why: generated effects sound fake and users reject them.*
4. **Fix clipping at the source and automate detection.** Slot contracts, seated joints, no flush faces, colliders that match visuals, per-consumer collision layers, camera and fall rules; a detector proven by injected faults before it may fail a gate; then still look with eye-height tours (`clipping.md`, `ui-and-camera.md`). *Why: eyes cannot cover every slot and seed, and hiding a defect only moves it.*
5. **The host is the authority; admission before state.** Clients send intents; validate sender, state, range, rate and line of sight; bound every input before reading it; a hostile-client suite; no secrets in the repo (`security.md`, `networking.md`). *Why: one oversized message can freeze a host.*
6. **Mechanics are tunable rules; balance is simulated.** New mechanics are host-toggleable rules with defaults and ranges (solo has them too); a strategy sweep, including a greedy one, gates content changes (`balance.md`). *Why: one winning strategy ends the game.*
7. **Evidence over claims, edge cases first-class.** "Works" cites a gate PASS line plus a by-eye or by-ear check; pictures come from windowed runs; say what is UNVERIFIED; write down what a clumsy, hostile or unlucky player can do and handle it (`quality-gates.md`, `qa.md`). *Why: a parse check is not a run.*
8. **Licences and credits.** Every external asset has a ledger row on entry, under the licence floor the user chose; credits are generated from the ledger; the owner's terms are the owner's words (`assets.md`, `release-and-legal.md`).
9. **Log decisions and keep context alive.** Decisions go to `DECISIONS.md` with the user's words; standing conditions are copied verbatim into `HANDOFF.md`, which is current at all times (`agent-process.md`). *Why: sessions end without warning.*
10. **QA tools stay out of the build.** Detectors, gate runners and generators live under `tools/`, are never autoloads, are excluded from export; QA runs never write the player's real saves or settings.
11. **Work sequentially, review lightly.** One job at a time unless the user says otherwise; one full-coverage review, fixes, one verify run; concept and discussion before big new systems; the user's order of work is recorded (`agent-process.md`).
12. **Ask for the expensive, decide the cheap.** Ask about core loop, look, engine, networking, platform, licence floor, release bar and spending money; decide and log the rest; the user's explicit choice wins over the standard, with the cost stated in one sentence.
<!-- END CORE -->

## Gate ladder (details and PASS lines: `references/quality-gates.md`)
G0 lint, G1 import, G2 boot and walk, G3 unit tests, G4 content checks, G5 clipping, G6 animation, G7 audio, G8 balance, G9 network and security, G10 UI and screenshots, G11 performance, G12 release. Each prints a PASS line and exits non-zero on failure. A skipped gate is reported as skipped, never as passed.

## Tools and scripts
- `scripts/scaffold.py` creates the folder tree, docs, agents and (Godot) a booting menu, autoloads, the gate scripts in `tools/qa/` and, if networked, the tested door-based `net.gd` and smoke test.
- `scripts/check_project.py <project> [--release] [--strict]` = G0: headers, size caps, docs, credits coverage, secrets scan, procedural-audio markers, export exclusions.
- `scripts/gate.ps1` runs G0-G9 unattended on Windows and reports G10-G12 as manual; `scripts/gate_boot.sh` and `scripts/net_test.sh` are the bash variants; `scripts/net_test.ps1` is the PowerShell net smoke.
- `scripts/sync_shared.py` and `scripts/test_shared.py` keep this skill's shared files identical with `mass-game-builder` and lint them for bias (maintainer tools).
- Templates in `assets/templates/`: project docs (vision, art direction, decisions, credits, toolchain, handoff, release checklist, sound events), `net_enet.gd`, `net_smoke.gd`, `events.gd`, `state.gd`, `main_menu.gd`. `assets/examples/` holds opt-in material (one example shader) that is **not** part of the default scaffold.
- Agents in `assets/agents/` (copied to `.claude/agents/`): fourteen briefs, see `references/agents.md`.
- No engine installed (plain chat)? Produce the docs, structure, scripts and instructions, state that the gates were not run, and say how to run them.

## Reference index (read only what the task needs)
| File | Read when |
|---|---|
| `references/standard.md` | once per project: the rule set and why |
| `references/art-direction.md` | any look, asset, UI skin, sign, light or colour decision |
| `references/clipping.md` | any 3D content, placement, collision, animation or camera work; before calling a level done |
| `references/audio.md` | any sound or music; the user complains about how it sounds |
| `references/security.md` | anything with more than one player, online services, saves or secrets |
| `references/networking.md` | choosing and building multiplayer; the `net.gd` template |
| `references/balance.md` | scores, economies, progression, rules and presets |
| `references/quality-gates.md` | running or writing gates; shared-tree etiquette; Windows notes |
| `references/ui-and-camera.md` | menus, HUD, loading, overlays, cameras, accessibility |
| `references/performance.md` | frame rate, budgets, presets, upscalers |
| `references/agent-process.md` | planning work, helper agents, reviews, handoff, downloads |
| `references/release-and-legal.md` | ownership, credits, terms, streaming, store rules, release checklist |
| `references/genres.md` | step 0 and whenever scope or feel is in doubt (only that section) |
| `references/architecture.md` | laying out or growing the folder tree |
| `references/assets.md` | models, textures, Blender, export, ledger |
| `references/qa.md` | by-eye checklist, tests, edge-case method |
| `references/toolchain.md`, `tools-godot.md`, `tools-unity.md`, `tools-unreal.md`, `tools-general.md` | toolchain phase and tool questions |
| `references/engines.md` | choosing an engine; mapping the standard onto Unity and Unreal |
| `references/agents.md` | delegating steps to the custom agents |

## When the user's request conflicts with the standard
The user's explicit design choice wins; the standard wins on structure and process. If a choice breaks a rule (for example a fourth global, a paid service, a synthesised sound), state the cost in one sentence, offer the compliant alternative, follow their decision and log it in `DECISIONS.md` with their words.
