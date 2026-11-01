# Approval workflow, review dashboard and session hand-off protocol

Source: `approval/service.py`, `approval/dashboard.py`, `youtube/publisher.py`, `database/models.py`, tests, and the continuation skill's `handoff-protocol.md`, `SKILL.md`.

Contents: 1 What "approval-gated" means - 2 Review state machine - 3 The dashboard - 4 Gates between approval and upload - 5 Defects found in the archived approval code -
6 Where Claude's own review sits - 7 Hand-off protocol for a new session or harness - 8 Conflict precedence

## 1. What "approval-gated" means here

Nothing becomes upload-ready until a human has persisted an explicit decision AND the rights gate agrees. The design principles (README, SF-D7, SF-D11):
- A missed review **never auto-approves**; unfilled next-day slots stay empty; the factory never lowers thresholds to hit a quota.
- Approval is **editorial**; rights are a separate gate. Approving a `permission_pending` edit must not make it publishable.
- The human reviews privately (local dashboard bound to 127.0.0.1); publishing is external and disabled by default (`youtube_upload_enabled: false`).
- Every item that reaches review has already passed dedupe, safety, rights-for-editing, quality, routing and render QA, so the human sees only candidates.

## 2. Review state machine (`ReviewState`, `approval.service.decide`)

```
PENDING_REVIEW --APPROVED--> APPROVED --(rights eligible)--> publishable -> enqueue (idempotent)
        |------REJECTED----> REJECTED                (clip -> REJECTED)
        '--REVISION_REQUIRED-> REVISION_REQUIRED     (clip -> QA_FAILED: the clip is re-picked by the next `process`)
```
`decide(session, item_type, item_id, decision, reason)` accepts only these three values and item types `short` | `compilation`. It sets the item's `review_state`, maps the clip state
(`APPROVED`->`APPROVED`, `REJECTED`->`REJECTED`, `REVISION_REQUIRED`->`QA_FAILED`), and upserts a `review_decisions` row (unique per item). Re-deciding overwrites; the history is the
latest value only (no audit trail of earlier decisions - keep your own log if you need one).

## 3. The review dashboard (`shortsfactory review`, FastAPI on 127.0.0.1:8765)

- `/` lists `PENDING_REVIEW` and `REVISION_REQUIRED` Shorts (ordered by channel, slot) and compilations. Each card: channel display name + title, the video player (`/media/<type>/<id>`,
  served only if the file resolves INSIDE `output_dir` - path-traversal guard), the on-screen commentary, description, **source link + creator, rights status**, scheduled slot, QA JSON,
  and three buttons: APPROVE, REJECT, EDIT / REGENERATE (`REVISION_REQUIRED`).
- Header button `APPROVE ALL REMAINING` approves every `PENDING_REVIEW` short and compilation in one click.
- On APPROVE the handler also calls `YouTubePublisher.enqueue`, which creates a `queued` publication row with an idempotency key
  (`sha256(item_type:item_id:video_path)`) - or returns the existing one - but only when `ready_for_upload` is true.

Review checklist for the human or for Claude reviewing frames first: text readable and inside the frame; the claim is true to the footage (`supporting_evidence`); punchline preserved
(memes); no foreign watermark/burned-in joke; rights status and credit visible; not the same source as another card (check `source-files.json`); the channel fit is the clearest value for a viewer.
"APPROVE ALL" is a bulk shortcut that skips per-item looks: use it only after watching the batch, per channel and day, never as the default.

## 4. Gates between approval and upload

1. `ready_for_upload` (approval persisted AND eligible rights; compilation: all members eligible).
2. `enqueue` raises `PublicationGateError("explicit persisted approval is required before upload")` otherwise (tests: rejected item; approved-but-`unknown`-rights item; idempotent double enqueue returns the same row).
3. `upload` re-checks `ready_for_upload` ("approval was removed before upload"), refuses an item with `attempt_count > 0` or status `uploading`/`ambiguous` (inspect YouTube first - an
   unknown remote outcome is never retried automatically), and verifies the authenticated channel ID equals the configured `youtube_channel_id` before sending bytes.
