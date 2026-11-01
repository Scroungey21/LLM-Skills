---
name: chat-story-videos
description: Make texting / chat-story fiction videos - a fake messaging UI (iMessage, WhatsApp, Messenger, Snapchat, Discord, Roblox chat) that tells a story as a conversation, voiced by synthetic character voices, usually composited over self-recorded gameplay (Minecraft parkour, GTA) as a 1080x1920 Short. Covers the format study (hooks, pacing, message cadence, reveal and ending structure), story writing, the story-JSON schema and validation, per-character voices, audio-timed reveal scheduling, simulator fidelity, meme SFX / music / rights provenance, render, QA, metadata and policy risks (18+ comedy, AI voices, inauthentic-content), plus the working chat-sim MCP tools and CLI in hidden-everyday-systems/chat-stories. Use for "texting story", "chat story video", "fake text message video", "wrong number story", "drunk text comedy", "Reddit-style story over Minecraft parkour", "Caldruki-style meme edit", or when starting a new chat-story channel.
---

# Chat-story videos (texting-story Shorts)

## What this video type is
A **fictional two-person text conversation** shown in a pixel-faithful phone-chat UI, voiced line by line with synthetic
voices, with the bubbles revealed in step with the speech, over a vertical gameplay loop. 40-100 s, Shorts-first
(YouTube Shorts / TikTok / Reels). The story is the product; the UI is a narrator, the voice carries it above reading
speed, and the gameplay is retention wallpaper (REPORT P1, P2; `references/format-research.md`).
The working implementation is `hidden-everyday-systems/chat-stories/` (Node engine + headless simulator + MCP server
**chat-sim**, built 2026-09-25..10-04). It lives *inside* HES's directory; see the boundary note in "New channel" below.

**Use this subskill** for: writing a chat story, voicing/timing/rendering one, editing a comedy "Caldruki-style" meme cut,
vetting its audio/visual assets, reviewing its policy risk, resuming the chat-stories work, or starting a channel of it.
**Do not use it** for: narrated mechanism explainers (`../everyday-systems-explainer/SUBSKILL.md`), found-footage
(`../clip-card-shorts/SUBSKILL.md` - real clips, and its absolute no-stock rule), pure simulations
(`../physics-simulation-shorts/SUBSKILL.md`), long ambient video, news.

## Pipeline, with the gate at each step
```
PREMISE -> SELECT -> PLAN(bible) -> DIALOGUE -> CRITIQUE <-> REVISE -> script approval (owner)
 -> NORMALISE spoken text -> TTS (per line, best-of-N) -> pause tighten -> SCHEDULE -> mix -> RENDER frames -> composite -> QA -> (never auto-upload)
```
| Step | Who | What / tool | Gate (fails closed) |
|---|---|---|---|
| Premise, select, plan, dialogue, critique, revise | **you (agent)** | `references/story-writing.md` (rubric + schemas; these stages are PROPOSED in AUTOMATION_SPEC, not built as code) | first bubble = concrete stake at t0; every ending pays a plant seen before the midpoint; deletion/reorder tests; <= 3 critique loops |
| Script check | tool | `chat_validate_script`; `node engine/check-spoken.mjs <story.json>` | schema ok; no spoken text adds pauses the bubble does not show; <= app char limit |
| Plan | tool | `story_plan` (estimate, or `synthesize:true`) | reveal schedule sane; no unvoiced bubble hidden under another |
| Voice | tool | `story_build` / `tts_synthesize`; backend `voicestudio` (OmniVoice clones) default, `dots` optional | per take WER <= 0.15, onset <= 400 ms, 130-450 wpm sanity, 180-320 wpm band (reported, never stretched) |
| Schedule + mix + render | tool | `story_build` -> `<slug>.mp4`, `dialogue.wav`, `mix.wav`, `timed-script.json`, `build.json`, `description.txt` | build.json `cadenceFailures` reviewed; background clip `rights_basis` recorded |
| QA | tool + you | `engine/check-*.py|mjs`, frame/listen review (`references/qa-policy-metadata.md`) | voice never before its bubble; no spoiler frame; plot-critical text legible; assets provenance complete |
| Publish | owner only | nothing here uploads | explicit user authorisation; credits in description |

