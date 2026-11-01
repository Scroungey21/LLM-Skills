# Niche playbooks (one section per niche)

Each section carries: promise, config (archetype / component / mode / sensitivity), sources, scoring rubric, voice and structure, evidence rules, hook style with the gold example, visuals/thumbnail, risks.
Config values are from `engine/app/seed.py` (code wins); example beats are from `few_shot_examples/<niche>-v1.json`; rules from the v4/v5/p10 specs and the in-app docs. Items marked **(derived)** are not in any source - they are
this skill's recommendation, extrapolated from the same rules.

Contents: 0 Reading the gold examples - 1 cyberattacks-zerodays - 2 ai-security - 3 ai-ml-papers - 4 infra-failures - 5 corporate-startup-autopsies - 6 scientific-fraud-retractions - 7 tech-myths-debunked - 8 tech-retrospectives - 9 weekly-tech-rundown - 10 Side niches (manga_recap, horror_stories) - 11 Cross-niche comparison and differentiation

Shared rules that are NOT repeated per niche (read once): channel-wide editorial/cyber/AI/policy standards, claim ledger, titles, descriptions -> `../../news-explainer/references/editorial-standards.md`;
voice, hook tiers, thumbnail identity -> `../../news-explainer/references/creator-style-guide.md`; field meanings and constants -> `niche-model-and-strategy-bundles.md`;
the stage prompts those fields feed -> `stage-methods-and-schemas.md`.

## 0. Reading the gold examples

All nine sets share one anatomy (2 examples each, 4-7 scenes; the weekly rundown 13-15):

- **Scene 0 = hook** (17-26 words, 6.0-9.2 s): a consequence or paradox, never a greeting. Concrete numbers/dates in the hook.
- **Exactly one pattern-interrupt** in the 5-scene sets, at scene 2 or 3. Usually a short blunt line (6-15 words, 2.4-6.0 s) that flips register ("No recurrence. No convolution. Just attention."); the ai-security and myth sets instead use a 24-28-word interrupt that carries the analogy or pivot (9-11 s). The longer sets carry one per ~45-60 s.
- **Body scenes** mostly 19-32 words, 7-11 s, one idea each; last scene = payoff / consequence / verdict.
- Pacing is real-speech, not authored fiction: every scene must satisfy words/2.5 <= `max_scene_ms` and 2.0-3.2 words/s (tests in `define-a-new-niche.md`).
- Anti-patterns inside the corpus - **do not copy**: (a) the second `scientific-fraud-retractions` example is explicitly "illustrative, non-attributed" and ends by referring to "this niche's own editorial rule" (meta-leak into narration);
  (b) the Glass example hook says "It shut down this year" (time-relative - write absolute dates); (c) several factual statements are unverified exemplars (cost estimates, "only", "never") - the examples teach *shape*, not facts;
  (d) the weekly-rundown examples are a *representative composite week*, not real news.

## 1. cyberattacks-zerodays - "what happened, how it works, what to do"

- **Config:** deep-dive; `cyber-terminal` (24 cps, <=12 s/scene); cis; sensitivity unset; runtime floor 360 s; no niche rubric/constraint beyond the relatable-contrast directive - the **cyber guardrail lives in the base scriptwriter prompt for every niche** (explain what happened, conceptual mechanism, impact, timeline, mitigation/patch status; never functional exploit code, working PoC payloads or weaponisation steps).
- **Sources (verified, V2 design 6):** The Hacker News `https://feeds.feedburner.com/TheHackersNews`, BleepingComputer `https://www.bleepingcomputer.com/feed/` (needs a realistic browser User-Agent - 403 to curl's default). CISA advisory RSS returned 403 and was dropped. The live channel instead works from primary advisories/CVE records (news-explainer).
- **Scoring:** no niche rubric seeded (base 1-10 scale only) - **(derived)** write one: reward a primary source (advisory/CVE/vendor post), observed exploitation, a mechanism explainable without exploit detail, broad blast radius; penalise vendor-FUD, PoC-only "research" with no impact, duplicates.
- **Voice/structure:** hook with the consequence plus a *removed barrier* ("No password. No exploit kit. Just a string.") -> where the system lives and what it controls -> mechanism in plain language -> a short "it was in almost everything" interrupt -> disclosure/patch timeline -> long-tail ("two years later, unpatched instances were still being found"). Beginner-accessible; define each acronym at first use and then keep the precise term (BEGINNER_FRIENDLY_TECH_DIRECTIVE).
- **Evidence rules:** keep four things distinct - *capability*, *observed exploitation*, *proof of concept*, *speculation*; state what the advisory does **not** establish; defensive guidance only from the source; do not trivialise victims; headline/thumbnail must not imply more than the evidence ("AI attacked a factory" vs "AI-written scripts in a campaign").
- **Gold examples:** Log4Shell (6 scenes; hook 22 w "In December 2021, a single line of log text could take over your server. No password. No exploit kit. Just a string."; interrupt 10 w; typing_chars 62-172) and WannaCry (5 scenes; interrupt = the researcher who stopped it by registering a hidden domain).
- **Visuals/thumbnail:** terminal prompt + structured log lines; mechanism diagrams stay conceptual. Thumbnail copy = the claim ("RESTART CHROME NOW" style), dark grid, no victim imagery **(derived)**.
- **Risks:** exploit detail creep; unverified IOCs; naming a victim org as culpable; numbers like "millions of servers per hour" are third-party scan telemetry - attribute.

## 2. ai-security - the AI x infosec crossover

- **Config:** deep-dive; reuses `cyber-terminal` (decision: no fourth new component for one extra niche); cis; sensitivity `medium`; runtime floor 360 s; music `night-pulse / signal-room / neural-drift`.
- **Sources:** none seeded (gap; P10 added the niche without feeds). Use primary papers/advisories, vendor security blogs, incident disclosures, plus the cyber feeds above filtered for AI.
- **Scoring rubric (from seed):** score 1-10 as an AI-security crossover story; prioritise a real technically explicable attack mechanism against a *deployed* AI system (prompt injection, jailbreak technique, model extraction/exfiltration, data poisoning, adversarial input) with demonstrated or credibly reported real-world impact; penalise purely theoretical/academic items with no demonstrated exploit and ordinary infosec stories with "AI" mentioned in passing.
- **Editorial constraint (from seed):** sits between cyberattacks-zerodays and ai-ml-papers; explain the actual technical mechanism of the attack on the AI system (how the prompt/input/training-data manipulation works), not just that an attack occurred; explicitly distinguish a **demonstrated exploit** from a **theoretical vulnerability**; plus relatable contrast.
- **Voice/structure:** hook = a surprising, concrete outcome ("Nobody hacked a server. They just talked to it.") -> the mechanism by analogy to a known class (prompt injection ~ SQL injection, "the query language is plain English") -> the vendor's real mitigation (often operational, not a model patch) -> the unsolved root cause.
- **Gold examples:** Bing "Sydney" prompt injection (5 scenes, interrupt at scene 2 = the SQL-injection analogy, typing_chars 200-240) and Nightshade data poisoning (4 scenes: "less a hack, more a landmine").
- **Risks:** jailbreak *recipes* are operational content - describe the class, never publish a working jailbreak/poisoning recipe; consent angle (Nightshade is an artists' defence - frame neutrally); vendor-claim vs reproduced result; fast-moving mitigations - recheck before audio.

## 3. ai-ml-papers - "what the paper actually changed"

- **Config:** deep-dive; `ai-logic-node` (nodes <=16, no typing); cis; sensitivity unset; music `neural-drift / quiet-orbit / quiet-circuit`.
- **Sources (verified):** arXiv cs.AI `https://export.arxiv.org/rss/cs.AI`, arXiv cs.LG `https://export.arxiv.org/rss/cs.LG` (a firehose - the scorer is the filter). For *news* releases prefer model/system cards and the paper itself over press coverage.
- **Scoring:** no niche rubric seeded - **(derived)** reward a clear mechanism that can be shown as a graph, an independent replication or deployment, a concrete before/after number; penalise incremental benchmark bumps and vendor-only claims.
- **Voice/structure:** hook = what the idea replaced + the outsized consequence ("threw out recurrence entirely, ... behind almost every major AI model since") -> the old way -> the key idea in one sentence -> 3-word-style interrupt ("No recurrence. No convolution. Just attention.") -> the downstream consequence. Node count grows then drops on the interrupt (3 -> 6 -> 12 -> 6 -> 8).
- **Evidence rules (news-explainer standard):** separate benchmark marketing from independent performance; label vendor numbers as vendor claims; state modalities, limits, pricing, availability; explain a benchmark name only when needed; never treat one score as general intelligence; a preprint is not peer-reviewed.
- **Gold examples:** "Attention Is All You Need" and LoRA (5 scenes each, 21-26-word body beats; the examples are *landmark retrospectives*, so for fresh news swap the "since" payoff for a limitation).
- **Risks:** hype adjectives; invented benchmark figures; paper-vs-product confusion.

## 4. infra-failures - engineering and infrastructure post-mortems

- **Config:** deep-dive; `failure-schematic` (<=12 nodes); cis; sensitivity unset; music `data-current / quiet-circuit / signal-room`.
- **Sources (verified):** The New Stack `https://thenewstack.io/feed/`, InfoQ `https://www.infoq.com/feed/`. Best primary source = the operator's own post-mortem/status history.
- **Scoring:** no niche rubric seeded - **(derived)** reward a published root cause, a clear cascade, a human-relatable blast radius; penalise outages with no explanation.
- **Voice/structure:** hook = date + scale + the absurdly small trigger ("An engineer ran a routine command ... It took down half the internet instead") -> what the system does -> the cause chain (nodes 2 -> 5 -> 8) -> "One config. One bug. Half the internet, offline." interrupt (8 w) -> recovery time and cost -> the textbook lesson (single point of failure, shared-infrastructure risk).
- **Evidence rules:** root cause only as the operator's post-mortem states it; keep "estimated" on third-party loss figures; blameless framing - attribute to process/system, **(derived)** do not name an individual engineer.
- **Gold examples:** Fastly CDN outage 8 June 2021 (49 minutes) and AWS S3 us-east-1 February 2017 (~4 h, "estimated $150 million" - verify before reuse).
- **Visuals/thumbnail:** process-flow with numbered steps; thumbnail = the trigger vs the scale in 2-4 words **(derived)**.

## 5. corporate-startup-autopsies - documented failure narratives

- **Config:** deep-dive; `failure-schematic`; cis; sensitivity **high** (individual Gate-1 sign-off; no bulk approve).
- **Sources (verified):** TechCrunch `https://techcrunch.com/feed/`, Crunchbase News `https://news.crunchbase.com/feed/`, CB Insights Research `https://www.cbinsights.com/research/feed/`, SEC EDGAR current 8-K Atom feed `https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&company=&dateb=&owner=include&count=100&output=atom` (broad - all 8-Ks; precision is the scorer's job, RD-25).
- **Scoring rubric (seed):** score 1-10 how compelling and well documented as a corporate-failure narrative; prioritise items backed by verifiable public filings or multiple independent reports; penalise a single unverified source or pure speculation about why the company failed.
- **Editorial constraint (seed):** every causal claim about why the company failed must trace to reporting or filings; **do not speculate about a named founder's character, competence or intent** beyond what sources explicitly report; separate documented fact from narrative framing; plus relatable contrast.
- **Voice/structure:** hook = the money vs the speed of collapse ("raised $1.75 billion ... shut down six months after launch") -> the promise/model -> what investigations or reporting found (attributed: "Reporting and an SEC investigation found...") -> short interrupt ("Great production budget. Wrong moment. Wrong constraints.") -> outcome with dates -> "now taught as..." lesson. Personified narrative flourish is allowed as voice (editor tone note) but never as a causal claim.
- **Distinguish adjudicated from alleged:** the Theranos example cites an SEC complaint and a conviction; the Quibi example states "no fraud allegation, a product/market-fit failure". Always say which kind of failure it is.
- **Gold examples:** Theranos (5 scenes) and Quibi (5 scenes; last beat credits "reporting after its shutdown pointed to the mobile-only restriction ... not any single individual's decision").
- **Risks:** defamation (named individuals, "fraud" wording without a finding), stale legal status (appeals), figures that differ by source. Re-verify legal status immediately before audio.

## 6. scientific-fraud-retractions - evidence of research misconduct, carefully

- **Config:** deep-dive; `claim-evidence-compare` (two-column "claimed" vs "found"; 24 cps); cis; sensitivity **high**.
- **Sources (verified):** Retraction Watch `https://retractionwatch.com/feed/` only. Dropped with reasons (RD-26): PubPeer (no discovery feed, DOI-lookup API only), arXiv (no retraction feed), forbetterscience.com (broken TLS chain). One verified source beats a padded unverified second.
- **Scoring rubric (seed):** score 1-10 how well documented the retraction/investigation is; prioritise a formal retraction notice or institutional investigation; penalise social-media allegations or a single blog's speculation.
- **Editorial constraint (seed):** "fraud" is a serious allegation - report only findings from a formal retraction notice, institutional investigation or established investigative outlet; **never independently allege misconduct beyond what is officially documented**; explicitly distinguish "retracted for fraud/misconduct" from "retracted for honest error".
- **Voice/structure:** hook = long public success vs the finding ("published dozens of striking findings. A 2011 university investigation found many of them never happened.") -> who investigated and what they concluded -> how the report distinguishes fabrication from honest statistical mistake -> short count interrupt ("More than fifty papers were eventually retracted.") -> reform legacy (raw-data sharing). Left column "claimed", right column "found".
- **Gold examples:** Stapel / Tilburg 2011 report (5) and an honest-error vs misconduct explainer (5; contains the meta-leak noted in section 0).
- **Risks:** retraction notices are often vague - say so rather than infer a cause; do not name early-career co-authors who were not found culpable **(derived)**; pending investigations; re-check status before audio.

## 7. tech-myths-debunked - claim, mechanism, verdict

- **Config:** myth-debunking archetype (45 s interrupt); `verdict-card`; cis; sensitivity `low`.
- **Sources:** none seeded (gap: myth topics come from a curated list, reader questions, search/forum prevalence, analytics) - set `source_discovery_method` to `curated_seed_list`/`manual_submission` rather than pretending there is a feed **(derived)**.
- **Scoring rubric (seed):** score 1-10 as a myth-debunk; prioritise claims that are widely believed or repeated, have a genuine explainable mechanism behind the correct answer (not "an expert says otherwise"), and have verifiable citable sources for both prevalence and resolution; penalise obscure or rarely believed claims, purely subjective ones, and ones resolvable only by appeal to authority.
- **Editorial constraint (seed):** state the claim precisely and **fairly** (strongest charitable form its adherents believe - no strawman); the debunk must cite the **causal mechanism**, not authority or bare contradiction; every script ends on an explicit verdict (true / false / partially true) and does not hedge past the evidence; build the case first and land the **verdict word only in the closing sentence** (announcing it up front reads weaker); if sources cannot support a confident verdict, say so. **Fact-check note:** a scene restating the claim is traceable if it accurately reflects a real sourced statement of the claim (it need not be true); full scrutiny goes to the mechanism and the verdict.
- **Voice/structure:** hook restates the folk claim socially ("Your parents believe it, and it's the reason half the internet unplugs at 87 percent") -> origin of the belief (the older true thing, e.g. nickel batteries) -> pivot at the third beat ("But your phone hasn't used that chemistry since roughly 2005") -> mechanism -> verdict word last. Scope the verdict to conditions ("Under Windows' default policy ... but if performance mode is enabled ... partially true").
- **Visuals:** `verdict-card` runs a deterministic keyword scan: the tag stays neutral ("ASSESSMENT") until verdict language appears, so do not use verdict words before the final scene. Split reveal budget - keep the two sentence halves balanced (`reveal_budget_imbalanced`).
- **Gold examples:** overnight phone charging ("false"), USB eject ("partially true").
- **Risks:** health/safety myths raise the stakes (cite regulators/standards); a verdict that is true only under conditions must state them; "since roughly 2005"-type dates need a source.

## 8. tech-retrospectives - "whatever happened to X"

- **Config:** retrospective archetype (60 s interrupt); `timeline-marker` (20 cps, <=9 s/scene); cis; sensitivity unset.
- **Sources:** none seeded (gap). Subjects come from a curated list/anniversaries/analytics; evidence from contemporaneous reporting, filings, shutdown announcements.
- **Scoring rubric (seed):** score 1-10 as a "whatever happened to X" retrospective; prioritise a clear origin moment, a real arc (rise, peak, documented present-day status) and enough verifiable reporting across the whole span to source every beat; penalise subjects with no real change over time or with an unverifiable / still-unfolding present status.
- **Editorial constraint (`RETROSPECTIVE_EDITORIAL_CONSTRAINT`):** one **chronological throughline** from origin to present (never a themed listicle); every major beat anchored to a real date/year/era; each jump motivated by cause and effect, not "and then"; at least one explicit **then-vs-now** beat (what was true at the peak, then the corresponding fact today); the final scene delivers a **real payoff** - a concrete answer to "so what actually happened to it" - never a shrug or a restated last fact; plus relatable contrast (distinct from the then-vs-now beat).
- **Voice/structure:** 7 beats: hook (the surprising end state / the format outliving the product) -> dated beats ("2012:", "2013 to 2014:") -> a pivot beat that names the real cause ("The tech worked. The social contract ... never got written.") -> dated "then vs. now" beat -> last-life beat ("2017 to 2023: Enterprise Edition") -> one-sentence verdict.
- **Gold examples:** Google Glass (7) and Vine (7). Hook flaw: "It shut down this year" (use absolute dates). The Vine causal claim ("never gave creators a way to earn money") is contested - source it before reuse.
- **Risks:** hindsight bias; causal claims stated as fact; dates/figures differ by source; present-day status changes.

## 9. weekly-tech-rundown - multi-segment digest (also used for consumer-tech stories)

- **Config:** weekly-rundown archetype (**20 s** interrupt, `single_hook_only=False`); `chapter-card` (every scene **<=4 s**, 30 cps); cis; sensitivity unset; music `quiet-circuit / data-current / quiet-orbit`. The live channel also used this niche for gadget/consumer-tech single stories (ledger label "gadgets"; niche id 8).
- **Sources:** none seeded (gap). A rundown needs 3-4 items each with its own primary source - source per segment, not per video.
- **Scoring rubric (seed):** score 1-10 how strong the *week's candidate set* is; prioritise weeks with 3-4 independently newsworthy items across different corners of tech; penalise weeks where the strong candidates are near-duplicates of one story.
- **Editorial constraint (seed):** stitch 3-4 short independent items (not a deep-dive); **scene 0 = one cold open that teases all segments in a single pass** (never a per-segment hook up front); a **`chapter-card` scene marks each segment boundary**, narration = short title ("Segment 2: Chip Specs Leak"), placed immediately before that segment's first content scene, carrying no citation-bearing claim and not counted as the segment's hook; the scene right after each chapter-card lands a **fresh segment-specific hook**; keep every scene short and punchy (4 s cap -> several quick beats per segment); the **final scene is a closing tease** (what's next), never a per-segment recap.
- **Voice/structure (gold example, 15 scenes):** cold open 7 w ("Repairable laptops. A mass breach. Cheaper GPUs.") -> [chapter-card 5 w -> hook 8-10 w -> 1-2 beats of 8-9 w -> interrupt 8 w -> context beat] x3 -> closing tease ("Next week: ..."). Words per scene 5-10, duration 1.8-4.0 s, typing_chars 28-90.
- **Risks:** shallow coverage of high-stakes items (a breach in 4 beats must still be sourced and qualified); the 4 s cap tempts dropping caveats - move the caveat into its own beat, not out of the script; segments from one vendor look like a press cycle; no niche feeds, so provenance discipline is entirely manual.

## 10. Side niches (config only - owned by sibling subskills)

- `manga_recap`: deep-dive, `manga-panel-composition`, cis **locked**, `production_mode: manual` (halt-and-export for an NLE), `source_discovery_method: user_provided_document`, `scoring_rubric: null`, voice `expressive_narrative`, sensitivity `low`, no relatable-contrast directive; rights-attested document upload + fair-use gate. -> `../../manga-recap/SUBSKILL.md`.
- `horror_stories`: deep-dive, `atmosphere-narration`, cis **locked**, `scoring_rubric: null` (project founded from a 3-story cluster), voice `slow_atmospheric`, sensitivity `high`, `visual_filter: crt_scanlines`, `background_variety: 4000`, `shorts_cta_style: link_to_full_video`; bans the "have you ever wondered..." pitch hook; content-safety gate (hate speech, real-person targeting, fiction crossing into genuine harm) before clustering. -> `../../horror-story-videos/SUBSKILL.md`.
- CIS mechanics both rely on: `../../../references/creative-illustration-separation.md`.

## 11. Cross-niche comparison and differentiation

| Niche | Evidence unit | What makes it *this* niche, not its neighbour | Typical failure if blurred |
|---|---|---|---|
| cyberattacks-zerodays | advisory / CVE / vendor post | impact + patch status of a *live* threat | becomes exploit tutorial |
| ai-security | demonstrated attack on a deployed AI system | demonstrated-vs-theoretical line | "AI" mentioned in passing = generic infosec |
| ai-ml-papers | the paper / model card | mechanism of a *new idea* | benchmark marketing recap |
| infra-failures | operator post-mortem | cause chain + blast radius | outage gossip |
| corporate-startup-autopsies | filings + multiple reports | documented causes only | founder character assassination |
| scientific-fraud-retractions | formal notice / investigation | misconduct vs honest error | "scandal" for every retraction |
| tech-myths-debunked | mechanism + sourced prevalence | steelman -> mechanism -> verdict last | authority-only "actually false" |
| tech-retrospectives | contemporaneous reporting across a span | one dated throughline + payoff | listicle / nostalgia |
| weekly-tech-rundown | 3-4 independent primary sources | cold open + chapter-cards + closing tease | deep-dive crammed into 4 s beats |

### Hook and thumbnail/title pattern per niche

Hooks are taken from the gold examples; thumbnail/title patterns are **(derived)** - no source specifies per-niche thumbnails (only the channel-wide rule: 2-5 words, the claim not a topic label, mobile-legible, never implying more than the evidence - `../../news-explainer/references/editorial-standards.md`).
`scoring_weights` (tuned emphasis) is **absent for every niche** - none has ever been tuned.

| Niche | Hook pattern (from examples) | Thumbnail / title pattern (derived) | Never imply |
|---|---|---|---|
| cyberattacks-zerodays | consequence + removed barrier ("No password. No exploit kit.") | action/claim words ("RESTART CHROME NOW"); the affected product, not the attacker | that exploitation is proven when only a PoC exists |
| ai-security | "Nobody hacked a server. They just talked to it." | the trick in plain words ("TALKED INTO IT") | that a theoretical flaw was exploited |
| ai-ml-papers | what the idea threw out + its reach | the removed component vs the result ("NO RECURRENCE") | vendor numbers as independent results |
| infra-failures | date + giant blast radius + tiny trigger | scale vs trigger ("ONE CONFIG. HALF THE WEB.") | a named individual as the cause |
| corporate-startup-autopsies | money raised vs speed of collapse | the number and the end ("$1.75B. 6 MONTHS.") | fraud where only failure is documented |
| scientific-fraud-retractions | long success vs the finding | claimed vs found, attribution visible ("INVESTIGATION FOUND") | misconduct from a retraction alone |
| tech-myths-debunked | the folk claim stated as people say it | claim struck/stamped with the verdict word only if the verdict is certain | a verdict the sources do not support |
| tech-retrospectives | the surprising end state | dates ("2012 -> 2015") | a cause the reporting does not state |
| weekly-tech-rundown | three-item tease in one breath | the three nouns | depth the beats cannot carry |

Differentiation test for any pair: *same news item, which niche's rubric scores it highest and why* - if two niches would accept the same stories, their rubrics or evidence units are not different enough (see `define-a-new-niche.md` section 3). Cross-niche dedup applies at ingestion (an item scored in one niche is `cross_niche_duplicate` elsewhere) and at the ledger (`topic-history.json`).
