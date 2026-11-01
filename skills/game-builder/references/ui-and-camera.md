# UI and camera: nothing off screen, nothing filmed that should not be

Read this when building menus, HUD, loading or results screens, overlays through geometry, any camera, and accessibility options.
The UI must follow `ART_DIRECTION.md`; this file is about fit, behaviour and safety, not looks.

## Contents
1. UI fit matrix
2. Screen composition
3. Loading, transitions and feedback
4. Text and fonts
5. Overlays through geometry (name tags)
6. Camera rules
7. Detached cameras
8. Accessibility and settings
9. Checks

## 1. UI fit matrix
The user's complaint was a menu whose elements left the screen when the window changed. Prevent it by test, not by care.
- Anchor everything to a defined **safe zone** and fixed layout regions that adapt to the window. Never place a control by absolute pixels.
- Build a matrix: every screen x several resolutions and aspect ratios (include small windows, ultrawide, portrait if mobile) x UI scale settings x the longest strings of every language you ship (a 2x longer string is a good stress test) x keyboard, mouse and controller focus.
- Pass criteria per cell: no control outside the safe zone, no clipped or overlapping text, no overlap with the action the player must see, every control reachable by the input device in use, focus visible.
- Produce a screenshot sheet from a windowed run, then read it. A script can report bounds; only eyes judge "looks natural".
- Know the engine's stretch quirks (a minimum canvas size under a given stretch mode) and test beyond them.
- Pass line: `UI_FIT screens=N cells=M problems=0`.

## 2. Screen composition
- Decide which part of the screen is free for 3D previews, characters, or the world. If a menu panel covers half the screen, the 3D subject goes in the other half and is centred on its own stage; check it at every aspect in the matrix.
- Props that stand on a stage (held items, tools) need clearance against the stage (`clipping.md` section 6).
- Results, lobby and character screens get camera presets of their own, kept as regression views.
- Short heading fonts (a pixel or display face) are for short text only; body text uses a legible face.

## 3. Loading, transitions and feedback
- Starting a game must never look like a freeze. Show a loading screen with honest progress, and keep it simple: if the main thread is blocked by a build, a frozen spinner reads as a crash, so show a still card with the level name and a tip.
- Transitions (iris, fade, wipe) should be smooth, start and end on the same frame as the screen change, and be skippable where they could repeat often.
- Every input gets feedback within a frame or two (a sound, a press state, a bounce). How strong the feedback is, is the user's taste: ask, record, and offer a reduce-motion option.
- No dead ends: every screen has a way back; every error says what to do.
- Menu music/sound fades in; do not start loud (`audio.md`).

## 4. Text and fonts
- Render text at the scales it is used; check for artefacts (dark spots, jaggies, halos) in screenshots at small and large sizes. Distance-field fonts can fix blurry text in 3D.
- Numbers that change live should not jump layout: fix their width or format them (thousands abbreviated consistently).
- Check font licences and ship their notices (`release-and-legal.md`).
- Credits and legal screens say what the owner says (`release-and-legal.md`), not boilerplate copied from an asset pack.

## 5. Overlays through geometry (name tags)
If a feature must draw through walls (player tags, objective markers):
- Draw the see-through version with an explicit depth test off, a render priority below the normal tag, and no occlusion culling on it (occluders can hide it).
- Make it visually distinct from the in-view version (fainter, smaller) so hidden information never reads as visible: example opacity 0.55 near, 0.25 at 40 m, never full.
- Scale limits: stop shrinking past a distance; fade with distance.
- It is a host/room option if it reveals positions; turn it off while a detached camera is flying (section 7).
- Test: in sight, behind a wall, through a floor, with the rule off (nothing shows).

## 6. Camera rules
For any camera that follows an avatar:
1. **Sphere cast** from the head toward the wanted position; the radius is larger than the near plane (so the lens never sees inside a wall) and the camera stops short of the hit by a margin.
2. **Inside-the-level test**: the lens may stand only where there is floor below, ceiling above (or open sky by design) and no solid. Use a small sphere query against colliders, not ray parity (open domes and balconies fool parity).
3. **No room fallback**: with too little space, rise over the head and look down, or move into first person.
4. **Ease**: snap in fast when blocked, ease out slowly; avoid jitter from small obstacles.
5. **Own body**: hide or fade the avatar when the lens is close (example: hidden within 0.95 m, fully visible at 1.6 m).
6. **Knocked-down and fall cameras** choose the most open of N directions once per fall and avoid directions whose waist-height ray hits a railing or wall.
7. **Collision mask**: walls, fixtures, floors, ceilings, glass, doors, cabins, decor. Not players or loose items.
8. **Per-frame rule check in QA**: nothing solid between avatar and lens, a margin from every surface, lens inside the level, lens not inside the avatar's head. Run it over a tour of hard spots (glass, corners, railings, lifts, stairs, narrow aisles) with a forced knockdown at each.

## 7. Detached cameras
Free camera, drone, selfie-stick and spectator cameras are rendering conveniences, never interaction origins.
- They collide like a spring arm with a margin, never pass walls, glass or closed doors, and stay clear of ceilings.
- In multiplayer they are tethered by default (example: about 6 m) with a soft slow-down at the limit; the host can change this as a rule.
- Grab, throw, eat, interact and line of sight start at the avatar's eye; a test must show that a grab attempted with the lens past a wall is refused.
- Anything that reveals hidden information (through-wall tags, scouting) is off while detached.
- Own body fades near the lens. A "free then locked to player axis" mode must define the hand-over frame and test it.

## 8. Accessibility and settings
- Remappable controls (required when there are more than ~6 actions); controller support if the platform expects it.
- Colour-blind safe cues: never rely on colour alone for state.
- Subtitles for any speech; text size option; reduce-motion and a camera-shake slider.
- Graphics settings: presets chosen by compute class plus a custom page; presets never remove an art-defining feature (`art-direction.md`). Upscalers (DLSS/FSR and similar) are options for lower hardware, reported as extra gains only (`performance.md`).
- Settings persist per player; QA runs do not write them.

## 9. Checks
| Check | How | PASS |
|---|---|---|
| UI fit | matrix run + screenshot sheet read by eye | `UI_FIT ... problems=0` |
| Camera rules | tour with forced knockdowns, per-frame check | `CAM_CHECK problems=0` |
| Overlay rules | two-instance run in sight, behind wall, rule off | by eye, sheet saved |
| Detached camera | grab with lens past a wall is refused | `SECURITY_DONE problems=0` |
| Loading | start from the menu, record a video or frames, no freeze | by eye |

Example (from one project): the knocked-down camera backed out along the most open of 12 directions with a 0.25 m sphere cast, and a per-frame check flagged any frame with a solid between avatar and lens.
