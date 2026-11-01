"""One-off voice-audition script -- NOT part of the production server.

Generates several candidate house-voice references from dots.tts SOAR's own
default speaker distribution (no prompt_audio_path, i.e. no cloning target),
one per seed, so a genuinely different synthetic speaker comes out of each
seed. Mirrors server.py's model-loading and boundary-silence-trim logic
exactly so a promoted candidate behaves identically to what production would
produce. Writes each candidate + a metadata line to /out.

Run inside the tts image with GPU access, e.g.:
  docker compose run --rm -v <hostdir>:/out tts \
    python3.12 /app/bootstrap_voice_candidates.py
"""

from __future__ import annotations

import json
import time
from pathlib import Path

import soundfile as sf
import torch

from dots_tts.runtime import DotsTtsRuntime

MODEL_ID = "dots-studio/dots.tts-soar"
PRECISION = "bfloat16"
NUM_STEPS = 16
GUIDANCE_SCALE = 1.2
SPEAKER_SCALE = 1.5
BOUNDARY_PADDING_MS = 100
OUT_DIR = Path("/out")

# A charismatic-presenter register sits well below warm-informational's
# rejected 144 Hz. Deliberately spread across low-to-mid seeds -- the
# hidden-systems bootstrap showed seed choice, not a formula, determines the
# sampled speaker's register, so audition a spread rather than guess one.
SEEDS = [92000001, 92000002, 92000003, 92000004, 92000005, 92000006, 92000007, 92000008,
         92000009, 92000010, 92000011, 92000012, 92000013, 92000014, 92000015, 92000016]

SAMPLE_TEXT = (
    "Here is what actually happened, and why it matters. A security "
    "researcher found the flaw in under an hour, and the vendor confirmed "
    "it the same day."
)


def _trim_boundary_silence(audio: torch.Tensor, sample_rate: int) -> torch.Tensor:
    audio = audio.reshape(-1)
    frame = max(1, round(sample_rate * 0.02))
    hop = max(1, frame // 2)
    if audio.numel() < frame:
        return audio
    frames = audio.unfold(0, frame, hop)
    envelope = frames.square().mean(dim=1).sqrt()
    threshold = max(float(envelope.max()) * 0.01, 1e-4)
    active = torch.nonzero(envelope >= threshold).reshape(-1)
    if active.numel() == 0:
        return audio
    padding = round(sample_rate * BOUNDARY_PADDING_MS / 1000)
    start = max(0, int(active[0]) * hop - padding)
    end = min(audio.numel(), int(active[-1]) * hop + frame + padding)
    return audio[start:end]


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[bootstrap] loading {MODEL_ID} precision={PRECISION}", flush=True)
    runtime = DotsTtsRuntime.from_pretrained(
        MODEL_ID,
        precision=PRECISION,
        optimize=False,
        max_generate_length=500,
        vocoder_merge_steps=4,
        warmup_on_optimize=False,
    )

    word_count = len(SAMPLE_TEXT.split())
    results = []
    for seed in SEEDS:
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)
        t0 = time.time()
        result = runtime.generate(
            text=SAMPLE_TEXT,
            prompt_audio_path=None,
            prompt_text=None,
            language="EN",
            speaker_scale=SPEAKER_SCALE,
            ode_method="euler",
            num_steps=NUM_STEPS,
            guidance_scale=GUIDANCE_SCALE,
            normalize_text=False,
        )
        elapsed = time.time() - t0
        sample_rate = int(result["sample_rate"])
        audio = _trim_boundary_silence(result["audio"].detach().float().cpu(), sample_rate)
        duration_s = audio.numel() / sample_rate
        wpm = word_count / (duration_s / 60) if duration_s else 0.0

        out_path = OUT_DIR / f"candidate_seed_{seed}.wav"
        sf.write(str(out_path), audio.numpy(), sample_rate, subtype="PCM_16")
        meta = {
            "seed": seed,
            "duration_seconds": round(duration_s, 2),
            "native_words_per_minute": round(wpm, 1),
            "elapsed_seconds": round(elapsed, 1),
            "file": out_path.name,
        }
        results.append(meta)
        print(f"[bootstrap] seed={seed} duration={duration_s:.2f}s wpm={wpm:.1f} elapsed={elapsed:.1f}s", flush=True)

    meta_path = OUT_DIR / "candidates_meta.json"
    existing = json.loads(meta_path.read_text()) if meta_path.exists() else []
    existing = [e for e in existing if e["seed"] not in {r["seed"] for r in results}]
    meta_path.write_text(json.dumps(existing + results, indent=2))
    print("[bootstrap] done", flush=True)


if __name__ == "__main__":
    main()
