# Current state and handoff (dated 2026-11-01)

Written during the repo-to-skill compaction. "Verified" = read from disk on 2026-11-01. "Owner decision" = recorded in the owner's agent memory on the given date; not re-verified (the memory is ~2 weeks old at the time of writing, so confirm with the owner before acting on anything that depends on it). Update this file after material progress so nobody repeats expensive work.

## 1. The headline

- **Active production line = the Blender 3D track** (`production-3d/`; see `references/production-3d.md`). Owner decision 2026-10-10: "from now on we'll only focus on the 3D animations"; all 2D videos had already been uploaded as-is by the owner. Do not render, narrate or schedule 2D any more unless the owner explicitly resumes it.
- **The 2D v3 pipeline (this subskill) is complete, documented and frozen.** It remains useful for: re-renders, `remix`, `rethumb`, fixing a delivery, or an owner-approved resume of the remaster queue. Everything under `hidden-everyday-systems/` keeps its state; nothing was moved or deleted by this compaction.
- The old per-channel ownership rule still holds: HES work stays inside `hidden-everyday-systems/`; technews/material-trials/etcherr871/ambient are separate.

## 2. What exists (verified 2026-11-01 unless marked)

- `release-calendar/LEDGER.json`: 75 entries, all `status: scheduled` (30 `pipeline_version v3`, 11 `3d`, 34 earlier v1/v2). Latest entry release date **2026-10-19**; file last written 2026-10-19. Release day folders with content run through 2026-10-19 (days 08-19 carry the ` (x)` ready marker); the **2026-11 day folders (01-30) exist as empty scaffolding**; October days without content were not individually inspected. The ledger records scheduling, **not** what is live on YouTube: the owner uploads by hand.
- `output/`: 44 slug folders carry a v3 `QA-REPORT.json`. Each report states `human_listening_required: true`: no tool session has listened to any of them; a human listening pass is outstanding for everything (and for the house voice generally).
- `examples/`: 80 package directories (v1 legacy, v2 `causal-v2` Sep 13-18 set of 12, v3 packages). `production-batches/`: `2026-09-13_18` (v2 batch, with its own REPORT/review/delivery-summary), `2026-09-19_26` (16 deep dives, rejected, redone to the escalator bar), `2026-10-06_22` (remaster batch).
- `production-3d/`: item folders from 2026-10-13 through at least `2026-10-25-long-helicopter-couldnt-fly-forward` (plus `tools/`, `writing/`, `research/`, `characters/`, `PLAN.md`, `PLAN-v2.md`, `schedule_3d.py`). Owned by `references/production-3d.md`.
- Rendered v3 subject history (use the ledger and `examples/` for the authoritative list): the Sep 28-Oct 5 redo of 16 "inside a ..." deep dives; the Oct 6-12 remasters (14 of the 34 queued subjects, at revision 3.4/3.5); 3D tests/Shorts/longs scheduled Oct 11-19. The ledger and `examples/` hold the authoritative per-subject list (not copied here).

## 3. Unfinished 2D work (only if the owner resumes it)

`production-batches/2026-10-06_22/batch.json` lists 34 remaster subjects; 14 were scheduled (Oct 6-12). **20 were never scheduled** when 2D stopped: inside-a-can-opener, inside-a-water-meter, inside-a-stapler, inside-a-water-tower, inside-car-wipers, how-traffic-lights-sync, inside-a-combination-lock, inside-a-smoke-detector, inside-a-pop-up-sprinkler, how-tap-water-is-cleaned, inside-a-garbage-truck, how-recycling-gets-sorted, where-does-trash-go, where-storm-drains-go, how-streetlights-turn-on, why-gas-smells, inside-a-wind-turbine, how-rooftop-solar-feeds-the-grid, how-elevators-choose, how-wifi-shares-the-air. Their state is mixed and unverified: at least `inside-a-can-opener` and `inside-a-water-meter` have `output/` folders with a QA report; the rest may have packages or none. Check `examples/<slug>/package.json`, `output/<slug>/QA-REPORT.json` and whether the topic file exists in `production-batches/2026-10-06_22/topics/` before assuming anything. Remasters at 3.5 follow `REPACE` (re-pace brief) and need narration through the lead's queue.

