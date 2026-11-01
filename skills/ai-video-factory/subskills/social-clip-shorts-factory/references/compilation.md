# Compilation (long-form roundups with foreshadow interstitials)

Source: `compilation/builder.py`, `scheduling.py`, `config.py` (`CompilationPublishing`), decision SF-D6, `content-and-safety-standards.md`, README, test
`test_compilation_foreshadow_card_has_blurred_preview_and_audio`. A compilation is built FROM the channel's already approved Shorts; it is the highest-risk shape in this theme for rights and for
"reused content" policy, so the rules below are as much about restraint as about assembly.

Contents: 1 Trigger and eligibility - 2 Assembly algorithm - 3 The foreshadow card - 4 Long-form encode - 5 Metadata, chapters, thumbnails - 6 Rights and policy rules -
7 Known weaknesses of the archived builder - 8 Checklist

## 1. Trigger and eligibility (SF-D6)

Build for a channel when roughly **ten minutes** of eligible material exists: target **600 s**, never release below **540 s** (config `target_duration_seconds` 600 / `minimum_duration_seconds` 540;
bounds 120-3600). Eligible Short = same channel, `review_state == APPROVED`, and NOT used in any compilation created within `reuse_window_days` (**30**). Needs at least `min_clips` Shorts (code default **8**,
`config.example.yaml` sets **2** - the example config wins when you copy it; Shorts are at most 60 s, so 2 clips can never reach 540 s and the duration floor is the effective gate). Cap `max_clips` 60.
Cadence per channel: target 2 / min 1 / max 3 per week on `preferred_days` [Wednesday, Sunday]; `weekly` (alias of `compilations build`) loops `target_per_week_per_channel` times and stops at the first
`None`. The builder does NOT filter on rights: a compilation can be built from permission-pending Shorts; it just cannot become upload-ready (`approval-and-handoff.md` section 4).

## 2. Assembly algorithm (`CompilationBuilder.build`)

1. `candidates` = eligible Shorts ordered by creation time.
2. Accumulate Shorts (up to `max_clips`) until summed source duration >= target; if the total is < minimum -> build nothing.
3. Ask the LLM layer for order + foreshadows (`llm-layer-method.md` section 5); keep only ids that exist in the selection.
4. Walk the ordered list keeping `block_elapsed`; **before a clip, if `block_elapsed >= foreshadow_interval_seconds` (60, bounds 30-300) and it is not the first clip, insert a foreshadow card for THAT
   clip** (text = the foreshadow at its position, else "Next: <title>. Watch for the detail that changes the result."), then reset `block_elapsed`. So cards land at ~one-minute boundaries, never mid-clip.
5. Concat, re-encode, then write metadata, chapters, thumbnails and the DB rows (`compilations`, `compilation_items` with positions).

## 3. The foreshadow card (SF-D6: blurred preview, translucent white panel, written foreshadow, optional narration)

- Duration `interstitial_duration_seconds` **5.0** (bounds 2-12), 30 fps, 1080x1920, fade in 0.35 s and fade out 0.35 s.
- Background: frame at t = 0.2 s of the NEXT Short's video, fitted to 1080x1920, **Gaussian blur radius 28**, covered by a white overlay at alpha 190/255 (translucent white panel).
- Text (Arial Bold): label "COMING UP" 34 px `#4B5563` at (540, 650); foreshadow body 68 px `#111827`, wrapped at 24 characters, centred at (540, 960), line spacing 22.
- Audio: dots.tts narration of the exact on-screen text (if `tts.enabled`), loudnorm to -16 LUFS, padded/trimmed to the card duration; otherwise a silent stereo 48 kHz track. Narration is occasional,
  brief, warm, informative and must say what the card says - no continuous narration (`tts-narration.md`).
- Foreshadow copy rule: names the specific upcoming clip and one concrete visible detail to watch; no invented facts; no generic suspense; and **short enough to be spoken in 5 s** (about 12-14 words,
  `tts-narration.md` section 5) - the archived 150-character limit is too long for the narrated card.

## 4. Long-form encode

