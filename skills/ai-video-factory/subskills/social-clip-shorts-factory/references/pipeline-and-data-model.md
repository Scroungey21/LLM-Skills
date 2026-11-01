# ShortsFactory pipeline, state machine and data model

Source: archived `ShortsFactory/` (tag `pre-skill-reduction`), read 2026-11-01: `orchestrator.py`, `database/models.py`, `config.py`,
`sources/adapters.py`, `analysis/dedupe.py`, `filtering/quality.py`, `scheduling.py`, `skills/.../architecture.md`. Where the prose
and the code disagree, the code order is written first and the conflict is named. Paths below are relative to `ShortsFactory/`.

Contents: 1 Boundary - 2 Stage order (code order) - 3 Clip state machine - 4 Tables - 5 Config schema - 6 Source adapters and sidecars -
7 Dedupe numbers - 8 Quality filter - 9 Output contract - 10 Scheduling math

## 1. Boundary (owner decisions SF-D7, SF-D8; see `decision-log.md`)

- **In:** media the OWNER supplies into a local inbox (default `G:\Videos\Instagram`, nested creator/batch folders OK) plus optional
  sidecars `<file>.json` (rights/source) and `<file>.context.json` (creator context). The app does not fetch social clips.
- **Out:** edited, QA-checked, metadata-paired, permission-labelled videos under `output/`. The OWNER uploads (default
  `youtube_upload_enabled: false`). The factory owns everything between: ingest, dedupe, watching/analysis, safety filter, routing,
  editing, metadata, QA, packaging, memory, compilation.
- **Honest caveat:** the archived code still contains network fetchers (`Pipeline._obtain` GETs `clip.source_url` when no local file exists;
  Reddit / YouTube-search / RSS / manifest-URL adapters; `examples._download`). They contradict SF-D4/SF-D7 and are only safe because
  social rows without `local_path` or `media_url` stay `discovery_only`. Do not extend them; see `current-state.md` gap G6.

## 2. Stage order as the code runs it (`Pipeline.process`)

Per clip, in this order. Each gate fails closed (clip gets a terminal state + `rejection_reason`; later stages never see it).

| # | Stage | What happens | Gate / numbers | State after |
|---|---|---|---|---|
| 0 | discover | adapters list candidates -> `Clip` rows, skipped when `canonical_url` already exists | URL uniqueness | `DISCOVERED` |
| 1 | obtain | use `local_path` if it exists, else download | stock adapters (`pexels`, `pixabay`) raise `ValueError` | - |
| 2 | probe | ffprobe duration + streams; `has_original_audio` | - | - |
| 3 | dedupe | SHA-256 + temporal dHash sequence vs every stored fingerprint (section 7) | exact hash, or similarity >= **0.92** | `DUPLICATE` (+`duplicate_of_id`) |
| 4 | analyse | ONE structured judgement: summary, subjects, categories, tags, 8 scores, per-channel fit, harm filter (`llm-layer-method.md`); cached by `provider:religious-harm-v1:<sha256>` | cache hit skips the model | - |
| 5 | safety gate | `blocked` and `confidence >= 0.85` -> audit line, then guarded deletion (`rights-and-safety.md` section 4) | **0.85** (`content_safety.deletion_confidence_threshold`, allowed 0.5-1) | `FILTER_REJECTED` |
| 6 | rights gate | `evaluate_rights` (`rights-and-safety.md` section 1); not `can_edit` -> stop | `non_commercial` / `no_derivatives` / `prohibited` | `RIGHTS_REJECTED` |
| 7 | audio gate | `audio.require_original_audio` and no audio stream -> reject | default true | `FILTER_REJECTED` ("source has no original audio") |
| 8 | quality filter | section 8 | thresholds below | `FILTER_REJECTED` |
| 9 | route | `route_clip`: fit >= channel `fit_threshold` (default 0.65), diversity penalty (`routing-and-channels.md`) | no channel over threshold -> reject | `ChannelAssignment` row |
| 10 | quota | channel already has `shorts.max_per_day_per_channel` (default 8) outputs for target day | quota full | `ASSIGNED` (waits) |
| 11 | length | `end = min(duration, 60.0)`; `end < 3` rejects ("clip too short") | 3 s - 60 s | `FILTER_REJECTED` |
| 12 | segment | one `Segment` row 0..end, rationale "complete grounded demo segment" | **segment selection is not implemented** (gap G5) | - |
| 13 | copy | `generate_copy`: 3-5 on-screen options + title/description/tags (`llm-layer-method.md`) | claim must be grounded | - |
| 14 | render | `render_short` to `.<n>.rendering.mp4`, then QA (`rendering-formats.md`) | QA: 1080x1920, audio stream, size >= 10,000 B | fail -> `QA_FAILED`, temp deleted |
| 15 | package | atomic rename to `<n>.mp4`, write `meta<n>.json`, `GeneratedShort` row, `source-files.json`, next-day manifest | number = max existing + 1, never overwrite | `PENDING_REVIEW` |

