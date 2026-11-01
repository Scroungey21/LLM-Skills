---
name: manga-recap
description: Plan, script, voice, compose, QA and package narrated manga / manhwa / webtoon recap videos (chapter or arc recaps told panel by panel, long-form plus a vertical Short) with a rights gate in front of everything. Use whenever the user wants a manga recap, manhwa recap, webtoon recap, comic or chapter summary video, a "recap channel", panel-by-panel narration, an NLE/editor export package of panel stills + narration + subtitles, or asks how the archived technews Manga Recap niche (v7 addendum, CIS, manga_panel_composition, rights bases, fair-use review, NLE export) worked. Theme subskill for a NEW channel; the implementation is archived. Not for news, mechanism explainers, found-clip Shorts or chat stories.
---

# Manga / manhwa / webtoon recap (theme subskill)

A recap is a narrated, panel-by-panel retelling of a chapter or arc: the comic's own panels are the visuals, an expressive narrator tells the story, and the viewer should leave with the story's shape.
This is a **theme** (no channel folder yet; the router says "none yet (new channel)"). It was specified as the `manga_recap` niche of the archived technews engine (v7 addendum, `V7-REQ-*`,
built on v5's rights tiers and CIS screens, with v8's vertical recap) and is **SPEC-ONLY + ARCHIVED**: code and tests exist in git tag `pre-skill-reduction`, the full chain was never run end to end,
and the repo holds no audience data and no platform-policy research ([theme-catalog.md](../../references/theme-catalog.md)). Method, rubrics, schemas and gates are preserved here so you
can run a channel now with Claude as the LLM layer; every spec rule keeps its id so it stays traceable.

## When to use / not use

- Use: a recap of a comic whose rights you can document (`owned`, `licensed`, `public_domain_cc`), narrated over its own panels; also questions about the archived niche.
- **Stop and ask the owner first** if the source is an unlicensed ongoing commercial work, a scanlation, or "just something popular": that is the `fair_use_candidate` case the spec treats as a genuine exception ([references/sourcing-and-rights.md](references/sourcing-and-rights.md)).
- Not for: current news ([`news-explainer`](../news-explainer/SUBSKILL.md)); mechanism explainers ([`everyday-systems-explainer`](../everyday-systems-explainer/SUBSKILL.md)); found real-world clips ([`clip-card-shorts`](../clip-card-shorts/SUBSKILL.md)); anime/film/TV recaps (different media, different rights, nothing here covers them).
- Do not import rules from other channels: news tempo/deadpan style, HES native-only pacing, MT "no narration" or E871 clip-card rules are not recap rules. Reuse them only where a shared reference says so.

## The pipeline, in order, with the gate at each step

1. **Choose the work and the rights route.** Rights availability first, then story merit; verify any suggested title exists. *Gate:* a documented basis the owner will attest; the series + chapter range is not already in `ledger.json`. -> [sourcing-and-rights.md](references/sourcing-and-rights.md)
2. **Record the rights decision before touching pages** (V7-REQ-2.1/2.2): exactly one of `owned` / `licensed` (+ licence reference) / `public_domain_cc` (+ verification note) / `fair_use_candidate` (human-only memo, default reject). *Gate:* `RIGHTS.json.status == verified`; nothing is rasterized earlier (V7-INV-1).
3. **Rasterize and read pages -> panels** (V7-REQ-4.x): 200 DPI page images, one reading packet per page, crops by normalised region, dialogue + visual description per panel, reading order. *Gate:* page JSON valid, crops exist, contact-sheet spot-check done, uncertain panels flagged (extraction is spot-checked, not a blocking gate, V7-REQ-4.4). -> [panel-parsing.md](references/panel-parsing.md)
4. **Story ledger -> recap beats -> scenes** (skill method on top of V7-REQ-5.1): each scene narrates exactly **one** panel (`panel_id` from the list, `scene_energy`, provisional timestamp); budget and runtime set from the panels you select, not the 240 s default. -> [script-and-narration.md](references/script-and-narration.md)
5. **Editor critique, then panel-grounded fact-check and correction** (V7-REQ-5.4/5.5): every claim must trace to its own panel's dialogue or visual description; deletion-first corrections, independently re-checked. *Gate:* all claims traceable or the script stops.
6. **GATE 1 - the owner approves the script** (both modes; the agent never auto-approves). Re-verify anything volatile (licence terms, titles) right before audio.
7. **Narration**: expressive delivery (`expressive_narrative`), sequential per-scene audio with 0.200 s gaps, light breath trim, a deliberately chosen tempo, a licensed/synthetic voice. *Gate:* audition a hook + a dense line; no dropped words or wrong names. -> [script-and-narration.md](references/script-and-narration.md) §7, [voice-tts.md](../../references/voice-tts.md)
8. **Alignment and screen timing**: real start times and durations from the spoken audio, never from the provisional estimates (V7-REQ-7.1, V7-INV-5).
9. **Compose**: `manga-panel-composition` (blurred full-bleed backdrop at 85%, unblurred foreground at 65/72/80% of width by energy), transitions (same page -> cut), optional motion. *Gate:* frames show the whole, right, legible panel. -> [composition-transitions-export.md](references/composition-transitions-export.md)
10. **Assemble**: manual mode (the archived default) exports lossless PNG stills at 30 fps frame times + `audio.wav` + SRT/VTT + `manifest.json`, then edit in an NLE; automatic mode renders the video. *Gate:* the package is human-reviewed and acknowledged (the "7th gate", V7-REQ-8.6) before assembly continues.
11. **Metadata, credits, thumbnail** (done by hand in practice; the archived step cannot run in manual mode). *Gate:* work credit, rights line and official-source link in the description; no "no copyright"/"fair use" claims. -> [qa-metadata-release.md](references/qa-metadata-release.md)
12. **Vertical Short**: condensation of the approved long script, 55 s, hook in 2 s, panel-linked scenes, CTA. The archived derivation is blocked for this niche. -> [vertical-recap.md](references/vertical-recap.md)
13. **GATE 2 - the owner approves the render** after objective QA, listening and frame inspection; package, schedule; **upload only with explicit authorisation in that turn**.

