# Etcherr871: philosophy, principles and hard rules

When a rule seems to point the wrong way for a case it did not foresee, decide from section 1. Hard rules (section 3) are not
judgment calls: code enforces most, the agent must enforce the rest. Changing one is an **owner decision; record it with a
date** here (and in `current-state.md`).

## 1. Philosophy: what the channel is and is not

Etcherr871 posts short real-world clips (absurd, impressive, awkward, relatable, "wait, what?") inside a fake social-post card:
profile header, one line of caption, the clip below it. Reference format: @BeYourselfOkBro.

Beliefs every other rule derives from:
1. **The clip carries the moment; the edit adds what the clip can't**: missing context, hidden detail, sharp take, a question
   worth arguing about, or a meme that casts/judges the situation. A caption that only describes the footage, or reacts the way
   anyone would, is a useless addition and does not ship.
2. **Taste is the product.** Anyone can download a viral clip; the value is the filter (what we do NOT post). 3 good Shorts a
   day beat 10 mediocre ones. A strict `fit` score is a feature.
3. **Credit is part of the post**: every upload links the original video and names who posted it; automatic, never buried.
4. **An editor, not an API.** Judgment (funny? safe? what caption?) is made by the agent looking at actual frames, like a human
   editor. Code moves files, enforces gates, keeps records, never calls a model API.
5. **Same calendar as the other channels** (HES folder-calendar shape) so release tooling and operator habits carry over.
6. **Honest metadata**: titles/tags describe what is in the clip. Curiosity is fine; claiming what the clip doesn't show is not.

Not this channel:
- **Never stock footage**, not once, not as filler, not in a meme slot (R0).
- Not a compilation channel: one moment per Short, never "Top 5".
- Not generative video: footage is real and only re-framed, captioned and loudness-normalised.
- Not shock content: gore, cruelty, minors in distress, hate, real tragedies are rejected however well they'd perform.
- Not a roast channel: comment-roast formats (bodies, disability, ethnicity, sex) work for other meme pages; Etcherr871 laughs
  with people and at situations, never at who someone is.
- Not a commentary/voice-over channel (today); see `current-state.md` for where that may change.

## 2. Working principles (day-to-day judgment)

**Selecting clips**
- Payoff in the first 3 s, or a reason to wait (the caption creates the anticipation, e.g. "wait for the second guy").
- One moment, one clip: prefer the source's tightest cut; never stitch.
- Clean picture beats viral count: a less popular clip without someone else's watermark/baked-in subtitles is the better post.
- Reposts collapse to one (perceptual-hash dedupe keeps the first); do not re-add a near-duplicate by hand.
- Variety across a day: avoid three clips of the same type (three sports, three pets) in one day's slots when the pool allows.

**Writing captions** (details and jobs in `agent-review-and-captions.md`)
- Pick the job first, then the words. Write five, pick one (first idea is rarely the best).
- Refer to THIS clip; if it fits fifty other clips it is not done.
- Context facts come from the original post or what is visible. Never invent numbers or backstory.
- Up to two emoji, at the END only (😂😂 🤔 💀 😭). No hashtags, ALL CAPS or "!!!".
- Never punch down. Don't reuse the original post's title. The YouTube title is a second take (emotion, hook, nickname), not a
  copy of the caption.

**Choosing the edit**: default `xpost`; change only when it adds something (decision guide in `edit-patterns.md`). A meme must
cast or judge, never mirror the emotion already on screen. One meme per Short. Time reveal beats and `bottom_meme` starts to
frame times on the contact sheet.