The loop stops when EVERY active channel is at quota (`if all(count >= max ...) break`), so LLM spend is bounded by the daily quota.
`missing_by_channel` reports shortfalls: **quotas are never filled by lowering thresholds** (README, SF-D7).

**Order conflict.** `architecture.md` lists rights BEFORE analysis (steps 3-4); the code runs rights AFTER analysis and the safety gate. Written as
code order. Trade-off if you reorder: checking rights first saves model spend on `prohibited` clips but leaves harmful prohibited clips
undeleted in the inbox. Decide explicitly; do not swap silently.

## 3. Clip state machine (`ClipState`) and review state (`ReviewState`)

`ClipState` has 18 members; the code only ever SETS nine of them. Treat the others as reserved names, not behaviour.

| Set by code | Meaning |
|---|---|
| `DISCOVERED` | default on insert; also re-queued input |
| `DUPLICATE` | exact or near duplicate of an earlier clip |
| `FILTER_REJECTED` | safety gate, no audio, quality filter, no channel fit, too short |
| `RIGHTS_REJECTED` | explicitly restricted rights |
| `ASSIGNED` | routed but the channel quota was full; picked up again next run |
| `QA_FAILED` | render QA failed, or reviewer chose "revision required" |
| `PENDING_REVIEW` | rendered, waiting for a human decision |
| `APPROVED` / `REJECTED` | review decision (set by `approval.service.decide`) |

Declared but never set: `RIGHTS_PENDING`, `DOWNLOADED`, `ANALYZED`, `RENDERED`, `UPLOADING`, `SCHEDULED`, `PUBLISHED`, `COMPILATION_ELIGIBLE`,
`COMPILATION_USED` (publication progress lives in `youtube_publications`; compilation use lives in `compilation_items`). `process()` re-selects
clips in `DISCOVERED, RIGHTS_PENDING, DOWNLOADED, ANALYZED, ASSIGNED, QA_FAILED`.

`ReviewState`: `PENDING_REVIEW` -> `APPROVED` | `REJECTED` | `REVISION_REQUIRED`; `READY_TO_UPLOAD` is declared, never set.
Permission status is NOT a state: it is `rights_status` on the clip, re-checked at every gate (`approval-and-handoff.md`).

## 4. Tables (SQLAlchemy, SQLite at `data/shortsfactory.db`, created with `Base.metadata.create_all`; no migrations)

| Table | Key columns (what it remembers) |
|---|---|
| `sources` | adapter, name (unique), config JSON, enabled (not used by the pipeline: adapters come from YAML) |
| `clips` | `source_url`, **`canonical_url` (unique)**, platform, creator, creator_url, publication_date, license, license_url, `rights_status` (default `unknown`), `attribution_required`, `local_path`, `state`, `rejection_reason`, `duplicate_of_id`, `sha256`, `duration_seconds` |
| `fingerprints` | one per clip: `sha256`, `frame_hashes` JSON (16-hex-char dHash per sampled frame), `audio_fingerprint` (unused), `similarity_score` |
| `analyses` | one per clip: provider, **`cache_key` (unique)**, summary, subjects, categories, tags, `scores`, `channel_fit`, `safe`, `rejection_reasons`, `raw` (holds the harm filter) |
| `segments` | clip_id, start/end seconds, rationale |
| `channel_assignments` | one per clip: `channel_key`, `fit_score`, `diversity_penalty` |
| `generated_shorts` | one per clip: channel, `video_path`, `metadata_path`, commentary + options, `claim_confidence`, `supporting_evidence`, title(<=100) + options, description, tags, `qa`, `review_state`, `scheduled_slot` |
| `review_decisions` | unique (`item_type`, `item_id`): decision, reason, decided_at |
| `youtube_publications` | item, `youtube_video_id` (unique), channel id, processing/publication status, `attempt_count`, `last_error`, **`idempotency_key` (unique)** |
| `compilations` / `compilation_items` | channel, type (`weekly_best`), paths, title(<=150) + options, description, chapters, thumbnails, narration blocks, qa, review_state, slot; items = (compilation, short, position, section), unique (compilation, short) |
| `performance_snapshots` / `experiments` | metrics JSON per published item (frequency optimiser reads these); experiments table exists, nothing writes it |

