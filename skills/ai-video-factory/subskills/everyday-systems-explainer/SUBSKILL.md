---
name: everyday-systems-explainer
description: Produce, resume, review, re-render or schedule "how does this ordinary thing actually work" YouTube explainers for the Hidden Everyday Systems (a.k.a. GhostSystem) channel - evergreen evidence-led mechanism videos (long form + Shorts + gameplay-background "brainrot" Shorts) with code-drawn 2D animation (Remotion, pipeline v3) or the Blender 3D line, plain twelve-year-old scripts, dots.tts/OmniVoice narration, thumbnails, metadata and the release calendar/ledger. Use whenever the work involves this channel, an "inside a ..." object explainer, how a household object/infrastructure works, to-scale mechanism animation, ZDF-style fast pacing, the 165-240 WPM cadence gate, the GhostSystem ledger, or topic repeat checks - even if the user never names the channel.
---

# Everyday-systems explainer (Hidden Everyday Systems / GhostSystem)

Evergreen "I use this every day but have no idea how it works" videos: one ordinary object, system or process per video, explained from real references in clear, fast, accurate
animation. Faceless. Evidence-led (every scene -> claim ids -> sources). The user's recurring verdict to avoid: "AI slop" - drawings unlike the real object, scripts that need prior
knowledge, slow rhythm, hedged or invented facts.

## Production lines (read first)

| Line | Status (2026-11-01) | Where |
|---|---|---|
| **3D Blender line** (ZDF / The Why Side quality; daily Short + a long every ~3 days) | **Active; all new videos.** Owner stopped 2D on 2026-10-10 | [`references/production-3d.md`](references/production-3d.md) (3D pipeline, voices, scheduler, writing bible) |
| 2D code-drawn pipeline v3 (Remotion, `causal-v3`, revision 3.5) | Complete, documented, **frozen**: re-renders, `remix`, `rethumb`, fixes, or an owner-approved resume of the 20 unscheduled remasters | this file + the references below |
| 2D v2 (`causal-v2`) and v1 (icon atlas) | Frozen history; packages still load | `references/architecture.md`, `references/visual-system.md` s9 |

If the user asks for a new video, route to the 3D reference unless they explicitly want 2D. Do not render, narrate, schedule or upload 2D without the owner's go-ahead
(`references/current-state.md`).

## When to use / not use

Use for any request about this channel's videos, scripts, drawings, narration, thumbnails, metadata, calendar, ledger or topic choice. Do not use for the tech-news channel
(`news-explainer`), physics simulations (`physics-simulation-shorts`), found-clip cards (`clip-card-shorts`) or ambient videos (`ambient-long-form`): never mix channels, each has its own
voice, rules, ledger and calendar. Work stays inside `hidden-everyday-systems/` (repo root). If the request is ambiguous about the channel, ask.

## The 2D pipeline in order, with the gate at each step

1. **Topic** - choose by subject and angle, not slug. Gate: repeat check against `release-calendar/LEDGER.json` + `examples/` + 3D items; inclusion rules and scoring in [`topic-selection.md`](references/topic-selection.md); one-sentence promise approved.
2. **Research** - real references (patents, manufacturer drawings, teardown photos, dimensions) + primary sources; write `references/<slug>/REFERENCE.md` with a DRAWING SPEC. Gate: every claim has source ids and a qualification; unstable facts rechecked; scope and exclusions defined.
3. **Author** - `production-batches/<batch>/topics/<topic>.py` with `authoring_v3` at `revision="3.5"`. Gate: running it prints `valid` (all clarity/reference/motion/framing/mention/arrow/material/sound/attachment/continuity/thumbnail/pace/physics gates), then prove the gates bite.
4. **Preview** - `preview` silent stills at every camera move. Gate: every still reviewed against the narration and the reference images (right part lit when named, nothing cropped/covered, true proportions, streams stop when their source is empty).
5. **Narrate** (the lead, one queue) - `audio` -> native takes at 165-240 WPM, ASR timing; re-run the topic so follow-highlights/arrows use real timings; `validate`. Gate: cadence, durations, provenance; never stretch audio.
6. **Render** - long, clean Short, gameplay Short, two thumbnails, delivery files, `QA-REPORT.json`. Gate: frame sequences at every state change, the Short's sheet, thumbnails at 168x94, music/sfx under the voice, music credit in the description.
7. **Human review** - listening and viewing by a person (a tool session cannot listen; report it as pending).
8. **Schedule** - `schedule_release.py` copies the delivery set, hashes it, updates the ledger. The owner uploads; never upload without authorisation.

