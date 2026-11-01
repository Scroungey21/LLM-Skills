# Architecture - {{NAME}}
Minecraft modpack ({{LOADER}}, {{MC}}). Keep this file matching the real tree. Namespace: `{{SLUG}}`.

| Folder | What lives here |
|---|---|
| `_project/` | Vision, style bible, decisions, toolchain, mod list, spikes, perf budget, credits, palette, block vocabulary, cards, lineup notes, evidence. |
| `pack/` | The packwiz pack players install (mods as .pw.toml, configs, scripts). |
| `src/` | Custom mods, one Gradle project per mod. Per mod: one package per category, a `planner/` package of plain Java, and the seams `Net`, `Saved`, `Integrations`. |
| `datapack/` | Our data pack: structures, loot tables, worldgen JSON, tags, functions (singular folder names since 1.21). |
| `resourcepack/` | Our resource pack: textures, models, sounds, lang. |
| `structures_src/` | Authoring exports before they enter the datapack. |
| `audio/` | Sourced audio originals (each has a CREDITS.md row). |
| `tests/` | Planner unit tests and scenario notes. |
| `server/` | Dedicated-server config and multiplayer test notes. |

Rules: planners import nothing from the game; worldgen uses seeded randomness only and never creates items; three seams only (Net, Saved, Integrations); header comment (WHAT / TALKS TO / SIBLINGS) on every Java file; tunables in config or data, not in methods.

## Where do I find X
| I want to change... | Open |
|---|---|
| (fill in as the pack grows) | |

## How do I add a new...
(building typology, district type, loot pool, vehicle, animal role, sound: write a 5-line recipe each as the first one is added)
