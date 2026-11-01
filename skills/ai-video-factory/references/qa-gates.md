# QA gates: consolidated catalogue

Compiled 2026-11-01 from every channel's quality docs. **Read the Scope column before applying a gate.** Many numbers
look universal and are not: e.g. "165-240 WPM, native timing, no speed-up" binds HES only; NEWS deliberately does the opposite.
Applying one channel's gate to another is the most common mistake in this repo. Each gate lists threshold, reason, and the
subskill that owns the detailed version (`../subskills/<type>/SUBSKILL.md` -> its `references/`).

Scope key: NEWS = news-explainer ([subskill](../subskills/news-explainer/SUBSKILL.md)) · HES = everyday-systems-explainer
([subskill](../subskills/everyday-systems-explainer/SUBSKILL.md)) · MT = physics-simulation-shorts
([subskill](../subskills/physics-simulation-shorts/SUBSKILL.md)) · E871 = clip-card-shorts
([subskill](../subskills/clip-card-shorts/SUBSKILL.md)) · AMB = ambient-long-form
([subskill](../subskills/ambient-long-form/SUBSKILL.md)). Pipeline order: [workflow.md](workflow.md).

Contents: 1 Principles of gating · 2 Idea, novelty, repeat · 3 Research, claims, sources · 4 Script and cadence ·
5 Narration and voice · 6 Captions · 7 Visual inspection · 8 Mechanism-animation correctness (HES) · 9 Simulation (MT) ·
10 Found clips (E871) · 11 Ambient (AMB) · 12 Audio mix, music, loudness · 13 Render and format · 14 Metadata, thumbnail,
titles · 15 Release and delivery · 16 Process gates (triple verification, honesty) · 17 Contradictions and stale statements.

---

## 1. Principles of gating

1. **A gate fails closed.** A failed gate is a rejected take/asset, never permission to patch the number (no stretching a slow
   take to pass WPM; no hand-editing provenance JSON). Fix the cause or regenerate.
2. **Gates are measured on the final artifact** (the encoded MP4, rasterised frames, decoded audio), not on the script/manifest
   JSON (NEWS LITMUS rule 9: every defect there was invisible in the data layer).
3. **Objective checks support, and never replace, a human-style listen/view** (listen to the audio, watch frames/contact sheets).
4. **Prove a new gate is live** by deliberately breaking one input and watching it fail (HES).
5. **When a gate needs a verdict the agent must make** (fit, caption job, unsafe), the agent writes it as a file and the code
   validates the file ([agent-principles.md](agent-principles.md) §1).
6. **Verdicts shown on screen are measured, not scripted** (MT: SHATTERED/HOLDS/BROKE AT N come from sim data; metadata numbers from the same data).

## 2. Idea, novelty and repeat gates

| Gate | Threshold / rule | Why | Scope · owner |
|---|---|---|---|
| Repeat check before choosing a subject | Check the channel's ledger *and* authored packages before selecting: HES `release-calendar/LEDGER.json` + topic catalogue (60-episode `topic-catalog.md`); MT `season/HISTORY.md` + ledger fingerprints; E871 `data/clips.db` + `LEDGER.json` | A repeated video wastes a slot; owners called repetition "unacceptable in the long run" | HES, MT, E871 · each subskill |
| MT novelty rules (planner `season/novelty.py`) | A scenario returns not within the last **6** videos; a returning scenario needs **new rig settings and <= 1 shared material** per earlier use; any scenario shares **<= 1 material** with each of the last **4** videos; exact repeats never | Swapping colours/materials on the same rig is repetition (owner 2026-09-26) | MT · physics-simulation-shorts |
| MT rejected-but-rendered videos stay in memory | Yes | Otherwise the planner re-proposes them | MT |
| E871 one source posted at most once | URL/ID uniqueness in `clips.db`; perceptual dedupe: dHash of middle frame, **<= 6 of 64 bits** different = same clip; ledger | Reposts collapse to one | E871 |
| When the catalogue is exhausted | Add a new scenario/topic; never relax the rules | Rule relaxation = decay of channel quality | MT (stated), good default elsewhere |
| Ledger is not proof of what is live | Ask the owner what is actually uploaded | The owner uploads manually | HES, all |
| Concurrent builds must not clobber the ledger | Re-read the ledger immediately before every save (`weekly.update_entry`) | Concurrent builds overwrote each other's statuses | MT |

## 3. Research, claims and sources

