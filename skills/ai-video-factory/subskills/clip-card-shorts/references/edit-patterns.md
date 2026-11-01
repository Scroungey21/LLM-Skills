# Edit patterns: what the caption, meme or beat adds to a clip

Research done 2026-10-04 for Etcherr871. Question: **given a clip, which caption, edit style or added meme makes it better, and
why?** The decision guide (section 4) is what the agent applies at review.

## 1. Method and limits
- Corpus: `etcherr871/research/corpus/` (gitignored videos), collected with `research/research.py`: reference channel
  @BeYourselfOkBro (10 most-viewed + 4 most recent Shorts), Chat Music, and Shorts found by format-phrase searches ("that one
  friend", "nobody: me:", "POV", "snapchat caption", "reaction", "bro thought", <= 60 s, >= 300 K views).
- Reading: a 12-frame contact sheet per video + YouTube auto-captions for speech. Per video: what the clip shows, the edit format,
  the added text/meme, the RELATION between addition and clip, what the addition contributes.
- Dataset: `research/edits.jsonl`, 23 analysed videos (`clip, format, caption, meme_addition, relation, what_it_adds, views, tier`).
- Limits: views reflect age and luck as well as the edit. Search-sourced examples skew to animation memes (Roblox, Minecraft,
  gacha), noted but unused because this channel posts real footage.

## 2. Reference channel (@BeYourselfOkBro): what actually works
| Views | Caption | Relation | What the caption adds |
|---|---|---|---|
| 31 M | "Coca-Cola fans throwing away their lung just to prove 'Coca-Cola is the best' 😂" + bottom meme "That one Pepsi fan:" (The Orville, "500 cigarettes!") | meme_cast | Caption explains the image's joke; the meme casts a famous scene as one person INSIDE the situation, its dialogue is the punchline |
| 2.5 M | "Gen X vs millennials" | archetype | Turns two strangers + a wave into a generational comparison everyone has an opinion on |
| 1.8 M | "This cow studied physics, vectors, calculus, and resultant force 😂😂" | hidden_skill | Names what you'd miss: the cow aims upstream to cancel the current |
| 1.2 M | "Now, the cats are twerking😂😂" | escalation | "Now, ..." frames it as the internet going one step too far |
| 1.0 M | "The million-dollar question is how they get out of there." | question_hook | Plants a question the clip never answers; people watch to the end and argue |
| 377 K | "The resemblance is actually crazy." | reaction (weak) | Adds nothing; the compilation theme carries it |
| 283 K | "Finally, proof that lifting heavy doesnt make you bulky." | ironic_proof | Uses the clip as mock evidence in a known debate |
| 269 K | "Does anyone know why this happens? 🤔" | question_hook (fake-innocent) | Answer is obvious (cat hates kisses); people rush to say so |
| 95 K | "That's why I always say no ice" | first_person_take | A personal rule viewers adopt or argue with; the source's "$24" line gives context |
| 81 K | "Still a better dancer than I am." | first_person_take | Self-deprecating: you laugh WITH the man |
| 56 K | "3000$ rent in NYC" | satire_reframe | Recasts a wall cut-out as an overpriced apartment |
| 16 K | "The offering plan didn't work." | satire_reframe (too far) | Leap from clip to "sacrifice ritual" too big |
| 13 K | "Imagine holding a trash bag... then an HIV-contaminated needle pricks your hand 😧" | imagine_pov (fear) | Medical fear, not humour; off-vibe, worst performer |

Patterns:
1. **Every hit caption does a job** (explains the hidden thing, casts people, escalates, asks, or casts a meme). Weakest: a
   reaction anyone would have; a reframe too far from the screen.
2. **Two text layers, two jobs**: the YouTube title is a second take, not a copy of the caption.
3. **Emoji are normal**: 7 of 13 captions/titles end in one or two, never mid-sentence.
4. **The source's own text often stays** when it carries narration/context (creator speech captions, the "$24" line, a CCTV
   timestamp). What must not stay is ANOTHER meme page's joke.
5. **Caption size follows length**: short (<~ 25 chars) big and bold; longer regular weight on two lines.
6. **Format**: 12 of 13 use the light post card; 1 of 13 the bottom-meme split, which is the channel's biggest video by 12x.

## 3. Other meme channels
| Pattern | Example | Lesson |
|---|---|---|
| Clip, then a reaction meme | Game show "FROG / MILK / REGULAR / SNOW" answer -> galaxy-brain montage (2.4 M) | The meme PASSES JUDGEMENT: clip = setup, meme = punchline = our `after_meme` |
| Timed comment cards + sung audio | Chat Music (4-10 M) | Timed beats keep retention (our `snap` beats). Their content is body/ethnic/sexual roasts of real people incl. a disabled person: **off-limits here** |
| Impact text used ironically | Minecraft "MRBEAST PLEASE COMMENT / BOTTOM TEXT" (19 M) | Impact now reads as retro irony: a deliberate choice, not a default |
| Raw clip, title-only context | 5 s fall behind Tom Holland (35 M); bloopers (2-4 M) | Huge reach but exactly the "re-upload without significant changes" YouTube demoted on 2026-10-01 (see `current-state.md`). Always add a caption job; a title-only detail is a hidden_skill job we move into the caption |
| Characters composited over real photos | MemeRec SpongeBob/Patrick (7.4 M) | Needs cut-out animation: out of scope |

