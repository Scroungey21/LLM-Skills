# Data model, state machines and the archived implementation

Contents: 1 What exists and where · 2 Restoring it · 3 Tables · 4 State machines · 5 Endpoints · 6 The `horror_stories` niche seed · 7 omp.sh orchestration: what it was and what to keep ·
8 Status and verification record · 9 File-based equivalent for a new channel (NEW)

Labels: **[A]** archived, **[N]** new. Spec ids: `V8-REQ-*` (requirements), `RD-*`/`V8-INV-*` (design.md). The v8 spec files live in `.kiro/specs/v8-addendum/` (requirements, design, tasks, VERIFICATION_REPORT) - that directory is
gitignored and **is not in the `pre-skill-reduction` tag** (`../../../references/legacy-and-removed.md` §1); at the time of writing it is absent from the working tree. This subskill is the surviving digest of the horror, vertical-recap and
live-preview parts. Do not assume the originals can be recovered.

## 1. What exists and where

| Piece | Location in the archive (tag `pre-skill-reduction`) | Role |
|---|---|---|
| Story clustering | `engine/app/synthesis/story_clustering.py` (`cluster_pending_stories`) | one LLM call, idempotent, drops hallucinated ids |
| Founding | `engine/app/synthesis/horror_founding.py` (`found_horror_project`, `HorrorSelectionError`, `DuplicateHorrorSelectionError`) | 3-into-1 |
| Content safety | `engine/app/synthesis/content_safety.py` (`assess_story_safety`, stage `content-safety`); schema `ContentSafetyVerdict` in `synthesis/schemas.py`; prompt `CONTENT_SAFETY_PROMPT_V1` in `app/seed_prompts.py` | ingestion-time block |
| Clustering prompt/schema | `STORY_CLUSTERING_PROMPT_V1` (seed_prompts), `StoryClusteringOutput`/`StoryClusterGroup` (schemas) | |
| Vertical recap | `engine/app/synthesis/vertical_recap.py` (`spawn_vertical_recap`); branches in `app/orchestrator/steps.py` (`_advance_vertical_layout`, `advance_scriptwriting` -> `_advance_condensation`); condensation prompt in `app/synthesis/scriptwriter.py`; CTA in `app/synthesis/narration_beats.py` | |
| Ingestion | `engine/app/ingestion/service.py` (`_ingest_entry`, `_subreddit_or_board`, `_create_project`), `ingestion/fetch.py` (`_fetch_4chan_catalog`, `_strip_html`, `content_excerpt`) | |
| Screens/build | `engine/app/synthesis/screen_generator.py` (`_generate_horror_stories_screens`, `_atmosphere_narration_content`), `engine/app/render/build_json.py` (`_windowed_words`, `_expand_background_schedule`, `_build_screen_specs`) | |
| API | `engine/app/api/story_clustering.py`, `engine/app/api/horror_founding.py` | |
| Models | `engine/app/models/story_cluster.py`, `story_source.py`, `horror_story_selection.py` | |
| Migration | `engine/alembic/versions/b8f3d2a91c47_v8_addendum_omp_horror_vertical_schema.py` (revises `a71fd923b6e4`) | |
| Seeds | `engine/app/seed.py` (niche bundle, `NICHE_PACING_PROFILES`, screen types, `SCREEN_TYPE_ASPECT_RATIO_VARIANTS`), `seed_sources.py`, `seed_voice_profiles.py` | |
| Tests | `engine/tests/test_v8_6/7/8/9/10/13/14_15/18_*.py` (list in [qa-gates.md](qa-gates.md) §11) | |
| Console | `console/app/horror-clusters/page.tsx` (3-select browser), `console/app/docs/content/{niches,sources,rendering}.ts` (in-app docs for the safety filter, Horror Clusters, vertical recap, visual filters) | |
| Renderer (already bundled) | `ai-video-factory/toolkit/renderer/src/components/{AtmosphereNarration,VisualFilterOverlay,CisSequence,CisScreenRenderer,MasterSequence}.tsx`, `src/types.ts`, `src/compositions.ts`; `toolkit/manifests/atmosphere-narration.json` | usable now |
| Few-shot examples | none for horror (`few_shot_examples/` has no horror set) | |

## 2. Restoring it

```powershell
# from the repo root; extract to a scratch folder OUTSIDE the repo, never over a live tree
git archive pre-skill-reduction engine console manifests few_shot_examples packages -o $env:TEMP\legacy.zip
Expand-Archive $env:TEMP\legacy.zip C:\scratch\legacy-app      # empty destination
# single files without extracting:
git show pre-skill-reduction:engine/app/synthesis/horror_founding.py
git ls-tree -r pre-skill-reduction --name-only -- engine/tests | Select-String v8_
```

