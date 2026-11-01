# New-channel playbook

Compiled 2026-11-01. Absorbs the former `NEW-CHANNEL-PLAYBOOK.md` and extends it from two precedent channels to five, adding the
lessons from the owner's feedback memory and handoffs. Read it when standing up an Nth channel, adding a video type, or auditing what a
channel must decide for itself. It does not restate pipeline mechanics (exact flags, JSON schemas, workflow contents): those live in
code and in each subskill's `references/`, they change, and a second copy here would go stale. What it does: name the precedents,
name what is genuinely shared infrastructure to **reuse rather than reinvent**, and enumerate the decisions every channel has to make
for itself because the existing channels each made them differently, on purpose.

Related: [video-type-selector.md](video-type-selector.md) (is this really a new channel?) · [agent-principles.md](agent-principles.md) ·
[qa-gates.md](qa-gates.md) · [workflow.md](workflow.md) · [environment-setup.md](environment-setup.md).

## 1. Read the ownership rule first

- A channel is one directory at the repo root with **one owning agent conversation**; no other channel agent reads/edits/reuses its
  prompts, assets, ideas, pipeline or config, and it touches no other channel's directory. A new channel gets the same treatment:
  its own directory, its own ownership boundary, recorded in the repo's ownership list (`CLAUDE.md`) and in the skill router.
  Exceptions are recorded with date and scope (the only one: E871 read-only use of HES's release-calendar *folder structure*, 2026-10-04).
- This playbook is channel-agnostic; following it does not authorise touching any existing channel's directory.
- Today's channels: `technews/` (NEWS), `hidden-everyday-systems/` (HES), `material-trials/` (MT, added 2026-09-25), `etcherr871/`
  (E871, added 2026-10-04), `ambient-channel/` (AMB, fifth stream for the @etcherr871 YouTube channel; **not** in `CLAUDE.md`'s ownership table,
  **gitignored — no version control**, state in `HANDOFF.md`, files on `S:/ambient`).
  Subskills: [news-explainer](../subskills/news-explainer/SUBSKILL.md), [everyday-systems-explainer](../subskills/everyday-systems-explainer/SUBSKILL.md),
  [physics-simulation-shorts](../subskills/physics-simulation-shorts/SUBSKILL.md), [clip-card-shorts](../subskills/clip-card-shorts/SUBSKILL.md),
  [ambient-long-form](../subskills/ambient-long-form/SUBSKILL.md).

## 2. The five precedents: read all, pick none blindly

They are not "the simple one" and "the full one" you graduate between. They answered nearly every architectural question differently,
deliberately, for reasons specific to their content. Where they conflict (tempo-stretch policy, loudness, caption style, loudness
targets), neither is "correct" in general; each is correct for its own channel's goals. Read each subskill's architecture reference before
assuming any one answer is the default.

- **NEWS:** (archived) FastAPI + SQLite + Next.js approval UI with human gates, WhisperX forced alignment, pitch-preserving tempo stretch.
  Heaviest; right for fast-moving sourced news with human approval gates.
- **HES:** standalone CLI with no app/UI, flat `package.json` per topic, native-only TTS pacing, locally generated/modelled illustration.
  Right for slow, accuracy-critical, drawn explanations.
- **MT:** no narration; Blender/Taichi simulation, measured verdicts, a planner with novelty rules; weekly scheduled job.
- **E871:** found clips, agent-as-LLM review packets, card rendering, calendar of 4 slots/day.
- **AMB:** hours-long procedural/baked scenes, synthesised audio, chunked resumable renders, own venv and drive.

## 3. What is genuinely shared infrastructure: reuse it, don't fork it

Paths are the post-reduction layout (see [legacy-and-removed.md](legacy-and-removed.md)).

- **dots.tts image** (`ai-video-factory/toolkit/tts-dots/`: `server.py`, `Dockerfile`, `voices/`): one Docker image reused by every narrated
  channel. Each channel gets its **own Compose service** behind its own profile with its own host port and voice — never sharing a running
  instance (one GPU, one SOAR model in VRAM at a time). Pattern: `profiles: ["<channel-profile>"]`, distinct host port, distinct
  `DOTS_TTS_VOICE_ID` / `DOTS_TTS_REFERENCE_AUDIO` / `DOTS_TTS_REFERENCE_TEXT` / `DOTS_TTS_SEED`; see `toolkit/docker-compose.yml`'s `tts`
  (8004, default) vs `tts-hidden` (8005, profile `hidden-systems`) blocks. Bare `docker compose up` starts only `tts`.
- **VoiceStudio** (`toolkit/voicestudio/`, optional, added 2026-09-27): local voice lab (AGPL-3.0) behind the `voicestudio` profile, API/UI
  `http://127.0.0.1:3900`, key `VOICESTUDIO_API_KEY` in `.env`; engines OmniVoice (CC-BY-NC), VoxCPM2 (Apache-2.0), IndexTTS 2.5 (**never
  select: OOM-kills the container on this 15 GB host**). A channel adopts it for narration only through its own docs (HES did, 2026-10-05).
  Shares the GPU with the dots services.
- **Renderer** (`toolkit/renderer/`, Remotion/React/TypeScript): one package but **each channel bundles its own entry point**, not a shared
  `Root.tsx`. NEWS rendered from `src/index.ts` via `render-cli.mjs`; HES from its own `src/hidden-systems/index.ts`, invoked directly by
  its production script (bypassing `render-cli.mjs`); HES channel media (fonts, approved art, gameplay clips, music) lives in
  `hidden-everyday-systems/renderer-public/`. A new channel adds `src/<channel>/` with its own root and either its own small invocation
  script (HES style) or extends `render-cli.mjs` with an entry-point argument. Non-Remotion channels (MT, AMB, parts of E871) render with
  Blender/ffmpeg instead.
- **`release-catalog/`**: config-driven cross-channel calendar-browsing WPF app (config in `%APPDATA%\ReleaseCatalog\`, not the repo).
  Adding a channel = adding its `release-calendar/` root in the app's UI; no code change. Build: `dotnet build -c Release` in
  `release-catalog/ReleaseCatalog/`. See [release-catalog.md](release-catalog.md).
- **Python environments:** shared `<repo>/.venv/` (HES + E871; gitignored) ; MT has `material-trials/.venv/`; AMB uses `S:/ambient/venv` and
  must never pip-install into the shared one.
- **ComfyUI** (local install + FLUX.1-schnell-fp8): **archived out of the working tree**; only HES ever used it (the stopped 2D track).
  To use generative art for a new channel you must reprovision it ([legacy-and-removed.md](legacy-and-removed.md)); it is never a
  Compose service and never runs alongside TTS (shared GPU). Generative art is not mandatory — NEWS uses evidence media/components.
- **FFmpeg/FFprobe, Node + pnpm, `.env.example` and its provider-key table**; Docker + NVIDIA Container Toolkit for the TTS services.
  Install details: [environment-setup.md](environment-setup.md).
- **Release calendar convention:** `<channel>/release-calendar/<YYYY-MM>/<DD>[ (x)]/<slug>/` + `LEDGER.json` + `schedule_release.py`
  (HES-shaped; E871 mirrors it; MT uses the same day/slug nesting; NEWS stages under `technews/output/release-calendar/`). See
  [release-calendar.md](release-calendar.md).

## 4. Decisions every channel makes — and how all five answered

For a new channel, decide and **write down** each row in your own subskill's references (never silently inherit one precedent).

| Decision | NEWS | HES | MT | E871 | AMB |
|---|---|---|---|---|---|
| **Orchestration model** | (archived) FastAPI + SQLite (`Project`/`Script`/`RenderJob`...) + Next.js approval console + Textual TUI; tick-driven orchestrator | Standalone CLI `hidden_systems_production.py`, no DB; `package.json` per topic is the sole truth; 3D track uses `production-3d/` slates | Standalone CLI, no DB; `season/LEDGER.json` is the only state; Task Scheduler runs `weekly.py run` | Standalone CLI `clips.py` + SQLite `data/clips.db`; pauses for the agent's review file; resumable `run` | Engine scripts under `ambient-channel/engine/`; `full_render.py` resumable/checkpointed; state in `HANDOFF.md` |
| **Voice / TTS service** | dots.tts `warm-informational` via `tts` (8004) | OmniVoice clone via VoiceStudio (since 2026-10-05; 3D split Shorts o1 / longs vm5); dots `hidden-systems-informational` via `tts-hidden` (8005) as fallback | none (foley is the soundtrack) | none (clip's own audio) | none (synthesised audio) |
| **Pacing policy** | Native dots then pitch-preserving `NARRATION_TEMPO` (1.5 per docs, 1.2 code default) + WhisperX alignment | Native-only; 165-240 WPM gate; tempo-stretch and forced alignment banned | physics at 0.5x via solver `time_scale`; short result holds; no frame interpolation | n/a (2-60.5 s clip) | n/a (10 h, slow) |
| **Visual style** | Evidence cards, screenshots, CIS screens, React mechanism components; GIFs <= 3 | to-scale drawn mechanisms (2D, stopped) -> ZDF-style Blender 3D, faceless "you" character; highlight orange | Procedural geometry + Cycles; cyclorama, one hero apparatus | Found clip in a card (`xpost` default) or snap/meme edit styles | Blender-baked plates + procedural frame function; dim night grade |
| **Data model / editorial contract** | SQLite rows; Gate 1 (script) / Gate 2 (render) approvals | JSON claim ledger + source ledger + scene arrays per topic | one flat `spec.json` per episode (`family`, `scenario`, `rig`, materials) | `analysis.json` (fit, caption_job, edit, metadata) + `vibe.json` | scene name + seed + duration; audio scheduler |
| **Caption / motion behaviour** | Kinetic caption pages with active-word emphasis (no band flicker); visual change every 6-12 s | Montserrat white lowercase 1-3 word pops, no coloured word; fast ADHD rhythm; camera never out-and-back | one centred line, fades in/out on change; load bar optional | timed text in Shorts safe zone (`y` 0.10-0.78) | none |
| **Music / audio bed** | project-owned synthesised ambient, ducked ~ -32 dB | 13 licensed CC BY 4.0 beds levelled -18 LUFS, octave-band gate vs voice | none; recorded CC0 foley | calm CC0 bed only for silent clips (-24 / -30 LUFS) | synthesised only |
| **Loudness** | -14 LUFS +/- 1.5, TP -1.0 | -16 LUFS, TP -1.5, LRA 7 | -16 +/- 1 LUFS, TP <= -0.5 | -16 LUFS, TP -1.5, LRA 11 | -24 LUFS + startle margin |
| **Repeat-check / novelty ledger** | news cycle + scorer (no separate ledger found) | `release-calendar/LEDGER.json`, topic catalogue, authored packages | `season/novelty.py` + `HISTORY.md` + ledger fingerprints | `clips.db` URL/ID + dHash + `LEDGER.json` | idea CSVs / reports (no ledger yet) |
| **Research / evidence basis** | primary sources, claim-source ledger | claim IDs -> source IDs, `accuracy_scope`, real references to scale | measured simulation outputs | original-post link, `source.json` provenance | CC0 licences, reproducible data scripts |
| **Rights / provenance policy** | attribute evidence, fair-use note; original reaction GIFs | licensed photos, owner gameplay (`rights_basis`), CC BY beds with verbatim credit, `LICENSES.md` for 3D assets | CC0 foley with `LICENSES.csv`; no generative anything | owner takes rights; original link + credit always; **never stock** | CC0 Poly Haven scans via licence-logging fetch script |
| **Release path** | `technews/output/release-calendar/<YYYY-MM>/<DD>/` | `hidden-everyday-systems/release-calendar/<YYYY-MM>/<DD>[ (x)]/<slug>/` | `material-trials/release-calendar/<YYYY-MM>/<DD>/<slug>/` | `etcherr871/release-calendar/` mirroring HES | packaging per report-14, `long_video` key read by ReleaseCatalog |
| **Cadence (Africa/Casablanca)** | not fixed in sources | daily Short 17:00 + long every 3 days 20:00 (3D plan, from 2026-10-13); earlier 2/day 02:00/17:00 | Tue and Fri 17:00 (weekly build Sun 01:30) | 4/day: 09:00, 13:00, 17:00, 21:00 | open (may use E871 slots? undecided) |
| **Upload** | manual | manual (owner uploads; ledger != live) | manual, private by default, no uploader | manual | manual |
| **Quality-gate doc** | editorial standards + QA/release + LITMUS profile | editorial-and-quality + PIPELINE-V3 gates | `quality-gate.md` (QC suite + five visual rules) | `STANDARDS.md` + `RULES.md` | QC JSON + HANDOFF hard rules |
| **GPU / heavy deps** | TTS + WhisperX in containers; Remotion | VoiceStudio, Blender, ComfyUI (archived) | Blender Cycles, Taichi MPM (one GPU job at a time) | yt-dlp, ffmpeg, Frame Studio (external app) | Blender, NVENC, S: drive |
| **Python env / home of heavy files** | engine `.venv` (archived) | `<repo>/.venv/`; renderer media in `renderer-public/` | `material-trials/.venv/` | `<repo>/.venv/`; `data/`, `source-material/` | `S:/ambient/venv`; renders/caches under `S:/ambient` |

## 5. The checklist for a new channel (write each answer into the new subskill)

1. **Audience promise and format** — one sentence; why none of the five fits ([video-type-selector.md](video-type-selector.md)).
2. **Ownership** — directory name, owning agent conversation, entry in the router/ownership list, recorded exceptions.
3. **Voice + TTS service** — narrated or not. If narrated: new Compose service/profile/port, new voice id with reference wav+txt and a
   recorded provenance doc (`voices/<id>-provenance.json`: reference SHA, native-pacing/F0-distinctness/ASR round-trip review, rejected
   candidates), an **explicit pacing policy stated as a rule** (native-only or tempo-stretched), and the engine's licence checked.
4. **Visual style** — generative vs evidence/component vs simulation vs found-media. Write the equivalent of HES's art-direction section:
   a **concrete accept list and a concrete reject list**. "Make it look good" is not a gate.
5. **Caption / motion behaviour** — persistent vs pop-in, active-word granularity, page word count, motion cadence. HES's choices were the product
   of explicit review; don't assume they transfer.
6. **Music / audio** — your own library JSON (`schema_version`, `selection` rule, `mix_policy` with `relative_volume` + fade times, `tracks[]` each
   with recorded `license`, `license_url`, `attribution`, `source_url`) or "none"; decide the duck level under narration explicitly (the channels
   don't even agree); pick the loudness target.
7. **Editorial contract** — flat JSON package (HES), per-episode spec (MT), DB rows (NEWS) or review file (E871): list every field your format carries.
8. **Repeat-check / novelty ledger** — how do you know a subject/clip/scenario was already made, and which rules reject near-twins? Every shipped channel
   except NEWS has one; they exist because repetition was rejected by the owner.
9. **Rights and provenance policy** — what sources are allowed/banned (stock?), what gets credited, licence record format, who takes rights risk.
10. **Agent-as-LLM hand-offs** — any judgment step is a file hand-off with a written procedure doc ([agent-principles.md](agent-principles.md) §1).
11. **Release / delivery convention** — folder path, scheduler, slots, timezone, private-by-default manifest; add the root in `release-catalog` UI.
    Upload stays manual unless the owner builds and authorises an uploader.
12. **GPU coordination and heavy-file location** — what runs on the shared GPU, what lock files/ports, where multi-GB files and venvs live (H: is nearly full;
    S: holds AMB's), what is gitignored and therefore needs backup-before-edit.
13. **Quality gates** — numeric thresholds, which are automated, which need eyes, what gets rejected ([qa-gates.md](qa-gates.md) is the model).
14. **A dedicated subskill** — `subskills/<name>/SUBSKILL.md` + `references/` mirroring the "Route the task" structure: current-state/handoff doc,
    architecture doc, quality-gate doc, operations/runbook. Add it to the router and ownership list.
15. **First build by hand** — build one item manually and review it (incrementally, with the owner) before automating or scheduling.

## 6. Mistakes made in this repo — don't repeat them

- **Two copies of a skill doc drifted apart.** A personal out-of-repo managed-skill copy and the in-repo copy both existed; an edit
  landed in the personal copy first and the in-repo one went stale (kept a deleted `F:\` ComfyUI path for a day). The in-repo skill is canonical;
  sync personal copies from it, not the reverse.
- **Claimed independence that wasn't real.** Moving ComfyUI's app tree into the repo did not decouple its venv from an external Python
  (`pyvenv.cfg` `home=` still pointed outside the repo; and a later doc says that external copy no longer exists, so the venv is likely already broken).
  Verify a "self-contained now" claim against the actual config file before writing it down.
- **A doc restating volatile mechanics instead of pointing at the source.** Link to `docker-compose.yml`, the real workflow JSON or schema.
- **Concurrent builds clobbered the ledger.** MT: parallel builds overwrote each other's statuses; fix = re-read the ledger before every save
  (`weekly.update_entry`). Any shared state file needs read-modify-write discipline.
- **A preview is not proof.** Single-frame previews hid black fracture shards and missing motion blur; always inspect frames from the finished render.
- **Timing figures from overlapping jobs.** Never quote speed measured while other GPU/CPU jobs ran; frame-generation fps is not end-to-end speed.
- **Un-versioned work got lost.** `ambient-channel/` is gitignored; copy to a dated backup before editing; bump cache version names on look changes.
- **A batch built on an unreviewed approach.** HES: 16 videos rejected as unuploadable; build one, review, iterate.
- **Re-using a rig with new materials counts as repetition** (MT) — build the novelty gate before the catalogue grows.
- **Stale docs fighting live code.** HES `examples/README.md` kept mentioning Qwen3-TTS/Rubber Band after the dots-only/native design; when docs and code
  disagree, the code is authoritative — and fix the doc.
- **Usage limits.** Parallel agents hit usage limits mid-batch; resume from disk state rather than reloading agents. Design stages to be resumable.
- **Channel directories drifted out of the documented ownership list** (AMB isn't in `CLAUDE.md`; AGENTS.md says "two channels"). Update the router and
  ownership list in the same change as the new directory.
- **Shared GPU surprises:** the owner's own apps/containers (chat-stories TTS, Blender jobs) slow narration 5-10x and OOM-kill services; check VRAM first and never
  touch the owner's jobs.

## 7. Where to look next

- [video-type-selector.md](video-type-selector.md), [workflow.md](workflow.md), [qa-gates.md](qa-gates.md), [agent-principles.md](agent-principles.md).
- Tooling references (written separately): [voice-tts.md](voice-tts.md), [rendering.md](rendering.md), [audio-captions-music.md](audio-captions-music.md),
  [release-calendar.md](release-calendar.md), [release-catalog.md](release-catalog.md), [environment-setup.md](environment-setup.md).
- `toolkit/docker-compose.yml` — the concrete service/profile/env-var pattern for a new TTS voice.
- `toolkit/renderer/src/index.ts` vs `src/hidden-systems/index.ts` — the two Remotion entry-point patterns.
- The five subskills' `references/` — the real source of truth for mechanics.
