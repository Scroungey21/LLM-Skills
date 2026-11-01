---
name: minimal-code
description: Write, extend, fix, review or refactor code under the "minimal code, maximal power" philosophy - the fewest files, functions and lines that still read clearly, one place per job, no wrapper or tape-function patches, readable by a beginner or ADHD brain without memorizing the codebase. Use this skill for ANY request to build, add to, debug, refactor, structure or review an app, site, script, tool, bot, API or game, even if the user never mentions the philosophy, and whenever you feel the urge to add a helper, wrapper, utils file, new abstraction, config layer or workaround. Pairs with /game-builder and /mass-game-builder.
---

# Minimal Code, Maximal Power

Code should do the most work with the least *stuff to hold in your head*. The target is not fewest characters. It is the fewest
**files, functions, indirections and concepts**, written plainly, so a stranger can open one file, read it top to bottom,
find the bug, and change it without learning the rest of the project.

## Why these rules exist
Agent-written code fails in predictable ways, and each rule below answers one:
- It **splits everything** (one file per idea, one function per step) -> the reader must jump around and memorize.
- It **patches symptoms** (wrappers, retries, flags, "fixed" copies) -> the real flaw stays and the code piles up.
- It **abstracts early** (generic helpers, config for one use) -> the wrong abstraction costs more than copy-paste.
- It **golfs** (clever one-liners) when told to be short -> small but unreadable.
- It **writes new code** when the answer was already in the platform or the project.

## Before writing a line: the ladder
Take the first rung that works.
1. **Platform built-in** (language, browser, engine, standard library).
2. **Extend what already exists** in this project. Read the current file first. Prefer editing a function over adding a new one.
3. **One vetted dependency**, only if it replaces more than ~50 lines you would otherwise write and maintain.
4. **Short custom code**, in the place where it is used.

## File rule
- **One file until it hurts.** Start with one file per app or page.
- **Split only for** (a) a different page or screen, or (b) a different *kind* of technical work the app does (UI vs data vs network vs
  background job). Never split by "tidiness", never create `utils`, `helpers`, `common`, `misc`, `services` dumping grounds.
- A file around 300 lines is a prompt to ask "is this two kinds of work?", not an automatic split. If yes, split along that line.
- Keep the file's pieces in the order a reader meets them: config at top, then logic, then wiring at the bottom.

## Function rule
- **Make a function only when** the same logic is used 2+ times and a fix in one place must reach all, **or** one function would be
  too long to read straight down. Never create a function just to give a single step a name; a comment does that for free.
- A function does a whole job from input to result. Do not make three functions for "fetch", "clean", "format" of one task.
- About 30 lines is comfortable. Longer is fine if it reads straight down without a maze of branches.
- **Rule of three:** repeated twice, leave it and add a comment naming the sibling. Repeated three times, merge it.

## No tape
Tape = anything added on top of a problem instead of fixing the problem. Smells:
a wrapper that exists to adapt another function; `setTimeout`/sleep to dodge a race; a flag variable to suppress a bad state;
`try/catch` that swallows an error; a second "fixed", "v2" or "new" copy; a helper whose job is to undo what another did;
a comment saying "workaround" or "hack".
**When one appears:** stop, find the root cause, change the original code so the problem cannot happen. If a true workaround is
unavoidable (third-party bug), keep it to a few lines, in one place, with a comment saying what it dodges and when to delete it.

## Readable by any brain (beginner, newcomer, ADHD)
- Plain names that say what a thing *is* (`remainingTries`, not `n2`). No cleverness, no tricks that need explaining.
- Fewer things alive at once: few variables, shallow nesting (early `return`/`continue` over deep `if`), no hidden state.
- A **header comment** on every file: `WHAT` it does, `TALKS TO` what, `EDIT HERE` for the things people change most.
- Comments explain **why**, not what. Tunable numbers and lists sit at the top, named, not buried in logic.
- No config, plugin system, or interface for something used once. Add it when the second use arrives.

## Do not golf
Short is a side effect of simple, never the goal. If cutting lines makes code harder to read (nested ternaries, chained
one-liners, regex puzzles, magic tricks), keep the longer version. Readability beats line count every time.

## Self-check before saying "done"
- [ ] Could a newcomer find where to change X by opening **one** file?
- [ ] Is there any function used exactly once whose body could just sit where it is called?
- [ ] Any new file that is not a new page or a new kind of work?
- [ ] Any wrapper, flag, delay, swallowed error, or duplicate that is really a patch? Fix the cause instead.
- [ ] Is there an existing function or feature I should have extended instead of writing new?
- [ ] Did I run it and see it work (not just parse or lint)?
- [ ] Did I keep it plain, not clever?

## Reporting
End with two lines: **files / lines** of what you produced, and **why any split exists** (which rule it falls under). If the
user's existing code breaks these rules, say so briefly and offer to simplify; do not rewrite unasked.

## Roots (for the curious)
Ousterhout "deep modules" (*A Philosophy of Software Design*), Locality of Behavior (Carson Gross), Carmack on inlining,
Muratori "semantic compression", AHA programming / Sandi Metz "duplication is cheaper than the wrong abstraction",
The Grug Brained Developer, Zakirullin "Cognitive Load in Software Development", YAGNI/KISS, vertical slice architecture.
