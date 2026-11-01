# TTS narration (dots.tts, compilation interstitials only) and the dropped Qwen3 path

Source: `research-output/dots-tts/{master-report,_numbers,_environment}.md` (researched 2026-08-29), `audio/dots.py`, `config.py` (`TTSConfig`), `config.example.yaml`, `cli.py` (`tts status|sample`),
`assets/voices/README.md`, `pyproject.toml`, decision SF-D2, test `test_dots_tts_defaults_are_quality_first`. Shared TTS infrastructure is in
[../../../references/voice-tts.md](../../../references/voice-tts.md); this file records only what is specific to ShortsFactory.

Contents: 1 Scope - 2 Decision and configuration - 3 Voice construction - 4 Runtime behaviour and cache - 5 Narration budget - 6 Validation plan - 7 Limitations and consent -
8 Qwen3 (dropped) - 9 Relationship to the shared toolkit

## 1. Scope (SF-D2)

**Shorts never use TTS** (their metadata records `shorts_tts: {enabled: false}`). dots.tts narrates only the occasional compilation foreshadow card (`compilation.md` section 3): brief, warm,
informative, identical to the written claim. Everything else keeps the clip's own audio. If you do not build compilations you do not need any of this file.

## 2. Decision and configuration

Chosen: `dots-studio/dots.tts-soar` (SOAR checkpoint; the model card calls it the highest-fidelity release for zero-shot voice cloning; MeanFlow is the latency-oriented sibling). Why SOAR: the
factory values voice consistency and quality over interactive latency (offline narration). Quality-first settings, with reasons (`master-report.md`):

| Setting (`tts.*`) | Value | Reason |
|---|---|---|
| `model` | `dots-studio/dots.tts-soar` | highest-fidelity cloning checkpoint |
| `num_steps` | **24** (allowed 10-32) | quality-first point inside SOAR's documented range; move to 32 only if listening finds artifacts |
| `guidance_scale` | **1.2** | official SOAR default; preserves text/timbre alignment |
| `speaker_scale` | **1.5** | runtime default speaker-embedding scale; changing it without controlled listening tests is arbitrary |
| `language`, `normalize_text` | `EN`, true | explicit language tag + normalisation for predictable English |
| `seed` | 42 | repeatable prosody and stable cache identity; resample other seeds only for prosody problems |
| `precision` | `auto` | BF16 on supported CUDA, FP16 on other CUDA, FP32 on CPU |
| `optimize`, `warmup_on_optimize` | true, true | repository's `torch.compile` steady-state path; ignored on CPU |
| `max_generate_length`, `vocoder_merge_steps` | 500, 4 | runtime defaults kept until real interstitial durations justify change |
| `device` | `auto` (`cuda`/`cpu` explicit allowed) | an explicit `cpu` on a CUDA machine raises: hide CUDA instead |
| `narration_volume` | 1.0 | configured, not applied by the builder (loudnorm is used) |
| `prompt_audio` / `prompt_text` | `assets/voices/warm-informational-reference.wav` + the exact transcript | continuation cloning needs the recording AND its exact text |
| `model_cache_dir`, `audio_cache_dir` | `data/models`, `data/tts` | weights and generated WAVs |

Reference numbers (`_numbers.md`): 2B parameters; 48 kHz mono AudioVAE; 10-32 NFE supported; ~10 s reference recommended; official default seed 42. Install: `uv sync --extra dev --extra tts`
(`dots.tts==0.3.1`, `soundfile`, `torch==2.9.0` / `torchaudio==2.9.0` from the cu128 index on Windows). Checks: `shortsfactory -c config.yaml tts status`, `tts sample <channel> --text "..."`;
`doctor` also tests the dependencies, the reference file and `sox` when TTS is enabled.

## 3. Voice construction

The released model has no dependable built-in "warm informational" voice; official guidance is **continuation cloning** (reference audio + its exact transcript); random voice generation is only meaningful
for a fine-tuned single-speaker checkpoint. The report also says the system was evaluated WITHOUT style/instruction control, so warmth must be captured in the reference performance, not requested in
words (the YAML `tts_instruct` strings do nothing: `synthesize()` deletes the branding argument).
Reference recording (`assets/voices/README.md`): record this exact text - "Here is the useful context. Small details often explain why a moment works, and noticing them can change how we understand what
happens next." - as one speaker, ~10 s (longer does not help), quiet non-reverberant room, no music/effects/noise/trailing silence, lossless mono WAV, saved as
`assets/voices/warm-informational-reference.wav`. **Use your own voice or a voice you have explicit permission to clone.** The WAV was never tracked; it must be recorded again. Editing the transcript
in YAML without re-recording to match makes word errors and instability more likely (official usage tips).

