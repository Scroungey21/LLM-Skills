# QA gates, thumbnail, metadata and release

Compiled 2026-11-01. The archived niche specified very little here: V7 lists thumbnail generation as a **non-goal** ("until the master spec's deferred thumbnail tooling decision"), the generic
`metadata` step is unreachable in the default manual mode (section 3), and no manga-specific QA pass exists (panel accuracy is spot-checked, V7-REQ-4.4). So this file combines **archived rules**
(cited) with a **proposed recap QA pack** (labelled *proposal*) built from the shared gate catalogue. Shared gates are in [qa-gates.md](../../../references/qa-gates.md); do not re-list them, apply them.

## 1. Gates by stage (fail closed; measure the final artifact)

| Stage | Gate | Source |
|---|---|---|
| Rights | `RIGHTS.json.status == verified` before any raster/crop; basis and evidence recorded; `fair_use_candidate` only with a human-written four-factor memo, default reject | V7-REQ-2.x, V7-INV-1 |
| Duplicate | series + chapter range not already in `ledger.json` (byte-identical PDF is also refused by the archive) | *proposal* + V7 dedup |
| Panel parse | page JSON valid (bounds, order, non-empty), crops exist, contact-sheet check done, uncertain panels flagged | [panel-parsing.md](panel-parsing.md) §4-6 |
| Panel resolution | effective upscale of each used panel <= ~1.5 or re-rasterized | *proposal*, [panel-parsing.md](panel-parsing.md) §7 |
| Safety | content-rating pass over `visual_description` + dialogue; sexualised minors and graphic material handled per owner decision | R5 in [sourcing-and-rights.md](sourcing-and-rights.md) (*proposal*; the archived niche had no safety stage) |
| Script | every scene has a valid `panel_id`; no scene narrates another panel; hook scene 0; scene dwell 3-9 s (hard bounds 1-15 s); word budget set from selected panels, not the 240 s default | [script-and-narration.md](script-and-narration.md) §1-5 |
| Fact-check | every claim `traceable` against its own panel; correction pass rules; unfixable => stop | V7-REQ-5.4/5.5; [script-and-narration.md](script-and-narration.md) §6 |
| **Gate 1** | **human approves the script** (both modes) | v5/v7 |
| Narration | audition one hook + one dense line before a batch; no crackle, dropped words, chunk seams, wrong names/honorifics (listen to every proper noun); tempo decided and recorded; same voice for long and Short | [voice-tts.md](../../../references/voice-tts.md) §6, [audio-captions-music.md](../../../references/audio-captions-music.md) §7 |
| Timing | every screen has `resolved_start_time` from alignment, in order, no gaps/overlaps; captions aligned (no "proportional" timing presented as aligned) | V7-REQ-7.1, V7-INV-4/5 |
| Stills / frames | see section 2 | *proposal* |
| Captions | shared 16:9 and 9:16 specs; none over speech bubbles or panel lettering; within safe areas; checked around names, numbers, acronyms | [qa-gates.md](../../../references/qa-gates.md) §6 |
| Audio mix | final-mux loudness measured against the channel's stated target (archived chain: -14 LUFS), true peak, music >= the shared margins under the voice, credits present | [audio-captions-music.md](../../../references/audio-captions-music.md) §4-5 |
| Format | 1920x1080 30 fps long, 1080x1920 Short, H.264 + AAC 192k 48 kHz, thumbnail 1280x720 | [qa-gates.md](../../../references/qa-gates.md) §13 |
| **Export acknowledgment** (manual mode) | a human reviews the NLE package and acknowledges it (the "7th gate") | V7-REQ-8.6 |
| **Gate 2** | **human approves the final render** after objective QA + listening + frame inspection; nothing is uploaded without explicit authorisation | v5/NEWS rule, [agent-principles.md](../../../references/agent-principles.md) §5 |

Not applicable here: the physics channel's "longest freeze <= 1.0 s" gate (recap stills are held by design); instead keep dwell inside 1-15 s and prefer 3-9 s.

## 2. Visual QA pack for recaps (*proposal*)

Sample frames at the hook, every cut where the page changes, one frame inside each long dwell, the CTA and the last frame; build a contact sheet per ~10 s and inspect at full size once. Check:

