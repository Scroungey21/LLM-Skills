# Pipeline, file contracts and Claude's roles

Contents: 1 The DAG · 2 Stage table (inputs, outputs, who produces, gate) · 3 Per-video folder and beat file · 4 Storyboard authoring method · 5 Why storyboard precedes TTS but retimes after · 6 Roles and hand-off packets · 7 Prompts as method · 8 Existing-pipeline audit (KEEP/MODIFY/BYPASS/ADD) · 9 Build order and the `vf` CLI (design-only)

Sources: Report §21-26, §30, §32, Appendices D-E, Blueprints 1-14; Handoff §Required architecture / §Implementation order.

## 1. The DAG (Report §23.1; Handoff architecture)

```
IDEA SIGNALS -> normalize/cluster/dedupe -> IDEA SCORE + evidence probe -> RESEARCH/EVIDENCE PACK -> ANGLE + title qualification
-> SCRIPT DRAFT -> script QA -> (revise <=3x | research rollback) -> APPROVED SCRIPT -> BEAT PARSER -> STICKMAN SCENARIO STORYBOARD
-> CONTINUITY + FACTUAL-VISUAL GATE -> ASSET PLAN (registry search -> reuse/modify/vector generate -> selective ComfyUI) -> ASSET GATE
-> LOW-COST ANIMATIC -> (optional human storyboard gate) -> FINAL TTS -> FORCED ALIGNMENT + RETIME -> SCENE/ANIMATION COMPILE
-> AUDIO/SFX MIX -> SUBTITLES -> VIDEO QA -> THUMBNAIL + TITLE PAIRING -> PACKAGING GATE -> FINAL RENDER -> HUMAN APPROVAL -> (owner uploads) -> ANALYTICS -> feature feedback
```
Handoff one-liner: `Sources -> Idea Miner -> Packaging Gate -> Research/Claim Ledger -> Script -> Script QA -> Storyboard Compiler -> Asset Planner -> (SVG Stickman + ComfyUI) -> Scene Renderer -> TTS/SFX -> Assembly -> Rendered QA -> Thumbnail Lab -> Publish -> Analytics`.
Resolved ordering conflict: the handoff gates packaging *before* research; the report places final pairing after QA - both are kept (provisional + final), see [idea-research-packaging §7](idea-research-packaging.md).

## 2. Stage table

"Producer" shows the repo-appropriate implementation: **C** = Claude authors a file, **D** = deterministic code, **V** = independent Claude verifier subagent (artifact + spec only), **H** = human.

| Stage | Reads | Writes | Producer | Gate / exit |
|---|---|---|---|---|
| idea | signals, catalog, analytics | `idea/candidate.json`, `decision.json` | C, V | idea gate; owner picks or auto-rule |
| evidence | idea | `research/evidence_packet.json`, `claim_ledger.json`, `sources/` | C (+V fact verify) | evidence gate; `review_status: VERIFIED` |
| script | packet, ledger, style rules | `script/draft_NN.md`, `approved.md/.json`, claim-map sidecar | C | script gate; <=3 style revisions; factual fail -> evidence |
| beats | approved script | `beats/script_beats.json` | C + D check | covers script once, in order |
| storyboard | beats, evidence, style profile, asset index, policy | `storyboard/storyboard.json`, `continuity_ledger.json`, `asset_requirements.json`, `preview/`, `qa/storyboard_gate.json` | C, D (simulator), V | storyboard + continuity gate |
| asset plan/assets | requirements, registry | `assets/requirements.json`, `manifest.json`, `derived/` | D (+C for vector authoring) | asset gate |
| animatic | storyboard, assets | low-cost preview | D | agent/human skim |
| narration | approved script, lexicon | `audio/narration.wav` | D (dots.tts/VoiceStudio) | cadence/pronunciation gates ([voice-tts](../../../references/voice-tts.md)) |
| alignment | WAV + script | `audio/alignment.json`, retimed storyboard | D (faster-whisper/WhisperX) | alignment confidence; semantic match |
| render | storyboard, assets, alignment | `render/segments/`, `edit_plan.json` | D (Remotion + ffmpeg) | render manifest per segment |
| mix | segments, music/SFX, narration | `audio/mix.wav`, subtitles | D | audio gate |
| video QA | final, storyboard, claims | `qa/final_video.json` | D + V (looks at frames) | final gate |
| packaging | verified premise, script | `packaging/titles.json`, `thumbnails/`, `decision.json` | C, D, V, H | packaging gate |
| approval/publish | all | `publish/metadata.json`, `approval.json` | H | explicit human approval; owner uploads |
| analytics | platform exports | `analytics/` | H supplies, C analyses | pattern-level |

