---
name: "code-discipline"
description: "Build, extend, review, refactor or audit any codebase (any language, any architecture, object-oriented or not) so every file is findable in a minute and the whole project is learnable in under an hour by a beginner, an AI agent or an investigator. Enforces a written architecture contract that is never broken, one file per owned thing, full-word names, a header plus three ordered banners in every file, short plain functions, scale-ready key-value data (stateless, Azure-deployable), a navigation kit (ARCHITECTURE.md, AGENTS.md, DECISIONS.md) and a checker script. Use for ANY request to build, structure, add to, clean up, review or audit code or a project, for clean, readable or navigable codebases, for easy hand-over, or whenever about to create files. Pairs with minimal-code and game-builder."
---

# Code Discipline

One discipline for every codebase this skill touches, so that finding file X takes a minute instead of twenty, a stranger can learn the whole project in under an hour, and an AI agent or investigator can trace any behaviour without guessing. It works for any language and any architecture. It does not pick the architecture for you: it makes the chosen one respected forever.

## Why these rules exist
Agent-built code fails in predictable ways. Each rule below answers one:
- Files land wherever is convenient, so nothing is findable -> **architecture contract + one owner per file**.
- Structure drifts a little with every change -> **a checker enforces the contract on every change**.
- Names are cryptic (`sh_mng`, `utils`) -> **full words that name the owned thing**.
- Docs rot -> **the map is verified against the files, headers against imports**.
- Code is shredded into tiny pieces, or golfed into puzzles -> **ownership, plain-and-short rules, caps with justification comments**.
- "Done" is declared after a parse check -> **run it and see it**.
- State kept in memory, shared counters, full-table scans -> cannot scale out -> **scale-ready rules**.

## Proportionality
- One throwaway script under ~150 lines: a single file. Apply only the header, banners, names and function rules. No kit, no checker.
- Small app (up to ~20 files): everything below, with each doc kept to about one screen.
- Larger: everything, plus a short `AGENTS.md` inside any folder that grows past ~10 files.
Never add ceremony that costs more than the search time it saves.

## Which job is it?
- **New codebase** -> Step 0 to Step 6.
- **Extend or fix code that has a contract** (`ARCHITECTURE.md` + rules file) -> read the contract and the neighbouring files first, follow them, update the map and flows in the same change, run the checker. Never restructure unasked.
- **Existing code with no contract** -> Audit mode (below).
- **Review** -> run the checker, report ERROR/WARN counts per rule and the worst offenders. Fix nothing unasked.

### Audit mode (existing code, no contract)
1. Read the tree. Infer the roles the code actually uses. Write a draft contract that describes what exists. Move nothing yet.
2. Run the checker against that draft. Report counts per rule and the ten worst files.
3. Ask how far to go: **document only** (contract, map, `AGENTS.md`), **cheap fixes** (names, headers, banners), or **full retrofit** (splits and moves). Recommend cheapest first: map, headers, names, banners, splits, moves.
4. Never mass-rewrite unasked. Retrofit one role at a time, behaviour unchanged, tests run after each step, one `DECISIONS.md` line per structural change.

## Step 0: Fix the contract before any code
Ask only what is missing AND expensive to reverse, at most three questions at once, each with 2-3 options and a recommendation (use the ask-user tool if available). Never re-ask what the user already said. Everything cheap (names, caps, colours, ports): decide it and log it in `DECISIONS.md`.
1. **Architecture style** (table below).
2. **Language and stack**, when it is not obvious from the project.
3. **Where data lives and the scale target**, when the app stores data. The partition key is part of this: some stores (Azure Cosmos DB, Table Storage) cannot change it in place.

**Any architecture is allowed** if all four hold: (a) it is written in the contract, (b) every source file belongs to exactly one declared role, (c) the allowed import direction between roles is written down, (d) it is never broken. Adding or changing a role later means editing the contract and `DECISIONS.md`, never quietly breaking it in one file.

| Style | Role folders | Import direction | Fits |
|---|---|---|---|
| MVC | `models`, `views`, `controllers` | views -> controllers -> models | UI apps with screens |
| Functional core, imperative shell | `shapes`, `rules`, `connections`, `entrances` | entrances -> rules, connections -> shapes | services, data work, scale-out |
| Pipeline | `sources`, `steps`, `outputs` | left to right | batch jobs, ETL, CLI tools |
| Feature slices | one folder per feature, each with the same fixed file kinds | features never import each other | many independent features |
| By category (games, as in game-builder) | one folder per category, self-contained | through a few named seams | games |
| Ports and adapters | `core`, `ports`, `adapters` | adapters -> core | long-lived, domain-heavy apps |

If the user's idea does not fit a row, write their own roles and directions. Object-oriented projects are fine: one class is one owned thing, and the contract still applies.

