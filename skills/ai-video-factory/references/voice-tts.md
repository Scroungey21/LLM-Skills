# Voice and TTS (narration backends, voices, review discipline)

Scope: every channel that speaks. Only **technews** and **Hidden Everyday Systems (HES / GhostSystem)** narrate. Material Trials,
Etcherr871 and the ambient channel have no narration (their docs say so; ambient's audit says "recommend ignore"), so they
need none of this file except the GPU rule.

Contents: 1 Backends at a glance · 2 dots.tts SOAR contract · 3 Voices and provenance · 4 Cadence gate, seed retry, cache,
word timing · 5 Compose services, GPU rule, bring-up from `toolkit/` · 6 Voice audition and review discipline ·
7 VoiceStudio · 8 HES 3D voice split · 9 Legacy backends rejected · 10 Contradictions and open questions

## 1. Backends at a glance

| Backend | Used by | Status |
|---|---|---|
| **dots.tts SOAR** (`dots-studio/dots.tts-soar`, Docker, `toolkit/tts-dots/`) | technews (service `tts`, :8004); HES 2D pipeline (service `tts-hidden`, :8005) | The reviewed, reproducible baseline. Repo docs call it "the only narration backend". |
| **OmniVoice via VoiceStudio** (:3900) | HES: default provider of `hidden_systems_production.py` since 2026-10-05; HES 3D daily Shorts (voice "o1") | Owner decision after a full-video A/B: "infinitely better" than dots.tts. dots.tts remains selectable with `HIDDEN_SYSTEMS_TTS_PROVIDER=dots`. |
| **VoxCPM2 via VoiceStudio** | HES 3D long-form (voice "vm5", Apache-2.0) | Owner decision 2026-10-12/18: prefer a commercial-licence engine for longs. |
| Kokoro, Chatterbox, Qwen3-TTS, IndexTTS 2.5 | nobody | Rejected, see section 9. |

Rule of thumb: use dots.tts when reproducibility, a fail-closed server and measured gates matter (technews, anything new that has no
owner-chosen voice yet). Use the HES voice split only for HES. Never mix two voices inside one video: the cache key includes the
engine and reference so a provider switch re-narrates every scene (this is deliberate).

## 2. dots.tts SOAR contract (what `toolkit/tts-dots/server.py` enforces)

- **Model:** `dots-studio/dots.tts-soar` via PyPI `dots.tts==0.3.1` (Dockerfile pin), torch/torchaudio 2.8.0 on CUDA 12.8, Transformers
  4.57.0, gradio 6.17.3 (upstream asked for 6.17.0, which was never published; 6.17.3 is the earliest patch in the same line).
  Image base `nvidia/cuda:12.8.1-cudnn-runtime-ubuntu24.04`, Python 3.12. Pin the stack so a rebuild cannot silently change numerics.
  Constraints live in `toolkit/tts-dots/constraints-recommended.txt`.
- **Sampling defaults (env, validated at start-up):** BF16; `DOTS_TTS_NUM_STEPS=16` (allowed 10..32, official SOAR range); Euler ODE;
  `DOTS_TTS_GUIDANCE_SCALE=1.2` (0.5..2.0); `DOTS_TTS_SPEAKER_SCALE=1.5` (request range 0.5..2.5); `DOTS_TTS_OPTIMIZE=0`;
  `DOTS_TTS_MAX_GENERATE_LENGTH=500` patches (about 8 s of audio, the hard ceiling that forces chunking); text limit 4000 chars.
  Change parameters only after punctuation/text/chunking fixes failed, and keep them deterministic so comparisons stay meaningful.
- **Output:** dry 48 kHz mono PCM24 WAV. No reverb, enhancement, denoising, pitch shift, tempo stretch or loudness effect inside the
  service. Reason: delivery pace must come from the reference performance plus punctuation, never from post-processing.
- **Chunking:** `_generation_chunks` splits at sentence/clause boundaries (`[.!?;:]` + whitespace) and packs units across sentence
  boundaries up to `DOTS_TTS_CHUNK_MAX_WORDS`, then hard-splits words as a last resort. Chunks are joined with `DOTS_TTS_CHUNK_GAP_MS=40`
  of silence. **Current value is 56 words** in `docker-compose.yml`, `.env.example` and the code default. Why packing: resetting the
  model every 8-12 words made every sentence sound like a standalone announcement and destroyed the pace learned from the reference.
  Why a cap at all: SOAR's 500-patch ceiling truncates long scenes. History: the HES handoff (2026-09-01) cut it 18 to 12 after the
  toilet `flush-hook` came out at 93 WPM; later work raised it again. The 12-word figure is stale (see section 10). If a scene truncates or
  rushes, check `chunk_max_words` in `/api/model-info`, shorten the sentence first, and only then test a smaller cap.
- **Boundary trim:** `_trim_boundary_silence` removes model-added head/tail silence but keeps `DOTS_TTS_BOUNDARY_PADDING_MS=100` ms each side
  (envelope threshold = 1 % of peak, 20 ms frames). Samples inside speech are never resampled, stretched, filtered or normalised.
- **Tail sentinel (fix of 2026-09-04):** SOAR treats every call as a complete utterance and rushes/under-articulates the last word. The
  server appends `" ..."` to a chunk ending in terminal punctuation and `","` to a force-split chunk, so the model gets runway; the trim
  then removes the extra silence. Measured: "...same wider grid." decayed from peak to below -25 dB in about 50 ms without it, versus
  about 150 ms natural decay with it. It shifts the whole seed trajectory, so it is applied unconditionally and **there is deliberately
  no automated per-take tail accept/reject gate** (one was tried and removed: false rejections). `X-TTS-Trim-Tail-Ms` and
  `X-TTS-Tail-Silence-Ms` are diagnostic only, kept in the sidecar for a human to read. `debug_skip_sentinel` / `debug_disable_trim`
  request flags exist for A/B calibration only; production never sends them.
- **Endpoints:**
  - `GET /api/model-info` returns `backend: "dots.tts"`, `model`, `voice`, `reference_sha256`, `sample_rate: 48000`, `precision`, `num_steps`,
    `guidance_scale`, `speaker_scale`, `chunk_max_words`, `native_pacing: true`, `post_generation_speedup: false`,
    `boundary_silence_trim: true`, `audio_effects: []`, and `package_version` (a hard-coded `"0.4.0"` string, not the installed version).
    503 while loading. This is also the compose health check, so clients can reject a stale/legacy service on the same port.
  - `POST /tts` body: `text` (1..4000), `voice_id` (must equal the service's one configured voice, else 422), `language` (`EN`), `seed`
    (default `DOTS_TTS_SEED`), optional `num_steps`/`guidance_scale`/`speaker_scale`, `delivery` (accepted, **ignored** by the server).
    One request at a time (a generation lock); a long scene takes minutes, so client timeout is 900 s (a failure timeout, not a speed target).
  - Response headers clients must verify: `X-TTS-Backend: dots.tts`, `X-TTS-Native-Pacing: true`, `X-TTS-Post-Speedup: false`; also
    `X-TTS-Seed`, `X-TTS-RTF`, `X-TTS-Chunks`, `X-TTS-Trim-Head-Ms`, `X-TTS-Trim-Tail-Ms`, `X-TTS-Head-Silence-Ms`, `X-TTS-Tail-Silence-Ms`,
    `X-TTS-Raw-Duration-Ms`, `X-TTS-Trimmed-Duration-Ms`. A client that sees any other backend must fail, never fall back silently.
- **Service-level vs pipeline-level pacing (technews):** the service never speeds audio up. technews' own audio pipeline then applies a
  pitch-preserving FFmpeg `atempo=NARRATION_TEMPO` (code default 1.2, valid 0.5..2.0) and remaps scene bounds from measured pre/post-tempo
  durations. These are two layers, not a contradiction. HES forbids the second layer entirely (section 4).
- `toolkit/tts-dots/tts-config.yaml` (and the old `tts-config/config.yaml`) is **inert**: `server.py` reads only environment variables.
  `analyze_candidates.py` (autocorrelation F0 over candidate WAVs; has a hard-coded `technews/output/voice-candidates` path) and
  `bootstrap_voice_candidates.py` (generates default-speaker candidate references, no cloning prompt, one per seed; run with
  `docker compose run --rm -v <hostdir>:/out tts python3.12 /app/bootstrap_voice_candidates.py`, and note the script is not COPY'd into the
  image, so bind-mount it too) are one-off audition tools, not production.

## 3. Voices and provenance (read before reusing or publishing)

Files in `toolkit/tts-dots/voices/`: `<voice>.wav` (reference), `<voice>.txt` (its **exact** transcript, used as `prompt_text`), and a
provenance JSON. Archive folders (`archive-*`) are kept, never deleted, never restored without an ASR round trip.

| Voice id | Compose service / port | Reference | Provenance as recorded |
|---|---|---|---|
| `warm-informational` | `tts` / 8004 (technews), seed 20260829 | 12.87 s, 48 kHz mono PCM24, clip 38.15-51.02 s of a third-party YouTube video | **A real, identifiable person's voice** from an unlicensed clip (channel Better Stack). Consent **not** obtained. Installed 2026-09-03 at the owner's explicit, informed direction after being told the impersonation, right-of-publicity, platform-policy and copyright risks. Risk notes are in `provenance.json`. ASR (faster-whisper small.en) matches the transcript verbatim. |
| `hidden-systems-informational` | `tts-hidden` / 8005 (HES), seed `HIDDEN_SYSTEMS_TTS_SEED` default 40000002 | 8.1 s, 24-bit PCM | User-supplied file (`cloned-warm-informational-v2.wav`), identical to technews' house voice **by design** (owner confirmed 2026-09-03: the two channels sound the same). Identity, licence and consent of the underlying recording were **not established**; if a rights question surfaces, review the original `reference-source-clip.wav` first. Checks recorded: ASR round trip exact; 3 clone-leak probes clean; F0 medians 141/135/170 Hz (male band 85-180 Hz); volumedetect mean -28.9 / max -11.0 dB; one natural 0.23 s pause; **no human listening review was performed by the recording agent**. |

Archived earlier references (do not restore): the first synthetic `warm-informational` (dots self-generated, 213.9 WPM, 11.5 s; superseded
2026-09-03); a corrupted `warm-informational` pair found 2026-09-01 (ASR returned garbage and cloning degenerated, see section 6);
the v1 HES self-generated voice.

Do not describe these voices as "synthetic and non-impersonating" in any public text: the provenance files say otherwise. For any new
channel: prefer a voice you can license or a genuinely synthetic default-speaker reference, record provenance as
`<voice-id>-provenance.json` (source, consent status, processing, ASR verification, risks), and state the pacing policy as a rule.

## 4. Cadence gate, seed retry, cache, word timing

**Native cadence gate (HES): accept a take only at 165-240 WPM.** WPM = script words (the pipeline's `normalized_words`) / measured speech
duration of the take, excluding padding and inter-scene gaps. A failed gate is a rejected take, never permission to stretch, resample,
pitch-shift or time-compress. Reference points: 16 words in 5.3 s = 181 WPM (good); 41 words in 11.5 s = 213.9 WPM (chosen reference);
36 words in 23.2 s = 93.2 WPM (rejected).

**Deterministic seed retry** (`dots_scene`): try `base_seed + offset` for offsets
`0, 97, 211, 509, 731, 1009, 1301, 1597, 1901, 2203, 2609, 3001, 3407, 3803, 4201, 4603` (16 takes; it was 4, then 5, then 10). Stop at the first
take inside the window; if all fail the scene fails closed (`No natural-cadence ... take passed`). Lesson attached to the list: when a *whole*
sweep clusters below the floor (pressure-cooker `s-hook`: 16 takes at 150-165 WPM, clustered near 155, because a colon and a comma made hook
delivery stretch both pauses), more seeds do not help. **Read the sentence and rewrite it into clean clauses.** A lone near-miss is what
extra candidates are for. Never adjust the gate or the audio to force a pass. Edit-for-speech tips: varied clauses, pronounceable acronyms,
clear punctuation, no colon-plus-comma hooks.

**Per-scene cache** (sidecar `<part>.words.json` next to each scene WAV) is stale, and the scene is regenerated, if any of these differ:
`voice_id`, `narration_sha256`, `reference_sha256`, `requested_base_seed` (the package's configured seed, not the winning candidate),
`tts_package_version` (so a server-side generation/trim fix invalidates old audio). Bare-list sidecars with no provenance are always stale.
The generator **refuses to run** if `/api/model-info` lacks `reference_sha256` (otherwise a swapped reference under the same voice id would
ship a mixed-voice video undetected). For OmniVoice the reference hash is `sha256(reference_wav + "|omnivoice|" + active_model)`.
Regenerate with `audio --force` after any voice/reference/chunking change; never hand-edit provenance or relabel cached audio.
(technews' own cache fingerprint: text, voice, model, steps, guidance, speaker scale, seed, chunk config.)

**Word timing, three modes (best first):**
1. WhisperX forced alignment on the final narration timeline (technews engine). Scenes and WhisperX segments are not one-to-one: assign by
   timestamps and scene bounds. If WhisperX drops/corrupts tokens, construct exact script-token timings inside each scene bound and keep the
   alignment in `needs_review` (low score). Unload the aligner and clear CUDA cache afterwards so VRAM returns to TTS.
2. HES: faster-whisper `small.en` (CPU, int8, word timestamps) aligned to the *script* words with `difflib.SequenceMatcher`; unmatched script
   words are interpolated between resolved neighbours; if match ratio < 0.75 or no words, fall back to 3.
3. Proportional (character-weighted) estimate inside the scene's measured duration. Approximate, never "forced alignment".
Forced alignment as a tempo-stretch partner is banned in HES; in HES the ASR timing exists only to place captions and cue words.

## 5. Compose services, GPU rule, bring-up from `toolkit/`

Services in `toolkit/docker-compose.yml` (byte-identical to the former repo-root file):

| Service | Profile | Host port | Voice / env | Notes |
|---|---|---|---|---|
| `tts` | none (starts on bare `up`) | 8004 | `warm-informational`, `DOTS_TTS_SEED=20260829` | technews |
| `tts-hidden` | `hidden-systems` | 8005 (container 8004) | `hidden-systems-informational`, seed `${HIDDEN_SYSTEMS_TTS_SEED:-40000002}` | HES |
| `voicestudio` | `voicestudio` | 127.0.0.1:3900 | `OMNIVOICE_API_KEY=${VOICESTUDIO_API_KEY}` | voice lab, section 7 |
| `engine`, `console` | none | 8000, 3000 | | **Dead from the toolkit**: they point at `engine/`, `console/` Dockerfiles and `./technews/output` that were removed. Never run a bare `docker compose up` from `toolkit/`; always name the service. |

Both TTS services mount `server.py` and `voices/` read-only (edit-without-rebuild during iteration; rebuild the image at the end so the baked
bytes match: `docker compose build tts`, then recheck `/api/model-info` and the reference SHA) and share the `tts_model_cache` volume
(`/root/.cache/huggingface`).

**GPU rule: one heavy GPU job at a time.** The machine has one 16 GB card (RTX 5060 Ti, about 14 GB free with the desktop up). `tts` and
`tts-hidden` each load a full SOAR instance, so **never run both**; the same goes for VoiceStudio, ComfyUI (archived), Blender/Cycles/MPM,
the owner's own jobs (e.g. `S:/ambient` renders) and chat-stories' `hs-chat-tts` container. Check `nvidia-smi` first, identify other GPU
processes, and never kill unknown ones: ask. Stop one before starting the other:
`docker compose stop tts` / `docker compose --profile hidden-systems stop tts-hidden`. Container exit 137 during model load means GPU-memory
pressure (inspect `nvidia-smi` and what else is loaded; an LM Studio model once caused it). Use `docker compose run --rm` / `docker run` for one-off
probes, as the brief prescribes, to avoid a later `up`/`--remove-orphans` reaping containers; the repo itself contains no text explaining that
reaping (unsourced, plausible compose behaviour), so verify before relying on it.

**Bring-up from the bundled toolkit (Windows PowerShell, from `ai-video-factory/toolkit/`):**

```powershell
# 1. env + project name. Compose reads .env from the project dir, which is toolkit/, not the repo root.
$env:COMPOSE_PROJECT_NAME = "yttechnews"      # reuse the existing named volumes/containers (yttechnews_tts_model_cache, yttechnews-voicestudio-1)
docker compose --env-file ..\..\.env --profile hidden-systems up -d tts-hidden     # HES voice   (or:  up -d tts   for technews)
docker compose ps tts-hidden ; docker compose logs -f tts-hidden                   # first boot downloads the ~4.8 GB checkpoint (health start_period 600 s)
Invoke-RestMethod http://localhost:8005/api/model-info | ConvertTo-Json -Depth 5    # port 8004 for `tts`
```

Why `COMPOSE_PROJECT_NAME`: Compose derives the project name from the directory. From `toolkit/` it would be `toolkit`, creating a new empty
`toolkit_tts_model_cache` volume and a fresh 4.8 GB download, and breaking `voice_lock.py` (it execs into `yttechnews-voicestudio-1`). This
was not verified against a running Docker (daemon off when written); check `docker volume ls` first. A fresh machine can use any name.
Expected `/api/model-info`: backend `dots.tts`, the right voice, `native_pacing` true, `post_generation_speedup` false, `reference_sha256`
present, `chunk_max_words` 56. Cold start is slow, not hung.

Toolkit caveats: scripts in the HES folder still default to `http://localhost:8005` (`HIDDEN_SYSTEMS_TTS_BASE_URL`), and a few error messages
say 8004 or "190-260 WPM": the live gate is 165-240 and the HES port is 8005 (wording bugs, not rules). HES's `HOUSE_REFERENCE` path points at
`ROOT/tts-dots/voices/hidden-systems-informational.wav`; it now points at `ai-video-factory/toolkit/tts-dots/voices/` (repointed 2026-11-01).

## 6. Voice audition and review discipline (before any voice becomes a house voice or a reference changes)

1. **Start the right service** and verify `/api/model-info` first.
2. **Native pacing gate:** audition on a hard line (the HES toilet `flush-hook` exposed prior failures) plus one dense technical scene. Accept only
   165-240 WPM, then **listen**. Objective metrics are diagnostic, not approval (`volumedetect`, `silencedetect=noise=-45dB:d=0.15`, ffprobe).
3. **ASR round trip:** transcribe the *reference wav* with faster-whisper (`small.en`, plus `medium.en` if in doubt); it must reproduce its own
   `.txt` word for word. Never promote a reference that fails (the 2026-09-01 corrupt reference transcribed as unintelligible garbage).
4. **Clone-degeneration probe:** generate 3+ takes (distinct seeds) on target sentences unrelated to the reference transcript, plus a trivial
   probe such as "Hello there.". ASR of every take must match its *target* exactly, with no leaked or echoed reference fragment (the broken
   reference produced 8.48 s of bled reference content and 0 target words), including no trailing-reference-word leak.
5. **F0 / register:** autocorrelation F0 median per take; confirm it sits in the intended band (reviewed male band 85-180 Hz) and, for a new
   channel that must sound different, distinct from the other channels' voices (this was a requirement for HES v1; HES later chose to share
   technews' voice on purpose, so distinctness is now a per-channel decision to state explicitly).
6. **Listening checks at fixed points:** the opening, every difficult proper noun/acronym/number, two chunk boundaries, a mid-video dense
   scene, the Short CTA, the ending. Reject: robotic cadence, crackle, metallic noise, dropped/repeated words, clipped endings, excessive
   pauses, inconsistent identity, audible chunk seams, echo/reverb, truncation.
7. **Record provenance** and the checks above in the voice's provenance JSON; if no human listened, say so in it (the HES file does).
   Human listening is still the final gate; a harness that cannot play audio must list it as outstanding, never as passed.
8. Rebuild the image after the final reference/config pass and recheck the reference SHA.

## 7. VoiceStudio (optional voice lab, shared by all channels)

[debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio), AGPL-3.0, image `ghcr.io/debpalash/voicestudio:${VOICESTUDIO_TAG:-0.5.6}`
(about 17 GB), service `voicestudio` behind the `voicestudio` profile (never starts on a bare `up`). API/UI at `http://127.0.0.1:3900`
(loopback only; `GET /health`, `GET /openapi.json`). Auth: `Authorization: Bearer $VOICESTUDIO_API_KEY` (set in the repo-root `.env`; generate
with `python -c "import secrets;print(secrets.token_urlsafe(32))"`; never print or commit it). Data lives in Docker volumes
`voicestudio_data` (profiles, settings, sidecar engines under `/root/.omnivoice`) and `voicestudio_hf_cache`; nothing is written into the repo.
Start/stop: `docker compose --env-file ..\..\.env --profile voicestudio up -d voicestudio` / `... stop voicestudio`. `POST /system/flush-memory` unloads
models without stopping the container. The first call to an engine loads its weights (minutes on a shared GPU).

| Engine id | What | Model licence | Notes |
|---|---|---|---|
| `omnivoice` | k2-fsa/OmniVoice, default: cloning, voice design, non-verbal tags (`[sigh]`, `[laughter]`, `[pause 500ms]`) | **CC-BY-NC (non-commercial)** per the owner's 2026-10-12 note and `PLAN-v2.md`; check the HF card before any monetised use | bundled, 3.3 GB |
| `voxcpm2` | openbmb/VoxCPM2: cloning, voice design, instruction prefix | Apache-2.0 | sidecar venv; **no speed control, silently drops `[pause]` markup**: insert pauses as silence afterwards |
| `indextts2` | IndexTTS 2.5: cloning + emotion (`emo_text`, `emo_vector`, `emo_alpha`) | bilibili licence (extra licence above 100M MAU / RMB 1B revenue) | **OOM-kills the container on this 15 GB host: never select it** |

Not installed: CosyVoice 3, MOSS-TTS, GPT-SoVITS, Supertonic, PocketTTS, dots.tts. Never install Kokoro or Qwen3-TTS voices (owner preference).
Install more engines from inside the container's own loopback (sidecar installs are gated):
`docker exec <container> curl -s -X POST -H "Authorization: Bearer $OMNIVOICE_API_KEY" -H 'Content-Type: application/json' -d '{}' http://127.0.0.1:3900/engines/sidecar/<engine_id>/install`,
then poll `GET /engines/sidecar/<engine_id>/install/status`; one install at a time (parallel installs fight over the uv cache lock); model-only:
`POST /models/install {"repo_id": "..."}`. Known issues (0.5.6): a generate call can hang about 300 s on an internal lock while a sidecar
install runs (restart the container after installs); simultaneous `/generate` calls corrupted takes (voice-v2 round 2), so run **one client at a time**.

**Client:** `toolkit/voicestudio/vs_client.py` (stdlib; `websockets` only for `stream_tts`):

```python
import sys; sys.path.insert(0, 'ai-video-factory/toolkit/voicestudio')
from vs_client import VoiceStudio
vs = VoiceStudio()                      # key from env VOICESTUDIO_API_KEY, else a .env file (see caveat); base URL env VOICESTUDIO_BASE_URL
wav = vs.generate("Line.", engine="omnivoice", ref_audio="ref.wav", ref_text="ref transcript", seed=1)   # effect_preset defaults to 'raw'
wav = vs.generate("Line.", engine="voxcpm2", profile_id="<id>", instruct="shouting, furious")
wav = vs.stream_tts("Line.", engine="indextts2", voice="<profile id>", emo_text="devastated, crying", emo_alpha=0.7)  # WS /ws/tts (IndexTTS emotion route)
```
CLI: `python vs_client.py health|engines|models|install <repo_id>|sidecar <engine_id>`. REST: `POST /generate` (multipart: `text, engine, ref_audio|profile_id,
ref_text, instruct, seed, effect_preset`); the client forces `effect_preset="raw"` because VoiceStudio's own default `broadcast` adds
compression/EQ (a hidden effect, contrary to the dry-narration rule). `POST /profiles` (`kind=clone`, `ref_audio`, `ref_text`) makes a reusable
voice profile; `POST /design/describe {"description": ...}` turns free text into OmniVoice design attributes; `GET/POST /engines/tts` and
`/engines/select {"family":"tts","backend_id":...}` read/switch the active engine.
**Note:** the bundled copy was patched (`REPO = parents[3]`) so its `.env` fallback finds the repo-root `.env`; exporting `VOICESTUDIO_API_KEY` in the shell also works.
`<repo>/.env`. Export `VOICESTUDIO_API_KEY` in the shell (or fix `REPO` to `parents[3]`).

A channel adopts VoiceStudio output only through its own docs; it does not replace dots.tts elsewhere. HES's `omnivoice_scene` mirrors the dots seed
sweep and 165-240 WPM window but, because OmniVoice barely moves cadence with seed, it steers the engine's own `speed` field
(`speed *= 215 / measured_wpm`, clamped 0.8-1.15) on a retry. That is generation-time speed, not a post-hoc stretch. The engine must be active:
`GET /engines/tts` must report `active == "omnivoice"` or the run aborts.

## 8. HES 3D voice split and `voice_lock.py`

For the 3D/Blender HES track (2D work stopped 2026-10-10): daily Shorts are narrated by **o1** (OmniVoice clone), long-form by **vm5** (VoxCPM2
design voice). Every VoiceStudio call goes through `hidden-everyday-systems/production-3d/tools/voice_lock.py`:
`with voice_session("<agent-or-batch>", engine="omnivoice"): ...` (or `engine="voxcpm2"`), `python voice_lock.py status`. It takes an atomic
`VOICE.lock` (stale when the owner pid is dead or older than 3 h), checks/switches the active engine (`/engines/select`), **always puts the
server back on omnivoice on exit**, allows only `{omnivoice, voxcpm2}`, refuses the VoxCPM2 switch before its `NOT_BEFORE` timestamp and when the
VoiceStudio VM has under 7 GB free RAM, and never touches IndexTTS. Never restart the VoiceStudio container yourself (it has exited 137 before).
Per-sentence takes plus ASR word timings (faster-whisper, 100 % match required) feed the shot plan; pauses and chapter holds are inserted as
silence/room tone. The owner has rejected a first round of 9 OmniVoice candidates and wants a young, energetic but warm voice, not high-pitched.

## 9. Legacy backends rejected (do not reactivate without an explicit request)

- **Kokoro** (`tts-kokoro/`), **Chatterbox** (`vendor/chatterbox-tts-server` submodule), **Qwen3-TTS** (service and 4.2 GB weights purged
  2026-09-03; a test intentionally asserts `TTS_BACKEND=qwen3` is rejected): superseded by dots.tts for cadence, reproducibility and a fail-closed,
  header-certified native-pacing contract; no silent fallback exists anywhere. They are removed/archived; see `legacy-and-removed.md`.
- Post-generation speed-up, Rubber Band, resampling, pitch shifting, reverb, enhancement, denoising on narration: banned for HES (native timing is
  an editorial and quality invariant); technews alone allows the single pitch-preserving `atempo` layer described in section 2.
- IndexTTS 2.5: OOM on this host. Generic "broadcast" effect presets: hidden effects.

## 10. Contradictions and open questions (resolve with the owner; do not paper over)

- **Chunk size:** the brief and older HES docs/`current-handoff.md` say <= 12 words. The live code, compose file and `.env.example` all say 56 and the
  `_generation_chunks` comment argues against 8-12. This file follows the code.
- **"Synthetic house voices":** the provenance JSONs show `warm-informational` is a real, unconsented person's voice and `hidden-systems-informational`
  has unestablished provenance; the earlier synthetic voices are archived. HES `architecture.md` (no-prompt bootstrap, F0-distinct from technews) is stale.
- **"dots.tts only":** true for repo docs and technews; HES's default provider is OmniVoice since 2026-10-05, and 3D uses OmniVoice + VoxCPM2. OmniVoice
  weights are non-commercial: unresolved for a monetised channel.
- **Native pacing:** technews applies `atempo`; default 1.2 (code, compose, `.env.example`), but its audio doc says 1.5. Which the owner wants today is unconfirmed.
- **Loudness target** differs per channel (see `audio-captions-music.md`).
- **`package_version`** is reported as 0.4.0 while the Dockerfile pins `dots.tts==0.3.1`; the HES cache keys on the *reported* string.
- Docker was not running when this was written, so compose volume/project names and health were not verified live.


> Theme subskills (horror-story-videos, manga-recap, social-clip-shorts-factory) must NOT reuse `warm-informational` (a real person's voice, no consent): supply a licensable or self-generated reference or use VoiceStudio VoxCPM2 (Apache-2.0). OmniVoice weights are CC-BY-NC.
