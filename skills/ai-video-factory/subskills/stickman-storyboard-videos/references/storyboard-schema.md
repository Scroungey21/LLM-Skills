# Storyboard schema (`stickman_scenario_storyboard.schema.json` v1.1.0), field by field

Contents: 1 Role and conventions · 2 Top level · 3 Entities and state · 4 Locations and assets · 5 Shot · 6 Shot sub-objects · 7 Enum meanings ·
8 Rules the schema cannot express (validator must add) · 9 World-state and patch convention (PROPOSED) · 10 Schema vs report/handoff mismatches · 11 Gaps and proposals

Source of truth: [schemas/stickman_scenario_storyboard.schema.json](schemas/stickman_scenario_storyboard.schema.json) - a **byte-exact copy** of
`git show pre-skill-reduction:Stickman/stickman_scenario_storyboard.schema.json` (Draft 2020-12, `$id` `https://local.pipeline/schemas/...`). Report §21.15: the schema is
**normative** over the report's prose, and "the renderer should refuse schema-invalid storyboards". A validated worked example is
[schemas/example-pigeon-storyboard.json](schemas/example-pigeon-storyboard.json) (7 shots, 45 s).

## 1. Role and conventions

- The storyboard is the **contract between the storyboard stage and everything downstream** (asset planner, animation compiler, audio/edit compiler, QA). Claude writes it; a validator gates it (Report §21, Blueprint 7).
- `additionalProperties: false` on every object (except `from`/`to`/`value` payloads, which are unconstrained). **Unknown keys are errors.** `default` keywords are annotations only: a validator does not insert them, so write optional-with-default fields explicitly.
- "Required but nullable" is used a lot (`"type": ["string","null"]`): the key must be present, `null` is the explicit "none".
- **Units are not defined by the schema.** `vec2` `x`,`y` are plain numbers. PROPOSED convention (matches Report §21.7 anchors like `[0.22, 0.68]`): normalized 0..1 of canvas width/height, origin top-left; `camera.center` same; `zoom` 1.0 = full canvas; `rotation_deg` clockwise degrees.
- IDs are free strings; uniqueness is the validator's job (§8). Suggested prefixes: `ent_/char_/prop_`, `loc_`, `sh_`, `ev_`, `au_`, `cn_`, `tx_`, `b_` (beats), `clm_` (claims).
- Times are seconds from video start (not per-shot). Provisional until narration is aligned, then retimed (Report §23.2).

## 2. Top level

| Field | Type / constraint | Req | Meaning and notes |
|---|---|---|---|
| `schema_version` | string, const `"1.1.0"` | yes | Any other value fails. Bump the const when forking. |
| `project_id` | string, minLength 1 | yes | Channel/series project. |
| `video_id` | string, minLength 1 | yes | Must equal the state file's `video_id`. |
| `style_profile_id` | string, minLength 1 | yes | Points to `style_profile.json` (measured fields may be null - Report §9.2). |
| `script_hash` | string, **minLength 16** | yes | Hash of the approved script. A changed hash invalidates the storyboard sections whose beat hashes changed (Report §26.4). |
| `evidence_packet_hash` | string or null | no | Hash of the verified evidence packet. |
| `canvas` | object | yes | `width` int >=320, `height` int >=180, `fps` number 12-120, `pixel_format` `rgba`\|`rgb`. Master 1920x1080 proposed (Report §9.3); fps 30 matches the toolkit. |
| `timeline` | object | yes | `duration_sec` number >0; `narration_track_id` string; `music_track_id` string\|null. |
| `entities` | array of `entity` | yes | The cast/props registry (no `minItems`; an all-diagram video may be empty). |
| `locations` | array of `location` | yes | Reusable scene graphs. |
| `assets` | array of `assetDependency`, default `[]` | no | Declared asset requirements/resolution state. A shot's `asset_dependencies` must resolve here (validator rule). |
| `shots` | array of `shot`, **minItems 1** | yes | Ordered timeline. |
| `global_audio` | object: `narration_lufs_target`, `true_peak_max_dbtp`, `music_duck_db` (all numbers, all optional) | no | Report gives defaults as engineering defaults only: true peak <= -1 dBTP, duck 12-18 dB (§13.5). Toolkit house target is -16 LUFS ([audio-captions-music](../../../references/audio-captions-music.md)). |
| `quality_contract` | object | yes | `max_unresolved_continuity_errors` int >=0, `max_missing_asset_dependencies` int >=0, `required_gate_status` `PASS`\|`PASS_WITH_WARNINGS`. Defines what "ready to render" means for this storyboard (use 0 / 0 / `PASS`). |

