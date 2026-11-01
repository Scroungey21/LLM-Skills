---
name: "subject-full-guide"
description: "Builds a complete exam-prep pack from a student's lectures, TDs/TPs and other course documents - a Full Revision Guide (everything to know, every exercise corrected and explained) plus a full Mock Final Exam with its complete correction - delivered as one LaTeX-based PDF. First asks the student what the guide and the exam must contain. Use when the student asks for a Full Guide, full revision guide, complete study guide, mock exam, mock final exam, \"everything I need to know\", or to be fully ready for an exam from their documents. Not for a short summary, cheat sheet, flashcards, a single quiz or a mind map."
---

# Full Revision Guide and Mock Final Exam (LaTeX, delivered as PDF)

The student gives you the documents of a subject (lectures, TDs, TPs, past papers, notes). You return **one printable document, written in LaTeX and delivered as a PDF**, that makes them fully ready for their real exam. It has two halves that must stay consistent:

1. a **Full Revision Guide**: everything that has to be known and understood to answer the exam comfortably, every concept demonstrated or merely mentioned, with the correction and explanation of every exercise of the documents;
2. a **Mock Final Exam** with its **complete correction**: enough different forms of exercise to cover every kind of question the professor could set, on every concept and every situation.

The value is completeness plus accuracy. A missing concept leaves a hole the student will not notice, and an invented fact will be learned as true. No compromise on either: do not shorten, skip chapters, or replace content with "see the document". The result is a finished document, not tutoring: once the intake below is done, produce it in full, even if a tutoring or Socratic mode is active.

## Step 0 - Ask the student first

Before reading in depth or writing anything, ask the student about every aspect of the pack that the request has not already settled. Ask once, in one batch, with a default for each question so that "defaults" is a complete answer. Skip what the student has already said (for example in a master prompt that describes the exam), never ask the same thing twice, and keep each question short and concrete.

Use the question mechanism of the environment: a structured question tool (for example AskUserQuestion, up to four questions per call, options plus free text) when there is one; otherwise a single fenced block labelled `question` as the very last thing of the reply, with 2 to 5 short, concrete options per question and free text allowed; otherwise a numbered list in plain text. In an unattended run, take the defaults, say at the top of the pack which ones were taken, and carry on.

