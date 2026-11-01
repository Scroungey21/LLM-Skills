# Etcherr871 source discovery and vetting

Where clips come from, what "verified" means, how to vet, and the registry as of 2026-10-04. The live list is
`etcherr871/sources.json`; **discovery reads ONLY `status: "verified"` entries**, and every candidate additionally passes the
stock-footage filter (`is_stock`, R0). A source that serves stock footage is never verified.

## Platforms (tested 2026-10-04, without accounts)
| Platform | Listing a source | Download | Access / notes |
|---|---|---|---|
| TikTok | creator profile via yt-dlp (views, likes, upload time, duration) | yt-dlp | No account. Hashtag pages are broken in yt-dlp, so discovery is account-based. TikTok gives views + upload time => velocity = views/hour |
| YouTube | channel `/shorts` tab via yt-dlp | yt-dlp | No account. Search returns few Shorts, so find channels by scouting (`research/scout.py "<genre> shorts"`) then vetting |
| Reddit | anonymous Atom feed `https://www.reddit.com/r/a+b/top/.rss?t=day` (config `period` currently `month`) | yt-dlp | No account. Anonymous `.json` endpoints are blocked (403/HTML), `old.reddit.com` redirects to login. Atom allows ~1 request per 45 s and <= 25 entries/feed, so subs are batched (`batch_size`) and the adapter sleeps for `x-ratelimit-reset`. The feed has no vote counts: feed rank + recency stand in for popularity |
| Instagram | gallery-dl | yt-dlp | **Needs login** ("user could not be found" anonymously) |
| X | gallery-dl | yt-dlp | **Needs login** ("authenticated cookies needed") |

Instagram/X sources are recorded `needs_login` until the OWNER opts in by setting `config.json -> cookies_from_browser`
(e.g. `"chrome"`), which reuses the owner's logged-in browser session. The pipeline never does this by default; do not set it
without the owner's say-so.

Social sources must use **no-account tools** (yt-dlp, Reddit Atom feeds), not per-platform API signups (owner preference).
Each adapter's popularity is rescaled to 0-1000 per batch so sources interleave fairly.

## Adapters
`accounts` (verified TikTok/YouTube/IG/X accounts -> recent short posts; `scan` 30, `min_views` 50000) - `reddit` (Atom feeds) -
`ytdlp_search` (**disabled**: `yt-dlp --flat-playlist ytsearchN:<query>`; random uploaders can't be verified, 0/5 usable) -
`watch` (disabled until URLs added; any profile/hashtag/playlist URL yt-dlp supports) - manual `clips.py add <url>` (front of
queue, still stock-filtered). A new source only needs to produce URLs: downloads always go through yt-dlp.

## What "verified" means
The agent reviewed a sample of the source's recent, most-viewed short posts and **>= 3 of 5, or >= 50 % including clips it already
produced in the pipeline, are clips Etcherr871 would post as they are**:
- real moments someone filmed - **never stock footage**, staged ad productions, sponsored promos, product demos;
- no other page's watermark, logo, end card or joke caption (the creator's own context lines are fine);
- safe (R7) and on-vibe (`vibe.json`);
- leaves room for our caption to ADD something (a source whose every clip already carries its own punchline caption fails).

**Rejected** sources keep their notes (why + when); a source that produced good clips earlier but failed a sample gets a
"re-vet next month" note. Prefer **original creators** (people filming their own animals, crafts, skills) over repost pages:
reposters add watermarks and captions.

## Vetting procedure
```powershell
& $py clips.py vet sample -n 5 tiktok:@handle youtube:@handle youtube:UCxxxx reddit:SubName instagram:@h x:@h
#   -> data/vetting/<source>/strip.jpg: one labelled row of 5 frames per sampled clip (+ sample.json)
#   you review each strip against the criteria above, then:
& $py clips.py vet record tiktok:@handle --status verified --accepted 4 --notes "what it posts, what to watch for"
& $py clips.py vet list
& $py clips.py vet snapshot      # rewrites the registry table (the old docs/SOURCES.md; now regenerate it into this file if wanted)
```
Candidates: TikTok - creator lists by genre (web) + @handles seen on clips found elsewhere; YouTube - `research/scout.py`;
Reddit - genre subreddits. One bad source must not abort a batch (the CLI catches per-source errors). `vet record` writes the
status/accepted/notes into `sources.json`.

