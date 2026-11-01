# Script schema and validation gates

Contents: 1 The story file (top level) · 2 `chat` (simulator ChatScript) · 3 `voice` · 4 `timing` · 5 `video` · 6 `music` and `sfx` · 7 Validation commands and gates · 8 Outputs · 9 Proposed contracts not implemented

Source of truth: `chat-stories/simulator/src/chat-simulator/script-schema.ts` (zod; `chat`), `engine/story.mjs` (`loadStory`, `DEFAULT_TIMING`, `DEFAULT_VIDEO`, `planLines`), `README.md`.
`mcp__chat-sim__story_template` returns a filled-in skeleton. Scripts are interchangeable with the original BrakeTools Fake Chat Simulator "Script JSON" (skins and schema unchanged; `PROVENANCE.md`).

## 1. The story file (what `story_build` takes: inline `story` or `path`)
| key | meaning |
|---|---|
| `slug` | output folder name; else derived from `chat.name` (lower-case, non-alphanumerics -> `-`) |
| `title`, `logline` | written to `description.txt` (nothing else is composed into metadata) |
| `style`, `edit` | informational labels (`style` is copied to build.json; `edit: "caldruki"` is **not read by the engine**; behaviour comes from the explicit blocks) |
| `audience` | `"18+"` -> **no music** unless `music.allowFor18: true` (engine rule `pickMusic`, owner 2026-10-04) |
| `chat` (alias `script`) | simulator script, section 2. Required |
| `assets` | `{assetId: file path | data URL}`: avatars, attached images, WhatsApp wallpaper / Roblox screenshot. Relative paths resolve against the story file's folder |
| `voice`, `timing`, `video`, `music`, `sfx` | sections 3-6 |

## 2. `chat` - ChatScript (zod)
- `app`: `imessage | whatsapp | messenger | discord | snapchat | google-messages | roblox`; `name` (project label, not rendered); `actors[]` (min 2): `{id, name, handle?, avatarAssetId?, color?}`
  (`handle` shows in Discord/Roblox; `color` = Discord role colour; Roblox derives its own name colour); `meActorId` (the right-hand/"me" side), `contactActorId` (the header person; **group chats out of scope**); `backgroundAssetId?`.
- `messages[]`: `{id, actorId, text, imageAssetId?, typingMs?, gapMs?, status?: sent|delivered|read, reactions?: string[], timestampLabel?}`. `timestampLabel` renders a date/time divider **before** the message (`Today 9:41 AM`).
  `typingMs`/`gapMs` override the simulator's typing model; `story_build` overwrites them with the audio-timed schedule in `timed-script.json` (`timing-schedule.md`).
- `settings` (all required in the schema; `chat_default_script` fills them): `theme: light|dark`, `device: iphone|android|desktop`, `typingCps` 12, `minTypingMs` 700, `maxTypingMs` 3500, `gapMs` 400, `scrollMs` 250,
  `statusTime` (status-bar clock text, e.g. `9:41`; **static** for the whole video), `battery` 0-100 (static), `showTypingForMe` false, `smsMode` (iMessage green / Google Messages SMS), `discordNitro`, `contactStatus` (header subtitle: `Active now`, `online`).
  Defaults per app: discord/roblox -> desktop, whatsapp/google-messages -> android, else iphone; discord theme dark; contactStatus `online` (whatsapp, discord) / `Active now` (messenger).
- **Message length** (editor counter only - `chat_validate_script` does **not** enforce it): imessage 20,000 (SMS mode 1,530 = 10 x 153 segments), whatsapp 65,536, messenger 20,000, discord 2,000 (4,000 Nitro), snapchat 1,000, google-messages 8,000, roblox 200.
- Typing indicators: shown for the contact, and for "me" only if `showTypingForMe`; Roblox has none. Skins and canvases: `simulator-and-render.md`.

