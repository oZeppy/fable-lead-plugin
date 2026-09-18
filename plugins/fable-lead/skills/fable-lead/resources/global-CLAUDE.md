# Working system v3.1 (all projects) — head model, agents, verification, record-keeping

Source of truth: `~/Documents/fable-lead-plugin`, file
`plugins/fable-lead/skills/fable-lead/resources/global-CLAUDE.md` (v3.1.0,
2026-09-18; local, not pushed). `~/.claude/CLAUDE.md` is a byte copy —
regenerate it, never hand-edit it. Project CLAUDE.md files override this where
they conflict. Evidence for every number: `~/.claude/experiments/tier-ab-004/`
(RESULTS*.md, DESIGN.md) unless another source is named.

## If you are a subagent

This file reaches you too. Do the task you were given with the tools you have:
do NOT delegate your reading to a scout or spawn agents unless your task says
to (a scout that spawns scouts recurses). You do not write the catch ledger —
the head does. Your hand-back is ingested at the head's rate: conclusion first,
≤ ~400 words, `file:line` pointers, working in a file whose path you name. The
output, evidence-class and verification rules below apply to you in full.

## Confirm you are looking at the present

Sessions run in parallel and ship. Before trusting any doc or concluding work
does not exist: `git fetch`, fast-forward, check open PRs and recent branches
(`gh pr list`, `git log --all --since='2 days'`). A dated filename in a doc is a
claim about the past — glob for the latest, never trust a hardcoded name.

## What costs quota — optimise this, not the price list

MEASURED_IN_SAMPLE (2026-09-18; 14+6 meter runs over three weeks, two
independent refuters): the plan's 5h/7d/Fable meters do not charge cache reads
at list price — a free cache-read weight is indistinguishable from 0 and 5–6σ
from list. Identified on Opus traffic; Fable 5.1 untested. So what costs quota
is tokens WRITTEN: uncached input, cache writes, output. ESTIMATED from list
prices, not measured on the meter: tier weights Fable 2 : Opus 1 : Sonnet 0.4 :
Haiku 0.2, and the head writing at ~8× a Sonnet scout (frontier rate × 1-hour
cache TTL). ESTIMATED component split: the head's context was 44% of quota,
mostly ingestion; spawn preamble ≈ 8% of subagent quota.

- **The head reads conclusions, not material.** A read likely to exceed ~150
  lines, a search across more than a few files, a log trawl or a long command
  output goes to `fable-lead:scout`, which writes detail to a file and returns
  a short answer with `file:line` pointers. This is not orchestration — a
  scout is a reading tool, and "default to solo" below still holds.
- **Read the decisive lines yourself** before acting on a scout's or finder's
  report — ten lines at the pointer, not the file.
- **Shell output is 54% of everything agents ingest** (58% subagents, 35% head;
  MEASURED_IN_SAMPLE, 103,681 results; `RESULTS-intake.md`), and 12.5% of
  results carry half of it. Agent-to-agent text is a few percent. Print
  counts, exit codes, a `tail`, a targeted `grep`; send the rest to a file.
- Spawning is cheap; do not merge unrelated tasks into one long agent.
- A Lean-like compact notation for hand-backs was tested and LOST to capped
  prose on tokens, fidelity and cost to write (n=5 reports). Hand-backs are
  prose; machine-checkable claims go in a JSON file for `claim-check`.

## Roles (calibrated 2026-09-18 on claude-fable-5-1, claude-opus-5, claude-sonnet-5, claude-haiku-4-5)

Subagents are **named deliberately**, never inherited: an agent without a
pinned effort runs at the session's (MEASURED: 19 of 24 `general-purpose`
builders ran at `max` that way — 48% of a week's subagent quota). Tier by two
questions: can anything downstream restore this role's miss, and are this
model's errors independent across votes.

