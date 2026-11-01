# QA, policy risk and metadata

Contents: 1 QA gates and commands · 2 Policy, safety and consent risks (decisions and open items) · 3 Originality: the inauthentic-content risk · 4 Metadata and credits (method; mostly unbuilt) · 5 Release path

Sources: `chat-stories/engine/check-*.{py,mjs}`, `measure_bed.py`, `voices/{score_build,reverb}.py`, `research-output/chat-story-study/{AUTOMATION_SPEC.md section 5, data/platform_metrics.md, data/funny_research.md section 5}`, `README.md`.
General principles: gates fail closed and are measured on the **final artifact** (encoded MP4, decoded audio), objective checks never replace a human listen/view ([qa-gates.md](../../../references/qa-gates.md) section 1). Nothing here has been listened to by an agent.

## 1. QA gates and commands (run from `hidden-everyday-systems/chat-stories/`; `<out>` = the build folder)
| Gate | Command | Threshold / meaning |
|---|---|---|
| Spoken = bubble | `node engine/check-spoken.mjs <story.json>` | exit 1 when spoken text has more pause marks than the bubble |
| Pauses vs punctuation | `python engine/check-pauses.py <out> [--all] [--min 150]` | pause = >= 150 ms below (line peak - 30 dB) between first and last speech frame; "EXTRA" when pauses > visible break marks (`. ! ? , ; :`, ellipsis, spaced dash); exit 1 if any |
| Word-level breaks | `python engine/check-word-gaps.py <out> [--all]` (or `--wav f --text "..."`) | faster-whisper word times; flags a break with no punctuation when gap >= 110 ms, or gap >= 60 ms and the previous word is stretched >= 1.6x |
| Audio/video sync | `python engine/check-sync.py <out>` | voice onset minus bubble frame >= 0 for every line ("voice BEFORE bubble: none"); outliers > 120 ms from the median listed; MP4 audio vs `mix.wav` lag by cross-correlation (first 20 s) |
| Scroll regression | `node engine/check-scroll.mjs <out>/timed-script.json [fps]` | no upward scroll jump > 6 px |
| Meme edit density | `python engine/check-edit.py <out> <story.json>` | next voice >= stinger start + 250 ms; prints duration, speech seconds, non-speech %, SFX per minute (target 10-16/min, non-speech 25-40 %) |
| Bed level | `python engine/measure_bed.py <out>` | speech dB, bed in gaps and under speech, relative to speech |
| Voice dryness | `python voices/score_build.py <out>/build.json` | per-voice echo tail from the real build (dry <= about -18 dB; the owner rejected roomy) |
| Takes | `build.json`: `cadenceFailures` (empty), per-take `wer` <= 0.15, `unexplainedPause`, `liveliness` | listen to flagged lines; fix by punctuation/wording, never stretch |
| Loudness | `ffmpeg ... ebur128` on the MP4 | -14 LUFS integrated, true peak <= -1.5 dBTP (measured chain, `simulator-and-render.md` section 6) |
Add (not automated, from AUTOMATION_SPEC section 5): ASR back-check per line WER <= 0.15; per-line LUFS spread <= 3 LU; words/s sanity 1.2-5.0; min cap-height and contrast >= 4.5:1; Shorts safe-area overlap; muted comprehension (every voiced plot line also visible);
anti-spoiler frames (render `reveal - 1 frame`); gameplay-competition energy; `rights` complete. Prove a new gate is live by breaking one input on purpose.
Manual review of every build: open the first frame, a mid frame at a reveal and the last frame; check the newest bubble is not under the Shorts UI zone (`simulator-and-render.md` section 5); **listen** to the opening, each reveal, every shortcut/typo line, the ending, with the music cut points.

## 2. Policy, safety and consent risks
Decisions recorded (owner) and open items. Do not argue the owner's decisions; keep the open items visible to the owner.
- **Audience 18+ (owner, 2026-10-03)**: raunchy/profane/outrageous comedy is wanted; the owner takes platform consequences. YouTube: humorous sexual jokes/innuendo are ad-eligible, but sexual acts "even if blurred or implied" are not; strong profanity in a **title or thumbnail** removes ads;
  the two page fetches disagreed on stricter tiers - re-read the live page before publishing (platform_metrics/funny_research). Age restriction and limited ads are possible. TikTok allows sexual language in non-sexual humour, but sexualised framing is not For-You-eligible.
  Practical: set **"made for kids" = No**; use the age-restriction setting per the owner; keep the f5 ("freaky text to mom") and f6 ("dirty talk") premises at innuendo level and keep profanity out of titles/thumbnails.
- **Hard limits (owner)**: nothing involving minors, no non-consent, no slurs against protected groups, no real people, no working scam steps. **Open flags for the owner (not ruled here):**
  (a) the recorded rule is "nothing involving minors" (README 18+ comedy bullet; generator docstring) and `s4-back-door` is a babysitter thriller centred on a child - owner to confirm whether s4 is covered; (b) the meme layer uses **real-person images** (IShowSpeed, Dwayne Johnson; some AI-edited faces) although the story rule says no real people - the owner
  explicitly allowed meme images anywhere (2026-10-04) and accepts the risk, which is a likeness/claim exposure; (c) one study source used a minor as a shock reveal (flagged and excluded as a model); (d) any derivative of the source that touched possible self-harm needs safe-messaging care; (e) never mock disability, accents, second-language spelling.
