# Release calendar, ledger, upload (news-explainer / LITMUS)

Sources: `technews/release-calendar/{UPLOAD_TIMING.md, schedule_release.py, topic-history.json}`, `youtube-uploader/{CHANNEL_SETUP.md, upload.mjs, lib/*}`, engine `release_calendar.py`. All paths relative to the repo root.

Contents: 1 Two calendars (which is authoritative) - 2 Slots and timing - 3 Folder shape and the "(x)" marker - 4 schedule_release.py - 5 topic-history.json ledger - 6 Description/titles/tags assembly - 7 Uploader - 8 Operator checklist and gotchas

## 1. Two calendars - only one is authoritative

| Path | What it is |
|---|---|
| `technews/release-calendar/` | **Canonical.** Populated day folders with one `<slug>/` per slot, `schedule_release.py`, `topic-history.json`, `UPLOAD_TIMING.md`, `youtube-uploader/`. Months scaffolded: 2026-09, 2026-10, 2026-11. Currently populated: 2026-09-05..11 (14 productions, 2 per day, all `(x)`-marked). 2026-10/11 day folders are empty. |
| `technews/output/release-calendar/` | The engine's `ensure_release_calendar` auto-scaffold: empty `<YYYY-MM>/<DD>` folders for the current month + `RELEASE_CALENDAR_MONTHS_AHEAD` (2) in `RELEASE_TIMEZONE` (Africa/Casablanca). Not used by the scheduler/uploader. The old skill described this one as "the" staging tree - superseded. |

The whole `technews/release-calendar/` tree **and** `technews/output/` are gitignored (heavy media + local profiles): the ledger exists only on disk - **back it up before experiments** (never delete archived media). Both channels' calendars share one shape so the cross-channel `release-catalog/` WPF app can browse them side by side (it scans operator-configured calendar roots; config in `%APPDATA%\ReleaseCatalog\`).

## 2. Slots and timing (fixed operator directive, Morocco time, Africa/Casablanca)

| Slot | Position in day folder | Time | Role |
|---|---|---|---|
| **A (top)** | first production of the day | **02:00** | primary/long-form |
| **B (bottom)** | second production | **17:00** | secondary/Short-weighted |

- Identical to the Hidden Everyday Systems (GhostSystem) cadence on purpose: one shared convention for upload automation. Source of truth = `SLOT_TIMES_MOROCCO` in `schedule_release.py` and `topic-history.json.upload_cadence.recommended_slots_morocco_time`; keep both in sync if it ever changes.
- Target: 2 videos per release day. Superseded earlier research (benchmark-audience timing: 20:00 top / 16:00 bottom Morocco, landing 2-3 h before the target audience peak) - valid reasoning in general; revisit only against the channel's own Analytics.
- Caveats: consistency beats precision (a reliable daily cadence at a slightly-off time beats a perfect time posted erratically). Morocco has no DST but reverts to UTC+0 for the duration of **Ramadan** each year - both slots shift one hour relative to US/EU windows then. Timing only sizes the initial test group; CTR/retention/satisfaction decide ongoing push - it cannot fix weak content. The channel About copy promises no fixed schedule.

## 3. Folder shape (mirrors `hidden-everyday-systems/release-calendar/<YYYY-MM>/<DD>/<slug>/`)

`technews/release-calendar/<YYYY-MM>/<DD>[ (x)]/<slug>/` containing: `upload-manifest.json`, `sources.md`, `tags.md`, `titles.txt`, `description.txt`, `thumbnail.png`, `video.long.mp4`, `video.short.mp4`, `captions.long.srt`, plus `upload-state.json` after upload. (HES also has `video.short.brainrot.mp4`; technews never produces a brainrot variant.)
The day folder is renamed `"<DD> (x)"` once **both** slots hold a `<slug>/` with `video.long.mp4` (and the suffix is stripped again if a slot disappears) - the listing itself shows which days are fully ready to publish. Resolve a day with or without the marker.

