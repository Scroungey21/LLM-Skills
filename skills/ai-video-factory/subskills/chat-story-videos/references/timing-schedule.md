# Timing: how bubble timing derives from speech

Contents: 1 Principle · 2 The scheduler as a formula · 3 Per-line adjustments (pause, hold, sfx holds) · 4 Defaults beside the study medians · 5 Simulator's own timeline vs the audio-timed one · 6 Frame accuracy and sync invariants · 7 Tuning recipes · 8 Contradictions

Source: `engine/story.mjs` `schedule()`, `planLines()`, `build()`; `DEFAULT_TIMING`; simulator `timeline.ts`; `research-output/chat-story-study/REPORT.md` section 3 and `AUTOMATION_SPEC.md` section 4 (proposal).
Unit: milliseconds unless noted. Default values in section 4.

## 1. Principle
Speech is the clock. The engine synthesizes every voiced line first, **measures** each take (duration, audible onset, speech length), then places each bubble so the next one cannot appear before the previous line has been heard.
The simulator is then fed a "timed script" whose per-message `gapMs`/`typingMs` reproduce exactly that schedule, so the rendered frames are a pure function of the schedule (deterministic).

## 2. The scheduler as a formula
Per message i (in order), with `T` = story.timing, `frameMs = 1000/fps`, `visibleAt(x) = ceil(x/frameMs - 1e-9) * frameMs`:
```
typing_i   = 0                                    if i == 0
           = T.contactTypingMs                    if actor_i != meActor or settings.showTypingForMe
           = 0                                    otherwise                     (typing dots only for the contact, never before message 1)
reveal_i   = round( max( readyAt + pauseBefore_i + typing_i ,  i == 0 ? T.firstRevealMs : reveal_{i-1} + 1 ) )
visual_i   = round( visibleAt(reveal_i) )          # the first video frame that shows the bubble
dur_i      = voiced ? round(takeDuration * 1000) : 0
voiceStart_i = voiced ? max(0, round( visual_i + T.voiceAfterBubbleMs - onset_i )) : null   # onset_i = measured leading silence of the chosen take
voiceEnd_i   = voiceStart_i + dur_i
speechEnd_i  = voiced ? ( speechMs known ? voiceStart_i + onset_i + speechMs_i : voiceEnd_i ) : null
readMs_i   = max( T.unvoicedMinMs, chars(display_i) / T.unvoicedReadCps * 1000 )
readyAt    = ( voiced ? speechEnd_i + T.gapAfterVoiceMs : reveal_i + readMs_i ) + holdAfter_i      # when the next bubble may start (typing starts then, reveal follows after typing)
end        = max( speechEnd_last or 0 , reveal_last + (voiced_last ? 0 : readMs_last) ) + T.finalHoldMs
```
Initial `readyAt = T.firstRevealMs`. Consequences: (a) the **pause between lines is measured from the end of the speech**, not the end of the file (takes carry 60-160 ms of tail); (b) an unvoiced bubble holds the stage for its reading window and
nothing is spoken meanwhile; (c) typing indicator occupies `[reveal - typing, reveal]` after `readyAt + pause`, so it never overlaps the previous voice; (d) `pauseBefore_i` lets you create a beat (silence, "left on read") **before** a bubble;
`holdAfter_i` extends the stage **after** it. (e) the pop SFX (`send.wav` for me, `receive.wav` for contact) plays on `visual_i`, not on `reveal_i`.
Timed ChatScript: `gapMs_i = max(0, reveal_i - typing_i - t_prev)`; `t_prev = reveal_i`; `typingMs_i = typing_i`. The simulator then reveals each message at exactly `reveal_i` (`t += gapMs; t += typingMs; reveal`).

## 3. Per-line adjustments
- `voice.lines.<id>.pauseBeforeMs` (adds to `readyAt` before typing) and `holdAfterMs` (adds after the line). Use sparingly: the study's median gap between voiced lines is 0.16 s; deliberate long silences are rare and risky (22 s silence read as "frozen").
- **SFX holds**: for each `sfx.cues` entry with `after:'voice'` (and not `endAt`), `holdAfter_i = max(holdAfter_i, offsetMs + holdMs - T.gapAfterVoiceMs)`, where `holdMs` is the cue's own or the library's (`sfx/library.json`,
  e.g. vine-boom 900, crickets 1800, laugh 2600, hell-nah 4000). So voice and meme SFX **alternate** instead of overlapping (Caldruki grammar). A cue with `endAt:true` (riser, drum roll) adds no hold; it is placed to *end* at the anchor.
- Music `cutAt` (silence from `visual - 40 ms` to `visual + ms`, default 1500) and `effects/overlays/captions` are anchored on `visual_i` or (`after:'voice'`) on `speechEnd_i`; they never move the schedule.
- Unvoiced bubbles (photo, emoji, reaction, `voiced:false`) get the read window; to give a silent beat more time raise `holdAfterMs` or `unvoicedMinMs`.

