# Roblox reference (when Roblox is the target engine)

Read this whole file once per Roblox project. It replaces the Godot-specific parts of the standard (scaffold, gates, networking template) and keeps the rest.
Facts here were checked in October 2026; Roblox changes fast, so re-verify anything numeric against create.roblox.com/docs (every docs page has a `.md` twin: append `.md` to the URL).
Parts of the standard that stay exactly as they are: vision first, one look (style bible), $0 default, licences ledger, edge cases first, evidence over claims, never one-shot.

## Contents
1. What changes on Roblox
2. Toolchain
3. Phases and gates for Roblox
4. Architecture rules
5. Server-authoritative play (the rule that matters most)
6. Data saving
7. Characters, physics, UI
8. Limits and performance
9. Roblox edge cases
10. Verification ladder
11. Studio MCP (optional)

## 1. What changes on Roblox
| Standard rule | On Roblox |
|---|---|
| Godot 4 + GDScript | Roblox Studio + **Luau** (typed, `--!strict`), files synced with **Rojo** |
| `scaffold.py`, `check_project.py`, `gate_boot.sh`, `net_test.sh` | `scripts/scaffold_roblox.py`, `scripts/check_roblox.py`, and the R-gates below (run in Studio) |
| Three seams as autoloads: Net, State, Events | Three seams as ModuleScripts in `ReplicatedStorage.Shared`: `Net`, `State`, `Events` (+ `Config` for tunables). There are no autoloads: two boot scripts (`Main.server.luau`, `Main.client.luau`) are the only top-level scripts |
| Host-authoritative ENet multiplayer (`networking.md`) | **The Roblox server is always the authority.** Do not read the Godot networking template; use section 5 |
| Folder by category, scene + script + models together | `src/server/<Category>/` for server logic, authored assets stay as real Instances in Studio (Explorer-visible), documented in `ARCHITECTURE.md` |
| `@export` tunables | `Config.luau` for shared numbers, **Attributes** on Instances for designer-editable values |
| CC0 assets, `CREDITS.md` | Same. Also record Roblox asset IDs and who owns/uploaded them. Marketplace/Toolbox assets have their own terms: log the source and check them |
| Toon shader + palette lineup | No custom shaders. One palette, Materials / SurfaceAppearance, Lighting and post effects set once, `lineup` place in Studio |
| "$0" | Studio, Rojo, luau-lsp are free. Some Roblox actions can cost Robux or fees (certain uploads, monetization). Treat as an exception: state it, get the user's decision, log it |

## 2. Toolchain (pin the versions you verify in `_project/TOOLCHAIN.md`)
- **Roblox Studio** (free). Required to run and test.
- **Rojo** (filesystem to Studio sync; `rojo serve`, `rojo build -o game.rbxl`, `rojo sourcemap`). Install the matching Studio plugin. Rojo syncs files to Studio in one main direction; for existing places use `rojo syncback` (Rojo 7.7+) or Studio Script Sync. Roblox's docs page "external tools" covers the setup.
- **Luau Language Server (luau-lsp)** for autocomplete and type checks, fed by `rojo sourcemap default.project.json -o sourcemap.json`. Add **StyLua** (format) and optionally **Selene** (lint). `luau-analyze` can run in CI.
- **Wally** (package manager) only when a library is truly needed (see standard rule 3: built-ins first, then a pinned vetted package, then short custom code). Add `Packages/` to `.gitignore`, run `wally install` after cloning.
- **Studio MCP server** (built into Studio, optional): lets Claude read the DataModel, edit scripts, run Luau, start/stop play, read console output and take screenshots. See section 11. Old standalone `Roblox/studio-rust-mcp-server` is no longer actively developed; Roblox recommends the built-in one.
- **Git** from day one. `*.rbxl` and `*.rbxlx` are build artifacts: do not commit them unless the place is the source of truth.
- **Source of truth rule:** decide per subtree whether Studio or Rojo files own it. Never hand-edit a subtree that Rojo overwrites on the next sync; never create Studio-only changes inside a Rojo-owned path. Write the decision in `DECISIONS.md`.

