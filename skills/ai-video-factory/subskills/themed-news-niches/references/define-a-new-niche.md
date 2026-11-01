# Define a new niche (theme): decision list, brief template, acceptance tests

A niche is cheap to add *because* the archived engine made it data (V4 / P10-REQ-2.2): a row, a strategy bundle, 2-3 gold examples, verified sources. The hard part is the editorial decisions - what evidence the niche accepts,
what it refuses, and why a viewer would pick it over its neighbours. Do the decisions first; the files follow.

Contents: 1 Niche, archetype, channel or new video type? - 2 The decision list - 3 Differentiation tests - 4 Niche brief template - 5 Source verification - 6 Acceptance tests - 7 Needs code or not - 8 Policy and rights checklist - 9 Worked example (illustrative)

## 1. Niche, archetype, channel or new video type?

| If the new idea differs from existing ones in... | It is a... | Example |
|---|---|---|
| subject matter + evidence standard, same script shape and visuals family | **niche** | `ai-security` (deep-dive, reused `cyber-terminal`) |
| the *shape* of the script (hook rule, interrupt cadence, segmenting) | **archetype** (+ a niche using it) | weekly-rundown needed `single_hook_only=False` |
| a visual grammar no component serves | **component / screen type** (+ manifest, five registration points) | `claim-evidence-compare` for fraud/retractions |
| public identity, voice, release cadence, rights or audience | **channel** (own folder, ledger, calendar - see `../../../references/new-channel-playbook.md`) | HES, Material Trials |
| production method (narration + illustrations vs sim vs found clips) | **video type / subskill** | horror, manga, chat stories |

Stop and ask the owner if the idea needs a different voice, a different rights model, or changes the promise "every claim traced to the source" - that is a channel, not a niche. A niche never relaxes the channel's invariants (`../../news-explainer/SUBSKILL.md`).

## 2. The decision list (answer every item in writing before any file)

1. **Promise (one sentence):** what a viewer understands after one video that they did not before. Must differ from every existing niche's promise.
2. **Evidence unit:** what a claim is allowed to rest on (advisory, filing, post-mortem, formal notice, paper, primary-source timeline, mechanism + prevalence). List what is *not* acceptable (single blog, social post, anonymous source).
3. **Archetype:** deep-dive / weekly-rundown / retrospective / myth-debunking / new. Justify any new one by script shape, set `hook_required`, `single_hook_only`, pattern-interrupt interval.
4. **Sensitivity (`low|medium|high`):** does the niche make allegations about named real people/companies? `high` -> individual Gate-1 sign-off, "alleged/found by" attribution everywhere, legal-status recheck before audio.
5. **Scoring rubric:** 3-5 sentences: what earns 9-10, what is capped at 4-6, what is penalised. Write at least one *must-penalise* clause (the failure mode that would make the niche embarrassing). `null` only for niches whose items are founded another way (cluster / upload).
6. **Editorial constraint:** the niche's refusals and structural musts, each phrased so a reviewer can check it with yes/no (e.g. "verdict word only in the last sentence", "at least one then-vs-now beat", "distinguish demonstrated from theoretical"). Append the relatable-contrast directive unless the niche is narrative.
7. **Sources:** >= 2 verified feeds or a named primary-source routine (section 5); say how candidates are discovered if no feed exists (`curated_seed_list`, `manual_submission`) - do not claim `rss_feed` without a feed.
8. **Component / visual family:** which existing screen type fits; justify before proposing a new one (one niche alone rarely justifies a new component - `ai-security` reused `cyber-terminal`).
9. **Voice/pacing mode:** `deadpan_technical` (conversational, default) vs `expressive_narrative` vs `slow_atmospheric`; music rotation; accent colour token.
10. **Runtime policy:** default bands or a floor (cyber niches 360 s); Short strategy and CTA style.
11. **Hook style:** the one pattern its hooks follow (consequence + removed barrier; scale vs trigger; money vs speed of collapse; folk claim; surprising end state; tease of three) with a banned-opener list (no greetings, no "have you ever wondered").
12. **Thumbnail/title pattern:** claim-not-label, 2-5 words, what it must never imply; title archetypes that fit.
13. **Risks and refusals:** top 3 ways this niche can hurt someone or the channel (defamation, exploit detail, medical advice, misleading causal claim) and the rule that blocks each.
14. **Dedup scope:** how the niche's topics are identified so the ledger can catch repeats across niches (normalised topic + source URL).
15. **Review owner:** who signs `high`-sensitivity scripts.

