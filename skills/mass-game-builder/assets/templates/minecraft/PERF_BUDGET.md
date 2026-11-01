# Performance Budget - {{NAME}}
Performance is a design requirement. Content is not merged until it has been measured on the reference device against this file.
Method, defaults and the profile library: `references/minecraft-quality-standards.md` (sections 2 to 4). The agent cannot measure in a cloud sandbox (no game, no GPU): it writes the routes and runs `scripts/check_frametimes.py` on captures the user supplies; evidence goes in `_project/evidence/perf/`. Gates stay **not run** until real captures exist.

## Reference device and profile
Profile (P1 Handheld / P2 Mainstream / P3 Enthusiast / custom): <<FILL>>
Device: <<FILL CPU, GPU (integrated or discrete), RAM and whether CPU and GPU share it, screen resolution and refresh, OS>>
Power / performance mode used for the gate: <<FILL e.g. plugged in, balanced; for handhelds the TDP profile>>
Server profile (S1): host <<FILL hardware>>, players <<FILL N>>, view distance <<FILL>>, simulation distance <<FILL>>
Also supported (reported, not gated): <<FILL or none>>

## The pass (author's number; changing it is a logged decision)
**A run passes when 1% low FPS >= <<FILL floor, e.g. 40 / 60>> and no continuous stretch below that floor lasts longer than <<FILL 1>> second(s).** All three runs must pass; the worst gates, the median is reported.
Server: average MSPT <= <<FILL 35>> ms, 99th percentile <= <<FILL 50>> ms, 20 TPS at the planned player count.

## Settings for the pass test (starting points; the performance spike tunes them)
Resolution <<FILL>> | shaders <<FILL off/on>> | render distance <<FILL>> | simulation distance <<FILL>> | JVM heap <<FILL>> | Java <<FILL>> flags <<FILL>> | same resource pack and mod list every run (record the pack hash)
Dials you may turn to hold the line (log each change in DECISIONS.md): render distance, simulation distance, entity caps, particle limits, texture size. Not traded away silently: the pass line and the content the vision promises.

## Metrics
| Metric | Target | Measured how | Baseline vanilla | Last result |
|---|---|---|---|---|
| 1% low FPS (the pass) | >= the floor above | PresentMon / CapFrameX CSV, `check_frametimes.py` | | |
| Longest stretch below the floor | <= the limit above | same | | |
| Average FPS | informational, about 25% above the floor | same | | |
| Worst single frame | <= 2 x the floor's frame time | same | | |
| Streaming cost per chunk (main thread) | <<FILL from spike>> | fresh-world flight R2, spark | | |
| Server MSPT at full load | per server profile | spark on the host, scenario R3 | | |
| Singleplayer full load | the pass line holds | capture + spark, scenario R3 | | |
| Memory after 60 minutes | fits recommended allocation, no GC pause > 100 ms | GC log, R4 | | |
| Cold launch to main menu | recorded; regression <= 10% | timed, 3 runs | | |
| World load to playable | recorded; regression <= 10% | timed, 3 runs | | |
| Pack versus vanilla delta | reported (vanilla+ packs: ceiling <<FILL 10%>>) | baseline capture | | |
| Download size | <<FILL ceiling or "report only">> | export listing | | |

## Benchmark routes (fixed seed, path, time of day, weather; write exact steps so anyone can repeat them)
- R1 densest-content walk (the place with the most of whatever the pack is about): <<FILL>>
- R2 fresh-world flight (chunk streaming; skip if the pack adds no worldgen or heavy chunk content): <<FILL>>
- R3 full-load scenario (biggest base / most machines / most mobs / most players): <<FILL>>
- R4 long session (60+ minutes, memory and GC): <<FILL>>
Each run: warm-up (10 minutes on laptops and handhelds), at least 5 minutes captured, three runs, notes on anything else running.

## Per-addition cost ledger (record before a mod, system or content family is `adopted`)
| Addition | Kind (mod / system / structures / machines / mobs) | Cost measured (FPS, MSPT, memory, startup) | Verdict (keep / cut back / drop) | Date |
|---|---|---|---|---|

Entity and tick budgets (fill from the spike, on the reference device): <<FILL per-area caps for mobs, block entities, machines, loaded chunks per player; item entities from generation: 0>>.
Rule: a change that breaks the pass is reworked or cut back to a budget that holds, never "fixed later". Any metric more than 10% worse than the last passing release needs an entry in DECISIONS.md.
