# Working system v3.2 (all projects) — head model, agents, verification, record-keeping

Source of truth: `~/Documents/fable-lead-plugin`, file
`plugins/fable-lead/skills/fable-lead/resources/global-CLAUDE.md` (v3.2.x,
2026-09-29; local). `~/.claude/CLAUDE.md` is a byte copy: regenerate it, never
hand-edit it. Project CLAUDE.md files override this where
they conflict. Evidence for every number: `~/.claude/experiments/tier-ab-004/`
(RESULTS*.md, DESIGN.md), `-005/` (Opus 5.5), `-006/` (Sonnet 5.5) unless another source is named.

## If you are a subagent

This file reaches you too. Do the task with the tools you have: do NOT
delegate to a scout or spawn agents unless your task says to. You do not write the catch ledger —
the head does. Your hand-back is ingested at the head's rate: conclusion first,
≤ ~400 words, `file:line` pointers, working in a file whose path you name. The
output, evidence-class and verification rules below apply to you in full.

## Confirm you are looking at the present

Before trusting any doc or concluding work
does not exist: `git fetch`, fast-forward, check open PRs and recent branches
(`gh pr list`, `git log --all --since='2 days'`). A dated filename in a doc is a
claim about the past — glob for the latest, never trust a hardcoded name.

## Reaching the owner

Remote Control is gone. To alert Ethan or get his input use ownerlink — never
wait at a prompt he cannot see:
- FYI → `notify_owner` (shell: `ownerlink send`).
- Decision → `ask_owner` (shell: `ownerlink ask`), complete enough to decide
  from a phone. ntfy pings him; he answers in Telegram. No answer = not
  approved: carry on with what does not depend on it.
- Subagents report to the head; the head asks.

## What costs quota — optimise this, not the price list

MEASURED_IN_SAMPLE (14+6 meter runs, 2026-08-29→09-18, two independent
refuters): the plan's 5h/7d/Fable meters do not charge cache reads
at list price (a free weight fits; list is 5–6σ off). Identified on Opus traffic; Fable 5.1 untested. So what costs quota
is tokens WRITTEN: uncached input, cache writes, output. ESTIMATED from list
prices, not measured on the meter: tier weights Fable 2 : Opus 1 : Sonnet 0.4 :
Haiku 0.2, and the head writing at ~8× a Sonnet scout (frontier rate × 1-hour
cache TTL). ESTIMATED component split: the head's context was 44% of quota,
mostly ingestion; spawn preamble ≈ 8% of subagent quota.

- **The head reads conclusions, not material.** A read likely to exceed ~150
  lines, a search across more than a few files, a log trawl or a long command
  output goes to `fable-lead:scout`, which writes detail to a file and returns
  a short answer with `file:line` pointers. Not orchestration: a scout is a
  reading tool, and "default to solo" below still holds.
- **Read the decisive lines yourself** before acting on a scout's or finder's
  report — ten lines at the pointer, not the file.
- **Shell output is half of everything agents ingest** (51%: 55% subagents,
  33% head; MEASURED_IN_SAMPLE, 89,341 distinct results; `RESULTS-intake.md`),
  and 12.5% of results carry half of it. Print
  counts, exit codes, a `tail`, a targeted `grep`; send the rest to a file.
- Spawning is cheap; do not merge unrelated tasks into one long agent.
- Hand-backs are prose (a compact notation lost on tokens and fidelity, n=5);
  machine-checkable claims go in a JSON file for `claim-check`.

<!-- BEGIN pins:roles -->
## Roles (calibrated 2026-09-18 on claude-fable-5-1, claude-opus-5, claude-sonnet-5, claude-haiku-4-5; 2026-09-23 on claude-opus-5-5; 2026-09-28 on claude-sonnet-5-5)

| role — agent type | exact model id / effort | use for | evidence |
|---|---|---|---|
| head | session model | judgment, decisions, the owner | — |
| scout — `fable-lead:scout` | claude-sonnet-5 / medium | answer ONE question for the head by reading | unmeasured; held until a scout bench exists (007); the head re-reads the decisive lines |
| finder — `fable-lead:finder` | claude-opus-5 / high | return a SET a pipeline builds on; nothing restores a miss | 006 B (n=2): UNDECIDED against Sonnet 5.5/medium (same 5/10, 26% of the cost); 005 B: Opus 5.5 found 2.5–3.0/10 vs 6/10; 004 B: sonnet found a third as much, and two runs’ union beat one better run |
| builder — `fable-lead:builder` | claude-sonnet-5-5 / high | implementation with no test that defines done | 006 C, 12 test-driven fixes, a proxy for this role: all four arms 12/12 (Wilson lower bound 76%, a ceiling); effort undetermined; $0.11/task vs $0.24 for Opus 5.5/medium, paired difference [0.098, 0.169]. Trial to 2026-10-12 |
| builder-tdd — `fable-lead:builder-tdd` | claude-sonnet-5-5 / high | implementation where FAILING TESTS define done | 006 C, 12 tasks/arm: all four arms 12/12 (Wilson lower bound 76%, a ceiling); effort undetermined; $0.11/task vs $0.25 for Sonnet 5/high, paired difference [0.100, 0.177]. Trial to 2026-10-12 |
| verifier — `fable-lead:verifier` | claude-sonnet-5-5 / high | refutation; its misses ship | 006 A, 7 diffs × 2 votes: 15/32 known-defect finds vs 3/32 for Sonnet 5/high, difference +0.375 [+0.131, +0.581]; claim-verdict accuracy unmeasured; union 9/12 vs 1/12 on the pre-registered set; 14/16 novel claims real; $0.43 vs $0.74/vote. Trial to 2026-10-12 |
| adjudicator — `fable-lead:adjudicator` | fable / max | vote splits ONLY | 003: both errors sat in split votes, 46/46 agreeing pairs correct |
| synthesizer — `fable-lead:synthesizer` | fable / xhigh | the one output that ships verbatim | unmeasured above high; rare |
| mechanical | claude-sonnet-5 / low | work a test or compiler makes loud when wrong | — |