## 3. Phases and gates for Roblox
Same eight phases as the standard, with these Roblox specifics. Per Rule 0, confirm the phase and depth with the user before starting.
1. **Intake.** As standard, plus: target devices (phone first? console? PC), expected players per server, session length, audience age (affects content rules), and whether monetization is in scope at all (ask; default no).
2. **Toolchain.** Studio, Rojo, luau-lsp, StyLua, Git; Studio MCP if the user wants agent-driven testing. Pin versions.
3. **Style.** Palette + a single lighting/post-effects setup + `lineup` place. Triangle and texture budgets from section 8 go into the style bible.
4. **Skeleton.** `python scripts/scaffold_roblox.py --name ... --type ... --path ...`, then `rojo build -o game.rbxl` or `rojo serve`. Build a menu/lobby, an empty level, and the two boot scripts. Exit: **R-G1**; plus **R-G4** if multiplayer.
5. **Vertical slice.** One level, one full loop, server-authoritative from the start (retrofitting authority later is painful). Exit: **R-G2**, **R-G3**, 30/60-second tests.
6. **Content.** One category at a time, lineup check, `CREDITS.md` row, `ARCHITECTURE.md` row. Exit per addition: R-G1.
7. **Hardening.** Roblox edge cases (section 9), exploit pass, device emulator, performance pass, `check_roblox.py` clean. Exit: **R-G5**.
8. **Handover.** README, `ARCHITECTURE.md` tables, header comments, release checklist (`qa.md`, minus Godot items). Publishing steps are out of scope unless the user asks.

Gates (run in Studio; with the Studio MCP, the agent can run them itself):
- **R-G1 Boot:** project builds; Play in Studio; Output shows `[boot] server ready` and `[boot] client ready`; zero errors or warnings in **both** the server and client Output.
- **R-G2 Slice:** a screenshot of the playable slice saved to `_project/evidence/`.
- **R-G3 Rules:** the game rules are in plain modules (no Instances) and tested; run them with the Luau CLI or an in-Studio test runner. Output of the run is the evidence.
- **R-G4 Multiplayer:** Studio *Server & Clients* with at least 2 clients: join, leave mid-round, respawn, late join. Remotes work, state matches on all clients.
- **R-G5 Hardening:** exploit pass (fire every remote with wrong types, huge values, spam), device emulator + controller emulator pass, MicroProfiler / Shift+F3 numbers within budget, `check_roblox.py` has no errors.

## 4. Architecture rules
- **Where code runs.** `Script` = server. `LocalScript` runs on the client only in client containers (`StarterPlayerScripts`, `StarterCharacterScripts`, `StarterGui`). `ModuleScript` is shared code. Server-only assets and secrets go in `ServerStorage` or `ServerScriptService`; everything in `ReplicatedStorage` is visible to clients.
- **Real Instances over runtime construction.** UI, attachments, constraints, folders and remotes that a designer should tune stay as named Instances in Explorer. Scripts add behaviour and truly dynamic repetition; do not hide a whole feature inside one giant script that builds everything at runtime.
- **Attributes + CollectionService tags** for small designer-editable data and for finding sets of Instances; validate missing or malformed Attributes at setup and `warn` with the full Instance path. The owning system cleans up when a tagged Instance is removed.
- **Reuse before adding.** Before adding a remote, manager or folder, search for an existing one; duplicate systems cause double binding, double saves and double effects.
- Script names: `*.server.luau`, `*.client.luau`, plain `.luau` for ModuleScripts, `init.luau` for folder-as-module. Use `task.wait/spawn/delay`, never `wait/spawn/delay`. Set properties first and `Parent` last. Disconnect long-lived connections.
- The standard's size caps (about 20 lines per function, 300 per file), header comment (WHAT / TALKS TO / SIBLINGS) and max three seams apply unchanged.

## 5. Server-authoritative play
- The client sends **requests** ("I pressed buy on item X"), never results ("I now have 100 coins"). The server validates and applies.
- Every remote goes through `Net` (`Net.define`, `Net.onServerEvent`, `Net.fireClient`, `Net.fireServer`). The template validates arguments with a validator you write, rate limits per player, and ignores bad input silently.
- Validate **type, range, and permission** (is the player allowed to do this now, in this phase, near this object?). Never trust positions, damage, prices, cooldowns or IDs sent by the client.
- Prefer one-way RemoteEvents; avoid RemoteFunctions that make the server wait on a client.
- Server owns health, currency, inventory, round state, scoring. The client may predict for feel (movement, effects) but the server decides.
- Physics: set network ownership deliberately for fast-moving client-owned objects; the server can still validate results.
- Keep secrets (keys, webhook URLs, admin lists) in server-only locations.

## 6. Data saving
- DataStores are **server-only**, asynchronous and rate limited; wrap every call in `pcall`, retry with backoff, and never block gameplay on a save. Check current request limits in the docs.
- Save on `PlayerRemoving` and on `game:BindToClose`. Load once at join, keep the data in memory, save periodically and on leave.
- Prevent two servers writing the same player (session locking). Popular community modules exist for this (for example ProfileStore/ProfileService); using one is a pinned-package decision logged in `DECISIONS.md`, and the free-only rule still applies.
- Version the save format so old saves keep loading. Handle "data failed to load": do not overwrite with defaults.
- Test: join, leave, rejoin, server shutdown, DataStore failure.

