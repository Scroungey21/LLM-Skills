---
name: model-routing
description: Choose the model and reasoning effort for every sub-agent in long-horizon, multi-agent work, so top-tier tokens go only where they pay off. Finds the project's routing table (or builds one by asking the user a few questions fitted to the project's nature), then sets `model` and `effort` on every Agent call and every workflow `agent()` call, stage by stage. Use this whenever you are about to launch several sub-agents, write or resume a Workflow script, or plan a multi-phase job (build, review, fix, verify, research, test, monitor), and whenever the user talks about which models or effort levels their agents should use, token cost or "wasting tokens". Not needed for a single quick sub-agent, or for a general chat about which model is better at something.
---

# Model routing

Long jobs spawn many agents. Without an explicit choice, each one runs on its agent definition's model, or else inherits the main session's model, usually the most expensive one. Most of that work (fetching, checking, monitoring, research) doesn't need it. This skill gives every agent the cheapest model and effort that still does its job well, and it lets the user decide what "well" means for their project.

The user owns the table. You propose and they decide. Then you apply it every time without being asked.

**Once per session is enough.** After you have found or built the table in this session, apply it from memory on later launches. Re-read this skill only when a new kind of work appears that the table doesn't cover.

## Step 1: Find the routing table

Look, in this order, and use the first one you find:

1. An explicit instruction for this job from the user ("run these on Sonnet medium"). It wins over any table, for that job only.
2. The project's table: an "agent models" or "model routing" section in the project's `CLAUDE.md` / `AGENTS.md`, or a `MODEL_ROUTING.md` at the project root.
3. A memory entry about model tiers in your persistent memory.
4. None found: go to Step 2.

**When the table has no row for a task** (say it covers builds and reviews but not docs or small fixes), use the matching row of the generic default in `assets/ROUTING_TABLE.md` and carry on. If that kind of work will recur, ask the user about that one row only, then add it to the table.

**Re-check the whole table only when the project changes phase**, for example from prototype to release polish, or when it starts a new kind of work such as its first 3D assets. Then ask about the changed rows only.

## Step 2: Build the table with the user (only when there is none)

**Small jobs don't need the questions.** For a job of one or two sub-agents, use the generic default silently and name the tiers in one line of your reply. Ask the questions the first time a long-horizon job starts: several phases, three or more agents, or a workflow.

1. **Read the project's nature cheaply:** the README, a file listing, and the task at hand. Don't read the whole repo for this. Is it code-heavy, asset-heavy (3D, animation, art, audio), research-heavy, writing-heavy or data-heavy? Is it a prototype or a release? Are there signs the user cares about cost (comments, usage limits, past instructions)?
2. **Draft a table** from `assets/ROUTING_TABLE.md`, keeping only the task types this project has. Add project-specific rows where they help, such as "shader work", "licence screening" or "level layout".
3. **Ask the user**, using the ask-user tool if you have one, or plain text otherwise. Ask at most four questions, each with 2-4 options and your recommendation first. Choose them from `references/question-bank.md`. Never ask what the repo or the user's earlier messages already answer. Launch no sub-agents until the table is settled.
4. **Write the answer where it will be found again:**
   - In the project's existing `CLAUDE.md` or `AGENTS.md`, as an "Agent models" section with the user's words quoted and the date. If the project has neither file, write `MODEL_ROUTING.md` at its root instead, and don't create a CLAUDE.md the user didn't ask for.
   - In your persistent memory if you have one, so other sessions follow it.
   - Record the escalation answer (question 3 in the bank) as a line under the table.
5. **Show the final table** in one short message and continue the work.

## Step 3: Apply it to every agent

**Classify each piece of work by what it does, not by the project's topic.** A research agent on a 3D project is still research. A one-line config fix inside a hard subsystem is still a simple fix. Verification that happens to run shell commands is still verification.

**When a task spans two rows, split it into stages, one per row**, for example an art agent then a code agent for a feature that needs a new model and new logic. If it can't be split, use the higher row when the task builds something the rest of the job depends on; otherwise use the cheaper row.

**A mixed job gets a tier per stage.** For example: build (top, high) → review (top, medium) → fix (the review's tier) → verify (mid, high) → monitor (mid, medium). Never run the whole pipeline on the builder's tier.

**Spend no model at all where none is needed.** Waiting on a long test, polling a log or watching a download needs no agent. Use a background shell or a monitor tool that wakes you when it ends. A monitoring agent is only for watching that needs judgement.

**Write a full brief for every fresh agent.** For a fix stage, include the review's findings in its prompt. A forked agent (`subagent_type: "fork"`) always runs on the parent's model and effort, so use a fresh agent with a brief when the work belongs on a cheaper tier.

**Set both values explicitly, every time:**

```text
Agent tool:   Agent({ subagent_type: "general-purpose", model: "sonnet", effort: "high", prompt: "<brief>" })

Workflow:     export const meta = { name: 'feature-x', description: '...',
                phases: [ { title: 'Build', model: 'opus', detail: 'opus, high' },
                          { title: 'Verify', model: 'sonnet', detail: 'sonnet, high' } ] }
              const built = await agent(brief, { phase: 'Build', model: 'opus', effort: 'high' })
              const check = await agent(verifyBrief, { phase: 'Verify', model: 'sonnet', effort: 'high' })
```

- **Model names:** the `model` values are family aliases (`opus`, `sonnet`, `haiku`, and any newer family the tool lists). Each picks that family's current version, so a table that says "Opus 5.5" maps to `opus`. If the tool lists a family the table doesn't mention, ask the user once what it should be used for before routing work to it.
- **Resuming a workflow:** changing `model` or `effort` on an agent changes its cache key. A resumed workflow then re-runs that agent and everything after it. Say so before you change the tiers of a run that is half-way through.

## Step 4: Escalate and de-escalate on evidence

Follow the user's escalation answer. If they gave none, the default is: step up on your own, one stage at a time, and say so in the report.

- **Step up one tier** (effort first, then model) when a cheaper agent fails the same task twice, returns empty or invented results, or its output fails the job's gate. Note the change in your report to the user, and in the project's handoff notes if it keeps them. If it keeps happening for one task type, propose updating that row.
- **Step down** when a top-tier stage is routine several runs in a row, for example verifications that never find anything subtle. Propose the change and let the user decide.
- **Raise only the stage that needed it**, never the whole job.

## Step 5: Keep it honest

- When you report a job, say which tiers ran in one line, so the user can see where the tokens went.
- If the user corrects a choice ("that should have been Sonnet"), update the table and the memory at once, quoting them.

## Files

- `assets/ROUTING_TABLE.md`: a starting table with neutral task types, the generic default, a line for the escalation answer, and an annotated example from a real project. Copy and adapt it; never apply it to a project unasked.
- `references/question-bank.md`: questions grouped by project nature (code, game or 3D, research, writing, data, ops), each with options and a reasoned default.
