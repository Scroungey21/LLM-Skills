# The universal AI-video production workflow

Compiled 2026-11-01, abstracted from five channels (news explainers, everyday-mechanism explainers, physics-simulation Shorts,
found-clip Shorts, 10-hour ambient). Every channel runs the same ten stages; they differ in what each stage *is*.
Stages that don't apply to a video type are marked n/a — skipping them is a decision, not an omission.

For each stage: **the decision** you must make, **the gate** that must pass before moving on, and **how each channel solved it**
(one line each; details in the linked subskill). Gate numbers are in [qa-gates.md](qa-gates.md). Rules that bind every stage are in
[agent-principles.md](agent-principles.md). Channel key: NEWS [news-explainer](../subskills/news-explainer/SUBSKILL.md) ·
HES [everyday-systems-explainer](../subskills/everyday-systems-explainer/SUBSKILL.md) ·
MT [physics-simulation-shorts](../subskills/physics-simulation-shorts/SUBSKILL.md) ·
E871 [clip-card-shorts](../subskills/clip-card-shorts/SUBSKILL.md) ·
AMB [ambient-long-form](../subskills/ambient-long-form/SUBSKILL.md).

```
 0 choose type/channel -> 1 idea + repeat-check -> 2 research (claim->source) -> 3 script -> 4 voice -> 5 visuals
   -> 6 render/assemble -> 7 QA gates (objective + human-style) -> 8 metadata/thumbnail -> 9 release scheduling
   -> 10 post-release learning        (all stages resumable from files; human uploads)
```

## Stage 0 — Pick the video type and the owner
- **Decision:** which subskill fits what the user wants ([video-type-selector.md](video-type-selector.md)); is a new channel needed
  ([new-channel-playbook.md](new-channel-playbook.md)); whose directory is this ([agent-principles.md](agent-principles.md) §9)?
