# Production runbook (news-explainer)

Commands assume PowerShell at the repo root (translate syntax for another shell, keep semantics). Two modes:
- **A. Lean (no app restore):** the agent researches/writes scripts, uses the toolkit `tts` service for narration and the toolkit Remotion project for render; steps marked [app] below are done by hand or skipped.
- **B. Full (restore the app from `pre-skill-reduction`, see `pipeline-and-architecture.md` section 10):** the engine automates the [app] steps.
Either way the gates, invariants and package layout are identical.

## 0. Pre-flight

```powershell
pwsh -File ai-video-factory/scripts/preflight.ps1
nvidia-smi                                  # local LLM / ComfyUI / VoiceStudio may hold VRAM - ask the user to unload, never kill
docker compose -f ai-video-factory/toolkit/docker-compose.yml config --quiet
```
Never expose `.env` values in logs - only check whether required keys are populated. The user authorised Docker commands for the YTtechnews scope only (not unrelated containers/processes); uploading/publishing is a separate authorisation.

## 1. Research and production definition

For each topic: collect authoritative sources, write a claim/qualification outline *before* narration (see `editorial-standards.md`), check the ledger for repeats. A production definition (the old `PRODUCTIONS` list entry in `engine/produce_test_videos.py`) contains:

`slug`, `run_key`, `niche_id`, `source_url` (+ optional `source_urls[]`), `source_title`, `title`, `short_title`, `description` (ends with `Primary source:\n<url>`), `short_description`, `tags[]`, `thumbnail_prompt` (ends `exact headline TEXT.`), `include_evidence`/`evidence_beat`, optional `gif_experiment`/`gif_beat`, `full[]` and `short[]` beat lists (shape in `pipeline-and-architecture.md` section 6). The Short list is ~5 beats ending with a `chapter-card` whose narration is the CTA constant; a helper appends `Information sources:` + URLs to any description missing a source URL, and derives the thumbnail headline from the prompt.
Reviewed example topics (all in `technews/output/test-productions/`): cyber-plc-ai-attacks (33-scene beginner-depth cyber exemplar, 1 GIF + evidence card), gemini-3-7-flash (AI/ML model-card exemplar), garmin-fenix-9-pro (consumer exemplar).

**Run identity:** the producer is resumable and *discovers and reuses* matching DB rows, audio, screens and renders (`existing_production`, `existing_audio`, `existing_render`). For a genuinely new run or a text revision use a **new `run_key`** (or a normal API-created project) - changing text under the same run identity causes confusing reuse. Never delete DB rows or delivery folders to force regeneration; implement a superseding revision. `package()` has no idempotency guard: running the full list re-copies files, regenerates thumbnails and rewrites metadata for every entry (the demo driver `produce_demo_video.py` filters to exactly one slug for that reason) - scope runs to the slug you mean.

## 2. Script -> GATE 1

Write/revise full + Short scripts, run the cue/limit checks (manifests), fact-check against the ledger, then present for human approval. Scripts must be approved before audio generation. Re-verify unstable facts right before audio.

## 3. Start narration and audition

```powershell
docker compose -f ai-video-factory/toolkit/docker-compose.yml up -d tts      # first boot: minutes (model download); healthcheck start_period 600 s
docker compose -f ai-video-factory/toolkit/docker-compose.yml logs --tail 100 tts
Invoke-RestMethod http://localhost:8004/api/model-info | ConvertTo-Json -Depth 5
```
Expect SOAR / `warm-informational` / BF16 / 16 steps / guidance 1.2 / speaker 1.5 / seed 20260829 / chunk max 56. POST one representative hook (and one dense technical sentence) to `http://localhost:8004/tts` (`{"text","voice_id":"warm-informational", ...}`), save under a clearly named audition folder, probe, **listen**. No batch until stable. Never start `tts-hidden`/VoiceStudio/ComfyUI at the same time.

## 4. Audio, alignment, screens, render [app]

