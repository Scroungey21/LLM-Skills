# Vertical Shorts recap (9:16 derivative of a long video)

Contents: 1 Trigger and preconditions · 2 What spawning creates · 3 Condensation (script) · 4 CTA · 5 Vertical layout · 6 Passes that re-run · 7 Running it without the engine (NEW) ·
8 Rights, gates and limits · 9 Known v1 limits

Labels: **[A]** archived (V8-REQ-8.x/9.x, `engine/app/synthesis/vertical_recap.py`, `orchestrator/steps.py`, `synthesis/scriptwriter.py`), **[N]** new guidance. The spec framed this as a general CIS feature; in practice
**it only worked for horror** (section 9), so it belongs to this subskill.

## 1. Trigger and preconditions [A]

`spawn_vertical_recap(session, parent_project_id)`; HTTP `POST /projects/{id}/vertical-recap`; console button "Generate vertical short" on the parent's page. It is an **explicit operator action**, never
automatic, and never offered before Gate 2 (V8-REQ-8.1). Checks in order, each a named error:

| Check | Error | Reason |
|---|---|---|
| Parent exists | `ProjectNotFoundError` | |
| Parent's latest `render_jobs.status == "approved"` (Gate 2 cleared) | `ProjectNotGate2ClearedError` | mirrors `tick._gate2_awaiting`'s definition of Gate 2 |
| `parent.rendering_mode == "cis"` | `VerticalRecapRequiresCisError` (V8-REQ-8.3) | layout adaptation uses `screen_types.aspect_ratio_variants`, a CIS-only concept |
| `parent.derived_from_project_id is None` | `ParentAlreadyDerivedError` | no "recap of a recap"; originally enforced only in the UI, found by verification (VERIFICATION_REPORT bug 8) |
| At least one parent screen uses a screen type with `"9:16"` in `aspect_ratio_variants` | `VerticalLayoutUnsupportedError` | fail **before** creating rows or spending an LLM call (VERIFICATION_REPORT bug 9: manga_recap otherwise burned a condensation + editor + fact-check then died in screen_generation) |
| No existing derivative | `DuplicateVerticalRecapError` (V8-REQ-8.6, V8-INV-8) | one vertical cut per parent in v1 |

**Duplicate check detail:** a direct lookup `RawItem.dedup_hash == compute_dedup_hash("vertical-recap://<parent.id>")`, deliberately **not** `find_duplicate()`. Its fuzzy-title fallback (token_sort_ratio >= 90, not
niche-scoped) false-positives because the candidate title `"Vertical recap: <parent title>"` embeds the parent's own title; the ratio exceeds 90% once the parent title is about 68+ characters
(2P/(2P+15) >= 0.90), which real Reddit-style titles reach. Regression: `test_spawn_vertical_recap_long_parent_title_does_not_false_positive_as_duplicate`.

## 2. What spawning creates [A]

- A new `RawItem` (`url`/`dedup_hash` from `vertical-recap://<parent.id>`, `fuzzy_title="Vertical recap: <parent title>"`, `content` = a stub "Vertical recap derived from project #N: <title>") and a `ScoredItem(selected=True)`,
  because `projects.raw_item_id` is unique and not null (v7 RD-102 pattern, third use, RD-125). **The stub content is not source material** - condensation reads the parent's *script* instead.