## 3. Per-video layout (Report §26.2) and the beat file

```
projects/<video_id>/  project.json  state.json  idea/{candidate,decision}.json  research/{evidence_packet,claim_ledger}.json + sources/
  script/{draft_NN.md, approved.md, approved.json, qa/}  beats/script_beats.json  storyboard/{storyboard.json, continuity_ledger.json, preview/, qa/}
  assets/{requirements.json, manifest.json, derived/}  audio/{narration.wav, alignment.json, music_plan.json, sfx_plan.json, mix.wav}
  render/{segments/, edit_plan.json, preview.mp4, final.mp4}  packaging/{titles.json, thumbnails/, decision.json}  qa/final_video.json  publish/{metadata.json, approval.json}  analytics/
```
Channel-level (Report §26.1, trimmed): `schemas/` (the two shipped schemas + evidence packet, script beats, gate result), `config/{modes,style,research,qa}`, `asset_library/{registry.sqlite|json, vectors, rasters, poses, locations, audio}` (global across videos, per-project manifests), `workflows/comfy/` (only if ComfyUI is adopted), `cache/`, `projects/`. Keep everything inside your own channel folder (ownership rule: [new-channel-playbook §1](../../../references/new-channel-playbook.md)).
**Beat record** (`script_beats.json`, Report §25.2 and §21.5): `beat_id`, `order`, `narration`, `narrative_function`, `semantic_kind` (`ACTION`,`MECHANISM`,`COMPARISON`,`NUMBER`,`SOURCE`,`EXCEPTION`,`CALLBACK`...), `claim_ids[]`, `entities[]`, `location_hint`, `time_context`, `causal_parents[]`, `open_loop_ids_opened[]`, `open_loop_ids_closed[]`, `retention_debt_opened/closed[]`, `visual_priority` 0-1, `must_visualize` bool, `duration_estimate_s`.
Beat parser rules (Blueprint 6): segment by **change in narrative function / semantic action, not punctuation** (one sentence may need several visual states; several may share a scenario); all script text covered once in order; factual beats keep claim ids; ambiguous entities flagged not guessed; durations from word count are *provisional*; mark `must_visualize` for central mechanisms/actions/numbers; reparse only ambiguous spans, never rewrite the script.

## 4. Storyboard authoring method (Report §21, Blueprint 7) - what Claude does, in order

