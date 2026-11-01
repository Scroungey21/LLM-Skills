# Story writing: rules, stage procedures, examples

Contents: 1 Story rules (engine + study) · 2 Craft toolbox · 3 Funny-comedy rules · 4 Typing the text so it voices well · 5 Agent stages as methods (PROPOSED) ·
6 Selection and critique rubrics · 7 Examples in the repo · 8 The eight demo stories and the principle each tests

Provenance of the rules: `chat-stories/README.md` "Story rules (from the demo round)", `research-output/chat-story-study/REPORT.md` (P1-P7), `demo_stories.md`,
`data/funny_research.md`. The pipeline stages in section 5 come from `AUTOMATION_SPEC.md` (status: **design, not implemented**); no code runs them. You are the LLM layer:
do each stage yourself (or hand a fresh-context subagent a packet) and write the result as a file; code only validates.

## 1. Story rules
- Two people (one `me` side right, one `contact` side left; the schema has no group chat). A situation clear from the first message, every message advances it, **one reveal the viewer can almost see coming**,
  an ending that pays it off (README "Story rules").
- **Bubble 1 carries a concrete stake and appears at t = 0.1 s** (P2). Never open on leftover series context or a polite setup. Test: could a viewer who scrolled in at second 1 say what is at stake?
- **Plant -> payoff** (P3): every ending reuses a name, object, rule, feature or declined invitation seen before the midpoint. Fairness test: re-read the plant in isolation - is it legible *as the viewer first meets it*
  (not truncated, not buried)? Demo C2/T3 tests exactly this.
- **Mutate repetition** (P4): a ladder (three asks, three refusals) must change logic each rung; delete any exchange that restates. Pure repetition reads as a list (`Youtube_3ycgjAHye6E` counter-example).
- **Interface beats** (P1): plan 1-2 per story, only from what the skin can render (timestamp dividers, `status` read/delivered, tapback `reactions`, image attachments, a deliberately long gap, static header status).
  Remember the counter-example: chrome jokes must not out-compete the plot.
- **Plot-critical lines are bubbles** (P6): a line that exists only in the voice is flavour; the twist is always both said and shown, and legible at the cut (cards cut off at the bottom edge hide the last line).
- **Endings**: close on a decision or a flip, not an explanation. Hold: 0.3-0.6 s for comedy, 1-2.5 s for drama (s2 uses 2.5 s, f-series 3.3 s because the meme outro plays). Sad endings: music cut/soften for the last messages.
- **Weird/cursed**: one coherent impossible rule, proven by a checkable fact *after* a rational explanation is offered and knocked down; the disturbing implication must be intelligible at the cut; no shock without purpose (3 cases coded cruel-without-purpose).
- **No sponsor/app-promo beat inside the setup** (P5). Not a feature of this channel anyway; if ever added, after the core turn and outside the fiction.
- **Comment-bait CTAs** ("comment X for part 2") are overused and inflate counts without story engagement; a part-2 teaser must be planted, and a sequel must not retcon its premise.
- **Hard content limits (owner, 2026-10-03, apply even at 18+)**: nothing involving minors, no non-consent, no slurs against protected groups, no real people, no working scam steps; no mocking of disability, accents,
  second-language spelling; no drunk-driving/consent jokes; heavy cringe repels, mild cringe engages. See `qa-policy-metadata.md` section 2 for the open items (a babysitter thriller centred on a child, sexual-pun comedy).
- **Safe-messaging**: stories near self-harm or suicide need safe-messaging care (REPORT section 4 flagged one source case); do not write method detail; prefer to avoid.
- **Originality**: each premise must be new (see `qa-policy-metadata.md` section 3, inauthentic content). Keep a premise ledger (title, logline, mechanism, skin, ending type) and check it before ideation.

## 2. Craft toolbox (from the study; use as vocabulary in critique)
Hook types: accusation, insult, concrete object/photo, impossible timestamp, wrong-number misread. Reversal types: power inversion in the first reply; tool-turns-on-user; false ending + coda (five reversals in 96 s);
status flip via a volunteered fact; innocent-party sincerity escalation. Speech acts to vary: demand, deflection, concession, threat, lie, test, confession. Information control: keep a ledger of what the viewer knows vs
expects per beat; each message must change one of them (`speech_acts[].info_change` in the case schema). Deletion test: removing any one message must break something; reorder test: moving the payoff earlier turns a reveal into exposition.

