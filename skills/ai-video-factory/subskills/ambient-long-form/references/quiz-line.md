# The quiz side: game and media quiz videos for @etcherr871 (second long-form line)

Status: RESEARCH ONLY (reports 13, 13a, 13b, 2026-10-07/08). **Nothing is built and there is no quiz directory yet.** Owner decisions in force:
quiz copyright/licensing risk is the owner's; the channel is strictly not made for kids and "for the most part" everyone-friendly, with nothing sexual or "freaky" (gate C10);
long-form goes on @etcherr871. Detail: `ambient-channel/research-output/report-13-quiz-synthesis.md`, `report-13a-quiz-market.md`, `report-13b-quiz-anatomy.md`,
`ideas-quiz.csv`, `data/report13-quiz/{market,anatomy}/` (scoring `score13.py` -> `ideas-quiz.csv` + `tables13.json`, reproduces byte for byte).

## Contents
1. Market findings
2. The template (what a quiz video is)
3. Scoring system and the start set
4. Quiz gates QG1-QG5
5. First video spec (QZ-01)
6. What has to be built
7. Quiz + ambient + Shorts on one channel; open decisions

## 1. Market findings (13a: 23,692 videos, 15 locales, 1,300 channel pages, 152 made-for-kids page checks)
- Big category open to small channels: this year 526 quiz videos passed 1 M views and 2,617 passed 100 K; 38 % of the 100 K+ videos with known channel size sit on channels < 100 K subs (302 on < 10 K).
- Fresh volume (>= 1 M this year): emoji 99, trivia 71, songs 62, voice/sound 30, flags 28, guess-the-game 26. Pokemon, anime, silhouette, pixel quizzes are famous but thin on fresh winners (5, 5, 0, 1).
- Long-form wins on search: 72 % of fresh >= 100 K quiz videos run 10-60 min (10-30 min = volume; 30-60 min = best hit rate, 41 % >= 100 K). Shorts reach could not be measured from search (MISSING).
- Pacing is a solved template and does NOT separate winners: cycle median 18.4 s = 11.5 s think + 6.4 s reveal, CV 4.4 %, no acceleration; in 31 matched pairs no timing/tier/voice/music variable separates winners (sign tests p >= 0.3).
  What does separate them: topic, stimulus recognisability, plain titles (winners carry fewer claims: "1 % can", "true fans" 3.1 % vs 10.8 %), time on the platform (winners older in 27/31 pairs). Near-identical pairs differ by a median 255x in views at a median channel-size ratio of 1.24x.
- Retention collapses early (Most replayed 0.46 in the first 5 % -> 0.20 by 15 %; peak in the first 10 % in 34 of 55 videos): the first questions are the product.
- Made-for-kids risk is concentrated: Disney/Pixar 4/4 top fresh quiz videos made-for-kids; Cocomelon/Peppa 4/4; KPop Demon Hunters 3/4; Pokemon, Minecraft, Roblox, Marvel, anime, Genshin, Fortnite 0/4 each. BUT two Pokemon winners had comments disabled (likely made-for-kids): packaging question, not a safe topic.
- Highest non-English ceilings: Spanish has the most volume (204 fresh >= 100 K, 61 >= 1 M); Arabic and Turkish have the highest hit rates. 2026 fads: KPop Demon Hunters (86 fresh vs 0 older), World Cup/footballers, Zootopia 2, Toy Story 5.
- Format-matched pools (in scope, this year, 10-45 min, person-led titles removed): Movie by emoji 138 videos / 40 >= 100 K / 8 >= 1 M; Spanish movie-emoji 19 / 12 / 4; Flags 134 / 59 / 10; Game by emoji 20 / 3 / 0 (max 453 K); any game quiz 152 / 9 / 2; country outline 4 / 0 / 0 (too thin).
  Q-GAME's subgenre-wide >= 1 M count came from creator/streamer formats, not faceless card quizzes. This corrected the first start set (it had led with game quizzes).