- **Gate:** you can name the channel directory you will write to and the channel's current-state doc you read first
  (every subskill has one; the repo's rule is "read current state before continuing"). Check `git status` and leave unrelated dirty files alone.
- **Cross-cutting:** run the environment preflight first on a new machine/session ([environment-setup.md](environment-setup.md)): GPU free?
  right TTS service up (never two)? ffmpeg present? Resume from disk state, not chat memory.

## Stage 1 — Idea / topic selection and the repeat-check ledger
- **Decision:** what is this video *about*, and has it (or a near-twin) been made? Selection is an editorial decision backed by a ledger,
  not by taste alone.
- **Gate:** the subject passes the channel's repeat/novelty check and is recorded in its ledger.
- **NEWS:** ingest articles (RSS/Atom, 30-minute scheduler), score them, one-sentence viewer promise, publication cutoff time recorded; news freshness is the dedupe (no separate topic ledger is documented in the NEWS sources).
- **HES:** check `release-calendar/LEDGER.json`, the 60-episode topic catalogue and authored packages before proposing a topic; new subjects since 2026-10-10 are 3D-only, all-new (never covered in 2D or the 3D tests); quality over quantity.
- **MT:** `season/catalog.py plan()` only; enforces `season/novelty.py` against `season/HISTORY.md` + ledger fingerprints (scenario, rig, materials) *before anything is simulated*; if nothing passes, add a scenario, never relax the rules.
- **E871:** discovery from *verified* sources only (Reddit Atom feeds, yt-dlp); URL/ID uniqueness in `data/clips.db`, dHash perceptual dedupe, ledger; stock footage filtered at discovery.
- **AMB:** scored idea CSVs from the research phase (reports 00-14); pick scenes (e.g. marble machine, roommate typing) from `research-output/`; don't re-research.

## Stage 2 — Research with claim -> source mapping
- **Decision:** what are the discrete claims, which primary sources support each, what are their qualifications and the scope of the
  "representative system"?
- **Gate:** every factual statement the viewer will hear/see maps to a claim ID, every claim to source IDs with qualification; unstable facts re-checked just before generation; blocking fact-check flags resolved.
- **NEWS:** claim-source ledger separating verified fact / attributed claim / inference / opinion; primary sources first; URLs and access times saved for every screenshot/clip; `meta.json` `sources`; recheck before audio and before metadata.
- **HES:** `package.json` carries `accuracy_scope`, source records (publisher, URL, type, access date, use), a claim ledger (id, statement, source IDs, confidence, qualification); real references (patent figures, manufacturer drawings) with measured proportions; 3D uses `VERIFIED-FACTS.md` corrected figures.
- **MT:** n/a for facts; the "research" is physical plausibility and top-clip patterns (research distilled into the subskill); verdicts and metadata numbers are *measured from the simulation*, not claimed.
- **E871:** the "evidence" is provenance: original URL, uploader, platform, download date, sha256 in `source.json`; context facts come only from the original post or what is visible.
- **AMB:** real CC0 scans/licences logged; report numbers reproduced by re-running data scripts.

## Stage 3 — Script (cadence and length targets)
- **Decision:** structure, length and rhythm for the format; whether there is narration at all.
- **Gate:** length/word/scene limits met; reads aloud cleanly; plain words; jargon declared; Short is a standalone rewrite/summary; the factual re-check done.
- **NEWS:** conversational, hook in first 15-20 s; beats 18-30 words (<= 34), 6-12 s; write ~175-190 wpm; Short ends with the exact CTA string; cyber explained for non-specialists.
- **HES:** "explain like to a curious twelve-year-old": 650-950 words, 10-20 scenes, 3-5 ideas, FK grade <= 6.5, everyday comparison per mechanism; Short = the whole video summarised (110-185 words, 35-60 s) with a CTA scene; 3D longs 5-7 min with story frame/"you" stake/gags/callback; checked by `script_gates.py`.
- **MT:** no script. The "script" is the episode `spec.json` (family, scenario, rig knobs, materials) plus exactly one on-screen line.
- **E871:** a caption: choose the `caption_job` first, write five, pick one; 3-15 words, adds context or a take; title is a second take.
- **AMB:** no script; a scene spec + seed + duration (10 h), audio schedule.

## Stage 4 — Voice
- **Decision:** narrated or not; which engine/voice; native or tempo-stretched pacing; licence of the engine.
- **Gate:** provenance recorded; cadence gate (where it applies); listened to; one voice per video; GPU free and only one TTS service up.
- **NEWS:** dots.tts SOAR `warm-informational` (port 8004), dry, then pitch-preserving `atempo` (1.5 per docs; 1.2 code default, unconfirmed), WhisperX alignment, caption pages; deterministic seed + per-scene cache.
- **HES:** since 2026-10-05 OmniVoice via VoiceStudio (clone of the house reference), dots.tts `hidden-systems-informational` (`tts-hidden`, 8005) only as fallback; 3D split since 2026-10-18 (Shorts o1, longs vm5 / VoxCPM2); native pacing 165-240 WPM, no time-stretch ever.
- **MT:** none — foley is the soundtrack (recorded CC0 foley on simulated events).
- **E871:** none — the clip's own audio; silent clips get a calm CC0 bed (never Kevin MacLeod, energy <= 6.0).
- **AMB:** none — synthesised audio only (DSP engine, scheduler, 60 s blocks).
- Tooling: [voice-tts.md](voice-tts.md).

## Stage 5 — Visuals
- **Decision:** what is the visual language, and what is the *evidence* each frame shows? Accept list and reject list written down ("make it look good" is not a gate).
- **Gate:** every asset inspected at full-res, in a contact sheet, and in the composition; every beat has a visual that explains/evidences it; provenance/licence recorded.
- **NEWS:** evidence imagery (official screenshots, advisories, product imagery, source evidence cards) + purpose-built mechanism animations (React/Remotion components under manifests) + comparison/timeline; reaction GIFs <= 3 (default 0); never fabricate evidence.
- **HES:** current track = ZDF-style **3D in Blender** (long 16:9 + Short; `production-3d/`), faceless "you" character with a hidden storyline, camera never out-and-back, highlight = bright orange, attachment/physics gates. The earlier 2D track (code-drawn SVG `causal-v2`, ComfyUI FLUX atlas) was **stopped 2026-10-10** — it is history, not how the channel works now.
- **MT:** procedural geometry + physics (Blender rigid/cloth/fracture, Taichi MPM) rendered in Cycles; studio cyclorama, one hero apparatus, locked/slow camera; five visual rules.
- **E871:** the found clip inside a Frame Studio-style card (`xpost` default) or meme/snap edit styles chosen by the decision guide; framing crop vs contain.
- **AMB:** Blender-baked plates + procedural frame function (marble machine sim; dorm-room ceiling view), dim night grade.

## Stage 6 — Render and assemble
- **Decision:** how frames and audio become final MP4s; resumability; what is a clean master you can re-finish.
- **Gate:** correct canvas/fps/codecs; no black/frozen frames; seam checks; deterministic re-runs; no stale intermediates.
- **NEWS:** Remotion (30 fps) via CLI from the engine -> JPEG frame sequence -> ffmpeg mux; 2560x1440 long / 1440x2560 Short; lead-in/tail.
- **HES:** 2D era: Remotion compositions driven by `hidden_systems_production.py` (`audio`/`validate`/`render`/`all`/`remix`/`rethumb`), H.264 CRF 18, Shorts as an 84 % card over gameplay. Current 3D track: Blender renders under `production-3d/` (and its `experiments/zdf-3d-long/` precursors), assembled with the same voice/QA tooling; check the subskill for the live commands.
- **MT:** `make_episode.py`: bake -> score -> render+assemble (short 1080x1920 / wide 1920x1080) -> qc -> meta; `clean_<aspect>.mp4` master kept so text/loop/sound can be re-finished; physics at 0.5x via solver `time_scale`.
- **E871:** `clips.py run` ingest -> render (ffmpeg/Frame Studio card) -> QC -> stage.
- **AMB:** `engine/full_render.py`: 30-min NVENC segments + audio + stream-copy concat, checkpointed and resumable (rerun the same command).
- Tooling: [rendering.md](rendering.md).

## Stage 7 — QA gates (objective + human-style)
- **Decision:** none — gates are not optional; decide only how to *report* limitations.
- **Gate:** all of [qa-gates.md](qa-gates.md) for the channel: objective probes (duration, loudness, true peak, black/freeze, WPM where it applies, caption behaviour, dimensions) **and** listening/frame inspection; verify on the final render, not on JSON.
- **NEWS:** automated deliverable validation + editorial/audio/visual QA lists; listen unwatched / watch muted; human Gate 1 (script) and Gate 2 (render) in the engine.
- **HES:** triple verification (gates + prove they bite; stills vs references; post-render frame sequences); QA-REPORT.json; band-gated music/SFX under voice.
- **MT:** QC suite + contact sheet + clean-master frames; one-by-one the five visual rules.
- **E871:** QC at render; open a thumbnail per batch + mid-clip frames.
- **AMB:** `qc_demo.py`/`final.qc.json`, sheet + spectrogram, measured luma/peaks.

## Stage 8 — Metadata and thumbnail
- **Decision:** the promise (title/thumbnail/description) and what to disclose (sources, credits, original links, synthetic-media flag).
- **Gate:** title/thumbnail don't overstate; sources/credits present; length limits; files delivered match the manifest.
- **NEWS:** specific curiosity title; description with sources in both full and Short; 1280x720 PNG thumbnail with 1-2 strong elements.
- **HES:** `question-mechanism-v1` title + 3 alternates, timestamps, `Full Video:` link, music credit verbatim, no channel-name tags; thumbnail text = shortened title question (2-4 words) with one yellow word, ZDF look.
- **MT:** title <= 100 chars (the matchup), measured numbers, "no AI-generated or diffusion video" line, CC0 credit, `containsSyntheticMedia` false; no series/episode branding.
- **E871:** title <= 70 chars (second take), 2-3 alts, 8-12 tags, 3-4 hashtags, description = hook + `Original video:` + `Credit:`.
- **AMB:** packaging per report-14 (thumbnails, `upload-manifest.json` with `long_video` key).

## Stage 9 — Release scheduling
- **Decision:** slot, folder, whether the owner already filled it; the upload remains manual.
- **Gate:** folder created via the channel's scheduler; manifest sha256 matches the staged file; slot not already taken; private-by-default.
- **NEWS:** `technews/output/release-calendar/<YYYY-MM>/<DD>/`.
- **HES:** `release-calendar/<YYYY-MM>/<DD>[ (x)]/<slug>/` + `LEDGER.json` + `schedule_release.py <slug> <date> <time>`; daily Short 17:00 and long every 3 days 20:00 (3D plan, from 2026-10-13); the owner hand-arranges slots and uploads — never move his placements.
- **MT:** Tue and Fri 17:00 Africa/Casablanca; weekly Task Scheduler job `MaterialTrials-Weekly` (Sunday 01:30).
- **E871:** 4 Shorts/day: 09:00, 13:00, 17:00, 21:00; `clips.py plan`; ` (x)` day marker.
- **AMB:** open owner decision whether long-forms use E871 slots.
- Cross-channel browsing: [release-catalog.md](release-catalog.md); layout details: [release-calendar.md](release-calendar.md).

## Stage 10 — Post-release learning (thin everywhere; be honest about it)
There is no automated analytics loop in any channel's sources. What exists:
- **Rejection reasons feed the taste file** (E871: `reject_reason` tunes `vibe.json`).
- **Owner review is the feedback loop:** the owner reviews one video, states preferences, and they become standing rules (the clarity rules, five visual rules, pacing rules) — record each with date and owner, add a gate, and apply to all future videos.
- **Production memory:** MT `HISTORY.md`, HES `LEDGER.json`/handoff, E871 `clips.db`/ledger — the next topic selection reads them (stage 1).
- **Analytics-as-patterns** is only a design idea (legacy Stickman blueprint: learn at the pattern level — topic family, title formula, thumbnail concept, hook type — never overfit to one viral video). It was never built. The ledger is not proof of what is live; ask the owner.
- After material progress update the channel's `current-state.md` (date, services up/down, paths, hashes, what is done/open).

## Resumability and state (applies to every stage)
- State lives in files/DB, not in chat: each channel keeps a dated current-state/handoff doc plus a ledger. Update it after material progress with timestamp/timezone, active services, production IDs, output paths, runtimes, hashes, changed settings and why, QA done and open, safe next actions.
- Make long jobs resumable: write `*.part*` then rename; take a lock; re-running the same command resumes at the first unfinished piece.
- Usage limits or crashes: resume from disk state; do not reload agents or re-do accepted work.
- Don't present stale artifacts as current; regenerate rather than editing provenance.
