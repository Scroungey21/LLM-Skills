# Sourcing, rights and the risk register (the defining gate)

Compiled 2026-11-01 from v7 `requirements.md` §2/§9, `design.md` §3, v5 `requirements.md` §5 (rights tiers, fair-use memo) and §12,
the archived code (`manga_documents.py`, `fair_use.py`, the `manga-uploads` console page) and its tests (`test_v7_3_manga_documents.py`).
**Nothing in the repo is market research or a legal opinion.** Statements about YouTube policy or copyright law below are the writer's
general knowledge, are tagged `[general knowledge - verify]`, and must be re-checked against the current policy text and a lawyer before
monetised use. Specs cited as `V7-REQ-x.y` / `V5-REQ-x.y` / `RD-n`.

Contents: 1 What the specs settled · 2 The four bases for a new channel · 3 The fair-use gate · 4 Operating it now · 5 Choosing what to adapt ·
6 Risk register · 7 Things this skill will not help with · 8 Open questions

## 1. What the specs settled (do not relitigate; changes are the owner's call)

- **Exactly one `rights_basis` per source document, recorded before any parsing** (V7-REQ-2.1): `owned`, `licensed`, `public_domain_cc`, `fair_use_candidate`. This reuses v5's Rights Clearance Tier system rather than inventing a parallel mechanism (RD-98 made `fair_use_assessments` polymorphic by `origin` to allow it).
- **Persist the file first** (V7-REQ-2.2): a reviewer must be able to read the actual PDF, not just the attestation.
- `owned` / `licensed` / `public_domain_cc` -> `verified` immediately, no extra human gate (V7-REQ-2.3). `licensed` needs a `license_reference`; `public_domain_cc` needs a `verification_note` (blank/whitespace is rejected).
- `fair_use_candidate` -> a linked `fair_use_assessments` row, `status="pending"`, **no parsing until it resolves** (V7-REQ-2.4). Approve -> `verified` + parse; **reject -> never parsed, no fallback source** (V7-REQ-2.5; unlike a rejected asset candidate, a rejected whole document has nothing to fall back to).
- **No automatic approval path** (V7-REQ-2.6, V5-REQ-5.11): individual human sign-off on the full four-factor memo; no bulk approve; no "safe length" / "obscure enough" heuristic anywhere.
- **Warning at the point of decision** (V7-REQ-2.7, V7-REQ-9.1): the shipped console text says, in substance, that this is a full, unlicensed chapter of an ongoing commercial work, not a short illustrative clip, that this weighs the "amount used" and "market effect" factors far more heavily against approval, and that it is a genuine exception needing real scrutiny. Keep that framing in any UI or runbook.
- **Every decision is logged permanently** against the document and not mutable through the ordinary API (V7-REQ-2.8).
- Composition choices (blurred backdrop, frame, grade, overlay) are creative refinements and **"never a substitute for the rights gate"** (V7-REQ-6.4).
- `subject_match_passed` is forced `True` for documents (RD-103): the v5 subject-match gate exists to reject decorative clips; a document is definitionally about itself.
- v5 §12 (non-binding recommendation, operational not a build task): get a one-time attorney consultation on the fair-use pathway. Never recorded as done.
- `real_entity_sensitivity_level` defaults to `low` for this niche (fictional narrative, V7-REQ-3.3); raise it per work if the manga is biographical.
- Spec vs code: V5-REQ-5.6 names only the purpose-and-character memo as required; the code (`approve_fair_use_assessment`) requires **all four** memos non-empty (`IncompleteFairUseMemoError`). Written as: all four.

## 2. The four bases, as a new channel should treat them

| Basis | Extra field | Meaning in the console | What it must mean for you | Viable as an operating model? |
|---|---|---|---|---|
| `owned` | none | "uploader holds the rights ... outright" | you are the rights holder (you drew/wrote it, or hold a written assignment). **Owning or having bought a copy is not owning the right to reproduce and publish its art** | yes, if true. The spec has no verification of the claim: it is self-attested |
| `licensed` | `license_reference` | "used under a licence from the rights holder" | a written licence that covers *adapting panels into a monetised narrated video, on YouTube, in your territories, for the term you need*. The spec records only a reference string, **not scope** - record scope yourself ([operations-agent-as-llm.md](operations-agent-as-llm.md) `RIGHTS.json`) | yes; this is the realistic route for a real channel (author/publisher/platform permission) |
| `public_domain_cc` | `verification_note` | "public domain or Creative Commons - note how confirmed" | the **specific edition, translation and scan** you use is free to adapt. A modern translation, lettering or restoration can carry its own copyright; Creative Commons variants differ (an NC term or an ND term can bar a monetised adaptation) `[general knowledge - verify]` | yes; thin supply, but safe when verified |
| `fair_use_candidate` | the four memos | warning treatment | an unlicensed, ongoing commercial work, reproduced panel by panel | **No.** The spec calls it a genuine exception; this skill does not offer it as a way to run a channel. Use it only if the owner deliberately accepts it after counsel, one document at a time |