Questions to cover (group them to fit the tool's limit, most important first):

1. **Scope.** Which documents and chapters are in the exam? Are TDs/TPs only practice, or also examined? Is anything excluded (for example "nothing from the TPs")? Default: everything attached, TDs/TPs read but not tested if the student says the exam is about the lectures.
2. **How the exam will go.** What did the professor say or what do they expect: question types (QCM, true/false, fill in, open questions, calculations, proofs, traces, code or commands, case studies, situation-based exercises, other), how many questions or parts, weighting or scale, duration, open or closed book, calculator or documents allowed, written or oral, language, anything else the professor stated or promised. Default: infer it from past papers, then from the TD/TP exercise forms, and state the inference.
3. **The mock exam.** How long and how many questions, how hard, one paper or several, which exercise forms must appear, whether to mirror a past paper's structure. Default: one paper whose length and weighting match the described exam, every exercise form of the brief or of the documents present.
4. **The guide.** Depth (everything vs focused on the exam), whether to include a correction with explanations for every exercise of the documents (default yes), a section of solving strategies per exercise type (default yes), a quick reference (default yes), common confusions (default yes), language (default: the documents' language), layout wishes (page size, print-friendly, anything else).
5. **Anything else** the student wants in or out of the pack.

When there is no document and no topic at all, ask which subject and suggest attaching the course documents.

## Inputs

1. **Read everything**, front to back, noting page or slide numbers. Use whatever is available: attached files, files on disk, pasted text, a connected document tool. Never write from the opening pages only. If a file cannot be read, say so and name it; never guess its content.
2. **Exclusions** from the answers of Step 0: an excluded source is still read, since it may explain a concept, but nothing from it is tested, and it appears in the guide only as far as the student allowed.
3. **Document order and overlaps.** Follow the documents' own order and chapter titles. When two documents repeat the same content, teach it once where it first appears, point back in the later place, and say in one line under the title what was merged.
4. **If the student names only a topic**, write from reliable knowledge and from search results if a search tool is available; state in one line under the title that it comes from general knowledge, not from their course, and say plainly where you are unsure.

## Part 1 - Full Revision Guide

One `\section` per chapter or document, in the documents' order, with only the subsections the material supports.

- **Overview** of 2 to 3 sentences per chapter.
- **Definitions**, stated as the document states them, in a `quote` block.
- **Theorems, formulas, rules**, in math mode, with their conditions of validity.
- **Procedures and algorithms** as a numbered `enumerate`, steps in the document's order.
- **Worked examples** the documents give, reduced to the method, with their numbers copied exactly.
- **Comparisons** as a real `tabular` whenever the document compares items.
- **Mentioned-only concepts.** Every term, name, number, date, tool or idea that the documents mention, even in passing, appears with exactly what the documents say about it, flagged "mentioned, not developed" when that is the case. The exam may ask about anything that was demonstrated or mentioned.
- **Common confusions**: pairs of neighbouring ideas that students swap, with the distinguishing rule.
- **Correction of every exercise of the documents** (lectures, TDs, TPs, review questions, warm-ups, worked cases), right after the exercise statement or in a clearly named corrections block of the same chapter, unless the student asked otherwise. For each exercise give the final answer, the step-by-step reasoning, and why each wrong alternative or common error fails. When the document supplies a solution, reproduce its answer and add the explanation. When it supplies none, derive the answer only from the documents' content and label it "Correction derived from the course (the document gives no answer key)". Never leave an exercise without its correction, and never wait to be asked for it.
- **Exercise-solving strategies**, in a section after the chapters: group by type of problem (for example multiple choice, open question, proof, computation, trace, code, design, case study, scenario); for each, give a name, numbered steps, and when it applies, general enough to reuse on new exercises.
- **Quick Reference** at the end of the guide: a table of the formulas, key terms, numbers and commands collected from the sections above.

## Part 2 - Mock Final Exam

### Coverage matrix first

Before writing a question, list two inventories from the documents:

- **Concepts and skills**: every concept, definition, formula, procedure, tool, numerical value, pitfall and skill (recall, compute, trace, write, read, justify, compare, design, diagnose) of the guide.
- **Exercise forms** that appear in the documents or that the exam description names or implies. Think broadly and include every form that could be set on this subject: single-choice and multiple-select questions, true/false with justification, fill in the blank, matching, ordering, definition and short answer, open explanation or comparison, calculation with units, proof or derivation, trace of an algorithm or execution, reading and interpreting an output, table or diagram, writing a query, code or command, finding and fixing an error, completing partial code, design or modelling from a scenario, choosing among options and justifying the choice, case study with linked questions, critique of a given solution, and any form specific to the subject.

Build a matrix of concepts against forms and make sure that **every concept is tested at least once**, that **every form of exercise appears at least once**, and that the chapters the student described as heavy receive proportionally more questions. Keep it in the document as a short "Coverage" table (chapter or concept against question numbers), so the student can see nothing was left out. If the student excluded a form or a source, the mock exam contains none of it.

### The exam paper

- Header: subject, duration, total points, allowed material, instructions, taken from the student's description (or marked as inferred).
- Sections by form or by chapter, as described; the real exam's structure when a past paper gives it. Situation-based exercises are real scenarios with context, data and several linked questions, not one-line prompts.
- Each question states its points; points add up to the total; duration is realistic for the volume.
- A spread of difficulty: recall, understanding, application, and several questions that combine chapters, the way a final exam does.
- New wording and new numbers: do not copy the documents' exercises, vary them. Facts in a question must still be true to the documents.
- Enough questions of each form for the form to be genuinely practised, and the exam must be answerable from the guide alone.

### The complete correction

For every question, in the same order and numbering: the correct answer; why it is right, in the guide's terms; for multiple choice, why each wrong option is wrong; for open questions, a marking scheme with the points split by element and a model answer in full sentences; the usual mistakes and what they cost; and a pointer to the guide section and the source slide or page. Computed values are shown step by step and code answers are given in full.

## Rules for all parts

- **Ground everything in the documents.** Use only what they contain. If outside knowledge is genuinely needed, mark it (`\textit{Beyond the documents: ...}`) and keep it rare. Write "the documents do not specify ..." instead of filling a gap with something plausible.
- **Authored content is labelled.** Mock exam questions, derived corrections, analogies and invented numbers are ours, not the professor's: say so once at the start of each part and label every derived correction.
- **Copy facts exactly.** Numbers, formulas, names, dates, commands and units are transcribed, never rounded or approximated; use the field's standard terms.
- **Plain tone.** State facts the way the documents state them. No self-justifying register, no padding; drop repetition, never content.
- **Language.** The language of the source documents (or the one the student chose), titles and table of contents included; keep the original term with a short gloss when no standard equivalent exists.
- **Citations** as plain text after the fact, for example (Lecture 3, slide 9), (TD 2, exercise 4) or (p. 12). Never `\cite`.

## Output: a LaTeX document compiled to PDF

The deliverable is **one PDF**, compiled from **one LaTeX file** (also delivered), containing in this order: title page and contents, the guide chapters, the strategies, the quick reference, the mock exam paper, the coverage table, and the complete correction. Not Markdown, not HTML, not a code dump: the student receives and prints the PDF.

How to produce it, by environment:

- **With a shell and files:** write the `.tex`, compile it with whatever engine is installed (xelatex, pdflatex or tectonic; run twice for the contents), fix every error, open the PDF or its page images to check layout (tables not overflowing, no broken characters, sensible page breaks), and deliver both the PDF and the `.tex`. If no engine can be installed, deliver the `.tex` and say it compiles on overleaf.com. Build a long pack in stages, one chapter at a time, appending to the file.
- **In a chat that renders LaTeX itself:** emit exactly one fenced block labelled `latex` containing the complete file from `\documentclass{article}` to `\end{document}`, and put `[ARTIFACT_COMPLETE]` on its own line immediately after the closing fence. At most one short sentence before the block and one line after it.

Write in the LaTeX subset that compiles both in such a chat renderer and with a normal engine:

- Structure: `\title \author \date \maketitle \tableofcontents`, then `\section \subsection \subsubsection \paragraph` (starred forms too), `\newpage` before each major part.
- Text: `\textbf \textit \emph \underline \texttt`; size switches take an argument, for example `\large{...}`.
- Lists and tables: `itemize` and `enumerate` (nestable); `tabular` with `&`, `\\` and `\hline` (or `\toprule \midrule \bottomrule`), the same number of cells in every row. Always a real table for tabular data.
- Math: `$...$`, `\[...\]`, `equation`, `align`, `gather`; the usual commands (`\frac \sqrt \leq \neq \to \in \sum \int \gcd \log \max \bmod`).
- Other: `quote` and `quotation`; `verbatim` for code, commands and exact whitespace.
- Escape `% & _ # $ { }` in text. Use math mode for arrows and comparison signs rather than raw Unicode symbols.
- Avoid `\cite \ref \includegraphics`, `figure`, `\newcommand` and custom macros: they are stripped by the renderer. `\usepackage \geometry \hypersetup \pagestyle` are ignored there, so skip them; when you compile yourself, add what you need (amsmath, booktabs, geometry, utf8 input) to a build copy only.

If the pack cannot fit in one reply of a chat renderer, split it into complete parts titled "... - Part k of N" in this order: guide chapters, strategies and quick reference, mock exam paper, correction; say what each part holds and continue when the student asks. Never shrink or silently cut chapters to fit, and never leave the correction out to save space.

## Final check before sending

- The intake was done and every answer of the student is reflected (scope, exclusions, exam shape, durations, weights, language, layout).
- Every chapter and every exercise of every document is represented, and every exercise has its correction with explanations.
- Every number, formula, name and date was re-checked against the source.
- Every concept of the guide is in the coverage table, every exercise form appears in the exam, points add up, and every exam question has a complete correction with the same numbering.
- Authored and derived material is labelled; nothing is invented and presented as the documents' content.
- The LaTeX compiles without errors, every environment is closed, no stripped macro is used, tables have consistent cell counts, the PDF was opened and looks right, and the whole pack is in one language.