## 3. Entities and state

### `entity` (required: `entity_id`, `entity_type`, `canonical_asset_id`, `persistence_scope`, `default_state`)
| Field | Constraint | Meaning |
|---|---|---|
| `entity_id` | string | Stable id; resolution rules in Report §21.6 (same role/name -> same entity unless text introduces a new instance). |
| `entity_type` | enum `CHARACTER`,`ANIMAL`,`PROP`,`VEHICLE`,`UI_OBJECT`,`DIAGRAM_OBJECT`,`TEXT_OBJECT` | |
| `semantic_role` | string\|null | e.g. `subject`, `viewer_proxy`. |
| `canonical_asset_id` | string | The one identity asset (rig/silhouette). Changes only via an explicit identity-variant event (Report §10.4). |
| `persistence_scope` | enum `SHOT`,`SCENARIO`,`VIDEO`,`SERIES` | How long the identity lives. `SHOT` scope for montage examples (Report §21.6). A `SERIES` entity requires a series registry that no schema defines. |
| `identity_lock` | boolean, default true | True: pose/emotion change, appearance does not. |
| `default_state` | `entityState` | Initial world state at t=0 (usually `visible: false`, becomes visible via a patch). |
| `allowed_pose_ids` | string[], default `[]` | Pose vocabulary (ids resolve in the asset registry). |

### `entityState` (required: `visible`,`location_id`,`position`,`scale`,`rotation_deg`,`facing`,`pose_id`,`z_index`,`attachments`)
`visible` bool · `location_id` string\|null · `position` vec2 · `scale` number >0 · `rotation_deg` number · `facing` enum `LEFT`,`RIGHT`,`FRONT`,`BACK`,`THREE_QUARTER_LEFT`,`THREE_QUARTER_RIGHT`,`NA` ·
`pose_id` string\|null · `emotion_id` string\|null (optional; `null` = expressionless, Report §10.3) · `z_index` integer · `attachments` array of `{asset_id (req), anchor (req), custom_anchor (string|null)}`
with `anchor` enum `LEFT_HAND`,`RIGHT_HAND`,`HEAD`,`TORSO`,`BACK`,`CUSTOM` (use `custom_anchor` only with `CUSTOM`; the schema does not enforce that).
Rules from the report: facing is stateful (a camera cut never flips an entity, §10.4.4); a held prop is an attachment relation, and a handoff removes A's attachment before adding B's (§10.4.6); offscreen is `visible: false`, not deletion (§10.4.7).

## 4. Locations and assets

### `location` (required: `location_id`,`location_type`,`background_asset_id`,`layout_slots`)
`location_type` enum `REAL_SCENARIO`,`ABSTRACT_STAGE`,`DIAGRAM_SPACE`,`UI_SPACE`,`MONTAGE_SPACE` · `semantic_label` string (optional) · `background_asset_id` string\|null (null for diagram stages) ·
`layout_slots[]` of `{slot_id, position(vec2), facing_hint (string|null, optional)}`. Slots are anchors for entities (`left_actor`, `center_object`...), Report §21.7.

### `assetDependency` (required: `asset_id`,`asset_class`,`representation`,`strategy`,`status`)
- `asset_class`: `CHARACTER`,`POSE`,`ANIMAL`,`PROP`,`BACKGROUND`,`ICON`,`DIAGRAM`,`TEXTURE`,`THUMBNAIL_ELEMENT`,`SFX`,`MUSIC`.
- `representation`: `SVG`,`PARAMETRIC_VECTOR`,`PNG_RGBA`,`PNG_RGB`,`WEBP`,`AUDIO`,`PROCEDURAL`,`COMFY_OUTPUT`.
- `strategy`: `SEARCH_REUSE`,`REUSE_MODIFY`,`PROCEDURAL_GENERATE`,`COMFY_T2I`,`COMFY_I2I`,`COMFY_INPAINT`,`MANUAL_IMPORT` - the ladder search -> reuse -> modify -> generate (Report §19.1).
- `status`: `PLANNED`,`FOUND`,`GENERATED`,`VALIDATED`,`FAILED`. Render only when all are `VALIDATED` (Report §21.13: "block shot until required assets are approved").
- Optional nullable: `source_asset_id` (parent for derived assets), `artifact_path`, `content_hash`, `provenance_id`.

## 5. Shot (the core object)

