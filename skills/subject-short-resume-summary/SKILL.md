---
name: "subject-short-resume-summary"
description: "Builds a short, visual, beginner-friendly PDF résumé of a whole course (concepts ordered by lesson, then general to granular, with syntax breakdowns). Use for a subject summary or quick-memorise sheet."
---

# Subject short résumé (beginner / ADHD-friendly)

Turns a student's course material into ONE compact PDF (target 9–10 A4 pages, never a full guide) that covers every concept of the subject from A to Z, so a person who knows nothing and has ADHD can understand and memorise it fast, yet it is deep enough to answer quiz and technical questions.

Not for: full revision guides with every exercise corrected, mock exams, cheat sheets for open-book exams, flashcards-only requests (offer those as a next step instead).

## 1. Gather the material first (silently, before writing)
- Read the attached Project docs / uploaded files: lecture slides, lab sheets (TP/TD), source code and notebooks, past guides. Use `project_read` / `project_search` for Project files, not the local disk.
- List the lessons in the course's own order (for example MPI, then CUDA, then Quantum). Keep that order. Within each lesson note: the lectures, the labs, the code files, the exam-style questions.
- Do not write from memory: take formulas, code, example numbers and outputs from the course files, and say in the final message that the content is derived from them.

## 2. Content rules (what the user asked for)
1. **Order**: by lesson, in course order. Inside each lesson order concepts from the MOST impactful and general to the most technical and granular. The first thing a reader meets in a lesson is the big picture; the last is the fine print.
2. **Chapter overview**: each lesson starts with one or two short paragraphs: what the chapter is about, why it matters, what must be known/able to do for the exam.
3. **Cover everything** in the subject (all lessons, all labs, all key code), but at résumé depth: enough to answer a quiz or a technical question; go deep only where the concept deserves length (hard or frequently asked ideas).
4. **Instructions and code**: for every important instruction or API call give a word-by-word syntax breakdown (each argument and what it means), and show how several instructions combine into a working program (typical order of calls, template program, which line does what). Include the classic errors and traps.
5. **Visuals** for every concept that is more than a definition: diagrams, flows, timelines, comparison figures, truth tables, worked pictures, charts. A picture beats a paragraph. Draw them yourself as inline SVG (no external images).
6. **Memorisation aids**: comparison tables, one-sentence summaries, a final memory card per lesson or at the end.

## 3. Beginner / ADHD rules (the audience knows NOTHING)
Write for someone who has never seen the subject, not for someone refreshing what they forgot.
- **Every concept follows the same pattern**: plain-words sentence → real-life analogy (kitchen, school, post office, noise-cancelling headphones...) → picture → code or formula → trap.
- **Define each term at first use**, in everyday words. Add a small "words you must know" glossary at the start of each lesson.
- **Short chunks**: one idea per box, short sentences, no walls of text. Use colour-coded callout boxes with a fixed label: IN ONE SENTENCE (yellow), ANALOGY (blue), REMEMBER / WORKED EXAMPLE (green), TRAP / CLASSIC ERRORS (red).
- **Worked examples with real numbers** instead of bare formulas; numbered step lists (circles 1, 2, 3...) for any process.
- Clear page banner per page ("MPI · 3 — topic"), consistent colour per lesson, generous white space and bigger body text (about 9 pt) rather than cramming.
- If the user does not state the audience, assume this beginner audience.

## 4. Format and build pipeline
Default deliverable: a PDF file (the user cares about page count). Use a Docs/Artifact type only if the user asks for an editable document.

Pipeline that worked (HTML + inline SVG, printed to PDF with headless Chrome):
1. `figs.py`: SVG helper functions (rect, text, line, circle, arrow) and one function per figure.
2. `content.py`: one plain Python string per page with `[[figure_name]]` tokens replaced by the figure HTML (do NOT use f-strings for the page bodies: braces in code and CSS break them). Code snippets are plain strings with `<b>` highlighting and `<i>` comments; escape `<`, `>`, `&` as `&lt; &gt; &amp;`.
3. `make.py`: CSS (A4 pages, 2 columns, page banner, footer with page number, `table.t`, callout classes, `pre.code` dark block) and assembly into `resume.html`.
4. Print: `google-chrome --headless=new --no-sandbox --disable-gpu --no-pdf-header-footer --print-to-pdf=resume.pdf resume.html`, then `pdftoppm -r 100 -png resume.pdf png/p`.
5. Overflow check: load a copy of the HTML with a small script that sets `document.title` to each page's content bottom/right and `scrollWidth` vs `clientWidth` of the columns; dump it with `--dump-dom`. Any `scrollWidth > clientWidth` means a hidden extra column or wide table: fix it. Check the page count with `pdfinfo`.

Building rules learned the hard way:
- Page-per-section with explicit pages; budget the page count up front (for example 5 pages first lesson, 2 second, 3 third, last page carries the memory card). If pages end half empty, ADD visuals or worked examples rather than shrinking; if overfull, cut the least important detail.
- Keep code lines at about 55 characters or fewer at 7.4 pt in a two-column layout; shorten comments and split calls over lines instead of letting them wrap.
- Long unbreakable code tokens in narrow table cells overflow: use `white-space:nowrap` for short ones, `word-break:break-all` only for dense memory-card tables, or drop a column.
- Keep SVG text inside its box: shorten labels, widen the viewBox, never trust a figure until you have looked at it.
- Log axis for charts that span orders of magnitude (Amdahl-style curves).
- Always `Read` every page PNG (zoom with `pdftoppm -x -y -W -H` on suspect areas), fix clipping, overlaps, wrapped captions, and mis-scaled figures, then rebuild and re-check. Do not deliver an unreviewed page.
- When patching generated files with string replacement, assert the old text exists and never replace an empty string.

## 5. Workflow
1. One sentence to the user saying what you are about to build, then a task list (read sources, build, render + check).
2. Gather material, draft pages, render, review every page visually, fix, re-render.
3. Final check: facts against the course files (formulas, example numbers, code), arithmetic of worked examples, page count within target, no overflow.
4. Deliver with `SendUserFile` (status normal, display render). Final message in 3–4 short lines: page count and which pages cover which lesson, the main features (analogies, visuals, syntax breakdowns), any deviation (for example one page over the target and why), and one next step (printable flashcards or quiz version).

Do not ask clarifying questions before starting when the course files are available; the request is already specified by this skill. Ask only if no course material can be found.