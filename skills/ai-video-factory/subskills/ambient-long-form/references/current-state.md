# Ambient channel: current state (HANDOFF as of 2026-10-13; disk verified 2026-11-01)

**`ambient-channel/HANDOFF.md` remains the authoritative state document** (last modified 2026-10-13 07:28). This file is its distilled, corrected summary. When the two disagree, re-check the disk and the HANDOFF, then update both.
Disk facts below were checked on 2026-11-01 by listing `S:/ambient` (no files were opened for edit).

## What exists
- **Research phase complete** (`ambient-channel/research-output/`, reports 00-14, MASTER-REPORT, ideas CSVs). Do not re-research (`research-findings.md`).
- **Engine built** (`ambient-channel/engine/`, `architecture-and-stages.md`): audio block renderer, NVENC chunked renderer, `full_render.py`, QC, two scenes (`roommate_typing` seed 11, `marble_machine` seed 3). The directory is gitignored: no version control, so back up before editing (`operations.md` section 5).
- **Demos approved 2026-10-12** ("great, proceed"): `S:/ambient/demos_v5/roommate_typing_s11_17880+180s.mp4` and `marble_machine_s3_60+120s.mp4` (also `roommate_typing_s11_16140+120s.mp4`, the sleep/wake window).
  v5 changes: roommate `EXPOSURE 56 / TOE 0.02` (was 32 / 0.05) so the ceiling reads on a TV; marble `GLOW_SAT 1.6`, `VANE_EMISSION 1.2` and sprite set `marble_sprites_v3_sat` (share of bright pixels with S > 0.5 from 23 % to 69 %, brightness unchanged); `dorm_room.py` lost the window/blind/street glow, desk lamp, stationery, binder, book props (adds ~2.3 % total light; cached passes still valid to within 0.64 code values on average).
- **Both 10 h masters rendered** (all stages incl. QC), each exactly 36000.000 s / 1,080,000 frames / H.264 1920x1080 30 fps / AAC 48 kHz stereo / faststart:
  - `S:/ambient/renders/roommate_typing_s11_36000s/final.mp4`: 4.36 GiB (4.68 GB), finished 2026-10-13 05:55. QC: -24.2 LUFS, LRA 4.1, TP -1.9 dBTP, startle +4.5 LU, frame peak luma <= 93, sleep phases ~1.
  - `S:/ambient/renders/marble_machine_s3_36000s/final.mp4`: 17.0 GiB (18.25 GB), finished 2026-10-13 07:28. QC: -24.0 LUFS, LRA 4.7, TP -2.1 dBTP, startle +4.7 LU, mean frame luma 22.3-23.5 (approved demo 22.5); sampled frame peaks 247-255 = moving white marble cores, as in the demo.
  - Whole-file loudness means the audio gain differs slightly from the demo windows' own gain (all other aspects are prefix-exact).
- **Release calendar staging mirror** `ambient-channel/release-calendar/LEDGER.json` exists with `entries: []` (no package has been scheduled).

## Not yet done (verified on disk 2026-11-01)
- **Owner sign-off on the full renders is UNKNOWN** (the HANDOFF says "Not yet watched by the owner"; nothing later is recorded). Next step per HANDOFF: watch `final.mp4`, read `final.qc.json`, then the packaging steps (thumbnails, `upload-manifest.json` with a `long_video` key, `packaging-and-release.md` section 10).
- **Cleanup pending:** `seg_000..019.mp4` and `audio.wav` (~9.9 GB each) are still in both render folders; delete after `final.mp4` is accepted. `S:/ambient/masters/` does NOT exist yet (the one-copy master location). `S:/ambient/run_keyframes.py` is still present and is stale (calls the removed `dorm_bunk` key; delete or rewrite).
- **No upload path exercised:** no canary uploads, no >= 20 GB private rehearsal, no API audit filed (as far as the repo shows), no immutable channel-ID check, no resumable uploader, no analytics jobs, no provenance generator, no `world.json`, no quality-gate code beyond `qc_demo.py` (`qc-and-quality.md`).
- **Not in the repo's ownership table:** `ambient-channel/` is not listed in CLAUDE.md's ownership split or ONBOARDING (MASTER section 29 item 26 flagged it; as of the CLAUDE.md read for this task it is still absent). Its rule stays: never write under the other channel folders; never pip-install into `<repo>/.venv/`.
- **Other planned scenes unbuilt:** starship crew quarters, castle chamber, safehouse, kitchen roommate, radio in the next room, sand/lava-lamp sim, screensaver marathon, ... (`research-findings.md` section 4).

