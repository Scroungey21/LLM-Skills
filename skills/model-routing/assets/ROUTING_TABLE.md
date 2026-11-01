# Agent models (routing table)

<!-- Copy this section into the project's CLAUDE.md / AGENTS.md (or keep it as MODEL_ROUTING.md).
     Delete the rows the project doesn't need, add its own, and record the user's answer and the date.
     Tiers: "top" = the strongest family available (e.g. Opus), "mid" = the balanced family (e.g. Sonnet),
     "light" = the fastest, cheapest family (e.g. Haiku). Efforts: low, medium, high, xhigh, max. -->

Decided by the user on <DATE>: "<their words>". A per-job instruction from the user wins over this table.

| Task type | What it covers | Model, effort |
|---|---|---|
| Architecture and hard code | New systems, tricky bugs, concurrency, networking, performance work | top, high |
| Creative asset creation | 3D models, animation, environments, shaders, art and audio pipelines | top, xhigh |
| Deep review, and its fix | The one full review of a finished build, and the fix round after it | top, medium |
| Planning and design concepts | Plans, specs, concept docs for the user to discuss | top, medium |
| Routine code | Small features, mechanical edits, refactors with clear rules, test writing | mid, high |
| Testing and documenting | Running a feature, recording evidence, documenting it before the conclusion or fix | mid, high |
| Verification and visual checks | Re-checking a fix, reading screenshots, confirming numbers | mid, high |
| Research and discovery | Web research, code search, checking research material against the code | mid, high |
| Writing and editing docs | Handoffs, READMEs, changelogs, summaries | mid, medium |
| Shell, fetching and monitoring | Running scripts, downloads, polling logs, file housekeeping | mid, medium |
| Trivial lookups | One-file reads, formatting, counting | light, low |

Waiting and polling (long tests, logs, downloads) use no agent: a background shell or a monitor tool.

Escalation: <e.g. "Claude may step a struggling stage up one tier on its own and says so in the report" / "ask first">.

## Generic default (when the user says "you pick")

The table above as written. It spends the top tier only on work where a weaker result costs more than the tokens saved: new systems, creative assets, and the single review that guards a release.

## Example: a real game project (for illustration only)

A Godot multiplayer game's author set this on 2026-11-01 ("never waste tokens on pointless opus usage"):

| Task | Model, effort |
|---|---|
| Complex code issue, or a 3D build | Opus, high |
| Creating an animation, a 3D model or an environment | Opus, xhigh |
| Deep technical review, or the fix that follows it | Opus, medium |
| Simple verification, or a visual check | Sonnet, high |
| Research, discovery, or checking research material against the code | Sonnet, high |
| Testing and documenting a feature before the conclusion or fix | Sonnet, high |
| PowerShell, fetching from the computer or web, monitoring | Sonnet, medium |

They also overrode it for one job ("the skill update agents are to be sonnet5.5 on medium, not opus"), which is why per-job instructions win.
