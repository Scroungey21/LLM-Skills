# Custom Agent Roster (one per kind of workflow step)

Fourteen briefs in `assets/agents/`, copied into a project's `.claude/agents/` by `scaffold.py` (Claude Code reads project agents from there; `~/.claude/agents/` makes them global). Each follows this standard and is short on purpose.

## When to use agents at all
A single agent following the skill is enough for small games and small tasks. Delegate only when the task is big, the context would bloat, or you want an independent check. One published measurement found a heavy multi-agent process ranked last on play quality against a one-page brief: keep to this roster, do not add layers of managers. Process rules (sequential by default, light reviews, handoff) are in `agent-process.md`.

## The roster
| Agent | Phase | Owns | Typical trigger |
|---|---|---|---|
| `game-director` | intake, slice | vision, fun, scope | "Is this fun? Is this too much?" |
| `architect` | skeleton, content, handover | folders, seams, naming, `ARCHITECTURE.md` | new category; scripts growing |
| `gameplay-programmer` | slice, content | mechanics and category scripts | implement a mechanic or item type |
| `network-engineer` | skeleton, slice, hardening | rooms, authority, sync, voice transport, the door | anything multiplayer |
| `tech-artist` | look, content | art direction, shaders, generators, lineup, credits | before any asset enters the game |
| `level-builder` | slice, content | levels, slots, randomisation, navigation, access | new map; random placement |
| `qa-edge-hunter` | hardening | gates, adversarial testing, regression tests | "try to break it" |
| `performance-profiler` | hardening | frame time on the reference machine | below target |
| `handover-reviewer` | handover | newcomer test, docs accuracy | before delivery |
| `clip-hunter` | hardening, after content | own cameras, finds what the detector missed | before calling a level done |
| `recall-reviewer` | hardening | injects faults to prove detectors | before a detector may fail a gate |
| `audio-reviewer` | content, hardening | event map, borrowed sounds, mastering report, listening | after audio changes |
| `security-reviewer` | hardening | hostile-client tests and the audit | before release or after net changes |
| `balance-analyst` | content, hardening | strategy sweeps, exploits, rule ranges | after numbers or content change |

## How to run them
1. **One agent per file area at a time.** Parallelise only independent areas, and only when the user allows.
2. **Hand off through files, not chat.** Decisions go to `DECISIONS.md`, bugs to a list, assets to `CREDITS.md`, structure to `ARCHITECTURE.md`, state to `HANDOFF.md`.
3. **Every agent reads `_project/TOOLCHAIN.md`, `ART_DIRECTION.md` (if it touches the look) and `HANDOFF.md` first** and uses only the pinned tools.
4. **Gates decide "done", not the agent's opinion.** Reviewers re-run them independently.
5. **Light review shape:** build, one full-coverage review, fixes, one verify run, done. Pick reviewer lenses once.
6. **Typical order:** `game-director` (vision) -> `tech-artist` (art direction, with the user) -> `architect` + `network-engineer` (skeleton) -> `gameplay-programmer` + `level-builder` (slice) -> content loop -> `clip-hunter` + `audio-reviewer` + `balance-analyst` + `security-reviewer` + `performance-profiler` -> `handover-reviewer`.
7. **Model and effort:** hard design and review judgement to a strong model; mechanical edits and script runs to a smaller one. Say it in the brief.

## Companion agents from outside
`voltagent-domains:game-developer` (general senior game developer for second opinions; it does not know this standard), `code-reviewer`, `refactoring-specialist`. Install: `claude plugin marketplace add VoltAgent/awesome-claude-code-subagents` then `claude plugin install voltagent-domains`. Tell them to apply the size caps and header rule.

## Customising
Each file is plain Markdown with front matter (`name`, `description`, `tools`). Edit its rules; keep the "Read first", "Report back with" and "Done when" lines. Add an engine-specific rule at the end when the engine needs it.
