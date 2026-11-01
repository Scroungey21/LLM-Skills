# Agent review: you are the LLM layer (procedure, schema, caption jobs)

The pipeline has no model backend. **The agent running the pipeline is the analysis and editing layer** (owner, 2026-10-04: "you
be the llm layer, not an external api"; also the .env model keys were dead at the time). Per clip you decide whether to post,
what the caption must ADD, and how to edit; you write it as one file; code validates, renders, stages. Follow this procedure
exactly so output is consistent between sessions. Never add an API backend.

## When
`clips.py run` (or `analyze`) prints
```
[prepare] N packet(s) await the agent (read sheet.jpg, write analysis.json):
    ...\etcherr871\data\review\<clip>
PAUSED: agent review needed. Re-run `run` once the analysis.json files exist.
```

## Read first (once per session)
- `etcherr871/vibe.json`: taste, `caption_jobs`, `caption_rules`.
- `edit-patterns.md` (this folder): research + the clip -> caption job -> edit style -> meme decision guide.
- `etcherr871/memes/catalog.json`: available reaction memes (`use_when`, `emotion`, `label_examples`, duration).
- `etcherr871/music/catalog.json`: calm CC0 beds (`mood`, `use_when`) for silent clips.

## Per packet
1. **Read `request.json`**: original post title (context only, never copied), where found, duration, size, has-audio flag
   (`music_required`), the time of each frame on the sheet, and the analysis schema.
2. **Read `sheet.jpg`**: 12 frames, opening frame (0.3 s) first, 6x2 grid, timestamps top-left. Infer motion and the payoff
   moment. If the joke clearly depends on audio you can't see evidence of, say so in `reject_reason` and score it down. Never
   guess in its favour (R15).
3. **Gates first, honestly** (R0, R7-R11):
   - `stock_footage`: **never allowed.** Stock, b-roll, library footage, stock-site/agency watermark, polished generic shot with
     no real moment, polished broadcast/arena/agency/pro-photography footage. **If in doubt, true.**
   - `unsafe`: gore, nudity, minors in distress, medical fear, tragedy, hate, or a joke that needs someone's body, disability,
     ethnicity, sexuality or poverty (incl. Nazi-lookalike gags).
   - `foreign_watermark`: another account's logo/handle on the picture.
   - `burned_in_text`: another meme page's caption/joke still visible after framing. The source creator's own speech subtitles or
     context line are fine (they often carry narration).
4. **`fit` 0-10** against vibe.json. 7+ = "I'd post this today" (`min_fit` 7). Compilations, countdowns, slideshows, ads, static
   images <= 3.
5. **Pick the caption job**: what does this clip lack that a line of text or a meme can add? Use the decision guide. If no job
   adds anything, the clip isn't worth posting: lower `fit`.
6. **Write five captions that do that job** (rules below) and pick `best_caption`. (Ingest only requires >= 3, but write five:
   the first idea is rarely the best.)
7. **Choose the edit** (`edit` object below). Default `xpost`; change only when the guide says another style adds something. For
   `bottom_meme`/`after_meme`: choose the meme by `use_when`, write a label that casts it into the situation, time `meme.start`
   at the payoff (a frame time from the sheet).
7b. **Music for silent clips.** If `request.json` says `"music_required": true` add `"music": {"id": "<track>"}` to `edit`, picked
   from `music/catalog.json` by `mood`/`use_when` (cozy, playful, wonder, suspense...). All tracks are calm CC0 beds; never Kevin
   MacLeod or anything energetic (`music.py add` refuses both). Ingest refuses a silent clip with no `edit.music`.
8. **Metadata**: `title` (<= 70 chars; a SECOND take, not the caption), `alt_titles` (2-3), `description_hook` (one sentence of
   context), `tags` (8-12, no `#`), `hashtags` (3-4 with `#`), `thumb_time` (second where the edited frame reads best).
9. **Write `analysis.json`** in the packet folder (`data/review/<clip>/`). **Rejects still need every field**, with short
   placeholders, so the record is complete.

## Caption rules (vibe.json `caption_rules` + standards)
- Every caption does one `caption_job`; a plain description, a reaction anyone would have ("this is crazy") or the original
  post title is not a caption (R14b).
- **3-15 words.** Short and punchy (<= 40 characters) gets the big bold card text automatically.
- Up to two emoji, only at the end (😂😂 🤔 💀 😭 😧). No hashtags, no wrapping quotes, no ALL CAPS, no "!!!" (hashtags, quotes and
  "!" are auto-stripped at ingest).
- True to what the clip shows; context facts come from the original post or what is visible; never invent facts.
- Laugh WITH people, never at bodies, disability, ethnicity, sexuality, poverty.
- YouTube title = a second take (emotion/hook/nickname), not a copy of the caption. Example: caption "The million-dollar question is
  how they get out of there." -> title "I got claustrophobic watching this 💀😭"; caption "This cow studied physics..." -> title
  "This cow is the Einstein of cows."
- Refer to THIS clip: if it fits fifty other clips it is not done.

## The nine caption jobs (`caption_job` values)
| Job | Use when the clip... | Shape | Example |
|---|---|---|---|
| `context` | needs one fact to land (place, price, what's happening) | plain fact, sometimes followed by an opinion beat | "A wine tank burst in a Portuguese village" -> "2 million litres 💀" |
| `hidden_skill` | hides the impressive/absurd part | name the thing; mock-expert framing optional | "This cow studied physics, vectors, calculus, and resultant force 😂😂" |
| `archetype` | shows two people/groups behaving differently | "X vs Y", or casting a person as a type | "Gen X vs millennials" |
| `question_hook` | ends unresolved, or the answer is obvious | a question that sends people to the comments | "The million-dollar question is how they get out of there." |
| `escalation` | is the latest absurd step in a trend | "Now, ...", "We've reached the point where..." | "Now, the cats are twerking😂😂" |
| `ironic_proof` | contradicts/"proves" a known belief | "Finally, proof that..." | "Finally, proof that lifting heavy doesnt make you bulky." |
| `first_person_take` | invites a personal rule or self-deprecation | "That's why I...", "Still better than me" | "That's why I always say no ice" |
| `satire_reframe` | can be read as a familiar social situation | a label that recasts the scene; keep the leap small | "3000$ rent in NYC" |
| `meme_cast` | has a person whose feeling a famous meme expresses better | label + reaction meme | "That one Pepsi fan:" + 500-cigarettes meme |

Weakest jobs (avoid): a reaction anyone would have; a reframe too far from what's on screen (e.g. "The offering plan didn't work"
got 16 K views); imagine-POV fear/medical content (worst performer, off-vibe).

## The `edit` object
| `style` | Fields | Use |
|---|---|---|
| `xpost` | `caption`, `theme` light/dark | **Default.** X-style post card with the channel avatar/handle; media keeps its aspect ratio, rounded corners |
| `post` | `caption`, `framing` crop/contain | Frame Studio card (the owner's app) |
| `meme_bar` | `caption`, `bar_position` top/bottom | White bar, black text over full-width media on black. Best for "When you..." lines over wide clips |
| `impact` | `caption` (top), `bottom_text`, `framing` | Classic Impact text with stroke over a full-screen clip. Retro irony only |
| `snap` | `snaps: [{text, y, start, end, look}]`, `framing` | Snapchat captions. `look` `classic` = translucent band, `big` = bold shadowed text. `y` = band centre 0-1 within the Shorts safe zone (clamped 0.10-0.78; agent guideline ~0.08-0.80). Several **timed beats**: setup, then reveal at the payoff (`start`/`end` seconds, `end: null` = until the end) |
| `bottom_meme` | `caption`, `theme` (dark default), `framing` (`crop` fills top area), `meme {id, label, start, volume}` | Card + clip on the top 56 %, label on the split line, reaction meme on the bottom. The meme starts at `start`; before that its first frame is held |
| `after_meme` | `caption`, `base` (style for the clip part, default xpost), `meme {id, label}` | Clip in its base style, hard cut to the full-screen meme with the label as a meme-bar caption (the meme as a verdict) |

`framing` (full-screen styles): `crop` fills 9:16; `contain` keeps the whole clip over a blurred copy. If omitted, clips narrower
than ~0.7 width/height fill the canvas and wider ones get the blurred fill. `edit.music` = `{"id": "<track>"}` on any style.

## Schema (`analysis.json`)
```json
{
  "fit": 8,
  "reject_reason": "",
  "foreign_watermark": false,
  "burned_in_text": false,
  "stock_footage": false,
  "unsafe": false,
  "summary": "One sentence: what happens.",
  "caption_job": "hidden_skill",
  "captions": ["...", "...", "...", "...", "..."],
  "best_caption": "...",
  "edit": {"style": "xpost", "caption": "...", "theme": "light"},
  "title": "...",
  "alt_titles": ["...", "..."],
  "description_hook": "...",
  "tags": ["...", "..."],
  "hashtags": ["#...", "#..."],
  "thumb_time": 5.4
}
```
Authoritative field lists: `SCHEMA` in `mc/analyze.py`, edit fields `EDIT_SCHEMA` in `mc/styles.py`. **Ingest rejects** (the file
then waits for a fix) a file that is missing fields, has fewer than 3 captions, an invalid style, missing style-required fields,
an unknown meme id, or runs over 60 s with the meme added. A silent clip without `edit.music` is also refused. A verdict that
fails a gate (stock/unsafe/watermark/burned-in/fit<7) marks the clip `rejected` with `reject_reason`.

## After writing
Run `clips.py run` again: it ingests, renders, QCs, stages. **Open at least one rendered `thumbnail.png` per batch, and a mid-clip
frame for timed styles (snap, bottom_meme, after_meme).** Check text sits inside the safe zone, the label sits on the split, the
meme starts on the payoff. To change a verdict later: edit `analysis.json`, then `clips.py redo <clip-id>` (re-renders and
re-stages in the same slot).

## Worked examples
First batch (2026-10-04), redone under these rules:
| Clip | Caption job | Edit |
|---|---|---|
| Wine floods a Portuguese street | `context` -> take | `snap`: classic band "A wine tank burst in a Portuguese village" (0-4 s), then big beat "2 million litres of red wine 💀" |
| Sabonis leaning down to Shaq | `hidden_skill` (role reversal) | `xpost` dark: "Shaq getting leaned down to for once" (this Shaq clip was later pulled under R0b "looks like stock") |
| Real-shadow video game | `hidden_skill` | `xpost` light: "The level is literally just shadows" |
| Self-cut fade (burned subtitles) | n/a | rejected: another layer of text, hair sits too high |

From the reference research:
| Clip | Caption job | Edit |
|---|---|---|
| Ashtray "poll", Coke side overflowing | `meme_cast` | `bottom_meme` + `orville-500-cigarettes`, label "That one Pepsi fan:" |
| Game-show contestant's confidently baffling answer | `meme_cast` (verdict) | `after_meme` + `galaxy-brain` |
| Cow crossing a river at an angle | `hidden_skill` | `xpost`: "This cow studied physics, vectors, calculus, and resultant force 😂😂" |
