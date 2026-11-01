# Question bank

Pick 2-4 questions that matter for this project. Ask them in one batch (the ask-user tool if you have it), each with 2-4 options and your recommendation first. Skip anything the repo, the user's earlier messages or an existing table already answers.

## Always relevant

**1. Budget posture.** "How should I balance cost and quality for sub-agents?"
- Balanced (recommended): top tier only for hard code, creative assets and the release review; mid tier for the rest.
- Save tokens: mid tier by default; top tier only when a mid-tier agent fails or the user names the job.
- Quality first: top tier for building and reviewing; mid tier only for fetching and monitoring.

**2. The review.** "Which model runs the big review of a finished build?"
- Top tier, medium effort (recommended): it catches what cheaper reviewers miss, and medium effort keeps it focused.
- Top tier, high effort: for security, money, safety or anything hard to undo.
- Mid tier, high effort: for low-stakes prototypes.

**3. Escalation.** "When a cheaper agent struggles, may I step it up a tier on my own?"
- Yes, one stage at a time, and I'll say so in the report (recommended).
- Ask me first every time.

## Code-heavy projects

**4. What counts as "hard code"?** Ask only when the repo makes it unclear. Offer the subsystems you found (networking, concurrency, rendering, data migrations, security) and ask which ones get the top tier. Recommend: the ones with concurrency, security or data loss risk.

**5. Tests and refactors.** "Who writes tests and does mechanical refactors?"
- Mid tier, high effort (recommended).
- Top tier, when tests encode tricky behaviour.

## Game, 3D and creative-asset projects

**6. Asset creation.** "Models, animation, environments and shaders: which tier and effort?"
- Top tier, extra-high effort (recommended): spatial reasoning and pipeline scripting fail in costly ways.
- Top tier, high effort.
- Mid tier, high effort, with a top-tier review after.

**7. Visual checks.** "Reading screenshots and judging looks: which tier?"
- Mid tier, high effort for routine checks, top tier for the final art review (recommended).
- Top tier always (when the look is the product).

## Research-heavy projects

**8. Research depth.** "Web and code research: which tier?"
- Mid tier, high effort, with a top-tier synthesis at the end (recommended).
- Top tier for primary research when claims must be exact (legal, medical, scientific).

## Writing- and docs-heavy projects

**9. Drafting versus editing.** "Who drafts and who edits?"
- Mid tier drafts, top tier does one final edit for voice and accuracy (recommended).
- Top tier for both, when the writing is the product.

## Data and analysis projects

**10. Analysis.** "Queries, cleaning and charts: which tier?"
- Mid tier for cleaning and plotting, top tier for modelling and conclusions (recommended).
- Mid tier throughout, with a top-tier check of the final numbers.

## Ops-heavy work (builds, deploys, long monitoring)

**11. Monitoring.** "Who watches long runs, logs and downloads?"
- Mid tier, medium effort (recommended).
- Light tier, low effort, for pure polling with no judgement.

## After the answers

Write the table (assets/ROUTING_TABLE.md format) into the project's existing CLAUDE.md / AGENTS.md, or a new MODEL_ROUTING.md if it has neither, with the user's words, the date and the escalation answer. Save it to memory, show it once, and carry on.
