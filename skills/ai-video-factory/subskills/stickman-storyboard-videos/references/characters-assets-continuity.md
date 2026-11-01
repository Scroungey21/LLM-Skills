# Characters, props, locations, assets and consistency

Contents: 1 Principle · 2 Character = identity + state · 3 Parametric rig and poses · 4 Emotions and faces · 5 Locations and anchors · 6 Animals and props · 7 Persistent-identity and continuity rules · 8 Asset ladder, classes, registry, search, modification · 9 ComfyUI / generative policy · 10 Provenance · 11 Prior art in this repo (copy patterns, do not import)

Sources: Report §10, §19, §20, Blueprints 9-11; Handoff §Renderer policy. Anything about line widths, head ratios, palettes or pose frequency of the studied channel is `UNMEASURED_TARGET` (Report §9.1); the values below are neutral engineering defaults.

## 1. Principle

The executable unit is a **rigged vector entity**, not a raster character prompt (Report §10.1). Default path for everything: `SEARCH -> REUSE -> PARAMETRIC MODIFY -> PROCEDURAL VECTOR GENERATE -> COMFYUI ONLY IF NECESSARY` (§1.3, §19.1).
Use deterministic SVG/parametric vectors for stickmen, standard poses, props, diagrams, text, simple environments, charts, arrows, UI and most motion. **Never ask diffusion to redraw a persistent stickman or common prop each time it appears**; "a new random sample does not become the same character because the prompt says so" (§20.5). Recurring characters stay procedural unless a profile explicitly requires otherwise (Handoff §Renderer policy). "Same person sits down and holds a plate" must be a **state change**, not a new generation task (§10.1).

## 2. Character = identity + state

```
CharacterIdentity: identity_id, body_profile_id, face_profile_id, color/accent tokens, clothing/accessory tokens, canonical asset hash      (static)
CharacterState:    pose_id, emotion_id, screen position, facing, scale, held/attached props, visibility, current location        (mutable, in the storyboard)
```
Maps to the schema: identity -> `entity.canonical_asset_id` + `identity_lock`; state -> `entityState` ([storyboard-schema §3](storyboard-schema.md)).

## 3. Parametric rig and poses (Report §10.2)

Normalised joints (rig `human_stick_v1`): `head_center, neck, shoulder_l/r, elbow_l/r, hand_l/r, hip, knee_l/r, foot_l/r`; anchors `hand_l_grip, hand_r_grip, head_label, torso_front`; render tokens `stroke_token: character_primary`, `line_cap: round`, `line_join: round`.
Poses = joint angles/coordinates + semantic tags, stored once, reused forever: `stand_neutral, point_left, hold_plate, run_right, lean_back_surprised, inspect_object, sit_table, carry_box, look_down, shield_face`. This is **our** vocabulary; the target's pose frequency is unmeasured.
Pose changes are `POSE` animation events between vector poses with optional 2-6 frame eased interpolation (§12.2); pose files are registry assets (`asset_class: POSE`).
Neutral defaults (PROPOSED, not measured): near-black rounded strokes on restrained flat fills; semantic accent tokens (not per-scene improvisation); minimal environments (only geometry that establishes place and cause/effect); no baked text in any raster (§9.3).

## 4. Emotions and faces (§10.3)

