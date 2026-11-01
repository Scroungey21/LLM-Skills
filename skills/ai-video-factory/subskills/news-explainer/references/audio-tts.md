# Audio: dots.tts, tempo, alignment, captions, music, loudness (news-explainer)

Sources: old skill `audio-tts`, playbook section 5, engine `audio/*` and `render/*` code constants (read 2026-11), LITMUS audio rules. Where prose and code disagree, **code and config win** (authority order) and the disagreement is recorded here.

Contents: 1 TTS contract - 2 Tempo (conflict) - 3 Cadence workflow - 4 Chunking and cache - 5 Alignment and captions - 6 Music bed (conflict) - 7 Mastering, lead/tail, loudness - 8 Audio QA commands and thresholds

## 1. Active TTS contract

- Backend: dots.tts only (`TTS_BACKEND=dots`); the client refuses any other backend and verifies the response's backend/native-pacing headers. Model `dots-studio/dots.tts-soar` (dots.tts 0.3.1), server in `ai-video-factory/toolkit/tts-dots/server.py`, port **8004**, endpoints `GET /api/model-info`, `POST /tts`.
- Voice id `warm-informational`: synthetic **male** house voice; reference `toolkit/tts-dots/voices/warm-informational.wav` + `.txt` + provenance JSON (`provenance.json`; the voice was cloned from a permissively licensed reference clip - no per-video licence required). Superseded/broken reference sets sit in `voices/archive-*` - never reactivate. Never change voice identity mid-channel.
- Precision BF16 (`DOTS_TTS_PRECISION=bfloat16`, `OPTIMIZE=0`); sampling **16 Euler steps, guidance 1.2, speaker scale 1.5, deterministic seed 20260829**; chunk cap **56 words** (`_generation_chunks` packs sentence/clause units across boundaries to keep paragraph rhythm).
- `/tts` request fields: `text` (1-4000 chars), `voice_id`, `delivery` ("standard" default; hook preset used sparingly for genuine stakes, pattern preset for reveals/reversals), `language` ("EN"), `seed`, `num_steps` (10-32), `guidance_scale` (0.5-2.0), `speaker_scale` (0.5-2.5), `debug_disable_trim` (diagnostic only, never in production).
- Output: dry **48 kHz mono PCM24 WAV**. The service only trims boundary silence (`X-TTS-Trim-*` headers always emitted so the pipeline can assert trim never eats speech) - **no reverb, enhancement, denoising, pitch shift or service-level speed-up**. Headers `X-TTS-Native-Pacing: true`, `X-TTS-Post-Speedup: false` describe the *service*; the downstream tempo (below) is a separate layer - not a contradiction.
- `tts` and `tts-hidden` must never run together; also exclusive with ComfyUI/VoiceStudio on one GPU. First boot downloads ~4.8 GB (healthcheck start_period 600 s).
- Legacy Chatterbox (vendored submodule, unwired), Kokoro (untracked dir), Qwen3-TTS (removed 2026-09-03) are inactive; do not reactivate without an explicit request.

## 2. Tempo - the value is in conflict; set it explicitly

