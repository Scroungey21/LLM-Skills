# ShortsFactory decision log (what was decided, why, and what happened to it)

Source: `skills/shortsfactory-continuation/references/decision-log.md` (13 entries, "later decisions override earlier ones"; undated in the source), cross-checked against the README, `current-state.md`, the code,
the dots.tts research (2026-08-29) and the shared `legacy-and-removed.md`. **Dating:** the log carries no dates. Internal evidence puts all thirteen between about 2026-08-28 (music track downloaded) and 2026-09-01
(`current-state.md` "last consolidated"); that range is an inference. Ids `SF-D#` are this skill's labels for the log's numbers (same order). Status words: KEPT = still the design; PARTIAL = the code does not fully follow it;
SUPERSEDED = overruled by a later decision elsewhere; HISTORICAL = no longer actionable.

Contents: 1 The thirteen decisions - 2 Decisions found only in README/code/research - 3 Later decisions elsewhere that bear on this design - 4 Conflicts and how they were resolved

## 1. The thirteen decisions (in the source's order)

| Id | Decision | Why (recorded, or marked inferred) | Status / where enforced |
|---|---|---|---|
| SF-D1 | Build an automated multi-channel Shorts system, with examples and branding, BEFORE OAuth or uploading | Prove the look and the safety gates before touching accounts (inferred from ordering) | KEPT. Nine-video preview slate, no OAuth ever created |
| SF-D2 | TTS: Qwen3-TTS experiments replaced by `dots-studio/dots.tts`; final rule **no TTS in Shorts**; dots.tts only for occasional compilation interstitial narration | quality-first cloned voice (`tts-narration.md`); Shorts keep the clip's real audio | KEPT. `shorts_tts: {enabled:false}` in every `meta<n>.json`; Qwen3 path DROPPED (`tts-narration.md` section 8) |
| SF-D3 | Social-format Shorts remove side black bars by crop-fill; the original audio is the dominant track; only properly licensed / copyright-free music, mixed at volume 0.2 | social clips arrive letterboxed; the clip's own sound is the content | KEPT. `render_short` + `audio/music.py`; centre-crop caveats in `rendering-formats.md` |
| SF-D4 | No stock footage. The user supplies real clips from Instagram, TikTok and X; the app must NOT fetch them | real moments are the product; fetching/scraping and its terms are the owner's responsibility | PARTIAL. Stock adapters raise; `Pipeline._obtain` and RSS/Reddit/YouTube/manifest-URL adapters still fetch (gap G6) |
| SF-D5 | Overlay text must be context-aware and useful: a visible premise, mechanism, technique, timing cue or verified context; generic reactions and invented backstories forbidden | the overlay must change what the viewer notices | KEPT. Copy prompt + `claim_confidence` / `supporting_evidence` |
| SF-D6 | Once ~ten minutes of eligible Shorts exist for a channel, build a long-form compilation; about once a minute insert a blurred preview behind a translucent white card with written foreshadowing and optional brief dots.tts narration | give each roundup a retention hook and an original element | KEPT (`compilation.md`); policy risk flagged in `rights-and-safety.md` |
| SF-D7 | The user owns acquisition AND upload. The system owns ingestion, dedupe, watching/analysis, filtering, channel routing, editing, metadata, QA, packaging, memory and compilation between them | keeps account access and platform-terms exposure with the owner | KEPT. `youtube_upload_enabled: false` |
| SF-D8 | Daily outputs split by channel and next-day date: `<channel>/<YYYY-MM-DD>/<number>.mp4` + `meta<number>.json`; numbering is generation order for that channel/day and never overwrites | a simple hand-off folder the owner's uploader can walk | KEPT. Test `test_next_day_numbering_continues_without_overwrite` |
| SF-D9 | Reduce the network from four channels to three: merged wholesome humans/animals, merged mechanisms/skills, one meme channel | not recorded (inferred: a small audience and an inbox that is mostly memes) | KEPT. `animal_moments` / `human_skill` stay in YAML disabled |
| SF-D10 | Permanently delete high-confidence intake videos containing the enumerated religiously harmful elements (nudity/partial nakedness, uncensored swearing, direct religious insult/blasphemy, sexual subject, tempting drug content). Merge this decision into normal clip analysis (no extra model call) and run dedupe first | the owner's content/brand standard; token cost | KEPT, owner-codified. 0.85 threshold, audit log, intake-root guard (`rights-and-safety.md` section 5) |
| SF-D11 | Unknown-rights media may be edited before permission; the owner asks permission in ONE later batch; such media is clearly non-publishable and cannot pass upload readiness | edit first so the request shows the finished piece; never publish uncleared | KEPT. `can_edit` vs `publishable`; grant step missing (gap G3) |
| SF-D12 | The coding agent / outside harness is the default LLM layer; an OpenAI API key is neither needed nor desired; LM Studio may be added as an OPTIONAL local orchestration/text/vision backend | cost and control; the owner wanted the agent's own judgement | PARTIAL / reinterpreted. The shared rule (2026-10-04) goes further: no model-API backend of any kind, including LM Studio. Code still OpenAI (gap G1). See `llm-layer-method.md` |
| SF-D13 | Preferred routing when available: GPT-5.6 Terra for research, multimodal judgement, heavy logic and writing; GPT-5.6 Luna for deterministic/mechanical orchestration and uploading; equivalent roles acceptable in an outside harness | split expensive judgement from cheap mechanics | HISTORICAL. Uploading is the owner's (SF-D7), so only the judgement/mechanics split survives (`llm-layer-method.md` section 1) |