Do not build facial animation unless references prove it is needed. Start with a compact semantic set: neutral, curious, worried, surprised, disgusted, pleased, skeptical, alarmed - each mapped to a few mouth/eye/brow primitives or, if faces are minimal, to body pose. The renderer must support `emotion_id = null` (expressionless) so a shot is never forced to invent emotion. (Channel-level alternative from the owner's HES 3D rule: a faceless recurring character whose expressiveness is only body movement - a decision to make for this channel.)

## 5. Locations and anchors (§21.7)

Locations are reusable scene graphs with anchors in normalised canvas coordinates:
```json
{ "location_id":"loc_kitchen_01", "type":"KITCHEN",
  "anchors":{"left_actor":[0.22,0.68],"center_object":[0.50,0.68],"right_actor":[0.76,0.68],"counter_surface":[0.50,0.73]},
  "background_asset_id":"bg_kitchen_vector_02" }
```
In the schema these are `location.layout_slots[] {slot_id, position, facing_hint}`. Reuse the location library (a `LOCATION_ESTABLISHER` re-uses, not re-draws); simple rooms/landscapes are layered SVG (background/midground/foreground) so the camera can move and parallax without redrawing (§19.2).

## 6. Animals and props (§10.5, §19.2)

- Common/simple animals: reusable SVG silhouettes/rigs where legible. Species that become the video's focal subject: a hybrid is allowed - a deterministic simplified vector if the library already has a reliable species depiction, else a curated or generated raster/vectorised illustration for unusual morphology, **frozen as one stable identity asset** reused for every later shot; pose changes by vector articulation, mesh warp, layer deformation or a small validated variant set - not repeated text-to-image.
- Separable parts: any animal whose causal story depends on a part (pigeon head vs body) needs the part as a controllable sub-component (`target_component`) with `LOCK_X`-style constraints (Report §29.10). Plan this when authoring the rig, not after.
- Props: SVG (recolour/scale/rotate cheaply), attached through named anchors `LEFT_HAND, RIGHT_HAND, HEAD, TORSO, BACK, CUSTOM`.
- Factual morphology: the animal's anatomy/action must not materially mislead; an adult/typical depiction should be recognisable (asset request field `factual_constraints`, §25.4).

## 7. Persistent-identity and continuity rules (§10.4, §27.5)

1. An entity with `persistence_scope >= SCENARIO` gets a stable id; its canonical asset changes only with an explicit `identity_variant` event. 2. Clothing/accent tokens persist. 3. Facing is stateful; a camera cut never flips an entity. 4. A held prop is an **attachment relation**; transfer = remove A's attachment, then add B's. 5. **Offscreen != nonexistent** (`visible: false`). 6. Montage cast uses `SHOT` scope. 7. Inserts must restore state on return; callbacks reuse the same asset ids and, if possible, a camera echo.
Hard continuity errors the simulator must catch: prop-ownership conflict · attachment to a missing/invisible entity (unless intended) · teleport without a move or scene transition · unannounced identity change · location mismatch · facing contradiction that breaks the action · return from insert not restoring required state · callback referencing an invalidated/missing asset state. **Fix the planning, never relax the simulator** (Blueprint 8: "never auto-ignore a failed precondition").

## 8. Asset ladder, classes, registry, search, modification

**Ladder** (§19.1, Blueprint 9): 1) semantic/style/orientation search; 2) reject licence/provenance-incompatible items; 3) similarity >= `reuse_threshold` (0.86 in the example request) -> reuse; 4) else deterministic modification; 5) else procedural/vector generation; 6) only then a ComfyUI job if the class/policy allows; 7) QA, register. A failed asset never invalidates unrelated assets.

| Class | Preferred representation | Why |
|---|---|---|
| stickman body/rig | SVG + rig JSON | deterministic, poseable, tiny, consistent |
| pose / face-emotion | joint-state JSON / SVG component | reuse without duplicate art |
| prop, furniture, arrow, icon | SVG / procedural | recolour/scale/rotate; exact |
| text, number | deterministic text renderer | no diffusion spelling errors |
| chart / diagram | procedural SVG/Canvas | data-accurate, editable |
| simple room/landscape | layered SVG | continuity + camera moves |
| species silhouette | SVG if adequate | speed/consistency |
| complex species illustration, complex natural background, historical texture | curated raster/vector or ComfyUI-assisted | morphology/richness beyond primitives |
| thumbnail focal | high-quality raster/vector hybrid | click value justifies the effort |

**Registry record** (§19.3): `asset_id`, `class`, `representation`, `semantic_tags[]`, `style_profile_id`, `identity_lock`, `source{method, workflow_id, seed, prompt_hash, license_or_generation_provenance}`, `files[]`, `content_hash`, `qa{status, issues[]}`. Global across videos; per-project manifest records which assets a video used.
**Index by** semantic tags, class, style profile, orientation, pose/action, transparency, aspect/resolution, colour tokens, identity family, licence/provenance, perceptual hash. Tags + perceptual hash first; embeddings optional (open question).
**Modification layer before any diffusion** (§19.5): recolour; mirror *only if semantically safe*; crop; vector reshape; pose retarget; expression swap; add/remove deterministic accessory; composite prop; mesh warp for small animal pose variation; vector->raster at needed resolution. Every modification creates a **derived asset with `parent_asset_id`** - never overwrite the original.
**Asset request** (§25.4): `request_id`, `semantic_need`, `class`, `required_tags[]`, `representation_preference[]`, `identity_scope`, `target_min_px [w,h]`, `transparent`, `style_profile_id`, `factual_constraints[]`, `reuse_threshold`, `allowed_methods[] (REUSE, MODIFY, VECTOR_GENERATE, COMFY_I2I, COMFY_T2I)`.
**Asset gate** (§27.6): exists + hash verified; representation/resolution/alpha right; style-compatible; semantic tags match; morphology/diagram content factually acceptable; identity similarity threshold for variants; provenance/licence complete; no unintended embedded text.

