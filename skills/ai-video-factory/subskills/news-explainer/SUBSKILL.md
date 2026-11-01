---
name: news-explainer
description: Research, script, voice, render, QA, schedule and upload evidence-led tech-news videos (cybersecurity incidents and advisories, AI/ML model releases and papers, general/consumer technology, antitrust/policy) as a long-form video plus a vertical Short, for the YTtechnews channel (public name LITMUS, tagline "Every claim, traced to the source"). Use whenever the user wants a news or "what actually happened and how does it work" video about a current tech, cyber or AI story, wants to continue or diagnose the YTtechnews / LITMUS pipeline (dots.tts narration, Remotion CIS screens, Gate 1 script approval, Gate 2 render approval, release calendar, topic-history ledger), or asks about its sourcing, CTA, music, thumbnail or upload rules. Not for evergreen mechanism explainers (use everyday-systems-explainer).
---

# News explainer (YTtechnews / LITMUS)

Public brand: **LITMUS** (YouTube rejected the first pick "AXIOM"; the repo and the old skill still say "YTtechnews").
Promise: *every claim traced to the primary source*; casual, source-first, hype-free voice. Each topic ships as
**one full video (16:9) + one vertical Short (9:16) + `meta.json` + 1280x720 thumbnail**, scheduled on the channel's release calendar.

## When to use / not use

- Use: a *current* story (advisory, CVE, breach, model card/system card, product launch, filing, ruling) that can be tied to a
  primary source and explained mechanism-first for a smart non-specialist with a short attention span.
- Not for: timeless "how does X work" explainers (`everyday-systems-explainer`), physics sims, clip cards, ambient.
  Do not import HES rules here - HES uses native-only pacing, a different voice and different art rules.
- If the request is ambiguous about the channel, ask first; default to news-explainer only when it is clearly a news story.

## Pipeline, in order, with the gate at each step

1. **Topic + dedup.** Pick a story; check `technews/release-calendar/topic-history.json` (reject any candidate whose
   `source_url` or normalized topic is already `scheduled`/`released`; "reviewed" = produced but not yet placed). *Gate:* new source, fresh angle.
2. **Research -> claim ledger.** Primary sources first, secondary only for context/corroboration; every material claim, number,
   date and quote gets a URL; classify fact / vendor claim / reported claim / editorial inference; record the cutoff date.
   *Gate:* no unsourced material claim; discrepancies between sources resolved before scripting. -> `editorial-standards.md`
3. **Script (full + Short).** Hook, mechanism, caveat/twist after the mechanism is understood, sourced numbers + relatable
   comparison, useful takeaway. Beats of ~26 words (max 34), one visual idea each. Short = standalone rewrite ending with the exact CTA.
   *Gate:* read aloud; fact-check every high-risk claim against the ledger; cyber content has no exploit instructions.
4. **GATE 1 - human approves the script** (agent never auto-approves). Re-verify unstable facts immediately before audio.
5. **Narration.** dots.tts SOAR, voice `warm-informational`, dry output, then pitch-preserving tempo (`NARRATION_TEMPO`, currently 1.2).
   Audition one hook + one dense technical sentence before any batch. *Gate:* no crackle/metallic noise/dropped words/chunk seams. -> `audio-tts.md`
6. **Alignment + captions.** WhisperX word timing on the final timeline; fallback timing stays `needs_review`; SRT/VTT export.
7. **Visuals.** Evidence-led CIS screens (one screen per beat, explains/evidences the sentence). -> `visual-rendering.md`
8. **Render** with Remotion (30 fps; full 2560x1440, Short 1440x2560), mux H.264 24 Mbit CBR + AAC 192k/48 kHz, loudnorm -14 LUFS / -1 dBTP.
9. **Music bed + thumbnail + metadata** (sources in both descriptions, chapters, tags).
10. **GATE 2 - human approves the render** after objective QA + listening + frame inspection. -> `qa-release.md`
11. **Package + schedule** into `technews/release-calendar/<YYYY-MM>/<DD>/<slug>/`, update the ledger. -> `release-and-upload.md`
12. **Upload only with explicit user authorisation in that turn** (the uploader pauses before each final Schedule click by default).

## Non-negotiable invariants (settled - do not relitigate)

1. Accuracy and explanation outrank speed; never invent a product, model, benchmark, CVE, quote, image or official position.
   If a supplied source no longer resolves or conflicts with current authoritative material, stop and resolve it.
2. **Short ends with exactly** `if you want more details, check the full video in the description` (single constant `SHORTS_CTA`;
   any duplicated literal anywhere is a defect). Both full and Short descriptions contain every authoritative source URL; `meta.json.sources` lists them.
3. **dots.tts SOAR only**, synthetic male `warm-informational` house voice, deterministic seed 20260829. Legacy Chatterbox/Kokoro/Qwen3-TTS paths are inactive.
4. Tech-news applies a pitch-preserving tempo (`atempo`) after dry generation - this is deliberate and differs from HES (native-only).
   The *value* is an open conflict (1.2 in code since 2026-09-04, 1.5 in the old skill): see `audio-tts.md`; set it explicitly, never assume.
