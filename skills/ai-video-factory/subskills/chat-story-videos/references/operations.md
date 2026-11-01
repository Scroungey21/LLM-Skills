# Operations: setup, MCP tools, CLI, services, env vars

Contents: 1 Layout · 2 Setup · 3 MCP server chat-sim (tools and arguments) · 4 CLI · 5 Services and GPU etiquette · 6 Check and helper scripts · 7 Environment variables · 8 Typical sessions · 9 Cache and clean-up

Everything below is relative to `<repo>\hidden-everyday-systems\chat-stories\` unless stated. Windows machine; ffmpeg/ffprobe at `C:\bin\` (override `FFMPEG`/`FFPROBE`). Verified 2026-11-01: Node 22.15.1, `simulator/dist` built, Python with librosa/soundfile/numpy present,
`chat_list_apps` and `chat_validate_script` answered through the live MCP server.

## 1. Layout
```
chat-stories/
  simulator/   Vite + Preact simulator (index.html editor, render.html headless harness)   dist/ is the build output (gitignored)
  engine/      renderer.mjs story.mjs tts.mjs tts-voicestudio.mjs service.mjs paths.mjs wav.mjs static-server.mjs cli.mjs + check-*.{py,mjs}, measure_bed.py
  mcp/         server.mjs (stdio MCP "chat-sim"), smoke-test.mjs
  voices/      selected/ (the 2 voices), audition + scoring scripts, voicestudio/ lab, page/ (audition pages)
  tts-service/ server.py + start.ps1 (dots.tts container hs-chat-tts :8006)
  music/ sfx/ memes/  libraries + fetch/make scripts       examples/  12 story JSONs + make_funny_stories.py
  cache/       (gitignored) tts takes, logs, smoke tests     pages/style-picker/  picker page with F1-F6/S1-S4 clips
  README.md  PROVENANCE.md  package.json (deps: playwright-core, preact, zod, @modelcontextprotocol/sdk, vite, vitest, ...)
```
Outputs: `hidden-everyday-systems/output/chat-stories/<slug>/` (12 builds present: demo-plant-sitter, f1-f6, s1-s4, f2-rooster, plus `voicestudio-lab`). Ownership: this directory belongs to the HES agent conversation (CLAUDE.md); do not edit it from another channel.

## 2. Setup
```powershell
cd <repo>\hidden-everyday-systems\chat-stories
npm install
npm run build        # builds simulator/dist (required by engine + MCP)   | npm test = 15 simulator tests | npm run typecheck
node mcp/smoke-test.mjs          # add --build for a full story build (minutes)
```
Browser: the installed Edge or Chrome is used headless (playwright-core, no download). Python for scoring scripts: `$env:PYTHON` or `python` with librosa, numpy, soundfile, faster-whisper (CUDA DLL path is borrowed from the study venv
`research-output/chat-story-study/tts/envs/kokoro/Lib/site-packages/torch/lib` if present - git-ignored; recreate or edit `voices/prosody_score.py` if it is gone).

## 3. MCP server `chat-sim` (registered in `hidden-everyday-systems/.mcp.json`, absolute path, env `CHAT_STORIES_TTS_BASE_URL=http://localhost:8006`)
Sessions opened in `hidden-everyday-systems/` pick it up (approve when prompted); **a session in another directory will not see it** - copy the entry to that directory's `.mcp.json`. Script arguments accept `script` (object) or `path` (JSON file: script, bundle or story).
| tool | arguments (defaults) | does |
|---|---|---|
| `chat_list_apps` | none | skins, canvases, pixel ratios, support flags, max chars |
| `chat_default_script` | `app` (imessage/whatsapp/messenger/discord/snapchat/google-messages/roblox) | blank valid script (actors me + contact) |
| `chat_validate_script` | `script` or `path` | `{ok, script}` or `{ok:false, errors}` |
| `chat_timeline` | `script` or `path` | simulator typing-speed timeline (`messageAt`, typing starts, duration) - NOT audio-timed |
| `chat_render_png` | `script|path`, `out`, `t` (ms or `"all"`, default all), `full` false, `canvasIndex` 0, `frameHeight`, `scale`, `transparent` false, `cornerRadius` 0, `assets` | PNG at the skin's native pixel ratio |
| `tts_status` | `backend` (voicestudio default | dots) | model info + contract check; **starts the shared VoiceStudio container if it is down** |
| `tts_service` | `action` status/start/stop (status), `backend` | start/stop VoiceStudio or `hs-chat-tts` |
| `tts_synthesize` | `text`, `voice` chat-male/chat-female (chat-male), `seed` 40000002, `retries` 0-8 (2), `out`, `backend` | one cached, cadence-gated take; copies to `out` |
| `story_plan` | `story|path`, `synthesize` false | normalisation + reveal schedule + timed script (no render) |
| `story_build` | `story|path`, `out`, `skipTts` false | full build (minutes); writes mp4, dialogue.wav, mix.wav, timed-script.json, build.json, description.txt; uploads nothing |
| `story_template` | `app` imessage, `out` | documented story skeleton |
| `editor_url` | none | localhost URL of the editor (Bundle JSON import/export) |
Tool results are JSON text; errors return `isError` with the stack. `chat_list_apps`/`chat_validate_script`/`chat_default_script`/`chat_render_png` need only the browser (no GPU); the `tts_*`/`story_*` tools use the voice service.

