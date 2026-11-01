# Recap script, narration pacing and grounding

Compiled 2026-11-01 from V7-REQ-3.4, 5.x, 6.3, `design.md` §6/§7, `scriptwriter.py` (`_manga_panel_context`, `total_word_budget`), `fact_check.py`
(`_assemble_ground_truth`, `correct_fact_check_flags`), `schemas.py`, `audio/pipeline.py` / `concat.py`, audit-remediation Req 6-7 and the owner memory notes.
**Source-of-truth markers:** `spec` = a numbered requirement; `code` = what the archived engine did; *proposal* = this skill's method layered on the spec, to label as such.
Voice engine, captions and loudness are shared: [voice-tts.md](../../../references/voice-tts.md), [audio-captions-music.md](../../../references/audio-captions-music.md); do not re-derive them here.

## 1. The contract the spec fixes (spec V7-REQ-5.1-5.5)

A recap script is a list of **scenes**; each scene narrates **exactly one panel** and says so. The same shared `Scene` object is used for every niche (RD-104), with three optional manga fields:

| Field | Value | Rule |
|---|---|---|
| `index` | 0.. | scene order |
| `is_hook` / `is_pattern_interrupt` | bool | the `deep-dive` archetype is `single_hook_only`: scene 0 is hook, forced by code, never trusted to the model |
| `component` | `""` | CIS scripts leave component empty; a later step builds screens |
| `cues` | `{typing_chars: 0, node_count: 0}` | unused for panels |
| `narration` | text | describes **its own panel only** |
| `word_budget`, `duration_ms` | ints | draft-time estimates; real duration comes from audio |
| `panel_id` | int, **chosen only from the supplied panel list, never invented** | many scenes may share a panel (cut back for context) |
| `scene_energy` | `low` / `medium` / `high` | the panel's pacing; maps to foreground scale 65/72/80% |
| `provisional_timestamp_ms` | your running estimate of where the scene starts | an authoring aid only; **never read** by timestamp resolution (V7-INV-5) |

**Boundary rule (V7-REQ-5.4):** narration for screen X must not describe content from a different panel. Timing cannot catch that (sequential TTS already prevents audio overlap, V7-INV-4); *grounding* catches it: each scene is fact-checked against its **own** panel, and drift shows up as an untraceable claim. No second mechanism was built.

The scriptwriter prompt (`code`) appends this block to the ordinary source prompt: *"This is a manga_recap script. Available panels, in reading order:"* then one line per panel, **sorted by (page_number, panel_position)** (an unordered list silently scrambles the recap):
`- panel_id=<id>: page <p>, position <q> -- dialogue=<text>, visual=<description>`; followed by the instruction to describe each scene's own panel only, set `panel_id` from the list, `scene_energy` and `provisional_timestamp_ms`. Use the same shape for your script packet ([operations-agent-as-llm.md](operations-agent-as-llm.md)).

## 2. From chapter to script: story ledger first (proposal)

The spec says nothing about arcs or chapter summaries; the archived scriptwriter went panel list -> scenes in one shot (and, see section 5, with a fixed 240 s target regardless of chapter size). A recap that is more than panel-by-panel description needs a middle layer:

1. **Story ledger** (`story-ledger.json`): cast (names exactly as written in the source text; honorific/translation conventions), setting, per-chapter events with the `panel_id`s that *show* each event, open threads, and a "what this chapter changes" line. Every ledger fact carries its `panel_id`s: if no panel shows it, it is not in the ledger (this is the same grounding rule applied one level up).
2. **Recap beats**: 6-12 beats per chapter (setup, escalation, turn, consequence, hook for next), each listing the panels it will use and which panels are **skipped** (filler, repeated reaction shots, recap-within-the-manga). Selecting and compressing is the editorial work; a viewer should leave with the story's shape, not a verbal screenshot of every panel.
3. **Scenes**: expand beats into scenes, one panel each (or reuse a panel for several consecutive scenes when a long line needs more image time).
4. **Previously / next**: a one-line context scene for series continuity and a closing line pointing viewers to the official/licensed place to read the work (also the right attribution, [qa-metadata-release.md](qa-metadata-release.md)).

Quote discipline (*proposal; policy-motivated*): speech-bubble text is the creator's expression. Paraphrase; keep verbatim quotes to short, narratively necessary lines; never read pages' dialogue out wholesale. This is a quality rule and a rights-risk reducer, not a guarantee of anything ([sourcing-and-rights.md](sourcing-and-rights.md) R1/R3).