5. Music: project-owned generated ambient only (no third-party tracks claimed "no-copyright"), deterministic rotation, ducked under speech, never masks narration or the CTA.
6. Visuals directly explain or evidence the narration; no monotone deck of generic cards; never fabricate a screenshot or present generated imagery as evidence.
7. Reaction GIFs: 0 by default, hard cap 3 per full video, original assets only, never over harm/tragedy.
8. Cyber long-form is deliberately granular and beginner-accessible; never publish operational exploit code/payloads/weaponisation steps.
9. Never promise or claim guaranteed evasion of YouTube labelling/detection; the aim is clearly human-directed quality and honest disclosure compliance.
10. Approve nothing without inspecting the **final rendered MP4s** (JSON/manifests alone are not evidence). Do not substitute an old render or hand-edit provenance to pass a gate.
11. Gate 1 (script) and Gate 2 (render) are human decisions; no bulk-approve; no publish/upload/terminate-process/reset/clean without explicit authorisation.
12. Preserve the dirty worktree and user-owned artifacts. Never delete DB rows or delivery folders to force regeneration - use a new run identity/superseding revision.

## Route the task

| Task | Read |
|---|---|
| Continue work / what is done, scheduled, open | `references/current-state.md` |
| Research, claim ledger, script structure, cyber/AI/consumer standards, titles, descriptions, sourcing rigor | `references/editorial-standards.md` |
| Voice/tone, hook techniques, sentence rhythm, component choice, thumbnail identity, benchmark-channel findings | `references/creator-style-guide.md` |
| Architecture, services, ports, env vars, data model, prompt registry + regression gating, niches/archetypes, restoring the app from git | `references/pipeline-and-architecture.md` |
| Step-by-step production commands, production-definition shape, package layout | `references/production-runbook.md` |
| dots.tts contract, tempo, alignment, captions, music ducking, loudness | `references/audio-tts.md` |
| CIS components + limits, evidence imagery, GIFs, motion, thumbnails, render contract | `references/visual-rendering.md` |
| Completion gates, the nine LITMUS QC rules + commands, completion report | `references/qa-release.md` |
| Release calendar, ledger, slots, scheduler, uploader, descriptions, tags | `references/release-and-upload.md` |
| Something failed or stalled | `references/troubleshooting.md` |
| Handing the work to another model/harness | `references/external-harness.md` |

## Where the live channel data lives (repo root; paths relative to it)

| What | Path |
|---|---|
| Release calendar (canonical, populated), scheduler, ledger | `technews/release-calendar/` (`<YYYY-MM>/<DD>[ (x)]/<slug>/`, `schedule_release.py`, `topic-history.json`, `UPLOAD_TIMING.md`) |
| Studio uploader (Puppeteer, own Chrome profile) | `technews/release-calendar/youtube-uploader/` (`CHANNEL_SETUP.md`, `channel-id.json`) |
| Produced packages | `technews/output/test-productions/<slug>/` (and `technews/output/<niche>/<theme>/<title--render-job-id>/`) |
| Channel identity (avatar, banner, description, manifest) | `technews/output/channel-*.png`, `channel-identity-manifest.json`, `channel-description.md` |
| Thumbnail subject-art workflow example | `technews/examples/comfyui/thumbnail-subject-workflow.json` |
| Engine auto-scaffold calendar (empty day folders only) | `technews/output/release-calendar/` - NOT authoritative |

`technews/release-calendar/` and `technews/output/` are **gitignored** - the ledger and packages exist only on disk. Back them up before risky operations.
The engine/console/TUI app, manifests, few-shot sets and design tokens are removed from the working tree; restore from git tag
`pre-skill-reduction` (see `pipeline-and-architecture.md`). Bundled tools: `ai-video-factory/toolkit/` (tts-dots, renderer, manifests, compose).

## Commands (repo root, PowerShell)

```powershell
# environment + channel check (read-only)
pwsh -File ai-video-factory/scripts/preflight.ps1
nvidia-smi                                             # one GPU: check VRAM before TTS / WhisperX / ComfyUI
# start narration (never alongside tts-hidden / voicestudio / ComfyUI)
docker compose -f ai-video-factory/toolkit/docker-compose.yml up -d tts
Invoke-RestMethod http://localhost:8004/api/model-info | ConvertFrom-Json
# validate finished packages (ffprobe, CTA, source URLs, 1280x720 thumbnail, SHA-256)
pwsh -File ai-video-factory/scripts/validate-deliverables.ps1 -OutputRoot technews\output\test-productions -Slugs <slug1>,<slug2>
# place a QA'd package on the calendar (dedup-guarded)
.\.venv\Scripts\python.exe technews\release-calendar\schedule_release.py technews\output\test-productions\<slug> <YYYY-MM-DD> <A|B> --topic "..." --source-url "..." --niche "..."
```

Full-pipeline commands (engine producer, captions export, thumbnail scripts) need the restored app - see `production-runbook.md`.

## Completion discipline

Files existing is not enough. Confirm current provenance, source URLs, exact CTA, audio intelligibility, music level, caption
alignment, representative frames across the whole timeline, aspect ratio/codecs, thumbnail legibility at 10-15% scale,
metadata validity and fresh hashes/sizes. Report limitations honestly (what passed, what was rejected, what was not verified,
e.g. human listening outstanding). Never state a platform-classification outcome as guaranteed.
