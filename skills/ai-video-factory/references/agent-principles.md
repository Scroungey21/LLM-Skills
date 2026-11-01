# Agent principles (cross-channel rules)

Status: compiled 2026-11-01 from the repo's CLAUDE.md, AGENTS.md, ONBOARDING.md, NEW-CHANNEL-PLAYBOOK.md,
the owner's feedback memory and every channel's standing rules. These are the rules every agent follows, whichever
video type it works on. Each rule carries its **scope** (which channels it binds), its **reason** (so you can apply it to
cases not listed) and its **date/owner** where one exists. Owner decisions are not relitigated; changing one is the
owner's call and gets recorded with a date.

Scope key: ALL = every channel and any new one. NEWS = `technews/` (YTtechnews). HES = `hidden-everyday-systems/`
(GhostSystem / "Hidden Everyday Systems"). MT = `material-trials/` (physics sims). E871 = `etcherr871/` (clip cards).
AMB = `ambient-channel/` (10 h ambient + quizzes for the @etcherr871 YouTube channel).

Detailed gates: [qa-gates.md](qa-gates.md). Pipeline order: [workflow.md](workflow.md). New channel: [new-channel-playbook.md](new-channel-playbook.md).

---

## 1. The agent is the LLM layer (ALL new pipelines) — owner, 2026-10-04

- **Rule.** Never build a model-API backend (Gemini, Anthropic, OpenCode Zen, LM Studio, Ollama, any vision API) into a
  pipeline. Any "AI step" is a **file hand-off**: the code writes a review packet (e.g. `sheet.jpg` contact sheet +
  `request.json`), pauses, the agent (Claude, you) reads it and writes the decision as a file (`analysis.json`), and
  the code **validates and gates** that file, then resumes on re-run. Document the procedure in a runbook
  (E871's is `etcherr871/docs/AGENT-REVIEW.md`; see [../subskills/clip-card-shorts/SUBSKILL.md](../subskills/clip-card-shorts/SUBSKILL.md)).
- **Why.** The owner wants the agent's own judgment in the loop, not a separately billed or separately configured model
  service; at the time the `.env` keys were also dead (Google key invalid, Anthropic out of credits).
- **How to apply.** Schema-validate the agent's file at ingest (missing field, <3 captions, bad enum, unknown id -> the
  file waits for a fix). Reject placeholders honestly: rejects still need every field so the record is complete.
  Mark what you cannot see (audio-only jokes, possibly cropped text) instead of guessing in the clip's favour.
- **Recorded exception — the archived technews engine.** The old FastAPI engine (tag `pre-skill-reduction`) called
  OpenCode Zen and other providers for scorer / scriptwriter / editor / fact-checker (`.env` keys; `update_routing.py`
  re-pointed its `llm_task_routing` rows to an "OMP orchestrator" provider). It predates this rule. Anyone who restores it
  must decide per stage whether to keep the API or convert it to hand-off packets; do not silently extend the API pattern
  to new channels. See [legacy-and-removed.md](legacy-and-removed.md).

## 2. Never stock footage (E871 — absolute; owner 2026-10-04: "NEVER use stock footage, NEVEEEEER")

- **Scope: E871.** Covers stock, b-roll, royalty-free or library clips (Pexels, Pixabay, Shutterstock, Pond5, Storyblocks,
  Envato, Getty/iStock, Adobe Stock, Artgrid, Videvo, Mixkit...), footage carrying a stock-site or agency watermark, and
  polished generic shots with no real moment — in clips, memes and thumbnails, no exceptions, no "just this once".
  "Looks like stock" counts as stock (R0b: polished broadcast, arena, agency or pro-photography footage is rejected even
  when it shows a real moment). When unsure, treat it as stock.
- **Why.** The channel's value is real moments someone actually filmed; stock is the opposite of that.
- **Three enforcement layers — keep all three working:** (1) `is_stock()` filter at discovery in `mc/sources.py` (also
  refuses `clips.py add`); (2) the `stock_footage` review gate — ingest rejects it unconditionally; (3) never mark a source
  verified if it serves stock (`docs/SOURCES.md`).
