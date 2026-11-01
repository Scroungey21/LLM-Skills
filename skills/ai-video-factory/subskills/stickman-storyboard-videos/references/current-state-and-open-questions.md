# Current state, evidence limits, contradictions and open questions

Contents: 1 What exists (and what does not) · 2 How the sources were searched · 3 Evidence limits carried over from the Report · 4 Contradictions found and how they were written · 5 Open questions for the owner · 6 Suggested next steps

Date of this assessment: 2026-11-01. Reading list: `Stickman/` docs via `git show pre-skill-reduction:Stickman/<file>` (handoff 8 KB, report 147 KB / 3,667 lines, two JSON schemas; the 201 KB `.docx` is a binary duplicate of the md content and was not opened).

## 1. What exists

| Item | State |
|---|---|
| Five source docs (handoff, report, docx, 2 schemas) | in git tag `pre-skill-reduction` only; the working tree no longer has `Stickman/` ([legacy-and-removed §1-§3](../../../references/legacy-and-removed.md)) |
| Shipped here | byte-exact schema copies + two examples in [schemas/](schemas/) (hashes: storyboard schema `EAF566AB...CDAF3`, state schema `872AEDB8...F1999`, SHA-256) |
| Implementation | **none, ever.** The report was written for the owner's *earlier* Python/Codex pipeline (never inspected by its author); this repo has no `stickman_*` module, no storyboard compiler, no `vf` CLI |
| Channel | **none.** No channel folder, ledger, voice or assets for a stickman channel; the repo's channel folders (technews, hidden-everyday-systems, material-trials, etcherr871, plus ambient-channel) contain no stickman channel |
| Validated | the worked storyboard + state example against the shipped schemas using an ad-hoc subset checker (see [start-a-channel-now §5](start-a-channel-now.md)); nothing rendered, nothing human-reviewed |
| Strategic context | the owner stopped HES 2D work on 2026-10-10 and focused on 3D Blender ([everyday-systems current-state](../../everyday-systems-explainer/references/current-state.md)); a code-drawn 2D stickman channel is a **new direction** that needs an explicit go-ahead |

Restorable: only the docs (`git show pre-skill-reduction:Stickman/...`). `ShortsFactory/` has no stickman code (see §2).

## 2. How the sources were searched

- Old tree (recovered from the tag) grep for `stickman`: hits only inside `Stickman/` (handoff, report, storyboard schema). `ShortsFactory/` (src, docs, schemas, examples, `research-output/dots-tts/`, `skills/shortsfactory-continuation/`): **zero hits** for `stickman`, `whiteboard`, `doodle` - there is no `stickman_studio`. The old README's gitignore notes mention `Stickman`/`ShortsFactory` only as directories.
- Live repo markdown (read-only): stickman terms appear in the skill's own legacy/principles files; in `hidden-everyday-systems/research-output/automation-blueprint.md` and `master-report.md` (a **procedural doodle** "paint-journey" design: seeded irregular outlines, stable object ids, component library, visual-truth tags - relevant prior art, never built as such); `ambient-channel/research-output/report-00-existing-system-audit.md` only notes that `Stickman/` was inventoried by size. `hidden-everyday-systems/research-output/chat-story-study/data/music_research.md` also matched one of the search terms (not read; chat-story music research, outside this theme).
- Not searched: binary media, the docx, `output/`, `release-calendar/`.

## 3. Evidence limits carried over from the Report (§31, App. B)

**Explicit unknowns** (stay `UNMEASURED_TARGET`/null; do not invent): frame-by-frame visual grammar; stickman proportions, stroke width, palette, facial grammar; pose/camera/visual-state rates; transition inventory; narration WPM, voice model, pauses, mastering; music/SFX density and sync; thumbnail layout statistics; the studied channel's internal software; whether its assets are vector/raster/AI-assisted/hand-drawn; any animation package or diffusion model used; exact subscriber/view counts; the owner's script-QA tool; the owner's tutorial/source-video bundle (never available to the report's author).
**Inferences with confidence (Report §31.2):** topic-family exploitation - HIGH (repetition), MEDIUM (cause); illustration-led production - HIGH for one video, MEDIUM for the catalog; layered causal scripts with late nuance - HIGH for two studied examples, MEDIUM as a channel invariant; asset reuse in the target's pipeline - LOW (we reuse anyway because it is cheaper and more consistent).
Sample size reminders: one full transcript (machine-corrupted), one description page, one older POV title. The POV_PROGRESSION grammar is design intent, not an observed pattern.

## 4. Contradictions found (resolved as stated; later/normative source wins)