## The contract files (create in Step 1)
- **`architecture-rules.json`**: the machine-readable contract the checker reads. Shape:
```json
{
  "style": "one line naming the style",
  "roles": {
    "shapes":    { "may_import": [],                      "meaning": "..." },
    "rules":     { "may_import": ["shapes"],              "meaning": "..." },
    "tests":     { "may_import": ["shapes", "rules"],     "meaning": "...", "relaxed": true }
  },
  "forbidden_by_role": { "rules": ["Date.now", "Math.random", "fetch(", "process."] },
  "limits": { "function_lines": 30, "file_lines": 400 },
  "names": { "banned_words": ["utils", "helpers", "common", "misc", "stuff", "temp", "new", "final", "copy", "backup"], "allowed_short_words": ["api", "url", "web", "id"], "min_word_length": 4 }
}
```
- **`ARCHITECTURE.md`**: the human map (see Navigation kit).
- **`DECISIONS.md`**: one line per decision: what, why, how hard it is to undo. Every contract change and every override is logged here.
- **`AGENTS.md`**: the short map for AI agents (see Navigation kit).
- **`README.md`**: what it is and how to run it, ten lines.

## The file rules

**1. One owner per file.** A file owns one thing (a noun, a screen, one outside system, one calculation) and all actions on that thing live in it. Test: describe the file in one sentence without "and" joining two things; if it needs one, it is two files. Never one file per feature of the same thing, never one file per function, never one screen spread over several files.
- A screen's own button and interaction logic lives inside the screen file. Logic leaves the screen only when two or more screens use it, or when it touches an outside system. The code that touches an outside system lives in that system's file and the screen calls it.
- Each outside system (a database, each third-party API) is configured and declared in exactly one file. Everyone else imports the ready-made client. No second place reads its settings or opens its connection.

**2. Same noun across roles.** Use the same word for a thing in every role (`product` in the models and the product logic and the product screen), so one search for the noun finds every file of a feature.

**3. Names.** Full words, never abbreviations (`shop_management`, not `sh_mng`). The name says what the file owns, so it can be understood without opening it. One case convention per project, taken from the language (see the language table). Banned words: `utils`, `helpers`, `common`, `misc`, `stuff`, `temp`, `new`, `final`, `copy`, `backup`, `v2`. Words under four letters are allowed only if listed (`api`, `url`, `web`, `id`).

**4. Header.** The first lines of every file, in the language's comment syntax:
```
// FILE: shop-screen.mjs
// WHAT: one sentence: what this file does.
// ROLE: entrances            (must equal the folder it sits in)
// TALKS TO: product.mjs, database.mjs      (every local file it imports; "nothing" if none)
// EDIT HERE: where people change the most (optional)
// KEYS: partitionKey = shopId | rowKey = "product:" + id      (files that own stored data; optional)
// SCALES BY: what makes it safe to run many copies (optional)
// WHY LONG: reason, only if the file is over the size cap (optional)
```
Headers are short, true and checked: the checker compares `TALKS TO` with the real imports in both directions.

**5. Order inside every file: three banners, in this order.** Use these exact prefixes so a search finds them in every file:
```
// ===== 1. SETUP: imports, settings, connections, tools =====
// ===== 2. FUNCTIONS: reusable pieces, called by this file or others =====
// ===== 3. RUN: what executes when this file is used =====
```
1. **SETUP**, in this order: links and imports, declarations, all variables and settings, all outside connections, all pointers, all fundamental tools.
2. **FUNCTIONS**: the fundamental functions, the ones called from this file or from others that do not run on their own.
3. **RUN**: last, whatever executes by itself when the file is used: `main`, loops, listeners, server start, the screen's render or route table.
An empty section keeps its banner with a reason, for example `(none: nothing here is reused)`. Where a language forces an order (imports first, a class wrapper, markup first), keep the banners in the order it allows and note it in the language table. Do not fight the language.

**6. Functions.**
- One function does one whole job from input to result: not three functions for "fetch", "clean", "format" of one task.
- About 30 body lines at most. Shallow nesting (three levels at most), early `return` instead of deep `if`, a named variable for any condition with more than two clauses.
- A function used once is written where it is used. Extract only when (a) it is used twice or more and a fix must reach all uses, (b) the function would pass the cap and the block stands alone from input to output, or (c) it belongs to a different role (a calculation or a connection) than the file that calls it. For (b), put `// SPLIT: reason` on the line above.
- A function that exists only to adapt, wrap, retry, delay, suppress or undo another one is a patch, not a function. Find the root cause and fix the original.
- Repeat twice: leave it and add a comment naming the sibling. Repeat three times: merge it. Do not abstract before the second use, and do not design the abstraction first: write plain code, then compress what really repeats.

