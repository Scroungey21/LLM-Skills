# Niche model and strategy bundles

What a niche *is*, what its strategy bundle configures, how archetypes differ, and how a niche's config reaches each stage's prompt.
Everything here was implemented in the archived technews engine (`engine/app/seed.py`, `models/niche.py`, `models/archetype.py`,
`synthesis/prompts.py`; restore with the commands in `current-state-and-restore.md`). Where the engine and the in-app docs disagree, code wins.

Contents: 1 Vocabulary - 2 Strategy-bundle fields - 3 Resolve-once rules - 4 Archetypes - 5 How config reaches each stage - 6 Component (screen type) manifests - 7 Constants that matter per niche - 8 Audio, voice and accent per niche

## 1. Vocabulary (use these words consistently)

| Term | Meaning | Lives where (archived engine) |
|---|---|---|
| **Channel** | A public YouTube identity with its own ledger, calendar, voice and promise (here: LITMUS / YTtechnews). Several niches share one channel. | repo folder `technews/` |
| **Niche = theme** | A content vertical with its **own evidence standard, scoring rubric, sources and voice rules** ("Cyberattacks & Zero-Days"). One row in `niches`. | `niches` + `strategy_bundle` JSON |
| **Archetype** | The *structural shape* a script follows (deep-dive, weekly-rundown, retrospective, myth-debunking): hook rule, pattern-interrupt cadence. | `archetypes` |
| **Screen type / component** | The on-screen visual grammar (`cyber-terminal`, `failure-schematic`, ...). A niche *selects* from the archetype's capability pool. | `component_manifests`, `screen_types`, `strategy_bundle.component_set` |
| **Strategy bundle** | Per-niche JSON of prompt fragments + sourcing + sensitivity + render defaults. The single place niche behaviour lives. | `niches.strategy_bundle` |
| **Pacing profile** | Voice-delivery pacing (separate JSON column, never folded into the bundle - V4-REQ-2.2 / RD-19). | `niches.pacing_profile` |
| **Few-shot set** | 2-3 gold example scripts per niche teaching its rhetorical shape. | `few_shot_examples/<niche>-v1.json` |

Design rule (V4-REQ-2.3, P10-REQ-2.2): a new niche or archetype is **data, never a pipeline change**. Stage code branches on *stage*, never on niche key
(the only deliberate niche-keyed code branches that ever existed were `manga_recap` panel grounding and `horror_stories` safety/clustering - side niches).
When Claude is the LLM layer, the same rule becomes: *one niche brief file, injected into the same stage prompts; no per-niche prompt forks.*

## 2. Strategy-bundle fields

