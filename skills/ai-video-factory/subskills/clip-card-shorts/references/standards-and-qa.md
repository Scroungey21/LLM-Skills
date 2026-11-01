# Etcherr871 standards and QA (measurable specs)

Each line names where it is enforced so a change is made in the right place.

## Output video
| Property | Standard | Enforced in |
|---|---|---|
| Canvas | 1080x1920, 30 fps, yuv420p | Frame Studio `layout.py` / `mc/render.py` |
| Video codec | H.264 (libx264), CRF 20, preset medium, `+faststart` | same |
| Audio | AAC 192 kb/s, loudness-normalised -16 LUFS integrated, -1.5 dBTP, LRA 11 | same |
| Silent sources | Silent AAC track added (uploads always have an audio stream); silent clips additionally need a music bed (R15b) | same / ingest |
| Duration | 2-60.5 s | `mc/render.py` `qc()` |
| Minimum size | > 100 kB (catches broken encodes) | `qc()` |
| Edit style | `post` (Frame Studio) or an `mc/styles.py` port, per clip in `analysis.json -> edit` | `mc/render.py` |
| Framing | `crop` (fill) or `contain` (blurred fill) for full-screen styles and `post`; `xpost` keeps aspect ratio | `mc/styles.py` |

## Edit-style geometry (1080x1920)
| Style | Ported from | Spec |
|---|---|---|
| `xpost` | Braketools social-post-meme (X card) | light #FFFFFF / text #0F1419 or dark #000 / #E7E9EA; 48 px padding; 112 px round avatar (config `profile.pfp`); name bold 42 px, handle 34 px muted; caption Segoe UI bold 66 px if <= 40 characters, else regular 54 px, line height 1.2; media at its own aspect ratio, 28 px radius, 2 px border; block centred vertically; verification badge only if `profile.badge` is set |
| `meme_bar` | meme-frame caption-top/bottom | white bar, black Arial 62 px (~width/18), line height 1.25, 4 % padding, centred; media full width; block centred on black |
| `impact` | meme-frame impact | uppercase Impact 104 px (~width/10), 7 px black stroke, line height 1.15, 90 % width; top text at the 8 % safe line, bottom text ending at the 80 % safe line |
| `snap` classic | snapchat-caption classic | full-width rgba(0,0,0,0.5) band, white Segoe UI 56 px, line height 1.55, 92 % width, centred on `y` |
| `snap` big | snapchat-caption big | white Segoe UI bold 84 px, soft shadow, line height 1.25, 90 % width |
| `bottom_meme` | reference format (31 M-view Short) | top 56 %: dark `xpost` card + clip (`framing: crop` fills); label white bold 62 px with 6 px black stroke, left 40 px, ON the split; bottom 44 %: meme cover-cropped, starting at `meme.start` (first frame held before) |
| `after_meme` | other meme channels (clip -> verdict) | clip in its `base` style, hard cut to the meme as a `meme_bar` with the label |

Safe zone for timed text: `y` clamped to **0.10-0.78** (Shorts UI covers ~top 8 % and bottom 20 %). Colour emoji from Segoe UI
Emoji.

## Source intake
| Property | Standard | Enforced in |
|---|---|---|
| Max download resolution | 1080p | `mc/fetch.py` (yt-dlp format string) |
| Max download size | 150 MB | `mc/fetch.py` |
| Source duration | 2-60 s (`max_seconds`); never trimmed, only rejected | `mc/fetch.py` |
| Duplicate threshold | dHash of middle frame, <= 6 of 64 bits different = same clip | `mc/fetch.py` |
| Reddit polling | anonymous Atom feed, honour `x-ratelimit-reset` (~1 request / 45 s), multireddit batches (`batch_size`) | `mc/sources.py` |
| Silent detection | no audio stream or max volume < -45 dB => `music_required` | `mc/audio.py` |

## Caption and metadata
| Field | Standard |
|---|---|
| Caption | 3-15 words doing one `caption_job`; up to 2 trailing emoji; no hashtags, wrapping quotes, ALL CAPS or "!!!" (hashtags, quotes, "!" auto-stripped at ingest) |
| Title | <= 70 characters (hard cap 100), no hashtags; second take, not the caption |
| Alt titles | 2-3 -> `titles.txt` (first line = chosen title) |
| Tags | 8-12 from the agent; comma line <= 500 characters combined (truncated at whole tags) -> `tags.md` |
| Hashtags | 3-4 topical + config defaults, max 6 total, last line of the description |
| Description | Built by `mc/stage.py build_description`: hook sentence, blank line, `Original video: <url>`, `Credit: <author> (<platform>)` (only when the uploader is known), `Music: "<title>" by <artist> (<license>) <source_url>` (only when `edit.music` is set), optional footer after a blank line, then the hashtag line (blank line before it) |
| Hashtag merge | agent `hashtags` first, then `config.description.default_hashtags`, de-duplicated in that order, first 6 kept (so the agent's 3-4 topical tags always survive, defaults fill the rest) |
| Tags assembly | `#` stripped, de-duplicated, joined with `,` (no spaces); stops before the tag that would push the count past 500 (each tag costs its length + 1 comma after the first) |
| Category | Comedy; `made_for_kids` false (manifest keys) |

## Review packet (agent hand-off)
Contact sheet: 12 frames = opening frame (0.3 s) + 11 evenly spaced; 6x2 grid; 240 px wide cells; timestamp label on each.
`request.json`: original title, origin, duration, size, has_audio / `music_required`, frame times, analysis schema.
Answer: `analysis.json` with every schema field (`agent-review-and-captions.md`).

## QA checklist per batch (what to actually do)
1. `clips.py status`: after a full pass the new clips read `staged` with a date + slot; anything left at `downloaded`
   (waiting for you), `analyzed` or `rendered` needs a reason (QC failure, `plan` window too short, or a missing verdict).
2. Open at least one `thumbnail.png` (1080x1920 frame of the finished card at `thumb_time`) per batch.
3. For timed styles (snap, bottom_meme, after_meme) open a mid-clip frame: text inside the safe zone, label on the split, meme
   starts at the payoff.
4. Confirm `description.txt` contains `Original video:` and `Credit:`; `sources.md` repeats them; silent clips credit the bed.
5. QC failures are rejections, not warnings: never stage or hand-patch a broken file (R13, R18). Re-render, then re-run
   `schedule_release.py` so `sha256` stays true.
6. Stock check once more on anything polished-looking (R0b).
