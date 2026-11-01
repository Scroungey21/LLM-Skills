# Creative Illustration Separation (CIS)

A method for any **illustration-led narrated video** (tech news, horror stories, manga recaps, stickman/storyboard explainers, chat-story fiction): write the narration first, then author the visuals beat by beat as separate, individually validated "screens", bind them to the real audio timing, then author the transitions - with every third-party asset passing through a rights tier. It was specified in the technews v5 addendum (`V5-REQ-*`, `V5-INV-*`) and reused by the v7 manga recap and v8 horror niches; implemented in the archived engine (`engine/app/synthesis/screen_generator.py`, `screen_validator.py`, `transition_validator.py`, `fair_use.py`, `models/{screen,screen_type,transition,asset_library,fair_use_assessment}.py`, `render/build_json.py`; tests `tests/test_v5_*.py`; restore per [`legacy-and-removed.md`](legacy-and-removed.md)).
Rules below are method; the agent performs each pass itself (see [`agent-principles.md`](agent-principles.md)) - do not build model-API backends for them.

Contents: 1 What and why - 2 The four passes - 3 Objects and file shapes - 4 Rights-tiered asset sourcing - 5 Screens, elements, transitions - 6 LLM-authored animation (never shipped) - 7 Orchestration facts worth keeping - 8 Pacing rules that came with it - 9 Invariants - 10 When to use CIS and how each video type maps - 11 Adopting CIS for a new video type - 12 Risks, open questions, sources

## 1. What and why

- **Legacy mode (`legacy_scene`)**: one visual component for the whole video; each script scene carries a `component` and animation `cues` authored *before* audio exists (typing chars, node counts). Fragile: cues are guessed against durations that real TTS later overrides.
- **CIS mode**: the script scene carries **narration only**. Visuals are separate `screens`, each one a typed unit (diagram, terminal, panel composition, atmosphere text over footage, sting, sponsor card...) chosen per beat, then timed from the actual word timestamps. Each screen type has a **manifest of bounds** (text length, node count, duration, named elements) so a screen can be validated mechanically, and the same bounds apply to human-authored screens.
- Why separate illustration from narration: (a) the writer writes for the ear without guessing animation budgets; (b) different beats need different visual grammars; (c) a broken screen is repaired or replaced alone, never the whole video; (d) rights are decided per asset, at the point the asset is chosen, not retrofitted; (e) the same script can be re-skinned (9:16 vertical recap).
- **Opt-in per niche, overridable per project until Gate 1** (V5-REQ-1.x). In the engine every seeded niche ended up `cis`; legacy remains the right choice only for fixed-grammar formats where the cue arithmetic is trivial.

## 2. The four passes