**7. File size.** About 400 lines at most. Past that, ask "is this two things?" If yes, split along that line. If no, add `WHY LONG:` to the header.

**8. Simplest thing that works.** Take the first rung that works: platform built-in, then extend what the project already has, then one vetted dependency (only if it replaces about 50 or more lines you would otherwise maintain), then short custom code in the place where it is used. Short and plain, never clever: do not golf. If cutting lines makes it harder to read, keep the longer version. Follow `minimal-code` for style when it is available.

**9. Debuggable by a beginner.**
- Errors are never swallowed: log them with the file and function, in plain words, then fail or handle them for real.
- One plain log line at each outside call says what is being called and for what.
- Settings come from environment variables or one settings block at the top, with the default stated. Secrets are never in code.
- Tunable numbers sit at the top of the file, named, never buried in a function.

## Scale-ready rules
Apply to any server-side app, or any app that stores data. Default target: horizontally scalable and deployable on Azure (App Service, Container Apps or Functions) without being deployed there. If the user chose another platform, keep the same rules with its key-value store.

- **Stateless.** No module-level changing variables. Nothing kept in memory between requests. No local file writes outside the one connection file. State lives in the database, and any copy can serve any request.
- **Key-value data.** Use a key-value or partitioned store (Azure Table Storage or Cosmos DB for Table share one API, so start cheap and move later; Azurite emulates it locally). Every kind of stored record documents its partition key and row key in its `KEYS` header.
- **Partition key** = the unit that is read and written together and spreads evenly (a shop, a user, a tenant). It cannot be changed in place, so it is a Step 0 decision. Name the hot-partition risk in `DECISIONS.md`.
- **Always read by partition key.** Never scan the whole store. Transactions only inside one partition. One table with kind-prefixed row keys, not one table per kind.
- **Append, do not update shared counters.** Store events (sales, clicks) and derive totals, or keep periodic rollups. Two machines must never fight over one number.
- **Splittable logic.** Calculations are pure: everything they need, including the current time, randomness and ids, is passed in. Write them as "given partition X, compute Y" so any worker or timer can run them in parallel.
- **Outside systems** only in their one file. Nothing outside the connection role reads settings or opens clients.
- **Say what is untested.** If it was never run on the real cloud, say so. Log known races (read-then-write) in `DECISIONS.md` with the fix for when they matter.

## Navigation kit (the 1-minute find)
Generate these in Step 1 and update them in the same change as the code. Keep them short; the checker keeps them true.

**`ARCHITECTURE.md`**, in this order:
1. **Contract**: a table of role, what it holds, what it may import. The file rules in five lines.
2. **Folder map**: one line per folder, naming every file by its full path from the project root in backticks.
3. **Where do I find...?** A table: "I want to change X" -> the file (and function or constant).
4. **Flows**: one row per user action or trigger: entry point, functions in order, what is read, what is written. This is what makes tracing behaviour a one-minute job.
5. **How do I add a new...?** A short recipe per repeatable thing (screen, record kind, calculation, outside service, background job), plus how to run, test and deploy.
6. **Scaling notes and known limits.**
Write concrete files as full paths in backticks. Write hypothetical files with angle brackets (`folder/<name>-screen.ext`) so the checker does not mistake them for real paths.

**`AGENTS.md`** (40 lines at most, hand-written, specific): what the project is, where to start (links to `ARCHITECTURE.md` and `DECISIONS.md`), the commands to run, test and check, the rules in short imperative lines, the "do not" list, and what to run before saying done. It is a map and a set of guardrails, not a copy of the codebase, and it contains no vague advice ("write clean code"). If the project already uses `CLAUDE.md` or another agent file, make it a one-line pointer to `AGENTS.md`.

## The checker
Build it in Step 1, in the project's own language or a small dependency-free script, at `tools/check-discipline.<ext>`. It must pass on itself. It reads the contract, prints `ERROR` and `WARN` lines (file and line first), exits 1 on any error, and with `--map` prints one line per file (`path  WHAT`) so the map of the whole project is one command.

**ERROR**
- A source file is outside a declared role folder, in the project root, or deeper than the declared depth.
- The header lacks `WHAT`, `ROLE` or `TALKS TO`, or `ROLE` differs from the folder.
- `TALKS TO` differs from the real local imports (both directions).
- An import breaks the `may_import` direction, or its target does not exist.
- A banner is missing or out of order; an import appears after SETUP; a function is declared outside FUNCTIONS.
- A module-level changing variable exists.
- A role's forbidden pattern appears (for example, a pure role calls the clock, randomness, network, files or environment).
- A file name breaks the case convention, uses a banned word, or contains an abbreviation (a word shorter than the minimum, not on the allowed list).
- `ARCHITECTURE.md` is missing, omits a source file's full path, or names a path that does not exist.

