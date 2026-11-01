# Quality Bar - {{NAME}}
The release scorecard. Rules and defaults: `references/minecraft-quality-standards.md` sections 5 to 7. Fill the archetype rows that apply, put a number or a pass rule in every row, and attach evidence. Status: not run / pass / fail / waived (waivers only by the author, recorded in DECISIONS.md). A fail or not-run row blocks release.

Archetype(s): {{ARCHETYPE}}     Version under test: <<FILL pack version + build hash>>     Date: <<FILL>>

## Universal rows
| # | Area | Pass rule for this pack | Status | Evidence (file in `_project/evidence/`) | Owner |
|---|---|---|---|---|---|
| Q1 | Stability: boot, soak | cold boot client + server; <<FILL 2 h>> client soak, <<FILL 8 h>> server soak, no crash | not run | | |
| Q2 | Content integrity: no missing assets or data in logs | `check_logs.py` clean | not run | | |
| Q3 | Compatibility and mod hygiene | one mod per role, identical lists, pinned by hash | not run | | |
| Q4 | Gameplay: 30 s / 60 s tests, first hour without a dead end, progression reachable | | not run | | |
| Q5 | UX and accessibility: readable text, key bindings, HUD, non-colour cues, onboarding, options | | not run | | |
| Q6 | Art and audio consistency (art contract scripts, audio levels, sources) | | not run | | |
| Q7 | Documentation and handover (README, requirements, RAM, changelog, ARCHITECTURE) | | not run | | |
| Q8 | Legal and attribution (MODLIST verdicts, CREDITS, nothing link-only bundled) | | not run | | |
| Q9 | Update safety (previous release world loads, config migrated) | | not run | | |
| Q10 | Security and trust (server validates payloads, no stated-nowhere network calls, hashes pinned) | | not run | | |

## Performance rows (numbers live in PERF_BUDGET.md)
| Gate | Pass rule | Status | Evidence |
|---|---|---|---|
| M-P1 Frame | 1% low >= floor, dips within the limit, 3 of 3 runs | not run | |
| M-P2 Stream | no chunk hitch above budget (if the pack streams new content) | not run | |
| M-P3 Load | server MSPT and singleplayer full load hold | not run | |
| M-P4 Memory and startup | heap, GC, startup within budget and regression limit | not run | |

## Archetype rows (copy the rows from section 6 of the standards for each archetype that applies)
| Row | Pass rule | Status | Evidence |
|---|---|---|---|

## Waivers
| Row | Number achieved | Reason | Approved by (author) | Date | Expires at release |
|---|---|---|---|---|---|
