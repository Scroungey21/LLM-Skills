# Visuals, animation, rendering, thumbnails (news-explainer)

Sources: old skill `visual-rendering`, playbook section 4/6, `CREATOR_STYLE_GUIDE` (component choice lives in `creator-style-guide.md`), manifests, `renderer/src/types.ts`, `render-cli.mjs`, `thumbnail.py`, channel-identity manifest.

Contents: 1 Principle - 2 Screen design budget - 3 Component limits (manifests) - 4 Evidence imagery - 5 Reaction GIFs - 6 Motion and pacing - 7 Thumbnails - 8 Render contract and build JSON - 9 Channel identity and design tokens - 10 Visual QA

## 1. Principle

Every visual must explain the current sentence, evidence it, establish subject context, or give a brief intentional emotional beat. Decorative motion alone does not count. Choose the strongest *truthful* visual per beat, in this order:
1. licensed/fair-use **source evidence** (product UI, terminal output, chart, document excerpt, repository, advisory, short contextual clip);
2. a purpose-built **mechanism animation** explaining causal relationships;
3. a clean quantitative comparison, timeline, map or annotated diagram;
4. branded typography only when the words themselves are the visual event.
Do not fall back to a monotone deck of generic cards; never leave a generic slide on screen simply because narration continues.

## 2. Screen design budget (playbook)

One thesis per screen; 3-5 meaningful objects; **3-8 word heading; <=55 distinct authored on-screen words**; global kinetic captions carry the narration, so screen templates must not duplicate it as a paragraph. Use progressive disclosure, crops, highlights, arrows, zooms. Typography legible at 1440p. Full 16:9 and vertical 9:16 layouts need **separate layout checks** - never assume a 16:9 crop is safe in 9:16 (keep subjects inside title/caption-safe areas).

## 3. Component limits (from `manifests/<component>.json`; the cue validator and renderer both read them - read the manifest before feeding a component)

| Component (`visual_kind`) | text-heavy | max typing cps | max nodes | scene ms (min-max) | max anim ms |
|---|---|---|---|---|---|
| `chapter-card` | yes | 30 | 0 | 1,200-4,000 | 1,200 |
| `cyber-terminal` | yes | 24 | 0 | 800-12,000 | |
| `failure-schematic` | no | 0 | 12 | 1,000-15,000 | |
| `ai-logic-node` | no | 0 | 16 | 1,000-15,000 | |
| `claim-evidence-compare` | no | 24 | 0 | 800-15,000 | |
| `verdict-card` | yes | 24 | 0 | 800-15,000 | |
| `timeline-marker` | no | 20 | 0 | 1,500-9,000 | |
| `source-citation` | yes | 26 | 0 | 2,500-14,000 | |
| `citation-badge` | yes | 26 | 0 | 2,000-4,500 | |
| `loop-gauge` | no | 0 | 8 | 3,000-15,000 | |
| `asset-sting` | no | 0 | 0 | 750-2,000 | 2,000 |
| `atmosphere-narration`, `manga-panel-composition`, `sponsor-segment` | legacy side-niches / sponsor; not used for news | | | | |

The rule behind the cue validator: narration must be *revealable* - `typing_chars <= max_typing_speed_cps * duration_ms/1000` - so a text-heavy component with long narration needs a longer scene or a different component. Scene timing is also bounded by narration beat limits (3-12 s).
Renderer component names (`ComponentName`): cyber-terminal, failure-schematic, ai-logic-node, claim-evidence-compare, asset-sting, sponsor-segment, manga-panel-composition, chapter-card, timeline-marker, verdict-card, atmosphere-narration, source-citation, loop-gauge, citation-badge. New components must be registered consistently in `types.ts`, `manifests.ts`, `SceneRenderer.tsx`, `CisScreenRenderer.tsx` and (engine) `seed.py` - add additively and narrowly; the renderer is shared with other channels.

