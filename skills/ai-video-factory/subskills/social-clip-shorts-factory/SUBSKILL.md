---
name: social-clip-shorts-factory
description: Design, run or restore ShortsFactory - the approval-gated, multi-channel factory that turns social / meme / wholesome / how-it's-made clips (Instagram, TikTok, X files the owner supplies) into branded 9:16 Shorts and weekly compilations - with source intake, rights and permission states (unknown = edit-only, never publishable until cleared), dedupe, harmful-content filtering, channel routing, a human approval dashboard, rendering, dots.tts-narrated compilation cards, YouTube upload gates and analytics. Use for any request about a meme channel, compilation Shorts, a multi-channel social-clip network, rights-cleared found footage, permission-pending clips, an approval/review dashboard, foreshadow cards, "ShortsFactory", Goodness Found / Motion Explained / Meme Current, or restoring that archived code from the pre-skill-reduction tag. Claude is the LLM layer (file hand-off, no model APIs). Not for the live Etcherr871 channel (use clip-card-shorts), narrated explainers, simulations or ambient video.
---

# Social-clip Shorts factory (ShortsFactory design)

## What this video type is
A **local, config-driven factory** that sits between two human steps. The owner supplies real social clips (files in an inbox, with optional rights sidecars) and the owner uploads. In between, the factory
dedupes, judges, filters, routes each clip to one of several themed channels, edits it into a branded 1080x1920 Short (real-photo avatar, name, handle, ONE grounded context line, the clip crop-filled with its
**original audio**, a licensed bed at 0.2), QA-checks it, numbers it per channel/day, and queues it for a human **approve / reject / revise** decision. Once ~10 minutes of approved Shorts exist it builds a
compilation with a blurred "COMING UP" foreshadow card about every minute. Default network: **Goodness Found** (wholesome humans + animals), **Motion Explained** (mechanisms, making, repair, skill, technique),
**Meme Current** (memes, reaction and absurd humour). No stock footage, ever; **no TTS in Shorts** (dots.tts only on compilation cards). The factory was designed 2026-08/09, tested (14 tests) but never run on real
inventory, then removed from the tree in the 2026-11 reduction. Its code is restorable; its design lives in this subskill.

## When to use / not use
**Use** to: plan or run a themed multi-channel clip network; design the rights/permission, safety and approval workflow for found footage; restore and verify the archived code; re-implement it with Claude as the
LLM layer; build a compilation line; decide between this and `clip-card-shorts`.
**Do not use** for: the live Etcherr871 pipeline (`../clip-card-shorts/SUBSKILL.md`, which also holds the shared hand-off model); narrated explainers (`news-explainer`, `everyday-systems-explainer`); simulation
Shorts (`physics-simulation-shorts`); ambient/quiz long-form (`ambient-long-form`). Unsure which clip base to pick: `references/vs-clip-card-shorts.md`.

## Pipeline, with the gate at each step (code order; details `references/pipeline-and-data-model.md`)
```
owner inbox -> discover -> dedupe -> [Claude: analysis + safety] -> safety gate -> rights gate -> audio gate -> quality filter -> route -> quota
   -> [Claude: grounded copy] -> render + QA -> number + package -> APPROVAL (human) -> rights re-check -> owner uploads | compilation (weekly)
```
| Step | Gate (fails closed) | Ref |
|---|---|---|
| Intake | stock adapters refused; canonical URL unique; public post URL alone = `discovery_only` | pipeline, rights |
| Dedupe (before any model work) | SHA-256 equal, or temporal dHash similarity >= 0.92 -> `DUPLICATE` | pipeline |
| Analysis + safety (ONE judgement) | `blocked` and confidence >= 0.85 -> audit line, guarded delete inside the inbox only | llm-layer, rights |
| Rights | restricted (`non_commercial`/`no_derivatives`/`prohibited`) never renders; `unknown`/`discovery_only` renders but is `permission_pending` | rights |
| Quality + audio | visual >= 0.45, hook >= 0.4, family and brand safety >= 0.8; original audio required | pipeline |
| Route | best channel with fit >= 0.65 (minus a small crowding penalty); one channel per clip | routing |
| Quota | max 8 per channel per day; shortages are reported, thresholds never lowered | routing |
| Copy | context must be verified and add something; no generic reaction, no invented backstory | llm-layer |
| Render + QA | 1080x1920, audio present, size >= 10 kB; failure deletes the temp file | rendering |
| Approval | persisted human decision; approval never overrides rights | approval |
| Upload readiness | approved AND rights eligible (all members for a compilation); channel-ID check; idempotent; ambiguous never retried | approval, youtube |
| Compilation | >= 540 s (target 600), foreshadow ~60 s, 30-day reuse window, every member cleared | compilation |