## Non-negotiable invariants (items 1-6 settled in the specs, 7-9 from shared/owner rules - do not relitigate)

1. **Exactly one rights basis per document, recorded before parsing; the file is stored first** (V7-REQ-2.1/2.2). A `fair_use_candidate` document is never parsed while its assessment is pending or rejected; **rejection is final, no fallback source** (V7-REQ-2.5, V7-INV-1).
2. **No automatic fair-use approval, no bulk approval, no "safe length / obscure enough" heuristic**; the four-factor memo is written by the reviewing human in their own words, and ambiguity defaults to reject (V7-REQ-2.6, V5-REQ-5.5/5.6/5.10/5.11). The agent never drafts it.
3. **Composition tricks are not a rights gate** (V7-REQ-6.4): the blurred backdrop, frame or grade are aesthetics; never present them as transformation or as a way to avoid detection or matching.
4. **One narration per panel, grounded in that panel only** (V7-REQ-5.1/5.4); never invent plot, dialogue or a character's internal state (seeded editorial constraint). The same panel may back several scenes (V7-REQ-5.3).
5. **Timing comes from alignment, not the script** (`provisional_timestamp_ms` is a drafting aid only, V7-INV-5); audio never overlaps between screens (V7-INV-4).
6. **No scoring/ideation**: a project starts from a verified document; the suggestion step is informational and creates nothing (V7-REQ-3.5/3.6). Rendering mode is CIS only (V7-REQ-3.1).
7. **Voice** *(spec V7-REQ-3.4 for expressive delivery; shared rule [voice-tts.md](../../references/voice-tts.md) §3 for the voice)*: expressive narrative, not the news deadpan; the cloned `warm-informational` house voice (a real, identifiable person, no consent) is not for this channel.
8. **The agent is the LLM layer** *(owner rule, 2026-10-04, [agent-principles.md](../../references/agent-principles.md) §1; Gate 1/Gate 2/export acknowledgment are spec gates, upload is [agent-principles.md](../../references/agent-principles.md) §5)*: file hand-off packets, no model-API backend; never approve on the owner's behalf, never publish.
9. *(Skill discipline)* Report honestly: this subskill's archived chain was never run with real TTS, alignment and Remotion; say what you did not verify.

## Route the task

| Task | Read |
|---|---|
| Pick a work; rights bases, fair-use gate, risk register, policy flags, what is open | [references/sourcing-and-rights.md](references/sourcing-and-rights.md) |
| Rasterizing, panel schema, crop math, reading order, webtoon/LTR cases, spot-check | [references/panel-parsing.md](references/panel-parsing.md) |
| Story ledger, scene contract, narration rules, dwell and word budgets, fact-check, audio chain | [references/script-and-narration.md](references/script-and-narration.md) |
| Composition numbers, transitions, pan/zoom proposals, NLE package, assembly | [references/composition-transitions-export.md](references/composition-transitions-export.md) |
| Tables, columns, state machines, invariants, RDs, migrations, routes | [references/data-model.md](references/data-model.md) |
| Vertical (Shorts) variant, why the archived derivation fails, a 9:16 proposal | [references/vertical-recap.md](references/vertical-recap.md) |
| Run it now: folder layout, hand-off packets, commands, restore pointers | [references/operations-agent-as-llm.md](references/operations-agent-as-llm.md) |
| QA gates, metadata/credits, thumbnail, release, completion report | [references/qa-metadata-release.md](references/qa-metadata-release.md) |
| What exists, known gaps, spec-vs-code contradictions, owner questions | [references/current-state-and-open-questions.md](references/current-state-and-open-questions.md) |

## What to reuse instead of re-documenting

