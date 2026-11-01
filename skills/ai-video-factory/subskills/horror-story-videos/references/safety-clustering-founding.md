# Safety gate, clustering, selection and "founding"

Contents: 1 The stage chain and who does each stage · 2 Content-safety gate · 3 Second-stage policy screen (NEW) · 4 Clustering · 5 Selection (human choice + checklist) ·
6 Founding: what it really is · 7 Canon/continuity options (NEW) · 8 Hand-off packet formats · 9 Console browser rules

Labels: **[A]** archived design/code, **[N]** new guidance, **[R]** repo research. "Agent" = Claude performing the stage itself (the archived engine called a routed model;
see `../../../references/agent-principles.md` §1 - do not build model-API backends).

## 1. The stage chain [A]

`ingest (sources, fetch_kind)` -> `story_sources row` -> **`content-safety` (block)** -> `story-clustering` (on demand or scheduled, outside the tick loop) -> **human picks exactly 3 from
one cluster** -> `found_horror_project` (3-into-1) -> the normal CIS pipeline (scriptwriting ... render, see [script-and-narration.md](script-and-narration.md)).

Only two stages are LLM judgments here: safety and clustering. Both were separate **routed stages** (`content-safety`, `story-clustering`, default provider, never the omp orchestrator,
RD-112). The orchestration spec (omp.sh) contributes one method lesson only: *deep, slow work (scripting, critique, fact-check) stays on the main reviewing model; only parallel, bulk
fan-out work (many screens, asset search) is worth delegating* (V8-REQ-2.2, RD-112). For this skill that means: Claude does safety, clustering, scripting and review personally; bulk
per-screen work is deterministic anyway (section 6 of [visuals-audio-captions.md](visuals-audio-captions.md)).

## 2. Content-safety gate [A]

Purpose: a **block, not a flag reviewed after the fact** (V8-REQ-4.4, V8-INV-2). A rejected story: `raw_items.status="rejected"` (the existing "dropped for policy" status, no new value) and
`story_sources.safety_filter_status="rejected"`, written in the same transaction; it never appears in a cluster or any selection surface; a rejected NEW story does not even get a project
(`test_ingest_rejected_story_creates_no_project`). Status values: `pending` -> `passed` | `rejected`.

**What it screens (exactly three categories - verbatim from `CONTENT_SAFETY_PROMPT_V1`):**

1. `hate_speech` - demeans, dehumanises or incites hatred on a protected characteristic, as opposed to an in-story antagonist used for narrative purposes.
2. `real_person_targeting` - names, doxxes or directs harassment/threats at an identifiable real person (full name, specific address, employer or other identifying detail), as opposed to a
   fictional or anonymised figure.
3. `fiction_crossing_into_genuine_harm` - stops functioning as fiction: genuine incitement, a threat, an instructional guide for real-world violence/self-harm, or a credible claim of an actual ongoing crime.

**What must pass:** ordinary horror - fictional violence, gore, supernatural threats, unsettling scenarios, invented characters suffering invented fates. "Screen for real-world harm, NOT for
being scary, disturbing, graphic or violent in the ordinary way horror fiction is expected to be."

**Output schema** (`ContentSafetyVerdict`, `synthesis/schemas.py`): `{"passed": bool, "reasoning": "<a few story-specific sentences>", "flagged_categories": ["hate_speech"|"real_person_targeting"|"fiction_crossing_into_genuine_harm", ...]}`
(`flagged_categories` empty when passed). Strict JSON, nothing before or after.

Decisions and reasons:
- Not `fact_check()` and not `fair_use_assessments` (RD-119, V8-REQ-4.6): fact-check needs a `script_id` that does not exist at ingestion; fair-use weighs permitted *use* of a specific
  work. The source document's phrase "third repurposing of fact-check" was corrected: same *pattern* (LLM verdict that gates progression), not the same function.
- A rejected story is not recoverable through the UI; if good stories keep being rejected, fix the prompt, do not re-queue items (console docs `niches.ts`).
- `real_entity_sensitivity_level="high"` is set on the niche (strategy bundle) so downstream fact-check/script stages treat real entities strictly.

## 3. Second-stage policy screen (NEW [N])

The archived gate **deliberately passes** gore and graphic violence, and does not look at several things that decide whether a video survives YouTube review. Add a second agent screen
before Gate 1 on the *blended draft* (not only on raw stories), recording `policy_screen.json`:

