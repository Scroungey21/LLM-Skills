---
name: context-handoff
description: Writes a work-state handoff (HANDOFF.md + handoff.json) so another conversation, Claude account or AI can continue the same work. It covers what the work is, the user's standing rules, the style followed, tools and environment, which skills were used for what, the directory map, progress in the current phase, running jobs, next steps, open questions and traps, all checked against the files on disk. Use it when the user asks to "hand off", "export context", "write a handoff", "continue this in a new chat / another account", "brief a teammate" or "save where we are". Do not run or offer it just because a conversation is long or a context reminder appears. Offer it once only when the user says they are about to switch accounts or chats, or run out of usage.
---

# Context Handoff (work-state edition, v2)

A handoff exists so the next session can **continue the work correctly without the original conversation**.
That means a curated, verified *state of the work*, not a replay of every turn. The receiver should be able to
read it in a few minutes, run the "verify state" commands, and do the next step.

## Why v1 raised false alarms (and what v2 does instead)

| v1 behaviour | Effect | v2 rule |
|---|---|---|
| Offered itself on every long conversation or `long_conversation_reminder` | Nagging; offers when nothing was at risk (hosts that auto-compact keep working) | Never offer on length alone. Offer **once** only on a concrete signal (section 1). |
| Declared earlier turns "not recoverable" because they had left the context window | Scary, usually wrong: the work lives on disk and many hosts keep a transcript file | Check the real sources first (section 3). Report a gap only for a **specific fact** you looked for and could not find. |
| Made a verbatim turn-by-turn transcript the main output | Huge, slow to load, buries the decisions; the receiver re-derives state from chatter | The main output is a curated state document. A transcript appendix is optional. |
| Copied in-context claims ("render running", "file written") as fact | The receiver acts on stale state | Verify every state claim with a cheap check, and mark what was not verified. |
| Assumed the receiver has the same skills, memory and tools | The new account fails on missing skills | List every skill used, where it lives on disk and what it is for. The doc must be self-contained. |

## 1. When to run, when to offer

- **Run** when the user asks for a handoff, export, "continue elsewhere", a teammate brief or similar.
- **Offer once** (one line, then drop it) only when the user says they are about to switch chat, account or
  model, are almost out of usage, or are leaving the work for someone else.
- **Never** offer because of message count, length, or a system "long conversation" reminder. Never repeat a
  declined offer.

## 2. Ask nothing you can find

Work out the purpose from the request: continue the same work (default), onboard a teammate, or share with a
team. Pick the output folder yourself: the project root the receiver will open, not a temp folder. Ask only if
there is genuinely no project folder.

## 3. Gather from real sources, best first

1. **Live state on disk:** project files, logs, ledgers, git status/log, output folders, running processes
   (`tasklist`/`ps`), background-job output files.
2. **Transcript files**, when the host keeps them:
   - Claude Code: `~/.claude/projects/<project-slug>/<session-id>.jsonl` (grep it; it is large).
   - Other hosts: whatever export or transcript the user can point to.
3. **Compaction summaries** and what is still in context.
4. **Memory files** (`MEMORY.md` + entries) and project instructions (`CLAUDE.md`, `SKILL.md` files).

Use a lower source only when a higher one does not have the fact. When sources disagree, the disk wins, and the
handoff says so.

## 4. Verify before writing

For every state claim, run the cheapest check that proves it, then write the result:
- *done*: the file exists or the log line is present;
- *running*: the process is in the process list or the log is still growing;
- *failed*: the error line;
- *not verified*: say why.

Never write "running" or "complete" from memory alone. Paths in the document must exist; test them.

## 5. Write `HANDOFF.md` with these sections, in this order

Use the template in `references/schema.md`. Skip a section only when it truly does not apply, and write
"none" rather than dropping it silently.

0. **Read this first:** instructions for the receiver:
   - verify state before acting (point to section 9);
   - settled items are closed, open items are open;
   - where the full history is;
   - which skills to install or read.
1. **What the work is:** goal, audience, deliverables, in a few lines.
2. **Standing rules:** everything the user insisted on, in their words where possible, grouped. These are
   settled: the receiver must not re-ask them.
3. **Style followed:** output style (format, tone, length, visuals) and how to work with this user (update
   cadence, what they want asked vs decided, reporting honesty).
4. **Environment and tools:** machine/OS, absolute paths of programs and venvs, CLIs, services, hardware limits,
   and which assistant tools were used (and which were unavailable).
5. **Skills used and for what:** a table of skill → purpose → where it lives on disk. Note that a new account
   will not have them installed, and how to get them.
6. **Directory map:** a tree of the relevant folders with one-line purposes.
7. **How to run it:** the exact commands for each stage, copy-pasteable.
8. **Progress:**
   - finished earlier phases (one line each);
   - a **current-phase status table**, one row per work item with a column per stage;
   - notes per item: what exists, what was fixed, what is known to be wrong.
9. **Running jobs and how to check state:** what was running at writing time and the commands to verify it now.
10. **Next steps:** ordered and concrete, the first one runnable immediately.
11. **Open questions:** decisions that belong to the user, each with the context needed to ask it well.
12. **Changes made to tools, skills or shared code this session:** so the receiver knows they exist.
13. **Where the full history is:** transcript paths, research files, logs.
14. **Traps and lessons:** mistakes already made and fixed, so they are not repeated.

Keep it curated: facts, decisions, paths, commands. No chatter, no play-by-play. Typically 150–400 lines.

## 6. Write `handoff.json`

This is the machine-readable twin (schema v2 in `references/schema.md`): `paths`, `settled_rules`, `skills`,
`phase`, per-item status with `next`, `open_questions`, `do_not_reopen`, `verify_first` commands. It must agree
with HANDOFF.md. If they diverge later, the receiver checks the disk.

## 7. Privacy and safety

- No secrets: API keys, tokens, passwords, cookies. Redact any you find and say how many.
- Personal data (email, phone, address) only if the user asked for it to be included. Usernames inside paths
  are fine.
- Do not paste large copyrighted text; point to the file.

## 8. Optional transcript appendix (only on request)

If the user explicitly wants a verbatim record, add `transcript.md` built from the on-disk transcript file:
user prompts verbatim, assistant answers, tool calls summarised. Follow the appendix grammar in
`references/schema.md`. Never let it replace the state document.

## 9. Check, then deliver

Before delivering:
- every path tested;
- every "running" or "done" verified or marked *not verified*;
- the first next step runnable;
- open questions phrased as decisions;
- no secrets;
- the skills table complete.

Then give the user the two files (and `scripts/package_handoff.py <folder>` to zip them, plus any small
referenced files the receiver cannot reach). Tell them in one or two lines what to paste or attach in the new
conversation: "attach HANDOFF.md and handoff.json and say 'continue from this handoff'". The receiving side is
the `context-resume` skill.