## 3. Differentiation tests (a niche that fails these is a re-label)

- **Same-story test:** take 5 recent stories; score each with the new rubric and every neighbour's. If the same stories win everywhere the rubrics do not separate - tighten the evidence unit.
- **Refusal test:** name one popular story this niche *must reject* that a neighbour would accept (e.g. a retraction with no formal notice; an outage with no post-mortem; a CVE with no exploitation).
- **Shape test:** read the niche's hook + interrupt + last beat aloud next to a neighbour's; if they could swap, the niche has no voice of its own.
- **Viewer-intent test:** what search or curiosity brings a viewer here? If it is the same as a neighbour's, merge into that niche as a sub-topic.
- **Cadence test:** can the niche sustain its release slot for 8 weeks from verified sources alone? Count candidate sources, not ideas.
- **Anti-slop test:** if all weights/hook devices were pushed to the max, would the output still be honest? The tuner's declared optimum is moderate, never maximal (`shorts-and-retention-tuning.md`).

## 4. Niche brief template (one file per niche; version it, never edit in place)

```json
{
  "key": "kebab-case-unique", "name": "Display Name", "version": 1,
  "archetype": "deep-dive | weekly-rundown | retrospective | myth-debunking | <new>",
  "promise": "...",
  "strategy_bundle": {
    "scoring_rubric": "... or null",
    "scoring_weights": null,
    "editorial_constraints": "... + RELATABLE_CONTRAST_DIRECTIVE",
    "source_discovery_method": "rss_feed | curated_seed_list | manual_submission | user_provided_document",
    "real_entity_sensitivity_level": "low | medium | high",
    "component_set": ["<one or more screen types>"],
    "rendering_mode": "cis", "rendering_mode_locked": false,
    "production_mode": "automatic", "visual_policy": "representative-news",
    "shorts_cta_style": "link_to_full_video"
  },
  "pacing_profile": {"voice_delivery_mode": "deadpan_technical"},
  "sources": [{"name": "...", "url": "...", "verified_on": "YYYY-MM-DD", "notes": "UA required / broad / ..."}],
  "dropped_sources": [{"name": "...", "reason": "no discovery feed | 403 | TLS error"}],
  "voice_profile": "dots-warm-informational", "music_rotation": ["..."], "accent_token": "color.niche.<key>",
  "hook_style": "...", "banned_openers": ["..."], "thumbnail_rule": "...", "title_archetypes": ["..."],
  "risks": [{"risk": "...", "block": "..."}],
  "few_shot": "few_shot_examples/<key>-v1.json", "golden_pairs": ["golden/<key>/..."]
}
```

## 5. Source verification (V2 / V4 practice)

