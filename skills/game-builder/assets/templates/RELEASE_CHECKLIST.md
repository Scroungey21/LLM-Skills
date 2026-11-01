# Release Checklist - {{NAME}}
(Tick each line only with evidence: a PASS line, an image or a note. Rules: references/release-and-legal.md and references/quality-gates.md.)

## Gates (fresh checkout and exported build)
- [ ] G0 lint, G1 import, G2 boot and walk
- [ ] G3 unit tests
- [ ] G4 content checks (every unit, 3+ seeds)
- [ ] G5 clipping detector, `problems=0`
- [ ] G6 animation clearance and playback
- [ ] G7 audio check and mastering report
- [ ] G8 balance sweep, normal and greedy
- [ ] G9 network smoke and hostile-client suite; real second-machine join done (or marked UNVERIFIED)
- [ ] G10 UI fit matrix and every screen's screenshot read by eye
- [ ] G11 performance on the reference machine, native resolution, adapter asserted
- [ ] Edge-case checklist (references/qa.md) ticked or logged

## Quality bar
- [ ] No placeholder, default or unfinished asset; the placeholder list in HANDOFF.md is empty
- [ ] Nothing visibly clipped, flickering, misaligned or off screen (tours read by eye)
- [ ] Look matches ART_DIRECTION.md; the lineup gate was run on every new class
- [ ] Every sound is a recording unless the user asked otherwise; the whole game was played with sound

## Legal and store
- [ ] CREDITS.md complete; in-game credits and the store README generated from it
- [ ] Owner name and terms text approved by the owner
- [ ] Fonts, music and sounds licences re-read; streaming policy matches the user's wish
- [ ] Rating questionnaire, privacy statement and AI-disclosure answers done (if the store asks)

## Build
- [ ] Export presets exclude tools/, QA scripts, _incoming/, secrets and test data
- [ ] No secrets or personal data in the repo, build or logs (check_project.py --release)
- [ ] Version string, save format version and network protocol number bumped as needed
- [ ] Soak test: long run at the maximum player count, no crash, memory flat

## Sign-off
- [ ] The user played the exported build and signed off on: <<FILL date>>
