# ShortsFactory vs clip-card-shorts (Etcherr871): which to use, and what to port between them

Both turn other people's real clips into Shorts. Etcherr871 (`../../clip-card-shorts/SUBSKILL.md`) is the LIVE, hand-reviewed pipeline; ShortsFactory is the archived, more elaborate DESIGN. They were built under different owner
decisions within about five weeks of each other, and the later one (Etcherr871, 2026-10-04) explicitly superseded ShortsFactory's model-API step. Read this before choosing a base for a new channel.

Contents: 1 Decision rule - 2 Side by side - 3 Ideas to port into Etcherr871-style pipelines - 4 Ideas to port into a ShortsFactory-style factory - 5 Do not mix

## 1. Decision rule

| You need... | Use |
|---|---|
| To run, review or schedule the existing `@etcherr871` channel today | **clip-card-shorts** (live code, ledger, calendar) |
| One theme, found-clip Shorts with a witty/contextual caption card, owner-accepted rights risk, several posts a day, no human approval click | **clip-card-shorts** as the base |
| SEVERAL themed channels from one inbox (routing, per-channel quotas, brands), a strict permission workflow, a human approval gate, compilations with foreshadow cards | **this subskill** (restore or re-implement the design) |
| Rights-gated content that must stay non-publishable until written permission exists | **this subskill** |
| Long-form roundups of clips | this subskill's `compilation.md` (but see the originality risk), or ambient-long-form's quiz line; E871 forbids compilations (R11) |
| Narrated explainers, simulations, ambient video | neither: `news-explainer`, `everyday-systems-explainer`, `physics-simulation-shorts`, `ambient-long-form` |
A new channel in this theme usually starts from clip-card-shorts' machinery (it runs) and borrows the ShortsFactory ideas in section 3 as the owner's policy requires.

## 2. Side by side

| Dimension | ShortsFactory | Etcherr871 clip-card-shorts |
|---|---|---|
| Status | archived design, restorable (80 files), 14 tests pass; never used in production | live; 56 scheduled entries; refill needed |
| Who supplies clips | owner places files in an inbox | pipeline discovers from verified sources and fetches (yt-dlp, Reddit Atom) |
| Rights regime | gated (`unknown`/`discovery_only` = edit-only, never publishable until cleared) | R5: owner accepts risk, always credits the original |
| LLM layer | code calls a hosted API (to be replaced); design says harness | agent writes `analysis.json` from a contact sheet; no model API ever |
| Human gate | dashboard approve/reject/revise, explicit and persisted | agent review gates (`fit >= 7`, safety, watermark), owner uploads |
| Safety filter | 5 enumerated categories, confidence >= 0.85, physical deletion with audit line | `unsafe` boolean (gore, nudity, minors, hate, punching down...), rejects deleted by design (R15c) |
| Channels | 3 themed (routing, quotas, diversity penalty) | 1 channel (variety across slots by `plan`) |
| Dedupe | SHA-256 + temporal sequence of 64-bit dHash frames (>= 0.92) | middle-frame dHash (<= 6/64 bits), URL/ID uniqueness, ledger |
| Format | one branded template, crop-fill, 60 s cap, original audio + 0.2 music | 7 edit styles (xpost default, snap, memes...), 2-60.5 s QC, silent clips get a calm CC0 bed |
| Captions | one overlay line, grounded; model writes 3-5 options | nine caption jobs, 5 captions, 3-15 words, trailing emoji only |
| Compilations / TTS | yes, with dots.tts interstitial narration | none (R11); no TTS at all |
| Release | `output/<channel>/<date>/N.mp4` + `metaN.json`; weekly CSVs | HES-shaped release calendar, `LEDGER.json`, `upload-manifest.json` with sha256, `(x)` markers |
| Upload | optional API publisher (off) | owner uploads from the calendar; no uploader yet |
| Analytics | optional snapshots + frequency advice | none yet (roadmap) |
| Stock footage | forbidden | forbidden, absolute (R0/R0b) |

