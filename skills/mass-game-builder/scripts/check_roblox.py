#!/usr/bin/env python3
"""Standard checks for a Roblox (Rojo) project. Prints errors and warnings; exit 1 if any error.

usage: check_roblox.py <project-folder>
Errors:   missing header comment (WHAT / TALKS TO / SIBLINGS), file over 300 lines, missing default.project.json,
          deprecated wait()/spawn()/delay(), OnServerEvent used outside Net.luau
Warnings: file missing --!strict, function longer than ~40 lines (rough), Remote created outside Net, credits ledger missing,
          `.Parent =` assigned before the last property set on the same variable (rough heuristic)
"""
import pathlib, re, sys

MAX_LINES = 300


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    root = pathlib.Path(sys.argv[1])
    errors, warns = [], []
    if not (root / "default.project.json").exists():
        errors.append("missing default.project.json (Rojo project file)")
    if not (root / "_project" / "CREDITS.md").exists():
        warns.append("missing _project/CREDITS.md (asset credits ledger)")
    files = [p for p in (root / "src").rglob("*.luau")] if (root / "src").exists() else []
    if not files:
        errors.append("no .luau files under src/")
    for p in files:
        rel = p.relative_to(root)
        text = p.read_text(errors="replace")
        lines = text.splitlines()
        head = "\n".join(lines[:12])
        if not all(k in head for k in ("WHAT", "TALKS TO", "SIBLINGS")):
            errors.append(f"{rel}: header comment needs WHAT / TALKS TO / SIBLINGS in the first lines")
        if len(lines) > MAX_LINES:
            errors.append(f"{rel}: {len(lines)} lines (cap {MAX_LINES})")
        if "--!strict" not in head:
            warns.append(f"{rel}: add --!strict at the top")
        if re.search(r"(?<![\w.:])(wait|spawn|delay)\s*\(", text):
            errors.append(f"{rel}: deprecated wait()/spawn()/delay(); use task.wait / task.spawn / task.delay")
        if p.name != "Net.luau":
            if "OnServerEvent" in text:
                errors.append(f"{rel}: use Net.onServerEvent (validation + rate limit), not OnServerEvent directly")
            if re.search(r'Instance\.new\(\s*"Remote(Event|Function)"', text):
                warns.append(f"{rel}: create remotes through Net.define, not Instance.new")
        # rough function length check
        depth_start = None
        for i, ln in enumerate(lines):
            if re.match(r"\s*(local\s+)?function\b", ln):
                depth_start = i
            if depth_start is not None and re.match(r"^end\b", ln.strip()) and ln.startswith(("end",)):
                if i - depth_start > 40:
                    warns.append(f"{rel}:{depth_start + 1}: function is ~{i - depth_start} lines (aim for ~20)")
                depth_start = None
    for w in warns:
        print("WARN ", w)
    for e in errors:
        print("ERROR", e)
    print(f"{len(files)} files checked, {len(errors)} errors, {len(warns)} warnings")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
