# Architecture Reference

Read this when laying out folders, adding a category, or explaining the project to a reviewer.
The rules (folder by category, one compact script per category, few seams) are in `standard.md` sections 5-6. This file shows how they look in practice.

## Contents
1. Naming
2. Scene and script conventions
3. Worked example: a level that connects its areas
4. Layout per game type
5. How do I add a new...
6. Seams: what belongs where
7. Tools folders
8. The "where do I find X" table is tested
9. Anti-patterns

## 1. Naming
- Folders and files: `snake_case`, plain English. Scripts are named by category: `hazards.gd`, `vehicles.gd`, `player.gd`, `net.gd`.
- Scene root node = the folder's name in `PascalCase`. One script per scene, attached to the root.
- Signals are past tense (`item_broken`, `round_ended`). Functions are verbs (`grab_item`). Variables are nouns.
- Group names are plural lowercase (`hazards`, `players`, `enemies`).
- Tunable numbers are exported variables at the top of the script, or rows in a data table.

## 2. Scene and script conventions
- **Signals go up, calls go down.** A parent may call methods on its children. A child never reaches up to its parent: it emits a signal and the parent connects to it.
- A script touches only nodes inside its own scene, plus the seams (`Events`, `State`, `Net`).
- Find objects by **group** or exported references. Avoid long relative paths: they break when scenes are rearranged.
- A scene is the engine's prefab: built once, instanced many times. Variation comes from exported values, not copied scenes.

## 3. Worked example: a level that connects its areas
The level knows its areas only through a group and a signal. Adding an area means adding a scene to the group: no code change.
```gdscript
# level1.gd - Level 1. Connects its checkpoints to the round logic.
# WHAT:     starts the round, counts checkpoints reached, decides win/lose.
# TALKS TO: every node in group "checkpoints" (listens to reached), State, Events.
# SIBLINGS: sections/section1/section1.gd ... each defines `signal reached`.
extends Node3D

@export var needed := 5
var done := 0

func _ready() -> void:
	for cp in get_tree().get_nodes_in_group("checkpoints"):
		cp.reached.connect(_on_reached)

func _on_reached() -> void:
	done += 1
	State.score = done
	if done >= needed:
		Events.round_ended.emit(true)
```
```gdscript
# section1.gd - Section 1: moving platforms and a checkpoint.
# WHAT:     the objects inside Section 1 and how they react to the player.
# TALKS TO: level1.gd (through the reached signal).
# SIBLINGS: section2.gd has the same platform logic. Keep in sync by hand.
extends Node3D

signal reached
@export var platform_speed := 2.0

func _ready() -> void:
	add_to_group("checkpoints")
```

## 4. Layout per game type
`scripts/scaffold.py --type <type>` generates these. All include `_project/`, `shared/`, `ui/`, `audio/`, `tools/`, `addons/`, `tests/`.
| Type | Content folders |
|---|---|
| party-coop | `levels/level1/`, `characters/players/`, `characters/enemies/`, `objects/` (+ `network/`, `ui/room/` if online) |
| platformer | `levels/world1/level1/`, `characters/player/`, `characters/enemies/`, `objects/pickups/`, `objects/hazards/` |
| shooter | `levels/arena1/`, `characters/player/`, `characters/enemies/`, `weapons/`, `objects/` |
| racing | `tracks/track1/`, `vehicles/`, `objects/` |
| puzzle | `puzzles/` (data per level), `board/` (pure rules), `objects/` |
| strategy | `maps/map1/`, `units/`, `buildings/`, `data/` |
| survival | `world/`, `characters/player/`, `characters/enemies/`, `items/`, `crafting/`, `data/`, `saves/` |
| narrative | `story/` (data), `scenes/`, `characters/npcs/` |
| arcade | `levels/level1/`, `characters/player/`, `characters/enemies/`, `objects/` |
Growth: a new level is a new folder beside the first, self-contained. A prop used by two or more levels moves to `objects/<prop>/`; a prop used by one stays in that level's folder. A folder named `shared/` or `common/` is allowed when it holds things that are truly used everywhere and the `ARCHITECTURE.md` line says what; it is not a dumping ground.

## 5. How do I add a new...
Every repeatable content type gets a recipe in `ARCHITECTURE.md`. Example recipe:
```
Add a new hazard section:
1. Copy levels/level1/sections/section1/ to section4/ and rename the files.
2. Open section4.tscn, change the models, keep the root script.
3. Put section4.tscn in level1.tscn. It joins group "checkpoints" by itself.
4. Add its models to the lineup scene and check they fit ART_DIRECTION.md.
5. Add new assets to CREDITS.md. Run the gates for a new unit (quality-gates.md section 4).
```

## 6. Seams: what belongs where
| Seam | Holds | Never holds |
|---|---|---|
| `Net` | host/join/leave, player list, kick, room codes, the door | gameplay rules |
| `State` | phase, round number, score | logic that changes the phase (the level script does that) |
| `Events` | signals only | variables, functions |
Keep autoloads few and justified. An extra seam (a rules store, an audio event table, a settings store) is fine when it is truly global; each gets a row in `DECISIONS.md` saying why. `check_project.py` warns above 3 and fails above 8.
Big seams are split by responsibility into `<name>.gd` + `<name>_impl.gd` parts, not into a new global.

## 7. Tools folders
`tools/` holds code that is not the game: `tools/qa/` (gate runner, detectors, preview and tour scripts, balance and perf drivers), `tools/audio/` (processing scripts), `tools/blender/` (model generators and verifiers), `tools/textures/` (pattern generators). Rules:
- Never an autoload, never referenced by game scripts.
- Excluded from the export preset (`tools/*`, `_incoming/*`).
- Documented with one line in `ARCHITECTURE.md` and a short README per folder.
- Deterministic where they produce assets (same input, same bytes).

## 8. The "where do I find X" table is tested
`ARCHITECTURE.md` carries a table of "I want to change... / open ...". Add a GUT test (or a lint step) that checks every path in the table exists and every top-level folder is named in the file. `check_project.py` already warns about undocumented folders; the table test catches rot in the rows.

## 9. Anti-patterns (reject on sight)
- A `utils.gd` or `helpers.gd` that grows forever: put the code in the category script that uses it.
- Base classes for objects that only share a few lines: duplicate the lines and add a sibling comment.
- Scripts that reach across the tree with long paths or `get_parent().get_parent()`.
- Magic numbers inside functions: lift them to exported variables or a data table.
- A folder named `misc` or `stuff`.
- Folders organised by file type at the top (`scripts/`, `models/`, `scenes/`): that is what this layout avoids.
- Gameplay numbers or file paths scattered over many scripts when a table or event list exists for them.