## 2. The template (13b: 83 videos, 31 matched pairs, frame-coded timing)
| Element | Norm |
|---|---|
| Format | 16:9 card quiz (49 of 72); host/TTS voice in 41 of 65 |
| Intro before Q1 | median 17 s (IQR 13-23); winners ~20 s |
| Think time | logo/character "3 seconds" 3.4-5.8 s; Pokemon 4-7; anime openings 6-8; silhouettes 7-10; OST 10-12.5; songs 12-14; emoji 12-13; pixel staged 11-19; voice/sound 10-19 incl. clip |
| Reveal | ~40 % of the cycle: 3-4 s name labels, 5-7 s picture/clip, 9-17 s only when a clip plays |
| Questions | 30-60 for 10-25 s cycles (10-20 min); 150-300 for 3-second formats (20-40 min); leaders' median 40 |
| Pace | constant; never accelerate; difficulty from stimulus and tier |
| Countdown | thin draining bar (43/65), ring (10), big number (6) |
| Audio | continuous music bed (36) or per-question bed (22); whoosh on card change, tick during bar, ding at reveal |
| Scoring device | "comment your score" prompt (34/65); running counters rare; score reports 6.6 % of top comments, up to 31 % when points per slot are shown |
| Tiers | Easy -> Impossible cards (18/65), 2-5 s each; not associated with success |
| Shorts | 1-8 questions in 46-60 s, Q1 on frame 0; replay value after Q1 collapses; 10 of 13 big quiz channels have no Shorts tab |
Practical rule: copy the template exactly; compete on topic choice, strength of the first questions, thumbnail subject recognisability, plain titles; let catalogue age work (evergreen).
Quality floor, not a growth lever: count honesty (100 promised/86 delivered in a 6.3 M-view video; the 3 comment threads complaining of skipped numbers belong to the 3 under-delivering videos). "Wrong answer" was the largest complaint class (17 of 1,599 comments).

