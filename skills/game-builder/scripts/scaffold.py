#!/usr/bin/env python3
"""Create a project skeleton that follows the game-builder standard.

usage: scaffold.py --name "Star Courier" --type platformer --net online --path ./star-courier
                   [--engine godot|unity|unreal] [--engine-version 4.7] [--no-agents]

types:  party-coop platformer shooter racing puzzle strategy survival narrative arcade   (party-coop = multiplayer party/co-op)
net:    none (single player) | local (same screen) | lan | online
engine: godot (default): creates a full booting project.
        unity / unreal: run INSIDE an existing project (create it first in Unity Hub / the Unreal launcher);
        adds _project docs, category folders, agents. No engine code stubs are generated for them.
It does NOT choose a look: _project/ART_DIRECTION.md is a blank template for the user's answers.
Godot projects also get tools/qa/ (gate.ps1, net_test.ps1, check_project.py) so the project runs its own gates.
"""
import argparse, pathlib, re, shutil, sys

SKILL = pathlib.Path(__file__).resolve().parent.parent
HERE = SKILL / "assets" / "templates"
AGENTS = SKILL / "assets" / "agents"
SCRIPTS = SKILL / "scripts"

DESC = {
    "_project": "Design docs: vision, art direction, decisions, credits, toolchain, handoff, release checklist, sound events, evidence images.",
    "shared": "The shared seams (state, events) and anything truly used everywhere.",
    "audio/music": "Music tracks (one file per slot, see _project/SOUND_EVENTS.md).", "audio/sfx": "Recorded sound effects, grouped by family.",
    "tools/qa": "QA tools: gate runner, detectors, preview and tour scripts, balance and perf drivers. Excluded from export.",
    "tools/audio": "Audio processing scripts (sources in, game files out; deterministic). Excluded from export.",
    "tools/blender": "Model generator and verifier scripts (run headless). Excluded from export.",
    "ui/main_menu": "Title screen.", "ui/hud": "In-game overlay (score, timer, prompts).",
    "ui/game_over": "Defeat screen.", "ui/victory": "Win screen.", "ui/settings": "Volume, controls, graphics presets.",
    "ui/credits": "Credits screen, generated from CREDITS.md.",
    "ui/room": "Lobby: player list, room code, Start button.",
    "network": "All multiplayer code (host, join, the door, room codes, kick).",
    "addons": "Pinned third-party code (e.g. GUT). Never edit by hand.",
    "tests": "Automated tests and the multiplayer smoke test.",
    "levels/level1": "The first level: scene, script, and the objects that live only here.",
    "levels/world1/level1": "First level of world 1.", "levels/arena1": "The first arena.",
    "tracks/track1": "First race track: scene, script, checkpoints.",
    "maps/map1": "First map: terrain, spawn points, resources.",
    "characters/players": "Player scene, script and models.", "characters/player": "Player scene, script and models.",
    "characters/enemies": "Enemy scenes, scripts and models.", "characters/npcs": "Non-player characters.",
    "objects": "Props shared by several levels (each: scene + script + models).",
    "objects/pickups": "Collectibles.", "objects/hazards": "Things that hurt.",
    "weapons": "Weapons and projectiles.", "vehicles": "Vehicles and the vehicles script.",
    "units": "Unit types (data + scene).", "buildings": "Building types (data + scene).",
    "puzzles": "One data file per puzzle/level; rules live in board/.", "board": "Pure puzzle rules, no visuals.",
    "items": "Item definitions.", "crafting": "Recipes.", "world": "World generation and chunks.",
    "data": "Tables of numbers (costs, waves, recipes).",
    "story": "Dialogue and branching script data.", "scenes": "Story scenes (backgrounds + characters).",
    "saves": "Save-file code (not the save data itself).",
}
BASE = ["shared", "audio/music", "audio/sfx", "ui/main_menu", "ui/hud", "ui/game_over", "ui/victory", "ui/settings", "ui/credits",
        "tests", "tools/qa", "tools/audio", "tools/blender"]