1. **Entity resolution** -> stable ids: same-role participant = same entity unless text introduces a new instance; generic montage examples get `persistence_scope: SHOT`; pronouns resolve against discourse + current scenario; if ambiguity changes visuals, status `BLOCKED_AMBIGUOUS_ENTITY` (ask or flag, don't guess) (§21.6).
2. **Location resolution** -> reusable locations with named anchors ([characters-assets-continuity §5](characters-assets-continuity.md)).
3. **Initialise scenario state**; keep the **two-layer model**: scenario (diegetic world) vs shot (camera interval); a sentence may hold several visual states, several sentences one shot (§14.1, §21.4).
4. **Per beat choose `scene_operation`** from the features `same_location, same_time_context, persistent_entity_overlap, unresolved_action_overlap, new_entity_count, abstraction_shift, historical_or_geographic_jump, camera_need, text_or_stat_only, mechanism_insert_need` (§21.9):
   explicit time/location jump -> `NEW_SCENARIO`; abstraction shift while the scenario can resume -> `INSERT_EXPLAINER` (+ return); text/stat only over a supporting image -> `OVERLAY_ONLY`; same location and entity overlap -> `CAMERA_CUT` if only framing changes else `MUTATE_SCENARIO`; connective beat with no new information -> `HOLD`; otherwise the planner's proposal - which needs a stated reason if it discards unresolved state (§8.3: `new_scene_pressure` vs `continuity_pressure`).
5. **Pick `scene_type`** with the two-stage classifier (semantic label of the beat, then rules; the validator rejects impossible continuity or unsupported factual imagery - §11.1): NUMBER+claim -> `TEXT_STAT_EMPHASIS`; ACTION in same place/entities -> `REAL_WORLD_SCENARIO` (mutate); MECHANISM with causal edges -> `CAUSE_EFFECT_CHAIN`; SOURCE without reenactment -> `RESEARCH_ATTRIBUTION`; EXCEPTION with >=2 examples -> `EXCEPTION_MONTAGE`.
6. **Continuity**: each shot gets preconditions + patches (see [storyboard-schema §9](storyboard-schema.md)); inserts push/pop a snapshot so a cutaway cannot teleport a prop or flip characters on return (§21.11).
7. **Camera planner**: all narratively necessary entities legible; don't cross left/right relationships without purpose; reserve safe space for labels; close-ups only when detail matters; each camera change carries a reason code `DETAIL`/`REACTION`/`REVEAL`/`RESET_ATTENTION`/`COMPOSITION_FIX` (sidecar, not in the schema) (§21.12).
8. **Factual-visual links**: attach `source_claim_ids` to any visual that could imply a mechanism, number, history or attribution; plan against over-strong causality, undated/unit-less numbers, metaphors mistaken for mechanism, misleading anatomy/action, invented historical detail, mismatched attribution (§21.14).
9. **Declare asset dependencies** before any render; block shots until assets are approved (§21.13).
10. **Add timed animation/audio intents**, then simulate; repair only local planning errors within budget; emit the animatic.
Output files and validation: [storyboard-schema](storyboard-schema.md); worked example: [start-a-channel-now](start-a-channel-now.md).

## 5. Why storyboard precedes TTS but retimes after (Report §23.2)

Plan assets/scenarios from script structure early; lock the narrative; generate final TTS; force-align to get real word/token times; **retime events inside their semantic windows**; visual logic is not regenerated because a sentence ran 0.4 s slower. Minimum animation durations and event ordering are preserved while retiming; `sync_target_event_id` keeps SFX tied to their motion. Blueprint 12: normalise text without changing meaning -> pronunciation lexicon -> synthesise by recoverable segments -> join with explicit pauses -> force-align -> map trigger tokens to event windows -> retime; regenerate only the affected line for a mispronounced name.

## 6. Roles and hand-off packets (Report §24)

The main orchestrator (Claude in the main thread) owns state transitions, hashes, retry budgets, human gates and refuses invalid stage jumps; it should **not** carry the whole research corpus + storyboard + QA history in one growing context. Specialist roles that justify separation: `researcher`, `fact_verifier`, `scriptwriter`, `storyboarder`, `continuity_verifier`, `asset_planner`, `visual_verifier`, `packaging_planner`, `packaging_verifier`. No separate transition/SFX/folder agents - those are deterministic compiler responsibilities (§24.3). In this repo every role = Claude (main or subagent) following a written packet; there is no model-API service.
**Independent-verifier protocol** (§24.4): the verifier gets the artifact under test, the spec/evidence and explicit acceptance criteria - **not** the producer's reasoning or self-score; returns structured disagreement:
`{"status":"REVISE","violations":[{"rule_id":"CONTINUITY_PROP_OWNERSHIP","artifact_path":"shots[12]","evidence":"prop_plate attached to char_A at shot 11 exit but appears on table without detach patch","repair":"insert detach/place patch before shot 12"}]}`.
Hand-off packet = a small folder: `request.json` (task, acceptance criteria, artifact paths + hashes, the schema), the artifact, contact sheets/frames where relevant; the response is a file the validator ingests (the E871 pattern: [clip-card agent-review](../../clip-card-shorts/references/agent-review-and-captions.md)). A verifier "cannot silently edit a production artifact" (Blueprint 14).

## 7. Prompts as method (Appendix D condensed; Claude follows these, nothing calls an API)

- **Researcher**: build an evidence packet for one idea; do not write the script; claim id per factual proposition; prefer primary evidence; record contradictions and unknowns; test the surface title literally and give the narrower defensible claim; schema-valid JSON + short risk summary; never turn a plausible inference into a sourced fact.
- **Scriptwriter**: inputs = verified packet, angle, style rule pack, duration; produce one causal explainer (concrete cold scenario, escalating distinct mechanisms, examples tied to claims, explicit title qualification, counterexample check, refined rule, callback payoff); claim ids in a sidecar; don't invent examples/quotes/dates/mechanisms; don't distort facts for visuals.
- **Storyboarder**: "you are planning a persistent 2D world, not one picture per sentence"; choose an operation per beat; preserve identity/location/facing/attachments/object permanence; state changes as preconditions + patches; claim ids on risky visuals; search/reuse before generation; output validates against the schema.
- **Continuity verifier**: treat the JSON as an event-sourced state machine; simulate every patch in order; reject unresolved ids, impossible preconditions, prop teleportation, identity drift, location mismatch, missing insert returns, contradictory attachments, invalid callbacks; **do not repair silently**; return rule ids, exact JSON paths, minimal repair.
- **Visual/factual verifier**: compare rendered shot vs storyboard intent vs claims; ask whether a reasonable viewer could infer a stronger or different factual claim; flag misleading diagrams, invented history, wrong labels/numbers, asset defects, continuity mismatches, unreadable composition; return `PASS|PASS_WITH_WARNINGS|REVISE|FAIL` with shot ids and repair scope.
Script-QA adapter (Report §22.6): the report called the owner's older "existing script-quality tool" through an adapter returning `{status, score, checks[], revision_instructions[], blocking_claim_ids[], attempt}`. That tool is **not in this repo and was never inspected** (open question). In this skill the script gate is Claude + a verifier against [format §11](format-and-script-grammar.md) and [qa-gates §3-§4](../../../references/qa-gates.md); keep the result shape so a real tool could be plugged in later. The script style rule pack (§25.3): `require_cold_scenario, require_surface_answer_rejection_when_applicable, require_counterexample_check, require_title_qualification, max_unresolved_major_loops_at_end: 0; deterministic_first, require_persistent_entity_ids, forbid_untracked_prop_teleport, diagram_text_renderer: deterministic; require_claim_ids_for_stats, require_source_scope_check`.

## 8. Existing-pipeline audit (Report §1.5, §22; Handoff instruction 2)

The report's audit concerns the **owner's earlier Python/Codex pipeline**, whose repo and script-QA tool were never seen by the report's author ("file/class-level recommendations require a follow-up code audit", §22.1). Use it as a **capability checklist** for a new channel: RETAIN persistent state/resume, cache/dedupe/provenance, human approval, upload/schedule, analytics ingest; MODIFY discovery (niche signals + clusters), research (claim-level evidence packet), script generation (format grammar), metadata (paired title/thumbnail), renderer (16:9 layered backend); BYPASS in this mode clip/segment selection and 9:16-first composition (keep them for other modes, Report §22.4); ADD forensic calibrator, style-profile manager, evidence builder, beat parser, storyboard engine, continuity engine, asset registry/planner, vector character renderer, deterministic compositor, ComfyUI worker (optional), edit compiler, visual QA, thumbnail forensic/planner, feature-level analytics. Classify each as KEEP/MODIFY/MERGE/REPLACE/ADD with a reason before building (Handoff instruction 2). Do not wholesale-rewrite working infrastructure (Handoff §Mission).

## 9. Build order and the CLI (design-only)

Handoff order: repo audit -> manifest + state machine -> beat schema + script-QA adapter -> storyboard compiler + taxonomy + storyboard QA -> character/pose/prop/location registries -> procedural SVG renderer + compositing contract -> versioned ComfyUI client -> scene renderer + deterministic assembly -> rendered QA + dependency-aware repair -> packaging lab + opportunity scorer -> analytics feedback.
Report roadmap P0-P12 with exit criteria: P0 mode flag + regression proof · P1 schemas + DAG/state (synthetic project resumes, invalidates only descendants) · P2 evidence packet (writer cannot consume an unverified packet) · P3 script-QA adapter · P4 beat parser fixtures · P5 storyboard + continuity simulator (pigeon storyboard zero state errors) · P6 vector registry + renderer (validation video with no diffusion) · P7 animatic + narration timing · P8 ComfyUI worker · P9 edit/audio/final QA (localized failure -> localized re-render) · P10 packaging · P11 forensic calibration · P12 idea/analytics loop.
App. E command surface (`vf mode set`, `vf idea ingest|rank`, `vf research build|verify`, `vf script draft|qa`, `vf beats parse`, `vf storyboard build|verify-continuity|preview`, `vf assets plan|resolve`, `vf comfy run-pending`, `vf audio narrate|align`, `vf render segments --dirty-only`, `vf qa video`, `vf packaging propose|qa`, `vf approve`, `vf publish schedule`, `vf analytics ingest`, `vf resume`) is a **design**; none of it exists. Each command should be idempotent and return structured status + artifact ids. For a first channel, collapse it to: validate-json, simulate-continuity, render-dirty-shots, qa-frames, resume.
