# Genre Playbook: a different bar per kind of game

Read **only the section for the game's type** plus the cross-cutting table. Each section: **Loop**, **Feel**, **Controls and camera**, **Structure**, **Network default**, **Edge cases**, **First-playable scope**, **Fun test**, **Quality bar** (genre-specific checks from the other references).
"First-playable scope" is where to start, not a ceiling: the user can raise it once the vertical slice is fun. Nothing here chooses a look, mood or audio style; those are the user's (`art-direction.md`).

## Contents
- Cross-cutting: dimension, platform, performance
- Multiplayer party and co-op
- Platformer
- Shooter
- Racing and vehicles
- Puzzle, board and card
- Strategy and tower defense
- Survival, crafting and open world
- Narrative and visual novel
- Arcade and score attack
- Hybrids and unknown genres

---

## Cross-cutting: dimension, platform, performance
| Choice | Standard |
|---|---|
| **2D** | One pixel scale or one vector style, never mixed. `CharacterBody2D`, `TileMapLayer`, one `Camera2D`. |
| **3D** | Look and lighting follow `ART_DIRECTION.md`. Prefer `CharacterBody3D` over rigid-body players. Collision per `clipping.md`. |
| **PC** | Targets come from the reference machine (`performance.md`). Settings screen: volume per bus, fullscreen, key rebinding if more than 6 actions, graphics presets. |
| **Web** | Compatibility renderer; no raw UDP; audio starts after a click; small download; test in a real browser. |
| **Mobile** | Touch controls with big targets, safe-area margins, no hover-only UI. |
Universal feel rules: every action gets feedback within a frame or two (sound, flash or motion; strength is the user's taste); every menu has a Back; pause works everywhere; restart takes seconds; no text wall before the first action.
Performance habits: pool anything spawned often, cap rigid bodies and let them sleep, instance identical props, measure before optimising.

---

## Multiplayer party and co-op
- **Loop:** a short objective each round that players do together or against each other, with physical or social chaos.
- **Feel:** shared moments; failure is readable and recoverable. Rounds of a few minutes unless the user wants long runs.
- **Controls and camera:** one fixed camera style; move, jump, interact, throw or use. Few actions.
- **Structure:** `levels/<level>/` with sub-folders per area, `characters/players/`, `network/`, `ui/room/`. One object script per area; the level connects to areas by signal and group.
- **Network default:** host-authoritative (`networking.md`, `security.md`). Rules as host-toggleable parameters (`balance.md`).
- **Edge cases:** two grab one item; carrier disconnects (drop and reset); item leaves the world (respawn); player stuck (unstuck action); last player left; late joiners; second round has no leftovers; physics piles (cap and despawn); knockdown chains (immunity window); player count changes mid-round.
- **First-playable scope:** one level, one objective type, a few object types. Add content only after the slice is fun.
- **Fun test:** with two real windows a round ends with people reacting out loud.
- **Quality bar:** clipping and fairness of spawns (`clipping.md`), balance sweep, host validation of every intent, proximity voice if wanted.

## Platformer
- **Loop:** move, jump, avoid hazards, reach the goal, repeat with new arrangements.
- **Feel:** forgiving jumps: coyote time (about 0.1 s), jump buffer (about 0.1 s), variable jump height, acceleration rather than instant speed.
- **Controls and camera:** left/right and jump. Side-scroll with a small dead-zone and look-ahead; 3D uses a follow camera with collision pull-in (`ui-and-camera.md`).
- **Structure:** `levels/world1/level1/`, `characters/player/`, `objects/pickups/`, `objects/hazards/`.
- **Network default:** none or local. Online platformers need rollback-quality sync; avoid unless asked.
- **Edge cases:** falling out of the world (kill plane, checkpoint); moving platforms carrying the player; one-way platforms; corner clipping; pause mid-jump; checkpoint restores collected items; tunnelling at high fall speed (cap it).
- **First-playable scope:** a few short levels, two hazards, one or two enemy types.
- **Fun test:** the first jump feels good in 10 seconds, in an empty test room.
- **Quality bar:** every platform has a collider that matches the visual; moving parts hide their wrap.

## Shooter
- **Loop:** see enemy, aim, shoot, get feedback, manage ammo and position.
- **Feel:** punchy hits (flash, small hit-stop, sound, shake; strength is the user's taste); enemies telegraph.
- **Controls and camera:** twin-stick: move + aim + shoot. First/third person: mouse look with sensitivity and FOV settings; Esc releases the mouse and pauses.
- **Structure:** `levels/arena1/`, `characters/player/`, `characters/enemies/`, `weapons/`.
- **Network default:** none, local, or online co-op. Hitscan resolved on the host with line of sight from the eye.
- **Edge cases:** enemy cap and pooling; spawn not inside walls or on the player; ammo zero; reload interrupted; bullets tunnelling thin walls (ray casts for fast bullets); dead enemies still colliding; player dies in the pause menu.
- **First-playable scope:** one arena, two weapons, three enemy types, waves in a data table.
- **Fun test:** shooting at nothing already feels good.
- **Quality bar:** glass and thin cover block rays; hit sounds graded by strength (`audio.md`).

## Racing and vehicles
- **Loop:** accelerate, steer, take lines, finish laps before others or the clock.
- **Feel:** usually arcade over simulation: players forgive anything except a car that flips or sticks. Prefer a simple body controller; use a wheel simulation only if it can be tuned in one sitting.
- **Controls and camera:** accelerate, brake/reverse, steer, optional boost or drift. Chase camera with smoothing and collision.
- **Structure:** `tracks/track1/` (scene, checkpoints), `vehicles/` (one script for all cars), `objects/`.
- **Network default:** each player drives their own car; the host owns laps and results.
- **Edge cases:** car upside-down or stuck (reset to last checkpoint); cutting the track (ordered checkpoints); wrong-way driving; falling off; start countdown lock; tied finish times; leaving mid-race; lap counter double count.
- **First-playable scope:** one track, a few cars with one controller and different numbers.
- **Fun test:** driving an empty track for 60 seconds is already fun.
- **Quality bar:** track surfaces without z-fighting; barriers have colliders on the car and camera layers.

## Puzzle, board and card
- **Loop:** read the state, decide, act, see a clear consequence, solve or lose.
- **Feel:** clarity. Rules fit in one sentence. Every move has instant feedback. Undo.
- **Controls and camera:** pick-and-place by mouse or touch; fixed camera; big targets.
- **Structure:** `board/` holds pure rules (state in, state out); `puzzles/` one data file per level; thin scene and UI draw the state.
- **Network default:** none, or turn-based: send moves only, validated on the host.
- **Edge cases:** input during animations; illegal moves; win/lose/stalemate exactly once; undo past the start; restart leaves no state; recorded seeds; fast clicking.
- **First-playable scope:** a set of hand-checked levels introducing mechanics one at a time.
- **Fun test:** the first puzzle can be solved without instructions.
- **Quality bar:** unit tests on `board/` rules (cheap and where bugs hide); a solver or generator checks every level is solvable.

## Strategy and tower defense
- **Loop:** earn resources, spend them on units or towers, watch the outcome, adapt.
- **Feel:** decisions matter and are readable: show ranges, costs and what the enemy will do.
- **Controls and camera:** mouse select/place; pan and zoom; pause and speed-up.
- **Structure:** all numbers in `data/` tables; `units/`, `buildings/`, `maps/map1/`; engine navigation for pathing.
- **Network default:** none; online co-op only with small counts and host snapshots. Lockstep RTS is a large project: say so.
- **Edge cases:** a placement that blocks every path (validate and refuse); sell/upgrade mid-wave; unit cap; timers while paused; stuck units; negative resources; empty waves; speed-up breaking timers (use delta time).
- **First-playable scope:** one map, a few unit types, ten waves.
- **Fun test:** wave 3 forces a real choice.
- **Quality bar:** strategy sweep as a balance gate, including a greedy exploit strategy (`balance.md`).

## Survival, crafting and open world
- **Loop:** gather, craft, meet needs, expand, explore.
- **Feel:** a stream of small rewards; pressure that never feels unfair.
- **Controls and camera:** first or third person; hotbar; one inventory screen.
- **Structure:** `items/` and `crafting/` as data, `world/` for generation, `saves/` for persistence, `data/` tables.
- **Network default:** none, or online co-op where the host owns world and save.
- **Warning: the largest scope.** Start with a vertical slice (one biome, one crafting chain, one threat) and ask before accepting more.
- **Edge cases:** a versioned save system from day one; inventory full (drop, never delete); stack limits; exact-ingredient crafting; save during death; chunks unloading under the player; item duplication via drop-and-pickup spam.
- **First-playable scope:** as in the warning.
- **Fun test:** in 10 minutes the player has gathered, crafted a tool and used it to get something new.
- **Quality bar:** persistence tests; world generation checked for unreachable or clipped spawns.

## Narrative and visual novel
- **Loop:** read, choose, see consequences, reach endings.
- **Feel:** effortless reading: click to advance, skip seen text, backlog, save anywhere.
- **Controls and camera:** one advance input; no camera.
- **Structure:** `story/` as data (JSON or resources), never code; `scenes/` for backgrounds and poses; one small script plays the data. No custom scripting language.
- **Network default:** none.
- **Edge cases:** inconsistent flags; skipping past a choice; loading mid-line; missing reference (clear placeholder in dev, a gate failure for release); very long lines; text speed zero; rollback.
- **First-playable scope:** one story, a few endings, short.
- **Fun test:** a tester reaches an ending without asking how to progress.
- **Quality bar:** text fits every window size (`ui-and-camera.md`); every referenced asset exists and is credited.

## Arcade and score attack
- **Loop:** play a short run, die, see the score, try again at once.
- **Feel:** instant restart (about a second), a smoothly rising difficulty, readable risk and reward.
- **Controls and camera:** few actions; fixed or simple camera.
- **Structure:** `levels/level1/`, `characters/`, `objects/`; `State` holds score; a local high-score file.
- **Network default:** none; optional shared-seed runs without servers.
- **Edge cases:** pause exploits; score overflow; high-score save failing (keep playing); restart mid-animation; extreme difficulty.
- **First-playable scope:** one mode, a few obstacle types, one scoring rule.
- **Fun test:** testers say "one more try" without prompting.
- **Quality bar:** the difficulty curve is simulated like an economy (`balance.md`).

## Hybrids and unknown genres
1. Find the closest section and take its **Feel**, **Edge cases** and **First-playable scope**.
2. Name the one **fun source** in `GAME_VISION.md` and protect it; cut anything that does not serve it.
3. If two genres collide, the stricter scope wins until the slice is fun.
4. If nothing fits, treat it as arcade until a prototype proves the loop, then specialise.
5. Log the hybrid decision in `DECISIONS.md`.
