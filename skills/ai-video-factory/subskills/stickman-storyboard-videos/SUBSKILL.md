---
name: stickman-storyboard-videos
description: Plan and produce stick-figure / whiteboard / doodle-style illustrated explainer videos from a scenario storyboard - a persistent 2D world of recurring stickman characters, animals and props, driven by a schema-validated storyboard JSON, a project state machine and local vector rendering. Use for "stickman video", "stick figure explainer", "whiteboard / doodle explainer", curiosity-question videos ("why do we never eat X", "why do predators ..."), "POV: your life as every rank" progression videos, storyboard-from-script automation, character/prop continuity across shots, or building a local-first scenario to storyboard to scene to asset to voice to render pipeline where Claude authors the storyboard. Design-only today: nothing was ever implemented, but the schemas, rules, gates and a subset-validated worked example are here.
---

# Stickman / scenario-storyboard explainer videos

## What this video type is

Original, illustrated, voiced long-form (16:9; length PROPOSED ~5-12 min - the studied videos ran ~7+ min and 12:12, Report §5.1, §3.1; Shorts later) explainers in which one plain-language
question or one "life as every rank" ladder is answered through a **persistent 2D world**: a small cast of recurring
stick-figure characters/animals in reusable locations, advanced by explicit **state changes** (pose, prop, position,
camera) and punctuated by diagram/stat/montage inserts. The unit of planning is a **scenario -> shot -> visual state**,
not "one image per sentence" (Report §14.1, §21.4).

The format was studied from the observable mechanics of a YouTube channel (`@TPDossierYT`, "TPDossier", report snapshot
2026-09-05): paradox titles ("Why humans never eat X?"), a concrete second-person cold open, an escalating causal ladder of
mechanisms, an early honest qualification of the absolute title, a counterexample, a refined rule and a callback payoff
(Report §4-§7). **TPDossier is the studied reference, not this channel's identity** - copy mechanics, never expression
(see [policy](references/policy-rights-and-risk.md)). Two reusable content profiles: `CURIOSITY_EXPLAINER` and `POV_PROGRESSION`
(Handoff §Mission).

## Status - read before promising anything

**Design-only.** Source = an externally produced doc set (147 KB report, handoff, 2 JSON schemas, docx) that the repo
never implemented: no engine, no `stickman_studio`, no `ShortsFactory` code (grep: zero hits). The only restorable
artefacts are the five docs via `git show pre-skill-reduction:Stickman/<file>`; this subskill ships byte-exact copies of the
two schemas plus a subset-validated worked example ([example storyboard](references/schemas/example-pigeon-storyboard.json)). The report also could **not** retrieve video
frames: every exact style/cadence/thumbnail/audio measurement of the target is `UNMEASURED_TARGET` and stays null; defaults
here are labelled PROPOSED. See [current state](references/current-state-and-open-questions.md).

## When to use / not use

Use for: starting a stickman/whiteboard-doodle channel; writing or validating a storyboard; designing character/location/prop
continuity; the project state machine; QA/repair for illustrated explainers. Do **not** use for the Hidden Everyday Systems
2D/3D mechanism channel (own folder, own rules: [everyday-systems-explainer](../everyday-systems-explainer/SUBSKILL.md); never
import from `hidden-everyday-systems/`), news explainers ([news-explainer](../news-explainer/SUBSKILL.md)), simulation Shorts, found
clips, or ambient streams.

## Pipeline, in order, with the gate at each step

Every "AI" stage is **Claude authors file X against schema/rubric Y; a deterministic validator (or an independent Claude
verifier subagent that sees only artifact + spec) gates it** - never a model-API backend ([agent-principles §1](../../references/agent-principles.md)).
Details: [pipeline-and-agent-roles](references/pipeline-and-agent-roles.md).

