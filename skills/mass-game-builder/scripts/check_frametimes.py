#!/usr/bin/env python3
"""Judge a frame-time capture against a pass line (see references/minecraft-quality-standards.md section 3).

usage: check_frametimes.py capture.csv [capture2.csv ...] --floor 40 [--max-dip-s 1.0] [--column NAME]
                           [--skip-s 0] [--min-seconds 60] [--low-method mean|p99] [--worst-ms 50]

Reads CSV captures from PresentMon, CapFrameX or any tool with a per-frame time column in milliseconds
(auto-detected: MsBetweenPresents, MsBetweenDisplayChange, frametime, FrameTime, ms_between_presents, ms) or in seconds
(--column with --unit s). Prints average FPS, 1% low, 99th-percentile frame time, worst frame, and the longest continuous
stretch below the floor. Exit code 0 = every file passes, 1 = at least one fails, 2 = unreadable input.

PASS when: 1% low >= floor AND longest sub-floor stretch <= --max-dip-s (default 1.0 s) AND (if given) worst frame <= --worst-ms.
1% low default = average FPS of the slowest 1% of frames ('mean'); 'p99' uses the 99th-percentile frame time instead.
Several files are the repeated runs: every one must pass (gate on the worst, report the median).
"""
import argparse, csv, statistics, sys

CANDIDATES = ["MsBetweenPresents", "MsBetweenDisplayChange", "msBetweenPresents", "FrameTime", "frametime",
              "frame_time", "ms_between_presents", "Frametime", "frametime_ms", "ms"]


def load(path, column, unit, skip_s):
    with open(path, newline="", encoding="utf-8-sig") as fh:
        rd = csv.DictReader(fh)
        cols = rd.fieldnames or []
        col = column or next((c for c in CANDIDATES if c in cols), None)
        if col is None or col not in cols:
            raise ValueError(f"no frame-time column found (have: {', '.join(cols[:12])}); pass --column")
        times, elapsed = [], 0.0
        for row in rd:
            try:
                v = float(row[col])
            except (TypeError, ValueError):
                continue
            ms = v * 1000.0 if unit == "s" else v
            if ms <= 0:
                continue
            elapsed += ms / 1000.0
            if elapsed >= skip_s:
                times.append(ms)
    return times


def analyse(ms, floor, low_method):
    n = len(ms)
    total_s = sum(ms) / 1000.0
    avg = n / total_s
    worst_first = sorted(ms, reverse=True)
    k = max(1, n // 100)
    slowest = worst_first[:k]
    low_mean = 1000.0 / (sum(slowest) / k)
    s = sorted(ms)
    p99 = s[min(n - 1, int(0.99 * n))]
    low_p99 = 1000.0 / p99
    floor_ms = 1000.0 / floor
    run = longest = 0.0
    for t in ms:
        if t > floor_ms:
            run += t / 1000.0
            longest = max(longest, run)
        else:
            run = 0.0
    return {"frames": n, "seconds": total_s, "avg": avg, "low": low_mean if low_method == "mean" else low_p99,
            "low_mean": low_mean, "low_p99": low_p99, "p99_ms": p99, "worst_ms": worst_first[0], "longest_dip_s": longest}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="+")
    ap.add_argument("--floor", type=float, required=True, help="minimum FPS for a pass (1%% low must be >= this)")
    ap.add_argument("--max-dip-s", type=float, default=1.0)
    ap.add_argument("--column")
    ap.add_argument("--unit", choices=["ms", "s"], default="ms")
    ap.add_argument("--skip-s", type=float, default=0.0, help="ignore this many seconds at the start (warm-up)")
    ap.add_argument("--min-seconds", type=float, default=60.0, help="captures shorter than this are rejected as too short")
    ap.add_argument("--low-method", choices=["mean", "p99"], default="mean")
    ap.add_argument("--worst-ms", type=float, help="optional ceiling for the worst single frame")
    a = ap.parse_args()

    results, failed = [], False
    for f in a.files:
        try:
            ms = load(f, a.column, a.unit, a.skip_s)
        except (OSError, ValueError, csv.Error) as e:
            print(f"ERROR {f}: {e}")
            return 2
        if len(ms) < 100:
            print(f"ERROR {f}: only {len(ms)} usable frames")
            return 2
        r = analyse(ms, a.floor, a.low_method)
        problems = []
        if r["seconds"] < a.min_seconds:
            problems.append(f"capture is {r['seconds']:.0f}s, shorter than --min-seconds {a.min_seconds:.0f}")
        if r["low"] < a.floor:
            problems.append(f"1% low {r['low']:.1f} < floor {a.floor:g}")
        if r["longest_dip_s"] > a.max_dip_s:
            problems.append(f"sub-floor stretch {r['longest_dip_s']:.2f}s > {a.max_dip_s:g}s")
        if a.worst_ms is not None and r["worst_ms"] > a.worst_ms:
            problems.append(f"worst frame {r['worst_ms']:.1f} ms > {a.worst_ms:g} ms")
        verdict = "PASS" if not problems else "FAIL"
        failed |= bool(problems)
        print(f"{verdict}  {f}: {r['frames']} frames, {r['seconds']:.0f}s | avg {r['avg']:.1f} FPS | 1% low {r['low_mean']:.1f} "
              f"(p99 {r['p99_ms']:.1f} ms = {r['low_p99']:.1f} FPS) | worst {r['worst_ms']:.1f} ms | longest dip below "
              f"{a.floor:g} FPS {r['longest_dip_s']:.2f}s")
        for p in problems:
            print(f"      - {p}")
        results.append(r)
    if len(results) > 1:
        lows = [r["low"] for r in results]
        print(f"runs: {len(results)} | worst 1% low {min(lows):.1f} | median 1% low {statistics.median(lows):.1f} | "
              f"{'ALL PASS' if not failed else 'NOT ALL PASS'}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
