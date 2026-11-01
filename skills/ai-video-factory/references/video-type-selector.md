# Video-type selector

Compiled 2026-11-01. Use this first when a request arrives: map what the user wants to a subskill, check the
disqualifiers, and decide whether this is a new channel. Then read that subskill's `SUBSKILL.md` and its current-state doc.

## Quick map

| The user wants... | Subskill | Format it produces | Voice | Core asset source |
|---|---|---|---|---|
| A **news or "what just happened" explainer** (cyber, AI/ML, general tech; recent, sourced, volatile facts) | [news-explainer](../subskills/news-explainer/SUBSKILL.md) | long-form 16:9 + vertical Short + thumbnail per topic | synthetic male house voice (dots.tts), tempo-stretched | evidence screenshots/source cards + mechanism animations |
| A **mechanism / "how does this ordinary thing work" explainer** (evergreen, one object, to-scale, source-backed) | [everyday-systems-explainer](../subskills/everyday-systems-explainer/SUBSKILL.md) | long (3-7 min) + summary Short + thumbnail pair | cloned synthetic voice (OmniVoice/VoxCPM2; dots fallback), native pacing | drawn-to-scale 2D (history) / Blender 3D (current), real references |
| **Satisfying physics-simulation Shorts** ("what happens when X meets Y", measured verdicts) | [physics-simulation-shorts](../subskills/physics-simulation-shorts/SUBSKILL.md) | 1080x1920 Shorts (+ occasional long-form compilation) | none; foley only | Blender/Taichi MPM simulation, Cycles, CC0 foley |
| **Found-clip Shorts** (real clips someone filmed, in a fake-post card, with a one-line additive caption) | [clip-card-shorts](../subskills/clip-card-shorts/SUBSKILL.md) | 1080x1920 Shorts, several per day | the clip's own audio (+ calm CC0 bed if silent) | discovered real clips, agent-reviewed |
| **10-hour ambient** videos (or later quizzes) | [ambient-long-form](../subskills/ambient-long-form/SUBSKILL.md) | 10 h 1920x1080 video with synthesised audio | none; synthesised ambience | Blender-baked plates / procedural frame function, CC0 scans |
| **Something new** (a style none of the above covers) | start from the closest subskill, then [new-channel-playbook.md](new-channel-playbook.md) | | | |

Theme/scenario requests (horror stories, manga recap, chat stories, stickman storyboards, social-clip factories, themed news niches) have their own
table in "Theme subskills" below; the full evidence-backed list is [theme-catalog.md](theme-catalog.md).

## Decision guide

Ask these in order. Stop at the first decisive answer.

1. **Is the video built from someone else's real footage?** Yes -> `clip-card-shorts`. Check the stock-footage ban
   ([agent-principles.md](agent-principles.md) §2) and the rights/credit policy first. No -> continue.
2. **Is the subject recent news with facts that expire?** Yes (new CVE, model release, product launch, advisory, price) ->
   `news-explainer`. The deciding trait is *volatile facts + primary sources + a publication cutoff*. Evergreen -> continue.
3. **Does a viewer learn from watching a mechanism work?** If the point is "how does this object/process physically work"
   and the answer can be drawn/modelled to scale from real references -> `everyday-systems-explainer`. Do not use it for
   opinions, news, or things you cannot source or model accurately.
4. **Is the pleasure the outcome of a computed physical event, with no narration?** (press, drop, blade, steamroller, funnel...
   with a measurable verdict) -> `physics-simulation-shorts`. Requires you to be able to simulate it for real
   — no diffusion, no faked verdicts.
5. **Is it long, passive, low-stimulus background video (sleep, focus, "someone's here")?** -> `ambient-long-form`.
   Differences that matter: 10 h render, dim grade with no static bright element, synthesised audio, startle margin.
6. **Nothing fits** -> new channel (below).

## Disqualifiers (do not route here even if it looks close)

- `news-explainer` is wrong for evergreen "how X works" (that's HES's promise) and for anything where you can't name primary sources.
- `everyday-systems-explainer` is wrong when the story is a person/opinion/news item; when no real reference exists to draw/model to scale;
  and 2D production is **stopped** since 2026-10-10 (3D only; the owner uploaded all earlier 2D as-is).
- `physics-simulation-shorts` is wrong if you want narrated explanation, branded series ("not a show"), or any generative element.
  It is also wrong when the "result" cannot be measured from the sim.
- `clip-card-shorts` is wrong for compilations/countdowns/slideshows/ads/static images, for stock footage (never), and for clips > 60 s.
- `ambient-long-form` is wrong for anything with narration or an energetic arc.

## Mixed requests

- "A news video plus a Short" is one NEWS topic (full + Short pair).
- "A mechanism explainer with a satisfying physics demo clip" -> HES owns the video; MT is a separate channel and its assets/code are
  not reused across (ownership split, [agent-principles.md](agent-principles.md) §9). Ask the user.
- "Make a quiz/long-form for the clip channel" -> AMB (ambient + quizzes for the @etcherr871 YouTube channel); whether it may use
  E871 release slots is an open owner decision.
- If the channel is ambiguous, ask — defaulting to the channel your agent owns.

## When to start a new channel (via [new-channel-playbook.md](new-channel-playbook.md))

