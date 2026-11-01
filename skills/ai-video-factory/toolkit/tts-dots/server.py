"""Production dots.tts narration service.

The output path is deliberately dry: no reverb, enhancement, denoising, tempo
stretching, pitch shifting, or loudness effects are applied here. Delivery pace
comes from the reference performance and punctuation supplied to dots.tts.
"""

from __future__ import annotations

import hashlib
import io
import os
import re
import threading
from pathlib import Path

import soundfile as sf
import torch
from fastapi import FastAPI, HTTPException, Response
from pydantic import BaseModel, Field

from dots_tts.runtime import DotsTtsRuntime

MODEL_ID = os.getenv("DOTS_TTS_MODEL", "dots-studio/dots.tts-soar")
REFERENCE_PATH = Path(os.getenv("DOTS_TTS_REFERENCE_AUDIO", "/app/voices/warm-informational.wav"))
VOICE_ID = os.getenv("DOTS_TTS_VOICE_ID", "warm-informational")
REFERENCE_TEXT_PATH = Path(os.getenv("DOTS_TTS_REFERENCE_TEXT", "/app/voices/warm-informational.txt"))
PRECISION = os.getenv("DOTS_TTS_PRECISION", "bfloat16")
OPTIMIZE = os.getenv("DOTS_TTS_OPTIMIZE", "0") == "1"
NUM_STEPS = int(os.getenv("DOTS_TTS_NUM_STEPS", "16"))
GUIDANCE_SCALE = float(os.getenv("DOTS_TTS_GUIDANCE_SCALE", "1.2"))
SPEAKER_SCALE = float(os.getenv("DOTS_TTS_SPEAKER_SCALE", "1.5"))
DEFAULT_SEED = int(os.getenv("DOTS_TTS_SEED", "20260829"))
MAX_GENERATE_LENGTH = int(os.getenv("DOTS_TTS_MAX_GENERATE_LENGTH", "500"))
NORMALIZE_TEXT = os.getenv("DOTS_TTS_NORMALIZE_TEXT", "0") == "1"
CHUNK_MAX_WORDS = int(os.getenv("DOTS_TTS_CHUNK_MAX_WORDS", "56"))
CHUNK_GAP_MS = int(os.getenv("DOTS_TTS_CHUNK_GAP_MS", "40"))
BOUNDARY_PADDING_MS = int(os.getenv("DOTS_TTS_BOUNDARY_PADDING_MS", "100"))
# Fix for a confirmed defect (2026-09-04): SOAR treats every generation call as a complete
# utterance and visibly rushes/under-articulates the truly final word before it. Measured via a
# direct A/B probe against this server: a scene ending "...same wider grid." decayed from its
# terminal vowel's peak envelope level to below -25 dB in ~50 ms with no sentinel appended,
# versus ~150 ms of natural, gradual decay through -6/-9/-12/-16/-20 dB when three trailing dots
# were appended to the same input text (same seed, same reference audio). This is NOT the
# boundary-silence-trim defect it first looked like -- `X-TTS-Trim-Tail-Ms` measured 0 on the
# unfixed "grid" take, meaning trim removed nothing; the model's own raw output already ended
# abruptly. Appending a short non-lexical sentinel (pure punctuation, never a real word) to every
# generation chunk gives SOAR "runway" past the real final word before it decides the utterance
# is over, and `_trim_boundary_silence` -- confirmed working correctly by the same probe, which
# also showed it leaves a genuine >=90ms decayed tail whenever it actually removes something --
# then strips the resulting extra silence for free. Applied to every chunk (not only the last),
# since each chunk is its own independent `_runtime.generate()` call and hits the same no-runway
# condition at its own end, immediately before the 40ms CHUNK_GAP_MS join. Two variants: a chunk
# that already ends in terminal punctuation (a real sentence end) gets an ellipsis, matching a
# natural trailing-off contour; a chunk force-split mid-sentence (CHUNK_MAX_WORDS packing runs
# words-only, without waiting for a clause boundary -- see `_generation_chunks`) gets a comma
# instead, so it keeps a continuation contour rather than acquiring a false sentence-final cadence
# on top of the retained boundary padding and the 40ms join. Caveat, confirmed via a second A/B
# (on a scene ending "...very high voltage."): the improvement does not reduce to a single
# reliable timing metric across scenes -- that scene's own known-bad/known-good tail-silence
# measurements INVERTED (190ms bad vs. 100ms good), because appending the sentinel shifts a
# seed's whole generation trajectory, not just its ending. So this fix is applied unconditionally
# to every generation as a structural, best-effort mitigation grounded in the "grid" decay-shape
# evidence above -- there is deliberately no automated per-take accept/reject gate built on top
# of it (see hidden_systems_production.py's dots_scene, which tried and removed one).
GENERATION_TAIL_SENTINEL_TERMINAL = " ..."
GENERATION_TAIL_SENTINEL_CONTINUATION = ","


