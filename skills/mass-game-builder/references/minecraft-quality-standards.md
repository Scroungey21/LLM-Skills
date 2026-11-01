# Quality and performance standards for any Minecraft modpack

Read this at intake for **every** modpack, whatever its nature (tech, magic, adventure, questing, survival, horror, vanilla+, kitchen sink, server network, minigames). It is project-neutral: it says how to set a pass line, how to measure it, and what "good enough to release" means. Project facts (the device, the numbers, the genre) go in the project's `PERF_BUDGET.md` and `QUALITY_BAR.md`, never in this file.
Numbers below are the skill's **defaults to propose** [Decision]. The author may change any of them; a changed number is logged in `DECISIONS.md` and the gate then uses the new number. A gate with no number is not a gate.

## Contents
1. Principles
2. Device profiles (pick the reference device)
3. The performance pass: definition and protocol
4. Universal performance metrics
5. Universal quality bar (Q1 to Q10)
6. Add-ons by pack archetype
7. Regression control and waivers
8. Worked example profile
9. What to record

## 1. Principles
1. **Performance and quality are release blockers, not polish.** A pack that looks great and stutters on its target device has failed.
2. **One named reference device.** "Runs well" means nothing; "meets the pass line on device X at settings Y" is testable. If the author has no device in mind, propose a profile from section 2 and log the choice.
3. **The pass line is chosen by the author, enforced by the process.** Dials (render distance, simulation distance, entity caps, particle limits, texture size) may be turned to meet the line. The line itself and the promised content (what the vision says makes the pack worth playing) are not traded away silently; if both cannot hold, the author decides.
4. **Measure the vanilla baseline first.** The same route on the same device with no mods tells you what the pack costs. Report pack versus vanilla in every capture.
5. **Evidence or it did not happen.** Every number comes from a capture saved in `_project/evidence/`. The agent cannot run the game in a cloud sandbox: it writes the routes, runs the analysis scripts on the captures the user supplies, and marks gates **not run** until real data exists.
6. **Cost is recorded when content is added**, not at the end. Each mod, structure family, system or machine records its measured cost in `PERF_BUDGET.md` before it is `adopted`.

## 2. Device profiles (pick the reference device)
A profile = hardware class + screen + settings used for the pass test + pass line. Propose the closest one at intake, then replace the placeholder device with the author's real one.
| Profile | Typical hardware | Settings for the pass test (starting points; the performance spike tunes them) | Default pass line |
|---|---|---|---|
| **P1 Handheld / low power** | Handheld PC or ultrabook, integrated GPU, shared memory, 15 to 30 W, 1080p or lower | Native resolution, shaders off, render distance about 10, simulation distance about 6, heap 4 to 6 GB | 1% low **>= 40 FPS**, no dip below 40 longer than 1 s |
| **P2 Mainstream** | Laptop or desktop, integrated or entry discrete GPU, 8 to 16 GB RAM, 1080p | 1080p, shaders off, render about 12, simulation about 8, heap 4 to 6 GB | 1% low **>= 60 FPS**, no dip below 60 longer than 1 s |
| **P3 Enthusiast** | Mid to high discrete GPU, 16 GB+ RAM, 1080p to 1440p | 1440p, render 16 or more, simulation about 10, shaders optional (reported, not gated unless the author says so) | 1% low **>= 60 FPS**, no dip below 60 longer than 1 s |
| **S1 Dedicated server** | The author's real or planned host | Planned player count, view distance and simulation distance of the shipped `server.properties` | Average MSPT **<= 35 ms**, 99th percentile **<= 50 ms**, 20 TPS held |
A pack may declare a client profile and a server profile (and an extra "also supported" profile, reported but not gated). Singleplayer runs the server on the client's machine, so on P1 and P2 the singleplayer full-load run is the hard case.

## 3. The performance pass: definition and protocol
**Definition (default).** A run **passes** when its **1% low FPS is at least the profile's floor and no continuous stretch below the floor lasts longer than 1 second.**
- *1% low* = the average FPS of the slowest 1% of frames in the capture (computed from frame times). The 99th-percentile frame time is also reported. If the author means a different statistic, change it here and log it.
- *Sustained-dip rule* stops one dropped frame failing a run while still failing a real stutter.
- *Average FPS* is informational (aim 25% above the floor) and never rescues a failing 1% low.
**Protocol (every gated run).**
1. Same machine, same OS power or performance profile (write it down), same Java version and JVM flags, same pack build (hash), same settings.
2. Fixed seed, fixed route, fixed time of day, fixed weather; the route steps are written in `PERF_BUDGET.md` so anyone can repeat them.
3. **Warm-up** of at least 10 minutes on laptops and handhelds (they throttle), plus the game's own JIT warm-up; start capturing only after the first minutes of loading hitches pass.
4. Capture at least 5 minutes per route with a frame-time tool (PresentMon or CapFrameX style CSV).
5. **Three runs. Every run must pass;** report the median, gate on the worst. Mark runs where something else was running on the machine and repeat them.
6. Analyse with `scripts/check_frametimes.py` (it prints average, 1% low, 99th percentile, worst frame, longest sub-floor stretch, and exits 1 on a failed pass). Save the CSV and the output in `_project/evidence/perf/`.
7. For battery devices, repeat on battery and on charger; gate the profile the author names, record the other.

