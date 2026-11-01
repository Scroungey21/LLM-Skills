---
name: ai-video-factory
description: Plan, produce, QA and schedule AI-assisted YouTube videos of any type, including tech-news explainers, everyday-mechanism explainers (2D/Blender 3D), physics-simulation Shorts, found-clip caption-card Shorts, 10-hour ambient videos, and theme formats (horror stories, manga/webtoon recaps, themed news niches, chat-story videos, stickman storyboards, social-clip factories). Bundles pipelines, quality gates, a toolkit (dots.tts server, Remotion, VoiceStudio client) and release-calendar tooling. Use whenever the user wants to make, script, voice, render, review, schedule or upload a video or Short, start a channel or format in any theme, resume YTtechnews, Hidden Everyday Systems, Material Trials, Etcherr871 or the ambient channel, or asks about narration cadence, captions, thumbnails, topic de-duplication or video QA, even without naming a tool.
---

# AI Video Factory

One skill for making any kind of AI-assisted video. It is the compacted knowledge of five production channels,
the scenario/theme research the repo also holds (horror, manga recap, chat stories, stickman storyboards, social-clip factories, themed news niches),
and the tools they share. Pick the **video type or theme**, load that **subskill**, and follow its pipeline and gates.
Subskills come in two kinds: **channel subskills** (a live channel with data in a repo-root folder) and **theme subskills** (a reusable scenario with research, schemas and gates, to start a NEW channel from; some were implemented in the archived technews app and are restorable from git tag `pre-skill-reduction`).
Shared, type-agnostic knowledge lives in `references/`; runnable tools live in `toolkit/`.

The repo this came from keeps only the channel folders (the data/state), `release-catalog/` and this skill
at its root. Everything else was folded in here.

## 1. Pick the video type

| The user wants… | Subskill | Channel data folder (repo root) |
|---|---|---|
| Cyber / AI-ML / general tech-news long-form + Shorts with sources and human approval gates | [`subskills/news-explainer/`](subskills/news-explainer/SUBSKILL.md) | `technews/` |
| "How does this ordinary object / infrastructure actually work" explainers — code-drawn 2D mechanism animation or the Blender 3D line; long + Short + gameplay-background Short | [`subskills/everyday-systems-explainer/`](subskills/everyday-systems-explainer/SUBSKILL.md) | `hidden-everyday-systems/` |
| Satisfying physics-simulation Shorts (Blender / Taichi MPM) + long-form compilations, weekly automated job | [`subskills/physics-simulation-shorts/`](subskills/physics-simulation-shorts/SUBSKILL.md) | `material-trials/` |
| Found real-world clips placed in a fake-post "Frame Studio" card with a one-line caption (Shorts) | [`subskills/clip-card-shorts/`](subskills/clip-card-shorts/SUBSKILL.md) | `etcherr871/` |
| 10-hour ambient videos (roommate typing, marble machine, …) and quizzes | [`subskills/ambient-long-form/`](subskills/ambient-long-form/SUBSKILL.md) | `ambient-channel/` (heavy files on `S:/ambient`) |
| **Theme:** horror / creepypasta / scary-story narration (long + vertical Shorts) | [`subskills/horror-story-videos/`](subskills/horror-story-videos/SUBSKILL.md) | none yet (new channel) |
| **Theme:** manga / manhwa / webtoon recap videos | [`subskills/manga-recap/`](subskills/manga-recap/SUBSKILL.md) | none yet (new channel) |
| **Theme:** a themed niche for evidence-led explainers (cyberattacks/zero-days, AI security, AI-ML papers, infra failures, startup autopsies, fraud/retractions, tech myths, retrospectives, weekly rundown) or defining a new niche | [`subskills/themed-news-niches/`](subskills/themed-news-niches/SUBSKILL.md) | `technews/` |
| **Theme:** texting / chat-story fiction videos (fake messaging UI, voiced, gameplay background) | [`subskills/chat-story-videos/`](subskills/chat-story-videos/SUBSKILL.md) | `hidden-everyday-systems/chat-stories/` |
| **Theme:** stickman / whiteboard scenario-storyboard videos (local-first storyboard → render system) | [`subskills/stickman-storyboard-videos/`](subskills/stickman-storyboard-videos/SUBSKILL.md) | none yet |
| **Theme:** social / meme / compilation Shorts factory with rights + approval gates across several channels | [`subskills/social-clip-shorts-factory/`](subskills/social-clip-shorts-factory/SUBSKILL.md) | none yet (hand-reviewed sibling: Etcherr871) |
| Something that fits none of these | [`references/new-channel-playbook.md`](references/new-channel-playbook.md) after [`references/video-type-selector.md`](references/video-type-selector.md) | create a new `<channel>/` folder |

