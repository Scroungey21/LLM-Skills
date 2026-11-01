# Theme and scenario catalogue

Compiled 2026-11-01 from the research, specs and tooling the repo holds. Use it to answer "what could this channel be about, what
evidence do we have for it, what does it cost to make, and which subskill owns it?" before you pick a theme or invent one.
For routing a *request* use [video-type-selector.md](video-type-selector.md); for starting a channel use
[new-channel-playbook.md](new-channel-playbook.md). Source paths below are repo-root paths in backticks (not links) because they live
outside the skill; read the cited file for evidence, do not re-research.

## Contents
0. Legend (evidence, tooling status, risk scale)
1. Index of every theme
2. Explainers: 2.1 tech-news niches · 2.2 everyday mechanisms (HES) · 2.3 long-form documentary / 3D
3. Simulation: physics-simulation Shorts
4. Found clips and social / meme formats
5. Ambient 10-hour scenes (taxonomy, top themes, E1 start set)
6. Quizzes
7. Narrative fiction: chat stories · horror stories · manga recaps
8. Stickman / whiteboard storyboards
9. Themes researched and rejected or parked
10. Which shared references apply to which theme
11. How to pick or invent a theme
12. Gaps and conflicts in the evidence

## 0. Legend

**Evidence strength** (how much audience/intent data backs the theme; do not read a high score as "will work"):
- **MEASURED**: numbers from scraped platform data in a report (views, pool sizes, autocomplete counts), with the report named.
- **ANALYSED**: a frame-/transcript-level study of real examples but no retention or revenue data.
- **SPEC-ONLY**: a build spec or blueprint exists; it records design decisions, **no audience or market numbers**.
- **ADJACENT**: only indirect signals from another report; labelled as such where used.
- **NONE**: nothing in the repo; judgement only.

