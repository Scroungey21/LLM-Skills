# The LLM layer: Claude performs the judgement stages (contract, rubric, prompts-as-method)

Rule (owner, 2026-10-04, [../../../references/agent-principles.md](../../../references/agent-principles.md) section 1): never build a model-API backend into a pipeline; every
"AI step" is a file hand-off that Claude (you) completes and the code validates. ShortsFactory's own decision SF-D12 already said the harness is the default LLM layer, but its
code never caught up (`ai.provider` is `demo` | `openai`; `config.example.yaml` still names `gpt-5.6-terra`, `OPENAI_API_KEY`, `gpt-4o-mini-transcribe`). **Treat the OpenAI provider as
archived implementation detail, not as the design.** This file keeps the INTERFACE CONTRACT and the PROMPT RULES as method.

Contents: 1 Stages Claude performs - 2 Hand-off packet protocol - 3 Clip analysis (schema, rubric, procedure) - 4 Copy generation - 5 Compilation structure -
6 Final QA - 7 Archived implementation and the optional LM Studio spec - 8 Role routing

## 1. Which stages are judgement (Claude) and which are mechanical (code)

| Judgement - Claude, from frames + transcript | Mechanical - deterministic code, cached |
|---|---|
| clip analysis: summary, subjects, scores, per-channel fit | file discovery, hashing, probing, numbering |
| the harm/safety decision (same response) | exact + temporal dedupe (BEFORE any judgement) |
| channel routing when fits are close (final route uses observed content, not filenames) | frame/audio extraction, rendering, mixing, packaging |
| grounded on-screen context, title, description, tags | QA probe (dimensions, audio stream, size) |
| compilation order + foreshadow lines | thresholds, quota stop, deletion guard, rights gate |
| (optional) final QA review of finished output | schedule slots, report CSVs |

Bound the judgement spend (SF-D10, tooling.md): dedupe first; evenly sample frames; transcribe only what is needed; ONE combined response per clip; cache by source identity and
policy label; stop once every channel's next-day quota is full. Use the strongest available multimodal/reasoning model for viewing clips, safety, fit and copy; use code (or a cheaper
orchestration pass) for the mechanical rest. The archived routing note (judgement on "GPT-5.6 Terra", mechanics on "Luna") is historical; state any substitution honestly and never claim a model was
selected when the harness cannot enforce it.

## 2. Hand-off packet protocol (specified in `llm-backends.md`, never implemented)

Application side (deterministic): sample frames, extract a bounded transcript, write an ATOMIC job
`data/harness/jobs/pending/<job-id>/` containing `request.json` (task type, relative frame paths, transcript, creator context, active channel definitions, JSON Schema, policy version)
and the frames. Task types: `clip_analysis`, `generated_copy`, `compilation_structure`, `final_qa`.
Claude side: claim by atomic rename `pending -> working`, view the local frames, write `response.json.tmp`, then rename to `response.json`.
Application side again: validate with the Pydantic model; an invalid response moves to `failed` with the validation errors (never silently coerce safety or rights fields); on success
record source identity, policy version, model identity if known, timestamps and response hash; reuse a valid cached response for an unchanged source + policy.
Keep media local and referenced by relative path (no multi-MB base64 in JSON). This is the same shape as E871's `data/review/<clip>/{sheet.jpg, request.json} -> analysis.json`
(`../../clip-card-shorts/references/agent-review-and-captions.md`); a contact sheet of 12 timestamped frames (E871) is a cheaper view than 12 loose frames - either works, but
the archived design samples frames at `duration * (i + 0.5) / frame_count` (so no frame lands on a cut at t=0) scaled to 768 px wide.

**Never** let the response set rights clearance: rights come from the owner's sidecars and records, not from content analysis.

## 3. Clip analysis (`ClipAnalysis`)

Inputs: 12 frames (config 3-16), transcript of at most the first 60 s of audio (mono 16 kHz) when `transcribe_original_audio`, `<clip>.context.json` text, the active channels with their
`categories`. Required output (all fields; Pydantic is the executable truth in `ai/provider.py`):

```json
{"summary": "...", "subjects": ["..."], "categories": ["..."], "tags": ["..."],
 "scores": {"visual_quality": 0.0, "audio_quality": 0.0, "hook_strength": 0.0, "payoff_strength": 0.0,
            "novelty": 0.0, "shareability": 0.0, "family_safety": 0.0, "brand_safety": 0.0},
 "channel_fit": {"<channel_key>": 0.0},
 "religious_harm_filter": {"blocked": false, "categories": [], "confidence": 0.0, "evidence": "<=180 chars"},
 "safe": true, "rejection_reasons": []}
```
Prompt rules, restated as method (the archived prompt, near-verbatim in intent):
1. Inspect the evenly sampled frames as ONE complete video; categorise **conservatively**.
2. Use the transcript as evidence only when it clearly matches what is visible.
3. **Never invent identities, motives, locations or backstories.**
4. Apply the harm policy (`rights-and-safety.md` section 5): set `blocked` only on direct visible/spoken/written evidence, with the listed category labels only, one short evidence sentence,
   and never from clothing/identity/unshown context; do not block neutral prevention/recovery/medical/documentary/condemnatory drug discussion or non-drug criminal jokes.
5. Return specific visible subjects and actions, the safety findings, the eight scores, and a **0-1 fit for EVERY configured channel** (not only the best one).
6. Creator-supplied context is context, not proof.

