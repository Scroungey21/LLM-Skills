# Script adaptation and narration

Contents: 1 What the archive specified · 2 Mechanics inherited from the engine (archetype, budget, schema) · 3 Dread build, cold open, jump structure (NEW) ·
4 Beat sizing and pacing numbers (NEW, uncalibrated) · 5 Narration voice and delivery · 6 Editor critique and grounding for fiction · 7 Script gate checklist

Labels: **[A]** archived, **[N]** new guidance (no archive behind it), **[R]** repo research. Numbers marked *uncalibrated* are starting points to audition, not measured channel results.

## 1. What the archive specified [A]

| Rule | Text / value | Source |
|---|---|---|
| One blended narrative | Open with a naturally described, **personally framed** experience matching the cluster's shared theme, drawing on all 3 stories; never three segments back to back | V8-REQ-5.5 |
| Paraphrase, never verbatim | Adapt every detail into the channel's own narration voice; never reproduce any source sentence, "even a short exact phrase" | V8-REQ-5.6, scriptwriter prompt |
| No AI-pitch hook | Never open with "have you ever wondered...", "what if I told you..."; the channel's default hook convention does not apply to this niche; the opening reads grounded and atmospheric "the way an established horror-narration channel opens a story, never as a marketing pitch" | V8-REQ-6.4, `NICHE_STRATEGY_BUNDLES["horror_stories"].editorial_constraints` |
| No relatable-contrast directive | The shared "follow an impressive spec with a mundane comparison" directive is deliberately **not** appended (a narrative niche has no technical figures) | `seed.py` comment |
| Voice | A third `voice_delivery_mode` value, `slow_atmospheric`: "slow, deep, partially (not fully) monotone", distinct from the tech default `deadpan_technical` and manga's `expressive_narrative` | V8-REQ-6.5, `NICHE_PACING_PROFILES` |
| Source scenes | The scriptwriter prompt for horror is the base prompt + the blend instruction; the "Source content" block already holds all three texts `---`-joined (not re-appended, to avoid doubling the prompt or reading as 6 accounts) | `scriptwriter.py` (horror branch), design §4.3 |
| Scoring | None (`scoring_rubric=None`) | V8-REQ-5.7 |
| Sensitivity | `real_entity_sensitivity_level="high"` | `seed.py` |

Actual blend instruction appended to the user prompt (`synthesis/scriptwriter.py`): the source above is exactly 3 separate scraped horror stories, `---`-separated, blended into ONE video;
write ONE cohesive, blended narrative opening with a naturally described, personally framed experience matching the shared theme; never concatenate the 3 accounts as three back-to-back
segments; paraphrase and adapt every detail into the channel's narration voice; never reproduce any source story's original sentences verbatim, even a short exact phrase.

## 2. Mechanics inherited from the engine [A]

- **Archetype:** `horror_stories` is seeded on the `deep-dive` archetype: `hook_required=True`, `single_hook_only=True` (the code forces scene 0 to `is_hook=true` and all others false), pattern-interrupt
  interval 45 s (`PATTERN_INTERRUPT_INTERVAL_SECONDS`). So structurally there is exactly one hook scene at the top; the editorial override only changes *what that hook sounds like*.
- **Length / word budget (technews code, inherited unchanged):** `target_runtime_seconds(content_chars)`: `<2000` chars -> 240 s, `2000-6000` -> 420 s, `>6000` -> 600 s; `total_word_budget = runtime/60 x 225 wpm x (1 - 0.10 hook reserve)`.
  Three full stories joined will usually exceed 6000 chars, so the engine would target **600 s / about 2,000 words**. **Flaw to avoid:** 225 wpm is the tech-news rate; at a slow horror delivery (about 130-150 wpm, below)
  2,000 words run 13-15 minutes, not 10. A new channel computes the budget from its *actual accepted narration pace* (section 4).
