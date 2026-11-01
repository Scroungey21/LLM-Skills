# Pipeline and architecture (news-explainer)

Merged from: old skill `architecture-and-tools`, `youtube-pipeline-master-spec` (v3), repo `README.md`, `ONBOARDING.md` (technews parts), engine/console/TUI/manifests/few-shot/design-token structure read from source.

Contents: 1 Status of the app - 2 End-to-end flow - 3 Services, ports, volumes - 4 Data model - 5 Stage rules and constants - 6 Niches and archetypes - 7 Prompt registry and regression gating - 8 LLM routing and the "agent is the LLM layer" rule - 9 Environment variables - 10 Restoring the app from git - 11 Tests - 12 Authority hierarchy and stale docs

## 1. Status of the app (read first)

The orchestration app (`engine/` FastAPI+SQLModel, `console/` Next.js, `tui/` Textual), `manifests/`, `few_shot_examples/`, `packages/design-tokens/`, the root `docker-compose.yml` services
`engine`/`console`, and the `yttechnews.bat`/`run.bat` launchers were **removed from the working tree**; they exist only in git tag **`pre-skill-reduction`**. What remains live:
`ai-video-factory/toolkit/{tts-dots,renderer,manifests,docker-compose.yml}` (the compose now defines `tts`, `tts-hidden` profile, `voicestudio` profile - **no engine/console services**), the
channel folder `technews/` (calendar, ledger, uploader, outputs), and the shared repo `.venv/`. Consequences:
- Anything below describing "the engine" is documentation of the restorable app. Without restoring it you can still: research/write scripts by hand, run `tts` for narration, render with the toolkit Remotion project from a build JSON, validate, package, schedule and upload.
- The heavy automated stages (scoring, LLM drafting, WhisperX alignment, ducked music mix, thumbnail composition, render queue + archive) live in the engine. Restore it (section 10) for fully automated production.

## 2. End-to-end flow

```text
authoritative sources
  -> raw item + source records (RSS/API ingestion, per-niche feeds, per-source + CROSS-niche dedup)
  -> scorer (run TWICE per item; agree -> auto-select; disagree -> human tie-break queue + notification)
  -> scriptwriter (per-niche few-shot, depth scaled to source richness, mandatory hook scene, per-scene word budget, pattern-interrupt cadence)
  -> editor/critic (retention rubric -> targeted revision, v1 never overwritten)
  -> fact-check/grounding (every claim vs source; untraceable = FLAGGED, not removed) [+ correct_fact_check_flags post-review stage]
  -> component-cue validator (manifest bounds; violation -> repair request to scriptwriter, max 2 attempts)
  -> scripts.status=draft  ==== HUMAN GATE 1 (approve / edit / reject) + notification ====
  -> dots.tts scene WAVs (+ persistent per-scene cache) -> concat/master -> pitch-preserving tempo
  -> WhisperX alignment (or honest deterministic repair) -> SRT/VTT + scene timestamps
  -> CIS screens + transitions (evidence media, SourceCitation, ChapterCards) -> screen/transition validators
  -> build.json -> Remotion frames -> FFmpeg H.264/AAC mux (+ loudnorm) -> quiet rotated ambient mix
  -> thumbnail + metadata (title, description with sources, tags)
  ==== HUMAN GATE 2 (approve / re-render) + notification ====  -> delivery archive + release calendar + ledger
```
Full and Short are separate Script and RenderJob rows (`variant="full"|"shorts"`, unique on `(scored_item_id, variant)`). Shorts drafting (`generate_shorts_script`) runs the same
writer->editor->fact-check->cue-validator sequence synchronously (not via the tick orchestrator, which is full-only) and still needs Gate 1 before TTS/render; `enqueue(..., variant="shorts")` queues its render separately.
Every stage is independently re-runnable (re-generating TTS for an edited script must not require re-scoring).
Design intent from the master spec: "semi-automated" = the pipeline drafts/critiques/fact-checks/voices/aligns/renders autonomously but a human approves the **script** and the **final render** before anything is publishable; success criterion = one operator goes from nothing to approved MP4 + SRT + metadata in **under 15 minutes of active attention**, quality held by regression-tested prompts; LLM calls use retry/backoff and strict JSON-schema validation with reject-and-retry on malformed output; a reusable asset-caching library for generated SVG elements (CVE badges, abstracted logos, paper-card layouts) was planned for faster, more consistent renders; future ideas (analytics feedback loop from YouTube retention curves, localisation/dubbing by re-running TTS+alignment on a translated script, new archetypes/niches as config rows) need no pipeline rewrite.

