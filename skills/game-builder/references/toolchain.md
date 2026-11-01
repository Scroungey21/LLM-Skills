# Toolchain: index and verdict rules

Read at the toolchain phase. Dated **October 2026**: versions, stars and prices drift within months, so verify against the official source and record what you installed in `_project/TOOLCHAIN.md`. Agents read `TOOLCHAIN.md` afterwards, not these files.

| File | Contents |
|---|---|
| `tools-godot.md` | Godot 4.7.x: editor MCPs, skills per phase, voice, GUT, release |
| `tools-unity.md` | Unity 6.3 LTS: MCPs, skills, netcode options, voice, test framework |
| `tools-unreal.md` | Unreal 5.8: MCPs, Blueprint-or-C++, replication, Automation |
| `tools-general.md` | Blender (headless first, MCP optional), asset sources, skill catalogues, agent lists, generators, rejected tools |
| `engines.md` | Engine choice by needs and how the standard maps onto each engine |
| `agents.md` | The custom agent roster (copied to `.claude/agents/` by the scaffold) |

## Vetting test (every tool must pass all four)
1. Maintained recently and widely used.
2. Licence and cost compatible with the budget and licence floor the user set.
3. Works with the pinned engine version.
4. Removes more work than it adds (the simplicity rule applies to tools too).

## Rules for adopting tools
- **One editor-control MCP per engine** (two editor servers conflict). Add at most one runtime or inspection tool beside it. No MCP at all still works: scripts run the engine headless.
- **Pin versions** (engine, MCP tag, addon release). Never a floating `main` or `latest` for something the game depends on. Record the version you actually installed.
- **Skills never override this standard's structure rules**; they supply engine API detail.
- Third-party services (relay, voice, VPN, lobby) need their **free-tier limits and terms recorded** in `TOOLCHAIN.md`; anything paid needs the user's approval.
- Anything marked **verify** must be checked against current official docs before it is relied on.
- A tool that executes arbitrary code (a Blender or editor MCP) runs with the user's permissions: save first, keep telemetry off, prefer headless scripts for repeatable work.
- Record the QA tool set (gate runner, detectors, perf driver) in `TOOLCHAIN.md` as well; `quality-gates.md` lists the gates they serve.
- Re-check dates when you reuse a toolchain from an older project.

## Engine choice
See `engines.md` section 1. It is an expensive-to-reverse decision: ask, explain the trade-off in the user's terms, log it.
