# Current state, breakages and open items (as of 2026-11-01)

Contents: 1 What exists · 2 Breakages from the 2026-11-01 reduction (with workarounds) · 3 Designed but not built · 4 Open owner questions · 5 Contradictions found across sources · 6 Suggested next steps

## 1. What exists
- **Format study** (2026-09-23/24): 48 analysed stories, report, protocol, automation spec, 8 demo stories, TTS landscape and audition (`research-output/chat-story-study/`). The TTS audition ran (4 configs); human listening, the seven viewer tests T1-T7 and the Dia2 audition did **not**.
- **Engine, simulator, MCP** (`hidden-everyday-systems/chat-stories/`): built 2026-09-25 -> 2026-10-04. Dated milestones: 09-25 simulator copied, voices chosen (M7 + F10); 09-26 F10 rejected (reverb), N4 chosen, ALL-CAPS fix; 09-27 VoiceStudio lab, music bed lowered 10 dB;
  10-03 OmniVoice made the default backend, spoken = bubble text, onset-based voice placement (`voiceAfterBubbleMs`), pause tightening, scroll fix, 11 new music tracks, funny-format research; 10-04 Caldruki-style edit (meme SFX/clips/images, overlays, effects, captions, audioFx, `after:'voice'`, `endAt`), 18+ no-music rule.
- **12 example stories** (plant-sitter, 4 drama/thriller s1-s4, 6 18+ comedy f1-f6) with build outputs in `hidden-everyday-systems/output/chat-stories/<slug>/` (also `f2-rooster`, `voicestudio-lab`). Nothing is recorded as uploaded.
- **Two voices** with provenance; **17 music tracks**; **80 SFX/meme sound entries** (44 of them third-party meme clips); **34 meme images**; 4 self-recorded gameplay clips (shared HES library).
- **MCP `chat-sim`**: 12 tools; verified live this session (`chat_list_apps` returned all 7 skins; `chat_validate_script` passed on `plant-sitter.story.json`). The TTS/build tools were deliberately **not** run (they would start GPU services).

## 2. Breakages from the 2026-11-01 reduction (rows 1-3 FIXED the same day by the lead; rows 4-5 remain)
| # | Symptom | Cause | Workaround / fix |
|---|---|---|---|
| 1 | FIXED: `engine/paths.mjs` `GAMEPLAY_DIR` now `hidden-everyday-systems/renderer-public/hidden-systems/gameplay` | was `<repo>/renderer/public/...` | none needed |
| 2 | FIXED: VoiceStudio auto-start/restart/stop in `engine/tts-voicestudio.mjs` now runs `docker compose -p yttechnews --env-file <repo>/.env ...` with cwd `ai-video-factory/toolkit` | compose file moved | none needed |
| 3 | FIXED: `voices/voicestudio/run_experiment.py` now imports `ai-video-factory/toolkit/voicestudio` | `tools/voicestudio` moved | none needed |
| 4 | New channel/session does not see the tools | `chat-sim` is registered only in `hidden-everyday-systems/.mcp.json` with an absolute path | open the session in that directory or copy the entry |
| 5 | Scoring scripts (`prosody_score.py`, `analyze.py`) fail to load CUDA/faster-whisper if the study venv is gone | they borrow torch DLLs from `research-output/chat-story-study/tts/envs/kokoro/...` (gitignored; present on 2026-11-01) | keep that venv or install CUDA libs for faster-whisper |
| 6 | dots service start (`tts-service/start.ps1`) needs image `yttechnews-tts-hidden` and volume `yttechnews_tts_model_cache` | image/volume survive only if Docker still holds them (not checked; daemon state unknown) | `docker images` first; rebuild via the toolkit compose if absent ([voice-tts.md](../../../references/voice-tts.md) section 5) |
Still fine: the README cites `ai-video-factory/toolkit/voicestudio/README.md` correctly; `examples/gameplay-library.json` is read from `hidden-everyday-systems/examples/` (present); `C:\bin\ffmpeg.exe` is present.
Not in the git tag: a wider case-insensitive search of the recovered `pre-skill-reduction` tree (`*.md|ts|tsx|py`; patterns `chat.stor|texting|chat-sim|text.?stor|fake.?(text|chat)|imessage|reddit.?stor|sms`) found **no** chat-story material - nothing to restore ([legacy-and-removed.md](../../../references/legacy-and-removed.md)).

