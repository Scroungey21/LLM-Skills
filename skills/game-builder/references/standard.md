# The Standard

Read once per project. It is the rule set every game follows: structure, code style, decisions and "done". Look, audio, clipping, security, balance, gates and process each have their own file (index in `SKILL.md`).
Written with Godot vocabulary; `engines.md` maps every term to Unity and Unreal.

## Contents
1. Why these rules exist
2. Vision and fun
3. Look, assets, audio (pointers)
4. Tool research
5. Architecture (folders)
6. Code organisation (files)
7. Code style
8. Networking and security (pointers)
9. Budget
10. Edge cases
11. Quality gates (pointer)
12. Decisions and questions
13. Definition of done
14. Human handover

## 1. Why these rules exist
Agent-built games fail in predictable ways. Each rule answers one.
| Failure | Answer |
|---|---|
| The agent guesses the game | a vision doc exists first (section 2) |
| It guesses the look, or drifts between looks | the user's art direction is asked, recorded and lineup-checked (`art-direction.md`) |
| It over-builds (abstractions, many documents) | size caps, few seams, simplest code (sections 6-7) |
| It declares victory after a parse check | gates that run the game and need a by-eye check (`quality-gates.md`) |
| Solids pass through each other, floors flicker, fixtures are unreachable | automated detection and fix-at-source rules (`clipping.md`) |
| Sounds are generated, borrowed or unlicensed | recorded-first audio with a licence floor (`audio.md`) |
| A hostile or clumsy client crashes or cheats the host | authority, admission, bounded parsing (`security.md`) |
| One strategy wins; content changes break the economy | rules as parameters and simulated balance (`balance.md`) |
| UI leaves the screen; the camera films the void | fit matrix and camera rules (`ui-and-camera.md`) |
| It ignores what players actually do | edge-case lists per genre (`genres.md`, `qa.md`) |
| It re-researches tools every session | research once, pin it (section 4) |
| Work is lost between sessions | handoff, decision log, standing conditions (`agent-process.md`) |

## 2. Vision and fun
**Rule.** Before any code, `_project/GAME_VISION.md` exists and is filled in. The agent never guesses the game: a missing field is asked (if expensive to reverse) or decided and logged (if cheap).
**Rule.** Two playability tests, starting values you may tighten:
- **30-second rule:** a new player can state the goal after 30 seconds without reading text.
- **60-second rule:** the first moment of fun (a hit, a catch, a win, a laugh) happens within 60 seconds.
**Rule.** Session length and scale are written down (rounds or long runs; how long the main progress takes). Rounds, not marathons, unless the genre or the user says otherwise.

Sample (a made-up project): `Pitch: a lone mechanic repairs drifting space stations before oxygen runs out. Type: arcade. Players: 1. Camera: side view. Goal: fix five consoles. Fail: oxygen hits zero. Session: 4 minutes. Fun source: the panic of choosing which repair first.`

## 3. Look, assets, audio (pointers)
- The look is the user's. Ask, record, enforce: `art-direction.md`. No style, palette or shader is a default.
- Sourcing, the licence ledger, Blender and the import rules: `assets.md`.
- Sound: recorded, never synthesised unless the user asks: `audio.md`.
- Clipping, collision and the camera: `clipping.md`, `ui-and-camera.md`.

## 4. Tool research
**Rule.** Research happens once, at project start, from `toolchain.md`, and the result is pinned in `_project/TOOLCHAIN.md`: versions, install commands, licence, one-line why. Agents read `TOOLCHAIN.md`; they do not re-research.
**Vetting test** (a tool must pass all): maintained and widely used; licence and cost compatible with the budget the user set; works with the pinned engine version; removes more work than it adds.
Heavy "AI studio" process frameworks usually fail the last test: one published measurement found a 30-document process ranked last on play quality against a one-page brief. Mine them for ideas; do not adopt them wholesale.

## 5. Architecture (folders)
**Rule.** The folder tree is the table of contents of the game. Someone who has never opened the engine must find anything by guessing the category. Each category folder is self-contained: its scene, script and models sit together.
Layout sample (a made-up platformer):
```
res://
  _project/        GAME_VISION, ART_DIRECTION, DECISIONS, CREDITS, TOOLCHAIN, HANDOFF, lineup scene, evidence/
  levels/world1/level1/   level1.tscn level1.gd  models/
  characters/player/  characters/enemies/
  objects/pickups/  objects/hazards/
  ui/main_menu/ hud/ settings/ credits/        each: scene + script
  shared/          state.gd events.gd (and anything truly shared)
  audio/           music/ sfx/ + the event table
  tools/           qa/ audio/ blender/   (QA and generators; excluded from export)
  addons/  tests/
```
**Rule.** `ARCHITECTURE.md` has one line per folder and a "where do I find X" table, and a test fails when a folder is undocumented. Details and per-genre trees: `architecture.md`.