For every source: live-fetch with a normal HTTP client and a realistic browser User-Agent (not the OS `curl` default - BleepingComputer 403'd it), require HTTP 200, valid RSS/Atom XML, a valid TLS chain, and entries newer than a few weeks.
Record dropped candidates with the reason - CISA's RSS (403), PubPeer (no discovery feed, DOI lookup only), arXiv (no retraction feed), forbetterscience.com (broken TLS chain) - so nobody re-adds them. Never seed an unverified URL "as if confirmed" (V4-REQ-1.7).
A broad feed (SEC 8-K Atom) is acceptable when the *scorer* does the precision work; a second source is not mandatory if only one is verified (`scientific-fraud-retractions` ships with one).
For the channel's own evidence rule, also require at least one independent corroborating source per video (currently a recommendation, unmet by most productions - `../../news-explainer/references/editorial-standards.md`).

## 6. Acceptance tests (all must pass before the niche's first production)

| # | Test | Pass condition |
|---|---|---|
| A | Brief complete | all of section 2 answered; template filled; key unique; component exists in the manifest list |
| B | Sources | >= 1 verified source (>= 2 preferred) with dates; dropped list recorded; discovery method truthful |
| C | Few-shot corpus | 2-3 examples; all nine corpus tests in `stage-methods-and-schemas.md` section 10 pass; no meta text; facts illustrative or verified |
| D | Rubric dry run | score 5 real candidates twice (independent runs); agreement within 1 point on >= 4 of 5; the must-penalise item scores <= 4 |
| E | Constraint dry run | write one script from a real source; each editorial-constraint clause verifiable yes/no and answered yes; reading aloud passes |
| F | Gates | fact-check report has zero unresolved untraceable claims; scene arithmetic (cues, reveal budget, real spoken length) passes; sensitivity gate honoured |
| G | Golden pair | one approved script saved as the niche's first golden pair; any later prompt/brief edit is replayed against it |
| H | Differentiation | section 3 tests recorded with outcomes |
| I | Policy | section 8 checklist answered; owner approves the first script individually regardless of sensitivity |

Do not mark a niche live on tests A-C alone. D-F need a real source and take half a day of review.

## 7. Needs code or not

- **No code (data only):** new niche reusing an existing component and archetype; new rubric/constraints; sources; few-shot set; sensitivity; runtime floor in a brief.
- **Small code:** new archetype with a different hook rule (`single_hook_only`); a new niche-specific bgm rotation; a niche-keyed runtime floor.
- **Real code:** new component (five enumeration points + manifest + renderer component + cue/reveal-budget rules); a second feed adapter (JSON catalog instead of RSS - `sources.fetch_kind`); a niche-specific ground-truth assembly for fact-check (manga panels). When the project is run by hand (Claude as LLM layer) only the renderer side matters - restore the renderer from `toolkit/renderer/`.

## 8. Policy and rights checklist (open risks recorded, not solved)

- **Defamation / real-entity risk:** any niche naming real people or companies -> `high`, attribution, adjudicated vs alleged, no speculation about character or intent (V4-REQ-1.2/1.3). Retractions are not accusations.
- **YouTube policy:** "reused content / mass-produced" policy is the standing risk for template-driven news; each video needs original analysis, sourcing and a human gate. Disclosure rules for realistic synthetic media/synthetic voice apply; do not claim or promise anything about evading labelling or detection (`../../news-explainer/SUBSKILL.md` invariant 9; cross-channel rules in `../../../references/agent-principles.md`).
- **Third-party media:** Tier 0-2 assets only by default; Tier 3 never; Tier F (fair use) only through the human four-factor review (`../../../references/creative-illustration-separation.md`). The news standard of "faithful, attributed excerpts or purpose-built `SourceCitation` components; never fabricate a screenshot" applies to every niche.
- **Real likenesses:** the channel renders no real people's faces; quotes default to text without a celebrity photo unless that person is the subject (V5-REQ-10.3).
- **Safety content:** cyber niches - no exploit detail; ai-security - no working jailbreak/poisoning recipes; myths - health/safety claims need regulator-grade sources.
- **AI-generated imagery as evidence:** never.
- Everything about unauthorised publishing/upload stays as in the channel subskill: no upload without explicit authorisation in that turn.

## 9. Worked example (illustrative, not a shipped niche)

Idea: "semiconductor-supply-chain-shocks". Promise: *how a single plant, regulation or shortage rippled through products viewers own.* Evidence unit: company filings, regulator statements, industry-association data (not analyst opinion alone). Archetype: deep-dive (cause chain) -> `failure-schematic` (reuse). Sensitivity `medium` (export-control/geopolitical claims; attribute allegations).
Must-penalise: stories resting on a single unnamed source or an analyst forecast presented as fact. Refusal: no price predictions. Hook: part number or product -> the removed supply. Sources: filings feed + trade-press feeds verified on a date; dropped: paywalled feeds. Differentiation vs `infra-failures`: physical supply, not software outage; vs `corporate-startup-autopsies`: no failure narrative of one firm. Then run tests A-I.
