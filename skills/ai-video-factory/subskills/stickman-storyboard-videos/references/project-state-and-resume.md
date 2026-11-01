# Project state, state machine, invalidation and resume

Contents: 1 What the state file is · 2 Schema field by field · 3 Stage and gate vocabulary · 4 State machine (stage + lifecycle) · 5 Artifact DAG and invalidation · 6 Resume algorithm · 7 Errors and retries · 8 Provenance and manifests · 9 Gaps / PROPOSED

Source: [schemas/video_project_state.schema.json](schemas/video_project_state.schema.json) - byte-exact copy of `git show pre-skill-reduction:Stickman/video_project_state.schema.json`
(Draft 2020-12, `schema_version` const `1.0.0`). Example that passes it: [schemas/example-project-state.json](schemas/example-project-state.json).
The state file is the **resumability contract**: every expensive or editorially meaningful stage persists here, artifacts are content-hashed, and a change invalidates only its descendants (Report §23.3, §26.4-26.5, Blueprint 1).
Universal resume rules for all channels: [workflow.md](../../../references/workflow.md) ("Resumability and state").

## 1. What the state file is

One `state.json` per video (`projects/<video_id>/state.json`, Report §26.2). Claude (or any script) reads it at start, validates artifact files against recorded hashes, and decides which stages are `READY`.
It does **not** hold content - paths and hashes only. Human decisions go in `approvals`, failures in `errors`. Mirrors in a DB are optional (Report §26.3 lists the entities: `videos, stage_runs, artifacts, artifact_dependencies, gate_results, sources, claims, entities, asset_registry, asset_derivations, comfy_jobs, render_jobs, approvals, analytics_features, errors`); for a first channel plain JSON files + the hash check are enough.

## 2. Schema field by field (`additionalProperties: false` everywhere)

**Top level - required:** `schema_version` (const `"1.0.0"`), `video_id`, `mode`, `created_at`, `updated_at` (both `date-time`), `lifecycle_status`, `stages`, `artifacts`, `approvals`, `errors`, `dependency_graph`. Optional `analytics` (open object, default `{}`).
- `mode` enum `tpdossier_explainer` | `shorts_factory` | `other`. The only fitting value for this format is **`tpdossier_explainer`** (a name inherited from the studied channel; keep it for byte-compatibility, or fork the schema to rename). The content *profile* (`CURIOSITY_EXPLAINER`/`POV_PROGRESSION`) has **no field** - store it in an artifact's `metadata.profile` (as the example does).
- `lifecycle_status` enum `IDEA`,`RESEARCHING`,`SCRIPTING`,`STORYBOARDING`,`ASSET_BUILD`,`RENDERING`,`REVIEW`,`APPROVED`,`SCHEDULED`,`PUBLISHED`,`FAILED`,`PAUSED`. The schema lists values but **no transitions** (see §4).
- `stages`: map of stage-name -> `stage`. Names are free strings (PROPOSED set in §4).
- `artifacts`: map of `artifact_id` -> `artifact`. `dependency_graph`: map of string -> string[] (see §5 on direction).

**`stage`** - required `status`, `attempts`, `input_hash`, `output_artifact_ids`; optional `started_at`, `finished_at` (`date-time`\|null), `checkpoint` (string\|null).
- `status` enum `NOT_STARTED`,`READY`,`RUNNING`,`PASS`,`PASS_WITH_WARNINGS`,`REVISE`,`FAIL`,`BLOCKED`,`INVALIDATED`.
- `attempts` integer >=0 (increment on every run; the retry budget in §7 compares against it). `input_hash` string\|null = hash over the stage's input artifacts' `content_hash`es + config; `null` before first run.
- `checkpoint` names the editorial milestone reached (Report §23.3): `IDEA_APPROVED`, `EVIDENCE_VERIFIED`, `SCRIPT_APPROVED`, `STORYBOARD_VALIDATED`, `ASSETS_APPROVED`, `ANIMATIC_APPROVED`, `AUDIO_LOCKED`, `VIDEO_QA_PASS`, `PACKAGING_APPROVED`, `FINAL_APPROVED`.

**`artifact`** - required `artifact_id`, `kind`, `path`, `content_hash`, `producer`, `producer_version`, `input_hashes` (string[]), `status`; optional `provenance_id` (string\|null), `metadata` (open object).
- `status` enum `PLANNED`,`VALID`,`INVALID`,`MISSING`,`SUPERSEDED`. `producer` = tool or agent role (e.g. `claude-agent`, `claude-verifier-subagent`, `remotion-render`); `producer_version` a version string or prompt/rubric version.
- `input_hashes` are *content hashes* of upstream artifacts (not ids) - the staleness test is "do my recorded `input_hashes` equal my upstream artifacts' current `content_hash`es?".

