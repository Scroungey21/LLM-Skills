# Data model, state machines and invariants (archived implementation)

Compiled 2026-11-01 from the v7 addendum (`requirements.md` / `design.md` / `tasks.md`), v8 for the vertical bits, and the archived
engine code and Alembic migrations. **Where code and spec disagree, code is written here and the difference is tagged `SPEC vs CODE`.**
Source locations: code = git tag `pre-skill-reduction` (`git archive pre-skill-reduction engine console manifests`, see
[legacy-and-removed.md](../../../references/legacy-and-removed.md)); the specs are **not** in the tag, they live in
`H:\Projects\YTtechnews-archive-2026-11-01\kiro-specs\specs\{v5,v7,v8}-addendum\`.

You do not need a database to run a recap channel now ([operations-agent-as-llm.md](operations-agent-as-llm.md) mirrors these records as JSON
files). This file is the schema to mirror, and the checklist if you ever restore the engine.

## 1. The four nouns the brief asks about

| Noun | In the archived engine | Notes |
|---|---|---|
| **Document** | table `manga_source_documents` | one uploaded PDF + its rights attestation (V7-REQ-4.1) |
| **Page** | **no table.** A page is a transient 200 DPI PNG raster in `DATA_DIR/manga_scratch/manga_pages_*/page_0001.png`; only `manga_panels.page_number` (1-based) survives | a page you cannot re-open without re-rasterizing the PDF |
| **Panel** | table `manga_panels` | the unit everything downstream keys on (V7-REQ-4.2) |
| **Suggestion** | **never persisted.** `POST /synthesis/suggest-manga-series` returns `[{title, description}]` and writes nothing (V7-REQ-3.6) | informational only, never creates a project |

## 2. Tables (v7 additions)

`manga_source_documents` (RD-4 convention: status-like columns are plain strings, no native enums):

| Column | Type | Rule |
|---|---|---|
| `id` | int PK | |
| `title` | str | derived from the upload filename stem (no richer source exists before parsing) |
| `pdf_path` | str | **relative to `MANGA_UPLOADS_DIR`**; file name is `<uuid4hex>_<original name>`; written before any rights decision (V7-REQ-2.2) |
| `rights_basis` | str | one of `owned` / `licensed` / `public_domain_cc` / `fair_use_candidate` (`MANGA_RIGHTS_BASES`) |
| `license_reference` | str? | required (non-blank after `.strip()`) iff `licensed` |
| `verification_note` | str? | required (non-blank) iff `public_domain_cc` |
| `status` | str | `pending_review` -> `verified` or `rejected` (`MANGA_SOURCE_DOCUMENT_STATUSES`) |
| `verified_at` | datetime? | set on verification |
| `parse_error` | text? | **code-only addition (migration `f607149a9268`)**: last parse failure, <= 2000 chars, provider keys redacted. NULL means "not attempted yet" or "succeeded". It exists because a parse failure otherwise left a `verified` document with zero panels indistinguishable from success |
| `created_at` | datetime | |

`manga_panels`:

| Column | Type | Rule |
|---|---|---|
| `id` | int PK | the id the script's `panel_id` points at |
| `source_document_id` | FK | |
| `page_number` | int | 1-based |
| `panel_position` | int | 1-based reading-order index **within the page** |
| `image_region` | JSON | `{x, y, width, height}` normalised 0-1 of the FULL PAGE raster; kept for provenance and a later higher-resolution re-crop |
| `cropped_image_path` | str | **relative to `MANGA_PANELS_DIR`**; name `doc{doc}_p{page}_{pos}.png`; cropped once, eagerly, at parse time; lossless PNG |
| `extracted_dialogue_text` | text | `""` (never null) for a wordless panel |
| `visual_description` | text | 1-2 plain sentences; required because fact-check needs non-dialogue ground truth (V7-REQ-4.2) |
| `created_at` | datetime | |

Extensions to existing tables:

- `screens.panel_id` (FK -> `manga_panels.id`, nullable, **not unique**: V7-REQ-5.3/V7-INV-3) and `screens.scene_energy` (`low`/`medium`/`high`).
- `scripts.scenes` (JSON) gains three optional `Scene` fields (RD-104): `panel_id: int?`, `provisional_timestamp_ms: int?`, `scene_energy: str?`. Same `Scene` model for every niche.
- `raw_items.manga_source_document_id` (FK, nullable) - **code-only addition (migration `b4506e9001ce`)**: lets scriptwriting find the panel list without re-hashing PDF bytes.
- `fair_use_assessments`: origin discriminator widened to `("asset_candidate","source_document")`, new nullable `manga_source_document_id` FK, new CHECK `(origin != 'source_document') OR (manga_source_document_id IS NOT NULL)` (RD-98). SQLite cannot `ADD CONSTRAINT`, so the migration uses `batch_alter_table(copy_from=<explicit pre-image>)` because reflected CHECKs are unreliable.
- `screen_types` seed row `manga_panel_composition` (`category=template_driven`, backing component `manga-panel-composition`, elements `background_layer` / `foreground_layer`, `manifest.max_animation_duration_ms=0`). It has **no** `aspect_ratio_variants` (see [vertical-recap.md](vertical-recap.md)).
- `sources` seed row `feed_url="document-upload://manga_recap"`, `active=False` (RD-108; V7-INV-10): the ingestion scheduler only polls `active=True`, so this row is a pure FK anchor.
- `llm_task_routing` stage `panel-parser`, vision-required (`supports_vision`); `google_ai_studio` flipped to `supports_vision=True`; seeded prompt is a hardcoded constant, not a prompt-registry row (otherwise `assert set(PROMPT_SEEDS_V1)==set(PROMPT_TARGET_STAGES)` fails at import). **SPEC vs CODE:** the code also has a `manga-suggestions` routing stage for the suggestion call; the spec only said "a single stateless LLM call".
- Niche row `manga_recap` (archetype `deep-dive`): `strategy_bundle = {scoring_rubric: null, source_discovery_method: "user_provided_document", real_entity_sensitivity_level: "low", component_set: ["manga-panel-composition"], rendering_mode: "cis", rendering_mode_locked: true, production_mode: "manual", editorial_constraints: <expressive voice + "ground every beat in what its linked panel shows, never invent plot, dialogue or internal states">}`, `pacing_profile = {voice_delivery_mode: "expressive_narrative"}`. `rendering_mode_locked` (RD-109) makes `change_rendering_mode` raise `RenderingModeLockedError`.
  **SPEC vs CODE:** the spec never seeded `production_mode`; the integration pass added `"manual"` so the NLE export branch is reachable for real uploads. The spec's V7-REQ-8.1 automatic path still exists and an operator may flip a project to automatic.

Migration chain: `f65845d66207` -> `8647c41abcd5` (tables, screens columns, fair-use widening) -> `b4506e9001ce` (`raw_items` link) -> `f607149a9268` (`parse_error`). Vertical recap's columns (`screen_types.aspect_ratio_variants`, `projects.derived_from_project_id`) come from the **v8** migration `b8f3d2a91c47`.

## 3. Pipeline step chain and the two branched advancers

CIS chain (V5-REQ-2.1, V6-INV-8): `ingestion_match`(pre-completed) -> `scoring`(pre-completed for this niche) -> `scriptwriting` -> `editor_critique` ->
`fact_check` -> **Gate 1** -> `asset_curation`(auto-completes) -> fork `{tts, screen_generation}` -> `alignment` -> `subtitle_export` ->
`screen_timestamp_insertion` -> `screen_validation` -> `transition_authoring` -> `transition_validation` -> `render` -> **Gate 2** (automatic only) -> `metadata`.

Exactly two advancers are niche-conditional; the step list itself is untouched:

1. `advance_asset_curation`: `if niche.key == "manga_recap"` complete immediately, **ahead of** the `production_mode` dispatch (RD-110, V7-INV-6). Reason: v6 manual mode would otherwise block forever waiting for a human `finalize_asset_curation` that this niche never uses and has nothing to curate (zero third-party assets; all imagery is panels).
2. `advance_render`: `if manga_recap and production_mode == "manual"` -> `_export_nle_package` (no `render_jobs` row ever, V7-INV-8; see [composition-transitions-export.md](composition-transitions-export.md)).

Other niche-conditional *content* (not steps): scriptwriter prompt appends the panel list; `_assemble_ground_truth` swaps in panel dialogue + visual description; `advance_screen_generation` short-circuits to a deterministic, zero-LLM build of `manga_panel_composition` screens; `author_transitions` uses the same-page test.
V7-REQ-8.7: none of v6's *human* manual-mode surfaces (asset curation, script co-authoring, manual screen authoring, timestamp assignment, phase-targeted revision) is used for this niche, in either mode. Gate 1 remains a human gate (`approve_script`) in both modes - verified in the integration test.
v11/v12 follow-ups: reverts of a `manga_recap` project to `scriptwriting` / `screen_generation` are rejected (`_reject_unsafe_niche_reverts`, V11-INV-7) because they cannot regenerate over produced panels/screens.

Status mapping: `recompute_project_status` check 7 (`_nle_export_awaiting_acknowledgment`) reports `awaiting_review` after a completed manual export until `acknowledge_nle_export`. An integration-pass fix also stops checks 2/3/4 (manual-mode awaiting scriptwriting / curation / screen authoring) from firing for this niche.

## 4. Ingestion spine (RD-102) - why a fake RawItem exists

`projects.raw_item_id` is the join spine at least ten call sites use to get from a project to its niche, routing and script (`control.py`, `steps.py`, `tick.py`, `fact_check`, `scriptwriter`, `editor`, `cue_validator` ...). Making it nullable would silently no-op reverse lookups and hard-raise forward ones (`InvalidStepStatusError("Scored item not found")`). So per verified document the engine synthesises:

- one `RawItem`: `source_id` = the inactive upload source, `url`/`dedup_hash` = fingerprint `manga-upload://<sha256 of PDF bytes>`, `content` = `"Manga recap source: <title>, <N> pages, rights_basis=<basis>"`, `status="new"`, `manga_source_document_id` set;
- the project via v4's unmodified `_create_project`;
- one `ScoredItem`: `selected=True`, `tie_break_needed=False`, `score_run_*` / `rationale_*` = NULL (an honest "no scoring happened", not a fake score);
- `scoring` step set `completed` with output `"auto-completed: manga_recap bypasses scoring/ideation (v7 addendum)"`.

