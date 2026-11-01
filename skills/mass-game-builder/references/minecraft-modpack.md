# Minecraft modpack reference (when a Minecraft modpack is the target)

**This path is project-neutral.** It builds any kind of pack (tech, magic, adventure, questing, survival, horror, vanilla+, kitchen sink, server network, world-generation heavy). Project-specific material lives only in the user's own vision spec and, if they ask for it, in the example files (`assets/examples/`, `minecraft-kickoff-ruined-city.md`). Nothing here assumes a genre, a device or a district system.
Read this whole file once per modpack project. It replaces the Godot-specific parts of the standard (scaffold, gates, networking template) and keeps the rest: vision first, one look, $0, licence ledger, edge cases first, evidence over claims, never one-shot.
Companion files. **Always read:** `minecraft-quality-standards.md` (quality and performance standards for any pack: device profiles, the pass definition and protocol, the Q1 to Q10 quality bar, archetype add-ons). **Read when the task needs them:** `minecraft-art-direction.md` (the art contract and how it is enforced), `minecraft-toolchain.md` (version choice, mod vetting, tools, MCPs), and only for packs that have them: `minecraft-worldgen.md` (procedurally generated places, streaming, determinism), `minecraft-systems.md` (survival-horde playbook: AI, hordes, claims, animals, vehicles, loot, audio).
Facts checked October 2026. Minecraft, loaders and mods change fast: re-verify every version number and API name against the real files before relying on it. Never state something as verified that you did not see.

## Contents
1. What changes on Minecraft
2. The layers and the decision order
3. Phases and gates for a modpack
4. Version and loader decision
5. Architecture rules for custom mods
6. Dependencies, licences, packaging
7. Performance engineering
8. Multiplayer and the dedicated server
9. Saves, worlds and pack updates
10. Modpack edge cases
11. Verification ladder
12. What the agent can and cannot run
13. Definition of done

## 1. What changes on Minecraft
| Standard rule | On a Minecraft modpack |
|---|---|
| Godot 4 + GDScript | Minecraft Java + a loader (**NeoForge** default) + data pack JSON + resource pack + custom Java mods + pinned third-party mods, assembled as a **packwiz** pack |
| `scaffold.py`, `check_project.py`, `gate_boot.sh`, `net_test.sh` | `scripts/scaffold_modpack.py`, `check_modpack.py`, `check_palette.py`, `check_structures.py`, `gen_lineup.py`, `palette_from_refs.py`, `check_frametimes.py`, `check_logs.py`, and the M-gates below |
| Folder by category, self-contained | One Java package per category inside each custom mod; data and assets by namespace and category; structures at `<zone>/<typology>/<name>.nbt` when the pack has zones |
| Three autoload seams (Net, State, Events) | Three seams per mod: **`Net`** (all payloads and validation), **`Saved`** (all persisted state, versioned), **`Integrations`** (one adapter per third-party mod). Planners are plain Java with no game imports |
| `@export` tunables | `ModConfigSpec` config and data-driven JSON (loot tables, rarity tables, district budgets). No magic numbers in methods |
| Host-authoritative ENet | The **logical server is always the authority**. A dedicated server is built from the same pack; the client renders and sends intents |
| Toon shader + palette + lineup scene | `palette.json` + `block_vocab.json` + a lineup world, enforced by scripts; no custom shaders in the performance floor test |
| CREDITS ledger | Plus `MODLIST.md` (licence + redistribution verdict per mod) and an **audio provenance ledger** |
| $0 | All tools are free. Free hosting for distribution (Modrinth, GitHub Releases). A mod that may not be redistributed is `link-only` or dropped |
| Vertical slice | **One content unit end to end** (one zone type, one tech tier, one quest chapter, one dungeon type...), not "a bit of everything" (section 3) |
| Never one-shot | Also: never author a whole world, mod or content area in one go; one typology or one system per step |

## 2. The layers and the decision order
A modpack has five layers. Put each feature in the lowest layer that works, because every line of custom Java must be re-ported when Minecraft changes (the 26.1 jump changed item stack creation, GUI rendering and chunk position APIs), while data and config mostly survive.
1. **Data and config:** data pack JSON (loot tables, tags, structures, worldgen), mod config files, game rules.
2. **Pinned third-party mods** (one per role).
3. **Script glue** (KubeJS-style), only if vetted for the pinned version and kept small.
4. **Custom Java mods** (only for what layers 1 to 3 cannot express: generation planners, a custom system, glue between two mods).
5. **Resource pack, art and audio.**
Decision order for any feature, stop at the first that works: vanilla data -> an existing mod's config or API -> a pinned vetted mod -> script glue -> short custom Java.
**One mod per role** (AI overhaul, injuries, claims, economy, vehicles, performance...). Two mods for one role is a conflict waiting to happen.
**Never edit a downloaded jar.** `pack/` holds metadata references (`.pw.toml`), not third-party jars, unless the licence allows bundling.