## Corrections to stale HANDOFF text
- HANDOFF "What this is" says "have not started any full render" and "Next steps" says wait for feedback on v4 demos: both are stale (superseded by the 2026-10-12/13 update at the top of the HANDOFF).
- HANDOFF says `demos_v4` was kept untouched for comparison, but `S:/ambient` contains only `demos_v5` on 2026-11-01 (v4 is gone or was moved).
- `HANDOFF` expected sizes "roughly 4-5 GB / 18 GB (extrapolated)" are now measured (4.36 / 17.0 GiB).
- The "Speed" table in the HANDOFF is the only valid speed record (roommate 0.9-1.1x real time, marble ~0.96x + ~4 h Blender tiles); no timing from the overlapping 2026-10-12 jobs is a speed figure.
- Report corrections already made 2026-10-12 (do not redo): report-12 stale table rows after the "no music" exception (P3-12 CA 7->6, additive 6.110->5.960, rank 73->90, pools 38->41 / 95->96 / 42->43 / 3->4); report-13 section 2 Demand values per `tables13.json`; report-14 new section 3.6 + `long_video` key (drafted from source and measurements: the handoff only named it, so check it says what the owner meant).

## Contradictions and gaps to resolve (each needs an owner or engineering decision)
1. **Roommate misses its sleep-profile gates** (LRA 4.1 vs <= 3; startle +4.5 vs <= +3; TP -1.9 vs <= -3) although Someone's Here is a `sleep` series. Marble passes `immersion_tv`. Decide: retune roommate audio (`EVENT_CEIL`, limiter TP, event cadence) and re-render audio + final mux (video segments are reusable), or declare the profile. See `qc-and-quality.md` section 4.
2. **GOP and mux deviate from T1/T2** (GOP 60 vs GOP 15 for a first upload; no `-use_editlist 0`; no full-file decode run). Canary uploads are needed before committing; changing GOP or the mux means re-encoding video segments (GOP) or re-running the final mux (edit list).
3. **Synthetic-media disclosure for roommate/marble is open**: report-14's table assumes AI keyframes; the built scenes use no AI. Write the rationale per video.
4. **Provenance copy in the description template** assumes an AI-keyframe/2.5D pipeline; write what is true for the Blender/CC0 path.
5. **R12's identity conflict:** Etcherr871's stated philosophy ("Not a generative-video channel", "Never stock footage") vs an AI-assisted ambient catalog; the Etcherr871 agent must record the owner's decision in `etcherr871/docs/RULES.md`.
6. The `R04` compositor fps and `R00` size estimates describe a plan that was not what was built (the built engine is Blender plates + numpy frame function).

## Owner decisions still open (merged: HANDOFF bottom, report-14 section 4, report-12 section 5, report-13)
1. **Quiz pipeline directory** (the quiz line needs its own directory + CLAUDE.md row; not inside `etcherr871/`).
2. **Whether long-form videos may use etcherr871's slots** (Shorts slots 09/13/17/21 Morocco; long-form proposed at 02:00) and Related-video links.
3. **The " (x)" day-marker fix** in `etcherr871/mc/stage.py` (count only `clip-card-v1`), plus `clip_id` on long-form ledger entries.
4. **Ambient YouTube category** (People & Blogs vs Entertainment).
5. **Staging mirror (default) vs shared calendar** for release packages (report-14 section 3.2).
6. **IP-titled content exclusion:** whether the Star Wars "No Music" titles in report-12's P3-02 (war/field quarters) pool should be excluded. They were LEFT IN (they sit far below the top-3 median and change no score; P3-02 is on hold anyway). More generally, keep IP-titled leaders out of Demand/CA pools (done for Hogwarts, Pirates of the Caribbean, Fallout 4, Blade Runner outpost, etc.).
7. Whether the owner has watched/approved the 10 h masters and picks first upload order (current plan: report-12 start set; roommate = slot 4, marble = slot 3).
8. Quiz-vs-ambient launch order (R13 recommends quiz first, ambient in parallel) and whether to field QZ-02 as a gaming probe.
9. Which single FLUX.1-schnell copy to keep (H: vs S:) if the AI-keyframe path is ever revived (MASTER open item 36).

## Suggested next actions (not decisions)
Owner watches both masters (`final.sheet.png` + first hour) and records sign-off in HANDOFF -> resolve contradiction 1 (retune or declare) -> decide disclosure + category -> record `sha256` and move masters to `S:/ambient/masters/<slug>/` -> delete `seg_*` and `audio.wav` -> thumbnails (archetypes A/B/D) and `upload-manifest.json` in the staging mirror -> canary uploads and a >= 20 GB private rehearsal (human present) -> G1 -> schedule at 02:00 Morocco. In parallel: build the next scene (castle chamber / sand-lava sim) via the pilot -> demo-approval -> full-render path.
