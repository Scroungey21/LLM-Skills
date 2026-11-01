#!/usr/bin/env python3
"""Data-level art and loot guard for Minecraft structure files (.nbt exported by a structure block / Litematica / WorldEdit).

usage: check_structures.py --root datapack/data/<ns>/structure --vocab _project/block_vocab.json
                           [--max-footprint 16] [--data-version 3955]

Layout convention (so the district can be read from the path):  <root>/<district>/<typology>/<name>.nbt
Errors (exit 1):
  - a block that is not in the allowed vocabulary (global + the district's list; fnmatch wildcards allowed)
  - an item entity or experience orb baked into the structure (loose items are forbidden)
  - a container with hard-coded items instead of a loot table
  - a DataVersion that differs from --data-version, when given
Warnings: mobs/armor stands/item frames baked in, footprint larger than --max-footprint (unless the file name starts
with "multi_"), several different DataVersions in one folder, a district with no vocabulary entry.
Needs nbtlib (pip install nbtlib). Reads gzip NBT.

block_vocab.json:  {"global": ["minecraft:air", "minecraft:jigsaw", ...], "districts": {"zone_a": ["minecraft:*_terracotta", ...]}}
"""
import argparse, fnmatch, json, pathlib, sys

try:
    import nbtlib
except ImportError:
    sys.exit("nbtlib is required: pip install nbtlib")

LOOSE = {"minecraft:item", "minecraft:experience_orb"}
HELD = {"minecraft:item_frame", "minecraft:glow_item_frame", "minecraft:armor_stand", "minecraft:item_display"}
ALWAYS_OK = {"minecraft:air", "minecraft:cave_air", "minecraft:void_air", "minecraft:structure_void",
             "minecraft:structure_block", "minecraft:jigsaw"}


def allowed(name, patterns):
    return name in ALWAYS_OK or any(fnmatch.fnmatchcase(name, p) for p in patterns)


def palettes(root):
    if "palettes" in root:
        return [e for pal in root["palettes"] for e in pal]
    return list(root.get("palette", []))


def check(path, district, vocab, args, versions):
    errs, warns = [], []
    nbt = nbtlib.load(path)
    root = nbt.get("") if "" in nbt else nbt
    if "DataVersion" in root:
        versions.add(int(root["DataVersion"]))
        if args.data_version and int(root["DataVersion"]) != args.data_version:
            errs.append(f"DataVersion {int(root['DataVersion'])} != pinned {args.data_version}")
    size = [int(v) for v in root.get("size", [0, 0, 0])]
    if not path.name.startswith("multi_") and (size[0] > args.max_footprint or size[2] > args.max_footprint):
        warns.append(f"footprint {size[0]}x{size[2]} exceeds {args.max_footprint} (name it multi_* if intended)")
    patterns = vocab.get("global", []) + vocab.get("districts", {}).get(district, [])
    if district not in vocab.get("districts", {}):
        warns.append(f"no vocabulary for district '{district}' (only global blocks allowed)")
    bad = sorted({str(e["Name"]) for e in palettes(root) if not allowed(str(e["Name"]), patterns)})
    if bad:
        errs.append("blocks outside the vocabulary: " + ", ".join(bad))
    for ent in root.get("entities", []):
        eid = str(ent.get("nbt", {}).get("id", ""))
        if eid in LOOSE:
            errs.append(f"loose item entity baked into the structure ({eid})")
        elif eid in HELD:
            warns.append(f"{eid} baked in (check it holds no loot item)")
        elif eid:
            warns.append(f"mob entity {eid} baked in (use spawners or the mob table instead)")
    hard = 0
    for blk in root.get("blocks", []):
        data = blk.get("nbt")
        if data is not None and "Items" in data and len(data["Items"]) > 0 and "LootTable" not in data:
            hard += 1
    if hard:
        errs.append(f"{hard} container(s) with hard-coded items; use a LootTable (and optionally LootTableSeed)")
    return errs, warns


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", required=True)
    ap.add_argument("--vocab", required=True)
    ap.add_argument("--max-footprint", type=int, default=16)
    ap.add_argument("--data-version", type=int)
    a = ap.parse_args()
    root = pathlib.Path(a.root)
    vocab = json.loads(pathlib.Path(a.vocab).read_text())
    files = sorted(root.rglob("*.nbt"))
    if not files:
        print(f"nothing to check: no .nbt files under {root} (0 structures checked)")
        sys.exit(0)
    n_err = n_warn = 0
    versions = set()
    for f in files:
        rel = f.relative_to(root)
        district = rel.parts[0] if len(rel.parts) > 1 else ""
        try:
            errs, warns = check(f, district, vocab, a, versions)
        except Exception as e:  # unreadable file is an error, not a crash
            errs, warns = [f"cannot read NBT: {e}"], []
        for w in warns:
            print(f"WARN  {rel}: {w}")
        for e in errs:
            print(f"ERROR {rel}: {e}")
        n_err += len(errs)
        n_warn += len(warns)
    if len(versions) > 1:
        print(f"WARN  mixed DataVersions in {root}: {sorted(versions)} (re-save old files on the pinned version)")
        n_warn += 1
    print(f"{len(files)} structures checked, {n_err} errors, {n_warn} warnings")
    sys.exit(1 if n_err else 0)


if __name__ == "__main__":
    main()