Detailed commands: [`operations.md`](references/operations.md). Rules behind each gate: [`editorial-and-quality.md`](references/editorial-and-quality.md).

## Non-negotiable invariants

1. **Accuracy first.** Draw from real references to scale; motion computed from the mechanism (closed loops closed, nothing fades in/out); never wrong the physics to be tidy; report a wrong detail rather than hide it. Every claim -> primary/authoritative source with a scope qualification; no invented figures, no hedging in narration (scope lives in `accuracy_scope`).
2. **Plain script.** Curious-twelve-year-old level: one idea per scene, everyday comparison for every mechanism, <=4 declared technical terms (long) / 2 (Short), grade <=6.5, sentences <=20 words (mean <=13), numbers spelled out in narration.
3. **Fast rhythm (3.5, owner's audience has ADHD).** A visual change at least every 3.5 s (long) / 2.5 s (Short); one part = one sentence = one beat; the core mechanism gets 25-60% of runtime; start in motion in second person; camera never goes out and back while the focus stays on one part.
4. **Show everything you name.** Whatever the narration names is lit at that word; arrows are rare (only for a named part that is not the focus; never on the focus; never <1.5 s). One highlight look: bright orange, rest washed 38%.
5. **No visual mistakes.** Attached parts touch (real support, never a nudge); one structure is one piece; moving details clipped to their host; streams have a source and are drawn connected to it; angles never wrap; loops wrap out of sight; drawings never stop dead in view; what happened stays happened across a cut.
6. **Opening teardown.** Every video opens on the familiar object and strips it down to the mechanism (<=3 scenes long, <=2 Short); textured materials on opening and closing scenes only.
7. **The Short is the whole video summarised** (5-12 scenes at 3.5, 60-115 words, 24-45 s), ends `payoff` then `cta` ("full video linked below"), published as an opaque 84% card over full-frame gameplay. Only the gameplay Short publishes.
8. **Voice.** Native generation only: no `atempo`, Rubber Band, resampling or pitch change; a failed 165-240 WPM take is rejected and re-sampled, never stretched; one voice per video; OmniVoice via VoiceStudio is the default (dots.tts fallback); `tts` and `tts-hidden` never run together (one GPU); never hand-edit provenance (regenerate instead). Captions: Montserrat Bold lowercase white, no coloured word.
9. **Music** only from the CC BY library, levelled, and >=18 dB under the voice in every octave band (>=22 dB in 250 Hz-4 kHz); exact attribution in the description; `jellyfish-in-space` is banned.
10. **Titles/thumbnails.** `Main question? | Mechanical reflection` (<=100 chars) + exactly three alternates; thumbnail text = the title's question shortened to 2-4 words ending `?` with one yellow key word; two thumbnails per video (real licensed photo, never generated); no `hidden everyday systems`/`ghostsystem` tags and never pad tags.
11. **No publishing, uploading, deleting archives or overwriting user work** without explicit authorisation; the ledger is not proof anything is live; preserve a dirty worktree; no broad resets.
12. **Report honestly**: what passed, what was rejected, what is unverified (human listening is pending on everything).

## Route the task

| You need to... | Read |
|---|---|
| Resume, see what's done/unfinished, known issues, owner decisions | [`references/current-state.md`](references/current-state.md) |
| Write/edit a script, apply the quality bar, verify three times, music/sfx rules, authoring gotchas | [`references/editorial-and-quality.md`](references/editorial-and-quality.md) |
| Understand packages, v2 vs v3, revision limits (3.3/3.4/3.5), modules, delivery files, superseded rules, legacy tools | [`references/architecture.md`](references/architecture.md) |
| Run commands, TTS/GPU, preview/render/remix, scheduling, ledger, uploaders, path constants | [`references/operations.md`](references/operations.md) |
| Draw/animate a mechanism, renderer values, highlight/caption looks, physics/attachment gates, v2 mechanisms | [`references/visual-system.md`](references/visual-system.md) |
| Shorts, CTA, gameplay composite, gameplay library and rights | [`references/shorts-and-brainrot.md`](references/shorts-and-brainrot.md) |
| Titles, descriptions, tags, thumbnails, photo sourcing/licences, Studio settings | [`references/metadata-and-thumbnails.md`](references/metadata-and-thumbnails.md) |
| Choose a topic, scoring schemes, pillars, 60-topic reservoir, competitor snapshot | [`references/topic-selection.md`](references/topic-selection.md) |
| Anything 3D / Blender / scenario / documentary / daily Shorts | [`references/production-3d.md`](references/production-3d.md) |

Cross-channel shared knowledge (voice stack, rendering, calendar, QA gates, environment) is in the skill-level `references/` (`voice-tts.md`, `rendering.md`, `audio-captions-music.md`, `release-calendar.md`, `qa-gates.md`).

## Where the live data and state live (repo root = `<repo>`)

- `hidden-everyday-systems/examples/<slug>/package.json` - editorial source of truth per topic; `render.*.json` generated timing; `examples/music-library.json`, `gameplay-library.json`.
- `hidden-everyday-systems/output/<slug>/` - deliverables, `QA-REPORT.json`; `output/catalog-order.json`.
- `hidden-everyday-systems/production-batches/<batch>/` - topic scripts, `references/<slug>/REFERENCE.md`, briefs; `production-3d/` - 3D items.
- `hidden-everyday-systems/release-calendar/` - `LEDGER.json` (the topic-repeat tracker and schedule), `schedule_release.py`, `<YYYY-MM>/<DD>/<slug>/upload-manifest.json`, `youtube-uploader/`.
- `hidden-everyday-systems/visual-system/` - Remotion compositions (`v3/` current); `renderer-public/` - fonts, textures, gameplay clips, narration mp3s, music; `assets/thumbnail-photos/` - licensed photos + provenance.
- Shared tools: `ai-video-factory/toolkit/` (renderer source, tts-dots, voicestudio, docker-compose). Python: `<repo>/.venv/Scripts/python.exe`.
- Original docs: `git show pre-skill-reduction:<path>` (e.g. `hidden-everyday-systems/PIPELINE-V3.md`).

## Commands (from `hidden-everyday-systems/`; PowerShell; `$py = "..\.venv\Scripts\python.exe"`)

```powershell
& $py production-batches\<batch>\topics\<topic>.py              # gates -> "valid", writes the package
& $py hidden_systems_production.py preview  --slugs <slug>        # silent proof stills
& $py hidden_systems_production.py audio    --slugs <slug>        # needs VoiceStudio (OmniVoice) or tts-hidden on :8005
& $py hidden_systems_production.py validate --slugs <slug>
& $py hidden_systems_production.py render   --slugs <slug>        # videos, thumbnails, delivery files, QA-REPORT.json
& $py hidden_systems_production.py remix    --slugs <slug>        # new soundtrack on existing frames
& $py hidden_systems_production.py rethumb  --slugs <slug>        # new title/thumbnail text, no re-render
& $py release-calendar\schedule_release.py <slug> YYYY-MM-DD 02:00|17:00
& $py ingest_gameplay_clips.py [folder]                           # register gameplay-background clips
```
(Preflight and Docker commands in `operations.md` run from the repo root; the block above runs from `hidden-everyday-systems/`.)
**Note:** media/renderer/TTS paths in the scripts were repointed to the new layout on 2026-11-01 (see `references/operations.md` s1). Run `ai-video-factory/scripts/preflight.ps1` and `nvidia-smi` before expensive generation.

## First moves when resuming

1. Read `references/current-state.md` (dated 2026-11-01). 2. Decide the line: 3D (default) or an owner-approved 2D action. 3. Check the ledger and `examples/` for repeats. 4. Check
GPU/VRAM consumers and which TTS service is up. 5. Never start by rendering or uploading: author and gate first, then preview, then narrate, then render, then human review.
