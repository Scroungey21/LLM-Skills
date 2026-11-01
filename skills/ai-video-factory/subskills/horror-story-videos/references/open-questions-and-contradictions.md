# Open questions, contradictions and market evidence

Contents: 1 Contradictions found (and how each was resolved) · 2 Market evidence available in the repo (thin, adjacent) · 3 Open questions for the owner · 4 What this subskill does not cover

## 1. Contradictions found

Rule applied: later dated decisions beat earlier ones; **code and tests beat prose**; every conflict is stated, not silently fixed.

| # | Source A says | Source B says | Written as | Why |
|---|---|---|---|---|
| 1 | V8-REQ-5.3: composite `RawItem.content` is "a short summary referencing all three source stories" | `found_horror_project`: `content = "\n\n---\n\n".join(originals' full text)`; scriptwriter prompt relies on the three `---`-separated texts | full texts | code governs; the summary was never implemented |
| 2 | design.md §4.2/§7.1 snippets: `project = _create_project(...)`, `sources[0].story_cluster.theme_label`, `parent.raw_item.source_id` | `_create_project` returns `None`; the codebase uses no SQLModel `Relationship()`, so the code re-queries by `raw_item_id` and fetches the cluster/raw item explicitly | code | design snippets are illustrative, stale |
| 3 | design/spec: background entries carry `clip_path` | code: entries carry `asset_library_id`; `AssetLibraryItem` has no playable path | `asset_library_id` | code; real clip serving was never built |
| 4 | V8-REQ-6.2: `foreground_textbox` progressively reveals narration | toolkit `AtmosphereNarration.tsx` deliberately does **not** render it (duplicate of the global Captions layer); windowing code still exists in `build_json.py` | not rendered; captions do the job | code; the duplicate line was visible once backdrops were not blank |
| 5 | V8-REQ-6.5: `slow_atmospheric` voice delivery | only a seed value; the dots.tts server accepts `delivery` and ignores it | not audible | `voice-tts.md` §2 |
| 6 | `seed_voice_profiles.py`: horror -> `dots-warm-informational` | `voice-tts.md` §3: that voice is a clone of a real identifiable person, consent not obtained | do not reuse | consent/impersonation (R11) |
| 7 | Condensation prompt: CTA sentence "...in the comments and description" | `ensure_shorts_cta` strips that wording and appends `SHORTS_CTA` "...in the description" (same constant as news-explainer) | "...in the description" | code; the "comments" variant is only a legacy strip pattern |
| 8 | Inherited word budget: 225 wpm x 0.9 | horror voice is slow (120-150 wpm starting window) | budget from the accepted pace | otherwise runtimes overrun by 30-50% |
| 9 | `found_horror_project` docstring: individually ingested stories never get their own project | `_ingest_entry` calls `_create_project` for every NEW safety-passed story (only rejected skipped); no horror guard seen | unresolved; likely orphan per-story projects | unverified without running the app |
| 10 | Comment in `pipeline_step.py`: CIS has "15" step rows | the tuple `CIS_STEP_NAMES` has 17 entries | 17 | the tuple is the chain |
| 11 | V8-REQ-6.3: background is blurred **stock** (Tier 0-2) | `agent-principles.md` §2 never-stock rule is Etcherr871-only; report-05 rates shared stock as reuse-prone | recommend original plates; stock allowed only as a licensed exception | not a binding conflict, a judgement call (visuals §4) |
| 12 | design §7.1: duplicate check via `find_duplicate()` | code: direct `dedup_hash` lookup (fuzzy title false-positives at about 68+ char titles) | direct lookup | regression test pins it |
| 13 | design.md names Remotion `4.0.190` | toolkit and verification pin one exact version across all Remotion packages (`4.0.499`) | exact-match mechanism, current pin | version drift once blocked the Player |
| 14 | v8 treats `horror_stories` as scoring-free ("no ranking") | the niche still inherits deep-dive hook/interrupt rules and runtime banding | both: no story ranking, structural hook rules apply | `seed.py` |
| 15 | V8-REQ-9.7 / REQ-8.1: vertical recap is general to CIS niches | only horror ever had a vertical variant; manga fails fast | horror-only in practice | VERIFICATION_REPORT bug 9 |
| 16 | The source document called the safety filter "the third repurposing of fact-check" | RD-119: not a call into `fact_check()` or `fair_use_assessments` | standalone gate, same pattern | shape mismatch (no `script_id` at ingestion) |
| 17 | Task brief wording: "founding stories / canon" | code: "founding" = 3-into-1 project creation; there is no canon concept | canon is an optional NEW layer | nothing in the archive defines canon |

## 2. Market evidence available in the repo (thin, adjacent)

