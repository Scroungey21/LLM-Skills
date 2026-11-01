#!/usr/bin/env python3
"""Scan Minecraft logs for content-integrity and stability problems (quality bar rows Q1 and Q2).

usage: check_logs.py latest.log [debug.log crash-report.txt ...] [--namespace mypack] [--allow allow.txt]
                     [--max-warn-repeat 20] [--show 15]

Reads one or more log files from a client or dedicated-server run of the exported pack and reports:
  ERRORS    : crash reports, 'Exception', '[ERROR]' / '/ERROR]' lines, failed mod loads, parse errors, mixin failures
  CONTENT   : missing textures / models / sounds / language keys, unknown recipes, loot tables, tags, advancements,
              data pack load failures
  NOISE     : the same WARN line repeating more than --max-warn-repeat times (log spam hurts servers)
--namespace restricts the ERROR count to lines mentioning your pack's namespace (others are still listed as 'other').
--allow is a text file of substrings (one per line, '#' comments) for known, accepted lines; each entry should have a
reason in DECISIONS.md. Exit code 0 = no errors and no content problems, 1 = problems found, 2 = unreadable input.
Static text scan only: it proves nothing about gameplay, and an empty result only means the log was clean.
"""
import argparse, collections, re, sys

ERROR_PATTERNS = [r"/ERROR\]", r"\[ERROR\]", r"\bException\b", r"\bat net\.minecraft\.", r"Crash report", r"---- Minecraft Crash Report",
                  r"Failed to load mod", r"Mixin apply failed", r"InvalidInjectionException", r"Could not execute entrypoint",
                  r"Missing or unsupported mandatory dependencies", r"Incompatible mod set", r"Failed to start the minecraft server"]
CONTENT_PATTERNS = [r"Unable to load model", r"Missing model", r"Unable to find texture", r"Missing texture", r"Unable to load .*texture",
                    r"Missing sound", r"Unable to load sound", r"Unknown (recipe|loot table|loot_table|tag|advancement|function|registry)",
                    r"Couldn't (parse|load) (data file|recipe|loot|advancement|tag)", r"Failed to (parse|load) (recipe|loot|advancement|tag|function|structure)",
                    r"Parsing error loading", r"Missing translation", r"missing translation key", r"Couldn't load .*pack",
                    r"Invalid pack", r"Pack format .* (not supported|incompatible)", r"Unknown block", r"Unknown item"]
WARN = re.compile(r"[/\[]WARN\]|/WARN\]")
ERR_RE = [re.compile(p, re.I) for p in ERROR_PATTERNS]
CON_RE = [re.compile(p, re.I) for p in CONTENT_PATTERNS]
TS = re.compile(r"^\[\d\d:\d\d:\d\d\]\s*")


def norm(line):
    return re.sub(r"\d+", "#", TS.sub("", line.strip()))[:200]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("logs", nargs="+")
    ap.add_argument("--namespace")
    ap.add_argument("--allow")
    ap.add_argument("--max-warn-repeat", type=int, default=20)
    ap.add_argument("--show", type=int, default=15)
    a = ap.parse_args()

    allow = []
    if a.allow:
        try:
            allow = [l.strip() for l in open(a.allow, encoding="utf-8") if l.strip() and not l.startswith("#")]
        except OSError as e:
            print(f"ERROR cannot read allow file: {e}")
            return 2

    errors, content, other, warns = [], [], [], collections.Counter()
    for path in a.logs:
        try:
            lines = open(path, encoding="utf-8", errors="replace").read().splitlines()
        except OSError as e:
            print(f"ERROR cannot read {path}: {e}")
            return 2
        for i, line in enumerate(lines, 1):
            if allow and any(s in line for s in allow):
                continue
            if any(r.search(line) for r in CON_RE):
                content.append((path, i, line.strip()))
            elif any(r.search(line) for r in ERR_RE):
                (errors if (not a.namespace or a.namespace in line) else other).append((path, i, line.strip()))
            elif WARN.search(line):
                warns[norm(line)] += 1

    spam = [(n, c) for n, c in warns.most_common() if c > a.max_warn_repeat]

    def show(title, rows):
        print(f"{title}: {len(rows)}")
        for p, i, l in rows[:a.show]:
            print(f"   {p}:{i}: {l[:170]}")
        if len(rows) > a.show:
            print(f"   ... {len(rows) - a.show} more")

    show("ERRORS (own namespace or no namespace filter)" if a.namespace else "ERRORS", errors)
    if a.namespace:
        show("ERRORS (other, not counted as failures; still read them)", other)
    show("CONTENT problems (missing/unknown assets and data)", content)
    print(f"NOISE (WARN lines repeating > {a.max_warn_repeat} times): {len(spam)}")
    for n, c in spam[:a.show]:
        print(f"   x{c}: {n[:160]}")
    bad = len(errors) + len(content)
    print(f"RESULT: {'CLEAN' if not bad else 'PROBLEMS FOUND'} ({len(errors)} errors, {len(content)} content, {len(spam)} noisy warnings)")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