## Non-negotiable invariants (each owner-decided; ids in `references/decision-log.md`)
1. **Agent is the LLM layer** (shared rule 2026-10-04; SF-D12). Never build a model-API backend (OpenAI, LM Studio, Ollama, Gemini...). Judgement stages are file hand-offs that Claude completes; code validates and gates.
   Why: the owner wants the agent's judgement, not a billed service. The archived OpenAI provider is implementation history.
2. **Rights and editing are separate; approval never grants rights** (SF-D11, D17). Unknown-rights media may be edited and shown for review but can never be upload-ready; Claude never sets rights from content analysis.
3. **Dedupe first, one combined judgement, cache by source + policy label** (SF-D10, D15, D24): bounds model spend and stops recycled clips.
4. **The harm gate is the only physical deletion** (SF-D10, D18): five categories, >= 0.85, audit line first, resolved path inside the configured inbox, never elsewhere, never as a side effect.
5. **No stock footage** (SF-D4). The owner supplies/fetches real clips; the app should not fetch (the archived code still can: gap G6).
6. **No TTS in Shorts; keep the clip's original audio dominant**; music only if licensed (sidecar with licence), at 0.2 (SF-D2, D3).
7. **Context must be verified** (SF-D5): add a premise/mechanism/technique/timing the viewer would miss; never fabricate a person, place, motive, number or backstory.
8. **The owner uploads** (SF-D7). Never upload, set up OAuth, schedule, fetch from platforms or scan the inbox because this skill was invoked.
9. **A missed review never auto-approves; unfilled slots stay empty** (SF-D14).
10. **Later dated decisions win; code beats prose; conflicts are named, not silently resolved** (`approval-and-handoff.md` section 8).

## Route the task
| Task | Read |
|---|---|
| Stage order, states, tables, config keys, sidecar/manifest formats, dedupe and slot math | `references/pipeline-and-data-model.md` |
| Permission states, safety deletion gate, meme/profanity rules (incl. technews first-7-seconds), music/voice rights, risk register | `references/rights-and-safety.md` |
| How Claude performs analysis / copy / compilation structure; schemas, rubric, hand-off packets | `references/llm-layer-method.md` |
| Approval state machine, dashboard, upload gates, defects, session hand-off protocol | `references/approval-and-handoff.md` |
| The three channels, routing math, quotas, branding, adding a channel | `references/routing-and-channels.md` |
| Short layout/audio/QA numbers, framing hazards, preview slate | `references/rendering-formats.md` |
| Compilation rules, foreshadow card spec, weaknesses | `references/compilation.md` |
| dots.tts decision/config, reference voice, narration budget, dropped Qwen3 path | `references/tts-narration.md` |
| YouTube publisher, analytics, frequency optimiser, weekly report | `references/youtube-upload-and-analytics.md` |
| Install, CLI, daily/weekly runbook, verification script, test commands | `references/operations-and-verification.md` |
| What was decided and why; conflicts | `references/decision-log.md` |
| Status, known gaps G1-G12, tests, open questions | `references/current-state.md` |
| Exact restore from `git archive pre-skill-reduction ShortsFactory` | `references/restore-from-archive.md` |
| This vs Etcherr871; what to port | `references/vs-clip-card-shorts.md` |

## Reuse from other subskills and shared references (link, do not duplicate)
- Hand-off review model, caption jobs, reject rules, release calendar, edit styles: [../clip-card-shorts/SUBSKILL.md](../clip-card-shorts/SUBSKILL.md) and its `references/` (the live sibling).
- Rules every agent follows (LLM layer, rights, no publishing, preserve user work, ownership): [../../references/agent-principles.md](../../references/agent-principles.md). Gates catalogue (sections 6, 10, 12, 13):
  [../../references/qa-gates.md](../../references/qa-gates.md). Pipeline order: [../../references/workflow.md](../../references/workflow.md).
