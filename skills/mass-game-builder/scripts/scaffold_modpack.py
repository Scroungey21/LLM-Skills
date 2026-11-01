#!/usr/bin/env python3
"""Create a Minecraft modpack project skeleton that follows the mass-game-builder standard (see references/minecraft-modpack.md).

usage: scaffold_modpack.py --name "My Pack" --path ./my-pack [--loader neoforge] [--mc TBD]
                           [--archetype tech,adventure] [--districts zone_a,zone_b]

Creates the repo tree (docs, packwiz pack folder, custom-mod source folder, datapack, resource pack, structure sources,
audio, tests), the _project docs from assets/templates/minecraft/ (including PERF_BUDGET.md and QUALITY_BAR.md), a district card per
--districts entry (optional: only for packs with distinct zones or areas), the archetype(s) recorded in the vision and scorecard, and starter
palette.json / block_vocab.json. It does NOT generate a Gradle project or pack.mcmeta files: both depend on the pinned
Minecraft version, so create them from the official NeoForge Mod Generator / MDK and the pack-format table for that
version (the README written into src/ and datapack/ says how). Run the spikes (SPIKES.md) before pinning versions.
"""
import argparse, pathlib, re, shutil, sys

SKILL = pathlib.Path(__file__).resolve().parent.parent
TPL = SKILL / "assets" / "templates" / "minecraft"

TREE = {
    "_project/evidence": "screenshots, profiler captures, frame captures, test output (the proof that gates passed)",
    "_project/evidence/golden": "approved golden screenshots per district (the look every new asset is judged against)",
    "_project/reference_board": "reference photos for ANALYSIS only (never copied into textures); one subfolder per district",
    "_project/lineup": "lineup world notes, lineup_manifest.json, camera positions for screenshots",
    "_project/cards/districts": "one card per district type",
    "_project/cards/buildings": "one card per building typology",
    "pack": "the packwiz pack players install (pack.toml, index.toml, mods/*.pw.toml, config/, kubejs/ if used)",
    "src": "custom mods, one Gradle project per mod (src/<modid>/); planners are plain Java in a planner/ package",
    "datapack": "our data pack: structures (NBT), loot tables, worldgen JSON, tags, functions",
    "resourcepack": "our resource pack: textures, models, sounds.json, lang, fonts",
    "structures_src": "authoring exports (structure blocks / Litematica) before they are copied into the datapack",
    "audio": "sourced originals with a CREDITS.md row each (existing mods or open libraries only unless the vision says otherwise)",
    "tests": "pure-Java planner tests (JUnit) and scripted scenario notes",
    "server": "dedicated-server config, start script, and the multiplayer test notes",
}
PROJECT_DOCS = [("GAME_VISION_MC.md", "GAME_VISION.md"), ("STYLE_BIBLE_MC.md", "STYLE_BIBLE.md"),
                ("DECISIONS_MC.md", "DECISIONS.md"), ("TOOLCHAIN_MC.md", "TOOLCHAIN.md"),
                ("MODLIST.md", "MODLIST.md"), ("SPIKES.md", "SPIKES.md"), ("PERF_BUDGET.md", "PERF_BUDGET.md"),
                ("CREDITS_MC.md", "CREDITS.md"), ("QUALITY_BAR.md", "QUALITY_BAR.md"), ("palette.json", "palette.json"), ("block_vocab.json", "block_vocab.json")]


def fill(text, ctx):
    for k, v in ctx.items():
        text = text.replace("{{%s}}" % k, v)
    return text


