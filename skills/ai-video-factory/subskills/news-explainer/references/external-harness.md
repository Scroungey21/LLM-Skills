# Handing work to another model or harness (news-explainer)

The repository and (if the app was restored) its Docker `engine_data` volume are the working state. The skill records decisions and navigation; it does not duplicate the multi-gigabyte media or the SQLite volume.

## Minimum context for the receiving model

1. `ai-video-factory/SKILL.md` -> `subskills/news-explainer/SUBSKILL.md` (invariants, pipeline, gates).
2. `references/current-state.md` (what is done/scheduled/open, dated).
3. Only the topical references needed for the next action (see the SKILL route table).
4. Inspect the concrete source/config rather than relying on chat memory: `docker-compose.yml` env defaults, `.env` *keys* (never print values), `technews/release-calendar/topic-history.json`, the package folders, and - if restored - `engine/app/{audio,render,synthesis}`.
5. Run `pwsh -File ai-video-factory/scripts/preflight.ps1` before any mutation or generation.

## Install/load in another harness

- Harness with skill folders: put `ai-video-factory/` in its skills directory so `SKILL.md` stays at the skill root; invoke `ai-video-factory` and let it route to `news-explainer`.
- No skill mechanism: give the model the router `SKILL.md` and the `SUBSKILL.md` of `subskills/news-explainer/` as the governing instructions plus `current-state.md` and the references for the next task.
- Access needed: read/write on the repo; for media generation, Docker Desktop + NVIDIA GPU + FFmpeg/FFprobe + Node 22.6+ (renderer) + the shared `.venv`. Changing harness on the same machine: reuse the checkout and Docker volumes (do not copy outputs or the HF model cache). Moving machines: migrate the full repo including **untracked/gitignored** trees (`technews/output/`, `technews/release-calendar/` incl. `topic-history.json` and `upload-state.json` files), the `engine_data` volume and optionally the Hugging Face model-cache volume; rebuild images from source (never trust an old hot-patched container); re-run `npm run login` for the uploader (its Chrome profile is machine-local and the login is human-only).
- **Secrets never go into the skill or a handoff**: recreate credentials via the destination's secret/environment mechanism (`.env` keys: provider keys, `DISCORD_WEBHOOK_URL`, `VOICESTUDIO_API_KEY`).

## Ground-truth rules for the receiver

- The user's latest instruction wins. Do not relitigate settled choices: dots.tts, male house voice, pitch-preserving tempo (confirm the value), sources in both descriptions, exact Short CTA, quiet rotating generated music, evidence-led visuals, 0-3 GIFs, release slots, beginner-accessible cyber depth.
- Do not import Hidden Everyday Systems rules (native-only pacing etc.) into news, or the reverse.
- Verify unstable external facts against current authoritative sources before using them.
- Preserve the dirty worktree and user processes; no broad Git cleanup/reset/checkout/delete.
- Docker commands are authorised only for YTtechnews scope; publishing/uploading is never authorised implicitly.
- The agent is the LLM layer (repo-wide rule): when handing editorial stages to another model, use file hand-off packets (script JSON + claim ledger) that the reviewing agent reads itself; do not wire a new model-API backend.

## Recommended first response from the receiver

State that the skill and current-state were loaded, name the exact next task, report whether Docker/GPU/preflight are healthy, and proceed. Do not ask the user to repeat decisions captured here.

## Updating the skill after material work

Edit `references/current-state.md` with: timestamp/timezone; active/stopped services and image/source parity; production slugs, IDs and output paths; runtimes, dimensions, byte sizes, SHA-256 hashes; changed settings and why; completed QA and remaining review flags; exact safe next actions. Keep durable procedures in their topical reference rather than a chronological log.

## Handoff honesty

This skill is operationally faithful for the repository state and decisions recorded at its snapshot; it is not a verbatim recovery of earlier discussion. If an unrecorded detail conflicts with present code/artifacts, inspect the evidence and ask only when the decision materially changes the outcome. Where this skill records a conflict (tempo, music level, lead/tail, thumbnail method, evidence-card default), the resolution stated there is the working default and the user can overrule it.
