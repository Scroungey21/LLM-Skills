#!/usr/bin/env python3
"""Self-test for the two game skills (game-builder and mass-game-builder).

Checks, in order:
  1. every shared file is byte-identical in both skills (same rule as sync_shared.py --check)
  2. size caps: SKILL.md under 500 lines, every reference file at most 200 lines
  3. the CORE block (between <!-- BEGIN CORE --> and <!-- END CORE -->) is identical in both SKILL.md files
  4. every skill path named in a Markdown file (references/..., scripts/..., assets/...) exists
  5. a bias lint: no default look, mood, theme or budget baked into the skill, and no project-specific
     terms or secrets outside a short block that starts with "Example ("
Findings inside mass-game-builder-only files are printed as NOTE and do not fail the run, unless --strict.

usage: test_shared.py [--root DIR] [--strict]        (standard library only; run with python -I)
"""
import argparse, hashlib, pathlib, re, sys

GB, MGB = "game-builder", "mass-game-builder"
MGB_ONLY = {"SKILL.md", "references/optional-modules.md", "references/tool-addendum.md",
            "assets/templates/KEEP_CHANGE.md", "assets/templates/REFERENCE_NOTES.md",
            "assets/templates/VISION_SPEC_TEMPLATE.md"}
TEXT = {".md", ".py", ".gd", ".ps1", ".sh", ".txt", ".gdshader", ".cfg"}
SKIP_FILES = {"test_shared.py"}          # holds the word lists below
EXAMPLES_DIR = "assets/examples/"        # opt-in material is exempt from the bias lint
MAX_REF, MAX_SKILL, MAX_EXAMPLE_LINES = 200, 500, 4

# term -> files that may use it (relative paths); None = nobody outside Example blocks
BIAS = {
    r"low[- ]?poly": (), r"\btoon\b": (), r"friendslop": (), r"jsfxr": ("scripts/check_project.py",), r"\bgoofy\b": (), r"\bchunky\b": (),
    r"palette-only": (), r"fall guys": (), r"among us": (), r"goat simulator": (), r"\$0": (),
    r"play with friends": (),
    r"(?<!third-)(?<!third )\bparty\b": ("references/genres.md", "references/architecture.md", "scripts/scaffold.py"),
}
PROJECT = {
    r"\bmalls?\b": (), r"calori": (), r"\bfridges?\b": (), r"\bescalators?\b": (), r"brakep[i]e|brake[y]-?kun": (),
    r"mall ?storm[e]rs": (), r"sunbeacon": (), r"haunted": (),
    r"\beos\b": ("references/engines.md", "references/tools-unreal.md", "references/tools-general.md"),
}
SECRETS = [r"[\w.+-]+@[\w-]+\.[a-z]{2,}", r"client[_ ]?secret\s*[:=]\s*\S{6,}", r"password\s*=\s*[\"']\w+",
           r"api[_-]?key\s*=\s*[\"']\w{8,}"]
PATH_RE = re.compile(r"(?<![\w/.-])((?:references|scripts)/[\w./-]+\.\w+|assets/(?:templates|agents|examples)/[\w./-]+\.\w+)")


def read(p):
    return p.read_text(encoding="utf-8", errors="replace")


def files(base):
    return {p.relative_to(base).as_posix(): p for p in sorted(base.rglob("*"))
            if p.is_file() and "__pycache__" not in p.parts and p.suffix != ".pyc"}


