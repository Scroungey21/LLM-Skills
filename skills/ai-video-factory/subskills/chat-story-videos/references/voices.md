# Voices: characters, audition, scoring, normaliser

Contents: 1 The two character voices · 2 Selection history · 3 Backends and contracts · 4 Spoken-text normaliser · 5 Take selection (best-of-N) · 6 Licence, provenance, disclosure ·
7 Voice-lab numbers · 8 Adding or changing a voice · 9 Contradictions

Sources: `chat-stories/README.md` (Voices), `voices/` (scripts, `selected/*-provenance.json`, `candidates.json`, `voicestudio/`), `engine/tts.mjs`, `engine/tts-voicestudio.mjs`, `engine/story.mjs`, `engine/wav.mjs`,
`research-output/chat-story-study/REPORT.md` section 8 and `tts/tts_landscape.md`. Shared background (backends, VoiceStudio client, audition discipline): [voice-tts.md](../../../references/voice-tts.md) sections 1, 6, 7.

## 1. The two character voices
| voice_id | pick | source | median F0 | reference |
|---|---|---|---|---|
| `chat-male` | M7 = `ds-93000004` | dots.tts SOAR **self-generated speaker** (no prompt audio, seed 93000004) | ~118-128 Hz | `voices/selected/chat-male.wav|.txt|-provenance.json` |
| `chat-female` | N4 = `ds-94000040` (round 2) | dots.tts SOAR self-generated speaker (seed 94000040; steps 16, guidance 1.2, speaker scale 1.5) | ~160-170 Hz (low alto) | `voices/selected/chat-female.*` |
Both are synthetic: no recording of any person was used (`source_is_real_person: No`; consent N/A). References are 48 kHz mono PCM24, ~7.7 s, text "Honestly, I didn't expect you to text me back this fast. Anyway, I'm on my way now, ...".
Default assignment: `me` -> `chat-female`, `contact` -> `chat-male`; override per actor (`voice.actors.<id>.voice`) or per line. **Only two voices exist**; more characters need more reviewed references.
Voice-meme clips (`sfx/make_voice_memes.mjs`: "GERALD!" signature variants, bro-what, hell-nah, get-out, are-you-serious, what-the-hell, nah) are made from these voices.

## 2. Selection history (owner decisions)
1. 2026-09-24/25: candidate pool `voices/candidates.json` - 4 Qwen3 VoiceDesign male + 4 female, Kokoro presets (am_michael, bm_george, af_heart/bella/nicole/sarah, bf_emma; Kokoro presets named after commercial voices - alloy, echo, fable, nova,
   onyx, sky, puck, fenrir, kore, aoede - **excluded** to avoid imitating a commercial product) plus dots self-generated speakers; 20-voice audition page; **owner picked M7 and F10** (2026-09-25).
2. 2026-09-26: F10 (`ds-93000005`) **rejected by the owner for room reverb**, archived in `voices/selected/archive-chat-female-ds-93000005-20260926/`.
3. Round 2: 46 new female dots speakers screened (`select_female.py`: median F0 >= 170 Hz -> `female_new.txt`) with `reverb.py`; owner picked **N4**. In the Plant Sitter build: chat-female echo tail -21.3 dB (dry), chat-male -10.6 dB (roomy side).
4. 2026-10-03: default backend switched from dots to **VoiceStudio/OmniVoice clones of the same two references** (lab, section 7). The references themselves did not change, so the owner's casting did.
5. 2026-09-26/10-03 expressiveness work (`expressive_test.py`, `analysis.json`): levers text shaping, `guidance_scale`, `speaker_scale` (2.0 recommended for dots), seed; proxies pitch_st (monotone 1.5-2 st; animated 3+), pitch_move, energy_db, WER, WPM, echo tail.
   The "expressive punctuation" lever was then **banned** (2026-10-03, spoken = bubble text) because it created invisible pauses.

