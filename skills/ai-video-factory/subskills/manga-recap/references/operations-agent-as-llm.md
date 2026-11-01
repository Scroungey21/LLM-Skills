# Running a recap channel now: toolkit + the agent as the LLM layer

Compiled 2026-11-01. There is **no manga-recap channel folder yet** (router: "none yet (new channel)"). The archived engine did the LLM work through model APIs
(`panel-parser` vision stage, scriptwriter, editor, fact-checker, `manga-suggestions`); that pattern predates and is excluded by the owner's rule
([agent-principles.md](../../../references/agent-principles.md) §1): **never build a model-API backend; write hand-off packets, read them yourself, write the decision as a file, let code or
your own checks validate it.** Everything below is that rule applied to the recap stages. The schemas mirror [data-model.md](data-model.md).
Before anything: create the channel folder `<channel>/` (own directory, own ownership entry, own release calendar and ledger - [new-channel-playbook.md](../../../references/new-channel-playbook.md)); never write under another channel's directory.

## 1. What runs now vs what must be restored

| Capability | Now | How |
|---|---|---|
| Rights record, panel reading, story ledger, script, editor critique, fact-check, correction | **yes - you, via files** | sections 3-5 |
| PDF -> page rasters, panel crops | yes, with PyMuPDF + Pillow in a Python env you provide (`pip install pymupdf pillow`; not in the toolkit) | [panel-parsing.md](panel-parsing.md) §2, §5 |
| Narration | yes, **after a voice decision** | both dots.tts services (`tts` :8004, `tts-hidden` :8005) are configured with the cloned `warm-informational` reference and accept only that one voice, so `up -d tts` as shipped gives exactly the voice this skill rules out. Either install a reference you can license and audition it with provenance ([voice-tts.md](../../../references/voice-tts.md) §6), or use VoiceStudio **VoxCPM2** (Apache-2.0; the owner's stated commercial-licence preference). OmniVoice weights are CC-BY-NC (wrong for a monetised channel, [agent-principles.md](../../../references/agent-principles.md) §4). Never run two TTS services or ComfyUI at once (one GPU) |
| Word alignment (WhisperX) | partly: the archived engine ran it; otherwise use ASR timing matched to the script words ([voice-tts.md](../../../references/voice-tts.md) §4 modes 2-3) | needed for per-screen start times and captions |
| Composed stills | yes | `toolkit/renderer` (`MangaPanelComposition`, `manifests/manga-panel-composition.json`, `render-cli.mjs --stills`) after `npm install` (Node >= 22.6); see §6 and the two findings in [composition-transitions-export.md](composition-transitions-export.md) §1 |
| Full video | edit the exported package in an NLE, or write your own frame-sequence render + ffmpeg mux (no `renderMedia()` on this host, [rendering.md](../../../references/rendering.md) §2) | |
| Upload / schedule | **never** without explicit authorisation in that turn | [release-calendar.md](../../../references/release-calendar.md) |
| Upload UI, rights console, fair-use queue, NLE console, project board, notifications | **archived** | `git archive pre-skill-reduction engine console manifests packages -o $env:TEMP\legacy.zip` (details: [legacy-and-removed.md](../../../references/legacy-and-removed.md)); specs are in `H:\Projects\YTtechnews-archive-2026-11-01\kiro-specs\specs\` (not in the tag) |

Restored-engine caveats: it needs provider keys for its LLM stages (dead at the last check), a `panel-parser` route to a vision provider, and a voice profile on the `manga_recap` niche; its tests are `test_v7_*`, `test_manga_recap_pipeline_integration.py`, `test_v8_13_vertical_recap.py` (see [current-state-and-open-questions.md](current-state-and-open-questions.md)). Decide per stage whether to keep an API or convert it to a packet; do not extend the API pattern silently.

## 2. Folder layout (per chapter) and channel files

```
<channel>/
  ledger.json                      series + chapter range -> status (the repeat check; archived dedup is byte-hash only)
  rights/<series-slug>/RIGHTS.json (+ evidence/)         one per source document
  chapters/<series-slug>/<chapter-slug>/
    STATE.json                     stage -> done|paused|failed + timestamps (resumable, idempotent)
    source/<file>.pdf
    pages/page_0001.png ...        200 DPI rasters (re-crop source; keep until release)
    packets/panels/page_0001/{page.png, request.json}      ->  analysis/page_0001.json   (agent writes)
    panels/doc<id>_p<page>_<pos>.png   +  panels.json
    story/story-ledger.json  story/beats.json
    script/script.json  script/editor.json  script/fact-check.json  script/CHANGELOG.md
    audio/scene_000.wav ... narration.wav  timing.json  subtitles.srt
    stills/  export/ (the NLE package, section 6)  render/  release/
```

### `RIGHTS.json`
`{ document_id, title, rightsholder, rights_basis, license_reference|null, verification_note|null, scope: {adaptation, commercial, platforms, territories, term, translation}, evidence_files[], attested_by (the owner), attested_at, status: pending_review|verified|rejected, fair_use_assessment: null|{memo files by the human, decision, decided_at}, sha256_of_source }`.
`scope` is this skill's addition (the archived record keeps a bare reference string). `status` must be `verified` before `pages/` is created. The agent does not attest and does not write fair-use memos ([sourcing-and-rights.md](sourcing-and-rights.md) §3).

### `panels.json`
One object per panel: `{ id (stable int), document_id, page, position, image_region{x,y,width,height}, cropped_image_path, dialogue_text, sfx_text?, visual_description, notes?, checked: bool }`. Ids are never reused or renumbered after a script references them.

### `script.json`
`{ script_id, variant: full|shorts, runtime_target_s, word_budget, status: draft|approved, scenes: [ {index, is_hook, is_pattern_interrupt, component:"", narration, word_budget, duration_ms, cues:{typing_chars:0,node_count:0}, panel_id, provisional_timestamp_ms, scene_energy} ], version_chain: [ {stage: v1|v2|fact_check_report|fact_correction, content, created_at} ] }`. Append, never rewrite history; a changed `narration` invalidates `fact-check.json` (the archived engine stored `fact_check_content_hash` of the checked scenes - mirror it).

### `fact-check.json`
List of `{scene, claim, traceable, source?, note?}` plus `checked_content_hash`.

## 3. Packet: panel reading

1. **Write** `packets/panels/page_NNNN/request.json`: `{ document_id, page, reading_direction, image: "page.png", image_size, schema: <the analysis shape in panel-parsing.md §3>, notes_from_previous_page }` and copy the raster as `page.png`.
2. **Read** `page.png`, then write `analysis/page_NNNN.json`. One page at a time; save after each page.
3. **Validate** with the rules in [panel-parsing.md](panel-parsing.md) §4. A file that fails waits for a fix (do not crop from it).
4. **Crop + contact sheet** check ([panel-parsing.md](panel-parsing.md) §6): the contact-sheet re-check is this skill's addition.
5. Mark uncertain panels (`checked:false`, note the reason) so Gate 1 reviewers know where to look.

## 4. Packet: script

1. Input packet `packets/script/request.json`: the ordered panel list in the exact line shape of [script-and-narration.md](script-and-narration.md) §1 (sorted by page, position), the story ledger, the beats, runtime/word budget, voice mode (`expressive_narrative`), hook and CTA rules, the do-not-invent rule, and the rights credit line.
2. **Write** `script/script.json` v1; run the self-checks: panel ids exist, scene count/dwell/word counts per [script-and-narration.md](script-and-narration.md) §4-5, hook in scene 0, no scene narrates another panel's content, no invented names.
3. **Editor critique** as a second read with the four fields (`hook_strength`, `pacing`, `jargon`, `dead_stretches`), then `revised_scenes` (v2) with `panel_id`/`scene_energy` unchanged.
4. **Fact-check packet** `packets/fact_check/request.json` = scenes + per-scene panel ground truth (`Scene i (panel p.q): dialogue=..., visual=...`) **plus the panel images** for doubtful claims; write `script/fact-check.json`. Run the correction procedure ([script-and-narration.md](script-and-narration.md) §6) until every touched claim is traceable.
5. **Gate 1 is the owner's.** Present the script, the flagged claims, the rights basis and the uncertain-panel list; wait. Re-verify anything volatile (a licence term, a title) immediately before audio.

## 5. Packet: series / chapter suggestions

Informational only (V7-REQ-3.6): produce 5 candidates with title, one-line pitch and (new) rights route and content rating, **each verified to exist as a published work**; apply the rubric in [sourcing-and-rights.md](sourcing-and-rights.md) §5. Nothing is ranked, persisted or turned into a project until the owner picks and a rights basis is recorded.

## 6. Production commands (PowerShell, repo root)

```powershell
pwsh -File ai-video-factory/scripts/preflight.ps1                       # read-only environment check
nvidia-smi                                                              # one GPU: check VRAM before TTS / WhisperX
# Only AFTER the voice decision in section 1 (the shipped `tts` service = the cloned warm-informational reference):
docker compose -f ai-video-factory/toolkit/docker-compose.yml up -d tts
Invoke-RestMethod http://localhost:8004/api/model-info                   # confirm backend/voice/reference_sha256 is the voice you chose
# stills from a CIS build json (run from ai-video-factory/toolkit/renderer after npm install):
node --experimental-strip-types render-cli.mjs <build.json> <frame_dir> --stills=0,126,300 [--scale 1]
```
Stdout is one JSON line: `{"success":true,"stills":{"126":"still_126.png",...},"fps":30,"width":1920,"height":1080}`.

Minimal CIS build JSON (zod `.strict()`: no extra keys; `start` in seconds, `duration_ms` in ms; frames = `round(start x 30)`):
```json
{ "script_id": 1, "niche_key": "manga_recap", "rendering_mode": "cis", "aspect_ratio": "16:9",
  "screens": [ { "screen_id": 1, "screen_type_key": "manga_panel_composition", "category": "template_driven",
      "backing_component": "manga-panel-composition",
      "content": { "background_layer": {"image_path": "<loadable URL or data URI>", "blur_pct": 85, "scale": "fill"},
                   "foreground_layer": {"image_path": "<same>", "blur_pct": 0, "scale_pct": 72} },
      "elements": [ {"name":"background_layer","description":"..."}, {"name":"foreground_layer","description":"..."} ],
      "start": 0.0, "duration_ms": 4200 } ],
  "transitions": [], "audio": { "wav_path": "<absolute path>", "duration_seconds": 60.0 }, "words": [] }
```
`image_path` must be loadable by the headless page (data URI or a file under the bundle's `public/`); a bare filename is the unverified archived behaviour. Validate the JSON against `BuildJsonSchema` by simply running the CLI; it fails loudly with the field name.

Audio: generate per scene (dots.tts `POST /tts`, one request at a time, client timeout 900 s), join with a 0.200 s gap, apply the light trim only if the same effect is wanted, decide tempo explicitly ([script-and-narration.md](script-and-narration.md) §7), normalise to the channel's stated LUFS, align, export SRT; never time-stretch a rejected take to pass a gate ([agent-principles.md](../../../references/agent-principles.md) §8).

## 7. Resumability, backups, reporting

- Every stage reads state from the chapter folder and can be re-run; write `*.part` then rename for long jobs; re-read `ledger.json` before saving (concurrent builds clobbering is a recorded failure).
- Back up `ledger.json`, `rights/` and any gitignored media before risky edits ([agent-principles.md](../../../references/agent-principles.md) §7). Never delete a rejected document's record; deleting source PDFs or panels is the owner's decision.
- Completion reports list what passed, what was rejected, what was not verified (human listening, real-render panel loading, platform policy), with absolute paths and hashes ([agent-principles.md](../../../references/agent-principles.md) §8).
