---
name: themed-news-niches
description: The theme/niche layer for evidence-led explainer channels - how to define, run and differentiate a niche (cyberattacks and zero-days, AI security, AI/ML papers, infrastructure failures, corporate/startup autopsies, scientific fraud and retractions, tech myths debunked, tech retrospectives "whatever happened to X", weekly tech rundown) rather than a whole channel. Use whenever the user wants a new niche or theme for an existing explainer channel, asks which niche a story belongs to, how a niche's scoring rubric, editorial constraints, sources, hook style, archetype (deep-dive, weekly rundown, retrospective, myth-debunking) or sensitivity level should work, wants gold few-shot examples for a theme, asks about strategy bundles, automatic vs manual vs step-by-step production mode, Shorts/retention tuning per niche, or Creative Illustration Separation (CIS) screens. Not for the daily LITMUS production workflow itself (use news-explainer) or for horror/manga/chat/stickman formats (their own subskills).
---

# Themed news niches (the theme layer)

A **niche** (theme) is a content vertical with its own *evidence standard, scoring rubric, sources, voice rules and failure modes*, running on a channel's shared pipeline. A **channel** is the public identity;
an **archetype** is the script shape. This subskill is how to define, run and differentiate niches. It distils the retired technews app's niche system (v4 theme selector + strategy bundles, v5 CIS, v6 production modes,
p10 archetypes/Shorts/retention tuner, v11 stepwise gating), the nine gold few-shot sets and the in-app reference docs. **Claude is the LLM layer** - the old engine's model-API stages are written here as methods you perform yourself.

## When to use / not use

- Use: define or critique a niche; choose the niche (and so rubric, constraints, archetype, component) for a candidate story; write a niche's brief or gold examples; decide automatic vs manual vs stepwise control for a project; plan a niche's Shorts; tune scoring from retention data; apply CIS to a new illustration-led format.
- Not for: the day-to-day LITMUS pipeline (research -> TTS -> render -> schedule) - that is [`news-explainer`](../news-explainer/SUBSKILL.md), which this layer sits on top of. Not for evergreen mechanism explainers ([`everyday-systems-explainer`](../everyday-systems-explainer/SUBSKILL.md)).
  Horror and manga are *side niches* configured the same way but owned by [`horror-story-videos`](../horror-story-videos/SUBSKILL.md) and [`manga-recap`](../manga-recap/SUBSKILL.md).
- If a request changes voice, rights model or the channel promise, it is a new **channel**, not a niche ([`new-channel-playbook`](../../references/new-channel-playbook.md)) - ask the owner.

## The nine news niches at a glance (full playbooks in `references/niche-playbooks.md`)

| Niche | Archetype | Screen type | Sensitivity | Evidence unit | Verified sources |
|---|---|---|---|---|---|
| cyberattacks-zerodays | deep-dive | cyber-terminal | - | advisory / CVE / vendor post | The Hacker News, BleepingComputer |
| ai-security | deep-dive | cyber-terminal | medium | demonstrated attack on a deployed AI system | none seeded |
| ai-ml-papers | deep-dive | ai-logic-node | - | paper / model card | arXiv cs.AI, cs.LG |
| infra-failures | deep-dive | failure-schematic | - | operator post-mortem | The New Stack, InfoQ |
| corporate-startup-autopsies | deep-dive | failure-schematic | **high** | filings + multiple independent reports | TechCrunch, Crunchbase News, CB Insights, SEC 8-K |
| scientific-fraud-retractions | deep-dive | claim-evidence-compare | **high** | formal notice / institutional investigation | Retraction Watch |
| tech-myths-debunked | myth-debunking | verdict-card | low | mechanism + sourced prevalence | none seeded |
| tech-retrospectives | retrospective | timeline-marker | - | contemporaneous reporting across a span | none seeded |
| weekly-tech-rundown | weekly-rundown | chapter-card | - | 3-4 independent primary sources | none seeded |

## Pipeline for a niche production, with the gate at each step

(Engine step names in parentheses; details in `references/stage-methods-and-schemas.md`.)