## 3. `voice`
`backend` (`voicestudio` default = OmniVoice clones | `dots`); `enabled:false` -> silent (all bubbles unvoiced); `seed` (default 40000002); `speaker` (dots `speaker_scale`, 2.0 recommended) and `guidance` (dots only);
`actors.<actorId>: {voice, seed, speaker?, guidance?, readAsTyped?}`; `voices: {me, contact}` side map; defaults me -> `chat-female`, contact -> `chat-male` (`paths.mjs DEFAULT_VOICES`);
`lines.<messageId>: {spoken?, voiced?, voice?, seed?, pauseBeforeMs?, holdAfterMs?, speaker?, guidance?, readAsTyped?, audioFx?[]}`;
`cadenceRetries` (default 2; seeds tried when a single take is out of band; used when `bestOf` is 1); `cadenceWpm {min,max}` (default 180-320); `bestOf` N >= 1; `readAsTyped`; `tightenPauses` (default on).
Seed precedence: line `seed` > actor `seed` > `voice.seed` > 40000002. `audioFx` types (applied in order to the chosen take; comedy only): `boost {gainDb 8, bassDb 14, crush 0.2}`, `echo {delayMs 180, decay 0.5, tailS 0.8}`,
`pitch {semitones 5}`, `slow {factor 0.6}`, `stutter {ms 220, times 3}`. Details and the scoring maths: `voices.md`.

## 4. `timing` (defaults = `DEFAULT_TIMING`; merge with overrides)
`firstRevealMs` 100 · `voiceAfterBubbleMs` 50 · `gapAfterVoiceMs` 150 · `contactTypingMs` 450 (0 = none) · `unvoicedReadCps` 20 · `unvoicedMinMs` 700 · `finalHoldMs` 600. Derivation: `timing-schedule.md`.

## 5. `video` (defaults = `DEFAULT_VIDEO`)
- `width` 1080, `height` 1920, `fps` 30, `crf` 18.
- `background`: `{type:'gameplay', clip?: <id in hidden-everyday-systems/examples/gameplay-library.json>, startSec?}` (default clip = slug-hash rotation; start offset = 5 s margin + slug-derived position in the usable span `clip - 10 - duration`; looped with `-stream_loop`),
  `{type:'file', path}`, `{type:'color', color}`, `{type:'transparent'}` (ProRes 4444 `<slug>.chat-alpha.mov`, audio PCM).
