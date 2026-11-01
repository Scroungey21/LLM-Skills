# Material Trials - current state (as of 2026-11-01, midday)

Read this first when resuming; then run `weekly.py status` (the ledger is the truth, this file is a dated snapshot).
Everything here is derived from `season/LEDGER.json`, `season/HISTORY.md`, `season/weekly.log`, Task Scheduler and the
folder listings on 2026-11-01. Treat anything older than a few weeks as stale.

## Where the channel stands

- Channel running since 2026-09-25 (research 2026-09-24; three demos approved 2026-09-25). Weekly job installed 2026-09-25.
  Uploading is manual and private; the ledger cannot tell whether a `scheduled` video was ever uploaded (check YouTube).
- User direction in force (details in SUBSKILL.md invariants): 2026-09-25 slower physics, short (not removed) result holds, dry mix, one
  line of text, **no diffusion ever**, weekly production, long-form demo; 2026-09-26 every video unique + production memory, not a show
  (no branding/episode numbers/outro/statements), long-form straight into the action, and the five visual rules (review of the funnel and
  steamroller videos); 2026-10-03 Shorts must show everything in full and loop by dissolve (not rotation). All six early videos were rebuilt
  under these rules on 2026-10-03.

## Production memory (ledger, 2026-11-01)

Scheduled (filed in `release-calendar/`, private, awaiting human upload): releases are Tue/Fri 17:00 Africa/Casablanca.

| Id | Release | Content (scenario, materials) | Measured outcome |
|---|---|---|---|
| S1E01 | 2026-09-29 | press/press: glass, jelly, rubber | jelly and rubber bounced back, glass shattered |
| S1E02 | 2026-10-02 | drop/hopper: steel balls onto glass | 1, 10, 100, 1,000 held; 5,000 broke |
| S1E03 | 2026-10-06 | blade/wedge (half_w 0.06, drop_z 0.62): jelly, sand, snow, water | water, sand, snow split; jelly survived |
| S1E04 | 2026-10-09 | press/roller (r 0.5, 0.7 m/s, gap 0.08): amber, foam, rubber | foam dented, rubber bounced back, amber shattered |
| S1E05 | 2026-10-13 | drop/height (ball_r 0.06): lead onto porcelain, 30 cm to 4.5 m, 7 rungs | held through 3 m, broke at 4.5 m |
| S1E06 | 2026-10-16 | press/roller (r 0.42, 0.5 m/s, gap 0.08): balloon, gummy, obsidian | balloon bounced back, gummy dented, obsidian shattered |
| S1E07 | 2026-10-20 | drop/height: brass onto ice | broke at 4.5 m |
| S1E08 | 2026-10-23 | press/press (plate 0.5, crush 1.5 s): amber, foam, rubber | foam dented, rubber bounced back, amber shattered |
| S1E09 | 2026-11-03 | drop/height (ball_r 0.08): steel onto ice | broke at 4.5 m |
| S1E10 | 2026-11-06 | press/press (plate 0.82, crush 2.2 s): gummy, obsidian, rubber | gummy dented, rubber sprang back, obsidian shattered |

Slots **2026-10-27 and 2026-10-30 are empty**: every candidate failed (five failed S1E09 attempts, listed below). Past slots are never
refilled. **2026-11-10 (Tue) is empty** (S1E11 failed) and **2026-11-13 (Fri) was never planned**: the 2026-11-01 run died after the failure.
Next scheduled run: Sunday 2026-11-08 01:30 (Task Scheduler `NextRunTime`), which will plan 2026-11-10 and 2026-11-13 if the job survives.