| # | Stage | Output | Gate (fail = stop; bounded revision) |
|---|---|---|---|
| 1 | Idea | `idea/candidate.json` | idea gate: curiosity >=0.75 on the rubric (suggested cutoff; Report §17.5 gives only the rubric), evidence probe not `THIN`/`REJECT`, no catalog duplicate, premise qualifiable; **provisional packaging**: >=3 viable title/thumbnail concepts before full research (Handoff §Gates 1) |
| 2 | Evidence | `evidence_packet.json` + claim ledger | evidence gate (Report §27.2, §18): central mechanism DIRECT-supported, scope checked, conflicts recorded, `title_qualification` present |
| 3 | Script | `script/approved.md` + claim map | script gate (Report §27.3): cold scenario, early qualification, distinct mechanisms, counterexample, no dangling loop, 0 unsupported facts; <=3 style revisions, factual failure -> back to research |
| 4 | Beats | `script_beats.json` | beats cover the script once, in order; claim ids kept; ambiguity flagged not guessed (Blueprint 6) |
| 5 | Storyboard | `storyboard.json` (+ continuity ledger) | schema-valid; 100% beat coverage; continuity simulation = 0 hard errors; variety; no filler (Report §27.4-27.5; Handoff §Gates 4) |
| 6 | Asset plan -> assets | registry manifest | every dependency resolved; hashes/provenance; reuse before generate (Report §27.6, §19) |
| 7 | Animatic | low-cost preview | human/agent storyboard review, optional policy gate (Report §23.1) |
| 8 | Voice | narration WAV + word alignment | cadence/pronunciation/alignment gates (§27.7); then **retime** events to real audio (§23.2) |
| 9 | Render + mix | segments, `edit_plan.json`, final | rendered-output QA: frames, freezes, overflow, audio; repair only dirty segments (§27.9, §28.3; Handoff §Gates 6-7) |
| 10 | Packaging | title/thumbnail pairs | truthful, complementary, readable at 168x94 (§27.8; size check per the shared rendering notes) |
| 11 | Human approval | `approval.json` | **owner approves; nothing uploads without explicit authorisation** (§27.9, Blueprint 16) |
| 12 | Learn | feature-level analytics | pattern-level only, sample-size aware (§17.7; design only, never built) |

## Non-negotiable invariants

1. **Deterministic first.** Search -> reuse -> parametric modify -> procedural vector -> generative image only if unavoidable
   (Report §1.3). Recurring characters are vector rigs; never ask diffusion to redraw the protagonist per shot (Handoff §Renderer).
2. **A world, not pictures.** Stable `entity_id`s, event-sourced state (preconditions + patches), insert/return stack,
   offscreen != deleted (Report §10.4, §21.8, §21.11). The renderer refuses schema-invalid storyboards (§21.15).
3. **Evidence before script, qualification before packaging.** Claim ledger with scope; an absolute title needs a
   `title_qualification` and an early in-video qualification (Report §4.2, §6.7, §16.3).
4. **Render only after the storyboard gate passes; QA the rendered output, not just JSON** (Handoff §Agent instructions 8-9).
5. **No gate is silently ignored; no threshold lowered on retry** (Report §22.7). Retries must change something causally relevant (§28.2).
6. **Repair locally** via the artifact dependency DAG: a changed hash invalidates only reachable descendants; never "delete the output folder".
7. **Provenance for everything** generated or sourced: workflow/model/seed/prompt/output hash; licences for music/SFX/fonts.
8. **Honest labelling and originality:** original script, art and thumbnails; no impersonation of a creator; truthful AI-disclosure fields
   ([policy](references/policy-rights-and-risk.md), [agent-principles §4](../../references/agent-principles.md)).
9. **Never publish/upload/delete without explicit authorisation**; human approval precedes publish (Report §27.9, Blueprint 16).
10. **Unmeasured stays null.** Do not invent target measurements; engineering defaults live in a separate `local_default` object (Report §9.2).

## Route the task

| You need to... | Read |
|---|---|
| Understand the format, script grammar, hook, open loops, profiles | [format-and-script-grammar](references/format-and-script-grammar.md) |
| Pick topics, score ideas, build evidence packet/claim ledger, titles, thumbnails, analytics loop | [idea-research-packaging](references/idea-research-packaging.md) |
| Stage-by-stage I/O, folder layout, Claude's roles, hand-off packets, prompts-as-method, retime logic | [pipeline-and-agent-roles](references/pipeline-and-agent-roles.md) |
| Write/validate a storyboard (every field, enum, constraint; schema vs report mismatches; world-state convention) | [storyboard-schema](references/storyboard-schema.md) |
| Project state schema, state machine, invalidation, resume, errors, retries | [project-state-and-resume](references/project-state-and-resume.md) |
| Characters, rigs, poses, props, locations, asset registry, ComfyUI policy, consistency | [characters-assets-continuity](references/characters-assets-continuity.md) |
| Animation primitives, audio, edit compiler, transitions, subtitles, render path | [animation-audio-edit](references/animation-audio-edit.md) |
| Gates, thresholds, repair map, verifier protocol, definition of done | [qa-gates-and-repair](references/qa-gates-and-repair.md) |
| Which tools exist now (dots.tts/VoiceStudio, Remotion, ffmpeg, Blender) vs not | [toolkit-mapping](references/toolkit-mapping.md) |
| Start a channel today with Claude as the LLM layer; worked pigeon example | [start-a-channel-now](references/start-a-channel-now.md) |
| Copyright, YouTube policy, voice/asset licences, risk flags | [policy-rights-and-risk](references/policy-rights-and-risk.md) |
| What exists, contradictions, unknowns, open questions | [current-state-and-open-questions](references/current-state-and-open-questions.md) |
| Raw schemas + example storyboard/state | [storyboard schema](references/schemas/stickman_scenario_storyboard.schema.json), [state schema](references/schemas/video_project_state.schema.json), [example storyboard](references/schemas/example-pigeon-storyboard.json), [example state](references/schemas/example-project-state.json) |