1. **Discover + dedup** (ingestion): candidates from the niche's verified sources or routine; dedup on exact hash + fuzzy title **across all niches** and against the channel ledger. *Gate:* new source, new angle.
2. **Intake approval** (stepwise gating): human chooses which items are worth scoring.
3. **Score twice, independently** (scoring) with the niche rubric. *Gate:* agreement within 1 point **and** mean >= 6, else tie-break; then a human **selects** the idea (always, in every mode).
4. **Script** (scriptwriting) from the niche brief + 2-3 gold examples; archetype hook rule; runtime/word budget from source richness. *Gate:* non-negotiables (cyber guardrail, no fabrication, every claim traceable).
5. **Edit** (editor_critique): hook, pacing, jargon, dead stretches; smallest change; re-apply the niche constraint by hand (the engine's editor never saw it).
6. **Fact-check** (+ fact_correction): claim -> source table; untraceable claims flagged, never deleted. *Gate:* `high`-sensitivity niches need individual sign-off.
7. **GATE 1** - human approves the script. Recheck volatile facts (legal status, prices, availability) right before audio.
8. **Audio -> alignment -> captions**, then **visuals**: legacy cue arithmetic or CIS passes 2-4 (screens, real-timestamp binding, transitions) with rights-tiered assets.
9. **Render -> QA -> GATE 2** - human approves the final rendered MP4s; fair-use memos (if any) visible.
10. **Short variant** (fresh 55 s rewrite, never cut audio) -> metadata -> schedule via the channel's calendar (news-explainer). Nothing uploads without explicit authorisation that turn.
11. **Learn:** import retention data, propose weight changes, human approves (`references/shorts-and-retention-tuning.md`).

## Non-negotiable invariants

1. A niche is **data**: rubric + constraints + sources + sensitivity + component + gold examples. Never fork stage logic per niche; inject the same blocks into the same stages. New niche != new pipeline.
2. Every niche inherits the channel invariants of news-explainer (accuracy over speed; source URLs kept; exact Short CTA; no fabricated screenshots or quotes; no operational exploit detail; no claims of evading platform detection; Gates 1 and 2 are human). A niche may only be **stricter**.
3. Niches that make allegations about named real parties (`high` sensitivity) require individual sign-off, attribution of every allegation to a formal source, and a legal-status recheck before audio. Distinguish adjudicated from alleged; retraction from fraud; failure from fraud.
4. Mode/brief are resolved **once per project** and never silently re-derived from the live niche; changes lock at Gate 1. Version the niche brief; never edit a version in place.
5. Scoring is two independent passes; agreement alone never selects; a human always selects the idea.
6. Gold examples teach **shape, not facts**; every corpus passes the pacing/arithmetic tests; no meta-text or relative dates ("this year") inside examples.
7. Third-party media only by rights tier (0-2 auto, 3 never, F only via human four-factor review). See the CIS reference.
8. Retention tuning is a pure computation + explicit human approval; it must not collapse the diversity of weights; engagement-bait weight's optimum is 0.
9. Report honestly: what passed, what was rejected, what was not verified (e.g. no live feed, unvalidated tuner).

## Route the task

| Task | Read |
|---|---|
| What a niche/archetype/strategy bundle is; every config field; archetype numbers; how config reaches each stage; component manifests; voice/music per niche | [`references/niche-model-and-strategy-bundles.md`](references/niche-model-and-strategy-bundles.md) |
| A specific niche: voice, rubric, constraints, sources, hook/gold example, evidence rules, visuals, risks; niche comparison | [`references/niche-playbooks.md`](references/niche-playbooks.md) |
| Define a new niche/theme: decision list, differentiation tests, brief template, source verification, acceptance tests, policy checklist | [`references/define-a-new-niche.md`](references/define-a-new-niche.md) |
| How to perform scorer / scriptwriter / editor / fact-check / cue / CIS stages; schemas; few-shot corpus tests; regression discipline | [`references/stage-methods-and-schemas.md`](references/stage-methods-and-schemas.md) |
| Automatic vs manual vs stepwise control; ideation gate; revert; phases; strategy-bundle/routing history as method | [`references/production-modes-and-gating.md`](references/production-modes-and-gating.md) |
| Shorts per niche, vertical recap, `variant` invariant, retention tuner, tuning cycle | [`references/shorts-and-retention-tuning.md`](references/shorts-and-retention-tuning.md) |
| What exists in the archived engine, restore commands, files to consult, contradictions, open gaps | [`references/current-state-and-restore.md`](references/current-state-and-restore.md) |
| CIS (four passes, rights tiers, fair use) for any illustration-led format | [`../../references/creative-illustration-separation.md`](../../references/creative-illustration-separation.md) |

## Reuse, do not duplicate

- Daily workflow, editorial standards (claim ledger, cyber/AI/consumer/policy standards, titles/descriptions/tags/thumbnail copy), creator style (hook tiers, sentence rhythm, thumbnail identity), QA and release: [`news-explainer`](../news-explainer/SUBSKILL.md) and its references (`editorial-standards.md`, `creator-style-guide.md`, `qa-release.md`, `release-and-upload.md`, `pipeline-and-architecture.md`).
- Narration and tempo: [`voice-tts.md`](../../references/voice-tts.md); captions, loudness, music: [`audio-captions-music.md`](../../references/audio-captions-music.md); render: [`rendering.md`](../../references/rendering.md); gates catalogue: [`qa-gates.md`](../../references/qa-gates.md); universal stages: [`workflow.md`](../../references/workflow.md); ledger/calendar: [`release-calendar.md`](../../references/release-calendar.md); new channel: [`new-channel-playbook.md`](../../references/new-channel-playbook.md); cross-channel rules: [`agent-principles.md`](../../references/agent-principles.md).
- Sibling themes using the same machinery: [`horror-story-videos`](../horror-story-videos/SUBSKILL.md), [`manga-recap`](../manga-recap/SUBSKILL.md); catalogue of all themes: [`theme-catalog.md`](../../references/theme-catalog.md).
- Repo docs `technews/docs/` (CREATOR_STYLE_GUIDE, LITMUS_QUALITY_PROFILE, VIDEO_ORCHESTRATION_PLAYBOOK, master spec) are already distilled into news-explainer - read them only for provenance.

## Start a NEW niche: the first 10 decisions

1. **Promise** in one sentence, different from every existing niche. 2. **Evidence unit** and what is *not* acceptable. 3. **Archetype** (reuse before inventing; a new hook rule = new archetype).
4. **Sensitivity** level and the attribution rule it implies. 5. **Rubric** with a must-penalise clause. 6. **Editorial constraint** as yes/no-checkable clauses (+ relatable-contrast directive unless narrative).
7. **Sources**: >= 1 live-verified (browser User-Agent, 200, valid XML/TLS), dropped list with reasons, truthful discovery method. 8. **Screen type**: reuse an existing one. 9. **Hook style + banned openers + thumbnail/title pattern.**
10. **Risks and refusals** (top three ways it can harm someone) and who signs `high`-sensitivity scripts.
Then write the versioned brief, 2-3 gold examples, run the A-I acceptance tests in `references/define-a-new-niche.md`, and only then produce the first video (the first script is individually approved by the owner regardless of sensitivity).

## Commands and tools: available now vs restorable

- **Now (working tree):** the toolkit - `toolkit/tts-dots` (narration), `toolkit/renderer` + `toolkit/manifests` (Remotion components and the manifest JSONs), `scripts/preflight.ps1`, `scripts/validate-deliverables.ps1`; the channel folder `technews/` (ledger, release calendar, output). Niche selection, scoring, scripting, editing, fact-check, gold-example writing and the acceptance tests are done by Claude with files as state.
- **Restorable from git tag `pre-skill-reduction`:** the whole niche engine (`engine/app/seed.py`, `synthesis/*`, `orchestrator/*`, `tests/*`), `console/` (in-app docs and queues), `few_shot_examples/*.json` (9 sets), `manifests/*.json`, `packages/design-tokens`. Command and caveats: `references/current-state-and-restore.md` section 2-3. The build specs (v4..v14) are in the archive folder named in [`legacy-and-removed.md`](../../references/legacy-and-removed.md), not in the tag.
- Do not extend the restored engine's model-API paths for new work (agent-is-the-LLM-layer rule); decide with the owner whether to keep it as a legacy app.

## Completion discipline

A niche is "defined" only when the brief, sources, gold set, and acceptance tests A-I are recorded; a production is "done" only when the channel's gates (news-explainer) pass **and** the niche-specific checklist from its playbook passes (e.g. verdict-last, then-vs-now, cold-open + chapter-cards, demonstrated-vs-theoretical, adjudicated-vs-alleged). Never state that a platform will classify or reward a video in a particular way.
