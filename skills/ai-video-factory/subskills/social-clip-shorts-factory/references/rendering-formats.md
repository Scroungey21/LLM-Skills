# Rendering formats: the branded Short, audio mix, QA and the preview slate

Source: `rendering/short.py`, `rendering/qa.py`, `media/ffmpeg.py`, `audio/music.py`, `examples.py`, `examples/*.yaml`, `content-and-safety-standards.md`, decisions SF-D3/SF-D5, test
`test_short_crop_fill_and_original_audio_music_mix`. Numbers are read from the code unless marked otherwise.

Contents: 1 Short format and layout - 2 Framing hazards - 3 Audio chain - 4 Encode and QA - 5 On-screen context rules - 6 Preview slate - 7 Compare with Etcherr871

## 1. Short format (SF-D3: remove black bars by crop-fill; original audio stays dominant)

| Item | Spec |
|---|---|
| Canvas | **1080x1920, 30 fps, H.264 (libx264, preset medium, CRF 20, yuv420p), AAC 192 kb/s, `+faststart`**, `-shortest` |
| Background | solid `#FAFAF7` header canvas drawn once with Pillow and looped as a still input |
| Avatar | real-photo PFP, 112 px circle at (64, 64); fallback = accent-coloured circle + channel initial |
| Name / handle | display name 39 px `#111827` at (204, 78); handle 29 px `#6B7280` at (204, 130) |
| Context text | at (64, 235), `#111827`; **58 px, wrap 30 chars if the text is < 70 characters, else 48 px, wrap 36**; line spacing 12 |
| Video window | black rounded rectangle (55, 495)-(1025, 1785), radius 32, with the clip overlaid at (65, 500) as a **950 x 1280** crop-fill (`scale=...:force_original_aspect_ratio=increase`, then centre crop); the clip itself is not rounded |
| Duration | whole clip up to 60 s (no segment selection), minimum 3 s |
| Font | Windows `arialbd.ttf`, else DejaVu Sans Bold, else PIL's tiny default bitmap font (a visible quality drop on a machine without either) |
| Streams | video + audio always present in the output (silent track synthesised when needed) |

Format rules fixed by the owner: crop-fill (no side black bars, no stretching); no stock footage; **no TTS in Shorts**; the branded top area carries PFP + name + handle + concise context
(SF-D2, SF-D3, SF-D4). Reference the live PFP provenance in `routing-and-channels.md` section 5.

## 2. Framing hazards (computed from the 950 x 1280 window, aspect 0.742)

Crop-fill keeps the whole window filled but throws content away: a **9:16 source keeps ~76 % of its height** (full width); a **1:1 source ~74 % of its width**; a **4:5 source ~93 %**; a
**16:9 source only ~42 % of its width** (the middle strip). The code crops at the exact centre (the standards doc says "center-aware", which the code is not). Consequences for Claude's review:
- Reject or re-frame (a) landscape clips where the action is not central, (b) faces/subtitles at the edges, (c) clips whose burned-in captions get cut mid-word.
- The sibling Etcherr871 learned the same lesson and offers a `contain` framing (whole clip over a blurred fill) for these cases
  ([../../clip-card-shorts/references/principles-and-rules.md](../../clip-card-shorts/references/principles-and-rules.md) section 2): "losing the joke to save the fill is never worth it". A
  `framing: contain` option is a sensible port; it conflicts with SF-D3's wording only if "remove side black bars" is read as "always fill".
- The window runs to y = 1780; the Shorts UI covers roughly the top 8 % and bottom 20 % (figures used in the shared QA gates), so the lowest ~240 px of the video and the PFP row at y 64-176 can sit under
  platform UI. Check a rendered frame on a phone-sized view before trusting the geometry.
- Arial Bold is used throughout. The owner's "no Arial / no orange active word" caption rule is HES-specific (memory: ZDF caption style) and does not bind this channel, but it shows the owner dislikes the
  generic look; consider the E871 Segoe UI cards or a distinct brand font if the channel launches.

## 3. Audio chain (SF-D3; `render_short`)

- Original audio is kept at `original_volume` 1.0 and must remain easy to hear: speech and meaningful sound come first. `audio.require_original_audio` (default true) rejects silent sources at
  intake - a deliberate difference from E871, which keeps silent clips and adds a calm bed.
- Optional licensed music bed: `music_volume` **0.2** (looped, padded/trimmed to the clip). With source audio: `amix=inputs=2:duration=first:dropout_transition=0:normalize=0`, then
  `loudnorm=I=-16:TP=-1.5:LRA=11`. With no source audio: bed alone at 0.2 then `loudnorm=I=-20:TP=-2:LRA=11`. Without music: `volume` then `loudnorm=I=-16:TP=-1.5:LRA=11`.