```js
const scout = (p, o = {}) => agent(p, { model: 'claude-sonnet-5', effort: 'medium', ...o })
const sub = (p, o = {}) => agent(p, { model: 'claude-opus-5', effort: 'high', ...o })
const build = (p, o = {}) => agent(p, { model: 'claude-sonnet-5-5', effort: 'high', ...o })
const buildT = (p, o = {}) => agent(p, { model: 'claude-sonnet-5-5', effort: 'high', ...o })
const chk = (p, o = {}) => agent(p, { model: 'claude-sonnet-5-5', effort: 'high', ...o })
const adj = (p, o = {}) => agent(p, { model: 'fable', effort: 'max', ...o })
const lead = (p, o = {}) => agent(p, { model: 'fable', effort: 'xhigh', ...o })
```
<!-- END pins:roles -->

Subagents are **named deliberately, by EXACT model id** — never inherited (an
unpinned effort runs at the session's: MEASURED 2026-09-18, 24 `general-purpose`
builders were 48% of subagent quota, 19 at `max`) and never by alias (MEASURED
2026-09-23: the bare `opus` alias served `claude-opus-5-5`,
halving the finder's recall before it was measured). Tier by two questions:
can anything downstream restore this role's miss, and are this model's errors
independent across votes.

**Haiku is barred from any role whose output ships or gates a decision**: 26/32
as a verifier, with both votes wrong and agreeing on 2 of its 4 wrong claims —
correlated errors defeat vote-splitting.

Across Parts A–C: tier matters exactly where nothing downstream can restore a
miss (discovery), not where a refuter or a test stands behind the work. Rigor
comes from VOTES, not effort (003: xhigh +38% tool calls, +75% output, worse
score), and only from models whose errors are independent. Confidence is not a
signal; disagreement is.

**Enforcement.** `fable-lead-lint SCRIPT.js` fails any workflow `agent()` that
does not pin model AND effort. Agent-tool calls have no effort field: use the agent types above,
never `general-purpose` for real work; `fable-lead-calibration` reports which
model and effort actually served each role.

**Calibration is a component.** On a STALE or DRIFT flag, `fable-lead-pins
propose --explain` on a fresh `fable-lead-bench` run applies the pre-registered
rule: MOVE, KEEP or INCONCLUSIVE, which never moves a pin.

Inheriting (omitting `model`) is the tool's safe default, not this system's
choice. Prompt capable models with the outcome, the constraints and the
evidence standard, not the steps.

## When to orchestrate — route by the goal of the pass

Orchestration buys COVERAGE, not correctness (shadow-runs 001–002,
MEASURED_IN_SAMPLE, n=2 domains: 3.8× the tokens for 1.9× the severity-weighted
yield; the union out-found both).
Default to solo — head, scouts, one verification pass — and escalate
deliberately:

- **Orchestrate** (finder fleet + refuters) when the pass is coverage-shaped:
  audits, "find everything", unknown-size discovery, or when one miss costs
  more than the premium.
- **Escalate on thinness**: thin results on a surface believed rich is a
  coverage failure — rerun orchestrated. The reverse holds: findings that need
  ranking, not more eyes, go to the head.
- **Ship-critical coverage: run the finder stage twice and take the union.**
  Run-to-run variance is large (Part B: 5 and 2 of 10 known defects alone, 6
  together) — a second run of the same tier beats a better single run.
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
  re-runs machine-checkable evidence with no model (head-invoked); (2) refuters with tools — "try to refute this;
  if it does not reproduce, drop it"; (3) the adjudicator, on splits only. The
  procedure is executable: the Workflow tool with scriptPath
  `~/Documents/fable-lead-plugin/plugins/fable-lead/skills/fable-lead/resources/verify-claims.js`
  (`/fable-lead` installs a project copy if a session refuses the path).
  Ship-critical claims get two independent votes.
- "Applies clean and tests pass" is not a review: 3 of 21 third-party changes
  with green tests failed an adversarial read (cswap-fork pick review 2026-09-18,
  `~/cswap-fork/FORK.md`). Third-party code
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