- A `Project` via `_create_project`, then `derived_from_project_id = parent.id` (the schema's first project-to-project FK; nullable, non-unique, RD-118), `rendering_mode="cis"`, **`production_mode="automatic"`**
  (V8-REQ-9.6, RD-130), and **`gating_mode="auto"`** (V11: a lightweight secondary re-render of approved content is not made to wait on per-step approvals).
- `scoring` and `asset_curation` pipeline steps marked `completed` ("auto-completed: derived project reuses parent #N"). `CIS_STEP_NAMES` is reused unmodified - no new step tuple (RD-127, V8-REQ-8.5).
- The parent and derivative show a visible link to each other on their project pages (V8-REQ-9.7); the derived project is reviewed on its own normal project page.

## 3. Condensation (script) [A]

`advance_scriptwriting` branches on `project.derived_from_project_id is not None` (niche-independent) into `_advance_condensation` (V8-REQ-9.1). The prompt (`_condensation_user_prompt`) feeds the **parent's approved script
narration** (all scene narrations joined), not the stub, plus:
- target runtime **55 s** (`SHORTS_TARGET_RUNTIME_SECONDS`), word budget from `total_word_budget(55)` = 55/60 x 225 wpm x 0.9 = about 186 words (technews pace; see warning below);
- "a CONDENSATION pass, not a from-scratch script": shorten into a tight vertical cut of the most essential beats; **the hook lands in the first 2 seconds** on the single most surprising/consequential moment of the parent
  narration (no scene-setting or preamble); one narrative beat only (state the moment, one piece of context that makes it matter, a clear takeaway or payoff); **at most one pattern-interrupt**; only the first scene is a hook
  (`is_hook=false` on the rest); paraphrase and compress, **never simply truncate the parent mid-thought**; CIS rules (`component=""`, zero cues).
- Then the same atomic `run_synthesis()` stages as any new script: `editor_critique` and `fact_check` against the **condensed** script, with the **parent script's narration as ground truth** (V8-REQ-9.2, RD-128, V8-INV-4). Reason: condensation
  produces genuinely new narration text and nowhere in the pipeline may new narration ship ungrounded. This went beyond the source document's own 5-step list on purpose.

**Warning (NEW):** the 186-word budget assumes 225 wpm. A horror Short narrated at 120-150 wpm needs about 110-140 words for 55 s (`runtime/60 x accepted_wpm x 0.9`); recompute the budget from the accepted pace or the Short
will overrun 60 s. Also note a 55 s horror cut leaves room for exactly one hook, one escalation line and one break.

## 4. CTA [A] with a contradiction

`strategy_bundle.shorts_cta_style`: `"link_to_full_video"` for narrative niches (horror) vs `"link_to_source"` for informational niches (V8-REQ-9.5), resolved from the derived project's niche at condensation time.
- Condensation prompt text for `link_to_full_video`: end with a **separate CTA scene containing this exact sentence, no paraphrase**: "if you want more details, check the full video in the comments and description".
- But the code path `ensure_shorts_cta(scenes)` (`narration_beats.py`, applied to any short-form/derived script) **strips that wording** and appends the constant `SHORTS_CTA = "if you want more details, check the
  full video in the description"` as its own final scene (idempotent; the "comments and description" variant is kept only as a legacy strip pattern, referencing a playbook that mandates "...in the description").
  **Code governs: the effective CTA is "...in the description".** The same constant is the news-explainer `SHORTS_CTA`. Do not hard-code the sentence twice anywhere (a duplicated literal is a defect, news-explainer invariant 2).
- Craft note [N]: a CTA sentence after a horror payoff deflates dread. Keep it as a separate final scene (archived behaviour) but give it a quiet treatment: held last frame, bed dropping out, no sting; or, if the
  owner prefers, end the story beat on the break and let the CTA read as an end-card caption. Record the choice per channel.

## 5. Vertical layout [A]

`advance_screen_generation` branches on the same predicate into `_advance_vertical_layout` (V8-REQ-9.3). It does **not** copy the parent's screens (scene boundaries differ). It maps each condensed scene to the screen
type of the parent screen at the same **proportional position** (both CIS niches use one screen type throughout, so positional mapping equals semantic matching), copies the matched parent screen's `content`, and
requires `screen_type.aspect_ratio_variants["9:16"]`, else `MissingVerticalVariantError` (V8-INV-7). Properties verified by test: all scenes validated **before** any Screen row is constructed (no partial rows on failure),
and it backfills when screens already exist (`test_v8_14_15_vertical_derivation.py`).

Only `atmosphere-narration` is seeded with a vertical variant: `SCREEN_TYPE_ASPECT_RATIO_VARIANTS = {"atmosphere-narration": {"9:16": {"layout": "responsive"}}}`; the value carries no layout data, **its presence is the
signal** (the component is `AbsoluteFill`-based and resizes with the canvas). The manga panel type was deliberately left without a variant until a real 9:16 render proves panel framing works.

## 6. Passes that re-run, and the render [A]

Unmodified existing advancers, operating on the derived project's own rows (V8-REQ-9.4): `tts` (new audio for the condensed text), `alignment`, `subtitle_export`, `screen_timestamp_insertion`, `screen_validation`,
`transition_authoring`, `transition_validation`, `render`, `metadata`. `generate_build_json` sets `CisBuildJson.aspect_ratio = "9:16"` from `derived_from_project_id is not None`; `Root.tsx`'s `calculateMetadata` returns
1080x1920 (else 1920x1080; absent field = 16:9, so legacy builds and old fixtures are unchanged). The live-preview route once forgot to pass `aspect_ratio` and silently previewed vertical projects at 16:9 (VERIFICATION_REPORT bug 6).

## 7. Running it without the engine (NEW [N])

A file-based channel does the same thing as a **separate 55 s package**, not a crop of the long video:
1. After the long video's Gate 2, create `<slug>-short/` with a `parent.json` (parent slug, render hash, approval date). Refuse if the parent is itself a short or already has one (unless the owner allows more, section 9).
2. Claude writes `short.script.json` by condensing the parent's **approved** script (section 3 rules), then runs the editor checklist and the grounding check against the parent script (no new facts, no new story elements).
3. Re-record narration for the condensed text (never speed up or cut the long audio); re-align; captions at the 9:16 position and size ([visuals-audio-captions.md](visuals-audio-captions.md) §7).
4. Re-compose plates for 9:16 (separate crops, subject inside the middle safe area, clear of the Shorts UI) from the same `plates.json`; same filter, same palette.
5. Render 1080x1920 (or the channel's chosen master), same loudness target, same human QA and Gate 2 for the Short as a publishable video.

## 8. Rights, gates and limits [N]

- The Short uses the same stories, so the **rights scope must include Shorts** ([sourcing-rights-and-consent.md](sourcing-rights-and-consent.md) §3). Re-run the policy screen: a 55 s cut can concentrate the most graphic beat.
- The archived derivative ran with `gating_mode="auto"` (no per-step approvals) but still passed Gate-1-style editor/fact-check machinery; in a human-gated channel a Short is still a published video: **the human approves its
  script and its render** before anything is scheduled (`../../../references/agent-principles.md` §5).
- Shorts feed a different audience than long-form; packaging rules for titles/thumbnails are in [qa-gates.md](qa-gates.md) §5.

## 9. Known v1 limits [A]

- At most **one** derivative per parent (explicit non-goal to make a second cut; revisit only deliberately - for example a Part 1 / Part 2 cliffhanger series, an effective pattern in the chat-story study [R]).
- Horror-only in practice (single seeded vertical variant); `manga_recap` fails fast at spawn.
- No manual-mode co-authoring for derived projects (always automatic).
- The vertical-layout step copies the parent's content verbatim, which for horror means the background pool of the parent; in a plate-based channel regenerate the 9:16 crops instead.