**`approvals[]`** - required `gate`, `status` (`PASS`,`PASS_WITH_WARNINGS`,`REVISE`,`FAIL`), `timestamp`; optional `reviewer` (string\|null: agent role or human name), `reasons[]`, `repair_actions[]`. Append-only; the latest record per gate is current. Human approvals use the same record with a human `reviewer`.
**`errors[]`** - required `error_id`, `stage`, `code`, `message`, `retryable` (bool), `timestamp`; optional `affected_artifact_ids[]`, `attempt` (integer >=1). Codes should be the §7 classes.

## 3. Status vocabulary (Report §25.1)

Gates everywhere use exactly `PASS | PASS_WITH_WARNINGS | REVISE | FAIL`. Stage state may additionally be `NOT_STARTED | READY | RUNNING | BLOCKED | INVALIDATED`.
A full gate-result record (not in either schema; keep as `qa/<gate>.json` and reference it from `approvals`): `gate_id`, `gate_version`, `artifact_id`, `artifact_hash`, `status`, `score`, `blocking[]`, `warnings[] {rule_id, path, message}`, `recommended_actions[]`, `reviewer {type: agent|human, id}`, `timestamp`.
Meaning: `PASS` proceed; `PASS_WITH_WARNINGS` proceed (warnings recorded; the storyboard `quality_contract.required_gate_status` can demand strict `PASS`); `REVISE` bounded producer revision with rule-specific feedback; `FAIL` no automatic retry - roll back (factual) or escalate.

## 4. State machine

### 4.1 Stage level (the schema gives only the enum; transitions are INFERRED from Report §23, §26.5, §28 - PROPOSED)
```
NOT_STARTED --upstream all PASS/PASS_WITH_WARNINGS--> READY --start--> RUNNING (attempts+1)
RUNNING --gate--> PASS | PASS_WITH_WARNINGS | REVISE | FAIL
REVISE  --producer revises with gate feedback, attempts < budget--> RUNNING        (never lower the threshold)
REVISE  --budget exhausted or same issue 3x--> FAIL -> human escalation
FAIL    --retryable error--> READY (after a causally relevant change)   |  --factual/evidence--> upstream stage INVALIDATED (research rollback)
any     --input_hash mismatch / output artifact MISSING or INVALID--> INVALIDATED --upstream OK--> READY
READY/RUNNING --upstream not passed or ambiguous entity / asset exhausted--> BLOCKED --cause removed--> READY
```
Rules: a downstream stage may not become `READY` while any upstream is not `PASS*`; "stage jumps" are refused (Report §24.1); a failed gate is never silently ignored (Handoff §Definition of done).

### 4.2 PROPOSED stage names (one entry per checkpoint-worthy step)
`idea`, `evidence`, `script`, `beats`, `storyboard` (incl. continuity gate), `asset_plan`, `assets`, `animatic`, `narration`, `alignment` (retimes events), `render` (segments), `audio_mix`, `video_qa`, `packaging`, `final_approval`, `publish`.
Dependencies: `idea -> evidence -> script -> beats -> storyboard -> asset_plan -> assets -> animatic`; `script -> narration -> alignment`; `{storyboard, assets, alignment} -> render -> audio_mix -> video_qa`; `{script, evidence, storyboard} -> packaging`; `{video_qa, packaging} -> final_approval -> publish`.
Note narration depends on the **approved script**, not the storyboard; the storyboard is retimed after alignment ([pipeline-and-agent-roles §4](pipeline-and-agent-roles.md)).

### 4.3 Lifecycle level (`lifecycle_status`) - derived (PROPOSED)
Compute it from stages, do not set it by hand: `IDEA` while `idea` not passed -> `RESEARCHING` (`evidence`) -> `SCRIPTING` (`script`,`beats`) -> `STORYBOARDING` (`storyboard`) -> `ASSET_BUILD` (`asset_plan`,`assets`) ->
`RENDERING` (`animatic`..`video_qa`) -> `REVIEW` (`packaging`,`final_approval` pending) -> `APPROVED` (`FINAL_APPROVED` checkpoint, human record present) -> `SCHEDULED` -> `PUBLISHED`.
Backward moves are legitimate only for rollbacks (`SCRIPTING -> RESEARCHING` on evidence failure; `REVIEW -> <stage named by the human rejection>`, Report §28.1 `HUMAN_REJECTION`). `FAILED` = a stage failed with no retry path (needs the owner); `PAUSED` = deliberately parked (owner request, shared-GPU wait). `SCHEDULED`/`PUBLISHED` are set only after the owner has uploaded/scheduled - **never infer them**; the ledger is not proof anything is live ([workflow.md](../../../references/workflow.md)).

