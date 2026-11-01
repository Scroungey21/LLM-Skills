# Current state, restore guide, contradictions and open questions

Contents: 1 What exists today - 2 Implemented in the archived engine - 3 Restore commands and files to consult - 4 Where each in-app doc topic was absorbed - 5 Contradictions found - 6 Gaps and open questions

## 1. What exists today

- **Live data folder:** `technews/` (release calendar, ledger, output). The nine news niches are *not* separate folders; the live LITMUS channel mostly produces `cyberattacks-zerodays`, `ai-ml-papers`, `ai-security` and `weekly-tech-rundown` (gadget stories) content - see `../../news-explainer/references/current-state.md`.
- **In the working tree:** nothing of the niche machinery. The `engine/`, `console/`, `manifests/`, `few_shot_examples/`, `packages/`, `tui/` trees were removed from the working tree; this skill carries `toolkit/manifests/` and `toolkit/renderer/` (renderer + component manifests, source only).
- **Dormant but valuable:** the nine few-shot JSON sets, the seeded strategy bundles and the p10 golden-set fixtures - recoverable from git, summarised in this subskill.
- Public niche list actually seeded in the engine DB: 11 niches (9 news + `manga_recap` + `horror_stories`), 4 archetypes, 14 component manifests, 14 screen types, 12 asset-library seed rows, 10 prompt-registry stages.

## 2. Implemented in the archived engine (can be restored; do not extend its model-API paths)

| Capability | Spec | Code / tests worth reading |
|---|---|---|
| Niche + archetype + strategy bundle seeding (idempotent, backfills missing keys without overwriting operator edits) | v4, v5, p10 | `engine/app/seed.py`, `models/niche.py`, `models/archetype.py`, `api/niche_config.py`, `tests/test_niche_config.py` |
| Prompt assembly per stage | v4-REQ-2.3, v5 RD-99 | `synthesis/prompts.py` |
| Prompt text per stage (v1..v4 history) | v4/v5/p10 | `engine/app/seed_prompts.py` |
| Scorer (2 runs, band 1, floor 6), tie-break, ideation queue | top-level, v6 | `synthesis/scorer.py`, `api/scored_items.py` |
| Scriptwriter (runtime bands, hook enforcement, shorts, condensation) | P3, p10, v8 | `synthesis/scriptwriter.py`, `synthesis/narration_beats.py`, `synthesis/shorts.py` |
| Cue validator + reveal budget | P3, P10 | `synthesis/cue_validator.py`, `synthesis/reveal_budget.py` |
| Few-shot corpus + permanent tests | P3-REQ-9.3 | `few_shot_examples/*.json`, `tests/test_few_shot_examples.py`, `seed_few_shot.py` |
| CIS screens/transitions/asset library/fair use | v5 | `synthesis/screen_generator.py`, `screen_validator.py`, `transition_validator.py`, `models/{screen,screen_type,transition,asset_library,fair_use_assessment}.py`, `synthesis/fair_use.py`, `tests/test_v5_*.py` |
| Production mode, asset curation, phase revision, manual script | v6 | `synthesis/{manual_script,phase_revision}.py`, `models/{phase_status,screen_edit_history,research_steer_hint,project_asset_shortlist}.py`, `tests/test_v6_*.py` |
| Gating + revert | v11 | `orchestrator/{tick,revert,steps,control}.py`, `models/project.py` (`gating_mode`) |
| Retention tuner | p10 | `synthesis/retention_tuner.py`, `api/{analytics,tuning}.py`, `tests/{test_retention_tuner,test_analytics_ingestion}.py` |
| Golden-set regression gate | P9 | `synthesis/golden_set_regression.py`, `api/{golden_set,prompt_registry}.py`, `tests/test_p9_golden_set_regression.py` |
| Horror safety/cluster, manga uploads/NLE export | v7/v8 | owned by the sibling subskills |
| Archetype fixtures (rundown, retrospective, myth) | p10 | `tests/fixtures/*_golden_set.py`, `tests/test_{rundown,retrospective,myth_debunk}_archetype.py` |