There is **no market study of horror-narration channels** in the repo: no top-channel list, view distributions, retention or title analysis for this format. What exists is adjacent evidence from the ambient-channel research
(`ambient-channel/research-output/`, snapshots of 2026-09/10) and the chat-story study. Use it as a hint for what to research, not as proof.

| Finding | Source | Reading |
|---|---|---|
| Reading and writing ambience is genre-segmented; autocomplete lists `ambience for reading horror`, `ambience for writing horror`, `halloween`, `gothic`, `dark`; reading-by-genre supply is the newest and fastest-filling (18/19 top results <= 1 year old) | report-02 (L22, L59-60, L184-185) | Horror-as-backdrop demand exists but is crowding fast; relevant to the ambient channel more than to narrated stories |
| Liminal/backrooms/dreamcore: `liminal space ambience` median 467K views; `backrooms ambience sleep` median 86K, 12/16 results <= 1 y old; Google Trends x2.4 for `liminal space`/`dreamcore`; ~3M-view 10 h examples (VulpesVulpez 2.96M, Broogli 2.36M) | report-02 (L70, L306, L553), report-03 A05 | Demand growing, supply new; "horror-tinged and franchise-coupled" - using the Backrooms name invites meme/franchise association |
| Reading ambience by genre (fantasy/mystery/horror/romance) ranked 54th in the idea database, composite 5.885 | report-07 | Not a priority idea for the ambient line |
| Horror-game-mascot quizzes (Kanka TV: 11.93M and 7.09M views; Poppy Playtime/Huggy Wuggy style) | report-13a (L128, L146, L324) | Teen/kid-skewed: "treat as risky packaging" for made-for-kids classification (R5) |
| Scary/creepy text-story Shorts exist at scale and at small scale: 10.1M views for a "SCARY STORY PT 1" chat video and 9.6M for a bait-and-switch horror twist, both with explicit alternative explanations (series/channel momentum, title, thumbnail selfie); "Creepy Text Stories" results of widely varying reach (very low reach on small channels is stated in the digest to say nothing about script quality); a "creepy micro-story" format using typewriter captions over AI images beside Subway Surfers | chat-story study `case_digest.json`, `yt_candidates_filtered.tsv`, `yt_selected.tsv`, `logs/yt_triage2/append.py` | The Part-2 cliffhanger, on-screen threat and refute-the-rational-explanation patterns are the only craft evidence; reach figures are single observations (2026-09-24), not causal |
| Owner's brand-safety posture on the ambient channel: not for kids, no sexual or "freaky" themes (2026-10-07, MASTER gate C10) | report-12 | A horror channel would be separate and deliberately adult-leaning |

Gap to close before committing: a proper small-channel study of the format (top long-form horror narration channels: cadence, length, view distribution, thumbnail/title patterns, comment sentiment, how many are original vs
adapted-with-permission). Method template: the ambient reports' small-channel + outlier approach.

## 3. Open questions for the owner (decide, then write into the channel's `docs/RULES.md`)

1. **Story supply:** original-only, commissioned/submitted with a signed licence, permissioned found stories, or public domain only? (Scraping without permission is not recommended.)
2. **Backdrop:** original plates (Blender/illustration/licence-checked local generation) vs licensed library clips? Willingness to disclose generated photoreal places?
3. **Voice:** which licensed or genuinely synthetic voice, and is a processed (reverb/EQ) horror voice acceptable, or must narration stay dry like the other channels?
4. **Caption look:** the decided Montserrat/no-colour spec, or a genre-specific style (typewriter/mono)?
5. **Loudness target:** -16 LUFS / -1.5 dBTP, or -14 LUFS?
6. **Content line:** the adult boundary (self-harm, minors, sexual violence, real events) and whether videos are self-age-restricted; tolerance for limited ads.
7. **Cadence cap and Shorts policy:** uploads per week; one Short per long video (archived v1) or a Part 1/Part 2 series; Shorts first or long-form first?
8. **Engine:** stay file-based with Claude as the LLM layer (recommended) or restore the archived engine/console (then decide per stage: keep API or hand-off)?
9. **Continuity:** standalone stories or a shared universe/series bible (canon layer)?
10. **Fiction label wording** and whether the narrator persona may use first person.
11. **Language/market:** English only (the archive assumed English; localisation was an explicit v1 non-goal).
12. **Rights scope:** are Shorts, clips and compilations covered by every permission obtained?

## 4. What this subskill does not cover

- The omp.sh orchestration implementation (only its method lessons, data-model §7); live-preview/console implementation details beyond what horror needs (data-model §1, visuals §9).
- Manga recap and other CIS niches (separate subskills); the shared CIS design (`V5-REQ-*`) beyond the passes horror uses.
- Verified current YouTube rules for violence, age restriction, self-harm and advertiser suitability: not in the repo; listed as pre-launch verification tasks ([policy-risk-register.md](policy-risk-register.md) §4).
- Real audience, revenue or retention data: none exists for this format in the repo.