## 3. Services, ports, volumes (original compose; `tts` is still in the toolkit compose)

| Service | What | Host port |
|---|---|---|
| `tts` | FastAPI wrapper around `dots-studio/dots.tts-soar`, CUDA 12.8 image, ~4.8 GB checkpoint downloaded on first boot into volume `tts_model_cache` (healthcheck `start_period` 600 s - slow, not hung) | **8004** |
| `tts-hidden` (profile `hidden-systems`) | same image, HES voice - **never run with `tts`** (each loads a full SOAR instance; one GPU) | 8005 |
| `engine` | FastAPI, SQLModel/SQLite, orchestration workers, WhisperX (in-process, GPU), FFmpeg/FFprobe, packaging | **8000** (`ENGINE_HOST_PORT`) |
| `console` | Next.js operator UI (pipeline board, tie-break queue, script review with diff, fact-check flags, audio/caption preview, render monitor, source/voice managers, design-token editor, prompt registry + golden set, notifications, run/cost stats) | **3000** |
| `voicestudio` (profile) | optional voice lab, 127.0.0.1:3900; does not replace dots.tts for this channel | 3900 |
| ComfyUI (not compose; run by hand) | thumbnail subject art, FLUX.1-schnell-fp8, `http://127.0.0.1:8188` (engine reaches it as `http://host.docker.internal:8188`, env `COMFYUI_URL`) | 8188 |
| Remotion | **not a service** - invoked by the engine as `node --experimental-strip-types render-cli.mjs <build_json> <frame_dir> [--scale N] [--stills=n1,n2]` | - |
| TUI (`tui/`) | Textual "Focus" terminal UI on the same live engine DB; `python -m yttechnews_tui`; `TUI_ENGINE_URL` (default `http://localhost:8000`), `TUI_POLL_INTERVAL_SECONDS=15`. Queue screen (default filter `awaiting_review`, oldest first) + Focus screen (timeline + blocker panel + project-wide controls; `n` = next). No separate state - actions are real. Never point it at the real DB for tests (tests use mocked HTTP) | - |

GPU rule: `tts`, `tts-hidden`, ComfyUI, VoiceStudio and the engine's WhisperX compete for one 16 GB GPU, and a local LLM may hold it too. Check `nvidia-smi` first; ask the user to unload a local model, never kill it.
Port collision: host 8000 may be taken - set `ENGINE_HOST_PORT` **and** `NEXT_PUBLIC_ENGINE_URL`, then **rebuild** the console (the URL is baked into the client bundle at `next build`; a runtime env var does nothing).
Console server-side `ENGINE_URL` defaults to `http://engine:8000` (compose DNS). Engine data volume `engine_data` -> `/data` (SQLite, audio, alignments, screens, caches, renders); host bind `technews/output` -> `/output`.
Persistent paths: scene TTS cache `$DATA_DIR/tts_scene_cache/<script-id>/`; renders/scratch `$DATA_DIR/renders/`, `render_scratch`; test packages `technews/output/test-productions/<slug>/`; normal archive `technews/output/<niche>/<theme>/<title--render-job-id>/` (output theme folders: AI-ML-Paper-Summaries, AI-Security, Corporate-Startup-Autopsies, Cyberattacks-Zero-Days, Weekly-Tech-Rundown).

## 4. Data model (SQLite; every stage independently re-runnable)

`niches` (name, archetype_id, sources, voice_profile_id, pacing_profile, few_shot_example_set_id, strategy_bundle{component_set, editorial_constraints, scoring_rubric, background_music, visual_filter}, `rendering_mode` legacy_scene|cis) - `archetypes` (hook_required, pattern_interrupt_interval_seconds, single_hook_only) - `sources` - `raw_items` (dedup hash, status) - `scored_items` (score_run_1/2, rationale, agreement, tie_break_needed, selected) - `scripts` (scenes JSON, version_chain v1/critique/v2/fact-check report, citations, status draft|approved|rejected|edited, reviewer_notes, variant) - `component_manifests` - `audio_assets` - `alignments` (word timestamps, validation status incl. `needs_review`) - `screens`, `transitions`, `screen_types` (category template_driven|llm_authored_animation) - `render_jobs` (build.json path, status, output path, logs) - `publish_metadata` - `voice_profiles` - `prompt_registry` (target_stage, version, content, active, diffable) - `golden_set`/`golden_set_runs` - `notifications_log` - `Project`, `PipelineStep`, `RawItem`, `Source` orchestration entities.
A niche's `rendering_mode` is resolved **once at its first project's creation** and is not changeable per project afterwards (decide before running the first project). Some niches are `rendering_mode_locked` to cis.

