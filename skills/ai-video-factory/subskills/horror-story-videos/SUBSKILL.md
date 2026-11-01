---
name: horror-story-videos
description: Plan and run a horror / creepypasta / scary-story narration YouTube channel (long-form stories plus vertical 9:16 Shorts) with Claude as the LLM layer - story sourcing with rights and consent states, content-safety screening, theme clustering and the 3-stories-into-1 "founding" blend, script adaptation (cold open, dread build, jump structure, slow narration), atmosphere sound design, original ambient plates with an in-render CRT/VHS/grain filter, the vertical recap derivative, a YouTube age-restriction / self-harm / AI-disclosure / inauthentic-content risk register, and QA gates. Use whenever the user says horror story video, creepypasta, scary story narration, nosleep or r/LetsNotMeet adaptation, "narrated horror channel", spooky/atmospheric story Shorts, or wants to start such a channel or restore the archived v8 horror pipeline (story_clusters, horror_stories niche, atmosphere-narration, vertical recap). Not for chat-bubble horror (use chat-story-videos), ambient-only soundscapes (ambient-long-form) or found-clip cards (clip-card-shorts).
---

# Horror story videos (theme subskill)

A **theme subskill**: there is no horror channel folder yet. It holds the design, rubrics, schemas and gates of the archived v8 "Horror Stories" niche (built in the retired technews app, tag `pre-skill-reduction`)
and the new guidance needed to run a horror channel today. Product: a narrated story (8-12 min, 16:9) over a dark, slowly moving illustrated backdrop with a light screen filter, plus a ~55 s vertical (9:16) Short,
scheduled on its own release calendar. Labels used everywhere: **[A]** archived design/code (spec ids `V8-REQ-*`, `RD-*`, `V8-INV-*`), **[N]** new guidance (not in the archive), **[R]** other repo research.

## When to use / not use

- Use: narrated fiction in the creepypasta / "scary story" genre; adapting or commissioning stories; building the safety, rights and policy discipline around it; restoring or consulting the archived pipeline.
- Not for: texting/chat-bubble fiction (separate theme, `hidden-everyday-systems/chat-stories/`), 10-hour ambience, found-clip Shorts, evidence-led tech news.
- If the request does not say which channel it is for, ask. This subskill never touches another channel's folder; a new horror channel gets its own `<channel>/` folder (`../../references/new-channel-playbook.md`).

## The pipeline, in order, with the gate at each step

Claude performs each LLM stage itself, writing decision files that code validates (hand-off packets; `../../references/agent-principles.md` §1). The archived engine's stage names are in brackets.

1. **Channel decisions** - answer the 10 first decisions below; write `docs/RULES.md`. *Gate:* owner has settled voice, rights policy, caption look, loudness target, cadence cap.
2. **Source + rights** [ingest `sources`, `story_sources`] - supply from original / commissioned / permissioned / public-domain stories; record `story_rights.json`. *Gate S:* every story publishable; no `unpermissioned_public` text. -> [sourcing-rights-and-consent.md](references/sourcing-rights-and-consent.md)
3. **Content-safety** [`content-safety`] - verdict `{passed, reasoning, flagged_categories}` on three real-world-harm categories; ordinary horror passes. *Gate X1:* failed = rejected, never shown. -> [safety-clustering-founding.md](references/safety-clustering-founding.md)
4. **Cluster** [`story-clustering`] - group passed, unclustered stories by shared dread mechanism (~6 per cluster). *Gate X2:* every id exactly once, unknown ids dropped, idempotent.
5. **Pick the trio / found** [`found_horror_project`] - a human (or Claude with the checklist) selects exactly 3 from one cluster; fingerprint `horror-blend://<sorted ids>`; composite item; 3 permanent selection rows; scoring skipped. *Gate X3:* 3 distinct, same cluster, all passed, not already spent.
6. **Policy screen + blend + script** [`scriptwriting`, `editor_critique`, `fact_check`] - NEW policy screen (self-harm, minors, sexual violence, real events, identifiers); one blended personal-framed story, no source sentence verbatim, no AI-pitch hook, dread structure. *Gate C/X4-5.* -> [script-and-narration.md](references/script-and-narration.md)
7. **GATE 1 - human approves the script** (agent never auto-approves; human reads it aloud once).
8. **Narration** [`tts`] - licensed/synthetic voice, dry, native slow pace (120-150 wpm window, *uncalibrated*), seed retry; never stretch. *Gate C6-C8.*
9. **Align + captions** [`alignment`, `subtitle_export`] - word timing on the final audio; captions per the channel decision. *Gate C9-C10.*
10. **Plates + screens** [`asset_curation`, `screen_generation`, Pass 2/3] - original ambient plates from `plates.json`; one `atmosphere-narration` screen per beat, deterministic (no per-screen model call); schedule bounded by `background_variety` 4000 ms. *Gate V1-V3.* -> [visuals-audio-captions.md](references/visuals-audio-captions.md)
11. **Audio** - owned room-tone bed, CC0 foley on events, stings limited; loudness measured on the final mux. *Gate A1-A6.*
12. **Render** [`render`] - Remotion CIS frames (JPEG sequence) + system ffmpeg mux; filter inside the Remotion tree. *Gate V4-V8, shared render gates.*
13. **GATE 2 - human approves the render** after objective QA, listening and frame inspection of the final MP4. -> [qa-gates.md](references/qa-gates.md)
14. **Vertical Short** [`spawn_vertical_recap`] - only after Gate 2, only from an original cis parent; condensed script grounded in the parent script; ends with the single CTA constant. *Gate H1-H6.* -> [vertical-recap.md](references/vertical-recap.md)
15. **Package, calendar, upload** - delivery folder + ledger entry; **upload/schedule only with explicit user authorisation in that turn** (`../../references/release-calendar.md`).

