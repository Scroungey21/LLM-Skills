# Start a stickman channel now, with Claude as the LLM layer

Contents: 1 What you can do today · 2 Decisions before video 1 · 3 The file-handoff loop · 4 The minimum tooling to write · 5 Worked example (pigeon head-bob, 45 s) and what was machine-checked · 6 Simulator core · 7 First-video checklist · 8 Smallest vertical slice for rendering · 9 Honest limits

Sources: Report §29 (validation experiment), §32 (A-to-Z), Blueprints 6-8, 17; Handoff; [agent-principles §1](../../../references/agent-principles.md); [new-channel-playbook](../../../references/new-channel-playbook.md).

## 1. What you can do today

Everything that is *authorship* works now: Claude writes the evidence packet, the script, the beat file and the storyboard JSON against the shipped schema; a validator and a verifier subagent gate each file; narration (dots.tts/VoiceStudio) and ffmpeg exist. What does **not** exist: the stickman rig renderer, the asset registry and the continuity engine as code ([toolkit-mapping](toolkit-mapping.md)). So the first deliverable is a *validated storyboard + animatic*, then the smallest vertical slice of rendering (§8). Do not start by building the whole `vf` CLI.

## 2. Decisions before video 1 (the SUBSKILL's ten, expanded)

Write each answer into the new channel's own docs (`<channel>/docs/RULES.md` style, per the playbook): profile; niche/lane; channel folder + ownership; house style `local_default` (measured fields stay `null`); cast (observer + animal rigs + prop kit; faceless or not); one narration voice and its licence; length and cadence (a max-hold, a visual-change rule); generative images yes/no (default no); evidence rigour and the claim-ledger fields; the human gates and who they are. Also fix: coordinate units and the world-state path convention ([storyboard-schema §1, §9](storyboard-schema.md)); the `dependency_graph` edge direction ([project-state-and-resume §5](project-state-and-resume.md)); the stage names.

## 3. The file-handoff loop (no model APIs)

Each LLM-shaped stage follows the E871 pattern ([agent-principles §1](../../../references/agent-principles.md); [clip-card agent-review](../../clip-card-shorts/references/agent-review-and-captions.md)):
1. Code (or you) writes a **packet**: `request.json` {task, acceptance criteria, artifact paths + hashes, schema path} plus the inputs (beats, ledger, asset index, contact sheets).
2. Claude (main thread or a fresh verifier subagent that sees only the packet) writes the answer **as a file**: `storyboard.json`, `evidence_packet.json`, `qa/<gate>.json`.
3. A deterministic validator ingests it: schema, id resolution, continuity simulation. Invalid -> the file waits for a fix (no silent repair). Valid -> state advances, hashes recorded.
4. Verifiers are given artifact + spec only, never the producer's chain of thought; they return violations with rule id, JSON path, evidence, repair.
5. Re-running resumes after the answer file appears. Human gates (idea, script, animatic, final) pause the loop until the owner answers.

## 4. The minimum tooling to write first (all small, all deterministic)

1. **validate**: JSON-Schema check of `storyboard.json` and `state.json` against the shipped schemas. `jsonschema` was not found in the venvs checked; either install it in a channel-local venv (an owner-approved step) or reuse the stdlib subset checker described in §5.
2. **cross-ref + timeline check**: ids resolve, windows contiguous, beats covered once ([storyboard-schema §8](storyboard-schema.md)).
3. **simulate-continuity**: §6 core.
4. **hash/invalidate/resume**: sha256 of artifacts; the §5 algorithm of [project-state-and-resume](project-state-and-resume.md).
5. **frame QA helpers**: ffmpeg contact sheet, luma/freeze checks ([rendering §5, §9](../../../references/rendering.md)).
Put them in `<channel>/tools/`; do not import from other channels.

## 5. Worked example: the pigeon head-bob validation (Report §29)