## Registry snapshot (generated 2026-10-04 from `sources.json`; 49 entries: 11 verified, 38 rejected)

**Verified**
| Platform | Source | Sample | Notes |
|---|---|---|---|
| reddit | r/AnimalsBeingDerps | 4/4 | crab/tea-light, spider POV, seal hugging diver, CCTV cats; real, short, clean |
| reddit | r/AnimalsBeingJerks | 2/4 | misses were > 80 s (length filter drops them); low volume (~5 video posts/month) |
| reddit | r/maybemaybemaybe | 3/4 | clips run long (25-57 s) - prefer short ones |
| reddit | r/nextfuckinglevel | 3/4 | real striking moments; a 151 s miss dropped by length filter |
| reddit | r/oddlysatisfying | 2/4 (4/6 with pipeline) | watch for product-demo promos |
| reddit | r/toptalent | 4/4 | posts link the original creator |
| tiktok | @2bglass | 4/5 | glassblowing studio; own logo only on shirts; 31-58 s |
| tiktok | @glassman.poopoo | 3/5 | Japanese glass artist, reveal payoff; many clips 58-61 s - only <= 60 s pass |
| tiktok | @juniperfoxx | 3/5 | rescue-animal sanctuary; prefer clips < ~35 s, skip 55-60 s emotional montages |
| tiktok | @mmeowmmia | 5/5 | original cat challenge videos, clear payoff, jobs: question_hook / archetype |
| tiktok | @vladik_oladik_2222 | 3/5 | Ukrainian potter (perfect pot, then crushes it); many 57-61 s |

**Rejected (reason pattern - use these as the reject checklist when vetting new sources)**
- Unsafe/off-vibe content: r/AbruptChaos (0/4, crashes, injury, kids), r/BeAmazed (1/4, memorial = tragedy), r/Unexpected (1/4,
  another page's card, staged prank), r/PeopleFuckingDying (joke lives in sub titles, many toddlers), r/interestingasfuck (1/4;
  but it produced 3 good clips earlier - re-vet next month), r/Damnthatsinteresting (2/4; state news-agency watermark, disaster
  rescue; 2/6 overall), r/holdmybeer (2/4; dark accident, news overlay; very low volume).
- Foreign watermarks/end cards/reposts: r/TikTokCringe (TikTok-watermarked), r/ContagiousLaughter (audio-dependent; IG/TikTok
  marks), r/nevertellmetheodds (IG-watermarked, ~7 video posts/mo), tiktok @thewildlifespy (InShot/TikTok editor marks),
  @daddysky3 (another photographer's (c) mark, truck promo), @czn_burak (repost account, promotional).
- Creator's own joke caption on every clip (nothing left for ours): @bandit.thehusky, @tuckerbudzyn (also posts about Tucker's
  cancer - off-limits), youtube TuckerBudzyn, @hammyandolivia + youtube UCItXVkLkMv3RbJesDZW0uYA (staged skits, sponsored post).
- Promo/branded/ads: @hoaaceramics (company logo + end cards), @tonesterpaints (own paint brand marketing), @thatlittlepuff
  (staged studio, sponsored parody ad), @mayapolarbear (text templates, 'Anzeige' paid ad), YouTube TheDodo (branded 100-180 s
  narrated stories).
- Wrong format: @blacktailstudio (60 s narrated tutorials), @bayashi.tiktok (personality cooking show, own title cards),
  r/funny (0/4: long, no payoff, body joke, other page's caption), r/mildlyinteresting (photos, no video), r/specializedtools
  (no videos), r/StoppedWorking (1 video/month), @moondogtribe (vlog/quotes), @goldensummerdog (mixed vlog, low reach),
  @natewinterstudios (no payoff, 10-20K), YouTube mayathesamoyed (tiny, no payoff).
- Handle gone/private/blocked (0/0): @anamakesrugs, @appalachiandonnielaws, @paintturner, @trailcamera.us, @woodturning84.

Lessons: stock-adjacent and branded accounts fail; length (> 60 s) is filtered anyway but wastes fetches; low volume (< ~6
posts/month) is not worth a slot; re-vet "good-then-failed" sources monthly; prune low-yield sources quarterly using the
per-origin acceptance rate (rejected vs staged by `origin`).