| Gate | Threshold / rule | Why | Scope · owner |
|---|---|---|---|
| Every material claim -> a source | NEWS: claim-source ledger binding every material/current/numerical claim to a primary source where one exists; HES: **every factual scene maps to claim IDs, every claim to primary/authoritative source IDs, with scope/qualification** | Anti-hallucination; sources also go in the description | NEWS, HES |
| Primary sources first | vendor announcements/model cards, government/standards advisories, papers, filings, repos, manufacturer engineering docs; secondary only for context/verification | Secondary reporting can't replace an available primary | NEWS, HES |
| Separate facts / vendor claims / attributed / inference / opinion | Record category per claim; never narrate one as another | Honest framing | NEWS |
| Qualify volatile facts | benchmarks, prices, availability, affected versions, test conditions, geography, alternate systems | Numbers without conditions mislead | NEWS, HES |
| No unsupported exact figures; define the *representative system* and exclusions up front; never universalise | HES `accuracy_scope` + claim `qualification`; numbers ledger (`_numbers.md`: claim -> source -> retrieval status) | Prevents invented infrastructure paths/stats | HES |
| Time-sensitive recheck | Recheck all high-risk claims/URLs **immediately before audio generation** and again before final metadata; blocking fact-check flag unresolved = stop | Facts move | NEWS |
| Source URLs live and in both descriptions | Full **and** Short descriptions contain every required authoritative URL; `meta.json` `sources` array | Trust + traceability | NEWS (HES: sources in description + `sources.md`) |
| Real references before drawing | HES: patent figures/manufacturer drawings/photos with `REFERENCE.md` of measured proportions; 3D scripts use the corrected figures in `VERIFIED-FACTS.md` | Drawings unlike the real object were judged "AI slop" | HES |
| Reproduce report numbers | AMB: re-run the data scripts (they run offline from cache) rather than trusting report prose; they reproduced byte-for-byte on 2026-10-12 | Prose drifts from data | AMB |
| Cyber content | Separate observed exploitation / capability / PoC / speculation; state impact boundaries; no operational exploit instructions | Responsible reporting | NEWS |

## 4. Script and cadence gates

Scope matters most here. **WPM is a native-speech gate on HES only.**

| Gate | Threshold | Why | Scope · owner |
|---|---|---|---|
| Native cadence (HES) | Accept scene **and** program cadence only at **165-240 WPM** (measured on the accepted take); failed = rejected take; retry deterministic seeds (base, +97, +211, +509...) or improve clause boundaries; **never** stretch | No post-generation speedup of any kind (Rubber Band, `atempo`, resampling, pitch shift) | HES |
| OmniVoice cadence (HES since 2026-10-05) | Same 165-240 window; OmniVoice's own generation-time `speed` steered toward **215 WPM** instead of seed sweeps; ASR word timings | Voice change kept the window | HES |
| NEWS script cadence | Write for roughly **175-190 wpm**, intelligibility first; then a deliberate **pitch-preserving `NARRATION_TEMPO`** (ffmpeg `atempo`) after dry dots.tts — the NEWS skill docs state 1.5 ("roughly 1.5x the earlier rhythm", owner choice) but the engine code/compose/.env default is 1.2: which the owner wants today is **unconfirmed**; scene bounds are remapped from measured pre/post-tempo durations, never an assumed factor | Owner's chosen faster rhythm for tech news; HES rules explicitly **not** applied here | NEWS |
| Faster does not mean rushed | If consonants blur, simplify the sentence or split the scene; do not raise tempo further | Intelligibility | NEWS |
| NEWS beat sizing | 18-30 spoken words per beat, **<= 34**, normally **6-12 s**; one visual idea per beat; hook in first 15-20 s | Retention + visual sync | NEWS |
| HES long script (rev 3.3) | ~3-5 min: 650-950 words, 10-20 scenes, 185-300 s; intro + **3-5 ideas**; one idea per scene, **8-45 words**; sentences <= 20 words, average <= 13; **Flesch-Kincaid grade <= 6.5**; hook <= 30 words | "Explain like to a curious twelve-year-old"; the first v3 batch failed as too long/technical/slow | HES |
| HES Short | Summary of the whole long video: 5-9 scenes, **110-185 words, 35-60 s**, every idea chapter compressed (`summarizes=[...]` covers all), ends with payoff + a CTA scene saying the full video is linked below. (Older gate: Short < **59.5 s**.) Keep Short scenes >= 20 words (lead-in/tail silence counts against measured pace) | Shorts are summaries, not trailers | HES |
| HES jargon | `pipeline_v3.JARGON` words fail unless declared via `P.term(term, plain, comparison)`: max **4** in long, **2** in Short, and the scene saying the word must say the everyday comparison aloud | Plain words first | HES |
| Spell numbers out in narration | "two hundred and fifty degrees", not "250"; figures stay numerals in labels/claims/description | The cadence gate divides *written* words by clip length; a numeral counts once but takes four words to say | HES |
| 3D HES longs | 5-7 min documentary/deep dive; scripts must pass `production-3d/tools/script_gates.py` and the writing bible (story frame, "you" stake, wrong expectation, gags, callback + reframe) | Owner agreed scripts resembled "an object explained in a void" | HES (3D) |
| No hedging in narration (pre-3.3 rule) | words like *representative, simplified, schematic, our drawing, varies, not all* fail; scope goes in `accuracy_scope` | Keeps narration confident; scope in the footer | HES |
| Headline <= 42 chars (pilot code) / <= 36 (pre-3.3 rule); title <= 100 chars | Code gates | Layout | HES |
| NEWS Short | Standalone rewrite (hook, minimum context, one proof point, one consequence) **ending exactly:** `if you want more details, check the full video in the description` — one `SHORTS_CTA` constant, byte-for-byte everywhere (grep for duplicates) | Drift between hardcoded copies is a defect | NEWS |
| MT / AMB | No narration; none of these gates apply | | MT, AMB |
| E871 caption | 3-15 words doing exactly one named `caption_job`; <= 2 trailing emoji; no hashtags, wrapping quotes, ALL CAPS or "!!!" (auto-stripped); write five, pick `best_caption`; must refer to *this* clip | A caption that fits fifty clips is not done | E871 |
| Phonetic vs display text | Two parallel fields per numeric mention (spoken form for TTS, display form for cards); flag cards showing spelled-out phonetics ("V eight") | TTS needs phonetics; readers need "V8" | NEWS |

