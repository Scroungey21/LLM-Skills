# Troubleshooting and recovery (news-explainer)

General posture: diagnose the root cause; never delete cache/rows/folders, kill unrelated processes, stack filters to hide a failure, or hand-edit provenance to force a pass.

## dots.tts will not start, or exits 137
`nvidia-smi` and inspect VRAM consumers. A local LLM (or ComfyUI/VoiceStudio/`tts-hidden`) previously held most of the 16 GB and blocked production - ask the user to unload it; do not kill unrelated processes. Start only `tts` (`docker compose -f ai-video-factory/toolkit/docker-compose.yml up -d tts`), wait through the long health start period (600 s on first boot - model download of ~4.8 GB), then read the last 100 log lines. If `tts-hidden` is up, stop it first (one GPU, one model class at a time).

## Robotic, crackling or unnatural speech
Confirm the service is dots.tts and the voice is `warm-informational`; confirm the exact reference WAV/text and provenance. Listen to the dry service output separately from the final tempo-adjusted program. Check punctuation, acronym pronunciation, sentence length, chunk boundaries (56-word cap), dropped/repeated tokens. Use deterministic seed comparisons. Do not stack denoisers, reverbs or enhancers. If the tempo makes a dense sentence uncomfortable, rewrite/split that beat before changing the global tempo (`audio-tts.md` section 2).

## Interrupted TTS run
Do not delete the cache or start a second producer. Check whether the server is still finishing the last request. The scene cache (`tts_scene_cache/<script-id>/`) lets a resumed producer skip completed synthesis. A changed model/text/setting changes the fingerprint (new entry) - verify, do not fake.

## Alignment incomplete or zero-word scenes
Inspect `engine/app/audio/align.py` (restored app) and the alignment status. The deterministic repair restores exact script tokens within scene bounds at low confidence; `needs_review` is expected after a fallback. Listen and inspect captions; never mark it high-confidence by hand. Confirm the alignment model was released afterwards so dots.tts regains VRAM.

## Long-video music mix fails or sounds wrong
Use the current blockwise `mix_background_music`; never restore the historical giant nested FFmpeg `volume` expression. Verify narration/BGM sample rates and channel conversion. Output length must exactly equal narration; the BGM must loop without discontinuities. If the bed is inaudible, remember the old -32/-27 dB design measured ~-70 dBFS - current levels are `duck_db 8.2 / swell_db 13.2` gains (`audio-tts.md` section 6).

## Loudness/silence regression (rule 1)
Measure with `silencedetect`/`loudnorm` on the final MP4. A reappearing head silence or -20 LUFS is a render-pipeline constant (`PRESENTATION_LEAD_IN_SECONDS`, `PRESENTATION_TAIL_OUT_SECONDS`, the `loudnorm=I=-14:TP=-1.0:LRA=11` filter in `render/remotion_client.py`), not a per-video bug.

## Producer appears to do nothing
It likely found existing Project/Script/Audio/Screen/RenderJob rows and reused them. Inspect `RUN_KEY`/slug, `existing_production`, `existing_audio`, `existing_render`, DB job status and package timestamps. For a new revision create a new run identity or an explicit superseding row.

## Stale container code
Source is authoritative. Rebuild `engine` and `tts` after changes (a previous session hot-patched a running container; no image should be assumed to carry a patch). `docker compose build tts engine` then `up -d`.

## Render or archive fails after MP4 completion
The queue preserves a completed raw output path so archival can retry without re-rendering. Check build JSON, source/raw-item linkage, niche/archetype, output-name collision and directory permissions. Do not discard a good raw MP4 because packaging failed. `render-cli.mjs` needs Node 22.6+ (`--experimental-strip-types`), installed renderer dependencies, and a build JSON that passes `BuildJsonSchema` (`.strict()` - unknown keys fail). Mux timeouts: `NODE_RENDER_TIMEOUT_SECONDS=1800`, `RENDER_MUX_TIMEOUT_SECONDS=600`.

## Docker port collision
Host port 8000 may be used by another project: set `ENGINE_HOST_PORT` **and** the matching `NEXT_PUBLIC_ENGINE_URL`, then **rebuild** the console (the public URL is baked in at build time; restart is not enough).

## Thumbnail failures
ComfyUI unreachable or failing -> the generator falls back to a frame from the finished render (works as designed - improve afterwards). Stop `tts` before ComfyUI. Stale subject art is impossible by design (cache keyed on the prompt hash). If the headline looks wrong, composite it explicitly (`compose_upgrade_thumbnails.py`); never trust the image model for text.

## Validator / scheduler complaints
- `schedule_release.py`: "refused ... already scheduled" = dedup guard (use `--force` only for an intentional reschedule); "no AUTHORED_EXTRAS entry" = add alt titles/hashtags/extra tags for the slug; "missing required input" = `captions.long.srt` (export it) or another core file; "no release-calendar month folder" = outside the scaffolded window.
- `validate-deliverables.ps1`: CTA mismatch -> compare with the constant byte-for-byte (case-sensitive); description missing a source URL -> regenerate the description with an `Information sources:` block; thumbnail not 1280x720 -> re-composite; the validator needs a `Pillow`-equipped `<repo>/.venv` for the thumbnail check and does not check captions.
- Uploader: see `release-and-upload.md` section 8 (stray Draft, duplicate guard, 180 s thumbnail wait, local-only idempotency).

## Prompt-registry activation returns 409
A regression run is missing/incomplete/not human-acknowledged, or the golden set changed since (baseline/coverage/content no longer current), or a gated stage lacks a matching-mode golden pair (`pipeline-and-architecture.md` section 7). Fix the cause; never edit active state directly.

## Tests and syntax checks
Run focused tests for changed subsystems and at minimum `py_compile` on touched audio modules, `docker compose config --quiet`, and the engine pytest suite proportionally. Preserve unrelated failures and report them rather than rewriting broad areas.