## 7. Characters, physics, UI
- **Characters:** players get a Humanoid character by default. Decide early: use the default avatar rig (R15) or a custom character. Handle spawn, respawn and reset; client code that touches the character must re-hook on `CharacterAdded`, and use `WaitForChild`.
- **Physics:** parts belong to assemblies; use `Anchored` for static scenery, constraints for mechanisms, `workspace:Raycast` with `RaycastParams`, `OverlapParams` for area queries. Choose collision groups on purpose. Tune `CollisionFidelity` (Box or Hull for most props).
- **UI:** `ScreenGui` with **scale-based** sizing (`UDim2` scale, `UIAspectRatioConstraint`, `UIListLayout`), safe areas for phone notches, touch targets large enough, gamepad navigation. Test at phone, tablet and desktop sizes; UI shells are authored Instances, behaviour is a small client module.
- **Input:** support keyboard/mouse, touch and gamepad from the start (`ContextActionService` or `UserInputService`); on phone provide on-screen controls.

## 8. Limits and performance
Check the numbers again before relying on them; sources differ slightly.
- **Meshes:** the importer rejects a single MeshPart above roughly **20,000 to 21,000 triangles**. Budgets for mobile: about 1k to 5k for props, 5k to 10k for characters and vehicles. Accessories: 4,000 triangles.
- **Textures:** keep props at 1024x1024 or lower; texture memory grows with the square of the size.
- **StreamingEnabled** on (loads nearby content only). Mesh streaming / cloud LoDs opt-in beta appeared in April 2026; check status. Code must tolerate parts that have not streamed in (`WaitForChild`, `:IsDescendantOf`).
- **Frame targets:** 60 FPS desktop, at least 30 FPS on mobile; test on a phone, not only in Studio. Shift+F3 shows the performance stats; use the MicroProfiler to find hot spots; profile a long session (20 minutes), servers can degrade over time.
- Anchor static parts; use events instead of `while true do wait()` loops; pool frequently spawned objects; avoid per-frame instance creation.
- Part count and Instance count add up: budget them in the style bible.

## 9. Roblox edge cases (add to the genre list)
Player joins mid-round; player leaves mid-round (cleanup, team balance, host-like roles); character not loaded yet; respawn while holding items; client data arrives before the server replied; part has not streamed in; remote fired with wrong types or at huge rates; two players interact with the same object in the same frame; DataStore throttled or failing; server shutting down; teleport fails; player on a phone with no keyboard; gamepad-only player; reset button pressed mid-action; very low FPS client; latency spikes (rubber banding); player runs fast/teleports (speed exploits) - the server validates movement-critical results.

## 10. Verification ladder
Use the smallest rungs that cover the change, and never report a higher rung than you ran:
1. **Static:** project JSON parses, `check_roblox.py`, luau-lsp / `luau-analyze` clean.
2. **Single session:** Play in Studio; right execution context, hierarchy as expected, no new Output errors or warnings; the happy path works; cleanup done.
3. **Lifecycle:** respawn, reset, rejoin, streaming.
4. **Server & Clients:** at least two clients for remotes, replication, ownership, joins and leaves.
5. **Device / input:** Device Emulator and Controller Emulator profiles, orientation, touch.
6. **Stress / failure:** malformed input, spam, rapid transitions, simultaneous actions, disconnects.
Report evidence precisely: changed Instances and files, modes and client counts, cases run, Output seen, anything not run. "Looks plausible" is not "tested in Studio". After testing, remove temporary parts, test remotes, debug UI and stray prints.

## 11. Studio MCP (optional)
Enable in Studio: the `...` menu, *Manage MCP Servers*, turn on *Enable Studio as MCP server*; add it to Claude Code or another client over stdio, following create.roblox.com/docs/studio/mcp (on Windows the server command is under `%LOCALAPPDATA%\Roblox\mcp.bat`). Restart Studio and the client if the tools do not show up. **Warning:** a connected client can read and modify the open place; get the user's go-ahead and work on a copy or a branch.
Typical tools (names may change; confirm with `/mcp`): `search_game_tree`, `inspect_instance`, `script_search`, `script_grep`, `script_read`, `multi_edit`, `execute_luau` (Edit, Client or Server data model), `get_studio_state`, `start_stop_play`, `get_console_output`, `screen_capture`, `character_navigation`, `user_keyboard_input`, `user_mouse_input`, `upload_image`, `http_get` (Roblox docs only), `list_roblox_studios`.
Map them onto the ladder: inventory with the search/inspect tools; edit with `multi_edit` (it still writes normal inspectable scripts); verify with `start_stop_play`, `get_console_output` (read both server and client output) and `screen_capture`; playtest with the navigation and input tools. MCP is a transport for the same workflow, not a licence to skip it, and it does not change the Rojo-vs-Studio source-of-truth rule.