- Release folders, ledgers, `upload-manifest.json`, uploaders: [../../references/release-calendar.md](../../references/release-calendar.md). TTS services, voice provenance, GPU rule:
  [../../references/voice-tts.md](../../references/voice-tts.md); music/captions tooling: [../../references/audio-captions-music.md](../../references/audio-captions-music.md).
- Recovery anchor and archive rules: [../../references/legacy-and-removed.md](../../references/legacy-and-removed.md). New-channel decisions: [../../references/new-channel-playbook.md](../../references/new-channel-playbook.md).

## Starting a NEW channel in this theme: the first 10 decisions (write each down, dated, in the new channel's docs)
1. **Rights regime:** gated (this design) or owner-accepted-risk with credit (Etcherr871 R5)? Not interchangeable (`rights-and-safety.md` section 4).
2. **Who fetches:** only the owner (design) or a vetted-source pipeline (E871)? 3. **Audience promise and channel set:** one channel or a routed network; per-channel `commentary_prompt` and `categories`.
4. **Hand-off mechanism:** Claude via contact sheet / packet (default); where `request.json` / `response.json` live; policy-version label in the cache key.
5. **Safety list:** keep the five SF-D10 categories? add the E871 reject rules (minors, injury, punching down, foreign watermark)? delete or quarantine? swearing: delete (SF-D10) or bleep first-7-seconds (technews)?
6. **Card system and framing:** the branded template (crop-fill) or an E871-style card; centre crop vs `contain`. 7. **Audio:** require original audio or allow silent + calm bed; music licence sources; loudness -16 LUFS.
8. **Cadence:** quota per channel per day and slots; never fill by lowering thresholds. 9. **Compilations:** yes/no given YouTube reuse risk; if yes, credits and originality plan; narrator voice consent + disclosure.
10. **Release path and ownership:** shared release-calendar shape + `upload-manifest.json`; which agent owns the directory (ShortsFactory is NOT in the CLAUDE.md ownership table); who uploads and how.

## Commands and tools: available now vs restorable
| | State |
|---|---|
| In this skill now | these references only; the shared `scripts/preflight.ps1`, `toolkit/tts-dots` (dots.tts service), `toolkit/` renderer; Claude's own vision for review |
| Restorable from the tag | all 80 files: `git -C <repo> archive pre-skill-reduction ShortsFactory -o x.zip` -> `Expand-Archive` -> `uv sync --extra dev` -> `skills\shortsfactory-continuation\scripts\verify-project.ps1` (verified 2026-11-01: 14 tests pass). See `references/restore-from-archive.md` |
| Restored CLI | `shortsfactory init, doctor, discover, process, run, prepare-next-day, review, compilations build, weekly, status, report, examples, tts status/sample, analytics sync, optimize-frequency, youtube ...` (`references/operations-and-verification.md`) |
| NOT built | the file hand-off provider (G1), rights-grant transition (G3), segment selection (G5), first-7-seconds profanity check (G10); release-calendar/ledger/`upload-manifest.json` |
| Gone for good | `.venv`, `data/` (DB, caches, deleted-content log), `output/` previews, voice reference WAV, the owner's inbox media (only a demo-only DB copy sits in the 2026-11-01 archive folder) |
Heavy deps (dots.tts, torch cu128) are an opt-in extra; GPU rule: one heavy job at a time (agent-principles section 10).

## Working habits
- Read `references/current-state.md` and `references/decision-log.md` first (hand-off protocol). Re-run the verification script before changing anything; run focused tests, then the full suite.
- Report what you could not check: you cannot hear audio, cannot judge audio-only jokes, and cannot verify that a creator granted permission. Never claim the code "works" for production; it was never run on real inventory.
- Treat the open risks as the owner's to decide: unlicensed third-party clips, YouTube reuse/originality pressure, irreversible deletion, synthetic-voice consent and disclosure. Record the decision with a date.
