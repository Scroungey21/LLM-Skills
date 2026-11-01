# Horror-story QA gates

Contents: 1 Principles · 2 Source and rights gates · 3 Safety and selection gates · 4 Script, narration and caption gates · 5 Metadata, thumbnail and title gates · 6 Visual gates ·
7 Audio gates · 8 Render, format and delivery gates · 9 Vertical Short gates · 10 Process and release gates · 11 Archived tests that pin the behaviour

Scope: this file is the horror-specific layer on top of the shared catalogue `../../../references/qa-gates.md` (read its §1 principles and §13 render/format gates; its numbers for HES/NEWS/MT/E871/AMB do **not**
transfer). Labels: **[A]** archived rule/test, **[N]** new gate, *uncalibrated* = starting value. A gate **fails closed**: a failed gate rejects the take/asset, it never permits patching a number.

## 1. Principles

1. Measure the **final encoded MP4** (frames, decoded audio), not JSON or manifests. Objective numbers support, and never replace, a human watch and listen.
2. Where a gate needs a judgement (safe, fits, refuted), the agent writes a verdict **file** and code validates it ([safety-clustering-founding.md](safety-clustering-founding.md) §8).
3. Prove a new gate is live by deliberately breaking an input once and watching it fail.
4. Never state a platform outcome (age restriction, monetisation, claim) as guaranteed; report what passed, what was rejected, what was not verified.

## 2. Source and rights gates (Gate S)

| Gate | Rule | Source |
|---|---|---|
| S1 | Every story has a `story_rights.json` entry in a publishable state; `denied`, `no_reply`, `unpermissioned_public` block Gate 1 | [N] |
| S2 | Permission scope covers adaptation, monetised video and Shorts; credit text recorded verbatim | [N] |
| S3 | Story not already spent: absent from `horror_story_selections` / `story_ledger.json`; identical trio fingerprint `horror-blend://<sorted ids>` unused | [A] V8-REQ-5.3/5.4, `DuplicateHorrorSelectionError` |
| S4 | Credits for CC/permissioned stories, music and SFX are in the description verbatim (the music-credit check pattern) | [N] on [A] pattern |
| S5 | Asset licences logged per file; Tier 3 never; Tier F only via a completed human fair-use memo | [A] V5-REQ-5.1-5.7 |

## 3. Safety and selection gates (Gate X)

| Gate | Rule | Source |
|---|---|---|
| X1 | Every candidate has a `ContentSafetyVerdict` (`passed`, `reasoning`, `flagged_categories`); `passed:false` -> story rejected, absent from all lists; `passed:true` has empty categories | [A] V8-REQ-4.4, V8-INV-2 |
| X2 | Clustering input = passed + unclustered only; output covers each id exactly once; unknown ids dropped; re-run creates no new clusters | [A] V8-REQ-5.1, tests `test_v8_8_clustering.py` |
| X3 | Founding = exactly 3 distinct ids, same non-null cluster, all passed; cross-cluster selection rejected (HTTP 400) | [A] V8-REQ-5.2 |
| X4 | Policy screen on the **blended draft** passed: self-harm, minors, sexual violence, real events, identifiers, instructional content ([safety-clustering-founding.md](safety-clustering-founding.md) §3) | [N] |
| X5 | No real name, address, plate, workplace or small-place identifier survives | [N] |

## 4. Script, narration and caption gates (Gate 1 = human approves script)