- Track choice is deterministic: `sha256("clip-<id>") mod n_tracks` over licensed tracks, so a re-render keeps its bed. Tracks need license sidecars (`rights-and-safety.md` section 8). With no
  licensed track the Short ships with original audio only (the example library holds a single CC0 loop; add more for variety).
- Loudness -16 LUFS integrated matches the HES/MT/E871 targets in the shared gates ([../../../references/qa-gates.md](../../../references/qa-gates.md) section 12), which state no rationale for -16.
  The pipeline measures and normalises; it does NOT check the music-vs-voice masking that HES gates by octave band: listen for a bed that fights speech (the 0.2 gain is a flat choice, not measured).
- Shorts metadata always records `shorts_tts: {enabled: false}`, `music` path and `music_volume`.

## 4. Encode and technical QA (`rendering/qa.py`)

`qa_video(ffmpeg, path, 1080, 1920)` returns `{passed, issues[]}`; fails on: probe error, missing video stream, wrong dimensions, missing audio stream, file missing or < 10,000 bytes.
A failed render is deleted and the clip becomes `QA_FAILED` (nothing is numbered or written). That is all the code checks: duration against the source, frozen frames, text overflow, audio clipping and
black frames are NOT measured. Add them before relying on it unattended (shared catalogue: [../../../references/qa-gates.md](../../../references/qa-gates.md) sections 7 and 13; E871 uses a stricter
2-60.5 s window and a 100 kB floor). FFmpeg is invoked with argument arrays (`-hide_banner -loglevel error -y`), non-zero exit raises `MediaError`; never shell-compose untrusted paths.
Rendering writes to a hidden temp name (`.<n>.rendering.mp4`) and renames only after QA passes, so a crash never leaves a half-written numbered file.

## 5. On-screen context rules (SF-D5)

The text must identify a **verified** premise, mechanism, technique, timing detail or observation that changes what the viewer notices. Forbidden: fabricating a person, place, motive, causal claim,
measurement or backstory; generic praise; "wait for it"; redundant description; explaining away the punchline. The metadata keeps `claim_confidence` and `supporting_evidence` so the reviewer can check
the claim against the footage. Preview-slate examples show the intended tone: "The puppy checks the person's reaction before deciding whether to move closer." (observable behaviour), "Each lower
percentage swaps in a more desperate reaction; escalation is the structure." (names the joke's mechanism without spoiling it).

## 6. Preview slate (`shortsfactory examples`)

Purpose: audition the brand look on nine real posts before any production run. Rules: exactly **3 items per active channel** (9 for three channels), platforms instagram / tiktok / x
(the tracked `preview-slate.yaml` template is all `discovery_only` placeholders `REPLACE_n`; the shared `local-instagram-preview-slate.yaml` lists nine local files with `preview_only: true`).
An item renders only if its rights are eligible OR it is `preview_only` with a `local_path` (sources without a local path are downloaded from `media_url` into `data/preview_sources`, 750 MB cap).
Each preview is capped at 25 s, gets a poster frame (at min(2 s, duration/2)), a `metadata.json` (`publishable` only if rights eligible, `upload_enabled: false`, `shorts_tts` off) and a card in
`output/brand-previews/index.html` ("N channel previews - upload disabled"), plus `preview_manifest.json`. `--force` rebuilds. Test: `test_preview_slate_has_three_examples_per_channel`
(3 per channel, 9 unique slugs, platforms {instagram, tiktok, x}, all `discovery_only`, no Pexels URLs).
The nine local previews built before the 2026-09-01 consolidation were never published and are gone with `output/` (not tracked); rebuilding needs the owner's inbox files.

## 7. Compare with Etcherr871 (what the two formats share and where they differ)

Both: 1080x1920/30 fps, H.264 CRF 20 + AAC 192 k, -16 LUFS, a card with avatar/handle and ONE context line, the clip's own audio, never stock, never TTS. Differences: ShortsFactory = fixed
branded template + crop-fill + 60 s cap + 0.2 music over real audio; E871 = Frame Studio/`xpost`/snap/meme styles (7 edit styles, 2-60.5 s QC, loudnorm to -16 with beds only for silent clips,
`thumb_time` thumbnail, `upload-manifest.json`). A new channel should pick ONE card system and keep it; do not mix the two layouts in a single brand.