| Check | Fail/rewrite when | Why |
|---|---|---|
| Self-harm / suicide | Method detail, encouragement, or a glamorised depiction; or a story whose payoff *is* a method | Community Guidelines + age-restriction/limited-ads exposure ([policy-risk-register.md](policy-risk-register.md) R2) |
| Minors | A minor in a sexual context (hard fail, drop the story); a minor as victim of graphic harm (rewrite or drop) | Child-safety policy; also "made for kids" confusion (R5) |
| Sexual violence | Depiction beyond a non-explicit reference | Advertiser suitability, age restriction |
| Real events / real people | A real crime, victim, missing person or tragedy presented as the story | Defamation, harassment; "true story" claims (R7) |
| Identifying detail | Any real name, address, plate, workplace, small-town specifics (especially r/LetsNotMeet) | Privacy (see sourcing §4) |
| Instructional content | Reproducible harm steps | Same as category 3 above |

A story failing a hard check is dropped; a soft failure is rewritten out, never "implied". Do not weaken this to keep a story.

## 4. Clustering [A]

`cluster_pending_stories(session, niche_id, target_cluster_size=6)` (`synthesis/story_clustering.py`, V8-REQ-5.1): one LLM call per run over every `raw_items` row of the niche whose
`story_sources.safety_filter_status == "passed"` and `story_cluster_id IS NULL`. Output `StoryClusteringOutput`: `{"clusters": [{"theme_label": str, "member_raw_item_ids": [int,...]}]}` with
`clusters` min length 1 and each group min 1 member (`StoryClusterGroup`).