## Non-negotiable invariants

1. **No permission, no publish** for story text (new default, [N]); paraphrase-and-blend (V8-REQ-5.5/5.6) is a hygiene rule, not a licence. Credit is not a defence.
2. **A rejected story is a block, not a flag:** it never appears in a cluster or selection list (V8-REQ-4.4, V8-INV-2). The safety gate screens real-world harm, not scariness - ordinary horror passes; the NEW policy screen covers what the archive never checked.
3. **Founding is exactly 3 distinct stories from one cluster, once** (V8-REQ-5.2-5.4); each story is spent once; composition rows are permanent. There is **no ranking** of individual stories (V8-REQ-5.7).
4. **One blended narrative; never a source sentence verbatim; never an AI-pitch opener** ("have you ever wondered...") (V8-REQ-5.5, 5.6, 6.4).
5. **The filter is part of the render tree, never an `ffmpeg -vf` flag** (V8-INV-3), and it is a style choice, never a detection-evasion measure.
6. **Word timing for any text reveal uses absolute-time overlap, never `scene_index`** (V8-INV-9).
7. **Every derived Short is condensed from the approved parent script and goes through editor critique + fact-check grounded in that parent** (V8-INV-4); vertical layout never silently falls back to horizontal (V8-INV-7); one derivative per parent in v1.
8. **Fiction is labelled as fiction** (description + pinned note); no "true story"/"real footage" claims; personal framing is a device ([N]).
9. **Voice and assets have recorded provenance; no cloned real person's voice** (the archived `warm-informational` house voice is one - do not reuse it); no third-party "no-copyright" music; non-commercial model weights never.
10. **Gates fail closed** - reject and regenerate, never stretch audio or edit provenance to pass; approve only after inspecting the final MP4s; report what was not verified; never promise any platform outcome.
11. **Agent is the LLM layer:** no model-API backend in a new horror pipeline. The omp.sh orchestration half of the v8 spec is not part of the method (only its lessons, data-model §7).

## Route the task

| Task | Read |
|---|---|
| Where stories come from; permission/consent states; attribution; dedup; fetching | [sourcing-rights-and-consent.md](references/sourcing-rights-and-consent.md) |
| Safety verdicts, clustering, trio choice, what "founding" really is, canon options, hand-off packets | [safety-clustering-founding.md](references/safety-clustering-founding.md) |
| Cold open, dread build, jump structure, beat/pace numbers, narration voice, editor checklist | [script-and-narration.md](references/script-and-narration.md) |
| `atmosphere-narration`, plates vs stock, filter parameters, captions, sound design/mix, render | [visuals-audio-captions.md](references/visuals-audio-captions.md) |
| 9:16 Short: preconditions, condensation, CTA, vertical layout, file-based variant | [vertical-recap.md](references/vertical-recap.md) |
| YouTube/policy/rights/safety risks, pre-launch verification list, tripwires | [policy-risk-register.md](references/policy-risk-register.md) |
| Every gate with thresholds and sources; archived tests | [qa-gates.md](references/qa-gates.md) |
| Tables, state machines, endpoints, seeds, restore command, status of the archived implementation | [data-model-and-archived-implementation.md](references/data-model-and-archived-implementation.md) |
| Contradictions found, market evidence, owner decisions still open | [open-questions-and-contradictions.md](references/open-questions-and-contradictions.md) |

## What to reuse from elsewhere (do not duplicate)

