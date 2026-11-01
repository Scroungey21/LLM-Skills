# Material Trials - research findings (distilled; the research folder is archived)

Contents: 0 provenance · 1 what was adopted / overridden / not built · 2 channel landscape (R5) · 3 editing and retention
(R6, R8) · 4 physics engines and rendering (R2) · 5 LLM + Blender tooling (R1) · 6 objects and materials (R3) ·
7 audio (R4) · 8 pipeline, distribution, policy, money (R7) · 9 conflicts between sources · 10 demo-era engineering
notes · 11 open questions.

## 0. Provenance

- Run 2026-09-24 (Claude Code desktop, Windows 11, RTX 5060 Ti 16 GB, Blender 5.2.1, Python 3.13): seven parallel aspect reports
  (R1 LLM+Blender agents, R2 physics engines, R3 objects/materials, R4 audio, R5 channel landscape quantitative, R6 editing/retention/
  formats, R7 pipeline/distribution/policy; about 660 indexed sources with overlap) plus R8 (frame-level analysis of 19 downloaded
  Shorts, files deleted afterwards, 480p copies, n small), a master synthesis, and local experiments. Method: claim-source binding for
  every claim, a numbers ledger per report, conflicts marked as conflicting and gaps as no-data, no editorialising. The shared web-search
  budget (200 calls) ran out mid-run; Reddit threads were never retrieved.
- Artefacts that existed and are archived with the folder (not in the repo): an interactive `guide.html` built by `build_guide.py` from
  `guide_template.html`; `data/` (yt-dlp catalogs of 46 channels / 8,208 items, `05_scrape.py`, `05_analyze.py`, `08_measure.py`);
  `demos/` (Trial 01 The Press, 02 The Drop, 03 The Blade - the origin of `material-trials/`); `.venv` (now `material-trials/.venv`).
- Dated facts (YouTube policy, prices, versions) are as of 2026-09-24; re-verify before relying on them.

## 1. Adopted / overridden by the user / not built

