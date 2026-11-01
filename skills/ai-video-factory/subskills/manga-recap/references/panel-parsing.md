# Page rasterization, panel extraction and reading order

Compiled 2026-11-01 from V7-REQ-4.x, v7 `design.md` §4 (RD-107), `manga_panel_parser.py`, `schemas.py`, `test_v7_4_manga_panel_parser.py`,
`test_manga_recap_pipeline_integration.py`. In the archived engine a **vision-capable model** (`panel-parser` routing stage) did this;
here **you (the agent) are that stage**: file hand-off packets, no model API ([agent-principles.md](../../../references/agent-principles.md) §1).
Items marked *proposal* are this skill's additions, not archived behaviour.

## 1. Why a model reads the pages (RD-107)

Manga layouts (full-page splashes, 2-up, 4-way splits, asymmetric grids, overlapping and borderless panels) are too irregular for a hand-built
computer-vision segmenter to be reliable, and the pipeline's house pattern is "deterministic checks where cheap, model judgement where a bespoke
algorithm would be brittle". The archived engine therefore rasterized with **PyMuPDF** (`fitz`; no external Poppler binary) and cropped with **Pillow**.

## 2. Procedure

1. **Gate first:** `RIGHTS.json.status == "verified"` (V7-INV-1). No raster before that.
2. **Rasterize** every page at **200 DPI** to `page_0001.png`... (1-based). Why 200: a cropped panel still reads cleanly, and a typical page does not become an unreasonable PNG/base64 payload. A 600x800 pt PDF page becomes about 1667x2222 px.
   ```python
   import fitz  # PyMuPDF
   with fitz.open(pdf) as doc:
       for i, page in enumerate(doc, start=1):
           page.get_pixmap(dpi=200).save(f"pages/page_{i:04d}.png")
   ```
3. **Read each page image** (you can open images) and write `analysis/page_NNNN.json` in the schema below. One page per packet keeps context small and errors local.
4. **Validate** the file against the rules in section 4; only a valid file advances (a file that fails waits for a fix).
5. **Crop** each region to `panels/doc<id>_p<page>_<pos>.png` (math in section 5) and append rows to `panels.json` (schema in [data-model.md](data-model.md) §2).
6. **Spot-check** (section 6), then hand the ordered panel list to scriptwriting ([script-and-narration.md](script-and-narration.md)).

## 3. The parse instruction, as a method

The archived hardcoded `PANEL_PARSE_PROMPT` asked, per page image, for every distinct panel **in natural reading order** (top to bottom; **right-to-left within a row for a typical manga layout unless the page clearly reads left-to-right**) and, for each:

- `panel_position`: 1-based reading-order index on this page;
- `image_region`: bounding box as **fractions of the full page image** in [0,1]: `x`,`y` = top-left corner, `width`,`height`; `x+width` and `y+height` must not meaningfully exceed 1;
- `dialogue_text`: every speech bubble / caption box in the panel, concatenated in reading order; **`""` for a panel with no text, never null or omitted**;
- `visual_description`: one or two plain sentences of what is visually happening (characters, action, setting) - enough for someone who cannot see the image to narrate over it;
- the page has at least one panel; `panels` is never empty. Strict JSON only, no prose, no code fence.

System persona: "a precise manga page layout analyzer" that outputs only the schema. Equivalent file shape:

```json
{ "page": 1, "reading_direction": "rtl",
  "panels": [ { "panel_position": 1,
                "image_region": {"x": 0.0, "y": 0.0, "width": 0.5, "height": 0.5},
                "dialogue_text": "", "visual_description": "...",
                "sfx_text": "", "notes": "" } ] }
```
`reading_direction`, `sfx_text` and `notes` are *proposals* (the archived schema has no per-document reading direction and no separate sound-effect field).

## 4. Schema bounds and the validation to run on your own output

Archived pydantic: `PanelRegion{x: 0..1, y: 0..1, width: >0..1, height: >0..1}`, `PanelParseEntry{panel_position >= 1, image_region, dialogue_text, visual_description}`, `PanelParseOutput{panels: min_length 1}`. An empty `panels` list is rejected (tested). Code **clamps** crops into the page (`left/top` clamped to [0,W]/[0,H], `right >= left`, `bottom >= top`) rather than rejecting x+width > 1.
Additional checks this skill recommends before cropping (*proposal*; all cheap, none exists in the archive):

- `panel_position` values are 1..n with no gaps or duplicates on the page;
- `x+width <= 1.02` and `y+height <= 1.02` (small slack for borderless art); anything larger is a mis-measured box, fix it;
- box area >= ~2% of the page (smaller usually means a bubble or SFX was boxed as a panel) unless the panel is a deliberate inset;
- the union of boxes covers most of the non-blank page and boxes barely overlap (a panel intentionally overlapped by an inset is noted in `notes`);
- reading order is consistent with `reading_direction` (rtl: rows top->bottom, each row right->left);
- every panel with visible text has non-empty `dialogue_text`; a wordless panel is `""`.

