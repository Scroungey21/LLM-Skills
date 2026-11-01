# Editorial and quality standards (Hidden Everyday Systems / GhostSystem)

Contents: 1 Promise · 2 Evidence standard · 3 Script rules · 4 Clarity rules (3.3) · 5 Rhythm rules (3.5) · 6 Show what you name · 7 Narration and cadence QA ·
8 Music and sound effects · 9 Verify three times · 10 Completion discipline · 11 Authoring gotchas from the batch briefs · 12 Audit lessons (retention, anti-slop)

Every rule here came from a dated user review. They are floors and defaults, not a checklist to satisfy performatively: faster, louder or more cuts is not automatically better,
and retention must never be bought with a less accurate claim.

## 1. The promise

One ordinary physical object, system or process per video. Target reaction: "I use this, but I do not actually know what happens inside it." Evergreen, broad curiosity,
simple visual causality, enough depth for a durable catalogue. Content must feel researched and intentionally produced: AI is an implementation aid, never a substitute for fact
checking, art direction, listening or visual review. The user's bar (verbatim themes from reviews): "not AI slop" visually, audibly or informationally; "I had to already have
predefined knowledge to keep track" is a failure; drawings must look and move like the real object.

## 2. Evidence standard (hard rules)

1. Define the representative system and its exclusions before scripting. When the real thing varies by make, draw ONE common real layout and say so in `accuracy_scope`.
2. Source hierarchy: regulator / standards body / public operator > engineering manual, patent, manufacturer service manual > university or peer-reviewed > named expert or trade
   publication > existing explainers (only to find terminology, never as final authority when a primary exists).
3. Break the explanation into discrete claims. Every scene cites claim ids; every claim cites source ids (all must exist) and carries a `qualification` (geography, alternates,
   omitted stages, optional equipment). A material factual sentence without a claim id blocks scripting.
