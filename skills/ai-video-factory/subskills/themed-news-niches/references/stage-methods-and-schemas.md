# Stage methods and schemas (the LLM stages, performed by Claude)

The archived engine ran each LLM stage through a model API (OpenCode Zen, then the `omp` agent CLI, with a routing table per stage x niche). **This skill does not rebuild that.**
Claude is the LLM layer (`../../../references/agent-principles.md`): each stage below is a *method* - inputs, rubric, output schema, acceptance gate - that Claude performs itself, writing the output to a file,
or hands to a second reviewer as a packet. The v4 "external routing" idea (copy the assembled prompt out, paste the result back, validate it with the *same* schema check as an internal run - V4-REQ-3.6) is exactly the hand-off packet pattern.

Contents: 1 Step chains - 2 Packet pattern - 3 Scorer - 4 Scriptwriter - 5 Editor - 6 Fact-check and correction - 7 Cue validation (legacy) - 8 CIS stages - 9 Gates - 10 Few-shot corpus method and tests - 11 Regression discipline when a prompt or niche brief changes

## 1. Step chains (code: `models/pipeline_step.py`)

- `legacy_scene` (12): ingestion_match, scoring, scriptwriting, editor_critique, fact_check, fact_correction, cue_validation, tts, alignment, subtitle_export, render, metadata.
- `cis` (17): ingestion_match, scoring, scriptwriting, editor_critique, fact_check, fact_correction, **asset_curation**, tts, **screen_generation**, alignment, subtitle_export, **screen_timestamp_insertion**, screen_validation, transition_authoring, transition_validation, render, metadata. `cue_validation` is dropped.
- Conflict: v5 prose and the in-app Rendering doc say 11 / 15 steps. `fact_correction` (a post-review stage that applies only source-supported narration fixes and verifies its own revision) and `asset_curation` (v6) were added later; the code tuples above are authoritative.
- CIS dependency graph: `tts` and `screen_generation` both depend only on the approved script (fan-out after fact stages / Gate 1); `screen_timestamp_insertion` depends on **both** `subtitle_export` and `screen_generation` (fan-in). Eligibility = "every named predecessor completed" (not step order).
- Pause rule at fork/join: decide first, then clear flags (so a pause on the shared predecessor holds *both* fork members, and a fan-in step does not re-pause after resume - V5-INV-11/12).
- Gates: **Gate 1** script approval (draft|edited -> approved|rejected; reopened if a revert touches the script), **Gate 2** render approval (valid only from `done`). Idea selection is a third always-human gate (v6). Method detail: `production-modes-and-gating.md`.

## 2. Packet pattern (how Claude runs a stage)

