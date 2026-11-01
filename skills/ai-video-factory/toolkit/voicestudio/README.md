# VoiceStudio (optional shared voice lab)

[VoiceStudio](https://github.com/debpalash/VoiceStudio) (AGPL-3.0) is a local voice-cloning / voice-design / expressive TTS
workbench with a REST API, a WebSocket stream and a web UI. Installed 2026-09-27 as an **optional tool any channel can use**.
It does not replace or remove anything: dots.tts SOAR stays each channel's reviewed narration backend, and a channel adopts
VoiceStudio output only through its own pipeline docs.

## Run it

```powershell
docker compose --profile voicestudio up -d voicestudio      # image ghcr.io/debpalash/voicestudio:0.5.6 (~17 GB)
docker compose --profile voicestudio stop voicestudio
```

- API + web UI: http://127.0.0.1:3900 (loopback only). Health: `GET /health`, OpenAPI: `GET /openapi.json`.
- Auth: `VOICESTUDIO_API_KEY` from the repo-root `.env` (Bearer token). `.env.example` documents it.
- Data lives in the Docker volumes `voicestudio_data` (profiles, settings, sidecar engines under `/root/.omnivoice`) and
  `voicestudio_hf_cache` (model weights). Nothing is written into the repo.
- **GPU is shared** with `tts` / `tts-hidden` / chat-stories' `hs-chat-tts` (16 GB card). Check `nvidia-smi` first; stop
  VoiceStudio when done. `POST /system/flush-memory` unloads models without stopping the container.

## Engines installed here

| Engine id | What it is | Licence (model) | Notes |
|---|---|---|---|
| `omnivoice` | k2-fsa/OmniVoice, default engine: cloning, voice design from attributes, non-verbal tags (`[sigh]`, `[laughter]`, `[surprise-oh]`, `[pause 500ms]` ...) | see HF card | bundled, 3.3 GB weights |
| `voxcpm2` | openbmb/VoxCPM2: cloning, voice design, instruction prefix for delivery | see HF card | sidecar venv |
| `indextts2` | IndexTTS 2.5: cloning + emotion control (`emo_text`, 8-value `emo_vector`, `emo_alpha`) | bilibili model licence (extra licence above 100M MAU / RMB 1B revenue) | sidecar venv, 5.5 GB weights |

Not installed (available in the catalogue): CosyVoice 3, MOSS-TTS, GPT-SoVITS, Supertonic, PocketTTS, dots.tts, ...
Never install Kokoro or Qwen3-TTS voices for the chat-story voices (user preference).

**Installing more engines:** sidecar installs are gated to requests from the container's own loopback, so run them
from inside it: `docker exec <container> curl -s -X POST -H "Authorization: Bearer $OMNIVOICE_API_KEY" -H 'Content-Type: application/json' -d '{}' http://127.0.0.1:3900/engines/sidecar/<engine_id>/install`
then poll `GET /engines/sidecar/<engine_id>/install/status`. Run one install at a time (parallel installs fight over the
uv cache lock and fail). Model-only installs: `POST /models/install {"repo_id": "..."}`.

## Using it from a pipeline

`tools/voicestudio/vs_client.py` (stdlib; `websockets` only for the stream call):

```python
import sys; sys.path.insert(0, 'tools/voicestudio')
from vs_client import VoiceStudio
vs = VoiceStudio()
wav = vs.generate("Line.", engine="omnivoice", ref_audio="ref.wav", ref_text="ref transcript", seed=1)   # effect_preset='raw'
wav = vs.generate("Line.", engine="voxcpm2", profile_id="<id>", instruct="shouting, furious")          # delivery instruction
wav = vs.stream_tts("Line.", engine="indextts2", voice="<profile id>", emo_text="devastated, crying", emo_alpha=0.7)
```

- `POST /generate` (multipart): `text, engine, ref_audio|profile_id, ref_text, instruct, seed, effect_preset, ...`.
  The client defaults `effect_preset="raw"`; VoiceStudio's own default is `broadcast` (compression/EQ).
- `WS /ws/tts`: the only public route that forwards IndexTTS emotion fields; voice = a saved profile id.
- `POST /profiles` (multipart): `kind=clone` + `ref_audio` + `ref_text` makes a reusable voice profile.
- `POST /design/describe {"description": "..."}` turns free text into OmniVoice design attributes/instruct.

CLI: `python tools/voicestudio/vs_client.py health|engines|models|install <repo_id>`.

## Known issues (0.5.6)

- A generate call can hang ~300 s on an internal lock ("abandoned after 300s ... waiting on an internal lock") while a
  sidecar install runs; restart the container after installs.
- The first call to an engine loads its weights (minutes on a shared GPU).

## Who uses it

- Hidden Everyday Systems / chat stories: naturalness experiment for dramatic character lines,
  `hidden-everyday-systems/chat-stories/voices/voicestudio/`.