## 9. ComfyUI / generative policy

- ComfyUI is a **backend**, not the orchestrator; Claude and the storyboard own decisions and state (Handoff §Renderer policy, Report §20.1). It is called only by the asset planner (and a thumbnail-asset branch), never by storyboard text. All workflows are versioned and hashed; never silently change checkpoint/LoRA/workflow in a production batch; reuse assets before regenerating.
- Task matrix (§20.3): focal animal master (T2I/I2I, high-res, alpha preferred, high consistency) · animal pose variant (I2I with reference + pose/edge, very high consistency; lower denoise, ControlNet/warp before new identity) · complex background (layout sketch + depth/line map, medium consistency, no alpha) · local object repair (inpaint with mask, max 2-3 attempts) · thumbnail focal (small candidate batch, rank, refine winner). Generate masters larger than display size; never render whole 1080p scenes via diffusion when most content is vector; keep alpha/masks; downsample at composition.
- Consistency: fixed canonical reference + fixed or recorded seed + low-denoise I2I for variants + ControlNet/edge/pose + prompt components generated from structured attributes + post-generation similarity check vs the canonical asset (§20.5).
- Reject a generated asset for: shape/anatomy corruption relevant to comprehension; identity drift above threshold; extra limbs/objects/text; wrong transparency/mask; style incompatibility; layout conflict with anchors; contradicting the factual storyboard; embedded text where text must be deterministic; resolution/alpha mismatch (§20.6).
- Retry (§20.7): deterministic repair/crop -> inpaint the failed region -> adjust conditioning -> retry same seed if controllable -> rotate seed only if the sample is unusable -> after `max_attempts` `BLOCKED`. Never regenerate dependent shots before the asset is approved.
- Reproducibility/security (§20.8): pin ComfyUI revision and custom-node versions; store workflow JSON hash with every output; allow-list custom nodes in production; keep experimental workflows apart; bounded output dirs and resource limits.
- **Repo reality**: ComfyUI + FLUX.1-schnell was the HES editorial-art stack (stopped 2026-10-10), the install is archived and its venv broken - reprovision per [legacy-and-removed §4](../../../references/legacy-and-removed.md). One GPU: never alongside dots.tts/VoiceStudio/Blender ([agent-principles §10](../../../references/agent-principles.md)). **Default for a new stickman channel: no diffusion at all** (the report's own validation needs none, §29.6). Whether to allow it for hero art/backgrounds is an owner decision - and affects disclosure ([policy](policy-rights-and-risk.md)).

## 10. Provenance (§26.6)

Generated assets record model/workflow/seed/reference hashes; vector assets record source generator/version and parent assets; every external item records URL/id, retrieval date, licence/usage status, hash; music/SFX/fonts need licence entries ([audio-captions-music §5-6](../../../references/audio-captions-music.md)). Stock/found media is out unless the channel decides otherwise; the E871 "never stock footage" rule is that channel's, so check your own channel's rule first ([agent-principles §2](../../../references/agent-principles.md)).

## 11. Prior art in this repo - copy the patterns into your own folder; never import from `hidden-everyday-systems/`

- HES v3 code-drawn 2D: stable part ids, an **attachment gate** (attached things must look attached; moving details clipped to their host), `validate_continuity` (nothing undoes itself across a cut), `motion_check` (streams have sources; angles never wrap; no drawing stops dead in view), the "show everything you name" highlight rule. Read: [everyday-systems visual-system §4](../../everyday-systems-explainer/references/visual-system.md), [editorial-and-quality](../../everyday-systems-explainer/references/editorial-and-quality.md).
- HES procedural-doodle research blueprint (`hidden-everyday-systems/research-output/automation-blueprint.md`, gitignored channel folder - read-only reference): hand-drawn feel by **seeded jitter on vector paths** so the same object id + seed always gives the same silhouette; every recurring object has stable id, type, seed, palette assignment, orientation, parent system, allowed state changes, first/last beat; the renderer refuses a second identity for the same object unless the storyboard marks a change; **visual truth tags** per screen (`schematic`, `section`, `map`, `illustrative`, `evidence`) with a legend where a simplification could mislead; visual validators (claim coverage, entity coverage, flow direction, label collision, screen density, continuity, composition-variation, caption safety). Adopt the truth tags and validators; they complement the storyboard QA.