def _generation_tail_sentinel(chunk_text: str) -> str:
    stripped = chunk_text.rstrip()
    if stripped and stripped[-1] in ".!?;:":
        return GENERATION_TAIL_SENTINEL_TERMINAL
    return GENERATION_TAIL_SENTINEL_CONTINUATION


# Calibration-only, like debug_disable_trim -- never set by the production pipeline. Lets a
# diagnostic request reproduce pre-fix ("no runway") behavior on demand for A/B measurement
# against the fix, without needing to revert and redeploy server code to get a baseline.
def _maybe_skip_sentinel(chunk_text: str, skip: bool) -> str:
    return "" if skip else _generation_tail_sentinel(chunk_text)


if not 10 <= NUM_STEPS <= 32:
    raise RuntimeError("DOTS_TTS_NUM_STEPS must be in the official SOAR range 10..32")
if not 0.5 <= GUIDANCE_SCALE <= 2.0:
    raise RuntimeError("DOTS_TTS_GUIDANCE_SCALE must stay in the conservative 0.5..2.0 range")

app = FastAPI(title="dots.tts narrator", version="1.0")
_runtime: DotsTtsRuntime | None = None
_load_error: str | None = None
_generation_lock = threading.Lock()


class TTSRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    voice_id: str = "warm-informational"
    delivery: str = "standard"
    language: str = "EN"
    seed: int | None = None
    num_steps: int | None = Field(default=None, ge=10, le=32)
    guidance_scale: float | None = Field(default=None, ge=0.5, le=2.0)
    speaker_scale: float | None = Field(default=None, ge=0.5, le=2.5)
    # Diagnostic only -- never set by the production pipeline (hidden_systems_production.py
    # never sends it). Returns the raw, untrimmed chunk audio (still chunk-gap-joined) instead
    # of the normal trimmed output, so a human can listen to exactly what boundary trimming
    # would otherwise remove. The X-TTS-Trim-* headers below are ALWAYS emitted regardless of
    # this flag, so the pipeline can assert trim never eats real speech without needing it.
    debug_disable_trim: bool = False
    # Calibration-only, like debug_disable_trim above -- never set by the production pipeline.
    # Reproduces pre-fix ("no runway") generation on demand for A/B measurement against the fix.
    debug_skip_sentinel: bool = False


def _reference_text() -> str:
    return REFERENCE_TEXT_PATH.read_text(encoding="utf-8").strip()


def _reference_sha256() -> str:
    return hashlib.sha256(REFERENCE_PATH.read_bytes()).hexdigest()


def _generation_chunks(text: str) -> list[str]:
    """Keep each native generation safely below SOAR's 500-patch ceiling.

    Prefer sentence and clause boundaries, then pack words as a last resort.
    This avoids clipped narration without time-stretching the generated audio.
    """
    # Pack across sentence boundaries. Resetting the model every 8-12 words makes
    # every sentence sound like a standalone announcement and destroys the pace
    # learned from the reference performance. Punctuation remains in each unit,
    # so SOAR can still phrase sentences naturally inside a continuous paragraph.
    units = [
        part.strip()
        for part in re.split(r"(?<=[.!?;:])\s+", text.strip())
        if part.strip()
    ]
    chunks: list[str] = []
    pending: list[str] = []
    for unit in units:
        words = unit.split()
        while words:
            room = CHUNK_MAX_WORDS - len(pending)
            if room == 0:
                chunks.append(" ".join(pending))
                pending = []
                room = CHUNK_MAX_WORDS
            pending.extend(words[:room])
            words = words[room:]
            if len(pending) == CHUNK_MAX_WORDS:
                chunks.append(" ".join(pending))
                pending = []
    if pending:
        chunks.append(" ".join(pending))
    return chunks or [text.strip()]


