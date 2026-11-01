# Story sourcing, rights and consent

Contents: 1 What the archived design did · 2 The gap: it never modelled permission · 3 Recommended source classes and permission states (NEW) ·
4 Per-source cautions · 5 Why "paraphrase and blend" is not a licence · 6 Attribution and the provenance record (NEW) · 7 Dedup and "never narrate twice" · 8 Fetching without the engine

Labels used in this subskill: **[A]** = archived design/code (cite the spec id), **[N]** = new guidance written for this skill, not in the archive, **[R]** = other repo research
(`ambient-channel/research-output/`, chat-story study). Where a [N] rule is a recommendation, it says so.

## 1. What the archived design did [A]

| Item | Archived behaviour | Source |
|---|---|---|
| Primary source | Curated horror subreddits through each subreddit's own RSS: `https://www.reddit.com/r/nosleep/.rss`, `.../r/LetsNotMeet/.rss`, `.../r/shortscarystories/.rss` (+ operator-added). One `sources` row per subreddit, `fetch_kind="rss"` (default). Zero new fetch code. | V8-REQ-4.2, design §3.1, `seed_sources.py` |
| Secondary source | 4chan `/x/` via the public JSON catalog `https://a.4cdn.org/x/catalog.json`, `fetch_kind="json_catalog"`; only each thread's **OP** (`no`/`sub`/`com`/`time`/`name`) is ingested, replies are not; `com` is HTML and is stripped (`_strip_html`); "Anonymous" author is not surfaced. Explicitly **lower trust** ("essentially unmoderated"). | V8-REQ-4.3, `ingestion/fetch.py::_fetch_4chan_catalog` |
| Per-story attribution | One `story_sources` row per story (strict 1:1 sidecar on `raw_items`): `source_platform` (`reddit`/`4chan`), `subreddit_or_board`, `post_identifier` (Atom `<id>` such as `t3_...`, or the 4chan thread `no`), `author_handle` (nullable), `safety_filter_status`. Written for **every** dedup outcome. | V8-REQ-4.5, RD-115, `ingestion/service.py::_ingest_entry` |
| Full text | For a NEW item the engine fetches the full page text (`extract_full_text`, falling back to the RSS summary); duplicates keep only the feed summary. | `ingestion/service.py` |
| Safety | LLM content-safety gate on every candidate before it can be clustered (see [safety-clustering-founding.md](safety-clustering-founding.md)). | V8-REQ-4.4 |
| Source credit | The three founding stories stay reachable forever through `horror_story_selections` "for the published video's source-credit requirements (base spec REQ-10.1)". | design §4.2, V8-REQ-5.4 |
| Rights tiers for assets | Tier 0 public domain, 1 CC/open, 2 licensed stock with confirmed terms, 3 proprietary (excluded), F fair-use candidate (human-gated memo). Applies to **background assets**, not to story text. | V5-REQ-5.1-5.3 |

## 2. The gap: the archive never modelled permission [A, absence]

`story_sources` has `author_handle` and **no permission, licence or consent field**. The only rights strategy in the specs is "blend 3 stories and paraphrase, never reproduce a
sentence" (V8-REQ-5.5/5.6), plus credit through `horror_story_selections`. That addresses *verbatim copying*, which is a smaller question than whether you may adapt, narrate and
monetise someone else's story. Nothing in the specs says the author consented, and `fair_use_assessments` was explicitly **not** used for text (RD-119: it weighs use of a
specific copyrighted work, a different question). Treat story rights as an unresolved risk of the archived design, not a solved one. A new channel decides this at the start.

## 3. Recommended source classes and permission states (NEW [N])

Default for a monetised channel: **no recorded permission or licence, no publish.** The states below are a recommended state machine to add to the story record
(`story_rights.state`). They are a proposal, not archived design.

