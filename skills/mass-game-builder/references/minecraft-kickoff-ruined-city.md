# Kickoff plan: Ruined City (Moroccan-inspired zombie survival modpack)

Read this only when the project is the user's Ruined City modpack. It turns `assets/examples/RUINED_CITY_GAME_VISION.md` (Revision 4, 24 October 2026) into a first session and an ordered plan, using `minecraft-modpack.md` and `minecraft-quality-standards.md`. It is an **example of a project-specific plan**, not part of the generic path; for any other pack, derive an equivalent from the user's vision.
**The user's current vision file always wins.** If it has changed since this plan was written, re-read it and adjust the plan, not the vision. Working title only; the game name is undecided.

## 1. Resolve these before Intake exits (ask one at a time, log in DECISIONS.md)
1. **Vehicles contradiction: RESOLVED in Revision 5.** The stale "vehicles" entry was removed from the WON'T-build list; vehicles and fuel (Mechanic I) are MUST. Nothing to ask; just confirm the vision you are given still says so.
2. **Version.** Section 15 says 1.21.1 "for now" but reopened. Lost Cities' hierarchical streets and highway network were confirmed only on newer versions, while the performance mods were confirmed on 1.21.1. Spike S1 decides; note 26.x needs Java 25 and breaks some 1.21.1 APIs (`minecraft-modpack.md` section 4).
3. **District list for v1.** Appendix F recommends splitting "rich" into a villa belt and a luxury-apartment district with a high street, section 9 already lists both, but the budget table in D.5 still has a single rich column. Confirm the v1 district list and update the budgets.
4. **Medina in the MVP.** The "done when" line needs five district types including the medina, whose generator is the hardest piece. Confirm whether a pragmatic medina (block parts with internal lanes) is acceptable for v1.
5. **Open numbers** (Appendix E item 6): in-game or real days for the horde, death and respawn rules, faction size and PvP limits, whether Mechanic H stays MUST (it is), village and town templates.
6. **Signage and text.** Which languages appear on signs and who reviews them (the author).
7. **Performance floor settings.** Revision 5 makes the **ASUS ROG Xbox Ally X** the reference device (Ryzen AI Z2 Extreme, Radeon 890M, 24 GB shared) and sets the pass at **1% low of at least 40 FPS**. Confirm the reading (1% low plus no sustained dip below 40 FPS longer than 1 s), the default 17 W profile for the gate, and the starting settings (native 1080p, no shaders, render distance 10, simulation distance 6). Chunk and planning budgets inherited from the old rig are provisional until S2 measures them on the device.
8. **Input on a handheld.** Keyboard and mouse docked, a controller layer, or both? Minecraft Java has no built-in controller support.

## 2. Spikes (copy into `_project/SPIKES.md`, riskiest first)
| Spike | Source in the vision | Question |
|---|---|---|
| S1 Version and loader | Appendix E 1 | Which version has every MUST role, including the Lost Cities features needed |
| S2 Performance baseline | Section 15 risk | What do Lost Cities generation, many AI zombies and N vehicles cost **on the ROG Xbox Ally X at 17 W**, and which render and simulation distances hold 40 FPS |
| S3 District hook | Appendix E 2 | Can a District Planner attach through the API or data, or must Lost Cities be forked; does a custom city style plus world style replace the defaults |
| S4 Loot | Appendix E 9 | Loot tables on chests and custom loot blocks, zero loose items |
| S5 Vehicles | Appendix E 8 | Immersive Vehicles on the pinned NeoForge version, licence for modpack use, which packs supply each category, spawning from code, cost of N parked vehicles |
| S6 Audio | Appendix E 10 | Source list per category from mods and open libraries, licence per file |
| S7 Repair Tracker | Appendix E 3 | Cheap Repair Score; blueprint ghost cost |
| S8 Mod gaps | Appendix E 5, 7 | Terrain and biomes, furniture, performance mods on the pinned version, EconomyCraft build, Lost Souls support, licence of each |
| S9 Calibration | Appendix E 4 | Real district polygons and imagery for the budgets (partly done in Appendix F) |

## 3. MUST list to gates
| MUST (section 17) | Where it is proven |
|---|---|
| Vehicles and fuel (1-in-5 functional) | M-G3 sampling test; S5 |
| Building-appropriate loot, zero loose items | M-G3 loot tests; `check_structures.py` |
| Audio provenance | M-A, `check_modpack.py` |
| Animals: wild packs, adoptable dogs, Stay/guard and Follow/scavenge | M-G3 roles, M-G4 sync |
| Streaming generation and the performance standard | M-P1 to M-P3, release blocker |
| Manual rebuilding, blueprint, Repair Score for one typology | M-G3, S7 |
| Generation pipeline, one template, five district types, street hierarchy | M-G3 planner tests, M-G2 per district |
| Architecture pack large enough that no district looks repeated | Variant spacing test, recognition test |
| Collapse, district loot, population-weighted zombies | M-G3 |
| Claims with a Hearth, seven-day horde on the street network | M-G3 routing, M-P3 |
| Injuries, sound-driven AI, economy tied to restored markets | M-G4, adapters |

## 4. Recommended order
1. Intake (resolve section 1), then the spikes (S1 and S2 first).
2. Style: reference board per district (the author supplies; the vision lists the photo set), palette proposal, block vocabularies, three test builds (one popular-housing house, one villa, one market shop), lineup, golden shots.
3. Skeleton: `scaffold_modpack.py --name "Ruined City" --path ... --districts popular,market_industrial,boulevard,villa,medina` (add `luxury_apartments` and `business` when the list is confirmed), planner skeleton, pack boots on client and dedicated server.
4. Vertical slice: **popular housing** end to end (grid streets, 4 to 6 typologies from Appendix C, damage, loot pools from Appendix I, density-driven zombies, one rebuild with the Repair Score, performance gates).
5. Then, one district type at a time with its gates: market or industrial, new-town boulevard, villa belt, medina last.
6. Systems layered on the slice in this order: loot containers, zombies and noise, vehicles and fuel, animals, Hearth and claims, horde director, economy.
7. Hardening, update test, licence and audio audit, handover.

## 5. What can start in a plain chat today
District and building cards from Appendix C, D and I; palette proposals once the author supplies reference photos; block vocabularies; loot-table JSON per Appendix I; vehicle spawn tables from Appendix J; the spike plan; the repo scaffold and its checks; planner design and, if a JDK is present, planner code with JUnit tests. Everything that needs the game (boot, lineup screenshots, performance, multiplayer) waits for the user's machine, with exact steps and evidence slots prepared.