## 4. Owner decisions that shape new work (from agent memory; dated)

- 2026-10-03/05: revision 3.5 (ZDF rhythm, physics gates); captions ZDF-style; thumbnails shortened-question + yellow key word; highlight orange (2026-10-10).
- 2026-10-05: OmniVoice (VoiceStudio) is the 2D channel voice; dots.tts only as a fallback (env var).
- 2026-10-10: stop 2D; 3D only; quality over quantity (one Short a day at 17:00, a long every ~3 days at 20:00 from 2026-10-13, per `production-3d/PLAN.md`/`PLAN-v2.md`). 2026-10-12: Oct 13-15 are already uploaded - never add to them.
- 2026-10-12: user rejected all nine round-1 OmniVoice voice candidates; wants a young, energetic, warm voice, not high-pitched; prefers a commercial-licence engine (OmniVoice weights are CC-BY-NC; VoxCPM2 is Apache-2.0). 2026-10-18: 3D voice split decided (Shorts: an OmniVoice clone "o1"; longs: VoxCPM2 "vm5"), all VoiceStudio calls through a voice lock. These affect 3D, not the 2D house reference; they are recorded in `references/production-3d.md`.
- 2026-10-12: scripts must become dynamic and story-framed rather than "an object explained in a void" (The Why Side study); the 3D writing bible lives under `production-3d/writing/`.

## 5. Known issues and limitations (as of 2026-11-01)

1. **Path constants were repointed to the post-reduction layout (2026-11-01)** and the 3D pipeline imports and font paths were smoke-tested; the legacy `hidden_systems_production.py validate` ran to completion (only content failure: `where-storm-drains-go/short` has no narration timing yet). `toolkit/renderer` still needs `npm install` before the legacy v1 `hidden-render-frames.mjs` path can run; the live `visual-system/` renderer resolves Remotion from `hidden-everyday-systems/node_modules`.
2. **Voice:** nobody has done a human listening review of the 2D house voice on the delivered videos; the owner has said it is too high-pitched/not what they want. OmniVoice is CC-BY-NC (commercial-use risk for a monetised channel); the code posts `denoise: true`, contradicting the older "no denoising" invariant (unresolved).
3. Word timings are ASR-aligned with a proportional fallback, not forced alignment (an evaluation project nobody has run).
4. The gameplay rotation (`PILOTS.index % len(clips)`) and the music rotation shift when topics are inserted; only 4 gameplay clips exist (one is 54.5 s); pin music with `P.music(id)`.
5. YouTube-side automation is unproven: `release-calendar/youtube-uploader/` and the older `uploader/` were never validated unattended against a live Studio session; YouTube's Related-video field and thumbnail A/B (Test & Compare) are manual; the live uploader needs exactly two ledger entries per date (breaks on 3D days with 1 or 3 entries).
6. Two uploader codebases and two scheduler scripts (2D `schedule_release.py`, 3D `schedule_3d.py`) with different slot rules; `uploader/README.md` and `examples/README.md` are stale (they describe the v2 flow and mention Qwen3-TTS/Rubber Band).
7. v2 `causal-v2` known debt: some migrated long-video beats are evidence cards and the fridge is a simplified energy schematic; not templates for new work (see `visual-system.md`).
8. v1/v2 art tooling needs ComfyUI, which has been removed from the repo (see `architecture.md` s7); six v1 icons have asymmetric visual mass (tower, lab, pole-transformer, sludge, grit, houses): legacy, not worth fixing.
9. `thumbnail.png` falls back to the dark plate (no photo) with only a WARNING when a topic has no licensed photo; that file must not ship.
10. Listening: every delivery report must list the pending human review; this is also true for any automated "all green" QA.

## 6. Where to look first when resuming

1. This file, then `SUBSKILL.md` of this subskill.
2. For anything new: `references/production-3d.md`.
3. For a 2D fix/re-render: `operations.md` s1 (constants), then the slug's `examples/<slug>/package.json`, `output/<slug>/QA-REPORT.json`, `release-calendar/<YYYY-MM>/<DD>/<slug>/upload-manifest.json`.
4. Recover removed docs/code: `git show pre-skill-reduction:<path>`.
