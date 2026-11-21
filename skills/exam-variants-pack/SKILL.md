---
name: exam-variants-pack
description: Turns a past exam (photos, PDF or text) into a typeset exam with a full step-by-step correction, a model of how the professor designs exams, and variant mock exams in the same format with full corrections, all in one LaTeX PDF. Use for past papers, "correct this exam", "make variants" or "mock exams like the real one".
---

# Exam Variants Pack: past exam correction, professor model, variant mocks (LaTeX → PDF)

The student gives you a past exam, as photos, a PDF or pasted text, together with the course documents. You return **one LaTeX-built PDF** (plus a papers-only PDF) containing:

1. **the past exam, retyped** as a clean paper with answer space, figures redrawn and missing parts reconstructed and flagged;
2. **its complete correction**, where every question is solved through the student's answer chain;
3. **a model of the professor**: how they build a paper and why each question is there;
4. **several variant exams** in the same format, generated from that model, each with a complete correction in the same style.

If there is **no past exam**, build the blueprint from the course's challenges, labs and announcements, state it as an inference, then produce the professor model and the variants.

## The answer chain (mandatory structure of every correction)

The student reasons in five steps, and every correction is written as those five steps, in order, with their labels:

1. **Read.** Read the question and spot its key words and data: the verb, the numbers, the figure, the points (they tell how long the answer must be), and the hidden constraints.
2. **Link.** Link those key words to specific concepts, knowledge, lecture pages, lab programs, previous exercises or experiences. Name the source ("Lecture 2, sparse matrix–vector example"; "Lab 2, VectAdd.c").
3. **Adapt.** Adapt that knowledge to this exercise: map the general rule onto these names, sizes, layouts and operators, step by step.
4. **Iterate.** Think and iterate through the answer: test a tiny case, check units, sums and orders of magnitude, compare alternatives, try the classic wrong answer and show where it breaks, and correct.
5. **Write.** Write the model answer exactly as it should appear on the paper: the sentence, the code line or the number with its justification.

Then add **Traps** (the tempting wrong answers and what they cost) and **Marking** (how the points split).

- For a 0.25-pt question each step can be one sentence, but no step is dropped.
- For code, Iterate includes a run on sample data (the actual output).
- For analysis questions, Iterate includes the arithmetic and a consistency check.

**Self-test:** after reading the correction, could a student who got it wrong solve a variant with changed numbers or wording? If not, deepen the Adapt and Iterate steps.

## Step 0: Ask first (one batch, defaults included)

Ask once about what is not already settled. Use the question tool if there is one (up to 4 questions per call, options plus free text); otherwise use a numbered list. In an unattended run, take the defaults and state them on the title page.

1. **The past exam.** Is every page there? Which parts are blurry or missing? Is it the same course and the same professor as the coming exam? Default: transcribe what is visible, reconstruct missing parts from context, and flag them.
2. **The coming exam.** Same format? Duration, allowed documents, language, any announcement from the professor. Default: same blueprint as the past paper.
3. **Variants.** How many mock papers (default 3) and how far they move from the original: near (same problems, new numbers), medium (same blueprint, next problems from the course; the default), far (new forms). Should one variant be harder?
4. **Output.** One PDF with corrections plus a papers-only PDF (default). Language: that of the exam. Print layout: A4. Should the pack also update existing guides?

## Step 1: Read and transcribe

- Read all course documents and the exam. Look at every photo yourself, at full resolution if needed.
- **Transcribe faithfully:** wording, points, code with its blanks (as dotted blanks), tables, and the course-outcome labels.
- **Redraw figures** in TikZ:
  - data grids, graphs and matrices: read the coordinates carefully;
  - sparse patterns: list the non-zeros per row;
  - check them with internal consistency (symmetry, a value stated in the text, a figure from the lecture the exam reuses).
- Mark any missing or unreadable part `[reconstructed]` and explain on the first page what was rebuilt and from which clues. Never present a reconstruction as the original.
- Topics outside the course files (for example a language only the exam uses) are covered from reliable knowledge and marked `[beyond the course files]`.

## Step 2: Solve the past exam

