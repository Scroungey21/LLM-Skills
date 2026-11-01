import json
import numpy as np
import soundfile as sf
from pathlib import Path

CAND_DIR = Path("H:/Projects/YTtechnews/technews/output/voice-candidates")


def estimate_f0(path):
    y, sr = sf.read(path)
    if y.ndim > 1:
        y = y.mean(axis=1)
    y = y.astype(np.float64)

    frame_len = int(sr * 0.04)
    hop = int(sr * 0.02)
    min_f0, max_f0 = 60, 400
    min_lag = int(sr / max_f0)
    max_lag = int(sr / min_f0)

    f0s = []
    for start in range(0, len(y) - frame_len, hop):
        frame = y[start:start + frame_len]
        if np.max(np.abs(frame)) < 0.01:
            continue
        frame = frame - frame.mean()
        corr = np.correlate(frame, frame, mode='full')[len(frame) - 1:]
        corr = corr[:max_lag + 1]
        if len(corr) <= min_lag:
            continue
        search = corr[min_lag:max_lag]
        if len(search) == 0 or search.max() <= 0:
            continue
        peak_lag = min_lag + np.argmax(search)
        if corr[0] == 0:
            continue
        norm_strength = corr[peak_lag] / corr[0]
        if norm_strength < 0.3:
            continue
        f0 = sr / peak_lag
        f0s.append(f0)

    f0s = np.array(f0s)
    return {
        "voiced_frames": int(len(f0s)),
        "median_f0": round(float(np.median(f0s)), 1) if len(f0s) else None,
        "mean_f0": round(float(np.mean(f0s)), 1) if len(f0s) else None,
        "std_f0": round(float(np.std(f0s)), 1) if len(f0s) else None,
    }


meta = json.loads((CAND_DIR / "candidates_meta.json").read_text())
report = []
for m in meta:
    wav_path = CAND_DIR / m["file"]
    f0 = estimate_f0(str(wav_path))
    row = {**m, **f0}
    report.append(row)
    print(f"seed={row['seed']:<10} median_f0={row['median_f0']!s:<7} wpm={row['native_words_per_minute']:<6} "
          f"voiced_frames={row['voiced_frames']:<5} duration={row['duration_seconds']}s")

(CAND_DIR / "candidates_f0_report.json").write_text(json.dumps(report, indent=2))
