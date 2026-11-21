#!/usr/bin/env python3
"""
Zips a handoff (HANDOFF.md, handoff.json, optional transcript.md and any extra files you list)
into <folder-name>-handoff.zip next to the folder. Also accepts v1 handoffs (handoff.md + assets/).

Usage:
    python package_handoff.py /path/to/project-root [extra_file ...] [--out DIR]
"""
import sys
import zipfile
from pathlib import Path

V2 = ["HANDOFF.md", "handoff.json", "transcript.md"]
V1 = ["handoff.md", "handoff.json"]


def package_handoff(folder: str, extras=(), output_dir: str | None = None) -> str:
    src = Path(folder).resolve()
    if not src.is_dir():
        raise FileNotFoundError(f"Not a directory: {src}")
    files = [src / f for f in V2 if (src / f).exists()]
    if not any(f.name == "HANDOFF.md" for f in files):
        files = [src / f for f in V1 if (src / f).exists()]
        if (src / "assets").is_dir():
            files += [p for p in sorted((src / "assets").rglob("*")) if p.is_file()]
    if not files:
        raise SystemExit("No handoff files found (expected HANDOFF.md + handoff.json).")
    for e in extras:
        p = Path(e).resolve()
        if p.is_file():
            files.append(p)
        else:
            print(f"Warning: extra file not found: {e}", file=sys.stderr)
    out_dir = Path(output_dir).resolve() if output_dir else src.parent
    out_dir.mkdir(parents=True, exist_ok=True)
    zip_path = out_dir / f"{src.name}-handoff.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in files:
            try:
                arc = p.relative_to(src)
            except ValueError:
                arc = Path("extra") / p.name
            zf.write(p, arcname=str(arc))
    print(f"Packaged {len(files)} files: {zip_path}")
    return str(zip_path)


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(1)
    out = None
    if "--out" in args:
        i = args.index("--out")
        out = args[i + 1]
        del args[i:i + 2]
    package_handoff(args[0], args[1:], out)
