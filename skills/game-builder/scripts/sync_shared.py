#!/usr/bin/env python3
"""Keep the two game skills' shared files byte-identical.

The source of truth is game-builder. Everything in it except SKILL.md is "shared" and is copied
into mass-game-builder at the same relative path. mass-game-builder keeps a few files of its own.

usage:  sync_shared.py [--check] [--prune] [--root DIR]
        (default)  copy shared files from game-builder into mass-game-builder
        --check    copy nothing; exit 1 if any shared file differs or is missing
        --prune    also delete files in mass-game-builder that exist in neither list
        --root     folder that holds both skill folders (default: the parent of this skill)
Standard library only.
"""
import argparse, hashlib, pathlib, shutil, sys

GB, MGB = "game-builder", "mass-game-builder"
# Files only mass-game-builder has (relative to the skill folder). SKILL.md differs in both skills.
MGB_ONLY = {
    "SKILL.md",
    "references/optional-modules.md",
    "references/tool-addendum.md",
    "assets/templates/KEEP_CHANGE.md",
    "assets/templates/REFERENCE_NOTES.md",
    "assets/templates/VISION_SPEC_TEMPLATE.md",
}
SKIP_NAMES = {"__pycache__", ".DS_Store", "Thumbs.db"}


def listing(base):
    out = {}
    for p in sorted(base.rglob("*")):
        if p.is_file() and not (set(p.relative_to(base).parts) & SKIP_NAMES) and p.suffix != ".pyc":
            out[p.relative_to(base).as_posix()] = p
    return out


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def shared_files(gb_dir):
    return {rel: p for rel, p in listing(gb_dir).items() if rel != "SKILL.md"}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--prune", action="store_true")
    ap.add_argument("--root", default=None)
    a = ap.parse_args()
    root = pathlib.Path(a.root) if a.root else pathlib.Path(__file__).resolve().parent.parent.parent
    gb_dir, mgb_dir = root / GB, root / MGB
    for d in (gb_dir, mgb_dir):
        if not d.is_dir():
            sys.exit(f"missing skill folder: {d}")
    shared = shared_files(gb_dir)
    mine = listing(mgb_dir)
    problems, copied = [], 0
    for rel, src in shared.items():
        dst = mgb_dir / rel
        if rel in MGB_ONLY:
            problems.append(f"{rel}: listed as mass-game-builder-only but exists in game-builder")
            continue
        if not dst.exists() or sha(dst) != sha(src):
            if a.check:
                problems.append(f"{rel}: {'missing in' if not dst.exists() else 'differs in'} {MGB}")
            else:
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(src, dst)
                copied += 1
    for rel, p in mine.items():
        if rel not in shared and rel not in MGB_ONLY:
            if a.prune and not a.check:
                p.unlink()
                print(f"pruned {rel}")
            else:
                problems.append(f"{rel}: in {MGB} but not shared and not on the mass-game-builder-only list (use --prune)")
    for rel in sorted(MGB_ONLY):
        if not (mgb_dir / rel).exists():
            problems.append(f"{rel}: mass-game-builder-only file is missing")
    for pr in problems:
        print("PROBLEM:", pr)
    print(f"SYNC {'CHECK' if a.check else 'DONE'}: {len(shared)} shared files, {copied} copied, {len(problems)} problems")
    sys.exit(1 if problems else 0)


main()