4. Never invent statistics, infrastructure paths or exact figures; a number is allowed only if sourced with the conditions under which it applies. A second independent check for numbers that carry the conclusion.
5. No hedging in narration (`HEDGE_PATTERNS`: representative, simplified, schematic, "our drawing", not all, varies, in this design, other designs, not shown, exaggerated, conceptual, may differ, keep in mind...). Precision belongs in the wording; scope and exceptions live in `accuracy_scope` (description footer) and claim qualifications.
6. Prefer the mechanistically precise explanation over the punchier folk-physics shortcut ("current takes the path of least resistance" is wrong; potential difference across the bird is right). Qualify generalisations ("under standard U.S. residential wiring").
7. Recheck unstable facts online before production. Conflicting sources stay visible: qualify or omit; never silently pick the convenient one.
8. Sources go in the description and `sources.md`; links must support the nearby claims, not merely the broad topic. Fact-fidelity audit before narration: re-read every scene's narration against its claim and source (a 2026-09-06 audit caught three unsourced additions: an invented "60-120 second" cycle range, a "GPS sync" detail, an unsourced ignition detail).
9. A wrong detail you point out is far better than one you hide: report uncertainty and unimplemented details.
10. When the script says something about a part that is not drawn, draw it or change the words.
11. Research folder per topic: `production-batches/<batch>/references/<slug>/REFERENCE.md` = each reference URL and what was taken from it, then a **DRAWING SPEC** (real dimensions in mm, part positions, real motion: speeds, ratios, angles, travel), with confidence tags per number (stated in source / measured from a dimensioned drawing / derived by geometry / recalled / unsure). Reference images are viewed, not downloaded, unless the owner authorises a download. Never open a PDF link in the browser pane (it pops a save dialog on the user's screen): use WebFetch.

## 3. Script rules (all revisions)

- Open on the familiar action/object and reveal the hidden system immediately. Frame 0 already carries the hook composition; never fade up from an empty cream frame (fixed pipeline-wide via `frameOffset`).
- State the contradiction, not just the topic ("why doesn't X happen" beats "here is X"); hooks must pose a real question or reversal, not a declarative fact.
- Concrete nouns/verbs that map to visible objects, paths and transformations. Vary sentence length and scene rhythm: uniformly polished same-length declaratives are the top automation tell.
- Each script should contain: one misconception correction or surprising fact, one moment of natural editorial voice, one concrete practical consequence, one exception or edge case.
- Say a fact once, then advance (never repeat a scene's core claim in two consecutive headlines/captions).
- Escalate curiosity at least once per long video (early "here's the mechanism", later "when does this go wrong / what's the edge case").
- Endings land: synthesise the core mechanism in one sentence and, where a genuine adjacent mystery exists, seed the next question (`next_tease`, <=50 chars; the long's `tease` scene names the next video; the last subject uses "Next week: more everyday machines"). Generic "subscribe" cards are not a reason to watch.
- Storyboard shape (not every beat needed, but do not drop both exception and consequence): familiar observation > hidden mechanism > visual demonstration > unexpected exception > consequence > adjacent mystery. A journey topic follows one unit (a parcel of water) through the stages rather than disconnected cards.
- **Spell numbers out in narration** ("two hundred and fifty degrees", "seventeen seventy-five", never "1775"; same for units/symbols: "psi", "15 PSI", "deg F"). The cadence gate divides written words by clip length, so a numeral counts once but takes ~4 words to say and the take fails as "too slow". Figures stay numerals in claims, labels, callouts and descriptions.
- Short scenes should be >=20 words (clip lead-in/tail silence counts against measured pace, so very short lines fail the cadence gate on arithmetic alone). Two clean clauses beat one clipped sentence. A hook with a colon plus comma stretches pauses; rewrite into two clean clauses instead of adding seeds.
- Dense comma lists and comparative constructions read slowly (a four-item list and "how much X is supplied with how much Y are used" both failed 165 WPM): shorten, plainer connectives, keep the sourced terms.
- Refer to a part by the same words the diagram labels (`say=[...]`, section 6).

## 4. Clarity rules (revision 3.3, user review 2026-09-23; apply to every v3 topic)

The first v3 batch was rejected: drawings unlike the real objects (steps drawn as T-shapes on floating posts, a handrail at the wrong angle, a box for a truss, parts fading in/out instead of going round their loop), scripts too long/technical/slow, and Shorts that cropped 16:9 diagrams in half with ~20 px labels. The escalator redo (`production-batches/2026-09-19_26/topics/inside_an_escalator.py` + `references/inside-an-escalator/REFERENCE.md`) is the approved bar ("a hell lot better, finally").

**Explain it to a curious twelve-year-old.**
- One idea per scene. Chapters = intro + 3-5 ideas viewers actually wonder about, not every sub-system. Depth on a few beats coverage of many.
- Plain words first. `pipeline_v3.JARGON` (truss, sprocket, torque, balustrade, riser, cleat, piston, solenoid, escapement, pawl, ratchet, compressor, refrigerant, inertia, frequency, ...) fails validation unless declared via `P.term(term, plain, comparison)`: at most 4 in the long, 2 in the Short, and the scene that first says the word must also say the comparison aloud ("like a bicycle chain"). Deliberately NOT jargon: motor, chain, gear, wheel, spring, valve, sensor, switch, brake, pressure, friction, axle, belt, track. Plain beats precise ("the steel frame", "the big toothed wheel", "the wheels at the back of each step").
- Every mechanism gets an everyday comparison the viewer already owns (bicycle chain, supermarket checkout belt returning underneath, treadmill belt). Check the comparison is not technically misleading.
- Cause first, then show it: say what the part does and why while the diagram shows exactly that. No numbers/standards unless they make the idea land.
- Reading grade <=6.5, sentences <=20 words and mean <=13 per script; hook <=30 words.

**Draw from real references, to scale.**
- Collect references (patent figures, manufacturer drawings, teardown/repair photos on Commons or iFixit, published dimensions) before drawing. Every `Diagram(..., references=[(source, "what it shows")], scale="1 unit = 5 mm")` must list them (`validate_references`).
- Draw in real units. Parts that touch in life touch in the drawing; parts are mounted on something; nothing is spaced out "for clarity" if the real object is not.
- Motion follows the mechanism: compute positions from real constraints (a step's front wheels ride the chain, its back wheels ride their own track; a gear turns at its tooth ratio) with `kinematics_v3`. Closed loops are closed: a part that fades out at one end and reappears at the other fails (`validate_motion`).
- Proof stills side by side with the reference images before recording narration.
- Never wrong the physics to be tidy: the old escalator script had the two-track explanation backwards and was rejected.

**Framing.** No titles across the top (no headline, no chapter chip). Do not reuse a 16:9 camera in the Short: `fit(diagram, [ids], "short", state)` or a dedicated portrait diagram. Each camera move names its subject (`highlight=` or `focus=`, required in Shorts). Framing gate: any subject >10% out of frame or under the Short's right-hand button rail fails; callouts out of frame fail; any two labels/callouts that collide at on-screen size fail; labels never render below 24 px (long) / 36 px (Short).

**Opening teardown (`validate_opening`).** Every video opens on the object as viewers know it (frame zero instantly recognisable: a wristwatch with strap and dial, a washing machine in a room) and strips it layer by layer until the mechanism is bare, within the first 3 scenes (long) / 2 scenes (Short). `ext = Diagram(id, title, kind="exterior")`; `states = ext.teardown([(layer_id, dx, dy), ...], each=1.5)` outermost first, `dx, dy` pushes the layer fully out of frame (~1,200+ units). It generates `assembled` (loop) > `strip-1..n` > `opened` (loop) plus `strip-all` for the Short. Draw the innermost layer to match the first mechanism diagram's framing; `only=[...]` keeps inner parts out of the assembled states. City-scale systems still open on the familiar object (a toilet, wall outlet, tap, streetlight head, router, elevator buttons, gas meter), then follow the system out, each station drawn to scale in its own diagram, linked by a route diagram that states distances honestly; say so in `accuracy_scope`.

**Visual clarity house rule.** Minimise clutter and never hide one visual element behind another unless the hiding is the explanation (a teardown layer lifting, a cutaway opening, a part passing behind another because the mechanism does). Chrome stays out of the stage; text on the artwork is a label/callout in diagram coordinates. Overlay cards were removed channel-wide 2026-09-20.

## 5. Rhythm rules (revision 3.5, user review 2026-10-03: "audience all have ADHD ... match Zack D. Films")

Measured on ZDF mechanism Shorts: 24-36 s (median ~29 s), ~82 words, speaking from 0.0 s with the object already moving, one part = one ~18-word sentence = one visual segment (small parts ~3 s, core mechanism 1.5-2x that and 28-58% of runtime, setup 20-35%), a visual change every 1.5-3 s, camera almost always moving, named part lit in one solid colour with the rest dimmed, on-screen text = captions only, last line = the visible result. ZDF narrates ~165-175 WPM; our voice is already ~205-215, so we do NOT speed it up: our slowness was words per idea and still pictures.

1. Start in motion, in second person ("When you...", or a misconception then "...but"). No title, preamble, "in this video".
2. One part = one sentence = one beat (12-18 words, <=28 per scene; each hands off to the next: "This spring...", "Then...", "Once..."). Cut history, trivia, anything the picture does not show.
3. A visual change at least every 3.5 s (long) / 2.5 s (Short): a cut, a step lighting the next part on its word, a camera move or a state change. A step that changes nothing is not a change; do not write one. Prefer lighting the next part or changing state over moving the camera.
4. The core gets the time: `core=True` on scenes about the one core mechanism; shots up to 6 s (Short 4.5 s) only while the mechanism moves; core = 25-60% of runtime.
5. Lengths: see the 3.5 column in `architecture.md`. Short still ends `payoff` + one-line `cta`.
6. Name jargon once, while lit ("a cooling liquid called refrigerant"); at most one new term per sentence.
7. End on the visible result. Accuracy never gives way: speed comes from cutting words and setup, never from a false simplification.
8. **Camera continuity (permanent, 2026-10-04: "stop moving the screen just to show the same object")**: while focus stays on one part the camera holds its framing; move only to bring a different part into focus, straight there (pan/zoom), never out-and-back, never whip away and return. A diagram switch is a straight cut. Renderer: one 6% push-in (`DRIFT=.06`) per run of shots keeping the framing, across steps, states, scenes. Gate `motion_check.check_camera_return` (within 8 s on one diagram: A>B>A where B moved without changing focus, or a pull-back-then-push-in, fails).

## 6. Show everything you name (user review 2026-09-24)

- Every shot of an explaining scene highlights what it is about (`tease`, `endscreen`, `cta` exempt). The highlight follows the narration: whenever it names a part, that part is lit at that word.
- Parts carry the words the script uses: `say=["handrail"]`, `say=["big toothed wheel"]`. `validate_mentions` fails any spoken alias whose part is not lit (or pointed at) in the shot on screen at that word (a cue on the very next word counts). Avoid aliases that are also verbs ("you step on"); give moving groups plural aliases. Also read the script for things it names that no alias covers (floor, top, bottom) and light those.
- **Arrows are rare** (tightened twice on 2026-09-24; err toward fewer): an orange arrow (`point=[...]`) only for a part the narration mentions while the focus is something else ("the step slides under the **floor**" points at the floor while the step glows). Never an arrow on a highlighted part, never by default. **No arrow shorter than 1.5 s**: its run is the consecutive shots in a scene that keep pointing at the same part (`point` carries until a step sets `point=[]`); `validate_arrow_timing` fails short runs (estimated timing before narration, real word timings after) and the renderer drops any that slip through. Arrows fade in ~0.45 s, out over the last 0.25 s, keep their angle, follow a moving target; touching parts share one arrow.

## 7. Narration and cadence QA

- Window **165-240 WPM** at scene level AND whole-program level, from native generation. A failed take is rejected and re-sampled with a deterministic seed (base +0, 97, 211, 509, 731, 1009, 1301, 1597 ... for OmniVoice 8 tries; dots 16 candidates). If a whole sweep clusters under the floor, the sentence is the problem: rewrite it, do not add seeds, never stretch audio.
- **Never** use Rubber Band, FFmpeg `atempo`, resampling, pitch shift or any post-generation speed change. (OmniVoice's own generation-time `speed` parameter is a generation condition, steered toward 215 WPM when a take is out of window; that is allowed, a time-stretch of finished audio is not.)
- Provenance in `render.*.json`: provider, voice, `native_pacing true`, `post_generation_speedup false`, `tempo_factor 1.0`, reference sha256, seed per scene. Never hand-edit it; stale provenance = regenerate (`audio --force`).
- Word timing: ASR round-trip alignment with proportional fallback (not forced alignment; evaluating forced alignment is an open, separate project). Per-scene cache key = voice_id + reference sha256 + requested base seed + narration sha256, so a voice swap, seed change or narration edit invalidates exactly what is stale; scenes narrated by two voices must never ship in one video (a 2026-09-03 bug shipped mixed-voice scenes until the key was widened).
- Listen for: warmth, consonant clarity, omitted/repeated words, breath artefacts, clipped endings (a sentinel was added to dots generation after "grid" was under-articulated), overlong pauses, identity drift, metallic resonance, echo/reverb. Objective checks (`ffprobe`, `volumedetect`, `silencedetect=noise=-45dB:d=0.15`) support but never replace listening. A tool session without audio input must say it did not listen; every delivery report lists the pending human listening review.
- Narration is produced by the lead through one queue, not by parallel authoring agents (the voice server is shared and slow; if `audio` fails for ~10 minutes, stop retrying and report "verification 3 blocked" with the exact error).

## 8. Music and sound effects

- Beds come only from `examples/music-library.json` (CC BY 4.0, each licence and Content ID stance read on the artist's own page; never buy a track without asking: a Zabriskie track that now costs $1 was skipped). Pick one per topic with `P.music("<id>")` to suit the object's pace (sparse pads under busy sfx; the escalator uses "numinous-shine"); otherwise slug rotation picks. Long and Short use the same bed.
- Each bed is levelled to `reference_lufs -18` by its measured `gain_db`, trimmed with `trim_seconds` (no dead air in the loop), then `relative_volume 0.13` with 1.5 s fade-in / 2.0 s fade-out, and built as its own stem `stems/music.<variant>.wav`: 150 Hz high-pass (2 stages), -6 dB dip at 1.5 kHz over 2.5 octaves, ducking (threshold .05, ratio 2.5, attack 60 ms, release 600 ms, knee 6) while the narrator speaks.
- **Gate `audio_bands`**: octave bands 63 Hz-8 kHz over speaking frames: each band's average >=18 dB under the voice, >=22 dB in 250 Hz-4 kHz, loudest 5% >=8 dB under. QA reports `music_under_voice`; the sfx bus gets `sfx_under_voice`. "Jellyfish in Space" sat 18 dB under overall but 10 dB OVER the voice at 63 Hz and "overwhelmed" the escalator video: it is in `rejected` and never picked again. Validate rejects a gain that does not level a track and a trim shorter than 2 minutes. Adding a track: measure integrated loudness on the trimmed audio plus `silencedetect` at -50 dB for trim points.
- Credit: Kevin MacLeod and Scott Buckley run Content ID and clear claims only from their exact credit text in the description; `attribution` holds it verbatim; QA `music_credit` fails a delivery whose description lacks it.
- `python hidden_systems_production.py remix --slugs <slug>` rebuilds the soundtrack on existing frames and reruns delivery + QA.
- **Sound effects (standard from 3.4, user: "nice")**: `P.sound(...)`; only sounds the real visible part makes, only while it is on screen and moving, placed at the part's world position (camera = listener: level, off-screen fade, stereo pan, muffling by covers); timing computed from the mechanism (`period`/`phase` from real speed and pitch; event sounds from state-local `times`); presets `step-clack, chain-tick, knock, creak, coin-tink, coin-scrape, crunch, clunk, switch-click, whoosh, motor, roll, handrail` or a recipe dict (damped modes + noise burst; or tones+noise loop). Few and well chosen (4 right beat 12 noisy). The bus is cut below 120 Hz, ducked, levelled to pass the sfx margins. `validate_sounds` requires at least one sound with real diagrams/states. Chapter changes in long videos get a quiet procedural whoosh.
- Never raise music to "add energy".

## 9. Verify three times, every video (user instruction 2026-09-24)

1. **Gates before narration.** `python production-batches/<batch>/topics/<topic>.py` must print `valid` (references, motion, framing both stages, mentions, arrows, clarity, materials, sounds, attachment, continuity, thumbnail question, pace/physics). Then **prove the gates bite**: break one mention, one material, one thumbnail question (and at 3.5 one pace and one physics rule) in memory, confirm each is caught, undo.
2. **Stills before narration.** `preview` renders a still at every camera move. Open every one against the narration and the reference images: the right part lit when named (an arrow only on an off-focus mention, up >=1.5 s), nothing cropped or covered, shapes and proportions true, motion plausible, labels legible, textured scenes look like the real object, streams stop when their source is empty. Budget several rounds. Contact sheets first, then single stills.
3. **Motion after render.** Extract frame sequences 0.25-0.6 s apart at every state change and every followed step, plus the published Short's sheet: steps travel continuously, nothing snaps or teleports, arrows track their targets, the Short's card and CTA read; a lead frame review catches narration/visual contradictions that agents miss (a washing machine showed water after "the water is gone"). Only then file it. Report what was checked and what is still uncertain.

## 10. Completion discipline

A pilot is not complete because files exist: regenerate provenance, validate, inspect audio objectively and by listening, render all videos and thumbnails, inspect representative frames/contact sheets, confirm descriptions/sources/music credits, report rejected takes and known limitations honestly. Show the user current files, not stale outputs; old videos in `output/` are not final until current provenance and QA pass. Never present a ledger entry as proof something is live: the owner uploads.

## 11. Authoring gotchas (from the redo/remaster/re-pace briefs)

- Back up the old topic file before rewriting (`references/<slug>/_superseded_<file>_v3.2.py`); the old package is a subject reference only (angle, sources, claims) - never copy its drawings/script; old claims were not always right: recheck.
- Do not edit shared code (`authoring_v3.py`, `pipeline_v3.py`, `sfx_v3.py`, `kinematics_v3.py`, `diagram_geometry.py`, `hidden_systems_production.py`, `audio_bands.py`, `visual-system/**`, `examples/music-library.json`, `release-calendar/**`) while authoring a topic; if the pipeline cannot do something, work around it in the topic file and say so. Do not render, schedule or upload from an authoring task.
- `extends` in a derived state inherits only the base state's tracks, not its `hide`/`show`: list hidden parts in each derived state.
- A part whose resting outline is wholly off the canvas may not be drawn even when its motion brings it into view: keep resting positions on the canvas and move parts with offsets.
- Loose specimens (a stand-alone part drawn beside the mechanism to show its shape) read as a piece that fell off once its scene is over: show it only in the scene that explains it, frame other shots on the mechanism.
- Where a stream is liquid it must be drawn connected to its source liquid, not just timed to it (`detached="<reason>"` for vapour/heat/air); see `visual-system.md` for the physics gates.
- Thumbnail photo placement: `place=(x, y, zoom)`; size the object ~1.3-1.5x the 600 px port; never download a replacement photo; photographer name goes in REFERENCE.md "THUMBNAIL PHOTO"; never edit `provenance.json` from a topic task (the lead records it).
- Scratch files get the slug as a prefix (the scratchpad is shared).
- Remastering: keep the old angle as the heart, check every claim against real sources again, new slug + file, old files/output/calendar folders untouched.
- Spell numbers out (see section 3); a numeral-heavy scene fails cadence on arithmetic.

## 12. Audit lessons (Sept 2026 forensic critic audit, distilled)

- Diagrams must show a causal relationship (before/after, cause > effect), not caption a noun; scale the hero visual to the drama of the claim.
- Vary composition grammar across a video's own scenes: after 2-3 sections a viewer should not be able to predict the layout (the biggest automation tell).
- Semantic changes (a new fact, a state change) should occur at least as often as decorative motion; a section that only wiggles one icon is dead weight. Continuous micro-motion during holds stays.
- A Short must stand alone: first frame/second communicates the hook without the long's context; the CTA must not eat a large fraction of the Short (measured ~14% pre-fix; keep it to the practical floor, ~2-3 s, one quick line).
- Foreground comprehension beats background visibility; the fix for poor legibility is compositing design (opaque card, outline/shadow), never a translucent panel (see `shorts-and-brainrot.md`).
- Asset-claim binding QC (v1/v2 `validate`): each scene's bound icon must be independently mentioned in its narration/headline/labels, and vice versa (each hyphen-separated word must qualify on its own; a summed count masked missing visuals). In v3 `validate_mentions` plays that role.
- Titles state the contradiction/question when the topic supports one; thumbnail and title complement each other.
- The pre-fix defects (blank first frame, duplicated headline+bullet, giant translucent panel, long CTA) are things to never regress.
- Human reviewers are shown one redone video at a time; incremental review (redo one, report, iterate) is how this user works.