- Solve every question first, in scratch work.
- **Run all code:** complete the programs, compile them, and run them on several sizes, including sizes that break the code (for example $p \nmid n$).
- **Emulate missing hardware:** without a GPU, use the bundled pthread CUDA emulator (`scripts/cuda_emu2.h`, `scripts/emu2.py`). Without a compiler, write to the specification and label the answer "per spec, untested".
- **Recompute every number with a script.**
- **Brute-force "propose a better …" questions** when they are small (for example partitions of a graph), so the proposed answer is provably good and the optimum is known.

## Step 3: Model the professor

Write a section titled "How this professor builds an exam":

1. **Blueprint table:** exercise, course outcome, points, form. Add the real weights, compared with any other assessment (challenges, labs).
2. **Decision rules** (5–8 boxes), each with "what he does" → "consequence for you". Typical rules:
   - every question comes from a page you have seen (which pages);
   - pairs ("differentiate A and B");
   - one problem in several paradigms or languages;
   - blanks sit where a misunderstanding would show (list the blank positions);
   - the cost model used in analysis questions;
   - outcome labels and justification lines.
3. **Topics beyond the course files** that the exam uses, with a compact primer.
4. **Checklist for code blanks:** blank → answer pattern.
5. **How the variants were generated:** for each exercise, the axis along which it moves (the twin concept pairs, the next collectives, the next problem in the lab sequence, another Lecture-2 analysis), with a table of variant × exercise contents.

## Step 4: Write the variants

- Keep the **blueprint exactly**: number of exercises, points, forms, outcome labels and duration.
- Move each exercise one step along its axis. New numbers, new problems and new figures are allowed. Every fact must still be true to the course.
- Each variant has its own instructions box and points that add up.
- Its code questions come with tested reference solutions.
- Its analysis questions are computed (and brute-forced when there is an optimum).
- Spread across variants: vocabulary from all chapters, every identification form, the main problems of the labs and projects, and every analysis type of the lectures.
- Corrections use the answer chain (Step 0) with Traps and Marking, exactly like the past exam's correction.

## Step 5: Build the PDF

- `assets/preamble.tex`: the proven preamble. It provides:
  - the boxes `solution{title}`, `model`, `watch` and `instr`;
  - the macros `\Read \Link \Adapt \Iterate \Write \Trap \Marks` (coloured step labels);
  - `\q{label}{text}` and `\lines{n}` (dotted answer lines), `\ex{title}{pts}`;
  - `\beyond{…}` for flags;
  - the collective-grid macros `\cgrid` and `\cop`;
  - a listings style with MPI/CUDA/UPC keywords.
  Adapt the keywords to the subject.
- `assets/main_template.tex`: a title page, the table of contents and the `\ifsol` toggle. It builds the full pack by default; a file `solflag.tex` containing `\solfalse` gives the papers-only PDF. Order: model → past paper → its correction → variant A paper → its correction → …
- **Readability:**
  - one question per paragraph, sub-questions on separate lines;
  - code in listings with blanks drawn as dots;
  - diagrams large enough that labels never collide (cells at least about 4 mm, labels about 6 pt);
  - each answer-chain step on its own line;
  - no run-on paragraphs.
- Compile with XeLaTeX twice. Fix errors and overfull boxes. Render pages to PNG and inspect them (figures, page breaks, boxes).

## Step 6: Deliver

- Deliver the full PDF, the papers-only PDF and a zip of the `.tex` sources and tested code.
- Say plainly what was reconstructed and what is untested, and offer to update the pack if the missing pages arrive.
- If the session has a project or knowledge store, save a short note: the blueprint, the professor model and the files.
- Offer, in one line, to propagate the format to the student's other materials (guides, interactive apps), as was done with the original pack.

## Final check

- [ ] The past exam is transcribed faithfully; reconstructions and beyond-course topics are flagged; figures are redrawn and checked.
- [ ] Every question of every paper has a correction with Read / Link / Adapt / Iterate / Write, plus Traps and Marking.
- [ ] Code answers were run (outputs quoted). Numbers were recomputed. Optimisation answers were brute-forced when small.
- [ ] The professor model exists, and every variant follows the blueprint exactly (points add up, forms match, outcome labels match).
- [ ] The variants together cover all chapters and every exercise form.
- [ ] Both PDFs compile and were visually checked. The language and layout match the request.