def slug(s):
    return re.sub(r"[^a-z0-9_]+", "_", s.lower()).strip("_") or "pack"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--name", required=True)
    ap.add_argument("--path", required=True)
    ap.add_argument("--loader", default="neoforge", choices=["neoforge", "fabric", "forge", "quilt"])
    ap.add_argument("--mc", default="TBD", help="Minecraft version, or TBD until the version spike decides")
    ap.add_argument("--archetype", default="unspecified", help="comma list: tech, magic, adventure, survival, horror, vanilla-plus, kitchen-sink, server, worldgen, other")
    ap.add_argument("--districts", default="", help="optional zone/area names; creates a card, reference-board folder and structure folder each")
    a = ap.parse_args()

    out = pathlib.Path(a.path)
    if out.exists() and any(out.iterdir()):
        sys.exit(f"refusing to overwrite non-empty folder: {out}")
    ns = slug(a.name)
    ctx = {"NAME": a.name, "SLUG": ns, "LOADER": a.loader, "MC": a.mc, "ARCHETYPE": a.archetype}

    for d in TREE:
        (out / d).mkdir(parents=True, exist_ok=True)
    for d in ("structure", "loot_table", "worldgen", "tags", "function"):
        (out / "datapack" / "data" / ns / d).mkdir(parents=True, exist_ok=True)
        (out / "datapack" / "data" / ns / d / ".gitkeep").write_text("")
    for d in ("textures", "models", "sounds", "lang"):
        (out / "resourcepack" / "assets" / ns / d).mkdir(parents=True, exist_ok=True)
        (out / "resourcepack" / "assets" / ns / d / ".gitkeep").write_text("")
    (out / "tests" / ".gitkeep").write_text("")
    (out / "structures_src" / ".gitkeep").write_text("")
    (out / "audio" / ".gitkeep").write_text("")

    for src, dst in PROJECT_DOCS:
        f = TPL / src
        if f.exists():
            (out / "_project" / dst).write_text(fill(f.read_text(), ctx))
    for d in [x.strip() for x in a.districts.split(",") if x.strip()]:
        card = (TPL / "DISTRICT_CARD.md").read_text()
        (out / "_project" / "cards" / "districts" / f"{slug(d)}.md").write_text(fill(card, {**ctx, "DISTRICT": slug(d)}))
        (out / "_project" / "reference_board" / slug(d)).mkdir(exist_ok=True)
        (out / "datapack" / "data" / ns / "structure" / slug(d)).mkdir(exist_ok=True)
    shutil.copy(TPL / "BUILDING_CARD.md", out / "_project" / "cards" / "buildings" / "_TEMPLATE.md")

    (out / "src" / "README.md").write_text(
        f"# Custom mods\nCreate each mod from the official NeoForge Mod Generator (docs.neoforged.net) at the PINNED Minecraft "
        f"version, one Gradle project per mod under `src/<modid>/`. Do not hand-write build files from memory.\n"
        "Packages per mod: one per category (worldgen, buildings, horde, claims, animals, vehicles, loot...), plus the three seams "
        "`Net`, `Saved`, `Integrations`. Planners live in a `planner/` package that imports NOTHING from net.minecraft / net.neoforged.\n"
        "Every .java file starts with a header comment: WHAT / TALKS TO / SIBLINGS. Run scripts/check_modpack.py before each commit.\n")
    (out / "datapack" / "README.md").write_text(
        "# Data pack\nCreate `pack.mcmeta` with the pack format of the PINNED Minecraft version (see the Minecraft wiki 'Pack format' page); "
        "do not copy one from another version. Since 1.21 the folders are singular: structure/, loot_table/, function/, recipe/, tags/block/.\n"
        "Structures: `data/<ns>/structure/<district>/<typology>/<name>.nbt` (the district is read from the path by check_structures.py).\n")
    (out / "resourcepack" / "README.md").write_text(
        "# Resource pack\nCreate `pack.mcmeta` for the pinned version. One texel density, palette from `_project/palette.json`. "
        "Run check_palette.py on `assets/<ns>/textures` before every merge.\n")
    (out / "pack" / "README.md").write_text(
        "# Player pack (packwiz)\nRun `packwiz init` here AFTER the version spike has pinned Minecraft + loader. Add mods with "
        "`packwiz modrinth add <slug>` or `packwiz curseforge add <slug>`; every added mod gets a row in `_project/MODLIST.md` "
        "(licence + redistribution verdict) the same minute. Export with `packwiz modrinth export` or `packwiz curseforge export`.\n")
    (out / "server" / "README.md").write_text(
        "# Dedicated server\nBuilt from the same pack (packwiz-installer on the server, or an exported server pack). "
        "Record the start command, JVM flags, view/simulation distance and the 2-client test steps here.\n")
    (out / "ARCHITECTURE.md").write_text(fill((TPL / "ARCHITECTURE_MC.md").read_text(), ctx))
    (out / ".gitignore").write_text((TPL / "gitignore.txt").read_text())
    (out / "README.md").write_text(f"# {a.name}\n\nMinecraft modpack ({a.loader}, {a.mc}). Start with `_project/GAME_VISION.md`, "
                                   "then `_project/SPIKES.md` (de-risk before building), then `ARCHITECTURE.md`.\n")
    print(f"created modpack project at {out} (namespace '{ns}')\n"
          "next: fill GAME_VISION.md, run the spikes in SPIKES.md, pin versions in TOOLCHAIN.md, then the style bible and lineup.")


if __name__ == "__main__":
    main()