## 3. Scoring system and start set
Same structure as the ambient system: 0-10 factors, weighted sum primary, weighted geometric mean (floor 0.5) robustness, Dirichlet(60w) + N(0,1) noise. Weights: Demand .16 (measured, format-matched pool), Breakout odds .16 (measured),
Trend .08 (measured, R1/0.035), Audience fit .13 (measured kids' share + documented per-idea adjustment), Production simplicity .13, Retention structure .08, Originality .08, Series depth .10, Thumbnail clarity .08, Shorts value **0** (note only: Shorts reach is MISSING and the Shorts slots belong to the Etcherr871 pipeline).
Ranking highlights (additive; geo rank in brackets): QZ-02 game by emoji 7.648 (1), QZ-01 movie by emoji 7.538 (2), QZ-17 Gamer IQ 7.405, QZ-12 flags 7.384 (9), QZ-06 game from screenshot, QZ-13 country outline, QZ-21 Spanish movie emoji 7.258 (6), QZ-03 song in 1 s 7.169.
**Dropped by C10:** QZ-23 KPop Demon Hunters song quiz, QZ-22 Disney movie by emoji. QZ-10 Pokemon: mixed made-for-kids risk, packaging-dependent.
**Start set (the score rank and the start set differ on purpose: QG5 checks the topic):**
1. **QZ-01 Guess the Movie by Emoji** (50 movies, Easy -> Impossible; adult/teen list only, no Disney/Pixar). 2. **QZ-12 Guess the Flag** (100 countries, 4 tiers; deepest topic, 44 % hit rate, simplest build, public-domain flag sets). 3. **QZ-21 Adivina la Pelicula con Emojis** (QZ-01 assets, Spanish cards + TTS).
4. Owner option: **QZ-02 game by emoji** as a single gaming probe (fails QG5: 3 of 20 >= 100 K); read its result as information about the audience, not a series bet. Then QZ-03 (song; Content ID claims accepted by the owner; spec excludes KPop Demon Hunters/Disney tracks) and QZ-16 trivia after QG5. QZ-17/06/07 held unless the probe beats QZ-01 on views per impression.
Safest franchise slots: pop songs (minus KPDH/Disney), flags, logos/brands, game OST, Minecraft/Nintendo screenshots, anime without chibi/preschool art.

## 4. Quiz gates (ambient gates C7 and C9 do NOT apply; C10 and P4 do)
- **QG1 count honesty:** the number in the title equals the delivered count.
- **QG2 answer correctness:** every answer checked against two sources by the agent, plus a human spot-check of >= 10 %.
- **QG3 no repeated stimulus** within a video, and none across the last N videos of the same series.
- **QG4 cycle conformance:** measured cycle CV <= 5 %, verified with the same ffmpeg scene-cut method 13b used.
- **QG5 topic demand:** before an idea enters a start set its topic, measured in the format-matched pool, needs >= 10 videos >= 100 K AND >= 1 video >= 1 M this year. Movie-emoji, Spanish movie-emoji and flags pass; all game topics and the country outline fail. Applied when choosing a start set, not when ranking.

## 5. First video spec (QZ-01; all values from 13b bands, none is shown to win: match the norm exactly)
50 movies, numbered 1/50..50/50; intro ~18 s (title card, rules "you have 13 seconds", tiers listed); cycle 13 s think (thin draining bar + soft tick) -> 6 s reveal (poster + name label + TTS name call + ding) -> whoosh, ~19 s constant;
tiers Easy 13 / Medium 13 / Hard 12 / Impossible 12 with 3-4 s tier cards and points (1/2/3/5) shown; Q1-Q3 are the most recognisable films; outro tally + "comment your score"; continuous low-energy music bed + whoosh/tick/ding SFX + TTS name call;
neutral palette, no mascot host, no preschool colours; title `Guess the Movie by Emoji | 50 Movies, Easy to Impossible` (plain: no "1% can", no stacked claims); thumbnail "GUESS THE MOVIE" 3-word headline + one emoji equation with a recognisable poster half-revealed, high black/white contrast, "50" badge;
audience "No, it's not made for kids" set explicitly. Optional Shorts cut-down (1-3 questions, Q1 on frame 0): Shorts slots are the Etcherr871 owner's decision.

## 6. What has to be built (a card render, not the ambient engine)
1. Question-list generator (Claude writes list, tiers, answers, sources). 2. Asset fetcher (emoji glyph sets, cover art, screenshots, flags; yt-dlp is installed for game audio/clips). 3. Answer verifier (QG2). 4. Card renderer streaming frames to NVENC (the measured ffmpeg NVENC path).
5. TTS name calls (dots.tts is shared infra: now `ai-video-factory/toolkit/tts-dots/`). 6. Mixer with loudness normalisation. 7. QC (QG1-QG4). 8. The same dual-track uploader and analytics ledger planned for ambient.
None of the ambient GPU compositor or procedural audio engine is needed; the ambient `scheduler.py`/`dsp.py`/`video.py`/`qc_demo.py` pieces can be reused.
Ownership: the quiz line needs its OWN directory and a CLAUDE.md ownership row, exactly like `ambient-channel/`; it must not live inside `etcherr871/`. Placement is the owner's call (open).

## 7. One channel, three products; open decisions
- Audience overlap (HYPOTHESIS): Etcherr871's Shorts are pop-culture clips (`etcherr871/vibe.json`); gaming/movie quizzes sit closer to that audience than 10 h ambient does. YPP reviewers read main theme/most-viewed/newest/biggest watch-time: pop-culture quizzes sit closer to the Shorts than ambient does; ambient remains the outlier.
- Build size and feedback speed: quizzes are the faster line to launch (a much smaller build; impressions and retention arrive within days since videos are 10-30 min, vs nine weekly uploads for E1). R13's recommendation (judgement): launch the quiz line first (QZ-01 -> QZ-12 -> QZ-21) at 1-2 videos/week and build ambient in parallel.
- Open: quiz pipeline directory; whether quiz/ambient Shorts may use etcherr871 slots and Related-video links; quiz category (Entertainment).
- Limits: search under-counts Shorts; 31/65 matched pairs with ~19 features tested (null results are weak evidence of no effect); winners are older; hand-set factors are judgement; per-franchise made-for-kids samples are n = 4.