## 4. Defaults beside the study (the defaults are *starting points*, REPORT section 3)
| parameter | engine default | study median (p25-p75) | note |
|---|---|---|---|
| `firstRevealMs` | 100 | first bubble visible 0.0 s (0-0.12) | stakes on screen at t0 (P2) |
| `voiceAfterBubbleMs` | 50 | text lead -0.10 s (-0.51..+0.04), i.e. voice slightly *first* | deliberate deviation: the owner's sync rule is voice never before its bubble; the old fixed `textLeadMs -100` let low-lead takes sound up to 100 ms early |
| `gapAfterVoiceMs` | 150 | 0.16 s (0.08-0.30) between voiced lines | from speech end; s2 drama uses 320, f-series 140 |
| `contactTypingMs` | 450 | typing anticipation 1.0 s (0.7-1.9) | funny spec: 900-1500 ms dots before punchlines; s2 uses 900 |
| `unvoicedReadCps` / `unvoicedMinMs` | 20 / 700 | reading window 1.0 s (0.7-1.8); chars/window 20 cps (14-27) | Netflix adult ceiling = 20 cps; f-series raises min to 900 |
| `finalHoldMs` | 600 | hold after last voice 0.36 s (0.18-1.59); drama 1.57 s | s2 2500, f1-f6 up to 3300 (meme outro) |
| band for takes | 180-320 wpm | 266 wpm (223-319) | `voice.cadenceWpm` |
Reveal cadence target from the study: 0.8-1.8 s for bubbles <= 36 chars; unvoiced long bubbles extended toward <= 20 cps.

## 5. Simulator's own timeline (`chat_timeline`, `timeline.ts`) is NOT audio-timed
`typingDuration = clamp(chars / typingCps * 1000, minTypingMs, maxTypingMs)` (12 cps, 700..3500 ms), 0 for Roblox and for "me" unless `showTypingForMe`; each message waits `gapMs` (400) then types; `TAIL_HOLD_MS = 1500` after the last reveal;
scroll eases for `scrollMs` (250) from the list's previous resting position to the new bottom. Use it for editor preview only. `story_plan` gives the audio-timed (or estimated, ~200 wpm, `max(0.6 s, words/3.3)`) schedule.

## 6. Frame accuracy and sync invariants
- A bubble is visible from `visual_i` (30 fps -> 33.3 ms grid). Voice onset (audible) = `visual_i + voiceAfterBubbleMs` -> must be >= 0 for every line (`engine/check-sync.py` prints min/median/max and "voice BEFORE bubble: none"; lines > 120 ms from the median are listed).
- Check also the encoded MP4 against the source mix (cross-correlation of the first 20 s; AAC priming can shift all lines).
- Takes with long lead-in silence may overlap the previous line's tail in fast comedy timing; `check-sync` searches after the previous line's end + 20 ms.
- Scroll regression: `node engine/check-scroll.mjs <out>/timed-script.json [fps]` fails on any upward scroll jump > 6 px (fixed 2026-10-03: the list used to ease from the top).
- Anti-spoiler invariants (AUTOMATION_SPEC section 4, PROPOSED, not automated): only revealed messages exist in layout (a future long bubble must not pre-scroll); attachments not mounted before reveal; title/first frame/thumbnail never contain the payoff line.
  Verify manually by rendering the frame `reveal - 1 frame` (`chat_render_png t=<ms>`).

## 7. Tuning recipes
- Line feels rushed: add punctuation in the bubble (it adds a visible pause), or raise `gapAfterVoiceMs` for the story; do not stretch audio.
- Beat before a reveal: `pauseBeforeMs` 300-900 on the reveal (s2 uses 300-900 on four lines), plus optional typing indicator (`contactTypingMs` 900).
- Reveal under a stinger: cue `after:'voice'`, `offsetMs` 60, library `holdMs`; verify with `check-edit.py`.
- Drama: longer `finalHold`, `gapAfterVoice` 300+, music `cutAt` 1.0-1.6 s on the turn; comedy: gaps ~140-150, hold 600-3300 only if the meme outro needs it.
- Long story: 40-48 messages ~ 50/min means ~55-60 s; drama at ~34/min needs fewer, longer beats.

## 8. Contradictions
- AUTOMATION_SPEC proposes `voice_start = reveal + TEXT_LEAD` with the study's negative lead (voice slightly first); the engine places voice **after** the bubble. Written as the engine because the owner's rule and the measured onset logic are deliberate (2026-10-03).
- The spec's example parameters (`R_MIN, R_BASE, READ_CPS...`) are a different parameterisation; the engine uses readMs = max(min, chars/cps).
- README says "voice starts with the bubble"; precisely, it starts 50 ms after the bubble's first frame (audible onset), by construction.
