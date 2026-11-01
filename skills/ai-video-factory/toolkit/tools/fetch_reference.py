"""Gauntlet-loop reference fixture fetcher.

Pulls a REAL YouTube video's transcript + sampled keyframes into a local cache so a critic
agent can inspect actual bar material instead of an imagined description of it (the exact
failure mode this exists to prevent). Never used by the production pipeline itself -- this is
a dev/critic-time tool only, kept outside engine/app.

Usage:
    python tools/fetch_reference.py <video_url_or_id> [--out DIR] [--frames N]

Produces, under <out>/<video_id>/:
    video.mp4          - lowest-quality real footage (<=480p, enough for pacing/composition judgment)
    transcript.vtt      - real auto/manual captions, if available
    frame_XX.jpg         - N evenly-spaced keyframes across the video's duration

Requires yt-dlp and ffmpeg on PATH (both confirmed present and unblocked against
youtube.com/@bycloudAI as of this tool's creation).
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path


def _video_id(url_or_id: str) -> str:
    match = re.search(r"(?:v=|youtu\.be/|shorts/)([A-Za-z0-9_-]{11})", url_or_id)
    return match.group(1) if match else url_or_id


def fetch(url_or_id: str, out_dir: Path, frame_count: int) -> Path:
    video_id = _video_id(url_or_id)
    url = url_or_id if url_or_id.startswith("http") else f"https://www.youtube.com/watch?v={video_id}"
    dest = out_dir / video_id
    dest.mkdir(parents=True, exist_ok=True)

    subprocess.run(
        [
            "yt-dlp", "-f", "best[height<=480]",
            "--write-auto-sub", "--sub-lang", "en",
            url, "-o", str(dest / "video.%(ext)s"),
        ],
        check=True,
    )

    video_path = next(dest.glob("video.mp4"), None)
    if video_path is None:
        raise RuntimeError(f"yt-dlp did not produce video.mp4 in {dest}")

    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video_path)],
        check=True, capture_output=True, text=True,
    )
    duration = float(probe.stdout.strip())
    interval = max(duration / frame_count, 1.0)

    subprocess.run(
        ["ffmpeg", "-y", "-i", str(video_path), "-vf", f"fps=1/{interval}",
         "-frames:v", str(frame_count), str(dest / "frame_%02d.jpg")],
        check=True,
    )

    return dest


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("video")
    parser.add_argument("--out", default="fixtures/reference_videos")
    parser.add_argument("--frames", type=int, default=8)
    args = parser.parse_args()

    result = fetch(args.video, Path(args.out), args.frames)
    print(f"Fetched reference material to {result}")