## 6. Code organisation (files)
**Rule.** One compact script per trackable category of objects, holding its behaviour and physics (`lava_hazards.gd`, `vehicles.gd`).
**Rule: abstraction only at seams.** Default seams are autoloads: `Net` (networking), `State` (phase, score), `Events` (signal bus). Keep autoloads few and justified in `DECISIONS.md`; a fourth needs a written reason. Everything else is plain self-contained scripts.
**Repetition is allowed.** Similar physics in two sibling scripts may repeat; each header names its siblings. **Graduation rule:** when the same fix lands in three siblings in a row, promote that logic to a seam or tiny shared helper and log it.
**Big files:** about 300 lines is the soft cap. A bigger file is split into `<name>.gd` plus `<name>_impl.gd` parts by responsibility, or carries a `WHY LONG:` header line.
Header sample (on every script):
```gdscript
# lava_hazards.gd - Hazards that burn the player.
# WHAT:     lava pools, fire jets, and how they hurt and push.
# TALKS TO: level1.gd (spawns these), Events ("player_burned").
# SIBLINGS: spike_hazards.gd uses the same knockback. Keep in sync by hand.
```

## 7. Code style
**Priority for any feature, stop at the first that works:** engine built-ins; a pinned vetted addon; short custom code.
**Caps (soft; exceeding needs a one-line comment):** function about 20 lines; file about 300; one level of inheritance; no custom base classes or design-pattern frameworks; no clever one-liners.
**Style:** typed signatures and exported variables, `:=` inference elsewhere; plain English names (`carry_item`, not `handle_obj_v2`); tunable numbers are exported variables or data-table rows at the top, never buried. Comments explain why, not what.
Example:
```gdscript
@export var speed := 6.0
@export var jump_force := 7.5

func _physics_process(delta: float) -> void:
	if not is_on_floor():
		velocity += get_gravity() * delta
	elif Input.is_action_just_pressed("jump"):
		velocity.y = jump_force
	var dir := Input.get_vector("left", "right", "forward", "back")
	velocity.x = dir.x * speed
	velocity.z = dir.y * speed
	move_and_slide()
```

## 8. Networking and security (pointers)
Pick the mode by the game's needs (`networking.md`). The host is the authority; clients send intents; admission, bounds, limits and the hostile-client suite are in `security.md`. All networking code lives in the `Net` seam.

## 9. Budget
**Rule.** Ask the budget at intake and record it in `TOOLCHAIN.md` (what may cost money, which free tiers are used and their limits). If a feature does not fit the budget, say so and offer the nearest option that does. The user's decision wins; log it.

## 10. Edge cases
**Rule.** For every mechanic write down what a hostile, clumsy or unlucky player can do, then handle it. Per-genre lists are in `genres.md`; the method and always-on list are in `qa.md`.
Example (logged): `D-012 Two players grab the same crate -> the host grants the first request, ignores the second. Tested with 2 instances.`

## 11. Quality gates
"Bug-free" cannot be instructed, only evidenced. The ladder (G0 to G12), tiers and PASS lines are in `quality-gates.md`. A parse check is not a run. A passing test does not prove a menu is on screen.

## 12. Decisions and questions
**Rule.** Classify every open question.
- **Expensive to reverse** (core loop, camera, look, networking mode, platform, engine, player count, licence floor, release bar): ask the user. Offer 2 or 3 options with trade-offs; give a recommendation only for technical choices, never for the look.
- **Cheap to reverse** (a number, a key, a placement): decide and log.
Every decision is a row in `DECISIONS.md` with the user's verbatim words when they gave any.

## 13. Definition of done
The vision's goal can be reached and lost from a fresh launch; every applicable gate for the chosen tier passes; `CREDITS.md` covers every external asset; `ARCHITECTURE.md` matches the folders; a person who never saw the game can play a full round without help; for Release tier, `release-and-legal.md` is ticked and the user signed off.

## 14. Human handover
The reviewer may be new to the engine. Deliver a root `README.md` (what it is, how to run, how to play, folder map), `ARCHITECTURE.md`, `HANDOFF.md`, header comments on every script and a 5-line "how to add a new X" recipe for each repeatable content type.
