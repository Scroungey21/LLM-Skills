# Current state, contradictions and open questions

Compiled 2026-11-01. Evidence class (per [theme-catalog.md](../../../references/theme-catalog.md)): **SPEC-ONLY + ARCHIVED implementation**. There is no manga-recap channel, no published video, no market or
audience data and no policy research in the repo. Everything in this subskill is either (a) a numbered spec decision, (b) behaviour of the archived engine read from code/tests, or (c) a labelled proposal.
Nothing here was run: the archived engine is not installed and no archived command was executed while writing this.

## 1. What exists

| Layer | State |
|---|---|
| Specs | v7 addendum (requirements 367 lines, design 1065, tasks 213) - "approved-pending-dispatch" when v8 was written; v8 §8-9 (vertical recap) and v5 §5-6 (rights tiers). Archive: `H:\Projects\YTtechnews-archive-2026-11-01\kiro-specs\specs\{v5,v7,v8}-addendum\` (**not** in the git tag) |
| Engine code | in tag `pre-skill-reduction` under `engine/app/{synthesis,api,models}` (files: `manga_documents.py`, `manga_ingestion.py`, `manga_panel_parser.py`, `manga_suggestions.py`, `nle_export.py`, `vertical_recap.py`, `api/manga_documents.py`, `api/manga_export.py`, `api/manga_suggestions.py`, `models/manga_source_document.py`, `models/manga_panel.py`, `scriptwriter.py`, `fact_check.py`, `screen_generator.py`, `transition_validator.py`, `orchestrator/{steps,tick}.py`, `fair_use.py`) and `engine/alembic/versions/` (`8647c41abcd5`, `b4506e9001ce`, `f607149a9268`, + v8 `b8f3d2a91c47`) |
| Console | `console/app/manga-uploads/page.tsx`, `console/app/nle-export/{page.tsx,[projectId]/page.tsx}`; in-app docs `console/app/docs/content/{niches,sources,rendering,pipeline}.ts` |
| In the live toolkit | `toolkit/renderer/src/components/MangaPanelComposition.tsx`, `toolkit/manifests/manga-panel-composition.json`, registration in `types.ts` / `manifests.ts` / `SceneRenderer.tsx`, `render-cli.mjs --stills`, `transitions.ts`, `BeatLayer.tsx` (no-op) |
| Tests (archived) | `test_v7_3_manga_documents.py` (rights gate, parse-failure containment, key redaction), `test_v7_4_manga_panel_parser.py` (real PDF raster + crop geometry; vision stubbed), `test_v7_7_scriptwriter_fact_check.py` (panel context, ground truth, correction pass), `test_v7_10_nle_export.py` (package, idempotency, gate 7, mode dispatch), `test_v7_12_13_route_smoke.py` (20 test functions; the integration-test docstring says "30 route-level smoke tests", count unreconciled), `test_manga_recap_pipeline_integration.py` (upload -> panels -> spine -> script -> screens -> export; **TTS/alignment and Remotion stills stubbed**), `test_v8_13_vertical_recap.py` (generic derivation, hand-built niche; no manga fixture) |
| Task set | V7.1-V7.15 (models, migration + seeds, rights backend, parsing, ingestion, `asset_curation` short-circuit, scriptwriting + fact-check, screen generation + component, passes 3/4, NLE export backend, series suggestion, two console views, `--stills` mode, verification) in a 5-wave DAG |

## 2. What was and was not verified (by the archive's own records)

- Verified by tests: rights gating and immediacy for the three bases; fair-use pending/approve/reject effects on the document; parse-failure containment (savepoint, no partial panels, `parse_error` set, keys redacted); panel crop geometry (dominant pixel colour of a crop equals the colour drawn at that region); panel context in the scriptwriter prompt; panel-grounded fact-check and the correction pass; NLE package contents, idempotency, mode dispatch, acknowledgment gate; route behaviour.
- **Never executed end to end:** the integration test's docstring says the real `data.sqlite` had zero manga rows and zero manga projects at the V7.15 pass, and the chain with **real TTS, real WhisperX alignment and real Remotion rendering never ran**; those were stubbed (fake WAV bytes, fake PNG bytes, hand-set timings).
- No evidence that any real chapter, vision model, voice or editor handoff was ever completed.

## 3. Known gaps in the archived implementation (found by reading code; each is also noted where it matters)

1. **Voice**: seeded `manga_recap` niche has `voice_profile_id = NULL`; NLE export hard-requires one, so export cannot succeed for a real project. Never patched (an editorial call for the owner).
2. **Metadata/thumbnail unreachable in manual mode**: `metadata` waits for a render job with `status == "done"` that manual mode never creates ([qa-metadata-release.md](qa-metadata-release.md) §3); and its `source_citations` would carry the fake `manga-upload://` fingerprint.
3. **Panel images and Remotion**: bare-filename `image_path`, no inlining or `publicDir`; real loading unverified. **Portrait panels overflow** the 16:9 frame (width-only scaling) ([composition-transitions-export.md](composition-transitions-export.md) §1).
4. **`simple_transition` is not a fade** in `transitions.ts`; scene-continuity signal never wired; boundary crossfades never rendered.
5. **Runtime target ignores chapter size**: manga scripts always target 240 s / 810 words (content-length banding applied to a one-line stub).
6. **Tempo**: `NARRATION_TEMPO` 1.2 is applied to every niche; no decision for expressive narration.
7. **Vertical recap blocked** for manga on four counts ([vertical-recap.md](vertical-recap.md) §2).
8. **Webtoon / manhwa / LTR**: PDF-only input, RTL default, no per-document reading direction, no strip slicing ([panel-parsing.md](panel-parsing.md) §8).
9. **Parsing is synchronous, single-attempt, unretried**; failure only visible as `parse_error`.
10. **Dedup is byte-exact**; no series/chapter ledger; `franchise_or_rightsholder` is the title placeholder.
11. **No manga safety/age-rating gate**, no translation layer, no thumbnail tooling (non-goals).
12. **Rejection notes** only in `notifications_log`.
13. **The only AI in series choice** is a stateless suggestion call with no existence check beyond the prompt.
14. **Pacing beats**: the 1.5-2.0 s visual-change rule (audit-remediation Req 6) was implemented then neutralised.
15. **Model/provider state of the archive** (keys dead, `panel-parser` needs a vision provider; `lm_studio_local` / `ollama_local` capabilities depend on the loaded model) - irrelevant here because the agent reads the pages, but relevant if the engine is restored.