## 5. Narration and voice gates

| Gate | Threshold / rule | Scope |
|---|---|---|
| Provenance recorded | backend, model, voice id, native pacing flag, post-speedup flag, tempo factor, no effects, reference SHA. HES target: native true, speedup false, tempo 1.0. NEWS: dots service headers say native/no speedup, then the *pipeline* applies its tempo (1.5 per docs, 1.2 code default) — two layers, not a contradiction | NEWS, HES |
| Dry voice | No reverb, enhancement, denoise, hidden effects on HES narration. (NEWS applies conservative click removal, stationary-noise reduction, hi/lo-pass, then 48 kHz stereo, then loudness — a different, documented chain) | HES / NEWS |
| Voice identity | One voice throughout a video ("never mix two voices in one video"); house voices distinct per channel (`warm-informational` NEWS; `hidden-systems-informational` HES dots fallback). HES voice split since 2026-10-18 (3D): Shorts **o1** (OmniVoice clone), longs **vm5** (VoxCPM2). All VoiceStudio calls via `production-3d/tools/voice_lock.py` | NEWS, HES |
| Reject by ear | slow, robotic, reverberant, semantically wrong, audibly stitched, crackle, metallic resonance/fizz, word omissions/repetitions, clipped endings/consonants, excessive pauses, inconsistent identity, breaths | NEWS, HES |
| Regenerate before filtering | Regenerate the affected beat before heavier filtering; adjust punctuation/chunking before model parameters; keep parameters deterministic so comparisons are meaningful | NEWS |
| Listening spots | opening, every difficult proper noun/acronym/number/CVE, two chunk boundaries, a dense scene, the Short CTA, the ending | NEWS, HES |
| Cache honesty | NEWS TTS cache fingerprint includes text, voice, model, steps, guidance, speaker scale, seed, chunk config; never relabel cached audio | NEWS |
| Never time-stretch HES | Banned entirely: forced alignment-based stretching, tempo stretching | HES |
| Preflight before a batch | audition one hook + one dense scene; `/api/model-info` reports expected voice and chunk cap | NEWS, HES |
| Word timing | NEWS: WhisperX forced alignment; if it drops/corrupts tokens, deterministic script-token timings inside scene bounds, disclosed as `needs_review` and manually checked. HES: proportional estimates or ASR-assisted timing — highlight is approximate | NEWS, HES |

Why these gates: the dry/native/one-voice rules exist because the owner heard artifacts as "AI slop" (robotic, reverberant, stitched, or speeded-up speech) and wanted
a recognisable, non-impersonating channel voice; the provenance record exists so a take can be traced and a drifting voice (or an accidental mixed-voice video) caught;
"regenerate before filtering" exists because heavy filtering adds the very synthetic fizz being removed (NEWS playbook); the WPM floor/ceiling is the HES owner's
rhythm requirement (brisk, ADHD-friendly) achieved through native speech rather than waveform acceleration. The reason for the exact 165 and 240 values is not stated.
Details: [voice-tts.md](voice-tts.md) and each subskill's audio reference.

## 6. Caption gates

| Gate | Rule | Scope |
|---|---|---|
| NEWS captions | Kinetic caption **pages with active-word emphasis**, word-aligned (WhisperX); the highlight must never make the whole band flicker; captions stay inside safe areas and never cover the evidence discussed; check them around acronyms, numbers, proper nouns and fallback-aligned scenes. (Page size and between-gap behaviour are not numerically specified in the NEWS sources.) | NEWS |
| HES legacy captions (2D era; **superseded 2026-10-05**) | Stable pages (**10 words long, 6 in Shorts** per the editorial doc; the 2D v2 invariant 6 later says five-word groups): the active word turns yellow, **the current page stays displayed during gaps, never flicker the band on voice activity** (reason: flicker on voice activity reads as glitch) | HES (old packages only) |
| HES current look (2026-10-05) | **Montserrat Bold, lowercase, white with dark outline + soft shadow, 1-3 word pop-in chunks, NO coloured word.** Chunk pop-ins replace pages, so "caption persistence" as written no longer applies to HES 3D. Not Arial/Arial Black with an orange spoken word — owner: "too common, linked to claude and AI slop". Spec: `experiments/style-research/STYLE.md` (Zack D. Films-like) | HES |
| Safe areas | Captions never cover the evidence discussed; stay inside title/caption safe areas; vertical layout checked separately (never assume a 16:9 crop is safe in 9:16). Shorts UI covers the top ~8 % and bottom ~20 %; MT one line clear of bottom ~390 px and right ~140 px; E871 timed text `y` clamped 0.10-0.78 | NEWS, MT, E871 |
| Caption proof around hard tokens | Check acronyms, proper nouns, numbers, scene transitions, fallback-aligned scenes | NEWS |
| MT text | **Exactly one** on-screen line; fades in when its content changes, holds 1.0 s, fades out; QC `text_visible_fraction` **<= 0.65** | MT |
| No titles across the top (HES) | No scene headline/chapter chip over the stage; stage 1920x900 long / 1080x1160 Short | HES |
| Labels | HES: never render below 24 px (long) / 36 px (Short); <= 32 chars; no collisions at real on-screen size | HES |