## 3. Backends and contracts
| | `voicestudio` (default) | `dots` |
|---|---|---|
| What | OmniVoice (`omnivoice`) cloning the selected refs via the shared VoiceStudio service `127.0.0.1:3900` (profiles `chat-stories:<voice>:<ref-sha12>`, created on demand; new reference -> new profile) | dots.tts SOAR multi-voice container `hs-chat-tts` :8006 (`tts-service/server.py` imports the production `toolkit/tts-dots/server.py` helpers; start with `tts-service/start.ps1`, `-Stop`) |
| Output | raw model audio: `effect_preset: raw`, `denoise: false`, no speed/effects; inaudible AudioSeal watermark on | native pacing; headers `X-TTS-Backend: dots.tts`, `X-TTS-Native-Pacing: true`, `X-TTS-Post-Speedup: false` or the take is **rejected** |
| Speed | ~1-4 s per take (3-5x faster than dots) | ~11 s per take |
| VRAM | shared with VoiceStudio engines | ~6 GB (5.7 GB peak), `--restart no`; do not run with tts/tts-hidden or VoiceStudio heavy jobs ([voice-tts.md](../../../references/voice-tts.md) section 5) |
| Start | engine calls `vsEnsure` (see current-state breakage); `VOICESTUDIO_API_KEY` from env or repo-root `.env` | engine/MCP auto-start when base URL ends `:8006` |
No silent fallback between backends; a story chooses (`voice.backend` / `CHAT_STORIES_TTS_BACKEND`). Cache key (voicestudio): backend, engine, version, text, voice, seed, reference sha256, preset; dots adds model, steps,
guidance, speaker scale, chunk size, package version. `CHAT_TTS_OFFLINE=1` re-renders from cached takes without the service (needs the model-info snapshot saved by an earlier online call).
VoiceStudio is shared: other pipelines may use it (one client at a time; simultaneous `/generate` corrupted takes in an earlier voice round); the client retries 5xx/dropped sockets 4x with 3 s*k backoff; a "CUDA error"/OOM
triggers **one** container restart + retry (a CUDA fault poisons the server process). Never run IndexTTS 2.5 (OOM-kills the host container).

## 4. Spoken-text normaliser (`normalizeSpoken` + `fixCaps`, deterministic; every substitution is listed in build.json `normalization`)
Order: strip emoji -> lexicon (case-insensitive unless noted) -> numbers -> tidy -> capitalise sentence starts, `i` -> `I` -> add final `.` if none -> "No." fix.
- Lexicon: idk -> "I don't know", idc, imo, tbh, brb, omw, wyd, hbu, nvm, ty, pls/plz, `u` -> you, `ur` -> your, `r` -> are, `k` -> kay, wtf -> "what the heck", omg -> "oh my god", lmao -> lmao,
  mr/mrs/ms/dr + period -> Mister/Missus/Miss/Doctor, ok -> okay, **lol dropped**, rn -> "right now", `*word` -> word. (The softened "wtf" is a channel-policy choice; the study saw the same softening in sources.)
- Numbers: 911 -> "nine one one"; clock times `9:41 PM`; `9pm`; ordinals; years 1100-2099 as years; `$n`; `n%`; integers up to 999,999 as words. Collapse `??`/`!!`, remove space before punctuation.
- `fixCaps`: words of >= 2 capitals are lower-cased (dots mangled "MEAN" -> "men", "ME" -> "Emmy", measured 2026-09-26); acronym whitelist stays: OK SUV TV ID FBI USA UK AM PM ATM DM GPS CEO HR ER ICU; lone "A" in a shouted line -> "a".
- `NO_ABBR`: capital "No." -> "no." (dots read "number" for 19/20 voices on a one-word "No.", verified 2026-09-25). Applies to hand-written `spoken` too.
- `pauseMarks`: counts `...`/`…`, sentence ends before a space, `, ; :` before a space, spaced dashes; `check-spoken.mjs` and the planner **warn** if an override adds pause marks.
- `voice.readAsTyped` (story / actor / line) voices shorthand and typos exactly as written.
- `voiced` is true by default when the spoken text has a word; set `voiced:false` to leave a bubble silent (photo, emoji, reaction, deliberate silent beat; read time then `max(700 ms, chars/20 cps)`).

