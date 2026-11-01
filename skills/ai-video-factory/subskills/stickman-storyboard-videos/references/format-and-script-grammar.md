# The format, why it works, and the script grammar

Contents: 1 Evidence discipline · 2 What the format is · 3 Why it works (retention logic) · 4 The two profiles · 5 Macrostructure · 6 Script rules · 7 Open loops and retention debt · 8 Claims, scope and title qualification · 9 Scale switching and visualisability · 10 Closing and counterexamples · 11 Script acceptance checklist

Sources: Report = `TPDossier_Local_Automation_Reverse_Engineering_Report.md` (147 KB, snapshot 2026-09-05, recoverable with `git show pre-skill-reduction:Stickman/<file>`); Handoff = `CLAUDE_CODE_TPDOSSIER_IMPLEMENTATION_HANDOFF.md`.

## 1. Evidence discipline (carry it into every note you write)

The report separates **OBSERVED** (directly visible/audible/in metadata/transcript), **INFERRED** (likely, with confidence + alternatives) and **PROPOSED LOCAL EQUIVALENT** (our engineering choice) (Report §2.1), and grades evidence A (direct target) to D (our proposal) (§2.2).
What was actually observed is thin: channel/title index results, a machine transcript + timestamp summary of one video ("Why Humans Never Eat Predator Meat?"), one video page whose description lists researchers/sources, qualifies its absolute title and says "all visuals are original illustrations" ("Why Humans Never Eat Warthog Meat?", published 2026-09-01), and one older POV/rank video (12:12) (Report §3.1). **No frames were retrieved**, so shot lengths, line widths, palette, pose/camera/transition frequencies, music/SFX density, voice and thumbnail composition are `UNMEASURED_TARGET` (Report §1.4, §9.1, §31.1). Do not "improve" a number into an observation. The machine transcript is partly corrupted: good for macrostructure, not for word counts or quotation (§3.4).

## 2. What the format is

One explicit curiosity question (or one rank ladder) per video; the viewer is placed in an ordinary, imaginable situation; the answer is a **layered causal explanation** that repeatedly says "that's only the visible part"; the story switches scale (meal -> hunt -> food chain -> body -> mind -> history) so visuals vary without changing topic; a late counterexample prevents a simplistic rule; the end reframes the opening scene (Report §5-§7).
Observed invariants (multiple titles/metadata): one question, a familiar entry point, paradox/absence framing ("why not / why never / why X not Y"), explanation broader than the obvious first answer, animals/food/domestication/predator behaviour as the recent lane, original illustration on at least one video (§5.2).
Observed title grammar families (§16.1): `Why Humans Never Eat [ANIMAL] Meat?`, `Why Do We Never Eat ...`, `Why Don't We Eat ...`, `Why Do We Eat [X] And Not [Y]?`, `Why Do [PREDATORS] [SURPRISING BEHAVIOR]?`, `Why Don't [PREDATORS] [EXPECTED ACTION]?`. Use them as *grammar*, never copy an existing title unnecessarily.
**Channel identity is not a single permanent format** (an older POV/rank upload existed): make profile a mode, not a hard-coded app (§4.4).

## 3. Why it works - retention logic (OBSERVED structure, INFERRED mechanism)

"Layered unresolved causality" (Report §5.4): ask one question -> answer part of it -> explicitly show the answer is incomplete -> change the scale of explanation (energy -> chemistry -> parasites -> psychology) -> introduce exceptions near the end -> reframe the rule -> pay off the opening scenario. It is *not* random fact spam. The audience promise is "you have seen this pattern all your life; a hidden mechanism explains it; the real reason is stranger than the obvious answer" (§4.5). Observed density: >=4 explanatory models in ~7 minutes plus examples (§6.4).
Why the visual system works: a causal chain needs a world where cause and effect stay legible (a hunter, a deer, a lion persisting long enough to see a trade-off - §7.2); that is the reason for scenarios + state rather than per-sentence pictures.

## 4. The two profiles (Handoff §Mission and §Script policy)