- **Other channels.** The rule is not stated for NEWS/HES/MT/AMB, which use their own rights-checked media (NEWS: attributed
  evidence screenshots/product imagery; HES: licensed photos from local copies + the owner's own gameplay footage;
  MT: only simulated frames; AMB: CC0 scans). Do not assume "stock is fine there" — check that channel's own rule first.

## 3. No diffusion / generative media where the channel's identity depends on it

- **MT (owner 2026-09-25: "properly ... with blender and other tools, no diffusion").** No AI video, no diffusion-generated
  3D assets (TRELLIS/Hunyuan/TripoSG), no generative SFX (Stable Audio). Geometry is procedural, motion is computed physics,
  frames come from Blender Cycles, sound is recorded CC0 foley placed on simulated events. Drop any roadmap item that needs a
  generative model. **Why:** the channel's identity and its YouTube "not AI-generated" metadata claim (`containsSyntheticMedia: false`)
  depend on every frame being a real computed simulation.
- **HES.** No diffusion-generated *video*, no anatomical warping or sliding contact points; the old ComfyUI FLUX still-image
  atlas was the 2D era (stopped 2026-10-10); the current track is Blender 3D. Natural subjects use reviewed photographic stills.
- **AMB.** Audio is synthesised only; textures/models are real CC0 photo scans (Poly Haven) fetched only through
  `engine/fetch_textures.py`, which writes the licence log.
- **General.** If a channel's trust claim is "real/computed", encode the exclusion as a rule *and* a gate (e.g. QC rejects
  "any frame that isn't rendered from a simulation").

## 4. Rights, provenance and honest labelling (ALL; specifics per channel)

- **Every audio/visual asset has a recorded source + licence.** Music tracks: file, `license`, `license_url`, `attribution`,
  `source_url` in a library JSON (HES `music-library.json`, E871 `music/catalog.json`). SFX: `LICENSES.csv` (MT). Textures
  and 3D assets: `LICENSES.json` / `3Dassets/LICENSES.md`. **Why:** Content ID claims and takedowns are answered from this
  record; unrecorded assets are unusable.
- **Credit text goes in the description verbatim.** Kevin MacLeod / Scott Buckley run Content ID and clear claims only from
  their exact credit; QA's `music_credit` check fails a delivery whose description lacks it (HES).
- **Never spend money or accept a licence you were not given.** The owner skipped a track that "now costs $1 minimum — never
  buy without asking" (HES). Downloading permissive, account-free assets was approved once for 3D assets; anything beyond
  needs asking.
- **Licence beats taste.** Music for E871 must be CC0/public domain, calm (measured energy <= 6.0), and never Kevin MacLeod /
  incompetech. A voice engine's licence is a decision input: OmniVoice weights are CC-BY-NC (non-commercial); on 2026-10-12
  the owner chose to **prefer a commercial engine** (VoxCPM2, Apache-2.0) for new voices — yet on 2026-10-18 picked the
  OmniVoice clone "o1" for HES daily Shorts. These two decisions are in tension; flag it to the owner before monetised use
  rather than resolving it yourself.
- **Voices must be synthetic and non-impersonating - the intent; the current state is NOT fully compliant.** The rule is that house voices
  are generated/cloned only from references the channel owns or has permission for. But `warm-informational` (also the HES voice by owner decision)
  was cloned from an identifiable real person's clip without consent (owner accepted the risk 2026-09-03; see `voice-tts.md`), and both dots.tts
  compose services default to it. Do not reuse it for new channels (horror, manga recap, etc.); use a licensable or self-generated reference
  (e.g. VoxCPM2 via VoiceStudio). Keep a provenance JSON (`tts-dots/voices/<id>-provenance.json`: reference SHA, review results). No reverb,
  enhancement, denoise or hidden effects on the narration.
