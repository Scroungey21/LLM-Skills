# Rights, permission states, content safety and meme rules

Source: `rights/policy.py`, `config.py` (`ELIGIBLE_RIGHTS`), `approval/service.py`, `orchestrator.py` (`_delete_blocked_source`),
`ai/provider.py` (harm filter + prompt), `audio/music.py`, `skills/.../content-and-safety-standards.md`, README, `tests/test_core.py`;
plus the technews `audit-remediation` spec (Requirement 7, profanity) read from the old tree. Ids `SF-D#` are in `decision-log.md`.

Contents: 1 Permission-state machine - 2 Where the gates fire - 3 Provenance and credit - 4 Regime comparison and open risk -
5 Harmful-content deletion gate - 6 Meme and humour safety - 7 Profanity and the first-7-seconds rule - 8 Music and voice rights - 9 Risk register

## 1. Permission-state machine (`evaluate_rights`)

`rights_status` is a plain string on the clip, set from the sidecar (or the source's configured default). `evaluate_rights(status, eligible)` returns
`(can_edit, publishable)`:

| `rights_status` | can_edit | publishable | Outcome |
|---|---|---|---|
| `user_owned`, `explicit_permission`, `licensed`, `public_domain`, `cc0`, `cc_by`, `approved_creator_feed` (the **eligible set**) | yes | **yes** | renders; `permission_status: cleared` |
| `unknown`, `discovery_only`, ANY other string | yes | no | renders locally; `permission_status: permission_pending`; cannot be upload-ready |
| `non_commercial`, `no_derivatives`, `prohibited` | **no** | no | `RIGHTS_REJECTED`; never rendered |

Rules that make this a state machine rather than a flag:
1. **Editing and publishing are separate permissions** (SF-D11). Unknown-rights media may be edited so the owner can ask permission ONCE, in a batch, after
   seeing the finished edit (`reports/weekly.py` writes `permission_request_queue.csv`: short id, channel, video path, source URL, creator, creator URL, status).
2. **Editorial approval never grants rights.** `ready_for_upload` = persisted `APPROVED` decision AND clip status in the eligible set. For a compilation: EVERY
   underlying clip must be eligible ("a compilation inherits the strictest uncleared source").
3. **Fail-safe default:** anything not recognised is edit-only and not publishable. Preview slates add `preview_only: true` (local audition renders of
   `discovery_only` media; metadata `publishable: false`, `upload_enabled: false`).
4. **Unrecognised restrictions leak into "editable".** The standards doc says an "equivalent explicit restriction" blocks editing too, but the code matches only
   the three strings above; `cc_by_nc`, `cc_by_nd`, `all_rights_reserved`, `cc_by_sa` (not in the eligible set) would be edit-allowed/publish-pending.
   Normalise at intake: map every NC/ND/explicit-denial to `non_commercial` / `no_derivatives` / `prohibited`. Decide `cc_by_sa` (share-alike) deliberately.
5. **No grant transition exists in the code (gap G3).** `discover()` skips an existing `canonical_url`, so a sidecar updated after permission arrives never
   reaches the DB row, and there is no CLI to set rights. To clear a clip: update the DB row's `rights_status/license/license_url/attribution_required` (or add an
   upsert + `rights set` command), keep the written permission with the sidecar, then re-render if the credit text changes. Keep the permission record, not only the status.

## 2. Where the gates fire (all must agree)

| Gate | Code | Effect |
|---|---|---|
| Intake | `evaluate_rights` in `process()` (after analysis and the safety gate) | restricted -> `RIGHTS_REJECTED` |
| Output label | `meta<n>.json` `publishable`, `permission_status` | machine-readable, copied into the next-day manifest |
| Approval | `approval.service.ready_for_upload` | rights re-checked at approval/enqueue time, not at render time |
| Publisher | `YouTubePublisher.enqueue/upload` | raises `PublicationGateError` unless ready (twice: at enqueue and again at upload) |
| Compilation | `ready_for_upload("compilation")` | all member clips eligible; the BUILDER itself does not filter on rights (only `APPROVED`) |
| Music | `audio/music.py licensed_music_tracks` | track needs a sidecar with `rights_status` in the eligible set AND a non-empty `license` |

Tests that pin this: `test_rights_separates_local_editing_from_publication`, `test_approved_edit_with_pending_permission_cannot_upload`,
`test_rejected_item_cannot_upload`, `test_social_manifest_keeps_public_posts_discovery_only`.

## 3. Provenance and credit (what must travel with every clip)

Keep per clip: `source_url`, `canonical_url`, platform, creator + creator URL, `license` text (e.g. "Written permission dated 2026-08-28"),
`license_url`, `attribution_required`, SHA-256, and the sidecar itself. Outputs carry them in `meta<n>.json`, `source-files.json`, and the weekly
`credits.csv`. A public post URL alone is **discovery-only** (SF-D4, README): the social adapter refuses to treat a row as cleared unless it names
a local file or a creator-supplied direct media URL. "Never infer social-media usage rights from public availability" (`tooling.md`).
Gap: the shorts' description text is "source credit is listed below" but the compilation description does not list creators (`compilation.md`).