Start a new channel only when **all** hold:
- The audience promise, format or production method differs from every existing channel (e.g. a different upload cadence, different
  visual identity, different rights model) — a different *topic* alone is not enough; add it as a topic family to the closest channel.
- You can answer every decision in the playbook (voice, visuals, captions/motion, music/audio, editorial contract, repeat-check ledger,
  rights/provenance, release path, QA doc, GPU needs) and write the answers down in the new subskill.
- The owner agrees that it gets its own directory, ownership entry, release calendar, and a new subskill under `subskills/<type>/`.

Otherwise extend an existing subskill: add a scenario to MT's catalogue, a new topic to HES's slate, a new edit style to E871, a new scene to AMB.

## Theme subskills (added 2026-11-01)

These six are **theme subskills**: a reusable scenario with research, schemas and gates, used to start a NEW channel or to add a format; most of their code
lives in the archived technews app (restorable from git tag `pre-skill-reduction`, see [legacy-and-removed.md](legacy-and-removed.md)) and the stages are
performed by Claude through hand-off packets ([agent-principles.md](agent-principles.md) §1), never by building a model-API backend. Evidence, risk level and tooling
status for each are in [theme-catalog.md](theme-catalog.md).

| The user wants... | Subskill | Format it produces | Voice | Core asset source |
|---|---|---|---|---|
| **Horror / creepypasta / scary-story narration** (stories from Reddit-style sources, blended, safety-gated) | [horror-story-videos](../subskills/horror-story-videos/SUBSKILL.md) | long narrated video + derived vertical recap | slow atmospheric synthetic voice | atmosphere-narration screens over rotating matched background clips |
| **Manga / manhwa / webtoon recap** from a supplied PDF | [manga-recap](../subskills/manga-recap/SUBSKILL.md) | narrated panel-by-panel video, NLE export package | expressive narration | panels extracted from the source PDF (rights basis recorded first) |
| A **themed news niche** (cyberattacks/zero-days, AI security, AI-ML papers, infra failures, startup autopsies, fraud/retractions, tech myths, retrospectives, weekly rundown) or defining a new niche | [themed-news-niches](../subskills/themed-news-niches/SUBSKILL.md) (channel mechanics stay in [news-explainer](../subskills/news-explainer/SUBSKILL.md)) | long-form + vertical Short per topic (rundown = one stitched video) | channel house voice | evidence screens per niche component |
| **Chat-story / texting-fiction** videos | [chat-story-videos](../subskills/chat-story-videos/SUBSKILL.md) | 1080x1920 Short, ~1-1.5 min | two synthetic character voices | fake messaging UI over gameplay background |
| **Stickman / whiteboard storyboard** explainers or POV-progression stories | [stickman-storyboard-videos](../subskills/stickman-storyboard-videos/SUBSKILL.md) | narrated storyboard video | synthetic narration | procedural stick-figure rigs + scene JSON |
| A **social / meme / compilation Shorts factory** across several channels | [social-clip-shorts-factory](../subskills/social-clip-shorts-factory/SUBSKILL.md) | branded Shorts + separately reviewed compilations | none (TTS only on compilation interstitials) | user-supplied media with a recorded permission state |

Theme disqualifiers and reconciliation with the rules above:
- **Compilations/countdowns are banned for `clip-card-shorts`** (one clip, one caption, never stock). A compilation or multi-source Shorts network is a different product:
  route it to `social-clip-shorts-factory`, which requires a recorded permission state per source and a human approval step; do not bolt it onto Etcherr871.
- **Quizzes stay in `ambient-long-form`** (its quiz line); there is no separate quiz subskill. Chat stories are produced by the HES-owned engine in `hidden-everyday-systems/chat-stories/`,
  so a chat-story request is an HES-folder task: ask which channel will publish it before touching files.
- **Themed news niches are not new channels.** They are niche configurations of the technews pipeline (the first question is still "is it recent news with expiring facts?"). Evergreen
  mechanism topics go to `everyday-systems-explainer` even when they sound like a "myth debunk" or "retrospective" niche.
- **Manga recap and horror are not "free content" routes:** manga recap needs a recorded rights basis (`owned`/`licensed`/`public_domain_cc`; fair-use is a human legal judgement), and horror needs the
  content-safety gate and paraphrase-only adaptation. If the user cannot supply the rights basis, say so before producing anything.
- **Stickman storyboard videos imitate a format, not a creator:** copy mechanics, never another creator's scripts, art or thumbnails.
- For any theme with **no audience evidence** (horror, manga, stickman, themed news niches have specs only) frame it as a labelled experiment with a kill criterion (theme-catalog §11).
- A request that fits none of the six and none of the five channel types: use theme-catalog §11, then [new-channel-playbook.md](new-channel-playbook.md).

## Before you start any type

1. Read the subskill's current-state/handoff doc (resume point, what is done, what is open).
2. Run the environment preflight ([environment-setup.md](environment-setup.md)); check GPU/TTS service state.
3. Check the channel's ledger/memory for repeats ([workflow.md](workflow.md) stage 1).
4. Respect the channel's invariants and the shared gates ([qa-gates.md](qa-gates.md), [agent-principles.md](agent-principles.md)).