For each stage write `stage-<n>-<name>.in.md` (assembled prompt = base method + niche brief blocks of `niche-model-and-strategy-bundles.md` section 5 + the inputs) and `stage-<n>-<name>.out.json` (strict JSON, schema below).
Validate the JSON against the schema before it advances (reject extra keys, missing fields, wrong types - the same "name the offending field" rule the engine's validator used). Keep every version (`v1`, `critique`, `v2`, `fact-check`) - the version chain is append-only; the editor never overwrites v1.
Never put chain-of-thought into outputs: think privately, emit strict JSON only.

## 3. Scorer (skipped for `scoring_rubric: null` niches)

- **Input:** title, source text, niche key, niche rubric (+ tuned weights block if present).
- **Scale:** 1-3 irrelevant/stale/too thin - 4-6 on-topic but unremarkable (minor update, duplicate ground, no angle) - 7-8 solid, timely, substantive, enough for a full deep-dive - 9-10 exceptional.
- **Output:** `{"score": <int 1-10>, "rationale": "<1-2 sentences plain prose>"}` and nothing else.
- **Two independent runs** per item (run 2 must not see run 1). Agreement = `|s1 - s2| <= 1`. Selection needs agreement **and** mean >= 6. Disagreement -> tie-break: a human picks run 1, run 2, or writes a manual score + rationale (default = mean). Never silently re-score an item that already has a row.
- **Ideation gate (v6, both modes):** even with agreement and mean >= 6, *a human selects* the idea before scriptwriting; unselected candidates stay in the queue (no expiry, no auto-reject). Rank by mean score, filter by niche; show score and rationale together.
- Cross-niche dedup first: exact `dedup_hash` + fuzzy title match scoped across all niches -> `new | duplicate | cross_niche_duplicate`; only `new` items become projects.

## 4. Scriptwriter

- **Parameters (computed, not guessed):** target runtime by source length (240 / 420 / 600 s; cyber niches >= 360 s; Shorts 55 s); total word budget = runtime/60 x 225 x 0.9; pattern-interrupt cadence from the archetype; component name from the niche.
- **Non-negotiables (every niche, override everything):** cyber guardrail (no functional exploit code, PoC payloads, weaponisation steps); no fabrication (no invented quote/stat/attribution); every claim traceable to the provided citation(s). If the source does not support a claim, omit it; a thin story yields a shorter script - never pad.
- **Structure rules:** scene 0 is the hook (enforced); per-scene `word_budget` realistic for `duration_ms` at ~2.5 words/s; interrupt scenes at roughly the archetype cadence = the high-tech/low-brow whiplash beat; in cis mode leave `component` as `""` and `cues` as `{0,0}` (RD-85: nothing downstream of the script reads them).
- **Reveal-budget rule (v4 prompt):** `cues.typing_chars` must cover the scene's own narration with margin (an upper ceiling alone let tight values cut off text, including the verdict clause); keep split-budget components' two halves roughly balanced. If a repair is needed, **shorten the narration** - raising `duration_ms` is a placebo because the real duration comes from TTS alignment, not the authored estimate.
- **Output schema (legacy; cis keeps the same Pydantic shape with defaults):**

```json
{"scenes": [{"index": 0, "is_hook": true, "is_pattern_interrupt": false, "component": "cyber-terminal",
  "narration": "...", "word_budget": 22, "duration_ms": 8800, "cues": {"typing_chars": 133, "node_count": 0}}]}
```
  Extra optional keys exist for side niches (`panel_id`, `scene_energy`, `provisional_timestamp_ms`; null for news). Narration beats are normalised for `visual_policy = representative-news` CIS projects (target 26 words, max 34, beat duration clamped 3-12 s).
- **Shorts variant:** see `shorts-and-retention-tuning.md`.
- **Style directives** assembled at call time: conversational delivery; beginner-friendly explanation (explain an acronym/mechanism at first use with one concrete example or accurate analogy, then return to the precise term); never remove the mechanism "to simplify".

## 5. Editor

- Critique the v1 draft on four dimensions: **hook strength, pacing, unexplained jargon, dead stretches** (name the scene). Output `{"critique": {"hook_strength","pacing","jargon","dead_stretches"}, "revised_scenes": [...]}`.
- Smallest set of changes: preserve every scene, claim and citation that works; do not regenerate; do not touch unflagged scenes; no new claims. Renumber `index` only if a scene is added/removed. The revision becomes v2; v1 stays in the chain.
- Tone note (V5-REQ-8.5): personified narrative flourish is voice, not a claim to ground.
- Because the editor receives no niche constraint in code, **re-apply the niche brief yourself** (chapter-cards, then-vs-now, verdict-last) before accepting v2.

## 6. Fact-check and correction

- **Input:** the v2 script + the source citation(s) (for side niches the ground truth differs - panels for manga). **Output:** a JSON array `[{"scene": int, "claim": str, "traceable": bool, "source": "<citation URL verbatim>|null", "note": "required when traceable is false"}]`. It does **not** modify the script.
- Untraceable claims are flagged for the human at Gate 1 - never deleted or silently altered; a blocking flag must be resolved before audio. The separate `fact_correction` step applies only source-supported narration fixes (only when flags exist) and re-verifies its own revision.
- Niche modifiers: `high` sensitivity -> individual sign-off; myth-debunking -> restated-claim scenes are traceable if they accurately reflect a real sourced statement of the claim (full scrutiny on mechanism + verdict); retractions -> every allegation must trace to the notice/report; retrospectives -> every dated beat needs its own source.
- Manual-mode scripts must have a fact-check run against the **exact** scene content being approved (content hash recorded at discussion; an edit after discussion invalidates it - V6-REQ-4.5).

## 7. Cue validation (legacy_scene only)

Deterministic checks are a strict superset of the LLM's and win on disagreement. Per scene: `typing_chars <= max_typing_speed_cps x duration_ms/1000` (skip when cps = 0); `node_count <= max_nodes` (skip when 0); `min_scene_ms <= duration_ms <= max_scene_ms`;
reveal floor (flat components: `typing_chars >= len(narration)`), infeasibility (narration too long to reveal at any legal duration -> only shortening narration fixes it), imbalance (split-budget components `verdict-card`, `claim-evidence-compare`), and short-duration checks.
Output `{"valid": true|false, "violations": [{"scene","field","detail":"exact numbers required vs allowed"}]}`. Repair is routed back to the scriptwriter with a "fix only these violations" prompt; max 2 attempts total; keep a repair only if it strictly reduces deterministic violations; a script that never becomes valid still proceeds to Gate 1 with the violation visible.
Real-pace check the engine's validator missed (found by the corpus sweep): authored `duration_ms` is discarded at render time, so also require `words/2.5 x 1000 <= max_scene_ms`.

## 8. CIS stages (summary - full method in `../../../references/creative-illustration-separation.md`)

- **screen-generator:** one entry per beat `{"beat_index","screen_type_key","content":{...manifest fields...},"needs_third_party_asset":bool,"third_party_candidate": null | {"description","franchise_or_rightsholder","subject_match_passed"}}`. Third-party candidates only when the narration is genuinely *about* that specific work (when in doubt `false`); never propose copy for a `human_only` screen type.
- **screen-validator** (`llm_authored_animation` only; never shipped in practice) and **transition-validator** (`{"valid", "violations":[{"transition_id","field","detail"}]}` plus a repair shape `{"transition_type","from_element","to_element"}` where an element name must exist in that screen type's declared `elements` or be `null` for a whole-screen transition). Max 2 attempts each.
- Horror-only stages `content-safety` (`{"passed","reasoning","flagged_categories":[hate_speech|real_person_targeting|fiction_crossing_into_genuine_harm]}`) and `story-clustering` (`{"clusters":[{"theme_label","member_raw_item_ids":[...]}]}`, every id in exactly one cluster) - see the horror subskill.

## 9. Gates (what "passed" means for a niche script)

1. Claim ledger complete; every material claim, number, date, quote has a URL; sensitivity `high` -> individual sign-off (no bulk approve).
2. Fact-check report has no unresolved untraceable claim; recheck volatile facts (status, prices, legal status) right before audio.
3. Niche brief honoured (checklist from the niche's playbook section: e.g. verdict-last, then-vs-now, cold-open+chapter-cards, demonstrated-vs-theoretical).
4. Scene arithmetic passes (section 7 + corpus tests section 10) - for cis, screens validated.
5. Gate 1 human approval -> audio -> render -> objective QA (`../../news-explainer/references/qa-release.md`) -> Gate 2 human approval of the *final rendered MP4s*.

## 10. Few-shot corpus method and tests

A niche's gold set = 2-3 examples (renderer shows at most 3; fewer than 2 fails P3-REQ-9.3), each `{"source_summary": str, "scenes": [Scene...]}` using the scene schema in section 4. File name `<niche_key>-v1.json`; bump to `-v2` for a revision, never edit history.
Write examples so the **shape** transfers (hook framing, interrupt placement, how technical detail is introduced), with facts clearly illustrative; never include self-referential meta text.
Permanent tests the engine ran over every file (`tests/test_few_shot_examples.py`) - run the equivalent by hand or script before adding a set:

| Test | Rule |
|---|---|
| schema | validates against the Scene schema; >= 2 examples; no example with zero scenes |
| indices | contiguous from 0 per example |
| word_budget | `word_budget == len(narration.split())` |
| duration bounds | `min_scene_ms <= duration_ms <= max_scene_ms` of the scene's component |
| typing ceiling | `typing_chars <= cps x duration_ms/1000` (cps > 0) |
| node count | `node_count <= max_nodes` (max_nodes > 0) |
| reveal budget | floor / infeasible / imbalanced checks (cps > 0 components) |
| real spoken length | `words / 2.5 x 1000 <= max_scene_ms` |
| natural pace | words per authored second within 2.0-3.2 |

## 11. Regression discipline when a prompt or niche brief changes

Engine: every one of the eight gated stages (scorer, scriptwriter, editor, fact-checker, cue-validator, screen-generator, screen-validator, transition-validator) required a *complete, human-acknowledged regression run* over >= 1 applicable golden pair before a new prompt version could be activated;
the run re-executes the candidate prompt over each golden pair and diffs against the active version's output; staleness (baseline, coverage or pair content changed) invalidates it; a pair with the wrong mode for a stage is not applicable (a legacy pair never validates a CIS stage). Target 5-10 hand-approved golden pairs per channel, built *before* running regressions.
Method equivalent: keep `golden/<niche>/` with approved scripts; before changing a niche brief or stage method, re-run the stage on those inputs, diff against the approved outputs, and have the owner acknowledge the diff before the new version becomes the default. Record a version per brief. Never overwrite a prior version.
Consult for the exact rules: `engine/tests/test_p9_golden_set_regression.py`, `engine/app/synthesis/golden_set_regression.py`, `engine/app/api/prompt_registry.py`, `engine/tests/fixtures/{rundown,retrospective,myth_debunk}_golden_set.py`.