| Pass | Engine step(s) | What it does | Output | Gate / check |
|---|---|---|---|---|
| **1 - Narration authoring** | scriptwriting, editor_critique, fact_check, fact_correction | Write beat-by-beat narration (no component/cues). For illustration sources (manga) each beat names its source panel and `scene_energy`, and carries an advisory `provisional_timestamp_ms`. Fact-check grounds each beat against *its own* source (citations; for manga, the linked panel's dialogue + visual description). | `script.scenes` (v1 -> v2) + fact-check report | **Gate 1** human script approval; strict boundary rule: narration attached to screen X must not describe a different panel/beat's content (caught by fact-check, not by scheduling code) |
| **2 - Screen generation + asset sourcing** | asset_curation (v6), screen_generation (in parallel with TTS) | For each beat choose the best-fitting screen type from the registry and generate its content within the manifest; select assets only from Tier 0-2 or an original illustration; raise a Tier F candidate only through the subject-match gate. Needs only the approved script, **not** the audio. | one `screens` row per beat (`draft` -> `validated`), shortlisted assets, optional pending fair-use assessments | manifest bounds; `sponsor_segment` copy is human-only; no raw web scraping for content |
| **3 - Timestamp insertion** | screen_timestamp_insertion (after both `subtitle_export` and `screen_generation`) | Bind each screen's `narration_beat_ref` to **real WhisperX word timestamps** and write `resolved_start_time` / `resolved_duration_ms`. Never uses pre-audio estimates (`provisional_timestamp_ms` is never read here - V7-INV-5). | timed screens | alignment validation (fallback timing stays `needs_review`, see the news-explainer audio notes) |
| **4 - Transition authoring** | screen_validation, transition_authoring, transition_validation | For each adjacent screen pair pick a `transition_type` and optionally a named element on each side; validate that referenced elements exist in the screen type's `elements`; whole-screen transition is the fallback. | `transitions` rows (`pending` -> `validated` / `violation`) | element names must exist (V5-INV-9); 2 repair attempts, then the violation stays visible |

After Pass 4: `build.json` assembly (blocked while any screen/transition is unresolved or any fair-use assessment is `pending`/`rejected`) -> render -> **Gate 2**.
No new formal gate sits between Gate 1 and Gate 2; a reviewer who wants to see the storyboard pauses after `transition_authoring` (V5-REQ-2.6).
Numbering note: v5 names Pass 2 and Pass 3 explicitly; "Pass 1" (narration) and "Pass 4" (transitions) are named in the v7 manga spec - the four-pass reading is consistent across v5/v7/v8.

Niche-specific behaviour inside the passes (examples of how to specialise, not new passes): manga Pass 2 is deterministic (`manga-panel-composition`: blurred full-bleed background + foreground panel scaled by `scene_energy` low/medium/high = 65 / 72 / 80 % within the 60-80 % rule) and its Pass 4 picks `instant_cut` for same-page / same-scene pairs and `simple_transition` otherwise; horror Pass 2 uses `atmosphere-narration` (foreground text revealed against real word timestamps over blurred Tier 0-2 footage rotating at most every 4000 ms). Pass 3 has no niche-conditional code.

## 3. Objects and file shapes

Engine tables (additive migration, no Phase 1-7 table altered): `screen_types`, `screens`, `transitions`, `asset_library`, `fair_use_assessments`; `projects.rendering_mode`; `audio_assets.pre_trim_duration_seconds / trimmed_seconds`.

```jsonc
// screen_type (registry row)   category: "template_driven" | "llm_authored_animation"
{"key": "failure-schematic", "category": "template_driven", "backing_component": "failure-schematic",
 "manifest": {"max_typing_speed_cps": 0, "max_nodes": 12, "min_scene_ms": 1000, "max_scene_ms": 15000, "max_animation_duration_ms": null},
 "elements": [{"name": "...", "description": "..."}]}            // named parts transitions may target
// screen
{"script_id": 7, "screen_type": "...", "narration_beat_ref": 3, "content": {...manifest fields...}, "authored_by": "ai|human",
 "resolved_start_time": null, "resolved_duration_ms": null, "status": "draft|validated|needs_repair|failed"}
// transition
{"from_screen_id": 1, "to_screen_id": 2, "transition_type": "...", "from_element": null, "to_element": null, "parameters": {}, "status": "pending|validated|violation"}
// CIS BuildJson (replaces scenes+component)
{"script_id": 7, "niche_key": "...", "rendering_mode": "cis", "screens": [{"screen_id","screen_type_key","category","backing_component","content","elements","start","duration_ms"}],
 "transitions": [...], "audio": {...}, "words": [...]}
```
Screen statuses `ok/flagged/replaced` are the operator-facing labels (v6). Legacy BuildJson stays byte-for-byte unchanged. Seeded screen types and their manifest bounds: [`niche-model-and-strategy-bundles.md`](../subskills/themed-news-niches/references/niche-model-and-strategy-bundles.md) section 6. `quick_hit_sting` (asset-sting): 0.75-2 s, only the channel's own mascot reaction library and Tier 0-2 sticker/animation sources, never a third-party clip of any length.

## 4. Rights-tiered asset sourcing

| Tier | Meaning | Use |
|---|---|---|
| **0** | verified public domain / owned by the channel | auto-selectable |
| **1** | Creative Commons / openly licensed (attribution carried in `attribution_text`) | auto-selectable |
| **2** | licensed stock, commercial terms confirmed for this specific use | auto-selectable |
| **3** | proprietary / unlicensed | **permanent exclusion record only** - excluded *in the query*, never held in memory as a candidate; a hard block, not a warning |
| **F** | fair-use candidate | **never auto-selected**; only via the human gate below |

Rules (V5-REQ-5.x): Pass 2 may select **Tiers 0-2 only**; a Tier F row is created *only* by approving a fair-use assessment; no "safe length", "obscure enough" or popularity heuristic may ever infer Tier F eligibility; a quote is routed through fact-check and is text-only by default (no celebrity photo/likeness unless that person is the segment's actual subject - V5-REQ-10.3); a source whose license cannot be verified at seed time is not seeded "as if confirmed".

**Tier F pathway** (designed to be used rarely):
1. **Subject-match gate (hard, first):** the narration must be genuinely *about* the specific clip/scene/franchise - critiquing, analysing or reporting on it as the subject - not decoration or emotional shorthand. Fail -> reject before any scoring and fall back to Tier 0-2 or an original illustration. When in doubt, fail.
2. Pass -> create a `fair_use_assessments` row `pending`, four memo fields empty: **purpose & character** (must be in the reviewing human's own words), **nature of the work**, **amount & substantiality** (incl. the "heart of the work" test), **market effect** - a structured memo, not a numeric score; also record `franchise_or_rightsholder` and show repeated reliance on the same rightsholder across the channel history (awareness, not a block).
3. Approval requires every memo field non-empty and `subject_match_passed`; it sets `reviewed_at`, creates the Tier F `asset_library` row (`license_reference` null - fair use is not a license) and links it. Rejection -> screen falls back. **Any ambiguous factor -> default reject.**
4. **Enforcement chokepoint:** build.json assembly raises `FairUseAssessmentPendingError` while any linked assessment is `pending`/`rejected` (placed there because assembly is the first point where "has every Tier F candidate been resolved" is answerable; Gate 1 comes *before* sourcing so cannot check it). The memos are shown at **Gate 2** beside the render for final human context.
5. **Polymorphic origin (RD-98):** `origin` = `asset_candidate` (screen-level, resolved at assembly) or `source_document` (an uploaded manga PDF gated *before parsing*, when no script exists). Principle: **enforce at the first point the question is answerable** - same state machine and memo fields, different chokepoint. Rights bases for a source document: owned / licensed (license reference required) / public-domain-or-CC (verification note required) / fair-use candidate (then the assessment).

Starter Tier 0-2 catalog seeded in the engine (examples of the discipline): Inter (SIL OFL, T0), JetBrains Mono (Apache-2.0, T0), channel-owned B-roll loops (T0), Pexels stock loops/clips and Unsplash photos (T1, attribution), Envato Elements packs (T2, licensed), public-domain quote sources (T0) - six asset types: font, background, sting, video_clip, quote, photo; 12 rows; exactly half have `verified_at` set (selection order: verified first, newest first). Buying subscriptions is a business decision outside the method.

## 5. Screens, elements, transitions

- Each screen type declares its manifest bounds and **named elements**; a transition may reference one element on the outgoing and one on the incoming screen (e.g. manga: background holds while the foreground cuts). An unknown element name is a `transition_validation` violation - never a silent whole-screen fallback chosen without a record.
- Template-driven content resolves to manifest fields only; photo/video/audio from Tier 0-2 or original illustration, never a raw web search.
- Mascot / reaction library is a Tier 0/1 asset category (mechanism built; the mascot design is open - OQ5-1). Transition-type vocabulary (slide, iris, match-cut...) is open - OQ5-3: the mechanism exists, the catalog does not.

## 6. LLM-authored animation (specified, never shipped)

`llm_authored_animation` screens would be generated HTML/CSS/JSX, validated by (1) a deterministic lint, (2) a sandboxed isolated render smoke test, (3) up to **2** targeted repair attempts, (4) fallback to the nearest template-driven type on exhaustion (a screen must render *something*); the deterministic check always wins over an LLM self-assessment. The runtime component remained a placeholder stub - **do not use `llm_authored_animation` in a real production**; hand-build a template-driven primitive instead.

## 7. Orchestration facts worth keeping

- Eligibility is "all named predecessors completed", not step order; `tts` and `screen_generation` both depend only on the approved script (fan-out), `screen_timestamp_insertion` on both `subtitle_export` and `screen_generation` (fan-in); an unequal-length fork cannot be expressed with a scalar frontier. Dispatch within a tick is sequential (SQLAlchemy sessions are not thread-safe; the win is that neither branch waits a full extra tick) - RD-83.
- Pause flags at a fork/join: decide for all frontier members first, then clear every predecessor's flag; otherwise a pause on the shared predecessor half-applies, or a fan-in step re-pauses forever after resume (V5-INV-11/12).
- `generate_build_json` takes `rendering_mode` as a parameter (no reverse join to project/niche - V5-INV-10); cis build.json is a `screens[]` array validated with the same "no extra keys, name the offending field" discipline; `source_url` must be forwarded into `SourceCitation` (a past bug).

## 8. Pacing rules that came with it (apply to both render modes - RD-81)

- **Breath/pause trimming** after loudness normalisation and before alignment: silence detection tightens inter-word/inter-sentence gaps past a threshold; log pre- and post-trim duration; the **updated** scene bounds (not the originals) must flow into alignment (V5-INV-8). Intensity is niche-conditional: `deadpan_technical` = full; `expressive_narrative` = light (higher threshold, smaller max cut per gap). (`slow_atmospheric` is a third voice mode; its trim intensity is not separately specified in v5.)
- **Relatable contrast**, **high-tech/low-brow whiplash**, **fact vs narrative flourish** editor tone note: directives, not schema (details in the themed-news-niches subskill's [`niche-model-and-strategy-bundles.md`](../subskills/themed-news-niches/references/niche-model-and-strategy-bundles.md)).
- Narration comes from sequential per-scene TTS concatenation, so screen X's audio always finishes before X+1 starts - no overlap enforcement needed (V7-INV-4).

## 9. Invariants (check every CIS production against these)

1. Mode is set once at creation (or one pre-Gate-1 override); never re-derived from the live niche. 2. No change after script approval.
3. Legacy projects behave exactly as before. 4. Timestamp insertion never runs while audio or screens are incomplete.
5. A Tier 3 row is never selectable; 6. a Tier F row exists only via an approved, fully-memoed, subject-matched assessment; 7. build.json never assembles with a pending/rejected assessment.
8. Trimmed audio never aligns against pre-trim bounds. 9. Every transition element name exists in its screen type. 10. build.json assembly is a pure transform (rendering mode is a parameter).
11-12. Fork/join pause semantics as above.

## 10. When to use CIS and how each video type maps

Use CIS when **at least two** hold: beats need different visual grammars; the visuals depend on third-party/illustration sources whose rights vary per asset; screens will be edited or regenerated individually; a vertical recap is planned; humans will author some screens.

| Video type | Screen types | Pass 2 specialisation | Rights focus | Where documented |
|---|---|---|---|---|
| Tech news | `cyber-terminal`, `failure-schematic`, `ai-logic-node`, `claim-evidence-compare`, `source-citation`, `chapter-card`... | semantic match beat -> type | Tier 0-2 + original diagrams; source captures attributed; no fabricated screenshots | [`themed-news-niches`](../subskills/themed-news-niches/SUBSKILL.md) |
| Horror stories | `atmosphere-narration` (text reveal over matched footage) | footage pool matched per segment | stock footage Tier 0-2; source stories are user-generated text (consent/IP/safety gate) | [`horror-story-videos`](../subskills/horror-story-videos/SUBSKILL.md) |
| Manga / webtoon recap | `manga-panel-composition` | deterministic panel layout | **source_document** rights gate before parsing; the highest fair-use/copyright exposure of any theme | [`manga-recap`](../subskills/manga-recap/SUBSKILL.md) |
| Stickman / storyboard | *(proposed, not from the CIS specs)* scene-illustration screens + captions | pose/scene library | original or Tier 0-2 art only | [`stickman-storyboard-videos`](../subskills/stickman-storyboard-videos/SUBSKILL.md) |
| Chat stories | *(judgement)* chat-UI frames are one fixed visual grammar, so CIS adds little; use the chat engine's own pipeline | n/a | background gameplay footage rights | [`chat-story-videos`](../subskills/chat-story-videos/SUBSKILL.md) |
| Ambient / clip-card / physics | not narration-led - do not use CIS | | | |

## 11. Adopting CIS for a new video type (checklist)

1. List the visual grammars the beats need; give each a screen type with a manifest (bounds, elements). Reuse before building (see five-point registration in the niche subskill).
2. Define the narration-beat -> screen mapping (semantic match or deterministic); define `scene_energy`-style knobs if any.
3. Decide authoring: AI, human, mixed; human screens use the same bounds.
4. Decide the source rights model and where the first answerable point is (document upload vs asset pick); add an `origin` rather than a parallel mechanism.
5. Write Pass 1 rules including the *strict boundary rule* (narration describes only its own beat).
6. Specify Pass 3 binding key (`narration_beat_ref`) and the mismatch fallback; Pass 4 transition defaults and element-target rules.
7. File layout for hand-running (state as files): `pass1-narration.json`, `pass2-screens.json`, `rights-ledger.json` (asset, tier, license, attribution, verified_at, assessment id/status), `pass3-timing.json` (from WhisperX), `pass4-transitions.json`, `build.json`. Validate each against the schema before the next pass.
8. Gates: Gate 1 after Pass 1; rights chokepoint before render; Gate 2 on the final MP4s with memos visible.
9. Define the vertical-recap preflight (every screen type has a 9:16 variant) before promising Shorts.

## 12. Risks, open questions, sources

- **Fair use is a legal judgement, not a score.** The pathway deliberately pushes toward rejection; a one-time attorney consultation was recommended in the source and never done - unresolved. Reusing clips because they are short or obscure is explicitly forbidden. Manga/webtoon recaps and user-submitted horror text carry copyright and consent exposure beyond what tiering solves; read their subskills' policy sections. YouTube "reused content" policy applies to any recap format - original analysis and transformation must be real, and AI/synthetic disclosure obligations stay with the channel.
- **License drift:** licenses change; no monitoring system was built - re-verify `verified_at` before large productions.
- **Open creative choices:** mascot (OQ5-1), recurring humour conventions (OQ5-2), transition-type vocabulary (OQ5-3).
- Sources: `kiro-specs/specs/v5-addendum/{requirements,design,tasks}.md` (archived under the `.kiro` archive folder, see [`legacy-and-removed.md`](legacy-and-removed.md)), v7/v8 addenda for manga/horror specialisation, v6 for production modes, console docs `sources.ts` and `rendering.ts`.