The DB is the permanent memory behind "never recycle a source": canonical URLs, hashes and frame fingerprints are retained forever.

## 5. Config schema (`config.py`, Pydantic; YAML; relative paths resolve against the config file's folder)

Top level: `data_dir` (data), `output_dir` (output), `database_url`, `timezone` (code default UTC; example `Africa/Casablanca`), `demo_mode`,
`youtube_upload_enabled` (**false**), `review_host/port` (127.0.0.1:8765), `eligible_rights` (set), `sources[]`, `channels{}`, plus:

| Block | Fields (default; bounds) |
|---|---|
| `ai` | `provider` demo\|openai (**to be replaced by the file hand-off**), `frame_count` 12 (3-16), `transcribe_original_audio` true, `max_output_tokens` 1800, `analysis_cache_dir` data/analysis; OpenAI-only: model, reasoning_effort, api_key_env, transcription_model |
| `content_safety` | `enabled` true, `physically_delete_blocked` true, `deletion_confidence_threshold` 0.85 (0.5-1), `delete_sidecars` true, `deletion_log` data/deleted-content.jsonl |
| `audio` | `require_original_audio` true, `original_volume` 1.0 (0-2), `music_enabled` true, `music_library_dir` assets/music, `music_volume` 0.2 (0-1), `require_license_sidecar` true |
| `shorts` | `strategy` 2h\|3h\|4h\|6h\|adaptive (only `default_interval_hours` is read), `default_interval_hours` 3 (2-24), `minimum_interval_hours` 2, `max_per_day_per_channel` 8 (1-24) |
| `compilations` | `target_per_week_per_channel` 2 (1-3), `minimum_` 1 (0-3), `maximum_` 3 (1-3), `preferred_days` [Wed, Sun], `min_clips` **8 in code, 2 in `config.example.yaml`**, `max_clips` 60, `reuse_window_days` 30, `target_duration_seconds` 600 (120-3600), `minimum_duration_seconds` 540, `foreshadow_interval_seconds` 60 (30-300), `interstitial_duration_seconds` 5.0 (2-12); validator: min <= target <= max per week, min duration <= target |
| `tts` | compilation-interstitial narration only (Shorts never use TTS); full table in `tts-narration.md` |
| `channels.<key>` | `enabled`, `youtube_channel_id`, `oauth_profile`, `fit_threshold` 0.65 (0-1), `categories[]`, `branding{display_name, handle, pfp, accent, commentary_prompt, tts_speaker, tts_instruct}` |

`ELIGIBLE_RIGHTS` = `user_owned, explicit_permission, licensed, public_domain, cc0, cc_by, approved_creator_feed`.

## 6. Source adapters and sidecars (`sources/adapters.py`)

`CandidateClip`: `source_url`, `canonical_url`, `platform`, `creator`, `creator_url`, `publication_date`, `license`, `license_url`, `rights_status`
(default `unknown`), `attribution_required`, `discovered_at`, `local_path`. `canonicalize_url` lowercases scheme/host, strips trailing `/`, query and fragment.

| Adapter (`sources[].type`) | Behaviour | Default rights |
|---|---|---|
| `local_inbox` | recursive scan for `.mp4 .mov .mkv .webm`; sidecar `<file>.json`; `canonical_url` = file URI; platform from sidecar/config; **creator = sidecar, else config, else top-level folder name**; Instagram creator URL inferred as `https://www.instagram.com/<creator>/` | config `rights_status` |
| `manifest` / `csv` / `json` | rows with `source_url` (+ `local_path`, rights fields) from a file or URL | config |
| `social` / `instagram` / `tiktok` / `x` / `twitter` | `SocialManifestAdapter`: needs `post_url`; platform must be instagram/tiktok/x; a row that is NOT `discovery_only` MUST carry `local_path` or `media_url`/`download_url`; `attribution_required` defaults **true**; capped by `limit`. Without a path/url the type is `DiscoveryOnlyAdapter` (returns nothing) | `discovery_only` |
| `rss` / `approved_creator_feed` | video enclosures (`.mp4 .mov .webm .mkv`) | config |
| `reddit` | `<url>.json`, `reddit_video.fallback_url` only | forced `discovery_only` |
| `youtube` | Data API search (needs key + query) | forced `discovery_only` |
| `pexels`, `pixabay` | **refused** ("stock-footage adapters are disabled") | - |