- Narration engine, GPU rule, cadence window mechanics, voice provenance: [voice-tts.md](../../references/voice-tts.md) (dots.tts SOAR, `toolkit/tts-dots/`). The `delivery` field is ignored, so slow delivery comes from the reference + punctuation.
- Captions spec, loudness/ducking method, music/SFX policy pattern: [audio-captions-music.md](../../references/audio-captions-music.md). Gate catalogue (principles, three-view inspection, render/format, release, process): [qa-gates.md (shared)](../../references/qa-gates.md).
- Remotion renderer and the frame-sequence + ffmpeg mux recipe: [rendering.md](../../references/rendering.md); the reusable components are already in `toolkit/renderer/src/components/` (`AtmosphereNarration`, `VisualFilterOverlay`, `CisSequence`, `Captions`).
- Cross-channel rules (agent is LLM layer, rights, honest labelling, no unauthorised publishing, backups): [agent-principles.md](../../references/agent-principles.md); new-channel checklist: [new-channel-playbook.md](../../references/new-channel-playbook.md); calendar/ledger: [release-calendar.md](../../references/release-calendar.md); stage order: [workflow.md](../../references/workflow.md).
- Structure to imitate: [news-explainer](../news-explainer/SUBSKILL.md) (gates, Gate 1/Gate 2, release discipline - **not** its pacing, tempo, sources-in-description rule or evidence-led visuals). The vertical CTA sentence is the same constant as news-explainer's `SHORTS_CTA` (code agrees; only the prompt text differed, see vertical-recap §4).
- Policy snapshot method and provenance design: `ambient-channel/research-output/report-05-youtube-policy-copyright-provenance.md` (sections 2, 4-7).
- Not yet in the package when this was written (name only, no link): `references/creative-illustration-separation.md`, `references/theme-catalog.md`, and the sibling theme subskills (`chat-story-videos`, `manga-recap`).

## Start a NEW horror channel: the first 10 decisions

1. **Name + folder:** a new `<channel>/` (never reuse another channel's folder, ledger or voice); add it to the repo ownership rules as its own agent conversation.
2. **Story supply policy:** original / commissioned / permissioned / public domain; the permission state machine and the signed-licence template (sourcing §3).
3. **Content line:** what is out (self-harm methods, minors in harm/sex, sexual violence, real events/people); self-restrict or not; ad-suitability tolerance. Fetch and snapshot the YouTube pages (risk register §4).
4. **Fiction label:** exact wording in description and pinned comment; whether the narrator may speak in first person.
5. **Voice:** a licensed or genuinely synthetic reference, audition 3-4 slow references, record provenance, set the native wpm window. Dry or processed - an explicit decision.
6. **Backdrop:** original plates (method, licence-checked weights, provenance) - decide stock/library as exception only; choose the filter preset and strength.
7. **Captions + loudness:** caption look (default: decided house spec), loudness target (recommended -16 LUFS / -1.5 dBTP) - write both into `docs/RULES.md`.
8. **Bed + SFX:** project-owned room-tone/drone synthesis or own recordings; CC0 foley library with a licence log; sting budget.
9. **Cadence + calendar:** weekly cap (start 1-2 uploads/week, *uncalibrated*); separate release calendar and ledger (`../../references/release-calendar.md`); novelty rule.
10. **Short policy:** one 55 s vertical per long video (archived v1) or a Part 1/2 series; rights scope must cover Shorts; Gate 2 applies to Shorts too.

## Commands and tools: available now vs restorable

**Now (no engine):**
- Claude: safety verdicts, clustering file, trio choice, policy screen, scripting, editor critique, grounding check, plate list, caption review, QA report. Validate the decision files with a small channel script (schemas in safety-clustering-founding §8).
- Narration: `docker compose -f ai-video-factory/toolkit/docker-compose.yml up -d tts` (never alongside another GPU service); `Invoke-RestMethod http://localhost:8004/api/model-info`. Use your own voice id; the technews voice is not for reuse.
- Render: `toolkit/renderer` Remotion (`npm install` first; Node >= 22.6 for `render-cli.mjs`); composition `MasterSequence` with a CIS `build.json` (`screens[]` of type `atmosphere-narration`, `visual_filter`, `aspect_ratio`); frames then ffmpeg mux. Component source and manifest are bundled (`toolkit/manifests/atmosphere-narration.json`).
- Measurement: ffmpeg `loudnorm` analysis / `pyloudnorm`, `ffprobe`, `silencedetect`; contact sheets for plates and frames.
- `scripts/preflight.ps1` (environment check). `scripts/validate-deliverables.ps1` is news-specific (CTA, source URLs): do not use it as a horror gate.

**Restorable from the archive (tag `pre-skill-reduction`, see [legacy-and-removed.md](../../references/legacy-and-removed.md)):** `engine/` (ingestion with `fetch_kind`, `story_sources`, safety gate, clustering, founding, vertical recap, build.json), `console/` (Horror Clusters browser, live preview),
`manifests/`. Restore command and file inventory: [data-model-and-archived-implementation.md](references/data-model-and-archived-implementation.md) §1-2. Caveats before relying on it: the background layer renders procedural placeholders (no footage serving), slow delivery
is not audible, rights are unmodelled, the voice mapping is non-compliant, the v8 spec files themselves are not in the tag.

## Completion discipline

Files existing is not done. Before reporting a horror video complete confirm: rights file complete, safety + policy screens recorded, fiction label present, script human-approved, native-pace narration accepted by ear, alignment checked at hard tokens,
plates inspected three ways, bed/SFX licences logged, measured loudness of the final MP4, true peak after encode, frame samples including the break, filter legibility on a phone-size frame, metadata and credits consistent, policy snapshot dated.
State plainly what was not verified (human listening outstanding, platform review unknown). Never say a video "will not be age-restricted" or "will be monetised".
