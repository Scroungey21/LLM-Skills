# Balance: rules you can tune, and numbers you have simulated

Read this when the game has a score, an economy, resources, progression, difficulty, weapons, items or any choice that can be better than another.
The failure to prevent: one strategy wins every time, a content change silently breaks the economy, or an admin cannot adjust what players complain about.

## Contents
1. Mechanics are rules
2. Model first
3. Simulate across strategies
4. Fatigue, caps and thin supply
5. Re-run when content changes
6. Fairness
7. Humans last
8. Checks

## 1. Mechanics are rules
Every new gameplay or balance mechanic ships as a **host-toggleable rule** with a default, a hard range, a step, a tooltip, and a place in the lobby or settings UI. Solo play has the same parameters (choose a difficulty or a custom set before the run).
- One dictionary holds all rules (`Rules`/room settings), with defaults, ranges and a repair function that clamps bad values on the host.
- Clients see the rules read-only and they lock from the countdown until the run ends.
- Presets (Classic, Quick, Chaos...) are named sets of rules. A rule that changes only the look is not part of any preset.
- Rules travel in one small packet that stays far under the transport's limit; decode accepts older shorter forms and keeps defaults for missing fields.
- Beta mechanics are marked as such and default off.
- Ask the user for the *scale* of the game early: how long is a run, how long should the main progress bar take to fill, how many items or actions does a player perform. Such statements ("long and hard to finish", "tens or hundreds of items among thousands") are balance constraints. Write them in `GAME_VISION.md`.

## 2. Model first
Before tuning, write the model on one page: what the player gains (sources), what slows or costs them (sinks), the rates, and the thing that decides who wins. Put **every tunable number in one data table** (not in scripts). Unit tests cover the formulas.
- State the design's invariants as sentences a test can check ("time to consume an item is proportional to its value", "every item pays 90 to 100 percent of the best rate").
- Prefer one formula applied everywhere over per-item hand-tuning. Exceptions are listed and explained in the table.

## 3. Simulate across strategies
Build a headless simulator and run it as a gate.
- **Matrix:** every preset x every content set x supply or stock level x every player type x aim or skill level. Include fatigue/rule toggles both on and off.
- **Strategies:** a casual player (takes what is nearest), a min-maxer (best value per second, willing to walk), a camper (one place only), a roamer, and a **greedy/exploit** strategy (the plain greedy loop). The aim is to find the best strategy and show the others are within the band.
- **Band:** the worst reasonable strategy earns at least X percent of the best (example: 90 percent). No single place, item or action may dominate.
- Output a gate line: `BALANCE_DONE cells=N problems=0`, run once normally and once with the greedy flag. A quick matrix (seconds) is for tuning only; the full matrix (minutes) runs before release and after any change listed in section 5.
- Print the failing cells with the numbers (which strategy, which setting, what ratio) so a fix is targeted.

## 4. Fatigue, caps and thin supply
- **Anti-degenerate rules:** diminishing returns for repeating the same thing (example: full pay for two repeats, then 85 percent per extra, never under 40 percent), caps, cooldowns, decay. Make the rule host-toggleable.
- Fatigue must be visible to the player (a hint on the HUD), or it reads as a bug.
- **Thin supply check:** content that cannot satisfy the rule at low supply levels (e.g. a small level with 25 percent stock). Run the matrix at the lowest supply settings, with the *real* slot or location names, not made-up ones (a made-up name once let a failing case pass).
- A constant that is a floor for a human action (reaction, aiming time) is enforced by the host's clock, not trusted from the client.

## 5. Re-run when content changes
These changes can break balance and must trigger the full run: any value in the numbers table, a new item or enemy, a moved or added spawn or stock marker, a change of preference or category lists, a room preset change, a rule default or range change. Put the trigger list in `HANDOFF.md` and in the gate script's header.
- Moving a marker can fail the unit test for thin supply, which is the point.

## 6. Fairness
- Spawn and pickup distances (no high-value pickup within a minimum distance of a spawn).
- Catch-up and comeback mechanics are rules too; measure them (example: places at half time vs final places).
- Match length bounds; what happens at a tie; what happens when the goal is reached early (host-toggle: ends the run on the spot, or not).
- Knockdown, stun or slow effects: a recovery window of immunity so players cannot be chain-locked; durations are rules with ranges.
- Awards and end titles are cosmetic: they should describe *how* people played and be hard to farm.

## 7. Humans last
Bots find exploits; humans find fun. After the simulator passes, run a playtest with real people (module T in `mass-game-builder`, or by hand), record the verdicts in `DECISIONS.md`, and treat a verdict as a new requirement.
The 30-second and 60-second rules (`standard.md`) still apply: a balanced game that nobody understands has failed.

## 8. Checks
| Check | How | PASS |
|---|---|---|
| Rules repaired and clamped | unit tests on the rules dictionary | tests exit 0 |
| Economy invariants | unit tests on the formula | tests exit 0 |
| Strategy sweep, normal | headless matrix | `BALANCE_DONE ... problems=0` |
| Strategy sweep, greedy | same with the greedy flag | `BALANCE_DONE ... problems=0` |
| Thin supply | matrix at lowest supply with real location names | same |
| Content change | gate re-run listed in section 5 | same |

Example (from one project): eating time followed calories through one formula, every item paid 90 to 100 percent of the best rate, a taste-repeat penalty was a host toggle, and a 912-cell matrix ran normal and greedy (about 9 minutes) before a content change was accepted. These are that project's measurements, not targets; size your own matrix to your own game.
