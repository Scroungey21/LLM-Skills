# Production modes, gating and revert (v4 / v6 / v11 as method)

Three independent control axes grew in the archived engine. Keep them separate when running a niche by hand:

| Axis | Values | Question it answers | Spec |
|---|---|---|---|
| `rendering_mode` | `legacy_scene` / `cis` | *How are visuals made?* (fixed component per video vs per-beat screens) | v5 |
| `production_mode` | `automatic` / `manual` | *Who does the creative work?* (AI drafts vs the human co-authors) | v6 |
| `gating_mode` | `stepwise` / `auto` | *Does every step wait for human approval before its successor starts?* | v11 |

All four rendering x production combinations are valid (V6-REQ-1.4); `gating_mode` is orthogonal to both. Mixing them up was a real source of confusion: the v11 owner's complaint ("the model consumes way too many tokens by parallelising and automating way too many things and always gets stuck at scriptwriting and QA") was answered with *gating*, not with `manual` mode, because `manual` removes the AI generation the owner still wanted and deadlocks `manga_recap` (V11 background).

Contents: 1 Claude's role per mode - 2 Automatic mode - 3 Manual mode (v6) - 4 Stepwise gating (v11) - 5 Revert - 6 Safety exemptions - 7 Strategy bundles and theme selection as method (v4) - 8 Operating a niche by hand: the minimum

## 1. Claude's role per mode

- **Automatic:** Claude drafts every LLM stage (packets, `stage-methods-and-schemas.md`); the human appears only at the gates (idea selection, Gate 1, Gate 2, fair-use, any `high`-sensitivity sign-off).
- **Manual:** the *human* writes the script and/or screens; Claude is reviewer - critique + fact-check on the human's exact text, asset shortlist, validation warnings. Claude never silently rewrites human-authored content (V6-REQ-4.2).
- **Stepwise gating (recommended default for new hand-run niches):** Claude runs one step, stops, shows the output, and waits for "approve" or "send back" before running the next. This is the cheap, granular, trackable mode the owner asked for.

## 2. Automatic mode

- Default for every niche except `manga_recap`. Background orchestration ticks (every 15 s in the engine) advance any step whose predecessors are complete. For Claude: advance step N+1 only after the artifact of step N is written and schema-valid.
- **Shared ideation gate (V6-REQ-2.1..2.5):** scoring agreement alone never selects; a human must explicitly select an idea (agreement or not, above the floor or not). Candidates not picked stay ranked in the queue; none expire.
- **Screens list (cis, automatic; V6-REQ-3.x):** every screen has a status (`ok`/`flagged`/`replaced`) and two per-screen actions, each requiring a free-text instruction:
  **Replace** (full regeneration, may change the screen type/asset) and **Tweak** (keep type and core intent, apply the instruction). Only the targeted screen is regenerated; every action is appended to that screen's edit history (never overwritten); a regenerated screen stays `authored_by="ai"`.
- **Self-repair loop:** AI-authored screens that fail manifest bounds go through the bounded repair loop (2 attempts); on exhaustion fall back to the nearest template-driven type - an unrendered animation cannot ship.

## 3. Manual mode (v6)

**Script co-authoring (V6-REQ-4.x)** - applies to every manual project:

1. The human writes scene-by-scene, starting from nothing (no AI draft required).
2. On "submit for review" run editor-critique **and** fact-check on that exact draft and show both together as one discussion round. Unbounded rounds.
3. Finalising the script *is* Gate 1 approval for it (no second gate), **but** approval is refused unless a fact-check pass exists for the exact scene content (hash of the content recorded at the discussion; any later edit invalidates it -> re-run discussion).
4. Flagged claims always surface in the discussion - never withheld because the author is human.

**Asset fetching & curation (V6-REQ-5.x):** Claude fetches a shortlist from the Tier 0-2 asset library; the human keeps/discards each; a free-text *research steer hint* redirects the next search and is logged with a timestamp (never discarded); kept assets are available to both AI generation and the manual builder. v6 OQ6-2 resolved conservatively: builder pulls from the curated shortlist only.

