#!/usr/bin/env python3
"""Propose a palette from a folder of reference photos so the art director has real numbers to approve or reject.

usage: palette_from_refs.py --refs _project/reference_board/zone_a [--colors 8] [--json proposal.json]

Reference photos are ANALYSED, never copied into textures or shipped (see references/minecraft-art-direction.md).
The tool pools all pixels of all images (each downscaled), quantizes them with median cut and prints the dominant
colours with their share. It cannot know which colour is a wall or a roof: the roles are assigned by a human, then the
approved swatches go into _project/palette.json. Needs Pillow.
"""
import argparse, json, pathlib, sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

EXT = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}


def pixels(im):
    """Pixel iterator that works on old and new Pillow (getdata is deprecated in newer releases)."""
    return im.get_flattened_data() if hasattr(im, "get_flattened_data") else im.getdata()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--refs", required=True)
    ap.add_argument("--colors", type=int, default=8)
    ap.add_argument("--json")
    a = ap.parse_args()

    files = [p for p in sorted(pathlib.Path(a.refs).rglob("*")) if p.suffix.lower() in EXT]
    if not files:
        sys.exit(f"no images under {a.refs}")
    tiles = []
    for p in files:
        im = Image.open(p).convert("RGB")
        im.thumbnail((96, 96))
        tiles.append(im)
    w = sum(t.width for t in tiles)
    h = max(t.height for t in tiles)
    sheet = Image.new("RGB", (w, h), (0, 0, 0))
    mask = Image.new("L", (w, h), 0)
    x = 0
    for t in tiles:
        sheet.paste(t, (x, 0))
        mask.paste(255, (x, 0, x + t.width, t.height))
        x += t.width
    q = sheet.quantize(colors=a.colors, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()
    counts = {}
    for idx, m in zip(pixels(q), pixels(mask)):
        if m:
            counts[idx] = counts.get(idx, 0) + 1
    total = sum(counts.values())
    out = []
    for idx, c in sorted(counts.items(), key=lambda kv: -kv[1]):
        r, g, b = pal[idx * 3: idx * 3 + 3]
        out.append({"hex": f"#{r:02x}{g:02x}{b:02x}", "share": round(c / total, 3), "role": "unassigned"})
    print(f"{len(files)} images pooled. Proposed swatches (assign roles, then copy approved ones to palette.json):")
    print("| hex | share | role |\n|---|---|---|")
    for o in out:
        print(f"| {o['hex']} | {o['share']:.1%} | {o['role']} |")
    if a.json:
        pathlib.Path(a.json).write_text(json.dumps(out, indent=2) + "\n")
        print(f"wrote {a.json}")


if __name__ == "__main__":
    main()