## 2. Decisions found only in the README, code or research (no log entry)

| Id | Decision | Where |
|---|---|---|
| SF-D14 | Missed review never auto-approves; unfilled next-day slots stay empty; thresholds are never lowered to fill a quota (`missing_by_channel`) | README |
| SF-D15 | Dedupe BEFORE any model work: SHA-256 + temporal frame fingerprints (>= 0.92); renamed copies and close trims are rejected, and the fingerprints are kept forever | README, `dedupe.py` |
| SF-D16 | Public post URL alone = `discovery_only`; a "cleared" social row must carry a local file or creator-supplied media URL | `SocialManifestAdapter` |
| SF-D17 | Approval and rights are separate gates; a compilation inherits the strictest member | standards, `approval/service.py` |
| SF-D18 | Physical deletion only inside configured intake roots, with an audit line first; sidecars and analysis caches purged with it | `_delete_blocked_source` |
| SF-D19 | dots.tts configuration: SOAR, continuation cloning from an AUTHORISED warm informational reference, 24 steps, CFG 1.2, speaker scale 1.5, seed 42, `EN`, BF16 on CUDA, lazy load, content-addressed WAVs, fail closed without the reference | `master-report.md` (2026-08-29) |
| SF-D20 | Channel avatars are real photographs, not generated faces/illustrations, with recorded licences | `assets/branding/README.md`, `current-state.md` |
| SF-D21 | Original editorial framing: Shorts are unmodified footage + context overlay; compilations claim only "new sequencing and commentary" | builder description text |
| SF-D22 | Timezone `Africa/Casablanca`; next-day packages; slots staggered across channels | `config.example.yaml`, `scheduling.py` |
| SF-D23 | Publisher design: private + `publishAt`, channel-ID verification, idempotent enqueue, ambiguous outcomes never auto-retried, pause file | `publisher.py` |
| SF-D24 | Bound LLM use: even frame sampling, <= 60 s transcript, one combined response, cache by source identity + policy label, stop when quotas are full | `tooling.md`, `ai/provider.py` |

## 3. Later decisions elsewhere that bear on this design (they win where they apply)

- **2026-10-04 (owner): the agent is the LLM layer; never build a model-API backend** (agent-principles section 1). Overrides the code's OpenAI provider and the "optional LM Studio" part of SF-D12. The
  shared legacy note states ShortsFactory was "superseded by Etcherr871's agent-reviewed, no-model-API pipeline" for this reason.
- **2026-10-04 (owner): Etcherr871 R0 and R5** - never stock footage (absolute) and any publicly reachable video may be used with credit, owner accepting rights risk. R5 is NOT a ShortsFactory rule; it is the
  later, differently-scoped alternative regime (`rights-and-safety.md` section 4).
- **2026-10-01 (YouTube, reported in E871 docs): reduced Shorts distribution for channels that mostly re-upload others' clips without significant changes.** Raises the stakes of SF-D6 and thin overlays.
- **2026-11-01 reduction:** ShortsFactory removed from the tree; recoverable from tag `pre-skill-reduction` (`restore-from-archive.md`); the design survives as this subskill.
- **2026-09-03 (technews):** Qwen3-TTS service and weights removed from the shared stack, matching SF-D2.

## 4. Conflicts between sources and how they are written here

| Topic | Source A | Source B | Written as, because |
|---|---|---|---|
| LLM layer | README / `config.example.yaml` / code: OpenAI provider, `gpt-5.6-terra`, `OPENAI_API_KEY` | SF-D12 + `current-state.md` "important implementation gap": harness is the LLM layer | B, which is the later decision and the repo-wide rule; A is archived implementation |
| LM Studio | `llm-backends.md`: optional provider, implementation steps | agent-principles: never build LM Studio/Ollama/any vision API backend | agent-principles (2026-10-04, later and cross-channel) |
| Order of rights vs analysis | `architecture.md`: rights check BEFORE analysis | `orchestrator.py`: rights AFTER analysis and safety gate | code (rule 3: code beats prose); trade-off in `pipeline-and-data-model.md` |
| "Equivalent explicit restriction" blocks editing | standards doc | `evaluate_rights` matches only 3 strings | code, flagged as leak (`rights-and-safety.md` section 1 rule 4) |
| "Center-aware crop" | standards doc | code crops the exact centre | code |
| "Select a grounded segment" | architecture step 9 | code always takes 0..min(duration, 60) with a placeholder rationale | code (gap G5) |
| Compilation `min_clips` | `config.py` default 8 | `config.example.yaml` 2 | example config for a copied config; code default if the key is omitted |
| Four vs three channels | early tests / `.pytest-tmp-two-channel`, branding assets for 5 PFPs | SF-D9 | SF-D9 |
| dots `num_steps` | ShortsFactory 24 | shared toolkit service default 16 | each stays; 24 chosen for short offline interstitials (`tts-narration.md` section 9) |
| Test count | `current-state.md`: 14 passed | the file has 14 test functions | consistent; still re-run |
| Who uploads | `cli.py` still carries a `youtube` sub-app "legacy publication commands (disabled in the external-upload workflow)" | SF-D7 | SF-D7; commands exist but are off by default |
