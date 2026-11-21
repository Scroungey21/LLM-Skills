---
name: revision-project-export
description: Packages a revision or study project (course inputs, generated guides and PDFs, sources, HTML artifacts, docs) into one zip with a handoff and a paste-ready context prompt, to continue on another account or chat. Use for export, back up, move or hand off a project.
---

# Revision Project Export (docs + artifacts + handoff prompt)

Use this skill when a study project has to continue somewhere else: another Claude account, another chat, a teammate, or a later session before the next exam. You produce **one zip** that holds:

- everything that went into the project;
- everything that came out of it;
- a **handoff** that lets a fresh assistant pick up the work and *update* the existing deliverables with new material (new lectures, a new past paper, new feedback), instead of starting over.

The design rule is **real files over descriptions, and honest gaps over silent omissions**.

## Step 0: Confirm only what matters

Ask once, with defaults, and only what is not already clear:

- **Destination.** Default: another Claude account (claude.ai project + chats).
- **Purpose of the next sessions.** Default: update the existing guides and artifacts when new course material arrives before the final exam.
- **Include large build caches?** Default: no. Exclude screenshots, QA images, node_modules and compiled binaries.
- **Include the skills used or created?** Default: yes. Bundle their SKILL.md files.

In an unattended run, take the defaults and state them in the handoff.

## Step 1: Inventory (write it down before copying anything)

Build a table of every item with: path or URL, kind, origin (input / output / source / artifact / note), and whether the real file can be bundled.

- **Inputs:**
  - the user's uploads (photos of exams, screenshots, PDFs);
  - project knowledge files and docs;
  - files from connected folders;
  - pasted text worth keeping.
- **Outputs:** every delivered file (PDFs, DOCX, PPTX, zips) in the outputs folder.
- **Sources:** the working folders that built the outputs: LaTeX trees, code, data generators, build and QA scripts, tested programs.
- **Artifacts:** every published page (list them with the artifact tool), its local HTML (published version and standalone version), its source folder and its URL.
- **Docs (living documents):** export each one to PDF (and Markdown when possible). If the export result is too large to show, it is usually saved to a file. Decode the base64 field from that file with a script; never retype base64.
- **Notes:** project notes and memory written during the work (handoffs, summaries).

If a real file cannot be obtained, list it under "not bundled" with the reason and where it lives. For example: project knowledge files may only be readable as extracted text, so tell the user to re-upload the originals. Never invent content to fill a gap.

## Step 2: Lay out the bundle

```
<Project>-export-<date>/
  00_START_HERE.md        handoff: what exists, how it was built, how to update it
  CONTEXT_PROMPT.md       paste-ready first message for the new account/chat
  manifest.json           every file: path, kind, origin, bytes, sha256, description
  inputs/                 uploads, course code/docs, past-exam photos, feedback screenshots
  outputs/                final PDFs and delivered zips
  artifacts/<name>.zip    ONE zip per artifact: standalone .html, published .html,
                          source folder, README.md (URL, how to rebuild/republish)
  sources/<name>.zip      ONE zip per working tree (LaTeX, code, generators), caches excluded
  docs/                   living documents exported as PDF/MD, with their URL
  notes/                  project notes, previous handoffs
  skills/<skill>/SKILL.md skills used or created (when included)
```

Inner zips keep each artifact and each source tree self-contained, so it can be re-uploaded alone.

## Step 3: Write the handoff (00_START_HERE.md)

It is addressed to the next assistant. Write it in full, never as a transcript dump.

1. **Rules for the reader.**
   - Treat this file and the bundled files as ground truth.
   - Do not re-litigate settled decisions.
   - Ask the user before redoing anything.
   - Update deliverables in place and keep their structure and style.
2. **The student and the goal:** course, level, exam date if known, what "ready" means for them.
3. **Exam format,** as established (blueprint, weights, allowed material) and how it was established (past paper, announcement, inference).
4. **Professor model,** if one was built: sources reused, blank positions, recurring forms, likely variants.
5. **Deliverables, one block each:**
   - what it is;
   - files in the bundle;
   - the URL if published;
   - how it was built (commands, engines, emulators, environment variables);
   - how it was tested;
   - its known limits (reconstructed parts, untested code, missing pages).
6. **The user's preferences and feedback,** verbatim where possible (for example "dense but not unreadable: one concept per line, diagrams big enough"). These are requirements for future edits. Always record the **answer chain** the student uses and expects in every correction: Read the question → Link it to concepts, knowledge or previous exercises → Adapt that knowledge to the exercise → Iterate (think, check, try) → Write the answer. Future corrections must follow it.
7. **Update procedures,** for each kind of new input (new lecture, new past exam, new lab, corrections): which deliverables to touch, in which order, and which checks to re-run.
8. **Open items and ideas** not done yet.
9. **Not bundled,** with reasons and where to get each item.

## Step 4: Write the context prompt (CONTEXT_PROMPT.md)

This is a short message (about 300–600 words) the user pastes as the first message in the new place. It must:

- say what the project is and that the attached zip is the full state;
- tell the assistant to read `00_START_HERE.md` and `manifest.json` first and then confirm its understanding in a few lines;
- list where to re-upload things (course originals into a project, artifacts to republish from `artifacts/*.zip`);
- give the standing preferences, including the answer chain (Read → Link → Adapt → Iterate → Write) for every correction, and the skills to use (by name: `exam-answer-guide`, `exam-variants-pack`, `revision-project-export`, and any others used);
- end with "Wait for my next instruction (usually: new material to integrate)".

## Step 5: Package and verify

- `scripts/package_export.py` does the final packaging. Its `zipdir()` helper builds each inner zip (caches and binaries excluded). `main()` writes `manifest.json` with sha256 checksums, zips the whole folder, then re-opens it and checks every file and every inner zip.
- Build the zips with a script (Python `zipfile`, deflate), excluding caches.
- Compute sha256 for the manifest.
- Re-open the final zip, list it, check that every inner zip opens and that every manifest path exists.
- Report the size.
- Deliver the zip, plus `00_START_HERE.md` and `CONTEXT_PROMPT.md` as separate files so they can be read without unzipping.
- If a project or knowledge store exists, save the handoff there too.

## Final check

- [ ] Every input, output, source, artifact and doc from the inventory is either bundled or listed as "not bundled" with a reason.
- [ ] One inner zip per artifact and per source tree, each with a README that gives its URL and how to rebuild it.
- [ ] The handoff covers rules, goal, exam format, deliverables, preferences, update procedures, open items and gaps.
- [ ] The context prompt is paste-ready and points to the handoff.
- [ ] The zip was re-opened and verified, and the manifest checksums match.
- [ ] No secrets (API keys, tokens) in any bundled text. Scan and redact.
