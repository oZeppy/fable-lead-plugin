# Working system (all projects) — head model, agents, verification, record-keeping

Installed from `tax-deed-finder` `docs/ORCHESTRATION_PORTABLE.md` (2026-08-02).
Project CLAUDE.md files override this where they conflict.

## Confirm you are looking at the present

Sessions run in parallel and ship. Before trusting any doc or concluding work
does not exist: `git fetch`, fast-forward, check open PRs and recent branches
(`gh pr list`, `git log --all --since='2 days'`). A dated filename in a doc is a
claim about the past — glob for the latest, never trust a hardcoded name.

## Model and effort allocation

The head runs the owner's session model and effort. Subagents are **named
deliberately** rather than inherited, because with an expensive head,
inheritance bills every bulk stage at the head's rate:

- **Bulk stages** (finders, measurement, verifiers, mechanical work) run on the
  mid-tier model (`opus` today). Effort scales with blast radius: a finder's
  miss is caught downstream (`high`); a verifier's miss ships (`xhigh`);
  mechanical work is loud when wrong (`low`).
- **The head's model** (`fable` today) is spent on subagents only where the
  stage needs head-class reasoning — synthesis whose output ships verbatim, or
  a verification that turns on novel reasoning rather than more evidence — and
  the agent's label says why.
- **Specialized agent types** (docs guides, custom `.claude/agents/*`) keep the
  model in their definition. Do not override them.

Open every workflow script with a wrapper so the default is correct and only
the exception is annotated:

```js
const sub  = (p, o = {}) => agent(p, { model: 'opus',  effort: 'high',  ...o })
const chk  = (p, o = {}) => agent(p, { model: 'opus',  effort: 'xhigh', ...o })
const lead = (p, o = {}) => agent(p, { model: 'fable', effort: 'xhigh', ...o })
```

Before running: every `agent(` call goes through a wrapper or names BOTH a
model and an effort. That grep is the entire enforcement mechanism. Effort
inherits like model does: a session-level `/effort max` silently upgrades
every unpinned subagent call (Workflow `agent()` without `effort`, Agent-tool
calls, which have no effort field at all) to max — pin effort or use a
wrapper, always. Vote splits escalate to `lead` at effort **max**
(ESTIMATED — splits are ~1 per 50+ claims so the cost is nil; revisit at the
next calibration). Name the config that RAN in every catch-ledger `--task`
(e.g. "chk=opus/high") so per-config quality accumulates passively.

Inheriting (omitting `model`) is the tool's capability-safe default and never a
violation — it is simply not this system's choice. Prompting for capable
models: describe the outcome, the constraints, and the evidence standard — not
the steps. Step-enumeration tuned for smaller models measurably degrades the
capable ones.

## When to orchestrate — route by the goal of the pass (measured)

Orchestration buys COVERAGE, not correctness. Shadow-runs 001–002
(MEASURED_IN_SAMPLE, n=2 domains — a lean, not a law; update at 003): on
neutral ground the orchestrated arm cost 3.8× the tokens for 1.9× the
severity-weighted yield, both arms shipped zero false claims, solo was
better calibrated on its top findings, and the union out-found either arm
in both runs. Default to solo; escalate deliberately:

- **Orchestrate** (finder fleet + refuter stage) when the pass is
  coverage-shaped: audits, "find everything", unknown-size discovery, an
  unfamiliar or many-surface target, or when one miss costs more than the
  token premium.
- **Stay solo** (head + one verifier pass) when the pass is
  precision-shaped: the top defects, a known surface, a targeted fix or
  question, or cost-per-finding matters (solo ~2× more cost-efficient per
  confirmed defect).
- **Escalate on thinness**: a solo pass returning thin results on a surface
  believed rich is a coverage failure signal — rerun orchestrated. The
  reverse holds too: an orchestrated pass whose findings need ranking, not
  more eyes, hands to the head.
- Never orchestrate to re-verify a precise finding — one refuter with tools
  beats a fleet re-reading.

## Verification doctrine

Verification quality is bounded by **evidence access, not model capability** —
real catches come from re-deriving, not re-reading. So:

- Verifiers are **refuters**, with tools: "try to refute this; if it does not
  reproduce, drop it." Agents asked merely to check catch far less.
- Every claim carries an **evidence class**: `MEASURED_OOS` /
  `MEASURED_IN_SAMPLE` / `CITED` / `ESTIMATED` / `SPECULATIVE`. In-sample
  results dressed as out-of-sample is the single most flattering, most
  survivable error.
- **The command, not the claim**: every number names the query, `file:line`, or
  URL that produced it. That is what makes refutation possible.
- **n and a confidence interval, demanded up front.** n=15 is not a finding.
- A statistic from a report is a claim until re-run. Documents do not remove
  themselves when they become wrong — keep a Corrections section that names
  what the repo still asserts falsely.
- Market/vendor research fabricates: any output naming companies or prices
  needs a verifier that fetches every one.

## The record

Whoever picks the work up next — another account, another model, the owner
weeks later — has only what is committed. Every session leaves:

- **What was measured, and the command that produced it** (an execution log or
  equivalent, appended at every milestone, ending with an
  IN-FLIGHT / NEXT / OWNER footer).
- **A memory file of Decisions / Corrections / Constraints** — things a query
  cannot rediscover. Not book state, not row counts: those go stale and crowd
  out what matters.
- Docs in the same commit as the code they describe. If deliverable paths are
  gitignored, `git add -f` them.

## Standing quality gates

- Run the project's test suites before every commit and check exit codes
  directly — piping to `tail`/`grep` masks failures.
- Merge only what is verified: suites green, CI green, adversarial pass done
  (or docs-only). If merging deploys, treat the merge gate as the deploy gate.
- Numbers never come from memory — only from a query or file read in the
  current session.
