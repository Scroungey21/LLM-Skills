# YouTube policy, rights and safety risk register

Contents: 1 How to read this register · 2 Register · 3 What the archived design decided about risk · 4 Pre-launch verification tasks · 5 Tripwires and response · 6 Honest limits

## 1. How to read this register

- **VERIFIED** = stated on an official page that was fetched and quoted in `ambient-channel/research-output/report-05-youtube-policy-copyright-provenance.md` (retrieved 2026-10-07; section ids in brackets such as [YT-01]).
  It is a snapshot. Re-check before relying on it.
- **VERIFY BEFORE LAUNCH** = a rule I believe exists but that is **not** in any repo source. I did not reconstruct wording from memory; section 4 lists the exact pages to fetch and record. Treat these rows as open
  until that is done.
- **ARCHIVE** = what the v8 spec decided. **NEW** = guidance written for this skill.
- Tiers are judgement (LOW/MEDIUM/HIGH), not YouTube statements. YouTube does not publish how reviewers or classifiers decide; any trigger described here is inference unless quoted.
- Never write or follow instructions to evade platform detection, labelling or licensing. A filter, edit or re-encode must have a creative reason; "so it won't match/flag" is not one.

## 2. Register

| ID | Risk | Basis | Tier | Mitigation / gate |
|---|---|---|---|---|
| **R4** | **Inauthentic / mass-produced content (the top channel-level risk).** The Spam policy lists "Channels that use the exact same background music and repetitive AI generated imagery across many videos, with each video reading out an AI-generated script". A faceless horror channel (TTS narration + similar backdrops + generated scripts) matches that description almost exactly. The YPP page also bans "AI-generated content made with generic or unoriginal templates giving the impression of mass production" and says reviewers weigh the most-viewed, newest and highest-watch-time videos plus titles/thumbnails/About | VERIFIED [YT-01][YT-08] (the Spam example text was added between 2026-04-02 and 2026-10-07) | **HIGH** unless mitigated | Distinct authored concept per video; original plates and a bed that audibly differ per video; no template openers; slow cadence (start 1-2 uploads/week, *uncalibrated*, report-05 principle 6); keep process evidence (drafts, seeds, plates, mix sessions); monthly reviewer-view audit; permission-based stories only |
| **R8** | **Author copyright / takedown.** Stories were scraped; archive recorded `author_handle` only; "paraphrase and blend" does not create a licence | ARCHIVE gap; reuse policy "applies even if you have permission" [YT-01] | **HIGH** for scraped text | Permission state machine and `story_rights.json` ([sourcing-rights-and-consent.md](sourcing-rights-and-consent.md)); original or commissioned stories; no `unpermissioned_public` text |
| **R1** | **Age restriction / graphic or violent content.** Gore, graphic violence and disturbing content can lead to age-restriction or removal depending on context, and age-restricted videos get reduced reach and ads | **VERIFY BEFORE LAUNCH** (YouTube Help: violent or graphic content; age-restricted content) | MEDIUM-HIGH | The archived safety gate **passes** gore on purpose; add the NEW policy screen ([safety-clustering-founding.md](safety-clustering-founding.md) §3); prefer implication/aftermath; no lingering gore frames; thumbnail has no gore; decide per video whether to self-restrict, and record it |
| **R2** | **Self-harm / suicide.** A story whose plot or payoff includes self-harm, suicide method detail or glamorisation | **VERIFY BEFORE LAUNCH** (suicide, self-harm and eating-disorder policy; resource panels) | HIGH when present | Hard-fail/rewrite out in the policy screen; no method; no sympathetic "answer"; if a topic is unavoidable, handle without method and follow the then-current guidance on resources |
| **R3** | **Advertiser suitability.** Death, violence and horror themes reduce ad suitability (limited or no ads); a human ad-suitability review may run on uploads, including private ones, taking up to 24 h | Review fact VERIFIED [YT-01 row 14]; category rules **VERIFY BEFORE LAUNCH** | MEDIUM (revenue) | Plan for limited ads in forecasts; keep titles/thumbnails/description clean of slurs and gore words; do not tag the video as safe-for-all; allow 24 h before scheduling |
| **R5** | **Made-for-kids confusion / child-directed horror.** Cartoon-like illustration, game-mascot horror (Poppy Playtime/FNAF style) and "for kids" cues push toward "made for kids"; a wrong designation is the creator's legal responsibility (COPPA) | VERIFIED [YT-18][YT-19]; kid-skewed horror-mascot content flagged "risky packaging" in report-13a [R] | MEDIUM | Always designate **not made for kids**; adult first-person narration; no kid characters, nursery cues or game-IP mascots; adult-skewing thumbnails; see also **minors** in R9 |
| **R6** | **AI disclosure.** Must disclose when content "makes a real person appear to say or do something they didn't", "generates a realistic scene that didn't actually occur", "alters footage of a real event or place", or has AI-generated music as a main focus; clearly unrealistic/animated content and scripts/titles/thumbnails are exempt. Disclosure carries no stated penalty; persistent non-disclosure can lead to labels or YPP penalties; C2PA metadata can force an uneditable label | VERIFIED [YT-02][YT-04] | LOW if disclosed | Provenance-driven flag: photoreal generated places = disclose; AI music = disclose; **a voice cloned from a real, identifiable person falls under "real person appear to say..."** and is a consent problem as well (voice-tts §3) - do not use one; synthetic narration of a script is not on the quoted list but disclose anyway if in doubt; do not strip C2PA/watermarks; EU AI Act Art. 50 transparency obligations apply from 2026-08-02 [EU-01] (check) |
| **R7** | **"True story" misrepresentation.** Personal framing ("I woke up...") and r/LetsNotMeet (nominally non-fiction) make a viewer think it is real; deceptive framing can breach misleading-metadata and trust expectations | ARCHIVE: personal framing required (V8-REQ-5.5); metadata rule **VERIFY BEFORE LAUNCH** | MEDIUM | Description and pinned comment say the story is fiction/adapted; never title it "true story"/"real footage"; no fake news-style or "found footage" claims; no fabricated evidence (shared rule, agent-principles §4) |
| **R9** | **Real persons, minors, privacy.** Identifiable people in the source (esp. LetsNotMeet), real tragedies or victims, minors in harm | ARCHIVE gate #2 (`real_person_targeting`) is narrow; wider rules **VERIFY BEFORE LAUNCH** (harassment, privacy, child safety) | HIGH if present | Strip/replace every identifier; no real events; minors in sexual context = drop the story; minors as victims of graphic harm = rewrite or drop; policy screen records it |
| **R10** | **Stock footage and library music reuse / Content ID.** Pexels footage and library tracks used by many channels create reuse optics; only the Audio Library is "known to be copyright-safe"; "collections of songs" and pitch/speed-modified tracks are reuse | VERIFIED [YT-01][YT-17] | MEDIUM-HIGH | Original plates; project-owned bed; CC0 foley only; credit everything credited by licence; see [visuals-audio-captions.md](visuals-audio-captions.md) §4/§8 |
| **R11** | **Voice rights.** The archived house voice is a clone of a real person's voice from an unlicensed clip, consent not obtained | `voice-tts.md` §3 (provenance recorded) | HIGH if reused | New voice with licence/consent or a genuinely synthetic reference + provenance JSON ([script-and-narration.md](script-and-narration.md) §5) |
| **R12** | **Filters framed as evasion.** Spam policy names "Detection evasion: Technical manipulation (such as speeding up audio, heavy filters, cropping) designed to bypass abuse detection" | VERIFIED [YT-08] | MEDIUM if misused | The CRT/VHS/grain overlay is a style decision; never apply filters, pitch or speed shifts to third-party audio/video to dodge matching; no hash-busting noise or micro-crops |
| **R13** | **Scraping terms.** Reddit and 4chan terms/API rules for automated collection and reuse | **VERIFY BEFORE LAUNCH**; direct Reddit fetches returned 403 for scripts in report-05 | MEDIUM | Prefer permissioned/commissioned supply; use RSS/permission requests, never circumvent blocks; record retrieval date and URL |
| **R14** | **Cadence / volume.** "Flood our platform" wording; no published threshold | VERIFIED wording [YT-08]; numbers are speculation | MEDIUM-HIGH | Hard weekly upload cap in the calendar; Shorts do not count as free volume; scale only after a clean YPP review |
| **R15** | **Flashing and startle (viewer safety).** VHS jitter, strobing stings and sudden loud peaks | General accessibility guidance (no more than three flashes per second, WCAG 2.3.1); loudness limits NEW | LOW-MEDIUM | `vhs_distortion` default off or toned down; no full-frame strobes; limiter on stings; final true peak <= -1.5 dBTP; content warning line in the description for intense videos |
| **R16** | **Thumbnail/title packaging.** Gore, shock faces, real faces, clickbait promises; metadata that misleads | Title/thumbnail gates in `qa-gates.md` §14; misleading-metadata rule **VERIFY BEFORE LAUNCH** | MEDIUM | Implication-based thumbnail, 3-4 words max, no "REAL", no faces of real people; inspect at 10-15% scale |
| **R17** | **Reused-content strike from re-cutting own videos.** One studio reported a reused-content penalty for re-posting its own earlier clips | Single anecdote [RD-19] | MEDIUM | Shorts are condensed new narrations, not slices of the long audio; never re-upload a previous render as a new video |

