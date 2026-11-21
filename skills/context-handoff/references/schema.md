# Handoff format v2 (work-state)

Two files written in the project root the receiver will open: `HANDOFF.md` (for reading) and `handoff.json`
(for tools). The optional `transcript.md` is added only when the user asks for a verbatim record.

## `HANDOFF.md` template

```
# HANDOFF — <project>, <phase in a few words>

Written <date> by <assistant/host> for <purpose: continuing in another conversation/account | onboarding | team share>.
Machine-readable twin: handoff.json. If they disagree, check the disk and trust the disk.

## 0. Read this first (instructions for the receiving AI)
1. Verify before you trust: run section 9's commands; compare with section 8.
2. Settled items (sections 2–3) are closed; open items (section 11) are open — ask them early.
3. Full history: <transcript path(s)> — use only for details this file lacks.
4. Skills to read/install first: <list with paths>.
5. <how to talk to this user, one line>

## 1. What the work is
## 2. Standing rules (settled)
## 3. Style followed
## 4. Environment and tools            (table: thing | where/how)
## 5. Skills used and for what         (table: skill | used for | location)
## 6. Directory map                    (code block tree, one-line purposes)
## 7. How to run it                    (numbered stages with exact commands)
## 8. Progress
   - Earlier phases (one line each, with result)
   - Current phase status table (item | stage columns | ✓ / running / – / failed)
   - Per-item notes (exists / fixed / known wrong / watch out)
## 9. Running jobs + how to check state (code block of commands)
## 10. Next steps (ordered; #1 runnable now)
## 11. Open questions for the user
## 12. Changes made to tools/skills/shared code this session
## 13. Where the full history is
## 14. Traps and lessons
```

Writing rules:
- Every state word is verified: ✓ done, *running*, *failed*, or *not verified* with a reason.
- Absolute paths for anything outside the project root. Relative paths inside it.
- Use the user's own words for their rules when you have them.
- "none" instead of an omitted section.

## `handoff.json` schema (v2)

```json
{
  "handoff_version": 2,
  "kind": "work-state",
  "project": "string",
  "written_at": "YYYY-MM-DD",
  "written_by": "string (host, session id if known)",
  "human_doc": "HANDOFF.md",
  "purpose": "continuation | onboarding | team-share",
  "verify_first": ["shell commands that show the current state"],
  "paths": {"name": "absolute or project-relative path"},
  "settled_rules": ["string"],
  "style": ["string"],
  "tools": {"name": "path or how to call"},
  "skills": {"skill name (location)": "what it was used for"},
  "phase": "string",
  "items": [
    {"id": "string", "done": ["stage"], "state": "string", "next": "string", "notes": "string (optional)"}
  ],
  "running_at_handoff": ["string"],
  "next_steps": ["string"],
  "open_questions": ["string"],
  "do_not_reopen": ["string"],
  "traps": ["string"],
  "history": {"transcript": "path", "other": ["path"]},
  "redactions": 0
}
```

The `items` key may be named after the domain (for example `videos`). The receiver treats any array of
`{id|slug, done, state, next}` objects as items.

## Optional `transcript.md` (only on request)

Build it from the on-disk transcript, not from memory:

```
### Turn n
**User:** <verbatim>
**Assistant:** <final answer text>
- tools: <name — one-line summary>; ...
- files: <path written/read>; ...
```

Mark any turn whose content you could not read as `(not in available sources)`. This is a specific note, not a
blanket warning.
