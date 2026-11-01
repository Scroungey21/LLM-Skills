# QA and release gates (news-explainer)

Merged from: old skill `qa-release`, `validate-deliverables.ps1`, `LITMUS_QUALITY_PROFILE` (nine systemic rules from the 2026-09-05 dual audit of six productions: garmin-fenix9-pro, cyber-plc-ai-attacks, chrome-v8-zeroday-85046, gpt6-astra-critical-cyber, idscan-net-breach-153m, amazon-ftc-ad-auction), playbook section 7.

Contents: 1 Principle - 2 Automated checks - 3 The nine LITMUS rules - 4 Editorial QA - 5 Audio QA - 6 Visual QA - 7 Delivery QA - 8 Completion report

## 1. Principle

Approve nothing without inspecting the **final rendered `video.mp4`/`short.mp4`** (several defects were invisible in script/screen JSON and only appeared in the encode). A script or manifest being correct is necessary, not sufficient. Automated checks cannot approve creative quality. Never substitute an old render or hand-edit provenance to make a gate pass. No upload/publish without explicit user authorisation. Never guarantee platform classification or detection outcomes.

## 2. Mandatory automated checks (`ai-video-factory/scripts/validate-deliverables.ps1 -Slugs ...`)

For every full/Short pair:
- required files exist and are non-empty: `video.mp4`, `short.mp4`, `meta.json`, `thumbnail.png`, `full-script.json`, `short-script.json` (the validator does **not** check `captions.long.srt` or `thumbnail-background.png` - check by hand before scheduling; `schedule_release.py` refuses a package lacking `captions.long.srt`);
- `meta.json` parses; full and Short titles/descriptions non-empty;
- `meta.short.cta` equals the settled CTA **byte-exactly** (case-sensitive compare);
- every `meta.sources[].url` appears in both the full and the Short description;
- ffprobe: H.264 video + AAC audio, **48 kHz** audio; full is landscape (width > height), Short portrait (height > width);
- thumbnail is exactly **1280x720** (validator needs Pillow in `<repo>/.venv`);
- duration/resolution/SHA-256 recorded for the final handoff; release calendar exists; hashes correspond to the latest render.
Also run at the end of any change to the CTA: grep the whole codebase/docs for CTA-adjacent literals (rule 7).

## 3. The nine LITMUS rules (walk each against the rendered files)

| # | Rule | How |
|---|---|---|
| 1 | **Audio floor/ceiling (Automated)**: head silence 0.0 s; tail silence <=0.6 s; integrated loudness -14 LUFS +/-1.5 LU | `ffmpeg -i video.mp4 -af silencedetect=noise=-40dB:d=0.3 -f null -` (a `silence_start: 0.0...` = dead air at open; final `silence_duration` <= 0.6 s); `ffmpeg -i video.mp4 -af loudnorm=print_format=json -f null -` read `input_i` (-20 to -22 means 6-8 dB under the platform target). Root cause class = render-pipeline constants (`PRESENTATION_LEAD_IN/TAIL_OUT_SECONDS`, the `loudnorm` filter) - a one-line fix |
| 2 | **Claim/evidence and comparison components valence-neutral (Visual)** | badge colour/icon/side styling from semantic role, never column/list position; neutral title unless adjudicating a claim |
| 3 | **Flow/process badges status-driven (Visual)** | no auto "CRITICAL" on the last step; explicit per-step `status` |
| 4 | **Terminal mockups use story-appropriate content (Visual)** | prompt/command/output from the story or neutral default; check the component's default prop in source |
| 5 | **Evidence-card metadata reflects the real per-story headline (Visual + grep)** | grep for hardcoded evidence-card titles/labels; purge legacy "reaction GIF" labels; attribute GIFs "Original LITMUS editorial reaction" (or current equivalent) |
| 6 | **Shorts carry a source-citation screen (Visual)** | frame-sample the first 30-40% of the Short for verified badge + domain + headline |
| 7 | **CTA wording matches the single canonical constant exactly (Automated grep)** | exactly one `SHORTS_CTA` constant; every chapter-card subtitle, narration cue and validator regex must match byte-for-byte; grep `produce_test_videos.py`, `narration_beats.py`, manifests/docs; a mismatch ("in the comments and description" vs "in the description") is a defect, every hardcoded duplicate is a defect |
| 8 | **Phonetic TTS text must not leak into captions/cards (Visual, flagged not auto-fixed)** | "V eight" instead of "V8", "one hundred fifty-two point zero..." instead of "152.0.7977.82"; fix is authoring-time dual fields (spoken vs display); flag any card whose primary value is a spelled-out string; no blind phonetic-to-numeral regex |
| 9 | **Validate through the actual rendered video, never JSON alone** | loudness, silence, badge colour and caption text as rasterised |

## 4. Editorial QA

Every material factual claim has an authoritative source; numbers, versions, prices, dates, benchmark conditions and availability are qualified; title/thumbnail do not overstate the evidence; technical concepts are explained for an intelligent non-specialist; cyber content separates observed facts, capability, speculation and defence (no exploit instructions); the Short is coherent, has a primary-source citation screen and the exact CTA; all blocking fact-check flags resolved; claim ledger archived with the package; grep titles/descriptions for pipeline artifacts.

## 5. Audio QA

Listen to full and Short, not only waveforms (also once without watching; once muted-watching). Same synthetic male voice identity; no crackle, metallic resonance, echo, clipped syllables, duplicated/missing words, jarring joins or rushed unintelligible passages; captions match speech around proper nouns, numbers and scene boundaries; fallback alignment disclosed as `needs_review` and manually checked; music extremely low/appropriate/smoothly looped and never masks narration or the CTA. Inspect: opening, every difficult proper noun, two chunk boundaries, a mid-video dense scene, the Short CTA, the ending. Details/thresholds: `audio-tts.md`.

## 6. Visual QA

Thumbnails at full and ~10-15% mobile scale; frames across the entire timeline (hook, each transition, +1 s after, mid-scene, near CTA, ending; contact sheet every 5-10 s); visuals correspond directly to narration and include evidence/context imagery, not charts alone; no malformed diagrams, unreadable text, clipping, dead space, generic repetitive layouts or vertical-safe-area violations; **GIF count 0 by default, never >3**; any screenshot/evidence image faithful and attributed; no frozen tail frame; probe master: 2560x1440, 30 fps, H.264 at the established 24 Mbit floor, AAC 192 kb/s 48 kHz stereo, correct duration. Component rules (valence, status badges, terminal defaults): `visual-rendering.md` section 3.

## 7. Delivery QA

`meta.json` refers to the files actually delivered; source URLs resolve and appear in both descriptions; timestamps/hashes match the latest render (the old three-video SHA-256s are obsolete - superseded by render jobs 31-36; compare against each calendar folder's `upload-manifest.json` `sha256`); full and Short scripts packaged with video, caption file, claim ledger, source manifest, thumbnail and companion Short; planned release folders exist; ledger updated; `upload-manifest.json` drift check (a package whose `output/test-productions/<slug>/` has a newer mtime than its calendar copy must be re-scheduled with `--force`); no upload/publish without explicit authorisation.

## 8. Completion report

Report absolute clickable paths, measured runtimes, resolutions, codecs, source coverage, and known review flags (e.g. alignment `needs_review`, human listening outstanding, evidence images that are procedural not captured). State what passed, what was rejected and regenerated, and what was **not** verified. Report failed gates instead of silently publishing around them. The orchestrator should stop only for a genuine editorial or rights decision it cannot safely infer.