Required (19): `shot_id`, `scenario_id`, `beat_ids` (minItems 1), `time`, `narration`, `narrative_function`, `scene_operation`, `scene_type`, `location_id`, `continuity`, `camera`, `layers`,
`animation_events`, `audio_events`, `asset_dependencies`, `generation_policy`, `retention_function`, `source_claim_ids`, `qa_assertions`.
Optional: `text_elements` (default `[]`), `confidence` (0-1, default 1), `constraints` (default `[]`).

| Field | Meaning |
|---|---|
| `scenario_id` | Diegetic-world id. Shots of one persistent world share it; an insert gets its own (example: `pigeon_insert_01`). The schema has no `scenario` object (see §11). |
| `beat_ids` | The script beats this shot covers. Every beat must appear exactly once across shots, or be marked audio-only/hold (Report §27.4). |
| `time` | `timeRange` `{start_sec >=0, end_sec >0}`. The schema does not require end > start or contiguity (§8). |
| `narration` | The narration text for the window (copy of beat text). |
| `narrative_function` | Enum (§7): the rhetorical role. |
| `scene_operation` | Enum (§7): how the world changes vs the previous shot. |
| `scene_type` | Enum (§7): the visual class. |
| `location_id` | Must resolve in `locations`. |
| `continuity` | See below. |
| `camera` | `camera` object, below. Independent state: a camera change does not reset the world (Report §21.12). |
| `layers` | Ordered draw list. |
| `animation_events` / `audio_events` / `text_elements` / `constraints` | Timed events, below. |
| `asset_dependencies` | Asset ids the shot needs (resolve in top-level `assets`). |
| `generation_policy` | How missing assets may be produced. Below. |
| `retention_function` | Enum (§7): why this shot exists for attention (`RESET_ATTENTION`, `PAYOFF`...). |
| `source_claim_ids` | Claim-ledger ids for any fact-sensitive visual; required for numbers, mechanisms, history, attributions (Report §21.14). `[]` for pure scene-setting. |
| `confidence` | Planner's confidence 0-1; low values should route to the continuity/visual verifier. |
| `qa_assertions` | Machine-checkable `assertion`s about the world or the shot, evaluated by the gate. |