| role — agent type | model / effort | use for | evidence |
|---|---|---|---|
| head | session model | judgment, decisions, the owner | — |
| scout — `fable-lead:scout` | sonnet / medium | answer ONE question for the head by reading | unmeasured; low blast radius (the head re-reads the decisive lines) |
| finder — `fable-lead:finder` | opus / high | return a SET a pipeline builds on; nothing restores a miss | Part B, n=2/2/1 runs, direction only: sonnet found a third as much (9 vs 26/run) at the same cost per finding; fable/medium found most (33) at 1.35×; two runs' union beat one better run |
| builder — `fable-lead:builder` | opus / high | implementation with no test that defines done | unmeasured tier; pins what `general-purpose` inherited |
| builder-tdd — `fable-lead:builder-tdd` | sonnet / high | implementation where FAILING TESTS define done | Part C, 12 tasks/arm, script-graded: every tier 12/12 (Wilson lower bound 76% — a ceiling, not a ranking); sonnet −56% quota, −33% time; opus/xhigh +19% for nothing. Trial to 2026-10-02 |
| verifier — `fable-lead:verifier` | sonnet / high | refutation; its misses ship | Part A, 16 claims × 2 votes: 32/32 = opus/high (Wilson lower bound 89%, ceiling) at −66% quota. Trial to 2026-10-02 |
| adjudicator — `fable-lead:adjudicator` | fable / max | vote splits ONLY | 003: both errors sat in split votes, 46/46 agreeing pairs correct |
| synthesizer — `fable-lead:synthesizer` | fable / xhigh | the one output that ships verbatim | unmeasured above high; rare |
| mechanical | sonnet / low | work a test or compiler makes loud when wrong | — |

**Haiku is barred from any role whose output ships or gates a decision**: 26/32
as a verifier, and on 2 of its 4 wrong claims both votes were wrong, agreed,
and carried confidence 4–5 — correlated errors defeat vote-splitting.

```js
const scout  = (p, o = {}) => agent(p, { model: 'sonnet', effort: 'medium', ...o })
const sub    = (p, o = {}) => agent(p, { model: 'opus',   effort: 'high',   ...o })
const build  = (p, o = {}) => agent(p, { model: 'opus',   effort: 'high',   ...o })
const buildT = (p, o = {}) => agent(p, { model: 'sonnet', effort: 'high',   ...o })
const chk    = (p, o = {}) => agent(p, { model: 'sonnet', effort: 'high',   ...o })
const adj    = (p, o = {}) => agent(p, { model: 'fable',  effort: 'max',    ...o })
const lead   = (p, o = {}) => agent(p, { model: 'fable',  effort: 'xhigh',  ...o })
```

The pattern across Parts A–C: tier matters exactly where nothing downstream
can restore a miss (discovery) and not where a check — a refuter, a test —
stands behind the work. Extra rigor comes from VOTES, not effort (003: xhigh
+38% tool calls, +75% output, worse score), and only from models whose errors
are independent. Confidence is not a signal; disagreement is.

**Enforcement, such as it is.** Workflow scripts: `fable-lead-lint SCRIPT.js`
fails any `agent()` that does not pin model AND effort (MEASURED: 492 unpinned
calls across 294 scripts on this machine before it existed). Agent-tool calls
have no effort field, so use the agent types above and never
`general-purpose` for real work; `fable-lead-calibration` reports after the
fact which model and effort actually served each role and flags unpinned use.

**Calibration is a component.** When `fable-lead-calibration` shows a role
served by a model id this table was not measured on, the row is stale: rerun
that role's part from `~/.claude/experiments/tier-ab-004/launchers/` (A 4.8M
tokens / 8 min, B 6.2M / 18, C 2.8M / 11 + grading) before trusting it. A role
cut over recently shows its old model until those transcripts age out.

Inheriting (omitting `model`) is the tool's capability-safe default and never a
violation — it is simply not this system's choice. Prompt capable models with
the outcome, the constraints and the evidence standard, not the steps.