## 3. Funny-comedy rules (README + funny_research section 7)
Setup -> escalation ladder -> turn -> callback punchline; rule of three but each repeat mutates; straight man vs chaos agent; best variant: the innocent party becomes more sincere. Misdirection through texting conventions
(asterisk corrections, contact names, call banners). Callback in the last ~0.3 s. Funny bubbles median 23 chars (p75 33); punchline <= 30. Typos: real-word substitutions and word-shape-preserving errors;
unreadable smash/scramble is out. Drunk texting: characters clearly adults, typos ramp 0 -> <= 2 per bubble. Autocorrect: <= 1 substitution per bubble, <= 4 per video, each paid off.
Rhythm targets in `format-research.md` section 8. Humour that innuendo needs: the innocent referent must be visible/provable (the owner relaxed this for 18+ comedy, 2026-10-03).
Formats ranked: wrong number, misread innuendo, autocorrect, drunk texter, parent/grandparent, escalation ladder/rigged game, scammer played, then rizz (saturated), clueless partner.

## 4. Typing the text so it voices well
- Write bubbles as people type (lowercase, no final period) but remember the voice reads the bubble's own punctuation: every comma, dash, ellipsis or sentence end is an audible pause. Put punctuation only where a pause belongs.
- ALL-CAPS emphasis is mangled by dots.tts ("MEAN" -> "men"); the engine lower-cases it for speech. Use punctuation or word choice for emphasis; real acronyms stay (list in `voices.md` section 4).
- Capitalised "No." is read as "number": write "no." or "No!"/"No way." (the normaliser also fixes it).
- Shorthand (lol idk tbh brb omw wtf omg ok...) is expanded by a lexicon; `lol` is dropped. If the typo is the joke, set `voice.readAsTyped`. Emoji are never voiced.
- Numbers/times/years/$/% become words automatically ("9:41" -> "nine forty-one"); titles drop their period ("Mr." -> "Mister").
- Check with `node engine/check-spoken.mjs <story.json>` before any TTS (prints bubble -> spoken, flags added pauses).

## 5. Agent stages as methods (PROPOSED by AUTOMATION_SPEC; none implemented as code)
Files per project would live under `projects/<slug>/` with an append-only `state.json`; in today's practice you write the story JSON directly (the `examples/` folder is the working form). Use the schemas below for structure.
Each LLM output is schema-validated; a failure regenerates at most twice, then escalates to the owner.
| Stage | You produce | Method |
|---|---|---|
| PREMISE | N premises (`premise.json`: id, genre dramatic/funny/weird/cursed, logline, chat_type two_person, interface, core_mechanism, open_question, payoff, why_original, risk_flags[]) | Ideate against the premise ledger and the gaps in `format-research.md` section 6; reject mere re-skins of an earlier mechanism. |
| SELECT | the chosen premise + rationale | Score with the section 6 rubric; the owner may override. |
| PLAN | `bible.json`: characters[id, display_name, avatar_ref, side, voice_id, voice_direction_default, texting_style{caps, punctuation, emoji_rate, typo_rate, abbreviations[]}, goal, secret, knowledge[]], world_state{facts[], beliefs{char:[...]}, audience_knowledge_by_beat[]}, rule_for_weird_or_cursed | Decide goals/secrets; list the planted facts and when the audience learns each. Weird/cursed: write the rule in one sentence. |
| DIALOGUE | `dialogue.json` (messages with id, speaker, kind text/image/voice_note/system/typing/read_receipt/deleted/edited, display_text, attachment, spoken_text|null, voiced, direction, beat, pause_before_ms, hold_after_ms, reveal_group) | Map to the real engine schema (`schema-and-validation.md`): only kinds the skins render; `pause_before_ms` -> `voice.lines[id].pauseBeforeMs`. |
| CRITIQUE | `critique.json` from a **fresh context with no author notes** | Section 6 rubric; cite message ids. |
| REVISE | diff-limited edits | Fix only what the critique cites; re-run deletion/reorder tests. |
| SCRIPT APPROVAL | owner approves; binds `script_sha256` | Any later edit voids approval and returns to CRITIQUE. Max 3 critique <-> revise loops, then the owner. |
Hand-off packet for a subskill-style critic: story JSON + bible + this section's rubric; ask for a verdict table, no rewrite.