## 5. Take selection
**Single take (`bestOf` 1):** `synthesizeGated`: try `seed`, `seed+1..seed+cadenceRetries` (default 2) and return the first take inside the band (180-320 WPM, counted on lines of >= 5 words; shorter lines are measured, not gated);
if none passes, return the take closest to the band with `cadenceOk:false` - **never stretched** - and list it in `build.json.cadenceFailures`. WPM = words / speech seconds (speech bounds, not file length).
**Best-of-N (`bestOf` >= 2):** synthesize seeds `seed..seed+N-1`; if every take waits > 400 ms before speaking, add up to 2 more seeds. Score all takes with `voices/prosody_score.py`
(faster-whisper ASR WER + pitch std in semitones `pitch_st` + `pitch_move` + `energy_db` std + echo tail `tail_db`). Re-roll rule: while no take is `good` (WER <= 0.15, onset <= 400 ms, 130 <= wpm <= 450), try up to 3 more seeds `seed+10..seed+12`
(motivation: OmniVoice turned "Should've thought of that." into "You should have thought of that." on two seeds, breaking a callback; a 5-word punchline once came out at 556 wpm; brisk comedy 320-420 wpm is allowed, only extremes re-roll).
Choice: prefer clean takes (onset <= 400 ms; OmniVoice normally 190-230 ms, dots 0-120 ms), then WER <= 0.15, then in-band, then maximise
`liveliness = pitch_st + 0.1 * energy_db - unexplained`, where `unexplained` = sum over inner gaps >= 110 ms **beyond the N longest** (one per visible punctuation mark) of `gap_ms / 100` (about 1 point per 100 ms; pitch range is only ~3-6 st, so this dominates).
**Pause tightening** (`voices/tighten_gaps.py`, on by default, owner-approved 2026-10-03; only silence is cut, speech never stretched/shifted): trim each take's lead-in to 120 ms and tail to 150 ms; find quiet runs
(10 ms frames below peak - 30 dB, >= 100 ms), keep the longest `breaks` (= `pauseMarks(display)`), shorten every other to 70 ms by cutting the middle with 8 ms crossfades. Cached under `cache/tts/tight/<take>-b<breaks>.wav`.
**Audible onset** (`engine/wav.mjs speechBounds`): 10 ms RMS frames; speech = first/last run of >= 40 ms within 30 dB of the loudest frame (a run, so a 150 ms blip in the lead-in cannot fake an onset - once put a voice 0.75 s late).
**Meme voice edits** (`audioFx`) are applied last, before onset/duration are measured, so scheduling follows the edited audio.

## 6. Licence, provenance, disclosure (read before monetising)
- The default engine **OmniVoice is CC-BY-NC (non-commercial)** per the owner's 2026-10-12 note and the VoiceStudio plan ([voice-tts.md](../../../references/voice-tts.md) section 7: "check the HF card before any monetised use"). The chat-stories README never mentions this.
  The owner chose OmniVoice in a full-video A/B for HES; for a **monetised** chat channel this is an unresolved licence question. Options: re-verify the model card; use `dots` (published licence, same model the channel narrates with) at the cost
  of reverb/speed; or VoxCPM2 (Apache-2.0) with its own auditions (it has no speed control and drops `[pause]` markup). Do not assume. (Open item for the owner.)