## 4. Runtime behaviour and cache (`DotsNarrator`)

- Lazy-loaded: ordinary Shorts processing never allocates the model. A missing reference raises `TTSDependencyError` ("Missing authorized warm informational reference") instead of silently using
  the unsuitable random-voice path. Missing packages raise with the `uv sync --extra tts` hint.
- Content-addressed output `data/tts/<sha256>.wav`: the hash covers model, language, text, reference path + size + mtime, transcript, seed, steps, guidance, speaker scale and normalisation. Repeated narration
  reuses the WAV (valid if > 1 kB). The seed is set on torch (and CUDA) before every generation; output is written to `.part` then renamed; PCM_24 at the model's sample rate (48 kHz).

## 5. Narration budget (the 5 s card)

A card lasts 5 s with 0.35 s fades, so speech has roughly 4.3 s. At normal English narration pace (about 2.5-3 words/s; arithmetic estimate, not a measured value) that is **about 11-14 words**. The archived
copy limit is 150 characters (about 25 words), and the builder trims audio to the card duration, so long foreshadows are cut off mid-sentence. Write foreshadows to the word budget, or lengthen
`interstitial_duration_seconds` (max 12) for the cards that carry narration. Spell numbers, abbreviations and names simply: the technical report flags weaker handling of foreign words, technical terms and proper names.

## 6. Validation plan (before any compilation uses narration)

Place the authorised reference. Generate five fixed sentences covering numbers, abbreviations, proper names, clause breaks and one short foreshadow. Listen for timbre consistency, warmth, word accuracy,
clipped endings, background artifacts and pacing. Keep reference and controls fixed; vary only the seed first; raise steps 24 -> 32 only if acoustic cleanliness (not prosody) is the issue.
Claude cannot hear audio: this check is a human listening gate ([../../../references/agent-principles.md](../../../references/agent-principles.md) section 8).

## 7. Limitations and consent

Zero-shot cloning misuse is named as a deployment risk by the technical report (consent-aware reference policy recommended). Voice provenance (who recorded it, consent, date, file hash) should be written next to the
WAV (the shared toolkit keeps a provenance JSON per voice, [../../../references/voice-tts.md](../../../references/voice-tts.md) section 3). Disclose a synthetic narrator in line with YouTube's altered/synthetic
content rules where it applies. Do not clone a third party's voice: the shared `warm-informational` reference in the toolkit is flagged there as a real identifiable person's voice and must not be reused for this channel.

## 8. Qwen3-TTS: the dropped path (SF-D2)

History from the decision log and test folders: early TTS experiments used Qwen3-TTS (preset speakers + a style-instruction string per channel); the work was replaced by dots.tts (research 2026-08-29), and the
final rule became "no TTS in Shorts". Evidence still in the tree: the `.pytest-tmp-qwen3*` folders left on disk, the vestigial branding fields `tts_speaker` (Aiden/Ryan) and `tts_instruct` (inferred to be Qwen3 preset
speaker names and instruction strings; not stated in the sources), and in the technews stack the Qwen3 compose service/weights removed 2026-09-03 plus an archived test asserting `TTS_BACKEND=qwen3` is rejected
([../../../references/legacy-and-removed.md](../../../references/legacy-and-removed.md) section 4b). Why dropped: the ShortsFactory decision log gives NO reason. The shared legacy note says Qwen3 was replaced by dots.tts
for quality, native pacing and reviewed synthetic voices with provenance, and the dots research adds that a reference performance (not a style string) defines the voice. (The ~4.2 GB figure belongs to the technews
stack's Qwen3 weights.) **Do not reactivate Qwen3, Chatterbox or Kokoro without an explicit owner request.**
Safe cleanup when restoring: remove the unused `tts_speaker`/`tts_instruct` fields only together with the YAML that sets them.

## 9. Relationship to the shared toolkit

`toolkit/tts-dots/` runs dots.tts as a Docker service (technews `tts` :8004, HES `tts-hidden` :8005) with different defaults (`num_steps` 16, server-side chunking, tail sentinel) and its own voices;
ShortsFactory loads the runtime in-process with 24 steps and no chunking. They disagree on `num_steps` (24 here vs 16 there) and torch pins (2.9.0 here vs 2.8.0 there): the quality-first 24 is a
ShortsFactory choice for short interstitials. **Never run two dots.tts instances or any other heavy GPU job at the same time** (one shared 16 GB GPU, [../../../references/agent-principles.md](../../../references/agent-principles.md)
section 10). If the compilation line is revived, prefer calling the shared service with a ShortsFactory-specific authorised voice over keeping a second in-process runtime - an engineering recommendation, not an owner decision.