## 3. Designed but not built
- The full AUTOMATION_SPEC pipeline (`chat_stories/` Python package, `schemas/`, `state.json`, premise/bible/dialogue/normalized/tts_manifest/timeline/qa_report/approval/rights JSON, hash-bound approvals, content-addressed cache for every artefact). The engine keeps a simpler per-take cache and `build.json`.
- Automated AV QA: ASR back-check of every line in the final audio, per-line LUFS spread, safe-area/contrast/legibility metrics, anti-spoiler frame test, muted-comprehension check, gameplay-competition energy check.
- Interface-as-narrator renderables (rename, call banner, notification, poll, voice note, deleted/edited, thread switch), group chats, time-varying status bar, a third voice, non-English.
- Metadata generation, thumbnails, credits aggregation (only the music credit is written), release calendar/ledger/uploader, a premise/novelty ledger, analytics ingestion.
- The seven viewer tests T1-T7 (need the owner's creator analytics) and the Dia2 two-speaker audition.
- Optional ComfyUI original attachment images (spec section 7): not used; the owner's current rule for this format is no generated visuals in the meme layer (attachments are the owner's own images/screenshots).

## 4. Open owner questions (raise; do not decide)
1. **OmniVoice licence** (CC-BY-NC per the owner's note) vs monetisation; choose dots/VoxCPM2 or confirm the licence.
2. **Trade dress** of the carbon-copy platform skins.
3. **AI-voice disclosure** policy (altered-content toggle vs description line) and the 18+ settings per video (age restriction; made-for-kids No).
4. `s4-back-door` (child-centred thriller) and real-person meme images vs the "no real people" story rule.
5. **Credits**: extend the engine/description for Noto emoji, Bluezone and meme sources; decide whether third-party meme clips ship at all on a monetised channel.
6. **Inauthentic-content exposure** of the generated f-series; whether to keep the template generator.
7. Whether any of the 12 builds was published; where the channel will live (own folder vs HES sub-package), its release cadence and calendar.
8. **Safe-zone**: bottom margin 170 px vs the ~20 % Shorts UI zone; confirm on a real phone.
9. Fix list for the breakages in section 2 (all in HES-owned files).
10. Whether to implement interface events (rename/banner/notification/poll) in the simulator, since the study ranks them as the format's most distinctive beats.

## 5. Contradictions found (A says X, B says Y; written as Y because ...)
- Cadence band: `tts.mjs` header and `verify_selected.py` 165-240 WPM vs code constant 180-320 -> 180-320 (code; chat-story-specific; explainers keep 165-240).
- Music bed: README -7 dB vs `library.json` -17 dB (2026-09-27) -> -17 (the code reads the library).
- Meme audio: README 10-03 "no meme samples" vs 10-04 real meme clips -> the later owner decision.
- UI look: AUTOMATION_SPEC "generic chat look, no logos" vs shipped carbon-copy skins -> shipped skins; flagged as open risk.
- Voice timing: study/spec negative text lead (voice slightly first) vs engine +50 ms after the bubble frame -> engine (owner's sync rule, 2026-10-03).
- Captions: spec "no subtitle layer duplicates chat text" vs `video.captions` (meme pop-up text, not a transcript) -> allowed only as meme captions.
- `story_plan synthesize:true` skips best-of, tightening, audioFx, `voice.backend`; build is authoritative.
- Demos D1/F1 are group chats; the schema forbids group chats.
- README "hard limit: no minors" vs the child-centred s4 story -> flagged, not ruled.
- Speech rate: REPORT median 266 wpm (segments >= 1.5 s) vs `metric_distributions.json` all-events 310 wpm -> the band uses 266.
- Spec's 8 demo stories and `funny_research` premise list (10 premises) are PROPOSED; only F2 (Plant Sitter) became a build among the demos.

## 6. Suggested next steps for whoever resumes
1. Fix breakages 1-2 (HES owner) and rerun `node mcp/smoke-test.mjs --build`.
2. Resolve the voice licence and disclosure questions before the first public upload; write the credits block template.
3. Choose one lane (dramatic clean vs 18+ comedy) for the first public test; do **not** publish both identities from one channel without a decision.
4. Write 3 original stories (not from the generator), run the whole QA list, listen, and pick a safe-zone-corrected `bottomMarginPx`.
5. Add the release calendar/ledger and a premise ledger; then run the study's T1-T7 sequentially with the owner's analytics.
