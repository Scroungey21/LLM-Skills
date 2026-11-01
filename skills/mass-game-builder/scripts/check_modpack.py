#!/usr/bin/env python3
"""Standard checks for a Minecraft modpack project (see references/minecraft-modpack.md). Exit 1 if any error.

usage: check_modpack.py <project-folder> [--strict] [--worldgen-dirs worldgen,planner,plan,gen] [--planner-dirs planner,plan]

Project docs      errors: missing _project/{GAME_VISION,STYLE_BIBLE,DECISIONS,TOOLCHAIN,MODLIST,SPIKES,CREDITS}.md
                  warns (errors with --strict): leftover <<FILL markers
Java (src/**)     errors: no header (WHAT / TALKS TO / SIBLINGS) in the first 25 lines, file over 300 lines
                  warns:  method longer than ~40 lines (rough), per-tick entity scans in tick handlers
Determinism       errors in worldgen dirs: Math.random, new Random(, ThreadLocalRandom, System.currentTimeMillis/nanoTime
Loose items       errors in worldgen dirs: ItemEntity, spawnAtLocation, popResource (generation never creates items)
Pure planners     errors in planner dirs: any import of net.minecraft.* or net.neoforged.* (planners are plain Java so
                  they are testable without launching the game and cannot depend on load order)
MODLIST.md        errors: a row marked adopted/pinned with an empty or unknown licence or redistribution verdict
Audio ledger      errors: an audio file (ogg/wav/mp3/flac) with no CREDITS.md row, or a row whose licence says
                  NC / AI / synth / unknown / ?
Architecture      warns: a top-level folder not mentioned in ARCHITECTURE.md
"""
import argparse, pathlib, re, sys

DOCS = ["GAME_VISION", "STYLE_BIBLE", "DECISIONS", "TOOLCHAIN", "MODLIST", "SPIKES", "CREDITS"]
AUDIO = {".ogg", ".wav", ".mp3", ".flac"}
BAD_LICENCE = re.compile(r"(\bNC\b|non-?commercial|\bAI\b|generated|synth|unknown|^\?$|<<FILL)", re.I)
SKIP_DIRS = {".git", "build", "run", ".gradle", "node_modules", "__pycache__", "evidence", "reference_board"}


def rows(md):
    """Yield lists of cells for every markdown table data row."""
    for line in md.splitlines():
        s = line.strip()
        if s.startswith("|") and not re.match(r"^\|[\s:|-]+\|?$", s):
            yield [c.strip() for c in s.strip("|").split("|")]


def walk(root, exts):
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() in exts and not (set(p.relative_to(root).parts) & SKIP_DIRS):
            yield p


def in_dirs(rel, names):
    return bool(set(rel.parts[:-1]) & names)


def check_java(root, wg, pl, errors, warns):
    files = list(walk(root / "src", {".java"})) if (root / "src").exists() else []
    for p in files:
        rel = p.relative_to(root)
        text = p.read_text(errors="replace")
        lines = text.splitlines()
        head = "\n".join(lines[:25])
        if not all(k in head for k in ("WHAT", "TALKS TO", "SIBLINGS")):
            errors.append(f"{rel}: header comment needs WHAT / TALKS TO / SIBLINGS in the first lines")
        if len(lines) > 300:
            errors.append(f"{rel}: {len(lines)} lines (cap 300)")
        if in_dirs(rel, wg):
            for pat, why in [(r"Math\.random\s*\(|new\s+Random\s*\(|ThreadLocalRandom",
                              "unseeded randomness in generation code (derive a seeded RandomSource from seed + position)"),
                             (r"System\.(currentTimeMillis|nanoTime)",
                              "wall-clock time in generation code (generation must depend only on seed + position)"),
                             (r"\bItemEntity\b|spawnAtLocation|popResource",
                              "item entity creation in generation code (generation never creates loose items)")]:
                if re.search(pat, text):
                    errors.append(f"{rel}: {why}")
        if in_dirs(rel, pl) and re.search(r"^\s*import\s+(static\s+)?net\.(minecraft|neoforged)\.", text, re.M):
            errors.append(f"{rel}: planner code must be plain Java (no net.minecraft / net.neoforged imports)")
        if "TickEvent" in text and re.search(r"getEntitiesOfClass|getEntities\s*\(|getAllEntities", text):
            warns.append(f"{rel}: entity scan inside a tick handler; prefer events, caches or throttling")
        start = None
        for i, ln in enumerate(lines):
            if start is None and re.match(r"\s{4}(public|private|protected|static)[^;=]*\)\s*(throws [\w, ]+)?\{\s*$", ln):
                start = i
            elif start is not None and re.match(r"\s{4}\}\s*$", ln):
                if i - start > 40:
                    warns.append(f"{rel}:{start + 1}: method is ~{i - start} lines (aim for ~20)")
                start = None
    return len(files)