**Screen authoring (cis, V6-REQ-6.x):** schema-driven form per screen type (fields from the type's manifest), no LLM involved in the content; individual screens may be built by hand or delegated to AI in any mix. `authored_by` (`human|ai`) is recorded but **never gates any downstream step**.
Validation parity: manual screens are checked against the *same* manifest bounds. When a human-authored screen fails, do **not** auto-repair - show an editable warning naming the exact bound(s); AI screens still auto-repair.

**Screen-to-timestamp assignment (V6-REQ-7.x):** the human may place any subset of screens; the rest fill automatically from the same alignment matching; every manual placement is validated against real WhisperX word timings. Two conflict classes are flagged (never silently accepted): (a) two manual ranges overlap; (b) a range whose aligned words do not correspond to what is spoken there. A flagged screen is not "timestamped" until the human adjusts or accepts a suggested correction.

**Phase-targeted revision (V6-REQ-8.x):** exactly four independently reopenable phases - **Script**, **Asset Fetching**, **Screens**, **Screen Matching & Subtitling** (timestamps + SRT/VTT). Status per phase: `draft | approved | needs_revision | stale`, computed from the existing step rows (no parallel execution model).
Reopening re-runs only that phase; downstream items made invalid by the revision (e.g. a removed narration beat) are flagged `needs_review`, consistent items are not. When all phases are satisfactory the project rejoins the shared tail (render, Gate 2, metadata, manual upload). For `manual + legacy_scene` only the Script phase exists.

**Publish metadata (all modes; V6-REQ-9.x):** AI proposes several candidate titles - human picks/edits; one static description template configured once (channel intro, links, disclaimers); per video an AI-written addition (summary, source citations, timestamps); composed = template + addition, human edits; **nothing auto-publishes** - the human uploads.

## 4. Stepwise gating (v11)

- **Definition:** with `gating_mode = stepwise`, *every* step pauses for human approval after it completes, before its successor is dispatched. `auto` = no implicit pausing.
- **Default:** `stepwise` for every new project (ingestion, horror founding, manga upload); `auto` for derived vertical-recap projects (re-render of already-approved content). Existing in-flight projects were migrated to `auto` so nothing already running was retroactively frozen.
- **Mechanism (do not reinvent it as a stateless predicate):** when any step becomes `completed` on a stepwise project, set *that step's own* `pause_after_completion = true`, reusing the existing edge-triggered pause machinery. A stateless rule ("stepwise and predecessor completed -> hold") would stay true after resume and re-pause the step forever (livelock).
  Implement it once as snapshot-then-diff around every step-advancing call: record all step statuses before, then flag **every** step that newly became `completed` - one advancer can complete several rows at once (`_backfill_synth_completed` completes scriptwriting + editor + fact_check + cue_validation together), and flagging only the dispatched step would let successors run ungated.
- Resume = approve (`POST /pipeline-steps/{id}/resume`); approval is needed at **every** boundary because the auto-flag re-fires on each fresh completion.
- Switching a running project to stepwise never interrupts an in-flight step (gating starts at its completion); `POST /projects/{id}/gating-mode` works at any pipeline position, unlike mode changes that lock at Gate 1.
- **Intake queue:** the first gate is "which fetched items get scored at all" - the `scoring` step is created `paused` for stepwise projects; a human resumes scoring per item (the ad hoc version shipped before v11 and was reconciled under it).
- **Idea selection** (after scoring) is unchanged and already satisfies "choose which to work on from the AI score and synthesis" - show score and rationale/summary together.
- **UI intent worth keeping as a checklist for any control surface:** one shared "step done - Approve -> advance | Send back" control for every paused step; errors show retry (and resume-with-prompt-override for LLM steps); external-input steps reuse the copy-prompt/paste-back flow; the board distinguishes *waiting on a step approval* from *waiting on Gate 1/Gate 2/idea/fair-use*; one unified "awaiting my action" queue naming the exact gate.
- **Agent-run equivalent:** a `run-log.md` per project listing steps, status, artifact path, and the pending approval; Claude stops after each artifact and asks. A CLI companion skill (`yttechnews-pipeline-cli`, v11 requirement 8) was specified to let `omp`/Claude Code drive the engine's HTTP API from a terminal - not needed once Claude runs the stages directly; the same actions (list awaiting, inspect timeline, approve/resume, revert, resolve gates) map to run-log edits.

## 5. Revert (v11 requirement 5)

"Revert to step S" resets S **and every step after it** (graph-aware for the cis fork/join) to `pending`, clearing `started_at / completed_at / output / pause_after_completion`, and invalidates the *domain artifacts* in the **same transaction** - resetting only the tracking rows is silently undone by the engine's resumability short-circuit.

| If the reverted range includes | Also do |
|---|---|
| any script stage while the script is `approved` | set script back to `draft` (reopens Gate 1; also re-unlocks mode changes) |
| editor_critique / fact_check / cue_validation but not scriptwriting | prune `version_chain` entries at/after the target stage; restore `scenes` to the surviving v1/v2 content (not for manual scripts: `scenes` is the human's own text); clear the manual fact-check hash if fact_check is reverted |
| scriptwriting | **supersede** the script row (`superseded_at`), never delete (seven tables reference it, incl. analytics and golden sets); partial-unique index on `(scored_item_id, variant) WHERE superseded_at IS NULL`; every script lookup must filter `superseded_at IS NULL` |
| screen_generation / asset_curation | mark screens and shortlist rows superseded/stale (do not delete) |
| render | mark the latest render job superseded; abandon in-progress renders |
| metadata | clear generated titles/descriptions |

Reject revert targets that are already `pending`; reject `manga_recap` reverts to scriptwriting/screen_generation. Recompute project status after revert. The whole thing is one transaction so no tick ever sees a half-reverted project.
Method equivalent: never delete files to force regeneration - write a superseding revision (`v3-superseded-<date>/`), keep old artifacts, and reset the run-log from step S downward.

## 6. Safety exemptions

- `manga_recap`: manual scripting returns "not advanced" forever by design (its scene generation has its own review points); revert to scripting/screens is refused; stepwise gating still applies.
- Derived vertical-recap projects: `gating_mode = auto`, `production_mode = automatic`, not reachable from intake/idea selection (spawned already approved from the parent; the parent must be cis and Gate-2-approved; a derived project cannot spawn another).
- `real_entity_sensitivity_level = high` niches: individual Gate-1 sign-off regardless of mode.

## 7. Strategy bundles, theme selector and LLM orchestration (v4) as method

- **Theme selector:** the per-niche filter is the primary navigation (V4-REQ-5.5) - everything (project list, run history, analytics, ideation queue) filters by niche. Run-log and ledger entries therefore always carry `niche`.
- **Strategy bundle editor:** rubric / constraints / sourcing method / sensitivity edited *without redeploy* (V4-REQ-2.5). Method: the niche brief is a file Claude re-reads each stage; edits create a new version file (section 11 of `stage-methods-and-schemas.md`).
- **Per-stage x per-niche model routing** (global default, niche override, `internal|external`, vision-capable guard, no credentials in the database, OAuth subscription reuse forbidden - V4-REQ-4.x) was infrastructure for choosing *which model* ran each stage. In this skill there is one LLM layer, so the routing table collapses to: *which stages get an independent second pass* (the scorer's two runs, an independent fact-check reviewer) and *which stage needs vision* (panel parsing for manga). Keep those two decisions per niche; do not rebuild a provider registry.
- **Pause / edit / external hand-off per step** (V4-REQ-3.x): pause never interrupts a running step; a paused step can be resumed as is, resumed with an edited assembled prompt, or switched to external (copy prompt out, paste result back, validate with the identical schema check). Notifications for pause/hand-off are intentionally silent (operator-initiated); notify only on tie-break, gates, fact-check flags, render events.
- **Project page = audit log** (V4-REQ-5.6): reopening a finished project replays every step, prompt and output - the run-log plus kept version files are that record.
- Impact that mattered: `projects` row per item resolved `new`; `pipeline_steps` pre-created for the whole chain at creation (so the full chain is visible from the start); `strategy_bundle` added without touching Phase 1 tables (additive migrations only).

## 8. Operating a niche by hand: the minimum

1. Niche brief file (template in `define-a-new-niche.md`) + the channel's `run-log`.
2. Per candidate: dedup against the ledger -> score twice -> human selects.
3. Stepwise: script v1 -> editor v2 -> fact-check report -> (correction) -> **Gate 1** -> audio -> alignment/captions -> screens or components -> render -> QA -> **Gate 2** -> package/schedule.
4. At each arrow, Claude stops unless the user said to chain steps for this turn. Gates are never auto-approved.