| # | Source A | Source B | Written as |
|---|---|---|---|
| 1 | Task framing: "commercial tool with terms" | Docs: a **YouTube channel** is being studied; no tool/licence | channel study; policy rewritten around copyright, platform terms, monetisation, disclosure, component licences ([policy §1](policy-rights-and-risk.md)) |
| 2 | Handoff Gate 1: 3+ title/thumbnail pairs before full research | Report DAG §23.1 / §32: packaging after QA | both: provisional + final packaging gate ([idea-research-packaging §7](idea-research-packaging.md)) |
| 3 | Handoff: 10 scene classes | Schema: 15 `scene_type`s; Report §11 taxonomy matches the schema | schema normative; mapping + four classes with no home ([storyboard-schema §10](storyboard-schema.md)) |
| 4 | Report prose keys (`state_patches`, `equals`, `shot_size`, `trigger`) | Schema keys (`state_patch`, `EQ`, `framing`, none) | schema ([storyboard-schema §10](storyboard-schema.md)) |
| 5 | Report §29.10: schema "should be extended" with component targets | Schema 1.1 already has `target_component` and `componentConstraint` | resolved in 1.1 |
| 6 | State schema `mode` enum (`tpdossier_explainer`...) | Handoff content *profiles* (`POV_PROGRESSION`, `CURIOSITY_EXPLAINER`) | profile is not a state field; stored in artifact metadata ([project-state §2](project-state-and-resume.md)) |
| 7 | Handoff: a visual event every 1-3 narration sentences | HES: visual change at least every 3.5 s (owner's ADHD-audience rule) | both listed; neither validated for this format; channel must pick ([format §6](format-and-script-grammar.md)) |
| 8 | Report: "up to 3 script revisions" and Comfy "max ~3" | schema `max_attempts` 0-8 | budgets of 3 (generation) / 2 (render); schema is only a ceiling |
| 9 | Report §22 audits "the existing pipeline" | That pipeline/tool are not in this repo and were never seen by the author | audit used as a capability checklist only ([pipeline §8](pipeline-and-agent-roles.md)) |
| 10 | `legacy-and-removed` §3: "keep only the design ideas (10)" | This subskill keeps the schemas and the full method | expanded on the owner's instruction; the ten ideas are all present |
| 11 | Handoff: "download reference videos where permitted" | repo rule: no unauthorised acquisition; platform terms | not instructed; owner decision ([policy §3](policy-rights-and-risk.md)) |
| 12 | Report treats Claude Code as controller with sub-"agents" | repo rule: agent is the LLM layer, no model-API backends | roles = Claude main/subagent following packets ([pipeline §6](pipeline-and-agent-roles.md)) |
| 13 | Schema `dependency_graph` description vs key/value roles | unspecified direction | PROPOSED: key = upstream ([project-state §5](project-state-and-resume.md)) |
| 14 | Report §23.2: storyboard precedes TTS, retimed after | Handoff table lists "TTS/SFX" after renderer | retime model kept ([pipeline §5](pipeline-and-agent-roles.md)) |

## 5. Open questions (owner or future agent; none resolved here)

1. Does the owner want a 2D stickman channel at all given the 2026-10-10 pivot to 3D? Which lane (animals/food, engineering, history)?
2. Reference analysis: allowed in any form (manual notes, own-render calibration), or not at all? ([policy §3](policy-rights-and-risk.md))
3. Which narration engine for a monetised channel (OmniVoice CC-BY-NC vs a commercial-licence engine)? Faceless or minimal-face characters?
4. Generative images (ComfyUI) permitted for hero art/backgrounds? Disclosure consequences?
5. Where does the real "existing script-QA tool" live, and can it be inspected, or is Claude's rubric the gate? (Report §22.6 gap)
6. Cadence rule for this format (3.5 s visual change? sentence-based?) and the max-hold.
7. Embeddings for dedupe/asset search - needed or are tags + perceptual hashes enough? (no model-API allowed; local embedding model would need approval)
8. Extending the storyboard schema: add `LEVEL_CARD`/`MAP_TIMELINE`/`HERO_TABLEAU`/`DOCUMENT_OBJECT`, a profile field, per-beat `must_visually_explain`/`forbid`, narration trigger bindings, a return-stack field - fork + version, or keep sidecars?
9. Units and the world-state path convention - adopt the PROPOSED ones ([storyboard-schema §1, §9](storyboard-schema.md))?
10. Analytics: is there any export route? Pattern-level learning needs retention by beat.
11. Template-channel monetisation risk: what editorial differentiation is the owner willing to do per video? ([policy §4](policy-rights-and-risk.md))
12. Languages: the report assumes English; the repo schedules releases in Africa/Casablanca time (owner location otherwise unknown) - other-language channels need pronunciation lexicons and TTS support checks.
13. Do POV_PROGRESSION and CURIOSITY_EXPLAINER belong in one channel or two? (Report §4.4: identity may be a tested-then-exploited mode, not a permanent format.)
14. Shorts: the report is long-form only (9:16 explicitly bypassed in this mode, §22.4); is a Short derivative wanted (HES-style summary Short + CTA)?
15. Who writes the pose/rig assets - procedural code, hand-authored SVG, or curated assets?

## 6. Suggested next steps (smallest honest path)

Owner decisions on §5.1-§5.4 -> channel folder + RULES doc via the new-channel playbook -> build validate + simulate + hash tools (§4 of [start-a-channel-now](start-a-channel-now.md)) -> run the pigeon example to an animatic -> narrate and render the vertical slice -> human review -> only then idea mining, packaging lab, analytics.