Why this topic: original to the report (not the studied channel), fact-checkable, and its mechanism needs exactly the three capabilities a sentence-to-image system lacks - **sub-entity state** (head and body move independently), **world-space constraints** ("the head stays still" is relative to the location, not the body sprite) and an **insert/return stack** (§29.10).
Files: [schemas/example-pigeon-storyboard.json](schemas/example-pigeon-storyboard.json) (3 entities, 2 locations, 8 assets, 7 shots covering 0-45 s) and [schemas/example-project-state.json](schemas/example-project-state.json).
Claims used (from Report §29.2; **not re-verified by this subskill** - verify against the cited papers before any publication use): `pigeon_c1` walking pigeons alternate a hold phase with a rapid forward thrust (Troje & Frost, *J. Exp. Biol.*, 2000, "Head-bobbing in pigeons: how stable is the hold phase?"), `pigeon_c2` during much of the hold the head is nearly stationary in space while the body advances (same), `pigeon_c3` head stabilisation contributes to stable visual input and vision plus other sensory feedback participates (Troje & Frost 2000; Theunissen & Troje 2017) - `SYNTHESIS`.
Beat/shot plan (Report §29.3-29.4): sh_01 hook `NEW_SCENARIO` (sidewalk, pigeon walking, observer) -> sh_02 question `MUTATE_SCENARIO` (observer points) -> sh_03 mechanism `CAMERA_CUT` (close crop, `LOCK_X` on `pigeon_01.head` in `WORLD` space) -> sh_04 `MUTATE_SCENARIO` (head thrust, accent SFX synced to the event) -> sh_05 `INSERT_EXPLAINER` (retina/stability diagram, sequential `MASK_REVEAL`, music duck) -> sh_06 `OVERLAY_ONLY` (sensory icons) -> sh_07 `CALLBACK` (restore sidewalk, repeat hold/thrust once, silence beat). Zero ComfyUI by design.
**What was machine-checked (2026-11-01, this subskill's authoring):**
- The storyboard validates against the shipped storyboard schema and the state example against the state schema, using an **ad-hoc stdlib subset validator** (type/enum/const/required/additionalProperties/min-max/pattern/items/`$ref`) - **not** a full Draft 2020-12 implementation and not the `jsonschema` package. A deliberately broken copy (bad enum, illegal key `state_patches`, missing required field, fps 5) failed with four errors, so the checker bites.
- A small simulator (§6) applied the 7 shots' patches in order: preconditions held, shot windows were contiguous (0-45 s), events inside windows, beats covered once, all ids/assets/locations resolved. It does **not** prove renderability, motion plausibility or factual correctness.
- Not machine-checked: rig/pose assets (they do not exist), the normalized 0..1 coordinate convention, any rendered frame.
Reading hints: `entities[].default_state.visible = false` then `state_patch` turns the cast on in sh_01; `allow_discontinuity_reason` documents the insert and the return; `layers[].source_id` for assets and `animation_events[].target_id` for a layer (`l_diag`) are PROPOSED conventions ([storyboard-schema §5](storyboard-schema.md)).

## 6. Simulator core (≈30 lines of the idea; Report §21.8-21.11, Blueprint 8)

```python
world = {"entities": {e["entity_id"]: dict(e["default_state"]) for e in sb["entities"]}}
def get(path):                       # "/entities/observer_01/pose_id"
    cur = world
    for p in path.strip("/").split("/"):
        if not isinstance(cur, dict) or p not in cur: return None, False
        cur = cur[p]
    return cur, True
def put(path, val):
    *head, last = path.strip("/").split("/"); cur = world
    for p in head: cur = cur[p]
    cur[last] = val                  # ADD/REPLACE; REMOVE -> cur.pop(last)
OPS = {"EQ": lambda a, b: a == b, "NEQ": lambda a, b: a != b, "LTE": lambda a, b: a <= b, "GTE": lambda a, b: a >= b,
       "IN": lambda a, b: a in b, "NOT_IN": lambda a, b: a not in b}
for shot in sb["shots"]:                          # time order; push/pop snapshots around INSERT_EXPLAINER
    for pc in shot["continuity"]["preconditions"]:
        v, ok = get(pc["path"])
        passed = ok if pc["operator"] == "EXISTS" else (not ok if pc["operator"] == "NOT_EXISTS" else ok and OPS[pc["operator"]](v, pc.get("value")))
        if not passed and pc.get("severity", "ERROR") == "ERROR": raise SystemExit(f'{shot["shot_id"]}: {pc["assertion_id"]} failed')
    for p in shot["continuity"]["state_patch"]: put(p["path"], p.get("value"))
```
Add: attachment ownership (one holder per prop), teleport (position jump without a `POSITION` event or scene change), facing flips, insert return restore, `must_persist_entity_ids`. Make the returned errors machine-readable (`rule_id`, `path`, `evidence`, `repair`).

## 7. First-video checklist (Report §32 A-to-Z condensed)

Discover (idea + probe) -> Research (sources, claims, contradictions, title qualification, independent verification, packet `VERIFIED`) -> Write (angle, cold scenario, ladder, counterexample, callback, script gate) -> Plan the world (beats, entities, locations, operations, camera, patches, claim links, asset deps, simulate, animatic, approve) -> Build assets (search/reuse/modify/vector; ComfyUI only if adopted) -> Audio and timing (narrate, align, retime, music/SFX, mix plan) -> Render (compile, segments dirty-only, edit plan, mix, captions if any, assemble) -> QA (technical, continuity recheck, visual-semantic, audio; repair only failed pieces) -> Package (titles from the verified premise, thumbnails, gate, human pick) -> Owner approval and upload -> Learn (pattern-level). Full gate list: [qa-gates-and-repair](qa-gates-and-repair.md).

## 8. Smallest vertical slice for rendering

Build, in this order, inside your channel folder: (1) an SVG stickman + pigeon rig as Remotion components with named joints/anchors and a pose table (3-5 poses) - deterministic, seeded jitter optional ([characters §11](characters-assets-continuity.md)); (2) a layer compositor that reads the storyboard shot (layers, camera, animation events, constraints); (3) frame-sequence render -> ffmpeg ([rendering §2, §5](../../../references/rendering.md)); (4) narration + alignment + retime; (5) dirty-only re-render keyed by shot hash. Target = Definition-of-done item 9: the pigeon video end to end with no diffusion ([qa-gates-and-repair §8](qa-gates-and-repair.md)). Only then consider ComfyUI, ladder profiles or analytics.

## 9. Honest limits
The example proves the *contract* is coherent, not that the format retains viewers: no style measurement, no retention data, no rendered frames, no human review exists. Treat the first 3-5 videos as experiments; keep the report's lesson that the target channel itself tests formats and then exploits what works (Report §4.4).