| | `CURIOSITY_EXPLAINER` | `POV_PROGRESSION` |
|---|---|---|
| Promise | one counter-intuitive animal/food/behaviour question answered by escalating mechanisms and exceptions | second-person rank/level/lifecycle story ("your life as every rank") |
| Order | plain contradiction -> intuitive answer -> mechanism 1 -> mechanism 2 -> exception -> synthesis -> adjacent curiosity | identity lock -> Level 1 reality -> expectation reversal -> repeated rank loop (**status -> capability -> scenario -> cost -> transition**) -> escalating responsibility -> human cost -> system thesis -> cyclical close |
| Voice | questions + concrete nouns; direct address | second person, present tense; immediate identity + ladder promise; conflict changes type as responsibility grows |
| Evidence stance | claim ledger required (science/history) | real-job facts still need a ledger; "human cost" beats must not invent specifics presented as fact |
| Schema fit | all 15 `scene_type`s suffice | needs `LEVEL_CARD`/`MAP_TIMELINE`/`HERO_TABLEAU` homes ([storyboard-schema §10-11](storyboard-schema.md)) |
| Evidence base | strong (transcript, description) | **thin**: one older indexed video, no transcript studied; treat the grammar as the handoff's design, not as an observation |

Start with `CURIOSITY_EXPLAINER`. Do not mix the older POV/rank title family into the animal/science style profile (Report §16.1).

## 5. Macrostructure for `CURIOSITY_EXPLAINER` (PROPOSED, derived from one script; Report §5.3)

`COLD_SCENARIO` (make the question physically imaginable) -> `QUESTION_REVEAL` (show the missing thing) -> `SURFACE_ANSWER_REJECTION` -> `PROMISE_LADDER` (preview 2-4 layers without resolving) -> `MECHANISM_A` (most intuitive layer) -> `ESCALATION_BRIDGE` ("only the visible part") -> `MECHANISM_B` (less intuitive scientific layer, concrete case) -> `MECHANISM_C` (body/risk/historical layer) -> `HUMAN_MEANING` (behaviour/psychology/culture, only when supported) -> `EXCEPTION_OR_REVERSAL` -> `REFINED_RULE` -> `CALLBACK_PAYOFF`.
Observed timing in the studied 7+ min video (approximate, from a secondary summary): hook+framing 0:00-~1:22; mechanism 1 ~1:22-2:21; bridge ~2:21-2:34; mechanism 2 ~2:34-4:16; mechanism 3 ~4:18-5:20; mechanism 4 ~5:22-7:01; twist+synthesis ~7:01-end (Report §5.1). The number of mechanisms (2-4) is **not** a proven invariant.

## 6. Script rules

- **Hook (first 20-35 spoken seconds)** must contain: a concrete sensory/action scenario; the central contradiction; a direct or implied question; a reason to distrust the obvious answer; and (in the setup block) a `promise_vector` (kinds of answer to come - biology/history/economics - without the final synthesis). PROPOSED measurable rule from the observed opening (Report §6.1). Don't hard-code the target's wording or cadence.
- **Section microstructure** (observed): `CLAIM -> MECHANISM -> CONCRETE EXAMPLE -> VIEWER ANALOGY -> CONSEQUENCE -> BRIDGE` (§6.2).
- **Sentence behaviour** (qualitative; the transcript is too noisy for statistics): second-person address ("imagine", "think about"), rhetorical questions, short pivots ("but here's where..."), concrete nouns and action verbs that can be drawn, reframing after examples, end-loaded twist (§6.3). Output **semantic beats before polished prose** so these functions are deliberate.
- **Information density**: fail a section when >25% of its words are neither necessary mechanism, evidence/example, tension/transition, qualification nor payoff (PROPOSED engineering threshold, not measured; Report §6.4). No biography/history tangents unless they change the answer to the central question.
- **Visualisable prose**: every 1-3 narration sentences must create or materially alter a visual scene; abstract text with no meaningful visualisation is rewritten (Handoff §Script policy). The toolkit's house rhythm rule for the everyday-systems channel is a visual change at least every 3.5 s (long) - unvalidated for this format; decide your own max-hold and record it ([everyday-systems SUBSKILL invariant 3](../../everyday-systems-explainer/SUBSKILL.md)).
- **Plain language**: titles and hooks use ordinary words; no citation/URL text in narration unless editorially intended; names pronounced via a pronunciation lexicon (§13.2).

## 7. Open loops and retention debt (Report §5.4, §6.5)