## 3. What the archived design decided about risk

- **Decided [A]:** the safety gate blocks hate speech, real-person targeting/doxxing and fiction crossing into genuine harm, and passes ordinary horror (V8-REQ-4.4); 4chan content is lower trust; rejected stories are never shown;
  `real_entity_sensitivity_level="high"`; paraphrase-not-verbatim; source attribution kept permanently via `horror_story_selections`; the Tier 0-2 asset rule with Tier 3 hard-blocked and Tier F only through a human memo
  (V5-REQ-5.2/5.3); no ranking of stories.
- **Not decided [A, absence]:** author permission, age restriction, self-harm, minors, advertiser suitability, AI disclosure for the voice, fiction labelling, upload cadence, and whether to self-restrict. The v8 spec treats
  "horror" as a content genre, not as a YouTube-policy category. Rows R1-R3, R5-R9, R13, R15-R16 are therefore new design work.
- **Related precedent [R]:** the ambient channel's owner audience rule (2026-10-07, recorded as MASTER gate C10 in report-12): not made for kids, everyone-friendly, no sexual or "freaky" themes or memes, no zombies/violence/horror
  cues in its briefs. That is for a different channel and does **not** bind a horror channel, but it shows the owner's brand-safety posture: a horror channel is a separate, deliberately adult-leaning channel, not a sub-brand of the ambient one.

