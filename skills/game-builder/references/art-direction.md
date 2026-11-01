# Art direction: the user's look is the law

Read this before any model, texture, shader, UI skin, sign, light or colour decision, and whenever the user says something "does not fit" or "looks generic".
This skill has no house style. The agent asks, records what the user chose, and enforces consistency with it.

## Contents
1. Ask, never assume
2. Record it in `ART_DIRECTION.md`
3. Enforce consistency
4. The user changes direction
5. Quality floor that holds in every style
6. The look-development loop
7. Technique menu (neutral, unranked)
8. AI-generated and downloaded assets

## 1. Ask, never assume
Do not suggest or default to a style, palette, mood, shader or polygon budget. The first art question at intake is open:
- What should it look and feel like? Which games, films, images or places do you love? (Ask for files or links; store the images.)
- Mood in your own words. Realism level. How detailed should surfaces be?
- Finish policy: flat colour, textured, painted, pixel, something else? How strong should texture be on different classes (environment, props, characters, UI)?
- Colour intent: any must-have or forbidden colours?
- Camera and UI feel: how close, how busy, how loud?
- What must never appear in this game?
If the user wants a recommendation, give 2 or 3 labelled options with their costs and risks (section 7) and no ranking. Wait for their pick before producing assets: assets made in a guessed style are rework.
Ask for audio feel in the same conversation (see `audio.md`).

## 2. Record it in `ART_DIRECTION.md`
Create it from `assets/templates/ART_DIRECTION.md`. It holds, in the user's words where possible:
- References (image paths, the one thing you take from each).
- 3 to 5 anchor assets: finished, user-approved pieces that define the look. New work is compared with them.
- Allowed and forbidden: shaders, textures, colours, effects, proportions, line weights, text treatments.
- Finish policy per asset class (what surface detail each class carries, how strong).
- Technical budgets *as the user and platform require them* (triangles, texture sizes), not as a default.
- Calibration log: every verdict the user gave ("twice as strong", "too soft", "great, keep this") with the date and the value you changed.
The doc is short and blunt. If a field is blank, the user has not decided: ask, or decide the cheap ones and log them.

## 3. Enforce consistency
- **Lineup gate.** Render every new asset next to the anchors, same light, same angle, same scale, in the engine. The user or a reviewer judges: same family or not? Reject or rework what does not belong. Save the image in `_project/evidence/`.
- **Surface and finish coverage audit.** List every material and every surface class and who owns it. Fail on any default, grey, untextured-by-accident or placeholder surface. Users notice the surfaces that were forgotten (shelves, floors, back sides, trim), not the ones you polished.
- **Recognisability.** Every object that has a name must read as its name from the normal gameplay camera (a toy must look like that toy, a sign must say what it signs). Check from the camera distance, not in a model viewer.
- **Consistent scale and density.** One texel density or pixel scale per class; one scale convention for held and placed objects; no mixed styles inside a class.
- **Signs and brand text have a reason.** Each sign, label or logo is designed for where it hangs and what it must tell the player (like a real place would), not stamped from a template. Check it reads from the places people stand, matches the direction, and does not copy a real brand.
- **Text and signs.** How text is produced (rendered in engine, hand-lettered, vector, painted) is the user's decision; record it, and reject methods they ruled out. Check fonts' licences and brand-like names before use. Check that signs are readable and not occluded from where players read them (`clipping.md`).
- **Consistency across systems.** Lights, post effects, UI, particles and materials all come from the recorded direction. A shader that exists must be justified by `ART_DIRECTION.md`; do not add a second one "just for this asset" without logging why.

## 4. The user changes direction
Update `ART_DIRECTION.md`, log the change in `DECISIONS.md` with the user's words, then re-run the lineup on every affected class and fix or list what no longer fits. Never keep both looks.

## 5. Quality floor that holds in every style
These are independent of taste:
- The silhouette reads at the game camera's distance.
- No placeholder, default or unfinished asset ships. A change is not done until its renders were opened and read by eye ("check every change by eye"; the release bar in `release-and-legal.md`).
- Nothing is clipped, misaligned, z-fighting or floating (`clipping.md`).
- **No setting silently removes an art-defining feature.** Quality presets may reduce cost (resolution, shadows, reflection quality, effect density). They must not remove the thing that makes the game look like itself (for example the surface detail the user called fundamental). Ask which features are art-defining and record them.
- Subtle means subtle: when the user asks for light texture on some classes and strong on others, treat the numbers as separate dials and calibrate each with the user.
- Placeholders are tracked: a list in `HANDOFF.md` of anything temporary, and the release gate fails while it is non-empty.

## 6. The look-development loop
1. Make one piece of each class in the proposed treatment (a room, a prop, a character, a UI screen).
2. Render at the real camera. Show the user (a contact sheet beats a description).
3. Take the verdict in their words; change one dial at a time; log the value.
4. Repeat until they approve; the approved pieces become anchors.
5. Only then mass-produce. For big surface or sign passes, do a small approved sample first, then the rest, then one review.

## 7. Technique menu (neutral, unranked)
Pick by the user's taste and the team's capacity, not by what is easiest for the agent. Each has costs.
| Technique | Cost / risk |
|---|---|
| Flat colour or palette-mapped surfaces | cheap to keep consistent; looks bare without good lighting and sound design |
| Hand-painted or stylised textures | needs a repeatable texture pipeline and one texel density |
| Physically based textured materials | needs good sources, memory budget and lighting; mixed sources clash |
| Pixel art | one pixel scale everywhere, no rotated sprites unless intended, nearest filtering |
| Voxel or block-built | scale and grid discipline; big meshes need merging |
| Stylised shaders (banded, outlined, painterly) | one shader family; check the cost on the weakest target |
| Scan or photo derived | licence, noise and scale work; heavy on memory |
| Vector 2D | one stroke style; scaling and export rules |
An optional example shader lives in `assets/examples/` for projects whose user picked that look. It is not part of the default scaffold.

## 8. AI-generated and downloaded assets
- Provenance log: tool, prompt or source, date, licence or terms, credits spent.
- Same lineup gate as any asset. Check mesh quality (topology, UVs, scale), texture seams and whether the licence lets you ship it. Some stores require disclosure of generated content (`release-and-legal.md`).
- Do not ship generated assets as-is just because they were fast. Re-skin or rebuild them to the recorded direction.
- Custom models come from a repeatable script (`assets.md`), so a change in direction is a rerun, not a redraw.

Example (from one project): the user named one visual feature as art-defining, so quality presets could drop other effects but never that one, and a key surface was approved from a small sample before the full pass.