## Non-negotiable invariants
1. **The agent is the LLM layer** (owner, 2026-10-04; [agent-principles.md](../../references/agent-principles.md) section 1).
   Never add a model-API backend. Premise/selection/critique are your judgment, written as files and validated by code.
2. **Spoken text = the bubble text** (owner, 2026-10-03: pauses sounded like "invisible punctuation"). The normaliser only fixes
   pronunciation; hand-written `spoken` may never add a pause mark. Why: audible pauses with no visible punctuation read as glitches.
3. **Voice never precedes its bubble.** Each take's measured onset lands >= 50 ms after the first frame showing its bubble.
4. **Native TTS timing only**: no stretching/resampling/pitch change of narration. Meme *voice edits* (`audioFx`) are the one
   deliberate exception, on comedy lines only.
5. **Plot-critical text is on screen and legible** (muted comprehension, P6); no spoiler in the first frame/thumbnail.
6. **Gameplay is only our own capture** under the publisher's creator policy (`rights_basis`: `self_recorded_official_policy` or
   `open_source_engine`); never a repost labelled "no copyright" ([shorts-and-brainrot.md section 5](../everyday-systems-explainer/references/shorts-and-brainrot.md)).
7. **Two-person chats only** (schema + skins); stories are original; no real people; nothing involving minors; no
   non-consent; no slurs against protected groups; no working scam steps (owner, 2026-10-03/04; the minors rule is recorded in the README's 18+ comedy bullet - its exact scope is an open owner question, `references/qa-policy-metadata.md` section 2).
8. **18+ is an owner decision, not a default**: `audience: "18+"` stories get no music (engine rule); the owner accepts platform
   consequences (age restriction, limited ads) and meme-asset claim risk. Record the decision date in any new channel.
9. **Nothing uploads from this pipeline**; metadata credits are a delivery requirement (and currently incomplete: `references/qa-policy-metadata.md`).
10. **Verify before claiming**: the study never had a human listen; the owner listens; state "not listened" in reports ([agent-principles.md](../../references/agent-principles.md) section 8).

## Route the task
| Task | Read |
|---|---|
| Why this format works, what the 48-case study measured (hooks, cadence, endings, genres), edit grammar of meme cuts | `references/format-research.md` |
| Write a story: rules, genre mechanisms, funny spec, plants/payoffs, agent stage procedures, examples | `references/story-writing.md` |
| Story JSON: every block, defaults, limits, validation commands | `references/schema-and-validation.md` |
| Voices: the two characters, provenance, audition + scoring, normaliser, best-of-N, tightening | `references/voices.md` |
| How bubble timing derives from speech (`schedule()` as a formula), defaults vs study medians, sfx hold | `references/timing-schedule.md` |
| UI skins, canvases, fidelity limits, render geometry, loudness chain, transparent export | `references/simulator-and-render.md` |
| Music, SFX, meme clips/images, ducking, overstimulation limits, per-asset rights | `references/audio-sfx-memes.md` |
| QA checks, metadata, policy and rights risks, credits gap | `references/qa-policy-metadata.md` |
| Exact MCP tools, CLI, check scripts, services, env vars, setup | `references/operations.md` |
| What exists, what is broken after the 2026-11-01 reduction, open owner questions | `references/current-state.md` |

## Reuse, do not duplicate
- Voice backends, VoiceStudio client, audition discipline: [voice-tts.md](../../references/voice-tts.md) (sections 6, 7); toolkit client `toolkit/voicestudio/`.
  Chat stories use their own cadence band (180-320 WPM) - scope it; do not import it into explainers ([qa-gates.md](../../references/qa-gates.md)).
- Loudness/ducking vocabulary: [audio-captions-music.md](../../references/audio-captions-music.md) sections 4-6.
- Gameplay library schema, rights policy, rotation, ingest: [shorts-and-brainrot.md](../everyday-systems-explainer/references/shorts-and-brainrot.md) sections 5-6.
- Shorts safe zone (top ~8 %, bottom ~20 % covered by UI): [clip-card-shorts standards-and-qa.md](../clip-card-shorts/references/standards-and-qa.md).
- Release calendar/ledger, repeat checks, scheduling: [release-calendar.md](../../references/release-calendar.md), [workflow.md](../../references/workflow.md) (no chat-story calendar exists yet).
- New channel checklist: [new-channel-playbook.md](../../references/new-channel-playbook.md).
- GPU etiquette (hs-chat-tts, VoiceStudio, Blender share 16 GB): [environment-setup.md](../../references/environment-setup.md) section 8.

## Start a NEW chat-story channel: the first 10 decisions
1. **Audience and rating**: all-ages drama/wholesome vs 18+ comedy. Decide, date it, and read `references/qa-policy-metadata.md` section 2 (age restriction, ads, "made for kids: No").
2. **Genre lane**: dramatic, funny, weird-rule, cursed (REPORT section 4). Weird rule stories and group chats are the underexplored lanes; romantic betrayal/rizz are saturated.
3. **Interface skin**: iMessage dark card dominates (39/48); WhatsApp/Messenger/Snapchat/Discord/Roblox exist. Note the trade-dress open risk (`references/simulator-and-render.md` section 4).
4. **Voices**: reuse `chat-male`/`chat-female` or audition new references (>= 2, distinct, dry, synthetic only). Check the OmniVoice licence before monetising (`references/voices.md` section 6).
5. **Edit style**: clean drama (music bed, ducked) vs Caldruki comedy (no music, meme beats on ~7 punchlines). One per story; do not mix.
6. **Background**: own gameplay capture + `rights_basis`; add clips only via `ingest_gameplay_clips.py` after reading the game's policy.
7. **Length and cadence**: funny 40-55 s (cap 65), drama 60-100 s; messages ~32-48 (funny) - `references/format-research.md` section 3.
8. **Originality system**: a premise/novelty ledger, varied formats, human script review - the YouTube inauthentic-content rule is the main monetisation risk for templated stories.
9. **Metadata and credits** template (music, Noto emoji, Bluezone, meme sources, AI-voice line) - not built; define it before the first publish.
10. **Ownership and release path**: the code lives under `hidden-everyday-systems/`; CLAUDE.md gives that directory to the HES agent. A separate channel needs its own folder, ownership entry, calendar and ledger per the playbook; copy or fork, do not edit across the boundary.

## Commands and tools: now vs restorable
**Available now (live repo, no restore needed):** MCP server `chat-sim` (registered only in `hidden-everyday-systems/.mcp.json`, absolute path;
start a Claude session in that directory): `chat_list_apps`, `chat_default_script`, `chat_validate_script`, `chat_timeline`,
`chat_render_png`, `tts_status`, `tts_service`, `tts_synthesize`, `story_plan`, `story_build`, `story_template`, `editor_url`.
CLI (from `hidden-everyday-systems/chat-stories/`): `node engine/cli.mjs build <story.json> [--out DIR] [--skip-tts]`,
`png <json> <out.png> [--t MS|all] [--full]`, `apps`, `tts-info`, `say "<text>"`; checks `engine/check-*.{mjs,py}`. Full list: `references/operations.md`.
Verified this session: `chat_list_apps` and `chat_validate_script` on `examples/plant-sitter.story.json` returned ok.
**Restorable from `pre-skill-reduction`:** *nothing* - two case-insensitive greps over the recovered old tree (`*.md,*.ts,*.tsx,*.py`, incl. console, engine, ShortsFactory, kiro-specs) for
`chat.stor|texting|chat-sim` and for `text.?stor|fake.?(text|chat)|imessage|reddit.?stor|sms` found **zero** hits (while "horror" has 377 hits in 56 files, so the search works); the
implementation is live-repo only (see [legacy-and-removed.md](../../references/legacy-and-removed.md)). The archived technews engine had no chat-story stage.
**Known breakage after the 2026-11-01 reduction (not fixed, outside this skill's directory):** `story_build` with a gameplay background throws
(`GAMEPLAY_DIR` points at a removed path), and VoiceStudio auto-start cannot find a compose file. Workarounds in `references/current-state.md` section 2.