Rubric to calibrate scores (derived from the thresholds that act on them; the archived code gave no anchors): below 0.45 `visual_quality` or 0.4 `hook_strength` rejects; below 0.8 `family_safety`
or `brand_safety` rejects; a channel needs fit >= 0.65 (its `fit_threshold`). Use 0.8+ only for "I would approve this today", and score `family_safety` low (not just flag `blocked`) for anything
you would not show a general audience - the quality filter is the second net behind the 0.85 deletion gate. Fit values drive routing, so make the best channel clearly higher than the others.
Honesty rule (E871 R15, adopted): if the joke or payoff depends on audio you cannot evidence from the transcript, score it down and say so in `rejection_reasons`; never guess in the clip's favour.

Acceptance gates the CODE applies to your response: schema valid; `blocked && confidence >= 0.85` -> deletion path; quality filter (`pipeline-and-data-model.md` section 8); routing threshold.

## 4. Copy generation (`GeneratedCopy`)

Output: `commentary_options` (3-5), `selected_commentary`, `claim_confidence` (0-1), `supporting_evidence`, `title_options` (>= 3), `selected_title`, `description`, `hashtags`, `tags` (5-15).
Prompt rules as method (channel voice = `branding.commentary_prompt`):
- The overlay must add a **verified why / how / technique / timing insight that changes what the viewer notices**; one or two short sentences, under ~140 characters (it renders in a top
  text block that holds 3-4 lines at 58/48 px before it hits the video window).
- Use ONLY the supplied analysis; never invent identity, motive, location, backstory, measurement or causation. `supporting_evidence` must quote what is visible/heard that backs the claim.
- Forbidden: generic praise, generic reactions, suspense bait, "wait for it", "the best part", restating the visible, and explaining away the punchline (memes).
- Titles <= 70 chars is the demo's cut (DB allows 100); description ends with the credit pointer; hashtags short; tags 5-15 that someone would search.
- Channel voices (config): Goodness Found "warm, observant, lightly witty; never fabricate a backstory"; Motion Explained "explain the visible mechanism or practiced technique viewers may not notice";
  Meme Current "explain the premise or hidden context briefly; preserve the punchline".
Weakest copy is a description or a reaction anyone would have; E871's nine caption jobs (context, hidden_skill, archetype, question_hook, escalation, ironic_proof, first_person_take,
satire_reframe, meme_cast; `../../clip-card-shorts/references/agent-review-and-captions.md`) are a ready taxonomy to choose the job BEFORE writing; port it.

## 5. Compilation structure (`CompilationStructure`)

Input: items `{id, hook, subject}` for the selected approved Shorts. Output: `ordered_ids` (all supplied ids, no invention) and `foreshadows` aligned BY POSITION - exactly one short line per
ordered id. Each foreshadow names the specific next clip and ONE concrete visible detail to watch for; no invented facts, no generic suspense ("something amazing"). Archived limit: <= 150
characters, but a 5 s narrated card fits only about 12-14 spoken words (`tts-narration.md` section 5) - write to that budget. Order for momentum and variety (strong hook early, no two same-subject
clips adjacent). The archived fallback (no model) sorts by `-hook, subject`, and the builder passes a constant `hook = 0.8`, so the fallback is alphabetical by title: not an editorial order.

## 6. Final QA (`final_qa`)

Contract: `{ "passed": boolean, "issues": [...] }`. The base class returns `passed: true`; **nothing in the archived orchestrator or builder calls it** (declared, unwired). In this skill it
is Claude's pre-approval look at the finished MP4 frames + the metadata: text inside the frame and readable, claim matches the footage, no foreign watermark, credit present, rights status
shown. Objective QA (`rendering-formats.md`) supports but never replaces it (qa-gates principle 3).

## 7. Archived implementation, and why LM Studio is NOT to be built

Implemented in `ai/provider.py` (restorable, `restore-from-archive.md`): `AIProvider` (abstract: `analyze_clip`, `generate_copy`, `purge_media_cache`, default `compilation_structure`, `final_qa`),
`DemoAIProvider` (deterministic filename-keyword fits, fixed scores 0.75-0.98, per-channel template copy; used by tests/demo), `OpenAIProvider` (Responses API with JSON-schema strict output,
`reasoning.effort` high for gpt-5 models, low-detail 768 px frames, `gpt-4o-mini-transcribe` for the first 60 s), `build_ai_provider`.
`llm-backends.md` additionally SPECIFIED (not built) a `harness` provider (section 2) and an optional `lmstudio` provider (local OpenAI-compatible server on `localhost:1234/v1`, separate
orchestration/text/vision models discovered via `GET /v1/models`, JSON-schema `response_format`, bounded retries). **Conflict:** that spec is dated before the shared rule that lists
LM Studio among backends never to build (agent-principles section 1, 2026-10-04). Written as: build neither; implement only the harness provider (the file protocol), because it IS the
"Claude is the LLM layer" design. Audio transcription must be local or supplied by the harness - never a hosted transcription API.

## 8. Implementation order if the code is restored (from `llm-backends.md`, minus the vendor backends)

1. Add a `harness` provider config; keep `demo` for tests. 2. Implement the file protocol + a status/worker command. 3. Remove API-key checks from the normal `doctor` path and the OpenAI default in
`config.example.yaml`/README. 4. Contract tests with fake job responses: invalid schema, missing field, stale cache, safe restart (crash between `working` and `response.json`). 5. Retire `OpenAIProvider`
(or leave it as a separately enabled legacy adapter that is never default - the owner's call).