| Key | Type | What it does | Source |
|---|---|---|---|
| `scoring_rubric` | text or `null` | Appended to the scorer prompt as "Niche-specific scoring guidance"; refines, never overrides, the 1-10 scale. `null` = niche skips LLM scoring (manga_recap, horror_stories). | V4-REQ-2.1, seed.py |
| `scoring_weights` | `{dim: 0..1}` | Tuned emphasis levels rendered into the scorer prompt (`render_scoring_weights_block`); written **only** by an approved tuning proposal. Dimensions used by the tuner: `hook_density`, `pacing_variety`, `payoff_clarity`, `claim_density`, `engagement_bait`. Absent by default. | P10-REQ-3.x |
| `editorial_constraints` | text | Prose injected verbatim into scriptwriter, fact-checker and cue-validator prompts ("Niche-specific editorial constraint"). Not machine-enforced; the LLM follows it. | V4-REQ-2.3, V5-REQ-8.3 |
| `source_discovery_method` | free text | `rss_feed` (default), `curated_seed_list`, `manual_submission`, `user_provided_document` (manga_recap). Free text on purpose - never a DB enum (V4-REQ-2.1). | V4-REQ-2.1, V7 |
| `real_entity_sensitivity_level` | `low`/`medium`/`high` | `high` = allegations about named real parties: **bulk-approve disabled, every script individually signed off at Gate 1** (V4-REQ-2.4; no bulk endpoint existed anyway). `high`: corporate-startup-autopsies, scientific-fraud-retractions, horror_stories. `medium`: ai-security. `low`: tech-myths-debunked, manga_recap. Unset elsewhere. | V4-REQ-1.4, 2.4 |
| `component_set` | list | Which screen component(s) the niche uses; the legacy scriptwriter stamps `component_set[0]` on every scene (`_resolve_component` raises if empty). A *selection from* the archetype's pool (RD-20: archetype pool = capability, niche = actual choice). | RD-20, seed.py |
| `rendering_mode` | `legacy_scene`/`cis` | Niche default only; copied to the project once (see 3). All seeded niches are `cis` in code. | V5-REQ-1.1, seed.py |
| `rendering_mode_locked` | bool | `true` = no legacy option ever (manga_recap, horror_stories); enforced by `change_rendering_mode`. | V7 RD-109 |
| `production_mode` | `automatic`/`manual` | Niche default (see `production-modes-and-gating.md`). Only manga_recap seeds `manual`. | V6-REQ-1.1 |
| `visual_policy` | text | `representative-news` on the nine news niches: turns on the "Beginner-friendly explanation directive" in the scriptwriter prompt and `normalize_news_beats` (beat splitting) for CIS projects. Narrative/recap niches never inherit it. | seed.py `NEWS_VISUAL_POLICY` |
| `visual_filter`, `background_variety` | text, ms | Post-processing preset and max background-clip hold (horror_stories: `crt_scanlines`, 4000 ms). | V8 |
| `shorts_cta_style` | `link_to_full_video` / `link_to_source` | CTA family used by condensation/Shorts: narrative niches link to the full video, informational niches to the source. | V8-REQ-9.5 |
| `few_shot_example_set_id` (column) | str | Auto-assigned at seed time **only if** `few_shot_examples/<niche>-v1.json` exists (P10-REQ-2.4; the pre-P10 bug left every id `None` so the examples were silently never used). | P10-REQ-2.4 |

Excluded on purpose: `voice_profile_id` and `pacing_profile` stay on their own `niches` columns (V4-INV-5).

**`editorial_constraints` building blocks (copy, then extend per niche):**

- `RELATABLE_CONTRAST_DIRECTIVE` (appended to every news niche, V5-REQ-8.3): after any impressive spec/scale figure (throughput, parameters, funding, blast radius) follow
  immediately with a mundane concrete comparison from the audience's everyday life; make the abstraction felt, never mock or diminish the achievement.
  Deliberately **not** appended to narrative niches (manga_recap, horror_stories) - they have no technical figures to ground.
- Pattern-interrupt definition (V5-REQ-8.4, in the scriptwriter prompt): a *high-tech / low-brow whiplash* - a dense accurate technical passage immediately followed by an
  absurd/mundane deflating analogy (datacenter power draw vs a hair dryer). The technical half must stay accurate; the deflation never softens a number to make the joke land.
- Tone note for the editor (V5-REQ-8.5): personified framing of a company or lab ("the startup's finances were held together by optimism") is *voice*, not a factual claim, so it needs no citation and
  is never a "dead stretch" or "jargon" finding; reserve factual scrutiny for stats, dates, quotes and events presented as fact.
- "Deadpan pacing directive" (V5-REQ-8.6/8.7, assembled at call time, only when `pacing_profile.voice_delivery_mode` = `deadpan_technical`, the default): in code this became a
  *conversational* directive (varied sentence length, contractions, no fragment chains, no slide-deck prose) rather than literal deadpan fragments. Written as the code says.

## 3. Resolve-once rules (do not re-derive from the live niche)

- `rendering_mode` and `production_mode` are copied from `niche.strategy_bundle` **once at project creation**, persisted on the project, and never re-read (V5 RD-79, V6-REQ-1.2).
  Reason: the bundle is a live editable blob; re-reading mid-flight made an in-flight project's resolved mode diverge from the step rows it already had, failing far downstream.
  Method equivalent: *a production definition records the niche brief version it was started under; editing the niche later never silently changes an in-flight video.*