venvs, `node_modules` and `engine/data*` are not in the tag: recreate from the requirements/package files. The renderer pieces are already in `ai-video-factory/toolkit/`. Restoring the engine means taking a decision per LLM stage:
keep the routed-model call or convert to hand-off packets (`../../../references/agent-principles.md` §1 - do not extend the API pattern to new channels).

## 3. Tables [A]

```text
story_clusters(id PK, niche_id FK niches.id NOT NULL, theme_label NOT NULL, created_at tz NOT NULL)
story_sources(id PK, raw_item_id FK raw_items.id UNIQUE NOT NULL, story_cluster_id FK story_clusters.id NULL,
              source_platform NOT NULL  -- "reddit" | "4chan"
              subreddit_or_board NOT NULL, post_identifier NOT NULL, author_handle NULL,
              safety_filter_status NOT NULL default "pending"  -- "pending" | "passed" | "rejected"
              created_at tz NOT NULL)
horror_story_selections(id PK, project_id FK projects.id NOT NULL, raw_item_id FK raw_items.id NOT NULL, created_at tz NOT NULL)   -- permanent, never mutated/deleted (V8-REQ-5.4)
```

Additive columns from the same migration: `sources.fetch_kind NOT NULL DEFAULT 'rss'` (`rss` | `json_catalog`); `screen_types.aspect_ratio_variants` (nullable JSON, shape `{"9:16": {...}}`);
`projects.derived_from_project_id` (nullable self-FK); `llm_task_routing.effort_level` (omp only). New routing stages: `content-safety`, `story-clustering` (and `asset-research`), all defaulting to the normal provider.
Design reasons: sidecar tables instead of new `raw_items` columns (RD-115, V8-REQ-10.2: every other niche would carry permanently-null horror fields); `StoryCluster` as its own table so the browser can query "all stories in cluster N"
and "unclustered passed stories" as first-class indexed queries (RD-116); `raw_items.status` only says usable vs dropped, `safety_filter_status` is the finer-grained verdict (V8-REQ-4.5).

Gaps [A, absence]: no permission/licence/consent column; no `fiction_label`; no canon/continuity tables; no per-plate provenance (the asset library has `source`, `rights_tier`, `license_reference`, `attribution_text`, `verified_at`, but no playable-media path).

## 4. State machines [A]

- **Story:** ingested -> `story_sources.safety_filter_status=pending` -> `passed` (cluster-eligible) | `rejected` (`raw_items.status="rejected"`, terminal, hidden). `passed` + `story_cluster_id NULL` -> clustered -> selectable until it appears in a
  `horror_story_selections` row (then `already_founded`).
- **Raw item statuses:** `new` / duplicate outcomes / `rejected` (the existing RAW_ITEM_STATUSES; no new value was added).
- **Founded project (CIS chain, 17 steps):** `ingestion_match` (pre-completed) -> `scoring` (auto-completed at founding) -> `scriptwriting` -> `editor_critique` -> `fact_check` -> `fact_correction` -> `asset_curation` -> `tts` -> `screen_generation`
  (fork) -> `alignment` -> `subtitle_export` -> `screen_timestamp_insertion` -> `screen_validation` -> `transition_authoring` -> `transition_validation` -> `render` -> `metadata`. Gate 1 = script approval; Gate 2 = render approval
  (`render_jobs.status="approved"`). Step statuses include `pending`, `paused` (stepwise gating) and `completed`.
- **Derived (vertical) project:** same chain with `scoring` and `asset_curation` auto-completed at spawn, `production_mode=automatic`, `gating_mode=auto`.
- **Rights (NEW [N]):** `unpermissioned_public | permission_requested -> granted | denied | no_reply`, `original`, `author_submitted -> licence_signed`, `public_domain`, `cc_*` (see sourcing §3).

## 5. Endpoints [A]

| Method path | Purpose | Errors |
|---|---|---|
| `POST /synthesis/cluster-pending-stories` `{niche_id, target_cluster_size=6}` | run the clustering pass | 503 routing not configured; 502 schema validation exhausted |
| `GET /horror-clusters?niche_id=` | clusters + members + `already_founded` + excerpt | 404 niche not seeded |
| `POST /horror-clusters/found` `{raw_item_ids:[3]}` | found a project | 400 `HorrorSelectionError`; 409 `DuplicateHorrorSelectionError` |
| `POST /projects/{id}/vertical-recap` | spawn the derivative | named errors, [vertical-recap.md](vertical-recap.md) §1 |
| `GET /scripts/{script_id}/audio` | processed narration WAV for the live preview (`previewAudioUrl`) | |
| `GET /projects/{id}/build-preview` | read-only build.json for the preview (must pass `aspect_ratio`) | |