**Framing**: Frame Studio's default **crop** fills the window but shows only the middle ~46% of a 9:16 clip's height (middle
~68% of a 16:9 clip's width) - use only when the action is central. Use **contain** (whole clip over blurred fill) whenever crop
would cut faces, key action or the punchline; losing the joke to save the fill is never worth it. (`xpost` never crops.)

**Metadata**: title searchable and honest, < 70 chars, no hashtags, name famous people only when the original post identifies
them. Description: one hook sentence, then original link + credit, then hashtags. Tags: what someone would type to find the clip;
no unrelated trending tags.

**Working the pipeline**: resumable over clever (every stage re-reads DB/files). When in doubt, reject. Record `reject_reason`.

## 3. Hard rules (R-numbers are the owner's original identifiers)

### Stock footage (R0, owner 2026-10-04, absolute)
- **R0** Never stock footage. Covers stock, b-roll, royalty-free/library clips (Pexels, Pixabay, Shutterstock, Pond5, Storyblocks,
  Envato, Getty/iStock, Adobe Stock, Artgrid, Videvo, Mixkit, ...), clips with a stock-site/agency watermark, generic polished
  shots with no real moment; every clip, source, edit style, the meme library and thumbnails; no exceptions. Enforced 3 times:
  1. `mc/sources.py` `is_stock()` (regex over title/author/url fields: stock footage/video/clip, royalty-free, b-roll,
     no-copyright footage, pexels, pixabay, shutterstock, pond5, storyblocks, envato, videvo, istock, gettyimages, adobe stock,
     artgrid, motion array, videoblocks, dissolve, coverr, mixkit, filmsupply, wildfilmsindia, newsflare, viralhog, jukin,
     storyful) drops candidates at discovery and refuses `clips.py add`;
  2. review sets `stock_footage: true` -> ingest rejects unconditionally;
  3. sources that serve stock are never verified.
- **R0b** "Looks like stock" counts as stock (owner, after pulling the Shaq clip): polished broadcast, arena, agency or
  pro-photography footage is rejected even when it shows a real moment.

### Audio (R15b, owner 2026-10-04)
A clip without its own audio (no audio stream, or max volume below -45 dB, `mc/audio.py`) MUST get a low-volume background bed:
- only from `music/catalog.json`; CC0/public domain with a recorded licence URL;
- **never Kevin MacLeod / incompetech**; **never energetic/upbeat** (measured energy <= 6.0; `music/music.py` refuses higher);
- chosen by the agent to fit the clip's mood (`edit.music`); mixed at **-24 LUFS** (**-30 LUFS** under clips that do have sound);
- credited in `description.txt` and `sources.md`. Ingest refuses a silent clip with no `edit.music`.

### Source material (R15c)
Every original we keep lives in `source-material/<download date>/<clip>/original.mp4` + `source.json` (original URL, uploader,
where found, sha256). `data/downloads/` is only a transient landing zone. **Rejected originals are deleted, not archived.**
Release folders and `upload-manifest.json` point back to the source-material folder.

### Ownership
- **R1** The pipeline lives in `etcherr871/`, owned by the Etcherr871 agent; it does not edit other channels' directories.
- **R2** Exception (owner, 2026-10-04): READ-ONLY use of `hidden-everyday-systems/release-calendar/` to mirror its folder
  structure. Covers structure only, not that channel's prompts, assets, topics or code.
- **R3** Frame Studio (`H:/Projects/frame-studio`, outside this repo) is imported read-only for card layout; card-design changes
  belong in Frame Studio itself.
- **R3b** Other styles in `mc/styles.py` are Python/ffmpeg ports of the owner's Braketools tools
  (`H:/Projects/Braketools/src/tools/media/{social-post-meme,meme-frame,snapchat-caption}`), read 2026-10-04 as design basis;
  Braketools is not modified or imported.

### Source and credit
- **R4** Every `description.txt` contains `Original video: <url>` and, when known, `Credit: <uploader> (<platform>)`; `sources.md`
  repeats both. Auto-generated by `mc/stage.py`; never remove by hand.
- **R5** (owner, 2026-10-04) Any publicly reachable video may be fetched and used; the owner takes responsibility for rights
  questions; the credit link (R4) is the owner's chosen practice.
- **R6** A source video is posted at most once (URL/ID uniqueness in `data/clips.db`, dHash dedupe in `mc/fetch.py`,
  `release-calendar/LEDGER.json`).

### Automatic rejection (enforced at ingest, `mc/analyze.py`)
- **R7** `unsafe: true`: graphic injury/gore, nudity, minors in distress, medical fear, hate/harassment, real tragedies, jokes
  built on those (e.g. Nazi-lookalike gags), and roast humour aimed at a person's body, disability, ethnicity, sexuality or
  poverty.
- **R8** `foreign_watermark: true`: another account's logo/handle burned into the picture.
- **R9** `burned_in_text: true`: **another meme page's** caption, joke or title card still visible after framing. The source
  creator's OWN speech subtitles or context line (e.g. "That'll be $24") do not count: they carry the clip and may stay.
- **R10** `fit` < `min_fit` (config, default 7).
- **R11** Compilations/countdowns ("Top 5..."), slideshows, ads, static images are fit <= 3.

### Clip limits (`mc/fetch.py` / `mc/render.py`)
- **R12** Source duration 2-60 s (`max_seconds`). Longer clips are rejected, never trimmed.
- **R13** Output must pass QC (`standards-and-qa.md`); a failed QC rejects the clip and stages nothing.

### Agent hand-off
- **R14** The pipeline never calls an LLM/vision API; every fit, caption, edit-style, meme and metadata decision is the agent's,
  made from the contact sheet.
- **R14b** Every caption names its `caption_job`. A description, a generic reaction or the original title is not a caption.
- **R14c** Reaction memes come only from `memes/catalog.json`, added with `memes/memes.py add` after the agent checked the sheet
  (no foreign watermark beyond a meme's own creator mark, no baked-in bars). One meme per Short; clip + meme <= 60 s (ingest).
- **R15** The agent reports honestly: mark what you cannot see (audio-only jokes, possibly cropped text) instead of guessing in
  the clip's favour.

### Scheduling
- **R16** One clip per slot. Slots from `config.json -> schedule.slots`, Africa/Casablanca (`RELEASE_TIMEZONE`).
  `schedule_release.py` refuses a taken slot. Cadence (owner, 2026-10-04): **4 Shorts a day, 4 h apart: 09:00, 13:00, 17:00,
  21:00.** `clips.py plan <start> -n <days>` lays out the rendered pool so neighbouring slots never share a source or style.
- **R17** Day folders carry ` (x)` exactly when every slot of that day holds a `ready_to_upload` clip. Only `mc/stage.py` renames
  day folders; never rename by hand.
- **R18** Never hand-edit a staged `video.short.mp4`. Re-render, then re-run `schedule_release.py` so the sha256 in
  `upload-manifest.json` stays true.
