# Metadata, thumbnails and upload packaging

Contents: 1 Titles · 2 Description layout · 3 Tags and hashtags · 4 Thumbnails (v3 contract) · 5 Thumbnail photo sourcing and licensing · 6 Style research behind the thumbnail/caption decisions ·
7 Upload settings and platform policy · 8 Legacy (v1/v2) thumbnail policy

## 1. Titles (permanent `question-mechanism-v1`, user revision 2026-09-13; gate `editorial_lint`)

- Format `"<Main question?> | <Mechanical reflection>"`: the recognisable object and its search question first, then the reflection. Example: `How Does a Piano Key Work? | The Hammer Flies the Last Bit Alone`. The part before ` | ` **ends in `?`** (v3 3.4+, `validate_thumbnail_question`); each half >=8 characters; the whole title **<=100 characters**; exactly one ` | `.
- Exactly **three** `alternate_titles` in the same shape, distinct from each other and from the title (they go in `titles.txt` and the description's "Alternative titles:" block, never leak as viewer copy elsewhere).
- `short_title` stands alone: 20-100 characters, no ` | `.
- Title states the contradiction/question when the topic supports one ("Why Birds Can Sit on 50,000-Volt Power Lines" over "How Power Lines Work"). Reject "shocking truth", "they do not want you to know", vague superlatives, anything promising a controversy the script lacks.
- Package copy limits: `hook_line` <=150, `short_hook_line` <=150, `search_line` <=200, `accuracy_scope` <=600, `next_tease` <=50 characters; scene `headline` 3-36 characters (used only for timestamps, never shown).
- Legacy v2 packages: titles <=100 with ` | `, same three alternates, `short_title` without ` | `.

## 2. Description layout (permanent; `pipeline_v3._description`, `metadata_format.description`)

Order, for the long and the Short alike:
1. Lead: long = `hook_line` + `search_line`; Short = `short_hook_line` + `search_line`.
2. `Sources:` - long lists every source as `- publisher: title url`; the Short lists the first 4 as `- publisher: url`.
3. `About this explanation:` + `accuracy_scope` (the scope/qualification footer; precision lives here, not in narration).
4. Hashtags (long default `#HowItWorks #Engineering #EverydayScience`; the Short prefixes `#Shorts`).
5. Thumbnail photo credit (`Thumbnail photograph: <artist>. <source page>` and `License: <license> - <license url>`) when a photo is used.
6. `Alternative titles:` three dash-prefixed titles.
7. `Timestamps:` from the variant's final native scene start times, `00:00` first; the long uses one stamp per chapter (first scene of each chapter), the Short one per scene headline. Short timestamps are navigation notes; do not claim they meet YouTube chapter eligibility.
8. `Full Video: <>` unless a real URL exists (the long's own description never links to itself; the Short's is filled once the long's watch URL is captured).
9. Music credit block: `Music:` + the track's `attribution` **verbatim**. Kevin MacLeod and Scott Buckley run Content ID and clear claims only from the exact credit in the description text; QA `music_credit` fails a delivery without it.
- Remove the exact sentence `Changes: Crop, resize, gradient and headline overlay. No generated pixels in source photograph.` from descriptions (technical adaptation records stay in `THUMBNAIL_LICENSE.txt`).
- Preserve music and photo attribution/licences; sources must be real URLs you opened.

## 3. Tags and hashtags

- `clean_tags` removes `hidden everyday systems` and `ghostsystem` (case-insensitive) from every upload tag list. **Do not replace them or pad tags to a target length** (this overrides any older "fill the 500-character budget" advice).
- Package gate: tags unique (case-insensitive) and <=480 combined characters; `tags.md` shows the comma line with its `/500` count for pasting into Studio.
- Use relevant tags only: object name, "how an X works", mechanism terms, "engineering explained", "everyday engineering".

## 4. Thumbnails (v3 contract; `GhostThumbnail3`, 1280x720)

**Two thumbnails per video are mandatory**: `thumbnail.png` (published) and `thumbnail2.png` (A/B challenger); `schedule_release.py` hard-fails with "missing expected delivery file" if either is absent. Both come from one `P.thumbnail(...)` spec; `render` writes both; `rethumb --slugs <slug>` rewrites text + both thumbnails without re-rendering video.

- **Text (permanent, user 2026-10-05, supersedes the 2026-09-27 word-for-word rule):** the title's question **shortened to 2-4 words, ALL CAPS, ending `?`, <=28 characters** ("How Does a Key Open a Lock?" -> `HOW KEYS WORK?`; "How Does a Piano Key Work?" -> `HOW PIANO KEYS WORK?`). It must keep a content word of the title's question (stem match; stopwords such as how/why/does/the do not count, so "HOW IT WORKS?" fails), never be the whole title once the title exceeds 4 words, and `accent_word` (alias `key_word`) is required: the one content word drawn in yellow `#FFD21F`. Gate `validate_thumbnail_question` (alias `validate_thumbnail_text`). Earlier texts ("THE HAMMER FLIES FREE", the full 7-word question) failed the glance test (grey lines at 168x94).
- **Composition (the 2026-09-27 look the owner called great; cobalt "drawn" and bright "photo" restyles were rejected 2026-10-05):**
  - the topic's licensed real photo fills the frame, graded dark (`dim .62`, `saturate .85`, contrast 1.05) and darker on the text side (left-hand gradient, 700 px with a photo);
  - a big round dark x-ray port on the right: radius 300 at (900, 360), teal ring `rgba(22,166,170,.95)` 7 px with a soft teal glow;
  - inside the port, the video's payoff drawing (same diagram, state, highlight; `t` default 1.5 s; camera zoom ~1.8-2.4) in the x-ray look, the key part lit in the channel highlight (orange; 2026-10-10), `signal=True` parts keep their real colour; part labels are not drawn;
  - text left, vertically centred, Montserrat Black, cream `#FCF7EB` with the key word yellow `#FFD21F`, thin 4 px dark outline `#0A0C10` plus a soft shadow, best wrap of 1-4 lines (one word a line allowed) maximising size 84-150 px inside a 500x600 block, never reaching the ring (x ~593);
  - no arrow (`arrow=` accepted, not drawn); `bg`, `hero_x`, `texture` no longer apply;
  - `place=(x, y, zoom)` puts the real object behind the port (x, y = where the object sits in the photo, 0-1; zoom 1 = cover; below 1 the bare edges feather into the dark plate); size the object ~1.3-1.5x the 600 px port so its real edges show around the cutaway; `focus` can only slide along one axis.
- `thumbnail2.png` = the same composition on the dark plate **without the photo** (code behaviour; the older PIPELINE-V3 table's "cobalt" challenger is superseded).
- A topic with no licensed photo does not stop `render`/`rethumb` (since 2026-10-05): it prints a WARNING and `thumbnail.png` falls back to the dark plate: **that file must not ship** - source the photo first.
- Glance-check every thumbnail at 168x94 (sidebar size) before shipping; `preview --slugs <slug> --thumbnail-only` renders just the thumbnail still to `output/<slug>/preview/thumbnail/`.
- Run YouTube's Test & Compare (thumbnail A/B) only after a video has roughly 1,000+ impressions; set it up by hand in Studio per video (the Studio UI was not reliably scriptable).
- Thumbnail and title complement each other (neither repeats the other verbatim beyond the shortened question).

## 5. Thumbnail photo sourcing and licensing

- Photo = a **real, unedited photograph of the actual subject; never AI/diffusion/ComfyUI-generated** (`thumbnail_photo.generated` must be `false`: gate `validate_thumbnail_photo`). A fully drawn thumbnail reads as AI slop (user, Sep 19); a real photo does not.
- Licences allowed: CC0, public domain, CC BY 2.0/3.0/4.0, CC BY-SA (permitting commercial adaptation), or Unsplash/Pexels. Prefer no identifiable human face in frame (hand/action shots are fine); avoid stock photos with a recognisable face front and centre.
- Tools (downloads need an explicit go-ahead per batch): `production-batches/2026-09-19_26/commons_search.py "<term or Category:...>"` lists Commons candidates with licence metadata (no downloads); `fetch_photo.py "<File:Name.jpg>" <slug> [max_width]` downloads (resized, default max width 2400) to `hidden-everyday-systems/assets/thumbnail-photos/<slug>.jpg` and records the provenance. Never edit `provenance.json` by hand from a topic task (the lead records it).
- Provenance record (`assets/thumbnail-photos/provenance.json`, keyed by slug): `file, title, artist, license, license_url, source_page, source_url, sha256, downloaded_bytes, stored_size ("WxH"), changes, generated:false`. `Package.thumbnail(photo=True)` reads it; the file's sha256 is verified when staged (`stage_thumbnail_photo`); a hash mismatch means re-record provenance, not hand-edit.
- Always view the full-resolution photo before placing/cropping; do not guess. Do not use candidates just because they downloaded: the Sep 13-18 batch rejected a gate mistaken for a door closer, a zipper illustration, and a lock image whose photographic provenance was uncertain.
- Credits: record the credited author (a separate Attribution field when Artist is empty), source page, licence/version/link and changes; carry them in both descriptions and `THUMBNAIL_LICENSE.txt` (written by `thumbnail_license_text`; the scheduler delivers it). A CC BY-SA photo's adapted thumbnail is offered under the same licence (this is a note about the adapted thumbnail, not about the whole video). Photographer name for Unsplash/Pexels is read from the `source_page` (view only).
- Remastered topics reused licensed photos already stored locally (no new download).

## 6. Style research behind the decisions (2026-10-04; research only, owner decided 2026-10-05)

Observed (high confidence unless noted): Zack D. Films Shorts captions are lowercase white with a thin dark outline and a soft shadow, 1-3-word chunks, centred ~75-78% of the frame height, no coloured word (pop-in animation reported by a secondary source); ZDF long-form thumbnails: 6 of 9 had no text, otherwise 2-3 words that complement rather than repeat the title; Kurzgesagt: 2-word caps hooks that are not the title on saturated neon; Jared Owen: the object name 1-2 words with a zoom inset and red arrows; Branch Education: contrast or keyword-huge questions. Common to all: none prints the full title; one hero object; saturated colour. Best-practice sources (secondary): glance test, <5 words, 3+ competing elements lower CTR (percentages not well sourced). The owner chose the shortened-question text over the 2-3-word teaser hook, kept the dark real-photo + x-ray port composition, and ruled out orange text and Arial captions because the cream/navy/orange triad reads as Claude's brand. Fonts: Montserrat Bold (captions) and Black (thumbnails), SIL OFL 1.1; avoid Inter ("the default AI-app UI font") and Impact (reads as meme).

## 7. Upload settings and platform policy

- Studio per-video defaults used by the live uploader: category Education, "not made for kids", playlist **"Life's Questions Answered"** (long only), schedule at the slot time in `Africa/Casablanca`, Short gets a best-effort related-video link back to the long, title/description/tags from the delivered `output/<slug>/` files. See `operations.md`.
- Channel-level settings (once): channel keywords and upload defaults (default description + tags) matter for recommending a new channel; content lives in `uploader/src/channelSettingsContent.js`, applied by `node src/cli.js channel-settings [--rehearse]` (never exercised against a live session during development: rehearse first).
- Branding: avatar = midnight-navy/coral badge approved 2026-09-04; banner safe area 1546x423 centred in 2560x1440 (see `architecture.md`, legacy tools).
- Platform policy (YouTube): channel-level monetisation evaluates originality and "mass-produced / repetitive" character; tool-assisted educational work with materially varied substance is compatible, generic templated AI slideshows are not. Make authorship and research visible (sources, scope note). Complete the Studio altered/synthetic-content disclosure truthfully at publish time (non-realistic animation is treated differently from realistic synthetic media; follow the current Studio wording). No fake engagement of any kind. Never clone a real person's voice or imply endorsement.
- Publishing is the owner's act: never upload, schedule on YouTube or change channel settings without explicit authorisation in that turn.

## 8. Legacy (v1/v2) thumbnail policy, for old packages only

`thumbnail.png` = Remotion illustrated thumbnail (stickman/scenario style, later the causal-v2 scene renderer); `thumbnail2.png` = a real, unedited photograph with the "Mark Rober Clean Science Pop" treatment (bold white Anton headline with a black stroke only, short question-led hook, dark bottom-third gradient scrim, small Oswald subline) from `generate_real_photo_thumbnails.py` (TOPICS entry with photo filename, a 16:9 crop box chosen after viewing the full-res photo, a unique headline, a one-line sub; photo saved to `output/ab-thumbnails/real-photos/<slug>.jpg` with a line in that folder's `PROVENANCE.md`). The v3 pipeline replaced this: v3 `thumbnail2` is the dark-plate variant. The mandatory-pair rule and the "scheduling fails without thumbnail2" enforcement carried over.
