# Etcherr871 architecture, files, schemas and commands

Contents: 1 Shape - 2 Stages - 3 Edit-style implementation - 4 Folder map - 5 Data model - 6 Config schemas
(config.json, sources.json, vibe.json) - 7 Research tools - 8 Command surface - 9 External dependencies

## 1. Shape
A standalone Python CLI with no app or UI, run with the repo-root venv interpreter (`<repo>/.venv/Scripts/python.exe`). One
SQLite file (`data/clips.db`) holds pipeline state; `release-calendar/LEDGER.json` is the human-readable release history. No
Docker service, no TTS, no GPU. **Python packages** (no requirements file exists; install these into `<repo>/.venv` if you
rebuild it): `httpx` (Reddit Atom, vetting), `numpy` (music energy analysis), `opencv-python` (`cv2`: contact sheets, dHash),
`Pillow` (cards, text, sheets), plus the stdlib `zoneinfo` (on Windows also `tzdata`, or `Africa/Casablanca` will not resolve);
`yt-dlp` is a system tool (Python is optional). Needs on PATH: `ffmpeg`, `yt-dlp` (installed system-wide, 1000+ sites), and for Instagram/X
`gallery-dl`. `clips.py doctor` checks ffmpeg, yt-dlp, Frame Studio `layout.py`, and the timezone.

## 2. Stages
```
discover ──► fetch ──► prepare ──► [agent writes analysis.json] ──► ingest ──► render ──► stage
 sources.py   fetch.py   analyze.py                                  analyze.py  render.py   stage.py
```
| Stage | Module | In -> Out | Status after |
|---|---|---|---|
| discover | `mc/sources.py` | verified sources -> candidate rows (metadata only) | `discovered` |
| fetch | `mc/fetch.py` | candidate -> `data/downloads/*.mp4` (yt-dlp), dHash dedupe, 2-60 s check | `downloaded` / `rejected` |
| prepare | `mc/analyze.py` | clip -> `data/review/<clip>/sheet.jpg + request.json` | (waits for agent) |
| ingest | `mc/analyze.py` | `analysis.json` -> validated verdict + gates | `analyzed` / `rejected` |
| render | `mc/render.py` -> `mc/styles.py` | agent's `edit` + QC -> `data/renders/*.mp4` | `rendered` / `rejected` |
| stage | `mc/stage.py` | next free slot -> release folder, ledger, day marker | `staged` |