## 4. Decision guide: clip -> caption job -> edit style -> meme
| What the clip has | Caption job | Edit style | Meme / library id |
|---|---|---|---|
| A skill or detail people miss | `hidden_skill` | `xpost` (or `post`) | none |
| Two people/groups contrasting | `archetype` | `xpost` | none |
| Animal or kid copying a trend | `escalation` | `xpost` | none |
| Unresolved situation / obvious answer | `question_hook` | `xpost` | none |
| Someone overdoing it, doubling down, going all-in | `meme_cast` | `bottom_meme` (dark, label "That one X:") | `orville-500-cigarettes` |
| A confidently dumb or over-engineered move | `meme_cast` | `after_meme` (label "His brain making that decision:") | `galaxy-brain` |
| A small, harmless misfortune | `meme_cast` | `bottom_meme` (label "The guy who ...:") | `sad-hamster-violin` |
| Something suspicious or too convenient | `meme_cast` | `after_meme` | `rock-eyebrow` |
| A twist the viewer won't see coming | `context` -> reveal | `snap`: setup beat until the payoff, reveal after (or `after_meme` + `cat-shocked`) | optional `cat-shocked` |
| Needs a fact first, then a take | `context` | `snap` (classic band for the fact, then a big beat for the take) | none |
| Relatable "when you..." situation, wide clip | `first_person_take` / `satire_reframe` | `meme_bar` | none |
| Deliberately retro/ironic tone | any | `impact` (sparingly) | none |

Pick `xpost` by default; switch only when the guide says another style adds something:
`snap` when the clip needs a fact first and a take at the payoff - `bottom_meme` when a reaction meme can play a character INSIDE
the situation - `after_meme` when a meme can deliver the verdict - `meme_bar` for "when you..." lines over wide clips - `impact`
only for deliberate retro irony.

### Meme rules
1. **Cast or judge, never repeat.** The label names who the meme stands for inside the clip's situation ("That one Pepsi fan:"),
   or the meme comes after the clip as a verdict. A meme mirroring the emotion already on screen adds nothing.
2. **Contrast or exaggerate**: overdoing -> MORE excess; small fail -> HUGE fake grief; don't sit next to the clip's emotion.
3. **Timing**: in `bottom_meme`, start the meme (`meme.start`) at the payoff so its audio doesn't bury the clip's key sound.
   `after_meme` starts right after the payoff by construction. Use the frame times on the sheet.
4. **One meme per Short**; clip + meme <= 60 s (ingest).
5. **Library first**: add with `memes/memes.py add`, check the sheet for foreign watermarks and baked-in bars, write an honest
   `use_when`. Never source memes from stock footage (R0 covers the meme library).

## 5. Meme library (`etcherr871/memes/`)
`catalog.json` entry: `id, file, title, source_url, in, out` (trim seconds), `duration, has_audio, size[w,h], emotion[], use_when,
label_examples[]`. Commands: `memes.py search "<meme name> meme template"` (yt-dlp search for source videos) - `add <url> --id ID
--in S --out S --emotion "a,b" --use-when "..." --label "..."` (downloads, trims, auto-crops black bars via `cropdetect`, writes
a verification sheet) - `sheet ID` (verify the trim) - `list` - `rebuild` (re-download all; mp4s are gitignored).
Current five (2026-10-04): `cat-shocked` (unexpected twist, 5.2 s), `galaxy-brain` (confidently dumb -> crown it; carries its
creator's faint CHROMASTONE10 mark, accepted), `orville-500-cigarettes` (overdoing it), `rock-eyebrow` (suspicious/too convenient),
`sad-hamster-violin` (small harmless misfortune, fake sympathy).

## 6. Music library (`etcherr871/music/`)
Only for clips WITHOUT own audio (R15b). `catalog.json` track: `id, file, title, artist, source_url, license, license_url,
duration, start, mood[], use_when, energy, bpm, onsets_per_s, pulse, rms`. CC0/public-domain only (currently Komiku and
HoliznaCC0 via archive.org, 11 tracks), licence URL recorded, **never Kevin MacLeod/incompetech**, **energy <= 6.0** (a measured
proxy from spectral-flux tempo + onset density of the first 60 s, not a listening test). `music.py add "<archive.org url>" --id
ID --mood "calm,curious" --use-when "..." --title ... --artist ... --license-url URL [--start 4]` - `list` - `rebuild`.
Mix: -24 LUFS bed (-30 LUFS under clips with sound). Examples: `ambiant-hope` (slow reveals, glass/pottery making, quiet awe),
`ambiant-wait` (build-ups, wait-for-it, animals sneaking, night/trail-cam).
