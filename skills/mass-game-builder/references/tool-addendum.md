# Tool addendum (newer details; read alongside `toolchain.md`)

Dated **October 2026**. Tools change fast: re-verify before pinning, and pin results in `_project/TOOLCHAIN.md`.
Where this file and `toolchain.md` differ, prefer whichever you just verified, and record the choice in `DECISIONS.md`.
Every tool must pass the vetting test in `toolchain.md` and fit the budget and licence floor the user set.

## Contents
1. Engine version
2. Godot MCP options
3. Blender: headless first, MCP optional
4. Asset generators (Tripo and similar)
5. QA tools are part of the toolchain
6. Claude Code notes

## 1. Engine version
Godot 4.7.x is the current line at the time of writing (check godotengine.org for the exact stable build; `tools-godot.md` may lag). Pin one version per project; do not change it mid-project without asking. Godot is MIT licensed, free.
Scenes (`.tscn`) and scripts (`.gd`) are plain text, so the agent can edit them directly without any MCP.
Use the console executable for command-line runs: it waits for the process and forwards exit codes. Bound every run with a timeout.

## 2. Godot MCP options
| Server | Notes | Cost |
|---|---|---|
| `Coding-Solo/godot-mcp` | Default in `toolchain.md`: launch editor, run project, debug output, scene tools, screenshot of the running game | free |
| godot-forge | Adds GDScript language-server diagnostics, project analysis, tests, viewport screenshot | free |
| Claude-GoDot-MCP | Editor control with screenshot feedback and input simulation | free |
| Godot MCP Pro | About 175 tools; premium | paid: needs the user's approval and a logged exception |
Use one editor-control MCP at a time. In Claude Code use `/mcp` to confirm what is actually connected. A server that edits saved scenes may not see the scene currently open in the editor; confirm which one it uses. A returned screenshot does not prove desktop control.
No MCP is required: headless engine runs from scripts cover import, boot, tests and checkers. Keep the editor closed while agents import, since the editor does not honour the project import lock (`quality-gates.md`).

## 3. Blender: headless first, MCP optional
Repeatable work (model generation, exports, UV and palette assignment, renders for lineups) belongs in committed scripts run with `blender --background --python script.py -- args`, so anyone can regenerate every model. An MCP is for exploration, not for the pipeline.
The PyPI package `blender-mcp` is now `mcp-for-blender`; new installs should use the new name (verify).
```
claude mcp add blender uvx mcp-for-blender
uvx mcp-for-blender install-addon        # then enable the add-on in Blender: Edit > Preferences > Add-ons
```
In Blender press N in the 3D viewport, open the MCP tab, click Start MCP Server. Blender must be open with the server running before the agent connects; run only ONE MCP client at a time. Minimum Blender version differs between sources: check the project README.
Honest limits: scripted modelling produces simple forms quickly and organic detail slowly. Say so when the user's art direction asks for more, and offer: a CC0 pack that fits their anchors, hand-made assets from the user, or a generator (section 4). The modelling rules that prevent clipping at the source are in `clipping.md` section 2.
Its built-in generation services (Hunyuan3D, Tripo, Rodin) are not part of the default pipeline.

## 4. Asset generators (Tripo and similar): off by default
They tend to produce meshes with unknown provenance, uneven topology, baked lighting and a look that clashes with the anchors, and they usually need paid credits. Use only if the user asks, as a logged exception, and treat the output like any downloaded asset (`assets.md`, `release-and-legal.md`: check the terms for commercial use).
If they do: Tripo (3.1 line) turns an image, or best a multi-view set, into a mesh. Settings that matter: a light-mesh option if the user wants low triangle counts, quad topology if the model will be rigged, then retopology, auto-rig, preset animations, export GLB or FBX.
Then bring it to the standard: match the anchors in `ART_DIRECTION.md` (re-colour or re-texture to the user's finish policy), check triangle and texture budgets the user set, run the clip and lineup gates, log the terms and credits spent in `CREDITS.md`.
Free alternative first: CC0 packs (Kenney, Quaternius, KayKit, Poly Haven), if one fits the user's look.

## 5. QA tools are part of the toolchain
Write the gate runner, detectors, perf driver and audio scripts into `TOOLCHAIN.md` beside the engine and MCPs. They live under `tools/`, are never autoloads, and are excluded from export. See `quality-gates.md` for what each gate needs, `clipping.md` for the detector design, `audio.md` for the processing script.

## 6. Claude Code notes
- Pro plans work but long builds hit usage limits fast; heavy builders use a larger plan.
- Commit to git after every step that works so a bad step can be rolled back (commit or push only when the user asks).
- Skills live in `~/.claude/skills/<skill-name>/SKILL.md`.
- Write the handoff before a session ends: `agent-process.md` section 4.