- **Found-clip rights (E871).** Owner decision 2026-10-04: any publicly reachable video may be fetched and used; the owner
  takes the rights risk; the credit link is the owner's chosen practice. So do not re-argue copyright — but **always** put
  `Original video: <url>` (+ `Credit: <uploader> (<platform>)`) in the description, one source posted at most once.
- **Imitation.** Copy format mechanics and production logic, never another creator's script, artwork, thumbnail or scene
  sequence (Stickman handoff; HES "ZDF-style" means look/pacing study, not reuse). The owner's references (Zack D. Films, The
  Why Side, ZDF) are style studies.
- **Honest labelling.** Never promise or claim guaranteed evasion of YouTube labelling or detection systems; aim for
  clearly human-directed quality and honest compliance with disclosure rules (NEWS playbook). MT sets
  `containsSyntheticMedia` false because the clips are stylised CG simulations, not realistic AI media — keep that field
  truthful per channel.
- **Never fabricate evidence.** No invented products, benchmarks, vulnerabilities, quotes, screenshots, or "illustrative"
  imagery passed off as documentary evidence; never universalise a representative system (HES `accuracy_scope`).

## 5. Do not publish, upload, schedule-live, or delete without explicit authorization (ALL)

- **Publishing/uploading is a human step.** Pipelines stop at the release-calendar folder with private-by-default manifests
  (MT, E871, HES). There is no uploader for MT; HES's uploader dir exists but is not to be run without being asked. The owner
  uploads; **the ledger is not proof of what is live** (HES, 2026-10-10) — ask before assuming a slot's state, and never add
  to slots the owner says are already uploaded (HES Oct 13-15).
- **Don't silently publish a past slot.** E.g. a release time that has already passed is reported, not "caught up".
- **Deleting archived assets, terminating user processes, overwriting user work: only when explicitly authorized.**
- **Owner-codified pipeline deletions are not agent-initiated deletions.** E871 R15c deletes *rejected* originals by design;
  the legacy ShortsFactory physically deleted religious-harm-flagged media inside configured intake roots (with an audit
  line first). Those are documented, narrow, owner-chosen steps inside the pipeline. An agent never extends them to
  other files or invents new deletion steps.