Each subskill's entry file is named `SUBSKILL.md` (not `SKILL.md`) so this package stays a single installable skill; read it as that subskill's instructions.

If the request is ambiguous about which channel it targets, ask before acting. Never mix channels: each has its own
voice, rules, ledger and release calendar, and a decision made for one is not a decision for another.

## 2. Universal workflow (details in `references/workflow.md`)

Topic choice + repeat check against the channel ledger → research with claim→source mapping → script to the
channel's length/cadence targets → narration → visuals → render → objective QA + human listening/viewing →
metadata/thumbnail → release-calendar scheduling → post-release learning. Every subskill specialises these stages
and names the gate at each one. A stage whose gate has not passed is not done — "files exist" is not "done".

## 3. Shared references (read the one you need)

| Need | File |
|---|---|
| Stage-by-stage pipeline abstracted from all channels | [`references/workflow.md`](references/workflow.md) |
| Choosing a video type / when to start a new channel | [`references/video-type-selector.md`](references/video-type-selector.md) |
| Cross-channel rules: agent is the LLM layer, no stock footage, no diffusion for physics, rights, no unauthorised publishing | [`references/agent-principles.md`](references/agent-principles.md) |
| Consolidated catalogue of quality gates and thresholds | [`references/qa-gates.md`](references/qa-gates.md) |
| Narration: dots.tts SOAR, house voices, GPU rule, VoiceStudio | [`references/voice-tts.md`](references/voice-tts.md) |
| Rendering: Remotion, ffmpeg, fonts, thumbnails | [`references/rendering.md`](references/rendering.md) |
| Captions, loudness, music/SFX policy | [`references/audio-captions-music.md`](references/audio-captions-music.md) |
| Release calendar, LEDGER.json, uploader | [`references/release-calendar.md`](references/release-calendar.md) |
| The `release-catalog/` desktop app | [`references/release-catalog.md`](references/release-catalog.md) |
| Installing/providing the toolchain | [`references/environment-setup.md`](references/environment-setup.md) |
| Every theme/scenario we have research or tooling for, with evidence, risk and owner subskill | [`references/theme-catalog.md`](references/theme-catalog.md) |
| Creative Illustration Separation (CIS) for illustration-led videos (horror, manga, news) | [`references/creative-illustration-separation.md`](references/creative-illustration-separation.md) |
| Designing a brand-new channel | [`references/new-channel-playbook.md`](references/new-channel-playbook.md) |
| What was removed from the old repo and how to get it back | [`references/legacy-and-removed.md`](references/legacy-and-removed.md) |

## 4. Toolkit and scripts

- `toolkit/tts-dots/` — dots.tts SOAR narration server, Dockerfile, reviewed house voices (with provenance).
- `toolkit/docker-compose.yml` — `tts`, `tts-hidden` (never both at once — one GPU), optional `voicestudio`.
- `toolkit/voicestudio/` — VoiceStudio API client + notes.
- `toolkit/renderer/` + `toolkit/manifests/` — Remotion project (source only; run `pnpm install` first). Channel media lives with the channel (`hidden-everyday-systems/renderer-public/`).
- `scripts/preflight.ps1` — read-only environment/channel check; run it when entering an unfamiliar machine or before expensive generation.
- `scripts/validate-deliverables.ps1` — ffprobe/CTA/source-URL validation of news-explainer deliverables.

## 5. Standing rules (apply to every video type)

1. **Preserve user work.** Trees here are dirty and hold irreplaceable media; never run broad resets/cleanups, and never delete archived assets.
2. **Never publish, upload, delete or overwrite** without explicit authorisation from the user in that turn.
3. **The agent is the LLM layer.** Do not build model-API backends into pipelines; write hand-off packets and review them yourself.
4. **Gates are not negotiable by stretching.** A failed cadence/quality gate means reject the take and regenerate, never time-stretch, speed-up or hand-edit provenance to make it pass.
5. **Report honestly:** what passed, what was rejected, what was not verified (e.g. human listening still outstanding).
6. **Back up before editing** state you cannot regenerate (ledgers, ambient engine, voices).
7. **One GPU:** TTS, ComfyUI/Blender and VoiceStudio compete for VRAM — check before starting any of them.
