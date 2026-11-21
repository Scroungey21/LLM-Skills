---
name: context-resume
description: Loads a handoff made by the context-handoff skill (HANDOFF.md + handoff.json, a *-handoff.zip, or an older handoff.md/handoff.json transcript export) at the start of a new conversation, checks it against the real files on disk, and continues the work. Use when the user attaches or points to such files, or says "resume", "continue from this handoff", "load this context" or "here's where we left off". Run it before any other work in that conversation.
---

# Context Resume (v2, matches context-handoff v2)

The receiving side of `context-handoff`. Load the handoff, **check it against reality**, confirm in a few lines,
then continue as if the history were your own.

## 1. Find and read

- Unzip a `*-handoff.zip` first if given.
- **v2 (work-state):** `HANDOFF.md` + `handoff.json` (`"handoff_version": 2`). Read HANDOFF.md fully; use the JSON
  for paths, commands and item lists.
- **v1 (transcript export):** `handoff.md` + `handoff.json` with `turns`. Read the preamble (settled decisions,
  open questions), then the turns. v1 coverage notes about "earlier turns not recoverable" may be outdated: check
  for a transcript file before believing them.
- Read every skill or instruction file the handoff tells you to read (for example a project `SKILL.md`) before
  touching the work.

## 2. Verify state before acting

Run the handoff's `verify_first` commands (or its "how to check state" section). For each item marked
*running* or *in progress*, find out what actually happened:
- finished: the output exists;
- died: there is an error, or the log stopped and there is no output;
- still running.

Note every difference from the handoff. **The disk wins.** Missing tools or skills on this account are listed
as blockers, with what is needed to fix them.

## 3. Respect settled vs open

- Standing rules and `do_not_reopen` items are closed: follow them, don't re-ask.
- Open questions are open: put them to the user early, with the handoff's context.

## 4. Confirm briefly, then go

Send one short message:
- what was loaded (project, phase);
- the verified state, highlighting anything that changed since the handoff (a job finished, a job failed);
- the open questions;
- the next step you will take.

Then do the next step unless the user redirects. This is a checkpoint, not a re-summary.

## Failure handling

- Malformed JSON or a missing file: say exactly what is broken and work from what is readable.
- HANDOFF.md and handoff.json disagree: check the disk; mention the difference if it matters.
- Paths that don't exist on this machine: ask where the project lives now (it may have moved), then re-check.
- No "settled"/"open" sections (a foreign or hand-written file): ask how much weight to give it rather than
  treating it as authoritative.
