---
name: exam-answer-guide
description: Builds a dense, printable open-book exam answer guide (cheat sheet) from course documents and past papers, modelled on how the professor designs exams. Use for an answer guide, cheat sheet, formula sheet or "everything I can bring to the exam".
---

# Exam Answer Guide: a dense, printable, open-book companion (LaTeX → PDF)

The student gives you the documents of a subject (lectures, labs/TDs/TPs, past papers, challenges, project statements, notes) and, ideally, a past exam. You return **one printable PDF, built from LaTeX**, that they bring into an open-book exam (or revise from for a closed-book one). It is not a textbook and not a mock exam. It is a **lookup tool**: every concept, formula, instruction and answer pattern the exam can require, arranged so it can be found in seconds and applied to a question the student has never seen.

The guide has two phases, always in this order:

1. **Phase 1, KNOW (informational).**
   - Summaries and definitions first, including every concept *variation* (for example SISD/SIMD/MISD/MIMD), each with situational examples.
   - Then formulas and calculations, each with when to use it.
   - Then the references for the instructions and libraries of every language or tool in the course: syntax, how it works technically, when to use it, mistakes to avoid. Each library also gets its role and contents.
2. **Phase 2, DO (adaptive).**
   - A method for each exercise type.
   - **Modular building blocks** that snap together into a full solution ("block a + block b solves problem ab"), with a recipe table.
   - Full algorithms, with what to change for each variant.
   - **Solved exercises written the way this professor writes them**: variants of the past exam's questions and of the course's exercises.

The goal is to be ready for anything the professor can set. So the guide is shaped by a **model of the professor**: what they reuse, where they hide the marks, which forms they repeat.

## The answer chain (the student's reasoning process, used everywhere)

The student solves every question with this chain, and the guide must teach it, show it and support it:

1. **Read.** Read the question and spot its key words: the verb ("differentiate", "complete", "compute the average", "propose"), the numbers, the shape of the data, the points (0.25 pt = one sentence per side).
2. **Link.** Link those key words to a specific concept, rule, formula, lecture figure, lab program, previous exercise or experience. *Which page of this guide holds it?*
3. **Adapt.** Adapt that knowledge to this exercise: rename the variables, change sizes and counts, choose the variant (another operator, uneven split, a different layout).
4. **Iterate.** Think and check: run a tiny case ($p=4$, $n=8$), check units and orders of magnitude, compare the alternatives, look for the known trap; correct and repeat.
5. **Write.** Write the answer that earns the marks: the precise sentence, the code line or the number with its justification.

How the guide supports each step:

- **Read:** the lookup table on page 1 maps key words and question forms to sections.
- **Link:** Phase 1 is organised so each key word leads to exactly one entry.
- **Adapt:** Phase 2's recipe tables and "what to change for variants" lists exist for this step.
- **Iterate:** every block carries a test note and every formula a worked example and a trap.
- **Write:** model answers and model sentences.

Every solved exercise in Phase 2 shows the five steps explicitly, even in compressed form. Each step gets one or two lines, labelled **R / L / A / I / W** (or Read / Link / Adapt / Iterate / Write) on their own lines. The method section opens with the chain and with one fully worked example of it.

## Step 0: Ask the student first (one batch, defaults included)

Before reading in depth or writing anything, ask once about everything the request has not already settled. Give every question a default, so that "defaults" is a complete answer. Skip anything already answered, and never ask twice. Use the environment's question tool (for example AskUserQuestion, up to 4 questions per call, options plus free text). If there is none, use a numbered list. In an unattended run, take the defaults, state them at the top of the guide and carry on.

Cover, most important first:

1. **The exam itself.**
   - Open or closed book, and what material is allowed (printed guide, calculator, laptop).
   - Duration and total points.
   - The structure: exercises, points per exercise, and the course outcomes or learning objectives if the professor labels them.
   - Question forms: definitions, "differentiate A and B", name or identify from a figure, complete the code (blanks), write code, trace, calculations, graph/diagram analysis, case study, QCM, true/false, other.
   - Language.
   - Default: inferred from the past papers, then from the challenges and labs; the inference is stated in the guide.
2. **Past papers and the professor.** Is there a past exam (attach photos or PDFs, even incomplete)? Did the professor announce anything: topics, "same format as…", examined languages or tools? Default: model the professor from the documents (see Step 2).
3. **Scope.** Which documents and chapters count. Are labs, projects and challenges examined or only practice? Anything excluded? Are there topics that appear in the exam but not in the course files (an extra language, a textbook chapter)? Default: everything attached, plus every topic the past paper shows, flagged as beyond the documents.
4. **Format of the guide.**
   - Page budget. Default: aim for 30 pages or fewer; never exceed 50.
   - Paper size and print style. Default: A4 portrait, two columns, about 8 pt body text and at least 6.5 pt code, printer-friendly colours.
   - Language of the guide.
   - Whether to also produce full-length mock papers. Default: no, only solved exercises inside the guide. Mock exams with full corrections are the `subject-full-guide` skill's job.
5. **Anything else** in or out (for example "add a C library section", "no UPC").