## 3. Phases and gates for a modpack
Same eight phases as the standard. Per Rule 0, confirm the phase and depth with the user first.
1. **Intake.** As standard, plus: pack archetype(s), Minecraft version policy (spike decides), **reference device and the pass line in numbers** (propose a profile from `minecraft-quality-standards.md` section 2 and confirm the definition of a pass), singleplayer plus dedicated server or only one, audio source policy (default: existing mods or open libraries, no AI or synthesized audio), distribution and licensing posture, art references the author will supply, scope cap. Exit: vision one-pager filled, `PERF_BUDGET.md` pass line and device set, `QUALITY_BAR.md` archetype rows chosen, three mood words written.
2. **Spikes and toolchain.** Run `_project/SPIKES.md` riskiest first (version and loader, any framework or generator hook the pack depends on, heaviest content cost against the pass line, licences, and whatever else the vision makes risky; delete template rows that do not apply). Every `[Unverified]` claim in the vision becomes a spike row. Pin `TOOLCHAIN.md` and `MODLIST.md`. Ask before downloading or installing anything. Exit: S1 decided, every MUST role has a mod or a custom-build plan, adopted mods have a licence and redistribution verdict. **Announce the version freeze** and log it.
3. **Style.** Fill `STYLE_BIBLE.md`; propose the palette from the reference board (`palette_from_refs.py`), the author approves it; write `block_vocab.json`; build the lineup world (`gen_lineup.py`); save the first golden screenshots. Exit: **M-G2** on the lineup. Details: `minecraft-art-direction.md`.
4. **Skeleton.** `python scripts/scaffold_modpack.py --name ... --path ... --archetype ... [--districts ...]`; create each mod from the official generator at the pinned version (never hand-write build files from memory); `packwiz init`; planner skeleton with a determinism test; an empty content unit; client and dedicated server boot from the exported pack. Exit: **M-G1**, and **M-G4** boot with two clients.
5. **Vertical slice: one content unit end to end.** Pick the unit that exercises the most risk: for a generated-world pack one zone type with its buildings, loot and threats; for a tech pack one tech tier with its machines and recipes; for a quest or magic pack one chapter with its progression; for an adventure pack one dungeon type with its loot and boss. It includes the core loop for that unit, art, audio, and a performance pass. Exit: **M-G2, M-G3, M-P1** (and **M-P2** if the unit streams new content) for that unit, plus the 30 and 60-second tests.
   Choose the slice order and log it in `DECISIONS.md`: engine and performance risk first, art variety second.
6. **Content.** One category at a time, with these loops.
   - **Building typology / structure family** (packs with built structures): card (`BUILDING_CARD.md`) -> build in the authoring world -> export NBT -> `check_structures.py` -> `check_palette.py` for any new textures -> lineup screenshot -> art director review -> performance cost recorded -> CREDITS row -> ARCHITECTURE row.
   - **System (machines, quests, mobs, economy, loot, whatever the pack adds):** write its edge cases first -> implement -> rules tests -> in-world test -> cost recorded in `PERF_BUDGET.md` -> `MODLIST`/ARCHITECTURE rows.
7. **Hardening.** Edge cases (section 10), **M-G5**, the full performance gates **M-P1 to M-P4** on the reference device, the whole **quality bar** (`QUALITY_BAR.md`, rows Q1 to Q10 plus the archetype rows), the soak tests **M-S**, the update test **M-C**, the licence audit **M-L**, the audio audit **M-A**, a multiplayer soak. `check_modpack.py`, `check_logs.py` clean.
8. **Handover and release.** README, `ARCHITECTURE.md` tables and recipes, header comments, exported client pack and server pack, changelog and known issues, "how to update safely". Publishing steps are out of scope unless the user asks.

