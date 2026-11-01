# Packaging and release: titles, thumbnails, descriptions, disclosure fields, package layout, ReleaseCatalog, scheduling

From `ambient-channel/research-output/report-14-packaging-and-release-catalog.md` (2026-10-08; section 3.6 added 2026-10-12) plus R12. It SUPERSEDES the MASTER section 24 gate C3 title grammar and the thumbnail archetype list.
"O-F#" = YouTube Help/Blog/API docs fetched 2026-10-07; "D-F#" = hand-coded sample (66 ambient + 44 quiz + 62 pair videos, 935 titles). Associations inside selected pools, not causes. About 90 binary features were tested with uncorrected p-values; only quiz thumbnail contrast (D-F28) survives a Bonferroni-style factor.
Nothing was tested on @etcherr871 itself: Advanced-feature status, chapter rendering on 10 h and Test & Compare eligibility are unobserved.

## Contents
1. Titles  2. Thumbnails  3. Descriptions and tags  4. Audience/disclosure fields  5. Surfaces  6. Test & Compare plan
7. Package layout and manifest  8. Compatibility with etcherr871's scheduler  9. Release time  10. ReleaseCatalog and 10 h masters  11. Owner decisions

## 1. Titles
- Hard cap 100 characters, no `<` `>`; searchable core first (YouTube publishes no visible length; keep the first ~55 characters self-sufficient: HYPOTHESIS); limit ALL CAPS and emoji; never promise what the video does not deliver.
- **Ambient grammar (held constant across the nine): `[Place, literal nouns] | [one sound phrase]`.** An "N Hours" token marks median-band videos, not winners (24/94 winners vs 102/193 median-band titles; at the end of the title 8/94 vs 52/193; lower for winners in 6 of 6 theme groups; replicates R01's x0.43; the pools come from searches containing "10 hours", so part of the effect is built into the sample).
  Runtime goes in the FIRST DESCRIPTION LINE and the thumbnail badge. The old grammar `[Place] | [soundscape] | [use-case] | N Hours` becomes a Round-2 Test & Compare variant.
  Winners use fewer pipe segments (>= 3 segments 23 % vs 35 %; single phrase 39 % vs 21 %); "ambience/ambient" less often in winner titles (38 % vs 54 %); use-case words (sleep/study) add nothing.
- Do NOT use: "10 Hours" at the end, "No Music", "No Talking", "Black Screen", "POV", [HOT], year tags, resolution badges (none marks winners); outcome promises ("Fall Asleep in 3 Minutes", "99% of You...": over-represented in winners 17/94 vs 6/193 but unverifiable sleep claims = wellness-claim risk); "No AI"/authenticity denials (conflict with gate C5); franchise names (their lift is unavailable to an original-places channel).
- Proposed E1 titles (current start-set order): e.g. slot 1 `Starship Crew Quarters at Night | Hull Hum and a Slow Star Window`; slot 2 `Roommate in the Kitchen | Kettle, Dishes and a Radio Through the Wall`; slot 3 `Marble Machine That Never Runs the Same Track | Wood and Steel Rolls`;
  slot 4 `Roommate Typing in the Next Room | Keys, Chair Creaks, Lamp Hum`; slot 5 `Lava Lamp and Sand Simulation | Glass Ticks and Slow Avalanches`; slot 6 `Gothic Castle Chamber in a Winter Storm | Rain on Stone, Candle, Hearth`; slot 7 `Screensaver Marathon | Original Geometry, Soft Tones, Nothing Repeats`;
  slot 8 `Snowed-In Safehouse After the Fall | Stove, Wind on Boarded Windows`; slot 9 `Radio Playing in the Next Room | Muffled Original Songs, Static Ticks`. The "[sound] in the next/another room" frame marks presence winners (6/94 vs 1/193) but 5 of 6 winners have MUSIC playing in the next room: unproven for silent presence, so it goes to the Round-2 title test, not the held grammar.
- Quiz: `Guess the [Stimulus] by [Mode] | [N] [Items], [Tier span]` (QG1: the title number equals the delivered count); no claims/difficulty words. Translations: add translated title+description (Studio -> Subtitles -> Title & description); search uses translated metadata.

## 2. Thumbnails
- Spec: export 3840x2160 JPG/PNG (>= 1280x720; under 720p Test & Compare downscales every variant to 480p), upload via desktop Studio (50 MB; the 2 MB cap is mobile only); custom thumbnails need phone verification; thumbnail policy violations cost strikes and 30 days without the privilege. YouTube's design advice: rule of thirds, readable text, not too complex (nothing on contrast/faces/word counts).
- A text-free, dark, full-bleed scene is the BASELINE (45 of 66 are text-free; text does not separate winners 12/36 vs 9/30); a lit window/screen/fire is the focal point in two thirds of both arms: do not optimise brightness or hue. Text, when present, is 1-5 words.
- Archetypes (Test & Compare Round 1, identical definitions for all nine): **A** wide establishing scene, no text (niche default, 24/36 winners); **B** close focal detail + one short word (e.g. "STORM", "NIGHT SHIFT"); **C** typographic-forward. **D (new; Night Quarters and Someone's Here only):** a resting figure from behind or in profile, no face (winners 8/36 vs median 1/30, HYPOTHESIS; mostly vehicle sleepers); T&C takes 3 variants, so D REPLACES C on those six videos. Pool results by archetype, not by video.
- Quiz template, identical across a series: 3-word imperative headline ("GUESS THE MOVIE"); one clear visual (single hero image or emoji equation, preferred over a 10-21-tile grid for the first test; the grid is contested: fewer sample winners 6/22 vs 12/22 but no difference in pairs); maximise black/white/saturated block contrast (winners have higher tonal contrast in 25 of 31 pairs, sign p = 0.0009; 16 of 20 channel-controlled); count badge ("50"), waveform badge for audio rounds; no mascot or preschool palette.

## 3. Descriptions and tags
- Unique per video; feature the 1-2 main words; channel default description for boilerplate only; YPP reviewers read metadata/About as evidence of templated content; winners name their tools/engine more often (12/36 vs 3/30). Sound lists, length and CTAs do not differ between arms. First lines show before "more" (no published character count). Hashtags: YouTube shows up to 3 it considers most engaging; > 60 hashtags and all are ignored. Clickable links need Advanced features.
- Ambient `description.txt` template: Line 1 a second-person scene sentence ("You're in the crew quarters of a long-haul starship while the night shift sleeps."); Line 2 `10 hours · dim screen, black-screen version linked below · no loops: every sound event is generated once.`; blank; `What you'll hear:` list (no speech);
  `How this was made:` honest provenance (scene designed by us; what is rendered/synthesised/procedural; model names only if actually used; never "No AI"); `Series:` playlist + black-screen link; chapters ONLY if the render has a real arc that they truthfully follow (no later description line may start with a timestamp unless it belongs to the chapter list; ~1 % of >= 10 h uploads use chapters, so it is an observation, not a proven lever); <= 3 relevant hashtags.
  Leave out: long keyword blocks (no difference; spam risk), "headphones recommended", "no music" (median-band habits), and alternative titles (those live in `titles.txt` only).
  NOTE: the template's "keyframes were made with <model> and animated by our own 2.5D engine" line is for the planned AI-keyframe path; for the built Blender/CC0-scan scenes write what is true (Poly Haven CC0 scans rendered in Blender, synthesised audio) and keep the licence log `S:/ambient/tex/LICENSES.json` as the provenance source.
- Quiz description: one-line hook naming format and count; rules; creator-written round timestamps (`00:00 Intro · 00:18 Easy · ...`; otherwise YouTube auto-chapters label them "Introduction and setup"); a "comment your score" line (allowed); series playlist link; credits/sources for assets; 3 hashtags; keep it over 500 characters and avoid a keyword-list line.
- `tags.md`: tags play a minimal role (useful for common misspellings); cap 500 characters including commas; ~15-20 plain tags (main words, synonyms, misspellings); same format as other channels: one comma line in a code fence plus the character count.

## 4. Audience and disclosure fields (set explicitly in manifest + uploader; API uploads ignore browser upload defaults)
| Field | Ambient | Quiz |
|---|---|---|
| `made_for_kids` / `selfDeclaredMadeForKids` | `false` on EVERY upload (and channel default) | `false`; no mascots, nursery language, "for kids" |
| `contains_synthetic_media` | stylised/procedural (Night Quarters, Slow Machines, castle/Mars) = No; photoreal AI keyframes of domestic interiors (Someone's Here) or a generative model as main audio = Yes. **For the built Blender/CC0-scan scenes this is OPEN (no AI is used at all): decide per video** | No for card renders; Yes if any realistic AI person/scene/voice |
| Rationale | one line in `upload-manifest.json` `synthetic_media_rationale` (persistent non-disclosure is penalised) | same |
| Category | People & Blogs or Entertainment (owner decision) | Entertainment |
Disclosure has no stated reach or monetisation penalty. The old "Misleading metadata" policy is now "Malicious clickbait" in the Spam Policy; "Automated or synthetic mass-production" was added between 2026-04-02 and 2026-10-07. Most of the toolkit (chapters, links, pinned comments, Related video on Shorts, Test & Compare, multi-language metadata) needs Advanced features: check eligibility before the first long-form upload.

## 5. Surfaces
One series playlist per series (a video can be in only one series playlist); pinned comment with the chapter list or "next in the series" (Advanced); cards at chosen timestamps instead of relying on the end screen (last 5-20 s, which few viewers reach on 10 h);
Channel Home section per long-form line + a featured video for returning subscribers rotated per E1 week; Shorts -> long-form via a Related video link (Advanced; Shorts slots belong to the Etcherr871 pipeline: owner decision); mid-roll OFF for sleep variants (gate P5).

## 6. Test & Compare plan (extends R06 section 10.4)
- Desktop-only, up to 3 thumbnails/titles per test, winner = highest watch-time share, "Inconclusive" when impressions are too few: the FIRST variant uploaded stays, so upload the preferred variant first; changing title/thumbnail manually mid-test stops it; excluded for made-for-kids, age-restricted and private videos; titles testable globally since 2025-12-04.
- **Round 1 (d0-14, every E1 video), thumbnail only:** A/B/C (D replaces C on NQ and SH); do not edit the thumbnail during a test.
- **Round 2 (E2), title only, three variants:** A = `[Place] | [one sound phrase]` (default); B = A + ` | 10 Hours` (old grammar); C = a second-person scene frame without an outcome claim ("You're Asleep in a Starship Bunk...").
- Quiz, thumbnail only from video 1: A single hero + 3-word headline; B emoji equation; C tile grid.
- Readout: watch-time share next to CTR and engaged views; read at >= 14 days. Pre-register that T&C winners do not determine series continuation; they only choose the archetype for later videos.

## 7. Package layout and manifest (shared `release-calendar/<YYYY-MM>/<DD>/<slug>/` convention, unchanged)
Shared core per video: `upload-manifest.json` (`slug`, `chosen_title`, `alt_titles_file`, `description_file`, `thumbnail`, the video file, `tags_file`, `sources`, `scheduled_time_morocco`, `status` = `ready_to_upload`, `source_of_truth`, `drift_check`, a `sha256` map of every file, `pipeline_version`, `metadata_format`), `titles.txt` (chosen first), `description.txt`, `tags.md`, `sources.md`, `thumbnail.png`.
```
<YYYY-MM>/<DD>/<slug>/
  upload-manifest.json      metadata_format: "ambient-longform-v1" | "quiz-longform-v1"
  video.long.mp4            10:00:00 master (a rooted-path reference or hardlink to the single master, not a copy), named by manifest key `long_video`
  thumbnail.png  thumbnail.b.png  thumbnail.c.png     variant A uploaded first; D replaces C for NQ/SH
  titles.txt  description.txt  tags.md
  sources.md                provenance: world-spec id, model ids/revisions/seeds, asset licences / quiz answer sources (QG2)
  captions.long.srt         quiz only
  QA-REPORT.json            ambient C/G gates or quiz QG1-QG5 results
  ASSET_PROVENANCE.json     MASTER section 20 schema (extends HES music-library.json)
```
Manifest fields beyond the core: `long_video` (+ `long_captions_file` for quizzes), `line` (`ambient`|`quiz`), `series`, `runtime_s`, `made_for_kids:false`, `contains_synthetic_media` + `synthetic_media_rationale`, `category`, `default_language`, `translations[]`, `playlist`, `pinned_comment_file`, `cards[]`,
`tc_plan{type, variants[]}`, `scheduled_iso`, `human_approval{g0, g1, by, at}` (renders and uploads need human approval), `qa_report`. A day folder gets " (x)" once it holds the day's target of `ready_to_upload` subfolders. `LEDGER.json` = `{schema_version, purpose, channel, cadence, entries[]}`; each entry `{slug, ..., release_date, scheduled_time_morocco, status:"scheduled", folder}`.
Where packages live: the canonical calendar for @etcherr871 is `etcherr871/release-calendar/` (owned by the Etcherr871 agent; this line cannot write there). **Default until the owner decides: staging mirror `ambient-channel/release-calendar/`** (identical layout; `LEDGER.json` exists with `entries: []`, `channel: "Etcherr871"`); the Etcherr871 agent or owner copies a finished package into the canonical calendar. Option (b): the owner adds a CLAUDE.md row letting long-form lines write into `etcherr871/release-calendar/` (then handle section 8).

## 8. Compatibility with etcherr871's scheduler (verified from `etcherr871/mc/stage.py`)
1. **`clip_id` is mandatory in every LEDGER entry:** `_ledger_record` and `ledger_remove` filter `e["clip_id"]` over ALL entries, so one entry without it crashes the Shorts scheduler. Long-form entries use `clip_id: "longform:<line>:<slug>"` plus `title`, `release_date`, `scheduled_time_morocco`, `status`, `folder`; `source_url`/`caption` null.
2. **Day markers count every ready subfolder** (`refresh_day_marker`: `ready >= len(slots())`): a long-form folder would mark a day " (x)" with only 3 Shorts. The fix belongs to Etcherr871's code owner (count only `metadata_format == "clip-card-v1"`). Until then long-form packages must not sit in a canonical day folder as `ready_to_upload`: one more reason for the staging mirror.
3. **Slot allocation reads the clips DB, not the calendar** (`next_free_slot` -> `db.taken_slots()`), so a long-form time is invisible to it: use a time that is not a Short slot.

## 9. Release time
Long-form proposal **02:00 Morocco** (the top slot of technews/HES; not one of Etcherr871's 09/13/17/21 Short slots); at most one long-form per day; 1-2/week per line at launch (HYPOTHESIS; P7 cadence cap). Morocco has been UTC+0 since 2026-09-20 (Decree 2.26.530; tzdata 2026c shows +01:00 until 2026-09-19, +00:00 after), so 02:00 Morocco = 22:00 EDT / 19:00 PDT until US DST ended (2026-11-01), then 21:00 EST / 18:00 PST.
The HES LEDGER's "UTC+1 year-round" note and technews `UPLOAD_TIMING.md` (UTC+1 except Ramadan) are now 1 hour off; those files belong to other channels: flag, do not edit.

## 10. ReleaseCatalog (WPF app `release-catalog/ReleaseCatalog/`) and 10 h masters
How the app reads a long-form package (verified from source: `Services/CalendarScanner.cs`, `HashService.cs`, `Controls/EntryCardControl.xaml.cs`):
- One folder, one entry: a folder holding `upload-manifest.json` (or `manifest.json`, `release-manifest.json`) is claimed as one entry and its subtree is not scanned; a folder without a manifest is claimed only if it directly contains a video file.
- **The master must be named by a `*_video` key.** Every string-valued manifest key whose `_`-split name contains `video` becomes a variant (`long_video` = "Long", `black_screen_video` = "Black Screen"); a manifest with NO such key is skipped as "not worth showing" (invisible). A key containing `caption` pairs with the variant whose first name token matches (`long_captions_file` <-> `long_video`).
- Paths: relative values resolve against the package folder; rooted values (`S:/...`) are used as is. Other keys read: `slug`, `chosen_title`, `status`, `alt_titles_file`, `description_file`, `tags_file`, `sources`, `thumbnail`, `source_of_truth`, the `sha256` map, any array whose name contains `recommended`; long-form-only fields are ignored without error.
- Drift check: `sha256` is keyed by the video's FILE NAME; if present, the whole file is hashed the first time the card is shown and by "Verify all" (async; cached by path+size+mtime in `%APPDATA%\ReleaseCatalog\hash-cache.json`); without an entry it shows "no recorded hash" and reads nothing.
- "Uploaded" is stored per `<calendar id>|<entry folder path>`: copying a package from the staging mirror to the canonical calendar creates a new, unticked entry; tick uploads in whichever calendar is the system of record.
One copy of each 10 h master (proposal; sizes since MEASURED: roommate 4.36 GiB, marble 17.0 GiB; free space 2026-10-12: H: 88.8 GB, S: 235 GB): each master exists once at `S:/ambient/masters/<slug>/video.long.mp4` (moved/hardlinked from the render, never copied). The calendar is on H: and the master on S:, so the package cannot hardlink it: the manifest points to it with a rooted path, `"long_video": "S:/ambient/masters/<slug>/video.long.mp4"`.
A self-contained package (another machine, or option (b)) needs a real copy on that volume: make it once at hand-off and re-record `sha256`. Hardlinks work only inside one NTFS volume (`New-Item -ItemType HardLink -Path <new> -Target <existing>`; `fsutil hardlink list <path>`). Keep the file name identical everywhere the master is linked; never edit a linked master in place (re-encode to a new name, record its hash, re-link; overwriting one name rewrites shared data and the catalog flags DRIFT, replacing by rename leaves the other name stale without warning);
space is freed only when the last name is deleted. Record `sha256` at scheduling time to get drift detection (cost: one full read per path, minutes per 18 GB master; "Verify all" reads every recorded master in turn).

## 11. Owner decisions this area still needs
1. Staging mirror (a) vs shared calendar (b). 2. Whether quiz/ambient Shorts may use Etcherr871 Shorts slots and Related-video links. 3. Whether the Etcherr871 owner fixes the " (x)" counter to count only Shorts. 4. Ambient category (People & Blogs vs Entertainment). Also the Morocco UTC+0 note in other channels' files.