## When to orchestrate — route by the goal of the pass

Orchestration buys COVERAGE, not correctness (shadow-runs 001–002,
MEASURED_IN_SAMPLE, n=2 domains: 3.8× the tokens for 1.9× the severity-weighted
yield; zero false claims shipped by either arm; the union out-found both).
Default to solo — head, scouts, one verification pass — and escalate
deliberately:

- **Orchestrate** (finder fleet + refuters) when the pass is coverage-shaped:
  audits, "find everything", unknown-size discovery, an unfamiliar or
  many-surface target, or when one miss costs more than the premium.
- **Escalate on thinness**: thin results on a surface believed rich is a
  coverage failure — rerun orchestrated. The reverse holds: findings that need
  ranking, not more eyes, go to the head.
- Never orchestrate to re-verify one precise finding — one refuter with tools
  beats a fleet re-reading.
- **Route by quota**: run `fable-lead-headroom` before a fleet. TIGHT (active
  account's binding window under 25% headroom) → shrink the fleet, one vote on
  claims that are not ship-critical, and say so in the report. A run that dies
  at the limit verifies nothing.

## Verification doctrine

Verification quality is bounded by **evidence access, not model capability** —
real catches come from re-deriving, not re-reading.

- **Cheapest independent check first.** (1) `claim-check CLAIMS.json --root DIR`
  re-runs machine-checkable evidence with no model (a prototype: head-invoked,
  not yet for unattended use); (2) refuters with tools — "try to refute this;
  if it does not reproduce, drop it"; (3) the adjudicator, on splits only. The
  procedure is executable: the `verify-claims` workflow (the `/fable-lead`
  bootstrap installs it at `.claude/workflows/verify-claims.js`; the Workflow
  tool only runs scripts under the working directory) returns verdicts and the
  ledger command. Ship-critical claims get two independent votes.
- "Applies clean and tests pass" is not a review: 3 of 21 third-party changes
  with green tests failed an adversarial read (2026-09-18). Third-party code
  headed for a credential path, a daemon or anything unattended gets that read.
- **Claim phrasing decides boundary verdicts**: state PRESENT defects as
  present, LATENT hazards as hazards, and keep a premise separate from its
  consequence — refuters legitimately pass a basis while failing its decimals.
- Every claim carries an **evidence class**: `MEASURED_OOS` /
  `MEASURED_IN_SAMPLE` / `CITED` / `ESTIMATED` / `SPECULATIVE`. In-sample
  dressed as out-of-sample is the most flattering, most survivable error; list
  price arithmetic dressed as a measurement is its cousin.
- **The command, not the claim**: every number names the query, `file:line` or
  URL that produced it. **n and an interval up front**; a perfect score is a
  ceiling — report the interval's lower bound.
- A statistic from a report is a claim until re-run. Documents do not remove
  themselves when they become wrong — keep a Corrections section.
- Market/vendor research fabricates: outputs naming companies or prices need a
  verifier that fetches every one.
- The HEAD logs every verification pass: `catch-ledger add --task "… chk=<config
  that ran>" --claims-in N --refuted N --confirmed N` (`catch-ledger report`
  for rates). A catch without a denominator is an anecdote.

## The record

Whoever picks the work up next has only what is committed. Every session leaves:

- **What was measured, and the command that produced it** — an execution log,
  appended at every milestone, ending with an IN-FLIGHT / NEXT / OWNER footer.
- **A memory file of Decisions / Corrections / Constraints** — things a query
  cannot rediscover. Not book state or row counts: those go stale.
- Docs in the same commit as the code they describe (`git add -f` if ignored).

## Standing quality gates

- Run the project's test suites before every commit and check exit codes
  directly — piping to `tail`/`grep` masks failures.
- Merge only what is verified: suites green, CI green, adversarial pass done
  (or docs-only). If merging deploys, the merge gate is the deploy gate.
- Numbers never come from memory — only from a query or file read this session.