def example_lines(text):
    """Return (set of 1-based line numbers inside Example blocks, list of (start, length))."""
    lines, inside, blocks, i, n = text.splitlines(), set(), [], 0, 0
    while i < len(lines):
        s = lines[i].strip().lstrip("*>-| ").strip()
        if s.startswith("Example ("):
            j = i
            while j < len(lines) and lines[j].strip():
                inside.add(j + 1)
                j += 1
            blocks.append((i + 1, j - i))
            i = j
        i += 1
        n += 1
    return inside, blocks


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", default=None)
    ap.add_argument("--strict", action="store_true")
    a = ap.parse_args()
    root = pathlib.Path(a.root) if a.root else pathlib.Path(__file__).resolve().parent.parent.parent
    gb_dir, mgb_dir = root / GB, root / MGB
    problems, notes = [], []
    gb, mgb = files(gb_dir), files(mgb_dir)

    # 1. shared files identical
    for rel, p in gb.items():
        if rel == "SKILL.md":
            continue
        q = mgb.get(rel)
        if q is None:
            problems.append(f"shared file missing in {MGB}: {rel}")
        elif hashlib.sha256(p.read_bytes()).digest() != hashlib.sha256(q.read_bytes()).digest():
            problems.append(f"shared file differs: {rel}")
    for rel in mgb:
        if rel not in gb and rel not in MGB_ONLY:
            problems.append(f"stray file in {MGB}: {rel}")

    # 2. size caps
    for name, files_ in ((GB, gb), (MGB, mgb)):
        n = len(read(files_["SKILL.md"]).splitlines())
        if n >= MAX_SKILL:
            problems.append(f"{name}/SKILL.md has {n} lines (cap {MAX_SKILL})")
        for rel, p in files_.items():
            if rel.startswith("references/") and rel.endswith(".md") and rel not in MGB_ONLY:
                n = len(read(p).splitlines())
                if n > MAX_REF:
                    problems.append(f"{name}/{rel} has {n} lines (cap {MAX_REF})")

    # 3. CORE block identical
    core = {}
    for name, files_ in ((GB, gb), (MGB, mgb)):
        m = re.search(r"<!-- BEGIN CORE -->(.*?)<!-- END CORE -->", read(files_["SKILL.md"]), re.S)
        core[name] = m.group(1).strip() if m else None
    if core[GB] is None:
        problems.append("game-builder/SKILL.md has no CORE block")
    elif core[MGB] is None:
        notes.append("PENDING: mass-game-builder/SKILL.md has no CORE block yet (writer 2 pastes game-builder's)")
    elif core[GB] != core[MGB]:
        problems.append("CORE block differs between the two SKILL.md files")

    # 4. named paths exist
    for name, files_ in ((GB, gb), (MGB, mgb)):
        for rel, p in files_.items():
            if p.suffix != ".md":
                continue
            for m in PATH_RE.finditer(read(p)):
                tgt = m.group(1)
                if "<" in tgt or "*" in tgt or "{" in tgt:
                    continue
                if tgt not in files_:
                    msg = f"{name}/{rel} names a missing path: {tgt}"
                    (notes if name == MGB and rel in MGB_ONLY and not a.strict else problems).append(msg)

    # 5. bias lint (+ example block length)
    for name, files_ in ((GB, gb), (MGB, mgb)):
        for rel, p in files_.items():
            if p.suffix not in TEXT or p.name in SKIP_FILES or rel.startswith(EXAMPLES_DIR):
                continue
            text = read(p)
            inside, blocks = example_lines(text)
            for start, length in blocks:
                if length > MAX_EXAMPLE_LINES:
                    problems.append(f"{name}/{rel}:{start}: Example block is {length} lines (cap {MAX_EXAMPLE_LINES})")
            sink = notes if name == MGB and rel in MGB_ONLY and not a.strict else problems
            for no, line in enumerate(text.splitlines(), 1):
                if no in inside:
                    continue
                for pat, allowed in list(BIAS.items()) + list(PROJECT.items()):
                    if rel in allowed:
                        continue
                    if re.search(pat, line, re.I):
                        sink.append(f"{name}/{rel}:{no}: banned term /{pat}/ outside an Example block: {line.strip()[:70]}")
                for pat in SECRETS:
                    if re.search(pat, line, re.I):
                        sink.append(f"{name}/{rel}:{no}: looks like a secret or email (value not shown)")

    for n_ in notes:
        print("NOTE:", n_)
    for pr in problems:
        print("PROBLEM:", pr)
    print(f"TEST_SHARED shared={sum(1 for r in gb if r != 'SKILL.md')} problems={len(problems)} notes={len(notes)}")
    sys.exit(1 if problems else 0)


main()
