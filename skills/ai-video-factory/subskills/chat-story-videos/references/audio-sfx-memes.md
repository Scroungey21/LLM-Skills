# Music, SFX, meme layer and rights provenance

Contents: 1 The mix chain · 2 Music library and policy · 3 SFX library · 4 Meme voice edits and images · 5 The Caldruki-style comedy edit (owner rules) · 6 Rights table and credits · 7 Contradictions

Sources: `chat-stories/music/library.json`, `sfx/library.json`, `sfx/meme/clips.json`, `memes/library.json`, `engine/story.mjs` (`mixFinal`, `pickMusic`, `voiceFxArgs`, `postEffects`), `README.md`, `data/music_research.md`, `data/caldruki_edit_research.md`, `examples/make_funny_stories.py`.
Shared pattern for narrated channels: [audio-captions-music.md](../../../references/audio-captions-music.md) sections 4-6 (HES ducking, music policy, SFX policy).

## 1. The mix chain
`dialogue.wav` (each take `adelay`ed to `voiceStartMs`, `amix normalize=0`, 48 kHz mono PCM24) -> `mix.wav` = dialogue + **pops** (`send.wav` on "me" bubbles, `receive.wav` on the contact's, at the bubble's first frame, `sfx.gainDb` -12; `sfx.pops:false` removes them) +
**cues** (`sfx.cues`, section 3) + **music bed** (section 2, side-chained from the dialogue) -> final `loudnormTwoPass` -14 LUFS / -1.5 dBTP on the AAC export (`simulator-and-render.md` section 6). A cue must name a message id and a sound id/file that exist, or the build throws.

## 2. Music library and policy
- 17 tracks in `music/library.json` (media is local, gitignored mp3s): 6 Kevin MacLeod (CC BY 4.0, template credit) + 11 added 2026-10-03 with per-track `artist/license/attribution/source_url`.
| id | artist | licence | mood tags |
|---|---|---|---|
| hitman, heartbreaking, sneaky-snitch, darkest-child, investigations, dark-fog | Kevin MacLeod | CC BY 4.0 | tense-drama/cheating; emotional/sad; playful-revenge/comedy; suspense/creepy/horror; mystery/snooping; suspense/creepy |
| carnival, married-life | Aylex | Free To Use (free tier) | comedy/silly/upbeat/drunk-texts; emotional/heartwarming/sad |
| funky | Waesto | Free To Use | comedy/petty/clueless |
| sneaky-spider | Zambolino | Free To Use | playful-revenge/scheming |
| arbiters-trial | Pufino | Free To Use | tense-drama/confrontation/cheating |
| morpheus | Nebulite | Free To Use | mystery/snooping/weird |
| eyes-in-the-void, home-was-you | Scott Buckley | CC BY 4.0 | suspense/tense-drama; emotional/heartwarming/nostalgic |
| the-visitor, skeleton-carnival | Shane Ivers | CC BY 4.0 | creepy/horror/suspense; comedy/spooky-comedy/cursed/weird |
| piano-horror | Francisco Alvear | Mixkit music licence | creepy/suspense |
- **Levelling** (`mix_policy`): each track to `reference_lufs` -18 (its stored `integrated_lufs`), then `bed_gain_db_vs_reference` **-17** (changed 2026-09-27: the owner asked for music "considerably quieter than the genre norm"; the bed was lowered 10 dB from -7), then **side-chain ducked** by the dialogue:
  `sidechaincompress threshold 0.02, ratio 6, attack 15 ms, release 450 ms, makeup 1`; fade in 0.8 s, out 2.5 s; `music.gainDb` overrides the -17; `startSec` offsets; looped (`-stream_loop -1`). `music.cutAt:[{id, ms}]` drops the bed to silence from `visual - 40 ms` for `ms` (default 1500) - used on the turn of dramas (s1: m17 1300, m23 1000).
  Reference points: the study's beds sit a median 3.7 dB under the voices (funny -1.8, drama -4.1) - far louder than accessibility guidance (WCAG 1.4.7: >= 20 dB lower); the music brief's synthesis was -12..-16 dB under TTS, swelling to ~-6 in gaps.
  Measure a build with `python engine/measure_bed.py <out>` (speech dB, bed-in-gaps and bed-under-speech relative to speech). HES's stricter per-band gate (`audio_bands.py`, >= 18/22 dB) is **not** applied here.
- **18+ stories get no music** (engine rule, owner 2026-10-04: Caldruki-style comedy uses meme SFX only); override per story with `music.allowFor18`. Dramas use mood-appropriate tracks (drama: tense/emotional; thrillers: creepy; comedy that has music: bouncy/quirky). Sad endings: soft piano replaces the bed for the last 2-4 messages (INF from the sample).
- **Credits**: `description.txt` receives `Music: <attribution> <source_url>` for the chosen track only. Free To Use, Buckley and Ivers tracks are Content-ID registered and cleared by the credit text in the description - it must be there **before the video goes public**.
  Free To Use free tier bans sponsored/brand content. Epidemic Sound needs the owner's paid subscription (not used). Never use TikTok library songs, Wii Shop remixes, game OSTs (all non-commercial or owned; `music_research.md` section 3); mute all gameplay audio.
