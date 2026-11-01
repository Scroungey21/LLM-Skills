# ShortsFactory: current state, known gaps, tests and open questions

Compiled 2026-11-01 from the archived tree (tag `pre-skill-reduction`, read via the recovered copy) and the continuation skill's own `current-state.md` (last consolidated by its author 2026-09-01). Re-verify against a restored
tree before relying on line-level detail. **Nothing in this file is running**: the code is not in the working tree (only leftover `.pytest-tmp-*` folders remain under `ShortsFactory/`), no output exists, no uploads or OAuth were ever done.

Contents: 1 What exists - 2 What was verified and not performed - 3 Known gaps (G1-G12) - 4 What the 14 tests pin and what they do not - 5 Archived state outside the repo - 6 Open owner questions - 7 Recommended next steps

## 1. What exists (archived implementation, 2026-09)

- A local, configuration-driven Python 3.12+ application: Typer CLI, SQLite/SQLAlchemy memory, FFmpeg + Pillow rendering, FastAPI approval dashboard, YouTube publisher (off), weekly reports, compilation builder,
  dots.tts wrapper. 80 tracked files; 15 packages/modules in `src/shortsfactory/` (`ai, analysis, analytics, approval, audio, compilation, database, filtering, media, rendering, reports, rights, routing, sources, youtube`
  + `cli, config, examples, orchestrator, scheduling`).
- Three active channels (Goodness Found, Motion Explained, Meme Current) with real-photo avatars; two disabled legacy channels.
- Local-inbox adapter with nested folders and creator inference; SHA-256 + temporal fingerprint dedupe; rights policy separating `can_edit` from `publishable`; approval and upload readiness re-checking rights; one-call analysis with the
  constrained harm filter and guarded deletion; per-channel/day numbering with paired metadata; crop-fill Shorts with original audio + 0.2 licensed music, no TTS; compilation builder with foreshadow cards; weekly credits and
  permission-request CSVs; a nine-video brand-preview renderer and slate.
- Tracked assets: 5 avatar crops + 5 uncropped sources, one CC0 music loop with licence sidecar, voice and music READMEs, two preview slates, the dots.tts research (3 files), the continuation skill (11 files, now distilled here).

## 2. Verified, and deliberately not performed

