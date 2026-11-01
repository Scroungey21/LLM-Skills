# QA: seeing the game, tests, and the edge-case method

Read this when running checks by hand, writing tests, doing the edge-case pass or the by-eye review.
The numbered gates, tiers and PASS lines are in `quality-gates.md`; this file is how to look, test and think adversarially.

## Contents
1. Seeing the game (pixels need a window)
2. The by-eye and by-ear checklist
3. Tests with GUT
4. Edge-case method
5. Always-on edge cases
6. Performance pass and release

## 1. Seeing the game (pixels need a window)
A parse check is not a run. A passing test does not prove a menu is on screen. For anything the player sees or hears: launch the game with a display, reach the screen, save an image, open it and read it.
- Headless mode has no renderer. It cannot capture images and must never be used for screenshots, visual checks or clipping pictures. Use it for boot, unit tests, level checks, security and balance.
- One-line capture from a debug key or test scene (Godot):
```gdscript
get_viewport().get_texture().get_image().save_png("res://_project/evidence/main_menu.png")
```
- Save evidence under `_project/evidence/` with a date. Look at it: text readable, nothing off screen, look consistent with `ART_DIRECTION.md`, HUD not covering the action, nothing clipped or floating.
- Build named camera presets (eye height, low angle, per screen) and keep them, so a before/after is the same picture.

## 2. The by-eye and by-ear checklist
Run after every visible change and in full before a release.
- **Geometry:** close-ups at eye height and low angles of each new unit; corners, junctions, thresholds, ceilings; the places the user's screenshots showed (`clipping.md`).
- **Surfaces:** no default grey, no missing texture, no stretched or mismatched density; objects recognisable by name from the game camera (`art-direction.md`).
- **Reachability:** walk to every door, shelf face and interactable; none is hidden or blocked; no pocket to get stuck in.
- **Animation:** every state transition (idle, move, jump, fall, get-up, use) on every body shape; no limb through body, floor or prop.
- **Camera:** the hard-spot tour with forced knockdowns (`ui-and-camera.md`).
- **UI:** every screen at several window sizes; long strings; controller focus.
- **Audio:** play the whole game with sound on; wrong-role sounds, repeats that tire, levels, clicks at loop points (`audio.md`).
- **Feel:** every action has feedback within a frame or two; restart takes seconds; no dead end.
- **Multiplayer:** two real windows play a round; one leaves mid-run; the host leaves; a late joiner is told why.

## 3. Tests with GUT
GUT is the GDScript test runner. Pin a release that matches the engine, vendor it in `addons/gut/`, enable it, then:
```
godot --headless -s addons/gut/gut_cmdln.gd -gdir=res://tests -gexit
```
Write tests for logic with numbers or state: scoring, inventory stacking, puzzle rules, tables, room codes, rules clamping, economy formulas, the event table. Do not unit-test visuals.
```gdscript
# test_score.gd - rules for scoring.
extends GutTest

func test_delivering_five_items_wins() -> void:
	State.reset()
	for i in 5: State.score += 1
	assert_eq(State.score, 5)
```
Optional later: a mutation tester to see whether the tests would catch a bug.
If GUT reports class-resolution parse errors on a fresh checkout, import once before the tests (through the project's import script).

## 4. Edge-case method
For each mechanic answer in writing (`DECISIONS.md` or a comment):
1. What if it happens **twice at once**?
2. What if it happens **at the worst moment** (round ending, scene changing, paused, disconnecting)?
3. What if the player does it **too fast, too slow, never, or forever**?
4. What if the thing involved **is gone** (destroyed, left the room, out of the world)?
5. What if a **second playthrough** starts from this state?
Then choose prevent, handle, or accept (and say why). Test the "handle" ones. Turn every confirmed bug into a regression test or a named preset where the logic allows.

## 5. Always-on edge cases
- Player falls out of the world, clips into a wall, or gets stuck (kill plane, respawn point, a stuck button).
- Input spam, simultaneous inputs, held keys across scene changes, alt-tab mid-action.
- Pause, resize, focus loss, controller unplugged.
- Two players do the same thing at the same tick.
- Object destroyed while carried, or leaves the playfield. Physics objects pile up (cap and despawn).
- Round ends mid-animation or mid-throw.
- Quit or disconnect at any moment (including the host).
- Empty room, full room, join after start, duplicate or very long names.
- A second playthrough behaves like the first (no leftover state).
- Many bodies in one place; the widest body in the narrowest gap.

## 6. Performance pass and release
Once per phase run the fixed tour and read frame-time percentiles (`performance.md`). The release checklist lives in `release-and-legal.md`; the tiers and which gates apply when are in `quality-gates.md`.