| Gate | Check | Evidence |
|---|---|---|
| **M-G1 Boot** | Client and dedicated server start from the exported pack on a clean instance; no crash, no missing dependency, no error-level log lines; a fresh world joins; time to playable recorded | Log and timed join in `_project/evidence/` |
| **M-G2 Look** | Lineup screenshot set from the fixed protocol matches the style bible and the golden shots; `check_palette.py` and `check_structures.py` clean; art director checklist signed | Screenshots + script output |
| **M-G3 Rules** | The pack's own rules are tested: for generated worlds JUnit planner tests (determinism and order independence, budgets, spacing, connectivity); loot placement tests; distribution tests over large samples for anything random; recipe and progression reachability; system-specific tests from the genre file in use | Test output |
| **M-G4 Multiplayer** | Dedicated server plus two clients: join, leave mid-event, rejoin, shared state (claims, machines, mobs, quests) syncs, no desync | Scenario notes and logs |
| **M-G5 Edge cases** | Section 10 plus the genre list in use (`minecraft-systems.md` for survival-horde packs), each ticked or logged | `DECISIONS.md` |
| **M-P1 Frame** | Reference device, densest-content route: **1% low meets the pass line in `PERF_BUDGET.md` and no sustained dip below it** (definition and protocol: `minecraft-quality-standards.md` section 3); all three runs pass; average and vanilla delta reported | Frame-time CSVs + `check_frametimes.py` output, power mode noted |
| **M-P2 Stream** | (If the pack generates or loads heavy new chunks) fresh-world flight: no chunk-stream hitch over the budget, main-thread chunk cost within budget | Profiler capture |
| **M-P3 Load** | The heaviest realistic scenario (biggest base, most machines, most mobs, most players): server MSPT within the server profile and the client pass line holds. Singleplayer runs the server on the client's machine, so on handhelds and mainstream devices that run is the hard case and is the gate; dedicated-server runs are measured on the real host | spark capture |
| **M-P4 Memory and startup** | 60-minute session without GC stalls; heap fits the recommended allocation; cold launch and world load times recorded and within the 10% regression limit | Heap graph, timed runs |
| **M-S Soak** | Client and dedicated server soak (default 2 h and 8 h) with no crash and no repeating exception; `check_logs.py` clean | Logs, script output |
| **M-Q Quality bar** | `QUALITY_BAR.md`: every row pass, or waived by the author in writing | The scorecard |
| **M-D Docs** | A newcomer review of the repo and README passes (handover review) | Reviewer notes |
| **M-A Audio** | Every audio file has a CREDITS row; none AI-generated or synthesized; no NC licence | `check_modpack.py` |
| **M-L Licence** | Every adopted mod has a licence and redistribution verdict; the export contains only what may be shipped | `MODLIST.md` + export listing |
| **M-C Compat** | A world saved on the previous release loads after the pack update; new chunks generate without errors | Test notes |
Every content addition runs M-G2 and the relevant performance gate before merge.

## 4. Version and loader decision (spike S1)
Method: (1) list the roles the vision MUSTs; (2) build an availability matrix, one row per candidate mod, one column per Minecraft version, for the chosen loader, client and server side; (3) estimate the custom-code port cost between versions; (4) note the data-format risk (structure NBT carries a `DataVersion`); (5) pick the **highest version where every MUST role is covered or has a custom-build path**; (6) record it in `DECISIONS.md` with the matrix as evidence.
Facts checked October 2026: Minecraft moved to year-based versions in 2026 (26.1 and later). On 26.1 NeoForge needs **Java 25** and Gradle 9.1 or newer, the game is unobfuscated (Parchment is no longer needed), NeoForge versions have four parts (for example `26.1.0.1-beta`) and a `-beta` suffix means breaking changes are still allowed. Items that broke for 1.21.1 mods: creating an `ItemStack` needs loaded registries (templates are used in data), `GuiGraphics` became `GuiGraphicsExtractor`, `ChunkPos` construction and packing methods were renamed. 1.21.1 uses Java 21. Re-verify all of this at spike time.
Fabric, Forge or Quilt only if a MUST mod exists nowhere for NeoForge. Do not mix loaders.
**Version freeze:** after phase 4 the Minecraft version, loader and Java do not change. If something forces a change, treat it as a port project: new branch, parity matrix, Keep/Change ledger (module A).

