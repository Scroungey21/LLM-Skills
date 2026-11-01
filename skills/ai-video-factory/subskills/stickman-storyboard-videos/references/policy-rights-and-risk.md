# Policy, rights and risk notes

Contents: 1 A correction about the source · 2 Copyright and originality · 3 Reference acquisition and platform terms · 4 YouTube channel policy risks · 5 AI disclosure and honest labelling · 6 Factual and safety risk · 7 Voice, model and asset licences · 8 Hand-offs and what the owner must decide · 9 What is deliberately not here

This is a design-risk note, not legal advice. Where it cites platform policy, **verify the current policy text before relying on it** - nothing here was checked against live YouTube documents (no network lookup was made when this subskill was written). Cross-channel rules: [agent-principles §4-§5](../../../references/agent-principles.md).

## 1. A correction about the source

The assignment-style label "reverse-engineered commercial tool and its terms" does not match the documents. **"TPDossier" is a YouTube channel (`@TPDossierYT`)**; the Report analyses its *observable* videos/metadata and designs a *separate* local production system. There is no product, licence, DRM or terms-of-use of a tool to summarise, and nothing in the docs (or here) describes circumventing any. What matters instead: copyright in the studied channel's expression, platform terms on how reference material may be obtained, platform monetisation/disclosure policy, and the licences of the components you use. The Report itself states it avoids reproducing any target script/thumbnail, refuses to claim unobservable internals, and keeps OBSERVED/INFERRED/PROPOSED separate (Report header, §2.1).

## 2. Copyright and originality (Report header; Handoff principle 11, §Final principle)

- **Copy format mechanics and production logic, never protected expression.** Never reuse another creator's script, artwork, thumbnail or scene sequence verbatim; produce original research, wording and assets. The target is "the same kind of satisfying video" with every script, scene and asset independently produced (Handoff §Final principle).
- Practical rules: no copied sentences or structure-by-sentence from a reference transcript (the Report deliberately avoids long verbatim reproduction, §3.4); do not mirror a reference's exact shot sequence, character designs, palette-plus-composition "clone" or thumbnail layout (gate: "no accidental resemblance to a specific target thumbnail beyond generalised grammar", §27.8); do not copy exact existing titles "unnecessarily" (§16.1); channel name, avatar, intro and sign-off must not imitate the studied channel; do not claim or imply affiliation.
- The grammar that is fair to learn from is generic and widely shared (a paradox question title, a concrete cold open, layered causal explanation, a callback). Keep your own topic choices and evidence.
- Third-party transcript mirrors and summary pages cited in Report App. F were used for structure only; do not use them as factual sources or republish their text (this subskill deliberately omits their URLs - read "Report App. F" if you need the audit trail).
- Real people (researchers) appear only as minimal portrait/name/year/paper-card motifs, **no fake quotes, no invented dialogue** (Report §8.2, §18.6; same stance as the HES stylised-CG rule).

## 3. Reference acquisition and platform terms (decision needed)

The Handoff and Report (§9.4, Blueprint 2, App. C) propose a local `forensic_capture` pass on "legally obtained/downloaded" reference videos and thumbnails (3-5 videos) to fill the unmeasured style fields. This subskill **does not provide a download procedure.** Reasons and options:
- Downloading or scraping another party's YouTube videos/thumbnails generally conflicts with YouTube's terms unless a provided feature or permission allows it; the Report's own phrase "where permitted" is the gate, and it was not checked. Treat as **owner decision**.
- The repo's Etcherr871 decision (owner takes the rights risk for found clips; 2026-10-04) is specific to that channel's different use (re-publishing clips with credit); it is **not** a precedent for analysing or downloading a competitor's videos ([agent-principles §4](../../../references/agent-principles.md)).
- Non-download ways to get the same calibration: manual timestamped watch notes made while viewing normally (shot-change times, pose/camera/overlay events, music/SFX presence) recorded in your own words; analysing videos you own or have licensed; calibrating the style profile against your own renders and your own analytics; public-domain/CC reference material. Keep any measured distributions with sample size and reference-set description; never overwrite `null`s with guesses.
- Competitor metadata for idea mining: use lawful access (official APIs/exports/manual observation); do not treat it as factual evidence; do not build scrapers without the owner's approval.

## 4. YouTube channel-policy risks (verify current wording)