## 4. CLI (same engine; `shutdown()` closes the browser)
```powershell
node engine/cli.mjs build examples/plant-sitter.story.json --out ..\output\chat-stories\demo-plant-sitter     # [--skip-tts] silent preview with estimated timing
node engine/cli.mjs png examples/s2-sunday-at-nine.story.json out\s2-all.png --t all --full               # --t <ms>|all, --canvas N
node engine/cli.mjs apps | tts-info | say "Reply." --seed 40000002
```
Defaults: output dir `output/chat-stories/<slug>/`; backend `voicestudio` unless `voice.backend` / `CHAT_STORIES_TTS_BACKEND`.

## 5. Services and GPU etiquette (16 GB card shared with VoiceStudio, Blender, S:/ambient jobs)
- **VoiceStudio** (default voice backend): `docker compose --profile voicestudio ...` (see [voice-tts.md](../../../references/voice-tts.md) section 5/7 for the exact current command with `--env-file` and `COMPOSE_PROJECT_NAME=yttechnews`); API key in repo-root `.env` (`VOICESTUDIO_API_KEY`). Never restart the container yourself except via the engine's single CUDA-fault retry; IndexTTS banned; one client at a time.
- **dots chat service**: `powershell -File tts-service\start.ps1` / `-Stop`; container `hs-chat-tts`, port 8006, ~6 GB VRAM, `--restart no`, image `yttechnews-tts-hidden`; never run beside `tts` or `tts-hidden`.
- Check `nvidia-smi` first; stop what you started when done (`tts_service stop`). Do not touch the owner's jobs ([environment-setup.md](../../../references/environment-setup.md) section 8).
- Offline re-render from cache: `CHAT_TTS_OFFLINE=1` (requires the model-info snapshot saved by a previous online run; any missing take fails).
- **Current breakage** of service start-up after the 2026-11-01 reduction: `references/current-state.md` section 2.

## 6. Check and helper scripts
`engine/check-spoken.mjs`, `check-pauses.py`, `check-word-gaps.py`, `check-sync.py`, `check-scroll.mjs`, `check-edit.py`, `measure_bed.py` (usage and thresholds: `qa-policy-metadata.md` section 1).
Voices: `voices/{dots_audition,gen_refs,analyze,expressive_test,reverb,score_demos,score_build,select_female,verify_selected,prosody_score,tighten_gaps,build_page}.py`, `voices/voicestudio/{run_experiment,mine_lines,build_lab_page}.py|run_index.ps1` (`voices.md` section 8).
Assets: `sfx/{make_sfx,make_comedy_sfx,make_meme_sfx,make_meme_clips_lib,fetch_meme_clips}.py|make_voice_memes.mjs`, `memes/fetch_meme_images.py`, `music/add_tracks_2026-10-03.py`. Stories: `examples/make_funny_stories.py` (regenerates f1-f6).
Rebuild-all precedent: `cache/rebuild-demos.ps1`.

## 7. Environment variables read by the code
`CHAT_STORIES_CACHE`, `CHAT_STORIES_OUTPUT`, `FFMPEG`, `FFPROBE`, `PYTHON`, `DOCKER`, `CHAT_STORIES_TTS_BASE_URL` (default http://localhost:8006), `CHAT_STORIES_VOICE_ID` (default chat-male), `CHAT_STORIES_TTS_BACKEND` (voicestudio|dots), `CHAT_STORIES_VS_ENGINE` (omnivoice),
`VOICESTUDIO_BASE_URL` (http://127.0.0.1:3900), `VOICESTUDIO_API_KEY` (or repo-root `.env`), `CHAT_TTS_OFFLINE=1`, `DOTS_TTS_SEED` (service). **No env override exists for the gameplay directory** (`GAMEPLAY_DIR` is a constant in `paths.mjs`).
None is documented in `.env.example`; mention them in the shared environment doc when you next update it.

## 8. Typical sessions
1. New story: `story_template` (app) -> write the story -> `chat_validate_script` -> `check-spoken.mjs` -> `chat_render_png t=all` -> `story_plan` -> `story_build` -> check scripts -> frames + listen -> owner review.
2. Re-time only: edit `timing`/`pauseBeforeMs` -> rebuild; takes come from the cache (same text/voice/seed), so it is fast.
3. Change one line: its take re-synthesizes; the schedule shifts for later lines.
4. Silent layout preview: `build --skip-tts` (estimated timing; do not publish).
5. Audition a voice line: `tts_synthesize` with a `seed`; compare seeds; the cache key includes text + seed + reference hash.

## 9. Cache and clean-up
`cache/tts/*.wav|json` (takes; keyed by backend/engine/version/text/voice/seed/reference hash), `cache/tts/tight/`, `cache/tts/fx/`, `cache/*.log`, `cache/smoke|test`, `cache/pages/style-picker/media/*.mp4` (picker demo clips, ~80 MB). Safe to delete only the cache you
regenerate by rebuilding; a deleted take costs GPU time to recreate. The model-info snapshot (`cache/tts/model-info.*.json`) is what makes `CHAT_TTS_OFFLINE` work - keep it.