- VoiceStudio itself is AGPL-3.0 (used as a local service, not redistributed). OmniVoice output carries an inaudible AudioSeal watermark.
- Reference voices are synthetic by construction; keep `no_real_person_clone`; never clone a real person (REPORT TTS note; rights.json proposal).
- Disclosure: voices are realistic synthetic speech. YouTube's "altered/synthetic content" disclosure targets *realistic* content; the study judged a non-photorealistic animated chat story outside the toggle but noted a description label is allowed.
  Whether a realistic synthetic *voice* for fictional characters needs the toggle is not settled in the repo - see `qa-policy-metadata.md` section 2.
- Human listening: the owner picked both voices by listening; the agents did not (provenance says so). Agent audio checks are diagnostic only.

## 7. Voice-lab numbers (2026-09-27, `voices/voicestudio/`; page https://claude.ai/artifact/HeSREmdzZrkB6pXFjt4uzH)
Hardest dramatic lines (`dramatic_lines.json`: shouting, crying, begging, panic) under seven conditions (OmniVoice clone/design, IndexTTS clone/design, VoxCPM2 clone/design, dots recipe), 2 takes per line, kept take WER <= 0.25 with most pitch + loudness
movement (`run_experiment.py`; note it still imports `tools/voicestudio`, now `toolkit/voicestudio`). Result that decided the default: **OmniVoice clones vs the dots recipe** - pitch range 4.1 vs 4.5 st (as lively), echo tail -19.8 vs -12.5 dB (much drier), 23/24 lines accurate (as accurate),
241 vs 276 wpm (calmer), 3-5x faster per take. IndexTTS 2.5 was similar but 1.5-12 min per take (and OOM risk). Study TTS audition (REPORT section 8, 26 lines x 4 configs): Kokoro 5/26 ASR failures, Qwen CustomVoice 4/26, VoiceDesign 2/26, Chatterbox-Turbo 4/26;
Qwen ~10x slower than real time on Blackwell; none does native multi-speaker; laughter via text failed except Chatterbox `[laugh]`; perceptual quality never judged without a listener. Dia2 (2-speaker) audition remained unrun.

## 8. Adding or changing a voice (procedure)
1. Generate candidate references (`voices/dots_audition.py selfgen` inside the tts image, or `gen_refs.py`); screen: median F0 (`analyze.py refs`: male band 85-180 Hz, female 165-300), ASR round trip of the reference (must reproduce its own transcript word for word).
2. Screen reverb blind (`python voices/reverb.py <dir>`): measures phrase-end decay25 (ms), late/early energy (50-200 ms after the offset vs first 50 ms; **dry <= about -18 dB, roomy -8..-11 dB**), pause floor. The owner rejected a roomy voice.
3. Audition page (`build_page.py`, `page_template*.html`) -> **the owner listens and picks**.
4. `verify_selected.py` (needs the service): reference ASR, leak regression (3 unrelated sentences, seeds 70000000-70000002: ASR must match the target, no reference words leaked), register, cadence observation, writes `<id>-provenance.json`.
5. Put `<id>.wav|.txt|-provenance.json` in `voices/selected/` (the dots service and the VoiceStudio profile builder both read it; a changed reference creates a new profile and new cache keys).
6. Rebuild a story, run `voices/score_build.py <build.json>` (per-voice reverb of a real build) and `engine/check-pauses.py`/`check-word-gaps.py`; listen.
Generic discipline (native pacing hard line, clone-degeneration probe, listening checkpoints): [voice-tts.md](../../../references/voice-tts.md) section 6.

## 9. Contradictions
- `engine/tts.mjs` header and `voices/verify_selected.py` mention the **165-240 WPM** explainer band; the code constant `CADENCE_WPM = 180-320`. Written as 180-320 for chat stories because the code governs and the study median is ~266 wpm; the 165-240 band binds HES explainers only.
- README says `voice.speaker` 2.0 is "recommended"; that applies to the dots backend only and the OmniVoice default ignores it.
- `story_plan synthesize:true` and `tts_synthesize` use single-take gating (no best-of, no tightening); `story_build` is authoritative for timing.