Corollary: do not source PDFs from scanlation or piracy sites. Their translation and distribution are themselves unlicensed, which defeats the attestation and compounds exposure.

## 3. The fair-use gate (when it is used)

```
upload (PDF persisted) -> document.status = pending_review
   -> assessment(origin=source_document, subject_match_passed=True, franchise_or_rightsholder=<title placeholder>, status=pending)
   -> human fills 4 memos (own words) -> approve  => document verified -> parse
                                       -> reject   => document rejected -> never parsed
```

- The four memos (`purpose_character_memo`, `nature_of_work_memo`, `amount_substantiality_memo` incl. the "heart of the work" test, `market_effect_memo`) are a structured memo, **not a numeric score**, and **in the reviewing human's own words** (V5-REQ-5.5/5.6). The agent never drafts or pre-fills them: a pre-written memo defeats the point of the gate.
- Ambiguity in any factor => default **reject** (V5-REQ-5.10). The pathway is "designed to be used rarely".
- `franchise_or_rightsholder` is filled with the document title at upload (a placeholder; the reviewer corrects it). Repeated-franchise tracking (V5-REQ-5.9: a `GROUP BY franchise_or_rightsholder` awareness signal, not a blocker) is therefore only meaningful if the reviewer fixes that field.
- The agent *may* prepare factual inputs for the human: what the work is, the rightsholder, page and panel counts, the planned share of panels shown, the planned narration length, the planned release pattern. Facts only; the judgement is the human's.
- Rejection notes are persisted only through `notify()` into `notifications_log` (no column), so keep your own record.

## 4. Operating it now (no engine)