| Gate | Rule | Source |
|---|---|---|
| C1 | One blended arc; scene 0 is the only hook; no banned opener ("have you ever wondered", "what if I told you", "in this video", "welcome back") | [A] V8-REQ-6.4; list [N] |
| C2 | `no_verbatim_check`: no 6+ word run copied from any source; no source sentence reproduced | [A] V8-REQ-5.6 (rule); the 6-word diff threshold is [N] |
| C3 | Dread structure present: baseline, anomaly, refutation, 3-4 escalation steps, held breath, at most the budgeted jumps, aftermath | [N] |
| C4 | Word budget computed from the **accepted narration pace**, not 225 wpm; runtime inside the declared range | [N] (corrects an [A] inherited constant) |
| C5 | Fiction labelling text drafted (description + pinned note); no "true story"/"real" claims | [N] |
| C6 | Narration native pace in the channel window (starting 120-150 wpm, *uncalibrated*) on the accepted take; reject outside, never `atempo`/stretch | [N] on shared native-pacing rule |
| C7 | Dry voice; one voice per video; voice has a provenance JSON with consent/licence; not the archived `warm-informational` | [N] on `voice-tts.md` §3 |
| C8 | Reject by ear: robotic, reverberant, audibly stitched, crackle, metallic fizz, word omissions/repeats, clipped endings (listen: opening, held breath, jump line, a mid scene, ending) | shared `qa-gates.md` §5 |
| C9 | Captions: spec from the channel decision (default: Montserrat Bold lowercase, 1-3 word chunks <= 18 chars, no coloured word); check around proper nouns, numbers, scene joins, fallback-aligned scenes; never cover the plate's focal point/threat; clear of Shorts UI (top about 8%, bottom about 20%) | shared `audio-captions-music.md` §2 |
| C10 | Word windows per screen come from absolute-time overlap, never `scene_index` | [A] V8-INV-9, `test_windowed_words_overlap_semantics` |
| C11 | Agent never auto-approves Gate 1; the human reads the whole script aloud once | shared `agent-principles.md` §5 |

## 5. Metadata, thumbnail and title gates

| Gate | Rule |
|---|---|
| M1 | Title <= 100 characters, no "REAL", "TRUE STORY", "caught on camera" or other factual-claim packaging for fiction; no slurs; no gore words for their own sake [N on shared §14] |
| M2 | Description: fiction/adapted statement, story credits (verbatim), music/SFX credits, AI-use statement (what was generated and which tool classes), content note for intense videos, link to the long video (Shorts) [N] |
| M3 | Audience: **not made for kids**; AI-disclosure flag set from the provenance file; if photoreal generated places or AI music are used the flag is Yes [N on VERIFIED YT-02] |
| M4 | Thumbnail 1280x720, inspected at full size and at 10-15% scale; implication not gore; at most 3-4 words; no real person's face; no stock watermark; legible on a phone [N on shared §14] |
| M5 | Mid-roll ads (long-form >= 8 min): set slots manually at baseline/aftermath transitions, **never inside the escalation or held breath**; automatic slots are the Studio default and must be reviewed [N on VERIFIED YT-06] |
| M6 | Chapters only if they do not spoil the break (use neutral labels or none) [N] |
| M7 | Metadata `sources`/credits array equals the credits in the description; hashes and sizes fresh [shared pattern] |
| M8 | `policy_snapshot/` dated and present for the policy rows the video depends on ([policy-risk-register.md](policy-risk-register.md) §4) [N] |

## 6. Visual gates

| Gate | Rule | Source |
|---|---|---|
| V1 | Three-view inspection of every plate: full resolution, contact sheet, inside the real composition; reject malformed anatomy, warped hands/faces, accidental text/logos, alpha halos, diffusion sheen | shared `qa-gates.md` §7 |
| V2 | No clip/plate holds longer than `background_variety` (default 4000 ms) except a recorded "break" exception; schedule sums to the screen duration | [A] V8-REQ-6.3 / RD-131, `test_expand_background_schedule_*` |
| V3 | Pool rotation: consecutive screens do not start on the same plate | [A] regression test |
| V4 | Visual filter identical in preview and export (overlay inside the Remotion tree, never `ffmpeg -vf`) | [A] V8-INV-3 |
| V5 | Frame samples across the whole timeline: hook, every plate change, +1 s after transitions, mid-scene, the break, the ending; contact sheet every 5-10 s; nothing frozen > ~1 s in the picture (plates keep drifting); text size legible at the 9:16 render size | shared §7, [N] thresholds |
| V6 | Plate provenance: tool, weight/licence, version, prompt/seed or authorship per plate; non-commercial weights absent | [N] on report-05 §6 |
| V7 | The on-screen threat of the break is visible and not covered by captions | [N] on case-digest principle |
| V8 | No flashing > 3 per second; `vhs_distortion` not at full strength | [N] (R15) |

## 7. Audio gates