Dedup is **byte-exact only**: `find_duplicate` on the fingerprint; a re-scan, re-export or different edition of the same chapter is a new document. `DuplicateMangaUploadError` is raised inside parse and therefore lands in `parse_error`, not as an upload-time rejection. A recap channel needs its own series/chapter-range ledger ([operations-agent-as-llm.md](operations-agent-as-llm.md)).

## 5. State machines

Document: `pending_review` --(owned|licensed|public_domain_cc: synchronous, same request)--> `verified` --> parse. `pending_review` --(fair_use_candidate)--> stays `pending_review` until the linked assessment resolves: approve -> `verified` + parse; reject -> `rejected`, **never parsed, no fallback source** (V7-REQ-2.5). Parsing is inline in the request and best-effort inside a SAVEPOINT: a failure rolls back that attempt's partial panels but leaves the document `verified` with `parse_error` set; **no retry path exists** (stated in the `_trigger_parsing` docstring, `manga_documents.py`).
Fair-use assessment: `pending` -> `approved` | `rejected`, one-way; only `pending` is decidable (`InvalidFairUseTransitionError`); approval needs all four memos non-empty (`IncompleteFairUseMemoError`). Rejection `notes` live only in `notifications_log` (no notes column).
Render step output (manual): `{"kind":"nle_export","export_path":"...","acknowledged":false}` -> `acknowledged:true` via the acknowledge endpoint.