- `chat`: `{widthPx 960, x 'center'|px, y 150|'center'|px, cornerRadius 28, canvasIndex 0, frameHeight null, bottomMarginPx 170}`. `frameHeight` null -> the card fills from `y` down to `bottomMarginPx`.
- `audio`: `{loudnormI -14, truePeak -1.5}`.
- `effects[]` (`at` = message id; `after:'voice'` -> from the end of that line's speech; `offsetMs`): `zoom {amount 0.08, inMs 90, holdMs 900, outMs 260, anchorY 0.78}`, `shake {amount 12 px, durMs 380}`,
  frame effects `flash {alpha .85, durMs 70}`, `tint {color red, alpha .32, durMs 300}`, `invert 100 ms`, `deepfry 700 ms`, `glitch {amount 14, durMs 250}`, `desat 1200 ms`.
- `overlays[]`: `{at, image: <id in memes/library.json | path>, mode: 'pop'|'corner'|'jumpscare', durMs, scale, x, y, after, offsetMs}`. Defaults: pop scale 0.62 of width at (0.5, 0.42), 1100 ms, scale bounce 55 % -> 108 % -> 100 % over ~160 ms;
  corner scale 0.32 at (0.78, 0.2); jumpscare = full-frame cover crop, 550 ms. GIFs loop.
- `captions[]`: `{at, text, durMs 900, size 110, color white, y 0.16, after, offsetMs}`; Impact (`captionFont`, default `C:/Windows/Fonts/impact.ttf`), black outline, scale pop. **Emoji are stripped** (Impact has no glyphs); show emoji as image overlays.

## 6. `music` and `sfx`
- `music`: `{track: <id in music/library.json> | mood, enabled?, gainDb?, startSec?, cutAt?: [{id, ms 1500}], allowFor18?}`. `track: null` or `enabled:false` -> none. Policy and levels: `audio-sfx-memes.md`.
- `sfx`: `{enabled?, gainDb -12, pops?: false disables the send/receive pops, cues?: [{at, sound: <id in sfx/library.json | file>, offsetMs, gainDb, after?: 'voice', endAt?: true, holdMs?}]}`.
  `after:'voice'` times from the end of that line's speech and holds the next bubble (`holdMs`, library default); `endAt:true` makes a riser/drum roll **end** at the anchor. Unknown message id or sound id throws.

## 7. Validation commands and gates
| Gate | Command | Passes when |
|---|---|---|
| Schema | MCP `chat_validate_script` (`path` or inline) | returns `{ok:true, script}` (verified 2026-11-01 on plant-sitter); errors list `path: message` |
| App list/limits | MCP `chat_list_apps`; `node engine/cli.mjs apps` | skin ids, canvases, `supports`, `maxChars` |
| Spoken text | `node engine/check-spoken.mjs <story.json> [...]` | exit 0; no "EXTRA PAUSE" (spoken adds pause marks the bubble lacks) |
| Plan | MCP `story_plan` (`synthesize:false` estimates at ~200 wpm; `true` uses real, cached takes) | schedule looks right; **`synthesize:true` ignores `bestOf`, tightening, audioFx and `voice.backend`**, so its timing differs slightly from a build |
| Layout still | MCP `chat_render_png` (`t` ms or `"all"`, `full:true` = whole conversation) | readable at the real crop; check long bubbles, image bubbles |
| Build | MCP `story_build` / `node engine/cli.mjs build <story.json> [--out DIR] [--skip-tts]` | `build.json` has `cadenceFailures: []` (else rewrite or add seeds; never stretch); `--skip-tts` gives a silent preview with *estimated* timing |
| Post-build | `engine/check-*` scripts | see `qa-policy-metadata.md` section 1 |
Smoke test of the toolchain: `node mcp/smoke-test.mjs [--build]`. Simulator unit tests: `npm test` (15 tests: timeline, limits, Roblox name colours).

## 8. Outputs (default `hidden-everyday-systems/output/chat-stories/<slug>/`, env `CHAT_STORIES_OUTPUT`)
`<slug>.mp4` (or `.chat-alpha.mov`), `dialogue.wav` (voices only, 48 kHz mono PCM24), `mix.wav` (dialogue + pops + cues + music), `timed-script.json` (re-importable in the editor), `build.json`, `description.txt`.
`build.json` records per message `revealMs, visualMs, typingMs, voiceStartMs, voiceOnsetMs, voiceEndMs, speechEndMs`, normalisation applied, chosen take (seed, wpm, cadenceOk, WER, pitch range, unexplained pause, all candidates),
`cadenceFailures`, `music` (with attribution), `background {clip, file, startSec, rights_basis}`, `tts` (service, model, version, per-voice reference sha256, `native_pacing:true, post_speedup:false`), `overlay` geometry, `timing`.
Cache: `chat-stories/cache/` (env `CHAT_STORIES_CACHE`; gitignored): `tts/<key>.wav|json`, `tts/tight/`, `tts/fx/`.

## 9. Proposed contracts that are NOT implemented (AUTOMATION_SPEC)
`premise.json`, `bible.json`, `dialogue.json` (kinds incl. voice_note/system/typing/read_receipt/deleted/edited, `reveal_group`), `normalized.json`, `tts_manifest.json`, `timeline.json`, `qa_report.json`, `approval.json`
(binds `script_sha256`, `audio_set_sha256`, `render_sha256`), `rights.json` (gameplay basis, fonts, UI style, images origin/prompt hash, music, voices with `no_real_person_clone:true`), `state.json` event log, cache keys per artefact
(line WAV keyed on spoken text + voice + engine + model@revision + settings + seed; fonts never invalidate audio; final approval void when any bound hash changes), a deterministic Python CLI `chat_stories <stage> <project>`.
Treat them as a design to adopt selectively: the engine already caches WAVs (key = backend, engine, version, text, voice, seed, reference sha256, preset) and records provenance in build.json, but has no approval or rights file.
Fidelity gap: `kind` values voice_note, system, read_receipt, deleted, edited have **no renderer**.