def check_modlist(path, errors):
    if not path.exists():
        return
    header = None
    for cells in rows(path.read_text()):
        low = [c.lower() for c in cells]
        if header is None:
            if any("licen" in c for c in low) and any("redistribut" in c for c in low):
                header = low
            continue
        if len(cells) != len(header):
            continue
        d = dict(zip(header, cells))
        status = next((v for k, v in d.items() if k.startswith("status")), "").lower()
        if not any(s in status for s in ("adopted", "pinned")):
            continue
        name = next((v for k, v in d.items() if k.startswith("mod")), cells[0])
        for key in ("licen", "redistribut"):
            val = next((v for k, v in d.items() if key in k), "")
            if not val or val in ("?", "unknown") or "<<FILL" in val:
                errors.append(f"MODLIST.md: '{name}' is {status} but its {key}* column is empty or unknown")


def check_audio(root, errors):
    credits = root / "_project" / "CREDITS.md"
    table = [r for r in rows(credits.read_text())] if credits.exists() else []
    files = [p for p in walk(root, AUDIO)]
    for p in files:
        rel = p.relative_to(root).as_posix()
        hit = next((r for r in table if any(rel in c or p.name in c for c in r)), None)
        if hit is None:
            errors.append(f"{rel}: audio file without a CREDITS.md row (source, licence, author)")
        elif sum(1 for c in hit if c) < 4:
            errors.append(f"{rel}: its CREDITS.md row is incomplete")
        elif any(BAD_LICENCE.search(c) for c in hit[1:]):
            errors.append(f"{rel}: CREDITS.md licence/source is not acceptable ({' | '.join(hit)})")
    return len(files)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--strict", action="store_true")
    ap.add_argument("--worldgen-dirs", default="worldgen,planner,plan,gen")
    ap.add_argument("--planner-dirs", default="planner,plan")
    a = ap.parse_args()
    root = pathlib.Path(a.project)
    errors, warns = [], []
    for d in DOCS:
        f = root / "_project" / f"{d}.md"
        if not f.exists():
            errors.append(f"missing _project/{d}.md")
        elif "<<FILL" in f.read_text():
            (errors if a.strict else warns).append(f"_project/{d}.md still has <<FILL>> markers")
    for d in ("PERF_BUDGET", "QUALITY_BAR"):
        f = root / "_project" / f"{d}.md"
        if not f.exists():
            warns.append(f"missing _project/{d}.md (performance and quality standards: references/minecraft-quality-standards.md)")
        elif "<<FILL" in f.read_text():
            (errors if a.strict else warns).append(f"_project/{d}.md still has <<FILL>> markers (no pass line set yet)")
    n_java = check_java(root, set(a.worldgen_dirs.split(",")), set(a.planner_dirs.split(",")), errors, warns)
    check_modlist(root / "_project" / "MODLIST.md", errors)
    n_audio = check_audio(root, errors)
    arch = root / "ARCHITECTURE.md"
    if not arch.exists():
        warns.append("missing ARCHITECTURE.md")
    else:
        text = arch.read_text()
        for d in sorted(p.name for p in root.iterdir() if p.is_dir() and not p.name.startswith(".") and p.name not in SKIP_DIRS):
            if d not in text:
                warns.append(f"ARCHITECTURE.md does not mention folder '{d}/'")
    for w in warns:
        print("WARN ", w)
    for e in errors:
        print("ERROR", e)
    print(f"{n_java} java files, {n_audio} audio files checked, {len(errors)} errors, {len(warns)} warnings")
    print("also run: check_palette.py (textures), check_structures.py (buildings)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
