# Topic selection and the research behind the channel

Contents: 1 Why the channel exists · 2 Inclusion/exclusion rules · 3 The six pillars and the 60-topic reservoir · 4 How a topic is chosen (steps, scoring schemes, repeat check) ·
5 Competitive landscape (dated snapshot) · 6 Numbers-ledger discipline · 7 The 2026-08 automation blueprint: what survived · 8 Channel evolution

Research date of the corpus: 2026-08-27 (Africa/Casablanca). Its competitor numbers are snapshots; its web/YouTube findings were retrieved that day.

## 1. Why the channel exists

Decision (seven-niche comparison, 24/25): **Hidden Everyday Systems** (YouTube name GhostSystem) - "You do it every day. We show where it goes and what happens next."
It beat household-object internals (23), everyday logistics (23, folded in as a pillar), safety systems (22, used as a recurring "failsafe" series), building anatomy (21, too occupied),
automotive (21, saturated) and everyday manufacturing (21, saturated by How It's Made-style content). Scores were 1-5 on evergreen, broad curiosity, simple visuals, 50+ topic depth and open
competition (5 = open). The moat is not the visual style (copyable): it is a recognisable ordinary-action hook, rigorous visible sourcing, one consistent flow grammar, a clear line between
universal mechanism and regional implementation, continuity-safe drawings, and a catalogue rotating among six systems without changing the audience promise. Click-through, retention and
monetisation are unknown until published: validate with controlled uploads and real analytics (do not chase one outlier; keep packaging learning separate from script/visual learning).

## 2. Inclusion and exclusion rules

An episode qualifies only if it has: (1) a familiar trigger the viewer personally does or sees; (2) an unseen chain of at least three meaningful stages; (3) a concrete destination, outcome
or failure point; (4) a mechanism showable with flows, cutaways, maps or state changes; (5) enough authoritative material to build a claim ledger before scripting.
Do not publish: general science with no everyday system or journey; abstract economics/psychology/history/self-help; pure "how it's made" factory episodes; pure car/appliance teardowns
with no wider hidden network (note: the post-Sep-13 "inside a ..." object videos deliberately relaxed this, see section 8); news-driven infrastructure whose value expires with the news
cycle; topics needing proprietary facts unavailable from credible sources.

Hard rejection conditions for any candidate: no authoritative source for a core mechanism; depends on one company's proprietary process; the answer is essentially one sentence; required
drawings need detailed faces, acting or photoreal evidence; title is news-dependent; duplicates an incumbent's title, structure and mechanism coverage with no distinct viewer benefit.
Prefer topics with a **contradiction or exception at the core** (a bird touches thousands of volts and lives) over pure sequential walkthroughs; sequential topics are valid but need a stronger
reversal hook. Favour adjacent mysteries so the catalogue reads as one system (electricity > birds on wires > waste-to-energy > outlet; flush > toilet water > sewer-smell trap); state the
adjacent-mystery seed in the outro (`next_tease`). Regional differences only when material, never as filler.

## 3. The six pillars and the 60-topic reservoir (no coverage marks: check the ledger)

Pillars: water/drainage/sanitation · power/gas/home energy · internet/signals/information · waste/recycling/reverse journeys · packages/mail/retail supply · streets/buildings/public circulation.
Recurring grammar: familiar trigger > reveal the hidden network > 3-7 handoffs > the mechanism that makes it possible > one failure or misconception > the real destination > compress the whole journey into a recap (a story grammar, not a fill-in-the-blanks template).

A. Water: toilet water after a flush · tap water river-to-kitchen · why water towers exist · water to a skyscraper's top floor · inside a wastewater plant · where street-drain rain goes · why sewer smells stay out · septic tank without a sewer · a water main break · fire hydrants' water.
B. Power/gas: electricity plant-to-outlet · neighbourhood transformer · grid balance every second · blackout to lights back · natural gas to a stove · smart meter reading · where unused rooftop solar goes · district heating · birds on power lines · breaker stopping a house fire.
C. Internet/signals: undersea cable to Wi-Fi · after typing a web address · phone finds the nearest tower · a text reaches one phone · GPS without a return signal · contactless payment to the bank · after scanning a QR code · emergency call to the right dispatcher · live TV to millions at once · internet works while the phone line is dead.
D. Waste: trash after collection day · recycling after the blue bin · recycling plant separation · food waste in compost cities · an old phone recycled · used cooking oil · a car at end of life · landfills keep leachate out of groundwater · hospital waste · clothes in donation bins.
E. Packages/supply: a package across the world · sorting machines reading messy handwriting · suitcase after check-in · milk on the shelf daily · gas stations refilling underground tanks · a shipping container factory-to-store · after an online return · frozen food across a long chain · pharmacies get the right medicine · a letter crosses a country.
F. Streets/buildings: what's under the road · traffic lights decide who goes · elevators know where to stop · air inside a large office building · subway tunnels dry below the water table · escalator steps disappear and return · parking garage free-space count · pedestrian crossing button · sprinklers know which head opens · clearing storm drains before a flood.
Launch slate ordering (familiarity, clean visual progression, pillar variety; not predicted views): toilet water, electricity to outlet, trash after collection, internet via undersea cable, package to door, water towers, street-drain rain, recycling, under the road, skyscraper water, suitcase, traffic lights, gas to stove, address sorting, blackout recovery, recycling plant, contactless payments, hydrants, online returns, dry subway tunnels. The pilot ran four videos across four pillars with the same visual language/voice/thumbnail grammar so early results were diagnostic.

## 4. How a topic is chosen

1. **Candidate pool:** the reservoir above, plus "how does X work" objects (the object-mechanism series since Sep 13), plus viewer comments and search suggestions as question signals, official explainers from utilities/regulators, and analytics once published.
2. **Repeat check (mandatory before selection).** A new slug alone is not proof of a new subject. Check by **subject and angle**, not slug (remasters renamed slugs, e.g. `zipper-hidden-y` became `inside-a-zipper`). The history set = every `slug` in `release-calendar/LEDGER.json` + every directory under `examples/` (80) + every item under `production-3d/` and the experiments' 3D tests. Every ledger entry reads `status: scheduled`: the ledger records scheduling, not what is live (the owner uploads). Brand-new 3D topics must be subjects never covered in 2D or in the 3D tests. `score_topics.py` builds this history set (ledger slugs + example dirs) and reports overlap.
3. **Score** (pick one scheme and say which; all four existed):
   - *Niche scorer (Aug 2026, historical):* 1-5 on evergreen, broad curiosity, simple visuals, 50+ depth, open competition (sum /25).
   - *Blueprint triage (never run in code):* 0-5 on familiarity, "wait I don't know that" gap, visible 3+ stage journey, simple visualisability, source availability, evergreen durability, exact-angle saturation, misconception/reveal potential, title clarity under ~12 words, pillar balance vs latest uploads; run twice for self-consistency.
   - *`experiments/topic_scoring.py` (from the Sept audit):* seven 0-10 dimensions - familiarity .15, curiosity_gap .20, contradiction .20, stakes .10, visualizability .15, explanatory_depth .10, packaging_strength .10; for Shorts contradiction .30 and depth .00 (a Short has no room for a second layer). CLI: `python experiments/topic_scoring.py --format long|short --json scores.json`.
   - *`production-batches/2026-09-19_26/score_topics.py` (v3 object deep dives; **last used**, 2026-09-19):* demand, richness (sub-mechanisms; a v3 deep dive needs 3-5 ideas now), animatable, sourceable, novelty each 1-5, minus overlap (0-5) and safety/misuse risk (0-5): `score = 2*demand + 2*richness + animatable + sourceable + novelty - 3*overlap - 3*risk`; it ranked 28 candidates and chose the top 16 into 02:00/17:00 slots Sep 19-26. Writes `topic-scoring.json`.
4. **Approve a one-sentence episode promise before deep research** (prevents spending research and render budget on a weak angle). Check `SUPPORTED_ICONS` only for legacy packages; v3 draws everything in code, so what it needs instead is a drawable mechanism from real references.
5. **Research packet:** source hierarchy, claim ledger, scope/exclusions, prohibited over-generalisations (see `editorial-and-quality.md` s2). Conflicts stay visible.
6. **Script and gates** per `editorial-and-quality.md`; schedule per `operations.md`.

## 5. Competitive landscape (snapshot 2026-08-27)

Incumbents: Practical Engineering (sewer explainer indexed >5.4M views; owns rigorous infrastructure), The B1M (3.9M+ subscribers, construction), Lesics (6.97M subscribers, 1.14B views, engineering animation), Branch Education (1M+, rigorous 3D internals), Jared Owen (3D "how things work"), Wendover (logistics), How It's Made (2001-2019, manufacturing), Engineering Explained (automotive). Lesson: the opening is the combination and framing - short, ordinary-action-first journeys across several civic networks in one hand-drawn visual language - not any single topic. The reference faceless-channel video (14:37, uploaded 2026-08-21) taught: topic carries the click more than the drawing style; test whether the subject matters in two years; finish narration before fixing scene count; generate visuals from the finished script; check thumbnails at display size; treat the first AI draft as raw material. Its weaknesses (no claim ledger, no independent fact check, no source hierarchy, no diagram verification, one repeated image prompt for continuity) are what this pipeline adds. Later (2026-10) the owner studied Zack D. Films and The Why Side as quality/pacing benchmarks (see `editorial-and-quality.md` s5 and `references/production-3d.md`).

## 6. Numbers-ledger discipline

Keep a table per research deliverable: value, what it claims, source id, retrieval status/date (e.g. "fetched 2026-08-27"). Counts and snapshots are labelled snapshots. Every exact number in a script needs a primary source plus conditions; keep numerals in claims/labels/descriptions but spell them out in narration. Mark each assertion as sourced, own analysis or inference (the corpus tagged `[MY ANALYSIS]`, `[INFERENCE]`): no unlabelled inference in channel-facing copy. The corpus's own limits: no complete public niche census exists, so "saturation" is a comparative editorial judgement, and the recommended upload-time note ([INFERENCE]: US-weighted audience research, not this channel's analytics) must be re-derived from Studio analytics once there is watch-time history.