## 5. Crop math (copy this exactly; it is what the tests pin)

```
left   = clamp(round(x * W), 0, W)            top    = clamp(round(y * H), 0, H)
right  = clamp(round((x+width) * W), left, W) bottom = clamp(round((y+height) * H), top, H)
panel  = page.crop((left, top, right, bottom)); save PNG as doc<document_id>_p<page>_<position>.png
```
Lossless PNG: the crop is the asset every downstream consumer reads; it is never re-cropped on demand. `image_region` is kept so you can **re-crop from a
higher-DPI raster later** (e.g. when a panel will be shown larger than its pixels support; section 7).

## 6. Accuracy: spot-check, not a gate (V7-REQ-4.4) - and why you should still look

Spec decision: panel extraction gets **no dedicated blocking review step**; a misextracted panel is expected to surface when narration is written against it (fact-check
grounding flags drift) or when a screen/render is reviewed ("wrong upstream data becomes visible downstream"). An automated confidence-scoring/QA pass is an explicit non-goal.
That decision assumed a human reviewer would see the images. Because you read the images yourself, add this inexpensive *proposal*:

- After cropping, build one **contact sheet per page** (crops in order with their `panel_position` numbers) and check it against the page: right region, right order, nothing clipped mid-bubble, no panel missing.
- For every panel you will actually use, confirm `dialogue_text` against the image (names, honorifics, numbers, quoted terms) and that `visual_description` states only what is visible.
- Record the check: `panels.json` -> `"checked": true|false`, and list uncertain panels in the packet so Gate 1 review knows where to look.

Errors found here are cheap; errors found after TTS cost a re-synthesis.

## 7. Resolution, upscaling and re-rasterizing

The foreground layer scales a panel to 65-80% of the frame **width** ([composition-transitions-export.md](composition-transitions-export.md) §1). On a 1920-px frame that is 1248-1536 px of display width.
*Proposal gate:* compute `upscale = display_width / crop_width`; if `> ~1.5` re-rasterize that page at 300-400 DPI and re-crop from the stored `image_region`; if the source PDF's embedded image is itself low-resolution, no DPI helps - drop the panel or accept it consciously. Never use AI upscaling/sharpening on panels (it invents detail the artist did not draw and breaks the fact-check premise that the image is the ground truth).

## 8. Reading order and format cases

| Case | Archived behaviour | What to do |
|---|---|---|
| Japanese manga (paged, RTL) | the prompt's default (rows top->bottom, right->left) | use it; verify on pages with irregular layouts |
| Korean/Chinese/Western LTR paged comics | the prompt allows LTR "if the page clearly reads left-to-right", but there is no per-document setting | set `reading_direction` per document (*proposal*) and say so in every packet |
| **Webtoon / manhwa as a vertical scroll strip** | **not supported.** Input is a PDF; a long strip exported as one tall page or split at arbitrary heights has no panel model, and a fixed-height split cuts panels in half | *proposal:* slice strips at horizontal whitespace gutters (not at fixed heights), treat each slice as a "page", panels = the art blocks between gutters, order strictly top->bottom, and keep a `slice_id` in the ledger |
| Full-page splash / double-page spread | one panel with a box of ~the whole page; a spread rasterized as two pages is two pages | keep a spread as one panel by cropping from both pages and stitching (*proposal*); mark `notes: "spread"` |
| Wordless panel | `dialogue_text: ""`, description carries it | narration may breathe over it; never invent dialogue |
| Sound-effect lettering | not distinguished from dialogue | put it in `sfx_text` (*proposal*); do not narrate it as speech |
| Text in another language | transcribed as written; **no translation layer** (non-goal) | narration language = source language unless the owner decides otherwise; flag any licence that excludes translation |
| Narration boxes / thought bubbles | concatenated with dialogue | tag the kind in `notes` when it matters for who is speaking |
| Inset or overlapping panels | one box each, order by reading flow | note the overlap |

## 9. Failure behaviour of the archived parser (and what to mirror)

- Rasterize and crop errors, vision-model errors and JSON-validation errors all land in `parse_error` (<= 2000 chars, keys redacted) while the document stays `verified`; the savepoint rolls back partial panels; **there is no retry**. Mirror it: a failed page leaves a clear marker, never a half-built `panels.json` presented as complete.
- `DuplicateMangaUploadError` (same PDF bytes already ingested) arrives through the same path.
- Scratch rasters live under the data directory, not the OS temp dir (audit-remediation Req 2, so volume backups capture everything). Rasters are throwaway; keep them while a chapter is in progress so you can re-crop.
- Parsing was synchronous in the upload request, with the whole document's pages looped in one call. For a long chapter work page by page and save after each page (resumable, per the repo's "resumable over clever" rule).