## 3. Ideas to port FROM ShortsFactory INTO an Etcherr871-style pipeline (owner decides each)

1. **Structured safety object** in `analysis.json`: `{blocked, categories[], confidence, evidence}` instead of one `unsafe` boolean; the audit trail makes rejects explainable and tunes `vibe.json` later.
2. **Rights fields on every clip record** (`rights_status`, `license`, `attribution_required`, `permission_requested_at`) so a future change of regime (or an `approved_creator_feed` of consenting creators) needs no re-architecture; E871's `source.json` already stores URL, uploader and sha256.
3. **Permission-request queue**: for creators who might grant permission, one batched CSV of finished edits (cheaper than asking before editing).
4. **Temporal dedupe** (1 frame/3 s, sliding window, >= 0.92) alongside the middle-frame hash: catches trimmed reposts that a single frame misses.
5. **Persisted approval gate** before a clip counts toward a day's `(x)`: an `approved` flag the owner sets, so staging is not the last editorial gate.
6. **Routing + quotas** if the channel ever splits by theme (animals / skills / memes): `fit` (0-10) maps to ShortsFactory's 0-1 fit (7 is about 0.70, above its 0.65 default threshold); add per-channel quotas and the crowding penalty.
7. **Publisher safety patterns** for the missing uploader: private + scheduled, channel-ID verification, idempotency key, ambiguous outcomes never auto-retried, pause file (`youtube-upload-and-analytics.md`).
8. **Analytics loop**: snapshot table + per-origin acceptance rate + `averageViewPercentage` to promote caption examples into `vibe.json` (E871's own roadmap item).
9. **Compilation machinery** (reuse window, ~60 s foreshadow cards, chapters) ONLY if the owner lifts R11, and only after the originality question in `compilation.md` section 6.
10. **Content-addressed caches keyed by policy version** for anything the agent computes.

## 4. Ideas to port FROM Etcherr871 INTO a ShortsFactory-style factory

1. **File hand-off review**: contact sheet + `request.json` -> `analysis.json` (the proven way to make Claude the LLM layer; closes gap G1).
2. **Caption jobs and caption rules**: choose the job first, write five, pick one; 3-15 words; no description-only captions.
3. **Hard gates E871 learned**: "looks like stock" counts as stock (R0b); `fit >= 7` as "I would post this today"; reject another page's burned-in caption/watermark; never punch down; mark what you cannot see.
4. **Variety across a day** (no neighbouring slots with the same source or style) and the `plan` command idea.
5. **Release-calendar folder shape**, `upload-manifest.json` with sha256 per file, `LEDGER.json`, `(x)` markers: lets ShortsFactory outputs be browsed by the shared catalog and uploaders (`../../../references/release-calendar.md`).
6. **Source vetting registry** (verified sources only, >= 3/5 postable) if the factory ever discovers instead of receiving files.
7. **`contain` framing** for clips where crop-fill would cut the joke (`rendering-formats.md` section 2).
8. **Source-material archive**: keep every used original with `source.json` (URL, uploader, sha256) and delete rejected originals - ShortsFactory keeps only the inbox file plus a DB row.
9. **Silent-clip policy**: a calm CC0 bed (energy <= 6.0, -24/-30 LUFS) instead of rejecting silent clips outright - decide whether the memes channel wants silent clips at all.
10. **`redo`**: re-apply an edited verdict and re-render in the SAME slot (closes ShortsFactory's revision-loop gap A2).

## 5. Do not mix

Pick one rights regime, one card system and one LLM-layer mechanism per channel and record them (dated). Etcherr871's directory is owned by its own agent conversation; do not write into `etcherr871/` to prototype a
ShortsFactory idea (agent-principles section 9). Prototype in a new, owner-assigned directory per [../../../references/new-channel-playbook.md](../../../references/new-channel-playbook.md).
