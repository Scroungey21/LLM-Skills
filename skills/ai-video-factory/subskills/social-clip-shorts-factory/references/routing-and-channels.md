# Channels, routing clips to channels, branding and quotas

Source: `config.example.yaml`, `routing/router.py`, `scheduling.py`, `orchestrator.py`, `assets/branding/README.md`, `content-and-safety-standards.md`, `current-state.md`, decision SF-D9.

Contents: 1 The three active channels - 2 Disabled legacy channels and why - 3 Routing algorithm - 4 Quotas and slots - 5 Branding and avatars -
6 Adding or merging a channel - 7 What to port to or from Etcherr871

## 1. The three active channels (network design, SF-D9)

| Key | Display name / handle | Accent | Takes | Commentary voice (`commentary_prompt`) |
|---|---|---|---|---|
| `good_moments` | Goodness Found / `@goodnessfound` | `#DC6B8A` | kindness, reunions, wholesome interactions, thoughtful gestures, pets, wildlife, animal intelligence, harmless funny animal behaviour | warm, observant, lightly witty; never fabricate a backstory |
| `how_things_work` | Motion Explained / `@motionexplained` | `#64748B` | machines, manufacturing, tools, repair, engineering, construction, precision, craftsmanship, sports technique, coordination | explain the visible mechanism or practiced technique viewers may not notice |
| `memes` | Meme Current / `@memecurrent` | `#F59E0B` | memes, reaction humour, relatable situations, absurd comedy, visual jokes, harmless criminal jokes | explain the premise or hidden context briefly; preserve the punchline, never add a generic reaction |

Every channel has `fit_threshold` 0.65 (default), its own YouTube channel id + OAuth profile (only used when upload is enabled), PFP, accent colour, and legacy `tts_speaker`/`tts_instruct`
(vestigial, see `tts-narration.md`). Handle/name uniqueness research was a point-in-time suggestion, not a trademark or availability guarantee: **recheck immediately before creating accounts**.

Use observed content, not filenames, for the final route (a filename hint is only the demo provider's heuristic). When a clip fits several channels choose the one whose viewer gets
the clearest value; the schema allows one assignment per clip (`channel_assignments.clip_id` unique), so the same source is never posted on two channels.

## 2. Disabled legacy channels (kept in YAML, `enabled: false`)

`animal_moments` ("Creature Logic", `@creaturelogic`, `#5B8DEF`) and `human_skill` ("Practiced Hands", `@practicedhands`, `#9B6BE8`) were the original four-channel split. SF-D9 reduced four to three:
pets/wildlife merged into `good_moments`; precision/craft/sports merged into `how_things_work`. The decision log records the merge but NOT its reason; the likely one (inference) is that fewer,
broader channels fill a daily quota from an inbox observed to hold thousands of files, mostly memes (`tooling.md`), without splitting a small audience. Their avatars and test names remain in the repo (`creature-logic.jpg`,
`practiced-hands.jpg`; the `.pytest-tmp-two-channel*` / `three-channel` folders left on disk show the split being tried). Re-enable only on an owner decision.

## 3. Routing algorithm (`routing/router.py`)

```
for each ACTIVE channel k:
    raw      = channel_fit[k]                       # 0-1, written by Claude in the analysis
    penalty  = min(0.15, 0.002 * assignments_in_channel(k))   # crowding penalty over ALL history
    eligible if raw >= fit_threshold(k)             # threshold uses RAW fit, not the adjusted score
choose max(raw - penalty) among eligible            # exact ties fall to the alphabetically later channel key (tuple max)
no eligible channel -> clip FILTER_REJECTED ("no channel fit exceeded threshold")
```
Notes: the penalty needs 75 prior assignments to reach its 0.15 cap, so it only nudges close calls toward emptier channels; it is never a quota. The result stores `fit_score` (raw) and
`diversity_penalty` on `channel_assignments`. If the winning channel already has `max_per_day_per_channel` outputs for the target day, the clip is parked as `ASSIGNED` and retried next run
(it keeps its channel; it is not re-routed to a channel with room - a deliberate simplicity gap; a smarter version would re-route to the runner-up above threshold).
Claude's job is to make `channel_fit` honest and discriminating (one clear winner), since the rule is mechanical.

## 4. Quotas and slots

`shorts.max_per_day_per_channel` (default 8) per channel; stop when ALL channels are full; report `missing_by_channel`. Slots are computed for metadata only (the factory does not upload):
channel i, cycle c at `c * interval + i * (interval / n_channels)` hours-of-day (default 3 h, so channels are 1 h apart and each channel posts every 3 h). Compilation slot: Wednesday or
Sunday 17:00 plus one hour per channel index. Cadence is a config number, not an owner-fixed slot list (compare E871's fixed 09/13/17/21): adaptive tuning is in
`youtube-upload-and-analytics.md` section 4. Eight Shorts a day per channel is a ceiling, not a target: a channel with too few cleared clips should post fewer.

## 5. Branding and avatars

Layout puts the real-photo PFP (112 px circle), display name, handle and the contextual text in the top area of every Short (`rendering-formats.md`). PFPs are deterministic square crops of **real
photographs** (no generated faces): Goodness Found = hands exchanging limes (Pexels, Zeal Creative Studios); Creature Logic = dog portrait (Pexels, Jakaria Hussain Adnan); Motion Explained = gears
(Pexels/Pixabay, CC0 on the source page); Meme Current = yawning cat in window light (Pexels, Boyana Georgieva); Practiced Hands = potter's hands (Pexels, Sima Ghaffarzadeh). Sources are listed in
`assets/branding/README.md`; re-check the licence record before launch and keep that README with the assets. `assets/branding/source/` holds the uncropped originals.
Without a PFP file the header falls back to a coloured circle with the channel initial.

## 6. Adding or merging a channel (steps)

1. Decide the viewer promise and the one-line `commentary_prompt` (what does the overlay ADD for this audience?). 2. Write `categories` as concrete subjects Claude can match from frames.
3. Pick `fit_threshold` (0.65 default; raise it if the channel keeps getting borderline clips). 4. Choose a real-photo PFP with a recorded licence; pick an accent colour. 5. Add the YAML block
(enabled), check the preview slate rule (exactly 3 items per ACTIVE channel, so update `examples/*.yaml`), and run `doctor`. 6. Keep analysis `channel_fit` keys equal to the active channel keys.
7. Only after the owner has chosen the rights regime for the new channel (`rights-and-safety.md` section 4) start intake.
Merging channels is a config change plus re-routing of future clips; already-rendered Shorts keep their old `channel_key` and folders.

## 7. What to port between ShortsFactory and Etcherr871 (full list in `vs-clip-card-shorts.md`)

- ShortsFactory -> E871: the multi-channel routing idea (if E871 ever splits into themes, reuse `fit_threshold` + per-channel quota + `ChannelAssignment`), the rights-state vocabulary and
  permission-request queue, and the compilation machinery (E871 forbids compilations today, R11).
- E871 -> ShortsFactory: variety across a day (no two neighbouring slots share a source or style; ShortsFactory has no such rule), the nine caption jobs, `fit >= 7` as a hard "would I post
  this today" bar, and the release-calendar folder shape.
