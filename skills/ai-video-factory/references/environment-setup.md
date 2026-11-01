# Environment setup (what to install or provide)

The repo ships its code and docs, not the machine. This is the checklist to run any channel on a fresh Windows box, plus what is already known about the reference machine (Windows 11 Pro, PowerShell primary,
Bash unreliable). Package lists below were read from the real venvs on 2026-11-01.

Contents: 1 Hardware and host tools · 2 Docker, NVIDIA toolkit, compose · 3 Node, Remotion, npm · 4 Python venvs and package lists · 5 Blender · 6 `.env` keys (names only) · 7 Other env vars ·
8 GPU etiquette · 9 Cold start and slow things · 10 ComfyUI (archived) · 11 `tools/` helpers · 12 Contradictions and open questions

## 1. Hardware and host tools

- **GPU:** NVIDIA RTX 5060 Ti, 16 GB (16,311 MiB; driver 617.42, Blackwell sm_120), about 14 GB free with the desktop up. Needed for dots.tts SOAR, VoiceStudio, Blender Cycles/OptiX, MPM (Taichi CUDA), WhisperX alignment.
  One heavy GPU job at a time: see `voice-tts.md` section 5 and section 8 here.
- **ffmpeg + ffprobe:** the pipelines hard-code **`C:\bin\ffmpeg.exe`** and `C:\bin\ffprobe.exe` (build N-117612-gc98810ab47, 2024-10-18). Put yours there, or edit the constants (`FFMPEG`/`FFPROBE` in
  `hidden_systems_production.py`, material-trials `finish.py`, etc.). `ffmpeg` is also on PATH here.