- **Right panel, right moment**: the image on screen is the panel the sentence describes (the boundary rule, visually); no panel repeated by accident, no skipped beat.
- **Whole panel visible**: not cropped by the frame (the portrait-overflow finding, [composition-transitions-export.md](composition-transitions-export.md) §1), not clipped mid-bubble by the crop.
- **Legible**: text inside the panel can be read at phone size when it matters to the line; otherwise the narration must carry it.
- **Backdrop**: the blurred background does not distract, matches the panel's palette, and the blur is consistent across the video.
- **Reading direction** consistent with the source; any pan follows it.
- **Captions** clear of lettering and of the Shorts UI in 9:16.
- **Transitions** are what was authored (remember `simple_transition` renders as a hard cut in the archived renderer).
- **Watch once muted, listen once without watching**; both must make sense (NEWS rule, [qa-gates.md](../../../references/qa-gates.md) §16).

## 3. Metadata and thumbnail

**Archived behaviour (code):** the final `metadata` step drafted `title_candidates` (>= 1), a `description_addition`, a thumbnail hook (<= 72 chars), a visual direction (<= 240 chars), a thumbnail scene index and frame ratio (0.12-0.88, default 0.35), then a human finalized the pick; it appended every `script.source_citations` URL missing from the description and rendered a frame-based thumbnail from the finished video.
Two defects for this niche (found by reading, not by running): (1) the step starts only when the project's latest `render_jobs.status == "done"`; a manual-mode project has **no** render job (V7-INV-8), so `metadata` never advances and no thumbnail is generated in the default mode; (2) for manga, `source_citations` is `[raw_item.url]`, i.e. the synthetic `manga-upload://<sha256>` fingerprint, which would be appended to the description as a "source". Do metadata and thumbnail yourself, outside any restored pipeline.

**Description checklist (*proposal*; mirrors the music-credit and source-URL rules in [qa-gates.md](../../../references/qa-gates.md) §14):**
1. One-sentence hook + spoiler policy line.
2. **Work credit**: title, creator(s), publisher; the **rights line** (basis and licence reference or verification note, as recorded in `RIGHTS.json`); a link to the **official/licensed place to read the work**.
3. Chapter range covered, and timestamps/chapters generated from the manifest (`resolved_start_time` of the first screen of each beat).
4. Music/voice credits exactly as their licences require; synthetic-voice and AI-assistance disclosure as decided in R7.
5. Full-video link in the Short; Short link in the long.
6. No claim of "no copyright", "fair use" or "license-free"; never state a platform-classification outcome as guaranteed.

**Title:** specific and faithful to the script; the work's real name; do not imply an official channel or affiliation. **Thumbnail:** 1280x720 PNG, one dominant subject (a single strong panel crop or the composed still), 2-4 word hook in the channel type style, legible at 10-15% scale, truthful to the content; use panel art only if the recorded basis covers it (R10). Inspect full-size and at ~10-15% ([qa-gates.md](../../../references/qa-gates.md) §7, §14).

## 4. Release

Release folder and manifest are private by default; the pipeline never publishes. Use the shared calendar mechanics ([release-calendar.md](../../../references/release-calendar.md)): folder `<YYYY-MM>/<DD>/<slug>/` with the final MP4(s), thumbnail, `description.txt`, a `sources.md` that holds the rights/credit lines, `manifest` with sha256 and size; update the channel ledger (series + chapter range -> `scheduled`/`released`); timezone `Africa/Casablanca`; **ask the owner what is actually live before assuming a slot's state**; a past slot is reported, not silently filled. Upload only on explicit authorisation in that turn.

## 5. Post-release learning (thin everywhere in this repo)

Record per video: series, chapter range, panel count used / total, runtime, rights basis, voice, tempo, which hook style, platform decisions (age restriction, claims, strikes, disclosure answers) and what the owner changed at the gates. Keep Content ID claims and any policy notice with the rights evidence. The repo holds no audience data for this niche; treat every performance expectation as a hypothesis and say so.

## 6. Completion report (copy this shape)

Files with absolute paths; counts (pages, panels extracted/used, scenes); runtime and resolution; codecs; loudness numbers of the final mux; rights basis and evidence file; what was rejected and why; what was **not** verified (human listening, real-Remotion loading of panel images, platform policy, claim status); open owner decisions. Never claim a gate passed that you did not run.