## 5. Artifact DAG and invalidation (Report §26.4, Blueprint 1)

`dependency_graph` is `{artifact_id: [artifact_id, ...]}` and the schema description says "A changed upstream content hash invalidates only reachable downstream artifacts". **Edge direction is ambiguous** (key could be the dependency or the dependent). PROPOSED and used in the example: **key = upstream artifact, value = its direct downstream artifacts**. Write this into the project's `storyboard_policy.yaml` so nobody inverts it.
Invalidation algorithm:
1. Recompute each artifact's `content_hash`; compare with the `input_hashes` recorded by each dependent. 2. Mark the changed artifact's dependents (transitively) `INVALIDATED` at stage level and `SUPERSEDED`/`INVALID` at artifact level. 3. **Never** invalidate an unrelated global asset because one video changed. 4. Granularity: a changed script hash invalidates only storyboard sections whose beat hashes changed, only their asset requirements, only affected render segments; narration/audio retimed as needed; thumbnail concepts survive if the premise is semantically equivalent (Report §26.4). 5. Never "delete the output folder".
Worked example (see the example file): script v2 supersedes v1 -> `script_beats` (built from v1) is `SUPERSEDED`, stage `beats` is `INVALIDATED`, `storyboard` is `BLOCKED`.

## 6. Resume algorithm (Report §26.5)

1. Load `state.json` (+ DB rows if any). 2. For every artifact: file exists? hash equals `content_hash`? else mark `MISSING`/`INVALID` and its stage `INVALIDATED`. 3. Re-run the staleness test of §5 for all artifacts. 4. Topologically compute the earliest `READY` stages (all upstream `PASS*`). 5. Resume only those; run independent branches in any order but respect the GPU rule (one heavy GPU job at a time: [environment-setup](../../../references/environment-setup.md), [agent-principles §10](../../../references/agent-principles.md)). 6. Keep successful independent branches cached. 7. Corrupt/unreadable state -> `BLOCKED`, **never** a destructive reset (Blueprint 1); back up first ([agent-principles §7](../../../references/agent-principles.md)).
Tests worth having before trusting it (Blueprint 1/17): DAG cycle detection, stale-artifact detection, selective invalidation, resume after a simulated crash, "one failed asset/shot regenerates only dependents".

## 7. Errors and retries (Report §28)

| Class | Handling |
|---|---|
| `DETERMINISTIC_INPUT_ERROR` | fix input/schema; **no blind retry** (never retry an unchanged deterministic command after a validation failure) |
| `SOURCE_RETRIEVAL_TRANSIENT` | exponential retry; alternate source if allowed |
| `EVIDENCE_INSUFFICIENT` | research rollback; do not rewrite prose around it |
| `LLM_STRUCTURE_FAILURE` | bounded revision with rule-specific feedback |
| `CONTINUITY_FAILURE` | local storyboard patch + re-simulate |
| `ASSET_GENERATION_FAILURE` | localized asset retry/repair |
| `RENDER_FAILURE` | re-render affected shot/segment (deterministic render failure -> fix input/renderer, no random retry) |
| `AUDIO_FAILURE` | regenerate the affected line/clip only |
| `PACKAGING_FAILURE` | regenerate concepts only |
| `HUMAN_REJECTION` | route to the upstream stage the human names |

Retry budgets (Report §28.2, engineering defaults): `research_fetch 3`, `script_revision 3`, `storyboard_local_repair 3`, `comfy_asset 3`, `render_segment 2`, `tts_line 2`, `thumbnail_candidate_batch 2`. **Each retry must change something causally relevant**; the same reviewer may not lower a threshold on a later attempt (§22.7). Seed rotation is the last resort for generated assets (§20.7). After the budget: `BLOCKED` + human.

## 8. Provenance and manifests (Report §25.5, §26.6)

- Every externally sourced fact/media: source URL/id, retrieval date, licence/usage, content hash if downloaded, derived-from link, tool/workflow version. Generated assets: model/workflow/seed/reference hashes; vector assets: generator version + parents.
- `provenance_id` on artifacts/assets points at such a record.
- Render manifest per segment (reproducibility): `render_id`, `shot_ids[]`, `storyboard_hash`, `asset_hashes[]`, `audio_hash`, `renderer_version`, `ffmpeg_version`, `style_profile_hash`, `output`, `output_hash`.

## 9. Gaps (PROPOSED fills; fork + bump version if made structural)

No transition table, no profile field, no gate-result schema, no stage-name vocabulary, ambiguous graph direction, no lock/owner field (add a `RUNNING` lock file with PID/timestamp so two agents never run the same stage), no per-stage `error_ids` link. `mode` naming is channel-specific. Keep these decisions in `storyboard_policy.yaml` beside the schemas.