Last known automated result: **14 passed** (author's note; re-run, do not cite as current). Nine private Instagram-derived preview Shorts were rendered (3 per active channel) and reviewed locally; all unknown-rights, non-publishable.
Intentionally NOT done: processing or safety-filtering the full intake; deleting any harmful original while producing the examples; YouTube OAuth or uploads; fetching from Instagram/TikTok/X; installing the large TTS stack;
recording the voice reference. Channel-name/handle uniqueness research was point-in-time: recheck before account creation.

## 3. Known gaps (found by reading code and docs together; each is a candidate task, none is fixed)

| Id | Gap | Evidence | Fix direction |
|---|---|---|---|
| G1 | **LLM layer is a hosted API, not the agent.** `AIConfig.provider` allows `demo`/`openai`; `build_ai_provider` picks OpenAI; config/README tell the user to set `OPENAI_API_KEY`, model `gpt-5.6-terra`, and use a hosted transcription model | `config.py`, `ai/provider.py`, `config.example.yaml`; log SF-D12 | file hand-off provider (`llm-layer-method.md` sections 2, 8); remove API-key checks |
| G2 | Dashboard approval of a `permission_pending` item raises inside the transaction and rolls the approval back (approve-all can abort the whole batch) | `approval/dashboard.py` + `youtube/publisher.py` | `approval-and-handoff.md` A1 |
| G3 | **No rights-grant transition**: `discover()` never updates existing rows; no `rights set` command; permission queue is one-way | `orchestrator.discover`, `cli.py` | upsert sidecar rights on discover or add a command; keep the permission record |
| G4 | Revision loop leaves the `GeneratedShort` row stale | `orchestrator.process` (`if not generated`) | refresh paths/copy/state on re-render |
| G5 | **Segment selection missing**: whole clip up to 60 s, rationale "complete grounded demo segment"; architecture step 9 promises a grounded segment | `orchestrator.py` | have Claude return `start/end` and the payoff time; store in `segments` |
| G6 | Fetchers contradict "the app must not fetch": `_obtain` downloads `source_url`; RSS/Reddit/YouTube/manifest-URL adapters; `examples._download` (750 MB cap) | `orchestrator.py`, `sources/adapters.py`, `examples.py` | restrict to `local_path`; make network adapters opt-in and discovery-only |
| G7 | Declared-but-unused surface: `final_qa`, `audio_fingerprint`, `Source` and `Experiment` tables, `shorts.strategy`/`minimum_interval_hours`, `tts.narration_volume`, most `ClipState`/`ReviewState` members, the four scores that gate nothing (`audio_quality`, `payoff_strength`, `novelty`, `shareability`) | grep of the tree | wire or delete; document as reserved |
| G8 | No schema migrations (`create_all` only) while docs say "preserve migrations/data" | `database/core.py` | add Alembic before changing models |
| G9 | Compilation builder weaknesses: constant `hook`, 608 px strip in 1920 canvas, no creator credits in the description, placeholder thumbnails, 150-char foreshadows vs a 5 s card | `compilation.md` section 7 | as listed there |
| G10 | No local ASR with word timestamps, so no first-7-seconds profanity check and no spoken-joke evidence beyond text | `rights-and-safety.md` section 7 | local ASR (CPU) writes a transcript into the packet |
| G11 | `APPROVE ALL REMAINING` bypasses per-item review; dashboard has no auth | `dashboard.py` | restrict to a channel/day after viewing; keep localhost |
| G12 | Voice reference WAV never recorded/tracked; dots deps may not be installed; Windows font hard-coded (`arialbd.ttf`) | `assets/voices/README.md`, `render_short` | record an authorised reference; make the font configurable |

Safety-model gaps (not code defects): no reject rules for minors/injury/privacy beyond the five categories; harm confidence self-reported; credit is not a licence (`rights-and-safety.md` sections 4-5, 9).

## 4. What the 14 tests pin (`tests/test_core.py`, `conftest.py`: two-channel config `animals`/`skills`, demo mode, SQLite in `tmp_path`)

| Test | Behaviour pinned |
|---|---|
| `test_preview_slate_has_three_examples_per_channel` | slate = 3 per active channel, 9 unique slugs, platforms instagram/tiktok/x, all `discovery_only`, no stock-site URLs |
| `test_rights_separates_local_editing_from_publication` | owned = edit+publish; unknown/discovery = edit only; `no_derivatives` = neither |
| `test_temporal_fingerprint_tolerates_trim_and_small_changes` | a trimmed copy with a one-bit change scores > 0.98 |
| `test_staggered_scheduler` | 8 slots/channel, 90 min channel offset (2 channels), 3 h cycle |
| `test_pipeline_and_approval_gate` | end-to-end with faked ffmpeg: renders, writes `source-files.json`, `<n>.mp4` + `meta1.json` path for tomorrow, fingerprint row; enqueue blocked before approval, allowed after, idempotent |
| `test_next_day_numbering_continues_without_overwrite` | files 1 and 3 present -> next is 4 |
| `test_rejected_item_cannot_upload` | rejected short cannot enqueue |
| `test_approved_edit_with_pending_permission_cannot_upload` | approved + `unknown` rights cannot enqueue |
| `test_dots_tts_defaults_are_quality_first` | SOAR model, 24 steps, CFG 1.2, device/precision auto |
| `test_religious_harm_filter_physically_deletes_only_intake_media` | blocked + 0.99 confidence inside intake: source and sidecar deleted, log written |
| `test_short_crop_fill_and_original_audio_music_mix` | real ffmpeg: 1080-wide output, duration preserved with music mix |
| `test_social_manifest_keeps_public_posts_discovery_only` | social row without media stays `discovery_only`, URL canonicalised |
| `test_local_inbox_discovers_nested_source_files` | nested folder found; creator = top folder; Instagram creator URL inferred |
| `test_compilation_foreshadow_card_has_blurred_preview_and_audio` | real ffmpeg: card is 1080 wide with video + audio, >= 1.9 s |
Not tested: deletion outside the intake (the negative case), the 0.85 threshold edge, the quality-filter thresholds, routing penalty/threshold, quota stop, music-license filtering, the OpenAI provider, the dashboard (A1/A2),
the publisher's ambiguous-outcome path, analytics, the optimiser, compilation assembly (`build`), `prepare-next-day`.

## 5. State outside the repo (archive, 2026-11-01)

`H:\Projects\YTtechnews-archive-2026-11-01\small-state\` holds `ShortsFactory__data__shortsfactory.db` (160 KB), `social-clips.example.json`, `social-clips.json` (18 bytes). Read-only inspection on 2026-11-01: **demo data only** - 8 clips (all `user_owned`,
state `PENDING_REVIEW`), 8 generated Shorts across the OLD four-channel keys (2 each), 4 compilations, 12 review decisions, 12 publications (demo ids), 12 performance snapshots. No production history exists; there is nothing to migrate. Everything else
untracked (venv, `data/`, `output/` previews, the pytest temp folders) is gone or disposable. Do not treat this DB as a ledger of real posts.

## 6. Open owner questions (do not settle alone)

1. Which rights regime for a new channel in this theme: gated (ShortsFactory) or owner-accepted-risk with credit (E871 R5)? 2. Are compilations of third-party clips acceptable given YouTube's reuse stance? 3. Keep delete-on-swearing, or
adopt the technews first-7-seconds bleep? 4. Does the factory ever fetch, or only the owner? 5. Is the three-channel network (Goodness Found, Motion Explained, Meme Current) still wanted, and are the names/handles available? 6. Who owns the restored
directory (it is not in CLAUDE.md's ownership table)? 7. Who records the voice reference and under what consent? 8. Disclosure choices for synthetic narration and for AI-assisted captions.

## 7. Recommended next steps (smallest safe first)

1. Restore to a scratch directory and run the verification script; fix nothing yet (`restore-from-archive.md`). 2. Decide questions 1, 2 and 6. 3. Implement the file hand-off provider (G1) and remove API-key requirements. 4. Fix G2/G3 (approval and rights
transitions) with tests. 5. Add segment selection (G5) and the E871 reject rules. 6. Only then consider compilations (G9) and uploads (`youtube-upload-and-analytics.md`).