- Add a track: measure integrated LUFS on the trimmed audio, add the entry (`add_tracks_2026-10-03.py` is the precedent), record `source_url`, licence, attribution verbatim and Content-ID stance.

## 3. SFX library (`sfx/library.json`; stories use `sfx.cues`)
- **Project-owned procedural** (`make_sfx.py`, `make_comedy_sfx.py`): `send`, `receive` (pops), `boom` (-4 dB, hold 900), `boing`, `bonk`, `crickets` (hold 1800), `ding`.
- **Mixkit Sound Effects Free License** (royalty-free, no attribution, `make_meme_sfx.py`, ids from `caldruki_edit_research.md`): record-stop, fail-piano, laugh / laugh-big (final beat only, max 1), giggle, boing-meme, fart, fart-2, fart-reverb, clown-horn, buzzer, impact, riser (cue with `endAt`), whoosh-meme, rimshot, drum-roll.
- **Bluezone original vine boom** (free for monetised Shorts/TikTok/Reels, no redistribution) and derivatives: `vine-boom`, `boom-earrape` (max once per video, never in the first 3 s), `boom-double`.
- **Own voiced memes** (made from our two voices, project-owned): voice-gerald (+slowed, quiet, pitch, earrape), voice-bro-what, voice-hell-nah, voice-get-out, voice-are-you-serious, voice-what-the-hell, voice-nah.
- **Third-party meme clips, owner-approved at the owner's risk** (44, `sfx/meme/clips.json`: myinstants.com media + one CC0 Wikimedia recording): enrique (+long/slowed/loud/fart), adrian (+slowed/earrape), caldruki-ahh, get-out, fahh, bruh, metal-pipe, taco-bell, hell-nah, are-you-serious, wallahi, ayo, among-us, emotional-damage,
  spongebob-fail, boowomp, huh-cat, rizz, dog-doin, sad-violin, anime-wow, discord, windows-error, shut-your-mouth, aughhh, baby-laugh, grinder, fart-reverb-meme, cheering, low-honor, dun-dun, heheheha, chicken-scream, hee-hee, bone-crack, and `gymnopedie` (CC0 sad-piano bed).
  Library `license` field names the apparent owner per clip (Sony/AMC, Nickelodeon/Paramount, Rockstar, Supercell, MJ estate/Sony, Innersloth, Discord Inc., Microsoft, Yum! Brands, an IShowSpeed clip, a Steven He clip, unknown). Sources are logged per file so a claimed asset can be swapped and the video re-rendered.
- **Ban coverage unconfirmed**: the library still contains `record-stop`, `sad-violin`, `laugh`, `laugh-big`, `giggle`, `fail-piano`, `baby-laugh`, `boowomp` (sad deflation) although the owner removed gasps, record scratches and sad trombones. Whether these fall under the ban is not recorded - ask the owner before using them; do not treat them as cleared.
- Per-cue fields: `holdMs` (reading/silence room the scheduler grants, `timing-schedule.md` section 3), `gainDb` (library default; stingers -3..0 vs voice peak, ambient -10..-14, pops -18, earrape +4..+6), `use`, `duration_s`.
- Rule of thumb carried from the sibling channels: an SFX that does not correspond to a visible event is a defect (audio-captions-music section 6) - here every cue anchors on a message id.

## 4. Meme voice edits and images
- `voice.lines.<id>.audioFx` (comedy only): `boost` (bass +14 dB at 110 Hz, +8 dB gain, 8-bit crush mix 0.2, limited), `echo` (aecho delays d, 2d, 3d with decay 0.5/0.3/0.18; adds 0.8 s tail), `pitch` (semitones; speed follows pitch like a sped-up clip), `slow` (factor; pitch drops), `stutter` (repeat the first ms N times). Edits on <= ~25 % of lines, never two heavy ones in a row (Caldruki research).
  Applied to the chosen take, cached under `cache/tts/fx/`, and scheduling follows the edited length.
- `memes/library.json` images: 15 **Noto animated emoji** GIFs (CC BY 4.0, Google - credit required in the description: skull, sob, wilted-rose, speaking-head, clown, raised-eyebrow, vomit, flushed, scream, eyes, boom, fire, moai, smirk, hot-face); **Pixabay Content License** `explosion`, `starburst`, `yuck-cartoon`, `disgusted-emoticon`, `shocked-cartoon`;
  **meme-host copies** (third-party, owner-accepted risk): speed-smirk, speed-wrinkly 1-4 (real person, AI-edited meme), cars-laughing (Disney/Pixar), disgusted-barbie (Mattel), monkey-side-eye, rock-eyebrow (real person), huh-cat, clown-makeup (stock-photo model), yujiro-veiny (Baki), tanjiro-disgusted, surprised-pikachu.
  `memes/fetch_meme_images.py` re-downloads them. Modes: `pop`, `corner`, `jumpscare` (see `schema-and-validation.md` section 5).

