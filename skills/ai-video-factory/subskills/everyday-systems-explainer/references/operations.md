# Operations runbook (commands, services, scheduling, recovery)

Contents: 1 Conventions and the path-constants warning · 2 Preflight · 3 Narration services (OmniVoice, dots.tts, GPU rule) · 4 The production commands ·
5 Authoring a topic · 6 Audio and visual QA · 7 Tests · 8 Release calendar, ledger, scheduling · 9 Uploaders · 10 Gameplay, photos, music libraries · 11 Recovery and safety

All commands are PowerShell on the Windows host. Never recurse blindly over `output/`, `release-calendar/`, `backup/`, `examples/`, `renderer-public/`, `node_modules`, `.venv`.
Never publish, upload, delete archived assets, kill unrelated processes (the owner's own Blender jobs share the GPU: never touch or run alongside them) or overwrite user work without authorisation.

## 1. Conventions and the path-constants warning

- Python: `<repo>/.venv/Scripts/python.exe` (`$py` below). Run channel scripts from `hidden-everyday-systems/` (the scripts and topic files assume it: `ROOT` for topic files is that folder; `hidden_systems_production.py` derives the repo root as its parent).
- Tools (machine-specific, the real location is the point): `C:/bin/ffmpeg.exe`, `C:/bin/ffprobe.exe`. Gameplay drop folder `H:\Videos\BR-BG`.
- Renderer: Remotion 4.0.499 project source at `ai-video-factory/toolkit/renderer/` (install deps first); the channel's compositions live in `hidden-everyday-systems/visual-system/` (`index.tsx` registers `GhostSystem3-long|short|thumbnail`); channel render media (fonts, textures, gameplay clips, approved art, per-slug narration mp3, music) is `hidden-everyday-systems/renderer-public/` (`hidden-systems/...`, `music/`).
- TTS stack: `ai-video-factory/toolkit/` (docker-compose.yml, tts-dots/, voicestudio/).
- **Path constants were repointed in 2026-11** (the channel scripts now use the new layout): `hidden_systems_production.py` (`PUBLIC`/`PUBLIC_DIR`/`MUSIC_DIR` -> `hidden-everyday-systems/renderer-public`, `REMOTION` -> `hidden-everyday-systems/node_modules/@remotion/cli`, `FRAME_RENDERER`/`ENTRY` -> `ai-video-factory/toolkit/renderer`, `HOUSE_REFERENCE` -> `ai-video-factory/toolkit/tts-dots/voices`), `visual-system/{render-frames,preview,v3/render-stills}.mjs`, `ingest_gameplay_clips.py`, the 3D compose/gates/thumb scripts (font paths) and the experiments pipeline. Originals are not kept in the repo; if a path error appears, grep for `renderer/public`, `tts-dots/` or `engine/.venv` first.
- Still hard-coded by design: `production-batches/2026-09-19_26/fetch_photo.py` uses an absolute `H:\Projects\YTtechnews\hidden-everyday-systems` (derive from `__file__` if the repo moves); `.env` (repo root) holds `VOICESTUDIO_API_KEY` (never print or copy it).
Check these first on any "file not found" or "silent empty render".

## 2. Preflight (read-only)

```powershell
# (run from the repo root)
& "ai-video-factory/scripts/preflight.ps1"        # shared environment/channel check
nvidia-smi
docker compose -f ai-video-factory/toolkit/docker-compose.yml ps -a
Invoke-RestMethod http://127.0.0.1:3900/health     # VoiceStudio (OmniVoice)
```
Run before expensive generation. The 16 GB card is shared by `tts`, `tts-hidden`, VoiceStudio, the owner's own Blender/TTS jobs and any chat-story TTS container: identify consumers first, ask the owner to unload rather than terminating anything. `docker compose ps --status running --format '{{.Service}}'` shows what is up.

## 3. Narration services

**Provider selection:** `HIDDEN_SYSTEMS_TTS_PROVIDER` = `omnivoice` (default since 2026-10-05) or `dots`. Packages must still carry `voice.preferred_provider: "dots"` (a schema label; `generate_audio` refuses otherwise) and `voice_id hidden-systems-informational`, base `seed`. Never mix two voices in one video; the cache key (engine + reference audio hash + base seed + narration sha256) re-narrates every scene on a provider switch. The 3D line uses different voices (o1 for Shorts, vm5 for longs, through a voice lock): see `references/production-3d.md`.

**OmniVoice via VoiceStudio (default).** (Docker commands in this section: from the repo root; from `hidden-everyday-systems/` use `..\ai-video-factory\toolkit\docker-compose.yml`.) `docker compose -f ai-video-factory/toolkit/docker-compose.yml --profile voicestudio up -d voicestudio` (image `ghcr.io/debpalash/voicestudio:0.5.6`, ~17 GB; API/UI `http://127.0.0.1:3900`, loopback only; Bearer `VOICESTUDIO_API_KEY` from the repo `.env`; stop with `... stop voicestudio` when done; `POST /system/flush-memory` unloads models). `omnivoice_model_info()` requires `GET /engines/tts` -> `active == "omnivoice"` (retries 4x, 10 s apart: the server answers slowly while generating) - if another engine (e.g. voxcpm2) is active, restore omnivoice before running. Each scene: clone of `tts-dots/voices/hidden-systems-informational.wav` with its `.txt` transcript, multipart `POST /generate` with `language en, speed, seed, num_step 32, effect_preset raw, denoise true`; the take is converted to 24 kHz mono WAV; accepted only at 165-240 WPM; out-of-window takes steer `speed` toward 215 WPM (clamped 0.8-1.15) and retry seeds base+{0,97,211,509,731,1009,1301,1597}; failure raises "No natural-cadence OmniVoice take passed". Known issues: a generate call can hang ~300 s on an internal lock while a sidecar install runs (restart the container after installs); first call to an engine loads weights (minutes on a shared GPU); IndexTTS 2.5 OOM-kills the container on this host (never select it); install more engines only from inside the container's loopback, one at a time. **Licence:** OmniVoice weights are CC-BY-NC (non-commercial); the owner (2026-10-12) prefers a commercial engine (VoxCPM2, Apache-2.0) for new voices. The code sends `denoise:"true"`, which contradicts the older "no denoising" invariant: unresolved, flagged (see `architecture.md` register).

**dots.tts SOAR (fallback; `HIDDEN_SYSTEMS_TTS_PROVIDER=dots`).** Service `tts-hidden` (profile `hidden-systems`, host port **8005**; `HIDDEN_SYSTEMS_TTS_BASE_URL` overrides): `docker compose -f ai-video-factory/toolkit/docker-compose.yml --profile hidden-systems up -d tts-hidden`; wait for health (start period up to 600 s) then `Invoke-RestMethod http://localhost:8005/api/model-info` and confirm backend `dots.tts`, voice `hidden-systems-informational`, native pacing true, post-generation speedup false, chunk max words 12, and a `reference_sha256` (the audio cache refuses to run without it). Engine: dots.tts 0.3.1, model `dots-studio/dots.tts-soar`, Torch/Torchaudio 2.8 CUDA 12.8, BF16, 16 Euler steps, CFG 1.2, speaker scale 1.5, deterministic seeds, sentence/clause-aware chunks <=12 words (SOAR truncates at ~500 patches ~8 s), 40 ms safety gaps, boundary silence trimmed keeping 100 ms, 48 kHz mono PCM24 WAV, no effects/time-domain manipulation; headers certify backend/native-pacing/post-speedup; every call appends a generation-tail sentinel (fix for an under-articulated last word). `delivery` is sent as `hook|standard` but the server ignores it. Seeds tried: base + 16 offsets (0, 97, 211, 509, 731, 1009, 1301, 1597, 1901, 2203, 2609, 3001, 3407, 3803, 4201, 4603). Exit 137 during load = GPU/host memory pressure: check consumers first. Rebuild so the image bakes the validated reference: `docker compose ... build tts-hidden` then up and recheck `/api/model-info` + sha. Never start the shared `tts` service for this channel's voice. Shared-file rule (from the technews/HES split, still the right habit): `tts` (port 8004) and `tts-hidden` share `tts-dots/server.py`, which reads its accepted voice id from `DOTS_TTS_VOICE_ID` - never hard-code a voice id back into it; edit only the `tts-hidden` block of the compose file for this channel's TTS parameters; the technews files `warm-informational.wav/.txt/provenance.json` are never touched, replaced or deleted.

**Hard GPU rule (COORDINATION-NOTE, durable):** `tts` and `tts-hidden` must never run at the same time (each loads a full SOAR model; running both OOM-killed one container, exit 137, three times in a 2026-09-03 collision). Before starting either, confirm the other is stopped. A project-scoped command without the profile (`down`, `up --remove-orphans`, `restart`) legitimately reaps a profile-gated container as an orphan: for a long batch use `docker compose run --rm` (one-off container) or a plain `docker run` outside the Compose project, which is immune. Per-scene audio cache is voice/seed/narration-aware, so a killed batch resumes safely; wait for an in-flight server request rather than restarting, unless no needed client remains.

**Voice provenance (dots house voice):** `toolkit/tts-dots/voices/hidden-systems-informational.wav|.txt` + `hidden-systems-informational-provenance.json`. History: 2026-09-02 a dots self-bootstrapped reference (no prompt audio) reviewed for native pacing, F0 distinctness from technews' voice, ASR round trip and clone-degeneration probe; rejected on listening ("annoying"/wrong register); 2026-09-03 replaced at the owner's request by a voice the owner already uses for another project (`technews/output/voice-review/cloned-warm-informational-v2.wav`), making the HES and technews voices deliberately identical (archived v1 at `tts-dots/voices/archive-hidden-systems-v1-dots-self-generated-20260901/`, never delete). Any replacement needs the same review discipline (native-pacing gate, ASR round trip, clone-degeneration probe, listening) and the technews files `warm-informational.*` must never be touched. 2026-10-12: the owner rejected all nine round-1 OmniVoice candidates (`experiments/voice-v2/`) and wants a young, energetic but warm voice, not high-pitched like the current house voice; voice experiments are in `experiments/voice-v2/` and `experiments/voice-ab/` (full-video A/B where OmniVoice won "infinitely better").

## 4. The production commands (from `hidden-everyday-systems/`)

```powershell
$py = "..\.venv\Scripts\python.exe"
& $py production-batches\<batch>\topics\<topic>.py            # build + gate one topic; prints "valid", writes examples\<slug>\package.json
& $py hidden_systems_production.py preview --slugs <slug>      # silent proof stills (no TTS), contact sheets, thumbnail still
& $py hidden_systems_production.py preview --slugs <slug> --thumbnail-only
& $py hidden_systems_production.py audio --slugs <slug> [--force]   # per-scene narration -> render.*.json, captions
& $py production-batches\<batch>\topics\<topic>.py            # re-run so follow-highlights and arrow timing use real word timings
& $py hidden_systems_production.py validate --slugs <slug>     # (validate always covers every package)
& $py hidden_systems_production.py render --slugs <slug>       # long, clean Short, gameplay Short, thumbnails, delivery files, QA-REPORT.json
& $py hidden_systems_production.py remix --slugs <slug>        # new soundtrack on existing frames, then delivery + QA
& $py hidden_systems_production.py rethumb --slugs <slug>      # new title/thumbnail text and both thumbnails, no re-render
& $py hidden_systems_production.py all                         # audio, validate, render, validate
```
- `--slugs a,b,c` scopes `audio`/`render`/`preview`/`remix`/`rethumb`; `validate` always covers every package and rewrites `output/catalog-order.json` (the canonical topic order the uploader tools use; never derive order from file mtimes).
- Packages are discovered from `examples/*/package.json` with `visual_system` in (`causal-v2`, `causal-v3`); a new v3 package needs no registration. v3 audio/thumbnails stage the licensed thumbnail photo (sha-verified) into the render public dir first.
- `audio --force` regenerates existing scene parts; never hand-edit provenance. Start the voice service first; run one producer at a time (generation lock); the full batch is long: run it detached with stdout/stderr logs if the session may be interrupted, and check for an existing producer first.
- Do not render, narrate or schedule from an authoring/research task; the lead narrates through one queue.
- v2 frozen commands: `pipeline-versions/v2/` holds the v2 script; v2 packages still build with the current script ("`render` routes causal-v2 packages through the production causal renderer").
- Wording bug to remember: some old error text said "190-260 WPM"; the real gate is 165-240.

## 5. Authoring a topic (checklist; rules in `editorial-and-quality.md`)

1. Pick the subject (`topic-selection.md`), repeat-check, one-sentence promise.
2. Research real references; write `production-batches/<batch>/references/<slug>/REFERENCE.md` with a DRAWING SPEC.
3. Write `production-batches/<batch>/topics/<file>.py` modelled on `production-batches/2026-09-19_26/topics/inside_an_escalator.py`: `Package(slug=, topic=, title=, short_title=, alternate_titles=[3], hook_line=, short_hook_line=, search_line=, accuracy_scope=, next_tease=, seed=, tags=[...], revision="3.5")`, `source`, `claim`, `term`, diagrams, `chapter`, `scene` (long then Short), `materials`, `structures`, `sound`, `music`, `thumbnail(..., photo=True)`, then `P.check()` / write.
4. `python <topic>.py` until `valid`; prove gates bite; `preview`; review every still; fix; repeat.
5. Narration (lead): `audio --slugs`, re-run topic, `validate`.
6. `render`, inspect the frame sequences and Short sheet, listen (human), then schedule and hand to the owner.
Batch layout precedent: `production-batches/2026-09-19_26/` (REDO-BRIEF, 16 topics) and `2026-10-06_22/` (BRIEF, PACING, REPACE, `batch.json` with 34 subjects: slug, file, question, release slot, old_slug/old_package/angle, music, next tease; helper scripts `plan.py`, `narrate_queue.ps1`, `render_queue.ps1`, `framesheet.ps1`, `schedule_remasters.py`).

## 6. Audio and visual QA

```powershell
& "C:/bin/ffprobe.exe" -v error -show_streams -show_format <file>
& "C:/bin/ffmpeg.exe" -hide_banner -i <file> -af volumedetect -f null NUL
& "C:/bin/ffmpeg.exe" -hide_banner -i <file> -af silencedetect=noise=-45dB:d=0.15 -f null NUL
& "C:/bin/ffmpeg.exe" -hide_banner -i <file> -af loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json -f null NUL
```
`QA-REPORT.json` automates dimensions, fps, codecs, duration, cadence, loudness/true peak, music credit, music/sfx-under-voice. Silence between scenes should be clean and evenly spaced (~scripted gaps), no mid-sentence dead air. Visual QA = `preview` stills and contact sheets (`output/<slug>/preview/{long,short}/*.jpeg`, `sheet.long.jpg`, `sheet.short.jpg`, `thumbnail/`), then post-render frame sequences 0.25-0.6 s apart at every state change and followed step (extract with ffmpeg) plus the Short's sheet. Use a viewer that really shows pixels. Check frame zero, every scene boundary, vertical safe areas, caption behaviour, headline-free stage, thumbnails at 168x94.

## 7. Tests (from `hidden-everyday-systems/`)

`& $py -m pytest tests -q` or `& $py -m unittest discover -s tests -v`. Files: `test_pipeline_v3.py`, `test_metadata_format.py`, `test_thumbnail_text.py`, `test_visual_contract.py`, `test_batch_schedule.py` (Python); `test_batch_mechanisms.cjs`, `test_delivery_selection.mjs` (Node). v2 wiper linkage tests sample 1,000 states. Type-check the Remotion code independently with the existing TypeScript compiler.

## 8. Release calendar, ledger, scheduling

- Layout: `release-calendar/<YYYY-MM>/<DD>/<slug>/upload-manifest.json` + the delivery files. A day folder gets a trailing ` (x)` once it holds the full daily target (2 ready subjects for 2D from 2026-09-13; `DAILY_TARGET = 2`); `refresh_day_marker` renames it. The Release Catalog desktop app (`release-catalog/`) reads this layout.
- (from `hidden-everyday-systems/`) `python release-calendar/schedule_release.py <slug> YYYY-MM-DD HH:MM [--force]`: copies the delivery subset (v3: `pipeline_v3.DELIVERY_FILES` + `THUMBNAIL_LICENSE.txt` when a photo exists; fails "missing expected delivery file" if any is absent, e.g. `thumbnail2.png`), recomputes sha256 fresh, writes `upload-manifest.json` (slug, chosen_title, files, `scheduled_time_morocco`, `status ready_to_upload`, `voice_id`, `source_of_truth`, `drift_check`, `sha256`, and for v3 `pipeline_version`, `metadata_format`, `short_title`, `short_variant gameplay-summary`, `short_related_video long`, `qa_report`, `human_listening_required true`, `brainrot_provenance`), updates `LEDGER.json`, refreshes the ` (x)` marker. Rescheduling a slug removes its stale copy from the old day. From 2026-09-13 the time must be `02:00` or `17:00`, and a third subject on one day or a duplicate slot is refused (earlier dates also allowed `11:00`; the argparse check lists 02:00/11:00/17:00). Re-run it after any re-render: the manifest hashes are not live.
- Slot rationale (`LEDGER.upload_time_recommendation`, an [INFERENCE] not channel analytics): 02:00 Casablanca = 9 PM EDT / 6 PM PDT previous day (US evening prime time); 17:00 = 12 PM EDT / 9 AM PDT. Timezone `Africa/Casablanca` (UTC+1 year-round except Ramadan; override `RELEASE_TIMEZONE`).
- `LEDGER.json` schema: top level `schema_version, purpose, channel "GhostSystem", cadence (text), entries[], upload_time_recommendation{note, timezone, slot_1, slot_2}`; entry `slug, topic, package_dir, output_dir, voice_id, release_date, release_time_morocco, status ("scheduled"), pipeline_version ("v3"/"3d"), assets{long, short, short_brainrot (v2), thumbnail, thumbnail_real_photo}`; older entries also carry `voice_regenerated`. **Topic-repeat check:** before choosing a subject read the ledger's slugs/topics AND `examples/` AND the 3D items (a new slug alone proves nothing; see `topic-selection.md`). All statuses read "scheduled": the ledger does not show what is live. Back up the file before hand-editing (`git diff` shows it modified by tools; it holds irreplaceable scheduling state; do not copy its data into docs).
- The 3D line schedules with `production-3d/schedule_3d.py` (items have no 2D `package.json`; times 17:00 Shorts / 20:00 longs, which `schedule_release.py` would reject). See `references/production-3d.md`.

## 9. Uploaders (both are owner tools; never run them without the owner asking)

**Live: `release-calendar/youtube-uploader/`** (puppeteer-core, persistent Chrome profile `.chrome-profile`; deliberately not the YouTube Data API, because a fresh API project can only upload privately until it passes Google's compliance audit). `node login.mjs` (sign in once) then `node upload.mjs --dry-run --date YYYY-MM-DD [--date ...]` (prints the full resolved plan: title, descriptions, tags, file paths, schedule - no browser) and `node upload.mjs --date YYYY-MM-DD [--slug <slug>] [--no-pause]`. For each date it needs **exactly two LEDGER entries** (it throws otherwise, so 3D days with 1 or 3 entries do not fit); orders them by `release_time_morocco`; uploads long then Short; v3 topics (manifest `pipeline_version: "v3"`) upload the long (thumbnail, playlist "Life's Questions Answered", category Education, not made for kids, compliance defaults) and ONE Short (`short_title`, `description.short.txt` with the long URL filled in, best-effort Related video = the long); pauses before the final Schedule click unless `--no-pause`; idempotent through `<day>/<slug>/upload-state.json` (variant -> videoId/url/scheduledFor/uploadedAt). v2 manifests would also upload the plain Short and a brainrot Short 4 hours after the slot with its own title. Studio selectors are fragile: rehearse the first run.

**Older: `hidden-everyday-systems/uploader/`** (Firefox + Puppeteer BiDi, because Google's sign-in blocks Chromium launched with the automation flag): `node src/cli.js login | sync | plan [--sync] [--start] | run [--start --end --rehearse --dry-run] | channel-settings [--rehearse]`; it assumes the v2 flow (brainrot Short first, normal Short +15 min), state in `output/release-calendar/<YYYY-MM>/<DD>/day-plan.json` and topic order from `output/catalog-order.json`. Its README describes the pre-v3 process; treat it as legacy except `channel-settings` (keywords/upload defaults, never exercised live). Neither tool was ever validated unattended against a live Studio session; the owner has been uploading by hand ("the user uploads; the ledger is not proof of what's live").

## 10. Libraries

- Music: `examples/music-library.json` schema 1.1: `selection`, `mix_policy {relative_volume .13, fade_in_seconds 1.5, fade_out_seconds 2.0, reference_lufs -18, processing{highpass_hz 150, highpass_stages 2, speech_dip{hz 1500, octaves 2.5, db -6}, duck{threshold .05, ratio 2.5, attack_ms 60, release_ms 600, knee 6}}}`, `tracks[]` (`id, title, creator, file, source_url, download_url, license "CC BY 4.0", license_url, attribution (verbatim credit), content_id (stance), trim_seconds [start, end], integrated_lufs, loudness_range_lu, gain_db`), `rejected[]`. Active ids: floating-cities, dream-culture, new-direction, groove-grove, castles-in-the-sky, clean-soul, cylinder-five, cherry-blossom, numinous-shine, space-1990, silver-flame, slow-lights (12; creators Kevin MacLeod, Scott Buckley, Chris Zabriskie, Lee Rosevere). Rejected: jellyfish-in-space. Audio files live in `renderer-public/music/` (cut beds cached as FLAC under `output/.music-beds/`). Rotation `tracks[PILOTS.index(slug) % len(tracks)]` is not stable under inserted topics: pin with `P.music(id)`.
- Gameplay: see `shorts-and-brainrot.md` (`examples/gameplay-library.json`, `ingest_gameplay_clips.py`).
- Thumbnail photos: `metadata-and-thumbnails.md` (`assets/thumbnail-photos/`, `commons_search.py`, `fetch_photo.py`).

## 11. Recovery and safety

- Stale `render.*.json` or provenance (retired provider, non-native pacing) -> regenerate with `audio --force`; never edit provenance by hand.
- `validate` fails on narration digest mismatch after a script edit -> regenerate that scene's audio.
- Dirty worktree: preserve every unrelated change; no broad resets, cleanups, reverts, or `git` operations that touch other channels.
- Do not delete old TTS directories, asset archives or `backup/` merely to claim replacement; runtime selection and validated output decide what is active.
- Exit 137 on a TTS container: GPU pressure or an external kill; see section 3. A plain `docker run` of the already-built image (reusing the model-cache volume) avoids orphan reaping.
- v3 Shorts can outlast the shortest gameplay clip: the composite loops the clip (`-stream_loop -1`), expect a possible seam with the 54.5 s clip.
- Chat-stories (`hidden-everyday-systems/chat-stories/`, its own TTS on port 8006 and MCP config `.mcp.json`) is a separate sub-project sharing the GPU; not part of this pipeline.
- Original docs are recoverable: `git show pre-skill-reduction:<path>`.