- **Git** (repo is a single root repo; channel folders have no `.git` of their own), **.NET 10 SDK** (10.0.400; only for `release-catalog/`), **Node.js 22.x** (v22.15.1; >= 22.6 needed for `--experimental-strip-types`), **npm** (pnpm is
  **not** installed and not needed: the lockfile that matters is `package-lock.json`; `pnpm-lock.yaml` is a stub), **Python 3.13** (system `C:\Users\<you>\AppData\Local\Programs\Python\Python313\`), **yt-dlp** (2026.08.19) and **gallery-dl**
  (Etcherr871 and `ai-video-factory/toolkit/tools/fetch_reference.py`), Firefox (uploaders), Google Chrome (technews/HES v1 uploader profiles).
- External, outside the repo: **Frame Studio** at `H:/Projects/frame-studio` (Etcherr871 card renderer, `config.json: frame_studio_dir`; `clips.py doctor` checks it); **`S:/ambient`** drive paths for the ambient channel's
  renders/caches (back up before editing; `HANDOFF.md` is that channel's state).
- Disk: huge media. Ambient 10 h renders are 4+ GB each; Docker images are large (VoiceStudio about 17 GB, dots.tts model volume about 4.8 GB, ComfyUI about 21 GB).

## 2. Docker, NVIDIA Container Toolkit, compose

- **Docker Desktop** (WSL2 backend) + **NVIDIA Container Toolkit** with GPU access; compose v2 (`docker compose`). The daemon was off when this was written; start Docker Desktop first.
- Compose file: `ai-video-factory/toolkit/docker-compose.yml`. Only `tts`, `tts-hidden` and `voicestudio` are usable from the toolkit (the `engine` and `console` services point at removed Dockerfiles). Compose reads `.env`
  from the project directory, so pass `--env-file ..\..\.env`, and set `COMPOSE_PROJECT_NAME=yttechnews` to reuse the existing volumes (`voice-tts.md` section 5 has the exact commands and why).
- Images: dots.tts built from `toolkit/tts-dots/Dockerfile` (CUDA 12.8.1 cudnn runtime, Ubuntu 24.04, Python 3.12, torch 2.8.0); VoiceStudio pulled from `ghcr.io/debpalash/voicestudio:0.5.6`.
- Volumes: `tts_model_cache` (HuggingFace cache, shared by `tts` and `tts-hidden`), `voicestudio_data`, `voicestudio_hf_cache`, (`engine_data`, legacy).

## 3. Node, Remotion, npm

Remotion 4.0.499 (`@remotion/cli`, `@remotion/google-fonts`, `@remotion/gif`), React 18.3, zod 4.4.3, TypeScript 5.5; the HES composition also needs `@remotion/bundler` and `@remotion/renderer` (transitive of the CLI). Install with `npm install` in `ai-video-factory/toolkit/` (workspace root: `renderer` + the bundled `packages/design-tokens`). Legacy HES `visual-system/` scripts resolve `@remotion/*` from `hidden-everyday-systems/node_modules`.
Each uploader has its own `npm install` (technews and HES v1: `puppeteer-core`, technews adds puppeteer-extra + stealth; HES v2: `puppeteer` 25 plus `npx puppeteer browsers install firefox`; the extension helper has no dependencies on Node 22).
Remotion's bundled ffmpeg crashes on this host, which is why renders go frame-by-frame to the system ffmpeg.

## 4. Python venvs and package lists

Two venvs remain; both were created from interpreters outside the repo, The shared venv was MOVED from `engine/.venv` (and the Material Trials one from `physics-shorts-research/.venv`) in 2026-11 and works because `pyvenv.cfg home=` points at the base interpreter; but the `Scripts\*.exe` shims (pip etc.) embed the old paths, so use `python -m pip ...`. On a new machine recreate them. Neither is tracked (`.venv/` is gitignored). **No requirements file exists for
either**; the lists below are the recipe (they are the packages the remaining channels import, with versions from the working venv).

### 4a. Repo-root `.venv` (shared by Hidden Everyday Systems and Etcherr871; moved from `engine/.venv`)

Original: Python 3.13.11 from `C:\ProgramData\miniconda3` (`python -m venv H:\Projects\YTtechnews\engine\.venv`). Any CPython 3.13 works. Create and install:

```powershell
cd H:\Projects\YTtechnews
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
# core imports of HES (pipeline, visual-system, 3D tools, release scripts) and Etcherr871 (mc/, clips.py)
.\.venv\Scripts\python.exe -m pip install pillow==12.3.0 numpy==2.5.1 scipy==1.18.0 soundfile==0.14.0 opencv-python-headless==5.0.0.93 matplotlib==3.11.1 httpx==0.28.1 requests==2.32.3 `
    faster-whisper==1.2.1 pyloudnorm==0.2.0 tzdata==2026.3 pytest==9.1.1 python-dotenv==1.0.1
```

Why these: HES scripts import `PIL`, `numpy`, `scipy`, `soundfile`, `cv2`, `matplotlib`, `faster_whisper` (ASR word timing and round trips), `bpy`/`bmesh`/`mathutils` (only inside Blender); Etcherr871 imports `PIL`, `cv2`, `httpx`;
`tzdata` is required for `zoneinfo` (`Africa/Casablanca`) on Windows; `pyloudnorm` backs loudness checks. `faster-whisper` pulls `ctranslate2 4.8.1`, `av 18.0.0`, `onnxruntime 1.28.0`, `tokenizers 0.22.2`, `huggingface_hub 0.36.2`
(small.en runs on CPU int8; the first run downloads the model). The HES TTS client itself is stdlib only (`urllib`). The dots.tts packages (`dots_tts`, torch) live **inside the Docker image**, not in this venv.
CLI tools alongside (installed system-wide here, not in the venv): `yt-dlp`, `gallery-dl`, `ffmpeg`.

The old `engine/.venv` was a superset because the technews engine shared it. Its full freeze (147 packages, kept so an exact replica of the original is possible): aiohappyeyeballs 2.7.1, aiohttp 3.14.3, aiosignal 1.4.0, alembic 1.14.0,
annotated-types 0.8.0, antlr4-python3-runtime 4.9.3, anyio 4.14.2, APScheduler 3.10.4, asteroid-filterbanks 0.4.0, attrs 26.1.0, av 18.0.0, babel 2.18.0, certifi 2026.7.22, cffi 2.1.0, charset-normalizer 3.4.9, click 8.4.2, colorama 0.4.6,
colorlog 6.12.0, contourpy 1.3.3, courlan 1.4.0, ctranslate2 4.8.1, cycler 0.12.1, dateparser 1.4.1, defusedxml 0.7.1, einops 0.8.2, fastapi 0.115.6, faster-whisper 1.2.1, feedparser 6.0.11, filelock 3.32.0, flatbuffers 25.12.19,
fonttools 4.63.0, frozenlist 1.8.0, fsspec 2026.6.0, googleapis-common-protos 1.75.0, greenlet 3.5.4, grpcio 1.83.0, h11 0.16.0, htmldate 1.10.0, httpcore 1.0.9, httptools 0.8.0, httpx 0.28.1, huggingface_hub 0.36.2, idna 3.18,
iniconfig 2.3.0, Jinja2 3.1.6, joblib 1.5.3, julius 0.2.8, jusText 3.0.2, kiwisolver 1.5.0, lightning 2.6.5, lightning-utilities 0.15.3, lxml 6.1.1, lxml_html_clean 0.4.5, Mako 1.3.12, Markdown 3.10.3, markdown-it-py 4.2.0,
MarkupSafe 3.0.3, matplotlib 3.11.1, mdurl 0.1.2, mpmath 1.3.0, multidict 6.7.1, narwhals 2.24.0, networkx 3.6.1, nltk 3.10.0, numpy 2.5.1, omegaconf 2.3.1, onnxruntime 1.28.0, opencv-python-headless 5.0.0.93,
opentelemetry-* 1.44.0 (api, exporter-otlp, -common, -grpc, -http, proto, sdk; semantic-conventions 0.65b0), optuna 4.9.0, packaging 26.2, pandas 3.0.5, pillow 12.3.0, pluggy 1.6.0, primePy 1.3, propcache 0.5.2, protobuf 7.35.1,
psutil 6.1.1, pyannote-audio 4.0.7, pyannote-core 6.0.1, pyannote-database 6.1.1, pyannote-metrics 4.1, pyannote-pipeline 4.0.0, pyannoteai-sdk 0.4.0, pycparser 3.0, pydantic 2.13.4, pydantic_core 2.46.4, Pygments 2.20.0,
pyloudnorm 0.2.0, PyMuPDF 1.24.14, pyparsing 3.3.2, pytest 9.1.1, python-dateutil 2.9.0.post0, python-dotenv 1.0.1, python-multipart 0.0.20, pytorch-lightning 2.6.5, pytorch-metric-learning 2.9.0, pytz 2026.3.post1, PyYAML 6.0.3,
RapidFuzz 3.10.1, regex 2026.7.19, requests 2.32.3, rich 15.0.0, ruff 0.16.4, safetensors 0.8.0, scikit-learn 1.9.0, scipy 1.18.0, setuptools 83.0.0, sgmllib3k 1.0.0, six 1.17.0, sortedcontainers 2.4.0, soundfile 0.14.0, SQLAlchemy 2.0.51,
sqlmodel 0.0.22, sse-starlette 2.2.1, starlette 0.41.3, sympy 1.14.0, threadpoolctl 3.6.0, tld 0.13.2, tokenizers 0.22.2, torch 2.8.0+cu128, torch-audiomentations 0.12.0, torch_pitch_shift 1.2.5, torchaudio 2.8.0+cu128, torchcodec 0.7.0,
torchmetrics 1.9.0, torchvision 0.23.0, tqdm 4.69.1, trafilatura 1.12.2, transformers 4.57.6, typing-inspection 0.4.2, typing_extensions 4.16.0, tzdata 2026.3, tzlocal 5.4.4, urllib3 2.7.0, uvicorn 0.34.0, watchfiles 1.2.0,
websockets 16.1.1, whisperx 3.8.6, yarl 1.24.5. (torch/torchaudio come from `--index-url https://download.pytorch.org/whl/cu128`.) The technews engine's own list is `engine/requirements.txt` (fastapi 0.115.6, uvicorn 0.34.0,
sqlmodel 0.0.22, alembic 1.14.0, sse-starlette 2.2.1, feedparser 6.0.11, rapidfuzz 3.10.1, trafilatura 1.12.2, apscheduler 3.10.4, python-multipart 0.0.20, PyMuPDF 1.24.14, Pillow 10.4.0, torch/torchaudio 2.8.0, whisperx 3.8.6,
pyloudnorm 0.2.0, soundfile 0.14.0, psutil 6.1.1); the removed Textual TUI needed `textual>=0.58,<1.0` and `httpx>=0.27,<1.0`. Restore the engine with `git archive pre-skill-reduction engine console tui manifests few_shot_examples packages`.

### 4b. `material-trials/.venv` (Material Trials; moved from `physics-shorts-research/.venv`)

Original: Python 3.13.3 from `C:\Python313`. Recreate (Material Trials' docs, `engine/common.py` and `tools/register_weekly_task.ps1` now use `material-trials\.venv\Scripts\python.exe`):

```powershell
cd H:\Projects\YTtechnews\material-trials
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install taichi==1.7.4 warp-lang==1.17.0 numpy==2.5.3 scipy==1.18.1 pillow==12.3.0 soundfile==0.14.0 opencv-python-headless==5.0.0.93 `
    librosa==1.0.0 numba==0.67.0 llvmlite==0.49.0 scikit-learn==1.9.1 psutil==7.2.2 requests==2.34.2 py7zr==1.1.3 rich==15.0.0 Markdown==3.7 tzdata==2026.4
```
Full freeze (51): backports.zstd 1.7.0, brotli 1.2.0, certifi 2026.7.22, cffi 2.1.1, charset-normalizer 3.5.1, cloudpickle 3.1.2, colorama 0.4.6, decorator 5.3.1, dill 0.4.1, idna 3.20, inflate64 1.0.4, joblib 1.6.0, lazy-loader 0.6,
librosa 1.0.0, llvmlite 0.49.0, Markdown 3.7, markdown-it-py 4.2.0, mdurl 0.1.2, msgpack 1.2.2, multivolumefile 0.2.3, narwhals 2.26.0, numba 0.67.0, numpy 2.5.3, opencv-python-headless 5.0.0.93, packaging 26.3, pillow 12.3.0,
platformdirs 4.11.12, pooch 1.9.0, psutil 7.2.2, py7zr 1.1.3, pybcj 1.0.8, pycparser 3.0, pycryptodomex 3.23.0, Pygments 2.21.0, pyppmd 1.3.1, requests 2.34.2, rich 15.0.0, scikit-learn 1.9.1, scipy 1.18.1, soundfile 0.14.0, soxr 1.1.0,
taichi 1.7.4, texttable 1.7.0, threadpoolctl 3.7.0, typing_extensions 4.16.0, tzdata 2026.4, urllib3 2.8.0, warp-lang 1.17.0. (`bpy`/`bmesh`/`mathutils` come from Blender's own Python; the venv packages exist for `make_episode.py`, MPM, audio synthesis/QC and analysis. The purpose of `py7zr`, `warp-lang` and `librosa` was not traced.)

### 4c. Other Python

- **ambient channel:** scripts import `numpy`, `scipy`, `cv2`, `pymunk`, `soundfile` plus Blender's `bpy`; it has run from its own environment (state in `ambient-channel/HANDOFF.md`, files on `S:/ambient`). Reuse the shared `.venv` plus `pymunk`; confirm against `HANDOFF.md`.
- **ComfyUI** has its own `comfyui/venv` (section 10). **dots.tts / torch** run only in Docker.

## 5. Blender

- **Blender 5.2** at `C:\Program Files\Blender Foundation\Blender 5.2\` (the only version used: HES 3D, Material Trials, ambient). Material Trials reads override env `MT_BLENDER`. Blender's Python provides `bpy`.
  OptiX for Cycles needs the NVIDIA driver; EEVEE for the HES 3D track.
- HES 3D: all launches go through `blender_lock.run_blender` (`BLENDER.lock`); never two Blenders; never alongside the owner's own jobs. Materials/HDRI: Poly Haven and ambientCG (CC0).
- The optional Blender MCP add-on (interactive tools) requires Blender running with the add-on connected; not needed for batch pipelines.

## 6. `.env` keys (names only, never values; file is gitignored, copy from `.env.example`)

`.env.example` documents these (grouped by who reads them):

- **Used by the toolkit services:** `DOTS_TTS_MODEL` (`dots-studio/dots.tts-soar`), `DOTS_TTS_DEFAULT_VOICE`, `DOTS_TTS_PRECISION`, `DOTS_TTS_OPTIMIZE`, `DOTS_TTS_NUM_STEPS`, `DOTS_TTS_CHUNK_MAX_WORDS`, `DOTS_TTS_GUIDANCE_SCALE`,
  `DOTS_TTS_SPEAKER_SCALE`, `DOTS_TTS_SEED`, `VOICESTUDIO_API_KEY` (any random string; clients send it as Bearer; required for VoiceStudio) and optional `VOICESTUDIO_TAG`.
- **Only the removed technews engine/console/TUI read these** (needed only if you restore it): `DATABASE_URL`, `ENGINE_HOST_PORT`, `LOG_LEVEL`, `REGRESSION_WORKER_INTERVAL_SECONDS`, `RENDER_WORKER_INTERVAL_SECONDS`,
  `ORCHESTRATOR_TICK_SECONDS`, `DATA_DIR`, `INGESTION_INTERVAL_MINUTES`, `DISCORD_WEBHOOK_URL`, `OPENCODE_ZEN_API_KEY`, `GOOGLE_AI_STUDIO_API_KEY`, `ANTHROPIC_API_KEY`, `OLLAMA_CLOUD_API_KEY`, `LM_STUDIO_BASE_URL`,
  `OLLAMA_LOCAL_BASE_URL`, `TTS_BASE_URL`, `TTS_BACKEND` (must be `dots`), `MANIFESTS_DIR`, `DESIGN_TOKENS_DIR`, `RENDERER_DIR`, `FEW_SHOT_EXAMPLES_DIR`, `RENDER_SCRATCH_DIR`, `NODE_RENDER_TIMEOUT_SECONDS` (1800),
  `RENDER_MUX_TIMEOUT_SECONDS` (600), `HEALTH_MONITOR_INTERVAL_SECONDS`, `OMP_TASK_TIMEOUT_SECONDS`, `OMP_PROBE_TIMEOUT_SECONDS`, `TUI_ENGINE_URL`, `TUI_POLL_INTERVAL_SECONDS`, `BGM_LIBRARY_DIR`, `NARRATION_TEMPO` (1.2),
  `OUTPUT_DIR`, `RELEASE_TIMEZONE` (`Africa/Casablanca`), `RELEASE_CALENDAR_MONTHS_AHEAD` (2), `ENGINE_URL`, `NEXT_PUBLIC_ENGINE_URL`, `CORS_ALLOWED_ORIGINS`.
- **LLM provider keys:** none of the remaining channels needs one. The agent (Claude Code or equivalent) is the review/writing layer; pipelines hand packets to files, they never call a model API (`agent-principles.md`).
  `OPENCODE_ZEN_API_KEY` is required only to run the restored technews engine (scorer/scriptwriter/editor/fact-checker); `GOOGLE_AI_STUDIO_API_KEY`, `ANTHROPIC_API_KEY`, `OLLAMA_CLOUD_API_KEY` (and local `LM_STUDIO_BASE_URL`,
  `OLLAMA_LOCAL_BASE_URL`) are optional alternates. A local `.env` may also hold `OPENROUTER_API_KEY` and `AWS_BEARER_TOKEN`, which `.env.example` does not document and nothing reviewed here reads. Never print, copy, or commit values.
- **Discord webhook** (`DISCORD_WEBHOOK_URL`): optional technews notifications; blank means none are sent.

## 7. Env vars read by code but missing from `.env.example`

`HIDDEN_SYSTEMS_TTS_PROVIDER` (`omnivoice` default | `dots`), `HIDDEN_SYSTEMS_TTS_BASE_URL` (default `http://localhost:8005`), `HIDDEN_SYSTEMS_TTS_SEED` (compose default 40000002), `VOICESTUDIO_URL` (HES, default
`http://127.0.0.1:3900`), `VOICESTUDIO_BASE_URL` (`vs_client.py`), `DOTS_TTS_CHUNK_GAP_MS` (40), `DOTS_TTS_BOUNDARY_PADDING_MS` (100), `DOTS_TTS_MAX_GENERATE_LENGTH` (500), `DOTS_TTS_NORMALIZE_TEXT` (0), `DOTS_TTS_VOICE_ID`/
`DOTS_TTS_REFERENCE_AUDIO`/`DOTS_TTS_REFERENCE_TEXT` (set per service in compose), `MT_BLENDER`, `RCU_PORT` (release-catalog helper, default 47831), `OX_PROXY_PORT` (1235), `OX_PROXY_OMP_BIN`, `OX_PROXY_TIMEOUT_MS`,
`OX_PROXY_LOG`, `COMPOSE_PROJECT_NAME` (set it, see section 2).

## 8. GPU etiquette (one heavy job at a time)

dots.tts `tts` / `tts-hidden`, VoiceStudio, ComfyUI, Blender (Cycles, EEVEE, MPM), WhisperX, chat-stories' `hs-chat-tts` container and the owner's own `S:/ambient` jobs all want most of the 16 GB. Check `nvidia-smi` first; do not
terminate unknown processes or containers (ask), do not restart the VoiceStudio container yourself, ban IndexTTS 2.5 (OOM-kills the container on this 15 GB host), use lock files (`BLENDER.lock`, `VOICE.lock`), stop what you started when done
(`docker compose stop ...`, `POST /system/flush-memory` on VoiceStudio), and keep the weekly Material Trials task's `IgnoreNew` policy so two builds never collide. A shared GPU slows narration by about 5-10x.

## 9. Cold start and slow things (not hung)

- **dots.tts first boot** downloads the **~4.8 GB** SOAR checkpoint into the `tts_model_cache` volume; compose health `start_period: 600 s`, interval 15 s, 5 retries. Watch `docker compose logs -f tts`. Exit 137 = memory pressure.
- VoiceStudio: image about 17 GB; each engine's first call loads weights (minutes). faster-whisper downloads `small.en` on first use (about 0.5 GB). A 600-second TTS start is normal, a 900-second request timeout is a failure bound only.
- Remotion: first bundle is slow; keep concurrency modest on a shared machine (renderer default 4).

## 10. ComfyUI (archived; reprovisioning notes)

ComfyUI (with FLUX.1-schnell-fp8) generated HES's earlier art atlas; HES v2/v3 moved to code-drawn SVG, reviewed stills and Blender, so it is archived and not part of the live pipelines. If you need it again: clone ComfyUI, create a venv
against a local Python 3.12 (`python -m venv comfyui/venv`, `pip install -r requirements.txt`), download `flux1-schnell-fp8.safetensors` (Apache-2.0, `black-forest-labs/FLUX.1-schnell`) into `models/checkpoints/`, and run
`comfyui\venv\Scripts\python.exe main.py --listen 127.0.0.1 --port 8188 --disable-auto-launch`. Approx. 21 GB, gitignored, not a compose service. The old venv's `pyvenv.cfg` base interpreter pointed into StabilityMatrix
(`F:\StabilityMatrix-win-x64\Data\Assets\Python\cpython-3.12.11-...`), so it was never truly self-contained. Port 8188 has been squatted by an unrelated WSL process: check `Get-NetTCPConnection -LocalPort 8188` and never kill unknown PIDs
(use another `--port`). Never run it alongside dots.tts.

## 11. `tools/` helpers (outside the toolkit; one line each)

- `ai-video-factory/toolkit/tools/fetch_reference.py`: dev/critic-time fetcher: `python ai-video-factory/toolkit/tools/fetch_reference.py <video_url_or_id> [--out DIR] [--frames N]` pulls a real YouTube video's transcript and evenly spaced keyframes (<= 480p) so a reviewer inspects real
  reference material instead of an imagined one; needs `yt-dlp` and ffmpeg on PATH; never part of production.
- (removed from the tree, in git tag `pre-skill-reduction`) `tools/omp_token_sync.py`: syncs auth tokens from the `omp` agent database (`~/.omp/agent/agent.db`) into the repo `.env` for the technews engine; touches secrets, technews-engine only.
- (removed, in the tag) `tools/ox_handoff_proxy.mjs`: OpenAI-compatible shim (default port 1235) forwarding the technews engine's LLM calls to the host `omp` CLI (GET `/v1/models`, POST `/v1/chat/completions`); engine-only.
- `tools/voicestudio/`: bundled in `toolkit/voicestudio/` (see `voice-tts.md`).
These live in the working tree only until the reduction removes them; recover with `git archive pre-skill-reduction tools` if needed.

## 12. Contradictions and open questions

- ONBOARDING said a root `engine.venv` or `engine/.venv` is "the" Python; the brief moves it to `<repo>/.venv`. Until the move happens the live venvs are `engine\.venv` (HES scripts and Etcherr871's README hard-code
  `engine\.venv\Scripts\python.exe`), a stray root `engine.venv` (gitignored duplicate) and `physics-shorts-research\.venv`. The scripts/docs in the kept channels were repointed on 2026-11-01.
- The `C:\bin\ffmpeg.exe` path is hard-coded in code, not discovered; moving machines means editing constants.
- No requirements files exist for HES, Etcherr871, Material Trials or ambient; the lists above are reconstructed from imports plus the working venv and may omit a lazily imported package (run each channel's `validate`/`doctor`/`status` command after building a venv).
- Python version: Dockerfile 3.12, host venvs 3.13.11 and 3.13.3, ComfyUI 3.12.11.
- Docker, the TTS containers and the GPU job state were not running when this was written; GPU memory, compose project/volume names and service health are unverified.