**Tooling status** (what you can run today):
- **LIVE** = runnable now from the repo or `ai-video-factory/toolkit/`.
- **ARCHIVED** = implemented in a removed tree; restore with `git archive pre-skill-reduction <paths>` (see [legacy-and-removed.md](legacy-and-removed.md)); the tag holds only tracked files.
- **ARCHIVE-FOLDER** = exists only in `H:\Projects\YTtechnews-archive-2026-11-01\` (the gitignored kiro specs, physics research bulk), not in the tag.
- **CLAUDE-ONLY** = no code; Claude performs the stages itself via hand-off packets ([agent-principles.md](agent-principles.md) §1) using the method in the subskill.

**Rights/policy risk scale** (one scale for every row; the reason is stated in each row):
- **Low**: all pixels and sound are original, synthesised, simulated, or CC0/own recordings; no real named people.
- **Medium**: real named entities (defamation/accuracy exposure), AI-disclosure exposure, or health/kids adjacency; manageable by gates.
- **High**: depends on third-party copyrighted or licensed material (fair-use or Content ID exposure), or on scraped user-generated text.
- **Very high**: third-party work reused with no recorded permission, or a reused-content finding could demonetise the whole channel.
The V5 rights tiers the archived engine used (0 verified public domain, 1 Creative Commons, 2 licensed, 3 proprietary = hard-blocked, F fair-use candidate =
human-gated memo, default reject; `V5-REQ-5.1`..`5.12`) are the vocabulary to reuse when a theme needs third-party media.

## 1. Index of every theme

| # | Theme | Family | Evidence | Tooling | Risk | Owner subskill |
|---|---|---|---|---|---|---|
| 1 | Tech-news niches (9 seeded: cyberattacks, infra failures, AI-ML papers, AI security, startup autopsies, fraud/retractions, tech myths, retrospectives, weekly rundown) | explainer | SPEC-ONLY (+ one benchmark-channel study) | LIVE for cyber/AI/general news (channel); ARCHIVED for per-niche config | Medium (real entities); cyber: no exploit code | [themed-news-niches](../subskills/themed-news-niches/SUBSKILL.md); the channel itself: [news-explainer](../subskills/news-explainer/SUBSKILL.md) |
| 2 | Everyday mechanisms (HES: 6 pillars, 60-topic reservoir) | explainer | MEASURED benchmark + niche scoring | LIVE (2D stopped; 3D line live) | Low-Medium (licensed photos, factual accuracy) | [everyday-systems-explainer](../subskills/everyday-systems-explainer/SUBSKILL.md) |
| 3 | Long-form documentary / 3D (HES Long, news long, MT compilations) | long-form | MEASURED (benchmark runtimes) | LIVE | Low-Medium | same owners as their channel |
| 4 | Physics simulations (press, drop, blade families) | simulation Shorts | MEASURED (46 channels) | LIVE | Low | [physics-simulation-shorts](../subskills/physics-simulation-shorts/SUBSKILL.md) |
| 5 | Found clips in a fake-post card | Shorts | ADJACENT | LIVE | High (third-party clips; owner-accepted) | [clip-card-shorts](../subskills/clip-card-shorts/SUBSKILL.md) |
| 6 | Social / meme / compilation Shorts factory (3 sub-channels) | Shorts factory | SPEC-ONLY | ARCHIVED (ShortsFactory) | Very high unless permission recorded | [social-clip-shorts-factory](../subskills/social-clip-shorts-factory/SUBSKILL.md) |
| 7 | Ambient 10-hour scenes (3 series, 199 ranked ideas) | ambient long-form | MEASURED | LIVE (2 scenes built) | Low-Medium (policy: repetition, AI disclosure, Content ID) | [ambient-long-form](../subskills/ambient-long-form/SUBSKILL.md) |
| 8 | Quizzes (23 ranked ideas) | long-form cards | MEASURED | CLAUDE-ONLY (nothing built) | Medium-High (franchise IP, made-for-kids) | [ambient-long-form](../subskills/ambient-long-form/SUBSKILL.md) (quiz line) |
| 9 | Chat-story videos | narrative Shorts | ANALYSED (48 stories) | LIVE | Medium (sponsor beats, minors, self-harm, synthetic voice) | [chat-story-videos](../subskills/chat-story-videos/SUBSKILL.md) |
| 10 | Horror stories (Reddit/4chan-sourced, 3-into-1 blend) | narrative long + vertical | SPEC-ONLY + ADJACENT | ARCHIVED | High (scraped UGC text; safety gate) | [horror-story-videos](../subskills/horror-story-videos/SUBSKILL.md) |
| 11 | Manga recap | narrative long | SPEC-ONLY | ARCHIVED | Very high unless rights basis is `owned`/`licensed`/`public_domain_cc` | [manga-recap](../subskills/manga-recap/SUBSKILL.md) |
| 12 | Stickman / whiteboard curiosity-explainer and POV-progression | storyboard explainer | SPEC-ONLY (observation-limited) | CLAUDE-ONLY (docs in tag) | Medium (imitation of a named creator; AI illustration) | [stickman-storyboard-videos](../subskills/stickman-storyboard-videos/SUBSKILL.md) |

If your idea is none of these, go to §11 and then the playbook.

## 2. Explainers

### 2.1 Tech-news niches (the technews engine's theme set)

**What it is.** The retired technews app configured *niches*: a content vertical with an archetype (narrative shape), a `strategy_bundle`
(scoring rubric, editorial constraints, sourcing method, real-entity sensitivity, component set, rendering mode) and an optional pacing profile
(`engine/app/seed.py` `NICHE_SEEDS`, `NICHE_STRATEGY_BUNDLES`, `NICHE_PACING_PROFILES`; `V4-REQ-2.1`, `P10-REQ-2`).
`NICHE_SEEDS` has **11 rows**: the 9 evidence-led news niches below (each has a `few_shot_examples/<key>-v1.json`, `P10-REQ-2.4`) plus `manga_recap` and
`horror_stories`, which are narrative niches with their own subskills (rows 10-11 of the index).

| Niche key | Archetype | Screen component | Sensitivity | Distinguishing rule (from `strategy_bundle`) |
|---|---|---|---|---|
| `cyberattacks-zerodays` | deep-dive | `cyber-terminal` | (default) | the global cyberattack guardrail: no operational exploit detail; granular and beginner-accessible |
| `infra-failures` | deep-dive | `failure-schematic` | (default) | cause-chain shape; reused by startup autopsies |
| `ai-ml-papers` | deep-dive | `ai-logic-node` | (default) | explain the paper's mechanism, not the abstract |
| `ai-security` | deep-dive | `cyber-terminal` | medium | explain the real attack mechanism against a deployed AI system; separate demonstrated exploit from theoretical vulnerability (`P10-REQ-2.3`) |
| `corporate-startup-autopsies` | deep-dive | `failure-schematic` | **high** | every causal claim traces to reporting/filings; never speculate about a named founder's character (`V4-REQ-1.2`) |
| `scientific-fraud-retractions` | deep-dive | `claim-evidence-compare` (new in v4) | **high** | only formal retraction notices / institutional findings / established investigative outlets; distinguish misconduct from honest error (`V4-REQ-1.3`) |
| `weekly-tech-rundown` | weekly-rundown (multi-segment, `single_hook_only=False`, pattern interrupt 20 s) | `chapter-card` | (default) | cold open teasing 3-4 segments, a chapter card + fresh hook per segment, scenes capped at 4 s, one closing tease |
| `tech-retrospectives` | retrospective (pattern interrupt 60 s) | `timeline-marker` | (default) | one chronological throughline, every beat date-anchored, a "then vs. now" beat, a real payoff |
| `tech-myths-debunked` | myth-debunking | `verdict-card` | low | state the claim in its strongest fair form, debunk via the causal mechanism, verdict word only in the closing sentence |

All nine append the "relatable contrast" directive (follow any impressive figure with a mundane comparison, `V5-REQ-8.3`) and carry
`visual_policy = representative-news` (news niches only; narrative niches never inherit it). Bulk-approve is disabled for `high`-sensitivity
niches (`V4-REQ-2.4`).

- **Audience/intent evidence: SPEC-ONLY.** The repo holds no market-size or demand numbers for any of the nine niches; they were chosen from the master
  spec and the v4/p10 addenda. The only measured reference is one benchmark channel study: its videos run 7:50-21:27 (average ~13:30) against LITMUS's ~2:00-6:35
  long form, uses 5-11 sources per description, and ends on a fixed tagline (`subskills/news-explainer/references/creator-style-guide.md`). Treat each niche as
  unproven until published; the tuning loop (`P10-REQ-3`: CSV import of Studio retention, proposals needing human approval) was the designed way to learn.
- **Format and length.** One full video (16:9, 2560x1440) + one vertical Short (1440x2560, ~55-60 s hook-first, `P10-REQ-1`) per topic; rundown is a single stitched video.
- **Tooling.** The channel (cyber/AI-ML/general tech) is LIVE as [news-explainer](../subskills/news-explainer/SUBSKILL.md) (calendar, ledger, uploader, dots.tts, Remotion).
  The niche *configuration* (rubrics, constraints, few-shot sets, strategy bundles) is ARCHIVED (`engine/`, `console/`, `few_shot_examples/`) and the kiro specs
  (`v4-addendum`, `p10-addendum`) are ARCHIVE-FOLDER. In the skill the rubrics become hand-off steps: Claude scores candidates against the niche rubric and writes the
  script against the niche's constraints (see the themed-news-niches subskill).
- **Risk: Medium.** Real named entities (autopsies, fraud: `high` sensitivity; claims must trace to filings or notices), cyber exploit detail, and the YouTube
  "inauthentic content" wording for templated output (the answer: distinct sourced substance per video).
- **Shared references:** [workflow.md](workflow.md), [voice-tts.md](voice-tts.md), [rendering.md](rendering.md), [qa-gates.md](qa-gates.md), [release-calendar.md](release-calendar.md).

### 2.2 Everyday mechanisms (Hidden Everyday Systems)

**What it is.** One ordinary action followed through its hidden chain to a destination or failure point: "You do it every day. We show where it goes and what happens next."
Six pillars with ten topics each (60-topic reservoir): A water/drainage/sanitation · B power/gas/home energy · C internet/signals/information · D waste/recycling/reverse
journeys · E packages/mail/retail supply · F streets/buildings/public circulation (`hidden-everyday-systems/research-output/topic-catalog.md`).
Inclusion rule: familiar trigger + at least 3 unseen stages + concrete destination/failure + showable mechanism + enough authoritative sources for a claim ledger;
exclusions: pure science with no journey, economics/psychology/self-help, pure "How It's Made", pure teardowns, news that expires, proprietary facts
(`research-output/niche-strategy.md`).
- **Evidence: MEASURED + judgement scores.** Seven candidate niches scored /25 on evergreen, curiosity, visual fit, 50+ depth, open competition: hidden everyday systems 24
  (winner); household internals 23 and everyday logistics 23 (folded in as a pillar); safety systems 22; building anatomy 21, automotive 21, manufacturing 21 (rejected as saturated:
  Practical Engineering, The B1M, Lesics, Branch Education, How It's Made). Competition scores are comparative judgement, not a census. Later benchmark: object-in-a-void 2D
  scored worst (a 31 K-view microwave video vs up to 11.2 M for history + everyday-object stories), which drove the 3D "story in a real place, mechanism as the reveal" line
  (`subskills/everyday-systems-explainer/references/production-3d.md`).
- **Format and length.** Long 3-7 min (3D long 5-7 min in chapters, 750-1,100 words, 16:9) + a summary Short (3D daily Short 9:16, 45-55 s, 90-130 words) + thumbnail pair.
  The 2D line (code-drawn Remotion) is **stopped since 2026-10-10**; gameplay-background Shorts exist from the 2D era
  (`subskills/everyday-systems-explainer/references/shorts-and-brainrot.md`).
- **Tooling: LIVE** (`hidden-everyday-systems/`, Blender 5.2, OmniVoice/VoxCPM2 via VoiceStudio, dots fallback).
- **Risk: Low-Medium.** Licensed photo references, owner's own gameplay footage, factual accuracy of mechanisms (claim ledger), YouTube templated-AI wording (answer: per-video research).
- **Owner:** [everyday-systems-explainer](../subskills/everyday-systems-explainer/SUBSKILL.md). **Shared:** [voice-tts.md](voice-tts.md), [rendering.md](rendering.md), [audio-captions-music.md](audio-captions-music.md), [qa-gates.md](qa-gates.md), [release-calendar.md](release-calendar.md).
- **How to add a topic:** pick from the reservoir or invent one that passes the inclusion rule; it is a new *topic*, never a new channel (see selector rule).

### 2.3 Long-form documentary / 3D

Not one theme but a format that several channels already run; choose it when the story needs more than ~60 s of mechanism or when search (not the Shorts feed) is the discovery path.

| Product | Length | Owner | Evidence |
|---|---|---|---|
| HES 3D Long ("documentary") | 5-7 min, 1920x1080, chapters, every 3 days | everyday-systems-explainer | benchmark story study (see 2.2) |
| News long form | ~2-7 min, 16:9 | news-explainer | benchmark runs ~13:30 average; ours is shorter by design (`creator-style-guide.md`) |
| Physics compilation | ~8 min of own clips, no branding/outro | physics-simulation-shorts | MEASURED: "8 Minutes of Non-Stop Satisfaction" 8.6 M, "Most Satisfying Simulations of the Year" 11 M; Blender N Chill 464 K vs 57.5 K (`material-trials` R5); median Shorts/long views ratio 0.48 |
| Quizzes | 10-60 min | ambient-long-form (quiz line) | MEASURED, see §6 |
| Ambient | 10 h | ambient-long-form | MEASURED, see §5 |
| Horror / manga long form | minutes to tens of minutes (spec sets no length) | horror-story-videos, manga-recap | SPEC-ONLY |

Tooling and risk are those of the owning channel. Long-form is where mid-roll money is (RPM figures are vendor-reported and wide: Shorts ~$0.01-0.20 vs long ~$0.83-15+).

## 3. Simulation: physics-simulation Shorts (Material Trials)

- **What.** "What happens when X meets Y" with a measured verdict from a real Blender (Bullet, cloth, Voronoi fracture, Cycles) or Taichi MLS-MPM simulation, recorded CC0 foley on simulated events,
  one line of text. Families (code paths): `press` (BOUNCED BACK / SPRANG BACK / STAYED DENTED / STAYED FLAT; SHATTERED / CRACKED / SURVIVED), `drop` (HOLDS / BROKE AT N), `blade` (SPLIT IN TWO / FLOWED THROUGH / JAMMED);
  scenarios within a family must differ in rig, not just materials (`subskills/physics-simulation-shorts/references/scenario-families-and-uniqueness.md`).
- **Evidence: MEASURED** (`subskills/physics-simulation-shorts/references/research-findings.md`; run 2026-09-24): 46 channels, 8,208 items; winner-take-most (top 10% of Shorts take 71.9% of Shorts views; 11.4% of Shorts reach >= 5x channel median);
  title-feature lift: superlative 1.86, "vs everything" 1.59, question mark 0.72 (avoid); sim-type lift: object vs obstacle 1.57, destruction 1.54, cloth/hair 0.64; cadence of winners 0.76-2.27 Shorts/week; Shorts median 31 s, top Blender Shorts 14-27 s.
  Ball-escape/MIDI is commoditised (originator median 993,500 -> 59,500 views/Short): do not build on it.
- **Format.** 1080x1920, 30 fps, 12-60 s (typical 12-20 s), locked camera, stage resets instead of cuts, seamless loop, sound at frame 0; weekly job, Tuesday/Friday slots.
- **Tooling: LIVE** (`material-trials/`). **Risk: Low** (no third-party IP, no generative media, `containsSyntheticMedia=false`); residual: made-for-kids setting (COPPA), "inauthentic content" wording (answer: novelty gate).
- **Hard rules:** no diffusion/generative anywhere, no show/branding/episode numbers ([agent-principles.md](agent-principles.md) §3). **Shared:** [rendering.md](rendering.md), [audio-captions-music.md](audio-captions-music.md), [qa-gates.md](qa-gates.md).
- **Overlap warning:** Slow Machines (ambient) is the same visual family at 10 h; keep it a separate engine and channel line, no shared assets.

## 4. Found clips and social / meme formats

### 4.1 Found clips in a fake-post card (Etcherr871)
- **What.** A real clip someone filmed in a fake social-post card with ONE added-value caption (context, hidden detail, take, question); optional reaction memes/Snapchat beats; 4 Shorts a day on an HES-shaped calendar; reference format @BeYourselfOkBro.
- **Evidence: ADJACENT.** The ambient quiz report records that the channel's Shorts are pop-culture clips (`etcherr871/vibe.json`) and treats audience overlap as a HYPOTHESIS; no clip-format market numbers live in the files read for this catalogue (see `subskills/clip-card-shorts/references/`).
- **Format.** 2-60 s clip (never stock), 1080x1920, 30 fps, clip's own audio (+ calm CC0 bed if silent). **Tooling: LIVE** (`etcherr871/clips.py`; Claude is the review/caption layer).
- **Risk: High.** Third-party clips; the owner accepts rights/credit responsibility and records the original link. **Coupling risk:** a reused-content finding can hit the *entire* channel, including any ambient/quiz catalog uploaded to the same channel (`ambient-channel/research-output/report-05`, `report-12`).
- **Absolute rule:** never stock footage, three enforcement layers ([agent-principles.md](agent-principles.md) §2). **Owner:** [clip-card-shorts](../subskills/clip-card-shorts/SUBSKILL.md).

### 4.2 Social / meme / compilation Shorts factory (ShortsFactory design)
- **What.** A config-driven network of three Shorts channels built from user-supplied media: `good_moments` (wholesome human + animal), `how_things_work` (mechanisms, making, repair, craftsmanship, technique), `memes` (relatable/reaction/absurd humour); `animal_moments` and `human_skill` defined but disabled. Pipeline: ingest -> dedupe (SHA-256 + temporal frame fingerprints) -> multimodal inspection (12 frames + transcript) -> channel routing -> branded Shorts -> next-day package + separately reviewed compilations (dots.tts only on compilation interstitials).
- **Evidence: SPEC-ONLY.** The README and skill docs record design decisions and safety boundaries, no audience numbers.
- **Rights decisions in the design:** permission states `unknown`/`discovery_only` -> `permission_pending` (cannot enter an upload-ready manifest); `non_commercial`, `no_derivatives`, `prohibited` never render; publishing is external and disabled; missed review never auto-approves; religious-harm/drug/sexual filter rejects at confidence >= 0.85 and deletes only inside configured intake roots.
- **Tooling: ARCHIVED** (80 tracked files; `git archive pre-skill-reduction ShortsFactory`). Its model-API multimodal inspection **conflicts** with the owner's 2026-10-04 "you be the LLM layer" rule: the method survives as Claude-reviewed contact sheets, as E871 already does.
- **Risk: Very high** unless every source has a recorded permission state; compilations and countdowns are *banned* for the clip-card channel and belong here only with the gates above. **Owner:** [social-clip-shorts-factory](../subskills/social-clip-shorts-factory/SUBSKILL.md). Patterns worth reusing: content-addressed caches, the rights-state ledger, hash + fingerprint dedupe.

## 5. Ambient 10-hour scenes (the 5th stream)

Source: `ambient-channel/research-output/` (reports 00-14; `MASTER-REPORT.md` is 533 KB and partly superseded: read the distilled
[research-findings.md](../subskills/ambient-long-form/references/research-findings.md) and open the cited report only for evidence). Dated 2026-10-07/08; R12-R14 to 2026-10-12.

- **What it is.** Long, passive, low-stimulus background video for sleep, focus, masking or "someone's here" companionship. Brand promise "places that never loop" (in About/descriptions, not in titles).
- **Viewer intent (report-02, 29 intents; report-03 format innovation).** The head is overwhelmingly sleep/mask/blank-screen/no-ads and a fortress: `rain sounds for sleeping 10 hours` top-20 = 20/20 >= 8 h, 19/20 >= 1 M views, median 15.2 M; 20 of the 30 most-viewed >= 8 h videos are plain noise uploads (#1 "White Noise Black Screen" 381 M).
  Small channels still capture most recent hits (57% of 993 videos >= 100 K uploaded in the last 12 months come from channels < 50 K subs); 66.6% of fresh long videos get < 1,000 views. A place wins when it **explains the sound** (starship quarters 16.78 M, airplane cabin 37.87 M, night bus 4.58 M). Presence ("someone in the next room") has the strongest emotion and thinnest vocabulary (30 empty autocomplete seeds).
  10 h is a use-case requirement, not a view multiplier; study/work run 1.9-3.9 h naturally.
- **Idea database taxonomy (199 scored rows, one scoring system).** `ideas.csv` 128 rows in 18 categories: Masking-with-a-reason (machine/room hum) 16 · Nature & weather 12 · Sleep place-world (vessel/transit/city) 12 · Functional audio (health-adjacent) 11 · Study/work/focus world 8 · Screen-on procedural visuals 8 · Narrative/spoken word 8 · Distribution/format mechanic 7 · Music-led ambience 6 · Nostalgia/liminal/era 6 · Fake broadcast/radio/weather 6 · Baby/kids/pet audience 6 · Window/TV/art-TV 6 · Presence/comfort-of-others 5 · IP/game/fantasy world 4 · Seasonal cozy world 3 · Travel simulation/slow-TV 2 · Creator/tabletop/streamer utility 2.
  `ideas-pass2.csv` +57 (new: Timed/structured session 8, Astronomy/science/data-driven 3, Safety/accessibility/conformance 3, Regional/localized market 2, Hardware/utility audio 1; plus more nature, screen-on, presence). `ideas-pass3.csv` +14 authored-place ideas (dark-cozy, sci-fi/historical/modern interiors, vehicle interiors, packaging mechanic, classroom utility). Scoring: ten 0-10 factors (Demand .15, Competitive advantage .15, Originality .08, Production simplicity .10, Local-model suitability .08, Quality .10, Monetization safety .12, Series .08, Thumbnail CTR .07, Viewer utility .07), robustness by geometric mean and 3,000-draw weight/noise perturbation; judgement scores, no revenue data.
- **Top-ranked (original ranking, additive; P(top 20) from the noise runs):** 1 B43 simulated materials (sand/lava lamp) 7.105 · 2 N01 starship crew quarters 7.045 · 3 A17 domestic presence (kitchen, roommate typing) 6.935 · 4 A27 marble machine 6.925 · 5 N03 airplane cabin 6.900 · 6 N02 sleeper-train compartment · 7 A26 screensaver revival · 8 A10 submarine/control room · 9 A23 apiary/insect sounds · 10 A34 open-window city · 11 N14 procedural night sky · 12 A11 night coach/truck cab · 13 A09 ship engine room · 14 A01 server-room hum · 15 N43 deep-space drift.
  Pass-2 best: P2-03 exam-hall simulation 6.83, P2-21 visible-countdown scenes, P2-17 exact-length nap rooms, P2-54 blanket-fort night. Pass-3 best: P3-06 gaslit Victorian study 6.62, P3-14 Mars colony habitat 6.60, P3-01 snowed-in safehouse 6.55, P3-04 gothic castle chamber 6.535.
- **Three launch series (mutually exclusive playlists):** Night Quarters (sleep places; dim grade + black variant) · Someone's Here (presence; weakest pillar, one-concept bet on A17) · Slow Machines (screen-on procedural/simulated visuals; least derisked technically). **E1 start set (R12, valid for a November-February window):** 1 N01 starship quarters · 2 A17 kitchen roommate · 3 A27 marble machine (built) · 4 roommate typing (built) · 5 B43 sand/lava-lamp · 6 P3-04 gothic castle · 7 A26 screensaver marathon · 8 P3-01 snowed-in safehouse · 9 A16 radio in the next room. Next wave: P3-14, P3-06, N03.
- **Format.** Exactly 10:00:00 for the E1 nine (cap 11:59, never >= 12 h), 1920x1080, synthesised audio, dim grade, no narration, startle margin; weekly cadence; experiment E1 = 9 videos, go/no-go gates G0-G3 with frozen thresholds (details in research-findings §5).
- **Tooling: LIVE for two scenes** (`roommate_typing` seed 11, `marble_machine` seed 3; Blender plates + numpy frame engine + chunked NVENC; heavy files on `S:/ambient`); everything else planned. The folder is gitignored with no VCS: back up before editing.
- **Risk: Low-Medium.** Policy: repetition/"automated or synthetic mass-production" wording, photoreal-AI disclosure, Content ID on ambient audio, YPP reviewer reading the whole channel (coupling with clip Shorts), wellness/sleep claims forbidden, no AI humans, no live streams, no hash-busting variation. Licence-blocked models are listed in research-findings §6.
- **Owner:** [ambient-long-form](../subskills/ambient-long-form/SUBSKILL.md). **Shared:** [audio-captions-music.md](audio-captions-music.md), [rendering.md](rendering.md), [qa-gates.md](qa-gates.md), [release-calendar.md](release-calendar.md). Do not reuse Shorts QC on ambient: Material Trials' `qc.py` loads every frame (impossible at 10 h) and its freeze/luma rules reject ambient.

## 6. Quizzes (the second long-form line)

- **What.** 16:9 card quizzes (guess by emoji / flag / screenshot / sound / song / odd-one-out) with a constant think -> reveal cycle, number honesty, "comment your score".
- **Evidence: MEASURED** (reports 13, 13a, 13b; 23,692 videos, 15 locales, 83 videos frame-coded, 31 matched pairs). 526 quiz videos passed 1 M views this year (2,617 passed 100 K); 38% of the 100 K+ videos with known size sit on channels < 100 K subs. 72% of fresh >= 100 K quiz videos run 10-60 min (30-60 min = best hit rate, 41% >= 100 K). Cycle median 18.4 s (11.5 s think + 6.4 s reveal, CV 4.4%): pacing is a solved template and does not separate winners; topic, stimulus recognisability, plain titles and channel age do. Retention collapses early (Most replayed 0.46 in the first 5% -> 0.20 by 15%).
  Made-for-kids risk is franchise-specific (Disney/Pixar 4/4 top fresh videos made-for-kids; Pokemon/Minecraft/Marvel/anime 0/4; n = 4 each).
- **Taxonomy (`ideas-quiz.csv`, 23 ideas):** Q-GAME 3, Q-EMOJI 3, Q-VOICE 2, Q-OST 2, Q-FLAG 2, Q-SONG 2, and one each of Disney, logo, pixel, silhouette, anime, trivia, odd-one-out, movie, Pokemon.
  Top by score: QZ-02 game by emoji 7.648 · QZ-01 movie by emoji 7.538 · QZ-17 gamer IQ 7.405 · QZ-12 flags 7.384 · QZ-06 game from screenshot 7.345 · QZ-13 country outline 7.314 · QZ-21 Spanish movie emoji 7.258.
  **Start set (differs from score rank on purpose):** QZ-01 movie emoji (no Disney/Pixar) -> QZ-12 flags -> QZ-21 Spanish movie emoji; QZ-02 only as a single probe because it fails the topic-demand gate QG5 (>= 10 videos >= 100 K AND >= 1 video >= 1 M in the format-matched pool).
- **Gates:** QG1 count honesty, QG2 answer correctness (two sources + >= 10% human spot-check), QG3 no repeated stimulus, QG4 cycle CV <= 5%, QG5 topic demand; plus the channel's not-made-for-kids rule (C10).
- **Tooling: CLAUDE-ONLY** (nothing built; needs a question-list generator, asset fetcher, answer verifier, NVENC card renderer, TTS name calls, mixer, QC; ambient's `scheduler.py`/`dsp.py`/`video.py` pieces are reusable). **Risk: Medium-High** (franchise IP and Content ID on songs accepted by the owner; kids' classification; the line needs its own directory and ownership row).
- **Owner:** [ambient-long-form](../subskills/ambient-long-form/SUBSKILL.md) (`references/quiz-line.md`). **Shared:** [voice-tts.md](voice-tts.md), [audio-captions-music.md](audio-captions-music.md), [qa-gates.md](qa-gates.md).

## 7. Narrative fiction

### 7.1 Chat-story videos (texting fiction over gameplay)
- **What.** A faux messaging UI (iMessage-style in 39 of 48 cases) telling a short story, voiced by two synthetic character voices, over gameplay background (Minecraft parkour 37, Subway Surfers 11); genres dramatic / funny / weird / cursed.
- **Evidence: ANALYSED** (`hidden-everyday-systems/research-output/chat-story-study/REPORT.md`, research 2026-09-23/24): 48 in-scope stories from 34 creators, 2,736 message events, frame- and transcript-level; **no retention, completion or revenue data** and no human audio listening. Medians: 66.6 s, 57.5 messages, first bubble at 0.0 s, 1.0 s reading window per bubble, ~266 wpm voice. Matched pairs (n ~ 8) show stronger stories have concrete stakes at 0 s, one escalating antagonist, late or no sponsor beat, a planted payoff; one "weird" rule-story case reached 10.1 M views with a horror-style comment response. Overused: betrayal/rizz, in-story AI-app sponsor beats (24/48), "comment for part 2"; underexplored: group chats (0/66), Discord, family/workplace relationships, warm endings.
- **Format.** 1080x1920 Shorts ~55-100 s; voice cadence band 180-320 WPM (differs deliberately from the explainer gate 165-240).
- **Tooling: LIVE** (`hidden-everyday-systems/chat-stories/`: simulator, headless engine, MCP server `chat-sim`; OmniVoice clones by default, dots fallback; owned by the HES agent). T1-T7 viewer tests in `demo_stories.md` were designed but **never run**.
- **Risk: Medium.** Synthetic voices (never a real person's), minors as a shock reveal (excluded as a model), self-harm content needs safe-messaging care, sponsor beats cost tone, platform "inauthentic content" for templated stories. **Owner:** [chat-story-videos](../subskills/chat-story-videos/SUBSKILL.md). **Shared:** [voice-tts.md](voice-tts.md), [audio-captions-music.md](audio-captions-music.md), [rendering.md](rendering.md), [qa-gates.md](qa-gates.md).

### 7.2 Horror stories
- **What.** Atmospheric narrated horror: candidate stories scraped from r/nosleep, r/LetsNotMeet, r/shortscarystories (RSS) and, as lower-trust, 4chan `/x/` (JSON catalog); every story passes a mandatory content-safety gate (hate speech, real-person doxxing/targeting, fiction crossing into real harm); the operator picks **3 stories from one cluster of ~6** and the script blends them into one first-person narrative (never verbatim, never three segments) (`V8-REQ-4`, `V8-REQ-5`).
- **Evidence: SPEC-ONLY + ADJACENT.** `v8-addendum` and the console niche docs record decisions only, no audience data. Adjacent signals, not horror market data: autocomplete patterns "ambience for reading/writing horror" (ambient report-02), the chat-story "weird" case above, and reading-ambience genre pools growing fast. Do not quote them as horror demand.
- **Format and look.** `atmosphere-narration` screen (progressive-reveal textbox over rotating matched background clips, each clip held <= 4,000 ms), default `crt_scanlines` filter, narration `slow_atmospheric` (slow, deep, partially monotone), no AI-pitch hook ("have you ever wondered..."); a derived **vertical recap** (one per parent, condensed script, CTA `link_to_full_video`) (`V8-REQ-6`, `V8-REQ-9`).
- **Tooling: ARCHIVED** (engine `content_safety.py`, clustering, `console/app/horror-clusters`; kiro `v8-addendum` in the ARCHIVE-FOLDER). The LLM stages (safety, clustering, blend) become Claude hand-off steps. Nothing is LIVE.
- **Risk: High.** Scraped user-generated text (author rights; paraphrase-only rule), real-person exposure (`real_entity_sensitivity_level = high`), 4chan content is unmoderated, age-restriction and violent/disturbing-content policy, background clips need their own rights tier. **Owner:** [horror-story-videos](../subskills/horror-story-videos/SUBSKILL.md). **Shared:** [voice-tts.md](voice-tts.md), [rendering.md](rendering.md), [qa-gates.md](qa-gates.md), [audio-captions-music.md](audio-captions-music.md).

### 7.3 Manga recap
- **What.** Narrated recap of a manga/manhwa/webtoon built from a user-uploaded PDF: panels extracted from the PDF, one screen per panel, expressive narration grounded in what each panel shows (never invented plot or internal states) (`V7-REQ-3`, `V7-REQ-5`).
- **Evidence: SPEC-ONLY.** `v7-addendum` records design, not demand; no market numbers anywhere in the repo for recap channels. Say so to the owner.
- **Format.** CIS-only `manga_panel_composition` screens; `voice_delivery_mode = expressive_narrative`; no scoring (a human uploads and picks the work; an on-demand title-suggestion call is informational only); default `production_mode: manual` = halt and export a package for an NLE (`V7-REQ-8.3`).
- **Rights gate (the defining feature):** exactly one `rights_basis` per source document before parsing: `owned`, `licensed` (needs a licence reference), `public_domain_cc` (needs a verification note), or `fair_use_candidate` (creates a fair-use assessment memo reviewed by a human; default reject); the PDF is persisted before the decision (`V7-REQ-2.1`..`2.4`).
- **Tooling: ARCHIVED** (`manga_*` tables, PDF pre-processing, `console/app/manga-uploads`, `nle-export`; spec in the ARCHIVE-FOLDER). **Risk: Very high** unless the basis is owned/licensed/public-domain: recapping a publisher's chapters is derivative use, and "fair use candidate" is a legal judgement the spec deliberately leaves to a human (a one-time attorney consultation for the fair-use pathway was an open item in v5). Never present it as safe. **Owner:** [manga-recap](../subskills/manga-recap/SUBSKILL.md). **Shared:** [voice-tts.md](voice-tts.md), [rendering.md](rendering.md), [qa-gates.md](qa-gates.md).

## 8. Stickman / whiteboard storyboards

- **What.** A local-first storyboard-to-render system for stick-figure curiosity explainers (`CURIOSITY_EXPLAINER`: plain contradiction -> intuitive answer -> mechanism 1 -> mechanism 2 -> exception -> synthesis -> adjacent curiosity) and second-person rank/level stories (`POV_PROGRESSION`), driven by a per-beat scene JSON with ten scene classes, procedural SVG rigs for recurring characters, diffusion only for backgrounds/props/thumbnails, and a "visual event every 1-3 sentences" rule.
- **Evidence: SPEC-ONLY, observation-limited.** The 147 KB reverse-engineering report (snapshot 2026-09-05) observed a topic cluster (animal-food paradoxes, "why we don't eat X") and a timestamped transcript of one video, but states plainly that frame-stream measurements (shot lengths, pose rates, transitions, SFX density) were **not obtained**: any such numbers are engineering defaults, not facts. No demand data in the repo.
- **Format.** Narrated explainer with a persistent 2D world; no length fixed by the docs (calibrate from 3-5 reference videos via a `reference_fingerprint.json` before locking a style).
- **Tooling: CLAUDE-ONLY.** Never implemented here. The docs (handoff, report, docx, two JSON schemas `stickman_scenario_storyboard.schema.json` and `video_project_state.schema.json`) are in the tag (`git show pre-skill-reduction:Stickman/<file>`).
- **Risk: Medium.** Imitation of a named creator: copy format mechanics, never scripts, artwork, thumbnails or scene sequences; AI-generated illustration disclosure; factual absolutism in provocative titles (the reference qualified the claim early). Reference videos must not be re-added to the repo. **Owner:** [stickman-storyboard-videos](../subskills/stickman-storyboard-videos/SUBSKILL.md). **Shared:** [voice-tts.md](voice-tts.md), [rendering.md](rendering.md), [qa-gates.md](qa-gates.md), [workflow.md](workflow.md).

## 9. Themes researched and rejected or parked

| Theme | Where | Decision and reason |
|---|---|---|
| Generic sleep/rain/white noise | ambient R02 | rejected: fortress (19/20 >= 1 M); a newcomer cannot win on quality |
| Baby/lullaby, meditation/anxiety, tinnitus, "sleep benefit" claims, teacher backgrounds (P3-12) | ambient R02/R05/R12 | dropped: made-for-kids (C10), health-claim and non-monetisable wellness framing |
| Live 24/7 streams, daily cadence, multi-channel farms | ambient R05 | out: Content ID interrupts live, "flood" wording |
| IP-titled game/fantasy worlds, game-music + rain | ambient R02/R03 | reference only: IP and Content ID risk |
| KPop Demon Hunters / Disney quiz topics (QZ-22, QZ-23) | quiz R13 | dropped by C10 (made-for-kids) |
| Ball-escape / MIDI marble Shorts | MT R5 | commoditised; YouTube wording targets such output |
| AI-generated 3D meshes, generative foley/music/video for physics | MT | rejected by owner 2026-09-25 (no diffusion/generative) |
| Series/season branding, "handmade" statements, mascots for physics | MT | overridden by owner 2026-09-26 (not a show) |
| Building anatomy, automotive, manufacturing as a whole-channel niche | HES niche-strategy | rejected as saturated; may appear as single topics only if they pass the HES inclusion rule |
| Stock footage anywhere in clip cards | E871 | absolute ban |
| Real-people likenesses in news graphics | news creator-style guide | deliberately not rendered (editorial/legal boundary) |
| Thumbnail generation, multi-language dubbing | v4/p10/v7 non-goals | out of scope in the archived engine; thumbnails are made by hand/scripts per channel today |

## 10. Which shared references apply to which theme

| Reference | News niches | HES | Physics | Clip cards / social | Ambient / quiz | Chat | Horror | Manga | Stickman |
|---|---|---|---|---|---|---|---|---|---|
| [workflow.md](workflow.md) | yes | yes | yes | yes | yes | yes | yes | yes | yes |
| [agent-principles.md](agent-principles.md) (agent = LLM layer) | yes | yes | yes | yes (core) | yes | yes | yes (safety, clustering, blend) | yes (title suggestion) | yes |
| [voice-tts.md](voice-tts.md) | yes (dots) | yes (OmniVoice/VoxCPM2) | no | only compilation interstitials | quiz name calls | yes (2 voices) | yes (`slow_atmospheric`) | yes (`expressive_narrative`) | yes |
| [rendering.md](rendering.md) | Remotion | Blender + Remotion | Blender/Taichi | Frame Studio card | NVENC card/frame engine | headless simulator + ffmpeg | Remotion CIS | Remotion CIS | SVG + ffmpeg |
| [audio-captions-music.md](audio-captions-music.md) | yes | yes | foley only | clip audio | synthesised only | dialogue mix | bed + SFX | bed | yes |
| [qa-gates.md](qa-gates.md) | yes | yes | yes | yes | ambient/quiz gates | yes | yes | yes | yes |
| [release-calendar.md](release-calendar.md) | yes | yes | yes | yes | yes | via HES | when a channel exists | when a channel exists | when a channel exists |
| [new-channel-playbook.md](new-channel-playbook.md) | extend only | extend only | extend only | extend only | extend only | extend HES | new channel | new channel | new channel |

The archived engine also had a shared Creative Illustration Separation mode (CIS: script first, then one illustration screen per beat from a registry, per-element transitions, rights-tiered assets, V5 `requirements.md`; ARCHIVE-FOLDER) that horror, manga and the news niches all ran on. Its skill-level write-up is listed in the router as `references/creative-illustration-separation.md`; if that file is absent, treat the subskills' own notes as authoritative.

## 11. How to pick or invent a theme

Run these as pass/fail tests, in order. A theme that fails 1-3 is dropped; 4-5 decide whether it needs a new channel and whether we can make it.

1. **Intent evidence (measured or admitted missing).** Build a *format-matched* pool (same format, this year, plausible length) and count winners: the quiz gate QG5 is the template (>= 10 videos >= 100 K AND >= 1 video >= 1 M this year; check whether the winners sit on small channels, as R01/R13a did). Pass = the pool exists and is not only incumbents. If you have only a spec or adjacent signals (horror, manga, stickman, news niches today) the test is **"unproven"**: allowed only as a labelled experiment with frozen go/no-go thresholds (ambient E1 is the model), never as a promised channel.
2. **Differentiation by format or method, not topic.** The new-channel rule: a different audience promise, production method, cadence, visual identity or rights model; a different topic alone belongs inside the closest existing channel ([video-type-selector.md](video-type-selector.md)). Also check the incumbents' template trap: if what you propose is the template everyone runs (ball-escape, generic rain, betrayal chat stories), say what changes per video.
3. **Rights and policy tier.** Assign the §0 risk level. Third-party material needs a recorded rights basis (V5 tiers 0-2; F only through a human-written fair-use memo, default reject). Scraped UGC needs a safety gate and paraphrase-only. Real named entities need claim-to-source traceability. Check YouTube's "inauthentic content" wording: every video needs distinct sourced substance and a human decision, and never plan around evading detection or labels. AI disclosure for realistic synthetic scenes and music. A reused-content finding can hit the whole channel, so keep clip-based and original catalogs on separate channels unless the owner records the coupling.
4. **Production cost with our tools.** Pass = the stages run on LIVE tooling, or the archived pieces are a bounded restore, or Claude-only hand-off is feasible per video. Count GPU-hours against the single-GPU rule (one GPU job at a time; never run dots.tts alongside ComfyUI/VoiceStudio) and per-video wall time (ambient 10 h video is a ~9-11 h render; physics Shorts are minutes of GPU plus Cycles). Reject anything that needs a model-API backend, diffusion for a channel whose identity forbids it, or stock footage for E871.
5. **Agent-as-LLM fit.** List every stage the old engine drove by an LLM (item scoring, scriptwriting, editor critique, fact-check against the claim ledger, cue validation, safety assessment, clustering/blending, panel/clip review, caption writing, packaging) and write each as a rubric + input/output schema + acceptance gate that Claude performs itself or through a file hand-off packet that the code validates ([agent-principles.md](agent-principles.md) §1). Pass = every LLM stage has a schema-validated file contract and a human gate where the spec had one (script approval, render approval, rights decision). Fail = a stage only works as a hidden API call.
6. **Only then decide the shape.** Add a topic to an existing subskill (default), add a scenario family (MT), add an ambient scene, or start a channel with the playbook's ten decisions, an ownership row, a calendar and a ledger.

Before committing, write down: the evidence label, the risk level, the owner subskill, the kill criterion (what number or incident stops it), and the first three videos.

## 12. Gaps and conflicts in the evidence

- **No audience numbers** exist in the repo for: tech-news niches (beyond one benchmark study), horror, manga recap, stickman/POV, social-clip factories, clip cards. Any plan for them is a hypothesis; say so.
- **ShortsFactory vs the agent-as-LLM rule** (model-API inspection vs file hand-off): written as hand-off because the owner's 2026-10-04 rule is later.
- **Quiz score rank vs start set** differ on purpose (QG5 is applied to the start set, not the ranking).
- **Ambient top-5:** `ideas.csv` ranks B43 first; the R12 start set anchors on N01 for season, momentum and the rain confound; R09's robust core is N01/B43/A17/A27/N03.
- **Dates:** kiro `.kiro/specs` is described as "only on the original machine" in one row of [legacy-and-removed.md](legacy-and-removed.md) §1 but the archive folder at its end holds a copy; trust the archive folder.
- **Etcherr871 philosophy** ("not a generative-video channel") was written for Shorts; whether it covers AI-assisted ambient on the same channel is the owner's open decision.