If there are no documents at all, ask for the subject and suggest attaching the course files and the past exam.

## Step 1: Read everything

- Read every document front to back, noting slide or page numbers. Use whatever is available: uploads, files on disk, a project knowledge base, connectors.
- Look at past-exam photos yourself. Transcribe them, including figures (grids, matrices, graphs: read coordinates carefully and check them with internal consistency, such as symmetry or a value the statement gives).
- If a page is missing, reconstruct it only from what the surrounding pages imply, and mark it `[reconstructed]`.
- Never guess an unreadable file. Name it and say it could not be read.
- If the past paper shows a topic absent from the course files (for example a third programming model), cover it from reliable knowledge and mark it `[beyond the course files: <source>]`.

## Step 2: Model the professor (this drives Phase 2)

Before writing, write down a short professor model:

- **Blueprint.** Exercises, points and outcome weights, the form of each exercise, the duration. Compare it with the challenges and labs: are the weights the same?
- **Sources reused.** Which textbook examples, lecture figures, lab programs and tutorial diagrams reappear in the exam (word for word, or with new numbers)?
- **Pairs.** Does the professor ask "differentiate A and B"? List every likely pair from the course and its twin.
- **Where the blanks go.** Note it for code-completion questions: output parameters, counts and sizes, loop bounds, the extra parameter of a helper, copy directions, affinities, index formulas…
- **Cost models and analysis habits.** For example unit cost per node + per edge, average time, critical path, speedup tables.
- **Likely next variants.** Same skeleton, next problem from the lab sequence, next figure from the lecture, the twin pair.

Use this model to choose the solved exercises and the order of the reference sections. Put a one-paragraph version of it in the guide's method section, so the student also learns what to expect.

## Step 3: Write Phase 1 (KNOW)

The order is fixed:

1. **Concepts and definitions.** One subsection per lecture or topic, in the documents' order.
   - Every term is an entry: **bold term**, then the definition as the document states it, a plain-words reading where needed, and one situational example ("how to recognise it").
   - **Variations and families** (every member of a taxonomy, every kind of decomposition, mapping, memory, model…) each get their own entry, with a situation showing when each one applies.
   - **Diagrams** wherever the exam uses pictures, for example data-movement grids for collective operations, small graphs or memory layouts. Draw every member of the family, in the exam's own drawing style.
   - **Pairs bank**: every likely "differentiate A and B" with a one-line answer, the criterion first, then each side, then an example.
2. **Formulas and calculations.** For each formula: the formula, what each variable means, **when to use it** (the context or keyword that calls for it), and a worked example with real numbers plus the classic trap. Group them: performance, communication or cost models, graph/analysis quantities, distribution and index arithmetic, complexities, domain formulas (crypto, DP recurrences…). Verify every worked number with a quick script.
3. **Instruction and library references**, one section per language, tool or library on the exam.
   - **Library entry**: its role, what it provides (types, constants, functions), how to compile and run, and when it is meant to be used.
   - **Instruction entry**: the exact signature on its own line, then **How:** (what it does technically), **Use:** (when, typical situation), **Avoid:** (classic mistakes). Each label starts a new line.
   - End each reference with a "classic errors / where the blanks hide" list.
   - Add a short reference for the base language's standard library if students may write custom code.

## Step 4: Write Phase 2 (DO)

1. **Method per exercise type.** The answer chain (Read → Link → Adapt → Iterate → Write), then a procedure for each exercise form in the blueprint, including a **blank-filling checklist** in the order the student should fill blanks.
2. **Building blocks** for each language. Start with a **recipe table**: problem → blocks to glue → what to change for variants. Then small, self-contained, tested blocks:
   - a skeleton;
   - distribution helpers, including uneven splits;
   - local kernels;
   - combine steps;
   - communication patterns;
   - timing;
   - error checking.
   Each block is a function or a short "glue" snippet with a comment saying what it does and when to use it.
3. **Full algorithms** for every project or challenge of the course, tested. After each one, add an adaptation list: **what to change for each likely variant** (another operator, another data layout, uneven sizes, the result needed by everyone, early termination…).
4. **Solved exercises in the exam's format.** These are not copies of the documents but variants built from the professor model:
   - every past-exam problem solved in every paradigm the exam uses, as the decisive lines for each blank;
   - look-alike drills for the identification questions;
   - worked analyses for every graph/analysis type (with numbers, tables and the better alternative);
   - number drills for every formula family;
   - "index or size from the given configuration" tables;
   - trace / predict the output / spot the bug items;
   - one model sentence for each kind of justification or report answer.

   Every solution follows the answer chain (R / L / A / I / W, one or two lines each). The **Link** line names the guide entry or block used. The **Iterate** line shows the small-case check or the trap avoided. Dense format, but always the path, never only the answer.

## Step 5: Test everything that can run

- Write every code block into real source files and compile and run them on small cases with known answers, including non-divisible sizes. Print a checkable value and quote the result in a note under the block (for example "Tested p = 3, 4: 499500").
- Without the hardware (for example GPU code without a GPU), write a tiny emulator header (threads per block via pthreads, barriers, atomics, a macro for the `<<<>>>` launch) or use a CPU backend, and say "tested on an emulator".
- Code you truly cannot run (no compiler available) is written to the language specification and labelled "per spec, untested".
- Recompute every number in the worked examples with a script.