Failed / rejected attempts (all stay in memory; reasons from `HISTORY.md`):
- S1E04 balloon/gummy/ice press (novelty: press/press 3 videos earlier, same rig as #1); S1E05 2,500 marbles vs glass (novelty: hopper 3 videos
  earlier); S1E06 soft/jelly/firm jelly wedge (story check: all survived); S1E06 water/powder/gravel/firm_jelly wedge (novelty: same rig as #3); S1E06
  funnel clay/fine_sand/packed (QC loudness -17.1 on rebuild; **the early version was filed and still has a stale calendar folder**); S1E06 roller
  balloon/gummy/obsidian variant (r 0.42, 0.7 m/s, gap 0.1: build error, no title).
- S1E09 hopper porcelain + rubber_ball (outlet 0.2): physics gate - nothing broke through 5,000 balls. S1E09 funnel gravel/powder/sand (neck_r 0.035): Short
  4.47 s (< 12 s), nothing flowed. S1E09 wedge packed/snow/soft_jelly (half_w 0.025): Short 8.7 s. S1E09 roller foam/glass/jelly (r 0.42): build error (`press.json`
  missing); same candidate with r 0.5: Short 11.9 s (< 12 s).
- S1E11 hopper marble + porcelain (outlet 0.14): physics gate - nothing broke through 2,500 marbles. The retry never ran (see below).

No long-form is in the ledger (`longforms: []`); the hand-built demo `longform/lf-demo` (6 videos, 1:55) exists. The first automatic long-form is due after 16
scheduled episodes not yet in a compilation (10 now).

## The weekly job right now

- Task `MaterialTrials-Weekly`: last run 2026-11-01 01:30, **LastTaskResult 1 (failure)**; the log ends with the S1E11 FAILED line at 03:10 and no `planned` /
  `weekly done` line. Inferred cause (not confirmed): the same-family retry (`drop` only) found no novelty-passing candidate (hopper was just used, height was used for
  S1E09) and `new_spec` raised an uncaught `RuntimeError`.
- The task action was repointed on 2026-11-01 to `<repo>\material-trials\.venv\Scripts\python.exe` (the venv was moved from the archived research folder; `weekly.py status` smoke-tested with it). Verify with `Get-ScheduledTask MaterialTrials-Weekly | Get-ScheduledTaskInfo` after the 2026-11-08 run.

## Open items and decisions (ordered by urgency)

1. (Done 2026-11-01) Weekly task repointed to the new interpreter; confirm after the 11-08 run.
2. Fix or constrain the generator so the planner stops producing failing candidates: hopper + porcelain target never breaks (see scenario-families "Known weaknesses");
   3-material blade candidates and funnel `neck_r` 0.035 fail duration/story; make `weekly.run` survive a retry with no candidates (catch `RuntimeError`, log it, move to the next
   slot). Possibly add a new scenario (backlog in scenario-families) since the drop family is nearly exhausted under the 6-video gap.
3. Slot 2026-11-10 / 11-13: decide whether to hand-plan videos (`weekly.py plan`, then inspect specs) or let the 11-08 run do it.
4. Remove or ignore the stale `release-calendar/2026-10/16/mt-s1e06-funnel-clay-fine-sand-packed` folder before anyone uploads from the calendar (ledger says the roller is S1E06).
5. S1E03's water splash read as bubbles and its jelly bounce looked split while labelled SURVIVED (user review 2026-10-03; open on 2026-10-03). The code carries fixes
   (water E 2.6e6, droplet spray split, jelly viscosity eta 150, connected-component split test, final shot extended for the dissolve); no user sign-off is recorded - show the user
   the current S1E03 before treating it as closed.
6. Add `material-trials/release-calendar` as a root in `release-catalog` (WPF app) if not already done.
7. Decide the long-form length question (target 8:10-8:40 vs ~4-5 min from 16 wide cuts) and the stale `endcard.*` files in `longform/lf-demo/`.
8. Check the release timezone convention before uploading (ledger offsets `+00:00` vs Africa/Casablanca).
9. Stray files from an early path bug: 3 preview PNGs in `C:\episodes\` (outside the repo); the user can delete them.
10. A viscoplastic (Herschel-Bulkley) MPM material would allow slowly flowing clay/dough/mud; not built.
11. There is no analytics, uploader or feedback loop; once videos are live, compare engaged views / retention only within the channel's own history and vary (never re-skin) winners.

## Contradictions found while consolidating (source says X, reality says Y)

- Old handoff: "S1E06 funnel passed". Ledger/HISTORY: the funnel S1E06 failed on rebuild; the scheduled S1E06 is the roller. Trust the ledger.
- Old quality-gate: metadata includes a "no AI/diffusion" line and a CC0 credit. `engine/meta.py` and filed descriptions: measured numbers + hashtags only (newer rule wins).
- Old operations: GPU jobs "can overlap". Old handoff (later): never overlap (a clay MPM run crashed). Rule kept: never.
- Old README layout: long-form has an end card. `compile.py`: none (newer rule); `lf-demo/` still has endcard files.
- Old quality-gate: "one voice per 25 ms" thinning. Code: 20 voices/s dense, 60/s sparse buckets.
- `channel.json` render samples 32/24; old docs said press uses 48. Press code defaults to 48/32 (`spec["samples"]` override).
- `audio.py` docstring says no samples are used; the live audio is samples only (synth voices are unused legacy).
- True-peak target -1.0 dBTP vs gate passes at <= -0.5.
- `weekly.py run --dry-run` writes specs and ledger entries (same as `plan`).
- `longform_target_s` and the "8-minute" research target are not enforced by code.
- Release slots are Tue/Fri 17:00 but the job builds Sunday 01:30 (two different clocks; both are in `channel.json cadence`).