## 5. Architecture rules for custom mods
- **Package per category** (`worldgen`, `buildings`, `horde`, `claims`, `animals`, `vehicles`, `loot`...), self-contained. One compact class per category where possible. **Header comment on every Java file** (Javadoc block with `WHAT`, `TALKS TO`, `SIBLINGS`). About 20 lines per method, 300 per file. `check_modpack.py` enforces the header and size caps.
- **Seams (max three per mod).** `Net`: payload registration, handlers, validation of type, range and permission, rate limits, nothing else. `Saved`: all persistent state; every persisted structure carries an int `version` and migration code. `Integrations`: one adapter class per third-party mod behind a small interface, optional-mod detection inside it, and no class of a missing mod referenced outside it; swapping a mod then touches one file. Event handlers stay in the category class that owns the behaviour.
- **Planners are plain Java.** The `planner/` package imports nothing from `net.minecraft` or `net.neoforged`; it is a pure function of (seed, coordinates, config) and returns plain records. A thin adapter in the game layer turns plans into blocks. This is what makes determinism, order independence and quotas testable with JUnit in seconds, with no game launch. `check_modpack.py` fails any game import in a planner package.
- **Determinism rules** (apply to everything under `worldgen`, `planner`, `plan`, `gen`): derive a seeded random from seed + salt + position, never `Math.random`, `new Random()`, wall-clock time or shared mutable RNGs.
- **Side safety.** Client-only code (renderers, screens, keybinds) lives in a `client/` package and is never referenced from common code, or the dedicated server crashes. M-G1 on the dedicated server catches this.
- **Server authority.** The client sends intents ("I pressed claim"), never results. Never trust client positions, counts, prices or IDs.
- **Hot-path habits.** No per-tick world or entity scans (use events, dirty flags, spatial indexes, throttling staggered by entity id); no allocation in hot loops; heavy work off-thread, applied on the main thread; generation never creates item entities and never loads neighbour chunks synchronously.
- **Registry names are forever.** Renaming breaks worlds. Deprecate instead of delete; add aliases and data fixers when a rename is unavoidable.
- **Data first.** Loot, rarity tables, district budgets and vehicle tiers are JSON loaded by codecs and reload listeners; code reads them.
- **Mixins:** avoid. Allowed only with a logged reason, minimal and targeted; validate them with the tooling.
- **Logging:** namespaced, quiet at info level, per-chunk detail only at debug.

## 6. Dependencies, licences, packaging
- Every third-party mod gets a `MODLIST.md` row the minute it is added: role, version, side, licence, redistribution verdict (`ships-in-pack`, `link-only`, `not-allowed`), measured cost, conflicts, status (candidate, verified, adopted, rejected). `check_modpack.py` fails an adopted row with an empty licence or verdict.
- Licence classes: permissive (MIT, Apache, LGPL) can ship with notices; GPL carries obligations (keep source available); **All Rights Reserved** means link-only unless the author's page grants modpack use (record where); non-commercial terms need a decision from the user. Read the actual licence text, not a summary.
- Follow each distribution host's modpack rules (Modrinth, CurseForge) and re-read them at release; they change.
- **packwiz** keeps the pack as git-friendly TOML metadata with hashes, so players get exactly the files you tested. Export a client pack (`.mrpack` and/or CurseForge zip) and a server pack. Check the current packwiz fork and commands at pin time.
- Our own mods are built jars published with the pack; our data pack and resource pack ship inside it. Third-party names appear in the README and `CREDITS.md`.
- Release artefacts: client pack, server pack, changelog, known issues, world-compatibility note.

## 7. Performance engineering
Performance is a design requirement, not polish. The standards (device profiles, the pass definition, protocol, universal metrics, regression limit) are in `minecraft-quality-standards.md`; the project's numbers live in `PERF_BUDGET.md`. They are measured on the user's reference device, with fixed seed, route, time of day and settings, three runs where every run must pass, capture saved, `check_frametimes.py` output kept. A regression is fixed before merge.
Order of suspicion when something is slow: (1) main-thread chunk generation cost; (2) entity counts and AI ticks; (3) block entities; (4) item entities; (5) lighting updates after large changes; (6) rendering cost (atlas size, translucent or animated textures, particles); (7) memory and GC; (8) mod-stack overhead.
Techniques that keep the pack inside budget:
- **Streaming layers** (outline in the background, detail per chunk) and no lookahead beyond the outline: `minecraft-worldgen.md`.
- **Entity and tick budgets** per area and per machine or system. **Abstract simulation** where the design allows: far-away things are a few counters or data that become real entities only near players (the survival-horde example is in `minecraft-systems.md`).
- **Event-driven logic** (react to an event, do not scan every tick). Throttle and stagger everything periodic.
- **Plain blocks** for architecture and decoration; no block entity per structure; static ruin props; one texel density and a bounded atlas; few translucent or animated textures; capped particles.
- **Performance mods:** add one at a time, measure each on the reference rig, keep only what measurably helps, and remove anything that clashes with custom worldgen. Candidates and risks: `minecraft-toolchain.md`.
- Profile with spark (client and server), vanilla `/perf` for server ticks, and a frame-time capture tool. Look at a 60-minute run, not only a short one.
- **Handhelds, laptops and shared-memory devices:** warm up before measuring, record the power mode, count heap + graphics + OS against one memory pool, and derive budgets on the device (worked example in the standards, section 8). Input on devices without a keyboard (controller layer or not) is an intake question.
The agent cannot do these measurements in a cloud sandbox (no game, no GPU): see section 12.