def _trim_boundary_silence(
    audio: torch.Tensor, sample_rate: int
) -> tuple[torch.Tensor, int, int, int, int]:
    """Remove only excessive model-added boundary silence, preserving 100 ms.

    Samples inside the spoken region are never resampled, stretched, filtered,
    normalized, or otherwise altered. Returns `(trimmed_audio, head_cut_samples,
    tail_cut_samples, head_silence_samples, tail_silence_samples)`.

    `*_cut_samples` are what this call actually removed -- clamped by `BOUNDARY_PADDING_MS`,
    so a natural silence run shorter than the padding is never fully "cut" even though it is
    real silence. `*_silence_samples` are the TRUE, unclamped measurement of how much silence
    exists past the last (or before the first) frame of real content -- e.g. `tail_silence_samples`
    answers "did the model actually decay into silence before its output ended", independent of
    whether the padding clamp happened to remove all, some, or none of that silence. Callers that
    need to distinguish "no runway to trim" from "some runway, but not more than the retained
    padding" (a real defect vs. a perfectly healthy short tail) MUST use the unclamped values.
    """
    audio = audio.reshape(-1)
    frame = max(1, round(sample_rate * 0.02))
    hop = max(1, frame // 2)
    if audio.numel() < frame:
        return audio, 0, 0, 0, 0
    frames = audio.unfold(0, frame, hop)
    envelope = frames.square().mean(dim=1).sqrt()
    threshold = max(float(envelope.max()) * 0.01, 1e-4)
    active = torch.nonzero(envelope >= threshold).reshape(-1)
    if active.numel() == 0:
        return audio, 0, 0, 0, 0
    last_content_end = int(active[-1]) * hop + frame
    first_content_start = int(active[0]) * hop
    head_silence_samples = first_content_start
    tail_silence_samples = audio.numel() - last_content_end
    padding = round(sample_rate * BOUNDARY_PADDING_MS / 1000)
    start = max(0, first_content_start - padding)
    end = min(audio.numel(), last_content_end + padding)
    return audio[start:end], start, audio.numel() - end, head_silence_samples, tail_silence_samples


@app.on_event("startup")
def load_runtime() -> None:
    global _runtime, _load_error
    try:
        if not REFERENCE_PATH.is_file() or not REFERENCE_TEXT_PATH.is_file():
            raise FileNotFoundError("The reviewed house-voice audio and exact transcript are required")
        _runtime = DotsTtsRuntime.from_pretrained(
            MODEL_ID,
            precision=PRECISION,
            optimize=OPTIMIZE,
            max_generate_length=MAX_GENERATE_LENGTH,
            vocoder_merge_steps=4,
            warmup_on_optimize=OPTIMIZE,
        )
    except Exception as exc:
        _load_error = f"{type(exc).__name__}: {exc}"
        raise


@app.get("/api/model-info")
def model_info() -> dict[str, object]:
    if _runtime is None:
        raise HTTPException(status_code=503, detail=_load_error or "model is loading")
    return {
        "backend": "dots.tts",
        "package_version": "0.4.0",
        "model": MODEL_ID,
        "voice": VOICE_ID,
        "reference_sha256": _reference_sha256(),
        "sample_rate": 48000,
        "precision": PRECISION,
        "optimized": OPTIMIZE,
        "num_steps": NUM_STEPS,
        "guidance_scale": GUIDANCE_SCALE,
        "speaker_scale": SPEAKER_SCALE,
        "chunk_max_words": CHUNK_MAX_WORDS,
        "native_pacing": True,
        "post_generation_speedup": False,
        "boundary_silence_trim": True,
        "audio_effects": [],
    }


@app.post("/tts")
def synthesize(request: TTSRequest) -> Response:
    if _runtime is None:
        raise HTTPException(status_code=503, detail=_load_error or "model is loading")
    if request.voice_id != VOICE_ID:
        raise HTTPException(status_code=422, detail=f"Only the reviewed {VOICE_ID} house voice is enabled")

    seed = DEFAULT_SEED if request.seed is None else request.seed
    with _generation_lock:
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)
        chunks = _generation_chunks(request.text)
        trimmed_parts: list[torch.Tensor] = []
        raw_parts: list[torch.Tensor] = []
        total_time = 0.0
        sample_rate = 48000
        head_cut_samples = 0  # only the very first chunk's head cut matters -- the
        tail_cut_samples = 0  # utterance boundary is chunk 0's start / last chunk's end.
        head_silence_samples = 0
        tail_silence_samples = 0
        for index, chunk in enumerate(chunks):
            result = _runtime.generate(
                text=chunk + _maybe_skip_sentinel(chunk, request.debug_skip_sentinel),
                prompt_audio_path=str(REFERENCE_PATH),
                prompt_text=_reference_text(),
                language=request.language,
                speaker_scale=request.speaker_scale or SPEAKER_SCALE,
                ode_method="euler",
                num_steps=request.num_steps or NUM_STEPS,
                guidance_scale=request.guidance_scale or GUIDANCE_SCALE,
                normalize_text=NORMALIZE_TEXT,
            )
            sample_rate = int(result["sample_rate"])
            raw_chunk_audio = result["audio"].detach().float().cpu().reshape(-1)
            (
                trimmed_chunk_audio,
                chunk_head_cut,
                chunk_tail_cut,
                chunk_head_silence,
                chunk_tail_silence,
            ) = _trim_boundary_silence(raw_chunk_audio, sample_rate)
            if index == 0:
                head_cut_samples = chunk_head_cut
                head_silence_samples = chunk_head_silence
            if index == len(chunks) - 1:
                tail_cut_samples = chunk_tail_cut
                tail_silence_samples = chunk_tail_silence
            trimmed_parts.append(trimmed_chunk_audio)
            raw_parts.append(raw_chunk_audio)
            total_time += float(result["time_used"])
            if index + 1 < len(chunks) and CHUNK_GAP_MS > 0:
                gap = torch.zeros(round(sample_rate * CHUNK_GAP_MS / 1000))
                trimmed_parts.append(gap)
                raw_parts.append(gap)

    trimmed_tensor = torch.cat(trimmed_parts)
    raw_tensor = torch.cat(raw_parts)
    audio_tensor = raw_tensor if request.debug_disable_trim else trimmed_tensor
    audio = audio_tensor.numpy()
    duration = len(audio) / sample_rate
    aggregate_rtf = total_time / duration if duration else float("inf")
    output = io.BytesIO()
    sf.write(output, audio, sample_rate, format="WAV", subtype="PCM_24")
    return Response(
        output.getvalue(),
        media_type="audio/wav",
        headers={
            "X-TTS-Backend": "dots.tts",
            "X-TTS-Model": MODEL_ID,
            "X-TTS-Voice": request.voice_id,
            "X-TTS-Native-Pacing": "true",
            "X-TTS-Post-Speedup": "false",
            "X-TTS-Boundary-Silence-Trim": "true",
            "X-TTS-Seed": str(seed),
            "X-TTS-RTF": f"{aggregate_rtf:.4f}",
            "X-TTS-Chunks": str(len(chunks)),
            # Always emitted (independent of debug_disable_trim) so the production pipeline
            # can assert boundary trim never removed a suspicious amount of real speech.
            "X-TTS-Trim-Head-Ms": str(round(head_cut_samples / sample_rate * 1000)),
            "X-TTS-Trim-Tail-Ms": str(round(tail_cut_samples / sample_rate * 1000)),
            # Unclamped by BOUNDARY_PADDING_MS -- the true measured silence past the last (or
            # before the first) frame of real content, so callers can tell "no runway at all"
            # (a defect) apart from "runway shorter than the retained padding" (perfectly fine).
            "X-TTS-Head-Silence-Ms": str(round(head_silence_samples / sample_rate * 1000)),
            "X-TTS-Tail-Silence-Ms": str(round(tail_silence_samples / sample_rate * 1000)),
            "X-TTS-Raw-Duration-Ms": str(round(len(raw_tensor) / sample_rate * 1000)),
            "X-TTS-Trimmed-Duration-Ms": str(round(len(trimmed_tensor) / sample_rate * 1000)),
        },
    )
