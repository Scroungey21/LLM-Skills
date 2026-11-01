# Ambient channel: distilled research findings and the decisions they produced

Distilled from `ambient-channel/research-output/` (reports 00-14, MASTER-REPORT, `ideas*.csv`; the folder STAYS in the tree: read the
cited report for evidence, do not re-research). Labels as in the reports: VERIFIED (primary source/measured) / STRONG SIGNAL / HYPOTHESIS / SPECULATION.
All reports are dated 2026-10-07/08 (R12-R14 and edits to 2026-10-12). Judgement scores (not measurements) are marked as such.
Several MASTER sections are SUPERSEDED by later reports; the current version is stated first and the replaced one in a clause.

## Contents
1. The decision (channel, series, brand promise)
2. What demand looks like (R01-R03)
3. Scoring system and rankings (R07-R09, R12)
4. Current E1 start set (R12) and what it replaced
5. Experiment E1: design, gates, thresholds
6. Policy and rights (R05)
7. Production feasibility numbers (R00, R04)
8. Uploader and analytics decisions (R06, R10, R11)
9. Open questions (research side)

## 1. The decision
- Owner decision 2026-10-07: the long-form catalog is uploaded to the EXISTING @etcherr871 channel (not a new one). Quizzes are a second long-form line (`quiz-line.md`).
- Umbrella channel (R06 Option C) with one brand promise, **"places that never loop"**: authored named-situation night/background places, a non-repeating engine-driven soundscape,
  honest provenance labelling (what is AI / procedural / recorded), dim-screen defaults, ad-placement restraint. The slogan lives in About text/descriptions/provenance, NOT in titles or thumbnails
  ("no loop" is a retention/policy property, not a discovery hook: 0 unprompted autocomplete suggestions, 1.4 % of >= 8 h titles claim it).