## 3. Narration voice and rules

- **Delivery** (`spec` V7-REQ-3.4, v5 RD-99): `pacing_profile.voice_delivery_mode = "expressive_narrative"` - natural cadence, expressive, **not** the news channel's deadpan/zero-dead-air house style, and the deadpan-fragment scriptwriter directive is omitted for this niche. Do not import news-explainer's tempo, tone or sentence-fragment rules.
- **Grounding rule** (seeded `editorial_constraints`): ground every beat in what its linked panel's dialogue and visual description actually show; **never invent plot detail, dialogue or a character's internal state** beyond what the panels depict. Speculation ("probably", "seems to be plotting") is allowed only when the panel shows the cue and the line is hedged as a reading, not stated as fact.
- **Pattern interrupts**: the `deep-dive` archetype feeds a cadence of roughly one interrupt per **45 s** into the prompt, and v5 V5-REQ-8.4 defines an interrupt as a high-tech/low-brow whiplash beat. That definition is news-specific; for a recap read it as "a deliberate change of pace or tone" (a joke, a quiet beat, a sharp one-liner after a long explanation) and do not force one into every 45 s.
- **Hook**: the first scene lands the premise or the most striking panel in the first seconds. Short-form: first 2 s (V8-REQ-9.1 / `variant="shorts"` instruction). Long: a hook scene, then context.
- **Profanity**: scene 0 is checked against a configurable wordlist and flagged (not blocked) - audit-remediation Req 7.1/7.2, applied to every niche in the archive; the first 7 s of audio also got a tone-censor overlay. Mature manga makes this relevant; keep the list outside code.
- **Personification vs fact** (v5 V5-REQ-8.5): a tone flourish is fine only if it is clearly narrator voice; the fact-checker treats flourishes as never needing grounding, so do not smuggle a plot claim into one.
- **Real-entity sensitivity** is `low` (fiction); raise it for biographical or historical works and then ground against sources, not panels.

## 4. Dwell: how long a panel stays up

Panel dwell is **not a stored parameter**: a screen lasts as long as its scene's narration (`resolved_start_time` -> `resolved_duration_ms`, filled by alignment, V7-REQ-7.1). So pacing is controlled by how many words you put on a panel and how many panels you cut between.

- `code`: the draft duration estimate is `NARRATION_WORDS_PER_SECOND = 3.0` (180 wpm); the budget formula assumes 225 wpm after tempo. The component manifest declares `min_scene_ms 1000`, `max_scene_ms 15000`, `max_animation_duration_ms 0`; **template-driven CIS screens are not machine-checked against those bounds** (screen validation skips them), so the bounds are guidance you must enforce.

| Dwell | Words at 180 wpm (3.0 w/s) | at 225 wpm (3.75 w/s) |
|---|---|---|
| 1 s (floor) | 3 | 4 |
| 3 s | 9 | 11 |
| 6 s | 18 | 22 |
| 9 s | 27 | 34 |
| 12 s | 36 | 45 |
| 15 s (ceiling) | 45 | 56 |

*Proposal for a new channel (derived from the repo's pacing evidence, not from a manga spec):*
- Target **3-9 s per panel** (NEWS beats run 6-12 s with one visual idea each; HES changes something every 3-5 s; the audit-remediation rule asked for a visual change at least every 1.5-2.0 s, see [composition-transitions-export.md](composition-transitions-export.md) §4). Anything over ~10 s on one still: split the line across two scenes and reuse the panel, or cut to a second panel, or use a slow move in the editor.
- `scene_energy` is the lever: `high` = action/impact panels, short lines, quick cuts, largest foreground; `low` = quiet/establishing panels, longer lines, smaller foreground, room to breathe. Wordless establishing panels may hold slightly longer with a breath of silence (the light trim keeps 0.30 s gaps).
- Let a punchline or reveal land: put it on its own scene so the cut follows the last word.
- Read the line aloud against the panel's reading time: the viewer must be able to *see* what is being named (the owner's HES clarity rule: highlight/name what is on screen).

## 5. Length and word budget (code facts + the bug to avoid)

- Budget: `total_word_budget(runtime_s) = round(runtime_s/60 * 225 * 0.9)` (10% reserve for the hook). 240 s -> 810 words; 55 s -> 186 words.
- **Code defect:** runtime target is chosen by `target_runtime_seconds(len(raw_item.content))` (<2000 chars -> 240 s, 2000-6000 -> 420 s, >6000 -> 600 s, max 600). For manga the "source content" is the one-line synthetic summary (`Manga recap source: <title>, <N> pages, rights_basis=...`), so **every archived manga script targeted 240 s / 810 words regardless of the chapter**. Set the runtime and budget explicitly from the panels you select: `runtime ~= selected_panels x average_dwell`.
- Short (vertical) variant: fixed **55 s** (`SHORTS_TARGET_RUNTIME_SECONDS`), "a short is scoped by format, not by how much source exists".