- **CIS script rule:** a CIS-mode script leaves each scene's `component` as `""` and `cues` as `{"typing_chars": 0, "node_count": 0}`; a later stage decides the visual (horror: always `atmosphere-narration`).
- **Scene record:** `narration`, `index`, `is_hook` (+ `panel_id` etc. for manga, unused here).
- **Profanity check:** scene 0 text is checked against `PROFANITY_WORDLIST` and flagged for human review (not blocked) - useful for the cold open.
- **Fact-check:** there is no horror-specific ground-truth branch in `fact_check.py` (grep of `horror` returns nothing there); by default the script is checked against the composite `raw_item.content` (the three texts).
  That is a *traceability* check (does the script add claims the sources lack?), the only meaning "fact-check" can have for fiction. Condensation (Shorts) grounds against the **parent script's narration**
  instead ([vertical-recap.md](vertical-recap.md)).

## 3. Dread build, cold open, jump structure (NEW [N])

The archive has no craft rules beyond section 1. The following is the method this skill recommends; the one piece of repo evidence behind it is the chat-story study's note on an impossible-rule
horror case [R] (`hidden-everyday-systems/research-output/chat-story-study/data/case_digest.json`): *let one character offer a rational explanation and refute it with a specific, checkable fact before
escalating, and put the final threat on screen, not only in the voice.* Everything else is craft guidance to audition and revise from analytics.

**Long-form structure (8-12 minutes):**

1. **Cold open (about 15-25 s).** Start inside a concrete, mundane moment with one wrong detail. No channel greeting, no "before we start", no title sting, no promise ("you won't believe..."), no
   statement that the story is scary. Specific sensory facts (time, room, sound) beat adjectives. This is the single `is_hook` scene.
2. **Baseline (1-2 min).** Establish the ordinary: who, where, routine. Make the narrator reliable and specific. Dread needs a normal to break.
3. **First anomaly (small, deniable).** Something a sane person would shrug off.
4. **Rational explanation, then refutation.** The narrator (or someone else) offers the sensible reading; a *specific checkable detail* kills it (a door that was locked from inside, a timestamp, a count that
   does not add up). Each refutation removes an exit.
5. **Escalation ladder (3-4 steps).** Each step shortens sentences and beats, closes one more escape route, and raises the cost of the next decision. Vary the *shape* across steps (sound, absence, repetition,
   a person behaving wrong) - blending three stories is meant to give range, not triple the same beat.
6. **The held breath.** One beat of quiet: short, plain, almost bureaucratic sentences. Silence is a tool (leave real gaps in the narration, no fill).
7. **The break (jump).** One earned reveal or event, sudden in delivery but prepared by steps 3-6. Long-form: at most one major jump plus at most one minor sting per 3-4 minutes (*uncalibrated*).
   Shorts: one.
8. **Aftermath.** A lingering concrete detail or an unresolved question, not a moral, not a recap, not "subscribe". The CTA, if any, belongs to a clearly separate end element.

**Rules:**
- **Show the threat, don't just narrate it** (case digest [R]): the climactic image/word appears on screen as well as in audio ([visuals-audio-captions.md](visuals-audio-captions.md) §3).
- **A sound or sting must correspond to a visible or narrated event** (shared rule: an effect without a visible event is a defect, `../../../references/audio-captions-music.md` §6).
- **No gore for its own sake.** The safety gate passes it; the policy screen ([safety-clustering-founding.md](safety-clustering-founding.md) §3) and age-restriction exposure
  ([policy-risk-register.md](policy-risk-register.md) R1/R3) say implication and aftermath are the safer and usually scarier tools.
- **Personal framing is a fiction device, not a truth claim.** If the narration says "I", the description/pinned note must say the story is fiction/adapted ([policy-risk-register.md](policy-risk-register.md) R7).
- **Banned openers** (from V8-REQ-6.4 plus the usual): "have you ever wondered", "what if I told you", "in this video", "welcome back", "today we", "you won't believe", "I'm about to tell you".
- Avoid the verbal tics of generic AI narration (stacked adverbs, "little did I know", "a chill ran down my spine", "something was off") - they are exactly the templated sameness that the inauthentic-content
  review reads as mass production (R4).

## 4. Beat sizing and pacing numbers (NEW, uncalibrated)

