# Simulator fidelity, render and export

Contents: 1 What the simulator is · 2 Skins and canvases · 3 Fidelity limits (what cannot be shown) · 4 Trade-dress and design-source notes · 5 Render geometry and composite · 6 Loudness and encode · 7 Export variants · 8 Visual QA rules

Sources: `chat-stories/simulator/` (`src/chat-simulator/{script-schema,timeline,limits,player}.ts*`, `skins/*/SPEC.md`, `src/render-main.tsx`, `render.html`, `PROVENANCE.md`), `engine/renderer.mjs`, `engine/story.mjs build()`.
`chat_list_apps` output below was read from the live MCP server on 2026-11-01.

## 1. What the simulator is
A local copy of the BrakeTools **Fake Chat Simulator** (Vite + Preact; commit `872257a`, 2026-09-24, copied 2026-09-25; original page kept as `simulator/ORIGINAL-dist-index.html`). Skins, timeline and schema are unchanged, so scripts are interchangeable with the original tool.
Added: `StandaloneApp.tsx` (editor, autosaves to localStorage, "Bundle JSON" import/export = script + embedded assets), and `render.html` + `render-main.tsx` - a chrome-less headless harness exposing `window.chatSim`
(`apps, defaultScript, validate, timelineOf, load, info, seek, showAll, frameRect`) with CSS transitions disabled and keyframe animations pinned to t.
Every frame is `sceneAt(buildTimeline(script), t)` - a pure function - so exported frames are deterministic. A skin is a stateless render at a fixed canvas size (`skins/types.ts`).
Build once: `npm install && npm run build` (creates `simulator/dist`, required by engine + MCP). Frames are screenshots by `playwright-core` driving the **installed Edge or Chrome** (no download; falls back to a cached Playwright Chromium);
identical consecutive settled frames (no typing, scroll done) reuse the previous PNG. `editor_url` serves the editor on a localhost port for manual edits; round-trip via Bundle JSON.

## 2. Skins and canvases (live `chat_list_apps`)
| app | canvases (px @ pixelRatio) | typing indicator | supports | max chars |
|---|---|---|---|---|
| imessage | 393x852 @3 (iPhone 15/16), 430x932 @3 (Pro Max) | yes | theme, smsMode (green), status, reactions | 20,000 |
| whatsapp | 412x915 @3, 360x800 @3 | yes | theme, status, reactions, wallpaper | 65,536 |
| messenger | 393x852 @3, 430x932 @3 | yes | theme, status, reactions | 20,000 |
| discord | 800x600 @2 (desktop DM), 390x844 @3 (mobile) | yes | theme, nitro, reactions, actor colour, handle | 2,000 (4,000 Nitro) |
| snapchat | 393x852 @3, 430x932 @3 | yes | theme, status (no reactions) | 1,000 |
| google-messages | 412x915 @3 (Pixel), 360x800 @3 | yes | theme, smsMode, status, reactions | 8,000 |
| roblox | 800x450 @2, 1280x720 @1.5 | **no** | wallpaper = game screenshot, handle | 200 |
The study sample: iMessage-style 39/48, WhatsApp 3, Snapchat 3, Messenger 2, dating app 1; no Discord. Phone skins are portrait (393 x 852 is ~0.46 aspect): in a 1080x1920 frame the card is scaled to `widthPx` (default 960 = x2.44 of 393) and
height-fit; Discord desktop/Roblox canvases are landscape and suit `frameHeight` overrides or letterboxed use, not full-height cards (untested; try `chat_render_png` first).

## 3. Fidelity limits - what the tool cannot show (gaps against the study's best beats)
- **Renderable**: sent/received bubbles with tails and grouping, date dividers (`timestampLabel`), delivery line (`status`), tapback reactions, image attachments (`imageAssetId`), avatar, header name/subtitle (`contactStatus`), typing dots,
  light/dark, static clock (`statusTime`) and battery, WhatsApp wallpaper, Roblox screenshot.
