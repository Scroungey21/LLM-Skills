# Local-first tool choices: what maps to the toolkit we have, what does not

Contents: 1 Local-first principle · 2 Component-to-tool map · 3 Not available / not verified · 4 Restorable from the tag · 5 GPU and sequencing rules

Sources: Report §9.4, §20, §26, Appendix E, Blueprints 2, 9-13; the shared [environment-setup](../../../references/environment-setup.md), [voice-tts](../../../references/voice-tts.md), [rendering](../../../references/rendering.md). Status as of 2026-11-01 on the owner's Windows machine (RTX 5060 Ti 16 GB).

## 1. Local-first principle

The report's design is **local-first**: Claude Code (here: Claude in this repo) as controller; deterministic code for everything that can be deterministic; a local image backend only for the few assets vectors cannot cover; no remote model APIs (which this repo forbids anyway - [agent-principles §1](../../../references/agent-principles.md)). The cheapest, most consistent path is also the least dependent: vector rig + Remotion + ffmpeg + one TTS.

## 2. Component-to-tool map

| Report component | Report's tool choice | Toolkit/agent equivalent now | Status |
|---|---|---|---|
| Orchestrator / state machine | Claude Code + DB + Pydantic | Claude + JSON `state.json` ([project-state-and-resume](project-state-and-resume.md)); a ~100-line stdlib script for hash/invalidation | **to write**; Pydantic 2.x exists only in the archived technews engine env |
| Schema validation | JSON Schema / Pydantic | the shipped schemas + a validator | `jsonschema` was **not found** in the venvs checked (material-trials/.venv, the repo-root .venv, system Python 3.13; other venvs not inspected); a stdlib subset checker was used to validate the example ([start-a-channel-now](start-a-channel-now.md)); installing a package is an owner-approved step |
| Idea / research / script / beats / storyboard / QA "LLM" stages | LLM calls | **Claude authors files, verifier subagents re-check** | available (this is the design) |
| Continuity simulator | JSON-Patch-like engine | small Python (path get/set + assertion ops) | to write; algorithm in [storyboard-schema §9](storyboard-schema.md) |
| Vector character/scene renderer | SVG/Canvas lib + FFmpeg | **Remotion** (React/SVG) in `toolkit/renderer` -> JPEG frames -> system ffmpeg | engine available; stickman components **do not exist**; HES has `DoodleVideo.tsx` (do not copy its captions) and v3 diagram DSL as prior art |
| Animation / timeline | timed properties compiler | Remotion `useCurrentFrame` + a small curve/constraint evaluator | to write |
| Narration (TTS) | existing TTS | **dots.tts SOAR** (`toolkit/tts-dots`, Docker) and **VoiceStudio** client (`toolkit/voicestudio`, OmniVoice/VoxCPM2 engines) | available; one voice/video; engine + licence = owner decision ([voice-tts](../../../references/voice-tts.md), [policy](policy-rights-and-risk.md)) |
| Forced alignment | WhisperX / forced aligner | WhisperX 3.8.6 (listed in [environment-setup §4](../../../references/environment-setup.md)) or faster-whisper `small.en` with difflib alignment (HES method) | available in HES env; see [voice-tts §4](../../../references/voice-tts.md) |
| Assemble / mix / loudness | FFmpeg | system ffmpeg/ffprobe (`C:\bin\`), loudnorm/sidechain recipes | available ([rendering §5](../../../references/rendering.md)) |
| Music / SFX library | licensed local library | HES CC BY music library as a *pattern*; CC0 sources (MT foley/E871 catalog) | per-channel decision; licence records required |
| Captions | subtitle compiler | toolkit caption look (Montserrat Bold etc.) if the profile uses captions | optional |
| Asset registry + search | SQLite + embeddings | SQLite/JSON registry + tags + perceptual hash (PIL/OpenCV; `cv2`, `Pillow` exist in HES/E871 envs) | to write; embeddings not needed first |
| 3D / Blender | not used by the report | Blender 5.2 exists | **not needed** (2D format); at most hero art via line-art render - not planned |
| ComfyUI | selective backend | archived install; reprovision per [legacy-and-removed §4](../../../references/legacy-and-removed.md) | **not running**; default off for this channel |
| Scene-cut / OCR / optical-flow forensic tools (PySceneDetect, OpenCV flow, OCR) | `forensic_capture` | OpenCV exists; PySceneDetect/OCR: **not verified installed** | optional; legal gate first ([policy](policy-rights-and-risk.md)) |
| Reference acquisition (yt-dlp) | download refs | `yt-dlp` is installed system-wide for E871 | **do not use here by default** - platform terms and owner decision, see policy |
| Publication | existing uploader | none for this channel; the repo's channels have **no auto-upload**, owner uploads | human step ([release-calendar](../../../references/release-calendar.md)) |
| Analytics ingest | existing platform API | none built anywhere | open question |
| `vf` CLI | Appendix E | none | design only |

## 3. Not available / not verified (do not assume)

The whole storyboard compiler, beat parser, continuity engine, asset registry/planner, stickman rig renderer, `forensic_capture`, `thumbnail_forensic`, packaging planner, edit compiler as code; a running ComfyUI; `jsonschema` (in the venvs checked); PySceneDetect; an OCR engine; any stickman character/pose/location assets; a trained or measured style profile. The report's author never saw the owner's earlier Python/Codex pipeline or its script-QA tool; they are not in this repo.

## 4. Restorable from the tag

Only documents: `git show pre-skill-reduction:Stickman/{CLAUDE_CODE_TPDOSSIER_IMPLEMENTATION_HANDOFF.md, TPDossier_Local_Automation_Reverse_Engineering_Report.md, TPDossier_Local_First_Production_System_Reverse_Engineering.docx, stickman_scenario_storyboard.schema.json, video_project_state.schema.json}` (the docx duplicates the md content). No `stickman_studio`, no ShortsFactory stickman code (searched: zero hits), no engine module. `ShortsFactory` (if restored) contributes patterns only: content-addressed caches, a rights-state ledger, hash + fingerprint dedupe ([legacy-and-removed §2](../../../references/legacy-and-removed.md)).

## 5. GPU and sequencing rules

TTS, WhisperX, ComfyUI, Blender and VoiceStudio compete for 16 GB: check `nvidia-smi`, run one heavy job at a time, unload the aligner after use, never start two instances against one lock, never touch the owner's own `S:/ambient` jobs ([agent-principles §10](../../../references/agent-principles.md), [environment-setup §8](../../../references/environment-setup.md)). A pure-vector stickman render is CPU/browser bound (Remotion), so narration and render can alternate cleanly.
