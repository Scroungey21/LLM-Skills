#!/usr/bin/env python3
"""Create a Roblox (Rojo) project skeleton that follows the mass-game-builder standard, adapted to Roblox.

usage: scaffold_roblox.py --name "Haunted Mall" --type party-coop --path ./haunted-mall

types: party-coop platformer shooter racing puzzle strategy survival narrative arcade
Creates: default.project.json (Rojo), src/{server,client,shared,gui}, the Luau seams (Net, Events, State, Config),
two boot scripts, and the _project docs. Needs Rojo + Roblox Studio to run it (see references/roblox.md).
"""
import argparse, json, pathlib, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "templates"
RBX = ROOT / "roblox"

TYPES = {
    "party-coop": ["Levels", "Characters", "Objects"],
    "platformer": ["Levels", "Characters", "Pickups", "Hazards"],
    "shooter":    ["Arenas", "Characters", "Weapons", "Objects"],
    "racing":     ["Tracks", "Vehicles", "Objects"],
    "puzzle":     ["Puzzles", "Board", "Objects"],
    "strategy":   ["Maps", "Units", "Buildings", "Data"],
    "survival":   ["World", "Characters", "Items", "Crafting", "Data"],
    "narrative":  ["Story", "Scenes", "Characters"],
    "arcade":     ["Levels", "Characters", "Objects"],
}


def fill(text, ctx):
    for k, v in ctx.items():
        text = text.replace("{{%s}}" % k, v)
    return text


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--name", required=True)
    ap.add_argument("--type", required=True, choices=sorted(TYPES))
    ap.add_argument("--path", required=True)
    a = ap.parse_args()

    out = pathlib.Path(a.path)
    if out.exists() and any(out.iterdir()):
        sys.exit(f"refusing to overwrite non-empty folder: {out}")
    ctx = {"NAME": a.name, "TYPE": a.type, "ENGINE": "Roblox (Luau, Rojo)"}

    # folders (categories live together: one folder per category, scripts + data inside)
    for d in ["_project/evidence", "src/server", "src/client", "src/shared", "src/gui"]:
        (out / d).mkdir(parents=True, exist_ok=True)
    for c in TYPES[a.type]:
        (out / "src" / "server" / c).mkdir(parents=True, exist_ok=True)
        (out / "src" / "server" / c / ".gitkeep").write_text("")

    # Luau seams and boot scripts
    for f in ["Net", "Events", "State", "Config"]:
        shutil.copy(RBX / f"{f}.luau", out / "src" / "shared" / f"{f}.luau")
    shutil.copy(RBX / "Main.server.luau", out / "src" / "server" / "Main.server.luau")
    shutil.copy(RBX / "Main.client.luau", out / "src" / "client" / "Main.client.luau")
    (out / "src" / "gui" / ".gitkeep").write_text("")
    shutil.copy(RBX / "stylua.toml", out / "stylua.toml")
    shutil.copy(RBX / "gitignore.txt", out / ".gitignore")

    # Rojo project file
    project = {
        "name": a.name,
        "tree": {
            "$className": "DataModel",
            "ReplicatedStorage": {"$className": "ReplicatedStorage", "Shared": {"$path": "src/shared"}},
            "ServerScriptService": {"$className": "ServerScriptService", "Server": {"$path": "src/server"}},
            "StarterPlayer": {
                "$className": "StarterPlayer",
                "StarterPlayerScripts": {"$className": "StarterPlayerScripts", "Client": {"$path": "src/client"}},
            },
            "StarterGui": {"$className": "StarterGui", "$path": "src/gui"},
        },
    }
    (out / "default.project.json").write_text(json.dumps(project, indent=2) + "\n")

    # design docs (engine-neutral templates, shared with the Godot scaffold)
    for f in ["GAME_VISION.md", "STYLE_BIBLE.md", "DECISIONS.md", "CREDITS.md", "TOOLCHAIN.md"]:
        src = ROOT / f
        if src.exists():
            (out / "_project" / f).write_text(fill(src.read_text(), ctx))

    arch = f"""# Architecture - {a.name}
Engine: Roblox (Luau), synced with Rojo. Keep this file matching the real tree.

| Folder | In Studio | What lives here |
|---|---|---|
| `src/shared` | ReplicatedStorage.Shared | The seams: `Net` (all remotes), `Events` (same-side bus), `State`, `Config` (tunables). |
| `src/server` | ServerScriptService.Server | `Main.server.luau` (the only boot Script) + one folder per category ({', '.join(TYPES[a.type])}). Server is authoritative. |
| `src/client` | StarterPlayerScripts.Client | `Main.client.luau` (the only client boot script) + controllers (input, camera, effects). |
| `src/gui` | StarterGui | Authored UI shells (real, named Instances); behaviour in small client modules. |
| `_project` | not synced | Vision, style bible, decisions, credits, toolchain, evidence screenshots. |

Rules: three seams only (Net, Events, State); one compact module per category; header comment (WHAT / TALKS TO / SIBLINGS) on every file; tunables in `Config` or Attributes.

## Where do I find X
(fill in as the game grows)

## How do I add a new ...
(fill in as the game grows)
"""
    (out / "ARCHITECTURE.md").write_text(arch)
    (out / "README.md").write_text(
        f"# {a.name}\n\nRoblox game ({a.type}). Run: `rojo serve`, open Studio, connect the Rojo plugin, press Play.\n"
        "Start with `_project/GAME_VISION.md`.\n")
    print(f"created Roblox project at {out}\nnext: rojo build -o game.rbxl, or rojo serve + Studio plugin; then run the R-G1 boot gate.")


if __name__ == "__main__":
    main()