### Component correctness rules (LITMUS audit, systemic)
- Comparison/claim components derive badge colour, icon and left/right styling from the **content's semantic role** (data attribute/prop), never column position ("left = accusation") or list position ("last = villain"). Two benign options (Chrome vs Chromium) render neutral and symmetric; a generic adjudication title ("FORENSIC COMPARISON MATRIX") must not appear on a non-adjudicating comparison - use "SIDE-BY-SIDE COMPARISON" or a story-specific title.
- Multi-step flows must be **status-driven, not position-driven**: never auto-badge the last step "CRITICAL". Severity comes from an explicit per-step `status`; a benign final step (full relaunch, monitoring) is neutral.
- Terminal mockups take prompt/command/output from the current story or a neutral default - never a leftover persona/handle (check the component's default prop in source; a default only surfaces on stories that hit it).
- Evidence/source cards carry the real per-story headline and real publication - grep source for hardcoded evidence-card strings on every audit (this recurred).

## 4. Evidence imagery

- Prefer official screenshots, source excerpts, model cards, advisories, product imagery, interface captures, data visualisations relevant to the narration. Keep source/attribution metadata and a fair-use assessment (`fair_use_assessment` model exists in the app) where applicable.
- Use `SourceCitation` for "this source says" beats (domain, headline, short excerpt, exact URL); `CitationBadge` when a running scene must not be interrupted. Route diagram-centred sources to `FailureSchematic`/`AILogicNode` (`creator-style-guide.md`). `ensure_source_evidence_card` (flat local bitmap) is last-resort/connective only, never the default and never the only imagery in a video.
- Never fabricate a screenshot; never let generated imagery look like documentary evidence; crop to the real composition.
- **Known engineering gap:** real-media ingestion (verified download, rights annotation, crop, timed source clip) is not built - productions must say which captures are real vs procedural and must not declare the evidence gate complete otherwise.
- Every Short shows a primary-source citation card at least once (see `qa-release.md` rule 6).

## 5. Reaction GIFs (experiment)

Max **three** per full video; **zero by default**. Only when fear/suspicion/curiosity/surprise is editorially justified and the beat stays respectful; never over tragedy, victim harm or serious security consequences in a way that trivialises them. Prefer original/project-created reactions (uncertain internet licensing). `ensure_suspicion_pulse` produces an original project asset; the reviewed cyber PLC video uses exactly one, the AI and Garmin videos none. Attribute as "Original LITMUS editorial reaction" (or the equivalent current attribution); purge any legacy "reaction GIF" source label / superseded brand name (LITMUS rule 5).

## 6. Motion and ADHD-friendly pacing

Meaningful scene changes, staged reveals, directional flow, progressive highlighting, zoom/crop changes, subtle continuous motion. Keep attention resets frequent enough for clarity but no random pulsing, shaking, shaders or noise. Sync reveals to narration concepts, not timers. Reveal-then-hold at the beat level; information-bearing incremental builds are allowed (`creator-style-guide.md`). `visual_filter` presets exist (`none` default, `crt_scanlines`, `vhs_distortion`, `film_grain`) but only the horror niche defaults to non-`none`; do not use filters on news.

## 7. Thumbnails

- Deliver **1280x720 PNG** (the engine's automated path writes JPG to `/data/thumbnails/render-job-<id>.jpg`; delivered packages use `thumbnail.png`). Keep `thumbnail-background.png` when composited.
- Method (adopted 2026-09-04): a local **ComfyUI** workflow (FLUX.1-schnell-fp8; example `technews/examples/comfyui/thumbnail-subject-workflow.json`, timeout 1800 s) generates photoreal subject art from a `thumbnail_prompt` whose last words are `exact headline TEXT.` (the headline is parsed from that marker; falls back to the title); `_compose_photoreal_thumbnail` composites the dark-grid treatment, small category badge, headline and underline with an accent colour (`_accent_for`). If ComfyUI is unreachable or fails, it **falls back to a frame extracted from the completed render** so a stopped ComfyUI never blocks a production. Subject art is cached by a hash of the visual-direction prompt (editing the prompt changes the key - no stale art). ComfyUI shares the GPU with dots.tts: never run both. `compose_upgrade_thumbnails.py` re-composites exact readable headlines over generated backgrounds (Arial Bold at `C:/Windows/Fonts/arialbd.ttf` or DejaVu Sans Bold) - headline text must be composited, never trusted to the image model.
- Standard: one dominant subject, strong contrast hierarchy, minimal copy, clear emotional/technical premise; copy readable at small mobile size and faithful to source and video. Avoid tiny labels, clutter, false UI, excessive glow, generated gibberish, misleading alarm imagery. Inspect at full resolution **and** ~10-15% scale. Identity direction (motif, flat/glossy, claim text) is an open recommendation: `creator-style-guide.md` section 6.
- Real photo reference of the actual product/story subject styled to the channel's dark-grid language is the intent; never invent a product's appearance.

## 8. Render contract and build JSON

- Remotion composition `MasterSequence`, **30 fps**, delivered **2560x1440 (full)** and **1440x2560 (Short)**, H.264 yuv420p constant-bitrate (`VIDEO_BITRATE=24M`, minrate=maxrate, bufsize 48M, `nal-hrd=cbr:force-cfr=1`) + AAC 192 kb/s 48 kHz stereo, `loudnorm` -14 LUFS / -1.0 dBTP. Frame sequence is rendered with `renderFrames()` (JPEG `element-%0Nd.jpeg`), then FFmpeg muxes with the narration+bed WAV. `--stills=n1,n2` renders lossless PNG stills (used for QA contact sheets/NLE export). `--scale N` for cheap drafts: **render a low-cost draft first and inspect a 5-10 s contact sheet before the final render**.
- `render-cli.mjs <build_json> <frame_dir> [--scale N] [--stills=...]` prints exactly one JSON line (`{"success":true,"frameCount","fps","width","height","framePattern"}` or `{"success":false,"error"}`), exit 0/1, no retry logic (retry belongs to the queue). Needs Node 22.6+ (`--experimental-strip-types`) because it imports `BuildJsonSchema` from `src/types.ts` (the single frozen contract). Run `pnpm install`/`npm install` in `ai-video-factory/toolkit/renderer/` first.
- CIS build JSON (`.strict()`): `{script_id, niche_key, rendering_mode:"cis", variant:"full"|"shorts", aspect_ratio:"16:9"|"9:16", visual_filter, screens:[...], transitions:[...], audio:{wav_path, duration_seconds}, words:[word timestamps]}`; legacy shape is scene-list based. `screens` entries carry the component kind + content props (see production-definition shape in `pipeline-and-architecture.md`). `source_url` must be forwarded to `SourceCitation` (a past bug).
- The queue adds presentation lead-in/tail (currently 0.0 s / 0.5 s), then archives the MP4 + build data; a completed raw MP4 path is preserved so archival can retry without re-rendering. Never discard a good raw MP4 because packaging failed.
- Keep the permanent presentation constants in code only (`PRESENTATION_*`), not per video.
- Package layout and stable filenames: `production-runbook.md`.

## 9. Channel identity and design tokens

- Name **LITMUS** (tagline "Every claim, traced to the source"; avatar = a tilted "litmus strip" bar changing from amber (claim as stated) to green (verified) with a glowing reaction dot, on a plain near-black field; banner wordmark splits LIT/MUS in amber/green). Avatar 800x800 (legible at YouTube's 88 px), banner 2560x1440 (name + tagline inside the 1546x423 mobile-safe area). v1 mark (git-diff glyph in a reticle on the video-screen grid) was rejected as generic/illegible at 88 px. Rendered parametrically with Remotion (`ChannelIdentity.tsx`: compositions `ChannelAvatar`, `ChannelBanner`; `npx remotion still src/index.ts <CompositionId> <out.png> [--props=<json>]`); outputs live in `technews/output/channel-*.png`, `channel-identity-manifest.json`, `channel-description.md` (About copy; channel promises no fixed schedule; links block has placeholders to fill before publish).
- Design tokens (`packages/design-tokens`: `tokens.json`, `build-tailwind.ts`, `dump-json.ts`, `flatten.ts`; npm workspace package `@ytpipeline/design-tokens`) are the single source for colours/type scale/motion easing consumed by renderer and console; the Remotion fonts are in `renderer/src/fonts.ts`; easing `SCRUTINY_EASING` for the one-clean-reveal convention. Tokens are restorable from the git tag (see architecture); the renderer in the toolkit imports them.
- Colour semantic: amber = unverified/claimed, green = verified, accents per niche from `color.niche.*`.

## 10. Visual QA

Extract frames at the hook, every scene transition, one second after transitions, mid-scene, near the CTA, and the ending; contact sheet every 5-10 s across the timeline. Inspect actual pixels for: correct subject and data; readable headlines/captions; safe margins and no clipping; no placeholder/gibberish text; sufficient but non-chaotic motion; image attribution/provenance; vertical layout integrity; template repetition, dead air, tiny type, large unused areas, mismatched visuals; no frozen tail frame; thumbnail accuracy/legibility. Fuller checklist: `qa-release.md`.