Why these gates: flicker on voice activity reads as a glitch (stated for the HES persistence rule); the HES 2026-10-05 look change was an owner taste decision against
Arial + orange active word (too common, associated with AI slop); the safe areas exist because the Shorts UI covers the top ~8 % and bottom ~20 %, hiding text;
MT's single, fading line follows the owner's complaints that text "stays up" and clutters the payoff; label minimums (24/36 px) are about legibility on phones
(the stated problem was ~20 px labels in Shorts). Reasons for the exact word counts (10/6, five) are not stated.

## 7. Visual inspection gates (the "no AI slop" checks)

| Gate | Rule | Scope · why |
|---|---|---|
| **Three-view inspection of every generated/drawn asset** | Inspect at **full resolution**, in a **contact sheet**, and **inside the actual composition** (Remotion frame / real render). Reject malformed topology, illegible details, accidental text/logos, disconnected parts, clipping, alpha halos, low-res edges, generic diffusion sheen | HES (invariant 8), NEWS thumbnails; because defects hide at one scale |
| Frame sampling of a render | NEWS: frames at the hook, every scene transition, +1 s after transitions, mid-scene, near the CTA, the ending; contact sheet every 5-10 s for template repetition, dead air, tiny type, unused areas | NEWS |
| HES post-render motion check | Extract frame sequences 0.25-0.6 s apart at every state change and followed step plus the published Short's sheet: continuous travel, nothing snaps/teleports, arrows track targets | HES |
| MT contact sheet + clean-master frames | Check the five visual rules on the contact sheet; extract frames from the **finished clean master** (`work/clean_<aspect>.mp4`), because previews lack motion blur and persistent-data effects | MT |
| E871 | Open >= 1 rendered `thumbnail.png` per batch and a mid-clip frame for timed styles (snap, bottom_meme, after_meme); check text inside safe zone, label on the split, meme starts on the payoff | E871 |
| Thumbnails | 1280x720; inspect at full size and at ~10-15 % scale; HES also 168x94 sidebar legibility | NEWS, HES |
| Representative visuals only | A visual must explain/evidence the current sentence, establish context or give a brief intentional emotional beat; decorative motion alone doesn't count; no monotone deck of generic cards; never fabricate a screenshot | NEWS |
| Screen density | one thesis, 3-5 objects, 3-8 word heading, <= 55 distinct authored words; captions carry the narration; screens must not duplicate it as a paragraph | NEWS |
| Visual change cadence | NEWS: change/reveal/redirect within every 6-12 s beat; HES: change something every 3-5 s on cue words, any step counts as a change only if it changes something; ADHD audience: Zack-D.-Films-like pace (`PACE` in `pipeline_v3.py`) | NEWS, HES |
| Reaction GIFs | zero by default, **max three** per full video, original assets only | NEWS |
| Component semantics (LITMUS profile) | Comparison/flow components derive badge colour/icon from content `status`, not column/list position (no forced red "alleged" side, no auto "CRITICAL" last node); terminal mockups use story data; evidence cards carry the real headline/publication; Shorts show a primary-source citation card at least once (~first 30-40 %) | NEWS |
| Clutter | Minimise clutter; never hide one element behind another unless the hiding is the explanation; no overlay cards over diagrams | HES |
| Camera continuity (HES, 2026-10-04/05) | While the focus is the same object, hold framing; move only toward the next part, never out-and-back; a diagram switch is a straight cut. Gate: `motion_check.check_camera_return` | HES |

## 8. Mechanism-animation correctness gates (HES; `pipeline_v3`, `motion_check.py`, `attachment.py`)

- **Attached looks attached** (permanent, 2026-09-27): every drawn part touches/overlaps/sits inside the rest at each shown
  state (exception `free="<why>"`); **one structure = one piece** (`structure=True`); only the highlighted part glows; details that
  move over a part are clipped to it (`clip="<host>"`, fails if a detail leaves its host by > 10 %); nothing undoes itself across a cut.
  Fix floating parts with the real missing support, never a nudge.
- **Highlight look:** every named part is highlighted at that word (`validate_mentions`); highlight is **one uniform bright orange**
  (`#FF8A3D` fill 62 % tint, `#B8460E` outline) with the rest dimmed by a 38 % wash; yellow is for text only (owner reverted a yellow trial on 2026-10-10:
  "the outline should stay in orange"). Colour-as-information parts use `signal=True`.
- **Arrows are rare:** only for a part mentioned while the focus is elsewhere; never on the highlighted focus; **no arrow on screen < 1.5 s**
  (`validate_arrow_timing`); the user tightened this twice on 2026-09-24 — err toward fewer.
- **Physics never bugs out** (rev 3.5): streams declare a source (`Diagram.feed`) or `free_flow="<reason>"`; streams are *drawn connected* to
  their source liquid (`check_connected`, `detached="<reason>"` for vapour/heat/air); angles unwrapped so keys are within 180 deg
  (`check_spin` fails a half-turn in < 0.25 s); loops wrap outside every camera (`check_wraps`); drawings never end in a straight cut in view (`check_canvas`).
- **Framing:** any subject > 10 % out of frame or under the Short's right button rail fails; callouts out of frame fail.
- **Textured bookends (rev 3.4):** opening and closing scenes use real materials (`validate_materials`), the middle is flat drawing with a 1.4 s crossfade.
- **Sound effects (rev 3.4):** each belongs to a visible, moving part, timed from the mechanism; `validate_sounds` needs >= 1; band-gated under the voice.
- **Opening teardown (2D pre-3D):** frame zero is the object as viewers know it; `validate_opening`.
- **Real references, to scale** (see §3). Proof stills against references before narration.
- The 3D track's per-video gates live in `production-3d/` (script gates, voice lock, BLENDER.lock); see [HES subskill](../subskills/everyday-systems-explainer/SUBSKILL.md).