4. `youtube_upload_enabled` must be true for the CLI to drain the queue at all; a `data/youtube.paused` file halts publication (`youtube pause|resume`).
Details and API specifics: `youtube-upload-and-analytics.md`.

## 5. Defects found by reading the archived approval code (not exercised by tests; verify after restoring)

- **A1. Approving an unknown-rights item through the dashboard rolls the decision back.** `make_decision` and `approve_all` call `decide(...)` then `YouTubePublisher.enqueue(...)` inside one
  `db.session()`; `enqueue` raises `PublicationGateError` for a `permission_pending` clip, the context manager rolls back, so the approval is NOT saved and (for approve-all) one pending item can
  abort the whole batch with a 500. That contradicts "approval is editorial; rights are separate" (README, standards). Fix: call `enqueue` only when `ready_for_upload`, and record the approval anyway;
  surface "approved - permission pending" in the UI.
- **A2. The revision loop does not update its record.** `REVISION_REQUIRED` re-queues the clip (`QA_FAILED`), but a re-render creates new numbered files while the existing `GeneratedShort` row
  (unique per clip) and its `review_state` are not refreshed. Reset the row (paths, copy, `PENDING_REVIEW`) when regenerating.
- **A3. Dashboard has no authentication** and binds localhost by default; do not change `review_host` to a LAN address without adding access control.
- **A4. Approving a compilation** also needs every member clip eligible; the dashboard does not show per-member rights.

## 6. Where Claude's own review sits (agent-as-LLM-layer)

Two distinct reviews, do not conflate them:
1. **Pre-render judgement** (`llm-layer-method.md`): analysis, safety, fit, copy - Claude writes JSON, code gates.
2. **Pre-approval look** (this file): Claude opens a rendered card/MP4 (frames at start, middle, end; the text block; the credit), runs the checklist above, and recommends APPROVE / REJECT /
   REVISION with a reason. **Claude does not press approve on behalf of the owner unless the owner asked it to**; the approval is the owner's gate (agent-principles section 5: publishing/uploading is a
   human step). Report honestly what you could not check (you cannot hear the audio).

## 7. Hand-off protocol for a new session or harness (from `handoff-protocol.md`, mapped to this skill)

Receiving side, in order:
1. Read `SUBSKILL.md`, `current-state.md`, `decision-log.md` completely before proposing work.
2. Resolve the real project root (env `SHORTSFACTORY_ROOT`, else the ancestor of the skill containing `pyproject.toml` + `src/shortsfactory`) and run the verification script
   (`operations-and-verification.md`). After restoring from the tag there is no `.venv` yet: build it first.
3. Check `git status` and the relevant source files; existing user changes outrank stale prose.
4. State the requested outcome, what is implemented, and the smallest safe next step.
5. Do NOT, unless asked or required: redo the nine preview examples, rename channels, replace the profile photos, scan the intake folder, set up OAuth, or install the large TTS/model
   dependencies. Treat harness-provider work as pending until tests prove it exists.

Before handing off again, update (in this skill: `current-state.md`, `decision-log.md`, the relevant contract reference): exact files changed; tests and media QA run with results; any destructive
media action and its audit path; outputs created and their rights/publishability state; unresolved mismatches or missing dependencies; the next recommended action.
Never copy API keys, OAuth tokens, `.env`, private cookies, model caches, the SQLite DB, intake media or rendered videos into a hand-off; link them by configured path and say whether they were inspected.

## 8. Conflict precedence (verbatim order, handoff-protocol.md)

1. Current explicit user instruction. 2. Safety and rights invariants. 3. Current executable code/tests and config. 4. `decision-log.md` (later entry wins). 5. Other reference prose.
If code conflicts with a later user decision, report the gap and implement it when authorised; do not reinterpret the old code as intended behaviour.
