# Etcherr871 release calendar

Mirrors Hidden Everyday Systems' folder calendar (owner request; read-only use of that structure is the one recorded boundary
exception, R2) so release tooling and operator habits carry over. Lives in `etcherr871/release-calendar/`.

## Structure
```
etcherr871/release-calendar/
  LEDGER.json                 every scheduled clip (reuse tracker + audit history)
  schedule_release.py         manual (re)schedule CLI (wraps stage.schedule())
  <YYYY-MM>/<DD>[ (x)]/<slug>/
    video.short.mp4  thumbnail.png  titles.txt  description.txt  tags.md  sources.md  upload-manifest.json
```
- `slug` = slugified chosen title, <= 60 chars. `thumbnail.png` = full-res 1080x1920 frame of the finished card at `thumb_time`.
- `titles.txt`: first line = chosen title, then alt titles (distinct). `tags.md`: header + one code-fenced comma line,
  "<n>/500 characters combined", truncated at whole tags. `description.txt`: exact layout in `standards-and-qa.md` (hook,
  `Original video:`, `Credit:` if uploader known, `Music:` if a bed, footer, hashtags max 6 last). `sources.md`: "# Source"
  (original video link + title, uploader + platform, found-via origin), "# Edit" (style + caption job, text, reaction meme with
  its source URL and label, background-music credit with licence, or "Original audio, loudness-normalised to -16 LUFS", "No other
  changes to the footage."), and the source-material folder.
- Scaffolding: day folders for the current month + `RELEASE_CALENDAR_MONTHS_AHEAD` (default 2) following months are created
  (`ensure_calendar`, Casablanca "now").
- Media (mp4/png/jpg) in the calendar is gitignored; `LEDGER.json` and text files are tracked.

## Slots and cadence
- One clip per slot. Slots = `config.json -> schedule.slots`, **Africa/Casablanca** (`RELEASE_TIMEZONE` env overrides). Owner
  cadence (2026-10-04): **4 Shorts a day, 4 hours apart: 09:00, 13:00, 17:00, 21:00**. `start_offset_days` 1 = the search for a free
  slot starts at Casablanca-today + 1 day (tomorrow) and walks forward day by day through the slots in order until it finds one
  not held by any clip (`next_free_slot`; it never fills earlier gaps). `stage` uses it; `schedule_release.py` refuses a taken slot or a time that is not a
  configured slot, and only schedules clips with status `rendered` or `staged`.
- **Day marker**: the day folder is named `DD (x)` exactly when every slot of that day holds an `upload-manifest.json` with
  `status: ready_to_upload` (`refresh_day_marker`). Only `mc/stage.py` renames day folders (R17); both `DD` and `DD (x)` are valid
  on disk (`find_day_dir` returns whichever exists). Never rename by hand.
- Moving a clip (`schedule_release.py`): re-copies delivery files with fresh sha256, updates the ledger, deletes the old folder
  if it moved, and refreshes the marker on both old and new day folders.

## Commands
```powershell
cd <repo>\etcherr871
$py = "..\.venv\Scripts\python.exe"    # = <repo>/.venv/Scripts/python.exe
& $py clips.py stage -n 10                                         # stage rendered clips into next free slots
& $py clips.py plan 2026-10-05 -n 14                               # lay out the whole rendered pool
& $py release-calendar\schedule_release.py <clip-id|slug> 2026-10-07 17:00
& $py clips.py redo <clip-id>                                      # after editing analysis.json: re-render, re-stage SAME slot
```
**`plan` is a full re-layout, not an append**: it clears `schedule_date/slot` for every `rendered`/`staged` clip, re-assigns them
fit-descending over `days x slots` from the start date, and un-stages (removes folder + ledger entry, status back to `rendered`)
any clip that falls beyond the window. Run it with a window large enough for the whole pool, and expect folders to move. Spread
rule: no source (`origin`) twice in a day when avoidable, never the same source or edit style in consecutive slots (cost weights:
same origin in day 4, same origin as previous slot 8, same style as previous slot 2).

## `LEDGER.json`
`{schema_version "1.0", purpose, channel "Etcherr871", cadence, entries[]}`; entry = `{slug, clip_id, source_url, caption, title,
release_date, scheduled_time_morocco, status ("scheduled"), folder}`. Purpose: **no source video is ever posted twice** and the
release history stays auditable - check `source_url`/`clip_id` here before scheduling anything by hand (R6). `redo` of a clip that
now fails the gates removes its ledger entry and day marker.

## `upload-manifest.json` keys
`slug, clip_id, chosen_title, alt_titles_file, description_file, thumbnail, short_video, sources, tags_file, caption, category
("Comedy"), made_for_kids (false), scheduled_time_morocco, scheduled_iso, status ("ready_to_upload"), source_url, source_of_truth
(repo-relative path of the render), source_material (folder of the original or null), music (track id or null), drift_check (text),
sha256{video.short.mp4, thumbnail.png, titles.txt, description.txt, tags.md, sources.md}, qc{duration, width, height, has_audio, fit,
framing, analyzer "agent"}, pipeline_version "v1", metadata_format "clip-card-v1"`. The `drift_check` rule: if the render in
`source_of_truth` changes, re-run `schedule_release.py` for that clip so the recorded sha256 values stay true (R18).

## Uploading
Today the pipeline stops at a ready calendar folder (no uploader for this channel). HES has a Puppeteer uploader that consumes the
same folder shape; an Etcherr871 uploader built the same way would read `upload-manifest.json` and mark the ledger entry
`uploaded`. That is an owner decision and a separate build (see `current-state.md`). Ledger statuses seen so far: only `scheduled`.
