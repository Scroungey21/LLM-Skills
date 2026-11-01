---
name: clip-card-shorts
description: Run, review or extend the Etcherr871 channel (@etcherr871) - found real-world clips (animals, skills, awkward humans, "wait, what?" moments) re-framed in a fake social-post card (X-style / Frame Studio) with ONE caption that adds context or a take, plus optional reaction memes or timed Snapchat beats, released as 4 Shorts a day into an HES-shaped release calendar. Standalone Python CLI (etcherr871/clips.py); Claude itself is the review and caption layer via hand-off packets (no model APIs). ABSOLUTE RULE - never stock footage. Use whenever the task is about Etcherr871, clip-card / meme-card / found-footage Shorts, reviewing contact sheets, writing clip captions, vetting clip sources (TikTok/YouTube/Reddit), or scheduling these releases. Not for narrated explainers, simulations or ambient video.
---

# Clip-card Shorts (Etcherr871)

## What this video type is
A 2-60 s **real clip someone actually filmed**, placed in a fake social-post card (profile header + one caption line + the
clip), 1080x1920, 30 fps. The clip carries the moment; the edit adds what the clip cannot: missing context, a hidden
detail, a sharp take, a question, or a meme that casts/judges the situation. Format reference: @BeYourselfOkBro.
Channel: youtube.com/@etcherr871 (the user's own). No voice-over, no TTS, no GPU, no Docker service. Footage is only
re-framed, captioned and loudness-normalised, never generated.

**Use this subskill** for: running a batch, doing the agent review (you ARE the LLM layer), writing captions, choosing
an edit style/meme, vetting sources, scheduling/re-scheduling releases, changing the pipeline.
**Do not use it** for: narrated explainers (`news-explainer`, `everyday-systems-explainer`), simulation Shorts
(`physics-simulation-shorts`), long ambient streams (`ambient-long-form`). Do not touch other channels' folders.

## Non-negotiable invariants (each is owner-decided; changing one needs an owner decision recorded with a date)
0. **NEVER stock footage** (owner, 2026-10-04, "NEVEEEEER", absolute, no "just this once"). Stock, b-roll, royalty-free /
   library clips (Pexels, Pixabay, Shutterstock, Pond5, Storyblocks, Envato, Getty/iStock, Adobe Stock, Artgrid, Videvo,
   Mixkit...), stock-site/agency watermarks, and **anything that looks like stock** (polished broadcast, arena, agency,
   pro-photography footage; generic polished shot with no real moment) are out, in clips, memes and thumbnails. Why: the
   channel's whole value is real moments. Enforced three times: `is_stock()` at discovery (also refuses `clips.py add`),
   `stock_footage: true` at review (ingest rejects unconditionally), and sources that serve stock are never verified.
   **When unsure, it is stock - reject.**
1. **The agent is the LLM layer** (owner, 2026-10-04). The pipeline NEVER calls a model/vision API. It writes review
   packets (`data/review/<clip>/sheet.jpg` + `request.json`); you read the sheet and write `analysis.json`; code validates,
   gates, renders, stages. Never add Gemini/Anthropic/LM Studio backends. Why: owner wants the agent's own judgment, not a
   separately billed service.
2. **Original link in every description** (R4): `Original video: <url>` + `Credit: <uploader> (<platform>)`, auto-generated
   by `mc/stage.py`; never remove by hand. The owner holds rights decisions (R5: any publicly reachable video may be
   fetched). Do not re-argue copyright.
3. **Every caption adds something** (a `caption_job`): context, hidden skill, archetype, question, escalation, ironic
   proof, first-person take, satire reframe, or a cast/judging meme. A description, a reaction anyone would have, or the
   original title is not a caption -> lower `fit`, the clip is not worth posting.
4. **Gates are strict; when unsure, reject**: unsafe (incl. punching down), foreign watermark, another page's burned-in
   caption, `fit` < 7, compilations/slideshows/ads/static images (fit <= 3), duration outside 2-60 s.
5. **Only verified sources feed discovery**; stock-serving sources never get verified.
6. **Card design belongs to Frame Studio** (`H:/Projects/frame-studio`, outside the repo, imported read-only, never edited
   from here). Other edit styles are Python/ffmpeg ports of the owner's Braketools tools (read-only design basis).
7. **Release calendar mirrors Hidden Everyday Systems**: `<YYYY-MM>/<DD>[ (x)]/<slug>/`, `LEDGER.json`,
   `schedule_release.py`. Only `mc/stage.py` renames day folders. Never hand-edit a staged `video.short.mp4`.
8. **Silent clips MUST get a calm CC0 bed** from `music/catalog.json` only (never Kevin MacLeod/incompetech; energy <= 6.0).
9. **One source video is posted at most once** (DB URL/ID uniqueness + perceptual-hash dedupe + `LEDGER.json`).
10. **Boundary rule**: this channel owns `etcherr871/` only. The one recorded exception (owner, 2026-10-04): READ-ONLY use of
    `hidden-everyday-systems/release-calendar/`'s folder STRUCTURE (not its prompts, assets, topics or code).
    Other channels must not touch `etcherr871/`.

## Pipeline, with the gate at each step
```
discover -> fetch -> prepare -> [AGENT writes analysis.json] -> ingest -> render -> stage
sources.py  fetch.py  analyze.py   (you, per references/agent-review-and-captions.md)  analyze.py  render.py+styles.py  stage.py
```
| Step | What happens | Gate |
|---|---|---|
| discover | verified accounts / Reddit Atom feeds / watch URLs / manual `add` -> candidate rows | `is_stock()` drops stock; only `status: verified` sources |
| fetch | yt-dlp download (<=1080p, <=150 MB), dHash dedupe (<=6/64 bits = same clip) | duration 2-60 s, no reposts, no over-length (never trimmed) |
| prepare | 12-frame contact sheet + `request.json` per clip | pauses the run for you |
| agent review | you read sheet, set gates, `fit`, caption job, 5 captions, `edit`, metadata, music | `stock_footage`/`unsafe`/`foreign_watermark`/`burned_in_text`/`fit>=7` |
| ingest | validates `analysis.json` against `SCHEMA`/`EDIT_SCHEMA`; clip+meme <= 60 s; silent clip needs `edit.music` | malformed file waits for a fix |
| render | Frame Studio card or `mc/styles.py` compositor, loudnorm -16 LUFS | QC: 2-60.5 s, > 100 kB, valid; failure rejects, never stages broken file |
| stage | next free slot -> release folder + ledger + day marker | one clip per slot; refuses a taken slot |

`clips.py run -n N` is one **resumable** pass: tops up discovery, fetches what is needed, **pauses at the agent hand-off**
when verdicts are missing; after you write them, run it again. Every stage reads state from DB/files, so it can be re-run
at any point. Rejects still need a complete `analysis.json` (short placeholders) so the record is complete.

## Route the task
| Task | Read |
|---|---|
| Why the channel exists, hard rules R0-R18, taste/selection/caption/framing principles | `references/principles-and-rules.md` |
| Stages, modules, files, data model, `config.json`/`vibe.json` schemas, full command surface | `references/architecture.md` |
| Adding/vetting/dropping sources; platform access; the current registry | `references/source-discovery.md` |
| **A run paused for review (you are the LLM layer)**: packet procedure, `analysis.json` schema, caption jobs | `references/agent-review-and-captions.md` |
| Which edit style / meme / music for this clip; research behind it; meme and music libraries | `references/edit-patterns.md` |
| Exact specs (canvas, codec, style geometry, caption/title/tag limits, release-folder format, manifest keys) | `references/standards-and-qa.md` |
| Slots, `plan`, `schedule_release.py`, ledger, day markers | `references/release-calendar.md` |
| What is done, what is next, open questions, platform-policy roadmap (dated) | `references/current-state.md` |

## Where the live data lives (repo-root `etcherr871/`, paths relative to it)
`clips.py` (CLI) - `config.json` (adapters, profile, slots, gates) - `sources.json` (registry; only `verified` is used) -
`vibe.json` (taste + caption voice, read at every review) - `mc/` (pipeline modules) - `memes/` (reaction memes) -
`music/` (CC0 beds) - `research/` (edit-pattern research, `edits.jsonl`) - `source-material/<date>/<clip>/` (every kept
original + `source.json`) - `assets/pfp.jpg` (card avatar) - `data/` (gitignored: `clips.db`, `downloads/`, `review/`,
`renders/`, `vetting/`, `work/`) - `release-calendar/` (`LEDGER.json`, `schedule_release.py`, `<YYYY-MM>/<DD>/<slug>/`).
Media (mp4/png/jpg in the calendar, source-material, memes, mp3s, `research/corpus/`) is gitignored; `memes.py rebuild` /
`music.py rebuild` re-download from the catalogs.

## Commands
Interpreter: the repo-root venv, `<repo>/.venv/Scripts/python.exe` (moved from `engine/.venv`; the channel's own README
may still show the old path). Run from `<repo>/etcherr871/`, so the venv is `..\.venv`. Python packages the venv needs are
listed in `references/architecture.md` section 1.
```powershell
cd <repo>\etcherr871
$py = "..\.venv\Scripts\python.exe"
& $py clips.py doctor            # ffmpeg, yt-dlp, Frame Studio layout.py, timezone
& $py clips.py run -n 3          # discover -> fetch -> review packets ... PAUSED for the agent
#   you: read data/review/<clip>/sheet.jpg + request.json, write analysis.json next to them
& $py clips.py run -n 3          # ingest -> render -> stage into release-calendar/
& $py clips.py status
```
Full surface (`add`, `redo`, `plan`, `vet`, per-stage commands, `schedule_release.py`) is in `references/architecture.md`.
After every batch: **open at least one rendered `thumbnail.png`, and a mid-clip frame for timed styles** (snap,
bottom_meme, after_meme); check text sits inside the Shorts safe zone, the label sits on the split, the meme starts on
the payoff.

## Working habits
- When in doubt, reject; the pool refills every discovery run. Record WHY (`reject_reason`) - it tunes `vibe.json` later.
- Three good Shorts a day beat ten mediocre ones; a strict `fit` is a feature (taste is the product).
- Report honestly what you cannot see (audio-only jokes, cropped text); never guess in the clip's favour (R15).
- This subskill's `references/` replace the channel's former `etcherr871/docs/*.md` (compacted here); stale pointers to
  `docs/AGENT-REVIEW.md` etc. in code comments or the README mean the matching reference file above.
