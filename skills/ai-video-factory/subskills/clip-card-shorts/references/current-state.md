# Etcherr871: current state, open items and roadmap

State as compacted on **2026-11-01** from the channel files; the build itself dates from 2026-10-04 (all owner decisions below
carry that date unless noted). Re-verify counts against the live files before relying on them.

## Done
- Pipeline built and exercised end to end: discover -> fetch -> prepare -> agent review -> ingest -> render -> stage, resumable
  (`clips.py run`), plus `redo`, `plan`, `vet`, `add`.
- Seven edit styles: `post` (Frame Studio), `xpost` (default), `meme_bar`, `impact`, `snap` (timed beats), `bottom_meme`,
  `after_meme`; music beds for silent clips.
- Source registry: 49 entries vetted 2026-10-04 (11 verified: 6 Reddit subs, 5 TikTok creators; 38 rejected with reasons). No
  verified YouTube channels or Instagram/X sources.
- Libraries: 5 reaction memes (`memes/catalog.json`), 11 calm CC0 music beds (`music/catalog.json`).
- Release calendar: `LEDGER.json` holds **56 entries, all `scheduled`**, 4 per day for 2026-10-05 .. 2026-10-18 (14 days x 4
  slots); folders scaffolded for 2026-10, 2026-11, 2026-12. `source-material/` has dates 2026-10-04 and 2026-10-05.
- Research: `research/edits.jsonl` (23 analysed videos) behind the caption jobs and decision guide.

## Unknown / not tracked
- Whether the 56 scheduled Shorts were actually uploaded: the ledger only has `scheduled` (no `uploaded` status) because this
  channel has no uploader yet. Today's date is past 2026-10-18, so the pool of staged clips needs refilling
  (`clips.py run -n N`) before the next upload window - ask the owner what has gone out.
- Any analytics (retention, impressions per upload). None are pulled back into the ledger.

## Next (not started; each beyond a basic refill is an owner decision)
1. **Refill the pool** and re-vet/prune sources; consider re-vetting r/interestingasfuck (good earlier yield) and finding
   verified YouTube channels (only Reddit + TikTok feed discovery today).
2. **Uploader**: Puppeteer-style, consuming `upload-manifest.json` and marking ledger entries `uploaded` (HES has the pattern).
3. **Analytics loop**: per-video retention/views back into the ledger; promote top-retention captions into
   `vibe.json -> caption_examples`, retire stale ones (record each change with a date in `_note`).
4. **Speech transcript in the packet**: local speech-to-text (e.g. faster-whisper on CPU) writes `transcript.txt` beside
   `sheet.jpg`; still no model API, the agent reads it. Then density-aware sheets (more frames around cuts/motion peaks), then a
   first-3-seconds hook mini-sheet. Today the agent sees 12 frames and no audio, which misses spoken punchlines and timing.
5. **TikTok discovery gap**: self-hosted Douyin_TikTok_Download_API (Docker, REST + MCP, no signup) could feed a `tiktok`
   adapter - only if Reddit/YouTube yield runs dry (another service to keep alive). For Instagram/X use `watch` URLs through yt-dlp
   before considering dedicated scrapers.

## Platform pressure and the originality ladder (YouTube, 2026-10-01)
YouTube said it would reduce Shorts-feed distribution for channels that mainly aggregate/re-upload others' clips "without
significant changes" (voice-overs that only describe the screen, minor technical edits and template-based bulk changes are NOT
enough; original commentary, unique editing and storytelling count). It is a recommendation change, not a strike; monetization
rules are separate. A caption card on a found clip is close to that line, so measure, do not assume:
- **Now**: captions do real work (a reframe that changes how the clip reads, not a label); strict selection; credit every source.
- **Watch for**: Shorts-feed impressions per upload trending down while views from subscribers/browse hold.
- **Already built**: caption jobs, timed multi-beat `snap` captions, cast/judging reaction memes.
- **If it bites, escalate in this order, each a separate owner decision**: (1) raise the share of meme_cast and multi-beat edits and
  grow the meme library; (2) a short original reaction/commentary line in a house voice (would need a TTS voice/service - see the
  shared references on new-channel setup and the toolkit TTS); (3) themed episodes with connective commentary (crosses into
  storytelling, away from single-clip Shorts).
- **Taste that learns**: use `reject_reason` to drop/reweight sources that mostly reject; keep a per-origin acceptance rate
  (rejected vs staged by `origin`) and prune low-yield sources quarterly.
- **Stays fixed whatever adapts**: credit on every post, no shock content, never stock footage, the agent as the judgment layer, the
  shared calendar shape.

## Known issues after the repo reduction (2026-11)
- **Keep `etcherr871/docs/`.** The channel's own docs were deliberately NOT deleted in the reduction: `mc/vet.py write_snapshot()` rewrites the "## Registry snapshot" section of `etcherr871/docs/SOURCES.md` (so `clips.py vet record` / `vet snapshot` crash without it), and `mc/analyze.py`, `mc/sources.py`, `mc/audio.py` point agents at `etcherr871/docs/*.md`. This subskill's `references/` is the compact version; the channel docs remain authoritative for the code that reads them.
- **Interpreter path**: repointed to `<repo>\.venv\Scripts\python.exe` in `etcherr871/README.md` and `docs/ARCHITECTURE.md` (the shared venv moved from `engine\.venv`).
- **External apps**: card rendering for `post` needs `H:/Projects/frame-studio/layout.py` (outside the repo); not part of the reduction and not bundled.

## Contradictions found in the source docs (resolved here as noted)
- Agent contact sheet size: STANDARDS/AGENT-REVIEW say **12 frames** (6x2); ADAPTATION-VISION says "8 frames". Used 12 (matches the
  standard and request packet spec; vision text looks stale).
- Cadence: RULES R16 and `config.json` say **4/day at 09:00/13:00/17:00/21:00**; ADAPTATION-VISION says "three slots a day (12:00 /
  17:00 / 21:00)". Used 4/day (owner decision 2026-10-04, matches config and ledger). The vision line is stale.
- `snap` safe zone: AGENT-REVIEW says `y` roughly 0.08-0.80; STANDARDS says clamped 0.10-0.78. The clamp (0.10-0.78) is what is
  enforced; treat the wider range as guideline only.
- Captions: AGENT-REVIEW says write five; ingest only requires >= 3. Write five anyway.
- Reddit feed period: SOURCES text mentions `t=day` in the URL pattern, `config.json` sets `period: "month"` (the vetting samples
  were from top-of-month feeds). Config wins.
- The "Shaq" clip appears as a worked example in AGENT-REVIEW, but R0b records it was pulled as "looks like stock"; the example is
  kept only to show caption-job reasoning.
