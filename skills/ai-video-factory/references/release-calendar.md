# Release calendar, ledgers, scheduling and upload

The release calendar is the **hand-off point between "a video exists" and "a video goes out on a specific day/time"**, and the ledger is the durable record of what already shipped,
so no topic is ever made twice. Every channel follows the same convention (HES defined it; technews, Material Trials, Etcherr871 and the ambient staging mirror copied the shape). The
`release-catalog` desktop app browses these folders (see `release-catalog.md`).

Contents: 1 Folder structure · 2 Per-day package contents · 3 Ledgers (schemas per channel) · 4 `upload-manifest.json` · 5 `sources.md` and `tags.md` ·
6 Scheduling rules, slots, timezone · 7 Scheduling scripts · 8 Uploaders · 9 Git / gitignore treatment · 10 Contradictions and open questions

## 1. Folder structure

```
<channel>/release-calendar/
  LEDGER.json                       (HES, Etcherr871, ambient)  |  topic-history.json (technews)  |  material-trials/season/LEDGER.json (MT)
  schedule_release.py               hand-off script (HES, technews, Etcherr871)
  <YYYY-MM>/
    <DD>/   or   <DD> (x)/          day folder; " (x)" suffix = the day's full cadence of ready packages is present (see below)
      <slug>/                       one package per scheduled video, a slug-named subfolder (never a filename prefix)
        upload-manifest.json  + the delivery files (section 2)
```

- **The `(x)` marker.** The script renames the day folder to `<DD> (x)` exactly when it holds the full daily cadence of ready packages (HES `DAILY_TARGET`; technews: both slot A and slot B; Etcherr871: every
  configured slot holds a `ready_to_upload` package), and strips it when a package disappears. The catalog and the extension treat "ends in `(x)`" as "ready to upload"; `01 (x)` vs `01` therefore tells you at a glance
  what is ready. Re-run the script after moving or removing a package so the marker stays truthful.
