# Format research: what the chat-story study found

Source: `hidden-everyday-systems/research-output/chat-story-study/` (study dated 2026-09-23/24; `REPORT.md` = "REPORT", plus
`data/funny_research.md` 2026-10-03, `data/caldruki_edit_research.md` 2026-10-04, `data/music_research.md` 2026-09-26,
`data/psych_evidence.md`, `data/platform_metrics.md`). Tags: **OBS** observed, **INF** inferred, **PROP** proposed, **UNAV** unavailable.
Case keys are folder names under `cases/` (e.g. `TikTok_7410499456665259294`).

Contents: 1 What was studied and its limits · 2 Robust patterns P1-P7 · 3 Timing distributions · 4 Genre mechanisms · 5 Performance evidence and confounds ·
6 Overused vs underexplored · 7 Recommendations · 8 Funny-format and meme-edit research · 9 Reading-speed and attention anchors · 10 Study files to consult

## 1. What was studied and its limits
- 48 fully analysed in-scope stories (on-screen chat over gameplay) from 34 creators: YouTube Shorts 17, TikTok 16, Instagram Reels 15; 2,736 message events,
  decoded frame by frame (1 s sheets, 0.25 s head/tail, ~10 fps change detection) and transcribed (faster-whisper medium.en). From 214 downloaded -> 66 in scope.
- Genre by platform: dramatic 5/5/6 (YT/TT/IG), funny 6/8/5, weird 2/2/1, cursed 4/1/3. Weird and TikTok-cursed cells are below the 3-per-cell target.
- **All 48 are two-person chats.** Interfaces: iMessage-style 39, WhatsApp 3, Snapchat 3, Messenger 2, dating app 1. Gameplay: Minecraft parkour 37, Subway Surfers 11.
  No Discord-style chat over gameplay was found (UNAV).