TYPES = {
    "party-coop": ["levels/level1", "characters/players", "characters/enemies", "objects"],
    "platformer": ["levels/world1/level1", "characters/player", "characters/enemies", "objects/pickups", "objects/hazards"],
    "shooter":    ["levels/arena1", "characters/player", "characters/enemies", "weapons", "objects"],
    "racing":     ["tracks/track1", "vehicles", "objects"],
    "puzzle":     ["puzzles", "board", "objects"],
    "strategy":   ["maps/map1", "units", "buildings", "data"],
    "survival":   ["world", "characters/player", "characters/enemies", "items", "crafting", "data", "saves"],
    "narrative":  ["story", "scenes", "characters/npcs"],
    "arcade":     ["levels/level1", "characters/player", "characters/enemies", "objects"],
}
DOCS = ["GAME_VISION.md", "ART_DIRECTION.md", "DECISIONS.md", "CREDITS.md", "TOOLCHAIN.md", "HANDOFF.md", "RELEASE_CHECKLIST.md", "SOUND_EVENTS.md"]
ENGINE_NAMES = {"godot": "Godot", "unity": "Unity", "unreal": "Unreal Engine"}
ENGINE_BLOCKS = {
    "godot": ('Engine:        Godot {V} (record the exact version installed; do not upgrade mid-project)\nLanguage:      GDScript\n'
              'Editor MCP:    <<FILL one editor-control server, or none; see references/tools-godot.md>>\n'
              'Tests:         GUT 9.x (addons/gut), headless; gates via tools/qa/gate.ps1 (scripts/gate_boot.sh, net_test.sh are bash variants)'),
    "unity": ('Engine:        Unity {V} LTS (record the exact version installed)\nLanguage:      C#\n'
              'Editor MCP:    <<FILL one server, or none; see references/tools-unity.md>>\n'
              'Networking:    <<FILL NGO | Mirror; free-tier limits of any relay or voice service used>>\n'
              'Tests:         Unity Test Framework (EditMode/PlayMode)'),
    "unreal": ('Engine:        Unreal Engine {V} (record the exact version installed)\nLanguage:      C++ base classes + Blueprint subclasses (confirm with user)\n'
               'Editor MCP:    <<FILL one server, or none; see references/tools-unreal.md>>\n'
               'Networking:    built-in replication, listen server; <<FILL platform service terms if used>>\n'
               'Tests:         Automation / Functional Tests'),
}
README_STUBS = {
    "tools/qa": "# tools/qa\nQA tools for this project. Never autoloaded, excluded from the export preset (tools/*).\nHooks the gate runner looks for: walker.gd, level_check.gd, clip_check.gd, anim_check.gd, sfx_check.gd, balance_report.gd, security_check.gd.\nSee references/quality-gates.md in the game-builder skill.\n",
    "tools/audio": "# tools/audio\nDeterministic audio processing scripts: sources (in the git-ignored _incoming/) in, game files out. Recorded sounds only unless the user asked otherwise.\nSee references/audio.md in the game-builder skill.\n",
    "tools/blender": "# tools/blender\nModel generator and verifier scripts. Run headless: blender --background --factory-startup --python script.py -- <args>.\nSee references/assets.md in the game-builder skill.\n",
}

def pascal(path):
    return "/".join("UI" if seg == "ui" else "".join(w[:1].upper() + w[1:] for w in re.split(r"[_ ]", seg)) for seg in path.split("/"))