## 9. Simulation and render gates (MT; `engine/qc.py` + `family.sanity`)

An episode failing any check is never filed.

| Gate | Threshold | Why |
|---|---|---|
| Duration | Short **12-60 s** (research median 28 s, top 3D Shorts 14-27 s); wide cut >= **10 s** | Format norms |
| Loudness | **-16 LUFS +/- 1 LU**; true peak **<= -0.5 dBTP** | See §12 |
| No freezes | no run > **1.0 s** where nothing in the picture changes; result pauses short, never frozen | Owner 2026-09-25 |
| No black frames | min mean luma > **4** | Broken renders |
| Physics sanity | press soft body stays within **0.02x-1.6x** rest height | Outside = unstable cloth solve |
| Story check | every ladder needs a turning point: press finale differs from an earlier contestant; drop holds every round and breaks in the last; blade has >= 1 split and >= 1 survivor | A uniform outcome is dull (S1E06 v1 failed) |
| Loop seam | `loop_seam`: 8x8-block means of last vs first frame; fail above **2x the 95th-percentile ordinary frame step** (cuts score 15-65, ordinary < ~7) | Seamless loop; changed-pixel count was fooled by spray |
| Text visibility | `text_visible_fraction` <= 0.65; exactly one line | Owner rules |
| Five visual rules | (1) material looks and behaves like its name; (2) **no invisible colliders** (rendered boundary = solver boundary, 3/112 m inset); (3) fracture starts at the real contact point at the real contact moment (`mt.crack_release`, `reach=` for moving loads); (4) text fades in on change and out; (5) Shorts play in order, show everything in full, loop seamlessly by a **0.6 s (`LOOP_FRAMES`) equal-power cross-dissolve** — **never loop by rotating the timeline** (the final result then ends abruptly) | Owner 2026-09-26 / 2026-10-03; "extremely annoying and critical" |
| Visual reject list | fireflies/denoiser smear on transmissive materials; interpenetrating/exploding bodies; a verdict that disagrees with what is visible; text over the payoff; > 1 line of text; any frame not rendered from a simulation; polished metal duplicating the material (use brushed, roughness >= 0.5); clear glass as an invisible boundary (tint + steel frame); lights visible through glass (hide from camera **and** transmission rays) | Precedents S1E02-S1E04 |
| Render-engine traps | Cycles **persistent data OFF**; **no live booleans** in animation (precompute cut states, `mt.show_breaking`); previews are not proof; Python `keyframe_insert` ignores interpolation type (set it explicitly or use visibility keys) | Black shards, 97 s/frame stalls |
| Sound | first sound within 0.1 s of frame 0; every hit on a simulated impact; silence between events; separated transients; reject reverb tails, beds, music, continuous walls of sound (drop family: one voice per 25 ms, hard hits only) | Dry crisp mix (owner) |
| AAC trap | native AAC at 192 kbps rang to +5 dBTP on clicks: keep the **16 kHz roll-off + 256 kbps AAC** | True-peak compliance |
| Metadata | title <= 100 chars stating the matchup; description with the measured numbers + "no AI-generated or diffusion video" line + CC0 credit; `containsSyntheticMedia` false; privacy **private** until a human approves | Honest labelling |
| Not a show | no series name, episode numbers, outro, end card, or "made by me" statements in anything viewers see | Owner 2026-09-26 |
| GPU | never two Taichi solves, or Taichi + Cycles, at once | clay_g crashed |

## 10. Found-clip gates (E871; `mc/analyze.py` ingest, `mc/fetch.py`, `mc/render.py`)