Concat demuxer over the sequence (Shorts + cards), then one re-encode: each 9:16 item scaled to fit **608 x 1080** and padded to a **1920 x 1080** canvas (`#111827`), libx264 CRF 21 preset medium,
AAC 192 k, `loudnorm I=-16 TP=-1.5 LRA=11`. QA expects 1920 x 1080 with an audio stream. Output folder: `output/<YYYY-WW>/<channel>/compilations/<timestamp>/` with `video.mp4`, `concat.txt`,
`metadata.json`, `title.txt`, `description.txt`, `chapters.txt`, `thumbnail_A/B/C.jpg`, `thumbnail_selected.jpg`. The intermediate card files stay in the folder.

## 5. Metadata, chapters, thumbnails

- Titles (5 options, first selected): "The Best <Channel> This Week", "<N> Moments Worth Watching", "A Full Roundup of <Channel>", "The Details Everyone Almost Missed", "This Week's Most Remarkable Moments".
- Description: "An original editorial compilation with new sequencing and commentary." + numbered list of the member titles. `metadata.credits` = the Shorts' descriptions.
- Chapters: one per segment, in whole seconds, formatted `MM:SS title` (cards appear as "Preview: <title>"). Chapters need the first at 00:00 and at least 3, each >= 10 s for YouTube to render them;
  the five-second cards break the >= 10 s rule, so chapter the Shorts only when publishing (this is a YouTube constraint reported from general knowledge, not from the sources - verify in Studio).
- Thumbnails: three 1280 x 720 candidates, flat accent-colour background with bold white text ("WEEKLY BEST", "DON'T MISS THESE", channel name); candidate A is auto-selected. They are placeholders;
  a real thumbnail should show the strongest frame (an owner-approved still), not a flat colour.
- Slot: next preferred weekday at 17:00 + channel index hours (`scheduling.py`).

## 6. Rights and policy rules

1. **Upload-ready only if EVERY member clip is rights-eligible**; the compilation inherits the strictest member status (README, standards, `ready_for_upload`).
2. Credits are mandatory and complete: creator + source URL + license per member. The archived description does NOT contain them (it lists titles only; `credits` holds descriptions) - generate a
   credits block from the `clips` rows (`creator`, `creator_url`, `source_url`, `license`) and put it in the description; keep `credits.csv` too.
3. Avoid recent reuse (30-day window) and never include a clip twice.
4. **Originality.** The only original contributions are the sequencing and the foreshadow cards. A compilation of other people's clips with thin framing is the form most exposed to reuse/originality
   enforcement (`rights-and-safety.md` section 4). Etcherr871 forbids compilations outright (R11). Treat this as an open owner decision per channel; if it proceeds, add real editorial value (grouping by a
   point, explanatory context per clip), keep honest disclosure of the synthetic narrator, and do not claim anything is original footage.
5. Check duration (>= 540 s), bridge spacing (~60 s), claim/foreshadow alignment with the visible clip, audio levels across cards and clips, chapters, credits, metadata before approval.

## 7. Known weaknesses of the archived builder (verify when restoring)

- Constant `hook = 0.8` is passed to the structure step, so the no-model fallback orders alphabetically by title.
- The 608 px-wide vertical strip in a 1920 px canvas leaves ~68 % of every frame as dark padding; acceptable for a first cut, poor for retention. Options: build a 9:16 long compilation, or a blurred side fill
  (as E871's `contain` framing does for single clips). No decision recorded.
- Narration volume (`tts.narration_volume`) is configured but not applied; narration is loudnormed instead.
- Concat of independently encoded files can drift on audio sample rate/format; the encode normalises, but listen at every seam.
- Chapter/credit data are derived from titles/descriptions, not from clip rows (see rule 2).
- Cards re-encode per compilation and are not content-addressed; only the TTS WAVs are cached.

## 8. Checklist before approving a compilation

Duration 540-~660 s | cards ~every 60 s, 5 s each | each card names the NEXT clip's real detail | narration (if any) reads exactly the card text and finishes inside 5 s | all member clips eligible |
credits for every member in the description | no clip reused within 30 days | 1920x1080 with audio | chapters | title/thumbnail honest | AI-voice disclosure decided.