## 5. The Caldruki-style comedy edit: owner decisions (2026-10-04) and beat vocabulary
Owner decisions: no generated audio or visuals - **fetch real meme clips/images online** (owner: "fetch it online, don't generate"; accepts the claim risk); real-person meme images allowed anywhere; no music; **no gasps, record scratches or sad trombones** (removed);
meme sounds and visuals **only on genuinely dramatic or stupid punchlines (~7-8 per video)**, never on random lines ("you're using it on perfectly random messages and just spamming them"). The generic woman gasp is banned. `audience: "18+"`.
Per story pick ~7 deliberate beats: hook, realisation, horniest line, dumbest line, roast, outrage peak, ender. Each hit fires its sound in the gap *after* the line (`after:'voice'`, the scheduler waits `holdMs`) with the matching visual on the same frame. Beat map (`make_funny_stories.py` class `Ed`):
| beat | sound | visual | voice edit |
|---|---|---|---|
| reveal / realisation | `dun-dun` with `endAt:true` swelling into the bubble, then `vine-boom` +60 ms after voice | zoom 0.14 (80/900/250 ms) + shake 9 px + white flash 90 ms + shocked-face pop (rotating pool) | - |
| punchline | vine-boom or taco-bell | zoom + shake + emoji sticker (skull, sob, wilted rose, moai, speaking head) | echo-repeat optional |
| stupid line | bruh (or similar) | glitch 180 ms (amount 10) + confused-face pop | - |
| cringe | spongebob-fail / low-honor / sad-violin | desat 1.4 s + disgust face | slowed |
| horny / suspicious | ayo / rizz | pink tint 900 ms + sus face + corner emoji | slow 0.88 + echo 120 ms |
| scare / ender | signature scream | jumpscare image 650 ms (speed-wrinkly / yujiro) | earrape once |
Overstimulation limits and SFX density targets: `format-research.md` section 8 (checked with `python engine/check-edit.py <out> <story.json>`: stinger/voice overlaps, SFX per minute, non-speech share; research 16-20 beats/min, 36-68 % non-speech, SFX >= 2 s apart).
Visual research (3,200 comments + tutorials): screenshot -> meme -> screenshot rhythm, CapCut explosion, "flashbang" white flashes, jumpscares incl. one at the end, blur-censored swears, title emoji register (skull, crying face, wilted rose, folded hands). Trend notes: grotesque IShowSpeed face edits (peak Nov 2025), veiny Yujiro/Baki faces (spring 2026).

## 6. Rights table and credits
| asset class | basis | needs credit | risk |
|---|---|---|---|
| gameplay (own capture) | publisher creator policy (Mojang; Rockstar) | no | policy compliance; footage must carry unique value; YouTube Shorts-specific game-footage guidance not found |
| MacLeod / Buckley / Ivers music | CC BY 4.0 | **yes, exact text** | Content-ID claims cleared by the credit |
| Free To Use music | FTU free licence | **yes** | no sponsored/brand content on the free tier |
| Mixkit music/SFX | Mixkit licence | no | low |
| Bluezone vine boom | Bluezone free licence | no (do not redistribute) | low |
| Noto animated emoji | CC BY 4.0 | **yes** | build does not write it |
| Pixabay images | Pixabay Content License | no | some assets are Content-ID registered |
| meme clips/images (third party) | none (owner-accepted risk) | n/a | Content ID / DMCA / trademark claims; real-person likeness; AI-edited faces |
| our voices / procedural SFX | project-owned (voice model licence open, see `voices.md` section 6) | no | OmniVoice non-commercial note |
**Credits gap**: `build()` writes only the music credit to `description.txt`. Noto emoji (CC BY 4.0), Bluezone terms and meme sources receive **no** credit; 18+ edits carry no music, so they ship with **zero attribution text**. Compose the final description by hand
(or extend the engine) from `build.json` (`music`, `overlays`, `sfx.cues`) before any publish. Meme sources are in each library's `source`/`url`/`page` fields.

## 7. Contradictions
- README (2026-10-03 text) says "no meme samples: vine boom / bruh / laugh tracks are owned by others"; the 2026-10-04 section of the same README, the libraries and the f-series use real meme clips. Written as the 2026-10-04 owner decision (later dated beats earlier), with the rights risk stated.
- README says the bed is "-7 dB"; `music/library.json` `mix_policy` says -17 (2026-09-27 change). The code reads the library, so -17.
- `funny_research.md` says avoid "bruh" and 'owned' meme sounds and prefers generic CC0/Pixabay sounds; the later owner decision overrides it.
- `music_research.md` recommends YouTube Audio Library/Pixabay/MacLeod; the library adds Free To Use and Mixkit tracks; the research's "-12..-16 dB under TTS" differs from the engine's duck (about -17 dB bed + 6:1 side-chain).