## 4. `schedule_release.py` (the hand-off from "a video exists in output/" to "a video is scheduled")

```powershell
.\.venv\Scripts\python.exe technews\release-calendar\schedule_release.py <package_dir> <YYYY-MM-DD> <A|B> --topic "..." --source-url "..." --niche "..." [--slug SLUG] [--force]
```
- `package_dir` = e.g. `technews/output/test-productions/<slug>/` containing `video.mp4`, `short.mp4`, `meta.json`, `thumbnail.png`, `captions.long.srt`; missing any -> refuses ("incomplete package"). Month folder must exist (scaffolded window only).
- Does exactly four things: (1) **dedup guard**: refuses (exit 1) if `source_url` or slug already has status `scheduled`/`released` in the ledger unless `--force` (use `--force` for an intentional reschedule or to re-copy after a re-render); `reviewed` = produced + QA'd, not yet placed - exactly what it expects. (2) Derives the deliverable set fresh from `meta.json` + a per-slug `AUTHORED_EXTRAS` entry and writes it into the target folder (an existing target folder is deleted and rebuilt; sha256 recomputed every time). (3) Syncs the `(x)` marker. (4) Records date/slot back into the ledger.
- **A new production needs an `AUTHORED_EXTRAS[slug]` entry first** (`alt_titles` (the chosen `meta` title is always prepended), `hashtags` (3), `extra_tags`) - the script exits otherwise. Add it to `schedule_release.py` when authoring the production (mirrors HES's per-slug TOPIC_TITLES/TOPIC_DESCRIPTIONS convention).
- `upload-manifest.json` fields: `slug`, `chosen_title`, `alt_titles_file`, `description_file`, `thumbnail`, `long_video`, `short_video`, `captions_long`, `sources`, `tags_file`, `status: "ready_to_upload"`, `voice_id: "dots-tts-warm-informational"`, `short{title,description,cta}`, `source_of_truth` (`technews/output/test-productions/<slug>/`), `drift_check` note, `sha256{...}`. Drift rule: if the production folder is re-rendered, re-run with `--force`; do not trust a calendar copy older than its source.

## 5. `topic-history.json` (the repeat-prevention ledger)

Schema: `{schema_version:1, purpose, upload_cadence{target, timezone, recommended_slots_morocco_time[], rationale}, entries[]}`; entry = `{slug, niche, niche_id?, topic, source_url, title?, first_produced?, voice_revision?, status: reviewed|scheduled|released, scheduling{release_date, slot, morocco_time, path}}`.
Consult it **before selecting any new topic**: reject a candidate whose `source_url` or normalised topic already appears; pick a fresh angle or a genuinely new story. Never edit it by hand to bypass the guard. Entries as of 2026-11-01 are summarised in `current-state.md`.

## 6. Description / titles / tags assembly (`build_description`, `build_tags`, `build_sources`)

- `description.txt` = body from `meta.video.description` (text before `\n\nPrimary source:\n`) + `Full Video: <paste full YouTube URL after upload>` placeholder + `Primary source(s):` bullet list (URLs, from the meta description's source block or `meta.sources`) + hashtags line + `Alternative Titles:` block (chosen + alts) + `Audio:` note ("Narration: dots.tts SOAR, synthetic "warm-informational" voice (cloned from a permissively licensed reference clip; no per-video licence required). Background music: original, deterministic ambient bed synthesized locally per script (channel-owned, no external licence required).").
- The **uploader post-processes it** (resolves the apparent conflict with "the long video has no self-referential link"): for the **long** video it strips the `Full Video:` line and the `Alternative Titles:` block entirely (throws if either is absent - keep the template intact); for the **Short** it fills `Full Video: <long url>` (once known from the same run or a prior `upload-state.json`) and also drops Alternative Titles. Never publish the placeholder.
- `tags.md`: `meta.video.tags` + `extra_tags`, de-duplicated, combined **<=500 characters** - when over, trim from the end (extras first), never the mechanically sourced meta tags.
- `sources.md`: `- [title](url) (type)` list + audio note. `titles.txt`: chosen title then alternates.

## 7. Uploader (`technews/release-calendar/youtube-uploader/`)

Studio-driven (Puppeteer, `puppeteer-core` + stealth) automation of the real `studio.youtube.com` UI with its **own dedicated Chrome profile** (`.chrome-profile/`, gitignored) - isolated from the HES/GhostSystem uploader (separate profile, Google login and account; both can run simultaneously) and from any human profile. Deliberately **not** the YouTube Data API: a fresh API project is locked to private-only uploads until it passes Google's audit, which would defeat scheduled public releases. Channel id in `channel-id.json` (UCQwDCfVclXjIiFEqXxcJMrw).

```powershell
cd technews/release-calendar/youtube-uploader ; npm install
npm run login                                         # ONE-TIME, human logs in to the LITMUS channel's own Google account (script never sees credentials; pick the LITMUS channel if the account has several); saves profile + channel-id.json
npm run dry-run -- --date 2026-09-08 --date 2026-09-09   # prints resolved title/description/tags/thumbnail/schedule; no browser, no writes - REVIEW FIRST
npm run upload -- --date 2026-09-08 [--slug SLUG] [--no-pause]
```
Behaviour (editorial policy enforced by the driver - do not "fix" by making the variants symmetric):
- **Long video**: real title/description (no self-referential line), custom thumbnail, added to the **"Tech News"** playlist, category "Science & Technology".
- **Short**: real title/description that always has `Full Video: <long url>`, no custom thumbnail, no playlist.
- Schedule: top production **02:00**, bottom **17:00** Morocco time, read from the ledger's own `scheduling.slot`/`morocco_time` per entry (not hardcoded in the uploader).
- Never mixes fields across productions: every field read fresh from that slug's own folder.
- **Idempotent**: per-production `upload-state.json` records which variants landed, so re-running a date uploads only what is missing. That file is local and **not authoritative**.
- By default pauses before each variant's final **Schedule** click (`pauseForReview`) so a human eyeballs the filled Studio tab; `--no-pause` only once the flow is trusted **and** the batch's dry-run was reviewed. Real-channel uploads need the user's explicit authorisation in that turn (the earlier Docker/engine/upload authorisation covered only this project and does not generalise).

## 8. Operator checklist and gotchas

1. QA passed + Gate 2 approved -> `AUTHORED_EXTRAS` entry added -> `schedule_release.py` -> check day folder shows `(x)` when both slots filled.
2. `dry-run` for the date(s), review titles/descriptions/tags/thumbnails/schedule times - they are only as correct as the calendar files.
3. Before a batch against unfamiliar/older dates, **spot-check Studio** (`studio.youtube.com/channel/<id>/videos/upload` and its Shorts tab) for content already existing; if a video was ever uploaded manually or a state file was lost, the tool will re-upload and create a stuck duplicate draft. Backfill `upload-state.json` by hand (videoId/url from the row's edit link, `scheduledFor` from the ledger) instead of re-running blind (confirmed 2026-09-05: 4 productions had been uploaded with no state file).
4. A failed run mid-upload leaves the video attached as a **Draft** (Studio creates the entry once the file attaches). Check the Videos tab for a stray Draft ("Brouillon" in the French UI) before re-running; delete it first via row menu -> permanent delete -> tick the confirmation checkbox -> enabled delete button (the checkbox/button live inside a Polymer dialog; query the dialog's subtree specifically or a row-selection checkbox gets hit by accident). Deleting is destructive - only with the user's say-so.
5. The thumbnail step waits up to **180 s** for Studio's custom-thumbnail file input (fresh multi-minute 1440p uploads take >1 min while YouTube generates previews) - do not shorten without re-testing on a real several-minute upload.
6. After release: no tool currently sets `released` (the scheduler writes only `scheduled`; the guard treats both the same) - update the ledger deliberately, never to bypass the dedup guard - and feed real retention/CTR learnings back into style decisions (`creator-style-guide.md`).