- **Not done**: no human listened to any audio; no retention/completion/share data (creator-only, UNAV); comments are small top-ordered samples (TikTok CAPTCHA stopped collection,
  not bypassed); views are public counters only (YouTube counts a view on play since 2026-08-24; yt-dlp Shorts counts ~half of displayed, issue #13122). The seven viewer tests T1-T7 were
  **designed, never run**. So everything below is a hypothesis about structure, not a measured audience effect.
- Source media in `cases/` is third-party copyrighted working material, git-ignored: do not redistribute or paste display/spoken text into public fields (ANALYSIS_PROTOCOL).

## 2. Robust patterns (with counter-examples)
- **P1 The interface is a narrator, not a skin (OBS, 15+ cases).** The best beats are often not dialogue: a contact silently renamed after a silence, an incoming-call banner
  contradicting a lie, a notification in the "impossible" thread answering the key question, a location notification catching the catcher, a cut to the accomplice's thread.
  *Counter:* chrome can steal the story (`TikTok_7413649346668940577`: 8/19 sampled comments, incl. the top three, discuss the fake "7G"/low-battery chrome, none the twist).
  Constraint in our tool: the skins support only timestamps, read status, reactions/tapbacks, images, typing indicator and static status/battery; renames, call banners and
  notifications are **not renderable** today (`simulator-and-render.md` section 3).
- **P2 Stakes on screen at t0 (OBS).** Median first bubble visible at 0.0 s (p90 0.32 s). Stronger members of matched pairs open on an accusation, insult or concrete object
  (`Youtube_3lhgIeWNpv4`: milk-bottle photo from frame 0 becomes the punchline); weaker ones on leftover context (mid-series part) or a polite setup. Association only.
- **P3 Endings are earned by plants, and plants are cheap (OBS).** Of 48 endings: 19 surprising-but-earned, 12 predictable-but-satisfying, 7 withheld, 7 part-2 CTAs, 3 cruel-without-purpose.
  Earned endings reuse a name, object, declined invitation, matching clues, or the victim's own boast (asterisk-correction "30*" punchline). *Counter:* unplanted part-2 teasers; a sequel that retcons its premise.
  Funny sub-sample (n=19): 11 earned, 6 predictable-satisfying, 1 part-2 CTA, 1 cruel.
- **P4 Repetition must mutate (OBS).** Rigged-quiz/roast formats work when each repeat changes the logic and read as lists when they do not.
- **P5 Sponsor beats are part of the genre's economics and usually cost tone (OBS).** In-story app promos (AI-reply apps) appear in 24/48; judged tone-breaking most in drama.
  Early placement co-occurs with the weaker member of one pair (sponsor at 15 s vs 66 s) - association, not cause.
- **P6 Muted comprehension is usually intact, not always (OBS).** Final lines sometimes voice-only or cut off by the card edge; display self-censors while TTS speaks the word.
- **P7 Cursed != crude (INF).** A violated identity/trust/safety line with an intelligible implication differs from sexual-pun escalation (agents reclassified those as funny).
  One case uses a minor as the shock reveal: flagged and excluded as a model.

## 3. Timing: measured distributions (starting points, not rules)
n = 48 cases; first-visible is +-0.1 s when a change event was detected, +-1 s when only 1 s sheets existed; voice times are whisper boundaries (+-0.1-0.3 s).

| measure | p25 | median | p75 | p10 / p90 |
|---|---|---|---|---|
| duration (s) | 57.9 | 66.6 | 96.5 | 45.0 / 145.1 |
| messages per video | 41.8 | 57.5 | 70.3 | 18.1 / 101.3 |
| messages per minute | 31.3 | 45.9 | 56.1 | 20.8 / 65.1 |
| first bubble visible (s) | 0.0 | 0.0 | 0.12 | 0 / 0.32 |
| gap to next reveal, the reading window (s) | 0.7 | 1.0 | 1.8 | 0 / 2.7 |
| display characters per bubble | 15 | 24 | 36 | 8 / 50 |
| characters / reading window (cps) | 14 | 20 | 26.9 | 8 / 39 |
| text lead before voice (s; negative = voice first) | -0.51 | -0.10 | +0.04 | -0.84 / +0.18 |
| gap between voiced lines (s) | 0.08 | 0.16 | 0.30 | 0 / 0.52 |
| speech rate, segments >= 1.5 s (wpm, REPORT) | 223 | 266 | 319 | - |
| speech rate, all events (`metric_distributions.json`) | 245 | 310 | 391 | 188 / 500 |
| typing-dots anticipation (s) | 0.7 | 1.0 | 1.9 | 0.05 / 2.85 |
| hold after last voice (s) | 0.18 | 0.36 | 1.59 | 0.08 / 3.0 |
| final hold, whole video (s) | 0.83 | 1.39 | 3.0 | 0.53 / 4.6 |

By genre (medians): drama 98 s, 34 msgs/min, 1.57 s final hold; funny 60 s, 52 msgs/min, 0.36 s; cursed 60 s, 56/min, 0.15 s; weird 61 s, 50/min. By platform: YouTube 59 s and 31/min,
TikTok 74 s and 50/min, Instagram 88 s and 50/min. (Funny vs dramatic: reveal gap 1.0 vs 1.19 s, speech 340 vs 289 wpm.)
Note two speech-rate figures: REPORT uses segments >= 1.5 s (266 wpm); the all-events column (310) includes short lines. The engine band 180-320 follows the REPORT figure.
- **Readings (INF):** the format runs at or above subtitle reading ceilings (median 20 cps = Netflix adult maximum; p75 27 cps exceeds it) and the voice at ~266 wpm vs 183 wpm read-aloud norm.
  Viewers are not expected to read every bubble: TTS carries the story, the bubble anchors it. Voice and bubble are near-simultaneous (median -0.1 s). Endings are cut almost immediately (median 0.36 s after the voice).
  Long silences read as "frozen": `Youtube_7juNGAlqGMQ` held ~22 s near-silence; 7/11 comments reacted to it.

## 4. Genre mechanisms
- **Dramatic**: power inverts in the first reply (a bare "Ok" answers a breakup test); competing goals with a planted piece of evidence; the tool of exposure turns on its user
  (`TikTok_7410499456665259294`: five reversals; the final one reuses the name Chris and the Snap Map feature planted earlier); endings shift device/phone rather than explain.
  A case touching possible self-harm: any derivative needs safe-messaging care.
- **Funny**: escalation ladders where each refusal becomes a bigger demand (1.3 M), sincerity escalating against a misread (innocent party becomes *more sincere*), callbacks cut the instant they land
  (0.27 s to video end), visual literalisation of a verbal trap (coin photo), status reversal via a fact the arrogant party volunteered.
- **Weird**: a coherent impossible rule proven by a checkable fact after a rational explanation is offered and knocked down; or a knowing authority giving orders without reasons
  (`TikTok_7348017626846743850`, 10.1 M views; 14/18 top comments judge the daughter - the "don't open the door" audience response). *Weak:* dark hints never paid off.
- **Cursed**: the disturbing implication must be intelligible at the cut; shock without purpose reads as cruelty (3 cases cruel-without-purpose).

## 5. Performance evidence and confounds
Within-creator matched pairs (views, stronger vs weaker): 18,732 vs 41; 18,034 vs 4; 12,111 vs 6; 69.7 k vs 1.28 k; 1.9 M vs 31.9 k; 11,189 vs 56/186; part 1 9.6 M vs part 2 682 k; one near-equal control (942 vs 892).
Recurring on the stronger side: concrete stakes at 0 s, one antagonist with escalating demands, late/no sponsor, planted payoff, high-contrast dark card. On the weaker: leftover series context, looped
repetition, early sponsor, telegraphed reveal, low-contrast/small card. **Confounds**: channel audience, upload timing, reposting, algorithm variance, sponsorship boosting; n ~ 8 pairs, no retention data.
Comments (14 cases): character judgment dominates horror/weird; quoted punchlines cluster on interface jokes; part-2 hunting on cliffhangers; comment-bait prompts inflate counts (7/15 just answer a prompt);
format fatigue appears ("leaving these text stories in 2024").

## 6. Overused vs underexplored (this sample only; not a market-gap claim)
Overused: romantic betrayal/cheating, rizz pickups, in-story AI-reply sponsor beats (24/48), iMessage dark card over Minecraft parkour, "comment X for part 2". Underexplored: group chats (0/66 in-scope),
Discord/server chat, family/workplace/neighbour relationships, weird rule stories (5/48), non-photo attachments (voice notes, polls, locations, shared screens), warm resolutions.
Discovery was limited (IP blocks, CAPTCHA, logged-out views), so absence is weak evidence of absence.

## 7. Recommendations (PROP from REPORT section 7; each traceable to P1-P7)
1. Script the interface as a character: 1-2 non-dialogue beats per story that carry information (P1) without out-competing the plot.
2. First bubble at 0 s with a concrete stake; never open on carried-over context (P2).
3. Every ending pays a plant visible before the midpoint; test it for fairness on re-read (P3).
4. Mutate every repetition; delete any exchange that restates (P4).
5. No sponsor beat inside the setup; if used, after the core turn and outside the fiction (P5).
6. Every plot-critical line on screen and legible; voice-only only for flavour (P6).
7. Starting timing: reveal cadence 0.8-1.8 s for <= 36-char bubbles; voice with the bubble; inter-line gap ~0.15 s; final hold 0.3-1.6 s by genre; bubbles > 36 chars toward <= 20 cps when unvoiced.
   (The engine's defaults implement this; see `timing-schedule.md` section 4.)
8. Controlled tests T1-T7 (opening wording, reveal order, plant legibility, pause placement, voice direction, gameplay intensity, final hold): >= 8 pairs per test, pre-registered metric, stop at 8 pairs
   or 21 days, same assets except the variable; detail in `demo_stories.md`. **Never run**; they need the owner's creator analytics.

## 8. Funny-format and meme-edit research (2026-10-03/04)
- **Channel map**: Caldruki (YT @Caldruki ~1.3 M subs, ~1.5 B Shorts views; a *screenshot-meme* channel, not chat-over-gameplay: deadpan TTS reads screenshots, one meme SFX per slide). Fictional chat over
  gameplay is strongest on TikTok (peaks 8-12 M, several accounts dormant); on YouTube mostly small. Topic demand benchmarks: Key & Peele "Text Message Confusion" 48.2 M, James Veitch 58.2 M, autocorrect 12-21 M.
- **Format verdicts**: wrong number strong; misread innuendo strong *if the innocent meaning is provable*; autocorrect strong; drunk texter good (typos stay readable); parent/grandparent good and safe; escalation ladder /
  rigged game best measured (1.3 M, 1.9 M); scammer-gets-played strong (never show working scam steps); rizz saturated; clueless-partner/petty-roommate risks turning mean.
- **Funny style spec (engine-oriented)**: 40-55 s (cap 65), 32-48 messages (~50/min), reveal gap 0.7-1.2 s, typing dots 0.9-1.5 s before punchlines, double-text bursts 0.25-0.4 s, <= 1 left-on-read beat <= 2 s,
  bubbles ~23 chars (punchline <= 30), finalHold 400-700 ms, drunk typos ramp 0 -> <= 2 per bubble with >= 75 % words correct, autocorrect <= 1 substitution per bubble and <= 4 per video each paid off,
  stingers <= 1 per 8-10 s and 50-150 ms after the punchline voice ends, punch-zoom 1.0 -> 1.12, shake 6-8 px / 200 ms, music cut 600-900 ms on the punchline.
  Typos: real-word substitutions and word-shape-preserving errors are funny; keyboard smash/heavy scrambling is unreadable (Rayner 2006). Read the typo literally (`readAsTyped`) only when the typo is the joke.
- **Caldruki edit grammar** (8 Shorts, 1.0-7.5 M views, metadata-only; INF): 62-80 s, first word at 0.0 s, 11-25 beats (one per ~3.7 s), non-speech gaps median 1.84 s, 36-68 % of runtime is SFX/memes/silence, speech 210-250 wpm,
  last word -> end 0.6-4.2 s (median ~1.4 s), ~1 sound per screenshot in the gap *after* the line, no continuous music, a different CapCut voice per speaker, ending = meta/nostalgic comment -> signature scream -> hard cut, no CTA.
- **Engine spec derived**: no music; 45-65 s; 10-16 SFX/min, >= 2 s apart, never 6 s without one, <= 2 set pieces of 2.5-5 s, non-speech 25-40 %; SFX starts 0-120 ms after the voice ends; next voice >= transient + 250 ms;
  gains vs voice peak: stingers -3..0 dB, ambient -10..-14, pops -18, earrape +4..+6 (<= 0.8 s, once, never in first 3 s); voice edits on <= ~25 % of lines, never two heavy ones in a row; visual events 12-20/min
  (<= 4 big/min), >= 1 every 6 s, <= 2 overlays at once, full-screen covers only in gaps (<= 1.2 s), <= 3 flashes/s (WCAG 2.3.1), rotate >= 6 reaction images per video.
- **Owner overrides (2026-10-04)** - they beat the research above: no gasps, record scratches or sad trombones (removed); meme hits only on genuinely dramatic or stupid punchlines (~7-8 per video), "never on random lines";
  real meme clips/images fetched online rather than generated; real-person meme images allowed (owner's risk). Details and the resulting rights table: `audio-sfx-memes.md`.
- Psychology anchors (`data/psych_evidence.md`): curiosity gap (Loewenstein), suspense/surprise as belief movement (Ely et al.; spoiler evidence mixed - do not claim a spoiled hook is safe), incongruity-resolution and
  benign violation (McGraw & Warren; humour varies by perceiver), creepiness = threat ambiguity (McAndrew & Koehnke), disposition/justice payoff (Zillmann, Raney), gossip interest (McAndrew & Milenkovic).
  None was tested on chat stories; "dopamine/ADHD" claims: safe phrasing only - heavier short-form use is associated with weaker attention measures, causality not established.

## 9. Reading-speed and attention anchors
Brysbaert 2019 (190 studies): silent 238 wpm non-fiction / 260 fiction, aloud 183 wpm. Netflix adult subtitle ceiling 20 cps (children 17; 42 chars/line, 2 lines). BBC 160-180 wpm (reported secondhand). A 12-word bubble needs ~3 s
at mean silent speed; at 20 cps a 60-char bubble needs >= 3 s. Split attention: one study (Schuetze 2026, N=75/100) found no comprehension cost of Subway-Surfers-style distractors for *audio-led* educational video;
chat stories are text-led, so the conflict is untested. "3-second rule" statistics are industry blogs, not evidence.

## 10. Study files to consult (list only; do not copy bulk)
`REPORT.md` (synthesis) - `ANALYSIS_PROTOCOL.md` (per-case `case.json` schema: events with `narrative_function` hook|setup|escalation|reversal|reveal|punchline|reaction|payoff|callback|cta|filler;
card.md <= 45 lines, paraphrase, <= 1 quote of <= 15 words) - `AUTOMATION_SPEC.md` - `demo_stories.md` - `README.md` (reproduction commands, environment, honest failure log) -
`cases/<Platform>_<id>/{analysis/case.json, analysis/card.md, motion/, transcript_whisper.json, audio_features.json, comments.json}` (YouTube 55, TikTok 35, Instagram 125 folders; only 48 are fully analysed) -
`data/`: `case_metrics.csv` (per-case timing), `events.csv` (2,736 events), `metric_distributions.json` (ALL, per genre, per platform), `evidence_ledger.csv` (URL, scope, genre, sha256, provenance per case),
`case_digest.json`, `channel_baselines.json`, `channel_shorts.jsonl`, `triage_{youtube,tiktok,instagram}.jsonl`, `discovery_log.jsonl`, `music_bed.json`, `music_metadata.json`,
`funny_research.md`, `caldruki_edit_research.md`, `music_research.md`, `psych_evidence.md`, `platform_metrics.md` - `tts/tts_landscape.md|json` (32 models) - `scripts/` (discover, acquire, frames, transcribe, compute_metrics).