| Source | Value |
|---|---|
| Old orchestrator skill (snapshot 2026-09-01/03), `scriptwriter.py` comment ("selected TTS runs at 1.5x the former delivery speed"), `WORDS_PER_MINUTE=225` | **1.5** (user's choice at the time: roughly 1.5x the earlier rhythm) |
| `docker-compose.yml` default, `.env.example`, `audio/pipeline.py` fallback (`os.environ.get("NARRATION_TEMPO","1.2")`) - changed in commit "fixed technews issues" 2026-09-04 | **1.2** |
| Ledger `voice_revision` for the 3 reviewed videos: "2026-09-04-audio-v4 (1.2x pitch-preserved tempo, 40% BGM volume, natural outro fade-out ...)" | **1.2** |
| `.env` in the repo | no override |
| ONBOARDING ("native pacing only ... in either pipeline") | wrong for technews (HES is native-only) |

Resolution: the latest dated change (2026-09-04) and every config default say **1.2**; the 1.5 text is a stale snapshot. Treat 1.2 as current **but confirm with the user before a batch**, and always set `NARRATION_TEMPO` explicitly in the run environment so the value is on record. Valid range 0.5-2.0 (code raises otherwise); `1.0` skips the filter.
Mechanism: FFmpeg `atempo` (WSOLA - pitch-preserving), applied once to the *assembled* narration **before** silence trimming, alignment, captions and music ducking; scene bounds are remapped from **measured** pre/post durations, never an assumed factor.
If a dense sentence becomes uncomfortable at the chosen tempo: simplify/split that beat before touching the global tempo. Faster is not rushed - if consonants blur, rewrite. Achieve pace with short information-dense scenes, staged reveals matching spoken beats, removing redundant prose (not necessary explanation). Fixed ranking of fixes: punctuation/text/chunking before model parameters; keep parameters deterministic so comparisons are meaningful.

## 3. Cadence workflow

1. Write for speech: varied clauses, pronounceable acronyms, clear punctuation; spell numbers/versions/CVEs phonetically for TTS and keep a separate display string (see `editorial-standards.md`). Review every name, acronym, version, CVE.
2. Start `tts`; verify `/api/model-info` (expect SOAR, `warm-informational`, BF16, 16 steps, guidance 1.2, speaker 1.5, seed 20260829, chunk max 56).
3. **Audition before batch**: synthesize one representative hook and one dense technical sentence (POST `/tts`), save to a clearly named audition folder, probe duration, **listen**. No multi-video batch until stable.
4. Reject: robotic cadence, crackle, metallic noise/fizz, dropped/repeated words, clipped endings/consonants, excessive pauses, inconsistent voice identity, audible chunk seams, repeated prosody, uninterrupted speech lacking a thought boundary. Regenerate the affected beat **before** any heavier filtering.
5. Do not stack denoisers, reverbs or enhancers that hide the real failure. (The playbook describes conservative click removal / stationary-noise reduction / high-low-pass cleanup before loudness; the audio contract above says dry only. Resolution: dry is the contract; if a cleanup step is ever added it must be conservative, applied after confirming the raw take is acceptable, and recorded - never used to rescue a bad take.)
6. Prefer generating longer semantic chunks and keep pause trimming light so clause rhythm survives. The scene-level TTS cache fingerprint covers text, voice, model, steps, guidance, speaker scale, seed and chunk config; a meaningful change creates a new entry - never falsify or relabel cached audio, never delete the cache or start a second producer to "fix" an interrupted run.

## 4. Chunking and cache

56-word chunk cap with sentence/clause packing; `$DATA_DIR/tts_scene_cache/<script-id>/` makes interrupted runs resumable (the producer skips completed synthesis). Only one producer at a time. Per-scene boundary gaps are inserted by `concat.py` (`INTER_SCENE_GAP_SECONDS`) and also define where the music bed may swell.

## 5. Alignment and captions

- WhisperX does word alignment on the final narration timeline (GPU, in-process in the engine). Input scenes and WhisperX segments are not one-to-one: assignment uses timestamps and scene bounds.
- If WhisperX omits or structurally corrupts tokens, `align.py` builds **exact script-token timings inside each scene bound** (deterministic repair). Repaired words get a low score and the alignment stays **`needs_review`** - structural continuity without pretending confidence. Never mark it high-confidence by hand; listen and inspect captions around acronyms, proper nouns, numbers, transitions and fallback scenes.
- The alignment model is unloaded and the CUDA cache cleared after every alignment to return VRAM to dots.tts (verify if TTS later fails to allocate).
- Duration-vs-timestamp validation before proceeding; SRT/VTT export is separate from animation-sync timestamps. `captions.long.srt` is the long-form caption deliverable (Short captions are not delivered separately); export from the engine with `export_captions.py <slug> <full_script_id>` (needs the engine container + DB).
- Captions: kinetic pages with active-word emphasis, inside safe areas, not covering the evidence discussed; the active-word highlight must not make the caption band flicker. Phonetic spelled-out numbers must not leak into captions (LITMUS rule 8).

## 6. Ambient music bed (conflict recorded)

- `bgm.py` synthesises a small **project-owned** ambient library (oscillators + filtered noise; six profiles, native RMS ~0.0156 - extremely quiet); the licence manifest records unrestricted project ownership. Do not describe any third-party track as "no-copyright" without proof. (`BGM_LIBRARY_DIR` may point elsewhere.)
- Track selection hashes `niche_key:script_id` into a niche-appropriate rotation; full and Short can differ deterministically. Looped and mixed **blockwise** with SoundFile/NumPy (never a giant nested FFmpeg `volume` expression - hits the expression-parser limit on long videos). Output length must exactly equal narration; the bed must loop without discontinuities.
- **Level - current code (`duck.py`, recalibrated 2026-09-04 at the user's explicit "40% volume" request):** `duck_db=8.2` (gain while words are active, ~22% RMS ratio vs narration), `swell_db=13.2` (gain in gaps >= `INTER_SCENE_GAP_SECONDS`, ~40% RMS ratio vs narration mean RMS ~0.179), `ramp_seconds=0.25`. These are **gains applied to a very quiet raw bed, not attenuation**: the old targets "-32 dB under narration / -27 dB in swells" (the "near-subliminal ~0.4% RMS" design) measured ~-70 dBFS in the final mix - effectively inaudible - which is why it was changed. **Treat 8.2/13.2 as current**; the old skill's -32/-27 text is superseded.
- Outro: `_OUTRO_TAIL_SECONDS=1.0` padded silence + `_OUTRO_FADE_SECONDS=1.0` fade so the bed eases out instead of hard-stopping.
- Listen for: masking, tonal mismatch with the topic, obvious loop seams, distracting percussion, loud intro, music competing with the Short CTA. The bed should be felt more than noticed; if it masks any word, lower it (that is a user-adjustable level, not a gate to argue with).
- Music/effects support structure and emphasis; they never mask narration. Attribution is only required if a non-project track is ever used (descriptions' audio note: "original, deterministic ambient bed synthesized locally per script (channel-owned, no external licence required)").

## 7. Mastering, lead/tail, loudness

- Narration mastered at 48 kHz (stereo in the delivered program), no clicks, fizz, clipped words, breathless joins or unintended long silences.
- Final mux (`remotion_client.py`): `loudnorm=I=-14:TP=-1.0:LRA=11` **always runs** (forensic audits had found -20.5 to -21.3 LUFS, 6-7 dB under YouTube's reference), AAC 192 kb/s, `-ar 48000 -ac 2`; if lead/tail > 0 it adds `adelay`/`apad`.
- **Lead/tail - conflict:** the playbook says "permanent 2.0 s lead-in and 2.5 s tail-out"; the code is `PRESENTATION_LEAD_IN_SECONDS = 0.0`, `PRESENTATION_TAIL_OUT_SECONDS = 0.5` (plus the 1.0 s bed fade); LITMUS rule 1 demands 0.0 s head silence and tail <= 0.6 s. **Current = 0.0 / 0.5.** The "2.5 s" in a `pipeline.py` comment is stale. Do not re-add dead air.

## 8. Audio QA commands and thresholds

```powershell
ffprobe -v error -show_entries format=duration:stream=codec_name,sample_rate,channels -of json video.mp4
ffmpeg -i video.mp4 -af silencedetect=noise=-40dB:d=0.3 -f null -        # head: no silence_start at 0.0 ; tail silence_duration <= 0.6 s
ffmpeg -i video.mp4 -af loudnorm=print_format=json -f null -             # input_i target -14 LUFS +/- 1.5 LU
ffmpeg -i video.mp4 -af volumedetect -f null -
```
Diagnostics only - **listening remains mandatory**: opening, every difficult proper noun, two chunk boundaries, a mid-video dense scene, the Short CTA, the ending. Listen once without watching; watch once muted (both must stay understandable). Root cause class for loudness/silence regressions is a render-pipeline constant (`PRESENTATION_*` in `render/queue.py`, the `loudnorm` filter in the mux chain) - a one-line fix, not per-video.