- **Not renderable (no schema fields)**: group chats; contact renames; incoming-call banners, push notifications, location/Find My pins; polls; voice notes; system rows ("X reacted"); deleted/edited markers; thread switching;
  time-varying status bar (clock/battery are constants for the whole video); stickers/GIF bubbles. These are exactly the "interface as narrator" beats (P1) the study valued most, and demos D1/F1/C1/C2 rely on them.
  Workarounds today: show them as **image attachments** (a screenshot you compose yourself, `imageAssetId`), or as `video.captions`/`overlays` on the composite (breaks the fourth-wall fidelity), or extend the simulator (outside this skill; HES owns the directory).
- **Fonts**: iMessage/Messenger/Snapchat want SF Pro; on Windows the headless browser falls back to Helvetica Neue/Inter. Roboto, Inter, IBM Plex Mono, Anton are bundled (OFL). Discord "gg sans" and Roblox "Builder Sans" are proprietary, so the fallbacks are Noto Sans and Arial.
- **Emoji**: the Windows browser renders colour emoji in bubbles; the Impact caption font cannot (emoji stripped, use image overlays).

## 4. Trade-dress and design-source notes (open risk)
- Each skin has a `SPEC.md` ("single source of truth for skin.css; every CSS declaration cites a section"). The reference screenshots live in the BrakeTools project (`qa-artifacts/chat-refs/<app>/`), **not in this repo**, so measurements cannot be re-verified from here.
- iMessage: chrome (status bar 54 px, nav bar 84 px, home indicator) **measured** from real iOS screenshots; bubble values (17 pt text, 18 pt radius, 75 % max width, `#1982FC`/`#0A84FF`/`#34C759`/`#E9E9EB`/`#26252A`) are iOS 18's long-documented metrics, flagged as documented, not measured; last checklist item "re-verified against a device screenshot" is open.
- Snapchat: **unverified** design language (no usable in-app screenshot could be captured; `#F23C57` sender, `#0EADFF` recipient, uppercase labels with a vertical bar) - re-measure first. WhatsApp: scale 1.575 px/dp from the product render, wallpaper doodle approximated (real artwork is WhatsApp's asset and not reproduced).
  Messenger accent `#0084FF`; Google Messages Material You; Discord dark `#1A1A1E`; Roblox name colours ported from the legacy chat routine.
- **Contradiction / open risk**: AUTOMATION_SPEC's rights ledger proposes "generic chat look, no platform logos/trademarks", while the shipped skins are close copies of Apple/WhatsApp/Meta/Snap/Discord/Roblox UIs. The study shows the whole genre uses such skins and the owner has not
  recorded a trade-dress decision. Treat as an owner-level open item (`current-state.md` section 4), not as cleared.

## 5. Render geometry and composite (defaults)
- Output 1080x1920 @30 fps, H.264 CRF 18 (preset medium, yuv420p, +faststart). Card scale = `widthPx / canvas.width` (960/393 = 2.443). Card top `y` = 150 px (7.8 %); `bottomMarginPx` = 170 px; `fitCss = floor((1920 - y - 170) / scale)`;
  `frameHeight = min(fitCss, canvas.height)` (so the message list shrinks/grows, chrome stays); `cornerRadius` 28 (examples use 36); `x:'center'`.
- Background filter: `scale=1080:1920:force_original_aspect_ratio=increase, crop, setsar=1, fps=30` on a looped, `-ss`-seeked gameplay clip (the clip's own audio is never used); card = per-frame PNG `scale ... format=rgba`, then
  `overlay=...:format=auto:eval=frame`. With `video.effects` zoom/shake the card is re-scaled per frame around an anchor `(x+w/2, y+h*anchorY)` (anchorY 0.78 = near the newest bubbles), shake = `amp*env*sin(2*pi*t*23)` in x and `0.6*amp*env*cos(2*pi*t*17)` in y.
  Then the meme layer (overlays, flash/tint/invert/deepfry/glitch/desat, captions), then `format=yuv420p`.
- **Safe-zone check (open)**: the Shorts UI covers roughly the top 8 % and bottom 20 % (clip-card-shorts standard). The card ends at 1920 - 170 = 1750 px (bottom margin 8.9 %), so the **composer strip and possibly the newest bubble can sit under the Shorts caption/UI zone**.
  Inspect a frame with the real overlay before publishing; raise `bottomMarginPx` (and keep the newest bubble inside 0.10-0.78 of the height) if needed. See [standards-and-qa.md](../../clip-card-shorts/references/standards-and-qa.md).
- Gameplay: `background.clip` ids from `hidden-everyday-systems/examples/gameplay-library.json` (mcparkour1 277 s Minecraft, gta5-1 126 s, gta5-2 355 s, gta5-3 54.5 s - all `self_recorded_official_policy`). Rights policy, rotation and ingest:
  [shorts-and-brainrot.md sections 5-6](../../everyday-systems-explainer/references/shorts-and-brainrot.md). gta5-3 (< 90 s) can show a loop seam. The chosen clip, offset and `rights_basis` are recorded in `build.json.background`.
  Landscape clips are center-cropped; check that the visible action is not hidden by the card (the card covers most of the frame - gameplay is peripheral; the study found Minecraft parkour 37/48, Subway Surfers 11/48).
  Gameplay competition: a slower, low-motion clip reduces distraction (test T6 designed, never run).

## 6. Loudness and encode
`loudnormTwoPass(wav, I=-14, TP=-1.5)`: chain = `acompressor threshold 0.1 (-20 dBFS) ratio 3 attack 5 release 150 makeup 1` -> `volume=gain` -> `alimiter limit=10^((TP-1.0)/20)` (1 dB under the true-peak target, level=false).
Measured with `ebur128`: gain = I - I0; re-measure after the chain; add the remainder once. Why: single-pass `loudnorm` undershot to -16.8 LUFS on gappy dialogue (-14 target); linear `loudnorm` reverts to dynamic when gain breaks the peak ceiling; AAC inter-sample overshoot
measured +1.1 dB. Audio: AAC 192 kb/s, 48 kHz (mono mix; `mix.wav` is PCM24 mono 48 kHz). The Shorts master here is **-14 LUFS**, not the -16 LUFS used by HES/MT ([audio-captions-music.md](../../../references/audio-captions-music.md) section 4; scope the number per channel).

## 7. Export variants
- `background:{type:'transparent'}`: `<slug>.chat-alpha.mov` ProRes 4444 yuva444p10le, PCM audio - the chat card only, for external editing (e.g. a CapCut-style finishing pass). The file is card-sized (`ovW x ovH`, e.g. 960 px wide), not 1080x1920; no gameplay, effects or meme layer are applied.
- `chat_render_png`: one frame at `t` ms or `"all"` (`full:true` for the whole conversation), at the skin's native pixel ratio (e.g. 1179 px wide for iPhone), optional `transparent`, `cornerRadius`, `frameHeight`, `scale`. Use it for thumbnails and review stills.
- `--skip-tts`: silent preview with estimated timing - never publish it.
- Thumbnails: not implemented; a thumbnail must not contain the payoff line (AUTOMATION_SPEC anti-spoiler 3). Compose from `chat_render_png` at a mid-story `t`.

## 8. Visual QA rules
Legibility: text readable at phone size (iPhone card text 17 px x 2.44 = 41 px, adequate); contrast >= 4.5:1 (WCAG AA as proxy); a dark high-contrast card correlates with the stronger member of matched pairs (REPORT section 5, association only). Never put an element (including meme overlays)
over the newest bubble except in the explicit gaps (full-screen covers <= 1.2 s). Check: first frame has a bubble; no bubble is cut at the card edge at the moment it matters; scrolling never jumps up (`check-scroll.mjs`); animated GIF overlays loop cleanly;
flashes <= 3 per second. Open a mid-story and a last frame of every build.
