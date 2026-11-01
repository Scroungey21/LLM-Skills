# YouTube upload, publication safety, analytics and the weekly report

Source: `youtube/publisher.py`, `analytics/{youtube,optimizer}.py`, `reports/weekly.py`, `cli.py` (`youtube`, `analytics`, `optimize-frequency`, `report`), `config.py`, README, tests. **Upload is disabled by
default and was never run** (current-state: no OAuth setup, no uploads, SF-D7: the owner uploads). Claude never uploads, schedules, publishes or authenticates without an explicit instruction for that
specific run ([../../../references/agent-principles.md](../../../references/agent-principles.md) section 5).

Contents: 1 Stance - 2 Publisher design - 3 Gaps in the upload body - 4 Analytics and the frequency optimiser - 5 Weekly report - 6 Choosing an upload path - 7 Learning loop

## 1. Stance

`youtube_upload_enabled: false` (config) and `demo_mode`: the pipeline stops at `output/<channel>/<date>/N.mp4` + `metaN.json`; the owner uploads with an external workflow. The API publisher
exists so the approval gate, idempotency and channel-identity checks are designed once; it is optional machinery, not the delivery path.

## 2. Publisher design (`YouTubePublisher`) - worth keeping even if you use another uploader

1. **Enqueue only approved + rights-cleared items** (`ready_for_upload`), creating one `youtube_publications` row (status `queued`, `scheduled_publish_at` = the item's slot). Idempotency key =
   `sha256(item_type:item_id:video_path)`; a second enqueue returns the same row (tested).
2. **Re-check at upload time**: approval and rights can be revoked between enqueue and upload ("approval was removed before upload").
3. **Verify the channel before sending bytes**: `channels.list(mine=true)` must return the configured `youtube_channel_id`, else `PublicationGateError`. Each channel has its own OAuth profile file.
   `status`/analytics sync repeat the check ("OAuth channel mismatch").
4. **Never auto-retry an ambiguous remote outcome**: if the resumable upload throws after bytes may have been sent, the row becomes `ambiguous` with `last_error`; an item with `attempt_count > 0` or
   status `uploading`/`ambiguous` is refused. A human inspects YouTube Studio, then fixes the row.
5. Upload body: `snippet{title, description, tags}`, `status{privacyStatus: "private", publishAt: <slot as UTC ISO Z>}` - private-until-scheduled, so nothing becomes public by accident. Resumable
   `MediaFileUpload`. After success: video id, uploaded_at, `processing_status: processing`, `publication_status: scheduled`.
6. **Pause switch**: `data/youtube.paused` file (`youtube pause|resume`) halts the queue drain. `youtube refill [--dry-run]` drains `queued` rows only when upload is enabled.
7. **`demo_mode` never calls Google**: it fabricates ids like `demo-short-<id>`; analytics skips ids starting with `demo-`.
8. OAuth: `youtube auth <channel>` runs the installed-app flow from `client_secret.json` (working directory) with scopes `youtube.upload`, `youtube.readonly`, `yt-analytics.readonly`, and writes the channel's
   `oauth_profile` JSON. These profile files and `client_secret.json` are secrets: gitignored, never copied into a skill, hand-off or chat (`.gitignore` lists `client_secret.json`).

## 3. Gaps in the upload body (decide and set explicitly before any real upload)

- No `categoryId`, no audience declaration (`selfDeclaredMadeForKids`), no altered/synthetic-content flag (`containsSyntheticMedia`), no language, no playlist. YouTube requires an audience
  declaration for uploads; the synthetic-content flag should be truthful per item (real clips with an AI caption: usually false; compilations with a cloned narrator: consider true). The shared
  Release Catalog Uploader never touches these either and expects Studio upload defaults ([../../../references/release-calendar.md](../../../references/release-calendar.md) section 8).
- **A new API project is locked to private-only uploads until it passes Google's audit** (reported in the shared release-calendar doc as the reason all channel uploaders drive Studio's UI instead).
  `publishAt` scheduling on an unaudited project therefore may never become public. Verify the project's status before building around this publisher.
- No thumbnail upload (`thumbnails.set`), though compilations produce three thumbnail candidates.
- Shorts description: the copy ends with "Source credit is listed below" in the demo provider; real credit lines (creator + source URL) must actually be present (`rights-and-safety.md` section 3).

## 4. Analytics and the frequency optimiser

- `analytics sync` (non-demo): per channel with an OAuth profile and ID, per published video, YouTube Analytics v2 `reports.query` for `channel==MINE`, window **end = today - 2 days, start = end - 30 days**,
  metrics `views, likes, comments, estimatedMinutesWatched, averageViewDuration, averageViewPercentage, subscribersGained, estimatedRevenue`, filter `video==<id>`; stored as `PerformanceSnapshot.metrics` with
  `channel_key`. `youtube status` refreshes processing/publication status in batches of 50 (`videos.list part=status,processingDetails,snippet`) and records `actual_published_at` when public.
  In `demo_mode` the sync invents numbers (views 1000 + id*137, likes 80, 0.72 viewed): never read them as evidence.
- `optimize-frequency` (`recommend_frequency`): needs >= **30** Short snapshots for the channel, else "hold". With enough data: if median views >= **1000** and rejection rate <= **0.15** -> cut the
  interval by 1 h (floor **2 h**), else lengthen by 1 h (cap **6 h**). Caveats: `rejected` is never written by the sync, so the rate is always 0; it uses views only; the result is advice that nothing applies
  automatically (the scheduler reads `default_interval_hours` from config). Thresholds are unexplained owner/author choices; treat 1000 views and 30 samples as placeholders to tune per channel.
- Why a slow cadence is the default: the factory prefers per-upload quality over volume ("protect per-upload quality"); it never lowers quality bars to fill 8 slots.

## 5. Weekly report (`shortsfactory report` / `weekly` for compilations)

`output/<YYYY-WW>/`: `upload_manifest.csv` (type, item, YouTube id, status, publish time), `credits.csv` (every clip: id, source URL, creator, license, rights status), `permission_request_queue.csv`
(edit-allowed but not publishable: the owner's batch of permission requests), `weekly_report.html` (counts of clips per state, Shorts, compilations, publications). The permission queue is the
operational heart of SF-D11: send one batch, then record grants (`rights-and-safety.md` section 1 rule 5).

## 6. Choosing an upload path for a new channel in this theme

| Path | Use when | Note |
|---|---|---|
| Owner uploads manually from `output/<channel>/<date>/` | default; first weeks | matches SF-D7 |
| Shared package convention + Release Catalog Uploader / Studio-UI uploaders | several channels, scheduled slots | needs an `upload-manifest.json` + release-calendar folder; ShortsFactory has neither, build them to the shared shape ([../../../references/release-calendar.md](../../../references/release-calendar.md)) |
| ShortsFactory's API publisher | only after Google audit + OAuth + the section 3 fields are settled | owner decision; do not set up OAuth proactively |

## 7. Learning loop (proposal, assembled from E871's roadmap and this optimiser)

After a month of data: per source/creator acceptance rate (cleared vs rejected vs approved), per channel retention (`averageViewPercentage`) by caption job/theme, then (a) prune sources that mostly
reject, (b) promote top-retention commentary patterns into the channel's `commentary_prompt` examples (with a dated note), (c) revisit `fit_threshold`. Do not learn from one viral video; stay at pattern level
(topic family, hook type). Record each change with a date in `decision-log.md`.
