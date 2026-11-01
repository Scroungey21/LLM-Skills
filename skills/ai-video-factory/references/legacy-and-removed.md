# Legacy and removed (the 2026-11 reduction)

Compiled 2026-11-01. The repo was reduced to: the channel folders (`technews/`, `hidden-everyday-systems/`, `material-trials/`,
`etcherr871/`, `ambient-channel/`), `release-catalog/`, and this one skill (`ai-video-factory/`). This file records what was removed
or archived, why, and **how to get each piece back**.

## 0. Read this before restoring anything

- **Recovery anchor:** git tag `pre-skill-reduction` = commit `46312c56cb94898048afa6adaa313851f5ab1dc6`, the HEAD commit when the
  reduction started. (Its recorded commit date, 2026-10-08, is earlier than decisions quoted in the tracked docs, e.g. 2026-10-10 and
  2026-10-18, so commit timestamps in this repo are unreliable: judge the tag by its contents, not its date.) The tag holds **only tracked
  files as committed**. `git diff --stat pre-skill-reduction -- technews/docs etcherr871/docs hidden-everyday-systems/PIPELINE-V3.md material-trials skills README.md ONBOARDING.md CLAUDE.md NEW-CHANNEL-PLAYBOOK.md AGENTS.md`
  was empty on 2026-11-01, i.e. the tracked docs on disk equal the tag. It does **not** contain: uncommitted edits, untracked files,
  gitignored directories, or submodule *contents*. Several removed items are exactly those (see the classification table).
  **Never write "restore from the tag" for something the tag does not hold** — each row below was checked on 2026-11-01 with
  `git ls-tree pre-skill-reduction --name-only <path>` and `git check-ignore -v <path>`.
- **Browse without touching the working tree:** `git show pre-skill-reduction:<path>` (one file) or
  `git ls-tree -r pre-skill-reduction --name-only -- <dir>` (list).
- **Extract directories to a scratch folder outside the repo** (PowerShell; do not extract over a live tree):
  `git archive pre-skill-reduction engine console tui manifests few_shot_examples packages -o $env:TEMP\legacy.zip` then
  `Expand-Archive $env:TEMP\legacy.zip <empty-dest>`. (`git archive` never includes submodule contents.)
- **Whole old tree as a second checkout:** `git worktree add ..\YTtechnews-legacy pre-skill-reduction`.
- Uncommitted state at tag time was small for tracked docs/code (`git status` then showed `hidden-everyday-systems/release-calendar/LEDGER.json`
  modified, the chatterbox submodule modified, and `release-catalog/**/bin/` build output modified) but untracked and gitignored material was large
  (see the table). Whatever was uncommitted then lives only in whatever backup the owner made, not in the tag.

## 1. Classification: what the tag actually holds

