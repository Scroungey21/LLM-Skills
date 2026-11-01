#!/usr/bin/env python3
"""Art-direction guard: report how many opaque pixels of each PNG fall outside the project palette.

usage: check_palette.py --palette _project/palette.json --root resourcepack/assets/<ns>/textures
                        [--district zone_a] [--max-off 0.10] [--allow allowlist.txt] [--verbose]

palette.json (the source of truth, see assets/templates/minecraft/palette.json):
  {"tolerance": 14, "ramp_step": 7, "ramp_steps": 2,
   "global":    {"ink": "#1b1a17", "dust": "#c9b99a"},
   "districts": {"zone_a": {"wall": "#e8dcc4"}, "zone_b": {"wall": "#b9b2a4"}}}

How it judges: every palette colour is expanded into a short light/dark ramp (Minecraft textures shade by stepping
lightness), then a pixel is "on palette" when its CIE Lab distance (dE76) to the nearest ramp colour is within
`tolerance`. A texture fails when more than --max-off of its opaque pixels are off palette.
District: --district forces one; otherwise the first path segment matching a district name is used; otherwise
only the global colours plus ALL district colours are allowed (loose mode, reported as such).
Works on textures and on screenshots (big images are downscaled first), but lighting shifts colours in
screenshots, so use a higher --max-off and treat the result as a trend, not a verdict.
Exit code 1 if any texture fails. Needs Pillow.
"""
import argparse, json, math, pathlib, sys
from collections import Counter

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def to_lab(rgb):
    def lin(c):
        c /= 255.0
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(c) for c in rgb)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = (0.2126 * r + 0.7152 * g + 0.0722 * b)
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883

    def f(t):
        return t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(x), f(y), f(z)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def ramp(lab, step, n):
    L, a, b = lab
    return [(min(100.0, max(0.0, L + k * step)), a, b) for k in range(-n, n + 1)]


def dist(p, q):
    return math.sqrt(sum((x - y) ** 2 for x, y in zip(p, q)))


def build_allowed(cfg, district):
    step, n = cfg.get("ramp_step", 7), cfg.get("ramp_steps", 2)
    groups = [cfg.get("global", {})]
    districts = cfg.get("districts", {})
    if district and district in districts:
        groups.append(districts[district])
    else:
        groups.extend(districts.values())
    labs = []
    for g in groups:
        for hexv in g.values():
            labs.extend(ramp(to_lab(hex_rgb(hexv)), step, n))
    return labs


def pixels(im):
    """Pixel iterator that works on old and new Pillow (getdata is deprecated in newer releases)."""
    return im.get_flattened_data() if hasattr(im, "get_flattened_data") else im.getdata()


def off_fraction(path, allowed, tol):
    im = Image.open(path).convert("RGBA")
    if max(im.size) > 128:
        im.thumbnail((128, 128))
    counts = Counter(p[:3] for p in pixels(im) if p[3] >= 128)
    total = sum(counts.values())
    if not total:
        return 0.0, 0, []
    off, worst = 0, []
    for rgb, c in counts.items():
        d = min(dist(to_lab(rgb), a) for a in allowed)
        if d > tol:
            off += c
            worst.append((d, rgb, c))
    worst.sort(reverse=True)
    return off / total, total, worst[:3]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--palette", required=True)
    ap.add_argument("--root", required=True)
    ap.add_argument("--district")
    ap.add_argument("--max-off", type=float, default=0.10)
    ap.add_argument("--allow", help="text file: one path substring per line, exempt from the check")
    ap.add_argument("--verbose", action="store_true")
    a = ap.parse_args()

    cfg = json.loads(pathlib.Path(a.palette).read_text())
    tol = cfg.get("tolerance", 14)
    root = pathlib.Path(a.root)
    allow = [l.strip() for l in pathlib.Path(a.allow).read_text().splitlines() if l.strip()] if a.allow else []
    districts = set(cfg.get("districts", {}))
    cache, failed, checked = {}, 0, 0
    pngs = sorted(root.rglob("*.png")) if root.is_dir() else [root]
    if not pngs:
        print(f"nothing to check: no PNG files under {root} (0 images checked)")
        sys.exit(0)
    for p in pngs:
        rel = p.relative_to(root) if root.is_dir() else p
        if any(s in str(rel) for s in allow):
            continue
        d = a.district or next((s for s in rel.parts if s in districts), None)
        if d not in cache:
            cache[d] = build_allowed(cfg, d)
        frac, total, worst = off_fraction(p, cache[d], tol)
        checked += 1
        mode = d or "loose"
        bad = frac > a.max_off
        failed += bad
        if bad or a.verbose:
            tail = ", ".join(f"#{r:02x}{g:02x}{b:02x} dE{dd:.0f} x{c}" for dd, (r, g, b), c in worst)
            print(f"{'FAIL' if bad else 'ok  '} {rel}  off-palette {frac:.0%} of {total}px [{mode}]  {tail if bad else ''}")
    print(f"{checked} images checked, {failed} over the {a.max_off:.0%} off-palette limit (tolerance dE {tol})")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