| Research recommendation | Status |
|---|---|
| Object x obstacle x escalation premise; "vs"; scale; target/test; 4-7 stage ladder; peak at 70-90% | **Adopted** (families are ladders) |
| 20-40 s, 1080x1920, 30 fps, locked camera, stage resets instead of cuts, seamless loop, sound at frame 0 | **Adopted** (30 fps from R8, not R6's 60 fps) |
| Event-synced foley, silence between events, no music, no bed | **Adopted** |
| Headless Blender runner + pinned recipes + bake before render + physics validator before pictures | **Adopted** (`scene.py` modes, `family.sanity`, QC) |
| Novelty machine with a human approval gate; weekly cadence 1.5-2 Shorts/week | **Adopted** as the production memory + novelty rules (stronger than the research's MiniLM dedup) and private-by-default manual upload |
| 8-minute compilation of own clips | **Adopted** (`longform/compile.py`) but without "made by me", outro or branding; length target not enforced |
| Season / league / standings / series branding, "Material Trials" title, episode numbers | **Overridden** by the user 2026-09-26 (not a show) |
| "Handmade, no AI" statements, "made by me", positioning lines in channel text or descriptions | **Overridden** (no statements anywhere viewers see) |
| TRELLIS.2 / TripoSG / Step1X-3D / PartCrafter generated meshes; FLUX/Qwen-Image to 3D; AI textures | **Rejected** (user 2026-09-25: no diffusion/generative anywhere) |
| Stable Audio 3 SFX, HunyuanVideo-Foley, ACE-Step music, any V2A | **Rejected** (same rule; recorded CC0 foley only) |
| Original recurring mascot for recognisability; "???" cold-open teaser of the final stage; "0% vs 100%" comparisons | **Not adopted** (mascot/teaser contradict not-a-show / one-line; a later A/B idea at most; the demo-era Drop and Blade used the teaser, production does not) |
| LLM idea engine (JSON specs from an LLM), MiniLM embedding dedup, pyribs MAP-Elites archive, DOVER/VideoScore/Qwen2.5-VL/Claude VLM scoring | **Not built, and the LLM/VLM parts are forbidden in the pipeline**: the user's rule is that the agent itself is the LLM layer (file hand-off packets the agent reviews), never model-API backends. Novelty = deterministic fingerprints in `season/novelty.py` |
| Uploader (porjo/youtubeuploader JSON, Instagram Graph API), Analytics API loop, GCP/OAuth audit | **Not built.** Upload is manual and private; no analytics exist yet |
| Remotion overlays, ComfyUI backgrounds, dots.tts narration | **Not used**: text/overlay compositing is Pillow in `finish.py`; no narration |
| R8 QA gate (frame-0 motion >= 1, audio onset <= 0.15 s, loop SSIM >= 0.85, last frame luma >= 10, LUFS -14 +-1, TP <= -1, zero cuts @0.30) | **Partly**: loop seam (block-mean), black frames, freeze, loudness (-16), TP are automated; frame-0 motion, onset time and SSIM are human-checked |
| Weekly competitor outlier scrape (`05_scrape.py`) and sequel queue | **Not built** (needs the archived data scripts; a future option) |

## 2. Channel landscape (R5, yt-dlp metadata, 2026-09-24)

- 46 channels scraped, 44 in-niche, 8,208 items (3,158 Shorts, 5,050 videos), 59 channel tabs >= 20 items. Scale: Hydraulic Press Channel
  10.3M subs / 6.59B views; C4D4U 2.38M; MIKAN 3.02M (Algodoo); Kawaken 3DCG 504K; Blendy Craft 344K; Blender Shorts channels that started
  Oct 2024-Jan 2026 reached 73K-504K (BKS, Kawaken, Windie, Blender N Chill, Marble+). For 16 of 24 channels the top Short was uploaded
  2025-2026: the niche still produces winners.
- **Winner-take-most:** median channel's top 10% of Shorts take 71.9% of Shorts views (54.1% for long videos); 11.4% of Shorts reach
  >= 5x channel median, 7.0% >= 10x. Hits: 172M on a 344K channel ("Armor Chain"), 326M on a 1.86M channel ("Big Domino Effect V2").
  Implication: many distinct cheap candidates, spot outliers, iterate.
- **Title-feature lift (within channel, Shorts):** superlative 1.86; compilation/showcase 1.76; relax/calm/sleep 1.59; "X vs everything"
  1.59; domino/chain 1.58; tetris/shape/hole/tube/spiral 1.50; "vs" 1.28; big number 1.22; game/cartoon IP 1.15; "N% vs M%" 1.11; emoji
  0.99; series marker 0.99; hashtag 0.97; bait 0.85; music/MIDI 0.81; softbody words 0.76; **question mark 0.72**; cloth words 0.66;
  "escape" 0.42.
- **Sim-type lift:** object vs object/obstacle 1.57; destruction/fracture 1.54; domino/chain 1.50; particles/sand/mass count 1.25;
  marble race 1.18; marble run 1.11; press/shredder/crush 0.99; vehicle crash 0.97; ball bounce/escape/MIDI 0.96; fluid 0.90;
  softbody/jelly 0.78; cloth/hair 0.64. Technique is the means, not the headline.
- **Sequels:** a proven hit gets sequels (PacMan 3D V3/V5/V6: 208M -> 236M -> 607M; Big Domino 163M -> 326M); numbering alone gives no
  lift (0.99; "Softbody Playground V63" 0.01x). Reality anchors help ("Car vs. Plane" 31M).
- **Ball-escape/MIDI is commoditised:** the originator's median fell from 993,500 to 59,500 views/Short (newest block); generators sell for
  $19/month or free; tutorials hand out 80-90 templates; YouTube's wording targets such output. Do not build on it.
- **Length/cadence:** Shorts median 31 s (p25 20, p75 53); 49.6% <= 30 s; 6.6% > 60 s; top Blender Shorts 14-27 s. Cadence of successful
  Blender channels 0.76-2.27 Shorts/week (BKS 2.27, Kawaken 1.92, Blendy 1.35, Blender N Chill 1.25, Marble+ 0.76); none daily.
- **Shorts vs long:** median Shorts/long views ratio 0.48 over 16 channels (5 of 16 better on Shorts); compilations carry long-form
  ("8 Minutes of Non-Stop Satisfaction" 8.6M; "Most Satisfying Simulations of the Year" 11M; Blender N Chill 464K vs 57.5K). Explainer
  lift 1.47 (long-form only). Likes/view 0.0122 Shorts vs 0.0053 videos.
- IP: 27.5% of in-niche titles use third-party IP at 1.15x lift - trademark/copyright/made-for-kids exposure; avoided.

## 3. Editing, retention, formats (R6 + R8)

- **YouTube's own statements (staff):** ranking is satisfaction-led; for Shorts watch time is weighed less, recency and likes more;
  comments do not affect ranking; new Shorts are tested on a seed audience then grow or taper; do not delete and repost a stalled Short
  (can look like spam); "grabbing people in the first few seconds tends to be important"; length should serve the story. Since
  2025-03-31 a Shorts view counts at first frame/replay (engaged views = the old metric, used for monetisation). Shorts may be up to 3 min
  (square/vertical, uploaded on/after 2024-10-15).
- **Why people watch:** sensory/tactile "just right" completion, predictability (certainty lowers arousal), ASMR (heart rate -3.41 bpm,
  n = 1,002 / 110; lower-pitched complex sounds trigger best; background music inhibited tingles for many), **peak-end rule** (strongest
  rationale for payoff at the end). Zeigarnik cliffhangers failed a 2025 meta-analysis. No peer-reviewed study of physics-sim retention.
- **R8 frame-level measurements (19 clips: 10 top 3D, 5 top other, 4 bottom):**
  - Top 3D Shorts are single locked-off shots: 8/10 zero cuts (ffmpeg scene threshold 0.30), camera pan ~0 in all 10; rhythm = a reset to a
    new stage every ~2-6 s with the variable label changing at each reset; stage lengths ~1.8-2.6 s early, final stage longest (~4-6 s),
    final stage starts ~60-85% of runtime, decisive moment 85-100%.
  - All 13 3D clips (top and bottom) use a 4-7-stage escalation ladder, label from frame 0 (always the current variable value, never a
    sentence), centred ~10-14% from the top. Ladder does not separate top from bottom.
  - Top vs bottom (small n, hypotheses): explicit target/test 7/10 vs 0/3; recognisable subject 6/10 vs 0/3 (5 of 6 third-party IP);
    near-perfect loop SSIM >= 0.70 9/10 vs 1/4 (median top 0.836; best 0.97-0.98); cold-open "???" teaser 2 tops; sound at 0.07-0.09 s
    in six tops (a bottom was silent 0.81 s). Frame-0 motion median 2.33 (top) vs 0.84 (bottom).
  - Audio: event foley, pulse clarity <= 0.16 (music cover 0.705), median silent-frame share 0.32 (Marble+ 68%), ~2 onsets/s; no beds.
  - Loudness: top 3D median -21.5 LUFS (-27.8 to -16.5), other -14.1; LRA median 8.95 LU; **6/15 tops exceed 0 dBTP** (approximate, re-encoded
    copies). Loudness did not track performance; YouTube turns loud content down but does not boost quiet content.
  - Duration top 3D 10.7-28.8 s (median 21.1 s); 6/10 top 3D at <= 30 fps, 4/10 in 4K, 3/4 bottom clips at 60 fps.
  - Composition: seamless single-colour sweep backgrounds, subject centred in the middle ~50%, >= 30% empty background, three-quarter
    top-down angle, metals/stone/cloth/soft bodies.
  - Other segments (ball-escape/arena 35-65 s with rule card + live readout; story/domino 30-62 s with cuts or tracking camera, -9 to -11 LUFS;
    press channels with cuts per object) must not be transplanted onto the static-ladder spec.
- **Packaging (396 titles, 12 channels, correlational):** 26.3% contain "vs"; 12.9% "%"; 19.2% "?"; median title 46.5 chars (p25 33, p75
  70); hashtag-in-title 42.9% with a lower median (29,000 vs 61,500 overall); the biggest channels keep hashtags in the description
  (fixed 9-11-hashtag block + topic tags). Template: object + "vs" + obstacle + number/superlative; avoid "?" and bait.
- **Long-form archetypes:** ~8-minute relax/sleep compilations of own clips (488-521 s; 8 minutes is the manual mid-roll threshold, agent
  knowledge unverified), 20-45 minute numbered seasons (MoreBalls, Jelle), explainers/devlogs (16-42 min). Chapters and a related-video
  link from each Short help the Shorts -> long bridge.
- **Money gates:** YPP 1,000 subs + 10M Shorts views / 90 days or 4,000 long-form hours / 12 months (Shorts-feed hours do not count);
  expanded tier 500 subs + 3 uploads + 3M / 90 days; **from 2027-02-01** monthly Shorts revenue sharing needs >= 10M qualified Shorts views in
  90 days (official page confirms "updates"; a third-party source says 20M / 8,000 h). Creators keep 45% of the Shorts pool share; long-form 55%.
  RPM Shorts ~$0.01-0.20 vs long-form ~$0.83-15+ (vendor figures, wide spread): pair Shorts with long compilations.

## 4. Physics engines and rendering (R2, measured on the target PC)

- Headless works: `blender -b --factory-startup --python ... -- spec` with `bpy.ops.ptcache.bake_all` (rigid, cloth, soft) and
  `bpy.ops.fluid.bake_all`. Measured: 1,000 rigid cubes x 250 frames bake 58 s (233 ms/frame) but `bpy.ops` setup 109 s; cloth 4,225 verts x 120
  frames 16 s; soft body 642 verts 7.7 s; Mantaflow res 64 ~2 s/frame (6.3 MB), res 128 ~8 s/frame (11.5 MB; a 60 s Short ~ 4 h, 21 GB,
  extrapolated). Rendering costs more than simulating: 1080x1920 EEVEE ~1.6 s/frame, Cycles OptiX 128 spp + denoise ~7.5 s/frame, 512 spp
  ~21 s (1,800-frame estimates ~48 min / 3.75 h / 10.7 h). Production uses Cycles OptiX at 24-48 samples because glass/jelly/liquids need
  refraction; EEVEE is the cheap option for opaque rigid scenes.
- Determinism: Bullet/cloth are not reproducible across versions/machines: keep the baked cache.
- Blender 5.2 LTS (2026-07-14, supported to July 2028): experimental node-based XPBD cloth/hair (no self-collision, one contact point per collider,
  CPU, ~12 GB per 60 frames) - not production; classic solvers are the path. 5.0 changed point caches to ZSTD (old caches must be re-baked).
- GPU solvers verified on sm_120 (RTX 5060 Ti): Taichi 1.7.4 (0.475 s for 10M particles x 100 steps) and Warp 1.17 (0.461 s). Taichi's `taichi_elements`
  numbers on a 2080 Ti: 1.5M particles 6 min, 6.8M 40 min; no FLIP, no mesh collisions. Other candidates not tried locally: Newton 1.0 (Apache-2.0,
  Warp-based, MPM granular, VBD, USD I/O), Genesis 1.0, libuipc (GPU IPC, exact-contact squish), SPlisHSPlasH, Chrono. Interchange: PLY/OBJ sequences
  loaded with the Geometry-Nodes Import PLY/OBJ nodes, Sequence Loader (MIT), Mesh Sequence Cache; `splashsurf` (MIT) meshes particles.
- Add-ons (all GPL): FLIP Fluids $79 (CPU-only; dam break 12:44, viscosity 58:05, invisible box 1:53:47 on an i9-13900K; >300 MB/frame; CLI
  bake `bpy.ops.flip_fluid_operators.bake_fluid_simulation_cmd()`), Molecular+ (CPU, spheres only), RBDLab $73 and free Cell Fracture
  (destruction), Simply Cloth, Wiggle 2. **Houdini Apprentice is forbidden on a monetised channel** (non-commercial, 1280x720 watermark); Indie $299/yr
  (revenue <= $100K).
- Scale-out if ever needed: Flamenco (GPL, self-hosted, Windows needs drive letters), RunPod 4090 ~$0.34/h; SheepIt blocks add-ons/scripts.

## 5. LLM <-> Blender tooling (R1)

- The official Blender Lab MCP (26 tools, 6 with `--background` variants, hard 120 s CLI timeout, ships 5.1 docs, runs code "without guards") is a
  **development cockpit** (scene inspection, API search, screenshots), unsuitable for unattended bakes. ahujasid/blender-mcp (29k stars) had a
  maintainer-account compromise window around 2026-08-09/10 and telemetry on by default: avoid in production. djeada/blender-mcp-server is the
  only found with 3600 s headless bakes.
- API drift is the main failure mode of agent-written `bpy` (3DCodeBench: executability 0.702 first try -> 0.974 with error feedback and <= 2
  retries; ~85% of older-model failures were 4.x -> 5.0 drift). Image-only feedback reached 0% full-scene success; engine-state checks before a VLM
  (SimWorlds 0.86 vs 0.71). Hence: JSON spec -> pinned recipe library -> deterministic physics checks -> contact-sheet review. This pipeline
  implements it with plain Python drivers; the agent reviewing the contact sheet is the vision step.
- Blender's own policy: no generative AI in Blender. Blender output is the creator's property (GPL covers code, not renders).

## 6. Objects, materials, licences (R3)

- Licence, not quality, was the binding constraint for generated meshes (TRELLIS.2 MIT but >= 24 GB official; TripoSG MIT; Step1X-3D Apache; Hunyuan3D
  weights exclude EU/UK/South Korea for display of outputs - unusable for a global Short). All rejected for the channel anyway; if the no-generative rule
  were ever changed, a repair chain (trimesh, voxel remesh, CoACD) would be needed before simulation.
- Lowest-risk novelty: **procedural Geometry-Nodes/bmesh generators** (watertight by construction, licence-free). CC0 libraries with APIs: Poly Haven (live
  API use needs a "Powered by Poly Haven" credit), ambientCG, Kenney, Smithsonian Open Access; Objaverse is mixed-licence (filter `cc0`).
- Material recipes (Principled BSDF v2): jelly = transmission 1.0, roughness 0.025, coat 1.0, sheen 0.5, metallic 0.5, Fresnel (IOR 1.5)-driven translucent mix,
  Voronoi normal 0.05 (used in `mt.mat_jelly`); chocolate = SSS; thin-film metal exists. Hooks that recur in the niche: material response uncertain until
  contact, jelly versions of rigid objects, precise predictable synchronised motion with matched sound, comparison ladders.
- Hydraulic-press/ASMR real-world analogues (slime, soap cutting, paint mixing, dominoes) explain the appeal: symmetry, pattern, repetition, material
  behaviour; sound completes the loop.

## 7. Audio (R4)

- Source: Blender exposes no collision events; bake, sample transforms per frame, rising-edge |dv| spikes (49 events from 20 spheres x 180 frames in 0.2 s). MuJoCo
  `mj_contactForce` offers real impulses (not used). Modal synthesis (3-6 decaying partials per material) is enough where synthesis is wanted; the demo-era
  procedural voices are legacy.
- Rejected models: MMAudio (CC-BY-NC weights), ThinkSound, AudioX, AudioLDM2, Tango 2, MusicGen, YuE2 (NC); HunyuanVideo-Foley (territory clause, no output training);
  Stable Audio 3 (commercial < $1M revenue; generative); ACE-Step 1.5 (MIT, generative); Suno/Udio (ToS, no API, instability). All excluded by the no-generative rule.
- Library licences: Sonniss GDC (commercial, no attribution, **no AI training**), Freesound (CC0/CC-BY only, API 60/min 2,000/day; originals need OAuth2),
  BBC RemArc (non-commercial: excluded), Pixabay (commercial but some Content-ID registrations), ZapSplat (credit on free tier). Production uses CC0 packs only.
- **Music economics:** one licensed track on a Short sends half of the allocated revenue to licensing, two send two thirds; YouTube Audio Library tracks are copyright
  safe but "reused content" rules apply to pitch/speed-shifted songs. Original event foley avoids the split.
- Mix evidence: put a limiter before two-pass loudnorm for sparse transients (loudnorm fell back to dynamic mode: -17.62 -> -15.09 LUFS; with a pre-limiter -14.01);
  phones lose energy below ~150-300 Hz, so give low impacts upper harmonics (400 Hz-6 kHz); sound changes perceived crispness ("crisp" is exaggerated on purpose).
  The production chain deliberately has **no pre-compression** (user: dry and crisp) and instead iterates two-pass loudnorm to the target.

## 8. Pipeline, distribution, policy (R7) - reference for a future human or tool upload

- No open-source "faceless Shorts" pipeline does 3D simulation (ShortGPT, MoneyPrinterTurbo are stock-footage assemblers): this one is original.
- **YouTube Data API v3:** `videos.insert` = 1 unit (Video Uploads bucket, 100 calls/day since 2025-12-04 / 2026-06-01); `videos.update` 50, `thumbnails.set` 50,
  `playlistItems.insert` 50, `captions.insert` 400; general pool 10,000/day. **Unverified API projects created after 2020-07-28 are forced to private until an
  API audit passes** (weeks to months); OAuth consent left in "Testing" expires refresh tokens after 7 days (set to Production, privacy URL, domain). `status.publishAt`
  works only when private and never published. Limits: title <= 100 chars, description <= 5,000 bytes, tags <= 500 chars, thumbnails <= 50 MB. No API flag marks a
  Short (<= 3 min, square/vertical => Short). Policies require recorded consent and that the human keep final control of what is published; Authorized Data
  <= 30 days unless refreshed. Tool: `porjo/youtubeuploader` (Apache-2.0, Go, JSON metadata). Local ffmpeg has libx264 and NVENC encoders.
- **Other platforms:** TikTok Content Posting API refuses own-account auto-posters (unaudited = `SELF_ONLY`); Creator Rewards pays only videos >= 1 min; Instagram Reels
  API publishing works (<= 100 posts / 24 h; MOV/MP4 H.264, 23-60 fps, <= 25 Mbps). One 1080x1920 H.264 High file <= 25 Mbps with 48 kHz AAC fits all three.
- **Policy:** "inauthentic content" (renamed from repetitious content 2025-07-15; July 2026 clarification: generic/template, unsatisfying/off-putting formulas, AI personas
  giving advice) names minimal variation, repeated same-outcome scenarios and templated AI content; the spam policy names reusing the same background music and repetitive AI
  imagery. January 2026: YouTube removed 16-17 mass-produced AI channels (~4.7B lifetime views; common trait zero human editorial input; also synthetic narration,
  templated thumbnails, stock loops, inhuman upload pace). Allowed: consistent intros/outros and series with distinct episodes; AI use remains monetisable.
  **Human value here** = distinct phenomenon per video (novelty gate), varied outcomes (story check), per-video audio design, a human approving each upload at a humane cadence.
- **AI disclosure:** required for realistic content that did not happen; clearly unrealistic/animated content is exempt (label in player for photoreal, description for animated).
  Photoreal CGI of real places/events/brands is ambiguous: keep to stylised, non-real scenes; `containsSyntheticMedia` stays false here.
- **Made for kids:** satisfying clips may appeal to children and creators are legally responsible (COPPA): set `selfDeclaredMadeForKids` deliberately.
- **Analytics (when channels exist):** `engagedViews` (old Shorts method), `views` counts replays since 2025-03-31, per-video retention report
  (`elapsedVideoTimeRatio`, `audienceWatchRatio`, `relativeRetentionPerformance`), `creatorContentType=SHORTS`; "viewed vs swiped away" via API unconfirmed.
  Compare only within the channel's own history; the research's proposed loop (nightly pull -> fitness -> bias new ideas) was never built.
- Queue options (if ever needed): Huey (SQLite, Windows OK), Prefect 3; Celery is unsupported on Windows. A file-lock GPU lease was proposed; today the rule is simply
  "one GPU job at a time".

## 9. Conflicts between sources and with production

| Topic | Sources | Production decision |
|---|---|---|
| Cuts | R6 generic "visual change/cut every 2-4 s" vs R8 top 3D Shorts have zero cuts, resets carry rhythm | no cuts; stage reset as the cut |
| Frame rate | R6 "mostly 60 fps" vs R8 8/10 tops <= 30 fps | 30 fps |
| Loudness | R4/R7 -14 LUFS/-1 dBTP vs R8 top median -21.5 LUFS | -16 LUFS +-1, TP target -1 (gate <= -0.5) |
| Audio bed | R6 "bed that crosses the loop seam" vs R8 no bed, 32% silence | no bed; the loop dissolve crossfades the foley |
| Pre-limiter | R4 limiter before loudnorm vs user "dry, crisp" | no pre-compression; iterated loudnorm + ceiling alimiter |
| Question titles | R6 "?" higher median (cross-channel, confounded by size) vs R5 within-channel 0.72 | no question titles (within-channel is the better guide) |
| Shorts length | R6 median 28 s (recent) vs R8 top 3D median 21 s vs R5 median 31 s | 12-60 s gate, typical 12-20 s |
| Label safe zone | one source: top 380 px unsafe; others 120-180 px; tops sit ~190-270 px | line at y 214 px (Short), bottom 390 px / right 140 px kept clear; test on device |
| Positioning | master report: "real physics simulations directed by a human", seasons | user: not a show, no statements |

## 10. Demo-era engineering notes (the archived `demos/`; still true)

- Heavy-load glass: hold Voronoi cells as one kinematic plate, measure the real load each frame, release at one fixed strength (see scenario-families, drop).
- Fractured glass shows cell seams before it breaks: render the intact mesh until contact (now `show_breaking`).
- MPM rendering: one PLY per frame, a Geometry-Nodes `Import PLY` node whose path is set by a `frame_change_pre` handler; points rendered as spheres; no motion blur.
- AgX desaturated saturated materials (blue rubber read pastel): Khronos PBR Neutral.
- The three demos: Press (tournament, camera dollies, kept as the contrast case), Drop (ladder 1 -> 10 -> 100 -> 1,000 -> 5,000 with a load meter), Blade (MPM ladder
  water -> sand -> snow -> jelly). Demo mix chain was limiter -> loudnorm -> ceiling limiter iterated to within 0.4 LU of -14 LUFS, TP <= -1 dBTP.

## 11. Open questions (unresolved in the research)

No retention / swipe data for any clip (A/B the target and the loop on own uploads once they exist); exact label fonts; whether non-generative photoreal CG needs the
synthetic toggle; whether "viewed vs swiped away" is available via the API; Algodoo/BeamNG monetisation terms; no enforcement data on sim channels; the 2027 YPP
numbers beyond "updates"; Genesis/Newton/libuipc untested locally; effect of 60 fps on performance unknown.