- **Mass-produced / templated content.** An automated, template-driven channel (same rig, same structure, many videos) can be judged "inauthentic"/repetitive for monetisation. The report's mitigations are the design itself: original research and scripts with a claim ledger, varied visuals via scenario planning, human approval gates, no recycling of others' footage. This is an **open risk**, not a solved one; keep per-video substantive differences (new mechanism, new evidence, new scenarios) and a human editorial hand (the owner's "extremely high quality" bar for other channels, [agent-principles §11](../../../references/agent-principles.md)). Do not write or seek techniques to evade detection or review.
- **Reused content.** Original illustrations avoid it; any third-party image, clip, music or font does not - record licence and attribution ([audio-captions-music §5-6](../../../references/audio-captions-music.md)).
- **Misleading metadata.** The Report's own gate: absolute titles are allowed only with a truthful `title_qualification` and early in-video qualification; reject titles whose nuance destroys the premise or that imply unsupported medical/dietary conclusions (§4.2, §16.3).
- **Age/advertiser sensitivity.** Animal-food, predator and parasite topics can drift into graphic imagery; keep stylised, non-gory visuals; consider how YouTube might classify content; the owner's per-channel safety rules are in [agent-principles §12](../../../references/agent-principles.md).

## 5. AI disclosure and honest labelling

- Never promise or claim guaranteed evasion of YouTube labelling or detection; aim for human-directed quality and honest compliance with disclosure rules; keep `containsSyntheticMedia`-style fields **truthful per channel** ([agent-principles §4](../../../references/agent-principles.md)). MT sets it false only because its clips are stylised CG simulations; do not copy that decision - decide on the facts of this channel: synthetic narration (TTS), any generative raster art, any realistic depiction. Stylised stick-figure animation is not photoreal, but the disclosure rules and your TTS/generative choices must be re-read at publish time.
- Description should state sources (the Report notes the observed channel lists researchers/institutions and says visuals are original illustrations - a good habit: list the real sources and say the visuals are original illustrations when true).
- Keep a `provenance` trail so you can answer a claim or review (workflow/model/seed/hash; music licence; font licence).

## 6. Factual and safety risk (Report §6.6, §16.3, §17.4, §21.14, §28.4)

- Totalising evolutionary/causal claims are the observed reference's weak spot; the claim ledger scope check exists for that reason ("may contribute" instead of "this is why humans never ...").
- Medical/dietary/safety implications (parasites, toxins, eating wild animals) are a **veto/escalate** category: no health advice, no safety conclusions beyond evidence, cite primary sources, show uncertainty. Escalate to the owner when the central evidence is contradictory or a metaphor risks factual deception.
- Visual deception: diagrams must not imply causality stronger than the source; metaphors must be marked as metaphors (HES "visual truth" tags `schematic`/`illustrative`/`evidence`, see [characters §11](characters-assets-continuity.md)); invented historical detail must not look like fact.

## 7. Voice, model and asset licences

- **Voice:** OmniVoice weights are CC-BY-NC (non-commercial); the owner chose (2026-10-12) to prefer a commercial engine (VoxCPM2, Apache-2.0) for new voices yet picked an OmniVoice clone for HES shorts on 2026-10-18 - an unresolved tension to flag before monetised use ([agent-principles §4](../../../references/agent-principles.md), [voice-tts §3, §9](../../../references/voice-tts.md)). House voices must be synthetic, non-impersonating, with provenance JSON; IndexTTS 2.5 is banned (OOM).
- **Image models** (only if ComfyUI is adopted): record checkpoint/LoRA licences; FLUX.1-schnell is recorded as Apache-2.0 in the repo notes (re-verify the current terms); do not use a LoRA or prompt that imitates a specific living artist or the studied channel; pin and hash workflows (Report §20.8).
- **Music/SFX/fonts:** licence + attribution + source URL per asset; exact credit text in the description; never buy or accept a licence without asking; prefer OFL fonts ([rendering §7](../../../references/rendering.md)).
- **Wikimedia/photos/maps** (if used in inserts): licence and attribution per item; `evidence`-tagged screens need provenance and rights status.

## 8. What the owner must decide before the first publish

1. Whether any reference analysis (and how) is acceptable (§3). 2. Narration engine and its licence for monetised use. 3. Whether generative images are allowed at all and the disclosure consequence. 4. Disclosure field values. 5. Channel identity clearly distinct from the studied channel. 6. The editorial/human-review standard that answers the templated-content risk. 7. Who uploads (always the owner) and when.

## 9. What is deliberately not here

Download/scrape recipes for another channel's media, any technique to defeat platform detection, licensing or access controls, and any reproduction of the studied channel's scripts, transcripts or thumbnails. The architecture lessons (state machine, schemas, gates, continuity) are the reusable part.