## 4. Universal performance metrics
| Metric | Default target | How measured | Gate |
|---|---|---|---|
| **Frame pace** (1% low, sustained dips) | the profile's pass line | frame-time capture on the dense-content route, `check_frametimes.py` | M-P1 |
| **Worst single frame** | <= 2 x the floor's frame time (50 ms at a 40 FPS floor, 33 ms at 60); no repeated chunk-load hitch | same capture | M-P1 |
| **Streaming cost** | main-thread work per generated or loaded chunk within the budget set by the spike; no hitch when flying through fresh terrain | fresh-world flight, spark | M-P2 |
| **Server tick** | the server profile's MSPT numbers at the planned player count and full content load | spark / `/tick` report on the real host | M-P3 |
| **Singleplayer full load** | the client profile's pass line while the integrated server runs the heaviest scenario (the biggest base, the most mobs, the most machines, the busiest structure area) | frame capture plus spark | M-P3 |
| **Memory** | heap after a 60-minute run fits the recommended allocation with headroom; no GC pause longer than 100 ms; the whole process fits the device (on shared-memory devices count heap + graphics + OS) | GC log, heap graph, task manager | M-P4 |
| **Startup** | cold launch to main menu and world load to playable are measured, recorded and **not allowed to regress more than 10%** between releases; the author may set an absolute ceiling | timed runs, 3 each | M-P4 |
| **Pack versus vanilla** | reported: FPS, MSPT, startup and memory delta against the vanilla baseline on the same route; for vanilla+ packs a delta ceiling (default 10% FPS) is a gate | baseline capture | M-P1 |
| **Download and disk size** | reported; the author sets a ceiling if distribution limits matter | export listing | release notes |
| **Network** | no packet storms: payload rate per player stays within the budget in `PERF_BUDGET.md`; join time with the full mod list recorded | server log / spark | M-G4 |
| **Power / thermals** (handheld, laptop) | the pass holds at the named power profile after warm-up; other profiles recorded | capture notes | M-P1 |

## 5. Universal quality bar (Q1 to Q10)
Every row needs a pass rule, evidence, and an owner for fixes. `assets/templates/minecraft/QUALITY_BAR.md` is the scorecard; fill it at hardening and re-run it before each release.
| # | Area | Pass rule (default) | Evidence | Gate |
|---|---|---|---|---|
| Q1 | **Stability** | Cold boot of client and dedicated server from the exported pack with no crash; 2 hours of play on the client and 8 hours on the server with no crash and no repeating exception; a fresh world joins | logs, timed soak notes | M-G1, M-S |
| Q2 | **Content integrity** | Logs show no missing textures, models, sounds, language keys, recipes, loot tables, tags or advancements and no datapack parse errors; all custom registry entries have names, models and recipes (or a documented reason) | `scripts/check_logs.py` output | M-G1 |
| Q3 | **Compatibility and mod hygiene** | One mod per role; dependency closure complete; every mod pinned by hash; client and server run the identical list; no mixin or config conflicts in the log; optional mods absent does not crash | `MODLIST.md`, logs, join test | M-L, M-G4 |
| Q4 | **Gameplay quality** | 30-second and 60-second tests pass; the first hour has no dead end (every progression item is obtainable by a documented route); difficulty curve and economy checked in playtests with fresh players | playtest log | M-G3, playtest |
| Q5 | **UX and accessibility** | Text readable at the shipped GUI scales; key bindings do not clash; HUD does not hide the action; important cues are not colour-only and have a sound or shape alternative; sensible default config; difficulty or comfort options where the design calls for them; onboarding (quest book, guide, first-minute teaching) exists | screenshots, checklist | M-G2 |
| Q6 | **Art and audio consistency** | The art contract passes (`minecraft-art-direction.md`); audio levels consistent (no clipping, no sound far louder than its neighbours), every sound sourced and licensed | scripts, listening notes, CREDITS | M-G2, M-A |
| Q7 | **Documentation and handover** | README (what it is, requirements, install, recommended RAM, known issues), changelog, `ARCHITECTURE.md` matching the folders, "how to update safely" | handover review | M-D |
| Q8 | **Legal and attribution** | Every shipped mod, texture, model and sound has a licence and a redistribution verdict; `link-only` mods are not bundled; credits complete | `MODLIST.md`, `CREDITS.md`, export listing | M-L |
| Q9 | **Update safety** | A world from the previous release loads after the update and new chunks generate without errors; config is migrated, not overwritten; registry names unchanged or aliased | update test notes | M-C |
| Q10 | **Security and trust** | No unvetted jars or scripts; server validates every client payload; no telemetry or network calls the README does not state; supply chain pinned by hash; permissions and ops defaults safe | review notes, `check_modpack.py` | M-G4, review |
A **failed row blocks release** unless a waiver exists (section 7).

