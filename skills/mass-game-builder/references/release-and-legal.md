# Release and legal: ownership, credits, store rules

Read this before the first public build, when the user mentions selling, streaming or open sourcing, and whenever a licence, credits or terms screen is edited.
This is not legal advice. It lists what to ask, what to check and what to record.

## Contents
1. Ask the owner
2. Credits: two places
3. Terms and licence screen
4. Streaming and videos
5. Assets and fonts
6. Generated content and stores
7. Privacy and ratings
8. Trademarks and names
9. Release checklist

## 1. Ask the owner
At intake (and again before release) ask, and record in `GAME_VISION.md` and `DECISIONS.md`:
- Who owns the game, and under what name should credits and terms say so? (Use the exact name the user gives; correct it immediately when they correct it.)
- The licence stance: all rights reserved and sold; free but proprietary; open source (which licence). It decides what terms the game shows.
- Where it is sold or published (a store page, a website). The store's rules apply.
- The streaming and video policy (encouraged, allowed, restricted, rewards for promoters).
- Budget and paid tools allowed. The skill assumes nothing.

## 2. Credits: two places
Every third-party asset, font, library, music track and sound appears:
1. **In the game's credits screen** (reachable from the main menu), grouped by kind (sound, music, textures, models, fonts, software).
2. **In the store/README text** that ships with the release (for example `release/README.md`), which can double as the store page description.
Source of truth: `CREDITS.md` (asset, author, URL, licence, date read, path). Generate both outputs from it so they cannot drift, and check that every file under the asset folders has a row.
Licences that require attribution are honoured exactly; public-domain dedications are still credited when the user wants to be generous.

## 3. Terms and licence screen
A "licence" screen copied from an asset pack is usually wrong for the game. Write it from the owner's answers:
- What the player may do (play it; stream and record it if allowed) and may not (modify, redistribute, extract assets) in plain words.
- An as-is warranty line, appropriate to the stance.
- Third-party notices that their licences require (for example the licence texts of bundled libraries) in the credits.
Have the user read and approve the text. A wrong statement about ownership is worse than a short one.

## 4. Streaming and videos
If streamers are welcome, make sure nothing blocks them: music and sound sources whose licences permit monetised streams, no claim-prone tracks, and no terms text that forbids recording. If the user wants a promoter rewards system later, log it as an idea.

## 5. Assets and fonts
- Re-read the licence on each asset's page at release; a page can change.
- Fonts: check the licence allows embedding in a commercial game; ship the notice.
- Some packs forbid redistribution of the raw pack: ship assets inside the game only, never as a bundle.
- Keep `_incoming/` and original archives out of the repository and the build.
- Keep the licence texts you downloaded with your records.

## 6. Generated content and stores
Some stores require disclosure of AI-generated content (art, voice, music, code). Keep the provenance log (`art-direction.md` section 8) and answer the store's questionnaire from it. Generated assets must also pass the lineup gate and the licence check.

## 7. Privacy and ratings
- If the game collects anything (accounts, analytics, crash reports, online play with names), write a short privacy statement and keep logs free of addresses (`security.md`).
- Check the age rating questionnaire for the platform; violence, gambling-like mechanics, user chat and online interaction affect it.
- Voice chat and text chat need mute and report/block paths.

## 8. Trademarks and names
- Brand-like names, logos and slogans on in-game signs, products and packaging: invent them or get permission. Run a quick search before using a name that sounds real.
- Check the game's own name for conflicts before art is made around it. A rename late is costly; do the check early and log the user's final pick.
- Do not impersonate a real organisation in the game or its store page.

## 9. Release checklist
Copy `assets/templates/RELEASE_CHECKLIST.md` into the project. Minimum:
- [ ] All gates in the ladder that apply pass on a fresh checkout and on an exported build (`quality-gates.md`).
- [ ] No placeholder, default or unfinished asset; the placeholder list in `HANDOFF.md` is empty.
- [ ] `CREDITS.md` complete; credits screen and store README generated from it.
- [ ] Terms/licence text approved by the owner; owner name correct everywhere.
- [ ] Export presets exclude `tools/`, QA scripts, `_incoming/`, secrets and test data; the build size is sane.
- [ ] No secrets or personal data in the repo, build or logs (`check_project.py`).
- [ ] Version string bumped; save format versioned; network protocol number bumped if incompatible.
- [ ] Crash-free soak (a long run with the maximum player count) and the perf baseline recorded.
- [ ] Store page assets, rating questionnaire, privacy statement and AI-disclosure answers done.
- [ ] The user played the exported build and signed off.