## 5. Stage rules and constants

- **Scorer**: independent runs twice; `AGREEMENT_BAND=1` (within 1 point on the 10-point scale); `SELECTION_AVG_SCORE_FLOOR=6` (agreement alone is not enough to auto-select); disagreement -> tie-break queue + notification; scoring is never silently re-run on an item that already has a row.
- **Scriptwriter**: hook placement enforced deterministically in code from `archetypes.hook_required` (`single_hook_only` archetypes pin exactly one hook at scene 0; weekly-rundown trusts per-scene `is_hook` since each segment needs a fresh hook, floor >=1); pattern-interrupt placement is the model's best-effort judgement against the stated cadence. Runtime bands/WPM: see `editorial-standards.md`.
- **Editor**: append-only version chain (v1 never overwritten); `scripts.scenes` becomes the v2 list.
- **Fact-check**: records a traceability report without mutating the script; flags surface at Gate 1; a separate post-review correction stage applies source-supported narration fixes only when flags exist and then verifies its own revision.
- **Cue validator**: deterministic checks are a strict superset of the LLM's and win on disagreement: `typing_chars <= max_typing_speed_cps * duration_ms/1000`; narration revealable within `max_scene_ms`; split-budget components not so uneven that no value satisfies both halves; duration ceiling not below what narration needs; `node_count <= max_nodes`; `duration_ms` within range; reveal-budget floor/infeasibility/imbalance/short-duration. On violation the *scriptwriter* repairs (bounded to 2 total validation attempts, RD-5); a repair is kept only if it strictly reduces the deterministic violation count; a script that never becomes cue-valid still proceeds to Gate 1 with the violation visible in `version_chain` (RD-38).
- **Gates**: `scripts.status` changes only via explicit Gate 1 calls (draft|edited -> approved/rejected); `render_jobs.status` via Gate 2 (valid only from `done`; notes appended to `logs`). No bulk-approve endpoint exists (re-verify if one is ever added). `POST /orchestrator/run` advances one tick manually; otherwise ticks auto-advance (`ORCHESTRATOR_TICK_SECONDS`).
- **Ingestion** auto-runs every `INGESTION_INTERVAL_MINUTES=30` (one global interval); render worker/regression worker poll every 10 s; Discord webhook (optional) notifies tie-break, Gate 1, Gate 2, fact-check flags.
- **Render queue**: retry, archive, presentation lead/tail, preserves a completed raw MP4 path so archival can retry without re-rendering (see `visual-rendering.md`). Key modules: `render/build_json.py` (DB -> render contract), `render/remotion_client.py` (Remotion + FFmpeg; `VIDEO_BITRATE=24M`, buffer 48M, `AUDIO_BITRATE=192k`), `render/queue.py`, `render/gate2.py`; subprocess timeouts `NODE_RENDER_TIMEOUT_SECONDS=1800`, `RENDER_MUX_TIMEOUT_SECONDS=600`.
- Other engine modules worth knowing: `audio/{pipeline,tts_client,concat,master,loudness,align,captions,bgm,duck,validate}.py`, `synthesis/{scorer,scriptwriter,editor,fact_check,cue_validator,screen_generator,screen_validator,transition_validator,evidence_media,reaction_gifs,publish_metadata,thumbnail,comfyui_client,narration_beats,shorts,reveal_budget,golden_set_regression,gate1,notify,routing,prompts}.py`, `orchestrator/{tick,steps,control,revert}.py`, `release_calendar.py` (`ensure_release_calendar` scaffolds empty `<YYYY-MM>/<DD>` folders under `$OUTPUT_DIR/release-calendar` for the current + `RELEASE_CALENDAR_MONTHS_AHEAD=2` months in `RELEASE_TIMEZONE=Africa/Casablanca`).