def fill(text, ctx):
    for k, v in ctx.items():
        text = text.replace("{{%s}}" % k, v)
    return text

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--name", required=True)
    ap.add_argument("--type", required=True, choices=sorted(TYPES))
    ap.add_argument("--net", default="none", choices=["none", "local", "lan", "online"])
    ap.add_argument("--path", required=True)
    ap.add_argument("--engine", default="godot", choices=sorted(ENGINE_NAMES))
    ap.add_argument("--engine-version", default=None)
    ap.add_argument("--godot", default=None, help=argparse.SUPPRESS)   # old flag, kept for compatibility
    ap.add_argument("--no-agents", action="store_true")
    a = ap.parse_args()

    ev = a.engine_version or a.godot or {"godot": "4.7", "unity": "6.3", "unreal": "5.8"}[a.engine]
    root = pathlib.Path(a.path)
    networked = a.net in ("lan", "online")
    game = re.sub(r"[^A-Za-z0-9]", "", a.name) or "Game"

    if a.engine == "godot":
        if root.exists() and any(root.iterdir()):
            sys.exit(f"refusing to scaffold into non-empty folder: {root}")
    else:
        if not root.exists():
            sys.exit(f"{root} does not exist: create the {a.engine} project first, then scaffold inside it")
        if (root / "_project").exists():
            sys.exit("_project/ already exists here: refusing to overwrite")

    keys = BASE + TYPES[a.type] + (["network", "ui/room"] if networked else [])
    if a.engine == "godot":
        keys += ["addons"]
        pairs = [(k, k) for k in keys]
    elif a.engine == "unity":
        pairs = [(k, "Assets/Game/" + pascal(k)) for k in keys if k not in ("tests", "tools/qa", "tools/audio", "tools/blender")] + [("tests", "Assets/Tests")]
        pairs += [(k, k) for k in ("tools/qa", "tools/audio", "tools/blender")]
    else:
        content = [k for k in keys if k not in ("tests", "network") and not k.startswith("tools/")]
        pairs = [(k, "Content/" + pascal(k)) for k in content]
        pairs += [(k, f"Source/{game}/" + pascal(k)) for k in keys if k in ("network", "shared", "tests")
                  or k.split("/")[0] in ("levels", "characters", "objects", "ui", "vehicles", "weapons", "tracks", "maps", "units", "buildings", "board")]
        pairs += [(k, k) for k in ("tools/qa", "tools/audio", "tools/blender")]
    pairs.append(("_project", "_project"))

    for _, ep in pairs:
        d = root / ep
        d.mkdir(parents=True, exist_ok=True)
        if a.engine != "godot":
            (d / ".gitkeep").touch()
    (root / "_project" / "evidence").mkdir(parents=True, exist_ok=True)
    for k, txt in README_STUBS.items():
        (root / k / "README.md").write_text(txt)

    ctx = {"NAME": a.name, "TYPE": a.type, "NET": a.net, "GODOT": ev, "ENGINE": ENGINE_NAMES[a.engine],
           "ENGINE_NAME": f"{ENGINE_NAMES[a.engine]} {ev}" + (", GDScript" if a.engine == "godot" else ""),
           "ENGINE_BLOCK": ENGINE_BLOCKS[a.engine].replace("{V}", ev)}
    for doc in DOCS:
        (root / "_project" / doc).write_text(fill((HERE / doc).read_text(), ctx))
    if a.engine == "godot" or not (root / ".gitignore").exists():
        shutil.copy(HERE / "gitignore.txt", root / ".gitignore")
    else:   # engine projects bring their own .gitignore: append the safety entries we need
        have = (root / ".gitignore").read_text()
        extra = [l for l in (HERE / "gitignore.txt").read_text().splitlines() if l.strip() and l not in have and not l.startswith(".godot") and not l.startswith(".mono") and not l.endswith(".translation")]
        if extra:
            (root / ".gitignore").write_text(have.rstrip("\n") + "\n" + "\n".join(extra) + "\n")

    if not a.no_agents:
        (root / ".claude" / "agents").mkdir(parents=True, exist_ok=True)
        for f in AGENTS.glob("*.md"):
            shutil.copy(f, root / ".claude" / "agents" / f.name)

    if a.engine == "godot":
        for f in ["events.gd", "state.gd"]:
            shutil.copy(HERE / f, root / "shared" / f)
        for f in ["gate.ps1", "net_test.ps1", "check_project.py"]:
            shutil.copy(SCRIPTS / f, root / "tools" / "qa" / f)
        shutil.copy(HERE / "main_menu.gd", root / "ui/main_menu/main_menu.gd")
        (root / "ui/main_menu/main_menu.tscn").write_text(
            '[gd_scene load_steps=2 format=3]\n\n'
            '[ext_resource type="Script" path="res://ui/main_menu/main_menu.gd" id="1"]\n\n'
            '[node name="MainMenu" type="Control"]\nlayout_mode = 3\nanchors_preset = 15\n'
            'anchor_right = 1.0\nanchor_bottom = 1.0\nscript = ExtResource("1")\n')
        autoloads = ['Events="*res://shared/events.gd"', 'State="*res://shared/state.gd"']
        if networked:
            shutil.copy(HERE / "net_enet.gd", root / "network" / "net.gd")
            shutil.copy(HERE / "net_smoke.gd", root / "tests" / "net_smoke.gd")
            autoloads.append('Net="*res://network/net.gd"')
        (root / "project.godot").write_text(
            "config_version=5\n\n[application]\n\n"
            f'config/name="{a.name}"\nrun/main_scene="res://ui/main_menu/main_menu.tscn"\n'
            f'config/features=PackedStringArray("{ev}")\n\n[autoload]\n\n' + "\n".join(autoloads) + "\n")

    seams = {"godot": ("shared/events.gd (Events)", "shared/state.gd (State)", "network/net.gd (Net)"),
             "unity": ("an Events static class (Events)", "a GameState class (State)", "NetService.cs (Net)"),
             "unreal": ("an Events world subsystem (Events)", "the AGameStateBase subclass (State)", "a Net game-instance subsystem (Net)")}[a.engine]
    lines = [f"# Architecture - {a.name}", "", f"Engine: {ENGINE_NAMES[a.engine]} {ev}. Folder = category. Each folder holds its own scene/prefab, script and models.", "", "## Folders", ""]
    for gk, ep in sorted(pairs, key=lambda x: x[1]):
        if gk in DESC:
            lines.append(f"- `{ep}/` - {DESC[gk]}")
    lines += ["", "## Shared seams (the default abstraction; every extra global needs a DECISIONS.md row)", "", f"- {seams[0]}: signal bus.", f"- {seams[1]}: phase and score."]
    if networked:
        lines.append(f"- {seams[2]}: all multiplayer.")
    lines += ["", "## Where do I find...", "", "| I want to change... | Open |", "|---|---|", "| the title screen | ui/main_menu |",
              "| game phase / score | the State seam |", "| the look of everything | _project/ART_DIRECTION.md |",
              "| how to run the checks | tools/qa/ |"]
    if networked:
        lines.append("| joining / room codes | the Net seam |")
    lines += ["| <<add a row per new script>> | |", "", "## How do I add a new...", "", "<<FILL a 5-line recipe per repeatable content type>>", ""]
    (root / "ARCHITECTURE.md").write_text("\n".join(lines))
    if not (root / "README.md").exists():
        (root / "README.md").write_text(f"# {a.name}\n\n<<FILL one-line pitch>>\n\n## Run\n<<FILL for {ENGINE_NAMES[a.engine]} {ev}>>\n\n## How to play\n<<FILL>>\n\n## Where things are\nSee ARCHITECTURE.md. Design docs are in _project/. Current state: _project/HANDOFF.md.\n")
    print(f"Created {a.type} project '{a.name}' ({a.engine} {ev}, net={a.net}) at {root}")
    if a.engine != "godot":
        print("Note: no engine code stubs were generated; create Events/State/Net per references/engines.md section 4.")
    print("Next: ask the user the art-direction questions and fill _project/GAME_VISION.md and ART_DIRECTION.md, then run the lint:")
    print(f"  python -I {'tools/qa/check_project.py' if a.engine == 'godot' else 'scripts/check_project.py'} <project>")

main()