During outlining create explicit loop objects and carry a `retention_debt` per section (what unresolved question or promised layer remains). A section may not remove all retention debt before the midpoint unless the next question is stronger.
```json
{ "loop_id": "loop_03", "opened_beat": "b_004", "promise": "The deepest reason is about the viewer, not the predator.",
  "must_close_by": "b_031", "closed_beat": "b_030", "closure_type": "identity_reframe" }
```
Script gate rejects dangling loops and loops whose payoff merely restates the setup. `max_unresolved_major_loops_at_end: 0` (Report §25.3). Beat fields `open_loop_ids_opened/closed` carry them into the beat file ([pipeline-and-agent-roles §3](pipeline-and-agent-roles.md)).

## 8. Claims, scope and title qualification

- **Evidence before script** ([idea-research-packaging](idea-research-packaging.md)). Every non-connective factual assertion has a claim id; totalising language ("humans evolved to", "our bodies know", "this is why humans never", "millions of years taught us") needs a ledger entry supporting that *causal scope*, otherwise rewrite narrower ("may contribute", "one reason", "helps explain") (Report §6.6). Reproduce the *drama*, not the epistemic shortcuts.
- **Absolute titles are allowed only with a `title_qualification`** (Report §4.2): literal truth status; narrower defensible claim; where the video qualifies; whether the title is materially misleading without it. If the narrower claim cannot keep the curiosity gap, reject the title. Observed case: title says "Never", description/body says people do eat the animal.
```json
{ "packaging_claim": "Humans never eat warthog", "literal_status": "OVERBROAD",
  "defensible_core": "Warthog never became a globally domesticated staple",
  "qualification_deadline_sec": 75, "qualification_beat_id": "b_006" }
```
The script may challenge the title - that can be a retention feature - but early enough (<= ~75 s in the example) that the video is not simply misleading (§6.7). Title safety record and rejection rules: [idea-research-packaging §6](idea-research-packaging.md).

## 9. Scale switching and visualisability (Report §7.1, §8)

Plan visual scale deliberately: table/plate -> landscape/hunt -> diagram -> body close-up -> researcher/history -> montage -> return to plate. Explanation by **simulated decision** (§7.2): build a mini-world (hunter present, hunger/goal set, deer and lion as competing targets, danger/energy trade-off shown through action or comparison) and keep it alive long enough for the choice to read.
Linguistic trigger -> visual treatment mapping (Report §8.2; PROPOSED local equivalents, not observed): "Imagine you..." -> `REAL_WORLD_SCENARIO` (create/reuse protagonist + location) · first mention of person/animal -> introduce stable `entity_id` · action verb -> pose/motion event on the current scenario · "but/however/except" -> `REACTION`/`CAMERA_CUT`/counterexample insert · comparison -> `COMPARISON_SPLIT` or same-world choice · number -> `TEXT_STAT_EMPHASIS` (+ claim id) · process -> `CAUSE_EFFECT_CHAIN` · location reference -> reuse location · historical case -> `HISTORICAL_VIGNETTE` · researcher/study -> `RESEARCH_ATTRIBUTION` (no fake quotes) · body/parasite/toxin -> `BODY_MECHANISM` insert then return · abstract idea -> `VISUAL_METAPHOR` only if literal fails and it implies no false mechanism · joke -> brief visual punchline · exception list -> `EXCEPTION_MONTAGE` · callback -> reopen original assets · connective sentence -> `HOLD`.
Scene-operation decision logic: [storyboard-schema §7](storyboard-schema.md) and [pipeline-and-agent-roles §4](pipeline-and-agent-roles.md).

## 10. Closing and counterexamples

Reserve a `COUNTEREXAMPLE_CHECK` before the final synthesis; strong counterexamples are used as a twist, not hidden (Report §7.3). The final 10-20% answers "what changes in how the viewer sees the opening situation?" rather than re-listing mechanisms (§7.4, PROPOSED rule). Prefer a callback that reuses the opening assets and camera echo.

## 11. Script acceptance checklist (Report §27.3; Claude applies it, a verifier subagent re-checks)

Central question stated early · hook concrete, not throat-clearing · obvious surface answer addressed where relevant · mechanisms causally distinct (not paraphrases) · examples serve mechanisms · **unsupported facts = 0** · every material factual assertion links to a claim id · counterexamples checked · title premise explicitly qualified · final section refines/pays off · no open loop unresolved · estimated duration within bounds · no section visually impossible without misleading imagery · no copied wording from any reference video.