## 6. Niches and archetypes (config data, not hardcoded enums)

A **niche** = subject matter; an **archetype** = structural shape; adding either must not touch pipeline code. v1 shipped one archetype (deep-dive) over three niches; seeded now:

| Archetype | hook | pattern-interrupt interval | single hook |
|---|---|---|---|
| deep-dive | required | 45 s | yes |
| weekly-rundown | required | 20 s (fast-cut stitched segments; fresh hook per segment) | no |
| retrospective ("whatever happened to X": one chronological throughline, explicit then-vs-now beat, real payoff) | required | 60 s | yes |
| myth-debunking | required | 45 s | yes |

Niches (key -> archetype): `cyberattacks-zerodays`, `infra-failures`, `ai-ml-papers`, `corporate-startup-autopsies`, `scientific-fraud-retractions`, `ai-security`, `manga_recap` and `horror_stories` (legacy side-niches; locked to cis) -> deep-dive; `weekly-tech-rundown` -> weekly-rundown; `tech-retrospectives` -> retrospective; `tech-myths-debunked` -> myth-debunking. Few-shot sets (`few_shot_examples/<niche>-v1.json`): ai-ml-papers, ai-security, corporate-startup-autopsies, cyberattacks-zerodays, infra-failures, scientific-fraud-retractions, tech-myths-debunked, tech-retrospectives, weekly-tech-rundown. 2-3 gold examples per niche matter: a zero-day timeline and a root-cause failure have different rhetorical shapes; one generic prompt is mediocre at both.
Few-shot scene schema: `{index, is_hook, is_pattern_interrupt, component, narration, word_budget, duration_ms, cues:{typing_chars,node_count}}` (+ `panel_id`, `provisional_timestamp_ms`, `scene_energy`, null for news).
Production-definition scene shape (hand-authored): `{kind: <component>, narration, content:{text, cues, title, subtitle, category, command, logs[], badge, steps[{title,desc}], nodes[{id,label,tier}], comparison{left_title,left_points,right_title,right_points}, metric, metric_label, timeline_events[{date,title,desc}]}}`. `niche_id` values used by the producer (seed order): 1 cyberattacks-zerodays, 3 ai-ml-papers, 7 ai-security, 8 weekly-tech-rundown (used for gadget/consumer-tech stories such as Garmin; the ledger labels that entry `gadgets`).
Niche accent colours resolve from `color.niche.*` design tokens via `resolveAccent(niche_key)` (throws if unmapped).

## 7. Prompt registry and regression gating

- `prompt_registry` rows exist per stage; **all eight `PROMPT_TARGET_STAGES` are regression-gated**: `scorer`, `scriptwriter`, `editor`, `fact-checker`, `cue-validator`, `screen-generator`, `screen-validator`, `transition-validator`. `POST /prompt-registry/{id}/activate` returns 409 naming the unmet condition unless there is a **`complete`, human-acknowledged regression run over >=1 applicable golden pair whose baseline/coverage/content are all still current at activation time**.
- Never bypass the registry by editing active state directly.
- **Curate the golden set first** (target 5-10 hand-approved pairs via console golden-set page or `POST /golden-set`) *before* running regressions - each run makes real LLM calls.
- A golden-pair add/remove/edit invalidates only the pending runs for stages it applies to (a legacy-mode pair never invalidates CIS-gated runs and vice versa). `ALWAYS_APPLICABLE_STAGES = scorer, scriptwriter, editor, fact-checker`.
- Four stages need a **matching-mode pair before activation is possible at all**: `cue-validator` needs >=1 legacy-mode pair; `screen-validator` and `transition-validator` need >=1 CIS-mode pair with real screens/transitions; `screen-generator` needs >=1 CIS-mode non-`manga_recap` pair. On a fresh install these may have zero eligible pairs until a niche is set to `rendering_mode: cis` and a real project reaches an approved script.
- Rationale: prevents silent quality drift as prompts are iterated; the registry is diffable with version history/rollback in the console.
- Component manifests (`manifests/<component>.json`) are shared by the Python cue validator and the Remotion renderer; limits table in `visual-rendering.md`.

## 8. LLM routing and the "agent is the LLM layer" rule

