# Porting your own game to Roblox (module B)

Use only when the user picks "Port my game to Roblox". Read `roblox.md` first; this file is the translation workflow on top of it.
**Scope:** the user's **own** game (code, models, animations, sounds they own or are licensed to use). Do not port someone else's game or IP. Roblox is a different platform, not a different export target: a "perfect" port means the same fun, rebuilt the Roblox way, with deliberate additions and removals, not a line-by-line copy.
Never edit the original project. Work in a new folder or branch. Never one-shot: port system by system, with gates.

## Contents
1. Ask first
2. Steps
3. Add / remove / replace: what usually changes
4. Concept translation table (Godot and Unity to Roblox)
5. Asset conversion
6. How to implement common things
7. Parity and sign-off

## 1. Ask first (Rule 0, one question at a time)
1. Where is the source game (path or upload), which engine and version, and what state is it in?
2. What does "perfect" mean to you: **exact feel** (keep every mechanic even if awkward), **same game, Roblox-native** (default), or **reimagined for Roblox** (loop kept, structure free)?
3. Who is the Roblox audience: phone, console, PC? Solo or multiplayer? (A single-player game is often turned into co-op or a shared-world version; ask before assuming.)
4. Which parts of the original must stay identical (mechanics, art, animations, levels, story) and which may change? Use the Keep/Change ledger (`assets/templates/KEEP_CHANGE.md`) for this; frozen means frozen.
5. Monetization, badges, leaderboards, social features: in scope or not? Default: not, unless asked.
6. Is the original code to be reused as reference only? (Almost always yes: GDScript/C# does not run on Roblox.)

## 2. Steps
1. **Source inventory (cheap).** Folder tree, scenes, scripts, assets, networking, save data, input map. Do not read everything yet.
2. **Parity matrix** (`_project/ROBLOX_PORT.md`): one row per feature or system, with a status:
   **KEEP** (same behaviour, re-implemented), **ADAPT** (same intent, Roblox way), **ADD** (does not exist in the original but Roblox needs it), **REPLACE** (use a Roblox-native system instead), **REMOVE** (cannot or should not exist on Roblox), and a one-line reason. Fill it with the user, area by area, one question at a time. Read only the source files of rows that are not trivially KEEP.
3. **Roblox design decisions.** Player count and session length, camera and controls per device, onboarding, lobby/round flow, respawn rules, what the server owns. Log them in `DECISIONS.md`.
4. **Toolchain + scaffold.** Phases 2 to 4 of `roblox.md` (`scaffold_roblox.py`, R-G1).
5. **Convert assets** (section 5) into the lineup place; one look.
6. **Port system by system** in this order: core mechanic on the server first (greybox, R-G3 rule tests where possible), then input and camera, then characters and animation, then UI, then levels/content, then audio and effects. One category per step; run, look, show evidence, ask.
7. **Add the Roblox layer:** server authority and validation, data saving, lobby / teleport if needed, mobile and gamepad support, anti-exploit checks, optional social features the user chose.
8. **Platform QA:** R-G4, R-G5, device emulator, rejoin, performance on a real phone.
9. **Compare with the original** (section 7) and sign off with the user.

## 3. Add / remove / replace: what usually changes
**ADD (Roblox needs these):**
- Server-authoritative rules, validated remotes, rate limiting (a client can never be trusted).
- Data saving through DataStores with failure handling; versioned save data.
- Join/leave handling at any moment; respawn and reset behaviour; late join.
- Touch controls and gamepad support; scale-based, safe-area-aware UI.
- Streaming-tolerant client code; performance budgets for phones.
- A way into the game: lobby or spawn area, quick tutorial, clear first minute (new players arrive cold and leave fast).
- Optional, only if the user wants: badges, leaderboards, private servers, game passes or developer products, friends invites.

**REMOVE or rework (not possible or not wise on Roblox):**
- Local file access (save files on disk, mods, config files), native plugins, custom networking sockets or ports, external server dependencies.
- Custom shaders and custom render pipelines: use Materials, SurfaceAppearance, Lighting, post effects, particles, beams, trails.
- Meshes or textures above the budgets; huge static worlds without streaming; per-frame heavy physics designed for a native engine.
- Deterministic or lockstep multiplayer, and client-authoritative anti-cheat-free designs.
- Menus that assume a keyboard and mouse only; quit/exit-to-desktop buttons; resolution/graphics-API settings menus (keep only what Roblox lets you control).
- Anything tied to the original engine's editor tooling (tilemap editors, custom inspectors): rebuild as Studio data (Instances, Attributes, folders).

**REPLACE with Roblox-native systems:** characters (Humanoid/Animator) instead of a custom controller when the game suits it; Sounds/SoundService instead of audio buses; TweenService instead of engine tweens; DataStores instead of save files; Roblox UI instead of the original UI toolkit; CollectionService tags instead of engine groups.

## 4. Concept translation table
| Godot | Unity | Roblox |
|---|---|---|
| Node / scene tree | GameObject / hierarchy | Instance tree (Workspace, Folder, Model, Part) |
| PackedScene instance | Prefab instantiate | Model/Part stored in ServerStorage or ReplicatedStorage, `:Clone()` then parent |
| Autoload singleton | Static / singleton | ModuleScript required by the boot scripts (the three seams) |
| Signal | C# event / UnityEvent | `RBXScriptSignal`, BindableEvent, or `Events.luau`; across the network: RemoteEvent via `Net` |
| `_process(delta)` | `Update()` | `RunService.Heartbeat` (after physics); `RunService.Stepped`/PreSimulation for before physics |
| `_physics_process` | `FixedUpdate()` | Server-side logic in `Heartbeat` with `dt`; avoid fixed-step assumptions |
| `@export` var | `[SerializeField]` | Attribute on the Instance, or `Config.luau` |
| Group | Tag | `CollectionService` tag |
| Resource (`.tres`) / data | ScriptableObject | ModuleScript returning a table, or Attributes / ValueObjects |
| CharacterBody3D | CharacterController / Rigidbody | Humanoid (default) or custom controller using constraints, raycasts and `AssemblyLinearVelocity` |
| Area3D / trigger | Trigger collider | `Touched`/`TouchEnded`, or `workspace:GetPartBoundsInBox` / `OverlapParams` |
| RayCast3D | `Physics.Raycast` | `workspace:Raycast(origin, direction, RaycastParams)` |
| Tween / AnimationPlayer | DOTween / Animator | `TweenService`; `Animation` + `Animator` for rigs (keyframe animations) |
| Control nodes / Theme | UGUI / UI Toolkit | `ScreenGui`, Frames, `UIListLayout`, `UIAspectRatioConstraint`, UDim2 scale |
| Input Map actions | Input System actions | `ContextActionService` / `UserInputService` |
| AudioStreamPlayer | AudioSource | `Sound` in `SoundService` or on a part (3D) |
| High-level multiplayer RPC | Netcode RPC | RemoteEvent / RemoteFunction through `Net`; server is always authoritative |
| Save to `user://` | PlayerPrefs / files | DataStoreService (server) |
| Scene change | Load scene | Teleport to another place, or swap content inside one place (usually the second) |
Units and axes: Roblox's unit is the **stud** (about 0.28 m, check the docs); Y is up. When porting from meters, choose one scale factor, apply it everywhere (sizes, speeds, gravity feel) and log it in `DECISIONS.md`. Unity is left-handed, so mirror one axis when converting positions and rotations; verify visually with a lineup.

## 5. Asset conversion
- **Models:** export from Blender to FBX or GLB, import with Studio's 3D Importer. Stay under the triangle budgets in `roblox.md` section 8; decimate or split big meshes; bake detail into a texture of 1024x1024 or less; one material per mesh where you can; set `CollisionFidelity` to Box or Hull for props. Rigged characters: keep the skeleton compatible with the Roblox rig you chose (R15 or custom) and test the animations in place.
- **Animations:** re-author or retarget to the Roblox rig; import through the Animation Editor; verify names, looping, priorities and events (animation markers) one by one; transitions between game-flow phases are rebuilt with TweenService or animation tracks.
- **Textures and UI art:** resize to budget, upload, keep a table of asset IDs in `CREDITS.md`; spritesheets and 9-slice images need `ImageRectOffset/Size` or `SliceCenter`.
- **Audio:** convert to supported formats, check length and size limits and the current moderation and licensing rules before assuming a track will pass; keep a fallback silent placeholder.
- **Uploading and moderation:** assets are reviewed and some uploads can cost Robux; ask the user before any paid action. Keep source files so a rejected asset can be redone.
- Everything goes through the **lineup gate** so ported and new assets share one look.

## 6. How to implement common things
- **Core loop on the server:** a `State` machine (`Lobby -> Playing -> Results`), server-owned timers with `task.wait`/`os.clock` checks, `Events` for same-side messages, `Net` to tell clients.
- **Player abilities and combat:** client sends "I used ability X toward direction D", server checks cooldown, range, line of sight, then applies damage and tells clients to play effects. Visuals (swing, particles, camera shake) are client-side from the server's confirmation.
- **Inventory / currency:** a table per player on the server, replicated to that player only; purchases are requests; save through the data layer.
- **Levels:** build as Models in ServerStorage; the round script clones the level, positions spawns by tagged parts, cleans up after the round. Use tags and Attributes instead of hardcoded paths.
- **Camera:** default camera first; custom camera in a client module bound with `RunService:BindToRenderStep`; restore on character reset.
- **Game feel:** hit stop (short pause of animations/speed), screen shake via camera offset, TweenService squash/stretch, particles/beams/trails, layered `Sound`; keep effects client-side and cheap.
- **AI / NPCs:** server-side state machines; pathfinding with `PathfindingService`; throttle updates and use distance culling.
- **Settings menu:** sound volume (SoundGroups), controls hints per device; do not rebuild engine-specific graphics menus.
- **Multiplayer from single-player:** decide what is shared (world, enemies, score) and what is per-player (inventory, camera, UI); mind late joiners.
- **Save / load:** see `roblox.md` section 6.

## 7. Parity and sign-off
- Walk the parity matrix: every row is ported, changed on purpose, or removed, with the reason. No row is left unresolved.
- Put old and new side by side: the 30- and 60-second tests, screenshots or clips of the core loop, feel checklist (input latency, hit feedback, camera, audio).
- Write `_project/ROBLOX_DIFFERENCES.md`: what was **added**, **removed**, **replaced**, and why, in plain language the author can read.
- Confirm kept (frozen) items are unchanged in behaviour.
- Offer module T (playtest, preferably on phones) and module P (polish) as suggestions only.
Exit: the author confirms the Roblox version matches their intent.