## 4. Contradictions found (source A vs source B; written as ...)

| # | A | B | Written as |
|---|---|---|---|
| 1 | Export dir `nle_exports` (design §4.1) | `nle_export` (code) | code |
| 2 | Ack route `/projects/{id}/export/acknowledge` (tasks V7.10) | `/projects/{id}/acknowledge-export` (design §9.5 and code) | code |
| 3 | Console `console/app/manga/upload`, `console/app/projects/[id]/export` (design) | `manga-uploads`, `nle-export/[projectId]` (code, in-app docs) | code |
| 4 | Upload UI = dropzone + four bordered cards + inline warning (design §3.5) | the shipped page has the four descriptions, a warning block at review time and a queue; equivalent intent | both noted |
| 5 | Spec never seeds `production_mode` for the niche; V7-REQ-8.1 treats automatic as the reference path | seed sets `production_mode = "manual"` (integration fix) | code; automatic still available |
| 6 | v5 RD-99: deadpan = full trim (0.40 s / 0.15 s) | code maps deadpan **and** expressive to light (0.60 s / 0.30 s) | code |
| 7 | V5-REQ-5.6 requires the purpose-character memo to approve | code requires all four memos | code |
| 8 | Req 6 audit rule: a visual beat every 1.5-2.0 s on `MangaPanelComposition` | `BeatLayer` renders nothing | code (no motion) |
| 9 | Transition authoring: crossfade/wipe at scene boundaries (V7-REQ-7.2) | emits `simple_transition`, which the renderer does not fade | code (hard cut) |
| 10 | Spec: no new routing stage except `panel-parser` | code also has `manga-suggestions` | code |
| 11 | CTA `link_to_full_video` text ends "in the comments and description" | `ensure_shorts_cta` appends "...in the description" | unresolved - define once |
| 12 | Presentation tail 0.5 s (`queue.py`) | pipeline comment says 2.5 s | unresolved - state the value used |
| 13 | V7 non-goal: no thumbnail generation | the generic `metadata` step does generate thumbnails (but is unreachable in manual mode) | non-goal stands for manga; generic step is not usable |
| 14 | Design pseudocode ORs a scriptwriter-declared "same continuous scene" signal into the cut test | no such field reaches the `screens` table; code uses the same-page test only | code (same-page test only) |
| 15 | v7 requirements "approved-pending-dispatch"; v8 text "specced, not yet implemented" | code and tests for v7 exist in the tag | implemented but never exercised end to end |

## 5. Open questions (owner decisions this skill may not settle)

1. First channel's rights route (own work / licence partner / public domain) and whether `fair_use_candidate` is ever acceptable.
2. Attorney consultation (v5 §12) - done or not.
3. Voice: which licensed/synthetic voice; the disclosure answers for synthetic narration; tempo for expressive narration (1.0 vs the 1.2 code default).
4. Output model: NLE-assembled (manual, the archived default) vs fully rendered (automatic) vs both.
5. Whether to restore the engine or keep the file-packet workflow; if restored, per stage: keep API or convert to packet.
6. Whether panel-motion (pan/zoom) is part of the channel's look, and the shared 9:16 composition rules (section 4 of [vertical-recap.md](vertical-recap.md)).
7. Webtoon/manhwa support (strip slicing) - in scope or not.
8. Caption style for narrative content (the shared ZDF-style spec is HES-derived).
9. Thumbnail policy and whether panel art may appear in thumbnails.
10. Channel name, ownership entry in the repo `CLAUDE.md`, release cadence and calendar root (new-channel playbook items).