| Item | In tag? | Where it went / how to restore |
|---|---|---|
| `engine/`, `console/`, `tui/`, `manifests/`, `few_shot_examples/`, `packages/` (technews FastAPI + Next.js + Textual app, prompt registry inputs) | **Yes** (tracked) | `git archive` as above. `engine/.venv`, `node_modules`, `.pnpm-store`, `engine/data*` are gitignored and **not** in the tag: recreate venvs from `requirements*.txt`/`pyproject`, `pnpm install`. Architecture and gating rules are summarised in `../subskills/news-explainer/references/`. |
| `ShortsFactory/` | **Yes**, 80 tracked files (`src` 42, `assets` 15, `skills` 11, `research-output` 3, `tests` 2, `examples` 2, README, `config.example.yaml`, `pyproject.toml`, `uv.lock`) | `git archive pre-skill-reduction ShortsFactory` (restore verified 2026-11-01: `uv sync --extra dev`, 14 tests pass; extract into an EMPTY folder; full guide in [social-clip-shorts-factory](../subskills/social-clip-shorts-factory/references/restore-from-archive.md)). Its `.venv`, `.uv-cache`, `data/`, `output/`, most media and ~20 `.pytest-tmp-*` dirs were never tracked: not recoverable from the tag. (`demo-config.yaml` is not among the tracked files in `git ls-tree`: verify before relying on it.) |
| `Stickman/` | **Yes** (5 files: handoff, 147 KB report, docx, two JSON schemas) | `git show pre-skill-reduction:Stickman/<file>`. Design ideas kept below in §3. |
| `tts-kokoro/` (Dockerfile + `server.py`) | **Yes** (2 files) | `git archive pre-skill-reduction tts-kokoro`. (ONBOARDING said "untracked"; the tag says tracked — ONBOARDING was wrong or stale.) |
| `vendor/chatterbox-tts-server` | **Gitlink only** (mode 160000 -> `915ae289340e10c6047f27f47e22eae9bf350c32`); contents not in the tag | Restore `.gitmodules` (`git show pre-skill-reduction:.gitmodules`: url `https://github.com/devnen/Chatterbox-TTS-Server`), then `git submodule update --init vendor/chatterbox-tts-server` or clone and `git checkout 915ae28...`. The submodule showed as locally modified (`m`) at tag time: those modifications are **not** recoverable. |
| `update_routing.py`, `ytc_log.txt` | **Yes** | `git show pre-skill-reduction:<file>` (what they were: §5). |
| `physics-shorts-research/` (reports, demos, data, `.venv`) | Only 24 tracked files in the tag; the bulk (reports/demos/data, venv) is **archived outside the repo to `H:\Projects\YTtechnews-archive-2026-11-01\physics-shorts-research\`** | Findings are summarised in `../subskills/physics-simulation-shorts/references/`. Do not assume the tag has it; the archive folder does. Material Trials' own Python lives in `material-trials/.venv/`. |
| `comfyui/` (~21 GB install + checkpoint) | **No** (gitignored `/comfyui/`) | Archived to `H:\Projects\YTtechnews-archive-2026-11-01\comfyui\` (its venv is broken: base interpreter was a StabilityMatrix path). Reprovision per §4. |
| `.kiro/specs/` (NEWS build history) | **No** (gitignored since 2026-09; "local-only") | Archived (not in the tag) at `H:\Projects\YTtechnews-archive-2026-11-01\kiro-specs\`. Not needed to boot. The knowledge that matters (architecture, REQ-level behaviour) is in the news-explainer references and, for the master spec, `git show pre-skill-reduction:technews/docs/youtube-pipeline-master-spec.md`. |
| `tmp_repro/` | **No** (gitignored `/tmp_*/`) | Local scratch; see §5. Do not re-add to the repo. |
| `ambient-channel/` | **No** (gitignored `/ambient-channel`) — **it stays** (not removed) | No version control at all: back up before editing ([agent-principles.md](agent-principles.md) §7). |
| `output/`, `renderer/public/` heavy media (mp3/wav/gameplay mp4/`*.parts`), `engine.venv/` | **No** | Regenerable except the owner's own gameplay footage (see §6). HES channel media now lives in `hidden-everyday-systems/renderer-public/`. |
| `renderer/`, `tts-dots/`, `tools/voicestudio/`, `docker-compose.yml` | Yes — **moved**, not removed | Now `ai-video-factory/toolkit/renderer`, `toolkit/tts-dots`, `toolkit/voicestudio`, `toolkit/docker-compose.yml`. |
| Old docs: `README.md`, `ONBOARDING.md`, `AGENTS.md`, `CLAUDE.md`, `NEW-CHANNEL-PLAYBOOK.md`, `skills/*`, `technews/docs/*`, channel READMEs/docs | Yes | Compacted into this skill (the surviving copy). The originals remain readable via `git show pre-skill-reduction:<path>` — the README's env-var table and prompt-registry rules are only there. |
| Not listed by the brief but in the tag: `run.bat`, `yttechnews.bat` (NEWS stack launchers), `tts-config/` (operator-readable mirror of dots defaults) | Yes | They were dropped in the reduction and are recoverable from the tag; the stack they launched is the archived NEWS engine. |

## 2. Per-item notes

### ShortsFactory (removed)
A local, config-driven Python (`uv`, Python 3.12+) production system for a **three-channel network** of Shorts built from *user-supplied* media:
ingest -> dedupe (SHA-256 + temporal frame fingerprints; renamed copies and close trims rejected) -> multimodal inspection (12 frames + audio transcript) ->
channel routing (`good_moments`, `how_things_work`, `memes`; `animal_moments`/`human_skill` disabled) -> branded Shorts -> next-day package
(`output/<channel>/<date>/N.mp4` + `metaN.json` + `source-files.json`) + compilations (dots.tts narration only on compilation interstitials).
Publishing is external and disabled; permission states (`unknown`/`discovery_only` -> `permission_pending`; `non_commercial`/`no_derivatives`/`prohibited` never render);
a stricter religious-harm/drug/sexual-content filter (reject at confidence >= 0.85, audit line then physical deletion inside configured intake roots).
Superseded by Etcherr871's agent-reviewed, no-model-API pipeline (the owner's 2026-10-04 "you be the LLM layer" rule: ShortsFactory used a model API for its
multimodal inspection). Useful patterns if ever needed: content-addressed caches, the rights-state ledger, hash+fingerprint dedupe.
Restore: `git archive pre-skill-reduction ShortsFactory` -> `uv sync --extra dev` -> `uv run shortsfactory init` / `doctor`; its README describes a `demo-config.yaml` offline demo (check it exists after extraction). Needs FFmpeg/FFprobe on PATH.

### Stickman (removed; external reverse-engineering/handoff docs)
An externally produced doc set (not this repo's own work): a 147 KB "TPDossier observable-mechanics reverse-engineering and local automation blueprint", an
implementation handoff, a docx, and two JSON schemas (`stickman_scenario_storyboard.schema.json`, `video_project_state.schema.json`) for a stick-figure
curiosity-explainer production system ("TPDossier-like", modes `POV_PROGRESSION` and `CURIOSITY_EXPLAINER`). It was never implemented here. Keep only the design ideas, §3.

### tts-kokoro, Chatterbox submodule, Qwen3: the legacy TTS backends
See §4b.

### comfyui (archived)
See §4.

### `.kiro/specs/`
The phase-by-phase requirements/design/tasks triples for the NEWS pipeline (every phase/addendum under the master spec). Gitignored 2026-09 as build history, not boot-required; a fresh clone never had it.

### Dropped, not restored: `.pnpm-store/`, `.cache/`, `.pytest_cache`, `__pycache__`, `engine.venv/`
Local tool state; regenerate as needed.

## 3. Stickman: the ten design ideas worth keeping

1. **Beat -> explicit scene JSON**, not a raw image prompt: actor/action/object/location, scene class, shot size, camera move, character + pose in/out, props, duration, overlays,
   SFX/music energy, transition, **`must_visually_explain[]`** and **`forbid[]`**.
2. **Scene classes** as a fixed taxonomy: `REAL_SCENARIO`, `LEVEL_CARD`, `DIAGRAM_EXPLAINER`, `STAT_CARD`, `MAP_TIMELINE`, `SPLIT_COMPARE`, `METAPHOR`, `REACTION_CLOSEUP`, `DOCUMENT_OBJECT`, `HERO_TABLEAU`.
3. **A visual event every 1-3 narration sentences**; abstract text with no meaningful visualisation gets rewritten.
4. **Procedural/vector rigs for recurring characters** (same character every shot) instead of asking a diffusion model to redraw the protagonist; diffusion only for backgrounds/props/hero art/inpainting/thumbnails.
5. **Per-asset provenance:** store workflow/model/LoRA hashes, seed, prompt version and output hash for every generated asset; never silently change checkpoint/LoRA/workflow mid-batch; reuse assets before regenerating.
6. **Render only after storyboard QA passes** (100 % beat coverage, continuity, scene variety, no generic filler); repair failed scenes locally with dependency-aware re-render, not a full restart.
7. **QA the rendered output, not just JSON:** sample frames, detect long frozen runs, overflow/collisions, missing assets, bad crops, audio clipping/silence, semantic mismatch with narration.
8. **Packaging gate before research:** 3+ viable title/thumbnail pairs; keep the factual claim ledger and the existing script-QA tool as hard gates ("no stage silently ignores a failed gate").
9. **Calibrate a style profile from data:** extract 2-fps samples and scene cuts from 3-5 reference videos into `reference_fingerprint.json` (shot-length median/p10/p90, cuts/min, scene-class mix, camera motion, text-overlay frequency, palette, transitions) before locking a style; never infer the exact tool from appearance.
10. **Copy format mechanics, not protected expression** — never reuse another creator's script, artwork, thumbnail or scene sequence; learn from analytics at the pattern level (topic family, title formula, hook type), not from one viral video.

## 4. ComfyUI + FLUX.1-schnell: how to reprovision

Background: one local ComfyUI install shared across channels; only HES used it (editorial-art atlas and accuracy-guided assets, the 2D track stopped 2026-10-10). It was ~21 GB
(app + checkpoint), gitignored, never a Compose service. Its venv's `pyvenv.cfg` `home=` pointed at StabilityMatrix's shared Python on `F:`, and the HES architecture doc says that copy
no longer exists — so **assume the archived venv is broken and rebuild rather than reuse**.

1. Clone ComfyUI (https://github.com/comfyanonymous/ComfyUI) to a folder outside the repo (or `comfyui/`, which is gitignored).
2. Create a fresh venv on any local Python 3.12: `python -m venv comfyui\venv`; `pip install -r requirements.txt`. Pick a PyTorch build matching the GPU (the NVIDIA RTX 5060 Ti, 16 GB, needs a CUDA 12.8-class build; the repo's TTS image uses torch 2.8 / CUDA 12.8 as a baseline). Verify the venv's `home=` is a Python that will stay installed.
3. Download `flux1-schnell-fp8.safetensors` (Apache-2.0; model/licence source `https://huggingface.co/black-forest-labs/FLUX.1-schnell` — recheck the current official download link for the fp8 repackage) into `models/checkpoints/`. Keep a local copy; do not point `extra_model_paths.yaml` at an external manager's library.
4. Start: `comfyui\venv\Scripts\python.exe main.py --listen 127.0.0.1 --port 8188`. **Never run it at the same time as any dots.tts/VoiceStudio instance** (shared GPU); stop it when done.
5. The channel workflows and generators are in the HES folder (still present): `hidden-everyday-systems/examples/comfyui/editorial-asset-workflow.json`, `accuracy-guided-flux-workflow.json`, and
   `generate_comfy_editorial_assets.py`, `generate_comfy_geometric_assets.py`, `regenerate_accuracy_guided_assets.py` (seeds recorded in the assets `manifest.json`). Style: hand-inked 1960s popular-science editorial spot illustration;
   inspect every asset full-res / contact sheet / in-composition before promoting. Note the AMB handoff mentions a separate stopped `comfyui-ambient` instance; AMB's rules forbid generative assets (CC0 scans only), so do not use ComfyUI there.
6. Do not regenerate whole atlases; revise a specifically failed asset after visual evidence.

## 4b. The legacy TTS backends and why they are inactive

| Backend | State | Why inactive |
|---|---|---|
| **Qwen3-TTS** | Removed 2026-09-03: compose service gone, `tts-qwen3/` source deleted, ~4.2 GB weights purged from the shared `tts_model_cache` volume. A test in the (archived) engine, `test_dots_tts_client.py`, asserts `TTS_BACKEND=qwen3` is *rejected* — intentional, not leftover | Replaced by dots.tts SOAR (quality, native pacing, reviewed synthetic voices with provenance). |
| **Chatterbox** (`vendor/chatterbox-tts-server` submodule) | Never wired into either pipeline after the dots switch (it appears in the original master spec's pipeline diagram `[Chatterbox TTS] -> [loudnorm] -> [WhisperX align]`); weights stayed in the volume | Superseded by dots.tts; kept as tracked infra "someone may reference" until the reduction. |
| **Kokoro** (`tts-kokoro/`) | Untracked-on-disk per ONBOARDING (tracked in the tag per git); unused | Same: dots.tts is the only supported narration backend for the *dots-based* channels. |

NOTE the current state of voices is **not** "dots only": HES moved to OmniVoice/VoxCPM2 via VoiceStudio (2026-10-05, split 2026-10-18); NEWS stays on dots.tts `warm-informational`.
VoiceStudio engines (OmniVoice, VoxCPM2, IndexTTS 2.5) are current infrastructure, not legacy — except IndexTTS 2.5, which must never be selected (OOM). See [voice-tts.md](voice-tts.md).
Do not reactivate Qwen3/Chatterbox/Kokoro without an explicit owner request; the client should reject them.

## 5. One-line descriptions of the stray files

- **`ytc_log.txt`** (97 bytes): the log of one failed `python ytc.py` run (`can't open file ... ytc.py: [Errno 2] No such file or directory`). No content to keep.
- **`update_routing.py`**: a one-shot script that opens the NEWS engine's SQLite (`engine/data.sqlite` or `$DATA_DIR/data.sqlite`) and re-points every `llm_task_routing` row from the `opencode_zen` provider to the `omp_orchestrator` provider with model `gemini-3.1-pro`, effort `high`. It is evidence that the archived engine called external LLM providers (see the agent-as-LLM-layer exception).
- **`tmp_repro/`**: untracked scratch from a render-pipeline reproduction/handoff exercise (Aug 2026): three downloaded **third-party reference videos** (+ captions, `info.json`, thumbnails, contact sheets, waveforms, spectrograms), `analyze_references.py`, a few stills, and two handoff folders/zip (`YTtechnews-render-pipeline-handoff`, `resumed_handoff_20260826`). **Rights flag:** the reference videos are other creators' content; they must not be re-added to the repo or published in a skill. Keep only the idea (reference fingerprinting, §3 #9).

## 6. Things that cannot be recovered from any URL or the tag

- The owner's **own gameplay footage** (~265 MB of Minecraft/GTA V clips for HES Shorts backgrounds), recorded per clip in `examples/gameplay-library.json` (`source`/`rights_basis`): if missing, ask the human for the footage again; it is why the policy is "gitignore, never delete". (Now under `hidden-everyday-systems/renderer-public/`.)
- Uncommitted work at tag time (see §0), gitignored `ambient-channel/` (no VCS; only the owner's `S:/ambient/backup_*` copies), and the physics research bulk if the archive is lost.
- Voice reference/provenance files are tracked (`toolkit/tts-dots/voices/`, including `archive-*` rejected references); music MP3s are re-downloadable from the `download_url`s in each channel's music library JSON (CC BY 4.0 / CC0).

## 7. Rationale for the new layout (one paragraph)

By late October 2026 five channels' knowledge was scattered across a root README that described only one of them, ONBOARDING/AGENTS/CLAUDE that still said "two channels", four in-repo skills plus personal out-of-repo copies that had already drifted, per-channel docs, `technews/docs/`, loose research folders, and legacy code (a heavy FastAPI/Next.js app, ShortsFactory, Stickman, dead TTS backends, a 21 GB ComfyUI) that no active channel needed. The repo was therefore reduced to the channel folders, `release-catalog/`, and one installable Claude skill: a router (`SKILL.md`), shared reference docs for what is video-type-agnostic (workflow, selector, principles, gates, new-channel playbook, tooling), one subskill per video type with its own references and a dated current-state doc, and a bundled `toolkit/` (renderer, dots.tts, VoiceStudio, compose) so the skill is portable and runnable on its own. One canonical copy of every rule removes the drift problem; legacy code stays recoverable from the `pre-skill-reduction` tag; heavy or irrecoverable artifacts stay out of the skill. (This rationale is inferred from the reduction brief and the repo's own documented failure modes; it is not a quoted owner statement.)


## 8. Theme/scenario material now covered by subskills

The archived items below held *theme* knowledge (niches, rubrics, schemas, gates, safety and rights decisions) as well as code. The decisions are now written up in
theme subskills; the code is still only recoverable as shown. Evidence, risk and tooling status per theme: [theme-catalog.md](theme-catalog.md). Where each item lives decides how to read it:
**tag** = `git show pre-skill-reduction:<path>` / `git archive pre-skill-reduction <dirs>`; **archive folder** = `H:\Projects\YTtechnews-archive-2026-11-01\kiro-specs\specs\<spec>\{requirements,design,tasks}.md`
(the gitignored `.kiro` specs are **not** in the tag, so never write `git show pre-skill-reduction:` for them).

| Archived item | Where to read it | Now covered by | What to take from it |
|---|---|---|---|
| `v4-addendum` (theme selector, strategy bundles, step model, two new niches: startup autopsies, fraud/retractions) | archive folder | [themed-news-niches](../subskills/themed-news-niches/SUBSKILL.md) | `strategy_bundle` fields (`V4-REQ-2.1`), per-niche editorial constraints and sensitivity levels (`V4-REQ-1.2`..`1.4`), `<ClaimEvidenceCompare>` |
| `p10-addendum` (Shorts variant, retention tuner, three archetypes, `ai-security`) | archive folder | [themed-news-niches](../subskills/themed-news-niches/SUBSKILL.md) | archetype rules (`single_hook_only`, pattern-interrupt interval), weekly-rundown / retrospective / myth-debunking structures (`P10-REQ-2`), retention-tuning proposals need human approval (`P10-REQ-3`), few-shot only if the file exists (`P10-REQ-2.4`) |
| `few_shot_examples/` (9 JSON sets: cyberattacks-zerodays, infra-failures, ai-ml-papers, ai-security, corporate-startup-autopsies, scientific-fraud-retractions, tech-myths-debunked, tech-retrospectives, weekly-tech-rundown) | tag (`git archive pre-skill-reduction few_shot_examples`) | [themed-news-niches](../subskills/themed-news-niches/SUBSKILL.md) | scene-level examples (hook, component, word budget, duration) per niche; use as style anchors, not as facts |
| `engine/app/seed.py` (`NICHE_SEEDS`, `NICHE_STRATEGY_BUNDLES`, `NICHE_PACING_PROFILES`), `console/app/docs/content/niches.ts` | tag | [themed-news-niches](../subskills/themed-news-niches/SUBSKILL.md), [horror-story-videos](../subskills/horror-story-videos/SUBSKILL.md), [manga-recap](../subskills/manga-recap/SUBSKILL.md) | the complete niche list (11 rows), rubrics and constraints verbatim, `rendering_mode_locked`, `voice_delivery_mode` variants |
| `v5-addendum` (Creative Illustration Separation, screen-type registry, rights tiers 0-3/F, fair-use memo, comedic persona) | archive folder | horror, manga and news subskills (shared CIS description; router names it `references/creative-illustration-separation.md`) | four-pass CIS order, per-element transitions, tier 0-2 only for automatic selection, tier F only through a human memo (`V5-REQ-5`) |
| `v6-addendum` (automatic vs manual production mode) | archive folder | [manga-recap](../subskills/manga-recap/SUBSKILL.md) (as the NLE-export override) | `production_mode` meaning; the rest is app plumbing |
| `v7-addendum` (Manga Recap) + `console/app/manga-uploads`, `console/app/nle-export` | archive folder; console in the tag | [manga-recap](../subskills/manga-recap/SUBSKILL.md) | rights basis gate (`V7-REQ-2`), niche definition and ideation override (`V7-REQ-3`), PDF/panel data model (`V7-REQ-4`), grounded narration + reworked fact-check (`V7-REQ-5`), manual-mode NLE export (`V7-REQ-8`) |
| `v8-addendum` (omp.sh orchestration, Horror Stories, live preview, vertical recap) + `console/app/horror-clusters` + `engine/app/synthesis/content_safety.py` | archive folder; engine/console in the tag | [horror-story-videos](../subskills/horror-story-videos/SUBSKILL.md) | sourcing and safety gate (`V8-REQ-4`), cluster 3-of-6 selection and blend (`V8-REQ-5`), atmosphere-narration/voice/filter (`V8-REQ-6`), vertical recap (`V8-REQ-8`/`9`). The omp.sh orchestration sections (`V8-REQ-2`/`3`) are an API-backend design that **must not** be rebuilt (agent is the LLM layer); read them only as history |
| `v9`-`v14` addenda (docs center, health monitor, manual stepwise pipeline, TUI, analytics, source visibility) | archive folder | none (app plumbing for the archived engine/console/TUI) | nothing theme-specific; consult only when restoring the app |
| `ShortsFactory/` (three-channel Shorts network, rights-state ledger, dedupe) | tag (`git archive pre-skill-reduction ShortsFactory`) | [social-clip-shorts-factory](../subskills/social-clip-shorts-factory/SUBSKILL.md) | channel definitions, permission states, fingerprint dedupe, safety filter thresholds; its model-API inspection is replaced by agent review |
| `Stickman/` (handoff, 147 KB TPDossier-style report, docx, two JSON schemas) | tag (`git show pre-skill-reduction:Stickman/<file>`) | [stickman-storyboard-videos](../subskills/stickman-storyboard-videos/SUBSKILL.md) | the ten design ideas in §3 above, the two content modes, the schemas; never the reference creator's expression |
| `hidden-everyday-systems/chat-stories/` and `research-output/chat-story-study/` | still in the working tree (not removed) | [chat-story-videos](../subskills/chat-story-videos/SUBSKILL.md) | engine, MCP server `chat-sim`, 48-story study, automation spec |

Not mapped to a subskill on purpose: the master tech-news pipeline specs (phases 1-9) are covered by the news-explainer references; quiz and ambient research stays under `ambient-channel/research-output/` and
[../subskills/ambient-long-form/](../subskills/ambient-long-form/SUBSKILL.md).

## Archive folder (created 2026-11-01)

`H:\Projects\YTtechnews-archive-2026-11-01\` holds what was moved out instead of deleted: `physics-shorts-research/` (reports, demos, data), `comfyui/` (install + FLUX checkpoint), `kiro-specs/` (the gitignored `.kiro` build history, not in the git tag), `small-state/` (technews engine SQLite DBs, ShortsFactory DB/json, console `.env*` files), `root-output-2026-09-03/` (stale root `output/`). Delete it yourself once you have checked nothing is missed.