**WARN**
- A function is over the cap without `WHY LONG:` above it.
- A function is called exactly once, is not registered or exported, and has no `SPLIT:` above it.
- A function is never used.
- A file is over the cap without `WHY LONG:` in its header.

Roles marked `relaxed` (tests) skip the banner, function and forbidden-pattern checks but still need a header and clean names. Read the code lines only: skip comment lines when matching patterns. For languages where a regular expression cannot find function ends reliably (indentation-based ones), use the language's own parser (for example Python's `ast`). State the checker's limits in its header. Never edit the contract to make a failing check pass: if a rule is wrong, say so and log the change.

## Workflow: phases with exit gates
Do not start a phase before the previous gate passes. Show a short status after each phase, not a narration.
1. **Contract.** Step 0 answers, then the five contract files with the contract table, first `DECISIONS.md` rows and an empty map. Exit: someone could say where any future file would go.
2. **Skeleton.** Role folders, the checker, `AGENTS.md`. Exit: checker runs and reports 0 errors.
3. **Vertical slice.** One feature end to end inside the contract. Start each file from the header and banners, then fill it. Exit: it runs and is seen working; pure parts have tests.
4. **Grow, one thing at a time.** After each addition: update the map, flows and recipes, run the checker, run the tests. Exit per addition: 0 errors.
5. **Hardening.** Edge cases for every input and every outside call: empty, huge, duplicate, hostile (for example markup in text fields), out of order, two at once, outside system down, restart. Handle each or log it in `DECISIONS.md`. Exit: checker 0 errors, tests pass, the app was started and exercised, not only parsed.
6. **Cold-start test.** Using only the map and a search tool, answer six questions about the project and count the file opens and the time each takes: (1) where do I change X? (2) what happens when the user does Y, step by step? (3) what breaks if I rename Z? (4) how do I add a new T? (5) where is the data stored and under which key? (6) how do I run, test and deploy it? Pass: each answer takes at most three file opens and about one minute of searching. Do this yourself and report the result; offer a fresh-agent run if the user wants an independent check, and do not start one unasked.

## Language table
Pick the project's convention and use it everywhere. When unsure, follow the language's own norm.

| Language | Comment / banner | File names | Function finding for the checker | Notes |
|---|---|---|---|---|
| JavaScript, TypeScript | `//` | kebab-case | `function name(`, `const name = (` | ES modules: imports first, so SETUP starts with them |
| Python | `#` | snake_case (hyphens cannot be imported) | `def name(`, end by dedent, or use `ast` | Top-level code in RUN, under `if __name__ == "__main__":` when the file is also imported |
| C#, Java | `//` | PascalCase, file = the one type it owns | method declarations | A class is forced: make it the file's single owned thing, avoid inheritance beyond one level, no factories or abstract bases until a third use |
| Go | `//` | snake_case | `func name(` | One package per role folder |
| Rust | `//` | snake_case | `fn name(` | One module per file |
| Shell, SQL | `#` or `--` | snake_case | functions or statements | Same three banners |
| HTML, CSS | `<!-- -->`, `/* */` | kebab-case | script block functions | SETUP: head, links, styles; FUNCTIONS: script functions; RUN: markup and start-up. Keep a screen's markup, styles and script in one file unless the language forces more |

## Reporting (end of every task)
- Files and lines produced, and which rule explains any split.
- The checker result (counts) and the tests that ran.
- What was not run or not tested (for example: never deployed to the cloud).
- Which contract or `DECISIONS.md` lines changed.
Be plain about gaps. "Done" means the checks passed and it was seen running.

## When the user's request conflicts with the contract
The user's explicit design choice wins; the contract wins on structure. If they want something that breaks a rule (a file in the wrong role, a catch-all `utils`, a fourth role), state the cost in one sentence, offer the compliant alternative, follow their decision, and log it in `DECISIONS.md`. If another skill governs the structure (`game-builder` for games), its architecture is the contract here, and this skill adds the headers, banners, names, checker and map on top.

## Self-check before saying done
- [ ] Could a stranger find where to change X in under a minute from `ARCHITECTURE.md`?
- [ ] Does every file sit in exactly one declared role, with header and banners in order?
- [ ] Is every file named in full words after what it owns, with no `utils` or abbreviations?
- [ ] Any function used once without a reason, any wrapper, delay, flag or swallowed error that is really a patch?
- [ ] Any state kept in memory, any full-table scan, any outside system configured in two places?
- [ ] Are map, flows, recipes and `DECISIONS.md` updated in this same change?
- [ ] Did the checker report 0 errors, and did I run it and see it work?