Prompt (essence of `STORY_CLUSTERING_PROMPT_V1`): group stories sharing a strong common theme, premise, setting or type of horror (examples: "home invasion", "cursed object", "missing
persons", "cosmic horror") - "a grouping a human could pick 3 from to blend into one cohesive narrated story"; every id appears in exactly one group, never omitted/duplicated/invented; short
descriptive `theme_label`; strict JSON.

Rules that are code, not prose:
- **~6 stories per cluster** is a prompt-side hint (`target_cluster_size`), not a schema constraint ("aim for roughly 6 where the material naturally supports it - an uneven split is fine").
- **Defensive id handling:** drop any returned id outside the eligible set (hallucinated/stale) and skip any group left empty (`test_cluster_pending_stories_drops_hallucinated_ids`). Never trust the
  model's echo. A fixed-agent equivalent: after Claude writes `clusters.json`, a validator rejects unknown ids, duplicates across clusters and omitted ids.
- **Idempotent:** the `story_cluster_id IS NULL` filter means assigned stories are never shown again; a second run over the same data creates zero clusters.
- **Never clusters non-passed stories** (`test_cluster_pending_stories_excludes_non_passed_statuses`; V8-INV-2).
- Not part of `pipeline_steps`: it is pre-project, niche-wide work (same positioning as v7's `suggest_manga_series`).

## 5. Selection: a human picks 3, nothing is scored [A] + checklist [N]

- **No per-story ranking exists** (V8-REQ-5.7: `scoring_rubric` is `null` and never read). The archived selection was a person choosing **exactly 3 stories from the same cluster**; spanning two
  clusters is rejected (V8-REQ-5.2). Do not present a numeric score as archived design.
- Console (`horror-clusters/page.tsx`): cards per cluster, member title + excerpt (HTML stripped, truncated, `content_excerpt`) + platform + subreddit/board + safety pill; checkboxes capped at
  3 per cluster; "Found Project" enabled only at exactly 3; disabled when fewer than 3 stories are selectable.
- **Agent checklist for choosing the trio [N]** (a judgement aid, not a score): (1) all three `publishable` in the rights state machine; (2) one *shared dread mechanism* (not just a shared
  setting): what the protagonist cannot verify, what they cannot escape, what is wrong with a familiar place or person; (3) three *different* escalation shapes or settings so the blend has range,
  not three copies; (4) at least one story with a concrete, checkable detail the narrator can use to refute the rational explanation (see script §3); (5) none already spent
  (`already_founded`); (6) a premise not covered by the last N published videos (novelty ledger, same "reject, never relax" rule as other channels, `../../../references/qa-gates.md` §2); (7) passes
  the section 3 policy screen after blending, not only before.

## 6. Founding: what it actually is [A]

"Horror founding" in the code is **3-into-1 project creation**, not canon or continuity logic. `found_horror_project(session, raw_item_ids)` (`synthesis/horror_founding.py`, V8-REQ-5.2/5.3):

1. Validate (`HorrorSelectionError`, HTTP 400): exactly 3 ids; 3 *distinct* ids; each has a `story_sources` row; all share one **non-null** `story_cluster_id`; all
   `safety_filter_status == "passed"` (defensive re-check: "the actual point of no return").
2. Fingerprint `horror-blend://<sorted ids joined by "-">`; `find_duplicate(... url=fingerprint, title="Horror blend")`; not NEW -> `DuplicateHorrorSelectionError` (HTTP 409).
3. Create one composite `RawItem` (`niche_id` horror, `fuzzy_title="Horror blend: <theme_label>"`, `url`=fingerprint, `dedup_hash`=hash(fingerprint), `status="new"`) whose **`content` is the
   three full story texts joined with `"\n\n---\n\n"`**. (Contradiction: V8-REQ-5.3 says "a short summary referencing all three"; the code stores the full texts, and the scriptwriter prompt relies
   on that, so the code governs. The spec's "short summary" was never implemented.)
4. `_create_project(session, composite)` (v4's function; it returns **None**, so the design snippet `project = _create_project(...)` is stale and the code re-queries by `raw_item_id`).
5. Create one `ScoredItem(selected=True, tie_break_needed=False, score_run_*/rationale_* = None)` - needed because `projects.raw_item_id` is `unique, not null` with 10+ dependent call sites
   (v7 RD-102 extended to a 3-into-1 case, V8-REQ-5.3, V8-INV-1).
6. Write exactly 3 `HorrorStorySelection(project_id, raw_item_id)` rows - the permanent composition record (V8-REQ-5.4).
7. Mark the `scoring` pipeline step `completed` with output `auto-completed: horror_stories bypasses scoring (v8 addendum)`.

`horror_stories` projects are always `rendering_mode="cis"` and the niche is `rendering_mode_locked=True` (no legacy-scene option, ever; V8-REQ-4.1, RD-109). `production_mode` defaults to automatic.

Ingestion loose end [A, unresolved]: `_ingest_entry` also calls `_create_project` for every NEW **safety-passed** story (only rejected ones are skipped), while `found_horror_project`'s docstring says
individually ingested stories never get their own project. The code shows no guard, so per-story "orphan" projects probably exist next to founded ones; unverified without running the app. If the
engine is restored, check and suppress them. A file-based channel has no such problem.

## 7. Canon / continuity options (NEW [N] - nothing in the archive)

The archive has no series bible, recurring-character or "canon" concept. The word "founding" only means the three founding stories. If a channel wants continuity (a recurring location, narrator persona,
"cases" in one universe), add it deliberately as **your own** layer: a `series_bible.md` (narrator persona, tone rules, banned tropes, recurring places), a `continuity_ledger.json` (facts established
in published videos so later ones cannot contradict them), and a rule that continuity elements are **original** (never lifted from a permissioned story). Keep the narrator persona human-authored and
honest (no fabricated creator persona, report-05 guardrail: "no manufactured personas or stock creator avatars").

## 8. Hand-off packet formats (Claude as the LLM layer) [N]

Write each stage as files; code validates and gates; Claude writes the decision file:

| Stage | Packet (code writes) | Decision file (Claude writes) | Validator rejects |
|---|---|---|---|
| Safety | `safety.request.md`: story text + the three categories + "ordinary horror passes" | `safety.json` = `ContentSafetyVerdict` | missing keys; unknown category; `passed:true` with non-empty categories; `passed:false` with empty |
| Policy screen | `policy.request.md`: blended draft + section 3 table | `policy_screen.json` (one verdict per check) | any check missing |
| Clustering | `cluster.request.md`: all passed unclustered stories as `raw_item_id=<n>:` blocks | `clusters.json` = `StoryClusteringOutput` | unknown/duplicate/omitted ids, empty cluster |
| Trio choice | `trio.request.md`: one cluster + checklist section 5 | `trio.json` `{cluster_id, story_ids:[3], reasons}` | not exactly 3, mixed cluster, non-publishable rights state, already founded |

## 9. Console browser rules worth keeping [A]

`GET /horror-clusters` returns clusters (newest first) with members and per-member `already_founded` computed from `horror_story_selections` in one query; a cluster with fewer than 3
selectable (passed and not-yet-spent) stories shows an "Insufficient selectable stories" banner and selection is disabled. The failure this prevents: the operator only discovering a reused trio from the
409 after clicking. Regression-tested in `test_v8_18_story_cluster_browser.py`.