Sidecar `<clip>.mp4.json` (README):
```json
{"platform": "instagram", "source_url": "https://www.instagram.com/reel/POST_ID/", "creator": "Creator Name",
 "creator_url": "https://creator.example", "rights_status": "explicit_permission",
 "license": "Written permission dated 2026-08-28", "attribution_required": true}
```
`.context.json` is free text/JSON passed to the analysis as creator-supplied context. `discover()` never UPDATES an existing row
(gap G3: a later-granted permission in the sidecar does not reach the DB).

## 7. Dedupe numbers (`analysis/dedupe.py`)

SHA-256 of the whole file; then ffmpeg samples **1 frame / 3 s**, scales to **9x8 grey**, up to **20 frames**; each frame becomes a 64-bit
difference hash (pixel > right neighbour), stored as 16 hex chars. `hamming_similarity` = 1 - bits_different/64. `temporal_similarity`
needs >= 3 frames on both sides and slides the shorter sequence along the longer (tolerates a leading/trailing trim), returning the best mean
similarity. **>= 0.92 = duplicate.** Test: a trimmed + slightly changed copy scores > 0.98. Why: renamed copies and close trims must never
reach the model or the review queue. Duplicates still get a `Fingerprint` row, so a third copy matches too.

## 8. Quality filter (`filtering/quality.py`)

Scores come from the analysis (`visual_quality, audio_quality, hook_strength, payoff_strength, novelty, shareability, family_safety, brand_safety`, 0-1).
Reject reasons: `safe == false` ("AI safety assessment failed"), `visual_quality < 0.45`, `hook_strength < 0.4`, `family_safety < 0.8`,
`brand_safety < 0.8`, plus any `rejection_reasons` the analysis lists. Only these five are thresholded; `audio_quality`, `payoff_strength`, `novelty`
and `shareability` are recorded but gate nothing (use them as tie-breakers when Claude picks among clips).

## 9. Output contract

```
output/<channel>/<next-day YYYY-MM-DD>/{1.mp4, meta1.json, 2.mp4, meta2.json, ..., source-files.json}
output/next-day-<YYYY-MM-DD>.json         # target_date, quota_per_channel, by_channel[{video, metadata}], source_lists, missing_by_channel
output/<YYYY-WW>/{upload_manifest.csv, credits.csv, permission_request_queue.csv, weekly_report.html}
output/<YYYY-WW>/<channel>/compilations/<timestamp>/...        # compilation.md
output/brand-previews/{index.html, preview_manifest.json, <channel>/<slug>/{video.mp4, poster.jpg, metadata.json}}
```
Numbering is per channel and per day: `max(existing integer stems) + 1` (test: files 1 and 3 present -> next is 4). `meta<n>.json` keeps:
the generated copy (options, selected, claim confidence, evidence, titles, description, hashtags, tags), `channel`, `channel_theme`, `target_date`,
`generation_order`, `scheduled_slot`, `source_url`, `canonical_url`, `source_sha256`, `creator`, `creator_url`, `rights_status`,
`permission_status` (`cleared` | `permission_pending`), **`publishable`**, `attribution_required`, `qa`, `shorts_tts: {enabled: false}`, `music`, `music_volume`.
`source-files.json` per channel/day = ledger of `{clip_id, path, fit_score, state, canonical_url}` for every clip assigned to that channel (all dates, not only that day).

## 10. Scheduling math (`scheduling.py`)

Target day = tomorrow in `config.timezone`. Slots: `spacing = default_interval_hours * 60 / n_active_channels` minutes; channel i, cycle c starts at
`c * interval * 60 + i * spacing` minutes after local midnight, for `c < max_per_day_per_channel`, dropping minutes >= 1440. With 3 channels and 3 h
that is 60 min between channels and 8 slots per channel spread from 00:00 to 23:00 (the default 8 x 3 h spans the day). Test: with 2 channels the offset is 90 min.
Compilation slot: next preferred weekday (>= 1 day away) at **17:00 + channel_index hours**. Only `default_interval_hours` drives anything;
`strategy` and `minimum_interval_hours` are read nowhere. Compare the Etcherr871 calendar (4 slots/day at 09/13/17/21, HES folder shape) in
[../../clip-card-shorts/references/release-calendar.md](../../clip-card-shorts/references/release-calendar.md) and the shared
[release-calendar.md](../../../references/release-calendar.md): ShortsFactory has NO release-calendar folder, ledger, `(x)` marker or
`upload-manifest.json`; its hand-off is `output/<channel>/<date>/N.mp4` + `metaN.json`.
