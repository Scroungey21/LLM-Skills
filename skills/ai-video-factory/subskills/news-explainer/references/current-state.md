# Current state (news-explainer) - snapshot 2026-11-01

Rebuilt from the on-disk ledger, calendar and upload-state files at the time the repo was reduced to the `ai-video-factory` skill. (The old skill's snapshot was 2026-09-01 and is superseded.) Update this file after material work: timestamp, what changed and why, QA done, exact safe next actions - and keep durable procedures in the topical references, not here.

## Repo/runtime state

- The orchestration app (`engine/`, `console/`, `tui/`, manifests, few-shot sets, design tokens) is **not in the working tree** - restore from git tag `pre-skill-reduction` (`pipeline-and-architecture.md` section 10). Toolkit (`ai-video-factory/toolkit/`) has `tts-dots`, `renderer`, `manifests`, compose (`tts` + profiles only).
- The channel pipeline has been **dormant since the 2026-09-11 batch**: no ledger entries after it, `technews/release-calendar/2026-10` and `2026-11` are scaffolded but empty. Nothing is in flight. The last engine code changes were 2026-09-04/05 (tempo 1.2, BGM recalibration, video preview + SRT parser + UI refresh); the old skill text was never updated after 2026-09-03.
- No Docker containers/services are assumed running; start only what the next operation needs. The user authorised Docker commands for YTtechnews scope only. Local LLMs may hold the 16 GB GPU - ask the user to unload, never kill.
- `technews/release-calendar/` and `technews/output/` are gitignored: ledger, packages and upload state exist only on disk - back up before experiments.

## Ledger (`technews/release-calendar/topic-history.json`, 15 entries)

| Slug | Niche | Status | Date / slot | Upload state (recorded in `upload-state.json`) |
|---|---|---|---|---|
| cyber-plc-ai-attacks | cybersecurity | scheduled | 2026-09-05 A | **skipped by user** ("had issues, do not upload") - not on the channel |
| garmin-fenix-9-pro | gadgets | scheduled | 2026-09-05 B | **skipped by user** (same note) |
| gpt-6-astra-critical-cyber | ai-security | scheduled | 2026-09-06 A | uploaded+scheduled (long/short ids recorded) |
| chrome-v8-zeroday-85046 | cyberattacks-zerodays | scheduled | 2026-09-06 B | uploaded+scheduled |
| amazon-ftc-ad-auction-lawsuit | corporate-startup-autopsies | scheduled | 2026-09-07 A | uploaded+scheduled |
| idscan-net-breach-153m | cyberattacks-zerodays | scheduled | 2026-09-07 B | uploaded+scheduled |
| sonicwall-sma1000-chained-rce | Cyberattacks & Zero-Days | scheduled | 2026-09-08 A | uploaded+scheduled |
| google-adx-antitrust-ruling | Corporate / Startup Autopsies | scheduled | 2026-09-08 B | uploaded+scheduled |
| ai-coding-agents-weaponized-ransomware | AI Security | scheduled | 2026-09-09 A | uploaded+scheduled |
| litellm-mcp-ai-infra-attacks | Cyberattacks & Zero-Days | scheduled | 2026-09-09 B | uploaded+scheduled |
| microsoft-maia-300-ai-chip | Weekly Tech Rundown | scheduled | 2026-09-10 A | uploaded+scheduled |
| nvidia-mediatek-nvlink-fusion-deal | Corporate / Startup Autopsies | scheduled | 2026-09-10 B | uploaded+scheduled |
| eu-ai-act-tech-sovereignty-package | Corporate / Startup Autopsies | scheduled | 2026-09-11 A | uploaded+scheduled |
| qualcomm-adreno-neural-fusion | Weekly Tech Rundown | scheduled | 2026-09-11 B | uploaded+scheduled |
| gemini-3-7-flash | ai-ml | **reviewed** (never placed on the calendar) | - | n/a |

Notes: niche labels are inconsistent across entries (keys vs display names) - harmless but normalise to `niches.key` going forward. `released` status is never written by any tool. A demo package `ai-agent-denial-of-wallet-loop` exists in `technews/output/test-productions/` (first production using `LoopGauge` + `CitationBadge`) but is **not in the ledger** - treat it as a component demo, not a scheduled release. 16 package folders exist under `test-productions/` (+ `_qa/` contact-sheet stills for the three original productions).
Hashes: the SHA-256 values in the old skill snapshot (render jobs 17-22) are **obsolete** - the three original productions were re-rendered as "2026-09-04-audio-v4" (render jobs 31-36: cyber 31/32, gemini 33/34, garmin 35/36). Use each calendar folder's `upload-manifest.json` `sha256` block or recompute with the validator.

## The three original reviewed exemplars (use as templates)

- `cyber-plc-ai-attacks` (niche 1; NSA/partner PLC advisory; full ~395 s, Short ~27 s at the first render; 33 scenes / 1,364 words deliberately expanded for beginner depth; one original suspicion GIF + one evidence card; primary source NSA joint PLC advisory).
- `gemini-3-7-flash` (niche 3; DeepMind product page + model card as sources; full ~144 s, Short ~28 s; no GIF).
- `garmin-fenix-9-pro` (niche 8; Garmin newsroom release; full ~123 s, Short ~25 s; no GIF).
Format of all: H.264 + 48 kHz stereo AAC; full 2560x1440, Short 1440x2560; thumbnails 1280x720. Later packages (e.g. qualcomm: full 173 s, Short 38 s, 1 source) follow the same layout.

## Settled decisions (do not relitigate - but note where a value is in conflict)

dots.tts SOAR + male `warm-informational` voice; deterministic seed/params; pitch-preserving tempo applied (value **1.2 per code since 2026-09-04; old skill said 1.5 - confirm with user, set explicitly**); project-owned ambient music at the recalibrated level (`duck_db 8.2 / swell_db 13.2`, not -32/-27); exact Short CTA; sources in both descriptions; evidence-led visuals; GIFs 0-3; 0.0 s head silence / 0.5 s tail / -14 LUFS; release slots 02:00 A / 17:00 B Morocco; ComfyUI photoreal thumbnails (2026-09-04); channel name LITMUS; no real-people likenesses in visuals; granular beginner-accessible cyber depth; never claim to evade YouTube detection.

## Open decisions and known issues

1. Tempo value (1.2 vs 1.5) and whether `WORDS_PER_MINUTE=225` should be re-calibrated to the chosen tempo.
2. Agent-is-the-LLM-layer vs the engine's model-API stages (`pipeline-and-architecture.md` section 8).
3. Sign-off tagline (R2); longer deep-dive format; thumbnail motif redesign (R7); QuoteCard vs no-likeness; unbuilt components/R-items (`creator-style-guide.md` section 7).
4. Independent-source rule and description chapter timestamps (R8/R9) not enforced/built.
5. Real-media ingestion (verified download, rights annotation, crop, timed clip) not built - evidence gate cannot be declared complete.
6. Phonetic-vs-display numeric dual fields not implemented (LITMUS rule 8 remains a flagged warning).
7. Two release-calendar trees (only `technews/release-calendar/` is authoritative).
8. The two 09-05 productions (cyber-plc, garmin) were skipped by the user for unspecified "issues" (the audio-v4 re-render in the ledger predates it); if re-used, re-QA from scratch and re-schedule with `--force`. `gemini-3-7-flash` never reached the calendar.
9. `AUTHORED_EXTRAS` in `schedule_release.py` is hand-maintained per slug.
10. Compose relocation: the toolkit compose no longer has `engine`/`console`; the original paths (`./technews/output`, `tts-dots/Dockerfile`, `console/Dockerfile`) assume the old repo root.

## Safe next actions

- To make a new video: lean mode (agent-written script + toolkit TTS + toolkit renderer) or restore the app; rebuild images from source first, run preflight, verify TTS model-info, audition one hook + one dense sentence, then Gate 1.
- To revise an existing video: new run identity / superseding revision, never delete rows or folders; re-schedule with `--force` and re-check hashes.
- To schedule/upload: `release-and-upload.md` checklist; uploads need the user's explicit go-ahead.
- Handoff to another model/harness: `external-harness.md`.