| Gate | Threshold | Why |
|---|---|---|
| Stock footage | `stock_footage: true` rejected unconditionally; filtered at discovery; sources serving stock never verified | R0 absolute |
| unsafe / foreign_watermark / burned_in_text | `unsafe` (gore, nudity, minors in distress, medical fear, hate, tragedy, punching down); another account's logo/handle; **another meme page's** caption still visible (the source creator's own speech subtitles may stay) | R7-R9 |
| Fit | `fit` < `min_fit` (default **7**) rejected; compilations/countdowns/slideshows/ads/static images fit <= 3 | "7+ means I'd post this today" |
| Source clip limits | duration **2-60 s** (never trimmed by the pipeline), <= 1080p, <= 150 MB | R12 |
| Output | 1080x1920, 30 fps, yuv420p, H.264 CRF 20 medium +faststart, AAC 192 kb/s, **-16 LUFS integrated, -1.5 dBTP, LRA 11**, silent AAC added to silent sources; duration **2-60.5 s**; file > **100 kB**; QC failure = no staging | Catches broken encodes |
| Review packet | contact sheet of 12 frames (opening 0.3 s + 11 evenly spaced; 6x2 grid, 240 px cells, timestamps); `request.json` -> `analysis.json` with every schema field | Agent-as-LLM hand-off |
| Captions | 3-15 words; one caption job; <= 2 trailing emoji; additive (context, take, meme cast), never a label or the original title | Owner 2026-10-04 |
| Memes | only from `memes/catalog.json`; one per Short; clip + meme <= 60 s; must cast or judge, not mirror the on-screen emotion | R14c |
| Audio bed (silent clips) | clip without audio (no stream, or max volume < **-45 dB**) MUST get a bed from `music/catalog.json`: CC0, licence URL recorded, never Kevin MacLeod/incompetech, measured energy **<= 6.0**; mixed at **-24 LUFS** (**-30 LUFS** under clips that have sound); credited in description + `sources.md` | R15b |
| Source material | every kept original in `source-material/<download date>/<clip>/original.mp4` + `source.json` (URL, uploader, where found, sha256); rejected originals deleted | R15c |
| Description | `Original video: <url>` (+ `Credit:`) always, generated by `mc/stage.py` | R4/R5 |
| Metadata | title <= 70 chars (hard cap 100), no hashtags; 2-3 alt titles; tags comma line <= 500 chars; hashtags 3-4 topical + defaults, max 6, last line | Standards |
| Release | one clip per slot; **4 Shorts/day at 09:00, 13:00, 17:00, 21:00 Africa/Casablanca**; neighbouring slots never share source or edit style; day folder carries ` (x)` exactly when all slots hold a `ready_to_upload` clip; only `mc/stage.py` renames day folders; never hand-edit a staged mp4 (re-run `schedule_release.py` so sha256 stays true) | R16-R18 |

## 11. Ambient gates (AMB; `engine/qc_demo.py`, `engine/full_render.py`)

| Gate | Rule |
|---|---|
| Loudness / startle | **-24 LUFS** target (whole-file static gain; slightly differs from a demo window's); report true peak (< -1.9 dBTP seen after AAC), LRA, and **startle margin** (measured 3.7-4.7 LU); nothing startling |
| Look | "Someone's Here" videos use a dim night grade; **no static bright element, nothing startling** (reason stated only as these two constraints); per-third luma and peak measured on 8 evenly spaced decoded frames (not on Blender's preview) |
| Demo = slice of full | A demo window must match the same span of the full render **sample for sample** (`--start` priming); verified by prefix-extension identity of timeline/audio |
| Full render integrity | `final.mp4` exact duration (36000.000 s), exact frame count (1,080,000 at 30 fps), 48 kHz AAC of the same length, faststart; seam frames match the frame function within ~42-44 dB PSNR; resumable pieces are `*.part*` renamed on completion |
| Content rules | audio synthesised only; textures/models real CC0 photo scans via `engine/fetch_textures.py`; own venv `S:/ambient/venv`; caches/demos/scratch on S: |
| Honesty | never quote timings from overlapping GPU/CPU jobs; frame-generation fps is not end-to-end speed |
| Open | the owner has not yet watched the full renders (as of 2026-10-13); do not call them accepted |

## 12. Audio mix, music and loudness (per channel; not universal)

| Channel | Program loudness | True peak / LRA | Music/bed policy |
|---|---|---|---|
| NEWS | **-14 LUFS +/- 1.5 LU** (engine `loudness.py` `TARGET_LUFS=-14`; LITMUS gate) — YouTube reference level; a delivered mix near -20/-22 LUFS is 6-8 dB too quiet | TP ceiling **-1.0 dBTP** (engine); AAC 192 kb/s, 48 kHz stereo | Project-owned synthesised ambient tracks (oscillators + filtered noise), deterministic rotation hash of `niche:script_id`; **ducked ~ -32 dB under narration**, ~ -27 dB in safe swells; looped blockwise; never masks narration |
| HES | **-16 LUFS** program (target; LRA 7; true peak **-1.5 dB**) per the architecture doc | per doc | Licensed rotation library, **13 CC BY 4.0 beds** (since 2026-09-24; earlier 3 tracks at 0.065) levelled to **-18 LUFS** by measured `gain_db` before the approved **0.13** bed volume; `trim_seconds` cuts dead air (>= 2 min trims rejected); stems built per bed: bass cut at 150 Hz (24 dB/oct), -6 dB speech-band dip (1.5 kHz, 2.5 oct), ~-5 dB ducking while narrator speaks. **`audio_bands.py` gate: per octave band (63 Hz-8 kHz), averaged over narrator-speaking frames, music >= 18 dB under voice; >= 22 dB under in the speech bands (250 Hz-4 kHz); loudest 5 % of frames >= 8 dB under.** QA names: `music_under_voice`, `sfx_under_voice`, `music_credit`. "Jellyfish in Space" is rejected for good (bass 10 dB *over* the voice at 63 Hz). Older docs: "22-25 dB below narration" |
| MT | **-16 LUFS +/- 1 LU** | TP <= -0.5 dBTP; 16 kHz roll-off; AAC 256 kb/s | None. Recorded CC0 foley only; near-dry room, final ceiling limiter, no pre-compression |
| E871 | **-16 LUFS** integrated | -1.5 dBTP, LRA 11; AAC 192 | Beds only for silent clips (see §10) |
| AMB | **-24 LUFS** | startle margin measured | Synthesised only |

- **Why these targets:** -14 LUFS is stated as YouTube's own reference level (NEWS: a mix near -20/-22 LUFS forces viewers to turn the volume up);
  the **-16 LUFS targets (HES, MT, E871) have no stated rationale** in the sources; the AMB -24 LUFS target has none either in its handoff (the audio-tooling
  reference attributes it to sleep/background content); true-peak ceilings avoid clipping after lossy AAC encoding (stated for MT's AAC ringing); the HES octave-band gate
  exists because one bed sat 18 dB under the voice overall yet 10 dB *over* it at 63 Hz. Ducking depth differences are channel taste, not a universal rule.
- **Remix without re-rendering** is supported where stems exist (HES `remix`, MT clean master + `finish`).
- Music appropriate to the topic (calm explainer), no abrupt loops, no loud intros/outros; check masking and tonal mismatch by listening.
- Attribution: exact credit text in the description (see [agent-principles.md](agent-principles.md) §4). Never buy a track without asking.
- Deeper tooling: [audio-captions-music.md](audio-captions-music.md).

## 13. Render and format gates

| Item | NEWS | HES | MT | E871 | AMB |
|---|---|---|---|---|---|
| Long canvas | 2560x1440 (reviewed outputs), 30 fps | 1920x1080 30 fps | wide 1920x1080 (>= 10 s) | n/a | 1920x1080 30 fps, 10 h |
| Short canvas | 1440x2560 | 1080x1920 | 1080x1920 | 1080x1920 | n/a |
| Codec | H.264/yuv420p + AAC 192 kb/s 48 kHz stereo | H.264 CRF 18 yuv420p, AAC 192 kb/s 48 kHz | H.264, AAC 256 kb/s | H.264 CRF 20 + faststart, AAC 192 | H.264 via NVENC (30-min closed-GOP segments), stream-copy concat, AAC 48 kHz |
| Thumbnail | 1280x720 PNG | 1280x720 PNG (+ A/B pair, mandatory) | `thumbnail.jpg` | full-res 1080x1920 frame at `thumb_time` | per report-14 packaging |
| Frame freeze | no frozen tail frame | | none > 1.0 s | | |
| Lead-in / tail | permanent **2.0 s lead-in and 2.5 s tail-out** (playbook) vs LITMUS head silence **0.0 s**, tail **<= 0.6 s** — see §17 | lead-in 250 ms long / none Short; tail 900 ms long / 450 ms Short; 18 s end-screen hold on long | | | |
| Presentation checks | probe master: size, fps, codec, duration | duration, dimensions, fps, codecs, loudness (QA-REPORT.json) | QC suite §9 | QC §10 | `final.qc.json` |

Short-form safe areas: keep key content out of the top ~8 % and bottom ~20 % (Shorts UI); MT line clear of bottom ~390 px / right ~140 px;
HES keeps subjects out from under the right button rail. Full and Short layouts are checked separately.
Why: the 16:9 / 9:16 canvases are the long-form and Shorts standards; NEWS shoots 1440p because its typography is specified as "legible 1440p"; CRF/AAC values are
encode-quality choices (reason not stated beyond MT's AAC true-peak fix); "no frozen frames/black frames" catch broken renders and, for MT, the owner's dislike of frozen pauses;
lead-in/tail-out are presentation padding whose values conflict (§17).
Rendering tools and commands: [rendering.md](rendering.md).

## 14. Metadata, thumbnail and title gates

- **NEWS:** specific, accurate, curiosity-forward title faithful to the script; description = concise summary + context/qualifications +
  source list with direct URLs + any music attribution; tags relevant, non-spammy; thumbnail copy short, high-contrast, truthful (cannot imply
  a conclusion the evidence does not support); thumbnail 1280x720 PNG, one dominant subject, no tiny labels/clutter/false UI/gibberish; `meta.json`
  refers to the files actually delivered; full and Short scripts packaged.
- **HES (permanent `question-mechanism-v1`):** title `"<Main question?> | <reflection>"` (object-question first, <= 100 chars) + exactly **three**
  `alternate_titles` in the same shape; `short_title` stands alone (no `|`); description has native timestamps and a `Full Video: <>` placeholder
  in both descriptions, photo credit, `Alternative titles:`, hashtags; the "photograph production sentence" is removed; **never put "hidden everyday
  systems" or "ghostsystem" in tags and never refill the freed budget**; music credit verbatim (`music_credit` check).
  Thumbnail text = the title question **shortened to 2-4 words**, <= 28 chars, ends in `?`, capitals, keeps a content word of the title, not the whole
  title when it is > 4 words, one yellow key word `#FFD21F` that is a content word (`validate_thumbnail_question`); ZDF-style look (Montserrat
  ExtraBold/Black, white + one yellow word, thick black outline, close-cropped hero payoff moment, saturated background); composition: real photo graded
  dark, round dark port with teal ring holding the lit x-ray drawing, text left; `thumbnail2.png` is the mandatory A/B pair; re-do with `rethumb`.
- **MT:** see §9 (title <= 100, measured numbers, private by default).
- **E871:** see §10 (title <= 70, second take not the caption, `thumb_time`).
- **All:** don't overstate the evidence in the title/thumbnail; thumbnails legible at ~10-15 % scale.

## 15. Release and delivery gates

- **Required files exist and are non-empty** per channel; MP4 has the right codecs; landscape for long, portrait for Short; audio 48 kHz and present;
  `meta.json`/manifest parses and refers to delivered files; sha256 and sizes recorded for a handoff; the release folder exists
  (NEWS `technews/output/release-calendar/<YYYY-MM>/<DD>/`; HES `release-calendar/<YYYY-MM>/<DD>[ (x)]/<slug>/`; MT `material-trials/release-calendar/<YYYY-MM>/<DD>/<slug>/`;
  E871 mirrors HES; AMB per report-14 with a `long_video` key). Schedulers: `schedule_release.py`. Details: [release-calendar.md](release-calendar.md).
- **Final timestamps/hashes correspond to the latest render**, not stale output; show the owner current files, not old pilots.
- **Nothing is uploaded or made public by the pipeline**; manifests are private-by-default; a human uploads ([agent-principles.md](agent-principles.md) §5).
- **Timezone is Africa/Casablanca.** Past slots are reported, not silently filled.
- **Completion report:** absolute paths, runtimes, resolutions, codecs, source coverage, review flags.

## 16. Process gates

- **HES triple verification (every video; owner 2026-09-24):** (1) *before narration — the gates:* the topic script must print `valid` (references,
  motion, framing on both stages, mentions, arrows, script clarity) and you prove a new gate bites by breaking an input; (2) *before narration — the stills:*
  `preview` renders a still at every camera move: right part lit when named, arrow only on off-focus mention and up >= 1.5 s, nothing cropped,
  proportions match references, motion plausible; read the script for things named that no alias covers (floor, top, bottom); (3) *after the render —
  the motion:* frame sequences at every state change + the Short's sheet. Only then file it; report what was checked and what is uncertain.
- **Lead frame review** catches narration/visual contradictions agents miss (a washing machine showed water after "the water is gone").
- **NEWS:** run Python tests and TypeScript compile for the engine; render a low-cost draft first; **listen once without watching and watch once
  muted — both must be understandable**; review opening, a middle mechanism section, every high-risk claim, and the closing.
- **NEWS human gates (archived engine):** Gate 1 script approval, Gate 2 render approval; a prompt-registry row for any gated stage cannot be
  activated without a complete, human-acknowledged regression run over >= 1 applicable golden pair (REQ-11.2 target 5-10 hand-approved pairs). Details:
  [../subskills/news-explainer/SUBSKILL.md](../subskills/news-explainer/SUBSKILL.md).
- **Resumable/idempotent:** every stage reads state from DB/files; re-run at any point (E871 "resumable over clever"); MT/AMB write `*.part*` then rename.
- **When something fails:** diagnose root cause; never weaken gates; regenerate rather than hand-editing provenance.

## 17. Contradictions and stale statements found while compiling (do not resolve silently)

1. **WPM/speed-up:** HES (native only, 165-240 WPM, no speed-up) vs NEWS (write 175-190 wpm, then `atempo`: 1.5 in the skill docs, 1.2 as the code/compose/.env default — unconfirmed which is current). Deliberate, per channel. NEWS external-harness doc: "Do not silently apply the separate Hidden Everyday Systems native-tempo rules."
2. **HES voice:** ONBOARDING/HES SKILL invariant 1 ("dots.tts SOAR is the only narration backend") is **stale**: since 2026-10-05 OmniVoice via VoiceStudio is the default; 2026-10-18 split (o1 Shorts / vm5 longs). dots.tts remains selectable via `HIDDEN_SYSTEMS_TTS_PROVIDER=dots`. The o1 pick (CC-BY-NC) conflicts with the 2026-10-12 "prefer a commercial engine" decision.
3. **HES length/format:** original pilots 60-150 s; v3.3 3-5 min; 3D longs 5-7 min; Short < 59.5 s vs 35-60 s summary. Use the newest (3D track, 2D stopped 2026-10-10).
4. **HES music:** 3 tracks @ 0.065 -> 13 beds @ 0.13 levelled to -18 LUFS; "22-25 dB below" -> octave-band gate 18/22/8 dB. Use the latter.
5. **HES captions:** 10/6-word page + yellow active word (and persistence between gaps) -> Montserrat white lowercase 1-3 word pops, no coloured word.
6. **HES highlight colour:** orange (default) -> yellow trial (2026-10-05) -> orange restored 2026-10-10.
7. **NEWS lead-in/tail:** playbook "permanent 2.0 s lead-in, 2.5 s tail-out" vs LITMUS "head silence 0.0 s, tail <= 0.6 s" (the 09-05 audit said these are render constants to check). Unresolved; verify the live constants if the engine is restored.
8. **NEWS music:** audio reference says "extremely low, ducked ~ -32 dB"; HES uses different levels. Intentionally different.
9. **Short stage geometry (HES):** 1080x1160 stage (v3.3 text) vs "1080x1010 stage / 1,470 + 450 px composite" (older line in the same doc) vs "card at 84 % (907x1235)". Prefer the 84 %-card full-frame-gameplay description for brainrot Shorts; check `visual-system/` code if rendering.
10. **Loudness:** -14 (NEWS) vs -16 (HES, MT, E871) vs -24 (AMB): per-channel; do not unify.
11. **Ownership docs:** AGENTS.md/ONBOARDING.md say two/four channels; CLAUDE.md lists four and AMB is outside it. Treat five as real.
12. **Error text bug:** HES validation message once said "190-260 WPM" while the code enforces 165-240 (known, to fix in the message only; gate unchanged).
13. **HES caption page size:** 10 words long / 6 in Shorts (editorial-and-quality doc) vs stable five-word groups (2D v2 invariant 6, per the audio/caption tooling reference): both are legacy; the current look is 1-3 word pop-ins.
14. **MT true-peak:** gate is <= -0.5 dBTP; the chain's ceiling limiter is -1.0 dB (the tooling reference). Consistent, but do not quote one as the other.
15. **ComfyUI:** ONBOARDING says the venv `home=` still points at `F:\StabilityMatrix-win-x64`; the HES architecture doc says that F: copy no longer exists. Treat the venv as broken; see [legacy-and-removed.md](legacy-and-removed.md).
