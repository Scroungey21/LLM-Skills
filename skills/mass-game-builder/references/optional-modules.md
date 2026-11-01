# Optional modules (user-chosen only)

Read this only when the user picks a module (R, L, P, T or A) or asks for one of these jobs by name.
**Never start a module on your own.** Before running one, ask how (Rule 0 in `SKILL.md`): depth, how much the user wants to approve, anything to include or avoid.
Every module writes into the standard's files so nothing drifts: `_project/GAME_VISION.md`, `ART_DIRECTION.md`, `DECISIONS.md`, `HANDOFF.md`, `_project/evidence/`.
Modules never lower the bar: the strict layer in `SKILL.md` (the user's look, no clipping, recorded audio, host authority, simulated balance, evidence) applies inside every module.

## Contents
- Module R: Research, idea pitch, vision speccing
- Module L: Step-by-step build loop
- Module P: Juice, polish and a quality pass
- Module T: Playtest session
- Module A: Audit, remaster or remake an existing game (with optional reference research)
- What Claude is good and bad at

## Module R: Research a game idea, then (optionally) spec the vision
**Use when** the user wants to base a game on ones they like, wants ideas, has a fuzzy concept, or wants their vision pinned down in detail.
Three stages; the user can stop after any. R3 is optional: offer it once at the end of R2.

### R1: Research
**Ask first:** which games they like; how deep (quick summary or thorough); whether they want ideas pitched back.
1. Study what makes the reference games fun and why players love them (search the web for current information; paraphrase, never copy text, art or audio).
2. Name the **core loop** and the **core fantasy** (what the player should feel). Note what the genre's players expect and where games in it commonly fail.
3. Do not clone someone else's game or IP: borrow principles, never characters, names, art or level layouts.
4. For anything visual or audible, record the user's *reaction* to the reference ("I love how readable it is") in their words. Those words become the starting point of `ART_DIRECTION.md`. Do not turn a reference into a style recommendation.

### R2: Idea pitch (the agent suggests, the user chooses)
Propose **3 to 5 game ideas** (fewer if the user wants). Each as a short block:
- one-line pitch and the **ONE twist** on the reference loop;
- the **core loop** (moment to moment, then per minute);
- **conditions**: goal, win, fail, session length;
- **aspects**: players and trust, camera, platform, rough scope (small, medium, large) and the main risk;
- why it could be fun, and what is hard about it.
Leave the visual style out of the pitch, or list it only as an open question. The look is the user's call, taken at Intake.
Then ask: pick one, **mix elements**, or **describe your own** after reading these. Restate the choice in three lines and get a yes before R3. Set the **scope cap** now: what is explicitly out of the first version.
If the user is unsure, outline 2-3 small concept variants and prototype the best rather than polishing one concept forever.

### R3: Questions-based vision speccing (optional)
**Purpose:** capture everything the user has in mind so building never needs to guess. Offer it right after R2 and ask which way they prefer.

**Path A: the user fills a markdown spec.**
1. Copy `assets/templates/VISION_SPEC_TEMPLATE.md` to `_project/VISION_SPEC.md` and share it as a file. It covers pitch, feel, loop, goal, mechanics and which are room rules, controls, progression, content, story, players and trust, look, audio, UI, platform, release bar and ownership, edge cases, scope and success tests.
2. Tell them "not sure" or "skip" is fine anywhere, and plain bullets are fine.
3. When they hand it back, read all of it, then report: what is clear, what is missing, what contradicts (for example "solo game" but a multiplayer section filled in).
4. Ask follow-ups only about gaps and contradictions, then update the file.

**Path B: the agent interviews, one question at a time.** Same topics, same order as the template. Rules:
- **One question at a time**, about one thing; wait for the answer. (Deliberately overrides the three-question limit for this path.)
- Choices: ask-user tool with 2-4 options and a recommendation. The user's own idea (look, mood, story): a plain open question and no options.
- After each topic write the answers into `_project/VISION_SPEC.md` and show a two-line recap for correction.
- "Skip", "not sure" or "you decide" are allowed. For "you decide", choose the simplest option that serves the core loop, mark it an agent decision in the spec, log it. Never use "you decide" for the look without recording that the user delegated it.
- Follow up on conflicts and hidden mechanics; do not follow up on cheap details (decide and log them).
- Do not ask what the user already said in R1, R2 or the template.

**Path C: hybrid.** The user fills what they can; the agent interviews only for empty and unclear parts.

**R3 output and exit**
- `_project/VISION_SPEC.md`: the full spec with no empty sections (answered, "skip" with a reason, or an agent decision).
- Distil the look section into `ART_DIRECTION.md` (the user's words, references, must-never-appear) and the rest into the short `GAME_VISION.md`. The long spec is the reference; the one-pager is what every build step reads.
- Read it back in a short summary. Exit: the user approves it; contradictions are resolved and logged.
After R3, ask the Rule 0 question again (usually: continue with Intake and Toolchain).

## Module L: Step-by-step build loop
**Use when** the user wants tight, hands-on pacing instead of phase-level pacing.
**Ask first:** approve every step or every few steps; which steps to include.
The loop sits **on top of** the phases: each step uses the matching gate (`quality-gates.md`) and the standard's rules.
Rule: one small task at a time. Say in a line or two what you will do, do it, run it, show evidence (screenshot read by eye, run log, test result), ask before the next step. Commit to git after each working step only if the user asked you to commit.
Suggested order (skip or reorder on request):
1. Detailed prompt: genre, core loop, feeling, platform, camera, controls. Explain the plan back and end with "Do you understand?" before building.
2. Look samples: a few renders or mockups in directions the user asked for; they pick or correct; record anchors in `ART_DIRECTION.md`.
3. Characters and world: one script per model, generated or sourced under the licence floor; import and check scale, pivot, slots and animation names by looking and with the detector.
4. **Grey box:** the main mechanic with plain placeholder shapes, kept out of release builds. If it is not fun with plain shapes it will not be fun with fine art. This is the go/no-go gate: change the design now, not the art.
5. Content, one category at a time, each with its gates (G4, and G5/G7/G8 as they apply).
6. Juice and polish (module P), optimise, refactor.
Do not add features before the grey-box loop is fun. Do not leave placeholder shapes, default materials or temporary sounds in anything the user will play as a release.

## Module P: Juice, polish and a quality pass
**Use when** the mechanic works and the user wants it to feel and look better.
**Ask first:** which parts (feel, tutorial, world fill, performance, code clean-up, a quality pass) and how far.
- **Juice:** screen shake, hit flashes, numbers, small particle bursts, hit stop. Prefer engine built-ins and vetted addons. Juice makes a good loop feel great; it cannot rescue a bad one. Match the strength the user approved: "too much" and "too subtle" are verdicts to log, not opinions to override.
- **Sound in polish:** recorded sounds only, through the event table and the processing script (`audio.md`). A temporary tone is not a shortcut. Run the scope sweep: every action that makes the player expect a sound.
- **Polish:** fill the empty world, a short tutorial level (one mechanic per level), loading and transition feedback, UI fit (`ui-and-camera.md`).
- **Quality pass:** run the lineup gate on everything added, the surface coverage audit (forgotten surfaces: backs, trims, shelves, floors), the clipping tours at eye height, the listening pass. Fix at the source, not by hiding.
- **Optimise:** on the named reference machine at native resolution; upscalers count only as extra gains (`performance.md`).
- **Refactor:** small functions, header comments, tunables exposed. Run `scripts/check_project.py`.
Exit: G0 and G2 pass, plus the gates the pass touched; no new warnings; earlier steps still work; the user has seen the result.

## Module T: Playtest session
**Use when** the user wants real-player feedback or says the game "feels off". Claude cannot tell whether a game is fun; real players can.
**Ask first:** who tests (user, friends, strangers), how many, which part.
1. Prepare a build and a short brief: what to try, how to report. Tell the user the version and what to look at. Export under the import lock with the release configuration (`agent-process.md` section 8).
2. Tell the user to **watch quietly**: where players get stuck is the data. Recording helps.
3. 2-3 fresh players per round. Fix the biggest blocker, rebuild, test with new people.
4. Warning signs: boring after minutes, unclear goal or reward, difficulty spikes, long tutorial, one strategy always wins, a spot where people see inside geometry or fall out, a sound that reads as fake, text that does not fit.
5. Treat the user's own session as data too: every complaint ("it clips here", "that sounds fake") is a missing check. Fix the instance, then add the check that would have caught it (detector case, event-table row, UI-fit case) and log it.
6. Log in `_project/PLAYTEST_LOG.md`: what happened, what changed, what is next. Feed findings into `DECISIONS.md`.
Suggested moments: after the grey box, after polish, before release. Offer, never force.

## Module A: Audit, remaster or remake an existing game
**Use when** the user has a game in development (or finished) and wants to continue it, clean it up, improve parts, or reimagine it as the best version of **the author's own vision**.
**Never start on its own.** Ask first where the project is and what state it is in. Then run the **Change / Keep interview** before any deep audit or rewrite.
**Core idea: spend effort only on what changes.** Parts already good are kept, frozen, and not re-read, re-audited or rewritten.

### Levels (the user's answer decides; the audit may recommend, never override)
| Level | The user says | Meaning |
|---|---|---|
| **Full remake** | "change everything" | Re-conceive and rebuild around the vision; the old game is source material. The user may still name things to keep. |
| **Partial remake (proper remaster)** | "change some things only" | Keep named parts; remake the rest to the standard. |
| **Remaster** | "only improve certain things" | Everything stays; only named parts get targeted improvement. |
| **Continue** | "keep going, tidy as we go" | Keep developing and refactor in small steps, one category at a time. |
All levels finish through the standard's phases for the parts that change.

### Safety rules
- **Never edit the original in place.** Snapshot first (git tag or copy), work in a new branch or folder, ask before deleting anything.
- Keep the game **runnable at every step**; port one category at a time. No one-shot rewrites.
- **Frozen means frozen.** A KEEP item is not modified, restyled, tidied or re-audited unless the user reopens it. If it blocks something, say so and ask.
- Existing assets with unknown licences, existing audio of unknown origin, and any secret found in the repo: flag them, do not ship or repeat them (`release-and-legal.md`, `security.md` section 7).
- Another engine (Unity, Unreal, web)? Ask whether to stay and apply the folder, seam, gate and asset rules unchanged, or to port. The user decides; log it.

### Steps
1. **Intake.** Project path or upload, engine and version, state. Offer a quick or thorough pass.
2. **Light inventory (cheap).** Folder tree, counts and sizes, engine version, main scenes, asset folders. Do not read everything; know only what exists so the questions are concrete. Use the user's own file names.
3. **Change / Keep interview (mandatory, one question at a time).** Fill `_project/KEEP_CHANGE.md` from the answers.
   - **Q1 level.** "What do you want to change?" Everything / some things / only improve certain things / keep going. Restate it.
   - **Q2 keep, area by area.** For each area ask keep, improve, rebuild or drop, and which exact items. Areas: mechanics; systems (save, inventory, AI, scoring, spawning); models and characters; animations; game-flow phases and transitions; environments and levels; textures, materials, shaders; audio (sound, music); other assets (UI art, VFX); UI and HUD; networking and security; code structure; story, content, balance.
   - **Q3 why, for everything marked change.** What is wrong and what "better" looks like, in the user's words. Offer examples to react to; do not ask open "why" five times in a row.
   - **Q4 sanity check.** Read the ledger back: Keep / Keep+adapt / Improve / Rebuild / Drop. Point out dependency conflicts (for example keeping the animations but rebuilding the skeleton). The user confirms or corrects.
   - "You decide": choose the option that keeps the most working code, mark it an agent decision, log it. Not for the look.
4. **Targeted audit (only where it changes).**
   - KEEP: no audit; a smoke check that it runs, and record interface notes (inputs, outputs, signals, files, dependencies) in the ledger.
   - KEEP+ADAPT: read only enough to wire it in.
   - IMPROVE / REBUILD: audit against the standard with evidence (names, counts, screenshots): structure and code size, tunables, **look consistency against the user's anchors** (create `ART_DIRECTION.md` from what exists and ask the user to confirm it), **clipping and collision** (run or build the detector, tours at eye height), **audio** (is any sound synthesised, unlicensed or unlogged?), **network authority and bounds** (`security.md` section 8 suite), **balance** (strategy sweep), UI fit, performance, licences and secrets. Run `scripts/check_project.py` as a report on changing parts only.
   - Rate findings blocker / major / minor and write `_project/AUDIT.md`: factual and kind, the author made this. Run the game once if possible; if not, ask for screenshots or a description of the loop.
5. **Reference research (optional).** Offer once, in one sentence, after the audit: "Do you have inspiration games you want to learn from?" Skip if declined; otherwise run the procedure below.
6. **Vision recovery (scoped to what changes).** The author's vision for the changing parts, plus reference notes if any. Pre-fill `VISION_SPEC_TEMPLATE.md` for those parts from what the project reveals, then run R3 (Path A, B or C): "what is the dream version of this part?", "what would make you proud of it?". Kept items are written as "existing, unchanged". Output: `VISION_SPEC.md`, `GAME_VISION.md`, `ART_DIRECTION.md`.
7. **Confirm the path.** State the resulting level (it may differ from Q1), a rough effort (small, medium, large), what is reused and rebuilt. The user confirms; log it.
8. **Plan.** A migration plan mapped to the standard's phases for the changing parts, and a **parity checklist**: every feature of the old game marked ported, kept, changed or cut (with reason). Get approval before building.
9. **Execute.** Run the phases for the changing parts, one category at a time, gates and evidence at each step. Wire kept items through their recorded interfaces. New assets must match kept ones: the lineup gate decides which side moves, with the user.
10. **Compare and sign off.** Old and new side by side (screenshots, 30/60 tests, parity and vision checklists, gates). List intentional changes, confirm kept items untouched. Exit: the author confirms it matches their vision.
Offer modules T and P at the end as suggestions only.

### Reference research (optional part of module A; also usable inside R1)
**Purpose:** know what makes the user's inspiration games work and what the user wants from them, so improvements follow **both the author's vision and the inspiration's**. Research only what the user picked.
**Ask first (one question at a time):** which games (1 to 5); for each, **what to take** (checklist: loop, atmosphere, visual direction, animation, impact and effects feel, audio, UI and UX, pacing, progression, controls feel, onboarding, story, other; ask for the specific moment or mechanic); **what NOT to take**; how deep.
**Research per reference and chosen aspect:** search for design analyses, postmortems, developer talks, reviews; prefer primary and well-regarded sources; paraphrase, keep any quote under a few words, never reproduce text, art, music or assets. For each aspect answer **what does it do, and why does it work** (feedback timing, contrast, silhouette, restraint, anticipation, risk and reward, readability, rhythm) and what the game avoids doing. Say so when something cannot be verified.
**Combine:** per aspect, the principle in one line, marked **TAKE / ADAPT / AVOID**, and how it applies to this game concretely. Link each to changing rows in `KEEP_CHANGE.md`; do not apply inspiration to KEEP items. If an inspiration pulls against the author's vision, show both sides; the author's vision wins by default; log it.
For visual and audio aspects the principle goes into the user's `ART_DIRECTION.md` for their approval. It never overrides their anchors, and no style is adopted just because a reference used it.
**Output:** `_project/REFERENCE_NOTES.md` (`assets/templates/REFERENCE_NOTES.md`) with the per-reference tables and a "Combined direction" section. Read it back; exit when the user confirms what is taken and how.

## What Claude is good and bad at
- **Good:** code, controllers, game systems, save systems, menu logic, bug fixing, scripts and tooling (including detectors and gates), refactors.
- **Needs the user or real data:** whether something is fun, whether a sound or a look feels right, and level and art taste. Plan around these with the user's anchors and verdicts, licensed recordings and assets, and real players (module T).