- Seeded routing (`seed_providers.py`): default provider `omp_orchestrator` (an agentic CLI invoked as a subprocess, `base_url=None`), `DEFAULT_MODEL=openai-codex/gpt-5.6-terra`; the fact-checker uses `anthropic/claude-sonnet-5` at effort `high`; vision stages (panel-parser) need a vision-capable provider. Other registered providers: OpenCode Zen, Google AI Studio, Anthropic API, Ollama Cloud, LM Studio (local, `http://localhost:1234`), Ollama (local, `http://localhost:11434`). Routing rows remain operator-owned; seeds only fill gaps.
- **Stale vs code:** README/ONBOARDING/master-spec say `OPENCODE_ZEN_API_KEY` is *required* and the models are `big-pickle` (scoring) and `nemotron-3-ultra-free` (writing/editing/fact-check) with "verify current endpoint names". The seeded default routing in code no longer depends on it; treat the spec's model names as historical and the registered routing as truth.
- Repo-wide standing rule (see `ai-video-factory/SKILL.md`): **the agent is the LLM layer - do not build model-API backends into pipelines; hand-off packets are reviewed by the agent.** The technews engine predates it and calls providers. Decision to make with the owner (open): either keep the restored engine as is (legacy), or run the editorial stages by hand (agent writes/reviews scripts as JSON, human Gate 1) and use the engine only for audio/render. Do not extend the engine's model-API paths for new work.

## 9. Environment variables (copy `.env.example` -> `.env`; never print values; never put secrets into a handoff)

| Variable | Purpose / default |
|---|---|
| `DATABASE_URL` | SQLite URL; default `sqlite:////data/data.sqlite` (four slashes for an absolute path) |
| `ENGINE_HOST_PORT` | host port, 8000 |
| `LOG_LEVEL` | INFO (structured JSON logs) |
| `REGRESSION_WORKER_INTERVAL_SECONDS` / `RENDER_WORKER_INTERVAL_SECONDS` | 10 / 10 |
| `ORCHESTRATOR_TICK_SECONDS` | 15 |
| `DATA_DIR` | `/data` |
| `INGESTION_INTERVAL_MINUTES` | 30 |
| `DISCORD_WEBHOOK_URL` | optional; blank = no notifications |
| `OPENCODE_ZEN_API_KEY`, `GOOGLE_AI_STUDIO_API_KEY`, `ANTHROPIC_API_KEY`, `OLLAMA_CLOUD_API_KEY` | provider keys (see section 8 for which is truly needed) |
| `LM_STUDIO_BASE_URL` / `OLLAMA_LOCAL_BASE_URL` | defaults `http://localhost:1234` / `:11434` (compose uses `host.docker.internal`) |
| `TTS_BASE_URL`, `TTS_BACKEND` | `http://tts:8004`, must be `dots` (client refuses anything else; the `qwen3` value is *tested to be rejected*) |
| `DOTS_TTS_MODEL` / `_DEFAULT_VOICE` / `_PRECISION` / `_OPTIMIZE` / `_NUM_STEPS` / `_CHUNK_MAX_WORDS` / `_GUIDANCE_SCALE` / `_SPEAKER_SCALE` / `_SEED` | `dots-studio/dots.tts-soar`, `warm-informational`, `bfloat16`, 0, 16, 56, 1.2, 1.5, 20260829 |
| `NARRATION_TEMPO` | compose/.env.example default **1.2** (see `audio-tts.md`) |
| `OUTPUT_DIR` | `/output`; `RELEASE_TIMEZONE=Africa/Casablanca`; `RELEASE_CALENDAR_MONTHS_AHEAD=2` |
| `MANIFESTS_DIR`, `DESIGN_TOKENS_DIR`, `RENDERER_DIR`, `FEW_SHOT_EXAMPLES_DIR` | advanced path overrides (blank = auto-resolve; use them to point at relocated dirs) |
| `RENDER_SCRATCH_DIR`, `NODE_RENDER_TIMEOUT_SECONDS`=1800, `RENDER_MUX_TIMEOUT_SECONDS`=600 | render scratch/timeouts |
| `HEALTH_MONITOR_INTERVAL_SECONDS`=20, `OMP_TASK_TIMEOUT_SECONDS`=300, `OMP_PROBE_TIMEOUT_SECONDS`=30 | health monitor / OMP orchestrator |
| `BGM_LIBRARY_DIR` | optional ambient library override |
| `COMFYUI_URL` | thumbnail art server, default `http://host.docker.internal:8188` |
| `ENGINE_URL`, `NEXT_PUBLIC_ENGINE_URL`, `CORS_ALLOWED_ORIGINS` | console wiring; CORS default `http://localhost:3000,http://127.0.0.1:3000` |
| `TUI_ENGINE_URL`, `TUI_POLL_INTERVAL_SECONDS` | TUI (deliberately not `ENGINE_URL`, which is a container-internal name) |
| `VOICESTUDIO_API_KEY` | optional |