### `continuity` (required: `continuity_from_shot_id`, `preconditions`, `state_patch`, `must_persist_entity_ids`; optional `allow_discontinuity_reason`)
- `continuity_from_shot_id` string\|null: `null` only for the first shot of a scenario (`NEW_SCENARIO`).
- `preconditions[]` `assertion`: what must hold in the world *before* the shot (checked by simulation).
- `state_patch[]` `statePatch`: what the shot changes *at its start* (singular name `state_patch`; the report's `state_patches`/`persist_after` are not valid keys).
- `must_persist_entity_ids[]`: entities that must still exist/have unchanged identity afterwards.
- `allow_discontinuity_reason` string\|null: the justification a `NEW_SCENARIO` or an insert needs when it discards unresolved state (Report §8.3, §21.9). PROPOSED use: also carry the insert-return note (see §11).

### Sub-objects
- **`camera`** (req `framing`,`center`,`zoom`,`rotation_deg`; opt `safe_margins_pct` 0-40, default 5): `framing` enum `EXTREME_WIDE`,`WIDE`,`MEDIUM_WIDE`,`MEDIUM`,`MEDIUM_CLOSE`,`CLOSE`,`EXTREME_CLOSE`,`TOP_DOWN`,`SPLIT`,`DIAGRAM`,`UI`. Camera motion = `CAMERA_CENTER`/`CAMERA_ZOOM` animation events.
- **`layer`** (req `layer_id`,`source_type`,`source_id`,`z_index`,`transform{position,scale>0,rotation_deg}`,`opacity` 0-1): `source_type` enum `ENTITY`,`ASSET`,`TEXT`,`SHAPE`,`MASK`,`PARTICLE_EMITTER`. PROPOSED: `ENTITY` -> `entity_id`; `ASSET` -> `asset_id`; `TEXT` -> `text_id`.
- **`animationEvent`** (req `event_id`,`target_id`,`property`,`time`,`interpolation`,`from`,`to`; opt `bezier` [4 numbers] or null, `target_component` string\|null):
  `property` enum `POSITION`,`SCALE`,`ROTATION`,`OPACITY`,`POSE`,`EMOTION`,`CAMERA_CENTER`,`CAMERA_ZOOM`,`PATH_PROGRESS`,`MASK_REVEAL`,`TEXT_REVEAL`,`SHAKE`,`DRAW_PROGRESS`;
  `interpolation` enum `STEP`,`LINEAR`,`EASE_IN`,`EASE_OUT`,`EASE_IN_OUT`,`SPRING`,`CUSTOM_BEZIER` (give `bezier` only with `CUSTOM_BEZIER`; not enforced). `target_component` addresses a sub-part (`head`, `body`) - added in 1.1 because the pigeon validation needed head/body independent (Report §29.10).
  `target_id` = an `entity_id` (or a `layer_id` for asset layers - the example does this; PROPOSED).
- **`audioEvent`** (req `event_id`,`event_type`,`start_sec`>=0,`gain_db`; opt `asset_id`,`duration_sec`>=0 or null,`sync_target_event_id`): `event_type` `SFX`,`MUSIC_CUE`,`MUSIC_DUCK`,`SILENCE_BEAT`,`NARRATION_EMPHASIS`. `sync_target_event_id` ties an SFX to an animation event so a retime moves both.
- **`text_elements[]`** (req `text_id`,`content`,`role`,`start_sec`,`end_sec`; opt `style_token`): `role` `LABEL`,`NUMBER`,`QUOTE_FRAGMENT`,`SECTION_WORD`,`CAPTION`,`WARNING`. Text is always deterministic (never baked into diffusion output; Report §9.3). A `NUMBER` must carry unit/date/denominator via its claim (§21.14); a `QUOTE_FRAGMENT` only with a verified source (§18.6).
- **`generation_policy`** (req `preferred_method`,`fallback_methods`,`seed_policy`,`max_attempts`,`cache_key_inputs`; opt `workflow_id`): methods enum `VECTOR_REUSE`,`VECTOR_PROCEDURAL`,`RASTER_REUSE`,`COMFY_T2I`,`COMFY_I2I`,`COMFY_INPAINT`,`NONE`;
  `seed_policy` `FIXED_PER_ASSET`,`FIXED_PER_ENTITY`,`ROTATE_ON_RETRY`,`NA`; `max_attempts` integer **0-8** (report budgets: Comfy 3, §28.2); `cache_key_inputs` strings naming what feeds the cache hash.
- **`componentConstraint`** (req `constraint_id`,`target_id`,`target_component` (string\|null),`kind`,`time`,`space`; opt `reference_id`,`reference_component`,`value`,`tolerance`>=0 or null):
  `kind` `LOCK_POSITION`,`LOCK_X`,`LOCK_Y`,`FOLLOW`,`LOOK_AT`,`MAINTAIN_DISTANCE`,`ATTACH`,`DETACH`; `space` `WORLD`,`LOCATION`,`SCREEN`,`PARENT`. Timed world/component constraints evaluated by the animation compiler - e.g. `LOCK_X` on `pigeon_01.head` in `WORLD` space while the body advances (Report §29.7).
- **`assertion`** (req `assertion_id`,`path` pattern `^/`,`operator`; opt `value`,`severity` `ERROR`\|`WARNING`, default `ERROR`): operators `EQ`,`NEQ`,`EXISTS`,`NOT_EXISTS`,`IN`,`NOT_IN`,`LTE`,`GTE`.
- **`statePatch`** (req `op` `ADD`\|`REPLACE`\|`REMOVE`, `path` pattern `^/`; opt `value`).

## 6. Dependencies between objects (reading order for a validator)
`shots[].location_id -> locations`; `layers[].source_id -> entities | assets`; `entities[].canonical_asset_id`, `attachments[].asset_id`, `asset_dependencies[] -> assets`;
`continuity_from_shot_id`, `sync_target_event_id` -> earlier ids; `source_claim_ids -> claim ledger`; `beat_ids -> script_beats.json`.

## 7. Enum meanings (from Report §8, §11, §21.9)

**`scene_operation`** - `NEW_SCENARIO` (location/time jump; resets world, needs `allow_discontinuity_reason` if state is discarded) · `CONTINUE_SCENARIO` (same shot continues) · `MUTATE_SCENARIO` (same actors/location, action advances) ·
`CAMERA_CUT` (framing changes only) · `INSERT_EXPLAINER` (leave reality for a diagram, then restore) · `OVERLAY_ONLY` (text/stat on the current image) · `MONTAGE` (repeated template, swapped entities) · `HOLD` (connective sentence, no new information) · `CALLBACK` (reopen an earlier scenario/asset set and reframe it).

**`scene_type`** (Report §11: purpose / composition / animation minimum)
`REAL_WORLD_SCENARIO` (1-3 actors, recognizable place, relevant prop; pose/prop/camera) · `CHARACTER_INTERACTION` (2+ actors; pose+gaze+handoff) · `OBJECT_DEMONSTRATION` (object dominant; transform/part reveal) ·
`EXPLANATORY_DIAGRAM` (nodes/arrows/labels; sequential reveal) · `CAUSE_EFFECT_CHAIN` (left-to-right chain; timed activation) · `COMPARISON_SPLIT` (matched halves, common baseline) ·
`HISTORICAL_VIGNETTE` (period cues, source-linked; new scenario) · `LOCATION_ESTABLISHER` · `BODY_MECHANISM` (cutaway; insert then return) · `RESEARCH_ATTRIBUTION` (paper card/name/year; no fake quotes) ·
`VISUAL_METAPHOR` (only if literal visualization fails; must not imply a false mechanism) · `EXCEPTION_MONTAGE` (rapid swap) · `TEXT_STAT_EMPHASIS` (sourced number + qualifier) · `REACTION` (pose/emotion punctuation) · `CALLBACK`.

**`narrative_function`** `HOOK`,`QUESTION`,`SETUP`,`MECHANISM`,`EVIDENCE`,`EXAMPLE`,`COMPARISON`,`ESCALATION`,`COUNTERPOINT`,`TWIST`,`PAYOFF`,`CALLBACK`,`CTA`,`BRIDGE` (Report §5.3 macrostructure labels map onto these).
**`retention_function`** `ORIENT`,`CURIOSITY`,`ESCALATE`,`CLARIFY`,`SURPRISE`,`HUMOR`,`RESET_ATTENTION`,`PAYOFF`,`NONE`.

## 8. Rules the schema cannot express (the validator/simulator must check - Report §27.4-27.5)

1. All ids unique; every reference in §6 resolves. 2. `end_sec > start_sec` everywhere; shot windows contiguous, non-overlapping and ending at `timeline.duration_sec`; events and text inside their shot window.
3. Every `beat_ids` entry exists; each beat covered exactly once (or declared audio-only/hold); beats in script order. 4. `shots[0]` is `NEW_SCENARIO` with `continuity_from_shot_id: null`; any other null needs a `NEW_SCENARIO`/`CALLBACK`.
5. Simulate patches in time order (§9): preconditions hold; no prop-ownership conflict; no attachment to a missing/invisible entity unless intended; no teleport without a move; no unannounced identity change; facing contradictions; an insert returns to restored state; callbacks reference valid state.
6. `must_persist_entity_ids` still valid after the shot. 7. `pose_id` values are in the entity's `allowed_pose_ids`. 8. `bezier` iff `CUSTOM_BEZIER`; `custom_anchor` iff `CUSTOM`.
9. Fact-sensitive shots (numbers, mechanisms, history, attribution) have non-empty `source_claim_ids`; claim ids exist in the ledger; quotes verified. 10. Asset `status` all `VALIDATED` before render; generation methods allowed by the channel policy.
11. `quality_contract` counts (unresolved continuity errors, missing assets) are within bounds and `required_gate_status` is met. 12. `scene_type`/`scene_operation` pair sanity (e.g. `INSERT_EXPLAINER` implies a diagram-like type and a later restore).

## 9. World-state and patch convention (PROPOSED - the schema defines none)

Patch and assertion `path` must start with `/` but the schema never defines the document. Convention used by the example and recommended for the simulator:
```
world = { "entities": { <entity_id>: <entityState copy of default_state> },
          "camera": <camera>, "stack": [ <snapshot refs for inserts> ] }
path examples:  /entities/observer_01/pose_id   /entities/char_a/attachments   /entities/pigeon_01/visible
```
Algorithm (Report §21.8, §21.10-11, Blueprint 8): initialise `world` from `default_state`s -> for each shot in time order: (1) evaluate `preconditions` (a failure with severity `ERROR` is a hard stop - never auto-ignore) -> (2) apply `state_patch` (`ADD` append/insert, `REPLACE` set, `REMOVE` delete) ->
(3) validate invariants (§8.5) -> (4) on `INSERT_EXPLAINER` push a snapshot, on return pop and restore, applying declared elapsed-time patches -> (5) store a boundary snapshot for debugging. Event-sourced: `state_at(t) = initial + patches up to t`; do not treat rendered pixels as continuity. Output: `continuity_gate.json` with rule id, JSON path, evidence and the minimal repair (Report App. D.4).
Rule ids from the report: `CONTINUITY_PROP_OWNERSHIP` (example), teleport, identity change, location mismatch, facing, insert-return, callback validity.

## 10. Schema vs report/handoff mismatches (schema wins; written as the schema)

| Topic | Report/handoff says | Schema says | Resolution |
|---|---|---|---|
| Patch key | `state_patches`, `persist_after` (§21.10) | `state_patch`, `must_persist_entity_ids` | schema |
| Precondition shape | `{"path": ..., "equals": ...}` (§21.10) | `assertion` with `operator` (`EQ`...) and `value` | schema |
| Patch op case/path | `"replace"`, dotted `entities.char_viewer.pose_id` | `ADD/REPLACE/REMOVE`, path must match `^/` | schema; pointer paths |
| Camera | `shot_size`, `target_ids`, `pan`, `safe_text_region`, `movement` (§21.12) | `framing`, `center`, `zoom`, `rotation_deg`, `safe_margins_pct` | schema; motion via `CAMERA_*` events; text-safe region PROPOSED as a sidecar |
| Animation event | adds `trigger: narration_token:...`, `must_complete_before` (§12.3), `start`/`end` | `time{start_sec,end_sec}`, no `trigger`/`must_complete_before` | schema (extra keys illegal); narration binding = sidecar `alignment_bindings.json` (PROPOSED) |
| Scene vocabulary | Handoff: 10 classes `REAL_SCENARIO`,`LEVEL_CARD`,`DIAGRAM_EXPLAINER`,`STAT_CARD`,`MAP_TIMELINE`,`SPLIT_COMPARE`,`METAPHOR`,`REACTION_CLOSEUP`,`DOCUMENT_OBJECT`,`HERO_TABLEAU` | 15 `scene_type` values (§7) | schema normative. Mapping: `REAL_SCENARIO`->`REAL_WORLD_SCENARIO`/`CHARACTER_INTERACTION`; `DIAGRAM_EXPLAINER`->`EXPLANATORY_DIAGRAM`/`CAUSE_EFFECT_CHAIN`; `STAT_CARD`->`TEXT_STAT_EMPHASIS`; `SPLIT_COMPARE`->`COMPARISON_SPLIT`; `METAPHOR`->`VISUAL_METAPHOR`; `REACTION_CLOSEUP`->`REACTION`; **no home:** `LEVEL_CARD`, `MAP_TIMELINE`, `HERO_TABLEAU`, `DOCUMENT_OBJECT` (partly `RESEARCH_ATTRIBUTION`) |
| Per-beat must/forbid | Handoff §Mission: `must_visually_explain[]`, `forbid[]` per beat; also `pose in/out`, `transition`, `SFX/music energy` | no such fields | PROPOSED sidecar `beat_visual_requirements.json` keyed by `beat_id`, or encode as `qa_assertions`; pose in/out = `state_patch` + `POSE` events; transition = implied by `scene_operation` |
| Head/body sub-entities | Report §29.10: schema "should be extended" with component targets | already present in 1.1 (`target_component`, `componentConstraint`) | resolved in 1.1 |
| `return_to_shot_id` | Report §8.3: store `return_to_shot_id` for inserts | no field | PROPOSED: restore note in `allow_discontinuity_reason` + a sidecar return stack in `continuity_ledger.json` |
| `generation max_attempts` | Comfy ~3 (§28.2) | allows 0-8 | use <=3 for generation, <=2 for render |

## 11. Gaps and proposed extensions (all PROPOSED - fork the schema, bump `const` and `$id`, keep the original copy)

- **Profile field**: no `profile` (`CURIOSITY_EXPLAINER`/`POV_PROGRESSION`); carry it in `style_profile_id` naming or the state artifact `metadata.profile`.
- **POV_PROGRESSION needs** `LEVEL_CARD`/`MAP_TIMELINE`/`HERO_TABLEAU`/`DOCUMENT_OBJECT` scene types (or reuse `TEXT_STAT_EMPHASIS`/`LOCATION_ESTABLISHER`/`REAL_WORLD_SCENARIO` + a style token) - add enum values in the fork.
- **No `scenario` object**: initial state = entity `default_state`; per-scenario ledger lives in `continuity_ledger.json` (Report §21.3 output list).
- **No pose/emotion catalogues**: ids are strings resolved by the asset registry ([characters-assets-continuity](characters-assets-continuity.md)).
- **Units** and the **world-state document** (§9) are conventions, not schema. Pin them in `storyboard_policy.yaml` so every agent uses the same ones.
- Keep a version note in the project: schemas are "versioned independently" (Report §25).
