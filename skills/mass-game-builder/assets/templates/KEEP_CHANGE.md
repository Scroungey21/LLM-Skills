# Keep / Change ledger - {{NAME}}
(Module A. One row per item. The agent fills this from the user's answers, never from its own guesses.
Status values: KEEP (frozen, untouched) | KEEP+ADAPT (wire into the new structure, minimal edits) | IMPROVE (targeted fixes) | REBUILD (new, old is reference only) | DROP (remove).
Frozen items are not re-audited and not rewritten: only the interface notes are recorded.)

Overall level chosen by the user:  [ ] Full remake   [ ] Partial remake (proper remaster)   [ ] Remaster (improve only)   [ ] Continue

| Area | Item (name the exact one) | Status | What is wrong / what should be better, in the user's words (skip for KEEP) | Interface notes for KEEP items (inputs, outputs, signals, files, dependencies) |
|---|---|---|---|---|
| Mechanics | | | | |
| Systems / logic (save, inventory, AI, scoring...) | | | | |
| Models / characters | | | | |
| Animations | | | | |
| Game flow phases (boot, menu, lobby, play, pause, results, game over) | | | | |
| Transitions between phases | | | | |
| Environments / levels | | | | |
| Textures / materials / shaders | | | | |
| Audio (sound effects, music; origin and licence of each) | | | | |
| Other assets (UI art, VFX) | | | | |
| UI / menus / HUD | | | | |
| Networking and security | | | | |
| Code structure / folders | | | | |
| Story / content / balance | | | | |

Audit checks that apply to rows marked IMPROVE or REBUILD (tick when run; evidence goes in AUDIT.md):
[ ] look matches the user's anchors (ART_DIRECTION.md)   [ ] clipping and collision detector + eye-height tour   [ ] audio origin, licence and recorded-only check
[ ] host authority and hostile-client suite   [ ] balance sweep   [ ] UI fit   [ ] performance on the reference machine   [ ] licences and secrets

Notes the user added:
