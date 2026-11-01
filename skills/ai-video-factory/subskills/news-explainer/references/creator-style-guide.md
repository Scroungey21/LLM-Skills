# Creator style guide (voice, hooks, visual mapping, thumbnails, benchmark findings)

Merged from `CREATOR_STYLE_GUIDE.md` (modelled on Kai, Cloud Codes and Veritasium/3Blue1Brown visual lessons) and the keepable decisions of
`CLOUD_CODES_ANALYSIS.md` (a sampled-frame study of 7 @Cloud-Codes videos, 2026-09-06; the per-video research dumps are not preserved).

Contents: 1 Script voice - 2 Visual philosophy - 3 Component mapping and routing - 4 Proposed components (status) - 5 Pacing - 6 Thumbnails - 7 Benchmark findings and recommendation status - 8 Open decisions

## 1. Script voice: casual, engaging visual lessons

### Hook (first 15-20 s): investigative discovery, not a topic announcement
- Never open like a briefing: no "Welcome to this technical deep dive...", "In today's research presentation...", "Let us begin by reviewing...".
- **Baseline (acceptable)**: a high-stakes scenario or provocative question, even if it names the domain ("Imagine your company just got hit by ransomware..."; "What would it actually cost to run a 2.8-trillion parameter model in your own home lab? Let's do the math.").
- **Preferred when the story has it**: withhold the topic for a few sentences behind a *specific concrete artifact, anomaly or number* - a config file, a stray log line, a contradiction between two named sources - and name the subject only once tension exists. Example shape: "There is one rule in this codebase, and almost every other choice bends around it. ... On DeepSeek's own price list, obeying it is worth 120 times that." The benchmark channel did this in all 7 sampled videos (topic named at sentence ~5). Our four sampled baseline hooks named the topic domain in sentence 1.
- Both tiers are real options; reach for the stronger tier whenever a genuine specific anomaly exists. Never fake an anomaly.

### Narrative arc ("visual lesson")
1. Scenario/mystery -> 2. Mechanism/breakdown (plain, punchy, with diagrams) -> 3. Plot twist / technical reality (forensic evidence, hidden catch, architectural flaw) -> 4. Hard numbers + relatable real-world context -> 5. Takeaway (actionable for developers, CISOs, enthusiasts).
The benchmark channel stretches this into 8-12 *named* chapters (mystery -> mechanism -> proof -> verdict); ours is the same shape compressed for ~2-7 minutes - keep it, but make 3-4 chapters visible.

### Sentence rhythm: staccato bursts against long technical sentences
Alternate 3-6 word blunt assertions ("That's the tell.", "Signatures are not security properties.") with 20-35 word explanatory sentences. Measured on our 4 baseline scripts (121 sentences): mean 18.8 words/sentence, only 3.3% at <=6 words; benchmark channel: mean 11.5-15.4, 11.5-19.2% at <=6 words. **Rule (R1, adopted as guidance): at least 2-3 sentences under 6 words per script**, placed right after a reveal or right before a pivot - not evenly spread. A scene where every sentence runs 20-35 words reads as a briefing.

### Direct address and rhetorical questions
Use second person ("you/your", benchmark: 28-74 per video) and 3-8 rhetorical questions as chapter-transition pivots ("So which one do you believe?"). Our narration uses both sparingly - portable at zero structural cost.

### Verbal identity (open decision - not a default)
The benchmark channel ends every video with a fixed tagline ("Build. Solve. Deploy.") and shares pivot phrases. LITMUS deliberately ends each video on a unique story-specific takeaway with no shared sign-off. Keep that unless the owner decides otherwise; if a tagline is ever adopted it goes *after* the per-story takeaway, never replacing it. Do not add one silently.

## 2. Visual philosophy

- **Cardinal rule: visuals must directly reflect what is being said.** No static text boxes, no repeated generic shapes, no random animation, pulsing corner rings, distracting shaders.
- **Reveal-then-hold applies per beat, not per frame (R3 refinement).** Decorative looping motion with no informational payload stays banned. Purposeful incremental builds *are* allowed inside one beat - a bar filling to its real measured value, table rows highlighting in the order the narration mentions them, a counter ticking to a real number - provided the beat resolves once and then holds, and the motion is information-bearing, never decorative or unbounded. Visual state should change every ~6-20 s even inside one spoken idea.
- Both we and the benchmark channel are 100% custom-authored motion graphics on dark backgrounds: no webcam, stock b-roll or raw screen recordings. We deliberately render **no real people's likenesses** (a defensible editorial/legal boundary; the benchmark's real-photo quote cards are noted, not adopted - see `QuoteCard`).
- The gap to the benchmark is *number of distinct graphic devices per video*, not style.

## 3. Component mapping (current renderer components) and routing

| Lesson topic | Component | Visual |
|---|---|---|
| Topic intro, chapter headers, CTA end card | `ChapterCard` | clean title, category badge, short subtitle, no shaders |
| Attack flows, system mechanisms | `FailureSchematic` | horizontal step flow with numbered badges and directional arrows |
| Architecture, threat networks, AI/data relationships | `AILogicNode` | multi-tier topology (ACCESS -> OPERATE/Orchestration -> OUTCOME/Monetization) |
| Fact checks, comparisons | `ClaimEvidenceCompare` | side-by-side matrices (claim vs forensic reality, before/after) |
| Big numbers, costs, surges | `VerdictCard` | bold metric callout, status badge, concise takeaway |
| Timeline of events / staged rollouts | `TimelineMarker` | chronological milestone track |
| Code, headers, terminal commands | `CyberTerminal` | dark analyst terminal with prompt + structured logs |
| Citing a primary source | `SourceCitation` | faux browser chrome: domain, headline, short excerpt, exact URL, from real design tokens |
| Credit a source without interrupting a running scene | `CitationBadge` | small corner card (source, author/outlet, id/date) that fades in/out over the current scene (built, registered `citation-badge`) |
| A process repeated N times | `LoopGauge` | circular dial + iteration counter + tick ring (built, `loop-gauge`) |
| Product/subject sting, evidence media | `AssetSting` | relevant product/advisory/screenshot imagery |

**Routing rule - citation vs diagram:** when the primary source's own reporting centres on a literal diagram, schematic, architecture or attack-chain description, do **not**
use `SourceCitation` for that beat; use `FailureSchematic` (linear flow) or `AILogicNode` (tiered topology) so the beat draws the actual structure. The automated check was
`evidence_media.py::prefers_diagram_visual`; apply the same judgement by hand. The old flat "SOURCE EVIDENCE" bitmap (`ensure_source_evidence_card`) must not be the default
citation path - last resort only, for callers that are not template-driven screens. Never reintroduce a hand-drawn evidence bitmap.

Niche -> component set defaults: cyberattacks -> `cyber-terminal`, infra failures -> `failure-schematic`, AI/ML papers -> `ai-logic-node`; `ai-security` reuses `cyber-terminal`.

## 4. Proposed components (not all built) - build only when a real beat needs one

Direction: **composable primitives, not more monolithic full-scene templates.** The benchmark channel recombines a few small primitives (iteration gauge, colour-coded stage line, scatter field, scale bar, expansion tick-row) per mechanism under one visual grammar (black background, one accent colour, thin connector lines, monospace numeric labels); six sampled compositions in one mechanism explanation reused no diagram shape. A longer-term path is already stubbed (`LlmAuthoredAnimationRuntime`, planned `llm_authored_animation` screens with markup lint + sandbox render + repair loop falling back to the nearest fixed template) - the authoring pipeline never shipped; today it renders a dashed placeholder, so never use it in a real production.

| Component | Use when | Shows | Status |
|---|---|---|---|
| `StatGauge` | one bounded hero metric (CVSS 8.8/10, a %, share) | arc gauge filling to value, numeric inside, label below | validated x1, next to build |
| `BeforeAfterSplit` | one clean state change (patched vs unpatched, price change) | static side-by-side split, one labelled divider, no wipe gimmick | validated, next to build |
| `RedactedDocument` | story centred on a legal filing/regulatory text | paper card, redaction bars, one clean wipe on the quoted line | validated x2, next to build |
| `MetricStrike` | one viral/inflated/wrong number must be overturned | wrong figure printed, struck through as narration corrects, real number beside it | recommended (R5) |
| `DistributionField` | "one case within a large population" | dot field with one dot circled/labelled | validated x2 (R6/R14) |
| `SpecCompareTable` | multi-attribute comparison across 2+ named entities | dense labelled grid, one accent cell per row, no chart | proposed |
| `MapPulse` | real geographic scope/origin | line-art region outline (no map tiles) with pulsing markers + captions | proposed |
| `StageTrack` | multi-stage pipeline/kill chain with one differing sub-range | IN/OUT line of stage markers, sub-range colour-coded | proposed (R12) |
| `UnrollTicks` | "small X becomes large effective Y" | few source markers fanning into a long tick-row from real numbers | proposed (R13) |
| `QuoteCard` | a *person's own statement* | social-post chrome with a **real** photo (never a drawn avatar), handle, date | proposed (R18); conflicts with the no-likeness decision - decide first |
| `SourceCitation` upgrade | the one claim whose point is "go check yourself" | highlighted passage, optional simulated Ctrl+F "0 of 0" badge | proposed (R17); max once per video |

Citation techniques to match to need: (1) corner badge over a running scene for light attribution; (2) full-screen evidence card with highlighted passage, reserved for exactly one claim in a video; (3) person-quote chrome with real photo.

## 5. Pacing and audio sync

Natural, punchy narration beats (code: 3-12 s, target ~26 words; the older guide said 8-12 s); smooth crossfades between cards; word-level WhisperX caption sync; named on-screen chapters even at short runtimes (3-4 `ChapterCard`s over ~3 min).

## 6. Thumbnail identity

Current state (`thumbnail.py`): ComfyUI-generated photoreal subject art on a dark grid, small top-left category badge, 2-4 word bold headline - competent but generic ("could belong to any tech-news channel").
**Decision on record (2026-09-04, user): ComfyUI photoreal subject art is the adopted thumbnail tool.** The following is an **open recommendation (R7, highest leverage/lowest cost), not adopted**:
- one recurring ownable motif (glyph/icon/badge) rendered flat/glossy on solid dark, reused on every thumbnail regardless of topic (the benchmark uses a glossy 3D "product cube" with brand logo);
- prefer flat/glossy graphic design over photoreal scenes (a photo competes with the headline and builds no recognition);
- text = the hook/claim, not a label; 2-5 words, mobile-legible;
- add a strikethrough-claim device and up/down arrows for stories that overturn a claim or show a trend; strict 2-colours-plus-black palette; zero human faces.
Benchmark thumbnails: pure black, massive condensed headline filling 30-40%+ of frame height, one recurring motif. Needs a real `thumbnail.py` template change, not a doc change.

## 7. Benchmark findings and recommendation status (R1-R18)

Structural finding: the benchmark runs 7:50-21:27 (avg ~13:30); ours ~2:00-6:35 (long) - everything else (script depth, devices per video, source count) is downstream of runtime. Portable at zero cost: hooks, rhythm, thumbnails, sourcing, titles.

| R | Recommendation | Status |
|---|---|---|
| R1 | >=2-3 sub-6-word sentences per script | adopted as guidance (`editorial-standards.md`) |
| R2 | decide sign-off tagline | open - owner decision; default = none |
| R3 | refine cardinal rule (incremental builds ok) | adopted (section 2) |
| R4 | build StatGauge, BeforeAfterSplit, RedactedDocument | not built |
| R5, R6 | MetricStrike, DistributionField | not built |
| R7 | thumbnail system redesign (motif, flat/glossy, claim text) | open - not adopted |
| R8 | >=1 independent source, list all | not enforced (pipeline default is 1 source) |
| R9 | description chapter timestamps `00:00 - Label` from ChapterCard bounds | not built (data exists in the render pipeline) |
| R10 | 3-4 visible named chapters per video | guidance |
| R11, R16 | LoopGauge, CitationBadge | built (demo video `ai-agent-denial-of-wallet-loop`) with a `source_url` forwarding fix to `screenToSceneProps` |
| R12-R15, R17, R18 | StageTrack, UnrollTicks, primitives direction, SourceCitation upgrade, QuoteCard | not built |

Titles: benchmark archetypes in `editorial-standards.md`. Sourcing: benchmark descriptions list 5-11 sources and chapter timestamps twice.

## 8. Open decisions (owner's call, never silently decided)

1. Sign-off tagline (R2). 2. Longer "deep dive" variant (8-12 min, lower frequency, highest-signal stories) alongside the daily ~3-minute briefs - product-shape decision with production-cost implications. 3. Thumbnail redesign (R7). 4. Whether to adopt real-photo `QuoteCard` against the no-likeness stance. 5. Finishing the `llm_authored_animation` pipeline vs hand-building primitives.