- Channel roots: `hidden-everyday-systems/release-calendar/` (months 2026-09..11), `technews/release-calendar/` (2026-09..11), `material-trials/release-calendar/` (2026-09..11, flat `<DD>/<slug>/`),
  `etcherr871/release-calendar/` (2026-10..12), `ambient-channel/release-calendar/` (only `LEDGER.json` so far: a **staging mirror** for the long-form lines published on @etcherr871, same entry shape as
  Etcherr871's ledger so a finished package can be copied across unchanged).
- Old/staging area for HES produced output is `hidden-everyday-systems/output/<slug>/` (the source of truth); technews uses `technews/output/...`; Etcherr871 `data/renders/<clip>.mp4`; Material Trials `episodes/<slug>/build/`.
  The calendar folder holds **copies** taken at scheduling time.

## 2. Per-day package contents

| Channel | Files in `<DD>/<slug>/` |
|---|---|
| HES (v3) | `upload-manifest.json`, `video.long.mp4`, `video.short.brainrot.mp4` (the only published Short; `video.short.mp4` clean Short stays in `output/`), `thumbnail.png`, `thumbnail2.png` (+ `THUMBNAIL_LICENSE.txt`), `captions.long.srt`, `captions.short.srt`, `description.txt`, `description.short.txt`, `titles.txt` (line 1 chosen title, then three alternates), `tags.md`, `sources.md`, `claims.csv`, `script.long.txt`, `script.short.txt`, `package.json` (editorial source, can be MBs), `visual-system.json`, `QA-REPORT.json`, `brainrot-provenance.json` |
| technews | same HES shape minus `video.short.brainrot.mp4`: `upload-manifest.json`, `sources.md`, `tags.md`, `titles.txt`, `description.txt`, `thumbnail.png`, `video.long.mp4`, `video.short.mp4`, `captions.long.srt`; plus `upload-state.json` written by the uploader |
| Material Trials | `upload-manifest.json`, `metadata.json` (a YouTube Data API `videos.insert` body: `snippet`, `status`, notes), `title.txt`, `description.txt`, `thumbnail.jpg`, `video.short.mp4` |
| Etcherr871 | `upload-manifest.json`, `video.short.mp4`, `thumbnail.png`, `titles.txt`, `description.txt`, `tags.md`, `sources.md` |
| ambient (long-form lines) | slug-named package, same layout as Etcherr871 |

Delivery files are copied fresh with **sha256 recomputed every time**; a stale prior copy is never trusted.

## 3. Ledgers (what they track; check them before choosing a topic)

All JSON, `schema_version` "1.0" (technews "1"), top keys `purpose`, `channel`, `cadence`, `entries[]`.

- **HES `LEDGER.json`** (75 entries, all `scheduled`): `slug`, `topic`, `package_dir`, `output_dir`, `release_date`, `release_time_morocco` (e.g. `"17:00"`, `"20:00"`), `status`, `voice_id`, `pipeline_version`
  (`"3d"` for 3D packages), `assets {long, short, short_brainrot, thumbnail, thumbnail_real_photo}`, optional `voice_regenerated`. Also an `upload_time_recommendation` block (slot rationale, marked as inference).
  It is the topic-repeat tracker AND the schedule; check it (and `research-output/topic-catalog.md`) before proposing a "new" topic. **A ledger entry is not proof that a video is live**: the owner uploads, and
  2D videos were uploaded as-is before 2D work stopped.
- **technews `topic-history.json`** (15 entries: 14 `scheduled`, 1 `reviewed`): `slug`, `niche`, `niche_id`, `topic`, `source_url`, optional `title`, `first_produced`, `voice_revision`, `status`
  (`reviewed` = produced and QA'd, not yet placed; `scheduled`/`released` block re-scheduling), `scheduling {release_date, slot "A"|"B", morocco_time, path}`, `note`; plus `upload_cadence`
  (target 2 videos per release day, timezone Africa/Casablanca, recommended slots). **Dedup guard:** `schedule_release.py` refuses a topic whose `source_url` or slug is already `scheduled`/`released`.
- **Etcherr871 `LEDGER.json`** (56 entries): `slug`, `clip_id` (`<platform>:<id>`), `source_url`, `caption`, `title`, `release_date`, `scheduled_time_morocco`, `status`, `folder` (e.g. `2026-10/05 (x)/<slug>`).
  Purpose: no source video is ever posted twice (the scheduler indexes `e['clip_id']` on **all** entries, so ambient/long-form staging entries must carry `clip_id = 'longform:<line>:<slug>'`).
- **ambient `LEDGER.json`**: `entries` empty so far; cadence "at most one long-form per day at 02:00 outside Etcherr871's Shorts slots; 1-2 per week per line at launch". Spec:
  `ambient-channel/research-output/report-14-packaging-and-release-catalog.md` section 3.
- **Material Trials `season/LEDGER.json`** (`episodes[]`, `longforms[]`) with `slug`, `episode` (`S1E02`), `family` (`press|drop|blade`), `signature`, `release` (ISO), `status`, `calendar`, `title`,
  `fingerprint {family, scenario, rig, materials}`, `rebuilt_rules`, `failure`; `season/HISTORY.md` is the human table; `season/novelty.py` refuses repeats using
  `{"scenario_gap": 6, "same_scenario_max_shared": 1, "recent_window": 4, "recent_max_shared": 1}`. File it with `weekly.py register --slug <slug> --release <iso>`.

Statuses seen: `scheduled`, `reviewed`, `ready_to_upload` (manifest), `ready-for-upload` (MT manifest, hyphenated: not a typo to "fix" silently, it is MT's own spelling), `released`.

## 4. `upload-manifest.json`

Claimed by the catalog scanner (it looks for `upload-manifest.json`, `manifest.json`, `release-manifest.json`; any string key containing the token `video` becomes a variant, captions pair by key token).

- **HES:** `slug`, `chosen_title`, `alt_titles_file`, `description_file`, `thumbnail`, `thumbnail_real_photo`, `long_video`, `short_video`, `short_video_brainrot`, `captions_long`/`captions_short`, `sources`, `tags_file`,
  `scheduled_time_morocco`, `status: "ready_to_upload"`, `voice_id`, `visual_system` (`causal-v3`), `pipeline_version`, `metadata_format: "question-mechanism-v1"`, `short_title`, `short_description_file`, `short_variant`,
  `short_related_video`, `qa_report`, `human_listening_required: true`, `brainrot_provenance`, `source_of_truth` (the `output/<slug>/` folder), a `drift_check` note and the `sha256` map for every delivered file.
  Rule printed in the file: if `output/<slug>/` is newer than the manifest, re-run `schedule_release.py` rather than trust the folder.
- **Etcherr871:** `slug`, `clip_id`, `chosen_title`, `caption`, `category`, `made_for_kids: false`, `scheduled_time_morocco`, `scheduled_iso`, `status`, `source_url`, `source_of_truth`, `source_material`, `music`, `sha256{}`,
  `qc {duration, width, height, has_audio, fit, framing, analyzer}`, `pipeline_version`, `metadata_format: "clip-card-v1"`.
- **Material Trials:** `channel`, `slug`, `episode`, `format`, `scheduled` (ISO with offset), `timezone`, **`privacy: "private"`, `auto_upload: false`**, `title`, `files{name: {sha256, bytes}}`, `qc {pass, checks{...}}`,
  `made_with` ("Blender 5.2 ... + CC0 foley; no generative models"), `status`. Its `files` map has no `*_video` string key, so the catalog app's manifest scanner finds **no variants** for MT entries (see `release-catalog.md`).
- **technews:** same HES-shaped manifest derived from `meta.json` + per-slug authored extras (alt titles, hashtags, SEO tags), with `scheduling.slot`/`morocco_time` recorded in `topic-history.json`.

## 5. `sources.md`, `tags.md`, titles, descriptions

- **`sources.md`**: every factual source used (HES: publisher, title, URL, and what it supports; claim-to-source mapping lives in `claims.csv` and the package), credits (photo licence, music credit text verbatim, HDRI/textures),
  for Etcherr871 "Original video / Uploaded by / Found via" plus "Edit" (style, text, audio normalised to -16 LUFS, "no other changes to the footage"). Music attribution here and in the description is a delivery
  requirement (`audio-captions-music.md`).
- **`tags.md`**: one fenced line of comma-separated tags with the header "YouTube upload tags, N/500 characters combined" (hard limit **500 characters combined**; the catalog warns at 300; title limit 100).
  HES permanent rules: never include "hidden everyday systems" or "ghostsystem" in tags and never refill the freed space; keep relevant tags only. Etcherr871 hashtags are short generic ones (`#shorts #funny ...`).
- **HES metadata format `question-mechanism-v1`** (permanent, 2026-09-13): title `"<Main question?> | <reflection>"` (object-question first, pipe-separated), three alternative titles in `titles.txt`, native scene
  timestamps in the description, a `Full Video: <>` placeholder in **both** descriptions (the long video never links to itself; the Short's line is filled with the long URL after upload), no "photograph production" sentence.
  Material Trials: one line of text, description lists the physical facts and results; no episode numbers in public text.
- **Etcherr871:** original link in the description; the owner owns the rights; never stock footage (`etcherr871` subskill).

## 6. Scheduling rules, slots, timezone

- **Slots are Morocco wall-clock times (`Africa/Casablanca`)**, fixed operator directives recorded verbatim in each channel's config, not derived from analytics (the 02:00/17:00 pair is identical for HES and technews on
  purpose, so one convention covers both):

| Channel | Cadence and slots |
|---|---|
| HES 2D era | 2 subjects/day from 2026-09-13, each long + normal Short + brainrot Short, at **02:00 and 17:00**; slot order is catalog order, never filesystem timestamps |
| HES 3D track (from 2026-10-13) | one Short/day at 17:00 and one long every 3 days at 20:00 (owner plan `production-3d/PLAN.md`, `PLAN-v2.md`); dates the owner placed by hand are never moved, and dates already uploaded are never added to |
| technews | slot **A 02:00** (top, primary/long) and **B 17:00** (bottom, Short-weighted), 2 productions per release day |
| Material Trials | releases **Tuesday and Friday 17:00**; weekly build job Sunday 01:30 (Task Scheduler task `MaterialTrials-Weekly`, `MultipleInstances IgnoreNew`); plans 14 days ahead; `privacy: private` |
| Etcherr871 | 4 Shorts/day at **09:00, 13:00, 17:00, 21:00**, `start_offset_days: 1`; `clips.py stage` fills the next free slot |
| ambient | at most one long-form per day at 02:00, outside Etcherr871's Short slots |

- **Timezone caveat (disputed offset, see section 10):** record the wall-clock slot AND an explicit ISO offset as in the manifests (`scheduled_iso`, MT's `"2026-10-02T17:00:00+00:00"`). The uploader asserts the schedule dialog's displayed
  offset instead of assuming it and hard-fails if it cannot parse it. Consistency beats precision: a reliable daily cadence at a slightly off time outperforms an erratic perfect one. Morocco reverts to UTC+0 during Ramadan.
- A slot already in the past at upload time is published immediately (visibility Public) by the HES `uploader/` tool, or the extension asks "Publish now / Skip"; never silently publish a missed slot.
- Never move a package's folder by hand: re-run the scheduler so ledger, manifest and `(x)` marker move together.

## 7. Scheduling scripts (run from the repo root with the shared venv, see `environment-setup.md`)

- HES: `python hidden-everyday-systems/release-calendar/schedule_release.py <slug> <YYYY-MM-DD> <HH:MM> [--force]` copies the curated delivery subset from `output/<slug>/` (videos, thumbnails, captions, sources, descriptions, titles),
  records the release in `LEDGER.json`, refreshes the `(x)` marker. It carries a `TOPIC_TITLES` map and imports `pipeline_v3`.
- technews: `python technews/release-calendar/schedule_release.py <package_dir> <YYYY-MM-DD> <A|B> --topic "..." --source-url "..." --niche "..." [--slug SLUG] [--force]`; required inputs in `package_dir`:
  `video.mp4`, `short.mp4`, `meta.json`, `thumbnail.png`, `captions.long.srt`.
- Etcherr871: normal runs stage automatically (`clips.py stage`); manual move: `python etcherr871/release-calendar/schedule_release.py <clip-id|slug> <YYYY-MM-DD> <HH:MM>` (time must be one of the configured slots; only
  `rendered`/`staged` clips).
- Material Trials: `python weekly.py status|plan|run|register ...` from `material-trials/`.
- All scripts hold absolute/relative path assumptions from before the restructure (`ROOT = parents[2]`, `output/` locations); read the header before use.

## 8. Uploaders (never upload without explicit authorisation)

**Hard rule:** do not upload, schedule, publish, delete an uploaded video, or change channel settings unless the owner explicitly authorises that specific run in chat. Authorisation for one project/session
does not extend to another channel or credential (the technews setup doc says so). Always dry-run first, review the resolved plan, keep the pre-publish pause (`--rehearse` / default pause) for any new flow, and
check Studio for an already-existing or stray Draft before re-running (a failed run leaves the file attached as a Draft). Material Trials deliberately ships `auto_upload: false`, private. They drive the real
`studio.youtube.com` UI, not the Data API, because a fresh API project is locked to private-only uploads until it passes Google's audit.

Four tools exist; **no source declares one "current"**. The most recently dated is the Firefox extension (verified 2026-10-05); the catalog README points HES at `uploader/`:

| Tool | Where | Engine / state | Notes |
|---|---|---|---|
| technews uploader | `technews/release-calendar/youtube-uploader/` (`login.mjs`, `upload.mjs`, `lib/`, `CHANNEL_SETUP.md`, `channel-id.json`) | Node ESM, `puppeteer-core` + puppeteer-extra stealth, own Chrome profile `.chrome-profile/`, per-package `upload-state.json` | `npm install`; `npm run login` (you sign in yourself; the script never sees credentials); `npm run dry-run -- --date YYYY-MM-DD`; `npm run upload -- --date YYYY-MM-DD [--slug S] [--no-pause]`. Long: custom thumbnail + "Tech News" playlist, category Science & Technology, **no** self-link; Short: `Full Video: <url>` filled from the long's URL, no thumbnail/playlist. Thumbnail wait 180 s (do not shorten). `upload-state.json` is local and not authoritative: spot-check Studio before re-running old dates. |
| HES uploader (v1) | `hidden-everyday-systems/release-calendar/youtube-uploader/` (`login.mjs`, `upload.mjs`) | `puppeteer-core`, Chrome profile | Same CLI as technews (`--date`, `--dry-run`, `--no-pause`, `--slug`); v3 packages upload long + the one gameplay Short; playlist "Life's Questions Answered", category Education; v2 staggered the brainrot Short 4 h later. |
| HES uploader (v2) | `hidden-everyday-systems/uploader/` (`src/cli.js`: `login`, `channel-settings [--rehearse]`, `sync`, `plan [--sync] [--start]`, `run [--start --end --rehearse --dry-run]`) | **Firefox via puppeteer** (Chromium is blocked at Google sign-in), profile `.browser-profile/`, log `upload-log.jsonl`; both gitignored | Schedules via Studio "Schedule for later"; `day-plan.json` per day is the queue (its README names an `output/release-calendar/...` path that no longer matches the tree); canonical topic order from `output/catalog-order.json` emitted by `validate`; first run on a machine: `login` then `run --rehearse`. |
| Release Catalog Uploader | `release-catalog/extension/` (`helper/` Node 22 on `127.0.0.1:47831`, `ext/` Firefox MV2 extension) | token in `%APPDATA%\ReleaseCatalogUploader\token.txt`, `settings.json`, `upload-log.json`, `runs/`, `probes/` | Uses the catalog's `(x)` days; the i-th topic of a date (sorted by `scheduled_time_morocco`, then slug) gets `slots[i]`; MCP endpoint `POST /mcp` (16 tools, Bearer token); "uploaded" is defined only by its own log (mark hand-scheduled items with `mark_item`); `no_slot` blocks extra topics; Short waits (`needs_user`) until the long's URL is logged. TikTok/Instagram content scripts are stubs. Extension never touches audience, category, playlists, paid promotion, AI disclosure or comments: set those in Studio upload defaults. |

Credential hygiene: each tool keeps a signed-in browser profile (`.chrome-profile/`, `.browser-profile/`, the Firefox containers) containing live session cookies. These are secrets: never copy, commit, zip or
print them. They are gitignored; keep them out of the skill bundle.

## 9. How git treats heavy media vs JSON state

- Root `.gitignore`: `output/`, `.venv/`, `engine.venv/`, `.env`; `hidden-everyday-systems/release-calendar/**/*.{mp4,png,jpg,srt,wav,mp3}` (copies of `output/<slug>/`, regenerable) while `LEDGER.json`,
  `upload-manifest.json`, `sources.md` stay tracked as "the durable record, not a build artifact". Material Trials' own `.gitignore` ignores `release-calendar/**/*.mp4|jpg` and `episodes/*/work`, builds, longform media; Etcherr871's
  ignores `release-calendar/**/*.mp4|png|jpg`, `data/`, `source-material/**/*.mp4`, `music/*.mp3`.
- **But** the same root file also lists whole channel folders (`/hidden-everyday-systems`, `/material-trials`, `/etcherr871`, `/ambient-channel`, `/technews/release-calendar`, `/physics-shorts-research/*`) as ignored, and none of these
  folders has its own `.git`. Measured with `git ls-files`: HES tracks 12 files under `release-calendar/` (3 ledger/manifest), technews 3 files (`UPLOAD_TIMING.md`, `schedule_release.py`, `topic-history.json`), Material Trials / Etcherr871 /
  ambient **0**. So for Etcherr871, Material Trials and ambient the ledgers are **not durable via git**: back them up (they are the only "already made" memory) and never delete a ledger to "reset" a calendar.
- Heavy media can always be rebuilt from `output/` (or the channel's build dirs) by re-running the scheduler; the owner's gameplay footage and the Chrome/Firefox profiles are the irreplaceable exceptions.

## 10. Contradictions and open questions

- **Morocco's UTC offset.** HES `LEDGER.json` says `Africa/Casablanca` is UTC+1 year-round except a Ramadan reversion, and `UPLOAD_TIMING.md` says the same; `release-catalog/extension/README.md` says the owner's "Morocco time" is
  **UTC+0 all year** while tzdata's `Africa/Casablanca` is UTC+1 (its default timezone is `UTC`); the ambient ledger says UTC+0 since 2026-09-20; Material Trials/Etcherr871 manifests stamp `+00:00`; `voice_lock.py` treats the
  machine's UTC clock as 19:00 Morocco (UTC+1). Not resolved here. Treat slot labels as wall-clock labels and verify the offset Studio displays for the channel before any scheduled upload.
- Slot counts disagree between docs: the HES `uploader/` README says two subject slots per day (02:00, 17:00) while `release-catalog/README.md` cites a "3 daily slots" process for the same channel; the current 3D cadence is
  one Short/day plus a long every 3rd day, and `LEDGER.json` entries since mid-October use 17:00 and 20:00 only.
- The HES `uploader/` README references `output/release-calendar/<YYYY-MM>/<DD>/day-plan.json`; the real calendar is `hidden-everyday-systems/release-calendar/` and no `day-plan.json` was found under it.
- Etcherr871's `start_offset_days`/slot list and the ambient ledger's "outside Shorts slots" rule both assume the 09/13/17/21 slots stay; changing them means editing `etcherr871/config.json`.
