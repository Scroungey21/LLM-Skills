# Vertical (Shorts) recap variant

Compiled 2026-11-01 from v8 `requirements.md` §8-9 and `design.md` §1.3-1.5, §7-8 (RD-117/118/124-128/130/133), `vertical_recap.py`, `test_v8_13_vertical_recap.py`, `scriptwriter.py`
(`_condensation_user_prompt`), `orchestrator/steps.py::_advance_vertical_layout`, `seed.py`, and the owner's Shorts rule from the HES memory notes.
**Bottom line, up front: the archived engine's vertical-recap derivation does not work for `manga_recap`.** Section 2 lists the four independent blockers. Section 1 records what v8 decided
(niche-independent, all of it reusable as method); section 3 is how to make a manga Short today; section 4 is a proposal for the 9:16 composition.

## 1. What v8 decided (spec, niche-independent)

| ID | Rule |
|---|---|
| V8-REQ-8.1 | Vertical-recap generation is an **explicit operator action**, only **after Gate 2** (the parent's latest `render_jobs.status == "approved"` in code); never automatic, never earlier |
| V8-REQ-8.2 / RD-118 | `projects.derived_from_project_id` (nullable, self FK, **not unique**) - the first project-to-project FK |
| V8-REQ-8.3 | Reject unless the parent is `rendering_mode="cis"` (`VerticalRecapRequiresCisError`); a derived project always inherits `cis` |
| V8-REQ-8.4/8.6, RD-125 | A derived project gets its own synthesised `RawItem` (fingerprint `vertical-recap://<parent id>`, content "Vertical recap derived from project #N: ...") and `ScoredItem` (`selected=True`, scores NULL). **At most one** derivative per parent: dedup is a direct `dedup_hash` lookup, *not* `find_duplicate` (its fuzzy-title fallback false-positives once the parent title exceeds ~68 chars because the fixed "Vertical recap: " prefix stops mattering) |
| V8-REQ-8.5, RD-126/127 | `scoring` and `asset_curation` auto-complete at creation; `CIS_STEP_NAMES` reused unmodified (no new step tuple) |
| V8-REQ-9.1, RD-128 | `advance_scriptwriting` branches on `derived_from_project_id`: **condensation** of the parent's *approved script narration* instead of a from-scratch script |
| V8-REQ-9.2 / V8-INV-4 | Condensed script runs **editor_critique and fact_check** like any new script, grounded against the **parent's approved narration** (not the source) - condensation creates new narration text, and new narration is never shipped ungrounded |
| V8-REQ-9.3 / V8-INV-7 | `screen_types.aspect_ratio_variants` (nullable JSON): a screen type with no `"9:16"` key blocks `screen_generation` with a named error (`MissingVerticalVariantError`); no silent horizontal fallback. `spawn_vertical_recap` also fails early (`VerticalLayoutUnsupportedError`) if *none* of the parent's screens support 9:16 |
| V8-REQ-9.4 | Timestamp insertion, screen validation, transition authoring/validation re-run on the new audio/alignment, unmodified |
| V8-REQ-9.5 | `strategy_bundle.shorts_cta_style`: `link_to_source` (informational niches) or `link_to_full_video` (narrative niches; **default**) |
| V8-REQ-9.6 | Derived `production_mode = "automatic"` always; (v11) `gating_mode = "auto"` |
| V8-REQ-9.7 | The derived project is a normal project on the existing project page with a visible parent<->derivative link; no bespoke UI |
| RD-133 | `CisBuildJson.aspect_ratio?: "16:9" \| "9:16"` (CIS only); `"9:16"` yields a **1080x1920** canvas via `calculateMetadata`; legacy build JSON untouched |
| Derivation guards (code) | parent must not itself be derived (`ParentAlreadyDerivedError`); missing parent / not Gate-2-approved (`ProjectNotFoundError`, `ProjectNotGate2ClearedError`); duplicate (`DuplicateVerticalRecapError`) |

Condensation prompt (code `_condensation_user_prompt`): parent narration in; target **55 s** (`SHORTS_TARGET_RUNTIME_SECONDS`), word budget `round(55/60 x 225 x 0.9) = 186`; "a CONDENSATION pass, not a from-scratch script"; **hook in the first 2 seconds** on the single most surprising/consequential moment (no preamble); **one tight beat** (state the moment, one piece of context that makes it matter, a takeaway or payoff); **at most one pattern interrupt**; only scene 0 has `is_hook`; paraphrase and compress, never truncate mid-thought; CIS script, so `component = ""` and cues zero; ends with a CTA scene.
CTA copy: `link_to_full_video` instructs the exact sentence *"if you want more details, check the full video in the comments and description"* while `ensure_shorts_cta` appends the news channel's constant *"if you want more details, check the full video in the description"* to every short-form script. **Conflict inside the code (unresolved):** two different sentences, risking a doubled or mismatched CTA. Pick one for your channel and define it once.

## 2. Why it does not work for manga in the archived engine

1. **No Gate 2 in the default mode.** The default `manga_recap` mode is `manual` (NLE export), which never creates a `render_jobs` row (V7-INV-8). `_require_gate2_cleared_project` needs an *approved* render job, so `spawn_vertical_recap` raises `ProjectNotGate2ClearedError`. Only a project flipped to `automatic` and approved at Gate 2 qualifies.
2. **No 9:16 variant on the screen type.** `SCREEN_TYPE_ASPECT_RATIO_VARIANTS` in `seed.py` contains only `atmosphere-narration: {"9:16": {"layout":"responsive"}}`. `manga_panel_composition` has none, so derivation fails with `VerticalLayoutUnsupportedError`. v8 non-goals explicitly deferred it: giving the manga screen type a vertical variant is "a natural, small follow-up", never done.
3. **Screens are copied by position, not by panel.** `_advance_vertical_layout` builds each condensed screen by **copying the `content` of the parent screen at the same proportional position** (`parent_index = int(i / n_condensed x n_parent)`), reasoning that both CIS niches use one screen type throughout. For horror that is harmless; for manga it means the condensed narration would sit over an arbitrary parent panel whose content has nothing to do with the line being spoken, breaking the one-narration-one-panel contract (V7-REQ-5.4). The condensation prompt also carries no panel list and sets no `panel_id` / `scene_energy`.
4. **Fact-check grounding changes.** For a derived project the ground truth is the parent's narration (V8-REQ-9.2), so panel-level grounding of the Short is lost unless the condensed scenes are re-linked to panels.

So there is no archived path to a manga vertical recap. Treat the v8 text as **method** and build the Short as in section 3.

## 3. Making a manga Short today (agent as the LLM layer)

Shorts are summaries, not trailers (owner's rule from the HES work: the Short summarises the **whole** long video and ends with a CTA; not a cliffhanger clip). Follow the same chain as the long video, with these changes:

1. **Script**: write the Short as a condensation of the *approved* long script (V8-REQ-9.1), 55 s / <= 186 words (about 5-9 scenes), hook in 2 s, one beat, <= 1 pattern interrupt, then the CTA scene. **Keep the panel link**: every Short scene gets its own `panel_id` (a panel already used in the long, or a better-fitting one), `scene_energy`, and narration grounded in *that* panel, then run the usual panel-grounded fact-check ([script-and-narration.md](script-and-narration.md) §6). Also check against the parent narration (V8-REQ-9.2): nothing in the Short may contradict or add to the long.
2. **Panels**: pick 5-9 high-information panels for the beats; for a story with a twist, show the setup panel, the turning panel and the consequence panel, not a random sample. Spoiler policy is a per-channel decision (does the Short reveal the ending?); the Short is a summary by design, so state the policy once and keep titles consistent with it.
3. **Composition**: 1080x1920 with the 9:16 recipe below. Safe areas: keep captions and subject out of the top ~8% and bottom ~20% of the frame (Shorts UI; [qa-gates.md](../../../references/qa-gates.md) §13); the shared 9:16 caption spec puts the chunk centre at 70% of height ([audio-captions-music.md](../../../references/audio-captions-music.md) §2). Check the 9:16 layout separately - never assume a 16:9 crop is safe.
4. **Audio**: same narrator and voice as the long (one voice per video; same bed), same trim/tempo decision; measure the final mux.
5. **Description**: link to the full video and to the official/licensed place to read the work; same rights credit as the long ([qa-metadata-release.md](qa-metadata-release.md)).
6. **Release**: Short and long are one package pair in the calendar ([release-calendar.md](../../../references/release-calendar.md)).

## 4. Proposal: a 9:16 `manga-panel-composition` (nothing here is archived behaviour)

If the engine is restored and extended, the minimum to make the variant real (this is what `aspect_ratio_variants["9:16"]` was designed to carry):

| Item | Proposal |
|---|---|
| Registry | add `"manga_panel_composition": {"9:16": {"layout": "fit-width"}}` to `SCREEN_TYPE_ASPECT_RATIO_VARIANTS` (the seed also back-fills an existing row whose variants are NULL) |
| Background | same panel, `cover`, blur 85%, as in 16:9 |
| Foreground | fit by **width**, 90-100% of 1080 px for portrait panels; for wide panels (aspect > 1) keep 100% width and let the blurred backdrop fill above and below; clamp by height too (see the portrait-overflow finding in [composition-transitions-export.md](composition-transitions-export.md) §1) |
| Energy | keep low/medium/high but remap to the narrower range (e.g. 90/95/100% width), since 60-80% of a 1080 px width is too small to read dialogue-heavy panels on a phone |
| Mapping | derive screens **by `panel_id`** (re-run the deterministic `_generate_manga_recap_screens` for the condensed script) instead of copying the parent's content by position |
| Prompt | extend the condensation prompt with the panel list and the `panel_id` / `scene_energy` instructions |
| Gate | allow derivation from a manual-mode parent by accepting an **acknowledged NLE export** as the "post-gate" signal, or switch the derived project to automatic render |
| Strip formats | webtoon-native vertical strips suit 9:16 directly: scroll the strip at constant speed behind the narration instead of cutting stills |

Whatever you build, keep V8-INV-7's principle: if a screen cannot be laid out vertically, fail loudly; do not letterbox a 16:9 composition into a 9:16 canvas.