| Class | `state` values | Publishable? | What you need on file |
|---|---|---|---|
| Your own original story (written by you or by Claude with you as author) | `original` | Yes | Draft history; AI-use notes (see [policy-risk-register.md](policy-risk-register.md) R6). |
| Commissioned or submitted by an author | `author_submitted` -> `licence_signed` | Yes, once signed | Written licence: scope (narration + video + Shorts), monetisation, adaptation/edit rights, credit text, term, takedown/revocation, author contact. |
| Found online, author contacted | `permission_requested` -> `granted` / `denied` / `no_reply` | Only `granted` | Copy of the request and the grant (message or email, with date and handle); the exact credit the author asked for; the exact scope granted. `no_reply` = `denied`. |
| Public domain | `public_domain` | Yes | Work, author death/publication dates, jurisdiction reasoning. Verify per work; do not assume "old" means public domain, and keep modern translations/adaptations separate. |
| Openly licensed (CC) | `cc_by`, `cc_by_sa`, `cc_nc` ... | CC BY / BY-SA yes with credit (BY-SA: adaptation share-alike obligations, check); **NC never on a monetised channel** | Licence URL snapshot, attribution text, per-story (a site's blanket licence is not enough: check the individual work). |
| Scraped, no contact, no licence | `unpermissioned_public` | **No** for text. May serve as an *idea seed* only (a premise stripped to a one-line situation, rewritten from scratch as an original story by you) | Note that it was seed-only; no expression carried over. |

Rules:
1. `denied`, `no_reply` and `unpermissioned_public` stories cannot reach Gate 1 (script approval) as narrated source text. Enforce it as a file gate, not a habit.
2. Permission must cover **adaptation** (the blend rewrites the story) and **monetised video + Shorts**, not just "narration". Record the scope the author actually granted.
3. Permission does not cure YouTube's reuse/inauthentic-content tests (`ambient-channel` report-05 [YT-01]: "This policy applies even if you have permission from the original creator"). A
   permissioned story still needs real transformation: your narration, your visuals, your structure. Two separate gates: *may we use it* (rights) and *does the channel look original* (policy).
4. The cheapest compliant supply is a **commissioned/submission pipeline** (open call, signed licence) plus original stories. Scraping is the cheap, risky option the archive chose.

## 4. Per-source cautions

- **r/nosleep** [N, verify before relying]: authors keep their rights and the community rules around narration/adaptation have required the author's permission; read the *current* subreddit
  rules/wiki text before any use. Reddit's user agreement grants Reddit a licence, not a third-party video channel.
- **r/LetsNotMeet** [A+N]: the sub is nominally **non-fiction** (real encounters with strangers). The archived safety prompt only screens for identifiable real persons by name/address/employer;
  a real-encounter account has higher privacy, defamation and "true story" risk than invented fiction. If used at all: strip every identifying detail, change locations/occupations, and never present the
  account as verified true.
- **r/shortscarystories** [N]: very short posts; the same permission rule applies. Short length does not make it free to copy.
- **4chan /x/** [A+N]: anonymous by construction, so there is **no author to ask and nothing to credit**; content is frequently recycled creepypasta of unknown origin. Recommendation: do not use
  /x/ text for a monetised channel; at most treat a thread as a prompt for your own original story. The archive kept it as a lower-trust source with only the safety gate in front of it.
- **Reddit access** [R]: direct `reddit.com` page fetches return HTTP 403 for scripts (report-05 §0); RSS worked for the archived ingestion and public archives were used for reading. Do not
  build workarounds that circumvent blocks or rate limits; permission requests go to authors by hand.

## 5. Why "paraphrase and blend" is not a licence [A + open risk]

V8-REQ-5.5/5.6 require one blended narrative, personally framed, in the channel's own voice, with no source sentence verbatim ("even a short exact phrase", scriptwriter prompt). Good as an
anti-copy hygiene rule; but plot, characters, a distinctive twist and sequence of scenes are protected expression even when every sentence is rewritten, and blending three stories in the same
theme reduces but does not remove that. The archive did not obtain permission for the three. Keep the hygiene rule **and** add the permission state of section 3. Fact-check does not help here:
there are no facts to trace, so grounding is only "the blended script contains no scene the three sources lack, and no source sentence" (see [script-and-narration.md](script-and-narration.md) §6).

## 6. Attribution and the provenance record (NEW [N])

Credit is a courtesy and a licence condition where a licence says so; it is **not** a defence (report-05 [YT-12]: "Giving credit to the copyright owner" is not a valid dispute reason).
Per published video keep `story_rights.json` next to the package:

```json
{ "video_slug": "...", "stories": [
  { "story_id": "...", "title": "...", "platform": "reddit|4chan|own|submission|public_domain|cc",
    "author_handle": "u/... or null", "url": "...", "retrieved_at": "ISO date",
    "state": "granted", "scope": ["narration","adaptation","youtube_monetised","shorts"],
    "grant_evidence": "path/to/message.txt", "credit_text": "exact string the author asked for",
    "licence_url": null, "seed_only": false,
    "real_person_check": "none|anonymised|removed", "claimed_true": false } ],
  "blend": { "founding_ids": ["a","b","c"], "no_verbatim_check": "pass", "checked_by": "agent+human", "date": "ISO" } }
```

The description carries the credit text verbatim for every `granted`/CC story (same rule as music credits, `../../../references/audio-captions-music.md` §5). The package must not ship while any
story is not in a publishable state.

## 7. Dedup and "never narrate twice" [A]

- Ingestion dedup is the engine's normal `find_duplicate` (URL hash + fuzzy title; cross-niche). Founding reuses it: fingerprint `horror-blend://<sorted raw_item ids joined by "-">`; the identical
  trio is rejected (`DuplicateHorrorSelectionError`, HTTP 409).
- `horror_story_selections` rows are permanent (never mutated through the API, V8-REQ-5.4). The cluster browser disables any story that already founded a project
  (`already_founded`) even for a *different* trio, so a story is spent once (`api/story_clustering.py`, regression test `test_v8_18`).
- Without the engine: keep a `story_ledger.json` (story id -> project slug -> release date), check it before choosing, and re-read it right before saving (concurrent-write rule,
  `../../../references/qa-gates.md` §2).

## 8. Fetching without the engine

Claude is the LLM layer (`../../../references/agent-principles.md` §1). Sourcing is a file workflow: a small fetch script (RSS via `feedparser`, or manual copy for permissioned stories) writes
`stories/<id>/source.json` (text, platform, handle, url, retrieved_at) and an empty `story_rights.json`; every later stage reads those files. The archived `_fetch_4chan_catalog` and
`_ingest_entry` are the reference implementation if you restore the engine (`data-model-and-archived-implementation.md`).