## 7. The 2026-08 automation blueprint: what survived

Designed: a `hidden_everyday_systems` niche and `paint_journey_explainer` archetype inside the technews engine, Human Gate 1 (script/evidence) and Gate 2 (final render), claim-grounding, prompt registry + golden set, a procedural doodle component library (seeded irregular outlines, stable object ids, continuity graph), visual-truth tags (`schematic`, `section`, `map`, `illustrative`, `evidence`), visual validators (claim coverage, entity coverage, flow direction, label collision, screen density, continuity, variation, caption safety), an analytics feedback loop (`quality_score = CTR x early retention x completion x satisfaction proxy`, never click-only), and eight golden episodes before aggressive prompt iteration.
What actually exists: none of it was built inside the technews engine. The channel runs a standalone pipeline (`pipeline_v3.py` gates replace the validators; `Diagram.references/scale` replace the continuity graph; human review of stills/audio replaces Gate 2) and the agent itself is the LLM layer (no model-API backends in pipelines). Principles that remain live: automate labour not judgment; human approval for the thesis, unresolved source conflicts, final script, rights ambiguity and final render; approval freezes a version hash so a later script edit invalidates audio/visuals (the narration digest/cache keys do this); label what is schematic; do not train the loop on clicks alone; "definition of not AI slop": every claim traceable, every diagram truthful at its declared abstraction, a specific causal explanation, a voice that was listened to, consistent recurring objects, visuals that change because the explanation changes, material difference from previous episodes, explicit human approval. Packaging title grammar from the blueprint: "Where does X go after Y?", "How does X get from A to B?", "What happens after you X?", "Why does X exist if we already have Y?" (superseded in form by `question-mechanism-v1`).

## 8. Channel evolution (so old docs make sense)

Aug 27-Sep 12: journey/city-systems channel (hand-inked FLUX icons, long ~65 s + Short + brainrot Short). Sep 13-18: causal-v2, twelve small mechanisms, two subjects/day (02:00 and 17:00), both Shorts. Sep 19-26: pipeline v3 deep dives on single objects ("inside a ..."), rejected, redone to the escalator bar (3.3/3.4); all 34 pre-v3 subjects queued for remaster. Oct 3: revision 3.5 (ZDF rhythm, physics gates). **Oct 10 (owner decision): all 2D production stopped; focus moved to the 3D Blender line** (see `current-state.md` and `references/production-3d.md`). The 2D v3 pipeline is complete, documented and frozen unless the owner resumes it.
