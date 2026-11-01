# Assets: sourcing, custom models, export, and the ledger

Read this when adding any model, texture, sprite, font or animation, and when setting up Blender.
What the assets should look like is `art-direction.md`. How sound is made is `audio.md`. This file is the pipeline: where assets come from, how custom ones are built repeatably, and how they enter the engine.

## Contents
1. Before the first asset
2. Sourcing under the user's licence floor
3. The ledger
4. Custom models from generator scripts
5. Export rules (glTF)
6. Verifying a model
7. Textures, UVs and materials
8. Rigging and animation
9. The lineup gate
10. 2D games
11. Be honest about weak spots

## 1. Before the first asset
- `ART_DIRECTION.md` is filled and the user approved the anchors (`art-direction.md`). Do not mass-produce first.
- The licence floor is chosen with the user (`audio.md` section 4 applies to every asset type).
- The budget for paid assets or generation credits is recorded in `TOOLCHAIN.md`.

## 2. Sourcing under the user's licence floor
Order, stopping at the first that fits the recorded direction:
1. Engine primitives for blockouts and simple props.
2. Free packs whose style matches the direction. Many CC0 sources exist with very different looks (Kenney, Quaternius, KayKit, Poly Haven, ambientCG, OpenGameArt, itch.io packs, Poly Pizza, Sketchfab filtered by licence). Pick the one that matches `ART_DIRECTION.md`; do not bend the direction to the pack.
3. Custom builds from generator scripts (section 4).
4. Generative services last, only if the user accepts the provenance and licence terms (`art-direction.md` section 8).
Mixed packs clash: choose one pack family as a base and fill gaps from the same family first, or re-skin incoming assets to the direction.
Some packs forbid reselling or redistributing the raw pack: ship them inside a game, never as a bundle. Downloads need the user's approval per list (`agent-process.md`).

## 3. The ledger
`_project/CREDITS.md`: one row per external asset the moment it enters the repo (asset, author, source URL, licence, date read, path, hash for downloads). Read the licence on the asset's page. Anything outside the floor is rejected or an agreed, logged exception. The credits screen and store text are generated from it (`release-and-legal.md`).

## 4. Custom models from generator scripts
Every custom model comes from a script in `tools/blender/` (or the engine's equivalent), never from a one-off manual edit.
- Why: a change in direction, a bug in a dimension or a new variant is a rerun, not a redraw. Scripts also hold the constants that the runtime shares (`clipping.md` section 2).
- Run Blender headless: `blender --background --factory-startup --python script.py -- <args>`. This is reliable, scriptable and testable. A Blender MCP server (which lets the agent run Python in a live session) is optional; verify its current package name and the add-on, set telemetry off, and save first, because it runs arbitrary Python.
- Script outline: read `ART_DIRECTION.md` limits; build from parts with named dimensions at the top; seat thin parts by the project's one convention; clean up (merge by distance, remove non-manifold edges); UV-map to the direction's treatment; add collision meshes; export; run the verifier (section 6).
- Keep sizes inside agreed marker or slot boxes. Keep the script deterministic (fixed seeds).

## 5. Export rules (glTF)
- Export `.glb`. 1 Blender unit = 1 metre. Apply scale and rotation before export. Set the scene frame rate to the engine's animation rate and start actions at frame 0.
- Origin at the base centre so an object sits on the floor at height 0, unless the category needs another convention (then document it).
- Collision: separate simple meshes named with the engine's import suffixes (Godot: `-col`, `-colonly`, `-convcolonly`), never collide on the visual mesh. Every visible solid gets one (`clipping.md` section 4).
- Characters: check the forward axis by dropping the model in a scene and rotating the node, never by guessing.
- Embedded per-asset materials follow `ART_DIRECTION.md`: some looks use one shared material, some use many. Do not impose either.

## 6. Verifying a model
A small verifier runs after export and fails the build on any violation:
- dimensions measured by ray or bounding box against the spec's limits;
- triangle or texture budget if the user set one;
- model-only clip and z-fight run (`clipping.md` section 8);
- watertight where required; UVs inside 0..1; no missing material;
- collider present; origin where documented.
Print one line per model and a summary with `problems=0`.

## 7. Textures, UVs and materials
- The finish policy per class comes from `ART_DIRECTION.md`. Make textures by a repeatable script when possible (same seed gives the same image), at a single texel density per class.
- Strength of a texture is a dial the user calibrates (`art-direction.md`). Store the dial in a data file so it is a number change, not a repaint.
- Store masks/patterns in efficient formats; generate mipmaps; check that tiling is invisible at the camera distance.
- Textures and surface features must not be switched off by quality presets.

## 8. Rigging and animation
- Prefer an existing rig from a source that matches the direction, and keep its skeleton so its animations work. Retarget free animation libraries inside the game; never redistribute raw files.
- Characters with a rig: every new clip keys every bone (an unkeyed bone snaps to the rest pose), starts at frame 0, and begins and ends on its neighbours' poses.
- Run the clearance table and temporal playback check (`clipping.md` section 6).
- Fewer animations, well chosen, with proper transitions: idle (as slow or lively as the user wants), move, jump, fall, get up, one action, hit.

## 9. The lineup gate
`_project/lineup` scene: the shared light and one row per category. Every new asset is added beside the anchors, a screenshot saved to `_project/evidence/lineup-<date>.png`, and judged: same family, scale, detail, finish? If not, fix or reject before use (`art-direction.md` section 3).

## 10. 2D games
Same gates, different tools: choose one pixel scale or one vector style and never mix, one filtering mode (nearest for pixel art), no accidental rotation of pixel sprites, sprite sheets in the lineup scene. Any free editor works; export PNG or the format the engine imports. Blender is optional.

## 11. Be honest about weak spots
Say at intake what the agent is weak at in this project (for example hand-drawn 2D art, music, judging sound by ear, complex organic modelling). Verify those by eye or ear, and offer to use sources the user trusts or to receive files from the user instead of faking it.