## 6. Add-ons by pack archetype
Choose the archetype at intake (`scaffold_modpack.py --archetype ...` records it) and add these rows to the scorecard and routes. Archetypes combine; add each that applies.
| Archetype | Extra standards |
|---|---|
| **World-generation heavy** (cities, dimensions, big structures) | Streaming and determinism rules, budgets per generated chunk, seeds 0 / negative / far coordinates, structure and loot checks: `minecraft-worldgen.md` |
| **Tech / automation** | Stress test with a stated factory size (N machines, M cable or pipe segments, K chunk loaders) held for 30 minutes at the server profile; machine and network tick cost recorded per machine type; no unbounded item or fluid entities; recipe loop and duplication audit; progression gating tested end to end |
| **Magic / progression / questing** | Every item and quest reachable (obtainability audit from a clean start); no circular quest requirements; recipe conflicts checked in a recipe viewer; quest rewards balanced; progression tested by a fresh player |
| **Adventure / RPG / dungeon** | Structure placement and spacing tested over many seeds; loot tables balanced per tier; boss and mob scaling tested at 1 and N players; death and respawn flow clear; no soft locks |
| **Survival / horde / systems** | `minecraft-systems.md`: AI cost, entity budgets, abstract simulation, loot placement, edge cases |
| **Horror / atmosphere** | Lighting and sound budgets; jump-scare and effect limits with a comfort option; audio mix tested on speakers and headphones |
| **Vanilla+ / quality of life** | Pack versus vanilla delta ceiling is a gate (default 10% FPS and startup); everything optional is toggleable; nothing changes world generation without saying so |
| **Large "kitchen sink"** | Mod-count and startup ceilings; a conflict matrix and a bisect procedure for crashes; memory recommendation measured, not guessed; strict one-mod-per-role audit |
| **Server network / minigames** | Join time and player scaling tests, rate limits, backup and restore tested, moderation tools, restart-safe state |

## 7. Regression control and waivers
- **Regression budget:** any metric worse by more than 10% against the last passing release is a failure even if it still clears the line, until explained in `DECISIONS.md`.
- **No silent dials:** every change to render distance, simulation distance, entity caps or particle limits made to meet the line is logged with the before and after numbers.
- **Waivers:** only the author can waive a gate, in writing in `DECISIONS.md` (gate, number achieved, reason, date, expiry release). The agent never waives.
- **Bisect on failure:** when a run fails, remove content or mods in halves (or disable one system at a time) with captures at each step; record the culprit and its cost in `PERF_BUDGET.md`.
- **Re-measure after any upgrade** of Minecraft, loader, Java or a performance mod; numbers from another version are provisional.

## 8. Worked example profile (not a default)
One author targeted the **ASUS ROG Xbox Ally X** (Ryzen AI Z2 Extreme, integrated Radeon 890M, 24 GB LPDDR5X-8000 shared between CPU and GPU, 7-inch 1080p 120 Hz screen; default 17 W profile with 13 W and 25 W modes, up to 35 W on the 65 W charger; specs from published reviews, October 2026) with a 40 FPS minimum: this is P1 with the pass defined as 1% low >= 40 and no sustained dip, gated at the 17 W profile after a 10-minute warm-up, native 1080p, no shaders, starting at render 10 and simulation 6. Lessons it adds to any handheld or shared-memory target:
- CPU and GPU share one memory pool and its bandwidth; count Java heap, graphics allocation and the OS together. Texture atlas size, particles, translucent and animated textures cost real frames.
- Throttling: warm up first, record the power profile in every capture, treat other profiles as information.
- Singleplayer is the hard case because the integrated server competes with rendering; derive entity and tick budgets on the device, not on a development PC.
- Minecraft Java has no built-in controller support; if the device is controller-first, decide at intake whether the pack ships a controller layer.
- Numbers inherited from a different machine are provisional until the performance spike measures them on the target.

## 9. What to record
`PERF_BUDGET.md` (device, settings, pass line, routes, per-addition costs), `QUALITY_BAR.md` (the Q rows and archetype rows with status and evidence), `DECISIONS.md` (every changed number, waiver and dial), `_project/evidence/perf/` (CSVs and script output), `_project/evidence/soak/` (logs).
