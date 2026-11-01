# Audio, captions, music and SFX (the pattern across channels)

Contents: 1 Per-channel summary · 2 Captions · 3 Timing: forced alignment vs proportional · 4 Loudness and ducking · 5 Music policy and library ·
6 Sound effects policy · 7 Objective audio QA · 8 Contradictions and open questions

Pattern shared by every channel: **sound is a measured, licensed, quiet layer under a clear voice (or under the clip's own audio), delivered at a stated
integrated loudness with a true-peak ceiling, and every third-party track is credited exactly as its licence asks.** Differences are per channel, below.

## 1. Per-channel summary

| Channel | Voice | Music | SFX | Loudness target | Captions |
|---|---|---|---|---|---|
| technews | dots.tts `warm-informational` + pitch-preserving `atempo` (default 1.2) | project-owned generated ambient beds (`engine/app/audio/bgm.py`), ducked about -32 dB under narration, -27 dB in safe swells | none specified | -14 LUFS, -1.0 dBTP (`pyloudnorm`, YouTube reference) | persistent pages with an active-word highlight, WhisperX timing |
| HES 2D/3D | dots.tts or OmniVoice/VoxCPM2, native timing | licensed rotating CC BY 4.0 library, stem-processed + sidechain ducking | synthesised from the physics of visible parts (`sfx_v3.py`) | -16 LUFS, LRA 7, TP -1.5 dB | decided ZDF-style spec (section 2) |
| Material Trials | none | none ("no beds, no reverb tails") | recorded **CC0 foley** placed on simulated impacts (`assets/sfx/LICENSES.csv`) | -16 LUFS +/-1.0 LU, TP ceiling -1.0 dB (QC accepts <= -0.5) | one line of text, fades in/out |
| Etcherr871 | none (creator's own clip audio) | only for silent clips, from `music/catalog.json`, energy <= 6.0, credited | none | clip audio -16 LUFS; music -24 LUFS (-30 under clips with sound) | agent-reviewed one-line caption in the card |
| ambient | none | the product itself (10 h beds), CC0 scans for textures | n/a | **-24 LUFS**, true peak about -2 dBTP, LRA 4-5, startle margin checked | none |

The loudness targets disagree on purpose (technews follows YouTube's -14 reference; the rest chose -16 or, for sleep content, -24). Do not "harmonise" them
without the owner; always state the target in the QA report and measure the **final muxed file**, not the narration alone.

## 2. Captions

**Which spec is in force.** "ZDF" in this repo means the YouTuber **Zack D. Films** (`@zackdfilms`), whose caption look the owner chose as the model
(not the German broadcaster). Decision of 2026-10-05, replacing a rejected style: **no Arial/Arial Black and no orange (or any coloured) spoken word** ("too common, linked to AI slop"). Source of
truth: `hidden-everyday-systems/experiments/style-research/STYLE.md` section 4 (marked "decided"), implemented by `experiments/zdf-3d-long/pipeline/captions.py`.

| | 16:9 (1920x1080) | 9:16 (1080x1920) |
|---|---|---|
| Font | **Montserrat Bold**, lowercase as spoken (proper capitals only for a single-letter name such as "Y") | same |
| Size | 72 px (about 6.7 % of height) | 84 px |
| Fill / outline | `#FFFFFF` / `#0E161C`, 6 px (7 px on 2D paper) | 5 px (6 px on 2D paper) |
| Shadow | offset (0, 5 px), blur 9 px, black about 47 % | same |
| Max width | 60 % of frame | 80 % |
| Position | chunk centre at **90 %** of height, above the progress bar, no background box | **70 %** (72 % for the 2D Short band; ZDF sits near 76 %, ours is higher to clear Shorts UI) |
| Chunking | **1-3 words, <= 18 characters**; break at punctuation/pauses; never end a chunk on a lone function word (the, a, an, of, to, and, in, its, so, on) | same |
| Highlight | **none** (no per-word colour, no karaoke) | none |
| Timing | chunk appears at its first word's start and stays until the next chunk starts; **minimum 250 ms on screen; clear it when the pause exceeds 400 ms** | same |
| Pop-in | scale 0.86 -> 1.07 -> 1.00 over 160 ms, opacity 0 -> 1 in the first 50 ms, ease-out-back (Remotion: `spring({damping:11, stiffness:260, mass:0.5})` mapped 0.86 -> 1); exit: hard cut | same |

Fonts: Montserrat TTFs in `<public>/hidden-systems/fonts/` (OFL). Thumbnail text uses Montserrat Black, not the caption weight.

**Persistent pages (older rule, still the guard against flicker).** HES invariant 6 (2D v2, 2026-09): caption pages stay visible between spoken words, the active word is
highlighted, and the band never flickers on voice activity; pages are stable five-word groups and never span a pause >= 150 ms (`PAUSE_GAP_MS`: measured ordinary word gaps 0 ms,
comma pause 300 ms, em-dash pause 380 ms, so 150 ms separates them), so a viewer never sees a future clause before it is spoken. technews' captions follow this older pattern
(persistent pages, not reset at scene boundaries, active word recoloured). **Which rule applies to a new video:** the 2026-10-05 ZDF-style spec (chunks, no highlight) governs HES 3D and any
new work; the persistent-page/active-word rule is legacy (HES 2D v2, technews). If you must keep a caption band on screen during pauses, never colour the active word with orange/yellow
in new HES work. Whatever the style, a caption must never flash on and off with voice activity, and must be inspected around acronyms, numbers, proper nouns and fallback-timed scenes.
The bundled `toolkit/renderer/src/hidden-systems/DoodleVideo.tsx` implements the *banned* style (Arial, `#FFD85C` active word): do not copy it.

Other rules: Shorts replace the CTA scene's captions with a "FULL VIDEO LINKED BELOW" pill and a bouncing arrow (HES). Captions must not cover the subject (check at transits). Deliver SRTs
(`captions.long.srt`, `captions.short.srt`) in the release folder; technews exports `captions.long.srt` via `engine/export_captions.py` (needs the engine; see the news-explainer subskill).

## 3. Timing: forced alignment vs proportional

Three modes exist (best first): WhisperX forced alignment (technews), faster-whisper ASR matched to the script (HES), proportional estimate. Details, thresholds (SequenceMatcher ratio >= 0.75),
and the repair rules are in `voice-tts.md` section 4. Rules: never present proportional timings as aligned; keep low-score repaired words in `needs_review`; for cue-word effects
(highlights on a spoken word, SFX hits, arrows) use the real word timings once narration exists, and treat estimates as provisional (HES gates re-run after narration). HES additionally
requires: speech starts at 0.0 s, the subject moves on frame 0, per-scene and program cadence 165-240 WPM, inter-scene silence gaps counted separately from WPM.
HES pacing constants: pipeline v3 defaults long lead-in 250 ms, 380 ms between scenes, 900 ms tail, 18 s end-screen hold; Short no lead-in, 180 ms gaps, 450 ms tail (the older constants in
`hidden_systems_production.py` are 900 ms lead-in, 1400 ms tail, 1000/500 ms scene gaps for long/short; the v3 `pacing` block overrides them).

## 4. Loudness and ducking

- **Measure the final mix** with ffmpeg `loudnorm` (EBU R128) in analysis mode (`print_format=json`) or `pyloudnorm`; report integrated LUFS, LRA, true peak.
- **HES:** narration concat is normalised with `loudnorm=I=-16:LRA=7:TP=-1.5`; the final program mix gets the same filter again after `amix`. Material Trials: two-pass loudnorm to -16 LUFS
  iterated until within 0.4 LU of target, then a ceiling limiter; QC fails outside +/-1.0 LU. Re-check after AAC encode: one episode's true peak rang to +5 dBTP after encoding, hence 256 kbps AAC.
- **Sidechain ducking under narration (HES stem):** `sidechaincompress` threshold 0.05, ratio 2.5, attack 60 ms, release 600 ms, knee 6 (about -5 dB while the narrator speaks), built on a bed that is first bass-cut
  and speech-dipped (section 5). technews' older target: about -32 dB under active narration and -27 dB in safe swells ("felt more than noticed"). Etcherr871 music is -30 LUFS under clips with sound.
- Listening stays mandatory: opening, every hard proper noun, two chunk boundaries, a dense mid scene, the CTA, the ending; check for masking, tonal mismatch, loop seams, distracting percussion,
  loud intros, and music competing with the CTA. Objective numbers are diagnostic, not approval.

## 5. Music policy (HES library; the pattern for any narrated channel)

- **Source:** a licensed, rotating library in `hidden-everyday-systems/examples/music-library.json` (schema_version 1.1): currently **12 tracks, all CC BY 4.0** (Kevin MacLeod / incompetech, Scott Buckley and
  similar), each recording `source_url`, `download_url`, `license`, `license_url`, verbatim `attribution`, `content_id` stance, `trim_seconds`, measured `integrated_lufs`, `loudness_range_lu`, `gain_db`.
  Files are not tracked in git: re-download from `download_url` into `<public>/music/`. Never buy a track without asking (Candlepower costs money and was skipped).
- **Selection:** a topic may name its bed (`P.music("<id>")`); otherwise deterministic rotation by slug. The long video and its Short use the same bed.
- **Levelling:** each track is levelled to `reference_lufs` **-18** by its `gain_db` (measured on the trimmed audio), then `relative_volume` **0.13** applies (raised from 0.065 on 2026-09-01 by owner request; music then sits
  about 16-19 dB under narration before final normalisation). `trim_seconds` cuts dead air so the loop seam is silent-gap free (validate rejects a gain that does not level a track and a trim shorter than 2 minutes);
  add a track by measuring integrated loudness on the trimmed audio plus `silencedetect` at -50 dB for the trim points. Fades: in 1.5 s, out 2.0 s.
- **Under the voice in every band (2026-09-25):** stem processing from `mix_policy.processing`: high-pass 150 Hz (2 stages, 24 dB/oct), -6 dB dip at 1500 Hz over 2.5 octaves, then the ducking above.
  Gate `audio_bands.py` (octave bands 63 Hz-8 kHz, over frames where the narrator speaks): **music** average at least **18 dB** under the voice per band, **22 dB** in the speech bands (250 Hz-4 kHz),
  loudest 5 % of frames at least **8 dB** under (reported as `music_under_voice`); **SFX bus**: same 18/22 but **6 dB** at the 95th percentile (`sfx_under_voice`). If short, the pipeline lowers the stem
  by the largest shortfall plus 1 dB per pass (up to 3 passes) and re-measures. `rejected` tracks must never be picked again: "Jellyfish in Space" was 10 dB over the voice at 63 Hz.
  Prefer sparse pads (the escalator video used Numinous Shine).
- **Attribution is a delivery requirement:** the exact credit text must be in the video description and `sources.md` (Kevin MacLeod and Scott Buckley run Content ID and clear claims only from their exact credit); QA's
  `music_credit` check fails a delivery without it. Describe third-party music as CC BY 4.0 with attribution, never as "no copyright"; for project-generated music the licence manifest records ownership instead.
- **Other channels:** technews generates original ambient beds from oscillators and filtered noise (selection hashes `niche_key:script_id`; mixed blockwise with SoundFile/NumPy rather than giant ffmpeg
  expressions). Material Trials uses no music. Etcherr871 uses only `music/catalog.json` tracks for silent clips (calm, energy <= 6.0, never Kevin MacLeod, `music.py add` refuses both), credited in
  `description.txt` and `sources.md`. 3D-track descriptions credit "Music: <title> by <artist>, CC BY 4.0 <link>; HDRI Poly Haven (CC0); textures ambientCG (CC0)".

## 6. SFX policy

- **HES:** sounds belong to a drawn part and play only while it is on screen and moving; hits are timed from the part's motion (proof: a step joint is at the comb tip on each knock frame); the camera is the
  listener (level, off-screen fade, stereo pan, muffling by covers); sounds are presets or per-topic recipes synthesised from the part's physics (`sfx_v3.py`, `P.sound(...)`, at least one sound required by
  `validate_sounds`); the SFX stem is ducked under the voice, levelled to pass the `audio_bands` SFX margins, and QA re-checks it. Chapter changes in long videos get one quiet procedural whoosh (never over the hook).
- **Material Trials:** recorded CC0 foley (licences logged in `assets/sfx/LICENSES.csv`) placed on impacts the simulation actually produced; crisp mix, no beds, no reverb tails, "near-dry room" (config `room_wet` 0.035, `room_seconds` 0.28);
  **no generative audio, video or 3D anywhere**. Rule of thumb for any new channel: an effect that does not correspond to a visible event is a defect.

## 7. Objective audio QA (quick reference)

`ffmpeg -hide_banner -i f -af volumedetect -f null NUL`; `-af silencedetect=noise=-45dB:d=0.15`; loudnorm JSON analysis; ffprobe codec/duration; per channel: MT QC checks duration (Short 12-60 s),
loudness within 1 LU of -16, true peak, longest freeze <= 1.0 s, mean luma > 4, loop seam, text-visible fraction <= 0.65 (`qa-gates.md` carries the complete list). A render that reuses the clean Short's audio must be
bit-identical (HES gameplay Short copies the AAC stream).

## 8. Contradictions and open questions

- Caption highlight: HES `SKILL.md` invariant 6 (and `visual-system/README.md`) say "highlight the active word"; the 2026-10-05 decision says no coloured word. This file treats the newer decision as governing and the
  older as legacy. Also, STYLE.md says "clear a chunk after a pause > 400 ms" while the older rule says keep the page up through gaps: unresolved for HES 3D long-form; follow `captions.py`.
- `experiments/zdf-3d-long/README.md` says "no orange anywhere: not in the highlight" and, two lines earlier, makes the part highlight orange `#FF8A3D`. The owner's note (2026-10-10, reverting a yellow trial) is: highlight stays orange;
  captions, thumbnails and UI contain no orange; yellow `#FFD21F` only for the thumbnail key word.
- Ducking figures differ: PIPELINE-V3 says "about -5 dB"; the compressor settings above are authoritative. HES `music-library.json` lists 12 tracks while docs say 13 (one rejected).
- technews tempo: 1.2 (code/compose/.env) vs 1.5 (its audio doc); loudness -14 (technews code) vs -16 elsewhere.
- Morocco-time slots affect nothing here, but see `release-calendar.md` for the disputed UTC offset.