- Both can be overridden per project and changed **only until Gate 1 (script approval)**; after approval the change is rejected (V5-REQ-1.3, V6-REQ-1.3). Reason: the step chains diverge only after fact-check, so Gate 1 is the last cheap point.
- The two modes are orthogonal (V6-REQ-1.4): `automatic|manual` x `legacy_scene|cis` all valid. `manual` means *a human does the creative work instead of the AI*; it is **not** the same thing as step-by-step approval (that is `gating_mode`, v11 - see `production-modes-and-gating.md`).
- `niches.pacing_profile.voice_delivery_mode`: `deadpan_technical` (default, absent key) | `expressive_narrative` (manga_recap) | `slow_atmospheric` (horror_stories). Governs breath-trim intensity ("full" vs "light") and whether the conversational directive is added (V5-REQ-8.7, RD-99).

## 4. Archetypes (`ARCHETYPE_SEEDS`)

| Archetype | `hook_required` | `single_hook_only` | pattern-interrupt interval | Shape | Why |
|---|---|---|---|---|---|
| `deep-dive` | yes | **yes** | 45 s | One story, hook at scene 0 -> mechanism -> twist -> payoff. Seven niches. | default |
| `weekly-rundown` | yes | **no** | 20 s | Cold-open tease -> 3-4 segments (chapter-card + fresh hook each) -> closing tease. | A single fixed hook position cannot represent a fresh hook per segment (P10 design §3) |
| `retrospective` | yes | yes | 60 s | One chronological throughline, dated beats, explicit then-vs-now beat, real payoff. | slower narrative |
| `myth-debunking` | yes | yes | 45 s (reuses the default - never `None`, because prompt interpolation has no None-guard: "roughly every None seconds" must never reach a model) | Claim -> mechanism -> verdict word last. | |

Hook enforcement (code, `scriptwriter.py`): `single_hook_only=True` -> scene 0 is forced `is_hook=true` and every other scene `false`, ignoring the LLM's markers;
`False` -> trust the LLM's per-scene `is_hook`, still floor at >=1 hook when `hook_required`. Pattern-interrupt placement is **not** forced - the model's flags are best-effort against the stated cadence.
Rule for a new archetype: multi-segment/digest shape -> `single_hook_only=False`; single-story shape -> default `True` (P10 design §3).
A scene-0 profanity check flags (does not block) terms from a wordlist - flag-for-human, same pattern as fact-check.

## 5. How config reaches each stage (`assemble_prompt`)

Injection branches on **stage**; every niche flows through the same checks and an absent key is a no-op (V4-REQ-2.3).

| Stage | Gets from the niche |
|---|---|
| scorer | base prompt + `scoring_rubric` ("Niche-specific scoring guidance") + `scoring_weights` block (if tuned) |
| scriptwriter | base + `editorial_constraints` + conversational directive (if `deadpan_technical`) + beginner-friendly directive (if `visual_policy = representative-news`) + up to 3 few-shot examples (min 2 required) |
| fact-checker | base + `editorial_constraints` |
| cue-validator | base + `editorial_constraints` |
| editor | **base only** (no niche constraint). Open risk: the editor can "tighten" away niche structure (chapter-cards, the then-vs-now beat, the verdict-last rule). When Claude edits, re-read the niche constraint first. |
| content-safety / story-clustering (horror only) | base only |

Few-shot rendering: each example is printed as `Scene i (HOOK|pattern-interrupt|body, component, Nw/Mms): narration`; examples teach *shape*, never facts (the scriptwriter prompt says so explicitly).

## 6. Component (screen type) manifests

Shared by the Python cue validator and the Remotion renderer (`manifests/<name>.json`). `max_typing_speed_cps 0` or `max_nodes 0` = that bound is never checked.