## 8. Multiplayer and the dedicated server
- The dedicated server is built from the same pack; the integrated singleplayer server runs the same code. Test both.
- Validate every payload on the server; rate limit; ignore bad input silently.
- Claims, economy and PvP rules go through the pinned mod via its adapter; offline protection and raid windows are vision decisions.
- Server budget: 20 TPS under full load with the planned player count; each system has a tick budget in `PERF_BUDGET.md`.
- Client and server must run the same mod list and versions: packwiz-installer on both, and a version check on join.

## 9. Saves, worlds and pack updates
- **Determinism and updates interact.** If planner logic changes after release, ungenerated chunks follow the new rules while generated ones keep the old ones, which makes a visible seam in existing worlds. Store a `planner_version` in the world data; either keep old worlds on the old path or accept the seam and say so in the changelog. Log the choice.
- Every persisted structure is versioned (`Saved`). Structure NBT carries a `DataVersion`; keep the authoring world on the pinned version and re-save old files after any upgrade (`check_structures.py --data-version`).
- Use semantic versions for the pack. The changelog states whether an update is "safe for existing worlds" or "new world recommended".
- Config files are migrated, not replaced silently.
- **M-C test:** take a world saved on the previous release, update the pack, load it, walk into new chunks, read the log.

## 10. Modpack edge cases (add to the genre list)
Missing or mismatched mod on client or server; a client with extra mods; a client-only class referenced from common code (dedicated server crash); a mod removed from the pack while worlds still contain its blocks or entities; a mod update that renames loot tables or registry entries; two mods binding one key; worldgen deadlock from synchronous neighbour-chunk loads; seed 0, negative seeds and very large coordinates (use integer or `long` math in planners; floats lose precision far from the origin); the edge of the country plan; spawn in void, water or the wrong district; a city overlapping ocean or river; a chunk requested before the outline is ready; vanilla villages and other mods' structures spawning inside cities (override structure sets, biome tags); vanilla mob spawns that fight the design (phantoms, creepers) and **Peaceful difficulty removing hostile mobs** (lock or document difficulty); sleeping and `/time` changes breaking the day counter; creative and spectator players; client mods cheating (server validation); datapack reload mid-session; server restart mid-horde; game rules (`mobGriefing`, `keepInventory`) set by the pack; a player disconnecting while carrying loot or driving.

## 11. Verification ladder
Use the smallest rungs that cover the change and never report a higher rung than you ran.
1. **Static:** JSON valid, `check_modpack.py`, `check_palette.py`, `check_structures.py`, `./gradlew build`, JUnit planner tests.
2. **Single session:** launch the client from the pack, join a world, look, logs clean.
3. **Dedicated server:** boots from the same pack, a client joins.
4. **Two clients:** replication, joins and leaves, claims, entities.
5. **Stress and failure:** spam, kill the server mid-horde, reload the datapack, update the pack over an old world.
6. **Reference device:** the benchmark routes with captures, then the soak.
Report precisely: files changed, which rung, versions, seeds, routes, outputs seen, and everything not run. "Compiles" is not "runs", and "runs" is not "looks right".

## 12. What the agent can and cannot run
In a plain chat or cloud sandbox there is usually no Minecraft, no GPU and maybe no JDK. Be explicit about it, as with Godot.
- **Can do anywhere:** all docs and cards, palette proposals, JSON data (loot tables, district budgets, block vocabularies), the Python checks, structure file checks, lineup function generation, pure-Java planner code and JUnit tests **if a JDK is present**.
- **Needs the user's machine:** booting the pack, the lineup screenshots, every performance gate, multiplayer tests, in-world GameTests, audio listening.
For those, write exact steps and the evidence slot, ask the user to run them (or run them yourself when an in-game MCP and a game install are available and the user has agreed), and mark the gate **not run** until real output exists. Never fill an evidence slot from belief.
Agent roles are hats, not mandatory subagents (heavy agent hierarchies hurt more than they help; spawn a separate agent only when the user asks). Two reviews do benefit from a fresh reader who has not seen the work being produced: the **art director review** (reads only the style bible, the card and the screenshots) and the **handover review** (reads the repo as a newcomer).

## 13. Definition of done (modpack)
The vision's goal can be reached and lost from a fresh install of the exported pack; every gate above passes on the reference device with evidence and the quality bar scorecard is all pass or author-waived; `MODLIST.md` and `CREDITS.md` cover everything shipped; golden screenshots match the shipped look for every area; `ARCHITECTURE.md` matches the folders; the update test passes; a friend who has never seen it plays the first hour without help.