## 10. Restoring the app from git (source only)

The restore recovers **source**, not state: rebuild Python/Node environments, and the SQLite DB/audio/caches live in the Docker `engine_data` volume (never in git); `.kiro/specs/` (phase-by-phase requirements/design/tasks) was gitignored and is **not** in the tag - if the old machine still has it, copy it out before deleting anything.

```powershell
# from the repo root; avoid piping git archive to tar in Windows PowerShell 5.1 (binary pipe corrupts) - use a zip
git archive --format=zip -o $env:TEMP\technews-app.zip pre-skill-reduction engine console tui manifests few_shot_examples packages package.json run.bat yttechnews.bat docker-compose.yml .env.example
Expand-Archive $env:TEMP\technews-app.zip -DestinationPath <restore-dir>      # prefer an empty side directory first, then move what you need
```
Then:
1. The original compose/Dockerfiles use the repo root as build context and `COPY renderer/ ./renderer/`, `packages/design-tokens/`, `manifests/`, `few_shot_examples/`, `engine/`; the engine image also installs ffmpeg, Node (with `--experimental-strip-types`), Remotion's browser, bun and the `omp` CLI. The renderer now lives in `ai-video-factory/toolkit/renderer/` (and manifests in `toolkit/manifests/`): either copy them back to `renderer/` / `manifests/` in the restore directory or edit the COPY paths, and set `RENDERER_DIR`/`MANIFESTS_DIR`.
2. `cp .env.example .env`, fill keys, `docker compose up --build` (services `tts`, `engine`, `console`; `run.bat` bootstraps Docker Desktop, waits for health, opens the console; `yttechnews.bat` launches the TUI instead).
3. Python venv for host-side tools: the shared `<repo>/.venv/` serves HES/Etcherr871; for the engine use the container, or create a dedicated venv from `engine/requirements.txt` (torch/torchaudio 2.8.0 come from the PyTorch CUDA index first).
4. Engine unit tests need the engine's own deps; GPU-dependent paths need the NVIDIA Container Toolkit.
5. Rebuild images from source before a production run (a past container was hot-patched; never trust a stale image).

## 11. Tests

```powershell
cd engine ; python -m pytest tests/        # proportional to the change; preserve unrelated failures, report them
npx tsc --noEmit -p console
python -m py_compile engine/app/audio/align.py engine/app/audio/duck.py engine/app/audio/pipeline.py tts-dots/server.py
docker compose config --quiet
```
Required coverage (master spec): dedup logic including cross-niche, JSON-schema validation, alignment-duration validation; structured logging across engine + renderer (`LOG_LEVEL`, `renderer/src/structured-log.mjs`).
`engine/tests/test_dots_tts_client.py` intentionally asserts `TTS_BACKEND=qwen3` is rejected - not leftover.

## 12. Authority hierarchy and stale docs

Order: 1 user's latest explicit request - 2 current source and runtime configuration - 3 this skill and `current-state.md` - 4 `creator-style-guide.md` / playbook rules - 5 historical `.kiro` specs and old handoffs. For live behaviour, source and generated metadata beat prose.
Stale items recorded: master-spec's Chatterbox TTS, OpenCode Zen model names, "Phase 8 thumbnail stays manual" (superseded 2026-09-04 by ComfyUI), ONBOARDING's "native pacing only in both pipelines" (false for technews), the old skill's NARRATION_TEMPO=1.5 and music dB figures (see `audio-tts.md`), TUI README's reference to a `yttechnews-pipeline-cli` skill that no longer exists. The master spec's phase-gating method (kiro-spec requirements -> design -> tasks per phase, approved before implementation) is historical build process, not a current production requirement.