## 6. Selection and critique rubrics (derived from the study; rubric weights are not measured - PROP)
Select (score 0-2 each, require no 0 on 1-3): (1) concrete stake in bubble 1; (2) plant that makes the ending earned; (3) a mechanism not used in the ledger; (4) a mutating repeat or escalation; (5) an interface beat the skin can
render; (6) clear adult characters and no hard-limit flags; (7) fits 40-100 s at 18-48 messages; (8) works muted. Critique checks (AUTOMATION_SPEC section 6): exposition problems, interchangeable voices (could swap two
characters' lines?), plausibility of texting style, deletion test, reorder test, ending type (surprising-but-earned | predictable-but-satisfying | arbitrary | cruel-without-purpose | withheld | cta), spoiler risk from layout,
sponsor/CTA presence, safety flags.

## 7. Examples in `chat-stories/examples/` (12 files; the story JSON is the working form)
| File | Style (as stored) | App | msgs | Background | Music | Notes |
|---|---|---|---|---|---|---|
| `plant-sitter.story.json` | original demo (F2 in demo_stories) | iMessage dark | 14 | mcparkour1 | sneaky-snitch | minimal story: only voice seeds, 900 ms hold, widthPx 940 |
| `s1-working-late` | cheating expose (drama, revenge ending) | iMessage | 34 | mcparkour1 | arbiters-trial, cutAt m17 1300 ms, m23 1000 ms | |
| `s2-sunday-at-nine` | emotional wrong number (heartwarming drama) | WhatsApp dark | 28 | gta5-2 | home-was-you, cutAt m19 1600 ms | pauseBeforeMs 300-900 on key lines, bestOf 2, gapAfterVoice 320, contactTyping 900, finalHold 2500 |
| `s3-parking-spot` | entitled person gets owned (revenge) | Messenger | 31 | gta5-1 | morpheus, cutAt m21 | |
| `s4-back-door` | suspense thriller (twist) | iMessage | 29 | gta5-2 @200 s | the-visitor, cutAt m10, m28 | see policy flag (child centred) |
| `f1-rotisserie-heist` | drunk texter, wrong contact (18+) | iMessage | 31 | mcparkour1 | none | edit "caldruki", audience 18+ |
| `f2-autocorrect` | autocorrect disaster (18+) | WhatsApp | 26 | gta5-1 | none | |
| `f3-bring-it-up` | raunchy misunderstanding (18+) | iMessage | 28 | gta5-3 | none | |
| `f4-under-kim` | clueless sibling (18+) | Messenger | 28 | gta5-2 @60 s | none | |
| `f5-wrong-recipient` | freaky text to wrong recipient (18+) | iMessage | 23 | gta5-2 @200 s | none | finalHold 3300 ms, `sfx.pops:false`, effects + overlays |
| `f6-dirty-talk` | clueless at sexting (18+) | iMessage | 24 | mcparkour1 @240 s | none | |
| `make_funny_stories.py` | generator for the f-series | - | - | - | - | beat vocabulary class `Ed` (reveal / punch / stupid / cringe / horny / scare) with rotating image/sfx pools |
Two reading samples: **plant-sitter** (14 messages; reveal 1 "that fern is plastic" at m07, reveal 2 "camera in the bookshelf" at m09, then the callback `you were doing great` re-uses m05 and the cactus-in-the-fridge line closes it) and **s2-sunday-at-nine**
(a stranger answers a dead mother's number; the "Sunday at 9 pm" plant pays off with the call; music cuts for 1.6 s at "Answer your phone."). Build outputs of all twelve exist under `hidden-everyday-systems/output/chat-stories/<slug>/` (gitignored media).
Caution: the f-series is generated from one Python template with a fixed beat vocabulary - it is the clearest example of the YouTube "templated" risk (`qa-policy-metadata.md` section 3).

## 8. The eight demo stories (`demo_stories.md`; original, PROPOSED) and the principle each tests
D1 "Anonymous Poll" (dramatic, **group chat**, interface-as-narrator via poll/system events) - D2 "Speech Draft" (dramatic, plant visible from frame 0; close on a decision) - F1 "Dad Discovered Reactions" (funny, **group chat**,
mutating repetition; callback ending) - F2 "Plant Sitter" (funny, innocent sincerity escalates; callback) - W1 "Me (tomorrow)" (weird, impossible timestamp, rule after proof, warm resolution) - W2 "City Lost & Found"
(weird, coherent absurdity, bureaucratic deadpan) - C1 "Find My Friend" (cursed, notification in the impossible thread; implication only) - C2 "Two Mums" (cursed, two threads; twist earned by the viewer's own re-read).
Two-person demos with text/image bubbles (F2, D2, W2, most of W1/C1 if screenshots are image attachments) are buildable today; D1 and F1 (group chat, poll/reaction system rows) and C2's thread switch need features the simulator does not have (`simulator-and-render.md` section 3).
The seven test designs T1-T7 are in `format-research.md` section 7.