Restore (from `../../../references/legacy-and-removed.md`): `git archive pre-skill-reduction engine console tui manifests few_shot_examples packages -o $env:TEMP\legacy.zip`, `Expand-Archive` into an **empty** directory, `pip`/`pnpm install` fresh (venvs and node_modules were never in the tag). Browse a single file with `git show pre-skill-reduction:engine/app/seed.py`. The `.kiro/specs/` build specs (v4..v14, the authoritative *why*) are **not** in the tag (gitignored); the archived copy is `H:\Projects\YTtechnews-archive-2026-11-01\kiro-specs\specs\<spec>\{requirements,design,tasks}.md` (see `legacy-and-removed.md`).

## 3. How an agent should use the engine now

- **Preferred:** run the stage methods (`stage-methods-and-schemas.md`) by hand with files as the state; use the toolkit (TTS, renderer) for audio/render.
- **If restoring:** the engine's model calls go through an `omp` agent CLI by default (`omp_orchestrator`, subprocess, no API keys) with per-stage x niche routing; only two stages (screen-generator, asset-research) may route to the agentic provider type. Treat the registered routing, not the README's model names, as truth. This predates the "agent is the LLM layer" rule: decide with the owner whether to keep it as a legacy app or retire it.
- Never mix: the two repo-wide invariants - nothing publishes without authorisation, nothing is deleted to force regeneration - override any convenience in the old app.

## 4. Where each in-app doc topic was absorbed

| `console/app/docs/content/` topic | Absorbed in |
|---|---|
| `niches.ts` - niches & strategy bundles; horror safety filter | `niche-model-and-strategy-bundles.md` s2-3; horror part -> sibling |
| `pipeline.ts` - board, tie-break, ideation queue, scripts (Gate 1), fact-check flags, history, notifications; production mode; editorial constraints | `stage-methods-and-schemas.md` s3-6, 9; `production-modes-and-gating.md` |
| `prompts-quality.ts` - prompts, golden set, tuning proposals, regression gate | `stage-methods-and-schemas.md` s11; `shorts-and-retention-tuning.md` |
| `sources.ts` - sources, manga uploads, horror clusters, fair-use & rights tiering | `define-a-new-niche.md` s5; `../../../references/creative-illustration-separation.md`; manga/horror -> siblings |
| `rendering.ts` - Render queue, NLE export, rendering modes, vertical recap, visual filters | `niche-model-and-strategy-bundles.md`; `shorts-and-retention-tuning.md` s2; CIS reference |
| `audio.ts` - voices (binding lives on the niche, not the profile; audio keyed on script x voice profile so A/B narrators are possible) | `niche-model-and-strategy-bundles.md` s8 |
| `config.ts` - tokens, model routing, channel settings (one standing description template), OMP orchestration | `production-modes-and-gating.md` s7 (routing collapsed to "second pass / vision"); description template in s3 |
| `system.ts` - analytics import, system health | `shorts-and-retention-tuning.md` s4; system health = tooling UI, not carried |

Screens of pure tooling UI (design-token editor, notification log, health meters, routing form) are intentionally not carried: no method content.

## 5. Contradictions found (written as the later/code source)