`clips.py run -n N` = one resumable pass: if fewer than `2N` candidates are `discovered` it tops up discovery; fetches only
`N - in_flight` (in-flight = downloaded + analyzed + rendered); builds packets for up to `2N` clips; **pauses** ("PAUSED: agent
review needed") if any packet awaits you; otherwise renders and stages up to `2N`. Run it again after writing the files.

Other modules: `mc/util.py` (config/env loading, ffmpeg/ffprobe helpers, `FFMPEG`/`YTDLP`), `mc/db.py` (SQLite),
`mc/audio.py` (own-audio detection: no audio stream or max volume < -45 dB => `music_required`), `mc/textrender.py`,
`mc/vet.py` (source vetting + registry snapshot).

## 3. How edit styles are implemented
- **`post`**: `mc/render.py` imports `layout.py` from `config.json -> frame_studio_dir` by file path, so Frame Studio stays the
  single source of truth for that card. The pipeline only adds the `contain` framing variant.
- **Everything else** (`mc/styles.py`, ported from Braketools: social-post-meme -> `xpost`, meme-frame -> `meme_bar`/`impact`,
  snapchat-caption -> `snap`, plus researched `bottom_meme` and `after_meme`). One compositor:
  1. a background colour;
  2. the clip (and meme) scaled into computed rects (`exact`, `cover` or blurred `contain`);
  3. full-canvas RGBA PNG "frames" on top, opaque where card chrome/text is and transparent where media shows (that is how
     rounded corners and bars work without video masks);
  4. timed text is a separate PNG with `enable='between(t,a,b)'`;
  5. meme audio is delayed to `meme.start` and mixed, then everything is loudness-normalised;
  6. `after_meme` renders two segments and concatenates them.
- **Text** (`mc/textrender.py`): fonts Segoe UI, Arial, Impact, Roboto; colour emoji from Segoe UI Emoji; greedy wrap (same
  algorithm as Braketools' `wrapLines`); strokes and shadows.
- **Memes**: `memes/catalog.json` + `memes/*.mp4` (gitignored); `memes.py add` downloads, trims, auto-crops baked-in black
  bars (ffmpeg `cropdetect`) and writes a verification sheet.

## 4. Folder map (inside `etcherr871/`)
| Path | Purpose |
|---|---|
| `clips.py` | CLI entry point |
| `config.json` | adapters tuning, profile, schedule slots, gates, description defaults |
| `sources.json` | source registry (49 entries as of 2026-10-04; 11 verified); only `verified` used |
| `vibe.json` | channel taste spec read at every review: good/bad clips, caption jobs, rules, examples |
| `mc/` | util, db, sources, fetch, analyze, render, styles, textrender, stage, audio, vet |
| `memes/` | reaction-meme library: `catalog.json`, `memes.py`, `*.mp4` + `*.sheet.jpg` (gitignored). 5 memes: cat-shocked, galaxy-brain, orville-500-cigarettes, rock-eyebrow, sad-hamster-violin |
| `music/` | calm CC0 beds for silent clips: `catalog.json`, `music.py`, `*.mp3` (gitignored). 11 tracks (Komiku, HoliznaCC0 via archive.org) |
| `research/` | `research.py collect|sheets|list`, `scout.py`, `strip.py`, `edits.jsonl` (23 analysed videos), `corpus/` (gitignored, large) |
| `source-material/` | `<date>/<clip>/original.mp4 + source.json` for every kept original (mp4 gitignored); dates so far 2026-10-04, 2026-10-05 |
| `assets/pfp.jpg` | the channel avatar used on cards |
| `release-calendar/` | HES-style calendar: `LEDGER.json`, `schedule_release.py`, `<YYYY-MM>/<DD>[ (x)]/<slug>/` (see `release-calendar.md`) |
| `data/` | gitignored runtime: `clips.db`, `downloads/`, `review/`, `renders/`, `vetting/`, `work/` |
`.gitignore`: `data/`, calendar mp4/png/jpg, `research/corpus/`, `research/strips-*.jpg`, `source-material/**/*.mp4`,
`music/*.mp3`, `memes/*.mp4`, `memes/*.sheet.jpg`, `__pycache__/`.

## 5. Data model (`clips` table)
`id` (`<platform>:<native id>`), `platform`, `url` (original video; goes into the description), `title`, `author`, `origin`,
`popularity`, `velocity`, `duration`, `status`, `reject_reason`, `file_path`, `phash`, `analysis` (the agent's JSON),
`render_path`, `schedule_date`, `schedule_slot`, `stage_dir`, timestamps. Statuses: discovered, downloaded, analyzed, rendered,
staged, rejected.

## 6. Config schemas (document meaning; read the live files for values)

### config.json (read on every run; edit freely)
- `cookies_from_browser`: `null` | `"chrome"` | `"edge"`. Owner opt-in ONLY: makes yt-dlp/gallery-dl reuse the logged-in browser
  session for Instagram/X. `null` => IG/X sources stay `needs_login`. Never set it by default.
- `frame_studio_dir`: `H:/Projects/frame-studio` (must contain `layout.py`).
- `profile`: `{name: "Etcherr871", handle: "@etcherr871", pfp: "assets/pfp.jpg", badge: ""}` (badge drawn only if non-empty).
- `sources.reddit`: `enabled`, `period` (`month`), `batch_size` (2 subs per Atom request), `limit`, `max_seconds`. Subreddits come
  from `sources.json` (platform reddit + verified).
- `sources.accounts`: `enabled`, `scan` (recent posts per account, 30), `min_views` (50000), `max_seconds`; ranks by views/hour.
- `sources.ytdlp_search`: **disabled** (0/5 usable in testing 2026-10-04; random uploaders can't be verified) - `queries`,
  `per_query`, `min_views`.
- `sources.watch`: disabled until `urls` are added; any profile/hashtag/playlist URL yt-dlp supports; `per_url`.
- Gates: `min_fit` 7, `reject_foreign_watermark` true, `reject_burned_in_text` true, `max_seconds` 60.
- `schedule`: `slots` ["09:00","13:00","17:00","21:00"], `start_offset_days` 1 (Africa/Casablanca).
- `description`: `category` "Comedy", `footer` "", `default_hashtags` [#shorts #funny #memes #viral #relatable].

### sources.json
`{ "_note", "sources": [ {platform, handle, url, status, vetted (date), sample_size, accepted, notes, sample[urls]} ] }`.
Statuses: `verified` (>= 3/5 postable), `rejected` (notes keep the reason + re-vet hints), `candidate` (not vetted),
`needs_login` (instagram/x until `cookies_from_browser`). Managed with `clips.py vet`. See `source-discovery.md`.

### vibe.json
`channel_description`, `good_clips[]`, `bad_clips[]` (first entry: STOCK FOOTAGE OF ANY KIND - NEVER), `caption_jobs{job: meaning}`
(nine jobs), `caption_rules[]`, `caption_examples{job: example}`, `default_hashtags[]`. Examples set tone only and are never
copied. Keep it sharp with data (see `current-state.md` "taste that learns").

## 7. Research tools
- `research/research.py collect|sheets|list` builds the edit-pattern corpus from a channel or search URL: filters by duration
  and views, can keep relevance order, downloads 720p video and fetches YouTube auto-captions separately (speech stands in for
  audio). `research/strip.py` puts one labelled 5-frame row per video into one image. `research/scout.py "<genre> shorts"` finds
  YouTube channels to vet. Findings: `edit-patterns.md`; dataset `research/edits.jsonl` (keys: `clip, format, caption,
  meme_addition, relation, what_it_adds, views, tier`).

## 8. Command surface
```powershell
cd <repo>\etcherr871
$py = "..\.venv\Scripts\python.exe"    # = <repo>/.venv/Scripts/python.exe
& $py clips.py doctor                 # ffmpeg / yt-dlp / Frame Studio / timezone
& $py clips.py discover               # pull candidates from reddit / accounts / watch URLs
& $py clips.py add <url>              # queue any single link yt-dlp supports (front of queue; refused if it looks like stock)
& $py clips.py fetch   [-n 10] [--platform tiktok|reddit|youtube]   # download top candidates, drop reposts/over-length
& $py clips.py analyze [-n 10]        # ingest agent verdicts + build contact-sheet packets for new clips
& $py clips.py render  [-n 10]        # card/style render + QC
& $py clips.py stage   [-n 10]        # copy into release-calendar/<YYYY-MM>/<DD>[ (x)]/<slug>/
& $py clips.py run -n 6               # everything, resumable, pauses for the agent
& $py clips.py status                 # counts by status + staged list with slot
& $py clips.py redo <clip-id> [...]   # re-apply an edited analysis.json, re-render, re-stage in the SAME slot
                                      #   (a clip that now fails the gates is pulled from the calendar + ledger)
& $py clips.py plan 2026-10-05 -n 14  # lay out all rendered clips: 4/day, sources and styles spread
& $py clips.py vet sample -n 5 tiktok:@h youtube:@h youtube:UCxxxx reddit:Sub instagram:@h x:@h
& $py clips.py vet record tiktok:@h --status verified --accepted 4 --notes "..."
& $py clips.py vet list               # also: vet snapshot (rewrites the registry table)
& $py release-calendar\schedule_release.py <clip-id|slug> 2026-10-07 17:00   # move/re-copy a staged clip
& $py memes\memes.py search|add|sheet|list|rebuild
& $py music\music.py add|list|rebuild
```
Flags: `-n` (default 5), `--platform`, `--status {verified,rejected,candidate,needs_login}`, `--accepted N`, `--notes "..."`.
Env: `RELEASE_TIMEZONE` (default Africa/Casablanca), `RELEASE_CALENDAR_MONTHS_AHEAD` (default 2).

## 9. External dependencies (outside the repo)
- Frame Studio: `H:/Projects/frame-studio` (`layout.py`), the user's own app; read-only.
- Braketools: `H:/Projects/Braketools/src/tools/media/{social-post-meme,meme-frame,snapchat-caption}`; design basis only.
- If either path is missing on a machine, `post` renders fail (`doctor` reports Frame Studio missing); the other styles
  (`xpost` etc.) do not need Frame Studio.
