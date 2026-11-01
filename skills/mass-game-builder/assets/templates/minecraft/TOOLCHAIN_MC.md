# Toolchain - {{NAME}}
Researched once, pinned here, verified against the real files. Agents read this; they do not re-research. Upgrade nothing after the version freeze.

Minecraft:        <<FILL e.g. 1.21.1 or 26.1.x>>      Decided by: SPIKES.md S1 (date, evidence)
Loader:           {{LOADER}} <<FILL exact build>>
Java:             <<FILL 21 for 1.21.x, 25 for 26.1+; check the loader docs>>
Build:            <<FILL ModDevGradle / NeoGradle version; Gradle version; generated from the official Mod Generator / MDK>>
Mappings:         <<FILL official Mojang names; Parchment only where the pinned version still needs it>>
IDE:              <<FILL IntelliJ IDEA or Eclipse>>
Pack manager:     packwiz <<FILL version>>   (export: Modrinth .mrpack and/or CurseForge zip, plus server pack)
Profilers:        spark <<FILL version>> (in game and on the server), vanilla /perf for server ticks
Frame capture:    <<FILL tool, e.g. PresentMon or CapFrameX; confirm current>>  (analysed with scripts/check_frametimes.py)
Log checks:       scripts/check_logs.py on latest.log and server logs
Authoring:        Blockbench (models), structure blocks / Litematica / WorldEdit (buildings), Blender MCP optional
Tests:            JUnit for planners (plain Java), loader GameTests for in-world rules <<FILL confirm for the pinned version>>
Agent tools:      <<FILL Minecraft Dev MCP, in-game MCP, skills; each vetted and pinned, or "none">>
Reference device: <<FILL CPU / GPU / RAM / screen / power mode, copied from PERF_BUDGET.md>>; render and simulation distance <<FILL from the performance spike>>
Budget:           $0. Free-tier limits used: <<none>>
Performance mods: see MODLIST.md (adopted only after measurement)
Rejected:         <<FILL tool - reason>>
