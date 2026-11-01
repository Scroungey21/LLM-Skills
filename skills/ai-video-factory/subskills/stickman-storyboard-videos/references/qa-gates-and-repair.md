# QA gates, thresholds, repair and definition of done

Contents: 1 Principles · 2 Gate table (what, thresholds, source) · 3 Storyboard and continuity gates · 4 Rendered-output QA procedure · 5 Localised repair map · 6 Escalation · 7 Verification discipline · 8 Definition of done · 9 Numbers in one place

Sources: Report §27-§28, Blueprints 14, 17; Handoff §Gates. Shared catalogue of gates across channels: [qa-gates](../../../references/qa-gates.md) (read §3-§7, §13-§14 for the generic versions). Gate vocabulary: `PASS | PASS_WITH_WARNINGS | REVISE | FAIL` ([project-state-and-resume §3](project-state-and-resume.md)).

## 1. Principles

- **No stage silently ignores a failed gate** (Handoff §Definition of done). **Gates are not stretched**: a failure means reject, repair, regenerate - never lower the threshold, edit provenance or time-stretch ([SKILL standing rule 4](../../../SKILL.md)). The same reviewer may not lower thresholds on a later attempt (Report §22.7).
- **QA the rendered output, not only JSON**: sample frames, detect long frozen runs, overflow/collisions, missing assets, bad crops, audio clipping/silence, and semantic mismatch with narration (Handoff §Agent instructions 9).
- **Independent verification** where the producer's judgment is not enough (facts, continuity, visuals): the verifier gets artifact + spec, not the producer's reasoning ([pipeline-and-agent-roles §6](pipeline-and-agent-roles.md)). A verifier never edits the production artifact (Blueprint 14).
- **Human approval stays final** before publication (Report §27.9). A tool session cannot watch/listen; report human viewing/listening as pending.

## 2. Gate table (Handoff §Gates 1-8, Report §27)

| # | Gate | PASS when | REVISE / FAIL |
|---|---|---|---|
| 1 | **Idea / packaging** (§27.1; Handoff 1: 3+ viable title/thumbnail pairs before full research) | fits mode; curiosity gap intelligible; evidence probe viable; catalog duplication acceptable; visual/story potential acceptable; title premise qualifiable truthfully | REVISE: narrow the angle. FAIL: premise false/empty or evidence too thin |
| 2 | **Evidence** (§27.2) | central claims sourced; causal scope verified; conflicts/unknowns recorded; key numbers/dates have provenance; title qualification supportable | hard FAIL if the central mechanism is unsupported |
| 3 | **Script** (§27.3; checklist in [format §11](format-and-script-grammar.md)) | all checks incl. unsupported facts = 0, claim-linked, counterexample checked, title qualified, no dangling loop | <=3 style revisions then human; factual -> evidence rollback |
| 4 | **Storyboard** (§27.4) | machine + semantic checks below | REVISE locally; ambiguous entity -> `BLOCKED` |
| 5 | **Continuity** (§27.5) | simulation: 0 hard errors (`quality_contract` can allow N warnings) | patch locally + re-simulate |
| 6 | **Asset** (§27.6; [characters §8](characters-assets-continuity.md)) | hashes, representation, style, tags, morphology, identity similarity, provenance, no embedded text | localised asset retry (<=3), then `BLOCKED` |
| 7 | **Audio** (§27.7; [animation-audio-edit §4](animation-audio-edit.md)) | semantic match, no missing/repeated lines, pronunciation reviewed, alignment confident, no clipping, intelligible under bed, clean ends | regenerate affected line only |
| 8 | **Title/thumbnail** (§27.8; [idea-research-packaging §7](idea-research-packaging.md)) | complementary, one proposition, legible small, not deceptive, unique in own catalog | packaging branch only |
| 9 | **Final video** (§27.9) | automated list + visual-semantic verifier below | repair the owning stage, re-run descendants |

## 3. Storyboard and continuity gates (Report §27.4-27.5)

**Machine checks**: JSON-schema valid; every beat covered exactly once or explicitly audio-only/hold; durations monotonic/non-overlapping as required; all entity ids resolve; all location ids resolve; all asset dependencies declared; all fact-sensitive visuals link to claim ids; all generation methods allowed; all required return stacks resolve. Add the rules the schema cannot express ([storyboard-schema §8](storyboard-schema.md)).
**Semantic checks** (Claude reviewer/verifier): visuals *explain* rather than decorate; real scenarios persist long enough to show cause/effect; no unnecessary scene reset (a `NEW_SCENARIO` that discards unresolved state must justify it); abstraction inserts return coherently; camera/framing keeps required actors/objects readable; scene variety; no generic filler or stock-B-roll logic (Handoff §Script policy: abstract text with no visualisation is rewritten).
**Continuity hard errors**: prop ownership conflict · attachment to missing/invisible entity (unless intended) · teleport without move/transition · unannounced identity change · location mismatch · facing/orientation contradiction breaking the action · insert return not restoring required state · callback to invalidated/missing asset state. Output a `continuity_gate.json` with rule id + JSON path + evidence + minimal repair; never repair silently.
**Factual-visual consistency** (§21.14): flag a diagram implying stronger causality than the source; a number without date/unit/denominator where needed; a metaphor mistakable for a mechanism; animal anatomy/action materially misleading; a historical scene presenting invented detail as fact; named research attribution not matching the ledger.

## 4. Rendered-output QA procedure (Blueprint 14; Report §27.9)