- **AI-voice disclosure**: all voices are synthetic. YouTube's "altered or synthetic content" toggle covers *realistic* content; the study judged a non-photorealistic chat-story animation outside it but noted a description label is permitted and repeated non-disclosure of realistic content can cost YPP.
  Whether a realistic synthetic voice for fictional characters requires the toggle is **unsettled in the repo**; a plain description line ("fictional story; voices are AI-generated") is cheap. TikTok requires labelling realistic AIGC (and reads C2PA metadata); Meta shows an "AI info" label. Decide with the owner and record it.
- **Voice model licence**: OmniVoice is CC-BY-NC per the owner's own note; the default backend may not be monetisable (`voices.md` section 6). Highest-priority licence question for a monetised channel.
- **Gameplay**: YouTube's game-footage page makes monetisation depend on the publisher licence and says simply showing gameplay may not be accepted; no Shorts-specific statement was found. Our basis is own capture under Mojang's usage guidelines and Rockstar's posting policy,
  both requiring unique value (the story is it). Re-verify those policies before relying on them ([shorts-and-brainrot.md section 5](../../everyday-systems-explainer/references/shorts-and-brainrot.md)).
- **Trade dress**: skins closely imitate Apple/WhatsApp/Meta/Snap/Discord/Roblox UIs (`simulator-and-render.md` section 4). The genre universally does; no clearance exists.
- **Third-party meme assets**: Content ID/DMCA/trademark claims are accepted by the owner; keep per-file sources so a claimed asset can be swapped and the video re-rendered.
- **Platform copying rules**: Instagram (2026-04-30) says aggregators and "simply adding a border, watermark, captions" do not make content original; TikTok marks unoriginal content ineligible for the For You feed. Chat stories are original scripts, which is the defence; reposting study cases is not allowed.
- **Study data**: third-party media in `cases/` is local analysis material only; no redistribution.

## 3. Originality: the inauthentic-content risk
YouTube renamed "repetitious content" to **inauthentic content** on 2025-07-15: mass-produced or repetitive content is not monetisable; examples include "image slideshows, templated storylines, or scrolling text with minimal or no narrative", "AI-generated content made with generic or unoriginal templates", and characters in repetitive situations
following a "highly similar storyline template". Allowed: series with set characters where each episode has a **distinct storyline, focus or concept**. Chat stories on gameplay with TTS are the textbook risk. The repo's own f-series is generated from one Python template with a fixed beat vocabulary (`make_funny_stories.py`).
Mitigations (method, not evasion): write each story by hand around a genuinely new mechanism; vary skins, genres, structures and endings; keep a premise ledger; human script review and approval before voicing; the story itself must carry the narrative. Do not mass-produce; three distinct stories a week beat ten templated ones.

## 4. Metadata and credits (what exists, and the method to apply)
**Built**: `description.txt` = `title or chat.name`, blank line, `logline`, blank line, and (if a music track is used) `Music:` + attribution + source URL. Nothing else: no title generation, tags, thumbnail, chapters, hashtags, upload manifest.
**Method (unbuilt; apply by hand, then consider automating):**
1. Title: the hook as a concrete stake, <= 100 chars, avoid ` | `; no strong profanity; the title/thumbnail must not contain the payoff line. Caldruki register uses an emoji suffix (skull, crying face, wilted rose, folded hands). Titles/thumbnails are untested here.
2. Description: logline (spoiler-free), "fictional story; characters and voices are AI-generated", credits block, `#Shorts` + hashtags. Credits **must be complete** (section below), because the engine writes only the music credit.
3. Credits block (compose from `build.json`): music (verbatim attribution + URL) when used; "Animated emoji: Google Noto Emoji (CC BY 4.0)" if any `emoji-*` overlay is used; Bluezone vine boom note if used; meme sources are third-party - list or drop per the owner's risk call. Gameplay: "gameplay footage recorded by the channel".
4. Settings (owner at upload): made for kids = No; age restriction per the 18+ decision; altered-content toggle per section 2; category; language.
5. Thumbnail: Shorts auto-frame is fine; if custom, a `chat_render_png` still at a mid-story `t` without the payoff, high contrast (dark card).
6. Series: set characters across episodes are allowed only with a distinct storyline per episode; a "Part 2" CTA must be planted and paid (study P3).
7. Keep a per-video record: slug, story sha256, voice seeds, gameplay clip + offset + `rights_basis`, assets used, credits text, publish decision (the `rights.json` proposal).

## 5. Release path
No chat-story release calendar, ledger, uploader or scheduler exists; the engine uploads nothing and the study separated research from publication on purpose. The 12 builds in `hidden-everyday-systems/output/chat-stories/` are drafts; whether any was published is not recorded in the repo (ask the owner).
To release: use the sibling channels' release calendar pattern and ledger ([release-calendar.md](../../../references/release-calendar.md); HES-shaped folders as in clip-card-shorts) after the owner approves the script and final render **by hash** (AUTOMATION_SPEC approvals are proposed, not built).
Never upload, schedule live, or delete without explicit authorisation ([agent-principles.md](../../../references/agent-principles.md) section 5).