## 6. The `horror_stories` niche seed [A] (`NICHE_STRATEGY_BUNDLES["horror_stories"]`)

`scoring_rubric: None` · `editorial_constraints`: the no-AI-pitch-hook override (text in [script-and-narration.md](script-and-narration.md) §1) · `source_discovery_method: "rss_feed"` ·
`real_entity_sensitivity_level: "high"` · `component_set: ["atmosphere-narration"]` · `rendering_mode: "cis"` · `rendering_mode_locked: True` · `visual_filter: "crt_scanlines"` · `background_variety: 4000` ·
`shorts_cta_style: "link_to_full_video"`. Archetype `deep-dive` (hook_required, single_hook_only, interrupt 45 s). `NICHE_PACING_PROFILES["horror_stories"] = {"voice_delivery_mode": "slow_atmospheric"}`.
Sources seeded: `r/nosleep`, `r/LetsNotMeet`, `r/shortscarystories` RSS and `a.4cdn.org/x/catalog.json` (`json_catalog`). Screen type `atmosphere-narration` (+ `{"9:16": {"layout": "responsive"}}`).
Voice profile (do not reuse): `seed_voice_profiles.py` maps the niche to `dots-warm-informational`.

## 7. omp.sh orchestration: what it was, and the only lesson that carries over [A]

The first half of the v8 addendum registered "omp" (Oh My Pi, a scriptable terminal coding agent) as an `agentic_cli` model provider, restricted to two bulk, parallelisable stages (`screen-generator`, `asset-research`;
V8-REQ-2.2) with a headless-verification spike, per-model effort levels and assignment-time validation (V8-REQ-2.5-3.6, RD-111-114, RD-132, RD-134-136). It is **not part of the horror method** and, under the agent-is-the-LLM-layer rule,
must not be rebuilt. The method takeaways: (1) deep, slow, judgement-heavy work (scripting, editing, fact-check, safety) stays with the main reviewing model; (2) a backend that can silently produce unusable output must be
validated at assignment time *and* call time (two layers, RD-112); (3) interactive single-item actions should fail loudly rather than degrade (RD-135); (4) verify headless reliability before depending on it (V8-REQ-3.1).
Horror's own Pass 2 needs no LLM at all ([visuals-audio-captions.md](visuals-audio-captions.md) §6).

## 8. Status and verification record

[A] VERIFICATION_REPORT: all 23 tasks (V8.1-V8.23) implemented; backend suite 694/695 (the failure was a pre-existing local LM Studio port conflict); `tsc --noEmit` clean; real CLI frame renders of the atmosphere component, the filter,
vertical aspect and the combined path were inspected; a real browser session covered cluster founding, live preview and a 1080x1920 vertical preview. Real defects found and fixed during verification: Remotion version drift that silently
blocked the Player; the preview route not passing `aspect_ratio`; no guard against deriving from a derivative; no early check that a parent has a vertical-capable screen type; the missing tests for the omp guards; a test-DB pollution bug.
Known follow-ups recorded there: effort-capability fallback is dead code on the verified omp version; `manga_recap` vertical support needs a real 9:16 render before seeding a variant.
**Not verified end to end:** any real horror video (no published horror output exists in the repo); real footage in the background layer (never served, [visuals-audio-captions.md](visuals-audio-captions.md) §10); audible slow delivery;
the orphan per-story projects question ([safety-clustering-founding.md](safety-clustering-founding.md) §6). Today there is no horror channel folder, ledger or release calendar.

## 9. File-based equivalent for a new channel (NEW [N])

Use a new top-level `<channel>/` folder (ownership and creation rules: `../../../references/new-channel-playbook.md`; the repo's agent-ownership rule means no other channel agent touches it):

```text
<channel>/
  docs/RULES.md                  # the channel's settled decisions (voice, caption look, loudness target, cadence cap, fiction label wording)
  series_bible.md  continuity_ledger.json     # optional continuity layer (safety-clustering-founding §7)
  stories/<id>/source.json  story_rights.json  safety.json  policy_screen.json
  clusters.json  story_ledger.json            # cluster file (StoryClusteringOutput) + spent-story ledger
  episodes/<slug>/script.json  plates.json  screens.json  audio/  frames/  qa_report.md  provenance/  policy_snapshot/
  release-calendar/<YYYY-MM>/<DD>/<slug>/     # delivery packages (follow release-calendar.md)
```

Code validates each decision file's schema and fails closed; Claude writes the verdict files; humans approve Gate 1 and Gate 2.