1. **Rendering mode default.** v5 says every seeded niche defaults to `legacy_scene`; README says the choice is made at the first project; `seed.py` sets `rendering_mode: "cis"` on all 11 niches; the p10 golden-set fixtures and several tests build `legacy_scene` projects. -> *Code wins: every seeded niche is cis; the legacy fixtures are older test scaffolding.* Few-shot examples still use the legacy scene shape (component + cues) as shape teachers.
2. **Step counts.** v5 / `rendering.ts` / `pipeline_step.py` header comment: 11 legacy, 15 CIS. Code tuples: 12 legacy (+`fact_correction`), 17 CIS (+`fact_correction`, +`asset_curation`). -> *Code tuples.*
3. **Shorts CTA wording.** Engine: "...in the comments and description"; news-explainer / LITMUS: "...in the description". -> *News-explainer for the LITMUS channel* (later live decision).
4. **Required API key.** README says `OPENCODE_ZEN_API_KEY` is required; seeded routing now defaults to `omp_orchestrator`. -> *Routing table in code.* Irrelevant once the agent is the LLM layer.
5. **Words per minute.** `WORDS_PER_MINUTE = 225` assumes tempo 1.5; the live tempo is 1.2; the older playbook says 175-190 wpm. -> unresolved owner decision, see `news-explainer/references/audio-tts.md`.
6. **Pattern-interrupt definition.** Master spec = a cadence beat; v5-REQ-8.4 refines it to a high-tech/low-brow whiplash beat; few-shot examples show blunt short lines or long analogies. -> *Both are valid forms of the v5 definition; the beat must flip register, not just be short.*
7. **Deadpan directive.** V5-REQ-8.6 asks for short deadpan fragments; the shipped `DEADPAN_FRAGMENT_DIRECTIVE` asks for *varied, conversational* rhythm and bans fragment chains. -> *Shipped text wins (the constant keeps its old name).*
8. **Bulk approve.** V4-REQ-2.4 requires disabling bulk-approve for `high`-sensitivity niches; later verification found no bulk-approve endpoint exists at all. -> requirement satisfied vacuously; re-verify if one is ever added.
9. **Sensitivity coverage.** Only 5 of 11 niches carry `real_entity_sensitivity_level`; cyber and infra stories also name companies. -> see gaps.
10. **Registered stages.** v4 says 5 LLM stages; README says 8 regression-gated stages; `config.ts` says 12 routing stages (adds panel-parser, content-safety, story-clustering, asset-research); `prompt_registry` has 10. -> *Config doc / code: 12 routing stages, 10 prompted stages.*
11. **`source_discovery_method` values.** v4 lists three; manga_recap seeds `user_provided_document`. -> free-text convention explicitly allowed.
12. **Hook counting.** `single_hook_only=False` trusts LLM markers, but the weekly-rundown constraint says the cold open is not a per-segment hook while the gold example marks scene 0 `is_hook=true`. -> harmless (floor >= 1); keep scene 0 as the cold-open hook and one hook per segment.

## 6. Gaps and open questions (for the owner / next agent)

1. **No seeded sources** for `ai-security`, `tech-myths-debunked`, `tech-retrospectives`, `weekly-tech-rundown` (P10 added niches without feeds) - the niches run on manual topic choice only. Decide discovery routines per niche.
2. **No niche rubric** for cyberattacks-zerodays, infra-failures, ai-ml-papers (only the relatable-contrast directive); their scoring uses the base 1-10 scale. Derived rubrics are suggested in the playbooks - owner to confirm.
3. **Editor ignores niche constraints** in code (`_EDITORIAL_CONSTRAINT_STAGES` excludes `editor`) - risk of the editor undoing niche structure.
4. **Few-shot facts unverified;** exemplar flaws listed in `niche-playbooks.md` s0 (meta-leak, relative dates, contested claims). Clean before reuse.
5. **No tuned scoring weights ever existed;** the tuner is validated only on a synthetic world. Real analytics never imported.
6. **Independent-source rule** (>= 1 corroborating source) is a recommendation, unmet in almost all productions.
7. **`llm_authored_animation`** never shipped (stub renders a dashed placeholder).
8. **Mascot, humour conventions, transition-type vocabulary** (OQ5-1..3) are still undecided creative choices; the mechanisms exist (asset category, `transitions.transition_type`).
9. **Tier F (fair use) legal review:** the pathway is "used rarely" by design; a one-time attorney consultation was recommended and never done. Treat as unresolved risk.
10. **Niche accent tokens / colour** for the six non-cyber niches were not documented; `resolveAccent` throws if a niche has none.
11. **Whether to retire the restored engine** in favour of hand-run packets (decision belongs to the owner).
12. Sibling subskills linked from here (`horror-story-videos`, `manga-recap`) and `../../../references/theme-catalog.md` are written by other agents; links assume they exist after assembly.