| Gate | Rule |
|---|---|
| A1 | Final muxed file: integrated loudness within 1 LU of the channel's recorded target (recommended -16 LUFS, or -14), true peak <= -1.5 dBTP (or -1.0 with -14); measured after AAC encode (256 kbps) [N on shared §12/§13] |
| A2 | Bed under voice (speech bands 250 Hz-4 kHz, frames where the narrator speaks): >= 12 dB under the voice at start (*uncalibrated*); stricter if listening shows masking [N] |
| A3 | Every SFX/sting aligns to a visible or narrated event; none in the held breath; stings limited [N on shared rule] |
| A4 | Bed is project-owned/own-recorded; SFX are CC0 (or credited); licences logged; nothing pitch/speed-shifted from third parties [N on report-05] |
| A5 | AI-generated audio (if any) is licence-checked (no CC-BY-NC weights) and disclosed [N on report-05 §6.3] |
| A6 | Silent gaps are intended (held breath, scene joins); no dead air longer than the script's own pauses; no click or seam at scene joins or bed start/end [N] |

## 8. Render, format and delivery gates

Shared gates apply (`../../../references/qa-gates.md` §13/§15). Horror-specific: composition renders from a JPEG frame sequence + system ffmpeg mux (never `renderMedia`); declared master size recorded (1920x1080 or 2560x1440; 1080x1920
or 1440x2560); H.264 + AAC with stated bitrates; `aspect_ratio` field correct for derived builds (a vertical build previewing at 16:9 was a real archived bug); delivery folder contains the video(s), thumbnail, captions SRT, description,
`story_rights.json`, provenance (plates, audio, voice), `policy_screen.json`, `qa_report.md` with measured numbers and what was **not** verified.

## 9. Vertical Short gates

| Gate | Rule | Source |
|---|---|---|
| H1 | Parent was Gate-2 approved; parent is cis/original; no existing derivative unless the owner allowed more | [A] V8-REQ-8.1/8.6, V8-INV-8 |
| H2 | Condensed script ran editor critique and fact-check grounded in the **parent script**; no new facts or story elements | [A] V8-INV-4 |
| H3 | Hook in the first 2 s; one beat; at most one pattern-interrupt; ends with the single CTA constant (`...check the full video in the description`) | [A] condensation prompt + `ensure_shorts_cta` |
| H4 | Runtime <= 60 s (target 55); word budget from accepted pace | [A] 55 s; older shared gate < 59.5 s; pace [N] |
| H5 | 9:16 canvas confirmed (1080x1920 or 1440x2560); every screen type used has a 9:16 variant or plate crops are authored | [A] V8-INV-7 / [N] |
| H6 | Rights scope includes Shorts; policy screen re-run on the cut | [N] |

## 10. Process and release gates

- Gate 2 (human approves the render) happens after objective QA + listening + frame inspection of the **final** MP4s; no bulk approval; no substituting an old render; never hand-edit provenance to pass.
- Uploads, scheduling live and deletions need explicit user authorisation in that turn (`../../../references/agent-principles.md` §5); the release calendar/ledger pattern is in `../../../references/release-calendar.md`
  (a horror channel would get its own channel folder and ledger; do not share another channel's).
- Cadence: weekly cap in the calendar; novelty rule: no repeated premise within the last N videos (the MT "reject, never relax" principle), record rejected renders in memory.
- Report honestly: what passed (numbers), what was rejected and why, what remains unverified (for example human listening outstanding, policy snapshot older than the upload date).

## 11. Archived tests that pin the behaviour (for anyone restoring the engine)

`test_v8_6_fourchan_ingest.py` (catalog normalisation, `fetch_kind` routing, `story_sources` row) · `test_v8_7_content_safety.py` (pass/reject verdicts, no `story_sources` row error, rejected story creates no project) ·
`test_v8_8_clustering.py` (clusters + idempotence, empty, hallucinated ids dropped, non-passed excluded) · `test_v8_9_horror_founding.py` (happy path, wrong count, mixed cluster, not all passed, duplicate, scriptwriter horror branch blends and forbids verbatim) ·
`test_v8_10_atmosphere_narration.py` (no LLM in Pass 2, pool rotation, empty pool, windowing overlap, background schedule bounds and hang guard, end-to-end build.json) · `test_v8_13_vertical_recap.py` (spawn happy path, long-title regression, cis/gate-2/derivative/duplicate/vertical-capable guards) ·
`test_v8_14_15_vertical_derivation.py` (condensation grounded in parent narration, CTA styles, dispatch, vertical layout happy/missing-variant/no-partial-rows/backfill) · `test_v8_18_story_cluster_browser.py` (list route, excerpt sanitising, already-founded disabled).
Locations: `engine/tests/` in the archive ([data-model-and-archived-implementation.md](data-model-and-archived-implementation.md)).