1. **Technical** (automated): exact duration, codec/container policy, no black/blank accidental frames, no missing assets/placeholders, no out-of-bounds text, audio present/within limits, subtitle timing valid, every storyboard shot has a rendered artifact, no stale artifact hash, final render matches the approved script/storyboard/packaging versions.
2. **Sample** every shot at entry, at key events and at exit; compare expected entities/state vs the image; compare fact-sensitive visuals with their claims; test readability at normal and mobile/thumbnail-like scale; detect continuity mismatch across adjacent samples (contact sheets: [rendering §9](../../../references/rendering.md), [qa-gates §7](../../../references/qa-gates.md) three-view inspection of every drawn asset: full-res, contact sheet, in-composition).
3. **Visual-semantic verifier** (Claude subagent looking at frames): narration/visual meaning aligned; transitions not jarring; no continuity regressions; no factual misrepresentation; no obvious generated-asset defects; no persistent clutter.
4. Return the **smallest repair scope** (shot ids + owning upstream component); rerun only affected descendants.

## 5. Localised repair map (Report §28.3)

| Failure | Minimum repair |
|---|---|
| wrong prop in one shot | patch shot state / asset reference, re-render that shot |
| generated animal limb/hoof defect | inpaint/replace the animal asset, re-render dependent shots |
| one mispronounced name | regenerate that TTS phrase/line, realign the affected window |
| statistic typo overlay | regenerate the deterministic overlay only |
| continuity handoff error | patch attachment events, re-render the affected interval |
| a source invalidates one claim | revise dependent beats/storyboard/renders; preserve unrelated sections |
| weak thumbnail | packaging branch only |
Retry budgets and error classes: [project-state-and-resume §7](project-state-and-resume.md). A retry must change something causally relevant.

## 6. Escalate to the human when (Report §28.4)

Central evidence stays contradictory/insufficient · 3 bounded revisions repeat the same structural issue · an identity-critical generated asset cannot pass consistency · a visual metaphor risks factual deception · the fact verifier and scriptwriter materially disagree · publish/rights status is uncertain. Provide a diff and the recurring-failure summary.

## 7. Verification discipline borrowed from the owner's other channels

The owner's HES bar is **triple verification**: automated gates (and prove they bite on a deliberately broken input), every proof still reviewed, post-render frame-sequence check ([everyday-systems editorial-and-quality](../../everyday-systems-explainer/references/editorial-and-quality.md)). Apply the same: deliberately inject a teleporting prop, a dangling loop, an unqualified absolute title and confirm each gate fails (Blueprint 17 item 8). Report what passed, what was rejected, and what is unverified ([agent-principles §8](../../../references/agent-principles.md)).

## 8. Definition of done (Blueprint 17) - do not call the mode production-ready until all hold

1. Existing modes/channels pass regression unchanged. 2. Both schemas validate representative fixtures. 3. A project can crash/resume without losing approved work. 4. The evidence packet prevents unsupported central claims reaching script approval. 5. The script gate is integrated and inspected (not an unseen tool). 6. The validation script parses to beats deterministically enough for regression fixtures. 7. The storyboard preserves location/entity/prop state across camera cuts and inserts. 8. The continuity simulator catches deliberately injected teleport/handoff/identity failures. 9. The vector renderer produces the pigeon validation end-to-end **without ComfyUI**. 10. (If adopted) ComfyUI generates/repairs one asset reproducibly with workflow/seed/version provenance. 11. One failed asset or shot regenerates only dependents. 12. Narration alignment retimes visual events without rebuilding storyboard logic. 13. Technical + semantic QA identifies shot-specific defects. 14. The packaging branch yields several accurate original concepts independent of the video render. 15. Final human approval is still required before publishing. 16. If reference measurements are ever collected, they replace the unmeasured fields with audited distributions, not assumptions.
Items 9-12 and 14 describe components that **do not exist yet**; the list is the acceptance test for building them.

## 9. Numbers in one place (all PROPOSED defaults unless marked)

| Item | Value | Source / status |
|---|---|---|
| Hook content window | first 20-35 spoken seconds | Report §6.1, derived from one observed opening |
| Section filler limit | fail if >25% of words are filler | Report §6.4, proposed |
| Curiosity rubric pass | >= 0.75 | Report §17.5 (rubric) / suggested cutoff |
| Idea score weights | .18 .17 .13 .13 .12 .11 .08 .05 .02 .01 | Report §17.4, proposed |
| Evidence probe | >=1 primary lead; 2 independent sources for synthesis; >=3 distinct beats | Report §17.6 |
| Qualification deadline (example) | 75 s | Report §6.7 example |
| Reuse similarity threshold (example) | 0.86 | Report §25.4 example |
| Retry budgets | research 3, script 3, storyboard repair 3, comfy 3, render segment 2, tts line 2, thumbnail batch 2 | Report §28.2 |
| `generation_policy.max_attempts` | 0-8 | schema |
| Pose interpolation | 2-6 eased frames | Report §12.2 |
| Mix | true peak <= -1 dBTP; duck 12-18 dB | Report §13.5, defaults; toolkit house chain -16 LUFS, -1.5 dBTP |
| Canvas | 1920x1080 @ 30 fps master | Report §9.3 / toolkit |
| Validation video | 30-60 s (example 45 s) | Report §29 |
| Reference sample size before locking a style | >= 3-5 videos | Handoff §Reference-analysis; see policy for whether to do it at all |