The shared script gates do **not** transfer: HES's 165-240 WPM native gate and NEWS's 175-190 wpm + `atempo` are tech-explainer rhythms (`../../../references/qa-gates.md` §4). Horror needs its own window,
set after an audition on the chosen voice:

| Parameter | Starting value | Notes |
|---|---|---|
| Native narration pace | **120-150 wpm** accepted window (*uncalibrated*) | Measured on the accepted take (script words / speech duration, excluding padding). Out of window = reject the take and regenerate; never `atempo`/stretch (house rule). |
| Scene length | one sentence group per scene, **2-30 s** | The `atmosphere-narration` manifest allows `min_scene_ms=2000`, `max_scene_ms=30000` [A]. Prefer 6-15 s so the visual can rotate. |
| Words per scene | about 12-45 | Short scenes in escalation, longer in baseline. |
| Sentence length | mixed; escalation sentences 4-10 words | Contrast creates tension; do not write every line in one cadence. |
| Runtime | 8-12 min long-form; vertical recap about 55 s | The 55 s Short target is archived (`SHORTS_TARGET_RUNTIME_SECONDS=55`); the long range is a recommendation. |
| Lead-in / tail | start speech within the first second; hold the last visual 2-4 s | Avoid a long silent title card. |

Compute the word budget as `runtime_seconds / 60 x accepted_wpm x (1 - hook_reserve)` using the accepted pace, not 225.

## 5. Narration voice and delivery

- **Archived intent [A]:** slow, deep, partially monotone (`slow_atmospheric`). Implementation reality: it was only a seed value in `pacing_profile`, and the dots.tts server **accepts a `delivery` field and ignores it**
  (`../../../references/voice-tts.md` §2). So V8-REQ-6.5 was never audible in the archived system. Slow delivery has to come from the **reference performance and punctuation**, not from a mode name.
- **Do not reuse the archived voice.** `seed_voice_profiles.py` maps `horror_stories` to `dots-warm-informational`, which `voice-tts.md` §3 records as a cloned identifiable real person's voice with no consent. A new horror channel
  chooses a voice it can license or a genuinely synthetic default-speaker reference, and writes `<voice>-provenance.json` (source, consent, processing, ASR check, risks).
- **How to get slow, low and not flat [N]:** audition 3-4 references recorded slow; reject robotic/monotone; keep punctuation (full stops, ellipses sparingly, em dashes) to place pauses; split long paragraphs into
  scenes so pauses fall between takes; use the seed-retry + cadence-window pattern from `voice-tts.md` §4 with the horror window above; listen to the opening, the held breath and the jump line.
- **Dry narration by default [N]:** the shared house rule is no reverb/enhancement/denoise/effects on the voice. Put space and dread in the bed and SFX; if the owner wants a processed horror voice,
  that is an explicit decision recorded in provenance, not a default.
- **One voice per video; same voice for the Short.** Pronounced-word checks: proper nouns, place names, numerals spelled as spoken.

## 6. Editor critique and grounding for fiction

Claude as editor reviews the draft against this list (a hand-off packet `editor.request.md` -> `editor.json`, scene-indexed notes):
1. Hook: grounded, specific, no banned opener, exactly one hook scene.
2. Single blended arc; no seams where one source ends and another starts; one narrator logic (consistent tense, person, place names).
3. No sentence or distinctive phrase from any source (diff each scene against the three texts for 6+ word matches; record `no_verbatim_check`).
4. Every named person/place is invented or anonymised; no real identifiers survive.
5. Escalation ladder present (step 4 refutation + 3-4 steps + held breath + one break); jump count within budget.
6. Pace: words fit the runtime at the accepted wpm; no scene beyond 30 s; no paragraph a TTS chunk will rush (chunk cap 56 words).
7. Section 3 policy screen passed on this draft.
8. Fiction labelled (description/pinned text prepared).

## 7. Script gate checklist (Gate 1: the human approves)

Hook scene is the only `is_hook`; no banned opener; the rights file is complete for all three sources; `no_verbatim_check` = pass; policy screen = pass; budget matches accepted pace; fiction label drafted;
human reads the whole script aloud once. The agent never auto-approves (`../../../references/agent-principles.md` §5).
