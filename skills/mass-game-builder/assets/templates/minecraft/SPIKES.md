# Spikes - {{NAME}}
A spike is a small, time-boxed experiment that answers ONE question the design depends on. Every [Unverified] claim in the vision becomes a row.
Run the riskiest first (whatever could force a redesign). Verdict: PASS (plan holds), ADJUST (plan changes, log in DECISIONS.md), FAIL (alternative needed).
Evidence = a log, capture, screenshot or test output saved in `_project/evidence/spikes/`. No row is closed on belief.

| # | Question | Why it matters | Method | Verdict | Evidence | Decision |
|---|---|---|---|---|---|---|
| S1 | Which Minecraft version + loader has every MUST-role mod (or a clear custom-build path)? | Decides everything; frozen after the slice | Availability matrix per mod and version; load a bare pack with the MUST mods | | | |
| S2 | (If the pack depends on a world generator or big framework mod) Can it accept our layer through its API / data, or must it be forked? Delete this row if not applicable. | Core architecture | Read its source; try a custom hook | | | |
| S3 | What does the heaviest content cost on the reference device (the pack's most expensive system, structure family, mob count or machine setup)? Does the pass line in PERF_BUDGET.md hold? | Performance is a release blocker | Measure first (PERF_BUDGET.md routes), not at the end | | | |
| S4 | Is each key mod's licence compatible with modpack distribution? | Legal and packaging | Read the licence text, record it in MODLIST.md | | | |
| S5 | (If the vision limits where loot may exist) Can it be attached only to containers or breakable loot blocks with zero loose items? Otherwise delete. | Vision rule | Place a test structure, count item entities | | | |
| S6 | Can all audio be sourced from mods / open libraries with a clean licence? | Provenance rule | Build the audio source list per category | | | |