## 6. Editor critique and fact-check (method)

**Editor critique** (stage output `EditorOutput`): `critique{hook_strength, pacing, jargon, dead_stretches}` (four free-text strings) + `revised_scenes`. For recaps read `jargon` as "unexplained series terms, names or lore" and `dead_stretches` as "too many consecutive low-energy panels or repeated beats". The revision must keep `panel_id`, `scene_energy` and structure intact.

**Fact-check** (`FactCheckReport` = list of `FactCheckClaim{scene, claim, traceable, source?, note?}`): for every specific claim in each scene, mark `traceable=true` only if it is supported by that scene's own panel. The ground-truth block handed to the checker is, per scene:
`Scene <index> (panel <page>.<position>): dialogue=<panel text>, visual=<description>`; scenes with no panel are skipped. It replaces `raw_items.content` / `source_citations` for this niche only (V7-REQ-5.5). Because you can look at the image, **also** open the panel image for any flagged or doubtful claim: the stored description is itself an extraction and can be wrong. Any untraceable claim is surfaced at Gate 1 (the archived engine notified `fact_check_flags_present`).

**Correction pass** (`correct_fact_check_flags`, reuse as a procedure; proven by `test_v7_7_*`):
1. Change **only** the narration of scenes whose claims are untraceable; every other scene stays byte-identical; keep index, metadata, cues, timing and order.
2. **Delete** the flagged sentence by default; keep a rewording only if *every* fact in it is in the panel ground truth.
3. Never add a sentence, fact, number, name, analogy or editorial characterisation that is not already in the original narration or the source.
4. If a scene would end up empty, reduce it to one source-grounded sentence; edits minimal otherwise.
5. Structure check: scene count/index/metadata unchanged. Then an **independent re-check** over the revised scenes; block only on claims the correction owns (originally flagged claims still untraceable, or untraceable claims on narration you changed). Flips on untouched narration are logged, not blocking (observed verifier noise).
6. One repair retry with "deletion-only" feedback; a second failure stops the script. A rewrite is never saved unverified.

**Gate 1:** a human approves the script in both production modes (the manual-mode exemption removes only v6's co-authoring finalization, not Gate 1). Do not approve on the owner's behalf.

## 7. Audio chain facts (code) and what is unsettled for this niche

- Per-scene TTS is concatenated sequentially with a **0.200 s** inter-scene gap (`INTER_SCENE_GAP_SECONDS`): screen X's audio always ends before X+1's begins.
- **Trim:** `expressive_narrative` -> `"light"`: a silence (< -40 dBFS) is trimmable only if longer than **0.60 s** and is shortened to **0.30 s**, 0.05 s edge guard. `SPEC vs CODE`: v5 RD-99 specified "full" (0.40/0.15) for the deadpan default; the code maps `deadpan_technical` to "light" too, so both are light.
- **Tempo:** `NARRATION_TEMPO` (default **1.2**, pitch-preserving `atempo`, range 0.5-2.0) is applied to **every** niche, with a code comment calling it a "tech-news pacing requirement". Nothing in the specs decides tempo for manga. For an expressive narrative voice, audition at 1.0 first and decide in writing; HES's no-time-stretch rule ([voice-tts.md](../../../references/voice-tts.md) §4) is a HES rule, not a manga rule, but its reasoning (stretching degrades delivery) applies.
- Alignment: WhisperX on the final timeline -> `resolved_start_time` (seconds) / `resolved_duration_ms` per screen; the placeholder is superseded (V7-REQ-7.1).
- Loudness -14 LUFS integrated in the archived chain; music ducking -18 to -14 dB during active words (audit-remediation Req 5); no tracks shipped. Choose and record a target for the new channel; measure the final mux ([audio-captions-music.md](../../../references/audio-captions-music.md) §4).
- **Voice gap:** the seeded `manga_recap` niche has `voice_profile_id = NULL`, and NLE export hard-requires one, so the archived pipeline could not export for any real project (found by the integration test; which profile suits a recap channel was left to the owner). Do not use `warm-informational` (cloned real person, [sourcing-and-rights.md](sourcing-and-rights.md) R7).