Full mode (inside the engine container; only ONE producer at a time):
```powershell
docker compose build tts engine ; docker compose up -d tts engine ; docker compose ps     # rebuild after any source/config change; do not trust a stale/hot-patched image
docker compose exec engine python /app/produce_test_videos.py                              # resumable: cached per-scene TTS, existing rows/renders reused when valid
```
For long runs use the harness's background-process facility (or `Start-Process -WindowStyle Hidden` with separate stdout/stderr logs and a recorded PID); do not launch a duplicate producer because a client stopped waiting. Set `NARRATION_TEMPO` explicitly in the environment (`audio-tts.md`).
Monitor: `docker compose logs --tail 120 engine` / `tts`, `docker compose ps`, `nvidia-smi`. Look for per-scene cache hits, audio completion, alignment status (`needs_review` is expected after repair), screen generation, Remotion progress, FFmpeg mux completion, the archive path, and package `[done]` lines.
Lean mode: synthesize each scene with `/tts`, concatenate with the inter-scene gap, apply `atempo`, loudness/mux with the exact FFmpeg settings in `visual-rendering.md` section 8, build a CIS build JSON, render with `render-cli.mjs`, and keep the same filenames below.

## 5. Captions, thumbnail, metadata, package

- Captions (full video only): `docker compose run --rm --no-deps engine python3 export_captions.py <slug> <full_script_id>` copies the latest alignment SRT to `/output/test-productions/<slug>/captions.long.srt` (needed by `schedule_release.py`).
- Thumbnail (needs ComfyUI up; stop `tts` first): `python3 generate_thumbnail_for_slug.py <slug> "<HEADLINE>" "<thumbnail prompt>"` (inside the engine container) writes `thumbnail.png`; `compose_upgrade_thumbnails.py` composites exact headlines (`SPECS` dict) over `thumbnail-background.png`; `backfill_thumbnail_captions.py <slug>...` re-runs only the thumbnail+caption step of `package()` for already-rendered productions without touching audio/render bytes.
- Every `technews/output/test-productions/<slug>/` package must contain: `video.mp4`, `short.mp4`, `meta.json`, `thumbnail.png`, `full-script.json`, `short-script.json`, `captions.long.srt` (for scheduling), and `thumbnail-background.png` when used. Reviewed contact-sheet QA stills are kept in `technews/output/test-productions/_qa/`.
- `meta.json` schema: `schema_version`, `generated_at`, `project{id,slug,theme}`, `video{script_id,render_job_id,file,title,description,tags,media{duration_seconds,size_bytes,video{codec,width,height,frame_rate},audio{codec,sample_rate,channels}}}`, `short{script_id,render_job_id,file,title,description,cta,media{...}}`, `thumbnail{file,generation_prompt_summary}`, `sources[{title,url,type}]`, `fact_check{status,cutoff}`. It must include titles, descriptions, tags, media probes, CTA, thumbnail provenance summary, sources array and fact-check status; both descriptions carry source URLs.

## 6. Validate and inspect -> GATE 2

```powershell
pwsh -File ai-video-factory/scripts/validate-deliverables.ps1 -OutputRoot technews\output\test-productions -Slugs <slug>
```
Automated validation cannot approve creative quality - then do the listening/frame inspection and the LITMUS rules in `qa-release.md`. Present clickable paths, runtimes, resolutions, codecs, source coverage, review flags. Human Gate 2 approval.

## 7. Release staging

Place the approved package on the calendar with `schedule_release.py` (`release-and-upload.md`). Do not move or delete the canonical production package unless asked. The engine's `ensure_release_calendar` only scaffolds empty day folders under `technews/output/release-calendar/` (non-authoritative).

## 8. Stop or leave running

Do not stop services automatically if another run is planned. To free VRAM: confirm no generation/alignment/render is active, then `docker compose -f ai-video-factory/toolkit/docker-compose.yml stop tts` (original stack: `docker compose stop tts engine`). Never stop unrelated containers or local-model processes.