## 4. Regime comparison and the open risk (read before starting a channel in this theme)

| Question | ShortsFactory (design, Aug-Sep 2026) | Etcherr871 (live, 2026-10-04) |
|---|---|---|
| Who fetches clips? | the OWNER places files in the inbox | the pipeline fetches via yt-dlp from verified sources |
| Rights model | gated: unknown = edit-only, publish needs a cleared status | R5: any publicly reachable video may be used; owner accepts the risk; credit link in every description |
| Credit | creator + URL kept in metadata; `attribution_required` flag | `Original video: <url>` + `Credit: <uploader> (<platform>)` auto-written into every description |
| Compilations | allowed (built from approved, cleared Shorts) | forbidden (R11: compilations/countdowns fit <= 3) |
| Stock footage | forbidden (SF-D4) | forbidden, absolute (R0) |

They are different owner decisions for different channels; E871's is later (2026-10-04) and applies only to E871. **Do not mix them silently:** a new channel in this
theme needs an explicit owner choice of regime, recorded with a date. Open risks to state to the owner, not to resolve alone:
- Third-party clips without a licence or written permission can draw copyright claims/strikes and takedowns regardless of credit. Credit is not a licence.
- **Platform originality pressure.** E871's current-state records YouTube's 2026-10-01 statement that channels mainly re-uploading others' clips "without significant changes"
  would lose Shorts-feed distribution (describing the screen, minor technical edits and template-based bulk changes are not enough; original commentary and unique
  editing count) - a recommendation change, monetisation separate. One contextual line over a found clip is close to that line, and a compilation of third-party Shorts is closer.
  This is reported second-hand (a trade-press link in E871's docs); re-check YouTube's current monetisation/reuse policy before launch. Do not design around detection.
- AI disclosure: Shorts here are real footage with an AI-assisted caption; compilation interstitials may use a synthetic cloned voice. Set YouTube's altered/synthetic-content
  disclosure truthfully per upload (the archived publisher sets neither that nor the made-for-kids field; see `youtube-upload-and-analytics.md`).
- Personal data: creator handles, faces and voices of private people appear in the clips; the harm filter does not cover privacy. Treat minors, medical situations and
  identifiable private individuals as reject-by-default (E871 R7 wording below) even though SF-D10 does not list them.

## 5. Harmful-content deletion gate (SF-D10; the owner's "religious-harm" filter)

**Categories (the ONLY ones that delete),** emitted in the normal analysis response as `religious_harm_filter {blocked, categories<=5, confidence 0-1, evidence<=180 chars}`:
1. `nudity_or_partial_nakedness` - includes bikinis, lingerie, crop tops, or comparable revealing clothing.
2. `uncensored_swearing`.
3. `direct_religious_insult_or_blasphemy` - direct, uncensored attacks on Muslims, Christians, Jews, or their beliefs.
4. `sexual_subject`.
5. `tempting_or_influential_drug_subject` - glamorises, tempts, instructs, promotes, or could influence drug use. **Not** blocked: neutral prevention, recovery, medical,
   documentary or condemnatory drug discussion; unrelated non-drug criminal jokes ("harmless criminal jokes" are in-theme for the memes channel).

**Evidence rule:** direct visible, spoken or written evidence only; never infer a violation from identity, clothing alone, or context not shown. One short evidence sentence.

**Efficiency invariants (why one call):** dedupe first; the harm decision is part of the clip-analysis response (no second moderation request); cache by
`provider:religious-harm-v1:<sha256>` so changing the policy label re-evaluates; sample frames evenly, transcribe at most 60 s of audio.

**Deletion procedure (all must hold; `_delete_blocked_source`):**
1. `content_safety.enabled` and `blocked` and `confidence >= 0.85` and `physically_delete_blocked`.
2. Resolve the real path and prove it is inside a configured, enabled `local_inbox` root (`is_relative_to`); otherwise do NOT delete (clip is still `FILTER_REJECTED`).
3. Append one JSON line to `data/deleted-content.jsonl` BEFORE deleting: `deleted_at, clip_id, path, canonical_url, sha256, categories, confidence, evidence` (no media).
4. Purge model-side cache (frames, audio derivative), then unlink the video and, when `delete_sidecars`, `<file>.json` and `<file>.context.json`.
5. Never delete outside the intake, never use a glob/recursive target, never delete as a side effect of validation or demo runs.
Test: `test_religious_harm_filter_physically_deletes_only_intake_media` (source + sidecar gone, log exists, `result["deleted"] == 1`).

**Agent-as-LLM-layer reading.** Claude fills the filter fields itself from the frames and transcript; the code applies the threshold and the deletion. The confidence is
self-reported, so the one irreversible action in the system rests on a number Claude chose. Recommended safeguards (proposals, not archived behaviour): run the first
batches with `physically_delete_blocked: false` and review the `FILTER_REJECTED` list; state in `evidence` what was seen; never raise confidence to force a delete or lower it
to avoid one. Agent-principles section 5 records this deletion as an owner-codified, narrow step: never extend it to other files or invent new deletion steps.

## 6. Meme and humour safety (channel `memes` = Meme Current)

In-theme: memes, reaction humour, relatable situations, absurd comedy, visual jokes, harmless criminal jokes. Commentary rule (channel prompt): explain the premise or hidden
context briefly, **preserve the punchline, never add a generic reaction, never explain the joke away.** The five deletion categories apply to every channel; quality thresholds
(`family_safety >= 0.8`, `brand_safety >= 0.8`) catch the rest. Ports from the live sibling (E871 R7-R9, `../../clip-card-shorts/references/principles-and-rules.md`) that the
archived design lacks and a new meme channel should adopt as REVIEW rules: reject gore/injury, minors in distress, medical fear, real tragedies, hate/harassment and any joke built
on someone's body, disability, ethnicity, sexuality or poverty (never punch down); reject another meme page's burned-in caption/watermark (the creator's own speech subtitles may stay);
mark what you cannot judge (audio-only jokes, cropped text) instead of guessing in the clip's favour.

## 7. Profanity: the archived rule, and the first-7-seconds rule from technews

- **ShortsFactory:** uncensored swearing ANYWHERE in the clip is a deletion category (section 5) - strict because the original audio is kept at full volume (SF-D3) and cannot be hidden.
- **technews (`kiro-specs/specs/audit-remediation`, Requirement 7, in the old tree):** profane language in the opening **7 seconds** of a video can trigger an advertiser-friendliness
  review of the whole channel. (7.1) script validation flags scene-0 text containing a wordlist term; (7.2) the audio pass scans word timestamps whose `start < 7.0 s`, and overlays a
  1 kHz sine tone over each flagged word's own interval (replacing, not layering over, the audio), independent of whether the text check caught it, on the FINAL mixed audio;
  (7.3) the wordlist is configuration, not inline (v1: ten obvious terms, case-insensitive). Implemented in the archived engine as `app/audio/censor.py`, `app/config/profanity_wordlist.py`,
  test `tests/test_audio_duck_censor.py`; restorable per `legacy-and-removed.md`.
- **Port for a found-clip factory (proposal, not implemented in ShortsFactory):** a deterministic pass on the clip's own audio - local ASR with word timestamps (the archived pipeline
  transcribes text only, no timestamps; E871's roadmap lists faster-whisper on CPU) -> wordlist hit with `start < 7.0 s` -> either bleep that word (technews behaviour) or reject the
  clip. **Open owner decision:** ShortsFactory's settled rule is delete-on-swearing (SF-D10); bleeping is the softer technews behaviour. Do not switch without a dated decision.
  The "7 seconds / advertiser review" premise is the spec's own stated reason; verify it against YouTube's current advertiser-friendly guidance before leaning on the number.

## 8. Music and voice rights

- **Music** (`assets/music/README.md`): every track needs a same-name sidecar `<track>.mp3.json` with `title, artist, source_url, rights_status, license, license_url`
  (+ `attribution_required`, `downloaded_on`). Sources allowed: YouTube Audio Library download, own tracks, CC0/public domain, commercial licence that permits monetised YouTube use.
  "Do not use a track merely because a webpage calls it copyright free." The one tracked track: `calm-loop-cc0.mp3` (CC0, OpenGameArt, 2026-08-28). Credit text goes in the description.
  Compare E871's stricter bed rules (CC0 only, energy <= 6.0, never Kevin MacLeod) in `../../clip-card-shorts/references/principles-and-rules.md`.
- **Voice:** the compilation narrator is cloned from a reference recording the operator owns or may clone; the research notes zero-shot cloning misuse as a deployment risk.
  Details and the missing reference file: `tts-narration.md`.
- **Brand photos:** the five channel avatars are real Pexels/Pixabay photographs (`assets/branding/README.md`), recorded with sources; recheck licences before launch. This is
  the avatar only; the stock-footage ban concerns clip content.

## 9. Risk register

| # | Risk | Status |
|---|---|---|
| R1 | Unlicensed third-party clips (copyright claim, strike, takedown) | Mitigated only by the permission gate; credit is not a licence |
| R2 | Reused-content / originality pressure on YouTube | Open; compilations and thin-caption Shorts most exposed |
| R3 | Irreversible deletion on a self-reported confidence | Guarded (intake root, audit line); keep a dry-run phase |
| R4 | Edit-allowed leak for unrecognised restriction strings | Open (normalise at intake) |
| R5 | No rights-grant transition | Open (gap G3) |
| R6 | Synthetic-voice consent / AI disclosure | Reference must be owned/permitted; disclosure not set by the publisher |
| R7 | Harm filter misses privacy, minors, injury | Open; add the E871 reject rules |
| R8 | Model asked to judge audio it cannot hear | Mark "not heard"; transcript required for spoken jokes |