- Three mutually exclusive launch series (each an official exclusive series playlist; a video can be in only one):
  1. **Night Quarters** (sci-fi/vehicle/period interiors for sleep; dim night grade + black-screen variant). 2. **Someone's Here** (presence/next-room domestic; near-black picture; the weakest pillar, a single-concept bet on A17).
  3. **Slow Machines** (screen-on procedural/simulated visuals with physics-driven foley, for focus/TV; least-derisked technically; overlaps the Material Trials channel's "satisfying sim" format: kept separate as 10 h dim/focus ambient on its own engine, no Material Trials code or assets).
- Verdict on the original thesis (partly supported, narrower): background utility dominates 8 h+ demand; a place wins when it EXPLAINS the sound (starship quarters, airplane cabin, night bus, server room), not as decoration; original soundscape is a trust/safety asset, not a demand driver;
  procedural variation is cheap and works but is commercially invisible; visual fidelity is decisive only for TV/second-monitor segments; "beats generic AI ambience" is NOT demonstrated: what predicts floors is template vs series identity, with provenance transparency.

## 2. What demand looks like
- Generic sleep/noise is a fortress: 20/20 results >= 8 h, 19/20 >= 1 M views (median 15.2 M, top 192 M, only 2/20 <= 1 year old); 20 of the 30 most-viewed >= 8 h videos are plain noise/fan/AC/baby/brown-noise uploads (#1 "White Noise Black Screen" 381 M). Demand is not opportunity.
- But small channels capture most recent hits: 57 % of 993 videos >= 100 K uploaded in the last 12 months come from channels < 50 K subs (26 % from < 10 K); hits are rare: 66.6 % of fresh long videos get < 1,000 views, 1.6 % >= 100 K.
- Named situations with series identity and a low cadence have steadier floors than AI-still template farms (farms: ~29-30 uploads/month, 0 of last 60 >= 100 K, median 9,450-13,500 views).
- "10 h is not a view-count multiplier; it is a use-case requirement" (hits run 1-3 h 40 % vs 29 %; 8 h+ 27 % vs 42 %). Study/work intents naturally run 1.9-3.9 h; if Slow Machines is yellow/red, the first follow-up is the runtime ladder (2-3 h vs 10 h) before dropping the series.
- Viewer needs: sparse, low-amplitude, in-world events ARE requested ("beeps" comment 5.5 K likes); startles, ads, loops and thunder are the top complaints. Presence niche: strongest emotion, thinnest vocabulary (30 empty autocomplete seeds); "discoverability of the presence niche is the single most valuable thing to test".
- Packaging facts from R12: "No Ads" appears in 89 of 764 fresh >= 3 h titles and "No AI" in 15; "No AI" is NOT available to us (conflicts with honest-provenance gate C5). Seasonal packaging dominates October (159/764); winter titles carry the year (blizzard 10 h: 1.3 M in 4 months).
- Night-sky OLED 10 h videos, game-music+rain (IP; reference only), "Ambient Renders" template incumbent (rain on a window, "Spend the night in...", 8 h) holds 2 of top 3 in the safehouse and penthouse pools; "Flavas of Chill" route-named night-flight cabins (HUD) compete directly with the airplane-cabin idea.

## 3. Scoring system and rankings
- **Ambient scoring (R07/R09/R12; one system for all 199 rows).** Ten 0-10 factors, weights: Demand .15, Competitive advantage .15, Originality .08, Production simplicity .10, Local-model suitability .08, Quality potential .10, Monetization safety .12, Series potential .08, Thumbnail CTR .07, Viewer utility .07.
  Primary score = weighted sum; robustness = weighted geometric mean (0.5 floor); stability = 3,000 draws of Dirichlet(60w) weights + N(0,1) noise on every score (seed 20261007) -> P(top 20) and rank P10-P90.
  Demand/CA are measured in R12 (pool = on-topic >= 3 h non-music titles; music-, narration- and vocal-led titles dropped by `lib12.MUSIC_LED`; IP-titled/off-topic leaders excluded; "no music" does not count as music-led); other factors are hand-set. Top-20 cutoff 6.530 additive / 6.356 geometric.
  Method C floor: Demand >= 5.
- R09 result: the additive, geometric (rho 0.979), factor-product (0.943) and demand-floor rankings agree on the core; only the top ~8 is stable (P(top 20) N01 .97, A17 .90, A27 .90, B43 .96 ...). Night Quarters SURVIVES (6 members in top 20 under every method),
  Slow Machines SURVIVES (A27/B43 rank 1-4; caveat: A27's simplicity score 4.5 and the physics engine was unbuilt when scored), Someone's Here CONDITIONAL (A17 rank 3; A16/N30/N24 rank 22-98; P(>= 3 members in top 30) = 0.47).
  Judgement scores, correlated errors, no revenue data: read as an experiment shortlist, not a verdict.
- R12 added 14 themes (pass 3). Four reach the top-20 band additively: P3-06 gaslit Victorian study 6.620, P3-14 Mars colony habitat 6.600, P3-01 snowed-in safehouse 6.550, P3-04 gothic castle chamber 6.535; none displaces the top 5 (N01, B43, A17, A27, N03).
  Castle has the strongest momentum (7 non-music on-topic videos >= 300 K in 12 months). On hold: P3-05 longhouse (D 4 without music), P3-09 month editions (D 1), P3-13 deep-sea (thin), P3-02 war field quarters (the niche's hook is explosions, which breaks C4), P3-07 penthouse (incumbent-locked, CA 2.5).
  **Dropped: P3-12 teacher backgrounds (made-for-kids risk, C10).** The Star Wars "No Music" rows in the P3-02 pool were left in (IP-titled, far below the top-3 median, change no score): open question whether to exclude them.

## 4. Current E1 start set (report-12 section 6, valid for a November-February first window; today 2026-11-01)
Slots follow the Latin square W1..W9 (Night Quarters = 1,6,8; Someone's Here = 2,4,9; Slow Machines = 3,5,7).
| Slot | Series | Theme |
|---|---|---|
| 1 | Night Quarters | N01 Starship crew quarters (anchor) |
| 2 | Someone's Here | A17 Roommate in the kitchen |
| 3 | Slow Machines | A27 Marble machine (BUILT as `marble_machine` seed 3) |
| 4 | Someone's Here | Roommate typing in the next room (BUILT as `roommate_typing` seed 11; moved up from the plan's #11) |
| 5 | Slow Machines | B43 Sand and lava-lamp simulation |
| 6 | Night Quarters | P3-04 Gothic castle chamber in a storm (the only rain video) |
| 7 | Slow Machines | A26 Screensaver marathon (original geometry, no Microsoft-style designs) |
| 8 | Night Quarters | P3-01 Snowed-in safehouse (no zombies/violence) |
| 9 | Someone's Here | A16 Radio playing in the next room (carries the AI-music disclosure test) |
Next wave: P3-14 Mars habitat, P3-06 gaslit study, N03 airplane cabin (check the competitor's packaging first). It REPLACED the MASTER section 28 table (slot 6 N03 -> P3-04, slot 8 N02 -> P3-01, slot 4 "rain + reading A17" -> roommate typing)
for reasons of season, current momentum and the rain confound (N02/N03 still outrank P3-04/P3-01). If uploads slip past February, put N03 and N02 back in slots 6 and 8 (the original table applies unchanged).
Selection rule: top 30 under either method; Demand >= 5; Monetization safety >= 7; C9 tier <= 1; in season; fits a pillar; adjacent videos in a series differ in place, palette and sound palette (C1/C2).
Only roommate_typing and marble_machine exist in code; everything else is planned. Series sound palettes (per MASTER §28 C: starship = airlock sigh, bunk creak, thermal tick, vent shift, soft non-speech comm chime; kitchen = kettle, dishes, fridge duty cycle, unintelligible synthetic "walla" murmur; etc.) are documented there. Presence audio uses unintelligible-by-construction "walla", large variant pools with cooldown >= the hour scale, one rain-free presence video to separate presence from the rain confound.
Series bench later (conditional): dark-screen masking companions from a video's own stems (one per series, only after E1; re-cutting an own render as "new" is MEDIUM-HIGH risk); seasonal cozy (clone-saturated).
Runtime: exactly 10:00:00 for the E1 nine (+-1 min); later 10:00 or 11:00 (cap 11:59, never >= 12 h), title states true hours.

## 5. Experiment E1 (R06 section 10; thresholds are HYPOTHESIS, frozen at G0 and never changed mid-experiment)
- 9 videos = 3 series x 3 replicates on one channel, weekly at a fixed slot, constrained Latin square, no series twice in a row. E1 is a go/no-go and diagnosis experiment, NOT a significance test (with 3 videos/series only effects >= 5-8x are detectable; log-views SD ~1.15).
- Held constant: runtime class, resolution/bitrate, audio mastering target, no voiceover, no spoken intro, ad policy, title grammar, thumbnail layout system, description template/length, cards/end screens, chapters policy, language, no external promotion or Shorts/Community posts in the first 28 days (or the same for all), same-series pinned comment, upload day/time. Manipulated: series (between videos); thumbnail archetype (within video via Test & Compare).
- Reads at d3 (after the 48-72 h latency), d7, d14 (T&C done), d28 (primary), d56 (catalogue), d90. ~13 weeks to the last d28, ~22 weeks to the last d90. Reporting API jobs created before upload 1 (history before job creation is limited to 30 days).
- Stage gates: **G0** before any 10 h render (3 concept sheets, 10-min loop-free pilots, thumbnail sets, frozen thresholds, pre-registration); **G1** when videos 1-3 reach d14 (impressions >= 1,000 on >= 1 of 3 and no policy/ad-suitability/claims notice); **G2** when video 6 reaches d28 (not STOP; human reviews scorecard); **G3** when video 9 reaches d28 (GO/ITERATE/STOP).
| Metric (per video unless stated) | RED | YELLOW | GREEN |
|---|---|---|---|
| Impressions days 0-14 | < 1,000 on >= 2 consecutive videos | 1,000-10,000 | >= 10,000 |
| Pooled impressions CTR (>= 5,000 pooled impressions per series) | < 1.5 % | 1.5-3 % | >= 3 % |
| AVD at d28 (min) | < 10 | 10-30 | >= 30 |
| Share of views reaching 60 min | < 5 % | 5-15 % | >= 15 % |
| WH/kI at d28 (series median) | n/a | n/a | >= 2x the weakest series AND >= 2 of 3 videos above the nine-video median |
| Cross-series referral share of RELATED_VIDEO views by d56 (info only) | < 2 % | 2-10 % | >= 10 % |
GO (scale the winning 1-2 series, ~18 more videos): at least one series GREEN on distribution, CTR, AVD and WH/kI with no RED. ITERATE: GREEN on one group, RED/YELLOW on another -> diagnostic tree; cheaper 2-3 h variants; title-only T&C round 2.
STOP/PIVOT: impressions RED on >= 6 of 9 by d28, OR pooled CTR < 1.5 % with >= 20,000 pooled impressions, OR AVD < 10 min on all series -> do not scale renders, escalate to the owner.
Diagnostic tree: low impressions regardless of CTR -> discoverability (audit YT_SEARCH terms, sharpen the promise, check policy flags; do NOT change the thumbnail first); adequate impressions + low CTR -> packaging (T&C round 2); high CTR + low AVD (< 10 min) -> promise/content mismatch (check first-30-min retention); high AVD + low impression growth -> series linkage (referral share, playlist, pinned comment); strong TV share but weak playlist share -> series path unused on TV; one series only -> collapse to it.
Abandonment evidence beyond E1 (any one pauses uploading): the 60-min canary fails processing or never reaches HD; "Continue watching?" forces a click on TV/phone; the repeat probe cannot pass without sounding artificial; per-video distinctness fails; any policy warning/YPP rejection/Content ID claim threshold; (thesis falsifiers) a 2-3-month channel > 1 M views in the presence niche with no vocabulary bridge, "no ai" top-20 saturation (> 10/20 >= 1 M), YouTube enforcing mid-roll uniformly, AI-visual channels with real audio outgrowing hand-built ones.
After E1: collapse to the winning series (C->B) or spin out a series (C->D) only if ALL split triggers hold (>= 12 videos per series, < 20 % overlap of "other channels your audience watches" top-10, < 5 % cross-series RELATED_VIDEO share at d56 for >= 6 videos per series, packaging conflict confirmed, policy divergence).
Pre-flight canaries before E1: R04 E1 30-60 min uploads (GOP 15 vs 150; H.264 vs HEVC); E2 3-4 h unlisted video on TV + phone ("Continue watching?"); E3-type tests (place vs generic title, perceived repetition, dark vs screen-on) as 2 h variants not extra 10 h renders; each new audio family uploaded privately to read Content ID Checks.
Analytics loop: Reporting API bulk reports (`channel_reach_basic_a1` impressions + CTR; `channel_basic_a3` watch time/AVD) + Analytics API v2 retention (`elapsedVideoTimeRatio`, `audienceWatchRatio`; 100 segments -> ~6-minute buckets at 10 h), scope `yt-analytics.readonly` (monetary scope only for YPP channels, else HTTP 403); latency 48-72 h; filter `creatorContentType` VIDEO_ON_DEMAND vs SHORTS; Studio-only items (Test & Compare results, audience overlap) captured weekly; append-only CSV/JSON ledger; Claude weekly analysis. "Views" count from the first frame since 2026-08-24: use engaged views.

## 6. Policy and rights (R05, retrieved 2026-10-07)
- YouTube's repetition test is cross-video and template-based; "substance of each video should be materially varied". The Spam Policy's "automated or synthetic mass-production" (example: same background music + repetitive AI imagery across many videos; consequence monetization suspension or termination) appeared between 2026-04-02 and 2026-10-07. AI is allowed; the trap is "we cannot tell that you made the content".
  "Inauthentic content" = renamed repetitious content; reused-content action can hit the ENTIRE channel.
- Etcherr871 coupling (R12 section 5): its Shorts reuse other creators' clips; a reused-content finding could demonetise the ambient catalog (HYPOTHESIS about application; policy text VERIFIED). Reviewers read main theme/most-viewed/newest/biggest watch-time: the channel may read as two unrelated products. Etcherr871's stated philosophy ("Not a generative-video channel", "Never stock footage") was written for Shorts; whether it contradicts AI-assisted ambient is the OWNER's call to record in `etcherr871/docs/RULES.md` (not editable from here).
  Plan for zero audience spill-over from the meme Shorts. 56 Etcherr871 ledger entries were all `scheduled`, none recorded as published (as of R12); cold-start and spam-review exposure still apply.
- Disclosure: AI-generated music and photoreal "realistic scene that didn't occur" must be disclosed; clearly unrealistic/animated visuals need not be; disclosure "won't limit a video's audience or impact eligibility" (no stated penalty); C2PA metadata can auto-apply a label.
- Rights: Content ID claims usually hit the video; disputes take 30+7 days; ambient/white-noise false claims are documented (one creator's own 10 h white noise: five claims from four entities); never distribute your own track through an aggregator (it makes your own uploads claimable). Only YouTube Audio Library music is known copyright-safe.
- Licence traps (blocked in `LICENSE_REGISTRY`): MusicGen/AudioGen weights CC-BY-NC, FLUX.1-dev/Krea-dev, FLUX.2 [dev]/[klein 9B] non-commercial, Sonniss GDC v2.0 (bans AI use and supplying SFX as SFX), Pixabay standalone bans, Freesound CC-BY-NC, HunyuanVideo (excludes EU/UK/South Korea), LTX-2.x (no provenance removal), Stable Audio Open (registration, $1 M cap, <= 47 s), Depth-Anything-V2 Base/Large CC-BY-NC, SUPIR, `4x-UltraMix`, YuE2. Allowed: FLUX.1-schnell (Apache-2.0), Wan 2.2, SeedVR2, RIFE, FILM, Real-ESRGAN (BSD-3), Depth-Anything-V2-Small (Apache; text check pending). Tool-licence hits G1-G3 are logged warnings only (owner decision 2026-10-07); the owner takes responsibility for the image model licence.
- Sleep/ad traps: "meditation videos may not be suitable for mid-roll"; viewers woken by ads; baby/lullaby framing risks made-for-kids (no personalised ads/comments). Never make sleep-benefit claims.
- Wellness claims and AI "doctor" narrators are a named non-monetisable example; no AI-generated humans/bodies at all.
- Live streaming is out: Content ID interrupts live, >12 h may not be archived, "flood" wording; no 24/7 streams, no multi-channel farm, no daily cadence, no hash-busting variation whose only effect is defeating matching.

## 7. Production feasibility numbers (R00 measured 2026-10-07 on this machine; R04 prototype)
- Hardware: Ryzen 7 5700G, 31.4 GiB RAM, RTX 5060 Ti 16 GB (driver 596.36), ffmpeg N-117612 with NVENC (h264/hevc/av1). S: NVMe 208 MB/s sequential write; H: HDD 106 MB/s with ~17.6 GB free.
- NVENC realtime factors (p5/hq): 1080p30 H.264 11.24x (10 h in ~53 min), HEVC 14.75x, AV1 13.75x; 4K H.264 3.04x. CPU libx264 medium 3.49x. Stream-copy loop of 1 h HEVC 14.7 s; mux with +faststart 85.7 s (10 h extrapolates to ~2.5 + ~14 min).
- Never use for long-form: Remotion (JPEG per frame, 1,080,000 frames, timeouts 1800/600 s, bundled-ffmpeg crash), per-frame Blender for continuous output (EEVEE ~1.6 s/frame = 480 GPU-h per 10 h), a naive Python stdin pipe for a GPU compositor (56-74 fps vs 150-236 via file/named pipe/in-process NVENC), AI video bodies (10 h of AI video ~149 GPU-h on a 4090). Material Trials' `qc.py` loads every frame (179 GB RAM per 10 h) and has freeze/luma rules that reject ambient; HES/technews narration stack is irrelevant here.
- R04 prototype audio engine: 10 h in ~7-8 min on 8 workers (78-85x RT), bit-reproducible across worker counts only after fixing salted `hash(str)` and an O(N x 48,000) convolution. R04 compositor 191-236 fps (parallax) / 120-152 fps (full) was a prototype; the current engine's measured video rates are in `operations.md` section 7.
- Black 1080p30 = 25 kbps (0.11 GB/10 h; audio 1.73 GB dominates); dimming to 35 % luma cuts size 41 %. Non-Premium phones cannot play with the screen off, so DIM (not black) is the sleep-safe default on phones; offer a black variant for OLED.
- Time budget per video on the original plan: keyframes ~15 min + compositor 1.3-2.5 h + audio ~7-8 min + loudness 2-19 min + mux ~15 min + QC ~57 min decode + 20-40 min analysis (~4-5.5 h unattended; INFERENCE). The built engine (Blender plates + real-time-class frame function) is slower than that plan: the roommate video stage is ~9-11 h and marble ~10 h plus ~4 h of Blender tiles (`operations.md` section 7).
- Upload: unmeasured (38 GB would take 16.9/8.4/4.2/1.7/0.8 h at 5/10/20/50/100 Mbps); ours are 4.4 and 17 GiB. Home uplink never measured.

## 8. Uploader and analytics decisions (R10, R11)
- Dual-track uploader: **Track A (do now, no code)** file the YouTube API Services Audit and Quota Extension Form for the AutoClipper GCP project (videos uploaded via `videos.insert` from unverified API projects created after 2020-07-28 are locked PRIVATE, unappealable; no published SLA, "weeks to over a month" is secondary-source); check first whether the consent screen is "Testing" (7-day refresh tokens).
  **Track B (build, small)** new resumable Data API uploader: persisted session URI + byte offset, empty-PUT status query + resume (`Content-Range: bytes */N`), exponential backoff on 500/502/503/504, fresh token per request, `channels.list(mine=true)` immutable channel-ID check, `status={privacyStatus, publishAt, selfDeclaredMadeForKids, containsSyntheticMedia}`, poll `uploadStatus`/`processingStatus`; max 256 GB/12 h; quota 1 insert << 100 calls/day.
  **Track C (launch path until audited)** adapt the HES Studio uploader (Firefox/BiDi): supervised, explicit upload/processing-complete wait before `page.close()`, no tab close or auto-accepted `beforeunload`, ID-based channel check, "Altered content" step, >= 20 GB private rehearsal; de-hardcode channel/profile/slots, remove Shorts logic.
- Do NOT use AutoClipper's `YouTubePublisher` (single un-chunked PUT, `public` hard-coded, restart from byte 0), its SQLite brain, `scheduler.py`, `qa.py` thresholds (60 s / 1080x1920 / <= 1 s freeze reject ambient). Reuse only `youtube_oauth.py` patterns (add `yt-analytics.readonly`, per-channel token files) and the atomic-claim/approval patterns. Implement the immutable channel-ID check BEFORE any upload (a wrong-channel incident already happened).
- BrakesField (optional external plate/keyframe service under `S:\BrakesField`; Wan 2.2 5B measured 80-146 s per 2.04 s clip): only after the compositor pilot, never share its `.brakesfield` store, always pass `parameters.prompt` and `parameters.model_id`; bodies stay procedural. One GPU lease for {llm-tools Qwen (~13.5 GiB), ComfyUI, BrakesField, compositor, NVENC}. In the current Blender-based engine this is unused.
- Build order that was recommended (K): housekeeping (ownership row, `S:/ambient`, disk-free preflight) -> audio engine + long-file QC -> provenance + C9 + policy gates -> compositor + NVENC chunker + 10-min pilot per series -> canary uploads -> uploader (dual track) -> analytics jobs -> G0 pack and E1. What exists today: `S:/ambient`, the audio engine, and a Blender-plate + numpy frame engine with a chunked NVENC renderer (not the planned GPU 2.5D compositor); the ownership row in CLAUDE.md, provenance/gates, uploader, canaries and analytics are not done (see `current-state.md`).

## 9. Open questions (research side; status in `current-state.md`)
Perceived repetition after ~2 h or ~2 weeks of nightly use (test: 2 h loop-of-15-min vs non-repeating, identical title; continue if non-repeating retains >= 10 % more at 90 min); TV vs phone share and whether black screen wins everywhere; whether "no AI/no ads" claims lift CTR; RPM (creator-reported $0.03-$10; measure >= 90 days after monetisation); clone arrival in 2-3 months; YouTube reviewer behaviour on ambient channels; "Continue watching?" inside a single 10 h video; long-GOP/HEVC acceptance; photoreal-AI label effect; whether the sim/frame engine passes the sleep gates once tuned and whether the repeat probe scales to 10 h; Slow Machines audience overlap with Material Trials; whether Someone's Here can field >= 3 distinct concepts; the choice of ONE FLUX.1-schnell home (H: vs S:; cold start 30 s vs 148-205 s).