## Reuse from the shared skill (link, do not duplicate)

- Narration: [voice-tts](../../references/voice-tts.md) (dots.tts SOAR, VoiceStudio, cadence gate, GPU rule, voice licences).
- Render path: [rendering](../../references/rendering.md) (Remotion frame sequence -> system ffmpeg; never `renderMedia`), ffmpeg recipes, thumbnails, visual QA.
- Captions/loudness/music/SFX: [audio-captions-music](../../references/audio-captions-music.md) (house caption look; CC-licensed music with credit text).
- Gates catalogue: [qa-gates](../../references/qa-gates.md) §3-§7, §13-§14; universal stages: [workflow](../../references/workflow.md); rules: [agent-principles](../../references/agent-principles.md); new-channel checklist: [new-channel-playbook](../../references/new-channel-playbook.md).
- Closest prior art (patterns to copy into your own folder, never import): the HES v3 continuity/attachment/motion gates and procedural-doodle blueprint - see
  [everyday-systems visual-system](../everyday-systems-explainer/references/visual-system.md) and [editorial-and-quality](../everyday-systems-explainer/references/editorial-and-quality.md).
- Evidence-led script/gate habits: [news-explainer editorial-standards](../news-explainer/references/editorial-standards.md).

## Start a NEW channel in this theme - the first 10 decisions

1. **Profile**: `CURIOSITY_EXPLAINER` first (needs no ladder-specific scene classes); `POV_PROGRESSION` only after adding schema homes for `LEVEL_CARD`/`MAP_TIMELINE` (gap, see storyboard-schema).
2. **Niche and lane** (animals/food? engineering? history?) - a topic-family graph with horizontal/vertical neighbours; not "whatever trends".
3. **Owner folder** `<channel>/` per the new-channel playbook; copy patterns, import nothing from other channels.
4. **House style**: neutral original look (off-white or flat bg, near-black rounded strokes, semantic accent tokens) - `style_profile.local_default`, measured fields null.
5. **Cast**: 1 recurring observer + 1-2 animal rigs + prop kit; faceless or minimal-face (decide `emotion_id` policy).
6. **Voice**: one voice for the whole video; engine/licence decision made with the owner ([voice-tts](../../references/voice-tts.md), [policy](references/policy-rights-and-risk.md)).
7. **Length/cadence**: choose WPM and a max-hold (suggest the HES 3.5 s visual-change rule as the starting point; unvalidated for this format).
8. **Generative images: yes/no.** Default no ComfyUI (the pigeon validation needs none); if yes, reprovision per [legacy-and-removed §4](../../references/legacy-and-removed.md) and record provenance.
9. **Evidence rigour**: source hierarchy and claim-ledger fields fixed before the first script.
10. **Human gates**: idea, script, storyboard/animatic, final - and who the human is. Then run the pigeon worked example end to end.

## Tools: now vs restorable

- **Now (toolkit + agent):** Claude as storyboarder/verifier; dots.tts/VoiceStudio narration; Remotion (SVG/React) frame render + ffmpeg mux; faster-whisper word timing; Blender not needed (2D). A stdlib validator + patch simulator must be written (a ~30-line simulator core is sketched in [start-a-channel-now](references/start-a-channel-now.md)).
- **Not available / not installed:** the report's whole `vf` CLI, any storyboard compiler, vector rig renderer, asset registry, continuity simulator, forensic-capture tools, a running ComfyUI. Nothing of these is restorable from the tag.
- **Restorable:** only the five source docs (`git show pre-skill-reduction:Stickman/<file>`); ComfyUI reprovisioning notes in [legacy-and-removed §4](../../references/legacy-and-removed.md).