## Readability rules (from the student's feedback: dense, never unreadable)

- **One entry per line.** Never chain several bold terms in one paragraph ("**A**: … **B**: … **C**: …"). Each concept, variation or sub-concept starts on its own line with a hanging indent. Sub-points become bullets or a numbered list under the entry. Long "x; y; z" lists of three or more become bullets.
- **Labels on their own lines:** How / Use / Avoid, Plan / Causes / Levers, MPI / UPC / CUDA in multi-paradigm answers.
- **Diagrams big enough.** Cells at least about 3.5 mm, labels about 5.5 pt, nothing touching. Lay families out two per row with the description beside each one, rather than squeezing three per row. Check the PNG render at 110 dpi or more before delivering.
- **Code at least about 6.5 pt as printed.** Collapse padding before end-of-line comments (runs of spaces → two spaces) so lines do not wrap. Long signatures go on their own line.
- **Tables inside columns cannot break.** Convert long two- or three-column tables that sit inside `multicols` into definition-list entries. Keep real tables for short grids (topology metrics, datatype maps) and for full-width tables outside the columns.
- Two columns (`multicols`) for text. Use `multicols*` (unbalanced) for code-heavy sections, because balancing many listings exhausts TeX memory.
- Ragged-right text (`ragged2e` `\RaggedRight`) so monospace fragments do not stretch lines.
- The first page has a coloured title strip plus a **lookup table**: question type → section to open.
- Number the sections with letters and the subsections A1, A2… so cross-references are short.

## LaTeX kit (XeLaTeX)

Bundled with this skill:

- `assets/preamble.tex`: the complete, proven preamble with every macro listed below. Copy it and change the colours, header text, listings keywords and code language.
- `scripts/extract_blocks.py`: turns `//@name … //@name_end` marked sources into `blocks/name.txt` files for `\lstinputlisting`.
- `scripts/cuda_emu2.h` + `scripts/emu2.py`: a pthread CUDA emulator for testing kernels without a GPU (`python3 emu2.py f.cu > f.cpp && g++ -std=c++17 -pthread -I. f.cpp`).

The kit:

- Class: `extarticle` at 8 pt, A4, margins of about 9 mm.
- Fonts: Carlito body, DejaVu Sans Mono at scale 0.86.
- Packages: listings, tcolorbox, enumitem, tabularx, multicol, tikz, ragged2e, titlesec, fancyhdr.

Macros to define:

- `\dl{term}{text}`: bold coloured term, hanging indent, own paragraph.
- `\dlx{term}{text}{example}`: the same, plus a muted ▷ *example*.
- `\fn{signature}` followed by `\how{} \use{} \bad{}`, each starting a new line.
- Boxes: `key`, `trap`, `ex` (solved exercise, green title).
- `\T{}` for inline code and `\nb{}` for test notes.
- Grid macros, for example `\cg{r/c/label,...}` (a TikZ 4×4 grid) and `\cop{before}{after}`.
- Code blocks: keep the tested sources in `code/` with markers `//@name` … `//@name_end`. Have a small Python script **extract each block to `code/blocks/name.txt`** and include it with `\lstinputlisting`. Do not rely on listings' `linerange` markers.

Compile twice. Fix every error and every overfull box. Render all pages to PNG and look at them. Check: no run-on paragraphs, diagrams legible, no empty half-pages, page budget respected.

## Ground rules

- Ground everything in the documents. Mark knowledge beyond them, and mark reconstructed parts.
- Copy facts, numbers and signatures exactly.
- Use the language of the documents (or the one the student chose).
- Authored solved exercises are labelled as variants, not as the professor's own questions.
- Keep the guide self-sufficient for the exam. Pointers to companion files (a full guide, mock papers) are optional extras.

## Delivery

- The PDF, the LaTeX and code sources (zipped), and a one-line note on what was tested and how.
- If the session has a project or knowledge store, save a short summary of the guide's structure there for future updates.
- Offer, in one line, to update the guide when a new past paper or new lecture arrives. To update: add the new material to Step 2's model, then extend the matching sections. Do not rewrite everything.

## Final check

- [ ] The intake answers are reflected (format, scope, page budget, language, extra topics).
- [ ] Phase 1 comes before Phase 2. Inside Phase 1: concepts → formulas → instructions/libraries.
- [ ] Every concept family is fully expanded, with situations. The pairs bank exists. The exam's pictures are drawn.
- [ ] Every formula has its when-to-use, a worked example and a trap, and the example was recomputed.
- [ ] Every instruction has its signature, How, Use and Avoid. Every library has its role and contents.
- [ ] The recipe table exists. Every block and algorithm was run (or is labelled), and each has its adaptation list.
- [ ] Solved exercises cover every exercise form of the blueprint, in every examined language or paradigm.
- [ ] The answer chain opens the method section, and every solved exercise shows Read / Link / Adapt / Iterate / Write.
- [ ] Readability rules are met on the rendered pages. The page count is within budget.