## 4. Pre-launch verification tasks (do these, record the date and the wording)

Fetch the current official pages and save a dated snapshot into `policy_snapshot/` next to the channel; decisions below depend on the actual text:
1. Violent or graphic content policy and age-restricted content policy (what is allowed with context, what is age-restricted, thumbnails/titles rules).
2. Suicide, self-harm and eating-disorder policy (including educational/documentary/fictional exceptions and resource requirements).
3. Child safety policy and the minors-in-harm rules; made-for-kids designation guidance.
4. Advertiser-friendly content guidelines for violence, death, horror and adult themes.
5. Misleading metadata, titles and thumbnails; impersonation; harassment and privacy complaint rules.
6. Altered or synthetic content disclosure (re-check [YT-02]); YPP inauthentic content page and Spam policy (re-check [YT-01][YT-08]).
7. Reddit (and any other source) terms of service for automated collection and for reuse of user content.
8. The current text of the specific subreddit's rules for narrations/adaptations, if any story is taken from it.

## 5. Tripwires and response (NEW)

Pause all uploads and investigate on: any YPP rejection or policy warning, an age-restriction decision, a Content ID claim on original audio, a strike or removal request, or a copyright/privacy complaint from an author or person
(report-05 principle 14). Dispute claims only with evidence, within the windows in report-05 §2.4. Do not delete videos before an appeal ([YT-20]: the channel is assessed in its current state). Never create a sibling channel to
get around a suspension ([YT-01]: could lead to termination of all channels).

## 6. Honest limits

This register cannot guarantee any platform outcome (age restriction, ad suitability, monetisation, claim or strike). The only controls are: lawful sourcing with recorded permission, content designed to be defensible under the
verified policies, honest labelling, and evidence of human authorship. Do not promise or imply guaranteed evasion of labelling or detection systems (`../../../references/agent-principles.md` §4).