## 6. Invariants (V7-INV-1..10) and where to keep enforcing them

| ID | Invariant | If you rebuild this without the engine |
|---|---|---|
| 1 | `fair_use_candidate` documents are never parsed while the assessment is `pending`/`rejected` | `RIGHTS.json.status` must be `verified` before any `panels/` exists |
| 2 | every call site resolving a project via raw/scored item finds a real row | n/a without a DB |
| 3 | `panel_id` is not unique across screens | a panel may be revisited; never assume 1:1 |
| 4 | no two screens' narration overlaps | sequential per-scene TTS concatenation (`audio/concat.py`, `INTER_SCENE_GAP_SECONDS = 0.200`) |
| 5 | `provisional_timestamp_ms` is never read by timestamp resolution | real times come only from alignment |
| 6 | `asset_curation` never blocks this niche | n/a |
| 7 | Tier F unresolved => no export (`generate_build_json` chokepoint) | rights gate before panels exist (stronger) |
| 8 | no `render_jobs` row for a manual-mode project | a manual package is not a render |
| 9 | a finished manual export is never silently "active" | keep an explicit "package reviewed" flag |
| 10 | the upload source row is never polled | n/a |

Resolved decisions to remember (v7 design §11): RD-102 synthetic RawItem/ScoredItem; RD-103 `subject_match_passed` forced True for documents; RD-104 extend `Scene` rather than a parallel schema; RD-105 export re-uses `generate_build_json` + Remotion stills (so the Tier F block covers it); RD-106 export acknowledgment is the 7th `recompute_project_status` check; RD-107 PyMuPDF + vision model instead of bespoke CV panel detection; RD-108 inactive source row; RD-109 `rendering_mode_locked`; RD-110 `asset_curation` ahead of the mode dispatch.

## 7. HTTP surface and storage (code)

`POST /manga/documents` (multipart `pdf`, `rights_basis`, `license_reference?`, `verification_note?`; 201; 400 on invalid basis / missing reference / missing note), `GET /manga/documents[?status=&rights_basis=]`, `GET /manga/documents/{id}`; fair-use approve/reject endpoints (shared with v5); `POST /synthesis/suggest-manga-series` (`{hint?}` -> `{suggestions:[{title,description}]}`; 503 routing not configured, 502 schema validation exhausted); `GET /nle-export`, `GET /nle-export/{project_id}`, `POST /projects/{project_id}/acknowledge-export`; files served by `GET /media/{path}`.
Storage under `DATA_DIR` (env override, default `engine/data`): `manga_uploads/`, `manga_panels/`, `manga_scratch/`, `nle_export/project_<id>/`.

`SPEC vs CODE`: export directory is `nle_export` in code, `nle_exports` in design §4.1; the acknowledge route is `/projects/{id}/acknowledge-export` in code and design §9.5 but `/projects/{id}/export/acknowledge` in tasks V7.10; consoles are `console/app/manga-uploads/page.tsx` (upload + fair-use queue on one page) and `console/app/nle-export/{page,[projectId]/page}.tsx`, not the designed `manga/upload` and `projects/[id]/export` routes.