- **Docker/GPU commands are authorised per channel scope only** (NEWS: "Docker commands authorized for YTtechnews; does not
  extend to unrelated containers or processes").

## 6. Preserve user work in a dirty tree (ALL)

- Assume the worktree contains substantial unrelated, uncommitted user work. **Never** run broad `git reset`, `git clean`,
  `git checkout -- .`, mass formatters or "tidy up" deletions. Inspect and edit only your subsystem. Check `git status` first
  and say what you leave untouched.
- Do not terminate unrelated processes. If a local LLM is hogging the GPU, **ask the user to unload it** rather than killing it.
  The user's own Blender jobs (e.g. in `S:/ambient`) share the GPU: never touch them, never run alongside them, wait for them.
- Do not hand-edit provenance JSON, hashes, ledgers or staged `video.short.mp4` to make a gate pass. **Regenerate** (re-render,
  then re-run the scheduler so the manifest sha256 stays true; E871 R18). Existing stale artifacts are not "current" — never
  present an old render as the finished revision.
- Never put `.env` secrets into a skill, handoff or chat. Recreate credentials through the harness's secret mechanism.

## 7. Backup before edit; canonical copy discipline (ALL; mandatory for gitignored work)

- **`ambient-channel/` is gitignored (`.gitignore:134`) and has no version control.** Before editing its engine or report
  files, copy them to a dated folder `S:/ambient/backup_<YYYY-MM-DD>/` (with a `NOTE.txt` saying what the original was).
  Cache dirs are versioned by name — bump the version whenever the look changes, because existing files are skipped; keep the
  previous sprite/tile set for rollback.
- **Anything gitignored or outside the repo** (channel `output/`, `renderer-public` heavy media, S: drives) — copy first,
  then edit. **Why:** work there is easy to lose and the H: drive is nearly full, so recovery by regeneration may be impossible.
- **One canonical copy of a doc.** In the past a personal out-of-repo copy of a skill was edited first and the in-repo copy
  went stale (kept a deleted `F:\` ComfyUI path for a day). The skill in the repo is canonical; sync personal copies *from* it.
- **Don't re-describe volatile mechanics.** Link to `docker-compose.yml`, the schema file or the workflow JSON instead of
  writing prose that will go stale. **Verify "self-contained now" claims against the real config** (ComfyUI's `pyvenv.cfg`
  `home=` still pointed at an external Python after "moving it into the repo").

## 8. Honest completion reports (ALL)

- Files existing is not completion. Before saying "done": regenerate provenance, run validation, check the final render
  (not only JSON — see [qa-gates.md](qa-gates.md) "validate through the rendered video"), listen, inspect frames, confirm
  descriptions/sources/credits, and report **what you could not check** (you cannot hear audio: "human listening still required").
- Report with absolute clickable paths, measured runtimes, resolutions, codecs, loudness numbers, source coverage, hashes
  where a handoff needs them, rejected takes and known limitations. Say "not verified" when it is not.
- **Never quote timings measured while other GPU/CPU jobs ran as speed figures**; frame-generation fps is not end-to-end
  speed; check filename-to-number pairing before reporting (AMB). Do not weaken or reword a gate to turn red green; fix the
  cause. If a gate looks wrong, prove it (break an input on purpose and see it fail) and tell the owner.
- **A preview is not proof.** MT: single-frame previews render without motion blur and with persistent data quirks; after any
  fracture/visibility change extract frames from the finished clean master. HES: previews are step 2 of three verifications.
- **Reviews are incremental.** The owner reviews one video, reports, iterates ("redo one video, report"). Do not batch 16 videos
  on an unreviewed approach: the 2026-09-26 HES batch of 16 was rejected as unuploadable and redone.

## 9. Ownership discipline (ALL; recorded per channel)

- **One agent conversation owns one channel directory; the others never touch it.** The split is "settled — do not relitigate".
  `technews/`, `hidden-everyday-systems/`, `material-trials/`, `etcherr871/` are each owned by their own agent conversation.
  `ambient-channel/` is the fifth stream: it is **not** in the original CLAUDE.md ownership table, is gitignored, belongs to the
  @etcherr871 YouTube channel's long-form line, and its handoff says never write under the other four channel dirs
  and never pip-install into the shared Python.
- **Never read/edit/generate/move/delete another channel's prompts, assets, ideas, scripts, pipeline or config** — even when it
  "looks reusable or like an easy fix". Reuse across channels goes through shared infra (`toolkit/`, `release-catalog/`) or a
  recorded exception.
- **Exceptions are recorded with date and scope.** The one on file: E871 may read (not edit) the *folder structure* of
  `hidden-everyday-systems/release-calendar/` (owner 2026-10-04; structure only — not prompts, assets, topics, code).
  E871 also imports the owner's Frame Studio app (`H:/Projects/frame-studio`, outside the repo) read-only for card layout;
  Braketools is design basis only.
- **Shared files:** touch only your channel's blocks (e.g. your own Compose service/profile; your own calendar root).
- **Ambiguous channel in a request -> ask**, defaulting to the channel your agent owns. A "clean up / improve / audit the repo"
  request scopes to your own channel plus the shared infra it uses; say what you excluded.
- **Cross-channel coordination** is by explicit notes (HES `COORDINATION-NOTE.md` was transient: who is using the shared GPU),
  never by editing each other's files.
- **Open owner decisions you may not settle** (as of 2026-10-12): whether AMB long-forms may use E871 release slots; the AMB
  quiz-pipeline directory; the AMB "(x)" day-marker fix; the AMB YouTube category. Also, AGENTS.md/ONBOARDING.md still said
  "two channels" while CLAUDE.md lists four plus AMB — treat the real set as five.
- **Note on this skill.** The 2026-11 restructure authorised repo-wide *reading* to build the skill; ownership still governs
  *writing* to channel directories.

## 10. Shared GPU and service etiquette (ALL)

- One 16 GB GPU (RTX 5060 Ti) is shared with the owner's apps. **One heavy GPU job at a time.** Check VRAM (`nvidia-smi`)
  before TTS/ASR/Blender/ComfyUI.
- dots.tts services (`tts` port 8004, `tts-hidden` profile `hidden-systems` port 8005) **never run simultaneously** — each loads a
  full SOAR model. VoiceStudio shares the GPU too: stop it when done. ComfyUI never runs alongside any TTS.
- IndexTTS 2.5 OOM-kills the VoiceStudio container on this 15 GB host — **never select it.** VoiceStudio engine switches: GET
  `/engines/tts`, generate only when the expected engine is active, **always restore the default** (omnivoice) afterwards.
- MT: never run two Taichi solves, or Taichi plus a Cycles render, at once (a clay run crashed that way). HES 3D: one Blender at a
  time via the `BLENDER.lock` file. AMB: renders lower their own priority and take a `.lock`.
- Cold start is slow, not hung: the dots.tts SOAR checkpoint (~4.8 GB) downloads on first boot (compose healthcheck
  `start_period: 600s`).
- Long jobs: run detached with logs; verify output files and mtimes; a reused job name can return a stale completion. After a
  usage-limit interruption, **resume from disk state** (resumable pipelines) rather than reloading agents.

## 11. Verification, taste and settled decisions (ALL)

- **Objective checks support listening and watching; they never replace them.** Listen to the opening, difficult proper nouns,
  two chunk boundaries, a dense scene, the CTA, the ending. Watch once muted and listen once without watching (NEWS).
- **Prove the gate bites.** After adding a gate, break one input deliberately and confirm it fails (HES triple verification).
- **Do not relitigate settled choices** recorded with owner/date (examples: dots.tts for NEWS, male house voice, exact Short CTA,
  quiet rotating music; HES 3D-only since 2026-10-10; E871 "don't re-argue copyright"). If you disagree, say so once and
  follow the latest instruction. The user's latest instruction is highest priority.
- **When unsure of taste/safety, reject** (E871: "When in doubt, reject. The pool refills every discovery run"). Record why
  (`reject_reason`) — it is what tunes the vibe/novelty rules later.
- **Never invent facts, URLs, numbers or licences.** If a source is missing or conflicts with current authoritative material,
  stop and resolve it. If two docs contradict, say so (see the contradiction lists in [qa-gates.md](qa-gates.md) and
  [legacy-and-removed.md](legacy-and-removed.md)).

## 12. Content safety (per channel)

- **E871:** auto-reject gore, nudity, minors in distress, medical fear, hate/harassment, real tragedies and jokes built on them,
  and roast humour aimed at body/disability/ethnicity/sexuality/poverty ("never punch down"). Foreign watermarks, another page's
  burned-in caption, fit < 7, compilations/countdowns/slideshows/ads/static images (fit <= 3) also reject.
- **NEWS (cyber):** no operational exploit instructions that materially enable abuse; high-level mechanism diagrams and defensive
  guidance only. Do not trivialise tragedy/victim harm with reaction GIFs (max three per video, zero by default, original assets).
- **Legacy ShortsFactory** had a stricter religious-harm/drug/sexual-content filter (confidence >= 0.85 reject) and a
  permission-state ledger (`unknown`/`discovery_only` sources stay `permission_pending`; `non_commercial`/`no_derivatives`/`prohibited`
  never render). Useful as a pattern if a rights-ledger is ever needed; inactive now.

## 13. Windows/tooling hazards worth knowing

- Windows host: Git Bash is flaky under load (fork failures) — use PowerShell or the dedicated file tools; avoid `/tmp` paths and
  process substitution in bash. If you write source through a Python eval kernel, check for `!` corruption.
- Source dirs can be hundreds of GB: never recurse blindly over `output/`, `release-calendar/`, `backup/`, `node_modules`,
  `.venv`, `assets/`; list specific files. Heavy files live outside H: where noted (`S:/ambient`).
- Environment details, paths and install steps: [environment-setup.md](environment-setup.md).