| Component | Used by niche | cps | max nodes | scene ms (min-max) | Notes |
|---|---|---|---|---|---|
| `cyber-terminal` | cyberattacks-zerodays, ai-security | 24 | 0 | 800-12000 | text-heavy terminal |
| `failure-schematic` | infra-failures, corporate-startup-autopsies | 0 | 12 | 1000-15000 | process-flow / cause chain |
| `ai-logic-node` | ai-ml-papers | 0 | 16 | 1000-15000 | topology graph |
| `claim-evidence-compare` | scientific-fraud-retractions | 24 | 0 | 800-15000 | two columns "claimed" vs "found"; split reveal budget |
| `verdict-card` | tech-myths-debunked | 24 | 0 | 800-15000 | split-budget; deterministic keyword scan sets verdict tag; neutral until a verdict word appears |
| `timeline-marker` | tech-retrospectives | 20 | 0 | 1500-9000 | |
| `chapter-card` | weekly-tech-rundown | 30 | 0 | 1200-**4000** | every scene capped at 4 s -> segments are several quick beats |
| `source-citation` | any (citation screens) | 26 | 0 | 2500-14000 | faux-browser evidence card; real design tokens |
| `citation-badge` | any (light attribution) | 26 | 0 | 2000-4500 | corner badge over a running scene |
| `loop-gauge` | any (repeated process) | 0 | 8 | 3000-15000 | |
| `asset-sting` (`quick_hit_sting`) | any | 0 | 0 | 750-2000 | mascot/sticker reaction only, Tier 0-2 sources, never third-party clips |
| `sponsor-segment` | any | 0 | 0 | 3000-60000 | `copy_source: human_only` - never LLM-written |
| `atmosphere-narration` | horror_stories | 0 | 0 | 2000-30000 | named elements `foreground_textbox`, `background_layer`; see horror subskill |
| `manga-panel-composition` | manga_recap | 0 | 0 | 1000-15000 | named elements `background_layer` (85 % blur), `foreground_layer` (60-80 % width); see manga subskill |

Three further components (`StatGauge`, `BeforeAfterSplit`, `RedactedDocument`, ...) were proposed but never built (`news-explainer/references/creator-style-guide.md` section 4).
`llm_authored_animation` screens (`LlmAuthoredAnimationRuntime.tsx`) never shipped past a placeholder stub - **never use them in a real production**; the lint/sandbox/repair design is in `../../../references/creative-illustration-separation.md`.
Adding a component touches five enumeration points (Python `COMPONENT_NAMES`, TS `ComponentName` union + array, `COMPONENT_MANIFEST_NAMES`, manifests.ts, `SceneRenderer` map) - V5 design section 13.

## 7. Constants that matter per niche

- Runtime bands (RD-33): source text <2000 chars -> 240 s; 2000-6000 -> 420 s; >6000 -> 600 s (cap). `cyberattacks-zerodays` and `ai-security` floor at **360 s** (room to explain system, path, blast radius, limits to non-experts). Shorts: fixed 55 s regardless of source.
- Words: `WORDS_PER_MINUTE=225` (calibrated at tempo 1.5; the live tempo is 1.2 - open conflict, see `news-explainer/references/audio-tts.md`), hook reserve 10 %; natural-pace band for few-shot scenes 2.0-3.2 words/s (target 2.5). `TARGET_BEAT_WORDS=26`, `MAX_BEAT_WORDS=34`.
- Scorer: two independent runs, `AGREEMENT_BAND=1`, `SELECTION_AVG_SCORE_FLOOR=6`; disagreement -> human tie-break (choose run 1, run 2, or manual score+rationale pre-filled with the mean).
- Cue validation: bounded to 2 attempts; deterministic checks beat the LLM's; repair routes to the scriptwriter and is kept only if it strictly reduces deterministic violations.
- Pattern-interrupt interval: 45 / 20 / 60 / 45 s per archetype (section 4).

## 8. Audio, voice and accent per niche

- Voice: one house voice `dots-warm-informational` for all nine news niches (`seed_voice_profiles.py`). The binding that matters is `niches.voice_profile_id`, not the profile's own "declared niche" label; a niche with no bound profile blocks audio. Voice rules: `../../../references/voice-tts.md`.
- Music bed rotation (`audio/bgm.py`, hash of `niche_key:script_id`): cyberattacks-zerodays `signal-room / night-pulse / data-current`; ai-security `night-pulse / signal-room / neural-drift`; ai-ml-papers `neural-drift / quiet-orbit / quiet-circuit`; infra-failures `data-current / quiet-circuit / signal-room`; weekly-tech-rundown `quiet-circuit / data-current / quiet-orbit`. The other niches fall to `DEFAULT_ROTATION`. Music policy: `../../../references/audio-captions-music.md`.
- Accent colour: `color.niche.*` design tokens via `resolveAccent(niche_key)` (throws if a niche is unmapped - add the token when adding a niche).