1. Create `RIGHTS.json` next to the source file *before* rasterizing anything (fields in [operations-agent-as-llm.md](operations-agent-as-llm.md)). No `panels/` folder may exist while `status != verified` (V7-INV-1).
2. Store the evidence (licence PDF, e-mail, CC page capture with date, the owner's attestation) beside it. Descriptions later cite it.
3. Treat the attestation as a statement the owner makes, in the owner's name, not the agent's. If the basis is unclear, ask; do not pick one to unblock yourself.
4. If a fair-use review is requested, stop and hand the owner the review packet; do not rasterize or "just look" at the pages beyond what is needed to identify the work.

## 5. Choosing what to adapt

The only AI step the spec allows in choosing a work is an on-demand, stateless suggestion call (V7-REQ-3.6): titles + one-line pitches, "favor series with a clear, self-contained visual and narrative arc", **every suggestion must be a real, existing published work**, nothing persisted, ranked or gated, never creates a project. As the agent you play that role; keep it informational and verify each title exists before it goes near the owner.
Skill-level selection rubric (proposal, not a spec - label as such when presenting it), in this order:
1. **Rights availability first** - can a licence, an owner relationship or a verified public-domain edition be had? If not, drop it before story merit is discussed.
2. Self-contained arc that fits the runtime (panels per minute, [script-and-narration.md](script-and-narration.md)).
3. Story carried by images and dialogue the parser can read (OCR load, reading direction, text density, sound-effect clutter).
4. Content rating and safety (section 6, R5).
5. Not already covered: the archived dedup is byte-hash only, so keep a channel ledger of `series + chapter range` (the `topic-history.json` analog; see [release-calendar.md](../../../references/release-calendar.md)).
Language: the spec translates nothing (non-goal); narration language = the source language unless the prompt says otherwise.

## 6. Risk register

"Decided" = what the specs fixed. "Open" = what nobody settled. `[gk]` = general knowledge, verify.

| # | Risk | Decided | Open / skill rule |
|---|---|---|---|
| R1 | A recap reproduces most of a chapter's panels in full, for monetised video: copyright infringement exposure `[gk]` | rights gate before parsing; fair use = human memo, default reject, warned (V7-REQ-2.x) | whether any `fair_use_candidate` document should ever run on a monetised channel. The memo's "amount" factor can be informed by recording `panels_used / panels_total` and runtime share per chapter; no threshold is "safe" (V5-REQ-5.11) |
| R2 | The `owned` / `public_domain_cc` attestation is false or sloppy | attestation recorded permanently (V7-REQ-2.8) | nothing verifies it; a purchased copy is not `owned`; keep evidence files; the owner, not the agent, attests |
| R3 | YouTube monetisation policy on reused / inauthentic / mass-produced content `[gk]`: recap videos built mostly from someone else's visuals need substantial original commentary or transformation, and templated mass production is itself a flag | nothing in the specs addresses it; the V7 non-goals list is silent | commentary and selection are the only honest answers: real analysis, fewer panels shown, not every panel narrated, varied structure. Do not describe any layout trick as a way around the policy. Re-read the live policy before launch |
| R4 | Content ID matches, DMCA takedowns, channel strikes from publishers `[gk]` | nothing | prefer `owned`/`licensed`; get licences in writing; keep per-video rights evidence for counter-notices; assume a claim can hit any video using third-party art |
| R5 | Mature content (violence, sexual content, minors) -> age restriction / ineligible for ads; sexualised minors is a hard no `[gk]` | no manga safety gate. Horror got a `content-safety` stage (v8 §3.2); manga did not | proposal: an agent safety pass over `visual_description` + dialogue before scripting, reject-by-default for sexualised minors, flag graphic violence for the owner, record the verdict in `panels.json` |
| R6 | Source provenance (pirated/scanlated file) | none | refuse unlicensed sources ([section 2](#2-the-four-bases-as-a-new-channel-should-treat-them)) |
| R7 | Voice: the archived house voice `warm-informational` is a clone of a real, identifiable person, consent not obtained ([voice-tts.md](../../../references/voice-tts.md) §3). Synthetic-narration disclosure rules `[gk]` | none for manga (MT sets `containsSyntheticMedia=false` for stylised sims; that does not transfer) | do not use `warm-informational` here; choose a voice you can license or a genuinely synthetic default, with provenance; decide the YouTube altered/synthetic-content disclosure answer deliberately and never claim guaranteed evasion of labelling or detection |
| R8 | Vision-model OCR / description errors become false narration | accepted: spot-check at ordinary review, no dedicated QA pass (V7-REQ-4.4, non-goal) | the agent can look at the image itself; do it ([panel-parsing.md](panel-parsing.md)) |
| R9 | Repetition: near-duplicate chapters, same series told twice | byte-hash dedup only | channel ledger by series + chapter range |
| R10 | Thumbnails reuse panel art (same rights as the video) | V7 non-goal "thumbnail generation ... until the master thumbnail decision" | decide per channel; only for bases that cover it |
| R11 | Suggestion call invents titles | prompt says "never invent" | verify existence before use |
| R12 | Credits / attribution absent from the description | none | proposal: put licence reference, creator, publisher and an official-source link in every description (mirrors the music-credit rule in [audio-captions-music.md](../../../references/audio-captions-music.md) §5) |
| R13 | Translation/localisation rights | non-goal | a translated or dubbed recap needs the licence to cover it |

## 7. Things this skill will not help with

- Altering images (mirroring, speed/pitch changes, crops, noise, re-encoding) to avoid automated matching or detection. The archived blur-backdrop layout is a framing aesthetic for non-16:9 panels, nothing more.
- Presenting a claim of fair use, transformation or "no copyright" as settled.
- Running a channel on `fair_use_candidate` material by default, or approving a fair-use assessment on the owner's behalf.
- Publishing, uploading or scheduling anything without the owner's explicit authorisation in that turn ([agent-principles.md](../../../references/agent-principles.md) §5).

## 8. Open questions for the owner

1. Which basis will the first channel actually use (licence partner, own comics, public-domain works)? Everything downstream depends on it.
2. Has the v5 §12 attorney consultation happened? (Not recorded anywhere.)
3. Does the channel accept `fair_use_candidate` at all? If yes, under what per-document conditions?
4. Voice and disclosure choices for this channel (R7), recorded with a date.
5. Are thumbnails allowed to use panel art (R10)?