- Narration engine, house voices, GPU rule, cadence discipline: [voice-tts.md](../../references/voice-tts.md); captions (ZDF-style spec), loudness, music credits: [audio-captions-music.md](../../references/audio-captions-music.md); Remotion, ffmpeg, thumbnails, public dir: [rendering.md](../../references/rendering.md).
- Gate catalogue (script, caption, visual, format, metadata): [qa-gates.md](../../references/qa-gates.md); stage order: [workflow.md](../../references/workflow.md); ownership and the ten channel decisions: [new-channel-playbook.md](../../references/new-channel-playbook.md); calendar and ledger: [release-calendar.md](../../references/release-calendar.md); standing rules: [agent-principles.md](../../references/agent-principles.md).
- From news-explainer (reuse the *mechanisms*, not its voice): Gate 1 / Gate 2 discipline and the completion report ([qa-release.md](../news-explainer/references/qa-release.md)), the dots.tts contract ([audio-tts.md](../news-explainer/references/audio-tts.md)), the CIS screen idea ([visual-rendering.md](../news-explainer/references/visual-rendering.md)), the archived-app architecture and restore steps ([pipeline-and-architecture.md](../news-explainer/references/pipeline-and-architecture.md)). The planned shared write-up of Creative Illustration Separation is not linked here until it exists.
- Packet pattern (request.json + image -> analysis.json, validated): [clip-card-shorts agent review](../clip-card-shorts/references/agent-review-and-captions.md).

## Start a NEW recap channel: the first ten decisions

1. **Rights route** (own work / licence partner / public domain) and whether `fair_use_candidate` is ever allowed (default: no).
2. **Owner attestation and evidence** format; who signs; where evidence lives.
3. **Genres and formats in scope**: right-to-left manga, left-to-right manhwa, vertical webtoon strips (strips need your own slicing, [panel-parsing.md](references/panel-parsing.md) §8).
4. **Output model**: NLE-assembled (archived default) vs fully rendered, and the long/Short pairing.
5. **Voice and disclosure**: a voice you can license or a genuinely synthetic one, provenance file, synthetic-media disclosure answer, tempo (audition 1.0 first).
6. **Recap grammar**: story ledger + beats, spoiler policy, how much of a chapter is shown (record panels used / total), quote discipline.
7. **Pacing**: scene dwell target (3-9 s proposed), cut cadence, panel motion rules, caption style and safe areas for 16:9 and 9:16.
8. **Safety and rating**: who reviews mature content; hard no on sexualised minors; profanity wordlist for the opening seconds.
9. **Metadata contract**: credit lines, official-source link, title pattern, thumbnail policy (panel art or not).
10. **Ownership and operations**: channel folder name, entry in the repo ownership list, ledger keyed by series + chapter range, release calendar root, GPU etiquette (one heavy job at a time).
Record each answer, with date, in the new channel's own docs ([new-channel-playbook.md](../../references/new-channel-playbook.md)).

## Commands and tools: now vs restorable

Now (repo root, PowerShell; details in [operations-agent-as-llm.md](references/operations-agent-as-llm.md)):
```powershell
pwsh -File ai-video-factory/scripts/preflight.ps1
# NARRATION: do NOT just run `docker compose ... up -d tts`. Both dots.tts services (tts :8004, tts-hidden :8005) are configured with the
# cloned `warm-informational` reference, and the server accepts only its one configured voice. Either (a) install a reference you can license
# and audition it with provenance (voice-tts.md section 6) before using dots, or (b) use VoiceStudio VoxCPM2 (Apache-2.0, the owner's stated
# commercial-licence preference). OmniVoice weights are CC-BY-NC: wrong for a monetised channel. One GPU service at a time.
# stills: from ai-video-factory/toolkit/renderer after npm install (Node >= 22.6)
node --experimental-strip-types render-cli.mjs <build.json> <frame_dir> --stills=0,126,300
```
You also need PyMuPDF + Pillow in a Python environment of your own (not in the toolkit), an NLE or your own ffmpeg mux, and an ASR/alignment path.
Restorable from tag `pre-skill-reduction` ([legacy-and-removed.md](../../references/legacy-and-removed.md)): the engine/console/manifests (`git archive pre-skill-reduction engine console manifests packages`) with the upload + rights console, panel parser, NLE export and the `test_v7_*` /
`test_manga_recap_pipeline_integration.py` suites. The specs (`kiro-specs/specs/v5-addendum`, `v7-addendum`, `v8-addendum`) are **not** in the tag: they live in `H:\Projects\YTtechnews-archive-2026-11-01\kiro-specs\`.
A restored engine reintroduces model-API stages (panel-parser vision stage, scriptwriter, editor, fact-checker, suggestions); decide per stage whether to convert it to a packet. Still missing even there: a voice profile for the niche, panel-image loading in Remotion (unverified), a 9:16 variant, a working metadata path in manual mode ([current-state-and-open-questions.md](references/current-state-and-open-questions.md)).

## Completion discipline

Files existing is not done. Before saying done: the rights record is current and evidenced; every used panel was looked at; every claim traces to its panel; the final MP4s (not only JSON) were inspected frame by frame and listened to; captions, credits and the rights line are in the description; nothing was uploaded. Report what passed, what was rejected, and what you could not verify (human listening, panel loading in a real render, platform policy and claim status). Never state a platform-classification or legal outcome as guaranteed.
